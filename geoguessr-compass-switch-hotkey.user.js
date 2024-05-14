// ==UserScript==
// @name         GeoGuessr Compass Switch Hotkey
// @description  Press 'TAB' to switch compasses between classic and new
// @version      1.0
// @author       miraclewhips
// @match        *://*.geoguessr.com/*
// @icon         https://www.google.com/s2/favicons?domain=geoguessr.com
// @grant        none
// @copyright    2024, miraclewhips (https://github.com/miraclewhips)
// @license      MIT
// @downloadURL  https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-compass-switch-hotkey.user.js
// @updateURL    https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-compass-switch-hotkey.user.js
// ==/UserScript==


// Keyboard shortcut to use
// https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values
const KEYBOARD_SHORTCUT = 'Tab';



/* ############################################################################### */
/* ##### DON'T MODIFY ANYTHING BELOW HERE UNLESS YOU KNOW WHAT YOU ARE DOING ##### */
/* ############################################################################### */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function toggleMenu() {
	document.querySelector(`button[data-qa="in-game-settings-button"]`)?.click();
}

document.addEventListener('keyup', async (event) => {
	if(event.key === KEYBOARD_SHORTCUT) {
		const isInGame = !!document.querySelector(`main[class^="in-game_layout__kqBbg"]`);
		if(!isInGame) return;

		event.preventDefault();
		event.stopPropagation();

		if(!document.querySelector(`div[class^="game-menu_inGameMenuOverlay__"]`)) {
			toggleMenu();
			await sleep(0);
		}

		const settingBtns = document.querySelectorAll(`div[class*="game-menu_optionsContainer__"] label[class*="game-options_editableOption__"]`);

		for(const b of settingBtns) {
			if(b.textContent.toLowerCase().includes('compass')) {
				b.click();
				break;
			}
		}
		
		toggleMenu();
	}
});
