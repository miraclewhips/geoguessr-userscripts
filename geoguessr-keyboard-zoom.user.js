// ==UserScript==
// @name         GeoGuessr Keyboard Zoom
// @description  Press E/Q to zoom in/out of the map with your keyboard
// @version      1.0
// @author       miraclewhips
// @match        *://*.geoguessr.com/*
// @run-at       document-start
// @icon         https://www.google.com/s2/favicons?domain=geoguessr.com
// @grant        none
// @copyright    2022, miraclewhips (https://github.com/miraclewhips)
// @license      MIT
// @downloadURL    https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-keyboard-zoom.user.js
// @updateURL    https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-keyboard-zoom.user.js
// ==/UserScript==

const ZOOM_IN_KEY = 'e';
const ZOOM_OUT_KEY = 'q';

/* ############################################################################### */
/* ##### DON'T MODIFY ANYTHING BELOW HERE UNLESS YOU KNOW WHAT YOU ARE DOING ##### */
/* ############################################################################### */

let MWMapInstance;

// Script injection, extracted from unityscript extracted from extenssr:
// https://gitlab.com/nonreviad/extenssr/-/blob/main/src/injected_scripts/maps_api_injecter.ts

function overrideOnLoad(googleScript, observer, overrider) {
	const oldOnload = googleScript.onload
	googleScript.onload = (event) => {
			const google = window.google
			if (google) {
					observer.disconnect()
					overrider(google)
			}
			if (oldOnload) {
					oldOnload.call(googleScript, event)
			}
	}
}

function grabGoogleScript(mutations) {
	for (const mutation of mutations) {
			for (const newNode of mutation.addedNodes) {
					const asScript = newNode
					if (asScript && asScript.src && asScript.src.startsWith('https://maps.googleapis.com/')) {
							return asScript
					}
			}
	}
	return null
}

function injecter(overrider) {
	if (document.documentElement)
	{
			injecterCallback(overrider);
	}
}

function injecterCallback(overrider)
{
	new MutationObserver((mutations, observer) => {
			const googleScript = grabGoogleScript(mutations)
			if (googleScript) {
					overrideOnLoad(googleScript, observer, overrider)
			}
	}).observe(document.documentElement, { childList: true, subtree: true })
}

document.addEventListener('DOMContentLoaded', (event) => {
	injecter(() => {
		google.maps.Map = class extends google.maps.Map {
			constructor(...args) {
					super(...args);
					MWMapInstance = this;
			}
		}
	});
});

document.addEventListener('keyup', (event) => {
	if(MWMapInstance) {
		let zoom = MWMapInstance.getZoom();
		
		switch(event.key) {
			case ZOOM_IN_KEY:
				MWMapInstance.setZoom(zoom + 1);
				break;
			case ZOOM_OUT_KEY:
				MWMapInstance.setZoom(zoom - 1);
				break;
		}
	}
});