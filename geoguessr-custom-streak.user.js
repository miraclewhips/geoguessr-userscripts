// ==UserScript==
// @name         GeoGuessr Custom Streaks
// @description  Streak script that allows you to use GeoJSON data for streaks
// @version      1.12
// @author       miraclewhips
// @match        *://*.geoguessr.com/*
// @icon         https://www.google.com/s2/favicons?domain=geoguessr.com
// @grant        unsafeWindow
// @run-at       document-start
// @require      https://miraclewhips.dev/geoguessr-event-framework/geoguessr-event-framework.min.js?v=13
// @require      https://miraclewhips.dev/geoguessr-event-framework/geoguessr-streak-framework.min.js?v=13
// @require      https://miraclewhips.dev/geoguessr-event-framework/utils/turf.min.js?v=13
// @copyright    2022, miraclewhips (https://github.com/miraclewhips)
// @license      MIT
// @downloadURL  https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-custom-streak.user.js
// @updateURL    https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-custom-streak.user.js
// ==/UserScript==

/* ------------------------------------------------------------------------------- */
/* ----- SETTINGS (MUST RELOAD PAGE FOR CHANGES TO TAKE EFFECT) ------------------ */
/* ------------------------------------------------------------------------------- */
const LANGUAGE = "en";   // ISO 639-1 language code - https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
const CHALLENGE = true;  // Set to false to disable streaks on challenge links
const AUTOMATIC = true;  // Set to false for a manual counter (controlled by keyboard shortcuts only)

/* ------------------------------------------------------------------------------- */
/* ----- KEYBOARD SHORTCUTS (MUST RELOAD PAGE FOR CHANGES TO TAKE EFFECT) -------- */
/* ------------------------------------------------------------------------------- */
const KEYBOARD_SHORTCUTS = {
	reset: '0',     // reset streak to 0
	increment: '1', // increment streak by 1
	decrement: '2', // decrement streak by 1
	restore: '8',   // restore your streak to it's previous value
};

/* ------------------------------------------------------------------------------- */
/* ----- CUSTOM POLYGONS (MUST RELOAD PAGE FOR CHANGES TO TAKE EFFECT) ----------- */
/* ------------------------------------------------------------------------------- */

// Set whether or not to draw the custom polygons on the map (`true` or `false`)
const SHOW_POLYGONS_ON_MAP = false;

// Colour to draw the polygon outlines (https://developer.mozilla.org/en-US/docs/Web/CSS/color_value)
const POLYGON_OUTLINE_COLOR = 'red';

// Thiccness of the polygon outlines
const POLYGON_OUTLINE_THICCNESS = 2;

// You can create your own custom GeoJSON polygons using: https://geojson.io/
// Guide: https://github.com/miraclewhips/geoguessr-userscripts/blob/master/guides/custom-streak.md
// replace `null` with GeoJSON data to use custom polygons
const CUSTOM_POLYGONS = null;





/* ############################################################################### */
/* ##### DON'T MODIFY ANYTHING BELOW HERE UNLESS YOU KNOW WHAT YOU ARE DOING ##### */
/* ############################################################################### */

function checkPolygons(pos) {
	if(!turf) throw new Error("Cannot find required Turf.js library");

	let features = [];

	if(CUSTOM_POLYGONS) {
		let customFeatures = CUSTOM_POLYGONS?.features;
		if(!customFeatures) throw new Error("Invalid `CUSTOM_POLYGONS` GeoJSON data.");
		features = features.concat(customFeatures);
	}

	if(features.length === 0) throw new Error("No GeoJSON polygons provided.");

	for(let i = 0; i < features.length; i++) {
		const poly = features[i]?.geometry?.coordinates;
		const multi = features[i]?.geometry?.type === 'MultiPolygon';
		if(!poly) throw new Error("Invalid GeoJSON data.");

		const turfPoint = turf.helpers.point([pos.lng, pos.lat]);
		const turfPoly = multi ? turf.helpers.multiPolygon(poly) : turf.helpers.polygon(poly);
		const turfMatch = turf.booleanPointInPolygon(turfPoint, turfPoly);

		if(turfMatch) {
			return {
				name: features[i]?.properties?.name,
				index: i
			};
		}
	}

	return null;
}

function customMatch(state, guess, location) {
	const guess_poly = checkPolygons(guess);
	const location_poly = checkPolygons(location);

	return {
		player_guess_name: guess_poly?.name || 'Undefined',
		actual_location_name: location_poly?.name || 'Undefined',
		match: guess_poly && location_poly && guess_poly?.index == location_poly?.index
	}
}

const GSF = new GeoGuessrStreakFramework({
	storage_identifier: 'MW_GeoGuessrCustomStreak',
	name: 'Custom Streak',
	terms: {
		single: 'round',
		plural: 'rounds'
	},
	enabled_on_challenges: CHALLENGE,
	automatic: AUTOMATIC,
	language: LANGUAGE,
	only_match_country_code: false,
	query_openstreetmap: false,
	custom_match_function: customMatch,
	keyboard_shortcuts: KEYBOARD_SHORTCUTS,
});

if(SHOW_POLYGONS_ON_MAP) {
	const CUSTOM_WINDOW = unsafeWindow ?? window;

	function extractPolyList(array) {
		const list = [];

		function extract(arr) {
			for(let el of arr) {
				if(typeof el[0][0] === 'number') {
					list.push(el);
				}else{
					extract(el);
				}
			}
		}

		extract(array);
		return list;
	}

	function createGooglePolygons(mapInstance) {
		for(const poly of CUSTOM_POLYGONS?.features) {
			const polyList = [];

			const list = extractPolyList(poly?.geometry?.coordinates);

			for(const innerPoly of list) {
				polyList.push(innerPoly.map(arr => ({lat: arr[1], lng: arr[0]})));
			}

			const gPoly = new google.maps.Polygon({
				clickable: false,
				paths: polyList,
				strokeColor: POLYGON_OUTLINE_COLOR,
				strokeOpacity: 1,
				strokeWeight: POLYGON_OUTLINE_THICCNESS,
				fillOpacity: 0,
			});

			gPoly.setMap(mapInstance);
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
					createGooglePolygons(this);
				}
			}
		});
	});
}
