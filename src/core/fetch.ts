import { IssacErrorEventHandler, IssacEventer, defaultIssacErrorEventHandler } from "./event"
import { IssacResponser } from "./responser"
import { IssacRouter } from "./router"
import { IssacRequest, IssacWrapRequest } from "./wrap-request"

type BunFetchHandler = (req: Request) => Response | Promise<Response>
export type FetchHandler = (req: IssacRequest, res: IssacResponser) => void
export type HttpMethod = 'GET' | 'POST' | 'DELETE' | 'PUT'


/**
* 核心请求处理器
* @private
*/
export class Fetcher {
    public router: IssacRouter
    public errorHandler: IssacErrorEventHandler
    constructor(router: IssacRouter = new IssacRouter(), errorHandler: IssacErrorEventHandler = defaultIssacErrorEventHandler) {
        this.router = router
        this.errorHandler = errorHandler
        //绑定的错误事件回调函数
        IssacEventer.on(IssacEventer.eventSymbol.error, errorHandler)
    }

    public handler(): BunFetchHandler {
        return async (request) => {
            
            const responser = new IssacResponser()
            const wrapRequest = new IssacWrapRequest(request)
            
            try {
                this.router.match(wrapRequest, responser)
            } catch (error) {
                IssacEventer.emit(IssacEventer.eventSymbol.error, error)
            }

            return responser.task.catch((reason) => {
                this.errorHandler(new Error(reason), wrapRequest.request);
                return responser.task
            })
        }
    }
}
