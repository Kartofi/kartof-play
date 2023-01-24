const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
  const getidfromname = require("../getidfromname");
module.exports = {
  data: {
    description: "Gives popular animes",
  },
  run: async function (id) {
    let data = [];
    await fetch("https://gogoanime.consumet.org/popular")
      .then((response) => response.json())
      .then((animelist) => {
        for (let index = 0; index < animelist.length; index++) {
          const element = animelist[index];
          data.push({
            animeId: element.animeId,
            animeTitle: element.animeTitle,
            animeImg: element.animeImg,
            releasedDate: element.releasedDate,
            watch_url: "/watch/" + getidfromname.run(element.animeTitle) + "/1"
          });
        }
      });
      
    return data;
  },
};
