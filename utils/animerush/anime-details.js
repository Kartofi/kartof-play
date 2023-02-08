const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const cheerio = require("cheerio");
const getidfromname = require("./getidfromname");

module.exports = {
  data: {
    description: "Gets details",
  },
  run: async function (name) {
    let data = {
      animeTitle: null,
      otherNames: [],
      synopsis: "",
      animeImg: "",
      totalEpisodes: 0,
      episodesList: [],
      watch_id: getidfromname.run(name),
      genres: [],
    };
    let response = await fetch(
      rush_base_url + "anime/" + getidfromname.run(name)
    );
    const body = await response.text();

    let $ = cheerio.load(body);
    let image = $(
      "#left-column > div.amin_box2 > div.desc_box_mid > div.cat_image > object"
    ).attr("data");

    data.animeImg = image;
    let title = $(
      "#left-column > div.amin_box2 > div.amin_week_box_up1 > h1"
    ).html();
    data.animeTitle = title;

    let desc = $(
      "#left-column > div.amin_box2 > div.desc_box_mid > div.cat_box_desc > div"
    ).html();
    data.synopsis = desc;

    let episodes = $("div.episode_list");
    data.totalEpisodes = episodes.length - 1;
    for (let i = 1; i < episodes.length; i++) {
      data.episodesList.push({
        watchUrl: "/watch/" + getidfromname.run(name).toLowerCase() + "/" + i,
        episodeNum: i
      })
    }
    return data;
  },
};
