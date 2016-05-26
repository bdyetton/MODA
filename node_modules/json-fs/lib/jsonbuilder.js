/*jslint es5:true, indent:2, maxlen:80, node:true*/
'use strict';

// Node.JS standard modules

var fs, path;
fs = require('graceful-fs');
path = require('path');

// 3rd-party modules

var Q, glob;
Q = require('q');
glob = require('glob');

// custom modules

// promise-bound anti-callbacks

// this module

/**
 * @constructor
 * @classdesc a JSONBuilder reads from the file-system and outputs JavaScript
 *   values
 */
function JSONBuilder() {
  /**
   * the String path to the directory to read form
   * @readonly
   */
  this.source = null;
}

/** convention: convenient access to constructor */
JSONBuilder.prototype.constructor = JSONBuilder;

/**
 * @param {String} source the directory to read from
 * @throws {TypeError} source should only be a string
 */
JSONBuilder.prototype.setSource = function (source) {
  if (typeof source !== 'string' || !source.length) {
    throw new TypeError('not String path');
  }
  this.source = source;
};

function parseName(fullPath) {
  var label, type, ext;
  if (typeof fullPath !== 'string' || !fullPath.length) {
    return {};
  }
  ext = path.extname(fullPath);
  if (fullPath[fullPath.length - 1] === path.sep) {
    // process it as a directory
    if (ext === '.object' || ext === '.array') {
      label = path.basename(fullPath, ext);
    } else {
      label = path.basename(fullPath);
    }
    return {
      label: label,
      ext: ext.replace('.', '')
    };
  }
  // process it as a file
  type = path.extname(path.basename(fullPath, ext));
  if (['.null', '.boolean', '.number', '.string'].indexOf(type) === -1) {
    return {};
  }
  label = path.basename(path.basename(fullPath, ext), type);
  return {
    label: label,
    type: type.replace('.', ''),
    ext: ext.replace('.', '')
  };
}

function readFile(file) {
  var dfrd, parts;
  dfrd = Q.defer();
  parts = parseName(file);
  if (parts.type === 'null') {
    dfrd.resolve(null);
    return dfrd.promise;
  }
  fs.readFile(file, { encoding: 'utf8' }, function (err, data) {
    var value;
    if (err) {
      dfrd.reject(err);
      return;
    }
    switch (parts.type) {
    case 'boolean':
      value = data === 'true';
      break;
    case 'number':
      if ((/^\d+$/).test(data)) {
        value = parseInt(data, 10);
      } else {
        value = parseFloat(data);
      }
      break;
    default:
      value = String(data);
    }
    dfrd.resolve(value);
  });
  return dfrd.promise;
}

/**
 * caution: as a side-effect, this may sort the files Array
 * @param {String} dir
 * @param {String[]} files
 * @ignore
 */
function detectDirType(dir, files) {
  var type, isIndexedFiles, isLengthMatched;
  type = 'object';
  isIndexedFiles = false;
  isLengthMatched = false;
  if (path.extname(dir) === '.array') {
    if (!files.length) {
      return 'array';
    }
    // double-check to see if its contents are Array-compatible
    isIndexedFiles = files.every(function (file) {
      var parts, index;
      parts = parseName(file);
      if (!parts.label || !(/^\d+$/).test(parts.label)) {
        return false;
      }
      index = parseInt(parts.label, 10);
      return index < files.length;
    });
    if (!isIndexedFiles) {
      return 'object';
    }
    files.sort(function (a, b) {
      return parseInt(a, 10) - parseInt(b, 10);
    });
    isLengthMatched =
      parseInt(files[files.length - 1], 10) === files.length - 1;
    if (isLengthMatched) {
      return 'array';
    }
  }
  return type;
}

function readPath(dir) {
  var dfrd;
  if (typeof dir !== 'string' || !dir.length) {
    throw new TypeError('expect a path String');
  }
  if (dir[dir.length - 1] !== path.sep) {
    return readFile(dir);
  }
  dfrd = Q.defer();
  glob('*', { cwd: dir, mark: true }, function (err, files) {
    var type, result, promises;
    if (err) {
      dfrd.reject(err);
      return;
    }
    type = detectDirType(dir, files);
    if (type === 'array') {
      promises = files.map(function (file) {
        return readPath(path.join(dir, file), file);
      });
      Q.all(promises).then(
        function (result) {
          // onSuccess
          // allow the other promise handlers to finish modifying result
          setTimeout(function () {
            dfrd.resolve(result);
          }, 0);
          // nextTick and setImmediate are better here, but break it :(
        },
        dfrd.reject
      );

    } else { // type === 'object'
      promises = [];
      result = {};
      files.forEach(function (file) {
        var promise;
        promise = readPath(path.join(dir, file), file);
        promises.push(promise);
        promise.then(function (contents) {
          var parts;
          parts = parseName(file);
          result[parts.label] = contents;
        });
      });
      Q.all(promises).then(
        function () {
          // onSuccess
          // allow the other promise handlers to finish modifying result
          setTimeout(function () {
            dfrd.resolve(result);
          }, 0);
          // nextTick and setImmediate are better here, but break it :(
        },
        dfrd.reject
      );
    }
  });
  return dfrd.promise;
}

/**
 * @param {JSONBuilder~buildCallback} callback for the build process.
 * @throws {Error} need to use {@link JSONBuilder#setSource} before calling
 */
JSONBuilder.prototype.build = function (callback) {
  var dfrd, me;
  if (!this.source) {
    throw new Error('no source');
  }
  me = this;
  dfrd = Q.defer();
  fs.exists(this.source, function (isThere) {
    var err;
    if (!isThere) {
      err = new Error('bad source path');
      callback(err);
      dfrd.reject(err);
      return;
    }
    readPath(me.source + path.sep).done(
      function (result) {
        // onSuccess
        callback(null, result);
        dfrd.resolve(result);
      },
      function (err) {
        // onError
        callback(err);
        dfrd.reject(err);
      }
    );
  });
  return dfrd.promise;
};

/**
 * @callback JSONBuilder~buildCallback
 * @param {Error} err
 * @param {Object|Array} result
 */

// exports

module.exports = JSONBuilder;
