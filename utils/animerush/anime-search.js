const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const cheerio = require("cheerio");
const getidfromname = require("../getidfromname");

module.exports = {
  data: {
    description: "Search inside of animerush",
  },
  run: async function (keyword) {
    let data =  [];
    let response = await fetch(
      "https://www.animerush.tv/search.php?searchquery=" + keyword
    );
    const body = await response.text();

    let $ = cheerio.load(body);

    let source = $("div.amin_box_mid");
    let children = source.children();
    children.each(async function (index, element) {
      if (element.name == "div") {
        if (element.attribs.class == "search-page_in_box_mid_link") {
          let element_data = $(element);
          let id = element_data.find("a.highlightit").attr("href");
          let image = element_data.find("object.highlightz").attr("data");
          data.push({
            animeId: id.split("/")[4],
            animeTitle: id.split("/")[4].replaceAll("-", " "),
            animeImg: image.replaceAll("//", "")
          });
        }
      }
    });

    return data;
  },
};
