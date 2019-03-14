process.env['DEBUG'] = 'electron-packager';
const packager = require('electron-packager');
const path = require('path');

const sourceDir = path.resolve('..', 'src');
let windowsIconPath = '/Users/lynnzheng/Desktop/repl.it/logos/ico/logo.ico';
let macIconPath = '/Users/lynnzheng/Desktop/repl.it/logos/icns/icon.icns';
let linuxIconPath = '/Users/lynnzheng/Desktop/repl.it/utils/logo.png ';

function shouldIgnore(filePath) {
    //console.log(filePath);
    if (filePath.includes('test') || filePath.includes('WorkInProgress') || filePath.includes('.git') || path.basename(filePath).startsWith('.')) {
        console.log(`Ignored ${filePath}`);
        return true;
    }
    if (/node_modules/.test(filePath)) {

        if (/\/(obj|test.*?|spec.*?|htdocs|demo|dist|example.*?|sample.*?)[\/$]/i.test(filePath)) {
            console.log(`Ignored ${filePath}`);
            return true;
        }
        if (/^(\..*|.*\.(sln|pdb|exp|lib|map|md|sh|gypi|gyp|h|cpp|xml|yml|html)|vcxproj.*|LICENSE|README|CONTRIBUTORS|vagrant|Dockerfile|Makefile)$/i.test(path.basename(filePath))) {
            console.log(`Ignored ${filePath}`);
            return true;
        }
    }


}

if ('TRAVIS' in process.env && 'CI' in process.env) {
    windowsIconPath = '';
    macIconPath = '';
    linuxIconPath = '';
}

packager({
    dir: sourceDir,
    asar: true,
    platform: "win32",
    arch: "ia32",
    icon: windowsIconPath,
    ignore: shouldIgnore
}).then((appPath) => {
    console.log(`Win32 ${appPath}`)
}, (error) => {
    console.error(error)
});

packager({
    dir: sourceDir,
    asar: true,
    platform: "win32",
    arch: "x64",
    icon: windowsIconPath,
    ignore: shouldIgnore
}).then((appPath) => {
    console.log(`Win64 ${appPath}`)
}, (error) => {
    console.error(error)
});

packager({
    dir: sourceDir,
    asar: true,
    platform: "darwin",
    icon: macIconPath,
    ignore: shouldIgnore
}).then((appPath) => {
    console.log(`Mac ${appPath}`)
}, (error) => {
    console.error(error)
});

packager({
    dir: sourceDir,
    asar: true,
    platform: "linux",
    arch: 'ia32',
    icon: linuxIconPath,
    ignore: shouldIgnore
}).then((appPath) => {
    console.log(`Linux32 ${appPath}`)
}, (error) => {
    console.error(error)
});

packager({
    dir: sourceDir,
    asar: true,
    platform: "linux",
    arch: 'x64',
    icon: linuxIconPath,
    ignore: shouldIgnore
}).then((appPath) => {
    console.log(`Linux64 ${appPath}`)
}, (error) => {
    console.error(error)
});