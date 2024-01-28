import { FetchContext, FetchHandler, HttpMethod } from '../fetch'
import { IssacMiddleware } from '../middleware'
import {
    IssacMiddlewareMgrConfig,
    defaultIssacMiddlewareMgrConfig,
    IssacMiddlewareMgr
} from '../middleware/mgr'
import { RouterModule } from './module'
import { HttpRouteUnit } from './unit'

export interface IssacRouterConfig {
    //合并相关
    merge: {
        //是否允许覆盖,默认为false
        cover: boolean
    }
    //中间件mgr相关
    middleware: IssacMiddlewareMgrConfig
}

export const defaultIssacRouterConfig: IssacRouterConfig = {
    merge: {
        cover: false
    },
    middleware: defaultIssacMiddlewareMgrConfig
}

//路由器
export class IssacRouter {
    public base: string
    public config: IssacRouterConfig
    //中间件Mgr
    private middlewareMgr: IssacMiddlewareMgr
    //子模块
    private getModule: RouterModule<HttpRouteUnit>
    private postModule: RouterModule<HttpRouteUnit>
    private deleteModule: RouterModule<HttpRouteUnit>
    private putModule: RouterModule<HttpRouteUnit>
    private headModule: RouterModule<HttpRouteUnit>
    private connectModule: RouterModule<HttpRouteUnit>
    private optionsModule: RouterModule<HttpRouteUnit>
    private traceModule: RouterModule<HttpRouteUnit>
    private patchModule: RouterModule<HttpRouteUnit>
    private modules: Array<RouterModule<HttpRouteUnit>>
    constructor(base: string = '', config: IssacRouterConfig = defaultIssacRouterConfig) {
        //配置路由根路径
        this.base = base

        //config init
        this.config = config

        //初始化中间件Mgr
        this.middlewareMgr = new IssacMiddlewareMgr(config.middleware)

        //初始化各个子模块
        this.getModule = new RouterModule()
        this.postModule = new RouterModule()
        this.deleteModule = new RouterModule()
        this.putModule = new RouterModule()
        this.headModule = new RouterModule()
        this.connectModule = new RouterModule()
        this.optionsModule = new RouterModule()
        this.traceModule = new RouterModule()
        this.patchModule = new RouterModule()

        //方便遍历,注意这里要保证顺序
        this.modules = [
            this.getModule,
            this.postModule,
            this.deleteModule,
            this.putModule,
            this.headModule,
            this.connectModule,
            this.optionsModule,
            this.traceModule,
            this.patchModule
        ]
    }

    //注册中间件
    public use(...middlewares: Array<IssacMiddleware>) {
        middlewares.forEach((middleware) => {
            this.middlewareMgr.add(middleware)
        })
    }

    //包装路径
    private wrapUrl(url: string): string {
        return this.base + url
    }

    //get方法注册接口
    public get(url: string, ...handlers: Array<FetchHandler>) {
        this.getModule.add(new HttpRouteUnit(this.wrapUrl(url), new Set(handlers)))
    }

    //post方法注册接口
    public post(url: string, ...handlers: Array<FetchHandler>) {
        this.postModule.add(new HttpRouteUnit(this.wrapUrl(url), new Set(handlers)))
    }

    //delete方法注册接口
    public delete(url: string, ...handlers: Array<FetchHandler>) {
        this.deleteModule.add(new HttpRouteUnit(this.wrapUrl(url), new Set(handlers)))
    }

    //put方法注册接口
    public put(url: string, ...handlers: Array<FetchHandler>) {
        this.putModule.add(new HttpRouteUnit(this.wrapUrl(url), new Set(handlers)))
    }

    //head方法注册接口
    public head(url: string, ...handlers: Array<FetchHandler>) {
        this.headModule.add(new HttpRouteUnit(this.wrapUrl(url), new Set(handlers)))
    }

    //connect方法注册接口
    public connect(url: string, ...handlers: Array<FetchHandler>) {
        this.connectModule.add(new HttpRouteUnit(this.wrapUrl(url), new Set(handlers)))
    }

    //options方法注册接口
    public options(url: string, ...handlers: Array<FetchHandler>) {
        this.optionsModule.add(new HttpRouteUnit(this.wrapUrl(url), new Set(handlers)))
    }

    //trace方法注册接口
    public trace(url: string, ...handlers: Array<FetchHandler>) {
        this.traceModule.add(new HttpRouteUnit(this.wrapUrl(url), new Set(handlers)))
    }

    //patch方法注册接口
    public patch(url: string, ...handlers: Array<FetchHandler>) {
        this.patchModule.add(new HttpRouteUnit(this.wrapUrl(url), new Set(handlers)))
    }

    //any注册接口,可用于动态注册
    public any(method: HttpMethod, url: string, ...handlers: Array<FetchHandler>) {
        switch (method) {
            case 'GET':
                this.get(url, ...handlers)
                break
            case 'POST':
                this.post(url, ...handlers)
                break
            case 'PUT':
                this.put(url, ...handlers)
                break
            case 'DELETE':
                this.delete(url, ...handlers)
                break
            case 'HEAD':
                this.head(url, ...handlers)
                break
            case 'CONNECT':
                this.connect(url, ...handlers)
                break
            case 'OPTIONS':
                this.options(url, ...handlers)
                break
            case 'TRACE':
                this.trace(url, ...handlers)
                break
            case 'PATCH':
                this.patch(url, ...handlers)
                break
            default:
                console.warn(`unknown method! ${method}`)
                break
        }
    }

    //匹配各模块执行
    //TODO 应该采用效率更高的匹配模式???
    public async match(ctx: FetchContext) {
        //等待中间件执行完毕
        await this.middlewareMgr.do(ctx.wrapRequest.request, ctx.response)
        //匹配
        switch (ctx.wrapRequest.request.method) {
            case 'GET':
                this.getModule.match(ctx)
                break
            case 'POST':
                this.postModule.match(ctx)
                break
            case 'PUT':
                this.putModule.match(ctx)
                break
            case 'DELETE':
                this.deleteModule.match(ctx)
                break
            case 'CONNECT':
                this.connectModule.match(ctx)
                break
            case 'OPTIONS':
                this.optionsModule.match(ctx)
                break
            case 'TRACE':
                this.traceModule.match(ctx)
                break
            case 'PATCH':
                this.patchModule.match(ctx)
                break
            default:
                break
        }
    }

    //当前路由器与其他路由器合并
    public merge(...routers: Array<IssacRouter>) {
        routers.forEach((router) => {
            this.modules.forEach((module, index) => {
                module.merge(router.modules[index], this.config.merge.cover)
            })
        })
    }
}
