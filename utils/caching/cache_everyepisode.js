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

//animegg ANIME
const replaceromantoarab = require("../replaceromantoarab");
const anime_stream_animegg = require("../animegg/anime-stream");
const anime_id_animegg = require("../animegg/getidfromname");
const anime_search_animegg = require("../animegg/anime-search");

const savedata = require("./savedata");

module.exports = {
  data: "Cache",
  run: async function (
    client,
    id1,
    episodes_max,
    details,
    search,
    mal,
    animegg_id
  ) {
    const db = client.db("Kartof-PLay");
    let collection = db.collection("Watch_Cach");

    let data = await collection.findOne({ id: id1 });

    if (data != null) {
      let id = id1;
      let episodes = data.episodes;

      if (
        episodes_max - episodes > 0 ||
        (data.data.animegg_stream != undefined &&
          data.data.stream[data.data.stream.length - 1] != null &&
          data.data.stream[data.data.stream.length - 1].url == "/error") ||
        (data.data.animegg_stream != undefined &&
          data.data.animegg_stream[data.data.animegg_stream.length - 1] !=
            null &&
          data.data.animegg_stream[data.data.animegg_stream.length - 1].url ==
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

        let animerunid = await anime_search_animegg.run(name);

        for (let i = episodes; i < episodes_max; i++) {
          let stream = await anime_stream.run(watch_id, i);

          if (stream.url == "/error" || stream.url == undefined) {
            stream = await anime_stream.run(id, i);
          }

          let animegg_stream = await anime_stream_animegg.run(animegg_id, i);

          if (
            (animegg_stream == null || animegg_stream.url == "/error") &&
            animerunid.length >= 1
          ) {
            animegg_stream = await anime_stream_animegg.run(
              animerunid[0].animeId,
              i
            );

            if (
              animegg_stream.url == "/error" ||
              animerunid[0].animeTitle.toLowerCase() != name.toLowerCase()
            ) {
              for (let anime = 0; anime < animerunid.length; anime++) {
                if (
                  animerunid[anime].animeTitle.toLowerCase() ==
                  name.toLowerCase()
                ) {
                  animegg_stream = await anime_stream_animegg.run(
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
          try{
            data.data.animegg_stream.push(animegg_stream);
          }catch (e){
            data.data.animegg_stream = animegg_stream;
          }
       
          
        }

        for (let i = 1; i < data.data.stream.length + 1; i++) {
          if (data.data.stream[i - 1].url == "/error") {
            let stream = await anime_stream.run(watch_id, i);

            if (stream.url == "/error" || stream.url == undefined) {
              stream = await anime_stream.run(id, i);
            }
            data.data.stream[i - 1] = stream;
          }
        }

        for (let i = 1; i < data.data.animegg_stream.length + 1; i++) {
          if (data.data.animegg_stream[i - 1].url == "/error") {
            let animegg_stream = { url: "/error" };

            if (animerunid.length >= 1) {
              animegg_stream = await anime_stream_animegg.run(
                animerunid[0].animeId,
                i + 1
              );

              if (
                animegg_stream.url == "/error" ||
                animerunid[0].animeTitle.toLowerCase() != name.toLowerCase()
              ) {
                for (let anime = 0; anime < animerunid.length; anime++) {
                  if (
                    animerunid[anime].animeTitle.toLowerCase() ==
                    name.toLowerCase()
                  ) {
                    animegg_stream = await anime_stream_animegg.run(
                      animerunid[anime].animeId,
                      i + 1
                    );

                    break;
                  }
                }
              }
            }
            data.data.animegg_stream[i - 1] = animegg_stream;
          }
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

      let animerunid = await anime_search_animegg.run(name);
      let episodes_animegg = [];
      for (let i = 1; i < details.totalEpisodes + 1; i++) {
        let animegg_stream = await anime_stream_animegg.run(animegg_id, i);
        if (animegg_stream.url != "/error") {
          episodes_animegg.push(animegg_stream);
        }
        if (animegg_stream.url == "/error" && animerunid.length >= 1) {
          animegg_stream = await anime_stream_animegg.run(
            animerunid[0].animeId,
            i
          );
          if (
            animegg_stream.url == "/error" ||
            animerunid[0].animeTitle.toLowerCase() != name.toLowerCase()
          ) {
            for (let i1 = 0; i1 < animerunid.length; i1++) {
              if (
                animerunid[i1].animeTitle.toLowerCase() == name.toLowerCase()
              ) {
                animegg_stream = await anime_stream_animegg.run(
                  animerunid[i1].animeId,
                  i
                );
                id = animerunid[i1].animeId;
                break;
              }
            }
          }
          episodes_animegg.push(animegg_stream);
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
          if (details.animeTitle == null && episodes_gogo[i].url == "/error") {
            if (episodes_gogo[i].length - i == 2) {
              [episodes_gogo[i], episodes_gogo[i + 1]] = await Promise.all([
                anime_stream.run(id, i),
                anime_stream.run(id, i + 1),
              ]);
            } else {
              episodes_gogo[i] = await anime_stream.run(id, i);
            }
          }
        }
      }
      let episodes = 0;
      if (episodes_gogo.length == episodes_animegg.length) {
        episodes = episodes_gogo.length;
      } else if (episodes_gogo.length > episodes_animegg.length) {
        episodes = episodes_gogo.length;
      } else {
        episodes = episodes_animegg.length;
      }

      await savedata.run(client, {
        id: id1,
        time: Date.now(),
        episodes: episodes,
        data: {
          stream: episodes_gogo,
          animegg_stream: episodes_animegg,
          details: details,
          mal_search: mal,
          rating: rating,
          new_ep: data_schedule,
        },
      });
    }
  },
};
