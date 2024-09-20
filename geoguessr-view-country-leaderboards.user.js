// ==UserScript==
// @name         GeoGuessr View Country Leaderboards
// @description  View leaderboards for all countries, not just your own
// @version      1.3
// @author       miraclewhips
// @match        *://*.geoguessr.com/*
// @icon         https://www.google.com/s2/favicons?domain=geoguessr.com
// @run-at       document-start
// @grant        unsafeWindow
// @grant        GM_addStyle
// @copyright    2024, miraclewhips (https://github.com/miraclewhips)
// @license      MIT
// @downloadURL  https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-view-country-leaderboards.user.js
// @updateURL    https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-view-country-leaderboards.user.js
// ==/UserScript==

/* ############################################################################### */
/* ##### DON'T MODIFY ANYTHING BELOW HERE UNLESS YOU KNOW WHAT YOU ARE DOING ##### */
/* ############################################################################### */

GM_addStyle(`
#mw-lb-countries {
	width: 200px;
	margin-left: 1rem;
}
`);

const COUNTRY_LIST = [["AF","Afghanistan"],["AX","Åland Islands"],["AL","Albania"],["DZ","Algeria"],["AS","American Samoa"],["AD","Andorra"],["AO","Angola"],["AI","Anguilla"],["AQ","Antarctica"],["AG","Antigua and Barbuda"],["AR","Argentina"],["AM","Armenia"],["AW","Aruba"],["AU","Australia"],["AT","Austria"],["AZ","Azerbaijan"],["BS","Bahamas"],["BH","Bahrain"],["BD","Bangladesh"],["BB","Barbados"],["BY","Belarus"],["BE","Belgium"],["BZ","Belize"],["BJ","Benin"],["BM","Bermuda"],["BT","Bhutan"],["BO","Bolivia, Plurinational State of"],["BQ","Bonaire, Sint Eustatius and Saba"],["BA","Bosnia and Herzegovina"],["BW","Botswana"],["BV","Bouvet Island"],["BR","Brazil"],["IO","British Indian Ocean Territory"],["BN","Brunei Darussalam"],["BG","Bulgaria"],["BF","Burkina Faso"],["BI","Burundi"],["KH","Cambodia"],["CM","Cameroon"],["CA","Canada"],["CV","Cape Verde"],["KY","Cayman Islands"],["CF","Central African Republic"],["TD","Chad"],["CL","Chile"],["CN","China"],["CX","Christmas Island"],["CC","Cocos (Keeling) Islands"],["CO","Colombia"],["KM","Comoros"],["CG","Congo"],["CD","Congo, the Democratic Republic of the"],["CK","Cook Islands"],["CR","Costa Rica"],["CI","Côte d'Ivoire"],["HR","Croatia"],["CU","Cuba"],["CW","Curaçao"],["CY","Cyprus"],["CZ","Czech Republic"],["DK","Denmark"],["DJ","Djibouti"],["DM","Dominica"],["DO","Dominican Republic"],["EC","Ecuador"],["EG","Egypt"],["SV","El Salvador"],["GQ","Equatorial Guinea"],["ER","Eritrea"],["EE","Estonia"],["ET","Ethiopia"],["FK","Falkland Islands (Malvinas)"],["FO","Faroe Islands"],["FJ","Fiji"],["FI","Finland"],["FR","France"],["GF","French Guiana"],["PF","French Polynesia"],["TF","French Southern Territories"],["GA","Gabon"],["GM","Gambia"],["GE","Georgia"],["DE","Germany"],["GH","Ghana"],["GI","Gibraltar"],["GR","Greece"],["GL","Greenland"],["GD","Grenada"],["GP","Guadeloupe"],["GU","Guam"],["GT","Guatemala"],["GG","Guernsey"],["GN","Guinea"],["GW","Guinea-Bissau"],["GY","Guyana"],["HT","Haiti"],["HM","Heard Island and McDonald Islands"],["VA","Holy See (Vatican City State)"],["HN","Honduras"],["HK","Hong Kong"],["HU","Hungary"],["IS","Iceland"],["IN","India"],["ID","Indonesia"],["IR","Iran, Islamic Republic of"],["IQ","Iraq"],["IE","Ireland"],["IM","Isle of Man"],["IL","Israel"],["IT","Italy"],["JM","Jamaica"],["JP","Japan"],["JE","Jersey"],["JO","Jordan"],["KZ","Kazakhstan"],["KE","Kenya"],["KI","Kiribati"],["KP","Korea, Democratic People's Republic of"],["KR","Korea, Republic of"],["KW","Kuwait"],["KG","Kyrgyzstan"],["LA","Lao People's Democratic Republic"],["LV","Latvia"],["LB","Lebanon"],["LS","Lesotho"],["LR","Liberia"],["LY","Libya"],["LI","Liechtenstein"],["LT","Lithuania"],["LU","Luxembourg"],["MO","Macao"],["MK","Macedonia, the Former Yugoslav Republic of"],["MG","Madagascar"],["MW","Malawi"],["MY","Malaysia"],["MV","Maldives"],["ML","Mali"],["MT","Malta"],["MH","Marshall Islands"],["MQ","Martinique"],["MR","Mauritania"],["MU","Mauritius"],["YT","Mayotte"],["MX","Mexico"],["FM","Micronesia, Federated States of"],["MD","Moldova, Republic of"],["MC","Monaco"],["MN","Mongolia"],["ME","Montenegro"],["MS","Montserrat"],["MA","Morocco"],["MZ","Mozambique"],["MM","Myanmar"],["NA","Namibia"],["NR","Nauru"],["NP","Nepal"],["NL","Netherlands"],["NC","New Caledonia"],["NZ","New Zealand"],["NI","Nicaragua"],["NE","Niger"],["NG","Nigeria"],["NU","Niue"],["NF","Norfolk Island"],["MP","Northern Mariana Islands"],["NO","Norway"],["OM","Oman"],["PK","Pakistan"],["PW","Palau"],["PS","Palestine, State of"],["PA","Panama"],["PG","Papua New Guinea"],["PY","Paraguay"],["PE","Peru"],["PH","Philippines"],["PN","Pitcairn"],["PL","Poland"],["PT","Portugal"],["PR","Puerto Rico"],["QA","Qatar"],["RE","Réunion"],["RO","Romania"],["RU","Russian Federation"],["RW","Rwanda"],["BL","Saint Barthélemy"],["SH","Saint Helena, Ascension and Tristan da Cunha"],["KN","Saint Kitts and Nevis"],["LC","Saint Lucia"],["MF","Saint Martin (French part)"],["PM","Saint Pierre and Miquelon"],["VC","Saint Vincent and the Grenadines"],["WS","Samoa"],["SM","San Marino"],["ST","Sao Tome and Principe"],["SA","Saudi Arabia"],["SN","Senegal"],["RS","Serbia"],["SC","Seychelles"],["SL","Sierra Leone"],["SG","Singapore"],["SX","Sint Maarten (Dutch part)"],["SK","Slovakia"],["SI","Slovenia"],["SB","Solomon Islands"],["SO","Somalia"],["ZA","South Africa"],["GS","South Georgia and the South Sandwich Islands"],["SS","South Sudan"],["ES","Spain"],["LK","Sri Lanka"],["SD","Sudan"],["SR","Suriname"],["SJ","Svalbard and Jan Mayen"],["SZ","Swaziland"],["SE","Sweden"],["CH","Switzerland"],["SY","Syrian Arab Republic"],["TW","Taiwan, Province of China"],["TJ","Tajikistan"],["TZ","Tanzania, United Republic of"],["TH","Thailand"],["TL","Timor-Leste"],["TG","Togo"],["TK","Tokelau"],["TO","Tonga"],["TT","Trinidad and Tobago"],["TN","Tunisia"],["TR","Turkey"],["TM","Turkmenistan"],["TC","Turks and Caicos Islands"],["TV","Tuvalu"],["UG","Uganda"],["UA","Ukraine"],["AE","United Arab Emirates"],["GB","United Kingdom"],["US","United States"],["UM","United States Minor Outlying Islands"],["UY","Uruguay"],["UZ","Uzbekistan"],["VU","Vanuatu"],["VE","Venezuela, Bolivarian Republic of"],["VN","Viet Nam"],["VG","Virgin Islands, British"],["VI","Virgin Islands, U.S."],["WF","Wallis and Futuna"],["EH","Western Sahara"],["YE","Yemen"],["ZM","Zambia"],["ZW","Zimbabwe"]];

let SELECTED_COUNTRY, SELECTED_NAME;
let ALREADY_SELECTED = false;

const THE_WINDOW = unsafeWindow || window;
const default_fetch = THE_WINDOW.fetch;
THE_WINDOW.fetch = (function () {
	return function (...args) {
		const url = args[0].toString();
		const isRatingsUrl = url.includes(`geoguessr.com/api/v3/users/ratings`) || url.includes(`geoguessr.com/api/v4/ranked-system/ratings`);
		if(SELECTED_COUNTRY && isRatingsUrl && url.includes(`&country=`)) {
			args[0] = url.replace(/&country=(\w{2})/, `&country=${SELECTED_COUNTRY}`);
		}

		return default_fetch.apply(THE_WINDOW, args);
	};
})();

function setName(name) {
	SELECTED_NAME = name;

	const items = document.querySelectorAll(`div[class^="global-leaderboard_mainSwitch__"] div[class^="switch_switchItem__"]`);
	if(!items || !items.length) return;

	const label = items[items.length - 1].querySelector(`label`);
	if(label) {
		label.innerText = name;
	}
}

function changedCountry(e) {
	const val = e.target.value;
	const name = e.target.options[e.target.selectedIndex].text;
	if(!val || !val.length) return;

	SELECTED_COUNTRY = val;

	const items = document.querySelectorAll(`div[class^="global-leaderboard_mainSwitch__"] div[class^="switch_switchItem__"]`);
	if(!items || !items.length) return;

	setName(name);

	items[items.length - 1].click();

	invalidateSelector();
}

function addCountrySelector() {
	if(document.getElementById('mw-lb-countries')) return;

	const switchContainer = document.querySelector(`div[class^="global-leaderboard_mainSwitch__"] div[class^="switch_switch__"]`);

	if(ALREADY_SELECTED) {
		const message = document.createElement('div');
		message.id = 'mw-lb-countries';
		message.textContent = 'Must reload the page to change the selected country again';
		message.style.fontSize = '10px';
		switchContainer.parentElement.appendChild(message);
	}else{
		const countries = document.createElement('select');
		countries.id = 'mw-lb-countries';

		let ihtml = '<option value="">Select country</option>';
		for(const item of COUNTRY_LIST) {
			ihtml += `<option value="${item[0].trim().toLowerCase()}">${item[1]}</option>`;
		}

		countries.innerHTML = ihtml;

		countries.addEventListener('change', changedCountry)

		switchContainer.parentElement.appendChild(countries);
	}

	if(SELECTED_NAME) setName(SELECTED_NAME);
}

function invalidateSelector() {
	if(ALREADY_SELECTED) return;

	ALREADY_SELECTED = true;
	document.getElementById('mw-lb-countries')?.remove();
}

const init = () => {
	const observer = new MutationObserver(() => {
		if(document.getElementById('mw-lb-countries')) return;

		const switchContainer = document.querySelector(`div[class^="global-leaderboard_mainSwitch__"] div[class^="switch_switch__"]`);
		if(!switchContainer) return;

		addCountrySelector();

		const items = switchContainer.querySelectorAll(`div[class^="switch_switchItem__"]`);
		if(!items || !items.length) return;

		items[items.length - 1].removeEventListener('click', invalidateSelector);
		items[items.length - 1].addEventListener('click', invalidateSelector);
	});

	observer.observe(document.body, { subtree: true, childList: true });
}

init();
