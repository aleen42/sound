import React from 'react';

export class Wave extends React.Component {
	constructor(props) {
		super(props);

		this.state = { 
			data: this.props.sound.getBufferData(function (i) {
				return false
			}, Math.floor(this.props.sound.getDataLength() / this.props.px)),
			playStatus: false
		};
	}

	getWave() {
		return this.state.data.map(function(elem, index) {
			return <rect key={index + 1} x={index / this.state.data.length * 100 + '%'} y="0" width="1" height="100%" fill={elem.fill}></rect>;
		}.bind(this));
	}

	componentDidMount() {
		if (!this.state.playStatus) {
			/** play when component mount */
			this.props.sound.loop(0);	

			this.setState({ data: this.state.data, playStatus: true });
		}

		setInterval(function () {
			// console.log(this.props.sound.getCurrentTime());
			this.setState({
				data: this.props.sound.getBufferData(function (i) {
					if (i <= this.props.sound.getCurrentTime() * this.props.sound.getSampleRate()) {
						return true;
					}
				}.bind(this), Math.floor(this.props.sound.getDataLength() / this.props.px)),
				playStatus: this.state.playStatus
			});
		}.bind(this), 20);
	}

	render() {
		return (
			<div>
				<svg className="svg__wave" xmlns="http://www.w3.org/2000/svg" width={this.props.width} height={this.props.height}>
					{this.getWave()}
				</svg>
			</div>
		);
	}
}
