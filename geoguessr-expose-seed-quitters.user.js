// ==UserScript==
// @name         GeoGuessr Expose Seed Quitters
// @description  Shows all players on the challenge results screen, even if they didn't complete all 5 rounds
// @version      1.2
// @author       miraclewhips
// @match        *://*.geoguessr.com/*
// @run-at       document-start
// @icon         https://www.google.com/s2/favicons?domain=geoguessr.com
// @grant        unsafeWindow
// @grant        GM_addStyle
// @copyright    2024, miraclewhips (https://github.com/miraclewhips)
// @license      MIT
// @downloadURL  https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-expose-seed-quitters.user.js
// @updateURL    https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-expose-seed-quitters.user.js
// ==/UserScript==

GM_addStyle(`
	div[class^="coordinate-results_table__"] div[class^="coordinate-results_row__"] div[class^="coordinate-results_column__"]:last-of-type {
		grid-column-start: 7;
	}
`);

const THE_WINDOW = unsafeWindow || window;
const default_fetch = THE_WINDOW.fetch;
THE_WINDOW.fetch = (function () {
	return async function (...args) {
		const url = args[0].toString();
		if(url.includes(`geoguessr.com/api/v3/results/highscores/`) && url.includes(`&minRounds=`) && !url.endsWith(`&minRounds=1`)) {
			args[0] = url.replace(/&minRounds=(\d+)/, `&minRounds=1`).replace(/&limit=(\d+)/, `&limit=9999`);
			let result = await default_fetch.apply(THE_WINDOW, args);
			const data = await result.clone().json();

			data.items.sort((a,b) => {
				const diff = Number(b.game.player.totalScore.amount)-Number(a.game.player.totalScore.amount);
				if(diff != 0) return diff;
				return a.game.player.totalTime-b.game.player.totalTime;
			});

			result.json = () => data;
			return result;
		}

		return default_fetch.apply(THE_WINDOW, args);
	};
})();
