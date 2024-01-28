import { Issac, IssacRouter } from '../lib'

const app = new Issac({
    ws: {
        scheduler: (req) => {
            return req.headers.get('test') === 'issac'
        }
    }
})

app.get('/sss', () => 'Hello!')

app.ws({
    open(ws) {
        console.log('a new websocket!')
    },
    message(ws, message) {
        ws.send(message + 'plus!')
    }
})

app.listen(1145)
