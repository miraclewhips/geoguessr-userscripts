// ==UserScript==
// @name         GeoGuessr Results Select All Players
// @description  Selects all players on the results screen
// @version      1.4
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

	const rows = table.querySelectorAll('div[class^="coordinate-results_row__"],'
										+'div[class*="draggable-coordinate-results_leftCol"] > div[class^="draggable-coordinate-results_rowItem__"]');
	if(rows.length === 0) return;

	for(let i = 0; i < rows.length; i++) {
		if(rows[i].className.includes('coordinate-results_selected__') === enable) continue;
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

		const table = document.querySelector('div[class^="coordinate-results_table__"],'
											 +'div[class^="draggable-coordinate-results_table__"]');
		if(!table || table.id === 'mwrsap') return;

		table.id = 'mwrsap';

		const cell = table.querySelector('div[class*="coordinate-results_headerRow"] > div:first-child,'
										 + 'div[class*="draggable-coordinate-results_leftCol"] > div:first-child');
		if(!cell) return;

		const btnOuter = document.createElement('div');

		const btnAll = document.createElement('div');
		btnAll.className = 'mwrsap-button';
		btnAll.textContent = 'SELECT ALL';
		btnAll.addEventListener('click', selectAll);
		btnOuter.appendChild(btnAll);

		const btnNone = document.createElement('div');
		btnNone.className = 'mwrsap-button';
		btnNone.textContent = 'DESELECT ALL';
		btnNone.addEventListener('click', selectNone);
		btnOuter.appendChild(btnNone);

		cell.appendChild(btnOuter);
	});

	if(document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', () => {
			observer.observe(document.querySelector('#__next'), { subtree: true, childList: true });
		});
	}else{
		observer.observe(document.querySelector('#__next'), { subtree: true, childList: true });
	}
}

init();
