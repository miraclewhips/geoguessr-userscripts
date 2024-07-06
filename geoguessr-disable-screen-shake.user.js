// ==UserScript==
// @name         GeoGuessr Disable Screen Shake
// @description  Disables screen shake after opponent guesses
// @version      1.1
// @author       miraclewhips
// @match        *://*.geoguessr.com/*
// @icon         https://www.google.com/s2/favicons?domain=geoguessr.com
// @grant        GM_addStyle
// @copyright    2022, miraclewhips (https://github.com/miraclewhips)
// @license      MIT
// @downloadURL    https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-disable-screen-shake.user.js
// @updateURL    https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-disable-screen-shake.user.js
// ==/UserScript==

const ALSO_DISABLE_RED_FLASH = false;

/* ############################################################################### */
/* ##### DON'T MODIFY ANYTHING BELOW HERE UNLESS YOU KNOW WHAT YOU ARE DOING ##### */
/* ############################################################################### */

GM_addStyle(`
	*[class*="game_tremble__"] {
		animation: none !important;
	}
`);

if(ALSO_DISABLE_RED_FLASH) {
	GM_addStyle(`
		*[class*="stress-indicator_container__"] {
			display: none !important;
		}
	`);
}
