/*jslint es5:true, indent:2, maxlen:80, node:true*/
/*global suite, test, suiteSetup, suiteTeardown, setup, teardown*/ // Mocha
/*jslint nomen:true*/ // Node.JS global __dirname
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

suite('FSBuilder module', function () {

  test('requires without issue', function () {
    var FSBuilder = require(path.join('..', 'lib', 'fsbuilder'));
    assert.isFunction(FSBuilder, 'got Function');
  });

});

suite('FSBuilder object', function () {
  var FSBuilder, tempDir;

  suiteSetup(function (done) {
    FSBuilder = require(path.join('..', 'lib', 'fsbuilder'));
    temp.mkdir('fsbuilder', function (err, dirPath) {
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
      var fsBuilder = new FSBuilder();
      fsBuilder.setOutput('path/to/output');
      fsBuilder.build();
    }, Error, 'no source');
  });

  test('call build() before setOutput()', function () {
    assert.throws(function () {
      var fsb = new FSBuilder();
      fsb.setSource({});
      fsb.build();
    }, Error, 'no output');
  });

//  test('', function () {
//  });

});

suite('fsBuilder.setSource()', function () {
  var FSBuilder, fsBuilder;

  suiteSetup(function () {
    FSBuilder = require(path.join('..', 'lib', 'fsbuilder'));
    fsBuilder = new FSBuilder();
  });

  test('setSource() with no param', function () {
    assert.throws(function () {
      fsBuilder.setSource();
    }, Error, 'not Array or Object');
  });

  test('setSource() with null', function () {
    assert.throws(function () {
      fsBuilder.setSource(null);
    }, Error, 'not Array or Object');
  });

  test('setSource() with Boolean', function () {
    assert.throws(function () {
      fsBuilder.setSource(true);
    }, Error, 'not Array or Object');
  });

  test('setSource() with Number', function () {
    assert.throws(function () {
      fsBuilder.setSource(123);
    }, Error, 'not Array or Object');
  });

  test('setSource() with String', function () {
    assert.throws(function () {
      fsBuilder.setSource('abc');
    }, Error, 'not Array or Object');
  });

  test('setSource() with Function', function () {
    assert.throws(function () {
      fsBuilder.setSource(fsBuilder.setSource);
    }, Error, 'not Array or Object');
  });

  test('setSource() with Array', function () {
    assert.doesNotThrow(function () {
      fsBuilder.setSource([]);
    });
  });

  test('setSource() with Object', function () {
    assert.doesNotThrow(function () {
      fsBuilder.setSource({});
    });
  });

});

suite('fsBuilder.setOutput()', function () {
  var FSBuilder, fsBuilder;

  suiteSetup(function () {
    FSBuilder = require(path.join('..', 'lib', 'fsbuilder'));
    fsBuilder = new FSBuilder();
  });

  test('setOutput() with no param', function () {
    assert.throws(function () {
      fsBuilder.setOutput();
    }, TypeError, 'not String path');
  });

  test('setOutput() with String', function () {
    assert.doesNotThrow(function () {
      fsBuilder.setOutput('abc');
    });
  });

});

suite('fsBuilder.build()', function () {
  var FSBuilder, fsBuilder;

  suiteSetup(function () {
    FSBuilder = require(path.join('..', 'lib', 'fsbuilder'));
    fsBuilder = new FSBuilder();
  });

  test('with non-existant output path', function (done) {
    fsBuilder.setSource({});
    fsBuilder.setOutput(path.join(__dirname, 'path', 'to', 'nowhere'));
    fsBuilder.build(function (err) {
      assert.instanceOf(err, Error);
      assert.equal(err.message, 'bad output path');
      done();
    });
  });


  suite('to temporary output path', function () {
    var tempDir;

    setup(function (done) {
      temp.mkdir('fsbuilder', function (err, dirPath) {
        if (err) {
          throw err;
        }
        tempDir = dirPath;
        process.chdir(tempDir);
        done();
      });
    });

    test('with empty Object', function (done) {
      fsBuilder.setSource({});
      fsBuilder.setOutput(tempDir);
      fsBuilder.build(function (err) {
        assert.isNull(err);
        fs.readdir(tempDir, function (err, files) {
          assert.isNull(err);
          assert.isArray(files);
          assert.lengthOf(files, 0);
          done();
        });
      });
    });

    test('with empty Array', function (done) {
      fsBuilder.setSource([]);
      fsBuilder.setOutput(tempDir);
      fsBuilder.build(function (err) {
        assert.isNull(err);
        fs.readdir(tempDir, function (err, files) {
          assert.isNull(err);
          assert.isArray(files);
          assert.lengthOf(files, 0);
          done();
        });
      });
    });

    test('with Object with basic values', function (done) {
      fsBuilder.setSource({
        abc: null,
        def: false,
        ghi: 123,
        jkl: 'mno'
      });
      fsBuilder.setOutput(tempDir);
      fsBuilder.build(function (err) {
        assert.isNull(err);
        fs.readdir(tempDir, function (err, files) {
          assert.isNull(err);
          assert.isArray(files);
          assert.lengthOf(files, 4);
          assert.equal(files[0], 'abc.null.txt');
          fs.readFile(path.join(tempDir, files[0]), {
            encoding: 'utf8'
          }, function (err, data) {
            assert.isNull(err);
            assert.isString(data);
            assert.equal(data, 'null');
            assert.equal(files[1], 'def.boolean.txt');
            fs.readFile(path.join(tempDir, files[1]), {
              encoding: 'utf8'
            }, function (err, data) {
              assert.isNull(err);
              assert.isString(data);
              assert.equal(data, 'false');
              assert.equal(files[2], 'ghi.number.txt');
              fs.readFile(path.join(tempDir, files[2]), {
                encoding: 'utf8'
              }, function (err, data) {
                assert.isNull(err);
                assert.isString(data);
                assert.equal(data, '123');
                assert.equal(files[3], 'jkl.string.txt');
                fs.readFile(path.join(tempDir, files[3]), {
                  encoding: 'utf8'
                }, function (err, data) {
                  assert.isNull(err);
                  assert.isString(data);
                  assert.equal(data, 'mno');
                  done();
                });
              });
            });
          });
        });
      });
    });

    test('with Array with basic values', function (done) {
      fsBuilder.setSource([
        null,
        false,
        123,
        'mno'
      ]);
      fsBuilder.setOutput(tempDir);
      fsBuilder.build(function (err) {
        assert.isNull(err);
        fs.readdir(tempDir, function (err, files) {
          assert.isNull(err);
          assert.isArray(files);
          assert.lengthOf(files, 4);
          assert.equal(files[0], '0.null.txt');
          fs.readFile(path.join(tempDir, files[0]), {
            encoding: 'utf8'
          }, function (err, data) {
            assert.isNull(err);
            assert.isString(data);
            assert.equal(data, 'null');
            assert.equal(files[1], '1.boolean.txt');
            fs.readFile(path.join(tempDir, files[1]), {
              encoding: 'utf8'
            }, function (err, data) {
              assert.isNull(err);
              assert.isString(data);
              assert.equal(data, 'false');
              assert.equal(files[2], '2.number.txt');
              fs.readFile(path.join(tempDir, files[2]), {
                encoding: 'utf8'
              }, function (err, data) {
                assert.isNull(err);
                assert.isString(data);
                assert.equal(data, '123');
                assert.equal(files[3], '3.string.txt');
                fs.readFile(path.join(tempDir, files[3]), {
                  encoding: 'utf8'
                }, function (err, data) {
                  assert.isNull(err);
                  assert.isString(data);
                  assert.equal(data, 'mno');
                  done();
                });
              });
            });
          });
        });
      });
    });

    test('with Object with nested Array', function (done) {
      fsBuilder.setSource({
        abc: [
          'def'
        ]
      });
      fsBuilder.setOutput(tempDir);
      fsBuilder.build(function (err) {
        assert.isNull(err);
        fs.readdir(tempDir, function (err, files) {
          assert.isNull(err);
          assert.isArray(files);
          assert.lengthOf(files, 1);
          assert.equal(files[0], 'abc.array');
          fs.readdir(path.join(tempDir, files[0]), function (err, innerFiles) {
            assert.isNull(err);
            assert.isArray(innerFiles);
            assert.lengthOf(innerFiles, 1);
            assert.equal(innerFiles[0], '0.string.txt');
            fs.readFile(path.join(tempDir, files[0], innerFiles[0]), {
              encoding: 'utf8'
            }, function (err, data) {
              assert.isNull(err);
              assert.isString(data);
              assert.equal(data, 'def');
              done();
            });
          });
        });
      });
    });

    test('with Array with nested Object', function (done) {
      fsBuilder.setSource([
        { abc: 'def' }
      ]);
      fsBuilder.setOutput(tempDir);
      fsBuilder.build(function (err) {
        assert.isNull(err);
        fs.readdir(tempDir, function (err, files) {
          assert.isNull(err);
          assert.isArray(files);
          assert.lengthOf(files, 1);
          assert.equal(files[0], '0.object');
          fs.readdir(path.join(tempDir, files[0]), function (err, innerFiles) {
            assert.isNull(err);
            assert.isArray(innerFiles);
            assert.lengthOf(innerFiles, 1);
            assert.equal(innerFiles[0], 'abc.string.txt');
            fs.readFile(path.join(tempDir, files[0], innerFiles[0]), {
              encoding: 'utf8'
            }, function (err, data) {
              assert.isNull(err);
              assert.isString(data);
              assert.equal(data, 'def');
              done();
            });
          });
        });
      });
    });


  });

});

