const gulp = require('gulp');
const terser = require('gulp-terser-js');
const jeditor = require('gulp-json-editor');
const ts = require('gulp-typescript');
const child_process = require('child_process');
const { platform } = require('os');
const htmlmin = require('gulp-htmlmin');
const cache = require('gulp-cached');
const electron = require('electron');
const proc = require('child_process');

const tsProject = ts.createProject('tsconfig.json');
let child = null;

function printEc(data) {
    const str = data.toString().trim();
    if (str) console.log(`[electron_debug]  ${str}`);
}

async function runElectron() {
    if (child) {
        child.kill();
    }

    child = proc.spawn(electron, ['--no-sandbox', '--trace-warnings', '.'], {
        cwd: './ts-out'
    });

    child.on('error', function (err) {
        errored = true;
        throw new Error(`Electron Error: ${err}`);
    });

    child.once('exit', (code) => {
        if (code === 0) {
            process.exit(0);
        }
    });

    child.stdout.on('data', printEc);
    child.stderr.on('data', printEc);
    return child;
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

    gulp.src('src/**/*(.html||.css)')
        .pipe(
            htmlmin({
                minifyCss: true,
                minifyJs: true,
                collapseWhitespace: true
            })
        )
        .pipe(gulp.dest('dist'));
    gulp.src('logos/replit-logo/512x512.png').pipe(gulp.dest('dist'));
}

async function buildProd() {
    return new Promise((resolve, reject) => {
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
            .on('error', reject)
            .pipe(gulp.dest('dist'))
            .on('end', resolve);
    });
}

async function buildAppPreRelease() {
    if (platform() === 'darwin') {
        child_process.execSync(
            'electron-builder -c electron-builder.pre-release.conf.js -wml',
            { stdio: 'inherit' }
        );
    } else if (platform() === 'win32') {
        child_process.execSync(
            'electron-builder -c electron-builder.pre-release.conf.js -w',
            { stdio: 'inherit' }
        );
    } else {
        child_process.execSync(
            'electron-builder -c electron-builder.pre-release.conf.js -l',
            { stdio: 'inherit' }
        );
    }
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
    gulp.src('package.json').pipe(cache('copyDev')).pipe(gulp.dest('ts-out'));

    gulp.src('src/**/*.html').pipe(cache('copyDev')).pipe(gulp.dest('ts-out'));
    gulp.src('src/**/*.css').pipe(cache('copyDev')).pipe(gulp.dest('ts-out'));
    gulp.src('src/**/*.js').pipe(cache('copyDev')).pipe(gulp.dest('ts-out'));
    gulp.src('logos/replit-logo/512x512.png')
        .pipe(cache('copyDev'))
        .pipe(gulp.dest('ts-out'));
}

async function copyFilesDevNoCache() {
    gulp.src('package.json').pipe(gulp.dest('ts-out'));

    gulp.src('src/**/*.html').pipe(gulp.dest('ts-out'));
    gulp.src('src/**/*.css').pipe(gulp.dest('ts-out'));
    gulp.src('src/**/*.js').pipe(gulp.dest('ts-out'));
    gulp.src('logos/replit-logo/512x512.png').pipe(gulp.dest('ts-out'));
}

async function watchDev() {
    gulp.series(buildDevWatch, copyFilesDev)();
    gulp.watch(
        'src/**/*',
        { delay: 10 * 100 }, // Poll every 10 seconds
        gulp.series(buildDevWatch, copyFilesDev, runElectron)
    );
    runElectron();
}
async function buildDevWatch() {
    gulp.src('src/**/*.ts')
        .pipe(cache('buildDev'))
        .pipe(tsProject(ts.reporter.fullReporter()))
        .pipe(gulp.dest('ts-out/'));
}

async function buildDev() {
    return new Promise((resolve, reject) => {
        gulp.src('src/**/*.ts')
            .pipe(tsProject(ts.reporter.fullReporter()))
            .on('error', reject)
            .pipe(gulp.dest('ts-out/'))
            .on('end', resolve);
    });
}

module.exports.watchDev = watchDev;
module.exports.buildAndRun = gulp.series(
    buildDev,
    copyFilesDevNoCache,
    runElectron
);
module.exports.buildDev = gulp.series(buildDev, copyFilesDevNoCache);
module.exports.buildProd = gulp.series(buildProd, copyFilesProd);
module.exports.buildApp = buildApp;
module.exports.buildAppPreRelease = buildAppPreRelease;
