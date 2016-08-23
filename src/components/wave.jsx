import React from 'react';

export class Wave extends React.Component {
	constructor(props) {
		super(props);

		this.state = { 
			data: this.props.sound.getBufferData(function (i) {
				return false
			}, this.props.px),
			playStatus: false,
			left: -3,
			currentTime: 0.0
		};
	}

	getWave() {
		return this.state.data.map(function(elem, index) {
			return <rect key={index + 1} x={index / this.state.data.length * 100 + '%'} y={0} width={1} height={elem.pcmData * 500 + 'px'} fill={elem.fill}></rect>;
		}.bind(this));
	}

	formatTime(time) {
		const min = Math.floor(time / 60);
		const sec = Math.floor(time - min * 60);
		return (min < 10 ? '0' + min : min) + ':' + (sec < 10 ? '0' + sec : sec);
	}

	componentDidMount() {
		setInterval(function () {
			this.setState({
				data: this.props.sound.getBufferData(function (i) {
					if (i + 1 <= this.props.sound.getCurrentTime() * this.props.sound.getSampleRate() * this.props.px / this.props.sound.getDataLength()) {
						return true;
					}
				}.bind(this), this.props.px),
				playStatus: this.state.playStatus,
				left: this.props.sound.getCurrentTime() / (this.props.sound.getDataLength() / this.props.sound.getSampleRate()) * this.refs.wave__container.clientWidth - 3,
				currentTime: this.props.sound.getCurrentTime()
			});
		}.bind(this), 20);

		if (!this.state.playStatus) {
			this.setState({ data: this.state.data, playStatus: true });

			/** give it 1 sec to render */
			setTimeout(function () {
				/** play when component mount */
				this.refs.wave__container.style.opacity = 1;

				this.props.sound.loop(0);
			}.bind(this), 1000);
		}
	}

	render() {
		return (
			<div className="wave__container" ref="wave__container">
				<div className="wave__time">{this.formatTime(this.state.currentTime)} / {this.formatTime(Math.floor(this.props.sound.getDataLength() / this.props.sound.getSampleRate()))}</div>
				<svg className="svg__wave" xmlns="http://www.w3.org/2000/svg" width={this.props.width}>
						{this.getWave()}
				</svg>
				<div className="wave__progress wave__position-absolute" style={{left: this.state.left}}></div>
			</div>
		);
	}
}
