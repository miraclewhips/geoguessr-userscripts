// ==UserScript==
// @name         GeoGuessr Scoring Redux
// @description  Adds a new scoring system that rewards guessing in the right regions/states of countries
// @version      1.0
// @author       miraclewhips
// @match        *://*.geoguessr.com/*
// @icon         https://www.google.com/s2/favicons?domain=geoguessr.com
// @grant        none
// @copyright    2022, miraclewhips (https://github.com/miraclewhips)
// @license      MIT
// @downloadURL    https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-scoring-redux.user.js
// @updateURL    https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-scoring-redux.user.js
// ==/UserScript==

const RATIO_GEOGUESSR = 0.4;
const RATIO_COUNTRY = 0.2;
const RATIO_REGION = 0.4;





/* ############################################################################### */
/* ##### DON'T MODIFY ANYTHING BELOW HERE UNLESS YOU KNOW WHAT YOU ARE DOING ##### */
/* ############################################################################### */

let DATA = {};

const load = () => {
	DATA = {
		round: 0,
		round_started: false,
		game_finished: false,
		checking_api: false,
		last_guess: [0, 0]
	}

	let data = JSON.parse(window.localStorage.getItem('geoScoringRedux'));

	if(data) {
		data.round = 0;
		data.round_started = false;
		data.game_finished = false;
		data.checking_api = false;

		Object.assign(DATA, data);
		save();
	}
}

const save = () => {
	window.localStorage.setItem('geoScoringRedux', JSON.stringify(DATA));
}

const getCurrentRound = () => {
	const roundNode = document.querySelector('div[class^="status_inner__"]>div[data-qa="round-number"]');
	return parseInt(roundNode.children[1].textContent.split(/\//gi)[0].trim(), 10);
}

const updateRoundPanel = () => {
	
}

const updateSummaryPanel = () => {
	
}

const startRound = () => {
	DATA.round = getCurrentRound();
	DATA.round_started = true;
	DATA.game_finished = false;

	updateRoundPanel();

	if(document.getElementById('scoring-redux-debug')) {
		document.getElementById('scoring-redux-debug').style.display = 'none';
	}
}

const latLngToMetres = (loc1, loc2) => {
	loc1[0] = parseFloat(loc1[0]);
	loc1[1] = parseFloat(loc1[1]);
	loc2[0] = parseFloat(loc2[0]);
	loc2[1] = parseFloat(loc2[1]);

	var R = 6378.137; // Radius of earth in KM
	var dLat = loc2[0] * Math.PI / 180 - loc1[0] * Math.PI / 180;
	var dLon = loc2[1] * Math.PI / 180 - loc1[1] * Math.PI / 180;
	var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
	Math.cos(loc1[0] * Math.PI / 180) * Math.cos(loc2[0] * Math.PI / 180) *
	Math.sin(dLon/2) * Math.sin(dLon/2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
	var d = R * c;
	return d * 1000; // metres
}

const distancePercentage = (guess, target, region) => {
	let guessDistance = latLngToMetres(guess, target);

	// if it's within 25m, return a perfect score
	if(guessDistance <= 25) return 1;

	let regionDistanceLat = latLngToMetres([region[0], 0], [region[1], 0]);
	let regionDistanceLng = latLngToMetres([0, region[2]], [0, region[3]]);
	let regionDistance = (regionDistanceLat + regionDistanceLng) / 2;
	let percent = 1 - guessDistance / regionDistance;

	// perfect score tolerance
	if(percent >= 0.9997) {
		percent = 1;
	}

	if(percent < 0) {
		percent = 0;
	}

	return percent;
}

const calcTotalScore = (geo, country, region, data) => {
	let scoreGeo = 5000 * RATIO_GEOGUESSR * geo;
	let scoreCountry = 5000 * RATIO_COUNTRY * country;
	let scoreRegion = 5000 * RATIO_REGION * region;

	let total = Math.round(scoreGeo + scoreCountry + scoreRegion);

	if(!document.getElementById('scoring-redux-debug')) {
		let debug = document.createElement('div');
		debug.id = 'scoring-redux-debug';
		debug.style.padding = '5px';
		debug.style.background = 'rgba(0,0,0,0.9)';
		debug.style.color = '#fff';
		debug.style.fontFamily = 'monospace';
		debug.style.fontSize = '14px';
		debug.style.position = 'absolute';
		debug.style.zIndex = '999999';
		debug.style.top = '10px';
		debug.style.left = '10px';
		document.body.append(debug);
	}

	let debug = document.getElementById('scoring-redux-debug');
	debug.innerHTML = `
		<table cellpadding="4" border="1" borderColor="#666">
			<tr>
				<td><strong>Type</strong></td>
				<td style="text-align:right"><strong>Amount</strong></td>
				<td style="text-align:right"><strong>Proximity</strong></td>
				<td style="text-align:right"><strong>Ratio</strong></td>
				<td><strong>Guess Location</strong></td>
				<td><strong>Correct Location</strong></td>
				<td style="text-align:right"><strong>Score</strong></td>
			</tr>
			<tr>
				<td>GeoGuessr Score</td>
				<td style="text-align:right">${Math.round(5000 * geo)}</td>
				<td style="text-align:right">${Math.round(geo * 100)}%</td>
				<td style="text-align:right">${RATIO_GEOGUESSR.toFixed(2)}</td>
				<td>N/A</td>
				<td>N/A</td>
				<td style="text-align:right">${Math.round(5000 * geo * RATIO_GEOGUESSR)}</td>
			</tr>
			<tr>
				<td>Country Score</td>
				<td style="text-align:right">${Math.round(5000 * country)}</td>
				<td style="text-align:right">${Math.round(country * 100)}%</td>
				<td style="text-align:right">${RATIO_COUNTRY.toFixed(2)}</td>
				<td style="color: ${data.guessCountry == data.targetCountry ? '#8f8' : '#f88'}">${data.guessCountry}</td>
				<td style="color: ${data.guessCountry == data.targetCountry ? '#8f8' : '#f88'}">${data.targetCountry}</td>
				<td style="text-align:right">${Math.round(5000 * country * RATIO_COUNTRY)}</td>
			</tr>
			<tr>
				<td>Region/State Score</td>
				<td style="text-align:right">${Math.round(5000 * region)}</td>
				<td style="text-align:right">${Math.round(region * 100)}%</td>
				<td style="text-align:right">${RATIO_REGION.toFixed(2)}</td>
				<td style="color: ${data.guessRegion == data.targetRegion ? '#8f8' : '#f88'}">${data.guessRegion}</td>
				<td style="color: ${data.guessRegion == data.targetRegion ? '#8f8' : '#f88'}">${data.targetRegion}</td>
				<td style="text-align:right">${Math.round(5000 * region * RATIO_REGION)}</td>
			</tr>
			<tr>
				<td colspan="7" style="text-align:right"><strong>Total: ${total}</strong></td>
			</tr>
		</table>
	`;
	debug.style.display = 'block';

	return total;
}

const queryAPI = async (location, zoom) => {
	if (location[0] <= -85.05) {
			return 'AQ';
	}

	let apiUrl = `https://nominatim.openstreetmap.org/reverse.php?lat=${location[0]}&lon=${location[1]}&zoom=${zoom}&format=jsonv2`;

	return await fetch(apiUrl).then(res => res.json());
}

const stopRound = async () => {
	DATA.round_started = false;

	const id = window.location.href.substring(window.location.href.lastIndexOf('/') + 1);

	let apiUrl = `https://www.geoguessr.com/api/v3/games/${id}`;

	if(location.pathname.startsWith("/challenge/")) {
		apiUrl = `https://www.geoguessr.com/api/v3/challenges/${id}/game`;
	}

	DATA.checking_api = true;
	updatePanels();

	let gameDetails = await fetch(apiUrl).then(res => res.json());

	let guess_counter = gameDetails.player.guesses.length;
	let guess = [gameDetails.player.guesses[guess_counter-1].lat, gameDetails.player.guesses[guess_counter-1].lng];
	let target = [gameDetails.rounds[guess_counter-1].lat, gameDetails.rounds[guess_counter-1].lng];

	if (guess[0] == DATA.last_guess[0] && guess[1] == DATA.last_guess[1]) {
		DATA.checking_api = false;
		updatePanels();
		return;
	}

	DATA.last_guess = guess;

	let guessCountry = await queryAPI(guess, 3);
	let targetCountry = await queryAPI(target, 3);

	let scoreGeoguessr = gameDetails.player.guesses[guess_counter-1].roundScoreInPoints / 5000;
	let scoreCountry = 0;
	let scoreRegion = 0;
	let scoreData = {
		guessCountry: guessCountry.address.country,
		targetCountry: targetCountry.address.country,
		guessRegion: null,
		targetRegion: null,
	}

	if(guessCountry.place_id === targetCountry.place_id) {
		scoreCountry = distancePercentage(guess, target, targetCountry.boundingbox);
	}

	let guessRegion = await queryAPI(guess, 5);
	let targetRegion = await queryAPI(target, 5);

	scoreData.guessRegion = guessRegion.name;
	scoreData.targetRegion = targetRegion.name;

	scoreRegion = distancePercentage(guess, target, targetRegion.boundingbox);
	calcTotalScore(scoreGeoguessr, scoreCountry, scoreRegion, scoreData);
}

const updatePanels = () => {
	updateRoundPanel();
	updateSummaryPanel();
}

const init = () => {
	load();

	const observer = new MutationObserver(() => {
		const gameLayout = document.querySelector('.game-layout');
		const resultLayout = document.querySelector('div[class^="result-layout_root"]');
		const finalScoreLayout = document.querySelector('div[class^="result-layout_root"] div[class^="standard-final-result_score__"]');

		if(gameLayout) {
			if (DATA.round !== getCurrentRound()) {
				startRound();
			}else if(resultLayout && DATA.round_started) {
				stopRound();
			}else if(finalScoreLayout && !DATA.game_finished) {
				DATA.game_finished = true;
				updatePanels();
			}
		}
	});

	observer.observe(document.querySelector('#__next'), { subtree: true, childList: true });
}

init();