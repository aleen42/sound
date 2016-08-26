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
 *      - Update Time: Aug 25th, 2016
 *
 *
 **********************************************************************/

const fs = require('fs');
const base = './assets/songs/';

const songlist = fs.readdirSync(base);

fs.writeFile('./assets/songlist.json', JSON.stringify({
	data: songlist
}));
