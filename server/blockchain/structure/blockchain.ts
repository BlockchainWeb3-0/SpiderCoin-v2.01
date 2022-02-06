import { Block } from "./block";

import _ from "lodash";

export default class Blockchain {
	blocks: Block[];

	constructor() {
		this.blocks = [Block.getGenesisBlock()];
	}

	getLastBlock = (): Block => {
		return this.blocks[this.blocks.length - 1];
	};

	getFirstBlock = (): Block => {
		return this.blocks[0];
	};

	/**
	 * @brief Add block to blockchain after validation
	 * @param newBlock
	 * @returns true when added successfully
	 */
	addBlock = (newBlock: Block): boolean => {
		const lastBlock: Block = this.getLastBlock();
		// const newBlock: Block | null = Block.getNewBlock(lastBlock, data);

		// ! exception handling : new block could be null
		if (newBlock === null) {
			return false;
		}

		if (!Block.isValidNewBlock(newBlock, lastBlock)) {
			return false;
		}

		this.blocks.push(newBlock);
		return true;
	};

	/**
	 * @brief Replace blockchain with new blockchain from other node
	 * @param newBlocks 
	 * @returns true when replaced successfully
	 */
	replaceBlocks = (newBlocks: Block[]): boolean => {
		if (!Blockchain.isValidBlocks(newBlocks)) {
			console.log("Invalid Blocks");
			return false;
		}

		this.blocks = newBlocks;
		return true;
	};

	/**
	 * @brief Validates blockchain
	 * @param blocks
	 * @returns true for valid blockchain
	 */
	static isValidBlocks = (blocks: Block[]): boolean => {
		/**	check list
		 * 1. genesis block === first block
		 * 2. validates each block
		 * TODO
		 * 3. Validate and update UTXOs (Unspent Transaction Outputs)
		 */
		if (blocks[0] !== Block.getGenesisBlock()) {
			console.log("Invalid genesis block");
			return false;
		}

		for (let i = 1; i < blocks.length; i++) {
			const currentBlock: Block = blocks[i];
			const prevBlock: Block = blocks[i - 1];
			if (!Block.isValidNewBlock(currentBlock, prevBlock)) {
				return false;
			}
		}
		return true;
	};
}
