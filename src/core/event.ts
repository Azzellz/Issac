import { IssacRequest } from './wrap-request';
import { IssacLogger } from './log';

export type IssacEventHandler = (...args: any) => void
export type IssacErrorEventHandler = (error: Error, request: IssacRequest) => void

/**
* 默认的错误事件处理函数
* @private
*/
export const defaultIssacErrorEventHandler: IssacErrorEventHandler = (error, request) => {
    //1.调用日志器打印
    IssacLogger.error(error, request)
    //TODO 2.具体的错误处理逻辑,比如说生成日志文件并且写入日志信息
}

/**
* 全局静态事件器
* @private
*/
export class IssacEventer {
    public static eventSymbol = {
        error: Symbol("ErrorEvent"),
        warning: Symbol("WarningEvent")
    }
    private static eventHandlersMap = new Map<symbol, IssacEventHandler>()
    //TODO 使用泛型改造
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

