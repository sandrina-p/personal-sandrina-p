var gulp = require('gulp'),

    //general plugins
    rename = require('gulp-rename'),
    argv = require('yargs').argv, //useful to create ENV (prod vs dev)
    gulpif = require('gulp-if'), //useful to create ENV (prod vs dev)
    gutil = require('gulp-util'), //some debug logs
    changed = require('gulp-changed'),
    cached = require('gulp-cached'),
    stripDebug = require('gulp-strip-debug'), //byebye console.logs
    chalk = require('chalk'), //some colors on terminal

    php2html = require("gulp-php2html"),
    htmlmin = require('gulp-htmlmin'),

    browserSync = require('browser-sync'), // i'm not sure how this and connect-php works ...
    php = require('gulp-connect-php'), // ... but you can read more about it here -> http://stackoverflow.com/a/37040763/4737729
    reload = browserSync.reload;

    //scss stuff
    sass = require('gulp-sass'),
    cleanCSS = require('gulp-clean-css'),
    autoprefixer = require('gulp-autoprefixer'),
    sassInheritance = require('gulp-sass-multi-inheritance'), // watch partials
    importCss = require('gulp-import-css'), //combine css imports (not scss)

    //javascript plugins
    uglify = require('gulp-uglify'),
    include = require("gulp-include"),
    babel = require('gulp-babel'); //es2015 rocks

var folderScripts = 'src',
    folderStyles = 'src';
    srcScss = [ folderStyles+'/**/*.scss', '!'+folderStyles+'/**/_*.scss'];


function logEnv() {
    var chWarn = chalk.bold.red,
        chGood = chalk.bold.green,
        envv = argv.production ? chGood('production') : chWarn('development');
    console.log('environment: ' + envv);
}


gulp.task('default', function(){
    var chTitle = chalk.bold.blue,
        chBold = chalk.bold;
    console.log(chBold('Gulp tasks available')+"\n"
        +chTitle('gulp start')+"\n"
        	+"     watch .js (!*.min.js, !_*.js) modifications on assets/scripts and apply scripts task.\n"
            +"     watch .scss (!_*.scss) modifications on assets/styles and apply styles task. \n"
            +"     compile index.php to index.html \n"
            +"     Use '--production' to also minify them. \n"

        +"\n"+chTitle('gulp build')+"\n"
        	+"     run scripts, styles and html tasks. and minify them.\n"

        +"\n"+chTitle('$ gulp gen-html')+"\n"
            +"     compile index.php to index.html.\n"
    );
});

gulp.task('start', ['setWatch', 'scssPartials', 'browser-sync']);

gulp.task('build', ['run-prod', 'scripts', 'scss', 'gen-html']);

gulp.task('run-prod', function() {
    argv.production = true;
});


gulp.task('scripts', function(){
    console.log('start task scripts');
    gulp.src(['src/vendor.js', 'src/index.js'])
        .pipe(include())
        .pipe(babel({
            presets: ["es2015-script"],
            compact: false // use uglify
        }))
        .pipe(gulpif(argv.production, stripDebug()))
        .pipe(gulpif(argv.production,
            uglify().on('error', gutil.log)
        ))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulpif(global.isWatching, cached('cachedPlace')))
        .pipe(gulp.dest(folderScripts))
        .pipe(browserSync.stream());
    logEnv();
});


gulp.task('scss', function(){
    console.log('start task scss');
    gulp.src(['src/critical.scss', 'src/index.scss'])
        .pipe(sass.sync().on('error', sass.logError))
        .pipe(rename({ suffix: '.min' }))
        .pipe(autoprefixer({
            browsers: ['last 2 version'],
            cascade: true
        }))
        .pipe(importCss())
        .pipe(gulpif(argv.production,
            cleanCSS({
                compatibility: 'ie9'
            })
        ))
        .pipe(gulpif(argv.development,
            cleanCSS({
                compatibility: 'ie9',
                advanced: false //much faster comp.
            })
        ))
        .pipe(gulpif(global.isWatching, cached('cachedPlace')))
        .pipe(gulp.dest(folderStyles))
        .pipe(browserSync.stream());
    logEnv();
});

gulp.task('scssPartials', function() {
    // watch for partials when they are changed to change their parent.
    return gulp.src('**/*.scss')
        .pipe(gulpif(global.isWatching, cached(srcScss))) //filter out unchanged scss files, only works when watching
        .pipe(sassInheritance({dir: 'src'}).on('error', gutil.log)); //find files that depend on the files that have changed
});


gulp.task('gen-html', function(){
    gulp.src("index.php")
    .pipe(php2html())
    .pipe(gulpif(argv.production,
        htmlmin({collapseWhitespace: true})
    ))
    .on('error', console.error)
    .pipe(gulp.dest(""));
});


gulp.task('browser-sync', function() {
    browserSync({
        server: {
            baseDir: './'
        },
        notify: false,
        open: false,
        ghostMode: false
    });

    gulp.watch(folderScripts+"/**/*.js", ['scripts']);
    gulp.watch(folderStyles+"/**/*.scss", ['scss']);
    gulp.watch(['**/*.php'], ['gen-html']);
    gulp.watch(["index.html"]).on('change', browserSync.reload);
});

gulp.task('setWatch', function() {
    global.isWatching = true;
});
