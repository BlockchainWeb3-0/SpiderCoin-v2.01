import React from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import './Block.scss';
import Tx from '../transaction/Tx';


const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: "80%",
  boxShadow: 24,
};

const Block = ({ blockInfo }) => {
	const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
	
	console.log(blockInfo.data);
  return (
		<div className="block-container">
			<div className="block" onClick={handleOpen}>
				<div className="cube">
					{blockInfo.header.index}
					<div>
						<div></div>
						<div></div>
						<div></div>
						<div></div>
						<div></div>
						<div></div>
					</div>
				</div>
			</div>
			<div className="block-contents">
				<div>
					<b>index</b> : {blockInfo.header.index}
				</div>
				<div>
					<b>prevHash</b> : {blockInfo.header.prevHash}
				</div>
				<div>
					<b>merkleRoot</b> : {blockInfo.header.merkleRoot}
				</div>
				<div>
					<b>timestamp</b> : {blockInfo.header.timestamp}
				</div>
				<div className="hash">
					<b>hash</b> : {blockInfo.hash}
				</div>
				<div>
					<b>difficulty</b> : {blockInfo.header.difficulty}
				</div>
				<div>
					<b>nonce</b> : {blockInfo.header.nonce}
				</div>
			</div>
			<Modal open={open} onClose={handleClose} disableScrollLock={false}>
				<Box sx={style}>
					{blockInfo.data.map((tx, index) =>
						<Tx tx={tx} index={index} key={tx.id} />
					)}
				</Box>
			</Modal>
		</div>
	);
};

export default Block;
