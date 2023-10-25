// ==UserScript==
// @name         Hide Google Maps UI
// @description  Press 'H' to toggle Google Maps UI elements
// @version      1.0
// @author       miraclewhips
// @match        *://*.google.com/maps/*
// @grant        GM_addStyle
// @run-at       document-start
// @icon         https://www.google.com/s2/favicons?domain=maps.google.com
// @copyright    2022, miraclewhips (https://github.com/miraclewhips)
// @license      MIT
// @downloadURL    https://github.com/miraclewhips/geoguessr-userscripts/raw/master/hide-google-maps-ui.user.js
// @updateURL    https://github.com/miraclewhips/geoguessr-userscripts/raw/master/hide-google-maps-ui.user.js
// ==/UserScript==

GM_addStyle (`body.ui-is-hidden #scene {z-index: 99999} body.ui-is-hidden #watermark {display:none}`);
window.addEventListener('keypress', (e) => {
    if(e.key !== 'h' || document.activeElement.tagName === 'INPUT') return;
    document.body.classList.toggle('ui-is-hidden');
});