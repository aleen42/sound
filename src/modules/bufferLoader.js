import AV from 'av';
import 'flac.js';

let [waitIndex, prevIndex, nextIndex] = [0, 0, 0];

export default class BufferLoader {
    constructor(context, [urlList, titles], callback, bufferList, progressEvent) {
        const self = this;

        self.context = context;
        self.urlList = urlList;
        self.titles = titles;
        self.onload = callback;
        self.bufferList = bufferList;

        /** @type {Number} [the ratio that the process of loading files divided by the whole process] */
        self.loadRatio = 0.7;

        /** @type {[type]} [set loading progress event] */
        self.onprogress = progressEvent;

        /** @type {Number} [how many elements in the array percents] */
        self.percentsLength = 0;

        /** @type {Array} [for storing progress of certain requests] */
        self.percents = [];

        return self;
    }

    /**
     * private function for buffer loading
     * @private
     * @param url
     * @param index
     */
    _loadBuffer(url, index) {
        const self = this;
        /** Load buffer asynchronously */
        const request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';

        const _calcProgress = value => {
            self.percents[index] = value;
            self.onprogress(`${(self.percents.reduce((pv, cv) => pv + cv, 0)) / self.percentsLength * 100}%`);
        };

        request.onprogress = evt => {
            /** file loading progress update */
            evt.lengthComputable && _calcProgress(evt.loaded / evt.total * self.loadRatio);
        };

        request.onload = () => {
            console.log('Source ' + index + ' has been loaded');

            if (/\.mp3$/gi.test(url)) {
                /** Asynchronously decode the audio file data in request.response */
                self.context.decodeAudioData(request.response, buffer => {
                    console.log('Source ' + index + ' has been decoded');

                    /** audio decoding progress update */
                    _calcProgress(1.0);

                    /** check whether buffer can be decoded */
                    if (!buffer) {
                        alert('error decoding file data: ' + url);
                        return;
                    }

                    self.bufferList[index] = {
                        title: self.titles[index],
                        buffer: buffer
                    };

                    self.bufferList[waitIndex] && self.bufferList[prevIndex] && self.bufferList[nextIndex]
                    && self.onload(self.bufferList);
                }, error => console.log('decodeAudioData error', error));
            } else if (/\.flac$/gi.test(url)) {
                /** Decoding Flac files with AV */
                const asset = AV.Asset.fromBuffer(request.response);

                asset.decodeToBuffer(buffer => {
                    /** check whether buffer can be decoded */
                    if (!buffer) {
                        alert('error decoding file data: ' + url);
                        return;
                    }

                    const channels = asset.format.channelsPerFrame;
                    const samples = buffer.length / channels;
                    const audioBuf = self.context.createBuffer(channels, samples, asset.format.sampleRate);

                    let j = 0;
                    const audioChannels = [...Array(channels)].map((empty, index) => audioBuf.getChannelData(index));
                    buffer.forEach((item, index) => {
                        audioChannels[index % channels][Math.round(index / channels)] = item;
                    });

                    /** Do something with your fancy new audioBuffer */
                    self.bufferList[index] = {
                        title: self.titles[index],
                        buffer: audioBuf
                    };

                    self.bufferList[waitIndex] && self.bufferList[prevIndex] && self.bufferList[nextIndex]
                    && self.onload(self.bufferList);

                    console.log('Source ' + index + ' has been decoded');
                });
            }
        };

        request.onerror = alert.bind(self, 'BufferLoader: XHR error');
        request.send();
    }

    /**
     * public function for buffer loading
     * @param index
     * @returns {BufferLoader}
     */
    load(index) {
        const self = this;

        /** clear */
        self.percentsLength = 0;
        self.percents = [];

        const _initPercentArray = indexes => {
            /** because self.percents.length will not return a real length of self array */
            let count = 0;

            /** loop to load buffer */
            indexes.forEach(item => {
                if (!self.bufferList[item]) {
                    self.percents[item] = 0.0;
                    count++;
                    self._loadBuffer(self.urlList[item], item);
                }
            });

            self.percentsLength = count;
        };

        /** set waitIndex as index */
        [waitIndex, prevIndex, nextIndex] = [
            index,
            index === 0 ? index + self.urlList.length - 1 : index - 1,
            (index + 1) % self.urlList.length,
        ];

        /** only one songs */
        if (prevIndex === waitIndex) {
            /** if all already then onLoad, and return the bufferList */
            if (self.bufferList[waitIndex]) {
                self.onload(self.bufferList);
                return self;
            }

            _initPercentArray([waitIndex]);
            return self;
        }

        /** only two songs */
        if (prevIndex === nextIndex) {
            /** if all already then onLoad, and return the bufferList */
            if (self.bufferList[prevIndex] && self.bufferList[waitIndex]) {
                self.onload(self.bufferList);
                return self;
            }

            _initPercentArray([prevIndex, waitIndex]);
            return self;
        }

        /** only load current and its prev and next one */
        /** if all already then onLoad, and return the bufferList */
        if (self.bufferList[waitIndex] && self.bufferList[prevIndex] && self.bufferList[nextIndex]) {
            self.onload(self.bufferList);
            return self;
        }

        _initPercentArray([prevIndex, waitIndex, nextIndex]);
        return self;
    }
};
