interface IssacResponserOptions {
    errorHandler?: (error: Error) => void
}

/**
* 请求响应者
* @private
*/
export class IssacResponser {
    /**
    * Promise-Task异步模型
    * @private
    */
    public task: Promise<Response>
    private resolve: (res: Response) => void = () => { }
    private reject: (reason?: any) => void = () => { }
    private options?: IssacResponserOptions
    private init: Bun.ResponseInit  //响应的init配置对象
    constructor(options?: IssacResponserOptions) {
        this.options = options
        this.init = {}
        this.task = new Promise((resolve, reject) => {
            //捕获Promise处理器
            this.resolve = resolve
            this.reject = reject
        })
    }

    /**
    * 以key->value的形式配置响应头
    * @public
    */
    public setHeaders(key: string, value: string) {
        if (!this.init.headers) {
            this.init.headers = {}
            this.init.headers[key] = value
        } else {
            (this.init.headers as Record<string, string>)[key] = value
        }
        return this
    }

    /**
    * 设置响应状态码
    * @public
    */
    public status(code: number) {
        this.init.status = code
        return this
    }

    /**
    * 重置响应头(覆盖)
    * @public
    */
    public resetHeaders(headers: Bun.HeadersInit) {
        this.init.headers = headers
        return this
    }

    /**
    * 合并响应头
    * @public
    */
    public mergeHeaders(headers: Bun.HeadersInit) {
        this.init.headers = { ...this.init.headers, ...headers }
        return this
    }

    /**
    * 合并init:合并headers->覆盖状态码->覆盖状态描述
    * @private
    */
    private mergeInit(init: Bun.ResponseInit) {
        if (init) {
            this.init.headers = { ...this.init.headers, ...init.headers }
            this.init.status = init.status || 200
            this.init.statusText = init.statusText || "OK"
        }
    }

    /**
    * 以文本形式(含隐式HTML转义)结束task
    * @public
    */
    public text(content: string = 'Hello, this is a message from Issac!', init?: Bun.ResponseInit) {
        try {
            this.setHeaders('Content-Type', 'text/plain;charset=UTF-8')
            init && this.mergeInit(init)
            this.resolve(new Response(Bun.escapeHTML(content), this.init))
        } catch (error: any) {
            //执行用户注册的响应错误处理
            this.options?.errorHandler && this.options?.errorHandler(new Error(error));
            this.reject(`Error in responser.text\ndetail:${error}`)
        } finally {
            return this
        }

    }

    /**
    * 以HTML结束task
    * @example
    * 使用Bun.file读取'../bar.html'文件内的内容并以HTML的格式发送
    *   app.get('/foo', async (req, res) => {
    *        res.HTML(await Bun.file('../bar.html').text())
    *   })
    * @public
    */
    public HTML(content: string, init?: Bun.ResponseInit) {
        try {
            this.setHeaders('Content-Type', 'text/html;charset=UTF-8')
            init && this.mergeInit(init)
            this.resolve(new Response(content, this.init))
        } catch (error: any) {
            //执行用户注册的响应错误处理
            this.options?.errorHandler && this.options?.errorHandler(new Error(error));
            this.reject(`Error in responser.text\ndetail:${error}`)
        } finally {
            return this
        }
    }

    /**
    * 以JSON格式结束task
    * @public
    */
    public JSON(object: Object, init?: Bun.ResponseInit) {
        try {
            this.setHeaders('Content-Type', 'application/json;charset=UTF-8')
            init && this.mergeInit(init)
            this.resolve(new Response(JSON.stringify(object), this.init))
        } catch (error: any) {
            //执行用户注册的响应错误处理
            this.options?.errorHandler && this.options?.errorHandler(new Error(error));
            this.reject(`Error in responser.text\ndetail:${error}`)
        } finally {
            return this
        }
    }

    /**
    * 以任意满足Bun.BodyInit的数据结束task
    * @public
    */
    public any<T extends Bun.BodyInit | null | undefined>(content?: T, init?: Bun.ResponseInit) {
        try {
            init && this.mergeInit(init)
            this.resolve(new Response(content, this.init))
        } catch (error: any) {
            //执行用户注册的响应错误处理
            this.options?.errorHandler && this.options?.errorHandler(new Error(error));
            this.reject(`Error in responser.any\ndetail:${error}`)
        } finally {
            return this
        }
    }

}