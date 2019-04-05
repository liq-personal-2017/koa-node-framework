'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.createLogger = exports.createLoggers = exports.Logger = undefined;

var _log4js = require('log4js');

var _log4js2 = _interopRequireDefault(_log4js);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _util = require('../util');

var _lodash = require('lodash');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import { date } from 'is-type-of'
// import { createLoggers } from './log';
// const _ = require('../../modules/core/Util')

const DEFAULT_LOG_LEVEL = 'warn';
const DEFAULT_COMPRESS_LOG = true;
const DEFAULT_LOG_APPENDERS = ['console'];
const DEFAULT_LOG_BACKUPS = 5;
const DEFAULT_LOG_FILESIZE = 10 * 1024 * 1024;

const logRootPath = _path2.default.join(process.cwd(), 'log');

const FILESIZE_UNITS = 'bkmg';
/**
 * 将自定义的配置项转换成log4js的文件配置项
 *
 * @author liqiang9521@foxmail.com
 */
let FileAppender = class FileAppender {
    /**
     * @param {string} name
     * @param {*} appender
     *
     * @author liqiang9521@foxmail.com
     */
    constructor(name, appender) {
        this._appender = appender;
        this._name = name;
        this.type = 'file';
        this.numBackups = isNaN(appender.backupFilesCount) ? DEFAULT_LOG_BACKUPS : appender.backupFilesCount;
        this.filename = null;
        this.maxLogSize = null;
        this.compress = !!(0, _util.decode)(appender.compress, undefined, DEFAULT_COMPRESS_LOG);
        this.getFullFilename();
        this.processLogSize();
    }
    /**
     * 获取日志文件路径
     *
     * @author liqiang9521@foxmail.com
     */
    getFullFilename() {
        let { filename } = this._appender;
        this.filename = _path2.default.join(logRootPath, filename);
    }
    /**
     * 处理日志文件的大小
     *
     * @author liqiang9521@foxmail.com
     */
    processLogSize() {
        let { singleFileSize = DEFAULT_LOG_FILESIZE } = this._appender;
        let size = singleFileSize; // 文件大小
        if (isNaN(size)) {
            // 允许不配置单位，不配置单位则认为原始数据，直接交给log4js处理（单位是kb）
            let unit = (0, _lodash.last)(size).toLowerCase();
            size = parseInt(size.replace(unit, ''));
            if (FILESIZE_UNITS.includes(unit)) {
                let index = FILESIZE_UNITS.indexOf(unit);
                (0, _lodash.times)(index, function () {
                    size *= 1024;
                });
                this.maxLogSize = size;
            } else {
                throw new Error(`日志配置文件单位错误,单位可选值为${FILESIZE_UNITS.toUpperCase()}`);
            }
        } else {
            this.maxLogSize = Number(size);
        }
    }
    /**
     * 方便作为log4js的参数用的
     * @return {*}
     * @author liqiang9521@foxmail.com
     */
    toJSON() {
        let { type, numBackups, filename, maxLogSize } = this;
        return { type, numBackups, filename, maxLogSize };
    }
};
/**
 * 将自定义的Category配置转换成log4js的配置
 *
 * @author liqiang9521@foxmail.com
 */

let Category = class Category {
    /**
     * @param {string} name
     * @author liqiang9521@foxmail.com
     */
    constructor(name, { appenders = DEFAULT_LOG_APPENDERS, level = DEFAULT_LOG_LEVEL } = {}) {
        this._name = name;
        this.appenders = appenders;
        this.level = level;
    }
    /**
     * 方便作为log4js的参数用的
     * @return {*}
     * @author liqiang9521@foxmail.com
     */
    toJSON() {
        let { appenders, level } = this;
        return { appenders, level };
    }
};
/**
 * 控制台日志输出
 *
 * @author liqiang9521@foxmail.com
 */

let ConsoleAppender = class ConsoleAppender {
    /**
     * @param {string} name
     *
     * @author liqiang9521@foxmail.com
     */
    constructor(name) {
        this._name = name;
        this.type = 'console';
    }
    /**
     * 方便作为log4js的参数用的
     * @return {*}
     * @author liqiang9521@foxmail.com
     */
    toJSON() {
        return {
            type: this.type
        };
    }
};
/**
 * 给log4js的配置
 *  因为有些配置是不允许外部配置的，所以在这里面直接进行了对log4js的配置功能，每次发生变化都会自动配置
 *
 * @author liqiang9521@foxmail.com
 */

let Log4jsConfig = class Log4jsConfig {
    /**
     *
     *
     * @author liqiang9521@foxmail.com
     */
    constructor({ appenders: apps = [], categories: cats } = {}) {
        this.appenders = {};
        this.categories = {};
        this.appNames = new Set();
        this.catNames = new Set();

        this.appenders['console'] = new ConsoleAppender();
        this.appNames.add('console');
        this.categories['default'] = new Category('default', { appenders: DEFAULT_LOG_APPENDERS, level: 'all' });

        this.makeAppenders(apps);
        this.makeCategories(cats);
        this.configure();
    }
    /**
     * 添加配置
     *  添加配置之后会自动重新配置log4js
     * @author liqiang9521@foxmail.com
     */
    addConfig({ appenders: apps, categories: cats }) {
        this.makeAppenders(apps);
        this.makeCategories(cats);
        this.configure();
    }
    /**
     * 配置log4js
     *
     * @author liqiang9521@foxmail.com
     */
    configure() {
        _log4js2.default.configure(this);
    }
    /**
     * 创建appender
     * @param {Array} apps
     * @author liqiang9521@foxmail.com
     */
    makeAppenders(apps) {
        if (apps) {
            let appenders = this.appenders;
            let appNames = this.appNames;
            for (let [name, app] of (0, _lodash.toPairs)(apps)) {
                if (appNames.has(name)) {
                    logger.warn(`appender [${name}] is already exists;`);
                }
                if (app.type == 'file') {
                    appenders[name] = new FileAppender(name, app);
                } else if (app.type == 'console') {
                    appenders[name] = new ConsoleAppender(name, app);
                }
                appNames.add(name);
            }
        }
    }
    /**
     * 创建category
     * @param {Array} cats
     *
     * @author liqiang9521@foxmail.com
     */
    makeCategories(cats) {
        if (cats) {
            let appNames = this.appNames;
            let categories = this.categories;
            let catNames = this.catNames;
            for (let [name, cat] of (0, _lodash.toPairs)(cats)) {
                // 不允许修改默认的日志记录器
                if (name == 'default') {
                    throw new Error('[default] logger can\'t be changed, you shoundn\'t pass category with name [\'default\'] ');
                }
                // 不允许修改已存在的日志记录器
                if (catNames.has(name)) {
                    throw new Error(`category ${name} is exists,can't change it`);
                }
                if (cat.appenders.every(appender => appNames.has(appender))) {
                    categories[name] = new Category(name, cat);
                    catNames.add(name);
                } else {
                    throw new Error('every category appender must be defined in appenders');
                }
            }
        }
    }
};
/**
 * logger
 *
 * @author liqiang9521@foxmail.com
 */

let Logger = class Logger {
    /**
     * @param {Logger} logger
     *
     * @author liqiang9521@foxmail.com
     */
    constructor(logger) {
        if ((0, _lodash.isString)(logger)) {
            logger = _log4js2.default.getLogger(logger);
        }
        this._logger = logger;
        if (!this._logger) {
            throw new Error('Every logger needs a log4js logger;');
        }
    }
    /**
     * log
     */
    log(...args) {
        this._logger.log(...args);
    }
    /**
     * debug
     */
    debug(...args) {
        this._logger.debug(...args);
    }
    /**
     * @param {*} args
     * @memberof Logger
     */
    info(...args) {
        this._logger.info(...args);
    }
    /**
     * @param {*} args
     * @memberof Logger
     */
    warn(...args) {
        this._logger.warn(...args);
    }
    /**
     * @param {*} args
     * @memberof Logger
     */
    error(...args) {
        this._logger.error(...args);
    }
};


let log4jsConfig = new Log4jsConfig();

let logger = new Logger(_log4js2.default.getLogger());
const loggerMap = new Map();

_log4js2.default.configure(log4jsConfig);
loggerMap.set('default', logger);
/**
 *
 * @param {string} loggername
 * @return {Logger}
 */
const getLogger = loggername => {
    if (loggername === undefined) {
        logger.warn('[default] logger will only print log content to console,make sure it\'s what you want,you can pass [true] to disable this message');
        return loggerMap.get('default');
    }
    if (loggername === true) {
        return loggerMap.get('default');
    }
    if (loggerMap.has(loggername)) {
        return loggerMap.get(loggername);
    } else {
        let logger = new Logger(loggername);
        loggerMap.set(loggername, logger);
        return logger;
    }
};

exports.default = getLogger;
/**
 * 2018-4-28
 *  这里用对象方式传参
 *  方便以后扩展到 db 中使用
 *
 * @author liqiang9521@foxmail.com
 */

const createLogger = function () {
    let count = 0;
    let seed = Date.now();
    return function ({ name, type = 'file', filenames = [], print2Console = true, forceCreate = false, level = DEFAULT_LOG_LEVEL }) {
        // 如果不是强制创建日志记录器，那么:如果有的话，直接返回已经存在的
        if (!forceCreate && log4jsConfig.catNames.has(name)) {
            return getLogger(name);
        }
        let appenderNames = [];
        let appenders = {};
        if (type == 'file') {
            if ((0, _lodash.isString)(filenames)) {
                filenames = [filenames];
            }
            if (filenames.length == 0) {
                logger.warn(`logger ${name} is file type, but with no filenames field ,it will not print to any file, please make sure`);
            }
            filenames.forEach(filename => {
                let appenderName = 'appender' + seed + count++;
                appenderNames.push(appenderName);
                appenders[appenderName] = {
                    type: 'file',
                    filename
                };
            });
        }
        if (print2Console) {
            appenderNames.push('console');
        }

        log4jsConfig.addConfig({
            appenders: appenders,
            categories: {
                [name]: { appenders: appenderNames, level }
            }
        });
        return getLogger(name);
    };
}();

const createLoggers = function () {
    let count = 0;
    let seed = Date.now();
    return function (args) {
        let appenders = {};
        let categories = {};

        for (let arg of args) {
            let { name, type = 'file', filenames = [], print2Console = true, forceCreate = false, level = DEFAULT_LOG_LEVEL } = arg;
            // 如果不是强制创建日志记录器，那么:如果有的话，直接返回已经存在的
            if (!forceCreate && log4jsConfig.catNames.has(name)) {
                continue;
            }
            let appenderNames = [];

            if (type == 'file') {
                if ((0, _lodash.isString)(filenames)) {
                    filenames = [filenames];
                }
                if (filenames.length == 0) {
                    logger.warn(`logger ${name} is file type, but with no filenames field ,it will not print to any file, please make sure`);
                }
                filenames.forEach(filename => {
                    let appenderName = 'appender' + seed + count++;
                    appenderNames.push(appenderName);
                    appenders[appenderName] = {
                        type: 'file',
                        filename
                    };
                });
            }
            if (print2Console) {
                appenderNames.push('console');
            }
            categories[name] = { appenders: appenderNames, level };
        }
        log4jsConfig.addConfig({
            appenders: appenders,
            categories: categories
        });
    };
}();
exports.Logger = Logger;
exports.createLoggers = createLoggers;
exports.createLogger = createLogger;
/**
    let config = {
        appenders: {
            common: {
                type: 'file',
                maxLogSize: 10 * 1024 * 1024, // = 10Mb
                compress: true,
                numBackups: 5, // keep five backup files
                filename: path.join(config.LOGGER_PATH, 'crws.log')
            },
            http: {
                type: 'file',
                maxLogSize: 10 * 1024 * 1024, // = 10Mb
                compress: true,
                numBackups: 5, // keep five backup files
                filename: path.join(config.LOGGER_PATH, 'http.log')
            },
            console: { type: 'console' }
        },
        categories: {
            common: { appenders: ['common', 'console'], level: 'all' },
            disconf: { appenders: ['common', 'console'], level: 'all' },
            bola: { appenders: ['common', 'console'], level: 'all' },
            http: { appenders: ['http', 'console'], level: 'all' },
            default: { appenders: ['console', 'common'], level: 'all' }
        }
    };
*/