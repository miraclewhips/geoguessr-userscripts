// ==UserScript==
// @name         GeoGuessr Both Compasses
// @description  Shows both compasses (classic compass must be disabled in GeoGuessr settings)
// @version      1.1
// @author       miraclewhips
// @match        *://*.geoguessr.com/*
// @icon         https://www.google.com/s2/favicons?domain=geoguessr.com
// @run-at       document-start
// @grant        GM_addStyle
// @copyright    2024, miraclewhips (https://github.com/miraclewhips)
// @license      MIT
// @downloadURL  https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-both-compasses.user.js
// @updateURL    https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-both-compasses.user.js
// ==/UserScript==

/* ############################################################################### */
/* ##### DON'T MODIFY ANYTHING BELOW HERE UNLESS YOU KNOW WHAT YOU ARE DOING ##### */
/* ############################################################################### */

GM_addStyle(`
.mwgtm-override-classic-compass button[class^="compass_compass__"]  {
	display: none !important;
}

.mwgtm-compass {
	background: transparent;
	border: 0;
	height: 3rem;
	outline: none;
	padding: 0;
	position: absolute;
	-webkit-user-select: none;
	-moz-user-select: none;
	user-select: none;
	width: 3rem;
	left: 0;
	bottom: 100%;
	margin-bottom: 1rem;
}

.mwgtm-compass .circle {
	border-radius: 100%;
	box-shadow: inset 0 0 0 0.75rem var(--ds-color-white);
	height: 100%;
	opacity: .4;
	width: 100%;
}

.mwgtm-compass .arrow {
	height: 3rem;
	left: calc(50% - 0.375rem);
	position: absolute;
	top: calc(50% - 1.5rem);
	width: 0.75rem;
}
`);

function pointCompass() {
	const arrow = document.getElementById('mwgtm-compass-arrow');
	if(!MWGTM_SV || !arrow) return;

	const heading = MWGTM_SV.getPov().heading;
	arrow.style.transform = `rotate(${-heading}deg)`;
}

const observer = new MutationObserver(() => {
	if(document.getElementById('mwgtm-restore-classic-compass')) return;

	const controls = document.querySelector(`aside[class^="game_controls__"]`) || document.querySelector(`aside[class^="game-panorama_controls__"]`);
	if(!controls) return;

	const container = controls.querySelector('div[class^="styles_columnOne__"]');
	if(container) {
		const compass = document.createElement('div');
		compass.id = 'mwgtm-restore-classic-compass';
		compass.className = 'mwgtm-compass';
		compass.innerHTML = `<div class="circle"></div><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 96" class="arrow" id="mwgtm-compass-arrow"><g fill="none" fill-rule="evenodd"><path fill="#B82A2A" d="M12 0v48H0z"/><path fill="#CC2F30" d="M12 0v48h12z"/><path fill="#E6E6E6" d="M12 96V48H0z"/><path fill="#FFF" d="M12 96V48h12z"/></g></svg>`;
		container.appendChild(compass);
		container.classList.add('mwgtm-override-classic-compass');
		pointCompass();
	}
});

observer.observe(document.querySelector('#__next'), { subtree: true, childList: true });

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

let MWGTM_SV;

document.addEventListener('DOMContentLoaded', () => {
	injecter(() => {
		const google = window['google'] || unsafeWindow['google'];
		if(!google) return;

		google.maps.StreetViewPanorama = class extends google.maps.StreetViewPanorama {
			constructor(...args) {
				super(...args);
				MWGTM_SV = (this);

				MWGTM_SV.addListener('pov_changed', () => {
					pointCompass();
				});
			}
		}
	});
});
