const { ipcRenderer } = require('electron');

window.opener = {
    postMessage: (event, data) => {
        console.log(event);
        ipcRenderer.send('auth', '');
    }
};
