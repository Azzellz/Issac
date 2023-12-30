export interface IssacRequest extends Request {
    query: Record<string, string | number>  //封装好的query
    payload: any    //自定义负载
}

//包装请求
export class IssacWrapRequest {
    public origin: Request
    public request: IssacRequest
    constructor(origin: Request) {
        this.origin = origin
        //伪初始化
        this.request = origin as any
        //拓展包装
        this.request = this.wrapQuery(this.request)
    }
    //包装query
    private wrapQuery(req: IssacRequest): IssacRequest {
        req.query = {}
        const url = new URL(req.url)
        url.searchParams.forEach((value, key) => {
            req.query[key] = value
        })
        return req
    }


}