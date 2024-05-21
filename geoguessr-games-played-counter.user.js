
// ==UserScript==
// @name         GeoGuessr Games Played Counter
// @description  Shows how many games you have played and allows you to set a counter (click counter on the game screen to configure)
// @version      1.1
// @author       miraclewhips
// @match        *://*.geoguessr.com/*
// @icon         https://www.google.com/s2/favicons?domain=geoguessr.com
// @grant        unsafeWindow
// @grant        GM_addStyle
// @run-at       document-start
// @require      https://miraclewhips.dev/geoguessr-event-framework/geoguessr-event-framework.min.js?v=9
// @copyright    2024, miraclewhips (https://github.com/miraclewhips)
// @license      MIT
// @downloadURL  https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-games-played-counter.user.js
// @updateURL    https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-games-played-counter.user.js
// ==/UserScript==



/* ############################################################################### */
/* ##### DON'T MODIFY ANYTHING BELOW HERE UNLESS YOU KNOW WHAT YOU ARE DOING ##### */
/* ############################################################################### */
GM_addStyle(`
#mw-gpc-conf {
	position: absolute;
	inset: 0;
	z-index: 99999;
	display: flex;
	align-items: center;
	justify-content: center;
	line-height: 1.5;
}

#mw-gpc-conf .bg {
	position: fixed;
	inset: 0;
	z-index: 0;
	background: rgba(0,0,0,0.75);
}

#mw-gpc-conf .inner {
	background: #fff;
	padding: 20px;
	max-width: 400px;
	position: relative;
	z-index: 1;
}

#mw-gpc-conf h3 {
	margin-bottom: 10px;
}

#mw-gpc-conf input[type=number] {
	margin-top: 20px;
}
`);

let STATE = {
	games_played: 0,
	games_conf_val: 0,
	checking_api: false,
	type: 'total'
}

function saveState() {
	window.localStorage.setItem('mw-games-played-count', JSON.stringify(STATE));
}

function loadState() {
	const data = JSON.parse(window.localStorage.getItem('mw-games-played-count'));
	if(data) {
		data.checking_api = false;
		STATE = data;
	}
}

function gameLabel() {
	switch(STATE.type) {
		case 'counter': return 'Games Played';
		case 'target': return 'Games Needed';
		default: return 'Total Games';
	}
}

function gameValue() {
	switch(STATE.type) {
		case 'counter': return `${(STATE.games_played - STATE.games_conf_val).toLocaleString()}`;
		case 'target': return (STATE.games_conf_val - STATE.games_played).toLocaleString();
		default: return STATE.games_played.toLocaleString();
	}
}

function getRoundPanel() {
	return document.getElementById(`streak-counter-panel-games-played`);
}

function getSummaryPanel() {
	return document.getElementById(`streak-score-panel-summary-games-played`);
}

function updateRoundPanel() {
	let panel = getRoundPanel();

	if(!panel) {
		const gameScore = document.querySelector('div[class^="game_status__"] div[class^="status_section"][data-qa="score"]');

		if(gameScore) {
			panel = document.createElement('div');
			panel.id = `streak-counter-panel-games-played`;
			panel.style.display = 'flex';

			const classLabel = gameScore.querySelector('div[class^="status_label"]').className;
			const valueLabel = gameScore.querySelector('div[class^="status_value"]').className;

			panel.innerHTML = `<div class="${gameScore.getAttribute('class')}"><div class="${classLabel}"><span id="streak-counter-name-games-played"></span></div><div id="streak-counter-value-games-played" class="${valueLabel}"></div></div>`;

			panel.addEventListener('click', configure);

			gameScore.parentNode.append(panel);
		}
	}
	
	const name = document.getElementById(`streak-counter-name-games-played`);
	const streak = document.getElementById(`streak-counter-value-games-played`);

	if(name && streak) {
		name.innerText = gameLabel().toUpperCase();
		streak.innerText = gameValue();
	}
}

function createStreakText() {
	if(STATE.checking_api) {
		return `Loading...`;
	}

	return `${gameLabel()}: <span style="color:#fecd19">${gameValue()}</span>`;
}

function createStreakElement() {
	const score = document.createElement('div');
	score.style.fontSize = '18px';
	score.style.fontWeight = '500';
	score.style.color = '#fff';
	score.style.padding = '10px';
	score.style.paddingBottom = '0';
	score.style.background = 'var(--ds-color-purple-100)';
	return score;
}

function updateSummaryPanel() {
	const scoreLayout = document.querySelector('div[class^="result-layout_root"] div[class^="round-result_wrapper__"]');

	const scoreLayoutBottom = document.querySelector('div[class^="result-layout_root"] div[class^="result-layout_bottomNew__"]');
	if(scoreLayoutBottom) {
		scoreLayoutBottom.style.flex = '0';
		scoreLayoutBottom.style.maxHeight = 'none';
	}

	if(!scoreLayout && !scoreLayoutBottom) return;

	let panel = getSummaryPanel();

	if(scoreLayout && !panel) {
		panel = createStreakElement();
		panel.id = `streak-score-panel-summary-games-played`;
		scoreLayout.parentNode.insertBefore(panel, scoreLayout);
	}

	if(panel) {
		panel.innerHTML = createStreakText();
	}
}

function updateStreakPanels() {
	updateRoundPanel();
	updateSummaryPanel();
}

async function updateCount(id) {
	STATE.checking_api = true;
	const res = await fetch(`https://www.geoguessr.com/api/v3/users/${id}/stats`);
	STATE.games_played = (await res.json()).gamesPlayed;
	STATE.checking_api = false;
	saveState();
}

async function init() {
	loadState();

	const USER_ID = __NEXT_DATA__?.props?.accountProps?.account?.user?.userId;
	if(!USER_ID) return;

	if(GeoGuessrEventFramework) {
		GeoGuessrEventFramework.init().then(GEF => {
			GEF.events.addEventListener('round_start', () => {
				updateStreakPanels();
			});

			GEF.events.addEventListener('game_end', async () => {
				STATE.checking_api = true;
				updateStreakPanels();
				await updateCount(USER_ID);
				updateStreakPanels();
			});
		});
	}

	await updateCount(USER_ID);
	updateStreakPanels();
}

unsafeWindow.addEventListener('DOMContentLoaded', init);

function radioInput(id) {
	return `<input type="radio" id="type-${id}" name="type" value="${id}" ${STATE.type === id ? 'checked' : ''}>`;
}

function formVals() {
	const formData = new FormData(document.getElementById('mw-gpc-conf-form'));
	return Object.fromEntries(formData);
}

function updateFormDisplay() {
	const vals = formVals();
	const input = document.getElementById('mw-gpc-input-val');

	input.style.display = vals.type == 'total' ? 'none' : 'block';
	input.value = '';

	switch(vals.type) {
		case 'counter': input.placeholder = 'Starting count #'; break;
		case 'target': input.placeholder = 'Target #'; break;
	}
}

function configure() {
	if(document.getElementById('mw-gpc-conf')) return;

	const conf = document.createElement('div');
	conf.id = 'mw-gpc-conf';

	conf.innerHTML = `
		<div class="inner">
			<h3>Counter Type</h3>
			<form id="mw-gpc-conf-form">
				<div>
					${radioInput('total')}
					<label for="type-total">Total games played</label>
				</div>
				<div>
					${radioInput('counter')}
					<label for="type-counter">Counter since # of games</label>
				</div>
				<div>
					${radioInput('target')}
					<label for="type-target">Target # of games</label>
				</div>

				<input type="number" min="0" id="mw-gpc-input-val" name="number" value="${STATE.games_conf_val}" style="display: ${STATE.type === 'total' ? 'none' : 'block'}">

				<br>

				<input type="submit" value="Save">
			</form>
		</div>

		<div class="bg"></div>`

	document.body.append(conf);

	conf.querySelector('.bg').addEventListener('click', () => {
		conf.remove();
	});

	document.getElementById('type-total').addEventListener('change', updateFormDisplay);
	document.getElementById('type-counter').addEventListener('change', updateFormDisplay);
	document.getElementById('type-target').addEventListener('change', updateFormDisplay);

	document.getElementById('mw-gpc-conf-form').addEventListener('submit', (e) => {
		e.preventDefault();
		e.stopPropagation();

		const vals = formVals();
		const num = parseInt(vals.number);
		
		if(vals.type !== 'total') {
			if(typeof num !== 'number' || isNaN(num)) {
				window.alert('Please enter a valid number in the field');
				return;
			}

			STATE.games_conf_val = num;
		}

		STATE.type = vals.type;

		saveState();
		updateStreakPanels();
		conf.remove();
	});
}
