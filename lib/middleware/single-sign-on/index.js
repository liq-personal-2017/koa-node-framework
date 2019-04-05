'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _log = require('./../../log/log');

var _log2 = _interopRequireDefault(_log);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
    install(app, conf) {
        // app.
        let WEB_CONTEXT = app.webContextPath;
        WEB_CONTEXT += WEB_CONTEXT.endsWith('/') ? '' : '/';
        let { local, portal, cas, ignore, client } = conf;
        let localAddr = makeAddr(local);
        let portalAddr = makeAddr(portal);
        let casAddr = makeAddr(cas);
        let ajaxConf = {
            status: client.status,
            header: client.header
        };

        const singleSignOn = require('./singleSignOn')({ localAddr, portalAddr, casAddr, ajaxConf, ignore, WEB_CONTEXT });

        app.use(singleSignOn);
    },
    middlewareName: 'cas'

    /**
     * @param {*} info
     * @return {string}
     * @author liqiang9521@foxmail.com
     */
};
function makeAddr(info) {
    let logger = (0, _log2.default)('cas');
    let addr = [];
    if (info.protocal == 'http') {
        addr.push('http');
    } else if (info.protocal == 'https') {
        addr.push('https');
    } else {
        logger.error('Unkown protocal ', info);
        throw new Error('Unkown protocal ');
    }
    addr.push('://');
    addr.push(info.ip);
    if (info.port) {
        addr.push(':');
        addr.push(info.port);
    }
    return addr.join('');
}