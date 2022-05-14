// ==UserScript==
// @name         GeoGuessr More Menu Links
// @description  Adds extra links (Pro Leagues, Liked Maps, My Maps) to the navigation bar
// @version      1.1
// @author       miraclewhips
// @match        *://*.geoguessr.com/*
// @icon         https://www.google.com/s2/favicons?domain=geoguessr.com
// @grant        none
// @copyright    2022, miraclewhips (https://github.com/miraclewhips)
// @license      MIT
// @updateURL    https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-more-menu-links.user.js
// ==/UserScript==

const LINK_PRO_LEAGUES = true;
const LINK_LIKED_MAPS = true;
const LINK_MY_MAPS = true;

/* ############################################################################### */
/* ##### DON'T MODIFY ANYTHING BELOW HERE UNLESS YOU KNOW WHAT YOU ARE DOING ##### */
/* ############################################################################### */

const createButton = (node, label, url) => {
	let button = node.cloneNode();
	button.className = button.className.split(' ')[0];

	let itemClass = node.querySelector('div[class^="menu_menuItemLabel').className;
	let labelClass = node.querySelector('div[class^="label_sizeXSmall').className;

	button.innerHTML = `
		<div class="${itemClass}">
			<div class="${labelClass}">
				<a href="${url}">${label}</a>
			</div>
		</div>
	`;

	return button;
}

const init = () => {
	const observer = new MutationObserver(() => {
		const navLayout = document.querySelector('nav[class^="menu_menu__"] ol[class^="menu_menuItems__"]');

		if(navLayout && navLayout.id !== 'has-extra-buttons') {
			if(LINK_PRO_LEAGUES) {
				navLayout.append(createButton(navLayout.children[0], 'Pro Leagues', '/leagues'));
			}

			if(LINK_LIKED_MAPS) {
				navLayout.append(createButton(navLayout.children[0], 'Liked Maps', '/me/likes'));
			}

			if(LINK_MY_MAPS) {
				navLayout.append(createButton(navLayout.children[0], 'My Maps', '/me/maps'));
			}

			navLayout.id = 'has-extra-buttons';
		}
	});

	observer.observe(document.querySelector('#__next'), { subtree: true, childList: true });
}

init();