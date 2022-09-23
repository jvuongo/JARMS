/*
    Script to reset Jarms backend DB
*/

const mongoose = require("mongoose")
const config = require("config")

const dbUri = config.get<string>('dbUri')
const conn = mongoose.connect(dbUri)

run()
async function run() {
  const mongoconn = mongoose.createConnection(dbUri)
  console.log("Jarms db reset complete.")
  await mongoconn.dropDatabase( process.exit(1))
}