# Message middleware for redux
Middleware for usage class instances as actions 

# Usage
```javascript

// Your messages
import { Message } from "./Message";

export class FetchDictionaryRequest extends Message {
    constructor(public payload: string) {
        super();
    }
}

export class FetchDictionarySuccess extends Message {
    constructor(public payload: { name: string, items: DictionaryItem[], lastUpdated: number }) {
        super();
    }
}

// Somewhere else
import { FetchDictionarySuccess, FetchDictionaryRequest } from "./Messages";
import { MessageReducer, asReducer } from "./handler";

@asReducer()
export default class DictionaryReducer implements MessageReducer {
    state: DictionaryStore = {} as any;

    @handler handleFetchDictionarySuccess(message: FetchDictionarySuccess) {
        const { name, ...rest } = message.payload;

        this.state = {
            ...this.state,
            [name]: {
                ...rest,
                isFetching: false
            }
        };
    }

    @handler handleFetchDictionaryRequest(message: FetchDictionaryRequest) {
        const name = message.payload;

        this.state = {
            ...this.state,
            [name]: {
                ...this.state[name],
                isFetching: true
            }
        };
    }
}
// Configure middleware
import {messageMiddleware} from "./messageMiddleware";
const store = createStore(
    combineReducers({
        dictionary: dictionaryReducer
    }),
    {},
    applyMiddleware(
        // your middlewares
        messageMiddleware,
    )
);
```