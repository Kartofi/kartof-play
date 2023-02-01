module.exports = {
    data : "Checks if data exists",
    run : async function(collection, id, episode) {
        let data = await collection.findOne({id: id, episode: episode});
        return data;
    }
}