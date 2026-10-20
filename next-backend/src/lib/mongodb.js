// src/lib/mongodb.js

import { MongoClient } from "mongodb";

const options = {};
let globalClientPromise;

export function getClientPromise() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "Please add your Mongo URI to .env.local or set MONGODB_URI env variable",
    );
  }
  // Reuse one connection per server instance (dev and production) so a
  // serverless deployment does not open a new connection on every request.
  if (!globalClientPromise) {
    const client = new MongoClient(uri, options);
    globalClientPromise = client.connect();
  }
  return globalClientPromise;
}

export async function getDb() {
  const client = await getClientPromise();
  return client.db(process.env.MONGODB_DB || "online_course");
}
