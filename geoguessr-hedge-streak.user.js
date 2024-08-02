// ==UserScript==
// @name         GeoGuessr Hedge Streak
// @description  Adds a hedge streak counter that automatically updates while you play and tracks how many games in a row you score 20,000 points or more
// @version      1.9
// @author       miraclewhips
// @match        *://*.geoguessr.com/*
// @icon         https://www.google.com/s2/favicons?domain=geoguessr.com
// @grant        unsafeWindow
// @run-at       document-start
// @require      https://miraclewhips.dev/geoguessr-event-framework/geoguessr-event-framework.min.js?v=11
// @require      https://miraclewhips.dev/geoguessr-event-framework/geoguessr-streak-framework.min.js?v=11
// @copyright    2024, miraclewhips (https://github.com/miraclewhips)
// @license      MIT
// @downloadURL  https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-hedge-streak.user.js
// @updateURL    https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-hedge-streak.user.js
// ==/UserScript==

/* ------------------------------------------------------------------------------- */
/* ----- SETTINGS (MUST RELOAD PAGE FOR CHANGES TO TAKE EFFECT) ------------------ */
/* ------------------------------------------------------------------------------- */
const CHALLENGE = true;         // Set to false to disable streaks on challenge links
const AUTOMATIC = true;         // Set to false for a manual counter (controlled by keyboard shortcuts only)
const SCORE_THRESHOLD = 20_000; // Score you need to reach to continue the streak

/* ------------------------------------------------------------------------------- */
/* ----- KEYBOARD SHORTCUTS (MUST RELOAD PAGE FOR CHANGES TO TAKE EFFECT) -------- */
/* ------------------------------------------------------------------------------- */
const KEYBOARD_SHORTCUTS = {
	reset: '9',     // reset streak to 0
	increment: '5', // increment streak by 1
	decrement: '6', // decrement streak by 1
	restore: '7',   // restore your streak to it's previous value
};



/* ############################################################################### */
/* ##### DON'T MODIFY ANYTHING BELOW HERE UNLESS YOU KNOW WHAT YOU ARE DOING ##### */
/* ############################################################################### */

function quadMatch(state, guess, location) {
	return {
		player_guess_name: null,
		actual_location_name: null,
		match: state.total_score.amount >= SCORE_THRESHOLD
	}
}

const GSF = new GeoGuessrStreakFramework({
	storage_identifier: 'MW_GeoGuessrHedgeStreak',
	name: 'Hedge Streak',
	terms: {
		single: 'game',
		plural: 'games'
	},
	enabled_on_challenges: CHALLENGE,
	automatic: AUTOMATIC,
	streak_type: 'game',
	query_openstreetmap: false,
	custom_match_function: quadMatch,
	keyboard_shortcuts: KEYBOARD_SHORTCUTS,
});
