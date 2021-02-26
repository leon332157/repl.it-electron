# Contributing

👋 Hello! Thanks for thinking about contributing! Make sure you read the following sections before contributing.
If you want to be added as a collaborator, DM Leon on discord. `leon332157#6808`

## Tools
We recommend using the following tools:

You can also write code in [Repl.it](https://repl.it/@leon332157/repl-it-electron) however is not recommended since it's not optimal for electron. 
## Scripts

### `start`

Runs `npm run build` and `npm run build:run`, used for running electron with compiled ts files in a development enviroment. 

### `lint:check`

Identifies all linting issues with eslint. Lints TypeScript as well as JavaScript.

### `lint`

You can also write code in [Replit](https://repl.it/@leon332157/repl-it-electron) however it is not recommended since it's not optimal for electron.

We have a strict linting policy be sure to run `npm lint:check` before pushing or making a pull request and that it does not give you any issues.

## Scripts

These are the scripts that can be run with `npm {script-name}`:

|Script Name     |Description                                                                                                               |
|:--------------:|:-------------------------------------------------------------------------------------------------------------------------|
|`start`         |Runs `npm run build` and `npm run build:run`, used for running electron with compiled ts files in a development environment.|
|`lint:check`    |Identifies all linting issues with eslint. Lints TypeScript as well as JavaScript.                                        |
|`lint`          |This formats code according to Prettier style guides.                                                                     |
|`build`         |Uses gulp to create a JavaScript build of the app.                                                                        |
|`build:run`     |Run electron from ts-out                                                                                                  |
|`build:prod`    |Builds a production JS version of the app.                                                                                |
|`watch`      |Watch for changes in src and rebuild and relaunch electron every time if there's a change.                                |
|`dist`          |Builds the app for release.                                                                                               | 

## Pull Requests

Before you make a PR

1. Name the PR after your feature/changes. 
2. Merge into the dev branch.

PRs will be reviewed by [Leon](https://github.com/leon332157) and/or other team members.

## Commits

+ Do not add a period
+ Keep commits short and meaningful
+ Do not capitalize the first letter
+ (*Optional*) Use commit prefixes, here are some examples:

```html
📝: update README information
fix: use static typing for object vars
update: add discord RPC extensions
🗑️: delete redundant .ts files
```

## Branch Naming

Be sure to create a new branch when contributing. *Do **not** commit to the `dev` or `master` branch directly*. Use your name and feature name to name branches.
#### Examples

```bash
leon-format-code
jdog-new-cache-system
frissyn-readme-patch
```
