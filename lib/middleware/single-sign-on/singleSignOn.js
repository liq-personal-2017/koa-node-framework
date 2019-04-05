'use strict';

var _koaCas = require('../../third-party/koa-cas2');

var _koaCas2 = _interopRequireDefault(_koaCas);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * 单点登录：
 *  单点登录原理是：如果是第一次请求，这个请求上就没有任何的登录信息，此时会将这个请求重定向到cas服务器，
 *  附带两个参数，一个service，一个login（这个是cas服务器定制的）， 这个service是请求验证成功之后，跳转回来的地址，login是失败之后跳转的登录地址
 *      即：第一次验证有两次重定向
 *  验证失败了会直接跳转到登录页，与本服务无关
 *  验证成功之后，重定向回来的请求上将带有一个ticket票据，单点登录客户端（本服务）将对此票据进行验证，验证通过，再将请求重定向到用户本来请求的地址
 *      注意这个地址并不是给cas服务器的service地址：是配置中的validate地址
 *
 *  browser ---[{request} itgs-web/program-list]------------------------------------------------------------> itgs-web
 *                                                                                                            [保存映射关系 validateUrl <=> itgs-web/program-list ]
 *          <==[{redirect} /casServer/validate?service=itgs-web/validate&login=portal/login ]================
 *          ---[{request} /casServer/validate?service=itgs-web/validate&login=portal/login ]---> casServer
 *          <==[{redirect} itgs-web/validate?ticket=tc]=========================================
 *          ---[{request} itgs-web/validate?ticket=tc]------------------------------------------------------> itgs-web
 *                                                                    casServer <-----[{validate} tc ]-------
 *                                                                              ======[{validate success}]==>
 *                                                                                                            验证成功 取出用户请求的原始url itgs-web/program-list
 *          <==[{redirect} itgs-web/program-list (header : auth ， 在cookie中写入正确验证后的信息) ]===========
 *          ---[{request} itgs-web/program-list (header : auth 自动带上上次获取到的cookie信息)] --------------> 本服务中直接cookie的信息，通过校验，返回用户正确的响应信息
 *
 *  这里的做法是，如果校验失败了直接跳转到portal页面：本来是不能这么做的
 *      因为系统的页面是存在于 门户portal 下，如果校验失败了，理论上来说，应该将 门户portal 跳转到登录页
 *          否则会出现portal下有登录页的情况。
 *      但是门户网站应该是对这种情况进行了处理，如果内部的iframe地址切换到了portal地址，那么会直接刷新整个页面，此时如果用户登录超时，将会重定向到登录页
 *      基于此，单点登录完成
 *
 *  关于配置中的 paths.validate 地址，这个地址是第一次请求进行验证时，传给单点登录服务器的service地址，即：验证成功之后会重定向回来到这个地址下
 *      并且在第一次请求验证时，会将这个validate地址与用户的请求地址关联上：如果用户验证通过了，重复访问这个validate地址，将被重定向到用户第一次验证时的地址下
 *  所以这里不能将validate地址对应到任何一个有意义的地址上：否则用户将永远无法正常访问这个地址了
 *
 *  关于配置中的 serverInternalPath ， 这个地址是client与casServer通信的内部地址，之所以不能使用外网的地址，是因为内外网的协议不同，外网协议为 https ， 内网为 http ， 服务器不支持， 且https整数不受信
 *      会造成通信异常
 *
 * @author liqiang9521@foxmail.com
 */
/**
 * @return {function}
 * @author liqiang9521@foxmail.com
 */
module.exports = function ({ localAddr, portalAddr, WEB_CONTEXT, casAddr, ajaxConf, ignore, match = [] }) {
    let _ignore = [/\/health$/, /\/images/, ...ignore];
    const options = {
        // debug: true,
        ignore: _ignore,
        match: match,
        servicePrefix: localAddr, // 这里是本地的地址：在服务端时，填门户服务地址+本服务前缀 : https://10.13.11.103/itgs-web
        serverPath: portalAddr, // 从配置文件里面获取门户地址，协议是https。
        serverInternalPath: casAddr, // 获得CAS服务器的内部地址
        paths: {
            portal: '/portal',
            validate: `${WEB_CONTEXT}validate`, // 这里是校验地址
            serviceValidate: '/bic/ssoService/v1/serviceValidate',
            // proxy: '/buglycas/proxy',
            login: '/bic/ssoService/v1/casLogin', // cas的登录地址、login结尾、serivice地址
            logout: '/bic/ssoService/v1/logout', // cas的登出地址，不一定logout结尾。
            proxyCallback: null
        },
        redirect: true,
        slo: false,
        cache: {
            enable: false,
            ttl: 5 * 60 * 1000,
            filter: []
        },
        fromAjax: ajaxConf
        // fromAjax: {
        //     header: 'x-client-ajax',
        //     status: 401,
        // },
    };
    const casClient = new _koaCas2.default(options);
    let core = casClient.core();
    return core;
}; // const ConnectCas = require('../../../modules/udes-connect-cas')