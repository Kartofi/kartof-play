module.exports = {
  data: "Saves Data",
  run: async function (client, data1) {
    const db = client.db("Kartof-PLay");
    let collection = db.collection("Watch_Cach");
    let data = await collection.findOne({
      id: data1.id,
      episodes: data1.episodes,
    });
    let only_id = await collection.findOne({ id: data1.id });

    if (data != null && only_id != null) {
      await collection.updateOne(
        { id: data1.id, episodes: data1.episodes },
        { $set: data1 }
      );
    } else if (data == null && only_id != null) {
      await collection.updateOne({ id: data1.id }, { $set: data1 });
    } else {
      await collection.insertOne(data1);
    }
  },
};
