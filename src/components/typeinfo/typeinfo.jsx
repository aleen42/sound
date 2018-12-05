import React from 'react';
import './typeinfo.css'

export class TypeInfo extends React.Component {
	constructor(props) {
		super(props);
	}

	componentDidMount() {
		const self = this;
		let textIndex = 0;
		let textArrayIndex = 0;
		let dx = 1;
		let backInterval = null;

		setInterval(() => {
			if (dx === -1) {
			  return;
			}

			textIndex += dx;
			self.refs.cursor__text.innerText = self.props.text[textArrayIndex].substr(0, textIndex);

			if (textIndex == 0) {
				dx = 1;
				textArrayIndex = (textArrayIndex + 1) % text.length;
			}

			if (textIndex == self.props.text[textArrayIndex].length) {
				dx = -1;
				setTimeout(() => {
					backInterval = setInterval(() => {
					    textIndex += dx;
					    self.refs.cursor__text.innerText = self.props.text[textArrayIndex].substr(0, textIndex);

					    if (textIndex == 0) {
							dx = 1;
							textArrayIndex = (textArrayIndex + 1) % self.props.text.length;

							clearInterval(backInterval);
					    }
					}, self.props.typeBackSpeed);
				}, self.props.typeDelay);
			}
		}, self.props.typeSpeed);
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
