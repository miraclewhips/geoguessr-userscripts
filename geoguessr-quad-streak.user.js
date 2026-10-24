// ==UserScript==
// @name         GeoGuessr Quad Streak
// @description  Draws a grid over the minimap, and tracks how many correct quads you guess in a row
// @version      1.24
// @author       miraclewhips
// @match        *://*.geoguessr.com/*
// @icon         https://www.google.com/s2/favicons?domain=geoguessr.com
// @grant        unsafeWindow
// @run-at       document-start
// @copyright    2022, miraclewhips (https://github.com/miraclewhips)
// @license      MIT
// @downloadURL  https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-quad-streak.user.js
// @updateURL    https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-quad-streak.user.js
// ==/UserScript==

/* ------------------------------------------------------------------------------- */
/* ----- SETTINGS (MUST RELOAD PAGE FOR CHANGES TO TAKE EFFECT) ------------------ */
/* ------------------------------------------------------------------------------- */
const GRID_COLS = 20;      // number of columns in the grid
const GRID_ROWS = 16;      // number of rows in the grid
const LAT_MAX_NORTH = 85;  // northern-most point to draw the grid
const LAT_MAX_SOUTH = -85; // southern-most point to draw the grid
const LNG_MAX_WEST = -180; // western-most point to draw the grid
const LNG_MAX_EAST = 180;  // eastern-most point to draw the grid
const CHALLENGE = true;    // Set to false to disable streaks on challenge links
const AUTOMATIC = true;    // Set to false for a manual counter (controlled by keyboard shortcuts only)

/* ------------------------------------------------------------------------------- */
/* ----- KEYBOARD SHORTCUTS (MUST RELOAD PAGE FOR CHANGES TO TAKE EFFECT) -------- */
/* ------------------------------------------------------------------------------- */
const KEYBOARD_SHORTCUTS = {
	reset: '0',     // reset streak to 0
	increment: '1', // increment streak by 1
	decrement: '2', // decrement streak by 1
	restore: '8',   // restore your streak to it's previous value
};



/* ############################################################################### */
/* ##### DON'T MODIFY ANYTHING BELOW HERE UNLESS YOU KNOW WHAT YOU ARE DOING ##### */
/* ############################################################################### */

if(window.frameElement) return;

// Event Framework
(function() {
var __awaiter=this&&this.__awaiter||function(c,E,t,e){function n(i){return i instanceof t?i:new t(function(s){s(i)})}return new(t||(t=Promise))(function(i,s){function r(l){try{a(e.next(l))}catch(d){s(d)}}function v(l){try{a(e.throw(l))}catch(d){s(d)}}function a(l){l.done?i(l.value):n(l.value).then(r,v)}a((e=e.apply(c,E||[])).next())})};const THE_WINDOW=unsafeWindow||window;(function(){class c{constructor(){this.events=new EventTarget,this.state=this.defaultState(),this.loadState(),this.initFetchEvents(),this.overrideFetch(),this.init(),THE_WINDOW.addEventListener("load",()=>{var t,e,n;if(location.pathname.startsWith("/challenge/")){const i=(n=(e=(t=THE_WINDOW?.__NEXT_DATA__)===null||t===void 0?void 0:t.props)===null||e===void 0?void 0:e.pageProps)===null||n===void 0?void 0:n.gameSnapshot;if(!i||!i.round)return;THE_WINDOW.GEFFetchEvents.dispatchEvent(new CustomEvent("received_data",{detail:i}))}}),THE_WINDOW.GEFFetchEvents.addEventListener("received_data",t=>{this.parseData(t.detail)})}initFetchEvents(){THE_WINDOW.GEFFetchEvents===void 0&&(THE_WINDOW.GEFFetchEvents=new EventTarget)}overrideFetch(){if(THE_WINDOW.fetch.isGEFFetch)return;const t=THE_WINDOW.fetch;THE_WINDOW.fetch=function(){return function(...e){var n;return __awaiter(this,void 0,void 0,function*(){const i=e[0].toString();if(i.match(/geoguessr\.com\/api\/v3\/games$/)&&((n=e[1])===null||n===void 0?void 0:n.method)==="POST"){const s=yield t.apply(THE_WINDOW,e),r=yield s.clone().json();return r.round&&THE_WINDOW.GEFFetchEvents.dispatchEvent(new CustomEvent("received_data",{detail:r})),s}if(/geoguessr.com\/api\/v3\/(games|challenges)\//.test(i)&&i.indexOf("daily-challenge")===-1){const s=yield t.apply(THE_WINDOW,e),r=yield s.clone().json();return r.round&&THE_WINDOW.GEFFetchEvents.dispatchEvent(new CustomEvent("received_data",{detail:r})),s}return t.apply(THE_WINDOW,e)})}}(),THE_WINDOW.fetch.isGEFFetch=!0}init(){return __awaiter(this,void 0,void 0,function*(){return this.loadedPromise||(this.loadedPromise=Promise.resolve(this)),yield this.loadedPromise})}defaultState(){return{current_game_id:"",is_challenge_link:!1,current_round:0,round_in_progress:!1,game_in_progress:!0,total_score:{amount:0,unit:"points",percentage:0},total_distance:{meters:{amount:0,unit:"km"},miles:{amount:0,unit:"miles"}},total_time:0,rounds:[],settings:{time_limit:0,forbid_moving:!1,forbid_panning:!1,forbid_zooming:!1},map:{id:"",name:""}}}parseData(t){const e=t.player.guesses.length==t.round,n=t.round!==this.state.current_round||t.token!==this.state.current_game_id;e?this.stopRound(t):n&&this.startRound(t)}loadState(){let t=window.localStorage.getItem("GeoGuessrEventFramework_STATE");if(!t)return;let e=JSON.parse(t);e&&(Object.assign(this.state,this.defaultState(),e),this.saveState())}saveState(){window.localStorage.setItem("GeoGuessrEventFramework_STATE",JSON.stringify(this.state))}hex2a(t){const e=t.toString();let n="";for(let i=0;i<e.length;i+=2)n+=String.fromCharCode(parseInt(e.substring(i,i+2),16));return n}updateGameSettings(t){this.state.settings={time_limit:t.timeLimit,forbid_moving:t.forbidMoving,forbid_panning:t.forbidPanning,forbid_zooming:t.forbidZooming},this.state.map={id:t.map,name:t.mapName}}startRound(t){this.state.current_round=t.round,this.state.round_in_progress=!0,this.state.game_in_progress=!0,this.state.current_game_id=t.token,this.state.is_challenge_link=t.type=="challenge",this.state.rounds=this.state.rounds.slice(0,t.round-1),t&&this.updateGameSettings(t),this.saveState(),this.state.current_round===1&&this.events.dispatchEvent(new CustomEvent("game_start",{detail:this.state})),this.events.dispatchEvent(new CustomEvent("round_start",{detail:this.state}))}stopRound(t){var e,n,i,s,r,v,a,l,d,h,m,_,p,f,g;if(this.state.round_in_progress=!1,t){const u=t.rounds[this.state.current_round-1],o=t.player.guesses[this.state.current_round-1];if(!u||!o)return;this.state.rounds[this.state.current_round-1]={location:{lat:u.lat,lng:u.lng,heading:u.heading,pitch:u.pitch,zoom:u.zoom,panoId:u.panoId?this.hex2a(u.panoId):void 0},player_guess:{lat:o.lat,lng:o.lng},score:{amount:o?.roundScoreInPoints||0,unit:"points",percentage:o?.roundScoreInPercentage||0},distance:{meters:{amount:o?.distanceInMeters/1e3||0,unit:"km"},miles:{amount:o?.distanceInMeters/1e3/1.609344||0,unit:"miles"}},time:o?.time},this.state.total_score={amount:((e=t?.player)===null||e===void 0?void 0:e.totalScoreInPoints)||0,unit:"points",percentage:((n=t?.player)===null||n===void 0?void 0:n.totalScoreInPoints)/(5e3*t.player.guesses.length)||0},this.state.total_distance={meters:{amount:parseFloat((r=(s=(i=t?.player)===null||i===void 0?void 0:i.totalDistance)===null||s===void 0?void 0:s.meters)===null||r===void 0?void 0:r.amount)||0,unit:((l=(a=(v=t?.player)===null||v===void 0?void 0:v.totalDistance)===null||a===void 0?void 0:a.meters)===null||l===void 0?void 0:l.unit)||"km"},miles:{amount:parseFloat((m=(h=(d=t?.player)===null||d===void 0?void 0:d.totalDistance)===null||h===void 0?void 0:h.miles)===null||m===void 0?void 0:m.amount)||0,unit:((f=(p=(_=t?.player)===null||_===void 0?void 0:_.totalDistance)===null||p===void 0?void 0:p.miles)===null||f===void 0?void 0:f.unit)||"miles"}},this.state.total_time=(g=t?.player)===null||g===void 0?void 0:g.totalTime,this.updateGameSettings(t)}this.saveState(),this.events.dispatchEvent(new CustomEvent("round_end",{detail:this.state})),this.state.current_round===5&&this.events.dispatchEvent(new CustomEvent("game_end",{detail:this.state}))}}THE_WINDOW.GeoGuessrEventFramework||(THE_WINDOW.GeoGuessrEventFramework=new c,console.log("GeoGuessr Event Framework initialised: https://github.com/miraclewhips/geoguessr-event-framework"))})();
})();

// Streak Framework
(function() {
var __awaiter=this&&this.__awaiter||function(d,e,t,s){function n(a){return a instanceof t?a:new t(function(r){r(a)})}return new(t||(t=Promise))(function(a,r){function i(u){try{o(s.next(u))}catch(c){r(c)}}function l(u){try{o(s.throw(u))}catch(c){r(c)}}function o(u){u.done?a(u.value):n(u.value).then(i,l)}o((s=s.apply(d,e||[])).next())})};const CC_DICT={AX:"FI",AS:"US",AI:"GB",AW:"NL",BM:"GB",BQ:"NL",BV:"NO",IO:"GB",KY:"UK",CX:"AU",CC:"AU",CK:"NZ",CW:"NL",FK:"GB",FO:"DK",GF:"FR",PF:"FR",TF:"FR",GI:"UK",GL:"DK",GP:"FR",GU:"US",GG:"GB",HM:"AU",HK:"CN",IM:"GB",JE:"GB",MO:"CN",MQ:"FR",YT:"FR",MS:"GB",AN:"NL",NC:"FR",NU:"NZ",NF:"AU",MP:"US",PS:"IL",PN:"GB",PR:"US",RE:"FR",BL:"FR",SH:"GB",MF:"FR",PM:"FR",SX:"NL",GS:"GB",SJ:"NO",TK:"NZ",TC:"GB",UM:"US",VG:"GB",VI:"US",WF:"FR",EH:"MA"};class GeoGuessrStreakFramework{constructor(e){if(this.options=e,this.state=this.defaultState(),this.current_round=0,this.should_update_round_panel=!1,this.should_update_summary_panel=!1,typeof this.options.storage_identifier=="string"&&(this.options.storage_identifier=this.options.storage_identifier.replace(/[^\w\d-_]/g,""),this.options.storage_identifier.length==0))throw new Error("'storage_identifier' must not be blank and can only contain letters, digits, underscores, and hyphens.");const t={storage_identifier:"geoguessr-streak-framework",name:"Country Streak",terms:{single:"country",plural:"countries"},enabled_on_challenges:!0,automatic:!0,language:"en",streak_type:"round",only_match_country_code:!0,query_openstreetmap:!0,address_matches:["country"],keyboard_shortcuts:{increment:"1",decrement:"2",reset:"0",restore:"8"}};this.options=Object.assign(t,this.options),this.loadState(),this.setupKeyboardShortcuts(),window.addEventListener("load",this.updateStreakPanels.bind(this));const s=unsafeWindow||window;if(!s.GeoGuessrEventFramework)throw new Error("GeoGuessr Streak Framework requires GeoGuessr Event Framework (https://github.com/miraclewhips/geoguessr-event-framework). Please include this before you include GeoGuessr Streak Framework.");this.events=s.GeoGuessrEventFramework,this.events.init().then(n=>{console.log("GeoGuessr Streak Framework initialised.");const a=()=>{let r=document.querySelector("#__next");if(!r)return;new MutationObserver(this.checkState.bind(this)).observe(r,{subtree:!0,childList:!0}),n.events.addEventListener("round_start",o=>{this.current_round=o.detail.current_round,this.should_update_round_panel=!0,this.updateStreakPanels()});const l=this.options.streak_type==="game"?"game_end":"round_end";n.events.addEventListener(l,o=>{this.should_update_summary_panel=!0,this.stopRound(o.detail)})};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",a):a()}),this.addStyles()}addStyles(){if(document.getElementById("geoguessr-streak-framework-styles"))return;const e=document.createElement("style");e.id="geoguessr-streak-framework-styles",e.innerText=".streak-counter-container { position: absolute; top: 100%; right: 1rem; max-width: calc(100% - 2rem); padding: 0 0.5rem 0.25rem 0.5rem; background-color: var(--ds-color-purple-90); display: flex; justify-content: flex-end; font-size: 14px; border-bottom-left-radius: 0.5rem; border-bottom-right-radius: 0.5rem; text-align: center; } .streak-counter-section + .streak-counter-section { padding-left: 0.5rem; margin-left: 0.5rem; border-left: 1px solid var(--ds-color-purple-50); } .streak-counter-section-label { font-size: 10px; color: var(--ds-color-purple-20); }",document.body.appendChild(e)}defaultState(){return{checking_api:!1,streak:0,previous_streak:0,streak_backup:0,guess_name:null,location_name:null,last_guess_identifier:null}}loadState(){this.state=this.defaultState();let e=JSON.parse(window.localStorage.getItem(this.options.storage_identifier));e&&(e.checking_api=!1,Object.assign(this.state,e),this.saveState())}saveState(){window.localStorage.setItem(this.options.storage_identifier,JSON.stringify(this.state))}getRoundPanel(){return document.getElementById(`streak-counter-panel-${this.options.storage_identifier}`)}getSummaryPanel(){return document.getElementById(`streak-score-panel-summary-${this.options.storage_identifier}`)}updateRoundPanel(){if(!this.getRoundPanel()){let s=document.querySelector('div[class^="rounds-status_panel__"]');if(s){let n=s.querySelector(".streak-counter-container");n||(n=document.createElement("div"),n.className="streak-counter-container",s.appendChild(n));let a=document.createElement("div");a.id=`streak-counter-panel-${this.options.storage_identifier}`,a.className="streak-counter-section",a.innerHTML=`<div class="streak-counter-section-label">${this.options.name.toUpperCase()}</div><div id="streak-counter-value-${this.options.storage_identifier}" class="streak-counter-section-value"></div></div>`,n.appendChild(a)}}let t=document.getElementById(`streak-counter-value-${this.options.storage_identifier}`);t&&(t.innerText=this.state.streak.toString())}createStreakText(){if(this.state.checking_api)return"Loading...";if(this.state.streak>0)return this.state.guess_name||this.state.location_name?`It was <span style="color:#6cb928">${this.state.guess_name||this.state.location_name}!</span> ${this.options.name}: <span style="color:#fecd19">${this.state.streak}</span>`:`${this.options.name}: <span style="color:#fecd19">${this.state.streak}</span>`;{let e=`${this.options.terms.plural} in a row.`;switch(this.state.previous_streak){case 1:e=`${this.options.terms.single}.`}let t="";return this.state.guess_name&&this.state.location_name&&(t=`You guessed <span style="color:#f95252">${this.state.guess_name}</span>, unfortunately it was <span style="color:#6cb928">${this.state.location_name}</span>.`),`${t} Your streak ended after <span style="color:#fecd19">${this.state.previous_streak}</span> ${e}`}}createStreakElement(){let e=document.createElement("div");return e.style.fontSize="18px",e.style.fontWeight="500",e.style.color="#fff",e.style.padding="10px",e.style.paddingBottom="0",e.style.background="var(--ds-color-purple-100)",e}updateSummaryPanel(){if(this.options.streak_type==="game"&&this.current_round!==5)return;const e=document.querySelector('div[class^="result-layout_root"] div[class^="round-result_wrapper__"]'),t=document.querySelector('div[class^="result-layout_root"] div[class^="result-layout_bottomNew__"]');if(t&&(t.style.flex="0 0 auto",t.style.maxHeight="none"),!e&&!t)return;let s=this.getSummaryPanel();e&&!s&&(s=this.createStreakElement(),s.id=`streak-score-panel-summary-${this.options.storage_identifier}`,e.parentNode.insertBefore(s,e)),s&&(s.innerHTML=this.createStreakText())}updateStreakPanels(){this.updateRoundPanel(),this.updateSummaryPanel()}queryOSM(e){return __awaiter(this,void 0,void 0,function*(){let t=`https://nominatim.openstreetmap.org/reverse.php?lat=${e.lat}&lon=${e.lng}&zoom=18&format=jsonv2&accept-language=${this.options.language}`;return yield fetch(t).then(s=>s.json())})}isAutoStreakDisabled(e){return!this.options.automatic||e.is_challenge_link&&!this.options.enabled_on_challenges}matchCountryCode(e){var t;let s=(t=e?.country_code)===null||t===void 0?void 0:t.toUpperCase();return s?CC_DICT[s]||s:null}matchAddress(e){if(e&&this.options.address_matches&&this.options.address_matches.length>0){for(let t of this.options.address_matches)if(e[t])return e[t]}return"Undefined"}stopRound(e){return __awaiter(this,void 0,void 0,function*(){if(this.isAutoStreakDisabled(e))return;this.updateStreakPanels();const t=e.rounds[e.current_round-1];if(!t)return;const s=`${e.current_game_id}-${e.current_round}`;if(s==this.state.last_guess_identifier){this.updateStreakPanels();return}if(this.state.last_guess_identifier=s,this.saveState(),t.location.lat==null||t.location.lng==null||t.player_guess.lat==null||t.player_guess.lng==null){this.state.guess_name=null,this.state.location_name=null,this.setStreakValue(0);return}let n=!1;if(this.state.checking_api=!0,this.options.query_openstreetmap){this.updateStreakPanels();const a=yield this.queryOSM(t.player_guess),r=yield this.queryOSM(t.location);if(this.options.custom_match_function){const i=yield this.options.custom_match_function(this.events.state,a,r);this.state.checking_api=!1,this.state.guess_name=i.player_guess_name,this.state.location_name=i.actual_location_name,n=i.match}else{this.state.checking_api=!1;const i=this.matchCountryCode(a?.address),l=this.matchCountryCode(r?.address);this.state.guess_name=this.matchAddress(a?.address),this.state.location_name=this.matchAddress(r?.address);const o=i&&l&&i===l,u=this.state.guess_name===this.state.location_name;n=o&&(u||this.options.only_match_country_code)}}else{const a=yield this.options.custom_match_function(this.events.state,t.player_guess,t.location);this.state.checking_api=!1,this.state.guess_name=a.player_guess_name,this.state.location_name=a.actual_location_name,n=a.match}this.updateStreakPanels(),n?this.incrementStreakValue(1):this.setStreakValue(0)})}checkStreakIsLatest(){let e=JSON.parse(window.localStorage.getItem(this.options.storage_identifier));e&&(this.state.streak=e.streak)}incrementStreakValue(e){this.checkStreakIsLatest(),this.setStreakValue(this.state.streak+e)}setStreakValue(e){this.checkStreakIsLatest(),this.state.previous_streak=this.state.streak,this.state.streak=e,this.state.streak!==0&&(this.state.streak_backup=this.state.streak),this.saveState(),this.updateStreakPanels()}setupKeyboardShortcuts(){let e=this.options.keyboard_shortcuts;document.addEventListener("keypress",t=>{if(!(!this.getRoundPanel()&&!this.getSummaryPanel()))switch(t.key){case e.reset:this.setStreakValue(0);break;case e.increment:this.incrementStreakValue(1);break;case e.decrement:this.incrementStreakValue(-1);break;case e.restore:this.setStreakValue(this.state.streak_backup+1);break}})}checkState(){const e=document.querySelector('div[class^="in-game_root__"]');if(!e)return;const t=document.querySelector('div[class^="game_status__"]'),s=document.querySelector('div[class^="round-result_wrapper__"]'),n=document.querySelector('div[class^="result-layout_root__"] div[class^="result-overlay_overlayContent__"]'),a=this.should_update_round_panel||!this.getRoundPanel(),r=this.should_update_summary_panel||!this.getSummaryPanel();e&&(t&&a?(this.should_update_round_panel=!1,this.updateRoundPanel()):(s||n)&&r&&(this.should_update_summary_panel=!1,this.updateSummaryPanel()))}}(unsafeWindow||window).GeoGuessrStreakFramework=GeoGuessrStreakFramework;
})();

const CUSTOM_WINDOW = unsafeWindow ?? window;

function toLetters(num) {
	var mod = num % 26,
		pow = num / 26 | 0,
		out = mod ? String.fromCharCode(64 + mod) : (--pow, 'Z');
	return pow ? toLetters(pow) + out : out;
}

function gridNumber(x, y) {
	return `${toLetters(x+1)}${y+1}`;
}

function getGridLoc(pos) {
	let x = Math.floor(((pos.lng - LNG_MAX_WEST) / (LNG_MAX_EAST - LNG_MAX_WEST)) * GRID_COLS);
	let y = Math.floor(((pos.lat - LAT_MAX_NORTH) / (LAT_MAX_SOUTH - LAT_MAX_NORTH)) * GRID_ROWS);
	return gridNumber(x, y);
}

function createGrid(mapInstance) {
    const lineOptions = {
        clickable: false,
        map: mapInstance,
        strokeColor: '#f00',
        strokeOpacity: 0.5,
        strokeWeight: 1,
    };

    for(let y = 0; y < GRID_ROWS; y++) {
        const lat = LAT_MAX_NORTH + ((LAT_MAX_SOUTH - LAT_MAX_NORTH) / GRID_ROWS * y);
        const line = new google.maps.Polyline({
            ...lineOptions,
            path: [ new google.maps.LatLng(lat, LNG_MAX_EAST),
                   new google.maps.LatLng(lat, 0),
                   new google.maps.LatLng(lat, LNG_MAX_WEST)]
        });
    }

    for(let x = 0; x < GRID_COLS; x++) {
        const lng = LNG_MAX_WEST + ((LNG_MAX_EAST - LNG_MAX_WEST) / GRID_COLS * x);
        const line = new google.maps.Polyline({
            ...lineOptions,
            path: [ new google.maps.LatLng(LAT_MAX_NORTH, lng),
                   new google.maps.LatLng(LAT_MAX_SOUTH, lng)]
        });
    }
}

function overrideOnLoad(googleScript, observer, overrider) {
	const oldOnload = googleScript.onload;
	googleScript.onload = (event) => {
		const google = CUSTOM_WINDOW['google'];
		if (google) {
			observer.disconnect();
			overrider(google);
		}
		if (oldOnload) {
			oldOnload.call(googleScript, event);
		}
	}
}

function grabGoogleScript(mutations) {
	for (const mutation of mutations) {
		for (const newNode of mutation.addedNodes) {
			const asScript = newNode;
			if (asScript && asScript.src && asScript.src.startsWith('https://maps.googleapis.com/')) {
				return asScript;
			}
		}
	}
	return null;
}

function injecter(overrider) {
	new MutationObserver((mutations, observer) => {
		const googleScript = grabGoogleScript(mutations);
		if (googleScript) {
			overrideOnLoad(googleScript, observer, overrider);
		}
	}).observe(document.documentElement, { childList: true, subtree: true });
}

document.addEventListener('DOMContentLoaded', () => {
	injecter(() => {
		if(!CUSTOM_WINDOW['google']) return reject();

		CUSTOM_WINDOW['google'].maps.Map = class extends CUSTOM_WINDOW['google'].maps.Map {
			constructor(...args) {
				super(...args);
				createGrid(this);
			}
		}
	});
});

function quadMatch(state, guess, location) {
	const guessQuad = getGridLoc(guess);
	const guessLocation = getGridLoc(location);

	return {
		player_guess_name: guessQuad,
		actual_location_name: guessLocation,
		match: guessQuad == guessLocation
	}
}

const GSF = new (unsafeWindow || window)['GeoGuessrStreakFramework']({
	storage_identifier: 'MW_GeoGuessrQuadStreak',
	name: 'Quad Streak',
	terms: {
		single: 'quad',
		plural: 'quads'
	},
	enabled_on_challenges: CHALLENGE,
	automatic: AUTOMATIC,
	query_openstreetmap: false,
	custom_match_function: quadMatch,
	keyboard_shortcuts: KEYBOARD_SHORTCUTS,
});
