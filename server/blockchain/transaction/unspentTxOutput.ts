import { Transaction, TxIn } from "./transaction";

/**
 * @brief Unspent Transaction Input class
 * @txOutId
 * - type: string
 * - description: Transaction's id => Unspent Transaction Out's Id
 * @txOutIndex
 * - type: number
 * - description: Unspent Transaction Out's Index
 * @address
 * - type: string
 * - description: receiver's wallet address
 * @amount
 * - type: number
 * - description: how much sending coins
 */
export default class UnspentTxOutput {
	public readonly txOutId: string;
	public readonly txOutIndex: number;
	public readonly address: string;
	public readonly amount: number;

	constructor(
		txOutId: string,
		txOutIndex: number,
		address: string,
		amount: number
	) {
		this.txOutId = txOutId;
		this.txOutIndex = txOutIndex;
		this.address = address;
		this.amount = amount;
	}

	static findUtxo = (
		txIn: TxIn,
		utxoList: UnspentTxOutput[]
	): UnspentTxOutput | undefined => {
		return utxoList.find(
			(utxo) =>
				utxo.txOutId === txIn.txOutId && utxo.txOutIndex === txIn.txOutIndex
		);
	};

	static filterConsumedUtxoList = (
		utxoList: UnspentTxOutput[],
		txpool: Transaction[]
	) => {
    const txIns: TxIn[] = txpool.map(tx => tx.txIns).reduce((a,b) => a.concat(b), []);
    const consumedUtxoList: UnspentTxOutput[] = [];
    utxoList.forEach((utxo) => {
      //TODO txpool에 있는 utxo는 제외해야함
    })
  };
}
