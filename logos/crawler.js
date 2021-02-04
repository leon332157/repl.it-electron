const rpcGenerator = require('discordrpcgenerator');
const Langs = require('https://raw.githubusercontent.com/iCrawl/discord-vscode/master/src/data/languages.json');

const fs = require('fs');
const request = require('request');

let download = function (uri, filename, callback) {
    request.head(uri, function (err, res, body) {
        console.log('content-type:', res.headers['content-type']);
        console.log('content-length:', res.headers['content-length']);

        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
};

let IMG = async (LANG) => {
    let ID = await rpcGenerator.getRpcImage('383226320970055681', LANG);
    download(
        `https://cdn.discordapp.com/app-assets/383226320970055681/${ID.id}.png`,
        `vscode-icons/${LANG}.png`,
        () => {
            console.log('done');
        }
    );
};

Langs.knownLanguages.forEach((E) => {
    IMG(E);
});
