// ==UserScript==
// @name         GeoGuessr Custom Streaks
// @description  Streak script that allows you to use GeoJSON data for streaks
// @version      1.3
// @author       miraclewhips
// @match        *://*.geoguessr.com/*
// @icon         https://www.google.com/s2/favicons?domain=geoguessr.com
// @grant        none
// @run-at       document-start
// @require      https://miraclewhips.dev/geoguessr-event-framework/geoguessr-event-framework.min.js?v=3
// @require      https://miraclewhips.dev/geoguessr-event-framework/geoguessr-streak-framework.min.js?v=3
// @require      https://miraclewhips.dev/geoguessr-event-framework/utils/turf.min.js?v=2
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
		if(!poly) throw new Error("Invalid GeoJSON data.");

		const turfPoint = turf.helpers.point([pos.lng, pos.lat])
		const turfPoly = turf.helpers.polygon(poly)
		const turfMatch = turf.booleanPointInPolygon(turfPoint, turfPoly)

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