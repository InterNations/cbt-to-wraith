'use strict';

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _map = require('babel-runtime/core-js/map');

var _map2 = _interopRequireDefault(_map);

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var sleep = function () {
    var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(ms) {
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.next = 2;
                        return timeout(ms);

                    case 2:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    return function sleep(_x) {
        return _ref.apply(this, arguments);
    };
}();

var getBrowserList = function () {
    var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
        var res;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        res = void 0;
                        _context2.prev = 1;
                        _context2.next = 4;
                        return request({ uri: apiUrl + '/browsers' });

                    case 4:
                        res = _context2.sent;

                        JSON.parse(res).forEach(function (e) {
                            console.log(e.api_name);
                            console.log('Browsers:');
                            e.browsers.forEach(function (b) {
                                return process.stdout.write(b.api_name + ' ');
                            });
                            console.log('\nResolutions:');
                            e.resolutions.forEach(function (r) {
                                return process.stdout.write(r.name + ' ');
                            });
                            console.log('\n\n---\n');
                        });
                        _context2.next = 11;
                        break;

                    case 8:
                        _context2.prev = 8;
                        _context2.t0 = _context2['catch'](1);

                        console.log(_context2.t0);

                    case 11:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this, [[1, 8]]);
    }));

    return function getBrowserList() {
        return _ref2.apply(this, arguments);
    };
}();

var takeSnapshot = function () {
    var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(pageUrl, pageName, variant, browsers, prefix_to_res, snapshots_folder) {
        var res, testId, testInfo, elapsedTime, _res, zipFileName, sectionFolder, zip, entries;

        return _regenerator2.default.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        res = void 0;
                        _context3.prev = 1;
                        _context3.next = 4;
                        return request.post({
                            uri: apiUrl + '?' + querystring.stringify({
                                url: pageUrl,
                                check_url: false,
                                browsers: browsers
                            })
                        });

                    case 4:
                        res = _context3.sent;
                        _context3.next = 11;
                        break;

                    case 7:
                        _context3.prev = 7;
                        _context3.t0 = _context3['catch'](1);

                        console.log(_context3.t0);
                        return _context3.abrupt('return');

                    case 11:
                        testId = JSON.parse(res).screenshot_test_id;


                        console.log('Taking snapshots: ' + pageName + ' on ' + variant + ' (' + testId + ')...');

                        testInfo = void 0;
                        elapsedTime = 0;

                    case 15:
                        if (!true) {
                            _context3.next = 35;
                            break;
                        }

                        _context3.next = 18;
                        return sleep(1000);

                    case 18:
                        elapsedTime++;
                        // process.stdout.write('.');

                        _res = void 0;
                        _context3.prev = 20;
                        _context3.next = 23;
                        return request({ uri: apiUrl + '/' + testId });

                    case 23:
                        _res = _context3.sent;
                        _context3.next = 30;
                        break;

                    case 26:
                        _context3.prev = 26;
                        _context3.t1 = _context3['catch'](20);

                        console.log(_context3.t1);
                        return _context3.abrupt('continue', 15);

                    case 30:

                        testInfo = JSON.parse(_res).versions[0];

                        if (testInfo.active) {
                            _context3.next = 33;
                            break;
                        }

                        return _context3.abrupt('break', 35);

                    case 33:
                        _context3.next = 15;
                        break;

                    case 35:
                        zipFileName = 'cbt_' + pageName + '_' + variant + '.zip';
                        sectionFolder = snapshots_folder + '/' + pageName;


                        console.log(elapsedTime + 's. ' + testInfo.download_results_zip_public_url + ' -> ' + zipFileName + ' -> ' + sectionFolder);

                        _context3.next = 40;
                        return download(testInfo.download_results_zip_public_url, zipFileName);

                    case 40:
                        zip = new AdmZip(zipFileName);
                        entries = zip.getEntries();


                        fs.ensureDirSync(sectionFolder);

                        entries.forEach(function (zipEntry) {
                            if (zipEntry.entryName.endsWith('_chromeless.png')) {

                                zip.extractEntryTo(zipEntry.entryName, sectionFolder);

                                fs.renameSync(sectionFolder + '/' + zipEntry.entryName, sectionFolder + '/' + zipEntry.entryName.replace(new RegExp([].concat((0, _toConsumableArray3.default)(prefix_to_res.keys())).join('|')), function (match) {
                                    return prefix_to_res.get(match) + '_' + match;
                                }).replace('_chromeless', '_' + variant));
                            }
                        });

                        // fs.removeSync('snapshots.zip');

                    case 44:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, this, [[1, 7], [20, 26]]);
    }));

    return function takeSnapshot(_x2, _x3, _x4, _x5, _x6, _x7) {
        return _ref3.apply(this, arguments);
    };
}();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var YAML = require('yamljs');
var fs = require('fs-extra');
var querystring = require('querystring');
var cbt = require('cbt_tunnels');
var r = require('request');
var request = require('request-promise');
var AdmZip = require('adm-zip');

if (!process.argv[2]) {
    console.error('No config file specified.');
    process.exit(1);
}

var config = YAML.load(process.argv[2]);

console.log('Browsers:', (0, _keys2.default)(config.test_devices).join(', '));

var apiUrl = 'https://' + config.cbt.username + ':' + config.cbt.auth_key + '@crossbrowsertesting.com/api/v3/screenshots';

function timeout(ms) {
    return new _promise2.default(function (resolve) {
        return setTimeout(resolve, ms);
    });
}

function download(uri, path) {

    return new _promise2.default(function (resolve, reject) {
        var file = fs.createWriteStream(path);
        file.on('open', function () {
            r.get(uri).on('error', function (err) {
                return reject(err);
            }).pipe(file).on('finish', function () {
                return resolve();
            });
        });
    });
}

var prefix_to_res = new _map2.default();

for (var device in config.test_devices) {
    if (config.test_devices.hasOwnProperty(device)) {
        prefix_to_res.set(config.test_devices[device].prefix, config.test_devices[device].resolution);
    }
}

cbt.start({ username: config.cbt.username, authkey: config.cbt.auth_key }, function () {
    var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(err) {
        var browsers, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, section;

        return _regenerator2.default.wrap(function _callee4$(_context4) {
            while (1) {
                switch (_context4.prev = _context4.next) {
                    case 0:
                        if (!err) {
                            _context4.next = 2;
                            break;
                        }

                        return _context4.abrupt('return', console.error(err));

                    case 2:
                        browsers = (0, _keys2.default)(config.test_devices);


                        fs.removeSync(config.directory);

                        _iteratorNormalCompletion = true;
                        _didIteratorError = false;
                        _iteratorError = undefined;
                        _context4.prev = 7;
                        _iterator = (0, _getIterator3.default)(config.paths);

                    case 9:
                        if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                            _context4.next = 18;
                            break;
                        }

                        section = _step.value;
                        _context4.next = 13;
                        return takeSnapshot(config.domains.stage + '/' + section, section, 'stage', browsers, prefix_to_res, config.directory);

                    case 13:
                        _context4.next = 15;
                        return takeSnapshot(config.domains.prod + '/' + section, section, 'prod', browsers, prefix_to_res, config.directory);

                    case 15:
                        _iteratorNormalCompletion = true;
                        _context4.next = 9;
                        break;

                    case 18:
                        _context4.next = 24;
                        break;

                    case 20:
                        _context4.prev = 20;
                        _context4.t0 = _context4['catch'](7);
                        _didIteratorError = true;
                        _iteratorError = _context4.t0;

                    case 24:
                        _context4.prev = 24;
                        _context4.prev = 25;

                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }

                    case 27:
                        _context4.prev = 27;

                        if (!_didIteratorError) {
                            _context4.next = 30;
                            break;
                        }

                        throw _iteratorError;

                    case 30:
                        return _context4.finish(27);

                    case 31:
                        return _context4.finish(24);

                    case 32:

                        // await getBrowserList();
                        cbt.stop();

                    case 33:
                    case 'end':
                        return _context4.stop();
                }
            }
        }, _callee4, undefined, [[7, 20, 24, 32], [25,, 27, 31]]);
    }));

    return function (_x8) {
        return _ref4.apply(this, arguments);
    };
}());