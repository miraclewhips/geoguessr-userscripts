// ==UserScript==
// @name         GeoGuessr Exact Map Location Count
// @description  Shows the exact location count on the map page, rather than 50k, 100k, etc
// @version      1.1
// @author       miraclewhips
// @match        *://*.geoguessr.com/*
// @icon         https://www.google.com/s2/favicons?domain=geoguessr.com
// @grant        none
// @copyright    2024, miraclewhips (https://github.com/miraclewhips)
// @license      MIT
// @downloadURL  https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-exact-map-location-count.user.js
// @updateURL    https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-exact-map-location-count.user.js
// ==/UserScript==



/* ############################################################################### */
/* ##### DON'T MODIFY ANYTHING BELOW HERE UNLESS YOU KNOW WHAT YOU ARE DOING ##### */
/* ############################################################################### */

const init = () => {
	const observer = new MutationObserver(async () => {
		const path = window.location.pathname;
		if(!path.includes('/maps/')) return;

		const mapId = path.split('/')[2];
		if(!mapId) return;

		const value = document.querySelector('div[class^="map-stats_mapStats__"]');
		if(!value || value.id === 'mwemlc') return;

		value.id = 'mwemlc';
		
		const apiRes = await window.fetch(`https://www.geoguessr.com/api/v3/search/map?q=${mapId}`);
		const apiData = await apiRes.json();
		if(!apiData || !apiData.length) return;

		const stats = document.querySelectorAll('div[class^="map-stats_mapStatMetricValue__"]');
		if(stats.length < 4) return;

		stats[1].textContent = apiData[0]?.numberOfGamesPlayed?.toLocaleString();
		stats[2].textContent = apiData[0]?.coordinateCount?.toLocaleString();
		stats[3].textContent = apiData[0]?.likes?.toLocaleString();
	});

	observer.observe(document.querySelector('#__next'), { subtree: true, childList: true });
}

init();
