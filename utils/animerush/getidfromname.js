module.exports = {
  data: {
    description: "Get Id From Name",
  },
  run: function (name) {
    if (typeof name != "string") {
      return undefined;
    }
    return name

      .replaceAll(":", "-")
      .replaceAll("♡", "")
      .replaceAll("?", "")
      .replaceAll("!", "")
      .replaceAll(",", "--")
      .replaceAll("/", "-")
      .replaceAll("\\", "-")
      .replaceAll("@", "-")
      .replaceAll(" ", "-")
      .replaceAll("--", "-")
      .replaceAll("--", "-")
      .replaceAll("--", "-")
      .replaceAll("--", "-");
  },
};
