// ==UserScript==
// @name         GeoGuessr World Score Reference
// @description  See approximately what a round score would have been on a world map (while playing other maps e.g. country-specific maps)
// @version      1.0
// @author       miraclewhips
// @match        *://*.geoguessr.com/*
// @run-at       document-start
// @require      https://miraclewhips.dev/geoguessr-event-framework/geoguessr-event-framework.min.js?v=7
// @icon         https://www.google.com/s2/favicons?domain=geoguessr.com
// @grant        unsafeWindow
// @grant        GM_addStyle
// @copyright    2024, miraclewhips (https://github.com/miraclewhips)
// @license      MIT
// @downloadURL  https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-world-score-reference.user.js
// @updateURL    https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-world-score-reference.user.js
// ==/UserScript==



/* ############################################################################### */
/* ##### DON'T MODIFY ANYTHING BELOW HERE UNLESS YOU KNOW WHAT YOU ARE DOING ##### */
/* ############################################################################### */

GM_addStyle(`
div[class^="round-result_pointsIndicatorWrapper__"] {
	position: relative;
}

#mw-wsr {
	position: absolute;
	top: 100%;
	left: 50%;
	margin-top: 5px;
	transform: translateX(-50%);
	color: rgba(255,255,255,0.5);
	white-space: nowrap;
	font-size: 12px;
	text-transform: uppercase;
}
`);

if(!GeoGuessrEventFramework) {
	throw new Error('GeoGuessr World Score Reference requires GeoGuessr Event Framework (https://github.com/miraclewhips/geoguessr-event-framework). Please include this before you include GeoGuessr World Score Reference.');
}

function getScoreFromDistance(metres) {
	let boundSize = 18700000;
	let points = 5000;
	let perfectTolerance = Math.max(25, boundSize * 0.00001);

	
	if(metres > perfectTolerance) {
		points = Math.round(Math.pow((1 - metres/boundSize), 10) * 5000);
	}

	return points;
}

GeoGuessrEventFramework.init().then(GEF => {
	GEF.events.addEventListener('round_end', (state) => {
		const round = state.detail.rounds[state.detail.rounds.length - 1];
		const distance = round?.distance?.meters?.amount * (round?.distance?.meters?.unit === 'km' ? 1000 : 1);
		if(isNaN(distance)) return;
		
		const score = getScoreFromDistance(distance);

		const container = document.querySelector(`div[class^="round-result_pointsIndicatorWrapper__"]`);
		if(!container || document.getElementById('mw-wsr')) return;

		const text = document.createElement('div');
		text.id = 'mw-wsr';
		text.textContent = `World Score Approx: ${score.toLocaleString()}`;
		container.appendChild(text);
	});
});