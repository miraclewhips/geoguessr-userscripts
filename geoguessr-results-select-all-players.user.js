// ==UserScript==
// @name         GeoGuessr Results Select All Players
// @description  Selects all players on the results screen
// @version      1.1
// @author       miraclewhips
// @match        *://*.geoguessr.com/*
// @icon         https://www.google.com/s2/favicons?domain=geoguessr.com
// @grant        GM_addStyle
// @copyright    2024, miraclewhips (https://github.com/miraclewhips)
// @license      MIT
// @downloadURL    https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-results-select-all-players.user.js
// @updateURL    https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-results-select-all-players.user.js
// ==/UserScript==



/* ############################################################################### */
/* ##### DON'T MODIFY ANYTHING BELOW HERE UNLESS YOU KNOW WHAT YOU ARE DOING ##### */
/* ############################################################################### */

GM_addStyle (`
.mwrsap-button {
	border: 1px solid rgba(255,255,255,0.2);
	display: inline-block;
	padding: 5px 10px;
	border-radius: 0.375rem;
	cursor: pointer;
}
.mwrsap-button:hover,
.mwrsap-button:active {
	border: 1px solid rgba(255,255,255,0.5);
}
`);

function select(enable) {
	const table = document.getElementById('mwrsap');
	if(!table) return;

	const rows = table.querySelectorAll('div[class^="results_row__"]');
	if(rows.length <= 1) return;

	for(let i = 1; i < rows.length; i++) {
		if(rows[i].className.includes('results_selected__') === enable) continue;
		rows[i].click();
	}
}

function selectAll() {
	select(true);
}

function selectNone() {
	select(false);
}

function init() {
	const observer = new MutationObserver(() => {
		const path = window.location.pathname;
		if(!path.includes('/results/')) return;

		const table = document.querySelector('div[class^="results_table__"]');
		if(!table || table.id === 'mwrsap') return;

		table.id = 'mwrsap';

		const cell = table.querySelector('div[class*="results_headerRow__"] > div:first-child');
		if(!cell) return;

		const btnAll = document.createElement('div');
		btnAll.className = 'mwrsap-button';
		btnAll.textContent = 'SELECT ALL';
		btnAll.addEventListener('click', selectAll);
		cell.appendChild(btnAll);

		const btnNone = document.createElement('div');
		btnNone.className = 'mwrsap-button';
		btnNone.textContent = 'DESELECT ALL';
		btnNone.addEventListener('click', selectNone);
		cell.appendChild(btnNone);
	});

	observer.observe(document.querySelector('#__next'), { subtree: true, childList: true });
}

init();
