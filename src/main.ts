import { Launcher, Updater } from './launcher/launcher';
import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { PLATFORM, promptYesNoSync, ElectronWindow } from './common';
import { App } from './app/app';

app.setPath('appData', path.join(app.getPath('home'), '.repl.it', 'appData'));
app.setPath('userData', path.join(app.getPath('home'), '.repl.it', 'userData'));
app.disableHardwareAcceleration();

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
        mainApp.mainWindow.show();
        launcher.window.close();
    });

    // Handle The Login
    mainApp.mainWindow.webContents.on('new-window', (event, url) => {
        if (
            url != 'https://repl.it/auth/google/get?close=1' &&
            url != 'https://repl.it/auth/github/get?close=1'
        )
            return;
        mainApp.clearCookies(true);
        event.preventDefault();
        const win = new BrowserWindow({
            show: false,
            webPreferences: {
                preload: `${__dirname}/Auth.js`
            }
        });
        win.once('ready-to-show', () => win.show());
        win.loadURL(url, {
            userAgent: 'chrome'
        });
        // Handle The Login Process
        ipcMain.on('auth', () =>
            mainApp.mainWindow.loadURL('https://repl.it/~')
        );
        event.newGuest = win;
    });

    mainApp.mainWindow.on('close', () => app.quit());
}

async function initUpdater() {
    updater = new Updater(launcher);
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
    } else {
        updater.cleanUp(true);
    }
}

app.on('window-all-closed', () => {
    app.quit();
});
app.once('ready', () => {
    initLauncher();
});
