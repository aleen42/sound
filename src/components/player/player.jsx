import React from 'react';

/** Style */
import styles from './player.css';

/** Components */
import { Wave } from './wave/wave.jsx';
import { List } from './list/list.jsx';


export class Player extends React.Component {
	constructor(props) {
		super(props);

		this.updateTime = this.updateTime.bind(this);
		this.updateTitle = this.updateTitle.bind(this);
		this.updateItem = this.updateItem.bind(this);

		this.handleResize = this.handleResize.bind(this);

		this.state = {
			activeIndex: this.props.setIndex,
			px: parseInt(window.innerWidth / 3.2)
		};
	}

	updateTime(time) {
		this.refs.wave__time.children[1].innerText = time;
	}

	updateTitle(title) {
		this.refs.wave__title.children[1].innerText = title;
	}

	updateItem(index) {
		this.setState({
			activeIndex: index,
			px: this.state.px
		});
	}

	handleResize(e) {
		this.setState({
			activeIndex: this.state.activeIndex,
			px: parseInt(window.innerWidth / 3.2)
		});
	}

	componentDidMount() {
        window.addEventListener('resize', this.handleResize);  
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
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
				<Wave sound={this.props.soundObject} updateTime={this.updateTime} updateTitle={this.updateTitle} updateItem={this.updateItem} width="100%" height={280} px={this.state.px} />
				<List sound={this.props.soundObject} activeIndex={this.state.activeIndex} />
			</div>
		);
	}
}
