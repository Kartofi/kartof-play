const { promiseImpl } = require("ejs");
const anime_schedule = require("../anime_schedule/anime-schedule");
const anime_gogo_popular = require("../gogo/anime-popular");
const anime_gogo_recent = require("../gogo/anime-recent");

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
   
    if (database != null && (Date.now() - database.timespam )/1000< 1800  ) {
        data = database.data;
        popular = database.popular;
        recent = database.recent;

    }else {
        let [data1, popular1, recent1] = await Promise.all([
            anime_schedule.run(),
            anime_gogo_popular.run(1),
            anime_gogo_recent.run(1),
        ]);
        data = data1;
        popular = popular1;
        recent = recent1;
        await collection.insertOne({
            timespam: Date.now(),
            date: {
                day: date.getDate(),
                month: date.getMonth(),
                year: date.getFullYear(),
              },
              data: data1,
              popular: popular1,
              recent: recent1
        })
    }
    

    return { data: data, popular: popular, recent: recent };
  },
};