import { BrowserWindow } from 'electron';

function createUpdaterWindow() {
    let mainWindow: BrowserWindow;
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 600,
        minHeight: 600,
        title: 'Repl.it',
        webPreferences: { nodeIntegration: false }
        //icon:
    });

    mainWindow.on('unresponsive', () => {
        mainWindow.reload();
    });
}
