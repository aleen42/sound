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
 *      - Document: server.js
 *      - Author: aleen42
 *      - Description: a script for create a server.
 *      - Create Time: Aug 25th, 2016
 *      - Update Time: Nov 23rd, 2018
 *
 *
 **********************************************************************/

const express = require('express');
const webpack = require('webpack');
const config = require('./webpack.config.js');

const port = process.argv[2] || 8080;

const app = express();
const devMiddleWare = require('webpack-dev-middleware')(webpack(config), {
    publicPath: config.output.publicPath,
    stats: {
        colors: true,
        chunks: false,
    },
});

/** serve assets */
const fs = require('fs');
const p = require('path');

const recursiveRead = path => fs.readdirSync(path).reduce((list, file) => {
    if (fs.lstatSync(p.resolve(path, file)).isDirectory()) {
        list = list.concat(recursiveRead(p.join(path, file)))
    } else {
        if (/\.(?:mp3|flac)$/gi.test(file)) {
            list.push([file, escape(file)/* url request */]);
            /** serve files */
            app.get(`/${escape(file)}`, (req, res) => fs.createReadStream(p.resolve(path, file)).pipe(res));
        }
    }

    return list;
}, []);

fs.writeFileSync('./assets/songList.json', JSON.stringify({
    data: [
        './assets',
    ].reduce((songList, path) => songList.concat(
        recursiveRead(path)
    ), []),
}));

app.use('/favicon.ico', express.static(p.resolve(__dirname, 'src/favicon.ico')));
app.use('/fonts', express.static(p.resolve(__dirname, 'node_modules/font-awesome/fonts')));

app.use(devMiddleWare);
devMiddleWare.waitUntilValid(() => console.log(`Listening at:\n=> http://localhost:${port}\nCTRL + C to shutdown`));

app.listen(port, err => {
    if (err) {
        console.log(err);
        return;
    }

    console.log('Webpack Compiling...');
});
