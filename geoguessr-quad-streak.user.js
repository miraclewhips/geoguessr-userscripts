// ==UserScript==
// @name         GeoGuessr Quad Streak
// @description  Draws a grid over the minimap, and tracks how many correct quads you guess in a row
// @version      1.4
// @author       miraclewhips
// @match        *://*.geoguessr.com/*
// @run-at       document-start
// @icon         https://www.google.com/s2/favicons?domain=geoguessr.com
// @grant        none
// @run-at       document-start
// @require      https://miraclewhips.dev/geoguessr-event-framework/geoguessr-streak-framework.min.js
// @copyright    2022, miraclewhips (https://github.com/miraclewhips)
// @license      MIT
// @downloadURL    https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-quad-streak.user.js
// @updateURL    https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-quad-streak.user.js
// ==/UserScript==

/* ------------------------------------------------------------------------------- */
/* ----- SETTINGS (MUST RELOAD PAGE FOR CHANGES TO TAKE EFFECT) ------------------ */
/* ------------------------------------------------------------------------------- */
const SHOW_LABELS = false; // show A1, A2, B1 etc on the grid
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

function createGrid(MWMapInstance) {
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

	let MWMapGrid = new MapGrid();
	MWMapGrid.setMap(MWMapInstance);
}

var __awaiter=this&&this.__awaiter||function(l,_,i,r){function h(a){return a instanceof i?a:new i(function(d){d(a)})}return new(i||(i=Promise))(function(a,d){function m(o){try{c(r.next(o))}catch(g){d(g)}}function f(o){try{c(r.throw(o))}catch(g){d(g)}}function c(o){o.done?a(o.value):h(o.value).then(m,f)}c((r=r.apply(l,_||[])).next())})},GeoGuessrEventFramework;(function(){let l,_,i,r,h;function a(n){return new Promise(t=>setTimeout(t,n))}function d(n,t,e){const s=n.onload;n.onload=u=>{const p=window.google;p&&(t.disconnect(),e(p)),s&&s.call(n,u)}}function m(n){for(const t of n)for(const e of t.addedNodes){const s=e;if(s&&s.src&&s.src.startsWith("https://maps.googleapis.com/"))return s}return null}function f(n){new MutationObserver((t,e)=>{const s=m(t);s&&d(s,e,n)}).observe(document.documentElement,{childList:!0,subtree:!0})}function c(){const n=l.getPosition();return n?{lat:n.lat(),lng:n.lng()}:{lat:null,lng:null}}function o(){return __awaiter(this,void 0,void 0,function*(){return yield i,l?(yield a(100),new Promise(n=>{if(r){let t=window.google.maps.event.addListener(l,"status_changed",()=>{const e=c();r.lat!=e.lat&&r.lng!=e.lng&&(window.google.maps.event.removeListener(t),r=e,n(e))})}else{const t=c();r=t,n(t)}})):{lat:null,lng:null}})}i=new Promise((n,t)=>{document.addEventListener("DOMContentLoaded",()=>{f(()=>{if(!window.google)return t();const e=[];e.push(new Promise(s=>{window.google.maps.StreetViewPanorama=class extends window.google.maps.StreetViewPanorama{constructor(...u){super(...u),l=this,s()}}})),e.push(new Promise(s=>{window.google.maps.Map=class extends window.google.maps.Map{constructor(...u){super(...u),_=this,createGrid(this),s()}}})),Promise.all(e).then(()=>n())})})});class g{constructor(){this.events=new EventTarget,this.state=this.defaultState(),this.init(),this.loadState();let t=document.querySelector("#__next");if(!t)return;new MutationObserver(this.checkState.bind(this)).observe(t,{subtree:!0,childList:!0}),i.then(()=>{_.addListener("click",s=>{!this.state.current_round||!this.state.round_in_progress||(this.state.rounds[this.state.current_round-1].player_guess={lat:s.latLng.lat(),lng:s.latLng.lng()})})})}init(){return __awaiter(this,void 0,void 0,function*(){return this.loadedPromise||(this.loadedPromise=Promise.resolve(this)),this.loadedPromise})}defaultState(){return{current_game_id:"",is_challenge_link:!1,current_round:0,round_in_progress:!1,game_in_progress:!0,total_score:0,rounds:[]}}loadState(){let t=window.localStorage.getItem("GeoGuessrEventFramework_STATE");if(!t)return;let e=JSON.parse(t);t&&(e.current_round=0,e.round_in_progress=!1,e.game_in_progress=!0,Object.assign(this.state,this.defaultState(),e),this.saveState())}saveState(){window.localStorage.setItem("GeoGuessrEventFramework_STATE",JSON.stringify(this.state))}getCurrentRound(){const t=document.querySelector('div[class^="status_inner__"]>div[data-qa="round-number"]'),e=t?.children[1].textContent;return e?parseInt(e.split(/\//gi)[0].trim()):0}getGameMode(){if(location.pathname.startsWith("/game/"))return"game";if(location.pathname.startsWith("/challenge/"))return"challenge"}getGameId(){return window.location.href.substring(window.location.href.lastIndexOf("/")+1)}startRound(){return __awaiter(this,void 0,void 0,function*(){this.getGameMode()&&(this.state.current_game_id!==this.getGameId()&&(this.state=this.defaultState()),this.state.current_round=this.getCurrentRound(),this.state.round_in_progress=!0,this.state.game_in_progress=!0,this.state.current_game_id=this.getGameId(),this.state.is_challenge_link=this.getGameMode()=="challenge",this.state.current_round&&(this.state.rounds[this.state.current_round-1]={score:0,location:{lat:null,lng:null},player_guess:{lat:null,lng:null}}),this.saveState(),this.state.current_round===1&&this.events.dispatchEvent(new CustomEvent("game_start",{detail:this.state})),this.events.dispatchEvent(new CustomEvent("round_start",{detail:this.state})),o().then(t=>{h=t}))})}stopRound(){var t;return __awaiter(this,void 0,void 0,function*(){this.state.round_in_progress=!1,yield a(1);const e=(t=document.querySelector('div[class^="round-result_pointsIndicatorWrapper__"] div[class^="shadow-text_root__"]'))===null||t===void 0?void 0:t.textContent;if(e){const s=parseInt(e.replace(/[^\d]/g,""));!isNaN(s)&&this.state.current_round&&(this.state.rounds[this.state.current_round-1].score=s)}this.state.total_score=this.state.rounds.reduce((s,u)=>s+=u.score,0),this.state.current_round&&h&&(this.state.rounds[this.state.current_round-1].location=h),this.saveState(),this.events.dispatchEvent(new CustomEvent("round_end",{detail:this.state})),this.state.current_round===5&&this.events.dispatchEvent(new CustomEvent("game_end",{detail:this.state}))})}checkState(){const t=document.querySelector(".game-layout"),e=document.querySelector('div[class^="round-result_wrapper__"]'),s=document.querySelector('div[class^="result-layout_root__"] div[class^="result-overlay_overlayContent__"]');t&&(this.state.current_round!==this.getCurrentRound()||this.state.current_game_id!==this.getGameId()?(this.state.round_in_progress&&this.stopRound(),this.startRound()):e&&this.state.round_in_progress?this.stopRound():s&&this.state.game_in_progress&&(this.state.game_in_progress=!1))}}GeoGuessrEventFramework=new g,console.log("GeoGuessr Event Framework initialised: https://github.com/miraclewhips/geoguessr-event-framework")})();

function quadMatch(state, guess, location) {
	const guessQuad = getGridLoc(guess);
	const guessLocation = getGridLoc(location);

	return {
		player_guess_name: guessQuad,
		actual_location_name: guessLocation,
		match: guessQuad == guessLocation
	}
}

const GSF = new GeoGuessrStreakFramework({
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