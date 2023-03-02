// ==UserScript==
// @name         GeoGuessr Quad Streak
// @description  Draws a grid over the minimap, and tracks how many correct quads you guess in a row
// @version      1.2
// @author       miraclewhips
// @match        *://*.geoguessr.com/*
// @run-at       document-start
// @icon         https://www.google.com/s2/favicons?domain=geoguessr.com
// @grant        none
// @copyright    2022, miraclewhips (https://github.com/miraclewhips)
// @license      MIT
// @downloadURL    https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-quad-streak.user.js
// @updateURL    https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-quad-streak.user.js
// ==/UserScript==


// show A1, A2, B1 etc on the grid
const SHOW_LABELS = false;

// grid size
const GRID_COLS = 20;
const GRID_ROWS = 16;

// grid bounds
const LAT_MAX_NORTH = 85;
const LAT_MAX_SOUTH = -85;
const LNG_MAX_WEST = -180;
const LNG_MAX_EAST = 180;



/* ############################################################################### */
/* ##### DON'T MODIFY ANYTHING BELOW HERE UNLESS YOU KNOW WHAT YOU ARE DOING ##### */
/* ############################################################################### */

const toLetters = (num) => {
	var mod = num % 26,
		pow = num / 26 | 0,
		out = mod ? String.fromCharCode(64 + mod) : (--pow, 'Z');
	return pow ? toLetters(pow) + out : out;
}

const gridNumber = (x, y) => {
	return `${toLetters(x+1)}${y+1}`;
}

const getGridLoc = (lat, lng) => {
	let x = Math.floor(((lng - LNG_MAX_WEST) / (LNG_MAX_EAST - LNG_MAX_WEST)) * GRID_COLS);
	let y = Math.floor(((lat - LAT_MAX_NORTH) / (LAT_MAX_SOUTH - LAT_MAX_NORTH)) * GRID_ROWS);
	return gridNumber(x, y);
}

const createGrid = () => {
	class MapGrid extends google.maps.OverlayView {
		divs = [];
	
		constructor() {
			super();
		}
	
		onAdd() {
			for(let y = 0; y < GRID_ROWS; y++) {
				for(let x = 0; x < GRID_COLS; x++) {
					const i = y * GRID_COLS + x;

					let div = document.createElement('div');
					div.style.border = '1px solid rgba(255,0,0,0.5)';
					div.style.position = 'absolute';
					div.style.overflow = 'hidden';

					if(SHOW_LABELS) {
						div.style.display = 'flex';
						div.style.alignItems = 'center';
						div.style.justifyContent = 'center';
						div.style.color = '#000';
						div.style.fontWeight = 'bold';
						div.style.fontSize = '14px';
						div.style.textShadow = 'rgb(255, 255, 255) 1px 0px 0px, rgb(255, 255, 255) 0.540302px 0.841471px 0px, rgb(255, 255, 255) -0.416147px 0.909297px 0px, rgb(255, 255, 255) -0.989992px 0.14112px 0px, rgb(255, 255, 255) -0.653644px -0.756802px 0px, rgb(255, 255, 255) 0.283662px -0.958924px 0px, rgb(255, 255, 255) 0.96017px -0.279415px 0px';
						div.textContent = gridNumber(x, y);
					}

					this.divs[i] = div;
			
					const panes = this.getPanes();
					panes.overlayLayer.appendChild(this.divs[i]);
				}
			}
		}

		getCoords(x, y) {
			const overlayProjection = this.getProjection();

			if(!overlayProjection) return false;

			const lat = LAT_MAX_NORTH + ((LAT_MAX_SOUTH - LAT_MAX_NORTH) / GRID_ROWS * y);
			const lng = LNG_MAX_WEST + ((LNG_MAX_EAST - LNG_MAX_WEST) / GRID_COLS * x);

			return overlayProjection.fromLatLngToDivPixel(
				new google.maps.LatLng(lat, lng)
			);
		}
	
		draw() {
			for(let y = 0; y < GRID_ROWS; y++) {
				for(let x = 0; x < GRID_COLS; x++) {
					const i = y * GRID_COLS + x;

					let nw = this.getCoords(x, y);
					let se = this.getCoords(x+1, y+1);

					if(!nw || !se) return;

					let rect = {
						left: nw.x,
						top: nw.y,
						width: se.x - nw.x,
						height: se.y - nw.y
					}
					
					if(rect.width < 0) {
						nw = this.getCoords(x-1, y);
						se = this.getCoords(x, y+1);

						rect = {
							left: se.x,
							top: nw.y,
							width: se.x - nw.x,
							height: se.y - nw.y
						}
					}
					
					if(this.divs[i]) {
						this.divs[i].style.left = `${rect.left}px`;
						this.divs[i].style.top = `${rect.top}px`;
						this.divs[i].style.width = `${rect.width}px`;
						this.divs[i].style.height = `${rect.height}px`;
					}
				}
			}
		}
	
		onRemove() {
			for(let y = 0; y < GRID_ROWS; y++) {
				for(let x = 0; x < GRID_COLS; x++) {
					const i = y * GRID_COLS + x;

					if (this.divs[i]) {
						this.divs[i].parentNode.removeChild(this.divs[i]);
						delete this.divs[i];
					}
				}
			}
		}
	
		hide() {
			for(let y = 0; y < GRID_ROWS; y++) {
				for(let x = 0; x < GRID_COLS; x++) {
					const i = y * GRID_COLS + x;

					if (this.divs[i]) {
						this.divs[i].style.visibility = "hidden";
					}
				}
			}
		}
	
		show() {
			for(let y = 0; y < GRID_ROWS; y++) {
				for(let x = 0; x < GRID_COLS; x++) {
					const i = y * GRID_COLS + x;

					if (this.divs[i]) {
						this.divs[i].style.visibility = "visible";
					}
				}
			}
		}
	
		toggle() {
			for(let y = 0; y < GRID_ROWS; y++) {
				for(let x = 0; x < GRID_COLS; x++) {
					const i = y * GRID_COLS + x;

					if (this.divs[i]) {
						if (this.divs[i].style.visibility === "hidden") {
							this.show();
						} else {
							this.hide();
						}
					}
				}
			}
		}
	
		toggleDOM(map) {
			if (this.getMap()) {
				this.setMap(null);
			} else {
				this.setMap(map);
			}
		}
	}

	MWMapGrid = new MapGrid();
	MWMapGrid.setMap(MWMapInstance);
}













let MWMapInstance;
let MWMapGrid;

// Script injection, extracted from unityscript extracted from extenssr:
// https://gitlab.com/nonreviad/extenssr/-/blob/main/src/injected_scripts/maps_api_injecter.ts
function overrideOnLoad(googleScript, observer, overrider) {
	const oldOnload = googleScript.onload
	googleScript.onload = (event) => {
			const google = window.google
			if (google) {
					observer.disconnect()
					overrider(google)
			}
			if (oldOnload) {
					oldOnload.call(googleScript, event)
			}
	}
}

function grabGoogleScript(mutations) {
	for (const mutation of mutations) {
			for (const newNode of mutation.addedNodes) {
					const asScript = newNode
					if (asScript && asScript.src && asScript.src.startsWith('https://maps.googleapis.com/')) {
							return asScript
					}
			}
	}
	return null
}

function injecter(overrider) {
	if (document.documentElement)
	{
			injecterCallback(overrider);
	}
}

function injecterCallback(overrider)
{
	new MutationObserver((mutations, observer) => {
			const googleScript = grabGoogleScript(mutations)
			if (googleScript) {
					overrideOnLoad(googleScript, observer, overrider)
			}
	}).observe(document.documentElement, { childList: true, subtree: true })
}

document.addEventListener('DOMContentLoaded', (event) => {
	injecter(() => {
		google.maps.Map = class extends google.maps.Map {
			constructor(...args) {
					super(...args);
					MWMapInstance = this;
					createGrid();
			}
		}
	});
});











// streak stuff
let DATA = {};

const load = () => {
	DATA = {
		round: 0,
		round_started: false,
		game_finished: false,
		checking_api: false,
		streak: 0,
		previous_streak: 0,
		streak_backup: 0,
		last_guess: [0, 0]
	}

	let data = JSON.parse(window.localStorage.getItem('geoQuadStreak'));

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
	window.localStorage.setItem('geoQuadStreak', JSON.stringify(DATA));
}

const getCurrentRound = () => {
	const roundNode = document.querySelector('div[class^="status_inner__"]>div[data-qa="round-number"]');
	return parseInt(roundNode.children[1].textContent.split(/\//gi)[0].trim(), 10);
}

const checkGameMode = () => {
	return (location.pathname.startsWith("/game/") || location.pathname.startsWith("/challenge/"));
}

const updateRoundPanel = () => {
	let panel = document.getElementById('quad-streak-counter-panel');

	if(!panel) {
		let gameScore = document.querySelector('.game-layout__status div[class^="status_section"][data-qa="score"]');

		if(gameScore) {
			let panel = document.createElement('div');
			panel.id = 'quad-streak-counter-panel';
			panel.style.display = 'flex';

			let classLabel = gameScore.querySelector('div[class^="status_label"]').className;
			let valueLabel = gameScore.querySelector('div[class^="status_value"]').className;

			panel.innerHTML = `
				<div class="${gameScore.getAttribute('class')}">
					<div class="${classLabel}">QUAD STREAK</div>
					<div id="quad-streak-counter-value" class="${valueLabel}"></div>
				</div>
			`;

			gameScore.parentNode.append(panel);
		}
	}
	
	let streak = document.getElementById('quad-streak-counter-value');

	if(streak) {
		streak.innerText = DATA.streak;
	}
}

const createStreakText = () => {
	if(DATA.checking_api) {
		return `Loading...`;
	}

	if(DATA.streak > 0) {
		return `It was <span style="color:#6cb928">${DATA.grid_location}!</span> Quad Streak: <span style="color:#fecd19">${DATA.streak}</span>`;
	}else{
		let suffix = `quads in a row.`;

		switch(DATA.previous_streak) {
			case 1:
				suffix = `quad.`;
		}

		let previousGuessText = `You didn't make a guess.`;

		if(DATA.grid_guess) {
			previousGuessText = `You guessed <span style="color:#f95252">${DATA.grid_guess}</span>, unfortunately it was <span style="color:#6cb928">${DATA.grid_location}</span>.`;
		}

		return `${previousGuessText} Your streak ended after correctly guessing <span style="color:#fecd19">${DATA.previous_streak}</span> ${suffix}`;
	}
}

const createStreakElement = () => {
	let score = document.createElement('div');
	score.style.fontSize = '18px';
	score.style.fontWeight = '500';
	score.style.color = '#fff';
	score.style.padding = '10px';
	score.style.paddingBottom = '0';
	score.style.position = 'absolute';
	score.style.bottom = '100%';
	score.style.width = '100%';
	score.style.background = 'var(--ds-color-purple-100)';
	return score;
}

const updateSummaryPanel = () => {
	const scoreLayout = document.querySelector('div[class^="result-layout_root"] div[class^="round-result_wrapper__"]');

	if(scoreLayout) {
		if(!document.getElementById('quad-streak-score-panel-summary')) {
			let score = createStreakElement();
			score.id = 'quad-streak-score-panel-summary';
			scoreLayout.parentNode.insertBefore(score, scoreLayout);
		}

		document.getElementById('quad-streak-score-panel-summary').innerHTML = createStreakText();
	}
}

const getGameId = () => {
	return window.location.href.substring(window.location.href.lastIndexOf('/') + 1);
}

const startRound = () => {
	if(!checkGameMode()) return;

	DATA.round = getCurrentRound();
	DATA.round_started = true;
	DATA.game_finished = false;
	DATA.gameId = getGameId();

	updateRoundPanel();
}

const queryGeoguessrGameData = async (id) => {
	let apiUrl = `https://www.geoguessr.com/api/v3/games/${id}`;

	if(location.pathname.startsWith("/challenge/")) {
		apiUrl = `https://www.geoguessr.com/api/v3/challenges/${id}/game`;
	}

	return await fetch(apiUrl).then(res => res.json());
}

const stopRound = async () => {
	DATA.round_started = false;

	if(!checkGameMode()) return;

	DATA.checking_api = true;
	updateStreakPanels();

	let responseGeoGuessr = await queryGeoguessrGameData(DATA.gameId);
	DATA.checking_api = false;

	let guess_counter = responseGeoGuessr.player.guesses.length;
	let guess = [responseGeoGuessr.player.guesses[guess_counter-1].lat, responseGeoGuessr.player.guesses[guess_counter-1].lng];

	if (guess[0] == DATA.last_guess[0] && guess[1] == DATA.last_guess[1]) {
		updateStreakPanels();
		return;
	}

	if(responseGeoGuessr.player.guesses[guess_counter-1].timedOut && !responseGeoGuessr.player.guesses[guess_counter-1].timedOutWithGuess) {
		DATA.grid_guess = null;
		DATA.grid_location = null;
		updateStreak(0);
		return;
	}

	DATA.last_guess = guess;
	let location = [responseGeoGuessr.rounds[guess_counter-1].lat,responseGeoGuessr.rounds[guess_counter-1].lng];

	DATA.grid_guess = getGridLoc(guess[0], guess[1]);
	DATA.grid_location = getGridLoc(location[0], location[1]);

	if(DATA.grid_guess === DATA.grid_location) {
		updateStreak(DATA.streak + 1);
	}else{
		updateStreak(0);
	}
}

const checkStreakIsLatest = () => {
	let data = JSON.parse(window.localStorage.getItem('geoQuadStreak'));

	if(data) {
		DATA.streak = data.streak;
	}
}

const updateStreak = (streak) => {
	checkStreakIsLatest();

	DATA.previous_streak = DATA.streak;
	DATA.streak = streak;

	if(DATA.streak !== 0) {
		DATA.streak_backup = DATA.streak;
	}

	save();
	updateStreakPanels();
}

const updateStreakPanels = () => {
	updateRoundPanel();
	updateSummaryPanel();
}

document.addEventListener('keypress', (e) => {
	switch(e.key) {
		case '1':
			updateStreak(DATA.streak + 1);
			break;
		case '2':
			updateStreak(DATA.streak - 1);
			break;
		case '8':
			updateStreak(DATA.streak_backup + 1);
			break;
		case '0':
			DATA.streak_backup = 0;
			updateStreak(0);
			break;
	};
});

const checkState = () => {
	const gameLayout = document.querySelector('.game-layout');
	const resultLayout = document.querySelector('div[class^="result-layout_root"]');
	const finalScoreLayout = document.querySelector('div[class^="result-layout_root"] div[class^="standard-final-result_score__"]');

	if(gameLayout) {
		if (DATA.round !== getCurrentRound() || DATA.gameId !== getGameId()) {
			if(DATA.round_started) {
				stopRound();
			}

			startRound();
		}else if(resultLayout && DATA.round_started) {
			stopRound();
		}else if(finalScoreLayout && !DATA.game_finished) {
			DATA.game_finished = true;
			updateStreakPanels();
		}
	}
}

const init = () => {
	load();

	const observer = new MutationObserver(() => {
		checkState();
	});

	observer.observe(document.querySelector('#__next'), { subtree: true, childList: true });

	window.addEventListener('mouseup', checkState);
}

window.onload = updateStreakPanels;
init();