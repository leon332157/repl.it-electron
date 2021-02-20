import { Client } from 'discord-rpc';
import { ElectronWindow, capitalize, getUrl } from '../common';
import { displayNameToIcon } from './languages';
import Timeout = NodeJS.Timeout;
//const startTimestamp = new Date();
const startTimestamp: any = null;
class DiscordHandler {
    private client: Client;
    private readonly window: ElectronWindow;
    private discordTimer: Timeout;

    constructor(window: ElectronWindow) {
        this.window = window;
        this.client = null;
        this.connectDiscord();
    }

    connectDiscord() {
        if (!this.client) {
            this.client = new Client({
                transport: 'ipc'
            });
        }
        this.client
            .login({ clientId: '498635999274991626' })
            .catch((error: string) => {
                console.error(error);
                this.disconnectDiscord();
            });
        this.client.on('ready', () => {
            console.debug('Discord Client ready');
            this.setPlayingDiscord();
            this.discordTimer = setInterval(() => {
                this.setPlayingDiscord().catch((e: string) => {
                    console.error('Failed to update Discord status. ' + e);
                });
            }, 15e3);
        });
    }

    disconnectDiscord() {
        this.client.clearActivity();
        clearInterval(this.discordTimer);
        this.client.destroy();
        delete this.client;
    }

    async setPlayingDiscord() {
        let url: string = getUrl(this.window);
        let spliturl: string[] = url.split('/');

        if (spliturl[0] === 'repls') {
            this.client.setActivity({
                details: `Browsing Repls`,
                state: `repl.it/${url}`,
                startTimestamp,
                largeImageKey: 'logo-bg',
                largeImageText: 'Repl.it',
                instance: false
            });
        } else if (spliturl[0] === 'talk') {
            this.setTalkBoard(spliturl, this.window).then(
                (res) => {
                    this.client
                        .setActivity({
                            state: `${res.viewing}`,
                            details: `In Repl Talk ${res.talkBoard}`,
                            startTimestamp,
                            largeImageKey: 'talk-bg',
                            largeImageText: 'Repl Talk',
                            smallImageKey: 'logo-bg',
                            smallImageText: 'Repl.it',
                            instance: false
                        })
                        .catch((reason) => {
                            console.error(`error@talk board ${reason}`);
                        });
                },
                (reason: string) => {
                    console.error(`Set Talk board Failed ${reason}`);
                }
            );
        } else if (spliturl[0][0] === '@' && spliturl[1] !== undefined) {
            this.setEditing(this.window).then(
                (res) => {
                    this.client
                        .setActivity({
                            details: `Editing: ${res.fileName}`,
                            state: `${url} `,
                            startTimestamp,
                            smallImageKey: 'logo-bg',
                            smallImageText: 'Repl.it',
                            largeImageKey: res.largeImageKey,
                            largeImageText: res.largeImageText,
                            instance: false
                        })
                        .catch((reason) => {
                            console.error(`error@editing ${reason}`);
                        });
                },
                (reason: string) => {
                    console.error(`Set editing failed ${reason}`);
                }
            );
        } else if (spliturl[0] === 'talk') {
            this.client
                .setActivity({
                    details: `In Repl Talk`,
                    state: `repl.it/${url}`,
                    startTimestamp,
                    largeImageKey: 'talk-bg',
                    largeImageText: 'Repl Talk',
                    smallImageKey: 'logo-bg',
                    smallImageText: 'Repl.it',
                    instance: false
                })
                .catch((reason) => {
                    console.error(`error@talk ${reason}`);
                });
        } else if (spliturl[0][0] === '@') {
            this.client
                .setActivity({
                    details: `Looking at ${spliturl[0]}'s profile`,
                    state: `repl.it/${url}`,
                    startTimestamp,
                    largeImageKey: 'logo-bg',
                    largeImageText: 'Repl.it',
                    instance: false
                })
                .catch((reason) => {
                    console.debug(`error@profile ${reason}`);
                });
        } else if (spliturl[0] === 'account') {
            this.client
                .setActivity({
                    details: `Changing account settings`,
                    state: `repl.it/${url}`,
                    startTimestamp,
                    largeImageKey: 'logo-bg',
                    largeImageText: 'Repl.it',
                    instance: false
                })
                .catch((reason) => {
                    console.debug(`error@acount ${reason}`);
                });
        } else {
            this.client
                .setActivity({
                    details: `On Repl.it`,
                    state: `repl.it/${url}`,
                    startTimestamp,
                    largeImageKey: 'logo-bg',
                    largeImageText: 'Repl.it',
                    instance: false
                })
                .catch((reason) => {
                    console.error(`error@main ${reason}`);
                });
        }
    }

    async setTalkBoard(
        spliturl: string[],
        windowObj: ElectronWindow
    ): Promise<{ viewing: string; talkBoard: string }> {
        let viewing: string = 'Viewing ';
        if (spliturl[3] !== undefined) {
            viewing += await windowObj.webContents.executeJavaScript(
                "document.getElementsByClassName('board-post-detail-title')[0].textContent"
            ); // gets the repl talk post name
        } else if (spliturl[2] !== undefined) {
            viewing = `Viewing ${spliturl[2]}`;
        } else {
            viewing = `Viewing ${spliturl[1]}`;
        }
        const talkBoard = capitalize(spliturl[1]);
        return { viewing: viewing, talkBoard: talkBoard };
    }

    async setEditing(
        windowObj: ElectronWindow
    ): Promise<{
        fileName: string;
        largeImageKey: string;
        largeImageText: string;
    }> {
        const fileName: string = await windowObj.webContents.executeJavaScript(
            "document.querySelector('.file-header-name div').textContent"
        );
        const replType: string = await windowObj.webContents.executeJavaScript(
            'document.querySelector("img.jsx-2652062152").title'
        );
        const largeImageKey = displayNameToIcon[replType];
        const largeImageText = replType;

        return { fileName, largeImageKey, largeImageText };
    }
}

export { DiscordHandler };
