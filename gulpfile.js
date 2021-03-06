'use strict';

var webpack = require('webpack');
var gulpWebpack = require('webpack-stream');
var gulp = require('gulp');
var del = require('del');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var baked = require('baked/gulp');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var browserSync = require('browser-sync').create();
var runSequence = require('run-sequence');

//////////////////////////////////////////////////////////////////
// Cleanup generated directory
gulp.task('clean', function(cb) {
  del(['generated'], cb);
});

//////////////////////////////////////////////////////////////////
// Browser-Sync
gulp.task('browser-sync', function() {
    browserSync.init({
        reloadDebounce: 5000,
        server: {
            baseDir: './generated'
        }
    });

    gulp.watch(['to_generate/**/*.html'], function () {
        runSequence(
            'baked:generate',
            browserSync.reload
        );
    });
});
gulp.task('reload', function () {
  console.log('reloading folks!');
  browserSync.reload();
});

//////////////////////////////////////////////////////////////////
// imagemin
gulp.task('imagemin', function() {
  return gulp.src('./to_generate/images/*')
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{removeViewBox: false}],
      use: [pngquant()]
    }))
    .pipe(gulp.dest('./generated/assets/images/'))
    .pipe(browserSync.stream({match: 'assets/images/**'}));
});

//////////////////////////////////////////////////////////////////
// webpack
gulp.task('webpack', function() {
  return gulp.src('./to_generate/js/app.js')
    .pipe(gulpWebpack({
      output: {
        filename: 'bundle.js'
      },
      externals: {
        'jquery': 'jQuery'
      },
      plugins: [
        new webpack.optimize.UglifyJsPlugin({minimize: true})
      ]
    }))
    .pipe(gulp.dest('./generated/assets/javascript/'));
});
//TODO: make this DRY. Problem is you need watch:true for gulp serve, but can't have it for gulp because it will hang the build. Not sure how to pass in arguments to a gulp task either.
//TODO: How do we test that the minified version works? I think we should maybe minimize during watch as well with sourcemaps for debugging. Thoughts?
gulp.task('webpack:watch', function() {
  return gulp.src('./to_generate/js/app.js')
    .pipe(gulpWebpack({
      watch: true,
      output: {
        filename: 'bundle.js'
      },
      externals: {
        'jquery': 'jQuery'
      }
    }))
    .pipe(gulp.dest('./generated/assets/javascript/'))
    .pipe(browserSync.stream({match: '**/*.js'}));
});

//////////////////////////////////////////////////////////////////
// baked
// Because we are handling js, stylus, and images ourselves, and we want to reload the page only when
// baked is done loading, we must tell baked to ignore the js, css, and image files. This will allow us to
// appropriately reload only when each of the different filetypes are changed using browserSync.stream for those
// tasks, and a browserSync.watch task on html files (the only thing being handled by baked.js).

  // baked.js currently has a bug where command line options are overriding options passed via
  // the baked.init() method. So we have to fix that by faking the command line arguments like below.
  // Please see https://github.com/prismicio/baked.js/issues/26 for more information.
  process.argv.push('--ignore');
  process.argv.push('js/*');
  process.argv.push('--ignore');
  process.argv.push('images/*');
  process.argv.push('--ignore');
  process.argv.push('stylus/*');

  // Load and get the baked configuration
  // in order to use srcDir and dstDir
  var config = baked.init({
      options: {
          ignore: [
              'images/*',
              'js/*',
              'stylus/*'
          ]
      }
  });

  // This example uses its specific package.json file so its gulp instance seems
  // to be distinct than the baked's one. This helper allows to load every tasks
  // in the right gulp environment.
  baked.defineTasks(gulp);


//////////////////////////////////////////////////////////////////
// sass : Get and render all .scss files recursively
gulp.task('sass', function () {
  return gulp.src('./to_generate/sass/**/*.scss')
    .pipe(sourcemaps.init())
      .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./generated/assets/stylesheets/'))
    .pipe(browserSync.stream({match: '**/*.css'}));
});
gulp.task('sass:watch', function () {
  gulp.watch('./to_generate/sass/**/*.scss', ['sass']);
});

//////////////////////////////////////////////////////////////////
// Defaults tasks
gulp.task('serve', ['sass', 'imagemin', 'webpack:watch', 'sass:watch', 'browser-sync']);
gulp.task('default', ['sass', 'imagemin', 'webpack', 'baked:default']);
//TODO: Figure out how to call my 'clean' task to run before everything else. If you just add it to the list of all these things that run concurrently, you end up with race conditions which error because you're trying to delete folders & files at the same time as you're trying to write new folders & files.
// tried runSequence but it messed up the watchers
