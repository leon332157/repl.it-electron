import { app, shell } from 'electron';
import {
    checkUpdateResult,
    ElectronWindow,
    githubReleaseResponse,
    launcherStatus,
    UpdateAssetsUrls,
    Version
} from '../common';
import * as fs from 'fs';
import * as path from 'path';
import fetch from 'node-fetch';
import { EventEmitter } from 'events';
import * as semver from 'semver';

class Updater extends EventEmitter {
    public downloadUrls: UpdateAssetsUrls = {
        windowsUrl: '',
        macOSUrl: '',
        linuxUrl: ''
    };
    private pathSep: string = path.sep;
    private appPath: string = app.getAppPath() + this.pathSep;
    private upperAppPath: string = path.dirname(this.appPath) + this.pathSep;
    private userDesktop: string = app.getPath('desktop');
    private logFilePath: string = this.userDesktop + 'updater-log.txt';
    private appVersion: Version;
    private logArray: [string] = [''];
    private downloadPath: string =
        app.getPath('appData') + 'updaterDownload' + this.pathSep;
    private downloadFilePath: string;
    private launcher: Launcher;

    constructor(launcher: Launcher) {
        super();
        this.appVersion = {
            major: parseInt(app.getVersion().split('.')[0]),
            minor: parseInt(app.getVersion().split('.')[1]),
            patch: parseInt(app.getVersion().split('.')[2]),
            versionString: app.getVersion()
        };
        this.launcher = launcher;
    }

    decodeReleaseResponse(resp: object): githubReleaseResponse {
        return <githubReleaseResponse>Object.assign({}, resp);
    }

    formatBytes(bytes: number, decimals: number = 1) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return (
            parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
        );
    }

    async checkUpdate(): Promise<checkUpdateResult> {
        try {
            const res: githubReleaseResponse = this.decodeReleaseResponse(
                await (
                    await fetch(
                        'https://api.github.com/repos/repl-it-discord/repl-it-electron/releases/latest'
                    )
                ).json()
            );

            const tagNames = res.tag_name.split('.');
            const changeLog = res.body;
            const version: Version = {
                major: parseInt(tagNames[0]),
                minor: parseInt(tagNames[1]),
                patch: parseInt(tagNames[2]),
                versionString: res.tag_name
            };
            for (let x = 0; x < res.assets.length; x++) {
                const asset = res.assets[x];
                if (asset.name.includes('exe') || asset.name.includes('win')) {
                    this.downloadUrls.windowsUrl = asset.browser_download_url;
                } else if (asset.name.includes('dmg')) {
                    this.downloadUrls.macOSUrl = asset.browser_download_url;
                } else if (asset.name.includes('tar.gz')) {
                    this.downloadUrls.linuxUrl = asset.browser_download_url;
                }
            }
            if (
                semver.gt(version.versionString, this.appVersion.versionString)
                // TODO: Maybe support pre-release versions
            ) {
                return {
                    hasUpdate: true,
                    changeLog: changeLog,
                    version: res.tag_name
                };
            } else {
                return { hasUpdate: false };
            }
        } catch (e) {
            console.error(e);
            return { hasUpdate: false, changeLog: 'error' };
        }
    }

    async downloadUpdate(url: string): Promise<void> {
        try {
            const req = await fetch(url);

            const contentLength: number = parseInt(
                req.headers.get('content-length')
            );
            const filename = url.split('/').pop();
            this.downloadFilePath = this.downloadPath + filename;
            let downloaded: number = 0;
            if (!fs.existsSync(this.downloadPath)) {
                fs.mkdirSync(this.downloadPath, { recursive: true });
            }
            req.body
                .on('data', (chunk: Buffer) => {
                    downloaded += chunk.length;
                    const percentage = Math.floor(
                        (downloaded / contentLength) * 100
                    );
                    this.launcher.updateStatus({
                        text: `${this.formatBytes(
                            downloaded
                        )}/${this.formatBytes(contentLength)}`,
                        percentage: percentage.toString() + '%'
                    });
                })
                .pipe(fs.createWriteStream(this.downloadFilePath));
            req.body.on('end', () => {
                this.launcher.updateStatus({ text: 'Download Finished' });
                this.emit('download-finished');
            });
        } catch (e) {
            this.emit('download-error', e);
        }
    }

    afterDownload() {
        shell.showItemInFolder(this.downloadFilePath);
        app.exit(0);
    }

    cleanUp(skip?: boolean) {
        if (!skip) {
            try {
                fs.unlinkSync(this.downloadFilePath);
            } catch (e) {}
        }
        this.emit('all-done');
    }
}

class Launcher {
    window: ElectronWindow;

    constructor() {
        this.window = new ElectronWindow(
            {
                show: false,
                resizable: false,
                height: 300,
                width: 250,
                frame: false
            },
            true
        );
    }

    init() {
        this.window.loadFile('launcher/launcher.html').then();
    }

    updateStatus(status: launcherStatus) {
        this.window.webContents.send('status-update', status);
    }
}

export { Launcher, Updater };
