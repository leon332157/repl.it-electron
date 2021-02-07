import { ipcRenderer } from 'electron';
window.opener = {
    postMessage: (event: any, data: any) => {
        ipcRenderer.send('authDone', '');
        window.close();
    }
};
console.log(`${__filename} preloaded`);
