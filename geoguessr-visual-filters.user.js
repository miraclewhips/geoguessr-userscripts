// ==UserScript==
// @name         GeoGuessr Visual Filters
// @description  Applies visual filters to the streetview map
// @version      1.9
// @author       miraclewhips
// @match        *://*.geoguessr.com/*
// @icon         https://www.google.com/s2/favicons?domain=geoguessr.com
// @grant        none
// @copyright    2024, miraclewhips (https://github.com/miraclewhips)
// @license      MIT
// @downloadURL	 https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-visual-filters.user.js
// @updateURL    https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-visual-filters.user.js
// ==/UserScript==



/* ############################################################################### */
/* ##### DON'T MODIFY ANYTHING BELOW HERE UNLESS YOU KNOW WHAT YOU ARE DOING ##### */
/* ############################################################################### */

let VALS = JSON.parse(window.localStorage.getItem('geoVisualFilters')) || {};

let FILTER_LIST = {
	hue: { name: 'Hue', default: 0, min: 0, max: 360, unit: 'deg' },
	saturate: { name: 'Saturation', default: 100, min: 0, max: 1000, unit: '%' },
	brightness: { name: 'Brightness', default: 100, min: 10, max: 300, unit: '%' },
	contrast: { name: 'Contrast', default: 100, min: 10, max: 1000, unit: '%' },
	invert: { name: 'Invert', default: false, type: 'bool' },
	sepia: { name: 'Sepia', default: 0, min: 0, max: 100, unit: '%' },
	blur: { name: 'Blur', default: 0, min: 0, max: 100, unit: 'px' },
	erode: { name: 'Erode', default: 0, min: 0, max: 50 },
	dilate: { name: 'Dilate', default: 0, min: 0, max: 50 },
	mosaic: { name: 'Mosaic', default: 0, min: 0, max: 100 },
	flip_h: { name: 'Flip Horizontal', default: false, type: 'bool' },
	flip_v: { name: 'Flip Vertical', default: false, type: 'bool' },
}

const exists = (n) => (VALS && typeof VALS[n] !== 'undefined' && VALS[n] !== FILTER_LIST[n].default);
const unit = (n) => FILTER_LIST[n].unit || '';

const clamp = (n) => {
	let val = VALS[n];

	if(FILTER_LIST[n].min) {
		val = Math.max(FILTER_LIST[n].min, val);
	}

	if(FILTER_LIST[n].max) {
		val = Math.min(FILTER_LIST[n].max, val);
	}

	return val;
}

const val = (n) => {
	return exists(n) ? clamp(n) : FILTER_LIST[n].default;
}

const filters = () => {
	let outputFilter = [];
	let outputTransform = [];

	if(exists('hue')) {
		outputFilter.push(`hue-rotate(${val('hue')}deg)`);
	}

	if(exists('saturate')) {
		outputFilter.push(`saturate(${val('saturate')}%)`);
	}

	if(exists('brightness')) {
		outputFilter.push(`brightness(${val('brightness')}%)`);
	}

	if(exists('contrast')) {
		outputFilter.push(`contrast(${val('contrast')}%)`);
	}

	if(exists('invert')) {
		outputFilter.push(`invert(${val('invert') ? 100 : 0}%)`);
	}

	if(exists('sepia')) {
		outputFilter.push(`sepia(${val('sepia')}%)`);
	}

	if(exists('blur')) {
		outputFilter.push(`blur(${val('blur')}px)`);
	}

	if(exists('erode')) {
		outputFilter.push(`url(#vf_svg_erode)`);
	}

	if(exists('dilate')) {
		outputFilter.push(`url(#vf_svg_dilate)`);
	}
	
	if(exists('mosaic')) {
		outputFilter.push(`url(#vf_svg_mosaic)`);
	}

	if(exists('flip_h')) {
		outputTransform.push(`scaleX(${val('flip_h') ? '-1' : '1'})`);
	}

	if(exists('flip_v')) {
		outputTransform.push(`scaleY(${val('flip_v') ? '-1' : '1'})`);
	}

	document.getElementById('GEO_VF_SVG_FILTERS').innerHTML = `
		<svg x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
			<defs>
				<filter id="vf_svg_erode">
					<feMorphology operator="erode" radius="${val('erode')}" />
				</filter>
				
				<filter id="vf_svg_dilate">
					<feMorphology operator="dilate" radius="${val('dilate')}" />
				</filter>
				
				<filter id="vf_svg_mosaic" x="0%" y="0%" width="100%" height="100%">
					<feGaussianBlur stdDeviation="2" in="SourceGraphic" result="smoothed" />
					<feImage width="${val('mosaic')}" height="${val('mosaic')}" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAIAAAACDbGyAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAWSURBVAgdY1ywgOEDAwKxgJhIgFQ+AP/vCNK2s+8LAAAAAElFTkSuQmCC" result="displacement-map" />
					<feTile in="displacement-map" result="pixelate-map" />
					<feDisplacementMap in="smoothed" in2="pixelate-map" xChannelSelector="R" yChannelSelector="G" scale="${val('mosaic') * (50 / 15)}" result="pre-final"/>
					<feComposite operator="in" in2="SourceGraphic"/>
				</filter>
			</defs>
		</svg>
	`;

	return `div[class^="game_canvas__"] .widget-scene-canvas,
		div[class^="game-panorama_panoramaCanvas__"] .widget-scene-canvas {
		filter: ${outputFilter.length > 0 ? outputFilter.join(' ') : 'none'};
		transform: ${outputTransform.length > 0 ? outputTransform.join(' ') : 'none'};
	}`;
}

const addConfigButton = () => {
	let panel = document.getElementById('visual-filters-button');
	if(panel) return;

	let gameScore = document.querySelector('div[class^="game_status__"] div[class^="status_section__"][data-qa="score"]') || document.querySelector('div[class^="map-status_status__"] div[class^="map-status_section__"][data-qa="score"]');
	if(!gameScore) return;

	let newPanel = document.createElement('div');
	newPanel.id = 'visual-filters-button';
	newPanel.style.display = 'flex';

	let classLabel = gameScore.querySelector('div[class^="status_label"]')?.className || gameScore.querySelector('div[class^="map-status_label"]')?.className;
	let valueLabel = gameScore.querySelector('div[class^="status_value"]')?.className || gameScore.querySelector('div[class^="map-status_value"]')?.className;
	if(!classLabel || !valueLabel) return;

	newPanel.innerHTML = `
		<div class="${gameScore.getAttribute('class')}">
			<div class="${classLabel}">FILTERS</div>
			<div class="${valueLabel}" style="display: flex; align-items: center; height: 27px; cursor: pointer;" id="toggle-vf-menu">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="20"><!--! Font Awesome Pro 6.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M512 256c0 .9 0 1.8 0 2.7c-.4 36.5-33.6 61.3-70.1 61.3H344c-26.5 0-48 21.5-48 48c0 3.4 .4 6.7 1 9.9c2.1 10.2 6.5 20 10.8 29.9c6.1 13.8 12.1 27.5 12.1 42c0 31.8-21.6 60.7-53.4 62c-3.5 .1-7 .2-10.6 .2C114.6 512 0 397.4 0 256S114.6 0 256 0S512 114.6 512 256zM128 288c0-17.7-14.3-32-32-32s-32 14.3-32 32s14.3 32 32 32s32-14.3 32-32zm0-96c17.7 0 32-14.3 32-32s-14.3-32-32-32s-32 14.3-32 32s14.3 32 32 32zM288 96c0-17.7-14.3-32-32-32s-32 14.3-32 32s14.3 32 32 32s32-14.3 32-32zm96 96c17.7 0 32-14.3 32-32s-14.3-32-32-32s-32 14.3-32 32s14.3 32 32 32z" fill="#fff" /></svg>
			</div>
		</div>
	`;

	gameScore.parentNode.append(newPanel);

	document.getElementById('toggle-vf-menu').addEventListener('click', () => {
		document.getElementById('GEO_VF_CONFIG').classList.toggle('is-hidden');
	});
}

const createInput = (n) => {
	let f = FILTER_LIST[n];
	let el = document.createElement('div');
	el.className = 'vf_field';
	el.id = `vf_field_${n}`;
	el.innerHTML = `<label for="vf_input_${n}">${f.name}</label>`;

	let c = document.createElement('div');
	c.className = 'vf_input_container';

	let r = document.createElement('input');
	r.id = `vf_input_${n}`;
	r.name = `vf_input_${n}`;
	r.dataset.name = n;

	if(f.min) {
		r.min = f.min;
	}

	if(f.max) {
		r.max = f.max;
	}
	
	r.addEventListener('input', valueChange);

	switch(f.type) {
		case 'bool':
			r.type = 'checkbox';
			r.checked = val(n);
			break;

		default:
			r.type = 'range';
			r.value = val(n);
			break;
	}

	c.append(r);

	let v = document.createElement('div');
	v.className = 'vf_value';
	v.innerHTML = `<span>${val(n)}</span>${unit(n)}`;

	el.append(c);
	el.append(v);

	return el;
}

const valueChange = (e) => {
	let n = e.target.dataset.name;

	switch(FILTER_LIST[n]['type']) {
		case 'bool':
			VALS[n] = e.target.checked;
			break;

		default:
			VALS[n] = parseInt(e.target.value);
			break;
	}

	document.querySelector(`#vf_field_${n} .vf_value span`).textContent = VALS[n];
	
	window.localStorage.setItem('geoVisualFilters', JSON.stringify(VALS));
	document.getElementById('GEO_VISUAL_FILTERS').innerHTML = filters();
}

const resetFilters = () => {
	VALS = {};
	window.localStorage.setItem('geoVisualFilters', JSON.stringify(VALS));
	document.getElementById('GEO_VISUAL_FILTERS').innerHTML = filters();

	for(let n in FILTER_LIST) {
		switch(FILTER_LIST[n]['type']) {
			case 'bool':
				document.getElementById(`vf_input_${n}`).checked = FILTER_LIST[n].default;
				break;
	
			default:
				document.getElementById(`vf_input_${n}`).value = FILTER_LIST[n].default;
				break;
		}
		
		document.querySelector(`#vf_field_${n} .vf_value span`).textContent = FILTER_LIST[n].default;
	}
}

const init = () => {
	let configStyle = document.createElement('style');
	configStyle.innerHTML = `
		#GEO_VF_CONFIG {
			position: fixed;
			top: 110px;
			right: 10px;
			background-color: #000;
			padding: 10px;
			z-index: 100;
			color: #ccc;
			font-size: 16px;
			width: 400px;
		}

		#GEO_VF_CONFIG.is-hidden {
			display: none !important;
		}

		.vf_title {
			font-weight: bold;
			margin-bottom: 10px;
			color: #fff;
			display: flex;
			justify-content: space-between;
		}

		.vf_title a {
			color: #fff;
			font-size: 14px;
			font-weight: normal;
			cursor: pointer;
			color: #fff;
		}

		.vf_field {
			display: flex;
			align-items: center;
			margin-top: 5px;
		}

		.vf_field label {
			flex: 0 0 120px;
		}

		.vf_input_container {
			flex: 1 1 auto;
		}

		.vf_value {
			flex: 0 0 70px;
			text-align: right;
		}

		.vf_field input {
			padding: 0;
		}

		.vf_field input[type=range] {
			width: 100%;
		}

		#GEO_VF_SVG_FILTERS {
			position: absolute;
			z-index: -1;
			visibility: hidden;
			width: 0;
			height: 0;
			overflow: hidden;
		}
	`;
	document.body.append(configStyle);

	let configWindow = document.createElement('div');
	configWindow.id = 'GEO_VF_CONFIG';
	configWindow.className = 'is-hidden';
	configWindow.innerHTML = `
		<div class="vf_title">
			<span>VISUAL FILTERS</span>
			<a id="reset-filters">RESET</a>
		</div>
	`;

	for(let n in FILTER_LIST) {
		configWindow.append(createInput(n));
	}

	document.body.append(configWindow);
	document.getElementById('reset-filters').addEventListener('click', resetFilters);

	let svgFilters = document.createElement('div');
	svgFilters.id = 'GEO_VF_SVG_FILTERS';
	document.body.append(svgFilters);

	let filterStyle = document.createElement('style');
	filterStyle.id = 'GEO_VISUAL_FILTERS';
	filterStyle.innerHTML = filters();
	document.body.append(filterStyle);

	const observer = new MutationObserver(() => {
		addConfigButton();
	});

	observer.observe(document.querySelector('#__next'), { subtree: true, childList: true });

	document.addEventListener('keypress', (e) => {
		if(e.code !== 'KeyV') return;
		if(!document.querySelector('.widget-scene-canvas')) return;
		if(document.activeElement.tagName === 'INPUT') return;

		document.getElementById('GEO_VF_CONFIG').classList.toggle('is-hidden');
	});
}

init();
