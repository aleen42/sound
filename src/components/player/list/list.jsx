import React from 'react';
import styles from './list.css'

export class List extends React.Component {
	constructor(props) {
		super(props);
	}

	loadingUp() {
		document.querySelectorAll('.loading')[0].style.top = '50%';
	}

	loadingDown() {
		document.querySelectorAll('.loading')[0].style.top = '10%';
	}

	jump(index) {
		this.loadingUp();

		/** try to avoid blocking UI thread */
		setTimeout(function() {
			this.props.sound.jump(index);
		}.bind(this), 500);
	}

	getList() {
		return this.props.sound.getList().map((item, i) => {
			if (i === this.props.activeIndex) {
				return <p className="player__list-item--active" onClick={this.jump.bind(this, i)} ref="player__list-item-active" key={i}>{item}</p>
			} else {
				return <p className="player__list-item" onClick={this.jump.bind(this, i)} key={i}>{item}</p>
			}
		});
	}

	componentDidUpdate() {
		this.refs['player__list'].scrollTop = this.refs['player__list-item-active'].offsetTop - (this.refs['player__list'].clientHeight - 20 * 2 - 18) / 2;
	}

	componentDidMount() {
		this.refs['player__list'].scrollTop = this.refs['player__list-item-active'].offsetTop - (this.refs['player__list'].clientHeight - 20 * 2 - 18) / 2;
	}

	render() {
		return (
			<div className="player__list" ref="player__list">
				<div className="player__list-wrapper">
					<div className="player__list-head"></div>
					<div className="player__list-tail"></div>
					{this.getList()}
				</div>
			</div>
		);
	}
}
