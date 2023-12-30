import { Responser } from "./responser"
import { IssacRouter } from "./router"
import { IssacRequest, IssacWrapRequest } from "./wrap-request"

type BunFetchHandler = (req: Request) => Response | Promise<Response>
export type FetchHandler = (req: IssacRequest, res: Responser) => void
export type HttpMethod = 'GET' | 'POST' | 'DELETE' | 'PUT'

//核心请求处理器
export class Fetcher {
    constructor(public router: IssacRouter = new IssacRouter()) { }

    public handler(): BunFetchHandler {
        //TODO: 错误/警告处理机制
        return (request) => {
            const responser = new Responser()
            //方法匹配阶段
            this.router.match(new IssacWrapRequest(request), responser)
            //最后返回task
            return responser.task
        }
    }
}
