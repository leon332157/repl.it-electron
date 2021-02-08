import { ElectronWindow } from '../../common';
import { SettingHandler } from '../settingHandler';
import { Themes, ThemeStructure } from './themes';

class ThemeHandler {
    private readonly settings: SettingHandler;
    constructor(settings: SettingHandler) {
        this.settings = settings;
    }

    setTheme(window: ElectronWindow, colors: ThemeStructure) {
        let cssString = `
        :root, .replit-ui-theme-root {
        ${Object.entries(colors)
            .map(([K, V]) => `--${K}: ${V} !important;`)
            .join('\n')}
        }
        `;
        window.webContents.insertCSS(cssString);
    }

    openThemeWindow(parentWindow: ElectronWindow, name: string = 'default') {
        if (name == 'default') {
            if (this.settings.has('theme.name'))
                name = <string>this.settings.get('theme.name');
            else return;
        }
        this.settings.set('theme', {
            name: name
        });
        this.setTheme(parentWindow, Themes[name]);
    }
}

export { ThemeHandler };
