/*
THIS IS THE OLD CODE, NOT MAINTAINED ANYMORE.

This was the original version by me with out Mat1's code, just keeping it as a refoence.

*/

// Modules to control application life and create native browser window
const { app, BrowserWindow, Menu, dialog, ipcMain } = require('electron');
const DiscordRPC = require('discord-rpc');
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let DarkCSS;
let Dark;
const clientId = '494756536644665347';
const fs = require('fs');
fs.readFile(__dirname + '/Dark.css', function(err, data) {
    if (err) {
        throw err;
    }
    return (DarkCSS = data.toString());
});

const rpc = new DiscordRPC.Client({ transport: 'ipc' });

const template = [
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
            }
        ]
    },
    {
        label: 'View',
        submenu: [
            {
                label: 'Dark Mode',
                accelerator: 'F10',
                click(item, focusedWindow) {
                    Dark = true;
                    addDark(item, focusedWindow);
                }
            },
            {
                label: 'Dark Mode Off',
                accelerator: 'F11',
                click(item, focusedWindow) {
                    Dark = false;
                    focusedWindow.reload();
                }
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
                    require('electron').shell.openExternal(
                        'https://github.com/leon332157/repl.it-electron'
                    );
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
    template[1].submenu.push(
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
    template[3].submenu = [
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
const langs = {
    has: 'Haskell',
    kot: 'Kotlin',
    qba: 'QBasic',
    for: 'Forth',
    lol: 'LOLCODE',
    bra: 'BrainFuck',
    emo: 'Emoticon',
    blo: 'Bloop',
    unl: 'Unlambda',
    jav: 'Java',
    cof: 'CoffeeScript',
    sch: 'Scheme',
    apl: 'APL',
    lua: 'Lua',
    pyt: 'Python',
    rub: 'Ruby',
    roy: 'Roy',
    php: 'PHP',
    nod: 'Nodejs',
    enz: 'Enzyme',
    go: 'Go',
    cpp: 'C++',
    c: 'C',
    csh: 'C#',
    fsh: 'F#',
    htm: 'HTML5',
    rus: 'Rust',
    swi: 'Swift',
    jes: 'Jest',
    dja: 'Django',
    exp: 'Express',
    sin: 'Sinatra',
    r: 'R',
    nex: 'Next.js',
    gat: 'GatsbyJS',
    rea: 'React',
    bas: 'bash',
    qui: 'Quil'
};
function addDark() {
    if (Dark) {
        mainWindow.webContents.insertCSS(DarkCSS);
    }
}

const message = function() {
    return dialog.showMessageBox(
        {
            title: 'Internet Failed',
            message: 'Internet Failed, do you want to try again?',
            type: 'error',
            buttons: ['Try again please', 'Quit'],
            defaultId: 0
        },
        function(index) {
            // if clicked "Try again please"
            if (index === 0) {
                mainWindow.reload();
            } else {
                app.quit();
            }
        }
    );
};

async function setActivity() {
    if (!rpc || !mainWindow) {
        return;
    }
    const url = mainWindow.webContents.getURL();
    console.log(url);
    const url_list = url.split('/');
    console.log(url_list);
    var last = url_list[url_list.length - 1];
    var owner = url_list[url_list.length - 2];
    if (owner.startsWith('@')) {
        mainWindow.webContents.executeJavaScript(
            `require('electron').ipcRenderer.send('a',document.body.innerHTML.match(/"contentLength"..."language":".../g))`
        );
        ipcMain.on('a', (_, language_array) => {
            let abbr_lang;
            try {
                abbr_lang = language_array[0]
                    .toString()
                    .replace('"contentLength":0,"language":"', '')
                    .replace('"', '')
                    .replace(',', '');
            } catch (e) {
                console.log(e);
                abbr_lang = 'Unk';
            }
            try {
                console.log(abbr_lang);
                rpc.setActivity({
                    details: `Working on ${last}`,
                    state: `Owner: ${owner}`,
                    //startTimestamp,
                    largeImageKey: abbr_lang.toLowerCase(),
                    largeImageText: langs[abbr_lang],
                    smallImageKey: 'logo',
                    smallImageText: 'repl.it',
                    instance: false
                });
            } catch (e) {
                console.log(e);
            }
        });
    } else if (url.includes('https://repl.it/talk')) {
        rpc.setActivity({
            details: `In Repl Talk`,
            state: `${url.replace('https://repl.it/talk/', '')}`,
            //startTimestamp,
            largeImageKey: 'repl-talk',
            largeImageText: 'Repl Talk',
            smallImageKey: 'logo',
            smallImageText: 'repl.it',
            instance: false
        });
    } else {
        rpc.setActivity({
            details: `At Lobby`,
            state: `${url}`,
            //startTimestamp,
            largeImageKey: 'logo',
            largeImageText: 'repl.it',
            instance: false
        });
    }
    /*rpc.setActivity({
        details: `Working on ${urll}`,
        state: `On ${url}`,
        startTimestamp,
        largeImageKey: 'logo',
        largeImageText: 'repl.it',
        instance: false,
    });
    */
}

rpc.on('ready', () => {
    mainWindow.on('did-finish-load', setActivity);
    // activity can only be set every 15 seconds
    setInterval(() => {
        setActivity();
    }, 5e3);
});

rpc.login({ clientId }).catch(console.error);

function checkConn() {
    mainWindow.webContents.on('did-fail-load', message);
}

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({ width: 1280, height: 800 });
    Menu.setApplicationMenu(menu);
    checkConn();
    mainWindow.loadURL('https://repl.it');
    mainWindow.on('focus', checkConn);
    mainWindow.webContents.on('did-frame-finish-load', addDark);
    // Emitted when the window is closed.
    mainWindow.on('closed', function() {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
        app.quit();
    });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function() {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function() {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
