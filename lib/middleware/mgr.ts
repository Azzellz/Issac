import { IssacMiddleware } from '.'
import { IssacEventer } from '../event'
import { IssacResponse } from '../response'
import { IssacRequest, IssacWrapRequest } from '../wrap-request'

type IssacMiddlewareNext = () => void

export type IssacMiddlewareHandler = (
    request: IssacRequest,
    responser: IssacResponse,
    next: IssacMiddlewareNext
) => void

export interface IssacMiddlewareMgrConfig {}

export const defaultIssacMiddlewareMgrConfig: IssacMiddlewareMgrConfig = {}

//中间件管理者
export class IssacMiddlewareMgr {
    public config: IssacMiddlewareMgrConfig
    public middlewares: Array<IssacMiddleware> = []
    constructor(config: IssacMiddlewareMgrConfig = defaultIssacMiddlewareMgrConfig) {
        this.config = config
    }
    public add(...middlewares: Array<IssacMiddleware>) {
        middlewares.forEach((middleware) => {
            this.middlewares.push(middleware)
        })
    }
    public do(request: IssacRequest, responser: IssacResponse): Promise<void> {
        return new Promise((resolve, reject) => {
            //中间件索引
            let index = 0
            //封装next函数
            const next: IssacMiddlewareNext = async () => {
                try {
                    //中间件执行完毕
                    if (index >= this.middlewares.length) return resolve()
                    //取出对应的中间件
                    const middleware = this.middlewares[index++]
                    //执行中间件的处理函数
                    await middleware.handler(request, responser, next)
                } catch (error) {
                    IssacEventer.emit(
                        IssacEventer.eventSymbol.error,
                        new Error(error as any),
                        request
                    )
                }
            }
            //执行中间件链
            next()
        })
    }
}
