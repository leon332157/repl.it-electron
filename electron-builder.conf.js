module.exports = {
    appId: 'repl-it-electron.repl-it-discord',
    directories: {
        output: 'build/',
        app: 'dist/',
        buildResources: __dirname
    },
    mac: {
        target: 'pkg',
        icon: 'src/assets/replit-logo/icns/icon_set.icns'
    },
    pkg: {
        isVersionChecked: false,
        hasStrictIdentifier: false,
        overwriteAction: 'upgrade'
    },
    win: {
        target: 'nsis',
        icon: 'logos/replit-logo/logo-clear.png'
    },
    nsis: {
        oneClick: false,
        allowToChangeInstallationDirectory: true,
        differentialPackage: false,
        //perMachine: true,
        createDesktopShortcut: true
    },
    linux: {
        target: {
            target: 'deb'
        },
        //icon: 'src/assets/replit-logo/256x256.png',
        maintainer: 'leon332157',
        category: 'Development'
    }
};
