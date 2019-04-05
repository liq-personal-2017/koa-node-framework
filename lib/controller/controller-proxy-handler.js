'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _baseCtxProxyHandler = require('../core/base-ctx-proxy-handler');

var _baseCtxProxyHandler2 = _interopRequireDefault(_baseCtxProxyHandler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * 代理 处理函数
 *
 * @author liqiang9521@foxmail.com
 */
let ControllerProxyHandler = class ControllerProxyHandler extends _baseCtxProxyHandler2.default {
  /**
   * @param {Set<Function>} clazzSet
   *
   * @author liqiang9521@foxmail.com
   */
  constructor(clazzSet) {
    super(clazzSet);
    this.controllers = null;
    this.services = null;
    this.app = null;
    this.ctx = null;
  }
};
exports.default = ControllerProxyHandler;