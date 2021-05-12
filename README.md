# replit-desktop [![Discord](https://img.shields.io/discord/437048931827056642.svg?logo=discord)](https://discord.gg/5gcPC6B) [![Codacy Badge](https://app.codacy.com/project/badge/Grade/3bce49c376cf4c2bb1d2813d6b12dd6a)](https://www.codacy.com/manual/leon332157/replit-desktop?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=repl-it-discord/replit-desktop&amp;utm_campaign=Badge_Grade) [![Run on Replit](https://replit.com/badge/github/leon332157/replit-desktop)](https://replit.com/github/replit-discord/replit-desktop)

## Summary

[Replit](https://replit.com) is an online coding platform that provides a browser-based IDE. `Replit-Desktop` is an unofficial desktop application that interfaces with Replit. It's purpose is to improve the developer experience and boost efficiency.

## Features

+ Work with multiple windows simultaneously
+ Fully-featured Discord Rich Presence (using DiscordRPC)
+ Change and create site themes (using [Reflux](https://github.com/frissyn/Reflux))

Example:
![screenshot](https://cdn.discordapp.com/attachments/557534625702871071/818541454938210364/unknown.png)

## Installation and Usage

Head to the [Releases Tab](https://github.com/replit-discord/replit-desktop/releases) and find your desired version. Download and install the source that corresponds with your platform, (i.e `Windows`, `Linux`, or `Mac`). Launch Replit-Desktop as a normal application and enjoy!

**NOTE:** If you have any issues installing or using Replit-Desktop, you can talk to us on the [Discord](https://replit.com/discord) server where we have a help channel. You can report bugs by opening an issue here on GitHub.

## Development and Contributing

1. Clone the repository
    ```bash
    git clone https://github.com/replit-discord/replit-desktop.git
    cd replit-desktop
    ```
2. Install dependencies and run
    ```bash
    npm i -g npm # update npm 
    npm install
    npm start
    ```
If you would like to contribute, please refer to our [Contribution Guide](https://github.com/replit-discord/replit-desktop/blob/dev/.github/CONTRIBUTING.md).
Before contributing, please take a look at our [project boards](https://github.com/replit-discord/replit-desktop/projects).

**DEVELOPER NOTES:** 
+ The application requires Node 14 LTS or later. Node 15 also works but isn't recommended as Electron does not fully support it.
+ If you have trouble starting the app for an unknown developer on MacOS, use [`this`](https://support.apple.com/guide/mac-help/open-a-mac-app-from-an-unidentified-developer-mh40616/mac#:~:text=Open%20a%20Mac%20app%20from,as%20you%20can%20...) link.

## Final Note

Thanks for taking the time to check out Replit-Desktop, we hope you enjoy it! 🎉 
