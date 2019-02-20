/* Require Packages */
const { app, BrowserWindow, Menu, dialog, shell } = require('electron');
const DiscordRPC = require('discord-rpc');
const fs = require('fs');
const ElectronPrompt = require('electron-prompt');
const request = require('request');
const ChromeErrors = require('chrome-network-errors');
const ElectronPreferences = require('electron-preferences');
const path = require('path');
const EBU = require(__dirname + '/electron-basic-updater');
const ElectronContext = require('electron-context-menu');

/* Declare Constants */
let DarkCSS;
var Dark;
let mainWindow;
var subWindow = undefined;

let Update;

/* Constant Variables */
const clientId = '498635999274991626';
var startTimestamp = new Date();
const rpc = new DiscordRPC.Client({
    transport: 'ipc'
});

/* Preferences */
const Preferences = new ElectronPreferences({
    dataStore: path.resolve(app.getPath('userData'), 'Preferences.json'),
    defaults: {
        'app-theme': {
            dark: false
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
            icon: 'preferences',
            form: {
                groups: [
                    {
                        fields: [
                            {
                                label: 'Dark Theme',
                                key: 'dark',
                                type: 'radio',
                                options: [
                                    { label: 'Yes', value: true },
                                    { label: 'No', value: false }
                                ],
                                help: 'Enable/Disable dark theme.'
                            }
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
Preferences.on('save', preferences => {
    console.log(
        `Preferences were saved.`,
        JSON.stringify(preferences, null, 4)
    );
    Dark = Preferences.value('app-theme').dark;
    mainWindow.reload();
    if (subWindow) {
        subWindow.reload();
    }
});

Dark = Preferences.value('app-theme').dark;
Update = Preferences.value('update-settings')['auto-update'];

/* Menu Template */
const template = [
    {
        label: 'Main',
        submenu: [
            {
                label: 'New Window',
                accelerator: 'CmdOrCtrl+N',
                click() {
                    startSubWindow(mainWindow.webContents.getURL());
                }
            },
            {
                label: 'Join Multiplayer/Custom Repl.it Links',
                accelerator: 'CmdOrCtrl+L',
                click() {
                    startCustomSession();
                }
            },
            {
                label: 'Preference',
                accelerator: 'CmdOrCtrl+,',
                click() {
                    startPreferenceWindow();
                }
            },
            {
                type: 'separator'
            },
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
                role: 'pasteandmatchstyle'
            },
            {
                role: 'delete'
            },
            {
                role: 'selectall'
            },
            {
                type: 'separator'
            }
        ]
    },
    {
        label: 'View',
        submenu: [
            {
                label: 'Go Back',
                click(item, focusedWindow) {
                    if (focusedWindow.webContents.canGoBack()) {
                        focusedWindow.webContents.goBack();
                    }
                }
            },
            {
                label: 'Go Forward',
                click(item, focusedWindow) {
                    if (focusedWindow.webContents.canGoForward()) {
                        focusedWindow.webContents.goForward();
                    }
                }
            },
            {
                type: 'separator'
            },
            {
                label: 'Dark Mode',
                accelerator: 'F10',
                click(item, focusedWindow) {
                    Dark = true;
                    Preferences.value('app-theme', { dark: true });
                    addDark(focusedWindow, Dark);
                }
            },
            {
                label: 'Dark Mode Off',
                accelerator: 'F9',
                click(item, focusedWindow) {
                    Dark = false;
                    try {
                        Preferences.value('app-theme', { dark: false });
                    } catch (e) {
                        console.error(e);
                    }
                    focusedWindow.reload();
                }
            },
            {
                label: 'Select Input',
                accelerator: 'CmdOrCtrl+f',
                click(item, focusedWindow) {
                    selectInput(focusedWindow);
                }
            },
            {
                type: 'separator'
            },
            {
                label: 'Reload',
                accelerator: 'CmdOrCtrl+R',
                click(item, focusedWindow) {
                    if (focusedWindow) focusedWindow.reload();
                }
            },
            {
                label: 'Toggle Developer Tools',
                accelerator:
                    process.platform === 'darwin'
                        ? 'Alt+Command+I'
                        : 'Ctrl+Shift+I',
                click(item, focusedWindow) {
                    if (focusedWindow)
                        focusedWindow.webContents.toggleDevTools();
                }
            },
            {
                type: 'separator'
            },
            {
                role: 'resetzoom'
            },
            {
                role: 'zoomin'
            },
            {
                role: 'zoomout'
            },
            {
                type: 'separator'
            },
            {
                role: 'togglefullscreen'
            }
        ]
    },
    {
        role: 'window',
        submenu: [
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
                label: 'Learn More',
                click() {
                    require('electron').shell.openExternal('https://repl.it');
                }
            }
        ]
    }
];
if (process.platform === 'darwin') {
    const name = app.getName();
    template.unshift({
        label: name,
        submenu: [
            {
                role: 'about'
            },
            {
                type: 'separator'
            },
            {
                role: 'services',
                submenu: []
            },
            {
                type: 'separator'
            },
            {
                role: 'hide'
            },
            {
                role: 'hideothers'
            },
            {
                role: 'unhide'
            },
            {
                type: 'separator'
            },
            {
                role: 'quit'
            }
        ]
    });
    // Edit menu.
    template[1].submenu.splice(-1);
    template[2].submenu.push(
        {
            type: 'separator'
        },
        {
            label: 'Speech',
            submenu: [
                {
                    role: 'startspeaking'
                },
                {
                    role: 'stopspeaking'
                }
            ]
        }
    );
    // Window menu.
    template[4].submenu = [
        {
            label: 'Close',
            accelerator: 'CmdOrCtrl+W',
            role: 'close'
        },
        {
            label: 'Minimize',
            accelerator: 'CmdOrCtrl+M',
            role: 'minimize'
        },
        {
            label: 'Zoom',
            role: 'zoom'
        },
        {
            type: 'separator'
        },
        {
            label: 'Bring All to Front',
            role: 'front'
        }
    ];
}
const menu = Menu.buildFromTemplate(template);

/* Load the dark theme CSS */
request('https://darktheme.tk/darktheme.css', function(error, response, body) {
    if (body === undefined) {
        if (error) {
            fs.readFile(__dirname + '/styles/dark.css', function(err, data) {
                if (err) {
                    throw err;
                }
                return (DarkCSS = data.toString());
            });
        }
    } else {
        return (DarkCSS = body.toString());
    }
});

//Editor TODO: Font size settings for Editor
//Editor TODO:Add custom themes from css.
//TODO: Add change log for new updates.

/* Auto update function */
function doUpdate() {
    if (!Update) {
        return;
    }
    EBU.init({
        api: 'https://replit-electron-updater.leon332157.repl.co/check/' // The API EBU will talk to
    });
    EBU.check(function(result) {
        console.log(result);
        if (result.toString().startsWith('has_update|')) {
            dialog.showMessageBox(
                {
                    title: 'Update available',
                    message: `New version ${
                        result.toString().split('|')[1]
                    } is available, would you like to update it?

New features:
${result.toString().split('|')[2]}
`,
                    type: 'info',
                    buttons: ['Yes', 'No'],
                    defaultId: 1
                },
                function(index) {
                    if (index === 0) {
                        //mainWindow.hide();
                        EBU.download(true, function(result) {
                            if (result.toString() === 'success') {
                                dialog.showMessageBox({
                                    title: 'Update success',
                                    message: `Update was successful, please restart the app.`,
                                    type: 'info'
                                });
                                process.exit(0);
                            } else {
                                dialog.showMessageBox({
                                    title: 'Update failed',
                                    message: `Update failed, please check log file at ${path.dirname(
                                        app.getAppPath() + path.sep
                                    ) + path.sep}.`,
                                    type: 'info'
                                });
                            }
                        });
                    }
                }
            );
        }
    });
}

function ErrorMessage(windowObject, errorCode) {
    dialog.showMessageBox(
        {
            title: 'Loading Failed',
            message: `loading Failed on window ${
                windowObject.InternalId
            } reason ${ChromeErrors[errorCode]}, do you want to try again?`,
            type: 'error',
            buttons: ['Try again please', 'Quit'],
            defaultId: 0
        },
        function(index) {
            // if clicked "Try again please"
            if (index === 0) {
                windowObject.reload();
            } else {
                app.quit();
            }
        }
    );
}

function addDark(windowObj, arg) {
    if (arg) {
        try {
            windowObj.webContents.insertCSS(DarkCSS);
            console.debug(`DarkCSS Added for ${windowObj.InternalId}`);
        } catch (e) {
            console.error(`Error adding dark theme on ${e}`);
        }
        return;
    }
    console.log(`nope for ${windowObj.InternalId}`);
}

function startPreferenceWindow() {
    Preferences.show();
}

function startCustomSession() {
    ElectronPrompt({
        title: 'Join Multiplayer',
        label: 'URL:',
        value: 'https://repl.it/',
        inputAttrs: {
            type: 'url'
            //required: true
        },
        customStylesheet: Dark
            ? __dirname + '/styles/promptDark.css'
            : __dirname + '/styles/prompt.css'
    })
        .then(r => {
            if (r === undefined || r === null) {
                return;
            }
            if (
                r.toString().replace(' ', '') === '' ||
                !r.toString().startsWith('https://repl.it/')
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

function getUrl() {
    try {
        var url = mainWindow.webContents
            .getURL()
            .replace(/(^\w+:|^)\/\/repl\.it\//, '');
        url = url.split('?')[0];
        return url;
    } catch (e) {
        return '';
    }
}

var urlbefore = '';
var urlnow = '';

function setUrl() {
    urlbefore = urlnow;
    urlnow = getUrl();
    if (urlbefore !== urlnow) {
        startTimestamp = new Date();
    }
    if (mainWindow === undefined) {
        return;
    }
    try {
        mainWindow.webContents
            .executeJavaScript(
                `
users=document.querySelectorAll('.jsx-1145327309:not(.leaderboard-list-item),a.jsx-774577553')
for (user in users) {
try{
user=users[user]
if (user.textContent.startsWith('ReplTalk ')) {
user.classList.add('bot');
}
}catch(e){}
}`
            )
            .catch(ret => {});
    } catch (e) {}
}

async function setPlayingDiscord() {
    var url = getUrl();
    var spliturl = url.split('/');

    if (spliturl[0] === 'repls') {
        rpc.setActivity({
            details: `Browsing Repls`,
            state: `repl.it/${url}`,
            startTimestamp,
            largeImageKey: 'logo',
            largeImageText: 'Repl.it',
            instance: false
        });
    } else if (spliturl[0] === 'talk') {
        let viewing;
        if (spliturl[3] !== undefined) {
            await mainWindow.webContents.executeJavaScript(
                "document.getElementsByClassName('board-post-detail-title')[0].textContent",
                function(result) {
                    viewing = `Viewing ${result}`;
                }
            ); // gets the repl talk post name
        } else {
            viewing = url;
        }
        var talkBoard = 'error';
        switch (spliturl[1]) {
            case 'announcements':
                talkBoard = 'Announcements';
                break;
            case 'ask':
                talkBoard = 'Ask';
                break;
            case 'challenge':
                talkBoard = 'Challenge';
                break;
            case 'learn':
                talkBoard = 'Learn';
                break;
            case 'share':
                talkBoard = 'Share';
                break;
            default:
                talkBoard = '';
        }
        console.log(talkBoard);
        rpc.setActivity({
            state: `${viewing}`,
            details: `In Repl Talk ${talkBoard}`,
            startTimestamp,
            largeImageKey: 'logo',
            largeImageText: 'Repl.it',
            smallImageKey: 'talk',
            smallImageText: 'Repl Talk',
            instance: false
        });
    } else if (spliturl[0][0] === '@' && spliturl[1] !== undefined) {
        var fileName = 'Error';
        var replName = 'Error';
        var replLanguage = 'Error';
        await mainWindow.webContents.executeJavaScript(
            "document.querySelector('.file-header-name div').textContent",
            function(result) {
                fileName = result;
            }
        );
        await mainWindow.webContents.executeJavaScript(
            "document.getElementsByTagName('title')[0].textContent.split('-').pop()",
            function(result) {
                replName = result;
            }
        );
        await mainWindow.webContents.executeJavaScript(
            "document.querySelector('.workspace-header-description-container img')['title']",
            function(result) {
                replLanguage = result;
            }
        );

        var fileExtension = fileName.split('.').slice(-1)[0]; // gets the file extension
        var lang = fileExtension;
        if (replLanguage === 'Nodejs') {
            lang = 'node';
        }
        const langsJson = {
            py: 'python',
            cpp: 'cpp',
            cs: 'csharp',
            html: 'html',
            css: 'css',
            js: 'javascript',
            node: 'nodejs',
            java: 'java',
            rb: 'ruby',
            txt: 'txt',
            go: 'go',
            lua: 'lua',
            sh: 'sh',
            Unknown: 'txt'
        };

        if (!(lang in langsJson)) {
            lang = 'Unknown';
        }
        rpc.setActivity({
            details: `Editing: ${fileName}`,
            state: `${url} `,
            startTimestamp,
            smallImageKey: 'logo',
            smallImageText: 'Repl.it',
            largeImageKey: langsJson[lang],
            largeImageText: langsJson[lang],
            instance: false
        }).catch(ret => {
            console.debug(`error@editing ${ret}`);
        });
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
        }).catch(ret => {
            console.debug(`error@talk ${ret}`);
        });
    } else if (spliturl[0][0] === '@') {
        rpc.setActivity({
            details: `Looking at ${spliturl[0]}'s profile`,
            state: `repl.it/${url}`,
            startTimestamp,
            largeImageKey: 'logo',
            largeImageText: 'Repl.it',
            instance: false
        }).catch(ret => {
            console.debug(`error@profile ${ret}`);
        });
    } else if (spliturl[0] === 'account') {
        rpc.setActivity({
            details: `Changing account settings`,
            state: `repl.it/${url}`,
            startTimestamp,
            largeImageKey: 'logo',
            largeImageText: 'Repl.it',
            instance: false
        }).catch(ret => {
            console.debug(`error@acount ${ret}`);
        });
    } else {
        rpc.setActivity({
            details: `On Repl.it`,
            state: `repl.it/${url}`,
            startTimestamp,
            largeImageKey: 'logo',
            largeImageText: 'Repl.it',
            instance: false
        }).catch(ret => {
            console.debug(`error@main ${ret}`);
        });
    }
}

function selectInput(focusedWindow) {
    focusedWindow.webContents.executeJavaScript(
        `document.getElementsByTagName('input')[0].focus().select()`,
        false
    );
}

function startSubWindow(url) {
    if (subWindow !== undefined) {
        return;
    }
    subWindow = new BrowserWindow({
        width: mainWindow.getSize()[0] - 10,
        height: mainWindow.getSize()[1] - 10,
        title: 'Repl.it',
        icon: path.resolve(__dirname, 'utils/logo.png'),
        parent: mainWindow
    });
    subWindow.setBackgroundColor('#393c42');
    subWindow.InternalId = 2;
    if (url) {
        subWindow.loadURL(url);
    } else {
        subWindow.loadURL('https://repl.it/repls');
    }
    subWindow.webContents.on('did-frame-finish-load', () => {
        addDark(subWindow, Dark);
        if (!Dark) {
            subWindow.setBackgroundColor('#FFF');
        }
    });
    subWindow.webContents.on('did-fail-load', (event, errorCode) => {
        ErrorMessage(subWindow, errorCode);
    });
    subWindow.on('close', () => {
        subWindow.prototype = {};
        subWindow = undefined;
    });
    subWindow.webContents.on('did-start-navigation', (event, url) => {
        if (
            url.toString().includes('repl.it') ||
            url.toString().includes('repl.co') ||
            url.toString().includes('google.com') ||
            url.toString().includes('repl.run') ||
            url.toString().startsWith('about:')
        ) {
        } else {
            dialog.showMessageBox(
                {
                    title: 'Confirm External Links',
                    message: `${url} Looks like an external link, would you like to load it externally?`,
                    type: 'info',
                    buttons: ['No', 'Yes'],
                    defaultId: 1
                },
                function(index) {
                    if (index === 1) {
                        shell.openExternal(url);
                    } else {
                    }
                }
            );
        }
    });
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        title: 'Repl.it',
        icon: path.resolve(__dirname, 'utils/logo.png')
    });
    mainWindow.setBackgroundColor('#393c42');
    mainWindow.InternalId = 1;
    mainWindow.loadURL('https://repl.it/repls');
    mainWindow.webContents.on('did-fail-load', (event, errorCode) => {
        ErrorMessage(mainWindow, errorCode);
    });
    Menu.setApplicationMenu(menu);
    mainWindow.webContents.on('did-frame-finish-load', () => {
        addDark(mainWindow, Dark);
        if (!Dark) {
            mainWindow.setBackgroundColor('#FFF');
        }
    });
    mainWindow.on('close', () => {
        try {
            var url = mainWindow.webContents.getURL();
        } catch (e) {}
        dialog.showMessageBox(
            {
                title: 'Confirm Quit',
                message: `Are you sure you want to quit?`,
                type: 'info',
                buttons: ['Yes', 'No'],
                defaultId: 0
            },
            function(index) {
                if (index === 1) {
                    delete mainWindow;
                    mainWindow = createWindow();
                    try {
                        mainWindow.loadURL(url);
                    } catch (e) {}
                } else {
                    process.exit(0);
                }
            }
        );
    });
    mainWindow.webContents.on('did-start-navigation', (event, url) => {
        if (
            url.toString().includes('repl.it') ||
            url.toString().includes('repl.co') ||
            url.toString().includes('google.com') ||
            url.toString().includes('repl.run')
        ) {
        } else {
            dialog.showMessageBox(
                {
                    title: 'Confirm External Links',
                    message: `${url} Looks like an external link, would you like to load it externally?`,
                    type: 'info',
                    buttons: ['No', 'Yes'],
                    defaultId: 1
                },
                function(index) {
                    if (index === 1) {
                        shell.openExternal(url);
                    } else {
                    }
                }
            );
        }
    });
    return mainWindow;
}

ElectronContext({
    showCopyImageAddress: true,
    showSaveImageAs: true,
    showInspectElement: false
});
rpc.on('ready', () => {
    mainWindow.on('did-finish-load', setPlayingDiscord);
    // activity can only be set every 15 seconds
    setInterval(() => {
        setPlayingDiscord().catch({});
    }, 15e3);
});
rpc.on('ready', () => {
    setInterval(setUrl, 1000);
});
app.on('window-all-closed', function() {
    app.quit();
});
app.on('ready', () => {
    doUpdate();
    createWindow();
});
rpc.login({
    clientId
}).catch(console.error);
