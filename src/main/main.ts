import { app, dialog, Menu } from 'electron';
// @ts-ignore
import path from 'path';
// @ts-ignore
import DiscordRPC from 'discord-rpc';
// @ts-ignore
import ElectronPrompt from 'electron-prompt';
// @ts-ignore
import ElectronContext from 'electron-context-menu';
import axios from 'axios';
/* Local libs */
// @ts-ignore
import ElectronPreferences from '../lib/electron-preferences';
import { ElectronWindow } from '../class';
/* Require files */
import {
    addTheme,
    capitalize,
    doUpdate,
    editing,
    errorMessage,
    getUrl,
    handleExternalLink,
    selectInput,
    talkBoard
} from '../util';

import { appMenuSetup } from './menu';
import MessageBoxReturnValue = Electron.MessageBoxReturnValue;

/* Declare Constants */
let mainWindow: ElectronWindow;
let subWindow: ElectronWindow;
const clientId = '498635999274991626';
let startTimestamp = new Date();
const rpc = new DiscordRPC.Client({
    transport: 'ipc'
});
let defaultUserAgent: string;

/* App's Setup */
async function appSetup() {
    let Themes: object = {};
    let themes: object = {};
    let res;
    try {
        // @ts-ignore
        res = await axios.get('https://www.darktheme.tk/themes.json');
    } catch (e) {
        console.error(e);
        return;
    }
    let theme_instert = [];
    let raw_themes = res.data;
    for (let key in raw_themes) {
        if (raw_themes.hasOwnProperty(key)) {
            // @ts-ignore
            themes[capitalize(key)] = raw_themes[key];
        }
    }

    // @ts-ignore
    Themes['Default White'] = '';
    theme_instert.push({
        label: 'Default White',
        value: 'Default White'
    });
    for (let theme in themes) {
        if (themes.hasOwnProperty(theme)) {
            // @ts-ignore
            let resp = await axios.get(
                // @ts-ignore
                `https://www.darktheme.tk/theme.css?${themes[theme]}`
            );
            // @ts-ignore
            Themes[theme] = resp.data.toString();
            theme_instert.push({
                label: theme.toString(),
                value: theme.toString()
            });
        }
    }

    /* Preferences */
    const Preferences = new ElectronPreferences({
        dataStore: path.resolve(app.getPath('userData'), 'Preferences.json'),
        defaults: {
            'app-theme': {
                theme: 'Default White',
                css_string: null,
                enable_custom_css: false
            },
            'update-settings': {
                'auto-update': true
            },
            'editor-settings': {
                editor: 'monaco'
            }
        },
        onLoad: (data: any) => {
            return data;
        },
        webPreferences: {
            devTools: true
        },
        sections: [
            {
                id: 'app-theme',
                label: 'App Theme',
                icon: 'widget',
                form: {
                    groups: [
                        {
                            fields: [
                                {
                                    label: 'Theme Select\n',
                                    key: 'theme',
                                    type: 'dropdown',
                                    options: theme_instert,
                                    help: 'Select a theme'
                                } /*{    
                        'label':
                         'Custom CSS import',
                        'key': 'css_string',
                        'type': 'Text',
                        'options': [{label: 'Yes', value: true}],
                        'help': 'Paste your CSS here to be applied in the app'
                    },

                    {
                        'label': 'Enable Custom CSS',
                        'key': 'enable_custom_css',
                        'type': 'radio',
                        'options': [{
                            'label': 'Yes',
                            'value': true
                        },
                            {
                                'label': 'No',
                                'value': false
                            }
                        ]
                    }*/
                            ]
                        }
                    ]
                }
            },
            {
                id: 'update-settings',
                label: 'Update Settings',
                icon: 'square-download',
                form: {
                    groups: [
                        {
                            fields: [
                                {
                                    label: 'Auto Update',
                                    key: 'auto-update',
                                    type: 'radio',
                                    options: [
                                        {
                                            label: 'Yes',
                                            value: true
                                        },
                                        {
                                            label: 'No',
                                            value: false
                                        }
                                    ],
                                    help: 'Enable/Disable auto update.'
                                }
                            ]
                        }
                    ]
                }
            },
            {
                id: 'editor-settings',
                label: 'Editor Settings',
                icon: 'single-folded-content',
                form: {
                    groups: [
                        {
                            fields: [
                                {
                                    label: 'Editor Selection',
                                    key: 'editor',
                                    type: 'dropdown',
                                    options: [
                                        { label: 'Monaco', value: 'monaco' },
                                        { label: 'Ace', value: 'ace' }
                                    ],
                                    help: 'The editor to be used in repl.it'
                                }
                            ]
                        }
                    ]
                }
            }
        ]
    });
    Menu.setApplicationMenu(
        Menu.buildFromTemplate(
            // @ts-ignore
            appMenuSetup(
                startSubWindow,
                Preferences,
                startCustomSession,
                sendSubToMain,
                selectInput,
                doUpdate
            )
        )
    );

    Preferences.on('save', () => {
        console.log(
            `Preferences were saved. at ${path.resolve(
                app.getPath('userData'),
                'Preferences.json'
            )}`
            //JSON.stringify(preferences, null, 4)
        );
        if (mainWindow) {
            addTheme(
                mainWindow,
                // @ts-ignore
                Themes[Preferences.value('app-theme')['theme']]
            );
            if (Preferences.value('editor-settings')['editor'] === 'ace') {
                mainWindow.webContents.setUserAgent(
                    `Mozilla/5.0 (iPad) repl.it/${app.getVersion()}`
                );
                mainWindow.reload();
            } else {
                mainWindow.webContents.setUserAgent(defaultUserAgent);
                mainWindow.reload();
            }
        }
        if (subWindow) {
            addTheme(
                subWindow,
                // @ts-ignore
                Themes[Preferences.value('app-theme')['theme']]
            );
            if (Preferences.value('editor-settings')['editor'] === 'ace') {
                subWindow.webContents.setUserAgent(
                    `Mozilla/5.0 (iPad) repl.it/${app.getVersion()}`
                );
                subWindow.reload();
            } else {
                mainWindow.webContents.setUserAgent(defaultUserAgent);
                subWindow.reload();
            }
        }
    });

    doUpdate(Preferences.value('update-settings')['auto-update'], false);
    if (mainWindow) {
        if (Preferences.value('editor-settings')['editor'] === 'ace') {
            mainWindow.webContents.setUserAgent(
                `Mozilla/5.0 (iPad) repl.it/${app.getVersion()}`
            );
        }
        mainWindow.webContents.on('did-start-navigation', () => {
            addTheme(
                mainWindow,
                // @ts-ignore
                Themes[Preferences.value('app-theme')['theme']]
            );
        });
    }
    if (subWindow) {
        // @ts-ignore
        addTheme(subWindow, Themes[Preferences.value('app-theme')['theme']]);
        subWindow.webContents.on('did-start-navigation', () => {
            addTheme(
                subWindow,
                // @ts-ignore
                Themes[Preferences.value('app-theme')['theme']]
            );
        });
    }
}

appSetup().then(
    () => {
        console.log('App setup success.');
    },
    reason => {
        console.error(reason);
    }
);

/* Custom Session Handler */
function startCustomSession() {
    ElectronPrompt({
        title: 'Join Multiplayer',
        label: 'URL:',
        value: 'https://repl.it/',
        inputAttrs: {
            type: 'url'
        },
        customStylesheet: path.resolve(__dirname, 'promptDark.css')
    })
        .then((r: any) => {
            if (r === undefined || r === null) {
                return;
            }
            if (
                r.toString().replace(' ', '') === '' ||
                !r.toString().startsWith('https://repl.it/') ||
                !r.toString().includes('repl.co') ||
                !r.toString().includes('repl.run')
            ) {
                dialog.showMessageBox({
                    title: '',
                    message: `Please input a valid URL.`,
                    type: 'info',
                    buttons: ['OK'],
                    defaultId: 0
                });
            } else {
                if (!subWindow.isVisible()) {
                    dialog
                        .showMessageBox({
                            title: '',
                            message: `Do you want to load ${r} in window 2?`,
                            type: 'info',
                            buttons: ['Yes', 'No'],
                            defaultId: 0
                        })
                        .then(function(resp: MessageBoxReturnValue) {
                            const index = resp.response;
                            if (index === 0) {
                                subWindow.loadURL(r);
                            } else {
                            }
                        });
                } else {
                    startSubWindow();
                }
            }
        })
        .catch(console.error);
}

async function setPlayingDiscord() {
    let url = getUrl(mainWindow);
    let spliturl = url.split('/');

    if (spliturl[0] === 'repls') {
        rpc.setActivity({
            details: `Browsing Repls`,
            state: `repl.it/${url}`,
            startTimestamp,
            largeImageKey: 'logo',
            largeImageText: 'Repl.it',
            instance: false
        }).then();
    } else if (spliturl[0] === 'talk') {
        talkBoard(spliturl, mainWindow).then(
            (res: any) => {
                rpc.setActivity({
                    state: `${res.viewing}`,
                    details: `In Repl Talk ${res.talkBoard}`,
                    startTimestamp,
                    largeImageKey: 'logo',
                    largeImageText: 'Repl.it',
                    smallImageKey: 'talk',
                    smallImageText: 'Repl Talk',
                    instance: false
                }).catch((reason: string) => {
                    console.error(`error@talk board ${reason}`);
                });
            },
            (reason: string) => {
                console.error(`Set Talk board Failed ${reason}`);
            }
        );
    } else if (spliturl[0][0] === '@' && spliturl[1] !== undefined) {
        editing(mainWindow).then(
            (res: any) => {
                rpc.setActivity({
                    details: `Editing: ${res.fileName}`,
                    state: `${url} `,
                    startTimestamp,
                    smallImageKey: 'logo',
                    smallImageText: 'Repl.it',
                    largeImageKey: res.lang,
                    largeImageText: res.lang,
                    instance: false
                }).catch((reason: string) => {
                    console.error(`error@editing ${reason}`);
                });
            },
            (reason: string) => {
                console.error(`Set editing failed ${reason}`);
            }
        );
    } else if (spliturl[0] === 'talk') {
        rpc.setActivity({
            details: `In Repl Talk`,
            state: `repl.it/${url}`,
            startTimestamp,
            largeImageKey: 'talk',
            largeImageText: 'Repl Talk',
            smallImageKey: 'logo',
            smallImageText: 'Repl.it',
            instance: false
        }).catch((reason: string) => {
            console.error(`error@talk ${reason}`);
        });
    } else if (spliturl[0][0] === '@') {
        rpc.setActivity({
            details: `Looking at ${spliturl[0]}'s profile`,
            state: `repl.it/${url}`,
            startTimestamp,
            largeImageKey: 'logo',
            largeImageText: 'Repl.it',
            instance: false
        }).catch((reason: string) => {
            console.debug(`error@profile ${reason}`);
        });
    } else if (spliturl[0] === 'account') {
        rpc.setActivity({
            details: `Changing account settings`,
            state: `repl.it/${url}`,
            startTimestamp,
            largeImageKey: 'logo',
            largeImageText: 'Repl.it',
            instance: false
        }).catch((reason: string) => {
            console.debug(`error@acount ${reason}`);
        });
    } else {
        rpc.setActivity({
            details: `On Repl.it`,
            state: `repl.it/${url}`,
            startTimestamp,
            largeImageKey: 'logo',
            largeImageText: 'Repl.it',
            instance: false
        }).catch((reason: string) => {
            console.error(`error@main ${reason}`);
        });
    }
}

function sendSubToMain() {
    if (subWindow) {
        let subUrl = subWindow.webContents.getURL();
        dialog
            .showMessageBox({
                title: '',
                message: `Do you want to load ${subUrl} in window 1?`,
                type: 'info',
                buttons: ['Yes', 'No'],
                defaultId: 0
            })
            .then(function(resp: MessageBoxReturnValue) {
                const index = resp.response;
                if (index === 0) {
                    mainWindow.loadURL(subUrl);
                } else {
                }
            });
    }
}

function startSubWindow() {
    if (subWindow.isVisible()) {
        return;
    }
    let url = mainWindow.webContents.getURL();
    if (!url) {
        url = 'https://repl.it/repls';
    }
    subWindow.loadURL(url);
    subWindow.show();
}

function createSubWindow() {
    subWindow = new ElectronWindow({
        width: mainWindow.getSize()[0] - 10,
        height: mainWindow.getSize()[1] - 10,
        minWidth: 600,
        minHeight: 600,
        title: 'Repl.it',
        icon: path.resolve(__dirname, 'utils/logo.png'),
        parent: mainWindow,
        webPreferences: { nodeIntegration: false },
        show: false
    });
    subWindow.setBackgroundColor('#393c42');
    subWindow.InternalId = 2;
    subWindow.webContents.on(
        'did-fail-load',
        (event: any, errorCode: number, errorDescription: string) => {
            errorMessage(subWindow, errorCode, errorDescription);
        }
    );
    subWindow.webContents.on('will-navigate', (event: any, url: string) => {
        handleExternalLink(subWindow, url);
    });
    subWindow.on('unresponsive', () => {
        subWindow.reload();
    });
    subWindow.on('close', (event: any) => {
        event.preventDefault();
        subWindow.hide();
    });
}

function createWindow() {
    mainWindow = new ElectronWindow({
        width: 1280,
        height: 800,
        minWidth: 600,
        minHeight: 600,
        title: 'Repl.it',
        webPreferences: { nodeIntegration: false },
        icon: path.resolve(__dirname, 'utils/logo.png')
    });
    defaultUserAgent = mainWindow.webContents.getUserAgent();
    mainWindow.InternalId = 1;
    mainWindow.webContents.on(
        'did-fail-load',
        (event: any, errorCode: number, errorDescription: string) => {
            errorMessage(mainWindow, errorCode, errorDescription);
        }
    );
    mainWindow.on('close', () => {
        process.exit(0);
    });
    mainWindow.webContents.on('will-navigate', (event: any, url: string) => {
        // @ts-ignore
        handleExternalLink(mainWindow, url);
    });
    mainWindow.on('unresponsive', () => {
        mainWindow.reload();
    });
    mainWindow.loadURL('https://repl.it/repls');
    createSubWindow();
}

ElectronContext({
    showCopyImageAddress: true,
    showSaveImageAs: true,
    showInspectElement: true
});

rpc.on('ready', () => {
    // activity can only be set every 15 seconds
    setInterval(() => {
        setPlayingDiscord().catch(reason => {
            console.log('Failed to update Discord status. ' + reason);
        });
    }, 15e3);
});
app.on('window-all-closed', function() {
    app.quit();
});
app.on('ready', () => {
    createWindow();
});

rpc.login({ clientId }).catch((error: any) => {
    console.error(error);
});
