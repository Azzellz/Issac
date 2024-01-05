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
    constructor(public router: IssacRouter = new IssacRouter()) { }

    public handler(): BunFetchHandler {
        //TODO: 错误/警告处理机制
        return (request) => {
            //生成一个响应者
            const responser = new IssacResponser()
            //方法匹配阶段
            this.router.match(new IssacWrapRequest(request), responser)
            //等待响应者完成任务
            return responser.task
        }
    }
}
