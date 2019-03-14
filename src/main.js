/* Require Packages */
const {app, BrowserWindow, Menu, dialog} = require('electron');
const path = require('path');
const DiscordRPC = require('discord-rpc');
const ElectronPrompt = require('electron-prompt');
const ElectronContext = require('electron-context-menu');
const requests = require('axios');

/* Local libs */
const ElectronPreferences = require(path.resolve(
    __dirname,
    'lib',
    'electron-preferences'
));

const {
    addTheme,
    capitalize,
    doUpdate,
    errorMessage,
    getUrl,
    handleExternalLink,
    selectInput,
    setDiscordStatus,
} = require(path.resolve(__dirname, 'lib', 'functions'));
const {appMenuSetup} = require(path.resolve(__dirname, 'lib', 'constants'));

/* Declare Constants */
let mainWindow;
let subWindow = undefined;
const clientId = '498635999274991626';
let startTimestamp = new Date();
const rpc = new DiscordRPC.Client({
    transport: 'ipc'
});

/* App SetUp's */

async function appSetup() {
    let Themes = {};
    let themes = {};
    try {
        var res = await requests.get('https://www.darktheme.tk/themes.json');
    } catch (e) {
        console.error(e);
        return;
    }
    let theme_instert = [];
    let raw_themes = res.data;
    for (let key in raw_themes) {
        if (raw_themes.hasOwnProperty(key)) {
            themes[capitalize(key)] = raw_themes[key];
        }
    }

    Themes['Default White'] = '';
    theme_instert.push({
        label: 'Default White',
        value: 'Default White'
    });
    for (let theme in themes) {
        if (themes.hasOwnProperty(theme)) {
            let resp = await requests.get(
                `https://www.darktheme.tk/theme.css?${themes[theme]}`
            );
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
            }
        },
        onLoad: data => {
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
                        'label': 'Custom CSS import',
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
            }
            /*{
                'id': 'editor-settings',
                'label': 'Editor Settings',
                'icon': 'single-folded-content',
                'form': {
                    'groups': [{
                        'fields': [{
                            'label': 'Font size',
                            'key': 'font-size',
                            'type': 'text',
                            'help': 'Font size in px for the editor.'
                        }]
                    }]
                }
            }*/
        ]
    });
    Menu.setApplicationMenu(
        Menu.buildFromTemplate(
            appMenuSetup(
                startSubWindow,
                Preferences,
                startCustomSession,
                sendSubToMain,
                selectInput
            )
        )
    );

    Preferences.on('save', preferences => {
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
                Themes[Preferences.value('app-theme')['theme']]
            );
        }
        if (subWindow) {
            addTheme(
                subWindow,
                Themes[Preferences.value('app-theme')['theme']]
            );
        }
    });

    doUpdate(Preferences.value('update-settings')['auto-update']);
    if (mainWindow) {
        mainWindow.on('ready-to-show', () => {
            addTheme(
                mainWindow,
                Themes[Preferences.value('app-theme')['theme']]
            );
            mainWindow.show();
        })
        addTheme(mainWindow, Themes[Preferences.value('app-theme')['theme']]);
        mainWindow.webContents.on('did-stop-loading', () => {
            addTheme(
                mainWindow,
                Themes[Preferences.value('app-theme')['theme']]
            );
        });
    }
    if (subWindow) {
        addTheme(subWindow, Themes[Preferences.value('app-theme')['theme']]);
        subWindow.webContents.on('did-stop-loading', () => {
            addTheme(
                subWindow,
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
        .then(r => {
            if (r === undefined || r === null) {
                return;
            }
            if (
                r.toString().replace(' ', '') === '' ||
                !r.toString().startsWith('https://repl.it/') ||
                !r
                    .toString()
                    .includes('repl.co' || !r.toString().includes('repl.run'))
            ) {
                dialog.showMessageBox({
                    title: '',
                    message: `Please input a valid URL.`,
                    type: 'info',
                    buttons: ['OK'],
                    defaultId: 0
                });
            } else {
                if (subWindow !== undefined) {
                    dialog.showMessageBox(
                        {
                            title: '',
                            message: `Do you want to load ${r} in window 2?`,
                            type: 'info',
                            buttons: ['Yes', 'No'],
                            defaultId: 0
                        },
                        index => {
                            if (index === 0) {
                                subWindow.loadURL(r);
                            } else {
                            }
                        }
                    );
                } else {
                    startSubWindow(r);
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
        setDiscordStatus.talkBoard(spliturl, mainWindow).then(
            res => {
                rpc.setActivity({
                    state: `${res.viewing}`,
                    details: `In Repl Talk ${res.talkBoard}`,
                    startTimestamp,
                    largeImageKey: 'logo',
                    largeImageText: 'Repl.it',
                    smallImageKey: 'talk',
                    smallImageText: 'Repl Talk',
                    instance: false
                }).catch(reason => {
                    console.error(`error@talk board ${reason}`);
                });
            },
            reason => {
                console.error(`Set Talk board Failed ${reason}`);
            }
        );
    } else if (spliturl[0][0] === '@' && spliturl[1] !== undefined) {
        setDiscordStatus.editing(spliturl, mainWindow).then(
            res => {
                rpc.setActivity({
                    details: `Editing: ${res.fileName}`,
                    state: `${url} `,
                    startTimestamp,
                    smallImageKey: 'logo',
                    smallImageText: 'Repl.it',
                    largeImageKey: res.lang,
                    largeImageText: res.lang,
                    instance: false
                }).catch(reason => {
                    console.error(`error@editing ${reason}`);
                });
            },
            reason => {
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
        }).catch(reason => {
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
        }).catch(reason => {
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
        }).catch(reason => {
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
        }).catch(reason => {
            console.error(`error@main ${reason}`);
        });
    }
}

function startSubWindow() {
    let url = mainWindow.webContents.getURL();
    if (!url) {
        url = 'https://repl.it/repls';
    }
    if (subWindow !== undefined) {
        return;
    }
    subWindow = new BrowserWindow({
        width: mainWindow.getSize()[0] - 10,
        height: mainWindow.getSize()[1] - 10,
        minWidth: 600,
        minHeight: 600,
        title: 'Repl.it',
        icon: path.resolve(__dirname, 'utils/logo.png'),
        parent: mainWindow,
        webPreferences: {nodeIntegration: false}
    });
    subWindow.setBackgroundColor('#393c42');
    subWindow.InternalId = 2;
    if (url) {
        subWindow.loadURL(url);
    } else {
        subWindow.loadURL('https://repl.it/repls');
    }
    subWindow.webContents.on(
        'did-fail-load',
        (event, errorCode, errorDescription) => {
            errorMessage(subWindow, errorCode, errorDescription);
        }
    );
    subWindow.webContents.on('did-start-loading', (event, url) => {
        handleExternalLink(subWindow, url);
    });
    subWindow.on('unresponsive', () => {
        subWindow.reload(true);
    });
}

function sendSubToMain() {
    if (subWindow) {
        let subUrl = subWindow.getURL();
        dialog.showMessageBox(
            {
                title: '',
                message: `Do you want to load ${subUrl} in window 1?`,
                type: 'info',
                buttons: ['Yes', 'No'],
                defaultId: 0
            },
            index => {
                if (index === 0) {
                    mainWindow.loadURL(subUrl);
                } else {
                }
            }
        );
    }
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 600,
        minHeight: 600,
        title: 'Repl.it',
        webPreferences: {nodeIntegration: false},
        //show:false,
        icon: path.resolve(__dirname, 'utils/logo.png')
    });
    mainWindow.setBackgroundColor('#393c42');
    mainWindow.InternalId = 1;
    mainWindow.webContents.on(
        'did-fail-load',
        (event, errorCode, errorDescription) => {
            errorMessage(mainWindow, errorCode, errorDescription);
        }
    );
    mainWindow.on('close', () => {
        app.quit();
    });
    mainWindow.webContents.on('will-navigate', (event, url) => {
        handleExternalLink(mainWindow, url);
    });
    mainWindow.on('unresponsive', () => {
        mainWindow.reload();
    })
    mainWindow.loadURL('https://repl.it/repls');

}

ElectronContext({
    showCopyImageAddress: true,
    showSaveImageAs: true,
    showInspectElement: true
});

rpc.on('ready', () => {
    // activity can only be set every 15 seconds
    setInterval(() => {
        setPlayingDiscord().catch((reason) => {
            console.log('Failed to update Discord status. ' + reason);
        });
    }, 15e3);
});
app.on('window-all-closed', function () {
    app.quit();
});
app.on('ready', () => {
    createWindow();
});

rpc.login({clientId: clientId}).catch((error) => {
    console.error(error);
});
