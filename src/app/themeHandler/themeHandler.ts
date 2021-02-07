import { ElectronWindow } from '../../common';
import { SettingHandler } from '../settingHandler';
import { Themes, Theme } from './Themes';

class ThemeHandler {
    private readonly settings: SettingHandler;
    constructor(settings: SettingHandler) {
        this.settings = settings;
    }

    Set(parentWindow: ElectronWindow, Colors: Theme) {
        let Css = `
        :root, .replit-ui-theme-root {
        ${Object.entries(Colors)
            .map(([K, V]) => `--${K}: ${V} !important;`)
            .join('\n')}
        }
        `;
        parentWindow.webContents.insertCSS(Css);
    }

    openThemeWindow(parentWindow: ElectronWindow, Name: string) {
        this.Set(parentWindow, Themes[Name]);
    }
}

export { ThemeHandler };
