const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

module.exports = {
  data: {
    description: "Gives stream for the anime",
  },
  run: async function (id, episode) {
    let data = {};

    await fetch(
      "https://gogoanime.consumet.org/vidcdn/watch/" +
        id +
        "-episode-" +
        episode
    )
      .then((response) => response.json())
      .then((animelist) => {
        if (animelist.error != undefined) {
          data = {
            url: "/error",
          };
        } else {
          data = {
            url: animelist.Referer,
          };
        }
      });
    return data;
  },
};
