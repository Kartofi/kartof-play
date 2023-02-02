
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

module.exports = {
    data : "Checks if data exists",
    run : async function(collection, id) {

        let search = await anime_gogo_search.run(id.replaceAll("-", " "));

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
    for (let i =1; i < details.totalEpisodes + 1; i++) {
        let stream = await anime_stream.run(watch_id, i);
        if (stream.url == "/error" || stream.url == undefined) {
            stream = await anime_stream.run(id, i);
          }
          episodes_gogo.push(stream);
    }
   
    let animerunid = await anime_search_rush.run(name);
    let episodes_rush = [];
    for (let i =1; i < details.totalEpisodes + 1; i++) {
        let rush_stream = { url: "/error" };
        if (animerunid.length >= 1) {
            rush_stream = await anime_stream_rush.run(
              animerunid[0].animeId,
              i);
              if (
                rush_stream.url == "/error" ||
                animerunid[0].animeTitle.toLowerCase() != name.toLowerCase()
              ) {
                for (let i1 = 0; i1 < animerunid.length; i1++) {
                  if (animerunid[i1].animeTitle.toLowerCase() == name.toLowerCase()) {
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
            }else {
            break;
          }
    }
    
console.log(episodes_rush)
     
  
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
 

    }
}