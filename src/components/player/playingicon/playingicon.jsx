import React from 'react';
import styles from './playingicon.css'

export class PlayingIcon extends React.Component {
	constructor(props) {
		super(props);
	}

	getRect() {
		const items = [];
		
		for (let i = 1; i <= this.props.reactNumber; i++) {
			items.push(<div key={i} className={'react' + i} style={{
				'backgroundColor': this.props.reactColor,
				'WebkitAnimationDelay': (-1.2 + this.props.reactDelay * i) + 's',
    			'animation': 'stretchdelay ' + this.props.animateDelay + 's infinite ease-in-out'
			}} ></div>);
		}

		return items;
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
	reactColor: '#000'
};
