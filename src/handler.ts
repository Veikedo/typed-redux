import {Message} from "messageMiddleware";
import {combineReducers, ReducersMapObject} from "redux";
import "reflect-metadata";

const handlersMetadataKey = Symbol("MessageReducer");
type Handlers = {
    [key: string]: (message: Message) => any
};

export type MessageReducer<TState=any> = {
    state: Readonly<TState>
};

export type MessageReducersMapObject = {
    [key: string]: Constructor<MessageReducer<any>>;
};

export const handler: MethodDecorator = (target: object, propertyKey: string, descriptor: PropertyDescriptor) => {
    const paramTypes = Reflect.getMetadata("design:paramtypes", target, propertyKey);
    if (paramTypes == null || paramTypes.length != 1) {
        throw Error("Message handler must accept one argument of MessageType");
    }

    const existingHandlers: Handlers = Reflect.getOwnMetadata(handlersMetadataKey, target) || {};
    const messageType = paramTypes[0];
    existingHandlers[messageType] = target[propertyKey];

    Reflect.defineMetadata(handlersMetadataKey, existingHandlers, target);
};


export type MessageHandler<TMessage, TState> = (message: TMessage, state: TState) => TState;
export const handler1 = <TMessage, TState>(type: Constructor<TMessage>, handler: MessageHandler<TMessage, TState>) => {

};

export const asReducer = <TState>(target: Constructor<MessageReducer<TState>>) => {
    const obj = new target();
    const initialState = obj.state;

    const handlers: Handlers = Reflect.getOwnMetadata(handlersMetadataKey, target.prototype) || {};

    const f = (state: TState = initialState, message: Message) => {
        if (message.type && handlers.hasOwnProperty(message.type)) {
            obj.state = state;
            handlers[message.type].call(obj, message);
            const newState = obj.state;
            return newState;
        }

        return state;
    };

    return f as any;
};

export const combineMessageReducers = (messageReducers: MessageReducersMapObject) => {
    const reducers: ReducersMapObject = {};
    for (const key in messageReducers) {
        reducers[key] = asReducer(messageReducers[key]);
    }

    return combineReducers(reducers);
};