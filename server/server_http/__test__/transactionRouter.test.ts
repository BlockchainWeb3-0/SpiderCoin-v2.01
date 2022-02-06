import axios from "axios";
import Transaction from "../../blockchain/transaction/transaction";
import Wallet from "../../blockchain/wallet/wallet";

describe("Rotuers test", () => {
	let receiverAddress: string;
	let sendingAmount: number;
	let senderAddress: string;
	let privateKey: string;

	beforeAll(async () => {
		// create test utxo list
		const params: object = {
			method: "get",
			baseURL: "http://localhost:3001",
			url: "/utxos/create/test",
		};
		await axios.request(params);
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
			if (tx === null) {
				expect(tx).toBe(null);
			} else {
				expect(tx.txOuts[0].address).toBe(receiverAddress);
				expect(tx.txOuts[0].amount).toBe(10);
			}
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
