// ==UserScript==
// @name         WeabooGuessr
// @description  For the true weebs out there
// @version      1.0
// @author       miraclewhips
// @match        *://*.geoguessr.com/*
// @icon         https://www.google.com/s2/favicons?domain=geoguessr.com
// @grant        none
// @copyright    2022, miraclewhips (https://github.com/miraclewhips)
// @license      MIT
// @downloadURL    https://github.com/miraclewhips/geoguessr-userscripts/raw/master/weabooguessr.user.js
// @updateURL    https://github.com/miraclewhips/geoguessr-userscripts/raw/master/weabooguessr.user.js
// ==/UserScript==

/* ############################################################################### */
/* ##### DON'T MODIFY ANYTHING BELOW HERE UNLESS YOU KNOW WHAT YOU ARE DOING ##### */
/* ############################################################################### */

const textStrokeColor = `#000`;
const textStroke = `text-shadow: ${textStrokeColor} 3px 0px 0px, ${textStrokeColor} 2.83487px 0.981584px 0px, ${textStrokeColor} 2.35766px 1.85511px 0px, ${textStrokeColor} 1.62091px 2.52441px 0px, ${textStrokeColor} 0.705713px 2.91581px 0px, ${textStrokeColor} -0.287171px 2.98622px 0px, ${textStrokeColor} -1.24844px 2.72789px 0px, ${textStrokeColor} -2.07227px 2.16926px 0px, ${textStrokeColor} -2.66798px 1.37182px 0px, ${textStrokeColor} -2.96998px 0.42336px 0px, ${textStrokeColor} -2.94502px -0.571704px 0px, ${textStrokeColor} -2.59586px -1.50383px 0px, ${textStrokeColor} -1.96093px -2.27041px 0px, ${textStrokeColor} -1.11013px -2.78704px 0px, ${textStrokeColor} -0.137119px -2.99686px 0px, ${textStrokeColor} 0.850987px -2.87677px 0px, ${textStrokeColor} 1.74541px -2.43999px 0px, ${textStrokeColor} 2.44769px -1.73459px 0px, ${textStrokeColor} 2.88051px -0.838247px 0px !important; color: #fff !important;`;

const animeBG = `
background-color: #fff !important;
background-image: url(https://i.imgur.com/nZjtbJg.png) !important;
background-position: center !important;
`;

let style = document.createElement('style');
style.innerHTML = `
.game-layout__status div[class^="styles_start__"]:before,
.game-layout__status div[class^="styles_end__"]:before,
div[class^="result-layout_content__"],
div[class^="fullscreen-spinner_root__"],
button[class^="button_button__"],
a[class^="button_link__"],
div[class^="background_background__"] {
	${animeBG}
}

div[class^="background_background__"] {
	opacity: 0.1 !important;
}

div[class^="status_label__"],
div[class^="status_value__"],
div[class^="result-layout_content__"],
div[class^="fullscreen-spinner_root__"],
button[class^="button_button__"],
a[class^="button_link__"] {
	${textStroke};
}
`;
document.body.append(style);