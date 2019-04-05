'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _koaRouter = require('koa-router');

var _koaRouter2 = _interopRequireDefault(_koaRouter);

var _serve = require('../decorators/serve');

var _controllerProxyHandler = require('./controller-proxy-handler');

var _controllerProxyHandler2 = _interopRequireDefault(_controllerProxyHandler);

var _serviceProxyHandler = require('../service/service-proxy-handler');

var _serviceProxyHandler2 = _interopRequireDefault(_serviceProxyHandler);

var _util = require('./util');

var _application = require('../core/application');

var _application2 = _interopRequireDefault(_application);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * 加载器
 *  从根路径扫描所有的controller
 *
 * @author liqiang9521@foxmail.com
 */
/**
 * 导出
 *  controllerLoader 加载器
 *
 * @author liqiang9521@foxmail.com
 */
let ControllerLoader = class ControllerLoader {
    /**
     * @param {{app:Application,baseDir:string}} options
     *
     * @author liqiang9521@foxmail.com
     */
    constructor(options = {}) {
        let { app, baseDir } = options;
        this._app = app; // 暂时没什么用
        this.app = app;
        this.baseDir = baseDir;
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
        return _path2.default.join(this.baseDir, 'controllers', p);
    }
    /**
     * 初始化工作，同步执行，不等待了
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
    /**
     * 创建一个处理函数
     * @param {Class} Clazz
     * @param {string} methodname
     * @return {function}
     * @author liqiang9521@foxmail.com
     */
    createHandler(Clazz, methodname) {
        const method = Clazz.prototype[methodname];
        const argNames = (0, _util.getArgs)(method);
        const app = this.app;
        return (ctx, next) => {
            const cph = new _controllerProxyHandler2.default(this.app.controllerSet);

            const sph = new _serviceProxyHandler2.default(this.app.serviceSet);

            // let lph = new LogicProxyHandler(this.app.logicSet)

            const controllers = new Proxy(Object.create(null), cph);
            const services = new Proxy(Object.create(null), sph);

            cph.app = app;
            cph.controllers = controllers;
            cph.services = services;
            cph.ctx = ctx;

            sph.app = app;
            // sph.controllers = controllers
            sph.services = services;
            sph.ctx = ctx;

            // let logics = Object.create(null)
            const instance = Reflect.construct(Clazz, [{ ctx, app, controllers, services }]);
            Reflect.set(controllers, Clazz.name, instance);
            instance.next = next;
            const config = app.getAppConfig('controller');
            const args = (0, _util.getArgsFromCtx)(ctx, argNames, config);
            return method.call(instance, ...args);
        };
    }
    /**
     * 将 controller 类转换成对应的路由
     * @return {{router:KoaRouter}}
     *
     * @author liqiang9521@foxmail.com
     */
    loadControllers() {
        let clazzRouter = new _koaRouter2.default();
        for (let Clazz of this.clazzSet.values()) {
            let { mapping, methodsMapping } = (0, _serve.getClazzMapping)(Clazz);
            let methodRouter = new _koaRouter2.default();
            for (let [methodname, mapping] of methodsMapping.entries()) {
                let handler = this.createHandler(Clazz, methodname);
                let { method: methods, url } = mapping;
                for (let method of methods) {
                    methodRouter[method](url, handler);
                }
            }
            clazzRouter.use(mapping, methodRouter.routes()).use(mapping, methodRouter.allowedMethods());
        }
        // this.use(clazzRouter.routes()).use(clazzRouter.allowedMethods())
        return { router: clazzRouter };
    }
};
exports.default = ControllerLoader;