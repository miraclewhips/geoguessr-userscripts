// ==UserScript==
// @name         GeoGuessr Games Played Counter
// @description  Shows how many games you have played and allows you to set a counter (click counter on the game screen to configure)
// @version      1.9
// @author       miraclewhips
// @match        *://*.geoguessr.com/*
// @icon         https://www.google.com/s2/favicons?domain=geoguessr.com
// @grant        unsafeWindow
// @grant        GM_addStyle
// @run-at       document-start
// @copyright    2024, miraclewhips (https://github.com/miraclewhips)
// @license      MIT
// @downloadURL  https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-games-played-counter.user.js
// @updateURL    https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-games-played-counter.user.js
// ==/UserScript==



/* ############################################################################### */
/* ##### DON'T MODIFY ANYTHING BELOW HERE UNLESS YOU KNOW WHAT YOU ARE DOING ##### */
/* ############################################################################### */

if(window.frameElement) return;

// Event Framework
(function() {
var __awaiter=this&&this.__awaiter||function(c,R,t,i){function o(n){return n instanceof t?n:new t(function(s){s(n)})}return new(t||(t=Promise))(function(n,s){function l(r){try{u(i.next(r))}catch(a){s(a)}}function v(r){try{u(i.throw(r))}catch(a){s(a)}}function u(r){r.done?n(r.value):o(r.value).then(l,v)}u((i=i.apply(c,R||[])).next())})};const THE_WINDOW=unsafeWindow||window;(function(){class c{constructor(){this.events=new EventTarget,this.state=this.defaultState(),this.loadState(),this.initFetchEvents(),this.overrideFetch(),this.init(),THE_WINDOW.addEventListener("load",()=>{var t,i,o;if(location.pathname.startsWith("/challenge/")){const n=(o=(i=(t=THE_WINDOW?.__NEXT_DATA__)===null||t===void 0?void 0:t.props)===null||i===void 0?void 0:i.pageProps)===null||o===void 0?void 0:o.gameSnapshot;if(!n||!n.round)return;THE_WINDOW.GEFFetchEvents.dispatchEvent(new CustomEvent("received_data",{detail:n}))}}),THE_WINDOW.GEFFetchEvents.addEventListener("received_data",t=>{this.parseData(t.detail)})}initFetchEvents(){THE_WINDOW.GEFFetchEvents===void 0&&(THE_WINDOW.GEFFetchEvents=new EventTarget)}overrideFetch(){if(THE_WINDOW.fetch.isGEFFetch)return;const t=THE_WINDOW.fetch;THE_WINDOW.fetch=function(){return function(...i){var o;return __awaiter(this,void 0,void 0,function*(){const n=i[0].toString();if(n.match(/geoguessr\.com\/api\/v3\/games$/)&&((o=i[1])===null||o===void 0?void 0:o.method)==="POST"){const s=yield t.apply(THE_WINDOW,i),l=yield s.clone().json();return l.round&&THE_WINDOW.GEFFetchEvents.dispatchEvent(new CustomEvent("received_data",{detail:l})),s}if(/geoguessr.com\/api\/v3\/(games|challenges)\//.test(n)&&n.indexOf("daily-challenge")===-1){const s=yield t.apply(THE_WINDOW,i),l=yield s.clone().json();return l.round&&THE_WINDOW.GEFFetchEvents.dispatchEvent(new CustomEvent("received_data",{detail:l})),s}return t.apply(THE_WINDOW,i)})}}(),THE_WINDOW.fetch.isGEFFetch=!0}init(){return __awaiter(this,void 0,void 0,function*(){return this.loadedPromise||(this.loadedPromise=Promise.resolve(this)),yield this.loadedPromise})}defaultState(){return{current_game_id:"",is_challenge_link:!1,current_round:0,round_in_progress:!1,game_in_progress:!0,total_score:{amount:0,unit:"points",percentage:0},total_distance:{meters:{amount:0,unit:"km"},miles:{amount:0,unit:"miles"}},total_time:0,rounds:[],map:{id:"",name:""}}}parseData(t){const i=t.player.guesses.length==t.round,o=t.round!==this.state.current_round||t.token!==this.state.current_game_id;i?this.stopRound(t):o&&this.startRound(t)}loadState(){let t=window.localStorage.getItem("GeoGuessrEventFramework_STATE");if(!t)return;let i=JSON.parse(t);i&&(Object.assign(this.state,this.defaultState(),i),this.saveState())}saveState(){window.localStorage.setItem("GeoGuessrEventFramework_STATE",JSON.stringify(this.state))}hex2a(t){const i=t.toString();let o="";for(let n=0;n<i.length;n+=2)o+=String.fromCharCode(parseInt(i.substring(n,n+2),16));return o}startRound(t){this.state.current_round=t.round,this.state.round_in_progress=!0,this.state.game_in_progress=!0,this.state.current_game_id=t.token,this.state.is_challenge_link=t.type=="challenge",this.state.rounds=this.state.rounds.slice(0,t.round-1),t&&(this.state.map={id:t.map,name:t.mapName}),this.saveState(),this.state.current_round===1&&this.events.dispatchEvent(new CustomEvent("game_start",{detail:this.state})),this.events.dispatchEvent(new CustomEvent("round_start",{detail:this.state}))}stopRound(t){var i,o,n,s,l,v,u,r,a,h,m,_,p,f,g,E,F,w,y,S,G,k,T,C,D,x,I,N,O,b;if(this.state.round_in_progress=!1,t){const d=t.rounds[this.state.current_round-1],e=t.player.guesses[this.state.current_round-1];if(!d||!e)return;this.state.rounds[this.state.current_round-1]={location:{lat:d.lat,lng:d.lng,heading:d.heading,pitch:d.pitch,zoom:d.zoom,panoId:d.panoId?this.hex2a(d.panoId):void 0},player_guess:{lat:e.lat,lng:e.lng},score:{amount:parseFloat((i=e?.roundScore)===null||i===void 0?void 0:i.amount)||0,unit:((o=e?.roundScore)===null||o===void 0?void 0:o.unit)||"points",percentage:((n=e?.roundScore)===null||n===void 0?void 0:n.percentage)||0},distance:{meters:{amount:parseFloat((l=(s=e?.distance)===null||s===void 0?void 0:s.meters)===null||l===void 0?void 0:l.amount)||0,unit:((u=(v=e?.distance)===null||v===void 0?void 0:v.meters)===null||u===void 0?void 0:u.unit)||"km"},miles:{amount:parseFloat((a=(r=e?.distance)===null||r===void 0?void 0:r.miles)===null||a===void 0?void 0:a.amount)||0,unit:((m=(h=e?.distance)===null||h===void 0?void 0:h.miles)===null||m===void 0?void 0:m.unit)||"miles"}},time:e?.time},this.state.total_score={amount:parseFloat((p=(_=t?.player)===null||_===void 0?void 0:_.totalScore)===null||p===void 0?void 0:p.amount)||0,unit:((g=(f=t?.player)===null||f===void 0?void 0:f.totalScore)===null||g===void 0?void 0:g.unit)||"points",percentage:((F=(E=t?.player)===null||E===void 0?void 0:E.totalScore)===null||F===void 0?void 0:F.percentage)||0},this.state.total_distance={meters:{amount:parseFloat((S=(y=(w=t?.player)===null||w===void 0?void 0:w.totalDistance)===null||y===void 0?void 0:y.meters)===null||S===void 0?void 0:S.amount)||0,unit:((T=(k=(G=t?.player)===null||G===void 0?void 0:G.totalDistance)===null||k===void 0?void 0:k.meters)===null||T===void 0?void 0:T.unit)||"km"},miles:{amount:parseFloat((x=(D=(C=t?.player)===null||C===void 0?void 0:C.totalDistance)===null||D===void 0?void 0:D.miles)===null||x===void 0?void 0:x.amount)||0,unit:((O=(N=(I=t?.player)===null||I===void 0?void 0:I.totalDistance)===null||N===void 0?void 0:N.miles)===null||O===void 0?void 0:O.unit)||"miles"}},this.state.total_time=(b=t?.player)===null||b===void 0?void 0:b.totalTime,this.state.map={id:t.map,name:t.mapName}}this.saveState(),this.events.dispatchEvent(new CustomEvent("round_end",{detail:this.state})),this.state.current_round===5&&this.events.dispatchEvent(new CustomEvent("game_end",{detail:this.state}))}}THE_WINDOW.GeoGuessrEventFramework||(THE_WINDOW.GeoGuessrEventFramework=new c,console.log("GeoGuessr Event Framework initialised: https://github.com/miraclewhips/geoguessr-event-framework"))})();
})();

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
	const gameScore = document.querySelector('div[class^="game_status__"] div[class^="status_section"][data-qa="score"]');
	let panel = getRoundPanel();

	const forceUpdate = gameScore && !panel;

	if(!forceUpdate && (!shouldUpdateRoundPanel || !gameScore)) return;

	shouldUpdateRoundPanel = false;

	if(!panel) {
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
	if(!shouldUpdateSummaryPanel) return;

	const scoreLayout = document.querySelector('div[class^="result-layout_root"] div[class^="round-result_wrapper__"]');

	const scoreLayoutBottom = document.querySelector('div[class^="result-layout_root"] div[class^="result-layout_bottomNew__"]');
	if(scoreLayoutBottom) {
		scoreLayoutBottom.style.flex = '0 0 auto';
		scoreLayoutBottom.style.maxHeight = 'none';
	}

	if(!scoreLayout && !scoreLayoutBottom) return;

	shouldUpdateSummaryPanel = false;

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

const observer = new MutationObserver(() => {
	updateStreakPanels();
});

if(document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', () => {
		observer.observe(document.querySelector('#__next'), { subtree: true, childList: true });
	});
}else{
	observer.observe(document.querySelector('#__next'), { subtree: true, childList: true });
}

let shouldUpdateRoundPanel = false;
let shouldUpdateSummaryPanel = false;

async function init() {
	loadState();

	const USER_ID = __NEXT_DATA__?.props?.accountProps?.account?.user?.userId;
	if(!USER_ID) return;

	if(GeoGuessrEventFramework) {
		GeoGuessrEventFramework.init().then(GEF => {
			GEF.events.addEventListener('round_start', () => {
				shouldUpdateRoundPanel = true;
				updateStreakPanels();
			});

			GEF.events.addEventListener('game_end', async () => {
				STATE.checking_api = true;
				shouldUpdateSummaryPanel = true;
				updateStreakPanels();
				await updateCount(USER_ID);
				shouldUpdateSummaryPanel = true;
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
		shouldUpdateRoundPanel = true;
		updateStreakPanels();
		conf.remove();
	});
}
