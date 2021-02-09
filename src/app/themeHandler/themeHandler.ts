import { ElectronWindow } from '../../common';
import { SettingHandler } from '../settingHandler';
import { ipcMain } from 'electron';

class ThemeHandler {
    private readonly settings: SettingHandler;
    private theme_market: ElectronWindow;
    constructor(settings: SettingHandler, Main: ElectronWindow) {
        this.settings = settings;
        ipcMain.on('Theme', (event, code: string) => {
            this.addTheme(Main, code);
        });
    }
    open_window() {
        this.theme_market = new ElectronWindow(
            {
                height: 900,
                width: 1600
            },
            '',
            true
        );
        this.theme_market.setBackgroundColor('#393c42');
        this.theme_market.loadURL(`file://${__dirname}/themes.html`);
    }

    setTheme(window: ElectronWindow, code: string) {
        if (!code) return;
        window.webContents.executeJavaScript(
            `
            {
                let p1 = document.getElementById("reflux-theme"),
                    p2 = document.getElementById("reflux-display");
                if (p1 && p2) {
                    p1.remove();
                    p2.remove();
                }
            }
            `,
            true
        );
        window.webContents.executeJavaScript(this.themeProcessor(code), true);
    }

    addTheme(parentWindow: ElectronWindow, code: string = 'default') {
        if (code == 'default') {
            if (this.settings.has('theme.code'))
                code = <string>this.settings.get('theme.code');
            else return;
        }
        this.settings.set('theme', {
            code: code
        });
        this.setTheme(parentWindow, code);
    }

    themeProcessor = (theme: string) => {
        return theme
            .replace('javascript:', '')
            .replace(/\n/g, '\\n')
            .replace(/alert/g, 'console.log')
            .replace(/confirm\(([^)]+)\);/gim, '(() => true)();');
    };
}

export { ThemeHandler };
