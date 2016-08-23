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
import { Wave } from './components/wave';
import Sound from './modules/sound';

const sound = new Sound([
	'./assets/test3.mp3',
	'./assets/test1.mp3',
	'./assets/test2.mp3'
]);

sound.onload(function () {
	ReactDOM.render(
		<Wave sound={sound} width="70%" height="50" px={200} />,
		document.querySelectorAll('.container')[0]
	);
}).init();
