// ==UserScript==
// @name         GeoGuessr More Menu Links
// @description  Adds extra links (Pro Leagues, Liked Maps, My Maps) to the navigation bar
// @version      1.2
// @author       miraclewhips
// @match        *://*.geoguessr.com/*
// @icon         https://www.google.com/s2/favicons?domain=geoguessr.com
// @grant        none
// @copyright    2022, miraclewhips (https://github.com/miraclewhips)
// @license      MIT
// @downloadURL    https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-more-menu-links.user.js
// @updateURL    https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-more-menu-links.user.js
// ==/UserScript==


// enable or disable specific menu items
const LINKS = {
	home: true,
	singleplayer: true,
	multiplayer: true,
	party: true,
	pro_leagues: true,
	liked_maps: true,
	my_maps: true,
}



/* ############################################################################### */
/* ##### DON'T MODIFY ANYTHING BELOW HERE UNLESS YOU KNOW WHAT YOU ARE DOING ##### */
/* ############################################################################### */

const styles = document.createElement('style');
styles.innerHTML = `
	#has-extra-buttons div[class*="slanted-wrapper_root__"] {
		display: none !important;
	}
`;
document.body.append(styles);

const createButton = (label, url) => {
	let button = document.createElement('a');
	button.href = url;
	button.textContent = label;
	button.style.color = '#fff';
	button.style.fontWeight = 'bold';
	button.style.textTransform = 'uppercase';
	return button;
}

const init = () => {
	const observer = new MutationObserver(() => {
		let navLayout = document.querySelector('div[class*="header_logo__"] + div');
		
		if(!navLayout) {
			navLayout = document.querySelector('header[class*="header_header___"] > div:nth-child(2)');
		}

		if(navLayout && navLayout.id !== 'has-extra-buttons') {
			let navList = document.createElement('div');
			navList.innerHTML = '';
			navList.style.display = 'flex';
			navList.style.gap = '30px';

			if(LINKS.home) {
				navList.append(createButton('Home', '/'));
			}

			if(LINKS.singleplayer) {
				navList.append(createButton('Singleplayer', '/singleplayer'));
			}

			if(LINKS.multiplayer) {
				navList.append(createButton('Multiplayer', '/multiplayer'));
			}

			if(LINKS.party) {
				navList.append(createButton('Party', '/play-with-friends'));
			}

			if(LINKS.pro_leagues) {
				navList.append(createButton('Pro Leagues', '/leagues'));
			}

			if(LINKS.liked_maps) {
				navList.append(createButton('Liked Maps', '/me/likes'));
			}

			if(LINKS.my_maps) {
				navList.append(createButton('My Maps', '/me/maps'));
			}

			navLayout.id = 'has-extra-buttons';
			navLayout.append(navList);
		}
	});

	observer.observe(document.querySelector('#__next'), { subtree: true, childList: true });
}

init();