const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const cheerio = require("cheerio");
const moment = require("moment");
const getidfromname = require("../getidfromname");
module.exports = {
  data: {
    description: "Gives schedule",
  },
  run: async function () {
    let data = [];
    let response = await fetch("https://animeschedule.net/", fetchArgs);
    const body = await response.text();

    let $ = cheerio.load(body);

    let today = $("#active-day");

    today.children().each((index, element) => {
      if (
        element.attribs.class == "timetable-column-show aired expanded" ||
        element.attribs.class == "timetable-column-show unaired expanded"
      ) {
        let time_bar = $(element).find("h3.time-bar");
        let episode = time_bar.find("span.show-episode").text();
        let time = time_bar.find("time.show-air-time").attr("datetime");
        let show = $(element).find("a.show-link");
        let image = show.find("img").attr("src");
        if (image == null || !image.startsWith("http")) {
          image = show.find("img").attr("data-srcset");
          if (image != null) {
            image = image.split(",")[1].split(" ")[1];
          }
        }

        let id = $(element).attr("route");
        let title = show.find("h2.show-title-bar").text();
        if (episode.length <= 0) {
          return;
        }
        let out = false;
        if (new Date(time) < new Date()) {
          out = true;
        }
        data.push({
          episode: episode,
          time: time,
          out: out,
          image: image,
          id: id,
          id_my: getidfromname.run(title),
          title: title,
          watch_url:
            "/watch/" +
            getidfromname.run(title) +
            "/" +
            episode.replace(/\D/g, ""),
        });
      }
    });
    data.sort((a, b) => a.time.localeCompare(b.time));
    data.reverse();
    return data;
  },
};
