# repl.it-electron

[![Build Status](https://travis-ci.org/repl-it-discord/repl.it-electron.svg?branch=master)](https://travis-ci.org/repl-it-discord/repl.it-electron)

Native Un-Official Electron app for [repl.it](https://repl.it).

Supports Discord Rich Presence using DiscordRPC library.

Supports working with two windows at a time. Compared to browsers with tabs.

Many thanks for [@mat1](https://repl.it/@mat1) for the page details code.

Also, join the Repl.it [Discord](https://repl.it/discord) server.

## Usage
Download the app in [release](https://github.com/leon332157/repl.it-electron/releases) tab for your system. And execute the executable.

## Contributing

```bash
git clone --recurse-submodules https://github.com/repl-it-discord/repl.it-electron
cd "repl.it-electron/src"
npm install --global --production windows-build-tools # windows
npm install
```
And checkout [CONTRIBUTING.md](https://github.com/repl-it-discord/repl.it-electron/blob/master/CONTRIBUTING.md) for PR process and branch naming rules.

## Testing

Runs Jest test suite at `./test`

```bash
npm test
```

# Licence
Apache, see LICENSE for details.
