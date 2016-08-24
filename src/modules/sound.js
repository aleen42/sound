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

	/** @type {[type]} [onended function called when a song has been ended] */
	this.endedEvent = null;

	/** @type {[type]} [onplaying function called when a song is playing] */
	this.playingEvent = null;	

	/** @type {Array} [a list of buffer] */
	this.bufferList = [];

	/** @type {[type]} [a sound source] */
	this.source = null;

	/** @type {Number} [current playing which song] */
	this.currentIndex = 0;

	/** @type {Number} [start time of song] */
	this.startTime = 0.0;
	this.startContextTime = 0.0;
	this.startTracking = null;

	/** @type {Boolean} [whether loop] */
	this.isLoop = false;

	/** @type {String} [3 types of status: play, paused, stop] */
	this.status = 'stop';

	/** initialize context object */
	try {
		/** fixed up for prefixing */
		window.AudioContext = window.AudioContext || window.webkitAudioContext;

		this.context = new AudioContext();
		this.startContextTime = new Date();
	} catch (e) {
		/** catch error */
		Common.errorPrint('Failed to create AudioContext');
	}
};

Sound.prototype.onload = function (callback) {
	this.loadEvent = callback;
	return this;
};

Sound.prototype.onended = function (callback) {
	this.endedEvent = callback;
	return this;
};

Sound.prototype.onplaying = function (callback) {
	this.playingEvent = callback;
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
				this.bufferList.push({
					title: Common.extractTitle(this.url),
					buffer: buffer
				});

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
		}.bind(this), function (reservedBufferList) {
			this.bufferList = reservedBufferList;
			this.loadEvent();
		}.bind(this), this.currentIndex)
			.load();
	}

	return this;
};

/**
 *
 *
 * player operations
 * 
 * 
 */
Sound.prototype.set = function (index) {
	this.currentIndex = index;
	return this;
};

Sound.prototype.play = function () {
	if (typeof this.bufferList[this.currentIndex] == 'undefined') {
		Common.errorPrint('Failed to play this song');
		return;
	}

	this.source = this.context.createBufferSource();						/** create a sound source 												*/

	this.source.onended = this.isLoop ? function () {					
		this.status = 'stop';												/** update current status to 'stop'										*/
		clearInterval(this.startTracking);									/** clear tracking time interval object for playingEvent				*/
		this.startTime = new Date();										/** refresh startTime 													*/
		this.set((this.currentIndex + 1) % this.bufferList.length)			/** jump to next song 													*/
			.endedEvent();													/** triger endedEvent 													*/
		this.play();
	}.bind(this) : null;													/** set ended event listner for loop playing							*/

	this.source.buffer = this.bufferList[this.currentIndex].buffer;     	/** tell the source which sound to play 								*/
	this.source.connect(this.context.destination);       					/** connect the source to the context's destination (the speakers) 		*/
	this.source.start(0);                           						/** play the source now 												*/
																			/** note: on older systems, may have to use deprecated noteOn(time); 	*/
	this.startTime = new Date();
	this.status = 'play';													/** update current status to 'play'										*/

	this.startTracking = setInterval(this.playingEvent, 20);
};

Sound.prototype.loop = function () {
	/** set loop property */
	this.isLoop = true;
	this.play();
};

Sound.prototype.prev = function () {
	this.source.onended = null;
	this.source.stop();														/** clear source node 													*/
	this.status = 'stop';													/** update current status to 'stop'										*/
	clearInterval(this.startTracking);										/** clear tracking time interval object for playingEvent				*/
	this.startTime = new Date();											/** refresh startTime 													*/

	if (this.currentIndex === 0) {
		this.set((this.currentIndex + this.bufferList.length - 1) % this.bufferList.length)
			.endedEvent();
		this.play();
	} else {
		this.set((this.currentIndex - 1) % this.bufferList.length)
			.endedEvent();
		this.play();
	}
};

Sound.prototype.next = function () {
	this.source.onended = null;
	this.source.stop();														/** clear source node 													*/
	this.status = 'stop';													/** update current status to 'stop'										*/
	clearInterval(this.startTracking);										/** clear tracking time interval object for playingEvent				*/
	this.startTime = new Date();											/** refresh startTime 													*/

	this.set((this.currentIndex + 1) % this.bufferList.length)
		.endedEvent();
	this.play();
};

/**
 *
 *
 * beat operations
 * 
 */

Sound.prototype.summarize = function (data, pixels) {
	var pixelLength = Math.round(data.length/pixels);
	var vals = [];

	/** For each pixel we display */
	for (var i = 0; i < pixels; i++) {
		var posSum = 0,
		negSum = 0;

		/** Cycle through the data-points relevant to the pixel */
		for (var j = 0; j < pixelLength; j++) {
			var val = data[ i * pixelLength + j ];

			/** Keep track of positive and negative values separately */
			if (val > 0) {
				posSum += val;
			} else {
				negSum += val;
			}
		}

		vals.push( [ negSum / pixelLength, posSum / pixelLength ] );
	}
	
	return vals;
}

/**
 *
 * 
 * get operations
 *
 * 
 */

Sound.prototype.getTitle = function () {
	return this.bufferList[this.currentIndex].title;
};

Sound.prototype.getCurrentTime = function () {
	return (this.startTime === 0.0) ? 0 : (this.context.currentTime - (this.startTime - this.startContextTime) / 1000);
};

Sound.prototype.getSampleRate = function () {
	return this.bufferList[this.currentIndex].buffer.sampleRate;
};

Sound.prototype.getDataLength = function () {
	return this.bufferList[this.currentIndex].buffer.length;
};

Sound.prototype.getChannelData = function (index) {
	return this.bufferList[this.currentIndex].buffer.getChannelData(index);
};

Sound.prototype.getBufferData = function (pixels) {
	const waveData = this.summarize(this.bufferList[this.currentIndex].buffer.getChannelData(0), pixels);
	const returnData = [];

	for (let i = 0; i < waveData.length; i += 1) {
		returnData.push({ pcmData: waveData[i][1], fill: 'rgba(0, 0, 0, 0.1)'});
	}

	return returnData;	
};
