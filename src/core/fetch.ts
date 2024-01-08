import { IssacEventHandler, IssacEventer, defaultIssacErrorHandler } from "./event"
import { IssacResponser } from "./responser"
import { IssacRouter } from "./router"
import { IssacWarner } from "./warner"
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
    public errorHandler: IssacEventHandler
    public warner: IssacWarner = new IssacWarner()
    constructor(router: IssacRouter = new IssacRouter(), errorHandler: IssacEventHandler = defaultIssacErrorHandler) {
        this.router = router
        this.errorHandler = errorHandler
        IssacEventer.on(IssacEventer.eventSymbol.error, errorHandler)
    }

    public handler(): BunFetchHandler {
        //TODO 警告处理机制
        return async (request) => {
            //生成一个响应者
            const responser = new IssacResponser()
            //路由匹配
            try {
                this.router.match(new IssacWrapRequest(request), responser)
            } catch (error) {
                IssacEventer.emit(IssacEventer.eventSymbol.error, error)
            }

            return responser.task.catch((reason) => { this.errorHandler(reason); return responser.task })
        }
    }
}
