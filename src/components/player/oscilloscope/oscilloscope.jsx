import React from 'react';
import style from './oscilloscope.css';

export class Oscilloscope extends React.Component {
	constructor(props) {
		super(props);

		this.dataLength = 0;
	}

	getOscilloscope() {
		const data = this.props.sound.getOscilloscopeData(this.props.px);

		/** @type {Number} [define the space between two oscilloscope, left and the right one] */
		const space = 5;

		const fillColor = 'rgba(0, 0, 0, 0.2)';

		this.dataLength = data.length;

		return data.map(function(elem, index) {
			return (
				<g key={index}>
					<rect key={-index - 1} ref={'oscilloscope__left-tag' + index} x={((50 - space) - index / data.length * (50 - space)) + '%'} y={(this.props.height - elem.value) / 2 + 'px'} width={1} height={elem.value + 'px'} fill={fillColor}></rect>
					<rect key={index + 1} ref={'oscilloscope__right-tag' + index} x={((50 + space) + index / data.length * (100 - (50 + space))) + '%'} y={(this.props.height - elem.value) / 2 + 'px'} width={1} height={elem.value + 'px'} fill={fillColor}></rect>
				</g>
			);
		}.bind(this));
	}

	clearOscilloscope() {
		for (let i = 0; i < this.dataLength; i++) {
			if (typeof this.refs['oscilloscope__left-tag' + i] !== 'undefined') {
				this.refs['oscilloscope__left-tag' + i].setAttribute('height', 0 + 'px');
				this.refs['oscilloscope__left-tag' + i].setAttribute('y', this.props.height / 2 + 'px');
			}

			if (typeof this.refs['oscilloscope__right-tag' + i] !== 'undefined') {
				this.refs['oscilloscope__right-tag' + i].setAttribute('height', 0 + 'px');
				this.refs['oscilloscope__right-tag' + i].setAttribute('y', this.props.height / 2 + 'px');
			}
		}
	}

	updateOscilloscope() {
		const data = this.props.sound.getOscilloscopeData(this.props.px);

		for (let i = 0; i < this.dataLength; i++) {
			if (data[i].value === 0) {
				continue;
			}

			const setSide = function (side) {
				this.refs['oscilloscope__' + side + '-tag' + i].setAttribute('height', data[i].value + 'px');
				this.refs['oscilloscope__' + side + '-tag' + i].setAttribute('y', (this.props.height - data[i].value) / 2 + 'px');
			}.bind(this);

			setSide('left');
			setSide('right');
		}
	}

	render() {
		return (
			<div className="oscilloscope__container" style={{ width: this.dataLength * 8, marginLeft: -this.dataLength * 8 / 2, height: this.props.height + 20 * 2}}>
				<svg className="svg__oscilloscope" xmlns="http://www.w3.org/2000/svg" width={this.props.width} height={this.props.height}>
					{this.getOscilloscope()}
				</svg>
			</div>
		);
	}
}

Oscilloscope.defaultProps = {
	px: parseInt(Math.pow(2, 7))
};
