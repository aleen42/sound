import React from 'react';

/** Style */
import styles from './player.css';

/** Components */
import { Wave } from './wave/wave.jsx';
import { Oscilloscope } from './oscilloscope/oscilloscope.jsx';
import { List } from './list/list.jsx';


export class Player extends React.Component {
	constructor(props) {
		super(props);

		this.prev = this.prev.bind(this);
		this.next = this.next.bind(this);

		this.state = {
			activeIndex: this.props.setIndex
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
		this.loadingUp();

		/** try to avoid blocking UI thread */
		setTimeout(function() {
			this.props.soundObject.prev();
		}.bind(this), 500);
	}

	next() {
		this.loadingUp();

		/** try to avoid blocking UI thread */
		setTimeout(function() {
			this.props.soundObject.next();
		}.bind(this), 500);
	}

	updateTime(time) {
		this.refs.wave__time.children[1].innerText = time;
	}

	updateTitle(title) {
		this.refs.wave__title.children[1].innerText = title;
	}

	componentDidMount() {
		console.log('Player Mounted');

		/** play when component mount */
		this.updateTitle(this.props.soundObject.getTitle());

		this.props.soundObject
			.onended(function () {
				this.loadingUp();

				this.setState({
					activeIndex: this.props.soundObject.getCurrentIndex()
				});
			}.bind(this))
			.onfirstplayed(function () {
				this.loadingDown();

				setTimeout(function () {
					document.querySelectorAll('.cursor__container')[0].style.display = 'block';
					setTimeout(function () {
						document.querySelectorAll('.cursor__container')[0].style.opacity = 1;
					}, 500);
				}, 500);
			}.bind(this))
			.onplayed(function () {
				/** update active item */
				this.updateTitle(this.props.soundObject.getTitle());
				this.loadingDown();
			}.bind(this))
			.onplaying(function (currentIndex, currentTime) {
				/** Time Update */
				if (Math.floor(currentTime) <= Math.floor(this.props.soundObject.getDataLength() / this.props.soundObject.getSampleRate())) {
					this.updateTime(this.formatTime(Math.floor(currentTime)) + ' / ' + this.formatTime(Math.floor(this.props.soundObject.getDataLength() / this.props.soundObject.getSampleRate())));
				} 

				/** Wave Update */
				this.refs.wave.updateWave(currentIndex);

				/** Oscilloscope Update */
				this.refs.oscilloscope.updateOscilloscope();
			}.bind(this))
			.loop();
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
				<div className="wave__wrapper">
					<div className="player__prev" onClick={this.prev}>
						<i className="fa fa-angle-left"></i>
					</div>
					<Wave sound={this.props.soundObject} ref="wave" currentIndex={0} width="100%" height={280} />
					<div className="player__next" onClick={this.next}>
						<i className="fa fa-angle-right"></i>
					</div>
				</div>
				<Oscilloscope ref="oscilloscope" sound={this.props.soundObject} width="100%" height={200} />
				<List sound={this.props.soundObject} activeIndex={this.state.activeIndex} />
			</div>
		);
	}
}
