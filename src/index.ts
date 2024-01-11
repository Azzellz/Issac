import { Issac } from "./core/issac";
import { IssacRouter } from "./core/router";

const app = new Issac({
    log: {
        output: 'file',
        file: {
            path: '../log.txt'
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


app.listen(1145)

Bun.write('./1.txt','a')