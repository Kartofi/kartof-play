module.exports = {
  data: "Saves Data",
  run: async function (client, data1) {

    const db = client.db("Kartof-PLay");
    let collection = db.collection("Watch_Cach")
    let data = await collection.findOne({id: data1.id, episode: data1.episode});
    if (data != null) {
      await collection.updateOne({id: data1.id, episode: data1.episode},{ $set: data1});
    }else {
      await collection.insertOne(data1);
    }

  },
};
