import { Issac, IssacRouter } from '../lib'

const app = new Issac({
    ws: {
        scheduler: (req) => {
            return req.headers.get('test') === 'issac'
        }
    }
})

const router = new IssacRouter('/issac')

router.get('/get', async (req, res) => {
    res.status(200).text('good!')
})

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
