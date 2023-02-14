const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const { MongoClient, Timestamp } = require("mongodb");
require("dotenv").config();

const url = process.env.mongodb;
const client = new MongoClient(url);

global.rush_base_url = "https://www.animerush.tv/";
global.gogo_base_url = "https://gogoanime.tel/";
//Anime Schedule
const anime_schedule = require("./utils/anime_schedule/anime-schedule");
const anime_data_schedule = require("./utils/anime_schedule/anime-data");
//MAL
const anime_mal_search = require("./utils/mal/anime-search");

//GOGO
const anime_gogo_search = require("./utils/gogo/anime-gogo-search");
const anime_stream = require("./utils/gogo/anime-stream");
const anime_gogo_details = require("./utils/gogo/anime-details");
const anime_gogo_popular = require("./utils/gogo/anime-popular");
const anime_gogo_recent = require("./utils/gogo/anime-recent");
const getidfromname = require("./utils/getidfromname");

//RUSH ANIME
const replaceromantoarab = require("./utils/replaceromantoarab");
const anime_stream_rush = require("./utils/animerush/anime-stream");
const anime_id_rush = require("./utils/animerush/getidfromname");
const anime_search_rush = require("./utils/animerush/anime-search");
const anime_details_rush = require("./utils/animerush/anime-details");

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

  let data = await cache_main.run(client);
  //console.log((Timestamp(new Date()) - started) / 1000);
  res.render("pages/index.ejs", {
    data: data.data,
    popular: data.popular,
    recent: data.recent,
  });
});
app.get("/search/:keyword/:source", async (req, res) => {
  let data;
  if (req.params.source == "GoGoAnime") {
    data = await anime_gogo_search.run(req.params.keyword);
  } else if (req.params.source == "MAL") {
    data = await anime_mal_search.run(req.params.keyword);
  } else if (req.params.source == "AnimeRush") {
    data = await anime_search_rush.run(req.params.keyword);
  } else {
    let [gogosearch, rushsearch, data1] = await Promise.all([
      anime_gogo_search.run(req.params.keyword),
      anime_search_rush.run(req.params.keyword),
      anime_mal_search.run(req.params.keyword),
    ]);
    data = data1;
    data = data.concat(gogosearch);
    data = data.concat(rushsearch);
  }

  res.render("pages/search.ejs", {
    data: data,
    keyword: req.params.keyword,
    source: req.params.source,
  });
});

app.get("/watch/:id/:episode", async (req, res) => {
  let id = req.params.id;

  let [search, search_rush] = await Promise.all([
    anime_gogo_search.run(id.replaceAll("-", " ")),
    anime_search_rush.run(id.replaceAll("-", " ")),
  ]);
  let rush_search_id = id;

  if (search[0]) {
    id = search[0].animeId;
  }
  if (search_rush[0]) {
    if (search_rush[0].animeId.toLowerCase() == id) {
      rush_search_id = search_rush[0].animeId;
    } else {
      const mySentence = req.params.id;
      const words = mySentence.split("-");

      for (let i = 0; i < words.length; i++) {
        if (words[i] != "") {
          words[i] = words[i][0].toUpperCase() + words[i].substr(1);
        }
      }

      rush_search_id = words.join("-");
    }
  }
  let saveid = id;
  let [details, details_rush] = await Promise.all([
    anime_gogo_details.run(id),
    anime_details_rush.run(rush_search_id),
  ]);
  let episodes_max = req.params.episode;
  if (details.totalEpisodes) {
    episodes_max = details.totalEpisodes;
  }
  if (details_rush.totalEpisodes && details_rush.totalEpisodes > episodes_max) {
    episodes_max = details_rush.totalEpisodes;
    details = details_rush;
  }
  if (details.animeTitle == null) {
    details = details_rush;
  }
 
  let checkid_data = await checkid.run(client, id, episodes_max);
  //Date.now() - checkid_data.time < 86400000

  if (
    checkid_data != null &&
    checkid_data.data.stream[checkid_data.data.stream.length - 1].url !=
      "/error" &&
    checkid_data.data.rush_stream[checkid_data.data.rush_stream.length - 1]
      .url != "/error"
  ) {
    let episode_index = req.params.episode - 1;
    let stream;
    let rush_stream;
    if (episode_index >= checkid_data.data.stream.length) {
      stream = { url: "/error" };
    } else {
      stream = checkid_data.data.stream[episode_index];
    }
    if (episode_index >= checkid_data.data.rush_stream.length) {
      rush_stream = { url: "/error" };
    } else {
      rush_stream = checkid_data.data.rush_stream[episode_index];
    }

    res.render("pages/watch.ejs", {
      stream: stream,
      rush_stream: rush_stream,
      details: checkid_data.data.details,
      mal_search: checkid_data.data.mal_search,
      rating: checkid_data.data.rating,
      episode: req.params.episode,
      new_ep: checkid_data.data.new_ep,
    });
  } else {
    let watch_id = id;
    if (details.watch_id != undefined) {
      watch_id = details.watch_id;
    }

    let stream = await anime_stream.run(watch_id, req.params.episode);

    let name = "";
    if (details.name) {
      name = details.animeTitle;
    } else if (search[0]) {
      name = search[0].animeTitle;
    } else {
      name = id.replaceAll("-", " ");
    }

    if (stream.url == "/error" || stream.url == undefined) {
      stream = await anime_stream.run(id, req.params.episode);
    }

    let rush_stream = { url: "/error" };
    let animerunid = await anime_search_rush.run(name);

    if (animerunid.length >= 1) {
      rush_stream = await anime_stream_rush.run(
        animerunid[0].animeId,
        req.params.episode
      );

      if (
        rush_stream.url == "/error" ||
        animerunid[0].animeTitle.toLowerCase() != name.toLowerCase()
      ) {
        for (let i = 0; i < animerunid.length; i++) {
          if (animerunid[i].animeTitle.toLowerCase() == name.toLowerCase()) {
            rush_stream = await anime_stream_rush.run(
              animerunid[i].animeId,
              req.params.episode
            );
            id = animerunid[i].animeId;

            break;
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

      if (details.animeTitle == null && stream.url == "/error") {
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
      rush_stream: rush_stream,
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
