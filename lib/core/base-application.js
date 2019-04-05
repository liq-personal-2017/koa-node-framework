'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _koa = require('koa');

var _koa2 = _interopRequireDefault(_koa);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _controllerLoader = require('../controller/controller-loader');

var _controllerLoader2 = _interopRequireDefault(_controllerLoader);

var _log = require('../log');

var _lodash = require('lodash');

var _serviceLoader = require('../service/service-loader');

var _serviceLoader2 = _interopRequireDefault(_serviceLoader);

var _koaRouter = require('koa-router');

var _koaRouter2 = _interopRequireDefault(_koaRouter);

var _applicationOption = require('./application-option');

var _applicationOption2 = _interopRequireDefault(_applicationOption);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _context = require('../util/context');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * 基类
 *
 * @author liqiang9521@foxmail.com
 */
let BaseApplication = class BaseApplication extends _koa2.default {
    /**
     * @param {ApplicationOption} options
     * @author liqiang9521@foxmail.com
     */
    constructor(options = {}) {
        super(options);
        this.options = new _applicationOption2.default(options);
        this.unSafeHttpMethods = this.options.unSafeMethods;
        this.baseDir = this.options.baseDir;
        this.webContextPath = this.options.webContextPath;
        this.contextRouter = new _koaRouter2.default();
        this.logger = null;
        // this.controllers = Object.create(null)
        this.controllerLoader = new _controllerLoader2.default({
            baseDir: this.baseDir,
            app: this
        });
        this.serviceLoader = new _serviceLoader2.default({
            baseDir: this.baseDir,
            app: this
        });
        this.controllerSet = this.controllerLoader.clazzSet;

        this.serviceSet = this.serviceLoader.clazzSet;
        this.configPath = this.options.configPath;
        this.config = this.parseConfig(require(_path2.default.join(this.configPath, 'config')).default);

        // 配合 cas 读取 sessionStore 用的
        Object.defineProperties(this.context, {
            sessionStore: {
                get() {
                    if (this.session) {
                        return this.session._sessCtx.store; // 这东西是在源码里头抠出来的
                    }
                    throw new Error('Access sessionStore must use session first');
                }
            }
        });
    }
    /**
     * @param {*} config
     * @return {*}
     * @author liqiang9521@foxmail.com
     */
    parseConfig(config) {
        const configObj = Object.assign({}, config);
        const { app, middlewares, plugins } = configObj;
        const { controller } = app;
        if (controller) {
            controller.deepIn == controller.deepIn || [];
            controller.handlers == controller.handlers || [];
        } else {
            app.controller = {
                deepIn: [],
                handlers: []
            };
        }
        return configObj;
    }
    /**
     * @param {string} name
     * @return {any}
     * @author liqiang9521@foxmail.com
     */
    getAppConfig(name) {
        return this.config.app[name];
    }
    /**
     * @param {KoaRouter} router
     *
     * @author liqiang9521@foxmail.com
     */
    useContext(router) {
        if (router instanceof _koaRouter2.default) {
            if (this.webContextPath && this.webContextPath != '/') {
                this.contextRouter.use(this.webContextPath, router.routes(), router.allowedMethods());
            } else {
                this.contextRouter.use(router.routes(), router.allowedMethods());
            }
        } else if ((0, _lodash.isFunction)(router)) {
            if (this.webContextPath && this.webContextPath != '/') {
                this.contextRouter.use(this.webContextPath, router);
            } else {
                this.use(router);
            }
        } else {
            throw new Error(`Unkown type of router ${router}`);
        }
    }

    /**
     * 关闭一些不安全的http method
     *  trace track options
     * @author liqiang9521@foxmail.com
     */
    closeUnSafeHttpMethods() {
        this.use(async (ctx, next) => {
            if (this.unSafeHttpMethods.includes(ctx.method.toLowerCase())) {
                this.getLogger().warn(`unSafe method call from ${(0, _context.getRemoteAddressFromContext)(ctx)}`);
                ctx.status = 405;
                ctx.body = `Unsupport method [${ctx.method}]`;
            } else {
                await next();
            }
        });
    }

    /**
     * 加载controller
     *
     * @author liqiang9521@foxmail.com
     */
    loadControllers() {
        // let map = getClazzMapping()
        const { router } = this.controllerLoader.loadControllers();
        this.useContext(router);
    }

    /**
     * 创建日志记录器
     * 根据配置创建对应的logger， 默认会创建一个 app logger 和一个 http logger 以供app使用，如果没有配置，则按照默认配置创建
     * TODO: 默认创建内部使用的几个日志记录器 : app, http, cas, consul； 允许覆盖配置； 后续考虑将这里默认的几个配置移到框架配置处
     * @author liqiang9521@foxmail.com
     */
    createLoggers() {
        let logConfig = this.config.app.log;
        let defaultLevel = logConfig.level || 'warn';
        let defaultPrint2Console = logConfig.print2console || false;
        let defaultForceCreate = logConfig.forceCreate || false;
        let confs = [];
        let loggerNames = ['app', 'http'];
        for (let [logname, conf] of (0, _lodash.toPairs)(logConfig)) {
            if (!['level', 'print2Console', 'filenames', 'forceCreate'].includes(logname)) {
                let { filenames = logname + '.log', level = defaultLevel, print2Console = defaultPrint2Console, forceCreate = defaultForceCreate } = conf;
                confs.push({
                    filenames,
                    name: logname,
                    level,
                    print2Console,
                    forceCreate
                });
                let index = loggerNames.indexOf(logname);
                if (index > -1) {
                    loggerNames.splice(index, 1);
                }
            }
        }
        loggerNames.forEach(loggerName => {
            let conf = {
                name: loggerName,
                filenames: `${loggerName}.log`,
                level: 'warn',
                print2Console: true
            };
            console.log(_chalk2.default.green(`created default logger ${loggerName} with config ${JSON.stringify(conf)}`));
            confs.push(conf);
        });

        (0, _log.createLoggers)(confs);
    }
    /**
     * 获取日志记录器
     * @param {string} name
     * @return {Logger}
     * @author liqiang9521@foxmail.com
     */
    getLogger(name) {
        if (!name) {
            return this.logger;
        }
        return (0, _log.getLogger)(name);
    }
    /**
     * 抛异常， 这里暂时 先抛出去
     *  TODO: 后续需要做统一的异常处理，不再把异常抛到主线程上
     * @param {Error} err
     *
     * @author liqiang9521@foxmail.com
     */
    rethrow(err) {
        throw err;
    }
}; /**
    * App 基类， 提供功能和部分资源加载工作， 但是不进行初始化， 仅提供功能函数
    *
    * @author liqiang9521@foxmail.com
    */

exports.default = BaseApplication;