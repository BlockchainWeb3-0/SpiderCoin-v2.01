import express from "express"
import bodyParser from "body-parser";
import _ from "lodash";
import GlobalVar from "../blockchain/globalVar";

// import middlewares
import cors from "./middlewares/cors";

// import routers
import {router as indexRouter} from "./routers/index"
import {router as blocksRouter} from "./routers/blocksRouter"
import {router as utxosRouter} from "./routers/utxosRouter"
import {router as transacionRouter} from "./routers/transactionRouter"

const app = express();
const port = parseInt(process.env.HTTP_PORT as string) || 3001;
app.set("port", port)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cors);
app.use("/", indexRouter);
app.use("/blocks", blocksRouter);
app.use("/utxos", utxosRouter);
app.use("/transaction", transacionRouter);

const server = app.listen(app.get("port"), () => {
  console.log(`
  ###################################
  🕷 Server listening on port: ${port} 🕷
  ###################################`);  
})