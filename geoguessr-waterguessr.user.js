// ==UserScript==
// @name         GeoGuessr WaterGuessr
// @description  Only show names of bodies of water on guessing map
// @version      1.0
// @author       miraclewhips
// @match        *://*.geoguessr.com/*
// @run-at       document-start
// @icon         https://www.google.com/s2/favicons?domain=geoguessr.com
// @grant        unsafeWindow
// @copyright    2026, miraclewhips (https://github.com/miraclewhips)
// @license      MIT
// @downloadURL  https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-waterguessr.user.js
// @updateURL    https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-waterguessr.user.js
// ==/UserScript==

/* ############################################################################### */
/* ##### DON'T MODIFY ANYTHING BELOW HERE UNLESS YOU KNOW WHAT YOU ARE DOING ##### */
/* ############################################################################### */

if(window.frameElement) return;

let DEFAULT_MAP_TYPE, CUSTOM_MAP_TYPE;
let MAP_INSTANCES = [];
let CUSTOM_MAP_ENABLED = false;

function updateMapType() {
	for(const map of MAP_INSTANCES) {
		map.setMapTypeId(CUSTOM_MAP_ENABLED ? CUSTOM_MAP_TYPE : DEFAULT_MAP_TYPE);
	}
}

const observer = new MutationObserver(() => {
	const singlePlayer = document.querySelector(`div[class^="game_guessMap__"]`);
	const resultsLayout = document.querySelector(`div[class^="result-layout_root__"]`);
	const partyDuels = document.querySelector(`div[class^="guess-map_guessMap__"]`);
	const prev = CUSTOM_MAP_ENABLED;
	CUSTOM_MAP_ENABLED = (singlePlayer && !resultsLayout) || partyDuels;
	if(CUSTOM_MAP_ENABLED !== prev) updateMapType();
});

if(document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', () => {
		observer.observe(document.querySelector('#__next'), { subtree: true, childList: true });
	});
}else{
	observer.observe(document.querySelector('#__next'), { subtree: true, childList: true });
}

// Script injection, extracted from unityscript extracted from extenssr:
// https://gitlab.com/nonreviad/extenssr/-/blob/main/src/injected_scripts/maps_api_injecter.ts

function overrideOnLoad(googleScript, observer, overrider) {
	const oldOnload = googleScript.onload;
	googleScript.onload = (event) => {
		const google = window['google'] || unsafeWindow['google'];
		if (google) {
			observer.disconnect();
			overrider(google);
		}
		if (oldOnload) {
			oldOnload.call(googleScript, event);
		}
	}
}

function grabGoogleScript(mutations) {
	for (const mutation of mutations) {
		for (const newNode of mutation.addedNodes) {
			const asScript = newNode;
			if (asScript && asScript.src && asScript.src.startsWith('https://maps.googleapis.com/')) {
				return asScript;
			}
		}
	}
	return null;
}

function injecter(overrider) {
	new MutationObserver((mutations, observer) => {
		const googleScript = grabGoogleScript(mutations);
		if (googleScript) {
			overrideOnLoad(googleScript, observer, overrider);
		}
	}).observe(document.documentElement, { childList: true, subtree: true });
}

document.addEventListener('DOMContentLoaded', () => {
	injecter(() => {
		const google = window['google'] || unsafeWindow['google'];
		if(!google) return;
		
		google.maps.Map = class extends google.maps.Map {
			constructor(...args) {
				super(...args);
				MAP_INSTANCES.push(this);

				DEFAULT_MAP_TYPE = this.mapTypeId;
				CUSTOM_MAP_TYPE = 'waterguessr';

				this.mapTypes.set(CUSTOM_MAP_TYPE, new google.maps.StyledMapType([
					{ "stylers": [ { "visibility": "off" } ] },
					{ "featureType": "water", "elementType": "labels", "stylers": [ { "visibility": "on" } ] }
				], {name: 'waterguessr'}));

				this.addListener('idle', () => {
					updateMapType();
				});
			}
		}
	});
});
