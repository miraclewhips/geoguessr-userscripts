// ==UserScript==
// @name         GeoGuessr County Streak
// @description  Adds a county streak counter that automatically updates while you play (may not work for all countries, depending on how they define their counties)
// @version      1.16
// @author       miraclewhips
// @match        *://*.geoguessr.com/*
// @icon         https://www.google.com/s2/favicons?domain=geoguessr.com
// @grant        unsafeWindow
// @run-at       document-start
// @require      https://miraclewhips.dev/geoguessr-event-framework/geoguessr-event-framework.min.js?v=13
// @require      https://miraclewhips.dev/geoguessr-event-framework/geoguessr-streak-framework.min.js?v=13
// @copyright    2022, miraclewhips (https://github.com/miraclewhips)
// @license      MIT
// @downloadURL  https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-county-streak.user.js
// @updateURL    https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-county-streak.user.js
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

const GSF = new GeoGuessrStreakFramework({
	storage_identifier: 'MW_GeoGuessrCountyStreak',
	name: 'County Streak',
	terms: {
		single: 'county',
		plural: 'counties'
	},
	enabled_on_challenges: CHALLENGE,
	automatic: AUTOMATIC,
	language: LANGUAGE,
	only_match_country_code: false,
	address_matches: ['county', 'city'],
	keyboard_shortcuts: KEYBOARD_SHORTCUTS,
});
