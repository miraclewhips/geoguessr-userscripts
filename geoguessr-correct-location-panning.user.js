// ==UserScript==
// @name         GeoGuessr Correct Location Panning
// @description  Opens GeoGuessr locations in Google Maps with the correct panning and coverage date when clicking the flag icon on the map
// @version      1.4
// @author       miraclewhips
// @match        *://*.geoguessr.com/*
// @run-at       document-start
// @icon         https://www.google.com/s2/favicons?domain=geoguessr.com
// @grant        unsafeWindow
// @copyright    2024, miraclewhips (https://github.com/miraclewhips)
// @license      MIT
// @downloadURL  https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-correct-location-panning.user.js
// @updateURL    https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-correct-location-panning.user.js
// ==/UserScript==

let latestGame, latestDuel, latestResults;

const THE_WINDOW = unsafeWindow || window;
const default_fetch = THE_WINDOW.fetch;
THE_WINDOW.fetch = (function () {
	return async function (...args) {
		let result;
		const url = args[0].toString();
		if(url.includes(`geoguessr.com/api/v3/games/`)) {
			result = await default_fetch.apply(THE_WINDOW, args);
			latestGame = await result.clone().json();
		}else if(url.includes(`/_next/data/`) && url.includes(`summary.json?token=`)) {
			result = await default_fetch.apply(THE_WINDOW, args);
			const data = await result.clone().json();
			latestDuel = data?.pageProps?.game;
		}else if(url.includes(`/_next/data/`) && url.includes(`/results/`) && url.includes(`.json?token=`)) {
			result = await default_fetch.apply(THE_WINDOW, args);
			const data = await result.clone().json();
			latestResults = data?.pageProps;
		}

		return result ?? default_fetch.apply(THE_WINDOW, args);
	};
})();

function hex2a(hexx) {
	const hex = hexx.toString();
	let str = '';
	for (let i = 0; i < hex.length; i += 2)
			str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
	return str;
}

function googleMapsLink(loc) {
	const fov = 180 / Math.pow(2, loc.zoom ?? 0);
	let link = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${loc.lat},${loc.lng}&heading=${loc.heading}&pitch=${loc.pitch}&fov=${fov}`;
	
	if(loc.panoId) {
		link += `&pano=${hex2a(loc.panoId)}`;
	}
	
	return link;
}

function openLink(e, loc) {
	e.preventDefault();
	e.stopPropagation();

	const link = document.createElement(`a`);
	link.href = googleMapsLink(loc);
	link.target = `_blank`;
	link.click();
}

function clickedMarker(e, data) {
	const roundNum = data.player.guesses.length ?? data.rounds.length;
	const round = parseInt(e.currentTarget.querySelector(`div[class*="styles_label__"]`)?.innerText ?? roundNum);
	const loc = data.rounds[round - 1];
	if(!loc) return;

	openLink(e, loc);
}

function clickedMarkerGame(e) {
	if(!latestGame) return;

	const token = document.location.pathname.split(`/game/`)[1].split(`/`)[0];
	if(token !== latestGame.token) return;

	clickedMarker(e, latestGame);
}

function clickedMarkerChallenge(e) {
	const data = latestGame || __NEXT_DATA__?.props?.pageProps?.gameSnapshot;
	if(!data) return;

	clickedMarker(e, data);
}

function clickedMarkerResults(e) {
	const props = latestResults || __NEXT_DATA__?.props?.pageProps;
	if(!props) return;

	const data = props.gamePlayedByCurrentUser;
	if(!data) return;

	clickedMarker(e, data);
}

function clickedMarkerDuels(e) {
	const data = __NEXT_DATA__?.props?.pageProps?.game || latestDuel;
	if(!data) return;

	const token = document.location.pathname.split(`/duels/`)[1].split(`/`)[0];
	if(token !== data.gameId) return;

	let loc;

	const rows = document.querySelectorAll(`div[class^="game-summary_playedRound__"]`);
	for(let i = 0; i < rows.length; i++) {
		if(!rows[i].className.includes('game-summary_selectedRound__')) continue;

		const roundEl = rows[i].querySelector(`div[class^="game-summary_text__"]`);
		if(!roundEl) continue;

		const round = parseInt(roundEl.childNodes[0].textContent.replace(/[^\d]/g, ''));
		loc = data.rounds[round-1]?.panorama;
		break;
	}
	
	if(!loc) return;

	openLink(e, loc);
}

const init = () => {
	const observer = new MutationObserver(() => {
		for(const marker of document.querySelectorAll(`div[class*="map-pin_clickable__"]:not([data-mwclp="true"])`)) {
			marker.dataset.mwclp = true;

			if(document.location.pathname.startsWith(`/game/`)) {
				marker.addEventListener(`click`, clickedMarkerGame);
			}else if(document.location.pathname.startsWith(`/challenge/`)) {
				marker.addEventListener(`click`, clickedMarkerChallenge);
			}else if(document.location.pathname.startsWith(`/results/`)) {
				marker.addEventListener(`click`, clickedMarkerResults);
			}else if(document.location.pathname.startsWith(`/duels/`)) {
				marker.addEventListener(`click`, clickedMarkerDuels);
			}
		}
	});

	observer.observe(document.body, { subtree: true, childList: true });
}

init();
