import { NextRequest, NextResponse } from "next/server";

import { MongoClient } from "mongodb";


const uri = process.env.MONGODB_URI!;
const dbName = process.env.MONGODB_DB!;
const collectionName = process.env.MONGODB_COLLECTION_JEANS!;

export async function GET(request: Request) {
  const client = new MongoClient(uri);

  try {
    const database = client.db(dbName);
    const jeans = database.collection(collectionName);
    // Query for a movie that has the title 'Back to the Future'
    const query = {};
    const jean = await jeans.find().toArray();

    return NextResponse.json({ jean });
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}


export async function POST(request: Request) {
  const client = new MongoClient(uri);
  const body = await request.json();
 
  try {
    const database = client.db(dbName);
    const jeans = database.collection(collectionName);
    // Query for a movie that has the title 'Back to the Future'
    const query = {};
    const jean = await jeans.insertOne(body);

 // Revalidate the shop page after adding the product

    return NextResponse.json({ jean});
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
