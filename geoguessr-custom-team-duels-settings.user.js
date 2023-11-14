// ==UserScript==
// @name         GeoGuessr Custom Team Duels Settings
// @description  Allows you to enter a custom value for certain team duels settings
// @version      1.0
// @author       miraclewhips
// @match        *://*.geoguessr.com/*
// @icon         https://www.google.com/s2/favicons?domain=geoguessr.com
// @grant        GM_addStyle
// @copyright    2022, miraclewhips (https://github.com/miraclewhips)
// @license      MIT
// @downloadURL  https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-custom-team-duels-settings.user.js
// @updateURL    https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-custom-team-duels-settings.user.js
// ==/UserScript==

/* ############################################################################### */
/* ##### DON'T MODIFY ANYTHING BELOW HERE UNLESS YOU KNOW WHAT YOU ARE DOING ##### */
/* ############################################################################### */

GM_addStyle (`
.mwcs-button {
	display: inline-block;
	padding: 2px 4px;
	background: var(--ds-color-purple-50);
	color: #fff;
	font-size: 10px;
	border-radius: 4px;
	margin-left: 10px;
	cursor: pointer;
}
`);

function clickedButton(e) {
	const settings = {};
	settings[e.target.dataset.id] = window.prompt('Enter custom value:');

	fetch("https://www.geoguessr.com/api/v4/parties/v2/game-settings", {
		"headers": {
			"content-type": "application/json",
		},
		"body": JSON.stringify(settings),
		"method": "PUT",
		"mode": "cors",
		"credentials": "include"
	});
}

function addButton(parent, id) {
	if(document.getElementById(`mwcs-${id}`)) return;

	let button = document.createElement('span');
	button.id = `mwcs-${id}`;
	button.className = 'mwcs-button';
	button.dataset.id = id;
	button.textContent = 'CUSTOM';
	button.addEventListener('click', clickedButton);

	parent.appendChild(button);
}

const init = () => {
	const observer = new MutationObserver(() => {
		const labels = document.querySelectorAll('div[class^="settings-modal_columns__"] div[class^="slider-option_label__"]');

		for(const l of labels) {
			if(l.textContent.trim() === 'Timer after guess') {
				addButton(l, 'timeAfterGuess');
			}
		}
	});

	observer.observe(document.querySelector('#__next'), { subtree: true, childList: true });
}

init();