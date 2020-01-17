/**
 * Compile and generate a preview of all the templates
 *
 * Run this to compile:
 * compile(err => { if (err) { console.log(err); process.exit(1); } console.log('Success!'); });
 */

'use strict';

// built-in
const fs = require('fs');
const path = require('path');

// ejs
const ejs = require('ejs');
const async = require('async');

function compile(callback) {
  // the file to compile
  const MAILER_FILE = 'index.ejs';
  var mailers = []; // the mailer files

  // check if is directory and get directories
  const isDirectory = source => fs.lstatSync(source).isDirectory();
  const getDirectories = source =>
    fs
      .readdirSync(source)
      .map(name => path.join(source, name))
      .filter(isDirectory);
  const directories = getDirectories(__dirname);

  // add each model to models object
  async.eachSeries(
    directories,
    (dir, next) => {
      // write html file
      ejs.renderFile(path.join(dir, 'index.ejs'), {}, (err, rawHtml) => {
        if (err) {
          return next(err);
        }

        // write file
        fs.writeFile(path.join(dir, 'preview.html'), rawHtml, err => next(err));
      }); // END write html file
    },
    err => callback(err)
  );
}

module.exports = compile;
