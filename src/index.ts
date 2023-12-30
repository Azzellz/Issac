import { Issac } from "./core/issac";
import { IssacMiddleware } from "./core/middleware";
import { IssacRouter } from "./core/router";

const app = new Issac()

const router = new IssacRouter('/issac')


router.get('/get', (req, res) => {
    res.any('hee')
})

router.get('/get', (req, res) => {
    res.any('Heee')
})

//use必须在router配置完之后
app.use(router)

app.use(new IssacMiddleware((req, res, next) => {
    console.log('mw1')
    setTimeout(next, 1000)
}), (req, res, next) => {
    console.log('mw2')
    setTimeout(next, 2000)
})

app.listen(1145)

