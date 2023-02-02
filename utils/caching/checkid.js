module.exports = {
    data : "Checks if data exists",
    run : async function(client, id, episodes) {
        
        const db = client.db("Kartof-PLay");
        let collection = db.collection("Watch_Cach")
        let data = await collection.findOne({id: id, episodes: episodes});
        
        return data;
        
    }
}