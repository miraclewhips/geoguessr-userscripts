// ==UserScript==
// @name         GeoGuessr Results Select All Players
// @description  Selects all players on the results screen
// @version      1.0
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
#mwrsapb {
	border: 1px solid rgba(255,255,255,0.2);
	display: inline-block;
	padding: 5px 10px;
	border-radius: 0.375rem;
	cursor: pointer;
}
#mwrsapb:hover,
#mwrsapb:active {
	border: 1px solid rgba(255,255,255,0.5);
}
`);

function selectAll() {
	const table = document.getElementById('mwrsap');
	if(!table) return;

	const rows = table.querySelectorAll('div[class^="results_row__"]');
	if(rows.length <= 1) return;

	for(let i = 1; i < rows.length; i++) {
		if(rows[i].className.includes('results_selected___')) continue;
		rows[i].click();
	}
}

function init() {
	const observer = new MutationObserver(async () => {
		const path = window.location.pathname;
		if(!path.includes('/results/')) return;

		const mapId = path.split('/')[2];
		if(!mapId) return;

		const table = document.querySelector('div[class^="results_table__"]');
		if(!table || table.id === 'mwrsap') return;

		table.id = 'mwrsap';

		const cell = table.querySelector('div[class*="results_headerRow__"] > div:first-child');
		if(!cell) return;

		const btn = document.createElement('div');
		btn.id = 'mwrsapb';
		btn.textContent = 'SELECT ALL PLAYERS';
		btn.addEventListener('click', selectAll);
		cell.appendChild(btn);
	});

	observer.observe(document.querySelector('#__next'), { subtree: true, childList: true });
}

init();