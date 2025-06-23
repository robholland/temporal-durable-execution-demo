var __TEMPORAL__;
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/@temporalio/common/lib/activity-options.js":
/*!*****************************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/activity-options.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ActivityCancellationType = void 0;
const type_helpers_1 = __webpack_require__(/*! ./type-helpers */ "./node_modules/@temporalio/common/lib/type-helpers.js");
// Avoid importing the proto implementation to reduce workflow bundle size
// Copied from coresdk.workflow_commands.ActivityCancellationType
var ActivityCancellationType;
(function (ActivityCancellationType) {
    ActivityCancellationType[ActivityCancellationType["TRY_CANCEL"] = 0] = "TRY_CANCEL";
    ActivityCancellationType[ActivityCancellationType["WAIT_CANCELLATION_COMPLETED"] = 1] = "WAIT_CANCELLATION_COMPLETED";
    ActivityCancellationType[ActivityCancellationType["ABANDON"] = 2] = "ABANDON";
})(ActivityCancellationType || (exports.ActivityCancellationType = ActivityCancellationType = {}));
(0, type_helpers_1.checkExtends)();
(0, type_helpers_1.checkExtends)();


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/converter/data-converter.js":
/*!*************************************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/converter/data-converter.js ***!
  \*************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.defaultDataConverter = exports.defaultFailureConverter = void 0;
const failure_converter_1 = __webpack_require__(/*! ./failure-converter */ "./node_modules/@temporalio/common/lib/converter/failure-converter.js");
const payload_converter_1 = __webpack_require__(/*! ./payload-converter */ "./node_modules/@temporalio/common/lib/converter/payload-converter.js");
/**
 * The default {@link FailureConverter} used by the SDK.
 *
 * Error messages and stack traces are serizalized as plain text.
 */
exports.defaultFailureConverter = new failure_converter_1.DefaultFailureConverter();
/**
 * A "loaded" data converter that uses the default set of failure and payload converters.
 */
exports.defaultDataConverter = {
    payloadConverter: payload_converter_1.defaultPayloadConverter,
    failureConverter: exports.defaultFailureConverter,
    payloadCodecs: [],
};


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/converter/failure-converter.js":
/*!****************************************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/converter/failure-converter.js ***!
  \****************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DefaultFailureConverter = exports.cutoffStackTrace = void 0;
const failure_1 = __webpack_require__(/*! ../failure */ "./node_modules/@temporalio/common/lib/failure.js");
const type_helpers_1 = __webpack_require__(/*! ../type-helpers */ "./node_modules/@temporalio/common/lib/type-helpers.js");
const time_1 = __webpack_require__(/*! ../time */ "./node_modules/@temporalio/common/lib/time.js");
const payload_converter_1 = __webpack_require__(/*! ./payload-converter */ "./node_modules/@temporalio/common/lib/converter/payload-converter.js");
function combineRegExp(...regexps) {
    return new RegExp(regexps.map((x) => `(?:${x.source})`).join('|'));
}
/**
 * Stack traces will be cutoff when on of these patterns is matched
 */
const CUTOFF_STACK_PATTERNS = combineRegExp(
/** Activity execution */
/\s+at Activity\.execute \(.*[\\/]worker[\\/](?:src|lib)[\\/]activity\.[jt]s:\d+:\d+\)/, 
/** Workflow activation */
/\s+at Activator\.\S+NextHandler \(.*[\\/]workflow[\\/](?:src|lib)[\\/]internals\.[jt]s:\d+:\d+\)/, 
/** Workflow run anything in context */
/\s+at Script\.runInContext \((?:node:vm|vm\.js):\d+:\d+\)/);
/**
 * Any stack trace frames that match any of those wil be dopped.
 * The "null." prefix on some cases is to avoid https://github.com/nodejs/node/issues/42417
 */
const DROPPED_STACK_FRAMES_PATTERNS = combineRegExp(
/** Internal functions used to recursively chain interceptors */
/\s+at (null\.)?next \(.*[\\/]common[\\/](?:src|lib)[\\/]interceptors\.[jt]s:\d+:\d+\)/, 
/** Internal functions used to recursively chain interceptors */
/\s+at (null\.)?executeNextHandler \(.*[\\/]worker[\\/](?:src|lib)[\\/]activity\.[jt]s:\d+:\d+\)/);
/**
 * Cuts out the framework part of a stack trace, leaving only user code entries
 */
function cutoffStackTrace(stack) {
    const lines = (stack ?? '').split(/\r?\n/);
    const acc = Array();
    for (const line of lines) {
        if (CUTOFF_STACK_PATTERNS.test(line))
            break;
        if (!DROPPED_STACK_FRAMES_PATTERNS.test(line))
            acc.push(line);
    }
    return acc.join('\n');
}
exports.cutoffStackTrace = cutoffStackTrace;
/**
 * Default, cross-language-compatible Failure converter.
 *
 * By default, it will leave error messages and stack traces as plain text. In order to encrypt them, set
 * `encodeCommonAttributes` to `true` in the constructor options and use a {@link PayloadCodec} that can encrypt /
 * decrypt Payloads in your {@link WorkerOptions.dataConverter | Worker} and
 * {@link ClientOptions.dataConverter | Client options}.
 */
class DefaultFailureConverter {
    constructor(options) {
        const { encodeCommonAttributes } = options ?? {};
        this.options = {
            encodeCommonAttributes: encodeCommonAttributes ?? false,
        };
    }
    /**
     * Converts a Failure proto message to a JS Error object.
     *
     * Does not set common properties, that is done in {@link failureToError}.
     */
    failureToErrorInner(failure, payloadConverter) {
        if (failure.applicationFailureInfo) {
            return new failure_1.ApplicationFailure(failure.message ?? undefined, failure.applicationFailureInfo.type, Boolean(failure.applicationFailureInfo.nonRetryable), (0, payload_converter_1.arrayFromPayloads)(payloadConverter, failure.applicationFailureInfo.details?.payloads), this.optionalFailureToOptionalError(failure.cause, payloadConverter));
        }
        if (failure.serverFailureInfo) {
            return new failure_1.ServerFailure(failure.message ?? undefined, Boolean(failure.serverFailureInfo.nonRetryable), this.optionalFailureToOptionalError(failure.cause, payloadConverter));
        }
        if (failure.timeoutFailureInfo) {
            return new failure_1.TimeoutFailure(failure.message ?? undefined, (0, payload_converter_1.fromPayloadsAtIndex)(payloadConverter, 0, failure.timeoutFailureInfo.lastHeartbeatDetails?.payloads), failure.timeoutFailureInfo.timeoutType ?? failure_1.TimeoutType.TIMEOUT_TYPE_UNSPECIFIED);
        }
        if (failure.terminatedFailureInfo) {
            return new failure_1.TerminatedFailure(failure.message ?? undefined, this.optionalFailureToOptionalError(failure.cause, payloadConverter));
        }
        if (failure.canceledFailureInfo) {
            return new failure_1.CancelledFailure(failure.message ?? undefined, (0, payload_converter_1.arrayFromPayloads)(payloadConverter, failure.canceledFailureInfo.details?.payloads), this.optionalFailureToOptionalError(failure.cause, payloadConverter));
        }
        if (failure.resetWorkflowFailureInfo) {
            return new failure_1.ApplicationFailure(failure.message ?? undefined, 'ResetWorkflow', false, (0, payload_converter_1.arrayFromPayloads)(payloadConverter, failure.resetWorkflowFailureInfo.lastHeartbeatDetails?.payloads), this.optionalFailureToOptionalError(failure.cause, payloadConverter));
        }
        if (failure.childWorkflowExecutionFailureInfo) {
            const { namespace, workflowType, workflowExecution, retryState } = failure.childWorkflowExecutionFailureInfo;
            if (!(workflowType?.name && workflowExecution)) {
                throw new TypeError('Missing attributes on childWorkflowExecutionFailureInfo');
            }
            return new failure_1.ChildWorkflowFailure(namespace ?? undefined, workflowExecution, workflowType.name, retryState ?? failure_1.RetryState.RETRY_STATE_UNSPECIFIED, this.optionalFailureToOptionalError(failure.cause, payloadConverter));
        }
        if (failure.activityFailureInfo) {
            if (!failure.activityFailureInfo.activityType?.name) {
                throw new TypeError('Missing activityType?.name on activityFailureInfo');
            }
            return new failure_1.ActivityFailure(failure.message ?? undefined, failure.activityFailureInfo.activityType.name, failure.activityFailureInfo.activityId ?? undefined, failure.activityFailureInfo.retryState ?? failure_1.RetryState.RETRY_STATE_UNSPECIFIED, failure.activityFailureInfo.identity ?? undefined, this.optionalFailureToOptionalError(failure.cause, payloadConverter));
        }
        return new failure_1.TemporalFailure(failure.message ?? undefined, this.optionalFailureToOptionalError(failure.cause, payloadConverter));
    }
    failureToError(failure, payloadConverter) {
        if (failure.encodedAttributes) {
            const attrs = payloadConverter.fromPayload(failure.encodedAttributes);
            // Don't apply encodedAttributes unless they conform to an expected schema
            if (typeof attrs === 'object' && attrs !== null) {
                const { message, stack_trace } = attrs;
                // Avoid mutating the argument
                failure = { ...failure };
                if (typeof message === 'string') {
                    failure.message = message;
                }
                if (typeof stack_trace === 'string') {
                    failure.stackTrace = stack_trace;
                }
            }
        }
        const err = this.failureToErrorInner(failure, payloadConverter);
        err.stack = failure.stackTrace ?? '';
        err.failure = failure;
        return err;
    }
    errorToFailure(err, payloadConverter) {
        const failure = this.errorToFailureInner(err, payloadConverter);
        if (this.options.encodeCommonAttributes) {
            const { message, stackTrace } = failure;
            failure.message = 'Encoded failure';
            failure.stackTrace = '';
            failure.encodedAttributes = payloadConverter.toPayload({ message, stack_trace: stackTrace });
        }
        return failure;
    }
    errorToFailureInner(err, payloadConverter) {
        if (err instanceof failure_1.TemporalFailure) {
            if (err.failure)
                return err.failure;
            const base = {
                message: err.message,
                stackTrace: cutoffStackTrace(err.stack),
                cause: this.optionalErrorToOptionalFailure(err.cause, payloadConverter),
                source: failure_1.FAILURE_SOURCE,
            };
            if (err instanceof failure_1.ActivityFailure) {
                return {
                    ...base,
                    activityFailureInfo: {
                        ...err,
                        activityType: { name: err.activityType },
                    },
                };
            }
            if (err instanceof failure_1.ChildWorkflowFailure) {
                return {
                    ...base,
                    childWorkflowExecutionFailureInfo: {
                        ...err,
                        workflowExecution: err.execution,
                        workflowType: { name: err.workflowType },
                    },
                };
            }
            if (err instanceof failure_1.ApplicationFailure) {
                return {
                    ...base,
                    applicationFailureInfo: {
                        type: err.type,
                        nonRetryable: err.nonRetryable,
                        details: err.details && err.details.length
                            ? { payloads: (0, payload_converter_1.toPayloads)(payloadConverter, ...err.details) }
                            : undefined,
                        nextRetryDelay: (0, time_1.msOptionalToTs)(err.nextRetryDelay),
                    },
                };
            }
            if (err instanceof failure_1.CancelledFailure) {
                return {
                    ...base,
                    canceledFailureInfo: {
                        details: err.details && err.details.length
                            ? { payloads: (0, payload_converter_1.toPayloads)(payloadConverter, ...err.details) }
                            : undefined,
                    },
                };
            }
            if (err instanceof failure_1.TimeoutFailure) {
                return {
                    ...base,
                    timeoutFailureInfo: {
                        timeoutType: err.timeoutType,
                        lastHeartbeatDetails: err.lastHeartbeatDetails
                            ? { payloads: (0, payload_converter_1.toPayloads)(payloadConverter, err.lastHeartbeatDetails) }
                            : undefined,
                    },
                };
            }
            if (err instanceof failure_1.ServerFailure) {
                return {
                    ...base,
                    serverFailureInfo: { nonRetryable: err.nonRetryable },
                };
            }
            if (err instanceof failure_1.TerminatedFailure) {
                return {
                    ...base,
                    terminatedFailureInfo: {},
                };
            }
            // Just a TemporalFailure
            return base;
        }
        const base = {
            source: failure_1.FAILURE_SOURCE,
        };
        if ((0, type_helpers_1.isError)(err)) {
            return {
                ...base,
                message: String(err.message) ?? '',
                stackTrace: cutoffStackTrace(err.stack),
                cause: this.optionalErrorToOptionalFailure(err.cause, payloadConverter),
            };
        }
        const recommendation = ` [A non-Error value was thrown from your code. We recommend throwing Error objects so that we can provide a stack trace]`;
        if (typeof err === 'string') {
            return { ...base, message: err + recommendation };
        }
        if (typeof err === 'object') {
            let message = '';
            try {
                message = JSON.stringify(err);
            }
            catch (_err) {
                message = String(err);
            }
            return { ...base, message: message + recommendation };
        }
        return { ...base, message: String(err) + recommendation };
    }
    /**
     * Converts a Failure proto message to a JS Error object if defined or returns undefined.
     */
    optionalFailureToOptionalError(failure, payloadConverter) {
        return failure ? this.failureToError(failure, payloadConverter) : undefined;
    }
    /**
     * Converts an error to a Failure proto message if defined or returns undefined
     */
    optionalErrorToOptionalFailure(err, payloadConverter) {
        return err ? this.errorToFailure(err, payloadConverter) : undefined;
    }
}
exports.DefaultFailureConverter = DefaultFailureConverter;


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/converter/payload-codec.js":
/*!************************************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/converter/payload-codec.js ***!
  \************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/converter/payload-converter.js":
/*!****************************************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/converter/payload-converter.js ***!
  \****************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.defaultPayloadConverter = exports.DefaultPayloadConverter = exports.searchAttributePayloadConverter = exports.SearchAttributePayloadConverter = exports.JsonPayloadConverter = exports.BinaryPayloadConverter = exports.UndefinedPayloadConverter = exports.CompositePayloadConverter = exports.mapFromPayloads = exports.arrayFromPayloads = exports.fromPayloadsAtIndex = exports.mapToPayloads = exports.toPayloads = void 0;
const encoding_1 = __webpack_require__(/*! ../encoding */ "./node_modules/@temporalio/common/lib/encoding.js");
const errors_1 = __webpack_require__(/*! ../errors */ "./node_modules/@temporalio/common/lib/errors.js");
const types_1 = __webpack_require__(/*! ./types */ "./node_modules/@temporalio/common/lib/converter/types.js");
/**
 * Implements conversion of a list of values.
 *
 * @param converter
 * @param values JS values to convert to Payloads
 * @return list of {@link Payload}s
 * @throws {@link ValueError} if conversion of the value passed as parameter failed for any
 *     reason.
 */
function toPayloads(converter, ...values) {
    if (values.length === 0) {
        return undefined;
    }
    return values.map((value) => converter.toPayload(value));
}
exports.toPayloads = toPayloads;
/**
 * Run {@link PayloadConverter.toPayload} on each value in the map.
 *
 * @throws {@link ValueError} if conversion of any value in the map fails
 */
function mapToPayloads(converter, map) {
    return Object.fromEntries(Object.entries(map).map(([k, v]) => [k, converter.toPayload(v)]));
}
exports.mapToPayloads = mapToPayloads;
/**
 * Implements conversion of an array of values of different types. Useful for deserializing
 * arguments of function invocations.
 *
 * @param converter
 * @param index index of the value in the payloads
 * @param payloads serialized value to convert to JS values.
 * @return converted JS value
 * @throws {@link PayloadConverterError} if conversion of the data passed as parameter failed for any
 *     reason.
 */
function fromPayloadsAtIndex(converter, index, payloads) {
    // To make adding arguments a backwards compatible change
    if (payloads === undefined || payloads === null || index >= payloads.length) {
        return undefined;
    }
    return converter.fromPayload(payloads[index]);
}
exports.fromPayloadsAtIndex = fromPayloadsAtIndex;
/**
 * Run {@link PayloadConverter.fromPayload} on each value in the array.
 */
function arrayFromPayloads(converter, payloads) {
    if (!payloads) {
        return [];
    }
    return payloads.map((payload) => converter.fromPayload(payload));
}
exports.arrayFromPayloads = arrayFromPayloads;
function mapFromPayloads(converter, map) {
    if (map == null)
        return undefined;
    return Object.fromEntries(Object.entries(map).map(([k, payload]) => {
        const value = converter.fromPayload(payload);
        return [k, value];
    }));
}
exports.mapFromPayloads = mapFromPayloads;
/**
 * Tries to convert values to {@link Payload}s using the {@link PayloadConverterWithEncoding}s provided to the constructor, in the order provided.
 *
 * Converts Payloads to values based on the `Payload.metadata.encoding` field, which matches the {@link PayloadConverterWithEncoding.encodingType}
 * of the converter that created the Payload.
 */
class CompositePayloadConverter {
    constructor(...converters) {
        this.converterByEncoding = new Map();
        if (converters.length === 0) {
            throw new errors_1.PayloadConverterError('Must provide at least one PayloadConverterWithEncoding');
        }
        this.converters = converters;
        for (const converter of converters) {
            this.converterByEncoding.set(converter.encodingType, converter);
        }
    }
    /**
     * Tries to run `.toPayload(value)` on each converter in the order provided at construction.
     * Returns the first successful result, throws {@link ValueError} if there is no converter that can handle the value.
     */
    toPayload(value) {
        for (const converter of this.converters) {
            const result = converter.toPayload(value);
            if (result !== undefined) {
                return result;
            }
        }
        throw new errors_1.ValueError(`Unable to convert ${value} to payload`);
    }
    /**
     * Run {@link PayloadConverterWithEncoding.fromPayload} based on the `encoding` metadata of the {@link Payload}.
     */
    fromPayload(payload) {
        if (payload.metadata === undefined || payload.metadata === null) {
            throw new errors_1.ValueError('Missing payload metadata');
        }
        const encoding = (0, encoding_1.decode)(payload.metadata[types_1.METADATA_ENCODING_KEY]);
        const converter = this.converterByEncoding.get(encoding);
        if (converter === undefined) {
            throw new errors_1.ValueError(`Unknown encoding: ${encoding}`);
        }
        return converter.fromPayload(payload);
    }
}
exports.CompositePayloadConverter = CompositePayloadConverter;
/**
 * Converts between JS undefined and NULL Payload
 */
class UndefinedPayloadConverter {
    constructor() {
        this.encodingType = types_1.encodingTypes.METADATA_ENCODING_NULL;
    }
    toPayload(value) {
        if (value !== undefined) {
            return undefined;
        }
        return {
            metadata: {
                [types_1.METADATA_ENCODING_KEY]: types_1.encodingKeys.METADATA_ENCODING_NULL,
            },
        };
    }
    fromPayload(_content) {
        return undefined; // Just return undefined
    }
}
exports.UndefinedPayloadConverter = UndefinedPayloadConverter;
/**
 * Converts between binary data types and RAW Payload
 */
class BinaryPayloadConverter {
    constructor() {
        this.encodingType = types_1.encodingTypes.METADATA_ENCODING_RAW;
    }
    toPayload(value) {
        if (!(value instanceof Uint8Array)) {
            return undefined;
        }
        return {
            metadata: {
                [types_1.METADATA_ENCODING_KEY]: types_1.encodingKeys.METADATA_ENCODING_RAW,
            },
            data: value,
        };
    }
    fromPayload(content) {
        return (
        // Wrap with Uint8Array from this context to ensure `instanceof` works
        (content.data ? new Uint8Array(content.data.buffer, content.data.byteOffset, content.data.length) : content.data));
    }
}
exports.BinaryPayloadConverter = BinaryPayloadConverter;
/**
 * Converts between non-undefined values and serialized JSON Payload
 */
class JsonPayloadConverter {
    constructor() {
        this.encodingType = types_1.encodingTypes.METADATA_ENCODING_JSON;
    }
    toPayload(value) {
        if (value === undefined) {
            return undefined;
        }
        let json;
        try {
            json = JSON.stringify(value);
        }
        catch (err) {
            return undefined;
        }
        return {
            metadata: {
                [types_1.METADATA_ENCODING_KEY]: types_1.encodingKeys.METADATA_ENCODING_JSON,
            },
            data: (0, encoding_1.encode)(json),
        };
    }
    fromPayload(content) {
        if (content.data === undefined || content.data === null) {
            throw new errors_1.ValueError('Got payload with no data');
        }
        return JSON.parse((0, encoding_1.decode)(content.data));
    }
}
exports.JsonPayloadConverter = JsonPayloadConverter;
/**
 * Converts Search Attribute values using JsonPayloadConverter
 */
class SearchAttributePayloadConverter {
    constructor() {
        this.jsonConverter = new JsonPayloadConverter();
        this.validNonDateTypes = ['string', 'number', 'boolean'];
    }
    toPayload(values) {
        if (!Array.isArray(values)) {
            throw new errors_1.ValueError(`SearchAttribute value must be an array`);
        }
        if (values.length > 0) {
            const firstValue = values[0];
            const firstType = typeof firstValue;
            if (firstType === 'object') {
                for (const [idx, value] of values.entries()) {
                    if (!(value instanceof Date)) {
                        throw new errors_1.ValueError(`SearchAttribute values must arrays of strings, numbers, booleans, or Dates. The value ${value} at index ${idx} is of type ${typeof value}`);
                    }
                }
            }
            else {
                if (!this.validNonDateTypes.includes(firstType)) {
                    throw new errors_1.ValueError(`SearchAttribute array values must be: string | number | boolean | Date`);
                }
                for (const [idx, value] of values.entries()) {
                    if (typeof value !== firstType) {
                        throw new errors_1.ValueError(`All SearchAttribute array values must be of the same type. The first value ${firstValue} of type ${firstType} doesn't match value ${value} of type ${typeof value} at index ${idx}`);
                    }
                }
            }
        }
        // JSON.stringify takes care of converting Dates to ISO strings
        const ret = this.jsonConverter.toPayload(values);
        if (ret === undefined) {
            throw new errors_1.ValueError('Could not convert search attributes to payloads');
        }
        return ret;
    }
    /**
     * Datetime Search Attribute values are converted to `Date`s
     */
    fromPayload(payload) {
        if (payload.metadata === undefined || payload.metadata === null) {
            throw new errors_1.ValueError('Missing payload metadata');
        }
        const value = this.jsonConverter.fromPayload(payload);
        let arrayWrappedValue = Array.isArray(value) ? value : [value];
        const searchAttributeType = (0, encoding_1.decode)(payload.metadata.type);
        if (searchAttributeType === 'Datetime') {
            arrayWrappedValue = arrayWrappedValue.map((dateString) => new Date(dateString));
        }
        return arrayWrappedValue;
    }
}
exports.SearchAttributePayloadConverter = SearchAttributePayloadConverter;
exports.searchAttributePayloadConverter = new SearchAttributePayloadConverter();
class DefaultPayloadConverter extends CompositePayloadConverter {
    // Match the order used in other SDKs, but exclude Protobuf converters so that the code, including
    // `proto3-json-serializer`, doesn't take space in Workflow bundles that don't use Protobufs. To use Protobufs, use
    // {@link DefaultPayloadConverterWithProtobufs}.
    //
    // Go SDK:
    // https://github.com/temporalio/sdk-go/blob/5e5645f0c550dcf717c095ae32c76a7087d2e985/converter/default_data_converter.go#L28
    constructor() {
        super(new UndefinedPayloadConverter(), new BinaryPayloadConverter(), new JsonPayloadConverter());
    }
}
exports.DefaultPayloadConverter = DefaultPayloadConverter;
/**
 * The default {@link PayloadConverter} used by the SDK. Supports `Uint8Array` and JSON serializables (so if
 * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#description | `JSON.stringify(yourArgOrRetval)`}
 * works, the default payload converter will work).
 *
 * To also support Protobufs, create a custom payload converter with {@link DefaultPayloadConverter}:
 *
 * `const myConverter = new DefaultPayloadConverter({ protobufRoot })`
 */
exports.defaultPayloadConverter = new DefaultPayloadConverter();


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/converter/types.js":
/*!****************************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/converter/types.js ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.METADATA_MESSAGE_TYPE_KEY = exports.encodingKeys = exports.encodingTypes = exports.METADATA_ENCODING_KEY = void 0;
const encoding_1 = __webpack_require__(/*! ../encoding */ "./node_modules/@temporalio/common/lib/encoding.js");
exports.METADATA_ENCODING_KEY = 'encoding';
exports.encodingTypes = {
    METADATA_ENCODING_NULL: 'binary/null',
    METADATA_ENCODING_RAW: 'binary/plain',
    METADATA_ENCODING_JSON: 'json/plain',
    METADATA_ENCODING_PROTOBUF_JSON: 'json/protobuf',
    METADATA_ENCODING_PROTOBUF: 'binary/protobuf',
};
exports.encodingKeys = {
    METADATA_ENCODING_NULL: (0, encoding_1.encode)(exports.encodingTypes.METADATA_ENCODING_NULL),
    METADATA_ENCODING_RAW: (0, encoding_1.encode)(exports.encodingTypes.METADATA_ENCODING_RAW),
    METADATA_ENCODING_JSON: (0, encoding_1.encode)(exports.encodingTypes.METADATA_ENCODING_JSON),
    METADATA_ENCODING_PROTOBUF_JSON: (0, encoding_1.encode)(exports.encodingTypes.METADATA_ENCODING_PROTOBUF_JSON),
    METADATA_ENCODING_PROTOBUF: (0, encoding_1.encode)(exports.encodingTypes.METADATA_ENCODING_PROTOBUF),
};
exports.METADATA_MESSAGE_TYPE_KEY = 'messageType';


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/deprecated-time.js":
/*!****************************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/deprecated-time.js ***!
  \****************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.optionalTsToDate = exports.tsToDate = exports.msToNumber = exports.msOptionalToNumber = exports.msOptionalToTs = exports.msToTs = exports.msNumberToTs = exports.tsToMs = exports.optionalTsToMs = void 0;
const time = __importStar(__webpack_require__(/*! ./time */ "./node_modules/@temporalio/common/lib/time.js"));
/**
 * Lossy conversion function from Timestamp to number due to possible overflow.
 * If ts is null or undefined returns undefined.
 *
 * @hidden
 * @deprecated - meant for internal use only
 */
function optionalTsToMs(ts) {
    return time.optionalTsToMs(ts);
}
exports.optionalTsToMs = optionalTsToMs;
/**
 * Lossy conversion function from Timestamp to number due to possible overflow
 *
 * @hidden
 * @deprecated - meant for internal use only
 * @deprecated - meant for internal use only
 */
function tsToMs(ts) {
    return time.tsToMs(ts);
}
exports.tsToMs = tsToMs;
/**
 * @hidden
 * @deprecated - meant for internal use only
 */
function msNumberToTs(millis) {
    return time.msNumberToTs(millis);
}
exports.msNumberToTs = msNumberToTs;
/**
 * @hidden
 * @deprecated - meant for internal use only
 */
function msToTs(str) {
    return time.msToTs(str);
}
exports.msToTs = msToTs;
/**
 * @hidden
 * @deprecated - meant for internal use only
 */
function msOptionalToTs(str) {
    return time.msOptionalToTs(str);
}
exports.msOptionalToTs = msOptionalToTs;
/**
 * @hidden
 * @deprecated - meant for internal use only
 */
function msOptionalToNumber(val) {
    return time.msOptionalToNumber(val);
}
exports.msOptionalToNumber = msOptionalToNumber;
/**
 * @hidden
 * @deprecated - meant for internal use only
 */
function msToNumber(val) {
    return time.msToNumber(val);
}
exports.msToNumber = msToNumber;
/**
 * @hidden
 * @deprecated - meant for internal use only
 */
function tsToDate(ts) {
    return time.tsToDate(ts);
}
exports.tsToDate = tsToDate;
/**
 * @hidden
 * @deprecated - meant for internal use only
 */
function optionalTsToDate(ts) {
    return time.optionalTsToDate(ts);
}
exports.optionalTsToDate = optionalTsToDate;


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/encoding.js":
/*!*********************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/encoding.js ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

// Pasted with modifications from: https://raw.githubusercontent.com/anonyco/FastestSmallestTextEncoderDecoder/master/EncoderDecoderTogether.src.js
/* eslint no-fallthrough: 0 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.decode = exports.encode = exports.TextEncoder = exports.TextDecoder = void 0;
const fromCharCode = String.fromCharCode;
const encoderRegexp = /[\x80-\uD7ff\uDC00-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]?/g;
const tmpBufferU16 = new Uint16Array(32);
class TextDecoder {
    decode(inputArrayOrBuffer) {
        const inputAs8 = inputArrayOrBuffer instanceof Uint8Array ? inputArrayOrBuffer : new Uint8Array(inputArrayOrBuffer);
        let resultingString = '', tmpStr = '', index = 0, nextEnd = 0, cp0 = 0, codePoint = 0, minBits = 0, cp1 = 0, pos = 0, tmp = -1;
        const len = inputAs8.length | 0;
        const lenMinus32 = (len - 32) | 0;
        // Note that tmp represents the 2nd half of a surrogate pair incase a surrogate gets divided between blocks
        for (; index < len;) {
            nextEnd = index <= lenMinus32 ? 32 : (len - index) | 0;
            for (; pos < nextEnd; index = (index + 1) | 0, pos = (pos + 1) | 0) {
                cp0 = inputAs8[index] & 0xff;
                switch (cp0 >> 4) {
                    case 15:
                        cp1 = inputAs8[(index = (index + 1) | 0)] & 0xff;
                        if (cp1 >> 6 !== 0b10 || 0b11110111 < cp0) {
                            index = (index - 1) | 0;
                            break;
                        }
                        codePoint = ((cp0 & 0b111) << 6) | (cp1 & 0b00111111);
                        minBits = 5; // 20 ensures it never passes -> all invalid replacements
                        cp0 = 0x100; //  keep track of th bit size
                    case 14:
                        cp1 = inputAs8[(index = (index + 1) | 0)] & 0xff;
                        codePoint <<= 6;
                        codePoint |= ((cp0 & 0b1111) << 6) | (cp1 & 0b00111111);
                        minBits = cp1 >> 6 === 0b10 ? (minBits + 4) | 0 : 24; // 24 ensures it never passes -> all invalid replacements
                        cp0 = (cp0 + 0x100) & 0x300; // keep track of th bit size
                    case 13:
                    case 12:
                        cp1 = inputAs8[(index = (index + 1) | 0)] & 0xff;
                        codePoint <<= 6;
                        codePoint |= ((cp0 & 0b11111) << 6) | (cp1 & 0b00111111);
                        minBits = (minBits + 7) | 0;
                        // Now, process the code point
                        if (index < len && cp1 >> 6 === 0b10 && codePoint >> minBits && codePoint < 0x110000) {
                            cp0 = codePoint;
                            codePoint = (codePoint - 0x10000) | 0;
                            if (0 <= codePoint /*0xffff < codePoint*/) {
                                // BMP code point
                                //nextEnd = nextEnd - 1|0;
                                tmp = ((codePoint >> 10) + 0xd800) | 0; // highSurrogate
                                cp0 = ((codePoint & 0x3ff) + 0xdc00) | 0; // lowSurrogate (will be inserted later in the switch-statement)
                                if (pos < 31) {
                                    // notice 31 instead of 32
                                    tmpBufferU16[pos] = tmp;
                                    pos = (pos + 1) | 0;
                                    tmp = -1;
                                }
                                else {
                                    // else, we are at the end of the inputAs8 and let tmp0 be filled in later on
                                    // NOTE that cp1 is being used as a temporary variable for the swapping of tmp with cp0
                                    cp1 = tmp;
                                    tmp = cp0;
                                    cp0 = cp1;
                                }
                            }
                            else
                                nextEnd = (nextEnd + 1) | 0; // because we are advancing i without advancing pos
                        }
                        else {
                            // invalid code point means replacing the whole thing with null replacement characters
                            cp0 >>= 8;
                            index = (index - cp0 - 1) | 0; // reset index  back to what it was before
                            cp0 = 0xfffd;
                        }
                        // Finally, reset the variables for the next go-around
                        minBits = 0;
                        codePoint = 0;
                        nextEnd = index <= lenMinus32 ? 32 : (len - index) | 0;
                    /*case 11:
                  case 10:
                  case 9:
                  case 8:
                    codePoint ? codePoint = 0 : cp0 = 0xfffd; // fill with invalid replacement character
                  case 7:
                  case 6:
                  case 5:
                  case 4:
                  case 3:
                  case 2:
                  case 1:
                  case 0:
                    tmpBufferU16[pos] = cp0;
                    continue;*/
                    default: // fill with invalid replacement character
                        tmpBufferU16[pos] = cp0;
                        continue;
                    case 11:
                    case 10:
                    case 9:
                    case 8:
                }
                tmpBufferU16[pos] = 0xfffd; // fill with invalid replacement character
            }
            tmpStr += fromCharCode(tmpBufferU16[0], tmpBufferU16[1], tmpBufferU16[2], tmpBufferU16[3], tmpBufferU16[4], tmpBufferU16[5], tmpBufferU16[6], tmpBufferU16[7], tmpBufferU16[8], tmpBufferU16[9], tmpBufferU16[10], tmpBufferU16[11], tmpBufferU16[12], tmpBufferU16[13], tmpBufferU16[14], tmpBufferU16[15], tmpBufferU16[16], tmpBufferU16[17], tmpBufferU16[18], tmpBufferU16[19], tmpBufferU16[20], tmpBufferU16[21], tmpBufferU16[22], tmpBufferU16[23], tmpBufferU16[24], tmpBufferU16[25], tmpBufferU16[26], tmpBufferU16[27], tmpBufferU16[28], tmpBufferU16[29], tmpBufferU16[30], tmpBufferU16[31]);
            if (pos < 32)
                tmpStr = tmpStr.slice(0, (pos - 32) | 0); //-(32-pos));
            if (index < len) {
                //fromCharCode.apply(0, tmpBufferU16 : Uint8Array ?  tmpBufferU16.subarray(0,pos) : tmpBufferU16.slice(0,pos));
                tmpBufferU16[0] = tmp;
                pos = ~tmp >>> 31; //tmp !== -1 ? 1 : 0;
                tmp = -1;
                if (tmpStr.length < resultingString.length)
                    continue;
            }
            else if (tmp !== -1) {
                tmpStr += fromCharCode(tmp);
            }
            resultingString += tmpStr;
            tmpStr = '';
        }
        return resultingString;
    }
}
exports.TextDecoder = TextDecoder;
//////////////////////////////////////////////////////////////////////////////////////
function encoderReplacer(nonAsciiChars) {
    // make the UTF string into a binary UTF-8 encoded string
    let point = nonAsciiChars.charCodeAt(0) | 0;
    if (0xd800 <= point) {
        if (point <= 0xdbff) {
            const nextcode = nonAsciiChars.charCodeAt(1) | 0; // defaults to 0 when NaN, causing null replacement character
            if (0xdc00 <= nextcode && nextcode <= 0xdfff) {
                //point = ((point - 0xD800)<<10) + nextcode - 0xDC00 + 0x10000|0;
                point = ((point << 10) + nextcode - 0x35fdc00) | 0;
                if (point > 0xffff)
                    return fromCharCode((0x1e /*0b11110*/ << 3) | (point >> 18), (0x2 /*0b10*/ << 6) | ((point >> 12) & 0x3f) /*0b00111111*/, (0x2 /*0b10*/ << 6) | ((point >> 6) & 0x3f) /*0b00111111*/, (0x2 /*0b10*/ << 6) | (point & 0x3f) /*0b00111111*/);
            }
            else
                point = 65533 /*0b1111111111111101*/; //return '\xEF\xBF\xBD';//fromCharCode(0xef, 0xbf, 0xbd);
        }
        else if (point <= 0xdfff) {
            point = 65533 /*0b1111111111111101*/; //return '\xEF\xBF\xBD';//fromCharCode(0xef, 0xbf, 0xbd);
        }
    }
    /*if (point <= 0x007f) return nonAsciiChars;
    else */ if (point <= 0x07ff) {
        return fromCharCode((0x6 << 5) | (point >> 6), (0x2 << 6) | (point & 0x3f));
    }
    else
        return fromCharCode((0xe /*0b1110*/ << 4) | (point >> 12), (0x2 /*0b10*/ << 6) | ((point >> 6) & 0x3f) /*0b00111111*/, (0x2 /*0b10*/ << 6) | (point & 0x3f) /*0b00111111*/);
}
class TextEncoder {
    encode(inputString) {
        // 0xc0 => 0b11000000; 0xff => 0b11111111; 0xc0-0xff => 0b11xxxxxx
        // 0x80 => 0b10000000; 0xbf => 0b10111111; 0x80-0xbf => 0b10xxxxxx
        const encodedString = inputString === void 0 ? '' : '' + inputString, len = encodedString.length | 0;
        let result = new Uint8Array(((len << 1) + 8) | 0);
        let tmpResult;
        let i = 0, pos = 0, point = 0, nextcode = 0;
        let upgradededArraySize = !Uint8Array; // normal arrays are auto-expanding
        for (i = 0; i < len; i = (i + 1) | 0, pos = (pos + 1) | 0) {
            point = encodedString.charCodeAt(i) | 0;
            if (point <= 0x007f) {
                result[pos] = point;
            }
            else if (point <= 0x07ff) {
                result[pos] = (0x6 << 5) | (point >> 6);
                result[(pos = (pos + 1) | 0)] = (0x2 << 6) | (point & 0x3f);
            }
            else {
                widenCheck: {
                    if (0xd800 <= point) {
                        if (point <= 0xdbff) {
                            nextcode = encodedString.charCodeAt((i = (i + 1) | 0)) | 0; // defaults to 0 when NaN, causing null replacement character
                            if (0xdc00 <= nextcode && nextcode <= 0xdfff) {
                                //point = ((point - 0xD800)<<10) + nextcode - 0xDC00 + 0x10000|0;
                                point = ((point << 10) + nextcode - 0x35fdc00) | 0;
                                if (point > 0xffff) {
                                    result[pos] = (0x1e /*0b11110*/ << 3) | (point >> 18);
                                    result[(pos = (pos + 1) | 0)] = (0x2 /*0b10*/ << 6) | ((point >> 12) & 0x3f) /*0b00111111*/;
                                    result[(pos = (pos + 1) | 0)] = (0x2 /*0b10*/ << 6) | ((point >> 6) & 0x3f) /*0b00111111*/;
                                    result[(pos = (pos + 1) | 0)] = (0x2 /*0b10*/ << 6) | (point & 0x3f) /*0b00111111*/;
                                    continue;
                                }
                                break widenCheck;
                            }
                            point = 65533 /*0b1111111111111101*/; //return '\xEF\xBF\xBD';//fromCharCode(0xef, 0xbf, 0xbd);
                        }
                        else if (point <= 0xdfff) {
                            point = 65533 /*0b1111111111111101*/; //return '\xEF\xBF\xBD';//fromCharCode(0xef, 0xbf, 0xbd);
                        }
                    }
                    if (!upgradededArraySize && i << 1 < pos && i << 1 < ((pos - 7) | 0)) {
                        upgradededArraySize = true;
                        tmpResult = new Uint8Array(len * 3);
                        tmpResult.set(result);
                        result = tmpResult;
                    }
                }
                result[pos] = (0xe /*0b1110*/ << 4) | (point >> 12);
                result[(pos = (pos + 1) | 0)] = (0x2 /*0b10*/ << 6) | ((point >> 6) & 0x3f) /*0b00111111*/;
                result[(pos = (pos + 1) | 0)] = (0x2 /*0b10*/ << 6) | (point & 0x3f) /*0b00111111*/;
            }
        }
        return Uint8Array ? result.subarray(0, pos) : result.slice(0, pos);
    }
    encodeInto(inputString, u8Arr) {
        const encodedString = inputString === void 0 ? '' : ('' + inputString).replace(encoderRegexp, encoderReplacer);
        let len = encodedString.length | 0, i = 0, char = 0, read = 0;
        const u8ArrLen = u8Arr.length | 0;
        const inputLength = inputString.length | 0;
        if (u8ArrLen < len)
            len = u8ArrLen;
        putChars: {
            for (; i < len; i = (i + 1) | 0) {
                char = encodedString.charCodeAt(i) | 0;
                switch (char >> 4) {
                    case 0:
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                    case 5:
                    case 6:
                    case 7:
                        read = (read + 1) | 0;
                    // extension points:
                    case 8:
                    case 9:
                    case 10:
                    case 11:
                        break;
                    case 12:
                    case 13:
                        if (((i + 1) | 0) < u8ArrLen) {
                            read = (read + 1) | 0;
                            break;
                        }
                    case 14:
                        if (((i + 2) | 0) < u8ArrLen) {
                            //if (!(char === 0xEF && encodedString.substr(i+1|0,2) === "\xBF\xBD"))
                            read = (read + 1) | 0;
                            break;
                        }
                    case 15:
                        if (((i + 3) | 0) < u8ArrLen) {
                            read = (read + 1) | 0;
                            break;
                        }
                    default:
                        break putChars;
                }
                //read = read + ((char >> 6) !== 2) |0;
                u8Arr[i] = char;
            }
        }
        return { written: i, read: inputLength < read ? inputLength : read };
    }
}
exports.TextEncoder = TextEncoder;
/**
 * Encode a UTF-8 string into a Uint8Array
 */
function encode(s) {
    return TextEncoder.prototype.encode(s);
}
exports.encode = encode;
/**
 * Decode a Uint8Array into a UTF-8 string
 */
function decode(a) {
    return TextDecoder.prototype.decode(a);
}
exports.decode = decode;


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/errors.js":
/*!*******************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/errors.js ***!
  \*******************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.NamespaceNotFoundError = exports.WorkflowNotFoundError = exports.IllegalStateError = exports.PayloadConverterError = exports.ValueError = void 0;
const type_helpers_1 = __webpack_require__(/*! ./type-helpers */ "./node_modules/@temporalio/common/lib/type-helpers.js");
/**
 * Thrown from code that receives a value that is unexpected or that it's unable to handle.
 */
let ValueError = class ValueError extends Error {
    constructor(message, cause) {
        super(message ?? undefined);
        this.cause = cause;
    }
};
exports.ValueError = ValueError;
exports.ValueError = ValueError = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('ValueError')
], ValueError);
/**
 * Thrown when a Payload Converter is misconfigured.
 */
let PayloadConverterError = class PayloadConverterError extends ValueError {
};
exports.PayloadConverterError = PayloadConverterError;
exports.PayloadConverterError = PayloadConverterError = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('PayloadConverterError')
], PayloadConverterError);
/**
 * Used in different parts of the SDK to note that something unexpected has happened.
 */
let IllegalStateError = class IllegalStateError extends Error {
};
exports.IllegalStateError = IllegalStateError;
exports.IllegalStateError = IllegalStateError = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('IllegalStateError')
], IllegalStateError);
/**
 * Thrown when a Workflow with the given Id is not known to Temporal Server.
 * It could be because:
 * - Id passed is incorrect
 * - Workflow is closed (for some calls, e.g. `terminate`)
 * - Workflow was deleted from the Server after reaching its retention limit
 */
let WorkflowNotFoundError = class WorkflowNotFoundError extends Error {
    constructor(message, workflowId, runId) {
        super(message);
        this.workflowId = workflowId;
        this.runId = runId;
    }
};
exports.WorkflowNotFoundError = WorkflowNotFoundError;
exports.WorkflowNotFoundError = WorkflowNotFoundError = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('WorkflowNotFoundError')
], WorkflowNotFoundError);
/**
 * Thrown when the specified namespace is not known to Temporal Server.
 */
let NamespaceNotFoundError = class NamespaceNotFoundError extends Error {
    constructor(namespace) {
        super(`Namespace not found: '${namespace}'`);
        this.namespace = namespace;
    }
};
exports.NamespaceNotFoundError = NamespaceNotFoundError;
exports.NamespaceNotFoundError = NamespaceNotFoundError = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('NamespaceNotFoundError')
], NamespaceNotFoundError);


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/failure.js":
/*!********************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/failure.js ***!
  \********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.rootCause = exports.ensureTemporalFailure = exports.ensureApplicationFailure = exports.WorkflowExecutionAlreadyStartedError = exports.ChildWorkflowFailure = exports.ActivityFailure = exports.TimeoutFailure = exports.TerminatedFailure = exports.CancelledFailure = exports.ApplicationFailure = exports.ServerFailure = exports.TemporalFailure = exports.RetryState = exports.TimeoutType = exports.FAILURE_SOURCE = void 0;
const type_helpers_1 = __webpack_require__(/*! ./type-helpers */ "./node_modules/@temporalio/common/lib/type-helpers.js");
exports.FAILURE_SOURCE = 'TypeScriptSDK';
// Avoid importing the proto implementation to reduce workflow bundle size
// Copied from temporal.api.enums.v1.TimeoutType
var TimeoutType;
(function (TimeoutType) {
    TimeoutType[TimeoutType["TIMEOUT_TYPE_UNSPECIFIED"] = 0] = "TIMEOUT_TYPE_UNSPECIFIED";
    TimeoutType[TimeoutType["TIMEOUT_TYPE_START_TO_CLOSE"] = 1] = "TIMEOUT_TYPE_START_TO_CLOSE";
    TimeoutType[TimeoutType["TIMEOUT_TYPE_SCHEDULE_TO_START"] = 2] = "TIMEOUT_TYPE_SCHEDULE_TO_START";
    TimeoutType[TimeoutType["TIMEOUT_TYPE_SCHEDULE_TO_CLOSE"] = 3] = "TIMEOUT_TYPE_SCHEDULE_TO_CLOSE";
    TimeoutType[TimeoutType["TIMEOUT_TYPE_HEARTBEAT"] = 4] = "TIMEOUT_TYPE_HEARTBEAT";
})(TimeoutType || (exports.TimeoutType = TimeoutType = {}));
(0, type_helpers_1.checkExtends)();
(0, type_helpers_1.checkExtends)();
// Avoid importing the proto implementation to reduce workflow bundle size
// Copied from temporal.api.enums.v1.RetryState
var RetryState;
(function (RetryState) {
    RetryState[RetryState["RETRY_STATE_UNSPECIFIED"] = 0] = "RETRY_STATE_UNSPECIFIED";
    RetryState[RetryState["RETRY_STATE_IN_PROGRESS"] = 1] = "RETRY_STATE_IN_PROGRESS";
    RetryState[RetryState["RETRY_STATE_NON_RETRYABLE_FAILURE"] = 2] = "RETRY_STATE_NON_RETRYABLE_FAILURE";
    RetryState[RetryState["RETRY_STATE_TIMEOUT"] = 3] = "RETRY_STATE_TIMEOUT";
    RetryState[RetryState["RETRY_STATE_MAXIMUM_ATTEMPTS_REACHED"] = 4] = "RETRY_STATE_MAXIMUM_ATTEMPTS_REACHED";
    RetryState[RetryState["RETRY_STATE_RETRY_POLICY_NOT_SET"] = 5] = "RETRY_STATE_RETRY_POLICY_NOT_SET";
    RetryState[RetryState["RETRY_STATE_INTERNAL_SERVER_ERROR"] = 6] = "RETRY_STATE_INTERNAL_SERVER_ERROR";
    RetryState[RetryState["RETRY_STATE_CANCEL_REQUESTED"] = 7] = "RETRY_STATE_CANCEL_REQUESTED";
})(RetryState || (exports.RetryState = RetryState = {}));
(0, type_helpers_1.checkExtends)();
(0, type_helpers_1.checkExtends)();
/**
 * Represents failures that can cross Workflow and Activity boundaries.
 *
 * **Never extend this class or any of its children.**
 *
 * The only child class you should ever throw from your code is {@link ApplicationFailure}.
 */
let TemporalFailure = class TemporalFailure extends Error {
    constructor(message, cause) {
        super(message ?? undefined);
        this.cause = cause;
    }
};
exports.TemporalFailure = TemporalFailure;
exports.TemporalFailure = TemporalFailure = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('TemporalFailure')
], TemporalFailure);
/** Exceptions originated at the Temporal service. */
let ServerFailure = class ServerFailure extends TemporalFailure {
    constructor(message, nonRetryable, cause) {
        super(message, cause);
        this.nonRetryable = nonRetryable;
    }
};
exports.ServerFailure = ServerFailure;
exports.ServerFailure = ServerFailure = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('ServerFailure')
], ServerFailure);
/**
 * `ApplicationFailure`s are used to communicate application-specific failures in Workflows and Activities.
 *
 * The {@link type} property is matched against {@link RetryPolicy.nonRetryableErrorTypes} to determine if an instance
 * of this error is retryable. Another way to avoid retrying is by setting the {@link nonRetryable} flag to `true`.
 *
 * In Workflows, if you throw a non-`ApplicationFailure`, the Workflow Task will fail and be retried. If you throw an
 * `ApplicationFailure`, the Workflow Execution will fail.
 *
 * In Activities, you can either throw an `ApplicationFailure` or another `Error` to fail the Activity Task. In the
 * latter case, the `Error` will be converted to an `ApplicationFailure`. The conversion is done as following:
 *
 * - `type` is set to `error.constructor?.name ?? error.name`
 * - `message` is set to `error.message`
 * - `nonRetryable` is set to false
 * - `details` are set to null
 * - stack trace is copied from the original error
 *
 * When an {@link https://docs.temporal.io/concepts/what-is-an-activity-execution | Activity Execution} fails, the
 * `ApplicationFailure` from the last Activity Task will be the `cause` of the {@link ActivityFailure} thrown in the
 * Workflow.
 */
let ApplicationFailure = class ApplicationFailure extends TemporalFailure {
    /**
     * Alternatively, use {@link fromError} or {@link create}.
     */
    constructor(message, type, nonRetryable, details, cause, nextRetryDelay) {
        super(message, cause);
        this.type = type;
        this.nonRetryable = nonRetryable;
        this.details = details;
        this.nextRetryDelay = nextRetryDelay;
    }
    /**
     * Create a new `ApplicationFailure` from an Error object.
     *
     * First calls {@link ensureApplicationFailure | `ensureApplicationFailure(error)`} and then overrides any fields
     * provided in `overrides`.
     */
    static fromError(error, overrides) {
        const failure = ensureApplicationFailure(error);
        Object.assign(failure, overrides);
        return failure;
    }
    /**
     * Create a new `ApplicationFailure`.
     *
     * By default, will be retryable (unless its `type` is included in {@link RetryPolicy.nonRetryableErrorTypes}).
     */
    static create(options) {
        const { message, type, nonRetryable = false, details, nextRetryDelay, cause } = options;
        return new this(message, type, nonRetryable, details, cause, nextRetryDelay);
    }
    /**
     * Get a new `ApplicationFailure` with the {@link nonRetryable} flag set to false. Note that this error will still
     * not be retried if its `type` is included in {@link RetryPolicy.nonRetryableErrorTypes}.
     *
     * @param message Optional error message
     * @param type Optional error type (used by {@link RetryPolicy.nonRetryableErrorTypes})
     * @param details Optional details about the failure. Serialized by the Worker's {@link PayloadConverter}.
     */
    static retryable(message, type, ...details) {
        return new this(message, type ?? 'Error', false, details);
    }
    /**
     * Get a new `ApplicationFailure` with the {@link nonRetryable} flag set to true.
     *
     * When thrown from an Activity or Workflow, the Activity or Workflow will not be retried (even if `type` is not
     * listed in {@link RetryPolicy.nonRetryableErrorTypes}).
     *
     * @param message Optional error message
     * @param type Optional error type
     * @param details Optional details about the failure. Serialized by the Worker's {@link PayloadConverter}.
     */
    static nonRetryable(message, type, ...details) {
        return new this(message, type ?? 'Error', true, details);
    }
};
exports.ApplicationFailure = ApplicationFailure;
exports.ApplicationFailure = ApplicationFailure = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('ApplicationFailure')
], ApplicationFailure);
/**
 * This error is thrown when Cancellation has been requested. To allow Cancellation to happen, let it propagate. To
 * ignore Cancellation, catch it and continue executing. Note that Cancellation can only be requested a single time, so
 * your Workflow/Activity Execution will not receive further Cancellation requests.
 *
 * When a Workflow or Activity has been successfully cancelled, a `CancelledFailure` will be the `cause`.
 */
let CancelledFailure = class CancelledFailure extends TemporalFailure {
    constructor(message, details = [], cause) {
        super(message, cause);
        this.details = details;
    }
};
exports.CancelledFailure = CancelledFailure;
exports.CancelledFailure = CancelledFailure = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('CancelledFailure')
], CancelledFailure);
/**
 * Used as the `cause` when a Workflow has been terminated
 */
let TerminatedFailure = class TerminatedFailure extends TemporalFailure {
    constructor(message, cause) {
        super(message, cause);
    }
};
exports.TerminatedFailure = TerminatedFailure;
exports.TerminatedFailure = TerminatedFailure = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('TerminatedFailure')
], TerminatedFailure);
/**
 * Used to represent timeouts of Activities and Workflows
 */
let TimeoutFailure = class TimeoutFailure extends TemporalFailure {
    constructor(message, lastHeartbeatDetails, timeoutType) {
        super(message);
        this.lastHeartbeatDetails = lastHeartbeatDetails;
        this.timeoutType = timeoutType;
    }
};
exports.TimeoutFailure = TimeoutFailure;
exports.TimeoutFailure = TimeoutFailure = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('TimeoutFailure')
], TimeoutFailure);
/**
 * Contains information about an Activity failure. Always contains the original reason for the failure as its `cause`.
 * For example, if an Activity timed out, the cause will be a {@link TimeoutFailure}.
 *
 * This exception is expected to be thrown only by the framework code.
 */
let ActivityFailure = class ActivityFailure extends TemporalFailure {
    constructor(message, activityType, activityId, retryState, identity, cause) {
        super(message, cause);
        this.activityType = activityType;
        this.activityId = activityId;
        this.retryState = retryState;
        this.identity = identity;
    }
};
exports.ActivityFailure = ActivityFailure;
exports.ActivityFailure = ActivityFailure = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('ActivityFailure')
], ActivityFailure);
/**
 * Contains information about a Child Workflow failure. Always contains the reason for the failure as its {@link cause}.
 * For example, if the Child was Terminated, the `cause` is a {@link TerminatedFailure}.
 *
 * This exception is expected to be thrown only by the framework code.
 */
let ChildWorkflowFailure = class ChildWorkflowFailure extends TemporalFailure {
    constructor(namespace, execution, workflowType, retryState, cause) {
        super('Child Workflow execution failed', cause);
        this.namespace = namespace;
        this.execution = execution;
        this.workflowType = workflowType;
        this.retryState = retryState;
    }
};
exports.ChildWorkflowFailure = ChildWorkflowFailure;
exports.ChildWorkflowFailure = ChildWorkflowFailure = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('ChildWorkflowFailure')
], ChildWorkflowFailure);
/**
 * This exception is thrown in the following cases:
 *  - Workflow with the same Workflow Id is currently running
 *  - There is a closed Workflow with the same Workflow Id and the {@link WorkflowOptions.workflowIdReusePolicy}
 *    is `WORKFLOW_ID_REUSE_POLICY_REJECT_DUPLICATE`
 *  - There is closed Workflow in the `Completed` state with the same Workflow Id and the {@link WorkflowOptions.workflowIdReusePolicy}
 *    is `WORKFLOW_ID_REUSE_POLICY_ALLOW_DUPLICATE_FAILED_ONLY`
 */
let WorkflowExecutionAlreadyStartedError = class WorkflowExecutionAlreadyStartedError extends TemporalFailure {
    constructor(message, workflowId, workflowType) {
        super(message);
        this.workflowId = workflowId;
        this.workflowType = workflowType;
    }
};
exports.WorkflowExecutionAlreadyStartedError = WorkflowExecutionAlreadyStartedError;
exports.WorkflowExecutionAlreadyStartedError = WorkflowExecutionAlreadyStartedError = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('WorkflowExecutionAlreadyStartedError')
], WorkflowExecutionAlreadyStartedError);
/**
 * If `error` is already an `ApplicationFailure`, returns `error`.
 *
 * Otherwise, converts `error` into an `ApplicationFailure` with:
 *
 * - `message`: `error.message` or `String(error)`
 * - `type`: `error.constructor.name` or `error.name`
 * - `stack`: `error.stack` or `''`
 */
function ensureApplicationFailure(error) {
    if (error instanceof ApplicationFailure) {
        return error;
    }
    const message = ((0, type_helpers_1.isRecord)(error) && String(error.message)) || String(error);
    const type = ((0, type_helpers_1.isRecord)(error) && (error.constructor?.name ?? error.name)) || undefined;
    const failure = ApplicationFailure.create({ message, type, nonRetryable: false });
    failure.stack = ((0, type_helpers_1.isRecord)(error) && String(error.stack)) || '';
    return failure;
}
exports.ensureApplicationFailure = ensureApplicationFailure;
/**
 * If `err` is an Error it is turned into an `ApplicationFailure`.
 *
 * If `err` was already a `TemporalFailure`, returns the original error.
 *
 * Otherwise returns an `ApplicationFailure` with `String(err)` as the message.
 */
function ensureTemporalFailure(err) {
    if (err instanceof TemporalFailure) {
        return err;
    }
    return ensureApplicationFailure(err);
}
exports.ensureTemporalFailure = ensureTemporalFailure;
/**
 * Get the root cause message of given `error`.
 *
 * In case `error` is a {@link TemporalFailure}, recurse the `cause` chain and return the root `cause.message`.
 * Otherwise, return `error.message`.
 */
function rootCause(error) {
    if (error instanceof TemporalFailure) {
        return error.cause ? rootCause(error.cause) : error.message;
    }
    return (0, type_helpers_1.errorMessage)(error);
}
exports.rootCause = rootCause;


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/index.js":
/*!******************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/index.js ***!
  \******************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

/**
 * Common library for code that's used across the Client, Worker, and/or Workflow
 *
 * @module
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.errorCode = exports.errorMessage = exports.str = exports.u8 = void 0;
const encoding = __importStar(__webpack_require__(/*! ./encoding */ "./node_modules/@temporalio/common/lib/encoding.js"));
const helpers = __importStar(__webpack_require__(/*! ./type-helpers */ "./node_modules/@temporalio/common/lib/type-helpers.js"));
__exportStar(__webpack_require__(/*! ./activity-options */ "./node_modules/@temporalio/common/lib/activity-options.js"), exports);
__exportStar(__webpack_require__(/*! ./converter/data-converter */ "./node_modules/@temporalio/common/lib/converter/data-converter.js"), exports);
__exportStar(__webpack_require__(/*! ./converter/failure-converter */ "./node_modules/@temporalio/common/lib/converter/failure-converter.js"), exports);
__exportStar(__webpack_require__(/*! ./converter/payload-codec */ "./node_modules/@temporalio/common/lib/converter/payload-codec.js"), exports);
__exportStar(__webpack_require__(/*! ./converter/payload-converter */ "./node_modules/@temporalio/common/lib/converter/payload-converter.js"), exports);
__exportStar(__webpack_require__(/*! ./converter/types */ "./node_modules/@temporalio/common/lib/converter/types.js"), exports);
__exportStar(__webpack_require__(/*! ./deprecated-time */ "./node_modules/@temporalio/common/lib/deprecated-time.js"), exports);
__exportStar(__webpack_require__(/*! ./errors */ "./node_modules/@temporalio/common/lib/errors.js"), exports);
__exportStar(__webpack_require__(/*! ./failure */ "./node_modules/@temporalio/common/lib/failure.js"), exports);
__exportStar(__webpack_require__(/*! ./interfaces */ "./node_modules/@temporalio/common/lib/interfaces.js"), exports);
__exportStar(__webpack_require__(/*! ./logger */ "./node_modules/@temporalio/common/lib/logger.js"), exports);
__exportStar(__webpack_require__(/*! ./retry-policy */ "./node_modules/@temporalio/common/lib/retry-policy.js"), exports);
__exportStar(__webpack_require__(/*! ./workflow-handle */ "./node_modules/@temporalio/common/lib/workflow-handle.js"), exports);
__exportStar(__webpack_require__(/*! ./workflow-options */ "./node_modules/@temporalio/common/lib/workflow-options.js"), exports);
__exportStar(__webpack_require__(/*! ./versioning-intent */ "./node_modules/@temporalio/common/lib/versioning-intent.js"), exports);
/**
 * Encode a UTF-8 string into a Uint8Array
 *
 * @hidden
 * @deprecated - meant for internal use only
 */
function u8(s) {
    return encoding.encode(s);
}
exports.u8 = u8;
/**
 * Decode a Uint8Array into a UTF-8 string
 *
 * @hidden
 * @deprecated - meant for internal use only
 */
function str(arr) {
    return encoding.decode(arr);
}
exports.str = str;
/**
 * Get `error.message` (or `undefined` if not present)
 *
 * @hidden
 * @deprecated - meant for internal use only
 */
function errorMessage(error) {
    return helpers.errorMessage(error);
}
exports.errorMessage = errorMessage;
/**
 * Get `error.code` (or `undefined` if not present)
 *
 * @hidden
 * @deprecated - meant for internal use only
 */
function errorCode(error) {
    return helpers.errorCode(error);
}
exports.errorCode = errorCode;


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/interceptors.js":
/*!*************************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/interceptors.js ***!
  \*************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.composeInterceptors = void 0;
/**
 * Compose all interceptor methods into a single function.
 *
 * Calling the composed function results in calling each of the provided interceptor, in order (from the first to
 * the last), followed by the original function provided as argument to `composeInterceptors()`.
 *
 * @param interceptors a list of interceptors
 * @param method the name of the interceptor method to compose
 * @param next the original function to be executed at the end of the interception chain
 */
// ts-prune-ignore-next (imported via lib/interceptors)
function composeInterceptors(interceptors, method, next) {
    for (let i = interceptors.length - 1; i >= 0; --i) {
        const interceptor = interceptors[i];
        if (interceptor[method] !== undefined) {
            const prev = next;
            // We lose type safety here because Typescript can't deduce that interceptor[method] is a function that returns
            // the same type as Next<I, M>
            next = ((input) => interceptor[method](input, prev));
        }
    }
    return next;
}
exports.composeInterceptors = composeInterceptors;


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/interfaces.js":
/*!***********************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/interfaces.js ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HandlerUnfinishedPolicy = void 0;
/**
 * Policy defining actions taken when a workflow exits while update or signal handlers are running.
 * The workflow exit may be due to successful return, failure, cancellation, or continue-as-new.
 */
var HandlerUnfinishedPolicy;
(function (HandlerUnfinishedPolicy) {
    /**
     * Issue a warning in addition to abandoning the handler execution. The warning will not be issued if the workflow fails.
     */
    HandlerUnfinishedPolicy[HandlerUnfinishedPolicy["WARN_AND_ABANDON"] = 1] = "WARN_AND_ABANDON";
    /**
     * Abandon the handler execution.
     *
     * In the case of an update handler this means that the client will receive an error rather than
     * the update result.
     */
    HandlerUnfinishedPolicy[HandlerUnfinishedPolicy["ABANDON"] = 2] = "ABANDON";
})(HandlerUnfinishedPolicy || (exports.HandlerUnfinishedPolicy = HandlerUnfinishedPolicy = {}));


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/logger.js":
/*!*******************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/logger.js ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SdkComponent = void 0;
/**
 * Possible values of the `sdkComponent` meta attributes on log messages. This
 * attribute indicates which subsystem emitted the log message; this may for
 * example be used to implement fine-grained filtering of log messages.
 *
 * Note that there is no guarantee that this list will remain stable in the
 * future; values may be added or removed, and messages that are currently
 * emitted with some `sdkComponent` value may use a different value in the future.
 */
var SdkComponent;
(function (SdkComponent) {
    /**
     * Component name for messages emited from Workflow code, using the {@link Workflow context logger|workflow.log}.
     * The SDK itself never publishes messages with this component name.
     */
    SdkComponent["workflow"] = "workflow";
    /**
     * Component name for messages emited from an activity, using the {@link activity context logger|Context.log}.
     * The SDK itself never publishes messages with this component name.
     */
    SdkComponent["activity"] = "activity";
    /**
     * Component name for messages emited from a Temporal Worker instance.
     *
     * This notably includes:
     * - Issues with Worker or runtime configuration, or the JS execution environment;
     * - Worker's, Activity's, and Workflow's lifecycle events;
     * - Workflow Activation and Activity Task processing events;
     * - Workflow bundling messages;
     * - Sink processing issues.
     */
    SdkComponent["worker"] = "worker";
    /**
     * Component name for all messages emitted by the Rust Core SDK library.
     */
    SdkComponent["core"] = "core";
})(SdkComponent || (exports.SdkComponent = SdkComponent = {}));


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/retry-policy.js":
/*!*************************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/retry-policy.js ***!
  \*************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.decompileRetryPolicy = exports.compileRetryPolicy = void 0;
const errors_1 = __webpack_require__(/*! ./errors */ "./node_modules/@temporalio/common/lib/errors.js");
const time_1 = __webpack_require__(/*! ./time */ "./node_modules/@temporalio/common/lib/time.js");
/**
 * Turn a TS RetryPolicy into a proto compatible RetryPolicy
 */
function compileRetryPolicy(retryPolicy) {
    if (retryPolicy.backoffCoefficient != null && retryPolicy.backoffCoefficient <= 0) {
        throw new errors_1.ValueError('RetryPolicy.backoffCoefficient must be greater than 0');
    }
    if (retryPolicy.maximumAttempts != null) {
        if (retryPolicy.maximumAttempts === Number.POSITIVE_INFINITY) {
            // drop field (Infinity is the default)
            const { maximumAttempts: _, ...without } = retryPolicy;
            retryPolicy = without;
        }
        else if (retryPolicy.maximumAttempts <= 0) {
            throw new errors_1.ValueError('RetryPolicy.maximumAttempts must be a positive integer');
        }
        else if (!Number.isInteger(retryPolicy.maximumAttempts)) {
            throw new errors_1.ValueError('RetryPolicy.maximumAttempts must be an integer');
        }
    }
    const maximumInterval = (0, time_1.msOptionalToNumber)(retryPolicy.maximumInterval);
    const initialInterval = (0, time_1.msToNumber)(retryPolicy.initialInterval ?? 1000);
    if (maximumInterval === 0) {
        throw new errors_1.ValueError('RetryPolicy.maximumInterval cannot be 0');
    }
    if (initialInterval === 0) {
        throw new errors_1.ValueError('RetryPolicy.initialInterval cannot be 0');
    }
    if (maximumInterval != null && maximumInterval < initialInterval) {
        throw new errors_1.ValueError('RetryPolicy.maximumInterval cannot be less than its initialInterval');
    }
    return {
        maximumAttempts: retryPolicy.maximumAttempts,
        initialInterval: (0, time_1.msToTs)(initialInterval),
        maximumInterval: (0, time_1.msOptionalToTs)(maximumInterval),
        backoffCoefficient: retryPolicy.backoffCoefficient,
        nonRetryableErrorTypes: retryPolicy.nonRetryableErrorTypes,
    };
}
exports.compileRetryPolicy = compileRetryPolicy;
/**
 * Turn a proto compatible RetryPolicy into a TS RetryPolicy
 */
function decompileRetryPolicy(retryPolicy) {
    if (!retryPolicy) {
        return undefined;
    }
    return {
        backoffCoefficient: retryPolicy.backoffCoefficient ?? undefined,
        maximumAttempts: retryPolicy.maximumAttempts ?? undefined,
        maximumInterval: (0, time_1.optionalTsToMs)(retryPolicy.maximumInterval),
        initialInterval: (0, time_1.optionalTsToMs)(retryPolicy.initialInterval),
        nonRetryableErrorTypes: retryPolicy.nonRetryableErrorTypes ?? undefined,
    };
}
exports.decompileRetryPolicy = decompileRetryPolicy;


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/time.js":
/*!*****************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/time.js ***!
  \*****************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.optionalDateToTs = exports.optionalTsToDate = exports.requiredTsToDate = exports.tsToDate = exports.msToNumber = exports.msOptionalToNumber = exports.msOptionalToTs = exports.msToTs = exports.msNumberToTs = exports.tsToMs = exports.requiredTsToMs = exports.optionalTsToMs = void 0;
const long_1 = __importDefault(__webpack_require__(/*! long */ "./node_modules/long/umd/index.js")); // eslint-disable-line import/no-named-as-default
const ms_1 = __importDefault(__webpack_require__(/*! ms */ "./node_modules/@temporalio/common/node_modules/ms/dist/index.cjs"));
const errors_1 = __webpack_require__(/*! ./errors */ "./node_modules/@temporalio/common/lib/errors.js");
/**
 * Lossy conversion function from Timestamp to number due to possible overflow.
 * If ts is null or undefined returns undefined.
 */
function optionalTsToMs(ts) {
    if (ts === undefined || ts === null) {
        return undefined;
    }
    return tsToMs(ts);
}
exports.optionalTsToMs = optionalTsToMs;
/**
 * Lossy conversion function from Timestamp to number due to possible overflow.
 * If ts is null or undefined, throws a TypeError, with error message including the name of the field.
 */
function requiredTsToMs(ts, fieldName) {
    if (ts === undefined || ts === null) {
        throw new TypeError(`Expected ${fieldName} to be a timestamp, got ${ts}`);
    }
    return tsToMs(ts);
}
exports.requiredTsToMs = requiredTsToMs;
/**
 * Lossy conversion function from Timestamp to number due to possible overflow
 */
function tsToMs(ts) {
    if (ts === undefined || ts === null) {
        throw new Error(`Expected timestamp, got ${ts}`);
    }
    const { seconds, nanos } = ts;
    return (seconds || long_1.default.UZERO)
        .mul(1000)
        .add(Math.floor((nanos || 0) / 1000000))
        .toNumber();
}
exports.tsToMs = tsToMs;
function msNumberToTs(millis) {
    const seconds = Math.floor(millis / 1000);
    const nanos = (millis % 1000) * 1000000;
    if (Number.isNaN(seconds) || Number.isNaN(nanos)) {
        throw new errors_1.ValueError(`Invalid millis ${millis}`);
    }
    return { seconds: long_1.default.fromNumber(seconds), nanos };
}
exports.msNumberToTs = msNumberToTs;
function msToTs(str) {
    return msNumberToTs(msToNumber(str));
}
exports.msToTs = msToTs;
function msOptionalToTs(str) {
    return str ? msToTs(str) : undefined;
}
exports.msOptionalToTs = msOptionalToTs;
function msOptionalToNumber(val) {
    if (val === undefined)
        return undefined;
    return msToNumber(val);
}
exports.msOptionalToNumber = msOptionalToNumber;
function msToNumber(val) {
    if (typeof val === 'number') {
        return val;
    }
    return msWithValidation(val);
}
exports.msToNumber = msToNumber;
function msWithValidation(str) {
    const millis = (0, ms_1.default)(str);
    if (millis == null || isNaN(millis)) {
        throw new TypeError(`Invalid duration string: '${str}'`);
    }
    return millis;
}
function tsToDate(ts) {
    return new Date(tsToMs(ts));
}
exports.tsToDate = tsToDate;
// ts-prune-ignore-next
function requiredTsToDate(ts, fieldName) {
    return new Date(requiredTsToMs(ts, fieldName));
}
exports.requiredTsToDate = requiredTsToDate;
function optionalTsToDate(ts) {
    if (ts === undefined || ts === null) {
        return undefined;
    }
    return new Date(tsToMs(ts));
}
exports.optionalTsToDate = optionalTsToDate;
// ts-prune-ignore-next (imported via schedule-helpers.ts)
function optionalDateToTs(date) {
    if (date === undefined || date === null) {
        return undefined;
    }
    return msToTs(date.getTime());
}
exports.optionalDateToTs = optionalDateToTs;


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/type-helpers.js":
/*!*************************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/type-helpers.js ***!
  \*************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.deepFreeze = exports.SymbolBasedInstanceOfError = exports.assertNever = exports.errorCode = exports.errorMessage = exports.isAbortError = exports.isError = exports.hasOwnProperties = exports.hasOwnProperty = exports.isRecord = exports.checkExtends = void 0;
/** Verify that an type _Copy extends _Orig */
function checkExtends() {
    // noop, just type check
}
exports.checkExtends = checkExtends;
function isRecord(value) {
    return typeof value === 'object' && value !== null;
}
exports.isRecord = isRecord;
function hasOwnProperty(record, prop) {
    return prop in record;
}
exports.hasOwnProperty = hasOwnProperty;
function hasOwnProperties(record, props) {
    return props.every((prop) => prop in record);
}
exports.hasOwnProperties = hasOwnProperties;
function isError(error) {
    return (isRecord(error) &&
        typeof error.name === 'string' &&
        typeof error.message === 'string' &&
        (error.stack == null || typeof error.stack === 'string'));
}
exports.isError = isError;
function isAbortError(error) {
    return isError(error) && error.name === 'AbortError';
}
exports.isAbortError = isAbortError;
/**
 * Get `error.message` (or `undefined` if not present)
 */
function errorMessage(error) {
    if (isError(error)) {
        return error.message;
    }
    else if (typeof error === 'string') {
        return error;
    }
    return undefined;
}
exports.errorMessage = errorMessage;
function isErrorWithCode(error) {
    return isRecord(error) && typeof error.code === 'string';
}
/**
 * Get `error.code` (or `undefined` if not present)
 */
function errorCode(error) {
    if (isErrorWithCode(error)) {
        return error.code;
    }
    return undefined;
}
exports.errorCode = errorCode;
/**
 * Asserts that some type is the never type
 */
function assertNever(msg, x) {
    throw new TypeError(msg + ': ' + x);
}
exports.assertNever = assertNever;
/**
 * A decorator to be used on error classes. It adds the 'name' property AND provides a custom
 * 'instanceof' handler that works correctly across execution contexts.
 *
 * ### Details ###
 *
 * According to the EcmaScript's spec, the default behavior of JavaScript's `x instanceof Y` operator is to walk up the
 * prototype chain of object 'x', checking if any constructor in that hierarchy is _exactly the same object_ as the
 * constructor function 'Y'.
 *
 * Unfortunately, it happens in various situations that different constructor function objects get created for what
 * appears to be the very same class. This leads to surprising behavior where `instanceof` returns false though it is
 * known that the object is indeed an instance of that class. One particular case where this happens is when constructor
 * 'Y' belongs to a different realm than the constuctor with which 'x' was instantiated. Another case is when two copies
 * of the same library gets loaded in the same realm.
 *
 * In practice, this tends to cause issues when crossing the workflow-sandboxing boundary (since Node's vm module
 * really creates new execution realms), as well as when running tests using Jest (see https://github.com/jestjs/jest/issues/2549
 * for some details on that one).
 *
 * This function injects a custom 'instanceof' handler into the prototype of 'clazz', which is both cross-realm safe and
 * cross-copies-of-the-same-lib safe. It works by adding a special symbol property to the prototype of 'clazz', and then
 * checking for the presence of that symbol.
 */
function SymbolBasedInstanceOfError(markerName) {
    return (clazz) => {
        const marker = Symbol.for(`__temporal_is${markerName}`);
        Object.defineProperty(clazz.prototype, 'name', { value: markerName, enumerable: true });
        Object.defineProperty(clazz.prototype, marker, { value: true, enumerable: false });
        Object.defineProperty(clazz, Symbol.hasInstance, {
            // eslint-disable-next-line object-shorthand
            value: function (error) {
                if (this === clazz) {
                    return isRecord(error) && error[marker] === true;
                }
                else {
                    // 'this' must be a _subclass_ of clazz that doesn't redefined [Symbol.hasInstance], so that it inherited
                    // from clazz's [Symbol.hasInstance]. If we don't handle this particular situation, then
                    // `x instanceof SubclassOfParent` would return true for any instance of 'Parent', which is clearly wrong.
                    //
                    // Ideally, it'd be preferable to avoid this case entirely, by making sure that all subclasses of 'clazz'
                    // redefine [Symbol.hasInstance], but we can't enforce that. We therefore fallback to the default instanceof
                    // behavior (which is NOT cross-realm safe).
                    return this.prototype.isPrototypeOf(error); // eslint-disable-line no-prototype-builtins
                }
            },
        });
    };
}
exports.SymbolBasedInstanceOfError = SymbolBasedInstanceOfError;
// Thanks MDN: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze
function deepFreeze(object) {
    // Retrieve the property names defined on object
    const propNames = Object.getOwnPropertyNames(object);
    // Freeze properties before freezing self
    for (const name of propNames) {
        const value = object[name];
        if (value && typeof value === 'object') {
            try {
                deepFreeze(value);
            }
            catch (err) {
                // This is okay, there are some typed arrays that cannot be frozen (encodingKeys)
            }
        }
        else if (typeof value === 'function') {
            Object.freeze(value);
        }
    }
    return Object.freeze(object);
}
exports.deepFreeze = deepFreeze;


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/versioning-intent-enum.js":
/*!***********************************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/versioning-intent-enum.js ***!
  \***********************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.versioningIntentToProto = exports.VersioningIntent = void 0;
const type_helpers_1 = __webpack_require__(/*! ./type-helpers */ "./node_modules/@temporalio/common/lib/type-helpers.js");
// Avoid importing the proto implementation to reduce workflow bundle size
// Copied from coresdk.common.VersioningIntent
/**
 * Protobuf enum representation of {@link VersioningIntentString}.
 *
 * @experimental
 */
var VersioningIntent;
(function (VersioningIntent) {
    VersioningIntent[VersioningIntent["UNSPECIFIED"] = 0] = "UNSPECIFIED";
    VersioningIntent[VersioningIntent["COMPATIBLE"] = 1] = "COMPATIBLE";
    VersioningIntent[VersioningIntent["DEFAULT"] = 2] = "DEFAULT";
})(VersioningIntent || (exports.VersioningIntent = VersioningIntent = {}));
(0, type_helpers_1.checkExtends)();
(0, type_helpers_1.checkExtends)();
function versioningIntentToProto(intent) {
    switch (intent) {
        case 'DEFAULT':
            return VersioningIntent.DEFAULT;
        case 'COMPATIBLE':
            return VersioningIntent.COMPATIBLE;
        case undefined:
            return VersioningIntent.UNSPECIFIED;
        default:
            (0, type_helpers_1.assertNever)('Unexpected VersioningIntent', intent);
    }
}
exports.versioningIntentToProto = versioningIntentToProto;


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/versioning-intent.js":
/*!******************************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/versioning-intent.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/workflow-handle.js":
/*!****************************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/workflow-handle.js ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/workflow-options.js":
/*!*****************************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/workflow-options.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.extractWorkflowType = exports.WorkflowIdReusePolicy = void 0;
const type_helpers_1 = __webpack_require__(/*! ./type-helpers */ "./node_modules/@temporalio/common/lib/type-helpers.js");
// Avoid importing the proto implementation to reduce workflow bundle size
// Copied from temporal.api.enums.v1.WorkflowIdReusePolicy
/**
 * Concept: {@link https://docs.temporal.io/concepts/what-is-a-workflow-id-reuse-policy/ | Workflow Id Reuse Policy}
 *
 * Whether a Workflow can be started with a Workflow Id of a Closed Workflow.
 *
 * *Note: A Workflow can never be started with a Workflow Id of a Running Workflow.*
 */
var WorkflowIdReusePolicy;
(function (WorkflowIdReusePolicy) {
    /**
     * No need to use this.
     *
     * (If a `WorkflowIdReusePolicy` is set to this, or is not set at all, the default value will be used.)
     */
    WorkflowIdReusePolicy[WorkflowIdReusePolicy["WORKFLOW_ID_REUSE_POLICY_UNSPECIFIED"] = 0] = "WORKFLOW_ID_REUSE_POLICY_UNSPECIFIED";
    /**
     * The Workflow can be started if the previous Workflow is in a Closed state.
     * @default
     */
    WorkflowIdReusePolicy[WorkflowIdReusePolicy["WORKFLOW_ID_REUSE_POLICY_ALLOW_DUPLICATE"] = 1] = "WORKFLOW_ID_REUSE_POLICY_ALLOW_DUPLICATE";
    /**
     * The Workflow can be started if the previous Workflow is in a Closed state that is not Completed.
     */
    WorkflowIdReusePolicy[WorkflowIdReusePolicy["WORKFLOW_ID_REUSE_POLICY_ALLOW_DUPLICATE_FAILED_ONLY"] = 2] = "WORKFLOW_ID_REUSE_POLICY_ALLOW_DUPLICATE_FAILED_ONLY";
    /**
     * The Workflow cannot be started.
     */
    WorkflowIdReusePolicy[WorkflowIdReusePolicy["WORKFLOW_ID_REUSE_POLICY_REJECT_DUPLICATE"] = 3] = "WORKFLOW_ID_REUSE_POLICY_REJECT_DUPLICATE";
    /**
     * Terminate the current workflow if one is already running.
     */
    WorkflowIdReusePolicy[WorkflowIdReusePolicy["WORKFLOW_ID_REUSE_POLICY_TERMINATE_IF_RUNNING"] = 4] = "WORKFLOW_ID_REUSE_POLICY_TERMINATE_IF_RUNNING";
})(WorkflowIdReusePolicy || (exports.WorkflowIdReusePolicy = WorkflowIdReusePolicy = {}));
(0, type_helpers_1.checkExtends)();
(0, type_helpers_1.checkExtends)();
function extractWorkflowType(workflowTypeOrFunc) {
    if (typeof workflowTypeOrFunc === 'string')
        return workflowTypeOrFunc;
    if (typeof workflowTypeOrFunc === 'function') {
        if (workflowTypeOrFunc?.name)
            return workflowTypeOrFunc.name;
        throw new TypeError('Invalid workflow type: the workflow function is anonymous');
    }
    throw new TypeError(`Invalid workflow type: expected either a string or a function, got '${typeof workflowTypeOrFunc}'`);
}
exports.extractWorkflowType = extractWorkflowType;


/***/ }),

/***/ "./node_modules/@temporalio/workflow/lib/alea.js":
/*!*******************************************************!*\
  !*** ./node_modules/@temporalio/workflow/lib/alea.js ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

// A port of an algorithm by Johannes Baagøe <baagoe@baagoe.com>, 2010
// http://baagoe.com/en/RandomMusings/javascript/
// https://github.com/nquinlan/better-random-numbers-for-javascript-mirror
// Original work is under MIT license -
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Mash = exports.alea = void 0;
// Copyright (C) 2010 by Johannes Baagøe <baagoe@baagoe.org>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
// Taken and modified from https://github.com/davidbau/seedrandom/blob/released/lib/alea.js
class Alea {
    constructor(seed) {
        const mash = new Mash();
        // Apply the seeding algorithm from Baagoe.
        this.c = 1;
        this.s0 = mash.mash([32]);
        this.s1 = mash.mash([32]);
        this.s2 = mash.mash([32]);
        this.s0 -= mash.mash(seed);
        if (this.s0 < 0) {
            this.s0 += 1;
        }
        this.s1 -= mash.mash(seed);
        if (this.s1 < 0) {
            this.s1 += 1;
        }
        this.s2 -= mash.mash(seed);
        if (this.s2 < 0) {
            this.s2 += 1;
        }
    }
    next() {
        const t = 2091639 * this.s0 + this.c * 2.3283064365386963e-10; // 2^-32
        this.s0 = this.s1;
        this.s1 = this.s2;
        return (this.s2 = t - (this.c = t | 0));
    }
}
function alea(seed) {
    const xg = new Alea(seed);
    return xg.next.bind(xg);
}
exports.alea = alea;
class Mash {
    constructor() {
        this.n = 0xefc8249d;
    }
    mash(data) {
        let { n } = this;
        for (let i = 0; i < data.length; i++) {
            n += data[i];
            let h = 0.02519603282416938 * n;
            n = h >>> 0;
            h -= n;
            h *= n;
            n = h >>> 0;
            h -= n;
            n += h * 0x100000000; // 2^32
        }
        this.n = n;
        return (n >>> 0) * 2.3283064365386963e-10; // 2^-32
    }
}
exports.Mash = Mash;


/***/ }),

/***/ "./node_modules/@temporalio/workflow/lib/cancellation-scope.js":
/*!*********************************************************************!*\
  !*** ./node_modules/@temporalio/workflow/lib/cancellation-scope.js ***!
  \*********************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _CancellationScope_cancelRequested;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.registerSleepImplementation = exports.RootCancellationScope = exports.disableStorage = exports.CancellationScope = exports.AsyncLocalStorage = void 0;
const common_1 = __webpack_require__(/*! @temporalio/common */ "./node_modules/@temporalio/common/lib/index.js");
const time_1 = __webpack_require__(/*! @temporalio/common/lib/time */ "./node_modules/@temporalio/common/lib/time.js");
const stack_helpers_1 = __webpack_require__(/*! ./stack-helpers */ "./node_modules/@temporalio/workflow/lib/stack-helpers.js");
const global_attributes_1 = __webpack_require__(/*! ./global-attributes */ "./node_modules/@temporalio/workflow/lib/global-attributes.js");
const flags_1 = __webpack_require__(/*! ./flags */ "./node_modules/@temporalio/workflow/lib/flags.js");
// AsyncLocalStorage is injected via vm module into global scope.
// In case Workflow code is imported in Node.js context, replace with an empty class.
exports.AsyncLocalStorage = globalThis.AsyncLocalStorage ?? class {
};
/** Magic symbol used to create the root scope - intentionally not exported */
const NO_PARENT = Symbol('NO_PARENT');
/**
 * Cancellation Scopes provide the mechanic by which a Workflow may gracefully handle incoming requests for cancellation
 * (e.g. in response to {@link WorkflowHandle.cancel} or through the UI or CLI), as well as request cancelation of
 * cancellable operations it owns (e.g. Activities, Timers, Child Workflows, etc).
 *
 * Cancellation Scopes form a tree, with the Workflow's main function running in the root scope of that tree.
 * By default, cancellation propagates down from a parent scope to its children and its cancellable operations.
 * A non-cancellable scope can receive cancellation requests, but is never effectively considered as cancelled,
 * thus shieldding its children and cancellable operations from propagation of cancellation requests it receives.
 *
 * Scopes are created using the `CancellationScope` constructor or the static helper methods {@link cancellable},
 * {@link nonCancellable} and {@link withTimeout}. `withTimeout` creates a scope that automatically cancels itself after
 * some duration.
 *
 * Cancellation of a cancellable scope results in all operations created directly in that scope to throw a
 * {@link CancelledFailure} (either directly, or as the `cause` of an {@link ActivityFailure} or a
 * {@link ChildWorkflowFailure}). Further attempt to create new cancellable scopes or cancellable operations within a
 * scope that has already been cancelled will also immediately throw a {@link CancelledFailure} exception. It is however
 * possible to create a non-cancellable scope at that point; this is often used to execute rollback or cleanup
 * operations. For example:
 *
 * ```ts
 * async function myWorkflow(...): Promise<void> {
 *   try {
 *     // This activity runs in the root cancellation scope. Therefore, a cancelation request on
 *     // the Workflow execution (e.g. through the UI or CLI) automatically propagates to this
 *     // activity. Assuming that the activity properly handle the cancellation request, then the
 *     // call below will throw an `ActivityFailure` exception, with `cause` sets to an
 *     // instance of `CancelledFailure`.
 *     await someActivity();
 *   } catch (e) {
 *     if (isCancellation(e)) {
 *       // Run cleanup activity in a non-cancellable scope
 *       await CancellationScope.nonCancellable(async () => {
 *         await cleanupActivity();
 *       }
 *     } else {
 *       throw e;
 *     }
 *   }
 * }
 * ```
 *
 * A cancellable scope may be programatically cancelled by calling {@link cancel|`scope.cancel()`}`. This may be used,
 * for example, to explicitly request cancellation of an Activity or Child Workflow:
 *
 * ```ts
 * const cancellableActivityScope = new CancellationScope();
 * const activityPromise = cancellableActivityScope.run(() => someActivity());
 * cancellableActivityScope.cancel(); // Cancels the activity
 * await activityPromise; // Throws `ActivityFailure` with `cause` set to `CancelledFailure`
 * ```
 */
class CancellationScope {
    constructor(options) {
        _CancellationScope_cancelRequested.set(this, false);
        this.timeout = (0, time_1.msOptionalToNumber)(options?.timeout);
        this.cancellable = options?.cancellable ?? true;
        this.cancelRequested = new Promise((_, reject) => {
            // @ts-expect-error TSC doesn't understand that the Promise executor runs synchronously
            this.reject = (err) => {
                __classPrivateFieldSet(this, _CancellationScope_cancelRequested, true, "f");
                reject(err);
            };
        });
        (0, stack_helpers_1.untrackPromise)(this.cancelRequested);
        // Avoid unhandled rejections
        (0, stack_helpers_1.untrackPromise)(this.cancelRequested.catch(() => undefined));
        if (options?.parent !== NO_PARENT) {
            this.parent = options?.parent || CancellationScope.current();
            if (this.parent.cancellable ||
                (__classPrivateFieldGet(this.parent, _CancellationScope_cancelRequested, "f") &&
                    !(0, global_attributes_1.getActivator)().hasFlag(flags_1.SdkFlags.NonCancellableScopesAreShieldedFromPropagation))) {
                __classPrivateFieldSet(this, _CancellationScope_cancelRequested, __classPrivateFieldGet(this.parent, _CancellationScope_cancelRequested, "f"), "f");
                (0, stack_helpers_1.untrackPromise)(this.parent.cancelRequested.catch((err) => {
                    this.reject(err);
                }));
            }
            else {
                (0, stack_helpers_1.untrackPromise)(this.parent.cancelRequested.catch((err) => {
                    if (!(0, global_attributes_1.getActivator)().hasFlag(flags_1.SdkFlags.NonCancellableScopesAreShieldedFromPropagation)) {
                        this.reject(err);
                    }
                }));
            }
        }
    }
    /**
     * Whether the scope was effectively cancelled. A non-cancellable scope can never be considered cancelled.
     */
    get consideredCancelled() {
        return __classPrivateFieldGet(this, _CancellationScope_cancelRequested, "f") && this.cancellable;
    }
    /**
     * Activate the scope as current and run  `fn`
     *
     * Any timers, Activities, Triggers and CancellationScopes created in the body of `fn`
     * automatically link their cancellation to this scope.
     *
     * @return the result of `fn`
     */
    run(fn) {
        return storage.run(this, this.runInContext.bind(this, fn));
    }
    /**
     * Method that runs a function in AsyncLocalStorage context.
     *
     * Could have been written as anonymous function, made into a method for improved stack traces.
     */
    async runInContext(fn) {
        let timerScope;
        if (this.timeout) {
            timerScope = new CancellationScope();
            (0, stack_helpers_1.untrackPromise)(timerScope
                .run(() => sleep(this.timeout))
                .then(() => this.cancel(), () => {
                // scope was already cancelled, ignore
            }));
        }
        try {
            return await fn();
        }
        finally {
            if (timerScope &&
                !timerScope.consideredCancelled &&
                (0, global_attributes_1.getActivator)().hasFlag(flags_1.SdkFlags.NonCancellableScopesAreShieldedFromPropagation)) {
                timerScope.cancel();
            }
        }
    }
    /**
     * Request to cancel the scope and linked children
     */
    cancel() {
        this.reject(new common_1.CancelledFailure('Cancellation scope cancelled'));
    }
    /**
     * Get the current "active" scope
     */
    static current() {
        // Using globals directly instead of a helper function to avoid circular import
        return storage.getStore() ?? globalThis.__TEMPORAL_ACTIVATOR__.rootScope;
    }
    /** Alias to `new CancellationScope({ cancellable: true }).run(fn)` */
    static cancellable(fn) {
        return new this({ cancellable: true }).run(fn);
    }
    /** Alias to `new CancellationScope({ cancellable: false }).run(fn)` */
    static nonCancellable(fn) {
        return new this({ cancellable: false }).run(fn);
    }
    /** Alias to `new CancellationScope({ cancellable: true, timeout }).run(fn)` */
    static withTimeout(timeout, fn) {
        return new this({ cancellable: true, timeout }).run(fn);
    }
}
exports.CancellationScope = CancellationScope;
_CancellationScope_cancelRequested = new WeakMap();
const storage = new exports.AsyncLocalStorage();
/**
 * Avoid exposing the storage directly so it doesn't get frozen
 */
function disableStorage() {
    storage.disable();
}
exports.disableStorage = disableStorage;
class RootCancellationScope extends CancellationScope {
    constructor() {
        super({ cancellable: true, parent: NO_PARENT });
    }
    cancel() {
        this.reject(new common_1.CancelledFailure('Workflow cancelled'));
    }
}
exports.RootCancellationScope = RootCancellationScope;
/** This function is here to avoid a circular dependency between this module and workflow.ts */
let sleep = (_) => {
    throw new common_1.IllegalStateError('Workflow has not been properly initialized');
};
function registerSleepImplementation(fn) {
    sleep = fn;
}
exports.registerSleepImplementation = registerSleepImplementation;


/***/ }),

/***/ "./node_modules/@temporalio/workflow/lib/errors.js":
/*!*********************************************************!*\
  !*** ./node_modules/@temporalio/workflow/lib/errors.js ***!
  \*********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.isCancellation = exports.LocalActivityDoBackoff = exports.DeterminismViolationError = exports.WorkflowError = void 0;
const common_1 = __webpack_require__(/*! @temporalio/common */ "./node_modules/@temporalio/common/lib/index.js");
const type_helpers_1 = __webpack_require__(/*! @temporalio/common/lib/type-helpers */ "./node_modules/@temporalio/common/lib/type-helpers.js");
/**
 * Base class for all workflow errors
 */
let WorkflowError = class WorkflowError extends Error {
};
exports.WorkflowError = WorkflowError;
exports.WorkflowError = WorkflowError = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('WorkflowError')
], WorkflowError);
/**
 * Thrown in workflow when it tries to do something that non-deterministic such as construct a WeakRef()
 */
let DeterminismViolationError = class DeterminismViolationError extends WorkflowError {
};
exports.DeterminismViolationError = DeterminismViolationError;
exports.DeterminismViolationError = DeterminismViolationError = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('DeterminismViolationError')
], DeterminismViolationError);
/**
 * A class that acts as a marker for this special result type
 */
let LocalActivityDoBackoff = class LocalActivityDoBackoff extends Error {
    constructor(backoff) {
        super();
        this.backoff = backoff;
    }
};
exports.LocalActivityDoBackoff = LocalActivityDoBackoff;
exports.LocalActivityDoBackoff = LocalActivityDoBackoff = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('LocalActivityDoBackoff')
], LocalActivityDoBackoff);
/**
 * Returns whether provided `err` is caused by cancellation
 */
function isCancellation(err) {
    return (err instanceof common_1.CancelledFailure ||
        ((err instanceof common_1.ActivityFailure || err instanceof common_1.ChildWorkflowFailure) && err.cause instanceof common_1.CancelledFailure));
}
exports.isCancellation = isCancellation;


/***/ }),

/***/ "./node_modules/@temporalio/workflow/lib/flags.js":
/*!********************************************************!*\
  !*** ./node_modules/@temporalio/workflow/lib/flags.js ***!
  \********************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.assertValidFlag = exports.SdkFlags = void 0;
const flagsRegistry = new Map();
exports.SdkFlags = {
    /**
     * This flag gates multiple fixes related to cancellation scopes and timers introduced in 1.10.2/1.11.0:
     * - Cancellation of a non-cancellable scope no longer propagates to children scopes
     *   (see https://github.com/temporalio/sdk-typescript/issues/1423).
     * - CancellationScope.withTimeout(fn) now cancel the timer if `fn` completes before expiration
     *   of the timeout, similar to how `condition(fn, timeout)` works.
     * - Timers created using setTimeout can now be intercepted.
     *
     * @since Introduced in 1.10.2/1.11.0. However, due to an SDK bug, SDKs v1.11.0 and v1.11.1 were not
     *        properly writing back the flags to history, possibly resulting in NDE on replay. We therefore
     *        consider that a WFT emitted by Worker v1.11.0 or v1.11.1 to implicitly have this flag on.
     */
    NonCancellableScopesAreShieldedFromPropagation: defineFlag(1, true, [buildIdSdkVersionMatches(/1\.11\.[01]/)]),
    /**
     * Prior to 1.11.0, when processing a Workflow activation, the SDK would execute `notifyHasPatch`
     * and `signalWorkflow` jobs in distinct phases, before other types of jobs. The primary reason
     * behind that multi-phase algorithm was to avoid the possibility that a Workflow execution might
     * complete before all incoming signals have been dispatched (at least to the point that the
     * _synchronous_ part of the handler function has been executed).
     *
     * This flag replaces that multi-phase algorithm with a simpler one where jobs are simply sorted as
     * `(signals and updates) -> others`, but without processing them as distinct batches (i.e. without
     * leaving/reentering the VM context between each group, which automatically triggers the execution
     * of all outstanding microtasks). That single-phase approach resolves a number of quirks of the
     * former algorithm, and yet still satisfies to the original requirement of ensuring that every
     * `signalWorkflow` jobs - and now `doUpdate` jobs as well - have been given a proper chance to
     * execute before the Workflow main function might completes.
     *
     * @since Introduced in 1.11.0. This change is not rollback-safe. However, due to an SDK bug, SDKs
     *        v1.11.0 and v1.11.1 were not properly writing back the flags to history, possibly resulting
     *        in NDE on replay. We therefore consider that a WFT emitted by Worker v1.11.0 or v1.11.1
     *        to implicitely have this flag on.
     */
    ProcessWorkflowActivationJobsAsSingleBatch: defineFlag(2, true, [buildIdSdkVersionMatches(/1\.11\.[01]/)]),
};
function defineFlag(id, def, alternativeConditions) {
    const flag = { id, default: def, alternativeConditions };
    flagsRegistry.set(id, flag);
    return flag;
}
function assertValidFlag(id) {
    if (!flagsRegistry.has(id))
        throw new TypeError(`Unknown SDK flag: ${id}`);
}
exports.assertValidFlag = assertValidFlag;
function buildIdSdkVersionMatches(version) {
    const regex = new RegExp(`^@temporalio/worker@(${version.source})[+]`);
    return ({ info }) => info.currentBuildId != null && regex.test(info.currentBuildId);
}


/***/ }),

/***/ "./node_modules/@temporalio/workflow/lib/global-attributes.js":
/*!********************************************************************!*\
  !*** ./node_modules/@temporalio/workflow/lib/global-attributes.js ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getActivator = exports.assertInWorkflowContext = exports.maybeGetActivator = exports.setActivatorUntyped = exports.maybeGetActivatorUntyped = void 0;
const common_1 = __webpack_require__(/*! @temporalio/common */ "./node_modules/@temporalio/common/lib/index.js");
function maybeGetActivatorUntyped() {
    return globalThis.__TEMPORAL_ACTIVATOR__;
}
exports.maybeGetActivatorUntyped = maybeGetActivatorUntyped;
function setActivatorUntyped(activator) {
    globalThis.__TEMPORAL_ACTIVATOR__ = activator;
}
exports.setActivatorUntyped = setActivatorUntyped;
function maybeGetActivator() {
    return maybeGetActivatorUntyped();
}
exports.maybeGetActivator = maybeGetActivator;
function assertInWorkflowContext(message) {
    const activator = maybeGetActivator();
    if (activator == null)
        throw new common_1.IllegalStateError(message);
    return activator;
}
exports.assertInWorkflowContext = assertInWorkflowContext;
function getActivator() {
    const activator = maybeGetActivator();
    if (activator === undefined) {
        throw new common_1.IllegalStateError('Workflow uninitialized');
    }
    return activator;
}
exports.getActivator = getActivator;


/***/ }),

/***/ "./node_modules/@temporalio/workflow/lib/global-overrides.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@temporalio/workflow/lib/global-overrides.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.overrideGlobals = void 0;
/**
 * Overrides some global objects to make them deterministic.
 *
 * @module
 */
const time_1 = __webpack_require__(/*! @temporalio/common/lib/time */ "./node_modules/@temporalio/common/lib/time.js");
const cancellation_scope_1 = __webpack_require__(/*! ./cancellation-scope */ "./node_modules/@temporalio/workflow/lib/cancellation-scope.js");
const errors_1 = __webpack_require__(/*! ./errors */ "./node_modules/@temporalio/workflow/lib/errors.js");
const global_attributes_1 = __webpack_require__(/*! ./global-attributes */ "./node_modules/@temporalio/workflow/lib/global-attributes.js");
const flags_1 = __webpack_require__(/*! ./flags */ "./node_modules/@temporalio/workflow/lib/flags.js");
const workflow_1 = __webpack_require__(/*! ./workflow */ "./node_modules/@temporalio/workflow/lib/workflow.js");
const stack_helpers_1 = __webpack_require__(/*! ./stack-helpers */ "./node_modules/@temporalio/workflow/lib/stack-helpers.js");
const global = globalThis;
const OriginalDate = globalThis.Date;
function overrideGlobals() {
    // Mock any weak reference because GC is non-deterministic and the effect is observable from the Workflow.
    // Workflow developer will get a meaningful exception if they try to use these.
    global.WeakRef = function () {
        throw new errors_1.DeterminismViolationError('WeakRef cannot be used in Workflows because v8 GC is non-deterministic');
    };
    global.FinalizationRegistry = function () {
        throw new errors_1.DeterminismViolationError('FinalizationRegistry cannot be used in Workflows because v8 GC is non-deterministic');
    };
    global.Date = function (...args) {
        if (args.length > 0) {
            return new OriginalDate(...args);
        }
        return new OriginalDate((0, global_attributes_1.getActivator)().now);
    };
    global.Date.now = function () {
        return (0, global_attributes_1.getActivator)().now;
    };
    global.Date.parse = OriginalDate.parse.bind(OriginalDate);
    global.Date.UTC = OriginalDate.UTC.bind(OriginalDate);
    global.Date.prototype = OriginalDate.prototype;
    const timeoutCancelationScopes = new Map();
    /**
     * @param ms sleep duration -  number of milliseconds. If given a negative number, value will be set to 1.
     */
    global.setTimeout = function (cb, ms, ...args) {
        ms = Math.max(1, ms);
        const activator = (0, global_attributes_1.getActivator)();
        if (activator.hasFlag(flags_1.SdkFlags.NonCancellableScopesAreShieldedFromPropagation)) {
            // Capture the sequence number that sleep will allocate
            const seq = activator.nextSeqs.timer;
            const timerScope = new cancellation_scope_1.CancellationScope({ cancellable: true });
            const sleepPromise = timerScope.run(() => (0, workflow_1.sleep)(ms));
            sleepPromise.then(() => {
                timeoutCancelationScopes.delete(seq);
                cb(...args);
            }, () => {
                timeoutCancelationScopes.delete(seq);
            });
            (0, stack_helpers_1.untrackPromise)(sleepPromise);
            timeoutCancelationScopes.set(seq, timerScope);
            return seq;
        }
        else {
            const seq = activator.nextSeqs.timer++;
            // Create a Promise for AsyncLocalStorage to be able to track this completion using promise hooks.
            new Promise((resolve, reject) => {
                activator.completions.timer.set(seq, { resolve, reject });
                activator.pushCommand({
                    startTimer: {
                        seq,
                        startToFireTimeout: (0, time_1.msToTs)(ms),
                    },
                });
            }).then(() => cb(...args), () => undefined /* ignore cancellation */);
            return seq;
        }
    };
    global.clearTimeout = function (handle) {
        const activator = (0, global_attributes_1.getActivator)();
        const timerScope = timeoutCancelationScopes.get(handle);
        if (timerScope) {
            timeoutCancelationScopes.delete(handle);
            timerScope.cancel();
        }
        else {
            activator.nextSeqs.timer++; // Shouldn't increase seq number, but that's the legacy behavior
            activator.completions.timer.delete(handle);
            activator.pushCommand({
                cancelTimer: {
                    seq: handle,
                },
            });
        }
    };
    // activator.random is mutable, don't hardcode its reference
    Math.random = () => (0, global_attributes_1.getActivator)().random();
}
exports.overrideGlobals = overrideGlobals;


/***/ }),

/***/ "./node_modules/@temporalio/workflow/lib/index.js":
/*!********************************************************!*\
  !*** ./node_modules/@temporalio/workflow/lib/index.js ***!
  \********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

/**
 * This library provides tools required for authoring workflows.
 *
 * ## Usage
 * See the {@link https://docs.temporal.io/typescript/hello-world#workflows | tutorial} for writing your first workflow.
 *
 * ### Timers
 *
 * The recommended way of scheduling timers is by using the {@link sleep} function. We've replaced `setTimeout` and
 * `clearTimeout` with deterministic versions so these are also usable but have a limitation that they don't play well
 * with {@link https://docs.temporal.io/typescript/cancellation-scopes | cancellation scopes}.
 *
 * <!--SNIPSTART typescript-sleep-workflow-->
 * <!--SNIPEND-->
 *
 * ### Activities
 *
 * To schedule Activities, use {@link proxyActivities} to obtain an Activity function and call.
 *
 * <!--SNIPSTART typescript-schedule-activity-workflow-->
 * <!--SNIPEND-->
 *
 * ### Updates, Signals and Queries
 *
 * Use {@link setHandler} to set handlers for Updates, Signals, and Queries.
 *
 * Update and Signal handlers can be either async or non-async functions. Update handlers may return a value, but signal
 * handlers may not (return `void` or `Promise<void>`). You may use Activities, Timers, child Workflows, etc in Update
 * and Signal handlers, but this should be done cautiously: for example, note that if you await async operations such as
 * these in an Update or Signal handler, then you are responsible for ensuring that the workflow does not complete first.
 *
 * Query handlers may **not** be async functions, and may **not** mutate any variables or use Activities, Timers,
 * child Workflows, etc.
 *
 * #### Implementation
 *
 * <!--SNIPSTART typescript-workflow-update-signal-query-example-->
 * <!--SNIPEND-->
 *
 * ### More
 *
 * - [Deterministic built-ins](https://docs.temporal.io/typescript/determinism#sources-of-non-determinism)
 * - [Cancellation and scopes](https://docs.temporal.io/typescript/cancellation-scopes)
 *   - {@link CancellationScope}
 *   - {@link Trigger}
 * - [Sinks](https://docs.temporal.io/application-development/observability/?lang=ts#logging)
 *   - {@link Sinks}
 *
 * @module
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Trigger = exports.log = exports.proxySinks = exports.ParentClosePolicy = exports.ContinueAsNew = exports.ChildWorkflowCancellationType = exports.CancellationScope = exports.AsyncLocalStorage = exports.TimeoutFailure = exports.TerminatedFailure = exports.TemporalFailure = exports.ServerFailure = exports.rootCause = exports.defaultPayloadConverter = exports.ChildWorkflowFailure = exports.CancelledFailure = exports.ApplicationFailure = exports.ActivityFailure = exports.ActivityCancellationType = void 0;
var common_1 = __webpack_require__(/*! @temporalio/common */ "./node_modules/@temporalio/common/lib/index.js");
Object.defineProperty(exports, "ActivityCancellationType", ({ enumerable: true, get: function () { return common_1.ActivityCancellationType; } }));
Object.defineProperty(exports, "ActivityFailure", ({ enumerable: true, get: function () { return common_1.ActivityFailure; } }));
Object.defineProperty(exports, "ApplicationFailure", ({ enumerable: true, get: function () { return common_1.ApplicationFailure; } }));
Object.defineProperty(exports, "CancelledFailure", ({ enumerable: true, get: function () { return common_1.CancelledFailure; } }));
Object.defineProperty(exports, "ChildWorkflowFailure", ({ enumerable: true, get: function () { return common_1.ChildWorkflowFailure; } }));
Object.defineProperty(exports, "defaultPayloadConverter", ({ enumerable: true, get: function () { return common_1.defaultPayloadConverter; } }));
Object.defineProperty(exports, "rootCause", ({ enumerable: true, get: function () { return common_1.rootCause; } }));
Object.defineProperty(exports, "ServerFailure", ({ enumerable: true, get: function () { return common_1.ServerFailure; } }));
Object.defineProperty(exports, "TemporalFailure", ({ enumerable: true, get: function () { return common_1.TemporalFailure; } }));
Object.defineProperty(exports, "TerminatedFailure", ({ enumerable: true, get: function () { return common_1.TerminatedFailure; } }));
Object.defineProperty(exports, "TimeoutFailure", ({ enumerable: true, get: function () { return common_1.TimeoutFailure; } }));
__exportStar(__webpack_require__(/*! @temporalio/common/lib/errors */ "./node_modules/@temporalio/common/lib/errors.js"), exports);
__exportStar(__webpack_require__(/*! @temporalio/common/lib/workflow-handle */ "./node_modules/@temporalio/common/lib/workflow-handle.js"), exports);
__exportStar(__webpack_require__(/*! @temporalio/common/lib/workflow-options */ "./node_modules/@temporalio/common/lib/workflow-options.js"), exports);
var cancellation_scope_1 = __webpack_require__(/*! ./cancellation-scope */ "./node_modules/@temporalio/workflow/lib/cancellation-scope.js");
Object.defineProperty(exports, "AsyncLocalStorage", ({ enumerable: true, get: function () { return cancellation_scope_1.AsyncLocalStorage; } }));
Object.defineProperty(exports, "CancellationScope", ({ enumerable: true, get: function () { return cancellation_scope_1.CancellationScope; } }));
__exportStar(__webpack_require__(/*! ./errors */ "./node_modules/@temporalio/workflow/lib/errors.js"), exports);
__exportStar(__webpack_require__(/*! ./interceptors */ "./node_modules/@temporalio/workflow/lib/interceptors.js"), exports);
var interfaces_1 = __webpack_require__(/*! ./interfaces */ "./node_modules/@temporalio/workflow/lib/interfaces.js");
Object.defineProperty(exports, "ChildWorkflowCancellationType", ({ enumerable: true, get: function () { return interfaces_1.ChildWorkflowCancellationType; } }));
Object.defineProperty(exports, "ContinueAsNew", ({ enumerable: true, get: function () { return interfaces_1.ContinueAsNew; } }));
Object.defineProperty(exports, "ParentClosePolicy", ({ enumerable: true, get: function () { return interfaces_1.ParentClosePolicy; } }));
var sinks_1 = __webpack_require__(/*! ./sinks */ "./node_modules/@temporalio/workflow/lib/sinks.js");
Object.defineProperty(exports, "proxySinks", ({ enumerable: true, get: function () { return sinks_1.proxySinks; } }));
var logs_1 = __webpack_require__(/*! ./logs */ "./node_modules/@temporalio/workflow/lib/logs.js");
Object.defineProperty(exports, "log", ({ enumerable: true, get: function () { return logs_1.log; } }));
var trigger_1 = __webpack_require__(/*! ./trigger */ "./node_modules/@temporalio/workflow/lib/trigger.js");
Object.defineProperty(exports, "Trigger", ({ enumerable: true, get: function () { return trigger_1.Trigger; } }));
__exportStar(__webpack_require__(/*! ./workflow */ "./node_modules/@temporalio/workflow/lib/workflow.js"), exports);


/***/ }),

/***/ "./node_modules/@temporalio/workflow/lib/interceptors.js":
/*!***************************************************************!*\
  !*** ./node_modules/@temporalio/workflow/lib/interceptors.js ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/**
 * Type definitions and generic helpers for interceptors.
 *
 * The Workflow specific interceptors are defined here.
 *
 * @module
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ "./node_modules/@temporalio/workflow/lib/interfaces.js":
/*!*************************************************************!*\
  !*** ./node_modules/@temporalio/workflow/lib/interfaces.js ***!
  \*************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ParentClosePolicy = exports.ChildWorkflowCancellationType = exports.ContinueAsNew = void 0;
const type_helpers_1 = __webpack_require__(/*! @temporalio/common/lib/type-helpers */ "./node_modules/@temporalio/common/lib/type-helpers.js");
/**
 * Not an actual error, used by the Workflow runtime to abort execution when {@link continueAsNew} is called
 */
let ContinueAsNew = class ContinueAsNew extends Error {
    constructor(command) {
        super('Workflow continued as new');
        this.command = command;
    }
};
exports.ContinueAsNew = ContinueAsNew;
exports.ContinueAsNew = ContinueAsNew = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('ContinueAsNew')
], ContinueAsNew);
/**
 * Specifies:
 * - whether cancellation requests are sent to the Child
 * - whether and when a {@link CanceledFailure} is thrown from {@link executeChild} or
 *   {@link ChildWorkflowHandle.result}
 *
 * @default {@link ChildWorkflowCancellationType.WAIT_CANCELLATION_COMPLETED}
 */
var ChildWorkflowCancellationType;
(function (ChildWorkflowCancellationType) {
    /**
     * Don't send a cancellation request to the Child.
     */
    ChildWorkflowCancellationType[ChildWorkflowCancellationType["ABANDON"] = 0] = "ABANDON";
    /**
     * Send a cancellation request to the Child. Immediately throw the error.
     */
    ChildWorkflowCancellationType[ChildWorkflowCancellationType["TRY_CANCEL"] = 1] = "TRY_CANCEL";
    /**
     * Send a cancellation request to the Child. The Child may respect cancellation, in which case an error will be thrown
     * when cancellation has completed, and {@link isCancellation}(error) will be true. On the other hand, the Child may
     * ignore the cancellation request, in which case an error might be thrown with a different cause, or the Child may
     * complete successfully.
     *
     * @default
     */
    ChildWorkflowCancellationType[ChildWorkflowCancellationType["WAIT_CANCELLATION_COMPLETED"] = 2] = "WAIT_CANCELLATION_COMPLETED";
    /**
     * Send a cancellation request to the Child. Throw the error once the Server receives the Child cancellation request.
     */
    ChildWorkflowCancellationType[ChildWorkflowCancellationType["WAIT_CANCELLATION_REQUESTED"] = 3] = "WAIT_CANCELLATION_REQUESTED";
})(ChildWorkflowCancellationType || (exports.ChildWorkflowCancellationType = ChildWorkflowCancellationType = {}));
(0, type_helpers_1.checkExtends)();
(0, type_helpers_1.checkExtends)();
/**
 * How a Child Workflow reacts to the Parent Workflow reaching a Closed state.
 *
 * @see {@link https://docs.temporal.io/concepts/what-is-a-parent-close-policy/ | Parent Close Policy}
 */
var ParentClosePolicy;
(function (ParentClosePolicy) {
    /**
     * If a `ParentClosePolicy` is set to this, or is not set at all, the server default value will be used.
     */
    ParentClosePolicy[ParentClosePolicy["PARENT_CLOSE_POLICY_UNSPECIFIED"] = 0] = "PARENT_CLOSE_POLICY_UNSPECIFIED";
    /**
     * When the Parent is Closed, the Child is Terminated.
     *
     * @default
     */
    ParentClosePolicy[ParentClosePolicy["PARENT_CLOSE_POLICY_TERMINATE"] = 1] = "PARENT_CLOSE_POLICY_TERMINATE";
    /**
     * When the Parent is Closed, nothing is done to the Child.
     */
    ParentClosePolicy[ParentClosePolicy["PARENT_CLOSE_POLICY_ABANDON"] = 2] = "PARENT_CLOSE_POLICY_ABANDON";
    /**
     * When the Parent is Closed, the Child is Cancelled.
     */
    ParentClosePolicy[ParentClosePolicy["PARENT_CLOSE_POLICY_REQUEST_CANCEL"] = 3] = "PARENT_CLOSE_POLICY_REQUEST_CANCEL";
})(ParentClosePolicy || (exports.ParentClosePolicy = ParentClosePolicy = {}));
(0, type_helpers_1.checkExtends)();
(0, type_helpers_1.checkExtends)();


/***/ }),

/***/ "./node_modules/@temporalio/workflow/lib/internals.js":
/*!************************************************************!*\
  !*** ./node_modules/@temporalio/workflow/lib/internals.js ***!
  \************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Activator = void 0;
const common_1 = __webpack_require__(/*! @temporalio/common */ "./node_modules/@temporalio/common/lib/index.js");
const interceptors_1 = __webpack_require__(/*! @temporalio/common/lib/interceptors */ "./node_modules/@temporalio/common/lib/interceptors.js");
const type_helpers_1 = __webpack_require__(/*! @temporalio/common/lib/type-helpers */ "./node_modules/@temporalio/common/lib/type-helpers.js");
const alea_1 = __webpack_require__(/*! ./alea */ "./node_modules/@temporalio/workflow/lib/alea.js");
const cancellation_scope_1 = __webpack_require__(/*! ./cancellation-scope */ "./node_modules/@temporalio/workflow/lib/cancellation-scope.js");
const update_scope_1 = __webpack_require__(/*! ./update-scope */ "./node_modules/@temporalio/workflow/lib/update-scope.js");
const errors_1 = __webpack_require__(/*! ./errors */ "./node_modules/@temporalio/workflow/lib/errors.js");
const interfaces_1 = __webpack_require__(/*! ./interfaces */ "./node_modules/@temporalio/workflow/lib/interfaces.js");
const stack_helpers_1 = __webpack_require__(/*! ./stack-helpers */ "./node_modules/@temporalio/workflow/lib/stack-helpers.js");
const pkg_1 = __importDefault(__webpack_require__(/*! ./pkg */ "./node_modules/@temporalio/workflow/lib/pkg.js"));
const flags_1 = __webpack_require__(/*! ./flags */ "./node_modules/@temporalio/workflow/lib/flags.js");
const logs_1 = __webpack_require__(/*! ./logs */ "./node_modules/@temporalio/workflow/lib/logs.js");
var StartChildWorkflowExecutionFailedCause;
(function (StartChildWorkflowExecutionFailedCause) {
    StartChildWorkflowExecutionFailedCause[StartChildWorkflowExecutionFailedCause["START_CHILD_WORKFLOW_EXECUTION_FAILED_CAUSE_UNSPECIFIED"] = 0] = "START_CHILD_WORKFLOW_EXECUTION_FAILED_CAUSE_UNSPECIFIED";
    StartChildWorkflowExecutionFailedCause[StartChildWorkflowExecutionFailedCause["START_CHILD_WORKFLOW_EXECUTION_FAILED_CAUSE_WORKFLOW_ALREADY_EXISTS"] = 1] = "START_CHILD_WORKFLOW_EXECUTION_FAILED_CAUSE_WORKFLOW_ALREADY_EXISTS";
})(StartChildWorkflowExecutionFailedCause || (StartChildWorkflowExecutionFailedCause = {}));
(0, type_helpers_1.checkExtends)();
(0, type_helpers_1.checkExtends)();
/**
 * Keeps all of the Workflow runtime state like pending completions for activities and timers.
 *
 * Implements handlers for all workflow activation jobs.
 *
 * Note that most methods in this class are meant to be called only from within the VM.
 *
 * However, a few methods may be called directly from outside the VM (essentially from `vm-shared.ts`).
 * These methods are specifically marked with a comment and require careful consideration, as the
 * execution context may not properly reflect that of the target workflow execution (e.g.: with Reusable
 * VMs, the `global` may not have been swapped to those of that workflow execution; the active microtask
 * queue may be that of the thread/process, rather than the queue of that VM context; etc). Consequently,
 * methods that are meant to be called from outside of the VM must not do any of the following:
 *
 * - Access any global variable;
 * - Create Promise objects, use async/await, or otherwise schedule microtasks;
 * - Call user-defined functions, including any form of interceptor.
 */
class Activator {
    constructor({ info, now, showStackTraceSources, sourceMap, getTimeOfDay, randomnessSeed, registeredActivityNames, }) {
        /**
         * Cache for modules - referenced in reusable-vm.ts
         */
        this.moduleCache = new Map();
        /**
         * Map of task sequence to a Completion
         */
        this.completions = {
            timer: new Map(),
            activity: new Map(),
            childWorkflowStart: new Map(),
            childWorkflowComplete: new Map(),
            signalWorkflow: new Map(),
            cancelWorkflow: new Map(),
        };
        /**
         * Holds buffered Update calls until a handler is registered
         */
        this.bufferedUpdates = Array();
        /**
         * Holds buffered signal calls until a handler is registered
         */
        this.bufferedSignals = Array();
        /**
         * Mapping of update name to handler and validator
         */
        this.updateHandlers = new Map();
        /**
         * Mapping of signal name to handler
         */
        this.signalHandlers = new Map();
        /**
         * Mapping of in-progress updates to handler execution information.
         */
        this.inProgressUpdates = new Map();
        /**
         * Mapping of in-progress signals to handler execution information.
         */
        this.inProgressSignals = new Map();
        /**
         * A sequence number providing unique identifiers for signal handler executions.
         */
        this.signalHandlerExecutionSeq = 0;
        this.promiseStackStore = {
            promiseToStack: new Map(),
            childToParent: new Map(),
        };
        this.rootScope = new cancellation_scope_1.RootCancellationScope();
        /**
         * Mapping of query name to handler
         */
        this.queryHandlers = new Map([
            [
                '__stack_trace',
                {
                    handler: () => {
                        return this.getStackTraces()
                            .map((s) => s.formatted)
                            .join('\n\n');
                    },
                    description: 'Returns a sensible stack trace.',
                },
            ],
            [
                '__enhanced_stack_trace',
                {
                    handler: () => {
                        const { sourceMap } = this;
                        const sdk = { name: 'typescript', version: pkg_1.default.version };
                        const stacks = this.getStackTraces().map(({ structured: locations }) => ({ locations }));
                        const sources = {};
                        if (this.showStackTraceSources) {
                            for (const { locations } of stacks) {
                                for (const { file_path } of locations) {
                                    if (!file_path)
                                        continue;
                                    const content = sourceMap?.sourcesContent?.[sourceMap?.sources.indexOf(file_path)];
                                    if (!content)
                                        continue;
                                    sources[file_path] = [
                                        {
                                            line_offset: 0,
                                            content,
                                        },
                                    ];
                                }
                            }
                        }
                        return { sdk, stacks, sources };
                    },
                    description: 'Returns a stack trace annotated with source information.',
                },
            ],
            [
                '__temporal_workflow_metadata',
                {
                    handler: () => {
                        const workflowType = this.info.workflowType;
                        const queryDefinitions = Array.from(this.queryHandlers.entries()).map(([name, value]) => ({
                            name,
                            description: value.description,
                        }));
                        const signalDefinitions = Array.from(this.signalHandlers.entries()).map(([name, value]) => ({
                            name,
                            description: value.description,
                        }));
                        const updateDefinitions = Array.from(this.updateHandlers.entries()).map(([name, value]) => ({
                            name,
                            description: value.description,
                        }));
                        return {
                            definition: {
                                type: workflowType,
                                queryDefinitions,
                                signalDefinitions,
                                updateDefinitions,
                            },
                        };
                    },
                    description: 'Returns metadata associated with this workflow.',
                },
            ],
        ]);
        /**
         * Loaded in {@link initRuntime}
         */
        this.interceptors = {
            inbound: [],
            outbound: [],
            internals: [],
        };
        /**
         * Buffer that stores all generated commands, reset after each activation
         */
        this.commands = [];
        /**
         * Stores all {@link condition}s that haven't been unblocked yet
         */
        this.blockedConditions = new Map();
        /**
         * Is this Workflow completed?
         *
         * A Workflow will be considered completed if it generates a command that the
         * system considers as a final Workflow command (e.g.
         * completeWorkflowExecution or failWorkflowExecution).
         */
        this.completed = false;
        /**
         * Was this Workflow cancelled?
         */
        this.cancelled = false;
        /**
         * The next (incremental) sequence to assign when generating completable commands
         */
        this.nextSeqs = {
            timer: 1,
            activity: 1,
            childWorkflow: 1,
            signalWorkflow: 1,
            cancelWorkflow: 1,
            condition: 1,
            // Used internally to keep track of active stack traces
            stack: 1,
        };
        this.payloadConverter = common_1.defaultPayloadConverter;
        this.failureConverter = common_1.defaultFailureConverter;
        /**
         * Patches we know the status of for this workflow, as in {@link patched}
         */
        this.knownPresentPatches = new Set();
        /**
         * Patches we sent to core {@link patched}
         */
        this.sentPatches = new Set();
        this.knownFlags = new Set();
        /**
         * Buffered sink calls per activation
         */
        this.sinkCalls = Array();
        this.getTimeOfDay = getTimeOfDay;
        this.info = info;
        this.now = now;
        this.showStackTraceSources = showStackTraceSources;
        this.sourceMap = sourceMap;
        this.random = (0, alea_1.alea)(randomnessSeed);
        this.registeredActivityNames = registeredActivityNames;
    }
    /**
     * May be invoked from outside the VM.
     */
    mutateWorkflowInfo(fn) {
        this.info = fn(this.info);
    }
    getStackTraces() {
        const { childToParent, promiseToStack } = this.promiseStackStore;
        const internalNodes = [...childToParent.values()].reduce((acc, curr) => {
            for (const p of curr) {
                acc.add(p);
            }
            return acc;
        }, new Set());
        const stacks = new Map();
        for (const child of childToParent.keys()) {
            if (!internalNodes.has(child)) {
                const stack = promiseToStack.get(child);
                if (!stack || !stack.formatted)
                    continue;
                stacks.set(stack.formatted, stack);
            }
        }
        // Not 100% sure where this comes from, just filter it out
        stacks.delete('    at Promise.then (<anonymous>)');
        stacks.delete('    at Promise.then (<anonymous>)\n');
        return [...stacks].map(([_, stack]) => stack);
    }
    /**
     * May be invoked from outside the VM.
     */
    getAndResetSinkCalls() {
        const { sinkCalls } = this;
        this.sinkCalls = [];
        return sinkCalls;
    }
    /**
     * Buffer a Workflow command to be collected at the end of the current activation.
     *
     * Prevents commands from being added after Workflow completion.
     */
    pushCommand(cmd, complete = false) {
        this.commands.push(cmd);
        if (complete) {
            this.completed = true;
        }
    }
    concludeActivation() {
        return {
            commands: this.commands.splice(0),
            usedInternalFlags: [...this.knownFlags],
        };
    }
    async startWorkflowNextHandler({ args }) {
        const { workflow } = this;
        if (workflow === undefined) {
            throw new common_1.IllegalStateError('Workflow uninitialized');
        }
        return await workflow(...args);
    }
    startWorkflow(activation) {
        const execute = (0, interceptors_1.composeInterceptors)(this.interceptors.inbound, 'execute', this.startWorkflowNextHandler.bind(this));
        (0, stack_helpers_1.untrackPromise)((0, logs_1.executeWithLifecycleLogging)(() => execute({
            headers: activation.headers ?? {},
            args: (0, common_1.arrayFromPayloads)(this.payloadConverter, activation.arguments),
        })).then(this.completeWorkflow.bind(this), this.handleWorkflowFailure.bind(this)));
    }
    initializeWorkflow(activation) {
        const { continuedFailure, lastCompletionResult, memo, searchAttributes } = activation;
        // Most things related to initialization have already been handled in the constructor
        this.mutateWorkflowInfo((info) => ({
            ...info,
            searchAttributes: (0, common_1.mapFromPayloads)(common_1.searchAttributePayloadConverter, searchAttributes?.indexedFields) ?? {},
            memo: (0, common_1.mapFromPayloads)(this.payloadConverter, memo?.fields),
            lastResult: (0, common_1.fromPayloadsAtIndex)(this.payloadConverter, 0, lastCompletionResult?.payloads),
            lastFailure: continuedFailure != null
                ? this.failureConverter.failureToError(continuedFailure, this.payloadConverter)
                : undefined,
        }));
    }
    cancelWorkflow(_activation) {
        this.cancelled = true;
        this.rootScope.cancel();
    }
    fireTimer(activation) {
        // Timers are a special case where their completion might not be in Workflow state,
        // this is due to immediate timer cancellation that doesn't go wait for Core.
        const completion = this.maybeConsumeCompletion('timer', getSeq(activation));
        completion?.resolve(undefined);
    }
    resolveActivity(activation) {
        if (!activation.result) {
            throw new TypeError('Got ResolveActivity activation with no result');
        }
        const { resolve, reject } = this.consumeCompletion('activity', getSeq(activation));
        if (activation.result.completed) {
            const completed = activation.result.completed;
            const result = completed.result ? this.payloadConverter.fromPayload(completed.result) : undefined;
            resolve(result);
        }
        else if (activation.result.failed) {
            const { failure } = activation.result.failed;
            const err = failure ? this.failureToError(failure) : undefined;
            reject(err);
        }
        else if (activation.result.cancelled) {
            const { failure } = activation.result.cancelled;
            const err = failure ? this.failureToError(failure) : undefined;
            reject(err);
        }
        else if (activation.result.backoff) {
            reject(new errors_1.LocalActivityDoBackoff(activation.result.backoff));
        }
    }
    resolveChildWorkflowExecutionStart(activation) {
        const { resolve, reject } = this.consumeCompletion('childWorkflowStart', getSeq(activation));
        if (activation.succeeded) {
            resolve(activation.succeeded.runId);
        }
        else if (activation.failed) {
            if (activation.failed.cause !==
                StartChildWorkflowExecutionFailedCause.START_CHILD_WORKFLOW_EXECUTION_FAILED_CAUSE_WORKFLOW_ALREADY_EXISTS) {
                throw new common_1.IllegalStateError('Got unknown StartChildWorkflowExecutionFailedCause');
            }
            if (!(activation.seq && activation.failed.workflowId && activation.failed.workflowType)) {
                throw new TypeError('Missing attributes in activation job');
            }
            reject(new common_1.WorkflowExecutionAlreadyStartedError('Workflow execution already started', activation.failed.workflowId, activation.failed.workflowType));
        }
        else if (activation.cancelled) {
            if (!activation.cancelled.failure) {
                throw new TypeError('Got no failure in cancelled variant');
            }
            reject(this.failureToError(activation.cancelled.failure));
        }
        else {
            throw new TypeError('Got ResolveChildWorkflowExecutionStart with no status');
        }
    }
    resolveChildWorkflowExecution(activation) {
        if (!activation.result) {
            throw new TypeError('Got ResolveChildWorkflowExecution activation with no result');
        }
        const { resolve, reject } = this.consumeCompletion('childWorkflowComplete', getSeq(activation));
        if (activation.result.completed) {
            const completed = activation.result.completed;
            const result = completed.result ? this.payloadConverter.fromPayload(completed.result) : undefined;
            resolve(result);
        }
        else if (activation.result.failed) {
            const { failure } = activation.result.failed;
            if (failure === undefined || failure === null) {
                throw new TypeError('Got failed result with no failure attribute');
            }
            reject(this.failureToError(failure));
        }
        else if (activation.result.cancelled) {
            const { failure } = activation.result.cancelled;
            if (failure === undefined || failure === null) {
                throw new TypeError('Got cancelled result with no failure attribute');
            }
            reject(this.failureToError(failure));
        }
    }
    // Intentionally non-async function so this handler doesn't show up in the stack trace
    queryWorkflowNextHandler({ queryName, args }) {
        const fn = this.queryHandlers.get(queryName)?.handler;
        if (fn === undefined) {
            const knownQueryTypes = [...this.queryHandlers.keys()].join(' ');
            // Fail the query
            return Promise.reject(new ReferenceError(`Workflow did not register a handler for ${queryName}. Registered queries: [${knownQueryTypes}]`));
        }
        try {
            const ret = fn(...args);
            if (ret instanceof Promise) {
                return Promise.reject(new errors_1.DeterminismViolationError('Query handlers should not return a Promise'));
            }
            return Promise.resolve(ret);
        }
        catch (err) {
            return Promise.reject(err);
        }
    }
    queryWorkflow(activation) {
        const { queryType, queryId, headers } = activation;
        if (!(queryType && queryId)) {
            throw new TypeError('Missing query activation attributes');
        }
        const execute = (0, interceptors_1.composeInterceptors)(this.interceptors.inbound, 'handleQuery', this.queryWorkflowNextHandler.bind(this));
        execute({
            queryName: queryType,
            args: (0, common_1.arrayFromPayloads)(this.payloadConverter, activation.arguments),
            queryId,
            headers: headers ?? {},
        }).then((result) => this.completeQuery(queryId, result), (reason) => this.failQuery(queryId, reason));
    }
    doUpdate(activation) {
        const { id: updateId, protocolInstanceId, name, headers, runValidator } = activation;
        if (!updateId) {
            throw new TypeError('Missing activation update id');
        }
        if (!name) {
            throw new TypeError('Missing activation update name');
        }
        if (!protocolInstanceId) {
            throw new TypeError('Missing activation update protocolInstanceId');
        }
        const entry = this.updateHandlers.get(name);
        if (!entry) {
            this.bufferedUpdates.push(activation);
            return;
        }
        const makeInput = () => ({
            updateId,
            args: (0, common_1.arrayFromPayloads)(this.payloadConverter, activation.input),
            name,
            headers: headers ?? {},
        });
        // The implementation below is responsible for upholding, and constrained
        // by, the following contract:
        //
        // 1. If no validator is present then validation interceptors will not be run.
        //
        // 2. During validation, any error must fail the Update; during the Update
        //    itself, Temporal errors fail the Update whereas other errors fail the
        //    activation.
        //
        // 3. The handler must not see any mutations of the arguments made by the
        //    validator.
        //
        // 4. Any error when decoding/deserializing input must be caught and result
        //    in rejection of the Update before it is accepted, even if there is no
        //    validator.
        //
        // 5. The initial synchronous portion of the (async) Update handler should
        //    be executed after the (sync) validator completes such that there is
        //    minimal opportunity for a different concurrent task to be scheduled
        //    between them.
        //
        // 6. The stack trace view provided in the Temporal UI must not be polluted
        //    by promises that do not derive from user code. This implies that
        //    async/await syntax may not be used.
        //
        // Note that there is a deliberately unhandled promise rejection below.
        // These are caught elsewhere and fail the corresponding activation.
        const doUpdateImpl = async () => {
            let input;
            try {
                if (runValidator && entry.validator) {
                    const validate = (0, interceptors_1.composeInterceptors)(this.interceptors.inbound, 'validateUpdate', this.validateUpdateNextHandler.bind(this, entry.validator));
                    validate(makeInput());
                }
                input = makeInput();
            }
            catch (error) {
                this.rejectUpdate(protocolInstanceId, error);
                return;
            }
            this.acceptUpdate(protocolInstanceId);
            const execute = (0, interceptors_1.composeInterceptors)(this.interceptors.inbound, 'handleUpdate', this.updateNextHandler.bind(this, entry.handler));
            const { unfinishedPolicy } = entry;
            this.inProgressUpdates.set(updateId, { name, unfinishedPolicy, id: updateId });
            const res = execute(input)
                .then((result) => this.completeUpdate(protocolInstanceId, result))
                .catch((error) => {
                if (error instanceof common_1.TemporalFailure) {
                    this.rejectUpdate(protocolInstanceId, error);
                }
                else {
                    throw error;
                }
            })
                .finally(() => this.inProgressUpdates.delete(updateId));
            (0, stack_helpers_1.untrackPromise)(res);
            return res;
        };
        (0, stack_helpers_1.untrackPromise)(update_scope_1.UpdateScope.updateWithInfo(updateId, name, doUpdateImpl));
    }
    async updateNextHandler(handler, { args }) {
        return await handler(...args);
    }
    validateUpdateNextHandler(validator, { args }) {
        if (validator) {
            validator(...args);
        }
    }
    dispatchBufferedUpdates() {
        const bufferedUpdates = this.bufferedUpdates;
        while (bufferedUpdates.length) {
            const foundIndex = bufferedUpdates.findIndex((update) => this.updateHandlers.has(update.name));
            if (foundIndex === -1) {
                // No buffered Updates have a handler yet.
                break;
            }
            const [update] = bufferedUpdates.splice(foundIndex, 1);
            this.doUpdate(update);
        }
    }
    rejectBufferedUpdates() {
        while (this.bufferedUpdates.length) {
            const update = this.bufferedUpdates.shift();
            if (update) {
                this.rejectUpdate(
                /* eslint-disable @typescript-eslint/no-non-null-assertion */
                update.protocolInstanceId, common_1.ApplicationFailure.nonRetryable(`No registered handler for update: ${update.name}`));
            }
        }
    }
    async signalWorkflowNextHandler({ signalName, args }) {
        const fn = this.signalHandlers.get(signalName)?.handler;
        if (fn) {
            return await fn(...args);
        }
        else if (this.defaultSignalHandler) {
            return await this.defaultSignalHandler(signalName, ...args);
        }
        else {
            throw new common_1.IllegalStateError(`No registered signal handler for signal: ${signalName}`);
        }
    }
    signalWorkflow(activation) {
        const { signalName, headers } = activation;
        if (!signalName) {
            throw new TypeError('Missing activation signalName');
        }
        if (!this.signalHandlers.has(signalName) && !this.defaultSignalHandler) {
            this.bufferedSignals.push(activation);
            return;
        }
        // If we fall through to the default signal handler then the unfinished
        // policy is WARN_AND_ABANDON; users currently have no way to silence any
        // ensuing warnings.
        const unfinishedPolicy = this.signalHandlers.get(signalName)?.unfinishedPolicy ?? common_1.HandlerUnfinishedPolicy.WARN_AND_ABANDON;
        const signalExecutionNum = this.signalHandlerExecutionSeq++;
        this.inProgressSignals.set(signalExecutionNum, { name: signalName, unfinishedPolicy });
        const execute = (0, interceptors_1.composeInterceptors)(this.interceptors.inbound, 'handleSignal', this.signalWorkflowNextHandler.bind(this));
        execute({
            args: (0, common_1.arrayFromPayloads)(this.payloadConverter, activation.input),
            signalName,
            headers: headers ?? {},
        })
            .catch(this.handleWorkflowFailure.bind(this))
            .finally(() => this.inProgressSignals.delete(signalExecutionNum));
    }
    dispatchBufferedSignals() {
        const bufferedSignals = this.bufferedSignals;
        while (bufferedSignals.length) {
            if (this.defaultSignalHandler) {
                // We have a default signal handler, so all signals are dispatchable
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                this.signalWorkflow(bufferedSignals.shift());
            }
            else {
                const foundIndex = bufferedSignals.findIndex((signal) => this.signalHandlers.has(signal.signalName));
                if (foundIndex === -1)
                    break;
                const [signal] = bufferedSignals.splice(foundIndex, 1);
                this.signalWorkflow(signal);
            }
        }
    }
    resolveSignalExternalWorkflow(activation) {
        const { resolve, reject } = this.consumeCompletion('signalWorkflow', getSeq(activation));
        if (activation.failure) {
            reject(this.failureToError(activation.failure));
        }
        else {
            resolve(undefined);
        }
    }
    resolveRequestCancelExternalWorkflow(activation) {
        const { resolve, reject } = this.consumeCompletion('cancelWorkflow', getSeq(activation));
        if (activation.failure) {
            reject(this.failureToError(activation.failure));
        }
        else {
            resolve(undefined);
        }
    }
    warnIfUnfinishedHandlers() {
        const getWarnable = (handlerExecutions) => {
            return Array.from(handlerExecutions).filter((ex) => ex.unfinishedPolicy === common_1.HandlerUnfinishedPolicy.WARN_AND_ABANDON);
        };
        const warnableUpdates = getWarnable(this.inProgressUpdates.values());
        if (warnableUpdates.length > 0) {
            logs_1.log.warn(makeUnfinishedUpdateHandlerMessage(warnableUpdates));
        }
        const warnableSignals = getWarnable(this.inProgressSignals.values());
        if (warnableSignals.length > 0) {
            logs_1.log.warn(makeUnfinishedSignalHandlerMessage(warnableSignals));
        }
    }
    updateRandomSeed(activation) {
        if (!activation.randomnessSeed) {
            throw new TypeError('Expected activation with randomnessSeed attribute');
        }
        this.random = (0, alea_1.alea)(activation.randomnessSeed.toBytes());
    }
    notifyHasPatch(activation) {
        if (!this.info.unsafe.isReplaying)
            throw new common_1.IllegalStateError('Unexpected notifyHasPatch job on non-replay activation');
        if (!activation.patchId)
            throw new TypeError('notifyHasPatch missing patch id');
        this.knownPresentPatches.add(activation.patchId);
    }
    patchInternal(patchId, deprecated) {
        if (this.workflow === undefined) {
            throw new common_1.IllegalStateError('Patches cannot be used before Workflow starts');
        }
        const usePatch = !this.info.unsafe.isReplaying || this.knownPresentPatches.has(patchId);
        // Avoid sending commands for patches core already knows about.
        // This optimization enables development of automatic patching tools.
        if (usePatch && !this.sentPatches.has(patchId)) {
            this.pushCommand({
                setPatchMarker: { patchId, deprecated },
            });
            this.sentPatches.add(patchId);
        }
        return usePatch;
    }
    /**
     * Called early while handling an activation to register known flags.
     * May be invoked from outside the VM.
     */
    addKnownFlags(flags) {
        for (const flag of flags) {
            (0, flags_1.assertValidFlag)(flag);
            this.knownFlags.add(flag);
        }
    }
    /**
     * Check if an SDK Flag may be considered as enabled for the current Workflow Task.
     *
     * SDK flags play a role similar to the `patched()` API, but are meant for internal usage by the
     * SDK itself. They make it possible for the SDK to evolve its behaviors over time, while still
     * maintaining compatibility with Workflow histories produced by older SDKs, without causing
     * determinism violations.
     *
     * May be invoked from outside the VM.
     */
    hasFlag(flag) {
        if (this.knownFlags.has(flag.id))
            return true;
        // If not replaying, enable the flag if it is configured to be enabled by default. Setting a
        // flag's default to false allows progressive rollout of new feature flags, with the possibility
        // of reverting back to a version of the SDK where the flag is supported but disabled by default.
        // It is also useful for testing purpose.
        if (!this.info.unsafe.isReplaying && flag.default) {
            this.knownFlags.add(flag.id);
            return true;
        }
        // When replaying, a flag is considered enabled if it was enabled during the original execution of
        // that Workflow Task; this is normally determined by the presence of the flag ID in the corresponding
        // WFT Completed's `sdkMetadata.langUsedFlags`.
        //
        // SDK Flag Alternate Condition provides an alternative way of determining whether a flag should
        // be considered as enabled for the current WFT; e.g. by looking at the version of the SDK that
        // emitted a WFT. The main use case for this is to retroactively turn on some flags for WFT emitted
        // by previous SDKs that contained a bug. Alt Conditions should only be used as a last resort.
        //
        // Note that conditions are only evaluated while replaying. Also, alternate conditions will not
        // cause the flag to be persisted to the "used flags" set, which means that further Workflow Tasks
        // may not reflect this flag if the condition no longer holds. This is so to avoid incorrect
        // behaviors in case where a Workflow Execution has gone through a newer SDK version then again
        // through an older one.
        if (this.info.unsafe.isReplaying && flag.alternativeConditions) {
            for (const cond of flag.alternativeConditions) {
                if (cond({ info: this.info }))
                    return true;
            }
        }
        return false;
    }
    removeFromCache() {
        throw new common_1.IllegalStateError('removeFromCache activation job should not reach workflow');
    }
    /**
     * Transforms failures into a command to be sent to the server.
     * Used to handle any failure emitted by the Workflow.
     */
    async handleWorkflowFailure(error) {
        if (this.cancelled && (0, errors_1.isCancellation)(error)) {
            this.pushCommand({ cancelWorkflowExecution: {} }, true);
        }
        else if (error instanceof interfaces_1.ContinueAsNew) {
            this.pushCommand({ continueAsNewWorkflowExecution: error.command }, true);
        }
        else {
            if (!(error instanceof common_1.TemporalFailure)) {
                // This results in an unhandled rejection which will fail the activation
                // preventing it from completing.
                throw error;
            }
            // Fail the workflow. We do not want to issue unfinishedHandlers warnings. To achieve that, we
            // mark all handlers as completed now.
            this.inProgressSignals.clear();
            this.inProgressUpdates.clear();
            this.pushCommand({
                failWorkflowExecution: {
                    failure: this.errorToFailure(error),
                },
            }, true);
        }
    }
    completeQuery(queryId, result) {
        this.pushCommand({
            respondToQuery: { queryId, succeeded: { response: this.payloadConverter.toPayload(result) } },
        });
    }
    failQuery(queryId, error) {
        this.pushCommand({
            respondToQuery: {
                queryId,
                failed: this.errorToFailure((0, common_1.ensureTemporalFailure)(error)),
            },
        });
    }
    acceptUpdate(protocolInstanceId) {
        this.pushCommand({ updateResponse: { protocolInstanceId, accepted: {} } });
    }
    completeUpdate(protocolInstanceId, result) {
        this.pushCommand({
            updateResponse: { protocolInstanceId, completed: this.payloadConverter.toPayload(result) },
        });
    }
    rejectUpdate(protocolInstanceId, error) {
        this.pushCommand({
            updateResponse: {
                protocolInstanceId,
                rejected: this.errorToFailure((0, common_1.ensureTemporalFailure)(error)),
            },
        });
    }
    /** Consume a completion if it exists in Workflow state */
    maybeConsumeCompletion(type, taskSeq) {
        const completion = this.completions[type].get(taskSeq);
        if (completion !== undefined) {
            this.completions[type].delete(taskSeq);
        }
        return completion;
    }
    /** Consume a completion if it exists in Workflow state, throws if it doesn't */
    consumeCompletion(type, taskSeq) {
        const completion = this.maybeConsumeCompletion(type, taskSeq);
        if (completion === undefined) {
            throw new common_1.IllegalStateError(`No completion for taskSeq ${taskSeq}`);
        }
        return completion;
    }
    completeWorkflow(result) {
        this.pushCommand({
            completeWorkflowExecution: {
                result: this.payloadConverter.toPayload(result),
            },
        }, true);
    }
    errorToFailure(err) {
        return this.failureConverter.errorToFailure(err, this.payloadConverter);
    }
    failureToError(failure) {
        return this.failureConverter.failureToError(failure, this.payloadConverter);
    }
}
exports.Activator = Activator;
function getSeq(activation) {
    const seq = activation.seq;
    if (seq === undefined || seq === null) {
        throw new TypeError(`Got activation with no seq attribute`);
    }
    return seq;
}
function makeUnfinishedUpdateHandlerMessage(handlerExecutions) {
    const message = `
[TMPRL1102] Workflow finished while an update handler was still running. This may have interrupted work that the
update handler was doing, and the client that sent the update will receive a 'workflow execution
already completed' RPCError instead of the update result. You can wait for all update and signal
handlers to complete by using \`await workflow.condition(workflow.allHandlersFinished)\`.
Alternatively, if both you and the clients sending the update are okay with interrupting running handlers
when the workflow finishes, and causing clients to receive errors, then you can disable this warning by
passing an option when setting the handler:
\`workflow.setHandler(myUpdate, myUpdateHandler, {unfinishedPolicy: HandlerUnfinishedPolicy.ABANDON});\`.`
        .replace(/\n/g, ' ')
        .trim();
    return `${message} The following updates were unfinished (and warnings were not disabled for their handler): ${JSON.stringify(handlerExecutions.map((ex) => ({ name: ex.name, id: ex.id })))}`;
}
function makeUnfinishedSignalHandlerMessage(handlerExecutions) {
    const message = `
[TMPRL1102] Workflow finished while a signal handler was still running. This may have interrupted work that the
signal handler was doing. You can wait for all update and signal handlers to complete by using
\`await workflow.condition(workflow.allHandlersFinished)\`. Alternatively, if both you and the
clients sending the update are okay with interrupting running handlers when the workflow finishes,
then you can disable this warning by passing an option when setting the handler:
\`workflow.setHandler(mySignal, mySignalHandler, {unfinishedPolicy: HandlerUnfinishedPolicy.ABANDON});\`.`
        .replace(/\n/g, ' ')
        .trim();
    const names = new Map();
    for (const ex of handlerExecutions) {
        const count = names.get(ex.name) || 0;
        names.set(ex.name, count + 1);
    }
    return `${message} The following signals were unfinished (and warnings were not disabled for their handler): ${JSON.stringify(Array.from(names.entries()).map(([name, count]) => ({ name, count })))}`;
}


/***/ }),

/***/ "./node_modules/@temporalio/workflow/lib/logs.js":
/*!*******************************************************!*\
  !*** ./node_modules/@temporalio/workflow/lib/logs.js ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.workflowLogAttributes = exports.executeWithLifecycleLogging = exports.log = void 0;
const interceptors_1 = __webpack_require__(/*! @temporalio/common/lib/interceptors */ "./node_modules/@temporalio/common/lib/interceptors.js");
const common_1 = __webpack_require__(/*! @temporalio/common */ "./node_modules/@temporalio/common/lib/index.js");
const stack_helpers_1 = __webpack_require__(/*! ./stack-helpers */ "./node_modules/@temporalio/workflow/lib/stack-helpers.js");
const sinks_1 = __webpack_require__(/*! ./sinks */ "./node_modules/@temporalio/workflow/lib/sinks.js");
const errors_1 = __webpack_require__(/*! ./errors */ "./node_modules/@temporalio/workflow/lib/errors.js");
const interfaces_1 = __webpack_require__(/*! ./interfaces */ "./node_modules/@temporalio/workflow/lib/interfaces.js");
const global_attributes_1 = __webpack_require__(/*! ./global-attributes */ "./node_modules/@temporalio/workflow/lib/global-attributes.js");
const loggerSink = (0, sinks_1.proxySinks)().__temporal_logger;
/**
 * Symbol used by the SDK logger to extract a timestamp from log attributes.
 * Also defined in `worker/logger.ts` - intentionally not shared.
 */
const LogTimestamp = Symbol.for('log_timestamp');
/**
 * Default workflow logger.
 *
 * This logger is replay-aware and will omit log messages on workflow replay. Messages emitted by this logger are
 * funnelled through a sink that forwards them to the logger registered on {@link Runtime.logger}.
 *
 * Attributes from the current Workflow Execution context are automatically included as metadata on every log
 * entries. An extra `sdkComponent` metadata attribute is also added, with value `workflow`; this can be used for
 * fine-grained filtering of log entries further downstream.
 *
 * To customize log attributes, register a {@link WorkflowOutboundCallsInterceptor} that intercepts the
 * `getLogAttributes()` method.
 *
 * Notice that since sinks are used to power this logger, any log attributes must be transferable via the
 * {@link https://nodejs.org/api/worker_threads.html#worker_threads_port_postmessage_value_transferlist | postMessage}
 * API.
 *
 * NOTE: Specifying a custom logger through {@link defaultSink} or by manually registering a sink named
 * `defaultWorkerLogger` has been deprecated. Please use {@link Runtime.logger} instead.
 */
exports.log = Object.fromEntries(['trace', 'debug', 'info', 'warn', 'error'].map((level) => {
    return [
        level,
        (message, attrs) => {
            const activator = (0, global_attributes_1.assertInWorkflowContext)('Workflow.log(...) may only be used from workflow context.');
            const getLogAttributes = (0, interceptors_1.composeInterceptors)(activator.interceptors.outbound, 'getLogAttributes', (a) => a);
            return loggerSink[level](message, {
                // Inject the call time in nanosecond resolution as expected by the worker logger.
                [LogTimestamp]: activator.getTimeOfDay(),
                sdkComponent: common_1.SdkComponent.workflow,
                ...getLogAttributes(workflowLogAttributes(activator.info)),
                ...attrs,
            });
        },
    ];
}));
function executeWithLifecycleLogging(fn) {
    exports.log.debug('Workflow started', { sdkComponent: common_1.SdkComponent.worker });
    const p = fn().then((res) => {
        exports.log.debug('Workflow completed', { sdkComponent: common_1.SdkComponent.worker });
        return res;
    }, (error) => {
        // Avoid using instanceof checks in case the modules they're defined in loaded more than once,
        // e.g. by jest or when multiple versions are installed.
        if (typeof error === 'object' && error != null) {
            if ((0, errors_1.isCancellation)(error)) {
                exports.log.debug('Workflow completed as cancelled', { sdkComponent: common_1.SdkComponent.worker });
                throw error;
            }
            else if (error instanceof interfaces_1.ContinueAsNew) {
                exports.log.debug('Workflow continued as new', { sdkComponent: common_1.SdkComponent.worker });
                throw error;
            }
        }
        exports.log.warn('Workflow failed', { error, sdkComponent: common_1.SdkComponent.worker });
        throw error;
    });
    // Avoid showing this interceptor in stack trace query
    (0, stack_helpers_1.untrackPromise)(p);
    return p;
}
exports.executeWithLifecycleLogging = executeWithLifecycleLogging;
/**
 * Returns a map of attributes to be set _by default_ on log messages for a given Workflow.
 * Note that this function may be called from outside of the Workflow context (eg. by the worker itself).
 */
function workflowLogAttributes(info) {
    return {
        namespace: info.namespace,
        taskQueue: info.taskQueue,
        workflowId: info.workflowId,
        runId: info.runId,
        workflowType: info.workflowType,
    };
}
exports.workflowLogAttributes = workflowLogAttributes;


/***/ }),

/***/ "./node_modules/@temporalio/workflow/lib/pkg.js":
/*!******************************************************!*\
  !*** ./node_modules/@temporalio/workflow/lib/pkg.js ***!
  \******************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
// ../package.json is outside of the TS project rootDir which causes TS to complain about this import.
// We do not want to change the rootDir because it messes up the output structure.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const package_json_1 = __importDefault(__webpack_require__(/*! ../package.json */ "./node_modules/@temporalio/workflow/package.json"));
exports["default"] = package_json_1.default;


/***/ }),

/***/ "./node_modules/@temporalio/workflow/lib/sinks.js":
/*!********************************************************!*\
  !*** ./node_modules/@temporalio/workflow/lib/sinks.js ***!
  \********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/**
 * Type definitions for the Workflow end of the sinks mechanism.
 *
 * Sinks are a mechanism for exporting data from the Workflow isolate to the
 * Node.js environment, they are necessary because the Workflow has no way to
 * communicate with the outside World.
 *
 * Sinks are typically used for exporting logs, metrics and traces out from the
 * Workflow.
 *
 * Sink functions may not return values to the Workflow in order to prevent
 * breaking determinism.
 *
 * @module
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.proxySinks = void 0;
const global_attributes_1 = __webpack_require__(/*! ./global-attributes */ "./node_modules/@temporalio/workflow/lib/global-attributes.js");
/**
 * Get a reference to Sinks for exporting data out of the Workflow.
 *
 * These Sinks **must** be registered with the Worker in order for this
 * mechanism to work.
 *
 * @example
 * ```ts
 * import { proxySinks, Sinks } from '@temporalio/workflow';
 *
 * interface MySinks extends Sinks {
 *   logger: {
 *     info(message: string): void;
 *     error(message: string): void;
 *   };
 * }
 *
 * const { logger } = proxySinks<MyDependencies>();
 * logger.info('setting up');
 *
 * export function myWorkflow() {
 *   return {
 *     async execute() {
 *       logger.info("hey ho");
 *       logger.error("lets go");
 *     }
 *   };
 * }
 * ```
 */
function proxySinks() {
    return new Proxy({}, {
        get(_, ifaceName) {
            return new Proxy({}, {
                get(_, fnName) {
                    return (...args) => {
                        const activator = (0, global_attributes_1.assertInWorkflowContext)('Proxied sinks functions may only be used from a Workflow Execution.');
                        activator.sinkCalls.push({
                            ifaceName: ifaceName,
                            fnName: fnName,
                            // Sink function doesn't get called immediately. Make a clone of the sink's args, so that further mutations
                            // to these objects don't corrupt the args that the sink function will receive. Only available from node 17.
                            args: globalThis.structuredClone ? globalThis.structuredClone(args) : args,
                            // activator.info is internally copy-on-write. This ensure that any further mutations
                            // to the workflow state in the context of the present activation will not corrupt the
                            // workflowInfo state that gets passed when the sink function actually gets called.
                            workflowInfo: activator.info,
                        });
                    };
                },
            });
        },
    });
}
exports.proxySinks = proxySinks;


/***/ }),

/***/ "./node_modules/@temporalio/workflow/lib/stack-helpers.js":
/*!****************************************************************!*\
  !*** ./node_modules/@temporalio/workflow/lib/stack-helpers.js ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.untrackPromise = void 0;
const global_attributes_1 = __webpack_require__(/*! ./global-attributes */ "./node_modules/@temporalio/workflow/lib/global-attributes.js");
/**
 * Helper function to remove a promise from being tracked for stack trace query purposes
 */
function untrackPromise(promise) {
    const store = (0, global_attributes_1.maybeGetActivatorUntyped)()?.promiseStackStore;
    if (!store)
        return;
    store.childToParent.delete(promise);
    store.promiseToStack.delete(promise);
}
exports.untrackPromise = untrackPromise;


/***/ }),

/***/ "./node_modules/@temporalio/workflow/lib/trigger.js":
/*!**********************************************************!*\
  !*** ./node_modules/@temporalio/workflow/lib/trigger.js ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Trigger = void 0;
const cancellation_scope_1 = __webpack_require__(/*! ./cancellation-scope */ "./node_modules/@temporalio/workflow/lib/cancellation-scope.js");
const stack_helpers_1 = __webpack_require__(/*! ./stack-helpers */ "./node_modules/@temporalio/workflow/lib/stack-helpers.js");
/**
 * A `PromiseLike` helper which exposes its `resolve` and `reject` methods.
 *
 * Trigger is CancellationScope-aware: it is linked to the current scope on
 * construction and throws when that scope is cancelled.
 *
 * Useful for e.g. waiting for unblocking a Workflow from a Signal.
 *
 * @example
 * <!--SNIPSTART typescript-trigger-workflow-->
 * <!--SNIPEND-->
 */
class Trigger {
    constructor() {
        this.promise = new Promise((resolve, reject) => {
            const scope = cancellation_scope_1.CancellationScope.current();
            if (scope.cancellable) {
                (0, stack_helpers_1.untrackPromise)(scope.cancelRequested.catch(reject));
            }
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            this.resolve = resolve;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            this.reject = reject;
        });
        // Avoid unhandled rejections
        (0, stack_helpers_1.untrackPromise)(this.promise.catch(() => undefined));
    }
    then(onfulfilled, onrejected) {
        return this.promise.then(onfulfilled, onrejected);
    }
}
exports.Trigger = Trigger;


/***/ }),

/***/ "./node_modules/@temporalio/workflow/lib/update-scope.js":
/*!***************************************************************!*\
  !*** ./node_modules/@temporalio/workflow/lib/update-scope.js ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.disableUpdateStorage = exports.UpdateScope = exports.AsyncLocalStorage = void 0;
// AsyncLocalStorage is injected via vm module into global scope.
// In case Workflow code is imported in Node.js context, replace with an empty class.
exports.AsyncLocalStorage = globalThis.AsyncLocalStorage ?? class {
};
class UpdateScope {
    constructor(options) {
        this.id = options.id;
        this.name = options.name;
    }
    /**
     * Activate the scope as current and run the update handler `fn`.
     *
     * @return the result of `fn`
     */
    run(fn) {
        return storage.run(this, fn);
    }
    /**
     * Get the current "active" update scope.
     */
    static current() {
        return storage.getStore();
    }
    /** Alias to `new UpdateScope({ id, name }).run(fn)` */
    static updateWithInfo(id, name, fn) {
        return new this({ id, name }).run(fn);
    }
}
exports.UpdateScope = UpdateScope;
const storage = new exports.AsyncLocalStorage();
/**
 * Disable the async local storage for updates.
 */
function disableUpdateStorage() {
    storage.disable();
}
exports.disableUpdateStorage = disableUpdateStorage;


/***/ }),

/***/ "./node_modules/@temporalio/workflow/lib/worker-interface.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@temporalio/workflow/lib/worker-interface.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.dispose = exports.tryUnblockConditions = exports.concludeActivation = exports.activate = exports.initialize = exports.initRuntime = void 0;
/**
 * Exported functions for the Worker to interact with the Workflow isolate
 *
 * @module
 */
const common_1 = __webpack_require__(/*! @temporalio/common */ "./node_modules/@temporalio/common/lib/index.js");
const interceptors_1 = __webpack_require__(/*! @temporalio/common/lib/interceptors */ "./node_modules/@temporalio/common/lib/interceptors.js");
const cancellation_scope_1 = __webpack_require__(/*! ./cancellation-scope */ "./node_modules/@temporalio/workflow/lib/cancellation-scope.js");
const update_scope_1 = __webpack_require__(/*! ./update-scope */ "./node_modules/@temporalio/workflow/lib/update-scope.js");
const internals_1 = __webpack_require__(/*! ./internals */ "./node_modules/@temporalio/workflow/lib/internals.js");
const global_attributes_1 = __webpack_require__(/*! ./global-attributes */ "./node_modules/@temporalio/workflow/lib/global-attributes.js");
const global = globalThis;
const OriginalDate = globalThis.Date;
/**
 * Initialize the isolate runtime.
 *
 * Sets required internal state and instantiates the workflow and interceptors.
 */
function initRuntime(options) {
    const activator = new internals_1.Activator({
        ...options,
        info: fixPrototypes({
            ...options.info,
            unsafe: { ...options.info.unsafe, now: OriginalDate.now },
        }),
    });
    // There's one activator per workflow instance, set it globally on the context.
    // We do this before importing any user code so user code can statically reference @temporalio/workflow functions
    // as well as Date and Math.random.
    (0, global_attributes_1.setActivatorUntyped)(activator);
    // webpack alias to payloadConverterPath
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const customPayloadConverter = (__webpack_require__(/*! __temporal_custom_payload_converter */ "?2065").payloadConverter);
    // The `payloadConverter` export is validated in the Worker
    if (customPayloadConverter != null) {
        activator.payloadConverter = customPayloadConverter;
    }
    // webpack alias to failureConverterPath
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const customFailureConverter = (__webpack_require__(/*! __temporal_custom_failure_converter */ "?31ff").failureConverter);
    // The `failureConverter` export is validated in the Worker
    if (customFailureConverter != null) {
        activator.failureConverter = customFailureConverter;
    }
    const { importWorkflows, importInterceptors } = global.__TEMPORAL__;
    if (importWorkflows === undefined || importInterceptors === undefined) {
        throw new common_1.IllegalStateError('Workflow bundle did not register import hooks');
    }
    const interceptors = importInterceptors();
    for (const mod of interceptors) {
        const factory = mod.interceptors;
        if (factory !== undefined) {
            if (typeof factory !== 'function') {
                throw new TypeError(`Failed to initialize workflows interceptors: expected a function, but got: '${factory}'`);
            }
            const interceptors = factory();
            activator.interceptors.inbound.push(...(interceptors.inbound ?? []));
            activator.interceptors.outbound.push(...(interceptors.outbound ?? []));
            activator.interceptors.internals.push(...(interceptors.internals ?? []));
        }
    }
    const mod = importWorkflows();
    const workflowFn = mod[activator.info.workflowType];
    const defaultWorkflowFn = mod['default'];
    if (typeof workflowFn === 'function') {
        activator.workflow = workflowFn;
    }
    else if (typeof defaultWorkflowFn === 'function') {
        activator.workflow = defaultWorkflowFn;
    }
    else {
        const details = workflowFn === undefined
            ? 'no such function is exported by the workflow bundle'
            : `expected a function, but got: '${typeof workflowFn}'`;
        throw new TypeError(`Failed to initialize workflow of type '${activator.info.workflowType}': ${details}`);
    }
}
exports.initRuntime = initRuntime;
/**
 * Objects transfered to the VM from outside have prototypes belonging to the
 * outer context, which means that instanceof won't work inside the VM. This
 * function recursively walks over the content of an object, and recreate some
 * of these objects (notably Array, Date and Objects).
 */
function fixPrototypes(obj) {
    if (obj != null && typeof obj === 'object') {
        switch (Object.getPrototypeOf(obj)?.constructor?.name) {
            case 'Array':
                return Array.from(obj.map(fixPrototypes));
            case 'Date':
                return new Date(obj);
            default:
                return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, fixPrototypes(v)]));
        }
    }
    else
        return obj;
}
/**
 * Initialize the workflow. Or to be exact, _complete_ initialization, as most part has been done in constructor).
 */
function initialize(initializeWorkflowJob) {
    (0, global_attributes_1.getActivator)().initializeWorkflow(initializeWorkflowJob);
}
exports.initialize = initialize;
/**
 * Run a chunk of activation jobs
 */
function activate(activation, batchIndex = 0) {
    const activator = (0, global_attributes_1.getActivator)();
    const intercept = (0, interceptors_1.composeInterceptors)(activator.interceptors.internals, 'activate', ({ activation }) => {
        // Cast from the interface to the class which has the `variant` attribute.
        // This is safe because we know that activation is a proto class.
        const jobs = activation.jobs;
        // Initialization will have been handled already, but we might still need to start the workflow function
        const startWorkflowJob = jobs[0].variant === 'initializeWorkflow' ? jobs.shift()?.initializeWorkflow : undefined;
        for (const job of jobs) {
            if (job.variant === undefined)
                throw new TypeError('Expected job.variant to be defined');
            const variant = job[job.variant];
            if (!variant)
                throw new TypeError(`Expected job.${job.variant} to be set`);
            activator[job.variant](variant /* TS can't infer this type */);
            if (job.variant !== 'queryWorkflow')
                tryUnblockConditions();
        }
        if (startWorkflowJob) {
            const safeJobTypes = [
                'initializeWorkflow',
                'signalWorkflow',
                'doUpdate',
                'cancelWorkflow',
                'updateRandomSeed',
            ];
            if (jobs.some((job) => !safeJobTypes.includes(job.variant))) {
                throw new TypeError('Received both initializeWorkflow and non-signal/non-update jobs in the same activation: ' +
                    JSON.stringify(jobs.map((job) => job.variant)));
            }
            activator.startWorkflow(startWorkflowJob);
            tryUnblockConditions();
        }
    });
    intercept({ activation, batchIndex });
}
exports.activate = activate;
/**
 * Conclude a single activation.
 * Should be called after processing all activation jobs and queued microtasks.
 *
 * Activation failures are handled in the main Node.js isolate.
 */
function concludeActivation() {
    const activator = (0, global_attributes_1.getActivator)();
    activator.rejectBufferedUpdates();
    const intercept = (0, interceptors_1.composeInterceptors)(activator.interceptors.internals, 'concludeActivation', (input) => input);
    const activationCompletion = activator.concludeActivation();
    const { commands } = intercept({ commands: activationCompletion.commands });
    if (activator.completed) {
        activator.warnIfUnfinishedHandlers();
    }
    return {
        runId: activator.info.runId,
        successful: { ...activationCompletion, commands },
    };
}
exports.concludeActivation = concludeActivation;
/**
 * Loop through all blocked conditions, evaluate and unblock if possible.
 *
 * @returns number of unblocked conditions.
 */
function tryUnblockConditions() {
    let numUnblocked = 0;
    for (;;) {
        const prevUnblocked = numUnblocked;
        for (const [seq, cond] of (0, global_attributes_1.getActivator)().blockedConditions.entries()) {
            if (cond.fn()) {
                cond.resolve();
                numUnblocked++;
                // It is safe to delete elements during map iteration
                (0, global_attributes_1.getActivator)().blockedConditions.delete(seq);
            }
        }
        if (prevUnblocked === numUnblocked) {
            break;
        }
    }
    return numUnblocked;
}
exports.tryUnblockConditions = tryUnblockConditions;
function dispose() {
    const dispose = (0, interceptors_1.composeInterceptors)((0, global_attributes_1.getActivator)().interceptors.internals, 'dispose', async () => {
        (0, cancellation_scope_1.disableStorage)();
        (0, update_scope_1.disableUpdateStorage)();
    });
    dispose({});
}
exports.dispose = dispose;


/***/ }),

/***/ "./node_modules/@temporalio/workflow/lib/workflow.js":
/*!***********************************************************!*\
  !*** ./node_modules/@temporalio/workflow/lib/workflow.js ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.workflowMetadataQuery = exports.enhancedStackTraceQuery = exports.stackTraceQuery = exports.allHandlersFinished = exports.upsertMemo = exports.upsertSearchAttributes = exports.setDefaultSignalHandler = exports.setHandler = exports.defineQuery = exports.defineSignal = exports.defineUpdate = exports.condition = exports.deprecatePatch = exports.patched = exports.uuid4 = exports.continueAsNew = exports.makeContinueAsNewFunc = exports.inWorkflowContext = exports.currentUpdateInfo = exports.workflowInfo = exports.executeChild = exports.startChild = exports.getExternalWorkflowHandle = exports.proxyLocalActivities = exports.proxyActivities = exports.NotAnActivityMethod = exports.scheduleLocalActivity = exports.scheduleActivity = exports.sleep = exports.addDefaultWorkflowOptions = void 0;
const common_1 = __webpack_require__(/*! @temporalio/common */ "./node_modules/@temporalio/common/lib/index.js");
const versioning_intent_enum_1 = __webpack_require__(/*! @temporalio/common/lib/versioning-intent-enum */ "./node_modules/@temporalio/common/lib/versioning-intent-enum.js");
const time_1 = __webpack_require__(/*! @temporalio/common/lib/time */ "./node_modules/@temporalio/common/lib/time.js");
const interceptors_1 = __webpack_require__(/*! @temporalio/common/lib/interceptors */ "./node_modules/@temporalio/common/lib/interceptors.js");
const cancellation_scope_1 = __webpack_require__(/*! ./cancellation-scope */ "./node_modules/@temporalio/workflow/lib/cancellation-scope.js");
const update_scope_1 = __webpack_require__(/*! ./update-scope */ "./node_modules/@temporalio/workflow/lib/update-scope.js");
const interfaces_1 = __webpack_require__(/*! ./interfaces */ "./node_modules/@temporalio/workflow/lib/interfaces.js");
const errors_1 = __webpack_require__(/*! ./errors */ "./node_modules/@temporalio/workflow/lib/errors.js");
const global_attributes_1 = __webpack_require__(/*! ./global-attributes */ "./node_modules/@temporalio/workflow/lib/global-attributes.js");
const stack_helpers_1 = __webpack_require__(/*! ./stack-helpers */ "./node_modules/@temporalio/workflow/lib/stack-helpers.js");
// Avoid a circular dependency
(0, cancellation_scope_1.registerSleepImplementation)(sleep);
/**
 * Adds default values of `workflowId` and `cancellationType` to given workflow options.
 */
function addDefaultWorkflowOptions(opts) {
    const { args, workflowId, ...rest } = opts;
    return {
        workflowId: workflowId ?? uuid4(),
        args: (args ?? []),
        cancellationType: interfaces_1.ChildWorkflowCancellationType.WAIT_CANCELLATION_COMPLETED,
        ...rest,
    };
}
exports.addDefaultWorkflowOptions = addDefaultWorkflowOptions;
/**
 * Push a startTimer command into state accumulator and register completion
 */
function timerNextHandler(input) {
    const activator = (0, global_attributes_1.getActivator)();
    return new Promise((resolve, reject) => {
        const scope = cancellation_scope_1.CancellationScope.current();
        if (scope.consideredCancelled) {
            (0, stack_helpers_1.untrackPromise)(scope.cancelRequested.catch(reject));
            return;
        }
        if (scope.cancellable) {
            (0, stack_helpers_1.untrackPromise)(scope.cancelRequested.catch((err) => {
                if (!activator.completions.timer.delete(input.seq)) {
                    return; // Already resolved or never scheduled
                }
                activator.pushCommand({
                    cancelTimer: {
                        seq: input.seq,
                    },
                });
                reject(err);
            }));
        }
        activator.pushCommand({
            startTimer: {
                seq: input.seq,
                startToFireTimeout: (0, time_1.msToTs)(input.durationMs),
            },
        });
        activator.completions.timer.set(input.seq, {
            resolve,
            reject,
        });
    });
}
/**
 * Asynchronous sleep.
 *
 * Schedules a timer on the Temporal service.
 *
 * @param ms sleep duration - number of milliseconds or {@link https://www.npmjs.com/package/ms | ms-formatted string}.
 * If given a negative number or 0, value will be set to 1.
 */
function sleep(ms) {
    const activator = (0, global_attributes_1.assertInWorkflowContext)('Workflow.sleep(...) may only be used from a Workflow Execution');
    const seq = activator.nextSeqs.timer++;
    const durationMs = Math.max(1, (0, time_1.msToNumber)(ms));
    const execute = (0, interceptors_1.composeInterceptors)(activator.interceptors.outbound, 'startTimer', timerNextHandler);
    return execute({
        durationMs,
        seq,
    });
}
exports.sleep = sleep;
function validateActivityOptions(options) {
    if (options.scheduleToCloseTimeout === undefined && options.startToCloseTimeout === undefined) {
        throw new TypeError('Required either scheduleToCloseTimeout or startToCloseTimeout');
    }
}
// Use same validation we use for normal activities
const validateLocalActivityOptions = validateActivityOptions;
/**
 * Push a scheduleActivity command into activator accumulator and register completion
 */
function scheduleActivityNextHandler({ options, args, headers, seq, activityType }) {
    const activator = (0, global_attributes_1.getActivator)();
    validateActivityOptions(options);
    return new Promise((resolve, reject) => {
        const scope = cancellation_scope_1.CancellationScope.current();
        if (scope.consideredCancelled) {
            (0, stack_helpers_1.untrackPromise)(scope.cancelRequested.catch(reject));
            return;
        }
        if (scope.cancellable) {
            (0, stack_helpers_1.untrackPromise)(scope.cancelRequested.catch(() => {
                if (!activator.completions.activity.has(seq)) {
                    return; // Already resolved or never scheduled
                }
                activator.pushCommand({
                    requestCancelActivity: {
                        seq,
                    },
                });
            }));
        }
        activator.pushCommand({
            scheduleActivity: {
                seq,
                activityId: options.activityId ?? `${seq}`,
                activityType,
                arguments: (0, common_1.toPayloads)(activator.payloadConverter, ...args),
                retryPolicy: options.retry ? (0, common_1.compileRetryPolicy)(options.retry) : undefined,
                taskQueue: options.taskQueue || activator.info.taskQueue,
                heartbeatTimeout: (0, time_1.msOptionalToTs)(options.heartbeatTimeout),
                scheduleToCloseTimeout: (0, time_1.msOptionalToTs)(options.scheduleToCloseTimeout),
                startToCloseTimeout: (0, time_1.msOptionalToTs)(options.startToCloseTimeout),
                scheduleToStartTimeout: (0, time_1.msOptionalToTs)(options.scheduleToStartTimeout),
                headers,
                cancellationType: options.cancellationType,
                doNotEagerlyExecute: !(options.allowEagerDispatch ?? true),
                versioningIntent: (0, versioning_intent_enum_1.versioningIntentToProto)(options.versioningIntent),
            },
        });
        activator.completions.activity.set(seq, {
            resolve,
            reject,
        });
    });
}
/**
 * Push a scheduleActivity command into state accumulator and register completion
 */
async function scheduleLocalActivityNextHandler({ options, args, headers, seq, activityType, attempt, originalScheduleTime, }) {
    const activator = (0, global_attributes_1.getActivator)();
    // Eagerly fail the local activity (which will in turn fail the workflow task.
    // Do not fail on replay where the local activities may not be registered on the replay worker.
    if (!activator.info.unsafe.isReplaying && !activator.registeredActivityNames.has(activityType)) {
        throw new ReferenceError(`Local activity of type '${activityType}' not registered on worker`);
    }
    validateLocalActivityOptions(options);
    return new Promise((resolve, reject) => {
        const scope = cancellation_scope_1.CancellationScope.current();
        if (scope.consideredCancelled) {
            (0, stack_helpers_1.untrackPromise)(scope.cancelRequested.catch(reject));
            return;
        }
        if (scope.cancellable) {
            (0, stack_helpers_1.untrackPromise)(scope.cancelRequested.catch(() => {
                if (!activator.completions.activity.has(seq)) {
                    return; // Already resolved or never scheduled
                }
                activator.pushCommand({
                    requestCancelLocalActivity: {
                        seq,
                    },
                });
            }));
        }
        activator.pushCommand({
            scheduleLocalActivity: {
                seq,
                attempt,
                originalScheduleTime,
                // Intentionally not exposing activityId as an option
                activityId: `${seq}`,
                activityType,
                arguments: (0, common_1.toPayloads)(activator.payloadConverter, ...args),
                retryPolicy: options.retry ? (0, common_1.compileRetryPolicy)(options.retry) : undefined,
                scheduleToCloseTimeout: (0, time_1.msOptionalToTs)(options.scheduleToCloseTimeout),
                startToCloseTimeout: (0, time_1.msOptionalToTs)(options.startToCloseTimeout),
                scheduleToStartTimeout: (0, time_1.msOptionalToTs)(options.scheduleToStartTimeout),
                localRetryThreshold: (0, time_1.msOptionalToTs)(options.localRetryThreshold),
                headers,
                cancellationType: options.cancellationType,
            },
        });
        activator.completions.activity.set(seq, {
            resolve,
            reject,
        });
    });
}
/**
 * Schedule an activity and run outbound interceptors
 * @hidden
 */
function scheduleActivity(activityType, args, options) {
    const activator = (0, global_attributes_1.assertInWorkflowContext)('Workflow.scheduleActivity(...) may only be used from a Workflow Execution');
    if (options === undefined) {
        throw new TypeError('Got empty activity options');
    }
    const seq = activator.nextSeqs.activity++;
    const execute = (0, interceptors_1.composeInterceptors)(activator.interceptors.outbound, 'scheduleActivity', scheduleActivityNextHandler);
    return execute({
        activityType,
        headers: {},
        options,
        args,
        seq,
    });
}
exports.scheduleActivity = scheduleActivity;
/**
 * Schedule an activity and run outbound interceptors
 * @hidden
 */
async function scheduleLocalActivity(activityType, args, options) {
    const activator = (0, global_attributes_1.assertInWorkflowContext)('Workflow.scheduleLocalActivity(...) may only be used from a Workflow Execution');
    if (options === undefined) {
        throw new TypeError('Got empty activity options');
    }
    let attempt = 1;
    let originalScheduleTime = undefined;
    for (;;) {
        const seq = activator.nextSeqs.activity++;
        const execute = (0, interceptors_1.composeInterceptors)(activator.interceptors.outbound, 'scheduleLocalActivity', scheduleLocalActivityNextHandler);
        try {
            return (await execute({
                activityType,
                headers: {},
                options,
                args,
                seq,
                attempt,
                originalScheduleTime,
            }));
        }
        catch (err) {
            if (err instanceof errors_1.LocalActivityDoBackoff) {
                await sleep((0, time_1.requiredTsToMs)(err.backoff.backoffDuration, 'backoffDuration'));
                if (typeof err.backoff.attempt !== 'number') {
                    throw new TypeError('Invalid backoff attempt type');
                }
                attempt = err.backoff.attempt;
                originalScheduleTime = err.backoff.originalScheduleTime ?? undefined;
            }
            else {
                throw err;
            }
        }
    }
}
exports.scheduleLocalActivity = scheduleLocalActivity;
function startChildWorkflowExecutionNextHandler({ options, headers, workflowType, seq, }) {
    const activator = (0, global_attributes_1.getActivator)();
    const workflowId = options.workflowId ?? uuid4();
    const startPromise = new Promise((resolve, reject) => {
        const scope = cancellation_scope_1.CancellationScope.current();
        if (scope.consideredCancelled) {
            (0, stack_helpers_1.untrackPromise)(scope.cancelRequested.catch(reject));
            return;
        }
        if (scope.cancellable) {
            (0, stack_helpers_1.untrackPromise)(scope.cancelRequested.catch(() => {
                const complete = !activator.completions.childWorkflowComplete.has(seq);
                if (!complete) {
                    activator.pushCommand({
                        cancelChildWorkflowExecution: { childWorkflowSeq: seq },
                    });
                }
                // Nothing to cancel otherwise
            }));
        }
        activator.pushCommand({
            startChildWorkflowExecution: {
                seq,
                workflowId,
                workflowType,
                input: (0, common_1.toPayloads)(activator.payloadConverter, ...options.args),
                retryPolicy: options.retry ? (0, common_1.compileRetryPolicy)(options.retry) : undefined,
                taskQueue: options.taskQueue || activator.info.taskQueue,
                workflowExecutionTimeout: (0, time_1.msOptionalToTs)(options.workflowExecutionTimeout),
                workflowRunTimeout: (0, time_1.msOptionalToTs)(options.workflowRunTimeout),
                workflowTaskTimeout: (0, time_1.msOptionalToTs)(options.workflowTaskTimeout),
                namespace: activator.info.namespace, // Not configurable
                headers,
                cancellationType: options.cancellationType,
                workflowIdReusePolicy: options.workflowIdReusePolicy,
                parentClosePolicy: options.parentClosePolicy,
                cronSchedule: options.cronSchedule,
                searchAttributes: options.searchAttributes
                    ? (0, common_1.mapToPayloads)(common_1.searchAttributePayloadConverter, options.searchAttributes)
                    : undefined,
                memo: options.memo && (0, common_1.mapToPayloads)(activator.payloadConverter, options.memo),
                versioningIntent: (0, versioning_intent_enum_1.versioningIntentToProto)(options.versioningIntent),
            },
        });
        activator.completions.childWorkflowStart.set(seq, {
            resolve,
            reject,
        });
    });
    // We construct a Promise for the completion of the child Workflow before we know
    // if the Workflow code will await it to capture the result in case it does.
    const completePromise = new Promise((resolve, reject) => {
        // Chain start Promise rejection to the complete Promise.
        (0, stack_helpers_1.untrackPromise)(startPromise.catch(reject));
        activator.completions.childWorkflowComplete.set(seq, {
            resolve,
            reject,
        });
    });
    (0, stack_helpers_1.untrackPromise)(startPromise);
    (0, stack_helpers_1.untrackPromise)(completePromise);
    // Prevent unhandled rejection because the completion might not be awaited
    (0, stack_helpers_1.untrackPromise)(completePromise.catch(() => undefined));
    const ret = new Promise((resolve) => resolve([startPromise, completePromise]));
    (0, stack_helpers_1.untrackPromise)(ret);
    return ret;
}
function signalWorkflowNextHandler({ seq, signalName, args, target, headers }) {
    const activator = (0, global_attributes_1.getActivator)();
    return new Promise((resolve, reject) => {
        const scope = cancellation_scope_1.CancellationScope.current();
        if (scope.consideredCancelled) {
            (0, stack_helpers_1.untrackPromise)(scope.cancelRequested.catch(reject));
            return;
        }
        if (scope.cancellable) {
            (0, stack_helpers_1.untrackPromise)(scope.cancelRequested.catch(() => {
                if (!activator.completions.signalWorkflow.has(seq)) {
                    return;
                }
                activator.pushCommand({ cancelSignalWorkflow: { seq } });
            }));
        }
        activator.pushCommand({
            signalExternalWorkflowExecution: {
                seq,
                args: (0, common_1.toPayloads)(activator.payloadConverter, ...args),
                headers,
                signalName,
                ...(target.type === 'external'
                    ? {
                        workflowExecution: {
                            namespace: activator.info.namespace,
                            ...target.workflowExecution,
                        },
                    }
                    : {
                        childWorkflowId: target.childWorkflowId,
                    }),
            },
        });
        activator.completions.signalWorkflow.set(seq, { resolve, reject });
    });
}
/**
 * Symbol used in the return type of proxy methods to mark that an attribute on the source type is not a method.
 *
 * @see {@link ActivityInterfaceFor}
 * @see {@link proxyActivities}
 * @see {@link proxyLocalActivities}
 */
exports.NotAnActivityMethod = Symbol.for('__TEMPORAL_NOT_AN_ACTIVITY_METHOD');
/**
 * Configure Activity functions with given {@link ActivityOptions}.
 *
 * This method may be called multiple times to setup Activities with different options.
 *
 * @return a {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy | Proxy} for
 *         which each attribute is a callable Activity function
 *
 * @example
 * ```ts
 * import { proxyActivities } from '@temporalio/workflow';
 * import * as activities from '../activities';
 *
 * // Setup Activities from module exports
 * const { httpGet, otherActivity } = proxyActivities<typeof activities>({
 *   startToCloseTimeout: '30 minutes',
 * });
 *
 * // Setup Activities from an explicit interface (e.g. when defined by another SDK)
 * interface JavaActivities {
 *   httpGetFromJava(url: string): Promise<string>
 *   someOtherJavaActivity(arg1: number, arg2: string): Promise<string>;
 * }
 *
 * const {
 *   httpGetFromJava,
 *   someOtherJavaActivity
 * } = proxyActivities<JavaActivities>({
 *   taskQueue: 'java-worker-taskQueue',
 *   startToCloseTimeout: '5m',
 * });
 *
 * export function execute(): Promise<void> {
 *   const response = await httpGet("http://example.com");
 *   // ...
 * }
 * ```
 */
function proxyActivities(options) {
    if (options === undefined) {
        throw new TypeError('options must be defined');
    }
    // Validate as early as possible for immediate user feedback
    validateActivityOptions(options);
    return new Proxy({}, {
        get(_, activityType) {
            if (typeof activityType !== 'string') {
                throw new TypeError(`Only strings are supported for Activity types, got: ${String(activityType)}`);
            }
            return function activityProxyFunction(...args) {
                return scheduleActivity(activityType, args, options);
            };
        },
    });
}
exports.proxyActivities = proxyActivities;
/**
 * Configure Local Activity functions with given {@link LocalActivityOptions}.
 *
 * This method may be called multiple times to setup Activities with different options.
 *
 * @return a {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy | Proxy}
 *         for which each attribute is a callable Activity function
 *
 * @see {@link proxyActivities} for examples
 */
function proxyLocalActivities(options) {
    if (options === undefined) {
        throw new TypeError('options must be defined');
    }
    // Validate as early as possible for immediate user feedback
    validateLocalActivityOptions(options);
    return new Proxy({}, {
        get(_, activityType) {
            if (typeof activityType !== 'string') {
                throw new TypeError(`Only strings are supported for Activity types, got: ${String(activityType)}`);
            }
            return function localActivityProxyFunction(...args) {
                return scheduleLocalActivity(activityType, args, options);
            };
        },
    });
}
exports.proxyLocalActivities = proxyLocalActivities;
// TODO: deprecate this patch after "enough" time has passed
const EXTERNAL_WF_CANCEL_PATCH = '__temporal_internal_connect_external_handle_cancel_to_scope';
// The name of this patch comes from an attempt to build a generic internal patching mechanism.
// That effort has been abandoned in favor of a newer WorkflowTaskCompletedMetadata based mechanism.
const CONDITION_0_PATCH = '__sdk_internal_patch_number:1';
/**
 * Returns a client-side handle that can be used to signal and cancel an existing Workflow execution.
 * It takes a Workflow ID and optional run ID.
 */
function getExternalWorkflowHandle(workflowId, runId) {
    const activator = (0, global_attributes_1.assertInWorkflowContext)('Workflow.getExternalWorkflowHandle(...) may only be used from a Workflow Execution. Consider using Client.workflow.getHandle(...) instead.)');
    return {
        workflowId,
        runId,
        cancel() {
            return new Promise((resolve, reject) => {
                // Connect this cancel operation to the current cancellation scope.
                // This is behavior was introduced after v0.22.0 and is incompatible
                // with histories generated with previous SDK versions and thus requires
                // patching.
                //
                // We try to delay patching as much as possible to avoid polluting
                // histories unless strictly required.
                const scope = cancellation_scope_1.CancellationScope.current();
                if (scope.cancellable) {
                    (0, stack_helpers_1.untrackPromise)(scope.cancelRequested.catch((err) => {
                        if (patched(EXTERNAL_WF_CANCEL_PATCH)) {
                            reject(err);
                        }
                    }));
                }
                if (scope.consideredCancelled) {
                    if (patched(EXTERNAL_WF_CANCEL_PATCH)) {
                        return;
                    }
                }
                const seq = activator.nextSeqs.cancelWorkflow++;
                activator.pushCommand({
                    requestCancelExternalWorkflowExecution: {
                        seq,
                        workflowExecution: {
                            namespace: activator.info.namespace,
                            workflowId,
                            runId,
                        },
                    },
                });
                activator.completions.cancelWorkflow.set(seq, { resolve, reject });
            });
        },
        signal(def, ...args) {
            return (0, interceptors_1.composeInterceptors)(activator.interceptors.outbound, 'signalWorkflow', signalWorkflowNextHandler)({
                seq: activator.nextSeqs.signalWorkflow++,
                signalName: typeof def === 'string' ? def : def.name,
                args,
                target: {
                    type: 'external',
                    workflowExecution: { workflowId, runId },
                },
                headers: {},
            });
        },
    };
}
exports.getExternalWorkflowHandle = getExternalWorkflowHandle;
async function startChild(workflowTypeOrFunc, options) {
    const activator = (0, global_attributes_1.assertInWorkflowContext)('Workflow.startChild(...) may only be used from a Workflow Execution. Consider using Client.workflow.start(...) instead.)');
    const optionsWithDefaults = addDefaultWorkflowOptions(options ?? {});
    const workflowType = (0, common_1.extractWorkflowType)(workflowTypeOrFunc);
    const execute = (0, interceptors_1.composeInterceptors)(activator.interceptors.outbound, 'startChildWorkflowExecution', startChildWorkflowExecutionNextHandler);
    const [started, completed] = await execute({
        seq: activator.nextSeqs.childWorkflow++,
        options: optionsWithDefaults,
        headers: {},
        workflowType,
    });
    const firstExecutionRunId = await started;
    return {
        workflowId: optionsWithDefaults.workflowId,
        firstExecutionRunId,
        async result() {
            return (await completed);
        },
        async signal(def, ...args) {
            return (0, interceptors_1.composeInterceptors)(activator.interceptors.outbound, 'signalWorkflow', signalWorkflowNextHandler)({
                seq: activator.nextSeqs.signalWorkflow++,
                signalName: typeof def === 'string' ? def : def.name,
                args,
                target: {
                    type: 'child',
                    childWorkflowId: optionsWithDefaults.workflowId,
                },
                headers: {},
            });
        },
    };
}
exports.startChild = startChild;
async function executeChild(workflowTypeOrFunc, options) {
    const activator = (0, global_attributes_1.assertInWorkflowContext)('Workflow.executeChild(...) may only be used from a Workflow Execution. Consider using Client.workflow.execute(...) instead.');
    const optionsWithDefaults = addDefaultWorkflowOptions(options ?? {});
    const workflowType = (0, common_1.extractWorkflowType)(workflowTypeOrFunc);
    const execute = (0, interceptors_1.composeInterceptors)(activator.interceptors.outbound, 'startChildWorkflowExecution', startChildWorkflowExecutionNextHandler);
    const execPromise = execute({
        seq: activator.nextSeqs.childWorkflow++,
        options: optionsWithDefaults,
        headers: {},
        workflowType,
    });
    (0, stack_helpers_1.untrackPromise)(execPromise);
    const completedPromise = execPromise.then(([_started, completed]) => completed);
    (0, stack_helpers_1.untrackPromise)(completedPromise);
    return completedPromise;
}
exports.executeChild = executeChild;
/**
 * Get information about the current Workflow.
 *
 * WARNING: This function returns a frozen copy of WorkflowInfo, at the point where this method has been called.
 * Changes happening at later point in workflow execution will not be reflected in the returned object.
 *
 * For this reason, we recommend calling `workflowInfo()` on every access to {@link WorkflowInfo}'s fields,
 * rather than caching the `WorkflowInfo` object (or part of it) in a local variable. For example:
 *
 * ```ts
 * // GOOD
 * function myWorkflow() {
 *   doSomething(workflowInfo().searchAttributes)
 *   ...
 *   doSomethingElse(workflowInfo().searchAttributes)
 * }
 * ```
 *
 * vs
 *
 * ```ts
 * // BAD
 * function myWorkflow() {
 *   const attributes = workflowInfo().searchAttributes
 *   doSomething(attributes)
 *   ...
 *   doSomethingElse(attributes)
 * }
 * ```
 */
function workflowInfo() {
    const activator = (0, global_attributes_1.assertInWorkflowContext)('Workflow.workflowInfo(...) may only be used from a Workflow Execution.');
    return activator.info;
}
exports.workflowInfo = workflowInfo;
/**
 * Get information about the current update if any.
 *
 * @return Info for the current update handler the code calling this is executing
 * within if any.
 *
 * @experimental
 */
function currentUpdateInfo() {
    (0, global_attributes_1.assertInWorkflowContext)('Workflow.currentUpdateInfo(...) may only be used from a Workflow Execution.');
    return update_scope_1.UpdateScope.current();
}
exports.currentUpdateInfo = currentUpdateInfo;
/**
 * Returns whether or not code is executing in workflow context
 */
function inWorkflowContext() {
    return (0, global_attributes_1.maybeGetActivator)() !== undefined;
}
exports.inWorkflowContext = inWorkflowContext;
/**
 * Returns a function `f` that will cause the current Workflow to ContinueAsNew when called.
 *
 * `f` takes the same arguments as the Workflow function supplied to typeparam `F`.
 *
 * Once `f` is called, Workflow Execution immediately completes.
 */
function makeContinueAsNewFunc(options) {
    const activator = (0, global_attributes_1.assertInWorkflowContext)('Workflow.continueAsNew(...) and Workflow.makeContinueAsNewFunc(...) may only be used from a Workflow Execution.');
    const info = activator.info;
    const { workflowType, taskQueue, ...rest } = options ?? {};
    const requiredOptions = {
        workflowType: workflowType ?? info.workflowType,
        taskQueue: taskQueue ?? info.taskQueue,
        ...rest,
    };
    return (...args) => {
        const fn = (0, interceptors_1.composeInterceptors)(activator.interceptors.outbound, 'continueAsNew', async (input) => {
            const { headers, args, options } = input;
            throw new interfaces_1.ContinueAsNew({
                workflowType: options.workflowType,
                arguments: (0, common_1.toPayloads)(activator.payloadConverter, ...args),
                headers,
                taskQueue: options.taskQueue,
                memo: options.memo && (0, common_1.mapToPayloads)(activator.payloadConverter, options.memo),
                searchAttributes: options.searchAttributes
                    ? (0, common_1.mapToPayloads)(common_1.searchAttributePayloadConverter, options.searchAttributes)
                    : undefined,
                workflowRunTimeout: (0, time_1.msOptionalToTs)(options.workflowRunTimeout),
                workflowTaskTimeout: (0, time_1.msOptionalToTs)(options.workflowTaskTimeout),
                versioningIntent: (0, versioning_intent_enum_1.versioningIntentToProto)(options.versioningIntent),
            });
        });
        return fn({
            args,
            headers: {},
            options: requiredOptions,
        });
    };
}
exports.makeContinueAsNewFunc = makeContinueAsNewFunc;
/**
 * {@link https://docs.temporal.io/concepts/what-is-continue-as-new/ | Continues-As-New} the current Workflow Execution
 * with default options.
 *
 * Shorthand for `makeContinueAsNewFunc<F>()(...args)`. (See: {@link makeContinueAsNewFunc}.)
 *
 * @example
 *
 *```ts
 *import { continueAsNew } from '@temporalio/workflow';
 *
 *export async function myWorkflow(n: number): Promise<void> {
 *  // ... Workflow logic
 *  await continueAsNew<typeof myWorkflow>(n + 1);
 *}
 *```
 */
function continueAsNew(...args) {
    return makeContinueAsNewFunc()(...args);
}
exports.continueAsNew = continueAsNew;
/**
 * Generate an RFC compliant V4 uuid.
 * Uses the workflow's deterministic PRNG making it safe for use within a workflow.
 * This function is cryptographically insecure.
 * See the {@link https://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid | stackoverflow discussion}.
 */
function uuid4() {
    // Return the hexadecimal text representation of number `n`, padded with zeroes to be of length `p`
    const ho = (n, p) => n.toString(16).padStart(p, '0');
    // Create a view backed by a 16-byte buffer
    const view = new DataView(new ArrayBuffer(16));
    // Fill buffer with random values
    view.setUint32(0, (Math.random() * 0x100000000) >>> 0);
    view.setUint32(4, (Math.random() * 0x100000000) >>> 0);
    view.setUint32(8, (Math.random() * 0x100000000) >>> 0);
    view.setUint32(12, (Math.random() * 0x100000000) >>> 0);
    // Patch the 6th byte to reflect a version 4 UUID
    view.setUint8(6, (view.getUint8(6) & 0xf) | 0x40);
    // Patch the 8th byte to reflect a variant 1 UUID (version 4 UUIDs are)
    view.setUint8(8, (view.getUint8(8) & 0x3f) | 0x80);
    // Compile the canonical textual form from the array data
    return `${ho(view.getUint32(0), 8)}-${ho(view.getUint16(4), 4)}-${ho(view.getUint16(6), 4)}-${ho(view.getUint16(8), 4)}-${ho(view.getUint32(10), 8)}${ho(view.getUint16(14), 4)}`;
}
exports.uuid4 = uuid4;
/**
 * Patch or upgrade workflow code by checking or stating that this workflow has a certain patch.
 *
 * See {@link https://docs.temporal.io/typescript/versioning | docs page} for info.
 *
 * If the workflow is replaying an existing history, then this function returns true if that
 * history was produced by a worker which also had a `patched` call with the same `patchId`.
 * If the history was produced by a worker *without* such a call, then it will return false.
 *
 * If the workflow is not currently replaying, then this call *always* returns true.
 *
 * Your workflow code should run the "new" code if this returns true, if it returns false, you
 * should run the "old" code. By doing this, you can maintain determinism.
 *
 * @param patchId An identifier that should be unique to this patch. It is OK to use multiple
 * calls with the same ID, which means all such calls will always return the same value.
 */
function patched(patchId) {
    const activator = (0, global_attributes_1.assertInWorkflowContext)('Workflow.patch(...) and Workflow.deprecatePatch may only be used from a Workflow Execution.');
    return activator.patchInternal(patchId, false);
}
exports.patched = patched;
/**
 * Indicate that a patch is being phased out.
 *
 * See {@link https://docs.temporal.io/typescript/versioning | docs page} for info.
 *
 * Workflows with this call may be deployed alongside workflows with a {@link patched} call, but
 * they must *not* be deployed while any workers still exist running old code without a
 * {@link patched} call, or any runs with histories produced by such workers exist. If either kind
 * of worker encounters a history produced by the other, their behavior is undefined.
 *
 * Once all live workflow runs have been produced by workers with this call, you can deploy workers
 * which are free of either kind of patch call for this ID. Workers with and without this call
 * may coexist, as long as they are both running the "new" code.
 *
 * @param patchId An identifier that should be unique to this patch. It is OK to use multiple
 * calls with the same ID, which means all such calls will always return the same value.
 */
function deprecatePatch(patchId) {
    const activator = (0, global_attributes_1.assertInWorkflowContext)('Workflow.patch(...) and Workflow.deprecatePatch may only be used from a Workflow Execution.');
    activator.patchInternal(patchId, true);
}
exports.deprecatePatch = deprecatePatch;
async function condition(fn, timeout) {
    (0, global_attributes_1.assertInWorkflowContext)('Workflow.condition(...) may only be used from a Workflow Execution.');
    // Prior to 1.5.0, `condition(fn, 0)` was treated as equivalent to `condition(fn, undefined)`
    if (timeout === 0 && !patched(CONDITION_0_PATCH)) {
        return conditionInner(fn);
    }
    if (typeof timeout === 'number' || typeof timeout === 'string') {
        return cancellation_scope_1.CancellationScope.cancellable(async () => {
            try {
                return await Promise.race([sleep(timeout).then(() => false), conditionInner(fn).then(() => true)]);
            }
            finally {
                cancellation_scope_1.CancellationScope.current().cancel();
            }
        });
    }
    return conditionInner(fn);
}
exports.condition = condition;
function conditionInner(fn) {
    const activator = (0, global_attributes_1.getActivator)();
    return new Promise((resolve, reject) => {
        const scope = cancellation_scope_1.CancellationScope.current();
        if (scope.consideredCancelled) {
            (0, stack_helpers_1.untrackPromise)(scope.cancelRequested.catch(reject));
            return;
        }
        const seq = activator.nextSeqs.condition++;
        if (scope.cancellable) {
            (0, stack_helpers_1.untrackPromise)(scope.cancelRequested.catch((err) => {
                activator.blockedConditions.delete(seq);
                reject(err);
            }));
        }
        // Eager evaluation
        if (fn()) {
            resolve();
            return;
        }
        activator.blockedConditions.set(seq, { fn, resolve });
    });
}
/**
 * Define an update method for a Workflow.
 *
 * A definition is used to register a handler in the Workflow via {@link setHandler} and to update a Workflow using a {@link WorkflowHandle}, {@link ChildWorkflowHandle} or {@link ExternalWorkflowHandle}.
 * A definition can be reused in multiple Workflows.
 */
function defineUpdate(name) {
    return {
        type: 'update',
        name,
    };
}
exports.defineUpdate = defineUpdate;
/**
 * Define a signal method for a Workflow.
 *
 * A definition is used to register a handler in the Workflow via {@link setHandler} and to signal a Workflow using a {@link WorkflowHandle}, {@link ChildWorkflowHandle} or {@link ExternalWorkflowHandle}.
 * A definition can be reused in multiple Workflows.
 */
function defineSignal(name) {
    return {
        type: 'signal',
        name,
    };
}
exports.defineSignal = defineSignal;
/**
 * Define a query method for a Workflow.
 *
 * A definition is used to register a handler in the Workflow via {@link setHandler} and to query a Workflow using a {@link WorkflowHandle}.
 * A definition can be reused in multiple Workflows.
 */
function defineQuery(name) {
    return {
        type: 'query',
        name,
    };
}
exports.defineQuery = defineQuery;
// For Updates and Signals we want to make a public guarantee something like the
// following:
//
//   "If a WFT contains a Signal/Update, and if a handler is available for that
//   Signal/Update, then the handler will be executed.""
//
// However, that statement is not well-defined, leaving several questions open:
//
// 1. What does it mean for a handler to be "available"? What happens if the
//    handler is not present initially but is set at some point during the
//    Workflow code that is executed in that WFT? What happens if the handler is
//    set and then deleted, or replaced with a different handler?
//
// 2. When is the handler executed? (When it first becomes available? At the end
//    of the activation?) What are the execution semantics of Workflow and
//    Signal/Update handler code given that they are concurrent? Can the user
//    rely on Signal/Update side effects being reflected in the Workflow return
//    value, or in the value passed to Continue-As-New? If the handler is an
//    async function / coroutine, how much of it is executed and when is the
//    rest executed?
//
// 3. What happens if the handler is not executed? (i.e. because it wasn't
//    available in the sense defined by (1))
//
// 4. In the case of Update, when is the validation function executed?
//
// The implementation for Typescript is as follows:
//
// 1. sdk-core sorts Signal and Update jobs (and Patches) ahead of all other
//    jobs. Thus if the handler is available at the start of the Activation then
//    the Signal/Update will be executed before Workflow code is executed. If it
//    is not, then the Signal/Update calls are pushed to a buffer.
//
// 2. On each call to setHandler for a given Signal/Update, we make a pass
//    through the buffer list. If a buffered job is associated with the just-set
//    handler, then the job is removed from the buffer and the initial
//    synchronous portion of the handler is invoked on that input (i.e.
//    preempting workflow code).
//
// Thus in the case of Typescript the questions above are answered as follows:
//
// 1. A handler is "available" if it is set at the start of the Activation or
//    becomes set at any point during the Activation. If the handler is not set
//    initially then it is executed as soon as it is set. Subsequent deletion or
//    replacement by a different handler has no impact because the jobs it was
//    handling have already been handled and are no longer in the buffer.
//
// 2. The handler is executed as soon as it becomes available. I.e. if the
//    handler is set at the start of the Activation then it is executed when
//    first attempting to process the Signal/Update job; alternatively, if it is
//    set by a setHandler call made by Workflow code, then it is executed as
//    part of that call (preempting Workflow code). Therefore, a user can rely
//    on Signal/Update side effects being reflected in e.g. the Workflow return
//    value, and in the value passed to Continue-As-New. Activation jobs are
//    processed in the order supplied by sdk-core, i.e. Signals, then Updates,
//    then other jobs. Within each group, the order sent by the server is
//    preserved. If the handler is async, it is executed up to its first yield
//    point.
//
// 3. Signal case: If a handler does not become available for a Signal job then
//    the job remains in the buffer. If a handler for the Signal becomes
//    available in a subsequent Activation (of the same or a subsequent WFT)
//    then the handler will be executed. If not, then the Signal will never be
//    responded to and this causes no error.
//
//    Update case: If a handler does not become available for an Update job then
//    the Update is rejected at the end of the Activation. Thus, if a user does
//    not want an Update to be rejected for this reason, then it is their
//    responsibility to ensure that their application and workflow code interact
//    such that a handler is available for the Update during any Activation
//    which might contain their Update job. (Note that the user often has
//    uncertainty about which WFT their Signal/Update will appear in. For
//    example, if they call startWorkflow() followed by startUpdate(), then they
//    will typically not know whether these will be delivered in one or two
//    WFTs. On the other hand there are situations where they would have reason
//    to believe they are in the same WFT, for example if they do not start
//    Worker polling until after they have verified that both requests have
//    succeeded.)
//
// 4. If an Update has a validation function then it is executed immediately
//    prior to the handler. (Note that the validation function is required to be
//    synchronous).
function setHandler(def, handler, options) {
    const activator = (0, global_attributes_1.assertInWorkflowContext)('Workflow.setHandler(...) may only be used from a Workflow Execution.');
    const description = options?.description;
    if (def.type === 'update') {
        if (typeof handler === 'function') {
            const updateOptions = options;
            const validator = updateOptions?.validator;
            const unfinishedPolicy = updateOptions?.unfinishedPolicy ?? common_1.HandlerUnfinishedPolicy.WARN_AND_ABANDON;
            activator.updateHandlers.set(def.name, { handler, validator, description, unfinishedPolicy });
            activator.dispatchBufferedUpdates();
        }
        else if (handler == null) {
            activator.updateHandlers.delete(def.name);
        }
        else {
            throw new TypeError(`Expected handler to be either a function or 'undefined'. Got: '${typeof handler}'`);
        }
    }
    else if (def.type === 'signal') {
        if (typeof handler === 'function') {
            const signalOptions = options;
            const unfinishedPolicy = signalOptions?.unfinishedPolicy ?? common_1.HandlerUnfinishedPolicy.WARN_AND_ABANDON;
            activator.signalHandlers.set(def.name, { handler: handler, description, unfinishedPolicy });
            activator.dispatchBufferedSignals();
        }
        else if (handler == null) {
            activator.signalHandlers.delete(def.name);
        }
        else {
            throw new TypeError(`Expected handler to be either a function or 'undefined'. Got: '${typeof handler}'`);
        }
    }
    else if (def.type === 'query') {
        if (typeof handler === 'function') {
            activator.queryHandlers.set(def.name, { handler: handler, description });
        }
        else if (handler == null) {
            activator.queryHandlers.delete(def.name);
        }
        else {
            throw new TypeError(`Expected handler to be either a function or 'undefined'. Got: '${typeof handler}'`);
        }
    }
    else {
        throw new TypeError(`Invalid definition type: ${def.type}`);
    }
}
exports.setHandler = setHandler;
/**
 * Set a signal handler function that will handle signals calls for non-registered signal names.
 *
 * Signals are dispatched to the default signal handler in the order that they were accepted by the server.
 *
 * If this function is called multiple times for a given signal or query name the last handler will overwrite any previous calls.
 *
 * @param handler a function that will handle signals for non-registered signal names, or `undefined` to unset the handler.
 */
function setDefaultSignalHandler(handler) {
    const activator = (0, global_attributes_1.assertInWorkflowContext)('Workflow.setDefaultSignalHandler(...) may only be used from a Workflow Execution.');
    if (typeof handler === 'function') {
        activator.defaultSignalHandler = handler;
        activator.dispatchBufferedSignals();
    }
    else if (handler == null) {
        activator.defaultSignalHandler = undefined;
    }
    else {
        throw new TypeError(`Expected handler to be either a function or 'undefined'. Got: '${typeof handler}'`);
    }
}
exports.setDefaultSignalHandler = setDefaultSignalHandler;
/**
 * Updates this Workflow's Search Attributes by merging the provided `searchAttributes` with the existing Search
 * Attributes, `workflowInfo().searchAttributes`.
 *
 * For example, this Workflow code:
 *
 * ```ts
 * upsertSearchAttributes({
 *   CustomIntField: [1],
 *   CustomBoolField: [true]
 * });
 * upsertSearchAttributes({
 *   CustomIntField: [42],
 *   CustomKeywordField: ['durable code', 'is great']
 * });
 * ```
 *
 * would result in the Workflow having these Search Attributes:
 *
 * ```ts
 * {
 *   CustomIntField: [42],
 *   CustomBoolField: [true],
 *   CustomKeywordField: ['durable code', 'is great']
 * }
 * ```
 *
 * @param searchAttributes The Record to merge. Use a value of `[]` to clear a Search Attribute.
 */
function upsertSearchAttributes(searchAttributes) {
    const activator = (0, global_attributes_1.assertInWorkflowContext)('Workflow.upsertSearchAttributes(...) may only be used from a Workflow Execution.');
    if (searchAttributes == null) {
        throw new Error('searchAttributes must be a non-null SearchAttributes');
    }
    activator.pushCommand({
        upsertWorkflowSearchAttributes: {
            searchAttributes: (0, common_1.mapToPayloads)(common_1.searchAttributePayloadConverter, searchAttributes),
        },
    });
    activator.mutateWorkflowInfo((info) => {
        return {
            ...info,
            searchAttributes: {
                ...info.searchAttributes,
                ...searchAttributes,
            },
        };
    });
}
exports.upsertSearchAttributes = upsertSearchAttributes;
/**
 * Updates this Workflow's Memos by merging the provided `memo` with existing
 * Memos (as returned by `workflowInfo().memo`).
 *
 * New memo is merged by replacing properties of the same name _at the first
 * level only_. Setting a property to value `undefined` or `null` clears that
 * key from the Memo.
 *
 * For example:
 *
 * ```ts
 * upsertMemo({
 *   key1: value,
 *   key3: { subkey1: value }
 *   key4: value,
 * });
 * upsertMemo({
 *   key2: value
 *   key3: { subkey2: value }
 *   key4: undefined,
 * });
 * ```
 *
 * would result in the Workflow having these Memo:
 *
 * ```ts
 * {
 *   key1: value,
 *   key2: value,
 *   key3: { subkey2: value }  // Note this object was completely replaced
 *   // Note that key4 was completely removed
 * }
 * ```
 *
 * @param memo The Record to merge.
 */
function upsertMemo(memo) {
    const activator = (0, global_attributes_1.assertInWorkflowContext)('Workflow.upsertMemo(...) may only be used from a Workflow Execution.');
    if (memo == null) {
        throw new Error('memo must be a non-null Record');
    }
    activator.pushCommand({
        modifyWorkflowProperties: {
            upsertedMemo: {
                fields: (0, common_1.mapToPayloads)(activator.payloadConverter, 
                // Convert null to undefined
                Object.fromEntries(Object.entries(memo).map(([k, v]) => [k, v ?? undefined]))),
            },
        },
    });
    activator.mutateWorkflowInfo((info) => {
        return {
            ...info,
            memo: Object.fromEntries(Object.entries({
                ...info.memo,
                ...memo,
            }).filter(([_, v]) => v != null)),
        };
    });
}
exports.upsertMemo = upsertMemo;
/**
 * Whether update and signal handlers have finished executing.
 *
 * Consider waiting on this condition before workflow return or continue-as-new, to prevent
 * interruption of in-progress handlers by workflow exit:
 *
 * ```ts
 * await workflow.condition(workflow.allHandlersFinished)
 * ```
 *
 * @returns true if there are no in-progress update or signal handler executions.
 */
function allHandlersFinished() {
    const activator = (0, global_attributes_1.assertInWorkflowContext)('allHandlersFinished() may only be used from a Workflow Execution.');
    return activator.inProgressSignals.size === 0 && activator.inProgressUpdates.size === 0;
}
exports.allHandlersFinished = allHandlersFinished;
exports.stackTraceQuery = defineQuery('__stack_trace');
exports.enhancedStackTraceQuery = defineQuery('__enhanced_stack_trace');
exports.workflowMetadataQuery = defineQuery('__temporal_workflow_metadata');


/***/ }),

/***/ "./src/scenario-10.ts":
/*!****************************!*\
  !*** ./src/scenario-10.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   PurchaseWorkflow: () => (/* binding */ PurchaseWorkflow)
/* harmony export */ });
/* harmony import */ var _temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @temporalio/workflow */ "./node_modules/@temporalio/workflow/lib/index.js");
/* harmony import */ var _temporalio_workflow__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__);

const { chargeCard, reserveStock, shipItem, sendReceipt, sendChargeFailureEmail, sendReviewRequest } = (0,_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.proxyActivities)({
    startToCloseTimeout: '5 seconds',
    retry: {
        initialInterval: '1 second',
        backoffCoefficient: 1
    }
});
const { pendingSleep, completeSleep } = (0,_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.proxyLocalActivities)({
    startToCloseTimeout: '1 seconds',
    retry: {
        initialInterval: '1 second',
        backoffCoefficient: 1
    }
});
async function sleep(duration) {
    // Emit the wait step (this will show as pending with interaction buttons)
    await pendingSleep();
    // Sleep for the specified duration using Temporal's timer
    await (0,_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.sleep)(duration);
    // Emit the completion step
    await completeSleep();
}
async function PurchaseWorkflow(input) {
    const { customerEmail, productName, amount, shippingAddress } = input;
    // Charge the customer's card
    try {
        await chargeCard(customerEmail, amount);
    } catch (error) {
        await sendChargeFailureEmail(customerEmail, amount);
        return;
    }
    // Reserve the item in inventory
    await reserveStock(productName);
    // Ship the item
    await shipItem(customerEmail, productName, shippingAddress);
    // Send receipt confirmation
    await sendReceipt(customerEmail, productName, amount);
    // Sleep for 30 days (ok, it's a demo, so just 5 seconds)
    await sleep('5 seconds');
    // Send review request
    await sendReviewRequest(customerEmail, productName, amount);
}


/***/ }),

/***/ "?31ff":
/*!*****************************************************!*\
  !*** __temporal_custom_failure_converter (ignored) ***!
  \*****************************************************/
/***/ (() => {

/* (ignored) */

/***/ }),

/***/ "?2065":
/*!*****************************************************!*\
  !*** __temporal_custom_payload_converter (ignored) ***!
  \*****************************************************/
/***/ (() => {

/* (ignored) */

/***/ }),

/***/ "./node_modules/@temporalio/common/node_modules/ms/dist/index.cjs":
/*!************************************************************************!*\
  !*** ./node_modules/@temporalio/common/node_modules/ms/dist/index.cjs ***!
  \************************************************************************/
/***/ ((module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
// Helpers.
const s = 1000;
const m = s * 60;
const h = m * 60;
const d = h * 24;
const w = d * 7;
const y = d * 365.25;
function ms(value, options) {
    try {
        if (typeof value === 'string' && value.length > 0) {
            return parse(value);
        }
        else if (typeof value === 'number' && isFinite(value)) {
            return options?.long ? fmtLong(value) : fmtShort(value);
        }
        throw new Error('Value is not a string or number.');
    }
    catch (error) {
        const message = isError(error)
            ? `${error.message}. value=${JSON.stringify(value)}`
            : 'An unknown error has occured.';
        throw new Error(message);
    }
}
/**
 * Parse the given `str` and return milliseconds.
 */
function parse(str) {
    str = String(str);
    if (str.length > 100) {
        throw new Error('Value exceeds the maximum length of 100 characters.');
    }
    const match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(str);
    if (!match) {
        return NaN;
    }
    const n = parseFloat(match[1]);
    const type = (match[2] || 'ms').toLowerCase();
    switch (type) {
        case 'years':
        case 'year':
        case 'yrs':
        case 'yr':
        case 'y':
            return n * y;
        case 'weeks':
        case 'week':
        case 'w':
            return n * w;
        case 'days':
        case 'day':
        case 'd':
            return n * d;
        case 'hours':
        case 'hour':
        case 'hrs':
        case 'hr':
        case 'h':
            return n * h;
        case 'minutes':
        case 'minute':
        case 'mins':
        case 'min':
        case 'm':
            return n * m;
        case 'seconds':
        case 'second':
        case 'secs':
        case 'sec':
        case 's':
            return n * s;
        case 'milliseconds':
        case 'millisecond':
        case 'msecs':
        case 'msec':
        case 'ms':
            return n;
        default:
            // This should never occur.
            throw new Error(`The unit ${type} was matched, but no matching case exists.`);
    }
}
exports["default"] = ms;
/**
 * Short format for `ms`.
 */
function fmtShort(ms) {
    const msAbs = Math.abs(ms);
    if (msAbs >= d) {
        return `${Math.round(ms / d)}d`;
    }
    if (msAbs >= h) {
        return `${Math.round(ms / h)}h`;
    }
    if (msAbs >= m) {
        return `${Math.round(ms / m)}m`;
    }
    if (msAbs >= s) {
        return `${Math.round(ms / s)}s`;
    }
    return `${ms}ms`;
}
/**
 * Long format for `ms`.
 */
function fmtLong(ms) {
    const msAbs = Math.abs(ms);
    if (msAbs >= d) {
        return plural(ms, msAbs, d, 'day');
    }
    if (msAbs >= h) {
        return plural(ms, msAbs, h, 'hour');
    }
    if (msAbs >= m) {
        return plural(ms, msAbs, m, 'minute');
    }
    if (msAbs >= s) {
        return plural(ms, msAbs, s, 'second');
    }
    return `${ms} ms`;
}
/**
 * Pluralization helper.
 */
function plural(ms, msAbs, n, name) {
    const isPlural = msAbs >= n * 1.5;
    return `${Math.round(ms / n)} ${name}${isPlural ? 's' : ''}`;
}
/**
 * A type guard for errors.
 */
function isError(error) {
    return typeof error === 'object' && error !== null && 'message' in error;
}
module.exports = exports.default;
module.exports["default"] = exports.default;


/***/ }),

/***/ "./node_modules/long/umd/index.js":
/*!****************************************!*\
  !*** ./node_modules/long/umd/index.js ***!
  \****************************************/
/***/ ((module, exports) => {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// GENERATED FILE. DO NOT EDIT.
var Long = (function(exports) {
  "use strict";
  
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = void 0;
  
  /**
   * @license
   * Copyright 2009 The Closure Library Authors
   * Copyright 2020 Daniel Wirtz / The long.js Authors.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *     http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *
   * SPDX-License-Identifier: Apache-2.0
   */
  // WebAssembly optimizations to do native i64 multiplication and divide
  var wasm = null;
  
  try {
    wasm = new WebAssembly.Instance(new WebAssembly.Module(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 13, 2, 96, 0, 1, 127, 96, 4, 127, 127, 127, 127, 1, 127, 3, 7, 6, 0, 1, 1, 1, 1, 1, 6, 6, 1, 127, 1, 65, 0, 11, 7, 50, 6, 3, 109, 117, 108, 0, 1, 5, 100, 105, 118, 95, 115, 0, 2, 5, 100, 105, 118, 95, 117, 0, 3, 5, 114, 101, 109, 95, 115, 0, 4, 5, 114, 101, 109, 95, 117, 0, 5, 8, 103, 101, 116, 95, 104, 105, 103, 104, 0, 0, 10, 191, 1, 6, 4, 0, 35, 0, 11, 36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 126, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11, 36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 127, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11, 36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 128, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11, 36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 129, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11, 36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 130, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11])), {}).exports;
  } catch (e) {// no wasm support :(
  }
  /**
   * Constructs a 64 bit two's-complement integer, given its low and high 32 bit values as *signed* integers.
   *  See the from* functions below for more convenient ways of constructing Longs.
   * @exports Long
   * @class A Long class for representing a 64 bit two's-complement integer value.
   * @param {number} low The low (signed) 32 bits of the long
   * @param {number} high The high (signed) 32 bits of the long
   * @param {boolean=} unsigned Whether unsigned or not, defaults to signed
   * @constructor
   */
  
  
  function Long(low, high, unsigned) {
    /**
     * The low 32 bits as a signed value.
     * @type {number}
     */
    this.low = low | 0;
    /**
     * The high 32 bits as a signed value.
     * @type {number}
     */
  
    this.high = high | 0;
    /**
     * Whether unsigned or not.
     * @type {boolean}
     */
  
    this.unsigned = !!unsigned;
  } // The internal representation of a long is the two given signed, 32-bit values.
  // We use 32-bit pieces because these are the size of integers on which
  // Javascript performs bit-operations.  For operations like addition and
  // multiplication, we split each number into 16 bit pieces, which can easily be
  // multiplied within Javascript's floating-point representation without overflow
  // or change in sign.
  //
  // In the algorithms below, we frequently reduce the negative case to the
  // positive case by negating the input(s) and then post-processing the result.
  // Note that we must ALWAYS check specially whether those values are MIN_VALUE
  // (-2^63) because -MIN_VALUE == MIN_VALUE (since 2^63 cannot be represented as
  // a positive number, it overflows back into a negative).  Not handling this
  // case would often result in infinite recursion.
  //
  // Common constant values ZERO, ONE, NEG_ONE, etc. are defined below the from*
  // methods on which they depend.
  
  /**
   * An indicator used to reliably determine if an object is a Long or not.
   * @type {boolean}
   * @const
   * @private
   */
  
  
  Long.prototype.__isLong__;
  Object.defineProperty(Long.prototype, "__isLong__", {
    value: true
  });
  /**
   * @function
   * @param {*} obj Object
   * @returns {boolean}
   * @inner
   */
  
  function isLong(obj) {
    return (obj && obj["__isLong__"]) === true;
  }
  /**
   * @function
   * @param {*} value number
   * @returns {number}
   * @inner
   */
  
  
  function ctz32(value) {
    var c = Math.clz32(value & -value);
    return value ? 31 - c : c;
  }
  /**
   * Tests if the specified object is a Long.
   * @function
   * @param {*} obj Object
   * @returns {boolean}
   */
  
  
  Long.isLong = isLong;
  /**
   * A cache of the Long representations of small integer values.
   * @type {!Object}
   * @inner
   */
  
  var INT_CACHE = {};
  /**
   * A cache of the Long representations of small unsigned integer values.
   * @type {!Object}
   * @inner
   */
  
  var UINT_CACHE = {};
  /**
   * @param {number} value
   * @param {boolean=} unsigned
   * @returns {!Long}
   * @inner
   */
  
  function fromInt(value, unsigned) {
    var obj, cachedObj, cache;
  
    if (unsigned) {
      value >>>= 0;
  
      if (cache = 0 <= value && value < 256) {
        cachedObj = UINT_CACHE[value];
        if (cachedObj) return cachedObj;
      }
  
      obj = fromBits(value, 0, true);
      if (cache) UINT_CACHE[value] = obj;
      return obj;
    } else {
      value |= 0;
  
      if (cache = -128 <= value && value < 128) {
        cachedObj = INT_CACHE[value];
        if (cachedObj) return cachedObj;
      }
  
      obj = fromBits(value, value < 0 ? -1 : 0, false);
      if (cache) INT_CACHE[value] = obj;
      return obj;
    }
  }
  /**
   * Returns a Long representing the given 32 bit integer value.
   * @function
   * @param {number} value The 32 bit integer in question
   * @param {boolean=} unsigned Whether unsigned or not, defaults to signed
   * @returns {!Long} The corresponding Long value
   */
  
  
  Long.fromInt = fromInt;
  /**
   * @param {number} value
   * @param {boolean=} unsigned
   * @returns {!Long}
   * @inner
   */
  
  function fromNumber(value, unsigned) {
    if (isNaN(value)) return unsigned ? UZERO : ZERO;
  
    if (unsigned) {
      if (value < 0) return UZERO;
      if (value >= TWO_PWR_64_DBL) return MAX_UNSIGNED_VALUE;
    } else {
      if (value <= -TWO_PWR_63_DBL) return MIN_VALUE;
      if (value + 1 >= TWO_PWR_63_DBL) return MAX_VALUE;
    }
  
    if (value < 0) return fromNumber(-value, unsigned).neg();
    return fromBits(value % TWO_PWR_32_DBL | 0, value / TWO_PWR_32_DBL | 0, unsigned);
  }
  /**
   * Returns a Long representing the given value, provided that it is a finite number. Otherwise, zero is returned.
   * @function
   * @param {number} value The number in question
   * @param {boolean=} unsigned Whether unsigned or not, defaults to signed
   * @returns {!Long} The corresponding Long value
   */
  
  
  Long.fromNumber = fromNumber;
  /**
   * @param {number} lowBits
   * @param {number} highBits
   * @param {boolean=} unsigned
   * @returns {!Long}
   * @inner
   */
  
  function fromBits(lowBits, highBits, unsigned) {
    return new Long(lowBits, highBits, unsigned);
  }
  /**
   * Returns a Long representing the 64 bit integer that comes by concatenating the given low and high bits. Each is
   *  assumed to use 32 bits.
   * @function
   * @param {number} lowBits The low 32 bits
   * @param {number} highBits The high 32 bits
   * @param {boolean=} unsigned Whether unsigned or not, defaults to signed
   * @returns {!Long} The corresponding Long value
   */
  
  
  Long.fromBits = fromBits;
  /**
   * @function
   * @param {number} base
   * @param {number} exponent
   * @returns {number}
   * @inner
   */
  
  var pow_dbl = Math.pow; // Used 4 times (4*8 to 15+4)
  
  /**
   * @param {string} str
   * @param {(boolean|number)=} unsigned
   * @param {number=} radix
   * @returns {!Long}
   * @inner
   */
  
  function fromString(str, unsigned, radix) {
    if (str.length === 0) throw Error('empty string');
  
    if (typeof unsigned === 'number') {
      // For goog.math.long compatibility
      radix = unsigned;
      unsigned = false;
    } else {
      unsigned = !!unsigned;
    }
  
    if (str === "NaN" || str === "Infinity" || str === "+Infinity" || str === "-Infinity") return unsigned ? UZERO : ZERO;
    radix = radix || 10;
    if (radix < 2 || 36 < radix) throw RangeError('radix');
    var p;
    if ((p = str.indexOf('-')) > 0) throw Error('interior hyphen');else if (p === 0) {
      return fromString(str.substring(1), unsigned, radix).neg();
    } // Do several (8) digits each time through the loop, so as to
    // minimize the calls to the very expensive emulated div.
  
    var radixToPower = fromNumber(pow_dbl(radix, 8));
    var result = ZERO;
  
    for (var i = 0; i < str.length; i += 8) {
      var size = Math.min(8, str.length - i),
          value = parseInt(str.substring(i, i + size), radix);
  
      if (size < 8) {
        var power = fromNumber(pow_dbl(radix, size));
        result = result.mul(power).add(fromNumber(value));
      } else {
        result = result.mul(radixToPower);
        result = result.add(fromNumber(value));
      }
    }
  
    result.unsigned = unsigned;
    return result;
  }
  /**
   * Returns a Long representation of the given string, written using the specified radix.
   * @function
   * @param {string} str The textual representation of the Long
   * @param {(boolean|number)=} unsigned Whether unsigned or not, defaults to signed
   * @param {number=} radix The radix in which the text is written (2-36), defaults to 10
   * @returns {!Long} The corresponding Long value
   */
  
  
  Long.fromString = fromString;
  /**
   * @function
   * @param {!Long|number|string|!{low: number, high: number, unsigned: boolean}} val
   * @param {boolean=} unsigned
   * @returns {!Long}
   * @inner
   */
  
  function fromValue(val, unsigned) {
    if (typeof val === 'number') return fromNumber(val, unsigned);
    if (typeof val === 'string') return fromString(val, unsigned); // Throws for non-objects, converts non-instanceof Long:
  
    return fromBits(val.low, val.high, typeof unsigned === 'boolean' ? unsigned : val.unsigned);
  }
  /**
   * Converts the specified value to a Long using the appropriate from* function for its type.
   * @function
   * @param {!Long|number|string|!{low: number, high: number, unsigned: boolean}} val Value
   * @param {boolean=} unsigned Whether unsigned or not, defaults to signed
   * @returns {!Long}
   */
  
  
  Long.fromValue = fromValue; // NOTE: the compiler should inline these constant values below and then remove these variables, so there should be
  // no runtime penalty for these.
  
  /**
   * @type {number}
   * @const
   * @inner
   */
  
  var TWO_PWR_16_DBL = 1 << 16;
  /**
   * @type {number}
   * @const
   * @inner
   */
  
  var TWO_PWR_24_DBL = 1 << 24;
  /**
   * @type {number}
   * @const
   * @inner
   */
  
  var TWO_PWR_32_DBL = TWO_PWR_16_DBL * TWO_PWR_16_DBL;
  /**
   * @type {number}
   * @const
   * @inner
   */
  
  var TWO_PWR_64_DBL = TWO_PWR_32_DBL * TWO_PWR_32_DBL;
  /**
   * @type {number}
   * @const
   * @inner
   */
  
  var TWO_PWR_63_DBL = TWO_PWR_64_DBL / 2;
  /**
   * @type {!Long}
   * @const
   * @inner
   */
  
  var TWO_PWR_24 = fromInt(TWO_PWR_24_DBL);
  /**
   * @type {!Long}
   * @inner
   */
  
  var ZERO = fromInt(0);
  /**
   * Signed zero.
   * @type {!Long}
   */
  
  Long.ZERO = ZERO;
  /**
   * @type {!Long}
   * @inner
   */
  
  var UZERO = fromInt(0, true);
  /**
   * Unsigned zero.
   * @type {!Long}
   */
  
  Long.UZERO = UZERO;
  /**
   * @type {!Long}
   * @inner
   */
  
  var ONE = fromInt(1);
  /**
   * Signed one.
   * @type {!Long}
   */
  
  Long.ONE = ONE;
  /**
   * @type {!Long}
   * @inner
   */
  
  var UONE = fromInt(1, true);
  /**
   * Unsigned one.
   * @type {!Long}
   */
  
  Long.UONE = UONE;
  /**
   * @type {!Long}
   * @inner
   */
  
  var NEG_ONE = fromInt(-1);
  /**
   * Signed negative one.
   * @type {!Long}
   */
  
  Long.NEG_ONE = NEG_ONE;
  /**
   * @type {!Long}
   * @inner
   */
  
  var MAX_VALUE = fromBits(0xFFFFFFFF | 0, 0x7FFFFFFF | 0, false);
  /**
   * Maximum signed value.
   * @type {!Long}
   */
  
  Long.MAX_VALUE = MAX_VALUE;
  /**
   * @type {!Long}
   * @inner
   */
  
  var MAX_UNSIGNED_VALUE = fromBits(0xFFFFFFFF | 0, 0xFFFFFFFF | 0, true);
  /**
   * Maximum unsigned value.
   * @type {!Long}
   */
  
  Long.MAX_UNSIGNED_VALUE = MAX_UNSIGNED_VALUE;
  /**
   * @type {!Long}
   * @inner
   */
  
  var MIN_VALUE = fromBits(0, 0x80000000 | 0, false);
  /**
   * Minimum signed value.
   * @type {!Long}
   */
  
  Long.MIN_VALUE = MIN_VALUE;
  /**
   * @alias Long.prototype
   * @inner
   */
  
  var LongPrototype = Long.prototype;
  /**
   * Converts the Long to a 32 bit integer, assuming it is a 32 bit integer.
   * @this {!Long}
   * @returns {number}
   */
  
  LongPrototype.toInt = function toInt() {
    return this.unsigned ? this.low >>> 0 : this.low;
  };
  /**
   * Converts the Long to a the nearest floating-point representation of this value (double, 53 bit mantissa).
   * @this {!Long}
   * @returns {number}
   */
  
  
  LongPrototype.toNumber = function toNumber() {
    if (this.unsigned) return (this.high >>> 0) * TWO_PWR_32_DBL + (this.low >>> 0);
    return this.high * TWO_PWR_32_DBL + (this.low >>> 0);
  };
  /**
   * Converts the Long to a string written in the specified radix.
   * @this {!Long}
   * @param {number=} radix Radix (2-36), defaults to 10
   * @returns {string}
   * @override
   * @throws {RangeError} If `radix` is out of range
   */
  
  
  LongPrototype.toString = function toString(radix) {
    radix = radix || 10;
    if (radix < 2 || 36 < radix) throw RangeError('radix');
    if (this.isZero()) return '0';
  
    if (this.isNegative()) {
      // Unsigned Longs are never negative
      if (this.eq(MIN_VALUE)) {
        // We need to change the Long value before it can be negated, so we remove
        // the bottom-most digit in this base and then recurse to do the rest.
        var radixLong = fromNumber(radix),
            div = this.div(radixLong),
            rem1 = div.mul(radixLong).sub(this);
        return div.toString(radix) + rem1.toInt().toString(radix);
      } else return '-' + this.neg().toString(radix);
    } // Do several (6) digits each time through the loop, so as to
    // minimize the calls to the very expensive emulated div.
  
  
    var radixToPower = fromNumber(pow_dbl(radix, 6), this.unsigned),
        rem = this;
    var result = '';
  
    while (true) {
      var remDiv = rem.div(radixToPower),
          intval = rem.sub(remDiv.mul(radixToPower)).toInt() >>> 0,
          digits = intval.toString(radix);
      rem = remDiv;
      if (rem.isZero()) return digits + result;else {
        while (digits.length < 6) digits = '0' + digits;
  
        result = '' + digits + result;
      }
    }
  };
  /**
   * Gets the high 32 bits as a signed integer.
   * @this {!Long}
   * @returns {number} Signed high bits
   */
  
  
  LongPrototype.getHighBits = function getHighBits() {
    return this.high;
  };
  /**
   * Gets the high 32 bits as an unsigned integer.
   * @this {!Long}
   * @returns {number} Unsigned high bits
   */
  
  
  LongPrototype.getHighBitsUnsigned = function getHighBitsUnsigned() {
    return this.high >>> 0;
  };
  /**
   * Gets the low 32 bits as a signed integer.
   * @this {!Long}
   * @returns {number} Signed low bits
   */
  
  
  LongPrototype.getLowBits = function getLowBits() {
    return this.low;
  };
  /**
   * Gets the low 32 bits as an unsigned integer.
   * @this {!Long}
   * @returns {number} Unsigned low bits
   */
  
  
  LongPrototype.getLowBitsUnsigned = function getLowBitsUnsigned() {
    return this.low >>> 0;
  };
  /**
   * Gets the number of bits needed to represent the absolute value of this Long.
   * @this {!Long}
   * @returns {number}
   */
  
  
  LongPrototype.getNumBitsAbs = function getNumBitsAbs() {
    if (this.isNegative()) // Unsigned Longs are never negative
      return this.eq(MIN_VALUE) ? 64 : this.neg().getNumBitsAbs();
    var val = this.high != 0 ? this.high : this.low;
  
    for (var bit = 31; bit > 0; bit--) if ((val & 1 << bit) != 0) break;
  
    return this.high != 0 ? bit + 33 : bit + 1;
  };
  /**
   * Tests if this Long's value equals zero.
   * @this {!Long}
   * @returns {boolean}
   */
  
  
  LongPrototype.isZero = function isZero() {
    return this.high === 0 && this.low === 0;
  };
  /**
   * Tests if this Long's value equals zero. This is an alias of {@link Long#isZero}.
   * @returns {boolean}
   */
  
  
  LongPrototype.eqz = LongPrototype.isZero;
  /**
   * Tests if this Long's value is negative.
   * @this {!Long}
   * @returns {boolean}
   */
  
  LongPrototype.isNegative = function isNegative() {
    return !this.unsigned && this.high < 0;
  };
  /**
   * Tests if this Long's value is positive or zero.
   * @this {!Long}
   * @returns {boolean}
   */
  
  
  LongPrototype.isPositive = function isPositive() {
    return this.unsigned || this.high >= 0;
  };
  /**
   * Tests if this Long's value is odd.
   * @this {!Long}
   * @returns {boolean}
   */
  
  
  LongPrototype.isOdd = function isOdd() {
    return (this.low & 1) === 1;
  };
  /**
   * Tests if this Long's value is even.
   * @this {!Long}
   * @returns {boolean}
   */
  
  
  LongPrototype.isEven = function isEven() {
    return (this.low & 1) === 0;
  };
  /**
   * Tests if this Long's value equals the specified's.
   * @this {!Long}
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   */
  
  
  LongPrototype.equals = function equals(other) {
    if (!isLong(other)) other = fromValue(other);
    if (this.unsigned !== other.unsigned && this.high >>> 31 === 1 && other.high >>> 31 === 1) return false;
    return this.high === other.high && this.low === other.low;
  };
  /**
   * Tests if this Long's value equals the specified's. This is an alias of {@link Long#equals}.
   * @function
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   */
  
  
  LongPrototype.eq = LongPrototype.equals;
  /**
   * Tests if this Long's value differs from the specified's.
   * @this {!Long}
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   */
  
  LongPrototype.notEquals = function notEquals(other) {
    return !this.eq(
    /* validates */
    other);
  };
  /**
   * Tests if this Long's value differs from the specified's. This is an alias of {@link Long#notEquals}.
   * @function
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   */
  
  
  LongPrototype.neq = LongPrototype.notEquals;
  /**
   * Tests if this Long's value differs from the specified's. This is an alias of {@link Long#notEquals}.
   * @function
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   */
  
  LongPrototype.ne = LongPrototype.notEquals;
  /**
   * Tests if this Long's value is less than the specified's.
   * @this {!Long}
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   */
  
  LongPrototype.lessThan = function lessThan(other) {
    return this.comp(
    /* validates */
    other) < 0;
  };
  /**
   * Tests if this Long's value is less than the specified's. This is an alias of {@link Long#lessThan}.
   * @function
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   */
  
  
  LongPrototype.lt = LongPrototype.lessThan;
  /**
   * Tests if this Long's value is less than or equal the specified's.
   * @this {!Long}
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   */
  
  LongPrototype.lessThanOrEqual = function lessThanOrEqual(other) {
    return this.comp(
    /* validates */
    other) <= 0;
  };
  /**
   * Tests if this Long's value is less than or equal the specified's. This is an alias of {@link Long#lessThanOrEqual}.
   * @function
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   */
  
  
  LongPrototype.lte = LongPrototype.lessThanOrEqual;
  /**
   * Tests if this Long's value is less than or equal the specified's. This is an alias of {@link Long#lessThanOrEqual}.
   * @function
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   */
  
  LongPrototype.le = LongPrototype.lessThanOrEqual;
  /**
   * Tests if this Long's value is greater than the specified's.
   * @this {!Long}
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   */
  
  LongPrototype.greaterThan = function greaterThan(other) {
    return this.comp(
    /* validates */
    other) > 0;
  };
  /**
   * Tests if this Long's value is greater than the specified's. This is an alias of {@link Long#greaterThan}.
   * @function
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   */
  
  
  LongPrototype.gt = LongPrototype.greaterThan;
  /**
   * Tests if this Long's value is greater than or equal the specified's.
   * @this {!Long}
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   */
  
  LongPrototype.greaterThanOrEqual = function greaterThanOrEqual(other) {
    return this.comp(
    /* validates */
    other) >= 0;
  };
  /**
   * Tests if this Long's value is greater than or equal the specified's. This is an alias of {@link Long#greaterThanOrEqual}.
   * @function
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   */
  
  
  LongPrototype.gte = LongPrototype.greaterThanOrEqual;
  /**
   * Tests if this Long's value is greater than or equal the specified's. This is an alias of {@link Long#greaterThanOrEqual}.
   * @function
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   */
  
  LongPrototype.ge = LongPrototype.greaterThanOrEqual;
  /**
   * Compares this Long's value with the specified's.
   * @this {!Long}
   * @param {!Long|number|string} other Other value
   * @returns {number} 0 if they are the same, 1 if the this is greater and -1
   *  if the given one is greater
   */
  
  LongPrototype.compare = function compare(other) {
    if (!isLong(other)) other = fromValue(other);
    if (this.eq(other)) return 0;
    var thisNeg = this.isNegative(),
        otherNeg = other.isNegative();
    if (thisNeg && !otherNeg) return -1;
    if (!thisNeg && otherNeg) return 1; // At this point the sign bits are the same
  
    if (!this.unsigned) return this.sub(other).isNegative() ? -1 : 1; // Both are positive if at least one is unsigned
  
    return other.high >>> 0 > this.high >>> 0 || other.high === this.high && other.low >>> 0 > this.low >>> 0 ? -1 : 1;
  };
  /**
   * Compares this Long's value with the specified's. This is an alias of {@link Long#compare}.
   * @function
   * @param {!Long|number|string} other Other value
   * @returns {number} 0 if they are the same, 1 if the this is greater and -1
   *  if the given one is greater
   */
  
  
  LongPrototype.comp = LongPrototype.compare;
  /**
   * Negates this Long's value.
   * @this {!Long}
   * @returns {!Long} Negated Long
   */
  
  LongPrototype.negate = function negate() {
    if (!this.unsigned && this.eq(MIN_VALUE)) return MIN_VALUE;
    return this.not().add(ONE);
  };
  /**
   * Negates this Long's value. This is an alias of {@link Long#negate}.
   * @function
   * @returns {!Long} Negated Long
   */
  
  
  LongPrototype.neg = LongPrototype.negate;
  /**
   * Returns the sum of this and the specified Long.
   * @this {!Long}
   * @param {!Long|number|string} addend Addend
   * @returns {!Long} Sum
   */
  
  LongPrototype.add = function add(addend) {
    if (!isLong(addend)) addend = fromValue(addend); // Divide each number into 4 chunks of 16 bits, and then sum the chunks.
  
    var a48 = this.high >>> 16;
    var a32 = this.high & 0xFFFF;
    var a16 = this.low >>> 16;
    var a00 = this.low & 0xFFFF;
    var b48 = addend.high >>> 16;
    var b32 = addend.high & 0xFFFF;
    var b16 = addend.low >>> 16;
    var b00 = addend.low & 0xFFFF;
    var c48 = 0,
        c32 = 0,
        c16 = 0,
        c00 = 0;
    c00 += a00 + b00;
    c16 += c00 >>> 16;
    c00 &= 0xFFFF;
    c16 += a16 + b16;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c32 += a32 + b32;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c48 += a48 + b48;
    c48 &= 0xFFFF;
    return fromBits(c16 << 16 | c00, c48 << 16 | c32, this.unsigned);
  };
  /**
   * Returns the difference of this and the specified Long.
   * @this {!Long}
   * @param {!Long|number|string} subtrahend Subtrahend
   * @returns {!Long} Difference
   */
  
  
  LongPrototype.subtract = function subtract(subtrahend) {
    if (!isLong(subtrahend)) subtrahend = fromValue(subtrahend);
    return this.add(subtrahend.neg());
  };
  /**
   * Returns the difference of this and the specified Long. This is an alias of {@link Long#subtract}.
   * @function
   * @param {!Long|number|string} subtrahend Subtrahend
   * @returns {!Long} Difference
   */
  
  
  LongPrototype.sub = LongPrototype.subtract;
  /**
   * Returns the product of this and the specified Long.
   * @this {!Long}
   * @param {!Long|number|string} multiplier Multiplier
   * @returns {!Long} Product
   */
  
  LongPrototype.multiply = function multiply(multiplier) {
    if (this.isZero()) return this;
    if (!isLong(multiplier)) multiplier = fromValue(multiplier); // use wasm support if present
  
    if (wasm) {
      var low = wasm["mul"](this.low, this.high, multiplier.low, multiplier.high);
      return fromBits(low, wasm["get_high"](), this.unsigned);
    }
  
    if (multiplier.isZero()) return this.unsigned ? UZERO : ZERO;
    if (this.eq(MIN_VALUE)) return multiplier.isOdd() ? MIN_VALUE : ZERO;
    if (multiplier.eq(MIN_VALUE)) return this.isOdd() ? MIN_VALUE : ZERO;
  
    if (this.isNegative()) {
      if (multiplier.isNegative()) return this.neg().mul(multiplier.neg());else return this.neg().mul(multiplier).neg();
    } else if (multiplier.isNegative()) return this.mul(multiplier.neg()).neg(); // If both longs are small, use float multiplication
  
  
    if (this.lt(TWO_PWR_24) && multiplier.lt(TWO_PWR_24)) return fromNumber(this.toNumber() * multiplier.toNumber(), this.unsigned); // Divide each long into 4 chunks of 16 bits, and then add up 4x4 products.
    // We can skip products that would overflow.
  
    var a48 = this.high >>> 16;
    var a32 = this.high & 0xFFFF;
    var a16 = this.low >>> 16;
    var a00 = this.low & 0xFFFF;
    var b48 = multiplier.high >>> 16;
    var b32 = multiplier.high & 0xFFFF;
    var b16 = multiplier.low >>> 16;
    var b00 = multiplier.low & 0xFFFF;
    var c48 = 0,
        c32 = 0,
        c16 = 0,
        c00 = 0;
    c00 += a00 * b00;
    c16 += c00 >>> 16;
    c00 &= 0xFFFF;
    c16 += a16 * b00;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c16 += a00 * b16;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c32 += a32 * b00;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c32 += a16 * b16;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c32 += a00 * b32;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c48 += a48 * b00 + a32 * b16 + a16 * b32 + a00 * b48;
    c48 &= 0xFFFF;
    return fromBits(c16 << 16 | c00, c48 << 16 | c32, this.unsigned);
  };
  /**
   * Returns the product of this and the specified Long. This is an alias of {@link Long#multiply}.
   * @function
   * @param {!Long|number|string} multiplier Multiplier
   * @returns {!Long} Product
   */
  
  
  LongPrototype.mul = LongPrototype.multiply;
  /**
   * Returns this Long divided by the specified. The result is signed if this Long is signed or
   *  unsigned if this Long is unsigned.
   * @this {!Long}
   * @param {!Long|number|string} divisor Divisor
   * @returns {!Long} Quotient
   */
  
  LongPrototype.divide = function divide(divisor) {
    if (!isLong(divisor)) divisor = fromValue(divisor);
    if (divisor.isZero()) throw Error('division by zero'); // use wasm support if present
  
    if (wasm) {
      // guard against signed division overflow: the largest
      // negative number / -1 would be 1 larger than the largest
      // positive number, due to two's complement.
      if (!this.unsigned && this.high === -0x80000000 && divisor.low === -1 && divisor.high === -1) {
        // be consistent with non-wasm code path
        return this;
      }
  
      var low = (this.unsigned ? wasm["div_u"] : wasm["div_s"])(this.low, this.high, divisor.low, divisor.high);
      return fromBits(low, wasm["get_high"](), this.unsigned);
    }
  
    if (this.isZero()) return this.unsigned ? UZERO : ZERO;
    var approx, rem, res;
  
    if (!this.unsigned) {
      // This section is only relevant for signed longs and is derived from the
      // closure library as a whole.
      if (this.eq(MIN_VALUE)) {
        if (divisor.eq(ONE) || divisor.eq(NEG_ONE)) return MIN_VALUE; // recall that -MIN_VALUE == MIN_VALUE
        else if (divisor.eq(MIN_VALUE)) return ONE;else {
          // At this point, we have |other| >= 2, so |this/other| < |MIN_VALUE|.
          var halfThis = this.shr(1);
          approx = halfThis.div(divisor).shl(1);
  
          if (approx.eq(ZERO)) {
            return divisor.isNegative() ? ONE : NEG_ONE;
          } else {
            rem = this.sub(divisor.mul(approx));
            res = approx.add(rem.div(divisor));
            return res;
          }
        }
      } else if (divisor.eq(MIN_VALUE)) return this.unsigned ? UZERO : ZERO;
  
      if (this.isNegative()) {
        if (divisor.isNegative()) return this.neg().div(divisor.neg());
        return this.neg().div(divisor).neg();
      } else if (divisor.isNegative()) return this.div(divisor.neg()).neg();
  
      res = ZERO;
    } else {
      // The algorithm below has not been made for unsigned longs. It's therefore
      // required to take special care of the MSB prior to running it.
      if (!divisor.unsigned) divisor = divisor.toUnsigned();
      if (divisor.gt(this)) return UZERO;
      if (divisor.gt(this.shru(1))) // 15 >>> 1 = 7 ; with divisor = 8 ; true
        return UONE;
      res = UZERO;
    } // Repeat the following until the remainder is less than other:  find a
    // floating-point that approximates remainder / other *from below*, add this
    // into the result, and subtract it from the remainder.  It is critical that
    // the approximate value is less than or equal to the real value so that the
    // remainder never becomes negative.
  
  
    rem = this;
  
    while (rem.gte(divisor)) {
      // Approximate the result of division. This may be a little greater or
      // smaller than the actual value.
      approx = Math.max(1, Math.floor(rem.toNumber() / divisor.toNumber())); // We will tweak the approximate result by changing it in the 48-th digit or
      // the smallest non-fractional digit, whichever is larger.
  
      var log2 = Math.ceil(Math.log(approx) / Math.LN2),
          delta = log2 <= 48 ? 1 : pow_dbl(2, log2 - 48),
          // Decrease the approximation until it is smaller than the remainder.  Note
      // that if it is too large, the product overflows and is negative.
      approxRes = fromNumber(approx),
          approxRem = approxRes.mul(divisor);
  
      while (approxRem.isNegative() || approxRem.gt(rem)) {
        approx -= delta;
        approxRes = fromNumber(approx, this.unsigned);
        approxRem = approxRes.mul(divisor);
      } // We know the answer can't be zero... and actually, zero would cause
      // infinite recursion since we would make no progress.
  
  
      if (approxRes.isZero()) approxRes = ONE;
      res = res.add(approxRes);
      rem = rem.sub(approxRem);
    }
  
    return res;
  };
  /**
   * Returns this Long divided by the specified. This is an alias of {@link Long#divide}.
   * @function
   * @param {!Long|number|string} divisor Divisor
   * @returns {!Long} Quotient
   */
  
  
  LongPrototype.div = LongPrototype.divide;
  /**
   * Returns this Long modulo the specified.
   * @this {!Long}
   * @param {!Long|number|string} divisor Divisor
   * @returns {!Long} Remainder
   */
  
  LongPrototype.modulo = function modulo(divisor) {
    if (!isLong(divisor)) divisor = fromValue(divisor); // use wasm support if present
  
    if (wasm) {
      var low = (this.unsigned ? wasm["rem_u"] : wasm["rem_s"])(this.low, this.high, divisor.low, divisor.high);
      return fromBits(low, wasm["get_high"](), this.unsigned);
    }
  
    return this.sub(this.div(divisor).mul(divisor));
  };
  /**
   * Returns this Long modulo the specified. This is an alias of {@link Long#modulo}.
   * @function
   * @param {!Long|number|string} divisor Divisor
   * @returns {!Long} Remainder
   */
  
  
  LongPrototype.mod = LongPrototype.modulo;
  /**
   * Returns this Long modulo the specified. This is an alias of {@link Long#modulo}.
   * @function
   * @param {!Long|number|string} divisor Divisor
   * @returns {!Long} Remainder
   */
  
  LongPrototype.rem = LongPrototype.modulo;
  /**
   * Returns the bitwise NOT of this Long.
   * @this {!Long}
   * @returns {!Long}
   */
  
  LongPrototype.not = function not() {
    return fromBits(~this.low, ~this.high, this.unsigned);
  };
  /**
   * Returns count leading zeros of this Long.
   * @this {!Long}
   * @returns {!number}
   */
  
  
  LongPrototype.countLeadingZeros = function countLeadingZeros() {
    return this.high ? Math.clz32(this.high) : Math.clz32(this.low) + 32;
  };
  /**
   * Returns count leading zeros. This is an alias of {@link Long#countLeadingZeros}.
   * @function
   * @param {!Long}
   * @returns {!number}
   */
  
  
  LongPrototype.clz = LongPrototype.countLeadingZeros;
  /**
   * Returns count trailing zeros of this Long.
   * @this {!Long}
   * @returns {!number}
   */
  
  LongPrototype.countTrailingZeros = function countTrailingZeros() {
    return this.low ? ctz32(this.low) : ctz32(this.high) + 32;
  };
  /**
   * Returns count trailing zeros. This is an alias of {@link Long#countTrailingZeros}.
   * @function
   * @param {!Long}
   * @returns {!number}
   */
  
  
  LongPrototype.ctz = LongPrototype.countTrailingZeros;
  /**
   * Returns the bitwise AND of this Long and the specified.
   * @this {!Long}
   * @param {!Long|number|string} other Other Long
   * @returns {!Long}
   */
  
  LongPrototype.and = function and(other) {
    if (!isLong(other)) other = fromValue(other);
    return fromBits(this.low & other.low, this.high & other.high, this.unsigned);
  };
  /**
   * Returns the bitwise OR of this Long and the specified.
   * @this {!Long}
   * @param {!Long|number|string} other Other Long
   * @returns {!Long}
   */
  
  
  LongPrototype.or = function or(other) {
    if (!isLong(other)) other = fromValue(other);
    return fromBits(this.low | other.low, this.high | other.high, this.unsigned);
  };
  /**
   * Returns the bitwise XOR of this Long and the given one.
   * @this {!Long}
   * @param {!Long|number|string} other Other Long
   * @returns {!Long}
   */
  
  
  LongPrototype.xor = function xor(other) {
    if (!isLong(other)) other = fromValue(other);
    return fromBits(this.low ^ other.low, this.high ^ other.high, this.unsigned);
  };
  /**
   * Returns this Long with bits shifted to the left by the given amount.
   * @this {!Long}
   * @param {number|!Long} numBits Number of bits
   * @returns {!Long} Shifted Long
   */
  
  
  LongPrototype.shiftLeft = function shiftLeft(numBits) {
    if (isLong(numBits)) numBits = numBits.toInt();
    if ((numBits &= 63) === 0) return this;else if (numBits < 32) return fromBits(this.low << numBits, this.high << numBits | this.low >>> 32 - numBits, this.unsigned);else return fromBits(0, this.low << numBits - 32, this.unsigned);
  };
  /**
   * Returns this Long with bits shifted to the left by the given amount. This is an alias of {@link Long#shiftLeft}.
   * @function
   * @param {number|!Long} numBits Number of bits
   * @returns {!Long} Shifted Long
   */
  
  
  LongPrototype.shl = LongPrototype.shiftLeft;
  /**
   * Returns this Long with bits arithmetically shifted to the right by the given amount.
   * @this {!Long}
   * @param {number|!Long} numBits Number of bits
   * @returns {!Long} Shifted Long
   */
  
  LongPrototype.shiftRight = function shiftRight(numBits) {
    if (isLong(numBits)) numBits = numBits.toInt();
    if ((numBits &= 63) === 0) return this;else if (numBits < 32) return fromBits(this.low >>> numBits | this.high << 32 - numBits, this.high >> numBits, this.unsigned);else return fromBits(this.high >> numBits - 32, this.high >= 0 ? 0 : -1, this.unsigned);
  };
  /**
   * Returns this Long with bits arithmetically shifted to the right by the given amount. This is an alias of {@link Long#shiftRight}.
   * @function
   * @param {number|!Long} numBits Number of bits
   * @returns {!Long} Shifted Long
   */
  
  
  LongPrototype.shr = LongPrototype.shiftRight;
  /**
   * Returns this Long with bits logically shifted to the right by the given amount.
   * @this {!Long}
   * @param {number|!Long} numBits Number of bits
   * @returns {!Long} Shifted Long
   */
  
  LongPrototype.shiftRightUnsigned = function shiftRightUnsigned(numBits) {
    if (isLong(numBits)) numBits = numBits.toInt();
    if ((numBits &= 63) === 0) return this;
    if (numBits < 32) return fromBits(this.low >>> numBits | this.high << 32 - numBits, this.high >>> numBits, this.unsigned);
    if (numBits === 32) return fromBits(this.high, 0, this.unsigned);
    return fromBits(this.high >>> numBits - 32, 0, this.unsigned);
  };
  /**
   * Returns this Long with bits logically shifted to the right by the given amount. This is an alias of {@link Long#shiftRightUnsigned}.
   * @function
   * @param {number|!Long} numBits Number of bits
   * @returns {!Long} Shifted Long
   */
  
  
  LongPrototype.shru = LongPrototype.shiftRightUnsigned;
  /**
   * Returns this Long with bits logically shifted to the right by the given amount. This is an alias of {@link Long#shiftRightUnsigned}.
   * @function
   * @param {number|!Long} numBits Number of bits
   * @returns {!Long} Shifted Long
   */
  
  LongPrototype.shr_u = LongPrototype.shiftRightUnsigned;
  /**
   * Returns this Long with bits rotated to the left by the given amount.
   * @this {!Long}
   * @param {number|!Long} numBits Number of bits
   * @returns {!Long} Rotated Long
   */
  
  LongPrototype.rotateLeft = function rotateLeft(numBits) {
    var b;
    if (isLong(numBits)) numBits = numBits.toInt();
    if ((numBits &= 63) === 0) return this;
    if (numBits === 32) return fromBits(this.high, this.low, this.unsigned);
  
    if (numBits < 32) {
      b = 32 - numBits;
      return fromBits(this.low << numBits | this.high >>> b, this.high << numBits | this.low >>> b, this.unsigned);
    }
  
    numBits -= 32;
    b = 32 - numBits;
    return fromBits(this.high << numBits | this.low >>> b, this.low << numBits | this.high >>> b, this.unsigned);
  };
  /**
   * Returns this Long with bits rotated to the left by the given amount. This is an alias of {@link Long#rotateLeft}.
   * @function
   * @param {number|!Long} numBits Number of bits
   * @returns {!Long} Rotated Long
   */
  
  
  LongPrototype.rotl = LongPrototype.rotateLeft;
  /**
   * Returns this Long with bits rotated to the right by the given amount.
   * @this {!Long}
   * @param {number|!Long} numBits Number of bits
   * @returns {!Long} Rotated Long
   */
  
  LongPrototype.rotateRight = function rotateRight(numBits) {
    var b;
    if (isLong(numBits)) numBits = numBits.toInt();
    if ((numBits &= 63) === 0) return this;
    if (numBits === 32) return fromBits(this.high, this.low, this.unsigned);
  
    if (numBits < 32) {
      b = 32 - numBits;
      return fromBits(this.high << b | this.low >>> numBits, this.low << b | this.high >>> numBits, this.unsigned);
    }
  
    numBits -= 32;
    b = 32 - numBits;
    return fromBits(this.low << b | this.high >>> numBits, this.high << b | this.low >>> numBits, this.unsigned);
  };
  /**
   * Returns this Long with bits rotated to the right by the given amount. This is an alias of {@link Long#rotateRight}.
   * @function
   * @param {number|!Long} numBits Number of bits
   * @returns {!Long} Rotated Long
   */
  
  
  LongPrototype.rotr = LongPrototype.rotateRight;
  /**
   * Converts this Long to signed.
   * @this {!Long}
   * @returns {!Long} Signed long
   */
  
  LongPrototype.toSigned = function toSigned() {
    if (!this.unsigned) return this;
    return fromBits(this.low, this.high, false);
  };
  /**
   * Converts this Long to unsigned.
   * @this {!Long}
   * @returns {!Long} Unsigned long
   */
  
  
  LongPrototype.toUnsigned = function toUnsigned() {
    if (this.unsigned) return this;
    return fromBits(this.low, this.high, true);
  };
  /**
   * Converts this Long to its byte representation.
   * @param {boolean=} le Whether little or big endian, defaults to big endian
   * @this {!Long}
   * @returns {!Array.<number>} Byte representation
   */
  
  
  LongPrototype.toBytes = function toBytes(le) {
    return le ? this.toBytesLE() : this.toBytesBE();
  };
  /**
   * Converts this Long to its little endian byte representation.
   * @this {!Long}
   * @returns {!Array.<number>} Little endian byte representation
   */
  
  
  LongPrototype.toBytesLE = function toBytesLE() {
    var hi = this.high,
        lo = this.low;
    return [lo & 0xff, lo >>> 8 & 0xff, lo >>> 16 & 0xff, lo >>> 24, hi & 0xff, hi >>> 8 & 0xff, hi >>> 16 & 0xff, hi >>> 24];
  };
  /**
   * Converts this Long to its big endian byte representation.
   * @this {!Long}
   * @returns {!Array.<number>} Big endian byte representation
   */
  
  
  LongPrototype.toBytesBE = function toBytesBE() {
    var hi = this.high,
        lo = this.low;
    return [hi >>> 24, hi >>> 16 & 0xff, hi >>> 8 & 0xff, hi & 0xff, lo >>> 24, lo >>> 16 & 0xff, lo >>> 8 & 0xff, lo & 0xff];
  };
  /**
   * Creates a Long from its byte representation.
   * @param {!Array.<number>} bytes Byte representation
   * @param {boolean=} unsigned Whether unsigned or not, defaults to signed
   * @param {boolean=} le Whether little or big endian, defaults to big endian
   * @returns {Long} The corresponding Long value
   */
  
  
  Long.fromBytes = function fromBytes(bytes, unsigned, le) {
    return le ? Long.fromBytesLE(bytes, unsigned) : Long.fromBytesBE(bytes, unsigned);
  };
  /**
   * Creates a Long from its little endian byte representation.
   * @param {!Array.<number>} bytes Little endian byte representation
   * @param {boolean=} unsigned Whether unsigned or not, defaults to signed
   * @returns {Long} The corresponding Long value
   */
  
  
  Long.fromBytesLE = function fromBytesLE(bytes, unsigned) {
    return new Long(bytes[0] | bytes[1] << 8 | bytes[2] << 16 | bytes[3] << 24, bytes[4] | bytes[5] << 8 | bytes[6] << 16 | bytes[7] << 24, unsigned);
  };
  /**
   * Creates a Long from its big endian byte representation.
   * @param {!Array.<number>} bytes Big endian byte representation
   * @param {boolean=} unsigned Whether unsigned or not, defaults to signed
   * @returns {Long} The corresponding Long value
   */
  
  
  Long.fromBytesBE = function fromBytesBE(bytes, unsigned) {
    return new Long(bytes[4] << 24 | bytes[5] << 16 | bytes[6] << 8 | bytes[7], bytes[0] << 24 | bytes[1] << 16 | bytes[2] << 8 | bytes[3], unsigned);
  };
  
  var _default = Long;
  exports.default = _default;
  return "default" in exports ? exports.default : exports;
})({});
if (true) !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = (function() { return Long; }).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
else {}


/***/ }),

/***/ "./node_modules/@temporalio/workflow/package.json":
/*!********************************************************!*\
  !*** ./node_modules/@temporalio/workflow/package.json ***!
  \********************************************************/
/***/ ((module) => {

"use strict";
module.exports = /*#__PURE__*/JSON.parse('{"name":"@temporalio/workflow","version":"1.11.2","description":"Temporal.io SDK Workflow sub-package","keywords":["temporal","workflow","isolate"],"bugs":{"url":"https://github.com/temporalio/sdk-typescript/issues"},"repository":{"type":"git","url":"git+https://github.com/temporalio/sdk-typescript.git","directory":"packages/workflow"},"homepage":"https://github.com/temporalio/sdk-typescript/tree/main/packages/workflow","license":"MIT","author":"Temporal Technologies Inc. <sdk@temporal.io>","main":"lib/index.js","types":"lib/index.d.ts","scripts":{},"dependencies":{"@temporalio/common":"1.11.2","@temporalio/proto":"1.11.2"},"devDependencies":{"source-map":"^0.7.4"},"publishConfig":{"access":"public"},"files":["src","lib"],"gitHead":"e78b4f71236ccd3227e674bad68439e961fec639"}');

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = globalThis.__webpack_module_cache__;
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
/*!******************************************************!*\
  !*** ./src/scenario-10-autogenerated-entrypoint.cjs ***!
  \******************************************************/

const api = __webpack_require__(/*! @temporalio/workflow/lib/worker-interface.js */ "./node_modules/@temporalio/workflow/lib/worker-interface.js");
exports.api = api;

const { overrideGlobals } = __webpack_require__(/*! @temporalio/workflow/lib/global-overrides.js */ "./node_modules/@temporalio/workflow/lib/global-overrides.js");
overrideGlobals();

exports.importWorkflows = function importWorkflows() {
  return __webpack_require__(/* webpackMode: "eager" */ /*! ./src/scenario-10.ts */ "./src/scenario-10.ts");
}

exports.importInterceptors = function importInterceptors() {
  return [
    
  ];
}

})();

__TEMPORAL__ = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2Zsb3ctYnVuZGxlLTc4NTExOGE3ZjYxNDNmNmZjZGQ4LmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBRUEsMEhBQThDO0FBSTlDLDBFQUEwRTtBQUMxRSxpRUFBaUU7QUFDakUsSUFBWSx3QkFJWDtBQUpELFdBQVksd0JBQXdCO0lBQ2xDLG1GQUFjO0lBQ2QscUhBQStCO0lBQy9CLDZFQUFXO0FBQ2IsQ0FBQyxFQUpXLHdCQUF3Qix3Q0FBeEIsd0JBQXdCLFFBSW5DO0FBRUQsK0JBQVksR0FBZ0YsQ0FBQztBQUM3RiwrQkFBWSxHQUFnRixDQUFDOzs7Ozs7Ozs7Ozs7Ozs7QUNmN0YsbUpBQWdGO0FBRWhGLG1KQUFnRjtBQTREaEY7Ozs7R0FJRztBQUNVLCtCQUF1QixHQUFxQixJQUFJLDJDQUF1QixFQUFFLENBQUM7QUFFdkY7O0dBRUc7QUFDVSw0QkFBb0IsR0FBd0I7SUFDdkQsZ0JBQWdCLEVBQUUsMkNBQXVCO0lBQ3pDLGdCQUFnQixFQUFFLCtCQUF1QjtJQUN6QyxhQUFhLEVBQUUsRUFBRTtDQUNsQixDQUFDOzs7Ozs7Ozs7Ozs7Ozs7QUM1RUYsNEdBYW9CO0FBQ3BCLDJIQUEwQztBQUMxQyxtR0FBeUM7QUFDekMsbUpBQTJHO0FBRTNHLFNBQVMsYUFBYSxDQUFDLEdBQUcsT0FBaUI7SUFDekMsT0FBTyxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3JFLENBQUM7QUFFRDs7R0FFRztBQUNILE1BQU0scUJBQXFCLEdBQUcsYUFBYTtBQUN6Qyx5QkFBeUI7QUFDekIsdUZBQXVGO0FBQ3ZGLDBCQUEwQjtBQUMxQixrR0FBa0c7QUFDbEcsdUNBQXVDO0FBQ3ZDLDJEQUEyRCxDQUM1RCxDQUFDO0FBRUY7OztHQUdHO0FBQ0gsTUFBTSw2QkFBNkIsR0FBRyxhQUFh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QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaLGVBQWU7QUFDZjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWixlQUFlO0FBQ2Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaLGFBQWEsU0FBUztBQUN0QixlQUFlO0FBQ2Y7QUFDQSxjQUFjLFlBQVk7QUFDMUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVE7QUFDUixNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsK0NBQStDO0FBQy9DO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1osZUFBZSxRQUFRO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1osZUFBZSxRQUFRO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1osZUFBZSxRQUFRO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1osZUFBZSxRQUFRO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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QUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7OztXQ3RCQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EsaUNBQWlDLFdBQVc7V0FDNUM7V0FDQTs7Ozs7V0NQQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLHlDQUF5Qyx3Q0FBd0M7V0FDakY7V0FDQTtXQUNBOzs7OztXQ1BBOzs7OztXQ0FBO1dBQ0E7V0FDQTtXQUNBLHVEQUF1RCxpQkFBaUI7V0FDeEU7V0FDQSxnREFBZ0QsYUFBYTtXQUM3RDs7Ozs7Ozs7Ozs7O0FDTEEsWUFBWSxtQkFBTyxDQUFDLGlIQUE4QztBQUNsRSxXQUFXOztBQUVYLFFBQVEsa0JBQWtCLEVBQUUsbUJBQU8sQ0FBQyxpSEFBOEM7QUFDbEY7O0FBRUEsdUJBQXVCO0FBQ3ZCLFNBQVMsbUJBQU8sNEJBQTRCLGtEQUE2RjtBQUN6STs7QUFFQSwwQkFBMEI7QUFDMUI7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzIjpbIi9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3JvYmhvbGxhbmQvZmluYW5jZS1kZW1vL3dvcmtmbG93cy9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vY29tbW9uL3NyYy9hY3Rpdml0eS1vcHRpb25zLnRzIiwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vcm9iaG9sbGFuZC9maW5hbmNlLWRlbW8vd29ya2Zsb3dzL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby9jb21tb24vc3JjL2NvbnZlcnRlci9kYXRhLWNvbnZlcnRlci50cyIsIi9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3JvYmhvbGxhbmQvZmluYW5jZS1kZW1vL3dvcmtmbG93cy9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vY29tbW9uL3NyYy9jb252ZXJ0ZXIvZmFpbHVyZS1jb252ZXJ0ZXIudHMiLCIvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS9yb2Job2xsYW5kL2ZpbmFuY2UtZGVtby93b3JrZmxvd3Mvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL2NvbW1vbi9zcmMvY29udmVydGVyL3BheWxvYWQtY29kZWMudHMiLCIvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS9yb2Job2xsYW5kL2ZpbmFuY2UtZGVtby93b3JrZmxvd3Mvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL2NvbW1vbi9zcmMvY29udmVydGVyL3BheWxvYWQtY29udmVydGVyLnRzIiwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vcm9iaG9sbGFuZC9maW5hbmNlLWRlbW8vd29ya2Zsb3dzL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby9jb21tb24vc3JjL2NvbnZlcnRlci90eXBlcy50cyIsIi9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3JvYmhvbGxhbmQvZmluYW5jZS1kZW1vL3dvcmtmbG93cy9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vY29tbW9uL3NyYy9kZXByZWNhdGVkLXRpbWUudHMiLCIvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS9yb2Job2xsYW5kL2ZpbmFuY2UtZGVtby93b3JrZmxvd3Mvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL2NvbW1vbi9zcmMvZW5jb2RpbmcudHMiLCIvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS9yb2Job2xsYW5kL2ZpbmFuY2UtZGVtby93b3JrZmxvd3Mvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL2NvbW1vbi9zcmMvZXJyb3JzLnRzIiwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vcm9iaG9sbGFuZC9maW5hbmNlLWRlbW8vd29ya2Zsb3dzL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby9jb21tb24vc3JjL2ZhaWx1cmUudHMiLCIvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS9yb2Job2xsYW5kL2ZpbmFuY2UtZGVtby93b3JrZmxvd3Mvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL2NvbW1vbi9zcmMvaW5kZXgudHMiLCIvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS9yb2Job2xsYW5kL2ZpbmFuY2UtZGVtby93b3JrZmxvd3Mvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL2NvbW1vbi9zcmMvaW50ZXJjZXB0b3JzLnRzIiwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vcm9iaG9sbGFuZC9maW5hbmNlLWRlbW8vd29ya2Zsb3dzL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby9jb21tb24vc3JjL2ludGVyZmFjZXMudHMiLCIvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS9yb2Job2xsYW5kL2ZpbmFuY2UtZGVtby93b3JrZmxvd3Mvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL2NvbW1vbi9zcmMvbG9nZ2VyLnRzIiwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vcm9iaG9sbGFuZC9maW5hbmNlLWRlbW8vd29ya2Zsb3dzL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby9jb21tb24vc3JjL3JldHJ5LXBvbGljeS50cyIsIi9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3JvYmhvbGxhbmQvZmluYW5jZS1kZW1vL3dvcmtmbG93cy9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vY29tbW9uL3NyYy90aW1lLnRzIiwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vcm9iaG9sbGFuZC9maW5hbmNlLWRlbW8vd29ya2Zsb3dzL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby9jb21tb24vc3JjL3R5cGUtaGVscGVycy50cyIsIi9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3JvYmhvbGxhbmQvZmluYW5jZS1kZW1vL3dvcmtmbG93cy9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vY29tbW9uL3NyYy92ZXJzaW9uaW5nLWludGVudC1lbnVtLnRzIiwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vcm9iaG9sbGFuZC9maW5hbmNlLWRlbW8vd29ya2Zsb3dzL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby9jb21tb24vc3JjL3ZlcnNpb25pbmctaW50ZW50LnRzIiwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vcm9iaG9sbGFuZC9maW5hbmNlLWRlbW8vd29ya2Zsb3dzL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby9jb21tb24vc3JjL3dvcmtmbG93LWhhbmRsZS50cyIsIi9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3JvYmhvbGxhbmQvZmluYW5jZS1kZW1vL3dvcmtmbG93cy9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vY29tbW9uL3NyYy93b3JrZmxvdy1vcHRpb25zLnRzIiwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vcm9iaG9sbGFuZC9maW5hbmNlLWRlbW8vd29ya2Zsb3dzL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby93b3JrZmxvdy9zcmMvYWxlYS50cyIsIi9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3JvYmhvbGxhbmQvZmluYW5jZS1kZW1vL3dvcmtmbG93cy9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vd29ya2Zsb3cvc3JjL2NhbmNlbGxhdGlvbi1zY29wZS50cyIsIi9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3JvYmhvbGxhbmQvZmluYW5jZS1kZW1vL3dvcmtmbG93cy9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vd29ya2Zsb3cvc3JjL2Vycm9ycy50cyIsIi9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3JvYmhvbGxhbmQvZmluYW5jZS1kZW1vL3dvcmtmbG93cy9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vd29ya2Zsb3cvc3JjL2ZsYWdzLnRzIiwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vcm9iaG9sbGFuZC9maW5hbmNlLWRlbW8vd29ya2Zsb3dzL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby93b3JrZmxvdy9zcmMvZ2xvYmFsLWF0dHJpYnV0ZXMudHMiLCIvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS9yb2Job2xsYW5kL2ZpbmFuY2UtZGVtby93b3JrZmxvd3Mvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL3dvcmtmbG93L3NyYy9nbG9iYWwtb3ZlcnJpZGVzLnRzIiwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vcm9iaG9sbGFuZC9maW5hbmNlLWRlbW8vd29ya2Zsb3dzL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby93b3JrZmxvdy9zcmMvaW5kZXgudHMiLCIvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS9yb2Job2xsYW5kL2ZpbmFuY2UtZGVtby93b3JrZmxvd3Mvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL3dvcmtmbG93L3NyYy9pbnRlcmNlcHRvcnMudHMiLCIvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS9yb2Job2xsYW5kL2ZpbmFuY2UtZGVtby93b3JrZmxvd3Mvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL3dvcmtmbG93L3NyYy9pbnRlcmZhY2VzLnRzIiwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vcm9iaG9sbGFuZC9maW5hbmNlLWRlbW8vd29ya2Zsb3dzL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby93b3JrZmxvdy9zcmMvaW50ZXJuYWxzLnRzIiwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vcm9iaG9sbGFuZC9maW5hbmNlLWRlbW8vd29ya2Zsb3dzL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby93b3JrZmxvdy9zcmMvbG9ncy50cyIsIi9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3JvYmhvbGxhbmQvZmluYW5jZS1kZW1vL3dvcmtmbG93cy9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vd29ya2Zsb3cvc3JjL3BrZy50cyIsIi9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3JvYmhvbGxhbmQvZmluYW5jZS1kZW1vL3dvcmtmbG93cy9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vd29ya2Zsb3cvc3JjL3NpbmtzLnRzIiwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vcm9iaG9sbGFuZC9maW5hbmNlLWRlbW8vd29ya2Zsb3dzL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby93b3JrZmxvdy9zcmMvc3RhY2staGVscGVycy50cyIsIi9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3JvYmhvbGxhbmQvZmluYW5jZS1kZW1vL3dvcmtmbG93cy9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vd29ya2Zsb3cvc3JjL3RyaWdnZXIudHMiLCIvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS9yb2Job2xsYW5kL2ZpbmFuY2UtZGVtby93b3JrZmxvd3Mvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL3dvcmtmbG93L3NyYy91cGRhdGUtc2NvcGUudHMiLCIvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS9yb2Job2xsYW5kL2ZpbmFuY2UtZGVtby93b3JrZmxvd3Mvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL3dvcmtmbG93L3NyYy93b3JrZXItaW50ZXJmYWNlLnRzIiwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vcm9iaG9sbGFuZC9maW5hbmNlLWRlbW8vd29ya2Zsb3dzL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby93b3JrZmxvdy9zcmMvd29ya2Zsb3cudHMiLCIvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS9yb2Job2xsYW5kL2ZpbmFuY2UtZGVtby93b3JrZmxvd3Mvc3JjL3NjZW5hcmlvLTEwLnRzIiwiaWdub3JlZHwvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS9yb2Job2xsYW5kL2ZpbmFuY2UtZGVtby93b3JrZmxvd3Mvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL3dvcmtmbG93L2xpYnxfX3RlbXBvcmFsX2N1c3RvbV9mYWlsdXJlX2NvbnZlcnRlciIsImlnbm9yZWR8L1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vcm9iaG9sbGFuZC9maW5hbmNlLWRlbW8vd29ya2Zsb3dzL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby93b3JrZmxvdy9saWJ8X190ZW1wb3JhbF9jdXN0b21fcGF5bG9hZF9jb252ZXJ0ZXIiLCIvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS9yb2Job2xsYW5kL2ZpbmFuY2UtZGVtby93b3JrZmxvd3Mvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL2NvbW1vbi9ub2RlX21vZHVsZXMvbXMvZGlzdC9pbmRleC5janMiLCIvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS9yb2Job2xsYW5kL2ZpbmFuY2UtZGVtby93b3JrZmxvd3Mvbm9kZV9tb2R1bGVzL2xvbmcvdW1kL2luZGV4LmpzIiwid2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrL3J1bnRpbWUvY29tcGF0IGdldCBkZWZhdWx0IGV4cG9ydCIsIndlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0IiwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vcm9iaG9sbGFuZC9maW5hbmNlLWRlbW8vd29ya2Zsb3dzL3NyYy9zY2VuYXJpby0xMC1hdXRvZ2VuZXJhdGVkLWVudHJ5cG9pbnQuY2pzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgY29yZXNkayB9IGZyb20gJ0B0ZW1wb3JhbGlvL3Byb3RvJztcbmltcG9ydCB7IFJldHJ5UG9saWN5IH0gZnJvbSAnLi9yZXRyeS1wb2xpY3knO1xuaW1wb3J0IHsgY2hlY2tFeHRlbmRzIH0gZnJvbSAnLi90eXBlLWhlbHBlcnMnO1xuaW1wb3J0IHsgRHVyYXRpb24gfSBmcm9tICcuL3RpbWUnO1xuaW1wb3J0IHsgVmVyc2lvbmluZ0ludGVudCB9IGZyb20gJy4vdmVyc2lvbmluZy1pbnRlbnQnO1xuXG4vLyBBdm9pZCBpbXBvcnRpbmcgdGhlIHByb3RvIGltcGxlbWVudGF0aW9uIHRvIHJlZHVjZSB3b3JrZmxvdyBidW5kbGUgc2l6ZVxuLy8gQ29waWVkIGZyb20gY29yZXNkay53b3JrZmxvd19jb21tYW5kcy5BY3Rpdml0eUNhbmNlbGxhdGlvblR5cGVcbmV4cG9ydCBlbnVtIEFjdGl2aXR5Q2FuY2VsbGF0aW9uVHlwZSB7XG4gIFRSWV9DQU5DRUwgPSAwLFxuICBXQUlUX0NBTkNFTExBVElPTl9DT01QTEVURUQgPSAxLFxuICBBQkFORE9OID0gMixcbn1cblxuY2hlY2tFeHRlbmRzPGNvcmVzZGsud29ya2Zsb3dfY29tbWFuZHMuQWN0aXZpdHlDYW5jZWxsYXRpb25UeXBlLCBBY3Rpdml0eUNhbmNlbGxhdGlvblR5cGU+KCk7XG5jaGVja0V4dGVuZHM8QWN0aXZpdHlDYW5jZWxsYXRpb25UeXBlLCBjb3Jlc2RrLndvcmtmbG93X2NvbW1hbmRzLkFjdGl2aXR5Q2FuY2VsbGF0aW9uVHlwZT4oKTtcblxuLyoqXG4gKiBPcHRpb25zIGZvciByZW1vdGUgYWN0aXZpdHkgaW52b2NhdGlvblxuICovXG5leHBvcnQgaW50ZXJmYWNlIEFjdGl2aXR5T3B0aW9ucyB7XG4gIC8qKlxuICAgKiBJZGVudGlmaWVyIHRvIHVzZSBmb3IgdHJhY2tpbmcgdGhlIGFjdGl2aXR5IGluIFdvcmtmbG93IGhpc3RvcnkuXG4gICAqIFRoZSBgYWN0aXZpdHlJZGAgY2FuIGJlIGFjY2Vzc2VkIGJ5IHRoZSBhY3Rpdml0eSBmdW5jdGlvbi5cbiAgICogRG9lcyBub3QgbmVlZCB0byBiZSB1bmlxdWUuXG4gICAqXG4gICAqIEBkZWZhdWx0IGFuIGluY3JlbWVudGFsIHNlcXVlbmNlIG51bWJlclxuICAgKi9cbiAgYWN0aXZpdHlJZD86IHN0cmluZztcblxuICAvKipcbiAgICogVGFzayBxdWV1ZSBuYW1lLlxuICAgKlxuICAgKiBAZGVmYXVsdCBjdXJyZW50IHdvcmtlciB0YXNrIHF1ZXVlXG4gICAqL1xuICB0YXNrUXVldWU/OiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIEhlYXJ0YmVhdCBpbnRlcnZhbC4gQWN0aXZpdHkgbXVzdCBoZWFydGJlYXQgYmVmb3JlIHRoaXMgaW50ZXJ2YWwgcGFzc2VzIGFmdGVyIGEgbGFzdCBoZWFydGJlYXQgb3IgYWN0aXZpdHkgc3RhcnQuXG4gICAqIEBmb3JtYXQgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBvciB7QGxpbmsgaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvbXMgfCBtcy1mb3JtYXR0ZWQgc3RyaW5nfVxuICAgKi9cbiAgaGVhcnRiZWF0VGltZW91dD86IER1cmF0aW9uO1xuXG4gIC8qKlxuICAgKiBSZXRyeVBvbGljeSB0aGF0IGRlZmluZSBob3cgYWN0aXZpdHkgaXMgcmV0cmllZCBpbiBjYXNlIG9mIGZhaWx1cmUuIElmIHRoaXMgaXMgbm90IHNldCwgdGhlbiB0aGUgc2VydmVyLWRlZmluZWQgZGVmYXVsdCBhY3Rpdml0eSByZXRyeSBwb2xpY3kgd2lsbCBiZSB1c2VkLiBUbyBlbnN1cmUgemVybyByZXRyaWVzLCBzZXQgbWF4aW11bSBhdHRlbXB0cyB0byAxLlxuICAgKi9cbiAgcmV0cnk/OiBSZXRyeVBvbGljeTtcblxuICAvKipcbiAgICogTWF4aW11bSB0aW1lIG9mIGEgc2luZ2xlIEFjdGl2aXR5IGV4ZWN1dGlvbiBhdHRlbXB0LiBOb3RlIHRoYXQgdGhlIFRlbXBvcmFsIFNlcnZlciBkb2Vzbid0IGRldGVjdCBXb3JrZXIgcHJvY2Vzc1xuICAgKiBmYWlsdXJlcyBkaXJlY3RseTogaW5zdGVhZCwgaXQgcmVsaWVzIG9uIHRoaXMgdGltZW91dCB0byBkZXRlY3QgdGhhdCBhbiBBY3Rpdml0eSBkaWRuJ3QgY29tcGxldGUgb24gdGltZS4gVGhlcmVmb3JlLCB0aGlzXG4gICAqIHRpbWVvdXQgc2hvdWxkIGJlIGFzIHNob3J0IGFzIHRoZSBsb25nZXN0IHBvc3NpYmxlIGV4ZWN1dGlvbiBvZiB0aGUgQWN0aXZpdHkgYm9keS4gUG90ZW50aWFsbHkgbG9uZy1ydW5uaW5nXG4gICAqIEFjdGl2aXRpZXMgbXVzdCBzcGVjaWZ5IHtAbGluayBoZWFydGJlYXRUaW1lb3V0fSBhbmQgY2FsbCB7QGxpbmsgYWN0aXZpdHkuQ29udGV4dC5oZWFydGJlYXR9IHBlcmlvZGljYWxseSBmb3JcbiAgICogdGltZWx5IGZhaWx1cmUgZGV0ZWN0aW9uLlxuICAgKlxuICAgKiBFaXRoZXIgdGhpcyBvcHRpb24gb3Ige0BsaW5rIHNjaGVkdWxlVG9DbG9zZVRpbWVvdXR9IGlzIHJlcXVpcmVkLlxuICAgKlxuICAgKiBAZGVmYXVsdCBgc2NoZWR1bGVUb0Nsb3NlVGltZW91dGAgb3IgdW5saW1pdGVkXG4gICAqIEBmb3JtYXQgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBvciB7QGxpbmsgaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvbXMgfCBtcy1mb3JtYXR0ZWQgc3RyaW5nfVxuICAgKi9cbiAgc3RhcnRUb0Nsb3NlVGltZW91dD86IER1cmF0aW9uO1xuXG4gIC8qKlxuICAgKiBUaW1lIHRoYXQgdGhlIEFjdGl2aXR5IFRhc2sgY2FuIHN0YXkgaW4gdGhlIFRhc2sgUXVldWUgYmVmb3JlIGl0IGlzIHBpY2tlZCB1cCBieSBhIFdvcmtlci4gRG8gbm90IHNwZWNpZnkgdGhpcyB0aW1lb3V0IHVubGVzcyB1c2luZyBob3N0LXNwZWNpZmljIFRhc2sgUXVldWVzIGZvciBBY3Rpdml0eSBUYXNrcyBhcmUgYmVpbmcgdXNlZCBmb3Igcm91dGluZy5cbiAgICogYHNjaGVkdWxlVG9TdGFydFRpbWVvdXRgIGlzIGFsd2F5cyBub24tcmV0cnlhYmxlLiBSZXRyeWluZyBhZnRlciB0aGlzIHRpbWVvdXQgZG9lc24ndCBtYWtlIHNlbnNlIGFzIGl0IHdvdWxkIGp1c3QgcHV0IHRoZSBBY3Rpdml0eSBUYXNrIGJhY2sgaW50byB0aGUgc2FtZSBUYXNrIFF1ZXVlLlxuICAgKlxuICAgKiBAZGVmYXVsdCBgc2NoZWR1bGVUb0Nsb3NlVGltZW91dGAgb3IgdW5saW1pdGVkXG4gICAqIEBmb3JtYXQgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBvciB7QGxpbmsgaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvbXMgfCBtcy1mb3JtYXR0ZWQgc3RyaW5nfVxuICAgKi9cbiAgc2NoZWR1bGVUb1N0YXJ0VGltZW91dD86IER1cmF0aW9uO1xuXG4gIC8qKlxuICAgKiBUb3RhbCB0aW1lIHRoYXQgYSB3b3JrZmxvdyBpcyB3aWxsaW5nIHRvIHdhaXQgZm9yIHRoZSBBY3Rpdml0eSB0byBjb21wbGV0ZS5cbiAgICogYHNjaGVkdWxlVG9DbG9zZVRpbWVvdXRgIGxpbWl0cyB0aGUgdG90YWwgdGltZSBvZiBhbiBBY3Rpdml0eSdzIGV4ZWN1dGlvbiBpbmNsdWRpbmcgcmV0cmllcyAodXNlIHtAbGluayBzdGFydFRvQ2xvc2VUaW1lb3V0fSB0byBsaW1pdCB0aGUgdGltZSBvZiBhIHNpbmdsZSBhdHRlbXB0KS5cbiAgICpcbiAgICogRWl0aGVyIHRoaXMgb3B0aW9uIG9yIHtAbGluayBzdGFydFRvQ2xvc2VUaW1lb3V0fSBpcyByZXF1aXJlZC5cbiAgICpcbiAgICogQGRlZmF1bHQgdW5saW1pdGVkXG4gICAqIEBmb3JtYXQgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBvciB7QGxpbmsgaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvbXMgfCBtcy1mb3JtYXR0ZWQgc3RyaW5nfVxuICAgKi9cbiAgc2NoZWR1bGVUb0Nsb3NlVGltZW91dD86IER1cmF0aW9uO1xuXG4gIC8qKlxuICAgKiBEZXRlcm1pbmVzIHdoYXQgdGhlIFNESyBkb2VzIHdoZW4gdGhlIEFjdGl2aXR5IGlzIGNhbmNlbGxlZC5cbiAgICogLSBgVFJZX0NBTkNFTGAgLSBJbml0aWF0ZSBhIGNhbmNlbGxhdGlvbiByZXF1ZXN0IGFuZCBpbW1lZGlhdGVseSByZXBvcnQgY2FuY2VsbGF0aW9uIHRvIHRoZSB3b3JrZmxvdy5cbiAgICogLSBgV0FJVF9DQU5DRUxMQVRJT05fQ09NUExFVEVEYCAtIFdhaXQgZm9yIGFjdGl2aXR5IGNhbmNlbGxhdGlvbiBjb21wbGV0aW9uLiBOb3RlIHRoYXQgYWN0aXZpdHkgbXVzdCBoZWFydGJlYXQgdG8gcmVjZWl2ZSBhXG4gICAqICAgY2FuY2VsbGF0aW9uIG5vdGlmaWNhdGlvbi4gVGhpcyBjYW4gYmxvY2sgdGhlIGNhbmNlbGxhdGlvbiBmb3IgYSBsb25nIHRpbWUgaWYgYWN0aXZpdHkgZG9lc24ndFxuICAgKiAgIGhlYXJ0YmVhdCBvciBjaG9vc2VzIHRvIGlnbm9yZSB0aGUgY2FuY2VsbGF0aW9uIHJlcXVlc3QuXG4gICAqIC0gYEFCQU5ET05gIC0gRG8gbm90IHJlcXVlc3QgY2FuY2VsbGF0aW9uIG9mIHRoZSBhY3Rpdml0eSBhbmQgaW1tZWRpYXRlbHkgcmVwb3J0IGNhbmNlbGxhdGlvbiB0byB0aGUgd29ya2Zsb3cuXG4gICAqL1xuICBjYW5jZWxsYXRpb25UeXBlPzogQWN0aXZpdHlDYW5jZWxsYXRpb25UeXBlO1xuXG4gIC8qKlxuICAgKiBFYWdlciBkaXNwYXRjaCBpcyBhbiBvcHRpbWl6YXRpb24gdGhhdCBpbXByb3ZlcyB0aGUgdGhyb3VnaHB1dCBhbmQgbG9hZCBvbiB0aGUgc2VydmVyIGZvciBzY2hlZHVsaW5nIEFjdGl2aXRpZXMuXG4gICAqIFdoZW4gdXNlZCwgdGhlIHNlcnZlciB3aWxsIGhhbmQgb3V0IEFjdGl2aXR5IHRhc2tzIGJhY2sgdG8gdGhlIFdvcmtlciB3aGVuIGl0IGNvbXBsZXRlcyBhIFdvcmtmbG93IHRhc2suXG4gICAqIEl0IGlzIGF2YWlsYWJsZSBmcm9tIHNlcnZlciB2ZXJzaW9uIDEuMTcgYmVoaW5kIHRoZSBgc3lzdGVtLmVuYWJsZUFjdGl2aXR5RWFnZXJFeGVjdXRpb25gIGZlYXR1cmUgZmxhZy5cbiAgICpcbiAgICogRWFnZXIgZGlzcGF0Y2ggd2lsbCBvbmx5IGJlIHVzZWQgaWYgYGFsbG93RWFnZXJEaXNwYXRjaGAgaXMgZW5hYmxlZCAodGhlIGRlZmF1bHQpIGFuZCB7QGxpbmsgdGFza1F1ZXVlfSBpcyBlaXRoZXJcbiAgICogb21pdHRlZCBvciB0aGUgc2FtZSBhcyB0aGUgY3VycmVudCBXb3JrZmxvdy5cbiAgICpcbiAgICogQGRlZmF1bHQgdHJ1ZVxuICAgKi9cbiAgYWxsb3dFYWdlckRpc3BhdGNoPzogYm9vbGVhbjtcblxuICAvKipcbiAgICogV2hlbiB1c2luZyB0aGUgV29ya2VyIFZlcnNpb25pbmcgZmVhdHVyZSwgc3BlY2lmaWVzIHdoZXRoZXIgdGhpcyBBY3Rpdml0eSBzaG91bGQgcnVuIG9uIGFcbiAgICogd29ya2VyIHdpdGggYSBjb21wYXRpYmxlIEJ1aWxkIElkIG9yIG5vdC4gU2VlIHtAbGluayBWZXJzaW9uaW5nSW50ZW50fS5cbiAgICpcbiAgICogQGRlZmF1bHQgJ0NPTVBBVElCTEUnXG4gICAqXG4gICAqIEBleHBlcmltZW50YWxcbiAgICovXG4gIHZlcnNpb25pbmdJbnRlbnQ/OiBWZXJzaW9uaW5nSW50ZW50O1xufVxuXG4vKipcbiAqIE9wdGlvbnMgZm9yIGxvY2FsIGFjdGl2aXR5IGludm9jYXRpb25cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBMb2NhbEFjdGl2aXR5T3B0aW9ucyB7XG4gIC8qKlxuICAgKiBSZXRyeVBvbGljeSB0aGF0IGRlZmluZXMgaG93IGFuIGFjdGl2aXR5IGlzIHJldHJpZWQgaW4gY2FzZSBvZiBmYWlsdXJlLiBJZiB0aGlzIGlzIG5vdCBzZXQsIHRoZW4gdGhlIFNESy1kZWZpbmVkIGRlZmF1bHQgYWN0aXZpdHkgcmV0cnkgcG9saWN5IHdpbGwgYmUgdXNlZC5cbiAgICogTm90ZSB0aGF0IGxvY2FsIGFjdGl2aXRpZXMgYXJlIGFsd2F5cyBleGVjdXRlZCBhdCBsZWFzdCBvbmNlLCBldmVuIGlmIG1heGltdW0gYXR0ZW1wdHMgaXMgc2V0IHRvIDEgZHVlIHRvIFdvcmtmbG93IHRhc2sgcmV0cmllcy5cbiAgICovXG4gIHJldHJ5PzogUmV0cnlQb2xpY3k7XG5cbiAgLyoqXG4gICAqIE1heGltdW0gdGltZSB0aGUgbG9jYWwgYWN0aXZpdHkgaXMgYWxsb3dlZCB0byBleGVjdXRlIGFmdGVyIHRoZSB0YXNrIGlzIGRpc3BhdGNoZWQuIFRoaXNcbiAgICogdGltZW91dCBpcyBhbHdheXMgcmV0cnlhYmxlLlxuICAgKlxuICAgKiBFaXRoZXIgdGhpcyBvcHRpb24gb3Ige0BsaW5rIHNjaGVkdWxlVG9DbG9zZVRpbWVvdXR9IGlzIHJlcXVpcmVkLlxuICAgKiBJZiBzZXQsIHRoaXMgbXVzdCBiZSA8PSB7QGxpbmsgc2NoZWR1bGVUb0Nsb3NlVGltZW91dH0sIG90aGVyd2lzZSwgaXQgd2lsbCBiZSBjbGFtcGVkIGRvd24uXG4gICAqXG4gICAqIEBmb3JtYXQgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBvciB7QGxpbmsgaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvbXMgfCBtcy1mb3JtYXR0ZWQgc3RyaW5nfVxuICAgKi9cbiAgc3RhcnRUb0Nsb3NlVGltZW91dD86IER1cmF0aW9uO1xuXG4gIC8qKlxuICAgKiBMaW1pdHMgdGltZSB0aGUgbG9jYWwgYWN0aXZpdHkgY2FuIGlkbGUgaW50ZXJuYWxseSBiZWZvcmUgYmVpbmcgZXhlY3V0ZWQuIFRoYXQgY2FuIGhhcHBlbiBpZlxuICAgKiB0aGUgd29ya2VyIGlzIGN1cnJlbnRseSBhdCBtYXggY29uY3VycmVudCBsb2NhbCBhY3Rpdml0eSBleGVjdXRpb25zLiBUaGlzIHRpbWVvdXQgaXMgYWx3YXlzXG4gICAqIG5vbiByZXRyeWFibGUgYXMgYWxsIGEgcmV0cnkgd291bGQgYWNoaWV2ZSBpcyB0byBwdXQgaXQgYmFjayBpbnRvIHRoZSBzYW1lIHF1ZXVlLiBEZWZhdWx0c1xuICAgKiB0byB7QGxpbmsgc2NoZWR1bGVUb0Nsb3NlVGltZW91dH0gaWYgbm90IHNwZWNpZmllZCBhbmQgdGhhdCBpcyBzZXQuIE11c3QgYmUgPD1cbiAgICoge0BsaW5rIHNjaGVkdWxlVG9DbG9zZVRpbWVvdXR9IHdoZW4gc2V0LCBvdGhlcndpc2UsIGl0IHdpbGwgYmUgY2xhbXBlZCBkb3duLlxuICAgKlxuICAgKiBAZGVmYXVsdCB1bmxpbWl0ZWRcbiAgICogQGZvcm1hdCBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIG9yIHtAbGluayBodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9tcyB8IG1zLWZvcm1hdHRlZCBzdHJpbmd9XG4gICAqL1xuICBzY2hlZHVsZVRvU3RhcnRUaW1lb3V0PzogRHVyYXRpb247XG5cbiAgLyoqXG4gICAqIEluZGljYXRlcyBob3cgbG9uZyB0aGUgY2FsbGVyIGlzIHdpbGxpbmcgdG8gd2FpdCBmb3IgbG9jYWwgYWN0aXZpdHkgY29tcGxldGlvbi4gTGltaXRzIGhvd1xuICAgKiBsb25nIHJldHJpZXMgd2lsbCBiZSBhdHRlbXB0ZWQuXG4gICAqXG4gICAqIEVpdGhlciB0aGlzIG9wdGlvbiBvciB7QGxpbmsgc3RhcnRUb0Nsb3NlVGltZW91dH0gaXMgcmVxdWlyZWQuXG4gICAqXG4gICAqIEBkZWZhdWx0IHVubGltaXRlZFxuICAgKiBAZm9ybWF0IG51bWJlciBvZiBtaWxsaXNlY29uZHMgb3Ige0BsaW5rIGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL21zIHwgbXMtZm9ybWF0dGVkIHN0cmluZ31cbiAgICovXG4gIHNjaGVkdWxlVG9DbG9zZVRpbWVvdXQ/OiBEdXJhdGlvbjtcblxuICAvKipcbiAgICogSWYgdGhlIGFjdGl2aXR5IGlzIHJldHJ5aW5nIGFuZCBiYWNrb2ZmIHdvdWxkIGV4Y2VlZCB0aGlzIHZhbHVlLCBhIHNlcnZlciBzaWRlIHRpbWVyIHdpbGwgYmUgc2NoZWR1bGVkIGZvciB0aGUgbmV4dCBhdHRlbXB0LlxuICAgKiBPdGhlcndpc2UsIGJhY2tvZmYgd2lsbCBoYXBwZW4gaW50ZXJuYWxseSBpbiB0aGUgU0RLLlxuICAgKlxuICAgKiBAZGVmYXVsdCAxIG1pbnV0ZVxuICAgKiBAZm9ybWF0IG51bWJlciBvZiBtaWxsaXNlY29uZHMgb3Ige0BsaW5rIGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL21zIHwgbXMtZm9ybWF0dGVkIHN0cmluZ31cbiAgICoqL1xuICBsb2NhbFJldHJ5VGhyZXNob2xkPzogRHVyYXRpb247XG5cbiAgLyoqXG4gICAqIERldGVybWluZXMgd2hhdCB0aGUgU0RLIGRvZXMgd2hlbiB0aGUgQWN0aXZpdHkgaXMgY2FuY2VsbGVkLlxuICAgKiAtIGBUUllfQ0FOQ0VMYCAtIEluaXRpYXRlIGEgY2FuY2VsbGF0aW9uIHJlcXVlc3QgYW5kIGltbWVkaWF0ZWx5IHJlcG9ydCBjYW5jZWxsYXRpb24gdG8gdGhlIHdvcmtmbG93LlxuICAgKiAtIGBXQUlUX0NBTkNFTExBVElPTl9DT01QTEVURURgIC0gV2FpdCBmb3IgYWN0aXZpdHkgY2FuY2VsbGF0aW9uIGNvbXBsZXRpb24uIE5vdGUgdGhhdCBhY3Rpdml0eSBtdXN0IGhlYXJ0YmVhdCB0byByZWNlaXZlIGFcbiAgICogICBjYW5jZWxsYXRpb24gbm90aWZpY2F0aW9uLiBUaGlzIGNhbiBibG9jayB0aGUgY2FuY2VsbGF0aW9uIGZvciBhIGxvbmcgdGltZSBpZiBhY3Rpdml0eSBkb2Vzbid0XG4gICAqICAgaGVhcnRiZWF0IG9yIGNob29zZXMgdG8gaWdub3JlIHRoZSBjYW5jZWxsYXRpb24gcmVxdWVzdC5cbiAgICogLSBgQUJBTkRPTmAgLSBEbyBub3QgcmVxdWVzdCBjYW5jZWxsYXRpb24gb2YgdGhlIGFjdGl2aXR5IGFuZCBpbW1lZGlhdGVseSByZXBvcnQgY2FuY2VsbGF0aW9uIHRvIHRoZSB3b3JrZmxvdy5cbiAgICovXG4gIGNhbmNlbGxhdGlvblR5cGU/OiBjb3Jlc2RrLndvcmtmbG93X2NvbW1hbmRzLkFjdGl2aXR5Q2FuY2VsbGF0aW9uVHlwZTtcbn1cbiIsImltcG9ydCB7IERlZmF1bHRGYWlsdXJlQ29udmVydGVyLCBGYWlsdXJlQ29udmVydGVyIH0gZnJvbSAnLi9mYWlsdXJlLWNvbnZlcnRlcic7XG5pbXBvcnQgeyBQYXlsb2FkQ29kZWMgfSBmcm9tICcuL3BheWxvYWQtY29kZWMnO1xuaW1wb3J0IHsgZGVmYXVsdFBheWxvYWRDb252ZXJ0ZXIsIFBheWxvYWRDb252ZXJ0ZXIgfSBmcm9tICcuL3BheWxvYWQtY29udmVydGVyJztcblxuLyoqXG4gKiBXaGVuIHlvdXIgZGF0YSAoYXJndW1lbnRzIGFuZCByZXR1cm4gdmFsdWVzKSBpcyBzZW50IG92ZXIgdGhlIHdpcmUgYW5kIHN0b3JlZCBieSBUZW1wb3JhbCBTZXJ2ZXIsIGl0IGlzIGVuY29kZWQgaW5cbiAqIGJpbmFyeSBpbiBhIHtAbGluayBQYXlsb2FkfSBQcm90b2J1ZiBtZXNzYWdlLlxuICpcbiAqIFRoZSBkZWZhdWx0IGBEYXRhQ29udmVydGVyYCBzdXBwb3J0cyBgdW5kZWZpbmVkYCwgYFVpbnQ4QXJyYXlgLCBhbmQgSlNPTiBzZXJpYWxpemFibGVzIChzbyBpZlxuICoge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL0pTT04vc3RyaW5naWZ5I2Rlc2NyaXB0aW9uIHwgYEpTT04uc3RyaW5naWZ5KHlvdXJBcmdPclJldHZhbClgfVxuICogd29ya3MsIHRoZSBkZWZhdWx0IGRhdGEgY29udmVydGVyIHdpbGwgd29yaykuIFByb3RvYnVmcyBhcmUgc3VwcG9ydGVkIHZpYVxuICoge0BsaW5rIGh0dHBzOi8vZG9jcy50ZW1wb3JhbC5pby90eXBlc2NyaXB0L2RhdGEtY29udmVydGVycyNwcm90b2J1ZnMgfCB0aGlzIEFQSX0uXG4gKlxuICogVXNlIGEgY3VzdG9tIGBEYXRhQ29udmVydGVyYCB0byBjb250cm9sIHRoZSBjb250ZW50cyBvZiB5b3VyIHtAbGluayBQYXlsb2FkfXMuIENvbW1vbiByZWFzb25zIGZvciB1c2luZyBhIGN1c3RvbVxuICogYERhdGFDb252ZXJ0ZXJgIGFyZTpcbiAqIC0gQ29udmVydGluZyB2YWx1ZXMgdGhhdCBhcmUgbm90IHN1cHBvcnRlZCBieSB0aGUgZGVmYXVsdCBgRGF0YUNvbnZlcnRlcmAgKGZvciBleGFtcGxlLCBgSlNPTi5zdHJpbmdpZnkoKWAgZG9lc24ndFxuICogICBoYW5kbGUgYEJpZ0ludGBzLCBzbyBpZiB5b3Ugd2FudCB0byByZXR1cm4gYHsgdG90YWw6IDEwMDBuIH1gIGZyb20gYSBXb3JrZmxvdywgU2lnbmFsLCBvciBBY3Rpdml0eSwgeW91IG5lZWQgeW91clxuICogICBvd24gYERhdGFDb252ZXJ0ZXJgKS5cbiAqIC0gRW5jcnlwdGluZyB2YWx1ZXMgdGhhdCBtYXkgY29udGFpbiBwcml2YXRlIGluZm9ybWF0aW9uIHRoYXQgeW91IGRvbid0IHdhbnQgc3RvcmVkIGluIHBsYWludGV4dCBpbiBUZW1wb3JhbCBTZXJ2ZXInc1xuICogICBkYXRhYmFzZS5cbiAqIC0gQ29tcHJlc3NpbmcgdmFsdWVzIHRvIHJlZHVjZSBkaXNrIG9yIG5ldHdvcmsgdXNhZ2UuXG4gKlxuICogVG8gdXNlIHlvdXIgY3VzdG9tIGBEYXRhQ29udmVydGVyYCwgcHJvdmlkZSBpdCB0byB0aGUge0BsaW5rIFdvcmtmbG93Q2xpZW50fSwge0BsaW5rIFdvcmtlcn0sIGFuZFxuICoge0BsaW5rIGJ1bmRsZVdvcmtmbG93Q29kZX0gKGlmIHlvdSB1c2UgaXQpOlxuICogLSBgbmV3IFdvcmtmbG93Q2xpZW50KHsgLi4uLCBkYXRhQ29udmVydGVyIH0pYFxuICogLSBgV29ya2VyLmNyZWF0ZSh7IC4uLiwgZGF0YUNvbnZlcnRlciB9KWBcbiAqIC0gYGJ1bmRsZVdvcmtmbG93Q29kZSh7IC4uLiwgcGF5bG9hZENvbnZlcnRlclBhdGggfSlgXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRGF0YUNvbnZlcnRlciB7XG4gIC8qKlxuICAgKiBQYXRoIG9mIGEgZmlsZSB0aGF0IGhhcyBhIGBwYXlsb2FkQ29udmVydGVyYCBuYW1lZCBleHBvcnQuXG4gICAqIGBwYXlsb2FkQ29udmVydGVyYCBzaG91bGQgYmUgYW4gb2JqZWN0IHRoYXQgaW1wbGVtZW50cyB7QGxpbmsgUGF5bG9hZENvbnZlcnRlcn0uXG4gICAqIElmIG5vIHBhdGggaXMgcHJvdmlkZWQsIHtAbGluayBkZWZhdWx0UGF5bG9hZENvbnZlcnRlcn0gaXMgdXNlZC5cbiAgICovXG4gIHBheWxvYWRDb252ZXJ0ZXJQYXRoPzogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBQYXRoIG9mIGEgZmlsZSB0aGF0IGhhcyBhIGBmYWlsdXJlQ29udmVydGVyYCBuYW1lZCBleHBvcnQuXG4gICAqIGBmYWlsdXJlQ29udmVydGVyYCBzaG91bGQgYmUgYW4gb2JqZWN0IHRoYXQgaW1wbGVtZW50cyB7QGxpbmsgRmFpbHVyZUNvbnZlcnRlcn0uXG4gICAqIElmIG5vIHBhdGggaXMgcHJvdmlkZWQsIHtAbGluayBkZWZhdWx0RmFpbHVyZUNvbnZlcnRlcn0gaXMgdXNlZC5cbiAgICovXG4gIGZhaWx1cmVDb252ZXJ0ZXJQYXRoPzogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBBbiBhcnJheSBvZiB7QGxpbmsgUGF5bG9hZENvZGVjfSBpbnN0YW5jZXMuXG4gICAqXG4gICAqIFBheWxvYWRzIGFyZSBlbmNvZGVkIGluIHRoZSBvcmRlciBvZiB0aGUgYXJyYXkgYW5kIGRlY29kZWQgaW4gdGhlIG9wcG9zaXRlIG9yZGVyLiBGb3IgZXhhbXBsZSwgaWYgeW91IGhhdmUgYVxuICAgKiBjb21wcmVzc2lvbiBjb2RlYyBhbmQgYW4gZW5jcnlwdGlvbiBjb2RlYywgdGhlbiB5b3Ugd2FudCBkYXRhIHRvIGJlIGVuY29kZWQgd2l0aCB0aGUgY29tcHJlc3Npb24gY29kZWMgZmlyc3QsIHNvXG4gICAqIHlvdSdkIGRvIGBwYXlsb2FkQ29kZWNzOiBbY29tcHJlc3Npb25Db2RlYywgZW5jcnlwdGlvbkNvZGVjXWAuXG4gICAqL1xuICBwYXlsb2FkQ29kZWNzPzogUGF5bG9hZENvZGVjW107XG59XG5cbi8qKlxuICogQSB7QGxpbmsgRGF0YUNvbnZlcnRlcn0gdGhhdCBoYXMgYmVlbiBsb2FkZWQgdmlhIHtAbGluayBsb2FkRGF0YUNvbnZlcnRlcn0uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTG9hZGVkRGF0YUNvbnZlcnRlciB7XG4gIHBheWxvYWRDb252ZXJ0ZXI6IFBheWxvYWRDb252ZXJ0ZXI7XG4gIGZhaWx1cmVDb252ZXJ0ZXI6IEZhaWx1cmVDb252ZXJ0ZXI7XG4gIHBheWxvYWRDb2RlY3M6IFBheWxvYWRDb2RlY1tdO1xufVxuXG4vKipcbiAqIFRoZSBkZWZhdWx0IHtAbGluayBGYWlsdXJlQ29udmVydGVyfSB1c2VkIGJ5IHRoZSBTREsuXG4gKlxuICogRXJyb3IgbWVzc2FnZXMgYW5kIHN0YWNrIHRyYWNlcyBhcmUgc2VyaXphbGl6ZWQgYXMgcGxhaW4gdGV4dC5cbiAqL1xuZXhwb3J0IGNvbnN0IGRlZmF1bHRGYWlsdXJlQ29udmVydGVyOiBGYWlsdXJlQ29udmVydGVyID0gbmV3IERlZmF1bHRGYWlsdXJlQ29udmVydGVyKCk7XG5cbi8qKlxuICogQSBcImxvYWRlZFwiIGRhdGEgY29udmVydGVyIHRoYXQgdXNlcyB0aGUgZGVmYXVsdCBzZXQgb2YgZmFpbHVyZSBhbmQgcGF5bG9hZCBjb252ZXJ0ZXJzLlxuICovXG5leHBvcnQgY29uc3QgZGVmYXVsdERhdGFDb252ZXJ0ZXI6IExvYWRlZERhdGFDb252ZXJ0ZXIgPSB7XG4gIHBheWxvYWRDb252ZXJ0ZXI6IGRlZmF1bHRQYXlsb2FkQ29udmVydGVyLFxuICBmYWlsdXJlQ29udmVydGVyOiBkZWZhdWx0RmFpbHVyZUNvbnZlcnRlcixcbiAgcGF5bG9hZENvZGVjczogW10sXG59O1xuIiwiaW1wb3J0IHtcbiAgQWN0aXZpdHlGYWlsdXJlLFxuICBBcHBsaWNhdGlvbkZhaWx1cmUsXG4gIENhbmNlbGxlZEZhaWx1cmUsXG4gIENoaWxkV29ya2Zsb3dGYWlsdXJlLFxuICBGQUlMVVJFX1NPVVJDRSxcbiAgUHJvdG9GYWlsdXJlLFxuICBSZXRyeVN0YXRlLFxuICBTZXJ2ZXJGYWlsdXJlLFxuICBUZW1wb3JhbEZhaWx1cmUsXG4gIFRlcm1pbmF0ZWRGYWlsdXJlLFxuICBUaW1lb3V0RmFpbHVyZSxcbiAgVGltZW91dFR5cGUsXG59IGZyb20gJy4uL2ZhaWx1cmUnO1xuaW1wb3J0IHsgaXNFcnJvciB9IGZyb20gJy4uL3R5cGUtaGVscGVycyc7XG5pbXBvcnQgeyBtc09wdGlvbmFsVG9UcyB9IGZyb20gJy4uL3RpbWUnO1xuaW1wb3J0IHsgYXJyYXlGcm9tUGF5bG9hZHMsIGZyb21QYXlsb2Fkc0F0SW5kZXgsIFBheWxvYWRDb252ZXJ0ZXIsIHRvUGF5bG9hZHMgfSBmcm9tICcuL3BheWxvYWQtY29udmVydGVyJztcblxuZnVuY3Rpb24gY29tYmluZVJlZ0V4cCguLi5yZWdleHBzOiBSZWdFeHBbXSk6IFJlZ0V4cCB7XG4gIHJldHVybiBuZXcgUmVnRXhwKHJlZ2V4cHMubWFwKCh4KSA9PiBgKD86JHt4LnNvdXJjZX0pYCkuam9pbignfCcpKTtcbn1cblxuLyoqXG4gKiBTdGFjayB0cmFjZXMgd2lsbCBiZSBjdXRvZmYgd2hlbiBvbiBvZiB0aGVzZSBwYXR0ZXJucyBpcyBtYXRjaGVkXG4gKi9cbmNvbnN0IENVVE9GRl9TVEFDS19QQVRURVJOUyA9IGNvbWJpbmVSZWdFeHAoXG4gIC8qKiBBY3Rpdml0eSBleGVjdXRpb24gKi9cbiAgL1xccythdCBBY3Rpdml0eVxcLmV4ZWN1dGUgXFwoLipbXFxcXC9dd29ya2VyW1xcXFwvXSg/OnNyY3xsaWIpW1xcXFwvXWFjdGl2aXR5XFwuW2p0XXM6XFxkKzpcXGQrXFwpLyxcbiAgLyoqIFdvcmtmbG93IGFjdGl2YXRpb24gKi9cbiAgL1xccythdCBBY3RpdmF0b3JcXC5cXFMrTmV4dEhhbmRsZXIgXFwoLipbXFxcXC9dd29ya2Zsb3dbXFxcXC9dKD86c3JjfGxpYilbXFxcXC9daW50ZXJuYWxzXFwuW2p0XXM6XFxkKzpcXGQrXFwpLyxcbiAgLyoqIFdvcmtmbG93IHJ1biBhbnl0aGluZyBpbiBjb250ZXh0ICovXG4gIC9cXHMrYXQgU2NyaXB0XFwucnVuSW5Db250ZXh0IFxcKCg/Om5vZGU6dm18dm1cXC5qcyk6XFxkKzpcXGQrXFwpL1xuKTtcblxuLyoqXG4gKiBBbnkgc3RhY2sgdHJhY2UgZnJhbWVzIHRoYXQgbWF0Y2ggYW55IG9mIHRob3NlIHdpbCBiZSBkb3BwZWQuXG4gKiBUaGUgXCJudWxsLlwiIHByZWZpeCBvbiBzb21lIGNhc2VzIGlzIHRvIGF2b2lkIGh0dHBzOi8vZ2l0aHViLmNvbS9ub2RlanMvbm9kZS9pc3N1ZXMvNDI0MTdcbiAqL1xuY29uc3QgRFJPUFBFRF9TVEFDS19GUkFNRVNfUEFUVEVSTlMgPSBjb21iaW5lUmVnRXhwKFxuICAvKiogSW50ZXJuYWwgZnVuY3Rpb25zIHVzZWQgdG8gcmVjdXJzaXZlbHkgY2hhaW4gaW50ZXJjZXB0b3JzICovXG4gIC9cXHMrYXQgKG51bGxcXC4pP25leHQgXFwoLipbXFxcXC9dY29tbW9uW1xcXFwvXSg/OnNyY3xsaWIpW1xcXFwvXWludGVyY2VwdG9yc1xcLltqdF1zOlxcZCs6XFxkK1xcKS8sXG4gIC8qKiBJbnRlcm5hbCBmdW5jdGlvbnMgdXNlZCB0byByZWN1cnNpdmVseSBjaGFpbiBpbnRlcmNlcHRvcnMgKi9cbiAgL1xccythdCAobnVsbFxcLik/ZXhlY3V0ZU5leHRIYW5kbGVyIFxcKC4qW1xcXFwvXXdvcmtlcltcXFxcL10oPzpzcmN8bGliKVtcXFxcL11hY3Rpdml0eVxcLltqdF1zOlxcZCs6XFxkK1xcKS9cbik7XG5cbi8qKlxuICogQ3V0cyBvdXQgdGhlIGZyYW1ld29yayBwYXJ0IG9mIGEgc3RhY2sgdHJhY2UsIGxlYXZpbmcgb25seSB1c2VyIGNvZGUgZW50cmllc1xuICovXG5leHBvcnQgZnVuY3Rpb24gY3V0b2ZmU3RhY2tUcmFjZShzdGFjaz86IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IGxpbmVzID0gKHN0YWNrID8/ICcnKS5zcGxpdCgvXFxyP1xcbi8pO1xuICBjb25zdCBhY2MgPSBBcnJheTxzdHJpbmc+KCk7XG4gIGZvciAoY29uc3QgbGluZSBvZiBsaW5lcykge1xuICAgIGlmIChDVVRPRkZfU1RBQ0tfUEFUVEVSTlMudGVzdChsaW5lKSkgYnJlYWs7XG4gICAgaWYgKCFEUk9QUEVEX1NUQUNLX0ZSQU1FU19QQVRURVJOUy50ZXN0KGxpbmUpKSBhY2MucHVzaChsaW5lKTtcbiAgfVxuICByZXR1cm4gYWNjLmpvaW4oJ1xcbicpO1xufVxuXG4vKipcbiAqIEEgYEZhaWx1cmVDb252ZXJ0ZXJgIGlzIHJlc3BvbnNpYmxlIGZvciBjb252ZXJ0aW5nIGZyb20gcHJvdG8gYEZhaWx1cmVgIGluc3RhbmNlcyB0byBKUyBgRXJyb3JzYCBhbmQgYmFjay5cbiAqXG4gKiBXZSByZWNvbW1lbmRlZCB1c2luZyB0aGUge0BsaW5rIERlZmF1bHRGYWlsdXJlQ29udmVydGVyfSBpbnN0ZWFkIG9mIGN1c3RvbWl6aW5nIHRoZSBkZWZhdWx0IGltcGxlbWVudGF0aW9uIGluIG9yZGVyXG4gKiB0byBtYWludGFpbiBjcm9zcy1sYW5ndWFnZSBGYWlsdXJlIHNlcmlhbGl6YXRpb24gY29tcGF0aWJpbGl0eS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBGYWlsdXJlQ29udmVydGVyIHtcbiAgLyoqXG4gICAqIENvbnZlcnRzIGEgY2F1Z2h0IGVycm9yIHRvIGEgRmFpbHVyZSBwcm90byBtZXNzYWdlLlxuICAgKi9cbiAgZXJyb3JUb0ZhaWx1cmUoZXJyOiB1bmtub3duLCBwYXlsb2FkQ29udmVydGVyOiBQYXlsb2FkQ29udmVydGVyKTogUHJvdG9GYWlsdXJlO1xuXG4gIC8qKlxuICAgKiBDb252ZXJ0cyBhIEZhaWx1cmUgcHJvdG8gbWVzc2FnZSB0byBhIEpTIEVycm9yIG9iamVjdC5cbiAgICpcbiAgICogVGhlIHJldHVybmVkIGVycm9yIG11c3QgYmUgYW4gaW5zdGFuY2Ugb2YgYFRlbXBvcmFsRmFpbHVyZWAuXG4gICAqL1xuICBmYWlsdXJlVG9FcnJvcihlcnI6IFByb3RvRmFpbHVyZSwgcGF5bG9hZENvbnZlcnRlcjogUGF5bG9hZENvbnZlcnRlcik6IFRlbXBvcmFsRmFpbHVyZTtcbn1cblxuLyoqXG4gKiBUaGUgXCJzaGFwZVwiIG9mIHRoZSBhdHRyaWJ1dGVzIHNldCBhcyB0aGUge0BsaW5rIFByb3RvRmFpbHVyZS5lbmNvZGVkQXR0cmlidXRlc30gcGF5bG9hZCBpbiBjYXNlXG4gKiB7QGxpbmsgRGVmYXVsdEVuY29kZWRGYWlsdXJlQXR0cmlidXRlcy5lbmNvZGVDb21tb25BdHRyaWJ1dGVzfSBpcyBzZXQgdG8gYHRydWVgLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIERlZmF1bHRFbmNvZGVkRmFpbHVyZUF0dHJpYnV0ZXMge1xuICBtZXNzYWdlOiBzdHJpbmc7XG4gIHN0YWNrX3RyYWNlOiBzdHJpbmc7XG59XG5cbi8qKlxuICogT3B0aW9ucyBmb3IgdGhlIHtAbGluayBEZWZhdWx0RmFpbHVyZUNvbnZlcnRlcn0gY29uc3RydWN0b3IuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRGVmYXVsdEZhaWx1cmVDb252ZXJ0ZXJPcHRpb25zIHtcbiAgLyoqXG4gICAqIFdoZXRoZXIgdG8gZW5jb2RlIGVycm9yIG1lc3NhZ2VzIGFuZCBzdGFjayB0cmFjZXMgKGZvciBlbmNyeXB0aW5nIHRoZXNlIGF0dHJpYnV0ZXMgdXNlIGEge0BsaW5rIFBheWxvYWRDb2RlY30pLlxuICAgKi9cbiAgZW5jb2RlQ29tbW9uQXR0cmlidXRlczogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBEZWZhdWx0LCBjcm9zcy1sYW5ndWFnZS1jb21wYXRpYmxlIEZhaWx1cmUgY29udmVydGVyLlxuICpcbiAqIEJ5IGRlZmF1bHQsIGl0IHdpbGwgbGVhdmUgZXJyb3IgbWVzc2FnZXMgYW5kIHN0YWNrIHRyYWNlcyBhcyBwbGFpbiB0ZXh0LiBJbiBvcmRlciB0byBlbmNyeXB0IHRoZW0sIHNldFxuICogYGVuY29kZUNvbW1vbkF0dHJpYnV0ZXNgIHRvIGB0cnVlYCBpbiB0aGUgY29uc3RydWN0b3Igb3B0aW9ucyBhbmQgdXNlIGEge0BsaW5rIFBheWxvYWRDb2RlY30gdGhhdCBjYW4gZW5jcnlwdCAvXG4gKiBkZWNyeXB0IFBheWxvYWRzIGluIHlvdXIge0BsaW5rIFdvcmtlck9wdGlvbnMuZGF0YUNvbnZlcnRlciB8IFdvcmtlcn0gYW5kXG4gKiB7QGxpbmsgQ2xpZW50T3B0aW9ucy5kYXRhQ29udmVydGVyIHwgQ2xpZW50IG9wdGlvbnN9LlxuICovXG5leHBvcnQgY2xhc3MgRGVmYXVsdEZhaWx1cmVDb252ZXJ0ZXIgaW1wbGVtZW50cyBGYWlsdXJlQ29udmVydGVyIHtcbiAgcHVibGljIHJlYWRvbmx5IG9wdGlvbnM6IERlZmF1bHRGYWlsdXJlQ29udmVydGVyT3B0aW9ucztcblxuICBjb25zdHJ1Y3RvcihvcHRpb25zPzogUGFydGlhbDxEZWZhdWx0RmFpbHVyZUNvbnZlcnRlck9wdGlvbnM+KSB7XG4gICAgY29uc3QgeyBlbmNvZGVDb21tb25BdHRyaWJ1dGVzIH0gPSBvcHRpb25zID8/IHt9O1xuICAgIHRoaXMub3B0aW9ucyA9IHtcbiAgICAgIGVuY29kZUNvbW1vbkF0dHJpYnV0ZXM6IGVuY29kZUNvbW1vbkF0dHJpYnV0ZXMgPz8gZmFsc2UsXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZXJ0cyBhIEZhaWx1cmUgcHJvdG8gbWVzc2FnZSB0byBhIEpTIEVycm9yIG9iamVjdC5cbiAgICpcbiAgICogRG9lcyBub3Qgc2V0IGNvbW1vbiBwcm9wZXJ0aWVzLCB0aGF0IGlzIGRvbmUgaW4ge0BsaW5rIGZhaWx1cmVUb0Vycm9yfS5cbiAgICovXG4gIGZhaWx1cmVUb0Vycm9ySW5uZXIoZmFpbHVyZTogUHJvdG9GYWlsdXJlLCBwYXlsb2FkQ29udmVydGVyOiBQYXlsb2FkQ29udmVydGVyKTogVGVtcG9yYWxGYWlsdXJlIHtcbiAgICBpZiAoZmFpbHVyZS5hcHBsaWNhdGlvbkZhaWx1cmVJbmZvKSB7XG4gICAgICByZXR1cm4gbmV3IEFwcGxpY2F0aW9uRmFpbHVyZShcbiAgICAgICAgZmFpbHVyZS5tZXNzYWdlID8/IHVuZGVmaW5lZCxcbiAgICAgICAgZmFpbHVyZS5hcHBsaWNhdGlvbkZhaWx1cmVJbmZvLnR5cGUsXG4gICAgICAgIEJvb2xlYW4oZmFpbHVyZS5hcHBsaWNhdGlvbkZhaWx1cmVJbmZvLm5vblJldHJ5YWJsZSksXG4gICAgICAgIGFycmF5RnJvbVBheWxvYWRzKHBheWxvYWRDb252ZXJ0ZXIsIGZhaWx1cmUuYXBwbGljYXRpb25GYWlsdXJlSW5mby5kZXRhaWxzPy5wYXlsb2FkcyksXG4gICAgICAgIHRoaXMub3B0aW9uYWxGYWlsdXJlVG9PcHRpb25hbEVycm9yKGZhaWx1cmUuY2F1c2UsIHBheWxvYWRDb252ZXJ0ZXIpXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAoZmFpbHVyZS5zZXJ2ZXJGYWlsdXJlSW5mbykge1xuICAgICAgcmV0dXJuIG5ldyBTZXJ2ZXJGYWlsdXJlKFxuICAgICAgICBmYWlsdXJlLm1lc3NhZ2UgPz8gdW5kZWZpbmVkLFxuICAgICAgICBCb29sZWFuKGZhaWx1cmUuc2VydmVyRmFpbHVyZUluZm8ubm9uUmV0cnlhYmxlKSxcbiAgICAgICAgdGhpcy5vcHRpb25hbEZhaWx1cmVUb09wdGlvbmFsRXJyb3IoZmFpbHVyZS5jYXVzZSwgcGF5bG9hZENvbnZlcnRlcilcbiAgICAgICk7XG4gICAgfVxuICAgIGlmIChmYWlsdXJlLnRpbWVvdXRGYWlsdXJlSW5mbykge1xuICAgICAgcmV0dXJuIG5ldyBUaW1lb3V0RmFpbHVyZShcbiAgICAgICAgZmFpbHVyZS5tZXNzYWdlID8/IHVuZGVmaW5lZCxcbiAgICAgICAgZnJvbVBheWxvYWRzQXRJbmRleChwYXlsb2FkQ29udmVydGVyLCAwLCBmYWlsdXJlLnRpbWVvdXRGYWlsdXJlSW5mby5sYXN0SGVhcnRiZWF0RGV0YWlscz8ucGF5bG9hZHMpLFxuICAgICAgICBmYWlsdXJlLnRpbWVvdXRGYWlsdXJlSW5mby50aW1lb3V0VHlwZSA/PyBUaW1lb3V0VHlwZS5USU1FT1VUX1RZUEVfVU5TUEVDSUZJRURcbiAgICAgICk7XG4gICAgfVxuICAgIGlmIChmYWlsdXJlLnRlcm1pbmF0ZWRGYWlsdXJlSW5mbykge1xuICAgICAgcmV0dXJuIG5ldyBUZXJtaW5hdGVkRmFpbHVyZShcbiAgICAgICAgZmFpbHVyZS5tZXNzYWdlID8/IHVuZGVmaW5lZCxcbiAgICAgICAgdGhpcy5vcHRpb25hbEZhaWx1cmVUb09wdGlvbmFsRXJyb3IoZmFpbHVyZS5jYXVzZSwgcGF5bG9hZENvbnZlcnRlcilcbiAgICAgICk7XG4gICAgfVxuICAgIGlmIChmYWlsdXJlLmNhbmNlbGVkRmFpbHVyZUluZm8pIHtcbiAgICAgIHJldHVybiBuZXcgQ2FuY2VsbGVkRmFpbHVyZShcbiAgICAgICAgZmFpbHVyZS5tZXNzYWdlID8/IHVuZGVmaW5lZCxcbiAgICAgICAgYXJyYXlGcm9tUGF5bG9hZHMocGF5bG9hZENvbnZlcnRlciwgZmFpbHVyZS5jYW5jZWxlZEZhaWx1cmVJbmZvLmRldGFpbHM/LnBheWxvYWRzKSxcbiAgICAgICAgdGhpcy5vcHRpb25hbEZhaWx1cmVUb09wdGlvbmFsRXJyb3IoZmFpbHVyZS5jYXVzZSwgcGF5bG9hZENvbnZlcnRlcilcbiAgICAgICk7XG4gICAgfVxuICAgIGlmIChmYWlsdXJlLnJlc2V0V29ya2Zsb3dGYWlsdXJlSW5mbykge1xuICAgICAgcmV0dXJuIG5ldyBBcHBsaWNhdGlvbkZhaWx1cmUoXG4gICAgICAgIGZhaWx1cmUubWVzc2FnZSA/PyB1bmRlZmluZWQsXG4gICAgICAgICdSZXNldFdvcmtmbG93JyxcbiAgICAgICAgZmFsc2UsXG4gICAgICAgIGFycmF5RnJvbVBheWxvYWRzKHBheWxvYWRDb252ZXJ0ZXIsIGZhaWx1cmUucmVzZXRXb3JrZmxvd0ZhaWx1cmVJbmZvLmxhc3RIZWFydGJlYXREZXRhaWxzPy5wYXlsb2FkcyksXG4gICAgICAgIHRoaXMub3B0aW9uYWxGYWlsdXJlVG9PcHRpb25hbEVycm9yKGZhaWx1cmUuY2F1c2UsIHBheWxvYWRDb252ZXJ0ZXIpXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAoZmFpbHVyZS5jaGlsZFdvcmtmbG93RXhlY3V0aW9uRmFpbHVyZUluZm8pIHtcbiAgICAgIGNvbnN0IHsgbmFtZXNwYWNlLCB3b3JrZmxvd1R5cGUsIHdvcmtmbG93RXhlY3V0aW9uLCByZXRyeVN0YXRlIH0gPSBmYWlsdXJlLmNoaWxkV29ya2Zsb3dFeGVjdXRpb25GYWlsdXJlSW5mbztcbiAgICAgIGlmICghKHdvcmtmbG93VHlwZT8ubmFtZSAmJiB3b3JrZmxvd0V4ZWN1dGlvbikpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignTWlzc2luZyBhdHRyaWJ1dGVzIG9uIGNoaWxkV29ya2Zsb3dFeGVjdXRpb25GYWlsdXJlSW5mbycpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5ldyBDaGlsZFdvcmtmbG93RmFpbHVyZShcbiAgICAgICAgbmFtZXNwYWNlID8/IHVuZGVmaW5lZCxcbiAgICAgICAgd29ya2Zsb3dFeGVjdXRpb24sXG4gICAgICAgIHdvcmtmbG93VHlwZS5uYW1lLFxuICAgICAgICByZXRyeVN0YXRlID8/IFJldHJ5U3RhdGUuUkVUUllfU1RBVEVfVU5TUEVDSUZJRUQsXG4gICAgICAgIHRoaXMub3B0aW9uYWxGYWlsdXJlVG9PcHRpb25hbEVycm9yKGZhaWx1cmUuY2F1c2UsIHBheWxvYWRDb252ZXJ0ZXIpXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAoZmFpbHVyZS5hY3Rpdml0eUZhaWx1cmVJbmZvKSB7XG4gICAgICBpZiAoIWZhaWx1cmUuYWN0aXZpdHlGYWlsdXJlSW5mby5hY3Rpdml0eVR5cGU/Lm5hbWUpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignTWlzc2luZyBhY3Rpdml0eVR5cGU/Lm5hbWUgb24gYWN0aXZpdHlGYWlsdXJlSW5mbycpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5ldyBBY3Rpdml0eUZhaWx1cmUoXG4gICAgICAgIGZhaWx1cmUubWVzc2FnZSA/PyB1bmRlZmluZWQsXG4gICAgICAgIGZhaWx1cmUuYWN0aXZpdHlGYWlsdXJlSW5mby5hY3Rpdml0eVR5cGUubmFtZSxcbiAgICAgICAgZmFpbHVyZS5hY3Rpdml0eUZhaWx1cmVJbmZvLmFjdGl2aXR5SWQgPz8gdW5kZWZpbmVkLFxuICAgICAgICBmYWlsdXJlLmFjdGl2aXR5RmFpbHVyZUluZm8ucmV0cnlTdGF0ZSA/PyBSZXRyeVN0YXRlLlJFVFJZX1NUQVRFX1VOU1BFQ0lGSUVELFxuICAgICAgICBmYWlsdXJlLmFjdGl2aXR5RmFpbHVyZUluZm8uaWRlbnRpdHkgPz8gdW5kZWZpbmVkLFxuICAgICAgICB0aGlzLm9wdGlvbmFsRmFpbHVyZVRvT3B0aW9uYWxFcnJvcihmYWlsdXJlLmNhdXNlLCBwYXlsb2FkQ29udmVydGVyKVxuICAgICAgKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBUZW1wb3JhbEZhaWx1cmUoXG4gICAgICBmYWlsdXJlLm1lc3NhZ2UgPz8gdW5kZWZpbmVkLFxuICAgICAgdGhpcy5vcHRpb25hbEZhaWx1cmVUb09wdGlvbmFsRXJyb3IoZmFpbHVyZS5jYXVzZSwgcGF5bG9hZENvbnZlcnRlcilcbiAgICApO1xuICB9XG5cbiAgZmFpbHVyZVRvRXJyb3IoZmFpbHVyZTogUHJvdG9GYWlsdXJlLCBwYXlsb2FkQ29udmVydGVyOiBQYXlsb2FkQ29udmVydGVyKTogVGVtcG9yYWxGYWlsdXJlIHtcbiAgICBpZiAoZmFpbHVyZS5lbmNvZGVkQXR0cmlidXRlcykge1xuICAgICAgY29uc3QgYXR0cnMgPSBwYXlsb2FkQ29udmVydGVyLmZyb21QYXlsb2FkPERlZmF1bHRFbmNvZGVkRmFpbHVyZUF0dHJpYnV0ZXM+KGZhaWx1cmUuZW5jb2RlZEF0dHJpYnV0ZXMpO1xuICAgICAgLy8gRG9uJ3QgYXBwbHkgZW5jb2RlZEF0dHJpYnV0ZXMgdW5sZXNzIHRoZXkgY29uZm9ybSB0byBhbiBleHBlY3RlZCBzY2hlbWFcbiAgICAgIGlmICh0eXBlb2YgYXR0cnMgPT09ICdvYmplY3QnICYmIGF0dHJzICE9PSBudWxsKSB7XG4gICAgICAgIGNvbnN0IHsgbWVzc2FnZSwgc3RhY2tfdHJhY2UgfSA9IGF0dHJzO1xuICAgICAgICAvLyBBdm9pZCBtdXRhdGluZyB0aGUgYXJndW1lbnRcbiAgICAgICAgZmFpbHVyZSA9IHsgLi4uZmFpbHVyZSB9O1xuICAgICAgICBpZiAodHlwZW9mIG1lc3NhZ2UgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgZmFpbHVyZS5tZXNzYWdlID0gbWVzc2FnZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIHN0YWNrX3RyYWNlID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIGZhaWx1cmUuc3RhY2tUcmFjZSA9IHN0YWNrX3RyYWNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0IGVyciA9IHRoaXMuZmFpbHVyZVRvRXJyb3JJbm5lcihmYWlsdXJlLCBwYXlsb2FkQ29udmVydGVyKTtcbiAgICBlcnIuc3RhY2sgPSBmYWlsdXJlLnN0YWNrVHJhY2UgPz8gJyc7XG4gICAgZXJyLmZhaWx1cmUgPSBmYWlsdXJlO1xuICAgIHJldHVybiBlcnI7XG4gIH1cblxuICBlcnJvclRvRmFpbHVyZShlcnI6IHVua25vd24sIHBheWxvYWRDb252ZXJ0ZXI6IFBheWxvYWRDb252ZXJ0ZXIpOiBQcm90b0ZhaWx1cmUge1xuICAgIGNvbnN0IGZhaWx1cmUgPSB0aGlzLmVycm9yVG9GYWlsdXJlSW5uZXIoZXJyLCBwYXlsb2FkQ29udmVydGVyKTtcbiAgICBpZiAodGhpcy5vcHRpb25zLmVuY29kZUNvbW1vbkF0dHJpYnV0ZXMpIHtcbiAgICAgIGNvbnN0IHsgbWVzc2FnZSwgc3RhY2tUcmFjZSB9ID0gZmFpbHVyZTtcbiAgICAgIGZhaWx1cmUubWVzc2FnZSA9ICdFbmNvZGVkIGZhaWx1cmUnO1xuICAgICAgZmFpbHVyZS5zdGFja1RyYWNlID0gJyc7XG4gICAgICBmYWlsdXJlLmVuY29kZWRBdHRyaWJ1dGVzID0gcGF5bG9hZENvbnZlcnRlci50b1BheWxvYWQoeyBtZXNzYWdlLCBzdGFja190cmFjZTogc3RhY2tUcmFjZSB9KTtcbiAgICB9XG4gICAgcmV0dXJuIGZhaWx1cmU7XG4gIH1cblxuICBlcnJvclRvRmFpbHVyZUlubmVyKGVycjogdW5rbm93biwgcGF5bG9hZENvbnZlcnRlcjogUGF5bG9hZENvbnZlcnRlcik6IFByb3RvRmFpbHVyZSB7XG4gICAgaWYgKGVyciBpbnN0YW5jZW9mIFRlbXBvcmFsRmFpbHVyZSkge1xuICAgICAgaWYgKGVyci5mYWlsdXJlKSByZXR1cm4gZXJyLmZhaWx1cmU7XG4gICAgICBjb25zdCBiYXNlID0ge1xuICAgICAgICBtZXNzYWdlOiBlcnIubWVzc2FnZSxcbiAgICAgICAgc3RhY2tUcmFjZTogY3V0b2ZmU3RhY2tUcmFjZShlcnIuc3RhY2spLFxuICAgICAgICBjYXVzZTogdGhpcy5vcHRpb25hbEVycm9yVG9PcHRpb25hbEZhaWx1cmUoZXJyLmNhdXNlLCBwYXlsb2FkQ29udmVydGVyKSxcbiAgICAgICAgc291cmNlOiBGQUlMVVJFX1NPVVJDRSxcbiAgICAgIH07XG5cbiAgICAgIGlmIChlcnIgaW5zdGFuY2VvZiBBY3Rpdml0eUZhaWx1cmUpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAuLi5iYXNlLFxuICAgICAgICAgIGFjdGl2aXR5RmFpbHVyZUluZm86IHtcbiAgICAgICAgICAgIC4uLmVycixcbiAgICAgICAgICAgIGFjdGl2aXR5VHlwZTogeyBuYW1lOiBlcnIuYWN0aXZpdHlUeXBlIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIGlmIChlcnIgaW5zdGFuY2VvZiBDaGlsZFdvcmtmbG93RmFpbHVyZSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIC4uLmJhc2UsXG4gICAgICAgICAgY2hpbGRXb3JrZmxvd0V4ZWN1dGlvbkZhaWx1cmVJbmZvOiB7XG4gICAgICAgICAgICAuLi5lcnIsXG4gICAgICAgICAgICB3b3JrZmxvd0V4ZWN1dGlvbjogZXJyLmV4ZWN1dGlvbixcbiAgICAgICAgICAgIHdvcmtmbG93VHlwZTogeyBuYW1lOiBlcnIud29ya2Zsb3dUeXBlIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIGlmIChlcnIgaW5zdGFuY2VvZiBBcHBsaWNhdGlvbkZhaWx1cmUpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAuLi5iYXNlLFxuICAgICAgICAgIGFwcGxpY2F0aW9uRmFpbHVyZUluZm86IHtcbiAgICAgICAgICAgIHR5cGU6IGVyci50eXBlLFxuICAgICAgICAgICAgbm9uUmV0cnlhYmxlOiBlcnIubm9uUmV0cnlhYmxlLFxuICAgICAgICAgICAgZGV0YWlsczpcbiAgICAgICAgICAgICAgZXJyLmRldGFpbHMgJiYgZXJyLmRldGFpbHMubGVuZ3RoXG4gICAgICAgICAgICAgICAgPyB7IHBheWxvYWRzOiB0b1BheWxvYWRzKHBheWxvYWRDb252ZXJ0ZXIsIC4uLmVyci5kZXRhaWxzKSB9XG4gICAgICAgICAgICAgICAgOiB1bmRlZmluZWQsXG4gICAgICAgICAgICBuZXh0UmV0cnlEZWxheTogbXNPcHRpb25hbFRvVHMoZXJyLm5leHRSZXRyeURlbGF5KSxcbiAgICAgICAgICB9LFxuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgaWYgKGVyciBpbnN0YW5jZW9mIENhbmNlbGxlZEZhaWx1cmUpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAuLi5iYXNlLFxuICAgICAgICAgIGNhbmNlbGVkRmFpbHVyZUluZm86IHtcbiAgICAgICAgICAgIGRldGFpbHM6XG4gICAgICAgICAgICAgIGVyci5kZXRhaWxzICYmIGVyci5kZXRhaWxzLmxlbmd0aFxuICAgICAgICAgICAgICAgID8geyBwYXlsb2FkczogdG9QYXlsb2FkcyhwYXlsb2FkQ29udmVydGVyLCAuLi5lcnIuZGV0YWlscykgfVxuICAgICAgICAgICAgICAgIDogdW5kZWZpbmVkLFxuICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICBpZiAoZXJyIGluc3RhbmNlb2YgVGltZW91dEZhaWx1cmUpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAuLi5iYXNlLFxuICAgICAgICAgIHRpbWVvdXRGYWlsdXJlSW5mbzoge1xuICAgICAgICAgICAgdGltZW91dFR5cGU6IGVyci50aW1lb3V0VHlwZSxcbiAgICAgICAgICAgIGxhc3RIZWFydGJlYXREZXRhaWxzOiBlcnIubGFzdEhlYXJ0YmVhdERldGFpbHNcbiAgICAgICAgICAgICAgPyB7IHBheWxvYWRzOiB0b1BheWxvYWRzKHBheWxvYWRDb252ZXJ0ZXIsIGVyci5sYXN0SGVhcnRiZWF0RGV0YWlscykgfVxuICAgICAgICAgICAgICA6IHVuZGVmaW5lZCxcbiAgICAgICAgICB9LFxuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgaWYgKGVyciBpbnN0YW5jZW9mIFNlcnZlckZhaWx1cmUpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAuLi5iYXNlLFxuICAgICAgICAgIHNlcnZlckZhaWx1cmVJbmZvOiB7IG5vblJldHJ5YWJsZTogZXJyLm5vblJldHJ5YWJsZSB9LFxuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgaWYgKGVyciBpbnN0YW5jZW9mIFRlcm1pbmF0ZWRGYWlsdXJlKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgLi4uYmFzZSxcbiAgICAgICAgICB0ZXJtaW5hdGVkRmFpbHVyZUluZm86IHt9LFxuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgLy8gSnVzdCBhIFRlbXBvcmFsRmFpbHVyZVxuICAgICAgcmV0dXJuIGJhc2U7XG4gICAgfVxuXG4gICAgY29uc3QgYmFzZSA9IHtcbiAgICAgIHNvdXJjZTogRkFJTFVSRV9TT1VSQ0UsXG4gICAgfTtcblxuICAgIGlmIChpc0Vycm9yKGVycikpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIC4uLmJhc2UsXG4gICAgICAgIG1lc3NhZ2U6IFN0cmluZyhlcnIubWVzc2FnZSkgPz8gJycsXG4gICAgICAgIHN0YWNrVHJhY2U6IGN1dG9mZlN0YWNrVHJhY2UoZXJyLnN0YWNrKSxcbiAgICAgICAgY2F1c2U6IHRoaXMub3B0aW9uYWxFcnJvclRvT3B0aW9uYWxGYWlsdXJlKChlcnIgYXMgYW55KS5jYXVzZSwgcGF5bG9hZENvbnZlcnRlciksXG4gICAgICB9O1xuICAgIH1cblxuICAgIGNvbnN0IHJlY29tbWVuZGF0aW9uID0gYCBbQSBub24tRXJyb3IgdmFsdWUgd2FzIHRocm93biBmcm9tIHlvdXIgY29kZS4gV2UgcmVjb21tZW5kIHRocm93aW5nIEVycm9yIG9iamVjdHMgc28gdGhhdCB3ZSBjYW4gcHJvdmlkZSBhIHN0YWNrIHRyYWNlXWA7XG5cbiAgICBpZiAodHlwZW9mIGVyciA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHJldHVybiB7IC4uLmJhc2UsIG1lc3NhZ2U6IGVyciArIHJlY29tbWVuZGF0aW9uIH07XG4gICAgfVxuICAgIGlmICh0eXBlb2YgZXJyID09PSAnb2JqZWN0Jykge1xuICAgICAgbGV0IG1lc3NhZ2UgPSAnJztcbiAgICAgIHRyeSB7XG4gICAgICAgIG1lc3NhZ2UgPSBKU09OLnN0cmluZ2lmeShlcnIpO1xuICAgICAgfSBjYXRjaCAoX2Vycikge1xuICAgICAgICBtZXNzYWdlID0gU3RyaW5nKGVycik7XG4gICAgICB9XG4gICAgICByZXR1cm4geyAuLi5iYXNlLCBtZXNzYWdlOiBtZXNzYWdlICsgcmVjb21tZW5kYXRpb24gfTtcbiAgICB9XG5cbiAgICByZXR1cm4geyAuLi5iYXNlLCBtZXNzYWdlOiBTdHJpbmcoZXJyKSArIHJlY29tbWVuZGF0aW9uIH07XG4gIH1cblxuICAvKipcbiAgICogQ29udmVydHMgYSBGYWlsdXJlIHByb3RvIG1lc3NhZ2UgdG8gYSBKUyBFcnJvciBvYmplY3QgaWYgZGVmaW5lZCBvciByZXR1cm5zIHVuZGVmaW5lZC5cbiAgICovXG4gIG9wdGlvbmFsRmFpbHVyZVRvT3B0aW9uYWxFcnJvcihcbiAgICBmYWlsdXJlOiBQcm90b0ZhaWx1cmUgfCB1bmRlZmluZWQgfCBudWxsLFxuICAgIHBheWxvYWRDb252ZXJ0ZXI6IFBheWxvYWRDb252ZXJ0ZXJcbiAgKTogVGVtcG9yYWxGYWlsdXJlIHwgdW5kZWZpbmVkIHtcbiAgICByZXR1cm4gZmFpbHVyZSA/IHRoaXMuZmFpbHVyZVRvRXJyb3IoZmFpbHVyZSwgcGF5bG9hZENvbnZlcnRlcikgOiB1bmRlZmluZWQ7XG4gIH1cblxuICAvKipcbiAgICogQ29udmVydHMgYW4gZXJyb3IgdG8gYSBGYWlsdXJlIHByb3RvIG1lc3NhZ2UgaWYgZGVmaW5lZCBvciByZXR1cm5zIHVuZGVmaW5lZFxuICAgKi9cbiAgb3B0aW9uYWxFcnJvclRvT3B0aW9uYWxGYWlsdXJlKGVycjogdW5rbm93biwgcGF5bG9hZENvbnZlcnRlcjogUGF5bG9hZENvbnZlcnRlcik6IFByb3RvRmFpbHVyZSB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIGVyciA/IHRoaXMuZXJyb3JUb0ZhaWx1cmUoZXJyLCBwYXlsb2FkQ29udmVydGVyKSA6IHVuZGVmaW5lZDtcbiAgfVxufVxuIiwiaW1wb3J0IHsgUGF5bG9hZCB9IGZyb20gJy4uL2ludGVyZmFjZXMnO1xuXG4vKipcbiAqIGBQYXlsb2FkQ29kZWNgIGlzIGFuIG9wdGlvbmFsIHN0ZXAgdGhhdCBoYXBwZW5zIGJldHdlZW4gdGhlIHdpcmUgYW5kIHRoZSB7QGxpbmsgUGF5bG9hZENvbnZlcnRlcn06XG4gKlxuICogVGVtcG9yYWwgU2VydmVyIDwtLT4gV2lyZSA8LS0+IGBQYXlsb2FkQ29kZWNgIDwtLT4gYFBheWxvYWRDb252ZXJ0ZXJgIDwtLT4gVXNlciBjb2RlXG4gKlxuICogSW1wbGVtZW50IHRoaXMgdG8gdHJhbnNmb3JtIGFuIGFycmF5IG9mIHtAbGluayBQYXlsb2FkfXMgdG8vZnJvbSB0aGUgZm9ybWF0IHNlbnQgb3ZlciB0aGUgd2lyZSBhbmQgc3RvcmVkIGJ5IFRlbXBvcmFsIFNlcnZlci5cbiAqIENvbW1vbiB0cmFuc2Zvcm1hdGlvbnMgYXJlIGVuY3J5cHRpb24gYW5kIGNvbXByZXNzaW9uLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFBheWxvYWRDb2RlYyB7XG4gIC8qKlxuICAgKiBFbmNvZGUgYW4gYXJyYXkgb2Yge0BsaW5rIFBheWxvYWR9cyBmb3Igc2VuZGluZyBvdmVyIHRoZSB3aXJlLlxuICAgKiBAcGFyYW0gcGF5bG9hZHMgTWF5IGhhdmUgbGVuZ3RoIDAuXG4gICAqL1xuICBlbmNvZGUocGF5bG9hZHM6IFBheWxvYWRbXSk6IFByb21pc2U8UGF5bG9hZFtdPjtcblxuICAvKipcbiAgICogRGVjb2RlIGFuIGFycmF5IG9mIHtAbGluayBQYXlsb2FkfXMgcmVjZWl2ZWQgZnJvbSB0aGUgd2lyZS5cbiAgICovXG4gIGRlY29kZShwYXlsb2FkczogUGF5bG9hZFtdKTogUHJvbWlzZTxQYXlsb2FkW10+O1xufVxuIiwiaW1wb3J0IHsgZGVjb2RlLCBlbmNvZGUgfSBmcm9tICcuLi9lbmNvZGluZyc7XG5pbXBvcnQgeyBQYXlsb2FkQ29udmVydGVyRXJyb3IsIFZhbHVlRXJyb3IgfSBmcm9tICcuLi9lcnJvcnMnO1xuaW1wb3J0IHsgUGF5bG9hZCB9IGZyb20gJy4uL2ludGVyZmFjZXMnO1xuaW1wb3J0IHsgZW5jb2RpbmdLZXlzLCBlbmNvZGluZ1R5cGVzLCBNRVRBREFUQV9FTkNPRElOR19LRVkgfSBmcm9tICcuL3R5cGVzJztcblxuLyoqXG4gKiBVc2VkIGJ5IHRoZSBmcmFtZXdvcmsgdG8gc2VyaWFsaXplL2Rlc2VyaWFsaXplIGRhdGEgbGlrZSBwYXJhbWV0ZXJzIGFuZCByZXR1cm4gdmFsdWVzLlxuICpcbiAqIFRoaXMgaXMgY2FsbGVkIGluc2lkZSB0aGUge0BsaW5rIGh0dHBzOi8vZG9jcy50ZW1wb3JhbC5pby90eXBlc2NyaXB0L2RldGVybWluaXNtIHwgV29ya2Zsb3cgaXNvbGF0ZX0uXG4gKiBUbyB3cml0ZSBhc3luYyBjb2RlIG9yIHVzZSBOb2RlIEFQSXMgKG9yIHVzZSBwYWNrYWdlcyB0aGF0IHVzZSBOb2RlIEFQSXMpLCB1c2UgYSB7QGxpbmsgUGF5bG9hZENvZGVjfS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBQYXlsb2FkQ29udmVydGVyIHtcbiAgLyoqXG4gICAqIENvbnZlcnRzIGEgdmFsdWUgdG8gYSB7QGxpbmsgUGF5bG9hZH0uXG4gICAqXG4gICAqIEBwYXJhbSB2YWx1ZSBUaGUgdmFsdWUgdG8gY29udmVydC4gRXhhbXBsZSB2YWx1ZXMgaW5jbHVkZSB0aGUgV29ya2Zsb3cgYXJncyBzZW50IGZyb20gdGhlIENsaWVudCBhbmQgdGhlIHZhbHVlcyByZXR1cm5lZCBieSBhIFdvcmtmbG93IG9yIEFjdGl2aXR5LlxuICAgKlxuICAgKiBAcmV0dXJucyBUaGUge0BsaW5rIFBheWxvYWR9LlxuICAgKlxuICAgKiBTaG91bGQgdGhyb3cge0BsaW5rIFZhbHVlRXJyb3J9IGlmIHVuYWJsZSB0byBjb252ZXJ0LlxuICAgKi9cbiAgdG9QYXlsb2FkPFQ+KHZhbHVlOiBUKTogUGF5bG9hZDtcblxuICAvKipcbiAgICogQ29udmVydHMgYSB7QGxpbmsgUGF5bG9hZH0gYmFjayB0byBhIHZhbHVlLlxuICAgKi9cbiAgZnJvbVBheWxvYWQ8VD4ocGF5bG9hZDogUGF5bG9hZCk6IFQ7XG59XG5cbi8qKlxuICogSW1wbGVtZW50cyBjb252ZXJzaW9uIG9mIGEgbGlzdCBvZiB2YWx1ZXMuXG4gKlxuICogQHBhcmFtIGNvbnZlcnRlclxuICogQHBhcmFtIHZhbHVlcyBKUyB2YWx1ZXMgdG8gY29udmVydCB0byBQYXlsb2Fkc1xuICogQHJldHVybiBsaXN0IG9mIHtAbGluayBQYXlsb2FkfXNcbiAqIEB0aHJvd3Mge0BsaW5rIFZhbHVlRXJyb3J9IGlmIGNvbnZlcnNpb24gb2YgdGhlIHZhbHVlIHBhc3NlZCBhcyBwYXJhbWV0ZXIgZmFpbGVkIGZvciBhbnlcbiAqICAgICByZWFzb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0b1BheWxvYWRzKGNvbnZlcnRlcjogUGF5bG9hZENvbnZlcnRlciwgLi4udmFsdWVzOiB1bmtub3duW10pOiBQYXlsb2FkW10gfCB1bmRlZmluZWQge1xuICBpZiAodmFsdWVzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cblxuICByZXR1cm4gdmFsdWVzLm1hcCgodmFsdWUpID0+IGNvbnZlcnRlci50b1BheWxvYWQodmFsdWUpKTtcbn1cblxuLyoqXG4gKiBSdW4ge0BsaW5rIFBheWxvYWRDb252ZXJ0ZXIudG9QYXlsb2FkfSBvbiBlYWNoIHZhbHVlIGluIHRoZSBtYXAuXG4gKlxuICogQHRocm93cyB7QGxpbmsgVmFsdWVFcnJvcn0gaWYgY29udmVyc2lvbiBvZiBhbnkgdmFsdWUgaW4gdGhlIG1hcCBmYWlsc1xuICovXG5leHBvcnQgZnVuY3Rpb24gbWFwVG9QYXlsb2FkczxLIGV4dGVuZHMgc3RyaW5nPihjb252ZXJ0ZXI6IFBheWxvYWRDb252ZXJ0ZXIsIG1hcDogUmVjb3JkPEssIGFueT4pOiBSZWNvcmQ8SywgUGF5bG9hZD4ge1xuICByZXR1cm4gT2JqZWN0LmZyb21FbnRyaWVzKFxuICAgIE9iamVjdC5lbnRyaWVzKG1hcCkubWFwKChbaywgdl0pOiBbSywgUGF5bG9hZF0gPT4gW2sgYXMgSywgY29udmVydGVyLnRvUGF5bG9hZCh2KV0pXG4gICkgYXMgUmVjb3JkPEssIFBheWxvYWQ+O1xufVxuXG4vKipcbiAqIEltcGxlbWVudHMgY29udmVyc2lvbiBvZiBhbiBhcnJheSBvZiB2YWx1ZXMgb2YgZGlmZmVyZW50IHR5cGVzLiBVc2VmdWwgZm9yIGRlc2VyaWFsaXppbmdcbiAqIGFyZ3VtZW50cyBvZiBmdW5jdGlvbiBpbnZvY2F0aW9ucy5cbiAqXG4gKiBAcGFyYW0gY29udmVydGVyXG4gKiBAcGFyYW0gaW5kZXggaW5kZXggb2YgdGhlIHZhbHVlIGluIHRoZSBwYXlsb2Fkc1xuICogQHBhcmFtIHBheWxvYWRzIHNlcmlhbGl6ZWQgdmFsdWUgdG8gY29udmVydCB0byBKUyB2YWx1ZXMuXG4gKiBAcmV0dXJuIGNvbnZlcnRlZCBKUyB2YWx1ZVxuICogQHRocm93cyB7QGxpbmsgUGF5bG9hZENvbnZlcnRlckVycm9yfSBpZiBjb252ZXJzaW9uIG9mIHRoZSBkYXRhIHBhc3NlZCBhcyBwYXJhbWV0ZXIgZmFpbGVkIGZvciBhbnlcbiAqICAgICByZWFzb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmcm9tUGF5bG9hZHNBdEluZGV4PFQ+KGNvbnZlcnRlcjogUGF5bG9hZENvbnZlcnRlciwgaW5kZXg6IG51bWJlciwgcGF5bG9hZHM/OiBQYXlsb2FkW10gfCBudWxsKTogVCB7XG4gIC8vIFRvIG1ha2UgYWRkaW5nIGFyZ3VtZW50cyBhIGJhY2t3YXJkcyBjb21wYXRpYmxlIGNoYW5nZVxuICBpZiAocGF5bG9hZHMgPT09IHVuZGVmaW5lZCB8fCBwYXlsb2FkcyA9PT0gbnVsbCB8fCBpbmRleCA+PSBwYXlsb2Fkcy5sZW5ndGgpIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkIGFzIGFueTtcbiAgfVxuICByZXR1cm4gY29udmVydGVyLmZyb21QYXlsb2FkKHBheWxvYWRzW2luZGV4XSk7XG59XG5cbi8qKlxuICogUnVuIHtAbGluayBQYXlsb2FkQ29udmVydGVyLmZyb21QYXlsb2FkfSBvbiBlYWNoIHZhbHVlIGluIHRoZSBhcnJheS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFycmF5RnJvbVBheWxvYWRzKGNvbnZlcnRlcjogUGF5bG9hZENvbnZlcnRlciwgcGF5bG9hZHM/OiBQYXlsb2FkW10gfCBudWxsKTogdW5rbm93bltdIHtcbiAgaWYgKCFwYXlsb2Fkcykge1xuICAgIHJldHVybiBbXTtcbiAgfVxuICByZXR1cm4gcGF5bG9hZHMubWFwKChwYXlsb2FkOiBQYXlsb2FkKSA9PiBjb252ZXJ0ZXIuZnJvbVBheWxvYWQocGF5bG9hZCkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFwRnJvbVBheWxvYWRzPEsgZXh0ZW5kcyBzdHJpbmc+KFxuICBjb252ZXJ0ZXI6IFBheWxvYWRDb252ZXJ0ZXIsXG4gIG1hcD86IFJlY29yZDxLLCBQYXlsb2FkPiB8IG51bGwgfCB1bmRlZmluZWRcbik6IFJlY29yZDxLLCB1bmtub3duPiB8IHVuZGVmaW5lZCB7XG4gIGlmIChtYXAgPT0gbnVsbCkgcmV0dXJuIHVuZGVmaW5lZDtcbiAgcmV0dXJuIE9iamVjdC5mcm9tRW50cmllcyhcbiAgICBPYmplY3QuZW50cmllcyhtYXApLm1hcCgoW2ssIHBheWxvYWRdKTogW0ssIHVua25vd25dID0+IHtcbiAgICAgIGNvbnN0IHZhbHVlID0gY29udmVydGVyLmZyb21QYXlsb2FkKHBheWxvYWQgYXMgUGF5bG9hZCk7XG4gICAgICByZXR1cm4gW2sgYXMgSywgdmFsdWVdO1xuICAgIH0pXG4gICkgYXMgUmVjb3JkPEssIHVua25vd24+O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFBheWxvYWRDb252ZXJ0ZXJXaXRoRW5jb2Rpbmcge1xuICAvKipcbiAgICogQ29udmVydHMgYSB2YWx1ZSB0byBhIHtAbGluayBQYXlsb2FkfS5cbiAgICpcbiAgICogQHBhcmFtIHZhbHVlIFRoZSB2YWx1ZSB0byBjb252ZXJ0LiBFeGFtcGxlIHZhbHVlcyBpbmNsdWRlIHRoZSBXb3JrZmxvdyBhcmdzIHNlbnQgZnJvbSB0aGUgQ2xpZW50IGFuZCB0aGUgdmFsdWVzIHJldHVybmVkIGJ5IGEgV29ya2Zsb3cgb3IgQWN0aXZpdHkuXG4gICAqIEByZXR1cm5zIFRoZSB7QGxpbmsgUGF5bG9hZH0sIG9yIGB1bmRlZmluZWRgIGlmIHVuYWJsZSB0byBjb252ZXJ0LlxuICAgKi9cbiAgdG9QYXlsb2FkPFQ+KHZhbHVlOiBUKTogUGF5bG9hZCB8IHVuZGVmaW5lZDtcblxuICAvKipcbiAgICogQ29udmVydHMgYSB7QGxpbmsgUGF5bG9hZH0gYmFjayB0byBhIHZhbHVlLlxuICAgKi9cbiAgZnJvbVBheWxvYWQ8VD4ocGF5bG9hZDogUGF5bG9hZCk6IFQ7XG5cbiAgcmVhZG9ubHkgZW5jb2RpbmdUeXBlOiBzdHJpbmc7XG59XG5cbi8qKlxuICogVHJpZXMgdG8gY29udmVydCB2YWx1ZXMgdG8ge0BsaW5rIFBheWxvYWR9cyB1c2luZyB0aGUge0BsaW5rIFBheWxvYWRDb252ZXJ0ZXJXaXRoRW5jb2Rpbmd9cyBwcm92aWRlZCB0byB0aGUgY29uc3RydWN0b3IsIGluIHRoZSBvcmRlciBwcm92aWRlZC5cbiAqXG4gKiBDb252ZXJ0cyBQYXlsb2FkcyB0byB2YWx1ZXMgYmFzZWQgb24gdGhlIGBQYXlsb2FkLm1ldGFkYXRhLmVuY29kaW5nYCBmaWVsZCwgd2hpY2ggbWF0Y2hlcyB0aGUge0BsaW5rIFBheWxvYWRDb252ZXJ0ZXJXaXRoRW5jb2RpbmcuZW5jb2RpbmdUeXBlfVxuICogb2YgdGhlIGNvbnZlcnRlciB0aGF0IGNyZWF0ZWQgdGhlIFBheWxvYWQuXG4gKi9cbmV4cG9ydCBjbGFzcyBDb21wb3NpdGVQYXlsb2FkQ29udmVydGVyIGltcGxlbWVudHMgUGF5bG9hZENvbnZlcnRlciB7XG4gIHJlYWRvbmx5IGNvbnZlcnRlcnM6IFBheWxvYWRDb252ZXJ0ZXJXaXRoRW5jb2RpbmdbXTtcbiAgcmVhZG9ubHkgY29udmVydGVyQnlFbmNvZGluZzogTWFwPHN0cmluZywgUGF5bG9hZENvbnZlcnRlcldpdGhFbmNvZGluZz4gPSBuZXcgTWFwKCk7XG5cbiAgY29uc3RydWN0b3IoLi4uY29udmVydGVyczogUGF5bG9hZENvbnZlcnRlcldpdGhFbmNvZGluZ1tdKSB7XG4gICAgaWYgKGNvbnZlcnRlcnMubGVuZ3RoID09PSAwKSB7XG4gICAgICB0aHJvdyBuZXcgUGF5bG9hZENvbnZlcnRlckVycm9yKCdNdXN0IHByb3ZpZGUgYXQgbGVhc3Qgb25lIFBheWxvYWRDb252ZXJ0ZXJXaXRoRW5jb2RpbmcnKTtcbiAgICB9XG5cbiAgICB0aGlzLmNvbnZlcnRlcnMgPSBjb252ZXJ0ZXJzO1xuICAgIGZvciAoY29uc3QgY29udmVydGVyIG9mIGNvbnZlcnRlcnMpIHtcbiAgICAgIHRoaXMuY29udmVydGVyQnlFbmNvZGluZy5zZXQoY29udmVydGVyLmVuY29kaW5nVHlwZSwgY29udmVydGVyKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVHJpZXMgdG8gcnVuIGAudG9QYXlsb2FkKHZhbHVlKWAgb24gZWFjaCBjb252ZXJ0ZXIgaW4gdGhlIG9yZGVyIHByb3ZpZGVkIGF0IGNvbnN0cnVjdGlvbi5cbiAgICogUmV0dXJucyB0aGUgZmlyc3Qgc3VjY2Vzc2Z1bCByZXN1bHQsIHRocm93cyB7QGxpbmsgVmFsdWVFcnJvcn0gaWYgdGhlcmUgaXMgbm8gY29udmVydGVyIHRoYXQgY2FuIGhhbmRsZSB0aGUgdmFsdWUuXG4gICAqL1xuICBwdWJsaWMgdG9QYXlsb2FkPFQ+KHZhbHVlOiBUKTogUGF5bG9hZCB7XG4gICAgZm9yIChjb25zdCBjb252ZXJ0ZXIgb2YgdGhpcy5jb252ZXJ0ZXJzKSB7XG4gICAgICBjb25zdCByZXN1bHQgPSBjb252ZXJ0ZXIudG9QYXlsb2FkKHZhbHVlKTtcbiAgICAgIGlmIChyZXN1bHQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfVxuICAgIH1cblxuICAgIHRocm93IG5ldyBWYWx1ZUVycm9yKGBVbmFibGUgdG8gY29udmVydCAke3ZhbHVlfSB0byBwYXlsb2FkYCk7XG4gIH1cblxuICAvKipcbiAgICogUnVuIHtAbGluayBQYXlsb2FkQ29udmVydGVyV2l0aEVuY29kaW5nLmZyb21QYXlsb2FkfSBiYXNlZCBvbiB0aGUgYGVuY29kaW5nYCBtZXRhZGF0YSBvZiB0aGUge0BsaW5rIFBheWxvYWR9LlxuICAgKi9cbiAgcHVibGljIGZyb21QYXlsb2FkPFQ+KHBheWxvYWQ6IFBheWxvYWQpOiBUIHtcbiAgICBpZiAocGF5bG9hZC5tZXRhZGF0YSA9PT0gdW5kZWZpbmVkIHx8IHBheWxvYWQubWV0YWRhdGEgPT09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBWYWx1ZUVycm9yKCdNaXNzaW5nIHBheWxvYWQgbWV0YWRhdGEnKTtcbiAgICB9XG4gICAgY29uc3QgZW5jb2RpbmcgPSBkZWNvZGUocGF5bG9hZC5tZXRhZGF0YVtNRVRBREFUQV9FTkNPRElOR19LRVldKTtcbiAgICBjb25zdCBjb252ZXJ0ZXIgPSB0aGlzLmNvbnZlcnRlckJ5RW5jb2RpbmcuZ2V0KGVuY29kaW5nKTtcbiAgICBpZiAoY29udmVydGVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBWYWx1ZUVycm9yKGBVbmtub3duIGVuY29kaW5nOiAke2VuY29kaW5nfWApO1xuICAgIH1cbiAgICByZXR1cm4gY29udmVydGVyLmZyb21QYXlsb2FkKHBheWxvYWQpO1xuICB9XG59XG5cbi8qKlxuICogQ29udmVydHMgYmV0d2VlbiBKUyB1bmRlZmluZWQgYW5kIE5VTEwgUGF5bG9hZFxuICovXG5leHBvcnQgY2xhc3MgVW5kZWZpbmVkUGF5bG9hZENvbnZlcnRlciBpbXBsZW1lbnRzIFBheWxvYWRDb252ZXJ0ZXJXaXRoRW5jb2Rpbmcge1xuICBwdWJsaWMgZW5jb2RpbmdUeXBlID0gZW5jb2RpbmdUeXBlcy5NRVRBREFUQV9FTkNPRElOR19OVUxMO1xuXG4gIHB1YmxpYyB0b1BheWxvYWQodmFsdWU6IHVua25vd24pOiBQYXlsb2FkIHwgdW5kZWZpbmVkIHtcbiAgICBpZiAodmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgbWV0YWRhdGE6IHtcbiAgICAgICAgW01FVEFEQVRBX0VOQ09ESU5HX0tFWV06IGVuY29kaW5nS2V5cy5NRVRBREFUQV9FTkNPRElOR19OVUxMLFxuICAgICAgfSxcbiAgICB9O1xuICB9XG5cbiAgcHVibGljIGZyb21QYXlsb2FkPFQ+KF9jb250ZW50OiBQYXlsb2FkKTogVCB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZCBhcyBhbnk7IC8vIEp1c3QgcmV0dXJuIHVuZGVmaW5lZFxuICB9XG59XG5cbi8qKlxuICogQ29udmVydHMgYmV0d2VlbiBiaW5hcnkgZGF0YSB0eXBlcyBhbmQgUkFXIFBheWxvYWRcbiAqL1xuZXhwb3J0IGNsYXNzIEJpbmFyeVBheWxvYWRDb252ZXJ0ZXIgaW1wbGVtZW50cyBQYXlsb2FkQ29udmVydGVyV2l0aEVuY29kaW5nIHtcbiAgcHVibGljIGVuY29kaW5nVHlwZSA9IGVuY29kaW5nVHlwZXMuTUVUQURBVEFfRU5DT0RJTkdfUkFXO1xuXG4gIHB1YmxpYyB0b1BheWxvYWQodmFsdWU6IHVua25vd24pOiBQYXlsb2FkIHwgdW5kZWZpbmVkIHtcbiAgICBpZiAoISh2YWx1ZSBpbnN0YW5jZW9mIFVpbnQ4QXJyYXkpKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBtZXRhZGF0YToge1xuICAgICAgICBbTUVUQURBVEFfRU5DT0RJTkdfS0VZXTogZW5jb2RpbmdLZXlzLk1FVEFEQVRBX0VOQ09ESU5HX1JBVyxcbiAgICAgIH0sXG4gICAgICBkYXRhOiB2YWx1ZSxcbiAgICB9O1xuICB9XG5cbiAgcHVibGljIGZyb21QYXlsb2FkPFQ+KGNvbnRlbnQ6IFBheWxvYWQpOiBUIHtcbiAgICByZXR1cm4gKFxuICAgICAgLy8gV3JhcCB3aXRoIFVpbnQ4QXJyYXkgZnJvbSB0aGlzIGNvbnRleHQgdG8gZW5zdXJlIGBpbnN0YW5jZW9mYCB3b3Jrc1xuICAgICAgKFxuICAgICAgICBjb250ZW50LmRhdGEgPyBuZXcgVWludDhBcnJheShjb250ZW50LmRhdGEuYnVmZmVyLCBjb250ZW50LmRhdGEuYnl0ZU9mZnNldCwgY29udGVudC5kYXRhLmxlbmd0aCkgOiBjb250ZW50LmRhdGFcbiAgICAgICkgYXMgYW55XG4gICAgKTtcbiAgfVxufVxuXG4vKipcbiAqIENvbnZlcnRzIGJldHdlZW4gbm9uLXVuZGVmaW5lZCB2YWx1ZXMgYW5kIHNlcmlhbGl6ZWQgSlNPTiBQYXlsb2FkXG4gKi9cbmV4cG9ydCBjbGFzcyBKc29uUGF5bG9hZENvbnZlcnRlciBpbXBsZW1lbnRzIFBheWxvYWRDb252ZXJ0ZXJXaXRoRW5jb2Rpbmcge1xuICBwdWJsaWMgZW5jb2RpbmdUeXBlID0gZW5jb2RpbmdUeXBlcy5NRVRBREFUQV9FTkNPRElOR19KU09OO1xuXG4gIHB1YmxpYyB0b1BheWxvYWQodmFsdWU6IHVua25vd24pOiBQYXlsb2FkIHwgdW5kZWZpbmVkIHtcbiAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBsZXQganNvbjtcbiAgICB0cnkge1xuICAgICAganNvbiA9IEpTT04uc3RyaW5naWZ5KHZhbHVlKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIG1ldGFkYXRhOiB7XG4gICAgICAgIFtNRVRBREFUQV9FTkNPRElOR19LRVldOiBlbmNvZGluZ0tleXMuTUVUQURBVEFfRU5DT0RJTkdfSlNPTixcbiAgICAgIH0sXG4gICAgICBkYXRhOiBlbmNvZGUoanNvbiksXG4gICAgfTtcbiAgfVxuXG4gIHB1YmxpYyBmcm9tUGF5bG9hZDxUPihjb250ZW50OiBQYXlsb2FkKTogVCB7XG4gICAgaWYgKGNvbnRlbnQuZGF0YSA9PT0gdW5kZWZpbmVkIHx8IGNvbnRlbnQuZGF0YSA9PT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IFZhbHVlRXJyb3IoJ0dvdCBwYXlsb2FkIHdpdGggbm8gZGF0YScpO1xuICAgIH1cbiAgICByZXR1cm4gSlNPTi5wYXJzZShkZWNvZGUoY29udGVudC5kYXRhKSk7XG4gIH1cbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBTZWFyY2ggQXR0cmlidXRlIHZhbHVlcyB1c2luZyBKc29uUGF5bG9hZENvbnZlcnRlclxuICovXG5leHBvcnQgY2xhc3MgU2VhcmNoQXR0cmlidXRlUGF5bG9hZENvbnZlcnRlciBpbXBsZW1lbnRzIFBheWxvYWRDb252ZXJ0ZXIge1xuICBqc29uQ29udmVydGVyID0gbmV3IEpzb25QYXlsb2FkQ29udmVydGVyKCk7XG4gIHZhbGlkTm9uRGF0ZVR5cGVzID0gWydzdHJpbmcnLCAnbnVtYmVyJywgJ2Jvb2xlYW4nXTtcblxuICBwdWJsaWMgdG9QYXlsb2FkKHZhbHVlczogdW5rbm93bik6IFBheWxvYWQge1xuICAgIGlmICghQXJyYXkuaXNBcnJheSh2YWx1ZXMpKSB7XG4gICAgICB0aHJvdyBuZXcgVmFsdWVFcnJvcihgU2VhcmNoQXR0cmlidXRlIHZhbHVlIG11c3QgYmUgYW4gYXJyYXlgKTtcbiAgICB9XG5cbiAgICBpZiAodmFsdWVzLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IGZpcnN0VmFsdWUgPSB2YWx1ZXNbMF07XG4gICAgICBjb25zdCBmaXJzdFR5cGUgPSB0eXBlb2YgZmlyc3RWYWx1ZTtcbiAgICAgIGlmIChmaXJzdFR5cGUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIGZvciAoY29uc3QgW2lkeCwgdmFsdWVdIG9mIHZhbHVlcy5lbnRyaWVzKCkpIHtcbiAgICAgICAgICBpZiAoISh2YWx1ZSBpbnN0YW5jZW9mIERhdGUpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVmFsdWVFcnJvcihcbiAgICAgICAgICAgICAgYFNlYXJjaEF0dHJpYnV0ZSB2YWx1ZXMgbXVzdCBhcnJheXMgb2Ygc3RyaW5ncywgbnVtYmVycywgYm9vbGVhbnMsIG9yIERhdGVzLiBUaGUgdmFsdWUgJHt2YWx1ZX0gYXQgaW5kZXggJHtpZHh9IGlzIG9mIHR5cGUgJHt0eXBlb2YgdmFsdWV9YFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICghdGhpcy52YWxpZE5vbkRhdGVUeXBlcy5pbmNsdWRlcyhmaXJzdFR5cGUpKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFZhbHVlRXJyb3IoYFNlYXJjaEF0dHJpYnV0ZSBhcnJheSB2YWx1ZXMgbXVzdCBiZTogc3RyaW5nIHwgbnVtYmVyIHwgYm9vbGVhbiB8IERhdGVgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAoY29uc3QgW2lkeCwgdmFsdWVdIG9mIHZhbHVlcy5lbnRyaWVzKCkpIHtcbiAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlICE9PSBmaXJzdFR5cGUpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBWYWx1ZUVycm9yKFxuICAgICAgICAgICAgICBgQWxsIFNlYXJjaEF0dHJpYnV0ZSBhcnJheSB2YWx1ZXMgbXVzdCBiZSBvZiB0aGUgc2FtZSB0eXBlLiBUaGUgZmlyc3QgdmFsdWUgJHtmaXJzdFZhbHVlfSBvZiB0eXBlICR7Zmlyc3RUeXBlfSBkb2Vzbid0IG1hdGNoIHZhbHVlICR7dmFsdWV9IG9mIHR5cGUgJHt0eXBlb2YgdmFsdWV9IGF0IGluZGV4ICR7aWR4fWBcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gSlNPTi5zdHJpbmdpZnkgdGFrZXMgY2FyZSBvZiBjb252ZXJ0aW5nIERhdGVzIHRvIElTTyBzdHJpbmdzXG4gICAgY29uc3QgcmV0ID0gdGhpcy5qc29uQ29udmVydGVyLnRvUGF5bG9hZCh2YWx1ZXMpO1xuICAgIGlmIChyZXQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IFZhbHVlRXJyb3IoJ0NvdWxkIG5vdCBjb252ZXJ0IHNlYXJjaCBhdHRyaWJ1dGVzIHRvIHBheWxvYWRzJyk7XG4gICAgfVxuICAgIHJldHVybiByZXQ7XG4gIH1cblxuICAvKipcbiAgICogRGF0ZXRpbWUgU2VhcmNoIEF0dHJpYnV0ZSB2YWx1ZXMgYXJlIGNvbnZlcnRlZCB0byBgRGF0ZWBzXG4gICAqL1xuICBwdWJsaWMgZnJvbVBheWxvYWQ8VD4ocGF5bG9hZDogUGF5bG9hZCk6IFQge1xuICAgIGlmIChwYXlsb2FkLm1ldGFkYXRhID09PSB1bmRlZmluZWQgfHwgcGF5bG9hZC5tZXRhZGF0YSA9PT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IFZhbHVlRXJyb3IoJ01pc3NpbmcgcGF5bG9hZCBtZXRhZGF0YScpO1xuICAgIH1cblxuICAgIGNvbnN0IHZhbHVlID0gdGhpcy5qc29uQ29udmVydGVyLmZyb21QYXlsb2FkKHBheWxvYWQpO1xuICAgIGxldCBhcnJheVdyYXBwZWRWYWx1ZSA9IEFycmF5LmlzQXJyYXkodmFsdWUpID8gdmFsdWUgOiBbdmFsdWVdO1xuXG4gICAgY29uc3Qgc2VhcmNoQXR0cmlidXRlVHlwZSA9IGRlY29kZShwYXlsb2FkLm1ldGFkYXRhLnR5cGUpO1xuICAgIGlmIChzZWFyY2hBdHRyaWJ1dGVUeXBlID09PSAnRGF0ZXRpbWUnKSB7XG4gICAgICBhcnJheVdyYXBwZWRWYWx1ZSA9IGFycmF5V3JhcHBlZFZhbHVlLm1hcCgoZGF0ZVN0cmluZykgPT4gbmV3IERhdGUoZGF0ZVN0cmluZykpO1xuICAgIH1cbiAgICByZXR1cm4gYXJyYXlXcmFwcGVkVmFsdWUgYXMgdW5rbm93biBhcyBUO1xuICB9XG59XG5cbmV4cG9ydCBjb25zdCBzZWFyY2hBdHRyaWJ1dGVQYXlsb2FkQ29udmVydGVyID0gbmV3IFNlYXJjaEF0dHJpYnV0ZVBheWxvYWRDb252ZXJ0ZXIoKTtcblxuZXhwb3J0IGNsYXNzIERlZmF1bHRQYXlsb2FkQ29udmVydGVyIGV4dGVuZHMgQ29tcG9zaXRlUGF5bG9hZENvbnZlcnRlciB7XG4gIC8vIE1hdGNoIHRoZSBvcmRlciB1c2VkIGluIG90aGVyIFNES3MsIGJ1dCBleGNsdWRlIFByb3RvYnVmIGNvbnZlcnRlcnMgc28gdGhhdCB0aGUgY29kZSwgaW5jbHVkaW5nXG4gIC8vIGBwcm90bzMtanNvbi1zZXJpYWxpemVyYCwgZG9lc24ndCB0YWtlIHNwYWNlIGluIFdvcmtmbG93IGJ1bmRsZXMgdGhhdCBkb24ndCB1c2UgUHJvdG9idWZzLiBUbyB1c2UgUHJvdG9idWZzLCB1c2VcbiAgLy8ge0BsaW5rIERlZmF1bHRQYXlsb2FkQ29udmVydGVyV2l0aFByb3RvYnVmc30uXG4gIC8vXG4gIC8vIEdvIFNESzpcbiAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3RlbXBvcmFsaW8vc2RrLWdvL2Jsb2IvNWU1NjQ1ZjBjNTUwZGNmNzE3YzA5NWFlMzJjNzZhNzA4N2QyZTk4NS9jb252ZXJ0ZXIvZGVmYXVsdF9kYXRhX2NvbnZlcnRlci5nbyNMMjhcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIobmV3IFVuZGVmaW5lZFBheWxvYWRDb252ZXJ0ZXIoKSwgbmV3IEJpbmFyeVBheWxvYWRDb252ZXJ0ZXIoKSwgbmV3IEpzb25QYXlsb2FkQ29udmVydGVyKCkpO1xuICB9XG59XG5cbi8qKlxuICogVGhlIGRlZmF1bHQge0BsaW5rIFBheWxvYWRDb252ZXJ0ZXJ9IHVzZWQgYnkgdGhlIFNESy4gU3VwcG9ydHMgYFVpbnQ4QXJyYXlgIGFuZCBKU09OIHNlcmlhbGl6YWJsZXMgKHNvIGlmXG4gKiB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvSlNPTi9zdHJpbmdpZnkjZGVzY3JpcHRpb24gfCBgSlNPTi5zdHJpbmdpZnkoeW91ckFyZ09yUmV0dmFsKWB9XG4gKiB3b3JrcywgdGhlIGRlZmF1bHQgcGF5bG9hZCBjb252ZXJ0ZXIgd2lsbCB3b3JrKS5cbiAqXG4gKiBUbyBhbHNvIHN1cHBvcnQgUHJvdG9idWZzLCBjcmVhdGUgYSBjdXN0b20gcGF5bG9hZCBjb252ZXJ0ZXIgd2l0aCB7QGxpbmsgRGVmYXVsdFBheWxvYWRDb252ZXJ0ZXJ9OlxuICpcbiAqIGBjb25zdCBteUNvbnZlcnRlciA9IG5ldyBEZWZhdWx0UGF5bG9hZENvbnZlcnRlcih7IHByb3RvYnVmUm9vdCB9KWBcbiAqL1xuZXhwb3J0IGNvbnN0IGRlZmF1bHRQYXlsb2FkQ29udmVydGVyID0gbmV3IERlZmF1bHRQYXlsb2FkQ29udmVydGVyKCk7XG4iLCJpbXBvcnQgeyBlbmNvZGUgfSBmcm9tICcuLi9lbmNvZGluZyc7XG5cbmV4cG9ydCBjb25zdCBNRVRBREFUQV9FTkNPRElOR19LRVkgPSAnZW5jb2RpbmcnO1xuZXhwb3J0IGNvbnN0IGVuY29kaW5nVHlwZXMgPSB7XG4gIE1FVEFEQVRBX0VOQ09ESU5HX05VTEw6ICdiaW5hcnkvbnVsbCcsXG4gIE1FVEFEQVRBX0VOQ09ESU5HX1JBVzogJ2JpbmFyeS9wbGFpbicsXG4gIE1FVEFEQVRBX0VOQ09ESU5HX0pTT046ICdqc29uL3BsYWluJyxcbiAgTUVUQURBVEFfRU5DT0RJTkdfUFJPVE9CVUZfSlNPTjogJ2pzb24vcHJvdG9idWYnLFxuICBNRVRBREFUQV9FTkNPRElOR19QUk9UT0JVRjogJ2JpbmFyeS9wcm90b2J1ZicsXG59IGFzIGNvbnN0O1xuZXhwb3J0IHR5cGUgRW5jb2RpbmdUeXBlID0gKHR5cGVvZiBlbmNvZGluZ1R5cGVzKVtrZXlvZiB0eXBlb2YgZW5jb2RpbmdUeXBlc107XG5cbmV4cG9ydCBjb25zdCBlbmNvZGluZ0tleXMgPSB7XG4gIE1FVEFEQVRBX0VOQ09ESU5HX05VTEw6IGVuY29kZShlbmNvZGluZ1R5cGVzLk1FVEFEQVRBX0VOQ09ESU5HX05VTEwpLFxuICBNRVRBREFUQV9FTkNPRElOR19SQVc6IGVuY29kZShlbmNvZGluZ1R5cGVzLk1FVEFEQVRBX0VOQ09ESU5HX1JBVyksXG4gIE1FVEFEQVRBX0VOQ09ESU5HX0pTT046IGVuY29kZShlbmNvZGluZ1R5cGVzLk1FVEFEQVRBX0VOQ09ESU5HX0pTT04pLFxuICBNRVRBREFUQV9FTkNPRElOR19QUk9UT0JVRl9KU09OOiBlbmNvZGUoZW5jb2RpbmdUeXBlcy5NRVRBREFUQV9FTkNPRElOR19QUk9UT0JVRl9KU09OKSxcbiAgTUVUQURBVEFfRU5DT0RJTkdfUFJPVE9CVUY6IGVuY29kZShlbmNvZGluZ1R5cGVzLk1FVEFEQVRBX0VOQ09ESU5HX1BST1RPQlVGKSxcbn0gYXMgY29uc3Q7XG5cbmV4cG9ydCBjb25zdCBNRVRBREFUQV9NRVNTQUdFX1RZUEVfS0VZID0gJ21lc3NhZ2VUeXBlJztcbiIsImltcG9ydCAqIGFzIHRpbWUgZnJvbSAnLi90aW1lJztcbmltcG9ydCB7IHR5cGUgVGltZXN0YW1wLCBEdXJhdGlvbiB9IGZyb20gJy4vdGltZSc7XG5cbi8qKlxuICogTG9zc3kgY29udmVyc2lvbiBmdW5jdGlvbiBmcm9tIFRpbWVzdGFtcCB0byBudW1iZXIgZHVlIHRvIHBvc3NpYmxlIG92ZXJmbG93LlxuICogSWYgdHMgaXMgbnVsbCBvciB1bmRlZmluZWQgcmV0dXJucyB1bmRlZmluZWQuXG4gKlxuICogQGhpZGRlblxuICogQGRlcHJlY2F0ZWQgLSBtZWFudCBmb3IgaW50ZXJuYWwgdXNlIG9ubHlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG9wdGlvbmFsVHNUb01zKHRzOiBUaW1lc3RhbXAgfCBudWxsIHwgdW5kZWZpbmVkKTogbnVtYmVyIHwgdW5kZWZpbmVkIHtcbiAgcmV0dXJuIHRpbWUub3B0aW9uYWxUc1RvTXModHMpO1xufVxuXG4vKipcbiAqIExvc3N5IGNvbnZlcnNpb24gZnVuY3Rpb24gZnJvbSBUaW1lc3RhbXAgdG8gbnVtYmVyIGR1ZSB0byBwb3NzaWJsZSBvdmVyZmxvd1xuICpcbiAqIEBoaWRkZW5cbiAqIEBkZXByZWNhdGVkIC0gbWVhbnQgZm9yIGludGVybmFsIHVzZSBvbmx5XG4gKiBAZGVwcmVjYXRlZCAtIG1lYW50IGZvciBpbnRlcm5hbCB1c2Ugb25seVxuICovXG5leHBvcnQgZnVuY3Rpb24gdHNUb01zKHRzOiBUaW1lc3RhbXAgfCBudWxsIHwgdW5kZWZpbmVkKTogbnVtYmVyIHtcbiAgcmV0dXJuIHRpbWUudHNUb01zKHRzKTtcbn1cblxuLyoqXG4gKiBAaGlkZGVuXG4gKiBAZGVwcmVjYXRlZCAtIG1lYW50IGZvciBpbnRlcm5hbCB1c2Ugb25seVxuICovXG5leHBvcnQgZnVuY3Rpb24gbXNOdW1iZXJUb1RzKG1pbGxpczogbnVtYmVyKTogVGltZXN0YW1wIHtcbiAgcmV0dXJuIHRpbWUubXNOdW1iZXJUb1RzKG1pbGxpcyk7XG59XG5cbi8qKlxuICogQGhpZGRlblxuICogQGRlcHJlY2F0ZWQgLSBtZWFudCBmb3IgaW50ZXJuYWwgdXNlIG9ubHlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1zVG9UcyhzdHI6IER1cmF0aW9uKTogVGltZXN0YW1wIHtcbiAgcmV0dXJuIHRpbWUubXNUb1RzKHN0cik7XG59XG5cbi8qKlxuICogQGhpZGRlblxuICogQGRlcHJlY2F0ZWQgLSBtZWFudCBmb3IgaW50ZXJuYWwgdXNlIG9ubHlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1zT3B0aW9uYWxUb1RzKHN0cjogRHVyYXRpb24gfCB1bmRlZmluZWQpOiBUaW1lc3RhbXAgfCB1bmRlZmluZWQge1xuICByZXR1cm4gdGltZS5tc09wdGlvbmFsVG9UcyhzdHIpO1xufVxuXG4vKipcbiAqIEBoaWRkZW5cbiAqIEBkZXByZWNhdGVkIC0gbWVhbnQgZm9yIGludGVybmFsIHVzZSBvbmx5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtc09wdGlvbmFsVG9OdW1iZXIodmFsOiBEdXJhdGlvbiB8IHVuZGVmaW5lZCk6IG51bWJlciB8IHVuZGVmaW5lZCB7XG4gIHJldHVybiB0aW1lLm1zT3B0aW9uYWxUb051bWJlcih2YWwpO1xufVxuXG4vKipcbiAqIEBoaWRkZW5cbiAqIEBkZXByZWNhdGVkIC0gbWVhbnQgZm9yIGludGVybmFsIHVzZSBvbmx5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtc1RvTnVtYmVyKHZhbDogRHVyYXRpb24pOiBudW1iZXIge1xuICByZXR1cm4gdGltZS5tc1RvTnVtYmVyKHZhbCk7XG59XG5cbi8qKlxuICogQGhpZGRlblxuICogQGRlcHJlY2F0ZWQgLSBtZWFudCBmb3IgaW50ZXJuYWwgdXNlIG9ubHlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRzVG9EYXRlKHRzOiBUaW1lc3RhbXApOiBEYXRlIHtcbiAgcmV0dXJuIHRpbWUudHNUb0RhdGUodHMpO1xufVxuXG4vKipcbiAqIEBoaWRkZW5cbiAqIEBkZXByZWNhdGVkIC0gbWVhbnQgZm9yIGludGVybmFsIHVzZSBvbmx5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBvcHRpb25hbFRzVG9EYXRlKHRzOiBUaW1lc3RhbXAgfCBudWxsIHwgdW5kZWZpbmVkKTogRGF0ZSB8IHVuZGVmaW5lZCB7XG4gIHJldHVybiB0aW1lLm9wdGlvbmFsVHNUb0RhdGUodHMpO1xufVxuIiwiLy8gUGFzdGVkIHdpdGggbW9kaWZpY2F0aW9ucyBmcm9tOiBodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vYW5vbnljby9GYXN0ZXN0U21hbGxlc3RUZXh0RW5jb2RlckRlY29kZXIvbWFzdGVyL0VuY29kZXJEZWNvZGVyVG9nZXRoZXIuc3JjLmpzXG4vKiBlc2xpbnQgbm8tZmFsbHRocm91Z2g6IDAgKi9cblxuY29uc3QgZnJvbUNoYXJDb2RlID0gU3RyaW5nLmZyb21DaGFyQ29kZTtcbmNvbnN0IGVuY29kZXJSZWdleHAgPSAvW1xceDgwLVxcdUQ3ZmZcXHVEQzAwLVxcdUZGRkZdfFtcXHVEODAwLVxcdURCRkZdW1xcdURDMDAtXFx1REZGRl0/L2c7XG5jb25zdCB0bXBCdWZmZXJVMTYgPSBuZXcgVWludDE2QXJyYXkoMzIpO1xuXG5leHBvcnQgY2xhc3MgVGV4dERlY29kZXIge1xuICBkZWNvZGUoaW5wdXRBcnJheU9yQnVmZmVyOiBVaW50OEFycmF5IHwgQXJyYXlCdWZmZXIgfCBTaGFyZWRBcnJheUJ1ZmZlcik6IHN0cmluZyB7XG4gICAgY29uc3QgaW5wdXRBczggPSBpbnB1dEFycmF5T3JCdWZmZXIgaW5zdGFuY2VvZiBVaW50OEFycmF5ID8gaW5wdXRBcnJheU9yQnVmZmVyIDogbmV3IFVpbnQ4QXJyYXkoaW5wdXRBcnJheU9yQnVmZmVyKTtcblxuICAgIGxldCByZXN1bHRpbmdTdHJpbmcgPSAnJyxcbiAgICAgIHRtcFN0ciA9ICcnLFxuICAgICAgaW5kZXggPSAwLFxuICAgICAgbmV4dEVuZCA9IDAsXG4gICAgICBjcDAgPSAwLFxuICAgICAgY29kZVBvaW50ID0gMCxcbiAgICAgIG1pbkJpdHMgPSAwLFxuICAgICAgY3AxID0gMCxcbiAgICAgIHBvcyA9IDAsXG4gICAgICB0bXAgPSAtMTtcbiAgICBjb25zdCBsZW4gPSBpbnB1dEFzOC5sZW5ndGggfCAwO1xuICAgIGNvbnN0IGxlbk1pbnVzMzIgPSAobGVuIC0gMzIpIHwgMDtcbiAgICAvLyBOb3RlIHRoYXQgdG1wIHJlcHJlc2VudHMgdGhlIDJuZCBoYWxmIG9mIGEgc3Vycm9nYXRlIHBhaXIgaW5jYXNlIGEgc3Vycm9nYXRlIGdldHMgZGl2aWRlZCBiZXR3ZWVuIGJsb2Nrc1xuICAgIGZvciAoOyBpbmRleCA8IGxlbjsgKSB7XG4gICAgICBuZXh0RW5kID0gaW5kZXggPD0gbGVuTWludXMzMiA/IDMyIDogKGxlbiAtIGluZGV4KSB8IDA7XG4gICAgICBmb3IgKDsgcG9zIDwgbmV4dEVuZDsgaW5kZXggPSAoaW5kZXggKyAxKSB8IDAsIHBvcyA9IChwb3MgKyAxKSB8IDApIHtcbiAgICAgICAgY3AwID0gaW5wdXRBczhbaW5kZXhdICYgMHhmZjtcbiAgICAgICAgc3dpdGNoIChjcDAgPj4gNCkge1xuICAgICAgICAgIGNhc2UgMTU6XG4gICAgICAgICAgICBjcDEgPSBpbnB1dEFzOFsoaW5kZXggPSAoaW5kZXggKyAxKSB8IDApXSAmIDB4ZmY7XG4gICAgICAgICAgICBpZiAoY3AxID4+IDYgIT09IDBiMTAgfHwgMGIxMTExMDExMSA8IGNwMCkge1xuICAgICAgICAgICAgICBpbmRleCA9IChpbmRleCAtIDEpIHwgMDtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb2RlUG9pbnQgPSAoKGNwMCAmIDBiMTExKSA8PCA2KSB8IChjcDEgJiAwYjAwMTExMTExKTtcbiAgICAgICAgICAgIG1pbkJpdHMgPSA1OyAvLyAyMCBlbnN1cmVzIGl0IG5ldmVyIHBhc3NlcyAtPiBhbGwgaW52YWxpZCByZXBsYWNlbWVudHNcbiAgICAgICAgICAgIGNwMCA9IDB4MTAwOyAvLyAga2VlcCB0cmFjayBvZiB0aCBiaXQgc2l6ZVxuICAgICAgICAgIGNhc2UgMTQ6XG4gICAgICAgICAgICBjcDEgPSBpbnB1dEFzOFsoaW5kZXggPSAoaW5kZXggKyAxKSB8IDApXSAmIDB4ZmY7XG4gICAgICAgICAgICBjb2RlUG9pbnQgPDw9IDY7XG4gICAgICAgICAgICBjb2RlUG9pbnQgfD0gKChjcDAgJiAwYjExMTEpIDw8IDYpIHwgKGNwMSAmIDBiMDAxMTExMTEpO1xuICAgICAgICAgICAgbWluQml0cyA9IGNwMSA+PiA2ID09PSAwYjEwID8gKG1pbkJpdHMgKyA0KSB8IDAgOiAyNDsgLy8gMjQgZW5zdXJlcyBpdCBuZXZlciBwYXNzZXMgLT4gYWxsIGludmFsaWQgcmVwbGFjZW1lbnRzXG4gICAgICAgICAgICBjcDAgPSAoY3AwICsgMHgxMDApICYgMHgzMDA7IC8vIGtlZXAgdHJhY2sgb2YgdGggYml0IHNpemVcbiAgICAgICAgICBjYXNlIDEzOlxuICAgICAgICAgIGNhc2UgMTI6XG4gICAgICAgICAgICBjcDEgPSBpbnB1dEFzOFsoaW5kZXggPSAoaW5kZXggKyAxKSB8IDApXSAmIDB4ZmY7XG4gICAgICAgICAgICBjb2RlUG9pbnQgPDw9IDY7XG4gICAgICAgICAgICBjb2RlUG9pbnQgfD0gKChjcDAgJiAwYjExMTExKSA8PCA2KSB8IChjcDEgJiAwYjAwMTExMTExKTtcbiAgICAgICAgICAgIG1pbkJpdHMgPSAobWluQml0cyArIDcpIHwgMDtcblxuICAgICAgICAgICAgLy8gTm93LCBwcm9jZXNzIHRoZSBjb2RlIHBvaW50XG4gICAgICAgICAgICBpZiAoaW5kZXggPCBsZW4gJiYgY3AxID4+IDYgPT09IDBiMTAgJiYgY29kZVBvaW50ID4+IG1pbkJpdHMgJiYgY29kZVBvaW50IDwgMHgxMTAwMDApIHtcbiAgICAgICAgICAgICAgY3AwID0gY29kZVBvaW50O1xuICAgICAgICAgICAgICBjb2RlUG9pbnQgPSAoY29kZVBvaW50IC0gMHgxMDAwMCkgfCAwO1xuICAgICAgICAgICAgICBpZiAoMCA8PSBjb2RlUG9pbnQgLyoweGZmZmYgPCBjb2RlUG9pbnQqLykge1xuICAgICAgICAgICAgICAgIC8vIEJNUCBjb2RlIHBvaW50XG4gICAgICAgICAgICAgICAgLy9uZXh0RW5kID0gbmV4dEVuZCAtIDF8MDtcblxuICAgICAgICAgICAgICAgIHRtcCA9ICgoY29kZVBvaW50ID4+IDEwKSArIDB4ZDgwMCkgfCAwOyAvLyBoaWdoU3Vycm9nYXRlXG4gICAgICAgICAgICAgICAgY3AwID0gKChjb2RlUG9pbnQgJiAweDNmZikgKyAweGRjMDApIHwgMDsgLy8gbG93U3Vycm9nYXRlICh3aWxsIGJlIGluc2VydGVkIGxhdGVyIGluIHRoZSBzd2l0Y2gtc3RhdGVtZW50KVxuXG4gICAgICAgICAgICAgICAgaWYgKHBvcyA8IDMxKSB7XG4gICAgICAgICAgICAgICAgICAvLyBub3RpY2UgMzEgaW5zdGVhZCBvZiAzMlxuICAgICAgICAgICAgICAgICAgdG1wQnVmZmVyVTE2W3Bvc10gPSB0bXA7XG4gICAgICAgICAgICAgICAgICBwb3MgPSAocG9zICsgMSkgfCAwO1xuICAgICAgICAgICAgICAgICAgdG1wID0gLTE7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIC8vIGVsc2UsIHdlIGFyZSBhdCB0aGUgZW5kIG9mIHRoZSBpbnB1dEFzOCBhbmQgbGV0IHRtcDAgYmUgZmlsbGVkIGluIGxhdGVyIG9uXG4gICAgICAgICAgICAgICAgICAvLyBOT1RFIHRoYXQgY3AxIGlzIGJlaW5nIHVzZWQgYXMgYSB0ZW1wb3JhcnkgdmFyaWFibGUgZm9yIHRoZSBzd2FwcGluZyBvZiB0bXAgd2l0aCBjcDBcbiAgICAgICAgICAgICAgICAgIGNwMSA9IHRtcDtcbiAgICAgICAgICAgICAgICAgIHRtcCA9IGNwMDtcbiAgICAgICAgICAgICAgICAgIGNwMCA9IGNwMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0gZWxzZSBuZXh0RW5kID0gKG5leHRFbmQgKyAxKSB8IDA7IC8vIGJlY2F1c2Ugd2UgYXJlIGFkdmFuY2luZyBpIHdpdGhvdXQgYWR2YW5jaW5nIHBvc1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gaW52YWxpZCBjb2RlIHBvaW50IG1lYW5zIHJlcGxhY2luZyB0aGUgd2hvbGUgdGhpbmcgd2l0aCBudWxsIHJlcGxhY2VtZW50IGNoYXJhY3RlcnNcbiAgICAgICAgICAgICAgY3AwID4+PSA4O1xuICAgICAgICAgICAgICBpbmRleCA9IChpbmRleCAtIGNwMCAtIDEpIHwgMDsgLy8gcmVzZXQgaW5kZXggIGJhY2sgdG8gd2hhdCBpdCB3YXMgYmVmb3JlXG4gICAgICAgICAgICAgIGNwMCA9IDB4ZmZmZDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gRmluYWxseSwgcmVzZXQgdGhlIHZhcmlhYmxlcyBmb3IgdGhlIG5leHQgZ28tYXJvdW5kXG4gICAgICAgICAgICBtaW5CaXRzID0gMDtcbiAgICAgICAgICAgIGNvZGVQb2ludCA9IDA7XG4gICAgICAgICAgICBuZXh0RW5kID0gaW5kZXggPD0gbGVuTWludXMzMiA/IDMyIDogKGxlbiAtIGluZGV4KSB8IDA7XG4gICAgICAgICAgLypjYXNlIDExOlxuICAgICAgICBjYXNlIDEwOlxuICAgICAgICBjYXNlIDk6XG4gICAgICAgIGNhc2UgODpcbiAgICAgICAgICBjb2RlUG9pbnQgPyBjb2RlUG9pbnQgPSAwIDogY3AwID0gMHhmZmZkOyAvLyBmaWxsIHdpdGggaW52YWxpZCByZXBsYWNlbWVudCBjaGFyYWN0ZXJcbiAgICAgICAgY2FzZSA3OlxuICAgICAgICBjYXNlIDY6XG4gICAgICAgIGNhc2UgNTpcbiAgICAgICAgY2FzZSA0OlxuICAgICAgICBjYXNlIDM6XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgY2FzZSAxOlxuICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgdG1wQnVmZmVyVTE2W3Bvc10gPSBjcDA7XG4gICAgICAgICAgY29udGludWU7Ki9cbiAgICAgICAgICBkZWZhdWx0OiAvLyBmaWxsIHdpdGggaW52YWxpZCByZXBsYWNlbWVudCBjaGFyYWN0ZXJcbiAgICAgICAgICAgIHRtcEJ1ZmZlclUxNltwb3NdID0gY3AwO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgY2FzZSAxMTpcbiAgICAgICAgICBjYXNlIDEwOlxuICAgICAgICAgIGNhc2UgOTpcbiAgICAgICAgICBjYXNlIDg6XG4gICAgICAgIH1cbiAgICAgICAgdG1wQnVmZmVyVTE2W3Bvc10gPSAweGZmZmQ7IC8vIGZpbGwgd2l0aCBpbnZhbGlkIHJlcGxhY2VtZW50IGNoYXJhY3RlclxuICAgICAgfVxuICAgICAgdG1wU3RyICs9IGZyb21DaGFyQ29kZShcbiAgICAgICAgdG1wQnVmZmVyVTE2WzBdLFxuICAgICAgICB0bXBCdWZmZXJVMTZbMV0sXG4gICAgICAgIHRtcEJ1ZmZlclUxNlsyXSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzNdLFxuICAgICAgICB0bXBCdWZmZXJVMTZbNF0sXG4gICAgICAgIHRtcEJ1ZmZlclUxNls1XSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzZdLFxuICAgICAgICB0bXBCdWZmZXJVMTZbN10sXG4gICAgICAgIHRtcEJ1ZmZlclUxNls4XSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzldLFxuICAgICAgICB0bXBCdWZmZXJVMTZbMTBdLFxuICAgICAgICB0bXBCdWZmZXJVMTZbMTFdLFxuICAgICAgICB0bXBCdWZmZXJVMTZbMTJdLFxuICAgICAgICB0bXBCdWZmZXJVMTZbMTNdLFxuICAgICAgICB0bXBCdWZmZXJVMTZbMTRdLFxuICAgICAgICB0bXBCdWZmZXJVMTZbMTVdLFxuICAgICAgICB0bXBCdWZmZXJVMTZbMTZdLFxuICAgICAgICB0bXBCdWZmZXJVMTZbMTddLFxuICAgICAgICB0bXBCdWZmZXJVMTZbMThdLFxuICAgICAgICB0bXBCdWZmZXJVMTZbMTldLFxuICAgICAgICB0bXBCdWZmZXJVMTZbMjBdLFxuICAgICAgICB0bXBCdWZmZXJVMTZbMjFdLFxuICAgICAgICB0bXBCdWZmZXJVMTZbMjJdLFxuICAgICAgICB0bXBCdWZmZXJVMTZbMjNdLFxuICAgICAgICB0bXBCdWZmZXJVMTZbMjRdLFxuICAgICAgICB0bXBCdWZmZXJVMTZbMjVdLFxuICAgICAgICB0bXBCdWZmZXJVMTZbMjZdLFxuICAgICAgICB0bXBCdWZmZXJVMTZbMjddLFxuICAgICAgICB0bXBCdWZmZXJVMTZbMjhdLFxuICAgICAgICB0bXBCdWZmZXJVMTZbMjldLFxuICAgICAgICB0bXBCdWZmZXJVMTZbMzBdLFxuICAgICAgICB0bXBCdWZmZXJVMTZbMzFdXG4gICAgICApO1xuICAgICAgaWYgKHBvcyA8IDMyKSB0bXBTdHIgPSB0bXBTdHIuc2xpY2UoMCwgKHBvcyAtIDMyKSB8IDApOyAvLy0oMzItcG9zKSk7XG4gICAgICBpZiAoaW5kZXggPCBsZW4pIHtcbiAgICAgICAgLy9mcm9tQ2hhckNvZGUuYXBwbHkoMCwgdG1wQnVmZmVyVTE2IDogVWludDhBcnJheSA/ICB0bXBCdWZmZXJVMTYuc3ViYXJyYXkoMCxwb3MpIDogdG1wQnVmZmVyVTE2LnNsaWNlKDAscG9zKSk7XG4gICAgICAgIHRtcEJ1ZmZlclUxNlswXSA9IHRtcDtcbiAgICAgICAgcG9zID0gfnRtcCA+Pj4gMzE7IC8vdG1wICE9PSAtMSA/IDEgOiAwO1xuICAgICAgICB0bXAgPSAtMTtcblxuICAgICAgICBpZiAodG1wU3RyLmxlbmd0aCA8IHJlc3VsdGluZ1N0cmluZy5sZW5ndGgpIGNvbnRpbnVlO1xuICAgICAgfSBlbHNlIGlmICh0bXAgIT09IC0xKSB7XG4gICAgICAgIHRtcFN0ciArPSBmcm9tQ2hhckNvZGUodG1wKTtcbiAgICAgIH1cblxuICAgICAgcmVzdWx0aW5nU3RyaW5nICs9IHRtcFN0cjtcbiAgICAgIHRtcFN0ciA9ICcnO1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHRpbmdTdHJpbmc7XG4gIH1cbn1cblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbmZ1bmN0aW9uIGVuY29kZXJSZXBsYWNlcihub25Bc2NpaUNoYXJzOiBzdHJpbmcpIHtcbiAgLy8gbWFrZSB0aGUgVVRGIHN0cmluZyBpbnRvIGEgYmluYXJ5IFVURi04IGVuY29kZWQgc3RyaW5nXG4gIGxldCBwb2ludCA9IG5vbkFzY2lpQ2hhcnMuY2hhckNvZGVBdCgwKSB8IDA7XG4gIGlmICgweGQ4MDAgPD0gcG9pbnQpIHtcbiAgICBpZiAocG9pbnQgPD0gMHhkYmZmKSB7XG4gICAgICBjb25zdCBuZXh0Y29kZSA9IG5vbkFzY2lpQ2hhcnMuY2hhckNvZGVBdCgxKSB8IDA7IC8vIGRlZmF1bHRzIHRvIDAgd2hlbiBOYU4sIGNhdXNpbmcgbnVsbCByZXBsYWNlbWVudCBjaGFyYWN0ZXJcblxuICAgICAgaWYgKDB4ZGMwMCA8PSBuZXh0Y29kZSAmJiBuZXh0Y29kZSA8PSAweGRmZmYpIHtcbiAgICAgICAgLy9wb2ludCA9ICgocG9pbnQgLSAweEQ4MDApPDwxMCkgKyBuZXh0Y29kZSAtIDB4REMwMCArIDB4MTAwMDB8MDtcbiAgICAgICAgcG9pbnQgPSAoKHBvaW50IDw8IDEwKSArIG5leHRjb2RlIC0gMHgzNWZkYzAwKSB8IDA7XG4gICAgICAgIGlmIChwb2ludCA+IDB4ZmZmZilcbiAgICAgICAgICByZXR1cm4gZnJvbUNoYXJDb2RlKFxuICAgICAgICAgICAgKDB4MWUgLyowYjExMTEwKi8gPDwgMykgfCAocG9pbnQgPj4gMTgpLFxuICAgICAgICAgICAgKDB4MiAvKjBiMTAqLyA8PCA2KSB8ICgocG9pbnQgPj4gMTIpICYgMHgzZikgLyowYjAwMTExMTExKi8sXG4gICAgICAgICAgICAoMHgyIC8qMGIxMCovIDw8IDYpIHwgKChwb2ludCA+PiA2KSAmIDB4M2YpIC8qMGIwMDExMTExMSovLFxuICAgICAgICAgICAgKDB4MiAvKjBiMTAqLyA8PCA2KSB8IChwb2ludCAmIDB4M2YpIC8qMGIwMDExMTExMSovXG4gICAgICAgICAgKTtcbiAgICAgIH0gZWxzZSBwb2ludCA9IDY1NTMzIC8qMGIxMTExMTExMTExMTExMTAxKi87IC8vcmV0dXJuICdcXHhFRlxceEJGXFx4QkQnOy8vZnJvbUNoYXJDb2RlKDB4ZWYsIDB4YmYsIDB4YmQpO1xuICAgIH0gZWxzZSBpZiAocG9pbnQgPD0gMHhkZmZmKSB7XG4gICAgICBwb2ludCA9IDY1NTMzIC8qMGIxMTExMTExMTExMTExMTAxKi87IC8vcmV0dXJuICdcXHhFRlxceEJGXFx4QkQnOy8vZnJvbUNoYXJDb2RlKDB4ZWYsIDB4YmYsIDB4YmQpO1xuICAgIH1cbiAgfVxuICAvKmlmIChwb2ludCA8PSAweDAwN2YpIHJldHVybiBub25Bc2NpaUNoYXJzO1xuICBlbHNlICovIGlmIChwb2ludCA8PSAweDA3ZmYpIHtcbiAgICByZXR1cm4gZnJvbUNoYXJDb2RlKCgweDYgPDwgNSkgfCAocG9pbnQgPj4gNiksICgweDIgPDwgNikgfCAocG9pbnQgJiAweDNmKSk7XG4gIH0gZWxzZVxuICAgIHJldHVybiBmcm9tQ2hhckNvZGUoXG4gICAgICAoMHhlIC8qMGIxMTEwKi8gPDwgNCkgfCAocG9pbnQgPj4gMTIpLFxuICAgICAgKDB4MiAvKjBiMTAqLyA8PCA2KSB8ICgocG9pbnQgPj4gNikgJiAweDNmKSAvKjBiMDAxMTExMTEqLyxcbiAgICAgICgweDIgLyowYjEwKi8gPDwgNikgfCAocG9pbnQgJiAweDNmKSAvKjBiMDAxMTExMTEqL1xuICAgICk7XG59XG5cbmV4cG9ydCBjbGFzcyBUZXh0RW5jb2RlciB7XG4gIHB1YmxpYyBlbmNvZGUoaW5wdXRTdHJpbmc6IHN0cmluZyk6IFVpbnQ4QXJyYXkge1xuICAgIC8vIDB4YzAgPT4gMGIxMTAwMDAwMDsgMHhmZiA9PiAwYjExMTExMTExOyAweGMwLTB4ZmYgPT4gMGIxMXh4eHh4eFxuICAgIC8vIDB4ODAgPT4gMGIxMDAwMDAwMDsgMHhiZiA9PiAwYjEwMTExMTExOyAweDgwLTB4YmYgPT4gMGIxMHh4eHh4eFxuICAgIGNvbnN0IGVuY29kZWRTdHJpbmcgPSBpbnB1dFN0cmluZyA9PT0gdm9pZCAwID8gJycgOiAnJyArIGlucHV0U3RyaW5nLFxuICAgICAgbGVuID0gZW5jb2RlZFN0cmluZy5sZW5ndGggfCAwO1xuICAgIGxldCByZXN1bHQgPSBuZXcgVWludDhBcnJheSgoKGxlbiA8PCAxKSArIDgpIHwgMCk7XG4gICAgbGV0IHRtcFJlc3VsdDogVWludDhBcnJheTtcbiAgICBsZXQgaSA9IDAsXG4gICAgICBwb3MgPSAwLFxuICAgICAgcG9pbnQgPSAwLFxuICAgICAgbmV4dGNvZGUgPSAwO1xuICAgIGxldCB1cGdyYWRlZGVkQXJyYXlTaXplID0gIVVpbnQ4QXJyYXk7IC8vIG5vcm1hbCBhcnJheXMgYXJlIGF1dG8tZXhwYW5kaW5nXG4gICAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSA9IChpICsgMSkgfCAwLCBwb3MgPSAocG9zICsgMSkgfCAwKSB7XG4gICAgICBwb2ludCA9IGVuY29kZWRTdHJpbmcuY2hhckNvZGVBdChpKSB8IDA7XG4gICAgICBpZiAocG9pbnQgPD0gMHgwMDdmKSB7XG4gICAgICAgIHJlc3VsdFtwb3NdID0gcG9pbnQ7XG4gICAgICB9IGVsc2UgaWYgKHBvaW50IDw9IDB4MDdmZikge1xuICAgICAgICByZXN1bHRbcG9zXSA9ICgweDYgPDwgNSkgfCAocG9pbnQgPj4gNik7XG4gICAgICAgIHJlc3VsdFsocG9zID0gKHBvcyArIDEpIHwgMCldID0gKDB4MiA8PCA2KSB8IChwb2ludCAmIDB4M2YpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgd2lkZW5DaGVjazoge1xuICAgICAgICAgIGlmICgweGQ4MDAgPD0gcG9pbnQpIHtcbiAgICAgICAgICAgIGlmIChwb2ludCA8PSAweGRiZmYpIHtcbiAgICAgICAgICAgICAgbmV4dGNvZGUgPSBlbmNvZGVkU3RyaW5nLmNoYXJDb2RlQXQoKGkgPSAoaSArIDEpIHwgMCkpIHwgMDsgLy8gZGVmYXVsdHMgdG8gMCB3aGVuIE5hTiwgY2F1c2luZyBudWxsIHJlcGxhY2VtZW50IGNoYXJhY3RlclxuXG4gICAgICAgICAgICAgIGlmICgweGRjMDAgPD0gbmV4dGNvZGUgJiYgbmV4dGNvZGUgPD0gMHhkZmZmKSB7XG4gICAgICAgICAgICAgICAgLy9wb2ludCA9ICgocG9pbnQgLSAweEQ4MDApPDwxMCkgKyBuZXh0Y29kZSAtIDB4REMwMCArIDB4MTAwMDB8MDtcbiAgICAgICAgICAgICAgICBwb2ludCA9ICgocG9pbnQgPDwgMTApICsgbmV4dGNvZGUgLSAweDM1ZmRjMDApIHwgMDtcbiAgICAgICAgICAgICAgICBpZiAocG9pbnQgPiAweGZmZmYpIHtcbiAgICAgICAgICAgICAgICAgIHJlc3VsdFtwb3NdID0gKDB4MWUgLyowYjExMTEwKi8gPDwgMykgfCAocG9pbnQgPj4gMTgpO1xuICAgICAgICAgICAgICAgICAgcmVzdWx0Wyhwb3MgPSAocG9zICsgMSkgfCAwKV0gPSAoMHgyIC8qMGIxMCovIDw8IDYpIHwgKChwb2ludCA+PiAxMikgJiAweDNmKSAvKjBiMDAxMTExMTEqLztcbiAgICAgICAgICAgICAgICAgIHJlc3VsdFsocG9zID0gKHBvcyArIDEpIHwgMCldID0gKDB4MiAvKjBiMTAqLyA8PCA2KSB8ICgocG9pbnQgPj4gNikgJiAweDNmKSAvKjBiMDAxMTExMTEqLztcbiAgICAgICAgICAgICAgICAgIHJlc3VsdFsocG9zID0gKHBvcyArIDEpIHwgMCldID0gKDB4MiAvKjBiMTAqLyA8PCA2KSB8IChwb2ludCAmIDB4M2YpIC8qMGIwMDExMTExMSovO1xuICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrIHdpZGVuQ2hlY2s7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcG9pbnQgPSA2NTUzMyAvKjBiMTExMTExMTExMTExMTEwMSovOyAvL3JldHVybiAnXFx4RUZcXHhCRlxceEJEJzsvL2Zyb21DaGFyQ29kZSgweGVmLCAweGJmLCAweGJkKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAocG9pbnQgPD0gMHhkZmZmKSB7XG4gICAgICAgICAgICAgIHBvaW50ID0gNjU1MzMgLyowYjExMTExMTExMTExMTExMDEqLzsgLy9yZXR1cm4gJ1xceEVGXFx4QkZcXHhCRCc7Ly9mcm9tQ2hhckNvZGUoMHhlZiwgMHhiZiwgMHhiZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICghdXBncmFkZWRlZEFycmF5U2l6ZSAmJiBpIDw8IDEgPCBwb3MgJiYgaSA8PCAxIDwgKChwb3MgLSA3KSB8IDApKSB7XG4gICAgICAgICAgICB1cGdyYWRlZGVkQXJyYXlTaXplID0gdHJ1ZTtcbiAgICAgICAgICAgIHRtcFJlc3VsdCA9IG5ldyBVaW50OEFycmF5KGxlbiAqIDMpO1xuICAgICAgICAgICAgdG1wUmVzdWx0LnNldChyZXN1bHQpO1xuICAgICAgICAgICAgcmVzdWx0ID0gdG1wUmVzdWx0O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXN1bHRbcG9zXSA9ICgweGUgLyowYjExMTAqLyA8PCA0KSB8IChwb2ludCA+PiAxMik7XG4gICAgICAgIHJlc3VsdFsocG9zID0gKHBvcyArIDEpIHwgMCldID0gKDB4MiAvKjBiMTAqLyA8PCA2KSB8ICgocG9pbnQgPj4gNikgJiAweDNmKSAvKjBiMDAxMTExMTEqLztcbiAgICAgICAgcmVzdWx0Wyhwb3MgPSAocG9zICsgMSkgfCAwKV0gPSAoMHgyIC8qMGIxMCovIDw8IDYpIHwgKHBvaW50ICYgMHgzZikgLyowYjAwMTExMTExKi87XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBVaW50OEFycmF5ID8gcmVzdWx0LnN1YmFycmF5KDAsIHBvcykgOiByZXN1bHQuc2xpY2UoMCwgcG9zKTtcbiAgfVxuXG4gIHB1YmxpYyBlbmNvZGVJbnRvKGlucHV0U3RyaW5nOiBzdHJpbmcsIHU4QXJyOiBVaW50OEFycmF5KTogeyB3cml0dGVuOiBudW1iZXI7IHJlYWQ6IG51bWJlciB9IHtcbiAgICBjb25zdCBlbmNvZGVkU3RyaW5nID0gaW5wdXRTdHJpbmcgPT09IHZvaWQgMCA/ICcnIDogKCcnICsgaW5wdXRTdHJpbmcpLnJlcGxhY2UoZW5jb2RlclJlZ2V4cCwgZW5jb2RlclJlcGxhY2VyKTtcbiAgICBsZXQgbGVuID0gZW5jb2RlZFN0cmluZy5sZW5ndGggfCAwLFxuICAgICAgaSA9IDAsXG4gICAgICBjaGFyID0gMCxcbiAgICAgIHJlYWQgPSAwO1xuICAgIGNvbnN0IHU4QXJyTGVuID0gdThBcnIubGVuZ3RoIHwgMDtcbiAgICBjb25zdCBpbnB1dExlbmd0aCA9IGlucHV0U3RyaW5nLmxlbmd0aCB8IDA7XG4gICAgaWYgKHU4QXJyTGVuIDwgbGVuKSBsZW4gPSB1OEFyckxlbjtcbiAgICBwdXRDaGFyczoge1xuICAgICAgZm9yICg7IGkgPCBsZW47IGkgPSAoaSArIDEpIHwgMCkge1xuICAgICAgICBjaGFyID0gZW5jb2RlZFN0cmluZy5jaGFyQ29kZUF0KGkpIHwgMDtcbiAgICAgICAgc3dpdGNoIChjaGFyID4+IDQpIHtcbiAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgY2FzZSA0OlxuICAgICAgICAgIGNhc2UgNTpcbiAgICAgICAgICBjYXNlIDY6XG4gICAgICAgICAgY2FzZSA3OlxuICAgICAgICAgICAgcmVhZCA9IChyZWFkICsgMSkgfCAwO1xuICAgICAgICAgIC8vIGV4dGVuc2lvbiBwb2ludHM6XG4gICAgICAgICAgY2FzZSA4OlxuICAgICAgICAgIGNhc2UgOTpcbiAgICAgICAgICBjYXNlIDEwOlxuICAgICAgICAgIGNhc2UgMTE6XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDEyOlxuICAgICAgICAgIGNhc2UgMTM6XG4gICAgICAgICAgICBpZiAoKChpICsgMSkgfCAwKSA8IHU4QXJyTGVuKSB7XG4gICAgICAgICAgICAgIHJlYWQgPSAocmVhZCArIDEpIHwgMDtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgY2FzZSAxNDpcbiAgICAgICAgICAgIGlmICgoKGkgKyAyKSB8IDApIDwgdThBcnJMZW4pIHtcbiAgICAgICAgICAgICAgLy9pZiAoIShjaGFyID09PSAweEVGICYmIGVuY29kZWRTdHJpbmcuc3Vic3RyKGkrMXwwLDIpID09PSBcIlxceEJGXFx4QkRcIikpXG4gICAgICAgICAgICAgIHJlYWQgPSAocmVhZCArIDEpIHwgMDtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgY2FzZSAxNTpcbiAgICAgICAgICAgIGlmICgoKGkgKyAzKSB8IDApIDwgdThBcnJMZW4pIHtcbiAgICAgICAgICAgICAgcmVhZCA9IChyZWFkICsgMSkgfCAwO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgYnJlYWsgcHV0Q2hhcnM7XG4gICAgICAgIH1cbiAgICAgICAgLy9yZWFkID0gcmVhZCArICgoY2hhciA+PiA2KSAhPT0gMikgfDA7XG4gICAgICAgIHU4QXJyW2ldID0gY2hhcjtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHsgd3JpdHRlbjogaSwgcmVhZDogaW5wdXRMZW5ndGggPCByZWFkID8gaW5wdXRMZW5ndGggOiByZWFkIH07XG4gIH1cbn1cblxuLyoqXG4gKiBFbmNvZGUgYSBVVEYtOCBzdHJpbmcgaW50byBhIFVpbnQ4QXJyYXlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVuY29kZShzOiBzdHJpbmcpOiBVaW50OEFycmF5IHtcbiAgcmV0dXJuIFRleHRFbmNvZGVyLnByb3RvdHlwZS5lbmNvZGUocyk7XG59XG5cbi8qKlxuICogRGVjb2RlIGEgVWludDhBcnJheSBpbnRvIGEgVVRGLTggc3RyaW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZWNvZGUoYTogVWludDhBcnJheSk6IHN0cmluZyB7XG4gIHJldHVybiBUZXh0RGVjb2Rlci5wcm90b3R5cGUuZGVjb2RlKGEpO1xufVxuIiwiaW1wb3J0IHsgU3ltYm9sQmFzZWRJbnN0YW5jZU9mRXJyb3IgfSBmcm9tICcuL3R5cGUtaGVscGVycyc7XG5cbi8qKlxuICogVGhyb3duIGZyb20gY29kZSB0aGF0IHJlY2VpdmVzIGEgdmFsdWUgdGhhdCBpcyB1bmV4cGVjdGVkIG9yIHRoYXQgaXQncyB1bmFibGUgdG8gaGFuZGxlLlxuICovXG5AU3ltYm9sQmFzZWRJbnN0YW5jZU9mRXJyb3IoJ1ZhbHVlRXJyb3InKVxuZXhwb3J0IGNsYXNzIFZhbHVlRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIG1lc3NhZ2U6IHN0cmluZyB8IHVuZGVmaW5lZCxcbiAgICBwdWJsaWMgcmVhZG9ubHkgY2F1c2U/OiB1bmtub3duXG4gICkge1xuICAgIHN1cGVyKG1lc3NhZ2UgPz8gdW5kZWZpbmVkKTtcbiAgfVxufVxuXG4vKipcbiAqIFRocm93biB3aGVuIGEgUGF5bG9hZCBDb252ZXJ0ZXIgaXMgbWlzY29uZmlndXJlZC5cbiAqL1xuQFN5bWJvbEJhc2VkSW5zdGFuY2VPZkVycm9yKCdQYXlsb2FkQ29udmVydGVyRXJyb3InKVxuZXhwb3J0IGNsYXNzIFBheWxvYWRDb252ZXJ0ZXJFcnJvciBleHRlbmRzIFZhbHVlRXJyb3Ige31cblxuLyoqXG4gKiBVc2VkIGluIGRpZmZlcmVudCBwYXJ0cyBvZiB0aGUgU0RLIHRvIG5vdGUgdGhhdCBzb21ldGhpbmcgdW5leHBlY3RlZCBoYXMgaGFwcGVuZWQuXG4gKi9cbkBTeW1ib2xCYXNlZEluc3RhbmNlT2ZFcnJvcignSWxsZWdhbFN0YXRlRXJyb3InKVxuZXhwb3J0IGNsYXNzIElsbGVnYWxTdGF0ZUVycm9yIGV4dGVuZHMgRXJyb3Ige31cblxuLyoqXG4gKiBUaHJvd24gd2hlbiBhIFdvcmtmbG93IHdpdGggdGhlIGdpdmVuIElkIGlzIG5vdCBrbm93biB0byBUZW1wb3JhbCBTZXJ2ZXIuXG4gKiBJdCBjb3VsZCBiZSBiZWNhdXNlOlxuICogLSBJZCBwYXNzZWQgaXMgaW5jb3JyZWN0XG4gKiAtIFdvcmtmbG93IGlzIGNsb3NlZCAoZm9yIHNvbWUgY2FsbHMsIGUuZy4gYHRlcm1pbmF0ZWApXG4gKiAtIFdvcmtmbG93IHdhcyBkZWxldGVkIGZyb20gdGhlIFNlcnZlciBhZnRlciByZWFjaGluZyBpdHMgcmV0ZW50aW9uIGxpbWl0XG4gKi9cbkBTeW1ib2xCYXNlZEluc3RhbmNlT2ZFcnJvcignV29ya2Zsb3dOb3RGb3VuZEVycm9yJylcbmV4cG9ydCBjbGFzcyBXb3JrZmxvd05vdEZvdW5kRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIG1lc3NhZ2U6IHN0cmluZyxcbiAgICBwdWJsaWMgcmVhZG9ubHkgd29ya2Zsb3dJZDogc3RyaW5nLFxuICAgIHB1YmxpYyByZWFkb25seSBydW5JZDogc3RyaW5nIHwgdW5kZWZpbmVkXG4gICkge1xuICAgIHN1cGVyKG1lc3NhZ2UpO1xuICB9XG59XG5cbi8qKlxuICogVGhyb3duIHdoZW4gdGhlIHNwZWNpZmllZCBuYW1lc3BhY2UgaXMgbm90IGtub3duIHRvIFRlbXBvcmFsIFNlcnZlci5cbiAqL1xuQFN5bWJvbEJhc2VkSW5zdGFuY2VPZkVycm9yKCdOYW1lc3BhY2VOb3RGb3VuZEVycm9yJylcbmV4cG9ydCBjbGFzcyBOYW1lc3BhY2VOb3RGb3VuZEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgcmVhZG9ubHkgbmFtZXNwYWNlOiBzdHJpbmcpIHtcbiAgICBzdXBlcihgTmFtZXNwYWNlIG5vdCBmb3VuZDogJyR7bmFtZXNwYWNlfSdgKTtcbiAgfVxufVxuIiwiaW1wb3J0IHR5cGUgeyB0ZW1wb3JhbCB9IGZyb20gJ0B0ZW1wb3JhbGlvL3Byb3RvJztcbmltcG9ydCB7IGNoZWNrRXh0ZW5kcywgZXJyb3JNZXNzYWdlLCBpc1JlY29yZCwgU3ltYm9sQmFzZWRJbnN0YW5jZU9mRXJyb3IgfSBmcm9tICcuL3R5cGUtaGVscGVycyc7XG5pbXBvcnQgeyBEdXJhdGlvbiB9IGZyb20gJy4vdGltZSc7XG5cbmV4cG9ydCBjb25zdCBGQUlMVVJFX1NPVVJDRSA9ICdUeXBlU2NyaXB0U0RLJztcbmV4cG9ydCB0eXBlIFByb3RvRmFpbHVyZSA9IHRlbXBvcmFsLmFwaS5mYWlsdXJlLnYxLklGYWlsdXJlO1xuXG4vLyBBdm9pZCBpbXBvcnRpbmcgdGhlIHByb3RvIGltcGxlbWVudGF0aW9uIHRvIHJlZHVjZSB3b3JrZmxvdyBidW5kbGUgc2l6ZVxuLy8gQ29waWVkIGZyb20gdGVtcG9yYWwuYXBpLmVudW1zLnYxLlRpbWVvdXRUeXBlXG5leHBvcnQgZW51bSBUaW1lb3V0VHlwZSB7XG4gIFRJTUVPVVRfVFlQRV9VTlNQRUNJRklFRCA9IDAsXG4gIFRJTUVPVVRfVFlQRV9TVEFSVF9UT19DTE9TRSA9IDEsXG4gIFRJTUVPVVRfVFlQRV9TQ0hFRFVMRV9UT19TVEFSVCA9IDIsXG4gIFRJTUVPVVRfVFlQRV9TQ0hFRFVMRV9UT19DTE9TRSA9IDMsXG4gIFRJTUVPVVRfVFlQRV9IRUFSVEJFQVQgPSA0LFxufVxuXG5jaGVja0V4dGVuZHM8dGVtcG9yYWwuYXBpLmVudW1zLnYxLlRpbWVvdXRUeXBlLCBUaW1lb3V0VHlwZT4oKTtcbmNoZWNrRXh0ZW5kczxUaW1lb3V0VHlwZSwgdGVtcG9yYWwuYXBpLmVudW1zLnYxLlRpbWVvdXRUeXBlPigpO1xuXG4vLyBBdm9pZCBpbXBvcnRpbmcgdGhlIHByb3RvIGltcGxlbWVudGF0aW9uIHRvIHJlZHVjZSB3b3JrZmxvdyBidW5kbGUgc2l6ZVxuLy8gQ29waWVkIGZyb20gdGVtcG9yYWwuYXBpLmVudW1zLnYxLlJldHJ5U3RhdGVcbmV4cG9ydCBlbnVtIFJldHJ5U3RhdGUge1xuICBSRVRSWV9TVEFURV9VTlNQRUNJRklFRCA9IDAsXG4gIFJFVFJZX1NUQVRFX0lOX1BST0dSRVNTID0gMSxcbiAgUkVUUllfU1RBVEVfTk9OX1JFVFJZQUJMRV9GQUlMVVJFID0gMixcbiAgUkVUUllfU1RBVEVfVElNRU9VVCA9IDMsXG4gIFJFVFJZX1NUQVRFX01BWElNVU1fQVRURU1QVFNfUkVBQ0hFRCA9IDQsXG4gIFJFVFJZX1NUQVRFX1JFVFJZX1BPTElDWV9OT1RfU0VUID0gNSxcbiAgUkVUUllfU1RBVEVfSU5URVJOQUxfU0VSVkVSX0VSUk9SID0gNixcbiAgUkVUUllfU1RBVEVfQ0FOQ0VMX1JFUVVFU1RFRCA9IDcsXG59XG5cbmNoZWNrRXh0ZW5kczx0ZW1wb3JhbC5hcGkuZW51bXMudjEuUmV0cnlTdGF0ZSwgUmV0cnlTdGF0ZT4oKTtcbmNoZWNrRXh0ZW5kczxSZXRyeVN0YXRlLCB0ZW1wb3JhbC5hcGkuZW51bXMudjEuUmV0cnlTdGF0ZT4oKTtcblxuZXhwb3J0IHR5cGUgV29ya2Zsb3dFeGVjdXRpb24gPSB0ZW1wb3JhbC5hcGkuY29tbW9uLnYxLklXb3JrZmxvd0V4ZWN1dGlvbjtcblxuLyoqXG4gKiBSZXByZXNlbnRzIGZhaWx1cmVzIHRoYXQgY2FuIGNyb3NzIFdvcmtmbG93IGFuZCBBY3Rpdml0eSBib3VuZGFyaWVzLlxuICpcbiAqICoqTmV2ZXIgZXh0ZW5kIHRoaXMgY2xhc3Mgb3IgYW55IG9mIGl0cyBjaGlsZHJlbi4qKlxuICpcbiAqIFRoZSBvbmx5IGNoaWxkIGNsYXNzIHlvdSBzaG91bGQgZXZlciB0aHJvdyBmcm9tIHlvdXIgY29kZSBpcyB7QGxpbmsgQXBwbGljYXRpb25GYWlsdXJlfS5cbiAqL1xuQFN5bWJvbEJhc2VkSW5zdGFuY2VPZkVycm9yKCdUZW1wb3JhbEZhaWx1cmUnKVxuZXhwb3J0IGNsYXNzIFRlbXBvcmFsRmFpbHVyZSBleHRlbmRzIEVycm9yIHtcbiAgLyoqXG4gICAqIFRoZSBvcmlnaW5hbCBmYWlsdXJlIHRoYXQgY29uc3RydWN0ZWQgdGhpcyBlcnJvci5cbiAgICpcbiAgICogT25seSBwcmVzZW50IGlmIHRoaXMgZXJyb3Igd2FzIGdlbmVyYXRlZCBmcm9tIGFuIGV4dGVybmFsIG9wZXJhdGlvbi5cbiAgICovXG4gIHB1YmxpYyBmYWlsdXJlPzogUHJvdG9GYWlsdXJlO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIG1lc3NhZ2U/OiBzdHJpbmcgfCB1bmRlZmluZWQgfCBudWxsLFxuICAgIHB1YmxpYyByZWFkb25seSBjYXVzZT86IEVycm9yXG4gICkge1xuICAgIHN1cGVyKG1lc3NhZ2UgPz8gdW5kZWZpbmVkKTtcbiAgfVxufVxuXG4vKiogRXhjZXB0aW9ucyBvcmlnaW5hdGVkIGF0IHRoZSBUZW1wb3JhbCBzZXJ2aWNlLiAqL1xuQFN5bWJvbEJhc2VkSW5zdGFuY2VPZkVycm9yKCdTZXJ2ZXJGYWlsdXJlJylcbmV4cG9ydCBjbGFzcyBTZXJ2ZXJGYWlsdXJlIGV4dGVuZHMgVGVtcG9yYWxGYWlsdXJlIHtcbiAgY29uc3RydWN0b3IoXG4gICAgbWVzc2FnZTogc3RyaW5nIHwgdW5kZWZpbmVkLFxuICAgIHB1YmxpYyByZWFkb25seSBub25SZXRyeWFibGU6IGJvb2xlYW4sXG4gICAgY2F1c2U/OiBFcnJvclxuICApIHtcbiAgICBzdXBlcihtZXNzYWdlLCBjYXVzZSk7XG4gIH1cbn1cblxuLyoqXG4gKiBgQXBwbGljYXRpb25GYWlsdXJlYHMgYXJlIHVzZWQgdG8gY29tbXVuaWNhdGUgYXBwbGljYXRpb24tc3BlY2lmaWMgZmFpbHVyZXMgaW4gV29ya2Zsb3dzIGFuZCBBY3Rpdml0aWVzLlxuICpcbiAqIFRoZSB7QGxpbmsgdHlwZX0gcHJvcGVydHkgaXMgbWF0Y2hlZCBhZ2FpbnN0IHtAbGluayBSZXRyeVBvbGljeS5ub25SZXRyeWFibGVFcnJvclR5cGVzfSB0byBkZXRlcm1pbmUgaWYgYW4gaW5zdGFuY2VcbiAqIG9mIHRoaXMgZXJyb3IgaXMgcmV0cnlhYmxlLiBBbm90aGVyIHdheSB0byBhdm9pZCByZXRyeWluZyBpcyBieSBzZXR0aW5nIHRoZSB7QGxpbmsgbm9uUmV0cnlhYmxlfSBmbGFnIHRvIGB0cnVlYC5cbiAqXG4gKiBJbiBXb3JrZmxvd3MsIGlmIHlvdSB0aHJvdyBhIG5vbi1gQXBwbGljYXRpb25GYWlsdXJlYCwgdGhlIFdvcmtmbG93IFRhc2sgd2lsbCBmYWlsIGFuZCBiZSByZXRyaWVkLiBJZiB5b3UgdGhyb3cgYW5cbiAqIGBBcHBsaWNhdGlvbkZhaWx1cmVgLCB0aGUgV29ya2Zsb3cgRXhlY3V0aW9uIHdpbGwgZmFpbC5cbiAqXG4gKiBJbiBBY3Rpdml0aWVzLCB5b3UgY2FuIGVpdGhlciB0aHJvdyBhbiBgQXBwbGljYXRpb25GYWlsdXJlYCBvciBhbm90aGVyIGBFcnJvcmAgdG8gZmFpbCB0aGUgQWN0aXZpdHkgVGFzay4gSW4gdGhlXG4gKiBsYXR0ZXIgY2FzZSwgdGhlIGBFcnJvcmAgd2lsbCBiZSBjb252ZXJ0ZWQgdG8gYW4gYEFwcGxpY2F0aW9uRmFpbHVyZWAuIFRoZSBjb252ZXJzaW9uIGlzIGRvbmUgYXMgZm9sbG93aW5nOlxuICpcbiAqIC0gYHR5cGVgIGlzIHNldCB0byBgZXJyb3IuY29uc3RydWN0b3I/Lm5hbWUgPz8gZXJyb3IubmFtZWBcbiAqIC0gYG1lc3NhZ2VgIGlzIHNldCB0byBgZXJyb3IubWVzc2FnZWBcbiAqIC0gYG5vblJldHJ5YWJsZWAgaXMgc2V0IHRvIGZhbHNlXG4gKiAtIGBkZXRhaWxzYCBhcmUgc2V0IHRvIG51bGxcbiAqIC0gc3RhY2sgdHJhY2UgaXMgY29waWVkIGZyb20gdGhlIG9yaWdpbmFsIGVycm9yXG4gKlxuICogV2hlbiBhbiB7QGxpbmsgaHR0cHM6Ly9kb2NzLnRlbXBvcmFsLmlvL2NvbmNlcHRzL3doYXQtaXMtYW4tYWN0aXZpdHktZXhlY3V0aW9uIHwgQWN0aXZpdHkgRXhlY3V0aW9ufSBmYWlscywgdGhlXG4gKiBgQXBwbGljYXRpb25GYWlsdXJlYCBmcm9tIHRoZSBsYXN0IEFjdGl2aXR5IFRhc2sgd2lsbCBiZSB0aGUgYGNhdXNlYCBvZiB0aGUge0BsaW5rIEFjdGl2aXR5RmFpbHVyZX0gdGhyb3duIGluIHRoZVxuICogV29ya2Zsb3cuXG4gKi9cbkBTeW1ib2xCYXNlZEluc3RhbmNlT2ZFcnJvcignQXBwbGljYXRpb25GYWlsdXJlJylcbmV4cG9ydCBjbGFzcyBBcHBsaWNhdGlvbkZhaWx1cmUgZXh0ZW5kcyBUZW1wb3JhbEZhaWx1cmUge1xuICAvKipcbiAgICogQWx0ZXJuYXRpdmVseSwgdXNlIHtAbGluayBmcm9tRXJyb3J9IG9yIHtAbGluayBjcmVhdGV9LlxuICAgKi9cbiAgY29uc3RydWN0b3IoXG4gICAgbWVzc2FnZT86IHN0cmluZyB8IHVuZGVmaW5lZCB8IG51bGwsXG4gICAgcHVibGljIHJlYWRvbmx5IHR5cGU/OiBzdHJpbmcgfCB1bmRlZmluZWQgfCBudWxsLFxuICAgIHB1YmxpYyByZWFkb25seSBub25SZXRyeWFibGU/OiBib29sZWFuIHwgdW5kZWZpbmVkIHwgbnVsbCxcbiAgICBwdWJsaWMgcmVhZG9ubHkgZGV0YWlscz86IHVua25vd25bXSB8IHVuZGVmaW5lZCB8IG51bGwsXG4gICAgY2F1c2U/OiBFcnJvcixcbiAgICBwdWJsaWMgcmVhZG9ubHkgbmV4dFJldHJ5RGVsYXk/OiBEdXJhdGlvbiB8IHVuZGVmaW5lZCB8IG51bGxcbiAgKSB7XG4gICAgc3VwZXIobWVzc2FnZSwgY2F1c2UpO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyBgQXBwbGljYXRpb25GYWlsdXJlYCBmcm9tIGFuIEVycm9yIG9iamVjdC5cbiAgICpcbiAgICogRmlyc3QgY2FsbHMge0BsaW5rIGVuc3VyZUFwcGxpY2F0aW9uRmFpbHVyZSB8IGBlbnN1cmVBcHBsaWNhdGlvbkZhaWx1cmUoZXJyb3IpYH0gYW5kIHRoZW4gb3ZlcnJpZGVzIGFueSBmaWVsZHNcbiAgICogcHJvdmlkZWQgaW4gYG92ZXJyaWRlc2AuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGZyb21FcnJvcihlcnJvcjogRXJyb3IgfCB1bmtub3duLCBvdmVycmlkZXM/OiBBcHBsaWNhdGlvbkZhaWx1cmVPcHRpb25zKTogQXBwbGljYXRpb25GYWlsdXJlIHtcbiAgICBjb25zdCBmYWlsdXJlID0gZW5zdXJlQXBwbGljYXRpb25GYWlsdXJlKGVycm9yKTtcbiAgICBPYmplY3QuYXNzaWduKGZhaWx1cmUsIG92ZXJyaWRlcyk7XG4gICAgcmV0dXJuIGZhaWx1cmU7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIGEgbmV3IGBBcHBsaWNhdGlvbkZhaWx1cmVgLlxuICAgKlxuICAgKiBCeSBkZWZhdWx0LCB3aWxsIGJlIHJldHJ5YWJsZSAodW5sZXNzIGl0cyBgdHlwZWAgaXMgaW5jbHVkZWQgaW4ge0BsaW5rIFJldHJ5UG9saWN5Lm5vblJldHJ5YWJsZUVycm9yVHlwZXN9KS5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgY3JlYXRlKG9wdGlvbnM6IEFwcGxpY2F0aW9uRmFpbHVyZU9wdGlvbnMpOiBBcHBsaWNhdGlvbkZhaWx1cmUge1xuICAgIGNvbnN0IHsgbWVzc2FnZSwgdHlwZSwgbm9uUmV0cnlhYmxlID0gZmFsc2UsIGRldGFpbHMsIG5leHRSZXRyeURlbGF5LCBjYXVzZSB9ID0gb3B0aW9ucztcbiAgICByZXR1cm4gbmV3IHRoaXMobWVzc2FnZSwgdHlwZSwgbm9uUmV0cnlhYmxlLCBkZXRhaWxzLCBjYXVzZSwgbmV4dFJldHJ5RGVsYXkpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhIG5ldyBgQXBwbGljYXRpb25GYWlsdXJlYCB3aXRoIHRoZSB7QGxpbmsgbm9uUmV0cnlhYmxlfSBmbGFnIHNldCB0byBmYWxzZS4gTm90ZSB0aGF0IHRoaXMgZXJyb3Igd2lsbCBzdGlsbFxuICAgKiBub3QgYmUgcmV0cmllZCBpZiBpdHMgYHR5cGVgIGlzIGluY2x1ZGVkIGluIHtAbGluayBSZXRyeVBvbGljeS5ub25SZXRyeWFibGVFcnJvclR5cGVzfS5cbiAgICpcbiAgICogQHBhcmFtIG1lc3NhZ2UgT3B0aW9uYWwgZXJyb3IgbWVzc2FnZVxuICAgKiBAcGFyYW0gdHlwZSBPcHRpb25hbCBlcnJvciB0eXBlICh1c2VkIGJ5IHtAbGluayBSZXRyeVBvbGljeS5ub25SZXRyeWFibGVFcnJvclR5cGVzfSlcbiAgICogQHBhcmFtIGRldGFpbHMgT3B0aW9uYWwgZGV0YWlscyBhYm91dCB0aGUgZmFpbHVyZS4gU2VyaWFsaXplZCBieSB0aGUgV29ya2VyJ3Mge0BsaW5rIFBheWxvYWRDb252ZXJ0ZXJ9LlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyByZXRyeWFibGUobWVzc2FnZT86IHN0cmluZyB8IG51bGwsIHR5cGU/OiBzdHJpbmcgfCBudWxsLCAuLi5kZXRhaWxzOiB1bmtub3duW10pOiBBcHBsaWNhdGlvbkZhaWx1cmUge1xuICAgIHJldHVybiBuZXcgdGhpcyhtZXNzYWdlLCB0eXBlID8/ICdFcnJvcicsIGZhbHNlLCBkZXRhaWxzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYSBuZXcgYEFwcGxpY2F0aW9uRmFpbHVyZWAgd2l0aCB0aGUge0BsaW5rIG5vblJldHJ5YWJsZX0gZmxhZyBzZXQgdG8gdHJ1ZS5cbiAgICpcbiAgICogV2hlbiB0aHJvd24gZnJvbSBhbiBBY3Rpdml0eSBvciBXb3JrZmxvdywgdGhlIEFjdGl2aXR5IG9yIFdvcmtmbG93IHdpbGwgbm90IGJlIHJldHJpZWQgKGV2ZW4gaWYgYHR5cGVgIGlzIG5vdFxuICAgKiBsaXN0ZWQgaW4ge0BsaW5rIFJldHJ5UG9saWN5Lm5vblJldHJ5YWJsZUVycm9yVHlwZXN9KS5cbiAgICpcbiAgICogQHBhcmFtIG1lc3NhZ2UgT3B0aW9uYWwgZXJyb3IgbWVzc2FnZVxuICAgKiBAcGFyYW0gdHlwZSBPcHRpb25hbCBlcnJvciB0eXBlXG4gICAqIEBwYXJhbSBkZXRhaWxzIE9wdGlvbmFsIGRldGFpbHMgYWJvdXQgdGhlIGZhaWx1cmUuIFNlcmlhbGl6ZWQgYnkgdGhlIFdvcmtlcidzIHtAbGluayBQYXlsb2FkQ29udmVydGVyfS5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgbm9uUmV0cnlhYmxlKG1lc3NhZ2U/OiBzdHJpbmcgfCBudWxsLCB0eXBlPzogc3RyaW5nIHwgbnVsbCwgLi4uZGV0YWlsczogdW5rbm93bltdKTogQXBwbGljYXRpb25GYWlsdXJlIHtcbiAgICByZXR1cm4gbmV3IHRoaXMobWVzc2FnZSwgdHlwZSA/PyAnRXJyb3InLCB0cnVlLCBkZXRhaWxzKTtcbiAgfVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIEFwcGxpY2F0aW9uRmFpbHVyZU9wdGlvbnMge1xuICAvKipcbiAgICogRXJyb3IgbWVzc2FnZVxuICAgKi9cbiAgbWVzc2FnZT86IHN0cmluZztcblxuICAvKipcbiAgICogRXJyb3IgdHlwZSAodXNlZCBieSB7QGxpbmsgUmV0cnlQb2xpY3kubm9uUmV0cnlhYmxlRXJyb3JUeXBlc30pXG4gICAqL1xuICB0eXBlPzogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoZSBjdXJyZW50IEFjdGl2aXR5IG9yIFdvcmtmbG93IGNhbiBiZSByZXRyaWVkXG4gICAqXG4gICAqIEBkZWZhdWx0IGZhbHNlXG4gICAqL1xuICBub25SZXRyeWFibGU/OiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBEZXRhaWxzIGFib3V0IHRoZSBmYWlsdXJlLiBTZXJpYWxpemVkIGJ5IHRoZSBXb3JrZXIncyB7QGxpbmsgUGF5bG9hZENvbnZlcnRlcn0uXG4gICAqL1xuICBkZXRhaWxzPzogdW5rbm93bltdO1xuXG4gIC8qKlxuICAgKiBJZiBzZXQsIG92ZXJyaWRlcyB0aGUgZGVsYXkgdW50aWwgdGhlIG5leHQgcmV0cnkgb2YgdGhpcyBBY3Rpdml0eSAvIFdvcmtmbG93IFRhc2suXG4gICAqXG4gICAqIFJldHJ5IGF0dGVtcHRzIHdpbGwgc3RpbGwgYmUgc3ViamVjdCB0byB0aGUgbWF4aW11bSByZXRyaWVzIGxpbWl0IGFuZCB0b3RhbCB0aW1lIGxpbWl0IGRlZmluZWRcbiAgICogYnkgdGhlIHBvbGljeS5cbiAgICovXG4gIG5leHRSZXRyeURlbGF5PzogRHVyYXRpb247XG5cbiAgLyoqXG4gICAqIENhdXNlIG9mIHRoZSBmYWlsdXJlXG4gICAqL1xuICBjYXVzZT86IEVycm9yO1xufVxuXG4vKipcbiAqIFRoaXMgZXJyb3IgaXMgdGhyb3duIHdoZW4gQ2FuY2VsbGF0aW9uIGhhcyBiZWVuIHJlcXVlc3RlZC4gVG8gYWxsb3cgQ2FuY2VsbGF0aW9uIHRvIGhhcHBlbiwgbGV0IGl0IHByb3BhZ2F0ZS4gVG9cbiAqIGlnbm9yZSBDYW5jZWxsYXRpb24sIGNhdGNoIGl0IGFuZCBjb250aW51ZSBleGVjdXRpbmcuIE5vdGUgdGhhdCBDYW5jZWxsYXRpb24gY2FuIG9ubHkgYmUgcmVxdWVzdGVkIGEgc2luZ2xlIHRpbWUsIHNvXG4gKiB5b3VyIFdvcmtmbG93L0FjdGl2aXR5IEV4ZWN1dGlvbiB3aWxsIG5vdCByZWNlaXZlIGZ1cnRoZXIgQ2FuY2VsbGF0aW9uIHJlcXVlc3RzLlxuICpcbiAqIFdoZW4gYSBXb3JrZmxvdyBvciBBY3Rpdml0eSBoYXMgYmVlbiBzdWNjZXNzZnVsbHkgY2FuY2VsbGVkLCBhIGBDYW5jZWxsZWRGYWlsdXJlYCB3aWxsIGJlIHRoZSBgY2F1c2VgLlxuICovXG5AU3ltYm9sQmFzZWRJbnN0YW5jZU9mRXJyb3IoJ0NhbmNlbGxlZEZhaWx1cmUnKVxuZXhwb3J0IGNsYXNzIENhbmNlbGxlZEZhaWx1cmUgZXh0ZW5kcyBUZW1wb3JhbEZhaWx1cmUge1xuICBjb25zdHJ1Y3RvcihcbiAgICBtZXNzYWdlOiBzdHJpbmcgfCB1bmRlZmluZWQsXG4gICAgcHVibGljIHJlYWRvbmx5IGRldGFpbHM6IHVua25vd25bXSA9IFtdLFxuICAgIGNhdXNlPzogRXJyb3JcbiAgKSB7XG4gICAgc3VwZXIobWVzc2FnZSwgY2F1c2UpO1xuICB9XG59XG5cbi8qKlxuICogVXNlZCBhcyB0aGUgYGNhdXNlYCB3aGVuIGEgV29ya2Zsb3cgaGFzIGJlZW4gdGVybWluYXRlZFxuICovXG5AU3ltYm9sQmFzZWRJbnN0YW5jZU9mRXJyb3IoJ1Rlcm1pbmF0ZWRGYWlsdXJlJylcbmV4cG9ydCBjbGFzcyBUZXJtaW5hdGVkRmFpbHVyZSBleHRlbmRzIFRlbXBvcmFsRmFpbHVyZSB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2U6IHN0cmluZyB8IHVuZGVmaW5lZCwgY2F1c2U/OiBFcnJvcikge1xuICAgIHN1cGVyKG1lc3NhZ2UsIGNhdXNlKTtcbiAgfVxufVxuXG4vKipcbiAqIFVzZWQgdG8gcmVwcmVzZW50IHRpbWVvdXRzIG9mIEFjdGl2aXRpZXMgYW5kIFdvcmtmbG93c1xuICovXG5AU3ltYm9sQmFzZWRJbnN0YW5jZU9mRXJyb3IoJ1RpbWVvdXRGYWlsdXJlJylcbmV4cG9ydCBjbGFzcyBUaW1lb3V0RmFpbHVyZSBleHRlbmRzIFRlbXBvcmFsRmFpbHVyZSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIG1lc3NhZ2U6IHN0cmluZyB8IHVuZGVmaW5lZCxcbiAgICBwdWJsaWMgcmVhZG9ubHkgbGFzdEhlYXJ0YmVhdERldGFpbHM6IHVua25vd24sXG4gICAgcHVibGljIHJlYWRvbmx5IHRpbWVvdXRUeXBlOiBUaW1lb3V0VHlwZVxuICApIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgfVxufVxuXG4vKipcbiAqIENvbnRhaW5zIGluZm9ybWF0aW9uIGFib3V0IGFuIEFjdGl2aXR5IGZhaWx1cmUuIEFsd2F5cyBjb250YWlucyB0aGUgb3JpZ2luYWwgcmVhc29uIGZvciB0aGUgZmFpbHVyZSBhcyBpdHMgYGNhdXNlYC5cbiAqIEZvciBleGFtcGxlLCBpZiBhbiBBY3Rpdml0eSB0aW1lZCBvdXQsIHRoZSBjYXVzZSB3aWxsIGJlIGEge0BsaW5rIFRpbWVvdXRGYWlsdXJlfS5cbiAqXG4gKiBUaGlzIGV4Y2VwdGlvbiBpcyBleHBlY3RlZCB0byBiZSB0aHJvd24gb25seSBieSB0aGUgZnJhbWV3b3JrIGNvZGUuXG4gKi9cbkBTeW1ib2xCYXNlZEluc3RhbmNlT2ZFcnJvcignQWN0aXZpdHlGYWlsdXJlJylcbmV4cG9ydCBjbGFzcyBBY3Rpdml0eUZhaWx1cmUgZXh0ZW5kcyBUZW1wb3JhbEZhaWx1cmUge1xuICBwdWJsaWMgY29uc3RydWN0b3IoXG4gICAgbWVzc2FnZTogc3RyaW5nIHwgdW5kZWZpbmVkLFxuICAgIHB1YmxpYyByZWFkb25seSBhY3Rpdml0eVR5cGU6IHN0cmluZyxcbiAgICBwdWJsaWMgcmVhZG9ubHkgYWN0aXZpdHlJZDogc3RyaW5nIHwgdW5kZWZpbmVkLFxuICAgIHB1YmxpYyByZWFkb25seSByZXRyeVN0YXRlOiBSZXRyeVN0YXRlLFxuICAgIHB1YmxpYyByZWFkb25seSBpZGVudGl0eTogc3RyaW5nIHwgdW5kZWZpbmVkLFxuICAgIGNhdXNlPzogRXJyb3JcbiAgKSB7XG4gICAgc3VwZXIobWVzc2FnZSwgY2F1c2UpO1xuICB9XG59XG5cbi8qKlxuICogQ29udGFpbnMgaW5mb3JtYXRpb24gYWJvdXQgYSBDaGlsZCBXb3JrZmxvdyBmYWlsdXJlLiBBbHdheXMgY29udGFpbnMgdGhlIHJlYXNvbiBmb3IgdGhlIGZhaWx1cmUgYXMgaXRzIHtAbGluayBjYXVzZX0uXG4gKiBGb3IgZXhhbXBsZSwgaWYgdGhlIENoaWxkIHdhcyBUZXJtaW5hdGVkLCB0aGUgYGNhdXNlYCBpcyBhIHtAbGluayBUZXJtaW5hdGVkRmFpbHVyZX0uXG4gKlxuICogVGhpcyBleGNlcHRpb24gaXMgZXhwZWN0ZWQgdG8gYmUgdGhyb3duIG9ubHkgYnkgdGhlIGZyYW1ld29yayBjb2RlLlxuICovXG5AU3ltYm9sQmFzZWRJbnN0YW5jZU9mRXJyb3IoJ0NoaWxkV29ya2Zsb3dGYWlsdXJlJylcbmV4cG9ydCBjbGFzcyBDaGlsZFdvcmtmbG93RmFpbHVyZSBleHRlbmRzIFRlbXBvcmFsRmFpbHVyZSB7XG4gIHB1YmxpYyBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgcmVhZG9ubHkgbmFtZXNwYWNlOiBzdHJpbmcgfCB1bmRlZmluZWQsXG4gICAgcHVibGljIHJlYWRvbmx5IGV4ZWN1dGlvbjogV29ya2Zsb3dFeGVjdXRpb24sXG4gICAgcHVibGljIHJlYWRvbmx5IHdvcmtmbG93VHlwZTogc3RyaW5nLFxuICAgIHB1YmxpYyByZWFkb25seSByZXRyeVN0YXRlOiBSZXRyeVN0YXRlLFxuICAgIGNhdXNlPzogRXJyb3JcbiAgKSB7XG4gICAgc3VwZXIoJ0NoaWxkIFdvcmtmbG93IGV4ZWN1dGlvbiBmYWlsZWQnLCBjYXVzZSk7XG4gIH1cbn1cblxuLyoqXG4gKiBUaGlzIGV4Y2VwdGlvbiBpcyB0aHJvd24gaW4gdGhlIGZvbGxvd2luZyBjYXNlczpcbiAqICAtIFdvcmtmbG93IHdpdGggdGhlIHNhbWUgV29ya2Zsb3cgSWQgaXMgY3VycmVudGx5IHJ1bm5pbmdcbiAqICAtIFRoZXJlIGlzIGEgY2xvc2VkIFdvcmtmbG93IHdpdGggdGhlIHNhbWUgV29ya2Zsb3cgSWQgYW5kIHRoZSB7QGxpbmsgV29ya2Zsb3dPcHRpb25zLndvcmtmbG93SWRSZXVzZVBvbGljeX1cbiAqICAgIGlzIGBXT1JLRkxPV19JRF9SRVVTRV9QT0xJQ1lfUkVKRUNUX0RVUExJQ0FURWBcbiAqICAtIFRoZXJlIGlzIGNsb3NlZCBXb3JrZmxvdyBpbiB0aGUgYENvbXBsZXRlZGAgc3RhdGUgd2l0aCB0aGUgc2FtZSBXb3JrZmxvdyBJZCBhbmQgdGhlIHtAbGluayBXb3JrZmxvd09wdGlvbnMud29ya2Zsb3dJZFJldXNlUG9saWN5fVxuICogICAgaXMgYFdPUktGTE9XX0lEX1JFVVNFX1BPTElDWV9BTExPV19EVVBMSUNBVEVfRkFJTEVEX09OTFlgXG4gKi9cbkBTeW1ib2xCYXNlZEluc3RhbmNlT2ZFcnJvcignV29ya2Zsb3dFeGVjdXRpb25BbHJlYWR5U3RhcnRlZEVycm9yJylcbmV4cG9ydCBjbGFzcyBXb3JrZmxvd0V4ZWN1dGlvbkFscmVhZHlTdGFydGVkRXJyb3IgZXh0ZW5kcyBUZW1wb3JhbEZhaWx1cmUge1xuICBjb25zdHJ1Y3RvcihcbiAgICBtZXNzYWdlOiBzdHJpbmcsXG4gICAgcHVibGljIHJlYWRvbmx5IHdvcmtmbG93SWQ6IHN0cmluZyxcbiAgICBwdWJsaWMgcmVhZG9ubHkgd29ya2Zsb3dUeXBlOiBzdHJpbmdcbiAgKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gIH1cbn1cblxuLyoqXG4gKiBJZiBgZXJyb3JgIGlzIGFscmVhZHkgYW4gYEFwcGxpY2F0aW9uRmFpbHVyZWAsIHJldHVybnMgYGVycm9yYC5cbiAqXG4gKiBPdGhlcndpc2UsIGNvbnZlcnRzIGBlcnJvcmAgaW50byBhbiBgQXBwbGljYXRpb25GYWlsdXJlYCB3aXRoOlxuICpcbiAqIC0gYG1lc3NhZ2VgOiBgZXJyb3IubWVzc2FnZWAgb3IgYFN0cmluZyhlcnJvcilgXG4gKiAtIGB0eXBlYDogYGVycm9yLmNvbnN0cnVjdG9yLm5hbWVgIG9yIGBlcnJvci5uYW1lYFxuICogLSBgc3RhY2tgOiBgZXJyb3Iuc3RhY2tgIG9yIGAnJ2BcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVuc3VyZUFwcGxpY2F0aW9uRmFpbHVyZShlcnJvcjogdW5rbm93bik6IEFwcGxpY2F0aW9uRmFpbHVyZSB7XG4gIGlmIChlcnJvciBpbnN0YW5jZW9mIEFwcGxpY2F0aW9uRmFpbHVyZSkge1xuICAgIHJldHVybiBlcnJvcjtcbiAgfVxuXG4gIGNvbnN0IG1lc3NhZ2UgPSAoaXNSZWNvcmQoZXJyb3IpICYmIFN0cmluZyhlcnJvci5tZXNzYWdlKSkgfHwgU3RyaW5nKGVycm9yKTtcbiAgY29uc3QgdHlwZSA9IChpc1JlY29yZChlcnJvcikgJiYgKGVycm9yLmNvbnN0cnVjdG9yPy5uYW1lID8/IGVycm9yLm5hbWUpKSB8fCB1bmRlZmluZWQ7XG4gIGNvbnN0IGZhaWx1cmUgPSBBcHBsaWNhdGlvbkZhaWx1cmUuY3JlYXRlKHsgbWVzc2FnZSwgdHlwZSwgbm9uUmV0cnlhYmxlOiBmYWxzZSB9KTtcbiAgZmFpbHVyZS5zdGFjayA9IChpc1JlY29yZChlcnJvcikgJiYgU3RyaW5nKGVycm9yLnN0YWNrKSkgfHwgJyc7XG4gIHJldHVybiBmYWlsdXJlO1xufVxuXG4vKipcbiAqIElmIGBlcnJgIGlzIGFuIEVycm9yIGl0IGlzIHR1cm5lZCBpbnRvIGFuIGBBcHBsaWNhdGlvbkZhaWx1cmVgLlxuICpcbiAqIElmIGBlcnJgIHdhcyBhbHJlYWR5IGEgYFRlbXBvcmFsRmFpbHVyZWAsIHJldHVybnMgdGhlIG9yaWdpbmFsIGVycm9yLlxuICpcbiAqIE90aGVyd2lzZSByZXR1cm5zIGFuIGBBcHBsaWNhdGlvbkZhaWx1cmVgIHdpdGggYFN0cmluZyhlcnIpYCBhcyB0aGUgbWVzc2FnZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVuc3VyZVRlbXBvcmFsRmFpbHVyZShlcnI6IHVua25vd24pOiBUZW1wb3JhbEZhaWx1cmUge1xuICBpZiAoZXJyIGluc3RhbmNlb2YgVGVtcG9yYWxGYWlsdXJlKSB7XG4gICAgcmV0dXJuIGVycjtcbiAgfVxuICByZXR1cm4gZW5zdXJlQXBwbGljYXRpb25GYWlsdXJlKGVycik7XG59XG5cbi8qKlxuICogR2V0IHRoZSByb290IGNhdXNlIG1lc3NhZ2Ugb2YgZ2l2ZW4gYGVycm9yYC5cbiAqXG4gKiBJbiBjYXNlIGBlcnJvcmAgaXMgYSB7QGxpbmsgVGVtcG9yYWxGYWlsdXJlfSwgcmVjdXJzZSB0aGUgYGNhdXNlYCBjaGFpbiBhbmQgcmV0dXJuIHRoZSByb290IGBjYXVzZS5tZXNzYWdlYC5cbiAqIE90aGVyd2lzZSwgcmV0dXJuIGBlcnJvci5tZXNzYWdlYC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJvb3RDYXVzZShlcnJvcjogdW5rbm93bik6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gIGlmIChlcnJvciBpbnN0YW5jZW9mIFRlbXBvcmFsRmFpbHVyZSkge1xuICAgIHJldHVybiBlcnJvci5jYXVzZSA/IHJvb3RDYXVzZShlcnJvci5jYXVzZSkgOiBlcnJvci5tZXNzYWdlO1xuICB9XG4gIHJldHVybiBlcnJvck1lc3NhZ2UoZXJyb3IpO1xufVxuIiwiLyoqXG4gKiBDb21tb24gbGlicmFyeSBmb3IgY29kZSB0aGF0J3MgdXNlZCBhY3Jvc3MgdGhlIENsaWVudCwgV29ya2VyLCBhbmQvb3IgV29ya2Zsb3dcbiAqXG4gKiBAbW9kdWxlXG4gKi9cblxuaW1wb3J0ICogYXMgZW5jb2RpbmcgZnJvbSAnLi9lbmNvZGluZyc7XG5pbXBvcnQgKiBhcyBoZWxwZXJzIGZyb20gJy4vdHlwZS1oZWxwZXJzJztcblxuZXhwb3J0ICogZnJvbSAnLi9hY3Rpdml0eS1vcHRpb25zJztcbmV4cG9ydCAqIGZyb20gJy4vY29udmVydGVyL2RhdGEtY29udmVydGVyJztcbmV4cG9ydCAqIGZyb20gJy4vY29udmVydGVyL2ZhaWx1cmUtY29udmVydGVyJztcbmV4cG9ydCAqIGZyb20gJy4vY29udmVydGVyL3BheWxvYWQtY29kZWMnO1xuZXhwb3J0ICogZnJvbSAnLi9jb252ZXJ0ZXIvcGF5bG9hZC1jb252ZXJ0ZXInO1xuZXhwb3J0ICogZnJvbSAnLi9jb252ZXJ0ZXIvdHlwZXMnO1xuZXhwb3J0ICogZnJvbSAnLi9kZXByZWNhdGVkLXRpbWUnO1xuZXhwb3J0ICogZnJvbSAnLi9lcnJvcnMnO1xuZXhwb3J0ICogZnJvbSAnLi9mYWlsdXJlJztcbmV4cG9ydCB7IEhlYWRlcnMsIE5leHQgfSBmcm9tICcuL2ludGVyY2VwdG9ycyc7XG5leHBvcnQgKiBmcm9tICcuL2ludGVyZmFjZXMnO1xuZXhwb3J0ICogZnJvbSAnLi9sb2dnZXInO1xuZXhwb3J0ICogZnJvbSAnLi9yZXRyeS1wb2xpY3knO1xuZXhwb3J0IHR5cGUgeyBUaW1lc3RhbXAsIER1cmF0aW9uLCBTdHJpbmdWYWx1ZSB9IGZyb20gJy4vdGltZSc7XG5leHBvcnQgKiBmcm9tICcuL3dvcmtmbG93LWhhbmRsZSc7XG5leHBvcnQgKiBmcm9tICcuL3dvcmtmbG93LW9wdGlvbnMnO1xuZXhwb3J0ICogZnJvbSAnLi92ZXJzaW9uaW5nLWludGVudCc7XG5cbi8qKlxuICogRW5jb2RlIGEgVVRGLTggc3RyaW5nIGludG8gYSBVaW50OEFycmF5XG4gKlxuICogQGhpZGRlblxuICogQGRlcHJlY2F0ZWQgLSBtZWFudCBmb3IgaW50ZXJuYWwgdXNlIG9ubHlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHU4KHM6IHN0cmluZyk6IFVpbnQ4QXJyYXkge1xuICByZXR1cm4gZW5jb2RpbmcuZW5jb2RlKHMpO1xufVxuXG4vKipcbiAqIERlY29kZSBhIFVpbnQ4QXJyYXkgaW50byBhIFVURi04IHN0cmluZ1xuICpcbiAqIEBoaWRkZW5cbiAqIEBkZXByZWNhdGVkIC0gbWVhbnQgZm9yIGludGVybmFsIHVzZSBvbmx5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdHIoYXJyOiBVaW50OEFycmF5KTogc3RyaW5nIHtcbiAgcmV0dXJuIGVuY29kaW5nLmRlY29kZShhcnIpO1xufVxuXG4vKipcbiAqIEdldCBgZXJyb3IubWVzc2FnZWAgKG9yIGB1bmRlZmluZWRgIGlmIG5vdCBwcmVzZW50KVxuICpcbiAqIEBoaWRkZW5cbiAqIEBkZXByZWNhdGVkIC0gbWVhbnQgZm9yIGludGVybmFsIHVzZSBvbmx5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlcnJvck1lc3NhZ2UoZXJyb3I6IHVua25vd24pOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuICByZXR1cm4gaGVscGVycy5lcnJvck1lc3NhZ2UoZXJyb3IpO1xufVxuXG4vKipcbiAqIEdldCBgZXJyb3IuY29kZWAgKG9yIGB1bmRlZmluZWRgIGlmIG5vdCBwcmVzZW50KVxuICpcbiAqIEBoaWRkZW5cbiAqIEBkZXByZWNhdGVkIC0gbWVhbnQgZm9yIGludGVybmFsIHVzZSBvbmx5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlcnJvckNvZGUoZXJyb3I6IHVua25vd24pOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuICByZXR1cm4gaGVscGVycy5lcnJvckNvZGUoZXJyb3IpO1xufVxuIiwiaW1wb3J0IHsgQW55RnVuYywgT21pdExhc3RQYXJhbSB9IGZyb20gJy4vdHlwZS1oZWxwZXJzJztcbmltcG9ydCB7IFBheWxvYWQgfSBmcm9tICcuL2ludGVyZmFjZXMnO1xuXG4vKipcbiAqIFR5cGUgb2YgdGhlIG5leHQgZnVuY3Rpb24gZm9yIGEgZ2l2ZW4gaW50ZXJjZXB0b3IgZnVuY3Rpb25cbiAqXG4gKiBDYWxsZWQgZnJvbSBhbiBpbnRlcmNlcHRvciB0byBjb250aW51ZSB0aGUgaW50ZXJjZXB0aW9uIGNoYWluXG4gKi9cbmV4cG9ydCB0eXBlIE5leHQ8SUYsIEZOIGV4dGVuZHMga2V5b2YgSUY+ID0gUmVxdWlyZWQ8SUY+W0ZOXSBleHRlbmRzIEFueUZ1bmMgPyBPbWl0TGFzdFBhcmFtPFJlcXVpcmVkPElGPltGTl0+IDogbmV2ZXI7XG5cbi8qKiBIZWFkZXJzIGFyZSBqdXN0IGEgbWFwcGluZyBvZiBoZWFkZXIgbmFtZSB0byBQYXlsb2FkICovXG5leHBvcnQgdHlwZSBIZWFkZXJzID0gUmVjb3JkPHN0cmluZywgUGF5bG9hZD47XG5cbi8qKlxuICogQ29tcG9zZSBhbGwgaW50ZXJjZXB0b3IgbWV0aG9kcyBpbnRvIGEgc2luZ2xlIGZ1bmN0aW9uLlxuICpcbiAqIENhbGxpbmcgdGhlIGNvbXBvc2VkIGZ1bmN0aW9uIHJlc3VsdHMgaW4gY2FsbGluZyBlYWNoIG9mIHRoZSBwcm92aWRlZCBpbnRlcmNlcHRvciwgaW4gb3JkZXIgKGZyb20gdGhlIGZpcnN0IHRvXG4gKiB0aGUgbGFzdCksIGZvbGxvd2VkIGJ5IHRoZSBvcmlnaW5hbCBmdW5jdGlvbiBwcm92aWRlZCBhcyBhcmd1bWVudCB0byBgY29tcG9zZUludGVyY2VwdG9ycygpYC5cbiAqXG4gKiBAcGFyYW0gaW50ZXJjZXB0b3JzIGEgbGlzdCBvZiBpbnRlcmNlcHRvcnNcbiAqIEBwYXJhbSBtZXRob2QgdGhlIG5hbWUgb2YgdGhlIGludGVyY2VwdG9yIG1ldGhvZCB0byBjb21wb3NlXG4gKiBAcGFyYW0gbmV4dCB0aGUgb3JpZ2luYWwgZnVuY3Rpb24gdG8gYmUgZXhlY3V0ZWQgYXQgdGhlIGVuZCBvZiB0aGUgaW50ZXJjZXB0aW9uIGNoYWluXG4gKi9cbi8vIHRzLXBydW5lLWlnbm9yZS1uZXh0IChpbXBvcnRlZCB2aWEgbGliL2ludGVyY2VwdG9ycylcbmV4cG9ydCBmdW5jdGlvbiBjb21wb3NlSW50ZXJjZXB0b3JzPEksIE0gZXh0ZW5kcyBrZXlvZiBJPihpbnRlcmNlcHRvcnM6IElbXSwgbWV0aG9kOiBNLCBuZXh0OiBOZXh0PEksIE0+KTogTmV4dDxJLCBNPiB7XG4gIGZvciAobGV0IGkgPSBpbnRlcmNlcHRvcnMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICBjb25zdCBpbnRlcmNlcHRvciA9IGludGVyY2VwdG9yc1tpXTtcbiAgICBpZiAoaW50ZXJjZXB0b3JbbWV0aG9kXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBjb25zdCBwcmV2ID0gbmV4dDtcbiAgICAgIC8vIFdlIGxvc2UgdHlwZSBzYWZldHkgaGVyZSBiZWNhdXNlIFR5cGVzY3JpcHQgY2FuJ3QgZGVkdWNlIHRoYXQgaW50ZXJjZXB0b3JbbWV0aG9kXSBpcyBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJuc1xuICAgICAgLy8gdGhlIHNhbWUgdHlwZSBhcyBOZXh0PEksIE0+XG4gICAgICBuZXh0ID0gKChpbnB1dDogYW55KSA9PiAoaW50ZXJjZXB0b3JbbWV0aG9kXSBhcyBhbnkpKGlucHV0LCBwcmV2KSkgYXMgYW55O1xuICAgIH1cbiAgfVxuICByZXR1cm4gbmV4dDtcbn1cbiIsImltcG9ydCB0eXBlIHsgdGVtcG9yYWwgfSBmcm9tICdAdGVtcG9yYWxpby9wcm90byc7XG5cbmV4cG9ydCB0eXBlIFBheWxvYWQgPSB0ZW1wb3JhbC5hcGkuY29tbW9uLnYxLklQYXlsb2FkO1xuXG4vKiogVHlwZSB0aGF0IGNhbiBiZSByZXR1cm5lZCBmcm9tIGEgV29ya2Zsb3cgYGV4ZWN1dGVgIGZ1bmN0aW9uICovXG5leHBvcnQgdHlwZSBXb3JrZmxvd1JldHVyblR5cGUgPSBQcm9taXNlPGFueT47XG5leHBvcnQgdHlwZSBXb3JrZmxvd1VwZGF0ZVR5cGUgPSAoLi4uYXJnczogYW55W10pID0+IFByb21pc2U8YW55PiB8IGFueTtcbmV4cG9ydCB0eXBlIFdvcmtmbG93VXBkYXRlVmFsaWRhdG9yVHlwZSA9ICguLi5hcmdzOiBhbnlbXSkgPT4gdm9pZDtcbmV4cG9ydCB0eXBlIFdvcmtmbG93VXBkYXRlQW5ub3RhdGVkVHlwZSA9IHtcbiAgaGFuZGxlcjogV29ya2Zsb3dVcGRhdGVUeXBlO1xuICB1bmZpbmlzaGVkUG9saWN5OiBIYW5kbGVyVW5maW5pc2hlZFBvbGljeTtcbiAgdmFsaWRhdG9yPzogV29ya2Zsb3dVcGRhdGVWYWxpZGF0b3JUeXBlO1xuICBkZXNjcmlwdGlvbj86IHN0cmluZztcbn07XG5leHBvcnQgdHlwZSBXb3JrZmxvd1NpZ25hbFR5cGUgPSAoLi4uYXJnczogYW55W10pID0+IFByb21pc2U8dm9pZD4gfCB2b2lkO1xuZXhwb3J0IHR5cGUgV29ya2Zsb3dTaWduYWxBbm5vdGF0ZWRUeXBlID0ge1xuICBoYW5kbGVyOiBXb3JrZmxvd1NpZ25hbFR5cGU7XG4gIHVuZmluaXNoZWRQb2xpY3k6IEhhbmRsZXJVbmZpbmlzaGVkUG9saWN5O1xuICBkZXNjcmlwdGlvbj86IHN0cmluZztcbn07XG5leHBvcnQgdHlwZSBXb3JrZmxvd1F1ZXJ5VHlwZSA9ICguLi5hcmdzOiBhbnlbXSkgPT4gYW55O1xuZXhwb3J0IHR5cGUgV29ya2Zsb3dRdWVyeUFubm90YXRlZFR5cGUgPSB7IGhhbmRsZXI6IFdvcmtmbG93UXVlcnlUeXBlOyBkZXNjcmlwdGlvbj86IHN0cmluZyB9O1xuXG4vKipcbiAqIEJyb2FkIFdvcmtmbG93IGZ1bmN0aW9uIGRlZmluaXRpb24sIHNwZWNpZmljIFdvcmtmbG93cyB3aWxsIHR5cGljYWxseSB1c2UgYSBuYXJyb3dlciB0eXBlIGRlZmluaXRpb24sIGUuZzpcbiAqIGBgYHRzXG4gKiBleHBvcnQgYXN5bmMgZnVuY3Rpb24gbXlXb3JrZmxvdyhhcmcxOiBudW1iZXIsIGFyZzI6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPjtcbiAqIGBgYFxuICovXG5leHBvcnQgdHlwZSBXb3JrZmxvdyA9ICguLi5hcmdzOiBhbnlbXSkgPT4gV29ya2Zsb3dSZXR1cm5UeXBlO1xuXG5kZWNsYXJlIGNvbnN0IGFyZ3NCcmFuZDogdW5pcXVlIHN5bWJvbDtcbmRlY2xhcmUgY29uc3QgcmV0QnJhbmQ6IHVuaXF1ZSBzeW1ib2w7XG5cbi8qKlxuICogQW4gaW50ZXJmYWNlIHJlcHJlc2VudGluZyBhIFdvcmtmbG93IHVwZGF0ZSBkZWZpbml0aW9uLCBhcyByZXR1cm5lZCBmcm9tIHtAbGluayBkZWZpbmVVcGRhdGV9XG4gKlxuICogQHJlbWFya3MgYEFyZ3NgIGNhbiBiZSB1c2VkIGZvciBwYXJhbWV0ZXIgdHlwZSBpbmZlcmVuY2UgaW4gaGFuZGxlciBmdW5jdGlvbnMgYW5kIFdvcmtmbG93SGFuZGxlIG1ldGhvZHMuXG4gKiBgTmFtZWAgY2FuIG9wdGlvbmFsbHkgYmUgc3BlY2lmaWVkIHdpdGggYSBzdHJpbmcgbGl0ZXJhbCB0eXBlIHRvIHByZXNlcnZlIHR5cGUtbGV2ZWwga25vd2xlZGdlIG9mIHRoZSB1cGRhdGUgbmFtZS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBVcGRhdGVEZWZpbml0aW9uPFJldCwgQXJncyBleHRlbmRzIGFueVtdID0gW10sIE5hbWUgZXh0ZW5kcyBzdHJpbmcgPSBzdHJpbmc+IHtcbiAgdHlwZTogJ3VwZGF0ZSc7XG4gIG5hbWU6IE5hbWU7XG4gIC8qKlxuICAgKiBWaXJ0dWFsIHR5cGUgYnJhbmQgdG8gbWFpbnRhaW4gYSBkaXN0aW5jdGlvbiBiZXR3ZWVuIHtAbGluayBVcGRhdGVEZWZpbml0aW9ufSB0eXBlcyB3aXRoIGRpZmZlcmVudCBhcmdzLlxuICAgKiBUaGlzIGZpZWxkIGlzIG5vdCBwcmVzZW50IGF0IHJ1bi10aW1lLlxuICAgKi9cbiAgW2FyZ3NCcmFuZF06IEFyZ3M7XG4gIC8qKlxuICAgKiBWaXJ0dWFsIHR5cGUgYnJhbmQgdG8gbWFpbnRhaW4gYSBkaXN0aW5jdGlvbiBiZXR3ZWVuIHtAbGluayBVcGRhdGVEZWZpbml0aW9ufSB0eXBlcyB3aXRoIGRpZmZlcmVudCByZXR1cm4gdHlwZXMuXG4gICAqIFRoaXMgZmllbGQgaXMgbm90IHByZXNlbnQgYXQgcnVuLXRpbWUuXG4gICAqL1xuICBbcmV0QnJhbmRdOiBSZXQ7XG59XG5cbi8qKlxuICogQW4gaW50ZXJmYWNlIHJlcHJlc2VudGluZyBhIFdvcmtmbG93IHNpZ25hbCBkZWZpbml0aW9uLCBhcyByZXR1cm5lZCBmcm9tIHtAbGluayBkZWZpbmVTaWduYWx9XG4gKlxuICogQHJlbWFya3MgYEFyZ3NgIGNhbiBiZSB1c2VkIGZvciBwYXJhbWV0ZXIgdHlwZSBpbmZlcmVuY2UgaW4gaGFuZGxlciBmdW5jdGlvbnMgYW5kIFdvcmtmbG93SGFuZGxlIG1ldGhvZHMuXG4gKiBgTmFtZWAgY2FuIG9wdGlvbmFsbHkgYmUgc3BlY2lmaWVkIHdpdGggYSBzdHJpbmcgbGl0ZXJhbCB0eXBlIHRvIHByZXNlcnZlIHR5cGUtbGV2ZWwga25vd2xlZGdlIG9mIHRoZSBzaWduYWwgbmFtZS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBTaWduYWxEZWZpbml0aW9uPEFyZ3MgZXh0ZW5kcyBhbnlbXSA9IFtdLCBOYW1lIGV4dGVuZHMgc3RyaW5nID0gc3RyaW5nPiB7XG4gIHR5cGU6ICdzaWduYWwnO1xuICBuYW1lOiBOYW1lO1xuICAvKipcbiAgICogVmlydHVhbCB0eXBlIGJyYW5kIHRvIG1haW50YWluIGEgZGlzdGluY3Rpb24gYmV0d2VlbiB7QGxpbmsgU2lnbmFsRGVmaW5pdGlvbn0gdHlwZXMgd2l0aCBkaWZmZXJlbnQgYXJncy5cbiAgICogVGhpcyBmaWVsZCBpcyBub3QgcHJlc2VudCBhdCBydW4tdGltZS5cbiAgICovXG4gIFthcmdzQnJhbmRdOiBBcmdzO1xufVxuXG4vKipcbiAqIEFuIGludGVyZmFjZSByZXByZXNlbnRpbmcgYSBXb3JrZmxvdyBxdWVyeSBkZWZpbml0aW9uIGFzIHJldHVybmVkIGZyb20ge0BsaW5rIGRlZmluZVF1ZXJ5fVxuICpcbiAqIEByZW1hcmtzIGBBcmdzYCBhbmQgYFJldGAgY2FuIGJlIHVzZWQgZm9yIHBhcmFtZXRlciB0eXBlIGluZmVyZW5jZSBpbiBoYW5kbGVyIGZ1bmN0aW9ucyBhbmQgV29ya2Zsb3dIYW5kbGUgbWV0aG9kcy5cbiAqIGBOYW1lYCBjYW4gb3B0aW9uYWxseSBiZSBzcGVjaWZpZWQgd2l0aCBhIHN0cmluZyBsaXRlcmFsIHR5cGUgdG8gcHJlc2VydmUgdHlwZS1sZXZlbCBrbm93bGVkZ2Ugb2YgdGhlIHF1ZXJ5IG5hbWUuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUXVlcnlEZWZpbml0aW9uPFJldCwgQXJncyBleHRlbmRzIGFueVtdID0gW10sIE5hbWUgZXh0ZW5kcyBzdHJpbmcgPSBzdHJpbmc+IHtcbiAgdHlwZTogJ3F1ZXJ5JztcbiAgbmFtZTogTmFtZTtcbiAgLyoqXG4gICAqIFZpcnR1YWwgdHlwZSBicmFuZCB0byBtYWludGFpbiBhIGRpc3RpbmN0aW9uIGJldHdlZW4ge0BsaW5rIFF1ZXJ5RGVmaW5pdGlvbn0gdHlwZXMgd2l0aCBkaWZmZXJlbnQgYXJncy5cbiAgICogVGhpcyBmaWVsZCBpcyBub3QgcHJlc2VudCBhdCBydW4tdGltZS5cbiAgICovXG4gIFthcmdzQnJhbmRdOiBBcmdzO1xuICAvKipcbiAgICogVmlydHVhbCB0eXBlIGJyYW5kIHRvIG1haW50YWluIGEgZGlzdGluY3Rpb24gYmV0d2VlbiB7QGxpbmsgUXVlcnlEZWZpbml0aW9ufSB0eXBlcyB3aXRoIGRpZmZlcmVudCByZXR1cm4gdHlwZXMuXG4gICAqIFRoaXMgZmllbGQgaXMgbm90IHByZXNlbnQgYXQgcnVuLXRpbWUuXG4gICAqL1xuICBbcmV0QnJhbmRdOiBSZXQ7XG59XG5cbi8qKiBHZXQgdGhlIFwidW53cmFwcGVkXCIgcmV0dXJuIHR5cGUgKHdpdGhvdXQgUHJvbWlzZSkgb2YgdGhlIGV4ZWN1dGUgaGFuZGxlciBmcm9tIFdvcmtmbG93IHR5cGUgYFdgICovXG5leHBvcnQgdHlwZSBXb3JrZmxvd1Jlc3VsdFR5cGU8VyBleHRlbmRzIFdvcmtmbG93PiA9IFJldHVyblR5cGU8Vz4gZXh0ZW5kcyBQcm9taXNlPGluZmVyIFI+ID8gUiA6IG5ldmVyO1xuXG4vKipcbiAqIElmIGFub3RoZXIgU0RLIGNyZWF0ZXMgYSBTZWFyY2ggQXR0cmlidXRlIHRoYXQncyBub3QgYW4gYXJyYXksIHdlIHdyYXAgaXQgaW4gYW4gYXJyYXkuXG4gKlxuICogRGF0ZXMgYXJlIHNlcmlhbGl6ZWQgYXMgSVNPIHN0cmluZ3MuXG4gKi9cbmV4cG9ydCB0eXBlIFNlYXJjaEF0dHJpYnV0ZXMgPSBSZWNvcmQ8c3RyaW5nLCBTZWFyY2hBdHRyaWJ1dGVWYWx1ZSB8IFJlYWRvbmx5PFNlYXJjaEF0dHJpYnV0ZVZhbHVlPiB8IHVuZGVmaW5lZD47XG5leHBvcnQgdHlwZSBTZWFyY2hBdHRyaWJ1dGVWYWx1ZSA9IHN0cmluZ1tdIHwgbnVtYmVyW10gfCBib29sZWFuW10gfCBEYXRlW107XG5cbmV4cG9ydCBpbnRlcmZhY2UgQWN0aXZpdHlGdW5jdGlvbjxQIGV4dGVuZHMgYW55W10gPSBhbnlbXSwgUiA9IGFueT4ge1xuICAoLi4uYXJnczogUCk6IFByb21pc2U8Uj47XG59XG5cbi8qKlxuICogTWFwcGluZyBvZiBBY3Rpdml0eSBuYW1lIHRvIGZ1bmN0aW9uXG4gKiBAZGVwcmVjYXRlZCBub3QgcmVxdWlyZWQgYW55bW9yZSwgZm9yIHVudHlwZWQgYWN0aXZpdGllcyB1c2Uge0BsaW5rIFVudHlwZWRBY3Rpdml0aWVzfVxuICovXG5leHBvcnQgdHlwZSBBY3Rpdml0eUludGVyZmFjZSA9IFJlY29yZDxzdHJpbmcsIEFjdGl2aXR5RnVuY3Rpb24+O1xuXG4vKipcbiAqIE1hcHBpbmcgb2YgQWN0aXZpdHkgbmFtZSB0byBmdW5jdGlvblxuICovXG5leHBvcnQgdHlwZSBVbnR5cGVkQWN0aXZpdGllcyA9IFJlY29yZDxzdHJpbmcsIEFjdGl2aXR5RnVuY3Rpb24+O1xuXG4vKipcbiAqIEEgd29ya2Zsb3cncyBoaXN0b3J5IGFuZCBJRC4gVXNlZnVsIGZvciByZXBsYXkuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgSGlzdG9yeUFuZFdvcmtmbG93SWQge1xuICB3b3JrZmxvd0lkOiBzdHJpbmc7XG4gIGhpc3Rvcnk6IHRlbXBvcmFsLmFwaS5oaXN0b3J5LnYxLkhpc3RvcnkgfCB1bmtub3duIHwgdW5kZWZpbmVkO1xufVxuXG4vKipcbiAqIFBvbGljeSBkZWZpbmluZyBhY3Rpb25zIHRha2VuIHdoZW4gYSB3b3JrZmxvdyBleGl0cyB3aGlsZSB1cGRhdGUgb3Igc2lnbmFsIGhhbmRsZXJzIGFyZSBydW5uaW5nLlxuICogVGhlIHdvcmtmbG93IGV4aXQgbWF5IGJlIGR1ZSB0byBzdWNjZXNzZnVsIHJldHVybiwgZmFpbHVyZSwgY2FuY2VsbGF0aW9uLCBvciBjb250aW51ZS1hcy1uZXcuXG4gKi9cbmV4cG9ydCBlbnVtIEhhbmRsZXJVbmZpbmlzaGVkUG9saWN5IHtcbiAgLyoqXG4gICAqIElzc3VlIGEgd2FybmluZyBpbiBhZGRpdGlvbiB0byBhYmFuZG9uaW5nIHRoZSBoYW5kbGVyIGV4ZWN1dGlvbi4gVGhlIHdhcm5pbmcgd2lsbCBub3QgYmUgaXNzdWVkIGlmIHRoZSB3b3JrZmxvdyBmYWlscy5cbiAgICovXG4gIFdBUk5fQU5EX0FCQU5ET04gPSAxLFxuXG4gIC8qKlxuICAgKiBBYmFuZG9uIHRoZSBoYW5kbGVyIGV4ZWN1dGlvbi5cbiAgICpcbiAgICogSW4gdGhlIGNhc2Ugb2YgYW4gdXBkYXRlIGhhbmRsZXIgdGhpcyBtZWFucyB0aGF0IHRoZSBjbGllbnQgd2lsbCByZWNlaXZlIGFuIGVycm9yIHJhdGhlciB0aGFuXG4gICAqIHRoZSB1cGRhdGUgcmVzdWx0LlxuICAgKi9cbiAgQUJBTkRPTiA9IDIsXG59XG4iLCJleHBvcnQgdHlwZSBMb2dMZXZlbCA9ICdUUkFDRScgfCAnREVCVUcnIHwgJ0lORk8nIHwgJ1dBUk4nIHwgJ0VSUk9SJztcblxuZXhwb3J0IHR5cGUgTG9nTWV0YWRhdGEgPSBSZWNvcmQ8c3RyaW5nIHwgc3ltYm9sLCBhbnk+O1xuXG4vKipcbiAqIEltcGxlbWVudCB0aGlzIGludGVyZmFjZSBpbiBvcmRlciB0byBjdXN0b21pemUgd29ya2VyIGxvZ2dpbmdcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBMb2dnZXIge1xuICBsb2cobGV2ZWw6IExvZ0xldmVsLCBtZXNzYWdlOiBzdHJpbmcsIG1ldGE/OiBMb2dNZXRhZGF0YSk6IGFueTtcbiAgdHJhY2UobWVzc2FnZTogc3RyaW5nLCBtZXRhPzogTG9nTWV0YWRhdGEpOiBhbnk7XG4gIGRlYnVnKG1lc3NhZ2U6IHN0cmluZywgbWV0YT86IExvZ01ldGFkYXRhKTogYW55O1xuICBpbmZvKG1lc3NhZ2U6IHN0cmluZywgbWV0YT86IExvZ01ldGFkYXRhKTogYW55O1xuICB3YXJuKG1lc3NhZ2U6IHN0cmluZywgbWV0YT86IExvZ01ldGFkYXRhKTogYW55O1xuICBlcnJvcihtZXNzYWdlOiBzdHJpbmcsIG1ldGE/OiBMb2dNZXRhZGF0YSk6IGFueTtcbn1cblxuLyoqXG4gKiBQb3NzaWJsZSB2YWx1ZXMgb2YgdGhlIGBzZGtDb21wb25lbnRgIG1ldGEgYXR0cmlidXRlcyBvbiBsb2cgbWVzc2FnZXMuIFRoaXNcbiAqIGF0dHJpYnV0ZSBpbmRpY2F0ZXMgd2hpY2ggc3Vic3lzdGVtIGVtaXR0ZWQgdGhlIGxvZyBtZXNzYWdlOyB0aGlzIG1heSBmb3JcbiAqIGV4YW1wbGUgYmUgdXNlZCB0byBpbXBsZW1lbnQgZmluZS1ncmFpbmVkIGZpbHRlcmluZyBvZiBsb2cgbWVzc2FnZXMuXG4gKlxuICogTm90ZSB0aGF0IHRoZXJlIGlzIG5vIGd1YXJhbnRlZSB0aGF0IHRoaXMgbGlzdCB3aWxsIHJlbWFpbiBzdGFibGUgaW4gdGhlXG4gKiBmdXR1cmU7IHZhbHVlcyBtYXkgYmUgYWRkZWQgb3IgcmVtb3ZlZCwgYW5kIG1lc3NhZ2VzIHRoYXQgYXJlIGN1cnJlbnRseVxuICogZW1pdHRlZCB3aXRoIHNvbWUgYHNka0NvbXBvbmVudGAgdmFsdWUgbWF5IHVzZSBhIGRpZmZlcmVudCB2YWx1ZSBpbiB0aGUgZnV0dXJlLlxuICovXG5leHBvcnQgZW51bSBTZGtDb21wb25lbnQge1xuICAvKipcbiAgICogQ29tcG9uZW50IG5hbWUgZm9yIG1lc3NhZ2VzIGVtaXRlZCBmcm9tIFdvcmtmbG93IGNvZGUsIHVzaW5nIHRoZSB7QGxpbmsgV29ya2Zsb3cgY29udGV4dCBsb2dnZXJ8d29ya2Zsb3cubG9nfS5cbiAgICogVGhlIFNESyBpdHNlbGYgbmV2ZXIgcHVibGlzaGVzIG1lc3NhZ2VzIHdpdGggdGhpcyBjb21wb25lbnQgbmFtZS5cbiAgICovXG4gIHdvcmtmbG93ID0gJ3dvcmtmbG93JyxcblxuICAvKipcbiAgICogQ29tcG9uZW50IG5hbWUgZm9yIG1lc3NhZ2VzIGVtaXRlZCBmcm9tIGFuIGFjdGl2aXR5LCB1c2luZyB0aGUge0BsaW5rIGFjdGl2aXR5IGNvbnRleHQgbG9nZ2VyfENvbnRleHQubG9nfS5cbiAgICogVGhlIFNESyBpdHNlbGYgbmV2ZXIgcHVibGlzaGVzIG1lc3NhZ2VzIHdpdGggdGhpcyBjb21wb25lbnQgbmFtZS5cbiAgICovXG4gIGFjdGl2aXR5ID0gJ2FjdGl2aXR5JyxcblxuICAvKipcbiAgICogQ29tcG9uZW50IG5hbWUgZm9yIG1lc3NhZ2VzIGVtaXRlZCBmcm9tIGEgVGVtcG9yYWwgV29ya2VyIGluc3RhbmNlLlxuICAgKlxuICAgKiBUaGlzIG5vdGFibHkgaW5jbHVkZXM6XG4gICAqIC0gSXNzdWVzIHdpdGggV29ya2VyIG9yIHJ1bnRpbWUgY29uZmlndXJhdGlvbiwgb3IgdGhlIEpTIGV4ZWN1dGlvbiBlbnZpcm9ubWVudDtcbiAgICogLSBXb3JrZXIncywgQWN0aXZpdHkncywgYW5kIFdvcmtmbG93J3MgbGlmZWN5Y2xlIGV2ZW50cztcbiAgICogLSBXb3JrZmxvdyBBY3RpdmF0aW9uIGFuZCBBY3Rpdml0eSBUYXNrIHByb2Nlc3NpbmcgZXZlbnRzO1xuICAgKiAtIFdvcmtmbG93IGJ1bmRsaW5nIG1lc3NhZ2VzO1xuICAgKiAtIFNpbmsgcHJvY2Vzc2luZyBpc3N1ZXMuXG4gICAqL1xuICB3b3JrZXIgPSAnd29ya2VyJyxcblxuICAvKipcbiAgICogQ29tcG9uZW50IG5hbWUgZm9yIGFsbCBtZXNzYWdlcyBlbWl0dGVkIGJ5IHRoZSBSdXN0IENvcmUgU0RLIGxpYnJhcnkuXG4gICAqL1xuICBjb3JlID0gJ2NvcmUnLFxufVxuIiwiaW1wb3J0IHR5cGUgeyB0ZW1wb3JhbCB9IGZyb20gJ0B0ZW1wb3JhbGlvL3Byb3RvJztcbmltcG9ydCB7IFZhbHVlRXJyb3IgfSBmcm9tICcuL2Vycm9ycyc7XG5pbXBvcnQgeyBEdXJhdGlvbiwgbXNPcHRpb25hbFRvTnVtYmVyLCBtc09wdGlvbmFsVG9UcywgbXNUb051bWJlciwgbXNUb1RzLCBvcHRpb25hbFRzVG9NcyB9IGZyb20gJy4vdGltZSc7XG5cbi8qKlxuICogT3B0aW9ucyBmb3IgcmV0cnlpbmcgV29ya2Zsb3dzIGFuZCBBY3Rpdml0aWVzXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUmV0cnlQb2xpY3kge1xuICAvKipcbiAgICogQ29lZmZpY2llbnQgdXNlZCB0byBjYWxjdWxhdGUgdGhlIG5leHQgcmV0cnkgaW50ZXJ2YWwuXG4gICAqIFRoZSBuZXh0IHJldHJ5IGludGVydmFsIGlzIHByZXZpb3VzIGludGVydmFsIG11bHRpcGxpZWQgYnkgdGhpcyBjb2VmZmljaWVudC5cbiAgICogQG1pbmltdW0gMVxuICAgKiBAZGVmYXVsdCAyXG4gICAqL1xuICBiYWNrb2ZmQ29lZmZpY2llbnQ/OiBudW1iZXI7XG4gIC8qKlxuICAgKiBJbnRlcnZhbCBvZiB0aGUgZmlyc3QgcmV0cnkuXG4gICAqIElmIGNvZWZmaWNpZW50IGlzIDEgdGhlbiBpdCBpcyB1c2VkIGZvciBhbGwgcmV0cmllc1xuICAgKiBAZm9ybWF0IG51bWJlciBvZiBtaWxsaXNlY29uZHMgb3Ige0BsaW5rIGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL21zIHwgbXMtZm9ybWF0dGVkIHN0cmluZ31cbiAgICogQGRlZmF1bHQgMSBzZWNvbmRcbiAgICovXG4gIGluaXRpYWxJbnRlcnZhbD86IER1cmF0aW9uO1xuICAvKipcbiAgICogTWF4aW11bSBudW1iZXIgb2YgYXR0ZW1wdHMuIFdoZW4gZXhjZWVkZWQsIHJldHJpZXMgc3RvcCAoZXZlbiBpZiB7QGxpbmsgQWN0aXZpdHlPcHRpb25zLnNjaGVkdWxlVG9DbG9zZVRpbWVvdXR9XG4gICAqIGhhc24ndCBiZWVuIHJlYWNoZWQpLlxuICAgKlxuICAgKiBAZGVmYXVsdCBJbmZpbml0eVxuICAgKi9cbiAgbWF4aW11bUF0dGVtcHRzPzogbnVtYmVyO1xuICAvKipcbiAgICogTWF4aW11bSBpbnRlcnZhbCBiZXR3ZWVuIHJldHJpZXMuXG4gICAqIEV4cG9uZW50aWFsIGJhY2tvZmYgbGVhZHMgdG8gaW50ZXJ2YWwgaW5jcmVhc2UuXG4gICAqIFRoaXMgdmFsdWUgaXMgdGhlIGNhcCBvZiB0aGUgaW5jcmVhc2UuXG4gICAqXG4gICAqIEBkZWZhdWx0IDEwMHggb2Yge0BsaW5rIGluaXRpYWxJbnRlcnZhbH1cbiAgICogQGZvcm1hdCBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIG9yIHtAbGluayBodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9tcyB8IG1zLWZvcm1hdHRlZCBzdHJpbmd9XG4gICAqL1xuICBtYXhpbXVtSW50ZXJ2YWw/OiBEdXJhdGlvbjtcblxuICAvKipcbiAgICogTGlzdCBvZiBhcHBsaWNhdGlvbiBmYWlsdXJlcyB0eXBlcyB0byBub3QgcmV0cnkuXG4gICAqL1xuICBub25SZXRyeWFibGVFcnJvclR5cGVzPzogc3RyaW5nW107XG59XG5cbi8qKlxuICogVHVybiBhIFRTIFJldHJ5UG9saWN5IGludG8gYSBwcm90byBjb21wYXRpYmxlIFJldHJ5UG9saWN5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb21waWxlUmV0cnlQb2xpY3kocmV0cnlQb2xpY3k6IFJldHJ5UG9saWN5KTogdGVtcG9yYWwuYXBpLmNvbW1vbi52MS5JUmV0cnlQb2xpY3kge1xuICBpZiAocmV0cnlQb2xpY3kuYmFja29mZkNvZWZmaWNpZW50ICE9IG51bGwgJiYgcmV0cnlQb2xpY3kuYmFja29mZkNvZWZmaWNpZW50IDw9IDApIHtcbiAgICB0aHJvdyBuZXcgVmFsdWVFcnJvcignUmV0cnlQb2xpY3kuYmFja29mZkNvZWZmaWNpZW50IG11c3QgYmUgZ3JlYXRlciB0aGFuIDAnKTtcbiAgfVxuICBpZiAocmV0cnlQb2xpY3kubWF4aW11bUF0dGVtcHRzICE9IG51bGwpIHtcbiAgICBpZiAocmV0cnlQb2xpY3kubWF4aW11bUF0dGVtcHRzID09PSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFkpIHtcbiAgICAgIC8vIGRyb3AgZmllbGQgKEluZmluaXR5IGlzIHRoZSBkZWZhdWx0KVxuICAgICAgY29uc3QgeyBtYXhpbXVtQXR0ZW1wdHM6IF8sIC4uLndpdGhvdXQgfSA9IHJldHJ5UG9saWN5O1xuICAgICAgcmV0cnlQb2xpY3kgPSB3aXRob3V0O1xuICAgIH0gZWxzZSBpZiAocmV0cnlQb2xpY3kubWF4aW11bUF0dGVtcHRzIDw9IDApIHtcbiAgICAgIHRocm93IG5ldyBWYWx1ZUVycm9yKCdSZXRyeVBvbGljeS5tYXhpbXVtQXR0ZW1wdHMgbXVzdCBiZSBhIHBvc2l0aXZlIGludGVnZXInKTtcbiAgICB9IGVsc2UgaWYgKCFOdW1iZXIuaXNJbnRlZ2VyKHJldHJ5UG9saWN5Lm1heGltdW1BdHRlbXB0cykpIHtcbiAgICAgIHRocm93IG5ldyBWYWx1ZUVycm9yKCdSZXRyeVBvbGljeS5tYXhpbXVtQXR0ZW1wdHMgbXVzdCBiZSBhbiBpbnRlZ2VyJyk7XG4gICAgfVxuICB9XG4gIGNvbnN0IG1heGltdW1JbnRlcnZhbCA9IG1zT3B0aW9uYWxUb051bWJlcihyZXRyeVBvbGljeS5tYXhpbXVtSW50ZXJ2YWwpO1xuICBjb25zdCBpbml0aWFsSW50ZXJ2YWwgPSBtc1RvTnVtYmVyKHJldHJ5UG9saWN5LmluaXRpYWxJbnRlcnZhbCA/PyAxMDAwKTtcbiAgaWYgKG1heGltdW1JbnRlcnZhbCA9PT0gMCkge1xuICAgIHRocm93IG5ldyBWYWx1ZUVycm9yKCdSZXRyeVBvbGljeS5tYXhpbXVtSW50ZXJ2YWwgY2Fubm90IGJlIDAnKTtcbiAgfVxuICBpZiAoaW5pdGlhbEludGVydmFsID09PSAwKSB7XG4gICAgdGhyb3cgbmV3IFZhbHVlRXJyb3IoJ1JldHJ5UG9saWN5LmluaXRpYWxJbnRlcnZhbCBjYW5ub3QgYmUgMCcpO1xuICB9XG4gIGlmIChtYXhpbXVtSW50ZXJ2YWwgIT0gbnVsbCAmJiBtYXhpbXVtSW50ZXJ2YWwgPCBpbml0aWFsSW50ZXJ2YWwpIHtcbiAgICB0aHJvdyBuZXcgVmFsdWVFcnJvcignUmV0cnlQb2xpY3kubWF4aW11bUludGVydmFsIGNhbm5vdCBiZSBsZXNzIHRoYW4gaXRzIGluaXRpYWxJbnRlcnZhbCcpO1xuICB9XG4gIHJldHVybiB7XG4gICAgbWF4aW11bUF0dGVtcHRzOiByZXRyeVBvbGljeS5tYXhpbXVtQXR0ZW1wdHMsXG4gICAgaW5pdGlhbEludGVydmFsOiBtc1RvVHMoaW5pdGlhbEludGVydmFsKSxcbiAgICBtYXhpbXVtSW50ZXJ2YWw6IG1zT3B0aW9uYWxUb1RzKG1heGltdW1JbnRlcnZhbCksXG4gICAgYmFja29mZkNvZWZmaWNpZW50OiByZXRyeVBvbGljeS5iYWNrb2ZmQ29lZmZpY2llbnQsXG4gICAgbm9uUmV0cnlhYmxlRXJyb3JUeXBlczogcmV0cnlQb2xpY3kubm9uUmV0cnlhYmxlRXJyb3JUeXBlcyxcbiAgfTtcbn1cblxuLyoqXG4gKiBUdXJuIGEgcHJvdG8gY29tcGF0aWJsZSBSZXRyeVBvbGljeSBpbnRvIGEgVFMgUmV0cnlQb2xpY3lcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRlY29tcGlsZVJldHJ5UG9saWN5KFxuICByZXRyeVBvbGljeT86IHRlbXBvcmFsLmFwaS5jb21tb24udjEuSVJldHJ5UG9saWN5IHwgbnVsbFxuKTogUmV0cnlQb2xpY3kgfCB1bmRlZmluZWQge1xuICBpZiAoIXJldHJ5UG9saWN5KSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgYmFja29mZkNvZWZmaWNpZW50OiByZXRyeVBvbGljeS5iYWNrb2ZmQ29lZmZpY2llbnQgPz8gdW5kZWZpbmVkLFxuICAgIG1heGltdW1BdHRlbXB0czogcmV0cnlQb2xpY3kubWF4aW11bUF0dGVtcHRzID8/IHVuZGVmaW5lZCxcbiAgICBtYXhpbXVtSW50ZXJ2YWw6IG9wdGlvbmFsVHNUb01zKHJldHJ5UG9saWN5Lm1heGltdW1JbnRlcnZhbCksXG4gICAgaW5pdGlhbEludGVydmFsOiBvcHRpb25hbFRzVG9NcyhyZXRyeVBvbGljeS5pbml0aWFsSW50ZXJ2YWwpLFxuICAgIG5vblJldHJ5YWJsZUVycm9yVHlwZXM6IHJldHJ5UG9saWN5Lm5vblJldHJ5YWJsZUVycm9yVHlwZXMgPz8gdW5kZWZpbmVkLFxuICB9O1xufVxuIiwiaW1wb3J0IExvbmcgZnJvbSAnbG9uZyc7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgaW1wb3J0L25vLW5hbWVkLWFzLWRlZmF1bHRcbmltcG9ydCBtcywgeyBTdHJpbmdWYWx1ZSB9IGZyb20gJ21zJztcbmltcG9ydCB0eXBlIHsgZ29vZ2xlIH0gZnJvbSAnQHRlbXBvcmFsaW8vcHJvdG8nO1xuaW1wb3J0IHsgVmFsdWVFcnJvciB9IGZyb20gJy4vZXJyb3JzJztcblxuLy8gTk9URTogdGhlc2UgYXJlIHRoZSBzYW1lIGludGVyZmFjZSBpbiBKU1xuLy8gZ29vZ2xlLnByb3RvYnVmLklEdXJhdGlvbjtcbi8vIGdvb2dsZS5wcm90b2J1Zi5JVGltZXN0YW1wO1xuLy8gVGhlIGNvbnZlcnNpb24gZnVuY3Rpb25zIGJlbG93IHNob3VsZCB3b3JrIGZvciBib3RoXG5cbmV4cG9ydCB0eXBlIFRpbWVzdGFtcCA9IGdvb2dsZS5wcm90b2J1Zi5JVGltZXN0YW1wO1xuXG4vKipcbiAqIEEgZHVyYXRpb24sIGV4cHJlc3NlZCBlaXRoZXIgYXMgYSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzLCBvciBhcyBhIHtAbGluayBodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9tcyB8IG1zLWZvcm1hdHRlZCBzdHJpbmd9LlxuICovXG5leHBvcnQgdHlwZSBEdXJhdGlvbiA9IFN0cmluZ1ZhbHVlIHwgbnVtYmVyO1xuXG5leHBvcnQgdHlwZSB7IFN0cmluZ1ZhbHVlIH0gZnJvbSAnbXMnO1xuXG4vKipcbiAqIExvc3N5IGNvbnZlcnNpb24gZnVuY3Rpb24gZnJvbSBUaW1lc3RhbXAgdG8gbnVtYmVyIGR1ZSB0byBwb3NzaWJsZSBvdmVyZmxvdy5cbiAqIElmIHRzIGlzIG51bGwgb3IgdW5kZWZpbmVkIHJldHVybnMgdW5kZWZpbmVkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gb3B0aW9uYWxUc1RvTXModHM6IFRpbWVzdGFtcCB8IG51bGwgfCB1bmRlZmluZWQpOiBudW1iZXIgfCB1bmRlZmluZWQge1xuICBpZiAodHMgPT09IHVuZGVmaW5lZCB8fCB0cyA9PT0gbnVsbCkge1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cbiAgcmV0dXJuIHRzVG9Ncyh0cyk7XG59XG5cbi8qKlxuICogTG9zc3kgY29udmVyc2lvbiBmdW5jdGlvbiBmcm9tIFRpbWVzdGFtcCB0byBudW1iZXIgZHVlIHRvIHBvc3NpYmxlIG92ZXJmbG93LlxuICogSWYgdHMgaXMgbnVsbCBvciB1bmRlZmluZWQsIHRocm93cyBhIFR5cGVFcnJvciwgd2l0aCBlcnJvciBtZXNzYWdlIGluY2x1ZGluZyB0aGUgbmFtZSBvZiB0aGUgZmllbGQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXF1aXJlZFRzVG9Ncyh0czogVGltZXN0YW1wIHwgbnVsbCB8IHVuZGVmaW5lZCwgZmllbGROYW1lOiBzdHJpbmcpOiBudW1iZXIge1xuICBpZiAodHMgPT09IHVuZGVmaW5lZCB8fCB0cyA9PT0gbnVsbCkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYEV4cGVjdGVkICR7ZmllbGROYW1lfSB0byBiZSBhIHRpbWVzdGFtcCwgZ290ICR7dHN9YCk7XG4gIH1cbiAgcmV0dXJuIHRzVG9Ncyh0cyk7XG59XG5cbi8qKlxuICogTG9zc3kgY29udmVyc2lvbiBmdW5jdGlvbiBmcm9tIFRpbWVzdGFtcCB0byBudW1iZXIgZHVlIHRvIHBvc3NpYmxlIG92ZXJmbG93XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0c1RvTXModHM6IFRpbWVzdGFtcCB8IG51bGwgfCB1bmRlZmluZWQpOiBudW1iZXIge1xuICBpZiAodHMgPT09IHVuZGVmaW5lZCB8fCB0cyA9PT0gbnVsbCkge1xuICAgIHRocm93IG5ldyBFcnJvcihgRXhwZWN0ZWQgdGltZXN0YW1wLCBnb3QgJHt0c31gKTtcbiAgfVxuICBjb25zdCB7IHNlY29uZHMsIG5hbm9zIH0gPSB0cztcbiAgcmV0dXJuIChzZWNvbmRzIHx8IExvbmcuVVpFUk8pXG4gICAgLm11bCgxMDAwKVxuICAgIC5hZGQoTWF0aC5mbG9vcigobmFub3MgfHwgMCkgLyAxMDAwMDAwKSlcbiAgICAudG9OdW1iZXIoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1zTnVtYmVyVG9UcyhtaWxsaXM6IG51bWJlcik6IFRpbWVzdGFtcCB7XG4gIGNvbnN0IHNlY29uZHMgPSBNYXRoLmZsb29yKG1pbGxpcyAvIDEwMDApO1xuICBjb25zdCBuYW5vcyA9IChtaWxsaXMgJSAxMDAwKSAqIDEwMDAwMDA7XG4gIGlmIChOdW1iZXIuaXNOYU4oc2Vjb25kcykgfHwgTnVtYmVyLmlzTmFOKG5hbm9zKSkge1xuICAgIHRocm93IG5ldyBWYWx1ZUVycm9yKGBJbnZhbGlkIG1pbGxpcyAke21pbGxpc31gKTtcbiAgfVxuICByZXR1cm4geyBzZWNvbmRzOiBMb25nLmZyb21OdW1iZXIoc2Vjb25kcyksIG5hbm9zIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtc1RvVHMoc3RyOiBEdXJhdGlvbik6IFRpbWVzdGFtcCB7XG4gIHJldHVybiBtc051bWJlclRvVHMobXNUb051bWJlcihzdHIpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1zT3B0aW9uYWxUb1RzKHN0cjogRHVyYXRpb24gfCB1bmRlZmluZWQgfCBudWxsKTogVGltZXN0YW1wIHwgdW5kZWZpbmVkIHtcbiAgcmV0dXJuIHN0ciA/IG1zVG9UcyhzdHIpIDogdW5kZWZpbmVkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbXNPcHRpb25hbFRvTnVtYmVyKHZhbDogRHVyYXRpb24gfCB1bmRlZmluZWQpOiBudW1iZXIgfCB1bmRlZmluZWQge1xuICBpZiAodmFsID09PSB1bmRlZmluZWQpIHJldHVybiB1bmRlZmluZWQ7XG4gIHJldHVybiBtc1RvTnVtYmVyKHZhbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtc1RvTnVtYmVyKHZhbDogRHVyYXRpb24pOiBudW1iZXIge1xuICBpZiAodHlwZW9mIHZhbCA9PT0gJ251bWJlcicpIHtcbiAgICByZXR1cm4gdmFsO1xuICB9XG4gIHJldHVybiBtc1dpdGhWYWxpZGF0aW9uKHZhbCk7XG59XG5cbmZ1bmN0aW9uIG1zV2l0aFZhbGlkYXRpb24oc3RyOiBTdHJpbmdWYWx1ZSk6IG51bWJlciB7XG4gIGNvbnN0IG1pbGxpcyA9IG1zKHN0cik7XG4gIGlmIChtaWxsaXMgPT0gbnVsbCB8fCBpc05hTihtaWxsaXMpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgSW52YWxpZCBkdXJhdGlvbiBzdHJpbmc6ICcke3N0cn0nYCk7XG4gIH1cbiAgcmV0dXJuIG1pbGxpcztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRzVG9EYXRlKHRzOiBUaW1lc3RhbXApOiBEYXRlIHtcbiAgcmV0dXJuIG5ldyBEYXRlKHRzVG9Ncyh0cykpO1xufVxuXG4vLyB0cy1wcnVuZS1pZ25vcmUtbmV4dFxuZXhwb3J0IGZ1bmN0aW9uIHJlcXVpcmVkVHNUb0RhdGUodHM6IFRpbWVzdGFtcCB8IG51bGwgfCB1bmRlZmluZWQsIGZpZWxkTmFtZTogc3RyaW5nKTogRGF0ZSB7XG4gIHJldHVybiBuZXcgRGF0ZShyZXF1aXJlZFRzVG9Ncyh0cywgZmllbGROYW1lKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBvcHRpb25hbFRzVG9EYXRlKHRzOiBUaW1lc3RhbXAgfCBudWxsIHwgdW5kZWZpbmVkKTogRGF0ZSB8IHVuZGVmaW5lZCB7XG4gIGlmICh0cyA9PT0gdW5kZWZpbmVkIHx8IHRzID09PSBudWxsKSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuICByZXR1cm4gbmV3IERhdGUodHNUb01zKHRzKSk7XG59XG5cbi8vIHRzLXBydW5lLWlnbm9yZS1uZXh0IChpbXBvcnRlZCB2aWEgc2NoZWR1bGUtaGVscGVycy50cylcbmV4cG9ydCBmdW5jdGlvbiBvcHRpb25hbERhdGVUb1RzKGRhdGU6IERhdGUgfCBudWxsIHwgdW5kZWZpbmVkKTogVGltZXN0YW1wIHwgdW5kZWZpbmVkIHtcbiAgaWYgKGRhdGUgPT09IHVuZGVmaW5lZCB8fCBkYXRlID09PSBudWxsKSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuICByZXR1cm4gbXNUb1RzKGRhdGUuZ2V0VGltZSgpKTtcbn1cbiIsIi8qKiBTaG9ydGhhbmQgYWxpYXMgKi9cbmV4cG9ydCB0eXBlIEFueUZ1bmMgPSAoLi4uYXJnczogYW55W10pID0+IGFueTtcbi8qKiBBIHR1cGxlIHdpdGhvdXQgaXRzIGxhc3QgZWxlbWVudCAqL1xuZXhwb3J0IHR5cGUgT21pdExhc3Q8VD4gPSBUIGV4dGVuZHMgWy4uLmluZmVyIFJFU1QsIGFueV0gPyBSRVNUIDogbmV2ZXI7XG4vKiogRiB3aXRoIGFsbCBhcmd1bWVudHMgYnV0IHRoZSBsYXN0ICovXG5leHBvcnQgdHlwZSBPbWl0TGFzdFBhcmFtPEYgZXh0ZW5kcyBBbnlGdW5jPiA9ICguLi5hcmdzOiBPbWl0TGFzdDxQYXJhbWV0ZXJzPEY+PikgPT4gUmV0dXJuVHlwZTxGPjtcbi8qKiBSZXF1aXJlIHRoYXQgVCBoYXMgYXQgbGVhc3Qgb25lIG9mIHRoZSBwcm92aWRlZCBwcm9wZXJ0aWVzIGRlZmluZWQgKi9cbmV4cG9ydCB0eXBlIFJlcXVpcmVBdExlYXN0T25lPFQsIEtleXMgZXh0ZW5kcyBrZXlvZiBUID0ga2V5b2YgVD4gPSBQaWNrPFQsIEV4Y2x1ZGU8a2V5b2YgVCwgS2V5cz4+ICZcbiAge1xuICAgIFtLIGluIEtleXNdLT86IFJlcXVpcmVkPFBpY2s8VCwgSz4+ICYgUGFydGlhbDxQaWNrPFQsIEV4Y2x1ZGU8S2V5cywgSz4+PjtcbiAgfVtLZXlzXTtcblxuLyoqIFZlcmlmeSB0aGF0IGFuIHR5cGUgX0NvcHkgZXh0ZW5kcyBfT3JpZyAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNoZWNrRXh0ZW5kczxfT3JpZywgX0NvcHkgZXh0ZW5kcyBfT3JpZz4oKTogdm9pZCB7XG4gIC8vIG5vb3AsIGp1c3QgdHlwZSBjaGVja1xufVxuXG5leHBvcnQgdHlwZSBSZXBsYWNlPEJhc2UsIE5ldz4gPSBPbWl0PEJhc2UsIGtleW9mIE5ldz4gJiBOZXc7XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1JlY29yZCh2YWx1ZTogdW5rbm93bik6IHZhbHVlIGlzIFJlY29yZDxzdHJpbmcsIHVua25vd24+IHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUgIT09IG51bGw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoYXNPd25Qcm9wZXJ0eTxYIGV4dGVuZHMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4sIFkgZXh0ZW5kcyBQcm9wZXJ0eUtleT4oXG4gIHJlY29yZDogWCxcbiAgcHJvcDogWVxuKTogcmVjb3JkIGlzIFggJiBSZWNvcmQ8WSwgdW5rbm93bj4ge1xuICByZXR1cm4gcHJvcCBpbiByZWNvcmQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoYXNPd25Qcm9wZXJ0aWVzPFggZXh0ZW5kcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiwgWSBleHRlbmRzIFByb3BlcnR5S2V5PihcbiAgcmVjb3JkOiBYLFxuICBwcm9wczogWVtdXG4pOiByZWNvcmQgaXMgWCAmIFJlY29yZDxZLCB1bmtub3duPiB7XG4gIHJldHVybiBwcm9wcy5ldmVyeSgocHJvcCkgPT4gcHJvcCBpbiByZWNvcmQpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNFcnJvcihlcnJvcjogdW5rbm93bik6IGVycm9yIGlzIEVycm9yIHtcbiAgcmV0dXJuIChcbiAgICBpc1JlY29yZChlcnJvcikgJiZcbiAgICB0eXBlb2YgZXJyb3IubmFtZSA9PT0gJ3N0cmluZycgJiZcbiAgICB0eXBlb2YgZXJyb3IubWVzc2FnZSA9PT0gJ3N0cmluZycgJiZcbiAgICAoZXJyb3Iuc3RhY2sgPT0gbnVsbCB8fCB0eXBlb2YgZXJyb3Iuc3RhY2sgPT09ICdzdHJpbmcnKVxuICApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNBYm9ydEVycm9yKGVycm9yOiB1bmtub3duKTogZXJyb3IgaXMgRXJyb3IgJiB7IG5hbWU6ICdBYm9ydEVycm9yJyB9IHtcbiAgcmV0dXJuIGlzRXJyb3IoZXJyb3IpICYmIGVycm9yLm5hbWUgPT09ICdBYm9ydEVycm9yJztcbn1cblxuLyoqXG4gKiBHZXQgYGVycm9yLm1lc3NhZ2VgIChvciBgdW5kZWZpbmVkYCBpZiBub3QgcHJlc2VudClcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVycm9yTWVzc2FnZShlcnJvcjogdW5rbm93bik6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gIGlmIChpc0Vycm9yKGVycm9yKSkge1xuICAgIHJldHVybiBlcnJvci5tZXNzYWdlO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBlcnJvciA9PT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gZXJyb3I7XG4gIH1cbiAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuaW50ZXJmYWNlIEVycm9yV2l0aENvZGUge1xuICBjb2RlOiBzdHJpbmc7XG59XG5cbmZ1bmN0aW9uIGlzRXJyb3JXaXRoQ29kZShlcnJvcjogdW5rbm93bik6IGVycm9yIGlzIEVycm9yV2l0aENvZGUge1xuICByZXR1cm4gaXNSZWNvcmQoZXJyb3IpICYmIHR5cGVvZiBlcnJvci5jb2RlID09PSAnc3RyaW5nJztcbn1cblxuLyoqXG4gKiBHZXQgYGVycm9yLmNvZGVgIChvciBgdW5kZWZpbmVkYCBpZiBub3QgcHJlc2VudClcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVycm9yQ29kZShlcnJvcjogdW5rbm93bik6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gIGlmIChpc0Vycm9yV2l0aENvZGUoZXJyb3IpKSB7XG4gICAgcmV0dXJuIGVycm9yLmNvZGU7XG4gIH1cblxuICByZXR1cm4gdW5kZWZpbmVkO1xufVxuXG4vKipcbiAqIEFzc2VydHMgdGhhdCBzb21lIHR5cGUgaXMgdGhlIG5ldmVyIHR5cGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydE5ldmVyKG1zZzogc3RyaW5nLCB4OiBuZXZlcik6IG5ldmVyIHtcbiAgdGhyb3cgbmV3IFR5cGVFcnJvcihtc2cgKyAnOiAnICsgeCk7XG59XG5cbmV4cG9ydCB0eXBlIENsYXNzPEUgZXh0ZW5kcyBFcnJvcj4gPSB7XG4gIG5ldyAoLi4uYXJnczogYW55W10pOiBFO1xuICBwcm90b3R5cGU6IEU7XG59O1xuXG4vKipcbiAqIEEgZGVjb3JhdG9yIHRvIGJlIHVzZWQgb24gZXJyb3IgY2xhc3Nlcy4gSXQgYWRkcyB0aGUgJ25hbWUnIHByb3BlcnR5IEFORCBwcm92aWRlcyBhIGN1c3RvbVxuICogJ2luc3RhbmNlb2YnIGhhbmRsZXIgdGhhdCB3b3JrcyBjb3JyZWN0bHkgYWNyb3NzIGV4ZWN1dGlvbiBjb250ZXh0cy5cbiAqXG4gKiAjIyMgRGV0YWlscyAjIyNcbiAqXG4gKiBBY2NvcmRpbmcgdG8gdGhlIEVjbWFTY3JpcHQncyBzcGVjLCB0aGUgZGVmYXVsdCBiZWhhdmlvciBvZiBKYXZhU2NyaXB0J3MgYHggaW5zdGFuY2VvZiBZYCBvcGVyYXRvciBpcyB0byB3YWxrIHVwIHRoZVxuICogcHJvdG90eXBlIGNoYWluIG9mIG9iamVjdCAneCcsIGNoZWNraW5nIGlmIGFueSBjb25zdHJ1Y3RvciBpbiB0aGF0IGhpZXJhcmNoeSBpcyBfZXhhY3RseSB0aGUgc2FtZSBvYmplY3RfIGFzIHRoZVxuICogY29uc3RydWN0b3IgZnVuY3Rpb24gJ1knLlxuICpcbiAqIFVuZm9ydHVuYXRlbHksIGl0IGhhcHBlbnMgaW4gdmFyaW91cyBzaXR1YXRpb25zIHRoYXQgZGlmZmVyZW50IGNvbnN0cnVjdG9yIGZ1bmN0aW9uIG9iamVjdHMgZ2V0IGNyZWF0ZWQgZm9yIHdoYXRcbiAqIGFwcGVhcnMgdG8gYmUgdGhlIHZlcnkgc2FtZSBjbGFzcy4gVGhpcyBsZWFkcyB0byBzdXJwcmlzaW5nIGJlaGF2aW9yIHdoZXJlIGBpbnN0YW5jZW9mYCByZXR1cm5zIGZhbHNlIHRob3VnaCBpdCBpc1xuICoga25vd24gdGhhdCB0aGUgb2JqZWN0IGlzIGluZGVlZCBhbiBpbnN0YW5jZSBvZiB0aGF0IGNsYXNzLiBPbmUgcGFydGljdWxhciBjYXNlIHdoZXJlIHRoaXMgaGFwcGVucyBpcyB3aGVuIGNvbnN0cnVjdG9yXG4gKiAnWScgYmVsb25ncyB0byBhIGRpZmZlcmVudCByZWFsbSB0aGFuIHRoZSBjb25zdHVjdG9yIHdpdGggd2hpY2ggJ3gnIHdhcyBpbnN0YW50aWF0ZWQuIEFub3RoZXIgY2FzZSBpcyB3aGVuIHR3byBjb3BpZXNcbiAqIG9mIHRoZSBzYW1lIGxpYnJhcnkgZ2V0cyBsb2FkZWQgaW4gdGhlIHNhbWUgcmVhbG0uXG4gKlxuICogSW4gcHJhY3RpY2UsIHRoaXMgdGVuZHMgdG8gY2F1c2UgaXNzdWVzIHdoZW4gY3Jvc3NpbmcgdGhlIHdvcmtmbG93LXNhbmRib3hpbmcgYm91bmRhcnkgKHNpbmNlIE5vZGUncyB2bSBtb2R1bGVcbiAqIHJlYWxseSBjcmVhdGVzIG5ldyBleGVjdXRpb24gcmVhbG1zKSwgYXMgd2VsbCBhcyB3aGVuIHJ1bm5pbmcgdGVzdHMgdXNpbmcgSmVzdCAoc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9qZXN0anMvamVzdC9pc3N1ZXMvMjU0OVxuICogZm9yIHNvbWUgZGV0YWlscyBvbiB0aGF0IG9uZSkuXG4gKlxuICogVGhpcyBmdW5jdGlvbiBpbmplY3RzIGEgY3VzdG9tICdpbnN0YW5jZW9mJyBoYW5kbGVyIGludG8gdGhlIHByb3RvdHlwZSBvZiAnY2xhenonLCB3aGljaCBpcyBib3RoIGNyb3NzLXJlYWxtIHNhZmUgYW5kXG4gKiBjcm9zcy1jb3BpZXMtb2YtdGhlLXNhbWUtbGliIHNhZmUuIEl0IHdvcmtzIGJ5IGFkZGluZyBhIHNwZWNpYWwgc3ltYm9sIHByb3BlcnR5IHRvIHRoZSBwcm90b3R5cGUgb2YgJ2NsYXp6JywgYW5kIHRoZW5cbiAqIGNoZWNraW5nIGZvciB0aGUgcHJlc2VuY2Ugb2YgdGhhdCBzeW1ib2wuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBTeW1ib2xCYXNlZEluc3RhbmNlT2ZFcnJvcjxFIGV4dGVuZHMgRXJyb3I+KG1hcmtlck5hbWU6IHN0cmluZyk6IChjbGF6ejogQ2xhc3M8RT4pID0+IHZvaWQge1xuICByZXR1cm4gKGNsYXp6OiBDbGFzczxFPik6IHZvaWQgPT4ge1xuICAgIGNvbnN0IG1hcmtlciA9IFN5bWJvbC5mb3IoYF9fdGVtcG9yYWxfaXMke21hcmtlck5hbWV9YCk7XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoY2xhenoucHJvdG90eXBlLCAnbmFtZScsIHsgdmFsdWU6IG1hcmtlck5hbWUsIGVudW1lcmFibGU6IHRydWUgfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGNsYXp6LnByb3RvdHlwZSwgbWFya2VyLCB7IHZhbHVlOiB0cnVlLCBlbnVtZXJhYmxlOiBmYWxzZSB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoY2xhenosIFN5bWJvbC5oYXNJbnN0YW5jZSwge1xuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG9iamVjdC1zaG9ydGhhbmRcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiAodGhpczogYW55LCBlcnJvcjogb2JqZWN0KTogYm9vbGVhbiB7XG4gICAgICAgIGlmICh0aGlzID09PSBjbGF6eikge1xuICAgICAgICAgIHJldHVybiBpc1JlY29yZChlcnJvcikgJiYgKGVycm9yIGFzIGFueSlbbWFya2VyXSA9PT0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyAndGhpcycgbXVzdCBiZSBhIF9zdWJjbGFzc18gb2YgY2xhenogdGhhdCBkb2Vzbid0IHJlZGVmaW5lZCBbU3ltYm9sLmhhc0luc3RhbmNlXSwgc28gdGhhdCBpdCBpbmhlcml0ZWRcbiAgICAgICAgICAvLyBmcm9tIGNsYXp6J3MgW1N5bWJvbC5oYXNJbnN0YW5jZV0uIElmIHdlIGRvbid0IGhhbmRsZSB0aGlzIHBhcnRpY3VsYXIgc2l0dWF0aW9uLCB0aGVuXG4gICAgICAgICAgLy8gYHggaW5zdGFuY2VvZiBTdWJjbGFzc09mUGFyZW50YCB3b3VsZCByZXR1cm4gdHJ1ZSBmb3IgYW55IGluc3RhbmNlIG9mICdQYXJlbnQnLCB3aGljaCBpcyBjbGVhcmx5IHdyb25nLlxuICAgICAgICAgIC8vXG4gICAgICAgICAgLy8gSWRlYWxseSwgaXQnZCBiZSBwcmVmZXJhYmxlIHRvIGF2b2lkIHRoaXMgY2FzZSBlbnRpcmVseSwgYnkgbWFraW5nIHN1cmUgdGhhdCBhbGwgc3ViY2xhc3NlcyBvZiAnY2xhenonXG4gICAgICAgICAgLy8gcmVkZWZpbmUgW1N5bWJvbC5oYXNJbnN0YW5jZV0sIGJ1dCB3ZSBjYW4ndCBlbmZvcmNlIHRoYXQuIFdlIHRoZXJlZm9yZSBmYWxsYmFjayB0byB0aGUgZGVmYXVsdCBpbnN0YW5jZW9mXG4gICAgICAgICAgLy8gYmVoYXZpb3IgKHdoaWNoIGlzIE5PVCBjcm9zcy1yZWFsbSBzYWZlKS5cbiAgICAgICAgICByZXR1cm4gdGhpcy5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihlcnJvcik7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tcHJvdG90eXBlLWJ1aWx0aW5zXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgfSk7XG4gIH07XG59XG5cbi8vIFRoYW5rcyBNRE46IGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL09iamVjdC9mcmVlemVcbmV4cG9ydCBmdW5jdGlvbiBkZWVwRnJlZXplPFQ+KG9iamVjdDogVCk6IFQge1xuICAvLyBSZXRyaWV2ZSB0aGUgcHJvcGVydHkgbmFtZXMgZGVmaW5lZCBvbiBvYmplY3RcbiAgY29uc3QgcHJvcE5hbWVzID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMob2JqZWN0KTtcblxuICAvLyBGcmVlemUgcHJvcGVydGllcyBiZWZvcmUgZnJlZXppbmcgc2VsZlxuICBmb3IgKGNvbnN0IG5hbWUgb2YgcHJvcE5hbWVzKSB7XG4gICAgY29uc3QgdmFsdWUgPSAob2JqZWN0IGFzIGFueSlbbmFtZV07XG5cbiAgICBpZiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgZGVlcEZyZWV6ZSh2YWx1ZSk7XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgLy8gVGhpcyBpcyBva2F5LCB0aGVyZSBhcmUgc29tZSB0eXBlZCBhcnJheXMgdGhhdCBjYW5ub3QgYmUgZnJvemVuIChlbmNvZGluZ0tleXMpXG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIE9iamVjdC5mcmVlemUodmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBPYmplY3QuZnJlZXplKG9iamVjdCk7XG59XG4iLCJpbXBvcnQgdHlwZSB7IGNvcmVzZGsgfSBmcm9tICdAdGVtcG9yYWxpby9wcm90byc7XG5pbXBvcnQgdHlwZSB7IFZlcnNpb25pbmdJbnRlbnQgYXMgVmVyc2lvbmluZ0ludGVudFN0cmluZyB9IGZyb20gJy4vdmVyc2lvbmluZy1pbnRlbnQnO1xuaW1wb3J0IHsgYXNzZXJ0TmV2ZXIsIGNoZWNrRXh0ZW5kcyB9IGZyb20gJy4vdHlwZS1oZWxwZXJzJztcblxuLy8gQXZvaWQgaW1wb3J0aW5nIHRoZSBwcm90byBpbXBsZW1lbnRhdGlvbiB0byByZWR1Y2Ugd29ya2Zsb3cgYnVuZGxlIHNpemVcbi8vIENvcGllZCBmcm9tIGNvcmVzZGsuY29tbW9uLlZlcnNpb25pbmdJbnRlbnRcbi8qKlxuICogUHJvdG9idWYgZW51bSByZXByZXNlbnRhdGlvbiBvZiB7QGxpbmsgVmVyc2lvbmluZ0ludGVudFN0cmluZ30uXG4gKlxuICogQGV4cGVyaW1lbnRhbFxuICovXG5leHBvcnQgZW51bSBWZXJzaW9uaW5nSW50ZW50IHtcbiAgVU5TUEVDSUZJRUQgPSAwLFxuICBDT01QQVRJQkxFID0gMSxcbiAgREVGQVVMVCA9IDIsXG59XG5cbmNoZWNrRXh0ZW5kczxjb3Jlc2RrLmNvbW1vbi5WZXJzaW9uaW5nSW50ZW50LCBWZXJzaW9uaW5nSW50ZW50PigpO1xuY2hlY2tFeHRlbmRzPFZlcnNpb25pbmdJbnRlbnQsIGNvcmVzZGsuY29tbW9uLlZlcnNpb25pbmdJbnRlbnQ+KCk7XG5cbmV4cG9ydCBmdW5jdGlvbiB2ZXJzaW9uaW5nSW50ZW50VG9Qcm90byhpbnRlbnQ6IFZlcnNpb25pbmdJbnRlbnRTdHJpbmcgfCB1bmRlZmluZWQpOiBWZXJzaW9uaW5nSW50ZW50IHtcbiAgc3dpdGNoIChpbnRlbnQpIHtcbiAgICBjYXNlICdERUZBVUxUJzpcbiAgICAgIHJldHVybiBWZXJzaW9uaW5nSW50ZW50LkRFRkFVTFQ7XG4gICAgY2FzZSAnQ09NUEFUSUJMRSc6XG4gICAgICByZXR1cm4gVmVyc2lvbmluZ0ludGVudC5DT01QQVRJQkxFO1xuICAgIGNhc2UgdW5kZWZpbmVkOlxuICAgICAgcmV0dXJuIFZlcnNpb25pbmdJbnRlbnQuVU5TUEVDSUZJRUQ7XG4gICAgZGVmYXVsdDpcbiAgICAgIGFzc2VydE5ldmVyKCdVbmV4cGVjdGVkIFZlcnNpb25pbmdJbnRlbnQnLCBpbnRlbnQpO1xuICB9XG59XG4iLCIvKipcbiAqIEluZGljYXRlcyB3aGV0aGVyIHRoZSB1c2VyIGludGVuZHMgY2VydGFpbiBjb21tYW5kcyB0byBiZSBydW4gb24gYSBjb21wYXRpYmxlIHdvcmtlciBCdWlsZCBJZCB2ZXJzaW9uIG9yIG5vdC5cbiAqXG4gKiBgQ09NUEFUSUJMRWAgaW5kaWNhdGVzIHRoYXQgdGhlIGNvbW1hbmQgc2hvdWxkIHJ1biBvbiBhIHdvcmtlciB3aXRoIGNvbXBhdGlibGUgdmVyc2lvbiBpZiBwb3NzaWJsZS4gSXQgbWF5IG5vdCBiZVxuICogcG9zc2libGUgaWYgdGhlIHRhcmdldCB0YXNrIHF1ZXVlIGRvZXMgbm90IGFsc28gaGF2ZSBrbm93bGVkZ2Ugb2YgdGhlIGN1cnJlbnQgd29ya2VyJ3MgQnVpbGQgSWQuXG4gKlxuICogYERFRkFVTFRgIGluZGljYXRlcyB0aGF0IHRoZSBjb21tYW5kIHNob3VsZCBydW4gb24gdGhlIHRhcmdldCB0YXNrIHF1ZXVlJ3MgY3VycmVudCBvdmVyYWxsLWRlZmF1bHQgQnVpbGQgSWQuXG4gKlxuICogV2hlcmUgdGhpcyB0eXBlIGlzIGFjY2VwdGVkIG9wdGlvbmFsbHksIGFuIHVuc2V0IHZhbHVlIGluZGljYXRlcyB0aGF0IHRoZSBTREsgc2hvdWxkIGNob29zZSB0aGUgbW9zdCBzZW5zaWJsZSBkZWZhdWx0XG4gKiBiZWhhdmlvciBmb3IgdGhlIHR5cGUgb2YgY29tbWFuZCwgYWNjb3VudGluZyBmb3Igd2hldGhlciB0aGUgY29tbWFuZCB3aWxsIGJlIHJ1biBvbiB0aGUgc2FtZSB0YXNrIHF1ZXVlIGFzIHRoZVxuICogY3VycmVudCB3b3JrZXIuIFRoZSBkZWZhdWx0IGJlaGF2aW9yIGZvciBzdGFydGluZyBXb3JrZmxvd3MgaXMgYERFRkFVTFRgLiBUaGUgZGVmYXVsdCBiZWhhdmlvciBmb3IgV29ya2Zsb3dzIHN0YXJ0aW5nXG4gKiBBY3Rpdml0aWVzLCBzdGFydGluZyBDaGlsZCBXb3JrZmxvd3MsIG9yIENvbnRpbnVpbmcgQXMgTmV3IGlzIGBDT01QQVRJQkxFYC5cbiAqXG4gKiBAZXhwZXJpbWVudGFsXG4gKi9cbmV4cG9ydCB0eXBlIFZlcnNpb25pbmdJbnRlbnQgPSAnQ09NUEFUSUJMRScgfCAnREVGQVVMVCc7XG4iLCJpbXBvcnQgeyBXb3JrZmxvdywgV29ya2Zsb3dSZXN1bHRUeXBlLCBTaWduYWxEZWZpbml0aW9uIH0gZnJvbSAnLi9pbnRlcmZhY2VzJztcblxuLyoqXG4gKiBCYXNlIFdvcmtmbG93SGFuZGxlIGludGVyZmFjZSwgZXh0ZW5kZWQgaW4gd29ya2Zsb3cgYW5kIGNsaWVudCBsaWJzLlxuICpcbiAqIFRyYW5zZm9ybXMgYSB3b3JrZmxvdyBpbnRlcmZhY2UgYFRgIGludG8gYSBjbGllbnQgaW50ZXJmYWNlLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEJhc2VXb3JrZmxvd0hhbmRsZTxUIGV4dGVuZHMgV29ya2Zsb3c+IHtcbiAgLyoqXG4gICAqIFByb21pc2UgdGhhdCByZXNvbHZlcyB3aGVuIFdvcmtmbG93IGV4ZWN1dGlvbiBjb21wbGV0ZXNcbiAgICovXG4gIHJlc3VsdCgpOiBQcm9taXNlPFdvcmtmbG93UmVzdWx0VHlwZTxUPj47XG5cbiAgLyoqXG4gICAqIFNpZ25hbCBhIHJ1bm5pbmcgV29ya2Zsb3cuXG4gICAqXG4gICAqIEBwYXJhbSBkZWYgYSBzaWduYWwgZGVmaW5pdGlvbiBhcyByZXR1cm5lZCBmcm9tIHtAbGluayBkZWZpbmVTaWduYWx9XG4gICAqXG4gICAqIEBleGFtcGxlXG4gICAqIGBgYHRzXG4gICAqIGF3YWl0IGhhbmRsZS5zaWduYWwoaW5jcmVtZW50U2lnbmFsLCAzKTtcbiAgICogYGBgXG4gICAqL1xuICBzaWduYWw8QXJncyBleHRlbmRzIGFueVtdID0gW10sIE5hbWUgZXh0ZW5kcyBzdHJpbmcgPSBzdHJpbmc+KFxuICAgIGRlZjogU2lnbmFsRGVmaW5pdGlvbjxBcmdzLCBOYW1lPiB8IHN0cmluZyxcbiAgICAuLi5hcmdzOiBBcmdzXG4gICk6IFByb21pc2U8dm9pZD47XG5cbiAgLyoqXG4gICAqIFRoZSB3b3JrZmxvd0lkIG9mIHRoZSBjdXJyZW50IFdvcmtmbG93XG4gICAqL1xuICByZWFkb25seSB3b3JrZmxvd0lkOiBzdHJpbmc7XG59XG4iLCJpbXBvcnQgdHlwZSB7IHRlbXBvcmFsIH0gZnJvbSAnQHRlbXBvcmFsaW8vcHJvdG8nO1xuaW1wb3J0IHsgU2VhcmNoQXR0cmlidXRlcywgV29ya2Zsb3cgfSBmcm9tICcuL2ludGVyZmFjZXMnO1xuaW1wb3J0IHsgUmV0cnlQb2xpY3kgfSBmcm9tICcuL3JldHJ5LXBvbGljeSc7XG5pbXBvcnQgeyBEdXJhdGlvbiB9IGZyb20gJy4vdGltZSc7XG5pbXBvcnQgeyBjaGVja0V4dGVuZHMgfSBmcm9tICcuL3R5cGUtaGVscGVycyc7XG5cbi8vIEF2b2lkIGltcG9ydGluZyB0aGUgcHJvdG8gaW1wbGVtZW50YXRpb24gdG8gcmVkdWNlIHdvcmtmbG93IGJ1bmRsZSBzaXplXG4vLyBDb3BpZWQgZnJvbSB0ZW1wb3JhbC5hcGkuZW51bXMudjEuV29ya2Zsb3dJZFJldXNlUG9saWN5XG4vKipcbiAqIENvbmNlcHQ6IHtAbGluayBodHRwczovL2RvY3MudGVtcG9yYWwuaW8vY29uY2VwdHMvd2hhdC1pcy1hLXdvcmtmbG93LWlkLXJldXNlLXBvbGljeS8gfCBXb3JrZmxvdyBJZCBSZXVzZSBQb2xpY3l9XG4gKlxuICogV2hldGhlciBhIFdvcmtmbG93IGNhbiBiZSBzdGFydGVkIHdpdGggYSBXb3JrZmxvdyBJZCBvZiBhIENsb3NlZCBXb3JrZmxvdy5cbiAqXG4gKiAqTm90ZTogQSBXb3JrZmxvdyBjYW4gbmV2ZXIgYmUgc3RhcnRlZCB3aXRoIGEgV29ya2Zsb3cgSWQgb2YgYSBSdW5uaW5nIFdvcmtmbG93LipcbiAqL1xuZXhwb3J0IGVudW0gV29ya2Zsb3dJZFJldXNlUG9saWN5IHtcbiAgLyoqXG4gICAqIE5vIG5lZWQgdG8gdXNlIHRoaXMuXG4gICAqXG4gICAqIChJZiBhIGBXb3JrZmxvd0lkUmV1c2VQb2xpY3lgIGlzIHNldCB0byB0aGlzLCBvciBpcyBub3Qgc2V0IGF0IGFsbCwgdGhlIGRlZmF1bHQgdmFsdWUgd2lsbCBiZSB1c2VkLilcbiAgICovXG4gIFdPUktGTE9XX0lEX1JFVVNFX1BPTElDWV9VTlNQRUNJRklFRCA9IDAsXG5cbiAgLyoqXG4gICAqIFRoZSBXb3JrZmxvdyBjYW4gYmUgc3RhcnRlZCBpZiB0aGUgcHJldmlvdXMgV29ya2Zsb3cgaXMgaW4gYSBDbG9zZWQgc3RhdGUuXG4gICAqIEBkZWZhdWx0XG4gICAqL1xuICBXT1JLRkxPV19JRF9SRVVTRV9QT0xJQ1lfQUxMT1dfRFVQTElDQVRFID0gMSxcblxuICAvKipcbiAgICogVGhlIFdvcmtmbG93IGNhbiBiZSBzdGFydGVkIGlmIHRoZSBwcmV2aW91cyBXb3JrZmxvdyBpcyBpbiBhIENsb3NlZCBzdGF0ZSB0aGF0IGlzIG5vdCBDb21wbGV0ZWQuXG4gICAqL1xuICBXT1JLRkxPV19JRF9SRVVTRV9QT0xJQ1lfQUxMT1dfRFVQTElDQVRFX0ZBSUxFRF9PTkxZID0gMixcblxuICAvKipcbiAgICogVGhlIFdvcmtmbG93IGNhbm5vdCBiZSBzdGFydGVkLlxuICAgKi9cbiAgV09SS0ZMT1dfSURfUkVVU0VfUE9MSUNZX1JFSkVDVF9EVVBMSUNBVEUgPSAzLFxuXG4gIC8qKlxuICAgKiBUZXJtaW5hdGUgdGhlIGN1cnJlbnQgd29ya2Zsb3cgaWYgb25lIGlzIGFscmVhZHkgcnVubmluZy5cbiAgICovXG4gIFdPUktGTE9XX0lEX1JFVVNFX1BPTElDWV9URVJNSU5BVEVfSUZfUlVOTklORyA9IDQsXG59XG5cbmNoZWNrRXh0ZW5kczx0ZW1wb3JhbC5hcGkuZW51bXMudjEuV29ya2Zsb3dJZFJldXNlUG9saWN5LCBXb3JrZmxvd0lkUmV1c2VQb2xpY3k+KCk7XG5jaGVja0V4dGVuZHM8V29ya2Zsb3dJZFJldXNlUG9saWN5LCB0ZW1wb3JhbC5hcGkuZW51bXMudjEuV29ya2Zsb3dJZFJldXNlUG9saWN5PigpO1xuXG5leHBvcnQgaW50ZXJmYWNlIEJhc2VXb3JrZmxvd09wdGlvbnMge1xuICAvKipcbiAgICogV2hldGhlciBhIFdvcmtmbG93IGNhbiBiZSBzdGFydGVkIHdpdGggYSBXb3JrZmxvdyBJZCBvZiBhIENsb3NlZCBXb3JrZmxvdy5cbiAgICpcbiAgICogKk5vdGU6IEEgV29ya2Zsb3cgY2FuIG5ldmVyIGJlIHN0YXJ0ZWQgd2l0aCBhIFdvcmtmbG93IElkIG9mIGEgUnVubmluZyBXb3JrZmxvdy4qXG4gICAqXG4gICAqIEBkZWZhdWx0IHtAbGluayBXb3JrZmxvd0lkUmV1c2VQb2xpY3kuV09SS0ZMT1dfSURfUkVVU0VfUE9MSUNZX0FMTE9XX0RVUExJQ0FURX1cbiAgICovXG4gIHdvcmtmbG93SWRSZXVzZVBvbGljeT86IFdvcmtmbG93SWRSZXVzZVBvbGljeTtcblxuICAvKipcbiAgICogQ29udHJvbHMgaG93IGEgV29ya2Zsb3cgRXhlY3V0aW9uIGlzIHJldHJpZWQuXG4gICAqXG4gICAqIEJ5IGRlZmF1bHQsIFdvcmtmbG93IEV4ZWN1dGlvbnMgYXJlIG5vdCByZXRyaWVkLiBEbyBub3Qgb3ZlcnJpZGUgdGhpcyBiZWhhdmlvciB1bmxlc3MgeW91IGtub3cgd2hhdCB5b3UncmUgZG9pbmcuXG4gICAqIHtAbGluayBodHRwczovL2RvY3MudGVtcG9yYWwuaW8vY29uY2VwdHMvd2hhdC1pcy1hLXJldHJ5LXBvbGljeS8gfCBNb3JlIGluZm9ybWF0aW9ufS5cbiAgICovXG4gIHJldHJ5PzogUmV0cnlQb2xpY3k7XG5cbiAgLyoqXG4gICAqIE9wdGlvbmFsIGNyb24gc2NoZWR1bGUgZm9yIFdvcmtmbG93LiBJZiBhIGNyb24gc2NoZWR1bGUgaXMgc3BlY2lmaWVkLCB0aGUgV29ya2Zsb3cgd2lsbCBydW4gYXMgYSBjcm9uIGJhc2VkIG9uIHRoZVxuICAgKiBzY2hlZHVsZS4gVGhlIHNjaGVkdWxpbmcgd2lsbCBiZSBiYXNlZCBvbiBVVEMgdGltZS4gVGhlIHNjaGVkdWxlIGZvciB0aGUgbmV4dCBydW4gb25seSBoYXBwZW5zIGFmdGVyIHRoZSBjdXJyZW50XG4gICAqIHJ1biBpcyBjb21wbGV0ZWQvZmFpbGVkL3RpbWVvdXQuIElmIGEgUmV0cnlQb2xpY3kgaXMgYWxzbyBzdXBwbGllZCwgYW5kIHRoZSBXb3JrZmxvdyBmYWlsZWQgb3IgdGltZWQgb3V0LCB0aGVcbiAgICogV29ya2Zsb3cgd2lsbCBiZSByZXRyaWVkIGJhc2VkIG9uIHRoZSByZXRyeSBwb2xpY3kuIFdoaWxlIHRoZSBXb3JrZmxvdyBpcyByZXRyeWluZywgaXQgd29uJ3Qgc2NoZWR1bGUgaXRzIG5leHQgcnVuLlxuICAgKiBJZiB0aGUgbmV4dCBzY2hlZHVsZSBpcyBkdWUgd2hpbGUgdGhlIFdvcmtmbG93IGlzIHJ1bm5pbmcgKG9yIHJldHJ5aW5nKSwgdGhlbiBpdCB3aWxsIHNraXAgdGhhdCBzY2hlZHVsZS4gQ3JvblxuICAgKiBXb3JrZmxvdyB3aWxsIG5vdCBzdG9wIHVudGlsIGl0IGlzIHRlcm1pbmF0ZWQgb3IgY2FuY2VsbGVkIChieSByZXR1cm5pbmcgdGVtcG9yYWwuQ2FuY2VsZWRFcnJvcikuXG4gICAqIGh0dHBzOi8vY3JvbnRhYi5ndXJ1LyBpcyB1c2VmdWwgZm9yIHRlc3RpbmcgeW91ciBjcm9uIGV4cHJlc3Npb25zLlxuICAgKi9cbiAgY3JvblNjaGVkdWxlPzogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBTcGVjaWZpZXMgYWRkaXRpb25hbCBub24taW5kZXhlZCBpbmZvcm1hdGlvbiB0byBhdHRhY2ggdG8gdGhlIFdvcmtmbG93IEV4ZWN1dGlvbi4gVGhlIHZhbHVlcyBjYW4gYmUgYW55dGhpbmcgdGhhdFxuICAgKiBpcyBzZXJpYWxpemFibGUgYnkge0BsaW5rIERhdGFDb252ZXJ0ZXJ9LlxuICAgKi9cbiAgbWVtbz86IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuXG4gIC8qKlxuICAgKiBTcGVjaWZpZXMgYWRkaXRpb25hbCBpbmRleGVkIGluZm9ybWF0aW9uIHRvIGF0dGFjaCB0byB0aGUgV29ya2Zsb3cgRXhlY3V0aW9uLiBNb3JlIGluZm86XG4gICAqIGh0dHBzOi8vZG9jcy50ZW1wb3JhbC5pby9kb2NzL3R5cGVzY3JpcHQvc2VhcmNoLWF0dHJpYnV0ZXNcbiAgICpcbiAgICogVmFsdWVzIGFyZSBhbHdheXMgY29udmVydGVkIHVzaW5nIHtAbGluayBKc29uUGF5bG9hZENvbnZlcnRlcn0sIGV2ZW4gd2hlbiBhIGN1c3RvbSBkYXRhIGNvbnZlcnRlciBpcyBwcm92aWRlZC5cbiAgICovXG4gIHNlYXJjaEF0dHJpYnV0ZXM/OiBTZWFyY2hBdHRyaWJ1dGVzO1xufVxuXG5leHBvcnQgdHlwZSBXaXRoV29ya2Zsb3dBcmdzPFcgZXh0ZW5kcyBXb3JrZmxvdywgVD4gPSBUICZcbiAgKFBhcmFtZXRlcnM8Vz4gZXh0ZW5kcyBbYW55LCAuLi5hbnlbXV1cbiAgICA/IHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEFyZ3VtZW50cyB0byBwYXNzIHRvIHRoZSBXb3JrZmxvd1xuICAgICAgICAgKi9cbiAgICAgICAgYXJnczogUGFyYW1ldGVyczxXPiB8IFJlYWRvbmx5PFBhcmFtZXRlcnM8Vz4+O1xuICAgICAgfVxuICAgIDoge1xuICAgICAgICAvKipcbiAgICAgICAgICogQXJndW1lbnRzIHRvIHBhc3MgdG8gdGhlIFdvcmtmbG93XG4gICAgICAgICAqL1xuICAgICAgICBhcmdzPzogUGFyYW1ldGVyczxXPiB8IFJlYWRvbmx5PFBhcmFtZXRlcnM8Vz4+O1xuICAgICAgfSk7XG5cbmV4cG9ydCBpbnRlcmZhY2UgV29ya2Zsb3dEdXJhdGlvbk9wdGlvbnMge1xuICAvKipcbiAgICogVGhlIHRpbWUgYWZ0ZXIgd2hpY2ggd29ya2Zsb3cgcnVuIGlzIGF1dG9tYXRpY2FsbHkgdGVybWluYXRlZCBieSBUZW1wb3JhbCBzZXJ2aWNlLiBEbyBub3RcbiAgICogcmVseSBvbiBydW4gdGltZW91dCBmb3IgYnVzaW5lc3MgbGV2ZWwgdGltZW91dHMuIEl0IGlzIHByZWZlcnJlZCB0byB1c2UgaW4gd29ya2Zsb3cgdGltZXJzXG4gICAqIGZvciB0aGlzIHB1cnBvc2UuXG4gICAqXG4gICAqIEBmb3JtYXQgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBvciB7QGxpbmsgaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvbXMgfCBtcy1mb3JtYXR0ZWQgc3RyaW5nfVxuICAgKi9cbiAgd29ya2Zsb3dSdW5UaW1lb3V0PzogRHVyYXRpb247XG5cbiAgLyoqXG4gICAqXG4gICAqIFRoZSB0aW1lIGFmdGVyIHdoaWNoIHdvcmtmbG93IGV4ZWN1dGlvbiAod2hpY2ggaW5jbHVkZXMgcnVuIHJldHJpZXMgYW5kIGNvbnRpbnVlIGFzIG5ldykgaXNcbiAgICogYXV0b21hdGljYWxseSB0ZXJtaW5hdGVkIGJ5IFRlbXBvcmFsIHNlcnZpY2UuIERvIG5vdCByZWx5IG9uIGV4ZWN1dGlvbiB0aW1lb3V0IGZvciBidXNpbmVzc1xuICAgKiBsZXZlbCB0aW1lb3V0cy4gSXQgaXMgcHJlZmVycmVkIHRvIHVzZSBpbiB3b3JrZmxvdyB0aW1lcnMgZm9yIHRoaXMgcHVycG9zZS5cbiAgICpcbiAgICogQGZvcm1hdCBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIG9yIHtAbGluayBodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9tcyB8IG1zLWZvcm1hdHRlZCBzdHJpbmd9XG4gICAqL1xuICB3b3JrZmxvd0V4ZWN1dGlvblRpbWVvdXQ/OiBEdXJhdGlvbjtcblxuICAvKipcbiAgICogTWF4aW11bSBleGVjdXRpb24gdGltZSBvZiBhIHNpbmdsZSB3b3JrZmxvdyB0YXNrLiBEZWZhdWx0IGlzIDEwIHNlY29uZHMuXG4gICAqXG4gICAqIEBmb3JtYXQgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBvciB7QGxpbmsgaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvbXMgfCBtcy1mb3JtYXR0ZWQgc3RyaW5nfVxuICAgKi9cbiAgd29ya2Zsb3dUYXNrVGltZW91dD86IER1cmF0aW9uO1xufVxuXG5leHBvcnQgdHlwZSBDb21tb25Xb3JrZmxvd09wdGlvbnMgPSBCYXNlV29ya2Zsb3dPcHRpb25zICYgV29ya2Zsb3dEdXJhdGlvbk9wdGlvbnM7XG5cbmV4cG9ydCBmdW5jdGlvbiBleHRyYWN0V29ya2Zsb3dUeXBlPFQgZXh0ZW5kcyBXb3JrZmxvdz4od29ya2Zsb3dUeXBlT3JGdW5jOiBzdHJpbmcgfCBUKTogc3RyaW5nIHtcbiAgaWYgKHR5cGVvZiB3b3JrZmxvd1R5cGVPckZ1bmMgPT09ICdzdHJpbmcnKSByZXR1cm4gd29ya2Zsb3dUeXBlT3JGdW5jIGFzIHN0cmluZztcbiAgaWYgKHR5cGVvZiB3b3JrZmxvd1R5cGVPckZ1bmMgPT09ICdmdW5jdGlvbicpIHtcbiAgICBpZiAod29ya2Zsb3dUeXBlT3JGdW5jPy5uYW1lKSByZXR1cm4gd29ya2Zsb3dUeXBlT3JGdW5jLm5hbWU7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSW52YWxpZCB3b3JrZmxvdyB0eXBlOiB0aGUgd29ya2Zsb3cgZnVuY3Rpb24gaXMgYW5vbnltb3VzJyk7XG4gIH1cbiAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICBgSW52YWxpZCB3b3JrZmxvdyB0eXBlOiBleHBlY3RlZCBlaXRoZXIgYSBzdHJpbmcgb3IgYSBmdW5jdGlvbiwgZ290ICcke3R5cGVvZiB3b3JrZmxvd1R5cGVPckZ1bmN9J2BcbiAgKTtcbn1cbiIsIi8vIEEgcG9ydCBvZiBhbiBhbGdvcml0aG0gYnkgSm9oYW5uZXMgQmFhZ8O4ZSA8YmFhZ29lQGJhYWdvZS5jb20+LCAyMDEwXG4vLyBodHRwOi8vYmFhZ29lLmNvbS9lbi9SYW5kb21NdXNpbmdzL2phdmFzY3JpcHQvXG4vLyBodHRwczovL2dpdGh1Yi5jb20vbnF1aW5sYW4vYmV0dGVyLXJhbmRvbS1udW1iZXJzLWZvci1qYXZhc2NyaXB0LW1pcnJvclxuLy8gT3JpZ2luYWwgd29yayBpcyB1bmRlciBNSVQgbGljZW5zZSAtXG5cbi8vIENvcHlyaWdodCAoQykgMjAxMCBieSBKb2hhbm5lcyBCYWFnw7hlIDxiYWFnb2VAYmFhZ29lLm9yZz5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG4vLyBUYWtlbiBhbmQgbW9kaWZpZWQgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vZGF2aWRiYXUvc2VlZHJhbmRvbS9ibG9iL3JlbGVhc2VkL2xpYi9hbGVhLmpzXG5cbmNsYXNzIEFsZWEge1xuICBwdWJsaWMgYzogbnVtYmVyO1xuICBwdWJsaWMgczA6IG51bWJlcjtcbiAgcHVibGljIHMxOiBudW1iZXI7XG4gIHB1YmxpYyBzMjogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKHNlZWQ6IG51bWJlcltdKSB7XG4gICAgY29uc3QgbWFzaCA9IG5ldyBNYXNoKCk7XG4gICAgLy8gQXBwbHkgdGhlIHNlZWRpbmcgYWxnb3JpdGhtIGZyb20gQmFhZ29lLlxuICAgIHRoaXMuYyA9IDE7XG4gICAgdGhpcy5zMCA9IG1hc2gubWFzaChbMzJdKTtcbiAgICB0aGlzLnMxID0gbWFzaC5tYXNoKFszMl0pO1xuICAgIHRoaXMuczIgPSBtYXNoLm1hc2goWzMyXSk7XG4gICAgdGhpcy5zMCAtPSBtYXNoLm1hc2goc2VlZCk7XG4gICAgaWYgKHRoaXMuczAgPCAwKSB7XG4gICAgICB0aGlzLnMwICs9IDE7XG4gICAgfVxuICAgIHRoaXMuczEgLT0gbWFzaC5tYXNoKHNlZWQpO1xuICAgIGlmICh0aGlzLnMxIDwgMCkge1xuICAgICAgdGhpcy5zMSArPSAxO1xuICAgIH1cbiAgICB0aGlzLnMyIC09IG1hc2gubWFzaChzZWVkKTtcbiAgICBpZiAodGhpcy5zMiA8IDApIHtcbiAgICAgIHRoaXMuczIgKz0gMTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgbmV4dCgpOiBudW1iZXIge1xuICAgIGNvbnN0IHQgPSAyMDkxNjM5ICogdGhpcy5zMCArIHRoaXMuYyAqIDIuMzI4MzA2NDM2NTM4Njk2M2UtMTA7IC8vIDJeLTMyXG4gICAgdGhpcy5zMCA9IHRoaXMuczE7XG4gICAgdGhpcy5zMSA9IHRoaXMuczI7XG4gICAgcmV0dXJuICh0aGlzLnMyID0gdCAtICh0aGlzLmMgPSB0IHwgMCkpO1xuICB9XG59XG5cbmV4cG9ydCB0eXBlIFJORyA9ICgpID0+IG51bWJlcjtcblxuZXhwb3J0IGZ1bmN0aW9uIGFsZWEoc2VlZDogbnVtYmVyW10pOiBSTkcge1xuICBjb25zdCB4ZyA9IG5ldyBBbGVhKHNlZWQpO1xuICByZXR1cm4geGcubmV4dC5iaW5kKHhnKTtcbn1cblxuZXhwb3J0IGNsYXNzIE1hc2gge1xuICBwcml2YXRlIG4gPSAweGVmYzgyNDlkO1xuXG4gIHB1YmxpYyBtYXNoKGRhdGE6IG51bWJlcltdKTogbnVtYmVyIHtcbiAgICBsZXQgeyBuIH0gPSB0aGlzO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuICAgICAgbiArPSBkYXRhW2ldO1xuICAgICAgbGV0IGggPSAwLjAyNTE5NjAzMjgyNDE2OTM4ICogbjtcbiAgICAgIG4gPSBoID4+PiAwO1xuICAgICAgaCAtPSBuO1xuICAgICAgaCAqPSBuO1xuICAgICAgbiA9IGggPj4+IDA7XG4gICAgICBoIC09IG47XG4gICAgICBuICs9IGggKiAweDEwMDAwMDAwMDsgLy8gMl4zMlxuICAgIH1cbiAgICB0aGlzLm4gPSBuO1xuICAgIHJldHVybiAobiA+Pj4gMCkgKiAyLjMyODMwNjQzNjUzODY5NjNlLTEwOyAvLyAyXi0zMlxuICB9XG59XG4iLCJpbXBvcnQgdHlwZSB7IEFzeW5jTG9jYWxTdG9yYWdlIGFzIEFMUyB9IGZyb20gJ25vZGU6YXN5bmNfaG9va3MnO1xuaW1wb3J0IHsgQ2FuY2VsbGVkRmFpbHVyZSwgRHVyYXRpb24sIElsbGVnYWxTdGF0ZUVycm9yIH0gZnJvbSAnQHRlbXBvcmFsaW8vY29tbW9uJztcbmltcG9ydCB7IG1zT3B0aW9uYWxUb051bWJlciB9IGZyb20gJ0B0ZW1wb3JhbGlvL2NvbW1vbi9saWIvdGltZSc7XG5pbXBvcnQgeyB1bnRyYWNrUHJvbWlzZSB9IGZyb20gJy4vc3RhY2staGVscGVycyc7XG5pbXBvcnQgeyBnZXRBY3RpdmF0b3IgfSBmcm9tICcuL2dsb2JhbC1hdHRyaWJ1dGVzJztcbmltcG9ydCB7IFNka0ZsYWdzIH0gZnJvbSAnLi9mbGFncyc7XG5cbi8vIEFzeW5jTG9jYWxTdG9yYWdlIGlzIGluamVjdGVkIHZpYSB2bSBtb2R1bGUgaW50byBnbG9iYWwgc2NvcGUuXG4vLyBJbiBjYXNlIFdvcmtmbG93IGNvZGUgaXMgaW1wb3J0ZWQgaW4gTm9kZS5qcyBjb250ZXh0LCByZXBsYWNlIHdpdGggYW4gZW1wdHkgY2xhc3MuXG5leHBvcnQgY29uc3QgQXN5bmNMb2NhbFN0b3JhZ2U6IG5ldyA8VD4oKSA9PiBBTFM8VD4gPSAoZ2xvYmFsVGhpcyBhcyBhbnkpLkFzeW5jTG9jYWxTdG9yYWdlID8/IGNsYXNzIHt9O1xuXG4vKiogTWFnaWMgc3ltYm9sIHVzZWQgdG8gY3JlYXRlIHRoZSByb290IHNjb3BlIC0gaW50ZW50aW9uYWxseSBub3QgZXhwb3J0ZWQgKi9cbmNvbnN0IE5PX1BBUkVOVCA9IFN5bWJvbCgnTk9fUEFSRU5UJyk7XG5cbi8qKlxuICogT3B0aW9uIGZvciBjb25zdHJ1Y3RpbmcgYSBDYW5jZWxsYXRpb25TY29wZVxuICovXG5leHBvcnQgaW50ZXJmYWNlIENhbmNlbGxhdGlvblNjb3BlT3B0aW9ucyB7XG4gIC8qKlxuICAgKiBUaW1lIGluIG1pbGxpc2Vjb25kcyBiZWZvcmUgdGhlIHNjb3BlIGNhbmNlbGxhdGlvbiBpcyBhdXRvbWF0aWNhbGx5IHJlcXVlc3RlZFxuICAgKi9cbiAgdGltZW91dD86IER1cmF0aW9uO1xuXG4gIC8qKlxuICAgKiBJZiBmYWxzZSwgcHJldmVudCBvdXRlciBjYW5jZWxsYXRpb24gZnJvbSBwcm9wYWdhdGluZyB0byBpbm5lciBzY29wZXMsIEFjdGl2aXRpZXMsIHRpbWVycywgYW5kIFRyaWdnZXJzLCBkZWZhdWx0cyB0byB0cnVlLlxuICAgKiAoU2NvcGUgc3RpbGwgcHJvcGFnYXRlcyBDYW5jZWxsZWRGYWlsdXJlIHRocm93biBmcm9tIHdpdGhpbikuXG4gICAqL1xuICBjYW5jZWxsYWJsZTogYm9vbGVhbjtcbiAgLyoqXG4gICAqIEFuIG9wdGlvbmFsIENhbmNlbGxhdGlvblNjb3BlICh1c2VmdWwgZm9yIHJ1bm5pbmcgYmFja2dyb3VuZCB0YXNrcykuXG4gICAqIFRoZSBgTk9fUEFSRU5UYCBzeW1ib2wgaXMgcmVzZXJ2ZWQgZm9yIHRoZSByb290IHNjb3BlLlxuICAgKi9cbiAgcGFyZW50PzogQ2FuY2VsbGF0aW9uU2NvcGUgfCB0eXBlb2YgTk9fUEFSRU5UO1xufVxuXG4vKipcbiAqIENhbmNlbGxhdGlvbiBTY29wZXMgcHJvdmlkZSB0aGUgbWVjaGFuaWMgYnkgd2hpY2ggYSBXb3JrZmxvdyBtYXkgZ3JhY2VmdWxseSBoYW5kbGUgaW5jb21pbmcgcmVxdWVzdHMgZm9yIGNhbmNlbGxhdGlvblxuICogKGUuZy4gaW4gcmVzcG9uc2UgdG8ge0BsaW5rIFdvcmtmbG93SGFuZGxlLmNhbmNlbH0gb3IgdGhyb3VnaCB0aGUgVUkgb3IgQ0xJKSwgYXMgd2VsbCBhcyByZXF1ZXN0IGNhbmNlbGF0aW9uIG9mXG4gKiBjYW5jZWxsYWJsZSBvcGVyYXRpb25zIGl0IG93bnMgKGUuZy4gQWN0aXZpdGllcywgVGltZXJzLCBDaGlsZCBXb3JrZmxvd3MsIGV0YykuXG4gKlxuICogQ2FuY2VsbGF0aW9uIFNjb3BlcyBmb3JtIGEgdHJlZSwgd2l0aCB0aGUgV29ya2Zsb3cncyBtYWluIGZ1bmN0aW9uIHJ1bm5pbmcgaW4gdGhlIHJvb3Qgc2NvcGUgb2YgdGhhdCB0cmVlLlxuICogQnkgZGVmYXVsdCwgY2FuY2VsbGF0aW9uIHByb3BhZ2F0ZXMgZG93biBmcm9tIGEgcGFyZW50IHNjb3BlIHRvIGl0cyBjaGlsZHJlbiBhbmQgaXRzIGNhbmNlbGxhYmxlIG9wZXJhdGlvbnMuXG4gKiBBIG5vbi1jYW5jZWxsYWJsZSBzY29wZSBjYW4gcmVjZWl2ZSBjYW5jZWxsYXRpb24gcmVxdWVzdHMsIGJ1dCBpcyBuZXZlciBlZmZlY3RpdmVseSBjb25zaWRlcmVkIGFzIGNhbmNlbGxlZCxcbiAqIHRodXMgc2hpZWxkZGluZyBpdHMgY2hpbGRyZW4gYW5kIGNhbmNlbGxhYmxlIG9wZXJhdGlvbnMgZnJvbSBwcm9wYWdhdGlvbiBvZiBjYW5jZWxsYXRpb24gcmVxdWVzdHMgaXQgcmVjZWl2ZXMuXG4gKlxuICogU2NvcGVzIGFyZSBjcmVhdGVkIHVzaW5nIHRoZSBgQ2FuY2VsbGF0aW9uU2NvcGVgIGNvbnN0cnVjdG9yIG9yIHRoZSBzdGF0aWMgaGVscGVyIG1ldGhvZHMge0BsaW5rIGNhbmNlbGxhYmxlfSxcbiAqIHtAbGluayBub25DYW5jZWxsYWJsZX0gYW5kIHtAbGluayB3aXRoVGltZW91dH0uIGB3aXRoVGltZW91dGAgY3JlYXRlcyBhIHNjb3BlIHRoYXQgYXV0b21hdGljYWxseSBjYW5jZWxzIGl0c2VsZiBhZnRlclxuICogc29tZSBkdXJhdGlvbi5cbiAqXG4gKiBDYW5jZWxsYXRpb24gb2YgYSBjYW5jZWxsYWJsZSBzY29wZSByZXN1bHRzIGluIGFsbCBvcGVyYXRpb25zIGNyZWF0ZWQgZGlyZWN0bHkgaW4gdGhhdCBzY29wZSB0byB0aHJvdyBhXG4gKiB7QGxpbmsgQ2FuY2VsbGVkRmFpbHVyZX0gKGVpdGhlciBkaXJlY3RseSwgb3IgYXMgdGhlIGBjYXVzZWAgb2YgYW4ge0BsaW5rIEFjdGl2aXR5RmFpbHVyZX0gb3IgYVxuICoge0BsaW5rIENoaWxkV29ya2Zsb3dGYWlsdXJlfSkuIEZ1cnRoZXIgYXR0ZW1wdCB0byBjcmVhdGUgbmV3IGNhbmNlbGxhYmxlIHNjb3BlcyBvciBjYW5jZWxsYWJsZSBvcGVyYXRpb25zIHdpdGhpbiBhXG4gKiBzY29wZSB0aGF0IGhhcyBhbHJlYWR5IGJlZW4gY2FuY2VsbGVkIHdpbGwgYWxzbyBpbW1lZGlhdGVseSB0aHJvdyBhIHtAbGluayBDYW5jZWxsZWRGYWlsdXJlfSBleGNlcHRpb24uIEl0IGlzIGhvd2V2ZXJcbiAqIHBvc3NpYmxlIHRvIGNyZWF0ZSBhIG5vbi1jYW5jZWxsYWJsZSBzY29wZSBhdCB0aGF0IHBvaW50OyB0aGlzIGlzIG9mdGVuIHVzZWQgdG8gZXhlY3V0ZSByb2xsYmFjayBvciBjbGVhbnVwXG4gKiBvcGVyYXRpb25zLiBGb3IgZXhhbXBsZTpcbiAqXG4gKiBgYGB0c1xuICogYXN5bmMgZnVuY3Rpb24gbXlXb3JrZmxvdyguLi4pOiBQcm9taXNlPHZvaWQ+IHtcbiAqICAgdHJ5IHtcbiAqICAgICAvLyBUaGlzIGFjdGl2aXR5IHJ1bnMgaW4gdGhlIHJvb3QgY2FuY2VsbGF0aW9uIHNjb3BlLiBUaGVyZWZvcmUsIGEgY2FuY2VsYXRpb24gcmVxdWVzdCBvblxuICogICAgIC8vIHRoZSBXb3JrZmxvdyBleGVjdXRpb24gKGUuZy4gdGhyb3VnaCB0aGUgVUkgb3IgQ0xJKSBhdXRvbWF0aWNhbGx5IHByb3BhZ2F0ZXMgdG8gdGhpc1xuICogICAgIC8vIGFjdGl2aXR5LiBBc3N1bWluZyB0aGF0IHRoZSBhY3Rpdml0eSBwcm9wZXJseSBoYW5kbGUgdGhlIGNhbmNlbGxhdGlvbiByZXF1ZXN0LCB0aGVuIHRoZVxuICogICAgIC8vIGNhbGwgYmVsb3cgd2lsbCB0aHJvdyBhbiBgQWN0aXZpdHlGYWlsdXJlYCBleGNlcHRpb24sIHdpdGggYGNhdXNlYCBzZXRzIHRvIGFuXG4gKiAgICAgLy8gaW5zdGFuY2Ugb2YgYENhbmNlbGxlZEZhaWx1cmVgLlxuICogICAgIGF3YWl0IHNvbWVBY3Rpdml0eSgpO1xuICogICB9IGNhdGNoIChlKSB7XG4gKiAgICAgaWYgKGlzQ2FuY2VsbGF0aW9uKGUpKSB7XG4gKiAgICAgICAvLyBSdW4gY2xlYW51cCBhY3Rpdml0eSBpbiBhIG5vbi1jYW5jZWxsYWJsZSBzY29wZVxuICogICAgICAgYXdhaXQgQ2FuY2VsbGF0aW9uU2NvcGUubm9uQ2FuY2VsbGFibGUoYXN5bmMgKCkgPT4ge1xuICogICAgICAgICBhd2FpdCBjbGVhbnVwQWN0aXZpdHkoKTtcbiAqICAgICAgIH1cbiAqICAgICB9IGVsc2Uge1xuICogICAgICAgdGhyb3cgZTtcbiAqICAgICB9XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICpcbiAqIEEgY2FuY2VsbGFibGUgc2NvcGUgbWF5IGJlIHByb2dyYW1hdGljYWxseSBjYW5jZWxsZWQgYnkgY2FsbGluZyB7QGxpbmsgY2FuY2VsfGBzY29wZS5jYW5jZWwoKWB9YC4gVGhpcyBtYXkgYmUgdXNlZCxcbiAqIGZvciBleGFtcGxlLCB0byBleHBsaWNpdGx5IHJlcXVlc3QgY2FuY2VsbGF0aW9uIG9mIGFuIEFjdGl2aXR5IG9yIENoaWxkIFdvcmtmbG93OlxuICpcbiAqIGBgYHRzXG4gKiBjb25zdCBjYW5jZWxsYWJsZUFjdGl2aXR5U2NvcGUgPSBuZXcgQ2FuY2VsbGF0aW9uU2NvcGUoKTtcbiAqIGNvbnN0IGFjdGl2aXR5UHJvbWlzZSA9IGNhbmNlbGxhYmxlQWN0aXZpdHlTY29wZS5ydW4oKCkgPT4gc29tZUFjdGl2aXR5KCkpO1xuICogY2FuY2VsbGFibGVBY3Rpdml0eVNjb3BlLmNhbmNlbCgpOyAvLyBDYW5jZWxzIHRoZSBhY3Rpdml0eVxuICogYXdhaXQgYWN0aXZpdHlQcm9taXNlOyAvLyBUaHJvd3MgYEFjdGl2aXR5RmFpbHVyZWAgd2l0aCBgY2F1c2VgIHNldCB0byBgQ2FuY2VsbGVkRmFpbHVyZWBcbiAqIGBgYFxuICovXG5leHBvcnQgY2xhc3MgQ2FuY2VsbGF0aW9uU2NvcGUge1xuICAvKipcbiAgICogVGltZSBpbiBtaWxsaXNlY29uZHMgYmVmb3JlIHRoZSBzY29wZSBjYW5jZWxsYXRpb24gaXMgYXV0b21hdGljYWxseSByZXF1ZXN0ZWRcbiAgICovXG4gIHByb3RlY3RlZCByZWFkb25seSB0aW1lb3V0PzogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiBJZiBmYWxzZSwgdGhlbiB0aGlzIHNjb3BlIHdpbGwgbmV2ZXIgYmUgY29uc2lkZXJlZCBjYW5jZWxsZWQsIGV2ZW4gaWYgYSBjYW5jZWxsYXRpb24gcmVxdWVzdCBpcyByZWNlaXZlZCAoZWl0aGVyXG4gICAqIGRpcmVjdGx5IGJ5IGNhbGxpbmcgYHNjb3BlLmNhbmNlbCgpYCBvciBpbmRpcmVjdGx5IGJ5IGNhbmNlbGxpbmcgYSBjYW5jZWxsYWJsZSBwYXJlbnQgc2NvcGUpLiBUaGlzIGVmZmVjdGl2ZWx5XG4gICAqIHNoaWVsZHMgdGhlIHNjb3BlJ3MgY2hpbGRyZW4gYW5kIGNhbmNlbGxhYmxlIG9wZXJhdGlvbnMgZnJvbSBwcm9wYWdhdGlvbiBvZiBjYW5jZWxsYXRpb24gcmVxdWVzdHMgbWFkZSBvbiB0aGVcbiAgICogbm9uLWNhbmNlbGxhYmxlIHNjb3BlLlxuICAgKlxuICAgKiBOb3RlIHRoYXQgdGhlIFByb21pc2UgcmV0dXJuZWQgYnkgdGhlIGBydW5gIGZ1bmN0aW9uIG9mIG5vbi1jYW5jZWxsYWJsZSBzY29wZSBtYXkgc3RpbGwgdGhyb3cgYSBgQ2FuY2VsbGVkRmFpbHVyZWBcbiAgICogaWYgc3VjaCBhbiBleGNlcHRpb24gaXMgdGhyb3duIGZyb20gd2l0aGluIHRoYXQgc2NvcGUgKGUuZy4gYnkgZGlyZWN0bHkgY2FuY2VsbGluZyBhIGNhbmNlbGxhYmxlIGNoaWxkIHNjb3BlKS5cbiAgICovXG4gIHB1YmxpYyByZWFkb25seSBjYW5jZWxsYWJsZTogYm9vbGVhbjtcblxuICAvKipcbiAgICogQW4gb3B0aW9uYWwgQ2FuY2VsbGF0aW9uU2NvcGUgKHVzZWZ1bCBmb3IgcnVubmluZyBiYWNrZ3JvdW5kIHRhc2tzKSwgZGVmYXVsdHMgdG8ge0BsaW5rIENhbmNlbGxhdGlvblNjb3BlLmN1cnJlbnR9KClcbiAgICovXG4gIHB1YmxpYyByZWFkb25seSBwYXJlbnQ/OiBDYW5jZWxsYXRpb25TY29wZTtcblxuICAvKipcbiAgICogQSBQcm9taXNlIHRoYXQgdGhyb3dzIHdoZW4gYSBjYW5jZWxsYWJsZSBzY29wZSByZWNlaXZlcyBhIGNhbmNlbGxhdGlvbiByZXF1ZXN0LCBlaXRoZXIgZGlyZWN0bHlcbiAgICogKGkuZS4gYHNjb3BlLmNhbmNlbCgpYCksIG9yIGluZGlyZWN0bHkgKGJ5IGNhbmNlbGxpbmcgYSBjYW5jZWxsYWJsZSBwYXJlbnQgc2NvcGUpLlxuICAgKlxuICAgKiBOb3RlIHRoYXQgYSBub24tY2FuY2VsbGFibGUgc2NvcGUgbWF5IHJlY2VpdmUgY2FuY2VsbGF0aW9uIHJlcXVlc3RzLCByZXN1bHRpbmcgaW4gdGhlIGBjYW5jZWxSZXF1ZXN0ZWRgIHByb21pc2UgZm9yXG4gICAqIHRoYXQgc2NvcGUgdG8gdGhyb3csIHRob3VnaCB0aGUgc2NvcGUgd2lsbCBub3QgZWZmZWN0aXZlbHkgZ2V0IGNhbmNlbGxlZCAoaS5lLiBgY29uc2lkZXJlZENhbmNlbGxlZGAgd2lsbCBzdGlsbFxuICAgKiByZXR1cm4gYGZhbHNlYCwgYW5kIGNhbmNlbGxhdGlvbiB3aWxsIG5vdCBiZSBwcm9wYWdhdGVkIHRvIGNoaWxkIHNjb3BlcyBhbmQgY29udGFpbmVkIG9wZXJhdGlvbnMpLlxuICAgKi9cbiAgcHVibGljIHJlYWRvbmx5IGNhbmNlbFJlcXVlc3RlZDogUHJvbWlzZTxuZXZlcj47XG5cbiAgI2NhbmNlbFJlcXVlc3RlZCA9IGZhbHNlO1xuXG4gIC8vIFR5cGVzY3JpcHQgZG9lcyBub3QgdW5kZXJzdGFuZCB0aGF0IHRoZSBQcm9taXNlIGV4ZWN1dG9yIHJ1bnMgc3luY2hyb25vdXNseSBpbiB0aGUgY29uc3RydWN0b3JcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9iYW4tdHMtY29tbWVudFxuICAvLyBAdHMtaWdub3JlXG4gIHByb3RlY3RlZCByZWFkb25seSByZWplY3Q6IChyZWFzb24/OiBhbnkpID0+IHZvaWQ7XG5cbiAgY29uc3RydWN0b3Iob3B0aW9ucz86IENhbmNlbGxhdGlvblNjb3BlT3B0aW9ucykge1xuICAgIHRoaXMudGltZW91dCA9IG1zT3B0aW9uYWxUb051bWJlcihvcHRpb25zPy50aW1lb3V0KTtcbiAgICB0aGlzLmNhbmNlbGxhYmxlID0gb3B0aW9ucz8uY2FuY2VsbGFibGUgPz8gdHJ1ZTtcbiAgICB0aGlzLmNhbmNlbFJlcXVlc3RlZCA9IG5ldyBQcm9taXNlKChfLCByZWplY3QpID0+IHtcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgVFNDIGRvZXNuJ3QgdW5kZXJzdGFuZCB0aGF0IHRoZSBQcm9taXNlIGV4ZWN1dG9yIHJ1bnMgc3luY2hyb25vdXNseVxuICAgICAgdGhpcy5yZWplY3QgPSAoZXJyKSA9PiB7XG4gICAgICAgIHRoaXMuI2NhbmNlbFJlcXVlc3RlZCA9IHRydWU7XG4gICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgICB1bnRyYWNrUHJvbWlzZSh0aGlzLmNhbmNlbFJlcXVlc3RlZCk7XG4gICAgLy8gQXZvaWQgdW5oYW5kbGVkIHJlamVjdGlvbnNcbiAgICB1bnRyYWNrUHJvbWlzZSh0aGlzLmNhbmNlbFJlcXVlc3RlZC5jYXRjaCgoKSA9PiB1bmRlZmluZWQpKTtcbiAgICBpZiAob3B0aW9ucz8ucGFyZW50ICE9PSBOT19QQVJFTlQpIHtcbiAgICAgIHRoaXMucGFyZW50ID0gb3B0aW9ucz8ucGFyZW50IHx8IENhbmNlbGxhdGlvblNjb3BlLmN1cnJlbnQoKTtcbiAgICAgIGlmIChcbiAgICAgICAgdGhpcy5wYXJlbnQuY2FuY2VsbGFibGUgfHxcbiAgICAgICAgKHRoaXMucGFyZW50LiNjYW5jZWxSZXF1ZXN0ZWQgJiZcbiAgICAgICAgICAhZ2V0QWN0aXZhdG9yKCkuaGFzRmxhZyhTZGtGbGFncy5Ob25DYW5jZWxsYWJsZVNjb3Blc0FyZVNoaWVsZGVkRnJvbVByb3BhZ2F0aW9uKSlcbiAgICAgICkge1xuICAgICAgICB0aGlzLiNjYW5jZWxSZXF1ZXN0ZWQgPSB0aGlzLnBhcmVudC4jY2FuY2VsUmVxdWVzdGVkO1xuICAgICAgICB1bnRyYWNrUHJvbWlzZShcbiAgICAgICAgICB0aGlzLnBhcmVudC5jYW5jZWxSZXF1ZXN0ZWQuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgdGhpcy5yZWplY3QoZXJyKTtcbiAgICAgICAgICB9KVxuICAgICAgICApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdW50cmFja1Byb21pc2UoXG4gICAgICAgICAgdGhpcy5wYXJlbnQuY2FuY2VsUmVxdWVzdGVkLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgIGlmICghZ2V0QWN0aXZhdG9yKCkuaGFzRmxhZyhTZGtGbGFncy5Ob25DYW5jZWxsYWJsZVNjb3Blc0FyZVNoaWVsZGVkRnJvbVByb3BhZ2F0aW9uKSkge1xuICAgICAgICAgICAgICB0aGlzLnJlamVjdChlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhlIHNjb3BlIHdhcyBlZmZlY3RpdmVseSBjYW5jZWxsZWQuIEEgbm9uLWNhbmNlbGxhYmxlIHNjb3BlIGNhbiBuZXZlciBiZSBjb25zaWRlcmVkIGNhbmNlbGxlZC5cbiAgICovXG4gIHB1YmxpYyBnZXQgY29uc2lkZXJlZENhbmNlbGxlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy4jY2FuY2VsUmVxdWVzdGVkICYmIHRoaXMuY2FuY2VsbGFibGU7XG4gIH1cblxuICAvKipcbiAgICogQWN0aXZhdGUgdGhlIHNjb3BlIGFzIGN1cnJlbnQgYW5kIHJ1biAgYGZuYFxuICAgKlxuICAgKiBBbnkgdGltZXJzLCBBY3Rpdml0aWVzLCBUcmlnZ2VycyBhbmQgQ2FuY2VsbGF0aW9uU2NvcGVzIGNyZWF0ZWQgaW4gdGhlIGJvZHkgb2YgYGZuYFxuICAgKiBhdXRvbWF0aWNhbGx5IGxpbmsgdGhlaXIgY2FuY2VsbGF0aW9uIHRvIHRoaXMgc2NvcGUuXG4gICAqXG4gICAqIEByZXR1cm4gdGhlIHJlc3VsdCBvZiBgZm5gXG4gICAqL1xuICBydW48VD4oZm46ICgpID0+IFByb21pc2U8VD4pOiBQcm9taXNlPFQ+IHtcbiAgICByZXR1cm4gc3RvcmFnZS5ydW4odGhpcywgdGhpcy5ydW5JbkNvbnRleHQuYmluZCh0aGlzLCBmbikgYXMgKCkgPT4gUHJvbWlzZTxUPik7XG4gIH1cblxuICAvKipcbiAgICogTWV0aG9kIHRoYXQgcnVucyBhIGZ1bmN0aW9uIGluIEFzeW5jTG9jYWxTdG9yYWdlIGNvbnRleHQuXG4gICAqXG4gICAqIENvdWxkIGhhdmUgYmVlbiB3cml0dGVuIGFzIGFub255bW91cyBmdW5jdGlvbiwgbWFkZSBpbnRvIGEgbWV0aG9kIGZvciBpbXByb3ZlZCBzdGFjayB0cmFjZXMuXG4gICAqL1xuICBwcm90ZWN0ZWQgYXN5bmMgcnVuSW5Db250ZXh0PFQ+KGZuOiAoKSA9PiBQcm9taXNlPFQ+KTogUHJvbWlzZTxUPiB7XG4gICAgbGV0IHRpbWVyU2NvcGU6IENhbmNlbGxhdGlvblNjb3BlIHwgdW5kZWZpbmVkO1xuICAgIGlmICh0aGlzLnRpbWVvdXQpIHtcbiAgICAgIHRpbWVyU2NvcGUgPSBuZXcgQ2FuY2VsbGF0aW9uU2NvcGUoKTtcbiAgICAgIHVudHJhY2tQcm9taXNlKFxuICAgICAgICB0aW1lclNjb3BlXG4gICAgICAgICAgLnJ1bigoKSA9PiBzbGVlcCh0aGlzLnRpbWVvdXQgYXMgbnVtYmVyKSlcbiAgICAgICAgICAudGhlbihcbiAgICAgICAgICAgICgpID0+IHRoaXMuY2FuY2VsKCksXG4gICAgICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgICAgIC8vIHNjb3BlIHdhcyBhbHJlYWR5IGNhbmNlbGxlZCwgaWdub3JlXG4gICAgICAgICAgICB9XG4gICAgICAgICAgKVxuICAgICAgKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBhd2FpdCBmbigpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBpZiAoXG4gICAgICAgIHRpbWVyU2NvcGUgJiZcbiAgICAgICAgIXRpbWVyU2NvcGUuY29uc2lkZXJlZENhbmNlbGxlZCAmJlxuICAgICAgICBnZXRBY3RpdmF0b3IoKS5oYXNGbGFnKFNka0ZsYWdzLk5vbkNhbmNlbGxhYmxlU2NvcGVzQXJlU2hpZWxkZWRGcm9tUHJvcGFnYXRpb24pXG4gICAgICApIHtcbiAgICAgICAgdGltZXJTY29wZS5jYW5jZWwoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVxdWVzdCB0byBjYW5jZWwgdGhlIHNjb3BlIGFuZCBsaW5rZWQgY2hpbGRyZW5cbiAgICovXG4gIGNhbmNlbCgpOiB2b2lkIHtcbiAgICB0aGlzLnJlamVjdChuZXcgQ2FuY2VsbGVkRmFpbHVyZSgnQ2FuY2VsbGF0aW9uIHNjb3BlIGNhbmNlbGxlZCcpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGN1cnJlbnQgXCJhY3RpdmVcIiBzY29wZVxuICAgKi9cbiAgc3RhdGljIGN1cnJlbnQoKTogQ2FuY2VsbGF0aW9uU2NvcGUge1xuICAgIC8vIFVzaW5nIGdsb2JhbHMgZGlyZWN0bHkgaW5zdGVhZCBvZiBhIGhlbHBlciBmdW5jdGlvbiB0byBhdm9pZCBjaXJjdWxhciBpbXBvcnRcbiAgICByZXR1cm4gc3RvcmFnZS5nZXRTdG9yZSgpID8/IChnbG9iYWxUaGlzIGFzIGFueSkuX19URU1QT1JBTF9BQ1RJVkFUT1JfXy5yb290U2NvcGU7XG4gIH1cblxuICAvKiogQWxpYXMgdG8gYG5ldyBDYW5jZWxsYXRpb25TY29wZSh7IGNhbmNlbGxhYmxlOiB0cnVlIH0pLnJ1bihmbilgICovXG4gIHN0YXRpYyBjYW5jZWxsYWJsZTxUPihmbjogKCkgPT4gUHJvbWlzZTxUPik6IFByb21pc2U8VD4ge1xuICAgIHJldHVybiBuZXcgdGhpcyh7IGNhbmNlbGxhYmxlOiB0cnVlIH0pLnJ1bihmbik7XG4gIH1cblxuICAvKiogQWxpYXMgdG8gYG5ldyBDYW5jZWxsYXRpb25TY29wZSh7IGNhbmNlbGxhYmxlOiBmYWxzZSB9KS5ydW4oZm4pYCAqL1xuICBzdGF0aWMgbm9uQ2FuY2VsbGFibGU8VD4oZm46ICgpID0+IFByb21pc2U8VD4pOiBQcm9taXNlPFQ+IHtcbiAgICByZXR1cm4gbmV3IHRoaXMoeyBjYW5jZWxsYWJsZTogZmFsc2UgfSkucnVuKGZuKTtcbiAgfVxuXG4gIC8qKiBBbGlhcyB0byBgbmV3IENhbmNlbGxhdGlvblNjb3BlKHsgY2FuY2VsbGFibGU6IHRydWUsIHRpbWVvdXQgfSkucnVuKGZuKWAgKi9cbiAgc3RhdGljIHdpdGhUaW1lb3V0PFQ+KHRpbWVvdXQ6IER1cmF0aW9uLCBmbjogKCkgPT4gUHJvbWlzZTxUPik6IFByb21pc2U8VD4ge1xuICAgIHJldHVybiBuZXcgdGhpcyh7IGNhbmNlbGxhYmxlOiB0cnVlLCB0aW1lb3V0IH0pLnJ1bihmbik7XG4gIH1cbn1cblxuY29uc3Qgc3RvcmFnZSA9IG5ldyBBc3luY0xvY2FsU3RvcmFnZTxDYW5jZWxsYXRpb25TY29wZT4oKTtcblxuLyoqXG4gKiBBdm9pZCBleHBvc2luZyB0aGUgc3RvcmFnZSBkaXJlY3RseSBzbyBpdCBkb2Vzbid0IGdldCBmcm96ZW5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRpc2FibGVTdG9yYWdlKCk6IHZvaWQge1xuICBzdG9yYWdlLmRpc2FibGUoKTtcbn1cblxuZXhwb3J0IGNsYXNzIFJvb3RDYW5jZWxsYXRpb25TY29wZSBleHRlbmRzIENhbmNlbGxhdGlvblNjb3BlIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoeyBjYW5jZWxsYWJsZTogdHJ1ZSwgcGFyZW50OiBOT19QQVJFTlQgfSk7XG4gIH1cblxuICBjYW5jZWwoKTogdm9pZCB7XG4gICAgdGhpcy5yZWplY3QobmV3IENhbmNlbGxlZEZhaWx1cmUoJ1dvcmtmbG93IGNhbmNlbGxlZCcpKTtcbiAgfVxufVxuXG4vKiogVGhpcyBmdW5jdGlvbiBpcyBoZXJlIHRvIGF2b2lkIGEgY2lyY3VsYXIgZGVwZW5kZW5jeSBiZXR3ZWVuIHRoaXMgbW9kdWxlIGFuZCB3b3JrZmxvdy50cyAqL1xubGV0IHNsZWVwID0gKF86IER1cmF0aW9uKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gIHRocm93IG5ldyBJbGxlZ2FsU3RhdGVFcnJvcignV29ya2Zsb3cgaGFzIG5vdCBiZWVuIHByb3Blcmx5IGluaXRpYWxpemVkJyk7XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJTbGVlcEltcGxlbWVudGF0aW9uKGZuOiB0eXBlb2Ygc2xlZXApOiB2b2lkIHtcbiAgc2xlZXAgPSBmbjtcbn1cbiIsImltcG9ydCB7IEFjdGl2aXR5RmFpbHVyZSwgQ2FuY2VsbGVkRmFpbHVyZSwgQ2hpbGRXb3JrZmxvd0ZhaWx1cmUgfSBmcm9tICdAdGVtcG9yYWxpby9jb21tb24nO1xuaW1wb3J0IHsgU3ltYm9sQmFzZWRJbnN0YW5jZU9mRXJyb3IgfSBmcm9tICdAdGVtcG9yYWxpby9jb21tb24vbGliL3R5cGUtaGVscGVycyc7XG5pbXBvcnQgeyBjb3Jlc2RrIH0gZnJvbSAnQHRlbXBvcmFsaW8vcHJvdG8nO1xuXG4vKipcbiAqIEJhc2UgY2xhc3MgZm9yIGFsbCB3b3JrZmxvdyBlcnJvcnNcbiAqL1xuQFN5bWJvbEJhc2VkSW5zdGFuY2VPZkVycm9yKCdXb3JrZmxvd0Vycm9yJylcbmV4cG9ydCBjbGFzcyBXb3JrZmxvd0Vycm9yIGV4dGVuZHMgRXJyb3Ige31cblxuLyoqXG4gKiBUaHJvd24gaW4gd29ya2Zsb3cgd2hlbiBpdCB0cmllcyB0byBkbyBzb21ldGhpbmcgdGhhdCBub24tZGV0ZXJtaW5pc3RpYyBzdWNoIGFzIGNvbnN0cnVjdCBhIFdlYWtSZWYoKVxuICovXG5AU3ltYm9sQmFzZWRJbnN0YW5jZU9mRXJyb3IoJ0RldGVybWluaXNtVmlvbGF0aW9uRXJyb3InKVxuZXhwb3J0IGNsYXNzIERldGVybWluaXNtVmlvbGF0aW9uRXJyb3IgZXh0ZW5kcyBXb3JrZmxvd0Vycm9yIHt9XG5cbi8qKlxuICogQSBjbGFzcyB0aGF0IGFjdHMgYXMgYSBtYXJrZXIgZm9yIHRoaXMgc3BlY2lhbCByZXN1bHQgdHlwZVxuICovXG5AU3ltYm9sQmFzZWRJbnN0YW5jZU9mRXJyb3IoJ0xvY2FsQWN0aXZpdHlEb0JhY2tvZmYnKVxuZXhwb3J0IGNsYXNzIExvY2FsQWN0aXZpdHlEb0JhY2tvZmYgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyByZWFkb25seSBiYWNrb2ZmOiBjb3Jlc2RrLmFjdGl2aXR5X3Jlc3VsdC5JRG9CYWNrb2ZmKSB7XG4gICAgc3VwZXIoKTtcbiAgfVxufVxuXG4vKipcbiAqIFJldHVybnMgd2hldGhlciBwcm92aWRlZCBgZXJyYCBpcyBjYXVzZWQgYnkgY2FuY2VsbGF0aW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0NhbmNlbGxhdGlvbihlcnI6IHVua25vd24pOiBib29sZWFuIHtcbiAgcmV0dXJuIChcbiAgICBlcnIgaW5zdGFuY2VvZiBDYW5jZWxsZWRGYWlsdXJlIHx8XG4gICAgKChlcnIgaW5zdGFuY2VvZiBBY3Rpdml0eUZhaWx1cmUgfHwgZXJyIGluc3RhbmNlb2YgQ2hpbGRXb3JrZmxvd0ZhaWx1cmUpICYmIGVyci5jYXVzZSBpbnN0YW5jZW9mIENhbmNlbGxlZEZhaWx1cmUpXG4gICk7XG59XG4iLCJpbXBvcnQgdHlwZSB7IFdvcmtmbG93SW5mbyB9IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5cbmV4cG9ydCB0eXBlIFNka0ZsYWcgPSB7XG4gIGdldCBpZCgpOiBudW1iZXI7XG4gIGdldCBkZWZhdWx0KCk6IGJvb2xlYW47XG4gIGdldCBhbHRlcm5hdGl2ZUNvbmRpdGlvbnMoKTogQWx0Q29uZGl0aW9uRm5bXSB8IHVuZGVmaW5lZDtcbn07XG5cbmNvbnN0IGZsYWdzUmVnaXN0cnk6IE1hcDxudW1iZXIsIFNka0ZsYWc+ID0gbmV3IE1hcCgpO1xuXG5leHBvcnQgY29uc3QgU2RrRmxhZ3MgPSB7XG4gIC8qKlxuICAgKiBUaGlzIGZsYWcgZ2F0ZXMgbXVsdGlwbGUgZml4ZXMgcmVsYXRlZCB0byBjYW5jZWxsYXRpb24gc2NvcGVzIGFuZCB0aW1lcnMgaW50cm9kdWNlZCBpbiAxLjEwLjIvMS4xMS4wOlxuICAgKiAtIENhbmNlbGxhdGlvbiBvZiBhIG5vbi1jYW5jZWxsYWJsZSBzY29wZSBubyBsb25nZXIgcHJvcGFnYXRlcyB0byBjaGlsZHJlbiBzY29wZXNcbiAgICogICAoc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS90ZW1wb3JhbGlvL3Nkay10eXBlc2NyaXB0L2lzc3Vlcy8xNDIzKS5cbiAgICogLSBDYW5jZWxsYXRpb25TY29wZS53aXRoVGltZW91dChmbikgbm93IGNhbmNlbCB0aGUgdGltZXIgaWYgYGZuYCBjb21wbGV0ZXMgYmVmb3JlIGV4cGlyYXRpb25cbiAgICogICBvZiB0aGUgdGltZW91dCwgc2ltaWxhciB0byBob3cgYGNvbmRpdGlvbihmbiwgdGltZW91dClgIHdvcmtzLlxuICAgKiAtIFRpbWVycyBjcmVhdGVkIHVzaW5nIHNldFRpbWVvdXQgY2FuIG5vdyBiZSBpbnRlcmNlcHRlZC5cbiAgICpcbiAgICogQHNpbmNlIEludHJvZHVjZWQgaW4gMS4xMC4yLzEuMTEuMC4gSG93ZXZlciwgZHVlIHRvIGFuIFNESyBidWcsIFNES3MgdjEuMTEuMCBhbmQgdjEuMTEuMSB3ZXJlIG5vdFxuICAgKiAgICAgICAgcHJvcGVybHkgd3JpdGluZyBiYWNrIHRoZSBmbGFncyB0byBoaXN0b3J5LCBwb3NzaWJseSByZXN1bHRpbmcgaW4gTkRFIG9uIHJlcGxheS4gV2UgdGhlcmVmb3JlXG4gICAqICAgICAgICBjb25zaWRlciB0aGF0IGEgV0ZUIGVtaXR0ZWQgYnkgV29ya2VyIHYxLjExLjAgb3IgdjEuMTEuMSB0byBpbXBsaWNpdGx5IGhhdmUgdGhpcyBmbGFnIG9uLlxuICAgKi9cbiAgTm9uQ2FuY2VsbGFibGVTY29wZXNBcmVTaGllbGRlZEZyb21Qcm9wYWdhdGlvbjogZGVmaW5lRmxhZygxLCB0cnVlLCBbYnVpbGRJZFNka1ZlcnNpb25NYXRjaGVzKC8xXFwuMTFcXC5bMDFdLyldKSxcblxuICAvKipcbiAgICogUHJpb3IgdG8gMS4xMS4wLCB3aGVuIHByb2Nlc3NpbmcgYSBXb3JrZmxvdyBhY3RpdmF0aW9uLCB0aGUgU0RLIHdvdWxkIGV4ZWN1dGUgYG5vdGlmeUhhc1BhdGNoYFxuICAgKiBhbmQgYHNpZ25hbFdvcmtmbG93YCBqb2JzIGluIGRpc3RpbmN0IHBoYXNlcywgYmVmb3JlIG90aGVyIHR5cGVzIG9mIGpvYnMuIFRoZSBwcmltYXJ5IHJlYXNvblxuICAgKiBiZWhpbmQgdGhhdCBtdWx0aS1waGFzZSBhbGdvcml0aG0gd2FzIHRvIGF2b2lkIHRoZSBwb3NzaWJpbGl0eSB0aGF0IGEgV29ya2Zsb3cgZXhlY3V0aW9uIG1pZ2h0XG4gICAqIGNvbXBsZXRlIGJlZm9yZSBhbGwgaW5jb21pbmcgc2lnbmFscyBoYXZlIGJlZW4gZGlzcGF0Y2hlZCAoYXQgbGVhc3QgdG8gdGhlIHBvaW50IHRoYXQgdGhlXG4gICAqIF9zeW5jaHJvbm91c18gcGFydCBvZiB0aGUgaGFuZGxlciBmdW5jdGlvbiBoYXMgYmVlbiBleGVjdXRlZCkuXG4gICAqXG4gICAqIFRoaXMgZmxhZyByZXBsYWNlcyB0aGF0IG11bHRpLXBoYXNlIGFsZ29yaXRobSB3aXRoIGEgc2ltcGxlciBvbmUgd2hlcmUgam9icyBhcmUgc2ltcGx5IHNvcnRlZCBhc1xuICAgKiBgKHNpZ25hbHMgYW5kIHVwZGF0ZXMpIC0+IG90aGVyc2AsIGJ1dCB3aXRob3V0IHByb2Nlc3NpbmcgdGhlbSBhcyBkaXN0aW5jdCBiYXRjaGVzIChpLmUuIHdpdGhvdXRcbiAgICogbGVhdmluZy9yZWVudGVyaW5nIHRoZSBWTSBjb250ZXh0IGJldHdlZW4gZWFjaCBncm91cCwgd2hpY2ggYXV0b21hdGljYWxseSB0cmlnZ2VycyB0aGUgZXhlY3V0aW9uXG4gICAqIG9mIGFsbCBvdXRzdGFuZGluZyBtaWNyb3Rhc2tzKS4gVGhhdCBzaW5nbGUtcGhhc2UgYXBwcm9hY2ggcmVzb2x2ZXMgYSBudW1iZXIgb2YgcXVpcmtzIG9mIHRoZVxuICAgKiBmb3JtZXIgYWxnb3JpdGhtLCBhbmQgeWV0IHN0aWxsIHNhdGlzZmllcyB0byB0aGUgb3JpZ2luYWwgcmVxdWlyZW1lbnQgb2YgZW5zdXJpbmcgdGhhdCBldmVyeVxuICAgKiBgc2lnbmFsV29ya2Zsb3dgIGpvYnMgLSBhbmQgbm93IGBkb1VwZGF0ZWAgam9icyBhcyB3ZWxsIC0gaGF2ZSBiZWVuIGdpdmVuIGEgcHJvcGVyIGNoYW5jZSB0b1xuICAgKiBleGVjdXRlIGJlZm9yZSB0aGUgV29ya2Zsb3cgbWFpbiBmdW5jdGlvbiBtaWdodCBjb21wbGV0ZXMuXG4gICAqXG4gICAqIEBzaW5jZSBJbnRyb2R1Y2VkIGluIDEuMTEuMC4gVGhpcyBjaGFuZ2UgaXMgbm90IHJvbGxiYWNrLXNhZmUuIEhvd2V2ZXIsIGR1ZSB0byBhbiBTREsgYnVnLCBTREtzXG4gICAqICAgICAgICB2MS4xMS4wIGFuZCB2MS4xMS4xIHdlcmUgbm90IHByb3Blcmx5IHdyaXRpbmcgYmFjayB0aGUgZmxhZ3MgdG8gaGlzdG9yeSwgcG9zc2libHkgcmVzdWx0aW5nXG4gICAqICAgICAgICBpbiBOREUgb24gcmVwbGF5LiBXZSB0aGVyZWZvcmUgY29uc2lkZXIgdGhhdCBhIFdGVCBlbWl0dGVkIGJ5IFdvcmtlciB2MS4xMS4wIG9yIHYxLjExLjFcbiAgICogICAgICAgIHRvIGltcGxpY2l0ZWx5IGhhdmUgdGhpcyBmbGFnIG9uLlxuICAgKi9cbiAgUHJvY2Vzc1dvcmtmbG93QWN0aXZhdGlvbkpvYnNBc1NpbmdsZUJhdGNoOiBkZWZpbmVGbGFnKDIsIHRydWUsIFtidWlsZElkU2RrVmVyc2lvbk1hdGNoZXMoLzFcXC4xMVxcLlswMV0vKV0pLFxufSBhcyBjb25zdDtcblxuZnVuY3Rpb24gZGVmaW5lRmxhZyhpZDogbnVtYmVyLCBkZWY6IGJvb2xlYW4sIGFsdGVybmF0aXZlQ29uZGl0aW9ucz86IEFsdENvbmRpdGlvbkZuW10pOiBTZGtGbGFnIHtcbiAgY29uc3QgZmxhZyA9IHsgaWQsIGRlZmF1bHQ6IGRlZiwgYWx0ZXJuYXRpdmVDb25kaXRpb25zIH07XG4gIGZsYWdzUmVnaXN0cnkuc2V0KGlkLCBmbGFnKTtcbiAgcmV0dXJuIGZsYWc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhc3NlcnRWYWxpZEZsYWcoaWQ6IG51bWJlcik6IHZvaWQge1xuICBpZiAoIWZsYWdzUmVnaXN0cnkuaGFzKGlkKSkgdGhyb3cgbmV3IFR5cGVFcnJvcihgVW5rbm93biBTREsgZmxhZzogJHtpZH1gKTtcbn1cblxuLyoqXG4gKiBBbiBTREsgRmxhZyBBbHRlcm5hdGUgQ29uZGl0aW9uIHByb3ZpZGVzIGFuIGFsdGVybmF0aXZlIHdheSBvZiBkZXRlcm1pbmluZyB3aGV0aGVyIGEgZmxhZ1xuICogc2hvdWxkIGJlIGNvbnNpZGVyZWQgYXMgZW5hYmxlZCBmb3IgdGhlIGN1cnJlbnQgV0ZUOyBlLmcuIGJ5IGxvb2tpbmcgYXQgdGhlIHZlcnNpb24gb2YgdGhlIFNES1xuICogdGhhdCBlbWl0dGVkIGEgV0ZULiBUaGUgbWFpbiB1c2UgY2FzZSBmb3IgdGhpcyBpcyB0byByZXRyb2FjdGl2ZWx5IHR1cm4gb24gc29tZSBmbGFncyBmb3IgV0ZUXG4gKiBlbWl0dGVkIGJ5IHByZXZpb3VzIFNES3MgdGhhdCBjb250YWluZWQgYSBidWcuXG4gKlxuICogTm90ZSB0aGF0IGNvbmRpdGlvbnMgYXJlIG9ubHkgZXZhbHVhdGVkIHdoaWxlIHJlcGxheWluZywgYW5kIG9ubHkgaWYgdGhlIGNvcnJlc3BvbmluZyBmbGFnIGlzXG4gKiBub3QgYWxyZWFkeSBzZXQuIEFsc28sIGFsdGVybmF0ZSBjb25kaXRpb25zIHdpbGwgbm90IGNhdXNlIHRoZSBmbGFnIHRvIGJlIHBlcnNpc3RlZCB0byB0aGVcbiAqIFwidXNlZCBmbGFnc1wiIHNldCwgd2hpY2ggbWVhbnMgdGhhdCBmdXJ0aGVyIFdvcmtmbG93IFRhc2tzIG1heSBub3QgcmVmbGVjdCB0aGlzIGZsYWcgaWYgdGhlXG4gKiBjb25kaXRpb24gbm8gbG9uZ2VyIGhvbGRzLiBUaGlzIGlzIHNvIHRvIGF2b2lkIGluY29ycmVjdCBiZWhhdmlvcnMgaW4gY2FzZSB3aGVyZSBhIFdvcmtmbG93XG4gKiBFeGVjdXRpb24gaGFzIGdvbmUgdGhyb3VnaCBhIG5ld2VyIFNESyB2ZXJzaW9uIHRoZW4gYWdhaW4gdGhyb3VnaCBhbiBvbGRlciBvbmUuXG4gKi9cbnR5cGUgQWx0Q29uZGl0aW9uRm4gPSAoY3R4OiB7IGluZm86IFdvcmtmbG93SW5mbyB9KSA9PiBib29sZWFuO1xuXG5mdW5jdGlvbiBidWlsZElkU2RrVmVyc2lvbk1hdGNoZXModmVyc2lvbjogUmVnRXhwKTogQWx0Q29uZGl0aW9uRm4ge1xuICBjb25zdCByZWdleCA9IG5ldyBSZWdFeHAoYF5AdGVtcG9yYWxpby93b3JrZXJAKCR7dmVyc2lvbi5zb3VyY2V9KVsrXWApO1xuICByZXR1cm4gKHsgaW5mbyB9KSA9PiBpbmZvLmN1cnJlbnRCdWlsZElkICE9IG51bGwgJiYgcmVnZXgudGVzdChpbmZvLmN1cnJlbnRCdWlsZElkKTtcbn1cbiIsImltcG9ydCB7IElsbGVnYWxTdGF0ZUVycm9yIH0gZnJvbSAnQHRlbXBvcmFsaW8vY29tbW9uJztcbmltcG9ydCB7IHR5cGUgQWN0aXZhdG9yIH0gZnJvbSAnLi9pbnRlcm5hbHMnO1xuXG5leHBvcnQgZnVuY3Rpb24gbWF5YmVHZXRBY3RpdmF0b3JVbnR5cGVkKCk6IHVua25vd24ge1xuICByZXR1cm4gKGdsb2JhbFRoaXMgYXMgYW55KS5fX1RFTVBPUkFMX0FDVElWQVRPUl9fO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0QWN0aXZhdG9yVW50eXBlZChhY3RpdmF0b3I6IHVua25vd24pOiB2b2lkIHtcbiAgKGdsb2JhbFRoaXMgYXMgYW55KS5fX1RFTVBPUkFMX0FDVElWQVRPUl9fID0gYWN0aXZhdG9yO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWF5YmVHZXRBY3RpdmF0b3IoKTogQWN0aXZhdG9yIHwgdW5kZWZpbmVkIHtcbiAgcmV0dXJuIG1heWJlR2V0QWN0aXZhdG9yVW50eXBlZCgpIGFzIEFjdGl2YXRvciB8IHVuZGVmaW5lZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydEluV29ya2Zsb3dDb250ZXh0KG1lc3NhZ2U6IHN0cmluZyk6IEFjdGl2YXRvciB7XG4gIGNvbnN0IGFjdGl2YXRvciA9IG1heWJlR2V0QWN0aXZhdG9yKCk7XG4gIGlmIChhY3RpdmF0b3IgPT0gbnVsbCkgdGhyb3cgbmV3IElsbGVnYWxTdGF0ZUVycm9yKG1lc3NhZ2UpO1xuICByZXR1cm4gYWN0aXZhdG9yO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0QWN0aXZhdG9yKCk6IEFjdGl2YXRvciB7XG4gIGNvbnN0IGFjdGl2YXRvciA9IG1heWJlR2V0QWN0aXZhdG9yKCk7XG4gIGlmIChhY3RpdmF0b3IgPT09IHVuZGVmaW5lZCkge1xuICAgIHRocm93IG5ldyBJbGxlZ2FsU3RhdGVFcnJvcignV29ya2Zsb3cgdW5pbml0aWFsaXplZCcpO1xuICB9XG4gIHJldHVybiBhY3RpdmF0b3I7XG59XG4iLCIvKipcbiAqIE92ZXJyaWRlcyBzb21lIGdsb2JhbCBvYmplY3RzIHRvIG1ha2UgdGhlbSBkZXRlcm1pbmlzdGljLlxuICpcbiAqIEBtb2R1bGVcbiAqL1xuaW1wb3J0IHsgbXNUb1RzIH0gZnJvbSAnQHRlbXBvcmFsaW8vY29tbW9uL2xpYi90aW1lJztcbmltcG9ydCB7IENhbmNlbGxhdGlvblNjb3BlIH0gZnJvbSAnLi9jYW5jZWxsYXRpb24tc2NvcGUnO1xuaW1wb3J0IHsgRGV0ZXJtaW5pc21WaW9sYXRpb25FcnJvciB9IGZyb20gJy4vZXJyb3JzJztcbmltcG9ydCB7IGdldEFjdGl2YXRvciB9IGZyb20gJy4vZ2xvYmFsLWF0dHJpYnV0ZXMnO1xuaW1wb3J0IHsgU2RrRmxhZ3MgfSBmcm9tICcuL2ZsYWdzJztcbmltcG9ydCB7IHNsZWVwIH0gZnJvbSAnLi93b3JrZmxvdyc7XG5pbXBvcnQgeyB1bnRyYWNrUHJvbWlzZSB9IGZyb20gJy4vc3RhY2staGVscGVycyc7XG5cbmNvbnN0IGdsb2JhbCA9IGdsb2JhbFRoaXMgYXMgYW55O1xuY29uc3QgT3JpZ2luYWxEYXRlID0gZ2xvYmFsVGhpcy5EYXRlO1xuXG5leHBvcnQgZnVuY3Rpb24gb3ZlcnJpZGVHbG9iYWxzKCk6IHZvaWQge1xuICAvLyBNb2NrIGFueSB3ZWFrIHJlZmVyZW5jZSBiZWNhdXNlIEdDIGlzIG5vbi1kZXRlcm1pbmlzdGljIGFuZCB0aGUgZWZmZWN0IGlzIG9ic2VydmFibGUgZnJvbSB0aGUgV29ya2Zsb3cuXG4gIC8vIFdvcmtmbG93IGRldmVsb3BlciB3aWxsIGdldCBhIG1lYW5pbmdmdWwgZXhjZXB0aW9uIGlmIHRoZXkgdHJ5IHRvIHVzZSB0aGVzZS5cbiAgZ2xvYmFsLldlYWtSZWYgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhyb3cgbmV3IERldGVybWluaXNtVmlvbGF0aW9uRXJyb3IoJ1dlYWtSZWYgY2Fubm90IGJlIHVzZWQgaW4gV29ya2Zsb3dzIGJlY2F1c2UgdjggR0MgaXMgbm9uLWRldGVybWluaXN0aWMnKTtcbiAgfTtcbiAgZ2xvYmFsLkZpbmFsaXphdGlvblJlZ2lzdHJ5ID0gZnVuY3Rpb24gKCkge1xuICAgIHRocm93IG5ldyBEZXRlcm1pbmlzbVZpb2xhdGlvbkVycm9yKFxuICAgICAgJ0ZpbmFsaXphdGlvblJlZ2lzdHJ5IGNhbm5vdCBiZSB1c2VkIGluIFdvcmtmbG93cyBiZWNhdXNlIHY4IEdDIGlzIG5vbi1kZXRlcm1pbmlzdGljJ1xuICAgICk7XG4gIH07XG5cbiAgZ2xvYmFsLkRhdGUgPSBmdW5jdGlvbiAoLi4uYXJnczogdW5rbm93bltdKSB7XG4gICAgaWYgKGFyZ3MubGVuZ3RoID4gMCkge1xuICAgICAgcmV0dXJuIG5ldyAoT3JpZ2luYWxEYXRlIGFzIGFueSkoLi4uYXJncyk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgT3JpZ2luYWxEYXRlKGdldEFjdGl2YXRvcigpLm5vdyk7XG4gIH07XG5cbiAgZ2xvYmFsLkRhdGUubm93ID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBnZXRBY3RpdmF0b3IoKS5ub3c7XG4gIH07XG5cbiAgZ2xvYmFsLkRhdGUucGFyc2UgPSBPcmlnaW5hbERhdGUucGFyc2UuYmluZChPcmlnaW5hbERhdGUpO1xuICBnbG9iYWwuRGF0ZS5VVEMgPSBPcmlnaW5hbERhdGUuVVRDLmJpbmQoT3JpZ2luYWxEYXRlKTtcblxuICBnbG9iYWwuRGF0ZS5wcm90b3R5cGUgPSBPcmlnaW5hbERhdGUucHJvdG90eXBlO1xuXG4gIGNvbnN0IHRpbWVvdXRDYW5jZWxhdGlvblNjb3BlcyA9IG5ldyBNYXA8bnVtYmVyLCBDYW5jZWxsYXRpb25TY29wZT4oKTtcblxuICAvKipcbiAgICogQHBhcmFtIG1zIHNsZWVwIGR1cmF0aW9uIC0gIG51bWJlciBvZiBtaWxsaXNlY29uZHMuIElmIGdpdmVuIGEgbmVnYXRpdmUgbnVtYmVyLCB2YWx1ZSB3aWxsIGJlIHNldCB0byAxLlxuICAgKi9cbiAgZ2xvYmFsLnNldFRpbWVvdXQgPSBmdW5jdGlvbiAoY2I6ICguLi5hcmdzOiBhbnlbXSkgPT4gYW55LCBtczogbnVtYmVyLCAuLi5hcmdzOiBhbnlbXSk6IG51bWJlciB7XG4gICAgbXMgPSBNYXRoLm1heCgxLCBtcyk7XG4gICAgY29uc3QgYWN0aXZhdG9yID0gZ2V0QWN0aXZhdG9yKCk7XG4gICAgaWYgKGFjdGl2YXRvci5oYXNGbGFnKFNka0ZsYWdzLk5vbkNhbmNlbGxhYmxlU2NvcGVzQXJlU2hpZWxkZWRGcm9tUHJvcGFnYXRpb24pKSB7XG4gICAgICAvLyBDYXB0dXJlIHRoZSBzZXF1ZW5jZSBudW1iZXIgdGhhdCBzbGVlcCB3aWxsIGFsbG9jYXRlXG4gICAgICBjb25zdCBzZXEgPSBhY3RpdmF0b3IubmV4dFNlcXMudGltZXI7XG4gICAgICBjb25zdCB0aW1lclNjb3BlID0gbmV3IENhbmNlbGxhdGlvblNjb3BlKHsgY2FuY2VsbGFibGU6IHRydWUgfSk7XG4gICAgICBjb25zdCBzbGVlcFByb21pc2UgPSB0aW1lclNjb3BlLnJ1bigoKSA9PiBzbGVlcChtcykpO1xuICAgICAgc2xlZXBQcm9taXNlLnRoZW4oXG4gICAgICAgICgpID0+IHtcbiAgICAgICAgICB0aW1lb3V0Q2FuY2VsYXRpb25TY29wZXMuZGVsZXRlKHNlcSk7XG4gICAgICAgICAgY2IoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgICgpID0+IHtcbiAgICAgICAgICB0aW1lb3V0Q2FuY2VsYXRpb25TY29wZXMuZGVsZXRlKHNlcSk7XG4gICAgICAgIH1cbiAgICAgICk7XG4gICAgICB1bnRyYWNrUHJvbWlzZShzbGVlcFByb21pc2UpO1xuICAgICAgdGltZW91dENhbmNlbGF0aW9uU2NvcGVzLnNldChzZXEsIHRpbWVyU2NvcGUpO1xuICAgICAgcmV0dXJuIHNlcTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3Qgc2VxID0gYWN0aXZhdG9yLm5leHRTZXFzLnRpbWVyKys7XG4gICAgICAvLyBDcmVhdGUgYSBQcm9taXNlIGZvciBBc3luY0xvY2FsU3RvcmFnZSB0byBiZSBhYmxlIHRvIHRyYWNrIHRoaXMgY29tcGxldGlvbiB1c2luZyBwcm9taXNlIGhvb2tzLlxuICAgICAgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBhY3RpdmF0b3IuY29tcGxldGlvbnMudGltZXIuc2V0KHNlcSwgeyByZXNvbHZlLCByZWplY3QgfSk7XG4gICAgICAgIGFjdGl2YXRvci5wdXNoQ29tbWFuZCh7XG4gICAgICAgICAgc3RhcnRUaW1lcjoge1xuICAgICAgICAgICAgc2VxLFxuICAgICAgICAgICAgc3RhcnRUb0ZpcmVUaW1lb3V0OiBtc1RvVHMobXMpLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgICAgfSkudGhlbihcbiAgICAgICAgKCkgPT4gY2IoLi4uYXJncyksXG4gICAgICAgICgpID0+IHVuZGVmaW5lZCAvKiBpZ25vcmUgY2FuY2VsbGF0aW9uICovXG4gICAgICApO1xuICAgICAgcmV0dXJuIHNlcTtcbiAgICB9XG4gIH07XG5cbiAgZ2xvYmFsLmNsZWFyVGltZW91dCA9IGZ1bmN0aW9uIChoYW5kbGU6IG51bWJlcik6IHZvaWQge1xuICAgIGNvbnN0IGFjdGl2YXRvciA9IGdldEFjdGl2YXRvcigpO1xuICAgIGNvbnN0IHRpbWVyU2NvcGUgPSB0aW1lb3V0Q2FuY2VsYXRpb25TY29wZXMuZ2V0KGhhbmRsZSk7XG4gICAgaWYgKHRpbWVyU2NvcGUpIHtcbiAgICAgIHRpbWVvdXRDYW5jZWxhdGlvblNjb3Blcy5kZWxldGUoaGFuZGxlKTtcbiAgICAgIHRpbWVyU2NvcGUuY2FuY2VsKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFjdGl2YXRvci5uZXh0U2Vxcy50aW1lcisrOyAvLyBTaG91bGRuJ3QgaW5jcmVhc2Ugc2VxIG51bWJlciwgYnV0IHRoYXQncyB0aGUgbGVnYWN5IGJlaGF2aW9yXG4gICAgICBhY3RpdmF0b3IuY29tcGxldGlvbnMudGltZXIuZGVsZXRlKGhhbmRsZSk7XG4gICAgICBhY3RpdmF0b3IucHVzaENvbW1hbmQoe1xuICAgICAgICBjYW5jZWxUaW1lcjoge1xuICAgICAgICAgIHNlcTogaGFuZGxlLFxuICAgICAgICB9LFxuICAgICAgfSk7XG4gICAgfVxuICB9O1xuXG4gIC8vIGFjdGl2YXRvci5yYW5kb20gaXMgbXV0YWJsZSwgZG9uJ3QgaGFyZGNvZGUgaXRzIHJlZmVyZW5jZVxuICBNYXRoLnJhbmRvbSA9ICgpID0+IGdldEFjdGl2YXRvcigpLnJhbmRvbSgpO1xufVxuIiwiLyoqXG4gKiBUaGlzIGxpYnJhcnkgcHJvdmlkZXMgdG9vbHMgcmVxdWlyZWQgZm9yIGF1dGhvcmluZyB3b3JrZmxvd3MuXG4gKlxuICogIyMgVXNhZ2VcbiAqIFNlZSB0aGUge0BsaW5rIGh0dHBzOi8vZG9jcy50ZW1wb3JhbC5pby90eXBlc2NyaXB0L2hlbGxvLXdvcmxkI3dvcmtmbG93cyB8IHR1dG9yaWFsfSBmb3Igd3JpdGluZyB5b3VyIGZpcnN0IHdvcmtmbG93LlxuICpcbiAqICMjIyBUaW1lcnNcbiAqXG4gKiBUaGUgcmVjb21tZW5kZWQgd2F5IG9mIHNjaGVkdWxpbmcgdGltZXJzIGlzIGJ5IHVzaW5nIHRoZSB7QGxpbmsgc2xlZXB9IGZ1bmN0aW9uLiBXZSd2ZSByZXBsYWNlZCBgc2V0VGltZW91dGAgYW5kXG4gKiBgY2xlYXJUaW1lb3V0YCB3aXRoIGRldGVybWluaXN0aWMgdmVyc2lvbnMgc28gdGhlc2UgYXJlIGFsc28gdXNhYmxlIGJ1dCBoYXZlIGEgbGltaXRhdGlvbiB0aGF0IHRoZXkgZG9uJ3QgcGxheSB3ZWxsXG4gKiB3aXRoIHtAbGluayBodHRwczovL2RvY3MudGVtcG9yYWwuaW8vdHlwZXNjcmlwdC9jYW5jZWxsYXRpb24tc2NvcGVzIHwgY2FuY2VsbGF0aW9uIHNjb3Blc30uXG4gKlxuICogPCEtLVNOSVBTVEFSVCB0eXBlc2NyaXB0LXNsZWVwLXdvcmtmbG93LS0+XG4gKiA8IS0tU05JUEVORC0tPlxuICpcbiAqICMjIyBBY3Rpdml0aWVzXG4gKlxuICogVG8gc2NoZWR1bGUgQWN0aXZpdGllcywgdXNlIHtAbGluayBwcm94eUFjdGl2aXRpZXN9IHRvIG9idGFpbiBhbiBBY3Rpdml0eSBmdW5jdGlvbiBhbmQgY2FsbC5cbiAqXG4gKiA8IS0tU05JUFNUQVJUIHR5cGVzY3JpcHQtc2NoZWR1bGUtYWN0aXZpdHktd29ya2Zsb3ctLT5cbiAqIDwhLS1TTklQRU5ELS0+XG4gKlxuICogIyMjIFVwZGF0ZXMsIFNpZ25hbHMgYW5kIFF1ZXJpZXNcbiAqXG4gKiBVc2Uge0BsaW5rIHNldEhhbmRsZXJ9IHRvIHNldCBoYW5kbGVycyBmb3IgVXBkYXRlcywgU2lnbmFscywgYW5kIFF1ZXJpZXMuXG4gKlxuICogVXBkYXRlIGFuZCBTaWduYWwgaGFuZGxlcnMgY2FuIGJlIGVpdGhlciBhc3luYyBvciBub24tYXN5bmMgZnVuY3Rpb25zLiBVcGRhdGUgaGFuZGxlcnMgbWF5IHJldHVybiBhIHZhbHVlLCBidXQgc2lnbmFsXG4gKiBoYW5kbGVycyBtYXkgbm90IChyZXR1cm4gYHZvaWRgIG9yIGBQcm9taXNlPHZvaWQ+YCkuIFlvdSBtYXkgdXNlIEFjdGl2aXRpZXMsIFRpbWVycywgY2hpbGQgV29ya2Zsb3dzLCBldGMgaW4gVXBkYXRlXG4gKiBhbmQgU2lnbmFsIGhhbmRsZXJzLCBidXQgdGhpcyBzaG91bGQgYmUgZG9uZSBjYXV0aW91c2x5OiBmb3IgZXhhbXBsZSwgbm90ZSB0aGF0IGlmIHlvdSBhd2FpdCBhc3luYyBvcGVyYXRpb25zIHN1Y2ggYXNcbiAqIHRoZXNlIGluIGFuIFVwZGF0ZSBvciBTaWduYWwgaGFuZGxlciwgdGhlbiB5b3UgYXJlIHJlc3BvbnNpYmxlIGZvciBlbnN1cmluZyB0aGF0IHRoZSB3b3JrZmxvdyBkb2VzIG5vdCBjb21wbGV0ZSBmaXJzdC5cbiAqXG4gKiBRdWVyeSBoYW5kbGVycyBtYXkgKipub3QqKiBiZSBhc3luYyBmdW5jdGlvbnMsIGFuZCBtYXkgKipub3QqKiBtdXRhdGUgYW55IHZhcmlhYmxlcyBvciB1c2UgQWN0aXZpdGllcywgVGltZXJzLFxuICogY2hpbGQgV29ya2Zsb3dzLCBldGMuXG4gKlxuICogIyMjIyBJbXBsZW1lbnRhdGlvblxuICpcbiAqIDwhLS1TTklQU1RBUlQgdHlwZXNjcmlwdC13b3JrZmxvdy11cGRhdGUtc2lnbmFsLXF1ZXJ5LWV4YW1wbGUtLT5cbiAqIDwhLS1TTklQRU5ELS0+XG4gKlxuICogIyMjIE1vcmVcbiAqXG4gKiAtIFtEZXRlcm1pbmlzdGljIGJ1aWx0LWluc10oaHR0cHM6Ly9kb2NzLnRlbXBvcmFsLmlvL3R5cGVzY3JpcHQvZGV0ZXJtaW5pc20jc291cmNlcy1vZi1ub24tZGV0ZXJtaW5pc20pXG4gKiAtIFtDYW5jZWxsYXRpb24gYW5kIHNjb3Blc10oaHR0cHM6Ly9kb2NzLnRlbXBvcmFsLmlvL3R5cGVzY3JpcHQvY2FuY2VsbGF0aW9uLXNjb3BlcylcbiAqICAgLSB7QGxpbmsgQ2FuY2VsbGF0aW9uU2NvcGV9XG4gKiAgIC0ge0BsaW5rIFRyaWdnZXJ9XG4gKiAtIFtTaW5rc10oaHR0cHM6Ly9kb2NzLnRlbXBvcmFsLmlvL2FwcGxpY2F0aW9uLWRldmVsb3BtZW50L29ic2VydmFiaWxpdHkvP2xhbmc9dHMjbG9nZ2luZylcbiAqICAgLSB7QGxpbmsgU2lua3N9XG4gKlxuICogQG1vZHVsZVxuICovXG5cbmV4cG9ydCB7XG4gIEFjdGl2aXR5Q2FuY2VsbGF0aW9uVHlwZSxcbiAgQWN0aXZpdHlGYWlsdXJlLFxuICBBY3Rpdml0eU9wdGlvbnMsXG4gIEFwcGxpY2F0aW9uRmFpbHVyZSxcbiAgQ2FuY2VsbGVkRmFpbHVyZSxcbiAgQ2hpbGRXb3JrZmxvd0ZhaWx1cmUsXG4gIGRlZmF1bHRQYXlsb2FkQ29udmVydGVyLFxuICBQYXlsb2FkQ29udmVydGVyLFxuICBSZXRyeVBvbGljeSxcbiAgcm9vdENhdXNlLFxuICBTZXJ2ZXJGYWlsdXJlLFxuICBUZW1wb3JhbEZhaWx1cmUsXG4gIFRlcm1pbmF0ZWRGYWlsdXJlLFxuICBUaW1lb3V0RmFpbHVyZSxcbn0gZnJvbSAnQHRlbXBvcmFsaW8vY29tbW9uJztcbmV4cG9ydCAqIGZyb20gJ0B0ZW1wb3JhbGlvL2NvbW1vbi9saWIvZXJyb3JzJztcbmV4cG9ydCB7XG4gIEFjdGl2aXR5RnVuY3Rpb24sXG4gIEFjdGl2aXR5SW50ZXJmYWNlLCAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGRlcHJlY2F0aW9uL2RlcHJlY2F0aW9uXG4gIFBheWxvYWQsXG4gIFF1ZXJ5RGVmaW5pdGlvbixcbiAgU2VhcmNoQXR0cmlidXRlcyxcbiAgU2VhcmNoQXR0cmlidXRlVmFsdWUsXG4gIFNpZ25hbERlZmluaXRpb24sXG4gIFVudHlwZWRBY3Rpdml0aWVzLFxuICBXb3JrZmxvdyxcbiAgV29ya2Zsb3dRdWVyeVR5cGUsXG4gIFdvcmtmbG93UmVzdWx0VHlwZSxcbiAgV29ya2Zsb3dSZXR1cm5UeXBlLFxuICBXb3JrZmxvd1NpZ25hbFR5cGUsXG59IGZyb20gJ0B0ZW1wb3JhbGlvL2NvbW1vbi9saWIvaW50ZXJmYWNlcyc7XG5leHBvcnQgKiBmcm9tICdAdGVtcG9yYWxpby9jb21tb24vbGliL3dvcmtmbG93LWhhbmRsZSc7XG5leHBvcnQgKiBmcm9tICdAdGVtcG9yYWxpby9jb21tb24vbGliL3dvcmtmbG93LW9wdGlvbnMnO1xuZXhwb3J0IHsgQXN5bmNMb2NhbFN0b3JhZ2UsIENhbmNlbGxhdGlvblNjb3BlLCBDYW5jZWxsYXRpb25TY29wZU9wdGlvbnMgfSBmcm9tICcuL2NhbmNlbGxhdGlvbi1zY29wZSc7XG5leHBvcnQgKiBmcm9tICcuL2Vycm9ycyc7XG5leHBvcnQgKiBmcm9tICcuL2ludGVyY2VwdG9ycyc7XG5leHBvcnQge1xuICBDaGlsZFdvcmtmbG93Q2FuY2VsbGF0aW9uVHlwZSxcbiAgQ2hpbGRXb3JrZmxvd09wdGlvbnMsXG4gIENvbnRpbnVlQXNOZXcsXG4gIENvbnRpbnVlQXNOZXdPcHRpb25zLFxuICBFbmhhbmNlZFN0YWNrVHJhY2UsXG4gIFN0YWNrVHJhY2VGaWxlTG9jYXRpb24sXG4gIFN0YWNrVHJhY2VGaWxlU2xpY2UsXG4gIFBhcmVudENsb3NlUG9saWN5LFxuICBQYXJlbnRXb3JrZmxvd0luZm8sXG4gIFN0YWNrVHJhY2VTREtJbmZvLFxuICBTdGFja1RyYWNlLFxuICBVbnNhZmVXb3JrZmxvd0luZm8sXG4gIFdvcmtmbG93SW5mbyxcbn0gZnJvbSAnLi9pbnRlcmZhY2VzJztcbmV4cG9ydCB7IHByb3h5U2lua3MsIFNpbmssIFNpbmtDYWxsLCBTaW5rRnVuY3Rpb24sIFNpbmtzIH0gZnJvbSAnLi9zaW5rcyc7XG5leHBvcnQgeyBsb2cgfSBmcm9tICcuL2xvZ3MnO1xuZXhwb3J0IHsgVHJpZ2dlciB9IGZyb20gJy4vdHJpZ2dlcic7XG5leHBvcnQgKiBmcm9tICcuL3dvcmtmbG93JztcbmV4cG9ydCB7IENoaWxkV29ya2Zsb3dIYW5kbGUsIEV4dGVybmFsV29ya2Zsb3dIYW5kbGUgfSBmcm9tICcuL3dvcmtmbG93LWhhbmRsZSc7XG5cbi8vIEFueXRoaW5nIGJlbG93IHRoaXMgbGluZSBpcyBkZXByZWNhdGVkXG5cbmV4cG9ydCB7XG4gIC8qKlxuICAgKiBAZGVwcmVjYXRlZCBEbyBub3QgdXNlIExvZ2dlclNpbmtzIGRpcmVjdGx5LiBUbyBsb2cgZnJvbSBXb3JrZmxvdyBjb2RlLCB1c2UgdGhlIGBsb2dgIG9iamVjdFxuICAgKiAgICAgICAgICAgICBleHBvcnRlZCBieSB0aGUgYEB0ZW1wb3JhbGlvL3dvcmtmbG93YCBwYWNrYWdlLiBUbyBjYXB0dXJlIGxvZyBtZXNzYWdlcyBlbWl0dGVkXG4gICAqICAgICAgICAgICAgIGJ5IFdvcmtmbG93IGNvZGUsIHNldCB0aGUge0BsaW5rIFJ1bnRpbWUubG9nZ2VyfSBwcm9wZXJ0eS5cbiAgICovXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBkZXByZWNhdGlvbi9kZXByZWNhdGlvblxuICBMb2dnZXJTaW5rc0RlcHJlY2F0ZWQgYXMgTG9nZ2VyU2lua3MsXG59IGZyb20gJy4vbG9ncyc7XG4iLCIvKipcbiAqIFR5cGUgZGVmaW5pdGlvbnMgYW5kIGdlbmVyaWMgaGVscGVycyBmb3IgaW50ZXJjZXB0b3JzLlxuICpcbiAqIFRoZSBXb3JrZmxvdyBzcGVjaWZpYyBpbnRlcmNlcHRvcnMgYXJlIGRlZmluZWQgaGVyZS5cbiAqXG4gKiBAbW9kdWxlXG4gKi9cblxuaW1wb3J0IHsgQWN0aXZpdHlPcHRpb25zLCBIZWFkZXJzLCBMb2NhbEFjdGl2aXR5T3B0aW9ucywgTmV4dCwgVGltZXN0YW1wLCBXb3JrZmxvd0V4ZWN1dGlvbiB9IGZyb20gJ0B0ZW1wb3JhbGlvL2NvbW1vbic7XG5pbXBvcnQgdHlwZSB7IGNvcmVzZGsgfSBmcm9tICdAdGVtcG9yYWxpby9wcm90byc7XG5pbXBvcnQgeyBDaGlsZFdvcmtmbG93T3B0aW9uc1dpdGhEZWZhdWx0cywgQ29udGludWVBc05ld09wdGlvbnMgfSBmcm9tICcuL2ludGVyZmFjZXMnO1xuXG5leHBvcnQgeyBOZXh0LCBIZWFkZXJzIH07XG5cbi8qKiBJbnB1dCBmb3IgV29ya2Zsb3dJbmJvdW5kQ2FsbHNJbnRlcmNlcHRvci5leGVjdXRlICovXG5leHBvcnQgaW50ZXJmYWNlIFdvcmtmbG93RXhlY3V0ZUlucHV0IHtcbiAgcmVhZG9ubHkgYXJnczogdW5rbm93bltdO1xuICByZWFkb25seSBoZWFkZXJzOiBIZWFkZXJzO1xufVxuXG4vKiogSW5wdXQgZm9yIFdvcmtmbG93SW5ib3VuZENhbGxzSW50ZXJjZXB0b3IuaGFuZGxlVXBkYXRlIGFuZFxuICogV29ya2Zsb3dJbmJvdW5kQ2FsbHNJbnRlcmNlcHRvci52YWxpZGF0ZVVwZGF0ZSAqL1xuZXhwb3J0IGludGVyZmFjZSBVcGRhdGVJbnB1dCB7XG4gIHJlYWRvbmx5IHVwZGF0ZUlkOiBzdHJpbmc7XG4gIHJlYWRvbmx5IG5hbWU6IHN0cmluZztcbiAgcmVhZG9ubHkgYXJnczogdW5rbm93bltdO1xuICByZWFkb25seSBoZWFkZXJzOiBIZWFkZXJzO1xufVxuXG4vKiogSW5wdXQgZm9yIFdvcmtmbG93SW5ib3VuZENhbGxzSW50ZXJjZXB0b3IuaGFuZGxlU2lnbmFsICovXG5leHBvcnQgaW50ZXJmYWNlIFNpZ25hbElucHV0IHtcbiAgcmVhZG9ubHkgc2lnbmFsTmFtZTogc3RyaW5nO1xuICByZWFkb25seSBhcmdzOiB1bmtub3duW107XG4gIHJlYWRvbmx5IGhlYWRlcnM6IEhlYWRlcnM7XG59XG5cbi8qKiBJbnB1dCBmb3IgV29ya2Zsb3dJbmJvdW5kQ2FsbHNJbnRlcmNlcHRvci5oYW5kbGVRdWVyeSAqL1xuZXhwb3J0IGludGVyZmFjZSBRdWVyeUlucHV0IHtcbiAgcmVhZG9ubHkgcXVlcnlJZDogc3RyaW5nO1xuICByZWFkb25seSBxdWVyeU5hbWU6IHN0cmluZztcbiAgcmVhZG9ubHkgYXJnczogdW5rbm93bltdO1xuICByZWFkb25seSBoZWFkZXJzOiBIZWFkZXJzO1xufVxuXG4vKipcbiAqIEltcGxlbWVudCBhbnkgb2YgdGhlc2UgbWV0aG9kcyB0byBpbnRlcmNlcHQgV29ya2Zsb3cgaW5ib3VuZCBjYWxscyBsaWtlIGV4ZWN1dGlvbiwgYW5kIHNpZ25hbCBhbmQgcXVlcnkgaGFuZGxpbmcuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgV29ya2Zsb3dJbmJvdW5kQ2FsbHNJbnRlcmNlcHRvciB7XG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiBXb3JrZmxvdyBleGVjdXRlIG1ldGhvZCBpcyBjYWxsZWRcbiAgICpcbiAgICogQHJldHVybiByZXN1bHQgb2YgdGhlIFdvcmtmbG93IGV4ZWN1dGlvblxuICAgKi9cbiAgZXhlY3V0ZT86IChpbnB1dDogV29ya2Zsb3dFeGVjdXRlSW5wdXQsIG5leHQ6IE5leHQ8dGhpcywgJ2V4ZWN1dGUnPikgPT4gUHJvbWlzZTx1bmtub3duPjtcblxuICAvKiogQ2FsbGVkIHdoZW4gVXBkYXRlIGhhbmRsZXIgaXMgY2FsbGVkXG4gICAqXG4gICAqIEByZXR1cm4gcmVzdWx0IG9mIHRoZSBVcGRhdGVcbiAgICovXG4gIGhhbmRsZVVwZGF0ZT86IChpbnB1dDogVXBkYXRlSW5wdXQsIG5leHQ6IE5leHQ8dGhpcywgJ2hhbmRsZVVwZGF0ZSc+KSA9PiBQcm9taXNlPHVua25vd24+O1xuXG4gIC8qKiBDYWxsZWQgd2hlbiB1cGRhdGUgdmFsaWRhdG9yIGNhbGxlZCAqL1xuICB2YWxpZGF0ZVVwZGF0ZT86IChpbnB1dDogVXBkYXRlSW5wdXQsIG5leHQ6IE5leHQ8dGhpcywgJ3ZhbGlkYXRlVXBkYXRlJz4pID0+IHZvaWQ7XG5cbiAgLyoqIENhbGxlZCB3aGVuIHNpZ25hbCBpcyBkZWxpdmVyZWQgdG8gYSBXb3JrZmxvdyBleGVjdXRpb24gKi9cbiAgaGFuZGxlU2lnbmFsPzogKGlucHV0OiBTaWduYWxJbnB1dCwgbmV4dDogTmV4dDx0aGlzLCAnaGFuZGxlU2lnbmFsJz4pID0+IFByb21pc2U8dm9pZD47XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIGEgV29ya2Zsb3cgaXMgcXVlcmllZFxuICAgKlxuICAgKiBAcmV0dXJuIHJlc3VsdCBvZiB0aGUgcXVlcnlcbiAgICovXG4gIGhhbmRsZVF1ZXJ5PzogKGlucHV0OiBRdWVyeUlucHV0LCBuZXh0OiBOZXh0PHRoaXMsICdoYW5kbGVRdWVyeSc+KSA9PiBQcm9taXNlPHVua25vd24+O1xufVxuXG4vKiogSW5wdXQgZm9yIFdvcmtmbG93T3V0Ym91bmRDYWxsc0ludGVyY2VwdG9yLnNjaGVkdWxlQWN0aXZpdHkgKi9cbmV4cG9ydCBpbnRlcmZhY2UgQWN0aXZpdHlJbnB1dCB7XG4gIHJlYWRvbmx5IGFjdGl2aXR5VHlwZTogc3RyaW5nO1xuICByZWFkb25seSBhcmdzOiB1bmtub3duW107XG4gIHJlYWRvbmx5IG9wdGlvbnM6IEFjdGl2aXR5T3B0aW9ucztcbiAgcmVhZG9ubHkgaGVhZGVyczogSGVhZGVycztcbiAgcmVhZG9ubHkgc2VxOiBudW1iZXI7XG59XG5cbi8qKiBJbnB1dCBmb3IgV29ya2Zsb3dPdXRib3VuZENhbGxzSW50ZXJjZXB0b3Iuc2NoZWR1bGVMb2NhbEFjdGl2aXR5ICovXG5leHBvcnQgaW50ZXJmYWNlIExvY2FsQWN0aXZpdHlJbnB1dCB7XG4gIHJlYWRvbmx5IGFjdGl2aXR5VHlwZTogc3RyaW5nO1xuICByZWFkb25seSBhcmdzOiB1bmtub3duW107XG4gIHJlYWRvbmx5IG9wdGlvbnM6IExvY2FsQWN0aXZpdHlPcHRpb25zO1xuICByZWFkb25seSBoZWFkZXJzOiBIZWFkZXJzO1xuICByZWFkb25seSBzZXE6IG51bWJlcjtcbiAgcmVhZG9ubHkgb3JpZ2luYWxTY2hlZHVsZVRpbWU/OiBUaW1lc3RhbXA7XG4gIHJlYWRvbmx5IGF0dGVtcHQ6IG51bWJlcjtcbn1cblxuLyoqIElucHV0IGZvciBXb3JrZmxvd091dGJvdW5kQ2FsbHNJbnRlcmNlcHRvci5zdGFydENoaWxkV29ya2Zsb3dFeGVjdXRpb24gKi9cbmV4cG9ydCBpbnRlcmZhY2UgU3RhcnRDaGlsZFdvcmtmbG93RXhlY3V0aW9uSW5wdXQge1xuICByZWFkb25seSB3b3JrZmxvd1R5cGU6IHN0cmluZztcbiAgcmVhZG9ubHkgb3B0aW9uczogQ2hpbGRXb3JrZmxvd09wdGlvbnNXaXRoRGVmYXVsdHM7XG4gIHJlYWRvbmx5IGhlYWRlcnM6IEhlYWRlcnM7XG4gIHJlYWRvbmx5IHNlcTogbnVtYmVyO1xufVxuXG4vKiogSW5wdXQgZm9yIFdvcmtmbG93T3V0Ym91bmRDYWxsc0ludGVyY2VwdG9yLnN0YXJ0VGltZXIgKi9cbmV4cG9ydCBpbnRlcmZhY2UgVGltZXJJbnB1dCB7XG4gIHJlYWRvbmx5IGR1cmF0aW9uTXM6IG51bWJlcjtcbiAgcmVhZG9ubHkgc2VxOiBudW1iZXI7XG59XG5cbi8qKlxuICogU2FtZSBhcyBDb250aW51ZUFzTmV3T3B0aW9ucyBidXQgd29ya2Zsb3dUeXBlIG11c3QgYmUgZGVmaW5lZFxuICovXG5leHBvcnQgdHlwZSBDb250aW51ZUFzTmV3SW5wdXRPcHRpb25zID0gQ29udGludWVBc05ld09wdGlvbnMgJiBSZXF1aXJlZDxQaWNrPENvbnRpbnVlQXNOZXdPcHRpb25zLCAnd29ya2Zsb3dUeXBlJz4+O1xuXG4vKiogSW5wdXQgZm9yIFdvcmtmbG93T3V0Ym91bmRDYWxsc0ludGVyY2VwdG9yLmNvbnRpbnVlQXNOZXcgKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ29udGludWVBc05ld0lucHV0IHtcbiAgcmVhZG9ubHkgYXJnczogdW5rbm93bltdO1xuICByZWFkb25seSBoZWFkZXJzOiBIZWFkZXJzO1xuICByZWFkb25seSBvcHRpb25zOiBDb250aW51ZUFzTmV3SW5wdXRPcHRpb25zO1xufVxuXG4vKiogSW5wdXQgZm9yIFdvcmtmbG93T3V0Ym91bmRDYWxsc0ludGVyY2VwdG9yLnNpZ25hbFdvcmtmbG93ICovXG5leHBvcnQgaW50ZXJmYWNlIFNpZ25hbFdvcmtmbG93SW5wdXQge1xuICByZWFkb25seSBzZXE6IG51bWJlcjtcbiAgcmVhZG9ubHkgc2lnbmFsTmFtZTogc3RyaW5nO1xuICByZWFkb25seSBhcmdzOiB1bmtub3duW107XG4gIHJlYWRvbmx5IGhlYWRlcnM6IEhlYWRlcnM7XG4gIHJlYWRvbmx5IHRhcmdldDpcbiAgICB8IHtcbiAgICAgICAgcmVhZG9ubHkgdHlwZTogJ2V4dGVybmFsJztcbiAgICAgICAgcmVhZG9ubHkgd29ya2Zsb3dFeGVjdXRpb246IFdvcmtmbG93RXhlY3V0aW9uO1xuICAgICAgfVxuICAgIHwge1xuICAgICAgICByZWFkb25seSB0eXBlOiAnY2hpbGQnO1xuICAgICAgICByZWFkb25seSBjaGlsZFdvcmtmbG93SWQ6IHN0cmluZztcbiAgICAgIH07XG59XG5cbi8qKiBJbnB1dCBmb3IgV29ya2Zsb3dPdXRib3VuZENhbGxzSW50ZXJjZXB0b3IuZ2V0TG9nQXR0cmlidXRlcyAqL1xuZXhwb3J0IHR5cGUgR2V0TG9nQXR0cmlidXRlc0lucHV0ID0gUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG5cbi8qKlxuICogSW1wbGVtZW50IGFueSBvZiB0aGVzZSBtZXRob2RzIHRvIGludGVyY2VwdCBXb3JrZmxvdyBjb2RlIGNhbGxzIHRvIHRoZSBUZW1wb3JhbCBBUElzLCBsaWtlIHNjaGVkdWxpbmcgYW4gYWN0aXZpdHkgYW5kIHN0YXJ0aW5nIGEgdGltZXJcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBXb3JrZmxvd091dGJvdW5kQ2FsbHNJbnRlcmNlcHRvciB7XG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiBXb3JrZmxvdyBzY2hlZHVsZXMgYW4gQWN0aXZpdHlcbiAgICpcbiAgICogQHJldHVybiByZXN1bHQgb2YgdGhlIGFjdGl2aXR5IGV4ZWN1dGlvblxuICAgKi9cbiAgc2NoZWR1bGVBY3Rpdml0eT86IChpbnB1dDogQWN0aXZpdHlJbnB1dCwgbmV4dDogTmV4dDx0aGlzLCAnc2NoZWR1bGVBY3Rpdml0eSc+KSA9PiBQcm9taXNlPHVua25vd24+O1xuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiBXb3JrZmxvdyBzY2hlZHVsZXMgYSBsb2NhbCBBY3Rpdml0eVxuICAgKlxuICAgKiBAcmV0dXJuIHJlc3VsdCBvZiB0aGUgYWN0aXZpdHkgZXhlY3V0aW9uXG4gICAqL1xuICBzY2hlZHVsZUxvY2FsQWN0aXZpdHk/OiAoaW5wdXQ6IExvY2FsQWN0aXZpdHlJbnB1dCwgbmV4dDogTmV4dDx0aGlzLCAnc2NoZWR1bGVMb2NhbEFjdGl2aXR5Jz4pID0+IFByb21pc2U8dW5rbm93bj47XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIFdvcmtmbG93IHN0YXJ0cyBhIHRpbWVyXG4gICAqL1xuICBzdGFydFRpbWVyPzogKGlucHV0OiBUaW1lcklucHV0LCBuZXh0OiBOZXh0PHRoaXMsICdzdGFydFRpbWVyJz4pID0+IFByb21pc2U8dm9pZD47XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIFdvcmtmbG93IGNhbGxzIGNvbnRpbnVlQXNOZXdcbiAgICovXG4gIGNvbnRpbnVlQXNOZXc/OiAoaW5wdXQ6IENvbnRpbnVlQXNOZXdJbnB1dCwgbmV4dDogTmV4dDx0aGlzLCAnY29udGludWVBc05ldyc+KSA9PiBQcm9taXNlPG5ldmVyPjtcblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gV29ya2Zsb3cgc2lnbmFscyBhIGNoaWxkIG9yIGV4dGVybmFsIFdvcmtmbG93XG4gICAqL1xuICBzaWduYWxXb3JrZmxvdz86IChpbnB1dDogU2lnbmFsV29ya2Zsb3dJbnB1dCwgbmV4dDogTmV4dDx0aGlzLCAnc2lnbmFsV29ya2Zsb3cnPikgPT4gUHJvbWlzZTx2b2lkPjtcblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gV29ya2Zsb3cgc3RhcnRzIGEgY2hpbGQgd29ya2Zsb3cgZXhlY3V0aW9uLCB0aGUgaW50ZXJjZXB0b3IgZnVuY3Rpb24gcmV0dXJucyAyIHByb21pc2VzOlxuICAgKlxuICAgKiAtIFRoZSBmaXJzdCByZXNvbHZlcyB3aXRoIHRoZSBgcnVuSWRgIHdoZW4gdGhlIGNoaWxkIHdvcmtmbG93IGhhcyBzdGFydGVkIG9yIHJlamVjdHMgaWYgZmFpbGVkIHRvIHN0YXJ0LlxuICAgKiAtIFRoZSBzZWNvbmQgcmVzb2x2ZXMgd2l0aCB0aGUgd29ya2Zsb3cgcmVzdWx0IHdoZW4gdGhlIGNoaWxkIHdvcmtmbG93IGNvbXBsZXRlcyBvciByZWplY3RzIG9uIGZhaWx1cmUuXG4gICAqL1xuICBzdGFydENoaWxkV29ya2Zsb3dFeGVjdXRpb24/OiAoXG4gICAgaW5wdXQ6IFN0YXJ0Q2hpbGRXb3JrZmxvd0V4ZWN1dGlvbklucHV0LFxuICAgIG5leHQ6IE5leHQ8dGhpcywgJ3N0YXJ0Q2hpbGRXb3JrZmxvd0V4ZWN1dGlvbic+XG4gICkgPT4gUHJvbWlzZTxbUHJvbWlzZTxzdHJpbmc+LCBQcm9taXNlPHVua25vd24+XT47XG5cbiAgLyoqXG4gICAqIENhbGxlZCBvbiBlYWNoIGludm9jYXRpb24gb2YgdGhlIGB3b3JrZmxvdy5sb2dgIG1ldGhvZHMuXG4gICAqXG4gICAqIFRoZSBhdHRyaWJ1dGVzIHJldHVybmVkIGluIHRoaXMgY2FsbCBhcmUgYXR0YWNoZWQgdG8gZXZlcnkgbG9nIG1lc3NhZ2UuXG4gICAqL1xuICBnZXRMb2dBdHRyaWJ1dGVzPzogKGlucHV0OiBHZXRMb2dBdHRyaWJ1dGVzSW5wdXQsIG5leHQ6IE5leHQ8dGhpcywgJ2dldExvZ0F0dHJpYnV0ZXMnPikgPT4gUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG59XG5cbi8qKiBJbnB1dCBmb3IgV29ya2Zsb3dJbnRlcm5hbHNJbnRlcmNlcHRvci5jb25jbHVkZUFjdGl2YXRpb24gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ29uY2x1ZGVBY3RpdmF0aW9uSW5wdXQge1xuICBjb21tYW5kczogY29yZXNkay53b3JrZmxvd19jb21tYW5kcy5JV29ya2Zsb3dDb21tYW5kW107XG59XG5cbi8qKiBPdXRwdXQgZm9yIFdvcmtmbG93SW50ZXJuYWxzSW50ZXJjZXB0b3IuY29uY2x1ZGVBY3RpdmF0aW9uICovXG5leHBvcnQgdHlwZSBDb25jbHVkZUFjdGl2YXRpb25PdXRwdXQgPSBDb25jbHVkZUFjdGl2YXRpb25JbnB1dDtcblxuLyoqIElucHV0IGZvciBXb3JrZmxvd0ludGVybmFsc0ludGVyY2VwdG9yLmFjdGl2YXRlICovXG5leHBvcnQgaW50ZXJmYWNlIEFjdGl2YXRlSW5wdXQge1xuICBhY3RpdmF0aW9uOiBjb3Jlc2RrLndvcmtmbG93X2FjdGl2YXRpb24uSVdvcmtmbG93QWN0aXZhdGlvbjtcbiAgYmF0Y2hJbmRleDogbnVtYmVyO1xufVxuXG4vKiogSW5wdXQgZm9yIFdvcmtmbG93SW50ZXJuYWxzSW50ZXJjZXB0b3IuZGlzcG9zZSAqL1xuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1lbXB0eS1pbnRlcmZhY2VcbmV4cG9ydCBpbnRlcmZhY2UgRGlzcG9zZUlucHV0IHt9XG5cbi8qKlxuICogSW50ZXJjZXB0b3IgZm9yIHRoZSBpbnRlcm5hbHMgb2YgdGhlIFdvcmtmbG93IHJ1bnRpbWUuXG4gKlxuICogVXNlIHRvIG1hbmlwdWxhdGUgb3IgdHJhY2UgV29ya2Zsb3cgYWN0aXZhdGlvbnMuXG4gKlxuICogQGV4cGVyaW1lbnRhbCBUaGlzIEFQSSBpcyBmb3IgYWR2YW5jZWQgdXNlIGNhc2VzIGFuZCBtYXkgY2hhbmdlIGluIHRoZSBmdXR1cmUuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgV29ya2Zsb3dJbnRlcm5hbHNJbnRlcmNlcHRvciB7XG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiB0aGUgV29ya2Zsb3cgcnVudGltZSBydW5zIGEgV29ya2Zsb3dBY3RpdmF0aW9uSm9iLlxuICAgKi9cbiAgYWN0aXZhdGU/KGlucHV0OiBBY3RpdmF0ZUlucHV0LCBuZXh0OiBOZXh0PHRoaXMsICdhY3RpdmF0ZSc+KTogdm9pZDtcblxuICAvKipcbiAgICogQ2FsbGVkIGFmdGVyIGFsbCBgV29ya2Zsb3dBY3RpdmF0aW9uSm9iYHMgaGF2ZSBiZWVuIHByb2Nlc3NlZCBmb3IgYW4gYWN0aXZhdGlvbi5cbiAgICpcbiAgICogQ2FuIG1hbmlwdWxhdGUgdGhlIGNvbW1hbmRzIGdlbmVyYXRlZCBieSB0aGUgV29ya2Zsb3dcbiAgICovXG4gIGNvbmNsdWRlQWN0aXZhdGlvbj8oaW5wdXQ6IENvbmNsdWRlQWN0aXZhdGlvbklucHV0LCBuZXh0OiBOZXh0PHRoaXMsICdjb25jbHVkZUFjdGl2YXRpb24nPik6IENvbmNsdWRlQWN0aXZhdGlvbk91dHB1dDtcblxuICAvKipcbiAgICogQ2FsbGVkIGJlZm9yZSBkaXNwb3NpbmcgdGhlIFdvcmtmbG93IGlzb2xhdGUgY29udGV4dC5cbiAgICpcbiAgICogSW1wbGVtZW50IHRoaXMgbWV0aG9kIHRvIHBlcmZvcm0gYW55IHJlc291cmNlIGNsZWFudXAuXG4gICAqL1xuICBkaXNwb3NlPyhpbnB1dDogRGlzcG9zZUlucHV0LCBuZXh0OiBOZXh0PHRoaXMsICdkaXNwb3NlJz4pOiB2b2lkO1xufVxuXG4vKipcbiAqIEEgbWFwcGluZyBmcm9tIGludGVyY2VwdG9yIHR5cGUgdG8gYW4gb3B0aW9uYWwgbGlzdCBvZiBpbnRlcmNlcHRvciBpbXBsZW1lbnRhdGlvbnNcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBXb3JrZmxvd0ludGVyY2VwdG9ycyB7XG4gIGluYm91bmQ/OiBXb3JrZmxvd0luYm91bmRDYWxsc0ludGVyY2VwdG9yW107XG4gIG91dGJvdW5kPzogV29ya2Zsb3dPdXRib3VuZENhbGxzSW50ZXJjZXB0b3JbXTtcbiAgaW50ZXJuYWxzPzogV29ya2Zsb3dJbnRlcm5hbHNJbnRlcmNlcHRvcltdO1xufVxuXG4vKipcbiAqIEEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIHtAbGluayBXb3JrZmxvd0ludGVyY2VwdG9yc30gYW5kIHRha2VzIG5vIGFyZ3VtZW50cy5cbiAqXG4gKiBXb3JrZmxvdyBpbnRlcmNlcHRvciBtb2R1bGVzIHNob3VsZCBleHBvcnQgYW4gYGludGVyY2VwdG9yc2AgZnVuY3Rpb24gb2YgdGhpcyB0eXBlLlxuICpcbiAqIEBleGFtcGxlXG4gKlxuICogYGBgdHNcbiAqIGV4cG9ydCBmdW5jdGlvbiBpbnRlcmNlcHRvcnMoKTogV29ya2Zsb3dJbnRlcmNlcHRvcnMge1xuICogICByZXR1cm4ge1xuICogICAgIGluYm91bmQ6IFtdLCAgIC8vIFBvcHVsYXRlIHdpdGggbGlzdCBvZiBpbnRlcmNlcHRvciBpbXBsZW1lbnRhdGlvbnNcbiAqICAgICBvdXRib3VuZDogW10sICAvLyBQb3B1bGF0ZSB3aXRoIGxpc3Qgb2YgaW50ZXJjZXB0b3IgaW1wbGVtZW50YXRpb25zXG4gKiAgICAgaW50ZXJuYWxzOiBbXSwgLy8gUG9wdWxhdGUgd2l0aCBsaXN0IG9mIGludGVyY2VwdG9yIGltcGxlbWVudGF0aW9uc1xuICogICB9O1xuICogfVxuICogYGBgXG4gKi9cbmV4cG9ydCB0eXBlIFdvcmtmbG93SW50ZXJjZXB0b3JzRmFjdG9yeSA9ICgpID0+IFdvcmtmbG93SW50ZXJjZXB0b3JzO1xuIiwiaW1wb3J0IHR5cGUgeyBSYXdTb3VyY2VNYXAgfSBmcm9tICdzb3VyY2UtbWFwJztcbmltcG9ydCB7XG4gIFJldHJ5UG9saWN5LFxuICBUZW1wb3JhbEZhaWx1cmUsXG4gIENvbW1vbldvcmtmbG93T3B0aW9ucyxcbiAgSGFuZGxlclVuZmluaXNoZWRQb2xpY3ksXG4gIFNlYXJjaEF0dHJpYnV0ZXMsXG4gIFNpZ25hbERlZmluaXRpb24sXG4gIFVwZGF0ZURlZmluaXRpb24sXG4gIFF1ZXJ5RGVmaW5pdGlvbixcbiAgRHVyYXRpb24sXG4gIFZlcnNpb25pbmdJbnRlbnQsXG59IGZyb20gJ0B0ZW1wb3JhbGlvL2NvbW1vbic7XG5pbXBvcnQgeyBjaGVja0V4dGVuZHMsIFN5bWJvbEJhc2VkSW5zdGFuY2VPZkVycm9yIH0gZnJvbSAnQHRlbXBvcmFsaW8vY29tbW9uL2xpYi90eXBlLWhlbHBlcnMnO1xuaW1wb3J0IHR5cGUgeyBjb3Jlc2RrIH0gZnJvbSAnQHRlbXBvcmFsaW8vcHJvdG8nO1xuXG4vKipcbiAqIFdvcmtmbG93IEV4ZWN1dGlvbiBpbmZvcm1hdGlvblxuICovXG5leHBvcnQgaW50ZXJmYWNlIFdvcmtmbG93SW5mbyB7XG4gIC8qKlxuICAgKiBJRCBvZiB0aGUgV29ya2Zsb3csIHRoaXMgY2FuIGJlIHNldCBieSB0aGUgY2xpZW50IGR1cmluZyBXb3JrZmxvdyBjcmVhdGlvbi5cbiAgICogQSBzaW5nbGUgV29ya2Zsb3cgbWF5IHJ1biBtdWx0aXBsZSB0aW1lcyBlLmcuIHdoZW4gc2NoZWR1bGVkIHdpdGggY3Jvbi5cbiAgICovXG4gIHJlYWRvbmx5IHdvcmtmbG93SWQ6IHN0cmluZztcblxuICAvKipcbiAgICogSUQgb2YgYSBzaW5nbGUgV29ya2Zsb3cgcnVuXG4gICAqL1xuICByZWFkb25seSBydW5JZDogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBXb3JrZmxvdyBmdW5jdGlvbidzIG5hbWVcbiAgICovXG4gIHJlYWRvbmx5IHdvcmtmbG93VHlwZTogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBJbmRleGVkIGluZm9ybWF0aW9uIGF0dGFjaGVkIHRvIHRoZSBXb3JrZmxvdyBFeGVjdXRpb25cbiAgICpcbiAgICogVGhpcyB2YWx1ZSBtYXkgY2hhbmdlIGR1cmluZyB0aGUgbGlmZXRpbWUgb2YgYW4gRXhlY3V0aW9uLlxuICAgKi9cbiAgcmVhZG9ubHkgc2VhcmNoQXR0cmlidXRlczogU2VhcmNoQXR0cmlidXRlcztcblxuICAvKipcbiAgICogTm9uLWluZGV4ZWQgaW5mb3JtYXRpb24gYXR0YWNoZWQgdG8gdGhlIFdvcmtmbG93IEV4ZWN1dGlvblxuICAgKi9cbiAgcmVhZG9ubHkgbWVtbz86IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuXG4gIC8qKlxuICAgKiBQYXJlbnQgV29ya2Zsb3cgaW5mbyAocHJlc2VudCBpZiB0aGlzIGlzIGEgQ2hpbGQgV29ya2Zsb3cpXG4gICAqL1xuICByZWFkb25seSBwYXJlbnQ/OiBQYXJlbnRXb3JrZmxvd0luZm87XG5cbiAgLyoqXG4gICAqIFJlc3VsdCBmcm9tIHRoZSBwcmV2aW91cyBSdW4gKHByZXNlbnQgaWYgdGhpcyBpcyBhIENyb24gV29ya2Zsb3cgb3Igd2FzIENvbnRpbnVlZCBBcyBOZXcpLlxuICAgKlxuICAgKiBBbiBhcnJheSBvZiB2YWx1ZXMsIHNpbmNlIG90aGVyIFNES3MgbWF5IHJldHVybiBtdWx0aXBsZSB2YWx1ZXMgZnJvbSBhIFdvcmtmbG93LlxuICAgKi9cbiAgcmVhZG9ubHkgbGFzdFJlc3VsdD86IHVua25vd247XG5cbiAgLyoqXG4gICAqIEZhaWx1cmUgZnJvbSB0aGUgcHJldmlvdXMgUnVuIChwcmVzZW50IHdoZW4gdGhpcyBSdW4gaXMgYSByZXRyeSwgb3IgdGhlIGxhc3QgUnVuIG9mIGEgQ3JvbiBXb3JrZmxvdyBmYWlsZWQpXG4gICAqL1xuICByZWFkb25seSBsYXN0RmFpbHVyZT86IFRlbXBvcmFsRmFpbHVyZTtcblxuICAvKipcbiAgICogTGVuZ3RoIG9mIFdvcmtmbG93IGhpc3RvcnkgdXAgdW50aWwgdGhlIGN1cnJlbnQgV29ya2Zsb3cgVGFzay5cbiAgICpcbiAgICogVGhpcyB2YWx1ZSBjaGFuZ2VzIGR1cmluZyB0aGUgbGlmZXRpbWUgb2YgYW4gRXhlY3V0aW9uLlxuICAgKlxuICAgKiBZb3UgbWF5IHNhZmVseSB1c2UgdGhpcyBpbmZvcm1hdGlvbiB0byBkZWNpZGUgd2hlbiB0byB7QGxpbmsgY29udGludWVBc05ld30uXG4gICAqL1xuICByZWFkb25seSBoaXN0b3J5TGVuZ3RoOiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIFNpemUgb2YgV29ya2Zsb3cgaGlzdG9yeSBpbiBieXRlcyB1bnRpbCB0aGUgY3VycmVudCBXb3JrZmxvdyBUYXNrLlxuICAgKlxuICAgKiBUaGlzIHZhbHVlIGNoYW5nZXMgZHVyaW5nIHRoZSBsaWZldGltZSBvZiBhbiBFeGVjdXRpb24uXG4gICAqXG4gICAqIFN1cHBvcnRlZCBvbmx5IG9uIFRlbXBvcmFsIFNlcnZlciAxLjIwKywgYWx3YXlzIHplcm8gb24gb2xkZXIgc2VydmVycy5cbiAgICpcbiAgICogWW91IG1heSBzYWZlbHkgdXNlIHRoaXMgaW5mb3JtYXRpb24gdG8gZGVjaWRlIHdoZW4gdG8ge0BsaW5rIGNvbnRpbnVlQXNOZXd9LlxuICAgKi9cbiAgcmVhZG9ubHkgaGlzdG9yeVNpemU6IG51bWJlcjtcblxuICAvKipcbiAgICogQSBoaW50IHByb3ZpZGVkIGJ5IHRoZSBjdXJyZW50IFdvcmtmbG93VGFza1N0YXJ0ZWQgZXZlbnQgcmVjb21tZW5kaW5nIHdoZXRoZXIgdG9cbiAgICoge0BsaW5rIGNvbnRpbnVlQXNOZXd9LlxuICAgKlxuICAgKiBUaGlzIHZhbHVlIGNoYW5nZXMgZHVyaW5nIHRoZSBsaWZldGltZSBvZiBhbiBFeGVjdXRpb24uXG4gICAqXG4gICAqIFN1cHBvcnRlZCBvbmx5IG9uIFRlbXBvcmFsIFNlcnZlciAxLjIwKywgYWx3YXlzIGBmYWxzZWAgb24gb2xkZXIgc2VydmVycy5cbiAgICovXG4gIHJlYWRvbmx5IGNvbnRpbnVlQXNOZXdTdWdnZXN0ZWQ6IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIFRhc2sgcXVldWUgdGhpcyBXb3JrZmxvdyBpcyBleGVjdXRpbmcgb25cbiAgICovXG4gIHJlYWRvbmx5IHRhc2tRdWV1ZTogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBOYW1lc3BhY2UgdGhpcyBXb3JrZmxvdyBpcyBleGVjdXRpbmcgaW5cbiAgICovXG4gIHJlYWRvbmx5IG5hbWVzcGFjZTogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBSdW4gSWQgb2YgdGhlIGZpcnN0IFJ1biBpbiB0aGlzIEV4ZWN1dGlvbiBDaGFpblxuICAgKi9cbiAgcmVhZG9ubHkgZmlyc3RFeGVjdXRpb25SdW5JZDogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBUaGUgbGFzdCBSdW4gSWQgaW4gdGhpcyBFeGVjdXRpb24gQ2hhaW5cbiAgICovXG4gIHJlYWRvbmx5IGNvbnRpbnVlZEZyb21FeGVjdXRpb25SdW5JZD86IHN0cmluZztcblxuICAvKipcbiAgICogVGltZSBhdCB3aGljaCB0aGlzIFtXb3JrZmxvdyBFeGVjdXRpb24gQ2hhaW5dKGh0dHBzOi8vZG9jcy50ZW1wb3JhbC5pby93b3JrZmxvd3Mjd29ya2Zsb3ctZXhlY3V0aW9uLWNoYWluKSB3YXMgc3RhcnRlZFxuICAgKi9cbiAgcmVhZG9ubHkgc3RhcnRUaW1lOiBEYXRlO1xuXG4gIC8qKlxuICAgKiBUaW1lIGF0IHdoaWNoIHRoZSBjdXJyZW50IFdvcmtmbG93IFJ1biBzdGFydGVkXG4gICAqL1xuICByZWFkb25seSBydW5TdGFydFRpbWU6IERhdGU7XG5cbiAgLyoqXG4gICAqIE1pbGxpc2Vjb25kcyBhZnRlciB3aGljaCB0aGUgV29ya2Zsb3cgRXhlY3V0aW9uIGlzIGF1dG9tYXRpY2FsbHkgdGVybWluYXRlZCBieSBUZW1wb3JhbCBTZXJ2ZXIuIFNldCB2aWEge0BsaW5rIFdvcmtmbG93T3B0aW9ucy53b3JrZmxvd0V4ZWN1dGlvblRpbWVvdXR9LlxuICAgKi9cbiAgcmVhZG9ubHkgZXhlY3V0aW9uVGltZW91dE1zPzogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiBUaW1lIGF0IHdoaWNoIHRoZSBXb3JrZmxvdyBFeGVjdXRpb24gZXhwaXJlc1xuICAgKi9cbiAgcmVhZG9ubHkgZXhlY3V0aW9uRXhwaXJhdGlvblRpbWU/OiBEYXRlO1xuXG4gIC8qKlxuICAgKiBNaWxsaXNlY29uZHMgYWZ0ZXIgd2hpY2ggdGhlIFdvcmtmbG93IFJ1biBpcyBhdXRvbWF0aWNhbGx5IHRlcm1pbmF0ZWQgYnkgVGVtcG9yYWwgU2VydmVyLiBTZXQgdmlhIHtAbGluayBXb3JrZmxvd09wdGlvbnMud29ya2Zsb3dSdW5UaW1lb3V0fS5cbiAgICovXG4gIHJlYWRvbmx5IHJ1blRpbWVvdXRNcz86IG51bWJlcjtcblxuICAvKipcbiAgICogTWF4aW11bSBleGVjdXRpb24gdGltZSBvZiBhIFdvcmtmbG93IFRhc2sgaW4gbWlsbGlzZWNvbmRzLiBTZXQgdmlhIHtAbGluayBXb3JrZmxvd09wdGlvbnMud29ya2Zsb3dUYXNrVGltZW91dH0uXG4gICAqL1xuICByZWFkb25seSB0YXNrVGltZW91dE1zOiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIFJldHJ5IFBvbGljeSBmb3IgdGhpcyBFeGVjdXRpb24uIFNldCB2aWEge0BsaW5rIFdvcmtmbG93T3B0aW9ucy5yZXRyeX0uXG4gICAqL1xuICByZWFkb25seSByZXRyeVBvbGljeT86IFJldHJ5UG9saWN5O1xuXG4gIC8qKlxuICAgKiBTdGFydHMgYXQgMSBhbmQgaW5jcmVtZW50cyBmb3IgZXZlcnkgcmV0cnkgaWYgdGhlcmUgaXMgYSBgcmV0cnlQb2xpY3lgXG4gICAqL1xuICByZWFkb25seSBhdHRlbXB0OiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIENyb24gU2NoZWR1bGUgZm9yIHRoaXMgRXhlY3V0aW9uLiBTZXQgdmlhIHtAbGluayBXb3JrZmxvd09wdGlvbnMuY3JvblNjaGVkdWxlfS5cbiAgICovXG4gIHJlYWRvbmx5IGNyb25TY2hlZHVsZT86IHN0cmluZztcblxuICAvKipcbiAgICogTWlsbGlzZWNvbmRzIGJldHdlZW4gQ3JvbiBSdW5zXG4gICAqL1xuICByZWFkb25seSBjcm9uU2NoZWR1bGVUb1NjaGVkdWxlSW50ZXJ2YWw/OiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIFRoZSBCdWlsZCBJRCBvZiB0aGUgd29ya2VyIHdoaWNoIGV4ZWN1dGVkIHRoZSBjdXJyZW50IFdvcmtmbG93IFRhc2suIE1heSBiZSB1bmRlZmluZWQgaWYgdGhlXG4gICAqIHRhc2sgd2FzIGNvbXBsZXRlZCBieSBhIHdvcmtlciB3aXRob3V0IGEgQnVpbGQgSUQuIElmIHRoaXMgd29ya2VyIGlzIHRoZSBvbmUgZXhlY3V0aW5nIHRoaXNcbiAgICogdGFzayBmb3IgdGhlIGZpcnN0IHRpbWUgYW5kIGhhcyBhIEJ1aWxkIElEIHNldCwgdGhlbiBpdHMgSUQgd2lsbCBiZSB1c2VkLiBUaGlzIHZhbHVlIG1heSBjaGFuZ2VcbiAgICogb3ZlciB0aGUgbGlmZXRpbWUgb2YgdGhlIHdvcmtmbG93IHJ1biwgYnV0IGlzIGRldGVybWluaXN0aWMgYW5kIHNhZmUgdG8gdXNlIGZvciBicmFuY2hpbmcuXG4gICAqL1xuICByZWFkb25seSBjdXJyZW50QnVpbGRJZD86IHN0cmluZztcblxuICByZWFkb25seSB1bnNhZmU6IFVuc2FmZVdvcmtmbG93SW5mbztcbn1cblxuLyoqXG4gKiBVbnNhZmUgaW5mb3JtYXRpb24gYWJvdXQgdGhlIGN1cnJlbnQgV29ya2Zsb3cgRXhlY3V0aW9uLlxuICpcbiAqIE5ldmVyIHJlbHkgb24gdGhpcyBpbmZvcm1hdGlvbiBpbiBXb3JrZmxvdyBsb2dpYyBhcyBpdCB3aWxsIGNhdXNlIG5vbi1kZXRlcm1pbmlzdGljIGJlaGF2aW9yLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFVuc2FmZVdvcmtmbG93SW5mbyB7XG4gIC8qKlxuICAgKiBDdXJyZW50IHN5c3RlbSB0aW1lIGluIG1pbGxpc2Vjb25kc1xuICAgKlxuICAgKiBUaGUgc2FmZSB2ZXJzaW9uIG9mIHRpbWUgaXMgYG5ldyBEYXRlKClgIGFuZCBgRGF0ZS5ub3coKWAsIHdoaWNoIGFyZSBzZXQgb24gdGhlIGZpcnN0IGludm9jYXRpb24gb2YgYSBXb3JrZmxvd1xuICAgKiBUYXNrIGFuZCBzdGF5IGNvbnN0YW50IGZvciB0aGUgZHVyYXRpb24gb2YgdGhlIFRhc2sgYW5kIGR1cmluZyByZXBsYXkuXG4gICAqL1xuICByZWFkb25seSBub3c6ICgpID0+IG51bWJlcjtcblxuICByZWFkb25seSBpc1JlcGxheWluZzogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBJbmZvcm1hdGlvbiBhYm91dCBhIHdvcmtmbG93IHVwZGF0ZS5cbiAqXG4gKiBAZXhwZXJpbWVudGFsXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgVXBkYXRlSW5mbyB7XG4gIC8qKlxuICAgKiAgQSB3b3JrZmxvdy11bmlxdWUgaWRlbnRpZmllciBmb3IgdGhpcyB1cGRhdGUuXG4gICAqL1xuICByZWFkb25seSBpZDogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiAgVGhlIHVwZGF0ZSB0eXBlIG5hbWUuXG4gICAqL1xuICByZWFkb25seSBuYW1lOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUGFyZW50V29ya2Zsb3dJbmZvIHtcbiAgd29ya2Zsb3dJZDogc3RyaW5nO1xuICBydW5JZDogc3RyaW5nO1xuICBuYW1lc3BhY2U6IHN0cmluZztcbn1cblxuLyoqXG4gKiBOb3QgYW4gYWN0dWFsIGVycm9yLCB1c2VkIGJ5IHRoZSBXb3JrZmxvdyBydW50aW1lIHRvIGFib3J0IGV4ZWN1dGlvbiB3aGVuIHtAbGluayBjb250aW51ZUFzTmV3fSBpcyBjYWxsZWRcbiAqL1xuQFN5bWJvbEJhc2VkSW5zdGFuY2VPZkVycm9yKCdDb250aW51ZUFzTmV3JylcbmV4cG9ydCBjbGFzcyBDb250aW51ZUFzTmV3IGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgcmVhZG9ubHkgY29tbWFuZDogY29yZXNkay53b3JrZmxvd19jb21tYW5kcy5JQ29udGludWVBc05ld1dvcmtmbG93RXhlY3V0aW9uKSB7XG4gICAgc3VwZXIoJ1dvcmtmbG93IGNvbnRpbnVlZCBhcyBuZXcnKTtcbiAgfVxufVxuXG4vKipcbiAqIE9wdGlvbnMgZm9yIGNvbnRpbnVpbmcgYSBXb3JrZmxvdyBhcyBuZXdcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBDb250aW51ZUFzTmV3T3B0aW9ucyB7XG4gIC8qKlxuICAgKiBBIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIFdvcmtmbG93IHR5cGUgbmFtZSwgZS5nLiB0aGUgZmlsZW5hbWUgaW4gdGhlIE5vZGUuanMgU0RLIG9yIGNsYXNzIG5hbWUgaW4gSmF2YVxuICAgKi9cbiAgd29ya2Zsb3dUeXBlPzogc3RyaW5nO1xuICAvKipcbiAgICogVGFzayBxdWV1ZSB0byBjb250aW51ZSB0aGUgV29ya2Zsb3cgaW5cbiAgICovXG4gIHRhc2tRdWV1ZT86IHN0cmluZztcbiAgLyoqXG4gICAqIFRpbWVvdXQgZm9yIHRoZSBlbnRpcmUgV29ya2Zsb3cgcnVuXG4gICAqIEBmb3JtYXQge0BsaW5rIGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL21zIHwgbXMtZm9ybWF0dGVkIHN0cmluZ31cbiAgICovXG4gIHdvcmtmbG93UnVuVGltZW91dD86IER1cmF0aW9uO1xuICAvKipcbiAgICogVGltZW91dCBmb3IgYSBzaW5nbGUgV29ya2Zsb3cgdGFza1xuICAgKiBAZm9ybWF0IHtAbGluayBodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9tcyB8IG1zLWZvcm1hdHRlZCBzdHJpbmd9XG4gICAqL1xuICB3b3JrZmxvd1Rhc2tUaW1lb3V0PzogRHVyYXRpb247XG4gIC8qKlxuICAgKiBOb24tc2VhcmNoYWJsZSBhdHRyaWJ1dGVzIHRvIGF0dGFjaCB0byBuZXh0IFdvcmtmbG93IHJ1blxuICAgKi9cbiAgbWVtbz86IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICAvKipcbiAgICogU2VhcmNoYWJsZSBhdHRyaWJ1dGVzIHRvIGF0dGFjaCB0byBuZXh0IFdvcmtmbG93IHJ1blxuICAgKi9cbiAgc2VhcmNoQXR0cmlidXRlcz86IFNlYXJjaEF0dHJpYnV0ZXM7XG4gIC8qKlxuICAgKiBXaGVuIHVzaW5nIHRoZSBXb3JrZXIgVmVyc2lvbmluZyBmZWF0dXJlLCBzcGVjaWZpZXMgd2hldGhlciB0aGlzIFdvcmtmbG93IHNob3VsZFxuICAgKiBDb250aW51ZS1hcy1OZXcgb250byBhIHdvcmtlciB3aXRoIGEgY29tcGF0aWJsZSBCdWlsZCBJZCBvciBub3QuIFNlZSB7QGxpbmsgVmVyc2lvbmluZ0ludGVudH0uXG4gICAqXG4gICAqIEBkZWZhdWx0ICdDT01QQVRJQkxFJ1xuICAgKlxuICAgKiBAZXhwZXJpbWVudGFsXG4gICAqL1xuICB2ZXJzaW9uaW5nSW50ZW50PzogVmVyc2lvbmluZ0ludGVudDtcbn1cblxuLyoqXG4gKiBTcGVjaWZpZXM6XG4gKiAtIHdoZXRoZXIgY2FuY2VsbGF0aW9uIHJlcXVlc3RzIGFyZSBzZW50IHRvIHRoZSBDaGlsZFxuICogLSB3aGV0aGVyIGFuZCB3aGVuIGEge0BsaW5rIENhbmNlbGVkRmFpbHVyZX0gaXMgdGhyb3duIGZyb20ge0BsaW5rIGV4ZWN1dGVDaGlsZH0gb3JcbiAqICAge0BsaW5rIENoaWxkV29ya2Zsb3dIYW5kbGUucmVzdWx0fVxuICpcbiAqIEBkZWZhdWx0IHtAbGluayBDaGlsZFdvcmtmbG93Q2FuY2VsbGF0aW9uVHlwZS5XQUlUX0NBTkNFTExBVElPTl9DT01QTEVURUR9XG4gKi9cbmV4cG9ydCBlbnVtIENoaWxkV29ya2Zsb3dDYW5jZWxsYXRpb25UeXBlIHtcbiAgLyoqXG4gICAqIERvbid0IHNlbmQgYSBjYW5jZWxsYXRpb24gcmVxdWVzdCB0byB0aGUgQ2hpbGQuXG4gICAqL1xuICBBQkFORE9OID0gMCxcblxuICAvKipcbiAgICogU2VuZCBhIGNhbmNlbGxhdGlvbiByZXF1ZXN0IHRvIHRoZSBDaGlsZC4gSW1tZWRpYXRlbHkgdGhyb3cgdGhlIGVycm9yLlxuICAgKi9cbiAgVFJZX0NBTkNFTCA9IDEsXG5cbiAgLyoqXG4gICAqIFNlbmQgYSBjYW5jZWxsYXRpb24gcmVxdWVzdCB0byB0aGUgQ2hpbGQuIFRoZSBDaGlsZCBtYXkgcmVzcGVjdCBjYW5jZWxsYXRpb24sIGluIHdoaWNoIGNhc2UgYW4gZXJyb3Igd2lsbCBiZSB0aHJvd25cbiAgICogd2hlbiBjYW5jZWxsYXRpb24gaGFzIGNvbXBsZXRlZCwgYW5kIHtAbGluayBpc0NhbmNlbGxhdGlvbn0oZXJyb3IpIHdpbGwgYmUgdHJ1ZS4gT24gdGhlIG90aGVyIGhhbmQsIHRoZSBDaGlsZCBtYXlcbiAgICogaWdub3JlIHRoZSBjYW5jZWxsYXRpb24gcmVxdWVzdCwgaW4gd2hpY2ggY2FzZSBhbiBlcnJvciBtaWdodCBiZSB0aHJvd24gd2l0aCBhIGRpZmZlcmVudCBjYXVzZSwgb3IgdGhlIENoaWxkIG1heVxuICAgKiBjb21wbGV0ZSBzdWNjZXNzZnVsbHkuXG4gICAqXG4gICAqIEBkZWZhdWx0XG4gICAqL1xuICBXQUlUX0NBTkNFTExBVElPTl9DT01QTEVURUQgPSAyLFxuXG4gIC8qKlxuICAgKiBTZW5kIGEgY2FuY2VsbGF0aW9uIHJlcXVlc3QgdG8gdGhlIENoaWxkLiBUaHJvdyB0aGUgZXJyb3Igb25jZSB0aGUgU2VydmVyIHJlY2VpdmVzIHRoZSBDaGlsZCBjYW5jZWxsYXRpb24gcmVxdWVzdC5cbiAgICovXG4gIFdBSVRfQ0FOQ0VMTEFUSU9OX1JFUVVFU1RFRCA9IDMsXG59XG5cbmNoZWNrRXh0ZW5kczxjb3Jlc2RrLmNoaWxkX3dvcmtmbG93LkNoaWxkV29ya2Zsb3dDYW5jZWxsYXRpb25UeXBlLCBDaGlsZFdvcmtmbG93Q2FuY2VsbGF0aW9uVHlwZT4oKTtcbmNoZWNrRXh0ZW5kczxDaGlsZFdvcmtmbG93Q2FuY2VsbGF0aW9uVHlwZSwgY29yZXNkay5jaGlsZF93b3JrZmxvdy5DaGlsZFdvcmtmbG93Q2FuY2VsbGF0aW9uVHlwZT4oKTtcblxuLyoqXG4gKiBIb3cgYSBDaGlsZCBXb3JrZmxvdyByZWFjdHMgdG8gdGhlIFBhcmVudCBXb3JrZmxvdyByZWFjaGluZyBhIENsb3NlZCBzdGF0ZS5cbiAqXG4gKiBAc2VlIHtAbGluayBodHRwczovL2RvY3MudGVtcG9yYWwuaW8vY29uY2VwdHMvd2hhdC1pcy1hLXBhcmVudC1jbG9zZS1wb2xpY3kvIHwgUGFyZW50IENsb3NlIFBvbGljeX1cbiAqL1xuZXhwb3J0IGVudW0gUGFyZW50Q2xvc2VQb2xpY3kge1xuICAvKipcbiAgICogSWYgYSBgUGFyZW50Q2xvc2VQb2xpY3lgIGlzIHNldCB0byB0aGlzLCBvciBpcyBub3Qgc2V0IGF0IGFsbCwgdGhlIHNlcnZlciBkZWZhdWx0IHZhbHVlIHdpbGwgYmUgdXNlZC5cbiAgICovXG4gIFBBUkVOVF9DTE9TRV9QT0xJQ1lfVU5TUEVDSUZJRUQgPSAwLFxuXG4gIC8qKlxuICAgKiBXaGVuIHRoZSBQYXJlbnQgaXMgQ2xvc2VkLCB0aGUgQ2hpbGQgaXMgVGVybWluYXRlZC5cbiAgICpcbiAgICogQGRlZmF1bHRcbiAgICovXG4gIFBBUkVOVF9DTE9TRV9QT0xJQ1lfVEVSTUlOQVRFID0gMSxcblxuICAvKipcbiAgICogV2hlbiB0aGUgUGFyZW50IGlzIENsb3NlZCwgbm90aGluZyBpcyBkb25lIHRvIHRoZSBDaGlsZC5cbiAgICovXG4gIFBBUkVOVF9DTE9TRV9QT0xJQ1lfQUJBTkRPTiA9IDIsXG5cbiAgLyoqXG4gICAqIFdoZW4gdGhlIFBhcmVudCBpcyBDbG9zZWQsIHRoZSBDaGlsZCBpcyBDYW5jZWxsZWQuXG4gICAqL1xuICBQQVJFTlRfQ0xPU0VfUE9MSUNZX1JFUVVFU1RfQ0FOQ0VMID0gMyxcbn1cblxuY2hlY2tFeHRlbmRzPGNvcmVzZGsuY2hpbGRfd29ya2Zsb3cuUGFyZW50Q2xvc2VQb2xpY3ksIFBhcmVudENsb3NlUG9saWN5PigpO1xuY2hlY2tFeHRlbmRzPFBhcmVudENsb3NlUG9saWN5LCBjb3Jlc2RrLmNoaWxkX3dvcmtmbG93LlBhcmVudENsb3NlUG9saWN5PigpO1xuXG5leHBvcnQgaW50ZXJmYWNlIENoaWxkV29ya2Zsb3dPcHRpb25zIGV4dGVuZHMgQ29tbW9uV29ya2Zsb3dPcHRpb25zIHtcbiAgLyoqXG4gICAqIFdvcmtmbG93IGlkIHRvIHVzZSB3aGVuIHN0YXJ0aW5nLiBJZiBub3Qgc3BlY2lmaWVkIGEgVVVJRCBpcyBnZW5lcmF0ZWQuIE5vdGUgdGhhdCBpdCBpc1xuICAgKiBkYW5nZXJvdXMgYXMgaW4gY2FzZSBvZiBjbGllbnQgc2lkZSByZXRyaWVzIG5vIGRlZHVwbGljYXRpb24gd2lsbCBoYXBwZW4gYmFzZWQgb24gdGhlXG4gICAqIGdlbmVyYXRlZCBpZC4gU28gcHJlZmVyIGFzc2lnbmluZyBidXNpbmVzcyBtZWFuaW5nZnVsIGlkcyBpZiBwb3NzaWJsZS5cbiAgICovXG4gIHdvcmtmbG93SWQ/OiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIFRhc2sgcXVldWUgdG8gdXNlIGZvciBXb3JrZmxvdyB0YXNrcy4gSXQgc2hvdWxkIG1hdGNoIGEgdGFzayBxdWV1ZSBzcGVjaWZpZWQgd2hlbiBjcmVhdGluZyBhXG4gICAqIGBXb3JrZXJgIHRoYXQgaG9zdHMgdGhlIFdvcmtmbG93IGNvZGUuXG4gICAqL1xuICB0YXNrUXVldWU/OiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIFNwZWNpZmllczpcbiAgICogLSB3aGV0aGVyIGNhbmNlbGxhdGlvbiByZXF1ZXN0cyBhcmUgc2VudCB0byB0aGUgQ2hpbGRcbiAgICogLSB3aGV0aGVyIGFuZCB3aGVuIGFuIGVycm9yIGlzIHRocm93biBmcm9tIHtAbGluayBleGVjdXRlQ2hpbGR9IG9yXG4gICAqICAge0BsaW5rIENoaWxkV29ya2Zsb3dIYW5kbGUucmVzdWx0fVxuICAgKlxuICAgKiBAZGVmYXVsdCB7QGxpbmsgQ2hpbGRXb3JrZmxvd0NhbmNlbGxhdGlvblR5cGUuV0FJVF9DQU5DRUxMQVRJT05fQ09NUExFVEVEfVxuICAgKi9cbiAgY2FuY2VsbGF0aW9uVHlwZT86IENoaWxkV29ya2Zsb3dDYW5jZWxsYXRpb25UeXBlO1xuXG4gIC8qKlxuICAgKiBTcGVjaWZpZXMgaG93IHRoZSBDaGlsZCByZWFjdHMgdG8gdGhlIFBhcmVudCBXb3JrZmxvdyByZWFjaGluZyBhIENsb3NlZCBzdGF0ZS5cbiAgICpcbiAgICogQGRlZmF1bHQge0BsaW5rIFBhcmVudENsb3NlUG9saWN5LlBBUkVOVF9DTE9TRV9QT0xJQ1lfVEVSTUlOQVRFfVxuICAgKi9cbiAgcGFyZW50Q2xvc2VQb2xpY3k/OiBQYXJlbnRDbG9zZVBvbGljeTtcblxuICAvKipcbiAgICogV2hlbiB1c2luZyB0aGUgV29ya2VyIFZlcnNpb25pbmcgZmVhdHVyZSwgc3BlY2lmaWVzIHdoZXRoZXIgdGhpcyBDaGlsZCBXb3JrZmxvdyBzaG91bGQgcnVuIG9uXG4gICAqIGEgd29ya2VyIHdpdGggYSBjb21wYXRpYmxlIEJ1aWxkIElkIG9yIG5vdC4gU2VlIHtAbGluayBWZXJzaW9uaW5nSW50ZW50fS5cbiAgICpcbiAgICogQGRlZmF1bHQgJ0NPTVBBVElCTEUnXG4gICAqXG4gICAqIEBleHBlcmltZW50YWxcbiAgICovXG4gIHZlcnNpb25pbmdJbnRlbnQ/OiBWZXJzaW9uaW5nSW50ZW50O1xufVxuXG5leHBvcnQgdHlwZSBSZXF1aXJlZENoaWxkV29ya2Zsb3dPcHRpb25zID0gUmVxdWlyZWQ8UGljazxDaGlsZFdvcmtmbG93T3B0aW9ucywgJ3dvcmtmbG93SWQnIHwgJ2NhbmNlbGxhdGlvblR5cGUnPj4gJiB7XG4gIGFyZ3M6IHVua25vd25bXTtcbn07XG5cbmV4cG9ydCB0eXBlIENoaWxkV29ya2Zsb3dPcHRpb25zV2l0aERlZmF1bHRzID0gQ2hpbGRXb3JrZmxvd09wdGlvbnMgJiBSZXF1aXJlZENoaWxkV29ya2Zsb3dPcHRpb25zO1xuXG5leHBvcnQgaW50ZXJmYWNlIFN0YWNrVHJhY2VTREtJbmZvIHtcbiAgbmFtZTogc3RyaW5nO1xuICB2ZXJzaW9uOiBzdHJpbmc7XG59XG5cbi8qKlxuICogUmVwcmVzZW50cyBhIHNsaWNlIG9mIGEgZmlsZSBzdGFydGluZyBhdCBsaW5lT2Zmc2V0XG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgU3RhY2tUcmFjZUZpbGVTbGljZSB7XG4gIC8qKlxuICAgKiBPbmx5IHVzZWQgcG9zc2libGUgdG8gdHJpbSB0aGUgZmlsZSB3aXRob3V0IGJyZWFraW5nIHN5bnRheCBoaWdobGlnaHRpbmcuXG4gICAqL1xuICBsaW5lX29mZnNldDogbnVtYmVyO1xuICAvKipcbiAgICogc2xpY2Ugb2YgYSBmaWxlIHdpdGggYFxcbmAgKG5ld2xpbmUpIGxpbmUgdGVybWluYXRvci5cbiAgICovXG4gIGNvbnRlbnQ6IHN0cmluZztcbn1cblxuLyoqXG4gKiBBIHBvaW50ZXIgdG8gYSBsb2NhdGlvbiBpbiBhIGZpbGVcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBTdGFja1RyYWNlRmlsZUxvY2F0aW9uIHtcbiAgLyoqXG4gICAqIFBhdGggdG8gc291cmNlIGZpbGUgKGFic29sdXRlIG9yIHJlbGF0aXZlKS5cbiAgICogV2hlbiB1c2luZyBhIHJlbGF0aXZlIHBhdGgsIG1ha2Ugc3VyZSBhbGwgcGF0aHMgYXJlIHJlbGF0aXZlIHRvIHRoZSBzYW1lIHJvb3QuXG4gICAqL1xuICBmaWxlX3BhdGg/OiBzdHJpbmc7XG4gIC8qKlxuICAgKiBJZiBwb3NzaWJsZSwgU0RLIHNob3VsZCBzZW5kIHRoaXMsIHJlcXVpcmVkIGZvciBkaXNwbGF5aW5nIHRoZSBjb2RlIGxvY2F0aW9uLlxuICAgKi9cbiAgbGluZT86IG51bWJlcjtcbiAgLyoqXG4gICAqIElmIHBvc3NpYmxlLCBTREsgc2hvdWxkIHNlbmQgdGhpcy5cbiAgICovXG4gIGNvbHVtbj86IG51bWJlcjtcbiAgLyoqXG4gICAqIEZ1bmN0aW9uIG5hbWUgdGhpcyBsaW5lIGJlbG9uZ3MgdG8gKGlmIGFwcGxpY2FibGUpLlxuICAgKiBVc2VkIGZvciBmYWxsaW5nIGJhY2sgdG8gc3RhY2sgdHJhY2Ugdmlldy5cbiAgICovXG4gIGZ1bmN0aW9uX25hbWU/OiBzdHJpbmc7XG4gIC8qKlxuICAgKiBGbGFnIHRvIG1hcmsgdGhpcyBhcyBpbnRlcm5hbCBTREsgY29kZSBhbmQgaGlkZSBieSBkZWZhdWx0IGluIHRoZSBVSS5cbiAgICovXG4gIGludGVybmFsX2NvZGU6IGJvb2xlYW47XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgU3RhY2tUcmFjZSB7XG4gIGxvY2F0aW9uczogU3RhY2tUcmFjZUZpbGVMb2NhdGlvbltdO1xufVxuXG4vKipcbiAqIFVzZWQgYXMgdGhlIHJlc3VsdCBmb3IgdGhlIGVuaGFuY2VkIHN0YWNrIHRyYWNlIHF1ZXJ5XG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRW5oYW5jZWRTdGFja1RyYWNlIHtcbiAgc2RrOiBTdGFja1RyYWNlU0RLSW5mbztcbiAgLyoqXG4gICAqIE1hcHBpbmcgb2YgZmlsZSBwYXRoIHRvIGZpbGUgY29udGVudHMuXG4gICAqIFNESyBtYXkgY2hvb3NlIHRvIHNlbmQgbm8sIHNvbWUgb3IgYWxsIHNvdXJjZXMuXG4gICAqIFNvdXJjZXMgbWlnaHQgYmUgdHJpbW1lZCwgYW5kIHNvbWUgdGltZSBvbmx5IHRoZSBmaWxlKHMpIG9mIHRoZSB0b3AgZWxlbWVudCBvZiB0aGUgdHJhY2Ugd2lsbCBiZSBzZW50LlxuICAgKi9cbiAgc291cmNlczogUmVjb3JkPHN0cmluZywgU3RhY2tUcmFjZUZpbGVTbGljZVtdPjtcbiAgc3RhY2tzOiBTdGFja1RyYWNlW107XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgV29ya2Zsb3dDcmVhdGVPcHRpb25zIHtcbiAgaW5mbzogV29ya2Zsb3dJbmZvO1xuICByYW5kb21uZXNzU2VlZDogbnVtYmVyW107XG4gIG5vdzogbnVtYmVyO1xuICBzaG93U3RhY2tUcmFjZVNvdXJjZXM6IGJvb2xlYW47XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgV29ya2Zsb3dDcmVhdGVPcHRpb25zSW50ZXJuYWwgZXh0ZW5kcyBXb3JrZmxvd0NyZWF0ZU9wdGlvbnMge1xuICBzb3VyY2VNYXA6IFJhd1NvdXJjZU1hcDtcbiAgcmVnaXN0ZXJlZEFjdGl2aXR5TmFtZXM6IFNldDxzdHJpbmc+O1xuICBnZXRUaW1lT2ZEYXkoKTogYmlnaW50O1xufVxuXG4vKipcbiAqIEEgaGFuZGxlciBmdW5jdGlvbiBjYXBhYmxlIG9mIGFjY2VwdGluZyB0aGUgYXJndW1lbnRzIGZvciBhIGdpdmVuIFVwZGF0ZURlZmluaXRpb24sIFNpZ25hbERlZmluaXRpb24gb3IgUXVlcnlEZWZpbml0aW9uLlxuICovXG5leHBvcnQgdHlwZSBIYW5kbGVyPFxuICBSZXQsXG4gIEFyZ3MgZXh0ZW5kcyBhbnlbXSxcbiAgVCBleHRlbmRzIFVwZGF0ZURlZmluaXRpb248UmV0LCBBcmdzPiB8IFNpZ25hbERlZmluaXRpb248QXJncz4gfCBRdWVyeURlZmluaXRpb248UmV0LCBBcmdzPixcbj4gPSBUIGV4dGVuZHMgVXBkYXRlRGVmaW5pdGlvbjxpbmZlciBSLCBpbmZlciBBPlxuICA/ICguLi5hcmdzOiBBKSA9PiBSIHwgUHJvbWlzZTxSPlxuICA6IFQgZXh0ZW5kcyBTaWduYWxEZWZpbml0aW9uPGluZmVyIEE+XG4gICAgPyAoLi4uYXJnczogQSkgPT4gdm9pZCB8IFByb21pc2U8dm9pZD5cbiAgICA6IFQgZXh0ZW5kcyBRdWVyeURlZmluaXRpb248aW5mZXIgUiwgaW5mZXIgQT5cbiAgICAgID8gKC4uLmFyZ3M6IEEpID0+IFJcbiAgICAgIDogbmV2ZXI7XG5cbi8qKlxuICogQSBoYW5kbGVyIGZ1bmN0aW9uIGFjY2VwdGluZyBzaWduYWwgY2FsbHMgZm9yIG5vbi1yZWdpc3RlcmVkIHNpZ25hbCBuYW1lcy5cbiAqL1xuZXhwb3J0IHR5cGUgRGVmYXVsdFNpZ25hbEhhbmRsZXIgPSAoc2lnbmFsTmFtZTogc3RyaW5nLCAuLi5hcmdzOiB1bmtub3duW10pID0+IHZvaWQgfCBQcm9taXNlPHZvaWQ+O1xuXG4vKipcbiAqIEEgdmFsaWRhdGlvbiBmdW5jdGlvbiBjYXBhYmxlIG9mIGFjY2VwdGluZyB0aGUgYXJndW1lbnRzIGZvciBhIGdpdmVuIFVwZGF0ZURlZmluaXRpb24uXG4gKi9cbmV4cG9ydCB0eXBlIFVwZGF0ZVZhbGlkYXRvcjxBcmdzIGV4dGVuZHMgYW55W10+ID0gKC4uLmFyZ3M6IEFyZ3MpID0+IHZvaWQ7XG5cbi8qKlxuICogQSBkZXNjcmlwdGlvbiBvZiBhIHF1ZXJ5IGhhbmRsZXIuXG4gKi9cbmV4cG9ydCB0eXBlIFF1ZXJ5SGFuZGxlck9wdGlvbnMgPSB7IGRlc2NyaXB0aW9uPzogc3RyaW5nIH07XG5cbi8qKlxuICogQSBkZXNjcmlwdGlvbiBvZiBhIHNpZ25hbCBoYW5kbGVyLlxuICovXG5leHBvcnQgdHlwZSBTaWduYWxIYW5kbGVyT3B0aW9ucyA9IHsgZGVzY3JpcHRpb24/OiBzdHJpbmc7IHVuZmluaXNoZWRQb2xpY3k/OiBIYW5kbGVyVW5maW5pc2hlZFBvbGljeSB9O1xuXG4vKipcbiAqIEEgdmFsaWRhdG9yIGFuZCBkZXNjcmlwdGlvbiBvZiBhbiB1cGRhdGUgaGFuZGxlci5cbiAqL1xuZXhwb3J0IHR5cGUgVXBkYXRlSGFuZGxlck9wdGlvbnM8QXJncyBleHRlbmRzIGFueVtdPiA9IHtcbiAgdmFsaWRhdG9yPzogVXBkYXRlVmFsaWRhdG9yPEFyZ3M+O1xuICBkZXNjcmlwdGlvbj86IHN0cmluZztcbiAgdW5maW5pc2hlZFBvbGljeT86IEhhbmRsZXJVbmZpbmlzaGVkUG9saWN5O1xufTtcblxuZXhwb3J0IGludGVyZmFjZSBBY3RpdmF0aW9uQ29tcGxldGlvbiB7XG4gIGNvbW1hbmRzOiBjb3Jlc2RrLndvcmtmbG93X2NvbW1hbmRzLklXb3JrZmxvd0NvbW1hbmRbXTtcbiAgdXNlZEludGVybmFsRmxhZ3M6IG51bWJlcltdO1xufVxuIiwiaW1wb3J0IHR5cGUgeyBSYXdTb3VyY2VNYXAgfSBmcm9tICdzb3VyY2UtbWFwJztcbmltcG9ydCB7XG4gIGRlZmF1bHRGYWlsdXJlQ29udmVydGVyLFxuICBGYWlsdXJlQ29udmVydGVyLFxuICBQYXlsb2FkQ29udmVydGVyLFxuICBhcnJheUZyb21QYXlsb2FkcyxcbiAgZGVmYXVsdFBheWxvYWRDb252ZXJ0ZXIsXG4gIGVuc3VyZVRlbXBvcmFsRmFpbHVyZSxcbiAgSGFuZGxlclVuZmluaXNoZWRQb2xpY3ksXG4gIElsbGVnYWxTdGF0ZUVycm9yLFxuICBUZW1wb3JhbEZhaWx1cmUsXG4gIFdvcmtmbG93LFxuICBXb3JrZmxvd0V4ZWN1dGlvbkFscmVhZHlTdGFydGVkRXJyb3IsXG4gIFdvcmtmbG93UXVlcnlBbm5vdGF0ZWRUeXBlLFxuICBXb3JrZmxvd1NpZ25hbEFubm90YXRlZFR5cGUsXG4gIFdvcmtmbG93VXBkYXRlQW5ub3RhdGVkVHlwZSxcbiAgUHJvdG9GYWlsdXJlLFxuICBBcHBsaWNhdGlvbkZhaWx1cmUsXG4gIFdvcmtmbG93VXBkYXRlVHlwZSxcbiAgV29ya2Zsb3dVcGRhdGVWYWxpZGF0b3JUeXBlLFxuICBtYXBGcm9tUGF5bG9hZHMsXG4gIHNlYXJjaEF0dHJpYnV0ZVBheWxvYWRDb252ZXJ0ZXIsXG4gIGZyb21QYXlsb2Fkc0F0SW5kZXgsXG4gIFNlYXJjaEF0dHJpYnV0ZXMsXG59IGZyb20gJ0B0ZW1wb3JhbGlvL2NvbW1vbic7XG5pbXBvcnQgeyBjb21wb3NlSW50ZXJjZXB0b3JzIH0gZnJvbSAnQHRlbXBvcmFsaW8vY29tbW9uL2xpYi9pbnRlcmNlcHRvcnMnO1xuaW1wb3J0IHsgY2hlY2tFeHRlbmRzIH0gZnJvbSAnQHRlbXBvcmFsaW8vY29tbW9uL2xpYi90eXBlLWhlbHBlcnMnO1xuaW1wb3J0IHR5cGUgeyBjb3Jlc2RrLCB0ZW1wb3JhbCB9IGZyb20gJ0B0ZW1wb3JhbGlvL3Byb3RvJztcbmltcG9ydCB7IGFsZWEsIFJORyB9IGZyb20gJy4vYWxlYSc7XG5pbXBvcnQgeyBSb290Q2FuY2VsbGF0aW9uU2NvcGUgfSBmcm9tICcuL2NhbmNlbGxhdGlvbi1zY29wZSc7XG5pbXBvcnQgeyBVcGRhdGVTY29wZSB9IGZyb20gJy4vdXBkYXRlLXNjb3BlJztcbmltcG9ydCB7IERldGVybWluaXNtVmlvbGF0aW9uRXJyb3IsIExvY2FsQWN0aXZpdHlEb0JhY2tvZmYsIGlzQ2FuY2VsbGF0aW9uIH0gZnJvbSAnLi9lcnJvcnMnO1xuaW1wb3J0IHsgUXVlcnlJbnB1dCwgU2lnbmFsSW5wdXQsIFVwZGF0ZUlucHV0LCBXb3JrZmxvd0V4ZWN1dGVJbnB1dCwgV29ya2Zsb3dJbnRlcmNlcHRvcnMgfSBmcm9tICcuL2ludGVyY2VwdG9ycyc7XG5pbXBvcnQge1xuICBDb250aW51ZUFzTmV3LFxuICBEZWZhdWx0U2lnbmFsSGFuZGxlcixcbiAgU3RhY2tUcmFjZVNES0luZm8sXG4gIFN0YWNrVHJhY2VGaWxlU2xpY2UsXG4gIEVuaGFuY2VkU3RhY2tUcmFjZSxcbiAgU3RhY2tUcmFjZUZpbGVMb2NhdGlvbixcbiAgV29ya2Zsb3dJbmZvLFxuICBXb3JrZmxvd0NyZWF0ZU9wdGlvbnNJbnRlcm5hbCxcbiAgQWN0aXZhdGlvbkNvbXBsZXRpb24sXG59IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5pbXBvcnQgeyB0eXBlIFNpbmtDYWxsIH0gZnJvbSAnLi9zaW5rcyc7XG5pbXBvcnQgeyB1bnRyYWNrUHJvbWlzZSB9IGZyb20gJy4vc3RhY2staGVscGVycyc7XG5pbXBvcnQgcGtnIGZyb20gJy4vcGtnJztcbmltcG9ydCB7IFNka0ZsYWcsIGFzc2VydFZhbGlkRmxhZyB9IGZyb20gJy4vZmxhZ3MnO1xuaW1wb3J0IHsgZXhlY3V0ZVdpdGhMaWZlY3ljbGVMb2dnaW5nLCBsb2cgfSBmcm9tICcuL2xvZ3MnO1xuXG5lbnVtIFN0YXJ0Q2hpbGRXb3JrZmxvd0V4ZWN1dGlvbkZhaWxlZENhdXNlIHtcbiAgU1RBUlRfQ0hJTERfV09SS0ZMT1dfRVhFQ1VUSU9OX0ZBSUxFRF9DQVVTRV9VTlNQRUNJRklFRCA9IDAsXG4gIFNUQVJUX0NISUxEX1dPUktGTE9XX0VYRUNVVElPTl9GQUlMRURfQ0FVU0VfV09SS0ZMT1dfQUxSRUFEWV9FWElTVFMgPSAxLFxufVxuXG5jaGVja0V4dGVuZHM8Y29yZXNkay5jaGlsZF93b3JrZmxvdy5TdGFydENoaWxkV29ya2Zsb3dFeGVjdXRpb25GYWlsZWRDYXVzZSwgU3RhcnRDaGlsZFdvcmtmbG93RXhlY3V0aW9uRmFpbGVkQ2F1c2U+KCk7XG5jaGVja0V4dGVuZHM8U3RhcnRDaGlsZFdvcmtmbG93RXhlY3V0aW9uRmFpbGVkQ2F1c2UsIGNvcmVzZGsuY2hpbGRfd29ya2Zsb3cuU3RhcnRDaGlsZFdvcmtmbG93RXhlY3V0aW9uRmFpbGVkQ2F1c2U+KCk7XG5cbmV4cG9ydCBpbnRlcmZhY2UgU3RhY2sge1xuICBmb3JtYXR0ZWQ6IHN0cmluZztcbiAgc3RydWN0dXJlZDogU3RhY2tUcmFjZUZpbGVMb2NhdGlvbltdO1xufVxuXG4vKipcbiAqIEdsb2JhbCBzdG9yZSB0byB0cmFjayBwcm9taXNlIHN0YWNrcyBmb3Igc3RhY2sgdHJhY2UgcXVlcnlcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBQcm9taXNlU3RhY2tTdG9yZSB7XG4gIGNoaWxkVG9QYXJlbnQ6IE1hcDxQcm9taXNlPHVua25vd24+LCBTZXQ8UHJvbWlzZTx1bmtub3duPj4+O1xuICBwcm9taXNlVG9TdGFjazogTWFwPFByb21pc2U8dW5rbm93bj4sIFN0YWNrPjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBDb21wbGV0aW9uIHtcbiAgcmVzb2x2ZSh2YWw6IHVua25vd24pOiB1bmtub3duO1xuXG4gIHJlamVjdChyZWFzb246IHVua25vd24pOiB1bmtub3duO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIENvbmRpdGlvbiB7XG4gIGZuKCk6IGJvb2xlYW47XG5cbiAgcmVzb2x2ZSgpOiB2b2lkO1xufVxuXG5leHBvcnQgdHlwZSBBY3RpdmF0aW9uSGFuZGxlckZ1bmN0aW9uPEsgZXh0ZW5kcyBrZXlvZiBjb3Jlc2RrLndvcmtmbG93X2FjdGl2YXRpb24uSVdvcmtmbG93QWN0aXZhdGlvbkpvYj4gPSAoXG4gIGFjdGl2YXRpb246IE5vbk51bGxhYmxlPGNvcmVzZGsud29ya2Zsb3dfYWN0aXZhdGlvbi5JV29ya2Zsb3dBY3RpdmF0aW9uSm9iW0tdPlxuKSA9PiB2b2lkO1xuXG4vKipcbiAqIFZlcmlmaWVzIGFsbCBhY3RpdmF0aW9uIGpvYiBoYW5kbGluZyBtZXRob2RzIGFyZSBpbXBsZW1lbnRlZFxuICovXG5leHBvcnQgdHlwZSBBY3RpdmF0aW9uSGFuZGxlciA9IHtcbiAgW1AgaW4ga2V5b2YgY29yZXNkay53b3JrZmxvd19hY3RpdmF0aW9uLklXb3JrZmxvd0FjdGl2YXRpb25Kb2JdOiBBY3RpdmF0aW9uSGFuZGxlckZ1bmN0aW9uPFA+O1xufTtcblxuLyoqXG4gKiBJbmZvcm1hdGlvbiBhYm91dCBhbiB1cGRhdGUgb3Igc2lnbmFsIGhhbmRsZXIgZXhlY3V0aW9uLlxuICovXG5pbnRlcmZhY2UgTWVzc2FnZUhhbmRsZXJFeGVjdXRpb24ge1xuICBuYW1lOiBzdHJpbmc7XG4gIHVuZmluaXNoZWRQb2xpY3k6IEhhbmRsZXJVbmZpbmlzaGVkUG9saWN5O1xuICBpZD86IHN0cmluZztcbn1cblxuLyoqXG4gKiBLZWVwcyBhbGwgb2YgdGhlIFdvcmtmbG93IHJ1bnRpbWUgc3RhdGUgbGlrZSBwZW5kaW5nIGNvbXBsZXRpb25zIGZvciBhY3Rpdml0aWVzIGFuZCB0aW1lcnMuXG4gKlxuICogSW1wbGVtZW50cyBoYW5kbGVycyBmb3IgYWxsIHdvcmtmbG93IGFjdGl2YXRpb24gam9icy5cbiAqXG4gKiBOb3RlIHRoYXQgbW9zdCBtZXRob2RzIGluIHRoaXMgY2xhc3MgYXJlIG1lYW50IHRvIGJlIGNhbGxlZCBvbmx5IGZyb20gd2l0aGluIHRoZSBWTS5cbiAqXG4gKiBIb3dldmVyLCBhIGZldyBtZXRob2RzIG1heSBiZSBjYWxsZWQgZGlyZWN0bHkgZnJvbSBvdXRzaWRlIHRoZSBWTSAoZXNzZW50aWFsbHkgZnJvbSBgdm0tc2hhcmVkLnRzYCkuXG4gKiBUaGVzZSBtZXRob2RzIGFyZSBzcGVjaWZpY2FsbHkgbWFya2VkIHdpdGggYSBjb21tZW50IGFuZCByZXF1aXJlIGNhcmVmdWwgY29uc2lkZXJhdGlvbiwgYXMgdGhlXG4gKiBleGVjdXRpb24gY29udGV4dCBtYXkgbm90IHByb3Blcmx5IHJlZmxlY3QgdGhhdCBvZiB0aGUgdGFyZ2V0IHdvcmtmbG93IGV4ZWN1dGlvbiAoZS5nLjogd2l0aCBSZXVzYWJsZVxuICogVk1zLCB0aGUgYGdsb2JhbGAgbWF5IG5vdCBoYXZlIGJlZW4gc3dhcHBlZCB0byB0aG9zZSBvZiB0aGF0IHdvcmtmbG93IGV4ZWN1dGlvbjsgdGhlIGFjdGl2ZSBtaWNyb3Rhc2tcbiAqIHF1ZXVlIG1heSBiZSB0aGF0IG9mIHRoZSB0aHJlYWQvcHJvY2VzcywgcmF0aGVyIHRoYW4gdGhlIHF1ZXVlIG9mIHRoYXQgVk0gY29udGV4dDsgZXRjKS4gQ29uc2VxdWVudGx5LFxuICogbWV0aG9kcyB0aGF0IGFyZSBtZWFudCB0byBiZSBjYWxsZWQgZnJvbSBvdXRzaWRlIG9mIHRoZSBWTSBtdXN0IG5vdCBkbyBhbnkgb2YgdGhlIGZvbGxvd2luZzpcbiAqXG4gKiAtIEFjY2VzcyBhbnkgZ2xvYmFsIHZhcmlhYmxlO1xuICogLSBDcmVhdGUgUHJvbWlzZSBvYmplY3RzLCB1c2UgYXN5bmMvYXdhaXQsIG9yIG90aGVyd2lzZSBzY2hlZHVsZSBtaWNyb3Rhc2tzO1xuICogLSBDYWxsIHVzZXItZGVmaW5lZCBmdW5jdGlvbnMsIGluY2x1ZGluZyBhbnkgZm9ybSBvZiBpbnRlcmNlcHRvci5cbiAqL1xuZXhwb3J0IGNsYXNzIEFjdGl2YXRvciBpbXBsZW1lbnRzIEFjdGl2YXRpb25IYW5kbGVyIHtcbiAgLyoqXG4gICAqIENhY2hlIGZvciBtb2R1bGVzIC0gcmVmZXJlbmNlZCBpbiByZXVzYWJsZS12bS50c1xuICAgKi9cbiAgcmVhZG9ubHkgbW9kdWxlQ2FjaGUgPSBuZXcgTWFwPHN0cmluZywgdW5rbm93bj4oKTtcbiAgLyoqXG4gICAqIE1hcCBvZiB0YXNrIHNlcXVlbmNlIHRvIGEgQ29tcGxldGlvblxuICAgKi9cbiAgcmVhZG9ubHkgY29tcGxldGlvbnMgPSB7XG4gICAgdGltZXI6IG5ldyBNYXA8bnVtYmVyLCBDb21wbGV0aW9uPigpLFxuICAgIGFjdGl2aXR5OiBuZXcgTWFwPG51bWJlciwgQ29tcGxldGlvbj4oKSxcbiAgICBjaGlsZFdvcmtmbG93U3RhcnQ6IG5ldyBNYXA8bnVtYmVyLCBDb21wbGV0aW9uPigpLFxuICAgIGNoaWxkV29ya2Zsb3dDb21wbGV0ZTogbmV3IE1hcDxudW1iZXIsIENvbXBsZXRpb24+KCksXG4gICAgc2lnbmFsV29ya2Zsb3c6IG5ldyBNYXA8bnVtYmVyLCBDb21wbGV0aW9uPigpLFxuICAgIGNhbmNlbFdvcmtmbG93OiBuZXcgTWFwPG51bWJlciwgQ29tcGxldGlvbj4oKSxcbiAgfTtcblxuICAvKipcbiAgICogSG9sZHMgYnVmZmVyZWQgVXBkYXRlIGNhbGxzIHVudGlsIGEgaGFuZGxlciBpcyByZWdpc3RlcmVkXG4gICAqL1xuICByZWFkb25seSBidWZmZXJlZFVwZGF0ZXMgPSBBcnJheTxjb3Jlc2RrLndvcmtmbG93X2FjdGl2YXRpb24uSURvVXBkYXRlPigpO1xuXG4gIC8qKlxuICAgKiBIb2xkcyBidWZmZXJlZCBzaWduYWwgY2FsbHMgdW50aWwgYSBoYW5kbGVyIGlzIHJlZ2lzdGVyZWRcbiAgICovXG4gIHJlYWRvbmx5IGJ1ZmZlcmVkU2lnbmFscyA9IEFycmF5PGNvcmVzZGsud29ya2Zsb3dfYWN0aXZhdGlvbi5JU2lnbmFsV29ya2Zsb3c+KCk7XG5cbiAgLyoqXG4gICAqIE1hcHBpbmcgb2YgdXBkYXRlIG5hbWUgdG8gaGFuZGxlciBhbmQgdmFsaWRhdG9yXG4gICAqL1xuICByZWFkb25seSB1cGRhdGVIYW5kbGVycyA9IG5ldyBNYXA8c3RyaW5nLCBXb3JrZmxvd1VwZGF0ZUFubm90YXRlZFR5cGU+KCk7XG5cbiAgLyoqXG4gICAqIE1hcHBpbmcgb2Ygc2lnbmFsIG5hbWUgdG8gaGFuZGxlclxuICAgKi9cbiAgcmVhZG9ubHkgc2lnbmFsSGFuZGxlcnMgPSBuZXcgTWFwPHN0cmluZywgV29ya2Zsb3dTaWduYWxBbm5vdGF0ZWRUeXBlPigpO1xuXG4gIC8qKlxuICAgKiBNYXBwaW5nIG9mIGluLXByb2dyZXNzIHVwZGF0ZXMgdG8gaGFuZGxlciBleGVjdXRpb24gaW5mb3JtYXRpb24uXG4gICAqL1xuICByZWFkb25seSBpblByb2dyZXNzVXBkYXRlcyA9IG5ldyBNYXA8c3RyaW5nLCBNZXNzYWdlSGFuZGxlckV4ZWN1dGlvbj4oKTtcblxuICAvKipcbiAgICogTWFwcGluZyBvZiBpbi1wcm9ncmVzcyBzaWduYWxzIHRvIGhhbmRsZXIgZXhlY3V0aW9uIGluZm9ybWF0aW9uLlxuICAgKi9cbiAgcmVhZG9ubHkgaW5Qcm9ncmVzc1NpZ25hbHMgPSBuZXcgTWFwPG51bWJlciwgTWVzc2FnZUhhbmRsZXJFeGVjdXRpb24+KCk7XG5cbiAgLyoqXG4gICAqIEEgc2VxdWVuY2UgbnVtYmVyIHByb3ZpZGluZyB1bmlxdWUgaWRlbnRpZmllcnMgZm9yIHNpZ25hbCBoYW5kbGVyIGV4ZWN1dGlvbnMuXG4gICAqL1xuICBwcm90ZWN0ZWQgc2lnbmFsSGFuZGxlckV4ZWN1dGlvblNlcSA9IDA7XG5cbiAgLyoqXG4gICAqIEEgc2lnbmFsIGhhbmRsZXIgdGhhdCBjYXRjaGVzIGNhbGxzIGZvciBub24tcmVnaXN0ZXJlZCBzaWduYWwgbmFtZXMuXG4gICAqL1xuICBkZWZhdWx0U2lnbmFsSGFuZGxlcj86IERlZmF1bHRTaWduYWxIYW5kbGVyO1xuXG4gIC8qKlxuICAgKiBTb3VyY2UgbWFwIGZpbGUgZm9yIGxvb2tpbmcgdXAgdGhlIHNvdXJjZSBmaWxlcyBpbiByZXNwb25zZSB0byBfX2VuaGFuY2VkX3N0YWNrX3RyYWNlXG4gICAqL1xuICBwcm90ZWN0ZWQgcmVhZG9ubHkgc291cmNlTWFwOiBSYXdTb3VyY2VNYXA7XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgb3Igbm90IHRvIHNlbmQgdGhlIHNvdXJjZXMgaW4gZW5oYW5jZWQgc3RhY2sgdHJhY2UgcXVlcnkgcmVzcG9uc2VzXG4gICAqL1xuICBwcm90ZWN0ZWQgcmVhZG9ubHkgc2hvd1N0YWNrVHJhY2VTb3VyY2VzO1xuXG4gIHJlYWRvbmx5IHByb21pc2VTdGFja1N0b3JlOiBQcm9taXNlU3RhY2tTdG9yZSA9IHtcbiAgICBwcm9taXNlVG9TdGFjazogbmV3IE1hcCgpLFxuICAgIGNoaWxkVG9QYXJlbnQ6IG5ldyBNYXAoKSxcbiAgfTtcblxuICBwdWJsaWMgcmVhZG9ubHkgcm9vdFNjb3BlID0gbmV3IFJvb3RDYW5jZWxsYXRpb25TY29wZSgpO1xuXG4gIC8qKlxuICAgKiBNYXBwaW5nIG9mIHF1ZXJ5IG5hbWUgdG8gaGFuZGxlclxuICAgKi9cbiAgcHVibGljIHJlYWRvbmx5IHF1ZXJ5SGFuZGxlcnMgPSBuZXcgTWFwPHN0cmluZywgV29ya2Zsb3dRdWVyeUFubm90YXRlZFR5cGU+KFtcbiAgICBbXG4gICAgICAnX19zdGFja190cmFjZScsXG4gICAgICB7XG4gICAgICAgIGhhbmRsZXI6ICgpID0+IHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5nZXRTdGFja1RyYWNlcygpXG4gICAgICAgICAgICAubWFwKChzKSA9PiBzLmZvcm1hdHRlZClcbiAgICAgICAgICAgIC5qb2luKCdcXG5cXG4nKTtcbiAgICAgICAgfSxcbiAgICAgICAgZGVzY3JpcHRpb246ICdSZXR1cm5zIGEgc2Vuc2libGUgc3RhY2sgdHJhY2UuJyxcbiAgICAgIH0sXG4gICAgXSxcbiAgICBbXG4gICAgICAnX19lbmhhbmNlZF9zdGFja190cmFjZScsXG4gICAgICB7XG4gICAgICAgIGhhbmRsZXI6ICgpOiBFbmhhbmNlZFN0YWNrVHJhY2UgPT4ge1xuICAgICAgICAgIGNvbnN0IHsgc291cmNlTWFwIH0gPSB0aGlzO1xuICAgICAgICAgIGNvbnN0IHNkazogU3RhY2tUcmFjZVNES0luZm8gPSB7IG5hbWU6ICd0eXBlc2NyaXB0JywgdmVyc2lvbjogcGtnLnZlcnNpb24gfTtcbiAgICAgICAgICBjb25zdCBzdGFja3MgPSB0aGlzLmdldFN0YWNrVHJhY2VzKCkubWFwKCh7IHN0cnVjdHVyZWQ6IGxvY2F0aW9ucyB9KSA9PiAoeyBsb2NhdGlvbnMgfSkpO1xuICAgICAgICAgIGNvbnN0IHNvdXJjZXM6IFJlY29yZDxzdHJpbmcsIFN0YWNrVHJhY2VGaWxlU2xpY2VbXT4gPSB7fTtcbiAgICAgICAgICBpZiAodGhpcy5zaG93U3RhY2tUcmFjZVNvdXJjZXMpIHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgeyBsb2NhdGlvbnMgfSBvZiBzdGFja3MpIHtcbiAgICAgICAgICAgICAgZm9yIChjb25zdCB7IGZpbGVfcGF0aCB9IG9mIGxvY2F0aW9ucykge1xuICAgICAgICAgICAgICAgIGlmICghZmlsZV9wYXRoKSBjb250aW51ZTtcbiAgICAgICAgICAgICAgICBjb25zdCBjb250ZW50ID0gc291cmNlTWFwPy5zb3VyY2VzQ29udGVudD8uW3NvdXJjZU1hcD8uc291cmNlcy5pbmRleE9mKGZpbGVfcGF0aCldO1xuICAgICAgICAgICAgICAgIGlmICghY29udGVudCkgY29udGludWU7XG4gICAgICAgICAgICAgICAgc291cmNlc1tmaWxlX3BhdGhdID0gW1xuICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBsaW5lX29mZnNldDogMCxcbiAgICAgICAgICAgICAgICAgICAgY29udGVudCxcbiAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4geyBzZGssIHN0YWNrcywgc291cmNlcyB9O1xuICAgICAgICB9LFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1JldHVybnMgYSBzdGFjayB0cmFjZSBhbm5vdGF0ZWQgd2l0aCBzb3VyY2UgaW5mb3JtYXRpb24uJyxcbiAgICAgIH0sXG4gICAgXSxcbiAgICBbXG4gICAgICAnX190ZW1wb3JhbF93b3JrZmxvd19tZXRhZGF0YScsXG4gICAgICB7XG4gICAgICAgIGhhbmRsZXI6ICgpOiB0ZW1wb3JhbC5hcGkuc2RrLnYxLklXb3JrZmxvd01ldGFkYXRhID0+IHtcbiAgICAgICAgICBjb25zdCB3b3JrZmxvd1R5cGUgPSB0aGlzLmluZm8ud29ya2Zsb3dUeXBlO1xuICAgICAgICAgIGNvbnN0IHF1ZXJ5RGVmaW5pdGlvbnMgPSBBcnJheS5mcm9tKHRoaXMucXVlcnlIYW5kbGVycy5lbnRyaWVzKCkpLm1hcCgoW25hbWUsIHZhbHVlXSkgPT4gKHtcbiAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogdmFsdWUuZGVzY3JpcHRpb24sXG4gICAgICAgICAgfSkpO1xuICAgICAgICAgIGNvbnN0IHNpZ25hbERlZmluaXRpb25zID0gQXJyYXkuZnJvbSh0aGlzLnNpZ25hbEhhbmRsZXJzLmVudHJpZXMoKSkubWFwKChbbmFtZSwgdmFsdWVdKSA9PiAoe1xuICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiB2YWx1ZS5kZXNjcmlwdGlvbixcbiAgICAgICAgICB9KSk7XG4gICAgICAgICAgY29uc3QgdXBkYXRlRGVmaW5pdGlvbnMgPSBBcnJheS5mcm9tKHRoaXMudXBkYXRlSGFuZGxlcnMuZW50cmllcygpKS5tYXAoKFtuYW1lLCB2YWx1ZV0pID0+ICh7XG4gICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IHZhbHVlLmRlc2NyaXB0aW9uLFxuICAgICAgICAgIH0pKTtcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGVmaW5pdGlvbjoge1xuICAgICAgICAgICAgICB0eXBlOiB3b3JrZmxvd1R5cGUsXG4gICAgICAgICAgICAgIHF1ZXJ5RGVmaW5pdGlvbnMsXG4gICAgICAgICAgICAgIHNpZ25hbERlZmluaXRpb25zLFxuICAgICAgICAgICAgICB1cGRhdGVEZWZpbml0aW9ucyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgZGVzY3JpcHRpb246ICdSZXR1cm5zIG1ldGFkYXRhIGFzc29jaWF0ZWQgd2l0aCB0aGlzIHdvcmtmbG93LicsXG4gICAgICB9LFxuICAgIF0sXG4gIF0pO1xuXG4gIC8qKlxuICAgKiBMb2FkZWQgaW4ge0BsaW5rIGluaXRSdW50aW1lfVxuICAgKi9cbiAgcHVibGljIHJlYWRvbmx5IGludGVyY2VwdG9yczogUmVxdWlyZWQ8V29ya2Zsb3dJbnRlcmNlcHRvcnM+ID0ge1xuICAgIGluYm91bmQ6IFtdLFxuICAgIG91dGJvdW5kOiBbXSxcbiAgICBpbnRlcm5hbHM6IFtdLFxuICB9O1xuXG4gIC8qKlxuICAgKiBCdWZmZXIgdGhhdCBzdG9yZXMgYWxsIGdlbmVyYXRlZCBjb21tYW5kcywgcmVzZXQgYWZ0ZXIgZWFjaCBhY3RpdmF0aW9uXG4gICAqL1xuICBwcm90ZWN0ZWQgY29tbWFuZHM6IGNvcmVzZGsud29ya2Zsb3dfY29tbWFuZHMuSVdvcmtmbG93Q29tbWFuZFtdID0gW107XG5cbiAgLyoqXG4gICAqIFN0b3JlcyBhbGwge0BsaW5rIGNvbmRpdGlvbn1zIHRoYXQgaGF2ZW4ndCBiZWVuIHVuYmxvY2tlZCB5ZXRcbiAgICovXG4gIHB1YmxpYyByZWFkb25seSBibG9ja2VkQ29uZGl0aW9ucyA9IG5ldyBNYXA8bnVtYmVyLCBDb25kaXRpb24+KCk7XG5cbiAgLyoqXG4gICAqIElzIHRoaXMgV29ya2Zsb3cgY29tcGxldGVkP1xuICAgKlxuICAgKiBBIFdvcmtmbG93IHdpbGwgYmUgY29uc2lkZXJlZCBjb21wbGV0ZWQgaWYgaXQgZ2VuZXJhdGVzIGEgY29tbWFuZCB0aGF0IHRoZVxuICAgKiBzeXN0ZW0gY29uc2lkZXJzIGFzIGEgZmluYWwgV29ya2Zsb3cgY29tbWFuZCAoZS5nLlxuICAgKiBjb21wbGV0ZVdvcmtmbG93RXhlY3V0aW9uIG9yIGZhaWxXb3JrZmxvd0V4ZWN1dGlvbikuXG4gICAqL1xuICBwdWJsaWMgY29tcGxldGVkID0gZmFsc2U7XG5cbiAgLyoqXG4gICAqIFdhcyB0aGlzIFdvcmtmbG93IGNhbmNlbGxlZD9cbiAgICovXG4gIHByb3RlY3RlZCBjYW5jZWxsZWQgPSBmYWxzZTtcblxuICAvKipcbiAgICogVGhlIG5leHQgKGluY3JlbWVudGFsKSBzZXF1ZW5jZSB0byBhc3NpZ24gd2hlbiBnZW5lcmF0aW5nIGNvbXBsZXRhYmxlIGNvbW1hbmRzXG4gICAqL1xuICBwdWJsaWMgbmV4dFNlcXMgPSB7XG4gICAgdGltZXI6IDEsXG4gICAgYWN0aXZpdHk6IDEsXG4gICAgY2hpbGRXb3JrZmxvdzogMSxcbiAgICBzaWduYWxXb3JrZmxvdzogMSxcbiAgICBjYW5jZWxXb3JrZmxvdzogMSxcbiAgICBjb25kaXRpb246IDEsXG4gICAgLy8gVXNlZCBpbnRlcm5hbGx5IHRvIGtlZXAgdHJhY2sgb2YgYWN0aXZlIHN0YWNrIHRyYWNlc1xuICAgIHN0YWNrOiAxLFxuICB9O1xuXG4gIC8qKlxuICAgKiBUaGlzIGlzIHNldCBldmVyeSB0aW1lIHRoZSB3b3JrZmxvdyBleGVjdXRlcyBhbiBhY3RpdmF0aW9uXG4gICAqIE1heSBiZSBhY2Nlc3NlZCBhbmQgbW9kaWZpZWQgZnJvbSBvdXRzaWRlIHRoZSBWTS5cbiAgICovXG4gIG5vdzogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiBSZWZlcmVuY2UgdG8gdGhlIGN1cnJlbnQgV29ya2Zsb3csIGluaXRpYWxpemVkIHdoZW4gYSBXb3JrZmxvdyBpcyBzdGFydGVkXG4gICAqL1xuICBwdWJsaWMgd29ya2Zsb3c/OiBXb3JrZmxvdztcblxuICAvKipcbiAgICogSW5mb3JtYXRpb24gYWJvdXQgdGhlIGN1cnJlbnQgV29ya2Zsb3dcbiAgICogTWF5IGJlIGFjY2Vzc2VkIGZyb20gb3V0c2lkZSB0aGUgVk0uXG4gICAqL1xuICBwdWJsaWMgaW5mbzogV29ya2Zsb3dJbmZvO1xuXG4gIC8qKlxuICAgKiBBIGRldGVybWluaXN0aWMgUk5HLCB1c2VkIGJ5IHRoZSBpc29sYXRlJ3Mgb3ZlcnJpZGRlbiBNYXRoLnJhbmRvbVxuICAgKi9cbiAgcHVibGljIHJhbmRvbTogUk5HO1xuXG4gIHB1YmxpYyBwYXlsb2FkQ29udmVydGVyOiBQYXlsb2FkQ29udmVydGVyID0gZGVmYXVsdFBheWxvYWRDb252ZXJ0ZXI7XG4gIHB1YmxpYyBmYWlsdXJlQ29udmVydGVyOiBGYWlsdXJlQ29udmVydGVyID0gZGVmYXVsdEZhaWx1cmVDb252ZXJ0ZXI7XG5cbiAgLyoqXG4gICAqIFBhdGNoZXMgd2Uga25vdyB0aGUgc3RhdHVzIG9mIGZvciB0aGlzIHdvcmtmbG93LCBhcyBpbiB7QGxpbmsgcGF0Y2hlZH1cbiAgICovXG4gIHByaXZhdGUgcmVhZG9ubHkga25vd25QcmVzZW50UGF0Y2hlcyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuXG4gIC8qKlxuICAgKiBQYXRjaGVzIHdlIHNlbnQgdG8gY29yZSB7QGxpbmsgcGF0Y2hlZH1cbiAgICovXG4gIHByaXZhdGUgcmVhZG9ubHkgc2VudFBhdGNoZXMgPSBuZXcgU2V0PHN0cmluZz4oKTtcblxuICBwcml2YXRlIHJlYWRvbmx5IGtub3duRmxhZ3MgPSBuZXcgU2V0PG51bWJlcj4oKTtcblxuICAvKipcbiAgICogQnVmZmVyZWQgc2luayBjYWxscyBwZXIgYWN0aXZhdGlvblxuICAgKi9cbiAgc2lua0NhbGxzID0gQXJyYXk8U2lua0NhbGw+KCk7XG5cbiAgLyoqXG4gICAqIEEgbmFub3NlY29uZCByZXNvbHV0aW9uIHRpbWUgZnVuY3Rpb24sIGV4dGVybmFsbHkgaW5qZWN0ZWRcbiAgICovXG4gIHB1YmxpYyByZWFkb25seSBnZXRUaW1lT2ZEYXk6ICgpID0+IGJpZ2ludDtcblxuICBwdWJsaWMgcmVhZG9ubHkgcmVnaXN0ZXJlZEFjdGl2aXR5TmFtZXM6IFNldDxzdHJpbmc+O1xuXG4gIGNvbnN0cnVjdG9yKHtcbiAgICBpbmZvLFxuICAgIG5vdyxcbiAgICBzaG93U3RhY2tUcmFjZVNvdXJjZXMsXG4gICAgc291cmNlTWFwLFxuICAgIGdldFRpbWVPZkRheSxcbiAgICByYW5kb21uZXNzU2VlZCxcbiAgICByZWdpc3RlcmVkQWN0aXZpdHlOYW1lcyxcbiAgfTogV29ya2Zsb3dDcmVhdGVPcHRpb25zSW50ZXJuYWwpIHtcbiAgICB0aGlzLmdldFRpbWVPZkRheSA9IGdldFRpbWVPZkRheTtcbiAgICB0aGlzLmluZm8gPSBpbmZvO1xuICAgIHRoaXMubm93ID0gbm93O1xuICAgIHRoaXMuc2hvd1N0YWNrVHJhY2VTb3VyY2VzID0gc2hvd1N0YWNrVHJhY2VTb3VyY2VzO1xuICAgIHRoaXMuc291cmNlTWFwID0gc291cmNlTWFwO1xuICAgIHRoaXMucmFuZG9tID0gYWxlYShyYW5kb21uZXNzU2VlZCk7XG4gICAgdGhpcy5yZWdpc3RlcmVkQWN0aXZpdHlOYW1lcyA9IHJlZ2lzdGVyZWRBY3Rpdml0eU5hbWVzO1xuICB9XG5cbiAgLyoqXG4gICAqIE1heSBiZSBpbnZva2VkIGZyb20gb3V0c2lkZSB0aGUgVk0uXG4gICAqL1xuICBtdXRhdGVXb3JrZmxvd0luZm8oZm46IChpbmZvOiBXb3JrZmxvd0luZm8pID0+IFdvcmtmbG93SW5mbyk6IHZvaWQge1xuICAgIHRoaXMuaW5mbyA9IGZuKHRoaXMuaW5mbyk7XG4gIH1cblxuICBwcm90ZWN0ZWQgZ2V0U3RhY2tUcmFjZXMoKTogU3RhY2tbXSB7XG4gICAgY29uc3QgeyBjaGlsZFRvUGFyZW50LCBwcm9taXNlVG9TdGFjayB9ID0gdGhpcy5wcm9taXNlU3RhY2tTdG9yZTtcbiAgICBjb25zdCBpbnRlcm5hbE5vZGVzID0gWy4uLmNoaWxkVG9QYXJlbnQudmFsdWVzKCldLnJlZHVjZSgoYWNjLCBjdXJyKSA9PiB7XG4gICAgICBmb3IgKGNvbnN0IHAgb2YgY3Vycikge1xuICAgICAgICBhY2MuYWRkKHApO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGFjYztcbiAgICB9LCBuZXcgU2V0KCkpO1xuICAgIGNvbnN0IHN0YWNrcyA9IG5ldyBNYXA8c3RyaW5nLCBTdGFjaz4oKTtcbiAgICBmb3IgKGNvbnN0IGNoaWxkIG9mIGNoaWxkVG9QYXJlbnQua2V5cygpKSB7XG4gICAgICBpZiAoIWludGVybmFsTm9kZXMuaGFzKGNoaWxkKSkge1xuICAgICAgICBjb25zdCBzdGFjayA9IHByb21pc2VUb1N0YWNrLmdldChjaGlsZCk7XG4gICAgICAgIGlmICghc3RhY2sgfHwgIXN0YWNrLmZvcm1hdHRlZCkgY29udGludWU7XG4gICAgICAgIHN0YWNrcy5zZXQoc3RhY2suZm9ybWF0dGVkLCBzdGFjayk7XG4gICAgICB9XG4gICAgfVxuICAgIC8vIE5vdCAxMDAlIHN1cmUgd2hlcmUgdGhpcyBjb21lcyBmcm9tLCBqdXN0IGZpbHRlciBpdCBvdXRcbiAgICBzdGFja3MuZGVsZXRlKCcgICAgYXQgUHJvbWlzZS50aGVuICg8YW5vbnltb3VzPiknKTtcbiAgICBzdGFja3MuZGVsZXRlKCcgICAgYXQgUHJvbWlzZS50aGVuICg8YW5vbnltb3VzPilcXG4nKTtcbiAgICByZXR1cm4gWy4uLnN0YWNrc10ubWFwKChbXywgc3RhY2tdKSA9PiBzdGFjayk7XG4gIH1cblxuICAvKipcbiAgICogTWF5IGJlIGludm9rZWQgZnJvbSBvdXRzaWRlIHRoZSBWTS5cbiAgICovXG4gIGdldEFuZFJlc2V0U2lua0NhbGxzKCk6IFNpbmtDYWxsW10ge1xuICAgIGNvbnN0IHsgc2lua0NhbGxzIH0gPSB0aGlzO1xuICAgIHRoaXMuc2lua0NhbGxzID0gW107XG4gICAgcmV0dXJuIHNpbmtDYWxscztcbiAgfVxuXG4gIC8qKlxuICAgKiBCdWZmZXIgYSBXb3JrZmxvdyBjb21tYW5kIHRvIGJlIGNvbGxlY3RlZCBhdCB0aGUgZW5kIG9mIHRoZSBjdXJyZW50IGFjdGl2YXRpb24uXG4gICAqXG4gICAqIFByZXZlbnRzIGNvbW1hbmRzIGZyb20gYmVpbmcgYWRkZWQgYWZ0ZXIgV29ya2Zsb3cgY29tcGxldGlvbi5cbiAgICovXG4gIHB1c2hDb21tYW5kKGNtZDogY29yZXNkay53b3JrZmxvd19jb21tYW5kcy5JV29ya2Zsb3dDb21tYW5kLCBjb21wbGV0ZSA9IGZhbHNlKTogdm9pZCB7XG4gICAgdGhpcy5jb21tYW5kcy5wdXNoKGNtZCk7XG4gICAgaWYgKGNvbXBsZXRlKSB7XG4gICAgICB0aGlzLmNvbXBsZXRlZCA9IHRydWU7XG4gICAgfVxuICB9XG5cbiAgY29uY2x1ZGVBY3RpdmF0aW9uKCk6IEFjdGl2YXRpb25Db21wbGV0aW9uIHtcbiAgICByZXR1cm4ge1xuICAgICAgY29tbWFuZHM6IHRoaXMuY29tbWFuZHMuc3BsaWNlKDApLFxuICAgICAgdXNlZEludGVybmFsRmxhZ3M6IFsuLi50aGlzLmtub3duRmxhZ3NdLFxuICAgIH07XG4gIH1cblxuICBwdWJsaWMgYXN5bmMgc3RhcnRXb3JrZmxvd05leHRIYW5kbGVyKHsgYXJncyB9OiBXb3JrZmxvd0V4ZWN1dGVJbnB1dCk6IFByb21pc2U8YW55PiB7XG4gICAgY29uc3QgeyB3b3JrZmxvdyB9ID0gdGhpcztcbiAgICBpZiAod29ya2Zsb3cgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IElsbGVnYWxTdGF0ZUVycm9yKCdXb3JrZmxvdyB1bmluaXRpYWxpemVkJyk7XG4gICAgfVxuICAgIHJldHVybiBhd2FpdCB3b3JrZmxvdyguLi5hcmdzKTtcbiAgfVxuXG4gIHB1YmxpYyBzdGFydFdvcmtmbG93KGFjdGl2YXRpb246IGNvcmVzZGsud29ya2Zsb3dfYWN0aXZhdGlvbi5JSW5pdGlhbGl6ZVdvcmtmbG93KTogdm9pZCB7XG4gICAgY29uc3QgZXhlY3V0ZSA9IGNvbXBvc2VJbnRlcmNlcHRvcnModGhpcy5pbnRlcmNlcHRvcnMuaW5ib3VuZCwgJ2V4ZWN1dGUnLCB0aGlzLnN0YXJ0V29ya2Zsb3dOZXh0SGFuZGxlci5iaW5kKHRoaXMpKTtcblxuICAgIHVudHJhY2tQcm9taXNlKFxuICAgICAgZXhlY3V0ZVdpdGhMaWZlY3ljbGVMb2dnaW5nKCgpID0+XG4gICAgICAgIGV4ZWN1dGUoe1xuICAgICAgICAgIGhlYWRlcnM6IGFjdGl2YXRpb24uaGVhZGVycyA/PyB7fSxcbiAgICAgICAgICBhcmdzOiBhcnJheUZyb21QYXlsb2Fkcyh0aGlzLnBheWxvYWRDb252ZXJ0ZXIsIGFjdGl2YXRpb24uYXJndW1lbnRzKSxcbiAgICAgICAgfSlcbiAgICAgICkudGhlbih0aGlzLmNvbXBsZXRlV29ya2Zsb3cuYmluZCh0aGlzKSwgdGhpcy5oYW5kbGVXb3JrZmxvd0ZhaWx1cmUuYmluZCh0aGlzKSlcbiAgICApO1xuICB9XG5cbiAgcHVibGljIGluaXRpYWxpemVXb3JrZmxvdyhhY3RpdmF0aW9uOiBjb3Jlc2RrLndvcmtmbG93X2FjdGl2YXRpb24uSUluaXRpYWxpemVXb3JrZmxvdyk6IHZvaWQge1xuICAgIGNvbnN0IHsgY29udGludWVkRmFpbHVyZSwgbGFzdENvbXBsZXRpb25SZXN1bHQsIG1lbW8sIHNlYXJjaEF0dHJpYnV0ZXMgfSA9IGFjdGl2YXRpb247XG5cbiAgICAvLyBNb3N0IHRoaW5ncyByZWxhdGVkIHRvIGluaXRpYWxpemF0aW9uIGhhdmUgYWxyZWFkeSBiZWVuIGhhbmRsZWQgaW4gdGhlIGNvbnN0cnVjdG9yXG4gICAgdGhpcy5tdXRhdGVXb3JrZmxvd0luZm8oKGluZm8pID0+ICh7XG4gICAgICAuLi5pbmZvLFxuICAgICAgc2VhcmNoQXR0cmlidXRlczpcbiAgICAgICAgKG1hcEZyb21QYXlsb2FkcyhzZWFyY2hBdHRyaWJ1dGVQYXlsb2FkQ29udmVydGVyLCBzZWFyY2hBdHRyaWJ1dGVzPy5pbmRleGVkRmllbGRzKSBhcyBTZWFyY2hBdHRyaWJ1dGVzKSA/PyB7fSxcbiAgICAgIG1lbW86IG1hcEZyb21QYXlsb2Fkcyh0aGlzLnBheWxvYWRDb252ZXJ0ZXIsIG1lbW8/LmZpZWxkcyksXG4gICAgICBsYXN0UmVzdWx0OiBmcm9tUGF5bG9hZHNBdEluZGV4KHRoaXMucGF5bG9hZENvbnZlcnRlciwgMCwgbGFzdENvbXBsZXRpb25SZXN1bHQ/LnBheWxvYWRzKSxcbiAgICAgIGxhc3RGYWlsdXJlOlxuICAgICAgICBjb250aW51ZWRGYWlsdXJlICE9IG51bGxcbiAgICAgICAgICA/IHRoaXMuZmFpbHVyZUNvbnZlcnRlci5mYWlsdXJlVG9FcnJvcihjb250aW51ZWRGYWlsdXJlLCB0aGlzLnBheWxvYWRDb252ZXJ0ZXIpXG4gICAgICAgICAgOiB1bmRlZmluZWQsXG4gICAgfSkpO1xuICB9XG5cbiAgcHVibGljIGNhbmNlbFdvcmtmbG93KF9hY3RpdmF0aW9uOiBjb3Jlc2RrLndvcmtmbG93X2FjdGl2YXRpb24uSUNhbmNlbFdvcmtmbG93KTogdm9pZCB7XG4gICAgdGhpcy5jYW5jZWxsZWQgPSB0cnVlO1xuICAgIHRoaXMucm9vdFNjb3BlLmNhbmNlbCgpO1xuICB9XG5cbiAgcHVibGljIGZpcmVUaW1lcihhY3RpdmF0aW9uOiBjb3Jlc2RrLndvcmtmbG93X2FjdGl2YXRpb24uSUZpcmVUaW1lcik6IHZvaWQge1xuICAgIC8vIFRpbWVycyBhcmUgYSBzcGVjaWFsIGNhc2Ugd2hlcmUgdGhlaXIgY29tcGxldGlvbiBtaWdodCBub3QgYmUgaW4gV29ya2Zsb3cgc3RhdGUsXG4gICAgLy8gdGhpcyBpcyBkdWUgdG8gaW1tZWRpYXRlIHRpbWVyIGNhbmNlbGxhdGlvbiB0aGF0IGRvZXNuJ3QgZ28gd2FpdCBmb3IgQ29yZS5cbiAgICBjb25zdCBjb21wbGV0aW9uID0gdGhpcy5tYXliZUNvbnN1bWVDb21wbGV0aW9uKCd0aW1lcicsIGdldFNlcShhY3RpdmF0aW9uKSk7XG4gICAgY29tcGxldGlvbj8ucmVzb2x2ZSh1bmRlZmluZWQpO1xuICB9XG5cbiAgcHVibGljIHJlc29sdmVBY3Rpdml0eShhY3RpdmF0aW9uOiBjb3Jlc2RrLndvcmtmbG93X2FjdGl2YXRpb24uSVJlc29sdmVBY3Rpdml0eSk6IHZvaWQge1xuICAgIGlmICghYWN0aXZhdGlvbi5yZXN1bHQpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0dvdCBSZXNvbHZlQWN0aXZpdHkgYWN0aXZhdGlvbiB3aXRoIG5vIHJlc3VsdCcpO1xuICAgIH1cbiAgICBjb25zdCB7IHJlc29sdmUsIHJlamVjdCB9ID0gdGhpcy5jb25zdW1lQ29tcGxldGlvbignYWN0aXZpdHknLCBnZXRTZXEoYWN0aXZhdGlvbikpO1xuICAgIGlmIChhY3RpdmF0aW9uLnJlc3VsdC5jb21wbGV0ZWQpIHtcbiAgICAgIGNvbnN0IGNvbXBsZXRlZCA9IGFjdGl2YXRpb24ucmVzdWx0LmNvbXBsZXRlZDtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGNvbXBsZXRlZC5yZXN1bHQgPyB0aGlzLnBheWxvYWRDb252ZXJ0ZXIuZnJvbVBheWxvYWQoY29tcGxldGVkLnJlc3VsdCkgOiB1bmRlZmluZWQ7XG4gICAgICByZXNvbHZlKHJlc3VsdCk7XG4gICAgfSBlbHNlIGlmIChhY3RpdmF0aW9uLnJlc3VsdC5mYWlsZWQpIHtcbiAgICAgIGNvbnN0IHsgZmFpbHVyZSB9ID0gYWN0aXZhdGlvbi5yZXN1bHQuZmFpbGVkO1xuICAgICAgY29uc3QgZXJyID0gZmFpbHVyZSA/IHRoaXMuZmFpbHVyZVRvRXJyb3IoZmFpbHVyZSkgOiB1bmRlZmluZWQ7XG4gICAgICByZWplY3QoZXJyKTtcbiAgICB9IGVsc2UgaWYgKGFjdGl2YXRpb24ucmVzdWx0LmNhbmNlbGxlZCkge1xuICAgICAgY29uc3QgeyBmYWlsdXJlIH0gPSBhY3RpdmF0aW9uLnJlc3VsdC5jYW5jZWxsZWQ7XG4gICAgICBjb25zdCBlcnIgPSBmYWlsdXJlID8gdGhpcy5mYWlsdXJlVG9FcnJvcihmYWlsdXJlKSA6IHVuZGVmaW5lZDtcbiAgICAgIHJlamVjdChlcnIpO1xuICAgIH0gZWxzZSBpZiAoYWN0aXZhdGlvbi5yZXN1bHQuYmFja29mZikge1xuICAgICAgcmVqZWN0KG5ldyBMb2NhbEFjdGl2aXR5RG9CYWNrb2ZmKGFjdGl2YXRpb24ucmVzdWx0LmJhY2tvZmYpKTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgcmVzb2x2ZUNoaWxkV29ya2Zsb3dFeGVjdXRpb25TdGFydChcbiAgICBhY3RpdmF0aW9uOiBjb3Jlc2RrLndvcmtmbG93X2FjdGl2YXRpb24uSVJlc29sdmVDaGlsZFdvcmtmbG93RXhlY3V0aW9uU3RhcnRcbiAgKTogdm9pZCB7XG4gICAgY29uc3QgeyByZXNvbHZlLCByZWplY3QgfSA9IHRoaXMuY29uc3VtZUNvbXBsZXRpb24oJ2NoaWxkV29ya2Zsb3dTdGFydCcsIGdldFNlcShhY3RpdmF0aW9uKSk7XG4gICAgaWYgKGFjdGl2YXRpb24uc3VjY2VlZGVkKSB7XG4gICAgICByZXNvbHZlKGFjdGl2YXRpb24uc3VjY2VlZGVkLnJ1bklkKTtcbiAgICB9IGVsc2UgaWYgKGFjdGl2YXRpb24uZmFpbGVkKSB7XG4gICAgICBpZiAoXG4gICAgICAgIGFjdGl2YXRpb24uZmFpbGVkLmNhdXNlICE9PVxuICAgICAgICBTdGFydENoaWxkV29ya2Zsb3dFeGVjdXRpb25GYWlsZWRDYXVzZS5TVEFSVF9DSElMRF9XT1JLRkxPV19FWEVDVVRJT05fRkFJTEVEX0NBVVNFX1dPUktGTE9XX0FMUkVBRFlfRVhJU1RTXG4gICAgICApIHtcbiAgICAgICAgdGhyb3cgbmV3IElsbGVnYWxTdGF0ZUVycm9yKCdHb3QgdW5rbm93biBTdGFydENoaWxkV29ya2Zsb3dFeGVjdXRpb25GYWlsZWRDYXVzZScpO1xuICAgICAgfVxuICAgICAgaWYgKCEoYWN0aXZhdGlvbi5zZXEgJiYgYWN0aXZhdGlvbi5mYWlsZWQud29ya2Zsb3dJZCAmJiBhY3RpdmF0aW9uLmZhaWxlZC53b3JrZmxvd1R5cGUpKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ01pc3NpbmcgYXR0cmlidXRlcyBpbiBhY3RpdmF0aW9uIGpvYicpO1xuICAgICAgfVxuICAgICAgcmVqZWN0KFxuICAgICAgICBuZXcgV29ya2Zsb3dFeGVjdXRpb25BbHJlYWR5U3RhcnRlZEVycm9yKFxuICAgICAgICAgICdXb3JrZmxvdyBleGVjdXRpb24gYWxyZWFkeSBzdGFydGVkJyxcbiAgICAgICAgICBhY3RpdmF0aW9uLmZhaWxlZC53b3JrZmxvd0lkLFxuICAgICAgICAgIGFjdGl2YXRpb24uZmFpbGVkLndvcmtmbG93VHlwZVxuICAgICAgICApXG4gICAgICApO1xuICAgIH0gZWxzZSBpZiAoYWN0aXZhdGlvbi5jYW5jZWxsZWQpIHtcbiAgICAgIGlmICghYWN0aXZhdGlvbi5jYW5jZWxsZWQuZmFpbHVyZSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdHb3Qgbm8gZmFpbHVyZSBpbiBjYW5jZWxsZWQgdmFyaWFudCcpO1xuICAgICAgfVxuICAgICAgcmVqZWN0KHRoaXMuZmFpbHVyZVRvRXJyb3IoYWN0aXZhdGlvbi5jYW5jZWxsZWQuZmFpbHVyZSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdHb3QgUmVzb2x2ZUNoaWxkV29ya2Zsb3dFeGVjdXRpb25TdGFydCB3aXRoIG5vIHN0YXR1cycpO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyByZXNvbHZlQ2hpbGRXb3JrZmxvd0V4ZWN1dGlvbihhY3RpdmF0aW9uOiBjb3Jlc2RrLndvcmtmbG93X2FjdGl2YXRpb24uSVJlc29sdmVDaGlsZFdvcmtmbG93RXhlY3V0aW9uKTogdm9pZCB7XG4gICAgaWYgKCFhY3RpdmF0aW9uLnJlc3VsdCkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignR290IFJlc29sdmVDaGlsZFdvcmtmbG93RXhlY3V0aW9uIGFjdGl2YXRpb24gd2l0aCBubyByZXN1bHQnKTtcbiAgICB9XG4gICAgY29uc3QgeyByZXNvbHZlLCByZWplY3QgfSA9IHRoaXMuY29uc3VtZUNvbXBsZXRpb24oJ2NoaWxkV29ya2Zsb3dDb21wbGV0ZScsIGdldFNlcShhY3RpdmF0aW9uKSk7XG4gICAgaWYgKGFjdGl2YXRpb24ucmVzdWx0LmNvbXBsZXRlZCkge1xuICAgICAgY29uc3QgY29tcGxldGVkID0gYWN0aXZhdGlvbi5yZXN1bHQuY29tcGxldGVkO1xuICAgICAgY29uc3QgcmVzdWx0ID0gY29tcGxldGVkLnJlc3VsdCA/IHRoaXMucGF5bG9hZENvbnZlcnRlci5mcm9tUGF5bG9hZChjb21wbGV0ZWQucmVzdWx0KSA6IHVuZGVmaW5lZDtcbiAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICB9IGVsc2UgaWYgKGFjdGl2YXRpb24ucmVzdWx0LmZhaWxlZCkge1xuICAgICAgY29uc3QgeyBmYWlsdXJlIH0gPSBhY3RpdmF0aW9uLnJlc3VsdC5mYWlsZWQ7XG4gICAgICBpZiAoZmFpbHVyZSA9PT0gdW5kZWZpbmVkIHx8IGZhaWx1cmUgPT09IG51bGwpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignR290IGZhaWxlZCByZXN1bHQgd2l0aCBubyBmYWlsdXJlIGF0dHJpYnV0ZScpO1xuICAgICAgfVxuICAgICAgcmVqZWN0KHRoaXMuZmFpbHVyZVRvRXJyb3IoZmFpbHVyZSkpO1xuICAgIH0gZWxzZSBpZiAoYWN0aXZhdGlvbi5yZXN1bHQuY2FuY2VsbGVkKSB7XG4gICAgICBjb25zdCB7IGZhaWx1cmUgfSA9IGFjdGl2YXRpb24ucmVzdWx0LmNhbmNlbGxlZDtcbiAgICAgIGlmIChmYWlsdXJlID09PSB1bmRlZmluZWQgfHwgZmFpbHVyZSA9PT0gbnVsbCkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdHb3QgY2FuY2VsbGVkIHJlc3VsdCB3aXRoIG5vIGZhaWx1cmUgYXR0cmlidXRlJyk7XG4gICAgICB9XG4gICAgICByZWplY3QodGhpcy5mYWlsdXJlVG9FcnJvcihmYWlsdXJlKSk7XG4gICAgfVxuICB9XG5cbiAgLy8gSW50ZW50aW9uYWxseSBub24tYXN5bmMgZnVuY3Rpb24gc28gdGhpcyBoYW5kbGVyIGRvZXNuJ3Qgc2hvdyB1cCBpbiB0aGUgc3RhY2sgdHJhY2VcbiAgcHJvdGVjdGVkIHF1ZXJ5V29ya2Zsb3dOZXh0SGFuZGxlcih7IHF1ZXJ5TmFtZSwgYXJncyB9OiBRdWVyeUlucHV0KTogUHJvbWlzZTx1bmtub3duPiB7XG4gICAgY29uc3QgZm4gPSB0aGlzLnF1ZXJ5SGFuZGxlcnMuZ2V0KHF1ZXJ5TmFtZSk/LmhhbmRsZXI7XG4gICAgaWYgKGZuID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGNvbnN0IGtub3duUXVlcnlUeXBlcyA9IFsuLi50aGlzLnF1ZXJ5SGFuZGxlcnMua2V5cygpXS5qb2luKCcgJyk7XG4gICAgICAvLyBGYWlsIHRoZSBxdWVyeVxuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KFxuICAgICAgICBuZXcgUmVmZXJlbmNlRXJyb3IoXG4gICAgICAgICAgYFdvcmtmbG93IGRpZCBub3QgcmVnaXN0ZXIgYSBoYW5kbGVyIGZvciAke3F1ZXJ5TmFtZX0uIFJlZ2lzdGVyZWQgcXVlcmllczogWyR7a25vd25RdWVyeVR5cGVzfV1gXG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXQgPSBmbiguLi5hcmdzKTtcbiAgICAgIGlmIChyZXQgaW5zdGFuY2VvZiBQcm9taXNlKSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgRGV0ZXJtaW5pc21WaW9sYXRpb25FcnJvcignUXVlcnkgaGFuZGxlcnMgc2hvdWxkIG5vdCByZXR1cm4gYSBQcm9taXNlJykpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShyZXQpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGVycik7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIHF1ZXJ5V29ya2Zsb3coYWN0aXZhdGlvbjogY29yZXNkay53b3JrZmxvd19hY3RpdmF0aW9uLklRdWVyeVdvcmtmbG93KTogdm9pZCB7XG4gICAgY29uc3QgeyBxdWVyeVR5cGUsIHF1ZXJ5SWQsIGhlYWRlcnMgfSA9IGFjdGl2YXRpb247XG4gICAgaWYgKCEocXVlcnlUeXBlICYmIHF1ZXJ5SWQpKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdNaXNzaW5nIHF1ZXJ5IGFjdGl2YXRpb24gYXR0cmlidXRlcycpO1xuICAgIH1cblxuICAgIGNvbnN0IGV4ZWN1dGUgPSBjb21wb3NlSW50ZXJjZXB0b3JzKFxuICAgICAgdGhpcy5pbnRlcmNlcHRvcnMuaW5ib3VuZCxcbiAgICAgICdoYW5kbGVRdWVyeScsXG4gICAgICB0aGlzLnF1ZXJ5V29ya2Zsb3dOZXh0SGFuZGxlci5iaW5kKHRoaXMpXG4gICAgKTtcbiAgICBleGVjdXRlKHtcbiAgICAgIHF1ZXJ5TmFtZTogcXVlcnlUeXBlLFxuICAgICAgYXJnczogYXJyYXlGcm9tUGF5bG9hZHModGhpcy5wYXlsb2FkQ29udmVydGVyLCBhY3RpdmF0aW9uLmFyZ3VtZW50cyksXG4gICAgICBxdWVyeUlkLFxuICAgICAgaGVhZGVyczogaGVhZGVycyA/PyB7fSxcbiAgICB9KS50aGVuKFxuICAgICAgKHJlc3VsdCkgPT4gdGhpcy5jb21wbGV0ZVF1ZXJ5KHF1ZXJ5SWQsIHJlc3VsdCksXG4gICAgICAocmVhc29uKSA9PiB0aGlzLmZhaWxRdWVyeShxdWVyeUlkLCByZWFzb24pXG4gICAgKTtcbiAgfVxuXG4gIHB1YmxpYyBkb1VwZGF0ZShhY3RpdmF0aW9uOiBjb3Jlc2RrLndvcmtmbG93X2FjdGl2YXRpb24uSURvVXBkYXRlKTogdm9pZCB7XG4gICAgY29uc3QgeyBpZDogdXBkYXRlSWQsIHByb3RvY29sSW5zdGFuY2VJZCwgbmFtZSwgaGVhZGVycywgcnVuVmFsaWRhdG9yIH0gPSBhY3RpdmF0aW9uO1xuICAgIGlmICghdXBkYXRlSWQpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ01pc3NpbmcgYWN0aXZhdGlvbiB1cGRhdGUgaWQnKTtcbiAgICB9XG4gICAgaWYgKCFuYW1lKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdNaXNzaW5nIGFjdGl2YXRpb24gdXBkYXRlIG5hbWUnKTtcbiAgICB9XG4gICAgaWYgKCFwcm90b2NvbEluc3RhbmNlSWQpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ01pc3NpbmcgYWN0aXZhdGlvbiB1cGRhdGUgcHJvdG9jb2xJbnN0YW5jZUlkJyk7XG4gICAgfVxuICAgIGNvbnN0IGVudHJ5ID0gdGhpcy51cGRhdGVIYW5kbGVycy5nZXQobmFtZSk7XG4gICAgaWYgKCFlbnRyeSkge1xuICAgICAgdGhpcy5idWZmZXJlZFVwZGF0ZXMucHVzaChhY3RpdmF0aW9uKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBtYWtlSW5wdXQgPSAoKTogVXBkYXRlSW5wdXQgPT4gKHtcbiAgICAgIHVwZGF0ZUlkLFxuICAgICAgYXJnczogYXJyYXlGcm9tUGF5bG9hZHModGhpcy5wYXlsb2FkQ29udmVydGVyLCBhY3RpdmF0aW9uLmlucHV0KSxcbiAgICAgIG5hbWUsXG4gICAgICBoZWFkZXJzOiBoZWFkZXJzID8/IHt9LFxuICAgIH0pO1xuXG4gICAgLy8gVGhlIGltcGxlbWVudGF0aW9uIGJlbG93IGlzIHJlc3BvbnNpYmxlIGZvciB1cGhvbGRpbmcsIGFuZCBjb25zdHJhaW5lZFxuICAgIC8vIGJ5LCB0aGUgZm9sbG93aW5nIGNvbnRyYWN0OlxuICAgIC8vXG4gICAgLy8gMS4gSWYgbm8gdmFsaWRhdG9yIGlzIHByZXNlbnQgdGhlbiB2YWxpZGF0aW9uIGludGVyY2VwdG9ycyB3aWxsIG5vdCBiZSBydW4uXG4gICAgLy9cbiAgICAvLyAyLiBEdXJpbmcgdmFsaWRhdGlvbiwgYW55IGVycm9yIG11c3QgZmFpbCB0aGUgVXBkYXRlOyBkdXJpbmcgdGhlIFVwZGF0ZVxuICAgIC8vICAgIGl0c2VsZiwgVGVtcG9yYWwgZXJyb3JzIGZhaWwgdGhlIFVwZGF0ZSB3aGVyZWFzIG90aGVyIGVycm9ycyBmYWlsIHRoZVxuICAgIC8vICAgIGFjdGl2YXRpb24uXG4gICAgLy9cbiAgICAvLyAzLiBUaGUgaGFuZGxlciBtdXN0IG5vdCBzZWUgYW55IG11dGF0aW9ucyBvZiB0aGUgYXJndW1lbnRzIG1hZGUgYnkgdGhlXG4gICAgLy8gICAgdmFsaWRhdG9yLlxuICAgIC8vXG4gICAgLy8gNC4gQW55IGVycm9yIHdoZW4gZGVjb2RpbmcvZGVzZXJpYWxpemluZyBpbnB1dCBtdXN0IGJlIGNhdWdodCBhbmQgcmVzdWx0XG4gICAgLy8gICAgaW4gcmVqZWN0aW9uIG9mIHRoZSBVcGRhdGUgYmVmb3JlIGl0IGlzIGFjY2VwdGVkLCBldmVuIGlmIHRoZXJlIGlzIG5vXG4gICAgLy8gICAgdmFsaWRhdG9yLlxuICAgIC8vXG4gICAgLy8gNS4gVGhlIGluaXRpYWwgc3luY2hyb25vdXMgcG9ydGlvbiBvZiB0aGUgKGFzeW5jKSBVcGRhdGUgaGFuZGxlciBzaG91bGRcbiAgICAvLyAgICBiZSBleGVjdXRlZCBhZnRlciB0aGUgKHN5bmMpIHZhbGlkYXRvciBjb21wbGV0ZXMgc3VjaCB0aGF0IHRoZXJlIGlzXG4gICAgLy8gICAgbWluaW1hbCBvcHBvcnR1bml0eSBmb3IgYSBkaWZmZXJlbnQgY29uY3VycmVudCB0YXNrIHRvIGJlIHNjaGVkdWxlZFxuICAgIC8vICAgIGJldHdlZW4gdGhlbS5cbiAgICAvL1xuICAgIC8vIDYuIFRoZSBzdGFjayB0cmFjZSB2aWV3IHByb3ZpZGVkIGluIHRoZSBUZW1wb3JhbCBVSSBtdXN0IG5vdCBiZSBwb2xsdXRlZFxuICAgIC8vICAgIGJ5IHByb21pc2VzIHRoYXQgZG8gbm90IGRlcml2ZSBmcm9tIHVzZXIgY29kZS4gVGhpcyBpbXBsaWVzIHRoYXRcbiAgICAvLyAgICBhc3luYy9hd2FpdCBzeW50YXggbWF5IG5vdCBiZSB1c2VkLlxuICAgIC8vXG4gICAgLy8gTm90ZSB0aGF0IHRoZXJlIGlzIGEgZGVsaWJlcmF0ZWx5IHVuaGFuZGxlZCBwcm9taXNlIHJlamVjdGlvbiBiZWxvdy5cbiAgICAvLyBUaGVzZSBhcmUgY2F1Z2h0IGVsc2V3aGVyZSBhbmQgZmFpbCB0aGUgY29ycmVzcG9uZGluZyBhY3RpdmF0aW9uLlxuICAgIGNvbnN0IGRvVXBkYXRlSW1wbCA9IGFzeW5jICgpID0+IHtcbiAgICAgIGxldCBpbnB1dDogVXBkYXRlSW5wdXQ7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAocnVuVmFsaWRhdG9yICYmIGVudHJ5LnZhbGlkYXRvcikge1xuICAgICAgICAgIGNvbnN0IHZhbGlkYXRlID0gY29tcG9zZUludGVyY2VwdG9ycyhcbiAgICAgICAgICAgIHRoaXMuaW50ZXJjZXB0b3JzLmluYm91bmQsXG4gICAgICAgICAgICAndmFsaWRhdGVVcGRhdGUnLFxuICAgICAgICAgICAgdGhpcy52YWxpZGF0ZVVwZGF0ZU5leHRIYW5kbGVyLmJpbmQodGhpcywgZW50cnkudmFsaWRhdG9yKVxuICAgICAgICAgICk7XG4gICAgICAgICAgdmFsaWRhdGUobWFrZUlucHV0KCkpO1xuICAgICAgICB9XG4gICAgICAgIGlucHV0ID0gbWFrZUlucHV0KCk7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICB0aGlzLnJlamVjdFVwZGF0ZShwcm90b2NvbEluc3RhbmNlSWQsIGVycm9yKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhpcy5hY2NlcHRVcGRhdGUocHJvdG9jb2xJbnN0YW5jZUlkKTtcbiAgICAgIGNvbnN0IGV4ZWN1dGUgPSBjb21wb3NlSW50ZXJjZXB0b3JzKFxuICAgICAgICB0aGlzLmludGVyY2VwdG9ycy5pbmJvdW5kLFxuICAgICAgICAnaGFuZGxlVXBkYXRlJyxcbiAgICAgICAgdGhpcy51cGRhdGVOZXh0SGFuZGxlci5iaW5kKHRoaXMsIGVudHJ5LmhhbmRsZXIpXG4gICAgICApO1xuICAgICAgY29uc3QgeyB1bmZpbmlzaGVkUG9saWN5IH0gPSBlbnRyeTtcbiAgICAgIHRoaXMuaW5Qcm9ncmVzc1VwZGF0ZXMuc2V0KHVwZGF0ZUlkLCB7IG5hbWUsIHVuZmluaXNoZWRQb2xpY3ksIGlkOiB1cGRhdGVJZCB9KTtcbiAgICAgIGNvbnN0IHJlcyA9IGV4ZWN1dGUoaW5wdXQpXG4gICAgICAgIC50aGVuKChyZXN1bHQpID0+IHRoaXMuY29tcGxldGVVcGRhdGUocHJvdG9jb2xJbnN0YW5jZUlkLCByZXN1bHQpKVxuICAgICAgICAuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgICAgaWYgKGVycm9yIGluc3RhbmNlb2YgVGVtcG9yYWxGYWlsdXJlKSB7XG4gICAgICAgICAgICB0aGlzLnJlamVjdFVwZGF0ZShwcm90b2NvbEluc3RhbmNlSWQsIGVycm9yKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICAuZmluYWxseSgoKSA9PiB0aGlzLmluUHJvZ3Jlc3NVcGRhdGVzLmRlbGV0ZSh1cGRhdGVJZCkpO1xuICAgICAgdW50cmFja1Byb21pc2UocmVzKTtcbiAgICAgIHJldHVybiByZXM7XG4gICAgfTtcbiAgICB1bnRyYWNrUHJvbWlzZShVcGRhdGVTY29wZS51cGRhdGVXaXRoSW5mbyh1cGRhdGVJZCwgbmFtZSwgZG9VcGRhdGVJbXBsKSk7XG4gIH1cblxuICBwcm90ZWN0ZWQgYXN5bmMgdXBkYXRlTmV4dEhhbmRsZXIoaGFuZGxlcjogV29ya2Zsb3dVcGRhdGVUeXBlLCB7IGFyZ3MgfTogVXBkYXRlSW5wdXQpOiBQcm9taXNlPHVua25vd24+IHtcbiAgICByZXR1cm4gYXdhaXQgaGFuZGxlciguLi5hcmdzKTtcbiAgfVxuXG4gIHByb3RlY3RlZCB2YWxpZGF0ZVVwZGF0ZU5leHRIYW5kbGVyKHZhbGlkYXRvcjogV29ya2Zsb3dVcGRhdGVWYWxpZGF0b3JUeXBlIHwgdW5kZWZpbmVkLCB7IGFyZ3MgfTogVXBkYXRlSW5wdXQpOiB2b2lkIHtcbiAgICBpZiAodmFsaWRhdG9yKSB7XG4gICAgICB2YWxpZGF0b3IoLi4uYXJncyk7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIGRpc3BhdGNoQnVmZmVyZWRVcGRhdGVzKCk6IHZvaWQge1xuICAgIGNvbnN0IGJ1ZmZlcmVkVXBkYXRlcyA9IHRoaXMuYnVmZmVyZWRVcGRhdGVzO1xuICAgIHdoaWxlIChidWZmZXJlZFVwZGF0ZXMubGVuZ3RoKSB7XG4gICAgICBjb25zdCBmb3VuZEluZGV4ID0gYnVmZmVyZWRVcGRhdGVzLmZpbmRJbmRleCgodXBkYXRlKSA9PiB0aGlzLnVwZGF0ZUhhbmRsZXJzLmhhcyh1cGRhdGUubmFtZSBhcyBzdHJpbmcpKTtcbiAgICAgIGlmIChmb3VuZEluZGV4ID09PSAtMSkge1xuICAgICAgICAvLyBObyBidWZmZXJlZCBVcGRhdGVzIGhhdmUgYSBoYW5kbGVyIHlldC5cbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBjb25zdCBbdXBkYXRlXSA9IGJ1ZmZlcmVkVXBkYXRlcy5zcGxpY2UoZm91bmRJbmRleCwgMSk7XG4gICAgICB0aGlzLmRvVXBkYXRlKHVwZGF0ZSk7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIHJlamVjdEJ1ZmZlcmVkVXBkYXRlcygpOiB2b2lkIHtcbiAgICB3aGlsZSAodGhpcy5idWZmZXJlZFVwZGF0ZXMubGVuZ3RoKSB7XG4gICAgICBjb25zdCB1cGRhdGUgPSB0aGlzLmJ1ZmZlcmVkVXBkYXRlcy5zaGlmdCgpO1xuICAgICAgaWYgKHVwZGF0ZSkge1xuICAgICAgICB0aGlzLnJlamVjdFVwZGF0ZShcbiAgICAgICAgICAvKiBlc2xpbnQtZGlzYWJsZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tbm9uLW51bGwtYXNzZXJ0aW9uICovXG4gICAgICAgICAgdXBkYXRlLnByb3RvY29sSW5zdGFuY2VJZCEsXG4gICAgICAgICAgQXBwbGljYXRpb25GYWlsdXJlLm5vblJldHJ5YWJsZShgTm8gcmVnaXN0ZXJlZCBoYW5kbGVyIGZvciB1cGRhdGU6ICR7dXBkYXRlLm5hbWV9YClcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwdWJsaWMgYXN5bmMgc2lnbmFsV29ya2Zsb3dOZXh0SGFuZGxlcih7IHNpZ25hbE5hbWUsIGFyZ3MgfTogU2lnbmFsSW5wdXQpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBmbiA9IHRoaXMuc2lnbmFsSGFuZGxlcnMuZ2V0KHNpZ25hbE5hbWUpPy5oYW5kbGVyO1xuICAgIGlmIChmbikge1xuICAgICAgcmV0dXJuIGF3YWl0IGZuKC4uLmFyZ3MpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5kZWZhdWx0U2lnbmFsSGFuZGxlcikge1xuICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuZGVmYXVsdFNpZ25hbEhhbmRsZXIoc2lnbmFsTmFtZSwgLi4uYXJncyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBJbGxlZ2FsU3RhdGVFcnJvcihgTm8gcmVnaXN0ZXJlZCBzaWduYWwgaGFuZGxlciBmb3Igc2lnbmFsOiAke3NpZ25hbE5hbWV9YCk7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIHNpZ25hbFdvcmtmbG93KGFjdGl2YXRpb246IGNvcmVzZGsud29ya2Zsb3dfYWN0aXZhdGlvbi5JU2lnbmFsV29ya2Zsb3cpOiB2b2lkIHtcbiAgICBjb25zdCB7IHNpZ25hbE5hbWUsIGhlYWRlcnMgfSA9IGFjdGl2YXRpb247XG4gICAgaWYgKCFzaWduYWxOYW1lKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdNaXNzaW5nIGFjdGl2YXRpb24gc2lnbmFsTmFtZScpO1xuICAgIH1cblxuICAgIGlmICghdGhpcy5zaWduYWxIYW5kbGVycy5oYXMoc2lnbmFsTmFtZSkgJiYgIXRoaXMuZGVmYXVsdFNpZ25hbEhhbmRsZXIpIHtcbiAgICAgIHRoaXMuYnVmZmVyZWRTaWduYWxzLnB1c2goYWN0aXZhdGlvbik7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gSWYgd2UgZmFsbCB0aHJvdWdoIHRvIHRoZSBkZWZhdWx0IHNpZ25hbCBoYW5kbGVyIHRoZW4gdGhlIHVuZmluaXNoZWRcbiAgICAvLyBwb2xpY3kgaXMgV0FSTl9BTkRfQUJBTkRPTjsgdXNlcnMgY3VycmVudGx5IGhhdmUgbm8gd2F5IHRvIHNpbGVuY2UgYW55XG4gICAgLy8gZW5zdWluZyB3YXJuaW5ncy5cbiAgICBjb25zdCB1bmZpbmlzaGVkUG9saWN5ID1cbiAgICAgIHRoaXMuc2lnbmFsSGFuZGxlcnMuZ2V0KHNpZ25hbE5hbWUpPy51bmZpbmlzaGVkUG9saWN5ID8/IEhhbmRsZXJVbmZpbmlzaGVkUG9saWN5LldBUk5fQU5EX0FCQU5ET047XG5cbiAgICBjb25zdCBzaWduYWxFeGVjdXRpb25OdW0gPSB0aGlzLnNpZ25hbEhhbmRsZXJFeGVjdXRpb25TZXErKztcbiAgICB0aGlzLmluUHJvZ3Jlc3NTaWduYWxzLnNldChzaWduYWxFeGVjdXRpb25OdW0sIHsgbmFtZTogc2lnbmFsTmFtZSwgdW5maW5pc2hlZFBvbGljeSB9KTtcbiAgICBjb25zdCBleGVjdXRlID0gY29tcG9zZUludGVyY2VwdG9ycyhcbiAgICAgIHRoaXMuaW50ZXJjZXB0b3JzLmluYm91bmQsXG4gICAgICAnaGFuZGxlU2lnbmFsJyxcbiAgICAgIHRoaXMuc2lnbmFsV29ya2Zsb3dOZXh0SGFuZGxlci5iaW5kKHRoaXMpXG4gICAgKTtcbiAgICBleGVjdXRlKHtcbiAgICAgIGFyZ3M6IGFycmF5RnJvbVBheWxvYWRzKHRoaXMucGF5bG9hZENvbnZlcnRlciwgYWN0aXZhdGlvbi5pbnB1dCksXG4gICAgICBzaWduYWxOYW1lLFxuICAgICAgaGVhZGVyczogaGVhZGVycyA/PyB7fSxcbiAgICB9KVxuICAgICAgLmNhdGNoKHRoaXMuaGFuZGxlV29ya2Zsb3dGYWlsdXJlLmJpbmQodGhpcykpXG4gICAgICAuZmluYWxseSgoKSA9PiB0aGlzLmluUHJvZ3Jlc3NTaWduYWxzLmRlbGV0ZShzaWduYWxFeGVjdXRpb25OdW0pKTtcbiAgfVxuXG4gIHB1YmxpYyBkaXNwYXRjaEJ1ZmZlcmVkU2lnbmFscygpOiB2b2lkIHtcbiAgICBjb25zdCBidWZmZXJlZFNpZ25hbHMgPSB0aGlzLmJ1ZmZlcmVkU2lnbmFscztcbiAgICB3aGlsZSAoYnVmZmVyZWRTaWduYWxzLmxlbmd0aCkge1xuICAgICAgaWYgKHRoaXMuZGVmYXVsdFNpZ25hbEhhbmRsZXIpIHtcbiAgICAgICAgLy8gV2UgaGF2ZSBhIGRlZmF1bHQgc2lnbmFsIGhhbmRsZXIsIHNvIGFsbCBzaWduYWxzIGFyZSBkaXNwYXRjaGFibGVcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1ub24tbnVsbC1hc3NlcnRpb25cbiAgICAgICAgdGhpcy5zaWduYWxXb3JrZmxvdyhidWZmZXJlZFNpZ25hbHMuc2hpZnQoKSEpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgZm91bmRJbmRleCA9IGJ1ZmZlcmVkU2lnbmFscy5maW5kSW5kZXgoKHNpZ25hbCkgPT4gdGhpcy5zaWduYWxIYW5kbGVycy5oYXMoc2lnbmFsLnNpZ25hbE5hbWUgYXMgc3RyaW5nKSk7XG4gICAgICAgIGlmIChmb3VuZEluZGV4ID09PSAtMSkgYnJlYWs7XG4gICAgICAgIGNvbnN0IFtzaWduYWxdID0gYnVmZmVyZWRTaWduYWxzLnNwbGljZShmb3VuZEluZGV4LCAxKTtcbiAgICAgICAgdGhpcy5zaWduYWxXb3JrZmxvdyhzaWduYWwpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyByZXNvbHZlU2lnbmFsRXh0ZXJuYWxXb3JrZmxvdyhhY3RpdmF0aW9uOiBjb3Jlc2RrLndvcmtmbG93X2FjdGl2YXRpb24uSVJlc29sdmVTaWduYWxFeHRlcm5hbFdvcmtmbG93KTogdm9pZCB7XG4gICAgY29uc3QgeyByZXNvbHZlLCByZWplY3QgfSA9IHRoaXMuY29uc3VtZUNvbXBsZXRpb24oJ3NpZ25hbFdvcmtmbG93JywgZ2V0U2VxKGFjdGl2YXRpb24pKTtcbiAgICBpZiAoYWN0aXZhdGlvbi5mYWlsdXJlKSB7XG4gICAgICByZWplY3QodGhpcy5mYWlsdXJlVG9FcnJvcihhY3RpdmF0aW9uLmZhaWx1cmUpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzb2x2ZSh1bmRlZmluZWQpO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyByZXNvbHZlUmVxdWVzdENhbmNlbEV4dGVybmFsV29ya2Zsb3coXG4gICAgYWN0aXZhdGlvbjogY29yZXNkay53b3JrZmxvd19hY3RpdmF0aW9uLklSZXNvbHZlUmVxdWVzdENhbmNlbEV4dGVybmFsV29ya2Zsb3dcbiAgKTogdm9pZCB7XG4gICAgY29uc3QgeyByZXNvbHZlLCByZWplY3QgfSA9IHRoaXMuY29uc3VtZUNvbXBsZXRpb24oJ2NhbmNlbFdvcmtmbG93JywgZ2V0U2VxKGFjdGl2YXRpb24pKTtcbiAgICBpZiAoYWN0aXZhdGlvbi5mYWlsdXJlKSB7XG4gICAgICByZWplY3QodGhpcy5mYWlsdXJlVG9FcnJvcihhY3RpdmF0aW9uLmZhaWx1cmUpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzb2x2ZSh1bmRlZmluZWQpO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyB3YXJuSWZVbmZpbmlzaGVkSGFuZGxlcnMoKTogdm9pZCB7XG4gICAgY29uc3QgZ2V0V2FybmFibGUgPSAoaGFuZGxlckV4ZWN1dGlvbnM6IEl0ZXJhYmxlPE1lc3NhZ2VIYW5kbGVyRXhlY3V0aW9uPik6IE1lc3NhZ2VIYW5kbGVyRXhlY3V0aW9uW10gPT4ge1xuICAgICAgcmV0dXJuIEFycmF5LmZyb20oaGFuZGxlckV4ZWN1dGlvbnMpLmZpbHRlcihcbiAgICAgICAgKGV4KSA9PiBleC51bmZpbmlzaGVkUG9saWN5ID09PSBIYW5kbGVyVW5maW5pc2hlZFBvbGljeS5XQVJOX0FORF9BQkFORE9OXG4gICAgICApO1xuICAgIH07XG5cbiAgICBjb25zdCB3YXJuYWJsZVVwZGF0ZXMgPSBnZXRXYXJuYWJsZSh0aGlzLmluUHJvZ3Jlc3NVcGRhdGVzLnZhbHVlcygpKTtcbiAgICBpZiAod2FybmFibGVVcGRhdGVzLmxlbmd0aCA+IDApIHtcbiAgICAgIGxvZy53YXJuKG1ha2VVbmZpbmlzaGVkVXBkYXRlSGFuZGxlck1lc3NhZ2Uod2FybmFibGVVcGRhdGVzKSk7XG4gICAgfVxuXG4gICAgY29uc3Qgd2FybmFibGVTaWduYWxzID0gZ2V0V2FybmFibGUodGhpcy5pblByb2dyZXNzU2lnbmFscy52YWx1ZXMoKSk7XG4gICAgaWYgKHdhcm5hYmxlU2lnbmFscy5sZW5ndGggPiAwKSB7XG4gICAgICBsb2cud2FybihtYWtlVW5maW5pc2hlZFNpZ25hbEhhbmRsZXJNZXNzYWdlKHdhcm5hYmxlU2lnbmFscykpO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyB1cGRhdGVSYW5kb21TZWVkKGFjdGl2YXRpb246IGNvcmVzZGsud29ya2Zsb3dfYWN0aXZhdGlvbi5JVXBkYXRlUmFuZG9tU2VlZCk6IHZvaWQge1xuICAgIGlmICghYWN0aXZhdGlvbi5yYW5kb21uZXNzU2VlZCkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignRXhwZWN0ZWQgYWN0aXZhdGlvbiB3aXRoIHJhbmRvbW5lc3NTZWVkIGF0dHJpYnV0ZScpO1xuICAgIH1cbiAgICB0aGlzLnJhbmRvbSA9IGFsZWEoYWN0aXZhdGlvbi5yYW5kb21uZXNzU2VlZC50b0J5dGVzKCkpO1xuICB9XG5cbiAgcHVibGljIG5vdGlmeUhhc1BhdGNoKGFjdGl2YXRpb246IGNvcmVzZGsud29ya2Zsb3dfYWN0aXZhdGlvbi5JTm90aWZ5SGFzUGF0Y2gpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuaW5mby51bnNhZmUuaXNSZXBsYXlpbmcpXG4gICAgICB0aHJvdyBuZXcgSWxsZWdhbFN0YXRlRXJyb3IoJ1VuZXhwZWN0ZWQgbm90aWZ5SGFzUGF0Y2ggam9iIG9uIG5vbi1yZXBsYXkgYWN0aXZhdGlvbicpO1xuICAgIGlmICghYWN0aXZhdGlvbi5wYXRjaElkKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdub3RpZnlIYXNQYXRjaCBtaXNzaW5nIHBhdGNoIGlkJyk7XG4gICAgdGhpcy5rbm93blByZXNlbnRQYXRjaGVzLmFkZChhY3RpdmF0aW9uLnBhdGNoSWQpO1xuICB9XG5cbiAgcHVibGljIHBhdGNoSW50ZXJuYWwocGF0Y2hJZDogc3RyaW5nLCBkZXByZWNhdGVkOiBib29sZWFuKTogYm9vbGVhbiB7XG4gICAgaWYgKHRoaXMud29ya2Zsb3cgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IElsbGVnYWxTdGF0ZUVycm9yKCdQYXRjaGVzIGNhbm5vdCBiZSB1c2VkIGJlZm9yZSBXb3JrZmxvdyBzdGFydHMnKTtcbiAgICB9XG4gICAgY29uc3QgdXNlUGF0Y2ggPSAhdGhpcy5pbmZvLnVuc2FmZS5pc1JlcGxheWluZyB8fCB0aGlzLmtub3duUHJlc2VudFBhdGNoZXMuaGFzKHBhdGNoSWQpO1xuICAgIC8vIEF2b2lkIHNlbmRpbmcgY29tbWFuZHMgZm9yIHBhdGNoZXMgY29yZSBhbHJlYWR5IGtub3dzIGFib3V0LlxuICAgIC8vIFRoaXMgb3B0aW1pemF0aW9uIGVuYWJsZXMgZGV2ZWxvcG1lbnQgb2YgYXV0b21hdGljIHBhdGNoaW5nIHRvb2xzLlxuICAgIGlmICh1c2VQYXRjaCAmJiAhdGhpcy5zZW50UGF0Y2hlcy5oYXMocGF0Y2hJZCkpIHtcbiAgICAgIHRoaXMucHVzaENvbW1hbmQoe1xuICAgICAgICBzZXRQYXRjaE1hcmtlcjogeyBwYXRjaElkLCBkZXByZWNhdGVkIH0sXG4gICAgICB9KTtcbiAgICAgIHRoaXMuc2VudFBhdGNoZXMuYWRkKHBhdGNoSWQpO1xuICAgIH1cbiAgICByZXR1cm4gdXNlUGF0Y2g7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIGVhcmx5IHdoaWxlIGhhbmRsaW5nIGFuIGFjdGl2YXRpb24gdG8gcmVnaXN0ZXIga25vd24gZmxhZ3MuXG4gICAqIE1heSBiZSBpbnZva2VkIGZyb20gb3V0c2lkZSB0aGUgVk0uXG4gICAqL1xuICBwdWJsaWMgYWRkS25vd25GbGFncyhmbGFnczogbnVtYmVyW10pOiB2b2lkIHtcbiAgICBmb3IgKGNvbnN0IGZsYWcgb2YgZmxhZ3MpIHtcbiAgICAgIGFzc2VydFZhbGlkRmxhZyhmbGFnKTtcbiAgICAgIHRoaXMua25vd25GbGFncy5hZGQoZmxhZyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIGFuIFNESyBGbGFnIG1heSBiZSBjb25zaWRlcmVkIGFzIGVuYWJsZWQgZm9yIHRoZSBjdXJyZW50IFdvcmtmbG93IFRhc2suXG4gICAqXG4gICAqIFNESyBmbGFncyBwbGF5IGEgcm9sZSBzaW1pbGFyIHRvIHRoZSBgcGF0Y2hlZCgpYCBBUEksIGJ1dCBhcmUgbWVhbnQgZm9yIGludGVybmFsIHVzYWdlIGJ5IHRoZVxuICAgKiBTREsgaXRzZWxmLiBUaGV5IG1ha2UgaXQgcG9zc2libGUgZm9yIHRoZSBTREsgdG8gZXZvbHZlIGl0cyBiZWhhdmlvcnMgb3ZlciB0aW1lLCB3aGlsZSBzdGlsbFxuICAgKiBtYWludGFpbmluZyBjb21wYXRpYmlsaXR5IHdpdGggV29ya2Zsb3cgaGlzdG9yaWVzIHByb2R1Y2VkIGJ5IG9sZGVyIFNES3MsIHdpdGhvdXQgY2F1c2luZ1xuICAgKiBkZXRlcm1pbmlzbSB2aW9sYXRpb25zLlxuICAgKlxuICAgKiBNYXkgYmUgaW52b2tlZCBmcm9tIG91dHNpZGUgdGhlIFZNLlxuICAgKi9cbiAgcHVibGljIGhhc0ZsYWcoZmxhZzogU2RrRmxhZyk6IGJvb2xlYW4ge1xuICAgIGlmICh0aGlzLmtub3duRmxhZ3MuaGFzKGZsYWcuaWQpKSByZXR1cm4gdHJ1ZTtcblxuICAgIC8vIElmIG5vdCByZXBsYXlpbmcsIGVuYWJsZSB0aGUgZmxhZyBpZiBpdCBpcyBjb25maWd1cmVkIHRvIGJlIGVuYWJsZWQgYnkgZGVmYXVsdC4gU2V0dGluZyBhXG4gICAgLy8gZmxhZydzIGRlZmF1bHQgdG8gZmFsc2UgYWxsb3dzIHByb2dyZXNzaXZlIHJvbGxvdXQgb2YgbmV3IGZlYXR1cmUgZmxhZ3MsIHdpdGggdGhlIHBvc3NpYmlsaXR5XG4gICAgLy8gb2YgcmV2ZXJ0aW5nIGJhY2sgdG8gYSB2ZXJzaW9uIG9mIHRoZSBTREsgd2hlcmUgdGhlIGZsYWcgaXMgc3VwcG9ydGVkIGJ1dCBkaXNhYmxlZCBieSBkZWZhdWx0LlxuICAgIC8vIEl0IGlzIGFsc28gdXNlZnVsIGZvciB0ZXN0aW5nIHB1cnBvc2UuXG4gICAgaWYgKCF0aGlzLmluZm8udW5zYWZlLmlzUmVwbGF5aW5nICYmIGZsYWcuZGVmYXVsdCkge1xuICAgICAgdGhpcy5rbm93bkZsYWdzLmFkZChmbGFnLmlkKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIC8vIFdoZW4gcmVwbGF5aW5nLCBhIGZsYWcgaXMgY29uc2lkZXJlZCBlbmFibGVkIGlmIGl0IHdhcyBlbmFibGVkIGR1cmluZyB0aGUgb3JpZ2luYWwgZXhlY3V0aW9uIG9mXG4gICAgLy8gdGhhdCBXb3JrZmxvdyBUYXNrOyB0aGlzIGlzIG5vcm1hbGx5IGRldGVybWluZWQgYnkgdGhlIHByZXNlbmNlIG9mIHRoZSBmbGFnIElEIGluIHRoZSBjb3JyZXNwb25kaW5nXG4gICAgLy8gV0ZUIENvbXBsZXRlZCdzIGBzZGtNZXRhZGF0YS5sYW5nVXNlZEZsYWdzYC5cbiAgICAvL1xuICAgIC8vIFNESyBGbGFnIEFsdGVybmF0ZSBDb25kaXRpb24gcHJvdmlkZXMgYW4gYWx0ZXJuYXRpdmUgd2F5IG9mIGRldGVybWluaW5nIHdoZXRoZXIgYSBmbGFnIHNob3VsZFxuICAgIC8vIGJlIGNvbnNpZGVyZWQgYXMgZW5hYmxlZCBmb3IgdGhlIGN1cnJlbnQgV0ZUOyBlLmcuIGJ5IGxvb2tpbmcgYXQgdGhlIHZlcnNpb24gb2YgdGhlIFNESyB0aGF0XG4gICAgLy8gZW1pdHRlZCBhIFdGVC4gVGhlIG1haW4gdXNlIGNhc2UgZm9yIHRoaXMgaXMgdG8gcmV0cm9hY3RpdmVseSB0dXJuIG9uIHNvbWUgZmxhZ3MgZm9yIFdGVCBlbWl0dGVkXG4gICAgLy8gYnkgcHJldmlvdXMgU0RLcyB0aGF0IGNvbnRhaW5lZCBhIGJ1Zy4gQWx0IENvbmRpdGlvbnMgc2hvdWxkIG9ubHkgYmUgdXNlZCBhcyBhIGxhc3QgcmVzb3J0LlxuICAgIC8vXG4gICAgLy8gTm90ZSB0aGF0IGNvbmRpdGlvbnMgYXJlIG9ubHkgZXZhbHVhdGVkIHdoaWxlIHJlcGxheWluZy4gQWxzbywgYWx0ZXJuYXRlIGNvbmRpdGlvbnMgd2lsbCBub3RcbiAgICAvLyBjYXVzZSB0aGUgZmxhZyB0byBiZSBwZXJzaXN0ZWQgdG8gdGhlIFwidXNlZCBmbGFnc1wiIHNldCwgd2hpY2ggbWVhbnMgdGhhdCBmdXJ0aGVyIFdvcmtmbG93IFRhc2tzXG4gICAgLy8gbWF5IG5vdCByZWZsZWN0IHRoaXMgZmxhZyBpZiB0aGUgY29uZGl0aW9uIG5vIGxvbmdlciBob2xkcy4gVGhpcyBpcyBzbyB0byBhdm9pZCBpbmNvcnJlY3RcbiAgICAvLyBiZWhhdmlvcnMgaW4gY2FzZSB3aGVyZSBhIFdvcmtmbG93IEV4ZWN1dGlvbiBoYXMgZ29uZSB0aHJvdWdoIGEgbmV3ZXIgU0RLIHZlcnNpb24gdGhlbiBhZ2FpblxuICAgIC8vIHRocm91Z2ggYW4gb2xkZXIgb25lLlxuICAgIGlmICh0aGlzLmluZm8udW5zYWZlLmlzUmVwbGF5aW5nICYmIGZsYWcuYWx0ZXJuYXRpdmVDb25kaXRpb25zKSB7XG4gICAgICBmb3IgKGNvbnN0IGNvbmQgb2YgZmxhZy5hbHRlcm5hdGl2ZUNvbmRpdGlvbnMpIHtcbiAgICAgICAgaWYgKGNvbmQoeyBpbmZvOiB0aGlzLmluZm8gfSkpIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHB1YmxpYyByZW1vdmVGcm9tQ2FjaGUoKTogdm9pZCB7XG4gICAgdGhyb3cgbmV3IElsbGVnYWxTdGF0ZUVycm9yKCdyZW1vdmVGcm9tQ2FjaGUgYWN0aXZhdGlvbiBqb2Igc2hvdWxkIG5vdCByZWFjaCB3b3JrZmxvdycpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRyYW5zZm9ybXMgZmFpbHVyZXMgaW50byBhIGNvbW1hbmQgdG8gYmUgc2VudCB0byB0aGUgc2VydmVyLlxuICAgKiBVc2VkIHRvIGhhbmRsZSBhbnkgZmFpbHVyZSBlbWl0dGVkIGJ5IHRoZSBXb3JrZmxvdy5cbiAgICovXG4gIGFzeW5jIGhhbmRsZVdvcmtmbG93RmFpbHVyZShlcnJvcjogdW5rbm93bik6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICh0aGlzLmNhbmNlbGxlZCAmJiBpc0NhbmNlbGxhdGlvbihlcnJvcikpIHtcbiAgICAgIHRoaXMucHVzaENvbW1hbmQoeyBjYW5jZWxXb3JrZmxvd0V4ZWN1dGlvbjoge30gfSwgdHJ1ZSk7XG4gICAgfSBlbHNlIGlmIChlcnJvciBpbnN0YW5jZW9mIENvbnRpbnVlQXNOZXcpIHtcbiAgICAgIHRoaXMucHVzaENvbW1hbmQoeyBjb250aW51ZUFzTmV3V29ya2Zsb3dFeGVjdXRpb246IGVycm9yLmNvbW1hbmQgfSwgdHJ1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICghKGVycm9yIGluc3RhbmNlb2YgVGVtcG9yYWxGYWlsdXJlKSkge1xuICAgICAgICAvLyBUaGlzIHJlc3VsdHMgaW4gYW4gdW5oYW5kbGVkIHJlamVjdGlvbiB3aGljaCB3aWxsIGZhaWwgdGhlIGFjdGl2YXRpb25cbiAgICAgICAgLy8gcHJldmVudGluZyBpdCBmcm9tIGNvbXBsZXRpbmcuXG4gICAgICAgIHRocm93IGVycm9yO1xuICAgICAgfVxuICAgICAgLy8gRmFpbCB0aGUgd29ya2Zsb3cuIFdlIGRvIG5vdCB3YW50IHRvIGlzc3VlIHVuZmluaXNoZWRIYW5kbGVycyB3YXJuaW5ncy4gVG8gYWNoaWV2ZSB0aGF0LCB3ZVxuICAgICAgLy8gbWFyayBhbGwgaGFuZGxlcnMgYXMgY29tcGxldGVkIG5vdy5cbiAgICAgIHRoaXMuaW5Qcm9ncmVzc1NpZ25hbHMuY2xlYXIoKTtcbiAgICAgIHRoaXMuaW5Qcm9ncmVzc1VwZGF0ZXMuY2xlYXIoKTtcbiAgICAgIHRoaXMucHVzaENvbW1hbmQoXG4gICAgICAgIHtcbiAgICAgICAgICBmYWlsV29ya2Zsb3dFeGVjdXRpb246IHtcbiAgICAgICAgICAgIGZhaWx1cmU6IHRoaXMuZXJyb3JUb0ZhaWx1cmUoZXJyb3IpLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIHRydWVcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBjb21wbGV0ZVF1ZXJ5KHF1ZXJ5SWQ6IHN0cmluZywgcmVzdWx0OiB1bmtub3duKTogdm9pZCB7XG4gICAgdGhpcy5wdXNoQ29tbWFuZCh7XG4gICAgICByZXNwb25kVG9RdWVyeTogeyBxdWVyeUlkLCBzdWNjZWVkZWQ6IHsgcmVzcG9uc2U6IHRoaXMucGF5bG9hZENvbnZlcnRlci50b1BheWxvYWQocmVzdWx0KSB9IH0sXG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIGZhaWxRdWVyeShxdWVyeUlkOiBzdHJpbmcsIGVycm9yOiB1bmtub3duKTogdm9pZCB7XG4gICAgdGhpcy5wdXNoQ29tbWFuZCh7XG4gICAgICByZXNwb25kVG9RdWVyeToge1xuICAgICAgICBxdWVyeUlkLFxuICAgICAgICBmYWlsZWQ6IHRoaXMuZXJyb3JUb0ZhaWx1cmUoZW5zdXJlVGVtcG9yYWxGYWlsdXJlKGVycm9yKSksXG4gICAgICB9LFxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBhY2NlcHRVcGRhdGUocHJvdG9jb2xJbnN0YW5jZUlkOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLnB1c2hDb21tYW5kKHsgdXBkYXRlUmVzcG9uc2U6IHsgcHJvdG9jb2xJbnN0YW5jZUlkLCBhY2NlcHRlZDoge30gfSB9KTtcbiAgfVxuXG4gIHByaXZhdGUgY29tcGxldGVVcGRhdGUocHJvdG9jb2xJbnN0YW5jZUlkOiBzdHJpbmcsIHJlc3VsdDogdW5rbm93bik6IHZvaWQge1xuICAgIHRoaXMucHVzaENvbW1hbmQoe1xuICAgICAgdXBkYXRlUmVzcG9uc2U6IHsgcHJvdG9jb2xJbnN0YW5jZUlkLCBjb21wbGV0ZWQ6IHRoaXMucGF5bG9hZENvbnZlcnRlci50b1BheWxvYWQocmVzdWx0KSB9LFxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSByZWplY3RVcGRhdGUocHJvdG9jb2xJbnN0YW5jZUlkOiBzdHJpbmcsIGVycm9yOiB1bmtub3duKTogdm9pZCB7XG4gICAgdGhpcy5wdXNoQ29tbWFuZCh7XG4gICAgICB1cGRhdGVSZXNwb25zZToge1xuICAgICAgICBwcm90b2NvbEluc3RhbmNlSWQsXG4gICAgICAgIHJlamVjdGVkOiB0aGlzLmVycm9yVG9GYWlsdXJlKGVuc3VyZVRlbXBvcmFsRmFpbHVyZShlcnJvcikpLFxuICAgICAgfSxcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBDb25zdW1lIGEgY29tcGxldGlvbiBpZiBpdCBleGlzdHMgaW4gV29ya2Zsb3cgc3RhdGUgKi9cbiAgcHJpdmF0ZSBtYXliZUNvbnN1bWVDb21wbGV0aW9uKHR5cGU6IGtleW9mIEFjdGl2YXRvclsnY29tcGxldGlvbnMnXSwgdGFza1NlcTogbnVtYmVyKTogQ29tcGxldGlvbiB8IHVuZGVmaW5lZCB7XG4gICAgY29uc3QgY29tcGxldGlvbiA9IHRoaXMuY29tcGxldGlvbnNbdHlwZV0uZ2V0KHRhc2tTZXEpO1xuICAgIGlmIChjb21wbGV0aW9uICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMuY29tcGxldGlvbnNbdHlwZV0uZGVsZXRlKHRhc2tTZXEpO1xuICAgIH1cbiAgICByZXR1cm4gY29tcGxldGlvbjtcbiAgfVxuXG4gIC8qKiBDb25zdW1lIGEgY29tcGxldGlvbiBpZiBpdCBleGlzdHMgaW4gV29ya2Zsb3cgc3RhdGUsIHRocm93cyBpZiBpdCBkb2Vzbid0ICovXG4gIHByaXZhdGUgY29uc3VtZUNvbXBsZXRpb24odHlwZToga2V5b2YgQWN0aXZhdG9yWydjb21wbGV0aW9ucyddLCB0YXNrU2VxOiBudW1iZXIpOiBDb21wbGV0aW9uIHtcbiAgICBjb25zdCBjb21wbGV0aW9uID0gdGhpcy5tYXliZUNvbnN1bWVDb21wbGV0aW9uKHR5cGUsIHRhc2tTZXEpO1xuICAgIGlmIChjb21wbGV0aW9uID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBJbGxlZ2FsU3RhdGVFcnJvcihgTm8gY29tcGxldGlvbiBmb3IgdGFza1NlcSAke3Rhc2tTZXF9YCk7XG4gICAgfVxuICAgIHJldHVybiBjb21wbGV0aW9uO1xuICB9XG5cbiAgcHJpdmF0ZSBjb21wbGV0ZVdvcmtmbG93KHJlc3VsdDogdW5rbm93bik6IHZvaWQge1xuICAgIHRoaXMucHVzaENvbW1hbmQoXG4gICAgICB7XG4gICAgICAgIGNvbXBsZXRlV29ya2Zsb3dFeGVjdXRpb246IHtcbiAgICAgICAgICByZXN1bHQ6IHRoaXMucGF5bG9hZENvbnZlcnRlci50b1BheWxvYWQocmVzdWx0KSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICB0cnVlXG4gICAgKTtcbiAgfVxuXG4gIGVycm9yVG9GYWlsdXJlKGVycjogdW5rbm93bik6IFByb3RvRmFpbHVyZSB7XG4gICAgcmV0dXJuIHRoaXMuZmFpbHVyZUNvbnZlcnRlci5lcnJvclRvRmFpbHVyZShlcnIsIHRoaXMucGF5bG9hZENvbnZlcnRlcik7XG4gIH1cblxuICBmYWlsdXJlVG9FcnJvcihmYWlsdXJlOiBQcm90b0ZhaWx1cmUpOiBFcnJvciB7XG4gICAgcmV0dXJuIHRoaXMuZmFpbHVyZUNvbnZlcnRlci5mYWlsdXJlVG9FcnJvcihmYWlsdXJlLCB0aGlzLnBheWxvYWRDb252ZXJ0ZXIpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldFNlcTxUIGV4dGVuZHMgeyBzZXE/OiBudW1iZXIgfCBudWxsIH0+KGFjdGl2YXRpb246IFQpOiBudW1iZXIge1xuICBjb25zdCBzZXEgPSBhY3RpdmF0aW9uLnNlcTtcbiAgaWYgKHNlcSA9PT0gdW5kZWZpbmVkIHx8IHNlcSA9PT0gbnVsbCkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYEdvdCBhY3RpdmF0aW9uIHdpdGggbm8gc2VxIGF0dHJpYnV0ZWApO1xuICB9XG4gIHJldHVybiBzZXE7XG59XG5cbmZ1bmN0aW9uIG1ha2VVbmZpbmlzaGVkVXBkYXRlSGFuZGxlck1lc3NhZ2UoaGFuZGxlckV4ZWN1dGlvbnM6IE1lc3NhZ2VIYW5kbGVyRXhlY3V0aW9uW10pOiBzdHJpbmcge1xuICBjb25zdCBtZXNzYWdlID0gYFxuW1RNUFJMMTEwMl0gV29ya2Zsb3cgZmluaXNoZWQgd2hpbGUgYW4gdXBkYXRlIGhhbmRsZXIgd2FzIHN0aWxsIHJ1bm5pbmcuIFRoaXMgbWF5IGhhdmUgaW50ZXJydXB0ZWQgd29yayB0aGF0IHRoZVxudXBkYXRlIGhhbmRsZXIgd2FzIGRvaW5nLCBhbmQgdGhlIGNsaWVudCB0aGF0IHNlbnQgdGhlIHVwZGF0ZSB3aWxsIHJlY2VpdmUgYSAnd29ya2Zsb3cgZXhlY3V0aW9uXG5hbHJlYWR5IGNvbXBsZXRlZCcgUlBDRXJyb3IgaW5zdGVhZCBvZiB0aGUgdXBkYXRlIHJlc3VsdC4gWW91IGNhbiB3YWl0IGZvciBhbGwgdXBkYXRlIGFuZCBzaWduYWxcbmhhbmRsZXJzIHRvIGNvbXBsZXRlIGJ5IHVzaW5nIFxcYGF3YWl0IHdvcmtmbG93LmNvbmRpdGlvbih3b3JrZmxvdy5hbGxIYW5kbGVyc0ZpbmlzaGVkKVxcYC5cbkFsdGVybmF0aXZlbHksIGlmIGJvdGggeW91IGFuZCB0aGUgY2xpZW50cyBzZW5kaW5nIHRoZSB1cGRhdGUgYXJlIG9rYXkgd2l0aCBpbnRlcnJ1cHRpbmcgcnVubmluZyBoYW5kbGVyc1xud2hlbiB0aGUgd29ya2Zsb3cgZmluaXNoZXMsIGFuZCBjYXVzaW5nIGNsaWVudHMgdG8gcmVjZWl2ZSBlcnJvcnMsIHRoZW4geW91IGNhbiBkaXNhYmxlIHRoaXMgd2FybmluZyBieVxucGFzc2luZyBhbiBvcHRpb24gd2hlbiBzZXR0aW5nIHRoZSBoYW5kbGVyOlxuXFxgd29ya2Zsb3cuc2V0SGFuZGxlcihteVVwZGF0ZSwgbXlVcGRhdGVIYW5kbGVyLCB7dW5maW5pc2hlZFBvbGljeTogSGFuZGxlclVuZmluaXNoZWRQb2xpY3kuQUJBTkRPTn0pO1xcYC5gXG4gICAgLnJlcGxhY2UoL1xcbi9nLCAnICcpXG4gICAgLnRyaW0oKTtcblxuICByZXR1cm4gYCR7bWVzc2FnZX0gVGhlIGZvbGxvd2luZyB1cGRhdGVzIHdlcmUgdW5maW5pc2hlZCAoYW5kIHdhcm5pbmdzIHdlcmUgbm90IGRpc2FibGVkIGZvciB0aGVpciBoYW5kbGVyKTogJHtKU09OLnN0cmluZ2lmeShcbiAgICBoYW5kbGVyRXhlY3V0aW9ucy5tYXAoKGV4KSA9PiAoeyBuYW1lOiBleC5uYW1lLCBpZDogZXguaWQgfSkpXG4gICl9YDtcbn1cblxuZnVuY3Rpb24gbWFrZVVuZmluaXNoZWRTaWduYWxIYW5kbGVyTWVzc2FnZShoYW5kbGVyRXhlY3V0aW9uczogTWVzc2FnZUhhbmRsZXJFeGVjdXRpb25bXSk6IHN0cmluZyB7XG4gIGNvbnN0IG1lc3NhZ2UgPSBgXG5bVE1QUkwxMTAyXSBXb3JrZmxvdyBmaW5pc2hlZCB3aGlsZSBhIHNpZ25hbCBoYW5kbGVyIHdhcyBzdGlsbCBydW5uaW5nLiBUaGlzIG1heSBoYXZlIGludGVycnVwdGVkIHdvcmsgdGhhdCB0aGVcbnNpZ25hbCBoYW5kbGVyIHdhcyBkb2luZy4gWW91IGNhbiB3YWl0IGZvciBhbGwgdXBkYXRlIGFuZCBzaWduYWwgaGFuZGxlcnMgdG8gY29tcGxldGUgYnkgdXNpbmdcblxcYGF3YWl0IHdvcmtmbG93LmNvbmRpdGlvbih3b3JrZmxvdy5hbGxIYW5kbGVyc0ZpbmlzaGVkKVxcYC4gQWx0ZXJuYXRpdmVseSwgaWYgYm90aCB5b3UgYW5kIHRoZVxuY2xpZW50cyBzZW5kaW5nIHRoZSB1cGRhdGUgYXJlIG9rYXkgd2l0aCBpbnRlcnJ1cHRpbmcgcnVubmluZyBoYW5kbGVycyB3aGVuIHRoZSB3b3JrZmxvdyBmaW5pc2hlcyxcbnRoZW4geW91IGNhbiBkaXNhYmxlIHRoaXMgd2FybmluZyBieSBwYXNzaW5nIGFuIG9wdGlvbiB3aGVuIHNldHRpbmcgdGhlIGhhbmRsZXI6XG5cXGB3b3JrZmxvdy5zZXRIYW5kbGVyKG15U2lnbmFsLCBteVNpZ25hbEhhbmRsZXIsIHt1bmZpbmlzaGVkUG9saWN5OiBIYW5kbGVyVW5maW5pc2hlZFBvbGljeS5BQkFORE9OfSk7XFxgLmBcblxuICAgIC5yZXBsYWNlKC9cXG4vZywgJyAnKVxuICAgIC50cmltKCk7XG5cbiAgY29uc3QgbmFtZXMgPSBuZXcgTWFwPHN0cmluZywgbnVtYmVyPigpO1xuICBmb3IgKGNvbnN0IGV4IG9mIGhhbmRsZXJFeGVjdXRpb25zKSB7XG4gICAgY29uc3QgY291bnQgPSBuYW1lcy5nZXQoZXgubmFtZSkgfHwgMDtcbiAgICBuYW1lcy5zZXQoZXgubmFtZSwgY291bnQgKyAxKTtcbiAgfVxuXG4gIHJldHVybiBgJHttZXNzYWdlfSBUaGUgZm9sbG93aW5nIHNpZ25hbHMgd2VyZSB1bmZpbmlzaGVkIChhbmQgd2FybmluZ3Mgd2VyZSBub3QgZGlzYWJsZWQgZm9yIHRoZWlyIGhhbmRsZXIpOiAke0pTT04uc3RyaW5naWZ5KFxuICAgIEFycmF5LmZyb20obmFtZXMuZW50cmllcygpKS5tYXAoKFtuYW1lLCBjb3VudF0pID0+ICh7IG5hbWUsIGNvdW50IH0pKVxuICApfWA7XG59XG4iLCJpbXBvcnQgeyBjb21wb3NlSW50ZXJjZXB0b3JzIH0gZnJvbSAnQHRlbXBvcmFsaW8vY29tbW9uL2xpYi9pbnRlcmNlcHRvcnMnO1xuaW1wb3J0IHsgU2RrQ29tcG9uZW50IH0gZnJvbSAnQHRlbXBvcmFsaW8vY29tbW9uJztcbmltcG9ydCB7IHVudHJhY2tQcm9taXNlIH0gZnJvbSAnLi9zdGFjay1oZWxwZXJzJztcbmltcG9ydCB7IHR5cGUgU2luaywgdHlwZSBTaW5rcywgcHJveHlTaW5rcyB9IGZyb20gJy4vc2lua3MnO1xuaW1wb3J0IHsgaXNDYW5jZWxsYXRpb24gfSBmcm9tICcuL2Vycm9ycyc7XG5pbXBvcnQgeyBXb3JrZmxvd0luZm8sIENvbnRpbnVlQXNOZXcgfSBmcm9tICcuL2ludGVyZmFjZXMnO1xuaW1wb3J0IHsgYXNzZXJ0SW5Xb3JrZmxvd0NvbnRleHQgfSBmcm9tICcuL2dsb2JhbC1hdHRyaWJ1dGVzJztcblxuZXhwb3J0IGludGVyZmFjZSBXb3JrZmxvd0xvZ2dlciBleHRlbmRzIFNpbmsge1xuICB0cmFjZShtZXNzYWdlOiBzdHJpbmcsIGF0dHJzPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pOiB2b2lkO1xuICBkZWJ1ZyhtZXNzYWdlOiBzdHJpbmcsIGF0dHJzPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pOiB2b2lkO1xuICBpbmZvKG1lc3NhZ2U6IHN0cmluZywgYXR0cnM/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPik6IHZvaWQ7XG4gIHdhcm4obWVzc2FnZTogc3RyaW5nLCBhdHRycz86IFJlY29yZDxzdHJpbmcsIHVua25vd24+KTogdm9pZDtcbiAgZXJyb3IobWVzc2FnZTogc3RyaW5nLCBhdHRycz86IFJlY29yZDxzdHJpbmcsIHVua25vd24+KTogdm9pZDtcbn1cblxuLyoqXG4gKiBTaW5rIGludGVyZmFjZSBmb3IgZm9yd2FyZGluZyBsb2dzIGZyb20gdGhlIFdvcmtmbG93IHNhbmRib3ggdG8gdGhlIFdvcmtlclxuICpcbiAqIEBkZXByZWNhdGVkIERvIG5vdCB1c2UgTG9nZ2VyU2lua3MgZGlyZWN0bHkuIFRvIGxvZyBmcm9tIFdvcmtmbG93IGNvZGUsIHVzZSB0aGUgYGxvZ2Agb2JqZWN0XG4gKiAgICAgICAgICAgICBleHBvcnRlZCBieSB0aGUgYEB0ZW1wb3JhbGlvL3dvcmtmbG93YCBwYWNrYWdlLiBUbyBjYXB0dXJlIGxvZyBtZXNzYWdlcyBlbWl0dGVkXG4gKiAgICAgICAgICAgICBieSBXb3JrZmxvdyBjb2RlLCBzZXQgdGhlIHtAbGluayBSdW50aW1lLmxvZ2dlcn0gcHJvcGVydHkuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTG9nZ2VyU2lua3NEZXByZWNhdGVkIGV4dGVuZHMgU2lua3Mge1xuICAvKipcbiAgICogQGRlcHJlY2F0ZWQgRG8gbm90IHVzZSBMb2dnZXJTaW5rcyBkaXJlY3RseS4gVG8gbG9nIGZyb20gV29ya2Zsb3cgY29kZSwgdXNlIHRoZSBgbG9nYCBvYmplY3RcbiAgICogICAgICAgICAgICAgZXhwb3J0ZWQgYnkgdGhlIGBAdGVtcG9yYWxpby93b3JrZmxvd2AgcGFja2FnZS4gVG8gY2FwdHVyZSBsb2cgbWVzc2FnZXMgZW1pdHRlZFxuICAgKiAgICAgICAgICAgICBieSBXb3JrZmxvdyBjb2RlLCBzZXQgdGhlIHtAbGluayBSdW50aW1lLmxvZ2dlcn0gcHJvcGVydHkuXG4gICAqL1xuICBkZWZhdWx0V29ya2VyTG9nZ2VyOiBXb3JrZmxvd0xvZ2dlcjtcbn1cblxuLyoqXG4gKiBTaW5rIGludGVyZmFjZSBmb3IgZm9yd2FyZGluZyBsb2dzIGZyb20gdGhlIFdvcmtmbG93IHNhbmRib3ggdG8gdGhlIFdvcmtlclxuICovXG5leHBvcnQgaW50ZXJmYWNlIExvZ2dlclNpbmtzSW50ZXJuYWwgZXh0ZW5kcyBTaW5rcyB7XG4gIF9fdGVtcG9yYWxfbG9nZ2VyOiBXb3JrZmxvd0xvZ2dlcjtcbn1cblxuY29uc3QgbG9nZ2VyU2luayA9IHByb3h5U2lua3M8TG9nZ2VyU2lua3NJbnRlcm5hbD4oKS5fX3RlbXBvcmFsX2xvZ2dlcjtcblxuLyoqXG4gKiBTeW1ib2wgdXNlZCBieSB0aGUgU0RLIGxvZ2dlciB0byBleHRyYWN0IGEgdGltZXN0YW1wIGZyb20gbG9nIGF0dHJpYnV0ZXMuXG4gKiBBbHNvIGRlZmluZWQgaW4gYHdvcmtlci9sb2dnZXIudHNgIC0gaW50ZW50aW9uYWxseSBub3Qgc2hhcmVkLlxuICovXG5jb25zdCBMb2dUaW1lc3RhbXAgPSBTeW1ib2wuZm9yKCdsb2dfdGltZXN0YW1wJyk7XG5cbi8qKlxuICogRGVmYXVsdCB3b3JrZmxvdyBsb2dnZXIuXG4gKlxuICogVGhpcyBsb2dnZXIgaXMgcmVwbGF5LWF3YXJlIGFuZCB3aWxsIG9taXQgbG9nIG1lc3NhZ2VzIG9uIHdvcmtmbG93IHJlcGxheS4gTWVzc2FnZXMgZW1pdHRlZCBieSB0aGlzIGxvZ2dlciBhcmVcbiAqIGZ1bm5lbGxlZCB0aHJvdWdoIGEgc2luayB0aGF0IGZvcndhcmRzIHRoZW0gdG8gdGhlIGxvZ2dlciByZWdpc3RlcmVkIG9uIHtAbGluayBSdW50aW1lLmxvZ2dlcn0uXG4gKlxuICogQXR0cmlidXRlcyBmcm9tIHRoZSBjdXJyZW50IFdvcmtmbG93IEV4ZWN1dGlvbiBjb250ZXh0IGFyZSBhdXRvbWF0aWNhbGx5IGluY2x1ZGVkIGFzIG1ldGFkYXRhIG9uIGV2ZXJ5IGxvZ1xuICogZW50cmllcy4gQW4gZXh0cmEgYHNka0NvbXBvbmVudGAgbWV0YWRhdGEgYXR0cmlidXRlIGlzIGFsc28gYWRkZWQsIHdpdGggdmFsdWUgYHdvcmtmbG93YDsgdGhpcyBjYW4gYmUgdXNlZCBmb3JcbiAqIGZpbmUtZ3JhaW5lZCBmaWx0ZXJpbmcgb2YgbG9nIGVudHJpZXMgZnVydGhlciBkb3duc3RyZWFtLlxuICpcbiAqIFRvIGN1c3RvbWl6ZSBsb2cgYXR0cmlidXRlcywgcmVnaXN0ZXIgYSB7QGxpbmsgV29ya2Zsb3dPdXRib3VuZENhbGxzSW50ZXJjZXB0b3J9IHRoYXQgaW50ZXJjZXB0cyB0aGVcbiAqIGBnZXRMb2dBdHRyaWJ1dGVzKClgIG1ldGhvZC5cbiAqXG4gKiBOb3RpY2UgdGhhdCBzaW5jZSBzaW5rcyBhcmUgdXNlZCB0byBwb3dlciB0aGlzIGxvZ2dlciwgYW55IGxvZyBhdHRyaWJ1dGVzIG11c3QgYmUgdHJhbnNmZXJhYmxlIHZpYSB0aGVcbiAqIHtAbGluayBodHRwczovL25vZGVqcy5vcmcvYXBpL3dvcmtlcl90aHJlYWRzLmh0bWwjd29ya2VyX3RocmVhZHNfcG9ydF9wb3N0bWVzc2FnZV92YWx1ZV90cmFuc2Zlcmxpc3QgfCBwb3N0TWVzc2FnZX1cbiAqIEFQSS5cbiAqXG4gKiBOT1RFOiBTcGVjaWZ5aW5nIGEgY3VzdG9tIGxvZ2dlciB0aHJvdWdoIHtAbGluayBkZWZhdWx0U2lua30gb3IgYnkgbWFudWFsbHkgcmVnaXN0ZXJpbmcgYSBzaW5rIG5hbWVkXG4gKiBgZGVmYXVsdFdvcmtlckxvZ2dlcmAgaGFzIGJlZW4gZGVwcmVjYXRlZC4gUGxlYXNlIHVzZSB7QGxpbmsgUnVudGltZS5sb2dnZXJ9IGluc3RlYWQuXG4gKi9cbmV4cG9ydCBjb25zdCBsb2c6IFdvcmtmbG93TG9nZ2VyID0gT2JqZWN0LmZyb21FbnRyaWVzKFxuICAoWyd0cmFjZScsICdkZWJ1ZycsICdpbmZvJywgJ3dhcm4nLCAnZXJyb3InXSBhcyBBcnJheTxrZXlvZiBXb3JrZmxvd0xvZ2dlcj4pLm1hcCgobGV2ZWwpID0+IHtcbiAgICByZXR1cm4gW1xuICAgICAgbGV2ZWwsXG4gICAgICAobWVzc2FnZTogc3RyaW5nLCBhdHRycz86IFJlY29yZDxzdHJpbmcsIHVua25vd24+KSA9PiB7XG4gICAgICAgIGNvbnN0IGFjdGl2YXRvciA9IGFzc2VydEluV29ya2Zsb3dDb250ZXh0KCdXb3JrZmxvdy5sb2coLi4uKSBtYXkgb25seSBiZSB1c2VkIGZyb20gd29ya2Zsb3cgY29udGV4dC4nKTtcbiAgICAgICAgY29uc3QgZ2V0TG9nQXR0cmlidXRlcyA9IGNvbXBvc2VJbnRlcmNlcHRvcnMoYWN0aXZhdG9yLmludGVyY2VwdG9ycy5vdXRib3VuZCwgJ2dldExvZ0F0dHJpYnV0ZXMnLCAoYSkgPT4gYSk7XG4gICAgICAgIHJldHVybiBsb2dnZXJTaW5rW2xldmVsXShtZXNzYWdlLCB7XG4gICAgICAgICAgLy8gSW5qZWN0IHRoZSBjYWxsIHRpbWUgaW4gbmFub3NlY29uZCByZXNvbHV0aW9uIGFzIGV4cGVjdGVkIGJ5IHRoZSB3b3JrZXIgbG9nZ2VyLlxuICAgICAgICAgIFtMb2dUaW1lc3RhbXBdOiBhY3RpdmF0b3IuZ2V0VGltZU9mRGF5KCksXG4gICAgICAgICAgc2RrQ29tcG9uZW50OiBTZGtDb21wb25lbnQud29ya2Zsb3csXG4gICAgICAgICAgLi4uZ2V0TG9nQXR0cmlidXRlcyh3b3JrZmxvd0xvZ0F0dHJpYnV0ZXMoYWN0aXZhdG9yLmluZm8pKSxcbiAgICAgICAgICAuLi5hdHRycyxcbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgIF07XG4gIH0pXG4pIGFzIGFueTtcblxuZXhwb3J0IGZ1bmN0aW9uIGV4ZWN1dGVXaXRoTGlmZWN5Y2xlTG9nZ2luZyhmbjogKCkgPT4gUHJvbWlzZTx1bmtub3duPik6IFByb21pc2U8dW5rbm93bj4ge1xuICBsb2cuZGVidWcoJ1dvcmtmbG93IHN0YXJ0ZWQnLCB7IHNka0NvbXBvbmVudDogU2RrQ29tcG9uZW50LndvcmtlciB9KTtcbiAgY29uc3QgcCA9IGZuKCkudGhlbihcbiAgICAocmVzKSA9PiB7XG4gICAgICBsb2cuZGVidWcoJ1dvcmtmbG93IGNvbXBsZXRlZCcsIHsgc2RrQ29tcG9uZW50OiBTZGtDb21wb25lbnQud29ya2VyIH0pO1xuICAgICAgcmV0dXJuIHJlcztcbiAgICB9LFxuICAgIChlcnJvcikgPT4ge1xuICAgICAgLy8gQXZvaWQgdXNpbmcgaW5zdGFuY2VvZiBjaGVja3MgaW4gY2FzZSB0aGUgbW9kdWxlcyB0aGV5J3JlIGRlZmluZWQgaW4gbG9hZGVkIG1vcmUgdGhhbiBvbmNlLFxuICAgICAgLy8gZS5nLiBieSBqZXN0IG9yIHdoZW4gbXVsdGlwbGUgdmVyc2lvbnMgYXJlIGluc3RhbGxlZC5cbiAgICAgIGlmICh0eXBlb2YgZXJyb3IgPT09ICdvYmplY3QnICYmIGVycm9yICE9IG51bGwpIHtcbiAgICAgICAgaWYgKGlzQ2FuY2VsbGF0aW9uKGVycm9yKSkge1xuICAgICAgICAgIGxvZy5kZWJ1ZygnV29ya2Zsb3cgY29tcGxldGVkIGFzIGNhbmNlbGxlZCcsIHsgc2RrQ29tcG9uZW50OiBTZGtDb21wb25lbnQud29ya2VyIH0pO1xuICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICB9IGVsc2UgaWYgKGVycm9yIGluc3RhbmNlb2YgQ29udGludWVBc05ldykge1xuICAgICAgICAgIGxvZy5kZWJ1ZygnV29ya2Zsb3cgY29udGludWVkIGFzIG5ldycsIHsgc2RrQ29tcG9uZW50OiBTZGtDb21wb25lbnQud29ya2VyIH0pO1xuICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBsb2cud2FybignV29ya2Zsb3cgZmFpbGVkJywgeyBlcnJvciwgc2RrQ29tcG9uZW50OiBTZGtDb21wb25lbnQud29ya2VyIH0pO1xuICAgICAgdGhyb3cgZXJyb3I7XG4gICAgfVxuICApO1xuICAvLyBBdm9pZCBzaG93aW5nIHRoaXMgaW50ZXJjZXB0b3IgaW4gc3RhY2sgdHJhY2UgcXVlcnlcbiAgdW50cmFja1Byb21pc2UocCk7XG4gIHJldHVybiBwO1xufVxuXG4vKipcbiAqIFJldHVybnMgYSBtYXAgb2YgYXR0cmlidXRlcyB0byBiZSBzZXQgX2J5IGRlZmF1bHRfIG9uIGxvZyBtZXNzYWdlcyBmb3IgYSBnaXZlbiBXb3JrZmxvdy5cbiAqIE5vdGUgdGhhdCB0aGlzIGZ1bmN0aW9uIG1heSBiZSBjYWxsZWQgZnJvbSBvdXRzaWRlIG9mIHRoZSBXb3JrZmxvdyBjb250ZXh0IChlZy4gYnkgdGhlIHdvcmtlciBpdHNlbGYpLlxuICovXG5leHBvcnQgZnVuY3Rpb24gd29ya2Zsb3dMb2dBdHRyaWJ1dGVzKGluZm86IFdvcmtmbG93SW5mbyk6IFJlY29yZDxzdHJpbmcsIHVua25vd24+IHtcbiAgcmV0dXJuIHtcbiAgICBuYW1lc3BhY2U6IGluZm8ubmFtZXNwYWNlLFxuICAgIHRhc2tRdWV1ZTogaW5mby50YXNrUXVldWUsXG4gICAgd29ya2Zsb3dJZDogaW5mby53b3JrZmxvd0lkLFxuICAgIHJ1bklkOiBpbmZvLnJ1bklkLFxuICAgIHdvcmtmbG93VHlwZTogaW5mby53b3JrZmxvd1R5cGUsXG4gIH07XG59XG4iLCIvLyAuLi9wYWNrYWdlLmpzb24gaXMgb3V0c2lkZSBvZiB0aGUgVFMgcHJvamVjdCByb290RGlyIHdoaWNoIGNhdXNlcyBUUyB0byBjb21wbGFpbiBhYm91dCB0aGlzIGltcG9ydC5cbi8vIFdlIGRvIG5vdCB3YW50IHRvIGNoYW5nZSB0aGUgcm9vdERpciBiZWNhdXNlIGl0IG1lc3NlcyB1cCB0aGUgb3V0cHV0IHN0cnVjdHVyZS5cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvYmFuLXRzLWNvbW1lbnRcbi8vIEB0cy1pZ25vcmVcbmltcG9ydCBwa2cgZnJvbSAnLi4vcGFja2FnZS5qc29uJztcblxuZXhwb3J0IGRlZmF1bHQgcGtnIGFzIHsgbmFtZTogc3RyaW5nOyB2ZXJzaW9uOiBzdHJpbmcgfTtcbiIsIi8qKlxuICogVHlwZSBkZWZpbml0aW9ucyBmb3IgdGhlIFdvcmtmbG93IGVuZCBvZiB0aGUgc2lua3MgbWVjaGFuaXNtLlxuICpcbiAqIFNpbmtzIGFyZSBhIG1lY2hhbmlzbSBmb3IgZXhwb3J0aW5nIGRhdGEgZnJvbSB0aGUgV29ya2Zsb3cgaXNvbGF0ZSB0byB0aGVcbiAqIE5vZGUuanMgZW52aXJvbm1lbnQsIHRoZXkgYXJlIG5lY2Vzc2FyeSBiZWNhdXNlIHRoZSBXb3JrZmxvdyBoYXMgbm8gd2F5IHRvXG4gKiBjb21tdW5pY2F0ZSB3aXRoIHRoZSBvdXRzaWRlIFdvcmxkLlxuICpcbiAqIFNpbmtzIGFyZSB0eXBpY2FsbHkgdXNlZCBmb3IgZXhwb3J0aW5nIGxvZ3MsIG1ldHJpY3MgYW5kIHRyYWNlcyBvdXQgZnJvbSB0aGVcbiAqIFdvcmtmbG93LlxuICpcbiAqIFNpbmsgZnVuY3Rpb25zIG1heSBub3QgcmV0dXJuIHZhbHVlcyB0byB0aGUgV29ya2Zsb3cgaW4gb3JkZXIgdG8gcHJldmVudFxuICogYnJlYWtpbmcgZGV0ZXJtaW5pc20uXG4gKlxuICogQG1vZHVsZVxuICovXG5cbmltcG9ydCB7IFdvcmtmbG93SW5mbyB9IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5pbXBvcnQgeyBhc3NlcnRJbldvcmtmbG93Q29udGV4dCB9IGZyb20gJy4vZ2xvYmFsLWF0dHJpYnV0ZXMnO1xuXG4vKipcbiAqIEFueSBmdW5jdGlvbiBzaWduYXR1cmUgY2FuIGJlIHVzZWQgZm9yIFNpbmsgZnVuY3Rpb25zIGFzIGxvbmcgYXMgdGhlIHJldHVybiB0eXBlIGlzIGB2b2lkYC5cbiAqXG4gKiBXaGVuIGNhbGxpbmcgYSBTaW5rIGZ1bmN0aW9uLCBhcmd1bWVudHMgYXJlIGNvcGllZCBmcm9tIHRoZSBXb3JrZmxvdyBpc29sYXRlIHRvIHRoZSBOb2RlLmpzIGVudmlyb25tZW50IHVzaW5nXG4gKiB7QGxpbmsgaHR0cHM6Ly9ub2RlanMub3JnL2FwaS93b3JrZXJfdGhyZWFkcy5odG1sI3dvcmtlcl90aHJlYWRzX3BvcnRfcG9zdG1lc3NhZ2VfdmFsdWVfdHJhbnNmZXJsaXN0IHwgcG9zdE1lc3NhZ2V9LlxuXG4gKiBUaGlzIGNvbnN0cmFpbnMgdGhlIGFyZ3VtZW50IHR5cGVzIHRvIHByaW1pdGl2ZXMgKGV4Y2x1ZGluZyBTeW1ib2xzKS5cbiAqL1xuZXhwb3J0IHR5cGUgU2lua0Z1bmN0aW9uID0gKC4uLmFyZ3M6IGFueVtdKSA9PiB2b2lkO1xuXG4vKiogQSBtYXBwaW5nIG9mIG5hbWUgdG8gZnVuY3Rpb24sIGRlZmluZXMgYSBzaW5nbGUgc2luayAoZS5nLiBsb2dnZXIpICovXG5leHBvcnQgdHlwZSBTaW5rID0gUmVjb3JkPHN0cmluZywgU2lua0Z1bmN0aW9uPjtcbi8qKlxuICogV29ya2Zsb3cgU2luayBhcmUgYSBtYXBwaW5nIG9mIG5hbWUgdG8ge0BsaW5rIFNpbmt9XG4gKi9cbmV4cG9ydCB0eXBlIFNpbmtzID0gUmVjb3JkPHN0cmluZywgU2luaz47XG5cbi8qKlxuICogQ2FsbCBpbmZvcm1hdGlvbiBmb3IgYSBTaW5rXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgU2lua0NhbGwge1xuICBpZmFjZU5hbWU6IHN0cmluZztcbiAgZm5OYW1lOiBzdHJpbmc7XG4gIGFyZ3M6IGFueVtdO1xuICB3b3JrZmxvd0luZm86IFdvcmtmbG93SW5mbztcbn1cblxuLyoqXG4gKiBHZXQgYSByZWZlcmVuY2UgdG8gU2lua3MgZm9yIGV4cG9ydGluZyBkYXRhIG91dCBvZiB0aGUgV29ya2Zsb3cuXG4gKlxuICogVGhlc2UgU2lua3MgKiptdXN0KiogYmUgcmVnaXN0ZXJlZCB3aXRoIHRoZSBXb3JrZXIgaW4gb3JkZXIgZm9yIHRoaXNcbiAqIG1lY2hhbmlzbSB0byB3b3JrLlxuICpcbiAqIEBleGFtcGxlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgcHJveHlTaW5rcywgU2lua3MgfSBmcm9tICdAdGVtcG9yYWxpby93b3JrZmxvdyc7XG4gKlxuICogaW50ZXJmYWNlIE15U2lua3MgZXh0ZW5kcyBTaW5rcyB7XG4gKiAgIGxvZ2dlcjoge1xuICogICAgIGluZm8obWVzc2FnZTogc3RyaW5nKTogdm9pZDtcbiAqICAgICBlcnJvcihtZXNzYWdlOiBzdHJpbmcpOiB2b2lkO1xuICogICB9O1xuICogfVxuICpcbiAqIGNvbnN0IHsgbG9nZ2VyIH0gPSBwcm94eVNpbmtzPE15RGVwZW5kZW5jaWVzPigpO1xuICogbG9nZ2VyLmluZm8oJ3NldHRpbmcgdXAnKTtcbiAqXG4gKiBleHBvcnQgZnVuY3Rpb24gbXlXb3JrZmxvdygpIHtcbiAqICAgcmV0dXJuIHtcbiAqICAgICBhc3luYyBleGVjdXRlKCkge1xuICogICAgICAgbG9nZ2VyLmluZm8oXCJoZXkgaG9cIik7XG4gKiAgICAgICBsb2dnZXIuZXJyb3IoXCJsZXRzIGdvXCIpO1xuICogICAgIH1cbiAqICAgfTtcbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gcHJveHlTaW5rczxUIGV4dGVuZHMgU2lua3M+KCk6IFQge1xuICByZXR1cm4gbmV3IFByb3h5KFxuICAgIHt9LFxuICAgIHtcbiAgICAgIGdldChfLCBpZmFjZU5hbWUpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm94eShcbiAgICAgICAgICB7fSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBnZXQoXywgZm5OYW1lKSB7XG4gICAgICAgICAgICAgIHJldHVybiAoLi4uYXJnczogYW55W10pID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBhY3RpdmF0b3IgPSBhc3NlcnRJbldvcmtmbG93Q29udGV4dChcbiAgICAgICAgICAgICAgICAgICdQcm94aWVkIHNpbmtzIGZ1bmN0aW9ucyBtYXkgb25seSBiZSB1c2VkIGZyb20gYSBXb3JrZmxvdyBFeGVjdXRpb24uJ1xuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgYWN0aXZhdG9yLnNpbmtDYWxscy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgIGlmYWNlTmFtZTogaWZhY2VOYW1lIGFzIHN0cmluZyxcbiAgICAgICAgICAgICAgICAgIGZuTmFtZTogZm5OYW1lIGFzIHN0cmluZyxcbiAgICAgICAgICAgICAgICAgIC8vIFNpbmsgZnVuY3Rpb24gZG9lc24ndCBnZXQgY2FsbGVkIGltbWVkaWF0ZWx5LiBNYWtlIGEgY2xvbmUgb2YgdGhlIHNpbmsncyBhcmdzLCBzbyB0aGF0IGZ1cnRoZXIgbXV0YXRpb25zXG4gICAgICAgICAgICAgICAgICAvLyB0byB0aGVzZSBvYmplY3RzIGRvbid0IGNvcnJ1cHQgdGhlIGFyZ3MgdGhhdCB0aGUgc2luayBmdW5jdGlvbiB3aWxsIHJlY2VpdmUuIE9ubHkgYXZhaWxhYmxlIGZyb20gbm9kZSAxNy5cbiAgICAgICAgICAgICAgICAgIGFyZ3M6IChnbG9iYWxUaGlzIGFzIGFueSkuc3RydWN0dXJlZENsb25lID8gKGdsb2JhbFRoaXMgYXMgYW55KS5zdHJ1Y3R1cmVkQ2xvbmUoYXJncykgOiBhcmdzLFxuICAgICAgICAgICAgICAgICAgLy8gYWN0aXZhdG9yLmluZm8gaXMgaW50ZXJuYWxseSBjb3B5LW9uLXdyaXRlLiBUaGlzIGVuc3VyZSB0aGF0IGFueSBmdXJ0aGVyIG11dGF0aW9uc1xuICAgICAgICAgICAgICAgICAgLy8gdG8gdGhlIHdvcmtmbG93IHN0YXRlIGluIHRoZSBjb250ZXh0IG9mIHRoZSBwcmVzZW50IGFjdGl2YXRpb24gd2lsbCBub3QgY29ycnVwdCB0aGVcbiAgICAgICAgICAgICAgICAgIC8vIHdvcmtmbG93SW5mbyBzdGF0ZSB0aGF0IGdldHMgcGFzc2VkIHdoZW4gdGhlIHNpbmsgZnVuY3Rpb24gYWN0dWFsbHkgZ2V0cyBjYWxsZWQuXG4gICAgICAgICAgICAgICAgICB3b3JrZmxvd0luZm86IGFjdGl2YXRvci5pbmZvLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgICB9LFxuICAgIH1cbiAgKSBhcyBhbnk7XG59XG4iLCJpbXBvcnQgeyBtYXliZUdldEFjdGl2YXRvclVudHlwZWQgfSBmcm9tICcuL2dsb2JhbC1hdHRyaWJ1dGVzJztcbmltcG9ydCB0eXBlIHsgUHJvbWlzZVN0YWNrU3RvcmUgfSBmcm9tICcuL2ludGVybmFscyc7XG5cbi8qKlxuICogSGVscGVyIGZ1bmN0aW9uIHRvIHJlbW92ZSBhIHByb21pc2UgZnJvbSBiZWluZyB0cmFja2VkIGZvciBzdGFjayB0cmFjZSBxdWVyeSBwdXJwb3Nlc1xuICovXG5leHBvcnQgZnVuY3Rpb24gdW50cmFja1Byb21pc2UocHJvbWlzZTogUHJvbWlzZTx1bmtub3duPik6IHZvaWQge1xuICBjb25zdCBzdG9yZSA9IChtYXliZUdldEFjdGl2YXRvclVudHlwZWQoKSBhcyBhbnkpPy5wcm9taXNlU3RhY2tTdG9yZSBhcyBQcm9taXNlU3RhY2tTdG9yZSB8IHVuZGVmaW5lZDtcbiAgaWYgKCFzdG9yZSkgcmV0dXJuO1xuICBzdG9yZS5jaGlsZFRvUGFyZW50LmRlbGV0ZShwcm9taXNlKTtcbiAgc3RvcmUucHJvbWlzZVRvU3RhY2suZGVsZXRlKHByb21pc2UpO1xufVxuIiwiaW1wb3J0IHsgQ2FuY2VsbGF0aW9uU2NvcGUgfSBmcm9tICcuL2NhbmNlbGxhdGlvbi1zY29wZSc7XG5pbXBvcnQgeyB1bnRyYWNrUHJvbWlzZSB9IGZyb20gJy4vc3RhY2staGVscGVycyc7XG5cbi8qKlxuICogQSBgUHJvbWlzZUxpa2VgIGhlbHBlciB3aGljaCBleHBvc2VzIGl0cyBgcmVzb2x2ZWAgYW5kIGByZWplY3RgIG1ldGhvZHMuXG4gKlxuICogVHJpZ2dlciBpcyBDYW5jZWxsYXRpb25TY29wZS1hd2FyZTogaXQgaXMgbGlua2VkIHRvIHRoZSBjdXJyZW50IHNjb3BlIG9uXG4gKiBjb25zdHJ1Y3Rpb24gYW5kIHRocm93cyB3aGVuIHRoYXQgc2NvcGUgaXMgY2FuY2VsbGVkLlxuICpcbiAqIFVzZWZ1bCBmb3IgZS5nLiB3YWl0aW5nIGZvciB1bmJsb2NraW5nIGEgV29ya2Zsb3cgZnJvbSBhIFNpZ25hbC5cbiAqXG4gKiBAZXhhbXBsZVxuICogPCEtLVNOSVBTVEFSVCB0eXBlc2NyaXB0LXRyaWdnZXItd29ya2Zsb3ctLT5cbiAqIDwhLS1TTklQRU5ELS0+XG4gKi9cbmV4cG9ydCBjbGFzcyBUcmlnZ2VyPFQ+IGltcGxlbWVudHMgUHJvbWlzZUxpa2U8VD4ge1xuICAvLyBUeXBlc2NyaXB0IGRvZXMgbm90IHJlYWxpemUgdGhhdCB0aGUgcHJvbWlzZSBleGVjdXRvciBpcyBydW4gc3luY2hyb25vdXNseSBpbiB0aGUgY29uc3RydWN0b3JcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9iYW4tdHMtY29tbWVudFxuICAvLyBAdHMtaWdub3JlXG4gIHB1YmxpYyByZWFkb25seSByZXNvbHZlOiAodmFsdWU6IFQgfCBQcm9taXNlTGlrZTxUPikgPT4gdm9pZDtcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9iYW4tdHMtY29tbWVudFxuICAvLyBAdHMtaWdub3JlXG4gIHB1YmxpYyByZWFkb25seSByZWplY3Q6IChyZWFzb24/OiBhbnkpID0+IHZvaWQ7XG4gIHByb3RlY3RlZCByZWFkb25seSBwcm9taXNlOiBQcm9taXNlPFQ+O1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMucHJvbWlzZSA9IG5ldyBQcm9taXNlPFQ+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IHNjb3BlID0gQ2FuY2VsbGF0aW9uU2NvcGUuY3VycmVudCgpO1xuICAgICAgaWYgKHNjb3BlLmNhbmNlbGxhYmxlKSB7XG4gICAgICAgIHVudHJhY2tQcm9taXNlKHNjb3BlLmNhbmNlbFJlcXVlc3RlZC5jYXRjaChyZWplY3QpKTtcbiAgICAgIH1cbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvYmFuLXRzLWNvbW1lbnRcbiAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgIHRoaXMucmVzb2x2ZSA9IHJlc29sdmU7XG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L2Jhbi10cy1jb21tZW50XG4gICAgICAvLyBAdHMtaWdub3JlXG4gICAgICB0aGlzLnJlamVjdCA9IHJlamVjdDtcbiAgICB9KTtcbiAgICAvLyBBdm9pZCB1bmhhbmRsZWQgcmVqZWN0aW9uc1xuICAgIHVudHJhY2tQcm9taXNlKHRoaXMucHJvbWlzZS5jYXRjaCgoKSA9PiB1bmRlZmluZWQpKTtcbiAgfVxuXG4gIHRoZW48VFJlc3VsdDEgPSBULCBUUmVzdWx0MiA9IG5ldmVyPihcbiAgICBvbmZ1bGZpbGxlZD86ICgodmFsdWU6IFQpID0+IFRSZXN1bHQxIHwgUHJvbWlzZUxpa2U8VFJlc3VsdDE+KSB8IHVuZGVmaW5lZCB8IG51bGwsXG4gICAgb25yZWplY3RlZD86ICgocmVhc29uOiBhbnkpID0+IFRSZXN1bHQyIHwgUHJvbWlzZUxpa2U8VFJlc3VsdDI+KSB8IHVuZGVmaW5lZCB8IG51bGxcbiAgKTogUHJvbWlzZUxpa2U8VFJlc3VsdDEgfCBUUmVzdWx0Mj4ge1xuICAgIHJldHVybiB0aGlzLnByb21pc2UudGhlbihvbmZ1bGZpbGxlZCwgb25yZWplY3RlZCk7XG4gIH1cbn1cbiIsImltcG9ydCB0eXBlIHsgQXN5bmNMb2NhbFN0b3JhZ2UgYXMgQUxTIH0gZnJvbSAnbm9kZTphc3luY19ob29rcyc7XG5cbi8qKlxuICogT3B0aW9uIGZvciBjb25zdHJ1Y3RpbmcgYSBVcGRhdGVTY29wZVxuICovXG5leHBvcnQgaW50ZXJmYWNlIFVwZGF0ZVNjb3BlT3B0aW9ucyB7XG4gIC8qKlxuICAgKiAgQSB3b3JrZmxvdy11bmlxdWUgaWRlbnRpZmllciBmb3IgdGhpcyB1cGRhdGUuXG4gICAqL1xuICBpZDogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiAgVGhlIHVwZGF0ZSB0eXBlIG5hbWUuXG4gICAqL1xuICBuYW1lOiBzdHJpbmc7XG59XG5cbi8vIEFzeW5jTG9jYWxTdG9yYWdlIGlzIGluamVjdGVkIHZpYSB2bSBtb2R1bGUgaW50byBnbG9iYWwgc2NvcGUuXG4vLyBJbiBjYXNlIFdvcmtmbG93IGNvZGUgaXMgaW1wb3J0ZWQgaW4gTm9kZS5qcyBjb250ZXh0LCByZXBsYWNlIHdpdGggYW4gZW1wdHkgY2xhc3MuXG5leHBvcnQgY29uc3QgQXN5bmNMb2NhbFN0b3JhZ2U6IG5ldyA8VD4oKSA9PiBBTFM8VD4gPSAoZ2xvYmFsVGhpcyBhcyBhbnkpLkFzeW5jTG9jYWxTdG9yYWdlID8/IGNsYXNzIHt9O1xuXG5leHBvcnQgY2xhc3MgVXBkYXRlU2NvcGUge1xuICAvKipcbiAgICogIEEgd29ya2Zsb3ctdW5pcXVlIGlkZW50aWZpZXIgZm9yIHRoaXMgdXBkYXRlLlxuICAgKi9cbiAgcHVibGljIHJlYWRvbmx5IGlkOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqICBUaGUgdXBkYXRlIHR5cGUgbmFtZS5cbiAgICovXG4gIHB1YmxpYyByZWFkb25seSBuYW1lOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3Iob3B0aW9uczogVXBkYXRlU2NvcGVPcHRpb25zKSB7XG4gICAgdGhpcy5pZCA9IG9wdGlvbnMuaWQ7XG4gICAgdGhpcy5uYW1lID0gb3B0aW9ucy5uYW1lO1xuICB9XG5cbiAgLyoqXG4gICAqIEFjdGl2YXRlIHRoZSBzY29wZSBhcyBjdXJyZW50IGFuZCBydW4gdGhlIHVwZGF0ZSBoYW5kbGVyIGBmbmAuXG4gICAqXG4gICAqIEByZXR1cm4gdGhlIHJlc3VsdCBvZiBgZm5gXG4gICAqL1xuICBydW48VD4oZm46ICgpID0+IFByb21pc2U8VD4pOiBQcm9taXNlPFQ+IHtcbiAgICByZXR1cm4gc3RvcmFnZS5ydW4odGhpcywgZm4pO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgY3VycmVudCBcImFjdGl2ZVwiIHVwZGF0ZSBzY29wZS5cbiAgICovXG4gIHN0YXRpYyBjdXJyZW50KCk6IFVwZGF0ZVNjb3BlIHwgdW5kZWZpbmVkIHtcbiAgICByZXR1cm4gc3RvcmFnZS5nZXRTdG9yZSgpO1xuICB9XG5cbiAgLyoqIEFsaWFzIHRvIGBuZXcgVXBkYXRlU2NvcGUoeyBpZCwgbmFtZSB9KS5ydW4oZm4pYCAqL1xuICBzdGF0aWMgdXBkYXRlV2l0aEluZm88VD4oaWQ6IHN0cmluZywgbmFtZTogc3RyaW5nLCBmbjogKCkgPT4gUHJvbWlzZTxUPik6IFByb21pc2U8VD4ge1xuICAgIHJldHVybiBuZXcgdGhpcyh7IGlkLCBuYW1lIH0pLnJ1bihmbik7XG4gIH1cbn1cblxuY29uc3Qgc3RvcmFnZSA9IG5ldyBBc3luY0xvY2FsU3RvcmFnZTxVcGRhdGVTY29wZT4oKTtcblxuLyoqXG4gKiBEaXNhYmxlIHRoZSBhc3luYyBsb2NhbCBzdG9yYWdlIGZvciB1cGRhdGVzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZGlzYWJsZVVwZGF0ZVN0b3JhZ2UoKTogdm9pZCB7XG4gIHN0b3JhZ2UuZGlzYWJsZSgpO1xufVxuIiwiLyoqXG4gKiBFeHBvcnRlZCBmdW5jdGlvbnMgZm9yIHRoZSBXb3JrZXIgdG8gaW50ZXJhY3Qgd2l0aCB0aGUgV29ya2Zsb3cgaXNvbGF0ZVxuICpcbiAqIEBtb2R1bGVcbiAqL1xuaW1wb3J0IHsgSWxsZWdhbFN0YXRlRXJyb3IgfSBmcm9tICdAdGVtcG9yYWxpby9jb21tb24nO1xuaW1wb3J0IHsgY29tcG9zZUludGVyY2VwdG9ycyB9IGZyb20gJ0B0ZW1wb3JhbGlvL2NvbW1vbi9saWIvaW50ZXJjZXB0b3JzJztcbmltcG9ydCB7IGNvcmVzZGsgfSBmcm9tICdAdGVtcG9yYWxpby9wcm90byc7XG5pbXBvcnQgeyBkaXNhYmxlU3RvcmFnZSB9IGZyb20gJy4vY2FuY2VsbGF0aW9uLXNjb3BlJztcbmltcG9ydCB7IGRpc2FibGVVcGRhdGVTdG9yYWdlIH0gZnJvbSAnLi91cGRhdGUtc2NvcGUnO1xuaW1wb3J0IHsgV29ya2Zsb3dJbnRlcmNlcHRvcnNGYWN0b3J5IH0gZnJvbSAnLi9pbnRlcmNlcHRvcnMnO1xuaW1wb3J0IHsgV29ya2Zsb3dDcmVhdGVPcHRpb25zSW50ZXJuYWwgfSBmcm9tICcuL2ludGVyZmFjZXMnO1xuaW1wb3J0IHsgQWN0aXZhdG9yIH0gZnJvbSAnLi9pbnRlcm5hbHMnO1xuaW1wb3J0IHsgc2V0QWN0aXZhdG9yVW50eXBlZCwgZ2V0QWN0aXZhdG9yIH0gZnJvbSAnLi9nbG9iYWwtYXR0cmlidXRlcyc7XG5cbi8vIEV4cG9ydCB0aGUgdHlwZSBmb3IgdXNlIG9uIHRoZSBcIndvcmtlclwiIHNpZGVcbmV4cG9ydCB7IFByb21pc2VTdGFja1N0b3JlIH0gZnJvbSAnLi9pbnRlcm5hbHMnO1xuXG5jb25zdCBnbG9iYWwgPSBnbG9iYWxUaGlzIGFzIGFueTtcbmNvbnN0IE9yaWdpbmFsRGF0ZSA9IGdsb2JhbFRoaXMuRGF0ZTtcblxuLyoqXG4gKiBJbml0aWFsaXplIHRoZSBpc29sYXRlIHJ1bnRpbWUuXG4gKlxuICogU2V0cyByZXF1aXJlZCBpbnRlcm5hbCBzdGF0ZSBhbmQgaW5zdGFudGlhdGVzIHRoZSB3b3JrZmxvdyBhbmQgaW50ZXJjZXB0b3JzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gaW5pdFJ1bnRpbWUob3B0aW9uczogV29ya2Zsb3dDcmVhdGVPcHRpb25zSW50ZXJuYWwpOiB2b2lkIHtcbiAgY29uc3QgYWN0aXZhdG9yID0gbmV3IEFjdGl2YXRvcih7XG4gICAgLi4ub3B0aW9ucyxcbiAgICBpbmZvOiBmaXhQcm90b3R5cGVzKHtcbiAgICAgIC4uLm9wdGlvbnMuaW5mbyxcbiAgICAgIHVuc2FmZTogeyAuLi5vcHRpb25zLmluZm8udW5zYWZlLCBub3c6IE9yaWdpbmFsRGF0ZS5ub3cgfSxcbiAgICB9KSxcbiAgfSk7XG4gIC8vIFRoZXJlJ3Mgb25lIGFjdGl2YXRvciBwZXIgd29ya2Zsb3cgaW5zdGFuY2UsIHNldCBpdCBnbG9iYWxseSBvbiB0aGUgY29udGV4dC5cbiAgLy8gV2UgZG8gdGhpcyBiZWZvcmUgaW1wb3J0aW5nIGFueSB1c2VyIGNvZGUgc28gdXNlciBjb2RlIGNhbiBzdGF0aWNhbGx5IHJlZmVyZW5jZSBAdGVtcG9yYWxpby93b3JrZmxvdyBmdW5jdGlvbnNcbiAgLy8gYXMgd2VsbCBhcyBEYXRlIGFuZCBNYXRoLnJhbmRvbS5cbiAgc2V0QWN0aXZhdG9yVW50eXBlZChhY3RpdmF0b3IpO1xuXG4gIC8vIHdlYnBhY2sgYWxpYXMgdG8gcGF5bG9hZENvbnZlcnRlclBhdGhcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby12YXItcmVxdWlyZXNcbiAgY29uc3QgY3VzdG9tUGF5bG9hZENvbnZlcnRlciA9IHJlcXVpcmUoJ19fdGVtcG9yYWxfY3VzdG9tX3BheWxvYWRfY29udmVydGVyJykucGF5bG9hZENvbnZlcnRlcjtcbiAgLy8gVGhlIGBwYXlsb2FkQ29udmVydGVyYCBleHBvcnQgaXMgdmFsaWRhdGVkIGluIHRoZSBXb3JrZXJcbiAgaWYgKGN1c3RvbVBheWxvYWRDb252ZXJ0ZXIgIT0gbnVsbCkge1xuICAgIGFjdGl2YXRvci5wYXlsb2FkQ29udmVydGVyID0gY3VzdG9tUGF5bG9hZENvbnZlcnRlcjtcbiAgfVxuICAvLyB3ZWJwYWNrIGFsaWFzIHRvIGZhaWx1cmVDb252ZXJ0ZXJQYXRoXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdmFyLXJlcXVpcmVzXG4gIGNvbnN0IGN1c3RvbUZhaWx1cmVDb252ZXJ0ZXIgPSByZXF1aXJlKCdfX3RlbXBvcmFsX2N1c3RvbV9mYWlsdXJlX2NvbnZlcnRlcicpLmZhaWx1cmVDb252ZXJ0ZXI7XG4gIC8vIFRoZSBgZmFpbHVyZUNvbnZlcnRlcmAgZXhwb3J0IGlzIHZhbGlkYXRlZCBpbiB0aGUgV29ya2VyXG4gIGlmIChjdXN0b21GYWlsdXJlQ29udmVydGVyICE9IG51bGwpIHtcbiAgICBhY3RpdmF0b3IuZmFpbHVyZUNvbnZlcnRlciA9IGN1c3RvbUZhaWx1cmVDb252ZXJ0ZXI7XG4gIH1cblxuICBjb25zdCB7IGltcG9ydFdvcmtmbG93cywgaW1wb3J0SW50ZXJjZXB0b3JzIH0gPSBnbG9iYWwuX19URU1QT1JBTF9fO1xuICBpZiAoaW1wb3J0V29ya2Zsb3dzID09PSB1bmRlZmluZWQgfHwgaW1wb3J0SW50ZXJjZXB0b3JzID09PSB1bmRlZmluZWQpIHtcbiAgICB0aHJvdyBuZXcgSWxsZWdhbFN0YXRlRXJyb3IoJ1dvcmtmbG93IGJ1bmRsZSBkaWQgbm90IHJlZ2lzdGVyIGltcG9ydCBob29rcycpO1xuICB9XG5cbiAgY29uc3QgaW50ZXJjZXB0b3JzID0gaW1wb3J0SW50ZXJjZXB0b3JzKCk7XG4gIGZvciAoY29uc3QgbW9kIG9mIGludGVyY2VwdG9ycykge1xuICAgIGNvbnN0IGZhY3Rvcnk6IFdvcmtmbG93SW50ZXJjZXB0b3JzRmFjdG9yeSA9IG1vZC5pbnRlcmNlcHRvcnM7XG4gICAgaWYgKGZhY3RvcnkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgaWYgKHR5cGVvZiBmYWN0b3J5ICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYEZhaWxlZCB0byBpbml0aWFsaXplIHdvcmtmbG93cyBpbnRlcmNlcHRvcnM6IGV4cGVjdGVkIGEgZnVuY3Rpb24sIGJ1dCBnb3Q6ICcke2ZhY3Rvcnl9J2ApO1xuICAgICAgfVxuICAgICAgY29uc3QgaW50ZXJjZXB0b3JzID0gZmFjdG9yeSgpO1xuICAgICAgYWN0aXZhdG9yLmludGVyY2VwdG9ycy5pbmJvdW5kLnB1c2goLi4uKGludGVyY2VwdG9ycy5pbmJvdW5kID8/IFtdKSk7XG4gICAgICBhY3RpdmF0b3IuaW50ZXJjZXB0b3JzLm91dGJvdW5kLnB1c2goLi4uKGludGVyY2VwdG9ycy5vdXRib3VuZCA/PyBbXSkpO1xuICAgICAgYWN0aXZhdG9yLmludGVyY2VwdG9ycy5pbnRlcm5hbHMucHVzaCguLi4oaW50ZXJjZXB0b3JzLmludGVybmFscyA/PyBbXSkpO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IG1vZCA9IGltcG9ydFdvcmtmbG93cygpO1xuICBjb25zdCB3b3JrZmxvd0ZuID0gbW9kW2FjdGl2YXRvci5pbmZvLndvcmtmbG93VHlwZV07XG4gIGNvbnN0IGRlZmF1bHRXb3JrZmxvd0ZuID0gbW9kWydkZWZhdWx0J107XG5cbiAgaWYgKHR5cGVvZiB3b3JrZmxvd0ZuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgYWN0aXZhdG9yLndvcmtmbG93ID0gd29ya2Zsb3dGbjtcbiAgfSBlbHNlIGlmICh0eXBlb2YgZGVmYXVsdFdvcmtmbG93Rm4gPT09ICdmdW5jdGlvbicpIHtcbiAgICBhY3RpdmF0b3Iud29ya2Zsb3cgPSBkZWZhdWx0V29ya2Zsb3dGbjtcbiAgfSBlbHNlIHtcbiAgICBjb25zdCBkZXRhaWxzID1cbiAgICAgIHdvcmtmbG93Rm4gPT09IHVuZGVmaW5lZFxuICAgICAgICA/ICdubyBzdWNoIGZ1bmN0aW9uIGlzIGV4cG9ydGVkIGJ5IHRoZSB3b3JrZmxvdyBidW5kbGUnXG4gICAgICAgIDogYGV4cGVjdGVkIGEgZnVuY3Rpb24sIGJ1dCBnb3Q6ICcke3R5cGVvZiB3b3JrZmxvd0ZufSdgO1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYEZhaWxlZCB0byBpbml0aWFsaXplIHdvcmtmbG93IG9mIHR5cGUgJyR7YWN0aXZhdG9yLmluZm8ud29ya2Zsb3dUeXBlfSc6ICR7ZGV0YWlsc31gKTtcbiAgfVxufVxuXG4vKipcbiAqIE9iamVjdHMgdHJhbnNmZXJlZCB0byB0aGUgVk0gZnJvbSBvdXRzaWRlIGhhdmUgcHJvdG90eXBlcyBiZWxvbmdpbmcgdG8gdGhlXG4gKiBvdXRlciBjb250ZXh0LCB3aGljaCBtZWFucyB0aGF0IGluc3RhbmNlb2Ygd29uJ3Qgd29yayBpbnNpZGUgdGhlIFZNLiBUaGlzXG4gKiBmdW5jdGlvbiByZWN1cnNpdmVseSB3YWxrcyBvdmVyIHRoZSBjb250ZW50IG9mIGFuIG9iamVjdCwgYW5kIHJlY3JlYXRlIHNvbWVcbiAqIG9mIHRoZXNlIG9iamVjdHMgKG5vdGFibHkgQXJyYXksIERhdGUgYW5kIE9iamVjdHMpLlxuICovXG5mdW5jdGlvbiBmaXhQcm90b3R5cGVzPFg+KG9iajogWCk6IFgge1xuICBpZiAob2JqICE9IG51bGwgJiYgdHlwZW9mIG9iaiA9PT0gJ29iamVjdCcpIHtcbiAgICBzd2l0Y2ggKE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmopPy5jb25zdHJ1Y3Rvcj8ubmFtZSkge1xuICAgICAgY2FzZSAnQXJyYXknOlxuICAgICAgICByZXR1cm4gQXJyYXkuZnJvbSgob2JqIGFzIEFycmF5PHVua25vd24+KS5tYXAoZml4UHJvdG90eXBlcykpIGFzIFg7XG4gICAgICBjYXNlICdEYXRlJzpcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlKG9iaiBhcyB1bmtub3duIGFzIERhdGUpIGFzIFg7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gT2JqZWN0LmZyb21FbnRyaWVzKE9iamVjdC5lbnRyaWVzKG9iaikubWFwKChbaywgdl0pOiBbc3RyaW5nLCBhbnldID0+IFtrLCBmaXhQcm90b3R5cGVzKHYpXSkpIGFzIFg7XG4gICAgfVxuICB9IGVsc2UgcmV0dXJuIG9iajtcbn1cblxuLyoqXG4gKiBJbml0aWFsaXplIHRoZSB3b3JrZmxvdy4gT3IgdG8gYmUgZXhhY3QsIF9jb21wbGV0ZV8gaW5pdGlhbGl6YXRpb24sIGFzIG1vc3QgcGFydCBoYXMgYmVlbiBkb25lIGluIGNvbnN0cnVjdG9yKS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGluaXRpYWxpemUoaW5pdGlhbGl6ZVdvcmtmbG93Sm9iOiBjb3Jlc2RrLndvcmtmbG93X2FjdGl2YXRpb24uSUluaXRpYWxpemVXb3JrZmxvdyk6IHZvaWQge1xuICBnZXRBY3RpdmF0b3IoKS5pbml0aWFsaXplV29ya2Zsb3coaW5pdGlhbGl6ZVdvcmtmbG93Sm9iKTtcbn1cblxuLyoqXG4gKiBSdW4gYSBjaHVuayBvZiBhY3RpdmF0aW9uIGpvYnNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFjdGl2YXRlKGFjdGl2YXRpb246IGNvcmVzZGsud29ya2Zsb3dfYWN0aXZhdGlvbi5JV29ya2Zsb3dBY3RpdmF0aW9uLCBiYXRjaEluZGV4ID0gMCk6IHZvaWQge1xuICBjb25zdCBhY3RpdmF0b3IgPSBnZXRBY3RpdmF0b3IoKTtcbiAgY29uc3QgaW50ZXJjZXB0ID0gY29tcG9zZUludGVyY2VwdG9ycyhhY3RpdmF0b3IuaW50ZXJjZXB0b3JzLmludGVybmFscywgJ2FjdGl2YXRlJywgKHsgYWN0aXZhdGlvbiB9KSA9PiB7XG4gICAgLy8gQ2FzdCBmcm9tIHRoZSBpbnRlcmZhY2UgdG8gdGhlIGNsYXNzIHdoaWNoIGhhcyB0aGUgYHZhcmlhbnRgIGF0dHJpYnV0ZS5cbiAgICAvLyBUaGlzIGlzIHNhZmUgYmVjYXVzZSB3ZSBrbm93IHRoYXQgYWN0aXZhdGlvbiBpcyBhIHByb3RvIGNsYXNzLlxuICAgIGNvbnN0IGpvYnMgPSBhY3RpdmF0aW9uLmpvYnMgYXMgY29yZXNkay53b3JrZmxvd19hY3RpdmF0aW9uLldvcmtmbG93QWN0aXZhdGlvbkpvYltdO1xuXG4gICAgLy8gSW5pdGlhbGl6YXRpb24gd2lsbCBoYXZlIGJlZW4gaGFuZGxlZCBhbHJlYWR5LCBidXQgd2UgbWlnaHQgc3RpbGwgbmVlZCB0byBzdGFydCB0aGUgd29ya2Zsb3cgZnVuY3Rpb25cbiAgICBjb25zdCBzdGFydFdvcmtmbG93Sm9iID0gam9ic1swXS52YXJpYW50ID09PSAnaW5pdGlhbGl6ZVdvcmtmbG93JyA/IGpvYnMuc2hpZnQoKT8uaW5pdGlhbGl6ZVdvcmtmbG93IDogdW5kZWZpbmVkO1xuXG4gICAgZm9yIChjb25zdCBqb2Igb2Ygam9icykge1xuICAgICAgaWYgKGpvYi52YXJpYW50ID09PSB1bmRlZmluZWQpIHRocm93IG5ldyBUeXBlRXJyb3IoJ0V4cGVjdGVkIGpvYi52YXJpYW50IHRvIGJlIGRlZmluZWQnKTtcblxuICAgICAgY29uc3QgdmFyaWFudCA9IGpvYltqb2IudmFyaWFudF07XG4gICAgICBpZiAoIXZhcmlhbnQpIHRocm93IG5ldyBUeXBlRXJyb3IoYEV4cGVjdGVkIGpvYi4ke2pvYi52YXJpYW50fSB0byBiZSBzZXRgKTtcblxuICAgICAgYWN0aXZhdG9yW2pvYi52YXJpYW50XSh2YXJpYW50IGFzIGFueSAvKiBUUyBjYW4ndCBpbmZlciB0aGlzIHR5cGUgKi8pO1xuXG4gICAgICBpZiAoam9iLnZhcmlhbnQgIT09ICdxdWVyeVdvcmtmbG93JykgdHJ5VW5ibG9ja0NvbmRpdGlvbnMoKTtcbiAgICB9XG5cbiAgICBpZiAoc3RhcnRXb3JrZmxvd0pvYikge1xuICAgICAgY29uc3Qgc2FmZUpvYlR5cGVzOiBjb3Jlc2RrLndvcmtmbG93X2FjdGl2YXRpb24uV29ya2Zsb3dBY3RpdmF0aW9uSm9iWyd2YXJpYW50J11bXSA9IFtcbiAgICAgICAgJ2luaXRpYWxpemVXb3JrZmxvdycsXG4gICAgICAgICdzaWduYWxXb3JrZmxvdycsXG4gICAgICAgICdkb1VwZGF0ZScsXG4gICAgICAgICdjYW5jZWxXb3JrZmxvdycsXG4gICAgICAgICd1cGRhdGVSYW5kb21TZWVkJyxcbiAgICAgIF07XG4gICAgICBpZiAoam9icy5zb21lKChqb2IpID0+ICFzYWZlSm9iVHlwZXMuaW5jbHVkZXMoam9iLnZhcmlhbnQpKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgICAgICdSZWNlaXZlZCBib3RoIGluaXRpYWxpemVXb3JrZmxvdyBhbmQgbm9uLXNpZ25hbC9ub24tdXBkYXRlIGpvYnMgaW4gdGhlIHNhbWUgYWN0aXZhdGlvbjogJyArXG4gICAgICAgICAgICBKU09OLnN0cmluZ2lmeShqb2JzLm1hcCgoam9iKSA9PiBqb2IudmFyaWFudCkpXG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIGFjdGl2YXRvci5zdGFydFdvcmtmbG93KHN0YXJ0V29ya2Zsb3dKb2IpO1xuICAgICAgdHJ5VW5ibG9ja0NvbmRpdGlvbnMoKTtcbiAgICB9XG4gIH0pO1xuICBpbnRlcmNlcHQoeyBhY3RpdmF0aW9uLCBiYXRjaEluZGV4IH0pO1xufVxuXG4vKipcbiAqIENvbmNsdWRlIGEgc2luZ2xlIGFjdGl2YXRpb24uXG4gKiBTaG91bGQgYmUgY2FsbGVkIGFmdGVyIHByb2Nlc3NpbmcgYWxsIGFjdGl2YXRpb24gam9icyBhbmQgcXVldWVkIG1pY3JvdGFza3MuXG4gKlxuICogQWN0aXZhdGlvbiBmYWlsdXJlcyBhcmUgaGFuZGxlZCBpbiB0aGUgbWFpbiBOb2RlLmpzIGlzb2xhdGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb25jbHVkZUFjdGl2YXRpb24oKTogY29yZXNkay53b3JrZmxvd19jb21wbGV0aW9uLklXb3JrZmxvd0FjdGl2YXRpb25Db21wbGV0aW9uIHtcbiAgY29uc3QgYWN0aXZhdG9yID0gZ2V0QWN0aXZhdG9yKCk7XG4gIGFjdGl2YXRvci5yZWplY3RCdWZmZXJlZFVwZGF0ZXMoKTtcbiAgY29uc3QgaW50ZXJjZXB0ID0gY29tcG9zZUludGVyY2VwdG9ycyhhY3RpdmF0b3IuaW50ZXJjZXB0b3JzLmludGVybmFscywgJ2NvbmNsdWRlQWN0aXZhdGlvbicsIChpbnB1dCkgPT4gaW5wdXQpO1xuICBjb25zdCBhY3RpdmF0aW9uQ29tcGxldGlvbiA9IGFjdGl2YXRvci5jb25jbHVkZUFjdGl2YXRpb24oKTtcbiAgY29uc3QgeyBjb21tYW5kcyB9ID0gaW50ZXJjZXB0KHsgY29tbWFuZHM6IGFjdGl2YXRpb25Db21wbGV0aW9uLmNvbW1hbmRzIH0pO1xuICBpZiAoYWN0aXZhdG9yLmNvbXBsZXRlZCkge1xuICAgIGFjdGl2YXRvci53YXJuSWZVbmZpbmlzaGVkSGFuZGxlcnMoKTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgcnVuSWQ6IGFjdGl2YXRvci5pbmZvLnJ1bklkLFxuICAgIHN1Y2Nlc3NmdWw6IHsgLi4uYWN0aXZhdGlvbkNvbXBsZXRpb24sIGNvbW1hbmRzIH0sXG4gIH07XG59XG5cbi8qKlxuICogTG9vcCB0aHJvdWdoIGFsbCBibG9ja2VkIGNvbmRpdGlvbnMsIGV2YWx1YXRlIGFuZCB1bmJsb2NrIGlmIHBvc3NpYmxlLlxuICpcbiAqIEByZXR1cm5zIG51bWJlciBvZiB1bmJsb2NrZWQgY29uZGl0aW9ucy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRyeVVuYmxvY2tDb25kaXRpb25zKCk6IG51bWJlciB7XG4gIGxldCBudW1VbmJsb2NrZWQgPSAwO1xuICBmb3IgKDs7KSB7XG4gICAgY29uc3QgcHJldlVuYmxvY2tlZCA9IG51bVVuYmxvY2tlZDtcbiAgICBmb3IgKGNvbnN0IFtzZXEsIGNvbmRdIG9mIGdldEFjdGl2YXRvcigpLmJsb2NrZWRDb25kaXRpb25zLmVudHJpZXMoKSkge1xuICAgICAgaWYgKGNvbmQuZm4oKSkge1xuICAgICAgICBjb25kLnJlc29sdmUoKTtcbiAgICAgICAgbnVtVW5ibG9ja2VkKys7XG4gICAgICAgIC8vIEl0IGlzIHNhZmUgdG8gZGVsZXRlIGVsZW1lbnRzIGR1cmluZyBtYXAgaXRlcmF0aW9uXG4gICAgICAgIGdldEFjdGl2YXRvcigpLmJsb2NrZWRDb25kaXRpb25zLmRlbGV0ZShzZXEpO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAocHJldlVuYmxvY2tlZCA9PT0gbnVtVW5ibG9ja2VkKSB7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG51bVVuYmxvY2tlZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRpc3Bvc2UoKTogdm9pZCB7XG4gIGNvbnN0IGRpc3Bvc2UgPSBjb21wb3NlSW50ZXJjZXB0b3JzKGdldEFjdGl2YXRvcigpLmludGVyY2VwdG9ycy5pbnRlcm5hbHMsICdkaXNwb3NlJywgYXN5bmMgKCkgPT4ge1xuICAgIGRpc2FibGVTdG9yYWdlKCk7XG4gICAgZGlzYWJsZVVwZGF0ZVN0b3JhZ2UoKTtcbiAgfSk7XG4gIGRpc3Bvc2Uoe30pO1xufVxuIiwiaW1wb3J0IHtcbiAgQWN0aXZpdHlGdW5jdGlvbixcbiAgQWN0aXZpdHlPcHRpb25zLFxuICBjb21waWxlUmV0cnlQb2xpY3ksXG4gIGV4dHJhY3RXb3JrZmxvd1R5cGUsXG4gIEhhbmRsZXJVbmZpbmlzaGVkUG9saWN5LFxuICBMb2NhbEFjdGl2aXR5T3B0aW9ucyxcbiAgbWFwVG9QYXlsb2FkcyxcbiAgUXVlcnlEZWZpbml0aW9uLFxuICBzZWFyY2hBdHRyaWJ1dGVQYXlsb2FkQ29udmVydGVyLFxuICBTZWFyY2hBdHRyaWJ1dGVzLFxuICBTaWduYWxEZWZpbml0aW9uLFxuICB0b1BheWxvYWRzLFxuICBVbnR5cGVkQWN0aXZpdGllcyxcbiAgVXBkYXRlRGVmaW5pdGlvbixcbiAgV2l0aFdvcmtmbG93QXJncyxcbiAgV29ya2Zsb3csXG4gIFdvcmtmbG93UmVzdWx0VHlwZSxcbiAgV29ya2Zsb3dSZXR1cm5UeXBlLFxuICBXb3JrZmxvd1VwZGF0ZVZhbGlkYXRvclR5cGUsXG59IGZyb20gJ0B0ZW1wb3JhbGlvL2NvbW1vbic7XG5pbXBvcnQgeyB2ZXJzaW9uaW5nSW50ZW50VG9Qcm90byB9IGZyb20gJ0B0ZW1wb3JhbGlvL2NvbW1vbi9saWIvdmVyc2lvbmluZy1pbnRlbnQtZW51bSc7XG5pbXBvcnQgeyBEdXJhdGlvbiwgbXNPcHRpb25hbFRvVHMsIG1zVG9OdW1iZXIsIG1zVG9UcywgcmVxdWlyZWRUc1RvTXMgfSBmcm9tICdAdGVtcG9yYWxpby9jb21tb24vbGliL3RpbWUnO1xuaW1wb3J0IHsgY29tcG9zZUludGVyY2VwdG9ycyB9IGZyb20gJ0B0ZW1wb3JhbGlvL2NvbW1vbi9saWIvaW50ZXJjZXB0b3JzJztcbmltcG9ydCB7IHRlbXBvcmFsIH0gZnJvbSAnQHRlbXBvcmFsaW8vcHJvdG8nO1xuaW1wb3J0IHsgQ2FuY2VsbGF0aW9uU2NvcGUsIHJlZ2lzdGVyU2xlZXBJbXBsZW1lbnRhdGlvbiB9IGZyb20gJy4vY2FuY2VsbGF0aW9uLXNjb3BlJztcbmltcG9ydCB7IFVwZGF0ZVNjb3BlIH0gZnJvbSAnLi91cGRhdGUtc2NvcGUnO1xuaW1wb3J0IHtcbiAgQWN0aXZpdHlJbnB1dCxcbiAgTG9jYWxBY3Rpdml0eUlucHV0LFxuICBTaWduYWxXb3JrZmxvd0lucHV0LFxuICBTdGFydENoaWxkV29ya2Zsb3dFeGVjdXRpb25JbnB1dCxcbiAgVGltZXJJbnB1dCxcbn0gZnJvbSAnLi9pbnRlcmNlcHRvcnMnO1xuaW1wb3J0IHtcbiAgQ2hpbGRXb3JrZmxvd0NhbmNlbGxhdGlvblR5cGUsXG4gIENoaWxkV29ya2Zsb3dPcHRpb25zLFxuICBDaGlsZFdvcmtmbG93T3B0aW9uc1dpdGhEZWZhdWx0cyxcbiAgQ29udGludWVBc05ldyxcbiAgQ29udGludWVBc05ld09wdGlvbnMsXG4gIERlZmF1bHRTaWduYWxIYW5kbGVyLFxuICBFbmhhbmNlZFN0YWNrVHJhY2UsXG4gIEhhbmRsZXIsXG4gIFF1ZXJ5SGFuZGxlck9wdGlvbnMsXG4gIFNpZ25hbEhhbmRsZXJPcHRpb25zLFxuICBVcGRhdGVIYW5kbGVyT3B0aW9ucyxcbiAgV29ya2Zsb3dJbmZvLFxuICBVcGRhdGVJbmZvLFxufSBmcm9tICcuL2ludGVyZmFjZXMnO1xuaW1wb3J0IHsgTG9jYWxBY3Rpdml0eURvQmFja29mZiB9IGZyb20gJy4vZXJyb3JzJztcbmltcG9ydCB7IGFzc2VydEluV29ya2Zsb3dDb250ZXh0LCBnZXRBY3RpdmF0b3IsIG1heWJlR2V0QWN0aXZhdG9yIH0gZnJvbSAnLi9nbG9iYWwtYXR0cmlidXRlcyc7XG5pbXBvcnQgeyB1bnRyYWNrUHJvbWlzZSB9IGZyb20gJy4vc3RhY2staGVscGVycyc7XG5pbXBvcnQgeyBDaGlsZFdvcmtmbG93SGFuZGxlLCBFeHRlcm5hbFdvcmtmbG93SGFuZGxlIH0gZnJvbSAnLi93b3JrZmxvdy1oYW5kbGUnO1xuXG4vLyBBdm9pZCBhIGNpcmN1bGFyIGRlcGVuZGVuY3lcbnJlZ2lzdGVyU2xlZXBJbXBsZW1lbnRhdGlvbihzbGVlcCk7XG5cbi8qKlxuICogQWRkcyBkZWZhdWx0IHZhbHVlcyBvZiBgd29ya2Zsb3dJZGAgYW5kIGBjYW5jZWxsYXRpb25UeXBlYCB0byBnaXZlbiB3b3JrZmxvdyBvcHRpb25zLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYWRkRGVmYXVsdFdvcmtmbG93T3B0aW9uczxUIGV4dGVuZHMgV29ya2Zsb3c+KFxuICBvcHRzOiBXaXRoV29ya2Zsb3dBcmdzPFQsIENoaWxkV29ya2Zsb3dPcHRpb25zPlxuKTogQ2hpbGRXb3JrZmxvd09wdGlvbnNXaXRoRGVmYXVsdHMge1xuICBjb25zdCB7IGFyZ3MsIHdvcmtmbG93SWQsIC4uLnJlc3QgfSA9IG9wdHM7XG4gIHJldHVybiB7XG4gICAgd29ya2Zsb3dJZDogd29ya2Zsb3dJZCA/PyB1dWlkNCgpLFxuICAgIGFyZ3M6IChhcmdzID8/IFtdKSBhcyB1bmtub3duW10sXG4gICAgY2FuY2VsbGF0aW9uVHlwZTogQ2hpbGRXb3JrZmxvd0NhbmNlbGxhdGlvblR5cGUuV0FJVF9DQU5DRUxMQVRJT05fQ09NUExFVEVELFxuICAgIC4uLnJlc3QsXG4gIH07XG59XG5cbi8qKlxuICogUHVzaCBhIHN0YXJ0VGltZXIgY29tbWFuZCBpbnRvIHN0YXRlIGFjY3VtdWxhdG9yIGFuZCByZWdpc3RlciBjb21wbGV0aW9uXG4gKi9cbmZ1bmN0aW9uIHRpbWVyTmV4dEhhbmRsZXIoaW5wdXQ6IFRpbWVySW5wdXQpIHtcbiAgY29uc3QgYWN0aXZhdG9yID0gZ2V0QWN0aXZhdG9yKCk7XG4gIHJldHVybiBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgY29uc3Qgc2NvcGUgPSBDYW5jZWxsYXRpb25TY29wZS5jdXJyZW50KCk7XG4gICAgaWYgKHNjb3BlLmNvbnNpZGVyZWRDYW5jZWxsZWQpIHtcbiAgICAgIHVudHJhY2tQcm9taXNlKHNjb3BlLmNhbmNlbFJlcXVlc3RlZC5jYXRjaChyZWplY3QpKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHNjb3BlLmNhbmNlbGxhYmxlKSB7XG4gICAgICB1bnRyYWNrUHJvbWlzZShcbiAgICAgICAgc2NvcGUuY2FuY2VsUmVxdWVzdGVkLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICBpZiAoIWFjdGl2YXRvci5jb21wbGV0aW9ucy50aW1lci5kZWxldGUoaW5wdXQuc2VxKSkge1xuICAgICAgICAgICAgcmV0dXJuOyAvLyBBbHJlYWR5IHJlc29sdmVkIG9yIG5ldmVyIHNjaGVkdWxlZFxuICAgICAgICAgIH1cbiAgICAgICAgICBhY3RpdmF0b3IucHVzaENvbW1hbmQoe1xuICAgICAgICAgICAgY2FuY2VsVGltZXI6IHtcbiAgICAgICAgICAgICAgc2VxOiBpbnB1dC5zZXEsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICB9KVxuICAgICAgKTtcbiAgICB9XG4gICAgYWN0aXZhdG9yLnB1c2hDb21tYW5kKHtcbiAgICAgIHN0YXJ0VGltZXI6IHtcbiAgICAgICAgc2VxOiBpbnB1dC5zZXEsXG4gICAgICAgIHN0YXJ0VG9GaXJlVGltZW91dDogbXNUb1RzKGlucHV0LmR1cmF0aW9uTXMpLFxuICAgICAgfSxcbiAgICB9KTtcbiAgICBhY3RpdmF0b3IuY29tcGxldGlvbnMudGltZXIuc2V0KGlucHV0LnNlcSwge1xuICAgICAgcmVzb2x2ZSxcbiAgICAgIHJlamVjdCxcbiAgICB9KTtcbiAgfSk7XG59XG5cbi8qKlxuICogQXN5bmNocm9ub3VzIHNsZWVwLlxuICpcbiAqIFNjaGVkdWxlcyBhIHRpbWVyIG9uIHRoZSBUZW1wb3JhbCBzZXJ2aWNlLlxuICpcbiAqIEBwYXJhbSBtcyBzbGVlcCBkdXJhdGlvbiAtIG51bWJlciBvZiBtaWxsaXNlY29uZHMgb3Ige0BsaW5rIGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL21zIHwgbXMtZm9ybWF0dGVkIHN0cmluZ30uXG4gKiBJZiBnaXZlbiBhIG5lZ2F0aXZlIG51bWJlciBvciAwLCB2YWx1ZSB3aWxsIGJlIHNldCB0byAxLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2xlZXAobXM6IER1cmF0aW9uKTogUHJvbWlzZTx2b2lkPiB7XG4gIGNvbnN0IGFjdGl2YXRvciA9IGFzc2VydEluV29ya2Zsb3dDb250ZXh0KCdXb3JrZmxvdy5zbGVlcCguLi4pIG1heSBvbmx5IGJlIHVzZWQgZnJvbSBhIFdvcmtmbG93IEV4ZWN1dGlvbicpO1xuICBjb25zdCBzZXEgPSBhY3RpdmF0b3IubmV4dFNlcXMudGltZXIrKztcblxuICBjb25zdCBkdXJhdGlvbk1zID0gTWF0aC5tYXgoMSwgbXNUb051bWJlcihtcykpO1xuXG4gIGNvbnN0IGV4ZWN1dGUgPSBjb21wb3NlSW50ZXJjZXB0b3JzKGFjdGl2YXRvci5pbnRlcmNlcHRvcnMub3V0Ym91bmQsICdzdGFydFRpbWVyJywgdGltZXJOZXh0SGFuZGxlcik7XG5cbiAgcmV0dXJuIGV4ZWN1dGUoe1xuICAgIGR1cmF0aW9uTXMsXG4gICAgc2VxLFxuICB9KTtcbn1cblxuZnVuY3Rpb24gdmFsaWRhdGVBY3Rpdml0eU9wdGlvbnMob3B0aW9uczogQWN0aXZpdHlPcHRpb25zKTogdm9pZCB7XG4gIGlmIChvcHRpb25zLnNjaGVkdWxlVG9DbG9zZVRpbWVvdXQgPT09IHVuZGVmaW5lZCAmJiBvcHRpb25zLnN0YXJ0VG9DbG9zZVRpbWVvdXQgPT09IHVuZGVmaW5lZCkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1JlcXVpcmVkIGVpdGhlciBzY2hlZHVsZVRvQ2xvc2VUaW1lb3V0IG9yIHN0YXJ0VG9DbG9zZVRpbWVvdXQnKTtcbiAgfVxufVxuXG4vLyBVc2Ugc2FtZSB2YWxpZGF0aW9uIHdlIHVzZSBmb3Igbm9ybWFsIGFjdGl2aXRpZXNcbmNvbnN0IHZhbGlkYXRlTG9jYWxBY3Rpdml0eU9wdGlvbnMgPSB2YWxpZGF0ZUFjdGl2aXR5T3B0aW9ucztcblxuLyoqXG4gKiBQdXNoIGEgc2NoZWR1bGVBY3Rpdml0eSBjb21tYW5kIGludG8gYWN0aXZhdG9yIGFjY3VtdWxhdG9yIGFuZCByZWdpc3RlciBjb21wbGV0aW9uXG4gKi9cbmZ1bmN0aW9uIHNjaGVkdWxlQWN0aXZpdHlOZXh0SGFuZGxlcih7IG9wdGlvbnMsIGFyZ3MsIGhlYWRlcnMsIHNlcSwgYWN0aXZpdHlUeXBlIH06IEFjdGl2aXR5SW5wdXQpOiBQcm9taXNlPHVua25vd24+IHtcbiAgY29uc3QgYWN0aXZhdG9yID0gZ2V0QWN0aXZhdG9yKCk7XG4gIHZhbGlkYXRlQWN0aXZpdHlPcHRpb25zKG9wdGlvbnMpO1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNvbnN0IHNjb3BlID0gQ2FuY2VsbGF0aW9uU2NvcGUuY3VycmVudCgpO1xuICAgIGlmIChzY29wZS5jb25zaWRlcmVkQ2FuY2VsbGVkKSB7XG4gICAgICB1bnRyYWNrUHJvbWlzZShzY29wZS5jYW5jZWxSZXF1ZXN0ZWQuY2F0Y2gocmVqZWN0KSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChzY29wZS5jYW5jZWxsYWJsZSkge1xuICAgICAgdW50cmFja1Byb21pc2UoXG4gICAgICAgIHNjb3BlLmNhbmNlbFJlcXVlc3RlZC5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgaWYgKCFhY3RpdmF0b3IuY29tcGxldGlvbnMuYWN0aXZpdHkuaGFzKHNlcSkpIHtcbiAgICAgICAgICAgIHJldHVybjsgLy8gQWxyZWFkeSByZXNvbHZlZCBvciBuZXZlciBzY2hlZHVsZWRcbiAgICAgICAgICB9XG4gICAgICAgICAgYWN0aXZhdG9yLnB1c2hDb21tYW5kKHtcbiAgICAgICAgICAgIHJlcXVlc3RDYW5jZWxBY3Rpdml0eToge1xuICAgICAgICAgICAgICBzZXEsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0pO1xuICAgICAgICB9KVxuICAgICAgKTtcbiAgICB9XG4gICAgYWN0aXZhdG9yLnB1c2hDb21tYW5kKHtcbiAgICAgIHNjaGVkdWxlQWN0aXZpdHk6IHtcbiAgICAgICAgc2VxLFxuICAgICAgICBhY3Rpdml0eUlkOiBvcHRpb25zLmFjdGl2aXR5SWQgPz8gYCR7c2VxfWAsXG4gICAgICAgIGFjdGl2aXR5VHlwZSxcbiAgICAgICAgYXJndW1lbnRzOiB0b1BheWxvYWRzKGFjdGl2YXRvci5wYXlsb2FkQ29udmVydGVyLCAuLi5hcmdzKSxcbiAgICAgICAgcmV0cnlQb2xpY3k6IG9wdGlvbnMucmV0cnkgPyBjb21waWxlUmV0cnlQb2xpY3kob3B0aW9ucy5yZXRyeSkgOiB1bmRlZmluZWQsXG4gICAgICAgIHRhc2tRdWV1ZTogb3B0aW9ucy50YXNrUXVldWUgfHwgYWN0aXZhdG9yLmluZm8udGFza1F1ZXVlLFxuICAgICAgICBoZWFydGJlYXRUaW1lb3V0OiBtc09wdGlvbmFsVG9UcyhvcHRpb25zLmhlYXJ0YmVhdFRpbWVvdXQpLFxuICAgICAgICBzY2hlZHVsZVRvQ2xvc2VUaW1lb3V0OiBtc09wdGlvbmFsVG9UcyhvcHRpb25zLnNjaGVkdWxlVG9DbG9zZVRpbWVvdXQpLFxuICAgICAgICBzdGFydFRvQ2xvc2VUaW1lb3V0OiBtc09wdGlvbmFsVG9UcyhvcHRpb25zLnN0YXJ0VG9DbG9zZVRpbWVvdXQpLFxuICAgICAgICBzY2hlZHVsZVRvU3RhcnRUaW1lb3V0OiBtc09wdGlvbmFsVG9UcyhvcHRpb25zLnNjaGVkdWxlVG9TdGFydFRpbWVvdXQpLFxuICAgICAgICBoZWFkZXJzLFxuICAgICAgICBjYW5jZWxsYXRpb25UeXBlOiBvcHRpb25zLmNhbmNlbGxhdGlvblR5cGUsXG4gICAgICAgIGRvTm90RWFnZXJseUV4ZWN1dGU6ICEob3B0aW9ucy5hbGxvd0VhZ2VyRGlzcGF0Y2ggPz8gdHJ1ZSksXG4gICAgICAgIHZlcnNpb25pbmdJbnRlbnQ6IHZlcnNpb25pbmdJbnRlbnRUb1Byb3RvKG9wdGlvbnMudmVyc2lvbmluZ0ludGVudCksXG4gICAgICB9LFxuICAgIH0pO1xuICAgIGFjdGl2YXRvci5jb21wbGV0aW9ucy5hY3Rpdml0eS5zZXQoc2VxLCB7XG4gICAgICByZXNvbHZlLFxuICAgICAgcmVqZWN0LFxuICAgIH0pO1xuICB9KTtcbn1cblxuLyoqXG4gKiBQdXNoIGEgc2NoZWR1bGVBY3Rpdml0eSBjb21tYW5kIGludG8gc3RhdGUgYWNjdW11bGF0b3IgYW5kIHJlZ2lzdGVyIGNvbXBsZXRpb25cbiAqL1xuYXN5bmMgZnVuY3Rpb24gc2NoZWR1bGVMb2NhbEFjdGl2aXR5TmV4dEhhbmRsZXIoe1xuICBvcHRpb25zLFxuICBhcmdzLFxuICBoZWFkZXJzLFxuICBzZXEsXG4gIGFjdGl2aXR5VHlwZSxcbiAgYXR0ZW1wdCxcbiAgb3JpZ2luYWxTY2hlZHVsZVRpbWUsXG59OiBMb2NhbEFjdGl2aXR5SW5wdXQpOiBQcm9taXNlPHVua25vd24+IHtcbiAgY29uc3QgYWN0aXZhdG9yID0gZ2V0QWN0aXZhdG9yKCk7XG4gIC8vIEVhZ2VybHkgZmFpbCB0aGUgbG9jYWwgYWN0aXZpdHkgKHdoaWNoIHdpbGwgaW4gdHVybiBmYWlsIHRoZSB3b3JrZmxvdyB0YXNrLlxuICAvLyBEbyBub3QgZmFpbCBvbiByZXBsYXkgd2hlcmUgdGhlIGxvY2FsIGFjdGl2aXRpZXMgbWF5IG5vdCBiZSByZWdpc3RlcmVkIG9uIHRoZSByZXBsYXkgd29ya2VyLlxuICBpZiAoIWFjdGl2YXRvci5pbmZvLnVuc2FmZS5pc1JlcGxheWluZyAmJiAhYWN0aXZhdG9yLnJlZ2lzdGVyZWRBY3Rpdml0eU5hbWVzLmhhcyhhY3Rpdml0eVR5cGUpKSB7XG4gICAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKGBMb2NhbCBhY3Rpdml0eSBvZiB0eXBlICcke2FjdGl2aXR5VHlwZX0nIG5vdCByZWdpc3RlcmVkIG9uIHdvcmtlcmApO1xuICB9XG4gIHZhbGlkYXRlTG9jYWxBY3Rpdml0eU9wdGlvbnMob3B0aW9ucyk7XG5cbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBjb25zdCBzY29wZSA9IENhbmNlbGxhdGlvblNjb3BlLmN1cnJlbnQoKTtcbiAgICBpZiAoc2NvcGUuY29uc2lkZXJlZENhbmNlbGxlZCkge1xuICAgICAgdW50cmFja1Byb21pc2Uoc2NvcGUuY2FuY2VsUmVxdWVzdGVkLmNhdGNoKHJlamVjdCkpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoc2NvcGUuY2FuY2VsbGFibGUpIHtcbiAgICAgIHVudHJhY2tQcm9taXNlKFxuICAgICAgICBzY29wZS5jYW5jZWxSZXF1ZXN0ZWQuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgIGlmICghYWN0aXZhdG9yLmNvbXBsZXRpb25zLmFjdGl2aXR5LmhhcyhzZXEpKSB7XG4gICAgICAgICAgICByZXR1cm47IC8vIEFscmVhZHkgcmVzb2x2ZWQgb3IgbmV2ZXIgc2NoZWR1bGVkXG4gICAgICAgICAgfVxuICAgICAgICAgIGFjdGl2YXRvci5wdXNoQ29tbWFuZCh7XG4gICAgICAgICAgICByZXF1ZXN0Q2FuY2VsTG9jYWxBY3Rpdml0eToge1xuICAgICAgICAgICAgICBzZXEsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0pO1xuICAgICAgICB9KVxuICAgICAgKTtcbiAgICB9XG4gICAgYWN0aXZhdG9yLnB1c2hDb21tYW5kKHtcbiAgICAgIHNjaGVkdWxlTG9jYWxBY3Rpdml0eToge1xuICAgICAgICBzZXEsXG4gICAgICAgIGF0dGVtcHQsXG4gICAgICAgIG9yaWdpbmFsU2NoZWR1bGVUaW1lLFxuICAgICAgICAvLyBJbnRlbnRpb25hbGx5IG5vdCBleHBvc2luZyBhY3Rpdml0eUlkIGFzIGFuIG9wdGlvblxuICAgICAgICBhY3Rpdml0eUlkOiBgJHtzZXF9YCxcbiAgICAgICAgYWN0aXZpdHlUeXBlLFxuICAgICAgICBhcmd1bWVudHM6IHRvUGF5bG9hZHMoYWN0aXZhdG9yLnBheWxvYWRDb252ZXJ0ZXIsIC4uLmFyZ3MpLFxuICAgICAgICByZXRyeVBvbGljeTogb3B0aW9ucy5yZXRyeSA/IGNvbXBpbGVSZXRyeVBvbGljeShvcHRpb25zLnJldHJ5KSA6IHVuZGVmaW5lZCxcbiAgICAgICAgc2NoZWR1bGVUb0Nsb3NlVGltZW91dDogbXNPcHRpb25hbFRvVHMob3B0aW9ucy5zY2hlZHVsZVRvQ2xvc2VUaW1lb3V0KSxcbiAgICAgICAgc3RhcnRUb0Nsb3NlVGltZW91dDogbXNPcHRpb25hbFRvVHMob3B0aW9ucy5zdGFydFRvQ2xvc2VUaW1lb3V0KSxcbiAgICAgICAgc2NoZWR1bGVUb1N0YXJ0VGltZW91dDogbXNPcHRpb25hbFRvVHMob3B0aW9ucy5zY2hlZHVsZVRvU3RhcnRUaW1lb3V0KSxcbiAgICAgICAgbG9jYWxSZXRyeVRocmVzaG9sZDogbXNPcHRpb25hbFRvVHMob3B0aW9ucy5sb2NhbFJldHJ5VGhyZXNob2xkKSxcbiAgICAgICAgaGVhZGVycyxcbiAgICAgICAgY2FuY2VsbGF0aW9uVHlwZTogb3B0aW9ucy5jYW5jZWxsYXRpb25UeXBlLFxuICAgICAgfSxcbiAgICB9KTtcbiAgICBhY3RpdmF0b3IuY29tcGxldGlvbnMuYWN0aXZpdHkuc2V0KHNlcSwge1xuICAgICAgcmVzb2x2ZSxcbiAgICAgIHJlamVjdCxcbiAgICB9KTtcbiAgfSk7XG59XG5cbi8qKlxuICogU2NoZWR1bGUgYW4gYWN0aXZpdHkgYW5kIHJ1biBvdXRib3VuZCBpbnRlcmNlcHRvcnNcbiAqIEBoaWRkZW5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNjaGVkdWxlQWN0aXZpdHk8Uj4oYWN0aXZpdHlUeXBlOiBzdHJpbmcsIGFyZ3M6IGFueVtdLCBvcHRpb25zOiBBY3Rpdml0eU9wdGlvbnMpOiBQcm9taXNlPFI+IHtcbiAgY29uc3QgYWN0aXZhdG9yID0gYXNzZXJ0SW5Xb3JrZmxvd0NvbnRleHQoXG4gICAgJ1dvcmtmbG93LnNjaGVkdWxlQWN0aXZpdHkoLi4uKSBtYXkgb25seSBiZSB1c2VkIGZyb20gYSBXb3JrZmxvdyBFeGVjdXRpb24nXG4gICk7XG4gIGlmIChvcHRpb25zID09PSB1bmRlZmluZWQpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdHb3QgZW1wdHkgYWN0aXZpdHkgb3B0aW9ucycpO1xuICB9XG4gIGNvbnN0IHNlcSA9IGFjdGl2YXRvci5uZXh0U2Vxcy5hY3Rpdml0eSsrO1xuICBjb25zdCBleGVjdXRlID0gY29tcG9zZUludGVyY2VwdG9ycyhhY3RpdmF0b3IuaW50ZXJjZXB0b3JzLm91dGJvdW5kLCAnc2NoZWR1bGVBY3Rpdml0eScsIHNjaGVkdWxlQWN0aXZpdHlOZXh0SGFuZGxlcik7XG5cbiAgcmV0dXJuIGV4ZWN1dGUoe1xuICAgIGFjdGl2aXR5VHlwZSxcbiAgICBoZWFkZXJzOiB7fSxcbiAgICBvcHRpb25zLFxuICAgIGFyZ3MsXG4gICAgc2VxLFxuICB9KSBhcyBQcm9taXNlPFI+O1xufVxuXG4vKipcbiAqIFNjaGVkdWxlIGFuIGFjdGl2aXR5IGFuZCBydW4gb3V0Ym91bmQgaW50ZXJjZXB0b3JzXG4gKiBAaGlkZGVuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzY2hlZHVsZUxvY2FsQWN0aXZpdHk8Uj4oXG4gIGFjdGl2aXR5VHlwZTogc3RyaW5nLFxuICBhcmdzOiBhbnlbXSxcbiAgb3B0aW9uczogTG9jYWxBY3Rpdml0eU9wdGlvbnNcbik6IFByb21pc2U8Uj4ge1xuICBjb25zdCBhY3RpdmF0b3IgPSBhc3NlcnRJbldvcmtmbG93Q29udGV4dChcbiAgICAnV29ya2Zsb3cuc2NoZWR1bGVMb2NhbEFjdGl2aXR5KC4uLikgbWF5IG9ubHkgYmUgdXNlZCBmcm9tIGEgV29ya2Zsb3cgRXhlY3V0aW9uJ1xuICApO1xuICBpZiAob3B0aW9ucyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignR290IGVtcHR5IGFjdGl2aXR5IG9wdGlvbnMnKTtcbiAgfVxuXG4gIGxldCBhdHRlbXB0ID0gMTtcbiAgbGV0IG9yaWdpbmFsU2NoZWR1bGVUaW1lID0gdW5kZWZpbmVkO1xuXG4gIGZvciAoOzspIHtcbiAgICBjb25zdCBzZXEgPSBhY3RpdmF0b3IubmV4dFNlcXMuYWN0aXZpdHkrKztcbiAgICBjb25zdCBleGVjdXRlID0gY29tcG9zZUludGVyY2VwdG9ycyhcbiAgICAgIGFjdGl2YXRvci5pbnRlcmNlcHRvcnMub3V0Ym91bmQsXG4gICAgICAnc2NoZWR1bGVMb2NhbEFjdGl2aXR5JyxcbiAgICAgIHNjaGVkdWxlTG9jYWxBY3Rpdml0eU5leHRIYW5kbGVyXG4gICAgKTtcblxuICAgIHRyeSB7XG4gICAgICByZXR1cm4gKGF3YWl0IGV4ZWN1dGUoe1xuICAgICAgICBhY3Rpdml0eVR5cGUsXG4gICAgICAgIGhlYWRlcnM6IHt9LFxuICAgICAgICBvcHRpb25zLFxuICAgICAgICBhcmdzLFxuICAgICAgICBzZXEsXG4gICAgICAgIGF0dGVtcHQsXG4gICAgICAgIG9yaWdpbmFsU2NoZWR1bGVUaW1lLFxuICAgICAgfSkpIGFzIFByb21pc2U8Uj47XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBpZiAoZXJyIGluc3RhbmNlb2YgTG9jYWxBY3Rpdml0eURvQmFja29mZikge1xuICAgICAgICBhd2FpdCBzbGVlcChyZXF1aXJlZFRzVG9NcyhlcnIuYmFja29mZi5iYWNrb2ZmRHVyYXRpb24sICdiYWNrb2ZmRHVyYXRpb24nKSk7XG4gICAgICAgIGlmICh0eXBlb2YgZXJyLmJhY2tvZmYuYXR0ZW1wdCAhPT0gJ251bWJlcicpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdJbnZhbGlkIGJhY2tvZmYgYXR0ZW1wdCB0eXBlJyk7XG4gICAgICAgIH1cbiAgICAgICAgYXR0ZW1wdCA9IGVyci5iYWNrb2ZmLmF0dGVtcHQ7XG4gICAgICAgIG9yaWdpbmFsU2NoZWR1bGVUaW1lID0gZXJyLmJhY2tvZmYub3JpZ2luYWxTY2hlZHVsZVRpbWUgPz8gdW5kZWZpbmVkO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBzdGFydENoaWxkV29ya2Zsb3dFeGVjdXRpb25OZXh0SGFuZGxlcih7XG4gIG9wdGlvbnMsXG4gIGhlYWRlcnMsXG4gIHdvcmtmbG93VHlwZSxcbiAgc2VxLFxufTogU3RhcnRDaGlsZFdvcmtmbG93RXhlY3V0aW9uSW5wdXQpOiBQcm9taXNlPFtQcm9taXNlPHN0cmluZz4sIFByb21pc2U8dW5rbm93bj5dPiB7XG4gIGNvbnN0IGFjdGl2YXRvciA9IGdldEFjdGl2YXRvcigpO1xuICBjb25zdCB3b3JrZmxvd0lkID0gb3B0aW9ucy53b3JrZmxvd0lkID8/IHV1aWQ0KCk7XG4gIGNvbnN0IHN0YXJ0UHJvbWlzZSA9IG5ldyBQcm9taXNlPHN0cmluZz4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNvbnN0IHNjb3BlID0gQ2FuY2VsbGF0aW9uU2NvcGUuY3VycmVudCgpO1xuICAgIGlmIChzY29wZS5jb25zaWRlcmVkQ2FuY2VsbGVkKSB7XG4gICAgICB1bnRyYWNrUHJvbWlzZShzY29wZS5jYW5jZWxSZXF1ZXN0ZWQuY2F0Y2gocmVqZWN0KSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChzY29wZS5jYW5jZWxsYWJsZSkge1xuICAgICAgdW50cmFja1Byb21pc2UoXG4gICAgICAgIHNjb3BlLmNhbmNlbFJlcXVlc3RlZC5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgY29uc3QgY29tcGxldGUgPSAhYWN0aXZhdG9yLmNvbXBsZXRpb25zLmNoaWxkV29ya2Zsb3dDb21wbGV0ZS5oYXMoc2VxKTtcblxuICAgICAgICAgIGlmICghY29tcGxldGUpIHtcbiAgICAgICAgICAgIGFjdGl2YXRvci5wdXNoQ29tbWFuZCh7XG4gICAgICAgICAgICAgIGNhbmNlbENoaWxkV29ya2Zsb3dFeGVjdXRpb246IHsgY2hpbGRXb3JrZmxvd1NlcTogc2VxIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gTm90aGluZyB0byBjYW5jZWwgb3RoZXJ3aXNlXG4gICAgICAgIH0pXG4gICAgICApO1xuICAgIH1cbiAgICBhY3RpdmF0b3IucHVzaENvbW1hbmQoe1xuICAgICAgc3RhcnRDaGlsZFdvcmtmbG93RXhlY3V0aW9uOiB7XG4gICAgICAgIHNlcSxcbiAgICAgICAgd29ya2Zsb3dJZCxcbiAgICAgICAgd29ya2Zsb3dUeXBlLFxuICAgICAgICBpbnB1dDogdG9QYXlsb2FkcyhhY3RpdmF0b3IucGF5bG9hZENvbnZlcnRlciwgLi4ub3B0aW9ucy5hcmdzKSxcbiAgICAgICAgcmV0cnlQb2xpY3k6IG9wdGlvbnMucmV0cnkgPyBjb21waWxlUmV0cnlQb2xpY3kob3B0aW9ucy5yZXRyeSkgOiB1bmRlZmluZWQsXG4gICAgICAgIHRhc2tRdWV1ZTogb3B0aW9ucy50YXNrUXVldWUgfHwgYWN0aXZhdG9yLmluZm8udGFza1F1ZXVlLFxuICAgICAgICB3b3JrZmxvd0V4ZWN1dGlvblRpbWVvdXQ6IG1zT3B0aW9uYWxUb1RzKG9wdGlvbnMud29ya2Zsb3dFeGVjdXRpb25UaW1lb3V0KSxcbiAgICAgICAgd29ya2Zsb3dSdW5UaW1lb3V0OiBtc09wdGlvbmFsVG9UcyhvcHRpb25zLndvcmtmbG93UnVuVGltZW91dCksXG4gICAgICAgIHdvcmtmbG93VGFza1RpbWVvdXQ6IG1zT3B0aW9uYWxUb1RzKG9wdGlvbnMud29ya2Zsb3dUYXNrVGltZW91dCksXG4gICAgICAgIG5hbWVzcGFjZTogYWN0aXZhdG9yLmluZm8ubmFtZXNwYWNlLCAvLyBOb3QgY29uZmlndXJhYmxlXG4gICAgICAgIGhlYWRlcnMsXG4gICAgICAgIGNhbmNlbGxhdGlvblR5cGU6IG9wdGlvbnMuY2FuY2VsbGF0aW9uVHlwZSxcbiAgICAgICAgd29ya2Zsb3dJZFJldXNlUG9saWN5OiBvcHRpb25zLndvcmtmbG93SWRSZXVzZVBvbGljeSxcbiAgICAgICAgcGFyZW50Q2xvc2VQb2xpY3k6IG9wdGlvbnMucGFyZW50Q2xvc2VQb2xpY3ksXG4gICAgICAgIGNyb25TY2hlZHVsZTogb3B0aW9ucy5jcm9uU2NoZWR1bGUsXG4gICAgICAgIHNlYXJjaEF0dHJpYnV0ZXM6IG9wdGlvbnMuc2VhcmNoQXR0cmlidXRlc1xuICAgICAgICAgID8gbWFwVG9QYXlsb2FkcyhzZWFyY2hBdHRyaWJ1dGVQYXlsb2FkQ29udmVydGVyLCBvcHRpb25zLnNlYXJjaEF0dHJpYnV0ZXMpXG4gICAgICAgICAgOiB1bmRlZmluZWQsXG4gICAgICAgIG1lbW86IG9wdGlvbnMubWVtbyAmJiBtYXBUb1BheWxvYWRzKGFjdGl2YXRvci5wYXlsb2FkQ29udmVydGVyLCBvcHRpb25zLm1lbW8pLFxuICAgICAgICB2ZXJzaW9uaW5nSW50ZW50OiB2ZXJzaW9uaW5nSW50ZW50VG9Qcm90byhvcHRpb25zLnZlcnNpb25pbmdJbnRlbnQpLFxuICAgICAgfSxcbiAgICB9KTtcbiAgICBhY3RpdmF0b3IuY29tcGxldGlvbnMuY2hpbGRXb3JrZmxvd1N0YXJ0LnNldChzZXEsIHtcbiAgICAgIHJlc29sdmUsXG4gICAgICByZWplY3QsXG4gICAgfSk7XG4gIH0pO1xuXG4gIC8vIFdlIGNvbnN0cnVjdCBhIFByb21pc2UgZm9yIHRoZSBjb21wbGV0aW9uIG9mIHRoZSBjaGlsZCBXb3JrZmxvdyBiZWZvcmUgd2Uga25vd1xuICAvLyBpZiB0aGUgV29ya2Zsb3cgY29kZSB3aWxsIGF3YWl0IGl0IHRvIGNhcHR1cmUgdGhlIHJlc3VsdCBpbiBjYXNlIGl0IGRvZXMuXG4gIGNvbnN0IGNvbXBsZXRlUHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAvLyBDaGFpbiBzdGFydCBQcm9taXNlIHJlamVjdGlvbiB0byB0aGUgY29tcGxldGUgUHJvbWlzZS5cbiAgICB1bnRyYWNrUHJvbWlzZShzdGFydFByb21pc2UuY2F0Y2gocmVqZWN0KSk7XG4gICAgYWN0aXZhdG9yLmNvbXBsZXRpb25zLmNoaWxkV29ya2Zsb3dDb21wbGV0ZS5zZXQoc2VxLCB7XG4gICAgICByZXNvbHZlLFxuICAgICAgcmVqZWN0LFxuICAgIH0pO1xuICB9KTtcbiAgdW50cmFja1Byb21pc2Uoc3RhcnRQcm9taXNlKTtcbiAgdW50cmFja1Byb21pc2UoY29tcGxldGVQcm9taXNlKTtcbiAgLy8gUHJldmVudCB1bmhhbmRsZWQgcmVqZWN0aW9uIGJlY2F1c2UgdGhlIGNvbXBsZXRpb24gbWlnaHQgbm90IGJlIGF3YWl0ZWRcbiAgdW50cmFja1Byb21pc2UoY29tcGxldGVQcm9taXNlLmNhdGNoKCgpID0+IHVuZGVmaW5lZCkpO1xuICBjb25zdCByZXQgPSBuZXcgUHJvbWlzZTxbUHJvbWlzZTxzdHJpbmc+LCBQcm9taXNlPHVua25vd24+XT4oKHJlc29sdmUpID0+IHJlc29sdmUoW3N0YXJ0UHJvbWlzZSwgY29tcGxldGVQcm9taXNlXSkpO1xuICB1bnRyYWNrUHJvbWlzZShyZXQpO1xuICByZXR1cm4gcmV0O1xufVxuXG5mdW5jdGlvbiBzaWduYWxXb3JrZmxvd05leHRIYW5kbGVyKHsgc2VxLCBzaWduYWxOYW1lLCBhcmdzLCB0YXJnZXQsIGhlYWRlcnMgfTogU2lnbmFsV29ya2Zsb3dJbnB1dCkge1xuICBjb25zdCBhY3RpdmF0b3IgPSBnZXRBY3RpdmF0b3IoKTtcbiAgcmV0dXJuIG5ldyBQcm9taXNlPGFueT4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNvbnN0IHNjb3BlID0gQ2FuY2VsbGF0aW9uU2NvcGUuY3VycmVudCgpO1xuICAgIGlmIChzY29wZS5jb25zaWRlcmVkQ2FuY2VsbGVkKSB7XG4gICAgICB1bnRyYWNrUHJvbWlzZShzY29wZS5jYW5jZWxSZXF1ZXN0ZWQuY2F0Y2gocmVqZWN0KSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHNjb3BlLmNhbmNlbGxhYmxlKSB7XG4gICAgICB1bnRyYWNrUHJvbWlzZShcbiAgICAgICAgc2NvcGUuY2FuY2VsUmVxdWVzdGVkLmNhdGNoKCgpID0+IHtcbiAgICAgICAgICBpZiAoIWFjdGl2YXRvci5jb21wbGV0aW9ucy5zaWduYWxXb3JrZmxvdy5oYXMoc2VxKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICBhY3RpdmF0b3IucHVzaENvbW1hbmQoeyBjYW5jZWxTaWduYWxXb3JrZmxvdzogeyBzZXEgfSB9KTtcbiAgICAgICAgfSlcbiAgICAgICk7XG4gICAgfVxuICAgIGFjdGl2YXRvci5wdXNoQ29tbWFuZCh7XG4gICAgICBzaWduYWxFeHRlcm5hbFdvcmtmbG93RXhlY3V0aW9uOiB7XG4gICAgICAgIHNlcSxcbiAgICAgICAgYXJnczogdG9QYXlsb2FkcyhhY3RpdmF0b3IucGF5bG9hZENvbnZlcnRlciwgLi4uYXJncyksXG4gICAgICAgIGhlYWRlcnMsXG4gICAgICAgIHNpZ25hbE5hbWUsXG4gICAgICAgIC4uLih0YXJnZXQudHlwZSA9PT0gJ2V4dGVybmFsJ1xuICAgICAgICAgID8ge1xuICAgICAgICAgICAgICB3b3JrZmxvd0V4ZWN1dGlvbjoge1xuICAgICAgICAgICAgICAgIG5hbWVzcGFjZTogYWN0aXZhdG9yLmluZm8ubmFtZXNwYWNlLFxuICAgICAgICAgICAgICAgIC4uLnRhcmdldC53b3JrZmxvd0V4ZWN1dGlvbixcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH1cbiAgICAgICAgICA6IHtcbiAgICAgICAgICAgICAgY2hpbGRXb3JrZmxvd0lkOiB0YXJnZXQuY2hpbGRXb3JrZmxvd0lkLFxuICAgICAgICAgICAgfSksXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgYWN0aXZhdG9yLmNvbXBsZXRpb25zLnNpZ25hbFdvcmtmbG93LnNldChzZXEsIHsgcmVzb2x2ZSwgcmVqZWN0IH0pO1xuICB9KTtcbn1cblxuLyoqXG4gKiBTeW1ib2wgdXNlZCBpbiB0aGUgcmV0dXJuIHR5cGUgb2YgcHJveHkgbWV0aG9kcyB0byBtYXJrIHRoYXQgYW4gYXR0cmlidXRlIG9uIHRoZSBzb3VyY2UgdHlwZSBpcyBub3QgYSBtZXRob2QuXG4gKlxuICogQHNlZSB7QGxpbmsgQWN0aXZpdHlJbnRlcmZhY2VGb3J9XG4gKiBAc2VlIHtAbGluayBwcm94eUFjdGl2aXRpZXN9XG4gKiBAc2VlIHtAbGluayBwcm94eUxvY2FsQWN0aXZpdGllc31cbiAqL1xuZXhwb3J0IGNvbnN0IE5vdEFuQWN0aXZpdHlNZXRob2QgPSBTeW1ib2wuZm9yKCdfX1RFTVBPUkFMX05PVF9BTl9BQ1RJVklUWV9NRVRIT0QnKTtcblxuLyoqXG4gKiBUeXBlIGhlbHBlciB0aGF0IHRha2VzIGEgdHlwZSBgVGAgYW5kIHRyYW5zZm9ybXMgYXR0cmlidXRlcyB0aGF0IGFyZSBub3Qge0BsaW5rIEFjdGl2aXR5RnVuY3Rpb259IHRvXG4gKiB7QGxpbmsgTm90QW5BY3Rpdml0eU1ldGhvZH0uXG4gKlxuICogQGV4YW1wbGVcbiAqXG4gKiBVc2VkIGJ5IHtAbGluayBwcm94eUFjdGl2aXRpZXN9IHRvIGdldCB0aGlzIGNvbXBpbGUtdGltZSBlcnJvcjpcbiAqXG4gKiBgYGB0c1xuICogaW50ZXJmYWNlIE15QWN0aXZpdGllcyB7XG4gKiAgIHZhbGlkKGlucHV0OiBudW1iZXIpOiBQcm9taXNlPG51bWJlcj47XG4gKiAgIGludmFsaWQoaW5wdXQ6IG51bWJlcik6IG51bWJlcjtcbiAqIH1cbiAqXG4gKiBjb25zdCBhY3QgPSBwcm94eUFjdGl2aXRpZXM8TXlBY3Rpdml0aWVzPih7IHN0YXJ0VG9DbG9zZVRpbWVvdXQ6ICc1bScgfSk7XG4gKlxuICogYXdhaXQgYWN0LnZhbGlkKHRydWUpO1xuICogYXdhaXQgYWN0LmludmFsaWQoKTtcbiAqIC8vIF4gVFMgY29tcGxhaW5zIHdpdGg6XG4gKiAvLyAocHJvcGVydHkpIGludmFsaWREZWZpbml0aW9uOiB0eXBlb2YgTm90QW5BY3Rpdml0eU1ldGhvZFxuICogLy8gVGhpcyBleHByZXNzaW9uIGlzIG5vdCBjYWxsYWJsZS5cbiAqIC8vIFR5cGUgJ1N5bWJvbCcgaGFzIG5vIGNhbGwgc2lnbmF0dXJlcy4oMjM0OSlcbiAqIGBgYFxuICovXG5leHBvcnQgdHlwZSBBY3Rpdml0eUludGVyZmFjZUZvcjxUPiA9IHtcbiAgW0sgaW4ga2V5b2YgVF06IFRbS10gZXh0ZW5kcyBBY3Rpdml0eUZ1bmN0aW9uID8gVFtLXSA6IHR5cGVvZiBOb3RBbkFjdGl2aXR5TWV0aG9kO1xufTtcblxuLyoqXG4gKiBDb25maWd1cmUgQWN0aXZpdHkgZnVuY3Rpb25zIHdpdGggZ2l2ZW4ge0BsaW5rIEFjdGl2aXR5T3B0aW9uc30uXG4gKlxuICogVGhpcyBtZXRob2QgbWF5IGJlIGNhbGxlZCBtdWx0aXBsZSB0aW1lcyB0byBzZXR1cCBBY3Rpdml0aWVzIHdpdGggZGlmZmVyZW50IG9wdGlvbnMuXG4gKlxuICogQHJldHVybiBhIHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9Qcm94eSB8IFByb3h5fSBmb3JcbiAqICAgICAgICAgd2hpY2ggZWFjaCBhdHRyaWJ1dGUgaXMgYSBjYWxsYWJsZSBBY3Rpdml0eSBmdW5jdGlvblxuICpcbiAqIEBleGFtcGxlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgcHJveHlBY3Rpdml0aWVzIH0gZnJvbSAnQHRlbXBvcmFsaW8vd29ya2Zsb3cnO1xuICogaW1wb3J0ICogYXMgYWN0aXZpdGllcyBmcm9tICcuLi9hY3Rpdml0aWVzJztcbiAqXG4gKiAvLyBTZXR1cCBBY3Rpdml0aWVzIGZyb20gbW9kdWxlIGV4cG9ydHNcbiAqIGNvbnN0IHsgaHR0cEdldCwgb3RoZXJBY3Rpdml0eSB9ID0gcHJveHlBY3Rpdml0aWVzPHR5cGVvZiBhY3Rpdml0aWVzPih7XG4gKiAgIHN0YXJ0VG9DbG9zZVRpbWVvdXQ6ICczMCBtaW51dGVzJyxcbiAqIH0pO1xuICpcbiAqIC8vIFNldHVwIEFjdGl2aXRpZXMgZnJvbSBhbiBleHBsaWNpdCBpbnRlcmZhY2UgKGUuZy4gd2hlbiBkZWZpbmVkIGJ5IGFub3RoZXIgU0RLKVxuICogaW50ZXJmYWNlIEphdmFBY3Rpdml0aWVzIHtcbiAqICAgaHR0cEdldEZyb21KYXZhKHVybDogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+XG4gKiAgIHNvbWVPdGhlckphdmFBY3Rpdml0eShhcmcxOiBudW1iZXIsIGFyZzI6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPjtcbiAqIH1cbiAqXG4gKiBjb25zdCB7XG4gKiAgIGh0dHBHZXRGcm9tSmF2YSxcbiAqICAgc29tZU90aGVySmF2YUFjdGl2aXR5XG4gKiB9ID0gcHJveHlBY3Rpdml0aWVzPEphdmFBY3Rpdml0aWVzPih7XG4gKiAgIHRhc2tRdWV1ZTogJ2phdmEtd29ya2VyLXRhc2tRdWV1ZScsXG4gKiAgIHN0YXJ0VG9DbG9zZVRpbWVvdXQ6ICc1bScsXG4gKiB9KTtcbiAqXG4gKiBleHBvcnQgZnVuY3Rpb24gZXhlY3V0ZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAqICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBodHRwR2V0KFwiaHR0cDovL2V4YW1wbGUuY29tXCIpO1xuICogICAvLyAuLi5cbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gcHJveHlBY3Rpdml0aWVzPEEgPSBVbnR5cGVkQWN0aXZpdGllcz4ob3B0aW9uczogQWN0aXZpdHlPcHRpb25zKTogQWN0aXZpdHlJbnRlcmZhY2VGb3I8QT4ge1xuICBpZiAob3B0aW9ucyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignb3B0aW9ucyBtdXN0IGJlIGRlZmluZWQnKTtcbiAgfVxuICAvLyBWYWxpZGF0ZSBhcyBlYXJseSBhcyBwb3NzaWJsZSBmb3IgaW1tZWRpYXRlIHVzZXIgZmVlZGJhY2tcbiAgdmFsaWRhdGVBY3Rpdml0eU9wdGlvbnMob3B0aW9ucyk7XG4gIHJldHVybiBuZXcgUHJveHkoXG4gICAge30sXG4gICAge1xuICAgICAgZ2V0KF8sIGFjdGl2aXR5VHlwZSkge1xuICAgICAgICBpZiAodHlwZW9mIGFjdGl2aXR5VHlwZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBPbmx5IHN0cmluZ3MgYXJlIHN1cHBvcnRlZCBmb3IgQWN0aXZpdHkgdHlwZXMsIGdvdDogJHtTdHJpbmcoYWN0aXZpdHlUeXBlKX1gKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gYWN0aXZpdHlQcm94eUZ1bmN0aW9uKC4uLmFyZ3M6IHVua25vd25bXSk6IFByb21pc2U8dW5rbm93bj4ge1xuICAgICAgICAgIHJldHVybiBzY2hlZHVsZUFjdGl2aXR5KGFjdGl2aXR5VHlwZSwgYXJncywgb3B0aW9ucyk7XG4gICAgICAgIH07XG4gICAgICB9LFxuICAgIH1cbiAgKSBhcyBhbnk7XG59XG5cbi8qKlxuICogQ29uZmlndXJlIExvY2FsIEFjdGl2aXR5IGZ1bmN0aW9ucyB3aXRoIGdpdmVuIHtAbGluayBMb2NhbEFjdGl2aXR5T3B0aW9uc30uXG4gKlxuICogVGhpcyBtZXRob2QgbWF5IGJlIGNhbGxlZCBtdWx0aXBsZSB0aW1lcyB0byBzZXR1cCBBY3Rpdml0aWVzIHdpdGggZGlmZmVyZW50IG9wdGlvbnMuXG4gKlxuICogQHJldHVybiBhIHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9Qcm94eSB8IFByb3h5fVxuICogICAgICAgICBmb3Igd2hpY2ggZWFjaCBhdHRyaWJ1dGUgaXMgYSBjYWxsYWJsZSBBY3Rpdml0eSBmdW5jdGlvblxuICpcbiAqIEBzZWUge0BsaW5rIHByb3h5QWN0aXZpdGllc30gZm9yIGV4YW1wbGVzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwcm94eUxvY2FsQWN0aXZpdGllczxBID0gVW50eXBlZEFjdGl2aXRpZXM+KG9wdGlvbnM6IExvY2FsQWN0aXZpdHlPcHRpb25zKTogQWN0aXZpdHlJbnRlcmZhY2VGb3I8QT4ge1xuICBpZiAob3B0aW9ucyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignb3B0aW9ucyBtdXN0IGJlIGRlZmluZWQnKTtcbiAgfVxuICAvLyBWYWxpZGF0ZSBhcyBlYXJseSBhcyBwb3NzaWJsZSBmb3IgaW1tZWRpYXRlIHVzZXIgZmVlZGJhY2tcbiAgdmFsaWRhdGVMb2NhbEFjdGl2aXR5T3B0aW9ucyhvcHRpb25zKTtcbiAgcmV0dXJuIG5ldyBQcm94eShcbiAgICB7fSxcbiAgICB7XG4gICAgICBnZXQoXywgYWN0aXZpdHlUeXBlKSB7XG4gICAgICAgIGlmICh0eXBlb2YgYWN0aXZpdHlUeXBlICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYE9ubHkgc3RyaW5ncyBhcmUgc3VwcG9ydGVkIGZvciBBY3Rpdml0eSB0eXBlcywgZ290OiAke1N0cmluZyhhY3Rpdml0eVR5cGUpfWApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBsb2NhbEFjdGl2aXR5UHJveHlGdW5jdGlvbiguLi5hcmdzOiB1bmtub3duW10pIHtcbiAgICAgICAgICByZXR1cm4gc2NoZWR1bGVMb2NhbEFjdGl2aXR5KGFjdGl2aXR5VHlwZSwgYXJncywgb3B0aW9ucyk7XG4gICAgICAgIH07XG4gICAgICB9LFxuICAgIH1cbiAgKSBhcyBhbnk7XG59XG5cbi8vIFRPRE86IGRlcHJlY2F0ZSB0aGlzIHBhdGNoIGFmdGVyIFwiZW5vdWdoXCIgdGltZSBoYXMgcGFzc2VkXG5jb25zdCBFWFRFUk5BTF9XRl9DQU5DRUxfUEFUQ0ggPSAnX190ZW1wb3JhbF9pbnRlcm5hbF9jb25uZWN0X2V4dGVybmFsX2hhbmRsZV9jYW5jZWxfdG9fc2NvcGUnO1xuLy8gVGhlIG5hbWUgb2YgdGhpcyBwYXRjaCBjb21lcyBmcm9tIGFuIGF0dGVtcHQgdG8gYnVpbGQgYSBnZW5lcmljIGludGVybmFsIHBhdGNoaW5nIG1lY2hhbmlzbS5cbi8vIFRoYXQgZWZmb3J0IGhhcyBiZWVuIGFiYW5kb25lZCBpbiBmYXZvciBvZiBhIG5ld2VyIFdvcmtmbG93VGFza0NvbXBsZXRlZE1ldGFkYXRhIGJhc2VkIG1lY2hhbmlzbS5cbmNvbnN0IENPTkRJVElPTl8wX1BBVENIID0gJ19fc2RrX2ludGVybmFsX3BhdGNoX251bWJlcjoxJztcblxuLyoqXG4gKiBSZXR1cm5zIGEgY2xpZW50LXNpZGUgaGFuZGxlIHRoYXQgY2FuIGJlIHVzZWQgdG8gc2lnbmFsIGFuZCBjYW5jZWwgYW4gZXhpc3RpbmcgV29ya2Zsb3cgZXhlY3V0aW9uLlxuICogSXQgdGFrZXMgYSBXb3JrZmxvdyBJRCBhbmQgb3B0aW9uYWwgcnVuIElELlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0RXh0ZXJuYWxXb3JrZmxvd0hhbmRsZSh3b3JrZmxvd0lkOiBzdHJpbmcsIHJ1bklkPzogc3RyaW5nKTogRXh0ZXJuYWxXb3JrZmxvd0hhbmRsZSB7XG4gIGNvbnN0IGFjdGl2YXRvciA9IGFzc2VydEluV29ya2Zsb3dDb250ZXh0KFxuICAgICdXb3JrZmxvdy5nZXRFeHRlcm5hbFdvcmtmbG93SGFuZGxlKC4uLikgbWF5IG9ubHkgYmUgdXNlZCBmcm9tIGEgV29ya2Zsb3cgRXhlY3V0aW9uLiBDb25zaWRlciB1c2luZyBDbGllbnQud29ya2Zsb3cuZ2V0SGFuZGxlKC4uLikgaW5zdGVhZC4pJ1xuICApO1xuICByZXR1cm4ge1xuICAgIHdvcmtmbG93SWQsXG4gICAgcnVuSWQsXG4gICAgY2FuY2VsKCkge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPHZvaWQ+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgLy8gQ29ubmVjdCB0aGlzIGNhbmNlbCBvcGVyYXRpb24gdG8gdGhlIGN1cnJlbnQgY2FuY2VsbGF0aW9uIHNjb3BlLlxuICAgICAgICAvLyBUaGlzIGlzIGJlaGF2aW9yIHdhcyBpbnRyb2R1Y2VkIGFmdGVyIHYwLjIyLjAgYW5kIGlzIGluY29tcGF0aWJsZVxuICAgICAgICAvLyB3aXRoIGhpc3RvcmllcyBnZW5lcmF0ZWQgd2l0aCBwcmV2aW91cyBTREsgdmVyc2lvbnMgYW5kIHRodXMgcmVxdWlyZXNcbiAgICAgICAgLy8gcGF0Y2hpbmcuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIFdlIHRyeSB0byBkZWxheSBwYXRjaGluZyBhcyBtdWNoIGFzIHBvc3NpYmxlIHRvIGF2b2lkIHBvbGx1dGluZ1xuICAgICAgICAvLyBoaXN0b3JpZXMgdW5sZXNzIHN0cmljdGx5IHJlcXVpcmVkLlxuICAgICAgICBjb25zdCBzY29wZSA9IENhbmNlbGxhdGlvblNjb3BlLmN1cnJlbnQoKTtcbiAgICAgICAgaWYgKHNjb3BlLmNhbmNlbGxhYmxlKSB7XG4gICAgICAgICAgdW50cmFja1Byb21pc2UoXG4gICAgICAgICAgICBzY29wZS5jYW5jZWxSZXF1ZXN0ZWQuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgICBpZiAocGF0Y2hlZChFWFRFUk5BTF9XRl9DQU5DRUxfUEFUQ0gpKSB7XG4gICAgICAgICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc2NvcGUuY29uc2lkZXJlZENhbmNlbGxlZCkge1xuICAgICAgICAgIGlmIChwYXRjaGVkKEVYVEVSTkFMX1dGX0NBTkNFTF9QQVRDSCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzZXEgPSBhY3RpdmF0b3IubmV4dFNlcXMuY2FuY2VsV29ya2Zsb3crKztcbiAgICAgICAgYWN0aXZhdG9yLnB1c2hDb21tYW5kKHtcbiAgICAgICAgICByZXF1ZXN0Q2FuY2VsRXh0ZXJuYWxXb3JrZmxvd0V4ZWN1dGlvbjoge1xuICAgICAgICAgICAgc2VxLFxuICAgICAgICAgICAgd29ya2Zsb3dFeGVjdXRpb246IHtcbiAgICAgICAgICAgICAgbmFtZXNwYWNlOiBhY3RpdmF0b3IuaW5mby5uYW1lc3BhY2UsXG4gICAgICAgICAgICAgIHdvcmtmbG93SWQsXG4gICAgICAgICAgICAgIHJ1bklkLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICAgICAgYWN0aXZhdG9yLmNvbXBsZXRpb25zLmNhbmNlbFdvcmtmbG93LnNldChzZXEsIHsgcmVzb2x2ZSwgcmVqZWN0IH0pO1xuICAgICAgfSk7XG4gICAgfSxcbiAgICBzaWduYWw8QXJncyBleHRlbmRzIGFueVtdPihkZWY6IFNpZ25hbERlZmluaXRpb248QXJncz4gfCBzdHJpbmcsIC4uLmFyZ3M6IEFyZ3MpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgIHJldHVybiBjb21wb3NlSW50ZXJjZXB0b3JzKFxuICAgICAgICBhY3RpdmF0b3IuaW50ZXJjZXB0b3JzLm91dGJvdW5kLFxuICAgICAgICAnc2lnbmFsV29ya2Zsb3cnLFxuICAgICAgICBzaWduYWxXb3JrZmxvd05leHRIYW5kbGVyXG4gICAgICApKHtcbiAgICAgICAgc2VxOiBhY3RpdmF0b3IubmV4dFNlcXMuc2lnbmFsV29ya2Zsb3crKyxcbiAgICAgICAgc2lnbmFsTmFtZTogdHlwZW9mIGRlZiA9PT0gJ3N0cmluZycgPyBkZWYgOiBkZWYubmFtZSxcbiAgICAgICAgYXJncyxcbiAgICAgICAgdGFyZ2V0OiB7XG4gICAgICAgICAgdHlwZTogJ2V4dGVybmFsJyxcbiAgICAgICAgICB3b3JrZmxvd0V4ZWN1dGlvbjogeyB3b3JrZmxvd0lkLCBydW5JZCB9LFxuICAgICAgICB9LFxuICAgICAgICBoZWFkZXJzOiB7fSxcbiAgICAgIH0pO1xuICAgIH0sXG4gIH07XG59XG5cbi8qKlxuICogU3RhcnQgYSBjaGlsZCBXb3JrZmxvdyBleGVjdXRpb25cbiAqXG4gKiAtIFJldHVybnMgYSBjbGllbnQtc2lkZSBoYW5kbGUgdGhhdCBpbXBsZW1lbnRzIGEgY2hpbGQgV29ya2Zsb3cgaW50ZXJmYWNlLlxuICogLSBCeSBkZWZhdWx0LCBhIGNoaWxkIHdpbGwgYmUgc2NoZWR1bGVkIG9uIHRoZSBzYW1lIHRhc2sgcXVldWUgYXMgaXRzIHBhcmVudC5cbiAqXG4gKiBBIGNoaWxkIFdvcmtmbG93IGhhbmRsZSBzdXBwb3J0cyBhd2FpdGluZyBjb21wbGV0aW9uLCBzaWduYWxpbmcgYW5kIGNhbmNlbGxhdGlvbiB2aWEge0BsaW5rIENhbmNlbGxhdGlvblNjb3BlfXMuXG4gKiBJbiBvcmRlciB0byBxdWVyeSB0aGUgY2hpbGQsIHVzZSBhIHtAbGluayBXb3JrZmxvd0NsaWVudH0gZnJvbSBhbiBBY3Rpdml0eS5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHN0YXJ0Q2hpbGQ8VCBleHRlbmRzIFdvcmtmbG93PihcbiAgd29ya2Zsb3dUeXBlOiBzdHJpbmcsXG4gIG9wdGlvbnM6IFdpdGhXb3JrZmxvd0FyZ3M8VCwgQ2hpbGRXb3JrZmxvd09wdGlvbnM+XG4pOiBQcm9taXNlPENoaWxkV29ya2Zsb3dIYW5kbGU8VD4+O1xuXG4vKipcbiAqIFN0YXJ0IGEgY2hpbGQgV29ya2Zsb3cgZXhlY3V0aW9uXG4gKlxuICogLSBSZXR1cm5zIGEgY2xpZW50LXNpZGUgaGFuZGxlIHRoYXQgaW1wbGVtZW50cyBhIGNoaWxkIFdvcmtmbG93IGludGVyZmFjZS5cbiAqIC0gRGVkdWNlcyB0aGUgV29ya2Zsb3cgdHlwZSBhbmQgc2lnbmF0dXJlIGZyb20gcHJvdmlkZWQgV29ya2Zsb3cgZnVuY3Rpb24uXG4gKiAtIEJ5IGRlZmF1bHQsIGEgY2hpbGQgd2lsbCBiZSBzY2hlZHVsZWQgb24gdGhlIHNhbWUgdGFzayBxdWV1ZSBhcyBpdHMgcGFyZW50LlxuICpcbiAqIEEgY2hpbGQgV29ya2Zsb3cgaGFuZGxlIHN1cHBvcnRzIGF3YWl0aW5nIGNvbXBsZXRpb24sIHNpZ25hbGluZyBhbmQgY2FuY2VsbGF0aW9uIHZpYSB7QGxpbmsgQ2FuY2VsbGF0aW9uU2NvcGV9cy5cbiAqIEluIG9yZGVyIHRvIHF1ZXJ5IHRoZSBjaGlsZCwgdXNlIGEge0BsaW5rIFdvcmtmbG93Q2xpZW50fSBmcm9tIGFuIEFjdGl2aXR5LlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc3RhcnRDaGlsZDxUIGV4dGVuZHMgV29ya2Zsb3c+KFxuICB3b3JrZmxvd0Z1bmM6IFQsXG4gIG9wdGlvbnM6IFdpdGhXb3JrZmxvd0FyZ3M8VCwgQ2hpbGRXb3JrZmxvd09wdGlvbnM+XG4pOiBQcm9taXNlPENoaWxkV29ya2Zsb3dIYW5kbGU8VD4+O1xuXG4vKipcbiAqIFN0YXJ0IGEgY2hpbGQgV29ya2Zsb3cgZXhlY3V0aW9uXG4gKlxuICogKipPdmVycmlkZSBmb3IgV29ya2Zsb3dzIHRoYXQgYWNjZXB0IG5vIGFyZ3VtZW50cyoqLlxuICpcbiAqIC0gUmV0dXJucyBhIGNsaWVudC1zaWRlIGhhbmRsZSB0aGF0IGltcGxlbWVudHMgYSBjaGlsZCBXb3JrZmxvdyBpbnRlcmZhY2UuXG4gKiAtIFRoZSBjaGlsZCB3aWxsIGJlIHNjaGVkdWxlZCBvbiB0aGUgc2FtZSB0YXNrIHF1ZXVlIGFzIGl0cyBwYXJlbnQuXG4gKlxuICogQSBjaGlsZCBXb3JrZmxvdyBoYW5kbGUgc3VwcG9ydHMgYXdhaXRpbmcgY29tcGxldGlvbiwgc2lnbmFsaW5nIGFuZCBjYW5jZWxsYXRpb24gdmlhIHtAbGluayBDYW5jZWxsYXRpb25TY29wZX1zLlxuICogSW4gb3JkZXIgdG8gcXVlcnkgdGhlIGNoaWxkLCB1c2UgYSB7QGxpbmsgV29ya2Zsb3dDbGllbnR9IGZyb20gYW4gQWN0aXZpdHkuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzdGFydENoaWxkPFQgZXh0ZW5kcyAoKSA9PiBQcm9taXNlPGFueT4+KHdvcmtmbG93VHlwZTogc3RyaW5nKTogUHJvbWlzZTxDaGlsZFdvcmtmbG93SGFuZGxlPFQ+PjtcblxuLyoqXG4gKiBTdGFydCBhIGNoaWxkIFdvcmtmbG93IGV4ZWN1dGlvblxuICpcbiAqICoqT3ZlcnJpZGUgZm9yIFdvcmtmbG93cyB0aGF0IGFjY2VwdCBubyBhcmd1bWVudHMqKi5cbiAqXG4gKiAtIFJldHVybnMgYSBjbGllbnQtc2lkZSBoYW5kbGUgdGhhdCBpbXBsZW1lbnRzIGEgY2hpbGQgV29ya2Zsb3cgaW50ZXJmYWNlLlxuICogLSBEZWR1Y2VzIHRoZSBXb3JrZmxvdyB0eXBlIGFuZCBzaWduYXR1cmUgZnJvbSBwcm92aWRlZCBXb3JrZmxvdyBmdW5jdGlvbi5cbiAqIC0gVGhlIGNoaWxkIHdpbGwgYmUgc2NoZWR1bGVkIG9uIHRoZSBzYW1lIHRhc2sgcXVldWUgYXMgaXRzIHBhcmVudC5cbiAqXG4gKiBBIGNoaWxkIFdvcmtmbG93IGhhbmRsZSBzdXBwb3J0cyBhd2FpdGluZyBjb21wbGV0aW9uLCBzaWduYWxpbmcgYW5kIGNhbmNlbGxhdGlvbiB2aWEge0BsaW5rIENhbmNlbGxhdGlvblNjb3BlfXMuXG4gKiBJbiBvcmRlciB0byBxdWVyeSB0aGUgY2hpbGQsIHVzZSBhIHtAbGluayBXb3JrZmxvd0NsaWVudH0gZnJvbSBhbiBBY3Rpdml0eS5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHN0YXJ0Q2hpbGQ8VCBleHRlbmRzICgpID0+IFByb21pc2U8YW55Pj4od29ya2Zsb3dGdW5jOiBUKTogUHJvbWlzZTxDaGlsZFdvcmtmbG93SGFuZGxlPFQ+PjtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHN0YXJ0Q2hpbGQ8VCBleHRlbmRzIFdvcmtmbG93PihcbiAgd29ya2Zsb3dUeXBlT3JGdW5jOiBzdHJpbmcgfCBULFxuICBvcHRpb25zPzogV2l0aFdvcmtmbG93QXJnczxULCBDaGlsZFdvcmtmbG93T3B0aW9ucz5cbik6IFByb21pc2U8Q2hpbGRXb3JrZmxvd0hhbmRsZTxUPj4ge1xuICBjb25zdCBhY3RpdmF0b3IgPSBhc3NlcnRJbldvcmtmbG93Q29udGV4dChcbiAgICAnV29ya2Zsb3cuc3RhcnRDaGlsZCguLi4pIG1heSBvbmx5IGJlIHVzZWQgZnJvbSBhIFdvcmtmbG93IEV4ZWN1dGlvbi4gQ29uc2lkZXIgdXNpbmcgQ2xpZW50LndvcmtmbG93LnN0YXJ0KC4uLikgaW5zdGVhZC4pJ1xuICApO1xuICBjb25zdCBvcHRpb25zV2l0aERlZmF1bHRzID0gYWRkRGVmYXVsdFdvcmtmbG93T3B0aW9ucyhvcHRpb25zID8/ICh7fSBhcyBhbnkpKTtcbiAgY29uc3Qgd29ya2Zsb3dUeXBlID0gZXh0cmFjdFdvcmtmbG93VHlwZSh3b3JrZmxvd1R5cGVPckZ1bmMpO1xuICBjb25zdCBleGVjdXRlID0gY29tcG9zZUludGVyY2VwdG9ycyhcbiAgICBhY3RpdmF0b3IuaW50ZXJjZXB0b3JzLm91dGJvdW5kLFxuICAgICdzdGFydENoaWxkV29ya2Zsb3dFeGVjdXRpb24nLFxuICAgIHN0YXJ0Q2hpbGRXb3JrZmxvd0V4ZWN1dGlvbk5leHRIYW5kbGVyXG4gICk7XG4gIGNvbnN0IFtzdGFydGVkLCBjb21wbGV0ZWRdID0gYXdhaXQgZXhlY3V0ZSh7XG4gICAgc2VxOiBhY3RpdmF0b3IubmV4dFNlcXMuY2hpbGRXb3JrZmxvdysrLFxuICAgIG9wdGlvbnM6IG9wdGlvbnNXaXRoRGVmYXVsdHMsXG4gICAgaGVhZGVyczoge30sXG4gICAgd29ya2Zsb3dUeXBlLFxuICB9KTtcbiAgY29uc3QgZmlyc3RFeGVjdXRpb25SdW5JZCA9IGF3YWl0IHN0YXJ0ZWQ7XG5cbiAgcmV0dXJuIHtcbiAgICB3b3JrZmxvd0lkOiBvcHRpb25zV2l0aERlZmF1bHRzLndvcmtmbG93SWQsXG4gICAgZmlyc3RFeGVjdXRpb25SdW5JZCxcbiAgICBhc3luYyByZXN1bHQoKTogUHJvbWlzZTxXb3JrZmxvd1Jlc3VsdFR5cGU8VD4+IHtcbiAgICAgIHJldHVybiAoYXdhaXQgY29tcGxldGVkKSBhcyBhbnk7XG4gICAgfSxcbiAgICBhc3luYyBzaWduYWw8QXJncyBleHRlbmRzIGFueVtdPihkZWY6IFNpZ25hbERlZmluaXRpb248QXJncz4gfCBzdHJpbmcsIC4uLmFyZ3M6IEFyZ3MpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgIHJldHVybiBjb21wb3NlSW50ZXJjZXB0b3JzKFxuICAgICAgICBhY3RpdmF0b3IuaW50ZXJjZXB0b3JzLm91dGJvdW5kLFxuICAgICAgICAnc2lnbmFsV29ya2Zsb3cnLFxuICAgICAgICBzaWduYWxXb3JrZmxvd05leHRIYW5kbGVyXG4gICAgICApKHtcbiAgICAgICAgc2VxOiBhY3RpdmF0b3IubmV4dFNlcXMuc2lnbmFsV29ya2Zsb3crKyxcbiAgICAgICAgc2lnbmFsTmFtZTogdHlwZW9mIGRlZiA9PT0gJ3N0cmluZycgPyBkZWYgOiBkZWYubmFtZSxcbiAgICAgICAgYXJncyxcbiAgICAgICAgdGFyZ2V0OiB7XG4gICAgICAgICAgdHlwZTogJ2NoaWxkJyxcbiAgICAgICAgICBjaGlsZFdvcmtmbG93SWQ6IG9wdGlvbnNXaXRoRGVmYXVsdHMud29ya2Zsb3dJZCxcbiAgICAgICAgfSxcbiAgICAgICAgaGVhZGVyczoge30sXG4gICAgICB9KTtcbiAgICB9LFxuICB9O1xufVxuXG4vKipcbiAqIFN0YXJ0IGEgY2hpbGQgV29ya2Zsb3cgZXhlY3V0aW9uIGFuZCBhd2FpdCBpdHMgY29tcGxldGlvbi5cbiAqXG4gKiAtIEJ5IGRlZmF1bHQsIGEgY2hpbGQgd2lsbCBiZSBzY2hlZHVsZWQgb24gdGhlIHNhbWUgdGFzayBxdWV1ZSBhcyBpdHMgcGFyZW50LlxuICogLSBUaGlzIG9wZXJhdGlvbiBpcyBjYW5jZWxsYWJsZSB1c2luZyB7QGxpbmsgQ2FuY2VsbGF0aW9uU2NvcGV9cy5cbiAqXG4gKiBAcmV0dXJuIFRoZSByZXN1bHQgb2YgdGhlIGNoaWxkIFdvcmtmbG93LlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZXhlY3V0ZUNoaWxkPFQgZXh0ZW5kcyBXb3JrZmxvdz4oXG4gIHdvcmtmbG93VHlwZTogc3RyaW5nLFxuICBvcHRpb25zOiBXaXRoV29ya2Zsb3dBcmdzPFQsIENoaWxkV29ya2Zsb3dPcHRpb25zPlxuKTogUHJvbWlzZTxXb3JrZmxvd1Jlc3VsdFR5cGU8VD4+O1xuXG4vKipcbiAqIFN0YXJ0IGEgY2hpbGQgV29ya2Zsb3cgZXhlY3V0aW9uIGFuZCBhd2FpdCBpdHMgY29tcGxldGlvbi5cbiAqXG4gKiAtIEJ5IGRlZmF1bHQsIGEgY2hpbGQgd2lsbCBiZSBzY2hlZHVsZWQgb24gdGhlIHNhbWUgdGFzayBxdWV1ZSBhcyBpdHMgcGFyZW50LlxuICogLSBEZWR1Y2VzIHRoZSBXb3JrZmxvdyB0eXBlIGFuZCBzaWduYXR1cmUgZnJvbSBwcm92aWRlZCBXb3JrZmxvdyBmdW5jdGlvbi5cbiAqIC0gVGhpcyBvcGVyYXRpb24gaXMgY2FuY2VsbGFibGUgdXNpbmcge0BsaW5rIENhbmNlbGxhdGlvblNjb3BlfXMuXG4gKlxuICogQHJldHVybiBUaGUgcmVzdWx0IG9mIHRoZSBjaGlsZCBXb3JrZmxvdy5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGV4ZWN1dGVDaGlsZDxUIGV4dGVuZHMgV29ya2Zsb3c+KFxuICB3b3JrZmxvd0Z1bmM6IFQsXG4gIG9wdGlvbnM6IFdpdGhXb3JrZmxvd0FyZ3M8VCwgQ2hpbGRXb3JrZmxvd09wdGlvbnM+XG4pOiBQcm9taXNlPFdvcmtmbG93UmVzdWx0VHlwZTxUPj47XG5cbi8qKlxuICogU3RhcnQgYSBjaGlsZCBXb3JrZmxvdyBleGVjdXRpb24gYW5kIGF3YWl0IGl0cyBjb21wbGV0aW9uLlxuICpcbiAqICoqT3ZlcnJpZGUgZm9yIFdvcmtmbG93cyB0aGF0IGFjY2VwdCBubyBhcmd1bWVudHMqKi5cbiAqXG4gKiAtIFRoZSBjaGlsZCB3aWxsIGJlIHNjaGVkdWxlZCBvbiB0aGUgc2FtZSB0YXNrIHF1ZXVlIGFzIGl0cyBwYXJlbnQuXG4gKiAtIFRoaXMgb3BlcmF0aW9uIGlzIGNhbmNlbGxhYmxlIHVzaW5nIHtAbGluayBDYW5jZWxsYXRpb25TY29wZX1zLlxuICpcbiAqIEByZXR1cm4gVGhlIHJlc3VsdCBvZiB0aGUgY2hpbGQgV29ya2Zsb3cuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBleGVjdXRlQ2hpbGQ8VCBleHRlbmRzICgpID0+IFdvcmtmbG93UmV0dXJuVHlwZT4oXG4gIHdvcmtmbG93VHlwZTogc3RyaW5nXG4pOiBQcm9taXNlPFdvcmtmbG93UmVzdWx0VHlwZTxUPj47XG5cbi8qKlxuICogU3RhcnQgYSBjaGlsZCBXb3JrZmxvdyBleGVjdXRpb24gYW5kIGF3YWl0IGl0cyBjb21wbGV0aW9uLlxuICpcbiAqICoqT3ZlcnJpZGUgZm9yIFdvcmtmbG93cyB0aGF0IGFjY2VwdCBubyBhcmd1bWVudHMqKi5cbiAqXG4gKiAtIFRoZSBjaGlsZCB3aWxsIGJlIHNjaGVkdWxlZCBvbiB0aGUgc2FtZSB0YXNrIHF1ZXVlIGFzIGl0cyBwYXJlbnQuXG4gKiAtIERlZHVjZXMgdGhlIFdvcmtmbG93IHR5cGUgYW5kIHNpZ25hdHVyZSBmcm9tIHByb3ZpZGVkIFdvcmtmbG93IGZ1bmN0aW9uLlxuICogLSBUaGlzIG9wZXJhdGlvbiBpcyBjYW5jZWxsYWJsZSB1c2luZyB7QGxpbmsgQ2FuY2VsbGF0aW9uU2NvcGV9cy5cbiAqXG4gKiBAcmV0dXJuIFRoZSByZXN1bHQgb2YgdGhlIGNoaWxkIFdvcmtmbG93LlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZXhlY3V0ZUNoaWxkPFQgZXh0ZW5kcyAoKSA9PiBXb3JrZmxvd1JldHVyblR5cGU+KHdvcmtmbG93RnVuYzogVCk6IFByb21pc2U8V29ya2Zsb3dSZXN1bHRUeXBlPFQ+PjtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGV4ZWN1dGVDaGlsZDxUIGV4dGVuZHMgV29ya2Zsb3c+KFxuICB3b3JrZmxvd1R5cGVPckZ1bmM6IHN0cmluZyB8IFQsXG4gIG9wdGlvbnM/OiBXaXRoV29ya2Zsb3dBcmdzPFQsIENoaWxkV29ya2Zsb3dPcHRpb25zPlxuKTogUHJvbWlzZTxXb3JrZmxvd1Jlc3VsdFR5cGU8VD4+IHtcbiAgY29uc3QgYWN0aXZhdG9yID0gYXNzZXJ0SW5Xb3JrZmxvd0NvbnRleHQoXG4gICAgJ1dvcmtmbG93LmV4ZWN1dGVDaGlsZCguLi4pIG1heSBvbmx5IGJlIHVzZWQgZnJvbSBhIFdvcmtmbG93IEV4ZWN1dGlvbi4gQ29uc2lkZXIgdXNpbmcgQ2xpZW50LndvcmtmbG93LmV4ZWN1dGUoLi4uKSBpbnN0ZWFkLidcbiAgKTtcbiAgY29uc3Qgb3B0aW9uc1dpdGhEZWZhdWx0cyA9IGFkZERlZmF1bHRXb3JrZmxvd09wdGlvbnMob3B0aW9ucyA/PyAoe30gYXMgYW55KSk7XG4gIGNvbnN0IHdvcmtmbG93VHlwZSA9IGV4dHJhY3RXb3JrZmxvd1R5cGUod29ya2Zsb3dUeXBlT3JGdW5jKTtcbiAgY29uc3QgZXhlY3V0ZSA9IGNvbXBvc2VJbnRlcmNlcHRvcnMoXG4gICAgYWN0aXZhdG9yLmludGVyY2VwdG9ycy5vdXRib3VuZCxcbiAgICAnc3RhcnRDaGlsZFdvcmtmbG93RXhlY3V0aW9uJyxcbiAgICBzdGFydENoaWxkV29ya2Zsb3dFeGVjdXRpb25OZXh0SGFuZGxlclxuICApO1xuICBjb25zdCBleGVjUHJvbWlzZSA9IGV4ZWN1dGUoe1xuICAgIHNlcTogYWN0aXZhdG9yLm5leHRTZXFzLmNoaWxkV29ya2Zsb3crKyxcbiAgICBvcHRpb25zOiBvcHRpb25zV2l0aERlZmF1bHRzLFxuICAgIGhlYWRlcnM6IHt9LFxuICAgIHdvcmtmbG93VHlwZSxcbiAgfSk7XG4gIHVudHJhY2tQcm9taXNlKGV4ZWNQcm9taXNlKTtcbiAgY29uc3QgY29tcGxldGVkUHJvbWlzZSA9IGV4ZWNQcm9taXNlLnRoZW4oKFtfc3RhcnRlZCwgY29tcGxldGVkXSkgPT4gY29tcGxldGVkKTtcbiAgdW50cmFja1Byb21pc2UoY29tcGxldGVkUHJvbWlzZSk7XG4gIHJldHVybiBjb21wbGV0ZWRQcm9taXNlIGFzIFByb21pc2U8YW55Pjtcbn1cblxuLyoqXG4gKiBHZXQgaW5mb3JtYXRpb24gYWJvdXQgdGhlIGN1cnJlbnQgV29ya2Zsb3cuXG4gKlxuICogV0FSTklORzogVGhpcyBmdW5jdGlvbiByZXR1cm5zIGEgZnJvemVuIGNvcHkgb2YgV29ya2Zsb3dJbmZvLCBhdCB0aGUgcG9pbnQgd2hlcmUgdGhpcyBtZXRob2QgaGFzIGJlZW4gY2FsbGVkLlxuICogQ2hhbmdlcyBoYXBwZW5pbmcgYXQgbGF0ZXIgcG9pbnQgaW4gd29ya2Zsb3cgZXhlY3V0aW9uIHdpbGwgbm90IGJlIHJlZmxlY3RlZCBpbiB0aGUgcmV0dXJuZWQgb2JqZWN0LlxuICpcbiAqIEZvciB0aGlzIHJlYXNvbiwgd2UgcmVjb21tZW5kIGNhbGxpbmcgYHdvcmtmbG93SW5mbygpYCBvbiBldmVyeSBhY2Nlc3MgdG8ge0BsaW5rIFdvcmtmbG93SW5mb30ncyBmaWVsZHMsXG4gKiByYXRoZXIgdGhhbiBjYWNoaW5nIHRoZSBgV29ya2Zsb3dJbmZvYCBvYmplY3QgKG9yIHBhcnQgb2YgaXQpIGluIGEgbG9jYWwgdmFyaWFibGUuIEZvciBleGFtcGxlOlxuICpcbiAqIGBgYHRzXG4gKiAvLyBHT09EXG4gKiBmdW5jdGlvbiBteVdvcmtmbG93KCkge1xuICogICBkb1NvbWV0aGluZyh3b3JrZmxvd0luZm8oKS5zZWFyY2hBdHRyaWJ1dGVzKVxuICogICAuLi5cbiAqICAgZG9Tb21ldGhpbmdFbHNlKHdvcmtmbG93SW5mbygpLnNlYXJjaEF0dHJpYnV0ZXMpXG4gKiB9XG4gKiBgYGBcbiAqXG4gKiB2c1xuICpcbiAqIGBgYHRzXG4gKiAvLyBCQURcbiAqIGZ1bmN0aW9uIG15V29ya2Zsb3coKSB7XG4gKiAgIGNvbnN0IGF0dHJpYnV0ZXMgPSB3b3JrZmxvd0luZm8oKS5zZWFyY2hBdHRyaWJ1dGVzXG4gKiAgIGRvU29tZXRoaW5nKGF0dHJpYnV0ZXMpXG4gKiAgIC4uLlxuICogICBkb1NvbWV0aGluZ0Vsc2UoYXR0cmlidXRlcylcbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gd29ya2Zsb3dJbmZvKCk6IFdvcmtmbG93SW5mbyB7XG4gIGNvbnN0IGFjdGl2YXRvciA9IGFzc2VydEluV29ya2Zsb3dDb250ZXh0KCdXb3JrZmxvdy53b3JrZmxvd0luZm8oLi4uKSBtYXkgb25seSBiZSB1c2VkIGZyb20gYSBXb3JrZmxvdyBFeGVjdXRpb24uJyk7XG4gIHJldHVybiBhY3RpdmF0b3IuaW5mbztcbn1cblxuLyoqXG4gKiBHZXQgaW5mb3JtYXRpb24gYWJvdXQgdGhlIGN1cnJlbnQgdXBkYXRlIGlmIGFueS5cbiAqXG4gKiBAcmV0dXJuIEluZm8gZm9yIHRoZSBjdXJyZW50IHVwZGF0ZSBoYW5kbGVyIHRoZSBjb2RlIGNhbGxpbmcgdGhpcyBpcyBleGVjdXRpbmdcbiAqIHdpdGhpbiBpZiBhbnkuXG4gKlxuICogQGV4cGVyaW1lbnRhbFxuICovXG5leHBvcnQgZnVuY3Rpb24gY3VycmVudFVwZGF0ZUluZm8oKTogVXBkYXRlSW5mbyB8IHVuZGVmaW5lZCB7XG4gIGFzc2VydEluV29ya2Zsb3dDb250ZXh0KCdXb3JrZmxvdy5jdXJyZW50VXBkYXRlSW5mbyguLi4pIG1heSBvbmx5IGJlIHVzZWQgZnJvbSBhIFdvcmtmbG93IEV4ZWN1dGlvbi4nKTtcbiAgcmV0dXJuIFVwZGF0ZVNjb3BlLmN1cnJlbnQoKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IGNvZGUgaXMgZXhlY3V0aW5nIGluIHdvcmtmbG93IGNvbnRleHRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGluV29ya2Zsb3dDb250ZXh0KCk6IGJvb2xlYW4ge1xuICByZXR1cm4gbWF5YmVHZXRBY3RpdmF0b3IoKSAhPT0gdW5kZWZpbmVkO1xufVxuXG4vKipcbiAqIFJldHVybnMgYSBmdW5jdGlvbiBgZmAgdGhhdCB3aWxsIGNhdXNlIHRoZSBjdXJyZW50IFdvcmtmbG93IHRvIENvbnRpbnVlQXNOZXcgd2hlbiBjYWxsZWQuXG4gKlxuICogYGZgIHRha2VzIHRoZSBzYW1lIGFyZ3VtZW50cyBhcyB0aGUgV29ya2Zsb3cgZnVuY3Rpb24gc3VwcGxpZWQgdG8gdHlwZXBhcmFtIGBGYC5cbiAqXG4gKiBPbmNlIGBmYCBpcyBjYWxsZWQsIFdvcmtmbG93IEV4ZWN1dGlvbiBpbW1lZGlhdGVseSBjb21wbGV0ZXMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtYWtlQ29udGludWVBc05ld0Z1bmM8RiBleHRlbmRzIFdvcmtmbG93PihcbiAgb3B0aW9ucz86IENvbnRpbnVlQXNOZXdPcHRpb25zXG4pOiAoLi4uYXJnczogUGFyYW1ldGVyczxGPikgPT4gUHJvbWlzZTxuZXZlcj4ge1xuICBjb25zdCBhY3RpdmF0b3IgPSBhc3NlcnRJbldvcmtmbG93Q29udGV4dChcbiAgICAnV29ya2Zsb3cuY29udGludWVBc05ldyguLi4pIGFuZCBXb3JrZmxvdy5tYWtlQ29udGludWVBc05ld0Z1bmMoLi4uKSBtYXkgb25seSBiZSB1c2VkIGZyb20gYSBXb3JrZmxvdyBFeGVjdXRpb24uJ1xuICApO1xuICBjb25zdCBpbmZvID0gYWN0aXZhdG9yLmluZm87XG4gIGNvbnN0IHsgd29ya2Zsb3dUeXBlLCB0YXNrUXVldWUsIC4uLnJlc3QgfSA9IG9wdGlvbnMgPz8ge307XG4gIGNvbnN0IHJlcXVpcmVkT3B0aW9ucyA9IHtcbiAgICB3b3JrZmxvd1R5cGU6IHdvcmtmbG93VHlwZSA/PyBpbmZvLndvcmtmbG93VHlwZSxcbiAgICB0YXNrUXVldWU6IHRhc2tRdWV1ZSA/PyBpbmZvLnRhc2tRdWV1ZSxcbiAgICAuLi5yZXN0LFxuICB9O1xuXG4gIHJldHVybiAoLi4uYXJnczogUGFyYW1ldGVyczxGPik6IFByb21pc2U8bmV2ZXI+ID0+IHtcbiAgICBjb25zdCBmbiA9IGNvbXBvc2VJbnRlcmNlcHRvcnMoYWN0aXZhdG9yLmludGVyY2VwdG9ycy5vdXRib3VuZCwgJ2NvbnRpbnVlQXNOZXcnLCBhc3luYyAoaW5wdXQpID0+IHtcbiAgICAgIGNvbnN0IHsgaGVhZGVycywgYXJncywgb3B0aW9ucyB9ID0gaW5wdXQ7XG4gICAgICB0aHJvdyBuZXcgQ29udGludWVBc05ldyh7XG4gICAgICAgIHdvcmtmbG93VHlwZTogb3B0aW9ucy53b3JrZmxvd1R5cGUsXG4gICAgICAgIGFyZ3VtZW50czogdG9QYXlsb2FkcyhhY3RpdmF0b3IucGF5bG9hZENvbnZlcnRlciwgLi4uYXJncyksXG4gICAgICAgIGhlYWRlcnMsXG4gICAgICAgIHRhc2tRdWV1ZTogb3B0aW9ucy50YXNrUXVldWUsXG4gICAgICAgIG1lbW86IG9wdGlvbnMubWVtbyAmJiBtYXBUb1BheWxvYWRzKGFjdGl2YXRvci5wYXlsb2FkQ29udmVydGVyLCBvcHRpb25zLm1lbW8pLFxuICAgICAgICBzZWFyY2hBdHRyaWJ1dGVzOiBvcHRpb25zLnNlYXJjaEF0dHJpYnV0ZXNcbiAgICAgICAgICA/IG1hcFRvUGF5bG9hZHMoc2VhcmNoQXR0cmlidXRlUGF5bG9hZENvbnZlcnRlciwgb3B0aW9ucy5zZWFyY2hBdHRyaWJ1dGVzKVxuICAgICAgICAgIDogdW5kZWZpbmVkLFxuICAgICAgICB3b3JrZmxvd1J1blRpbWVvdXQ6IG1zT3B0aW9uYWxUb1RzKG9wdGlvbnMud29ya2Zsb3dSdW5UaW1lb3V0KSxcbiAgICAgICAgd29ya2Zsb3dUYXNrVGltZW91dDogbXNPcHRpb25hbFRvVHMob3B0aW9ucy53b3JrZmxvd1Rhc2tUaW1lb3V0KSxcbiAgICAgICAgdmVyc2lvbmluZ0ludGVudDogdmVyc2lvbmluZ0ludGVudFRvUHJvdG8ob3B0aW9ucy52ZXJzaW9uaW5nSW50ZW50KSxcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIHJldHVybiBmbih7XG4gICAgICBhcmdzLFxuICAgICAgaGVhZGVyczoge30sXG4gICAgICBvcHRpb25zOiByZXF1aXJlZE9wdGlvbnMsXG4gICAgfSk7XG4gIH07XG59XG5cbi8qKlxuICoge0BsaW5rIGh0dHBzOi8vZG9jcy50ZW1wb3JhbC5pby9jb25jZXB0cy93aGF0LWlzLWNvbnRpbnVlLWFzLW5ldy8gfCBDb250aW51ZXMtQXMtTmV3fSB0aGUgY3VycmVudCBXb3JrZmxvdyBFeGVjdXRpb25cbiAqIHdpdGggZGVmYXVsdCBvcHRpb25zLlxuICpcbiAqIFNob3J0aGFuZCBmb3IgYG1ha2VDb250aW51ZUFzTmV3RnVuYzxGPigpKC4uLmFyZ3MpYC4gKFNlZToge0BsaW5rIG1ha2VDb250aW51ZUFzTmV3RnVuY30uKVxuICpcbiAqIEBleGFtcGxlXG4gKlxuICpgYGB0c1xuICppbXBvcnQgeyBjb250aW51ZUFzTmV3IH0gZnJvbSAnQHRlbXBvcmFsaW8vd29ya2Zsb3cnO1xuICpcbiAqZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG15V29ya2Zsb3cobjogbnVtYmVyKTogUHJvbWlzZTx2b2lkPiB7XG4gKiAgLy8gLi4uIFdvcmtmbG93IGxvZ2ljXG4gKiAgYXdhaXQgY29udGludWVBc05ldzx0eXBlb2YgbXlXb3JrZmxvdz4obiArIDEpO1xuICp9XG4gKmBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gY29udGludWVBc05ldzxGIGV4dGVuZHMgV29ya2Zsb3c+KC4uLmFyZ3M6IFBhcmFtZXRlcnM8Rj4pOiBQcm9taXNlPG5ldmVyPiB7XG4gIHJldHVybiBtYWtlQ29udGludWVBc05ld0Z1bmMoKSguLi5hcmdzKTtcbn1cblxuLyoqXG4gKiBHZW5lcmF0ZSBhbiBSRkMgY29tcGxpYW50IFY0IHV1aWQuXG4gKiBVc2VzIHRoZSB3b3JrZmxvdydzIGRldGVybWluaXN0aWMgUFJORyBtYWtpbmcgaXQgc2FmZSBmb3IgdXNlIHdpdGhpbiBhIHdvcmtmbG93LlxuICogVGhpcyBmdW5jdGlvbiBpcyBjcnlwdG9ncmFwaGljYWxseSBpbnNlY3VyZS5cbiAqIFNlZSB0aGUge0BsaW5rIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzEwNTAzNC9ob3ctdG8tY3JlYXRlLWEtZ3VpZC11dWlkIHwgc3RhY2tvdmVyZmxvdyBkaXNjdXNzaW9ufS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHV1aWQ0KCk6IHN0cmluZyB7XG4gIC8vIFJldHVybiB0aGUgaGV4YWRlY2ltYWwgdGV4dCByZXByZXNlbnRhdGlvbiBvZiBudW1iZXIgYG5gLCBwYWRkZWQgd2l0aCB6ZXJvZXMgdG8gYmUgb2YgbGVuZ3RoIGBwYFxuICBjb25zdCBobyA9IChuOiBudW1iZXIsIHA6IG51bWJlcikgPT4gbi50b1N0cmluZygxNikucGFkU3RhcnQocCwgJzAnKTtcbiAgLy8gQ3JlYXRlIGEgdmlldyBiYWNrZWQgYnkgYSAxNi1ieXRlIGJ1ZmZlclxuICBjb25zdCB2aWV3ID0gbmV3IERhdGFWaWV3KG5ldyBBcnJheUJ1ZmZlcigxNikpO1xuICAvLyBGaWxsIGJ1ZmZlciB3aXRoIHJhbmRvbSB2YWx1ZXNcbiAgdmlldy5zZXRVaW50MzIoMCwgKE1hdGgucmFuZG9tKCkgKiAweDEwMDAwMDAwMCkgPj4+IDApO1xuICB2aWV3LnNldFVpbnQzMig0LCAoTWF0aC5yYW5kb20oKSAqIDB4MTAwMDAwMDAwKSA+Pj4gMCk7XG4gIHZpZXcuc2V0VWludDMyKDgsIChNYXRoLnJhbmRvbSgpICogMHgxMDAwMDAwMDApID4+PiAwKTtcbiAgdmlldy5zZXRVaW50MzIoMTIsIChNYXRoLnJhbmRvbSgpICogMHgxMDAwMDAwMDApID4+PiAwKTtcbiAgLy8gUGF0Y2ggdGhlIDZ0aCBieXRlIHRvIHJlZmxlY3QgYSB2ZXJzaW9uIDQgVVVJRFxuICB2aWV3LnNldFVpbnQ4KDYsICh2aWV3LmdldFVpbnQ4KDYpICYgMHhmKSB8IDB4NDApO1xuICAvLyBQYXRjaCB0aGUgOHRoIGJ5dGUgdG8gcmVmbGVjdCBhIHZhcmlhbnQgMSBVVUlEICh2ZXJzaW9uIDQgVVVJRHMgYXJlKVxuICB2aWV3LnNldFVpbnQ4KDgsICh2aWV3LmdldFVpbnQ4KDgpICYgMHgzZikgfCAweDgwKTtcbiAgLy8gQ29tcGlsZSB0aGUgY2Fub25pY2FsIHRleHR1YWwgZm9ybSBmcm9tIHRoZSBhcnJheSBkYXRhXG4gIHJldHVybiBgJHtobyh2aWV3LmdldFVpbnQzMigwKSwgOCl9LSR7aG8odmlldy5nZXRVaW50MTYoNCksIDQpfS0ke2hvKHZpZXcuZ2V0VWludDE2KDYpLCA0KX0tJHtobyhcbiAgICB2aWV3LmdldFVpbnQxNig4KSxcbiAgICA0XG4gICl9LSR7aG8odmlldy5nZXRVaW50MzIoMTApLCA4KX0ke2hvKHZpZXcuZ2V0VWludDE2KDE0KSwgNCl9YDtcbn1cblxuLyoqXG4gKiBQYXRjaCBvciB1cGdyYWRlIHdvcmtmbG93IGNvZGUgYnkgY2hlY2tpbmcgb3Igc3RhdGluZyB0aGF0IHRoaXMgd29ya2Zsb3cgaGFzIGEgY2VydGFpbiBwYXRjaC5cbiAqXG4gKiBTZWUge0BsaW5rIGh0dHBzOi8vZG9jcy50ZW1wb3JhbC5pby90eXBlc2NyaXB0L3ZlcnNpb25pbmcgfCBkb2NzIHBhZ2V9IGZvciBpbmZvLlxuICpcbiAqIElmIHRoZSB3b3JrZmxvdyBpcyByZXBsYXlpbmcgYW4gZXhpc3RpbmcgaGlzdG9yeSwgdGhlbiB0aGlzIGZ1bmN0aW9uIHJldHVybnMgdHJ1ZSBpZiB0aGF0XG4gKiBoaXN0b3J5IHdhcyBwcm9kdWNlZCBieSBhIHdvcmtlciB3aGljaCBhbHNvIGhhZCBhIGBwYXRjaGVkYCBjYWxsIHdpdGggdGhlIHNhbWUgYHBhdGNoSWRgLlxuICogSWYgdGhlIGhpc3Rvcnkgd2FzIHByb2R1Y2VkIGJ5IGEgd29ya2VyICp3aXRob3V0KiBzdWNoIGEgY2FsbCwgdGhlbiBpdCB3aWxsIHJldHVybiBmYWxzZS5cbiAqXG4gKiBJZiB0aGUgd29ya2Zsb3cgaXMgbm90IGN1cnJlbnRseSByZXBsYXlpbmcsIHRoZW4gdGhpcyBjYWxsICphbHdheXMqIHJldHVybnMgdHJ1ZS5cbiAqXG4gKiBZb3VyIHdvcmtmbG93IGNvZGUgc2hvdWxkIHJ1biB0aGUgXCJuZXdcIiBjb2RlIGlmIHRoaXMgcmV0dXJucyB0cnVlLCBpZiBpdCByZXR1cm5zIGZhbHNlLCB5b3VcbiAqIHNob3VsZCBydW4gdGhlIFwib2xkXCIgY29kZS4gQnkgZG9pbmcgdGhpcywgeW91IGNhbiBtYWludGFpbiBkZXRlcm1pbmlzbS5cbiAqXG4gKiBAcGFyYW0gcGF0Y2hJZCBBbiBpZGVudGlmaWVyIHRoYXQgc2hvdWxkIGJlIHVuaXF1ZSB0byB0aGlzIHBhdGNoLiBJdCBpcyBPSyB0byB1c2UgbXVsdGlwbGVcbiAqIGNhbGxzIHdpdGggdGhlIHNhbWUgSUQsIHdoaWNoIG1lYW5zIGFsbCBzdWNoIGNhbGxzIHdpbGwgYWx3YXlzIHJldHVybiB0aGUgc2FtZSB2YWx1ZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhdGNoZWQocGF0Y2hJZDogc3RyaW5nKTogYm9vbGVhbiB7XG4gIGNvbnN0IGFjdGl2YXRvciA9IGFzc2VydEluV29ya2Zsb3dDb250ZXh0KFxuICAgICdXb3JrZmxvdy5wYXRjaCguLi4pIGFuZCBXb3JrZmxvdy5kZXByZWNhdGVQYXRjaCBtYXkgb25seSBiZSB1c2VkIGZyb20gYSBXb3JrZmxvdyBFeGVjdXRpb24uJ1xuICApO1xuICByZXR1cm4gYWN0aXZhdG9yLnBhdGNoSW50ZXJuYWwocGF0Y2hJZCwgZmFsc2UpO1xufVxuXG4vKipcbiAqIEluZGljYXRlIHRoYXQgYSBwYXRjaCBpcyBiZWluZyBwaGFzZWQgb3V0LlxuICpcbiAqIFNlZSB7QGxpbmsgaHR0cHM6Ly9kb2NzLnRlbXBvcmFsLmlvL3R5cGVzY3JpcHQvdmVyc2lvbmluZyB8IGRvY3MgcGFnZX0gZm9yIGluZm8uXG4gKlxuICogV29ya2Zsb3dzIHdpdGggdGhpcyBjYWxsIG1heSBiZSBkZXBsb3llZCBhbG9uZ3NpZGUgd29ya2Zsb3dzIHdpdGggYSB7QGxpbmsgcGF0Y2hlZH0gY2FsbCwgYnV0XG4gKiB0aGV5IG11c3QgKm5vdCogYmUgZGVwbG95ZWQgd2hpbGUgYW55IHdvcmtlcnMgc3RpbGwgZXhpc3QgcnVubmluZyBvbGQgY29kZSB3aXRob3V0IGFcbiAqIHtAbGluayBwYXRjaGVkfSBjYWxsLCBvciBhbnkgcnVucyB3aXRoIGhpc3RvcmllcyBwcm9kdWNlZCBieSBzdWNoIHdvcmtlcnMgZXhpc3QuIElmIGVpdGhlciBraW5kXG4gKiBvZiB3b3JrZXIgZW5jb3VudGVycyBhIGhpc3RvcnkgcHJvZHVjZWQgYnkgdGhlIG90aGVyLCB0aGVpciBiZWhhdmlvciBpcyB1bmRlZmluZWQuXG4gKlxuICogT25jZSBhbGwgbGl2ZSB3b3JrZmxvdyBydW5zIGhhdmUgYmVlbiBwcm9kdWNlZCBieSB3b3JrZXJzIHdpdGggdGhpcyBjYWxsLCB5b3UgY2FuIGRlcGxveSB3b3JrZXJzXG4gKiB3aGljaCBhcmUgZnJlZSBvZiBlaXRoZXIga2luZCBvZiBwYXRjaCBjYWxsIGZvciB0aGlzIElELiBXb3JrZXJzIHdpdGggYW5kIHdpdGhvdXQgdGhpcyBjYWxsXG4gKiBtYXkgY29leGlzdCwgYXMgbG9uZyBhcyB0aGV5IGFyZSBib3RoIHJ1bm5pbmcgdGhlIFwibmV3XCIgY29kZS5cbiAqXG4gKiBAcGFyYW0gcGF0Y2hJZCBBbiBpZGVudGlmaWVyIHRoYXQgc2hvdWxkIGJlIHVuaXF1ZSB0byB0aGlzIHBhdGNoLiBJdCBpcyBPSyB0byB1c2UgbXVsdGlwbGVcbiAqIGNhbGxzIHdpdGggdGhlIHNhbWUgSUQsIHdoaWNoIG1lYW5zIGFsbCBzdWNoIGNhbGxzIHdpbGwgYWx3YXlzIHJldHVybiB0aGUgc2FtZSB2YWx1ZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRlcHJlY2F0ZVBhdGNoKHBhdGNoSWQ6IHN0cmluZyk6IHZvaWQge1xuICBjb25zdCBhY3RpdmF0b3IgPSBhc3NlcnRJbldvcmtmbG93Q29udGV4dChcbiAgICAnV29ya2Zsb3cucGF0Y2goLi4uKSBhbmQgV29ya2Zsb3cuZGVwcmVjYXRlUGF0Y2ggbWF5IG9ubHkgYmUgdXNlZCBmcm9tIGEgV29ya2Zsb3cgRXhlY3V0aW9uLidcbiAgKTtcbiAgYWN0aXZhdG9yLnBhdGNoSW50ZXJuYWwocGF0Y2hJZCwgdHJ1ZSk7XG59XG5cbi8qKlxuICogUmV0dXJucyBhIFByb21pc2UgdGhhdCByZXNvbHZlcyB3aGVuIGBmbmAgZXZhbHVhdGVzIHRvIGB0cnVlYCBvciBgdGltZW91dGAgZXhwaXJlcy5cbiAqXG4gKiBAcGFyYW0gdGltZW91dCBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIG9yIHtAbGluayBodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9tcyB8IG1zLWZvcm1hdHRlZCBzdHJpbmd9XG4gKlxuICogQHJldHVybnMgYSBib29sZWFuIGluZGljYXRpbmcgd2hldGhlciB0aGUgY29uZGl0aW9uIHdhcyB0cnVlIGJlZm9yZSB0aGUgdGltZW91dCBleHBpcmVzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb25kaXRpb24oZm46ICgpID0+IGJvb2xlYW4sIHRpbWVvdXQ6IER1cmF0aW9uKTogUHJvbWlzZTxib29sZWFuPjtcblxuLyoqXG4gKiBSZXR1cm5zIGEgUHJvbWlzZSB0aGF0IHJlc29sdmVzIHdoZW4gYGZuYCBldmFsdWF0ZXMgdG8gYHRydWVgLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY29uZGl0aW9uKGZuOiAoKSA9PiBib29sZWFuKTogUHJvbWlzZTx2b2lkPjtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNvbmRpdGlvbihmbjogKCkgPT4gYm9vbGVhbiwgdGltZW91dD86IER1cmF0aW9uKTogUHJvbWlzZTx2b2lkIHwgYm9vbGVhbj4ge1xuICBhc3NlcnRJbldvcmtmbG93Q29udGV4dCgnV29ya2Zsb3cuY29uZGl0aW9uKC4uLikgbWF5IG9ubHkgYmUgdXNlZCBmcm9tIGEgV29ya2Zsb3cgRXhlY3V0aW9uLicpO1xuICAvLyBQcmlvciB0byAxLjUuMCwgYGNvbmRpdGlvbihmbiwgMClgIHdhcyB0cmVhdGVkIGFzIGVxdWl2YWxlbnQgdG8gYGNvbmRpdGlvbihmbiwgdW5kZWZpbmVkKWBcbiAgaWYgKHRpbWVvdXQgPT09IDAgJiYgIXBhdGNoZWQoQ09ORElUSU9OXzBfUEFUQ0gpKSB7XG4gICAgcmV0dXJuIGNvbmRpdGlvbklubmVyKGZuKTtcbiAgfVxuICBpZiAodHlwZW9mIHRpbWVvdXQgPT09ICdudW1iZXInIHx8IHR5cGVvZiB0aW1lb3V0ID09PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBDYW5jZWxsYXRpb25TY29wZS5jYW5jZWxsYWJsZShhc3luYyAoKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4gYXdhaXQgUHJvbWlzZS5yYWNlKFtzbGVlcCh0aW1lb3V0KS50aGVuKCgpID0+IGZhbHNlKSwgY29uZGl0aW9uSW5uZXIoZm4pLnRoZW4oKCkgPT4gdHJ1ZSldKTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIENhbmNlbGxhdGlvblNjb3BlLmN1cnJlbnQoKS5jYW5jZWwoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuICByZXR1cm4gY29uZGl0aW9uSW5uZXIoZm4pO1xufVxuXG5mdW5jdGlvbiBjb25kaXRpb25Jbm5lcihmbjogKCkgPT4gYm9vbGVhbik6IFByb21pc2U8dm9pZD4ge1xuICBjb25zdCBhY3RpdmF0b3IgPSBnZXRBY3RpdmF0b3IoKTtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBjb25zdCBzY29wZSA9IENhbmNlbGxhdGlvblNjb3BlLmN1cnJlbnQoKTtcbiAgICBpZiAoc2NvcGUuY29uc2lkZXJlZENhbmNlbGxlZCkge1xuICAgICAgdW50cmFja1Byb21pc2Uoc2NvcGUuY2FuY2VsUmVxdWVzdGVkLmNhdGNoKHJlamVjdCkpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHNlcSA9IGFjdGl2YXRvci5uZXh0U2Vxcy5jb25kaXRpb24rKztcbiAgICBpZiAoc2NvcGUuY2FuY2VsbGFibGUpIHtcbiAgICAgIHVudHJhY2tQcm9taXNlKFxuICAgICAgICBzY29wZS5jYW5jZWxSZXF1ZXN0ZWQuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgIGFjdGl2YXRvci5ibG9ja2VkQ29uZGl0aW9ucy5kZWxldGUoc2VxKTtcbiAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgfSlcbiAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gRWFnZXIgZXZhbHVhdGlvblxuICAgIGlmIChmbigpKSB7XG4gICAgICByZXNvbHZlKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgYWN0aXZhdG9yLmJsb2NrZWRDb25kaXRpb25zLnNldChzZXEsIHsgZm4sIHJlc29sdmUgfSk7XG4gIH0pO1xufVxuXG4vKipcbiAqIERlZmluZSBhbiB1cGRhdGUgbWV0aG9kIGZvciBhIFdvcmtmbG93LlxuICpcbiAqIEEgZGVmaW5pdGlvbiBpcyB1c2VkIHRvIHJlZ2lzdGVyIGEgaGFuZGxlciBpbiB0aGUgV29ya2Zsb3cgdmlhIHtAbGluayBzZXRIYW5kbGVyfSBhbmQgdG8gdXBkYXRlIGEgV29ya2Zsb3cgdXNpbmcgYSB7QGxpbmsgV29ya2Zsb3dIYW5kbGV9LCB7QGxpbmsgQ2hpbGRXb3JrZmxvd0hhbmRsZX0gb3Ige0BsaW5rIEV4dGVybmFsV29ya2Zsb3dIYW5kbGV9LlxuICogQSBkZWZpbml0aW9uIGNhbiBiZSByZXVzZWQgaW4gbXVsdGlwbGUgV29ya2Zsb3dzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZGVmaW5lVXBkYXRlPFJldCwgQXJncyBleHRlbmRzIGFueVtdID0gW10sIE5hbWUgZXh0ZW5kcyBzdHJpbmcgPSBzdHJpbmc+KFxuICBuYW1lOiBOYW1lXG4pOiBVcGRhdGVEZWZpbml0aW9uPFJldCwgQXJncywgTmFtZT4ge1xuICByZXR1cm4ge1xuICAgIHR5cGU6ICd1cGRhdGUnLFxuICAgIG5hbWUsXG4gIH0gYXMgVXBkYXRlRGVmaW5pdGlvbjxSZXQsIEFyZ3MsIE5hbWU+O1xufVxuXG4vKipcbiAqIERlZmluZSBhIHNpZ25hbCBtZXRob2QgZm9yIGEgV29ya2Zsb3cuXG4gKlxuICogQSBkZWZpbml0aW9uIGlzIHVzZWQgdG8gcmVnaXN0ZXIgYSBoYW5kbGVyIGluIHRoZSBXb3JrZmxvdyB2aWEge0BsaW5rIHNldEhhbmRsZXJ9IGFuZCB0byBzaWduYWwgYSBXb3JrZmxvdyB1c2luZyBhIHtAbGluayBXb3JrZmxvd0hhbmRsZX0sIHtAbGluayBDaGlsZFdvcmtmbG93SGFuZGxlfSBvciB7QGxpbmsgRXh0ZXJuYWxXb3JrZmxvd0hhbmRsZX0uXG4gKiBBIGRlZmluaXRpb24gY2FuIGJlIHJldXNlZCBpbiBtdWx0aXBsZSBXb3JrZmxvd3MuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZWZpbmVTaWduYWw8QXJncyBleHRlbmRzIGFueVtdID0gW10sIE5hbWUgZXh0ZW5kcyBzdHJpbmcgPSBzdHJpbmc+KFxuICBuYW1lOiBOYW1lXG4pOiBTaWduYWxEZWZpbml0aW9uPEFyZ3MsIE5hbWU+IHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiAnc2lnbmFsJyxcbiAgICBuYW1lLFxuICB9IGFzIFNpZ25hbERlZmluaXRpb248QXJncywgTmFtZT47XG59XG5cbi8qKlxuICogRGVmaW5lIGEgcXVlcnkgbWV0aG9kIGZvciBhIFdvcmtmbG93LlxuICpcbiAqIEEgZGVmaW5pdGlvbiBpcyB1c2VkIHRvIHJlZ2lzdGVyIGEgaGFuZGxlciBpbiB0aGUgV29ya2Zsb3cgdmlhIHtAbGluayBzZXRIYW5kbGVyfSBhbmQgdG8gcXVlcnkgYSBXb3JrZmxvdyB1c2luZyBhIHtAbGluayBXb3JrZmxvd0hhbmRsZX0uXG4gKiBBIGRlZmluaXRpb24gY2FuIGJlIHJldXNlZCBpbiBtdWx0aXBsZSBXb3JrZmxvd3MuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZWZpbmVRdWVyeTxSZXQsIEFyZ3MgZXh0ZW5kcyBhbnlbXSA9IFtdLCBOYW1lIGV4dGVuZHMgc3RyaW5nID0gc3RyaW5nPihcbiAgbmFtZTogTmFtZVxuKTogUXVlcnlEZWZpbml0aW9uPFJldCwgQXJncywgTmFtZT4ge1xuICByZXR1cm4ge1xuICAgIHR5cGU6ICdxdWVyeScsXG4gICAgbmFtZSxcbiAgfSBhcyBRdWVyeURlZmluaXRpb248UmV0LCBBcmdzLCBOYW1lPjtcbn1cblxuLyoqXG4gKiBTZXQgYSBoYW5kbGVyIGZ1bmN0aW9uIGZvciBhIFdvcmtmbG93IHVwZGF0ZSwgc2lnbmFsLCBvciBxdWVyeS5cbiAqXG4gKiBJZiB0aGlzIGZ1bmN0aW9uIGlzIGNhbGxlZCBtdWx0aXBsZSB0aW1lcyBmb3IgYSBnaXZlbiB1cGRhdGUsIHNpZ25hbCwgb3IgcXVlcnkgbmFtZSB0aGUgbGFzdCBoYW5kbGVyIHdpbGwgb3ZlcndyaXRlIGFueSBwcmV2aW91cyBjYWxscy5cbiAqXG4gKiBAcGFyYW0gZGVmIGFuIHtAbGluayBVcGRhdGVEZWZpbml0aW9ufSwge0BsaW5rIFNpZ25hbERlZmluaXRpb259LCBvciB7QGxpbmsgUXVlcnlEZWZpbml0aW9ufSBhcyByZXR1cm5lZCBieSB7QGxpbmsgZGVmaW5lVXBkYXRlfSwge0BsaW5rIGRlZmluZVNpZ25hbH0sIG9yIHtAbGluayBkZWZpbmVRdWVyeX0gcmVzcGVjdGl2ZWx5LlxuICogQHBhcmFtIGhhbmRsZXIgYSBjb21wYXRpYmxlIGhhbmRsZXIgZnVuY3Rpb24gZm9yIHRoZSBnaXZlbiBkZWZpbml0aW9uIG9yIGB1bmRlZmluZWRgIHRvIHVuc2V0IHRoZSBoYW5kbGVyLlxuICogQHBhcmFtIG9wdGlvbnMgYW4gb3B0aW9uYWwgYGRlc2NyaXB0aW9uYCBvZiB0aGUgaGFuZGxlciBhbmQgYW4gb3B0aW9uYWwgdXBkYXRlIGB2YWxpZGF0b3JgIGZ1bmN0aW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0SGFuZGxlcjxSZXQsIEFyZ3MgZXh0ZW5kcyBhbnlbXSwgVCBleHRlbmRzIFF1ZXJ5RGVmaW5pdGlvbjxSZXQsIEFyZ3M+PihcbiAgZGVmOiBULFxuICBoYW5kbGVyOiBIYW5kbGVyPFJldCwgQXJncywgVD4gfCB1bmRlZmluZWQsXG4gIG9wdGlvbnM/OiBRdWVyeUhhbmRsZXJPcHRpb25zXG4pOiB2b2lkO1xuZXhwb3J0IGZ1bmN0aW9uIHNldEhhbmRsZXI8UmV0LCBBcmdzIGV4dGVuZHMgYW55W10sIFQgZXh0ZW5kcyBTaWduYWxEZWZpbml0aW9uPEFyZ3M+PihcbiAgZGVmOiBULFxuICBoYW5kbGVyOiBIYW5kbGVyPFJldCwgQXJncywgVD4gfCB1bmRlZmluZWQsXG4gIG9wdGlvbnM/OiBTaWduYWxIYW5kbGVyT3B0aW9uc1xuKTogdm9pZDtcbmV4cG9ydCBmdW5jdGlvbiBzZXRIYW5kbGVyPFJldCwgQXJncyBleHRlbmRzIGFueVtdLCBUIGV4dGVuZHMgVXBkYXRlRGVmaW5pdGlvbjxSZXQsIEFyZ3M+PihcbiAgZGVmOiBULFxuICBoYW5kbGVyOiBIYW5kbGVyPFJldCwgQXJncywgVD4gfCB1bmRlZmluZWQsXG4gIG9wdGlvbnM/OiBVcGRhdGVIYW5kbGVyT3B0aW9uczxBcmdzPlxuKTogdm9pZDtcblxuLy8gRm9yIFVwZGF0ZXMgYW5kIFNpZ25hbHMgd2Ugd2FudCB0byBtYWtlIGEgcHVibGljIGd1YXJhbnRlZSBzb21ldGhpbmcgbGlrZSB0aGVcbi8vIGZvbGxvd2luZzpcbi8vXG4vLyAgIFwiSWYgYSBXRlQgY29udGFpbnMgYSBTaWduYWwvVXBkYXRlLCBhbmQgaWYgYSBoYW5kbGVyIGlzIGF2YWlsYWJsZSBmb3IgdGhhdFxuLy8gICBTaWduYWwvVXBkYXRlLCB0aGVuIHRoZSBoYW5kbGVyIHdpbGwgYmUgZXhlY3V0ZWQuXCJcIlxuLy9cbi8vIEhvd2V2ZXIsIHRoYXQgc3RhdGVtZW50IGlzIG5vdCB3ZWxsLWRlZmluZWQsIGxlYXZpbmcgc2V2ZXJhbCBxdWVzdGlvbnMgb3Blbjpcbi8vXG4vLyAxLiBXaGF0IGRvZXMgaXQgbWVhbiBmb3IgYSBoYW5kbGVyIHRvIGJlIFwiYXZhaWxhYmxlXCI/IFdoYXQgaGFwcGVucyBpZiB0aGVcbi8vICAgIGhhbmRsZXIgaXMgbm90IHByZXNlbnQgaW5pdGlhbGx5IGJ1dCBpcyBzZXQgYXQgc29tZSBwb2ludCBkdXJpbmcgdGhlXG4vLyAgICBXb3JrZmxvdyBjb2RlIHRoYXQgaXMgZXhlY3V0ZWQgaW4gdGhhdCBXRlQ/IFdoYXQgaGFwcGVucyBpZiB0aGUgaGFuZGxlciBpc1xuLy8gICAgc2V0IGFuZCB0aGVuIGRlbGV0ZWQsIG9yIHJlcGxhY2VkIHdpdGggYSBkaWZmZXJlbnQgaGFuZGxlcj9cbi8vXG4vLyAyLiBXaGVuIGlzIHRoZSBoYW5kbGVyIGV4ZWN1dGVkPyAoV2hlbiBpdCBmaXJzdCBiZWNvbWVzIGF2YWlsYWJsZT8gQXQgdGhlIGVuZFxuLy8gICAgb2YgdGhlIGFjdGl2YXRpb24/KSBXaGF0IGFyZSB0aGUgZXhlY3V0aW9uIHNlbWFudGljcyBvZiBXb3JrZmxvdyBhbmRcbi8vICAgIFNpZ25hbC9VcGRhdGUgaGFuZGxlciBjb2RlIGdpdmVuIHRoYXQgdGhleSBhcmUgY29uY3VycmVudD8gQ2FuIHRoZSB1c2VyXG4vLyAgICByZWx5IG9uIFNpZ25hbC9VcGRhdGUgc2lkZSBlZmZlY3RzIGJlaW5nIHJlZmxlY3RlZCBpbiB0aGUgV29ya2Zsb3cgcmV0dXJuXG4vLyAgICB2YWx1ZSwgb3IgaW4gdGhlIHZhbHVlIHBhc3NlZCB0byBDb250aW51ZS1Bcy1OZXc/IElmIHRoZSBoYW5kbGVyIGlzIGFuXG4vLyAgICBhc3luYyBmdW5jdGlvbiAvIGNvcm91dGluZSwgaG93IG11Y2ggb2YgaXQgaXMgZXhlY3V0ZWQgYW5kIHdoZW4gaXMgdGhlXG4vLyAgICByZXN0IGV4ZWN1dGVkP1xuLy9cbi8vIDMuIFdoYXQgaGFwcGVucyBpZiB0aGUgaGFuZGxlciBpcyBub3QgZXhlY3V0ZWQ/IChpLmUuIGJlY2F1c2UgaXQgd2Fzbid0XG4vLyAgICBhdmFpbGFibGUgaW4gdGhlIHNlbnNlIGRlZmluZWQgYnkgKDEpKVxuLy9cbi8vIDQuIEluIHRoZSBjYXNlIG9mIFVwZGF0ZSwgd2hlbiBpcyB0aGUgdmFsaWRhdGlvbiBmdW5jdGlvbiBleGVjdXRlZD9cbi8vXG4vLyBUaGUgaW1wbGVtZW50YXRpb24gZm9yIFR5cGVzY3JpcHQgaXMgYXMgZm9sbG93czpcbi8vXG4vLyAxLiBzZGstY29yZSBzb3J0cyBTaWduYWwgYW5kIFVwZGF0ZSBqb2JzIChhbmQgUGF0Y2hlcykgYWhlYWQgb2YgYWxsIG90aGVyXG4vLyAgICBqb2JzLiBUaHVzIGlmIHRoZSBoYW5kbGVyIGlzIGF2YWlsYWJsZSBhdCB0aGUgc3RhcnQgb2YgdGhlIEFjdGl2YXRpb24gdGhlblxuLy8gICAgdGhlIFNpZ25hbC9VcGRhdGUgd2lsbCBiZSBleGVjdXRlZCBiZWZvcmUgV29ya2Zsb3cgY29kZSBpcyBleGVjdXRlZC4gSWYgaXRcbi8vICAgIGlzIG5vdCwgdGhlbiB0aGUgU2lnbmFsL1VwZGF0ZSBjYWxscyBhcmUgcHVzaGVkIHRvIGEgYnVmZmVyLlxuLy9cbi8vIDIuIE9uIGVhY2ggY2FsbCB0byBzZXRIYW5kbGVyIGZvciBhIGdpdmVuIFNpZ25hbC9VcGRhdGUsIHdlIG1ha2UgYSBwYXNzXG4vLyAgICB0aHJvdWdoIHRoZSBidWZmZXIgbGlzdC4gSWYgYSBidWZmZXJlZCBqb2IgaXMgYXNzb2NpYXRlZCB3aXRoIHRoZSBqdXN0LXNldFxuLy8gICAgaGFuZGxlciwgdGhlbiB0aGUgam9iIGlzIHJlbW92ZWQgZnJvbSB0aGUgYnVmZmVyIGFuZCB0aGUgaW5pdGlhbFxuLy8gICAgc3luY2hyb25vdXMgcG9ydGlvbiBvZiB0aGUgaGFuZGxlciBpcyBpbnZva2VkIG9uIHRoYXQgaW5wdXQgKGkuZS5cbi8vICAgIHByZWVtcHRpbmcgd29ya2Zsb3cgY29kZSkuXG4vL1xuLy8gVGh1cyBpbiB0aGUgY2FzZSBvZiBUeXBlc2NyaXB0IHRoZSBxdWVzdGlvbnMgYWJvdmUgYXJlIGFuc3dlcmVkIGFzIGZvbGxvd3M6XG4vL1xuLy8gMS4gQSBoYW5kbGVyIGlzIFwiYXZhaWxhYmxlXCIgaWYgaXQgaXMgc2V0IGF0IHRoZSBzdGFydCBvZiB0aGUgQWN0aXZhdGlvbiBvclxuLy8gICAgYmVjb21lcyBzZXQgYXQgYW55IHBvaW50IGR1cmluZyB0aGUgQWN0aXZhdGlvbi4gSWYgdGhlIGhhbmRsZXIgaXMgbm90IHNldFxuLy8gICAgaW5pdGlhbGx5IHRoZW4gaXQgaXMgZXhlY3V0ZWQgYXMgc29vbiBhcyBpdCBpcyBzZXQuIFN1YnNlcXVlbnQgZGVsZXRpb24gb3Jcbi8vICAgIHJlcGxhY2VtZW50IGJ5IGEgZGlmZmVyZW50IGhhbmRsZXIgaGFzIG5vIGltcGFjdCBiZWNhdXNlIHRoZSBqb2JzIGl0IHdhc1xuLy8gICAgaGFuZGxpbmcgaGF2ZSBhbHJlYWR5IGJlZW4gaGFuZGxlZCBhbmQgYXJlIG5vIGxvbmdlciBpbiB0aGUgYnVmZmVyLlxuLy9cbi8vIDIuIFRoZSBoYW5kbGVyIGlzIGV4ZWN1dGVkIGFzIHNvb24gYXMgaXQgYmVjb21lcyBhdmFpbGFibGUuIEkuZS4gaWYgdGhlXG4vLyAgICBoYW5kbGVyIGlzIHNldCBhdCB0aGUgc3RhcnQgb2YgdGhlIEFjdGl2YXRpb24gdGhlbiBpdCBpcyBleGVjdXRlZCB3aGVuXG4vLyAgICBmaXJzdCBhdHRlbXB0aW5nIHRvIHByb2Nlc3MgdGhlIFNpZ25hbC9VcGRhdGUgam9iOyBhbHRlcm5hdGl2ZWx5LCBpZiBpdCBpc1xuLy8gICAgc2V0IGJ5IGEgc2V0SGFuZGxlciBjYWxsIG1hZGUgYnkgV29ya2Zsb3cgY29kZSwgdGhlbiBpdCBpcyBleGVjdXRlZCBhc1xuLy8gICAgcGFydCBvZiB0aGF0IGNhbGwgKHByZWVtcHRpbmcgV29ya2Zsb3cgY29kZSkuIFRoZXJlZm9yZSwgYSB1c2VyIGNhbiByZWx5XG4vLyAgICBvbiBTaWduYWwvVXBkYXRlIHNpZGUgZWZmZWN0cyBiZWluZyByZWZsZWN0ZWQgaW4gZS5nLiB0aGUgV29ya2Zsb3cgcmV0dXJuXG4vLyAgICB2YWx1ZSwgYW5kIGluIHRoZSB2YWx1ZSBwYXNzZWQgdG8gQ29udGludWUtQXMtTmV3LiBBY3RpdmF0aW9uIGpvYnMgYXJlXG4vLyAgICBwcm9jZXNzZWQgaW4gdGhlIG9yZGVyIHN1cHBsaWVkIGJ5IHNkay1jb3JlLCBpLmUuIFNpZ25hbHMsIHRoZW4gVXBkYXRlcyxcbi8vICAgIHRoZW4gb3RoZXIgam9icy4gV2l0aGluIGVhY2ggZ3JvdXAsIHRoZSBvcmRlciBzZW50IGJ5IHRoZSBzZXJ2ZXIgaXNcbi8vICAgIHByZXNlcnZlZC4gSWYgdGhlIGhhbmRsZXIgaXMgYXN5bmMsIGl0IGlzIGV4ZWN1dGVkIHVwIHRvIGl0cyBmaXJzdCB5aWVsZFxuLy8gICAgcG9pbnQuXG4vL1xuLy8gMy4gU2lnbmFsIGNhc2U6IElmIGEgaGFuZGxlciBkb2VzIG5vdCBiZWNvbWUgYXZhaWxhYmxlIGZvciBhIFNpZ25hbCBqb2IgdGhlblxuLy8gICAgdGhlIGpvYiByZW1haW5zIGluIHRoZSBidWZmZXIuIElmIGEgaGFuZGxlciBmb3IgdGhlIFNpZ25hbCBiZWNvbWVzXG4vLyAgICBhdmFpbGFibGUgaW4gYSBzdWJzZXF1ZW50IEFjdGl2YXRpb24gKG9mIHRoZSBzYW1lIG9yIGEgc3Vic2VxdWVudCBXRlQpXG4vLyAgICB0aGVuIHRoZSBoYW5kbGVyIHdpbGwgYmUgZXhlY3V0ZWQuIElmIG5vdCwgdGhlbiB0aGUgU2lnbmFsIHdpbGwgbmV2ZXIgYmVcbi8vICAgIHJlc3BvbmRlZCB0byBhbmQgdGhpcyBjYXVzZXMgbm8gZXJyb3IuXG4vL1xuLy8gICAgVXBkYXRlIGNhc2U6IElmIGEgaGFuZGxlciBkb2VzIG5vdCBiZWNvbWUgYXZhaWxhYmxlIGZvciBhbiBVcGRhdGUgam9iIHRoZW5cbi8vICAgIHRoZSBVcGRhdGUgaXMgcmVqZWN0ZWQgYXQgdGhlIGVuZCBvZiB0aGUgQWN0aXZhdGlvbi4gVGh1cywgaWYgYSB1c2VyIGRvZXNcbi8vICAgIG5vdCB3YW50IGFuIFVwZGF0ZSB0byBiZSByZWplY3RlZCBmb3IgdGhpcyByZWFzb24sIHRoZW4gaXQgaXMgdGhlaXJcbi8vICAgIHJlc3BvbnNpYmlsaXR5IHRvIGVuc3VyZSB0aGF0IHRoZWlyIGFwcGxpY2F0aW9uIGFuZCB3b3JrZmxvdyBjb2RlIGludGVyYWN0XG4vLyAgICBzdWNoIHRoYXQgYSBoYW5kbGVyIGlzIGF2YWlsYWJsZSBmb3IgdGhlIFVwZGF0ZSBkdXJpbmcgYW55IEFjdGl2YXRpb25cbi8vICAgIHdoaWNoIG1pZ2h0IGNvbnRhaW4gdGhlaXIgVXBkYXRlIGpvYi4gKE5vdGUgdGhhdCB0aGUgdXNlciBvZnRlbiBoYXNcbi8vICAgIHVuY2VydGFpbnR5IGFib3V0IHdoaWNoIFdGVCB0aGVpciBTaWduYWwvVXBkYXRlIHdpbGwgYXBwZWFyIGluLiBGb3Jcbi8vICAgIGV4YW1wbGUsIGlmIHRoZXkgY2FsbCBzdGFydFdvcmtmbG93KCkgZm9sbG93ZWQgYnkgc3RhcnRVcGRhdGUoKSwgdGhlbiB0aGV5XG4vLyAgICB3aWxsIHR5cGljYWxseSBub3Qga25vdyB3aGV0aGVyIHRoZXNlIHdpbGwgYmUgZGVsaXZlcmVkIGluIG9uZSBvciB0d29cbi8vICAgIFdGVHMuIE9uIHRoZSBvdGhlciBoYW5kIHRoZXJlIGFyZSBzaXR1YXRpb25zIHdoZXJlIHRoZXkgd291bGQgaGF2ZSByZWFzb25cbi8vICAgIHRvIGJlbGlldmUgdGhleSBhcmUgaW4gdGhlIHNhbWUgV0ZULCBmb3IgZXhhbXBsZSBpZiB0aGV5IGRvIG5vdCBzdGFydFxuLy8gICAgV29ya2VyIHBvbGxpbmcgdW50aWwgYWZ0ZXIgdGhleSBoYXZlIHZlcmlmaWVkIHRoYXQgYm90aCByZXF1ZXN0cyBoYXZlXG4vLyAgICBzdWNjZWVkZWQuKVxuLy9cbi8vIDQuIElmIGFuIFVwZGF0ZSBoYXMgYSB2YWxpZGF0aW9uIGZ1bmN0aW9uIHRoZW4gaXQgaXMgZXhlY3V0ZWQgaW1tZWRpYXRlbHlcbi8vICAgIHByaW9yIHRvIHRoZSBoYW5kbGVyLiAoTm90ZSB0aGF0IHRoZSB2YWxpZGF0aW9uIGZ1bmN0aW9uIGlzIHJlcXVpcmVkIHRvIGJlXG4vLyAgICBzeW5jaHJvbm91cykuXG5leHBvcnQgZnVuY3Rpb24gc2V0SGFuZGxlcjxcbiAgUmV0LFxuICBBcmdzIGV4dGVuZHMgYW55W10sXG4gIFQgZXh0ZW5kcyBVcGRhdGVEZWZpbml0aW9uPFJldCwgQXJncz4gfCBTaWduYWxEZWZpbml0aW9uPEFyZ3M+IHwgUXVlcnlEZWZpbml0aW9uPFJldCwgQXJncz4sXG4+KFxuICBkZWY6IFQsXG4gIGhhbmRsZXI6IEhhbmRsZXI8UmV0LCBBcmdzLCBUPiB8IHVuZGVmaW5lZCxcbiAgb3B0aW9ucz86IFF1ZXJ5SGFuZGxlck9wdGlvbnMgfCBTaWduYWxIYW5kbGVyT3B0aW9ucyB8IFVwZGF0ZUhhbmRsZXJPcHRpb25zPEFyZ3M+XG4pOiB2b2lkIHtcbiAgY29uc3QgYWN0aXZhdG9yID0gYXNzZXJ0SW5Xb3JrZmxvd0NvbnRleHQoJ1dvcmtmbG93LnNldEhhbmRsZXIoLi4uKSBtYXkgb25seSBiZSB1c2VkIGZyb20gYSBXb3JrZmxvdyBFeGVjdXRpb24uJyk7XG4gIGNvbnN0IGRlc2NyaXB0aW9uID0gb3B0aW9ucz8uZGVzY3JpcHRpb247XG4gIGlmIChkZWYudHlwZSA9PT0gJ3VwZGF0ZScpIHtcbiAgICBpZiAodHlwZW9mIGhhbmRsZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGNvbnN0IHVwZGF0ZU9wdGlvbnMgPSBvcHRpb25zIGFzIFVwZGF0ZUhhbmRsZXJPcHRpb25zPEFyZ3M+IHwgdW5kZWZpbmVkO1xuXG4gICAgICBjb25zdCB2YWxpZGF0b3IgPSB1cGRhdGVPcHRpb25zPy52YWxpZGF0b3IgYXMgV29ya2Zsb3dVcGRhdGVWYWxpZGF0b3JUeXBlIHwgdW5kZWZpbmVkO1xuICAgICAgY29uc3QgdW5maW5pc2hlZFBvbGljeSA9IHVwZGF0ZU9wdGlvbnM/LnVuZmluaXNoZWRQb2xpY3kgPz8gSGFuZGxlclVuZmluaXNoZWRQb2xpY3kuV0FSTl9BTkRfQUJBTkRPTjtcbiAgICAgIGFjdGl2YXRvci51cGRhdGVIYW5kbGVycy5zZXQoZGVmLm5hbWUsIHsgaGFuZGxlciwgdmFsaWRhdG9yLCBkZXNjcmlwdGlvbiwgdW5maW5pc2hlZFBvbGljeSB9KTtcbiAgICAgIGFjdGl2YXRvci5kaXNwYXRjaEJ1ZmZlcmVkVXBkYXRlcygpO1xuICAgIH0gZWxzZSBpZiAoaGFuZGxlciA9PSBudWxsKSB7XG4gICAgICBhY3RpdmF0b3IudXBkYXRlSGFuZGxlcnMuZGVsZXRlKGRlZi5uYW1lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgRXhwZWN0ZWQgaGFuZGxlciB0byBiZSBlaXRoZXIgYSBmdW5jdGlvbiBvciAndW5kZWZpbmVkJy4gR290OiAnJHt0eXBlb2YgaGFuZGxlcn0nYCk7XG4gICAgfVxuICB9IGVsc2UgaWYgKGRlZi50eXBlID09PSAnc2lnbmFsJykge1xuICAgIGlmICh0eXBlb2YgaGFuZGxlciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgY29uc3Qgc2lnbmFsT3B0aW9ucyA9IG9wdGlvbnMgYXMgU2lnbmFsSGFuZGxlck9wdGlvbnMgfCB1bmRlZmluZWQ7XG4gICAgICBjb25zdCB1bmZpbmlzaGVkUG9saWN5ID0gc2lnbmFsT3B0aW9ucz8udW5maW5pc2hlZFBvbGljeSA/PyBIYW5kbGVyVW5maW5pc2hlZFBvbGljeS5XQVJOX0FORF9BQkFORE9OO1xuICAgICAgYWN0aXZhdG9yLnNpZ25hbEhhbmRsZXJzLnNldChkZWYubmFtZSwgeyBoYW5kbGVyOiBoYW5kbGVyIGFzIGFueSwgZGVzY3JpcHRpb24sIHVuZmluaXNoZWRQb2xpY3kgfSk7XG4gICAgICBhY3RpdmF0b3IuZGlzcGF0Y2hCdWZmZXJlZFNpZ25hbHMoKTtcbiAgICB9IGVsc2UgaWYgKGhhbmRsZXIgPT0gbnVsbCkge1xuICAgICAgYWN0aXZhdG9yLnNpZ25hbEhhbmRsZXJzLmRlbGV0ZShkZWYubmFtZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYEV4cGVjdGVkIGhhbmRsZXIgdG8gYmUgZWl0aGVyIGEgZnVuY3Rpb24gb3IgJ3VuZGVmaW5lZCcuIEdvdDogJyR7dHlwZW9mIGhhbmRsZXJ9J2ApO1xuICAgIH1cbiAgfSBlbHNlIGlmIChkZWYudHlwZSA9PT0gJ3F1ZXJ5Jykge1xuICAgIGlmICh0eXBlb2YgaGFuZGxlciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgYWN0aXZhdG9yLnF1ZXJ5SGFuZGxlcnMuc2V0KGRlZi5uYW1lLCB7IGhhbmRsZXI6IGhhbmRsZXIgYXMgYW55LCBkZXNjcmlwdGlvbiB9KTtcbiAgICB9IGVsc2UgaWYgKGhhbmRsZXIgPT0gbnVsbCkge1xuICAgICAgYWN0aXZhdG9yLnF1ZXJ5SGFuZGxlcnMuZGVsZXRlKGRlZi5uYW1lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgRXhwZWN0ZWQgaGFuZGxlciB0byBiZSBlaXRoZXIgYSBmdW5jdGlvbiBvciAndW5kZWZpbmVkJy4gR290OiAnJHt0eXBlb2YgaGFuZGxlcn0nYCk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYEludmFsaWQgZGVmaW5pdGlvbiB0eXBlOiAkeyhkZWYgYXMgYW55KS50eXBlfWApO1xuICB9XG59XG5cbi8qKlxuICogU2V0IGEgc2lnbmFsIGhhbmRsZXIgZnVuY3Rpb24gdGhhdCB3aWxsIGhhbmRsZSBzaWduYWxzIGNhbGxzIGZvciBub24tcmVnaXN0ZXJlZCBzaWduYWwgbmFtZXMuXG4gKlxuICogU2lnbmFscyBhcmUgZGlzcGF0Y2hlZCB0byB0aGUgZGVmYXVsdCBzaWduYWwgaGFuZGxlciBpbiB0aGUgb3JkZXIgdGhhdCB0aGV5IHdlcmUgYWNjZXB0ZWQgYnkgdGhlIHNlcnZlci5cbiAqXG4gKiBJZiB0aGlzIGZ1bmN0aW9uIGlzIGNhbGxlZCBtdWx0aXBsZSB0aW1lcyBmb3IgYSBnaXZlbiBzaWduYWwgb3IgcXVlcnkgbmFtZSB0aGUgbGFzdCBoYW5kbGVyIHdpbGwgb3ZlcndyaXRlIGFueSBwcmV2aW91cyBjYWxscy5cbiAqXG4gKiBAcGFyYW0gaGFuZGxlciBhIGZ1bmN0aW9uIHRoYXQgd2lsbCBoYW5kbGUgc2lnbmFscyBmb3Igbm9uLXJlZ2lzdGVyZWQgc2lnbmFsIG5hbWVzLCBvciBgdW5kZWZpbmVkYCB0byB1bnNldCB0aGUgaGFuZGxlci5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldERlZmF1bHRTaWduYWxIYW5kbGVyKGhhbmRsZXI6IERlZmF1bHRTaWduYWxIYW5kbGVyIHwgdW5kZWZpbmVkKTogdm9pZCB7XG4gIGNvbnN0IGFjdGl2YXRvciA9IGFzc2VydEluV29ya2Zsb3dDb250ZXh0KFxuICAgICdXb3JrZmxvdy5zZXREZWZhdWx0U2lnbmFsSGFuZGxlciguLi4pIG1heSBvbmx5IGJlIHVzZWQgZnJvbSBhIFdvcmtmbG93IEV4ZWN1dGlvbi4nXG4gICk7XG4gIGlmICh0eXBlb2YgaGFuZGxlciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGFjdGl2YXRvci5kZWZhdWx0U2lnbmFsSGFuZGxlciA9IGhhbmRsZXI7XG4gICAgYWN0aXZhdG9yLmRpc3BhdGNoQnVmZmVyZWRTaWduYWxzKCk7XG4gIH0gZWxzZSBpZiAoaGFuZGxlciA9PSBudWxsKSB7XG4gICAgYWN0aXZhdG9yLmRlZmF1bHRTaWduYWxIYW5kbGVyID0gdW5kZWZpbmVkO1xuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYEV4cGVjdGVkIGhhbmRsZXIgdG8gYmUgZWl0aGVyIGEgZnVuY3Rpb24gb3IgJ3VuZGVmaW5lZCcuIEdvdDogJyR7dHlwZW9mIGhhbmRsZXJ9J2ApO1xuICB9XG59XG5cbi8qKlxuICogVXBkYXRlcyB0aGlzIFdvcmtmbG93J3MgU2VhcmNoIEF0dHJpYnV0ZXMgYnkgbWVyZ2luZyB0aGUgcHJvdmlkZWQgYHNlYXJjaEF0dHJpYnV0ZXNgIHdpdGggdGhlIGV4aXN0aW5nIFNlYXJjaFxuICogQXR0cmlidXRlcywgYHdvcmtmbG93SW5mbygpLnNlYXJjaEF0dHJpYnV0ZXNgLlxuICpcbiAqIEZvciBleGFtcGxlLCB0aGlzIFdvcmtmbG93IGNvZGU6XG4gKlxuICogYGBgdHNcbiAqIHVwc2VydFNlYXJjaEF0dHJpYnV0ZXMoe1xuICogICBDdXN0b21JbnRGaWVsZDogWzFdLFxuICogICBDdXN0b21Cb29sRmllbGQ6IFt0cnVlXVxuICogfSk7XG4gKiB1cHNlcnRTZWFyY2hBdHRyaWJ1dGVzKHtcbiAqICAgQ3VzdG9tSW50RmllbGQ6IFs0Ml0sXG4gKiAgIEN1c3RvbUtleXdvcmRGaWVsZDogWydkdXJhYmxlIGNvZGUnLCAnaXMgZ3JlYXQnXVxuICogfSk7XG4gKiBgYGBcbiAqXG4gKiB3b3VsZCByZXN1bHQgaW4gdGhlIFdvcmtmbG93IGhhdmluZyB0aGVzZSBTZWFyY2ggQXR0cmlidXRlczpcbiAqXG4gKiBgYGB0c1xuICoge1xuICogICBDdXN0b21JbnRGaWVsZDogWzQyXSxcbiAqICAgQ3VzdG9tQm9vbEZpZWxkOiBbdHJ1ZV0sXG4gKiAgIEN1c3RvbUtleXdvcmRGaWVsZDogWydkdXJhYmxlIGNvZGUnLCAnaXMgZ3JlYXQnXVxuICogfVxuICogYGBgXG4gKlxuICogQHBhcmFtIHNlYXJjaEF0dHJpYnV0ZXMgVGhlIFJlY29yZCB0byBtZXJnZS4gVXNlIGEgdmFsdWUgb2YgYFtdYCB0byBjbGVhciBhIFNlYXJjaCBBdHRyaWJ1dGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1cHNlcnRTZWFyY2hBdHRyaWJ1dGVzKHNlYXJjaEF0dHJpYnV0ZXM6IFNlYXJjaEF0dHJpYnV0ZXMpOiB2b2lkIHtcbiAgY29uc3QgYWN0aXZhdG9yID0gYXNzZXJ0SW5Xb3JrZmxvd0NvbnRleHQoXG4gICAgJ1dvcmtmbG93LnVwc2VydFNlYXJjaEF0dHJpYnV0ZXMoLi4uKSBtYXkgb25seSBiZSB1c2VkIGZyb20gYSBXb3JrZmxvdyBFeGVjdXRpb24uJ1xuICApO1xuXG4gIGlmIChzZWFyY2hBdHRyaWJ1dGVzID09IG51bGwpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NlYXJjaEF0dHJpYnV0ZXMgbXVzdCBiZSBhIG5vbi1udWxsIFNlYXJjaEF0dHJpYnV0ZXMnKTtcbiAgfVxuXG4gIGFjdGl2YXRvci5wdXNoQ29tbWFuZCh7XG4gICAgdXBzZXJ0V29ya2Zsb3dTZWFyY2hBdHRyaWJ1dGVzOiB7XG4gICAgICBzZWFyY2hBdHRyaWJ1dGVzOiBtYXBUb1BheWxvYWRzKHNlYXJjaEF0dHJpYnV0ZVBheWxvYWRDb252ZXJ0ZXIsIHNlYXJjaEF0dHJpYnV0ZXMpLFxuICAgIH0sXG4gIH0pO1xuXG4gIGFjdGl2YXRvci5tdXRhdGVXb3JrZmxvd0luZm8oKGluZm86IFdvcmtmbG93SW5mbyk6IFdvcmtmbG93SW5mbyA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLmluZm8sXG4gICAgICBzZWFyY2hBdHRyaWJ1dGVzOiB7XG4gICAgICAgIC4uLmluZm8uc2VhcmNoQXR0cmlidXRlcyxcbiAgICAgICAgLi4uc2VhcmNoQXR0cmlidXRlcyxcbiAgICAgIH0sXG4gICAgfTtcbiAgfSk7XG59XG5cbi8qKlxuICogVXBkYXRlcyB0aGlzIFdvcmtmbG93J3MgTWVtb3MgYnkgbWVyZ2luZyB0aGUgcHJvdmlkZWQgYG1lbW9gIHdpdGggZXhpc3RpbmdcbiAqIE1lbW9zIChhcyByZXR1cm5lZCBieSBgd29ya2Zsb3dJbmZvKCkubWVtb2ApLlxuICpcbiAqIE5ldyBtZW1vIGlzIG1lcmdlZCBieSByZXBsYWNpbmcgcHJvcGVydGllcyBvZiB0aGUgc2FtZSBuYW1lIF9hdCB0aGUgZmlyc3RcbiAqIGxldmVsIG9ubHlfLiBTZXR0aW5nIGEgcHJvcGVydHkgdG8gdmFsdWUgYHVuZGVmaW5lZGAgb3IgYG51bGxgIGNsZWFycyB0aGF0XG4gKiBrZXkgZnJvbSB0aGUgTWVtby5cbiAqXG4gKiBGb3IgZXhhbXBsZTpcbiAqXG4gKiBgYGB0c1xuICogdXBzZXJ0TWVtbyh7XG4gKiAgIGtleTE6IHZhbHVlLFxuICogICBrZXkzOiB7IHN1YmtleTE6IHZhbHVlIH1cbiAqICAga2V5NDogdmFsdWUsXG4gKiB9KTtcbiAqIHVwc2VydE1lbW8oe1xuICogICBrZXkyOiB2YWx1ZVxuICogICBrZXkzOiB7IHN1YmtleTI6IHZhbHVlIH1cbiAqICAga2V5NDogdW5kZWZpbmVkLFxuICogfSk7XG4gKiBgYGBcbiAqXG4gKiB3b3VsZCByZXN1bHQgaW4gdGhlIFdvcmtmbG93IGhhdmluZyB0aGVzZSBNZW1vOlxuICpcbiAqIGBgYHRzXG4gKiB7XG4gKiAgIGtleTE6IHZhbHVlLFxuICogICBrZXkyOiB2YWx1ZSxcbiAqICAga2V5MzogeyBzdWJrZXkyOiB2YWx1ZSB9ICAvLyBOb3RlIHRoaXMgb2JqZWN0IHdhcyBjb21wbGV0ZWx5IHJlcGxhY2VkXG4gKiAgIC8vIE5vdGUgdGhhdCBrZXk0IHdhcyBjb21wbGV0ZWx5IHJlbW92ZWRcbiAqIH1cbiAqIGBgYFxuICpcbiAqIEBwYXJhbSBtZW1vIFRoZSBSZWNvcmQgdG8gbWVyZ2UuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1cHNlcnRNZW1vKG1lbW86IFJlY29yZDxzdHJpbmcsIHVua25vd24+KTogdm9pZCB7XG4gIGNvbnN0IGFjdGl2YXRvciA9IGFzc2VydEluV29ya2Zsb3dDb250ZXh0KCdXb3JrZmxvdy51cHNlcnRNZW1vKC4uLikgbWF5IG9ubHkgYmUgdXNlZCBmcm9tIGEgV29ya2Zsb3cgRXhlY3V0aW9uLicpO1xuXG4gIGlmIChtZW1vID09IG51bGwpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ21lbW8gbXVzdCBiZSBhIG5vbi1udWxsIFJlY29yZCcpO1xuICB9XG5cbiAgYWN0aXZhdG9yLnB1c2hDb21tYW5kKHtcbiAgICBtb2RpZnlXb3JrZmxvd1Byb3BlcnRpZXM6IHtcbiAgICAgIHVwc2VydGVkTWVtbzoge1xuICAgICAgICBmaWVsZHM6IG1hcFRvUGF5bG9hZHMoXG4gICAgICAgICAgYWN0aXZhdG9yLnBheWxvYWRDb252ZXJ0ZXIsXG4gICAgICAgICAgLy8gQ29udmVydCBudWxsIHRvIHVuZGVmaW5lZFxuICAgICAgICAgIE9iamVjdC5mcm9tRW50cmllcyhPYmplY3QuZW50cmllcyhtZW1vKS5tYXAoKFtrLCB2XSkgPT4gW2ssIHYgPz8gdW5kZWZpbmVkXSkpXG4gICAgICAgICksXG4gICAgICB9LFxuICAgIH0sXG4gIH0pO1xuXG4gIGFjdGl2YXRvci5tdXRhdGVXb3JrZmxvd0luZm8oKGluZm86IFdvcmtmbG93SW5mbyk6IFdvcmtmbG93SW5mbyA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLmluZm8sXG4gICAgICBtZW1vOiBPYmplY3QuZnJvbUVudHJpZXMoXG4gICAgICAgIE9iamVjdC5lbnRyaWVzKHtcbiAgICAgICAgICAuLi5pbmZvLm1lbW8sXG4gICAgICAgICAgLi4ubWVtbyxcbiAgICAgICAgfSkuZmlsdGVyKChbXywgdl0pID0+IHYgIT0gbnVsbClcbiAgICAgICksXG4gICAgfTtcbiAgfSk7XG59XG5cbi8qKlxuICogV2hldGhlciB1cGRhdGUgYW5kIHNpZ25hbCBoYW5kbGVycyBoYXZlIGZpbmlzaGVkIGV4ZWN1dGluZy5cbiAqXG4gKiBDb25zaWRlciB3YWl0aW5nIG9uIHRoaXMgY29uZGl0aW9uIGJlZm9yZSB3b3JrZmxvdyByZXR1cm4gb3IgY29udGludWUtYXMtbmV3LCB0byBwcmV2ZW50XG4gKiBpbnRlcnJ1cHRpb24gb2YgaW4tcHJvZ3Jlc3MgaGFuZGxlcnMgYnkgd29ya2Zsb3cgZXhpdDpcbiAqXG4gKiBgYGB0c1xuICogYXdhaXQgd29ya2Zsb3cuY29uZGl0aW9uKHdvcmtmbG93LmFsbEhhbmRsZXJzRmluaXNoZWQpXG4gKiBgYGBcbiAqXG4gKiBAcmV0dXJucyB0cnVlIGlmIHRoZXJlIGFyZSBubyBpbi1wcm9ncmVzcyB1cGRhdGUgb3Igc2lnbmFsIGhhbmRsZXIgZXhlY3V0aW9ucy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFsbEhhbmRsZXJzRmluaXNoZWQoKTogYm9vbGVhbiB7XG4gIGNvbnN0IGFjdGl2YXRvciA9IGFzc2VydEluV29ya2Zsb3dDb250ZXh0KCdhbGxIYW5kbGVyc0ZpbmlzaGVkKCkgbWF5IG9ubHkgYmUgdXNlZCBmcm9tIGEgV29ya2Zsb3cgRXhlY3V0aW9uLicpO1xuICByZXR1cm4gYWN0aXZhdG9yLmluUHJvZ3Jlc3NTaWduYWxzLnNpemUgPT09IDAgJiYgYWN0aXZhdG9yLmluUHJvZ3Jlc3NVcGRhdGVzLnNpemUgPT09IDA7XG59XG5cbmV4cG9ydCBjb25zdCBzdGFja1RyYWNlUXVlcnkgPSBkZWZpbmVRdWVyeTxzdHJpbmc+KCdfX3N0YWNrX3RyYWNlJyk7XG5leHBvcnQgY29uc3QgZW5oYW5jZWRTdGFja1RyYWNlUXVlcnkgPSBkZWZpbmVRdWVyeTxFbmhhbmNlZFN0YWNrVHJhY2U+KCdfX2VuaGFuY2VkX3N0YWNrX3RyYWNlJyk7XG5leHBvcnQgY29uc3Qgd29ya2Zsb3dNZXRhZGF0YVF1ZXJ5ID0gZGVmaW5lUXVlcnk8dGVtcG9yYWwuYXBpLnNkay52MS5JV29ya2Zsb3dNZXRhZGF0YT4oJ19fdGVtcG9yYWxfd29ya2Zsb3dfbWV0YWRhdGEnKTtcbiIsImltcG9ydCAqIGFzIGFjdGl2aXRpZXMgZnJvbSAnLi9hY3Rpdml0aWVzJztcbmltcG9ydCB7IHByb3h5QWN0aXZpdGllcywgcHJveHlMb2NhbEFjdGl2aXRpZXMsIHNsZWVwIGFzIHRlbXBvcmFsU2xlZXAgfSBmcm9tICdAdGVtcG9yYWxpby93b3JrZmxvdyc7XG5pbXBvcnQgdHlwZSB7IFRyYW5zYWN0aW9uSW5wdXQgfSBmcm9tICcuL2xpYi90eXBlcyc7XG5cbmNvbnN0IHsgY2hhcmdlQ2FyZCwgcmVzZXJ2ZVN0b2NrLCBzaGlwSXRlbSwgc2VuZFJlY2VpcHQsIHNlbmRDaGFyZ2VGYWlsdXJlRW1haWwsIHNlbmRSZXZpZXdSZXF1ZXN0IH0gPSBwcm94eUFjdGl2aXRpZXM8dHlwZW9mIGFjdGl2aXRpZXM+KHtcbiAgc3RhcnRUb0Nsb3NlVGltZW91dDogJzUgc2Vjb25kcycsXG4gIHJldHJ5OiB7XG4gICAgaW5pdGlhbEludGVydmFsOiAnMSBzZWNvbmQnLFxuICAgIGJhY2tvZmZDb2VmZmljaWVudDogMSxcbiAgfVxufSk7XG5cbmNvbnN0IHsgcGVuZGluZ1NsZWVwLCBjb21wbGV0ZVNsZWVwIH0gPSBwcm94eUxvY2FsQWN0aXZpdGllczx0eXBlb2YgYWN0aXZpdGllcz4oe1xuICBzdGFydFRvQ2xvc2VUaW1lb3V0OiAnMSBzZWNvbmRzJyxcbiAgcmV0cnk6IHtcbiAgICBpbml0aWFsSW50ZXJ2YWw6ICcxIHNlY29uZCcsXG4gICAgYmFja29mZkNvZWZmaWNpZW50OiAxLFxuICB9XG59KTtcblxuYXN5bmMgZnVuY3Rpb24gc2xlZXAoZHVyYXRpb246IGFueSk6IFByb21pc2U8dm9pZD4ge1xuICAvLyBFbWl0IHRoZSB3YWl0IHN0ZXAgKHRoaXMgd2lsbCBzaG93IGFzIHBlbmRpbmcgd2l0aCBpbnRlcmFjdGlvbiBidXR0b25zKVxuICBhd2FpdCBwZW5kaW5nU2xlZXAoKTtcblxuICAvLyBTbGVlcCBmb3IgdGhlIHNwZWNpZmllZCBkdXJhdGlvbiB1c2luZyBUZW1wb3JhbCdzIHRpbWVyXG4gIGF3YWl0IHRlbXBvcmFsU2xlZXAoZHVyYXRpb24pO1xuXG4gIC8vIEVtaXQgdGhlIGNvbXBsZXRpb24gc3RlcFxuICBhd2FpdCBjb21wbGV0ZVNsZWVwKCk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBQdXJjaGFzZVdvcmtmbG93KGlucHV0OiBUcmFuc2FjdGlvbklucHV0KSB7XG4gIGNvbnN0IHsgY3VzdG9tZXJFbWFpbCwgcHJvZHVjdE5hbWUsIGFtb3VudCwgc2hpcHBpbmdBZGRyZXNzIH0gPSBpbnB1dDtcblxuICAvLyBDaGFyZ2UgdGhlIGN1c3RvbWVyJ3MgY2FyZFxuICB0cnkge1xuICAgIGF3YWl0IGNoYXJnZUNhcmQoY3VzdG9tZXJFbWFpbCwgYW1vdW50KTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBhd2FpdCBzZW5kQ2hhcmdlRmFpbHVyZUVtYWlsKGN1c3RvbWVyRW1haWwsIGFtb3VudCk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gUmVzZXJ2ZSB0aGUgaXRlbSBpbiBpbnZlbnRvcnlcbiAgYXdhaXQgcmVzZXJ2ZVN0b2NrKHByb2R1Y3ROYW1lKTtcblxuICAvLyBTaGlwIHRoZSBpdGVtXG4gIGF3YWl0IHNoaXBJdGVtKGN1c3RvbWVyRW1haWwsIHByb2R1Y3ROYW1lLCBzaGlwcGluZ0FkZHJlc3MpO1xuXG4gIC8vIFNlbmQgcmVjZWlwdCBjb25maXJtYXRpb25cbiAgYXdhaXQgc2VuZFJlY2VpcHQoY3VzdG9tZXJFbWFpbCwgcHJvZHVjdE5hbWUsIGFtb3VudCk7XG5cbiAgLy8gU2xlZXAgZm9yIDMwIGRheXMgKG9rLCBpdCdzIGEgZGVtbywgc28ganVzdCA1IHNlY29uZHMpXG4gIGF3YWl0IHNsZWVwKCc1IHNlY29uZHMnKTtcblxuICAvLyBTZW5kIHJldmlldyByZXF1ZXN0XG4gIGF3YWl0IHNlbmRSZXZpZXdSZXF1ZXN0KGN1c3RvbWVyRW1haWwsIHByb2R1Y3ROYW1lLCBhbW91bnQpO1xufSAiLCIvKiAoaWdub3JlZCkgKi8iLCIvKiAoaWdub3JlZCkgKi8iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbi8vIEhlbHBlcnMuXG5jb25zdCBzID0gMTAwMDtcbmNvbnN0IG0gPSBzICogNjA7XG5jb25zdCBoID0gbSAqIDYwO1xuY29uc3QgZCA9IGggKiAyNDtcbmNvbnN0IHcgPSBkICogNztcbmNvbnN0IHkgPSBkICogMzY1LjI1O1xuZnVuY3Rpb24gbXModmFsdWUsIG9wdGlvbnMpIHtcbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiB2YWx1ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICByZXR1cm4gcGFyc2UodmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgJiYgaXNGaW5pdGUodmFsdWUpKSB7XG4gICAgICAgICAgICByZXR1cm4gb3B0aW9ucz8ubG9uZyA/IGZtdExvbmcodmFsdWUpIDogZm10U2hvcnQodmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignVmFsdWUgaXMgbm90IGEgc3RyaW5nIG9yIG51bWJlci4nKTtcbiAgICB9XG4gICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBpc0Vycm9yKGVycm9yKVxuICAgICAgICAgICAgPyBgJHtlcnJvci5tZXNzYWdlfS4gdmFsdWU9JHtKU09OLnN0cmluZ2lmeSh2YWx1ZSl9YFxuICAgICAgICAgICAgOiAnQW4gdW5rbm93biBlcnJvciBoYXMgb2NjdXJlZC4nO1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IobWVzc2FnZSk7XG4gICAgfVxufVxuLyoqXG4gKiBQYXJzZSB0aGUgZ2l2ZW4gYHN0cmAgYW5kIHJldHVybiBtaWxsaXNlY29uZHMuXG4gKi9cbmZ1bmN0aW9uIHBhcnNlKHN0cikge1xuICAgIHN0ciA9IFN0cmluZyhzdHIpO1xuICAgIGlmIChzdHIubGVuZ3RoID4gMTAwKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignVmFsdWUgZXhjZWVkcyB0aGUgbWF4aW11bSBsZW5ndGggb2YgMTAwIGNoYXJhY3RlcnMuJyk7XG4gICAgfVxuICAgIGNvbnN0IG1hdGNoID0gL14oLT8oPzpcXGQrKT9cXC4/XFxkKykgKihtaWxsaXNlY29uZHM/fG1zZWNzP3xtc3xzZWNvbmRzP3xzZWNzP3xzfG1pbnV0ZXM/fG1pbnM/fG18aG91cnM/fGhycz98aHxkYXlzP3xkfHdlZWtzP3x3fHllYXJzP3x5cnM/fHkpPyQvaS5leGVjKHN0cik7XG4gICAgaWYgKCFtYXRjaCkge1xuICAgICAgICByZXR1cm4gTmFOO1xuICAgIH1cbiAgICBjb25zdCBuID0gcGFyc2VGbG9hdChtYXRjaFsxXSk7XG4gICAgY29uc3QgdHlwZSA9IChtYXRjaFsyXSB8fCAnbXMnKS50b0xvd2VyQ2FzZSgpO1xuICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICBjYXNlICd5ZWFycyc6XG4gICAgICAgIGNhc2UgJ3llYXInOlxuICAgICAgICBjYXNlICd5cnMnOlxuICAgICAgICBjYXNlICd5cic6XG4gICAgICAgIGNhc2UgJ3knOlxuICAgICAgICAgICAgcmV0dXJuIG4gKiB5O1xuICAgICAgICBjYXNlICd3ZWVrcyc6XG4gICAgICAgIGNhc2UgJ3dlZWsnOlxuICAgICAgICBjYXNlICd3JzpcbiAgICAgICAgICAgIHJldHVybiBuICogdztcbiAgICAgICAgY2FzZSAnZGF5cyc6XG4gICAgICAgIGNhc2UgJ2RheSc6XG4gICAgICAgIGNhc2UgJ2QnOlxuICAgICAgICAgICAgcmV0dXJuIG4gKiBkO1xuICAgICAgICBjYXNlICdob3Vycyc6XG4gICAgICAgIGNhc2UgJ2hvdXInOlxuICAgICAgICBjYXNlICdocnMnOlxuICAgICAgICBjYXNlICdocic6XG4gICAgICAgIGNhc2UgJ2gnOlxuICAgICAgICAgICAgcmV0dXJuIG4gKiBoO1xuICAgICAgICBjYXNlICdtaW51dGVzJzpcbiAgICAgICAgY2FzZSAnbWludXRlJzpcbiAgICAgICAgY2FzZSAnbWlucyc6XG4gICAgICAgIGNhc2UgJ21pbic6XG4gICAgICAgIGNhc2UgJ20nOlxuICAgICAgICAgICAgcmV0dXJuIG4gKiBtO1xuICAgICAgICBjYXNlICdzZWNvbmRzJzpcbiAgICAgICAgY2FzZSAnc2Vjb25kJzpcbiAgICAgICAgY2FzZSAnc2Vjcyc6XG4gICAgICAgIGNhc2UgJ3NlYyc6XG4gICAgICAgIGNhc2UgJ3MnOlxuICAgICAgICAgICAgcmV0dXJuIG4gKiBzO1xuICAgICAgICBjYXNlICdtaWxsaXNlY29uZHMnOlxuICAgICAgICBjYXNlICdtaWxsaXNlY29uZCc6XG4gICAgICAgIGNhc2UgJ21zZWNzJzpcbiAgICAgICAgY2FzZSAnbXNlYyc6XG4gICAgICAgIGNhc2UgJ21zJzpcbiAgICAgICAgICAgIHJldHVybiBuO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgLy8gVGhpcyBzaG91bGQgbmV2ZXIgb2NjdXIuXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFRoZSB1bml0ICR7dHlwZX0gd2FzIG1hdGNoZWQsIGJ1dCBubyBtYXRjaGluZyBjYXNlIGV4aXN0cy5gKTtcbiAgICB9XG59XG5leHBvcnRzLmRlZmF1bHQgPSBtcztcbi8qKlxuICogU2hvcnQgZm9ybWF0IGZvciBgbXNgLlxuICovXG5mdW5jdGlvbiBmbXRTaG9ydChtcykge1xuICAgIGNvbnN0IG1zQWJzID0gTWF0aC5hYnMobXMpO1xuICAgIGlmIChtc0FicyA+PSBkKSB7XG4gICAgICAgIHJldHVybiBgJHtNYXRoLnJvdW5kKG1zIC8gZCl9ZGA7XG4gICAgfVxuICAgIGlmIChtc0FicyA+PSBoKSB7XG4gICAgICAgIHJldHVybiBgJHtNYXRoLnJvdW5kKG1zIC8gaCl9aGA7XG4gICAgfVxuICAgIGlmIChtc0FicyA+PSBtKSB7XG4gICAgICAgIHJldHVybiBgJHtNYXRoLnJvdW5kKG1zIC8gbSl9bWA7XG4gICAgfVxuICAgIGlmIChtc0FicyA+PSBzKSB7XG4gICAgICAgIHJldHVybiBgJHtNYXRoLnJvdW5kKG1zIC8gcyl9c2A7XG4gICAgfVxuICAgIHJldHVybiBgJHttc31tc2A7XG59XG4vKipcbiAqIExvbmcgZm9ybWF0IGZvciBgbXNgLlxuICovXG5mdW5jdGlvbiBmbXRMb25nKG1zKSB7XG4gICAgY29uc3QgbXNBYnMgPSBNYXRoLmFicyhtcyk7XG4gICAgaWYgKG1zQWJzID49IGQpIHtcbiAgICAgICAgcmV0dXJuIHBsdXJhbChtcywgbXNBYnMsIGQsICdkYXknKTtcbiAgICB9XG4gICAgaWYgKG1zQWJzID49IGgpIHtcbiAgICAgICAgcmV0dXJuIHBsdXJhbChtcywgbXNBYnMsIGgsICdob3VyJyk7XG4gICAgfVxuICAgIGlmIChtc0FicyA+PSBtKSB7XG4gICAgICAgIHJldHVybiBwbHVyYWwobXMsIG1zQWJzLCBtLCAnbWludXRlJyk7XG4gICAgfVxuICAgIGlmIChtc0FicyA+PSBzKSB7XG4gICAgICAgIHJldHVybiBwbHVyYWwobXMsIG1zQWJzLCBzLCAnc2Vjb25kJyk7XG4gICAgfVxuICAgIHJldHVybiBgJHttc30gbXNgO1xufVxuLyoqXG4gKiBQbHVyYWxpemF0aW9uIGhlbHBlci5cbiAqL1xuZnVuY3Rpb24gcGx1cmFsKG1zLCBtc0FicywgbiwgbmFtZSkge1xuICAgIGNvbnN0IGlzUGx1cmFsID0gbXNBYnMgPj0gbiAqIDEuNTtcbiAgICByZXR1cm4gYCR7TWF0aC5yb3VuZChtcyAvIG4pfSAke25hbWV9JHtpc1BsdXJhbCA/ICdzJyA6ICcnfWA7XG59XG4vKipcbiAqIEEgdHlwZSBndWFyZCBmb3IgZXJyb3JzLlxuICovXG5mdW5jdGlvbiBpc0Vycm9yKGVycm9yKSB7XG4gICAgcmV0dXJuIHR5cGVvZiBlcnJvciA9PT0gJ29iamVjdCcgJiYgZXJyb3IgIT09IG51bGwgJiYgJ21lc3NhZ2UnIGluIGVycm9yO1xufVxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzLmRlZmF1bHQ7XG5tb2R1bGUuZXhwb3J0cy5kZWZhdWx0ID0gZXhwb3J0cy5kZWZhdWx0O1xuIiwiLy8gR0VORVJBVEVEIEZJTEUuIERPIE5PVCBFRElULlxudmFyIExvbmcgPSAoZnVuY3Rpb24oZXhwb3J0cykge1xuICBcInVzZSBzdHJpY3RcIjtcbiAgXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICAgIHZhbHVlOiB0cnVlXG4gIH0pO1xuICBleHBvcnRzLmRlZmF1bHQgPSB2b2lkIDA7XG4gIFxuICAvKipcbiAgICogQGxpY2Vuc2VcbiAgICogQ29weXJpZ2h0IDIwMDkgVGhlIENsb3N1cmUgTGlicmFyeSBBdXRob3JzXG4gICAqIENvcHlyaWdodCAyMDIwIERhbmllbCBXaXJ0eiAvIFRoZSBsb25nLmpzIEF1dGhvcnMuXG4gICAqXG4gICAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gICAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAgICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gICAqXG4gICAqICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAgICpcbiAgICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICAgKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gICAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICAgKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gICAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICAgKlxuICAgKiBTUERYLUxpY2Vuc2UtSWRlbnRpZmllcjogQXBhY2hlLTIuMFxuICAgKi9cbiAgLy8gV2ViQXNzZW1ibHkgb3B0aW1pemF0aW9ucyB0byBkbyBuYXRpdmUgaTY0IG11bHRpcGxpY2F0aW9uIGFuZCBkaXZpZGVcbiAgdmFyIHdhc20gPSBudWxsO1xuICBcbiAgdHJ5IHtcbiAgICB3YXNtID0gbmV3IFdlYkFzc2VtYmx5Lkluc3RhbmNlKG5ldyBXZWJBc3NlbWJseS5Nb2R1bGUobmV3IFVpbnQ4QXJyYXkoWzAsIDk3LCAxMTUsIDEwOSwgMSwgMCwgMCwgMCwgMSwgMTMsIDIsIDk2LCAwLCAxLCAxMjcsIDk2LCA0LCAxMjcsIDEyNywgMTI3LCAxMjcsIDEsIDEyNywgMywgNywgNiwgMCwgMSwgMSwgMSwgMSwgMSwgNiwgNiwgMSwgMTI3LCAxLCA2NSwgMCwgMTEsIDcsIDUwLCA2LCAzLCAxMDksIDExNywgMTA4LCAwLCAxLCA1LCAxMDAsIDEwNSwgMTE4LCA5NSwgMTE1LCAwLCAyLCA1LCAxMDAsIDEwNSwgMTE4LCA5NSwgMTE3LCAwLCAzLCA1LCAxMTQsIDEwMSwgMTA5LCA5NSwgMTE1LCAwLCA0LCA1LCAxMTQsIDEwMSwgMTA5LCA5NSwgMTE3LCAwLCA1LCA4LCAxMDMsIDEwMSwgMTE2LCA5NSwgMTA0LCAxMDUsIDEwMywgMTA0LCAwLCAwLCAxMCwgMTkxLCAxLCA2LCA0LCAwLCAzNSwgMCwgMTEsIDM2LCAxLCAxLCAxMjYsIDMyLCAwLCAxNzMsIDMyLCAxLCAxNzMsIDY2LCAzMiwgMTM0LCAxMzIsIDMyLCAyLCAxNzMsIDMyLCAzLCAxNzMsIDY2LCAzMiwgMTM0LCAxMzIsIDEyNiwgMzQsIDQsIDY2LCAzMiwgMTM1LCAxNjcsIDM2LCAwLCAzMiwgNCwgMTY3LCAxMSwgMzYsIDEsIDEsIDEyNiwgMzIsIDAsIDE3MywgMzIsIDEsIDE3MywgNjYsIDMyLCAxMzQsIDEzMiwgMzIsIDIsIDE3MywgMzIsIDMsIDE3MywgNjYsIDMyLCAxMzQsIDEzMiwgMTI3LCAzNCwgNCwgNjYsIDMyLCAxMzUsIDE2NywgMzYsIDAsIDMyLCA0LCAxNjcsIDExLCAzNiwgMSwgMSwgMTI2LCAzMiwgMCwgMTczLCAzMiwgMSwgMTczLCA2NiwgMzIsIDEzNCwgMTMyLCAzMiwgMiwgMTczLCAzMiwgMywgMTczLCA2NiwgMzIsIDEzNCwgMTMyLCAxMjgsIDM0LCA0LCA2NiwgMzIsIDEzNSwgMTY3LCAzNiwgMCwgMzIsIDQsIDE2NywgMTEsIDM2LCAxLCAxLCAxMjYsIDMyLCAwLCAxNzMsIDMyLCAxLCAxNzMsIDY2LCAzMiwgMTM0LCAxMzIsIDMyLCAyLCAxNzMsIDMyLCAzLCAxNzMsIDY2LCAzMiwgMTM0LCAxMzIsIDEyOSwgMzQsIDQsIDY2LCAzMiwgMTM1LCAxNjcsIDM2LCAwLCAzMiwgNCwgMTY3LCAxMSwgMzYsIDEsIDEsIDEyNiwgMzIsIDAsIDE3MywgMzIsIDEsIDE3MywgNjYsIDMyLCAxMzQsIDEzMiwgMzIsIDIsIDE3MywgMzIsIDMsIDE3MywgNjYsIDMyLCAxMzQsIDEzMiwgMTMwLCAzNCwgNCwgNjYsIDMyLCAxMzUsIDE2NywgMzYsIDAsIDMyLCA0LCAxNjcsIDExXSkpLCB7fSkuZXhwb3J0cztcbiAgfSBjYXRjaCAoZSkgey8vIG5vIHdhc20gc3VwcG9ydCA6KFxuICB9XG4gIC8qKlxuICAgKiBDb25zdHJ1Y3RzIGEgNjQgYml0IHR3bydzLWNvbXBsZW1lbnQgaW50ZWdlciwgZ2l2ZW4gaXRzIGxvdyBhbmQgaGlnaCAzMiBiaXQgdmFsdWVzIGFzICpzaWduZWQqIGludGVnZXJzLlxuICAgKiAgU2VlIHRoZSBmcm9tKiBmdW5jdGlvbnMgYmVsb3cgZm9yIG1vcmUgY29udmVuaWVudCB3YXlzIG9mIGNvbnN0cnVjdGluZyBMb25ncy5cbiAgICogQGV4cG9ydHMgTG9uZ1xuICAgKiBAY2xhc3MgQSBMb25nIGNsYXNzIGZvciByZXByZXNlbnRpbmcgYSA2NCBiaXQgdHdvJ3MtY29tcGxlbWVudCBpbnRlZ2VyIHZhbHVlLlxuICAgKiBAcGFyYW0ge251bWJlcn0gbG93IFRoZSBsb3cgKHNpZ25lZCkgMzIgYml0cyBvZiB0aGUgbG9uZ1xuICAgKiBAcGFyYW0ge251bWJlcn0gaGlnaCBUaGUgaGlnaCAoc2lnbmVkKSAzMiBiaXRzIG9mIHRoZSBsb25nXG4gICAqIEBwYXJhbSB7Ym9vbGVhbj19IHVuc2lnbmVkIFdoZXRoZXIgdW5zaWduZWQgb3Igbm90LCBkZWZhdWx0cyB0byBzaWduZWRcbiAgICogQGNvbnN0cnVjdG9yXG4gICAqL1xuICBcbiAgXG4gIGZ1bmN0aW9uIExvbmcobG93LCBoaWdoLCB1bnNpZ25lZCkge1xuICAgIC8qKlxuICAgICAqIFRoZSBsb3cgMzIgYml0cyBhcyBhIHNpZ25lZCB2YWx1ZS5cbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMubG93ID0gbG93IHwgMDtcbiAgICAvKipcbiAgICAgKiBUaGUgaGlnaCAzMiBiaXRzIGFzIGEgc2lnbmVkIHZhbHVlLlxuICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICovXG4gIFxuICAgIHRoaXMuaGlnaCA9IGhpZ2ggfCAwO1xuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgdW5zaWduZWQgb3Igbm90LlxuICAgICAqIEB0eXBlIHtib29sZWFufVxuICAgICAqL1xuICBcbiAgICB0aGlzLnVuc2lnbmVkID0gISF1bnNpZ25lZDtcbiAgfSAvLyBUaGUgaW50ZXJuYWwgcmVwcmVzZW50YXRpb24gb2YgYSBsb25nIGlzIHRoZSB0d28gZ2l2ZW4gc2lnbmVkLCAzMi1iaXQgdmFsdWVzLlxuICAvLyBXZSB1c2UgMzItYml0IHBpZWNlcyBiZWNhdXNlIHRoZXNlIGFyZSB0aGUgc2l6ZSBvZiBpbnRlZ2VycyBvbiB3aGljaFxuICAvLyBKYXZhc2NyaXB0IHBlcmZvcm1zIGJpdC1vcGVyYXRpb25zLiAgRm9yIG9wZXJhdGlvbnMgbGlrZSBhZGRpdGlvbiBhbmRcbiAgLy8gbXVsdGlwbGljYXRpb24sIHdlIHNwbGl0IGVhY2ggbnVtYmVyIGludG8gMTYgYml0IHBpZWNlcywgd2hpY2ggY2FuIGVhc2lseSBiZVxuICAvLyBtdWx0aXBsaWVkIHdpdGhpbiBKYXZhc2NyaXB0J3MgZmxvYXRpbmctcG9pbnQgcmVwcmVzZW50YXRpb24gd2l0aG91dCBvdmVyZmxvd1xuICAvLyBvciBjaGFuZ2UgaW4gc2lnbi5cbiAgLy9cbiAgLy8gSW4gdGhlIGFsZ29yaXRobXMgYmVsb3csIHdlIGZyZXF1ZW50bHkgcmVkdWNlIHRoZSBuZWdhdGl2ZSBjYXNlIHRvIHRoZVxuICAvLyBwb3NpdGl2ZSBjYXNlIGJ5IG5lZ2F0aW5nIHRoZSBpbnB1dChzKSBhbmQgdGhlbiBwb3N0LXByb2Nlc3NpbmcgdGhlIHJlc3VsdC5cbiAgLy8gTm90ZSB0aGF0IHdlIG11c3QgQUxXQVlTIGNoZWNrIHNwZWNpYWxseSB3aGV0aGVyIHRob3NlIHZhbHVlcyBhcmUgTUlOX1ZBTFVFXG4gIC8vICgtMl42MykgYmVjYXVzZSAtTUlOX1ZBTFVFID09IE1JTl9WQUxVRSAoc2luY2UgMl42MyBjYW5ub3QgYmUgcmVwcmVzZW50ZWQgYXNcbiAgLy8gYSBwb3NpdGl2ZSBudW1iZXIsIGl0IG92ZXJmbG93cyBiYWNrIGludG8gYSBuZWdhdGl2ZSkuICBOb3QgaGFuZGxpbmcgdGhpc1xuICAvLyBjYXNlIHdvdWxkIG9mdGVuIHJlc3VsdCBpbiBpbmZpbml0ZSByZWN1cnNpb24uXG4gIC8vXG4gIC8vIENvbW1vbiBjb25zdGFudCB2YWx1ZXMgWkVSTywgT05FLCBORUdfT05FLCBldGMuIGFyZSBkZWZpbmVkIGJlbG93IHRoZSBmcm9tKlxuICAvLyBtZXRob2RzIG9uIHdoaWNoIHRoZXkgZGVwZW5kLlxuICBcbiAgLyoqXG4gICAqIEFuIGluZGljYXRvciB1c2VkIHRvIHJlbGlhYmx5IGRldGVybWluZSBpZiBhbiBvYmplY3QgaXMgYSBMb25nIG9yIG5vdC5cbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqIEBjb25zdFxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgXG4gIFxuICBMb25nLnByb3RvdHlwZS5fX2lzTG9uZ19fO1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoTG9uZy5wcm90b3R5cGUsIFwiX19pc0xvbmdfX1wiLCB7XG4gICAgdmFsdWU6IHRydWVcbiAgfSk7XG4gIC8qKlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHsqfSBvYmogT2JqZWN0XG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKiBAaW5uZXJcbiAgICovXG4gIFxuICBmdW5jdGlvbiBpc0xvbmcob2JqKSB7XG4gICAgcmV0dXJuIChvYmogJiYgb2JqW1wiX19pc0xvbmdfX1wiXSkgPT09IHRydWU7XG4gIH1cbiAgLyoqXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0geyp9IHZhbHVlIG51bWJlclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgKiBAaW5uZXJcbiAgICovXG4gIFxuICBcbiAgZnVuY3Rpb24gY3R6MzIodmFsdWUpIHtcbiAgICB2YXIgYyA9IE1hdGguY2x6MzIodmFsdWUgJiAtdmFsdWUpO1xuICAgIHJldHVybiB2YWx1ZSA/IDMxIC0gYyA6IGM7XG4gIH1cbiAgLyoqXG4gICAqIFRlc3RzIGlmIHRoZSBzcGVjaWZpZWQgb2JqZWN0IGlzIGEgTG9uZy5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7Kn0gb2JqIE9iamVjdFxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIFxuICBcbiAgTG9uZy5pc0xvbmcgPSBpc0xvbmc7XG4gIC8qKlxuICAgKiBBIGNhY2hlIG9mIHRoZSBMb25nIHJlcHJlc2VudGF0aW9ucyBvZiBzbWFsbCBpbnRlZ2VyIHZhbHVlcy5cbiAgICogQHR5cGUgeyFPYmplY3R9XG4gICAqIEBpbm5lclxuICAgKi9cbiAgXG4gIHZhciBJTlRfQ0FDSEUgPSB7fTtcbiAgLyoqXG4gICAqIEEgY2FjaGUgb2YgdGhlIExvbmcgcmVwcmVzZW50YXRpb25zIG9mIHNtYWxsIHVuc2lnbmVkIGludGVnZXIgdmFsdWVzLlxuICAgKiBAdHlwZSB7IU9iamVjdH1cbiAgICogQGlubmVyXG4gICAqL1xuICBcbiAgdmFyIFVJTlRfQ0FDSEUgPSB7fTtcbiAgLyoqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZVxuICAgKiBAcGFyYW0ge2Jvb2xlYW49fSB1bnNpZ25lZFxuICAgKiBAcmV0dXJucyB7IUxvbmd9XG4gICAqIEBpbm5lclxuICAgKi9cbiAgXG4gIGZ1bmN0aW9uIGZyb21JbnQodmFsdWUsIHVuc2lnbmVkKSB7XG4gICAgdmFyIG9iaiwgY2FjaGVkT2JqLCBjYWNoZTtcbiAgXG4gICAgaWYgKHVuc2lnbmVkKSB7XG4gICAgICB2YWx1ZSA+Pj49IDA7XG4gIFxuICAgICAgaWYgKGNhY2hlID0gMCA8PSB2YWx1ZSAmJiB2YWx1ZSA8IDI1Nikge1xuICAgICAgICBjYWNoZWRPYmogPSBVSU5UX0NBQ0hFW3ZhbHVlXTtcbiAgICAgICAgaWYgKGNhY2hlZE9iaikgcmV0dXJuIGNhY2hlZE9iajtcbiAgICAgIH1cbiAgXG4gICAgICBvYmogPSBmcm9tQml0cyh2YWx1ZSwgMCwgdHJ1ZSk7XG4gICAgICBpZiAoY2FjaGUpIFVJTlRfQ0FDSEVbdmFsdWVdID0gb2JqO1xuICAgICAgcmV0dXJuIG9iajtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFsdWUgfD0gMDtcbiAgXG4gICAgICBpZiAoY2FjaGUgPSAtMTI4IDw9IHZhbHVlICYmIHZhbHVlIDwgMTI4KSB7XG4gICAgICAgIGNhY2hlZE9iaiA9IElOVF9DQUNIRVt2YWx1ZV07XG4gICAgICAgIGlmIChjYWNoZWRPYmopIHJldHVybiBjYWNoZWRPYmo7XG4gICAgICB9XG4gIFxuICAgICAgb2JqID0gZnJvbUJpdHModmFsdWUsIHZhbHVlIDwgMCA/IC0xIDogMCwgZmFsc2UpO1xuICAgICAgaWYgKGNhY2hlKSBJTlRfQ0FDSEVbdmFsdWVdID0gb2JqO1xuICAgICAgcmV0dXJuIG9iajtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqIFJldHVybnMgYSBMb25nIHJlcHJlc2VudGluZyB0aGUgZ2l2ZW4gMzIgYml0IGludGVnZXIgdmFsdWUuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0ge251bWJlcn0gdmFsdWUgVGhlIDMyIGJpdCBpbnRlZ2VyIGluIHF1ZXN0aW9uXG4gICAqIEBwYXJhbSB7Ym9vbGVhbj19IHVuc2lnbmVkIFdoZXRoZXIgdW5zaWduZWQgb3Igbm90LCBkZWZhdWx0cyB0byBzaWduZWRcbiAgICogQHJldHVybnMgeyFMb25nfSBUaGUgY29ycmVzcG9uZGluZyBMb25nIHZhbHVlXG4gICAqL1xuICBcbiAgXG4gIExvbmcuZnJvbUludCA9IGZyb21JbnQ7XG4gIC8qKlxuICAgKiBAcGFyYW0ge251bWJlcn0gdmFsdWVcbiAgICogQHBhcmFtIHtib29sZWFuPX0gdW5zaWduZWRcbiAgICogQHJldHVybnMgeyFMb25nfVxuICAgKiBAaW5uZXJcbiAgICovXG4gIFxuICBmdW5jdGlvbiBmcm9tTnVtYmVyKHZhbHVlLCB1bnNpZ25lZCkge1xuICAgIGlmIChpc05hTih2YWx1ZSkpIHJldHVybiB1bnNpZ25lZCA/IFVaRVJPIDogWkVSTztcbiAgXG4gICAgaWYgKHVuc2lnbmVkKSB7XG4gICAgICBpZiAodmFsdWUgPCAwKSByZXR1cm4gVVpFUk87XG4gICAgICBpZiAodmFsdWUgPj0gVFdPX1BXUl82NF9EQkwpIHJldHVybiBNQVhfVU5TSUdORURfVkFMVUU7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh2YWx1ZSA8PSAtVFdPX1BXUl82M19EQkwpIHJldHVybiBNSU5fVkFMVUU7XG4gICAgICBpZiAodmFsdWUgKyAxID49IFRXT19QV1JfNjNfREJMKSByZXR1cm4gTUFYX1ZBTFVFO1xuICAgIH1cbiAgXG4gICAgaWYgKHZhbHVlIDwgMCkgcmV0dXJuIGZyb21OdW1iZXIoLXZhbHVlLCB1bnNpZ25lZCkubmVnKCk7XG4gICAgcmV0dXJuIGZyb21CaXRzKHZhbHVlICUgVFdPX1BXUl8zMl9EQkwgfCAwLCB2YWx1ZSAvIFRXT19QV1JfMzJfREJMIHwgMCwgdW5zaWduZWQpO1xuICB9XG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgTG9uZyByZXByZXNlbnRpbmcgdGhlIGdpdmVuIHZhbHVlLCBwcm92aWRlZCB0aGF0IGl0IGlzIGEgZmluaXRlIG51bWJlci4gT3RoZXJ3aXNlLCB6ZXJvIGlzIHJldHVybmVkLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHtudW1iZXJ9IHZhbHVlIFRoZSBudW1iZXIgaW4gcXVlc3Rpb25cbiAgICogQHBhcmFtIHtib29sZWFuPX0gdW5zaWduZWQgV2hldGhlciB1bnNpZ25lZCBvciBub3QsIGRlZmF1bHRzIHRvIHNpZ25lZFxuICAgKiBAcmV0dXJucyB7IUxvbmd9IFRoZSBjb3JyZXNwb25kaW5nIExvbmcgdmFsdWVcbiAgICovXG4gIFxuICBcbiAgTG9uZy5mcm9tTnVtYmVyID0gZnJvbU51bWJlcjtcbiAgLyoqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBsb3dCaXRzXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBoaWdoQml0c1xuICAgKiBAcGFyYW0ge2Jvb2xlYW49fSB1bnNpZ25lZFxuICAgKiBAcmV0dXJucyB7IUxvbmd9XG4gICAqIEBpbm5lclxuICAgKi9cbiAgXG4gIGZ1bmN0aW9uIGZyb21CaXRzKGxvd0JpdHMsIGhpZ2hCaXRzLCB1bnNpZ25lZCkge1xuICAgIHJldHVybiBuZXcgTG9uZyhsb3dCaXRzLCBoaWdoQml0cywgdW5zaWduZWQpO1xuICB9XG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgTG9uZyByZXByZXNlbnRpbmcgdGhlIDY0IGJpdCBpbnRlZ2VyIHRoYXQgY29tZXMgYnkgY29uY2F0ZW5hdGluZyB0aGUgZ2l2ZW4gbG93IGFuZCBoaWdoIGJpdHMuIEVhY2ggaXNcbiAgICogIGFzc3VtZWQgdG8gdXNlIDMyIGJpdHMuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0ge251bWJlcn0gbG93Qml0cyBUaGUgbG93IDMyIGJpdHNcbiAgICogQHBhcmFtIHtudW1iZXJ9IGhpZ2hCaXRzIFRoZSBoaWdoIDMyIGJpdHNcbiAgICogQHBhcmFtIHtib29sZWFuPX0gdW5zaWduZWQgV2hldGhlciB1bnNpZ25lZCBvciBub3QsIGRlZmF1bHRzIHRvIHNpZ25lZFxuICAgKiBAcmV0dXJucyB7IUxvbmd9IFRoZSBjb3JyZXNwb25kaW5nIExvbmcgdmFsdWVcbiAgICovXG4gIFxuICBcbiAgTG9uZy5mcm9tQml0cyA9IGZyb21CaXRzO1xuICAvKipcbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBiYXNlXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBleHBvbmVudFxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgKiBAaW5uZXJcbiAgICovXG4gIFxuICB2YXIgcG93X2RibCA9IE1hdGgucG93OyAvLyBVc2VkIDQgdGltZXMgKDQqOCB0byAxNSs0KVxuICBcbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzdHJcbiAgICogQHBhcmFtIHsoYm9vbGVhbnxudW1iZXIpPX0gdW5zaWduZWRcbiAgICogQHBhcmFtIHtudW1iZXI9fSByYWRpeFxuICAgKiBAcmV0dXJucyB7IUxvbmd9XG4gICAqIEBpbm5lclxuICAgKi9cbiAgXG4gIGZ1bmN0aW9uIGZyb21TdHJpbmcoc3RyLCB1bnNpZ25lZCwgcmFkaXgpIHtcbiAgICBpZiAoc3RyLmxlbmd0aCA9PT0gMCkgdGhyb3cgRXJyb3IoJ2VtcHR5IHN0cmluZycpO1xuICBcbiAgICBpZiAodHlwZW9mIHVuc2lnbmVkID09PSAnbnVtYmVyJykge1xuICAgICAgLy8gRm9yIGdvb2cubWF0aC5sb25nIGNvbXBhdGliaWxpdHlcbiAgICAgIHJhZGl4ID0gdW5zaWduZWQ7XG4gICAgICB1bnNpZ25lZCA9IGZhbHNlO1xuICAgIH0gZWxzZSB7XG4gICAgICB1bnNpZ25lZCA9ICEhdW5zaWduZWQ7XG4gICAgfVxuICBcbiAgICBpZiAoc3RyID09PSBcIk5hTlwiIHx8IHN0ciA9PT0gXCJJbmZpbml0eVwiIHx8IHN0ciA9PT0gXCIrSW5maW5pdHlcIiB8fCBzdHIgPT09IFwiLUluZmluaXR5XCIpIHJldHVybiB1bnNpZ25lZCA/IFVaRVJPIDogWkVSTztcbiAgICByYWRpeCA9IHJhZGl4IHx8IDEwO1xuICAgIGlmIChyYWRpeCA8IDIgfHwgMzYgPCByYWRpeCkgdGhyb3cgUmFuZ2VFcnJvcigncmFkaXgnKTtcbiAgICB2YXIgcDtcbiAgICBpZiAoKHAgPSBzdHIuaW5kZXhPZignLScpKSA+IDApIHRocm93IEVycm9yKCdpbnRlcmlvciBoeXBoZW4nKTtlbHNlIGlmIChwID09PSAwKSB7XG4gICAgICByZXR1cm4gZnJvbVN0cmluZyhzdHIuc3Vic3RyaW5nKDEpLCB1bnNpZ25lZCwgcmFkaXgpLm5lZygpO1xuICAgIH0gLy8gRG8gc2V2ZXJhbCAoOCkgZGlnaXRzIGVhY2ggdGltZSB0aHJvdWdoIHRoZSBsb29wLCBzbyBhcyB0b1xuICAgIC8vIG1pbmltaXplIHRoZSBjYWxscyB0byB0aGUgdmVyeSBleHBlbnNpdmUgZW11bGF0ZWQgZGl2LlxuICBcbiAgICB2YXIgcmFkaXhUb1Bvd2VyID0gZnJvbU51bWJlcihwb3dfZGJsKHJhZGl4LCA4KSk7XG4gICAgdmFyIHJlc3VsdCA9IFpFUk87XG4gIFxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSArPSA4KSB7XG4gICAgICB2YXIgc2l6ZSA9IE1hdGgubWluKDgsIHN0ci5sZW5ndGggLSBpKSxcbiAgICAgICAgICB2YWx1ZSA9IHBhcnNlSW50KHN0ci5zdWJzdHJpbmcoaSwgaSArIHNpemUpLCByYWRpeCk7XG4gIFxuICAgICAgaWYgKHNpemUgPCA4KSB7XG4gICAgICAgIHZhciBwb3dlciA9IGZyb21OdW1iZXIocG93X2RibChyYWRpeCwgc2l6ZSkpO1xuICAgICAgICByZXN1bHQgPSByZXN1bHQubXVsKHBvd2VyKS5hZGQoZnJvbU51bWJlcih2YWx1ZSkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzdWx0ID0gcmVzdWx0Lm11bChyYWRpeFRvUG93ZXIpO1xuICAgICAgICByZXN1bHQgPSByZXN1bHQuYWRkKGZyb21OdW1iZXIodmFsdWUpKTtcbiAgICAgIH1cbiAgICB9XG4gIFxuICAgIHJlc3VsdC51bnNpZ25lZCA9IHVuc2lnbmVkO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbiAgLyoqXG4gICAqIFJldHVybnMgYSBMb25nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBnaXZlbiBzdHJpbmcsIHdyaXR0ZW4gdXNpbmcgdGhlIHNwZWNpZmllZCByYWRpeC5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzdHIgVGhlIHRleHR1YWwgcmVwcmVzZW50YXRpb24gb2YgdGhlIExvbmdcbiAgICogQHBhcmFtIHsoYm9vbGVhbnxudW1iZXIpPX0gdW5zaWduZWQgV2hldGhlciB1bnNpZ25lZCBvciBub3QsIGRlZmF1bHRzIHRvIHNpZ25lZFxuICAgKiBAcGFyYW0ge251bWJlcj19IHJhZGl4IFRoZSByYWRpeCBpbiB3aGljaCB0aGUgdGV4dCBpcyB3cml0dGVuICgyLTM2KSwgZGVmYXVsdHMgdG8gMTBcbiAgICogQHJldHVybnMgeyFMb25nfSBUaGUgY29ycmVzcG9uZGluZyBMb25nIHZhbHVlXG4gICAqL1xuICBcbiAgXG4gIExvbmcuZnJvbVN0cmluZyA9IGZyb21TdHJpbmc7XG4gIC8qKlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfCF7bG93OiBudW1iZXIsIGhpZ2g6IG51bWJlciwgdW5zaWduZWQ6IGJvb2xlYW59fSB2YWxcbiAgICogQHBhcmFtIHtib29sZWFuPX0gdW5zaWduZWRcbiAgICogQHJldHVybnMgeyFMb25nfVxuICAgKiBAaW5uZXJcbiAgICovXG4gIFxuICBmdW5jdGlvbiBmcm9tVmFsdWUodmFsLCB1bnNpZ25lZCkge1xuICAgIGlmICh0eXBlb2YgdmFsID09PSAnbnVtYmVyJykgcmV0dXJuIGZyb21OdW1iZXIodmFsLCB1bnNpZ25lZCk7XG4gICAgaWYgKHR5cGVvZiB2YWwgPT09ICdzdHJpbmcnKSByZXR1cm4gZnJvbVN0cmluZyh2YWwsIHVuc2lnbmVkKTsgLy8gVGhyb3dzIGZvciBub24tb2JqZWN0cywgY29udmVydHMgbm9uLWluc3RhbmNlb2YgTG9uZzpcbiAgXG4gICAgcmV0dXJuIGZyb21CaXRzKHZhbC5sb3csIHZhbC5oaWdoLCB0eXBlb2YgdW5zaWduZWQgPT09ICdib29sZWFuJyA/IHVuc2lnbmVkIDogdmFsLnVuc2lnbmVkKTtcbiAgfVxuICAvKipcbiAgICogQ29udmVydHMgdGhlIHNwZWNpZmllZCB2YWx1ZSB0byBhIExvbmcgdXNpbmcgdGhlIGFwcHJvcHJpYXRlIGZyb20qIGZ1bmN0aW9uIGZvciBpdHMgdHlwZS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ3whe2xvdzogbnVtYmVyLCBoaWdoOiBudW1iZXIsIHVuc2lnbmVkOiBib29sZWFufX0gdmFsIFZhbHVlXG4gICAqIEBwYXJhbSB7Ym9vbGVhbj19IHVuc2lnbmVkIFdoZXRoZXIgdW5zaWduZWQgb3Igbm90LCBkZWZhdWx0cyB0byBzaWduZWRcbiAgICogQHJldHVybnMgeyFMb25nfVxuICAgKi9cbiAgXG4gIFxuICBMb25nLmZyb21WYWx1ZSA9IGZyb21WYWx1ZTsgLy8gTk9URTogdGhlIGNvbXBpbGVyIHNob3VsZCBpbmxpbmUgdGhlc2UgY29uc3RhbnQgdmFsdWVzIGJlbG93IGFuZCB0aGVuIHJlbW92ZSB0aGVzZSB2YXJpYWJsZXMsIHNvIHRoZXJlIHNob3VsZCBiZVxuICAvLyBubyBydW50aW1lIHBlbmFsdHkgZm9yIHRoZXNlLlxuICBcbiAgLyoqXG4gICAqIEB0eXBlIHtudW1iZXJ9XG4gICAqIEBjb25zdFxuICAgKiBAaW5uZXJcbiAgICovXG4gIFxuICB2YXIgVFdPX1BXUl8xNl9EQkwgPSAxIDw8IDE2O1xuICAvKipcbiAgICogQHR5cGUge251bWJlcn1cbiAgICogQGNvbnN0XG4gICAqIEBpbm5lclxuICAgKi9cbiAgXG4gIHZhciBUV09fUFdSXzI0X0RCTCA9IDEgPDwgMjQ7XG4gIC8qKlxuICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgKiBAY29uc3RcbiAgICogQGlubmVyXG4gICAqL1xuICBcbiAgdmFyIFRXT19QV1JfMzJfREJMID0gVFdPX1BXUl8xNl9EQkwgKiBUV09fUFdSXzE2X0RCTDtcbiAgLyoqXG4gICAqIEB0eXBlIHtudW1iZXJ9XG4gICAqIEBjb25zdFxuICAgKiBAaW5uZXJcbiAgICovXG4gIFxuICB2YXIgVFdPX1BXUl82NF9EQkwgPSBUV09fUFdSXzMyX0RCTCAqIFRXT19QV1JfMzJfREJMO1xuICAvKipcbiAgICogQHR5cGUge251bWJlcn1cbiAgICogQGNvbnN0XG4gICAqIEBpbm5lclxuICAgKi9cbiAgXG4gIHZhciBUV09fUFdSXzYzX0RCTCA9IFRXT19QV1JfNjRfREJMIC8gMjtcbiAgLyoqXG4gICAqIEB0eXBlIHshTG9uZ31cbiAgICogQGNvbnN0XG4gICAqIEBpbm5lclxuICAgKi9cbiAgXG4gIHZhciBUV09fUFdSXzI0ID0gZnJvbUludChUV09fUFdSXzI0X0RCTCk7XG4gIC8qKlxuICAgKiBAdHlwZSB7IUxvbmd9XG4gICAqIEBpbm5lclxuICAgKi9cbiAgXG4gIHZhciBaRVJPID0gZnJvbUludCgwKTtcbiAgLyoqXG4gICAqIFNpZ25lZCB6ZXJvLlxuICAgKiBAdHlwZSB7IUxvbmd9XG4gICAqL1xuICBcbiAgTG9uZy5aRVJPID0gWkVSTztcbiAgLyoqXG4gICAqIEB0eXBlIHshTG9uZ31cbiAgICogQGlubmVyXG4gICAqL1xuICBcbiAgdmFyIFVaRVJPID0gZnJvbUludCgwLCB0cnVlKTtcbiAgLyoqXG4gICAqIFVuc2lnbmVkIHplcm8uXG4gICAqIEB0eXBlIHshTG9uZ31cbiAgICovXG4gIFxuICBMb25nLlVaRVJPID0gVVpFUk87XG4gIC8qKlxuICAgKiBAdHlwZSB7IUxvbmd9XG4gICAqIEBpbm5lclxuICAgKi9cbiAgXG4gIHZhciBPTkUgPSBmcm9tSW50KDEpO1xuICAvKipcbiAgICogU2lnbmVkIG9uZS5cbiAgICogQHR5cGUgeyFMb25nfVxuICAgKi9cbiAgXG4gIExvbmcuT05FID0gT05FO1xuICAvKipcbiAgICogQHR5cGUgeyFMb25nfVxuICAgKiBAaW5uZXJcbiAgICovXG4gIFxuICB2YXIgVU9ORSA9IGZyb21JbnQoMSwgdHJ1ZSk7XG4gIC8qKlxuICAgKiBVbnNpZ25lZCBvbmUuXG4gICAqIEB0eXBlIHshTG9uZ31cbiAgICovXG4gIFxuICBMb25nLlVPTkUgPSBVT05FO1xuICAvKipcbiAgICogQHR5cGUgeyFMb25nfVxuICAgKiBAaW5uZXJcbiAgICovXG4gIFxuICB2YXIgTkVHX09ORSA9IGZyb21JbnQoLTEpO1xuICAvKipcbiAgICogU2lnbmVkIG5lZ2F0aXZlIG9uZS5cbiAgICogQHR5cGUgeyFMb25nfVxuICAgKi9cbiAgXG4gIExvbmcuTkVHX09ORSA9IE5FR19PTkU7XG4gIC8qKlxuICAgKiBAdHlwZSB7IUxvbmd9XG4gICAqIEBpbm5lclxuICAgKi9cbiAgXG4gIHZhciBNQVhfVkFMVUUgPSBmcm9tQml0cygweEZGRkZGRkZGIHwgMCwgMHg3RkZGRkZGRiB8IDAsIGZhbHNlKTtcbiAgLyoqXG4gICAqIE1heGltdW0gc2lnbmVkIHZhbHVlLlxuICAgKiBAdHlwZSB7IUxvbmd9XG4gICAqL1xuICBcbiAgTG9uZy5NQVhfVkFMVUUgPSBNQVhfVkFMVUU7XG4gIC8qKlxuICAgKiBAdHlwZSB7IUxvbmd9XG4gICAqIEBpbm5lclxuICAgKi9cbiAgXG4gIHZhciBNQVhfVU5TSUdORURfVkFMVUUgPSBmcm9tQml0cygweEZGRkZGRkZGIHwgMCwgMHhGRkZGRkZGRiB8IDAsIHRydWUpO1xuICAvKipcbiAgICogTWF4aW11bSB1bnNpZ25lZCB2YWx1ZS5cbiAgICogQHR5cGUgeyFMb25nfVxuICAgKi9cbiAgXG4gIExvbmcuTUFYX1VOU0lHTkVEX1ZBTFVFID0gTUFYX1VOU0lHTkVEX1ZBTFVFO1xuICAvKipcbiAgICogQHR5cGUgeyFMb25nfVxuICAgKiBAaW5uZXJcbiAgICovXG4gIFxuICB2YXIgTUlOX1ZBTFVFID0gZnJvbUJpdHMoMCwgMHg4MDAwMDAwMCB8IDAsIGZhbHNlKTtcbiAgLyoqXG4gICAqIE1pbmltdW0gc2lnbmVkIHZhbHVlLlxuICAgKiBAdHlwZSB7IUxvbmd9XG4gICAqL1xuICBcbiAgTG9uZy5NSU5fVkFMVUUgPSBNSU5fVkFMVUU7XG4gIC8qKlxuICAgKiBAYWxpYXMgTG9uZy5wcm90b3R5cGVcbiAgICogQGlubmVyXG4gICAqL1xuICBcbiAgdmFyIExvbmdQcm90b3R5cGUgPSBMb25nLnByb3RvdHlwZTtcbiAgLyoqXG4gICAqIENvbnZlcnRzIHRoZSBMb25nIHRvIGEgMzIgYml0IGludGVnZXIsIGFzc3VtaW5nIGl0IGlzIGEgMzIgYml0IGludGVnZXIuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHJldHVybnMge251bWJlcn1cbiAgICovXG4gIFxuICBMb25nUHJvdG90eXBlLnRvSW50ID0gZnVuY3Rpb24gdG9JbnQoKSB7XG4gICAgcmV0dXJuIHRoaXMudW5zaWduZWQgPyB0aGlzLmxvdyA+Pj4gMCA6IHRoaXMubG93O1xuICB9O1xuICAvKipcbiAgICogQ29udmVydHMgdGhlIExvbmcgdG8gYSB0aGUgbmVhcmVzdCBmbG9hdGluZy1wb2ludCByZXByZXNlbnRhdGlvbiBvZiB0aGlzIHZhbHVlIChkb3VibGUsIDUzIGJpdCBtYW50aXNzYSkuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHJldHVybnMge251bWJlcn1cbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS50b051bWJlciA9IGZ1bmN0aW9uIHRvTnVtYmVyKCkge1xuICAgIGlmICh0aGlzLnVuc2lnbmVkKSByZXR1cm4gKHRoaXMuaGlnaCA+Pj4gMCkgKiBUV09fUFdSXzMyX0RCTCArICh0aGlzLmxvdyA+Pj4gMCk7XG4gICAgcmV0dXJuIHRoaXMuaGlnaCAqIFRXT19QV1JfMzJfREJMICsgKHRoaXMubG93ID4+PiAwKTtcbiAgfTtcbiAgLyoqXG4gICAqIENvbnZlcnRzIHRoZSBMb25nIHRvIGEgc3RyaW5nIHdyaXR0ZW4gaW4gdGhlIHNwZWNpZmllZCByYWRpeC5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcGFyYW0ge251bWJlcj19IHJhZGl4IFJhZGl4ICgyLTM2KSwgZGVmYXVsdHMgdG8gMTBcbiAgICogQHJldHVybnMge3N0cmluZ31cbiAgICogQG92ZXJyaWRlXG4gICAqIEB0aHJvd3Mge1JhbmdlRXJyb3J9IElmIGByYWRpeGAgaXMgb3V0IG9mIHJhbmdlXG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZyhyYWRpeCkge1xuICAgIHJhZGl4ID0gcmFkaXggfHwgMTA7XG4gICAgaWYgKHJhZGl4IDwgMiB8fCAzNiA8IHJhZGl4KSB0aHJvdyBSYW5nZUVycm9yKCdyYWRpeCcpO1xuICAgIGlmICh0aGlzLmlzWmVybygpKSByZXR1cm4gJzAnO1xuICBcbiAgICBpZiAodGhpcy5pc05lZ2F0aXZlKCkpIHtcbiAgICAgIC8vIFVuc2lnbmVkIExvbmdzIGFyZSBuZXZlciBuZWdhdGl2ZVxuICAgICAgaWYgKHRoaXMuZXEoTUlOX1ZBTFVFKSkge1xuICAgICAgICAvLyBXZSBuZWVkIHRvIGNoYW5nZSB0aGUgTG9uZyB2YWx1ZSBiZWZvcmUgaXQgY2FuIGJlIG5lZ2F0ZWQsIHNvIHdlIHJlbW92ZVxuICAgICAgICAvLyB0aGUgYm90dG9tLW1vc3QgZGlnaXQgaW4gdGhpcyBiYXNlIGFuZCB0aGVuIHJlY3Vyc2UgdG8gZG8gdGhlIHJlc3QuXG4gICAgICAgIHZhciByYWRpeExvbmcgPSBmcm9tTnVtYmVyKHJhZGl4KSxcbiAgICAgICAgICAgIGRpdiA9IHRoaXMuZGl2KHJhZGl4TG9uZyksXG4gICAgICAgICAgICByZW0xID0gZGl2Lm11bChyYWRpeExvbmcpLnN1Yih0aGlzKTtcbiAgICAgICAgcmV0dXJuIGRpdi50b1N0cmluZyhyYWRpeCkgKyByZW0xLnRvSW50KCkudG9TdHJpbmcocmFkaXgpO1xuICAgICAgfSBlbHNlIHJldHVybiAnLScgKyB0aGlzLm5lZygpLnRvU3RyaW5nKHJhZGl4KTtcbiAgICB9IC8vIERvIHNldmVyYWwgKDYpIGRpZ2l0cyBlYWNoIHRpbWUgdGhyb3VnaCB0aGUgbG9vcCwgc28gYXMgdG9cbiAgICAvLyBtaW5pbWl6ZSB0aGUgY2FsbHMgdG8gdGhlIHZlcnkgZXhwZW5zaXZlIGVtdWxhdGVkIGRpdi5cbiAgXG4gIFxuICAgIHZhciByYWRpeFRvUG93ZXIgPSBmcm9tTnVtYmVyKHBvd19kYmwocmFkaXgsIDYpLCB0aGlzLnVuc2lnbmVkKSxcbiAgICAgICAgcmVtID0gdGhpcztcbiAgICB2YXIgcmVzdWx0ID0gJyc7XG4gIFxuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICB2YXIgcmVtRGl2ID0gcmVtLmRpdihyYWRpeFRvUG93ZXIpLFxuICAgICAgICAgIGludHZhbCA9IHJlbS5zdWIocmVtRGl2Lm11bChyYWRpeFRvUG93ZXIpKS50b0ludCgpID4+PiAwLFxuICAgICAgICAgIGRpZ2l0cyA9IGludHZhbC50b1N0cmluZyhyYWRpeCk7XG4gICAgICByZW0gPSByZW1EaXY7XG4gICAgICBpZiAocmVtLmlzWmVybygpKSByZXR1cm4gZGlnaXRzICsgcmVzdWx0O2Vsc2Uge1xuICAgICAgICB3aGlsZSAoZGlnaXRzLmxlbmd0aCA8IDYpIGRpZ2l0cyA9ICcwJyArIGRpZ2l0cztcbiAgXG4gICAgICAgIHJlc3VsdCA9ICcnICsgZGlnaXRzICsgcmVzdWx0O1xuICAgICAgfVxuICAgIH1cbiAgfTtcbiAgLyoqXG4gICAqIEdldHMgdGhlIGhpZ2ggMzIgYml0cyBhcyBhIHNpZ25lZCBpbnRlZ2VyLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEByZXR1cm5zIHtudW1iZXJ9IFNpZ25lZCBoaWdoIGJpdHNcbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5nZXRIaWdoQml0cyA9IGZ1bmN0aW9uIGdldEhpZ2hCaXRzKCkge1xuICAgIHJldHVybiB0aGlzLmhpZ2g7XG4gIH07XG4gIC8qKlxuICAgKiBHZXRzIHRoZSBoaWdoIDMyIGJpdHMgYXMgYW4gdW5zaWduZWQgaW50ZWdlci5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcmV0dXJucyB7bnVtYmVyfSBVbnNpZ25lZCBoaWdoIGJpdHNcbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5nZXRIaWdoQml0c1Vuc2lnbmVkID0gZnVuY3Rpb24gZ2V0SGlnaEJpdHNVbnNpZ25lZCgpIHtcbiAgICByZXR1cm4gdGhpcy5oaWdoID4+PiAwO1xuICB9O1xuICAvKipcbiAgICogR2V0cyB0aGUgbG93IDMyIGJpdHMgYXMgYSBzaWduZWQgaW50ZWdlci5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcmV0dXJucyB7bnVtYmVyfSBTaWduZWQgbG93IGJpdHNcbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5nZXRMb3dCaXRzID0gZnVuY3Rpb24gZ2V0TG93Qml0cygpIHtcbiAgICByZXR1cm4gdGhpcy5sb3c7XG4gIH07XG4gIC8qKlxuICAgKiBHZXRzIHRoZSBsb3cgMzIgYml0cyBhcyBhbiB1bnNpZ25lZCBpbnRlZ2VyLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEByZXR1cm5zIHtudW1iZXJ9IFVuc2lnbmVkIGxvdyBiaXRzXG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUuZ2V0TG93Qml0c1Vuc2lnbmVkID0gZnVuY3Rpb24gZ2V0TG93Qml0c1Vuc2lnbmVkKCkge1xuICAgIHJldHVybiB0aGlzLmxvdyA+Pj4gMDtcbiAgfTtcbiAgLyoqXG4gICAqIEdldHMgdGhlIG51bWJlciBvZiBiaXRzIG5lZWRlZCB0byByZXByZXNlbnQgdGhlIGFic29sdXRlIHZhbHVlIG9mIHRoaXMgTG9uZy5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLmdldE51bUJpdHNBYnMgPSBmdW5jdGlvbiBnZXROdW1CaXRzQWJzKCkge1xuICAgIGlmICh0aGlzLmlzTmVnYXRpdmUoKSkgLy8gVW5zaWduZWQgTG9uZ3MgYXJlIG5ldmVyIG5lZ2F0aXZlXG4gICAgICByZXR1cm4gdGhpcy5lcShNSU5fVkFMVUUpID8gNjQgOiB0aGlzLm5lZygpLmdldE51bUJpdHNBYnMoKTtcbiAgICB2YXIgdmFsID0gdGhpcy5oaWdoICE9IDAgPyB0aGlzLmhpZ2ggOiB0aGlzLmxvdztcbiAgXG4gICAgZm9yICh2YXIgYml0ID0gMzE7IGJpdCA+IDA7IGJpdC0tKSBpZiAoKHZhbCAmIDEgPDwgYml0KSAhPSAwKSBicmVhaztcbiAgXG4gICAgcmV0dXJuIHRoaXMuaGlnaCAhPSAwID8gYml0ICsgMzMgOiBiaXQgKyAxO1xuICB9O1xuICAvKipcbiAgICogVGVzdHMgaWYgdGhpcyBMb25nJ3MgdmFsdWUgZXF1YWxzIHplcm8uXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUuaXNaZXJvID0gZnVuY3Rpb24gaXNaZXJvKCkge1xuICAgIHJldHVybiB0aGlzLmhpZ2ggPT09IDAgJiYgdGhpcy5sb3cgPT09IDA7XG4gIH07XG4gIC8qKlxuICAgKiBUZXN0cyBpZiB0aGlzIExvbmcncyB2YWx1ZSBlcXVhbHMgemVyby4gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgTG9uZyNpc1plcm99LlxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5lcXogPSBMb25nUHJvdG90eXBlLmlzWmVybztcbiAgLyoqXG4gICAqIFRlc3RzIGlmIHRoaXMgTG9uZydzIHZhbHVlIGlzIG5lZ2F0aXZlLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgXG4gIExvbmdQcm90b3R5cGUuaXNOZWdhdGl2ZSA9IGZ1bmN0aW9uIGlzTmVnYXRpdmUoKSB7XG4gICAgcmV0dXJuICF0aGlzLnVuc2lnbmVkICYmIHRoaXMuaGlnaCA8IDA7XG4gIH07XG4gIC8qKlxuICAgKiBUZXN0cyBpZiB0aGlzIExvbmcncyB2YWx1ZSBpcyBwb3NpdGl2ZSBvciB6ZXJvLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLmlzUG9zaXRpdmUgPSBmdW5jdGlvbiBpc1Bvc2l0aXZlKCkge1xuICAgIHJldHVybiB0aGlzLnVuc2lnbmVkIHx8IHRoaXMuaGlnaCA+PSAwO1xuICB9O1xuICAvKipcbiAgICogVGVzdHMgaWYgdGhpcyBMb25nJ3MgdmFsdWUgaXMgb2RkLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLmlzT2RkID0gZnVuY3Rpb24gaXNPZGQoKSB7XG4gICAgcmV0dXJuICh0aGlzLmxvdyAmIDEpID09PSAxO1xuICB9O1xuICAvKipcbiAgICogVGVzdHMgaWYgdGhpcyBMb25nJ3MgdmFsdWUgaXMgZXZlbi5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5pc0V2ZW4gPSBmdW5jdGlvbiBpc0V2ZW4oKSB7XG4gICAgcmV0dXJuICh0aGlzLmxvdyAmIDEpID09PSAwO1xuICB9O1xuICAvKipcbiAgICogVGVzdHMgaWYgdGhpcyBMb25nJ3MgdmFsdWUgZXF1YWxzIHRoZSBzcGVjaWZpZWQncy5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxzdHJpbmd9IG90aGVyIE90aGVyIHZhbHVlXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLmVxdWFscyA9IGZ1bmN0aW9uIGVxdWFscyhvdGhlcikge1xuICAgIGlmICghaXNMb25nKG90aGVyKSkgb3RoZXIgPSBmcm9tVmFsdWUob3RoZXIpO1xuICAgIGlmICh0aGlzLnVuc2lnbmVkICE9PSBvdGhlci51bnNpZ25lZCAmJiB0aGlzLmhpZ2ggPj4+IDMxID09PSAxICYmIG90aGVyLmhpZ2ggPj4+IDMxID09PSAxKSByZXR1cm4gZmFsc2U7XG4gICAgcmV0dXJuIHRoaXMuaGlnaCA9PT0gb3RoZXIuaGlnaCAmJiB0aGlzLmxvdyA9PT0gb3RoZXIubG93O1xuICB9O1xuICAvKipcbiAgICogVGVzdHMgaWYgdGhpcyBMb25nJ3MgdmFsdWUgZXF1YWxzIHRoZSBzcGVjaWZpZWQncy4gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgTG9uZyNlcXVhbHN9LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfSBvdGhlciBPdGhlciB2YWx1ZVxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5lcSA9IExvbmdQcm90b3R5cGUuZXF1YWxzO1xuICAvKipcbiAgICogVGVzdHMgaWYgdGhpcyBMb25nJ3MgdmFsdWUgZGlmZmVycyBmcm9tIHRoZSBzcGVjaWZpZWQncy5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxzdHJpbmd9IG90aGVyIE90aGVyIHZhbHVlXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgXG4gIExvbmdQcm90b3R5cGUubm90RXF1YWxzID0gZnVuY3Rpb24gbm90RXF1YWxzKG90aGVyKSB7XG4gICAgcmV0dXJuICF0aGlzLmVxKFxuICAgIC8qIHZhbGlkYXRlcyAqL1xuICAgIG90aGVyKTtcbiAgfTtcbiAgLyoqXG4gICAqIFRlc3RzIGlmIHRoaXMgTG9uZydzIHZhbHVlIGRpZmZlcnMgZnJvbSB0aGUgc3BlY2lmaWVkJ3MuIFRoaXMgaXMgYW4gYWxpYXMgb2Yge0BsaW5rIExvbmcjbm90RXF1YWxzfS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ30gb3RoZXIgT3RoZXIgdmFsdWVcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUubmVxID0gTG9uZ1Byb3RvdHlwZS5ub3RFcXVhbHM7XG4gIC8qKlxuICAgKiBUZXN0cyBpZiB0aGlzIExvbmcncyB2YWx1ZSBkaWZmZXJzIGZyb20gdGhlIHNwZWNpZmllZCdzLiBUaGlzIGlzIGFuIGFsaWFzIG9mIHtAbGluayBMb25nI25vdEVxdWFsc30uXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxzdHJpbmd9IG90aGVyIE90aGVyIHZhbHVlXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgXG4gIExvbmdQcm90b3R5cGUubmUgPSBMb25nUHJvdG90eXBlLm5vdEVxdWFscztcbiAgLyoqXG4gICAqIFRlc3RzIGlmIHRoaXMgTG9uZydzIHZhbHVlIGlzIGxlc3MgdGhhbiB0aGUgc3BlY2lmaWVkJ3MuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfSBvdGhlciBPdGhlciB2YWx1ZVxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIFxuICBMb25nUHJvdG90eXBlLmxlc3NUaGFuID0gZnVuY3Rpb24gbGVzc1RoYW4ob3RoZXIpIHtcbiAgICByZXR1cm4gdGhpcy5jb21wKFxuICAgIC8qIHZhbGlkYXRlcyAqL1xuICAgIG90aGVyKSA8IDA7XG4gIH07XG4gIC8qKlxuICAgKiBUZXN0cyBpZiB0aGlzIExvbmcncyB2YWx1ZSBpcyBsZXNzIHRoYW4gdGhlIHNwZWNpZmllZCdzLiBUaGlzIGlzIGFuIGFsaWFzIG9mIHtAbGluayBMb25nI2xlc3NUaGFufS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ30gb3RoZXIgT3RoZXIgdmFsdWVcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUubHQgPSBMb25nUHJvdG90eXBlLmxlc3NUaGFuO1xuICAvKipcbiAgICogVGVzdHMgaWYgdGhpcyBMb25nJ3MgdmFsdWUgaXMgbGVzcyB0aGFuIG9yIGVxdWFsIHRoZSBzcGVjaWZpZWQncy5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxzdHJpbmd9IG90aGVyIE90aGVyIHZhbHVlXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgXG4gIExvbmdQcm90b3R5cGUubGVzc1RoYW5PckVxdWFsID0gZnVuY3Rpb24gbGVzc1RoYW5PckVxdWFsKG90aGVyKSB7XG4gICAgcmV0dXJuIHRoaXMuY29tcChcbiAgICAvKiB2YWxpZGF0ZXMgKi9cbiAgICBvdGhlcikgPD0gMDtcbiAgfTtcbiAgLyoqXG4gICAqIFRlc3RzIGlmIHRoaXMgTG9uZydzIHZhbHVlIGlzIGxlc3MgdGhhbiBvciBlcXVhbCB0aGUgc3BlY2lmaWVkJ3MuIFRoaXMgaXMgYW4gYWxpYXMgb2Yge0BsaW5rIExvbmcjbGVzc1RoYW5PckVxdWFsfS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ30gb3RoZXIgT3RoZXIgdmFsdWVcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUubHRlID0gTG9uZ1Byb3RvdHlwZS5sZXNzVGhhbk9yRXF1YWw7XG4gIC8qKlxuICAgKiBUZXN0cyBpZiB0aGlzIExvbmcncyB2YWx1ZSBpcyBsZXNzIHRoYW4gb3IgZXF1YWwgdGhlIHNwZWNpZmllZCdzLiBUaGlzIGlzIGFuIGFsaWFzIG9mIHtAbGluayBMb25nI2xlc3NUaGFuT3JFcXVhbH0uXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxzdHJpbmd9IG90aGVyIE90aGVyIHZhbHVlXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgXG4gIExvbmdQcm90b3R5cGUubGUgPSBMb25nUHJvdG90eXBlLmxlc3NUaGFuT3JFcXVhbDtcbiAgLyoqXG4gICAqIFRlc3RzIGlmIHRoaXMgTG9uZydzIHZhbHVlIGlzIGdyZWF0ZXIgdGhhbiB0aGUgc3BlY2lmaWVkJ3MuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfSBvdGhlciBPdGhlciB2YWx1ZVxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIFxuICBMb25nUHJvdG90eXBlLmdyZWF0ZXJUaGFuID0gZnVuY3Rpb24gZ3JlYXRlclRoYW4ob3RoZXIpIHtcbiAgICByZXR1cm4gdGhpcy5jb21wKFxuICAgIC8qIHZhbGlkYXRlcyAqL1xuICAgIG90aGVyKSA+IDA7XG4gIH07XG4gIC8qKlxuICAgKiBUZXN0cyBpZiB0aGlzIExvbmcncyB2YWx1ZSBpcyBncmVhdGVyIHRoYW4gdGhlIHNwZWNpZmllZCdzLiBUaGlzIGlzIGFuIGFsaWFzIG9mIHtAbGluayBMb25nI2dyZWF0ZXJUaGFufS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ30gb3RoZXIgT3RoZXIgdmFsdWVcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUuZ3QgPSBMb25nUHJvdG90eXBlLmdyZWF0ZXJUaGFuO1xuICAvKipcbiAgICogVGVzdHMgaWYgdGhpcyBMb25nJ3MgdmFsdWUgaXMgZ3JlYXRlciB0aGFuIG9yIGVxdWFsIHRoZSBzcGVjaWZpZWQncy5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxzdHJpbmd9IG90aGVyIE90aGVyIHZhbHVlXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgXG4gIExvbmdQcm90b3R5cGUuZ3JlYXRlclRoYW5PckVxdWFsID0gZnVuY3Rpb24gZ3JlYXRlclRoYW5PckVxdWFsKG90aGVyKSB7XG4gICAgcmV0dXJuIHRoaXMuY29tcChcbiAgICAvKiB2YWxpZGF0ZXMgKi9cbiAgICBvdGhlcikgPj0gMDtcbiAgfTtcbiAgLyoqXG4gICAqIFRlc3RzIGlmIHRoaXMgTG9uZydzIHZhbHVlIGlzIGdyZWF0ZXIgdGhhbiBvciBlcXVhbCB0aGUgc3BlY2lmaWVkJ3MuIFRoaXMgaXMgYW4gYWxpYXMgb2Yge0BsaW5rIExvbmcjZ3JlYXRlclRoYW5PckVxdWFsfS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ30gb3RoZXIgT3RoZXIgdmFsdWVcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUuZ3RlID0gTG9uZ1Byb3RvdHlwZS5ncmVhdGVyVGhhbk9yRXF1YWw7XG4gIC8qKlxuICAgKiBUZXN0cyBpZiB0aGlzIExvbmcncyB2YWx1ZSBpcyBncmVhdGVyIHRoYW4gb3IgZXF1YWwgdGhlIHNwZWNpZmllZCdzLiBUaGlzIGlzIGFuIGFsaWFzIG9mIHtAbGluayBMb25nI2dyZWF0ZXJUaGFuT3JFcXVhbH0uXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxzdHJpbmd9IG90aGVyIE90aGVyIHZhbHVlXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgXG4gIExvbmdQcm90b3R5cGUuZ2UgPSBMb25nUHJvdG90eXBlLmdyZWF0ZXJUaGFuT3JFcXVhbDtcbiAgLyoqXG4gICAqIENvbXBhcmVzIHRoaXMgTG9uZydzIHZhbHVlIHdpdGggdGhlIHNwZWNpZmllZCdzLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ30gb3RoZXIgT3RoZXIgdmFsdWVcbiAgICogQHJldHVybnMge251bWJlcn0gMCBpZiB0aGV5IGFyZSB0aGUgc2FtZSwgMSBpZiB0aGUgdGhpcyBpcyBncmVhdGVyIGFuZCAtMVxuICAgKiAgaWYgdGhlIGdpdmVuIG9uZSBpcyBncmVhdGVyXG4gICAqL1xuICBcbiAgTG9uZ1Byb3RvdHlwZS5jb21wYXJlID0gZnVuY3Rpb24gY29tcGFyZShvdGhlcikge1xuICAgIGlmICghaXNMb25nKG90aGVyKSkgb3RoZXIgPSBmcm9tVmFsdWUob3RoZXIpO1xuICAgIGlmICh0aGlzLmVxKG90aGVyKSkgcmV0dXJuIDA7XG4gICAgdmFyIHRoaXNOZWcgPSB0aGlzLmlzTmVnYXRpdmUoKSxcbiAgICAgICAgb3RoZXJOZWcgPSBvdGhlci5pc05lZ2F0aXZlKCk7XG4gICAgaWYgKHRoaXNOZWcgJiYgIW90aGVyTmVnKSByZXR1cm4gLTE7XG4gICAgaWYgKCF0aGlzTmVnICYmIG90aGVyTmVnKSByZXR1cm4gMTsgLy8gQXQgdGhpcyBwb2ludCB0aGUgc2lnbiBiaXRzIGFyZSB0aGUgc2FtZVxuICBcbiAgICBpZiAoIXRoaXMudW5zaWduZWQpIHJldHVybiB0aGlzLnN1YihvdGhlcikuaXNOZWdhdGl2ZSgpID8gLTEgOiAxOyAvLyBCb3RoIGFyZSBwb3NpdGl2ZSBpZiBhdCBsZWFzdCBvbmUgaXMgdW5zaWduZWRcbiAgXG4gICAgcmV0dXJuIG90aGVyLmhpZ2ggPj4+IDAgPiB0aGlzLmhpZ2ggPj4+IDAgfHwgb3RoZXIuaGlnaCA9PT0gdGhpcy5oaWdoICYmIG90aGVyLmxvdyA+Pj4gMCA+IHRoaXMubG93ID4+PiAwID8gLTEgOiAxO1xuICB9O1xuICAvKipcbiAgICogQ29tcGFyZXMgdGhpcyBMb25nJ3MgdmFsdWUgd2l0aCB0aGUgc3BlY2lmaWVkJ3MuIFRoaXMgaXMgYW4gYWxpYXMgb2Yge0BsaW5rIExvbmcjY29tcGFyZX0uXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxzdHJpbmd9IG90aGVyIE90aGVyIHZhbHVlXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9IDAgaWYgdGhleSBhcmUgdGhlIHNhbWUsIDEgaWYgdGhlIHRoaXMgaXMgZ3JlYXRlciBhbmQgLTFcbiAgICogIGlmIHRoZSBnaXZlbiBvbmUgaXMgZ3JlYXRlclxuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLmNvbXAgPSBMb25nUHJvdG90eXBlLmNvbXBhcmU7XG4gIC8qKlxuICAgKiBOZWdhdGVzIHRoaXMgTG9uZydzIHZhbHVlLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEByZXR1cm5zIHshTG9uZ30gTmVnYXRlZCBMb25nXG4gICAqL1xuICBcbiAgTG9uZ1Byb3RvdHlwZS5uZWdhdGUgPSBmdW5jdGlvbiBuZWdhdGUoKSB7XG4gICAgaWYgKCF0aGlzLnVuc2lnbmVkICYmIHRoaXMuZXEoTUlOX1ZBTFVFKSkgcmV0dXJuIE1JTl9WQUxVRTtcbiAgICByZXR1cm4gdGhpcy5ub3QoKS5hZGQoT05FKTtcbiAgfTtcbiAgLyoqXG4gICAqIE5lZ2F0ZXMgdGhpcyBMb25nJ3MgdmFsdWUuIFRoaXMgaXMgYW4gYWxpYXMgb2Yge0BsaW5rIExvbmcjbmVnYXRlfS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEByZXR1cm5zIHshTG9uZ30gTmVnYXRlZCBMb25nXG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUubmVnID0gTG9uZ1Byb3RvdHlwZS5uZWdhdGU7XG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBzdW0gb2YgdGhpcyBhbmQgdGhlIHNwZWNpZmllZCBMb25nLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ30gYWRkZW5kIEFkZGVuZFxuICAgKiBAcmV0dXJucyB7IUxvbmd9IFN1bVxuICAgKi9cbiAgXG4gIExvbmdQcm90b3R5cGUuYWRkID0gZnVuY3Rpb24gYWRkKGFkZGVuZCkge1xuICAgIGlmICghaXNMb25nKGFkZGVuZCkpIGFkZGVuZCA9IGZyb21WYWx1ZShhZGRlbmQpOyAvLyBEaXZpZGUgZWFjaCBudW1iZXIgaW50byA0IGNodW5rcyBvZiAxNiBiaXRzLCBhbmQgdGhlbiBzdW0gdGhlIGNodW5rcy5cbiAgXG4gICAgdmFyIGE0OCA9IHRoaXMuaGlnaCA+Pj4gMTY7XG4gICAgdmFyIGEzMiA9IHRoaXMuaGlnaCAmIDB4RkZGRjtcbiAgICB2YXIgYTE2ID0gdGhpcy5sb3cgPj4+IDE2O1xuICAgIHZhciBhMDAgPSB0aGlzLmxvdyAmIDB4RkZGRjtcbiAgICB2YXIgYjQ4ID0gYWRkZW5kLmhpZ2ggPj4+IDE2O1xuICAgIHZhciBiMzIgPSBhZGRlbmQuaGlnaCAmIDB4RkZGRjtcbiAgICB2YXIgYjE2ID0gYWRkZW5kLmxvdyA+Pj4gMTY7XG4gICAgdmFyIGIwMCA9IGFkZGVuZC5sb3cgJiAweEZGRkY7XG4gICAgdmFyIGM0OCA9IDAsXG4gICAgICAgIGMzMiA9IDAsXG4gICAgICAgIGMxNiA9IDAsXG4gICAgICAgIGMwMCA9IDA7XG4gICAgYzAwICs9IGEwMCArIGIwMDtcbiAgICBjMTYgKz0gYzAwID4+PiAxNjtcbiAgICBjMDAgJj0gMHhGRkZGO1xuICAgIGMxNiArPSBhMTYgKyBiMTY7XG4gICAgYzMyICs9IGMxNiA+Pj4gMTY7XG4gICAgYzE2ICY9IDB4RkZGRjtcbiAgICBjMzIgKz0gYTMyICsgYjMyO1xuICAgIGM0OCArPSBjMzIgPj4+IDE2O1xuICAgIGMzMiAmPSAweEZGRkY7XG4gICAgYzQ4ICs9IGE0OCArIGI0ODtcbiAgICBjNDggJj0gMHhGRkZGO1xuICAgIHJldHVybiBmcm9tQml0cyhjMTYgPDwgMTYgfCBjMDAsIGM0OCA8PCAxNiB8IGMzMiwgdGhpcy51bnNpZ25lZCk7XG4gIH07XG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBkaWZmZXJlbmNlIG9mIHRoaXMgYW5kIHRoZSBzcGVjaWZpZWQgTG9uZy5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxzdHJpbmd9IHN1YnRyYWhlbmQgU3VidHJhaGVuZFxuICAgKiBAcmV0dXJucyB7IUxvbmd9IERpZmZlcmVuY2VcbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5zdWJ0cmFjdCA9IGZ1bmN0aW9uIHN1YnRyYWN0KHN1YnRyYWhlbmQpIHtcbiAgICBpZiAoIWlzTG9uZyhzdWJ0cmFoZW5kKSkgc3VidHJhaGVuZCA9IGZyb21WYWx1ZShzdWJ0cmFoZW5kKTtcbiAgICByZXR1cm4gdGhpcy5hZGQoc3VidHJhaGVuZC5uZWcoKSk7XG4gIH07XG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBkaWZmZXJlbmNlIG9mIHRoaXMgYW5kIHRoZSBzcGVjaWZpZWQgTG9uZy4gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgTG9uZyNzdWJ0cmFjdH0uXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxzdHJpbmd9IHN1YnRyYWhlbmQgU3VidHJhaGVuZFxuICAgKiBAcmV0dXJucyB7IUxvbmd9IERpZmZlcmVuY2VcbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5zdWIgPSBMb25nUHJvdG90eXBlLnN1YnRyYWN0O1xuICAvKipcbiAgICogUmV0dXJucyB0aGUgcHJvZHVjdCBvZiB0aGlzIGFuZCB0aGUgc3BlY2lmaWVkIExvbmcuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfSBtdWx0aXBsaWVyIE11bHRpcGxpZXJcbiAgICogQHJldHVybnMgeyFMb25nfSBQcm9kdWN0XG4gICAqL1xuICBcbiAgTG9uZ1Byb3RvdHlwZS5tdWx0aXBseSA9IGZ1bmN0aW9uIG11bHRpcGx5KG11bHRpcGxpZXIpIHtcbiAgICBpZiAodGhpcy5pc1plcm8oKSkgcmV0dXJuIHRoaXM7XG4gICAgaWYgKCFpc0xvbmcobXVsdGlwbGllcikpIG11bHRpcGxpZXIgPSBmcm9tVmFsdWUobXVsdGlwbGllcik7IC8vIHVzZSB3YXNtIHN1cHBvcnQgaWYgcHJlc2VudFxuICBcbiAgICBpZiAod2FzbSkge1xuICAgICAgdmFyIGxvdyA9IHdhc21bXCJtdWxcIl0odGhpcy5sb3csIHRoaXMuaGlnaCwgbXVsdGlwbGllci5sb3csIG11bHRpcGxpZXIuaGlnaCk7XG4gICAgICByZXR1cm4gZnJvbUJpdHMobG93LCB3YXNtW1wiZ2V0X2hpZ2hcIl0oKSwgdGhpcy51bnNpZ25lZCk7XG4gICAgfVxuICBcbiAgICBpZiAobXVsdGlwbGllci5pc1plcm8oKSkgcmV0dXJuIHRoaXMudW5zaWduZWQgPyBVWkVSTyA6IFpFUk87XG4gICAgaWYgKHRoaXMuZXEoTUlOX1ZBTFVFKSkgcmV0dXJuIG11bHRpcGxpZXIuaXNPZGQoKSA/IE1JTl9WQUxVRSA6IFpFUk87XG4gICAgaWYgKG11bHRpcGxpZXIuZXEoTUlOX1ZBTFVFKSkgcmV0dXJuIHRoaXMuaXNPZGQoKSA/IE1JTl9WQUxVRSA6IFpFUk87XG4gIFxuICAgIGlmICh0aGlzLmlzTmVnYXRpdmUoKSkge1xuICAgICAgaWYgKG11bHRpcGxpZXIuaXNOZWdhdGl2ZSgpKSByZXR1cm4gdGhpcy5uZWcoKS5tdWwobXVsdGlwbGllci5uZWcoKSk7ZWxzZSByZXR1cm4gdGhpcy5uZWcoKS5tdWwobXVsdGlwbGllcikubmVnKCk7XG4gICAgfSBlbHNlIGlmIChtdWx0aXBsaWVyLmlzTmVnYXRpdmUoKSkgcmV0dXJuIHRoaXMubXVsKG11bHRpcGxpZXIubmVnKCkpLm5lZygpOyAvLyBJZiBib3RoIGxvbmdzIGFyZSBzbWFsbCwgdXNlIGZsb2F0IG11bHRpcGxpY2F0aW9uXG4gIFxuICBcbiAgICBpZiAodGhpcy5sdChUV09fUFdSXzI0KSAmJiBtdWx0aXBsaWVyLmx0KFRXT19QV1JfMjQpKSByZXR1cm4gZnJvbU51bWJlcih0aGlzLnRvTnVtYmVyKCkgKiBtdWx0aXBsaWVyLnRvTnVtYmVyKCksIHRoaXMudW5zaWduZWQpOyAvLyBEaXZpZGUgZWFjaCBsb25nIGludG8gNCBjaHVua3Mgb2YgMTYgYml0cywgYW5kIHRoZW4gYWRkIHVwIDR4NCBwcm9kdWN0cy5cbiAgICAvLyBXZSBjYW4gc2tpcCBwcm9kdWN0cyB0aGF0IHdvdWxkIG92ZXJmbG93LlxuICBcbiAgICB2YXIgYTQ4ID0gdGhpcy5oaWdoID4+PiAxNjtcbiAgICB2YXIgYTMyID0gdGhpcy5oaWdoICYgMHhGRkZGO1xuICAgIHZhciBhMTYgPSB0aGlzLmxvdyA+Pj4gMTY7XG4gICAgdmFyIGEwMCA9IHRoaXMubG93ICYgMHhGRkZGO1xuICAgIHZhciBiNDggPSBtdWx0aXBsaWVyLmhpZ2ggPj4+IDE2O1xuICAgIHZhciBiMzIgPSBtdWx0aXBsaWVyLmhpZ2ggJiAweEZGRkY7XG4gICAgdmFyIGIxNiA9IG11bHRpcGxpZXIubG93ID4+PiAxNjtcbiAgICB2YXIgYjAwID0gbXVsdGlwbGllci5sb3cgJiAweEZGRkY7XG4gICAgdmFyIGM0OCA9IDAsXG4gICAgICAgIGMzMiA9IDAsXG4gICAgICAgIGMxNiA9IDAsXG4gICAgICAgIGMwMCA9IDA7XG4gICAgYzAwICs9IGEwMCAqIGIwMDtcbiAgICBjMTYgKz0gYzAwID4+PiAxNjtcbiAgICBjMDAgJj0gMHhGRkZGO1xuICAgIGMxNiArPSBhMTYgKiBiMDA7XG4gICAgYzMyICs9IGMxNiA+Pj4gMTY7XG4gICAgYzE2ICY9IDB4RkZGRjtcbiAgICBjMTYgKz0gYTAwICogYjE2O1xuICAgIGMzMiArPSBjMTYgPj4+IDE2O1xuICAgIGMxNiAmPSAweEZGRkY7XG4gICAgYzMyICs9IGEzMiAqIGIwMDtcbiAgICBjNDggKz0gYzMyID4+PiAxNjtcbiAgICBjMzIgJj0gMHhGRkZGO1xuICAgIGMzMiArPSBhMTYgKiBiMTY7XG4gICAgYzQ4ICs9IGMzMiA+Pj4gMTY7XG4gICAgYzMyICY9IDB4RkZGRjtcbiAgICBjMzIgKz0gYTAwICogYjMyO1xuICAgIGM0OCArPSBjMzIgPj4+IDE2O1xuICAgIGMzMiAmPSAweEZGRkY7XG4gICAgYzQ4ICs9IGE0OCAqIGIwMCArIGEzMiAqIGIxNiArIGExNiAqIGIzMiArIGEwMCAqIGI0ODtcbiAgICBjNDggJj0gMHhGRkZGO1xuICAgIHJldHVybiBmcm9tQml0cyhjMTYgPDwgMTYgfCBjMDAsIGM0OCA8PCAxNiB8IGMzMiwgdGhpcy51bnNpZ25lZCk7XG4gIH07XG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBwcm9kdWN0IG9mIHRoaXMgYW5kIHRoZSBzcGVjaWZpZWQgTG9uZy4gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgTG9uZyNtdWx0aXBseX0uXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxzdHJpbmd9IG11bHRpcGxpZXIgTXVsdGlwbGllclxuICAgKiBAcmV0dXJucyB7IUxvbmd9IFByb2R1Y3RcbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5tdWwgPSBMb25nUHJvdG90eXBlLm11bHRpcGx5O1xuICAvKipcbiAgICogUmV0dXJucyB0aGlzIExvbmcgZGl2aWRlZCBieSB0aGUgc3BlY2lmaWVkLiBUaGUgcmVzdWx0IGlzIHNpZ25lZCBpZiB0aGlzIExvbmcgaXMgc2lnbmVkIG9yXG4gICAqICB1bnNpZ25lZCBpZiB0aGlzIExvbmcgaXMgdW5zaWduZWQuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfSBkaXZpc29yIERpdmlzb3JcbiAgICogQHJldHVybnMgeyFMb25nfSBRdW90aWVudFxuICAgKi9cbiAgXG4gIExvbmdQcm90b3R5cGUuZGl2aWRlID0gZnVuY3Rpb24gZGl2aWRlKGRpdmlzb3IpIHtcbiAgICBpZiAoIWlzTG9uZyhkaXZpc29yKSkgZGl2aXNvciA9IGZyb21WYWx1ZShkaXZpc29yKTtcbiAgICBpZiAoZGl2aXNvci5pc1plcm8oKSkgdGhyb3cgRXJyb3IoJ2RpdmlzaW9uIGJ5IHplcm8nKTsgLy8gdXNlIHdhc20gc3VwcG9ydCBpZiBwcmVzZW50XG4gIFxuICAgIGlmICh3YXNtKSB7XG4gICAgICAvLyBndWFyZCBhZ2FpbnN0IHNpZ25lZCBkaXZpc2lvbiBvdmVyZmxvdzogdGhlIGxhcmdlc3RcbiAgICAgIC8vIG5lZ2F0aXZlIG51bWJlciAvIC0xIHdvdWxkIGJlIDEgbGFyZ2VyIHRoYW4gdGhlIGxhcmdlc3RcbiAgICAgIC8vIHBvc2l0aXZlIG51bWJlciwgZHVlIHRvIHR3bydzIGNvbXBsZW1lbnQuXG4gICAgICBpZiAoIXRoaXMudW5zaWduZWQgJiYgdGhpcy5oaWdoID09PSAtMHg4MDAwMDAwMCAmJiBkaXZpc29yLmxvdyA9PT0gLTEgJiYgZGl2aXNvci5oaWdoID09PSAtMSkge1xuICAgICAgICAvLyBiZSBjb25zaXN0ZW50IHdpdGggbm9uLXdhc20gY29kZSBwYXRoXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuICBcbiAgICAgIHZhciBsb3cgPSAodGhpcy51bnNpZ25lZCA/IHdhc21bXCJkaXZfdVwiXSA6IHdhc21bXCJkaXZfc1wiXSkodGhpcy5sb3csIHRoaXMuaGlnaCwgZGl2aXNvci5sb3csIGRpdmlzb3IuaGlnaCk7XG4gICAgICByZXR1cm4gZnJvbUJpdHMobG93LCB3YXNtW1wiZ2V0X2hpZ2hcIl0oKSwgdGhpcy51bnNpZ25lZCk7XG4gICAgfVxuICBcbiAgICBpZiAodGhpcy5pc1plcm8oKSkgcmV0dXJuIHRoaXMudW5zaWduZWQgPyBVWkVSTyA6IFpFUk87XG4gICAgdmFyIGFwcHJveCwgcmVtLCByZXM7XG4gIFxuICAgIGlmICghdGhpcy51bnNpZ25lZCkge1xuICAgICAgLy8gVGhpcyBzZWN0aW9uIGlzIG9ubHkgcmVsZXZhbnQgZm9yIHNpZ25lZCBsb25ncyBhbmQgaXMgZGVyaXZlZCBmcm9tIHRoZVxuICAgICAgLy8gY2xvc3VyZSBsaWJyYXJ5IGFzIGEgd2hvbGUuXG4gICAgICBpZiAodGhpcy5lcShNSU5fVkFMVUUpKSB7XG4gICAgICAgIGlmIChkaXZpc29yLmVxKE9ORSkgfHwgZGl2aXNvci5lcShORUdfT05FKSkgcmV0dXJuIE1JTl9WQUxVRTsgLy8gcmVjYWxsIHRoYXQgLU1JTl9WQUxVRSA9PSBNSU5fVkFMVUVcbiAgICAgICAgZWxzZSBpZiAoZGl2aXNvci5lcShNSU5fVkFMVUUpKSByZXR1cm4gT05FO2Vsc2Uge1xuICAgICAgICAgIC8vIEF0IHRoaXMgcG9pbnQsIHdlIGhhdmUgfG90aGVyfCA+PSAyLCBzbyB8dGhpcy9vdGhlcnwgPCB8TUlOX1ZBTFVFfC5cbiAgICAgICAgICB2YXIgaGFsZlRoaXMgPSB0aGlzLnNocigxKTtcbiAgICAgICAgICBhcHByb3ggPSBoYWxmVGhpcy5kaXYoZGl2aXNvcikuc2hsKDEpO1xuICBcbiAgICAgICAgICBpZiAoYXBwcm94LmVxKFpFUk8pKSB7XG4gICAgICAgICAgICByZXR1cm4gZGl2aXNvci5pc05lZ2F0aXZlKCkgPyBPTkUgOiBORUdfT05FO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZW0gPSB0aGlzLnN1YihkaXZpc29yLm11bChhcHByb3gpKTtcbiAgICAgICAgICAgIHJlcyA9IGFwcHJveC5hZGQocmVtLmRpdihkaXZpc29yKSk7XG4gICAgICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChkaXZpc29yLmVxKE1JTl9WQUxVRSkpIHJldHVybiB0aGlzLnVuc2lnbmVkID8gVVpFUk8gOiBaRVJPO1xuICBcbiAgICAgIGlmICh0aGlzLmlzTmVnYXRpdmUoKSkge1xuICAgICAgICBpZiAoZGl2aXNvci5pc05lZ2F0aXZlKCkpIHJldHVybiB0aGlzLm5lZygpLmRpdihkaXZpc29yLm5lZygpKTtcbiAgICAgICAgcmV0dXJuIHRoaXMubmVnKCkuZGl2KGRpdmlzb3IpLm5lZygpO1xuICAgICAgfSBlbHNlIGlmIChkaXZpc29yLmlzTmVnYXRpdmUoKSkgcmV0dXJuIHRoaXMuZGl2KGRpdmlzb3IubmVnKCkpLm5lZygpO1xuICBcbiAgICAgIHJlcyA9IFpFUk87XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFRoZSBhbGdvcml0aG0gYmVsb3cgaGFzIG5vdCBiZWVuIG1hZGUgZm9yIHVuc2lnbmVkIGxvbmdzLiBJdCdzIHRoZXJlZm9yZVxuICAgICAgLy8gcmVxdWlyZWQgdG8gdGFrZSBzcGVjaWFsIGNhcmUgb2YgdGhlIE1TQiBwcmlvciB0byBydW5uaW5nIGl0LlxuICAgICAgaWYgKCFkaXZpc29yLnVuc2lnbmVkKSBkaXZpc29yID0gZGl2aXNvci50b1Vuc2lnbmVkKCk7XG4gICAgICBpZiAoZGl2aXNvci5ndCh0aGlzKSkgcmV0dXJuIFVaRVJPO1xuICAgICAgaWYgKGRpdmlzb3IuZ3QodGhpcy5zaHJ1KDEpKSkgLy8gMTUgPj4+IDEgPSA3IDsgd2l0aCBkaXZpc29yID0gOCA7IHRydWVcbiAgICAgICAgcmV0dXJuIFVPTkU7XG4gICAgICByZXMgPSBVWkVSTztcbiAgICB9IC8vIFJlcGVhdCB0aGUgZm9sbG93aW5nIHVudGlsIHRoZSByZW1haW5kZXIgaXMgbGVzcyB0aGFuIG90aGVyOiAgZmluZCBhXG4gICAgLy8gZmxvYXRpbmctcG9pbnQgdGhhdCBhcHByb3hpbWF0ZXMgcmVtYWluZGVyIC8gb3RoZXIgKmZyb20gYmVsb3cqLCBhZGQgdGhpc1xuICAgIC8vIGludG8gdGhlIHJlc3VsdCwgYW5kIHN1YnRyYWN0IGl0IGZyb20gdGhlIHJlbWFpbmRlci4gIEl0IGlzIGNyaXRpY2FsIHRoYXRcbiAgICAvLyB0aGUgYXBwcm94aW1hdGUgdmFsdWUgaXMgbGVzcyB0aGFuIG9yIGVxdWFsIHRvIHRoZSByZWFsIHZhbHVlIHNvIHRoYXQgdGhlXG4gICAgLy8gcmVtYWluZGVyIG5ldmVyIGJlY29tZXMgbmVnYXRpdmUuXG4gIFxuICBcbiAgICByZW0gPSB0aGlzO1xuICBcbiAgICB3aGlsZSAocmVtLmd0ZShkaXZpc29yKSkge1xuICAgICAgLy8gQXBwcm94aW1hdGUgdGhlIHJlc3VsdCBvZiBkaXZpc2lvbi4gVGhpcyBtYXkgYmUgYSBsaXR0bGUgZ3JlYXRlciBvclxuICAgICAgLy8gc21hbGxlciB0aGFuIHRoZSBhY3R1YWwgdmFsdWUuXG4gICAgICBhcHByb3ggPSBNYXRoLm1heCgxLCBNYXRoLmZsb29yKHJlbS50b051bWJlcigpIC8gZGl2aXNvci50b051bWJlcigpKSk7IC8vIFdlIHdpbGwgdHdlYWsgdGhlIGFwcHJveGltYXRlIHJlc3VsdCBieSBjaGFuZ2luZyBpdCBpbiB0aGUgNDgtdGggZGlnaXQgb3JcbiAgICAgIC8vIHRoZSBzbWFsbGVzdCBub24tZnJhY3Rpb25hbCBkaWdpdCwgd2hpY2hldmVyIGlzIGxhcmdlci5cbiAgXG4gICAgICB2YXIgbG9nMiA9IE1hdGguY2VpbChNYXRoLmxvZyhhcHByb3gpIC8gTWF0aC5MTjIpLFxuICAgICAgICAgIGRlbHRhID0gbG9nMiA8PSA0OCA/IDEgOiBwb3dfZGJsKDIsIGxvZzIgLSA0OCksXG4gICAgICAgICAgLy8gRGVjcmVhc2UgdGhlIGFwcHJveGltYXRpb24gdW50aWwgaXQgaXMgc21hbGxlciB0aGFuIHRoZSByZW1haW5kZXIuICBOb3RlXG4gICAgICAvLyB0aGF0IGlmIGl0IGlzIHRvbyBsYXJnZSwgdGhlIHByb2R1Y3Qgb3ZlcmZsb3dzIGFuZCBpcyBuZWdhdGl2ZS5cbiAgICAgIGFwcHJveFJlcyA9IGZyb21OdW1iZXIoYXBwcm94KSxcbiAgICAgICAgICBhcHByb3hSZW0gPSBhcHByb3hSZXMubXVsKGRpdmlzb3IpO1xuICBcbiAgICAgIHdoaWxlIChhcHByb3hSZW0uaXNOZWdhdGl2ZSgpIHx8IGFwcHJveFJlbS5ndChyZW0pKSB7XG4gICAgICAgIGFwcHJveCAtPSBkZWx0YTtcbiAgICAgICAgYXBwcm94UmVzID0gZnJvbU51bWJlcihhcHByb3gsIHRoaXMudW5zaWduZWQpO1xuICAgICAgICBhcHByb3hSZW0gPSBhcHByb3hSZXMubXVsKGRpdmlzb3IpO1xuICAgICAgfSAvLyBXZSBrbm93IHRoZSBhbnN3ZXIgY2FuJ3QgYmUgemVyby4uLiBhbmQgYWN0dWFsbHksIHplcm8gd291bGQgY2F1c2VcbiAgICAgIC8vIGluZmluaXRlIHJlY3Vyc2lvbiBzaW5jZSB3ZSB3b3VsZCBtYWtlIG5vIHByb2dyZXNzLlxuICBcbiAgXG4gICAgICBpZiAoYXBwcm94UmVzLmlzWmVybygpKSBhcHByb3hSZXMgPSBPTkU7XG4gICAgICByZXMgPSByZXMuYWRkKGFwcHJveFJlcyk7XG4gICAgICByZW0gPSByZW0uc3ViKGFwcHJveFJlbSk7XG4gICAgfVxuICBcbiAgICByZXR1cm4gcmVzO1xuICB9O1xuICAvKipcbiAgICogUmV0dXJucyB0aGlzIExvbmcgZGl2aWRlZCBieSB0aGUgc3BlY2lmaWVkLiBUaGlzIGlzIGFuIGFsaWFzIG9mIHtAbGluayBMb25nI2RpdmlkZX0uXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxzdHJpbmd9IGRpdmlzb3IgRGl2aXNvclxuICAgKiBAcmV0dXJucyB7IUxvbmd9IFF1b3RpZW50XG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUuZGl2ID0gTG9uZ1Byb3RvdHlwZS5kaXZpZGU7XG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoaXMgTG9uZyBtb2R1bG8gdGhlIHNwZWNpZmllZC5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxzdHJpbmd9IGRpdmlzb3IgRGl2aXNvclxuICAgKiBAcmV0dXJucyB7IUxvbmd9IFJlbWFpbmRlclxuICAgKi9cbiAgXG4gIExvbmdQcm90b3R5cGUubW9kdWxvID0gZnVuY3Rpb24gbW9kdWxvKGRpdmlzb3IpIHtcbiAgICBpZiAoIWlzTG9uZyhkaXZpc29yKSkgZGl2aXNvciA9IGZyb21WYWx1ZShkaXZpc29yKTsgLy8gdXNlIHdhc20gc3VwcG9ydCBpZiBwcmVzZW50XG4gIFxuICAgIGlmICh3YXNtKSB7XG4gICAgICB2YXIgbG93ID0gKHRoaXMudW5zaWduZWQgPyB3YXNtW1wicmVtX3VcIl0gOiB3YXNtW1wicmVtX3NcIl0pKHRoaXMubG93LCB0aGlzLmhpZ2gsIGRpdmlzb3IubG93LCBkaXZpc29yLmhpZ2gpO1xuICAgICAgcmV0dXJuIGZyb21CaXRzKGxvdywgd2FzbVtcImdldF9oaWdoXCJdKCksIHRoaXMudW5zaWduZWQpO1xuICAgIH1cbiAgXG4gICAgcmV0dXJuIHRoaXMuc3ViKHRoaXMuZGl2KGRpdmlzb3IpLm11bChkaXZpc29yKSk7XG4gIH07XG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoaXMgTG9uZyBtb2R1bG8gdGhlIHNwZWNpZmllZC4gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgTG9uZyNtb2R1bG99LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfSBkaXZpc29yIERpdmlzb3JcbiAgICogQHJldHVybnMgeyFMb25nfSBSZW1haW5kZXJcbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5tb2QgPSBMb25nUHJvdG90eXBlLm1vZHVsbztcbiAgLyoqXG4gICAqIFJldHVybnMgdGhpcyBMb25nIG1vZHVsbyB0aGUgc3BlY2lmaWVkLiBUaGlzIGlzIGFuIGFsaWFzIG9mIHtAbGluayBMb25nI21vZHVsb30uXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxzdHJpbmd9IGRpdmlzb3IgRGl2aXNvclxuICAgKiBAcmV0dXJucyB7IUxvbmd9IFJlbWFpbmRlclxuICAgKi9cbiAgXG4gIExvbmdQcm90b3R5cGUucmVtID0gTG9uZ1Byb3RvdHlwZS5tb2R1bG87XG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBiaXR3aXNlIE5PVCBvZiB0aGlzIExvbmcuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHJldHVybnMgeyFMb25nfVxuICAgKi9cbiAgXG4gIExvbmdQcm90b3R5cGUubm90ID0gZnVuY3Rpb24gbm90KCkge1xuICAgIHJldHVybiBmcm9tQml0cyh+dGhpcy5sb3csIH50aGlzLmhpZ2gsIHRoaXMudW5zaWduZWQpO1xuICB9O1xuICAvKipcbiAgICogUmV0dXJucyBjb3VudCBsZWFkaW5nIHplcm9zIG9mIHRoaXMgTG9uZy5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcmV0dXJucyB7IW51bWJlcn1cbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5jb3VudExlYWRpbmdaZXJvcyA9IGZ1bmN0aW9uIGNvdW50TGVhZGluZ1plcm9zKCkge1xuICAgIHJldHVybiB0aGlzLmhpZ2ggPyBNYXRoLmNsejMyKHRoaXMuaGlnaCkgOiBNYXRoLmNsejMyKHRoaXMubG93KSArIDMyO1xuICB9O1xuICAvKipcbiAgICogUmV0dXJucyBjb3VudCBsZWFkaW5nIHplcm9zLiBUaGlzIGlzIGFuIGFsaWFzIG9mIHtAbGluayBMb25nI2NvdW50TGVhZGluZ1plcm9zfS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7IUxvbmd9XG4gICAqIEByZXR1cm5zIHshbnVtYmVyfVxuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLmNseiA9IExvbmdQcm90b3R5cGUuY291bnRMZWFkaW5nWmVyb3M7XG4gIC8qKlxuICAgKiBSZXR1cm5zIGNvdW50IHRyYWlsaW5nIHplcm9zIG9mIHRoaXMgTG9uZy5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcmV0dXJucyB7IW51bWJlcn1cbiAgICovXG4gIFxuICBMb25nUHJvdG90eXBlLmNvdW50VHJhaWxpbmdaZXJvcyA9IGZ1bmN0aW9uIGNvdW50VHJhaWxpbmdaZXJvcygpIHtcbiAgICByZXR1cm4gdGhpcy5sb3cgPyBjdHozMih0aGlzLmxvdykgOiBjdHozMih0aGlzLmhpZ2gpICsgMzI7XG4gIH07XG4gIC8qKlxuICAgKiBSZXR1cm5zIGNvdW50IHRyYWlsaW5nIHplcm9zLiBUaGlzIGlzIGFuIGFsaWFzIG9mIHtAbGluayBMb25nI2NvdW50VHJhaWxpbmdaZXJvc30uXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0geyFMb25nfVxuICAgKiBAcmV0dXJucyB7IW51bWJlcn1cbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5jdHogPSBMb25nUHJvdG90eXBlLmNvdW50VHJhaWxpbmdaZXJvcztcbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGJpdHdpc2UgQU5EIG9mIHRoaXMgTG9uZyBhbmQgdGhlIHNwZWNpZmllZC5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxzdHJpbmd9IG90aGVyIE90aGVyIExvbmdcbiAgICogQHJldHVybnMgeyFMb25nfVxuICAgKi9cbiAgXG4gIExvbmdQcm90b3R5cGUuYW5kID0gZnVuY3Rpb24gYW5kKG90aGVyKSB7XG4gICAgaWYgKCFpc0xvbmcob3RoZXIpKSBvdGhlciA9IGZyb21WYWx1ZShvdGhlcik7XG4gICAgcmV0dXJuIGZyb21CaXRzKHRoaXMubG93ICYgb3RoZXIubG93LCB0aGlzLmhpZ2ggJiBvdGhlci5oaWdoLCB0aGlzLnVuc2lnbmVkKTtcbiAgfTtcbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGJpdHdpc2UgT1Igb2YgdGhpcyBMb25nIGFuZCB0aGUgc3BlY2lmaWVkLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ30gb3RoZXIgT3RoZXIgTG9uZ1xuICAgKiBAcmV0dXJucyB7IUxvbmd9XG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUub3IgPSBmdW5jdGlvbiBvcihvdGhlcikge1xuICAgIGlmICghaXNMb25nKG90aGVyKSkgb3RoZXIgPSBmcm9tVmFsdWUob3RoZXIpO1xuICAgIHJldHVybiBmcm9tQml0cyh0aGlzLmxvdyB8IG90aGVyLmxvdywgdGhpcy5oaWdoIHwgb3RoZXIuaGlnaCwgdGhpcy51bnNpZ25lZCk7XG4gIH07XG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBiaXR3aXNlIFhPUiBvZiB0aGlzIExvbmcgYW5kIHRoZSBnaXZlbiBvbmUuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfSBvdGhlciBPdGhlciBMb25nXG4gICAqIEByZXR1cm5zIHshTG9uZ31cbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS54b3IgPSBmdW5jdGlvbiB4b3Iob3RoZXIpIHtcbiAgICBpZiAoIWlzTG9uZyhvdGhlcikpIG90aGVyID0gZnJvbVZhbHVlKG90aGVyKTtcbiAgICByZXR1cm4gZnJvbUJpdHModGhpcy5sb3cgXiBvdGhlci5sb3csIHRoaXMuaGlnaCBeIG90aGVyLmhpZ2gsIHRoaXMudW5zaWduZWQpO1xuICB9O1xuICAvKipcbiAgICogUmV0dXJucyB0aGlzIExvbmcgd2l0aCBiaXRzIHNoaWZ0ZWQgdG8gdGhlIGxlZnQgYnkgdGhlIGdpdmVuIGFtb3VudC5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcGFyYW0ge251bWJlcnwhTG9uZ30gbnVtQml0cyBOdW1iZXIgb2YgYml0c1xuICAgKiBAcmV0dXJucyB7IUxvbmd9IFNoaWZ0ZWQgTG9uZ1xuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLnNoaWZ0TGVmdCA9IGZ1bmN0aW9uIHNoaWZ0TGVmdChudW1CaXRzKSB7XG4gICAgaWYgKGlzTG9uZyhudW1CaXRzKSkgbnVtQml0cyA9IG51bUJpdHMudG9JbnQoKTtcbiAgICBpZiAoKG51bUJpdHMgJj0gNjMpID09PSAwKSByZXR1cm4gdGhpcztlbHNlIGlmIChudW1CaXRzIDwgMzIpIHJldHVybiBmcm9tQml0cyh0aGlzLmxvdyA8PCBudW1CaXRzLCB0aGlzLmhpZ2ggPDwgbnVtQml0cyB8IHRoaXMubG93ID4+PiAzMiAtIG51bUJpdHMsIHRoaXMudW5zaWduZWQpO2Vsc2UgcmV0dXJuIGZyb21CaXRzKDAsIHRoaXMubG93IDw8IG51bUJpdHMgLSAzMiwgdGhpcy51bnNpZ25lZCk7XG4gIH07XG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoaXMgTG9uZyB3aXRoIGJpdHMgc2hpZnRlZCB0byB0aGUgbGVmdCBieSB0aGUgZ2l2ZW4gYW1vdW50LiBUaGlzIGlzIGFuIGFsaWFzIG9mIHtAbGluayBMb25nI3NoaWZ0TGVmdH0uXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0ge251bWJlcnwhTG9uZ30gbnVtQml0cyBOdW1iZXIgb2YgYml0c1xuICAgKiBAcmV0dXJucyB7IUxvbmd9IFNoaWZ0ZWQgTG9uZ1xuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLnNobCA9IExvbmdQcm90b3R5cGUuc2hpZnRMZWZ0O1xuICAvKipcbiAgICogUmV0dXJucyB0aGlzIExvbmcgd2l0aCBiaXRzIGFyaXRobWV0aWNhbGx5IHNoaWZ0ZWQgdG8gdGhlIHJpZ2h0IGJ5IHRoZSBnaXZlbiBhbW91bnQuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHBhcmFtIHtudW1iZXJ8IUxvbmd9IG51bUJpdHMgTnVtYmVyIG9mIGJpdHNcbiAgICogQHJldHVybnMgeyFMb25nfSBTaGlmdGVkIExvbmdcbiAgICovXG4gIFxuICBMb25nUHJvdG90eXBlLnNoaWZ0UmlnaHQgPSBmdW5jdGlvbiBzaGlmdFJpZ2h0KG51bUJpdHMpIHtcbiAgICBpZiAoaXNMb25nKG51bUJpdHMpKSBudW1CaXRzID0gbnVtQml0cy50b0ludCgpO1xuICAgIGlmICgobnVtQml0cyAmPSA2MykgPT09IDApIHJldHVybiB0aGlzO2Vsc2UgaWYgKG51bUJpdHMgPCAzMikgcmV0dXJuIGZyb21CaXRzKHRoaXMubG93ID4+PiBudW1CaXRzIHwgdGhpcy5oaWdoIDw8IDMyIC0gbnVtQml0cywgdGhpcy5oaWdoID4+IG51bUJpdHMsIHRoaXMudW5zaWduZWQpO2Vsc2UgcmV0dXJuIGZyb21CaXRzKHRoaXMuaGlnaCA+PiBudW1CaXRzIC0gMzIsIHRoaXMuaGlnaCA+PSAwID8gMCA6IC0xLCB0aGlzLnVuc2lnbmVkKTtcbiAgfTtcbiAgLyoqXG4gICAqIFJldHVybnMgdGhpcyBMb25nIHdpdGggYml0cyBhcml0aG1ldGljYWxseSBzaGlmdGVkIHRvIHRoZSByaWdodCBieSB0aGUgZ2l2ZW4gYW1vdW50LiBUaGlzIGlzIGFuIGFsaWFzIG9mIHtAbGluayBMb25nI3NoaWZ0UmlnaHR9LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHtudW1iZXJ8IUxvbmd9IG51bUJpdHMgTnVtYmVyIG9mIGJpdHNcbiAgICogQHJldHVybnMgeyFMb25nfSBTaGlmdGVkIExvbmdcbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5zaHIgPSBMb25nUHJvdG90eXBlLnNoaWZ0UmlnaHQ7XG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoaXMgTG9uZyB3aXRoIGJpdHMgbG9naWNhbGx5IHNoaWZ0ZWQgdG8gdGhlIHJpZ2h0IGJ5IHRoZSBnaXZlbiBhbW91bnQuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHBhcmFtIHtudW1iZXJ8IUxvbmd9IG51bUJpdHMgTnVtYmVyIG9mIGJpdHNcbiAgICogQHJldHVybnMgeyFMb25nfSBTaGlmdGVkIExvbmdcbiAgICovXG4gIFxuICBMb25nUHJvdG90eXBlLnNoaWZ0UmlnaHRVbnNpZ25lZCA9IGZ1bmN0aW9uIHNoaWZ0UmlnaHRVbnNpZ25lZChudW1CaXRzKSB7XG4gICAgaWYgKGlzTG9uZyhudW1CaXRzKSkgbnVtQml0cyA9IG51bUJpdHMudG9JbnQoKTtcbiAgICBpZiAoKG51bUJpdHMgJj0gNjMpID09PSAwKSByZXR1cm4gdGhpcztcbiAgICBpZiAobnVtQml0cyA8IDMyKSByZXR1cm4gZnJvbUJpdHModGhpcy5sb3cgPj4+IG51bUJpdHMgfCB0aGlzLmhpZ2ggPDwgMzIgLSBudW1CaXRzLCB0aGlzLmhpZ2ggPj4+IG51bUJpdHMsIHRoaXMudW5zaWduZWQpO1xuICAgIGlmIChudW1CaXRzID09PSAzMikgcmV0dXJuIGZyb21CaXRzKHRoaXMuaGlnaCwgMCwgdGhpcy51bnNpZ25lZCk7XG4gICAgcmV0dXJuIGZyb21CaXRzKHRoaXMuaGlnaCA+Pj4gbnVtQml0cyAtIDMyLCAwLCB0aGlzLnVuc2lnbmVkKTtcbiAgfTtcbiAgLyoqXG4gICAqIFJldHVybnMgdGhpcyBMb25nIHdpdGggYml0cyBsb2dpY2FsbHkgc2hpZnRlZCB0byB0aGUgcmlnaHQgYnkgdGhlIGdpdmVuIGFtb3VudC4gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgTG9uZyNzaGlmdFJpZ2h0VW5zaWduZWR9LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHtudW1iZXJ8IUxvbmd9IG51bUJpdHMgTnVtYmVyIG9mIGJpdHNcbiAgICogQHJldHVybnMgeyFMb25nfSBTaGlmdGVkIExvbmdcbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5zaHJ1ID0gTG9uZ1Byb3RvdHlwZS5zaGlmdFJpZ2h0VW5zaWduZWQ7XG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoaXMgTG9uZyB3aXRoIGJpdHMgbG9naWNhbGx5IHNoaWZ0ZWQgdG8gdGhlIHJpZ2h0IGJ5IHRoZSBnaXZlbiBhbW91bnQuIFRoaXMgaXMgYW4gYWxpYXMgb2Yge0BsaW5rIExvbmcjc2hpZnRSaWdodFVuc2lnbmVkfS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7bnVtYmVyfCFMb25nfSBudW1CaXRzIE51bWJlciBvZiBiaXRzXG4gICAqIEByZXR1cm5zIHshTG9uZ30gU2hpZnRlZCBMb25nXG4gICAqL1xuICBcbiAgTG9uZ1Byb3RvdHlwZS5zaHJfdSA9IExvbmdQcm90b3R5cGUuc2hpZnRSaWdodFVuc2lnbmVkO1xuICAvKipcbiAgICogUmV0dXJucyB0aGlzIExvbmcgd2l0aCBiaXRzIHJvdGF0ZWQgdG8gdGhlIGxlZnQgYnkgdGhlIGdpdmVuIGFtb3VudC5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcGFyYW0ge251bWJlcnwhTG9uZ30gbnVtQml0cyBOdW1iZXIgb2YgYml0c1xuICAgKiBAcmV0dXJucyB7IUxvbmd9IFJvdGF0ZWQgTG9uZ1xuICAgKi9cbiAgXG4gIExvbmdQcm90b3R5cGUucm90YXRlTGVmdCA9IGZ1bmN0aW9uIHJvdGF0ZUxlZnQobnVtQml0cykge1xuICAgIHZhciBiO1xuICAgIGlmIChpc0xvbmcobnVtQml0cykpIG51bUJpdHMgPSBudW1CaXRzLnRvSW50KCk7XG4gICAgaWYgKChudW1CaXRzICY9IDYzKSA9PT0gMCkgcmV0dXJuIHRoaXM7XG4gICAgaWYgKG51bUJpdHMgPT09IDMyKSByZXR1cm4gZnJvbUJpdHModGhpcy5oaWdoLCB0aGlzLmxvdywgdGhpcy51bnNpZ25lZCk7XG4gIFxuICAgIGlmIChudW1CaXRzIDwgMzIpIHtcbiAgICAgIGIgPSAzMiAtIG51bUJpdHM7XG4gICAgICByZXR1cm4gZnJvbUJpdHModGhpcy5sb3cgPDwgbnVtQml0cyB8IHRoaXMuaGlnaCA+Pj4gYiwgdGhpcy5oaWdoIDw8IG51bUJpdHMgfCB0aGlzLmxvdyA+Pj4gYiwgdGhpcy51bnNpZ25lZCk7XG4gICAgfVxuICBcbiAgICBudW1CaXRzIC09IDMyO1xuICAgIGIgPSAzMiAtIG51bUJpdHM7XG4gICAgcmV0dXJuIGZyb21CaXRzKHRoaXMuaGlnaCA8PCBudW1CaXRzIHwgdGhpcy5sb3cgPj4+IGIsIHRoaXMubG93IDw8IG51bUJpdHMgfCB0aGlzLmhpZ2ggPj4+IGIsIHRoaXMudW5zaWduZWQpO1xuICB9O1xuICAvKipcbiAgICogUmV0dXJucyB0aGlzIExvbmcgd2l0aCBiaXRzIHJvdGF0ZWQgdG8gdGhlIGxlZnQgYnkgdGhlIGdpdmVuIGFtb3VudC4gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgTG9uZyNyb3RhdGVMZWZ0fS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7bnVtYmVyfCFMb25nfSBudW1CaXRzIE51bWJlciBvZiBiaXRzXG4gICAqIEByZXR1cm5zIHshTG9uZ30gUm90YXRlZCBMb25nXG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUucm90bCA9IExvbmdQcm90b3R5cGUucm90YXRlTGVmdDtcbiAgLyoqXG4gICAqIFJldHVybnMgdGhpcyBMb25nIHdpdGggYml0cyByb3RhdGVkIHRvIHRoZSByaWdodCBieSB0aGUgZ2l2ZW4gYW1vdW50LlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEBwYXJhbSB7bnVtYmVyfCFMb25nfSBudW1CaXRzIE51bWJlciBvZiBiaXRzXG4gICAqIEByZXR1cm5zIHshTG9uZ30gUm90YXRlZCBMb25nXG4gICAqL1xuICBcbiAgTG9uZ1Byb3RvdHlwZS5yb3RhdGVSaWdodCA9IGZ1bmN0aW9uIHJvdGF0ZVJpZ2h0KG51bUJpdHMpIHtcbiAgICB2YXIgYjtcbiAgICBpZiAoaXNMb25nKG51bUJpdHMpKSBudW1CaXRzID0gbnVtQml0cy50b0ludCgpO1xuICAgIGlmICgobnVtQml0cyAmPSA2MykgPT09IDApIHJldHVybiB0aGlzO1xuICAgIGlmIChudW1CaXRzID09PSAzMikgcmV0dXJuIGZyb21CaXRzKHRoaXMuaGlnaCwgdGhpcy5sb3csIHRoaXMudW5zaWduZWQpO1xuICBcbiAgICBpZiAobnVtQml0cyA8IDMyKSB7XG4gICAgICBiID0gMzIgLSBudW1CaXRzO1xuICAgICAgcmV0dXJuIGZyb21CaXRzKHRoaXMuaGlnaCA8PCBiIHwgdGhpcy5sb3cgPj4+IG51bUJpdHMsIHRoaXMubG93IDw8IGIgfCB0aGlzLmhpZ2ggPj4+IG51bUJpdHMsIHRoaXMudW5zaWduZWQpO1xuICAgIH1cbiAgXG4gICAgbnVtQml0cyAtPSAzMjtcbiAgICBiID0gMzIgLSBudW1CaXRzO1xuICAgIHJldHVybiBmcm9tQml0cyh0aGlzLmxvdyA8PCBiIHwgdGhpcy5oaWdoID4+PiBudW1CaXRzLCB0aGlzLmhpZ2ggPDwgYiB8IHRoaXMubG93ID4+PiBudW1CaXRzLCB0aGlzLnVuc2lnbmVkKTtcbiAgfTtcbiAgLyoqXG4gICAqIFJldHVybnMgdGhpcyBMb25nIHdpdGggYml0cyByb3RhdGVkIHRvIHRoZSByaWdodCBieSB0aGUgZ2l2ZW4gYW1vdW50LiBUaGlzIGlzIGFuIGFsaWFzIG9mIHtAbGluayBMb25nI3JvdGF0ZVJpZ2h0fS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7bnVtYmVyfCFMb25nfSBudW1CaXRzIE51bWJlciBvZiBiaXRzXG4gICAqIEByZXR1cm5zIHshTG9uZ30gUm90YXRlZCBMb25nXG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUucm90ciA9IExvbmdQcm90b3R5cGUucm90YXRlUmlnaHQ7XG4gIC8qKlxuICAgKiBDb252ZXJ0cyB0aGlzIExvbmcgdG8gc2lnbmVkLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEByZXR1cm5zIHshTG9uZ30gU2lnbmVkIGxvbmdcbiAgICovXG4gIFxuICBMb25nUHJvdG90eXBlLnRvU2lnbmVkID0gZnVuY3Rpb24gdG9TaWduZWQoKSB7XG4gICAgaWYgKCF0aGlzLnVuc2lnbmVkKSByZXR1cm4gdGhpcztcbiAgICByZXR1cm4gZnJvbUJpdHModGhpcy5sb3csIHRoaXMuaGlnaCwgZmFsc2UpO1xuICB9O1xuICAvKipcbiAgICogQ29udmVydHMgdGhpcyBMb25nIHRvIHVuc2lnbmVkLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEByZXR1cm5zIHshTG9uZ30gVW5zaWduZWQgbG9uZ1xuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLnRvVW5zaWduZWQgPSBmdW5jdGlvbiB0b1Vuc2lnbmVkKCkge1xuICAgIGlmICh0aGlzLnVuc2lnbmVkKSByZXR1cm4gdGhpcztcbiAgICByZXR1cm4gZnJvbUJpdHModGhpcy5sb3csIHRoaXMuaGlnaCwgdHJ1ZSk7XG4gIH07XG4gIC8qKlxuICAgKiBDb252ZXJ0cyB0aGlzIExvbmcgdG8gaXRzIGJ5dGUgcmVwcmVzZW50YXRpb24uXG4gICAqIEBwYXJhbSB7Ym9vbGVhbj19IGxlIFdoZXRoZXIgbGl0dGxlIG9yIGJpZyBlbmRpYW4sIGRlZmF1bHRzIHRvIGJpZyBlbmRpYW5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcmV0dXJucyB7IUFycmF5LjxudW1iZXI+fSBCeXRlIHJlcHJlc2VudGF0aW9uXG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUudG9CeXRlcyA9IGZ1bmN0aW9uIHRvQnl0ZXMobGUpIHtcbiAgICByZXR1cm4gbGUgPyB0aGlzLnRvQnl0ZXNMRSgpIDogdGhpcy50b0J5dGVzQkUoKTtcbiAgfTtcbiAgLyoqXG4gICAqIENvbnZlcnRzIHRoaXMgTG9uZyB0byBpdHMgbGl0dGxlIGVuZGlhbiBieXRlIHJlcHJlc2VudGF0aW9uLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEByZXR1cm5zIHshQXJyYXkuPG51bWJlcj59IExpdHRsZSBlbmRpYW4gYnl0ZSByZXByZXNlbnRhdGlvblxuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLnRvQnl0ZXNMRSA9IGZ1bmN0aW9uIHRvQnl0ZXNMRSgpIHtcbiAgICB2YXIgaGkgPSB0aGlzLmhpZ2gsXG4gICAgICAgIGxvID0gdGhpcy5sb3c7XG4gICAgcmV0dXJuIFtsbyAmIDB4ZmYsIGxvID4+PiA4ICYgMHhmZiwgbG8gPj4+IDE2ICYgMHhmZiwgbG8gPj4+IDI0LCBoaSAmIDB4ZmYsIGhpID4+PiA4ICYgMHhmZiwgaGkgPj4+IDE2ICYgMHhmZiwgaGkgPj4+IDI0XTtcbiAgfTtcbiAgLyoqXG4gICAqIENvbnZlcnRzIHRoaXMgTG9uZyB0byBpdHMgYmlnIGVuZGlhbiBieXRlIHJlcHJlc2VudGF0aW9uLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEByZXR1cm5zIHshQXJyYXkuPG51bWJlcj59IEJpZyBlbmRpYW4gYnl0ZSByZXByZXNlbnRhdGlvblxuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLnRvQnl0ZXNCRSA9IGZ1bmN0aW9uIHRvQnl0ZXNCRSgpIHtcbiAgICB2YXIgaGkgPSB0aGlzLmhpZ2gsXG4gICAgICAgIGxvID0gdGhpcy5sb3c7XG4gICAgcmV0dXJuIFtoaSA+Pj4gMjQsIGhpID4+PiAxNiAmIDB4ZmYsIGhpID4+PiA4ICYgMHhmZiwgaGkgJiAweGZmLCBsbyA+Pj4gMjQsIGxvID4+PiAxNiAmIDB4ZmYsIGxvID4+PiA4ICYgMHhmZiwgbG8gJiAweGZmXTtcbiAgfTtcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBMb25nIGZyb20gaXRzIGJ5dGUgcmVwcmVzZW50YXRpb24uXG4gICAqIEBwYXJhbSB7IUFycmF5LjxudW1iZXI+fSBieXRlcyBCeXRlIHJlcHJlc2VudGF0aW9uXG4gICAqIEBwYXJhbSB7Ym9vbGVhbj19IHVuc2lnbmVkIFdoZXRoZXIgdW5zaWduZWQgb3Igbm90LCBkZWZhdWx0cyB0byBzaWduZWRcbiAgICogQHBhcmFtIHtib29sZWFuPX0gbGUgV2hldGhlciBsaXR0bGUgb3IgYmlnIGVuZGlhbiwgZGVmYXVsdHMgdG8gYmlnIGVuZGlhblxuICAgKiBAcmV0dXJucyB7TG9uZ30gVGhlIGNvcnJlc3BvbmRpbmcgTG9uZyB2YWx1ZVxuICAgKi9cbiAgXG4gIFxuICBMb25nLmZyb21CeXRlcyA9IGZ1bmN0aW9uIGZyb21CeXRlcyhieXRlcywgdW5zaWduZWQsIGxlKSB7XG4gICAgcmV0dXJuIGxlID8gTG9uZy5mcm9tQnl0ZXNMRShieXRlcywgdW5zaWduZWQpIDogTG9uZy5mcm9tQnl0ZXNCRShieXRlcywgdW5zaWduZWQpO1xuICB9O1xuICAvKipcbiAgICogQ3JlYXRlcyBhIExvbmcgZnJvbSBpdHMgbGl0dGxlIGVuZGlhbiBieXRlIHJlcHJlc2VudGF0aW9uLlxuICAgKiBAcGFyYW0geyFBcnJheS48bnVtYmVyPn0gYnl0ZXMgTGl0dGxlIGVuZGlhbiBieXRlIHJlcHJlc2VudGF0aW9uXG4gICAqIEBwYXJhbSB7Ym9vbGVhbj19IHVuc2lnbmVkIFdoZXRoZXIgdW5zaWduZWQgb3Igbm90LCBkZWZhdWx0cyB0byBzaWduZWRcbiAgICogQHJldHVybnMge0xvbmd9IFRoZSBjb3JyZXNwb25kaW5nIExvbmcgdmFsdWVcbiAgICovXG4gIFxuICBcbiAgTG9uZy5mcm9tQnl0ZXNMRSA9IGZ1bmN0aW9uIGZyb21CeXRlc0xFKGJ5dGVzLCB1bnNpZ25lZCkge1xuICAgIHJldHVybiBuZXcgTG9uZyhieXRlc1swXSB8IGJ5dGVzWzFdIDw8IDggfCBieXRlc1syXSA8PCAxNiB8IGJ5dGVzWzNdIDw8IDI0LCBieXRlc1s0XSB8IGJ5dGVzWzVdIDw8IDggfCBieXRlc1s2XSA8PCAxNiB8IGJ5dGVzWzddIDw8IDI0LCB1bnNpZ25lZCk7XG4gIH07XG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgTG9uZyBmcm9tIGl0cyBiaWcgZW5kaWFuIGJ5dGUgcmVwcmVzZW50YXRpb24uXG4gICAqIEBwYXJhbSB7IUFycmF5LjxudW1iZXI+fSBieXRlcyBCaWcgZW5kaWFuIGJ5dGUgcmVwcmVzZW50YXRpb25cbiAgICogQHBhcmFtIHtib29sZWFuPX0gdW5zaWduZWQgV2hldGhlciB1bnNpZ25lZCBvciBub3QsIGRlZmF1bHRzIHRvIHNpZ25lZFxuICAgKiBAcmV0dXJucyB7TG9uZ30gVGhlIGNvcnJlc3BvbmRpbmcgTG9uZyB2YWx1ZVxuICAgKi9cbiAgXG4gIFxuICBMb25nLmZyb21CeXRlc0JFID0gZnVuY3Rpb24gZnJvbUJ5dGVzQkUoYnl0ZXMsIHVuc2lnbmVkKSB7XG4gICAgcmV0dXJuIG5ldyBMb25nKGJ5dGVzWzRdIDw8IDI0IHwgYnl0ZXNbNV0gPDwgMTYgfCBieXRlc1s2XSA8PCA4IHwgYnl0ZXNbN10sIGJ5dGVzWzBdIDw8IDI0IHwgYnl0ZXNbMV0gPDwgMTYgfCBieXRlc1syXSA8PCA4IHwgYnl0ZXNbM10sIHVuc2lnbmVkKTtcbiAgfTtcbiAgXG4gIHZhciBfZGVmYXVsdCA9IExvbmc7XG4gIGV4cG9ydHMuZGVmYXVsdCA9IF9kZWZhdWx0O1xuICByZXR1cm4gXCJkZWZhdWx0XCIgaW4gZXhwb3J0cyA/IGV4cG9ydHMuZGVmYXVsdCA6IGV4cG9ydHM7XG59KSh7fSk7XG5pZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSBkZWZpbmUoW10sIGZ1bmN0aW9uKCkgeyByZXR1cm4gTG9uZzsgfSk7XG5lbHNlIGlmICh0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIG1vZHVsZS5leHBvcnRzID0gTG9uZztcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuX193ZWJwYWNrX3JlcXVpcmVfXy5uID0gKG1vZHVsZSkgPT4ge1xuXHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cblx0XHQoKSA9PiAobW9kdWxlWydkZWZhdWx0J10pIDpcblx0XHQoKSA9PiAobW9kdWxlKTtcblx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgeyBhOiBnZXR0ZXIgfSk7XG5cdHJldHVybiBnZXR0ZXI7XG59OyIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJcbmNvbnN0IGFwaSA9IHJlcXVpcmUoJ0B0ZW1wb3JhbGlvL3dvcmtmbG93L2xpYi93b3JrZXItaW50ZXJmYWNlLmpzJyk7XG5leHBvcnRzLmFwaSA9IGFwaTtcblxuY29uc3QgeyBvdmVycmlkZUdsb2JhbHMgfSA9IHJlcXVpcmUoJ0B0ZW1wb3JhbGlvL3dvcmtmbG93L2xpYi9nbG9iYWwtb3ZlcnJpZGVzLmpzJyk7XG5vdmVycmlkZUdsb2JhbHMoKTtcblxuZXhwb3J0cy5pbXBvcnRXb3JrZmxvd3MgPSBmdW5jdGlvbiBpbXBvcnRXb3JrZmxvd3MoKSB7XG4gIHJldHVybiByZXF1aXJlKC8qIHdlYnBhY2tNb2RlOiBcImVhZ2VyXCIgKi8gXCIvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS9yb2Job2xsYW5kL2ZpbmFuY2UtZGVtby93b3JrZmxvd3Mvc3JjL3NjZW5hcmlvLTEwLnRzXCIpO1xufVxuXG5leHBvcnRzLmltcG9ydEludGVyY2VwdG9ycyA9IGZ1bmN0aW9uIGltcG9ydEludGVyY2VwdG9ycygpIHtcbiAgcmV0dXJuIFtcbiAgICBcbiAgXTtcbn1cbiJdLCJuYW1lcyI6WyJwcm94eUFjdGl2aXRpZXMiLCJwcm94eUxvY2FsQWN0aXZpdGllcyIsInNsZWVwIiwidGVtcG9yYWxTbGVlcCIsImNoYXJnZUNhcmQiLCJyZXNlcnZlU3RvY2siLCJzaGlwSXRlbSIsInNlbmRSZWNlaXB0Iiwic2VuZENoYXJnZUZhaWx1cmVFbWFpbCIsInNlbmRSZXZpZXdSZXF1ZXN0Iiwic3RhcnRUb0Nsb3NlVGltZW91dCIsInJldHJ5IiwiaW5pdGlhbEludGVydmFsIiwiYmFja29mZkNvZWZmaWNpZW50IiwicGVuZGluZ1NsZWVwIiwiY29tcGxldGVTbGVlcCIsImR1cmF0aW9uIiwiUHVyY2hhc2VXb3JrZmxvdyIsImlucHV0IiwiY3VzdG9tZXJFbWFpbCIsInByb2R1Y3ROYW1lIiwiYW1vdW50Iiwic2hpcHBpbmdBZGRyZXNzIiwiZXJyb3IiXSwic291cmNlUm9vdCI6IiJ9