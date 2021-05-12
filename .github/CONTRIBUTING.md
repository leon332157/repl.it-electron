# Contributing

👋 Hello! Thanks for thinking about contributing! Make sure you read the following sections before contributing.
If you want to be added as a collaborator, DM Leon on discord @`leon332157#6808` or ask in the `replit-desktop` channel on the [Replit Discord](https://replit.com/discord) server.

## Tools
We recommend using the following tools:

+ VSCode as your **IDE**.
+ Git Bash or GitHub Desktop as your **Version Control**.
+ TypeScript, Eslint and Prettier as your VSC **extensions**.

We have a strict linting policy so be sure to run `npm lint:check` before pushing or making a pull request.

## Scripts

These are the scripts that can be run with `npm run {script-name}`:

|Script Name     |Description                                                                                                               |
|:---------------|:-------------------------------------------------------------------------------------------------------------------------|
|`start`         |Runs `npm run build` and `npm run build:run`, used for running electron with compiled `.ts` files in a development environment.|
|`lint:check`    |Identifies all linting issues with eslint. Lints TypeScript as well as JavaScript.                                        |
|`lint`          |This formats code according to Prettier style guides.                                                                     |
|`build`         |Uses gulp to create a JavaScript build of the app.                                                                        |
|`build:run`     |Run electron from ts-out                                                                                                  |
|`build:prod`    |Builds a production JS version of the app.                                                                                |
|`watch`         |Watch for changes in `src/` and rebuild and relaunch electron every time if there's a change.                             |
|`dist`          |Builds the app for release.                                                                                               | 

## Pull Requests

1. Fork the repository: [`Fork`](https://github.com/replit-discord/replit-desktop/fork)
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -a -m 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create a new Pull Request! 🎉

PRs will be reviewed by [Leon](https://github.com/leon332157) and/or other team members. For large additions to the codebase, it'd be best if you could communicate your intentions and dev process to us on the discord server.

Be sure to create a new branch when contributing. *Do **not** commit to the `dev` or `master` branch directly*.  **Do not commit to another user's branch without asking permission first.** Use your name and feature name to name branches.

**Examples:**

```bash
leon-format-code
jdog-new-cache-system
frissyn-readme-patch
```

## Commiting Guidelines

+ Do not add a period at the end
+ Keep commits short and meaningful
+ Do not capitalize the first letter
+ (*Optional*) Use commit prefixes, here are some examples:

```html
📝: update README information
fix: use static typing for object vars
update: add discord RPC extensions
🗑️: delete redundant .ts files
```
