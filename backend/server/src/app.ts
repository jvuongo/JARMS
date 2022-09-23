import express from "express";
import config from "config";
import connect from "./utils/connect";
import logger from "./utils/logger"
import routes from './routes/routes'
import { Base64 } from 'js-base64';

var cookieParser = require('cookie-parser')

const app = express();
const cors = require('cors');



// Middleware
app.use(cors())
app.use(express.json())

const port = config.get<number>("port");

app.listen(port, async ()=>{
  logger.info(`App is running at http://localhost:${port}`);

  /*
    Using util function to connect to mongodb jarms.
  */
  await connect();

  routes(app);
})

