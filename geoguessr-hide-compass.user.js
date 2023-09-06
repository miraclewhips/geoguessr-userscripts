// ==UserScript==
// @name         GeoGuessr Hide Compass
// @description  Hides the compass
// @version      1.0
// @author       miraclewhips
// @match        *://*.geoguessr.com/*
// @icon         https://www.google.com/s2/favicons?domain=geoguessr.com
// @grant        none
// @copyright    2022, miraclewhips (https://github.com/miraclewhips)
// @license      MIT
// @downloadURL    https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-hide-compass.user.js
// @updateURL    https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-hide-compass.user.js
// ==/UserScript==

/* ############################################################################### */
/* ##### DON'T MODIFY ANYTHING BELOW HERE UNLESS YOU KNOW WHAT YOU ARE DOING ##### */
/* ############################################################################### */

const style = document.createElement('style');
style.innerHTML = `
	button[class^="compass_compass__"],
	div[class^="panorama-compass_compassContainer__"]{
		display: none !important;
	}
`;
document.body.append(style);
