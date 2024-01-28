import { Issac, IssacRouter } from '../lib'
import { match, pathToRegexp } from 'path-to-regexp'

const app = new Issac({
    ws: {
        scheduler: (req) => {
            return req.headers.get('test') === 'issac'
        }
    }
})

app.get('/sss', async (req, res) => {
    res.status(200).text('good!')
})

app.ws({
    open(ws) {
        console.log('a new websocket!')
    },
    message(ws, message) {
        ws.send(message + 'plus!')
    }
})

app.listen(1145)
