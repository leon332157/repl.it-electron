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
                    label: 'Themes',
                    submenu: [
                        {
                            label: 'Choose Theme',
                            click() {
                                themeHandler.openWindow();
                            }
                        },
                        {
                            label: 'Make Theme',
                            click() {
                                themeHandler.openMaker();
                            }
                        }
                    ]
                },
                {
                    label: 'Popup',
                    click(i: MenuItem, win: BrowserWindow) {
                        popoutHandler.launch(<ElectronWindow>win);
                    }
                },
                {
                    label: 'Use Ace Editor',
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
                            "window.store.dispatch({type: 'LOAD_PLUGIN',pluginPud: 'adminpanel',pluginType: 'adminpanel',title: 'adminpanel'});window.store.dispatch({type: 'ADD_SIDE_NAV_ITEM',navItem: {pud: 'adminpanel',pluginType: 'adminpanel',tooltip: 'Crosis Logs',svg: 'Alien'}});"
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
                    click(item: MenuItem, focusedWindow: BrowserWindow) {
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
                    click(item: any, focusedWindow: BrowserWindow) {
                        if (focusedWindow.webContents.canGoBack()) {
                            focusedWindow.webContents.goBack();
                        }
                    }
                },
                {
                    label: 'Go Forward',
                    click(item: any, focusedWindow: BrowserWindow) {
                        if (focusedWindow.webContents.canGoForward()) {
                            focusedWindow.webContents.goForward();
                        }
                    }
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Open Current Link in Default Browser',
                    click(item: any, focusedWindow: BrowserWindow) {
                        shell
                            .openExternal(focusedWindow.webContents.getURL())
                            .then((r) => {});
                    }
                },
                {
                    label: 'Go to Home',
                    click(item: any, focusedWindow: BrowserWindow) {
                        focusedWindow.loadURL('https://repl.it/~').catch();
                    }
                },
                {
                    accelerator: 'CmdOrCtrl+f',
                    label: 'Select Input',
                    click(item: any, focusedWindow: BrowserWindow) {
                        selectInput(<ElectronWindow>focusedWindow);
                    }
                },
                {
                    type: 'separator'
                },
                {
                    accelerator: 'CmdOrCtrl+R',
                    click(item: any, focusedWindow: ElectronWindow) {
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
                    click(item: any, focusedWindow: ElectronWindow) {
                        if (focusedWindow)
                            focusedWindow.webContents.toggleDevTools();
                    }
                },
                {
                    type: 'separator'
                },
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
                    label: 'Go to Github Page',
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
