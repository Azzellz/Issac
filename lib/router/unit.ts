import { Key, pathToRegexp } from 'path-to-regexp'
import { IssacEventer } from '../event'
import { FetchHandler, FetchContext } from '../fetch'
import { IssacLogger } from '../log'
import { WebSocketHandler } from 'bun'

interface I_RouteUnit {
    url: string
    keys: Key[]
    regex: RegExp //用于匹配的正则表达式
    verify(path: string, ctx: FetchContext): any
}

//HTTP路由单元
export class HttpRouteUnit implements I_RouteUnit {
    public url: string
    public handlers: Set<FetchHandler>
    public keys: Key[]
    public regex: RegExp //用于匹配的正则表达式
    constructor(url: string, handlers: Set<FetchHandler>) {
        this.handlers = handlers
        this.url = url
        this.keys = []
        const validUrl = url.replace('*', '(.*)')
        this.regex = pathToRegexp(validUrl, this.keys)
    }
    public verify(path: string, ctx: FetchContext): boolean {
        const {
            wrapRequest: { request }
        } = ctx
        const match = this.regex.exec(path)
        if (match) {
            if (this.keys) {
                //TODO 后续可以做类型体操
                const paramValues = match.slice(1)
                for (let i = 0; i < this.keys.length; i++) {
                    //?这里要忽略通配符匹配到的参数
                    if (this.keys[i].name === 0 && this.keys[i].pattern === '.*') {
                        continue
                    }
                    request.params[this.keys[i].name + ''] = paramValues[i] ? paramValues[i] : ''
                }
            }
            this.work(ctx)
            return true
        } else {
            return false
        }
    }
    public async work(ctx: FetchContext) {
        const {
            wrapRequest: { request },
            response
        } = ctx
        const task = new Promise<string>(async (resolve) => {
            for (const handler of this.handlers) {
                try {
                    //!为了捕获异步handler,要包装成async
                    const result = await handler(request, response)
                    if (result && !response.isDone) {
                        typeof result === 'string' ? response.text(result) : response.JSON(result)
                        return resolve('')
                    }
                } catch (error) {
                    //触发错误事件处理
                    return resolve(String(error))
                }
            }
            return resolve('')
        })
        //没有错误则输出正常的日志
        const result = await task
        if (!result) {
            IssacLogger.normal(request, response)
        } else {
            IssacEventer.emit(IssacEventer.eventSymbol.error, new Error(result), request)
        }
    }
}

export class WsRouteUnit implements I_RouteUnit {
    public url: string
    public handlers: WebSocketHandler
    public keys: Key[]
    public regex: RegExp //用于匹配的正则表达式
    constructor(url: string, handlers: WebSocketHandler) {
        this.handlers = handlers
        this.url = url
        this.keys = []
        const validUrl = url.replace('*', '(.*)')
        this.regex = pathToRegexp(validUrl, this.keys)
    }
    public verify(path: string, ctx: FetchContext): boolean {
        const match = this.regex.exec(path)
        if (match) {
            this.work(ctx)
            return true
        } else {
            return false
        }
    }
    public async work(ctx: FetchContext) {
        // const {
        //     wrapRequest: { request },
        //     response
        // } = ctx
        // const task = new Promise<string>(async (resolve) => {
        //     for (const handler of this.handlers) {
        //         try {
        //             //!为了捕获异步handler,要包装成async
        //             const result = await handler(request, response)
        //             if (result && !response.isDone) {
        //                 typeof result === 'string' ? response.text(result) : response.JSON(result)
        //                 return resolve('')
        //             }
        //         } catch (error) {
        //             //触发错误事件处理
        //             return resolve(String(error))
        //         }
        //     }
        //     return resolve('')
        // })
        // //没有错误则输出正常的日志
        // const result = await task
        // if (!result) {
        //     IssacLogger.normal(request, response)
        // } else {
        //     IssacEventer.emit(IssacEventer.eventSymbol.error, new Error(result), request)
        // }
    }
}
