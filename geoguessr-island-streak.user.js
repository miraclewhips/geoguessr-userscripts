// ==UserScript==
// @name         GeoGuessr Island Streak
// @description  Adds an island streak counter for certain countries (New Zealand, Indonesia)
// @version      1.9
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

const DEFAULT_POLYGONS = {"type":"FeatureCollection","features":[{"type":"Feature","properties":{"name":"South Island"},"geometry":{"coordinates":[[[165.46537596788073,-45.921583361691916],[167.28650289911525,-47.482569115391215],[169.4894790256077,-46.993974497474085],[173.17579241060503,-44.115413807455845],[174.49757808650105,-42.07813030902894],[174.51226459401147,-40.745451029373356],[172.63239163273664,-40.24286437053174],[167.80053066196257,-43.6921482627977],[165.46537596788073,-45.921583361691916]]],"type":"Polygon"}},{"type":"Feature","properties":{"name":"North Island"},"geometry":{"coordinates":[[[172.35260509750822,-34.215573719285736],[173.5572719886784,-39.90379851646741],[174.8288648182508,-40.61878856878608],[174.543033201039,-41.3009511689082],[175.40442788847554,-41.93647773963932],[179.48691013077843,-37.80897829424783],[173.24941267204792,-34.226641575539034],[172.35260509750822,-34.215573719285736]]],"type":"Polygon"}},{"type":"Feature","properties":{"name":"Sumatra"},"geometry":{"coordinates":[[[94.31202098538444,5.4813987786741905],[94.89744126243056,3.3377654789825755],[100.88926263055288,-5.160800239673449],[104.84049206041976,-6.662798992560752],[108.93468725323953,-3.268392195302866],[104.94826303373594,1.172684346773977],[104.35209317942184,1.2955774286065207],[103.60022260714362,1.121477271011969],[101.63114519509679,2.300631505755007],[99.07669837933139,4.795737270183054],[95.47148620672641,6.418378636399922],[94.31202098538444,5.4813987786741905]]],"type":"Polygon"},"id":2},{"type":"Feature","properties":{"name":"Java"},"geometry":{"coordinates":[[[104.85040482094871,-6.697947460353376],[106.63545543966939,-7.960940315459254],[114.73688910412187,-8.85060944262868],[114.4505615369531,-8.463964085029971],[114.41625270900897,-8.111581616225934],[114.807636196577,-7.230563205419898],[114.25068328197796,-6.805867481381853],[107.55366408936715,-5.820245488042829],[106.08656860700978,-5.745912549558852],[104.85040482094871,-6.697947460353376]]],"type":"Polygon"},"id":3},{"type":"Feature","properties":{"name":"Lesser Sunda Islands"},"geometry":{"coordinates":[[[114.80328418539511,-8.889115481996512],[118.58653264824363,-9.491487175223924],[121.61977209160074,-11.043943260039853],[123.9191632825333,-11.067950870550646],[125.19390526697998,-9.491909254733088],[125.21844905747486,-8.909285586863504],[125.19538702869238,-7.938170969838978],[120.44170515803921,-7.901397637020921],[114.45720763208362,-8.042775804167562],[114.42215689058986,-8.11792703791754],[114.44152032194177,-8.290414337209697],[114.80328418539511,-8.889115481996512]]],"type":"Polygon"},"id":4},{"type":"Feature","properties":{"name":"Kalimantan"},"geometry":{"coordinates":[[[109.47695131337139,2.3222337698924207],[108.26982881001203,1.0079165450334813],[108.75124076075701,-2.260734737041318],[111.2014120324555,-3.975403520968399],[115.62752787810496,-4.441184462448547],[116.8993176584284,-3.7890157047560393],[119.25608064117722,1.1803311107366028],[118.05612804216128,4.18730001764682],[116.12329498618743,4.796167801281399],[115.37602867458446,4.287618562305184],[114.28387021916348,1.7477752614574769],[110.7056142270639,1.7262294076216307],[109.47695131337139,2.3222337698924207]]],"type":"Polygon"},"id":5},{"type":"Feature","properties":{"name":"Sulawesi"},"geometry":{"coordinates":[[[118.31156725420288,-3.302435552572419],[118.51829139206012,-6.734173476053357],[121.52077562016893,-7.740035995429508],[124.44451044801116,-6.352758575487229],[123.51915465311805,-2.5257545432084925],[123.85385781297396,-0.9612983991361119],[127.2894873067753,3.633465010553209],[126.84649783049736,4.801733217527598],[121.12701148121516,1.7750630197882629],[119.74882199946086,1.2731875066164804],[118.31156725420288,-3.302435552572419]]],"type":"Polygon"},"id":6},{"type":"Feature","properties":{"name":"Maluku Islands"},"geometry":{"coordinates":[[[124.73134526082453,-4.273868929506008],[125.36280179221461,-8.496711032226742],[127.05073367420033,-8.208361190777396],[128.55651463366848,-9.036777503841776],[134.8467931579026,-7.594931156895839],[135.05323087008725,-5.532127642781205],[131.7380840802888,-3.643912724196312],[128.8965296890326,-2.0066126856923745],[129.4551258514162,2.739999401464189],[128.1314958144643,3.0189445694901167],[124.3306132312888,-0.8290847761823841],[124.01488496559307,-1.945931829174711],[124.73134526082453,-4.273868929506008]]],"type":"Polygon"},"id":7},{"type":"Feature","properties":{"name":"Western New Guinea"},"geometry":{"coordinates":[[[129.4551258514162,-1.9944766923377415],[132.6609820877049,-4.067978076304158],[135.24752518743833,-5.108948453110003],[136.14613640518604,-8.292485185581256],[141.14921507697022,-9.5520863523016],[141.1856452614735,-2.443444241026569],[138.4655248185619,-0.4405207362581791],[129.97729182929658,1.0044874487726503],[129.4551258514162,-1.9944766923377415]]],"type":"Polygon"},"id":8}]};

function checkPolygons(pos) {
	if(!turf) throw new Error("Cannot find required Turf.js library");

	let features = [];

	if(DEFAULT_POLYGONS) {
		let defaultFeatures = DEFAULT_POLYGONS?.features;
		if(!defaultFeatures) throw new Error("Invalid `DEFAULT_POLYGONS` GeoJSON data.");
		features = features.concat(defaultFeatures);
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

function islandMatch(state, guess, location) {
	const guess_poly = checkPolygons(guess);
	const location_poly = checkPolygons(location);

	return {
		player_guess_name: guess_poly?.name || 'Undefined',
		actual_location_name: location_poly?.name || 'Undefined',
		match: guess_poly && location_poly && guess_poly?.index == location_poly?.index
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
	query_openstreetmap: false,
	custom_match_function: islandMatch,
	keyboard_shortcuts: KEYBOARD_SHORTCUTS,
});