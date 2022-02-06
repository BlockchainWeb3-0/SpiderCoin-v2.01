import WebSocket from "ws";
import { Server } from "ws";
import { Block } from "../blockchain/structure/block";
import GlobalVar from "../blockchain/globalVar";
import { Message, MessageType } from "./message";

const sockets: WebSocket[] = [];
const port = parseInt(process.env.P2P_PORT as string) || 6001;


const initP2PServer = () => {
	const server: Server = new WebSocket.Server({ port });
	server.on("connection", (ws: WebSocket) => {
		initConnection(ws);
	
		console.log(`
		###################################
		🕸 Server listening on port: ${port} 🕸
		###################################`);
	});
}

const initConnection = (ws: WebSocket) => {
	// Add conncected ws into sockets list
	sockets.push(ws);

	initErrorHandler(ws);
	initMessageHandler(ws);

	// Query last block from node
	write(ws, Message.queryLastBlock());

	// TODO : transaction pool query
};


const removeConnection = (ws: WebSocket) => {
	console.log(`Closed connection with peer: ${ws.url}`);
	sockets.splice(sockets.indexOf(ws), 1);
};

const closeConnectionToPeer = (ws: WebSocket) => {
	console.log(`Starts to close connection to peer: ${ws.url}`);
	ws.on("close", () => removeConnection(ws));
}

const initErrorHandler = (ws: WebSocket) => {
	console.log("Connection error found!");
	ws.on("close", () => removeConnection(ws));
	ws.on("error", () => removeConnection(ws));
};

const initMessageHandler = (ws: WebSocket) => {
	ws.on("messgae", (data: string) => {
		try {
			const message: Message = JSON.parse(data);

			// ! exception handling : data could be null
			if (message === null) {
				console.log(`Cannot parse received JSON message : ${data}`);
				return;
			}

			console.log(`Received message: ${JSON.stringify(message)}`);
			switch (message.type) {
				// get QUERY_LAST_BLOCK message => response last block
				case MessageType.QUERY_LAST_BLOCK:
					write(ws, Message.responseLastBlock());
					break;

				// get QUERY_ALL_BLOCK message => response blockchain containing all blocks
				case MessageType.QUERY_ALL_BLOCK:
					write(ws, Message.responseAllBlocks());
					break;

				case MessageType.RESPONSE_BLOCKCHAIN:
					const receivedBlocks: Block[] = JSON.parse(message.data);
					// ! exception handling : Received block could be null
					if (receivedBlocks === null) {
						console.log(
							`Received block is invalid : ${JSON.stringify(receivedBlocks)}`
						);
						break;
					}
					handleBlockchainResponse(receivedBlocks);
					break;

				default:
					break;
			}
		} catch (error) {
			console.error(error);
		}
	});
};

const handleBlockchainResponse = (receivedBlocks: Block[]) => {
	/**
	 * if received blockchain's length is 0 ==> no blocks in it, nothing to do
	 *
	 * if received blockchain's length is not 0
	 *  1. block validation
	 *  2. longer than mine
	 *  3. shorter than mine
	 */
	if (receivedBlocks.length === 0) {
		console.log("No blocks in received blockchain");
		return;
	}

	const lastBlockReceived: Block = receivedBlocks[receivedBlocks.length - 1];
	const lastBlockHeld: Block = GlobalVar.blockchain.getLastBlock();

	if (!Block.isValidBlockStructure(lastBlockReceived)) {
		console.log("Invalid Block structure");
		return;
	}

	if (lastBlockHeld.header.index < lastBlockReceived.header.index) {
		// Received block is might be longer
		console.log("Peer has possibly longer blockchain");
		console.log(`Holding blockchain Height : ${lastBlockHeld.header.index}`);
		console.log(`Received block Height : ${lastBlockReceived.header.index}`);

		if (lastBlockHeld.hash === lastBlockReceived.header.prevHash) {
			// Peer got new block, so need to add block to holding blockchain
			const addSuccess = GlobalVar.blockchain.addBlock(lastBlockReceived);
			if (addSuccess) {
				console.log("Add received block to holding blockchain successfully");
				broadcast(Message.responseLastBlock());
			}
		} else if (receivedBlocks.length === 1) {
			// Received Blocks has genesis block only
			// Query all blocks from connected peers
			broadcast(Message.queryAllBlocks());
		} else {
			console.log("Received block is longer than holding blockchain");
			GlobalVar.blockchain.replaceBlocks(receivedBlocks);
		}
	}
};

/**
 * @brief sends a json type message to websocket
 * @param ws websocket
 * @param message
 */
const write = (ws: WebSocket, message: Message) => {
	ws.send(JSON.stringify(message));
};

/**
 * @brief sends message to all connected websocket
 * @param message
 */
const broadcast = (message: Message) => {
	sockets.forEach((socket) => write(socket, message));
};


// TODO : define functions for transaction pool query and response
