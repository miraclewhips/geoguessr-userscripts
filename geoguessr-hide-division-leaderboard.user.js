// ==UserScript==
// @name         GeoGuessr Hide Division Leaderboard
// @description  Hides the division leaderboard by default
// @version      1.0
// @author       miraclewhips
// @match        *://*.geoguessr.com/*
// @icon         https://www.google.com/s2/favicons?domain=geoguessr.com
// @grant        GM_addStyle
// @copyright    2024, miraclewhips (https://github.com/miraclewhips)
// @license      MIT
// @downloadURL  https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-hide-division-leaderboard.user.js
// @updateURL    https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-hide-division-leaderboard.user.js
// ==/UserScript==

/* ############################################################################### */
/* ##### DON'T MODIFY ANYTHING BELOW HERE UNLESS YOU KNOW WHAT YOU ARE DOING ##### */
/* ############################################################################### */

GM_addStyle(`
	body:not(.mw-show-division-leaderboard) div[class^="leaderboard_scrollableContent__"]{
		display: none !important;
	}

	#mw-toggle-division-leaderboard {
		position: absolute;
		top: 1rem;
		left: 1rem;
		padding: 5px 10px;
		border: 1px solid rgba(255,255,255,0.5);
		border-radius: 5px;
		color: #fff;
		font-size: 0.8rem;
		cursor: pointer;
	}

	#mw-toggle-division-leaderboard:hover,
	#mw-toggle-division-leaderboard:focus {
		border-color: #fff;
	}
`);

function clickedBtn() {
	const btn = document.getElementById('mw-toggle-division-leaderboard');
	const visible = btn.textContent == 'SHOW LEADERBOARD';
	document.body.classList.toggle(`mw-show-division-leaderboard`, visible);
	btn.textContent = visible ? 'HIDE LEADERBOARD' : 'SHOW LEADERBOARD';
}

const init = () => {
	const observer = new MutationObserver(() => {
		const container = document.querySelector(`div[class^="leaderboard_leaderBoardContainer__"]`);
		if(container && !document.getElementById('mw-toggle-division-leaderboard')) {
			const btn = document.createElement('button');
			btn.id = 'mw-toggle-division-leaderboard';
			btn.textContent = 'SHOW LEADERBOARD';
			btn.addEventListener('click', clickedBtn);
			container.appendChild(btn);
		}
	});

	observer.observe(document.body, { subtree: true, childList: true });
}

init();
