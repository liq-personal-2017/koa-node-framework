'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.addMiddlewares = undefined;
exports.default = install;

var _lodash = require('lodash');

var _csurf = require('./csurf');

var _csurf2 = _interopRequireDefault(_csurf);

var _singleSignOn = require('./single-sign-on');

var _singleSignOn2 = _interopRequireDefault(_singleSignOn);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import koaProxy from './proxy'
let middlewares = [];
middlewares.push(_csurf2.default);
middlewares.push(_singleSignOn2.default);
// middlewares.push(koaProxy)

const addMiddlewares = exports.addMiddlewares = (...mws) => middlewares.push(...mws);

/**
 * @param {object} app
 *
 * @author liqiang9521@foxmail.com
 */
function install(app) {
    let logger = app.getLogger();
    middlewares.forEach(mw => {
        let name = mw.middlewareName;
        if ((0, _lodash.isObject)(mw) && (0, _lodash.isFunction)(mw.install)) {
            let conf = app.getMiddlewareConf(name);
            if (conf === false) {
                logger.info(`Disable middleware [${name}] with conf 'false'`);
            } else {
                logger.info(`Enable middleware [${name}]`);
                mw.install(app, conf);
            }
        } else {
            logger.warn(`can't install middleware [${mw.name ? mw.name : mw}]`);
        }
    });
}