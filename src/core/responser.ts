interface IssacResponserOptions {
    errorHandler?: (error: Error) => void
}

export class Responser {
    public task: Promise<Response>
    private resolve?: (res: Response) => void
    private reject?: (reason?: any) => void
    private options?: IssacResponserOptions
    constructor(options?: IssacResponserOptions) {
        this.options = options
        this.task = new Promise((res, rej) => {
            //捕获Promise处理器
            this.resolve = res
            this.reject = rej
        })
    }
    //以文本形式结束task
    public text(content: string = 'Hello, this is a message from Issac!', init?: Bun.ResponseInit) {
        try {
            this.resolve!(new Response(content, init))
        } catch (error: any) {
            //执行用户注册的响应错误处理
            this.options?.errorHandler && this.options?.errorHandler(new Error(error));
            this.reject!(`Error in responser.text\ndetail:${error}`)
        }

    }
    //任意数据结束task
    public any<T extends Bun.BodyInit | null | undefined>(content?: T, init?: Bun.ResponseInit) {
        try {
            this.resolve!(new Response(content, init))
        } catch (error: any) {
            //执行用户注册的响应错误处理
            this.options?.errorHandler && this.options?.errorHandler(new Error(error));
            this.reject!(`Error in responser.any\ndetail:${error}`)
        }
    }

}