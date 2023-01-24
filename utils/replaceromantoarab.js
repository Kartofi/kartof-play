module.exports = {
  data: {
    description: "Replaces roman to arabic",
  },
  run: function (name) {
    if (typeof name != "string") {
      return undefined;
    }
    return name
      .toLowerCase()
      .replaceAll("iii", "3")
      .replaceAll("ii", "2")
      .replaceAll("v", "5")
      .replaceAll("iv", "4")
      .replaceAll("1v", "4");
  },
};
