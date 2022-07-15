// ==UserScript==
// @name         GeoGuessr Custom Avatar Uploader
// @description  Allows you to upload custom avatar images (upload at the bottom of your profile page)
// @version      1.0
// @author       miraclewhips
// @match        *://*.geoguessr.com/*
// @icon         https://www.google.com/s2/favicons?domain=geoguessr.com
// @grant        none
// @copyright    2022, miraclewhips (https://github.com/miraclewhips)
// @license      MIT
// @downloadURL    https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-avatar-uploader.user.js
// @updateURL    https://github.com/miraclewhips/geoguessr-userscripts/raw/master/geoguessr-avatar-uploader.user.js
// ==/UserScript==

/* ############################################################################### */
/* ##### DON'T MODIFY ANYTHING BELOW HERE UNLESS YOU KNOW WHAT YOU ARE DOING ##### */
/* ############################################################################### */

const getBase64 = (file) => {
	return new Promise((resolve, reject) => {
		if(!file) {
			reject('no file');
		}

		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = () => resolve(reader.result);
		reader.onerror = error => reject(error);
	});
}

const errorMessage = (message) => {
	let text = document.createElement('div');
	text.textContent = message;
	text.style.fontWeight = 'bold';
	text.style.color = '#f44';
	return text;
}

const init = () => {
	const observer = new MutationObserver(() => {
		const profileContainer = document.querySelector('div[class^="profile_copyLink__"]');

		if(profileContainer && profileContainer.id !== 'added-avatar-button') {
			let avatarUpload = document.createElement('div');

			avatarUpload.innerHTML = `
			<h2 style="color:#fecd19">CUSTOM AVATAR UPLOAD</h2>

			<br>

			<p style="opacity:0.6; font-size:13px; line-height:1.6;">Images must be under 1 MB.<br>Avatar image dimensions should be in an aspect ratio of 9:12 (such as 540x720px).<br>Icon image dimensions should be in a ratio of 1:1 (such as 500x500px).</p>

			<br>

			<label>
				<strong style="display:inline-block; width:100px; text-align: right;">Avatar Image:</strong>
				<input type="file" id="customAvatar-inputAvatar" accept="image/png, image/jpeg, image/gif" style="border-color:rgba(255,255,255,0.2)">
			</label>

			<br><br>

			<label>
				<strong style="display:inline-block; width:100px; text-align: right;">Icon Image:</strong>
				<input type="file" id="customAvatar-inputIcon" accept="image/png, image/jpeg, image/gif" style="border-color:rgba(255,255,255,0.2)">
			</label>

			<br><br>
			<div id="customAvatar-error" style="line-height:1.6"></div>
			<br>

			<a style="display:inline-block; background:#fecd19; border:none; color:#000; padding:10px 20px; cursor:pointer;" id="customAvatar-upload">UPLOAD</a>
			<div id="customAvatar-uploading" style="display:none;">Uploading your avatar. Do not navigate away from the page. It will automatically refresh once done.</div>
			`;

			profileContainer.parentNode.insertBefore(avatarUpload, profileContainer.nextSibling);

			document.getElementById('customAvatar-upload').addEventListener('click', async () => {
				let errorWrapper = document.getElementById('customAvatar-error');
				errorWrapper.innerHTML = '';
				let hasError = false;

				let fileAvatar = document.getElementById('customAvatar-inputAvatar').files[0];
				let fileIcon = document.getElementById('customAvatar-inputIcon').files[0];

				let fileType = /(\.jpg|\.jpeg|\.png|\.gif)$/i;

				if(!fileAvatar) {
					hasError = true;
					errorWrapper.append(errorMessage('Please choose an avatar image'));
				}else{
					switch(fileAvatar.type) {
						case 'image/png':
						case 'image/jpeg':
						case 'image/gif':
							if(fileAvatar.size / 1024 / 1024 > 1) {
								hasError = true;
								errorWrapper.append(errorMessage('Avatar image exceeds 1 MB file size limit'));
							}
							break;

						default:
							hasError = true;
							errorWrapper.append(errorMessage('Avatar image must be a PNG, JPG, or GIF file'));
							break;
					}
				}

				if(!fileIcon) {
					hasError = true;
					errorWrapper.append(errorMessage('Please choose an icon image'));
				}else{
					switch(fileIcon.type) {
						case 'image/png':
						case 'image/jpeg':
						case 'image/gif':
							if(fileIcon.size / 1024 / 1024 > 1) {
								hasError = true;
								errorWrapper.append(errorMessage('Icon image exceeds 1 MB file size limit'));
							}
							break;

						default:
							hasError = true;
							errorWrapper.append(errorMessage('Icon image must be a PNG, JPG, or GIF file'));
							break;
					}
				}

				if(hasError) {
					return;
				}

				let b64Avatar = await getBase64(fileAvatar);
				let b64Icon = await getBase64(fileIcon);

				if(!b64Avatar) {
					hasError = true;
					errorWrapper.append(errorMessage('Error occurred while reading avatar image file. Please check the file and try again.'));
				}

				if(!b64Icon) {
					hasError = true;
					errorWrapper.append(errorMessage('Error occurred while reading icon image file. Please check the file and try again.'));
				}
				
				if(hasError) {
					return;
				}

				document.getElementById('customAvatar-upload').style.display = 'none';
				document.getElementById('customAvatar-uploading').style.display = 'block';

				let body = {
					"fullBodyPin": b64Avatar,
					"mugshotPin": b64Icon
				}

				await fetch("https://www.geoguessr.com/api/v4/avatar", {
					"headers": {
					"accept": "*/*",
					"accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
					"content-type": "application/json",
					"sec-fetch-dest": "empty",
					"sec-fetch-mode": "cors",
					"sec-fetch-site": "same-origin",
					"sec-gpc": "1",
					"x-client": "web"
					},
					"referrer": "https://www.geoguessr.com/avatar",
					"referrerPolicy": "strict-origin-when-cross-origin",
					"body": JSON.stringify(body),
					"method": "POST",
					"mode": "cors",
					"credentials": "include"
				});

				window.scrollTo(0, 0);
				window.location.reload();
			});

			profileContainer.id = 'added-avatar-button';
		}
	});

	observer.observe(document.querySelector('#__next'), { subtree: true, childList: true });
}

init();