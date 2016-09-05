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
 *      - Document: load.js
 *      - Author: aleen42
 *      - Description: a script for loading file name from a directory,
 *      			   and converted into a json.
 *      - Create Time: Aug 25th, 2016
 *      - Update Time: Sep 5th, 2016
 *
 *
 **********************************************************************/

const fs = require('fs');
const p = require('path');

const base = [
	'./assets/'
];

function recursiveRead(path) {
	const files = fs.readdirSync(path);

	var list = [];

	files.forEach(function (file) {
		if (fs.lstatSync(p.join(path, file)).isDirectory()) {
			list = list.concat(recursiveRead(p.join(path, file)));
		} else {
			list.push(p.join(path, file));
		}
	});

	return list;
}

var songlist = [];
for (var i = 0; i < base.length; i++) {
	songlist = songlist.concat(recursiveRead(base[i])).filter(function (item) {
		return item.substr(-4).toLowerCase() === '.mp3' || item.substr(-5).toLowerCase() === '.flac';
	});
}

fs.writeFile('./assets/songlist.json', JSON.stringify({
	data: songlist
}));
