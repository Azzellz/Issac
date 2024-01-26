import { IssacEventer } from '../event'
import { FetchHandler } from '../fetch'
import { IssacLogger } from '../log'
import { IssacResponse } from '../response'
import { IssacRequest } from '../wrap-request'

//路由单元
class RouteUnit {
    public url: string
    public handlers: Set<FetchHandler>
    constructor(url: string, handlers: Set<FetchHandler>) {
        this.handlers = handlers
        this.url = url
    }
    public async work(request: IssacRequest, response: IssacResponse) {
        const task = new Promise<string>((resolve) => {
            let count = 0
            let isError: boolean = false
            this.handlers.forEach(async (handler) => {
                //发生错误后就不继续执行
                if (isError) return
                //执行handler
                try {
                    //!为了捕获异步handler,要包装成async
                    await handler(request, response)
                } catch (error) {
                    //触发错误事件处理
                    resolve(String(error))
                }
                //判断是否为最后一个
                if (++count === this.handlers.size) {
                    resolve('')
                }
            })
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

//路由子模块
//TODO 需要支持通配符路由
export class RouterModule {
    //处理函数map
    public routeUnitMap: Map<string, RouteUnit>
    //默认的lost函数
    //TODO 匹配失败的时候有非预期输出&#x27
    private lost: FetchHandler = (req, res) => {
        res.text(`I'm lost....`)
    }
    constructor(lost?: FetchHandler) {
        this.routeUnitMap = new Map()
        if (lost) {
            this.lost = lost
        }
    }

    //注册路由映射函数
    public add(url: string, handlers: Set<FetchHandler>) {
        const routeUnit = new RouteUnit(url, handlers)
        //注意要encodeURI,不然无法匹配中文
        this.routeUnitMap.set(url ? encodeURI(url) : '/', routeUnit)
    }

    //合并map
    public merge(another: RouterModule, cover: boolean = false) {
        another.routeUnitMap.forEach((unit, url) => {
            if (cover || !this.routeUnitMap.get(url)) {
                this.routeUnitMap.set(url, unit)
            }
        })
    }

    //执行
    public async match(request: IssacRequest, response: IssacResponse) {
        const routePath = new URL(request.url).pathname
        const routeUnit = this.routeUnitMap.get(routePath)
        if (routeUnit) {
            routeUnit.work(request, response)
        } else {
            //这里lost函数可能是自定义的,所以需要捕获一下错误
            try {
                //没找到就触发lost函数
                await this.lost(request, response)
            } catch (error) {
                IssacEventer.emit(IssacEventer.eventSymbol.error, error, request)
            }
        }
    }
}
