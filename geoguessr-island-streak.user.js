// ==UserScript==
// @name         GeoGuessr Island Streak
// @description  Adds an island streak counter for certain countries (New Zealand, Indonesia)
// @version      1.5
// @author       miraclewhips
// @match        *://*.geoguessr.com/*
// @icon         https://www.google.com/s2/favicons?domain=geoguessr.com
// @grant        none
// @run-at       document-start
// @require      https://miraclewhips.dev/geoguessr-event-framework/geoguessr-event-framework.min.js
// @require      https://miraclewhips.dev/geoguessr-event-framework/geoguessr-streak-framework.min.js
// @copyright    2022, miraclewhips (https://github.com/miraclewhips)
// @license      MIT
// @downloadURL  https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-island-streak.user.js
// @updateURL    https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-island-streak.user.js
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



/* ############################################################################### */
/* ##### DON'T MODIFY ANYTHING BELOW HERE UNLESS YOU KNOW WHAT YOU ARE DOING ##### */
/* ############################################################################### */

function getIsland(data) {
	const state = data.address['ISO3166-2-lvl4'];

	switch(data.address.country_code) {
		// NEW ZEALAND
		case 'nz':
			if(state) {
				const s = state.replace('NZ-', '');
				// north island
				if(['NTL', 'AUK', 'WKO', 'BOP', 'GIS', 'HKB', 'TKI', 'MWT', 'WGN'].includes(s)) {
					return 'North Island';
				}

				// south island
				else if(['TAS', 'NSN', 'MBH', 'WTC', 'CAN', 'OTA', 'STL'].includes(s)) {
					return 'South Island';
				}
			}
			break;

		// INDONESIA
		case 'id':
			if(state) {
				const s = state.replace('ID-', '');
				// java
				if(['BT', 'JK', 'JB', 'JT', 'JI', 'YO'].includes(s)) {
					return 'Java';
				}

				// sumatra
				else if(['AC', 'BE', 'JA', 'BB', 'KR', 'LA', 'RI', 'SB', 'SS', 'SU'].includes(s)) {
					return 'Sumatra';
				}

				// kalimantan
				else if(['KB', 'KS', 'KT', 'KI', 'KU'].includes(s)) {
					return 'Kalimantan';
				}

				// sulawesi
				else if(['GO', 'SR', 'SN', 'ST', 'SG', 'SA'].includes(s)) {
					return 'Sulawesi';
				}

				// lesser sunda islands
				else if(['BA', 'NB', 'NT'].includes(s)) {
					return 'Lesser Sunda Islands';
				}

				// maluku islands
				else if(['MA', 'MU'].includes(s)) {
					return 'Maluku Islands';
				}

				// western new guinea
				else if(['PA', 'PB'].includes(s)) {
					return 'Western New Guinea';
				}
			}
			break;
	}

	return 'Undefined';
}

function islandMatch(state, guess, location) {
	const player_guess_name = getIsland(guess);
	const actual_location_name = getIsland(location);

	return {
		player_guess_name,
		actual_location_name,
		match: player_guess_name == actual_location_name
	}
}

const GSF = new GeoGuessrStreakFramework({
	storage_identifier: 'MW_GeoGuessrIslandStreak',
	name: 'Island Streak',
	terms: {
		single: 'island',
		plural: 'islands'
	},
	enabled_on_challenges: CHALLENGE,
	automatic: AUTOMATIC,
	language: LANGUAGE,
	only_match_country_code: false,
	custom_match_function: islandMatch,
	keyboard_shortcuts: KEYBOARD_SHORTCUTS,
});