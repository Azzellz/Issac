import { Issac } from "./core/issac";
import { IssacRouter } from "./core/router";

const app = new Issac()

const router = new IssacRouter('/issac')

//注册
router.get('/get', async () => {
    throw 123
})

//use必须在router配置完之后
app.use(router)


app.listen(1145)