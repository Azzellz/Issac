import { Issac, IssacRouter } from '../lib'

const app = new Issac({
    log: {
        output: 'file',
        file: {
            path: '../log.txt'
        }
    },
    ws: {
        scheduler: (req) => {
            return req.headers.get('test') === 'issac'
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
