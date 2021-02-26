import {
    clipboard,
    Menu,
    MenuItemConstructorOptions,
    MenuItem,
    shell,
    BrowserWindow
} from 'electron';
import { ElectronWindow, selectInput } from '../../common';
import { ThemeHandler } from '../themeHandler/themeHandler';
import { App } from '../app';
import { SettingHandler } from '../settingHandler';
import { PopoutHandler } from '../popoutHandler/popoutHandler';

function appMenuSetup(
    mainApp: App,
    themeHandler: ThemeHandler,
    settings: SettingHandler,
    popoutHandler: PopoutHandler
): Menu {
    const template: MenuItemConstructorOptions[] = [
        {
            label: 'App',
            submenu: [
                {
                    label: 'Choose Theme',
                    click(_: MenuItem, win: ElectronWindow) {
                        themeHandler.openThemeWindow(win);
                    }
                },
                {
                    label: 'Use Mobile View',
                    type: 'checkbox',
                    checked: <boolean>settings.get('enable-ace'),
                    click(item: MenuItem) {
                        mainApp.toggleAce(item);
                    }
                },
                {
                    label: 'Crosis Logs',
                    click(i: MenuItem, win: ElectronWindow) {
                        win.webContents.executeJavaScript(
                            "if(!window.store){alert('You need to be on a repl to use this feature.')}; window.store.dispatch({type: 'LOAD_PLUGIN',pluginPud: 'adminpanel',pluginType: 'adminpanel',title: 'adminpanel'});window.store.dispatch({type: 'ADD_SIDE_NAV_ITEM',navItem: {pud: 'adminpanel',pluginType: 'adminpanel',tooltip: 'Crosis Logs',svg: 'Alien'}});"
                        );
                    }
                },
                { type: 'separator' },
                {
                    label: 'Re-connect to Discord',
                    click() {
                        mainApp.discordHandler.connectDiscord();
                    }
                },
                {
                    label: 'Disconnect from Discord',
                    click() {
                        mainApp.discordHandler.disconnectDiscord();
                    }
                },
                {
                    label: 'Clear All Cookies',
                    click() {
                        mainApp.clearCookies(false);
                    }
                },
                { type: 'separator' },
                {
                    role: 'quit'
                }
            ]
        },
        {
            label: 'Edit',
            submenu: [
                {
                    role: 'undo'
                },
                {
                    role: 'redo'
                },
                {
                    type: 'separator'
                },
                {
                    role: 'cut'
                },
                {
                    role: 'copy'
                },
                {
                    role: 'paste'
                },
                {
                    role: 'pasteAndMatchStyle'
                },
                {
                    role: 'delete'
                },
                {
                    role: 'selectAll'
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Copy URL to clipboard',
<<<<<<< HEAD
                    click(item: MenuItem, focusedWindow: BrowserWindow) {
=======
                    click(_: MenuItem, focusedWindow: ElectronWindow) {
>>>>>>> 4177374a5a8eb3d739d42a56b3360371b135c3f6
                        clipboard.writeText(focusedWindow.webContents.getURL());
                    }
                }
            ]
        },
        {
            label: 'Window',
            submenu: [
                {
                    label: 'Go Back',
<<<<<<< HEAD
                    click(item: any, focusedWindow: BrowserWindow) {
=======
                    click(_: any, focusedWindow: ElectronWindow) {
>>>>>>> 4177374a5a8eb3d739d42a56b3360371b135c3f6
                        if (focusedWindow.webContents.canGoBack()) {
                            focusedWindow.webContents.goBack();
                        }
                    }
                },
                {
                    label: 'Go Forward',
<<<<<<< HEAD
                    click(item: any, focusedWindow: BrowserWindow) {
=======
                    click(_: any, focusedWindow: ElectronWindow) {
>>>>>>> 4177374a5a8eb3d739d42a56b3360371b135c3f6
                        if (focusedWindow.webContents.canGoForward()) {
                            focusedWindow.webContents.goForward();
                        }
                    }
                },
                { type: 'separator' },
                {
                    label: 'Open Current Link in Default Browser',
<<<<<<< HEAD
                    click(item: any, focusedWindow: BrowserWindow) {
=======
                    click(_: any, focusedWindow: ElectronWindow) {
>>>>>>> 4177374a5a8eb3d739d42a56b3360371b135c3f6
                        shell
                            .openExternal(focusedWindow.webContents.getURL())
                            .then(() => {});
                    }
                },
                {
                    label: 'Go to Home',
<<<<<<< HEAD
                    click(item: any, focusedWindow: BrowserWindow) {
=======
                    click(_: any, focusedWindow: ElectronWindow) {
>>>>>>> 4177374a5a8eb3d739d42a56b3360371b135c3f6
                        focusedWindow.loadURL('https://repl.it/~').catch();
                    }
                },
                {
                    accelerator: 'CmdOrCtrl+f',
                    label: 'Select Input',
<<<<<<< HEAD
                    click(item: any, focusedWindow: BrowserWindow) {
                        selectInput(<ElectronWindow>focusedWindow);
=======
                    click(_: any, focusedWindow: ElectronWindow) {
                        selectInput(focusedWindow);
>>>>>>> 4177374a5a8eb3d739d42a56b3360371b135c3f6
                    }
                },
                { type: 'separator' },
                {
                    accelerator: 'CmdOrCtrl+R',
                    click(_: any, focusedWindow: ElectronWindow) {
                        if (focusedWindow) focusedWindow.reload();
                    },
                    label: 'Reload'
                },
                {
                    label: 'Toggle Developer Tools',
                    accelerator:
                        process.platform === 'darwin'
                            ? 'Alt+Command+I'
                            : 'Ctrl+Shift+I',
                    click(_: any, focusedWindow: ElectronWindow) {
                        if (focusedWindow)
                            focusedWindow.webContents.toggleDevTools();
                    }
                },
                { type: 'separator' },
                {
                    role: 'resetZoom'
                },
                {
                    role: 'zoomIn'
                },
                {
                    role: 'zoomOut'
                },
                {
                    type: 'separator'
                },
                {
                    role: 'togglefullscreen'
                },
                {
                    role: 'minimize'
                },
                {
                    role: 'close'
                }
            ]
        },
        {
            role: 'help',
            submenu: [
                { role: 'about' },
                {
                    label: 'Join the Replit discord',
                    click() {
                        shell.openExternal('https://repl.it/discord');
                    }
                },
                {
                    label: 'Learn More about Replit',
                    click() {
                        shell.openExternal('https://repl.it/site/about');
                    }
                },
                {
                    label: 'Report a Bug, or Request a Feature',
                    click() {
                        shell.openExternal(
                            'https://github.com/repl-it-discord/repl-it-electron/issues/new/choose'
                        );
                    }
                },
                {
<<<<<<< HEAD
                    label: 'Go to Github Page',
=======
                    label: 'What is replit?',
>>>>>>> 4177374a5a8eb3d739d42a56b3360371b135c3f6
                    click() {
                        shell.openExternal(
                            'https://github.com/repl-it-discord/repl-it-electron'
                        );
                    }
                }
            ]
        }
    ];
    return Menu.buildFromTemplate(template);
}

export { appMenuSetup };
