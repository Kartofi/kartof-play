const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const getidfromname = require("../getidfromname");

module.exports = {
  data: {
    description: "Searches in gogo anime",
  },
  run: async function (name) {
    let data = [];
    await fetch("https://gogoanime.consumet.org/search?keyw=" + name)
      .then((response) => response.json())
      .then((animelist) => {
        for (let index = 0; index < animelist.length; index++) {
          const element = animelist[index];
          data.push({
            animeId: element.animeId,
            animeTitle: element.animeTitle,
            animeImg: element.animeImg,
            watch_url: "/watch/" + getidfromname.run(element.animeId) + "/1",
            rating: "Nan",
            source: "(GoGoAnime)"
          });
        }
      });
    return data;
  },
};
