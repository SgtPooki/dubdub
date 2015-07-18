'use strict';

var webpack = require('webpack');
var gulpWebpack = require('webpack-stream');
var gulp = require('gulp');
var del = require('del');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var baked = require('baked/gulp');
var stylus = require('gulp-stylus');
var sourcemaps = require('gulp-sourcemaps');
var browserSync = require('browser-sync').create();

//////////////////////////////////////////////////////////////////
// Cleanup generated directory
gulp.task('clean', function(cb) {
  del(['generated'], cb);
});

//////////////////////////////////////////////////////////////////
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

//////////////////////////////////////////////////////////////////
// imagemin
gulp.task('imagemin', function() {
  return gulp.src('./to_generate/images/*')
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{removeViewBox: false}],
      use: [pngquant()]
    }))
    .pipe(gulp.dest('./generated/assets/images/'));
});

//////////////////////////////////////////////////////////////////
// webpack
gulp.task('webpack', function() {
  return gulp.src('./to_generate/js/app.js')
    .pipe(gulpWebpack({
      output: {
        filename: 'bundle.js'
      },
      plugins: [
        new webpack.optimize.UglifyJsPlugin({minimize: true})
      ]
    }))
    .pipe(gulp.dest('./generated/assets/javascript/'));
});
//TODO: make this DRY. Problem is you need watch:true for gulp serve, but can't have it for gulp because it will hang the build. Not sure how to pass in arguments to a gulp task either.
//TODO: How do we test that the minified version works? I think we should maybe minimize during watch as well with sourcemaps for debugging. Thoughts?
gulp.task('watch:webpack', function() {
  return gulp.src('./to_generate/js/app.js')
    .pipe(gulpWebpack({
      watch: true,
      output: {
        filename: 'bundle.js'
      }
    }))
    .pipe(gulp.dest('./generated/assets/javascript/'));
});

//////////////////////////////////////////////////////////////////
// baked

  // Load and get the baked configuration
  // in order to use srcDir and dstDir
  var config = baked.init();

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
  gulp.src('./to_generate/stylus/main.styl')
    .pipe(sourcemaps.init())
      .pipe(stylus({
        compress: true
      }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./generated/assets/stylesheets/'));
});
gulp.task('watch:stylus', function () {
  gulp.watch(paths.stylus.src, ['stylus']);
  gulp.watch('generated/*', ['reload']); //TODO: Figure out how to wait until backed:generate finishes so we don't have a ton of reloads while it's generating
});

//////////////////////////////////////////////////////////////////
// Defaults tasks
gulp.task('serve', ['stylus', 'imagemin', 'watch:webpack', 'watch:stylus', 'baked:serve', 'browser-sync']);
gulp.task('default', ['stylus', 'imagemin', 'webpack', 'baked:default']);
//TODO: Figure out how to call my 'clean' task to run before everything else. If you just add it to the list of all these things that run concurrently, you end up with race conditions which error because you're trying to delete folders & files at the same time as you're trying to write new folders & files.
// tried runSequence but it messed up the watchers
