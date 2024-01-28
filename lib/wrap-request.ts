/**
 * Extend native requests
 * @public
 */
export interface IssacRequest extends Request {
    query: Record<string, string | number> //Encapsulated query
    params: Record<string, string> //路径参数
    payload: any //anything
}

/**
 * WrapRequest
 * @private
 */
export class IssacWrapRequest {
    public origin: Request
    public request: IssacRequest
    constructor(origin: Request) {
        this.origin = origin
        //Pseudo-initialization
        this.request = origin as any
        //Extend query
        this.wrap(this.request)
    }
    private wrap(req: IssacRequest) {
        this.wrapQuery(req)
        this.wrapParams(req)
    }
    private wrapParams(req: IssacRequest) {
        req.params = {}
    }
    private wrapQuery(req: IssacRequest) {
        req.query = {}
        const url = new URL(req.url)
        url.searchParams.forEach((value, key) => {
            req.query[key] = value
        })
    }
}
