import React from 'react';
import styles from './list.css'
import { PlayingIcon } from './../playingicon/playingicon.jsx'

export class List extends React.Component {
	constructor(props) {
		super(props);

		this.handleResize = this.handleResize.bind(this);
		this.state = {
			height: parseInt(window.innerHeight / 5)
		};
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
				return <div className="player__list-item--active" ref="player__list-item-active" key={i}><PlayingIcon />{item}</div>
			} else {
				return <p className="player__list-item" onClick={this.jump.bind(this, i)} key={i}>{item}</p>
			}
		});
	}

	handleResize() {
		this.setState({
			height: parseInt(window.innerHeight / 4)
		});
	}

	componentDidUpdate() {
		this.refs['player__list'].scrollTop = this.refs['player__list-item-active'].offsetTop - (this.state.height - 25 * 2 - this.refs['player__list-item-active'].clientHeight) / 2;
	}

	componentDidMount() {
		console.log('List Mounted');
		
		this.refs['player__list'].scrollTop = this.refs['player__list-item-active'].offsetTop - (this.state.height - 25 * 2 - this.refs['player__list-item-active'].clientHeight) / 2;
		window.addEventListener('resize', this.handleResize);
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.handleResize);
	}

	render() {
		return (
			<div className="player__list" style={{height: this.state.height}} ref="player__list">
				<div className="player__list-wrapper">
					<div className="player__list-head" style={{bottom: this.state.height - 25}}></div>
					<div className="player__list-tail"></div>
					{this.getList()}
				</div>
			</div>
		);
	}
}
