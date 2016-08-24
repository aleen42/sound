import React from 'react';
import styles from './typeinfo.css'

export class TypeInfo extends React.Component {
	constructor(props) {
		super(props);
	}

	componentDidMount() {
		let textIndex = 0;
		let textArrayIndex = 0;
		let dx = 1;
		let backInterval = null;

		setInterval(function () {
			if (dx === -1) {
			  return;
			}

			textIndex += dx;
			this.refs.cursor__text.innerText = this.props.text[textArrayIndex].substr(0, textIndex);

			if (textIndex == 0) {
				dx = 1;
				textArrayIndex = (textArrayIndex + 1) % text.length;
			}

			if (textIndex == this.props.text[textArrayIndex].length) {
				dx = -1;
				setTimeout(function () {
					backInterval = setInterval(function () {
					    textIndex += dx;
					    this.refs.cursor__text.innerText = this.props.text[textArrayIndex].substr(0, textIndex);

					    if (textIndex == 0) {
							dx = 1;
							textArrayIndex = (textArrayIndex + 1) % this.props.text.length;

							clearInterval(backInterval);
					    }
					}.bind(this), this.props.typeBackSpeed);
				}.bind(this), this.props.typeDelay);
			}
		}.bind(this), this.props.typeSpeed);
	}

	render() {
		return (
			<div className="cursor__container">
				<div className="cursor__text" ref="cursor__text"></div>
				<div className="cursor">|</div>
			</div>
		);
	}
}

TypeInfo.defaultProps = {
	typeSpeed: 100,
	typeBackSpeed: 25,
	typeDelay: 2000
};
