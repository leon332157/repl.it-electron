import { ipcRenderer } from 'electron';
window.opener = {
    postMessage: (event: any, data: any) => {
        ipcRenderer.send('authDone', '');
        window.close();
    }
};
