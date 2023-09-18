const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const cheerio = require("cheerio");
const getidfromname = require("./getidfromname");
//NOT DONE
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
    let response;
    try {
      response = await fetch(
        animegg_base_url + "series/" + getidfromname.run(name),
        fetchArgs
      );
    } catch (e) {
      return null;
    }
    const body = await response.text();

    let $ = cheerio.load(body);
    let image = $(
      "body > div.navbar.navbar-inverse.bs-docs-nav > div.fattynav > div.fattynavinside > div > div > a > img"
    ).attr("src");

    data.animeImg = image;
    let title = $(
      "body > div.navbar.navbar-inverse.bs-docs-nav > div.fattynav > div.fattynavinside > div > div > div > div.first > h1"
    ).html();
    data.animeTitle = title;

    let desc = $(
      "body > div.navbar.navbar-inverse.bs-docs-nav > div.fattynav > div.container > p"
    ).html();
    data.synopsis = desc;

    let animeinfo = $("p.infoami");
    animeinfo.children().each(function (index, el) {
      if (el.children[0].data.includes("Episodes")) {
        try {
          data.totalEpisodes = Number(el.children[0].data.split(" ")[1]);
        } catch {
          data.totalEpisodes = 0;
        }
      } else if (el.children[0].data.includes("Alternate Titles")) {
        try {
          let titles = el.children[0].data.split(": ")[1].split(", ");
          data.otherNames = titles;
        } catch {
          data.otherNames = [];
        }
      }
    });
    for (let i = 1; i < data.totalEpisodes + 1; i++) {
      data.episodesList.push({
        watchUrl: "/watch/" + getidfromname.run(name).toLowerCase() + "/" + i,
        episodeNum: i,
      });
    }
    let genres = $(
      "body > div.navbar.navbar-inverse.bs-docs-nav > div.fattynav > div.fattynavinside > div > div > div > div.second > ul"
    );
    genres.each(function (index, el) {
      let genre = $(el).find("a")[0].attribs.href.split("/")[2];
      data.genres.push(genre.charAt(0).toUpperCase() + genre.slice(1));
    });

    return data;
  },
};
