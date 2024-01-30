// ==UserScript==
// @name         Map Making App - Copy Tags
// @description  Copies tags and location counts to clipboard for pasting into a spreadsheet
// @version      1.0
// @author       miraclewhips
// @match        *://*.map-making.app/*
// @icon         https://www.google.com/s2/favicons?domain=map-making.app
// @grant        none
// @copyright    2024, miraclewhips (https://github.com/miraclewhips)
// @license      MIT
// @downloadURL    https://github.com/miraclewhips/geoguessr-userscripts/raw/master/mapmaking-copy-tags.user.js
// @updateURL    https://github.com/miraclewhips/geoguessr-userscripts/raw/master/mapmaking-copy-tags.user.js
// ==/UserScript==

const init = () => {
	const observer = new MutationObserver(() => {
		if(document.location.pathname.includes('/maps/') && !document.getElementById('mwmmct')) {
			let spacer = document.querySelector('.tool-block__header > span.tag-manager__spacer');

			const label = 'Copy tags';

			let btn = document.createElement('button');
			btn.id = 'mwmmct';
			btn.className = 'button';
			btn.type = 'button';
			btn.textContent = label;
			btn.addEventListener('click', () => {
				navigator.clipboard.writeText(Object.values(editor.tags).toSorted((a,b) => a.tag.localeCompare(b.tag)).map(t => `${t.tag}\t${t.count}`).join('\n')).then(() => {
					btn.textContent = 'Copied!';
					setTimeout(() => {
						btn.textContent = label;
					}, 1000);
				});
			});

			spacer.parentNode.insertBefore(btn, spacer);
		}
	});

	observer.observe(document.body, { subtree: true, childList: true });
}

init();