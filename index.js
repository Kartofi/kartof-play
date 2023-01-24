const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const port = 3000;
const { MongoClient } = require("mongodb");
require('dotenv').config()

const url = process.env.mongodb
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
const getidfromname = require("./utils/getidfromname");

//All ANIME
const anime_stream_rush = require("./utils/animerush/anime-stream");
const anime_id_rush = require("./utils/animerush/getidfromname");
const anime_search_rush = require("./utils/animerush/anime-search");

const checkexist = require("./utils/accounts/checkexist");
const login = require("./utils/accounts/login");
const signup = require("./utils/accounts/signup");

app.use(express.static("./views/src"));
app.use(cookieParser());

app.get("/", async (req, res) => {
  let data = await anime_schedule.run();
  let popular = await anime_gogo_popular.run();

  res.render("pages/index.ejs", {
    data: data,
    popular: popular,
  });
});
app.get("/search/:keyword/:source", async (req, res) => {
  let data;
  if (req.params.source == "GoGoAnime") {
    data = await anime_gogo_search.run(req.params.keyword);
  } else {
    data = await anime_mal_search.run(req.params.keyword);
  }
  res.render("pages/search.ejs", {
    data: data,
    keyword: req.params.keyword,
    source: req.params.source,
  });
});

app.get("/watch/:id/:episode", async (req, res) => {
  let search = await anime_gogo_search.run(req.params.id.replaceAll("-", " "));
  let id = req.params.id;
  if (search[0]) {
    id = search[0].animeId;
  }
  let details = await anime_gogo_details.run(id);
  let test_id = await getidfromname.run(details.animeTitle);
  let stream = await anime_stream.run(test_id, req.params.episode);
  let name = "";
  if (details.name) {
    name = details.animeTitle;
  } else {
    name = search[0].animeTitle;
  }

  if (stream.url == "/error" || stream.url == undefined) {
    stream = await anime_stream.run(id, req.params.episode);
  }
  if (stream.url == "/error" || stream.url == undefined) {
    let animerunid = await anime_search_rush.run(name);
    if (animerunid.length >= 1) {
      stream = await anime_stream_rush.run(
        animerunid[0].animeId,
        req.params.episode
      );
    }
  }
  if (name.length >= 100) {
    name.substring(name.length - 1, name.length - (name.length - 100));
  }
  let mal = await anime_mal_search.run(name);
  let rating = 0;
  let data_schedule = await anime_data_schedule.run(id);

  if (mal[0] != undefined) {
    rating = mal[0].rating;
  }

  res.render("pages/watch.ejs", {
    stream: stream,
    details: details,
    mal_search: mal,
    rating: rating,
    episode: req.params.episode,
    new_ep: data_schedule,
  });
});

app.get("/account", async (req, res) => {
  await client.connect();
  console.log(req.cookies.username);

  const db = client.db(dbName);
  const collection = db.collection("Accounts");
  await collection.insertOne({ username: 12, password: 22 });
  res.render("pages/account.ejs", {});
  await client.close();
});
//res.cookie('username',"1", { maxAge: 900000, httpOnly: true });
//res.cookie('password',"1", { maxAge: 900000, httpOnly: true });
app.get("/signup", async (req, res) => {
  await client.connect();
  const db = client.db(dbName);
  const collection = db.collection("Accounts");
  let username = req.query.username;
  let password = req.query.password;
  let exist = await checkexist.run(collection, {
    username: username,
  });
  if (exist == false) {
    await signup.run(collection, { username: username, password: password });
  } else {
  }

  res.render("pages/account.ejs", {});
  await client.close();
});
app.get("/signin", async (req, res) => {
  await client.connect();
  console.log(req.cookies);
  const db = client.db(dbName);
  const collection = db.collection("Accounts");
  await collection.insertOne({ username: 12, password: 22 });
  res.render("pages/account.ejs", {});
  await client.close();
});
/**
 * Watch
 * Search in Gogo to get corrent id
 * and get mal data
 */

app.listen(port, async () => {
  console.log(`App listening on port ${port}`);
});
