const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

module.exports = {
  data: {
    description: "Gives details from gogo anime",
  },
  run: async function (id) {
    let data = {};
    await fetch("https://gogoanime.consumet.org/anime-details/" + id)
      .then((response) => response.json())
      .then((animelist) => {
        data = animelist;
        let episodes = []
        if (data.episodesList != undefined) {
          for (let index = 0; index < data.episodesList.length; index++) {
            const element = data.episodesList[index];
            episodes.push({
              episodeNum: element.episodeNum,
              watchUrl: "/watch/" + element.episodeUrl.split("//")[2].split("-episode-")[0] + "/" + element.episodeNum
            })
            
          }
          data.episodesList = episodes
        }
       
      });
    return data;
  },
};
