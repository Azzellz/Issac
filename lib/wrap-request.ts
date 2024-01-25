/**
 * Extend native requests
 * @public
 */
export interface IssacRequest extends Request {
    query: Record<string, string | number> //Encapsulated query
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
        this.request = this.wrapQuery(this.request)
    }
    private wrapQuery(req: IssacRequest): IssacRequest {
        req.query = {}
        const url = new URL(req.url)
        url.searchParams.forEach((value, key) => {
            req.query[key] = value
        })
        return req
    }
}
