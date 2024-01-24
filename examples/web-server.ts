import { Issac, IssacRouter } from '../lib'

const app = new Issac({
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
        console.log('a new websocket!')
    },
    message(ws, message) {
        ws.send(message + 'plus!')
    }
})

app.listen(1145)
