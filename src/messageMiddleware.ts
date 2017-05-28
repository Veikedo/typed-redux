import "core-js/fn/function/name";
import * as isPlainObject from "is-plain-object";

const isPromise = val => val && typeof val.then === "function";

export const messageMiddleware = store => next => action =>
    isPlainObject(action) || typeof action == "function" || isPromise(action)
        ? next(action)
        : next({ ...action });