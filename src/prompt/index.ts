import { ElectronWindow } from '../common';
import { ipcMain } from 'electron';
import url = require('url');
import path = require('path');

const DEFAULT_WIDTH = 370;
const DEFAULT_HEIGHT = 160;

function electronPrompt(options: Object, parentWindow: ElectronWindow) {
    return new Promise((resolve, reject) => {
        const id = `${new Date().getTime()}-${Math.random()}`;

        const opts = Object.assign(
            {
                width: DEFAULT_WIDTH,
                height: DEFAULT_HEIGHT,
                minWidth: DEFAULT_WIDTH,
                minHeight: DEFAULT_HEIGHT,
                title: 'Prompt',
                label: 'Please input a value:',
                buttonLabels: null,
                alwaysOnTop: false,
                value: null,
                type: 'input',
                selectOptions: null,
                icon: null,
                useHtmlLabel: false,
                customStylesheet: null,
                menuBarVisible: false,
                skipTaskbar: true
            },
            options || {}
        );

        if (
            opts.type === 'select' &&
            (opts.selectOptions === null ||
                typeof opts.selectOptions !== 'object')
        ) {
            return reject(new Error('"selectOptions" must be an object'));
        }

        let promptWindow = new ElectronWindow({
            width: opts.width,
            height: opts.height,
            minWidth: opts.minWidth,
            minHeight: opts.minHeight,
            resizable: false,
            parent: parentWindow,
            skipTaskbar: opts.skipTaskbar,
            alwaysOnTop: opts.alwaysOnTop,
            useContentSize: false,
            modal: Boolean(parentWindow),
            title: opts.title,
            icon: opts.icon || undefined,
            webPreferences: {
                nodeIntegration: true
            }
        });

        promptWindow.setMenu(null);
        promptWindow.setMenuBarVisibility(opts.menuBarVisible);

        const getOptionsListener = (event: any) => {
            event.returnValue = JSON.stringify(opts);
        };

        const cleanup = () => {
            if (promptWindow) {
                promptWindow.close();
                promptWindow = null;
            }
        };

        const postDataListener = (event: any, value: string) => {
            resolve(value);
            event.returnValue = null;
            cleanup();
        };

        const unresponsiveListener = () => {
            reject(new Error('Window was unresponsive'));
            cleanup();
        };

        const errorListener = (event: any, message: string) => {
            reject(new Error(message));
            event.returnValue = null;
            cleanup();
        };

        ipcMain.on('prompt-get-options:' + id, getOptionsListener);
        ipcMain.on('prompt-post-data:' + id, postDataListener);
        ipcMain.on('prompt-error:' + id, errorListener);
        promptWindow.on('unresponsive', unresponsiveListener);

        promptWindow.on('closed', () => {
            ipcMain.removeListener(
                'prompt-get-options:' + id,
                getOptionsListener
            );
            ipcMain.removeListener('prompt-post-data:' + id, postDataListener);
            ipcMain.removeListener('prompt-error:' + id, postDataListener);
            resolve(null);
        });

        const promptUrl = url.format({
            protocol: 'file',
            slashes: true,
            pathname: path.join(__dirname, 'page', 'prompt.html'),
            hash: id
        });

        promptWindow.loadURL(promptUrl);
    });
}

module.exports = electronPrompt;
