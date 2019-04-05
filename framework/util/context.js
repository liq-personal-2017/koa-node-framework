import Koa from 'koa'
/**
 * 获取 ctx 中的远程地址
 * @param {Koa.Context} ctx
 * @return {string}
 * @author liqiang9521@foxmail.com
 */
function getRemoteAddressFromContext(ctx) {
    return ctx.headers['x-forwarded-for'] || ctx.ip || ctx.req._remoteAddress || (ctx.req.socket && (ctx.req.socket.remoteAddress || (ctx.req.socket.socket && ctx.req.socket.socket.remoteAddress)))
}

export { getRemoteAddressFromContext }
