import React from 'react';
import style from './oscilloscope.css';

export class Oscilloscope extends React.Component {
	constructor(props) {
		super(props);
	}

	getOscilloscope() {

	}

	render() {
		return (
			<div className="oscilloscope__container">
				<svg className="svg__wave" xmlns="http://www.w3.org/2000/svg" width={this.props.width} height={this.props.height}>
						{this.getOscilloscope()}
				</svg>
			</div>
		);
	}
}

Oscilloscope.defaultProps = {
	px: 256
};
