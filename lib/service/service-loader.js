'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _application = require('./../core/application');

var _application2 = _interopRequireDefault(_application);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * 服务加载器
 *
 * @author liqiang9521@foxmail.com
 */
let ServiceLoader = class ServiceLoader {
    /**
     * @param {{app:Application,baseDir:string}} opt
     *
     * @author liqiang9521@foxmail.com
     */
    constructor(opt = {}) {
        let { baseDir, app } = opt;
        this.baseDir = baseDir;
        this.app = app;
        this._app = app;
        this.clazzSet = new Set();
        this.init();
    }
    /**
     * 全路径
     * @param {string} p
     * @return {string}
     * @author liqiang9521@foxmail.com
     */
    resovle(p) {
        return _path2.default.join(this.baseDir, 'services', p);
    }
    /**
     * 初始化
     *
     * @author liqiang9521@foxmail.com
     */
    init() {
        if (_fs2.default.existsSync(this.resovle(''))) {
            const files = _fs2.default.readdirSync(this.resovle('')).map(file => this.resovle(file));
            for (const file of files) {
                if (_fs2.default.statSync(file).isFile()) {
                    this.clazzSet.add(require(file).default);
                }
            }
        }
    }
};
exports.default = ServiceLoader;