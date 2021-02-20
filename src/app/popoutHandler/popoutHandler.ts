import { ElectronWindow, getUrl } from '../../common';

class PopoutHandler {
    constructor() {}

    launch(win: ElectronWindow) {
        // Handle the repl url, make sure it is there repl and a repl
        let repl_url = getUrl(win);
        if (/\@.*\/.*/.test(repl_url)) {
            let Terminal = new ElectronWindow(
                {
                    width: 600,
                    height: 600
                },
                `${__dirname}/console.js`
            );

            Terminal.loadURL(
                `https://repl.it/${repl_url.split('#')[0]}?outputonly=1`
            );
        }
    }
}

export { PopoutHandler };
