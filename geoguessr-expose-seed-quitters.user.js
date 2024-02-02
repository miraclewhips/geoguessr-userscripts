// ==UserScript==
// @name         GeoGuessr Expose Seed Quitters
// @description  Shows all players on the challenge results screen, even if they didn't complete all 5 rounds
// @version      1.0
// @author       miraclewhips
// @match        *://*.geoguessr.com/*
// @run-at       document-start
// @icon         https://www.google.com/s2/favicons?domain=geoguessr.com
// @grant        unsafeWindow
// @copyright    2024, miraclewhips (https://github.com/miraclewhips)
// @license      MIT
// @downloadURL  https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-expose-seed-quitters.user.js
// @updateURL    https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-expose-seed-quitters.user.js
// ==/UserScript==

const THE_WINDOW = unsafeWindow || window;
const default_fetch = THE_WINDOW.fetch;
THE_WINDOW.fetch = (function () {
	return async function (...args) {
		const url = args[0].toString();
		if(url.includes(`geoguessr.com/api/v3/results/highscores/`) && url.includes(`&minRounds=5`)) {
			args[0] = url.replace(`&minRounds=5`, `&minRounds=1`);
			let result = await default_fetch.apply(THE_WINDOW, args);
			const data = await result.clone().json();

			data.items.sort((a,b) => {
				const diff = b.totalScore-a.totalScore;
				if(diff != 0) return diff;
				return b.game.player.totalTime-a.game.player.totalTime;
			});

			data.items.forEach((e) => {
				if(e.game.player.guesses.length === e.game.roundCount) return;
				e.game.player.guesses.push(...new Array(e.game.roundCount - e.game.player.guesses.length).fill({timedOut: true}));
			});

			result.json = () => data;
			return result;
		}

		return default_fetch.apply(THE_WINDOW, args);
	};
})();