module.exports = {
  data: "Saves Data",
  run: async function (collection, data) {
    await collection.insertOne(data);
  },
};
