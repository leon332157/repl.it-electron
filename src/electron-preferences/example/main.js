'use strict';

const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require('path');
const os = require('os');
const url = require('url');
const preferences = require('./preferences');

preferences.on('save', (preferences) => {
    console.log(`Preferences were saved.`, JSON.stringify(preferences, null, 4));
});

let mainWindow;

function createWindow() {

    mainWindow = new BrowserWindow({
        'width': 1200,
        'height': 700,
        'accept-first-mouse': true
    });

    mainWindow.loadURL(url.format({
        'pathname': path.join(__dirname, 'index.html'),
        'protocol': 'file:',
        'slashes': true
    }));

    // mainWindow.webContents.openDevTools();

    mainWindow.on('closed', function() {
        mainWindow = null;
    });

}

app.on('ready', createWindow);

app.on('window-all-closed', function() {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function() {
    if (mainWindow === null) {
        createWindow();
    }
});
