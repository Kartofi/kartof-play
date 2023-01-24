const { MongoClient } = require("mongodb");

module.exports = {
  data: {
    description: "Check if Name exist in database",
  },
  async run(collection, data) {
    let output = await collection.find(data).toArray();

    if (output.length >= 1) {
      return true;
    } else {
      return false;
    }
  },
};
