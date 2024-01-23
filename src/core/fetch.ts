import { Server } from 'bun'
import { IssacErrorEventHandler, IssacEventer, defaultIssacErrorEventHandler } from './event'
import { IssacLogger } from './log'
import { IssacResponser } from './responser'
import { IssacRouter } from './router'
import { IssacRequest, IssacWrapRequest } from './wrap-request'

type BunFetchHandler = (req: Request, server: Server) => Response | Promise<Response>
export type WsUpgradeScheduler =
    | ((request: IssacRequest, server: Server) => Response | void | boolean)
    | undefined
export type FetchHandler = (req: IssacRequest, res: IssacResponser) => void
export type HttpMethod = 'GET' | 'POST' | 'DELETE' | 'PUT'

/**
 * 核心请求处理器
 * @private
 */
export class Fetcher {
    public router: IssacRouter
    public errorHandler: IssacErrorEventHandler
    public upgradeWs: WsUpgradeScheduler //升级websocket
    constructor(
        router: IssacRouter = new IssacRouter(),
        errorHandler: IssacErrorEventHandler = defaultIssacErrorEventHandler,
        upgradeWs?: WsUpgradeScheduler
    ) {
        this.router = router
        this.errorHandler = errorHandler
        this.upgradeWs = upgradeWs
        //绑定的错误事件回调函数
        IssacEventer.on(IssacEventer.eventSymbol.error, errorHandler)
    }

    public handler(): BunFetchHandler {
        return async (request, server) => {
            const responser = new IssacResponser()
            const wrapRequest = new IssacWrapRequest(request)

            //TODO 框架最好提供ws路由的支持
            if (this.upgradeWs) {
                const result = this.upgradeWs(wrapRequest.request, server)
                if (result instanceof Response) {
                    return result
                } else if (typeof result === 'boolean') {
                    //默认处理
                    return result
                        ? new Response('Upgrade good :>', { status: 101 })
                        : new Response('Upgrade failed :(', { status: 500 })
                }
            }

            try {
                await this.router.match(wrapRequest, responser)
            } catch (error) {
                IssacEventer.emit(IssacEventer.eventSymbol.error, error)
            }

            return responser.task.catch((reason) => {
                this.errorHandler(new Error(reason), wrapRequest.request)
                return responser.task
            })
        }
    }
}
