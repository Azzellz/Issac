import { IssacLogger } from './log'

interface IssacResponserOptions {
    errorHandler?: (error: Error) => void
}

/**
 * Response
 * @internal
 */
export class IssacResponse {
    /**
     * Promise-Task
     * @private
     */
    public task: Promise<Response>
    private done: boolean //is task done
    private resolve: (res: Response) => void = () => {}
    private reject: (reason?: any) => void = () => {}
    private options?: IssacResponserOptions
    public init: Bun.ResponseInit
    constructor(options?: IssacResponserOptions) {
        this.options = options
        this.init = {}
        this.task = new Promise((resolve, reject) => {
            //capture resolve and reject
            this.resolve = resolve
            this.reject = reject
        })
        this.done = false
    }

    /**
     * Configure the response header in the form of key:value
     * @public
     */
    public setHeaders(key: string, value: string) {
        if (!this.init.headers) {
            this.init.headers = {}
            this.init.headers[key] = value
        } else {
            ;(this.init.headers as Record<string, string>)[key] = value
        }
        return this
    }

    /**
     * Set the response status code
     * @public
     */
    public status(code: number) {
        this.init.status = code
        return this
    }

    /**
     * Reset Response Header (Overlay)
     * @public
     */
    public resetHeaders(headers: Bun.HeadersInit) {
        this.init.headers = headers
        return this
    }

    /**
     * Merge response headers
     * @public
     */
    public mergeHeaders(headers: Bun.HeadersInit) {
        this.init.headers = { ...this.init.headers, ...headers }
        return this
    }

    /**
     * Check the legality of the operation and give a warning if it is not
     * @private
     */
    private checkWarn() {
        if (this.done) {
            IssacLogger.warn('Please do not call methods that trigger task resolve twice in a row.')
        }
    }

    /**
     * Merge init: merge headers-> override status code-> override status description
     * @private
     */
    private mergeInit(init: Bun.ResponseInit) {
        if (init) {
            this.init.headers = { ...this.init.headers, ...init.headers }
            this.init.status = init.status || 200
            this.init.statusText = init.statusText || 'OK'
        }
    }

    /**
     * Terminate the task as text (with implicit HTML escaping).
     * @public
     */
    public text(content: string = 'Hello, this is a message from Issac!', init?: Bun.ResponseInit) {
        this.checkWarn()
        try {
            this.setHeaders('Content-Type', 'text/plain;charset=UTF-8')
            init && this.mergeInit(init)
            this.resolve(new Response(Bun.escapeHTML(content), this.init))
            this.done = true
        } catch (error: any) {
            this.options?.errorHandler && this.options?.errorHandler(new Error(error))
            this.reject(`Error in responser.text\ndetail:${error}`)
        } finally {
            return this
        }
    }

    /**
     * End the task with HTML
     * @example
     * Read with Bun.file '/bar.html' file and send it in HTML format
     *   app.get('/foo', async (req, res) => {
     *        res.HTML(await Bun.file('../bar.html').text())
     *   })
     * @public
     */
    public HTML(content: string, init?: Bun.ResponseInit) {
        this.checkWarn()
        try {
            this.setHeaders('Content-Type', 'text/html;charset=UTF-8')
            init && this.mergeInit(init)
            this.resolve(new Response(content, this.init))
            this.done = true
        } catch (error: any) {
            this.options?.errorHandler && this.options?.errorHandler(new Error(error))
            this.reject(`Error in responser.text\ndetail:${error}`)
        } finally {
            return this
        }
    }

    /**
     * End the task with JSON
     * @public
     */
    public JSON(object: Object, init?: Bun.ResponseInit) {
        this.checkWarn()
        try {
            this.setHeaders('Content-Type', 'application/json;charset=UTF-8')
            init && this.mergeInit(init)
            this.resolve(new Response(JSON.stringify(object), this.init))
            this.done = true
        } catch (error: any) {
            this.options?.errorHandler && this.options?.errorHandler(new Error(error))
            this.reject(`Error in responser.text\ndetail:${error}`)
        } finally {
            return this
        }
    }

    /**
     * Ends the task with any data that satisfies Bun.BodyInit
     * @public
     */
    public any<T extends Bun.BodyInit | null | undefined>(content?: T, init?: Bun.ResponseInit) {
        this.checkWarn()
        try {
            init && this.mergeInit(init)
            this.resolve(new Response(content, this.init))
            this.done = true
        } catch (error: any) {
            this.options?.errorHandler && this.options?.errorHandler(new Error(error))
            this.reject(`Error in responser.any\ndetail:${error}`)
        } finally {
            return this
        }
    }
}
