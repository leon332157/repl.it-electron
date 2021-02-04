# Contributing

👋 Hey! Thanks for thinking about contributing! Make sure you read the following sections before contributing.
If you want to be added as a collaborator, DM Leon on discord. `leon332157#6808`

## Tools
I recommend using VSCode on a PC with a few extensions like TypeScript, Eslint and Prettier, which will ensure maxium integration with our code. 

You can also write code in [Repl.it](https://repl.it/@leon332157/repl-it-electron) however is not recommended since it's not optimal for electron. 
## Scripts

### `start`

Runs `npm run build` and `npm run build:run`, used for running electron with compiled ts files in a devlopmemt enviroment. 

### `lint:check`

Identifies all linting issues with eslint. Lints TypeScript as well as JavaScript.

### `lint`

This formats code according to Prettier style guides. Use `npm run lint` to correct all correctable errors.

### `build`

Uses gulp to create a JavaScript build of the app.

### `build:run`

Run electron from ts-out

### `build:prod`
Builds a production JS version of the app.

### `watchDev`
Watch for changes in src and rebuild and relauncher electron every time if there's a change. 

### `dist`
Builds the app for release. 

## Pull Requests

Before you make a PR

1. Name the PR your feature/changes. 
2. Merge into the dev branch. 

PRs will be reviewed by [Leon](https://github.com/leon332157) and other team members.

## Commits

* Keep commits short and meaningful
* Do not capitalize the first letter
* Do not add a period

## Branch Naming

Be sure to create a new branch when contributing. *Do **not** commit to the `dev` or `master` branch directly*. Use your name and feature name to name branches. 
#### Examples

```bash
leon-format-code
jdog-new-cache-system
```
