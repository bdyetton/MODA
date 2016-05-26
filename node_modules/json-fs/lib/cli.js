/** @module json-fs */
/*jslint es5:true, indent:2, maxlen:80, node:true*/
/*jslint nomen:true*/ // Node.JS global __dirname
'use strict';

// Node.JS standard modules

var path;
path = require('path');

// 3rd-party modules

// custom modules

var FSBuilder, JSONBuilder;
FSBuilder = require(path.join(__dirname, 'fsbuilder'));
JSONBuilder = require(path.join(__dirname, 'jsonbuilder'));

// promise-bound anti-callbacks

// this module

var mode, builder, json, isHelpNeeded;
mode = path.basename(process.argv[1]);

isHelpNeeded = false;
process.argv.slice(2).forEach(function (arg) {
  if (['help', '-h', '--help'].indexOf(arg) !== -1) {
    isHelpNeeded = true;
  }
});

if (mode === 'fs2json') {
  if (isHelpNeeded) {
    console.log('- outputs JSON based on the current working directory');
    console.log('usage: json2fs > file.json');

  } else {
    builder = new JSONBuilder();
    builder.setSource(process.cwd());
    builder.build(function (err, result) {
      if (err) {
        console.error(err);
        process.exit(1);
        return;
      }
      process.stdout.write(JSON.stringify(result));
    });
  }
}

if (mode === 'json2fs') {
  if (isHelpNeeded) {
    console.log('- modifies the current working directory based on JSON');
    console.log('usage: json2fs < file.json');

  } else {

    json = '';
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', function (chunk) {
      json += chunk;
    });
    process.stdin.on('end', function () {
      builder = new FSBuilder();
      builder.setSource(JSON.parse(json));
      builder.setOutput(process.cwd());
      builder.build(function (err) {
        if (err) {
          console.error(err);
          process.exit(1);
          return;
        }
      });
    });
  }
}
