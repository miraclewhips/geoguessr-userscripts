// ==UserScript==
// @name         GeoGuessr Hide Pano Author
// @description  Hides the copyright that shows the name of the author of the Streetview panorma
// @version      1.0
// @author       miraclewhips
// @match        *://*.geoguessr.com/*
// @run-at       document-start
// @icon         https://www.google.com/s2/favicons?domain=geoguessr.com
// @grant        GM_addStyle
// @copyright    2024, miraclewhips (https://github.com/miraclewhips)
// @license      MIT
// @downloadURL  https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-hide-pano-author.user.js
// @updateURL    https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-hide-pano-author.user.js
// ==/UserScript==



/* ############################################################################### */
/* ##### DON'T MODIFY ANYTHING BELOW HERE UNLESS YOU KNOW WHAT YOU ARE DOING ##### */
/* ############################################################################### */

GM_addStyle(`
.gm-style-cc {
    display: none !important;
}
`);
