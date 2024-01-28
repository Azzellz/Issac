import { type Key, pathToRegexp } from 'path-to-regexp'
import { IssacEventer } from '../event'
import { FetchHandler } from '../fetch'
import { IssacLogger } from '../log'
import { IssacResponse } from '../response'
import { IssacRequest } from '../wrap-request'

//路由单元
class RouteUnit {
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
//TODO 需要支持通配符/路径参数路由
export class RouterModule {
    //处理函数map
    public routeUnitMap: Map<string, RouteUnit>
    //TODO 提供接口以便实现自定义缓存策略
    public caches: RouteUnit[]
    //默认的lost函数
    private lost: FetchHandler = (req, res) => {
        res.text(`I'm lost....`)
    }
    constructor(lost?: FetchHandler) {
        this.routeUnitMap = new Map()
        this.caches = []
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
        //TODO 后续可以使用更加高效的方法匹配!!!
        //遍历Map并且使用每个unit的regex与url进行匹配
        let routeUnit: RouteUnit | null = null
        for (const [_, unit] of this.routeUnitMap) {
            const match = unit.regex.exec(routePath)
            if (match) {
                if (unit.keys) {
                    //TODO 后续可以做类型体操
                    const paramValues = match.slice(1)
                    for (let i = 0; i < unit.keys.length; i++) {
                        //?这里要忽略通配符匹配到的参数
                        if (unit.keys[i].name === 0 && unit.keys[i].pattern === '.*') {
                            continue
                        }
                        request.params[unit.keys[i].name + ''] = paramValues[i]
                            ? paramValues[i]
                            : ''
                    }
                }
                routeUnit = unit
                break
            }
        }
        if (routeUnit) {
            //执行相关操作
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
