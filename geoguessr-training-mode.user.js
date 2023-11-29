// ==UserScript==
// @name         GeoGuessr Training Mode
// @description  Save locations to Map Making App, toggle compass, terrain mode, hide car, and more.
// @version      1.6
// @author       miraclewhips
// @match        *://*.geoguessr.com/*
// @run-at       document-start
// @require      https://miraclewhips.dev/geoguessr-event-framework/geoguessr-event-framework.min.js?v=5
// @icon         https://www.google.com/s2/favicons?domain=geoguessr.com
// @grant        unsafeWindow
// @grant        GM_addStyle
// @grant        GM_openInTab
// @copyright    2022, miraclewhips (https://github.com/miraclewhips)
// @license      MIT
// @downloadURL  https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-training-mode.user.js
// @updateURL    https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-training-mode.user.js
// ==/UserScript==


/* ----- API KEY INSTRUCTIONS -----

Requires an API key from Map Making App in order to save locations.
Create one here: https://map-making.app/keys
Make sure not to share this key with anybody or show it publically as it will allow anybody to edit your maps.

Replace `PASTE_YOUR_KEY_HERE` with your generated API key (make sure not to delete the quotes surrounding the key) */
const MAP_MAKING_API_KEY = "PASTE_YOUR_KEY_HERE";










/* ############################################################################### */
/* ##### DON'T MODIFY ANYTHING BELOW HERE UNLESS YOU KNOW WHAT YOU ARE DOING ##### */
/* ############################################################################### */

const compassColors = {
	n: '#fd8f8f',
	ne: '#f8ce74',
	e: '#feff84',
	se: '#a3fa80',
	s: '#8affe2',
	sw: '#77aaf7',
	w: '#bb6ff5',
	nw: '#ffa1d6',
}

GM_addStyle(`
button[class^="compass_compass__"],
body.mwgtm-compass-hidden div[class^="panorama-compass_compassContainer__"] ,
body.mwgtm-compass-hidden .mwgtm-compass {
	display: none !important;
}

.mwgtm-modal {
	position: fixed;
	inset: 0;
	z-index: 99999;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-direction: column;
}

.mwgtm-modal .dim {
	position: fixed;
	inset: 0;
	z-index: 0;
	background: rgba(0,0,0,0.75);
}

.mwgtm-modal .text {
	position: relative;
	z-index: 1;
}

.mwgtm-modal .inner {
	box-sizing: border-box;
	position: relative;
	z-index: 1;
	background: #fff;
	padding: 20px;
	margin: 20px;
	width: calc(100% - 40px);
	max-width: 500px;
	overflow: auto;
	color: #000;
	flex: 0 1 auto;
}

#mwgtm-loader {
	color: #fff;
	font-weight: bold;
}

#mwgtm-button {
	position: absolute;
	top: 20px;
	left: 20px;
	z-index: 100;
	background: var(--ds-color-purple-100);
	color: #fff;
	padding: 10px 15px;
	font-weight: bold;
	cursor: pointer;
	border-radius: 4px;
}

.mwgtm-settings {
	position: absolute;
	top: 1rem;
	left: 1rem;
	z-index: 9;
	display: flex;
	flex-direction: column;
	gap: 5px;
	align-items: flex-start;
}

.mwgtm-settings.extra-pad {
	top: 2.5rem;
}

.mwgtm-title {
	font-size: 15px;
	font-weight: bold;
	text-shadow: rgb(204, 48, 46) 2px 0px 0px, rgb(204, 48, 46) 1.75517px 0.958851px 0px, rgb(204, 48, 46) 1.0806px 1.68294px 0px, rgb(204, 48, 46) 0.141474px 1.99499px 0px, rgb(204, 48, 46) -0.832294px 1.81859px 0px, rgb(204, 48, 46) -1.60229px 1.19694px 0px, rgb(204, 48, 46) -1.97998px 0.28224px 0px, rgb(204, 48, 46) -1.87291px -0.701566px 0px, rgb(204, 48, 46) -1.30729px -1.5136px 0px, rgb(204, 48, 46) -0.421592px -1.95506px 0px, rgb(204, 48, 46) 0.567324px -1.91785px 0px, rgb(204, 48, 46) 1.41734px -1.41108px 0px, rgb(204, 48, 46) 1.92034px -0.558831px 0px;
	position: relative;
	z-index: 1;
}

.mwgtm-subtitle {
	font-size: 12px;
	background: rgba(204, 48, 46, 0.4);
	padding: 3px 5px;
	border-radius: 5px;
	position: relative;
	z-index: 0;
	top: -8px;
	text-shadow: 0 1px 2px rgba(0,0,0,0.5);
}

.mwgtm-subtitle a:hover {
	text-decoration: underline;
}

.mwgtm-settings-option {
	background: var(--ds-color-purple-100);
	padding: 6px 10px;
	border-radius: 5px;
	font-size: 12px;
	cursor: pointer;
	opacity: 0.75;
	transition: opacity 0.2s;
}

.mwgtm-settings-option:hover {
	opacity: 1;
}

#mwgtm-car-warning {
	position: absolute;
	bottom: 1rem;
	left: 50%;
	z-index: 100;
	transform: translateX(-50%);
	padding: 5px 10px;
	border-radius: 5px;
	font-weight: bold;
	color: #fff;
	background: #900;
}

#mwgtm-map-list h3 {
	margin-bottom: 10px;
}

#mwgtm-map-list .tag-input {
	display: block;
	width: 100%;
	font: inherit;
}

#mwgtm-map-list .maps {
	max-height: 200px;
	overflow-x: hidden;
	overflow-y: auto;
	font-size: 15px;
}

#mwgtm-map-list .map {
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 20px;
	padding: 8px;
	transition: background 0.2s;
}

#mwgtm-map-list .map:nth-child(2n) {
	background: #f0f0f0;
}

#mwgtm-map-list .map-buttons:not(.is-added) .map-added {
	display: none !important;
}
#mwgtm-map-list .map-buttons.is-added .map-add {
	display: none !important;
}

#mwgtm-map-list .map-add {
	background: var(--ds-color-green-80);
	color: #fff;
	padding: 3px 6px;
	border-radius: 5px;
	font-size: 13px;
	font-weight: bold;
	cursor: pointer;
}

#mwgtm-map-list .map-added {
	background: #000;
	color: #fff;
	padding: 3px 6px;
	border-radius: 5px;
	font-size: 13px;
	font-weight: bold;
}

div[class^="panorama-compass_compassContainer__"] {
	background-color: var(--ds-color-black-80);
}

/* NW */
div[class^="panorama-compass_latitude___"]:nth-of-type(1) span[class^="panorama-compass_latitudeLabel__"] {
	color: ${compassColors.nw};
}
div[class^="panorama-compass_latitude___"]:nth-of-type(1) span[class^="panorama-compass_latitudeLines__"] {
	background-color: ${compassColors.nw};
}

/* N */
div[class^="panorama-compass_latitude___"]:nth-of-type(2) span[class^="panorama-compass_latitudeLabel__"] {
	color: ${compassColors.n};
}
div[class^="panorama-compass_latitude___"]:nth-of-type(2) span[class^="panorama-compass_latitudeLines__"] {
	background-color: ${compassColors.n};
}

/* NE */
div[class^="panorama-compass_latitude___"]:nth-of-type(3) span[class^="panorama-compass_latitudeLabel__"] {
	color: ${compassColors.ne};
}
div[class^="panorama-compass_latitude___"]:nth-of-type(3) span[class^="panorama-compass_latitudeLines__"] {
	background-color: ${compassColors.ne};
}

/* E */
div[class^="panorama-compass_latitude___"]:nth-of-type(4) span[class^="panorama-compass_latitudeLabel__"] {
	color: ${compassColors.e};
}
div[class^="panorama-compass_latitude___"]:nth-of-type(4) span[class^="panorama-compass_latitudeLines__"] {
	background-color: ${compassColors.e};
}

/* SE */
div[class^="panorama-compass_latitude___"]:nth-of-type(5) span[class^="panorama-compass_latitudeLabel__"] {
	color: ${compassColors.se};
}
div[class^="panorama-compass_latitude___"]:nth-of-type(5) span[class^="panorama-compass_latitudeLines__"] {
	background-color: ${compassColors.se};
}

/* S */
div[class^="panorama-compass_latitude___"]:nth-of-type(6) span[class^="panorama-compass_latitudeLabel__"] {
	color: ${compassColors.s};
}
div[class^="panorama-compass_latitude___"]:nth-of-type(6) span[class^="panorama-compass_latitudeLines__"] {
	background-color: ${compassColors.s};
}

/* SW */
div[class^="panorama-compass_latitude___"]:nth-of-type(7) span[class^="panorama-compass_latitudeLabel__"] {
	color: ${compassColors.sw};
}
div[class^="panorama-compass_latitude___"]:nth-of-type(7) span[class^="panorama-compass_latitudeLines__"] {
	background-color: ${compassColors.sw};
}

/* W */
div[class^="panorama-compass_latitude___"]:nth-of-type(8) span[class^="panorama-compass_latitudeLabel__"] {
	color: ${compassColors.w};
}
div[class^="panorama-compass_latitude___"]:nth-of-type(8) span[class^="panorama-compass_latitudeLines__"] {
	background-color: ${compassColors.w};
}

aside[class^="game_controls___"] {
	z-index: 9;
}

.mwgtm-compass {
	background: transparent;
	border: 0;
	height: 3rem;
	outline: none;
	padding: 0;
	position: absolute;
	-webkit-user-select: none;
	-moz-user-select: none;
	user-select: none;
	width: 3rem;
	left: 0;
	bottom: 14rem;
}

.mwgtm-compass .circle {
	border-radius: 100%;
	box-shadow: inset 0 0 0 0.75rem var(--ds-color-white);
	height: 100%;
	opacity: .4;
	width: 100%;
}

.mwgtm-compass .arrow {
	height: 3rem;
	left: calc(50% - 0.375rem);
	position: absolute;
	top: calc(50% - 1.5rem);
	width: 0.75rem;
}
`);

function defaultState() {
	return {
		compassHidden: false,
		terrainEnabled: false,
		carSetting: 0,
		coverageEnabled: false,
		recentMaps: []
	}
}

function loadState() {
	let data = window.localStorage.getItem('mwgtm_state');
	if(!data) return;
	
	let dataJson = JSON.parse(data);
	if(!data) return;

	Object.assign(MWGTM_STATE, defaultState(), dataJson);
	saveState();
}

function saveState() {
	window.localStorage.setItem('mwgtm_state', JSON.stringify(MWGTM_STATE));
}

var MWGTM_STATE = defaultState();
loadState();

const LOADED_CAR_SETTING = MWGTM_STATE.carSetting;

async function mmaFetch(url, options = {}) {
	const response = await fetch(new URL(url, 'https://map-making.app'), {
		...options,
		headers: {
			accept: 'application/json',
			authorization: `API ${MAP_MAKING_API_KEY.trim()}`,
			...options.headers
		}
	});
	if (!response.ok) {
		let message = 'Unknown error';
		try {
			const res = await response.json();
			if (res.message) {
				message = res.message;
			}
		} catch {
		}
		alert(`An error occurred while trying to connect to Map Making App. ${message}`);
		throw Object.assign(new Error(message), { response });
	}
	return response;
}
async function getMaps() {
	const response = await mmaFetch(`/api/maps`);
	const maps = await response.json();
	return maps;
}
async function importLocations(mapId, locations) {
	const response = await mmaFetch(`/api/maps/${mapId}/locations`, {
		method: 'post',
		headers: {
			'content-type': 'application/json'
		},
		body: JSON.stringify({
			edits: [{
				action: { type: 4 },
				create: locations,
				remove: []
			}]
		})
	});
	await response.json();
}

var LOCATION;
var MAP_LIST;

if(!GeoGuessrEventFramework) {
	throw new Error('GeoGuessr Location Manager requires GeoGuessr Event Framework (https://github.com/miraclewhips/geoguessr-event-framework). Please include this before you include GeoGuessr Location Manager.');
}

function addSettingsButtonsToRound() {
	const container = document.querySelector(`div[class^="game_canvas__"]`);

	if(!container || document.getElementById('mwgtm-settings-buttons')) return;

	let faceNorthBtn = '';
	if(!JSON.parse(window.localStorage.getItem('game-settings')).forbidRotating) {
		faceNorthBtn = `<div class="mwgtm-settings-option" id="mwgtm-opt-compass-north">FACE NORTH - [ N ]</div>`;
	}

	const element = document.createElement('div');
	element.id = 'mwgtm-settings-buttons';
	element.className = 'mwgtm-settings extra-pad';
	element.innerHTML = `
		<div class="mwgtm-title">TRAINING MODE</div>
		<div class="mwgtm-subtitle">by <a href="https://miraclewhips.dev/" target="_blank" rel="noopener noreferrer">miraclewhips</a>. <a href="https://ko-fi.com/miraclewhips" target="_blank" rel="noopener noreferrer">Support my work</a>.</div>
		${faceNorthBtn}
		<div class="mwgtm-settings-option" id="mwgtm-opt-compass-toggle">COMPASS VISIBLE - [ H ]</div>
		<div class="mwgtm-settings-option" id="mwgtm-opt-terrain">TERRAIN DISABLED - [ T ]</div>
		<div class="mwgtm-settings-option" id="mwgtm-opt-car">CAR VISIBLE - [ M ]</div>
		<div class="mwgtm-settings-option" id="mwgtm-opt-coverage">COVERAGE HIDDEN - [ B ]</div>
	`;

	container.appendChild(element);

	createSettingsButtonEvents();
}

function createSettingsButtonEvents() {
	if(document.getElementById('mwgtm-opt-compass-north')) {
		document.getElementById('mwgtm-opt-compass-north').addEventListener('click', () => {
			lookNorth();
		});
	}

	document.getElementById('mwgtm-opt-compass-toggle').addEventListener('click', () => {
		toggleCompass();
	});

	document.getElementById('mwgtm-opt-terrain').addEventListener('click', () => {
		toggleTerrain();
	});

	document.getElementById('mwgtm-opt-car').addEventListener('click', () => {
		toggleCar();
	});

	document.getElementById('mwgtm-opt-coverage').addEventListener('click', () => {
		toggleCoverage();
	});

	toggleCompass(MWGTM_STATE.compassHidden);
	toggleTerrain(MWGTM_STATE.terrainEnabled);
	toggleCar(MWGTM_STATE.carSetting);
	toggleCoverage(MWGTM_STATE.coverageEnabled);
}

function lookNorth() {
	if(!document.getElementById('mwgtm-opt-compass-north')) return;

	if(JSON.parse(window.localStorage.getItem('game-settings')).forbidRotating) return;

	if(MWGTM_SV) {
		let pov = MWGTM_SV.getPov();
		pov.heading = 0;
		MWGTM_SV.setPov(pov);
	}
}

function toggleCompass(hidden) {
	if(!document.getElementById('mwgtm-opt-compass-toggle')) return;

	if(typeof hidden === 'undefined') {
		hidden = !MWGTM_STATE.compassHidden;
	}
	
	document.body.classList.toggle('mwgtm-compass-hidden', hidden);
	document.getElementById('mwgtm-opt-compass-toggle').textContent = hidden ? 'COMPASS HIDDEN - [ H ]' : 'COMPASS VISIBLE - [ H ]';
	
	MWGTM_STATE.compassHidden = hidden;
	saveState();
}

function toggleTerrain(enabled) {
	if(!document.getElementById('mwgtm-opt-terrain')) return;

	if(typeof enabled === 'undefined') {
		enabled = !MWGTM_STATE.terrainEnabled;
	}
	
	document.getElementById('mwgtm-opt-terrain').textContent = enabled ? 'TERRAIN ENABLED - [ T ]' : 'TERRAIN DISABLED - [ T ]';

	if(document.getElementById('mwgtm-opt-terrain-summary')) {
		document.getElementById('mwgtm-opt-terrain-summary').textContent = enabled ? 'TERRAIN ENABLED - [ T ]' : 'TERRAIN DISABLED - [ T ]';
	}
	
	if(MWGTM_M) {
		MWGTM_M.setMapTypeId(enabled ? 'terrain' : 'roadmap');
	}
	
	MWGTM_STATE.terrainEnabled = enabled;
	saveState();
}

function toggleCar(setting) {
	if(!document.getElementById('mwgtm-opt-car')) return;

	if(typeof setting === 'undefined') {
		setting = (MWGTM_STATE.carSetting + 1) % 3
	}

	let label = 'CAR VISIBLE';
	switch(setting) {
		case 1: label = 'CAR MASK SLIM'; break;
		case 2: label = 'CAR MASK FULL'; break;
	}

	document.getElementById('mwgtm-opt-car').textContent = `${label} - [ M ]`;
	
	MWGTM_STATE.carSetting = setting;
	saveState();

	if(LOADED_CAR_SETTING !== setting) {
		showCarWarning();
	}else{
		hideCarWarning();
	}
}

function toggleCoverage(enabled) {
	if(!document.getElementById('mwgtm-opt-coverage')) return;

	if(typeof enabled === 'undefined') {
		enabled = !MWGTM_STATE.coverageEnabled;
	}
	
	document.getElementById('mwgtm-opt-coverage').textContent = enabled ? 'COVERAGE VISIBLE - [ B ]' : 'COVERAGE HIDDEN - [ B ]';

	if(document.getElementById('mwgtm-opt-coverage-summary')) {
		document.getElementById('mwgtm-opt-coverage-summary').textContent = enabled ? 'COVERAGE VISIBLE - [ B ]' : 'COVERAGE HIDDEN - [ B ]';
	}
	
	if(MWGTM_SVC && MWGTM_M) {
		if(enabled) {
			MWGTM_M.overlayMapTypes.insertAt(0, MWGTM_SVC);
		}else{
			MWGTM_M.overlayMapTypes.removeAt(0);
		}
	}
	
	MWGTM_STATE.coverageEnabled = enabled;
	saveState();
}

function showCarWarning() {
	const container = document.querySelector(`div[class^="game_canvas__"]`);
	if(!container || document.getElementById('mwgtm-car-warning')) return;

	const element = document.createElement('div');
	element.id = 'mwgtm-car-warning';
	element.textContent = 'MUST RELOAD PAGE FOR CAR MASK CHANGE TO TAKE EFFECT';
	container.appendChild(element);
}

function hideCarWarning() {
	const element = document.getElementById('mwgtm-car-warning');
	if(element) element.remove();
}

function showLoader() {
	if(document.getElementById('mwgtm-loader')) return;

	const element = document.createElement('div');
	element.id = 'mwgtm-loader';
	element.className = 'mwgtm-modal';
	element.innerHTML = `
		<div class="text">LOADING...</div>
		<div class="dim"></div>
	`;
	document.body.appendChild(element);
}

function hideLoader() {
	const element = document.getElementById('mwgtm-loader');
	if(element) element.remove();
}

async function clickedMapButton(e) {
	if(MAP_MAKING_API_KEY === 'PASTE_YOUR_KEY_HERE') {
		alert('An API Key is required in order to save locations to Map Making App. Please add your API key by editing the Userscript and following the instructions at the top of the script.');
		return;
	}

	if(!MAP_LIST) {
		showLoader();

		try {
			MAP_LIST = await getMaps();
		}catch{}

		hideLoader();
	}

	if(MAP_LIST) {
		showMapList()
	}
}

function showMapList() {
	if(document.getElementById('mwgtm-map-list')) return;

	const element = document.createElement('div');
	element.id = 'mwgtm-map-list';
	element.className = 'mwgtm-modal';

	let recentMapsSection = ``;
	if(MWGTM_STATE.recentMaps.length > 0) {
		let recentMapsHTML = '';
		for(let m of MWGTM_STATE.recentMaps) {
			if(m.archivedAt) continue;
			recentMapsHTML += `<div class="map">
				<span class="map-name">${m.name}</span>
				<span class="map-buttons">
					<span class="map-add" data-id="${m.id}">ADD</span>
					<span class="map-added">ADDED</span>
				</span>
			</div>`;
		}

		recentMapsSection = `
			<h3>Recent Maps</h3>

			<div class="maps">
				${recentMapsHTML}
			</div>

			<br>
		`;
	}

	let mapsHTML = '';
	for(let m of MAP_LIST) {
		if(m.archivedAt) continue;
		mapsHTML += `<div class="map">
			<span class="map-name">${m.name}</span>
			<span class="map-buttons">
				<span class="map-add" data-id="${m.id}">ADD</span>
				<span class="map-added">ADDED</span>
			</span>
		</div>`;
	}

	element.innerHTML = `
		<div class="inner">
			<h3>Tags (comma separated)</h3>

			<input type="text" class="tag-input" id="mwgtm-map-tags" />

			<br><br>

			${recentMapsSection}

			<h3>All Maps</h3>
		
			<div class="maps">
				${mapsHTML}
			</div>
		</div>

		<div class="dim"></div>
	`;

	document.body.appendChild(element);

	element.querySelector('.dim').addEventListener('click', closeMapList);

	document.getElementById('mwgtm-map-tags').addEventListener('keyup', e => e.stopPropagation());
	document.getElementById('mwgtm-map-tags').addEventListener('keydown', e => e.stopPropagation());
	document.getElementById('mwgtm-map-tags').addEventListener('keypress', e => e.stopPropagation());
	document.getElementById('mwgtm-map-tags').focus();

	for(let map of element.querySelectorAll('.maps .map-add')) {
		map.addEventListener('click', addLocationToMap);
	}
}

function closeMapList(e) {
	const element = document.getElementById('mwgtm-map-list');
	if(element) element.remove();
}

function addLocationToMap(e) {
	e.target.parentNode.classList.add('is-added');

	const id = parseInt(e.target.dataset.id);
	MWGTM_STATE.recentMaps = MWGTM_STATE.recentMaps.filter(e => e.id !== id).slice(0, 2);
	for(let map of MAP_LIST) {
		if(map.id === id) {
			MWGTM_STATE.recentMaps.unshift(map);
			break;
		}
	}
	saveState();

	importLocations(id, [{
		id: -1,
		location: {lat: LOCATION.lat, lng: LOCATION.lng},
		panoId: LOCATION.panoId ?? null,
		heading: LOCATION.heading,
		pitch: LOCATION.pitch,
		zoom: LOCATION.zoom === 0 ? null : LOCATION.zoom,
		tags: document.getElementById('mwgtm-map-tags').value.split(',').map(t => t.trim()).filter(t => t.length > 0),
		flags: LOCATION.panoId ? 1 : 0
	}]);
}

function googleMapsLink(loc) {
	const fov = 180 / Math.pow(2, loc.zoom ?? 0);
	let link = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${loc.lat},${loc.lng}&heading=${loc.heading}&pitch=${loc.pitch}&fov=${fov}`;
	
	if(loc.panoId) {
		link += `&pano=${loc.panoId}`;
	}
	
	return link;
}

function addSettingsButtonsToSummary() {
	const container = document.querySelector(`div[data-qa="result-view-top"]`);

	if(!container || document.getElementById('mwgtm-settings-buttons-summary')) return;

	const element = document.createElement('div');
	element.id = 'mwgtm-settings-buttons-summary';
	element.className = 'mwgtm-settings';
	element.innerHTML = `
		<div class="mwgtm-title">TRAINING MODE</div>
		<div class="mwgtm-subtitle">by <a href="https://miraclewhips.dev/" target="_blank" rel="noopener noreferrer">miraclewhips</a>. <a href="https://ko-fi.com/miraclewhips" target="_blank" rel="noopener noreferrer">Support my work</a>.</div>
		<div class="mwgtm-settings-option" id="mwgtm-opt-save-loc">SAVE TO MAP</div>
		<div class="mwgtm-settings-option" id="mwgtm-opt-open-maps">OPEN IN GOOGLE MAPS</div>
		<div class="mwgtm-settings-option" id="mwgtm-opt-terrain-summary">TERRAIN DISABLED - [ T ]</div>
		<div class="mwgtm-settings-option" id="mwgtm-opt-coverage-summary">COVERAGE HIDDEN - [ B ]</div>
	`;

	container.appendChild(element);

	createSettingsButtonSummaryEvents();
}

function createSettingsButtonSummaryEvents() {
	document.getElementById('mwgtm-opt-save-loc').addEventListener('click', () => {
		clickedMapButton();
	});

	document.getElementById('mwgtm-opt-open-maps').addEventListener('click', () => {
		const link = googleMapsLink(LOCATION);
		GM_openInTab(link, false);
	});

	document.getElementById('mwgtm-opt-terrain-summary').addEventListener('click', () => {
		toggleTerrain();
	});

	document.getElementById('mwgtm-opt-coverage-summary').addEventListener('click', () => {
		toggleCoverage();
	});
}

GeoGuessrEventFramework.init().then(GEF => {
	console.log('GeoGuessr Training Mode initialised.');

	document.addEventListener('keypress', (e) => {
		if(e.ctrlKey || e.shiftKey || e.metaKey || e.altKey || document.activeElement.tagName === 'INPUT') return;
		
		switch(e.code) {
			case 'KeyN': lookNorth(); return;
			case 'KeyH': toggleCompass(); return;
			case 'KeyT': toggleTerrain(); return;
			case 'KeyM': toggleCar(); return;
			case 'KeyB': toggleCoverage(); return;
		}
	})

	GEF.events.addEventListener('round_start', (state) => {
		addSettingsButtonsToRound();
	});

	GEF.events.addEventListener('round_end', (state) => {
		const loc = state.detail.rounds[state.detail.rounds.length - 1]?.location;
		if(!loc) return;

		LOCATION = loc;
		addSettingsButtonsToSummary();
	});
});

//styles_columnOne__rw8hK
const observer = new MutationObserver(() => {
	if(document.getElementById('mwgtm-restore-classic-compass')) return;

	let container = document.querySelector('aside[class^="game_controls___"]');
	if(container) {
		let compass = document.createElement('div');
		compass.id = 'mwgtm-restore-classic-compass';
		compass.className = 'mwgtm-compass';
		compass.innerHTML = `<div class="circle"></div><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 96" class="arrow" id="mwgtm-compass-arrow"><g fill="none" fill-rule="evenodd"><path fill="#B82A2A" d="M12 0v48H0z"/><path fill="#CC2F30" d="M12 0v48h12z"/><path fill="#E6E6E6" d="M12 96V48H0z"/><path fill="#FFF" d="M12 96V48h12z"/></g></svg>`;
		container.appendChild(compass);
	}
});

observer.observe(document.querySelector('#__next'), { subtree: true, childList: true });

let MWGTM_SV, MWGTM_M, MWGTM_SVC;

// Script injection, extracted from unityscript extracted from extenssr:
// https://gitlab.com/nonreviad/extenssr/-/blob/main/src/injected_scripts/maps_api_injecter.ts

function overrideOnLoad(googleScript, observer, overrider) {
	const oldOnload = googleScript.onload;
	googleScript.onload = (event) => {
		const google = window['google'] || unsafeWindow['google'];
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

document.addEventListener('DOMContentLoaded', (event) => {
	injecter(() => {
		const google = window['google'] || unsafeWindow['google'];
		if(!google) return;

		google.maps.StreetViewPanorama = class extends google.maps.StreetViewPanorama {
			constructor(...args) {
				super(...args);
				MWGTM_SV = this;

				MWGTM_SV.addListener('pov_changed', () => {
					const arrow = document.getElementById('mwgtm-compass-arrow');
					if(!arrow) return;

					const heading = MWGTM_SV.getPov().heading;
					arrow.style.transform = `rotate(${-heading}deg)`;
				});
			}
		}
		
		google.maps.Map = class extends google.maps.Map {
			constructor(...args) {
				super(...args);
				MWGTM_M = this;

				MWGTM_SVC = new google.maps.ImageMapType({
					getTileUrl: (point, zoom) => `https://www.google.com/maps/vt?pb=!1m7!8m6!1m3!1i${zoom}!2i${point.x}!3i${point.y}!2i9!3x1!2m8!1e2!2ssvv!4m2!1scc!2s*211m3*211e2*212b1*213e2*212b1*214b1!4m2!1ssvl!2s*211b0*212b1!3m8!2sen!3sus!5e1105!12m4!1e68!2m2!1sset!2sRoadmap!4e0!5m4!1e0!8m2!1e1!1e1!6m6!1e12!2i2!11e0!39b0!44e0!50e`,
					tileSize: new google.maps.Size(256, 256),
					maxZoom: 9,
					minZoom: 0,
				});

				toggleCoverage(MWGTM_STATE.coverageEnabled);

				MWGTM_M.addListener('idle', () => {
					toggleTerrain(MWGTM_STATE.terrainEnabled);
				});
			}
		}
	});
});

// car shaders credit to drparse and victheturtle
// https://openuserjs.org/scripts/drparse/GeoNoCar
// https://greasyfork.org/en/scripts/459812-geonocar-lite

const vertexOld = "const float f=3.1415926;varying vec3 a;uniform vec4 b;attribute vec3 c;attribute vec2 d;uniform mat4 e;void main(){vec4 g=vec4(c,1);gl_Position=e*g;a=vec3(d.xy*b.xy+b.zw,1);a*=length(c);}";
const fragOld = "precision highp float;const float h=3.1415926;varying vec3 a;uniform vec4 b;uniform float f;uniform sampler2D g;void main(){vec4 i=vec4(texture2DProj(g,a).rgb,f);gl_FragColor=i;}";

const vertexNewSlim = `
varying vec3 a;
varying vec3 potato;
uniform vec4 b;
attribute vec3 c;
attribute vec2 d;
uniform mat4 e;
 
void main(){
    vec4 g=vec4(c,1);
    gl_Position=e*g;
    a = vec3(d.xy * b.xy + b.zw,1);
    a *= length(c);
    potato = vec3(d.xy, 1.0) * length(c);
}`;

const fragNewSlim = `
precision highp float;
varying vec3 a;
varying vec3 potato;
uniform vec4 b;
uniform float f;
uniform sampler2D g;
 
bool show(float alpha1, float alpha2) {
    float alpha3 = abs(alpha1 - 0.5);
    float alpha4 = (alpha3 > 0.25) ? 0.5 - alpha3 : alpha3;
    if (alpha4 < 0.0062) {
        return alpha2 > 0.63;
    } else if (alpha4 < 0.0066) {
        return alpha2 > mix(0.63, 0.67, (alpha4-0.0062) / (0.0066-0.0062));
    } else if (alpha4 < 0.065) {
        return alpha2 > 0.67;
    } else if (alpha4 < 0.10) {
        return alpha2 > mix(0.67, 0.715, (alpha4-0.065) / (0.10-0.065));
    } else if (alpha4 < 0.16) {
        return alpha2 > mix(0.715, 0.73, (alpha4-0.10) / (0.16-0.10));
    } else if (alpha4 < 0.175) {
        return alpha2 > mix(0.73, 0.79, (alpha4-0.16) / (0.175-0.16));
    } else {
        return alpha2 > 0.81 - 3.5 * (alpha4 - 0.25) * (alpha4 - 0.25);
    }
}
 
void main(){
    vec2 aD = potato.xy / a.z;
    vec4 i = vec4(show(aD.x, aD.y) ? vec3(float(0.1), float(0.1), float(0.1)) : texture2DProj(g,a).rgb, f);
    gl_FragColor=i;
}`;

const vertexNewFull = `
const float f=3.1415926;
varying vec3 a;
varying vec3 potato;
uniform vec4 b;
attribute vec3 c;
attribute vec2 d;
uniform mat4 e;
void main(){
vec4 g=vec4(c,1);
gl_Position=e*g;
a = vec3(d.xy * b.xy + b.zw,1);
a *= length(c);

potato = vec3(d.xy, 1.0) * length(c);
}`;
const fragNewFull = `precision highp float;
const float h=3.1415926;
varying vec3 a;
varying vec3 potato;
uniform vec4 b;
uniform float f;
uniform sampler2D g;
void main(){

vec2 aD = potato.xy / a.z;
float thetaD = aD.y;

float thresholdD1 = 0.6;
float thresholdD2 = 0.7;

float x = aD.x;
float y = abs(4.0*x - 2.0);
float phiD = smoothstep(0.0, 1.0, y > 1.0 ? 2.0 - y : y);

vec4 i = vec4(
thetaD > mix(thresholdD1, thresholdD2, phiD)
? vec3(float(0.1), float(0.1), float(0.1)) // texture2DProj(g,a).rgb * 0.25
: texture2DProj(g,a).rgb
,f);
gl_FragColor=i;
}`;

function getVertexShader() {
	switch(MWGTM_STATE.carSetting) {
		case 1: return vertexNewSlim;
		case 2: return vertexNewFull;
	}
}
function getFragShader() {
	switch(MWGTM_STATE.carSetting) {
		case 1: return fragNewSlim;
		case 2: return fragNewFull;
	}
}

function installShaderSource(ctx) {
	const oldShaderSource = ctx.shaderSource;

	function shaderSource() {
		if(typeof arguments[1] === 'string') {
			if(arguments[1] === vertexOld) {
				const s = getVertexShader();
				if(s) arguments[1] = s;
			}else if (arguments[1] === fragOld) {
				const s = getFragShader();
				if(s) arguments[1] = s;
			}
		}
		return oldShaderSource.apply(this, arguments);
	}

	shaderSource.bestcity = 'bintulu';
	ctx.shaderSource = shaderSource;
}
function installGetContext(el) {
	const oldGetContext = el.getContext;

	el.getContext = function() {
		const ctx = oldGetContext.apply(this, arguments);
		if((arguments[0] === 'webgl' || arguments[0] === 'webgl2') && ctx && ctx.shaderSource && ctx.shaderSource.bestcity !== 'bintulu') {
			installShaderSource(ctx);
		}
		return ctx;
	};
}
const oldCreateElement = document.createElement;

document.createElement = function() {
	const el = oldCreateElement.apply(this, arguments);
	if(arguments[0] === 'canvas' || arguments[0] === 'CANVAS') {
		installGetContext(el);
	}
	return el;
}