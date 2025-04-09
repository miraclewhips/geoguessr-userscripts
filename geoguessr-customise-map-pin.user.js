// ==UserScript==
// @name         GeoGuessr Customise Map Pin
// @description  Modify the pin that gets placed on the map
// @version      1.0
// @author       miraclewhips
// @match        *://*.geoguessr.com/*
// @icon         https://www.google.com/s2/favicons?domain=geoguessr.com
// @grant        GM_addStyle
// @copyright    2025, miraclewhips (https://github.com/miraclewhips)
// @license      MIT
// @downloadURL  https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-customise-map-pin.user.js
// @updateURL    https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-customise-map-pin.user.js
// ==/UserScript==

const PIN_SIZE = 0.75; // set pin size (percentage)
const BORDER_SIZE = 0.5; // set border size (percentage)
const BORDER_COLOR = '#fff'; // set border colour



/* ############################################################################### */
/* ##### DON'T MODIFY ANYTHING BELOW HERE UNLESS YOU KNOW WHAT YOU ARE DOING ##### */
/* ############################################################################### */

GM_addStyle(`
	div[class^="map-pin_mapPin__"] {
		width: ${2 * PIN_SIZE}rem !important;
		height: ${2 * PIN_SIZE}rem !important;
		margin-top: -${PIN_SIZE}rem !important;
		margin-left: -${PIN_SIZE}rem !important;
	}

	div[class^="map-pin_mapPin__"] div[class^="styles_circle__"] {
		--border-size-factor: ${BORDER_SIZE} !important;
		--border-color: ${BORDER_COLOR} !important;
	}
`);
