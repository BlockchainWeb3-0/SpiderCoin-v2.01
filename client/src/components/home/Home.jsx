import React, { useEffect, useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";

import "./home.scss";
import axios from "axios";
import { Button, ButtonGroup, TextField } from "@mui/material";

const Home = () => {
	const [isP2POn, setIsP2POn] = useState(false);
	const [peerPort, setPeerPort] = useState("6002");
	const [statePeers, setStatePeers] = useState([]);

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
	const addPeerParams = {
		method: "post",
		baseURL: `http://localhost:3001`,
		url: "/peer/list",
	};

	const p2pOn = async () => {
		const { data } = await axios.request(p2pOnParams);
    setIsP2POn(true);
		console.log(data);
	};
	const p2pOff = async () => {
    const { data } = await axios.request(p2pOffParams);
    setIsP2POn(false);
		console.log(data);
	};

  const getPeerList = async () => {
		const { data } = await axios.request(peerListParams);
		console.log(data);
    setStatePeers(data)
	};
  const addPeer = async () => {
		const { data } = await axios.request(addPeerParams);
		console.log(data);
	};
  
	const textOnChange = (e) => {
		setPeerPort(e.target.value);
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
					<ButtonGroup variant="outlined">
						<Button color="success" onClick={p2pOn} variant= {isP2POn ? "contained" : "outlined"}>
							On
						</Button>
						<Button color="error" onClick={p2pOff} variant= {!isP2POn ? "contained" : "outlined"}>
							Off
						</Button>
					</ButtonGroup>
					<Typography variant="body1" className="contents"></Typography>
				</CardContent>
			</Card>

			<Card sx={{ minWidth: 275 }}>
				<CardContent>
					<Typography variant="h5" component="div">
						Peers
					</Typography>
					<br />
					<div className="peer_getPeers">
						<Button variant="outlined" onClick={getPeerList}>Get Peers</Button>
						{statePeers.join(" , ")}
					</div>

					<div className="peer_textField">
						<TextField
							required
							label="Peer Port default : 6002"
							variant="standard"
							helperText="Using space to add multiple peers (ex. 6002 6003)"
							name="port"
							onChange={textOnChange}
						/>
						<Button variant="outlined" onClick={addPeer}>Add Peers</Button>
					</div>
					<Typography variant="body1" className="contents"></Typography>
				</CardContent>
			</Card>
		</div>
	);
};

export default Home;
