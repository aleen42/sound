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

const debugMode = true;
/** overidden console.log */
if (!debugMode) {
	console = {
		log: function () {}
	};
}

const Sound = module.exports = function (list) {
	/** @type {[type]} [a list of songs with their name] */
	this.songList = _.isArray(list) ? list.map((item) => { return Common.extractTitle(item); }) : Comon.extractTitle(list);

	/** init a Sound instance with its location */
	this.url = list;

	/** @type {[type]} [Audio Context Object] */
	this.context = null;

	/** @type {[type]} [Audio Analyser between the source and the destination] */
	this.analyser = null;

	/** @type {[type]} [onload function will be called when loading successfully] */
	this.loadEvent = null;

	/** @type {[type]} [onloaded function will be called when loading has been completed] */
	this.loadedEvent = null;

	/** @type {[type]} [ondecoded function will be called when all loading sources has been decoded] */
	this.decodedEvent = null;

	/** @type {[type]} [onended function will be called when a song has been ended] */
	this.endedEvent = null;

	/** @type {[type]} [onplaying function will be called when a song is playing] */
	this.playingEvent = null;

	/** @type {[type]} [onplayed function will be called when a song is played] */
	this.playedEvent = null;

	/** @type {[type]} [onfirstplayed function will be called when the player first played] */
	this.firstPlayedEvent = null;

	/** @type {[type]} [onprogress function will be called when a source is loading] */
	this.progressEvent = null;

	/** @type {Array} [a list of buffer] */
	this.bufferList = [];

	/** @type {[type]} [a sound source] */
	this.source = null;

	/** @type {Number} [current playing which song] */
	this.currentIndex = 0;

	/** @type {Number} [start time of song] */
	this.startTime = 0.0;
	this.startContextTime = 0.0;

	this.pauseOffset = 0;

	/** @type {Array} [thread of tracking] */
	// this.startTrackings = [null, null];

	/** @type {Boolean} [whether loop] */
	this.isLoop = false;

	/** @type {String} [3 types of status: play, paused, stop] */
	this.status = 'stop';

	/** @type {[type]} [a buffer loader object] */
	this.bufferLoader = null;

	/** @type {Array} [for storing wave data of a song] */
	this.waveData = [];

	/** [stopSource: clear sources when a source has been stopped] */
	this.stopSource = function (isPause) {
		if (this.source !== null) {
			if (isPause) {
				this.status = 'pause';										/** update current status to 'pause'									*/
				this.source.onended = null;									/** clear source ended function 										*/
			} else {
				this.status = 'stop';										/** update current status to 'stop'										*/
			}

			this.source.stop();												/** clear source node 													*/
		}

		if (!isPause) {
			this.endedEvent();												/** calling ended event 												*/
		}

		/** another way of what requestAnimationFrame has done */
		// const curretTrackingThreadIndex = (this.startTrackings.indexOf(null) + 1) % this.startTrackings.length;
		// setTimeout(function () {											/** try to use another thread to kill startTracking thread				*/
		// 	clearInterval(this.startTrackings[curretTrackingThreadIndex]);	/** clear tracking time interval object for playingEvent				*/
		// 	this.startTrackings[curretTrackingThreadIndex] = null;
		// }.bind(this), 500);
	}.bind(this);

	/** initialize context object */
	try {
		/** fixed up for prefixing */
		window.AudioContext = window.AudioContext || window.webkitAudioContext;

		this.context = new AudioContext();
		this.analyser = this.context.createAnalyser();
		this.startContextTime = new Date();
	} catch (e) {
		/** catch error */
		Common.errorPrint('Failed to create AudioContext');
	}
};

Sound.prototype.init = function () {
	/** Sound Init */
	console.log('Sound Init');

	if (!_.isArray(this.url)) {
		/** only load one source from an url */
		/** initialize audio object with arrayBuffer type */
		let request = new XMLHttpRequest();
		request.open('GET', this.url, true);
		request.responseType = 'arraybuffer';

		request.addEventListener('pogress', function (evt) {
        	if (evt.lengthComputable) {
				this.progressEvent(evt.loaded / evt.total * 0.7 * 100 + '%');
			}
		}, false);

		/** Decode asynchronously */
		request.onload = function() {
			console.log('Source has been loaded');

			this.context.decodeAudioData(request.response, function (buffer) {
				console.log('Source has been decoded');
				
				this.bufferList.push({
					title: Common.extractTitle(this.url),
					buffer: buffer
				});

				this.progressEvent(evt.loaded / evt.total * 1.0 * 100 + '%');

				if (this.loadEvent) {
					this.loadEvent();
				}

				if (this.decodedEvent) {
					this.decodedEvent();
				}
			}.bind(this), function () {
				/** catch error */
				Common.errorPrint('Failed to get buffer from this url');
			});
		}.bind(this);

		request.send();
	} else {
		this.bufferLoader = new BufferLoader(this.context, this.url, function (bufferList) {
			this.bufferList = bufferList;

			/** Loaded */
			console.log('Buffer has been loaded');

			if (this.loadEvent) {
				this.loadEvent();
			}

			if (this.decodedEvent) {
				this.decodedEvent();
			}

			/** clear loadEvent once it's called */
			this.loadEvent = null;
		}.bind(this), this.bufferList, this.progressEvent)
			.load(this.currentIndex);
	}

	return this;
};

/**
 *
 *
 * event handler
 *
 *
 */
Sound.prototype.bindEvent = function (obj, callback) {
	if (obj === null) {
		return callback;
	} else {
		return function () {
			obj();
			callback();
		};
	}
}

Sound.prototype.onload = function (callback) {
	this.loadEvent = this.bindEvent(this.loadEvent, callback);
	return this;
};

Sound.prototype.onloaded = function (callback) {
	this.loadedEvent = this.bindEvent(this.loadedEvent, callback);
	return this;
};

Sound.prototype.ondecoded = function (callback) {
	this.decodedEvent = this.bindEvent(this.decodedEvent, callback);
	return this;
};

Sound.prototype.onprogress = function (callback) {
	this.progressEvent = this.bindEvent(this.progressEvent, callback);
	return this;
};

Sound.prototype.onplayed = function (callback) {
	this.playedEvent = this.bindEvent(this.playedEvent, callback);
	return this;
};

Sound.prototype.onfirstplayed = function (callback) {
	this.firstPlayedEvent = this.bindEvent(this.firstPlayedEvent, callback);
	return this;
};

Sound.prototype.onended = function (callback) {
	this.endedEvent = this.bindEvent(this.endedEvent, callback);
	return this;
};

Sound.prototype.onplaying = function (callback) {
	this.playingEvent = this.bindEvent(this.playingEvent, callback);
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

Sound.prototype.pause = function () {
	this.pauseOffset = this.getCurrentTime();
	this.stopSource(true);
};

Sound.prototype.resume = function () {
	this.play(false, false);
	this.pauseOffset = 0;
};

Sound.prototype.play = function (isJump, isFirst) {
	isJump = isJump || false;
	isFirst = isFirst || false;

	if (typeof this.bufferList[this.currentIndex] == 'undefined') {
		Common.errorPrint('Failed to play this song');
		return;
	}

	if (isJump && this.source.onended != null) {
		this.source.onended = null;
	}

	this.stopSource(false);													/** stop and clear source firstly										*/

	this.source = this.context.createBufferSource();						/** create a sound source 												*/

	this.source.onended = this.isLoop ? this.next.bind(this) : null;		/** set ended event listner for loop playing							*/

	this.source.buffer = this.bufferList[this.currentIndex].buffer;     	/** tell the source which sound to play 								*/

	/**
	 * source -> analyser
	 * 		  -> destination
	 */
	/** adding a analyser between the source and the destination */
	this.source.connect(this.analyser);
	this.source.connect(this.context.destination);							/** connect the source to the context's destination (the speakers) 		*/

	this.source.start(0, this.pauseOffset);            						/** play the source now 												*/
																			/** note: on older systems, may have to use deprecated noteOn(time); 	*/
	/** refresh startTime */																			
	this.startTime = new Date(new Date().valueOf() - this.pauseOffset * 1000);
	this.status = 'play';													/** update current status to 'play'										*/

	if (this.playingEvent) {
		/** another way of what requestAnimationFrame has done */
		// this.startTrackings[this.startTrackings.indexOf(null)] = setInterval(this.playingEvent, 20);
		const playingUpdate = function () {
			if (this.status === 'play') {
				/** pass current index, current time */
				this.playingEvent(this.getCurrentTime() * this.getSampleRate(), this.getCurrentTime());

				/** use requestAnimationFrame to calling playing event */
				requestAnimationFrame(playingUpdate);
			}
		}.bind(this);

		requestAnimationFrame(playingUpdate);
	}

	if (this.playedEvent) {
		this.playedEvent();
	}

	if (this.firstPlayedEvent && isFirst) {
		/** has only load less than 3 songs at the first time */
		this.firstPlayedEvent();
	}

	console.log('Status: Played');
};

Sound.prototype.loop = function () {
	/** set loop property */
	this.isLoop = true;
	this.play(false, true);
};

Sound.prototype.prev = function () {
	const nextIndex = this.currentIndex === 0 ? this.currentIndex + this.songList.length - 1 : this.currentIndex - 1;
	this.jump(nextIndex);
};

Sound.prototype.next = function () {
	const nextIndex = (this.currentIndex + 1) % this.songList.length;
	this.jump(nextIndex);
};

Sound.prototype.jump = function (index) {
	this.loadEvent = function () {
		this.set(index);
		
		if (this.loadedEvent) {
			this.loadedEvent();
		}

		this.play(true, false);
	}.bind(this);

	this.bufferLoader.load(index);
};

/**
 *
 *
 * beat operations
 *
 */

Sound.prototype.summarize = function (data, pixels) {
	let pixelLength = Math.round(data.length/pixels);
	let vals = [];

	/** For each pixel we display */
	for (let i = 0; i < pixels; i++) {
		let posSum = 0,
		negSum = 0;

		/** Cycle through the data-points relevant to the pixel */
		for (let j = 0; j < pixelLength; j++) {
			let val = data[ i * pixelLength + j ];

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

Sound.prototype.getList = function () {
	return this.songList;
};

Sound.prototype.getCurrentIndex = function () {
	return this.currentIndex;
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

Sound.prototype.getOscilloscopeData = function (pixels, type) {
	type = type || 'byte';

	this.analyser.fftSize = pixels;
	this.analyser.maxDecibels = 10;

	let bufferLength = 0;
	let dataArray = [];

	const returnData = [];
	const filterData = [];

	/** filter frequency data */
	const periods = [
		// [0.1, 0.2],
		// [0.3, 0.4],
		// [0.6, 0.7],
		// [0.8, 0.9]
		[0, 1]
	];

	switch (type) {
	case 'byte':
		bufferLength = this.analyser.frequencyBinCount;
		dataArray = new Uint8Array(bufferLength);
		this.analyser.getByteFrequencyData(dataArray);
			
		for (let period = 0; period < periods.length; period++) {
			for (let i = parseInt(periods[period][0] * dataArray.length); i < parseInt(periods[period][1] * dataArray.length); i += 1) {
				if (typeof dataArray[i] !== 'undefined') {
					filterData.push(dataArray[i]);
				}
			}
		}

		break;
	case 'float':
		bufferLength = this.analyser.frequencyBinCount;
		dataArray = new Float32Array(bufferLength);
		this.analyser.getFloatFrequencyData(dataArray);

		const min = Math.min(...dataArray);

		for (let period = 0; period < periods.length; period++) {
			for (let i = parseInt(periods[period][0] * dataArray.length); i < parseInt(periods[period][1] * dataArray.length); i += 1) {
				filterData.push((dataArray[i] - min) * 2);
			}
		}
		break;
	default:
		break;
	}

	/** consider gain */
	// const currentItem = Math.floor((this.getCurrentTime() * this.getSampleRate() / this.getDataLength()) * this.waveData.length);
	// const maxWave = Math.max(...this.waveData);

	/** get the max value */
	const max = Math.max(...filterData);

	for (let i = 0; i < filterData.length; i++) {
		returnData.push({ value: typeof filterData[i] === 'undefined' || _.isNaN(filterData[i]) ? 0 : filterData[i] });
		// returnData.push({ value: (max === 0 || typeof filterData[i] === 'undefined' || _.isNaN(filterData[i]) || _.isNaN(max)) ? 0 : filterData[i] / max });
	}

	return returnData;
};

Sound.prototype.getWaveData = function (pixels) {
	this.waveData = this.summarize(this.bufferList[this.currentIndex].buffer.getChannelData(0), pixels)
						.map(function (wave, i) {
							return wave[1];
						});

	const returnData = [];

	for (let i = 0; i < this.waveData.length; i += 1) {
		returnData.push({ value: this.waveData[i], fill: 'rgba(0, 0, 0, 0.1)' });
	}

	return returnData;
};
