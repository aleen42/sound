import Common from './common';

import AV from 'av';
import'./flac.js';

const BufferLoader = module.exports = function (context, urlList, callback, bufferList, progressEvent) {
    this.context = context;
    this.urlList = urlList;
    this.onload = callback;
    this.bufferList = bufferList;

    this.waitIndex = 0;
    this.prevIndex = 0;
    this.nextIndex = 0;

    /** @type {Number} [the ratio that the process of loading files divided by the whole process] */
    this.loadRatio = 0.7;

    /** @type {[type]} [set loading progress event] */
    this.onprogress = progressEvent;

    /** @type {Number} [how many elements in the array percents] */
    this.percentsLength = 0;

    /** @type {Array} [for storing progress of certain requests] */
    this.percents = [];
}

BufferLoader.prototype.loadBuffer = function(url, index) {
    /** Load buffer asynchronously */
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

    const calcProgress = function (value) {
        this.percents[index] = value;

        const percent = (this.percents.reduce(function (pv, cv) {
            return pv + cv;
        }, 0)) / this.percentsLength * 100 + '%';

        this.onprogress(percent);
    }.bind(this);

    request.onprogress = function (evt) {
        /** file loading progress update */
        if (evt.lengthComputable) {
            calcProgress(evt.loaded / evt.total * this.loadRatio);
        }
    }.bind(this);

    request.onload = function () {
        console.log('Source ' + index + ' has been loaded');

        if (url.substr(-4).toLowerCase() === '.mp3') {
            /** Asynchronously decode the audio file data in request.response */
            this.context.decodeAudioData(request.response, function (buffer) {
                console.log('Source ' + index + ' has been decoded');

                /** audio decoding progress update */
                calcProgress(1.0);

                /** check whether buffer can be decoded */
                if (!buffer) {
                    alert('error decoding file data: ' + url);
                    return;
                }
                
                this.bufferList[index] = {
                    title: Common.extractTitle(url),
                    buffer: buffer
                };

                if (typeof this.bufferList[this.waitIndex] != 'undefined' && typeof this.bufferList[this.prevIndex] != 'undefined' && typeof this.bufferList[this.nextIndex] != 'undefined') {
                    this.onload(this.bufferList);
                }
            }.bind(this), function (error) {
                console.error('decodeAudioData error', error);
            });    
        }

        if (url.substr(-5).toLowerCase() === '.flac') {
            /** Decoding Flac files with AV */
            const asset = AV.Asset.fromBuffer(request.response);

            asset.decodeToBuffer(function(buffer) {
                /** check whether buffer can be decoded */
                if (!buffer) {
                    alert('error decoding file data: ' + url);
                    return;
                }

                var channels = asset.format.channelsPerFrame;
                var samples = buffer.length/channels;
                var audioBuf = this.context.createBuffer(channels, samples, asset.format.sampleRate);
                var audioChans = [];

                for(var i = 0; i < channels; i++) {
                    audioChans.push(audioBuf.getChannelData(i));
                }

                for(var i = 0; i < buffer.length; i++) {
                    audioChans[i % channels][Math.round(i/channels)] = buffer[i];
                }

                // Do something with your fancy new audioBuffer
                this.bufferList[index] = {
                    title: Common.extractTitle(url),
                    buffer: audioBuf
                };

                if (typeof this.bufferList[this.waitIndex] != 'undefined' && typeof this.bufferList[this.prevIndex] != 'undefined' && typeof this.bufferList[this.nextIndex] != 'undefined') {
                    this.onload(this.bufferList);
                }

                console.log('Source ' + index + ' has been decoded');
            }.bind(this));          
        }
    }.bind(this);

    request.onerror = function () {
        alert('BufferLoader: XHR error');
    };

    request.send();
}

BufferLoader.prototype.load = function(index) {
    /** clear */
    this.percentsLength = 0;
    this.percents = [];

    const initPercentArray = function (indexs) {
        /** because this.percents.length will not return a real length of this array */
        var count = 0;

        for (var i = 0; i < indexs.length; i++) {
            if (typeof this.bufferList[indexs[i]] == 'undefined') {
                this.percents[indexs[i]] = 0.0;
                count++;
            }
        }

        this.percentsLength = count;

        /** loop to load buffer */
        for (var i = 0 ; i < indexs.length; i++) {
            if (typeof this.bufferList[indexs[i]] == 'undefined') {
                this.loadBuffer(this.urlList[indexs[i]], indexs[i]);
            }
        }
    }.bind(this);

    /** set waitIndex as index */
    this.waitIndex = index;
    this.prevIndex = index === 0 ? index + this.urlList.length - 1 : index - 1;
    this.nextIndex = (index + 1) % this.urlList.length;

    /** only one songs */
    if (this.prevIndex === this.waitIndex) {
        /** if all already then onload, and return the bufferList */
        if (typeof this.bufferList[this.waitIndex] != 'undefined') {
            this.onload(this.bufferList);
            return this;
        }

        initPercentArray([this.waitIndex]);
        return this;
    }

    /** only two songs */
    if (this.prevIndex === this.nextIndex) {
        /** if all already then onload, and return the bufferList */
        if (typeof this.bufferList[this.prevIndex] != 'undefined' && typeof this.bufferList[this.waitIndex] != 'undefined') {
            this.onload(this.bufferList);
            return this;
        }

        initPercentArray([this.prevIndex, this.waitIndex]);
        return this;
    }

    /** only load current and its prev and next one */
    /** if all already then onload, and return the bufferList */
    if (typeof this.bufferList[this.waitIndex] != 'undefined' && typeof this.bufferList[this.prevIndex] != 'undefined' && typeof this.bufferList[this.nextIndex] != 'undefined') {
        this.onload(this.bufferList);
        return this;
    }

    initPercentArray([this.prevIndex, this.waitIndex, this.nextIndex]);
    return this;
}
