import { IssacResponser } from "./responser"
import { IssacRequest } from "./wrap-request"
import { appendFile } from "fs/promises"

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

//TODO 请求IP溯源
export interface IssacLoggerConfig {
    off?: boolean //是否关闭日志
    output: 'terminal' | 'file' //输出方式
    file?: {    //以文件模式输出时配置的
        path: string
        maxRecord?: number
    }
    terminal?: {

    }
}

export const defaultIssacLoggerConfig: IssacLoggerConfig = {
    output: 'terminal'
}

//TODO 全局静态日志打印器类,需要实现写入文件
export class IssacLogger {
    public static config: IssacLoggerConfig = defaultIssacLoggerConfig
    public static warn(content: string) {
        if (this.config.off) return

        const log = `[Issac-Warn|${Time.getFormattedTime()}]:${content}\n`
        switch (this.config.output) {
            case "terminal":
                console.error(Color.getColoredText(log, 'YELLOW'))
                break
            case "file":
                if (this.config.file) {
                    appendFile(this.config.file.path, log)
                }
                break
        }
    }
    public static normal(request: IssacRequest, responser: IssacResponser) {
        if (this.config.off) return
        const routeMethod = request.method
        const routePath = new URL(request.url).pathname
        const status = responser.init.status
        const log = `[Issac|${Time.getFormattedTime()}]:${routeMethod} ${status} ${routePath}\n`
        switch (this.config.output) {
            case "terminal":
                if (status === 200) {
                    console.log(Color.getColoredText(log, 'GREEN'))
                } else {
                    //TODO 其他状态码的多颜色支持
                    console.log(Color.getColoredText(log, 'BLUE'))
                }
                break
            case "file":
                if (this.config.file) {
                    appendFile(this.config.file.path, log)
                }
                break
        }
    }
    public static error(error: Error, request: IssacRequest) {
        if (this.config.off) return
        const routeMethod = request.method
        const routePath = new URL(request.url).pathname
        const log = `[Issac-Error|${Time.getFormattedTime()}]:${routeMethod} ${routePath} ${error}\n`
        switch (this.config.output) {
            case "terminal":
                console.error(Color.getColoredText(log, 'RED'))
                break
            case "file":
                if (this.config.file) {
                    appendFile(this.config.file.path, log)
                }
                break
        }
    }
}