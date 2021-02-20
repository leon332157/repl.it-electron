module.exports = {
    appId: 'replit-desktop.replit-discord',
    generateUpdatesFilesForAllChannels: false,
    directories: {
        output: 'build/',
        app: 'dist/',
        buildResources: __dirname
    },
    mac: {
        target: 'zip',
        icon: 'logos/replit-logo/icns/512x512.icns'
    },
    win: {
        target: 'zip',
        icon: 'logos/replit-logo/logo-clear.png'
    },
    linux: {
        target: {
            target: 'tar.gz'
        },
        //icon: 'src/assets/replit-logo/256x256.png',
        maintainer: 'leon332157',
        category: 'Development'
    }
};
