import React from 'react';

/** Style */
import styles from './player.css';

/** Components */
import { Wave } from './../wave/wave.jsx';


export class Player extends React.Component {
	constructor(props) {
		super(props);

		this.updateTime = this.updateTime.bind(this);
		this.updateTitle = this.updateTitle.bind(this);
	}

	updateTime(time) {
		this.refs.wave__time.children[1].innerText = time;
	}

	updateTitle(title) {
		this.refs.wave__title.children[1].innerText = title;
	}

	render() {
		return (
			<div className="player__container">
				<div className="box" ref="wave__time">
					<p className="name">Time</p>
					<p className="value">00:00 / 00:00</p>
				</div>
				<div className="box" ref="wave__title">
					<p className="name">Name</p>
					<p className="value">/</p>
				</div>
				<Wave sound={this.props.soundObject} updateTime={this.updateTime} updateTitle={this.updateTitle} width="100%" height={200} px={400} />
			</div>
		);
	}
}
