import merkle from "merkle";
import { Block } from "./block";
import * as config from "./config";

import _ from "lodash";

class Blockchain {
	chain: Block[];

	constructor() {
		this.chain = [Block.getGenesisBlock()];
	}

	getLastBlock(): Block {
		return this.chain[this.chain.length - 1];
	}

	getFirstBlock(): Block {
		return this.chain[0];
	}

	addBlock(data: any[]): Block | null {
		const lastBlock: Block = this.getLastBlock();
		const newBlock: Block | null = Block.mineNewBlock(lastBlock, data);
		if (newBlock === null) {
			return null;
		}

		return newBlock;
	}

  static isValidBlockStructure(block: Block): boolean {
		return (
			typeof block.header.version === "string" &&
			typeof block.header.index === "number" &&
			typeof block.header.prevHash === "string" &&
			typeof block.header.merkleRoot === "string" &&
			typeof block.header.timestamp === "number" &&
			typeof block.header.difficulty === "number" &&
			typeof block.header.nonce === "number" &&
			typeof block.data === "object" &&
			typeof block.hash === "string"
		);
	}

  static isValidNewBlock(newBlock: Block, lastBlock: Block): boolean {
    
  }
}
