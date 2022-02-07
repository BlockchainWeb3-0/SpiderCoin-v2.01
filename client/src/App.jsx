import React from 'react';
import { Route, Routes } from 'react-router';
import './App.scss';
import Blocks from './components/blocks/Blocks';
import Home from './components/home/Home';
import Main from './components/main/Main';
import Sidebar from "./components/sidebar/Sidebar"
import Txpool from './components/txpool/Txpool';
import UtxoList from './components/utxos/UtxoList';
import Wallet from './components/wallet/Wallet';

function App() {
  return (
		<div className="App">
			<Sidebar />
			<Main>
				<Routes>
					<Route path="/">
						<Route index element={<Home/>}></Route>
						<Route path="blocks" element={<Blocks/>}></Route>
						<Route path="txpool" element={<Txpool/>}></Route>
						<Route path="utxos" element={<UtxoList/>}></Route>
						<Route path="wallet" element={<Wallet/>}></Route>
					</Route>
				</Routes>
			</Main>
		</div>
	);
}

export default App;
