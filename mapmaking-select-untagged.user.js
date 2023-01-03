// ==UserScript==
// @name         Map Making App - Select Untagged Locations
// @description  Selects all untagged locations
// @version      1.0
// @author       miraclewhips
// @match        *://*.map-making.app/*
// @icon         https://www.google.com/s2/favicons?domain=map-making.app
// @grant        none
// @copyright    2022, miraclewhips (https://github.com/miraclewhips)
// @license      MIT
// @downloadURL    https://github.com/miraclewhips/geoguessr-userscripts/raw/master/mapmaking-select-untagged.user.js
// @updateURL    https://github.com/miraclewhips/geoguessr-userscripts/raw/master/mapmaking-select-untagged.user.js
// ==/UserScript==

const init = () => {
	const observer = new MutationObserver(() => {
		if(document.location.pathname.includes('/maps/') && !document.getElementById('mw-untagged-button')) {
			let block = document.querySelector('.tool-block:nth-of-type(3)');

			let cont = document.createElement('p');
			cont.id = 'mw-untagged-button';

			let btn = document.createElement('button');
			btn.className = 'button';
			btn.type = 'button';
			btn.textContent = 'Select untagged locations';
			btn.addEventListener('click', async (e) => {
				await editor.selections.forEach(s => editor.removeSelection(s));

				await Object.entries(editor.tags).forEach(([tag, { color }]) => {
					editor.selectTag(tag, color);
				});
				
				editor.selectInverse();
			});

			cont.append(btn);
			block.append(cont);
		}
	});

	observer.observe(document.body, { subtree: true, childList: true });
}

init();