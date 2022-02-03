import { Block } from "./block";

import _ from "lodash";
import UnspentTxOutput from "../transaction/unspentTxOutput";
import Transaction from "../transaction/transaction";

export class Blockchain {
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


	/********************************/
	/***** Validation Functions *****/
	/********************************/

	/**
	 * @brief Validates blockchain
	 * @param blocks
	 * @returns true for valid blockchain
	 */
	static isValidBlocks = (blocks: Block[]): boolean => {
		/**	check list
		 * 1. genesis block === first block
		 * 2. validates each block
		 * 3. Validate and update UTXOs (Unspent Transaction Outputs)
		 */
		if (JSON.stringify(blocks[0]) !== JSON.stringify(Block.getGenesisBlock())) {
			console.log("Invalid genesis block");
			return false;
		}

		let utxoList: UnspentTxOutput[] | null = [];
		for (let i = 1; i < blocks.length; i++) {
			const currentBlock: Block = blocks[i];
			const prevBlock: Block = blocks[i - 1];
			if (!Block.isValidNewBlock(currentBlock, prevBlock)) {
				return false;
			}
			utxoList = UnspentTxOutput.validateAndUpdateUtxoList(
				currentBlock.data,
				utxoList,
				currentBlock.header.index
			);
			
			if (utxoList === null) {
				console.log("Invalid transaction in blockchain");
				return false;
			}
		}
		return true;
	};

	static isValidBlockTxData = (
		txData: Transaction[],
		utxoList: UnspentTxOutput[],
		blockIndex: number
	): boolean => {
		/**
		 * 1. first Tx must be reward tranasction
		 * 2. check if there are duplicate transactions
		 * 3. validates normal transactions 
		 */
		const firstTx = txData[0];

		const normalTxList: Transaction[] = txData.slice(1);
		const isValidNormalTxList = normalTxList
			.map((tx) => Transaction.isValidTx(tx, utxoList))
			.reduce((a, b) => a && b, true);

		return (
			Transaction.isValidRewardTx(firstTx, blockIndex) &&
			!Transaction.hasDuplicateTx(txData) &&
			isValidNormalTxList
		);
	};
}
