var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var uglify = require('gulp-uglify');
var reactify = require('reactify');
var watchify = require('watchify');
var streamify = require('gulp-streamify');
var less = require('gulp-less');
var path = require('path');
var autoprefixer = require('gulp-autoprefixer');
var uglifycss = require('gulp-uglifycss');

gulp.task('less', function () {
  return gulp.src('./src/less/styles.less')
    .pipe(less({
        paths: [ path.join(__dirname, 'less', 'includes') ]
    }))
    .pipe(autoprefixer({
        browsers: ['last 2 versions'],
        cascade: false
    }))
    .pipe(uglifycss())
    .pipe(gulp.dest('./assets/css'));
});

gulp.task('browserify', function() {
    var bundler = browserify({
        entries: ['./src/js/app.js'],
        transform: [reactify],
        debug: true,
        cache: {}, packageCache: {}, fullPaths: true
    });
    var watcher  = watchify(bundler);

    return watcher
    .on('update', function () {
        var updateStart = Date.now();
        watcher.bundle()
        .pipe(source('bundle.js'))
        //.pipe(streamify(uglify()))
        .pipe(gulp.dest('./assets/js/'));
        console.log('Updated!', (Date.now() - updateStart) + 'ms');
    })
    .bundle()
    .pipe(source('bundle.js'))
    //.pipe(streamify(uglify()))
    .pipe(gulp.dest('./assets/js/'));
});

gulp.task('lesswatch', function () {
    gulp.watch('./src/less/styles.less', ['less']);
});
gulp.task('default', ['browserify', 'lesswatch']);