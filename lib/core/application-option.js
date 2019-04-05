'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const defaultUnSafeHttpMethods = ['trace', 'track', 'options'];
/**
 * 应用配置
 *
 * @author liqiang9521@foxmail.com
 */
let ApplicationOption = class ApplicationOption {
    /**
     * @param {{baseDir:string,webContextPath:string,staticPath:string,staticPrefix:string,unSafeMethods:Array<string>,keys:Array<string>,configPath:string}} options
     * @author liqiang9521@foxmail.com
     */
    constructor({ baseDir, webContextPath = '/', unSafeMethods = defaultUnSafeHttpMethods, staticPath = '', staticPrefix = '/', keys, configPath }) {
        (0, _assert2.default)(baseDir, 'You must provide option [baseDir] for application ');
        (0, _assert2.default)(keys, 'You must provide option [keys] for application ');
        (0, _assert2.default)(unSafeMethods.every(method => defaultUnSafeHttpMethods.includes(method)), `unSafe http method must be one of [${defaultUnSafeHttpMethods}]`);
        this.baseDir = baseDir;
        this.webContextPath = webContextPath;
        this.staticPath = staticPath;
        this.staticPrefix = staticPrefix || '/';
        this.unSafeMethods = unSafeMethods;
        this.keys = keys;
        this.configPath = configPath || this.baseDir;
    }
};
exports.default = ApplicationOption;