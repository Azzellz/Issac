import { Server, WebSocketHandler } from 'bun'
import { FetchHandler, FetchHandlerReturn, Fetcher, HttpMethod, WsUpgradeScheduler } from './fetch'
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
        scheduler: WsUpgradeScheduler
        handler?: WebSocketHandler
    }
}

const defaultIssacConfig: IssacConfig = {
    router: defaultIssacRouterConfig,
    errorHandler: defaultIssacErrorEventHandler,
    log: defaultIssacLoggerConfig,
    ws: undefined
}

/**
 * Issac instance, provides API for writing back-end interface
 * @public
 */
//TODO 引入声明周期和类型安全
export class Issac {
    public server: Server = {} as Server
    private config: IssacConfig
    private fetcher: Fetcher
    constructor(config: IssacConfig = defaultIssacConfig) {
        //init all configs
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

    /**
     * Register the route processing function of the get method
     * @public
     */
    public get(url: string, ...handlers: FetchHandler[]) {
        this.fetcher.router.get(url, ...handlers)
        return this
    }

    /**
     * Register the route processing function of the post method
     * @public
     */
    public post(url: string, ...handlers: FetchHandler[]) {
        this.fetcher.router.post(url, ...handlers)
        return this
    }

    /**
     * Register the route processing function of the delete method
     * @public
     */
    public delete(url: string, ...handlers: FetchHandler[]) {
        this.fetcher.router.delete(url, ...handlers)
        return this
    }

    /**
     * Register the route processing function of the put method
     * @public
     */
    public put(url: string, ...handlers: FetchHandler[]) {
        this.fetcher.router.put(url, ...handlers)
        return this
    }

    /**
     * Register the route processing function of the delete method,used to register some uncommon methods to avoid polluting the method space
     * @public
     */
    public any(method: HttpMethod, url: string, ...handlers: FetchHandler[]) {
        this.fetcher.router.any(method, url, ...handlers)
        return this
    }

    /**
     * Cover the ws processor. Note that the upgradeScheduler cannot be updated here.
     * @public
     */
    public ws(wsHandler: WebSocketHandler) {
        if (this.config.ws) {
            this.config.ws.handler = {
                ...this.config.ws.handler,
                ...wsHandler
            }
        }
        return this
    }

    /**
     * Use middleware or merge routers
     * @public
     */
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
        return this
    }

    /**
     * Start listening
     * @public
     */
    public listen(
        port: number,
        onListen: () => void = () => console.log(`Now server is listening on ${port}`)
    ) {
        //TODO Need to support bun native config , For example tls
        this.server = Bun.serve({
            port,
            fetch: this.fetcher.handler(),
            websocket: this.config.ws?.handler
        })
        onListen()
    }
}
