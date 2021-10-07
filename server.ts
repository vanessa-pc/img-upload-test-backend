// import { Client } from "pg";
// import { config } from "dotenv";
// import express from "express";
// import cors from "cors";

// config(); //Read .env file lines as though they were env vars.

// //Call this script with the environment variable LOCAL set if you want to connect to a local db (i.e. without SSL)
// //Do not set the environment variable LOCAL if you want to connect to a heroku DB.

// //For the ssl property of the DB connection config, use a value of...
// // false - when connecting to a local DB
// // { rejectUnauthorized: false } - when connecting to a heroku DB
// const herokuSSLSetting = { rejectUnauthorized: false }
// const sslSetting = process.env.LOCAL ? false : herokuSSLSetting
// const dbConfig = {
//   connectionString: process.env.DATABASE_URL,
//   ssl: sslSetting,
// };

// const app = express();

// app.use(express.json()); //add body parser to each following route handler
// app.use(cors()) //add CORS support to each following route handler

// const client = new Client(dbConfig);
// client.connect();

// app.get("/", async (req, res) => {
//   const dbres = await client.query('select * from categories');
//   res.json(dbres.rows);
// });


// //Start the server on the given port
// const port = process.env.PORT;
// if (!port) {
//   throw 'Missing PORT environment variable.  Set it in .env file.';
// }
// app.listen(port, () => {
//   console.log(`Server is up and running on port ${port}`);
// });


import express from 'express';
import cors from "cors";

const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })
const fs = require('fs')
const util = require('util')

const unlinkFile = util.promisify(fs.unlink)
const { uploadFile, getFileStream } = require('./s3');

const app = express();
app.use(cors()) //add CORS support to each following route handler
app.use(express.json()); //add body parser to each following route handler


app.get('/images/:key', async (req, res) => {
  const key = req.params.key
  const readStream = getFileStream(key)

  readStream.pipe(res)
})

app.post('/images', upload.single('image'), async (req, res) => {
  const file = req.file
  console.log(file)
  const result = await uploadFile(file);
  await unlinkFile(file.path)
  console.log(result)
  const description = req.body.description

  
  res.send({ imagePath: `/images${result.Key}` })
})

app.listen(4000, () => console.log("Listening on port 4000"));