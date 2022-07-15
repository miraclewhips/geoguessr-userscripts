// ==UserScript==
// @name         GeoGuessr Mosaic Multi
// @description  Divide the round up into tiles and reveal them one-by-one and score bonus points for using fewer tiles (made for NMPZ).
// @version      1.0
// @author       miraclewhips
// @match        *://*.geoguessr.com/*
// @icon         https://www.google.com/s2/favicons?domain=geoguessr.com
// @grant        none
// @copyright    2022, miraclewhips (https://github.com/miraclewhips)
// @license      MIT
// @downloadURL    https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-mosaic-multi.user.js
// @updateURL    https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-mosaic-multi.user.js
// ==/UserScript==

let DATA = {};

const load = () => {
	DATA = {
		plugin_enabled: true,
		tile_x: 5,
		tile_y: 5,
		multiplier: 1.5,
		round: 0,
		round_started: false,
		game_finished: false,
		scores: [],
		game_id: null
	}

	let data = JSON.parse(window.localStorage.getItem('geoMosaicMulti'));

	if(data) {
		data.round = 0;
		data.game_finished = false;

		Object.assign(DATA, data);
		save();
	}
}

const save = () => {
	window.localStorage.setItem('geoMosaicMulti', JSON.stringify(DATA));
}

const getCurrentRound = () => {
	const roundNode = document.querySelector('div[class^="status_inner__"]>div[data-qa="round-number"]');
	return parseInt(roundNode.children[1].textContent.split(/\//gi)[0].trim(), 10);
}

const startRound = () => {
	DATA.round = getCurrentRound();
	DATA.round_started = true;

	if(DATA.round === 1 && DATA.game_id !== getGameId()) {
		DATA.scores = [];
		DATA.game_id = getGameId();
	}

	if(!DATA.scores[DATA.round-1]) {
		let tilemap = [];
		
		for(let y = 0; y < DATA.tile_y; y++) {
			tilemap[y] = [];

			for(let x = 0; x < DATA.tile_x; x++) {
				tilemap[y][x] = 0;
			}
		}

		DATA.scores[DATA.round-1] = {
			tiles: DATA.tile_x * DATA.tile_y,
			tilemap: tilemap,
			score: 0
		}
	}

	const canvas = document.querySelector('.game-layout__canvas');

	if(document.getElementById('mosaic-grid')) {
		let tiles = document.querySelectorAll('#mosaic-grid .mosaic-tile');

		for(let i = 0; i < tiles.length; i++) {
			tiles[i].classList.remove('is-revealed');
		}
	}else if(canvas) {
		let mosaicStyles = document.createElement('style');
		mosaicStyles.innerHTML = `
			.game-layout__compass {
				z-index: 2;
			}

			#mosaic-grid {
				display: grid;
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				z-index: 1;
				grid-template-columns: repeat(${DATA.tile_x}, 1fr);
				grid-template-rows: repeat(${DATA.tile_y}, 1fr);
				user-select: none;
			}

			.mosaic-tile {
				background: #000;
				border: 1px solid #080808;
				color: #444;
				font-weight: 300;
				display: flex;
				align-items: center;
				justify-content: center;
				cursor: pointer;
				transition: all 0.25s ease-out;
				backface-visibility: hidden;
			}

			.mosaic-tile:hover {
				background: #040404;
			}

			.mosaic-tile.is-revealed {
				transform: perspective(30vw) rotateX(90deg);
				visibility: hidden;
			}
		`;

		let mosaic = document.createElement('div');
		mosaic.id = 'mosaic-grid';

		let tilemap = DATA.scores[DATA.round-1].tilemap;

		for(let y = 0; y < tilemap.length; y++) {
			for(let x = 0; x < tilemap[y].length; x++) {
				let tile = document.createElement('div');
				tile.classList.add('mosaic-tile');
				
				if(tilemap[y][x] === 1) {
					tile.classList.add('is-revealed');
				}

				tile.dataset.x = x;
				tile.dataset.y = y;

				tile.onclick = (e) => {
					let x = parseInt(e.target.dataset.x);
					let y = parseInt(e.target.dataset.y);

					if(DATA.scores[DATA.round-1].tilemap[y][x] === 1) return;
					e.target.classList.toggle('is-revealed');

					DATA.scores[DATA.round-1].tilemap[y][x] = 1;
					DATA.scores[DATA.round-1].tiles--;

					updateMosaicRoundPanel();
					save();
				}

				mosaic.append(tile);
			}
		}

		canvas.append(mosaicStyles);
		canvas.append(mosaic);
	}
		
	updateMosaicRoundPanel();

	save();
};

const curve = (x, size) => {
	return Math.pow(1 - 12.5 / size, x);
}

const formatMultiplier = (multi) => {
	return Math.round(multi * 100) / 100;
}

const calculateMultiplier = (tilesLeft) => {
	let maxTiles = DATA.tile_x * DATA.tile_y - 1;
	tilesLeft = Math.max(Math.min(tilesLeft, maxTiles), 0);
	let value = curve(maxTiles - tilesLeft, DATA.tile_x * DATA.tile_y);
	return formatMultiplier(1 + (Math.max(DATA.multiplier - 1, 0) * value));
}

const stopRound = async () => {
	if(!DATA.round_started) {
		return;
	}

	const scoreLayout = document.querySelector('div[class^="result-layout_root"] div[class^="round-result_score__"]');

	if(scoreLayout) {
		DATA.round_started = false;
		let data = await getRoundData(DATA.round-1);
		let baseScore = data.roundScoreInPoints;
	
		DATA.scores[DATA.round-1].base_score = baseScore;
	
		let multiplier = calculateMultiplier(DATA.scores[DATA.round-1].tiles);
		let score = Math.round(DATA.scores[DATA.round-1].base_score * multiplier);
	
		DATA.scores[DATA.round-1].multiplier = multiplier;
		DATA.scores[DATA.round-1].score = score;

		scoreLayout.innerHTML = `${baseScore.toLocaleString()} points <span style="color:#6cb928">(${multiplier}x)</span><span style="color:#fff"> = ${score.toLocaleString()} points</span>`;

		save();
	}else{
		setTimeout(stopRound, 500);
	}
};

const finalResults = () => {
	if(DATA.game_finished) {
		return;
	}
	
	const finalScoreLayout = document.querySelector('div[class^="result-layout_root"] div[class^="standard-final-result_score__"]');

	if(finalScoreLayout) {
		DATA.game_finished = true;
	
		let baseScore = 0;
		let multiplier = 0;
		let score = 0;
	
		for(let i = 0; i < DATA.scores.length; i++) {
			baseScore += DATA.scores[i].base_score;
			multiplier += DATA.scores[i].multiplier;
			score += DATA.scores[i].score;
		}
	
		multiplier = Math.round(multiplier / DATA.scores.length * 100) / 100;
	
		finalScoreLayout.innerHTML = `${baseScore.toLocaleString()} points <span style="color:#6cb928">(${multiplier}x)</span><span style="color:#fff"> = ${score.toLocaleString()} total</span>`;
	}else{
		setTimeout(finalResults, 500);
	}
}

const mapSettingsPanel = () => {
	let settingsPanel = document.getElementById('mosaic-settings-panel');
	const mapSelectLayout = document.querySelector('div[class^="play_section__"] div[class^="section_sectionMedium__"]');

	if(mapSelectLayout && !settingsPanel) {
		DATA.round = 0;
		
		let toggleClass = mapSelectLayout.querySelector('input[type="checkbox"][class^="toggle_toggle"]').className;

		let panel = document.createElement('div');
		panel.id = 'mosaic-settings-panel';
		panel.style.marginTop = '1em';
		mapSelectLayout.append(panel);

		panel.innerHTML = `
			<h2 style="margin-bottom: 0.5em; color:rgb(254, 205, 25);"><em>MOSAIC MULTI</em></h2>

			<div style="display:flex; justify-content:center; align-items: center;">
				<div>
					<label style="display:flex; align-items:center; cursor:pointer;" id="mosaic-setting-wrap-enable">
						<strong style="margin-right:10px;">ENABLED</strong>
					</label>
				</div>

				<div style="margin-left:3em;">
					<label style="display:flex; align-items:center;" id="mosaic-setting-wrap-multiplier">
						<strong style="margin-right:10px;">SCORE MULTIPLIER</strong>
					</label>
				</div>
			</div>

			<h4 style="margin-top:1.5em; margin-bottom:0.5em; opacity:0.6;">GRID SIZE</h4>

			<div style="display:flex; justify-content:center; align-items: center;">
				<div>
					<label style="display:flex; align-items:center;" id="mosaic-setting-wrap-x">
						<strong style="margin-right:10px;">WIDTH</strong>
					</label>
				</div>

				<div style="margin-left:3em;">
					<label style="display:flex; align-items:center;" id="mosaic-setting-wrap-y">
						<strong style="margin-right:10px;">HEIGHT</strong>
					</label>
				</div>
			</div>
		`;

		let toggleEnabled = document.createElement('input');
		toggleEnabled.id = 'mosaic-setting-toggle';
		toggleEnabled.type = 'checkbox';
		toggleEnabled.className = toggleClass;
		toggleEnabled.checked = DATA.plugin_enabled;

		toggleEnabled.onclick = (e) => {
			DATA.plugin_enabled = e.target.checked;
			save();
		};

		document.getElementById('mosaic-setting-wrap-enable').append(toggleEnabled);


		
		let inputMultiplier = document.createElement('input');
		inputMultiplier.id = 'mosaic-setting-multiplier';
		inputMultiplier.type = 'number';
		inputMultiplier.pattern = '[0-9\.]+';
		inputMultiplier.step = '0.1';
		inputMultiplier.min = 1;
		inputMultiplier.value = DATA.multiplier;
		inputMultiplier.style.width = '80px';
		inputMultiplier.style.background = 'rgba(255,255,255,0.1)';
		inputMultiplier.style.color = 'white';
		inputMultiplier.style.border = 'none';
		inputMultiplier.style.borderRadius = '5px';

		inputMultiplier.onchange = (e) => {
			let val = parseFloat(e.target.value);
	
			if(isNaN(val) || val < 1) {
				val = 1;
			}

			e.target.value = val;
			DATA.multiplier = val;
			save();
		}

		document.getElementById('mosaic-setting-wrap-multiplier').append(inputMultiplier);


		
		let inputSizeX = document.createElement('input');
		inputSizeX.id = 'mosaic-setting-x';
		inputSizeX.type = 'number';
		inputSizeX.pattern = '[0-9]+';
		inputSizeX.min = 1;
		inputSizeX.value = DATA.tile_x;
		inputSizeX.style.width = '80px';
		inputSizeX.style.background = 'rgba(255,255,255,0.1)';
		inputSizeX.style.color = 'white';
		inputSizeX.style.border = 'none';
		inputSizeX.style.borderRadius = '5px';

		inputSizeX.onchange = (e) => {
			let val = parseInt(e.target.value);
	
			if(isNaN(val) || val < 1) {
				val = 1;
			}

			e.target.value = val;
			DATA.tile_x = val;
			save();
		}

		document.getElementById('mosaic-setting-wrap-x').append(inputSizeX);


		
		let inputSizeY = document.createElement('input');
		inputSizeY.id = 'mosaic-setting-y';
		inputSizeY.type = 'number';
		inputSizeY.pattern = '[0-9]+';
		inputSizeY.min = 1;
		inputSizeY.value = DATA.tile_y;
		inputSizeY.style.width = '80px';
		inputSizeY.style.background = 'rgba(255,255,255,0.1)';
		inputSizeY.style.color = 'white';
		inputSizeY.style.border = 'none';
		inputSizeY.style.borderRadius = '5px';

		inputSizeY.onchange = (e) => {
			let val = parseInt(e.target.value);
	
			if(isNaN(val) || val < 1) {
				val = 1;
			}

			e.target.value = val;
			DATA.tile_y = val;
			save();
		}

		document.getElementById('mosaic-setting-wrap-y').append(inputSizeY);

		save();
	}
}

const getGameId = () => {
	return window.location.href.substring(window.location.href.lastIndexOf('/') + 1);
}

const getGameData = async () => {
    let api_url;

    if (location.pathname.startsWith('/game/')) {
        api_url = `https://www.geoguessr.com/api/v3/games/${getGameId()}`;
    } else if (location.pathname.startsWith("/challenge/")) {
        api_url = `https://www.geoguessr.com/api/v3/challenges/${getGameId()}/game`;
    };

    return fetch(api_url)
		.then(res => res.json())
		.then((data) => {
			return data;
		}).catch(err => { throw err });
}

const getRoundData = async (index) => {
	const data = await getGameData();
	return data.player.guesses[index];
}

const updateMosaicRoundPanel = () => {
	let panel = document.getElementById('mosaic-round-panel');

	if(!panel) {
		let gameScore = document.querySelector('.game-layout__status div[class^="status_section"][data-qa="score"]');

		if(gameScore) {
			let panel = document.createElement('div');
			panel.id = 'mosaic-round-panel';
			panel.style.display = 'flex';

			let classLabel = gameScore.querySelector('div[class^="status_label"]').className;
			let valueLabel = gameScore.querySelector('div[class^="status_value"]').className;

			panel.innerHTML = `
				<div class="${gameScore.getAttribute('class')}">
					<div class="${classLabel}">MOSAIC SCORE</div>
					<div id="mosaic-total" class="${valueLabel}"></div>
				</div>
				
				<div class="${gameScore.getAttribute('class')}" id="mosiac-current-multiplier-wrapper">
					<div class="${classLabel}">CURRENT</div>
					<div id="mosaic-current-multiplier" class="${valueLabel}"></div>
				</div>

				<div class="${gameScore.getAttribute('class')}" id="mosiac-next-multiplier-wrapper">
					<div class="${classLabel}">NEXT TILE</div>
					<div id="mosaic-next-multiplier" class="${valueLabel}"></div>
				</div>
			`;

			gameScore.parentNode.append(panel);
		}
	}
	
	let total = document.getElementById('mosaic-total');
	let multiCurrent = document.getElementById('mosaic-current-multiplier');
	let multiNext = document.getElementById('mosaic-next-multiplier');

	let multiValueCurrent = calculateMultiplier(DATA.scores[DATA.round-1].tiles);
	let multiValueNext = calculateMultiplier(DATA.scores[DATA.round-1].tiles - 1);

	if(total) {
		let score = 0;

		for(let i = 0; i < DATA.scores.length; i++) {
			score += DATA.scores[i].score;
		}

		total.innerHTML = `${score.toLocaleString()}`;
	}

	document.getElementById('mosiac-next-multiplier-wrapper').style.display = multiValueCurrent === multiValueNext ? 'none' : 'block';

	if(multiCurrent) {
		multiCurrent.innerHTML = `${multiValueCurrent}x`;
	}

	if(multiNext) {
		multiNext.innerHTML = `${multiValueNext}x`;
	}
}

const init = () => {
	load();

	const observer = new MutationObserver(() => {
		const mapSelectLayout = document.querySelector('div[class^="play_section__"]');

		if(mapSelectLayout) {
			mapSettingsPanel();
		}

		if(!DATA.plugin_enabled) {
			return;
		}
		const gameLayout = document.querySelector('.game-layout');
		const resultLayout = document.querySelector('div[class^="result-layout_root"]');
		const finalScoreLayout = document.querySelector('div[class^="result-layout_root"] div[class^="standard-final-result_score__"]');

		if(gameLayout) {
			if (DATA.round !== getCurrentRound()) {
				startRound();
			}else if(resultLayout && DATA.round_started) {
				stopRound();
			}else if(finalScoreLayout && !DATA.game_finished) {
				finalResults();
			}
		}
	});

	observer.observe(document.querySelector('#__next'), { subtree: true, childList: true });
}

init();