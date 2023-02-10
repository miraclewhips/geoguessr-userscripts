// ==UserScript==
// @name         GeoGuessr Team Duels Bot Instaguess
// @description  Use in conjunction with a bot account to instaguess on team duels
// @version      1.0
// @author       miraclewhips
// @match        *://*.geoguessr.com/*
// @icon         https://www.google.com/s2/favicons?domain=geoguessr.com
// @grant        none
// @copyright    2022, miraclewhips (https://github.com/miraclewhips)
// @license      MIT
// @downloadURL    https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-team-duels-bot-instaguess.user.js
// @updateURL    https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-team-duels-bot-instaguess.user.js
// ==/UserScript==

const SECONDS_TO_WAIT_BEFORE_GUESSING = 0;



/* ############################################################################### */
/* ##### DON'T MODIFY ANYTHING BELOW HERE UNLESS YOU KNOW WHAT YOU ARE DOING ##### */
/* ############################################################################### */

var CURRENT_ROUND = null;

const guess = (id) => {
	if(CURRENT_ROUND && !isNaN(CURRENT_ROUND)) {
		fetch(`https://game-server.geoguessr.com/api/duels/${id}/guess`, {
			"headers": {
				"accept": "*/*",
				"accept-language": "en-US,en;q=0.9",
				"cache-control": "no-cache",
				"content-type": "application/json",
				"pragma": "no-cache"
			},
			"referrer": "https://www.geoguessr.com/",
			"referrerPolicy": "strict-origin-when-cross-origin",
			"body": "{\"lat\":-85,\"lng\":65,\"roundNumber\":" + CURRENT_ROUND + "}",
			"method": "POST",
			"mode": "cors",
			"credentials": "include"
		});
	}
}

const init = () => {
	var ROUND_NUMBER_VISIBLE = false;

	const observer = new MutationObserver(() => {
		if(location.pathname.indexOf('/team-duels/') !== 0) return;

		const roundNumber = document.querySelector('p[class*="new-round_roundNumber__"]');

		if(ROUND_NUMBER_VISIBLE && !roundNumber) {
			ROUND_NUMBER_VISIBLE = false;

			setTimeout(() => {
				guess(location.pathname.split('/team-duels/')[1]);
			}, SECONDS_TO_WAIT_BEFORE_GUESSING * 1000);
		}else if(!ROUND_NUMBER_VISIBLE && roundNumber) {
			CURRENT_ROUND = parseInt(roundNumber.innerText.toLowerCase().replace('round ', ''));
			ROUND_NUMBER_VISIBLE = true;
		}
	});

	observer.observe(document.querySelector('#__next'), { subtree: true, childList: true });
}

init();