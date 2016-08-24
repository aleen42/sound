/***********************************************************************
 *                                                                   _
 *       _____  _                           ____  _                 |_|
 *      |  _  |/ \   ____  ____ __ ___     / ___\/ \   __   _  ____  _
 *      | |_| || |  / __ \/ __ \\ '_  \ _ / /    | |___\ \ | |/ __ \| |
 *      |  _  || |__. ___/. ___/| | | ||_|\ \___ |  _  | |_| |. ___/| |
 *      |_/ \_|\___/\____|\____||_| |_|    \____/|_| |_|_____|\____||_|
 *
 *      ================================================================
 *                 More than a coder, More than a designer
 *      ================================================================
 *
 *
 *      - Document: index.js
 *      - Author: aleen42
 *      - Description: the main entrance
 *      - Create Time: Aug 22nd, 2016
 *      - Update Time: Aug 22nd, 2016
 *
 *
 **********************************************************************/

import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';

/** Components */
import { Player } from './components/player/player.jsx';
import { Loading } from './components/loading/loading.jsx';
import { TypeInfo } from './components/typeinfo/typeinfo.jsx';

/** Modules */
import Sound from './modules/sound';

const songsList = [
	'./assets/Alan Walker - Sing Me to Sleep.mp3',
	'./assets/Martin Garrix - Oops.mp3',
	'./assets/Pegato,Twilight Meadow - The Worlds We Discovered (Pegato Remix).mp3',
	'./assets/Above & Beyond - Counting Down The Days.mp3',
	'./assets/Above & Beyond - Eternal - Original Mix.mp3',
	'./assets/Above & Beyond - Filmic - Original Mix.mp3',
	'./assets/Above & Beyond - Hello.mp3',
	'./assets/Above & Beyond,Justine Suissa - Little Something.mp3',
	'./assets/Above & Beyond - Out Of Time.mp3',
	'./assets/Above & Beyond - Prelude - Original Mix.mp3',
	'./assets/Above & Beyond,Richard Bedford - Every Little Beat - Original Mix.mp3',
	'./assets/Above & Beyond,Richard Bedford - Thing Called Love - Original Mix.mp3',
	'./assets/Above & Beyond,Zoe Johnston - Alchemy - Original Mix.mp3',
	'./assets/Above & Beyond,Zoe Johnston - Fly To New York.mp3',
	'./assets/Above & Beyond,Zoe Johnston - Sweetest Heart - Original Mix.mp3',
];

const sound = new Sound(songsList);

ReactDOM.render(
	<div>
		<TypeInfo text={[
			'Sound',
			'WaveForms',
			'Dancing with Rhythms'
		]} />
		<Loading />
	</div>,
	document.querySelectorAll('.loading__container')[0]
);

sound.set(Math.floor(Math.random() * (songsList.length - 1)))
	.onload(function () {
		ReactDOM.render(
			<Player soundObject={sound}/>,
			document.querySelectorAll('.container')[0]
		);

		document.querySelectorAll('.loading')[0].style.top = '10%';
		setTimeout(function () {
			document.querySelectorAll('.cursor__container')[0].style.opacity = 1;
		}, 500);
	})
	.init();
