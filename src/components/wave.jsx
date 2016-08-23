import React from 'react';

export class Wave extends React.Component {
	constructor(props) {
		super(props);
	}

	getWave() {
		const data = this.props.sound.getBufferData(function (i) {
			return false;
		}, this.props.px);

		return data.map(function(elem, index) {
			return <rect key={index} ref={'wave__tag' + index} x={index / data.length * 100 + '%'} y={(this.props.height - elem.pcmData * 1000) / 2 + 'px'} width={1} height={elem.pcmData * 1000 + 'px'} fill={elem.fill}></rect>;
		}.bind(this));
	}

	formatTime(time) {
		const min = Math.floor(time / 60);
		const sec = Math.floor(time - min * 60);
		return (min < 10 ? '0' + min : min) + ':' + (sec < 10 ? '0' + sec : sec);
	}

	componentDidMount() {
		/** give it 1 sec to render */
		setTimeout(function () {
			/** play when component mount */
			this.refs.wave__container.style.opacity = 1;

			this.props.sound.loop(0);
		}.bind(this), 1000);

		setInterval(function () {
			/** Wave Update */
			this.refs['wave__tag' + Math.floor(this.props.sound.getCurrentTime() * (this.props.sound.getSampleRate() / (this.props.sound.getDataLength() / this.props.px)))].style.fill = 'rgba(0, 0, 0, 1)';

			/** Time Update */
			this.refs.wave__time.innerText = this.formatTime(Math.floor(this.props.sound.getCurrentTime())) + '/' + this.formatTime(Math.floor(this.props.sound.getDataLength() / this.props.sound.getSampleRate()));

			/** Triangle Progress Update */
			this.refs.wave__progress.style.left = this.props.sound.getCurrentTime() / (this.props.sound.getDataLength() / this.props.sound.getSampleRate()) * this.refs.wave__container.clientWidth - 3 + 'px';
		}.bind(this), 100);
	}

	render() {
		return (
			<div className="wave__container" ref="wave__container">
				<div className="wave__time" ref="wave__time"></div>
				<svg className="svg__wave" xmlns="http://www.w3.org/2000/svg" width={this.props.width} height={this.props.height}>
						{this.getWave()}
				</svg>
				<div className="wave__progress wave__position-absolute" ref="wave__progress"></div>
			</div>
		);
	}
}
