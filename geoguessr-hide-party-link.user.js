// ==UserScript==
// @name         GeoGuessr Hide Party Link
// @description  Blurs out the party invite link so people can't randomly join by typing the address (made for streamers)
// @version      1.1
// @author       miraclewhips
// @match        *://*.geoguessr.com/*
// @icon         https://www.google.com/s2/favicons?domain=geoguessr.com
// @grant        none
// @copyright    2022, miraclewhips (https://github.com/miraclewhips)
// @license      MIT
// @downloadURL    https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-hide-party-link.user.js
// @updateURL    https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-hide-party-link.user.js
// ==/UserScript==

/* ############################################################################### */
/* ##### DON'T MODIFY ANYTHING BELOW HERE UNLESS YOU KNOW WHAT YOU ARE DOING ##### */
/* ############################################################################### */

let style = document.createElement('style');
style.innerHTML = `
	span[class^="copy-link_root__"] input {
		filter: blur(5px);
	}
	div[class^="invite-modal_step__"] + div[class^="invite-modal_step__"] > div[class^="invite-modal_value__"] {
		filter: blur(10px);
	}
	img[class^="invite-modal_qr__"] {
		filter: blur(10px);
	}
`;
document.body.append(style);
