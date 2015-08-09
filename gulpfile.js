'use strict';

var webpack = require('webpack-stream');
var gulp = require('gulp');
var del = require('del');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var baked = require('baked/gulp');
var stylus = require('gulp-stylus');
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
    .pipe(webpack({
      output: {
        filename: 'bundle.js'
      }
    }))
    .pipe(gulp.dest('./generated/assets/javascript/'));
});
//TODO: make this DRY. Problem is you need watch:true for gulp serve, but can't have it for gulp because it will hang the build. Not sure how to pass in arguments to a gulp task either.
gulp.task('watch:webpack', function() {
  return gulp.src('./to_generate/js/app.js')
    .pipe(webpack({
      watch: true,
      output: {
        filename: 'bundle.js'
      }
    }))
    .pipe(gulp.dest('./generated/assets/javascript/'))
    .pipe(browserSync.stream({match: "**/*.js"}));
});

//////////////////////////////////////////////////////////////////
// baked

  // Load and get the baked configuration
  // in order to use srcDir and dstDir
  var config = baked.init({
      options: {
          ignore: [
              '/images',
              '/js',
              '/stylus'
          ]
      }
  });

  // This example uses its specific package.json file so its gulp instance seems
  // to be distinct than the baked's one. This helper allows to load every tasks
  // in the right gulp environment.
  baked.defineTasks(gulp);


//////////////////////////////////////////////////////////////////
// stylus : Get and render all .styl files recursively
var paths = {
  stylus: {
    src: config.options.srcDir + '/stylus/*.styl',
    dst: config.options.dstDir
  }
};
gulp.task('stylus', function () {
  return gulp.src('./to_generate/stylus/main.styl')
    .pipe(sourcemaps.init())
      .pipe(stylus({
        compress: true
      }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./generated/assets/stylesheets/'))
    .pipe(browserSync.stream({match: "**/*.css"}));
});
gulp.task('watch:stylus', function () {
  gulp.watch(paths.stylus.src, ['stylus']);
});

//////////////////////////////////////////////////////////////////
// Defaults tasks
gulp.task('serve', ['stylus', 'imagemin', 'watch:webpack', 'watch:stylus', 'browser-sync']);
gulp.task('default', ['stylus', 'imagemin', 'webpack', 'baked:default']);
//TODO: Figure out how to call my 'clean' task to run before everything else. If you just add it to the list of all these things that run concurrently, you end up with race conditions which error because you're trying to delete folders & files at the same time as you're trying to write new folders & files.
// tried runSequence but it messed up the watchers
