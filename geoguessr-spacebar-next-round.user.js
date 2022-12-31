// ==UserScript==
// @name         GeoGuessr Spacebar Next Round
// @description  Press spacebar to quickly start next round, or restart next game etc
// @version      1.0
// @author       miraclewhips
// @match        *://*.geoguessr.com/*
// @icon         https://www.google.com/s2/favicons?domain=geoguessr.com
// @grant        none
// @copyright    2022, miraclewhips (https://github.com/miraclewhips)
// @license      MIT
// @downloadURL    https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-spacebar-next-round.user.js
// @updateURL    https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-spacebar-next-round.user.js
// ==/UserScript==

const validPaths = ['maps', 'game', 'country-streak', 'us-state-streak', 'daily-challenges', 'challenge'];

document.addEventListener('keypress', e => {
	if (e.code === 'Space') {
		const path = document.location.pathname;
		if (validPaths.every(p => !RegExp(`\/${p}.*`).test(path))) return;

		if(document.activeElement.tagName === 'INPUT') return;
		
		const button = document.querySelector('*[class*="button_variantPrimary"]');
		console.log(button)
		if (button && !button.parentNode.classList.contains('guess-map__guess-button')) {
			e.preventDefault();
			button.click();
		}
	}
});