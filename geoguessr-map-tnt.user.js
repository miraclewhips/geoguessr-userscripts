// ==UserScript==
// @name         GeoGuessr Map TNT
// @description  idek
// @version      1.0
// @author       miraclewhips
// @match        *://*.geoguessr.com/*
// @run-at       document-start
// @icon         https://www.google.com/s2/favicons?domain=geoguessr.com
// @grant        none
// @copyright    2022, miraclewhips (https://github.com/miraclewhips)
// @license      MIT
// @downloadURL    https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-map-tnt.user.js
// @updateURL    https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-map-tnt.user.js
// ==/UserScript==



/* ############################################################################### */
/* ##### DON'T MODIFY ANYTHING BELOW HERE UNLESS YOU KNOW WHAT YOU ARE DOING ##### */
/* ############################################################################### */

const createGrid = () => {
	class MapGrid extends google.maps.OverlayView {
		tnt;
	
		constructor() {
			super();
		}
	
		onAdd() {
			this.tnt = document.createElement('img');
			this.tnt.style.display = 'block';
			this.tnt.style.position = 'absolute';
			this.tnt.src = 'https://i.imgur.com/CKz4ukq.png';

			const panes = this.getPanes();
			panes.overlayLayer.appendChild(this.tnt);
		}

		getCoords(lat, lng) {
			const overlayProjection = this.getProjection();
			if(!overlayProjection) return false;

			return overlayProjection.fromLatLngToDivPixel(
				new google.maps.LatLng(lat, lng)
			);
		}
	
		draw() {
			let pos = this.getCoords(85.5, 0);
			let size = 100;
			if(!pos) return;

			if(this.tnt) {
				this.tnt.style.left = `${pos.x}px`;
				this.tnt.style.top = `${pos.y}px`;
				this.tnt.style.width = `${size}px`;
				this.tnt.style.height = `${size}px`;
				this.tnt.style.marginLeft = `${size * -0.5}px`;
				this.tnt.style.marginTop = `${size * -1}px`;
			}
		}
	
		onRemove() {
			if (this.tnt) {
				this.tnt.parentNode.removeChild(this.tnt);
			}
		}
	
		hide() {
			if (this.tnt) {
				this.tnt.style.visibility = "hidden";
			}
		}
	
		show() {
			if (this.tnt) {
				this.tnt.style.visibility = "visible";
			}
		}
	
		toggle() {
			if (this.tnt) {
				if (this.tnt.style.visibility === "hidden") {
					this.show();
				} else {
					this.hide();
				}
			}
		}
	
		toggleDOM(map) {
			if (this.getMap()) {
				this.setMap(null);
			} else {
				this.setMap(map);
			}
		}
	}

	MWMapGrid = new MapGrid();
	MWMapGrid.setMap(MWMapInstance);
}













let MWMapInstance;
let MWMapGrid;

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
					createGrid();
			}
		}
	});
});