import React from "react";
import {
	Accordion,
	AccordionDetails,
	AccordionSummary,
	Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const Utxo = ({ utxo, index }) => {
	const [expanded, setExpanded] = React.useState(false);

	const handleChange = (panel) => (event, isExpanded) => {
		setExpanded(isExpanded ? panel : false);
	};

	return (
		<>
			<Accordion
				expanded={expanded === `panel${index}`}
				onChange={handleChange(`panel${index}`)}
				className="utxos-container"
			>
				<AccordionSummary expandIcon={<ExpandMoreIcon />}>
					<Typography sx={{ width: "33%", flexShrink: 0, fontWeight: "bold" }}>
						UTXO {index}
					</Typography>
					<Typography sx={{ color: "text.secondary" }}></Typography>
				</AccordionSummary>
				<AccordionDetails className="utxoList-contents">
						<div className="elem">
							<b className="utxo-title">utxo{index}</b>
						</div>
						<div className="elem">
							<b>address : </b> {utxo.address}
						</div>
						<div className="elem">
							<b>amount : </b> {utxo.amount}
						</div>
						<div className="elem">
							<b>txOutId : </b> {utxo.txOutId}
						</div>
						<div className="elem">
							<b>txOutIndex : </b> {utxo.txOutIndex}
						</div>
				</AccordionDetails>
			</Accordion>
		</>
	);
};

export default Utxo;
