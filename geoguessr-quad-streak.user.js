// ==UserScript==
// @name         GeoGuessr Quad Streak
// @description  Draws a grid over the minimap, and tracks how many correct quads you guess in a row
// @version      1.17
// @author       miraclewhips
// @match        *://*.geoguessr.com/*
// @icon         https://www.google.com/s2/favicons?domain=geoguessr.com
// @grant        unsafeWindow
// @run-at       document-start
// @require      https://miraclewhips.dev/geoguessr-event-framework/geoguessr-event-framework.min.js?v=12
// @require      https://miraclewhips.dev/geoguessr-event-framework/geoguessr-streak-framework.min.js?v=12
// @copyright    2022, miraclewhips (https://github.com/miraclewhips)
// @license      MIT
// @downloadURL  https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-quad-streak.user.js
// @updateURL    https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-quad-streak.user.js
// ==/UserScript==

/* ------------------------------------------------------------------------------- */
/* ----- SETTINGS (MUST RELOAD PAGE FOR CHANGES TO TAKE EFFECT) ------------------ */
/* ------------------------------------------------------------------------------- */
const GRID_COLS = 20;      // number of columns in the grid
const GRID_ROWS = 16;      // number of rows in the grid
const LAT_MAX_NORTH = 85;  // northern-most point to draw the grid
const LAT_MAX_SOUTH = -85; // southern-most point to draw the grid
const LNG_MAX_WEST = -180; // western-most point to draw the grid
const LNG_MAX_EAST = 180;  // eastern-most point to draw the grid
const CHALLENGE = true;    // Set to false to disable streaks on challenge links
const AUTOMATIC = true;    // Set to false for a manual counter (controlled by keyboard shortcuts only)

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
    const lineOptions = {
        clickable: false,
        map: mapInstance,
        strokeColor: '#f00',
        strokeOpacity: 0.5,
        strokeWeight: 1,
    };

    for(let y = 0; y < GRID_ROWS; y++) {
        const lat = LAT_MAX_NORTH + ((LAT_MAX_SOUTH - LAT_MAX_NORTH) / GRID_ROWS * y);
        const line = new google.maps.Polyline({
            ...lineOptions,
            path: [ new google.maps.LatLng(lat, LNG_MAX_EAST),
                   new google.maps.LatLng(lat, 0),
                   new google.maps.LatLng(lat, LNG_MAX_WEST)]
        });
    }

    for(let x = 0; x < GRID_COLS; x++) {
        const lng = LNG_MAX_WEST + ((LNG_MAX_EAST - LNG_MAX_WEST) / GRID_COLS * x);
        const line = new google.maps.Polyline({
            ...lineOptions,
            path: [ new google.maps.LatLng(LAT_MAX_NORTH, lng),
                   new google.maps.LatLng(LAT_MAX_SOUTH, lng)]
        });
    }
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
