// ==UserScript==
// @name         GeoGuessr Emoji Replacer
// @description  Replaces the default GeoGuessr emojis with the supplied images (you can put custom images in by editing the script)
// @version      1.0
// @author       miraclewhips
// @match        *://*.geoguessr.com/*
// @icon         https://www.google.com/s2/favicons?domain=geoguessr.com
// @grant        none
// @copyright    2022, miraclewhips (https://github.com/miraclewhips)
// @license      MIT
// @downloadURL    https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-emoji-replacer.user.js
// @updateURL    https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-emoji-replacer.user.js
// ==/UserScript==

const IMAGES = {
	gg: 'https://i.imgur.com/aUDTU3R.png',
	happy: 'https://i.imgur.com/M4ihCcr.png',
	mindblown: 'https://i.imgur.com/HB0JAI0.png',
	wave: 'https://i.imgur.com/TVX9bde.png',
	confused: 'https://i.imgur.com/xs4BuWc.png',
	cry: 'https://i.imgur.com/HTMLtNO.png',
}



/* ############################################################################### */
/* ##### DON'T MODIFY ANYTHING BELOW HERE UNLESS YOU KNOW WHAT YOU ARE DOING ##### */
/* ############################################################################### */

const init = () => {
	const observer = new MutationObserver(() => {
		for(let emoji in IMAGES) {
			let images = document.querySelectorAll(`img[src*="emote-${emoji}-"]`);
			for(let img of images) {
				img.src = IMAGES[emoji];
			}
		}
	});

	observer.observe(document.querySelector('#__next'), { subtree: true, childList: true });
}

init();