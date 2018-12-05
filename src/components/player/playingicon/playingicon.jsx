import React from 'react';
import './playingicon.css'

export class PlayingIcon extends React.Component {
	constructor(props) {
		super(props);
	}

	getRect() {
		const self = this;
		return [...Array(self.props.reactNumber)].map((empty, index) => <div key={index} className={'react' + index} style={{
            'backgroundColor': self.props.reactColor,
            'WebkitAnimationDelay': `${-1.2 + self.props.reactDelay * index}s`,
            'animation': `stretchdelay ${self.props.animateDelay}s infinite ease-in-out`,
        }} ></div>)
	}

	render() {
		return (
			<div className="playingicon" ref="playingicon" style={{
					height: this.props.height
				}}>
				{this.getRect()}
			</div>
		);
	}
}

PlayingIcon.defaultProps = {
	height: 18,
	reactNumber: 4,
	reactDelay: 0.12,
	reactColor: '#000',
};
