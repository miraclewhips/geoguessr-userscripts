// ==UserScript==
// @name         GeoGuessr Team Duels Timer
// @description  Adds a timer that counts up or down to team duels
// @version      1.1
// @author       miraclewhips
// @match        *://*.geoguessr.com/*
// @icon         https://www.google.com/s2/favicons?domain=geoguessr.com
// @grant        none
// @copyright    2022, miraclewhips (https://github.com/miraclewhips)
// @license      MIT
// @downloadURL    https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-team-duels-timer.user.js
// @updateURL    https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-team-duels-timer.user.js
// ==/UserScript==

const COUNT_DOWN = true; // set to false to count up
const TIME_LIMIT = 45; // time limit to start at (if counting down)



/* ############################################################################### */
/* ##### DON'T MODIFY ANYTHING BELOW HERE UNLESS YOU KNOW WHAT YOU ARE DOING ##### */
/* ############################################################################### */

const styles = document.createElement('style');
styles.innerHTML = `
	#geoTDTimer {
		background: var(--ds-color-purple-80);
    font-size: 25px;
    padding: 8px 20px;
    border-radius: 100px;
    font-weight: bold;
	}

	#geoTDTimer.is-hidden {
		display: none !important;
	}
`;
document.body.append(styles);

var tickInterval;
var SETTINGS = {
	active: false,
	date: false
}

const timestamp = (t) => {
	let sec = (Math.floor(t/1000) % 60).toString().padStart(2, 0);
	let min = (Math.floor(t/1000/60) % 60).toString().padStart(2, 0);
	let hr = Math.floor(t/1000/60/60);

	if(hr > 0) {
		return `${hr}:${min}:${sec}`;
	}else{
		return `${min}:${sec}`;
	}
}

const save = () => {
	localStorage.setItem('geoTDTimer', JSON.stringify(SETTINGS));
}

const tick = () => {
	let el = document.getElementById('geoTDTimer');
	if(!el) return;

	let roundClock = document.querySelector('div[class*="clock-timer_timer__"]');
	el.classList.toggle('is-hidden', roundClock);

	let d = SETTINGS.date;
	let now = new Date().getTime();
	let t = Math.max(COUNT_DOWN ? (d + TIME_LIMIT * 1000) - now : now - d, 0);
	el.textContent = timestamp(t);
}

const startTimer = (restart = true) => {
	SETTINGS.active = true;

	if(restart) {
		SETTINGS.date = new Date().getTime();
	}

	save();
	
	if(!document.getElementById('geoTDTimer')) {
		const hud = document.querySelector('div[class*="hud_middle__9_xG8"]');
		let timerElement = document.createElement('div');
		timerElement.id = 'geoTDTimer';
		hud.appendChild(timerElement);

		clearInterval(tickInterval);
		tickInterval = setInterval(tick, 1000);
		tick();
	}
}

const init = () => {
	if(localStorage.getItem('geoTDTimer')) {
		SETTINGS = JSON.parse(localStorage.getItem('geoTDTimer'));
	}
	
	let resume = false;
	if(SETTINGS.active) {
		resume = true;
	}
	
	var ROUND_NUMBER_VISIBLE = false;

	const observer = new MutationObserver(() => {
		const roundNumber = document.querySelector('p[class*="new-round_roundNumber__"]');
		
		if(ROUND_NUMBER_VISIBLE && !roundNumber) {
			ROUND_NUMBER_VISIBLE = false;
			startTimer();
		}else if(!ROUND_NUMBER_VISIBLE && roundNumber) {
			ROUND_NUMBER_VISIBLE = true;
		}else if(resume && document.querySelector('div[class*="hud_middle__9_xG8"]')) {
			resume = false;
			startTimer(false);
		}
	});

	if(document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', () => {
			observer.observe(document.querySelector('#__next'), { subtree: true, childList: true });
		});
	}else{
		observer.observe(document.querySelector('#__next'), { subtree: true, childList: true });
	}
}

init();
