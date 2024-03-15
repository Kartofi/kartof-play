const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const { MongoClient, Timestamp } = require("mongodb");
require("dotenv").config();

const url = process.env.mongodb;
const client = new MongoClient(url);

global.animegg_base_url = "https://www.animegg.org/";
global.gogo_base_url = "https://gogoanime3.co/";

const { HttpsProxyAgent } = require("https-proxy-agent");
const proxy = new HttpsProxyAgent(process.env.PROXY);

global.fetchArgs = {
  proxy,
  timeout: 5000,
};

//Anime Schedule
const anime_data_schedule = require("./utils/anime_schedule/anime-data");
const anime_schedule = require("./utils/anime_schedule/anime-schedule");
//MAL
const anime_mal_search = require("./utils/mal/anime-search");

//GOGO
const anime_gogo_search = require("./utils/gogo/anime-gogo-search");
const anime_stream = require("./utils/gogo/anime-stream");
const anime_gogo_details = require("./utils/gogo/anime-details");
const getidfromname = require("./utils/getidfromname");

//AnimeGG ANIME
const replaceromantoarab = require("./utils/replaceromantoarab");
const anime_stream_animegg = require("./utils/animegg/anime-stream");
const anime_search_animegg = require("./utils/animegg/anime-search");
const anime_details_animegg = require("./utils/animegg/anime-details");

//Caching
const checkid = require("./utils/caching/checkid");
const savedata = require("./utils/caching/savedata");
const checheverything = require("./utils/caching/cache_everyepisode");
const cache_main = require("./utils/caching/cache_mainpage");

app.use(express.static("./views/src"));
app.get("/error", async (req, res) => {
  res.render("pages/error.ejs");
});

app.get("/", async (req, res) => {
  //let started = new Timestamp(new Date());
  let da = await anime_schedule.run();

  let data = await cache_main.run(client);
  //console.log((Timestamp(new Date()) - started) / 1000);
  res.render("pages/index.ejs", {
    data: data.data,
    popular: data.popular,
    recent: data.recent,
  });
});
app.get("/search/:keyword/:source", async (req, res) => {
  let data = { mal: [], gogo: [], animegg: [] };
  if (req.params.source == "GoGoAnime") {
    data.gogo = await anime_gogo_search.run(req.params.keyword);
  } else if (req.params.source == "MAL") {
    data.mal = await anime_mal_search.run(req.params.keyword);
  } else if (req.params.source == "Animegg") {
    data.animegg = await anime_search_animegg.run(req.params.keyword);
  } else {
    let [gogosearch, animeggsearch, mal] = await Promise.all([
      anime_gogo_search.run(req.params.keyword),
      anime_search_animegg.run(req.params.keyword),
      anime_mal_search.run(req.params.keyword),
    ]);
    data.mal = mal;
    data.gogo = gogosearch;
    data.animegg = animeggsearch;
  }
  res.render("pages/search.ejs", {
    data: data,
    keyword: req.params.keyword,
    source: req.params.source,
  });
});

app.get("/watch/:id/:episode", async (req, res) => {
  let id = req.params.id;
  let gogoanimeavailable = false;
  let [search, search_animegg] = await Promise.all([
    anime_gogo_search.run(id.replaceAll("-", " ")),
    anime_search_animegg.run(id.replaceAll("-", " ")),
  ]);
  let animegg_search_id = id;
  if (search.length >= 1) {
    let done = false;
    for (let index = 0; index < search.length; index++) {
      if (search[index].animeId == req.params.id) {
        id = search[index].animeId;
        done = true;
        break;
      }
    }
    if (done == false) {
      id = search[0].animeId;
    }
  }
  if (search_animegg[0]) {
    if (search_animegg[0].animeId.toLowerCase() == id) {
      animegg_search_id = search_animegg[0].animeId;
    } else {
      const mySentence = req.params.id;
      const words = mySentence.split("-");

      for (let i = 0; i < words.length; i++) {
        if (words[i] != "") {
          words[i] = words[i][0].toUpperCase() + words[i].substr(1);
        }
      }

      animegg_search_id = words.join("-");
    }
  }
  let saveid = id;
  let [details, details_animegg] = await Promise.all([
    anime_gogo_details.run(id),
    anime_details_animegg.run(animegg_search_id),
  ]);
  let episodes_max = req.params.episode;
  if (details.totalEpisodes) {
    episodes_max = details.totalEpisodes;
  }
  if (
    details_animegg != null &&
    details_animegg.totalEpisodes &&
    details_animegg.totalEpisodes > episodes_max
  ) {
    episodes_max = details_animegg.totalEpisodes;
    details = details_animegg;
  }
  if (details.animeTitle == null || details.animeTitle == "") {
    details = details_animegg;
  } else {
    gogoanimeavailable = true;
  }
  let checkid_data = await checkid.run(client, id, episodes_max);
  //Date.now() - checkid_data.time < 86400000

  if (
    checkid_data != null &&
    checkid_data.data.animegg_stream != undefined &&
    checkid_data.data.stream[checkid_data.data.stream.length - 1] != null &&
    checkid_data.data.stream[checkid_data.data.stream.length - 1].url !=
      "/error" &&
    checkid_data.data.animegg_stream[
      checkid_data.data.animegg_stream.length - 1
    ] != null &&
    checkid_data.data.animegg_stream[
      checkid_data.data.animegg_stream.length - 1
    ].url != "/error"
  ) {
    let episode_index = req.params.episode - 1;
    let stream;
    let animegg_stream;
    if (episode_index >= checkid_data.data.stream.length) {
      stream = { url: "/error" };
    } else {
      stream = checkid_data.data.stream[episode_index];
    }
    if (episode_index >= checkid_data.data.animegg_stream.length) {
      animegg_stream = { url: "/error" };
    } else {
      animegg_stream = checkid_data.data.animegg_stream[episode_index];
    }

    res.render("pages/watch.ejs", {
      stream: stream,
      animegg_stream: animegg_stream,
      details: checkid_data.data.details,
      mal_search: checkid_data.data.mal_search,
      rating: checkid_data.data.rating,
      episode: req.params.episode,
      new_ep: checkid_data.data.new_ep,
    });
  } else {
    let watch_id = id;
    if (details != undefined && details.watch_id != undefined) {
      watch_id = details.watch_id;
    }

    let stream = await anime_stream.run(watch_id, req.params.episode);

    let name = "";
    if (details != undefined && details.name) {
      name = details.animeTitle;
    } else if (search[0]) {
      name = search[0].animeTitle;
    } else {
      name = id.replaceAll("-", " ");
    }

    if (stream.url == "/error" || stream.url == undefined) {
      stream = await anime_stream.run(id, req.params.episode);
    }

    let animegg_stream = { url: "/error" };
    let animerunid = await anime_search_animegg.run(name);
    animegg_stream = await anime_stream_animegg.run(
      animegg_search_id,
      req.params.episode
    );
    if (animegg_stream == null || animegg_stream == []) {
      if (animerunid.length >= 1) {
        animegg_stream = await anime_stream_animegg.run(
          animerunid[0].animeId,
          req.params.episode
        );

        if (
          animegg_stream.url == "/error" ||
          animerunid[0].animeTitle.toLowerCase() != name.toLowerCase()
        ) {
          for (let i = 0; i < animerunid.length; i++) {
            if (animerunid[i].animeTitle.toLowerCase() == name.toLowerCase()) {
              animegg_stream = await anime_stream_animegg.run(
                animerunid[i].animeId,
                req.params.episode
              );
              id = animerunid[i].animeId;

              break;
            }
          }
        }
      }
    }

    if (name.includes(",")) {
      name = name.split(",")[1];
    }
    if (name.length >= 100) {
      name = name.substring(0, name.length - (name.length - 100));
    }

    let [mal, data_schedule] = await Promise.all([
      anime_mal_search.run(name),
      anime_data_schedule.run(
        replaceromantoarab.run(getidfromname.run(name.trim()))
      ),
    ]);

    let rating = 0;

    if (mal[0] != undefined) {
      rating = mal[0].rating;
      if (details == undefined && stream.url == "/error") {
        search = await anime_gogo_search.run(mal[0].animeTitle);
        if (search[0]) {
          id = search[0].animeId;
          [details, stream] = await Promise.all([
            anime_gogo_details.run(id),
            anime_stream.run(id, req.params.episode),
          ]);
        }
      }
    }

    res.render("pages/watch.ejs", {
      stream: stream,
      animegg_stream: animegg_stream,
      details: details,
      mal_search: mal,
      rating: rating,
      episode: req.params.episode,
      new_ep: data_schedule,
    });
    await checheverything.run(
      client,
      saveid,
      episodes_max,
      details,
      search,
      mal
    );
  }
});

/**
 * Watch
 * Search in Gogo to get corrent id
 * and get mal data
 */

app.listen(port, async () => {
  await client.connect();
  console.log(`App listening on port ${port}`);
});
