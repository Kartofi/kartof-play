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
    let response;
    try{
      response = await fetch(
       animegg_base_url +"search/?q=" + keyword
      );
    }catch(e){
      return [];
    }
    const body = await response.text();

    let $ = cheerio.load(body);

    let source = $("div[class='moose page']");
    let children = source.children();
    children.each(async function (index, element) {
      if (element.name == "a") {
        if (element.attribs.class == "mse") {
          let element_data = $(element);
          let id = element_data.attr("href").split("/")[2];
          let image = element_data.find("img.media-object").attr("src");
          data.push({
            animeId:id,
            animeTitle: element_data.find("h2").first().text(),
            animeImg: image,
            source: "(Animegg)",
            watch_url: "/watch/" + id + "/1"
          });
          
        }
      }
    });

    return data;
  },
};
