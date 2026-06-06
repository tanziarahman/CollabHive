import { MongoClient, ServerApiVersion } from 'mongodb';

const uri = "mongodb+srv://collabhive-admin:CollabHive%402025%23Secure@collabhive-cluster.wgoq6zt.mongodb.net/?appName=collabhive-cluster";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("✅ Pinged! Successfully connected to MongoDB!");
  } catch (err) {
    console.log("❌ Error:", err.message);
  } finally {
    await client.close();
  }
}

run();