import { Server } from 'bun'
import { IssacErrorEventHandler, IssacEventer, defaultIssacErrorEventHandler } from './event'
import { IssacResponse } from './response'
import { IssacRouter } from './router'
import { IssacRequest, IssacWrapRequest } from './wrap-request'

export type WsUpgradeScheduler =
    | ((request: IssacRequest, server: Server) => Response | void | boolean)
    | undefined

export type BunFetchHandler = (req: Request, server: Server) => Response | Promise<Response>
export type FetchHandlerReturn =
    | Bun.BodyInit
    | void
    | Object
    | Promise<void>
    | Promise<Bun.BodyInit>
    | Promise<Object>
export type FetchHandler = (req: IssacRequest, res: IssacResponse) => FetchHandlerReturn
export type HttpMethod =
    | 'GET'
    | 'HEAD'
    | 'POST'
    | 'PUT'
    | 'DELETE'
    | 'CONNECT'
    | 'OPTIONS'
    | 'TRACE'
    | 'PATCH'
export type FetchContext = {
    response: IssacResponse
    wrapRequest: IssacWrapRequest
}

/**
 * A core request processor that captures requests and processes them
 * @internal
 */
export class Fetcher {
    public router: IssacRouter
    public errorHandler: IssacErrorEventHandler
    public upgradeWs: WsUpgradeScheduler //Upgrade to websocket
    constructor(
        router: IssacRouter = new IssacRouter(),
        errorHandler: IssacErrorEventHandler = defaultIssacErrorEventHandler,
        upgradeWs?: WsUpgradeScheduler
    ) {
        this.router = router
        this.errorHandler = errorHandler
        this.upgradeWs = upgradeWs
        //Bound error event callback function
        IssacEventer.on(IssacEventer.eventSymbol.error, errorHandler)
    }

    public handler(): BunFetchHandler {
        return async (request, server) => {
            //wrap ctx
            const response = new IssacResponse()
            const wrapRequest = new IssacWrapRequest(request)
            const context: FetchContext = {
                response,
                wrapRequest
            }

            //upgrade ws
            if (this.upgradeWs) {
                const result = this.upgradeWs(wrapRequest.request, server)
                if (result instanceof Response) {
                    return result
                } else if (typeof result === 'boolean') {
                    if (result) {
                        server.upgrade(wrapRequest.request)
                        return new Response('Upgrade good :>', { status: 101 })
                    }
                }
            }

            try {
                await this.router.match(context)
            } catch (error) {
                IssacEventer.emit(IssacEventer.eventSymbol.error, error)
            }

            return response.task.catch((reason) => {
                this.errorHandler(new Error(reason), wrapRequest.request)
                return response.task
            })
        }
    }
}
