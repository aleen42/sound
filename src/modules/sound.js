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
import BufferLoader from './bufferLoader';
import _ from 'underscore';

const Sound = module.exports = function (url) {
	/** init a Sound instance with its location */
	this.url = url;

	/** @type {[type]} [Audio Context Object] */
	this.context = null;

	/** @type {[type]} [onload function called when loading successfully] */
	this.loadEvent = null;

	/** @type {Array} [a list of buffer] */
	this.bufferList = [];

	/** @type {[type]} [a sound source] */
	this.source = null;

	/** @type {Number} [current playing which song] */
	this.currentIndex = 0;

	/** @type {Number} [current time of song] */
	this.currentTime = 0.0;

	/** @type {String} [3 types of status: play, paused, stop] */
	this.status = 'stop';

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
	if (!_.isArray(this.url)) {
		/** only load one source from an url */
		/** initialize audio object with arrayBuffer type */
		var request = new XMLHttpRequest();
		request.open('GET', this.url, true);
		request.responseType = 'arraybuffer';

		/** Decode asynchronously */
		request.onload = function() {
			this.context.decodeAudioData(request.response, function (buffer) {
				this.bufferList.push(buffer);

				this.loadEvent();
			}.bind(this), function () {
				/** catch error */
				Common.errorPrint('Failed to get buffer from this url');
			});
		}.bind(this);

		request.send();	
	} else {
		const bufferLoader = new BufferLoader(this.context, this.url, function (bufferList) {
			this.bufferList = bufferList;

			this.loadEvent();
		}.bind(this))
			.load();
	}

	/** create a process to calculate current time */
	setInterval(function () {
		/** update per second */
		switch (this.status) {
			case 'play':
				this.currentTime += 100 / 1000;
				return;
			case 'paused':
				return;
			case 'stop':
				this.currentTime = 0.0;
				return;
		}
	}.bind(this), 100);

	return this;
};

Sound.prototype.play = function (index, loop) {
	index = index || 0;
	loop = loop || false;

	if (index < 0 || index > this.bufferList.length - 1) {
		Common.errorPrint('Failed to play this song lists');
		return;
	}

	this.source = this.context.createBufferSource();			/** create a sound source 												*/

	this.source.onended = loop ? function () {					/** set ended event listner for loop playing							*/
		this.status = 'stop';									/** update current status to 'stop'										*/
		this.currentTime = 0;									/** ensure to clear getCurrentTime										*/
		this.play((this.currentIndex + 1) % this.bufferList.length, true);
	}.bind(this) : null;

	this.source.buffer = this.bufferList[index];             	/** tell the source which sound to play 								*/
	this.source.connect(this.context.destination);       		/** connect the source to the context's destination (the speakers) 		*/
	this.source.start(0);                           			/** play the source now 												*/
																/** note: on older systems, may have to use deprecated noteOn(time); 	*/

	this.currentIndex = index;									/** update curent index 												*/
	this.status = 'play';										/** update current status to 'play'										*/
};

Sound.prototype.loop = function (index) {
	this.play(index, true);
};

Sound.prototype.getCurrentTime = function () {
	return this.currentTime;
};

Sound.prototype.getSampleRate = function () {
	return this.bufferList[this.currentIndex].sampleRate;
};

Sound.prototype.getDataLength = function () {
	return this.bufferList[this.currentIndex].length;
};

Sound.prototype.getBufferData = function (constraint, sample) {
	const originalData = this.bufferList[this.currentIndex].getChannelData(0);
	const returnData = [];

	for (let i = 0; i < originalData.length; i += sample) {
		returnData.push({ pcmData: originalData[i], fill: !constraint(i) ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 1)'});
	}

	return returnData;	
};
