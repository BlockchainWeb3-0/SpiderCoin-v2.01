import axios from "axios";
import UnspentTxOutput from "../../blockchain/transaction/unspentTxOutput";
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
		receiverAddress =
			"04d2d156b54c47d0ad7acca55ad5e484eb0191a6d783e7473037d4d9f4af66455ee937826090e71dbbacc0a7e7540d2850f92812bce1f87180cac3900541794274";
		senderAddress = Wallet.getPulicKeyFromWallet();
		privateKey = Wallet.getPrivateKeyFromWallet();
		sendingAmount = 10;
	});

	// * get specific address's utxo list from whole utxo list
	describe("utxos Router test", () => {
		test("GET : /mine/:address", async () => {
			const params: object = {
				method: "get",
				baseURL: "http://localhost:3001",
				url: `/utxos/mine/${senderAddress}`,
			};
			const result = await axios.request(params);
			const myUtxoList: UnspentTxOutput[] = result.data;

			for (let i = 0; i < myUtxoList.length; i++) {
				expect(myUtxoList[i].address).toBe(senderAddress);
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
