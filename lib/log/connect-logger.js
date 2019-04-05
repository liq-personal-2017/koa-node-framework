'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _log4js = require('log4js');

var _context = require('../util/context');

/**
 * 从log4js中摘了一版代码， 作为 koa 版的中间件， 写法参考koa-logger
 *
 * @author liqiang9521@foxmail.com
 */
const DEFAULT_FORMAT = ':remote-addr - :response-time ms -' + //
' ":method :url HTTP/:http-version"' + ' :status :content-length ":referrer"' + ' ":user-agent"';
/**
 * @param {*} logger4js
 * @param {*} options
 * @return {function}
 * @author liqiang9521@foxmail.com
 */
function connectLogger(logger4js, options) {
    /* eslint no-underscore-dangle:0 */
    if (typeof options === 'object') {
        options = options || {};
    } else if (options) {
        options = { format: options };
    } else {
        options = {};
    }

    const thisLogger = logger4js;
    let level = _log4js.levels.getLevel(options.level, _log4js.levels.INFO);
    const fmt = options.format || DEFAULT_FORMAT;
    const nolog = options.nolog ? createNoLogCondition(options.nolog) : null;

    return async (ctx, next) => {
        // 避免调用两次
        if (ctx._logging) {
            await next();
            return;
        }

        // nologs
        if (nolog && nolog.test(ctx.originalUrl)) {
            next();
            return;
        }
        // 这个做法是 koa 的， 更安全
        let onfinish;
        let onclose;
        let start; // 进来的时间
        if (thisLogger.isLevelEnabled(level) || options.level === 'auto') {
            start = new Date();
            onfinish = done.bind(null, 'finish', ctx);
            onclose = done.bind(null, 'close', ctx);
            // const writeHead = res.writeHead
            // flag as logging
            ctx._logging = true;
            // NOTICE 这里不做代理了，没啥用， 在options中传入一个 level : 'auto' ， 这里就会自动计算了
            // // proxy for statusCode.
            // res.writeHead = (code, headers) => {
            //     res.writeHead = writeHead
            //     res.writeHead(code, headers)

            //     res.__statusCode = code
            //     res.__headers = headers || {}

            //     // status code response level handling
            //     if (options.level === 'auto') {
            //         level = levels.INFO
            //         if (code >= 300) level = levels.WARN
            //         if (code >= 400) level = levels.ERROR
            //     } else {
            //         level = levels.getLevel(options.level, levels.INFO)
            //     }
            // }

            ctx.res.once('finish', onfinish);
            ctx.res.once('close', onclose);
        }

        // ensure next gets always called
        await next();

        /**
         * @param {string} event 没用到 在 koa-logger中是有用的（虽然没看出来他们想干啥）
         * @param {Koa.Context} ctx
         * @author liqiang9521@foxmail.com
         */
        function done(event, ctx) {
            // 不管是哪个事件先到，都把时间处理函数取消掉
            ctx.res.removeListener('finish', onfinish);
            ctx.res.removeListener('close', onclose);
            ctx.responseTime = new Date() - start;
            // status code response level handling
            if (ctx.status && options.level === 'auto') {
                level = _log4js.levels.INFO;
                if (ctx.status >= 300) level = _log4js.levels.WARN;
                if (ctx.status >= 400) level = _log4js.levels.ERROR;
            }

            if (thisLogger.isLevelEnabled(level)) {
                const combinedTokens = assembleTokens(ctx, options.tokens || []);

                if (typeof fmt === 'function') {
                    const line = fmt(ctx, str => format(str, combinedTokens));
                    if (line) thisLogger.log(level, line);
                } else {
                    thisLogger.log(level, format(fmt, combinedTokens));
                }
            }
        }
    };
}
/**
 * Return request url path,
 * adding this function prevents the Cyclomatic Complexity,
 * for the assemble_tokens function at low, to pass the tests.
 *
 * @param  {Koa.Request} ctx
 * @return {String}
 * @api private
 */
function getUrl(ctx) {
    return ctx.originalUrl || ctx.url;
}

/**
 * Adds custom {token, replacement} objects to defaults,
 * overwriting the defaults if any tokens clash
 *
 * @param  {Koa.Context} ctx
 * @param  {Array} customTokens
 *    [{ token: string-or-regexp, replacement: string-or-replace-function }]
 * @return {Array}
 */
function assembleTokens(ctx, customTokens) {
    // const DEFAULT_FORMAT = ':remote-addr - -' + ' ":method :url HTTP/:http-version"' + ' :status :content-length ":referrer"' + ' ":user-agent"'

    const defaultTokens = [];
    defaultTokens.push({ token: ':url', replacement: getUrl(ctx) });
    defaultTokens.push({ token: ':protocol', replacement: ctx.protocol });
    defaultTokens.push({ token: ':hostname', replacement: ctx.hostname });
    defaultTokens.push({ token: ':method', replacement: ctx.method });
    defaultTokens.push({ token: ':status', replacement: ctx.status });
    defaultTokens.push({ token: ':response-time', replacement: ctx.responseTime });
    defaultTokens.push({ token: ':date', replacement: new Date().toUTCString() });
    defaultTokens.push({
        token: ':referrer',
        replacement: ctx.headers.referer || ctx.headers.referrer || ''
    });
    defaultTokens.push({
        token: ':http-version',
        replacement: `${ctx.req.httpVersionMajor}.${ctx.req.httpVersionMinor}`
    });
    defaultTokens.push({
        token: ':remote-addr',
        replacement: (0, _context.getRemoteAddressFromContext)(ctx)
    });
    defaultTokens.push({ token: ':user-agent', replacement: ctx.headers['user-agent'] });
    defaultTokens.push({
        token: ':content-length',
        replacement: ctx.res._headers && ctx.res._headers['content-length'] || ctx.res.__headers && ctx.res.__headers['Content-Length'] || '-'
    });
    defaultTokens.push({
        token: /:req\[([^\]]+)]/g,
        replacement: function (_, field) {
            return ctx.headers[field.toLowerCase()];
        }
    });
    defaultTokens.push({
        token: /:res\[([^\]]+)]/g,
        replacement: function (_, field) {
            return ctx.res._headers ? ctx.res._headers[field.toLowerCase()] || ctx.res.__headers[field] : ctx.res.__headers && ctx.res.__headers[field];
        }
    });

    return (array => {
        const a = array.concat();
        for (let i = 0; i < a.length; ++i) {
            for (let j = i + 1; j < a.length; ++j) {
                // not === because token can be regexp object
                /* eslint eqeqeq:0 */
                if (a[i].token == a[j].token) {
                    a.splice(j--, 1);
                }
            }
        }
        return a;
    })(customTokens.concat(defaultTokens));
}

/**
 * Return formatted log line.
 *
 * @param  {String} str
 * @param {Array} tokens
 * @return {String}
 * @api private
 */
function format(str, tokens) {
    for (let i = 0; i < tokens.length; i++) {
        str = str.replace(tokens[i].token, tokens[i].replacement);
    }
    return str;
}
/**
 * @param {*} nolog
 * @return {*}
 * @author liqiang9521@foxmail.com
 */
function createNoLogCondition(nolog) {
    let regexp = null;

    if (nolog) {
        if (nolog instanceof RegExp) {
            regexp = nolog;
        }

        if (typeof nolog === 'string') {
            regexp = new RegExp(nolog);
        }

        if (Array.isArray(nolog)) {
            // convert to strings
            const regexpsAsStrings = nolog.map(reg => reg.source ? reg.source : reg);
            regexp = new RegExp(regexpsAsStrings.join('|'));
        }
    }

    return regexp;
}

exports.default = connectLogger;