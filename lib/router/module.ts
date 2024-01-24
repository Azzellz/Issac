import { IssacEventer } from "../event"
import { FetchHandler } from "../fetch"
import { IssacLogger } from "../log"
import { IssacResponser } from "../responser"
import { IssacRequest } from "../wrap-request"

//路由子模块
export class RouterModule {
    //处理函数map
    public handlerMap: Map<string, Set<FetchHandler>>
    //默认的lost函数
    private lost: FetchHandler = (req, res) => {
        res.text(`I'm lost....`)
    }
    constructor(lost?: FetchHandler) {
        this.handlerMap = new Map()
        if (lost) {
            this.lost = lost
        }
    }

    //注册路由映射函数
    public add(url: string, handlers: Set<FetchHandler>) {
        //注意要encodeURI,不然无法匹配中文
        this.handlerMap.set(url ? encodeURI(url) : '/', handlers)
    }

    //合并map
    public merge(another: RouterModule, cover: boolean = false) {
        another.handlerMap.forEach((handlers, url) => {
            if (cover) {
                this.add(url, handlers)
            } else if (!this.handlerMap.get(url)) {
                this.add(url, handlers)
            }
        })
    }

    //执行
    public async do(request: IssacRequest, responser: IssacResponser): Promise<void> {
        const routePath = new URL(request.url).pathname
        const handlers = this.handlerMap.get(routePath)
        if (handlers) {
            const task = new Promise<boolean>((resolve) => {
                let count = 0
                let isError: boolean = false
                handlers.forEach(async (handler) => {
                    //发生错误后就不继续执行
                    if (isError) return
                    //执行handler
                    try {
                        //!为了捕获异步handler,要包装成async
                        await handler(request, responser)
                    } catch (error) {
                        //触发错误事件处理
                        resolve(false)
                        IssacEventer.emit(IssacEventer.eventSymbol.error, new Error(error as any), request)
                    }
                    //判断是否为最后一个
                    if (++count === handlers.size) {
                        resolve(true)
                    }
                })
            })
            //没有错误则输出正常的日志
            if (await task) {
                IssacLogger.normal(request, responser)
            }
        } else {
            try {
                //没找到就触发lost函数
                this.lost(request, responser)
            } catch (error) {
                IssacEventer.emit(IssacEventer.eventSymbol.error, error, request)
            }

        }

    }
}