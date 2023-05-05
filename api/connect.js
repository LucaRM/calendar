const {MongoClient} = require("mongodb");

// Replace the following with your Atlas connection string
const url =
    "mongodb+srv://lmalato:6WaeVE8YNl8tm21c@cluster0.w1umnql.mongodb.net/test?retryWrites=true&w=majority&useNewUrlParser=true&useUnifiedTopology=true";
const client = new MongoClient(url);

async function run() {
    try {
        await client.connect();
        console.log("Connected correctly to server");
    } catch (err) {
        console.log(err.stack);
    } finally {
        await client.close();
    }
}

run().catch(console.dir);
