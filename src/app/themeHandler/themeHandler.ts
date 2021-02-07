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
        console.log(Name);
        console.log(this.settings.get('theme.Name'));
        if (Name == 'default') {
            if (this.settings.has('theme.Name'))
                Name = this.settings.get('theme.Name');
            else return;
        }
        console.log(Name);
        this.settings.set('theme', {
            Name: Name
        });
        this.Set(parentWindow, Themes[Name]);
    }
}

export { ThemeHandler };
