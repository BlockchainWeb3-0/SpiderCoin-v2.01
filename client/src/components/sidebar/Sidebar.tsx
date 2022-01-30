import React, { useState } from "react";
import "./sidebar.scss";

const Sidebar = () => {
	const [darkMode, setDarkMode] = useState("Dark Mode");
	const toggle = document.querySelector(".toggle");
	const searchBtn = document.querySelector(".search-box");
	
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
		if (sidebar === null) {
			throw Error("Cannot find sidebar");
		}
		sidebar.classList.toggle("close");
	};
	
	const clickSearchBtn = () => {
		const sidebar = document.querySelector(".sidebar");
		if (sidebar === null) {
			throw Error("Cannot find sidebar");
		}
		sidebar.classList.remove("close");
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
							<span className="profession">Study how it works</span>
						</div>
					</div>

					<i onClick={clickNavToggleBtn} className="bx bx-chevron-right toggle"></i>
				</header>

				<div className="menu-bar">
					<div className="menu">
						<li onClick={clickSearchBtn} className="search-box">
							<i className="bx bx-search icon"></i>
							<input type="text" placeholder="Search..." />
						</li>
						<ul className="menu-links">
							<li className="nav-link">
								<a href="#">
									<i className="bx bx-home-alt icon"></i>
									<span className="text nav-text">Dashboard</span>
								</a>
							</li>
							<li className="nav-link">
								<a href="#">
									<i className="bx bx-bar-chart-alt-2 icon"></i>
									<span className="text nav-text">Revenue</span>
								</a>
							</li>
							<li className="nav-link">
								<a href="#">
									<i className="bx bx-bell icon"></i>
									<span className="text nav-text">Notifications</span>
								</a>
							</li>
							<li className="nav-link">
								<a href="#">
									<i className="bx bx-pie-chart-alt icon"></i>
									<span className="text nav-text">Analytics</span>
								</a>
							</li>
							<li className="nav-link">
								<a href="#">
									<i className="bx bx-cube icon"></i>
									<span className="text nav-text">Blocks</span>
								</a>
							</li>
							<li className="nav-link">
								<a href="#">
									<i className="bx bx-wallet icon"></i>
									<span className="text nav-text">Wallets</span>
								</a>
							</li>
						</ul>
					</div>

					<div className="bottom-content">
						<li className="nav-link">
							<a href="#">
								<i className="bx bx-log-out icon"></i>
								<span className="text nav-text">Logout</span>
							</a>
						</li>

						<li className="mode">
							<div className="moon-sun">
								<i className="bx bx-moon icon moon"></i>
								<i className="bx bx-sun icon sun"></i>
							</div>
							<span className="mode-text text">Dark Mode</span>

							<div onClick={clickModeSwitch} className="toggle-switch">
								<span className="switch"></span>
							</div>
						</li>
					</div>
				</div>
			</nav>

			<section className="home">
				<div className="text">Dashboard</div>
			</section>
		</>
	);
};

export default Sidebar;
