import { MAX_HANDLER_RETRIES } from "../ports/events/outbox/types/outbox-event.types";

export const OUTBOX_LIMITS = {
    EVENT_TYPE : {
        minLength:1,
        maxLength:100
    },
    STATUS:{
        minLength : 1,
        maxLength:100
    },
    EVENT_NAME:{
        minLength : 1,
        maxLength:100
    },
    RETRY_COUNT:{
        min:0,
        max:MAX_HANDLER_RETRIES
    },
    STACK:{
        minLength:1,
        maxLength:1001
    },
    ERROR_MESSAGE:{
        minLength:1,
        maxLength:1001
    }
}