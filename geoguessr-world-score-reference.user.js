// ==UserScript==
// @name         GeoGuessr World Score Reference
// @description  See approximately what a round score would have been on a world map (while playing other maps e.g. country-specific maps)
// @version      1.10
// @author       miraclewhips
// @match        *://*.geoguessr.com/*
// @run-at       document-start
// @icon         https://www.google.com/s2/favicons?domain=geoguessr.com
// @grant        unsafeWindow
// @grant        GM_addStyle
// @copyright    2024, miraclewhips (https://github.com/miraclewhips)
// @license      MIT
// @downloadURL  https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-world-score-reference.user.js
// @updateURL    https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-world-score-reference.user.js
// ==/UserScript==



/* ############################################################################### */
/* ##### DON'T MODIFY ANYTHING BELOW HERE UNLESS YOU KNOW WHAT YOU ARE DOING ##### */
/* ############################################################################### */

if(window.frameElement) return;

// Event Framework
(function() {
var __awaiter=this&&this.__awaiter||function(c,E,t,e){function n(i){return i instanceof t?i:new t(function(s){s(i)})}return new(t||(t=Promise))(function(i,s){function r(l){try{a(e.next(l))}catch(d){s(d)}}function v(l){try{a(e.throw(l))}catch(d){s(d)}}function a(l){l.done?i(l.value):n(l.value).then(r,v)}a((e=e.apply(c,E||[])).next())})};const THE_WINDOW=unsafeWindow||window;(function(){class c{constructor(){this.events=new EventTarget,this.state=this.defaultState(),this.loadState(),this.initFetchEvents(),this.overrideFetch(),this.init(),THE_WINDOW.addEventListener("load",()=>{var t,e,n;if(location.pathname.startsWith("/challenge/")){const i=(n=(e=(t=THE_WINDOW?.__NEXT_DATA__)===null||t===void 0?void 0:t.props)===null||e===void 0?void 0:e.pageProps)===null||n===void 0?void 0:n.gameSnapshot;if(!i||!i.round)return;THE_WINDOW.GEFFetchEvents.dispatchEvent(new CustomEvent("received_data",{detail:i}))}}),THE_WINDOW.GEFFetchEvents.addEventListener("received_data",t=>{this.parseData(t.detail)})}initFetchEvents(){THE_WINDOW.GEFFetchEvents===void 0&&(THE_WINDOW.GEFFetchEvents=new EventTarget)}overrideFetch(){if(THE_WINDOW.fetch.isGEFFetch)return;const t=THE_WINDOW.fetch;THE_WINDOW.fetch=function(){return function(...e){var n;return __awaiter(this,void 0,void 0,function*(){const i=e[0].toString();if(i.match(/geoguessr\.com\/api\/v3\/games$/)&&((n=e[1])===null||n===void 0?void 0:n.method)==="POST"){const s=yield t.apply(THE_WINDOW,e),r=yield s.clone().json();return r.round&&THE_WINDOW.GEFFetchEvents.dispatchEvent(new CustomEvent("received_data",{detail:r})),s}if(/geoguessr.com\/api\/v3\/(games|challenges)\//.test(i)&&i.indexOf("daily-challenge")===-1){const s=yield t.apply(THE_WINDOW,e),r=yield s.clone().json();return r.round&&THE_WINDOW.GEFFetchEvents.dispatchEvent(new CustomEvent("received_data",{detail:r})),s}return t.apply(THE_WINDOW,e)})}}(),THE_WINDOW.fetch.isGEFFetch=!0}init(){return __awaiter(this,void 0,void 0,function*(){return this.loadedPromise||(this.loadedPromise=Promise.resolve(this)),yield this.loadedPromise})}defaultState(){return{current_game_id:"",is_challenge_link:!1,current_round:0,round_in_progress:!1,game_in_progress:!0,total_score:{amount:0,unit:"points",percentage:0},total_distance:{meters:{amount:0,unit:"km"},miles:{amount:0,unit:"miles"}},total_time:0,rounds:[],settings:{time_limit:0,forbid_moving:!1,forbid_panning:!1,forbid_zooming:!1},map:{id:"",name:""}}}parseData(t){const e=t.player.guesses.length==t.round,n=t.round!==this.state.current_round||t.token!==this.state.current_game_id;e?this.stopRound(t):n&&this.startRound(t)}loadState(){let t=window.localStorage.getItem("GeoGuessrEventFramework_STATE");if(!t)return;let e=JSON.parse(t);e&&(Object.assign(this.state,this.defaultState(),e),this.saveState())}saveState(){window.localStorage.setItem("GeoGuessrEventFramework_STATE",JSON.stringify(this.state))}hex2a(t){const e=t.toString();let n="";for(let i=0;i<e.length;i+=2)n+=String.fromCharCode(parseInt(e.substring(i,i+2),16));return n}updateGameSettings(t){this.state.settings={time_limit:t.timeLimit,forbid_moving:t.forbidMoving,forbid_panning:t.forbidPanning,forbid_zooming:t.forbidZooming},this.state.map={id:t.map,name:t.mapName}}startRound(t){this.state.current_round=t.round,this.state.round_in_progress=!0,this.state.game_in_progress=!0,this.state.current_game_id=t.token,this.state.is_challenge_link=t.type=="challenge",this.state.rounds=this.state.rounds.slice(0,t.round-1),t&&this.updateGameSettings(t),this.saveState(),this.state.current_round===1&&this.events.dispatchEvent(new CustomEvent("game_start",{detail:this.state})),this.events.dispatchEvent(new CustomEvent("round_start",{detail:this.state}))}stopRound(t){var e,n,i,s,r,v,a,l,d,h,m,_,p,f,g;if(this.state.round_in_progress=!1,t){const u=t.rounds[this.state.current_round-1],o=t.player.guesses[this.state.current_round-1];if(!u||!o)return;this.state.rounds[this.state.current_round-1]={location:{lat:u.lat,lng:u.lng,heading:u.heading,pitch:u.pitch,zoom:u.zoom,panoId:u.panoId?this.hex2a(u.panoId):void 0},player_guess:{lat:o.lat,lng:o.lng},score:{amount:o?.roundScoreInPoints||0,unit:"points",percentage:o?.roundScoreInPercentage||0},distance:{meters:{amount:o?.distanceInMeters/1e3||0,unit:"km"},miles:{amount:o?.distanceInMeters/1e3/1.609344||0,unit:"miles"}},time:o?.time},this.state.total_score={amount:((e=t?.player)===null||e===void 0?void 0:e.totalScoreInPoints)||0,unit:"points",percentage:((n=t?.player)===null||n===void 0?void 0:n.totalScoreInPoints)/(5e3*t.player.guesses.length)||0},this.state.total_distance={meters:{amount:parseFloat((r=(s=(i=t?.player)===null||i===void 0?void 0:i.totalDistance)===null||s===void 0?void 0:s.meters)===null||r===void 0?void 0:r.amount)||0,unit:((l=(a=(v=t?.player)===null||v===void 0?void 0:v.totalDistance)===null||a===void 0?void 0:a.meters)===null||l===void 0?void 0:l.unit)||"km"},miles:{amount:parseFloat((m=(h=(d=t?.player)===null||d===void 0?void 0:d.totalDistance)===null||h===void 0?void 0:h.miles)===null||m===void 0?void 0:m.amount)||0,unit:((f=(p=(_=t?.player)===null||_===void 0?void 0:_.totalDistance)===null||p===void 0?void 0:p.miles)===null||f===void 0?void 0:f.unit)||"miles"}},this.state.total_time=(g=t?.player)===null||g===void 0?void 0:g.totalTime,this.updateGameSettings(t)}this.saveState(),this.events.dispatchEvent(new CustomEvent("round_end",{detail:this.state})),this.state.current_round===5&&this.events.dispatchEvent(new CustomEvent("game_end",{detail:this.state}))}}THE_WINDOW.GeoGuessrEventFramework||(THE_WINDOW.GeoGuessrEventFramework=new c,console.log("GeoGuessr Event Framework initialised: https://github.com/miraclewhips/geoguessr-event-framework"))})();
})();

GM_addStyle(`
div[class^="round-result_pointsIndicatorWrapper__"] {
	position: relative;
}

#mw-wsr {
	position: absolute;
	top: 100%;
	left: 50%;
	margin-top: 5px;
	transform: translateX(-50%);
	color: rgba(255,255,255,0.5);
	white-space: nowrap;
	font-size: 12px;
	text-transform: uppercase;
}
`);

if(!GeoGuessrEventFramework) {
	throw new Error('GeoGuessr World Score Reference requires GeoGuessr Event Framework (https://github.com/miraclewhips/geoguessr-event-framework). Please include this before you include GeoGuessr World Score Reference.');
}

function getScoreFromDistance(metres) {
	let boundSize = 18700000;
	let points = 5000;
	let perfectTolerance = Math.max(25, boundSize * 0.00001);

	
	if(metres > perfectTolerance) {
		points = Math.round(Math.pow((1 - metres/boundSize), 10) * 5000);
	}

	return points;
}

const observer = new MutationObserver(() => {
	const container = document.querySelector(`div[class^="round-result_pointsIndicatorWrapper__"]`);
	if(SCORE === undefined || !container || document.getElementById('mw-wsr')) return;

	const text = document.createElement('div');
	text.id = 'mw-wsr';
	text.textContent = `World Score Approx: ${SCORE.toLocaleString()}`;
	container.appendChild(text);
	SCORE = undefined;
});

if(document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', () => {
		observer.observe(document.querySelector('#__next'), { subtree: true, childList: true });
	});
}else{
	observer.observe(document.querySelector('#__next'), { subtree: true, childList: true });
}

let SCORE;

GeoGuessrEventFramework.init().then(GEF => {
	GEF.events.addEventListener('round_end', (state) => {
		const round = state.detail.rounds[state.detail.rounds.length - 1];
		const distance = round?.distance?.meters?.amount * (round?.distance?.meters?.unit === 'km' ? 1000 : 1);
		if(isNaN(distance)) return;
		
		SCORE = getScoreFromDistance(distance);
	});
});
