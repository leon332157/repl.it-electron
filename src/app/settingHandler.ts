import { app } from 'electron';
import fs from 'fs';
import path from 'path';
import writeFileAtomic from 'write-file-atomic';

type SettingsValue =
    | null
    | boolean
    | string
    | number
    | SettingsObject
    | SettingsValue[];

interface SettingsObject {
    [key: string]: SettingsValue;
}

class SettingHandler {
    public settingsFilePath: string;

    public settings: SettingsObject;

    constructor() {
        this.settingsFilePath = `${path.dirname(app.getPath('userData'))}${
            path.sep
        }settings.json`;
        this.ensureFileSync();
        // Load the settings
        this.settings = {};
        try {
            this.settings = JSON.parse(
                fs.readFileSync(this.settingsFilePath, 'utf-8')
            );
        } catch {
            this.resetAll();
            this.settings = JSON.parse(
                fs.readFileSync(this.settingsFilePath, 'utf-8')
            );
        }
    }

    private ensureFileSync() {
        try {
            fs.statSync(this.settingsFilePath);
        } catch (err) {
            if (err.code === 'ENOENT') {
                console.debug('creating file');
                this.saveSettings();
            } else throw err;
        }
    }
    private saveSettings(): void {
        writeFileAtomic.sync(
            this.settingsFilePath,
            JSON.stringify(this.settings, null, 4)
        );
    }
    has(key: string): boolean {
        return this.settings.hasOwnProperty(key);
    }
    get(key: string): SettingsValue {
        return this.has(key) ? this.settings[key] : null;
    }
    set(key: string, value: SettingsValue): void {
        this.settings[key] = value;
        this.saveSettings();
    }
    unset(key: string): void {
        delete this.settings[key];
        this.saveSettings();
    }
    resetAll(): void {
        this.saveSettings();
    }
}

export { SettingHandler };
