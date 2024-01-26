import { Issac, IssacRouter } from '../lib'

const app = new Issac({
    ws: {
        scheduler: (req) => {
            return req.headers.get('test') === 'issac'
        }
    }
})


app.get('/:id', async (req, res) => {
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
