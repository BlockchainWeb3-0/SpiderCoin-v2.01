import { forEach } from "lodash";
import { Transaction, TxIn, TxOut } from "../transaction";
import TransactionPool from "../transactionPool";
import UnspentTxOutput from "../unspentTxOutput";

describe("UnspentTxOut class", () => {
	describe("findUtxoMatchesTxIn test", () => {
		let txIn: TxIn;
		let utxoList: UnspentTxOutput[];
		beforeEach(() => {});
		test("test", () => {});
	});

	describe("filterConsumedMyUtxoList test", () => {
		let myUtxo: UnspentTxOutput[] = [];
		let txpool: Transaction[] = [];
		beforeEach(() => {
			for (let i = 0; i < 10; i++) {
				const utxo: UnspentTxOutput = new UnspentTxOutput(
					`id${i}`,
					i,
					`address${i}`,
					i * 10
				);
				const txIns: TxIn[] = [];
				const txOuts: TxOut[] = [];
				for (let j = 4; j < 8; j++) {
					const txIn = new TxIn(`id${j}`, j, `sign${j}`);
					const txOut = new TxOut(`address${i}`, j * 10);
					txIns.push(txIn);
					txOuts.push(txOut);
				}

				const tx = new Transaction(`id${i + 1}}`, txIns, txOuts);
				txpool.push(tx);
				myUtxo.push(utxo);
			}
		});
		test("availableMyUtxoList are not part of transaction pool, there are no common things", () => {
			const everyTxIns: TxIn[] =
				TransactionPool.getEveryTxInsFromTxpool(txpool);
			const availableMyUtxoList: UnspentTxOutput[] =
				UnspentTxOutput.filterConsumedMyUtxoList(myUtxo, txpool);
			const commonList = [];
			availableMyUtxoList.forEach((utxo) =>
				everyTxIns.forEach((txIn) => {
					if (
						txIn.txOutId === utxo.txOutId &&
						txIn.txOutIndex === utxo.txOutIndex
					) {
						commonList.push(txIn);
					}
				})
			);
			expect(commonList.length).toBe(0);
		});
	});

	describe("getUtxosForSendingAmount function test", () => {
		let availableMyUtxoList: UnspentTxOutput[] = [];
		let sendingAmount: number = 10;
		beforeEach(() => {
			for (let i = 1; i < 5; i++) {
				const utxo = new UnspentTxOutput(`id${i}`, i, `addr${1}`, i * 2);
				availableMyUtxoList.push(utxo);
			}
			// availableMyUtxoList got 2, 4, 6, 8 ,10
		});
		test("If sending amount is 10, leftOver amount is 2 ((2+4+6) - 10) ", () => {
			const { utxoListToBeUsed, leftOverAmount } =
				UnspentTxOutput.getUtxosForSending(availableMyUtxoList, sendingAmount);

			if (utxoListToBeUsed !== null) {
				expect(leftOverAmount).toBe(2);
				expect(utxoListToBeUsed.length).toEqual(3);
			}
		});
	});
});
