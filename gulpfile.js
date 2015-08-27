var gulp = require('gulp');
var jsxcs = require('gulp-jsxcs');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var reactify = require('reactify');
var watchify = require('watchify');
var less = require('gulp-less');
var path = require('path');
var autoprefixer = require('gulp-autoprefixer');
var uglifycss = require('gulp-uglifycss');
var mocha = require('gulp-mocha');
var plumber = require('gulp-plumber');

// External dependencies.
var libs = [
    'react',
    'react/addons',
    'react-router',
    'lodash.map',
    'lodash.sortby',
    'lodash.foreach',
    'lodash.reduce',
    'lodash.find',
    'lodash.remove',
    'react-intl',
    'superagent',
    'classnames'
];

gulp.task('less', function () {
  return gulp.src('./client/src/less/styles.less')
    .pipe(less({
        paths: [ path.join(__dirname, 'less', 'includes') ]
    }))
    .pipe(autoprefixer({
        browsers: ['last 2 versions'],
        cascade: false
    }))
    .pipe(uglifycss())
    .pipe(gulp.dest('./public/assets/css'));
});

// Task to build vendor JS files.
gulp.task('vendor', function() {
    var bundler = browserify({
        debug: false,
        require: libs
    });

    bundler.transform({
        global: true,
        sourcemap: false
    }, 'uglifyify');

    bundler
        .bundle()
        .on('error', function(err){console.log(err.message);})
        .pipe(source('vendor.js'))
        .pipe(gulp.dest('./public/assets/js'));
});

gulp.task('app', function() {
    var bundler = browserify({
        entries: ['./client/src/js/app.js'],
        transform: [reactify],
        debug: false
    });

    bundler.external(libs);

    bundler.transform({
        global: true
    }, 'uglifyify');

    bundler
        .bundle()
        .on('error', function(err){console.log(err.message);})
        .pipe(source('bundle.js'))
        .pipe(gulp.dest('./public/assets/js/'));

});

gulp.task('browserify', function() {
    var bundler = browserify({
        entries: ['./client/src/js/app.js'],
        transform: [reactify],
        debug: true
    });

    bundler.external(libs);

    var watcher = watchify(bundler);

    return watcher
    .on('update', function () {
        var updateStart = Date.now();
        watcher.bundle()
        .on('error', function(err){console.log(err.message);})
        .pipe(source('bundle.js'))
        .pipe(gulp.dest('./public/assets/js/'));
        console.log('Updated!', (Date.now() - updateStart) + 'ms');
    })
    .bundle()
    .on('error', function(err){console.log(err.message);})
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('./public/assets/js/'));
});

gulp.task('lesswatch', function () {
    gulp.watch('./client/src/less/styles.less', ['less']);
});

gulp.task('jscs', function () {
    gulp.src(['client/src/js/**/*.js*'])
        .pipe(plumber({
            errorHandler: function (err) {
                console.log(err);
                this.emit('end');
            }
        }))
        .pipe(jsxcs());
});

gulp.task('test', function () {
    return gulp.src('./test/test.js', {read: false})
        .pipe(mocha({reporter: 'spec'}));
});

gulp.task('default', ['browserify', 'lesswatch']);
gulp.task('build', ['test', 'less', 'jscs', 'vendor', 'app']);