// ==UserScript==
// @name         GeoGuessr Country Streak
// @description  Adds a country streak counter that automatically updates while you play
// @version      1.1
// @author       miraclewhips
// @match        *://*.geoguessr.com/*
// @icon         https://www.google.com/s2/favicons?domain=geoguessr.com
// @grant        none
// @copyright    2022, miraclewhips (https://github.com/miraclewhips)
// @license      MIT
// @downloadURL    https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-country-streak.user.js
// @updateURL    https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-country-streak.user.js
// ==/UserScript==

let ENABLED_ON_CHALLENGES = true; //Replace with true or false
let AUTOMATIC = true; //Replace with false for a manual counter





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
		streak: 0,
		previous_streak: 0,
		streak_backup: 0,
		last_guess: [0, 0]
	}

	let data = JSON.parse(window.localStorage.getItem('geoCountryStreak'));

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
	window.localStorage.setItem('geoCountryStreak', JSON.stringify(DATA));
}

const getCurrentRound = () => {
	const roundNode = document.querySelector('div[class^="status_inner__"]>div[data-qa="round-number"]');
	return parseInt(roundNode.children[1].textContent.split(/\//gi)[0].trim(), 10);
}

var CountryDict = {
	AF: 'AF',
	AX: 'FI', // Aland Islands
	AL: 'AL',
	DZ: 'DZ',
	AS: 'US', // American Samoa
	AD: 'AD',
	AO: 'AO',
	AI: 'GB', // Anguilla
	AQ: 'AQ', // Antarctica
	AG: 'AG',
	AR: 'AR',
	AM: 'AM',
	AW: 'NL', // Aruba
	AU: 'AU',
	AT: 'AT',
	AZ: 'AZ',
	BS: 'BS',
	BH: 'BH',
	BD: 'BD',
	BB: 'BB',
	BY: 'BY',
	BE: 'BE',
	BZ: 'BZ',
	BJ: 'BJ',
	BM: 'GB', // Bermuda
	BT: 'BT',
	BO: 'BO',
	BQ: 'NL', // Bonaire, Sint Eustatius, Saba
	BA: 'BA',
	BW: 'BW',
	BV: 'NO', // Bouvet Island
	BR: 'BR',
	IO: 'GB', // British Indian Ocean Territory
	BN: 'BN',
	BG: 'BG',
	BF: 'BF',
	BI: 'BI',
	KH: 'KH',
	CM: 'CM',
	CA: 'CA',
	CV: 'CV',
	KY: 'UK', // Cayman Islands
	CF: 'CF',
	TD: 'TD',
	CL: 'CL',
	CN: 'CN',
	CX: 'AU', // Christmas Islands
	CC: 'AU', // Cocos (Keeling) Islands
	CO: 'CO',
	KM: 'KM',
	CG: 'CG',
	CD: 'CD',
	CK: 'NZ', // Cook Islands
	CR: 'CR',
	CI: 'CI',
	HR: 'HR',
	CU: 'CU',
	CW: 'NL', // Curacao
	CY: 'CY',
	CZ: 'CZ',
	DK: 'DK',
	DJ: 'DJ',
	DM: 'DM',
	DO: 'DO',
	EC: 'EC',
	EG: 'EG',
	SV: 'SV',
	GQ: 'GQ',
	ER: 'ER',
	EE: 'EE',
	ET: 'ET',
	FK: 'GB', // Falkland Islands
	FO: 'DK', // Faroe Islands
	FJ: 'FJ',
	FI: 'FI',
	FR: 'FR',
	GF: 'FR', // French Guiana
	PF: 'FR', // French Polynesia
	TF: 'FR', // French Southern Territories
	GA: 'GA',
	GM: 'GM',
	GE: 'GE',
	DE: 'DE',
	GH: 'GH',
	GI: 'UK', // Gibraltar
	GR: 'GR',
	GL: 'DK', // Greenland
	GD: 'GD',
	GP: 'FR', // Guadeloupe
	GU: 'US', // Guam
	GT: 'GT',
	GG: 'GB', // Guernsey
	GN: 'GN',
	GW: 'GW',
	GY: 'GY',
	HT: 'HT',
	HM: 'AU', // Heard Island and McDonald Islands
	VA: 'VA',
	HN: 'HN',
	HK: 'CN', // Hong Kong
	HU: 'HU',
	IS: 'IS',
	IN: 'IN',
	ID: 'ID',
	IR: 'IR',
	IQ: 'IQ',
	IE: 'IE',
	IM: 'GB', // Isle of Man
	IL: 'IL',
	IT: 'IT',
	JM: 'JM',
	JP: 'JP',
	JE: 'GB', // Jersey
	JO: 'JO',
	KZ: 'KZ',
	KE: 'KE',
	KI: 'KI',
	KR: 'KR',
	KW: 'KW',
	KG: 'KG',
	LA: 'LA',
	LV: 'LV',
	LB: 'LB',
	LS: 'LS',
	LR: 'LR',
	LY: 'LY',
	LI: 'LI',
	LT: 'LT',
	LU: 'LU',
	MO: 'CN', // Macao
	MK: 'MK',
	MG: 'MG',
	MW: 'MW',
	MY: 'MY',
	MV: 'MV',
	ML: 'ML',
	MT: 'MT',
	MH: 'MH',
	MQ: 'FR', // Martinique
	MR: 'MR',
	MU: 'MU',
	YT: 'FR', // Mayotte
	MX: 'MX',
	FM: 'FM',
	MD: 'MD',
	MC: 'MC',
	MN: 'MN',
	ME: 'ME',
	MS: 'GB', // Montserrat
	MA: 'MA',
	MZ: 'MZ',
	MM: 'MM',
	NA: 'NA',
	NR: 'NR',
	NP: 'NP',
	NL: 'NL',
	AN: 'NL', // Netherlands Antilles
	NC: 'FR', // New Caledonia
	NZ: 'NZ',
	NI: 'NI',
	NE: 'NE',
	NG: 'NG',
	NU: 'NZ', // Niue
	NF: 'AU', // Norfolk Island
	MP: 'US', // Northern Mariana Islands
	NO: 'NO',
	OM: 'OM',
	PK: 'PK',
	PW: 'PW',
	PS: 'IL', // Palestine
	PA: 'PA',
	PG: 'PG',
	PY: 'PY',
	PE: 'PE',
	PH: 'PH',
	PN: 'GB', // Pitcairn
	PL: 'PL',
	PT: 'PT',
	PR: 'US', // Puerto Rico
	QA: 'QA',
	RE: 'FR', // Reunion
	RO: 'RO',
	RU: 'RU',
	RW: 'RW',
	BL: 'FR', // Saint Barthelemy
	SH: 'GB', // Saint Helena
	KN: 'KN',
	LC: 'LC',
	MF: 'FR', // Saint Martin
	PM: 'FR', // Saint Pierre and Miquelon
	VC: 'VC',
	WS: 'WS',
	SM: 'SM',
	ST: 'ST',
	SA: 'SA',
	SN: 'SN',
	RS: 'RS',
	SC: 'SC',
	SL: 'SL',
	SG: 'SG',
	SX: 'NL', // Sint Maarten
	SK: 'SK',
	SI: 'SI',
	SB: 'SB',
	SO: 'SO',
	ZA: 'ZA',
	GS: 'GB', // South Georgia and the South Sandwich Islands
	ES: 'ES',
	LK: 'LK',
	SD: 'SD',
	SR: 'SR',
	SJ: 'NO', // Svalbard and Jan Mayen
	SZ: 'SZ',
	SE: 'SE',
	CH: 'CH',
	SY: 'SY',
	TW: 'TW', // Taiwan
	TJ: 'TJ',
	TZ: 'TZ',
	TH: 'TH',
	TL: 'TL',
	TG: 'TG',
	TK: 'NZ', // Tokelau
	TO: 'TO',
	TT: 'TT',
	TN: 'TN',
	TR: 'TR',
	TM: 'TM',
	TC: 'GB', // Turcs and Caicos Islands
	TV: 'TV',
	UG: 'UG',
	UA: 'UA',
	AE: 'AE',
	GB: 'GB',
	US: 'US',
	UM: 'US', // US Minor Outlying Islands
	UY: 'UY',
	UZ: 'UZ',
	VU: 'VU',
	VE: 'VE',
	VN: 'VN',
	VG: 'GB', // British Virgin Islands
	VI: 'US', // US Virgin Islands
	WF: 'FR', // Wallis and Futuna
	EH: 'MA', // Western Sahara
	YE: 'YE',
	ZM: 'ZM',
	ZW: 'ZW'
};

const checkGameMode = () => {
	return (location.pathname.startsWith("/game/") || (ENABLED_ON_CHALLENGES && location.pathname.startsWith("/challenge/")));
}

const updateRoundPanel = () => {
	let panel = document.getElementById('streak-counter-panel');

	if(!panel) {
		let gameScore = document.querySelector('.game-layout__status div[class^="status_section"][data-qa="score"]');

		if(gameScore) {
			let panel = document.createElement('div');
			panel.id = 'streak-counter-panel';
			panel.style.display = 'flex';

			let classLabel = gameScore.querySelector('div[class^="status_label"]').className;
			let valueLabel = gameScore.querySelector('div[class^="status_value"]').className;

			panel.innerHTML = `
				<div class="${gameScore.getAttribute('class')}">
					<div class="${classLabel}">STREAK</div>
					<div id="streak-counter-value" class="${valueLabel}"></div>
				</div>
			`;

			gameScore.parentNode.append(panel);
		}
	}
	
	let streak = document.getElementById('streak-counter-value');

	if(streak) {
		streak.innerText = DATA.streak;
	}
}

const createStreakText = () => {
	if(DATA.checking_api) {
		return `Loading...`;
	}

	if(DATA.streak > 0) {
		return `It was <span style="color:#6cb928">${DATA.country_location}!</span> Country Streak: <span style="color:#fecd19">${DATA.streak}</span>`;
	}else{
		let suffix = `countries in a row.`;

		switch(DATA.previous_streak) {
			case 1:
				suffix = `country.`;
		}

		return `You guessed <span style="color:#f95252">${DATA.country_guess}</span>, unfortunately it was <span style="color:#6cb928">${DATA.country_location}</span>. Your streak ended after correctly guessing <span style="color:#fecd19">${DATA.previous_streak}</span> ${suffix}`;
	}
}

const createStreakElement = () => {
	let score = document.createElement('div');
	score.style.fontSize = '20px';
	score.style.color = '#fff';
	score.style.margin = '5px 0';
	return score;
}

const updateSummaryPanel = () => {
	const scoreLayout = document.querySelector('div[class^="result-layout_root"] div[class^="round-result_score__"]');
	const finalScoreLayout = document.querySelector('div[class^="result-layout_root"] div[class^="standard-final-result_score__"]');

	if(scoreLayout) {
		if(!document.getElementById('streak-score-panel-summary')) {
			let score = createStreakElement();
			score.id = 'streak-score-panel-summary';
			scoreLayout.append(score);
		}

		document.getElementById('streak-score-panel-summary').innerHTML = createStreakText();
	}

	if(finalScoreLayout) {
		if(!document.getElementById('streak-score-panel-final')) {
			let score = createStreakElement();
			score.id = 'streak-score-panel-final';
			finalScoreLayout.append(score);
		}

		document.getElementById('streak-score-panel-final').innerHTML = createStreakText();
	}
}

const startRound = () => {
	if(!checkGameMode()) return;

	DATA.round = getCurrentRound();
	DATA.round_started = true;
	DATA.game_finished = false;

	updateRoundPanel();
}

const queryAPI = async (location) => {
	if (location[0] <= -85.05) {
			return 'AQ';
	}

	let apiUrl = `https://nominatim.openstreetmap.org/reverse.php?lat=${location[0]}&lon=${location[1]}&zoom=5&format=jsonv2`;

	return await fetch(apiUrl).then(res => res.json());
};

const stopRound = () => {
	DATA.round_started = false;

	if(!checkGameMode()) return;

	if(!AUTOMATIC) {
		updateStreakPanels();
		return;
	}

	const id = window.location.href.substring(window.location.href.lastIndexOf('/') + 1);

	let apiUrl = `https://www.geoguessr.com/api/v3/games/${id}`;

	if(location.pathname.startsWith("/challenge/")) {
		apiUrl = `https://www.geoguessr.com/api/v3/challenges/${id}/game`;
	}

	DATA.checking_api = true;
	updateStreakPanels();

	fetch(apiUrl)
	.then(res => res.json())
	.then((out) => {
			let guess_counter = out.player.guesses.length;
			let guess = [out.player.guesses[guess_counter-1].lat,out.player.guesses[guess_counter-1].lng];

			if (guess[0] == DATA.last_guess[0] && guess[1] == DATA.last_guess[1]) {
				DATA.checking_api = false;
				updateStreakPanels();
				return;
			}

			DATA.last_guess = guess;
			let location = [out.rounds[guess_counter-1].lat,out.rounds[guess_counter-1].lng];

			queryAPI(guess).then(responseGuess => {
				queryAPI(location).then(responseLocation => {
					DATA.checking_api = false;
					let guessCC = responseGuess.address.country_code.toUpperCase();
					let locationCC = responseLocation.address.country_code.toUpperCase();

					DATA.country_guess = responseGuess.address.country;
					DATA.country_location = responseLocation.address.country;

					if ((CountryDict[guessCC] || guessCC) === (CountryDict[locationCC] || locationCC)) {
						updateStreak(DATA.streak + 1);
					} else {
						updateStreak(0);
					}
					});
			});
	}).catch(err => { throw err });
}

const updateStreak = (streak) => {
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
				updateStreakPanels();
			}
		}
	});

	observer.observe(document.querySelector('#__next'), { subtree: true, childList: true });
}

init();