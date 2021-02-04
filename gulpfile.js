const { src, dest, series } = require('gulp');
const terser = require('gulp-terser-js');
const jeditor = require('gulp-json-editor');
const ts = require('gulp-typescript');
const tsProject = ts.createProject('tsconfig.json');
const child_process = require('child_process');
const { platform } = require('os');
const htmlmin = require('gulp-htmlmin');

async function copyFilesProd() {
    src('package.json')
        .pipe(
            jeditor((json) => {
                delete json.build;
                delete json.scripts;
                for (const key in json.devDependencies) {
                    if (json.devDependencies.hasOwnProperty(key))
                        json.devDependencies[key] = json.devDependencies[
                            key
                        ].replace('^', '');
                }
                return json;
            })
        )
        .pipe(dest('dist'));

    src('src/**/*.html')
        .pipe(
            htmlmin({
                minifyCss: true,
                minifyJs: true,
                collapseWhitespace: true
            })
        )
        .pipe(dest('dist'));
    src('src/**/*.css')
        .pipe(
            htmlmin({
                minifyCss: true,
                collapseWhitespace: true
            })
        )
        .pipe(dest('dist'));
    src('logos/replit-logo/256x256.png').pipe(dest('dist'));
}

async function buildProd() {
    src('src/**/*.ts')
        .pipe(tsProject())
        .pipe(
            terser({
                mangle: {
                    toplevel: true
                },
                compress: {}
            })
        )
        .on('error', (e) => {
            this.emit('end');
        })
        .pipe(dest('dist'));
}

async function buildApp() {
    if (platform() === 'darwin') {
        child_process.execSync(
            'electron-builder -c electron-builder.conf.js -wml',
            { stdio: 'inherit' }
        );
    } else if (platform() === 'win32') {
        child_process.execSync(
            'electron-builder -c electron-builder.conf.js -w',
            { stdio: 'inherit' }
        );
    } else {
        child_process.execSync(
            'electron-builder -c electron-builder.conf.js -l',
            { stdio: 'inherit' }
        );
    }
}

async function copyFilesDev() {
    src('package.json').pipe(dest('ts-out'));

    src('src/**/*.html').pipe(dest('ts-out'));
    src('src/**/*.css').pipe(dest('ts-out'));
    src('logos/replit-logo/256x256.png').pipe(dest('ts-out'));
}

async function buildDev() {
    src('src/**/*.ts').pipe(tsProject()).pipe(dest('ts-out/'));
}

module.exports.buildDev = series(buildDev, copyFilesDev);
module.exports.buildProd = series(buildProd, copyFilesProd);
module.exports.buildApp = series(buildApp);
