import React from 'react';

/** Style */
import './player.css';

/** Components */
import { Wave } from './wave/wave.jsx';
import { Oscilloscope } from './oscilloscope/oscilloscope.jsx';
import { List } from './list/list.jsx';

export class Player extends React.Component {
	constructor(props) {
		super(props);

		this.prev = this.prev.bind(this);
		this.next = this.next.bind(this);
		this.pause = this.pause.bind(this);
		this.resume = this.resume.bind(this);

		this.filter = this.filter.bind(this);

		this.state = {
			activeIndex: this.props.setIndex,
			filterType: this.props.filterDefaultType
		};
	}

	formatTime(time) {
		const min = Math.floor(time / 60);
		const sec = Math.floor(time - min * 60);
		return (min < 10 ? '0' + min : min) + ':' + (sec < 10 ? '0' + sec : sec);
	}

	loadingUp() {
		document.querySelectorAll('.loading')[0].style.top = '50%';
	}

	loadingDown() {
		document.querySelectorAll('.loading')[0].style.top = '15%';
	}

	prev() {
        const self = this;
		self.loadingUp();

		/** try to avoid blocking UI thread */
        setTimeout(self.props.soundObject.prev.bind(self.props.soundObject), 500);
	}

	next() {
		const self = this;
		self.loadingUp();

		console.log(self.props.soundObject);
		/** try to avoid blocking UI thread */
		setTimeout(self.props.soundObject.next.bind(self.props.soundObject), 500);
	}

	pause() {
		const self = this;
		console.log('Pause');
		self.props.soundObject.pause();

		const children = this.refs['player__play-pause'].children[0];
		children.removeEventListener('click', this.pause);
        children.setAttribute('class', 'fa fa-play');
        children.addEventListener('click', this.resume);
	}

	filter(e) {
		const self = this;
		self.props.soundObject.setFilterType(e.target.value);
        self.setState({filterType: e.target.value});
	}

	resume() {
		const self = this;
		console.log('Resume');
		self.props.soundObject.resume();

		const children = this.refs['player__play-pause'].children[0];
		children.removeEventListener('click', this.resume);
        children.setAttribute('class', 'fa fa-pause');
        children.addEventListener('click', this.pause);
	}

	updateTime(time) {
		this.refs.wave__time.children[1].innerText = time;
	}

	updateTitle(title) {
		this.refs.wave__title.children[1].innerText = title;
	}

	componentDidUpdate() {
		const children = this.refs['player__play-pause'].children[0];
		/** bind listner of play-pause button */
		children.removeEventListener('click', this.resume);
		children.removeEventListener('click', this.pause);
		children.setAttribute('class', 'fa fa-pause');
		children.addEventListener('click', this.pause);
	}

	componentDidMount() {
		console.log('Player Mounted');

		const self = this;

		/** bind listener of play-pause button */
		const children = self.refs['player__play-pause'].children[0];
        children.setAttribute('class', 'fa fa-pause');
        children.addEventListener('click', self.pause);

		/** play when component mount */
		self.updateTitle(self.props.soundObject.getTitle());

		self.props.soundObject.onended(() => {
			self.loadingUp();

			self.setState({
				activeIndex: self.props.soundObject.getCurrentIndex()
			});
		}).onfirstplayed(() => {
			self.loadingDown();

			setTimeout(() => {
				document.querySelectorAll('.cursor__container')[0].style.display = 'block';
				setTimeout(() => {
					document.querySelectorAll('.cursor__container')[0].style.opacity = 1;
				}, 500);
			}, 500);
		}).onplayed(() => {
			/** update active item */
			self.updateTitle(self.props.soundObject.getTitle());
			self.loadingDown();
		}).onplaying((currentIndex, currentTime) => {
			/** Time Update */
			if (Math.floor(currentTime) <= Math.floor(self.props.soundObject.getDataLength() / self.props.soundObject.getSampleRate())) {
				self.updateTime(self.formatTime(Math.floor(currentTime)) + ' / ' + self.formatTime(Math.floor(self.props.soundObject.getDataLength() / self.props.soundObject.getSampleRate())));
			}

			/** Wave Update */
			self.refs.wave.updateWave(currentIndex);

			/** Oscilloscope Update */
			self.refs.oscilloscope.updateOscilloscope();
		}).loop();
	}

	render() {
		return (
			<div className="player__container">
				<div className="box" ref="wave__time">
					<p className="name">Time</p>
					<p className="value">00:00 / 00:00</p>
				</div>
				<div className="box" ref="wave__title">
					<p className="name">Name</p>
					<p className="value">/</p>
				</div>
				{/*<div className="filters">*/}
					{/*<select onChange={this.filter} value={this.state.filterType}>*/}
						{/*<option value="lowpass">lowpass</option>*/}
						{/*<option value="highpass">highpass</option>*/}
						{/*<option value="bandpass">bandpass</option>*/}
						{/*<option value="lowshelf">lowshelf</option>*/}
						{/*<option value="highshelf">highshelf</option>*/}
						{/*<option value="peaking">peaking</option>*/}
						{/*<option value="notch">notch</option>*/}
						{/*<option value="allpass">allpass</option>*/}
					{/*</select>*/}
				{/*</div>*/}
				<div className="wave__wrapper">
					<div className="player__prev" onClick={this.prev}>
						<i className="fa fa-chevron-left"></i>
					</div>
					<Wave sound={this.props.soundObject} ref="wave" currentIndex={0} width="100%" height={280} />
					<div className="player__next" onClick={this.next}>
						<i className="fa fa-chevron-right"></i>
					</div>

					<div className="player__play-pause" ref="player__play-pause">
						<i className=""></i>
					</div>
				</div>
				<Oscilloscope ref="oscilloscope" sound={this.props.soundObject} width="100%" height={500} />
				<List sound={this.props.soundObject} activeIndex={this.state.activeIndex} />
			</div>
		);
	}
}

Player.defaultProps = {
	filterDefaultType: 'bandpass', /** lowpass, highpass, bandpass, lowshelf, highshelf, peaking, notch, allpass */
};
