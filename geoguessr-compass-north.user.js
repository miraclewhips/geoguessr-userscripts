// ==UserScript==
// @name         GeoGuessr Compass North Hotkey (N)
// @description  Press N to point the streetview map due north
// @version      1.1
// @author       miraclewhips
// @match        *://*.geoguessr.com/*
// @run-at       document-start
// @icon         https://www.google.com/s2/favicons?domain=geoguessr.com
// @grant        none
// @copyright    2022, miraclewhips (https://github.com/miraclewhips)
// @license      MIT
// @downloadURL    https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-compass-north.user.js
// @updateURL    https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-compass-north.user.js
// ==/UserScript==

/* ############################################################################### */
/* ##### DON'T MODIFY ANYTHING BELOW HERE UNLESS YOU KNOW WHAT YOU ARE DOING ##### */
/* ############################################################################### */

let MWStreetViewInstance;

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
		google.maps.StreetViewPanorama = class extends google.maps.StreetViewPanorama {
			constructor(...args) {
					super(...args);
					MWStreetViewInstance = this;
			}
		}
	});
});

document.addEventListener('keyup', (event) => {
	const settings = JSON.parse(window.localStorage.getItem('game-settings')) ?? {forbidRotating: false};
	if(settings.forbidRotating) return;

	if(MWStreetViewInstance && event.key === 'n') {
		let pov = MWStreetViewInstance.getPov();
		pov.heading = 0;
		MWStreetViewInstance.setPov(pov);
	}
});
