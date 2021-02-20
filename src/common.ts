import {
    BrowserWindow,
    BrowserWindowConstructorOptions,
    dialog,
    MessageBoxReturnValue,
    shell
} from 'electron';
import { Endpoints } from '@octokit/types';
import { platform } from 'os';
import path = require('path');

class ElectronWindow extends BrowserWindow {
    constructor(
        options: BrowserWindowConstructorOptions,
        preload: string = '',
        nodeIntegration: boolean = false,
        webviewTag: boolean = false
    ) {
        if (
            preload.length > 0 &&
            !preload.includes(__dirname) &&
            !preload.startsWith('./')
        ) {
            preload = path.join(__dirname, 'preload', preload);
        }
        super({
            ...options,
            show: false,
            minHeight: 300, // TODO: Store window infos
            minWidth: 400,
            webPreferences: {
                devTools: true,
                enableRemoteModule: false,
                webSecurity: true,
                allowRunningInsecureContent: false,
                spellcheck: true,
                contextIsolation: false, // Enforce false since we are using preload scripts
                nodeIntegration: nodeIntegration,
                preload: preload,
                webviewTag: webviewTag
            },
            icon: `${__dirname}/512x512.png`
        });
        this.setBackgroundColor('#393c42');

        this.once('ready-to-show', () => this.show());

        this.webContents.on(
            'did-fail-load',
            (e, code, description, validateUrl) => {
                this.handleLoadingError(
                    e,
                    this,
                    code,
                    description,
                    validateUrl
                );
            }
        );
    }

    async handleLoadingError(
        event: Event,
        windowObject: ElectronWindow,
        errorCode: number,
        errorDescription: string,
        validateUrl: string
    ) {
        if (errorCode > -6 || errorCode <= -300) {
            return;
        }
        await windowObject.loadFile('app/offline.html');
        windowObject.webContents
            .executeJavaScript(
                `updateError("${errorCode} ${errorDescription}","${validateUrl}")`
            )
            .catch(console.debug);
    }
}

interface Version {
    major: number;
    minor: number;
    patch: number;
    versionString?: string;
}

interface CheckUpdateResult {
    hasUpdate: boolean;
    changeLog?: string;
    version?: string;
}

interface DownloadUpdateResult {
    success: boolean;
    downloadFilePath?: string;
    error?: string;
}

interface UpdateAssetsUrls {
    windowsUrl: string;
    macOSUrl: string;
    linuxUrl: string;
}

interface LauncherStatus {
    text: string;
    downloaded?: number;
    totalLength?: number;
    percentage?: string;
}

type GithubReleaseResponse = Endpoints['GET /repos/:owner/:repo/releases/latest']['response']['data'];

function capitalize(str: string) {
    return str.replace(/(^|\s)([a-z])/g, (p1: String, p2: String) => {
        return `${p1}${p2.toUpperCase().toString()}`;
    });
}

function selectInput(focusedWindow: ElectronWindow) {
    focusedWindow.webContents.executeJavaScript(
        `document.getElementsByTagName('input')[0].focus().select()`,
        false
    );
}

function handleExternalLink(
    event: Event,
    windowObj: ElectronWindow,
    url: string
) {
    if (!url) return;
    if (url.toString().startsWith('about')) {
        windowObj.loadURL('https://repl.it/~').catch();
    } else if (
        !(
            url.includes('repl.it') ||
            url.includes('repl.co') ||
            url.includes('google.com') ||
            url.includes('repl.run')
        )
    ) {
        console.debug(`External URL: ${url}`);
        event.preventDefault();
        dialog
            .showMessageBox({
                title: 'Confirm External Links',
                message: `${url} Looks like an external link, would you like to load it externally?`,
                type: 'info',
                buttons: ['No', 'Yes'],
                defaultId: 1
            })
            .then((resp: MessageBoxReturnValue) => {
                const index = resp.response;
                if (index === 1) {
                    shell.openExternal(url).then();
                }
            });
    }
}
function getUrl(windowObj: ElectronWindow) {
    try {
        return windowObj.webContents
            .getURL()
            .replace(/(^\w+:|^)\/\/repl\.it\//, '')
            .split('?')[0];
    } catch (e) {
        return '';
    }
}

function promptYesNoSync(
    message: string,
    title: string,
    detail?: string
): number {
    return dialog.showMessageBoxSync({
        type: 'info',
        message: message,
        title: title,
        buttons: ['No', 'Yes'],
        defaultId: 1,
        detail: detail
    });
}

const PLATFORM = platform();
export {
    Version,
    CheckUpdateResult,
    ElectronWindow,
    UpdateAssetsUrls,
    GithubReleaseResponse,
    LauncherStatus,
    DownloadUpdateResult,
    handleExternalLink,
    selectInput,
    PLATFORM,
    promptYesNoSync,
    capitalize,
    getUrl
};
