import { Elysia } from 'elysia'

new Elysia()
    .get('/', () => 'hi')
    .get('/:id', (req) => {
        console.log(req.params.id)
    })
    .get('/:id/n', (req) => {
        console.log(req)
        console.log(req.params.id, 2)
    })
    .get('/:id/n', (req) => {
        console.log(req)
        console.log(req.params.id, 3)
    })
    .listen(1145)
