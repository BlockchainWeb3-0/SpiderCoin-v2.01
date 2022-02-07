import React, { useEffect, useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";

import "./wallet.scss";
import axios from "axios";
import Utxo from "../utxos/Utxo";
import CreateTx from "../transaction/CreateTx";

const Wallet = () => {
	const [address, setAddress] = useState("");
	const [privatekey, setPrivatekey] = useState("");
	const [balance, setBalance] = useState(0);
	const [utxoList, setUtxoList] = useState([]);

	useEffect(() => {
		getAddress();
		getPrivatekey();
		getBalance();
	}, []);

	useEffect(() => {
		getUtxoList();
	}, [address]);

	const addressParams = {
		method: "get",
		baseURL: `http://localhost:3001`,
		url: "/wallet/myaddress",
	};
	const privatekeyParams = {
		method: "get",
		baseURL: `http://localhost:3001`,
		url: "/wallet/myprivatekey",
	};
	const balanceParams = {
		method: "get",
		baseURL: `http://localhost:3001`,
		url: "/wallet/mybalance",
	};
	const utxosParams = {
		method: "get",
		baseURL: `http://localhost:3001`,
		url: `/utxos/${address}`,
	};

	const getAddress = async () => {
		const { data } = await axios.request(addressParams);
		setAddress(data);
		console.log(data);
	};
	const getPrivatekey = async () => {
		const { data } = await axios.request(privatekeyParams);
		setPrivatekey(data);
		console.log(data);
	};
	const getBalance = async () => {
		const { data } = await axios.request(balanceParams);
		setBalance(data.balance);
		console.log(data);
	};

	const getUtxoList = async () => {
		const { data } = await axios.request(utxosParams);
		setUtxoList(data);
		console.log(data);
	};

	return (
		<div className="wallet-wrap">
			<div className="wallet-container">
				<div className="title">My Wallet</div>
				<Card sx={{ minWidth: 275 }}>
					<CardContent>
						<Typography variant="h5" component="div">
							Address
						</Typography>
						<br />
						<Typography variant="body1" className="contents">
							{address}
						</Typography>
					</CardContent>
				</Card>
				<Card sx={{ minWidth: 275 }}>
					<CardContent>
						<Typography variant="h5" component="div">
							Private Key
						</Typography>
						<br />
						<Typography variant="body1" className="contents">
							{privatekey}
						</Typography>
					</CardContent>
				</Card>
				<Card sx={{ minWidth: 275 }}>
					<CardContent>
						<Typography variant="h5" component="div">
							Balance
						</Typography>
						<br />
						<Typography variant="body1" className="contents">
							{balance}
						</Typography>
					</CardContent>
				</Card>
				<Card sx={{ minWidth: 275 }}>
					<CardContent>
						<Typography variant="h5" component="div">
							Create Transaction
						</Typography>
						<CreateTx />
						<br />
						<Typography variant="body1" className="contents"></Typography>
					</CardContent>
				</Card>
			</div>
			<div className="utxoList-container">
				<div className="title">My Unspent Transaction Output List</div>
				<div className="total">total counts : {utxoList.length}</div>
				<div className="total">
					total amount :{" "}
					{utxoList.map((utxo) => utxo.amount).reduce((a, b) => a + b, 0)}
				</div>
				<div>
					{utxoList.map((utxo, index) => (
						<Utxo utxo={utxo} index={index} key={index} />
					))}
				</div>
			</div>
		</div>
	);
};

export default Wallet;
