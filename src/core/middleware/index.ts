import { IssacMiddlewareHandler } from "./mgr"

export interface IssacMiddlewareConfig {}

export const defaultIssacMiddlewareConfig: IssacMiddlewareConfig = {}


//中间件实例
export class IssacMiddleware {
    public handler: IssacMiddlewareHandler
    public config: IssacMiddlewareConfig
    constructor(handler: IssacMiddlewareHandler, config: IssacMiddlewareConfig = defaultIssacMiddlewareConfig) {
        this.handler = handler
        this.config = config
    }
}
