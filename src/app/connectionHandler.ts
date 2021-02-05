import { BrowserWindow } from 'electron';
import { ElectronWindow } from '../common';
import { EventEmitter } from 'events';
import Connection = require('is-online');

class ConnectionHandler extends EventEmitter {
    public Online: boolean;
    private Offline: BrowserWindow;
    constructor(Windows: ElectronWindow[]) {
        super();
        this.Offline = new BrowserWindow({
            show: false
        });
        this.Offline.loadURL(`file://${__dirname}/offline.html`);
        (async () => {
            this.Online = await Connection();
            setInterval(async () => {
                let Status: boolean = await Connection();
                if (Status != this.Online) {
                    this.Online = Status;
                    switch (Status) {
                        case true:
                            this.Offline.hide();
                            Windows.forEach((win: ElectronWindow) => {
                                win.show();
                            });
                            break;
                        case false:
                            this.Offline.maximize();
                            this.Offline.show();
                            Windows.forEach(async (win: ElectronWindow) => {
                                win.hide();
                            });
                            break;
                    }
                }
            }, 3000);
        })();
    }
}

export { ConnectionHandler };
