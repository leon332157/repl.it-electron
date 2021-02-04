import {
    clipboard,
    Menu,
    MenuItemConstructorOptions,
    MenuItem,
    shell
} from 'electron';
import { ElectronWindow, PLATFORM, selectInput } from '../../common';
import { ThemeHandler } from '../themeHandler/themeHandler';
import { App } from '../app';
import { SettingHandler } from '../settingHandler';
import set = Reflect.set;

function appMenuSetup(
    mainApp: App,
    themeHandler: ThemeHandler,
    settings: SettingHandler
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
                        mainApp.clearCookies(false).then();
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
                    click(_: MenuItem, focusedWindow: ElectronWindow) {
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
                    click(_: any, focusedWindow: ElectronWindow) {
                        if (focusedWindow.webContents.canGoBack()) {
                            focusedWindow.webContents.goBack();
                        }
                    }
                },
                {
                    label: 'Go Forward',
                    click(_: any, focusedWindow: ElectronWindow) {
                        if (focusedWindow.webContents.canGoForward()) {
                            focusedWindow.webContents.goForward();
                        }
                    }
                },
                { type: 'separator' },
                {
                    label: 'Open Current Link in Default Browser',
                    click(_: any, focusedWindow: ElectronWindow) {
                        shell
                            .openExternal(focusedWindow.webContents.getURL())
                            .then(() => {});
                    }
                },
                {
                    label: 'Go to Home',
                    click(_: any, focusedWindow: ElectronWindow) {
                        focusedWindow.loadURL('https://repl.it/~').catch();
                    }
                },
                {
                    accelerator: 'CmdOrCtrl+f',
                    label: 'Select Input',
                    click(_: any, focusedWindow: ElectronWindow) {
                        selectInput(focusedWindow);
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
                {
                    label: 'What is replit?',
                    click() {
                        shell.openExternal('https://repl.it/site/about').then();
                    }
                }
            ]
        }
    ];
    if (PLATFORM == 'darwin') {
        //@ts-ignore
        template[template.length - 1].submenu.push({ role: 'about' });
    }
    // @ts-ignore
    return Menu.buildFromTemplate(template);
}

export { appMenuSetup };
