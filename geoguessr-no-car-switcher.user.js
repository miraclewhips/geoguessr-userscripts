// ==UserScript==
// @name         GeoGuessr No-Car Switcher
// @description  Switch between different car mask shapes without reloading. Does not work on Chrome, tested in Firefox and Edge.
// @version      1.0
// @author       miraclewhips
// @match        *://*.geoguessr.com/*
// @run-at       document-start
// @icon         https://www.google.com/s2/favicons?domain=geoguessr.com
// @copyright    2026, miraclewhips (https://github.com/miraclewhips)
// @license      MIT
// @downloadURL  https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-no-car-switcher.user.js
// @updateURL    https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-no-car-switcher.user.js
// ==/UserScript==


// HOTKEYS TO SWITCH BETWEEN MASKS
const MASK_HOTKEY_DISABLE              = '0';
const MASK_HOTKEY_COMBINED             = '1';
const MASK_HOTKEY_CLASSIC              = '2';
const MASK_HOTKEY_SLIM                 = '3';
const MASK_HOTKEY_TRUCK_NO_ANTENNA     = '4';
const MASK_HOTKEY_TRUCK_ANTENNA        = '5';
const MASK_HOTKEY_SMALLCAM_NO_ANTENNA  = '6';
const MASK_HOTKEY_SMALLCAM_ANTENNA     = '7';

// MASK COLOUR (HEX)
const MASK_COLOR = '#181818';




/* ############################################################################### */
/* ##### DON'T MODIFY ANYTHING BELOW HERE UNLESS YOU KNOW WHAT YOU ARE DOING ##### */
/* ############################################################################### */

if(window.frameElement) return;

const MASK_COLOR_NORMALIZED = (() => {
	const color = {r: 0.1, g: 0.1, b: 0.1};
	let hex = MASK_COLOR.slice(1);
	if((hex.length !== 3 && hex.length !== 6) || !/^[a-zA-Z0-9]+$/.test(hex)) return color;
	if(hex.length === 3) {
		hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
	}
	color.r = parseInt(hex.slice(0, 2), 16) / 255;
	color.g = parseInt(hex.slice(2, 4), 16) / 255;
	color.b = parseInt(hex.slice(4, 6), 16) / 255;
	return color;
})();

// original car shaders credit to drparse and victheturtle
// Classic Version: https://openuserjs.org/scripts/drparse/GeoNoCar
// Slim Version: https://greasyfork.org/en/scripts/459812-geonocar-lite

const vertexOld = "const float f=3.1415926;varying vec3 a;uniform vec4 b;attribute vec3 c;attribute vec2 d;uniform mat4 e;void main(){vec4 g=vec4(c,1);gl_Position=e*g;a=vec3(d.xy*b.xy+b.zw,1);a*=length(c);}";
const fragOld = "precision highp float;const float h=3.1415926;varying vec3 a;uniform vec4 b;uniform float f;uniform sampler2D g;void main(){vec4 i=vec4(texture2DProj(g,a).rgb,f);gl_FragColor=i;}";

const vertexNew = `
varying vec3 a;
varying vec3 potato;
uniform vec4 b;
attribute vec3 c;
attribute vec2 d;
uniform mat4 e;

const float f = 3.1415926;
 
void main() {
    vec4 g = vec4(c, 1);
    gl_Position = e*g;
    a = vec3(d.xy * b.xy + b.zw, 1) * length(c);
    potato = vec3(d.xy, 1.0) * length(c);
}`;

const fragNew = `
precision highp float;
varying vec3 a;
varying vec3 potato;
uniform vec4 b;
uniform float f;
uniform sampler2D g;
uniform int carMaskIndex;

const float h = 3.1415926;
const vec3 maskColor = vec3(${MASK_COLOR_NORMALIZED.r}, ${MASK_COLOR_NORMALIZED.g}, ${MASK_COLOR_NORMALIZED.b});

bool maskClassic(vec2 aD) {
	float thetaD = aD.y;

	float thresholdD1 = 0.6;
	float thresholdD2 = 0.7;

	float x = aD.x;
	float y = abs(4.0*x - 2.0);
	float phiD = smoothstep(0.0, 1.0, y > 1.0 ? 2.0 - y : y);
	return thetaD > mix(thresholdD1, thresholdD2, phiD);
}

bool maskSlim(vec2 aD) {
    float absX = abs(aD.x - 0.5);
    float x = (absX > 0.25) ? 0.5 - absX : absX;

	const int NUM_POINTS = 7;
	vec2 points[NUM_POINTS];

	points[0] = vec2(0.0,    0.63);
	points[1] = vec2(0.0062, 0.63);
	points[2] = vec2(0.0066, 0.66);
	points[3] = vec2(0.065,  0.66);
	points[4] = vec2(0.1,    0.715);
	points[5] = vec2(0.16,   0.73);
	points[6] = vec2(0.175,  0.79);

	for(int i = 1; i < NUM_POINTS; i++) {
		if(x < points[i].x) {
			return aD.y > mix(points[i-1].y, points[i].y, (x - points[i-1].x) / (points[i].x - points[i-1].x));
		}
	}

	return aD.y > 0.81 - 3.5 * (x - 0.25) * (x - 0.25);
}

bool maskTruck(vec2 aD, bool antenna) {
    float absX = abs(aD.x - 0.5);

	const int NUM_POINTS = 11;
	vec2 points[NUM_POINTS];

	points[0]  = vec2(0.0,    0.53);
	points[1]  = vec2(0.0325, 0.53);
	points[2]  = vec2(0.0325, antenna ? 0.495 : 0.53);
	points[3]  = vec2(0.045,  antenna ? 0.495 : 0.53);
	points[4]  = vec2(0.045,  0.53);
	points[5]  = vec2(0.05,   0.53);
	points[6]  = vec2(0.15,   0.65);
	points[7]  = vec2(0.17,   0.70);
	points[8]  = vec2(0.25,   0.72);
	points[9]  = vec2(0.32,   0.70);
	points[10] = vec2(0.4,    0.68);

	for(int i = 1; i < NUM_POINTS; i++) {
		if(absX < points[i].x) {
			return aD.y > mix(points[i-1].y, points[i].y, (absX - points[i-1].x) / (points[i].x - points[i-1].x));
		}
	}

	return aD.y > points[NUM_POINTS-1].y;
}

bool maskSmallcam(vec2 aD, bool antenna) {
    float absX = abs(aD.x - 0.5);

	const int NUM_POINTS = 15;
	vec2 points[NUM_POINTS];

	points[0]  = vec2(0.0,   0.62);
	points[1]  = vec2(0.05,  0.62);
	points[2]  = vec2(0.075, 0.63);
	points[3]  = vec2(0.10,  0.635);
	points[4]  = vec2(0.10,  antenna ? 0.55 : 0.635);
	points[5]  = vec2(0.12,  antenna ? 0.55 : 0.635);
	points[6]  = vec2(0.12,  0.635);
	points[7]  = vec2(0.14,  0.645);
	points[8]  = vec2(0.17,  0.655);
	points[9]  = vec2(0.21,  0.655);
	points[10] = vec2(0.28,  0.645);
	points[11] = vec2(0.30,  0.635);
	points[12] = vec2(0.34,  0.615);
	points[13] = vec2(0.38,  0.595);
	points[14] = vec2(0.45,  0.57);

	for(int i = 1; i < NUM_POINTS; i++) {
		if(absX < points[i].x) {
			return aD.y > mix(points[i-1].y, points[i].y, (absX - points[i-1].x) / (points[i].x - points[i-1].x));
		}
	}

	return aD.y > points[NUM_POINTS-1].y;
}

bool maskCombined(vec2 aD) {
	// ignore checking maskSlim() and maskClassic() as the others cover it completely
	return maskTruck(aD, true) || maskSmallcam(aD, true);
}
 
void main() {
    vec2 aD = potato.xy / a.z;
	bool hidden = false;

	if(carMaskIndex == 1) hidden = maskCombined(aD);
	if(carMaskIndex == 2) hidden = maskClassic(aD);
	if(carMaskIndex == 3) hidden = maskSlim(aD);
	if(carMaskIndex == 4) hidden = maskTruck(aD, false);
	if(carMaskIndex == 5) hidden = maskTruck(aD, true);
	if(carMaskIndex == 6) hidden = maskSmallcam(aD, false);
	if(carMaskIndex == 7) hidden = maskSmallcam(aD, true);

	// vec3 maskColorDebug = texture2DProj(g, a).rgb * vec3(1.0, 0.5, 0.5);

    gl_FragColor = vec4(hidden ? maskColor : texture2DProj(g, a).rgb, f);
}`;

let PROGRAM_LIST = new Map();
let carMaskIndex = window.localStorage.getItem('carMaskIndex') ?? 1;

function installShaderSource(ctx) {
	const oldShaderSource = ctx.shaderSource;

	function shaderSource() {
		if(typeof arguments[1] === 'string') {
			if(arguments[1] === vertexOld) {
				arguments[1] = vertexNew;
			}else if (arguments[1] === fragOld) {
				arguments[1] = fragNew;
			}
		}

		return oldShaderSource.apply(this, arguments);
	}

	shaderSource.bestcity = 'bintulu';
	ctx.shaderSource = shaderSource;
}

function installAttachShader(ctx) {
	const oldAttachShader = ctx.attachShader;

	function attachShader() {
		if(ctx.getShaderSource(arguments[1]) == fragNew) {
			PROGRAM_LIST.set(ctx, arguments[0]);
		}
		return oldAttachShader.apply(this, arguments);
	}

	attachShader.bestcity = 'bintulu';
	ctx.attachShader = attachShader;
}

function installLinkProgram(ctx) {
	const oldLinkProgram = ctx.linkProgram;

	function linkProgram() {
		const result = oldLinkProgram.apply(this, arguments);

		if(arguments[0] == PROGRAM_LIST.get(ctx)) {
			updateCarMask();
		}

		return result;
	}

	linkProgram.bestcity = 'bintulu';
	ctx.linkProgram = linkProgram;
}

function installGetContext(el) {
	const oldGetContext = el.getContext;

	el.getContext = function() {
		const ctx = oldGetContext.apply(this, arguments);
		if((arguments[0] === 'webgl' || arguments[0] === 'webgl2') && ctx) {
			if(ctx.shaderSource && ctx.shaderSource.bestcity !== 'bintulu') {
				installShaderSource(ctx);
			}
			if(ctx.attachShader && ctx.attachShader.bestcity !== 'bintulu') {
				installAttachShader(ctx);
			}
			if(ctx.linkProgram && ctx.linkProgram.bestcity !== 'bintulu') {
				installLinkProgram(ctx);
			}
		}
		return ctx;
	};
}

const oldCreateElement = document.createElement;

document.createElement = function() {
	const el = oldCreateElement.apply(this, arguments);
	if(arguments[0] === 'canvas' || arguments[0] === 'CANVAS') {
		installGetContext(el);
	}
	return el;
}

function updateCarMask() {
	window.localStorage.setItem('carMaskIndex', carMaskIndex);

	PROGRAM_LIST.forEach((program, gl) => {
		if(!program) return;

		const maskIndex = gl.getUniformLocation(program, "carMaskIndex");
		if(!maskIndex) return;

		gl.useProgram(program);
		gl.uniform1i(maskIndex, carMaskIndex);

		// force an update on the canvas so it re-renders the new mask immediately
		gl.canvas.dispatchEvent(new MouseEvent('mousemove', { bubbles: true }));
	});
}

const carMaskKeys = [
	MASK_HOTKEY_DISABLE,
	MASK_HOTKEY_COMBINED,
	MASK_HOTKEY_CLASSIC,
	MASK_HOTKEY_SLIM,
	MASK_HOTKEY_TRUCK_NO_ANTENNA,
	MASK_HOTKEY_TRUCK_ANTENNA,
	MASK_HOTKEY_SMALLCAM_NO_ANTENNA,
	MASK_HOTKEY_SMALLCAM_ANTENNA,
];

const carMaskNames = {
	[MASK_HOTKEY_DISABLE]:             'Disabled',
	[MASK_HOTKEY_COMBINED]:            'Combined',
	[MASK_HOTKEY_CLASSIC]:             'Classic',
	[MASK_HOTKEY_SLIM]:                'Slim',
	[MASK_HOTKEY_TRUCK_NO_ANTENNA]:    'Truck (no antenna)',
	[MASK_HOTKEY_TRUCK_ANTENNA]:       'Truck (antenna)',
	[MASK_HOTKEY_SMALLCAM_NO_ANTENNA]: 'Smallcam (no antenna)',
	[MASK_HOTKEY_SMALLCAM_ANTENNA]:    'Smallcam (antenna)',
};

document.addEventListener('keydown', (e) => {
	if(document.activeElement.tagName == 'INPUT') return;

	const i = carMaskKeys.indexOf(e.key);
	if(i < 0) return;

	let canvasVisible = false;
	PROGRAM_LIST.forEach((_, gl) => {
		if(gl.canvas.checkVisibility()) canvasVisible = true;
	});

	if(!canvasVisible) return;

	e.preventDefault();
	e.stopPropagation();

	carMaskIndex = i;
	updateCarMask();

	const notif = document.createElement('div');
	notif.style.position = 'fixed';
	notif.style.left = '50%';
	notif.style.bottom = '20px';
	notif.style.zIndex = '999999';
	notif.style.pointerEvents = 'none';
	notif.style.backgroundColor = '#000';
	notif.style.color = '#fff';
	notif.style.width = '220px';
	notif.style.marginLeft = '-110px';
	notif.style.height = '24px';
	notif.style.display = 'flex';
	notif.style.alignItems = 'center';
	notif.style.justifyContent = 'center';
	notif.style.fontSize = '12px';
	notif.style.borderRadius = '9999px';
	notif.style.opacity = '0';
	notif.style.transition = 'opacity 0.25s ease-out';
	notif.textContent = `Car Mask: ${carMaskNames[i]}`;
	document.body.appendChild(notif);

	setTimeout(() => {
		notif.style.opacity = '1';
		setTimeout(() => {
			notif.style.opacity = '0';
			setTimeout(() => {
				notif.remove();
			}, 250);
		}, 2000);
	}, 1);
});
