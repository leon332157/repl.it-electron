import { ElectronWindow } from '../../common';
import { SettingHandler } from '../settingHandler';
import { themes, themeProcessor } from './themes';

class ThemeHandler {
    private readonly settings: SettingHandler;
    constructor(settings: SettingHandler) {
        this.settings = settings;
    }

    setTheme(window: ElectronWindow, colors: string) {
        if (!colors) return;
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
        window.webContents.executeJavaScript(themeProcessor(colors), true);
    }

    addTheme(parentWindow: ElectronWindow, name: string = 'default') {
        if (name == 'default') {
            if (this.settings.has('theme.name'))
                name = <string>this.settings.get('theme.name');
            else return;
        }
        this.settings.set('theme', {
            name: name
        });
        this.setTheme(parentWindow, themes[name]);
    }
}

export { ThemeHandler };
