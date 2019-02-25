/* Require Packages */
const {app, BrowserWindow, Menu, dialog, shell} = require('electron');
const path = require('path');
const DiscordRPC = require('discord-rpc');
const fs = require('fs');
const ElectronPrompt = require('electron-prompt');
const ChromeErrors = require('chrome-network-errors');
const ElectronPreferences = require(path.resolve(__dirname, 'electron-preferences'));
const EBU = require(path.resolve(__dirname, 'electron-basic-updater'));
const ElectronContext = require('electron-context-menu');
const requests = require('axios');

/* Declare Constants */
let mainWindow;
var subWindow = undefined;
const clientId = '498635999274991626';
var startTimestamp = new Date();
const rpc = new DiscordRPC.Client({
    transport: 'ipc'
});

/* Custom Methods */
String.prototype.capitalize = function () {
    return this.replace(/(^|\s)([a-z])/g, function (m, p1, p2) {
        return p1 + p2.toUpperCase();
    });
};
String.prototype.toTitleCase = String.prototype.capitalize;
Array.prototype.append = Array.prototype.push;

/* App SetUp's */

async function appSetup() {
    var Themes = {};
    var themes = {};
    var res = await requests.get('https://www.darktheme.tk/themes.json');
    var theme_instert = [];
    var raw_themes = res.data;
    for (let key in raw_themes) {
        if (raw_themes.hasOwnProperty(key)) {
            themes[key.capitalize()] = raw_themes[key]
        }
    }

    Themes['Default White'] = '';
    theme_instert.append({'label': 'Default White', 'value': 'Default White'});
    for (let theme in themes) {
        if (themes.hasOwnProperty(theme)) {
            var resp = await requests.get(`https://www.darktheme.tk/theme.css?${themes[theme]}`);
            Themes[theme] = resp.data.toString();
            theme_instert.append({'label': theme.toString(), 'value': theme.toString()})
        }
    }
    /* Preferences */
    const Preferences = new ElectronPreferences({
        dataStore: path.resolve(app.getPath('userData'), 'Preferences.json'),
        defaults: {
            'app-theme': {
                'theme': 'Default White', 'css_string': null, 'enable_custom_css': false
            },
            'update-settings': {
                'auto-update': true
            }
        },
        onLoad: data => {
            return data;
        },
        'webPreferences': {
            'devTools': true
        },
        'sections': [{
            'id': 'app-theme',
            'label': 'App Theme',
            'icon': 'widget',
            'form': {
                'groups': [{
                    'fields': [
                        {
                            'label': 'Theme Select\n',
                            'key': 'theme',
                            'type': 'dropdown',
                            'options': theme_instert,
                            'help': 'Select a theme'
                        }, /*{
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
                    }*/]
                }]
            }
        },
            {
                'id': 'update-settings',
                'label': 'Update Settings',
                'icon': 'square-download',
                'form': {
                    'groups': [{
                        'fields': [{
                            'label': 'Auto Update',
                            'key': 'auto-update',
                            'type': 'radio',
                            'options': [{
                                'label': 'Yes',
                                'value': true
                            },
                                {
                                    'label': 'No',
                                    'value': false
                                }
                            ],
                            'help': 'Enable/Disable auto update.'
                        }]
                    }]
                }
            },
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
            `Preferences were saved. at ${path.resolve(app.getPath('userData'), 'Preferences.json')}`,
            //JSON.stringify(preferences, null, 4)
        );
        mainWindow.reload();
        if (subWindow) {
            subWindow.reload();
        }
    });


    /* Menu Template */
    const template = [
        {
            label: 'Main',
            submenu: [
                {
                    label: 'Sub Window',
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
                    label: 'Send Sub to Main Window',
                    click() {
                        if (subWindow) {
                            var subUrl = subWindow.getURL();
                            dialog.showMessageBox({
                                title: "",
                                message: `Do you want to load ${subUrl} in window 1?`,
                                type: 'info',
                                buttons: ["Yes", "No"],
                                defaultId: 0
                            }, (index) => {
                                if (index === 0) {
                                    mainWindow.loadURL(subUrl)
                                } else {

                                }
                            })
                        }
                    }
                },
                {
                    label: 'Preferences',
                    accelerator: 'CmdOrCtrl+,',
                    click() {
                        Preferences.show()
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
                    label: 'Open Current Link externally',
                    click(item, focusedWindow) {
                        shell.openExternal(focusedWindow.getURL())
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
            submenu: [{
                label: 'Learn More about repl.it',
                click() {
                    shell.openExternal('https://repl.it/site/about')
                }
            }]
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
    Menu.setApplicationMenu(menu);
    doUpdate(Preferences.value('update-settings')['auto-update']);
    if (mainWindow) {
        addTheme(mainWindow, Themes[Preferences.value('app-theme')['theme']]);
        mainWindow.webContents.on('did-start-navigation', () => {
            addTheme(mainWindow, Themes[Preferences.value('app-theme')['theme']])
        })
    }
    if (subWindow) {
        addTheme(subWindow, Themes[Preferences.value('app-theme')['theme']])
        subWindow.webContents.on('did-start-navigation', () => {
            addTheme(subWindow, Themes[Preferences.value('app-theme')['theme']])
        })
    }
}

appSetup().then();
//TODO:Add custom themes from css.

/* Auto update function */
function doUpdate(Update) {
    if (!Update) {
        return;
    }
    EBU.init({
        api: 'https://replit-electron-updater.leon332157.repl.co/check/' // The API EBU will talk to
    });
    EBU.check(function (result) {
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
                function (index) {
                    if (index === 0) {
                        //mainWindow.hide();
                        EBU.download(true, function (result) {
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
    var id = windowObject.InternalId;
    var reason = ChromeErrors[errorCode];
    if (reason === "ABORTED" || reason === "INVALID_ARGUMENT" || reason === "FAILED") {
        windowObject.reload(true)
    }
    dialog.showMessageBox({
        title: "Loading Failed",
        message: `loading Failed on window ${id} reason ${reason}, do you want to try again?`,
        type: 'error',
        buttons: ["Try again please", "Quit"],
        defaultId: 0
    }, function (index) {
        // if clicked "Try again please"
        if (index === 0) {
            windowObject.reload();
        } else {
            app.quit()
        }
    });
}

function addTheme(windowObj, CSSString) {
    try {
        windowObj.webContents.insertCSS(CSSString);
        console.debug(`Theme Added for ${windowObj.InternalId}`);
    } catch (e) {
        console.error(`Error adding dark theme on ${e}`);
    }
    windowObj.setBackgroundColor('#FFF');
}


function startCustomSession() {
    ElectronPrompt({
        title: 'Join Multiplayer',
        label: 'URL:',
        value: 'https://repl.it/',
        inputAttrs: {
            type: 'url',
        },
        customStylesheet: path.resolve('.', 'promptDark.css')

    })
        .then(r => {
            if (r === undefined || r === null) {
                return;
            }
            if (
                r.toString().replace(' ', '') === '' ||
                !r.toString().startsWith('https://repl.it/') || !r.toString().includes('repl.co' || !r.toString().includes('repl.run'))
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
            .catch(ret => {
            });
    } catch (e) {
    }
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
        }).then();
    } else if (spliturl[0] === 'talk') {
        let viewing;
        if (spliturl[3] !== undefined) {
            await mainWindow.webContents.executeJavaScript(
                "document.getElementsByClassName('board-post-detail-title')[0].textContent",
                function (result) {
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
        }).then();
    } else if (spliturl[0][0] === '@' && spliturl[1] !== undefined) {
        var fileName = 'Error';
        var replName = 'Error';
        var replLanguage = 'Error';
        await mainWindow.webContents.executeJavaScript(
            "document.querySelector('.file-header-name div').textContent",
            function (result) {
                fileName = result;
            }
        );
        await mainWindow.webContents.executeJavaScript(
            "document.getElementsByTagName('title')[0].textContent.split('-').pop()",
            function (result) {
                replName = result;
            }
        );
        await mainWindow.webContents.executeJavaScript(
            "document.querySelector('.workspace-header-description-container img')['title']",
            function (result) {
                replLanguage = result;
            }
        );

        var lang = fileName.split('.').slice(-1)[0]; // gets the file extension
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
        minWidth: 600,
        minHeight: 600,
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
    subWindow.webContents.on('did-fail-load', (event, errorCode) => {
        ErrorMessage(subWindow, errorCode);
    });
    subWindow.webContents.on('did-start-navigation', (event, url) => {
        if (url.toString().startsWith('about:')) {
            subWindow.reload()
        }
        if (url.toString().includes('repl.it') || url.toString().includes('repl.co') || url.toString().includes('google.com') || url.toString().includes('repl.run')) {
        } else {
            dialog.showMessageBox({
                title: "Confirm External Links",
                message: `${url} Lookas like an external link, would you like to load it externally?`,
                type: 'info',
                buttons: ["No", "Yes"],
                defaultId: 1
            }, function (index) {
                if (index === 1) {
                    shell.openExternal(url);
                    if (subWindow.webContents.canGoBack()) {
                        subWindow.webContents.goBack()
                    }
                } else {
                    if (subWindow.webContents.canGoBack()) {
                        subWindow.webContents.goBack()
                    }
                }
            });
        }
    });
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 600,
        minHeight: 600,
        title: 'Repl.it',
        icon: path.resolve(__dirname, 'utils/logo.png')
    });
    mainWindow.setBackgroundColor('#393c42');
    mainWindow.InternalId = 1;
    mainWindow.loadURL('https://repl.it/repls');
    mainWindow.webContents.on('did-fail-load', (event, errorCode) => {
        ErrorMessage(mainWindow, errorCode);
    });
    mainWindow.webContents.on('did-start-navigation', (event, url) => {
        if (url.toString().startsWith('about:')) {
            mainWindow.reload()
        }
        if (url.toString().includes('repl.it') || url.toString().includes('repl.co') || url.toString().includes('google.com') || url.toString().includes('repl.run')) {
        } else {
            dialog.showMessageBox({
                title: "Confirm External Links",
                message: `${url} Looks like an external link, would you like to load it externally?`,
                type: 'info',
                buttons: ["No", "Yes"],
                defaultId: 1
            }, function (index) {
                if (index === 1) {
                    shell.openExternal(url);
                    if (mainWindow.webContents.canGoBack()) {
                        mainWindow.webContents.goBack()
                    }
                } else {
                    if (mainWindow.webContents.canGoBack()) {
                        mainWindow.webContents.goBack()
                    }
                }
            });
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
    // activity can only be set every 15 seconds
    setInterval(() => {
        setPlayingDiscord().catch({});
    }, 15e3);
});
rpc.on('ready', () => {
    setInterval(setUrl, 1000);
});
app.on('window-all-closed', function () {
    app.quit();
});
app.on('ready', () => {
    doUpdate();
    createWindow();
});
rpc.login({
    clientId
}).catch(console.error);
