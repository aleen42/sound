import React from 'react';
import styles from './wave.css'

export class Wave extends React.Component {
	constructor(props) {
		super(props);
	}

	getWave() {
		const data = this.props.sound.getWaveData(this.props.px);
		return data.map(function(elem, index) {
			return <rect key={index} ref={'wave__tag' + index} x={index / data.length * 100 + '%'} y={(this.props.height - elem.value * 1000) / 2 + 'px'} width={1} height={elem.value * 1000 + 'px'} fill={elem.fill}></rect>;
		}.bind(this));
	}

	clearWave() {
		/** [for: clear all wave tag] */
		for (let i = 0; i < this.props.px; i++) {
			this.refs['wave__tag' + i].setAttribute('fill', 'rgba(0, 0, 0, 0.1)');	
		}
	}

	updateWave(index) {
		const currentItem = Math.floor((index / this.props.sound.getDataLength()) * this.props.px);

		if (currentItem >= this.props.px) {
			return;
		}

		if (currentItem === 0) {
			this.clearWave();
			return;
		}

		if (typeof this.refs['wave__tag' + currentItem] != 'undefined') {
			/** ensure not jump too fast */
			for (let i = 0; i <= currentItem; i++) {
				if (typeof this.refs['wave__tag' + i] !== 'undefined') {
					this.refs['wave__tag' + i].setAttribute('fill', 'rgba(0, 0, 0, 0.3)');
				}
			}
		}

		/** Triangle Progress Update */
		// this.refs.wave__progress.style.left = (currentItem / this.props.px) * this.refs.wave__container.clientWidth - 3 + 'px';	
	}

	componentDidMount() {
		console.log('Wave Mounted');

		/** give it 1 sec to render */
		setTimeout(function () {
			this.refs.wave__container.style.opacity = 1;
		}.bind(this), 1000);
	}

	render() {
		return (
			<div className="wave__container" ref="wave__container">
				<div className="wave__central_line"></div>
				<svg className="svg__wave" xmlns="http://www.w3.org/2000/svg" width={this.props.width} height={this.props.height}>
						{this.getWave()}
				</svg>
				{/** <div className="wave__progress wave__position-absolute" ref="wave__progress"></div> */}
			</div>
		);
	}
}

Wave.defaultProps = {
	px: parseInt(window.innerWidth / 3.2)
};
