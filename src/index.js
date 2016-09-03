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

/** SongsList */
import list from './../assets/songlist.json';

const sound = new Sound(list.data);

ReactDOM.render(
	<div>
		<TypeInfo text={[
			'Sound',
			'WaveForms',
			'Dancing with Rhythms'
		]} />
		<Loading className="loading" soundObject={sound} />
	</div>,
	document.querySelectorAll('.loading__container')[0]
);

const setIndex = Math.floor(Math.random() * (list.data.length));

sound.set(setIndex)
	.onload(function () {
		console.log('Rendering...')

		ReactDOM.render(
			<Player soundObject={sound} setIndex={setIndex} />,
			document.querySelectorAll('.container')[0]
		);
	})
	.init();
