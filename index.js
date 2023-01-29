const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const express = require("express");
const app = express();
const port = 3000;
const { MongoClient, Timestamp } = require("mongodb");
require("dotenv").config();

const url = process.env.mongodb;
const client = new MongoClient(url);
const dbName = "Kartof-PLay";

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

const checkexist = require("./utils/accounts/checkexist");
const login = require("./utils/accounts/login");
const signup = require("./utils/accounts/signup");

app.use(express.static("./views/src"));
app.get("/error", async (req, res) => {
  res.render("pages/error.ejs");
});

app.get("/", async (req, res) => {
  let started = new Timestamp(new Date());
  

  let [data, popular, recent] = await Promise.all([
    anime_schedule.run(),
    anime_gogo_popular.run(1),
    anime_gogo_recent.run(1),
  ]);
  console.log((Timestamp(new Date()) - started) / 1000);
  res.render("pages/index.ejs", {
    data: data,
    popular: popular,
    recent: recent,
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
  let started = new Timestamp(new Date());

  let search = await anime_gogo_search.run(req.params.id.replaceAll("-", " "));

  let id = req.params.id;

  if (search[0]) {
    id = search[0].animeId;
  }
  let watch_id = id;

  let details = await anime_gogo_details.run(id);
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
        details = await anime_gogo_details.run(id);
        
        stream = await anime_stream.run(id, req.params.episode);
      }
      
    }
    
  }

  console.log((Timestamp(new Date()) - started) / 1000);

  res.render("pages/watch.ejs", {
    stream: stream,
    rush_stream: rush_stream,
    details: details,
    mal_search: mal,
    rating: rating,
    episode: req.params.episode,
    new_ep: data_schedule,
  });
  
});

/**
 * Watch
 * Search in Gogo to get corrent id
 * and get mal data
 */

app.listen(port, async () => {
  console.log(`App listening on port ${port}`);
});
