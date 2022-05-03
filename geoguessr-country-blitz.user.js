// ==UserScript==
// @name         GeoGuessr Country Blitz
// @description  Get as many countries correct as you can within the time limit
// @version      1.1
// @author       miraclewhips
// @match        *://*.geoguessr.com/*
// @icon         https://www.google.com/s2/favicons?domain=geoguessr.com
// @grant        none
// @copyright    2022, miraclewhips (https://github.com/miraclewhips)
// @license      MIT
// @updateURL    https://github.com/miraclewhips/geoguessr-country-blitz/raw/master/geoguessr-country-blitz.user.js
// ==/UserScript==

/* You can sign up for free at bigdatacloud.com to get an API key */

const API_KEY = 'ENTER_API_KEY_HERE';





/* ############################################################################### */
/* ##### DON'T MODIFY ANYTHING BELOW HERE UNLESS YOU KNOW WHAT YOU ARE DOING ##### */
/* ############################################################################### */

const TICK_INTERVAL = 250;

let CONFIG = {};

let last_guess = [0,0];
var CountryDict={AF:"AF",AX:"FI",AL:"AL",DZ:"DZ",AS:"US",AD:"AD",AO:"AO",AI:"GB",AQ:"AQ",AG:"AG",AR:"AR",AM:"AM",AW:"NL",AU:"AU",AT:"AT",AZ:"AZ",BS:"BS",BH:"BH",BD:"BD",BB:"BB",BY:"BY",BE:"BE",BZ:"BZ",BJ:"BJ",BM:"GB",BT:"BT",BO:"BO",BQ:"NL",BA:"BA",BW:"BW",BV:"NO",BR:"BR",IO:"GB",BN:"BN",BG:"BG",BF:"BF",BI:"BI",KH:"KH",CM:"CM",CA:"CA",CV:"CV",KY:"UK",CF:"CF",TD:"TD",CL:"CL",CN:"CN",CX:"AU",CC:"AU",CO:"CO",KM:"KM",CG:"CG",CD:"CD",CK:"NZ",CR:"CR",CI:"CI",HR:"HR",CU:"CU",CW:"NL",CY:"CY",CZ:"CZ",DK:"DK",DJ:"DJ",DM:"DM",DO:"DO",EC:"EC",EG:"EG",SV:"SV",GQ:"GQ",ER:"ER",EE:"EE",ET:"ET",FK:"GB",FO:"DK",FJ:"FJ",FI:"FI",FR:"FR",GF:"FR",PF:"FR",TF:"FR",GA:"GA",GM:"GM",GE:"GE",DE:"DE",GH:"GH",GI:"UK",GR:"GR",GL:"DK",GD:"GD",GP:"FR",GU:"US",GT:"GT",GG:"GB",GN:"GN",GW:"GW",GY:"GY",HT:"HT",HM:"AU",VA:"VA",HN:"HN",HK:"CN",HU:"HU",IS:"IS",IN:"IN",ID:"ID",IR:"IR",IQ:"IQ",IE:"IE",IM:"GB",IL:"IL",IT:"IT",JM:"JM",JP:"JP",JE:"GB",JO:"JO",KZ:"KZ",KE:"KE",KI:"KI",KR:"KR",KW:"KW",KG:"KG",LA:"LA",LV:"LV",LB:"LB",LS:"LS",LR:"LR",LY:"LY",LI:"LI",LT:"LT",LU:"LU",MO:"CN",MK:"MK",MG:"MG",MW:"MW",MY:"MY",MV:"MV",ML:"ML",MT:"MT",MH:"MH",MQ:"FR",MR:"MR",MU:"MU",YT:"FR",MX:"MX",FM:"FM",MD:"MD",MC:"MC",MN:"MN",ME:"ME",MS:"GB",MA:"MA",MZ:"MZ",MM:"MM",NA:"NA",NR:"NR",NP:"NP",NL:"NL",AN:"NL",NC:"FR",NZ:"NZ",NI:"NI",NE:"NE",NG:"NG",NU:"NZ",NF:"AU",MP:"US",NO:"NO",OM:"OM",PK:"PK",PW:"PW",PS:"IL",PA:"PA",PG:"PG",PY:"PY",PE:"PE",PH:"PH",PN:"GB",PL:"PL",PT:"PT",PR:"US",QA:"QA",RE:"FR",RO:"RO",RU:"RU",RW:"RW",BL:"FR",SH:"GB",KN:"KN",LC:"LC",MF:"FR",PM:"FR",VC:"VC",WS:"WS",SM:"SM",ST:"ST",SA:"SA",SN:"SN",RS:"RS",SC:"SC",SL:"SL",SG:"SG",SX:"NL",SK:"SK",SI:"SI",SB:"SB",SO:"SO",ZA:"ZA",GS:"GB",ES:"ES",LK:"LK",SD:"SD",SR:"SR",SJ:"NO",SZ:"SZ",SE:"SE",CH:"CH",SY:"SY",TW:"TW",TJ:"TJ",TZ:"TZ",TH:"TH",TL:"TL",TG:"TG",TK:"NZ",TO:"TO",TT:"TT",TN:"TN",TR:"TR",TM:"TM",TC:"GB",TV:"TV",UG:"UG",UA:"UA",AE:"AE",GB:"GB",US:"US",UM:"US",UY:"UY",UZ:"UZ",VU:"VU",VE:"VE",VN:"VN",VG:"GB",VI:"US",WF:"FR",EH:"MA",YE:"YE",ZM:"ZM",ZW:"ZW"};
let resultScreen;
let resultScreenTimestamp;

const msToTime = (ms, showMs = false) => {
	if(ms < 0) {
		ms = 0;
	}

	let seconds = Math.round(ms / 1000);

	const hours = parseInt(seconds / 3600, 10);
	seconds %= 3600;

	const minutes = parseInt(seconds / 60, 10);
	seconds %= 60;

	let result = '';

	if (hours > 0) {
		result += `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
	} else {
		result += `${minutes}:${seconds.toString().padStart(2, '0')}`;
	}

	if (showMs) {
		result += `.${Math.round(ms % 1000).toString().padEnd(3, '0')}`;
	}

	return result;
};

const load = () => {
	resetGame();

	let config = JSON.parse(window.localStorage.getItem('geoBlitzConfig'));

	if(config) {
		if(config.start_time) {
			config.start_time = new Date(config.start_time);
		}

		for(let i = 0; i < config.round_times.length; i++) {
			if(config.round_times[i].begin) {
				config.round_times[i].begin = new Date(config.round_times[i].begin);
			}

			if(config.round_times[i].end) {
				config.round_times[i].end = new Date(config.round_times[i].end);
			}
		}

		Object.assign(CONFIG, config);

		if(CONFIG.finished) {
			resetGame();
			save();
		}
	}
}

const save = () => {
	window.localStorage.setItem('geoBlitzConfig', JSON.stringify(CONFIG));
}

const resetGame = () => {
	let lastTime = CONFIG.last_time_selected || 3;
	let pauseRounds = CONFIG.pause_between_rounds;
	let pauseGames = CONFIG.pause_between_games;

	CONFIG = {
		plugin_enabled: true,
		active: false,
		start_time: 0,
		last_time_selected: lastTime,
		pause_between_rounds: pauseRounds,
		pause_between_games: pauseGames,
		time: lastTime * 60 * 1000,
		current_round: -1,
		round_times: [],
		game_round: 0,
		correct: 0,
		guessed: 0,
		in_progress: false,
		playing_round: false
	}
}

const getCurrentRound = () => {
	const roundNode = document.querySelector('div[class^="status_inner__"]>div[data-qa="round-number"]');
	return parseInt(roundNode.children[1].textContent.split(/\//gi)[0].trim(), 10);
}

const startRound = () => {
	if(CONFIG.finished) {
		return;
	}

	const now = new Date();

	CONFIG.current_round++;
	CONFIG.game_round = getCurrentRound();

	if(CONFIG.paused) {
		CONFIG.paused = false;
		CONFIG.paused_time = now;
	}

	if(CONFIG.current_round === 0 && !CONFIG.in_progress && CONFIG.game_round === 1) {
		CONFIG.active = true;
		CONFIG.start_time = now;
		CONFIG.in_progress = true;
	}

	if(!CONFIG.in_progress) {
		return;
	}

	if (CONFIG.current_round >= 0) {
		if(!CONFIG.round_times[CONFIG.current_round]) {
			CONFIG.round_times[CONFIG.current_round] = {};
		}

		if (!CONFIG.round_times[CONFIG.current_round].begin) {
			CONFIG.round_times[CONFIG.current_round].begin = now;
			CONFIG.playing_round = true;
		}
	}

	save();
};


const getScoreCorrect = () => {
	return CONFIG.round_times.filter(a => a.correct).length;
}

const getScoreGuessed = () => {
	return CONFIG.round_times.filter(a => a.end).length;
}

const stopRound = () => {
	if(CONFIG.round_times.length === 0 || !CONFIG.in_progress || !CONFIG.active) {
		return;
	}

	const now = new Date();
  
	if (!CONFIG.round_times[CONFIG.current_round].end) {
		CONFIG.time = timeDeadline().getTime();
		CONFIG.playing_round = false;

		CONFIG.paused_time = now;

		if((CONFIG.game_round === 5 && CONFIG.pause_between_games) || (CONFIG.game_round < 5 && CONFIG.pause_between_rounds)) {
			CONFIG.paused = true;
		}

		CONFIG.round_times[CONFIG.current_round].end = now;
		checkGuess(CONFIG.current_round);
		CONFIG.guessed = getScoreGuessed();

		save();
	}
};

const getLastRoundTime = () => {
	if(CONFIG.paused) {
		return new Date();
	}

	if(CONFIG.paused_time) {
		return CONFIG.paused_time;
	}

	return CONFIG.start_time || new Date();
}

const timeDeadline = () => {
	return new Date(new Date(getLastRoundTime()).getTime() + CONFIG.time - new Date().getTime());
}

const updateBlitzGamePanel = () => {
	let blitzPanel = document.getElementById('blitz-game-panel');

	if(!blitzPanel) {
		let gameScore = document.querySelector('.game-layout__status div[class^="status_section"][data-qa="score"]');

		if(gameScore) {
			let panel = document.createElement('div');
			panel.className = gameScore.getAttribute('class');
			panel.id = 'blitz-game-panel';

			let classLabel = gameScore.querySelector('div[class^="status_label"]').className;
			let valueLabel = gameScore.querySelector('div[class^="status_value"]').className;

			panel.innerHTML = `
				<div class="${gameScore.getAttribute('class')}">
					<div class="${classLabel}">Blitz</div>
					<div id="blitz-panel-value" class="${valueLabel}"></div>
				</div>
			`;

			gameScore.parentNode.append(panel);
		}
	}
	
	let blitzLabel = document.getElementById('blitz-panel-value');

	if(blitzLabel) {
		const now = new Date();

		blitzLabel.innerHTML = `
			<span>${msToTime(timeDeadline())}</span>
			<span style="margin:0 10px; opacity: 0.35;">&bull;</span>
			<span>${CONFIG.correct} / ${CONFIG.guessed}</span>
		`;
	}
}

const updateBlitzResultsPanel = () => {
	let blitzPanel = document.getElementById('blitz-results-panel');

	if(!blitzPanel) {
		let roundActions = document.querySelector('div[class^="result-layout_root"] div[class^="round-result_actions"]');

		if(roundActions) {
			let panel = document.createElement('div');
			panel.id = 'blitz-results-panel';
			panel.style.marginTop = '1em';

			roundActions.parentNode.insertBefore(panel, roundActions);
		}
	}

	let blitzLabel = document.getElementById('blitz-results-panel');

	if(blitzLabel) {
		if(CONFIG.round_times[CONFIG.round_times.length - 1].correct == undefined) {
			blitzLabel.innerHTML = `<h2>Loading...</h2>`;
		}else{
			blitzLabel.innerHTML = `<h2>Blitz: ${CONFIG.correct} / ${CONFIG.guessed} correct - Time remaining: ${msToTime(timeDeadline())}</h2>`;
		}
	}
}

const updateBlitzSummaryPanel = () => {
	let blitzPanel = document.getElementById('blitz-summary-panel');

	if(!blitzPanel) {
		const summaryLayout = document.querySelector('div[class^="standard-final-result_progressSection__"]');

		if(summaryLayout) {
			let panel = document.createElement('div');
			panel.id = 'blitz-summary-panel';
			panel.style.position = 'absolute';
			panel.style.width = '100%';
			panel.style.left = '0';

			summaryLayout.parentNode.style.position = 'relative';
			summaryLayout.parentNode.insertBefore(panel, summaryLayout);
		}
	}

	let blitzLabel = document.getElementById('blitz-summary-panel');

	if(blitzLabel) {
		if(CONFIG.round_times[CONFIG.round_times.length - 1].correct == undefined) {
			blitzLabel.innerHTML = `<h2>Loading...</h2>`;
		}else{
			blitzLabel.innerHTML = `<h2>Blitz: ${CONFIG.correct} / ${CONFIG.guessed} correct - Time remaining: ${msToTime(timeDeadline())}</h2>`;
		}
	}
}

const toggleBlitz = (e) => {
	CONFIG.plugin_enabled = e.target.checked;
	save();
}

const toggleBlitzPauseRounds = (e) => {
	CONFIG.pause_between_rounds = e.target.checked;
	save();
}

const toggleBlitzPauseGames = (e) => {
	CONFIG.pause_between_games = e.target.checked;
	save();
}

const timeFieldChanged = (e) => {
	let val = parseInt(e.target.value);
	
	if(isNaN(val) || val < 1) {
		val = 1;
	}

	e.target.value = val;
	CONFIG.last_time_selected = val;
	CONFIG.time = val * 60 * 1000;
}

const abandonGame = () => {
	if(confirm('Are you sure you wish to abandon your current Country Blitz game?')) {
		resetGame();
		save();
		setCurrentSettingsLayout();

		document.getElementById('blitz-setting-toggle').checked = CONFIG.plugin_enabled;
		document.getElementById('blitz-setting-time').value = CONFIG.last_time_selected;
		document.getElementById('blitz-setting-toggle-rounds').checked = CONFIG.pause_between_rounds;
		document.getElementById('blitz-setting-toggle-games').checked = CONFIG.pause_between_games;
	}
}

const setCurrentSettingsLayout = () => {
	document.getElementById('blitz-game-no-api-key').style.display = 'none';
	document.getElementById('blitz-game-current').style.display = 'none';
	document.getElementById('blitz-game-new').style.display = 'none';

	if(!apiKeyValid()) {
		document.getElementById('blitz-game-no-api-key').style.display = 'block';
	}else if(CONFIG.active) {
		document.getElementById('blitz-game-current').style.display = 'block';
	}else{
		document.getElementById('blitz-game-new').style.display = 'block';

		resetGame();
		save();
	}
}

const updateBlitzMapSettingsPanel = () => {
	let blitzPanel = document.getElementById('blitz-settings-panel');
	const mapSelectLayout = document.querySelector('div[class^="play_section__"]');
	let toggleClass = mapSelectLayout.querySelector('input[type="checkbox"][class^="toggle_toggle"]').className;

	if(!blitzPanel) {

		if(mapSelectLayout) {
			let panel = document.createElement('div');
			panel.id = 'blitz-settings-panel';
			panel.style.marginTop = '1em';
			mapSelectLayout.append(panel);

			panel.innerHTML = `
				<h2 style="margin-bottom: 0.5em; color:rgb(254, 205, 25);"><em>COUNTRY BLITZ</em></h2>

				<div id="blitz-game-new">
					<div style="display:flex; justify-content:center; align-items: center;">
						<div>
							<label style="display:flex; align-items:center; cursor:pointer;" id="blitz-enable">
								<strong style="margin-right:10px;">ENABLED</strong>
							</label>
						</div>

						<div style="margin-left:3em;">
							<label style="display:flex; align-items:center;" id="blitz-time">
								<strong style="margin-right:10px;">TIME (MINUTES)</strong>
							</label>
						</div>
					</div>

					<h4 style="margin-top:1.5em; margin-bottom:0.5em; opacity:0.6;">TIMER SETTINGS</h4>

					<div style="display:flex; justify-content:center; align-items: center;">
						<div>
							<label style="display:flex; align-items:center; cursor:pointer;" id="blitz-pause-rounds">
								<strong style="margin-right:10px;">PAUSE BETWEEN ROUNDS</strong>
							</label>
						</div>

						<div style="margin-left:3em;">
							<label style="display:flex; align-items:center; cursor:pointer;" id="blitz-pause-games">
								<strong style="margin-right:10px;">PAUSE BETWEEN GAMES</strong>
							</label>
						</div>
					</div>
				</div>

				<div id="blitz-game-current">
					<h3><strong>${CONFIG.correct} / ${CONFIG.guessed} correct - Time remaining: <span id="blitz-map-time-remaining"></span></strong></h3>

					<div style="display:flex; justify-content:center; margin-top: 1em;" id="blitz-abandon"></div>
				</div>

				<div id="blitz-game-no-api-key">
					You need to add an API key to the Country Blitz userscript before you can play, so it can detect whether or not you chose the correct country. You can get a free API key by signing up at <a href="https://www.bigdatacloud.com/" target="_blank" rel="noopener noreferrer" style="color:rgb(254, 205, 25);"><strong>Big Data Cloud</strong></a>.
					<br><br>
					Once you have an API key, replace <strong style="color:rgb(254, 205, 25);"><em>ENTER_API_KEY_HERE</em></strong> at the top of the userscript with your API key and reload the page.
				</div>
			`;

			let toggle = document.createElement('input');
			toggle.id = 'blitz-setting-toggle';
			toggle.type = 'checkbox';
			toggle.className = toggleClass;
			toggle.checked = CONFIG.plugin_enabled;
			toggle.onclick = toggleBlitz;
			document.getElementById('blitz-enable').append(toggle);

			let timeLimit = document.createElement('input');
			timeLimit.id = 'blitz-setting-time';
			timeLimit.type = 'number';
			timeLimit.pattern = '[0-9]+';
			timeLimit.min = 1;
			timeLimit.value = CONFIG.last_time_selected;
			timeLimit.style.width = '80px';
			timeLimit.style.background = 'rgba(255,255,255,0.1)';
			timeLimit.style.color = 'white';
			timeLimit.style.border = 'none';
			timeLimit.style.borderRadius = '5px';
			timeLimit.onchange = timeFieldChanged;
			document.getElementById('blitz-time').append(timeLimit);

			let pauseRounds = document.createElement('input');
			pauseRounds.id = 'blitz-setting-toggle-rounds';
			pauseRounds.type = 'checkbox';
			pauseRounds.className = toggleClass;
			pauseRounds.checked = CONFIG.pause_between_rounds;
			pauseRounds.onclick = toggleBlitzPauseRounds;
			document.getElementById('blitz-pause-rounds').append(pauseRounds);

			let pauseGames = document.createElement('input');
			pauseGames.id = 'blitz-setting-toggle-games';
			pauseGames.type = 'checkbox';
			pauseGames.className = toggleClass;
			pauseGames.checked = CONFIG.pause_between_games;
			pauseGames.onclick = toggleBlitzPauseGames;
			document.getElementById('blitz-pause-games').append(pauseGames);

			let abandonButton = document.createElement('a');
			abandonButton.onclick = abandonGame;
			abandonButton.style.display = 'block';
			abandonButton.style.cursor = 'pointer';
			abandonButton.style.color = 'white';
			abandonButton.style.background = '#d00';
			abandonButton.style.padding = '0 16px';
			abandonButton.style.fontSize = '0.9em';
			abandonButton.style.height = '32px';
			abandonButton.style.lineHeight = '32px';
			abandonButton.style.borderRadius = '16px';
			abandonButton.innerHTML = `<strong><em>ABANDON CURRENT GAME</em></strong>`;
			document.getElementById('blitz-abandon').append(abandonButton);

			setCurrentSettingsLayout();
		}
	}

	let tr = document.getElementById('blitz-map-time-remaining');

	if(tr) {
		tr.textContent = msToTime(timeDeadline());
	}
}

const percentage = (n) => {
	return `${Math.round(n * 100)}%`;
}

const showResultsScreen = () => {
	if(CONFIG.finished) {
		return;
	}
	
	resultScreenTimestamp = new Date();
	CONFIG.active = false;
	CONFIG.finished = true;
	save();

	resultScreen = document.createElement('div');
	resultScreen.id = 'blitz-results';

	let info = `You got <span style="color:#0d0;">${CONFIG.correct}</span> / ${CONFIG.guessed} countries correct (${percentage(CONFIG.correct / CONFIG.guessed)})`;

	if(CONFIG.guessed === 0) {
		info = `You didn't make any guesses.`
	}

	resultScreen.innerHTML = `
		<div style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:99999; background:rgba(0,0,0,0.95); font-family:neo-sans, sans-serif;">
			<div style="width:100%; height:100%; display:flex; justify-content:center; align-items:center; overflow-x:hidden; overflow-y:auto; padding:20px; color:#fff; text-align:center; flex-direction:column;">
				<h1 style="margin-bottom:0.25em; font-size:4em; color:rgb(254, 205, 25);">Time's up!</h1>
				<h2>${info}</h2>
				<div id="results-close-button" style="margin-top:2em;"></div>
			</div>
		</div>
	`;
	
	document.body.append(resultScreen);

	let closeResultsButton = document.createElement('a');
	closeResultsButton.onclick = closeResultsScreen;
	closeResultsButton.style.display = 'block';
	closeResultsButton.style.cursor = 'pointer';
	closeResultsButton.style.color = 'white';
	closeResultsButton.style.background = 'rgb(108, 185, 40)';
	closeResultsButton.style.padding = '0 16px';
	closeResultsButton.style.width = '140px';
	closeResultsButton.style.height = '48px';
	closeResultsButton.style.lineHeight = '48px';
	closeResultsButton.style.borderRadius = '24px';
	closeResultsButton.innerHTML = `<strong><em>CLOSE</em></strong>`;
	document.getElementById('results-close-button').append(closeResultsButton);

	if(document.querySelector('div[class^="play_section__"]')) {
		setCurrentSettingsLayout();
	}
}

const closeResultsScreen = () => {
	if(new Date() - resultScreenTimestamp < 1000) {
		return;
	}

	resultScreen.remove();
	resetGame();
	CONFIG.finished = true;
	save();
}

const apiKeyValid = () => {
	if (API_KEY.length <= 24 || API_KEY.match("^[a-f0-9]*$") == null) {
		return false;
	}

	return true;
}

async function getUserAsync(location) {
    if (location[0] <= -85.05) {
        return 'AQ';
    }

    let api = "https://api.bigdatacloud.net/data/reverse-geocode?latitude="+location[0]+"&longitude="+location[1]+"&localityLanguage=en&key="+API_KEY;
	
    let response = await fetch(api)
        .then(res => res.json())
        .then(out => CountryDict[out.countryCode]);

    return response;
}

function checkGuess(index) {
    const game_tag = window.location.href.substring(window.location.href.lastIndexOf('/') + 1);
    let api_url = "";

    if (location.pathname.startsWith("/game/")) {
        api_url = "https://www.geoguessr.com/api/v3/games/"+game_tag;
    } else if (location.pathname.startsWith("/challenge/")) {
        api_url = "https://www.geoguessr.com/api/v3/challenges/"+game_tag+"/game";
    };

    fetch(api_url)
    .then(res => res.json())
    .then((out) => {
        let guess_counter = out.player.guesses.length;
        let guess = [out.player.guesses[guess_counter-1].lat,out.player.guesses[guess_counter-1].lng];

        if (guess[0] == last_guess[0] && guess[1] == last_guess[1]) {
            return;
        }

        last_guess = guess;
        let location = [out.rounds[guess_counter-1].lat,out.rounds[guess_counter-1].lng];

        getUserAsync(guess)
        .then(gue => {
            getUserAsync(location)
            .then(loc => {
				CONFIG.round_times[index].correct = gue == loc;
				CONFIG.correct = getScoreCorrect();
				save();
            });
        });
    }).catch(err => { throw err });
}

const tick = () => {
	const mapSelectLayout = document.querySelector('div[class^="play_section__"]');

	if(mapSelectLayout) {
		if(CONFIG.finished || (CONFIG.active && CONFIG.game_round !== 5) || (CONFIG.round_times.length > 0 && !CONFIG.round_times[CONFIG.round_times.length - 1].end)) {
			resetGame();
			save();
		}

		updateBlitzMapSettingsPanel();
	}

	if (document.querySelector('.game-layout') && CONFIG.active) {
		if (CONFIG.current_round >= 0) {
			const resultLayout = document.querySelector('div[class^="result-layout_root"]');
			const summaryLayout = document.querySelector('div[class^="standard-final-result_progressSection__"]');

			if(resultLayout) {
				if(summaryLayout) {
					updateBlitzSummaryPanel();
				}else{
					updateBlitzResultsPanel();
				}
			}else if(CONFIG.playing_round) {
				updateBlitzGamePanel();
			}
		}
	}

	if(timeDeadline().getTime() <= 0) {
		showResultsScreen();
	}

	setTimeout(tick, TICK_INTERVAL);
}

const init = () => {
	load();

	const observer = new MutationObserver(() => {
		if(!CONFIG.plugin_enabled) {
			return;
		}
		const gameLayout = document.querySelector('.game-layout');
		const resultLayout = document.querySelector('div[class^="result-layout_root"]');
		const loadingScreenVisible = document.querySelector('div[class^="fullscreen-spinner_root"]');

		if (gameLayout) {
			if (resultLayout) {
				stopRound();
			} else if (CONFIG.game_round !== getCurrentRound() && !loadingScreenVisible) {
				startRound();
			}
		}
	});

	observer.observe(document.querySelector('#__next'), { subtree: true, childList: true });
	tick();
}

document.onreadystatechange = () => {
	if (document.readyState === 'complete') {
		init();
	}
}