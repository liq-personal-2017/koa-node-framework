import csrf from 'csrf'
/**
 *
 *
 * @author liqiang9521@foxmail.com
 */
export default class CSRF {
    /**
     * Factory method for the middleware.
     *
     * This constructor returns the actual middleware function.
     *
     * @param {Object} opts
     * @return {Function}
     */
    constructor(opts) {
        this.opts = opts || {}

        if (!this.opts.invalidSessionSecretMessage) this.opts.invalidSessionSecretMessage = 'Invalid session secret'

        if (!this.opts.invalidSessionSecretStatusCode) this.opts.invalidSessionSecretStatusCode = 403

        if (!this.opts.invalidTokenMessage) this.opts.invalidTokenMessage = 'Invalid CSRF token'

        if (!this.opts.invalidTokenStatusCode) this.opts.invalidTokenStatusCode = 403

        if (!this.opts.excludedMethods) this.opts.excludedMethods = [ 'GET', 'HEAD', 'OPTIONS', ]

        if (typeof this.opts.disableQuery !== 'boolean') this.opts.disableQuery = false

        this.tokens = csrf(opts)

        this.value = opts.value

        this.ignorePaths = opts.ignorePaths || []

        return this.middleware
    }
    /**
     * @param {any} ctx
     * @return {string}
     * @author liqiang9521@foxmail.com
     */
    getToken(ctx) {
        if (this.value) {
            return this.value(ctx)
        }
        const bodyToken = ctx.request.body && typeof ctx.request.body._csrf === 'string' ? ctx.request.body._csrf : false
        const token = bodyToken || (!this.opts.disableQuery && ctx.query && ctx.query._csrf) || ctx.get('csrf-token') || ctx.get('xsrf-token') || ctx.get('x-csrf-token') || ctx.get('x-xsrf-token')
        return token
    }
    /**
     * @param {string} path
     * @return {boolean}
     *
     * @author liqiang9521@foxmail.com
     */
    shuldIgnore(path) {
        return this.ignorePaths.length > 0 && this.ignorePaths.some((p) => p.test(path))
    }
    /**
     * Middelware handler
     *
     * @param {Context} ctx
     * @param {Function} next
     * @return {Function}
     */
    middleware = (ctx, next) => {
        ctx.__defineGetter__('csrf', () => {
            if (ctx._csrf) return ctx._csrf

            if (!ctx.session) return null

            if (!ctx.session.secret) ctx.session.secret = this.tokens.secretSync()

            ctx._csrf = this.tokens.create(ctx.session.secret)

            return ctx._csrf
        })

        ctx.response.__defineGetter__('csrf', () => ctx.csrf)

        if (this.shuldIgnore(ctx.request.url)) {
            return next()
        }

        if (this.opts.excludedMethods.indexOf(ctx.method) !== -1) return next()

        if (!ctx.session.secret) ctx.session.secret = this.tokens.secretSync()

        let token = this.getToken(ctx)

        if (!token) return ctx.throw(this.opts.invalidTokenStatusCode, this.opts.invalidTokenMessage)

        if (!this.tokens.verify(ctx.session.secret, token)) return ctx.throw(this.opts.invalidTokenStatusCode, this.opts.invalidTokenMessage)

        return next()
    }
}
