import { Server, WebSocketHandler } from 'bun'
import { FetchHandler, Fetcher, WsUpgradeScheduler } from './fetch'
import { IssacRouterConfig, IssacRouter, defaultIssacRouterConfig } from './router'
import { IssacMiddleware } from './middleware'
import { IssacMiddlewareHandler } from './middleware/mgr'
import { IssacEventHandler, defaultIssacErrorEventHandler } from './event'
import { IssacLogger, IssacLoggerConfig, defaultIssacLoggerConfig } from './log'

export interface IssacConfig {
    router?: IssacRouterConfig
    errorHandler?: IssacEventHandler
    log?: IssacLoggerConfig
    ws?: {
        //upgrade调度器必须有
        scheduler: WsUpgradeScheduler
        //处理器可选
        handler?: WebSocketHandler
    }
}

const defaultIssacConfig: IssacConfig = {
    router: defaultIssacRouterConfig,
    errorHandler: defaultIssacErrorEventHandler,
    log: defaultIssacLoggerConfig,
    ws: undefined
}

export class Issac {
    public server: Server = {} as Server
    private config: IssacConfig
    private fetcher: Fetcher
    constructor(config: IssacConfig = defaultIssacConfig) {
        //初始化各配置
        this.config = {
            router: config.router ? config.router : defaultIssacRouterConfig,
            errorHandler: config.errorHandler ? config.errorHandler : defaultIssacErrorEventHandler,
            log: config.log ? config.log : defaultIssacLoggerConfig,
            ws: config.ws ? config.ws : undefined
        }
        IssacLogger.config = this.config.log!
        this.fetcher = new Fetcher(
            new IssacRouter('', this.config.router),
            this.config.errorHandler,
            this.config.ws?.scheduler
        )
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
    public any(
        method:
            | 'GET'
            | 'HEAD'
            | 'POST'
            | 'PUT'
            | 'DELETE'
            | 'CONNECT'
            | 'OPTIONS'
            | 'TRACE'
            | 'PATCH',
        url: string,
        ...handlers: Array<FetchHandler>
    ) {
        this.fetcher.router.any(method, url, ...handlers)
    }

    //覆盖ws处理器,注意这里无法再更新upgradeScheduler了
    public ws(wsHandler: WebSocketHandler) {
        if (this.config.ws) {
            this.config.ws.handler = wsHandler
        }
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
    public listen(
        port: number,
        onListen: () => void = () => console.log(`Now server is listening on ${port}`)
    ) {
        this.server = Bun.serve({
            port,
            fetch: this.fetcher.handler(),
            websocket: this.config.ws?.handler
        })
        onListen()
    }
}
