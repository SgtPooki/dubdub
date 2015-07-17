'use strict';

var webpack = require('webpack-stream');
var gulp = require('gulp');
var baked = require('baked/gulp');
var stylus = require('gulp-stylus');
var browserSync = require('browser-sync').create();

// Browser-Sync
gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: './generated'
        },
        watchOptions: {
          debounceDelay: 2000
        }
    });
});
gulp.task('reload', function () {
  console.log('reloading folks!');
  browserSync.reload();
});

// webpack
gulp.task('webpack', function() {
  return gulp.src('./to_generate/js/app.js')
    .pipe(webpack({
      watch: true, //not sure if this is suppossed to be here for production builds
      output: {
        filename: 'bundle.js'
      }
    }))
    .pipe(gulp.dest('./generated/js/'));
});

// Load and get the baked configuration
// in order to use srcDir and dstDir
var config = baked.init();

// This example uses its specific package.json file so its gulp instance seems
// to be distinct than the baked's one. This helper allows to load every tasks
// in the right gulp environment.
baked.defineTasks(gulp);

var paths = {
  stylus: {
    src: config.options.srcDir + '/stylus/*.styl',
    dst: config.options.dstDir
  }
};

// Get and render all .styl files recursively
gulp.task('stylus', function () {
  gulp.src(paths.stylus.src)
    .pipe(stylus())
    .pipe(gulp.dest(paths.stylus.dst));
});
// More informations on https://www.npmjs.org/package/gulp-stylus

gulp.task('watch:stylus', function () {
  gulp.watch(paths.stylus.src, ['stylus']);
  gulp.watch('generated/*', ['reload']); //TODO: Figure out how to wait until backed:generate finishes so we don't have a ton of reloads while it's generating
});

// Defaults tasks
gulp.task('serve', ['stylus', 'webpack', 'watch:stylus', 'baked:serve', 'browser-sync']);
gulp.task('default', ['stylus', 'webpack', 'baked:default']);
