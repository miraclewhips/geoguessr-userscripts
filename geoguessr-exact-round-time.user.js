// ==UserScript==
// @name         GeoGuessr Exact Round Time
// @description  Allows you to change the round time limit in increments smaller than 10s
// @version      1.0
// @author       miraclewhips
// @match        *://*.geoguessr.com/*
// @icon         https://www.google.com/s2/favicons?domain=geoguessr.com
// @grant        none
// @copyright    2022, miraclewhips (https://github.com/miraclewhips)
// @license      MIT
// @updateURL    https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-exact-round-time.user.js
// ==/UserScript==

const createButton = (text) => {
	let button = document.createElement('a');
	button.setAttribute('style', 'background:#7950e5; color:white; border:none; outline:none; font:inherit; cursor:pointer; font-weight:bold; padding:5px 0; width:26px; text-decoration:none;');
	button.innerText = text;

	return button;
}

const adjustTime = (t) => {
	let currentSettings = JSON.parse(localStorage.getItem('game-settings'));
	currentSettings.timeLimit = Math.max(0, currentSettings.timeLimit + t);
	localStorage.setItem('game-settings', JSON.stringify(currentSettings));
	window.dispatchEvent(new Event('storage'));
}

const init = () => {
	const observer = new MutationObserver(() => {
		const mapSelectLayout = document.querySelector('div[class^="play_section__"]');

		if(mapSelectLayout && !document.getElementById('has-timer-buttons')) {
			let label = mapSelectLayout.querySelectorAll('div[class^="game-options_options__"] label[class^="game-options_option__eCz9o"] div[class^="game-options_optionLabel__dJ_Cy"]')[0];

			if(label) {
				label.id = "has-timer-buttons";
				label.style.display = 'flex';
				label.style.justifyContent = 'center';
				label.style.alignItems = 'center';

				let labelText = document.createElement('span');
				labelText.textContent = 'Round time';
				labelText.style.margin = '0 10px';

				let buttonMinus = createButton('-');
				let buttonPlus = createButton('+');

				buttonMinus.onclick = () => {
					adjustTime(-1);
				}

				buttonPlus.onclick = () => {
					adjustTime(1);
				}

				label.innerHTML = '';
				label.append(buttonMinus);
				label.append(labelText);
				label.append(buttonPlus);

			}
		}
	});

	observer.observe(document.querySelector('#__next'), { subtree: true, childList: true });
}

document.onreadystatechange = () => {
	if (document.readyState === 'complete') {
		init();
	}
}