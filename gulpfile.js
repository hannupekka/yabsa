var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var reactify = require('reactify');
var watchify = require('watchify');
var less = require('gulp-less');
var path = require('path');
var autoprefixer = require('gulp-autoprefixer');
var uglifycss = require('gulp-uglifycss');
var mocha = require('gulp-mocha');

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

gulp.task('js', function() {
    var bundler = browserify({
        entries: ['./src/js/app.js'],
        transform: [reactify],
        debug: false
    });

    bundler.transform({
      global: true
    }, 'uglifyify');

    bundler
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('./assets/js/'));

});

gulp.task('browserify', function() {
    var bundler = browserify({
        entries: ['./src/js/app.js'],
        transform: [reactify],
        debug: true
    });

    var watcher = watchify(bundler);

    return watcher
    .on('update', function () {
        var updateStart = Date.now();
        watcher.bundle()
        .pipe(source('bundle.js'))
        .pipe(gulp.dest('./assets/js/'));
        console.log('Updated!', (Date.now() - updateStart) + 'ms');
    })
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('./assets/js/'));
});

gulp.task('lesswatch', function () {
    gulp.watch('./src/less/styles.less', ['less']);
});

gulp.task('test', function () {
    return gulp.src('./test/test.js', {read: false})
        .pipe(mocha({reporter: 'spec'}));
});

gulp.task('default', ['browserify', 'lesswatch']);
gulp.task('build', ['test', 'less', 'js']);