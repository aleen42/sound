import React from 'react';
import './oscilloscope.css';

export class Oscilloscope extends React.Component {
	constructor(props) {
		super(props);

		const self = this;
		self.ratio = self.props.height / 150;
		self.dataLength = 0;
	}

	getOscilloscope() {
		const self = this;
		const data = self.props.sound.getOscilloscopeData(self.props.px);

		/** @type {Number} [define the space between two oscilloscope, left and the right one] */
		const space = 2;
		const fillColor = 'rgba(0, 0, 0)';

		self.dataLength = data.length;

		return data.map((elem, index) => (
            <g key={index}>
                <rect key={-index - 1} ref={'oscilloscope__left-tag' + index}
                      x={((50 - space) - index / data.length * (50 - space)) + '%'}
                      y={(self.props.height - elem.value * self.ratio) / 2 + 'px'} width={2} height={elem.value * self.ratio + 'px'}
                      fill={fillColor} opacity={0.2}></rect>
                <rect key={index + 1} ref={'oscilloscope__right-tag' + index}
                      x={((50 + space) + index / data.length * (100 - (50 + space))) + '%'}
                      y={(self.props.height - elem.value * self.ratio) / 2 + 'px'} width={2} height={elem.value * self.ratio + 'px'}
                      fill={fillColor} opacity={0.2}></rect>
            </g>
        ));
	}

	updateOscilloscope() {
		const self = this;
		const data = self.props.sound.getOscilloscopeData(self.props.px);

		[...Array(self.dataLength)].forEach((empty, index) => {
            const _setSide = side => {
            	const element = self.refs[`oscilloscope__${side}-tag${index}`];

                element.setAttribute('height', `${data[index].value * self.ratio}px`);
                element.setAttribute('y', `${(self.props.height - data[index].value * self.ratio) / 2}px`);
            };

            _setSide('left');
            _setSide('right');
		});
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
	px: parseInt(Math.pow(2, 8)),
};
