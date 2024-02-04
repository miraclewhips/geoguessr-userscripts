// ==UserScript==
// @name         GeoGuessr Correct Location Panning
// @description  Opens GeoGuessr locations in Google Maps with the correct panning and coverage date when clicking the flag icon on the map
// @version      1.0
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

let latestGame;

const THE_WINDOW = unsafeWindow || window;
const default_fetch = THE_WINDOW.fetch;
THE_WINDOW.fetch = (function () {
	return async function (...args) {
		const url = args[0].toString();
		if(url.includes(`geoguessr.com/api/v3/games/`)) {
			let result = await default_fetch.apply(THE_WINDOW, args);
			latestGame = await result.clone().json();
			return result;
		}

		return default_fetch.apply(THE_WINDOW, args);
	};
})();

function hex2a(hexx) {
	var hex = hexx.toString();
	var str = '';
	for (var i = 0; i < hex.length; i += 2)
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
	const round = parseInt(e.currentTarget.querySelector(`div[class*="styles_label__"]`)?.innerText ?? data.rounds.length);
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

function clickedMarkerResults(e) {
	const props = __NEXT_DATA__?.props?.pageProps;
	if(!props) return;

	const data = props.gamePlayedByCurrentUser;
	if(!data) return;

	const token = document.location.pathname.split(`/results/`)[1].split(`/`)[0];
	if(token !== (props.challengeToken ?? data.token)) return;
	clickedMarker(e, data);
}

function clickedMarkerDuels(e) {
	const data = __NEXT_DATA__?.props?.pageProps?.game;
	if(!data) return;

	const token = document.location.pathname.split(`/duels/`)[1].split(`/`)[0];
	if(token !== data.gameId) return;

	let loc;

	const rows = document.querySelectorAll(`div[class^="game-summary_playedRound__"]`);
	for(let i = 0; i < rows.length; i++) {
		if(!rows[i].className.includes('game-summary_selectedRound__')) continue;
		loc = data.rounds[i]?.panorama;
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