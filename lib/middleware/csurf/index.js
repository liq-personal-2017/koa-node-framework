'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _csurf = require('../../third-party/csurf/csurf');

var _csurf2 = _interopRequireDefault(_csurf);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
    middlewareName: 'csurf',
    install(app) {
        app.use(new _csurf2.default({
            value(ctx) {
                return ctx.get('itgs-kt');
            },
            ignorePaths: [/\/file\//]
        }));
        app.use(async (ctx, next) => {
            ctx.state.csrf = {
                token: ctx.csrf
            };
            await next();
        });
    }
}; // koa-csrf 3.0.6
// const conf = require('../../config');