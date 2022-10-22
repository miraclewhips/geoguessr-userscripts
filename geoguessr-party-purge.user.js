// ==UserScript==
// @name         GeoGuessr Party Purge
// @description  Leave all your lobbies with the click of a button
// @version      1.0
// @author       miraclewhips
// @match        *://*.geoguessr.com/*
// @icon         https://www.google.com/s2/favicons?domain=geoguessr.com
// @grant        none
// @copyright    2022, miraclewhips (https://github.com/miraclewhips)
// @license      MIT
// @downloadURL    https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-party-purge.user.js
// @updateURL    https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-party-purge.user.js
// ==/UserScript==


/* ############################################################################### */
/* ##### DON'T MODIFY ANYTHING BELOW HERE UNLESS YOU KNOW WHAT YOU ARE DOING ##### */
/* ############################################################################### */

const addButton = () => {
	let btn = document.querySelector('div[class^="party-list_actions__"] button');
	
	if(btn && !document.getElementById('party-purge-button')) {

		let purge = btn.cloneNode(true);
		purge.id = 'party-purge-button';
		purge.style.background = '#d00';
		purge.style.marginLeft = '20px';
		purge.querySelector('span').textContent = 'Purge all lobbies';
		purge.addEventListener('click', purgeLobbies);

		btn.parentElement.append(purge);
	}
}

const purgeLobbies = async () => {
	let lobbies = await fetch('https://www.geoguessr.com/api/v4/parties').then(r=>r.json());
	if(lobbies.length === 0) return;

	let loader = document.createElement('div');
	loader.style.position = 'fixed';
	loader.style.zIndex = '99999';
	loader.style.top = '0';
	loader.style.left = '0';
	loader.style.width = '100%';
	loader.style.height = '100%';
	loader.style.backgroundColor = 'rgba(0,0,0,0.9)';
	loader.style.display = 'flex';
	loader.style.padding = '20px';
	loader.style.alignItems = 'center';
	loader.style.justifyContent = 'center';
	loader.style.textAlign = 'center';
	loader.style.color = '#fff';
	loader.style.fontSize = '20px';
	loader.textContent = 'Purging lobbies. Page will automatically refresh when done.';
	document.body.append(loader);

	let left = 0;

	for(let l of lobbies) {
		await fetch(`https://www.geoguessr.com/api/v4/parties/${l.id}/leave`, {method: 'PUT'}).then(() => {
			left++;

			if(left === lobbies.length) {
				location.reload();
			}
		});
	}
}

const init = () => {
	const observer = new MutationObserver(() => {
		if(location.pathname === '/play-with-friends') {
			addButton();
		}
	});

	observer.observe(document.querySelector('#__next'), { subtree: true, childList: true });
}

init();