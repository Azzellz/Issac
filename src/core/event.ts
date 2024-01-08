//TODO 完成事件流的抽象
import EventEmitter from 'events';
import { colorText } from './util/color';
import { getFormattedTime } from './util/time';
// 创建 EventEmitter 实例
const IssacGlobalEventType = {
    error: Symbol("ErrorEvent"),
    warning: Symbol("WarningEvent")
}

export type IssacEventHandler = (...args: any) => void

//TODO 指出具体路由
export const defaultIssacErrorHandler: IssacEventHandler = (error) => {
    console.error(colorText(`[Issac-Error/${getFormattedTime(false)}]:${error}`, 'RED'))
}

export class IssacEventer {
    public static eventSymbol = {
        error: Symbol("ErrorEvent"),
        warning: Symbol("WarningEvent")
    }
    private static emitter = new EventEmitter();
    private static eventHandlersMap = new Map<symbol, IssacEventHandler>()
    public static emit(eventSymbol: symbol, ...args: any) {
        const handler = this.eventHandlersMap.get(eventSymbol)
        handler && handler(args)
    }
    public static on(eventSymbol: symbol, handler: IssacEventHandler) {
        if (eventSymbol === this.eventSymbol.error || eventSymbol === this.eventSymbol.warning) {
            this.eventHandlersMap.set(eventSymbol, handler)
        }
    }
}

