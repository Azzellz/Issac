import { Server } from "bun"
import { FetchHandler, Fetcher } from "./fetch"
import { IssacRouterConfig, IssacRouter, defaultIssacRouterConfig } from "./router"
import { IssacMiddleware } from "./middleware"
import { IssacMiddlewareHandler } from "./middleware/mgr"
import { IssacEventHandler, defaultIssacErrorEventHandler } from "./event"


export interface IssacConfig {
    router?: IssacRouterConfig
    errorHandler?: IssacEventHandler
}

const defaultIssacConfig: IssacConfig = {
    router: defaultIssacRouterConfig,
    errorHandler: defaultIssacErrorEventHandler
}

export class Issac {
    public server: Server
    private config: IssacConfig
    private fetcher: Fetcher    //核心处理器
    constructor(config: IssacConfig = defaultIssacConfig) {
        this.config = config
        this.server = {} as Server
        this.fetcher = new Fetcher(new IssacRouter('', config.router), config.errorHandler)
    }

    //get注册接口
    public get(url: string, ...handlers: Array<FetchHandler>) {
        this.fetcher.router.get(url, ...handlers)
    }

    //post注册接口
    public post(url: string, ...handlers: Array<FetchHandler>) {
        this.fetcher.router.post(url, ...handlers)
    }

    //delete注册接口
    public delete(url: string, ...handlers: Array<FetchHandler>) {
        this.fetcher.router.delete(url, ...handlers)
    }

    //put注册接口
    public put(url: string, ...handlers: Array<FetchHandler>) {
        this.fetcher.router.put(url, ...handlers)
    }

    //any注册接口,用于注册一些不常用的方法,避免污染方法空间
    public any(method: 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'CONNECT' | 'OPTIONS' | 'TRACE' | 'PATCH', url: string, ...handlers: Array<FetchHandler>) {
        this.fetcher.router.any(method, url, ...handlers)
    }

    //使用中间件/合并路由器
    public use(...items: Array<IssacRouter | IssacMiddleware | IssacMiddlewareHandler>) {
        items.forEach((item) => {
            if (item instanceof IssacRouter) {
                this.fetcher.router.merge(item)
            } else if (item instanceof IssacMiddleware) {
                this.fetcher.router.use(item)
            } else {
                this.fetcher.router.use(new IssacMiddleware(item))
            }
        })
    }

    //启动监听
    public listen(port: number,
        callback: () => void = () => console.log(`Now server is listening on ${port}`),
        options?: IssacConfig) {

        this.server = Bun.serve({
            port,
            fetch: this.fetcher.handler(),
            websocket: {
                message(ws, message) {
                },
            }
        })
        callback();
    }
}

