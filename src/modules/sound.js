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
 *      - Update Time: Nov 26th, 2018
 *
 *
 **********************************************************************/

import Common from './common';
import BufferLoader from './bufferLoader';

const debugMode = false;

/** override console.log */
if (!debugMode) {
    console = {
        log: function () {
        }
    };
}

export default class Sound {
    constructor(list) {
        const self = this;
        /** @type {[type]} [a list of songs with their name] */
        self.titles = list.map(item => Common.extractTitle(item[0]));

        /** init a Sound instance with its location */
        self.url = list.map(item => item[1]);

        /** @type {[type]} [Audio Context Object] */
        self.context = null;

        /** @type {[type]} [Audio filter between the source and the analyser] */
        self.filter = null;

        /** @type {[type]} [Audio Analyser to generate oscilloscope] */
        self.analyser = null;

        /** @type {[type]} [onload function will be called when loading successfully] */
        self.loadEvent = null;

        /** @type {[type]} [onloaded function will be called when loading has been completed] */
        self.loadedEvent = null;

        /** @type {[type]} [ondecoded function will be called when all loading sources has been decoded] */
        self.decodedEvent = null;

        /** @type {[type]} [onended function will be called when a song has been ended] */
        self.endedEvent = null;

        /** @type {[type]} [onplaying function will be called when a song is playing] */
        self.playingEvent = null;

        /** @type {[type]} [onplayed function will be called when a song is played] */
        self.playedEvent = null;

        /** @type {[type]} [onfirstplayed function will be called when the player first played] */
        self.firstPlayedEvent = null;

        /** @type {[type]} [onprogress function will be called when a source is loading] */
        self.progressEvent = null;

        /** @type {Array} [a list of buffer] */
        self.bufferList = [];

        /** @type {[type]} [a sound source] */
        self.source = null;

        /** @type {Number} [current playing which song] */
        self.currentIndex = 0;

        /** @type {Number} [start time of song] */
        self.startTime = 0.0;
        self.startContextTime = 0.0;

        self.pauseOffset = 0;

        /** @type {Array} [thread of tracking] */
        // self.startTrackings = [null, null];

        /** @type {Boolean} [whether loop] */
        self.isLoop = false;

        /** @type {String} [3 types of status: play, paused, stop] */
        self.status = 'stop';

        /** @type {[type]} [a buffer loader object] */
        self.bufferLoader = null;

        /** @type {Array} [for storing wave data of a song] */
        self.waveData = [];

        /** [stopSource: clear sources when a source has been stopped] */
        self.stopSource = isPause => {
            if (self.source !== null) {
                if (isPause) {
                    self.status = 'pause';
                    /** update current status to 'pause'                                    */
                    self.source.onended = null;
                    /** clear source ended function                                        */
                } else {
                    self.status = 'stop';
                    /** update current status to 'stop'                                        */
                }

                self.source.stop();
                /** clear source node                                                    */
            }

            if (!isPause) {
                self.endedEvent();
                /** calling ended event                                                */
            }

            self.startTime = new Date();
        };

        /** initialize context object */
        try {
            /** fixed up for prefixing */
            window.AudioContext = window.AudioContext || window.webkitAudioContext;

            self.context = new AudioContext();
            self.analyser = self.context.createAnalyser();
            self.startContextTime = new Date();
        } catch (e) {
            /** catch error */
            Common.errorPrint('Failed to create AudioContext');
        }

        return self;
    }

    /**
     * Sound Initialization
     * @returns {Sound}
     */
    init() {
        const self = this;
        console.log('Sound Init');

        self.bufferLoader = new BufferLoader(self.context, [self.url, self.titles], bufferList => {
            self.bufferList = bufferList;

            /** Loaded */
            console.log('Buffer has been loaded');

            self.loadEvent && self.loadEvent();
            self.decodedEvent && self.decodedEvent();

            /** clear loadEvent once it's called */
            self.loadEvent = null;
        }, self.bufferList, self.progressEvent).load(self.currentIndex);
        return self;
    }

    /**
     * @private
     * @param obj
     * @param callback
     * @returns {Function}
     */
    _bindEvent(obj, callback) {
        return (obj === null ? callback : () => {
            obj();
            callback();
        });
    }

    /** events */
    onload(callback) {
        const self = this;
        self.loadEvent = self._bindEvent(self.loadEvent, callback);
        return self;
    }

    onloaded(callback) {
        const self = this;
        self.loadedEvent = self._bindEvent(self.loadedEvent, callback);
        return self;
    }

    ondecoded(callback) {
        const self = this;
        self.decodedEvent = self._bindEvent(self.decodedEvent, callback);
        return self;
    }

    onprogress(callback) {
        const self = this;
        self.progressEvent = self._bindEvent(self.progressEvent, callback);
        return self;
    }

    onplayed(callback) {
        const self = this;
        self.playedEvent = self._bindEvent(self.playedEvent, callback);
        return self;
    }

    onfirstplayed(callback) {
        const self = this;
        self.firstPlayedEvent = self._bindEvent(self.firstPlayedEvent, callback);
        return self;
    }

    onended(callback) {
        const self = this;
        self.endedEvent = self._bindEvent(self.endedEvent, callback);
        return self;
    }

    onplaying(callback) {
        const self = this;
        self.playingEvent = self._bindEvent(self.playingEvent, callback);
        return self;
    }

    /** controls */
    set(index) {
        const self = this;
        self.currentIndex = index;
        return self;
    }

    pause() {
        const self = this;
        self.pauseOffset = self.getCurrentTime();
        self.stopSource(true);
    }

    resume() {
        const self = this;
        self.play(false, false);
        self.pauseOffset = 0;
    }

    play(isJump = false, isFirst = false) {
        const self = this;

        if (!self.bufferList[self.currentIndex]) {
            Common.errorPrint('Failed to play this song');
            return;
        }

        if (isJump && self.source.onended != null) {
            self.source.onended = null;
        }

        /** stop and clear source firstly */
        self.stopSource(false);

        /** create a sound source */
        self.source = self.context.createBufferSource();

        /** set ended event listener for loop playing */
        self.source.onended = self.isLoop ? self.next.bind(self) : null;

        /** tell the source which sound to play */
        self.source.buffer = self.bufferList[self.currentIndex].buffer;

        /**
         * source -> filter -> analyser
         *          -> destination
         */
        /** adding a analyser between the source and the destination */
        self.filter = self.context.createBiquadFilter();
        self.filter.type = 'bandpass';

        self.source.connect(self.filter);
        self.filter.connect(self.analyser);

        self.source.connect(self.context.destination);
        /** connect the source to the context's destination (the speakers)        */

        self.source.start(0, self.pauseOffset);
        /** play the source now                                                */
        /** note: on older systems, may have to use deprecated noteOn(time);    */
        /** refresh startTime */
        self.startTime = new Date(new Date().valueOf() - self.pauseOffset * 1000);
        self.status = 'play';
        /** update current status to 'play'                                        */

        if (self.playingEvent) {
            /** another way of what requestAnimationFrame has done */
                // self.startTrackings[self.startTrackings.indexOf(null)] = setInterval(self.playingEvent, 20);
            const _playingUpdate = () => {
                    if (self.status === 'play') {
                        /** pass current index, current time */
                        self.playingEvent(self.getCurrentTime() * self.getSampleRate(), self.getCurrentTime());

                        /** use requestAnimationFrame to calling playing event */
                        requestAnimationFrame(_playingUpdate);
                    }
                };

            requestAnimationFrame(_playingUpdate);
        }

        self.playedEvent && self.playedEvent();
        /** has only load less than 3 songs at the first time */
        self.firstPlayedEvent && isFirst && self.firstPlayedEvent();

        console.log('Status: Played');
    }

    loop() {
        const self = this;
        /** set loop property */
        self.isLoop = true;
        self.play(false, true);
    }

    prev() {
        const self = this;
        self.pauseOffset = 0;

        const nextIndex = self.currentIndex === 0 ? self.currentIndex + self.titles.length - 1 : self.currentIndex - 1;
        self.jump(nextIndex);
    }

    next() {
        const self = this;
        self.pauseOffset = 0;

        const nextIndex = (self.currentIndex + 1) % self.titles.length;
        self.jump(nextIndex);
    }

    jump(index) {
        const self = this;
        self.pauseOffset = 0;

        self.loadEvent = () => {
            self.set(index);
            self.loadedEvent && self.loadedEvent();
            self.play(true, false);
        };

        self.bufferLoader.load(index);
    }

    /** beat operations */
    setFilterType(type) {
        this.filter.type = type;
    }

    /** getter */
    getTitle() {
        return this.bufferList[this.currentIndex].title;
    }

    getList() {
        return this.titles;
    }

    getCurrentIndex() {
        return this.currentIndex;
    }

    getCurrentTime() {
        return (this.startTime === 0.0) ? 0 : (this.context.currentTime - (this.startTime - this.startContextTime) / 1000);
    }

    getSampleRate() {
        return this.bufferList[this.currentIndex].buffer.sampleRate;
    }

    getDataLength() {
        return this.bufferList[this.currentIndex].buffer.length;
    }

    getChannelData(index) {
        return this.bufferList[this.currentIndex].buffer.getChannelData(index);
    }

    getOscilloscopeData(pixels, type = 'byte') {
        const self = this;
        self.analyser.fftSize = pixels;
        self.analyser.maxDecibels = 15;

        let dataArray;

        let filterData;

        /** filter frequency data */
        const periods = [
            // [0.1, 0.2],
            // [0.3, 0.4],
            // [0.6, 0.7],
            // [0.8, 0.9]
            [0.1, 1]
        ];

        const bufferLength = self.analyser.frequencyBinCount;

        switch (type) {
            case 'byte':
                dataArray = new Uint8Array(bufferLength);
                self.analyser.getByteFrequencyData(dataArray);

                filterData = periods.reduce((arr, period) => {
                    const len = dataArray.length;
                    const [up, down] = [parseInt(period[0] * len), parseInt(period[1] * len)];
                    return arr.concat([...dataArray].filter((item, index) => item !== void 0 && index >= up && index < down));
                }, []);
                break;
            case 'float':
                dataArray = new Float32Array(bufferLength);
                self.analyser.getFloatFrequencyData(dataArray);

                const min = Math.min(...dataArray);

                filterData = periods.reduce((arr, period) => {
                    const len = dataArray.length;
                    const [up, down] = [parseInt(period[0] * len), parseInt(period[1] * len)];
                    return arr.concat([...dataArray].filter((item, index) => item !== void 0 && index >= up && index < down)
                        .map(data => data - min));
                }, []);
                break;
            default:
                break;
        }

        /** consider gain */
        // const currentItem = Math.floor((this.getCurrentTime() * this.getSampleRate() / this.getDataLength()) * this.waveData.length);
        // const maxWave = Math.max(...this.waveData);

        return filterData.map(data => ({value: data || 0}));
    }

    getWaveData(pixels) {
        const self = this;
        const _summarize = (data, pixels) => {
            let pixelLength = Math.round(data.length / pixels);
            let values = [];

            /** For each pixel we display */
            for (let i = 0; i < pixels; i++) {
                let posSum = 0,
                    negSum = 0;

                /** Cycle through the data-points relevant to the pixel */
                for (let j = 0; j < pixelLength; j++) {
                    let val = data[i * pixelLength + j];

                    /** Keep track of positive and negative values separately */
                    if (val > 0) {
                        posSum += val;
                    } else {
                        negSum += val;
                    }
                }

                values.push([negSum / pixelLength, posSum / pixelLength]);
            }

            return values;
        };

        self.waveData = _summarize(self.bufferList[self.currentIndex].buffer.getChannelData(0), pixels).map((wave) => wave[1]);
        return self.waveData.map(data => ({value: data, fill: 'rgba(0, 0, 0, 0.1)'}));
    }
}
