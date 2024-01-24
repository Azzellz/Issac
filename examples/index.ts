import { Issac } from '../lib/issac'
import { IssacRouter } from '../lib/router'

const app = new Issac({
    log: {
        output: 'file',
        file: {
            path: '../log.txt'
        }
    },
    ws: {
        scheduler: (req) => {
            console.log(req.headers.get('Sec-Websocket-Key') === 'issac')
            return req.headers.get('Sec-Websocket-Key') === 'issac'
        }
    }
})

const router = new IssacRouter('/issac')

//注册
router.get('/get', async (req, res) => {
    res.status(200).text('good!')
})

//use必须在router配置完之后
app.use(router)

app.ws({
    open(ws) {
        console.log('A new client!')
    },
    message(ws, message) {
        ws.send(message + 'plus!')
    }
})

app.listen(1145)
