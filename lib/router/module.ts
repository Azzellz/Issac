import { IssacEventer } from '../event'
import { FetchContext, FetchHandler } from '../fetch'
import { HttpRouteUnit, WsRouteUnit } from './unit'

//通用路由模块
export class RouterModule<UnitType extends HttpRouteUnit | WsRouteUnit> {
    //处理函数map
    public routeUnitMap: Map<string, UnitType>
    //TODO 提供接口以便实现自定义缓存策略
    public caches: UnitType[]
    //默认的lost函数
    private lost: FetchHandler = () => `I'm lost....`
    constructor(lost?: FetchHandler) {
        this.routeUnitMap = new Map()
        this.caches = []
        lost && (this.lost = lost)
    }

    //注册路由映射函数
    public add(unit: UnitType) {
        this.routeUnitMap.set(unit.url ? encodeURI(unit.url) : '/', unit)
    }

    //合并map
    public merge(another: RouterModule<UnitType>, cover: boolean = false) {
        another.routeUnitMap.forEach((unit, url) => {
            if (cover || !this.routeUnitMap.get(url)) {
                this.routeUnitMap.set(url, unit)
            }
        })
    }

    //执行
    public async match(ctx: FetchContext) {
        const {
            wrapRequest: { request },
            response
        } = ctx
        const path = new URL(request.url).pathname

        //TODO 后续可以使用更加高效的方法匹配!!!
        for (const [_, unit] of this.routeUnitMap) {
            if (unit.verify(path, ctx)) return
        }

        try {
            await this.lost(request, response)
        } catch (error) {
            IssacEventer.emit(IssacEventer.eventSymbol.error, error, request)
        }
    }
}
