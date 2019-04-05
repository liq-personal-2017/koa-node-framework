// koa-csrf 3.0.6
// const conf = require('../../config');
import CSRF from '../../third-party/csurf/csurf'

export default {
    middlewareName: 'csurf',
    install(app) {
        app.use(
            new CSRF({
                value(ctx) {
                    return ctx.get('itgs-kt')
                },
                ignorePaths: [/\/file\//]
            })
        )
        app.use(async (ctx, next) => {
            ctx.state.csrf = {
                token: ctx.csrf
            }
            await next()
        })
    }
}
