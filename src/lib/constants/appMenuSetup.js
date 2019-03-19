const { app, shell, clipboard } = require('electron');

function appMenuSetup(
    startSubWindow,
    Preferences,
    startCustomSession,
    sendSubToMain,
    selectInput,
    doUpdate
) {
    const template = [
        {
            label: 'Main',
            submenu: [
                {
                    label: 'Sub Window',
                    accelerator: 'CmdOrCtrl+N',
                    click() {
                        startSubWindow();
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
                        sendSubToMain();
                    }
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Check Update Manually',
                    click() {
                        doUpdate(true, true);
                    }
                },
                {
                    label: 'Preferences',
                    accelerator: 'CmdOrCtrl+,',
                    click() {
                        Preferences.show();
                    }
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
                },
                {
                    label: 'Copy URL to clipboard',
                    click(item, focusedWindow) {
                        clipboard.writeText(focusedWindow.webContents.getURL());
                    }
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
                        shell.openExternal(focusedWindow.getURL());
                    }
                },
                {
                    label: 'Restore Blank Page',
                    click(item, focusedWindow) {
                        focusedWindow.loadURL('https://repl.it/repls');
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
                    type: 'separator'
                },
                {
                    label: 'Learn More about repl.it',
                    click() {
                        shell.openExternal('https://repl.it/site/about');
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
    if (process.platform !== 'darwin') {
        template[template.length - 1].submenu.push({
            role: 'about'
        });
    }
    return template;
}

module.exports = appMenuSetup;
