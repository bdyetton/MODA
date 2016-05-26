# json-fs
[![Build Status](https://travis-ci.org/jokeyrhyme/json-fs.png?branch=master,develop)](https://travis-ci.org/jokeyrhyme/json-fs)
[![NPM version](https://badge.fury.io/js/json-fs.png)](http://badge.fury.io/js/json-fs) [![Coverage Status](https://coveralls.io/repos/jokeyrhyme/json-fs/badge.png)](https://coveralls.io/r/jokeyrhyme/json-fs)

convert JSON to files and directories and back

## Getting Started

Install the module with: `npm install json-fs`

Refer to it in Node.JS with: `require('json-fs')`

## Command-Line Interface

This module provides basic CLI tools. The easiest way to access them is to
install the module globally (with permission):

    npm install -g json-fs

You'll be able to run `json2fs` and `fs2json` for convenient access to the
functionality provided by the library. You can run them with `-h` or `--help`
to see basic instructions.

`json2fs` reads a JSON stream from stdin and modifies the current working
directory accordingly. **Make sure to `cd` to your target directory first!**

    json2fs < path/to/file.json

`fs2json` writes a JSON stream to stdout, based on the current working
directory. This doesn't modify the file-system, so it's safe to run anywhere.

    fs2json > path/to/file.json

## Documentation

- specification for [data type mapping](doc/mapping.md)

Whilst a JSON document containing only a Null, Boolean, Number or String may be
considered valid for other purposes, JSON-FS is only intended for use with
valid JSON documents that specify an Array or Object.

### Generating API Documentation

You may build the documentation using [JSDoc3](http://usejsdoc.org) with the
following grunt task (note this requires Java and JAVA_HOME to be set):

    grunt doc

The HTML documentation will be built in the `doc/jsdoc` directory.

## Examples

### FSBuilder

```javascript
var fsBuilder = new require('json-fs').FSBuilder();
fsBuilder.setSource({ object: 'or array', [ 'to', 'store', 'as', 'files' ] });
fsBuilder.setOutput('/path/to/output/directory')
fsBuilder.build(function (err) {
  if (err) {
    throw err;
  }
  // otherwise, the contents of the directory have been built!
});
```

### JSONBuilder

```javascript
var jsonBuilder = new require('json-fs').JSONBuilder();
jsonBuilder.setSource('/path/to/input/directory')
jsonBuilder.build(function (err, result) {
  if (err) {
    throw err;
  }
  // otherwise, result will be an Object or Array as per the directory
});
```

## Contributing
Formal style-guide for this project is JSLint. See JSLint settings at the top of
each file.

Add unit tests for any new or changed functionality. Lint and test your code
using [Grunt](http://gruntjs.com/).

    grunt test

This project uses [Git Flow](https://github.com/nvie/gitflow), so the master
branch always reflects what is in production (i.e. what is in the NPM repository).
New code should be merged into the develop branch.

## Release History
See [GitHub Releases](https://github.com/jokeyrhyme/json-fs/releases)

## License
Copyright (c) 2013 Ron Waldon
Licensed under the MIT license.
