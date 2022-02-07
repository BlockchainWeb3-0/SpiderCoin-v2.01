import express from "express";
import {
	connectToPeer,
	disconnectToPeer,
	getP2PServer,
	getPeerList,
	initP2PServer,
	offP2PServer,
	p2pPort,
} from "../../server_p2p/p2pServer";

export const router = express.Router();

router.get("/p2pServer", (req, res) => {
	const server: any = getP2PServer();
	if (server === undefined || server._server === null) {
		console.log("P2P Server is OFF status");
		res.send(null);
	} else {
		console.log(`P2P server is ON. Port : ${server.options.port}`);
		res.send(server);
	}
});

router.get("/list", (req, res) => {
	const peerList = getPeerList();
	let sockInfo: string[] = [];
	peerList.forEach((s: any) => {
		sockInfo.push(s._socket.remoteAddress + ":" + s._socket.remotePort);
	});
	console.log(sockInfo);
	res.send(sockInfo);
});

router.get("/on", (req, res) => {
	const server: any = getP2PServer();
	if (server !== undefined) {
		if (server._server !== null) {
			console.log(`P2P server is already ON. Port: ${server.options.port}`);
			res.send(`P2P server is already ON. Port: ${server.options.port}`);
		} else initP2PServer(p2pPort);
	} else initP2PServer(p2pPort);

	res.send("P2P server is ON");
});

router.get("/off", (req, res) => {
	const server: any = getP2PServer();
	const msg = `P2P server is already OFF status.`;
	if (server !== undefined) {
		if (server._server !== null) {
			offP2PServer();
		} else {
			console.log(msg);
			res.send(msg);
		}
	} else {
		console.log(msg);
		res.send(msg);
	}
	res.send("P2P server is OFF!");
});

router.post("/add", (req, res) => {
	const newPeers: string = req.body.peer; // ex) "ws://localhost:6002"

	connectToPeer(newPeers);
	res.send(newPeers);
});

router.post("/disconnect", (req, res) => {
	const peersToDisconnect: string = req.body.peer; // ex) "ws://localhost:6002"
	disconnectToPeer(peersToDisconnect);
});
