'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.connectLogger = exports.getLogger = undefined;

var _log = require('./log');

Object.keys(_log).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _log[key];
    }
  });
});

var _log2 = _interopRequireDefault(_log);

var _connectLogger = require('./connect-logger');

var _connectLogger2 = _interopRequireDefault(_connectLogger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.getLogger = _log2.default;
exports.connectLogger = _connectLogger2.default;