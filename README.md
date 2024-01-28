# issac

[license-svg]: https://img.shields.io/badge/license-MIT-brightgreen.svg
[npm-svg]: https://img.shields.io/badge/npm-v1.0.0-red.svg
[npm-url]: https://www.npmjs.com/package/issac
[bun-svg]: https://img.shields.io/badge/bun-v1.0.25-blue.svg
[bun-url]: https://bun.sh/

[![license][license-svg]](LICENSE) [![npm][npm-svg]][npm-url] [![bun][bun-svg]][bun-url]

**[中文文档](README.zh.md)**

**A lightweight web backend framework based on bun** , implemented using pure ts + bun native.

Thanks to the fast bun native, issac has good performance.

Currently supports.

**tip: bun provides first support for ts, which allows issac to get good type hints in js without a .d.ts file**.

1. routing
2. middleware
3. built-in logging
4. error handling
5. basic websocket support (to be improved in the future)

# TODO

1. Complete basic websocket support (complete)
2. Path Parameters and Wildcard Routing (in progress)
3. Complete websocket routing support (in progress)
4. Lifecycle support (in progress)
5. Type Safe (in progress)
6. Route Cache (in progress)

# Quick Start

Since issac is based on bun Native implementation, issac can only be used in bun environment.

## Installation

Use bun's package management tool **(Recommended)**.

```bash
bun add issac
```

Using npm

```bash
npm install issac
```

## Start

Create a simple http/ws server with issac:

```typescript
import { Issac } from 'issac'

const app = new Issac({
    ws: {
        // Configure the ws scheduler to escalate requests to ws.
        // Any request that contains test: issac in the request header will be escalated to ws
        scheduler: (req) => req.headers.get('test') === 'issac'
    }
})

// Register the ws handler
app.ws({
    open(ws) {
        console.log('a new websocket!')
    },
    message(ws, message) {
        ws.send(message + 'plus!')
    }
})

// Register the http route
app.get('/test', (req, res) => {
    // Return a piece of text
    res.text('issac!')
})

// listen
app.listen(1145, () => {
    console.log('listen on 1145!')
})
```

issac's API style is very express-like, so developers familiar with express can get started quickly.
