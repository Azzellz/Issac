# issac

[![License][1]][2]

[1]: https://img.shields.io/badge/License-MIT-brightgreen.svg
[2]: LICENSE

**一个基于 Bun 的轻量级 web 后端框架** , 使用纯 ts + Bun Native API 实现

得益于 Bun Native API ，issac 有着不错的性能

**tip: Bun 对 ts 提供第一支持,这使得 issac 不需要.d.ts 文件也能在 js 中获得良好的类型提示**

目前支持:

1. 路由
2. 中间件
3. 内置日志
4. 错误处理
5. 基础的 websocket 支持(未来待完善)

# TODO

1. 完成 websocket 基本支持 （完成）
2. 完成 websocket 路由支持 （进行中）

# 快速开始

因为 issac 基于 Bun Native 实现 , 所以 issac 只能在 Bun 环境使用。

## 安装

使用 bun 的包管理工具 **(推荐)**

```bash
bun add issac
```

使用 npm

```bash
npm install issac
```

## 启动

使用 issac 创建一个简单的 http/ws 服务器：

```typescript
import { Issac } from 'issac'

const app = new Issac({
    ws: {
        //配置ws调度器,用于将请求升级至ws
        //任何请求头内包含test: issac的请求将会被升级成ws
        scheduler: (req) => req.headers.get('test') === 'issac'
    }
})

//注册ws处理器
app.ws({
    open(ws) {
        console.log('a new websocket!')
    },
    message(ws, message) {
        ws.send(message + 'plus!')
    }
})

//注册http路由
app.get('/test', (req, res) => {
    //返回一段文本
    res.text('issac!')
})

//监听
app.listen(1145, () => {
    console.log('listen on 1145!')
})
```

issac 的 API 风格非常像 express , 因此熟悉 express 的开发者可以快速上手。
