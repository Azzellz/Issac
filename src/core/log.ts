import { IssacRequest } from "./wrap-request"

//TODO 不要暴露多余内部实现的导出,可以考虑使用内部模块封装一下
namespace Color {
    type IssacColor = 'RESET' | 'RED' | 'GREEN' | 'YELLOW' | 'BLUE'
    const COLOR: Record<IssacColor, string> = {
        RESET: '\x1b[0m',
        RED: '\x1b[31m',
        GREEN: '\x1b[32m',
        YELLOW: '\x1b[33m',
        BLUE: '\x1b[34m',
    }
    export function getColoredText(content: string, color: IssacColor) {
        return COLOR[color] + content + COLOR.RESET
    }
}

namespace Time {
    export function getFormattedTime(showYear: boolean = false) {
        const tmp = new Date()
        const year = tmp.getFullYear()
        const month = tmp.getMonth() + 1
        const date = tmp.getDate()
        const formattedDate = `${year}/${month}/${date}`
        const hours = tmp.getHours()
        const minutes = tmp.getMinutes() < 10 ? `0${tmp.getMinutes()}` : tmp.getMinutes()
        const seconds = tmp.getSeconds() < 10 ? `0${tmp.getSeconds()}` : tmp.getSeconds()
        const formattedMoment = `${hours}:${minutes}:${seconds}`
        return showYear ? `${formattedDate} ${formattedMoment}` : `${formattedMoment}`
    }
}

//TODO 全局静态日志打印器类,需要实现写入文件
export class IssacLogger {
    public static warn() {

    }
    public static error(error: Error, request: IssacRequest, file: boolean = false) {
        const routeMethod = request.method
        const routePath = new URL(request.url).pathname
        console.error(Color.getColoredText(`[Issac-Error/${Time.getFormattedTime()}]:${routeMethod} ${routePath} ${error}`, 'RED'))
    }
}