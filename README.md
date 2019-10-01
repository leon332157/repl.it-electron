# repl-it-electron

[![Travis (.org) branch](https://img.shields.io/travis/repl-it-discord/repl-it-electron/dev.svg?logo=travis)](https://travis-ci.org/repl-it-discord/repl-it-electron) 
[![Discord](https://img.shields.io/discord/437048931827056642.svg?logo=discord)](https://discord.gg/5gcPC6B)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/7da1baa110d348cda07a10d8172d1a2b)](https://www.codacy.com/app/Replit-Discord/repl.it-electron?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=repl-it-discord/repl.it-electron&amp;utm_campaign=Badge_Grade)

## Summary

[Repl.it](https://repl.it) is an online coding platform that provides a browser-based IDE. `repl-it-electron` is an unofficial native desktop application that interfaces with repl.it. It intends to improve developer experience and efficiency.

## Features

* Discord Rich Presence (using DiscordRPC)
* Work with two windows simultaneously
* Change themes (besides *light* and *dark*)

## Requirements

* From macOS 10.10 (Yosemite)
* From Windows 7
* From Ubuntu 12.04, Fedora 21, or Debian 8

Supported operating systems taken from the Electron [docs](https://electronjs.org/docs/tutorial/support)

## Contributing

```bash
git clone --recurse-submodules https://github.com/repl-it-discord/repl-it-electron
cd repl-it-electron
npm install -g --production windows-build-tools # windows
npm install
npm start
```

See [CONTRIBUTING.md](./.github/CONTRIBUTING.md) before contributing

See feature implementation details on the [roadmap](https://github.com/repl-it-discord/repl-it-electron/projects)

## Scripts

### `start`

Runs `dev:main:watch`

### `dev:main`

Starts electron main process in development mode. Uses `@babel/register` to compile our TypeScript on the fly

### `dev:main:watch`

Watches `src/` with nodeman and starts electron main process on change of a `js,ts,json,html,css` file.

### `lint`

Identifies all linting issues with eslint. Lints TypeScript as well as JavaScript. Also formats code according to Prettier style guides. Use `npm run lint --fix` to correct all correctable errors.

### `build`

Uses webpack to create a JavaScript build of the app for production.

### `build:run`

Runs the production build of the website.

### `build:ts`

Use the typescript compiler to produce a ts-out directory of a js copy of src. Also running `build:ts:static` and `ts:start`

### `build:ts:static`

Copying the static non-ts files into the ts-out folder.

### `ts:start`

Start the electron process in ts-out.

## Acknowledgements

[@mat1](https://repl.it/@mat1) for Discord Rich Presence Integration and custom dark theme
