// ==UserScript==
// @name         GeoGuessr Connect 4 Map Grid
// @description  Shows a grid overlay on the minimap and counts the streaks
// @version      1.4
// @author       miraclewhips
// @match        *://*.geoguessr.com/*
// @icon         https://www.google.com/s2/favicons?domain=geoguessr.com
// @grant        unsafeWindow
// @run-at       document-start
// @require      https://miraclewhips.dev/geoguessr-event-framework/geoguessr-event-framework.min.js?v=13
// @require      https://miraclewhips.dev/geoguessr-event-framework/geoguessr-streak-framework.min.js?v=13
// @copyright    2024, miraclewhips (https://github.com/miraclewhips)
// @license      MIT
// ==/UserScript==

/* ------------------------------------------------------------------------------- */
/* ----- SETTINGS (MUST RELOAD PAGE FOR CHANGES TO TAKE EFFECT) ------------------ */
/* ------------------------------------------------------------------------------- */
const SHOW_LABELS = true;                  // show A1, A2, B1 etc on the grid
const GRID_COLS = 8;                       // number of columns in the grid
const GRID_ROWS = 6;                       // number of rows in the grid
const LAT_MAX_NORTH = 73.04321240562486;   // northern-most point to draw the grid
const LAT_MAX_SOUTH = -55.473188156129886; // southern-most point to draw the grid
const LNG_MAX_WEST = -180;                 // western-most point to draw the grid
const LNG_MAX_EAST = 180;                  // eastern-most point to draw the grid
const CHALLENGE = true;                    // Set to false to disable streaks on challenge links
const AUTOMATIC = true;                    // Set to false for a manual counter (controlled by keyboard shortcuts only)

/* ------------------------------------------------------------------------------- */
/* ----- KEYBOARD SHORTCUTS (MUST RELOAD PAGE FOR CHANGES TO TAKE EFFECT) -------- */
/* ------------------------------------------------------------------------------- */
const KEYBOARD_SHORTCUTS = {
	reset: '0',     // reset streak to 0
	increment: '1', // increment streak by 1
	decrement: '2', // decrement streak by 1
	restore: '8',   // restore your streak to it's previous value
};



/* ############################################################################### */
/* ##### DON'T MODIFY ANYTHING BELOW HERE UNLESS YOU KNOW WHAT YOU ARE DOING ##### */
/* ############################################################################### */
const CUSTOM_WINDOW = unsafeWindow ?? window;

function toLetters(num) {
	var mod = num % 26,
		pow = num / 26 | 0,
		out = mod ? String.fromCharCode(64 + mod) : (--pow, 'Z');
	return pow ? toLetters(pow) + out : out;
}

function gridNumber(x, y) {
	return `${toLetters(x+1)}${y+1}`;
}

function getGridLoc(pos) {
	let x = Math.floor(((pos.lng - LNG_MAX_WEST) / (LNG_MAX_EAST - LNG_MAX_WEST)) * GRID_COLS);
	let y = Math.floor(((pos.lat - LAT_MAX_NORTH) / (LAT_MAX_SOUTH - LAT_MAX_NORTH)) * GRID_ROWS);
	return gridNumber(x, y);
}

function createGrid(mapInstance) {
	class MapGrid extends google.maps.OverlayView {
		divs = [];
	
		constructor() {
			super();
		}
	
		onAdd() {
			for(let y = 0; y < GRID_ROWS; y++) {
				for(let x = 0; x < GRID_COLS; x++) {
					const i = y * GRID_COLS + x;

					let div = document.createElement('div');
					div.style.border = '1px solid rgba(255,0,0,0.5)';
					div.style.position = 'absolute';
					div.style.overflow = 'hidden';

					if(SHOW_LABELS) {
						div.style.display = 'flex';
						div.style.alignItems = 'center';
						div.style.justifyContent = 'center';
						div.style.color = '#000';
						div.style.fontWeight = 'bold';
						div.style.fontSize = '14px';
						div.style.textShadow = 'rgb(255, 255, 255) 1px 0px 0px, rgb(255, 255, 255) 0.540302px 0.841471px 0px, rgb(255, 255, 255) -0.416147px 0.909297px 0px, rgb(255, 255, 255) -0.989992px 0.14112px 0px, rgb(255, 255, 255) -0.653644px -0.756802px 0px, rgb(255, 255, 255) 0.283662px -0.958924px 0px, rgb(255, 255, 255) 0.96017px -0.279415px 0px';
						div.textContent = gridNumber(x, y);
					}

					this.divs[i] = div;
			
					const panes = this.getPanes();
					panes.overlayLayer.appendChild(this.divs[i]);
				}
			}
		}

		getCoords(x, y) {
			const overlayProjection = this.getProjection();

			if(!overlayProjection) return false;

			const lat = LAT_MAX_NORTH + ((LAT_MAX_SOUTH - LAT_MAX_NORTH) / GRID_ROWS * y);
			const lng = LNG_MAX_WEST + ((LNG_MAX_EAST - LNG_MAX_WEST) / GRID_COLS * x);

			return overlayProjection.fromLatLngToDivPixel(
				new google.maps.LatLng(lat, lng)
			);
		}
	
		draw() {
			for(let y = 0; y < GRID_ROWS; y++) {
				for(let x = 0; x < GRID_COLS; x++) {
					const i = y * GRID_COLS + x;

					let nw = this.getCoords(x, y);
					let se = this.getCoords(x+1, y+1);

					if(!nw || !se) return;

					let rect = {
						left: nw.x,
						top: nw.y,
						width: se.x - nw.x,
						height: se.y - nw.y
					}
					
					if(rect.width < 0) {
						nw = this.getCoords(x-1, y);
						se = this.getCoords(x, y+1);

						rect = {
							left: se.x,
							top: nw.y,
							width: se.x - nw.x,
							height: se.y - nw.y
						}
					}
					
					if(this.divs[i]) {
						this.divs[i].style.left = `${rect.left}px`;
						this.divs[i].style.top = `${rect.top}px`;
						this.divs[i].style.width = `${rect.width}px`;
						this.divs[i].style.height = `${rect.height}px`;
					}
				}
			}
		}
	
		onRemove() {
			for(let y = 0; y < GRID_ROWS; y++) {
				for(let x = 0; x < GRID_COLS; x++) {
					const i = y * GRID_COLS + x;

					if (this.divs[i]) {
						this.divs[i].parentNode.removeChild(this.divs[i]);
						delete this.divs[i];
					}
				}
			}
		}
	
		hide() {
			for(let y = 0; y < GRID_ROWS; y++) {
				for(let x = 0; x < GRID_COLS; x++) {
					const i = y * GRID_COLS + x;

					if (this.divs[i]) {
						this.divs[i].style.visibility = "hidden";
					}
				}
			}
		}
	
		show() {
			for(let y = 0; y < GRID_ROWS; y++) {
				for(let x = 0; x < GRID_COLS; x++) {
					const i = y * GRID_COLS + x;

					if (this.divs[i]) {
						this.divs[i].style.visibility = "visible";
					}
				}
			}
		}
	
		toggle() {
			for(let y = 0; y < GRID_ROWS; y++) {
				for(let x = 0; x < GRID_COLS; x++) {
					const i = y * GRID_COLS + x;

					if (this.divs[i]) {
						if (this.divs[i].style.visibility === "hidden") {
							this.show();
						} else {
							this.hide();
						}
					}
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

	let MWMapGrid = new MapGrid();
	MWMapGrid.setMap(mapInstance);
}

function overrideOnLoad(googleScript, observer, overrider) {
	const oldOnload = googleScript.onload;
	googleScript.onload = (event) => {
		const google = CUSTOM_WINDOW['google'];
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
		if(!CUSTOM_WINDOW['google']) return reject();

		CUSTOM_WINDOW['google'].maps.Map = class extends CUSTOM_WINDOW['google'].maps.Map {
			constructor(...args) {
				super(...args);
				createGrid(this);
			}
		}
	});
});

function quadMatch(state, guess, location) {
	const guessQuad = getGridLoc(guess);
	const guessLocation = getGridLoc(location);

	return {
		player_guess_name: guessQuad,
		actual_location_name: guessLocation,
		match: guessQuad == guessLocation
	}
}

const GSF = new GeoGuessrStreakFramework({
	storage_identifier: 'MW_GeoGuessrQuadStreak',
	name: 'Quad Streak',
	terms: {
		single: 'quad',
		plural: 'quads'
	},
	enabled_on_challenges: CHALLENGE,
	automatic: AUTOMATIC,
	query_openstreetmap: false,
	custom_match_function: quadMatch,
	keyboard_shortcuts: KEYBOARD_SHORTCUTS,
});
