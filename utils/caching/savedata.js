module.exports = {
  data: "Saves Data",
  run: async function (collection, data1) {
    let data = await collection.findOne({id: data1.id, episode: data1.episode});
    if (data != null) {
      await collection.updateOne({id: data1.id, episode: data1.episode},{ $set: data1});
    }else {
      await collection.insertOne(data1);
    }
    
  },
};
