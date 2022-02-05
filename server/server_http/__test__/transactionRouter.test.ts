import axios from "axios";
import Transaction from "../../blockchain/transaction/transaction";
import UnspentTxOutput from "../../blockchain/transaction/unspentTxOutput";
import Wallet from "../../blockchain/wallet/wallet";

describe("Transaction Router test", () => {
	let receiverAddress: string;
	let sendingAmount: number;
	let senderAddress: string;
	let privateKey: string;

	let allUtxoList: UnspentTxOutput[];
	beforeAll(async () => {
		// create test utxo list
		const createUtxoParams: object = {
			method: "get",
			baseURL: "http://localhost:3001",
			url: "/utxos/create/test",
		};
		await axios.request(createUtxoParams);

		const getUtxoParams: object = {
			method: "get",
			baseURL: "http://localhost:3001",
			url: "/utxos",
		};
		const getUtxoResult = await axios.request(getUtxoParams);
		allUtxoList = getUtxoResult.data;
	});
	beforeEach(() => {
		receiverAddress = Wallet.generatePrivatePublicKeys().publicKey;
		senderAddress = Wallet.getPulicKeyFromWallet();
		privateKey = Wallet.getPrivateKeyFromWallet();
		sendingAmount = 10;
	});

	// * create new transaction
	describe("transaction router test", () => {
		test("Post: /transaction/create", async () => {
			const params: object = {
				method: "post",
				baseURL: "http://localhost:3001",
				url: "/transaction/create",
				data: {
					receiverAddress,
					sendingAmount,
					senderAddress,
					privateKey,
				},
			};
			const result = await axios.request(params);
			const tx: Transaction = result.data;
			console.log(tx);

			expect(Transaction.isValidTx(tx, allUtxoList)).toBe(true);
			expect(tx?.txOuts[0].address).toBe(receiverAddress);
			expect(tx?.txOuts[0].amount).toBe(10);
		});
	});

	afterAll(async () => {
		// clear utxo list
		const params: object = {
			method: "get",
			baseURL: "http://localhost:3001",
			url: "/utxos/clear/test",
		};
		await axios.request(params);
	});
});
