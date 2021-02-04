const gulp = require('gulp');
const terser = require('gulp-terser-js');
const jeditor = require('gulp-json-editor');
const ts = require('gulp-typescript');
const tsProject = ts.createProject('tsconfig.json');
const child_process = require('child_process');
const { platform } = require('os');
const htmlmin = require('gulp-htmlmin');
const cache = require('gulp-cached');
const runEc = require('gulp-run-electron');

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

    gulp.src('gulp.src/**/*.html')
        .pipe(
            htmlmin({
                minifyCss: true,
                minifyJs: true,
                collapseWhitespace: true
            })
        )
        .pipe(gulp.dest('dist'));
    gulp.src('gulp.src/**/*.css')
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
    gulp.src('gulp.src/**/*.ts')
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

    gulp.src('gulp.src/**/*.html').pipe(gulp.dest('ts-out'));
    gulp.src('gulp.src/**/*.css').pipe(gulp.dest('ts-out'));
    gulp.src('logos/replit-logo/256x256.png').pipe(gulp.dest('ts-out'));
}

async function watchDev() {
    gulp.watch('src/*', { delay: 500 }, gulp.series(buildDev, reRunElectron));
    runElectron();
}

async function buildDev() {
    gulp.src('gulp.src/**/*.ts')
        .pipe(cache('buildDev'))
        .pipe(tsProject())
        .pipe(gulp.dest('ts-out/'));
}

async function runElectron() {
    gulp.src('ts-out').pipe(runEc());
}

async function reRunElectron() {
    runEc.rerun({ cwd: 'ts-out' });
}
module.exports.watchDev - gulp.task(watchDev);
module.exports.buildDev = gulp.series(buildDev, copyFilesDev, runElectron);
module.exports.buildProd = gulp.series(buildProd, copyFilesProd);
module.exports.buildApp = gulp.series(buildApp);
