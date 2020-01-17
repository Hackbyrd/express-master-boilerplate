/**
 * Compiles SCSS into CSS while also adding browser prefixes
 *
 * yarn add gulp-cli gulp --dev --exact
 *
 * Run "yarn gulp" in command line terminal
 */

'use strict';

// third-party node modules
const gulp = require('gulp');
const compile = require('./mailers/compile');

// SASS
gulp.task('mailers', done => {
  compile(err => {
    if (err) {
      console.log(err);
      process.exit(1);
    }

    console.log('Email previews generated.');
    done();
  });
});

// SASS Watch for changes
gulp.task('mailers:watch', done => {
  gulp.watch('./mailers/**/index.ejs', gulp.series('mailers'));
  done();
});

// run all tasks
gulp.task(
  'default',
  gulp.series('mailers', 'mailers:watch', done => {
    console.log('Gulp finished.');
  })
);
