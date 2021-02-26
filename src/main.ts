import { Launcher, Updater } from './launcher/launcher';
import { app } from 'electron';
import path = require('path');
import { PLATFORM, promptYesNoSync } from './common';
import { App } from './app/app';
// import DidFailLoadEvent = Electron.DidFailLoadEvent;

app.setPath(
    'appData',
    app.getPath('home') + sep + '.repl.it' + sep + 'appData' + sep
);

app.setPath(
    'userData',
    app.getPath('home') + sep + '.repl.it' + sep + 'userData' + sep
);

process.on('unhandledRejection', (rejection: any) => {
    console.error(`[Unhandled Promise Rejction] ${rejection.stack}`);
});

let launcher: Launcher;
let updater: Updater;
let mainApp: App;

function initLauncher() {
    launcher = new Launcher();

    launcher.init();
    launcher.window.webContents.once('did-finish-load', () => {
        launcher.window.show();
        initUpdater().then(() => {});
    });
}

async function initApp() {
    mainApp = new App();
    mainApp.mainWindow.loadURL('https://repl.it/~').catch(console.debug);
    await mainApp.clearCookies(true);

    mainApp.mainWindow.webContents.once('did-finish-load', () => {
        launcher.window.close();
    });

    mainApp.mainWindow.on('close', () => {
        app.quit();
    });
}

async function initUpdater() {
    updater = new Updater(launcher);
    if (process.execPath.includes('electron')) {
        updater.cleanUp(true);
        initApp();
        return;
    }
    launcher.updateStatus({ text: 'Checking Update' });
    const res = await updater.checkUpdate();
    if (res['changeLog'] == 'error') {
        launcher.updateStatus({
            text: 'Check update failed, skipping.'
        });
        updater.cleanUp(true);
    }

    updater.once('download-error', (e) => {
        console.error(e);
        updater.cleanUp();
    });

    updater.once('all-done', () => {
        launcher.updateStatus({ text: 'Launching app' });
        initApp();
    });

    if (res['hasUpdate']) {
        launcher.updateStatus({ text: 'Update detected' });
        if (
            promptYesNoSync(
                `A new update ${res['version']} is available. Do you want to update?`,
                'Update Available',
                res['changeLog']
            )
        ) {
            launcher.updateStatus({ text: 'Downloading Update' });
            updater.once('download-finished', updater.afterDownload);
            switch (PLATFORM) {
                case 'win32':
                    await updater.downloadUpdate(
                        updater.downloadUrls.windowsUrl
                    );
                    break;
                case 'darwin':
                    await updater.downloadUpdate(updater.downloadUrls.macOSUrl);
                    break;
                case 'linux':
                    await updater.downloadUpdate(updater.downloadUrls.linuxUrl);
                    break;
            }
        }
    } else updater.cleanUp(true);
}

app.on('window-all-closed', () => {
    app.quit();
});

app.once('ready', () => {
    initLauncher();
});
