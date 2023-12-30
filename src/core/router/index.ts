import { FetchHandler } from "../fetch";
import { IssacMiddleware } from "../middleware";
import { IssacMiddlewareMgrConfig, defaultIssacMiddlewareMgrConfig, IssacMiddlewareMgr } from "../middleware/mgr";

import { Responser } from "../responser";
import { IssacWrapRequest } from "../wrap-request";
import { RouterModule } from "./module";

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
    private getModule: RouterModule
    private postModule: RouterModule
    private deleteModule: RouterModule
    private putModule: RouterModule
    private headModule: RouterModule
    private connectModule: RouterModule
    private optionsModule: RouterModule
    private traceModule: RouterModule
    private patchModule: RouterModule
    private modules: Array<RouterModule>
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
        this.modules = [this.getModule, this.postModule, this.deleteModule, this.putModule, this.headModule, this.connectModule, this.optionsModule, this.traceModule, this.patchModule]
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
        this.getModule.add(this.wrapUrl(url), new Set(handlers))
    }

    //post方法注册接口
    public post(url: string, ...handlers: Array<FetchHandler>) {
        this.postModule.add(this.wrapUrl(url), new Set(handlers))
    }

    //delete方法注册接口
    public delete(url: string, ...handlers: Array<FetchHandler>) {
        this.deleteModule.add(this.wrapUrl(url), new Set(handlers))
    }

    //put方法注册接口
    public put(url: string, ...handlers: Array<FetchHandler>) {
        this.putModule.add(this.wrapUrl(url), new Set(handlers))
    }

    //head方法注册接口
    public head(url: string, ...handlers: Array<FetchHandler>) {
        this.headModule.add(this.wrapUrl(url), new Set(handlers))
    }

    //connect方法注册接口
    public connect(url: string, ...handlers: Array<FetchHandler>) {
        this.connectModule.add(this.wrapUrl(url), new Set(handlers))
    }

    //options方法注册接口
    public options(url: string, ...handlers: Array<FetchHandler>) {
        this.optionsModule.add(this.wrapUrl(url), new Set(handlers))
    }

    //trace方法注册接口
    public trace(url: string, ...handlers: Array<FetchHandler>) {
        this.traceModule.add(this.wrapUrl(url), new Set(handlers))
    }

    //patch方法注册接口
    public patch(url: string, ...handlers: Array<FetchHandler>) {
        this.patchModule.add(this.wrapUrl(url), new Set(handlers))
    }

    //any注册接口,可用于动态注册
    public any(method: 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'CONNECT' | 'OPTIONS' | 'TRACE' | 'PATCH', url: string, ...handlers: Array<FetchHandler>) {
        switch (method) {
            case "GET":
                this.get(url, ...handlers)
                break
            case "POST":
                this.post(url, ...handlers)
                break
            case "PUT":
                this.put(url, ...handlers)
                break
            case "DELETE":
                this.delete(url, ...handlers)
                break
            case "HEAD":
                this.head(url, ...handlers)
                break
            case "CONNECT":
                this.connect(url, ...handlers)
                break
            case "OPTIONS":
                this.options(url, ...handlers)
                break
            case "TRACE":
                this.trace(url, ...handlers)
                break
            case "PATCH":
                this.patch(url, ...handlers)
                break
            default:
                console.warn(`unknown method! ${method}`)
                break
        }
    }

    //匹配各模块执行
    public async match({ request }: IssacWrapRequest, responser: Responser) {
        //执行中间件s
        await this.middlewareMgr.do(request, responser)
        //匹配
        switch (request.method) {
            case 'GET':
                this.getModule.do(request, responser)
                break;
            case 'POST':
                this.postModule.do(request, responser)
                break
            case 'PUT':
                this.postModule.do(request, responser)
                break
            case 'DELETE':
                this.postModule.do(request, responser)
                break
            default:
                break;
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