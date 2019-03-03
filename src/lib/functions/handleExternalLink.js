const {dialog,shell} = require('electron');

function handleExternalLink(windowObj, url) {
    console.log(`External URL: ${url}`);
    if (!url) {
        return;
    }
    if (url.toString().startsWith('about')) {
        windowObj.loadURL('https://repl.it/repls');
    } else if (
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
                    if (windowObj.webContents.canGoBack()) {
                        windowObj.webContents.goBack();
                    }
                } else {
                    if (windowObj.webContents.canGoBack()) {
                        windowObj.webContents.goBack();
                    }
                }
            }
        );
    }
}

module.exports = handleExternalLink;