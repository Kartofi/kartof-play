const { promiseImpl } = require("ejs");
const anime_schedule = require("../anime_schedule/anime-schedule");
const anime_gogo_popular = require("../gogo/anime-popular");
const anime_gogo_recent = require("../gogo/anime-recent");
const anime_animegg_recent = require("../animegg/recent");

module.exports = {
  data: "CachesMainPage",
  run: async function (client) {
    const db = client.db("Kartof-PLay");
    let collection = db.collection("Main_Cache");
    let date = new Date();
    let database = await collection.findOne({
      date: {
        day: date.getDate(),
        month: date.getMonth(),
        year: date.getFullYear(),
      },
    });

    let data;
    let popular;
    let recent;

    if (database != null && (Date.now() - database.timespam) / 1000 < 600) {
      data = database.data;
      popular = database.popular;
      recent = database.recent;
    } else {
      let [data1, popular1, recent1, animeanimegg_recent] = await Promise.all([
        anime_schedule.run(),
        anime_gogo_popular.run(1),
        anime_gogo_recent.run(1),
        anime_animegg_recent.run(),
      ]);

      data = data1;
      popular = popular1;
      recent = recent1;
      if (
        recent1 == null ||
        recent1.length <= 0 ||
        (recent1.length >= 1 && recent1[0] == null)
      ) {
        recent = animeanimegg_recent;
      }

      await collection.deleteMany({
        date: {
          day: date.getDate(),
          month: date.getMonth(),
          year: date.getFullYear(),
        },
      });
      await collection.insertOne({
        timespam: Date.now(),
        date: {
          day: date.getDate(),
          month: date.getMonth(),
          year: date.getFullYear(),
        },
        data: data,
        popular: popular,
        recent: recent,
      });
    }

    return { data: data, popular: popular, recent: recent };
  },
};
