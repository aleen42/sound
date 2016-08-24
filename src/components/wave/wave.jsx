import React from 'react';
import styles from './wave.css'

export class Wave extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			waveBufferData: this.props.sound.getBufferData(this.props.px)
		};
	}

	getWave() {
		const data = this.state.waveBufferData;
		return data.map(function(elem, index) {
			return <rect key={index} ref={'wave__tag' + index} x={index / data.length * 100 + '%'} y={(this.props.height - elem.pcmData * 1000) / 2 + 'px'} width={1} height={elem.pcmData * 1000 + 'px'} fill={elem.fill}></rect>;
		}.bind(this));
	}

	formatTime(time) {
		const min = Math.floor(time / 60);
		const sec = Math.floor(time - min * 60);
		return (min < 10 ? '0' + min : min) + ':' + (sec < 10 ? '0' + sec : sec);
	}

	prev() {
		this.props.sound.prev();
	}

	next() {
		this.props.sound.next();
	}

	componentDidUpdate() {
		/** [for: clear all wave tag] */
		for (let i = 0; i < this.props.px; i++) {
			this.refs['wave__tag' + i].setAttribute('fill', 'rgba(0, 0, 0, 0.1)');	
		}

		this.props.updateTitle(this.props.sound.getTitle());
	}

	componentDidMount() {
		/** give it 1 sec to render */
		setTimeout(function () {
			/** play when component mount */
			this.props.updateTitle(this.props.sound.getTitle());

			this.refs.wave__container.style.opacity = 1;

			this.props.sound
				.onended(function () {
					this.setState({
						waveBufferData: this.props.sound.getBufferData(this.props.px)
					});
				}.bind(this))
				.onplaying(function () {
					/** Wave Update */
					const item = Math.floor(this.props.sound.getCurrentTime() * (this.props.sound.getSampleRate() / (this.props.sound.getDataLength() / this.props.px)));
					if (typeof this.refs['wave__tag' + item] != 'undefined') {
						/** ensure not jump too fast */
						if (item > 2) {
							this.refs['wave__tag' + (item - 2)].setAttribute('fill', 'rgba(0, 0, 0, 1)');	
						}

						if (item > 1) {
							this.refs['wave__tag' + (item - 1)].setAttribute('fill', 'rgba(0, 0, 0, 1)');	
						}

						this.refs['wave__tag' + item].setAttribute('fill', 'rgba(0, 0, 0, 1)');	
					}

					/** Time Update */
					this.props.updateTime(this.formatTime(Math.floor(this.props.sound.getCurrentTime())) + ' / ' + this.formatTime(Math.floor(this.props.sound.getDataLength() / this.props.sound.getSampleRate())));

					/** Triangle Progress Update */
					this.refs.wave__progress.style.left = this.props.sound.getCurrentTime() / (this.props.sound.getDataLength() / this.props.sound.getSampleRate()) * this.refs.wave__container.clientWidth - 3 + 'px';
				}.bind(this))
				.loop(0);
		}.bind(this), 1000);
	}

	render() {
		return (
			<div className="wave__container" ref="wave__container">
				<div className="player__prev">
					<i className="fa fa-angle-left"></i>
				</div>

				<div className="wave__central_line"></div>
				<svg className="svg__wave" xmlns="http://www.w3.org/2000/svg" width={this.props.width} height={this.props.height}>
						{this.getWave()}
				</svg>
				<div className="wave__progress wave__position-absolute" ref="wave__progress"></div>

				<div className="player__next">
					<i className="fa fa-angle-right"></i>
				</div>
			</div>
		);
	}
}
