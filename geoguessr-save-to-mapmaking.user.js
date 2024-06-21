// ==UserScript==
// @name         GeoGuessr Save To Map Making App
// @description  Save locations to Map Making App after each round
// @version      1.6
// @author       miraclewhips
// @match        *://*.geoguessr.com/*
// @run-at       document-start
// @require      https://miraclewhips.dev/geoguessr-event-framework/geoguessr-event-framework.min.js?v=10
// @icon         https://www.google.com/s2/favicons?domain=geoguessr.com
// @grant        unsafeWindow
// @grant        GM_addStyle
// @grant        GM_openInTab
// @copyright    2023, miraclewhips (https://github.com/miraclewhips)
// @license      MIT
// @downloadURL  https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-save-to-mapmaking.user.js
// @updateURL    https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-save-to-mapmaking.user.js
// ==/UserScript==


/* ----- API KEY INSTRUCTIONS -----

Requires an API key from Map Making App in order to save locations.
Create one here: https://map-making.app/keys
Make sure not to share this key with anybody or show it publicly as it will allow anybody to edit your maps.

Replace `PASTE_YOUR_KEY_HERE` with your generated API key (make sure not to delete the quotes surrounding the key) */
const MAP_MAKING_API_KEY = "PASTE_YOUR_KEY_HERE";

// Number of maps to show in the "Recent Maps" section
const NUMBER_OF_RECENT_MAPS = 3;








/* ############################################################################### */
/* ##### DON'T MODIFY ANYTHING BELOW HERE UNLESS YOU KNOW WHAT YOU ARE DOING ##### */
/* ############################################################################### */

GM_addStyle(`
.mwstmm-modal {
	position: fixed;
	inset: 0;
	z-index: 99999;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-direction: column;
}

.mwstmm-modal .dim {
	position: fixed;
	inset: 0;
	z-index: 0;
	background: rgba(0,0,0,0.75);
}

.mwstmm-modal .text {
	position: relative;
	z-index: 1;
}

.mwstmm-modal .inner {
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

#mwstmm-loader {
	color: #fff;
	font-weight: bold;
}

.mwstmm-settings {
	position: absolute;
	top: 1rem;
	left: 1rem;
	z-index: 9;
	display: flex;
	flex-direction: column;
	gap: 5px;
	align-items: flex-start;
}

.mwstmm-settings.extra-pad {
	top: 2.5rem;
}

.mwstmm-title {
	font-size: 15px;
	font-weight: bold;
	text-shadow: rgb(204, 48, 46) 2px 0px 0px, rgb(204, 48, 46) 1.75517px 0.958851px 0px, rgb(204, 48, 46) 1.0806px 1.68294px 0px, rgb(204, 48, 46) 0.141474px 1.99499px 0px, rgb(204, 48, 46) -0.832294px 1.81859px 0px, rgb(204, 48, 46) -1.60229px 1.19694px 0px, rgb(204, 48, 46) -1.97998px 0.28224px 0px, rgb(204, 48, 46) -1.87291px -0.701566px 0px, rgb(204, 48, 46) -1.30729px -1.5136px 0px, rgb(204, 48, 46) -0.421592px -1.95506px 0px, rgb(204, 48, 46) 0.567324px -1.91785px 0px, rgb(204, 48, 46) 1.41734px -1.41108px 0px, rgb(204, 48, 46) 1.92034px -0.558831px 0px;
	position: relative;
	z-index: 1;
}

.mwstmm-subtitle {
	font-size: 12px;
	background: rgba(204, 48, 46, 0.4);
	padding: 3px 5px;
	border-radius: 5px;
	position: relative;
	z-index: 0;
	top: -8px;
	text-shadow: 0 1px 2px rgba(0,0,0,0.5);
}

.mwstmm-subtitle a:hover {
	text-decoration: underline;
}

.mwstmm-settings-option {
	background: var(--ds-color-purple-100);
	padding: 6px 10px;
	border-radius: 5px;
	font-size: 12px;
	cursor: pointer;
	opacity: 0.75;
	transition: opacity 0.2s;
	pointer-events: auto;
}

.mwstmm-settings-option:hover {
	opacity: 1;
}

#mwstmm-map-list h3 {
	margin-bottom: 10px;
}

#mwstmm-map-list .tag-input {
	display: block;
	width: 100%;
	font: inherit;
}

#mwstmm-map-list .maps {
	max-height: 200px;
	overflow-x: hidden;
	overflow-y: auto;
	font-size: 15px;
}

#mwstmm-map-list .map {
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 20px;
	padding: 8px;
	transition: background 0.2s;
}

#mwstmm-map-list .map:nth-child(2n) {
	background: #f0f0f0;
}

#mwstmm-map-list .map-buttons:not(.is-added) .map-added {
	display: none !important;
}
#mwstmm-map-list .map-buttons.is-added .map-add {
	display: none !important;
}

#mwstmm-map-list .map-add {
	background: var(--ds-color-green-80);
	color: #fff;
	padding: 3px 6px;
	border-radius: 5px;
	font-size: 13px;
	font-weight: bold;
	cursor: pointer;
}

#mwstmm-map-list .map-added {
	background: #000;
	color: #fff;
	padding: 3px 6px;
	border-radius: 5px;
	font-size: 13px;
	font-weight: bold;
}

div[class^="result-list_listItemWrapper__"] {
	position: relative;
}

div[class^="result-list_listItemWrapper__"] .mwstmm-settings-option {
	margin-left: auto;
	line-height: 1;
	align-self: center;
}
`);

function defaultState() {
	return {
		recentMaps: []
	}
}

function loadState() {
	const data = window.localStorage.getItem('mwstmm_state');
	if(!data) return;
	
	const dataJson = JSON.parse(data);
	if(!data) return;

	Object.assign(MWSTMM_STATE, defaultState(), dataJson);
	saveState();
}

function saveState() {
	window.localStorage.setItem('mwstmm_state', JSON.stringify(MWSTMM_STATE));
}

const MWSTMM_STATE = defaultState();
loadState();

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
			//empty
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

let LOCATION, ROUNDS;
let MAP_LIST;

if(!GeoGuessrEventFramework) {
	throw new Error('GeoGuessr Location Manager requires GeoGuessr Event Framework (https://github.com/miraclewhips/geoguessr-event-framework). Please include this before you include GeoGuessr Location Manager.');
}

function showLoader() {
	if(document.getElementById('mwstmm-loader')) return;

	const element = document.createElement('div');
	element.id = 'mwstmm-loader';
	element.className = 'mwstmm-modal';
	element.innerHTML = `
		<div class="text">LOADING...</div>
		<div class="dim"></div>
	`;
	document.body.appendChild(element);
}

function hideLoader() {
	const element = document.getElementById('mwstmm-loader');
	if(element) element.remove();
}

async function clickedMapButton() {
	if(MAP_MAKING_API_KEY === 'PASTE_YOUR_KEY_HERE') {
		alert('An API Key is required in order to save locations to Map Making App. Please add your API key by editing the Userscript and following the instructions at the top of the script.');
		return;
	}

	if(!MAP_LIST) {
		showLoader();

		try {
			MAP_LIST = await getMaps();
		}catch{
			//empty
		}

		hideLoader();
	}

	if(MAP_LIST) {
		showMapList()
	}
}

function showMapList() {
	if(document.getElementById('mwstmm-map-list')) return;

	const element = document.createElement('div');
	element.id = 'mwstmm-map-list';
	element.className = 'mwstmm-modal';

	let recentMapsSection = ``;
	if(NUMBER_OF_RECENT_MAPS > 0 && MWSTMM_STATE.recentMaps.length > 0) {
		let recentMapsHTML = '';
		for(const m of MWSTMM_STATE.recentMaps) {
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
	for(const m of MAP_LIST) {
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

			<input type="text" class="tag-input" id="mwstmm-map-tags" />

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

	document.getElementById('mwstmm-map-tags').addEventListener('keyup', e => e.stopPropagation());
	document.getElementById('mwstmm-map-tags').addEventListener('keydown', e => e.stopPropagation());
	document.getElementById('mwstmm-map-tags').addEventListener('keypress', e => e.stopPropagation());
	document.getElementById('mwstmm-map-tags').focus();

	for(const map of element.querySelectorAll('.maps .map-add')) {
		map.addEventListener('click', addLocationToMap);
	}
}

function closeMapList() {
	const element = document.getElementById('mwstmm-map-list');
	if(element) element.remove();
}

function addLocationToMap(e) {
	e.target.parentNode.classList.add('is-added');

	const id = parseInt(e.target.dataset.id);

	if(NUMBER_OF_RECENT_MAPS > 0) {
	MWSTMM_STATE.recentMaps = MWSTMM_STATE.recentMaps.filter(e => e.id !== id).slice(0, NUMBER_OF_RECENT_MAPS-1);
		for(const map of MAP_LIST) {
			if(map.id === id) {
				MWSTMM_STATE.recentMaps.unshift(map);
				break;
			}
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
		tags: document.getElementById('mwstmm-map-tags').value.split(',').map(t => t.trim()).filter(t => t.length > 0),
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
	if(!container || document.getElementById('mwstmm-settings-buttons-summary')) return;

	const element = document.createElement('div');
	element.id = 'mwstmm-settings-buttons-summary';
	element.className = 'mwstmm-settings';
	element.innerHTML = `
		<div class="mwstmm-title">SAVE TO MAP MAKING APP</div>
		<div class="mwstmm-subtitle">by <a href="https://miraclewhips.dev/" target="_blank" rel="noopener noreferrer">miraclewhips</a>. <a href="https://ko-fi.com/miraclewhips" target="_blank" rel="noopener noreferrer">Support my work</a>.</div>
		<div class="mwstmm-settings-option" id="mwstmm-opt-save-loc">SAVE TO MAP</div>
		<div class="mwstmm-settings-option" id="mwstmm-opt-open-maps">OPEN IN GOOGLE MAPS</div>
	`;

	container.appendChild(element);

	createSettingsButtonSummaryEvents();
}

function createSettingsButtonSummaryEvents() {
	document.getElementById('mwstmm-opt-save-loc').addEventListener('click', () => {
		LOCATION = ROUNDS[ROUNDS.length - 1].location;
		clickedMapButton();
	});

	document.getElementById('mwstmm-opt-open-maps').addEventListener('click', () => {
		LOCATION = ROUNDS[ROUNDS.length - 1].location;
		const link = googleMapsLink(LOCATION);
		GM_openInTab(link, false);
	});
}

function addResultButton(location, item) {
	const btn = document.createElement('div');
	btn.className = `mwstmm-settings-option`;
	btn.textContent = `SAVE`;

	btn.addEventListener('click', () => {
		LOCATION = location;
		clickedMapButton();
	});

	item.appendChild(btn);
}

const observer = new MutationObserver(() => {
	addSettingsButtonsToSummary();

	if(!ROUNDS || ROUNDS.length !== 5) return;

	const wrapper = document.querySelector(`div[class^="result-list_listWrapper__"]`);
	if(!wrapper || wrapper.dataset.mwstmm === 'true') return;
	
	wrapper.dataset.mwstmm = 'true';

	const items = wrapper.querySelectorAll(`div[class^="result-list_listItemWrapper__"]`);
	for(let i = 0; i < 5; i++) {
		if(!items[i]) return;
		addResultButton(ROUNDS[i].location, items[i]);
	}
});

observer.observe(document.querySelector('#__next'), { subtree: true, childList: true });

GeoGuessrEventFramework.init().then(GEF => {
	console.log('GeoGuessr Save To Map Making App initialised.');

	GEF.events.addEventListener('round_end', (state) => {
		ROUNDS = state.detail.rounds;
	});
});
