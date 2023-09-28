import express from "express";
import { nanoid } from "nanoid";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
const conn = mongoose.createConnection(process.env.MONGO_URI);

const SnippetSchema = new mongoose.Schema(
  {
    title: String,
    content: String,
    shortId: String,
    language: String,
  },
  {
    timestamps: true,
  }
);

const Snippet = conn.model("snippet", SnippetSchema);

// EXPRESS API

const app = express();
app.use(cors());
app.use(express.json());

app.get("/snippets", async function (request, response) {
  const snips = await Snippet.find().sort({ createdAt: -1 }).limit(10);
  response.send(snips);
});

app.get("/snippets/:shortId", async function (request, response) {
  const { shortId } = request.params;

  // with mongo async await

  const foundDocument = await Snippet.findOne({ shortId: shortId });
  if (foundDocument) {
    response.send(foundDocument);
  } else {
    response.status(404).send("snippet not found");
  }
});

app.post("/snippets", async function (request, response) {
  // request.body = json content of a POST request

  // 1) get content
  // 2) saveit in the db
  const newDocument = {
    shortId: nanoid(8),
    title: request.body.title,
    content: request.body.content,
    language: request.body.language || "plaintext",
  };

  const createdSnippet = await Snippet.create(newDocument);

  response.send(createdSnippet);
});

app.delete("/snippets/:shortId", async function (request, response) {
  const { shortId } = request.params;

  const deletedSnippet = await Snippet.deleteOne({ shortId: shortId });
  if (deletedSnippet.deletedCount > 0) {
    response.send("snippet deleted successfully");
  } else {
    response.status(404).send("snippet not found");
  }
});

// find the existing document based on the id
// update it with the new content
// send back to the client the updated document

app.put("/snippets/:shortId", async function (request, response) {
  const { shortId } = request.params;
  const updatedSnippet = await Snippet.findOneAndUpdate(
    { shortId: shortId },
    { title: request.body.title, content: request.body.content },
    { language: request.body.language || "plaintext" },
    { new: true }
  );

  response.send(updatedSnippet);
});

app.listen(process.env.PORT, function () {
  console.log("listening on http://localhost:9000" + process.env.PORT);
});

// // HTTP VERBS
// GET -> i want some data
// POST -> i want to create something
// UPDATE (or PUT) -> i want to update something with this ID
// DELETE -> i want to do delete something with this ID
