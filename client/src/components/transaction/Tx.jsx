import React from "react";
import {
	Accordion,
	AccordionDetails,
	AccordionSummary,
	Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import TxIn from "./TxIn";
import TxOut from "./TxOut";
import "./tx.scss"

const Tx = ({ tx, index }) => {
	const [expanded, setExpanded] = React.useState(false);

	const handleChange = (panel) => (event, isExpanded) => {
		setExpanded(isExpanded ? panel : false);
	};

	return (
		<>
			<Accordion
				expanded={expanded === `panel${index}`}
				onChange={handleChange(`panel${index}`)}
				className="tx-container"
			>
				<AccordionSummary expandIcon={<ExpandMoreIcon />}>
					<Typography sx={{ width: "33%", flexShrink: 0, fontWeight: "bold" }}>
						Transaction {index}
					</Typography>
					<Typography sx={{ color: "text.secondary" }}></Typography>
					<span className="txId"><b>ID : </b>{tx.id}</span>
				</AccordionSummary>
				<AccordionDetails className="tx-contents">
					{/* <div>
						<h4>ID</h4>
						<span className="txId">{tx.id}</span>
					</div> */}
					<div>
						<h4>TxIns</h4>
						{tx.txIns.map((txIn, index) => (
							<TxIn txIn={txIn} index={index} key={index} />
						))}
					</div>

					<div>
						<h4>TxOuts</h4>
						{tx.txOuts.map((txOut, index) => (
							<TxOut txOut={txOut} index={index} key={index} />
						))}
					</div>
				</AccordionDetails>
			</Accordion>
		</>
	);
};

export default Tx;
