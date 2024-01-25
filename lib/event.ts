import { IssacRequest } from './wrap-request'
import { IssacLogger } from './log'

export type IssacEventHandler = (...args: any) => void
export type IssacErrorEventHandler = (error: Error, request: IssacRequest) => void

/**
 * Default errorHandler
 * @internal
 */
export const defaultIssacErrorEventHandler: IssacErrorEventHandler = (error, request) => {
    //1. print log
    IssacLogger.error(error, request)
    //TODO 2.Specific error handling logic
}

/**
 * Global eventer to deal with error or warning
 * @internal
 */
export class IssacEventer {
    public static eventSymbol = {
        error: Symbol('ErrorEvent'),
        warning: Symbol('WarningEvent')
    }
    private static eventHandlersMap = new Map<symbol, IssacEventHandler>()
    //TODO Use generic conversions to provide better type hints
    public static emit(eventSymbol: symbol, ...args: any) {
        const handler = this.eventHandlersMap.get(eventSymbol)
        handler && handler(...args)
    }
    public static on(eventSymbol: symbol, handler: IssacEventHandler) {
        if (eventSymbol === this.eventSymbol.error || eventSymbol === this.eventSymbol.warning) {
            this.eventHandlersMap.set(eventSymbol, handler)
        }
    }
}
