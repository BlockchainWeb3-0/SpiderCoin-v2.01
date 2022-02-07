import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./sidebar.scss";

const Sidebar = () => {
	const [isLogined, setIsLogined] = useState(false);
	const [navTextHidden, setNavTextHidden] = useState(true);
	
	const clickModeSwitch = () => {
		const modeText = document.querySelector(".mode-text");
		const modeSwitch = document.querySelector(".toggle-switch .switch");
		const body = document.querySelector("body");
		if (body === null || modeSwitch === null || modeText === null) {
			throw Error("Cannot find body or modeSwitch");
		}
		body.classList.toggle("dark");
		modeSwitch.classList.toggle("dark");
		if (body.classList.contains("dark")) {
			modeText.textContent = "Light Mode" 
		} else {
			modeText.textContent = "Dark Mode" 
		}
	};

	const clickNavToggleBtn = () => {
		const sidebar = document.querySelector(".sidebar");
		const navTextList = document.querySelectorAll(".nav-text");
		if (sidebar === null) {
			throw Error("Cannot find sidebar");
		}
		sidebar.classList.toggle("close");
		setNavTextHidden(!navTextHidden)
		navTextList.forEach((navText) => navText.hidden = navTextHidden);
	};
	
	const clickSearchBtn = () => {
		const sidebar = document.querySelector(".sidebar");
		const navTextList = document.querySelectorAll(".nav-text");

		if (sidebar === null) {
			throw Error("Cannot find sidebar");
		}
		sidebar.classList.remove("close");
		setNavTextHidden(false)
		navTextList.forEach((navText) => navText.hidden = navTextHidden);
	}

	const clickLoginBtn = () => {
		setIsLogined(!isLogined);
	}

	return (
		<>
			<nav className="sidebar close">
				<header>
					<div className="image-text">
						<span className="image">
							<img src="spider_logo_gray.png" alt="logo" />
						</span>

						<div className="text header-text">
							<span className="name">Spider Blockchain</span>
							<span className="profession">SOKURI_CODE</span>
						</div>
					</div>

					<i className="bx bx-chevron-right toggle" onClick={clickNavToggleBtn}></i>
				</header>

				<div className="menu-bar">
					<div className="menu">
						<li className="search-box" onClick={clickSearchBtn}>
							<i className="bx bx-search icon"></i>
							<input type="text" placeholder="Search..." />
						</li>
						<ul className="menu-links">
							<li className="nav-link">
								<Link to="/">
										<i className="bx bx-home-alt icon"></i>
										<span className="text nav-text" hidden={navTextHidden}>Dashboard</span>
								</Link>
							</li>

							<li className="nav-link">
								<Link to="/blocks">
									<i className="bx bx-cube icon"></i>
									<span className="text nav-text" hidden={navTextHidden}>Blocks</span>
								</Link>
							</li>

							<li className="nav-link">
								<Link to="/txpool">
									<i className="bx bx-bar-chart-alt-2 icon"></i>
									<span className="text nav-text" hidden={navTextHidden}>Transaction Pool</span>
								</Link>
							</li>

							<li className="nav-link">
								<Link to="/utxos">
									<i className="bx bx-pie-chart-alt icon"></i>
									<span className="text nav-text" hidden={navTextHidden}>Unspent Tx Output</span>
								</Link>
							</li>

							<li className="nav-link">
								<Link to="/wallet">
									<i className="bx bx-wallet icon"></i>
									<span className="text nav-text" hidden={navTextHidden}>Wallet</span>
								</Link>
							</li>
						</ul>
					</div>

					<div className="bottom-content">
						<li className="nav-link log-in-out" onClick={clickLoginBtn}>
							<Link to="">
								{isLogined ? <>
									<i className="bx bx-log-out icon log-out"></i>
									<span className="text nav-text" hidden={navTextHidden}>Logout</span>
								</> : <>
									<i className="bx bx-log-in icon log-in"></i>
									<span className="text nav-text" hidden={navTextHidden}>Login</span>
								</>
								}
							</Link>
						</li>

						<li className="mode">
							<div className="moon-sun">
								<i className="bx bx-moon icon moon"></i>
								<i className="bx bx-sun icon sun"></i>
							</div>
							<span className="mode-text text" >Dark Mode</span>

							<div className="toggle-switch" onClick={clickModeSwitch} >
								<span className="switch"></span>
							</div>
						</li>
					</div>
				</div>
			</nav>
		</>
	);
};

export default Sidebar;
