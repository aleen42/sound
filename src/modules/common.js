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
 *      - Description: common.js is for common static functions
 *      - Create Time: Aug 22nd, 2016
 *      - Update Time: Aug 22nd, 2016
 *
 *
 **********************************************************************/

const Common = module.exports = {
	errorPrint: function (msg) {
		alert('[Error: ' + msg + ']');
		console.log('[Error: ' + msg + ']');
	},

	extractTitle: function (title) {
		let reserved = title;

		while (reserved.indexOf('/') >= 0) {
			reserved = reserved.substr(reserved.indexOf('/') + 1, reserved.length - reserved.indexOf('/') - 1);
		}

		return reserved.match(/(.*)\.[a-zA-Z0-9]+/)[1];
	}
};
