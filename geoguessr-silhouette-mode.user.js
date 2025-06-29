// ==UserScript==
// @name         GeoGuessr Silhouette Mode
// @description  A filter that creates a silhouette effect with the colours of the round
// @version      1.0
// @author       miraclewhips
// @match        *://*.geoguessr.com/*
// @run-at       document-start
// @icon         https://www.google.com/s2/favicons?domain=geoguessr.com
// @copyright    2025, miraclewhips (https://github.com/miraclewhips)
// @license      MIT
// @downloadURL  https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-silhouette-mode.user.js
// @updateURL    https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-silhouette-mode.user.js
// ==/UserScript==

// increase to make the effect stronger, decrease to make it weaker
const THRESHOLD = 0.075; // usually something between 0 and 0.2 works best



/* ############################################################################### */
/* ##### DON'T MODIFY ANYTHING BELOW HERE UNLESS YOU KNOW WHAT YOU ARE DOING ##### */
/* ############################################################################### */

const vertexOld = "const float f=3.1415926;varying vec3 a;uniform vec4 b;attribute vec3 c;attribute vec2 d;uniform mat4 e;void main(){vec4 g=vec4(c,1);gl_Position=e*g;a=vec3(d.xy*b.xy+b.zw,1);a*=length(c);}";
const fragOld = "precision highp float;const float h=3.1415926;varying vec3 a;uniform vec4 b;uniform float f;uniform sampler2D g;void main(){vec4 i=vec4(texture2DProj(g,a).rgb,f);gl_FragColor=i;}";

// const vertexNew = `
// varying vec3 a;
// uniform vec4 b;
// attribute vec3 c;
// attribute vec2 d;
// uniform mat4 e;
//  
// void main(){
//     vec4 g = vec4(c, 1);
//     gl_Position = e * g;
//     a = vec3(d.xy * b.xy + b.zw, 1.0);
//     a *= length(c);
// }`;

const fragNew = `
precision highp float;
varying vec3 a;
uniform vec4 b;
uniform float f;
uniform sampler2D g;

void main(){
	vec3 i = texture2DProj(g, a).rgb;
	float b = i.b - (i.r + i.g) / 2.0;
	float t = float(${THRESHOLD}) - smoothstep(3.5, 6.0, i.r + i.g + i.b * 4.0) * 0.5;
	vec3 final = b > t ? i : vec3(0.0);
	gl_FragColor = vec4(final, 1.0);
}`;

function installShaderSource(ctx) {
	const oldShaderSource = ctx.shaderSource;

	function shaderSource() {
		if(typeof arguments[1] === 'string') {
			/*if(arguments[1] === vertexOld) {
				const s = vertexNew;
				if(s) arguments[1] = s;
			}else */if (arguments[1] === fragOld) {
				const s = fragNew;
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
