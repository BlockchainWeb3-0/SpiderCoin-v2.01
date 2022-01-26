import { response } from "express";
import WebSocket from "ws";
import { Server } from "ws";
import { Block } from "../blockchain/structure/block";
import { Blockchain } from "../blockchain/structure/blockchain";

const sockets: WebSocket[] = [];
const port = parseInt(process.env.P2P_PORT as string) || 6001;

const blockchain: Blockchain = new Blockchain();

enum MessageType {
	QUERY_LAST_BLOCK,
	QUERY_ALL_BLOCK,
	RESPONSE_BLOCKCHAIN,
	QUERY_TRANSACTION_POOL,
	RESPONSE_TRANSACTION_POOL,
}

class Message {
	public type: MessageType;
	public data: any;
	constructor(type: MessageType, data: any) {
		this.type = type;
		this.data = data;
	}
}

const server: Server = new WebSocket.Server({ port });
server.on("connection", (ws: WebSocket) => {
	initConnection(ws);

	console.log(`
  ###################################
  🕸 Server listening on port: ${port} 🕸
  ###################################`);
});

const initConnection = (ws: WebSocket) => {
	// Add conncected ws into sockets list
	sockets.push(ws);

	initErrorHandler(ws);
	initMessageHandler(ws);

	// Query last block from node
	write(ws, queryLastBlock());

	// TODO : transaction pool query
};

const initErrorHandler = (ws: WebSocket) => {
	const closeConnection = (ws: WebSocket) => {
		console.log(`Connection faild to peer: ${ws.url}`);
		sockets.splice(sockets.indexOf(ws), 1);
	};
	ws.on("close", () => closeConnection(ws));
	ws.on("error", () => closeConnection(ws));
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
					write(ws, responseLastBlock());
					break;

				// get QUERY_ALL_BLOCK message => response blockchain containing all blocks
				case MessageType.QUERY_ALL_BLOCK:
					write(ws, responseAllBlocks());
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
	const lastBlockHeld: Block = blockchain.getLastBlock();

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
			const addSuccess = blockchain.addBlock(lastBlockReceived);
			if (addSuccess) {
				console.log("Add received block to holding blockchain successfully");
				broadcast(responseLastBlock());
			}
		} else if (receivedBlocks.length === 1) {
			// Received Blocks has genesis block only
			// Query all blocks from connected peers
			broadcast(queryAllBlocks());
		} else {
			console.log("Received block is longer than holding blockchain");
			blockchain.replaceBlocks(receivedBlocks);
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

const queryLastBlock = (): Message => ({
	type: MessageType.QUERY_LAST_BLOCK,
	data: null,
});

const queryAllBlocks = (): Message => ({
	type: MessageType.QUERY_ALL_BLOCK,
	data: null,
});

const responseLastBlock = (): Message => ({
	type: MessageType.RESPONSE_BLOCKCHAIN,
	data: JSON.stringify(blockchain.getLastBlock()),
});

const responseAllBlocks = (): Message => ({
	type: MessageType.RESPONSE_BLOCKCHAIN,
	data: JSON.stringify(blockchain.blocks),
});

// TODO : define functions for transaction pool query and response
