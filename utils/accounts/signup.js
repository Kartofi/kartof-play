module.exports = {
    data: {
        description: "Inserts the username nad password in data"
    },
    async run(collection, data) {
await collection.insertOne(data);
    }
}