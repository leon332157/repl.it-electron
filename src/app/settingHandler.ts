import { app } from 'electron';
import fs from 'fs';
import path from 'path';
import writeFileAtomic from 'write-file-atomic';
import * as _ from 'lodash';

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

    constructor() {
        this.settingsFilePath = `${path.dirname(app.getPath('userData'))}${
            path.sep
        }settings.json`;
        this.ensureFileSync();
    }

    private ensureFileSync() {
        try {
            fs.statSync(this.settingsFilePath);
        } catch (err) {
            if (err.code === 'ENOENT') {
                console.log('creating file');
                this.saveSettings({});
            } else {
                throw err;
            }
        }
    }

    private saveSettings(obj: SettingsObject): void {
        const data = JSON.stringify(obj, null, 4);
        writeFileAtomic.sync(this.settingsFilePath, data);
    }

    private loadSettings(): SettingsObject {
        this.ensureFileSync();
        let data: SettingsObject;
        try {
            data = JSON.parse(fs.readFileSync(this.settingsFilePath, 'utf-8'));
        } catch {
            this.resetAll();
            data = JSON.parse(fs.readFileSync(this.settingsFilePath, 'utf-8'));
        }
        return data;
    }

    has(key: string): boolean {
        const obj = this.loadSettings();

        return obj.hasOwnProperty(key);
    }

    get(key: string): SettingsValue {
        const obj = this.loadSettings();
        if (this.has(key)) {
            return obj[key];
        } else {
            return null;
        }
    }

    set(key: string, value: SettingsValue): void {
        const obj = this.loadSettings();

        //@ts-ignore
        obj.assign({ key: value });

        this.saveSettings(obj);
    }

    unset(key: string): void {
        const obj = this.loadSettings();

        delete obj[key];

        this.saveSettings(obj);
    }

    resetAll(): void {
        this.saveSettings({});
    }
}

export { SettingHandler };
