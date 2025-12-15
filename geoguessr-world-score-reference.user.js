// ==UserScript==
// @name         GeoGuessr World Score Reference
// @description  See approximately what a round score would have been on a world map (while playing other maps e.g. country-specific maps)
// @version      1.9
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
var __awaiter=this&&this.__awaiter||function(c,R,t,i){function o(n){return n instanceof t?n:new t(function(s){s(n)})}return new(t||(t=Promise))(function(n,s){function l(r){try{u(i.next(r))}catch(a){s(a)}}function v(r){try{u(i.throw(r))}catch(a){s(a)}}function u(r){r.done?n(r.value):o(r.value).then(l,v)}u((i=i.apply(c,R||[])).next())})};const THE_WINDOW=unsafeWindow||window;(function(){class c{constructor(){this.events=new EventTarget,this.state=this.defaultState(),this.loadState(),this.initFetchEvents(),this.overrideFetch(),this.init(),THE_WINDOW.addEventListener("load",()=>{var t,i,o;if(location.pathname.startsWith("/challenge/")){const n=(o=(i=(t=THE_WINDOW?.__NEXT_DATA__)===null||t===void 0?void 0:t.props)===null||i===void 0?void 0:i.pageProps)===null||o===void 0?void 0:o.gameSnapshot;if(!n||!n.round)return;THE_WINDOW.GEFFetchEvents.dispatchEvent(new CustomEvent("received_data",{detail:n}))}}),THE_WINDOW.GEFFetchEvents.addEventListener("received_data",t=>{this.parseData(t.detail)})}initFetchEvents(){THE_WINDOW.GEFFetchEvents===void 0&&(THE_WINDOW.GEFFetchEvents=new EventTarget)}overrideFetch(){if(THE_WINDOW.fetch.isGEFFetch)return;const t=THE_WINDOW.fetch;THE_WINDOW.fetch=function(){return function(...i){var o;return __awaiter(this,void 0,void 0,function*(){const n=i[0].toString();if(n.match(/geoguessr\.com\/api\/v3\/games$/)&&((o=i[1])===null||o===void 0?void 0:o.method)==="POST"){const s=yield t.apply(THE_WINDOW,i),l=yield s.clone().json();return l.round&&THE_WINDOW.GEFFetchEvents.dispatchEvent(new CustomEvent("received_data",{detail:l})),s}if(/geoguessr.com\/api\/v3\/(games|challenges)\//.test(n)&&n.indexOf("daily-challenge")===-1){const s=yield t.apply(THE_WINDOW,i),l=yield s.clone().json();return l.round&&THE_WINDOW.GEFFetchEvents.dispatchEvent(new CustomEvent("received_data",{detail:l})),s}return t.apply(THE_WINDOW,i)})}}(),THE_WINDOW.fetch.isGEFFetch=!0}init(){return __awaiter(this,void 0,void 0,function*(){return this.loadedPromise||(this.loadedPromise=Promise.resolve(this)),yield this.loadedPromise})}defaultState(){return{current_game_id:"",is_challenge_link:!1,current_round:0,round_in_progress:!1,game_in_progress:!0,total_score:{amount:0,unit:"points",percentage:0},total_distance:{meters:{amount:0,unit:"km"},miles:{amount:0,unit:"miles"}},total_time:0,rounds:[],map:{id:"",name:""}}}parseData(t){const i=t.player.guesses.length==t.round,o=t.round!==this.state.current_round||t.token!==this.state.current_game_id;i?this.stopRound(t):o&&this.startRound(t)}loadState(){let t=window.localStorage.getItem("GeoGuessrEventFramework_STATE");if(!t)return;let i=JSON.parse(t);i&&(Object.assign(this.state,this.defaultState(),i),this.saveState())}saveState(){window.localStorage.setItem("GeoGuessrEventFramework_STATE",JSON.stringify(this.state))}hex2a(t){const i=t.toString();let o="";for(let n=0;n<i.length;n+=2)o+=String.fromCharCode(parseInt(i.substring(n,n+2),16));return o}startRound(t){this.state.current_round=t.round,this.state.round_in_progress=!0,this.state.game_in_progress=!0,this.state.current_game_id=t.token,this.state.is_challenge_link=t.type=="challenge",this.state.rounds=this.state.rounds.slice(0,t.round-1),t&&(this.state.map={id:t.map,name:t.mapName}),this.saveState(),this.state.current_round===1&&this.events.dispatchEvent(new CustomEvent("game_start",{detail:this.state})),this.events.dispatchEvent(new CustomEvent("round_start",{detail:this.state}))}stopRound(t){var i,o,n,s,l,v,u,r,a,h,m,_,p,f,g,E,F,w,y,S,G,k,T,C,D,x,I,N,O,b;if(this.state.round_in_progress=!1,t){const d=t.rounds[this.state.current_round-1],e=t.player.guesses[this.state.current_round-1];if(!d||!e)return;this.state.rounds[this.state.current_round-1]={location:{lat:d.lat,lng:d.lng,heading:d.heading,pitch:d.pitch,zoom:d.zoom,panoId:d.panoId?this.hex2a(d.panoId):void 0},player_guess:{lat:e.lat,lng:e.lng},score:{amount:parseFloat((i=e?.roundScore)===null||i===void 0?void 0:i.amount)||0,unit:((o=e?.roundScore)===null||o===void 0?void 0:o.unit)||"points",percentage:((n=e?.roundScore)===null||n===void 0?void 0:n.percentage)||0},distance:{meters:{amount:parseFloat((l=(s=e?.distance)===null||s===void 0?void 0:s.meters)===null||l===void 0?void 0:l.amount)||0,unit:((u=(v=e?.distance)===null||v===void 0?void 0:v.meters)===null||u===void 0?void 0:u.unit)||"km"},miles:{amount:parseFloat((a=(r=e?.distance)===null||r===void 0?void 0:r.miles)===null||a===void 0?void 0:a.amount)||0,unit:((m=(h=e?.distance)===null||h===void 0?void 0:h.miles)===null||m===void 0?void 0:m.unit)||"miles"}},time:e?.time},this.state.total_score={amount:parseFloat((p=(_=t?.player)===null||_===void 0?void 0:_.totalScore)===null||p===void 0?void 0:p.amount)||0,unit:((g=(f=t?.player)===null||f===void 0?void 0:f.totalScore)===null||g===void 0?void 0:g.unit)||"points",percentage:((F=(E=t?.player)===null||E===void 0?void 0:E.totalScore)===null||F===void 0?void 0:F.percentage)||0},this.state.total_distance={meters:{amount:parseFloat((S=(y=(w=t?.player)===null||w===void 0?void 0:w.totalDistance)===null||y===void 0?void 0:y.meters)===null||S===void 0?void 0:S.amount)||0,unit:((T=(k=(G=t?.player)===null||G===void 0?void 0:G.totalDistance)===null||k===void 0?void 0:k.meters)===null||T===void 0?void 0:T.unit)||"km"},miles:{amount:parseFloat((x=(D=(C=t?.player)===null||C===void 0?void 0:C.totalDistance)===null||D===void 0?void 0:D.miles)===null||x===void 0?void 0:x.amount)||0,unit:((O=(N=(I=t?.player)===null||I===void 0?void 0:I.totalDistance)===null||N===void 0?void 0:N.miles)===null||O===void 0?void 0:O.unit)||"miles"}},this.state.total_time=(b=t?.player)===null||b===void 0?void 0:b.totalTime,this.state.map={id:t.map,name:t.mapName}}this.saveState(),this.events.dispatchEvent(new CustomEvent("round_end",{detail:this.state})),this.state.current_round===5&&this.events.dispatchEvent(new CustomEvent("game_end",{detail:this.state}))}}THE_WINDOW.GeoGuessrEventFramework||(THE_WINDOW.GeoGuessrEventFramework=new c,console.log("GeoGuessr Event Framework initialised: https://github.com/miraclewhips/geoguessr-event-framework"))})();
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
