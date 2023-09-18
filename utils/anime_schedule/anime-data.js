const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const cheerio = require("cheerio");
const moment = require("moment");
module.exports = {
  data: {
    description: "Gives data from anime_schedule",
  },
  run: async function (id) {
    let data = {};
    let response = await fetch(
      "https://animeschedule.net/anime/" + id,
      fetchArgs
    );
    const body = await response.text();

    let $ = cheerio.load(body);

    let img = $("#anime-poster").attr("src");
    let name = $("#anime-header-main-title").text();
    let next_ep = $("#release-time-subs").attr("datetime");
    let desc = $("#description").html();

    data = {
      name: name,
      img: img,
      next_ep: next_ep,
      desc: desc,
      date: moment(next_ep).format("MMMM Do YYYY, h:mm a"),
    };
    return data;
  },
};
