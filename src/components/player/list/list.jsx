import React from 'react';
import './list.css'
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
		const self = this;
		self.loadingUp();

		/** try to avoid blocking UI thread */
		setTimeout(self.props.sound.jump.bind(self.props.sound, index), 500);
	}

	getList() {
		return this.props.sound.getList().map((item, i) => i === this.props.activeIndex
			? <div className="player__list-item--active" ref="player__list-item-active" key={i}><PlayingIcon />{item}</div>
			: <p className="player__list-item" onClick={this.jump.bind(this, i)} key={i}>{item}</p>);
	}

	handleResize() {
		this.setState({
			height: parseInt(window.innerHeight / 4)
		});
	}

	componentDidUpdate() {
		this.refs['player__list'].scrollTop = this.refs['player__list-item-active'].offsetTop
			- (this.state.height - 25 * 2 - this.refs['player__list-item-active'].clientHeight) / 2;
	}

	componentDidMount() {
		console.log('List Mounted');

		this.refs['player__list'].scrollTop = this.refs['player__list-item-active'].offsetTop
			- (this.state.height - 25 * 2 - this.refs['player__list-item-active'].clientHeight) / 2;
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
