#!/usr/bin/env bash
cd ~/desktop/repl.it/pre-dist

node ../utils/building.js

#DEBUG=electron-packager electron-packager ../src 'repl.it' --asar --platform=win32 --arch=ia32 --icon='/Users/lynnzheng/Desktop/repl.it/logos/ico/logo.ico'

#DEBUG=electron-packager electron-packager ../src 'repl.it' --asar --platform=win32 --arch=x64 --icon='/Users/lynnzheng/Desktop/repl.it/logos/ico/logo.ico'

#DEBUG=electron-packager electron-packager ../src 'repl.it' --asar --platform=darwin --icon='/Users/lynnzheng/Desktop/repl.it/logos/icns/icon.icns'

#DEBUG=electron-packager electron-packager ../src 'repl.it' --asar --platform=linux --arch=ia32 --ignore='/tests/'

#DEBUG=electron-packager electron-packager ../src 'repl.it' --asar --platform=linux --arch=x64 --ignore='/tests/'

cd ~/desktop/repl.it/dist

electron-installer-zip ../pre-dist/repl.it-win32-ia32/repl.it.exe 'repl.it-win-x32.zip' --verbose

electron-installer-zip ../pre-dist/repl.it-linux-ia32/repl.it 'repl.it-linux-x32.zip' --verbose

electron-installer-zip ../pre-dist/repl.it-win32-x64/repl.it.exe 'repl.it-win-x64.zip' --verbose

electron-installer-zip ../pre-dist/repl.it-linux-x64/repl.it 'repl.it-linux-x64.zip' --verbose

electron-installer-dmg ../pre-dist/repl.it-darwin-x64/repl.it.app repl.it --debug --icon='/Users/lynnzheng/Desktop/repl.it/logos/icns/logo_256x256.icns'

cd ~/desktop/repl.it

echo "Started uploading update"

#python3 utils/upload-update.py

echo "Done"
