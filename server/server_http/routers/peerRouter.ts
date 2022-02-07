import express from "express";
import { initP2PServer } from "../../server_p2p/p2pServer";

export const router = express.Router();

router.get("/on", (req, res) => {
  initP2PServer();
  res.send("P2P server is on!")
})

router.get("/off", (req, res) => {
  initP2PServer();
  res.send("P2P server is on!")
})