import { ElectronWindow } from '../../common';
import { SettingHandler } from '../settingHandler';
import { Themes, Theme } from './Themes';

class ThemeHandler {
    private readonly settings: SettingHandler;
    constructor(settings: SettingHandler) {
        this.settings = settings;
    }

    Set(Window: any, Colors: Theme) {
        let Css = `
        :root, .replit-ui-theme-root {
        ${Object.entries(Colors)
            .map(([K, V]) => `--${K}: ${V} !important;`)
            .join('\n')}
        }
        `;
        Window.webContents.insertCSS(Css);
    }

    openThemeWindow(parentWindow: any, Name: any = 'default') {
        if (Name == 'default') {
            if (this.settings.has('theme.Name'))
                Name = this.settings.get('theme.Name');
            else return;
        }
        this.settings.set('theme', {
            Name: Name
        });
        this.Set(parentWindow, Themes[Name]);
    }
}

export { ThemeHandler };
