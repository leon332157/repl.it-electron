'use strict';

const electron = require('electron');
const { app, BrowserWindow, ipcMain, webContents } = electron;
const path = require('path');
const url = require('url');
const fs = require('fs-extra');
const _ = require('lodash');
const { EventEmitter2 } = require('eventemitter2');

class ElectronPreferences extends EventEmitter2 {

    constructor(options = {}) {
        
        super();

        _.defaultsDeep(options, {
            'sections': [],
            'webPreferences': {
                'devTools': false
            }
        });

        options.sections.forEach((section, sectionIdx) => {
            _.defaultsDeep(section, {
                'form': {
                    'groups': []
                }
            });
            section.form.groups = section.form.groups.map((group, groupIdx) => {
                group.id = 'group' + sectionIdx + groupIdx;
                return group;
            });
        });

        this.options = options;

        if (!this.dataStore) {
            throw new Error(`The 'dataStore' option is required.`);
        }

        fs.ensureFileSync(this.dataStore);

        this.preferences = fs.readJsonSync(this.dataStore, {
            'throws': false
        });

        if (!this.preferences) {
            this.preferences = this.defaults;
        }

        if (_.isFunction(options.onLoad)) {
            this.preferences = options.onLoad(this.preferences);
        }

        this.save();

        ipcMain.on('showPreferences', (event) => {
            this.show();
        });

        ipcMain.on('getPreferenceOptions', (event) => {
            event.returnValue = this.options;
        });

        ipcMain.on('restoreDefaults', (event, value) => {
            this.preferences = this.defaults;
            this.save();
            this.broadcast();
        });

        ipcMain.on('getDefaults', (event, value) => {
            event.returnValue = this.defaults;
        });

        ipcMain.on('getPreferences', (event, value) => {
            event.returnValue = this.preferences;
        });

        ipcMain.on('setPreferences', (event, value) => {
            this.preferences = value;
            this.save();
            this.broadcast();
            this.emit('save', Object.freeze(_.cloneDeep(this.preferences)));
            event.returnValue = null;
        });

    }

    get dataStore() {

        return this.options.dataStore;

    }

    get defaults() {

        return this.options.defaults || {};

    }

    get preferences() {

        return this._preferences;

    }

    set preferences(value) {

        this._preferences = value;

    }

    save() {

        fs.writeJsonSync(this.dataStore, this.preferences, {
            'spaces': 4
        });

    }

    value(key, value) {

        if (_.isArray(key)) {
            key.forEach(({ key, value }) => {
                _.set(this.preferences, key, value);
            });
            this.save();
            this.broadcast();
        } else if (!_.isUndefined(key) && !_.isUndefined(value)) {
            _.set(this.preferences, key, value);
            this.save();
            this.broadcast();
        } else if (!_.isUndefined(key)) {
            return _.cloneDeep(_.get(this.preferences, key));
        } else {
            return _.cloneDeep(this.preferences);
        }

    }

    broadcast() {

        webContents.getAllWebContents()
            .forEach((wc) => {
                wc.send('preferencesUpdated', this.preferences);
            });

    }

    show() {

        if (this.prefsWindow) {
            return;
        }

        this.prefsWindow = new BrowserWindow({
            'title': 'Preferences',
            'width': 800,
            'maxWidth': 800,
            'height': 600,
            'maxHeight': 600,
            'resizable': false,
            'acceptFirstMouse': true,
            'maximizable': false,
            'backgroundColor': '#E7E7E7',
            'show': true,
            'webPreferences': this.options.webPreferences
        });

        this.prefsWindow.loadURL(url.format({
            'pathname': path.join(__dirname, 'build/index.html'),
            'protocol': 'file:',
            'slashes': true
        }));

        this.prefsWindow.on('closed', () => {
            this.prefsWindow = null;
        });


    }

}

module.exports = ElectronPreferences;
