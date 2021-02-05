const { ipcRenderer } = require('electron');

window.opener = {
    postMessage: (event, data) => {
        ipcRenderer.send('auth', '');
        window.close();
    }
};
