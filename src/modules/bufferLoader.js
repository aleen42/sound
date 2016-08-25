import Common from './common';

const BufferLoader = module.exports = function (context, urlList, callback, bufferList) {
    this.context = context;
    this.urlList = urlList;
    this.onload = callback;
    this.bufferList = bufferList;

    this.waitIndex = 0;
    this.prevIndex = 0;
    this.nextIndex = 0;
}

BufferLoader.prototype.loadBuffer = function(url, index) {
    /** if load already, then return  */
    if (typeof this.bufferList[index] != 'undefined') {
        return;
    }

    /** Load buffer asynchronously */
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

    request.onload = function () {
        /** Asynchronously decode the audio file data in request.response */
        this.context.decodeAudioData(request.response, function(buffer) {
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
            }.bind(this),
            function(error) {
                console.error('decodeAudioData error', error);
            }
        );
    }.bind(this);

    request.onerror = function () {
        alert('BufferLoader: XHR error');
    };

    request.send();
}

BufferLoader.prototype.load = function(index) {
    /** set waitIndex as index */
    this.waitIndex = index;
    this.prevIndex = index === 0 ? index + this.urlList.length - 1 : index - 1;
    this.nextIndex = (index + 1) % this.urlList.length;

    /** if all already then onload, and return the bufferList */
    if (typeof this.bufferList[this.waitIndex] != 'undefined' && typeof this.bufferList[this.prevIndex] != 'undefined' && typeof this.bufferList[this.nextIndex] != 'undefined') {
        this.onload(this.bufferList);
        return this;
    }

    /** only one songs */
    if (this.prevIndex === this.waitIndex) {
        this.loadBuffer(this.urlList[this.waitIndex], this.waitIndex);
        return this;
    }

    /** only two songs */
    if (this.prevIndex === this.nextIndex) {
        this.loadBuffer(this.urlList[this.prevIndex], this.prevIndex);
        this.loadBuffer(this.urlList[this.waitIndex], this.waitIndex);
        return this;
    }

    /** only load current and its prev and next one */
    this.loadBuffer(this.urlList[this.prevIndex], this.prevIndex);
    this.loadBuffer(this.urlList[this.waitIndex], this.waitIndex);
    this.loadBuffer(this.urlList[this.nextIndex], this.nextIndex);

    return this;
}
