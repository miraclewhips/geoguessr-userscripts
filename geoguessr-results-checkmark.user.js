// ==UserScript==
// @name         GeoGuessr Results Checkmark
// @description  Keep a track
// @version      1.0
// @author       miraclewhips
// @match        *://*.geoguessr.com/*
// @icon         https://www.google.com/s2/favicons?domain=geoguessr.com
// @grant        none
// @copyright    2022, miraclewhips (https://github.com/miraclewhips)
// @license      MIT
// ==/UserScript==





/* ############################################################################### */
/* ##### DON'T MODIFY ANYTHING BELOW HERE UNLESS YOU KNOW WHAT YOU ARE DOING ##### */
/* ############################################################################### */

let style = document.createElement('style');
style.innerHTML = `
	.CHECK-header {
		text-align: center;
	}

	.CHECK-check {
		display: flex;
		justify-content: center;
		align-items: center;
		color: #fecd19;
	}

	.CHECK-check:before {
		content: 'Hide';
	}

	.CHECK-check:hover {
		text-decoration: underline;
	}

	.results_row__2iTV4[data-hidden="true"] {
		opacity: 0.15;
		content: 'Show';
	}

	.results_row__2iTV4[data-hidden="true"] .CHECK-check:before {
		content: 'Show';
	}

	.TOGGLE a {
		color: #fecd19;
	}

	.TOGGLE a:before {
		content: 'Hide hidden rows';
	}

	.results_container__9fcR8[data-rows-hidden="true"] .results_row__2iTV4[data-hidden="true"],
	.results_container__9fcR8[data-rows-hidden="true"] .results_row__2iTV4[data-hidden="true"] + .results_rowDivider__py9ZY {
		display: none;
	}

	.results_container__9fcR8[data-rows-hidden="true"] .TOGGLE a:before {
		content: 'Show hidden rows';
	}
`;
document.body.append(style);

let CURRENT_GAME = null;
let DATA = {}

const save = () => {
	localStorage.setItem('geo-results-check', JSON.stringify(DATA));
}

const checkRow = (e) => {
	e.preventDefault();
	e.stopPropagation();

	let row = e.target.closest('.results_row__2iTV4');
	let id = row.querySelector('.results_userLink__V6cBI a').href.replace('https://www.geoguessr.com/user/', '');
	DATA[CURRENT_GAME][id] = !DATA[CURRENT_GAME][id];
	row.dataset.hidden = !!DATA[CURRENT_GAME][id];
	save();
}

const toggleHidden = (e) => {
	e.preventDefault();
	e.stopPropagation();

	const cont = document.querySelector('.results_container__9fcR8');
	DATA.hidden = !DATA.hidden;
	cont.dataset.rowsHidden = !!DATA.hidden;
	save();
}

const init = () => {
	if(localStorage.getItem('geo-results-check')) {
		DATA = JSON.parse(localStorage.getItem('geo-results-check'));
	}

	const observer = new MutationObserver(() => {
		CURRENT_GAME = window.location.pathname.split('/results/')[1];
		const cont = document.querySelector('.results_container__9fcR8');
		const resultsTable = document.querySelector('.results_table__FHKQm');
		
		if(resultsTable) {
			if(cont && !document.getElementById('geo-results-check-toggle')) {
				let toggle = document.createElement('div');
				toggle.id = 'geo-results-check-toggle';
				toggle.className = 'TOGGLE';
				let link = document.createElement('a');
				link.href = '#';
				link.addEventListener('click', toggleHidden);
				toggle.append(link);

				cont.dataset.rowsHidden = !!DATA.hidden;

				cont.insertBefore(toggle, resultsTable);
			}

			const rows = resultsTable.querySelectorAll('.results_row__2iTV4');

			if(!DATA[CURRENT_GAME]) {
				DATA[CURRENT_GAME] = {};
			}
			
			rows.forEach(row => {
				if(row.children.length !== 7) return;
				row.style.gridTemplateColumns = '18rem repeat(7,1fr)';

				if(row.classList.contains('results_headerRow__C91Ks')) {
					let header = document.createElement('div');
					header.className = 'CHECK-header';
					header.textContent = 'Hide Row';
					row.append(header);
				}else{
					let check = document.createElement('div');
					check.className = 'CHECK-check';
					check.addEventListener('click', checkRow);
					row.append(check);

					let id = row.querySelector('.results_userLink__V6cBI a').href.replace('https://www.geoguessr.com/user/', '');
					row.dataset.hidden = !!DATA[CURRENT_GAME][id];
				}
			});
		}
	});

	observer.observe(document.querySelector('#__next'), { subtree: true, childList: true });
}

init();