/*jslint es5:true, indent:2, maxlen:80, node:true*/
/*global suite, test, suiteSetup, suiteTeardown, setup, teardown*/ // Mocha
/*jslint nomen:true*/ // Node.JS global __dirname
/*jslint stupid:true*/ // Node.JS ...Sync functions, okay for testing
'use strict';

// Node.JS standard modules

var fs, path;
fs = require('graceful-fs');
path = require('path');

// 3rd-party modules

var chai, assert, sinon, temp;

chai = require('chai');
chai.use(require('sinon-chai'));
assert = require('chai').assert;
sinon = require('sinon');

temp = require('temp');

// custom modules

// promise-bound anti-callbacks

// this module

temp.track();

suite('JSONBuilder module', function () {

  test('requires without issue', function () {
    var JSONBuilder = require(path.join('..', 'lib', 'jsonbuilder'));
    assert.isFunction(JSONBuilder, 'got Function');
  });

});

suite('JSONBuilder object', function () {
  var JSONBuilder, tempDir;

  suiteSetup(function (done) {
    JSONBuilder = require(path.join('..', 'lib', 'jsonbuilder'));
    temp.mkdir('jsonbuilder', function (err, dirPath) {
      if (err) {
        throw err;
      }
      tempDir = dirPath;
      process.chdir(tempDir);
      done();
    });
  });

  test('call build() before setSource()', function () {
    assert.throws(function () {
      var jsonbuilder = new JSONBuilder();
      jsonbuilder.build();
    }, Error, 'no source');
  });

});

suite('jsonBuilder.setSource()', function () {
  var JSONBuilder, jsonBuilder;

  suiteSetup(function () {
    JSONBuilder = require(path.join('..', 'lib', 'jsonbuilder'));
    jsonBuilder = new JSONBuilder();
  });

  test('with no param', function () {
    assert.throws(function () {
      jsonBuilder.setSource();
    }, TypeError, 'not String path');
  });

  test('with null', function () {
    assert.throws(function () {
      jsonBuilder.setSource(null);
    }, TypeError, 'not String path');
  });

  test('with String', function () {
    assert.doesNotThrow(function () {
      jsonBuilder.setSource('abc');
    });
  });

});

suite('jsonBuilder.build()', function () {
  var JSONBuilder, jsonBuilder;

  suiteSetup(function () {
    JSONBuilder = require(path.join('..', 'lib', 'jsonbuilder'));
    jsonBuilder = new JSONBuilder();
  });

  test('with non-existant source path', function (done) {
    jsonBuilder.setSource(path.join(__dirname, 'path', 'to', 'nowhere'));
    jsonBuilder.build(function (err) {
      assert.instanceOf(err, Error);
      assert.equal(err.message, 'bad source path');
      done();
    });
  });

  suite('from temporary Object path', function () {
    var tempDir;

    setup(function (done) {
      temp.mkdir('jsonbuilder', function (err, dirPath) {
        if (err) {
          throw err;
        }
        tempDir = dirPath;
        process.chdir(tempDir);
        done();
      });
    });

    test('with no files', function (done) {
      jsonBuilder.setSource(tempDir);
      jsonBuilder.build(function (err, result) {
        assert.isNull(err);
        assert.isObject(result);
        assert.lengthOf(Object.keys(result), 0);
        done();
      });
    });

    test('with Null file', function (done) {
      fs.writeFileSync(path.join(tempDir, 'abc.null.txt'), 'null');
      jsonBuilder.setSource(tempDir);
      jsonBuilder.build(function (err, result) {
        assert.isNull(err);
        assert.isObject(result);
        assert.isNull(result.abc);
        done();
      });
    });

    test('with Number files', function (done) {
      fs.writeFileSync(path.join(tempDir, 'abc.number.txt'), '123');
      fs.writeFileSync(path.join(tempDir, 'def.number.txt'), '314e-2');
      jsonBuilder.setSource(tempDir);
      jsonBuilder.build(function (err, result) {
        assert.isNull(err);
        assert.isObject(result);
        assert.lengthOf(Object.keys(result), 2);
        assert.equal(result.abc, 123);
        assert.equal(result.def, 3.14);
        done();
      });
    });

    test('with Boolean file', function (done) {
      fs.writeFileSync(path.join(tempDir, 'abc.boolean.txt'), 'true');
      jsonBuilder.setSource(tempDir);
      jsonBuilder.build(function (err, result) {
        assert.isNull(err);
        assert.isObject(result);
        assert.isTrue(result.abc);
        done();
      });
    });

    test('with String file', function (done) {
      fs.writeFileSync(path.join(tempDir, 'abc.string.txt'), 'def');
      jsonBuilder.setSource(tempDir);
      jsonBuilder.build(function (err, result) {
        assert.isNull(err);
        assert.isObject(result);
        assert.equal(result.abc, 'def');
        done();
      });
    });

    test('with Null file in a nested Array directory', function (done) {
      fs.mkdirSync(path.join(tempDir, 'abc.array'));
      fs.writeFileSync(path.join(tempDir, 'abc.array', '0.null.txt'), 'null');
      jsonBuilder.setSource(tempDir);
      jsonBuilder.build(function (err, result) {
        assert.isNull(err);
        assert.isObject(result, '1st');
        assert.lengthOf(Object.keys(result), 1, '1st');
        assert.isArray(result.abc, '2nd');
        assert.lengthOf(result.abc, 1, '2nd');
        assert.equal(result.abc[0], null);
        done();
      });
    });

    test('with Null file in a 3-level Object directory', function (done) {
      fs.mkdirSync(path.join(tempDir, 'abc'));
      fs.mkdirSync(path.join(tempDir, 'abc', 'def'));
      fs.writeFileSync(path.join(tempDir, 'abc', 'def', 'g.null.txt'), 'null');
      jsonBuilder.setSource(tempDir);
      jsonBuilder.build(function (err, result) {
        assert.isNull(err);
        assert.isObject(result, '1st');
        assert.lengthOf(Object.keys(result), 1, '1st');
        assert.isObject(result.abc, '2nd');
        assert.lengthOf(Object.keys(result.abc), 1, '2nd');
        assert.isObject(result.abc.def, '3rd');
        assert.lengthOf(Object.keys(result.abc.def), 1, '3rd');
        assert.equal(result.abc.def.g, null);
        done();
      });
    });

  });

  suite('from temporary Array path', function () {
    var tempDir;

    setup(function (done) {
      temp.mkdir({
        prefix: 'jsonbuilder',
        suffix: '.array'
      }, function (err, dirPath) {
        if (err) {
          throw err;
        }
        tempDir = dirPath;
        process.chdir(tempDir);
        done();
      });
    });

    test('with no files', function (done) {
      jsonBuilder.setSource(tempDir);
      jsonBuilder.build(function (err, result) {
        assert.isNull(err);
        assert.isArray(result);
        assert.lengthOf(result, 0);
        done();
      });
    });

    test('with Null file', function (done) {
      fs.writeFileSync(path.join(tempDir, '0.null.txt'), 'null');
      jsonBuilder.setSource(tempDir);
      jsonBuilder.build(function (err, result) {
        assert.isNull(err);
        assert.isArray(result);
        assert.lengthOf(result, 1);
        assert.isNull(result[0]);
        done();
      });
    });

    test('with Number files', function (done) {
      fs.writeFileSync(path.join(tempDir, '0.number.txt'), '123');
      fs.writeFileSync(path.join(tempDir, '1.number.txt'), '314e-2');
      jsonBuilder.setSource(tempDir);
      jsonBuilder.build(function (err, result) {
        assert.isNull(err);
        assert.isArray(result);
        assert.lengthOf(result, 2);
        assert.equal(result[0], 123);
        assert.equal(result[1], 3.14);
        done();
      });
    });

    test('with Boolean file', function (done) {
      fs.writeFileSync(path.join(tempDir, '0.boolean.txt'), 'true');
      jsonBuilder.setSource(tempDir);
      jsonBuilder.build(function (err, result) {
        assert.isNull(err);
        assert.isArray(result);
        assert.lengthOf(result, 1);
        assert.isTrue(result[0]);
        done();
      });
    });

    test('with String file', function (done) {
      fs.writeFileSync(path.join(tempDir, '0.string.txt'), 'def');
      jsonBuilder.setSource(tempDir);
      jsonBuilder.build(function (err, result) {
        assert.isNull(err);
        assert.isArray(result);
        assert.lengthOf(result, 1);
        assert.equal(result[0], 'def');
        done();
      });
    });

    test('with Null file in a 3-level Array directory', function (done) {
      fs.mkdirSync(path.join(tempDir, '0.array'));
      fs.mkdirSync(path.join(tempDir, '0.array', '0.array'));
      fs.writeFileSync(
        path.join(tempDir, '0.array', '0.array', '0.null.txt'),
        'null'
      );
      jsonBuilder.setSource(tempDir);
      jsonBuilder.build(function (err, result) {
        assert.isNull(err);
        assert.isArray(result, '1st');
        assert.lengthOf(result, 1, '1st');
        assert.isArray(result[0], '2nd');
        assert.lengthOf(result[0], 1, '2nd');
        assert.isArray(result[0][0], '3rd');
        assert.lengthOf(result[0][0], 1, '3rd');
        assert.equal(result[0][0][0], null);
        done();
      });
    });

  });

});

