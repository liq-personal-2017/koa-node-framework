'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getArgsFromCtx = exports.getArgs = undefined;

var _isObject = require('lodash/isObject');

var _isObject2 = _interopRequireDefault(_isObject);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * 提取参数列表
 * @param {function} method
 * @return {Array<string>}
 * @author liqiang9521@foxmail.com
 */
function getArgs(method) {
    let argsStr = method.toString();
    argsStr = argsStr.split(')').shift();
    argsStr = argsStr.split('(').pop();
    let argsList = argsStr.split(',').map(a => a.trim()).filter(Boolean);
    return argsList;
}
const PARAM_NOT_FOUND = Symbol.for('controller#param_not_found');
const PARAM_NOT_CARE = Symbol.for('controller#param_not_care');
/**
 * 从ctx中提取参数
 * @param {any} ctx
 * @param {Array<string>} argNames
 * @param {{deepIn:?Array<String>,handlers:?Array<Function>}} config
 * @return {array}
 * @author liqiang9521@foxmail.com
 */
function getArgsFromCtx(ctx, argNames, config) {
    const { query, params } = ctx;
    const { body } = ctx.request;

    const args = [];
    const ctxArr = [query, params, body].filter(Boolean);

    const { deepIn, handlers } = config;
    // 尝试从ctx中获取对应的属性值：data， metadata
    const deepInObj = deepIn.map(field => {
        // (ctxArr.find((p) => isObject(p[field])) || {})[field]
        let item = ctxArr.find(p => (0, _isObject2.default)(p[field]));
        if (item) {
            return item[field];
        }
        return false;
    }).filter(Boolean);
    for (let name of argNames) {
        let arg;
        if (handlers && handlers.length > 0) {
            // handlers(name, ctx)
            handlers.every(handler => {
                arg = handler(name, ctx);
                return PARAM_NOT_FOUND == arg || PARAM_NOT_CARE == arg;
            });
        } else {
            arg = PARAM_NOT_FOUND;
        }
        if (PARAM_NOT_FOUND == arg || PARAM_NOT_CARE == arg) {
            // 如果从 自定义 二级属性中找到了参数，则不继续查询
            arg = deepInObj.find(p => p[name] !== undefined) || ctxArr.find(p => p[name] !== undefined); // 如果前端传了一个 0 || '' ， 都需要解析出来：如果为自己处理的json，可能有null值

            if (arg) {
                args.push(arg[name]);
            } else {
                args.push(null);
            }
        } else {
            args.push(arg);
        }
    }
    return args;
}

exports.getArgs = getArgs;
exports.getArgsFromCtx = getArgsFromCtx;