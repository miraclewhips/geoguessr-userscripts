// ==UserScript==
// @name         GeoGuessr Only Car Only Compass
// @description  Hides everything in the round except the car and compass
// @version      1.0
// @author       miraclewhips
// @match        *://*.geoguessr.com/*
// @run-at       document-start
// @icon         https://www.google.com/s2/favicons?domain=geoguessr.com
// @copyright    2024, miraclewhips (https://github.com/miraclewhips)
// @license      MIT
// @downloadURL  https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-only-car-only-compass.user.js
// @updateURL    https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-only-car-only-compass.user.js
// ==/UserScript==

// Whether or not the use the slim version of the car mask, or the full version
const USE_SLIM_CAR_MASK = true;




/* ############################################################################### */
/* ##### DON'T MODIFY ANYTHING BELOW HERE UNLESS YOU KNOW WHAT YOU ARE DOING ##### */
/* ############################################################################### */

// car shaders credit to drparse and victheturtle
// Full Version: https://openuserjs.org/scripts/drparse/GeoNoCar
// Slim Version: https://greasyfork.org/en/scripts/459812-geonocar-lite

const vertexOld = "const float f=3.1415926;varying vec3 a;uniform vec4 b;attribute vec3 c;attribute vec2 d;uniform mat4 e;void main(){vec4 g=vec4(c,1);gl_Position=e*g;a=vec3(d.xy*b.xy+b.zw,1);a*=length(c);}";
const fragOld = "precision highp float;const float h=3.1415926;varying vec3 a;uniform vec4 b;uniform float f;uniform sampler2D g;void main(){vec4 i=vec4(texture2DProj(g,a).rgb,f);gl_FragColor=i;}";

const vertexNewSlim = `
varying vec3 a;
varying vec3 potato;
uniform vec4 b;
attribute vec3 c;
attribute vec2 d;
uniform mat4 e;
 
void main(){
    vec4 g=vec4(c,1);
    gl_Position=e*g;
    a = vec3(d.xy * b.xy + b.zw,1);
    a *= length(c);
    potato = vec3(d.xy, 1.0) * length(c);
}`;

const fragNewSlim = `
precision highp float;
varying vec3 a;
varying vec3 potato;
uniform vec4 b;
uniform float f;
uniform sampler2D g;
 
bool show(float alpha1, float alpha2) {
    float alpha3 = abs(alpha1 - 0.5);
    float alpha4 = (alpha3 > 0.25) ? 0.5 - alpha3 : alpha3;
    if (alpha4 < 0.0062) {
        return alpha2 > 0.63;
    } else if (alpha4 < 0.0066) {
        return alpha2 > mix(0.63, 0.67, (alpha4-0.0062) / (0.0066-0.0062));
    } else if (alpha4 < 0.065) {
        return alpha2 > 0.67;
    } else if (alpha4 < 0.10) {
        return alpha2 > mix(0.67, 0.715, (alpha4-0.065) / (0.10-0.065));
    } else if (alpha4 < 0.16) {
        return alpha2 > mix(0.715, 0.73, (alpha4-0.10) / (0.16-0.10));
    } else if (alpha4 < 0.175) {
        return alpha2 > mix(0.73, 0.79, (alpha4-0.16) / (0.175-0.16));
    } else {
        return alpha2 > 0.81 - 3.5 * (alpha4 - 0.25) * (alpha4 - 0.25);
    }
}
 
void main(){
    vec2 aD = potato.xy / a.z;
    vec4 i = vec4(show(aD.x, aD.y) ? texture2DProj(g,a).rgb : vec3(float(0.1), float(0.1), float(0.1)), f);
    gl_FragColor=i;
}`;

const vertexNewFull = `
const float f=3.1415926;
varying vec3 a;
varying vec3 potato;
uniform vec4 b;
attribute vec3 c;
attribute vec2 d;
uniform mat4 e;

void main(){
	vec4 g=vec4(c,1);
	gl_Position=e*g;
	a = vec3(d.xy * b.xy + b.zw,1);
	a *= length(c);

	potato = vec3(d.xy, 1.0) * length(c);
}`;
const fragNewFull = `
precision highp float;
const float h=3.1415926;
varying vec3 a;
varying vec3 potato;
uniform vec4 b;
uniform float f;
uniform sampler2D g;

void main(){
	vec2 aD = potato.xy / a.z;
	float thetaD = aD.y;

	float thresholdD1 = 0.6;
	float thresholdD2 = 0.7;

	float x = aD.x;
	float y = abs(4.0*x - 2.0);
	float phiD = smoothstep(0.0, 1.0, y > 1.0 ? 2.0 - y : y);

	vec4 i = vec4(thetaD > mix(thresholdD1, thresholdD2, phiD) ? texture2DProj(g,a).rgb : vec3(float(0.1), float(0.1), float(0.1)), f);
	gl_FragColor=i;
}`;

function getVertexShader() {
	if(USE_SLIM_CAR_MASK) {
		return vertexNewSlim;
	}else{
		return vertexNewFull;
	}
}
function getFragShader() {
	if(USE_SLIM_CAR_MASK) {
		return fragNewSlim;
	}else{
		return fragNewFull;
	}
}

function installShaderSource(ctx) {
	const oldShaderSource = ctx.shaderSource;

	function shaderSource() {
		if(typeof arguments[1] === 'string') {
			if(arguments[1] === vertexOld) {
				const s = getVertexShader();
				if(s) arguments[1] = s;
			}else if (arguments[1] === fragOld) {
				const s = getFragShader();
				if(s) arguments[1] = s;
			}
		}
		return oldShaderSource.apply(this, arguments);
	}

	shaderSource.bestcity = 'bintulu';
	ctx.shaderSource = shaderSource;
}
function installGetContext(el) {
	const oldGetContext = el.getContext;

	el.getContext = function() {
		const ctx = oldGetContext.apply(this, arguments);
		if((arguments[0] === 'webgl' || arguments[0] === 'webgl2') && ctx && ctx.shaderSource && ctx.shaderSource.bestcity !== 'bintulu') {
			installShaderSource(ctx);
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
