import React, { useEffect, useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";

import "./home.scss";
import axios from "axios";
import { Button } from "@mui/material";

const Home = () => {
	const [address, setAddress] = useState("");
	const [privatekey, setPrivatekey] = useState("");

	useEffect(() => {
		getPeerList();
	}, []);

	useEffect(() => {}, [address]);

	const p2pOnParams = {
		method: "get",
		baseURL: `http://localhost:3001`,
		url: "/peer/on",
	};
	const p2pOffParams = {
		method: "get",
		baseURL: `http://localhost:3001`,
		url: "/peer/off",
	};
	const peerListParams = {
		method: "get",
		baseURL: `http://localhost:3001`,
		url: "/peer/list",
	};

	const getPeerList = async () => {
		const { data } = await axios.request(peerListParams);
		setAddress(data);
		console.log(data);
	};

	return (
		<div className="wallet-container">
			<div className="title">Home Home Sweet Home</div>

			<Card sx={{ minWidth: 275 }}>
				<CardContent>
					<Typography variant="h5" component="div">
						P2P Server
					</Typography>
					<br />
					<Typography variant="body1" className="contents"></Typography>
				</CardContent>
			</Card>
		</div>
	);
};

export default Home;
