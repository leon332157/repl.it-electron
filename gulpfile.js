const gulp = require('gulp');
const terser = require('gulp-terser-js');
const jeditor = require('gulp-json-editor');
const ts = require('gulp-typescript');
const tsProject = ts.createProject('tsconfig.json');
const child_process = require('child_process');
const { platform } = require('os');
const htmlmin = require('gulp-htmlmin');
const cache = require('gulp-cached');

const electron = require('electron');
const proc = require('child_process');

let child = null;

function printEc(data) {
    var str = data.toString().trim();
    if (str) console.log('[electron] ' + str);
}

function runElectron() {
    var errored = false;

    if (child) child.kill();

    child = proc.spawn(electron, ['--no-sandbox', './ts-out/']);

    child.on('error', function (err) {
        errored = true;
        throw new Error(`gulp-run-electron ${err}`);
    });

    child.stdout.on('data', printEc);
    child.stderr.on('data', printEc);
}

async function copyFilesProd() {
    gulp.src('package.json')
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
        .pipe(gulp.dest('dist'));

    gulp.src('src/**/*.html')
        .pipe(
            htmlmin({
                minifyCss: true,
                minifyJs: true,
                collapseWhitespace: true
            })
        )
        .pipe(gulp.dest('dist'));
    gulp.src('src/**/*.css')
        .pipe(
            htmlmin({
                minifyCss: true,
                collapseWhitespace: true
            })
        )
        .pipe(gulp.dest('dist'));
    gulp.src('logos/replit-logo/256x256.png').pipe(gulp.dest('dist'));
}

async function buildProd() {
    gulp.src('src/**/*.ts')
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
        .pipe(gulp.dest('dist'));
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
    gulp.src('package.json').pipe(gulp.dest('ts-out'));

    gulp.src('src/**/*.html').pipe(gulp.dest('ts-out'));
    gulp.src('src/**/*.css').pipe(gulp.dest('ts-out'));
    gulp.src('logos/replit-logo/256x256.png').pipe(gulp.dest('ts-out'));
}

async function watchDev() {
    gulp.series(buildDev, copyFilesDev)();
    gulp.watch('src/*', { delay: 500 }, gulp.series(buildDev, runElectron));
    runElectron();
}

async function buildDev() {
    gulp.src('src/**/*.ts')
        .pipe(cache('buildDev'))
        .pipe(tsProject())
        .pipe(gulp.dest('ts-out/'));
}

module.exports.watchDev - gulp.task(watchDev);
module.exports.buildDev = gulp.series(buildDev, copyFilesDev);
module.exports.buildProd = gulp.series(buildProd, copyFilesProd);
module.exports.buildApp = gulp.series(buildApp);
