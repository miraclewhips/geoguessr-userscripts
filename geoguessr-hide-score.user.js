// ==UserScript==
// @name         GeoGuessr Hide Score
// @description  Hides your score and guesses while playing the game and only shows it at the end
// @version      1.0
// @author       miraclewhips
// @match        *://*.geoguessr.com/*
// @icon         https://www.google.com/s2/favicons?domain=geoguessr.com
// @grant        GM_addStyle
// @copyright    2024, miraclewhips (https://github.com/miraclewhips)
// @license      MIT
// @downloadURL  https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-hide-score.user.js
// @updateURL    https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-hide-score.user.js
// ==/UserScript==

/* ############################################################################### */
/* ##### DON'T MODIFY ANYTHING BELOW HERE UNLESS YOU KNOW WHAT YOU ARE DOING ##### */
/* ############################################################################### */

GM_addStyle(`
	body.mwhs-should-hide-scores div[class^="status_section__"][data-qa="score"],
	body.mwhs-should-hide-scores div[class^="round-result_distanceIndicatorWrapper___"],
	body.mwhs-should-hide-scores div[class^="round-result_pointsIndicatorWrapper__"],
	body.mwhs-should-hide-scores div[id^="streak-score-panel-summary-"],
	body.mwhs-should-hide-scores div[id^="streak-counter-panel-"] {
		display: none !important;
	}
	
	body.mwhs-should-hide-scores div[class^="result-layout_root__"] {
		background-color: #000 !important;
	}

	body.mwhs-should-hide-scores div[class^="result-layout_root__"]:after {
		content: 'results hidden';
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		color: #555;
		font-style: italic;
	}

	body.mwhs-should-hide-scores div[class^="coordinate-result-map_map__"] {
		visibility: hidden !important;
	}
`);

const init = () => {
	const observer = new MutationObserver(() => {
		const gameRoot = document.querySelector(`div[class^="in-game_root__"]`);
		const finalResults = document.querySelector(`div[class^="result-overlay_overlay__"]`);
		document.body.classList.toggle(`mwhs-should-hide-scores`, gameRoot && !finalResults);
	});

	observer.observe(document.body, { subtree: true, childList: true });
}

init();