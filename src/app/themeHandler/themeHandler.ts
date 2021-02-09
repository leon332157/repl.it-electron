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
            .replace(/confirm\(([^)]+)\);/gim, '(() => true)();')
            .replace(
                'if (target) {target.insertAdjacentHTML("afterend", `<a id="reflux-display" class="jsx-2607100739" target="_blank" href="//github.com/frissyn/Reflux"><span class="jsx-2607100739 sidebar-layout-nav-item-icon"><img src="https://img.icons8.com/material-outlined/24/00D1B2/code.png"/></span><div class="jsx-2607100739">Reflux</div><div class="jsx-2607100739 beta-label"><div style="background-color: #6262ff;" class="jsx-4210545632 beta-tag">ON</div></div></a>`);} else {alert("Reflux badge could not be applied. This theme will run silently.");}',
                ''
            );
    };
}

export { ThemeHandler };
