//Anime Schedule
const anime_schedule = require("../anime_schedule/anime-schedule");
const anime_data_schedule = require("../anime_schedule/anime-data");
//MAL
const anime_mal_search = require("../mal/anime-search");

//GOGO
const anime_gogo_search = require("../gogo/anime-gogo-search");
const anime_stream = require("../gogo/anime-stream");
const anime_gogo_details = require("../gogo/anime-details");
const anime_gogo_popular = require("../gogo/anime-popular");
const anime_gogo_recent = require("../gogo/anime-recent");
const getidfromname = require("../getidfromname");

//RUSH ANIME
const replaceromantoarab = require("../replaceromantoarab");
const anime_stream_rush = require("../animerush/anime-stream");
const anime_id_rush = require("../animerush/getidfromname");
const anime_search_rush = require("../animerush/anime-search");

const savedata = require("./savedata");

module.exports = {
  data: "Cache",
  run: async function (client, id1, episodes_max, details, search, mal) {
    const db = client.db("Kartof-PLay");
    let collection = db.collection("Watch_Cach");

    let data = await collection.findOne({ id: id1 });

    if (data != null) {
      let id = id1;
      let episodes = data.episodes;

      if (
        episodes_max - episodes > 0 ||
        (data.data.stream[data.data.stream.length - 1] != null &&
          data.data.stream[data.data.stream.length - 1].url == "/error") ||
        (data.data.rush_stream[data.data.rush_stream.length - 1] != null &&
          data.data.rush_stream[data.data.rush_stream.length - 1].url ==
            "/error")
      ) {
        let watch_id = id;
        if (details.watch_id != undefined) {
          watch_id = details.watch_id;
        }
        let name = "";
        if (details.name) {
          name = details.animeTitle;
        } else if (search[0]) {
          name = search[0].animeTitle;
        } else {
          name = id.replaceAll("-", " ");
        }

        let animerunid = await anime_search_rush.run(name);

        for (let i = 0; i < episodes_max - episodes; i++) {
          let stream = await anime_stream.run(watch_id, i);

          if (stream.url == "/error" || stream.url == undefined) {
            stream = await anime_stream.run(id, i);
          }

          let rush_stream = { url: "/error" };

          if (animerunid.length >= 1) {
            rush_stream = await anime_stream_rush.run(animerunid[0].animeId, i);

            if (
              rush_stream.url == "/error" ||
              animerunid[0].animeTitle.toLowerCase() != name.toLowerCase()
            ) {
              for (let anime = 0; anime < animerunid.length; anime++) {
                if (
                  animerunid[anime].animeTitle.toLowerCase() ==
                  name.toLowerCase()
                ) {
                  rush_stream = await anime_stream_rush.run(
                    animerunid[anime].animeId,
                    i
                  );

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

          if (mal[0] != undefined) {
            if (details.animeTitle == null && stream.url == "/error") {
              if (search[0]) {
                details = await anime_gogo_details.run(search[0].animeId);

                stream = await anime_stream.run(search[0].animeId, i);
              }
            }
          }
          data.data.stream.push(stream);
          data.data.rush_stream.push(rush_stream);
        }

        if (data.data.stream[data.data.stream.length - 1].url == "/error") {
          let stream = await anime_stream.run(
            watch_id,
            data.data.stream.length - 1
          );

          if (stream.url == "/error" || stream.url == undefined) {
            stream = await anime_stream.run(id, data.data.stream.length - 1);
          }
          data.data.stream[data.data.stream.length - 1] = stream;
        }

        if (
          data.data.rush_stream[data.data.rush_stream.length - 1].url ==
          "/error"
        ) {
          let rush_stream = { url: "/error" };

          if (animerunid.length >= 1) {
            rush_stream = await anime_stream_rush.run(
              animerunid,
              data.data.stream.length
            );

            if (
              rush_stream.url == "/error" ||
              animerunid[0].animeTitle.toLowerCase() != name.toLowerCase()
            ) {
              for (let anime = 0; anime < animerunid.length; anime++) {
                if (
                  animerunid[anime].animeTitle.toLowerCase() ==
                  name.toLowerCase()
                ) {
                  rush_stream = await anime_stream_rush.run(
                    animerunid[anime].animeId,
                    data.data.stream.length
                  );

                  break;
                }
              }
            }
          }
          data.data.rush_stream[data.data.rush_stream.length - 1] = rush_stream;
        }
        data.data.details = details;
        data.episodes = episodes_max;
        data.time = Date.now();
      }

      await savedata.run(client, data);
    } else {
      let search = await anime_gogo_search.run(id1.replaceAll("-", " "));
      let id = id1;
      if (search[0]) {
        id = search[0].animeId;
      }
      let watch_id = id;

      let details = await anime_gogo_details.run(id);
      if (details.watch_id != undefined) {
        watch_id = details.watch_id;
      }
      let name = "";
      if (details.name) {
        name = details.animeTitle;
      } else if (search[0]) {
        name = search[0].animeTitle;
      } else {
        name = id.replaceAll("-", " ");
      }

      let episodes_gogo = [];
      for (let i = 1; i < details.totalEpisodes + 1; i++) {
        let stream = await anime_stream.run(watch_id, i);
        if (stream.url == "/error" || stream.url == undefined) {
          stream = await anime_stream.run(id, i);
        }
        episodes_gogo.push(stream);
      }

      let animerunid = await anime_search_rush.run(name);
      let episodes_rush = [];
      for (let i = 1; i < details.totalEpisodes + 1; i++) {
        let rush_stream = { url: "/error" };
        if (animerunid.length >= 1) {
          rush_stream = await anime_stream_rush.run(animerunid[0].animeId, i);
          if (
            rush_stream.url == "/error" ||
            animerunid[0].animeTitle.toLowerCase() != name.toLowerCase()
          ) {
            for (let i1 = 0; i1 < animerunid.length; i1++) {
              if (
                animerunid[i1].animeTitle.toLowerCase() == name.toLowerCase()
              ) {
                rush_stream = await anime_stream_rush.run(
                  animerunid[i1].animeId,
                  i
                );
                id = animerunid[i1].animeId;
                break;
              }
            }
          }
          episodes_rush.push(rush_stream);
        } else {
          break;
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
        if (details.animeTitle == null) {
          search = await anime_gogo_search.run(mal[0].animeTitle);
          if (search[0]) {
            id = search[0].animeId;

            details = await anime_gogo_details.run(id);
          }
        }
        for (let i = 1; i < details.totalEpisodes + 1; i++) {
          if (details.animeTitle == null && episodes_gogo[I].url == "/error") {
            episodes_gogo[I] = await anime_stream.run(id, i);
          }
        }
      }
      let episodes = 0;
      if (episodes_gogo.length == episodes_rush.length) {
        episodes = episodes_gogo.length;
      } else if (episodes_gogo.length > episodes_rush.length) {
        episodes = episodes_gogo.length;
      } else {
        episodes = episodes_rush.length;
      }

      await savedata.run(client, {
        id: id1,
        time: Date.now(),
        episodes: episodes,
        data: {
          stream: episodes_gogo,
          rush_stream: episodes_rush,
          details: details,
          mal_search: mal,
          rating: rating,
          new_ep: data_schedule,
        },
      });
    }
  },
};
