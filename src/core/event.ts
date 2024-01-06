//TODO: 完成事件流的抽象

import EventEmitter from 'events';

// 创建 EventEmitter 实例
const myEmitter = new EventEmitter();

// 注册事件监听器
myEmitter.on('event', () => {
    console.log('An event occurred!');
});

// 触发事件
myEmitter.emit('event');


export class IssacEventer {

}

