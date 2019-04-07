const { BrowserWindow } = require('electron');
const ElectronPrompt = require('electron-prompt');
const path = require('path');

// Existing browser window
let open;

function openBrowser() {
    ElectronPrompt({
        title: 'Open URL',
        label: 'URL:',
        value: 'https://google.com',
        inputAttrs: {
            type: 'url'
        },
        customStylesheet: path.resolve(__dirname,'..','..','promptDark.css')
    }).then(url => {

        if (! url.startsWith('https://') && ! url.startsWith('http://')) {
            url = 'https://' + url;
        }

        if (open != null) {
            open.loadURL(url);
            open.show();
            return;
        }

        open = new BrowserWindow({ width: 1000, height: 800 });

        open.on("closed", ev => {
            ev.preventDefault();
            open = null;
        })

        open.loadURL(url);
        open.show();
    })
}

module.exports = openBrowser;