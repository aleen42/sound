/***********************************************************************
 *                                                                   _
 *       _____  _                           ____  _                 |_|
 *      |  _  |/ \   ____  ____ __ ___     / ___\/ \   __   _  ____  _
 *      | |_| || |  / __ \/ __ \\ '_  \ _ / /    | |___\ \ | |/ __ \| |
 *      |  _  || |__. ___/. ___/| | | ||_|\ \___ |  _  | |_| |. ___/| |
 *      |_/ \_|\___/\____|\____||_| |_|    \____/|_| |_|_____|\____||_|
 *
 *      ================================================================
 *                 More than a coder, More than a designer
 *      ================================================================
 *
 *
 *      - Document: sound.js
 *      - Author: aleen42
 *      - Description: core module for sound.js
 *      - Create Time: Aug 22nd, 2016
 *      - Update Time: Aug 22nd, 2016
 *
 *
 **********************************************************************/

import Common from './common';

const Sound = module.exports = function (url) {
	/** init a Sound instance with its location */
	this.url = url;

	/** @type {[type]} [Audio Context Object] */
	this.context = null;

	/** @type {[type]} [Audio Dog Sound Object] */
	this.dogBarkingBuffer  = null;

	/** @type {[type]} [onload function called when loading successfully] */
	this.loadEvent = null;

	/** initialize context object */
	try {
		/** fixed up for prefixing */
		window.AudioContext = window.AudioContext || window.webkitAudioContext;

		this.context = new AudioContext();	
	} catch (e) {
		/** catch error */
		Common.errorPrint('Failed to create AudioContext');
	}
};

Sound.prototype.onload = function (callback) {
	this.loadEvent = callback;
	return this;
};

Sound.prototype.init = function () {
	/** initialize audio object with arrayBuffer type */
	var request = new XMLHttpRequest();
	request.open('GET', this.url, true);
	request.responseType = 'arraybuffer';

	/** Decode asynchronously */
	request.onload = function() {
		this.context.decodeAudioData(request.response, function (buffer) {
			this.dogBarkingBuffer = buffer;

			this.loadEvent();
		}.bind(this), function () {
			/** catch error */
			Common.errorPrint('Failed to get buffer from this url');
		});
	}.bind(this);

	request.send();

	return this;
};

Sound.prototype.play = function () {
	var source = this.context.createBufferSource(); 	/** creates a sound source */
	source.buffer = this.dogBarkingBuffer;              /** tell the source which sound to play*/
	source.connect(this.context.destination);       	/** connect the source to the context's destination (the speakers) */
	source.start(0);                           			/** play the source now */
														/** note: on older systems, may have to use deprecated noteOn(time); */
};
