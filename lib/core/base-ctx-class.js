'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _koa = require('koa');

var _koa2 = _interopRequireDefault(_koa);

var _application = require('./application');

var _application2 = _interopRequireDefault(_application);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 *  service controller logic 的基类， 每个请求进来之后，都会在对应的ctx上设置app
 *  依次下去的controller就可以通过ctx上的app获取到对应的其他属性了
 *  这些属性只读， 设置时报错，暂时未填入报错信息
 *
 * @author liqiang9521@foxmail.com
 */
let BaseCtxClass = class BaseCtxClass {
  /**
   * 初始化
   * @param {{ctx:Koa.Context,app:Application}} a
   * @author liqiang9521@foxmail.com
   */
  constructor({ ctx, app, controllers, services, logics } = {}) {
    this.ctx = ctx;
    this.app = app;
    this.controllers = controllers;
    this.services = services;
    this.logics = logics;
  }
};
exports.default = BaseCtxClass;