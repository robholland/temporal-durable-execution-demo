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

/***/ "./src/scenario-3.ts":
/*!***************************!*\
  !*** ./src/scenario-3.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   PurchaseWorkflow: () => (/* binding */ PurchaseWorkflow)
/* harmony export */ });
/* harmony import */ var _temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @temporalio/workflow */ "./node_modules/@temporalio/workflow/lib/index.js");
/* harmony import */ var _temporalio_workflow__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__);

const { chargeCard, reserveStock, shipItem, sendReceipt, sendChargeFailureEmail } = (0,_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.proxyActivities)({
    startToCloseTimeout: '5 seconds',
    retry: {
        maximumAttempts: 1
    }
});
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
/*!*****************************************************!*\
  !*** ./src/scenario-3-autogenerated-entrypoint.cjs ***!
  \*****************************************************/

const api = __webpack_require__(/*! @temporalio/workflow/lib/worker-interface.js */ "./node_modules/@temporalio/workflow/lib/worker-interface.js");
exports.api = api;

const { overrideGlobals } = __webpack_require__(/*! @temporalio/workflow/lib/global-overrides.js */ "./node_modules/@temporalio/workflow/lib/global-overrides.js");
overrideGlobals();

exports.importWorkflows = function importWorkflows() {
  return __webpack_require__(/* webpackMode: "eager" */ /*! ./src/scenario-3.ts */ "./src/scenario-3.ts");
}

exports.importInterceptors = function importInterceptors() {
  return [
    
  ];
}

})();

__TEMPORAL__ = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2Zsb3ctYnVuZGxlLTVmYjAzNDlkZTk0NzNjMTQ4YjY1LmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBRUEsMEhBQThDO0FBSTlDLDBFQUEwRTtBQUMxRSxpRUFBaUU7QUFDakUsSUFBWSx3QkFJWDtBQUpELFdBQVksd0JBQXdCO0lBQ2xDLG1GQUFjO0lBQ2QscUhBQStCO0lBQy9CLDZFQUFXO0FBQ2IsQ0FBQyxFQUpXLHdCQUF3Qix3Q0FBeEIsd0JBQXdCLFFBSW5DO0FBRUQsK0JBQVksR0FBZ0YsQ0FBQztBQUM3RiwrQkFBWSxHQUFnRixDQUFDOzs7Ozs7Ozs7Ozs7Ozs7QUNmN0YsbUpBQWdGO0FBRWhGLG1KQUFnRjtBQTREaEY7Ozs7R0FJRztBQUNVLCtCQUF1QixHQUFxQixJQUFJLDJDQUF1QixFQUFFLENBQUM7QUFFdkY7O0dBRUc7QUFDVSw0QkFBb0IsR0FBd0I7SUFDdkQsZ0JBQWdCLEVBQUUsMkNBQXVCO0lBQ3pDLGdCQUFnQixFQUFFLCtCQUF1QjtJQUN6QyxhQUFhLEVBQUUsRUFBRTtDQUNsQixDQUFDOzs7Ozs7Ozs7Ozs7Ozs7QUM1RUYsNEdBYW9CO0FBQ3BCLDJIQUEwQztBQUMxQyxtR0FBeUM7QUFDekMsbUpBQTJHO0FBRTNHLFNBQVMsYUFBYSxDQUFDLEdBQUcsT0FBaUI7SUFDekMsT0FBTyxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3JFLENBQUM7QUFFRDs7R0FFRztBQUNILE1BQU0scUJBQXFCLEdBQUcsYUFBYTtBQUN6Qyx5QkFBeUI7QUFDekIsdUZBQXVGO0FBQ3ZGLDBCQUEwQjtBQUMxQixrR0FBa0c7QUFDbEcsdUNBQXVDO0FBQ3ZDLDJEQUEyRCxDQUM1RCxDQUFDO0FBRUY7OztHQUdHO0FBQ0gsTUFBTSw2QkFBNkIsR0FBRyxhQUFh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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWixlQUFlO0FBQ2Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1osZUFBZTtBQUNmO0FBQ0E7QUFD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QixTQUFTLG1CQUFPLDRCQUE0QixnREFBNEY7QUFDeEk7O0FBRUEsMEJBQTBCO0FBQzFCO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlcyI6WyIvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS9yb2Job2xsYW5kL2ZpbmFuY2UtZGVtby93b3JrZmxvd3Mvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL2NvbW1vbi9zcmMvYWN0aXZpdHktb3B0aW9ucy50cyIsIi9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3JvYmhvbGxhbmQvZmluYW5jZS1kZW1vL3dvcmtmbG93cy9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vY29tbW9uL3NyYy9jb252ZXJ0ZXIvZGF0YS1jb252ZXJ0ZXIudHMiLCIvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS9yb2Job2xsYW5kL2ZpbmFuY2UtZGVtby93b3JrZmxvd3Mvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL2NvbW1vbi9zcmMvY29udmVydGVyL2ZhaWx1cmUtY29udmVydGVyLnRzIiwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vcm9iaG9sbGFuZC9maW5hbmNlLWRlbW8vd29ya2Zsb3dzL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby9jb21tb24vc3JjL2NvbnZlcnRlci9wYXlsb2FkLWNvZGVjLnRzIiwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vcm9iaG9sbGFuZC9maW5hbmNlLWRlbW8vd29ya2Zsb3dzL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby9jb21tb24vc3JjL2NvbnZlcnRlci9wYXlsb2FkLWNvbnZlcnRlci50cyIsIi9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3JvYmhvbGxhbmQvZmluYW5jZS1kZW1vL3dvcmtmbG93cy9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vY29tbW9uL3NyYy9jb252ZXJ0ZXIvdHlwZXMudHMiLCIvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS9yb2Job2xsYW5kL2ZpbmFuY2UtZGVtby93b3JrZmxvd3Mvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL2NvbW1vbi9zcmMvZGVwcmVjYXRlZC10aW1lLnRzIiwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vcm9iaG9sbGFuZC9maW5hbmNlLWRlbW8vd29ya2Zsb3dzL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby9jb21tb24vc3JjL2VuY29kaW5nLnRzIiwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vcm9iaG9sbGFuZC9maW5hbmNlLWRlbW8vd29ya2Zsb3dzL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby9jb21tb24vc3JjL2Vycm9ycy50cyIsIi9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3JvYmhvbGxhbmQvZmluYW5jZS1kZW1vL3dvcmtmbG93cy9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vY29tbW9uL3NyYy9mYWlsdXJlLnRzIiwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vcm9iaG9sbGFuZC9maW5hbmNlLWRlbW8vd29ya2Zsb3dzL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby9jb21tb24vc3JjL2luZGV4LnRzIiwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vcm9iaG9sbGFuZC9maW5hbmNlLWRlbW8vd29ya2Zsb3dzL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby9jb21tb24vc3JjL2ludGVyY2VwdG9ycy50cyIsIi9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3JvYmhvbGxhbmQvZmluYW5jZS1kZW1vL3dvcmtmbG93cy9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vY29tbW9uL3NyYy9pbnRlcmZhY2VzLnRzIiwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vcm9iaG9sbGFuZC9maW5hbmNlLWRlbW8vd29ya2Zsb3dzL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby9jb21tb24vc3JjL2xvZ2dlci50cyIsIi9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3JvYmhvbGxhbmQvZmluYW5jZS1kZW1vL3dvcmtmbG93cy9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vY29tbW9uL3NyYy9yZXRyeS1wb2xpY3kudHMiLCIvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS9yb2Job2xsYW5kL2ZpbmFuY2UtZGVtby93b3JrZmxvd3Mvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL2NvbW1vbi9zcmMvdGltZS50cyIsIi9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3JvYmhvbGxhbmQvZmluYW5jZS1kZW1vL3dvcmtmbG93cy9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vY29tbW9uL3NyYy90eXBlLWhlbHBlcnMudHMiLCIvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS9yb2Job2xsYW5kL2ZpbmFuY2UtZGVtby93b3JrZmxvd3Mvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL2NvbW1vbi9zcmMvdmVyc2lvbmluZy1pbnRlbnQtZW51bS50cyIsIi9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3JvYmhvbGxhbmQvZmluYW5jZS1kZW1vL3dvcmtmbG93cy9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vY29tbW9uL3NyYy92ZXJzaW9uaW5nLWludGVudC50cyIsIi9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3JvYmhvbGxhbmQvZmluYW5jZS1kZW1vL3dvcmtmbG93cy9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vY29tbW9uL3NyYy93b3JrZmxvdy1oYW5kbGUudHMiLCIvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS9yb2Job2xsYW5kL2ZpbmFuY2UtZGVtby93b3JrZmxvd3Mvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL2NvbW1vbi9zcmMvd29ya2Zsb3ctb3B0aW9ucy50cyIsIi9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3JvYmhvbGxhbmQvZmluYW5jZS1kZW1vL3dvcmtmbG93cy9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vd29ya2Zsb3cvc3JjL2FsZWEudHMiLCIvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS9yb2Job2xsYW5kL2ZpbmFuY2UtZGVtby93b3JrZmxvd3Mvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL3dvcmtmbG93L3NyYy9jYW5jZWxsYXRpb24tc2NvcGUudHMiLCIvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS9yb2Job2xsYW5kL2ZpbmFuY2UtZGVtby93b3JrZmxvd3Mvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL3dvcmtmbG93L3NyYy9lcnJvcnMudHMiLCIvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS9yb2Job2xsYW5kL2ZpbmFuY2UtZGVtby93b3JrZmxvd3Mvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL3dvcmtmbG93L3NyYy9mbGFncy50cyIsIi9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3JvYmhvbGxhbmQvZmluYW5jZS1kZW1vL3dvcmtmbG93cy9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vd29ya2Zsb3cvc3JjL2dsb2JhbC1hdHRyaWJ1dGVzLnRzIiwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vcm9iaG9sbGFuZC9maW5hbmNlLWRlbW8vd29ya2Zsb3dzL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby93b3JrZmxvdy9zcmMvZ2xvYmFsLW92ZXJyaWRlcy50cyIsIi9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3JvYmhvbGxhbmQvZmluYW5jZS1kZW1vL3dvcmtmbG93cy9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vd29ya2Zsb3cvc3JjL2luZGV4LnRzIiwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vcm9iaG9sbGFuZC9maW5hbmNlLWRlbW8vd29ya2Zsb3dzL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby93b3JrZmxvdy9zcmMvaW50ZXJjZXB0b3JzLnRzIiwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vcm9iaG9sbGFuZC9maW5hbmNlLWRlbW8vd29ya2Zsb3dzL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby93b3JrZmxvdy9zcmMvaW50ZXJmYWNlcy50cyIsIi9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3JvYmhvbGxhbmQvZmluYW5jZS1kZW1vL3dvcmtmbG93cy9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vd29ya2Zsb3cvc3JjL2ludGVybmFscy50cyIsIi9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3JvYmhvbGxhbmQvZmluYW5jZS1kZW1vL3dvcmtmbG93cy9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vd29ya2Zsb3cvc3JjL2xvZ3MudHMiLCIvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS9yb2Job2xsYW5kL2ZpbmFuY2UtZGVtby93b3JrZmxvd3Mvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL3dvcmtmbG93L3NyYy9wa2cudHMiLCIvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS9yb2Job2xsYW5kL2ZpbmFuY2UtZGVtby93b3JrZmxvd3Mvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL3dvcmtmbG93L3NyYy9zaW5rcy50cyIsIi9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3JvYmhvbGxhbmQvZmluYW5jZS1kZW1vL3dvcmtmbG93cy9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vd29ya2Zsb3cvc3JjL3N0YWNrLWhlbHBlcnMudHMiLCIvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS9yb2Job2xsYW5kL2ZpbmFuY2UtZGVtby93b3JrZmxvd3Mvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL3dvcmtmbG93L3NyYy90cmlnZ2VyLnRzIiwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vcm9iaG9sbGFuZC9maW5hbmNlLWRlbW8vd29ya2Zsb3dzL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby93b3JrZmxvdy9zcmMvdXBkYXRlLXNjb3BlLnRzIiwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vcm9iaG9sbGFuZC9maW5hbmNlLWRlbW8vd29ya2Zsb3dzL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby93b3JrZmxvdy9zcmMvd29ya2VyLWludGVyZmFjZS50cyIsIi9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3JvYmhvbGxhbmQvZmluYW5jZS1kZW1vL3dvcmtmbG93cy9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vd29ya2Zsb3cvc3JjL3dvcmtmbG93LnRzIiwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vcm9iaG9sbGFuZC9maW5hbmNlLWRlbW8vd29ya2Zsb3dzL3NyYy9zY2VuYXJpby0zLnRzIiwiaWdub3JlZHwvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS9yb2Job2xsYW5kL2ZpbmFuY2UtZGVtby93b3JrZmxvd3Mvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL3dvcmtmbG93L2xpYnxfX3RlbXBvcmFsX2N1c3RvbV9mYWlsdXJlX2NvbnZlcnRlciIsImlnbm9yZWR8L1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vcm9iaG9sbGFuZC9maW5hbmNlLWRlbW8vd29ya2Zsb3dzL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby93b3JrZmxvdy9saWJ8X190ZW1wb3JhbF9jdXN0b21fcGF5bG9hZF9jb252ZXJ0ZXIiLCIvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS9yb2Job2xsYW5kL2ZpbmFuY2UtZGVtby93b3JrZmxvd3Mvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL2NvbW1vbi9ub2RlX21vZHVsZXMvbXMvZGlzdC9pbmRleC5janMiLCIvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS9yb2Job2xsYW5kL2ZpbmFuY2UtZGVtby93b3JrZmxvd3Mvbm9kZV9tb2R1bGVzL2xvbmcvdW1kL2luZGV4LmpzIiwid2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrL3J1bnRpbWUvY29tcGF0IGdldCBkZWZhdWx0IGV4cG9ydCIsIndlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0IiwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vcm9iaG9sbGFuZC9maW5hbmNlLWRlbW8vd29ya2Zsb3dzL3NyYy9zY2VuYXJpby0zLWF1dG9nZW5lcmF0ZWQtZW50cnlwb2ludC5janMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBjb3Jlc2RrIH0gZnJvbSAnQHRlbXBvcmFsaW8vcHJvdG8nO1xuaW1wb3J0IHsgUmV0cnlQb2xpY3kgfSBmcm9tICcuL3JldHJ5LXBvbGljeSc7XG5pbXBvcnQgeyBjaGVja0V4dGVuZHMgfSBmcm9tICcuL3R5cGUtaGVscGVycyc7XG5pbXBvcnQgeyBEdXJhdGlvbiB9IGZyb20gJy4vdGltZSc7XG5pbXBvcnQgeyBWZXJzaW9uaW5nSW50ZW50IH0gZnJvbSAnLi92ZXJzaW9uaW5nLWludGVudCc7XG5cbi8vIEF2b2lkIGltcG9ydGluZyB0aGUgcHJvdG8gaW1wbGVtZW50YXRpb24gdG8gcmVkdWNlIHdvcmtmbG93IGJ1bmRsZSBzaXplXG4vLyBDb3BpZWQgZnJvbSBjb3Jlc2RrLndvcmtmbG93X2NvbW1hbmRzLkFjdGl2aXR5Q2FuY2VsbGF0aW9uVHlwZVxuZXhwb3J0IGVudW0gQWN0aXZpdHlDYW5jZWxsYXRpb25UeXBlIHtcbiAgVFJZX0NBTkNFTCA9IDAsXG4gIFdBSVRfQ0FOQ0VMTEFUSU9OX0NPTVBMRVRFRCA9IDEsXG4gIEFCQU5ET04gPSAyLFxufVxuXG5jaGVja0V4dGVuZHM8Y29yZXNkay53b3JrZmxvd19jb21tYW5kcy5BY3Rpdml0eUNhbmNlbGxhdGlvblR5cGUsIEFjdGl2aXR5Q2FuY2VsbGF0aW9uVHlwZT4oKTtcbmNoZWNrRXh0ZW5kczxBY3Rpdml0eUNhbmNlbGxhdGlvblR5cGUsIGNvcmVzZGsud29ya2Zsb3dfY29tbWFuZHMuQWN0aXZpdHlDYW5jZWxsYXRpb25UeXBlPigpO1xuXG4vKipcbiAqIE9wdGlvbnMgZm9yIHJlbW90ZSBhY3Rpdml0eSBpbnZvY2F0aW9uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQWN0aXZpdHlPcHRpb25zIHtcbiAgLyoqXG4gICAqIElkZW50aWZpZXIgdG8gdXNlIGZvciB0cmFja2luZyB0aGUgYWN0aXZpdHkgaW4gV29ya2Zsb3cgaGlzdG9yeS5cbiAgICogVGhlIGBhY3Rpdml0eUlkYCBjYW4gYmUgYWNjZXNzZWQgYnkgdGhlIGFjdGl2aXR5IGZ1bmN0aW9uLlxuICAgKiBEb2VzIG5vdCBuZWVkIHRvIGJlIHVuaXF1ZS5cbiAgICpcbiAgICogQGRlZmF1bHQgYW4gaW5jcmVtZW50YWwgc2VxdWVuY2UgbnVtYmVyXG4gICAqL1xuICBhY3Rpdml0eUlkPzogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBUYXNrIHF1ZXVlIG5hbWUuXG4gICAqXG4gICAqIEBkZWZhdWx0IGN1cnJlbnQgd29ya2VyIHRhc2sgcXVldWVcbiAgICovXG4gIHRhc2tRdWV1ZT86IHN0cmluZztcblxuICAvKipcbiAgICogSGVhcnRiZWF0IGludGVydmFsLiBBY3Rpdml0eSBtdXN0IGhlYXJ0YmVhdCBiZWZvcmUgdGhpcyBpbnRlcnZhbCBwYXNzZXMgYWZ0ZXIgYSBsYXN0IGhlYXJ0YmVhdCBvciBhY3Rpdml0eSBzdGFydC5cbiAgICogQGZvcm1hdCBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIG9yIHtAbGluayBodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9tcyB8IG1zLWZvcm1hdHRlZCBzdHJpbmd9XG4gICAqL1xuICBoZWFydGJlYXRUaW1lb3V0PzogRHVyYXRpb247XG5cbiAgLyoqXG4gICAqIFJldHJ5UG9saWN5IHRoYXQgZGVmaW5lIGhvdyBhY3Rpdml0eSBpcyByZXRyaWVkIGluIGNhc2Ugb2YgZmFpbHVyZS4gSWYgdGhpcyBpcyBub3Qgc2V0LCB0aGVuIHRoZSBzZXJ2ZXItZGVmaW5lZCBkZWZhdWx0IGFjdGl2aXR5IHJldHJ5IHBvbGljeSB3aWxsIGJlIHVzZWQuIFRvIGVuc3VyZSB6ZXJvIHJldHJpZXMsIHNldCBtYXhpbXVtIGF0dGVtcHRzIHRvIDEuXG4gICAqL1xuICByZXRyeT86IFJldHJ5UG9saWN5O1xuXG4gIC8qKlxuICAgKiBNYXhpbXVtIHRpbWUgb2YgYSBzaW5nbGUgQWN0aXZpdHkgZXhlY3V0aW9uIGF0dGVtcHQuIE5vdGUgdGhhdCB0aGUgVGVtcG9yYWwgU2VydmVyIGRvZXNuJ3QgZGV0ZWN0IFdvcmtlciBwcm9jZXNzXG4gICAqIGZhaWx1cmVzIGRpcmVjdGx5OiBpbnN0ZWFkLCBpdCByZWxpZXMgb24gdGhpcyB0aW1lb3V0IHRvIGRldGVjdCB0aGF0IGFuIEFjdGl2aXR5IGRpZG4ndCBjb21wbGV0ZSBvbiB0aW1lLiBUaGVyZWZvcmUsIHRoaXNcbiAgICogdGltZW91dCBzaG91bGQgYmUgYXMgc2hvcnQgYXMgdGhlIGxvbmdlc3QgcG9zc2libGUgZXhlY3V0aW9uIG9mIHRoZSBBY3Rpdml0eSBib2R5LiBQb3RlbnRpYWxseSBsb25nLXJ1bm5pbmdcbiAgICogQWN0aXZpdGllcyBtdXN0IHNwZWNpZnkge0BsaW5rIGhlYXJ0YmVhdFRpbWVvdXR9IGFuZCBjYWxsIHtAbGluayBhY3Rpdml0eS5Db250ZXh0LmhlYXJ0YmVhdH0gcGVyaW9kaWNhbGx5IGZvclxuICAgKiB0aW1lbHkgZmFpbHVyZSBkZXRlY3Rpb24uXG4gICAqXG4gICAqIEVpdGhlciB0aGlzIG9wdGlvbiBvciB7QGxpbmsgc2NoZWR1bGVUb0Nsb3NlVGltZW91dH0gaXMgcmVxdWlyZWQuXG4gICAqXG4gICAqIEBkZWZhdWx0IGBzY2hlZHVsZVRvQ2xvc2VUaW1lb3V0YCBvciB1bmxpbWl0ZWRcbiAgICogQGZvcm1hdCBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIG9yIHtAbGluayBodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9tcyB8IG1zLWZvcm1hdHRlZCBzdHJpbmd9XG4gICAqL1xuICBzdGFydFRvQ2xvc2VUaW1lb3V0PzogRHVyYXRpb247XG5cbiAgLyoqXG4gICAqIFRpbWUgdGhhdCB0aGUgQWN0aXZpdHkgVGFzayBjYW4gc3RheSBpbiB0aGUgVGFzayBRdWV1ZSBiZWZvcmUgaXQgaXMgcGlja2VkIHVwIGJ5IGEgV29ya2VyLiBEbyBub3Qgc3BlY2lmeSB0aGlzIHRpbWVvdXQgdW5sZXNzIHVzaW5nIGhvc3Qtc3BlY2lmaWMgVGFzayBRdWV1ZXMgZm9yIEFjdGl2aXR5IFRhc2tzIGFyZSBiZWluZyB1c2VkIGZvciByb3V0aW5nLlxuICAgKiBgc2NoZWR1bGVUb1N0YXJ0VGltZW91dGAgaXMgYWx3YXlzIG5vbi1yZXRyeWFibGUuIFJldHJ5aW5nIGFmdGVyIHRoaXMgdGltZW91dCBkb2Vzbid0IG1ha2Ugc2Vuc2UgYXMgaXQgd291bGQganVzdCBwdXQgdGhlIEFjdGl2aXR5IFRhc2sgYmFjayBpbnRvIHRoZSBzYW1lIFRhc2sgUXVldWUuXG4gICAqXG4gICAqIEBkZWZhdWx0IGBzY2hlZHVsZVRvQ2xvc2VUaW1lb3V0YCBvciB1bmxpbWl0ZWRcbiAgICogQGZvcm1hdCBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIG9yIHtAbGluayBodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9tcyB8IG1zLWZvcm1hdHRlZCBzdHJpbmd9XG4gICAqL1xuICBzY2hlZHVsZVRvU3RhcnRUaW1lb3V0PzogRHVyYXRpb247XG5cbiAgLyoqXG4gICAqIFRvdGFsIHRpbWUgdGhhdCBhIHdvcmtmbG93IGlzIHdpbGxpbmcgdG8gd2FpdCBmb3IgdGhlIEFjdGl2aXR5IHRvIGNvbXBsZXRlLlxuICAgKiBgc2NoZWR1bGVUb0Nsb3NlVGltZW91dGAgbGltaXRzIHRoZSB0b3RhbCB0aW1lIG9mIGFuIEFjdGl2aXR5J3MgZXhlY3V0aW9uIGluY2x1ZGluZyByZXRyaWVzICh1c2Uge0BsaW5rIHN0YXJ0VG9DbG9zZVRpbWVvdXR9IHRvIGxpbWl0IHRoZSB0aW1lIG9mIGEgc2luZ2xlIGF0dGVtcHQpLlxuICAgKlxuICAgKiBFaXRoZXIgdGhpcyBvcHRpb24gb3Ige0BsaW5rIHN0YXJ0VG9DbG9zZVRpbWVvdXR9IGlzIHJlcXVpcmVkLlxuICAgKlxuICAgKiBAZGVmYXVsdCB1bmxpbWl0ZWRcbiAgICogQGZvcm1hdCBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIG9yIHtAbGluayBodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9tcyB8IG1zLWZvcm1hdHRlZCBzdHJpbmd9XG4gICAqL1xuICBzY2hlZHVsZVRvQ2xvc2VUaW1lb3V0PzogRHVyYXRpb247XG5cbiAgLyoqXG4gICAqIERldGVybWluZXMgd2hhdCB0aGUgU0RLIGRvZXMgd2hlbiB0aGUgQWN0aXZpdHkgaXMgY2FuY2VsbGVkLlxuICAgKiAtIGBUUllfQ0FOQ0VMYCAtIEluaXRpYXRlIGEgY2FuY2VsbGF0aW9uIHJlcXVlc3QgYW5kIGltbWVkaWF0ZWx5IHJlcG9ydCBjYW5jZWxsYXRpb24gdG8gdGhlIHdvcmtmbG93LlxuICAgKiAtIGBXQUlUX0NBTkNFTExBVElPTl9DT01QTEVURURgIC0gV2FpdCBmb3IgYWN0aXZpdHkgY2FuY2VsbGF0aW9uIGNvbXBsZXRpb24uIE5vdGUgdGhhdCBhY3Rpdml0eSBtdXN0IGhlYXJ0YmVhdCB0byByZWNlaXZlIGFcbiAgICogICBjYW5jZWxsYXRpb24gbm90aWZpY2F0aW9uLiBUaGlzIGNhbiBibG9jayB0aGUgY2FuY2VsbGF0aW9uIGZvciBhIGxvbmcgdGltZSBpZiBhY3Rpdml0eSBkb2Vzbid0XG4gICAqICAgaGVhcnRiZWF0IG9yIGNob29zZXMgdG8gaWdub3JlIHRoZSBjYW5jZWxsYXRpb24gcmVxdWVzdC5cbiAgICogLSBgQUJBTkRPTmAgLSBEbyBub3QgcmVxdWVzdCBjYW5jZWxsYXRpb24gb2YgdGhlIGFjdGl2aXR5IGFuZCBpbW1lZGlhdGVseSByZXBvcnQgY2FuY2VsbGF0aW9uIHRvIHRoZSB3b3JrZmxvdy5cbiAgICovXG4gIGNhbmNlbGxhdGlvblR5cGU/OiBBY3Rpdml0eUNhbmNlbGxhdGlvblR5cGU7XG5cbiAgLyoqXG4gICAqIEVhZ2VyIGRpc3BhdGNoIGlzIGFuIG9wdGltaXphdGlvbiB0aGF0IGltcHJvdmVzIHRoZSB0aHJvdWdocHV0IGFuZCBsb2FkIG9uIHRoZSBzZXJ2ZXIgZm9yIHNjaGVkdWxpbmcgQWN0aXZpdGllcy5cbiAgICogV2hlbiB1c2VkLCB0aGUgc2VydmVyIHdpbGwgaGFuZCBvdXQgQWN0aXZpdHkgdGFza3MgYmFjayB0byB0aGUgV29ya2VyIHdoZW4gaXQgY29tcGxldGVzIGEgV29ya2Zsb3cgdGFzay5cbiAgICogSXQgaXMgYXZhaWxhYmxlIGZyb20gc2VydmVyIHZlcnNpb24gMS4xNyBiZWhpbmQgdGhlIGBzeXN0ZW0uZW5hYmxlQWN0aXZpdHlFYWdlckV4ZWN1dGlvbmAgZmVhdHVyZSBmbGFnLlxuICAgKlxuICAgKiBFYWdlciBkaXNwYXRjaCB3aWxsIG9ubHkgYmUgdXNlZCBpZiBgYWxsb3dFYWdlckRpc3BhdGNoYCBpcyBlbmFibGVkICh0aGUgZGVmYXVsdCkgYW5kIHtAbGluayB0YXNrUXVldWV9IGlzIGVpdGhlclxuICAgKiBvbWl0dGVkIG9yIHRoZSBzYW1lIGFzIHRoZSBjdXJyZW50IFdvcmtmbG93LlxuICAgKlxuICAgKiBAZGVmYXVsdCB0cnVlXG4gICAqL1xuICBhbGxvd0VhZ2VyRGlzcGF0Y2g/OiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBXaGVuIHVzaW5nIHRoZSBXb3JrZXIgVmVyc2lvbmluZyBmZWF0dXJlLCBzcGVjaWZpZXMgd2hldGhlciB0aGlzIEFjdGl2aXR5IHNob3VsZCBydW4gb24gYVxuICAgKiB3b3JrZXIgd2l0aCBhIGNvbXBhdGlibGUgQnVpbGQgSWQgb3Igbm90LiBTZWUge0BsaW5rIFZlcnNpb25pbmdJbnRlbnR9LlxuICAgKlxuICAgKiBAZGVmYXVsdCAnQ09NUEFUSUJMRSdcbiAgICpcbiAgICogQGV4cGVyaW1lbnRhbFxuICAgKi9cbiAgdmVyc2lvbmluZ0ludGVudD86IFZlcnNpb25pbmdJbnRlbnQ7XG59XG5cbi8qKlxuICogT3B0aW9ucyBmb3IgbG9jYWwgYWN0aXZpdHkgaW52b2NhdGlvblxuICovXG5leHBvcnQgaW50ZXJmYWNlIExvY2FsQWN0aXZpdHlPcHRpb25zIHtcbiAgLyoqXG4gICAqIFJldHJ5UG9saWN5IHRoYXQgZGVmaW5lcyBob3cgYW4gYWN0aXZpdHkgaXMgcmV0cmllZCBpbiBjYXNlIG9mIGZhaWx1cmUuIElmIHRoaXMgaXMgbm90IHNldCwgdGhlbiB0aGUgU0RLLWRlZmluZWQgZGVmYXVsdCBhY3Rpdml0eSByZXRyeSBwb2xpY3kgd2lsbCBiZSB1c2VkLlxuICAgKiBOb3RlIHRoYXQgbG9jYWwgYWN0aXZpdGllcyBhcmUgYWx3YXlzIGV4ZWN1dGVkIGF0IGxlYXN0IG9uY2UsIGV2ZW4gaWYgbWF4aW11bSBhdHRlbXB0cyBpcyBzZXQgdG8gMSBkdWUgdG8gV29ya2Zsb3cgdGFzayByZXRyaWVzLlxuICAgKi9cbiAgcmV0cnk/OiBSZXRyeVBvbGljeTtcblxuICAvKipcbiAgICogTWF4aW11bSB0aW1lIHRoZSBsb2NhbCBhY3Rpdml0eSBpcyBhbGxvd2VkIHRvIGV4ZWN1dGUgYWZ0ZXIgdGhlIHRhc2sgaXMgZGlzcGF0Y2hlZC4gVGhpc1xuICAgKiB0aW1lb3V0IGlzIGFsd2F5cyByZXRyeWFibGUuXG4gICAqXG4gICAqIEVpdGhlciB0aGlzIG9wdGlvbiBvciB7QGxpbmsgc2NoZWR1bGVUb0Nsb3NlVGltZW91dH0gaXMgcmVxdWlyZWQuXG4gICAqIElmIHNldCwgdGhpcyBtdXN0IGJlIDw9IHtAbGluayBzY2hlZHVsZVRvQ2xvc2VUaW1lb3V0fSwgb3RoZXJ3aXNlLCBpdCB3aWxsIGJlIGNsYW1wZWQgZG93bi5cbiAgICpcbiAgICogQGZvcm1hdCBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIG9yIHtAbGluayBodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9tcyB8IG1zLWZvcm1hdHRlZCBzdHJpbmd9XG4gICAqL1xuICBzdGFydFRvQ2xvc2VUaW1lb3V0PzogRHVyYXRpb247XG5cbiAgLyoqXG4gICAqIExpbWl0cyB0aW1lIHRoZSBsb2NhbCBhY3Rpdml0eSBjYW4gaWRsZSBpbnRlcm5hbGx5IGJlZm9yZSBiZWluZyBleGVjdXRlZC4gVGhhdCBjYW4gaGFwcGVuIGlmXG4gICAqIHRoZSB3b3JrZXIgaXMgY3VycmVudGx5IGF0IG1heCBjb25jdXJyZW50IGxvY2FsIGFjdGl2aXR5IGV4ZWN1dGlvbnMuIFRoaXMgdGltZW91dCBpcyBhbHdheXNcbiAgICogbm9uIHJldHJ5YWJsZSBhcyBhbGwgYSByZXRyeSB3b3VsZCBhY2hpZXZlIGlzIHRvIHB1dCBpdCBiYWNrIGludG8gdGhlIHNhbWUgcXVldWUuIERlZmF1bHRzXG4gICAqIHRvIHtAbGluayBzY2hlZHVsZVRvQ2xvc2VUaW1lb3V0fSBpZiBub3Qgc3BlY2lmaWVkIGFuZCB0aGF0IGlzIHNldC4gTXVzdCBiZSA8PVxuICAgKiB7QGxpbmsgc2NoZWR1bGVUb0Nsb3NlVGltZW91dH0gd2hlbiBzZXQsIG90aGVyd2lzZSwgaXQgd2lsbCBiZSBjbGFtcGVkIGRvd24uXG4gICAqXG4gICAqIEBkZWZhdWx0IHVubGltaXRlZFxuICAgKiBAZm9ybWF0IG51bWJlciBvZiBtaWxsaXNlY29uZHMgb3Ige0BsaW5rIGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL21zIHwgbXMtZm9ybWF0dGVkIHN0cmluZ31cbiAgICovXG4gIHNjaGVkdWxlVG9TdGFydFRpbWVvdXQ/OiBEdXJhdGlvbjtcblxuICAvKipcbiAgICogSW5kaWNhdGVzIGhvdyBsb25nIHRoZSBjYWxsZXIgaXMgd2lsbGluZyB0byB3YWl0IGZvciBsb2NhbCBhY3Rpdml0eSBjb21wbGV0aW9uLiBMaW1pdHMgaG93XG4gICAqIGxvbmcgcmV0cmllcyB3aWxsIGJlIGF0dGVtcHRlZC5cbiAgICpcbiAgICogRWl0aGVyIHRoaXMgb3B0aW9uIG9yIHtAbGluayBzdGFydFRvQ2xvc2VUaW1lb3V0fSBpcyByZXF1aXJlZC5cbiAgICpcbiAgICogQGRlZmF1bHQgdW5saW1pdGVkXG4gICAqIEBmb3JtYXQgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBvciB7QGxpbmsgaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvbXMgfCBtcy1mb3JtYXR0ZWQgc3RyaW5nfVxuICAgKi9cbiAgc2NoZWR1bGVUb0Nsb3NlVGltZW91dD86IER1cmF0aW9uO1xuXG4gIC8qKlxuICAgKiBJZiB0aGUgYWN0aXZpdHkgaXMgcmV0cnlpbmcgYW5kIGJhY2tvZmYgd291bGQgZXhjZWVkIHRoaXMgdmFsdWUsIGEgc2VydmVyIHNpZGUgdGltZXIgd2lsbCBiZSBzY2hlZHVsZWQgZm9yIHRoZSBuZXh0IGF0dGVtcHQuXG4gICAqIE90aGVyd2lzZSwgYmFja29mZiB3aWxsIGhhcHBlbiBpbnRlcm5hbGx5IGluIHRoZSBTREsuXG4gICAqXG4gICAqIEBkZWZhdWx0IDEgbWludXRlXG4gICAqIEBmb3JtYXQgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBvciB7QGxpbmsgaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvbXMgfCBtcy1mb3JtYXR0ZWQgc3RyaW5nfVxuICAgKiovXG4gIGxvY2FsUmV0cnlUaHJlc2hvbGQ/OiBEdXJhdGlvbjtcblxuICAvKipcbiAgICogRGV0ZXJtaW5lcyB3aGF0IHRoZSBTREsgZG9lcyB3aGVuIHRoZSBBY3Rpdml0eSBpcyBjYW5jZWxsZWQuXG4gICAqIC0gYFRSWV9DQU5DRUxgIC0gSW5pdGlhdGUgYSBjYW5jZWxsYXRpb24gcmVxdWVzdCBhbmQgaW1tZWRpYXRlbHkgcmVwb3J0IGNhbmNlbGxhdGlvbiB0byB0aGUgd29ya2Zsb3cuXG4gICAqIC0gYFdBSVRfQ0FOQ0VMTEFUSU9OX0NPTVBMRVRFRGAgLSBXYWl0IGZvciBhY3Rpdml0eSBjYW5jZWxsYXRpb24gY29tcGxldGlvbi4gTm90ZSB0aGF0IGFjdGl2aXR5IG11c3QgaGVhcnRiZWF0IHRvIHJlY2VpdmUgYVxuICAgKiAgIGNhbmNlbGxhdGlvbiBub3RpZmljYXRpb24uIFRoaXMgY2FuIGJsb2NrIHRoZSBjYW5jZWxsYXRpb24gZm9yIGEgbG9uZyB0aW1lIGlmIGFjdGl2aXR5IGRvZXNuJ3RcbiAgICogICBoZWFydGJlYXQgb3IgY2hvb3NlcyB0byBpZ25vcmUgdGhlIGNhbmNlbGxhdGlvbiByZXF1ZXN0LlxuICAgKiAtIGBBQkFORE9OYCAtIERvIG5vdCByZXF1ZXN0IGNhbmNlbGxhdGlvbiBvZiB0aGUgYWN0aXZpdHkgYW5kIGltbWVkaWF0ZWx5IHJlcG9ydCBjYW5jZWxsYXRpb24gdG8gdGhlIHdvcmtmbG93LlxuICAgKi9cbiAgY2FuY2VsbGF0aW9uVHlwZT86IGNvcmVzZGsud29ya2Zsb3dfY29tbWFuZHMuQWN0aXZpdHlDYW5jZWxsYXRpb25UeXBlO1xufVxuIiwiaW1wb3J0IHsgRGVmYXVsdEZhaWx1cmVDb252ZXJ0ZXIsIEZhaWx1cmVDb252ZXJ0ZXIgfSBmcm9tICcuL2ZhaWx1cmUtY29udmVydGVyJztcbmltcG9ydCB7IFBheWxvYWRDb2RlYyB9IGZyb20gJy4vcGF5bG9hZC1jb2RlYyc7XG5pbXBvcnQgeyBkZWZhdWx0UGF5bG9hZENvbnZlcnRlciwgUGF5bG9hZENvbnZlcnRlciB9IGZyb20gJy4vcGF5bG9hZC1jb252ZXJ0ZXInO1xuXG4vKipcbiAqIFdoZW4geW91ciBkYXRhIChhcmd1bWVudHMgYW5kIHJldHVybiB2YWx1ZXMpIGlzIHNlbnQgb3ZlciB0aGUgd2lyZSBhbmQgc3RvcmVkIGJ5IFRlbXBvcmFsIFNlcnZlciwgaXQgaXMgZW5jb2RlZCBpblxuICogYmluYXJ5IGluIGEge0BsaW5rIFBheWxvYWR9IFByb3RvYnVmIG1lc3NhZ2UuXG4gKlxuICogVGhlIGRlZmF1bHQgYERhdGFDb252ZXJ0ZXJgIHN1cHBvcnRzIGB1bmRlZmluZWRgLCBgVWludDhBcnJheWAsIGFuZCBKU09OIHNlcmlhbGl6YWJsZXMgKHNvIGlmXG4gKiB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvSlNPTi9zdHJpbmdpZnkjZGVzY3JpcHRpb24gfCBgSlNPTi5zdHJpbmdpZnkoeW91ckFyZ09yUmV0dmFsKWB9XG4gKiB3b3JrcywgdGhlIGRlZmF1bHQgZGF0YSBjb252ZXJ0ZXIgd2lsbCB3b3JrKS4gUHJvdG9idWZzIGFyZSBzdXBwb3J0ZWQgdmlhXG4gKiB7QGxpbmsgaHR0cHM6Ly9kb2NzLnRlbXBvcmFsLmlvL3R5cGVzY3JpcHQvZGF0YS1jb252ZXJ0ZXJzI3Byb3RvYnVmcyB8IHRoaXMgQVBJfS5cbiAqXG4gKiBVc2UgYSBjdXN0b20gYERhdGFDb252ZXJ0ZXJgIHRvIGNvbnRyb2wgdGhlIGNvbnRlbnRzIG9mIHlvdXIge0BsaW5rIFBheWxvYWR9cy4gQ29tbW9uIHJlYXNvbnMgZm9yIHVzaW5nIGEgY3VzdG9tXG4gKiBgRGF0YUNvbnZlcnRlcmAgYXJlOlxuICogLSBDb252ZXJ0aW5nIHZhbHVlcyB0aGF0IGFyZSBub3Qgc3VwcG9ydGVkIGJ5IHRoZSBkZWZhdWx0IGBEYXRhQ29udmVydGVyYCAoZm9yIGV4YW1wbGUsIGBKU09OLnN0cmluZ2lmeSgpYCBkb2Vzbid0XG4gKiAgIGhhbmRsZSBgQmlnSW50YHMsIHNvIGlmIHlvdSB3YW50IHRvIHJldHVybiBgeyB0b3RhbDogMTAwMG4gfWAgZnJvbSBhIFdvcmtmbG93LCBTaWduYWwsIG9yIEFjdGl2aXR5LCB5b3UgbmVlZCB5b3VyXG4gKiAgIG93biBgRGF0YUNvbnZlcnRlcmApLlxuICogLSBFbmNyeXB0aW5nIHZhbHVlcyB0aGF0IG1heSBjb250YWluIHByaXZhdGUgaW5mb3JtYXRpb24gdGhhdCB5b3UgZG9uJ3Qgd2FudCBzdG9yZWQgaW4gcGxhaW50ZXh0IGluIFRlbXBvcmFsIFNlcnZlcidzXG4gKiAgIGRhdGFiYXNlLlxuICogLSBDb21wcmVzc2luZyB2YWx1ZXMgdG8gcmVkdWNlIGRpc2sgb3IgbmV0d29yayB1c2FnZS5cbiAqXG4gKiBUbyB1c2UgeW91ciBjdXN0b20gYERhdGFDb252ZXJ0ZXJgLCBwcm92aWRlIGl0IHRvIHRoZSB7QGxpbmsgV29ya2Zsb3dDbGllbnR9LCB7QGxpbmsgV29ya2VyfSwgYW5kXG4gKiB7QGxpbmsgYnVuZGxlV29ya2Zsb3dDb2RlfSAoaWYgeW91IHVzZSBpdCk6XG4gKiAtIGBuZXcgV29ya2Zsb3dDbGllbnQoeyAuLi4sIGRhdGFDb252ZXJ0ZXIgfSlgXG4gKiAtIGBXb3JrZXIuY3JlYXRlKHsgLi4uLCBkYXRhQ29udmVydGVyIH0pYFxuICogLSBgYnVuZGxlV29ya2Zsb3dDb2RlKHsgLi4uLCBwYXlsb2FkQ29udmVydGVyUGF0aCB9KWBcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBEYXRhQ29udmVydGVyIHtcbiAgLyoqXG4gICAqIFBhdGggb2YgYSBmaWxlIHRoYXQgaGFzIGEgYHBheWxvYWRDb252ZXJ0ZXJgIG5hbWVkIGV4cG9ydC5cbiAgICogYHBheWxvYWRDb252ZXJ0ZXJgIHNob3VsZCBiZSBhbiBvYmplY3QgdGhhdCBpbXBsZW1lbnRzIHtAbGluayBQYXlsb2FkQ29udmVydGVyfS5cbiAgICogSWYgbm8gcGF0aCBpcyBwcm92aWRlZCwge0BsaW5rIGRlZmF1bHRQYXlsb2FkQ29udmVydGVyfSBpcyB1c2VkLlxuICAgKi9cbiAgcGF5bG9hZENvbnZlcnRlclBhdGg/OiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIFBhdGggb2YgYSBmaWxlIHRoYXQgaGFzIGEgYGZhaWx1cmVDb252ZXJ0ZXJgIG5hbWVkIGV4cG9ydC5cbiAgICogYGZhaWx1cmVDb252ZXJ0ZXJgIHNob3VsZCBiZSBhbiBvYmplY3QgdGhhdCBpbXBsZW1lbnRzIHtAbGluayBGYWlsdXJlQ29udmVydGVyfS5cbiAgICogSWYgbm8gcGF0aCBpcyBwcm92aWRlZCwge0BsaW5rIGRlZmF1bHRGYWlsdXJlQ29udmVydGVyfSBpcyB1c2VkLlxuICAgKi9cbiAgZmFpbHVyZUNvbnZlcnRlclBhdGg/OiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIEFuIGFycmF5IG9mIHtAbGluayBQYXlsb2FkQ29kZWN9IGluc3RhbmNlcy5cbiAgICpcbiAgICogUGF5bG9hZHMgYXJlIGVuY29kZWQgaW4gdGhlIG9yZGVyIG9mIHRoZSBhcnJheSBhbmQgZGVjb2RlZCBpbiB0aGUgb3Bwb3NpdGUgb3JkZXIuIEZvciBleGFtcGxlLCBpZiB5b3UgaGF2ZSBhXG4gICAqIGNvbXByZXNzaW9uIGNvZGVjIGFuZCBhbiBlbmNyeXB0aW9uIGNvZGVjLCB0aGVuIHlvdSB3YW50IGRhdGEgdG8gYmUgZW5jb2RlZCB3aXRoIHRoZSBjb21wcmVzc2lvbiBjb2RlYyBmaXJzdCwgc29cbiAgICogeW91J2QgZG8gYHBheWxvYWRDb2RlY3M6IFtjb21wcmVzc2lvbkNvZGVjLCBlbmNyeXB0aW9uQ29kZWNdYC5cbiAgICovXG4gIHBheWxvYWRDb2RlY3M/OiBQYXlsb2FkQ29kZWNbXTtcbn1cblxuLyoqXG4gKiBBIHtAbGluayBEYXRhQ29udmVydGVyfSB0aGF0IGhhcyBiZWVuIGxvYWRlZCB2aWEge0BsaW5rIGxvYWREYXRhQ29udmVydGVyfS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBMb2FkZWREYXRhQ29udmVydGVyIHtcbiAgcGF5bG9hZENvbnZlcnRlcjogUGF5bG9hZENvbnZlcnRlcjtcbiAgZmFpbHVyZUNvbnZlcnRlcjogRmFpbHVyZUNvbnZlcnRlcjtcbiAgcGF5bG9hZENvZGVjczogUGF5bG9hZENvZGVjW107XG59XG5cbi8qKlxuICogVGhlIGRlZmF1bHQge0BsaW5rIEZhaWx1cmVDb252ZXJ0ZXJ9IHVzZWQgYnkgdGhlIFNESy5cbiAqXG4gKiBFcnJvciBtZXNzYWdlcyBhbmQgc3RhY2sgdHJhY2VzIGFyZSBzZXJpemFsaXplZCBhcyBwbGFpbiB0ZXh0LlxuICovXG5leHBvcnQgY29uc3QgZGVmYXVsdEZhaWx1cmVDb252ZXJ0ZXI6IEZhaWx1cmVDb252ZXJ0ZXIgPSBuZXcgRGVmYXVsdEZhaWx1cmVDb252ZXJ0ZXIoKTtcblxuLyoqXG4gKiBBIFwibG9hZGVkXCIgZGF0YSBjb252ZXJ0ZXIgdGhhdCB1c2VzIHRoZSBkZWZhdWx0IHNldCBvZiBmYWlsdXJlIGFuZCBwYXlsb2FkIGNvbnZlcnRlcnMuXG4gKi9cbmV4cG9ydCBjb25zdCBkZWZhdWx0RGF0YUNvbnZlcnRlcjogTG9hZGVkRGF0YUNvbnZlcnRlciA9IHtcbiAgcGF5bG9hZENvbnZlcnRlcjogZGVmYXVsdFBheWxvYWRDb252ZXJ0ZXIsXG4gIGZhaWx1cmVDb252ZXJ0ZXI6IGRlZmF1bHRGYWlsdXJlQ29udmVydGVyLFxuICBwYXlsb2FkQ29kZWNzOiBbXSxcbn07XG4iLCJpbXBvcnQge1xuICBBY3Rpdml0eUZhaWx1cmUsXG4gIEFwcGxpY2F0aW9uRmFpbHVyZSxcbiAgQ2FuY2VsbGVkRmFpbHVyZSxcbiAgQ2hpbGRXb3JrZmxvd0ZhaWx1cmUsXG4gIEZBSUxVUkVfU09VUkNFLFxuICBQcm90b0ZhaWx1cmUsXG4gIFJldHJ5U3RhdGUsXG4gIFNlcnZlckZhaWx1cmUsXG4gIFRlbXBvcmFsRmFpbHVyZSxcbiAgVGVybWluYXRlZEZhaWx1cmUsXG4gIFRpbWVvdXRGYWlsdXJlLFxuICBUaW1lb3V0VHlwZSxcbn0gZnJvbSAnLi4vZmFpbHVyZSc7XG5pbXBvcnQgeyBpc0Vycm9yIH0gZnJvbSAnLi4vdHlwZS1oZWxwZXJzJztcbmltcG9ydCB7IG1zT3B0aW9uYWxUb1RzIH0gZnJvbSAnLi4vdGltZSc7XG5pbXBvcnQgeyBhcnJheUZyb21QYXlsb2FkcywgZnJvbVBheWxvYWRzQXRJbmRleCwgUGF5bG9hZENvbnZlcnRlciwgdG9QYXlsb2FkcyB9IGZyb20gJy4vcGF5bG9hZC1jb252ZXJ0ZXInO1xuXG5mdW5jdGlvbiBjb21iaW5lUmVnRXhwKC4uLnJlZ2V4cHM6IFJlZ0V4cFtdKTogUmVnRXhwIHtcbiAgcmV0dXJuIG5ldyBSZWdFeHAocmVnZXhwcy5tYXAoKHgpID0+IGAoPzoke3guc291cmNlfSlgKS5qb2luKCd8JykpO1xufVxuXG4vKipcbiAqIFN0YWNrIHRyYWNlcyB3aWxsIGJlIGN1dG9mZiB3aGVuIG9uIG9mIHRoZXNlIHBhdHRlcm5zIGlzIG1hdGNoZWRcbiAqL1xuY29uc3QgQ1VUT0ZGX1NUQUNLX1BBVFRFUk5TID0gY29tYmluZVJlZ0V4cChcbiAgLyoqIEFjdGl2aXR5IGV4ZWN1dGlvbiAqL1xuICAvXFxzK2F0IEFjdGl2aXR5XFwuZXhlY3V0ZSBcXCguKltcXFxcL113b3JrZXJbXFxcXC9dKD86c3JjfGxpYilbXFxcXC9dYWN0aXZpdHlcXC5banRdczpcXGQrOlxcZCtcXCkvLFxuICAvKiogV29ya2Zsb3cgYWN0aXZhdGlvbiAqL1xuICAvXFxzK2F0IEFjdGl2YXRvclxcLlxcUytOZXh0SGFuZGxlciBcXCguKltcXFxcL113b3JrZmxvd1tcXFxcL10oPzpzcmN8bGliKVtcXFxcL11pbnRlcm5hbHNcXC5banRdczpcXGQrOlxcZCtcXCkvLFxuICAvKiogV29ya2Zsb3cgcnVuIGFueXRoaW5nIGluIGNvbnRleHQgKi9cbiAgL1xccythdCBTY3JpcHRcXC5ydW5JbkNvbnRleHQgXFwoKD86bm9kZTp2bXx2bVxcLmpzKTpcXGQrOlxcZCtcXCkvXG4pO1xuXG4vKipcbiAqIEFueSBzdGFjayB0cmFjZSBmcmFtZXMgdGhhdCBtYXRjaCBhbnkgb2YgdGhvc2Ugd2lsIGJlIGRvcHBlZC5cbiAqIFRoZSBcIm51bGwuXCIgcHJlZml4IG9uIHNvbWUgY2FzZXMgaXMgdG8gYXZvaWQgaHR0cHM6Ly9naXRodWIuY29tL25vZGVqcy9ub2RlL2lzc3Vlcy80MjQxN1xuICovXG5jb25zdCBEUk9QUEVEX1NUQUNLX0ZSQU1FU19QQVRURVJOUyA9IGNvbWJpbmVSZWdFeHAoXG4gIC8qKiBJbnRlcm5hbCBmdW5jdGlvbnMgdXNlZCB0byByZWN1cnNpdmVseSBjaGFpbiBpbnRlcmNlcHRvcnMgKi9cbiAgL1xccythdCAobnVsbFxcLik/bmV4dCBcXCguKltcXFxcL11jb21tb25bXFxcXC9dKD86c3JjfGxpYilbXFxcXC9daW50ZXJjZXB0b3JzXFwuW2p0XXM6XFxkKzpcXGQrXFwpLyxcbiAgLyoqIEludGVybmFsIGZ1bmN0aW9ucyB1c2VkIHRvIHJlY3Vyc2l2ZWx5IGNoYWluIGludGVyY2VwdG9ycyAqL1xuICAvXFxzK2F0IChudWxsXFwuKT9leGVjdXRlTmV4dEhhbmRsZXIgXFwoLipbXFxcXC9dd29ya2VyW1xcXFwvXSg/OnNyY3xsaWIpW1xcXFwvXWFjdGl2aXR5XFwuW2p0XXM6XFxkKzpcXGQrXFwpL1xuKTtcblxuLyoqXG4gKiBDdXRzIG91dCB0aGUgZnJhbWV3b3JrIHBhcnQgb2YgYSBzdGFjayB0cmFjZSwgbGVhdmluZyBvbmx5IHVzZXIgY29kZSBlbnRyaWVzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjdXRvZmZTdGFja1RyYWNlKHN0YWNrPzogc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3QgbGluZXMgPSAoc3RhY2sgPz8gJycpLnNwbGl0KC9cXHI/XFxuLyk7XG4gIGNvbnN0IGFjYyA9IEFycmF5PHN0cmluZz4oKTtcbiAgZm9yIChjb25zdCBsaW5lIG9mIGxpbmVzKSB7XG4gICAgaWYgKENVVE9GRl9TVEFDS19QQVRURVJOUy50ZXN0KGxpbmUpKSBicmVhaztcbiAgICBpZiAoIURST1BQRURfU1RBQ0tfRlJBTUVTX1BBVFRFUk5TLnRlc3QobGluZSkpIGFjYy5wdXNoKGxpbmUpO1xuICB9XG4gIHJldHVybiBhY2Muam9pbignXFxuJyk7XG59XG5cbi8qKlxuICogQSBgRmFpbHVyZUNvbnZlcnRlcmAgaXMgcmVzcG9uc2libGUgZm9yIGNvbnZlcnRpbmcgZnJvbSBwcm90byBgRmFpbHVyZWAgaW5zdGFuY2VzIHRvIEpTIGBFcnJvcnNgIGFuZCBiYWNrLlxuICpcbiAqIFdlIHJlY29tbWVuZGVkIHVzaW5nIHRoZSB7QGxpbmsgRGVmYXVsdEZhaWx1cmVDb252ZXJ0ZXJ9IGluc3RlYWQgb2YgY3VzdG9taXppbmcgdGhlIGRlZmF1bHQgaW1wbGVtZW50YXRpb24gaW4gb3JkZXJcbiAqIHRvIG1haW50YWluIGNyb3NzLWxhbmd1YWdlIEZhaWx1cmUgc2VyaWFsaXphdGlvbiBjb21wYXRpYmlsaXR5LlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEZhaWx1cmVDb252ZXJ0ZXIge1xuICAvKipcbiAgICogQ29udmVydHMgYSBjYXVnaHQgZXJyb3IgdG8gYSBGYWlsdXJlIHByb3RvIG1lc3NhZ2UuXG4gICAqL1xuICBlcnJvclRvRmFpbHVyZShlcnI6IHVua25vd24sIHBheWxvYWRDb252ZXJ0ZXI6IFBheWxvYWRDb252ZXJ0ZXIpOiBQcm90b0ZhaWx1cmU7XG5cbiAgLyoqXG4gICAqIENvbnZlcnRzIGEgRmFpbHVyZSBwcm90byBtZXNzYWdlIHRvIGEgSlMgRXJyb3Igb2JqZWN0LlxuICAgKlxuICAgKiBUaGUgcmV0dXJuZWQgZXJyb3IgbXVzdCBiZSBhbiBpbnN0YW5jZSBvZiBgVGVtcG9yYWxGYWlsdXJlYC5cbiAgICovXG4gIGZhaWx1cmVUb0Vycm9yKGVycjogUHJvdG9GYWlsdXJlLCBwYXlsb2FkQ29udmVydGVyOiBQYXlsb2FkQ29udmVydGVyKTogVGVtcG9yYWxGYWlsdXJlO1xufVxuXG4vKipcbiAqIFRoZSBcInNoYXBlXCIgb2YgdGhlIGF0dHJpYnV0ZXMgc2V0IGFzIHRoZSB7QGxpbmsgUHJvdG9GYWlsdXJlLmVuY29kZWRBdHRyaWJ1dGVzfSBwYXlsb2FkIGluIGNhc2VcbiAqIHtAbGluayBEZWZhdWx0RW5jb2RlZEZhaWx1cmVBdHRyaWJ1dGVzLmVuY29kZUNvbW1vbkF0dHJpYnV0ZXN9IGlzIHNldCB0byBgdHJ1ZWAuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRGVmYXVsdEVuY29kZWRGYWlsdXJlQXR0cmlidXRlcyB7XG4gIG1lc3NhZ2U6IHN0cmluZztcbiAgc3RhY2tfdHJhY2U6IHN0cmluZztcbn1cblxuLyoqXG4gKiBPcHRpb25zIGZvciB0aGUge0BsaW5rIERlZmF1bHRGYWlsdXJlQ29udmVydGVyfSBjb25zdHJ1Y3Rvci5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBEZWZhdWx0RmFpbHVyZUNvbnZlcnRlck9wdGlvbnMge1xuICAvKipcbiAgICogV2hldGhlciB0byBlbmNvZGUgZXJyb3IgbWVzc2FnZXMgYW5kIHN0YWNrIHRyYWNlcyAoZm9yIGVuY3J5cHRpbmcgdGhlc2UgYXR0cmlidXRlcyB1c2UgYSB7QGxpbmsgUGF5bG9hZENvZGVjfSkuXG4gICAqL1xuICBlbmNvZGVDb21tb25BdHRyaWJ1dGVzOiBib29sZWFuO1xufVxuXG4vKipcbiAqIERlZmF1bHQsIGNyb3NzLWxhbmd1YWdlLWNvbXBhdGlibGUgRmFpbHVyZSBjb252ZXJ0ZXIuXG4gKlxuICogQnkgZGVmYXVsdCwgaXQgd2lsbCBsZWF2ZSBlcnJvciBtZXNzYWdlcyBhbmQgc3RhY2sgdHJhY2VzIGFzIHBsYWluIHRleHQuIEluIG9yZGVyIHRvIGVuY3J5cHQgdGhlbSwgc2V0XG4gKiBgZW5jb2RlQ29tbW9uQXR0cmlidXRlc2AgdG8gYHRydWVgIGluIHRoZSBjb25zdHJ1Y3RvciBvcHRpb25zIGFuZCB1c2UgYSB7QGxpbmsgUGF5bG9hZENvZGVjfSB0aGF0IGNhbiBlbmNyeXB0IC9cbiAqIGRlY3J5cHQgUGF5bG9hZHMgaW4geW91ciB7QGxpbmsgV29ya2VyT3B0aW9ucy5kYXRhQ29udmVydGVyIHwgV29ya2VyfSBhbmRcbiAqIHtAbGluayBDbGllbnRPcHRpb25zLmRhdGFDb252ZXJ0ZXIgfCBDbGllbnQgb3B0aW9uc30uXG4gKi9cbmV4cG9ydCBjbGFzcyBEZWZhdWx0RmFpbHVyZUNvbnZlcnRlciBpbXBsZW1lbnRzIEZhaWx1cmVDb252ZXJ0ZXIge1xuICBwdWJsaWMgcmVhZG9ubHkgb3B0aW9uczogRGVmYXVsdEZhaWx1cmVDb252ZXJ0ZXJPcHRpb25zO1xuXG4gIGNvbnN0cnVjdG9yKG9wdGlvbnM/OiBQYXJ0aWFsPERlZmF1bHRGYWlsdXJlQ29udmVydGVyT3B0aW9ucz4pIHtcbiAgICBjb25zdCB7IGVuY29kZUNvbW1vbkF0dHJpYnV0ZXMgfSA9IG9wdGlvbnMgPz8ge307XG4gICAgdGhpcy5vcHRpb25zID0ge1xuICAgICAgZW5jb2RlQ29tbW9uQXR0cmlidXRlczogZW5jb2RlQ29tbW9uQXR0cmlidXRlcyA/PyBmYWxzZSxcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIENvbnZlcnRzIGEgRmFpbHVyZSBwcm90byBtZXNzYWdlIHRvIGEgSlMgRXJyb3Igb2JqZWN0LlxuICAgKlxuICAgKiBEb2VzIG5vdCBzZXQgY29tbW9uIHByb3BlcnRpZXMsIHRoYXQgaXMgZG9uZSBpbiB7QGxpbmsgZmFpbHVyZVRvRXJyb3J9LlxuICAgKi9cbiAgZmFpbHVyZVRvRXJyb3JJbm5lcihmYWlsdXJlOiBQcm90b0ZhaWx1cmUsIHBheWxvYWRDb252ZXJ0ZXI6IFBheWxvYWRDb252ZXJ0ZXIpOiBUZW1wb3JhbEZhaWx1cmUge1xuICAgIGlmIChmYWlsdXJlLmFwcGxpY2F0aW9uRmFpbHVyZUluZm8pIHtcbiAgICAgIHJldHVybiBuZXcgQXBwbGljYXRpb25GYWlsdXJlKFxuICAgICAgICBmYWlsdXJlLm1lc3NhZ2UgPz8gdW5kZWZpbmVkLFxuICAgICAgICBmYWlsdXJlLmFwcGxpY2F0aW9uRmFpbHVyZUluZm8udHlwZSxcbiAgICAgICAgQm9vbGVhbihmYWlsdXJlLmFwcGxpY2F0aW9uRmFpbHVyZUluZm8ubm9uUmV0cnlhYmxlKSxcbiAgICAgICAgYXJyYXlGcm9tUGF5bG9hZHMocGF5bG9hZENvbnZlcnRlciwgZmFpbHVyZS5hcHBsaWNhdGlvbkZhaWx1cmVJbmZvLmRldGFpbHM/LnBheWxvYWRzKSxcbiAgICAgICAgdGhpcy5vcHRpb25hbEZhaWx1cmVUb09wdGlvbmFsRXJyb3IoZmFpbHVyZS5jYXVzZSwgcGF5bG9hZENvbnZlcnRlcilcbiAgICAgICk7XG4gICAgfVxuICAgIGlmIChmYWlsdXJlLnNlcnZlckZhaWx1cmVJbmZvKSB7XG4gICAgICByZXR1cm4gbmV3IFNlcnZlckZhaWx1cmUoXG4gICAgICAgIGZhaWx1cmUubWVzc2FnZSA/PyB1bmRlZmluZWQsXG4gICAgICAgIEJvb2xlYW4oZmFpbHVyZS5zZXJ2ZXJGYWlsdXJlSW5mby5ub25SZXRyeWFibGUpLFxuICAgICAgICB0aGlzLm9wdGlvbmFsRmFpbHVyZVRvT3B0aW9uYWxFcnJvcihmYWlsdXJlLmNhdXNlLCBwYXlsb2FkQ29udmVydGVyKVxuICAgICAgKTtcbiAgICB9XG4gICAgaWYgKGZhaWx1cmUudGltZW91dEZhaWx1cmVJbmZvKSB7XG4gICAgICByZXR1cm4gbmV3IFRpbWVvdXRGYWlsdXJlKFxuICAgICAgICBmYWlsdXJlLm1lc3NhZ2UgPz8gdW5kZWZpbmVkLFxuICAgICAgICBmcm9tUGF5bG9hZHNBdEluZGV4KHBheWxvYWRDb252ZXJ0ZXIsIDAsIGZhaWx1cmUudGltZW91dEZhaWx1cmVJbmZvLmxhc3RIZWFydGJlYXREZXRhaWxzPy5wYXlsb2FkcyksXG4gICAgICAgIGZhaWx1cmUudGltZW91dEZhaWx1cmVJbmZvLnRpbWVvdXRUeXBlID8/IFRpbWVvdXRUeXBlLlRJTUVPVVRfVFlQRV9VTlNQRUNJRklFRFxuICAgICAgKTtcbiAgICB9XG4gICAgaWYgKGZhaWx1cmUudGVybWluYXRlZEZhaWx1cmVJbmZvKSB7XG4gICAgICByZXR1cm4gbmV3IFRlcm1pbmF0ZWRGYWlsdXJlKFxuICAgICAgICBmYWlsdXJlLm1lc3NhZ2UgPz8gdW5kZWZpbmVkLFxuICAgICAgICB0aGlzLm9wdGlvbmFsRmFpbHVyZVRvT3B0aW9uYWxFcnJvcihmYWlsdXJlLmNhdXNlLCBwYXlsb2FkQ29udmVydGVyKVxuICAgICAgKTtcbiAgICB9XG4gICAgaWYgKGZhaWx1cmUuY2FuY2VsZWRGYWlsdXJlSW5mbykge1xuICAgICAgcmV0dXJuIG5ldyBDYW5jZWxsZWRGYWlsdXJlKFxuICAgICAgICBmYWlsdXJlLm1lc3NhZ2UgPz8gdW5kZWZpbmVkLFxuICAgICAgICBhcnJheUZyb21QYXlsb2FkcyhwYXlsb2FkQ29udmVydGVyLCBmYWlsdXJlLmNhbmNlbGVkRmFpbHVyZUluZm8uZGV0YWlscz8ucGF5bG9hZHMpLFxuICAgICAgICB0aGlzLm9wdGlvbmFsRmFpbHVyZVRvT3B0aW9uYWxFcnJvcihmYWlsdXJlLmNhdXNlLCBwYXlsb2FkQ29udmVydGVyKVxuICAgICAgKTtcbiAgICB9XG4gICAgaWYgKGZhaWx1cmUucmVzZXRXb3JrZmxvd0ZhaWx1cmVJbmZvKSB7XG4gICAgICByZXR1cm4gbmV3IEFwcGxpY2F0aW9uRmFpbHVyZShcbiAgICAgICAgZmFpbHVyZS5tZXNzYWdlID8/IHVuZGVmaW5lZCxcbiAgICAgICAgJ1Jlc2V0V29ya2Zsb3cnLFxuICAgICAgICBmYWxzZSxcbiAgICAgICAgYXJyYXlGcm9tUGF5bG9hZHMocGF5bG9hZENvbnZlcnRlciwgZmFpbHVyZS5yZXNldFdvcmtmbG93RmFpbHVyZUluZm8ubGFzdEhlYXJ0YmVhdERldGFpbHM/LnBheWxvYWRzKSxcbiAgICAgICAgdGhpcy5vcHRpb25hbEZhaWx1cmVUb09wdGlvbmFsRXJyb3IoZmFpbHVyZS5jYXVzZSwgcGF5bG9hZENvbnZlcnRlcilcbiAgICAgICk7XG4gICAgfVxuICAgIGlmIChmYWlsdXJlLmNoaWxkV29ya2Zsb3dFeGVjdXRpb25GYWlsdXJlSW5mbykge1xuICAgICAgY29uc3QgeyBuYW1lc3BhY2UsIHdvcmtmbG93VHlwZSwgd29ya2Zsb3dFeGVjdXRpb24sIHJldHJ5U3RhdGUgfSA9IGZhaWx1cmUuY2hpbGRXb3JrZmxvd0V4ZWN1dGlvbkZhaWx1cmVJbmZvO1xuICAgICAgaWYgKCEod29ya2Zsb3dUeXBlPy5uYW1lICYmIHdvcmtmbG93RXhlY3V0aW9uKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdNaXNzaW5nIGF0dHJpYnV0ZXMgb24gY2hpbGRXb3JrZmxvd0V4ZWN1dGlvbkZhaWx1cmVJbmZvJyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IENoaWxkV29ya2Zsb3dGYWlsdXJlKFxuICAgICAgICBuYW1lc3BhY2UgPz8gdW5kZWZpbmVkLFxuICAgICAgICB3b3JrZmxvd0V4ZWN1dGlvbixcbiAgICAgICAgd29ya2Zsb3dUeXBlLm5hbWUsXG4gICAgICAgIHJldHJ5U3RhdGUgPz8gUmV0cnlTdGF0ZS5SRVRSWV9TVEFURV9VTlNQRUNJRklFRCxcbiAgICAgICAgdGhpcy5vcHRpb25hbEZhaWx1cmVUb09wdGlvbmFsRXJyb3IoZmFpbHVyZS5jYXVzZSwgcGF5bG9hZENvbnZlcnRlcilcbiAgICAgICk7XG4gICAgfVxuICAgIGlmIChmYWlsdXJlLmFjdGl2aXR5RmFpbHVyZUluZm8pIHtcbiAgICAgIGlmICghZmFpbHVyZS5hY3Rpdml0eUZhaWx1cmVJbmZvLmFjdGl2aXR5VHlwZT8ubmFtZSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdNaXNzaW5nIGFjdGl2aXR5VHlwZT8ubmFtZSBvbiBhY3Rpdml0eUZhaWx1cmVJbmZvJyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IEFjdGl2aXR5RmFpbHVyZShcbiAgICAgICAgZmFpbHVyZS5tZXNzYWdlID8/IHVuZGVmaW5lZCxcbiAgICAgICAgZmFpbHVyZS5hY3Rpdml0eUZhaWx1cmVJbmZvLmFjdGl2aXR5VHlwZS5uYW1lLFxuICAgICAgICBmYWlsdXJlLmFjdGl2aXR5RmFpbHVyZUluZm8uYWN0aXZpdHlJZCA/PyB1bmRlZmluZWQsXG4gICAgICAgIGZhaWx1cmUuYWN0aXZpdHlGYWlsdXJlSW5mby5yZXRyeVN0YXRlID8/IFJldHJ5U3RhdGUuUkVUUllfU1RBVEVfVU5TUEVDSUZJRUQsXG4gICAgICAgIGZhaWx1cmUuYWN0aXZpdHlGYWlsdXJlSW5mby5pZGVudGl0eSA/PyB1bmRlZmluZWQsXG4gICAgICAgIHRoaXMub3B0aW9uYWxGYWlsdXJlVG9PcHRpb25hbEVycm9yKGZhaWx1cmUuY2F1c2UsIHBheWxvYWRDb252ZXJ0ZXIpXG4gICAgICApO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFRlbXBvcmFsRmFpbHVyZShcbiAgICAgIGZhaWx1cmUubWVzc2FnZSA/PyB1bmRlZmluZWQsXG4gICAgICB0aGlzLm9wdGlvbmFsRmFpbHVyZVRvT3B0aW9uYWxFcnJvcihmYWlsdXJlLmNhdXNlLCBwYXlsb2FkQ29udmVydGVyKVxuICAgICk7XG4gIH1cblxuICBmYWlsdXJlVG9FcnJvcihmYWlsdXJlOiBQcm90b0ZhaWx1cmUsIHBheWxvYWRDb252ZXJ0ZXI6IFBheWxvYWRDb252ZXJ0ZXIpOiBUZW1wb3JhbEZhaWx1cmUge1xuICAgIGlmIChmYWlsdXJlLmVuY29kZWRBdHRyaWJ1dGVzKSB7XG4gICAgICBjb25zdCBhdHRycyA9IHBheWxvYWRDb252ZXJ0ZXIuZnJvbVBheWxvYWQ8RGVmYXVsdEVuY29kZWRGYWlsdXJlQXR0cmlidXRlcz4oZmFpbHVyZS5lbmNvZGVkQXR0cmlidXRlcyk7XG4gICAgICAvLyBEb24ndCBhcHBseSBlbmNvZGVkQXR0cmlidXRlcyB1bmxlc3MgdGhleSBjb25mb3JtIHRvIGFuIGV4cGVjdGVkIHNjaGVtYVxuICAgICAgaWYgKHR5cGVvZiBhdHRycyA9PT0gJ29iamVjdCcgJiYgYXR0cnMgIT09IG51bGwpIHtcbiAgICAgICAgY29uc3QgeyBtZXNzYWdlLCBzdGFja190cmFjZSB9ID0gYXR0cnM7XG4gICAgICAgIC8vIEF2b2lkIG11dGF0aW5nIHRoZSBhcmd1bWVudFxuICAgICAgICBmYWlsdXJlID0geyAuLi5mYWlsdXJlIH07XG4gICAgICAgIGlmICh0eXBlb2YgbWVzc2FnZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICBmYWlsdXJlLm1lc3NhZ2UgPSBtZXNzYWdlO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2Ygc3RhY2tfdHJhY2UgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgZmFpbHVyZS5zdGFja1RyYWNlID0gc3RhY2tfdHJhY2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgZXJyID0gdGhpcy5mYWlsdXJlVG9FcnJvcklubmVyKGZhaWx1cmUsIHBheWxvYWRDb252ZXJ0ZXIpO1xuICAgIGVyci5zdGFjayA9IGZhaWx1cmUuc3RhY2tUcmFjZSA/PyAnJztcbiAgICBlcnIuZmFpbHVyZSA9IGZhaWx1cmU7XG4gICAgcmV0dXJuIGVycjtcbiAgfVxuXG4gIGVycm9yVG9GYWlsdXJlKGVycjogdW5rbm93biwgcGF5bG9hZENvbnZlcnRlcjogUGF5bG9hZENvbnZlcnRlcik6IFByb3RvRmFpbHVyZSB7XG4gICAgY29uc3QgZmFpbHVyZSA9IHRoaXMuZXJyb3JUb0ZhaWx1cmVJbm5lcihlcnIsIHBheWxvYWRDb252ZXJ0ZXIpO1xuICAgIGlmICh0aGlzLm9wdGlvbnMuZW5jb2RlQ29tbW9uQXR0cmlidXRlcykge1xuICAgICAgY29uc3QgeyBtZXNzYWdlLCBzdGFja1RyYWNlIH0gPSBmYWlsdXJlO1xuICAgICAgZmFpbHVyZS5tZXNzYWdlID0gJ0VuY29kZWQgZmFpbHVyZSc7XG4gICAgICBmYWlsdXJlLnN0YWNrVHJhY2UgPSAnJztcbiAgICAgIGZhaWx1cmUuZW5jb2RlZEF0dHJpYnV0ZXMgPSBwYXlsb2FkQ29udmVydGVyLnRvUGF5bG9hZCh7IG1lc3NhZ2UsIHN0YWNrX3RyYWNlOiBzdGFja1RyYWNlIH0pO1xuICAgIH1cbiAgICByZXR1cm4gZmFpbHVyZTtcbiAgfVxuXG4gIGVycm9yVG9GYWlsdXJlSW5uZXIoZXJyOiB1bmtub3duLCBwYXlsb2FkQ29udmVydGVyOiBQYXlsb2FkQ29udmVydGVyKTogUHJvdG9GYWlsdXJlIHtcbiAgICBpZiAoZXJyIGluc3RhbmNlb2YgVGVtcG9yYWxGYWlsdXJlKSB7XG4gICAgICBpZiAoZXJyLmZhaWx1cmUpIHJldHVybiBlcnIuZmFpbHVyZTtcbiAgICAgIGNvbnN0IGJhc2UgPSB7XG4gICAgICAgIG1lc3NhZ2U6IGVyci5tZXNzYWdlLFxuICAgICAgICBzdGFja1RyYWNlOiBjdXRvZmZTdGFja1RyYWNlKGVyci5zdGFjayksXG4gICAgICAgIGNhdXNlOiB0aGlzLm9wdGlvbmFsRXJyb3JUb09wdGlvbmFsRmFpbHVyZShlcnIuY2F1c2UsIHBheWxvYWRDb252ZXJ0ZXIpLFxuICAgICAgICBzb3VyY2U6IEZBSUxVUkVfU09VUkNFLFxuICAgICAgfTtcblxuICAgICAgaWYgKGVyciBpbnN0YW5jZW9mIEFjdGl2aXR5RmFpbHVyZSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIC4uLmJhc2UsXG4gICAgICAgICAgYWN0aXZpdHlGYWlsdXJlSW5mbzoge1xuICAgICAgICAgICAgLi4uZXJyLFxuICAgICAgICAgICAgYWN0aXZpdHlUeXBlOiB7IG5hbWU6IGVyci5hY3Rpdml0eVR5cGUgfSxcbiAgICAgICAgICB9LFxuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgaWYgKGVyciBpbnN0YW5jZW9mIENoaWxkV29ya2Zsb3dGYWlsdXJlKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgLi4uYmFzZSxcbiAgICAgICAgICBjaGlsZFdvcmtmbG93RXhlY3V0aW9uRmFpbHVyZUluZm86IHtcbiAgICAgICAgICAgIC4uLmVycixcbiAgICAgICAgICAgIHdvcmtmbG93RXhlY3V0aW9uOiBlcnIuZXhlY3V0aW9uLFxuICAgICAgICAgICAgd29ya2Zsb3dUeXBlOiB7IG5hbWU6IGVyci53b3JrZmxvd1R5cGUgfSxcbiAgICAgICAgICB9LFxuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgaWYgKGVyciBpbnN0YW5jZW9mIEFwcGxpY2F0aW9uRmFpbHVyZSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIC4uLmJhc2UsXG4gICAgICAgICAgYXBwbGljYXRpb25GYWlsdXJlSW5mbzoge1xuICAgICAgICAgICAgdHlwZTogZXJyLnR5cGUsXG4gICAgICAgICAgICBub25SZXRyeWFibGU6IGVyci5ub25SZXRyeWFibGUsXG4gICAgICAgICAgICBkZXRhaWxzOlxuICAgICAgICAgICAgICBlcnIuZGV0YWlscyAmJiBlcnIuZGV0YWlscy5sZW5ndGhcbiAgICAgICAgICAgICAgICA/IHsgcGF5bG9hZHM6IHRvUGF5bG9hZHMocGF5bG9hZENvbnZlcnRlciwgLi4uZXJyLmRldGFpbHMpIH1cbiAgICAgICAgICAgICAgICA6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIG5leHRSZXRyeURlbGF5OiBtc09wdGlvbmFsVG9UcyhlcnIubmV4dFJldHJ5RGVsYXkpLFxuICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICBpZiAoZXJyIGluc3RhbmNlb2YgQ2FuY2VsbGVkRmFpbHVyZSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIC4uLmJhc2UsXG4gICAgICAgICAgY2FuY2VsZWRGYWlsdXJlSW5mbzoge1xuICAgICAgICAgICAgZGV0YWlsczpcbiAgICAgICAgICAgICAgZXJyLmRldGFpbHMgJiYgZXJyLmRldGFpbHMubGVuZ3RoXG4gICAgICAgICAgICAgICAgPyB7IHBheWxvYWRzOiB0b1BheWxvYWRzKHBheWxvYWRDb252ZXJ0ZXIsIC4uLmVyci5kZXRhaWxzKSB9XG4gICAgICAgICAgICAgICAgOiB1bmRlZmluZWQsXG4gICAgICAgICAgfSxcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIGlmIChlcnIgaW5zdGFuY2VvZiBUaW1lb3V0RmFpbHVyZSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIC4uLmJhc2UsXG4gICAgICAgICAgdGltZW91dEZhaWx1cmVJbmZvOiB7XG4gICAgICAgICAgICB0aW1lb3V0VHlwZTogZXJyLnRpbWVvdXRUeXBlLFxuICAgICAgICAgICAgbGFzdEhlYXJ0YmVhdERldGFpbHM6IGVyci5sYXN0SGVhcnRiZWF0RGV0YWlsc1xuICAgICAgICAgICAgICA/IHsgcGF5bG9hZHM6IHRvUGF5bG9hZHMocGF5bG9hZENvbnZlcnRlciwgZXJyLmxhc3RIZWFydGJlYXREZXRhaWxzKSB9XG4gICAgICAgICAgICAgIDogdW5kZWZpbmVkLFxuICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICBpZiAoZXJyIGluc3RhbmNlb2YgU2VydmVyRmFpbHVyZSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIC4uLmJhc2UsXG4gICAgICAgICAgc2VydmVyRmFpbHVyZUluZm86IHsgbm9uUmV0cnlhYmxlOiBlcnIubm9uUmV0cnlhYmxlIH0sXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICBpZiAoZXJyIGluc3RhbmNlb2YgVGVybWluYXRlZEZhaWx1cmUpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAuLi5iYXNlLFxuICAgICAgICAgIHRlcm1pbmF0ZWRGYWlsdXJlSW5mbzoge30sXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICAvLyBKdXN0IGEgVGVtcG9yYWxGYWlsdXJlXG4gICAgICByZXR1cm4gYmFzZTtcbiAgICB9XG5cbiAgICBjb25zdCBiYXNlID0ge1xuICAgICAgc291cmNlOiBGQUlMVVJFX1NPVVJDRSxcbiAgICB9O1xuXG4gICAgaWYgKGlzRXJyb3IoZXJyKSkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4uYmFzZSxcbiAgICAgICAgbWVzc2FnZTogU3RyaW5nKGVyci5tZXNzYWdlKSA/PyAnJyxcbiAgICAgICAgc3RhY2tUcmFjZTogY3V0b2ZmU3RhY2tUcmFjZShlcnIuc3RhY2spLFxuICAgICAgICBjYXVzZTogdGhpcy5vcHRpb25hbEVycm9yVG9PcHRpb25hbEZhaWx1cmUoKGVyciBhcyBhbnkpLmNhdXNlLCBwYXlsb2FkQ29udmVydGVyKSxcbiAgICAgIH07XG4gICAgfVxuXG4gICAgY29uc3QgcmVjb21tZW5kYXRpb24gPSBgIFtBIG5vbi1FcnJvciB2YWx1ZSB3YXMgdGhyb3duIGZyb20geW91ciBjb2RlLiBXZSByZWNvbW1lbmQgdGhyb3dpbmcgRXJyb3Igb2JqZWN0cyBzbyB0aGF0IHdlIGNhbiBwcm92aWRlIGEgc3RhY2sgdHJhY2VdYDtcblxuICAgIGlmICh0eXBlb2YgZXJyID09PSAnc3RyaW5nJykge1xuICAgICAgcmV0dXJuIHsgLi4uYmFzZSwgbWVzc2FnZTogZXJyICsgcmVjb21tZW5kYXRpb24gfTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBlcnIgPT09ICdvYmplY3QnKSB7XG4gICAgICBsZXQgbWVzc2FnZSA9ICcnO1xuICAgICAgdHJ5IHtcbiAgICAgICAgbWVzc2FnZSA9IEpTT04uc3RyaW5naWZ5KGVycik7XG4gICAgICB9IGNhdGNoIChfZXJyKSB7XG4gICAgICAgIG1lc3NhZ2UgPSBTdHJpbmcoZXJyKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB7IC4uLmJhc2UsIG1lc3NhZ2U6IG1lc3NhZ2UgKyByZWNvbW1lbmRhdGlvbiB9O1xuICAgIH1cblxuICAgIHJldHVybiB7IC4uLmJhc2UsIG1lc3NhZ2U6IFN0cmluZyhlcnIpICsgcmVjb21tZW5kYXRpb24gfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZXJ0cyBhIEZhaWx1cmUgcHJvdG8gbWVzc2FnZSB0byBhIEpTIEVycm9yIG9iamVjdCBpZiBkZWZpbmVkIG9yIHJldHVybnMgdW5kZWZpbmVkLlxuICAgKi9cbiAgb3B0aW9uYWxGYWlsdXJlVG9PcHRpb25hbEVycm9yKFxuICAgIGZhaWx1cmU6IFByb3RvRmFpbHVyZSB8IHVuZGVmaW5lZCB8IG51bGwsXG4gICAgcGF5bG9hZENvbnZlcnRlcjogUGF5bG9hZENvbnZlcnRlclxuICApOiBUZW1wb3JhbEZhaWx1cmUgfCB1bmRlZmluZWQge1xuICAgIHJldHVybiBmYWlsdXJlID8gdGhpcy5mYWlsdXJlVG9FcnJvcihmYWlsdXJlLCBwYXlsb2FkQ29udmVydGVyKSA6IHVuZGVmaW5lZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZXJ0cyBhbiBlcnJvciB0byBhIEZhaWx1cmUgcHJvdG8gbWVzc2FnZSBpZiBkZWZpbmVkIG9yIHJldHVybnMgdW5kZWZpbmVkXG4gICAqL1xuICBvcHRpb25hbEVycm9yVG9PcHRpb25hbEZhaWx1cmUoZXJyOiB1bmtub3duLCBwYXlsb2FkQ29udmVydGVyOiBQYXlsb2FkQ29udmVydGVyKTogUHJvdG9GYWlsdXJlIHwgdW5kZWZpbmVkIHtcbiAgICByZXR1cm4gZXJyID8gdGhpcy5lcnJvclRvRmFpbHVyZShlcnIsIHBheWxvYWRDb252ZXJ0ZXIpIDogdW5kZWZpbmVkO1xuICB9XG59XG4iLCJpbXBvcnQgeyBQYXlsb2FkIH0gZnJvbSAnLi4vaW50ZXJmYWNlcyc7XG5cbi8qKlxuICogYFBheWxvYWRDb2RlY2AgaXMgYW4gb3B0aW9uYWwgc3RlcCB0aGF0IGhhcHBlbnMgYmV0d2VlbiB0aGUgd2lyZSBhbmQgdGhlIHtAbGluayBQYXlsb2FkQ29udmVydGVyfTpcbiAqXG4gKiBUZW1wb3JhbCBTZXJ2ZXIgPC0tPiBXaXJlIDwtLT4gYFBheWxvYWRDb2RlY2AgPC0tPiBgUGF5bG9hZENvbnZlcnRlcmAgPC0tPiBVc2VyIGNvZGVcbiAqXG4gKiBJbXBsZW1lbnQgdGhpcyB0byB0cmFuc2Zvcm0gYW4gYXJyYXkgb2Yge0BsaW5rIFBheWxvYWR9cyB0by9mcm9tIHRoZSBmb3JtYXQgc2VudCBvdmVyIHRoZSB3aXJlIGFuZCBzdG9yZWQgYnkgVGVtcG9yYWwgU2VydmVyLlxuICogQ29tbW9uIHRyYW5zZm9ybWF0aW9ucyBhcmUgZW5jcnlwdGlvbiBhbmQgY29tcHJlc3Npb24uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUGF5bG9hZENvZGVjIHtcbiAgLyoqXG4gICAqIEVuY29kZSBhbiBhcnJheSBvZiB7QGxpbmsgUGF5bG9hZH1zIGZvciBzZW5kaW5nIG92ZXIgdGhlIHdpcmUuXG4gICAqIEBwYXJhbSBwYXlsb2FkcyBNYXkgaGF2ZSBsZW5ndGggMC5cbiAgICovXG4gIGVuY29kZShwYXlsb2FkczogUGF5bG9hZFtdKTogUHJvbWlzZTxQYXlsb2FkW10+O1xuXG4gIC8qKlxuICAgKiBEZWNvZGUgYW4gYXJyYXkgb2Yge0BsaW5rIFBheWxvYWR9cyByZWNlaXZlZCBmcm9tIHRoZSB3aXJlLlxuICAgKi9cbiAgZGVjb2RlKHBheWxvYWRzOiBQYXlsb2FkW10pOiBQcm9taXNlPFBheWxvYWRbXT47XG59XG4iLCJpbXBvcnQgeyBkZWNvZGUsIGVuY29kZSB9IGZyb20gJy4uL2VuY29kaW5nJztcbmltcG9ydCB7IFBheWxvYWRDb252ZXJ0ZXJFcnJvciwgVmFsdWVFcnJvciB9IGZyb20gJy4uL2Vycm9ycyc7XG5pbXBvcnQgeyBQYXlsb2FkIH0gZnJvbSAnLi4vaW50ZXJmYWNlcyc7XG5pbXBvcnQgeyBlbmNvZGluZ0tleXMsIGVuY29kaW5nVHlwZXMsIE1FVEFEQVRBX0VOQ09ESU5HX0tFWSB9IGZyb20gJy4vdHlwZXMnO1xuXG4vKipcbiAqIFVzZWQgYnkgdGhlIGZyYW1ld29yayB0byBzZXJpYWxpemUvZGVzZXJpYWxpemUgZGF0YSBsaWtlIHBhcmFtZXRlcnMgYW5kIHJldHVybiB2YWx1ZXMuXG4gKlxuICogVGhpcyBpcyBjYWxsZWQgaW5zaWRlIHRoZSB7QGxpbmsgaHR0cHM6Ly9kb2NzLnRlbXBvcmFsLmlvL3R5cGVzY3JpcHQvZGV0ZXJtaW5pc20gfCBXb3JrZmxvdyBpc29sYXRlfS5cbiAqIFRvIHdyaXRlIGFzeW5jIGNvZGUgb3IgdXNlIE5vZGUgQVBJcyAob3IgdXNlIHBhY2thZ2VzIHRoYXQgdXNlIE5vZGUgQVBJcyksIHVzZSBhIHtAbGluayBQYXlsb2FkQ29kZWN9LlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFBheWxvYWRDb252ZXJ0ZXIge1xuICAvKipcbiAgICogQ29udmVydHMgYSB2YWx1ZSB0byBhIHtAbGluayBQYXlsb2FkfS5cbiAgICpcbiAgICogQHBhcmFtIHZhbHVlIFRoZSB2YWx1ZSB0byBjb252ZXJ0LiBFeGFtcGxlIHZhbHVlcyBpbmNsdWRlIHRoZSBXb3JrZmxvdyBhcmdzIHNlbnQgZnJvbSB0aGUgQ2xpZW50IGFuZCB0aGUgdmFsdWVzIHJldHVybmVkIGJ5IGEgV29ya2Zsb3cgb3IgQWN0aXZpdHkuXG4gICAqXG4gICAqIEByZXR1cm5zIFRoZSB7QGxpbmsgUGF5bG9hZH0uXG4gICAqXG4gICAqIFNob3VsZCB0aHJvdyB7QGxpbmsgVmFsdWVFcnJvcn0gaWYgdW5hYmxlIHRvIGNvbnZlcnQuXG4gICAqL1xuICB0b1BheWxvYWQ8VD4odmFsdWU6IFQpOiBQYXlsb2FkO1xuXG4gIC8qKlxuICAgKiBDb252ZXJ0cyBhIHtAbGluayBQYXlsb2FkfSBiYWNrIHRvIGEgdmFsdWUuXG4gICAqL1xuICBmcm9tUGF5bG9hZDxUPihwYXlsb2FkOiBQYXlsb2FkKTogVDtcbn1cblxuLyoqXG4gKiBJbXBsZW1lbnRzIGNvbnZlcnNpb24gb2YgYSBsaXN0IG9mIHZhbHVlcy5cbiAqXG4gKiBAcGFyYW0gY29udmVydGVyXG4gKiBAcGFyYW0gdmFsdWVzIEpTIHZhbHVlcyB0byBjb252ZXJ0IHRvIFBheWxvYWRzXG4gKiBAcmV0dXJuIGxpc3Qgb2Yge0BsaW5rIFBheWxvYWR9c1xuICogQHRocm93cyB7QGxpbmsgVmFsdWVFcnJvcn0gaWYgY29udmVyc2lvbiBvZiB0aGUgdmFsdWUgcGFzc2VkIGFzIHBhcmFtZXRlciBmYWlsZWQgZm9yIGFueVxuICogICAgIHJlYXNvbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRvUGF5bG9hZHMoY29udmVydGVyOiBQYXlsb2FkQ29udmVydGVyLCAuLi52YWx1ZXM6IHVua25vd25bXSk6IFBheWxvYWRbXSB8IHVuZGVmaW5lZCB7XG4gIGlmICh2YWx1ZXMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuXG4gIHJldHVybiB2YWx1ZXMubWFwKCh2YWx1ZSkgPT4gY29udmVydGVyLnRvUGF5bG9hZCh2YWx1ZSkpO1xufVxuXG4vKipcbiAqIFJ1biB7QGxpbmsgUGF5bG9hZENvbnZlcnRlci50b1BheWxvYWR9IG9uIGVhY2ggdmFsdWUgaW4gdGhlIG1hcC5cbiAqXG4gKiBAdGhyb3dzIHtAbGluayBWYWx1ZUVycm9yfSBpZiBjb252ZXJzaW9uIG9mIGFueSB2YWx1ZSBpbiB0aGUgbWFwIGZhaWxzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtYXBUb1BheWxvYWRzPEsgZXh0ZW5kcyBzdHJpbmc+KGNvbnZlcnRlcjogUGF5bG9hZENvbnZlcnRlciwgbWFwOiBSZWNvcmQ8SywgYW55Pik6IFJlY29yZDxLLCBQYXlsb2FkPiB7XG4gIHJldHVybiBPYmplY3QuZnJvbUVudHJpZXMoXG4gICAgT2JqZWN0LmVudHJpZXMobWFwKS5tYXAoKFtrLCB2XSk6IFtLLCBQYXlsb2FkXSA9PiBbayBhcyBLLCBjb252ZXJ0ZXIudG9QYXlsb2FkKHYpXSlcbiAgKSBhcyBSZWNvcmQ8SywgUGF5bG9hZD47XG59XG5cbi8qKlxuICogSW1wbGVtZW50cyBjb252ZXJzaW9uIG9mIGFuIGFycmF5IG9mIHZhbHVlcyBvZiBkaWZmZXJlbnQgdHlwZXMuIFVzZWZ1bCBmb3IgZGVzZXJpYWxpemluZ1xuICogYXJndW1lbnRzIG9mIGZ1bmN0aW9uIGludm9jYXRpb25zLlxuICpcbiAqIEBwYXJhbSBjb252ZXJ0ZXJcbiAqIEBwYXJhbSBpbmRleCBpbmRleCBvZiB0aGUgdmFsdWUgaW4gdGhlIHBheWxvYWRzXG4gKiBAcGFyYW0gcGF5bG9hZHMgc2VyaWFsaXplZCB2YWx1ZSB0byBjb252ZXJ0IHRvIEpTIHZhbHVlcy5cbiAqIEByZXR1cm4gY29udmVydGVkIEpTIHZhbHVlXG4gKiBAdGhyb3dzIHtAbGluayBQYXlsb2FkQ29udmVydGVyRXJyb3J9IGlmIGNvbnZlcnNpb24gb2YgdGhlIGRhdGEgcGFzc2VkIGFzIHBhcmFtZXRlciBmYWlsZWQgZm9yIGFueVxuICogICAgIHJlYXNvbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZyb21QYXlsb2Fkc0F0SW5kZXg8VD4oY29udmVydGVyOiBQYXlsb2FkQ29udmVydGVyLCBpbmRleDogbnVtYmVyLCBwYXlsb2Fkcz86IFBheWxvYWRbXSB8IG51bGwpOiBUIHtcbiAgLy8gVG8gbWFrZSBhZGRpbmcgYXJndW1lbnRzIGEgYmFja3dhcmRzIGNvbXBhdGlibGUgY2hhbmdlXG4gIGlmIChwYXlsb2FkcyA9PT0gdW5kZWZpbmVkIHx8IHBheWxvYWRzID09PSBudWxsIHx8IGluZGV4ID49IHBheWxvYWRzLmxlbmd0aCkge1xuICAgIHJldHVybiB1bmRlZmluZWQgYXMgYW55O1xuICB9XG4gIHJldHVybiBjb252ZXJ0ZXIuZnJvbVBheWxvYWQocGF5bG9hZHNbaW5kZXhdKTtcbn1cblxuLyoqXG4gKiBSdW4ge0BsaW5rIFBheWxvYWRDb252ZXJ0ZXIuZnJvbVBheWxvYWR9IG9uIGVhY2ggdmFsdWUgaW4gdGhlIGFycmF5LlxuICovXG5leHBvcnQgZnVuY3Rpb24gYXJyYXlGcm9tUGF5bG9hZHMoY29udmVydGVyOiBQYXlsb2FkQ29udmVydGVyLCBwYXlsb2Fkcz86IFBheWxvYWRbXSB8IG51bGwpOiB1bmtub3duW10ge1xuICBpZiAoIXBheWxvYWRzKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG4gIHJldHVybiBwYXlsb2Fkcy5tYXAoKHBheWxvYWQ6IFBheWxvYWQpID0+IGNvbnZlcnRlci5mcm9tUGF5bG9hZChwYXlsb2FkKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYXBGcm9tUGF5bG9hZHM8SyBleHRlbmRzIHN0cmluZz4oXG4gIGNvbnZlcnRlcjogUGF5bG9hZENvbnZlcnRlcixcbiAgbWFwPzogUmVjb3JkPEssIFBheWxvYWQ+IHwgbnVsbCB8IHVuZGVmaW5lZFxuKTogUmVjb3JkPEssIHVua25vd24+IHwgdW5kZWZpbmVkIHtcbiAgaWYgKG1hcCA9PSBudWxsKSByZXR1cm4gdW5kZWZpbmVkO1xuICByZXR1cm4gT2JqZWN0LmZyb21FbnRyaWVzKFxuICAgIE9iamVjdC5lbnRyaWVzKG1hcCkubWFwKChbaywgcGF5bG9hZF0pOiBbSywgdW5rbm93bl0gPT4ge1xuICAgICAgY29uc3QgdmFsdWUgPSBjb252ZXJ0ZXIuZnJvbVBheWxvYWQocGF5bG9hZCBhcyBQYXlsb2FkKTtcbiAgICAgIHJldHVybiBbayBhcyBLLCB2YWx1ZV07XG4gICAgfSlcbiAgKSBhcyBSZWNvcmQ8SywgdW5rbm93bj47XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUGF5bG9hZENvbnZlcnRlcldpdGhFbmNvZGluZyB7XG4gIC8qKlxuICAgKiBDb252ZXJ0cyBhIHZhbHVlIHRvIGEge0BsaW5rIFBheWxvYWR9LlxuICAgKlxuICAgKiBAcGFyYW0gdmFsdWUgVGhlIHZhbHVlIHRvIGNvbnZlcnQuIEV4YW1wbGUgdmFsdWVzIGluY2x1ZGUgdGhlIFdvcmtmbG93IGFyZ3Mgc2VudCBmcm9tIHRoZSBDbGllbnQgYW5kIHRoZSB2YWx1ZXMgcmV0dXJuZWQgYnkgYSBXb3JrZmxvdyBvciBBY3Rpdml0eS5cbiAgICogQHJldHVybnMgVGhlIHtAbGluayBQYXlsb2FkfSwgb3IgYHVuZGVmaW5lZGAgaWYgdW5hYmxlIHRvIGNvbnZlcnQuXG4gICAqL1xuICB0b1BheWxvYWQ8VD4odmFsdWU6IFQpOiBQYXlsb2FkIHwgdW5kZWZpbmVkO1xuXG4gIC8qKlxuICAgKiBDb252ZXJ0cyBhIHtAbGluayBQYXlsb2FkfSBiYWNrIHRvIGEgdmFsdWUuXG4gICAqL1xuICBmcm9tUGF5bG9hZDxUPihwYXlsb2FkOiBQYXlsb2FkKTogVDtcblxuICByZWFkb25seSBlbmNvZGluZ1R5cGU6IHN0cmluZztcbn1cblxuLyoqXG4gKiBUcmllcyB0byBjb252ZXJ0IHZhbHVlcyB0byB7QGxpbmsgUGF5bG9hZH1zIHVzaW5nIHRoZSB7QGxpbmsgUGF5bG9hZENvbnZlcnRlcldpdGhFbmNvZGluZ31zIHByb3ZpZGVkIHRvIHRoZSBjb25zdHJ1Y3RvciwgaW4gdGhlIG9yZGVyIHByb3ZpZGVkLlxuICpcbiAqIENvbnZlcnRzIFBheWxvYWRzIHRvIHZhbHVlcyBiYXNlZCBvbiB0aGUgYFBheWxvYWQubWV0YWRhdGEuZW5jb2RpbmdgIGZpZWxkLCB3aGljaCBtYXRjaGVzIHRoZSB7QGxpbmsgUGF5bG9hZENvbnZlcnRlcldpdGhFbmNvZGluZy5lbmNvZGluZ1R5cGV9XG4gKiBvZiB0aGUgY29udmVydGVyIHRoYXQgY3JlYXRlZCB0aGUgUGF5bG9hZC5cbiAqL1xuZXhwb3J0IGNsYXNzIENvbXBvc2l0ZVBheWxvYWRDb252ZXJ0ZXIgaW1wbGVtZW50cyBQYXlsb2FkQ29udmVydGVyIHtcbiAgcmVhZG9ubHkgY29udmVydGVyczogUGF5bG9hZENvbnZlcnRlcldpdGhFbmNvZGluZ1tdO1xuICByZWFkb25seSBjb252ZXJ0ZXJCeUVuY29kaW5nOiBNYXA8c3RyaW5nLCBQYXlsb2FkQ29udmVydGVyV2l0aEVuY29kaW5nPiA9IG5ldyBNYXAoKTtcblxuICBjb25zdHJ1Y3RvciguLi5jb252ZXJ0ZXJzOiBQYXlsb2FkQ29udmVydGVyV2l0aEVuY29kaW5nW10pIHtcbiAgICBpZiAoY29udmVydGVycy5sZW5ndGggPT09IDApIHtcbiAgICAgIHRocm93IG5ldyBQYXlsb2FkQ29udmVydGVyRXJyb3IoJ011c3QgcHJvdmlkZSBhdCBsZWFzdCBvbmUgUGF5bG9hZENvbnZlcnRlcldpdGhFbmNvZGluZycpO1xuICAgIH1cblxuICAgIHRoaXMuY29udmVydGVycyA9IGNvbnZlcnRlcnM7XG4gICAgZm9yIChjb25zdCBjb252ZXJ0ZXIgb2YgY29udmVydGVycykge1xuICAgICAgdGhpcy5jb252ZXJ0ZXJCeUVuY29kaW5nLnNldChjb252ZXJ0ZXIuZW5jb2RpbmdUeXBlLCBjb252ZXJ0ZXIpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUcmllcyB0byBydW4gYC50b1BheWxvYWQodmFsdWUpYCBvbiBlYWNoIGNvbnZlcnRlciBpbiB0aGUgb3JkZXIgcHJvdmlkZWQgYXQgY29uc3RydWN0aW9uLlxuICAgKiBSZXR1cm5zIHRoZSBmaXJzdCBzdWNjZXNzZnVsIHJlc3VsdCwgdGhyb3dzIHtAbGluayBWYWx1ZUVycm9yfSBpZiB0aGVyZSBpcyBubyBjb252ZXJ0ZXIgdGhhdCBjYW4gaGFuZGxlIHRoZSB2YWx1ZS5cbiAgICovXG4gIHB1YmxpYyB0b1BheWxvYWQ8VD4odmFsdWU6IFQpOiBQYXlsb2FkIHtcbiAgICBmb3IgKGNvbnN0IGNvbnZlcnRlciBvZiB0aGlzLmNvbnZlcnRlcnMpIHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGNvbnZlcnRlci50b1BheWxvYWQodmFsdWUpO1xuICAgICAgaWYgKHJlc3VsdCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhyb3cgbmV3IFZhbHVlRXJyb3IoYFVuYWJsZSB0byBjb252ZXJ0ICR7dmFsdWV9IHRvIHBheWxvYWRgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSdW4ge0BsaW5rIFBheWxvYWRDb252ZXJ0ZXJXaXRoRW5jb2RpbmcuZnJvbVBheWxvYWR9IGJhc2VkIG9uIHRoZSBgZW5jb2RpbmdgIG1ldGFkYXRhIG9mIHRoZSB7QGxpbmsgUGF5bG9hZH0uXG4gICAqL1xuICBwdWJsaWMgZnJvbVBheWxvYWQ8VD4ocGF5bG9hZDogUGF5bG9hZCk6IFQge1xuICAgIGlmIChwYXlsb2FkLm1ldGFkYXRhID09PSB1bmRlZmluZWQgfHwgcGF5bG9hZC5tZXRhZGF0YSA9PT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IFZhbHVlRXJyb3IoJ01pc3NpbmcgcGF5bG9hZCBtZXRhZGF0YScpO1xuICAgIH1cbiAgICBjb25zdCBlbmNvZGluZyA9IGRlY29kZShwYXlsb2FkLm1ldGFkYXRhW01FVEFEQVRBX0VOQ09ESU5HX0tFWV0pO1xuICAgIGNvbnN0IGNvbnZlcnRlciA9IHRoaXMuY29udmVydGVyQnlFbmNvZGluZy5nZXQoZW5jb2RpbmcpO1xuICAgIGlmIChjb252ZXJ0ZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IFZhbHVlRXJyb3IoYFVua25vd24gZW5jb2Rpbmc6ICR7ZW5jb2Rpbmd9YCk7XG4gICAgfVxuICAgIHJldHVybiBjb252ZXJ0ZXIuZnJvbVBheWxvYWQocGF5bG9hZCk7XG4gIH1cbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBiZXR3ZWVuIEpTIHVuZGVmaW5lZCBhbmQgTlVMTCBQYXlsb2FkXG4gKi9cbmV4cG9ydCBjbGFzcyBVbmRlZmluZWRQYXlsb2FkQ29udmVydGVyIGltcGxlbWVudHMgUGF5bG9hZENvbnZlcnRlcldpdGhFbmNvZGluZyB7XG4gIHB1YmxpYyBlbmNvZGluZ1R5cGUgPSBlbmNvZGluZ1R5cGVzLk1FVEFEQVRBX0VOQ09ESU5HX05VTEw7XG5cbiAgcHVibGljIHRvUGF5bG9hZCh2YWx1ZTogdW5rbm93bik6IFBheWxvYWQgfCB1bmRlZmluZWQge1xuICAgIGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBtZXRhZGF0YToge1xuICAgICAgICBbTUVUQURBVEFfRU5DT0RJTkdfS0VZXTogZW5jb2RpbmdLZXlzLk1FVEFEQVRBX0VOQ09ESU5HX05VTEwsXG4gICAgICB9LFxuICAgIH07XG4gIH1cblxuICBwdWJsaWMgZnJvbVBheWxvYWQ8VD4oX2NvbnRlbnQ6IFBheWxvYWQpOiBUIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkIGFzIGFueTsgLy8gSnVzdCByZXR1cm4gdW5kZWZpbmVkXG4gIH1cbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBiZXR3ZWVuIGJpbmFyeSBkYXRhIHR5cGVzIGFuZCBSQVcgUGF5bG9hZFxuICovXG5leHBvcnQgY2xhc3MgQmluYXJ5UGF5bG9hZENvbnZlcnRlciBpbXBsZW1lbnRzIFBheWxvYWRDb252ZXJ0ZXJXaXRoRW5jb2Rpbmcge1xuICBwdWJsaWMgZW5jb2RpbmdUeXBlID0gZW5jb2RpbmdUeXBlcy5NRVRBREFUQV9FTkNPRElOR19SQVc7XG5cbiAgcHVibGljIHRvUGF5bG9hZCh2YWx1ZTogdW5rbm93bik6IFBheWxvYWQgfCB1bmRlZmluZWQge1xuICAgIGlmICghKHZhbHVlIGluc3RhbmNlb2YgVWludDhBcnJheSkpIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIG1ldGFkYXRhOiB7XG4gICAgICAgIFtNRVRBREFUQV9FTkNPRElOR19LRVldOiBlbmNvZGluZ0tleXMuTUVUQURBVEFfRU5DT0RJTkdfUkFXLFxuICAgICAgfSxcbiAgICAgIGRhdGE6IHZhbHVlLFxuICAgIH07XG4gIH1cblxuICBwdWJsaWMgZnJvbVBheWxvYWQ8VD4oY29udGVudDogUGF5bG9hZCk6IFQge1xuICAgIHJldHVybiAoXG4gICAgICAvLyBXcmFwIHdpdGggVWludDhBcnJheSBmcm9tIHRoaXMgY29udGV4dCB0byBlbnN1cmUgYGluc3RhbmNlb2ZgIHdvcmtzXG4gICAgICAoXG4gICAgICAgIGNvbnRlbnQuZGF0YSA/IG5ldyBVaW50OEFycmF5KGNvbnRlbnQuZGF0YS5idWZmZXIsIGNvbnRlbnQuZGF0YS5ieXRlT2Zmc2V0LCBjb250ZW50LmRhdGEubGVuZ3RoKSA6IGNvbnRlbnQuZGF0YVxuICAgICAgKSBhcyBhbnlcbiAgICApO1xuICB9XG59XG5cbi8qKlxuICogQ29udmVydHMgYmV0d2VlbiBub24tdW5kZWZpbmVkIHZhbHVlcyBhbmQgc2VyaWFsaXplZCBKU09OIFBheWxvYWRcbiAqL1xuZXhwb3J0IGNsYXNzIEpzb25QYXlsb2FkQ29udmVydGVyIGltcGxlbWVudHMgUGF5bG9hZENvbnZlcnRlcldpdGhFbmNvZGluZyB7XG4gIHB1YmxpYyBlbmNvZGluZ1R5cGUgPSBlbmNvZGluZ1R5cGVzLk1FVEFEQVRBX0VOQ09ESU5HX0pTT047XG5cbiAgcHVibGljIHRvUGF5bG9hZCh2YWx1ZTogdW5rbm93bik6IFBheWxvYWQgfCB1bmRlZmluZWQge1xuICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGxldCBqc29uO1xuICAgIHRyeSB7XG4gICAgICBqc29uID0gSlNPTi5zdHJpbmdpZnkodmFsdWUpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgbWV0YWRhdGE6IHtcbiAgICAgICAgW01FVEFEQVRBX0VOQ09ESU5HX0tFWV06IGVuY29kaW5nS2V5cy5NRVRBREFUQV9FTkNPRElOR19KU09OLFxuICAgICAgfSxcbiAgICAgIGRhdGE6IGVuY29kZShqc29uKSxcbiAgICB9O1xuICB9XG5cbiAgcHVibGljIGZyb21QYXlsb2FkPFQ+KGNvbnRlbnQ6IFBheWxvYWQpOiBUIHtcbiAgICBpZiAoY29udGVudC5kYXRhID09PSB1bmRlZmluZWQgfHwgY29udGVudC5kYXRhID09PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgVmFsdWVFcnJvcignR290IHBheWxvYWQgd2l0aCBubyBkYXRhJyk7XG4gICAgfVxuICAgIHJldHVybiBKU09OLnBhcnNlKGRlY29kZShjb250ZW50LmRhdGEpKTtcbiAgfVxufVxuXG4vKipcbiAqIENvbnZlcnRzIFNlYXJjaCBBdHRyaWJ1dGUgdmFsdWVzIHVzaW5nIEpzb25QYXlsb2FkQ29udmVydGVyXG4gKi9cbmV4cG9ydCBjbGFzcyBTZWFyY2hBdHRyaWJ1dGVQYXlsb2FkQ29udmVydGVyIGltcGxlbWVudHMgUGF5bG9hZENvbnZlcnRlciB7XG4gIGpzb25Db252ZXJ0ZXIgPSBuZXcgSnNvblBheWxvYWRDb252ZXJ0ZXIoKTtcbiAgdmFsaWROb25EYXRlVHlwZXMgPSBbJ3N0cmluZycsICdudW1iZXInLCAnYm9vbGVhbiddO1xuXG4gIHB1YmxpYyB0b1BheWxvYWQodmFsdWVzOiB1bmtub3duKTogUGF5bG9hZCB7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KHZhbHVlcykpIHtcbiAgICAgIHRocm93IG5ldyBWYWx1ZUVycm9yKGBTZWFyY2hBdHRyaWJ1dGUgdmFsdWUgbXVzdCBiZSBhbiBhcnJheWApO1xuICAgIH1cblxuICAgIGlmICh2YWx1ZXMubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3QgZmlyc3RWYWx1ZSA9IHZhbHVlc1swXTtcbiAgICAgIGNvbnN0IGZpcnN0VHlwZSA9IHR5cGVvZiBmaXJzdFZhbHVlO1xuICAgICAgaWYgKGZpcnN0VHlwZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgZm9yIChjb25zdCBbaWR4LCB2YWx1ZV0gb2YgdmFsdWVzLmVudHJpZXMoKSkge1xuICAgICAgICAgIGlmICghKHZhbHVlIGluc3RhbmNlb2YgRGF0ZSkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBWYWx1ZUVycm9yKFxuICAgICAgICAgICAgICBgU2VhcmNoQXR0cmlidXRlIHZhbHVlcyBtdXN0IGFycmF5cyBvZiBzdHJpbmdzLCBudW1iZXJzLCBib29sZWFucywgb3IgRGF0ZXMuIFRoZSB2YWx1ZSAke3ZhbHVlfSBhdCBpbmRleCAke2lkeH0gaXMgb2YgdHlwZSAke3R5cGVvZiB2YWx1ZX1gXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKCF0aGlzLnZhbGlkTm9uRGF0ZVR5cGVzLmluY2x1ZGVzKGZpcnN0VHlwZSkpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgVmFsdWVFcnJvcihgU2VhcmNoQXR0cmlidXRlIGFycmF5IHZhbHVlcyBtdXN0IGJlOiBzdHJpbmcgfCBudW1iZXIgfCBib29sZWFuIHwgRGF0ZWApO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChjb25zdCBbaWR4LCB2YWx1ZV0gb2YgdmFsdWVzLmVudHJpZXMoKSkge1xuICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgIT09IGZpcnN0VHlwZSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFZhbHVlRXJyb3IoXG4gICAgICAgICAgICAgIGBBbGwgU2VhcmNoQXR0cmlidXRlIGFycmF5IHZhbHVlcyBtdXN0IGJlIG9mIHRoZSBzYW1lIHR5cGUuIFRoZSBmaXJzdCB2YWx1ZSAke2ZpcnN0VmFsdWV9IG9mIHR5cGUgJHtmaXJzdFR5cGV9IGRvZXNuJ3QgbWF0Y2ggdmFsdWUgJHt2YWx1ZX0gb2YgdHlwZSAke3R5cGVvZiB2YWx1ZX0gYXQgaW5kZXggJHtpZHh9YFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBKU09OLnN0cmluZ2lmeSB0YWtlcyBjYXJlIG9mIGNvbnZlcnRpbmcgRGF0ZXMgdG8gSVNPIHN0cmluZ3NcbiAgICBjb25zdCByZXQgPSB0aGlzLmpzb25Db252ZXJ0ZXIudG9QYXlsb2FkKHZhbHVlcyk7XG4gICAgaWYgKHJldCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgVmFsdWVFcnJvcignQ291bGQgbm90IGNvbnZlcnQgc2VhcmNoIGF0dHJpYnV0ZXMgdG8gcGF5bG9hZHMnKTtcbiAgICB9XG4gICAgcmV0dXJuIHJldDtcbiAgfVxuXG4gIC8qKlxuICAgKiBEYXRldGltZSBTZWFyY2ggQXR0cmlidXRlIHZhbHVlcyBhcmUgY29udmVydGVkIHRvIGBEYXRlYHNcbiAgICovXG4gIHB1YmxpYyBmcm9tUGF5bG9hZDxUPihwYXlsb2FkOiBQYXlsb2FkKTogVCB7XG4gICAgaWYgKHBheWxvYWQubWV0YWRhdGEgPT09IHVuZGVmaW5lZCB8fCBwYXlsb2FkLm1ldGFkYXRhID09PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgVmFsdWVFcnJvcignTWlzc2luZyBwYXlsb2FkIG1ldGFkYXRhJyk7XG4gICAgfVxuXG4gICAgY29uc3QgdmFsdWUgPSB0aGlzLmpzb25Db252ZXJ0ZXIuZnJvbVBheWxvYWQocGF5bG9hZCk7XG4gICAgbGV0IGFycmF5V3JhcHBlZFZhbHVlID0gQXJyYXkuaXNBcnJheSh2YWx1ZSkgPyB2YWx1ZSA6IFt2YWx1ZV07XG5cbiAgICBjb25zdCBzZWFyY2hBdHRyaWJ1dGVUeXBlID0gZGVjb2RlKHBheWxvYWQubWV0YWRhdGEudHlwZSk7XG4gICAgaWYgKHNlYXJjaEF0dHJpYnV0ZVR5cGUgPT09ICdEYXRldGltZScpIHtcbiAgICAgIGFycmF5V3JhcHBlZFZhbHVlID0gYXJyYXlXcmFwcGVkVmFsdWUubWFwKChkYXRlU3RyaW5nKSA9PiBuZXcgRGF0ZShkYXRlU3RyaW5nKSk7XG4gICAgfVxuICAgIHJldHVybiBhcnJheVdyYXBwZWRWYWx1ZSBhcyB1bmtub3duIGFzIFQ7XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IHNlYXJjaEF0dHJpYnV0ZVBheWxvYWRDb252ZXJ0ZXIgPSBuZXcgU2VhcmNoQXR0cmlidXRlUGF5bG9hZENvbnZlcnRlcigpO1xuXG5leHBvcnQgY2xhc3MgRGVmYXVsdFBheWxvYWRDb252ZXJ0ZXIgZXh0ZW5kcyBDb21wb3NpdGVQYXlsb2FkQ29udmVydGVyIHtcbiAgLy8gTWF0Y2ggdGhlIG9yZGVyIHVzZWQgaW4gb3RoZXIgU0RLcywgYnV0IGV4Y2x1ZGUgUHJvdG9idWYgY29udmVydGVycyBzbyB0aGF0IHRoZSBjb2RlLCBpbmNsdWRpbmdcbiAgLy8gYHByb3RvMy1qc29uLXNlcmlhbGl6ZXJgLCBkb2Vzbid0IHRha2Ugc3BhY2UgaW4gV29ya2Zsb3cgYnVuZGxlcyB0aGF0IGRvbid0IHVzZSBQcm90b2J1ZnMuIFRvIHVzZSBQcm90b2J1ZnMsIHVzZVxuICAvLyB7QGxpbmsgRGVmYXVsdFBheWxvYWRDb252ZXJ0ZXJXaXRoUHJvdG9idWZzfS5cbiAgLy9cbiAgLy8gR28gU0RLOlxuICAvLyBodHRwczovL2dpdGh1Yi5jb20vdGVtcG9yYWxpby9zZGstZ28vYmxvYi81ZTU2NDVmMGM1NTBkY2Y3MTdjMDk1YWUzMmM3NmE3MDg3ZDJlOTg1L2NvbnZlcnRlci9kZWZhdWx0X2RhdGFfY29udmVydGVyLmdvI0wyOFxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcihuZXcgVW5kZWZpbmVkUGF5bG9hZENvbnZlcnRlcigpLCBuZXcgQmluYXJ5UGF5bG9hZENvbnZlcnRlcigpLCBuZXcgSnNvblBheWxvYWRDb252ZXJ0ZXIoKSk7XG4gIH1cbn1cblxuLyoqXG4gKiBUaGUgZGVmYXVsdCB7QGxpbmsgUGF5bG9hZENvbnZlcnRlcn0gdXNlZCBieSB0aGUgU0RLLiBTdXBwb3J0cyBgVWludDhBcnJheWAgYW5kIEpTT04gc2VyaWFsaXphYmxlcyAoc28gaWZcbiAqIHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9KU09OL3N0cmluZ2lmeSNkZXNjcmlwdGlvbiB8IGBKU09OLnN0cmluZ2lmeSh5b3VyQXJnT3JSZXR2YWwpYH1cbiAqIHdvcmtzLCB0aGUgZGVmYXVsdCBwYXlsb2FkIGNvbnZlcnRlciB3aWxsIHdvcmspLlxuICpcbiAqIFRvIGFsc28gc3VwcG9ydCBQcm90b2J1ZnMsIGNyZWF0ZSBhIGN1c3RvbSBwYXlsb2FkIGNvbnZlcnRlciB3aXRoIHtAbGluayBEZWZhdWx0UGF5bG9hZENvbnZlcnRlcn06XG4gKlxuICogYGNvbnN0IG15Q29udmVydGVyID0gbmV3IERlZmF1bHRQYXlsb2FkQ29udmVydGVyKHsgcHJvdG9idWZSb290IH0pYFxuICovXG5leHBvcnQgY29uc3QgZGVmYXVsdFBheWxvYWRDb252ZXJ0ZXIgPSBuZXcgRGVmYXVsdFBheWxvYWRDb252ZXJ0ZXIoKTtcbiIsImltcG9ydCB7IGVuY29kZSB9IGZyb20gJy4uL2VuY29kaW5nJztcblxuZXhwb3J0IGNvbnN0IE1FVEFEQVRBX0VOQ09ESU5HX0tFWSA9ICdlbmNvZGluZyc7XG5leHBvcnQgY29uc3QgZW5jb2RpbmdUeXBlcyA9IHtcbiAgTUVUQURBVEFfRU5DT0RJTkdfTlVMTDogJ2JpbmFyeS9udWxsJyxcbiAgTUVUQURBVEFfRU5DT0RJTkdfUkFXOiAnYmluYXJ5L3BsYWluJyxcbiAgTUVUQURBVEFfRU5DT0RJTkdfSlNPTjogJ2pzb24vcGxhaW4nLFxuICBNRVRBREFUQV9FTkNPRElOR19QUk9UT0JVRl9KU09OOiAnanNvbi9wcm90b2J1ZicsXG4gIE1FVEFEQVRBX0VOQ09ESU5HX1BST1RPQlVGOiAnYmluYXJ5L3Byb3RvYnVmJyxcbn0gYXMgY29uc3Q7XG5leHBvcnQgdHlwZSBFbmNvZGluZ1R5cGUgPSAodHlwZW9mIGVuY29kaW5nVHlwZXMpW2tleW9mIHR5cGVvZiBlbmNvZGluZ1R5cGVzXTtcblxuZXhwb3J0IGNvbnN0IGVuY29kaW5nS2V5cyA9IHtcbiAgTUVUQURBVEFfRU5DT0RJTkdfTlVMTDogZW5jb2RlKGVuY29kaW5nVHlwZXMuTUVUQURBVEFfRU5DT0RJTkdfTlVMTCksXG4gIE1FVEFEQVRBX0VOQ09ESU5HX1JBVzogZW5jb2RlKGVuY29kaW5nVHlwZXMuTUVUQURBVEFfRU5DT0RJTkdfUkFXKSxcbiAgTUVUQURBVEFfRU5DT0RJTkdfSlNPTjogZW5jb2RlKGVuY29kaW5nVHlwZXMuTUVUQURBVEFfRU5DT0RJTkdfSlNPTiksXG4gIE1FVEFEQVRBX0VOQ09ESU5HX1BST1RPQlVGX0pTT046IGVuY29kZShlbmNvZGluZ1R5cGVzLk1FVEFEQVRBX0VOQ09ESU5HX1BST1RPQlVGX0pTT04pLFxuICBNRVRBREFUQV9FTkNPRElOR19QUk9UT0JVRjogZW5jb2RlKGVuY29kaW5nVHlwZXMuTUVUQURBVEFfRU5DT0RJTkdfUFJPVE9CVUYpLFxufSBhcyBjb25zdDtcblxuZXhwb3J0IGNvbnN0IE1FVEFEQVRBX01FU1NBR0VfVFlQRV9LRVkgPSAnbWVzc2FnZVR5cGUnO1xuIiwiaW1wb3J0ICogYXMgdGltZSBmcm9tICcuL3RpbWUnO1xuaW1wb3J0IHsgdHlwZSBUaW1lc3RhbXAsIER1cmF0aW9uIH0gZnJvbSAnLi90aW1lJztcblxuLyoqXG4gKiBMb3NzeSBjb252ZXJzaW9uIGZ1bmN0aW9uIGZyb20gVGltZXN0YW1wIHRvIG51bWJlciBkdWUgdG8gcG9zc2libGUgb3ZlcmZsb3cuXG4gKiBJZiB0cyBpcyBudWxsIG9yIHVuZGVmaW5lZCByZXR1cm5zIHVuZGVmaW5lZC5cbiAqXG4gKiBAaGlkZGVuXG4gKiBAZGVwcmVjYXRlZCAtIG1lYW50IGZvciBpbnRlcm5hbCB1c2Ugb25seVxuICovXG5leHBvcnQgZnVuY3Rpb24gb3B0aW9uYWxUc1RvTXModHM6IFRpbWVzdGFtcCB8IG51bGwgfCB1bmRlZmluZWQpOiBudW1iZXIgfCB1bmRlZmluZWQge1xuICByZXR1cm4gdGltZS5vcHRpb25hbFRzVG9Ncyh0cyk7XG59XG5cbi8qKlxuICogTG9zc3kgY29udmVyc2lvbiBmdW5jdGlvbiBmcm9tIFRpbWVzdGFtcCB0byBudW1iZXIgZHVlIHRvIHBvc3NpYmxlIG92ZXJmbG93XG4gKlxuICogQGhpZGRlblxuICogQGRlcHJlY2F0ZWQgLSBtZWFudCBmb3IgaW50ZXJuYWwgdXNlIG9ubHlcbiAqIEBkZXByZWNhdGVkIC0gbWVhbnQgZm9yIGludGVybmFsIHVzZSBvbmx5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0c1RvTXModHM6IFRpbWVzdGFtcCB8IG51bGwgfCB1bmRlZmluZWQpOiBudW1iZXIge1xuICByZXR1cm4gdGltZS50c1RvTXModHMpO1xufVxuXG4vKipcbiAqIEBoaWRkZW5cbiAqIEBkZXByZWNhdGVkIC0gbWVhbnQgZm9yIGludGVybmFsIHVzZSBvbmx5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtc051bWJlclRvVHMobWlsbGlzOiBudW1iZXIpOiBUaW1lc3RhbXAge1xuICByZXR1cm4gdGltZS5tc051bWJlclRvVHMobWlsbGlzKTtcbn1cblxuLyoqXG4gKiBAaGlkZGVuXG4gKiBAZGVwcmVjYXRlZCAtIG1lYW50IGZvciBpbnRlcm5hbCB1c2Ugb25seVxuICovXG5leHBvcnQgZnVuY3Rpb24gbXNUb1RzKHN0cjogRHVyYXRpb24pOiBUaW1lc3RhbXAge1xuICByZXR1cm4gdGltZS5tc1RvVHMoc3RyKTtcbn1cblxuLyoqXG4gKiBAaGlkZGVuXG4gKiBAZGVwcmVjYXRlZCAtIG1lYW50IGZvciBpbnRlcm5hbCB1c2Ugb25seVxuICovXG5leHBvcnQgZnVuY3Rpb24gbXNPcHRpb25hbFRvVHMoc3RyOiBEdXJhdGlvbiB8IHVuZGVmaW5lZCk6IFRpbWVzdGFtcCB8IHVuZGVmaW5lZCB7XG4gIHJldHVybiB0aW1lLm1zT3B0aW9uYWxUb1RzKHN0cik7XG59XG5cbi8qKlxuICogQGhpZGRlblxuICogQGRlcHJlY2F0ZWQgLSBtZWFudCBmb3IgaW50ZXJuYWwgdXNlIG9ubHlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1zT3B0aW9uYWxUb051bWJlcih2YWw6IER1cmF0aW9uIHwgdW5kZWZpbmVkKTogbnVtYmVyIHwgdW5kZWZpbmVkIHtcbiAgcmV0dXJuIHRpbWUubXNPcHRpb25hbFRvTnVtYmVyKHZhbCk7XG59XG5cbi8qKlxuICogQGhpZGRlblxuICogQGRlcHJlY2F0ZWQgLSBtZWFudCBmb3IgaW50ZXJuYWwgdXNlIG9ubHlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1zVG9OdW1iZXIodmFsOiBEdXJhdGlvbik6IG51bWJlciB7XG4gIHJldHVybiB0aW1lLm1zVG9OdW1iZXIodmFsKTtcbn1cblxuLyoqXG4gKiBAaGlkZGVuXG4gKiBAZGVwcmVjYXRlZCAtIG1lYW50IGZvciBpbnRlcm5hbCB1c2Ugb25seVxuICovXG5leHBvcnQgZnVuY3Rpb24gdHNUb0RhdGUodHM6IFRpbWVzdGFtcCk6IERhdGUge1xuICByZXR1cm4gdGltZS50c1RvRGF0ZSh0cyk7XG59XG5cbi8qKlxuICogQGhpZGRlblxuICogQGRlcHJlY2F0ZWQgLSBtZWFudCBmb3IgaW50ZXJuYWwgdXNlIG9ubHlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG9wdGlvbmFsVHNUb0RhdGUodHM6IFRpbWVzdGFtcCB8IG51bGwgfCB1bmRlZmluZWQpOiBEYXRlIHwgdW5kZWZpbmVkIHtcbiAgcmV0dXJuIHRpbWUub3B0aW9uYWxUc1RvRGF0ZSh0cyk7XG59XG4iLCIvLyBQYXN0ZWQgd2l0aCBtb2RpZmljYXRpb25zIGZyb206IGh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9hbm9ueWNvL0Zhc3Rlc3RTbWFsbGVzdFRleHRFbmNvZGVyRGVjb2Rlci9tYXN0ZXIvRW5jb2RlckRlY29kZXJUb2dldGhlci5zcmMuanNcbi8qIGVzbGludCBuby1mYWxsdGhyb3VnaDogMCAqL1xuXG5jb25zdCBmcm9tQ2hhckNvZGUgPSBTdHJpbmcuZnJvbUNoYXJDb2RlO1xuY29uc3QgZW5jb2RlclJlZ2V4cCA9IC9bXFx4ODAtXFx1RDdmZlxcdURDMDAtXFx1RkZGRl18W1xcdUQ4MDAtXFx1REJGRl1bXFx1REMwMC1cXHVERkZGXT8vZztcbmNvbnN0IHRtcEJ1ZmZlclUxNiA9IG5ldyBVaW50MTZBcnJheSgzMik7XG5cbmV4cG9ydCBjbGFzcyBUZXh0RGVjb2RlciB7XG4gIGRlY29kZShpbnB1dEFycmF5T3JCdWZmZXI6IFVpbnQ4QXJyYXkgfCBBcnJheUJ1ZmZlciB8IFNoYXJlZEFycmF5QnVmZmVyKTogc3RyaW5nIHtcbiAgICBjb25zdCBpbnB1dEFzOCA9IGlucHV0QXJyYXlPckJ1ZmZlciBpbnN0YW5jZW9mIFVpbnQ4QXJyYXkgPyBpbnB1dEFycmF5T3JCdWZmZXIgOiBuZXcgVWludDhBcnJheShpbnB1dEFycmF5T3JCdWZmZXIpO1xuXG4gICAgbGV0IHJlc3VsdGluZ1N0cmluZyA9ICcnLFxuICAgICAgdG1wU3RyID0gJycsXG4gICAgICBpbmRleCA9IDAsXG4gICAgICBuZXh0RW5kID0gMCxcbiAgICAgIGNwMCA9IDAsXG4gICAgICBjb2RlUG9pbnQgPSAwLFxuICAgICAgbWluQml0cyA9IDAsXG4gICAgICBjcDEgPSAwLFxuICAgICAgcG9zID0gMCxcbiAgICAgIHRtcCA9IC0xO1xuICAgIGNvbnN0IGxlbiA9IGlucHV0QXM4Lmxlbmd0aCB8IDA7XG4gICAgY29uc3QgbGVuTWludXMzMiA9IChsZW4gLSAzMikgfCAwO1xuICAgIC8vIE5vdGUgdGhhdCB0bXAgcmVwcmVzZW50cyB0aGUgMm5kIGhhbGYgb2YgYSBzdXJyb2dhdGUgcGFpciBpbmNhc2UgYSBzdXJyb2dhdGUgZ2V0cyBkaXZpZGVkIGJldHdlZW4gYmxvY2tzXG4gICAgZm9yICg7IGluZGV4IDwgbGVuOyApIHtcbiAgICAgIG5leHRFbmQgPSBpbmRleCA8PSBsZW5NaW51czMyID8gMzIgOiAobGVuIC0gaW5kZXgpIHwgMDtcbiAgICAgIGZvciAoOyBwb3MgPCBuZXh0RW5kOyBpbmRleCA9IChpbmRleCArIDEpIHwgMCwgcG9zID0gKHBvcyArIDEpIHwgMCkge1xuICAgICAgICBjcDAgPSBpbnB1dEFzOFtpbmRleF0gJiAweGZmO1xuICAgICAgICBzd2l0Y2ggKGNwMCA+PiA0KSB7XG4gICAgICAgICAgY2FzZSAxNTpcbiAgICAgICAgICAgIGNwMSA9IGlucHV0QXM4WyhpbmRleCA9IChpbmRleCArIDEpIHwgMCldICYgMHhmZjtcbiAgICAgICAgICAgIGlmIChjcDEgPj4gNiAhPT0gMGIxMCB8fCAwYjExMTEwMTExIDwgY3AwKSB7XG4gICAgICAgICAgICAgIGluZGV4ID0gKGluZGV4IC0gMSkgfCAwO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvZGVQb2ludCA9ICgoY3AwICYgMGIxMTEpIDw8IDYpIHwgKGNwMSAmIDBiMDAxMTExMTEpO1xuICAgICAgICAgICAgbWluQml0cyA9IDU7IC8vIDIwIGVuc3VyZXMgaXQgbmV2ZXIgcGFzc2VzIC0+IGFsbCBpbnZhbGlkIHJlcGxhY2VtZW50c1xuICAgICAgICAgICAgY3AwID0gMHgxMDA7IC8vICBrZWVwIHRyYWNrIG9mIHRoIGJpdCBzaXplXG4gICAgICAgICAgY2FzZSAxNDpcbiAgICAgICAgICAgIGNwMSA9IGlucHV0QXM4WyhpbmRleCA9IChpbmRleCArIDEpIHwgMCldICYgMHhmZjtcbiAgICAgICAgICAgIGNvZGVQb2ludCA8PD0gNjtcbiAgICAgICAgICAgIGNvZGVQb2ludCB8PSAoKGNwMCAmIDBiMTExMSkgPDwgNikgfCAoY3AxICYgMGIwMDExMTExMSk7XG4gICAgICAgICAgICBtaW5CaXRzID0gY3AxID4+IDYgPT09IDBiMTAgPyAobWluQml0cyArIDQpIHwgMCA6IDI0OyAvLyAyNCBlbnN1cmVzIGl0IG5ldmVyIHBhc3NlcyAtPiBhbGwgaW52YWxpZCByZXBsYWNlbWVudHNcbiAgICAgICAgICAgIGNwMCA9IChjcDAgKyAweDEwMCkgJiAweDMwMDsgLy8ga2VlcCB0cmFjayBvZiB0aCBiaXQgc2l6ZVxuICAgICAgICAgIGNhc2UgMTM6XG4gICAgICAgICAgY2FzZSAxMjpcbiAgICAgICAgICAgIGNwMSA9IGlucHV0QXM4WyhpbmRleCA9IChpbmRleCArIDEpIHwgMCldICYgMHhmZjtcbiAgICAgICAgICAgIGNvZGVQb2ludCA8PD0gNjtcbiAgICAgICAgICAgIGNvZGVQb2ludCB8PSAoKGNwMCAmIDBiMTExMTEpIDw8IDYpIHwgKGNwMSAmIDBiMDAxMTExMTEpO1xuICAgICAgICAgICAgbWluQml0cyA9IChtaW5CaXRzICsgNykgfCAwO1xuXG4gICAgICAgICAgICAvLyBOb3csIHByb2Nlc3MgdGhlIGNvZGUgcG9pbnRcbiAgICAgICAgICAgIGlmIChpbmRleCA8IGxlbiAmJiBjcDEgPj4gNiA9PT0gMGIxMCAmJiBjb2RlUG9pbnQgPj4gbWluQml0cyAmJiBjb2RlUG9pbnQgPCAweDExMDAwMCkge1xuICAgICAgICAgICAgICBjcDAgPSBjb2RlUG9pbnQ7XG4gICAgICAgICAgICAgIGNvZGVQb2ludCA9IChjb2RlUG9pbnQgLSAweDEwMDAwKSB8IDA7XG4gICAgICAgICAgICAgIGlmICgwIDw9IGNvZGVQb2ludCAvKjB4ZmZmZiA8IGNvZGVQb2ludCovKSB7XG4gICAgICAgICAgICAgICAgLy8gQk1QIGNvZGUgcG9pbnRcbiAgICAgICAgICAgICAgICAvL25leHRFbmQgPSBuZXh0RW5kIC0gMXwwO1xuXG4gICAgICAgICAgICAgICAgdG1wID0gKChjb2RlUG9pbnQgPj4gMTApICsgMHhkODAwKSB8IDA7IC8vIGhpZ2hTdXJyb2dhdGVcbiAgICAgICAgICAgICAgICBjcDAgPSAoKGNvZGVQb2ludCAmIDB4M2ZmKSArIDB4ZGMwMCkgfCAwOyAvLyBsb3dTdXJyb2dhdGUgKHdpbGwgYmUgaW5zZXJ0ZWQgbGF0ZXIgaW4gdGhlIHN3aXRjaC1zdGF0ZW1lbnQpXG5cbiAgICAgICAgICAgICAgICBpZiAocG9zIDwgMzEpIHtcbiAgICAgICAgICAgICAgICAgIC8vIG5vdGljZSAzMSBpbnN0ZWFkIG9mIDMyXG4gICAgICAgICAgICAgICAgICB0bXBCdWZmZXJVMTZbcG9zXSA9IHRtcDtcbiAgICAgICAgICAgICAgICAgIHBvcyA9IChwb3MgKyAxKSB8IDA7XG4gICAgICAgICAgICAgICAgICB0bXAgPSAtMTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgLy8gZWxzZSwgd2UgYXJlIGF0IHRoZSBlbmQgb2YgdGhlIGlucHV0QXM4IGFuZCBsZXQgdG1wMCBiZSBmaWxsZWQgaW4gbGF0ZXIgb25cbiAgICAgICAgICAgICAgICAgIC8vIE5PVEUgdGhhdCBjcDEgaXMgYmVpbmcgdXNlZCBhcyBhIHRlbXBvcmFyeSB2YXJpYWJsZSBmb3IgdGhlIHN3YXBwaW5nIG9mIHRtcCB3aXRoIGNwMFxuICAgICAgICAgICAgICAgICAgY3AxID0gdG1wO1xuICAgICAgICAgICAgICAgICAgdG1wID0gY3AwO1xuICAgICAgICAgICAgICAgICAgY3AwID0gY3AxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSBlbHNlIG5leHRFbmQgPSAobmV4dEVuZCArIDEpIHwgMDsgLy8gYmVjYXVzZSB3ZSBhcmUgYWR2YW5jaW5nIGkgd2l0aG91dCBhZHZhbmNpbmcgcG9zXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyBpbnZhbGlkIGNvZGUgcG9pbnQgbWVhbnMgcmVwbGFjaW5nIHRoZSB3aG9sZSB0aGluZyB3aXRoIG51bGwgcmVwbGFjZW1lbnQgY2hhcmFjdGVyc1xuICAgICAgICAgICAgICBjcDAgPj49IDg7XG4gICAgICAgICAgICAgIGluZGV4ID0gKGluZGV4IC0gY3AwIC0gMSkgfCAwOyAvLyByZXNldCBpbmRleCAgYmFjayB0byB3aGF0IGl0IHdhcyBiZWZvcmVcbiAgICAgICAgICAgICAgY3AwID0gMHhmZmZkO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBGaW5hbGx5LCByZXNldCB0aGUgdmFyaWFibGVzIGZvciB0aGUgbmV4dCBnby1hcm91bmRcbiAgICAgICAgICAgIG1pbkJpdHMgPSAwO1xuICAgICAgICAgICAgY29kZVBvaW50ID0gMDtcbiAgICAgICAgICAgIG5leHRFbmQgPSBpbmRleCA8PSBsZW5NaW51czMyID8gMzIgOiAobGVuIC0gaW5kZXgpIHwgMDtcbiAgICAgICAgICAvKmNhc2UgMTE6XG4gICAgICAgIGNhc2UgMTA6XG4gICAgICAgIGNhc2UgOTpcbiAgICAgICAgY2FzZSA4OlxuICAgICAgICAgIGNvZGVQb2ludCA/IGNvZGVQb2ludCA9IDAgOiBjcDAgPSAweGZmZmQ7IC8vIGZpbGwgd2l0aCBpbnZhbGlkIHJlcGxhY2VtZW50IGNoYXJhY3RlclxuICAgICAgICBjYXNlIDc6XG4gICAgICAgIGNhc2UgNjpcbiAgICAgICAgY2FzZSA1OlxuICAgICAgICBjYXNlIDQ6XG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICBjYXNlIDE6XG4gICAgICAgIGNhc2UgMDpcbiAgICAgICAgICB0bXBCdWZmZXJVMTZbcG9zXSA9IGNwMDtcbiAgICAgICAgICBjb250aW51ZTsqL1xuICAgICAgICAgIGRlZmF1bHQ6IC8vIGZpbGwgd2l0aCBpbnZhbGlkIHJlcGxhY2VtZW50IGNoYXJhY3RlclxuICAgICAgICAgICAgdG1wQnVmZmVyVTE2W3Bvc10gPSBjcDA7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICBjYXNlIDExOlxuICAgICAgICAgIGNhc2UgMTA6XG4gICAgICAgICAgY2FzZSA5OlxuICAgICAgICAgIGNhc2UgODpcbiAgICAgICAgfVxuICAgICAgICB0bXBCdWZmZXJVMTZbcG9zXSA9IDB4ZmZmZDsgLy8gZmlsbCB3aXRoIGludmFsaWQgcmVwbGFjZW1lbnQgY2hhcmFjdGVyXG4gICAgICB9XG4gICAgICB0bXBTdHIgKz0gZnJvbUNoYXJDb2RlKFxuICAgICAgICB0bXBCdWZmZXJVMTZbMF0sXG4gICAgICAgIHRtcEJ1ZmZlclUxNlsxXSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzJdLFxuICAgICAgICB0bXBCdWZmZXJVMTZbM10sXG4gICAgICAgIHRtcEJ1ZmZlclUxNls0XSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzVdLFxuICAgICAgICB0bXBCdWZmZXJVMTZbNl0sXG4gICAgICAgIHRtcEJ1ZmZlclUxNls3XSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzhdLFxuICAgICAgICB0bXBCdWZmZXJVMTZbOV0sXG4gICAgICAgIHRtcEJ1ZmZlclUxNlsxMF0sXG4gICAgICAgIHRtcEJ1ZmZlclUxNlsxMV0sXG4gICAgICAgIHRtcEJ1ZmZlclUxNlsxMl0sXG4gICAgICAgIHRtcEJ1ZmZlclUxNlsxM10sXG4gICAgICAgIHRtcEJ1ZmZlclUxNlsxNF0sXG4gICAgICAgIHRtcEJ1ZmZlclUxNlsxNV0sXG4gICAgICAgIHRtcEJ1ZmZlclUxNlsxNl0sXG4gICAgICAgIHRtcEJ1ZmZlclUxNlsxN10sXG4gICAgICAgIHRtcEJ1ZmZlclUxNlsxOF0sXG4gICAgICAgIHRtcEJ1ZmZlclUxNlsxOV0sXG4gICAgICAgIHRtcEJ1ZmZlclUxNlsyMF0sXG4gICAgICAgIHRtcEJ1ZmZlclUxNlsyMV0sXG4gICAgICAgIHRtcEJ1ZmZlclUxNlsyMl0sXG4gICAgICAgIHRtcEJ1ZmZlclUxNlsyM10sXG4gICAgICAgIHRtcEJ1ZmZlclUxNlsyNF0sXG4gICAgICAgIHRtcEJ1ZmZlclUxNlsyNV0sXG4gICAgICAgIHRtcEJ1ZmZlclUxNlsyNl0sXG4gICAgICAgIHRtcEJ1ZmZlclUxNlsyN10sXG4gICAgICAgIHRtcEJ1ZmZlclUxNlsyOF0sXG4gICAgICAgIHRtcEJ1ZmZlclUxNlsyOV0sXG4gICAgICAgIHRtcEJ1ZmZlclUxNlszMF0sXG4gICAgICAgIHRtcEJ1ZmZlclUxNlszMV1cbiAgICAgICk7XG4gICAgICBpZiAocG9zIDwgMzIpIHRtcFN0ciA9IHRtcFN0ci5zbGljZSgwLCAocG9zIC0gMzIpIHwgMCk7IC8vLSgzMi1wb3MpKTtcbiAgICAgIGlmIChpbmRleCA8IGxlbikge1xuICAgICAgICAvL2Zyb21DaGFyQ29kZS5hcHBseSgwLCB0bXBCdWZmZXJVMTYgOiBVaW50OEFycmF5ID8gIHRtcEJ1ZmZlclUxNi5zdWJhcnJheSgwLHBvcykgOiB0bXBCdWZmZXJVMTYuc2xpY2UoMCxwb3MpKTtcbiAgICAgICAgdG1wQnVmZmVyVTE2WzBdID0gdG1wO1xuICAgICAgICBwb3MgPSB+dG1wID4+PiAzMTsgLy90bXAgIT09IC0xID8gMSA6IDA7XG4gICAgICAgIHRtcCA9IC0xO1xuXG4gICAgICAgIGlmICh0bXBTdHIubGVuZ3RoIDwgcmVzdWx0aW5nU3RyaW5nLmxlbmd0aCkgY29udGludWU7XG4gICAgICB9IGVsc2UgaWYgKHRtcCAhPT0gLTEpIHtcbiAgICAgICAgdG1wU3RyICs9IGZyb21DaGFyQ29kZSh0bXApO1xuICAgICAgfVxuXG4gICAgICByZXN1bHRpbmdTdHJpbmcgKz0gdG1wU3RyO1xuICAgICAgdG1wU3RyID0gJyc7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdGluZ1N0cmluZztcbiAgfVxufVxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuZnVuY3Rpb24gZW5jb2RlclJlcGxhY2VyKG5vbkFzY2lpQ2hhcnM6IHN0cmluZykge1xuICAvLyBtYWtlIHRoZSBVVEYgc3RyaW5nIGludG8gYSBiaW5hcnkgVVRGLTggZW5jb2RlZCBzdHJpbmdcbiAgbGV0IHBvaW50ID0gbm9uQXNjaWlDaGFycy5jaGFyQ29kZUF0KDApIHwgMDtcbiAgaWYgKDB4ZDgwMCA8PSBwb2ludCkge1xuICAgIGlmIChwb2ludCA8PSAweGRiZmYpIHtcbiAgICAgIGNvbnN0IG5leHRjb2RlID0gbm9uQXNjaWlDaGFycy5jaGFyQ29kZUF0KDEpIHwgMDsgLy8gZGVmYXVsdHMgdG8gMCB3aGVuIE5hTiwgY2F1c2luZyBudWxsIHJlcGxhY2VtZW50IGNoYXJhY3RlclxuXG4gICAgICBpZiAoMHhkYzAwIDw9IG5leHRjb2RlICYmIG5leHRjb2RlIDw9IDB4ZGZmZikge1xuICAgICAgICAvL3BvaW50ID0gKChwb2ludCAtIDB4RDgwMCk8PDEwKSArIG5leHRjb2RlIC0gMHhEQzAwICsgMHgxMDAwMHwwO1xuICAgICAgICBwb2ludCA9ICgocG9pbnQgPDwgMTApICsgbmV4dGNvZGUgLSAweDM1ZmRjMDApIHwgMDtcbiAgICAgICAgaWYgKHBvaW50ID4gMHhmZmZmKVxuICAgICAgICAgIHJldHVybiBmcm9tQ2hhckNvZGUoXG4gICAgICAgICAgICAoMHgxZSAvKjBiMTExMTAqLyA8PCAzKSB8IChwb2ludCA+PiAxOCksXG4gICAgICAgICAgICAoMHgyIC8qMGIxMCovIDw8IDYpIHwgKChwb2ludCA+PiAxMikgJiAweDNmKSAvKjBiMDAxMTExMTEqLyxcbiAgICAgICAgICAgICgweDIgLyowYjEwKi8gPDwgNikgfCAoKHBvaW50ID4+IDYpICYgMHgzZikgLyowYjAwMTExMTExKi8sXG4gICAgICAgICAgICAoMHgyIC8qMGIxMCovIDw8IDYpIHwgKHBvaW50ICYgMHgzZikgLyowYjAwMTExMTExKi9cbiAgICAgICAgICApO1xuICAgICAgfSBlbHNlIHBvaW50ID0gNjU1MzMgLyowYjExMTExMTExMTExMTExMDEqLzsgLy9yZXR1cm4gJ1xceEVGXFx4QkZcXHhCRCc7Ly9mcm9tQ2hhckNvZGUoMHhlZiwgMHhiZiwgMHhiZCk7XG4gICAgfSBlbHNlIGlmIChwb2ludCA8PSAweGRmZmYpIHtcbiAgICAgIHBvaW50ID0gNjU1MzMgLyowYjExMTExMTExMTExMTExMDEqLzsgLy9yZXR1cm4gJ1xceEVGXFx4QkZcXHhCRCc7Ly9mcm9tQ2hhckNvZGUoMHhlZiwgMHhiZiwgMHhiZCk7XG4gICAgfVxuICB9XG4gIC8qaWYgKHBvaW50IDw9IDB4MDA3ZikgcmV0dXJuIG5vbkFzY2lpQ2hhcnM7XG4gIGVsc2UgKi8gaWYgKHBvaW50IDw9IDB4MDdmZikge1xuICAgIHJldHVybiBmcm9tQ2hhckNvZGUoKDB4NiA8PCA1KSB8IChwb2ludCA+PiA2KSwgKDB4MiA8PCA2KSB8IChwb2ludCAmIDB4M2YpKTtcbiAgfSBlbHNlXG4gICAgcmV0dXJuIGZyb21DaGFyQ29kZShcbiAgICAgICgweGUgLyowYjExMTAqLyA8PCA0KSB8IChwb2ludCA+PiAxMiksXG4gICAgICAoMHgyIC8qMGIxMCovIDw8IDYpIHwgKChwb2ludCA+PiA2KSAmIDB4M2YpIC8qMGIwMDExMTExMSovLFxuICAgICAgKDB4MiAvKjBiMTAqLyA8PCA2KSB8IChwb2ludCAmIDB4M2YpIC8qMGIwMDExMTExMSovXG4gICAgKTtcbn1cblxuZXhwb3J0IGNsYXNzIFRleHRFbmNvZGVyIHtcbiAgcHVibGljIGVuY29kZShpbnB1dFN0cmluZzogc3RyaW5nKTogVWludDhBcnJheSB7XG4gICAgLy8gMHhjMCA9PiAwYjExMDAwMDAwOyAweGZmID0+IDBiMTExMTExMTE7IDB4YzAtMHhmZiA9PiAwYjExeHh4eHh4XG4gICAgLy8gMHg4MCA9PiAwYjEwMDAwMDAwOyAweGJmID0+IDBiMTAxMTExMTE7IDB4ODAtMHhiZiA9PiAwYjEweHh4eHh4XG4gICAgY29uc3QgZW5jb2RlZFN0cmluZyA9IGlucHV0U3RyaW5nID09PSB2b2lkIDAgPyAnJyA6ICcnICsgaW5wdXRTdHJpbmcsXG4gICAgICBsZW4gPSBlbmNvZGVkU3RyaW5nLmxlbmd0aCB8IDA7XG4gICAgbGV0IHJlc3VsdCA9IG5ldyBVaW50OEFycmF5KCgobGVuIDw8IDEpICsgOCkgfCAwKTtcbiAgICBsZXQgdG1wUmVzdWx0OiBVaW50OEFycmF5O1xuICAgIGxldCBpID0gMCxcbiAgICAgIHBvcyA9IDAsXG4gICAgICBwb2ludCA9IDAsXG4gICAgICBuZXh0Y29kZSA9IDA7XG4gICAgbGV0IHVwZ3JhZGVkZWRBcnJheVNpemUgPSAhVWludDhBcnJheTsgLy8gbm9ybWFsIGFycmF5cyBhcmUgYXV0by1leHBhbmRpbmdcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpID0gKGkgKyAxKSB8IDAsIHBvcyA9IChwb3MgKyAxKSB8IDApIHtcbiAgICAgIHBvaW50ID0gZW5jb2RlZFN0cmluZy5jaGFyQ29kZUF0KGkpIHwgMDtcbiAgICAgIGlmIChwb2ludCA8PSAweDAwN2YpIHtcbiAgICAgICAgcmVzdWx0W3Bvc10gPSBwb2ludDtcbiAgICAgIH0gZWxzZSBpZiAocG9pbnQgPD0gMHgwN2ZmKSB7XG4gICAgICAgIHJlc3VsdFtwb3NdID0gKDB4NiA8PCA1KSB8IChwb2ludCA+PiA2KTtcbiAgICAgICAgcmVzdWx0Wyhwb3MgPSAocG9zICsgMSkgfCAwKV0gPSAoMHgyIDw8IDYpIHwgKHBvaW50ICYgMHgzZik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB3aWRlbkNoZWNrOiB7XG4gICAgICAgICAgaWYgKDB4ZDgwMCA8PSBwb2ludCkge1xuICAgICAgICAgICAgaWYgKHBvaW50IDw9IDB4ZGJmZikge1xuICAgICAgICAgICAgICBuZXh0Y29kZSA9IGVuY29kZWRTdHJpbmcuY2hhckNvZGVBdCgoaSA9IChpICsgMSkgfCAwKSkgfCAwOyAvLyBkZWZhdWx0cyB0byAwIHdoZW4gTmFOLCBjYXVzaW5nIG51bGwgcmVwbGFjZW1lbnQgY2hhcmFjdGVyXG5cbiAgICAgICAgICAgICAgaWYgKDB4ZGMwMCA8PSBuZXh0Y29kZSAmJiBuZXh0Y29kZSA8PSAweGRmZmYpIHtcbiAgICAgICAgICAgICAgICAvL3BvaW50ID0gKChwb2ludCAtIDB4RDgwMCk8PDEwKSArIG5leHRjb2RlIC0gMHhEQzAwICsgMHgxMDAwMHwwO1xuICAgICAgICAgICAgICAgIHBvaW50ID0gKChwb2ludCA8PCAxMCkgKyBuZXh0Y29kZSAtIDB4MzVmZGMwMCkgfCAwO1xuICAgICAgICAgICAgICAgIGlmIChwb2ludCA+IDB4ZmZmZikge1xuICAgICAgICAgICAgICAgICAgcmVzdWx0W3Bvc10gPSAoMHgxZSAvKjBiMTExMTAqLyA8PCAzKSB8IChwb2ludCA+PiAxOCk7XG4gICAgICAgICAgICAgICAgICByZXN1bHRbKHBvcyA9IChwb3MgKyAxKSB8IDApXSA9ICgweDIgLyowYjEwKi8gPDwgNikgfCAoKHBvaW50ID4+IDEyKSAmIDB4M2YpIC8qMGIwMDExMTExMSovO1xuICAgICAgICAgICAgICAgICAgcmVzdWx0Wyhwb3MgPSAocG9zICsgMSkgfCAwKV0gPSAoMHgyIC8qMGIxMCovIDw8IDYpIHwgKChwb2ludCA+PiA2KSAmIDB4M2YpIC8qMGIwMDExMTExMSovO1xuICAgICAgICAgICAgICAgICAgcmVzdWx0Wyhwb3MgPSAocG9zICsgMSkgfCAwKV0gPSAoMHgyIC8qMGIxMCovIDw8IDYpIHwgKHBvaW50ICYgMHgzZikgLyowYjAwMTExMTExKi87XG4gICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWsgd2lkZW5DaGVjaztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBwb2ludCA9IDY1NTMzIC8qMGIxMTExMTExMTExMTExMTAxKi87IC8vcmV0dXJuICdcXHhFRlxceEJGXFx4QkQnOy8vZnJvbUNoYXJDb2RlKDB4ZWYsIDB4YmYsIDB4YmQpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChwb2ludCA8PSAweGRmZmYpIHtcbiAgICAgICAgICAgICAgcG9pbnQgPSA2NTUzMyAvKjBiMTExMTExMTExMTExMTEwMSovOyAvL3JldHVybiAnXFx4RUZcXHhCRlxceEJEJzsvL2Zyb21DaGFyQ29kZSgweGVmLCAweGJmLCAweGJkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCF1cGdyYWRlZGVkQXJyYXlTaXplICYmIGkgPDwgMSA8IHBvcyAmJiBpIDw8IDEgPCAoKHBvcyAtIDcpIHwgMCkpIHtcbiAgICAgICAgICAgIHVwZ3JhZGVkZWRBcnJheVNpemUgPSB0cnVlO1xuICAgICAgICAgICAgdG1wUmVzdWx0ID0gbmV3IFVpbnQ4QXJyYXkobGVuICogMyk7XG4gICAgICAgICAgICB0bXBSZXN1bHQuc2V0KHJlc3VsdCk7XG4gICAgICAgICAgICByZXN1bHQgPSB0bXBSZXN1bHQ7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJlc3VsdFtwb3NdID0gKDB4ZSAvKjBiMTExMCovIDw8IDQpIHwgKHBvaW50ID4+IDEyKTtcbiAgICAgICAgcmVzdWx0Wyhwb3MgPSAocG9zICsgMSkgfCAwKV0gPSAoMHgyIC8qMGIxMCovIDw8IDYpIHwgKChwb2ludCA+PiA2KSAmIDB4M2YpIC8qMGIwMDExMTExMSovO1xuICAgICAgICByZXN1bHRbKHBvcyA9IChwb3MgKyAxKSB8IDApXSA9ICgweDIgLyowYjEwKi8gPDwgNikgfCAocG9pbnQgJiAweDNmKSAvKjBiMDAxMTExMTEqLztcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIFVpbnQ4QXJyYXkgPyByZXN1bHQuc3ViYXJyYXkoMCwgcG9zKSA6IHJlc3VsdC5zbGljZSgwLCBwb3MpO1xuICB9XG5cbiAgcHVibGljIGVuY29kZUludG8oaW5wdXRTdHJpbmc6IHN0cmluZywgdThBcnI6IFVpbnQ4QXJyYXkpOiB7IHdyaXR0ZW46IG51bWJlcjsgcmVhZDogbnVtYmVyIH0ge1xuICAgIGNvbnN0IGVuY29kZWRTdHJpbmcgPSBpbnB1dFN0cmluZyA9PT0gdm9pZCAwID8gJycgOiAoJycgKyBpbnB1dFN0cmluZykucmVwbGFjZShlbmNvZGVyUmVnZXhwLCBlbmNvZGVyUmVwbGFjZXIpO1xuICAgIGxldCBsZW4gPSBlbmNvZGVkU3RyaW5nLmxlbmd0aCB8IDAsXG4gICAgICBpID0gMCxcbiAgICAgIGNoYXIgPSAwLFxuICAgICAgcmVhZCA9IDA7XG4gICAgY29uc3QgdThBcnJMZW4gPSB1OEFyci5sZW5ndGggfCAwO1xuICAgIGNvbnN0IGlucHV0TGVuZ3RoID0gaW5wdXRTdHJpbmcubGVuZ3RoIHwgMDtcbiAgICBpZiAodThBcnJMZW4gPCBsZW4pIGxlbiA9IHU4QXJyTGVuO1xuICAgIHB1dENoYXJzOiB7XG4gICAgICBmb3IgKDsgaSA8IGxlbjsgaSA9IChpICsgMSkgfCAwKSB7XG4gICAgICAgIGNoYXIgPSBlbmNvZGVkU3RyaW5nLmNoYXJDb2RlQXQoaSkgfCAwO1xuICAgICAgICBzd2l0Y2ggKGNoYXIgPj4gNCkge1xuICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgY2FzZSA1OlxuICAgICAgICAgIGNhc2UgNjpcbiAgICAgICAgICBjYXNlIDc6XG4gICAgICAgICAgICByZWFkID0gKHJlYWQgKyAxKSB8IDA7XG4gICAgICAgICAgLy8gZXh0ZW5zaW9uIHBvaW50czpcbiAgICAgICAgICBjYXNlIDg6XG4gICAgICAgICAgY2FzZSA5OlxuICAgICAgICAgIGNhc2UgMTA6XG4gICAgICAgICAgY2FzZSAxMTpcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMTI6XG4gICAgICAgICAgY2FzZSAxMzpcbiAgICAgICAgICAgIGlmICgoKGkgKyAxKSB8IDApIDwgdThBcnJMZW4pIHtcbiAgICAgICAgICAgICAgcmVhZCA9IChyZWFkICsgMSkgfCAwO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICBjYXNlIDE0OlxuICAgICAgICAgICAgaWYgKCgoaSArIDIpIHwgMCkgPCB1OEFyckxlbikge1xuICAgICAgICAgICAgICAvL2lmICghKGNoYXIgPT09IDB4RUYgJiYgZW5jb2RlZFN0cmluZy5zdWJzdHIoaSsxfDAsMikgPT09IFwiXFx4QkZcXHhCRFwiKSlcbiAgICAgICAgICAgICAgcmVhZCA9IChyZWFkICsgMSkgfCAwO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICBjYXNlIDE1OlxuICAgICAgICAgICAgaWYgKCgoaSArIDMpIHwgMCkgPCB1OEFyckxlbikge1xuICAgICAgICAgICAgICByZWFkID0gKHJlYWQgKyAxKSB8IDA7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBicmVhayBwdXRDaGFycztcbiAgICAgICAgfVxuICAgICAgICAvL3JlYWQgPSByZWFkICsgKChjaGFyID4+IDYpICE9PSAyKSB8MDtcbiAgICAgICAgdThBcnJbaV0gPSBjaGFyO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4geyB3cml0dGVuOiBpLCByZWFkOiBpbnB1dExlbmd0aCA8IHJlYWQgPyBpbnB1dExlbmd0aCA6IHJlYWQgfTtcbiAgfVxufVxuXG4vKipcbiAqIEVuY29kZSBhIFVURi04IHN0cmluZyBpbnRvIGEgVWludDhBcnJheVxuICovXG5leHBvcnQgZnVuY3Rpb24gZW5jb2RlKHM6IHN0cmluZyk6IFVpbnQ4QXJyYXkge1xuICByZXR1cm4gVGV4dEVuY29kZXIucHJvdG90eXBlLmVuY29kZShzKTtcbn1cblxuLyoqXG4gKiBEZWNvZGUgYSBVaW50OEFycmF5IGludG8gYSBVVEYtOCBzdHJpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRlY29kZShhOiBVaW50OEFycmF5KTogc3RyaW5nIHtcbiAgcmV0dXJuIFRleHREZWNvZGVyLnByb3RvdHlwZS5kZWNvZGUoYSk7XG59XG4iLCJpbXBvcnQgeyBTeW1ib2xCYXNlZEluc3RhbmNlT2ZFcnJvciB9IGZyb20gJy4vdHlwZS1oZWxwZXJzJztcblxuLyoqXG4gKiBUaHJvd24gZnJvbSBjb2RlIHRoYXQgcmVjZWl2ZXMgYSB2YWx1ZSB0aGF0IGlzIHVuZXhwZWN0ZWQgb3IgdGhhdCBpdCdzIHVuYWJsZSB0byBoYW5kbGUuXG4gKi9cbkBTeW1ib2xCYXNlZEluc3RhbmNlT2ZFcnJvcignVmFsdWVFcnJvcicpXG5leHBvcnQgY2xhc3MgVmFsdWVFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IoXG4gICAgbWVzc2FnZTogc3RyaW5nIHwgdW5kZWZpbmVkLFxuICAgIHB1YmxpYyByZWFkb25seSBjYXVzZT86IHVua25vd25cbiAgKSB7XG4gICAgc3VwZXIobWVzc2FnZSA/PyB1bmRlZmluZWQpO1xuICB9XG59XG5cbi8qKlxuICogVGhyb3duIHdoZW4gYSBQYXlsb2FkIENvbnZlcnRlciBpcyBtaXNjb25maWd1cmVkLlxuICovXG5AU3ltYm9sQmFzZWRJbnN0YW5jZU9mRXJyb3IoJ1BheWxvYWRDb252ZXJ0ZXJFcnJvcicpXG5leHBvcnQgY2xhc3MgUGF5bG9hZENvbnZlcnRlckVycm9yIGV4dGVuZHMgVmFsdWVFcnJvciB7fVxuXG4vKipcbiAqIFVzZWQgaW4gZGlmZmVyZW50IHBhcnRzIG9mIHRoZSBTREsgdG8gbm90ZSB0aGF0IHNvbWV0aGluZyB1bmV4cGVjdGVkIGhhcyBoYXBwZW5lZC5cbiAqL1xuQFN5bWJvbEJhc2VkSW5zdGFuY2VPZkVycm9yKCdJbGxlZ2FsU3RhdGVFcnJvcicpXG5leHBvcnQgY2xhc3MgSWxsZWdhbFN0YXRlRXJyb3IgZXh0ZW5kcyBFcnJvciB7fVxuXG4vKipcbiAqIFRocm93biB3aGVuIGEgV29ya2Zsb3cgd2l0aCB0aGUgZ2l2ZW4gSWQgaXMgbm90IGtub3duIHRvIFRlbXBvcmFsIFNlcnZlci5cbiAqIEl0IGNvdWxkIGJlIGJlY2F1c2U6XG4gKiAtIElkIHBhc3NlZCBpcyBpbmNvcnJlY3RcbiAqIC0gV29ya2Zsb3cgaXMgY2xvc2VkIChmb3Igc29tZSBjYWxscywgZS5nLiBgdGVybWluYXRlYClcbiAqIC0gV29ya2Zsb3cgd2FzIGRlbGV0ZWQgZnJvbSB0aGUgU2VydmVyIGFmdGVyIHJlYWNoaW5nIGl0cyByZXRlbnRpb24gbGltaXRcbiAqL1xuQFN5bWJvbEJhc2VkSW5zdGFuY2VPZkVycm9yKCdXb3JrZmxvd05vdEZvdW5kRXJyb3InKVxuZXhwb3J0IGNsYXNzIFdvcmtmbG93Tm90Rm91bmRFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IoXG4gICAgbWVzc2FnZTogc3RyaW5nLFxuICAgIHB1YmxpYyByZWFkb25seSB3b3JrZmxvd0lkOiBzdHJpbmcsXG4gICAgcHVibGljIHJlYWRvbmx5IHJ1bklkOiBzdHJpbmcgfCB1bmRlZmluZWRcbiAgKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gIH1cbn1cblxuLyoqXG4gKiBUaHJvd24gd2hlbiB0aGUgc3BlY2lmaWVkIG5hbWVzcGFjZSBpcyBub3Qga25vd24gdG8gVGVtcG9yYWwgU2VydmVyLlxuICovXG5AU3ltYm9sQmFzZWRJbnN0YW5jZU9mRXJyb3IoJ05hbWVzcGFjZU5vdEZvdW5kRXJyb3InKVxuZXhwb3J0IGNsYXNzIE5hbWVzcGFjZU5vdEZvdW5kRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyByZWFkb25seSBuYW1lc3BhY2U6IHN0cmluZykge1xuICAgIHN1cGVyKGBOYW1lc3BhY2Ugbm90IGZvdW5kOiAnJHtuYW1lc3BhY2V9J2ApO1xuICB9XG59XG4iLCJpbXBvcnQgdHlwZSB7IHRlbXBvcmFsIH0gZnJvbSAnQHRlbXBvcmFsaW8vcHJvdG8nO1xuaW1wb3J0IHsgY2hlY2tFeHRlbmRzLCBlcnJvck1lc3NhZ2UsIGlzUmVjb3JkLCBTeW1ib2xCYXNlZEluc3RhbmNlT2ZFcnJvciB9IGZyb20gJy4vdHlwZS1oZWxwZXJzJztcbmltcG9ydCB7IER1cmF0aW9uIH0gZnJvbSAnLi90aW1lJztcblxuZXhwb3J0IGNvbnN0IEZBSUxVUkVfU09VUkNFID0gJ1R5cGVTY3JpcHRTREsnO1xuZXhwb3J0IHR5cGUgUHJvdG9GYWlsdXJlID0gdGVtcG9yYWwuYXBpLmZhaWx1cmUudjEuSUZhaWx1cmU7XG5cbi8vIEF2b2lkIGltcG9ydGluZyB0aGUgcHJvdG8gaW1wbGVtZW50YXRpb24gdG8gcmVkdWNlIHdvcmtmbG93IGJ1bmRsZSBzaXplXG4vLyBDb3BpZWQgZnJvbSB0ZW1wb3JhbC5hcGkuZW51bXMudjEuVGltZW91dFR5cGVcbmV4cG9ydCBlbnVtIFRpbWVvdXRUeXBlIHtcbiAgVElNRU9VVF9UWVBFX1VOU1BFQ0lGSUVEID0gMCxcbiAgVElNRU9VVF9UWVBFX1NUQVJUX1RPX0NMT1NFID0gMSxcbiAgVElNRU9VVF9UWVBFX1NDSEVEVUxFX1RPX1NUQVJUID0gMixcbiAgVElNRU9VVF9UWVBFX1NDSEVEVUxFX1RPX0NMT1NFID0gMyxcbiAgVElNRU9VVF9UWVBFX0hFQVJUQkVBVCA9IDQsXG59XG5cbmNoZWNrRXh0ZW5kczx0ZW1wb3JhbC5hcGkuZW51bXMudjEuVGltZW91dFR5cGUsIFRpbWVvdXRUeXBlPigpO1xuY2hlY2tFeHRlbmRzPFRpbWVvdXRUeXBlLCB0ZW1wb3JhbC5hcGkuZW51bXMudjEuVGltZW91dFR5cGU+KCk7XG5cbi8vIEF2b2lkIGltcG9ydGluZyB0aGUgcHJvdG8gaW1wbGVtZW50YXRpb24gdG8gcmVkdWNlIHdvcmtmbG93IGJ1bmRsZSBzaXplXG4vLyBDb3BpZWQgZnJvbSB0ZW1wb3JhbC5hcGkuZW51bXMudjEuUmV0cnlTdGF0ZVxuZXhwb3J0IGVudW0gUmV0cnlTdGF0ZSB7XG4gIFJFVFJZX1NUQVRFX1VOU1BFQ0lGSUVEID0gMCxcbiAgUkVUUllfU1RBVEVfSU5fUFJPR1JFU1MgPSAxLFxuICBSRVRSWV9TVEFURV9OT05fUkVUUllBQkxFX0ZBSUxVUkUgPSAyLFxuICBSRVRSWV9TVEFURV9USU1FT1VUID0gMyxcbiAgUkVUUllfU1RBVEVfTUFYSU1VTV9BVFRFTVBUU19SRUFDSEVEID0gNCxcbiAgUkVUUllfU1RBVEVfUkVUUllfUE9MSUNZX05PVF9TRVQgPSA1LFxuICBSRVRSWV9TVEFURV9JTlRFUk5BTF9TRVJWRVJfRVJST1IgPSA2LFxuICBSRVRSWV9TVEFURV9DQU5DRUxfUkVRVUVTVEVEID0gNyxcbn1cblxuY2hlY2tFeHRlbmRzPHRlbXBvcmFsLmFwaS5lbnVtcy52MS5SZXRyeVN0YXRlLCBSZXRyeVN0YXRlPigpO1xuY2hlY2tFeHRlbmRzPFJldHJ5U3RhdGUsIHRlbXBvcmFsLmFwaS5lbnVtcy52MS5SZXRyeVN0YXRlPigpO1xuXG5leHBvcnQgdHlwZSBXb3JrZmxvd0V4ZWN1dGlvbiA9IHRlbXBvcmFsLmFwaS5jb21tb24udjEuSVdvcmtmbG93RXhlY3V0aW9uO1xuXG4vKipcbiAqIFJlcHJlc2VudHMgZmFpbHVyZXMgdGhhdCBjYW4gY3Jvc3MgV29ya2Zsb3cgYW5kIEFjdGl2aXR5IGJvdW5kYXJpZXMuXG4gKlxuICogKipOZXZlciBleHRlbmQgdGhpcyBjbGFzcyBvciBhbnkgb2YgaXRzIGNoaWxkcmVuLioqXG4gKlxuICogVGhlIG9ubHkgY2hpbGQgY2xhc3MgeW91IHNob3VsZCBldmVyIHRocm93IGZyb20geW91ciBjb2RlIGlzIHtAbGluayBBcHBsaWNhdGlvbkZhaWx1cmV9LlxuICovXG5AU3ltYm9sQmFzZWRJbnN0YW5jZU9mRXJyb3IoJ1RlbXBvcmFsRmFpbHVyZScpXG5leHBvcnQgY2xhc3MgVGVtcG9yYWxGYWlsdXJlIGV4dGVuZHMgRXJyb3Ige1xuICAvKipcbiAgICogVGhlIG9yaWdpbmFsIGZhaWx1cmUgdGhhdCBjb25zdHJ1Y3RlZCB0aGlzIGVycm9yLlxuICAgKlxuICAgKiBPbmx5IHByZXNlbnQgaWYgdGhpcyBlcnJvciB3YXMgZ2VuZXJhdGVkIGZyb20gYW4gZXh0ZXJuYWwgb3BlcmF0aW9uLlxuICAgKi9cbiAgcHVibGljIGZhaWx1cmU/OiBQcm90b0ZhaWx1cmU7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgbWVzc2FnZT86IHN0cmluZyB8IHVuZGVmaW5lZCB8IG51bGwsXG4gICAgcHVibGljIHJlYWRvbmx5IGNhdXNlPzogRXJyb3JcbiAgKSB7XG4gICAgc3VwZXIobWVzc2FnZSA/PyB1bmRlZmluZWQpO1xuICB9XG59XG5cbi8qKiBFeGNlcHRpb25zIG9yaWdpbmF0ZWQgYXQgdGhlIFRlbXBvcmFsIHNlcnZpY2UuICovXG5AU3ltYm9sQmFzZWRJbnN0YW5jZU9mRXJyb3IoJ1NlcnZlckZhaWx1cmUnKVxuZXhwb3J0IGNsYXNzIFNlcnZlckZhaWx1cmUgZXh0ZW5kcyBUZW1wb3JhbEZhaWx1cmUge1xuICBjb25zdHJ1Y3RvcihcbiAgICBtZXNzYWdlOiBzdHJpbmcgfCB1bmRlZmluZWQsXG4gICAgcHVibGljIHJlYWRvbmx5IG5vblJldHJ5YWJsZTogYm9vbGVhbixcbiAgICBjYXVzZT86IEVycm9yXG4gICkge1xuICAgIHN1cGVyKG1lc3NhZ2UsIGNhdXNlKTtcbiAgfVxufVxuXG4vKipcbiAqIGBBcHBsaWNhdGlvbkZhaWx1cmVgcyBhcmUgdXNlZCB0byBjb21tdW5pY2F0ZSBhcHBsaWNhdGlvbi1zcGVjaWZpYyBmYWlsdXJlcyBpbiBXb3JrZmxvd3MgYW5kIEFjdGl2aXRpZXMuXG4gKlxuICogVGhlIHtAbGluayB0eXBlfSBwcm9wZXJ0eSBpcyBtYXRjaGVkIGFnYWluc3Qge0BsaW5rIFJldHJ5UG9saWN5Lm5vblJldHJ5YWJsZUVycm9yVHlwZXN9IHRvIGRldGVybWluZSBpZiBhbiBpbnN0YW5jZVxuICogb2YgdGhpcyBlcnJvciBpcyByZXRyeWFibGUuIEFub3RoZXIgd2F5IHRvIGF2b2lkIHJldHJ5aW5nIGlzIGJ5IHNldHRpbmcgdGhlIHtAbGluayBub25SZXRyeWFibGV9IGZsYWcgdG8gYHRydWVgLlxuICpcbiAqIEluIFdvcmtmbG93cywgaWYgeW91IHRocm93IGEgbm9uLWBBcHBsaWNhdGlvbkZhaWx1cmVgLCB0aGUgV29ya2Zsb3cgVGFzayB3aWxsIGZhaWwgYW5kIGJlIHJldHJpZWQuIElmIHlvdSB0aHJvdyBhblxuICogYEFwcGxpY2F0aW9uRmFpbHVyZWAsIHRoZSBXb3JrZmxvdyBFeGVjdXRpb24gd2lsbCBmYWlsLlxuICpcbiAqIEluIEFjdGl2aXRpZXMsIHlvdSBjYW4gZWl0aGVyIHRocm93IGFuIGBBcHBsaWNhdGlvbkZhaWx1cmVgIG9yIGFub3RoZXIgYEVycm9yYCB0byBmYWlsIHRoZSBBY3Rpdml0eSBUYXNrLiBJbiB0aGVcbiAqIGxhdHRlciBjYXNlLCB0aGUgYEVycm9yYCB3aWxsIGJlIGNvbnZlcnRlZCB0byBhbiBgQXBwbGljYXRpb25GYWlsdXJlYC4gVGhlIGNvbnZlcnNpb24gaXMgZG9uZSBhcyBmb2xsb3dpbmc6XG4gKlxuICogLSBgdHlwZWAgaXMgc2V0IHRvIGBlcnJvci5jb25zdHJ1Y3Rvcj8ubmFtZSA/PyBlcnJvci5uYW1lYFxuICogLSBgbWVzc2FnZWAgaXMgc2V0IHRvIGBlcnJvci5tZXNzYWdlYFxuICogLSBgbm9uUmV0cnlhYmxlYCBpcyBzZXQgdG8gZmFsc2VcbiAqIC0gYGRldGFpbHNgIGFyZSBzZXQgdG8gbnVsbFxuICogLSBzdGFjayB0cmFjZSBpcyBjb3BpZWQgZnJvbSB0aGUgb3JpZ2luYWwgZXJyb3JcbiAqXG4gKiBXaGVuIGFuIHtAbGluayBodHRwczovL2RvY3MudGVtcG9yYWwuaW8vY29uY2VwdHMvd2hhdC1pcy1hbi1hY3Rpdml0eS1leGVjdXRpb24gfCBBY3Rpdml0eSBFeGVjdXRpb259IGZhaWxzLCB0aGVcbiAqIGBBcHBsaWNhdGlvbkZhaWx1cmVgIGZyb20gdGhlIGxhc3QgQWN0aXZpdHkgVGFzayB3aWxsIGJlIHRoZSBgY2F1c2VgIG9mIHRoZSB7QGxpbmsgQWN0aXZpdHlGYWlsdXJlfSB0aHJvd24gaW4gdGhlXG4gKiBXb3JrZmxvdy5cbiAqL1xuQFN5bWJvbEJhc2VkSW5zdGFuY2VPZkVycm9yKCdBcHBsaWNhdGlvbkZhaWx1cmUnKVxuZXhwb3J0IGNsYXNzIEFwcGxpY2F0aW9uRmFpbHVyZSBleHRlbmRzIFRlbXBvcmFsRmFpbHVyZSB7XG4gIC8qKlxuICAgKiBBbHRlcm5hdGl2ZWx5LCB1c2Uge0BsaW5rIGZyb21FcnJvcn0gb3Ige0BsaW5rIGNyZWF0ZX0uXG4gICAqL1xuICBjb25zdHJ1Y3RvcihcbiAgICBtZXNzYWdlPzogc3RyaW5nIHwgdW5kZWZpbmVkIHwgbnVsbCxcbiAgICBwdWJsaWMgcmVhZG9ubHkgdHlwZT86IHN0cmluZyB8IHVuZGVmaW5lZCB8IG51bGwsXG4gICAgcHVibGljIHJlYWRvbmx5IG5vblJldHJ5YWJsZT86IGJvb2xlYW4gfCB1bmRlZmluZWQgfCBudWxsLFxuICAgIHB1YmxpYyByZWFkb25seSBkZXRhaWxzPzogdW5rbm93bltdIHwgdW5kZWZpbmVkIHwgbnVsbCxcbiAgICBjYXVzZT86IEVycm9yLFxuICAgIHB1YmxpYyByZWFkb25seSBuZXh0UmV0cnlEZWxheT86IER1cmF0aW9uIHwgdW5kZWZpbmVkIHwgbnVsbFxuICApIHtcbiAgICBzdXBlcihtZXNzYWdlLCBjYXVzZSk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIGEgbmV3IGBBcHBsaWNhdGlvbkZhaWx1cmVgIGZyb20gYW4gRXJyb3Igb2JqZWN0LlxuICAgKlxuICAgKiBGaXJzdCBjYWxscyB7QGxpbmsgZW5zdXJlQXBwbGljYXRpb25GYWlsdXJlIHwgYGVuc3VyZUFwcGxpY2F0aW9uRmFpbHVyZShlcnJvcilgfSBhbmQgdGhlbiBvdmVycmlkZXMgYW55IGZpZWxkc1xuICAgKiBwcm92aWRlZCBpbiBgb3ZlcnJpZGVzYC5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgZnJvbUVycm9yKGVycm9yOiBFcnJvciB8IHVua25vd24sIG92ZXJyaWRlcz86IEFwcGxpY2F0aW9uRmFpbHVyZU9wdGlvbnMpOiBBcHBsaWNhdGlvbkZhaWx1cmUge1xuICAgIGNvbnN0IGZhaWx1cmUgPSBlbnN1cmVBcHBsaWNhdGlvbkZhaWx1cmUoZXJyb3IpO1xuICAgIE9iamVjdC5hc3NpZ24oZmFpbHVyZSwgb3ZlcnJpZGVzKTtcbiAgICByZXR1cm4gZmFpbHVyZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBuZXcgYEFwcGxpY2F0aW9uRmFpbHVyZWAuXG4gICAqXG4gICAqIEJ5IGRlZmF1bHQsIHdpbGwgYmUgcmV0cnlhYmxlICh1bmxlc3MgaXRzIGB0eXBlYCBpcyBpbmNsdWRlZCBpbiB7QGxpbmsgUmV0cnlQb2xpY3kubm9uUmV0cnlhYmxlRXJyb3JUeXBlc30pLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBjcmVhdGUob3B0aW9uczogQXBwbGljYXRpb25GYWlsdXJlT3B0aW9ucyk6IEFwcGxpY2F0aW9uRmFpbHVyZSB7XG4gICAgY29uc3QgeyBtZXNzYWdlLCB0eXBlLCBub25SZXRyeWFibGUgPSBmYWxzZSwgZGV0YWlscywgbmV4dFJldHJ5RGVsYXksIGNhdXNlIH0gPSBvcHRpb25zO1xuICAgIHJldHVybiBuZXcgdGhpcyhtZXNzYWdlLCB0eXBlLCBub25SZXRyeWFibGUsIGRldGFpbHMsIGNhdXNlLCBuZXh0UmV0cnlEZWxheSk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGEgbmV3IGBBcHBsaWNhdGlvbkZhaWx1cmVgIHdpdGggdGhlIHtAbGluayBub25SZXRyeWFibGV9IGZsYWcgc2V0IHRvIGZhbHNlLiBOb3RlIHRoYXQgdGhpcyBlcnJvciB3aWxsIHN0aWxsXG4gICAqIG5vdCBiZSByZXRyaWVkIGlmIGl0cyBgdHlwZWAgaXMgaW5jbHVkZWQgaW4ge0BsaW5rIFJldHJ5UG9saWN5Lm5vblJldHJ5YWJsZUVycm9yVHlwZXN9LlxuICAgKlxuICAgKiBAcGFyYW0gbWVzc2FnZSBPcHRpb25hbCBlcnJvciBtZXNzYWdlXG4gICAqIEBwYXJhbSB0eXBlIE9wdGlvbmFsIGVycm9yIHR5cGUgKHVzZWQgYnkge0BsaW5rIFJldHJ5UG9saWN5Lm5vblJldHJ5YWJsZUVycm9yVHlwZXN9KVxuICAgKiBAcGFyYW0gZGV0YWlscyBPcHRpb25hbCBkZXRhaWxzIGFib3V0IHRoZSBmYWlsdXJlLiBTZXJpYWxpemVkIGJ5IHRoZSBXb3JrZXIncyB7QGxpbmsgUGF5bG9hZENvbnZlcnRlcn0uXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHJldHJ5YWJsZShtZXNzYWdlPzogc3RyaW5nIHwgbnVsbCwgdHlwZT86IHN0cmluZyB8IG51bGwsIC4uLmRldGFpbHM6IHVua25vd25bXSk6IEFwcGxpY2F0aW9uRmFpbHVyZSB7XG4gICAgcmV0dXJuIG5ldyB0aGlzKG1lc3NhZ2UsIHR5cGUgPz8gJ0Vycm9yJywgZmFsc2UsIGRldGFpbHMpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhIG5ldyBgQXBwbGljYXRpb25GYWlsdXJlYCB3aXRoIHRoZSB7QGxpbmsgbm9uUmV0cnlhYmxlfSBmbGFnIHNldCB0byB0cnVlLlxuICAgKlxuICAgKiBXaGVuIHRocm93biBmcm9tIGFuIEFjdGl2aXR5IG9yIFdvcmtmbG93LCB0aGUgQWN0aXZpdHkgb3IgV29ya2Zsb3cgd2lsbCBub3QgYmUgcmV0cmllZCAoZXZlbiBpZiBgdHlwZWAgaXMgbm90XG4gICAqIGxpc3RlZCBpbiB7QGxpbmsgUmV0cnlQb2xpY3kubm9uUmV0cnlhYmxlRXJyb3JUeXBlc30pLlxuICAgKlxuICAgKiBAcGFyYW0gbWVzc2FnZSBPcHRpb25hbCBlcnJvciBtZXNzYWdlXG4gICAqIEBwYXJhbSB0eXBlIE9wdGlvbmFsIGVycm9yIHR5cGVcbiAgICogQHBhcmFtIGRldGFpbHMgT3B0aW9uYWwgZGV0YWlscyBhYm91dCB0aGUgZmFpbHVyZS4gU2VyaWFsaXplZCBieSB0aGUgV29ya2VyJ3Mge0BsaW5rIFBheWxvYWRDb252ZXJ0ZXJ9LlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBub25SZXRyeWFibGUobWVzc2FnZT86IHN0cmluZyB8IG51bGwsIHR5cGU/OiBzdHJpbmcgfCBudWxsLCAuLi5kZXRhaWxzOiB1bmtub3duW10pOiBBcHBsaWNhdGlvbkZhaWx1cmUge1xuICAgIHJldHVybiBuZXcgdGhpcyhtZXNzYWdlLCB0eXBlID8/ICdFcnJvcicsIHRydWUsIGRldGFpbHMpO1xuICB9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQXBwbGljYXRpb25GYWlsdXJlT3B0aW9ucyB7XG4gIC8qKlxuICAgKiBFcnJvciBtZXNzYWdlXG4gICAqL1xuICBtZXNzYWdlPzogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBFcnJvciB0eXBlICh1c2VkIGJ5IHtAbGluayBSZXRyeVBvbGljeS5ub25SZXRyeWFibGVFcnJvclR5cGVzfSlcbiAgICovXG4gIHR5cGU/OiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhlIGN1cnJlbnQgQWN0aXZpdHkgb3IgV29ya2Zsb3cgY2FuIGJlIHJldHJpZWRcbiAgICpcbiAgICogQGRlZmF1bHQgZmFsc2VcbiAgICovXG4gIG5vblJldHJ5YWJsZT86IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIERldGFpbHMgYWJvdXQgdGhlIGZhaWx1cmUuIFNlcmlhbGl6ZWQgYnkgdGhlIFdvcmtlcidzIHtAbGluayBQYXlsb2FkQ29udmVydGVyfS5cbiAgICovXG4gIGRldGFpbHM/OiB1bmtub3duW107XG5cbiAgLyoqXG4gICAqIElmIHNldCwgb3ZlcnJpZGVzIHRoZSBkZWxheSB1bnRpbCB0aGUgbmV4dCByZXRyeSBvZiB0aGlzIEFjdGl2aXR5IC8gV29ya2Zsb3cgVGFzay5cbiAgICpcbiAgICogUmV0cnkgYXR0ZW1wdHMgd2lsbCBzdGlsbCBiZSBzdWJqZWN0IHRvIHRoZSBtYXhpbXVtIHJldHJpZXMgbGltaXQgYW5kIHRvdGFsIHRpbWUgbGltaXQgZGVmaW5lZFxuICAgKiBieSB0aGUgcG9saWN5LlxuICAgKi9cbiAgbmV4dFJldHJ5RGVsYXk/OiBEdXJhdGlvbjtcblxuICAvKipcbiAgICogQ2F1c2Ugb2YgdGhlIGZhaWx1cmVcbiAgICovXG4gIGNhdXNlPzogRXJyb3I7XG59XG5cbi8qKlxuICogVGhpcyBlcnJvciBpcyB0aHJvd24gd2hlbiBDYW5jZWxsYXRpb24gaGFzIGJlZW4gcmVxdWVzdGVkLiBUbyBhbGxvdyBDYW5jZWxsYXRpb24gdG8gaGFwcGVuLCBsZXQgaXQgcHJvcGFnYXRlLiBUb1xuICogaWdub3JlIENhbmNlbGxhdGlvbiwgY2F0Y2ggaXQgYW5kIGNvbnRpbnVlIGV4ZWN1dGluZy4gTm90ZSB0aGF0IENhbmNlbGxhdGlvbiBjYW4gb25seSBiZSByZXF1ZXN0ZWQgYSBzaW5nbGUgdGltZSwgc29cbiAqIHlvdXIgV29ya2Zsb3cvQWN0aXZpdHkgRXhlY3V0aW9uIHdpbGwgbm90IHJlY2VpdmUgZnVydGhlciBDYW5jZWxsYXRpb24gcmVxdWVzdHMuXG4gKlxuICogV2hlbiBhIFdvcmtmbG93IG9yIEFjdGl2aXR5IGhhcyBiZWVuIHN1Y2Nlc3NmdWxseSBjYW5jZWxsZWQsIGEgYENhbmNlbGxlZEZhaWx1cmVgIHdpbGwgYmUgdGhlIGBjYXVzZWAuXG4gKi9cbkBTeW1ib2xCYXNlZEluc3RhbmNlT2ZFcnJvcignQ2FuY2VsbGVkRmFpbHVyZScpXG5leHBvcnQgY2xhc3MgQ2FuY2VsbGVkRmFpbHVyZSBleHRlbmRzIFRlbXBvcmFsRmFpbHVyZSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIG1lc3NhZ2U6IHN0cmluZyB8IHVuZGVmaW5lZCxcbiAgICBwdWJsaWMgcmVhZG9ubHkgZGV0YWlsczogdW5rbm93bltdID0gW10sXG4gICAgY2F1c2U/OiBFcnJvclxuICApIHtcbiAgICBzdXBlcihtZXNzYWdlLCBjYXVzZSk7XG4gIH1cbn1cblxuLyoqXG4gKiBVc2VkIGFzIHRoZSBgY2F1c2VgIHdoZW4gYSBXb3JrZmxvdyBoYXMgYmVlbiB0ZXJtaW5hdGVkXG4gKi9cbkBTeW1ib2xCYXNlZEluc3RhbmNlT2ZFcnJvcignVGVybWluYXRlZEZhaWx1cmUnKVxuZXhwb3J0IGNsYXNzIFRlcm1pbmF0ZWRGYWlsdXJlIGV4dGVuZHMgVGVtcG9yYWxGYWlsdXJlIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZTogc3RyaW5nIHwgdW5kZWZpbmVkLCBjYXVzZT86IEVycm9yKSB7XG4gICAgc3VwZXIobWVzc2FnZSwgY2F1c2UpO1xuICB9XG59XG5cbi8qKlxuICogVXNlZCB0byByZXByZXNlbnQgdGltZW91dHMgb2YgQWN0aXZpdGllcyBhbmQgV29ya2Zsb3dzXG4gKi9cbkBTeW1ib2xCYXNlZEluc3RhbmNlT2ZFcnJvcignVGltZW91dEZhaWx1cmUnKVxuZXhwb3J0IGNsYXNzIFRpbWVvdXRGYWlsdXJlIGV4dGVuZHMgVGVtcG9yYWxGYWlsdXJlIHtcbiAgY29uc3RydWN0b3IoXG4gICAgbWVzc2FnZTogc3RyaW5nIHwgdW5kZWZpbmVkLFxuICAgIHB1YmxpYyByZWFkb25seSBsYXN0SGVhcnRiZWF0RGV0YWlsczogdW5rbm93bixcbiAgICBwdWJsaWMgcmVhZG9ubHkgdGltZW91dFR5cGU6IFRpbWVvdXRUeXBlXG4gICkge1xuICAgIHN1cGVyKG1lc3NhZ2UpO1xuICB9XG59XG5cbi8qKlxuICogQ29udGFpbnMgaW5mb3JtYXRpb24gYWJvdXQgYW4gQWN0aXZpdHkgZmFpbHVyZS4gQWx3YXlzIGNvbnRhaW5zIHRoZSBvcmlnaW5hbCByZWFzb24gZm9yIHRoZSBmYWlsdXJlIGFzIGl0cyBgY2F1c2VgLlxuICogRm9yIGV4YW1wbGUsIGlmIGFuIEFjdGl2aXR5IHRpbWVkIG91dCwgdGhlIGNhdXNlIHdpbGwgYmUgYSB7QGxpbmsgVGltZW91dEZhaWx1cmV9LlxuICpcbiAqIFRoaXMgZXhjZXB0aW9uIGlzIGV4cGVjdGVkIHRvIGJlIHRocm93biBvbmx5IGJ5IHRoZSBmcmFtZXdvcmsgY29kZS5cbiAqL1xuQFN5bWJvbEJhc2VkSW5zdGFuY2VPZkVycm9yKCdBY3Rpdml0eUZhaWx1cmUnKVxuZXhwb3J0IGNsYXNzIEFjdGl2aXR5RmFpbHVyZSBleHRlbmRzIFRlbXBvcmFsRmFpbHVyZSB7XG4gIHB1YmxpYyBjb25zdHJ1Y3RvcihcbiAgICBtZXNzYWdlOiBzdHJpbmcgfCB1bmRlZmluZWQsXG4gICAgcHVibGljIHJlYWRvbmx5IGFjdGl2aXR5VHlwZTogc3RyaW5nLFxuICAgIHB1YmxpYyByZWFkb25seSBhY3Rpdml0eUlkOiBzdHJpbmcgfCB1bmRlZmluZWQsXG4gICAgcHVibGljIHJlYWRvbmx5IHJldHJ5U3RhdGU6IFJldHJ5U3RhdGUsXG4gICAgcHVibGljIHJlYWRvbmx5IGlkZW50aXR5OiBzdHJpbmcgfCB1bmRlZmluZWQsXG4gICAgY2F1c2U/OiBFcnJvclxuICApIHtcbiAgICBzdXBlcihtZXNzYWdlLCBjYXVzZSk7XG4gIH1cbn1cblxuLyoqXG4gKiBDb250YWlucyBpbmZvcm1hdGlvbiBhYm91dCBhIENoaWxkIFdvcmtmbG93IGZhaWx1cmUuIEFsd2F5cyBjb250YWlucyB0aGUgcmVhc29uIGZvciB0aGUgZmFpbHVyZSBhcyBpdHMge0BsaW5rIGNhdXNlfS5cbiAqIEZvciBleGFtcGxlLCBpZiB0aGUgQ2hpbGQgd2FzIFRlcm1pbmF0ZWQsIHRoZSBgY2F1c2VgIGlzIGEge0BsaW5rIFRlcm1pbmF0ZWRGYWlsdXJlfS5cbiAqXG4gKiBUaGlzIGV4Y2VwdGlvbiBpcyBleHBlY3RlZCB0byBiZSB0aHJvd24gb25seSBieSB0aGUgZnJhbWV3b3JrIGNvZGUuXG4gKi9cbkBTeW1ib2xCYXNlZEluc3RhbmNlT2ZFcnJvcignQ2hpbGRXb3JrZmxvd0ZhaWx1cmUnKVxuZXhwb3J0IGNsYXNzIENoaWxkV29ya2Zsb3dGYWlsdXJlIGV4dGVuZHMgVGVtcG9yYWxGYWlsdXJlIHtcbiAgcHVibGljIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyByZWFkb25seSBuYW1lc3BhY2U6IHN0cmluZyB8IHVuZGVmaW5lZCxcbiAgICBwdWJsaWMgcmVhZG9ubHkgZXhlY3V0aW9uOiBXb3JrZmxvd0V4ZWN1dGlvbixcbiAgICBwdWJsaWMgcmVhZG9ubHkgd29ya2Zsb3dUeXBlOiBzdHJpbmcsXG4gICAgcHVibGljIHJlYWRvbmx5IHJldHJ5U3RhdGU6IFJldHJ5U3RhdGUsXG4gICAgY2F1c2U/OiBFcnJvclxuICApIHtcbiAgICBzdXBlcignQ2hpbGQgV29ya2Zsb3cgZXhlY3V0aW9uIGZhaWxlZCcsIGNhdXNlKTtcbiAgfVxufVxuXG4vKipcbiAqIFRoaXMgZXhjZXB0aW9uIGlzIHRocm93biBpbiB0aGUgZm9sbG93aW5nIGNhc2VzOlxuICogIC0gV29ya2Zsb3cgd2l0aCB0aGUgc2FtZSBXb3JrZmxvdyBJZCBpcyBjdXJyZW50bHkgcnVubmluZ1xuICogIC0gVGhlcmUgaXMgYSBjbG9zZWQgV29ya2Zsb3cgd2l0aCB0aGUgc2FtZSBXb3JrZmxvdyBJZCBhbmQgdGhlIHtAbGluayBXb3JrZmxvd09wdGlvbnMud29ya2Zsb3dJZFJldXNlUG9saWN5fVxuICogICAgaXMgYFdPUktGTE9XX0lEX1JFVVNFX1BPTElDWV9SRUpFQ1RfRFVQTElDQVRFYFxuICogIC0gVGhlcmUgaXMgY2xvc2VkIFdvcmtmbG93IGluIHRoZSBgQ29tcGxldGVkYCBzdGF0ZSB3aXRoIHRoZSBzYW1lIFdvcmtmbG93IElkIGFuZCB0aGUge0BsaW5rIFdvcmtmbG93T3B0aW9ucy53b3JrZmxvd0lkUmV1c2VQb2xpY3l9XG4gKiAgICBpcyBgV09SS0ZMT1dfSURfUkVVU0VfUE9MSUNZX0FMTE9XX0RVUExJQ0FURV9GQUlMRURfT05MWWBcbiAqL1xuQFN5bWJvbEJhc2VkSW5zdGFuY2VPZkVycm9yKCdXb3JrZmxvd0V4ZWN1dGlvbkFscmVhZHlTdGFydGVkRXJyb3InKVxuZXhwb3J0IGNsYXNzIFdvcmtmbG93RXhlY3V0aW9uQWxyZWFkeVN0YXJ0ZWRFcnJvciBleHRlbmRzIFRlbXBvcmFsRmFpbHVyZSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIG1lc3NhZ2U6IHN0cmluZyxcbiAgICBwdWJsaWMgcmVhZG9ubHkgd29ya2Zsb3dJZDogc3RyaW5nLFxuICAgIHB1YmxpYyByZWFkb25seSB3b3JrZmxvd1R5cGU6IHN0cmluZ1xuICApIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgfVxufVxuXG4vKipcbiAqIElmIGBlcnJvcmAgaXMgYWxyZWFkeSBhbiBgQXBwbGljYXRpb25GYWlsdXJlYCwgcmV0dXJucyBgZXJyb3JgLlxuICpcbiAqIE90aGVyd2lzZSwgY29udmVydHMgYGVycm9yYCBpbnRvIGFuIGBBcHBsaWNhdGlvbkZhaWx1cmVgIHdpdGg6XG4gKlxuICogLSBgbWVzc2FnZWA6IGBlcnJvci5tZXNzYWdlYCBvciBgU3RyaW5nKGVycm9yKWBcbiAqIC0gYHR5cGVgOiBgZXJyb3IuY29uc3RydWN0b3IubmFtZWAgb3IgYGVycm9yLm5hbWVgXG4gKiAtIGBzdGFja2A6IGBlcnJvci5zdGFja2Agb3IgYCcnYFxuICovXG5leHBvcnQgZnVuY3Rpb24gZW5zdXJlQXBwbGljYXRpb25GYWlsdXJlKGVycm9yOiB1bmtub3duKTogQXBwbGljYXRpb25GYWlsdXJlIHtcbiAgaWYgKGVycm9yIGluc3RhbmNlb2YgQXBwbGljYXRpb25GYWlsdXJlKSB7XG4gICAgcmV0dXJuIGVycm9yO1xuICB9XG5cbiAgY29uc3QgbWVzc2FnZSA9IChpc1JlY29yZChlcnJvcikgJiYgU3RyaW5nKGVycm9yLm1lc3NhZ2UpKSB8fCBTdHJpbmcoZXJyb3IpO1xuICBjb25zdCB0eXBlID0gKGlzUmVjb3JkKGVycm9yKSAmJiAoZXJyb3IuY29uc3RydWN0b3I/Lm5hbWUgPz8gZXJyb3IubmFtZSkpIHx8IHVuZGVmaW5lZDtcbiAgY29uc3QgZmFpbHVyZSA9IEFwcGxpY2F0aW9uRmFpbHVyZS5jcmVhdGUoeyBtZXNzYWdlLCB0eXBlLCBub25SZXRyeWFibGU6IGZhbHNlIH0pO1xuICBmYWlsdXJlLnN0YWNrID0gKGlzUmVjb3JkKGVycm9yKSAmJiBTdHJpbmcoZXJyb3Iuc3RhY2spKSB8fCAnJztcbiAgcmV0dXJuIGZhaWx1cmU7XG59XG5cbi8qKlxuICogSWYgYGVycmAgaXMgYW4gRXJyb3IgaXQgaXMgdHVybmVkIGludG8gYW4gYEFwcGxpY2F0aW9uRmFpbHVyZWAuXG4gKlxuICogSWYgYGVycmAgd2FzIGFscmVhZHkgYSBgVGVtcG9yYWxGYWlsdXJlYCwgcmV0dXJucyB0aGUgb3JpZ2luYWwgZXJyb3IuXG4gKlxuICogT3RoZXJ3aXNlIHJldHVybnMgYW4gYEFwcGxpY2F0aW9uRmFpbHVyZWAgd2l0aCBgU3RyaW5nKGVycilgIGFzIHRoZSBtZXNzYWdlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZW5zdXJlVGVtcG9yYWxGYWlsdXJlKGVycjogdW5rbm93bik6IFRlbXBvcmFsRmFpbHVyZSB7XG4gIGlmIChlcnIgaW5zdGFuY2VvZiBUZW1wb3JhbEZhaWx1cmUpIHtcbiAgICByZXR1cm4gZXJyO1xuICB9XG4gIHJldHVybiBlbnN1cmVBcHBsaWNhdGlvbkZhaWx1cmUoZXJyKTtcbn1cblxuLyoqXG4gKiBHZXQgdGhlIHJvb3QgY2F1c2UgbWVzc2FnZSBvZiBnaXZlbiBgZXJyb3JgLlxuICpcbiAqIEluIGNhc2UgYGVycm9yYCBpcyBhIHtAbGluayBUZW1wb3JhbEZhaWx1cmV9LCByZWN1cnNlIHRoZSBgY2F1c2VgIGNoYWluIGFuZCByZXR1cm4gdGhlIHJvb3QgYGNhdXNlLm1lc3NhZ2VgLlxuICogT3RoZXJ3aXNlLCByZXR1cm4gYGVycm9yLm1lc3NhZ2VgLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcm9vdENhdXNlKGVycm9yOiB1bmtub3duKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgaWYgKGVycm9yIGluc3RhbmNlb2YgVGVtcG9yYWxGYWlsdXJlKSB7XG4gICAgcmV0dXJuIGVycm9yLmNhdXNlID8gcm9vdENhdXNlKGVycm9yLmNhdXNlKSA6IGVycm9yLm1lc3NhZ2U7XG4gIH1cbiAgcmV0dXJuIGVycm9yTWVzc2FnZShlcnJvcik7XG59XG4iLCIvKipcbiAqIENvbW1vbiBsaWJyYXJ5IGZvciBjb2RlIHRoYXQncyB1c2VkIGFjcm9zcyB0aGUgQ2xpZW50LCBXb3JrZXIsIGFuZC9vciBXb3JrZmxvd1xuICpcbiAqIEBtb2R1bGVcbiAqL1xuXG5pbXBvcnQgKiBhcyBlbmNvZGluZyBmcm9tICcuL2VuY29kaW5nJztcbmltcG9ydCAqIGFzIGhlbHBlcnMgZnJvbSAnLi90eXBlLWhlbHBlcnMnO1xuXG5leHBvcnQgKiBmcm9tICcuL2FjdGl2aXR5LW9wdGlvbnMnO1xuZXhwb3J0ICogZnJvbSAnLi9jb252ZXJ0ZXIvZGF0YS1jb252ZXJ0ZXInO1xuZXhwb3J0ICogZnJvbSAnLi9jb252ZXJ0ZXIvZmFpbHVyZS1jb252ZXJ0ZXInO1xuZXhwb3J0ICogZnJvbSAnLi9jb252ZXJ0ZXIvcGF5bG9hZC1jb2RlYyc7XG5leHBvcnQgKiBmcm9tICcuL2NvbnZlcnRlci9wYXlsb2FkLWNvbnZlcnRlcic7XG5leHBvcnQgKiBmcm9tICcuL2NvbnZlcnRlci90eXBlcyc7XG5leHBvcnQgKiBmcm9tICcuL2RlcHJlY2F0ZWQtdGltZSc7XG5leHBvcnQgKiBmcm9tICcuL2Vycm9ycyc7XG5leHBvcnQgKiBmcm9tICcuL2ZhaWx1cmUnO1xuZXhwb3J0IHsgSGVhZGVycywgTmV4dCB9IGZyb20gJy4vaW50ZXJjZXB0b3JzJztcbmV4cG9ydCAqIGZyb20gJy4vaW50ZXJmYWNlcyc7XG5leHBvcnQgKiBmcm9tICcuL2xvZ2dlcic7XG5leHBvcnQgKiBmcm9tICcuL3JldHJ5LXBvbGljeSc7XG5leHBvcnQgdHlwZSB7IFRpbWVzdGFtcCwgRHVyYXRpb24sIFN0cmluZ1ZhbHVlIH0gZnJvbSAnLi90aW1lJztcbmV4cG9ydCAqIGZyb20gJy4vd29ya2Zsb3ctaGFuZGxlJztcbmV4cG9ydCAqIGZyb20gJy4vd29ya2Zsb3ctb3B0aW9ucyc7XG5leHBvcnQgKiBmcm9tICcuL3ZlcnNpb25pbmctaW50ZW50JztcblxuLyoqXG4gKiBFbmNvZGUgYSBVVEYtOCBzdHJpbmcgaW50byBhIFVpbnQ4QXJyYXlcbiAqXG4gKiBAaGlkZGVuXG4gKiBAZGVwcmVjYXRlZCAtIG1lYW50IGZvciBpbnRlcm5hbCB1c2Ugb25seVxuICovXG5leHBvcnQgZnVuY3Rpb24gdTgoczogc3RyaW5nKTogVWludDhBcnJheSB7XG4gIHJldHVybiBlbmNvZGluZy5lbmNvZGUocyk7XG59XG5cbi8qKlxuICogRGVjb2RlIGEgVWludDhBcnJheSBpbnRvIGEgVVRGLTggc3RyaW5nXG4gKlxuICogQGhpZGRlblxuICogQGRlcHJlY2F0ZWQgLSBtZWFudCBmb3IgaW50ZXJuYWwgdXNlIG9ubHlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN0cihhcnI6IFVpbnQ4QXJyYXkpOiBzdHJpbmcge1xuICByZXR1cm4gZW5jb2RpbmcuZGVjb2RlKGFycik7XG59XG5cbi8qKlxuICogR2V0IGBlcnJvci5tZXNzYWdlYCAob3IgYHVuZGVmaW5lZGAgaWYgbm90IHByZXNlbnQpXG4gKlxuICogQGhpZGRlblxuICogQGRlcHJlY2F0ZWQgLSBtZWFudCBmb3IgaW50ZXJuYWwgdXNlIG9ubHlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVycm9yTWVzc2FnZShlcnJvcjogdW5rbm93bik6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gIHJldHVybiBoZWxwZXJzLmVycm9yTWVzc2FnZShlcnJvcik7XG59XG5cbi8qKlxuICogR2V0IGBlcnJvci5jb2RlYCAob3IgYHVuZGVmaW5lZGAgaWYgbm90IHByZXNlbnQpXG4gKlxuICogQGhpZGRlblxuICogQGRlcHJlY2F0ZWQgLSBtZWFudCBmb3IgaW50ZXJuYWwgdXNlIG9ubHlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVycm9yQ29kZShlcnJvcjogdW5rbm93bik6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gIHJldHVybiBoZWxwZXJzLmVycm9yQ29kZShlcnJvcik7XG59XG4iLCJpbXBvcnQgeyBBbnlGdW5jLCBPbWl0TGFzdFBhcmFtIH0gZnJvbSAnLi90eXBlLWhlbHBlcnMnO1xuaW1wb3J0IHsgUGF5bG9hZCB9IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5cbi8qKlxuICogVHlwZSBvZiB0aGUgbmV4dCBmdW5jdGlvbiBmb3IgYSBnaXZlbiBpbnRlcmNlcHRvciBmdW5jdGlvblxuICpcbiAqIENhbGxlZCBmcm9tIGFuIGludGVyY2VwdG9yIHRvIGNvbnRpbnVlIHRoZSBpbnRlcmNlcHRpb24gY2hhaW5cbiAqL1xuZXhwb3J0IHR5cGUgTmV4dDxJRiwgRk4gZXh0ZW5kcyBrZXlvZiBJRj4gPSBSZXF1aXJlZDxJRj5bRk5dIGV4dGVuZHMgQW55RnVuYyA/IE9taXRMYXN0UGFyYW08UmVxdWlyZWQ8SUY+W0ZOXT4gOiBuZXZlcjtcblxuLyoqIEhlYWRlcnMgYXJlIGp1c3QgYSBtYXBwaW5nIG9mIGhlYWRlciBuYW1lIHRvIFBheWxvYWQgKi9cbmV4cG9ydCB0eXBlIEhlYWRlcnMgPSBSZWNvcmQ8c3RyaW5nLCBQYXlsb2FkPjtcblxuLyoqXG4gKiBDb21wb3NlIGFsbCBpbnRlcmNlcHRvciBtZXRob2RzIGludG8gYSBzaW5nbGUgZnVuY3Rpb24uXG4gKlxuICogQ2FsbGluZyB0aGUgY29tcG9zZWQgZnVuY3Rpb24gcmVzdWx0cyBpbiBjYWxsaW5nIGVhY2ggb2YgdGhlIHByb3ZpZGVkIGludGVyY2VwdG9yLCBpbiBvcmRlciAoZnJvbSB0aGUgZmlyc3QgdG9cbiAqIHRoZSBsYXN0KSwgZm9sbG93ZWQgYnkgdGhlIG9yaWdpbmFsIGZ1bmN0aW9uIHByb3ZpZGVkIGFzIGFyZ3VtZW50IHRvIGBjb21wb3NlSW50ZXJjZXB0b3JzKClgLlxuICpcbiAqIEBwYXJhbSBpbnRlcmNlcHRvcnMgYSBsaXN0IG9mIGludGVyY2VwdG9yc1xuICogQHBhcmFtIG1ldGhvZCB0aGUgbmFtZSBvZiB0aGUgaW50ZXJjZXB0b3IgbWV0aG9kIHRvIGNvbXBvc2VcbiAqIEBwYXJhbSBuZXh0IHRoZSBvcmlnaW5hbCBmdW5jdGlvbiB0byBiZSBleGVjdXRlZCBhdCB0aGUgZW5kIG9mIHRoZSBpbnRlcmNlcHRpb24gY2hhaW5cbiAqL1xuLy8gdHMtcHJ1bmUtaWdub3JlLW5leHQgKGltcG9ydGVkIHZpYSBsaWIvaW50ZXJjZXB0b3JzKVxuZXhwb3J0IGZ1bmN0aW9uIGNvbXBvc2VJbnRlcmNlcHRvcnM8SSwgTSBleHRlbmRzIGtleW9mIEk+KGludGVyY2VwdG9yczogSVtdLCBtZXRob2Q6IE0sIG5leHQ6IE5leHQ8SSwgTT4pOiBOZXh0PEksIE0+IHtcbiAgZm9yIChsZXQgaSA9IGludGVyY2VwdG9ycy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgIGNvbnN0IGludGVyY2VwdG9yID0gaW50ZXJjZXB0b3JzW2ldO1xuICAgIGlmIChpbnRlcmNlcHRvclttZXRob2RdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGNvbnN0IHByZXYgPSBuZXh0O1xuICAgICAgLy8gV2UgbG9zZSB0eXBlIHNhZmV0eSBoZXJlIGJlY2F1c2UgVHlwZXNjcmlwdCBjYW4ndCBkZWR1Y2UgdGhhdCBpbnRlcmNlcHRvclttZXRob2RdIGlzIGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zXG4gICAgICAvLyB0aGUgc2FtZSB0eXBlIGFzIE5leHQ8SSwgTT5cbiAgICAgIG5leHQgPSAoKGlucHV0OiBhbnkpID0+IChpbnRlcmNlcHRvclttZXRob2RdIGFzIGFueSkoaW5wdXQsIHByZXYpKSBhcyBhbnk7XG4gICAgfVxuICB9XG4gIHJldHVybiBuZXh0O1xufVxuIiwiaW1wb3J0IHR5cGUgeyB0ZW1wb3JhbCB9IGZyb20gJ0B0ZW1wb3JhbGlvL3Byb3RvJztcblxuZXhwb3J0IHR5cGUgUGF5bG9hZCA9IHRlbXBvcmFsLmFwaS5jb21tb24udjEuSVBheWxvYWQ7XG5cbi8qKiBUeXBlIHRoYXQgY2FuIGJlIHJldHVybmVkIGZyb20gYSBXb3JrZmxvdyBgZXhlY3V0ZWAgZnVuY3Rpb24gKi9cbmV4cG9ydCB0eXBlIFdvcmtmbG93UmV0dXJuVHlwZSA9IFByb21pc2U8YW55PjtcbmV4cG9ydCB0eXBlIFdvcmtmbG93VXBkYXRlVHlwZSA9ICguLi5hcmdzOiBhbnlbXSkgPT4gUHJvbWlzZTxhbnk+IHwgYW55O1xuZXhwb3J0IHR5cGUgV29ya2Zsb3dVcGRhdGVWYWxpZGF0b3JUeXBlID0gKC4uLmFyZ3M6IGFueVtdKSA9PiB2b2lkO1xuZXhwb3J0IHR5cGUgV29ya2Zsb3dVcGRhdGVBbm5vdGF0ZWRUeXBlID0ge1xuICBoYW5kbGVyOiBXb3JrZmxvd1VwZGF0ZVR5cGU7XG4gIHVuZmluaXNoZWRQb2xpY3k6IEhhbmRsZXJVbmZpbmlzaGVkUG9saWN5O1xuICB2YWxpZGF0b3I/OiBXb3JrZmxvd1VwZGF0ZVZhbGlkYXRvclR5cGU7XG4gIGRlc2NyaXB0aW9uPzogc3RyaW5nO1xufTtcbmV4cG9ydCB0eXBlIFdvcmtmbG93U2lnbmFsVHlwZSA9ICguLi5hcmdzOiBhbnlbXSkgPT4gUHJvbWlzZTx2b2lkPiB8IHZvaWQ7XG5leHBvcnQgdHlwZSBXb3JrZmxvd1NpZ25hbEFubm90YXRlZFR5cGUgPSB7XG4gIGhhbmRsZXI6IFdvcmtmbG93U2lnbmFsVHlwZTtcbiAgdW5maW5pc2hlZFBvbGljeTogSGFuZGxlclVuZmluaXNoZWRQb2xpY3k7XG4gIGRlc2NyaXB0aW9uPzogc3RyaW5nO1xufTtcbmV4cG9ydCB0eXBlIFdvcmtmbG93UXVlcnlUeXBlID0gKC4uLmFyZ3M6IGFueVtdKSA9PiBhbnk7XG5leHBvcnQgdHlwZSBXb3JrZmxvd1F1ZXJ5QW5ub3RhdGVkVHlwZSA9IHsgaGFuZGxlcjogV29ya2Zsb3dRdWVyeVR5cGU7IGRlc2NyaXB0aW9uPzogc3RyaW5nIH07XG5cbi8qKlxuICogQnJvYWQgV29ya2Zsb3cgZnVuY3Rpb24gZGVmaW5pdGlvbiwgc3BlY2lmaWMgV29ya2Zsb3dzIHdpbGwgdHlwaWNhbGx5IHVzZSBhIG5hcnJvd2VyIHR5cGUgZGVmaW5pdGlvbiwgZS5nOlxuICogYGBgdHNcbiAqIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBteVdvcmtmbG93KGFyZzE6IG51bWJlciwgYXJnMjogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+O1xuICogYGBgXG4gKi9cbmV4cG9ydCB0eXBlIFdvcmtmbG93ID0gKC4uLmFyZ3M6IGFueVtdKSA9PiBXb3JrZmxvd1JldHVyblR5cGU7XG5cbmRlY2xhcmUgY29uc3QgYXJnc0JyYW5kOiB1bmlxdWUgc3ltYm9sO1xuZGVjbGFyZSBjb25zdCByZXRCcmFuZDogdW5pcXVlIHN5bWJvbDtcblxuLyoqXG4gKiBBbiBpbnRlcmZhY2UgcmVwcmVzZW50aW5nIGEgV29ya2Zsb3cgdXBkYXRlIGRlZmluaXRpb24sIGFzIHJldHVybmVkIGZyb20ge0BsaW5rIGRlZmluZVVwZGF0ZX1cbiAqXG4gKiBAcmVtYXJrcyBgQXJnc2AgY2FuIGJlIHVzZWQgZm9yIHBhcmFtZXRlciB0eXBlIGluZmVyZW5jZSBpbiBoYW5kbGVyIGZ1bmN0aW9ucyBhbmQgV29ya2Zsb3dIYW5kbGUgbWV0aG9kcy5cbiAqIGBOYW1lYCBjYW4gb3B0aW9uYWxseSBiZSBzcGVjaWZpZWQgd2l0aCBhIHN0cmluZyBsaXRlcmFsIHR5cGUgdG8gcHJlc2VydmUgdHlwZS1sZXZlbCBrbm93bGVkZ2Ugb2YgdGhlIHVwZGF0ZSBuYW1lLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFVwZGF0ZURlZmluaXRpb248UmV0LCBBcmdzIGV4dGVuZHMgYW55W10gPSBbXSwgTmFtZSBleHRlbmRzIHN0cmluZyA9IHN0cmluZz4ge1xuICB0eXBlOiAndXBkYXRlJztcbiAgbmFtZTogTmFtZTtcbiAgLyoqXG4gICAqIFZpcnR1YWwgdHlwZSBicmFuZCB0byBtYWludGFpbiBhIGRpc3RpbmN0aW9uIGJldHdlZW4ge0BsaW5rIFVwZGF0ZURlZmluaXRpb259IHR5cGVzIHdpdGggZGlmZmVyZW50IGFyZ3MuXG4gICAqIFRoaXMgZmllbGQgaXMgbm90IHByZXNlbnQgYXQgcnVuLXRpbWUuXG4gICAqL1xuICBbYXJnc0JyYW5kXTogQXJncztcbiAgLyoqXG4gICAqIFZpcnR1YWwgdHlwZSBicmFuZCB0byBtYWludGFpbiBhIGRpc3RpbmN0aW9uIGJldHdlZW4ge0BsaW5rIFVwZGF0ZURlZmluaXRpb259IHR5cGVzIHdpdGggZGlmZmVyZW50IHJldHVybiB0eXBlcy5cbiAgICogVGhpcyBmaWVsZCBpcyBub3QgcHJlc2VudCBhdCBydW4tdGltZS5cbiAgICovXG4gIFtyZXRCcmFuZF06IFJldDtcbn1cblxuLyoqXG4gKiBBbiBpbnRlcmZhY2UgcmVwcmVzZW50aW5nIGEgV29ya2Zsb3cgc2lnbmFsIGRlZmluaXRpb24sIGFzIHJldHVybmVkIGZyb20ge0BsaW5rIGRlZmluZVNpZ25hbH1cbiAqXG4gKiBAcmVtYXJrcyBgQXJnc2AgY2FuIGJlIHVzZWQgZm9yIHBhcmFtZXRlciB0eXBlIGluZmVyZW5jZSBpbiBoYW5kbGVyIGZ1bmN0aW9ucyBhbmQgV29ya2Zsb3dIYW5kbGUgbWV0aG9kcy5cbiAqIGBOYW1lYCBjYW4gb3B0aW9uYWxseSBiZSBzcGVjaWZpZWQgd2l0aCBhIHN0cmluZyBsaXRlcmFsIHR5cGUgdG8gcHJlc2VydmUgdHlwZS1sZXZlbCBrbm93bGVkZ2Ugb2YgdGhlIHNpZ25hbCBuYW1lLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFNpZ25hbERlZmluaXRpb248QXJncyBleHRlbmRzIGFueVtdID0gW10sIE5hbWUgZXh0ZW5kcyBzdHJpbmcgPSBzdHJpbmc+IHtcbiAgdHlwZTogJ3NpZ25hbCc7XG4gIG5hbWU6IE5hbWU7XG4gIC8qKlxuICAgKiBWaXJ0dWFsIHR5cGUgYnJhbmQgdG8gbWFpbnRhaW4gYSBkaXN0aW5jdGlvbiBiZXR3ZWVuIHtAbGluayBTaWduYWxEZWZpbml0aW9ufSB0eXBlcyB3aXRoIGRpZmZlcmVudCBhcmdzLlxuICAgKiBUaGlzIGZpZWxkIGlzIG5vdCBwcmVzZW50IGF0IHJ1bi10aW1lLlxuICAgKi9cbiAgW2FyZ3NCcmFuZF06IEFyZ3M7XG59XG5cbi8qKlxuICogQW4gaW50ZXJmYWNlIHJlcHJlc2VudGluZyBhIFdvcmtmbG93IHF1ZXJ5IGRlZmluaXRpb24gYXMgcmV0dXJuZWQgZnJvbSB7QGxpbmsgZGVmaW5lUXVlcnl9XG4gKlxuICogQHJlbWFya3MgYEFyZ3NgIGFuZCBgUmV0YCBjYW4gYmUgdXNlZCBmb3IgcGFyYW1ldGVyIHR5cGUgaW5mZXJlbmNlIGluIGhhbmRsZXIgZnVuY3Rpb25zIGFuZCBXb3JrZmxvd0hhbmRsZSBtZXRob2RzLlxuICogYE5hbWVgIGNhbiBvcHRpb25hbGx5IGJlIHNwZWNpZmllZCB3aXRoIGEgc3RyaW5nIGxpdGVyYWwgdHlwZSB0byBwcmVzZXJ2ZSB0eXBlLWxldmVsIGtub3dsZWRnZSBvZiB0aGUgcXVlcnkgbmFtZS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBRdWVyeURlZmluaXRpb248UmV0LCBBcmdzIGV4dGVuZHMgYW55W10gPSBbXSwgTmFtZSBleHRlbmRzIHN0cmluZyA9IHN0cmluZz4ge1xuICB0eXBlOiAncXVlcnknO1xuICBuYW1lOiBOYW1lO1xuICAvKipcbiAgICogVmlydHVhbCB0eXBlIGJyYW5kIHRvIG1haW50YWluIGEgZGlzdGluY3Rpb24gYmV0d2VlbiB7QGxpbmsgUXVlcnlEZWZpbml0aW9ufSB0eXBlcyB3aXRoIGRpZmZlcmVudCBhcmdzLlxuICAgKiBUaGlzIGZpZWxkIGlzIG5vdCBwcmVzZW50IGF0IHJ1bi10aW1lLlxuICAgKi9cbiAgW2FyZ3NCcmFuZF06IEFyZ3M7XG4gIC8qKlxuICAgKiBWaXJ0dWFsIHR5cGUgYnJhbmQgdG8gbWFpbnRhaW4gYSBkaXN0aW5jdGlvbiBiZXR3ZWVuIHtAbGluayBRdWVyeURlZmluaXRpb259IHR5cGVzIHdpdGggZGlmZmVyZW50IHJldHVybiB0eXBlcy5cbiAgICogVGhpcyBmaWVsZCBpcyBub3QgcHJlc2VudCBhdCBydW4tdGltZS5cbiAgICovXG4gIFtyZXRCcmFuZF06IFJldDtcbn1cblxuLyoqIEdldCB0aGUgXCJ1bndyYXBwZWRcIiByZXR1cm4gdHlwZSAod2l0aG91dCBQcm9taXNlKSBvZiB0aGUgZXhlY3V0ZSBoYW5kbGVyIGZyb20gV29ya2Zsb3cgdHlwZSBgV2AgKi9cbmV4cG9ydCB0eXBlIFdvcmtmbG93UmVzdWx0VHlwZTxXIGV4dGVuZHMgV29ya2Zsb3c+ID0gUmV0dXJuVHlwZTxXPiBleHRlbmRzIFByb21pc2U8aW5mZXIgUj4gPyBSIDogbmV2ZXI7XG5cbi8qKlxuICogSWYgYW5vdGhlciBTREsgY3JlYXRlcyBhIFNlYXJjaCBBdHRyaWJ1dGUgdGhhdCdzIG5vdCBhbiBhcnJheSwgd2Ugd3JhcCBpdCBpbiBhbiBhcnJheS5cbiAqXG4gKiBEYXRlcyBhcmUgc2VyaWFsaXplZCBhcyBJU08gc3RyaW5ncy5cbiAqL1xuZXhwb3J0IHR5cGUgU2VhcmNoQXR0cmlidXRlcyA9IFJlY29yZDxzdHJpbmcsIFNlYXJjaEF0dHJpYnV0ZVZhbHVlIHwgUmVhZG9ubHk8U2VhcmNoQXR0cmlidXRlVmFsdWU+IHwgdW5kZWZpbmVkPjtcbmV4cG9ydCB0eXBlIFNlYXJjaEF0dHJpYnV0ZVZhbHVlID0gc3RyaW5nW10gfCBudW1iZXJbXSB8IGJvb2xlYW5bXSB8IERhdGVbXTtcblxuZXhwb3J0IGludGVyZmFjZSBBY3Rpdml0eUZ1bmN0aW9uPFAgZXh0ZW5kcyBhbnlbXSA9IGFueVtdLCBSID0gYW55PiB7XG4gICguLi5hcmdzOiBQKTogUHJvbWlzZTxSPjtcbn1cblxuLyoqXG4gKiBNYXBwaW5nIG9mIEFjdGl2aXR5IG5hbWUgdG8gZnVuY3Rpb25cbiAqIEBkZXByZWNhdGVkIG5vdCByZXF1aXJlZCBhbnltb3JlLCBmb3IgdW50eXBlZCBhY3Rpdml0aWVzIHVzZSB7QGxpbmsgVW50eXBlZEFjdGl2aXRpZXN9XG4gKi9cbmV4cG9ydCB0eXBlIEFjdGl2aXR5SW50ZXJmYWNlID0gUmVjb3JkPHN0cmluZywgQWN0aXZpdHlGdW5jdGlvbj47XG5cbi8qKlxuICogTWFwcGluZyBvZiBBY3Rpdml0eSBuYW1lIHRvIGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCB0eXBlIFVudHlwZWRBY3Rpdml0aWVzID0gUmVjb3JkPHN0cmluZywgQWN0aXZpdHlGdW5jdGlvbj47XG5cbi8qKlxuICogQSB3b3JrZmxvdydzIGhpc3RvcnkgYW5kIElELiBVc2VmdWwgZm9yIHJlcGxheS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBIaXN0b3J5QW5kV29ya2Zsb3dJZCB7XG4gIHdvcmtmbG93SWQ6IHN0cmluZztcbiAgaGlzdG9yeTogdGVtcG9yYWwuYXBpLmhpc3RvcnkudjEuSGlzdG9yeSB8IHVua25vd24gfCB1bmRlZmluZWQ7XG59XG5cbi8qKlxuICogUG9saWN5IGRlZmluaW5nIGFjdGlvbnMgdGFrZW4gd2hlbiBhIHdvcmtmbG93IGV4aXRzIHdoaWxlIHVwZGF0ZSBvciBzaWduYWwgaGFuZGxlcnMgYXJlIHJ1bm5pbmcuXG4gKiBUaGUgd29ya2Zsb3cgZXhpdCBtYXkgYmUgZHVlIHRvIHN1Y2Nlc3NmdWwgcmV0dXJuLCBmYWlsdXJlLCBjYW5jZWxsYXRpb24sIG9yIGNvbnRpbnVlLWFzLW5ldy5cbiAqL1xuZXhwb3J0IGVudW0gSGFuZGxlclVuZmluaXNoZWRQb2xpY3kge1xuICAvKipcbiAgICogSXNzdWUgYSB3YXJuaW5nIGluIGFkZGl0aW9uIHRvIGFiYW5kb25pbmcgdGhlIGhhbmRsZXIgZXhlY3V0aW9uLiBUaGUgd2FybmluZyB3aWxsIG5vdCBiZSBpc3N1ZWQgaWYgdGhlIHdvcmtmbG93IGZhaWxzLlxuICAgKi9cbiAgV0FSTl9BTkRfQUJBTkRPTiA9IDEsXG5cbiAgLyoqXG4gICAqIEFiYW5kb24gdGhlIGhhbmRsZXIgZXhlY3V0aW9uLlxuICAgKlxuICAgKiBJbiB0aGUgY2FzZSBvZiBhbiB1cGRhdGUgaGFuZGxlciB0aGlzIG1lYW5zIHRoYXQgdGhlIGNsaWVudCB3aWxsIHJlY2VpdmUgYW4gZXJyb3IgcmF0aGVyIHRoYW5cbiAgICogdGhlIHVwZGF0ZSByZXN1bHQuXG4gICAqL1xuICBBQkFORE9OID0gMixcbn1cbiIsImV4cG9ydCB0eXBlIExvZ0xldmVsID0gJ1RSQUNFJyB8ICdERUJVRycgfCAnSU5GTycgfCAnV0FSTicgfCAnRVJST1InO1xuXG5leHBvcnQgdHlwZSBMb2dNZXRhZGF0YSA9IFJlY29yZDxzdHJpbmcgfCBzeW1ib2wsIGFueT47XG5cbi8qKlxuICogSW1wbGVtZW50IHRoaXMgaW50ZXJmYWNlIGluIG9yZGVyIHRvIGN1c3RvbWl6ZSB3b3JrZXIgbG9nZ2luZ1xuICovXG5leHBvcnQgaW50ZXJmYWNlIExvZ2dlciB7XG4gIGxvZyhsZXZlbDogTG9nTGV2ZWwsIG1lc3NhZ2U6IHN0cmluZywgbWV0YT86IExvZ01ldGFkYXRhKTogYW55O1xuICB0cmFjZShtZXNzYWdlOiBzdHJpbmcsIG1ldGE/OiBMb2dNZXRhZGF0YSk6IGFueTtcbiAgZGVidWcobWVzc2FnZTogc3RyaW5nLCBtZXRhPzogTG9nTWV0YWRhdGEpOiBhbnk7XG4gIGluZm8obWVzc2FnZTogc3RyaW5nLCBtZXRhPzogTG9nTWV0YWRhdGEpOiBhbnk7XG4gIHdhcm4obWVzc2FnZTogc3RyaW5nLCBtZXRhPzogTG9nTWV0YWRhdGEpOiBhbnk7XG4gIGVycm9yKG1lc3NhZ2U6IHN0cmluZywgbWV0YT86IExvZ01ldGFkYXRhKTogYW55O1xufVxuXG4vKipcbiAqIFBvc3NpYmxlIHZhbHVlcyBvZiB0aGUgYHNka0NvbXBvbmVudGAgbWV0YSBhdHRyaWJ1dGVzIG9uIGxvZyBtZXNzYWdlcy4gVGhpc1xuICogYXR0cmlidXRlIGluZGljYXRlcyB3aGljaCBzdWJzeXN0ZW0gZW1pdHRlZCB0aGUgbG9nIG1lc3NhZ2U7IHRoaXMgbWF5IGZvclxuICogZXhhbXBsZSBiZSB1c2VkIHRvIGltcGxlbWVudCBmaW5lLWdyYWluZWQgZmlsdGVyaW5nIG9mIGxvZyBtZXNzYWdlcy5cbiAqXG4gKiBOb3RlIHRoYXQgdGhlcmUgaXMgbm8gZ3VhcmFudGVlIHRoYXQgdGhpcyBsaXN0IHdpbGwgcmVtYWluIHN0YWJsZSBpbiB0aGVcbiAqIGZ1dHVyZTsgdmFsdWVzIG1heSBiZSBhZGRlZCBvciByZW1vdmVkLCBhbmQgbWVzc2FnZXMgdGhhdCBhcmUgY3VycmVudGx5XG4gKiBlbWl0dGVkIHdpdGggc29tZSBgc2RrQ29tcG9uZW50YCB2YWx1ZSBtYXkgdXNlIGEgZGlmZmVyZW50IHZhbHVlIGluIHRoZSBmdXR1cmUuXG4gKi9cbmV4cG9ydCBlbnVtIFNka0NvbXBvbmVudCB7XG4gIC8qKlxuICAgKiBDb21wb25lbnQgbmFtZSBmb3IgbWVzc2FnZXMgZW1pdGVkIGZyb20gV29ya2Zsb3cgY29kZSwgdXNpbmcgdGhlIHtAbGluayBXb3JrZmxvdyBjb250ZXh0IGxvZ2dlcnx3b3JrZmxvdy5sb2d9LlxuICAgKiBUaGUgU0RLIGl0c2VsZiBuZXZlciBwdWJsaXNoZXMgbWVzc2FnZXMgd2l0aCB0aGlzIGNvbXBvbmVudCBuYW1lLlxuICAgKi9cbiAgd29ya2Zsb3cgPSAnd29ya2Zsb3cnLFxuXG4gIC8qKlxuICAgKiBDb21wb25lbnQgbmFtZSBmb3IgbWVzc2FnZXMgZW1pdGVkIGZyb20gYW4gYWN0aXZpdHksIHVzaW5nIHRoZSB7QGxpbmsgYWN0aXZpdHkgY29udGV4dCBsb2dnZXJ8Q29udGV4dC5sb2d9LlxuICAgKiBUaGUgU0RLIGl0c2VsZiBuZXZlciBwdWJsaXNoZXMgbWVzc2FnZXMgd2l0aCB0aGlzIGNvbXBvbmVudCBuYW1lLlxuICAgKi9cbiAgYWN0aXZpdHkgPSAnYWN0aXZpdHknLFxuXG4gIC8qKlxuICAgKiBDb21wb25lbnQgbmFtZSBmb3IgbWVzc2FnZXMgZW1pdGVkIGZyb20gYSBUZW1wb3JhbCBXb3JrZXIgaW5zdGFuY2UuXG4gICAqXG4gICAqIFRoaXMgbm90YWJseSBpbmNsdWRlczpcbiAgICogLSBJc3N1ZXMgd2l0aCBXb3JrZXIgb3IgcnVudGltZSBjb25maWd1cmF0aW9uLCBvciB0aGUgSlMgZXhlY3V0aW9uIGVudmlyb25tZW50O1xuICAgKiAtIFdvcmtlcidzLCBBY3Rpdml0eSdzLCBhbmQgV29ya2Zsb3cncyBsaWZlY3ljbGUgZXZlbnRzO1xuICAgKiAtIFdvcmtmbG93IEFjdGl2YXRpb24gYW5kIEFjdGl2aXR5IFRhc2sgcHJvY2Vzc2luZyBldmVudHM7XG4gICAqIC0gV29ya2Zsb3cgYnVuZGxpbmcgbWVzc2FnZXM7XG4gICAqIC0gU2luayBwcm9jZXNzaW5nIGlzc3Vlcy5cbiAgICovXG4gIHdvcmtlciA9ICd3b3JrZXInLFxuXG4gIC8qKlxuICAgKiBDb21wb25lbnQgbmFtZSBmb3IgYWxsIG1lc3NhZ2VzIGVtaXR0ZWQgYnkgdGhlIFJ1c3QgQ29yZSBTREsgbGlicmFyeS5cbiAgICovXG4gIGNvcmUgPSAnY29yZScsXG59XG4iLCJpbXBvcnQgdHlwZSB7IHRlbXBvcmFsIH0gZnJvbSAnQHRlbXBvcmFsaW8vcHJvdG8nO1xuaW1wb3J0IHsgVmFsdWVFcnJvciB9IGZyb20gJy4vZXJyb3JzJztcbmltcG9ydCB7IER1cmF0aW9uLCBtc09wdGlvbmFsVG9OdW1iZXIsIG1zT3B0aW9uYWxUb1RzLCBtc1RvTnVtYmVyLCBtc1RvVHMsIG9wdGlvbmFsVHNUb01zIH0gZnJvbSAnLi90aW1lJztcblxuLyoqXG4gKiBPcHRpb25zIGZvciByZXRyeWluZyBXb3JrZmxvd3MgYW5kIEFjdGl2aXRpZXNcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBSZXRyeVBvbGljeSB7XG4gIC8qKlxuICAgKiBDb2VmZmljaWVudCB1c2VkIHRvIGNhbGN1bGF0ZSB0aGUgbmV4dCByZXRyeSBpbnRlcnZhbC5cbiAgICogVGhlIG5leHQgcmV0cnkgaW50ZXJ2YWwgaXMgcHJldmlvdXMgaW50ZXJ2YWwgbXVsdGlwbGllZCBieSB0aGlzIGNvZWZmaWNpZW50LlxuICAgKiBAbWluaW11bSAxXG4gICAqIEBkZWZhdWx0IDJcbiAgICovXG4gIGJhY2tvZmZDb2VmZmljaWVudD86IG51bWJlcjtcbiAgLyoqXG4gICAqIEludGVydmFsIG9mIHRoZSBmaXJzdCByZXRyeS5cbiAgICogSWYgY29lZmZpY2llbnQgaXMgMSB0aGVuIGl0IGlzIHVzZWQgZm9yIGFsbCByZXRyaWVzXG4gICAqIEBmb3JtYXQgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBvciB7QGxpbmsgaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvbXMgfCBtcy1mb3JtYXR0ZWQgc3RyaW5nfVxuICAgKiBAZGVmYXVsdCAxIHNlY29uZFxuICAgKi9cbiAgaW5pdGlhbEludGVydmFsPzogRHVyYXRpb247XG4gIC8qKlxuICAgKiBNYXhpbXVtIG51bWJlciBvZiBhdHRlbXB0cy4gV2hlbiBleGNlZWRlZCwgcmV0cmllcyBzdG9wIChldmVuIGlmIHtAbGluayBBY3Rpdml0eU9wdGlvbnMuc2NoZWR1bGVUb0Nsb3NlVGltZW91dH1cbiAgICogaGFzbid0IGJlZW4gcmVhY2hlZCkuXG4gICAqXG4gICAqIEBkZWZhdWx0IEluZmluaXR5XG4gICAqL1xuICBtYXhpbXVtQXR0ZW1wdHM/OiBudW1iZXI7XG4gIC8qKlxuICAgKiBNYXhpbXVtIGludGVydmFsIGJldHdlZW4gcmV0cmllcy5cbiAgICogRXhwb25lbnRpYWwgYmFja29mZiBsZWFkcyB0byBpbnRlcnZhbCBpbmNyZWFzZS5cbiAgICogVGhpcyB2YWx1ZSBpcyB0aGUgY2FwIG9mIHRoZSBpbmNyZWFzZS5cbiAgICpcbiAgICogQGRlZmF1bHQgMTAweCBvZiB7QGxpbmsgaW5pdGlhbEludGVydmFsfVxuICAgKiBAZm9ybWF0IG51bWJlciBvZiBtaWxsaXNlY29uZHMgb3Ige0BsaW5rIGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL21zIHwgbXMtZm9ybWF0dGVkIHN0cmluZ31cbiAgICovXG4gIG1heGltdW1JbnRlcnZhbD86IER1cmF0aW9uO1xuXG4gIC8qKlxuICAgKiBMaXN0IG9mIGFwcGxpY2F0aW9uIGZhaWx1cmVzIHR5cGVzIHRvIG5vdCByZXRyeS5cbiAgICovXG4gIG5vblJldHJ5YWJsZUVycm9yVHlwZXM/OiBzdHJpbmdbXTtcbn1cblxuLyoqXG4gKiBUdXJuIGEgVFMgUmV0cnlQb2xpY3kgaW50byBhIHByb3RvIGNvbXBhdGlibGUgUmV0cnlQb2xpY3lcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbXBpbGVSZXRyeVBvbGljeShyZXRyeVBvbGljeTogUmV0cnlQb2xpY3kpOiB0ZW1wb3JhbC5hcGkuY29tbW9uLnYxLklSZXRyeVBvbGljeSB7XG4gIGlmIChyZXRyeVBvbGljeS5iYWNrb2ZmQ29lZmZpY2llbnQgIT0gbnVsbCAmJiByZXRyeVBvbGljeS5iYWNrb2ZmQ29lZmZpY2llbnQgPD0gMCkge1xuICAgIHRocm93IG5ldyBWYWx1ZUVycm9yKCdSZXRyeVBvbGljeS5iYWNrb2ZmQ29lZmZpY2llbnQgbXVzdCBiZSBncmVhdGVyIHRoYW4gMCcpO1xuICB9XG4gIGlmIChyZXRyeVBvbGljeS5tYXhpbXVtQXR0ZW1wdHMgIT0gbnVsbCkge1xuICAgIGlmIChyZXRyeVBvbGljeS5tYXhpbXVtQXR0ZW1wdHMgPT09IE51bWJlci5QT1NJVElWRV9JTkZJTklUWSkge1xuICAgICAgLy8gZHJvcCBmaWVsZCAoSW5maW5pdHkgaXMgdGhlIGRlZmF1bHQpXG4gICAgICBjb25zdCB7IG1heGltdW1BdHRlbXB0czogXywgLi4ud2l0aG91dCB9ID0gcmV0cnlQb2xpY3k7XG4gICAgICByZXRyeVBvbGljeSA9IHdpdGhvdXQ7XG4gICAgfSBlbHNlIGlmIChyZXRyeVBvbGljeS5tYXhpbXVtQXR0ZW1wdHMgPD0gMCkge1xuICAgICAgdGhyb3cgbmV3IFZhbHVlRXJyb3IoJ1JldHJ5UG9saWN5Lm1heGltdW1BdHRlbXB0cyBtdXN0IGJlIGEgcG9zaXRpdmUgaW50ZWdlcicpO1xuICAgIH0gZWxzZSBpZiAoIU51bWJlci5pc0ludGVnZXIocmV0cnlQb2xpY3kubWF4aW11bUF0dGVtcHRzKSkge1xuICAgICAgdGhyb3cgbmV3IFZhbHVlRXJyb3IoJ1JldHJ5UG9saWN5Lm1heGltdW1BdHRlbXB0cyBtdXN0IGJlIGFuIGludGVnZXInKTtcbiAgICB9XG4gIH1cbiAgY29uc3QgbWF4aW11bUludGVydmFsID0gbXNPcHRpb25hbFRvTnVtYmVyKHJldHJ5UG9saWN5Lm1heGltdW1JbnRlcnZhbCk7XG4gIGNvbnN0IGluaXRpYWxJbnRlcnZhbCA9IG1zVG9OdW1iZXIocmV0cnlQb2xpY3kuaW5pdGlhbEludGVydmFsID8/IDEwMDApO1xuICBpZiAobWF4aW11bUludGVydmFsID09PSAwKSB7XG4gICAgdGhyb3cgbmV3IFZhbHVlRXJyb3IoJ1JldHJ5UG9saWN5Lm1heGltdW1JbnRlcnZhbCBjYW5ub3QgYmUgMCcpO1xuICB9XG4gIGlmIChpbml0aWFsSW50ZXJ2YWwgPT09IDApIHtcbiAgICB0aHJvdyBuZXcgVmFsdWVFcnJvcignUmV0cnlQb2xpY3kuaW5pdGlhbEludGVydmFsIGNhbm5vdCBiZSAwJyk7XG4gIH1cbiAgaWYgKG1heGltdW1JbnRlcnZhbCAhPSBudWxsICYmIG1heGltdW1JbnRlcnZhbCA8IGluaXRpYWxJbnRlcnZhbCkge1xuICAgIHRocm93IG5ldyBWYWx1ZUVycm9yKCdSZXRyeVBvbGljeS5tYXhpbXVtSW50ZXJ2YWwgY2Fubm90IGJlIGxlc3MgdGhhbiBpdHMgaW5pdGlhbEludGVydmFsJyk7XG4gIH1cbiAgcmV0dXJuIHtcbiAgICBtYXhpbXVtQXR0ZW1wdHM6IHJldHJ5UG9saWN5Lm1heGltdW1BdHRlbXB0cyxcbiAgICBpbml0aWFsSW50ZXJ2YWw6IG1zVG9Ucyhpbml0aWFsSW50ZXJ2YWwpLFxuICAgIG1heGltdW1JbnRlcnZhbDogbXNPcHRpb25hbFRvVHMobWF4aW11bUludGVydmFsKSxcbiAgICBiYWNrb2ZmQ29lZmZpY2llbnQ6IHJldHJ5UG9saWN5LmJhY2tvZmZDb2VmZmljaWVudCxcbiAgICBub25SZXRyeWFibGVFcnJvclR5cGVzOiByZXRyeVBvbGljeS5ub25SZXRyeWFibGVFcnJvclR5cGVzLFxuICB9O1xufVxuXG4vKipcbiAqIFR1cm4gYSBwcm90byBjb21wYXRpYmxlIFJldHJ5UG9saWN5IGludG8gYSBUUyBSZXRyeVBvbGljeVxuICovXG5leHBvcnQgZnVuY3Rpb24gZGVjb21waWxlUmV0cnlQb2xpY3koXG4gIHJldHJ5UG9saWN5PzogdGVtcG9yYWwuYXBpLmNvbW1vbi52MS5JUmV0cnlQb2xpY3kgfCBudWxsXG4pOiBSZXRyeVBvbGljeSB8IHVuZGVmaW5lZCB7XG4gIGlmICghcmV0cnlQb2xpY3kpIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBiYWNrb2ZmQ29lZmZpY2llbnQ6IHJldHJ5UG9saWN5LmJhY2tvZmZDb2VmZmljaWVudCA/PyB1bmRlZmluZWQsXG4gICAgbWF4aW11bUF0dGVtcHRzOiByZXRyeVBvbGljeS5tYXhpbXVtQXR0ZW1wdHMgPz8gdW5kZWZpbmVkLFxuICAgIG1heGltdW1JbnRlcnZhbDogb3B0aW9uYWxUc1RvTXMocmV0cnlQb2xpY3kubWF4aW11bUludGVydmFsKSxcbiAgICBpbml0aWFsSW50ZXJ2YWw6IG9wdGlvbmFsVHNUb01zKHJldHJ5UG9saWN5LmluaXRpYWxJbnRlcnZhbCksXG4gICAgbm9uUmV0cnlhYmxlRXJyb3JUeXBlczogcmV0cnlQb2xpY3kubm9uUmV0cnlhYmxlRXJyb3JUeXBlcyA/PyB1bmRlZmluZWQsXG4gIH07XG59XG4iLCJpbXBvcnQgTG9uZyBmcm9tICdsb25nJzsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBpbXBvcnQvbm8tbmFtZWQtYXMtZGVmYXVsdFxuaW1wb3J0IG1zLCB7IFN0cmluZ1ZhbHVlIH0gZnJvbSAnbXMnO1xuaW1wb3J0IHR5cGUgeyBnb29nbGUgfSBmcm9tICdAdGVtcG9yYWxpby9wcm90byc7XG5pbXBvcnQgeyBWYWx1ZUVycm9yIH0gZnJvbSAnLi9lcnJvcnMnO1xuXG4vLyBOT1RFOiB0aGVzZSBhcmUgdGhlIHNhbWUgaW50ZXJmYWNlIGluIEpTXG4vLyBnb29nbGUucHJvdG9idWYuSUR1cmF0aW9uO1xuLy8gZ29vZ2xlLnByb3RvYnVmLklUaW1lc3RhbXA7XG4vLyBUaGUgY29udmVyc2lvbiBmdW5jdGlvbnMgYmVsb3cgc2hvdWxkIHdvcmsgZm9yIGJvdGhcblxuZXhwb3J0IHR5cGUgVGltZXN0YW1wID0gZ29vZ2xlLnByb3RvYnVmLklUaW1lc3RhbXA7XG5cbi8qKlxuICogQSBkdXJhdGlvbiwgZXhwcmVzc2VkIGVpdGhlciBhcyBhIG51bWJlciBvZiBtaWxsaXNlY29uZHMsIG9yIGFzIGEge0BsaW5rIGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL21zIHwgbXMtZm9ybWF0dGVkIHN0cmluZ30uXG4gKi9cbmV4cG9ydCB0eXBlIER1cmF0aW9uID0gU3RyaW5nVmFsdWUgfCBudW1iZXI7XG5cbmV4cG9ydCB0eXBlIHsgU3RyaW5nVmFsdWUgfSBmcm9tICdtcyc7XG5cbi8qKlxuICogTG9zc3kgY29udmVyc2lvbiBmdW5jdGlvbiBmcm9tIFRpbWVzdGFtcCB0byBudW1iZXIgZHVlIHRvIHBvc3NpYmxlIG92ZXJmbG93LlxuICogSWYgdHMgaXMgbnVsbCBvciB1bmRlZmluZWQgcmV0dXJucyB1bmRlZmluZWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBvcHRpb25hbFRzVG9Ncyh0czogVGltZXN0YW1wIHwgbnVsbCB8IHVuZGVmaW5lZCk6IG51bWJlciB8IHVuZGVmaW5lZCB7XG4gIGlmICh0cyA9PT0gdW5kZWZpbmVkIHx8IHRzID09PSBudWxsKSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuICByZXR1cm4gdHNUb01zKHRzKTtcbn1cblxuLyoqXG4gKiBMb3NzeSBjb252ZXJzaW9uIGZ1bmN0aW9uIGZyb20gVGltZXN0YW1wIHRvIG51bWJlciBkdWUgdG8gcG9zc2libGUgb3ZlcmZsb3cuXG4gKiBJZiB0cyBpcyBudWxsIG9yIHVuZGVmaW5lZCwgdGhyb3dzIGEgVHlwZUVycm9yLCB3aXRoIGVycm9yIG1lc3NhZ2UgaW5jbHVkaW5nIHRoZSBuYW1lIG9mIHRoZSBmaWVsZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlcXVpcmVkVHNUb01zKHRzOiBUaW1lc3RhbXAgfCBudWxsIHwgdW5kZWZpbmVkLCBmaWVsZE5hbWU6IHN0cmluZyk6IG51bWJlciB7XG4gIGlmICh0cyA9PT0gdW5kZWZpbmVkIHx8IHRzID09PSBudWxsKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgRXhwZWN0ZWQgJHtmaWVsZE5hbWV9IHRvIGJlIGEgdGltZXN0YW1wLCBnb3QgJHt0c31gKTtcbiAgfVxuICByZXR1cm4gdHNUb01zKHRzKTtcbn1cblxuLyoqXG4gKiBMb3NzeSBjb252ZXJzaW9uIGZ1bmN0aW9uIGZyb20gVGltZXN0YW1wIHRvIG51bWJlciBkdWUgdG8gcG9zc2libGUgb3ZlcmZsb3dcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRzVG9Ncyh0czogVGltZXN0YW1wIHwgbnVsbCB8IHVuZGVmaW5lZCk6IG51bWJlciB7XG4gIGlmICh0cyA9PT0gdW5kZWZpbmVkIHx8IHRzID09PSBudWxsKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBFeHBlY3RlZCB0aW1lc3RhbXAsIGdvdCAke3RzfWApO1xuICB9XG4gIGNvbnN0IHsgc2Vjb25kcywgbmFub3MgfSA9IHRzO1xuICByZXR1cm4gKHNlY29uZHMgfHwgTG9uZy5VWkVSTylcbiAgICAubXVsKDEwMDApXG4gICAgLmFkZChNYXRoLmZsb29yKChuYW5vcyB8fCAwKSAvIDEwMDAwMDApKVxuICAgIC50b051bWJlcigpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbXNOdW1iZXJUb1RzKG1pbGxpczogbnVtYmVyKTogVGltZXN0YW1wIHtcbiAgY29uc3Qgc2Vjb25kcyA9IE1hdGguZmxvb3IobWlsbGlzIC8gMTAwMCk7XG4gIGNvbnN0IG5hbm9zID0gKG1pbGxpcyAlIDEwMDApICogMTAwMDAwMDtcbiAgaWYgKE51bWJlci5pc05hTihzZWNvbmRzKSB8fCBOdW1iZXIuaXNOYU4obmFub3MpKSB7XG4gICAgdGhyb3cgbmV3IFZhbHVlRXJyb3IoYEludmFsaWQgbWlsbGlzICR7bWlsbGlzfWApO1xuICB9XG4gIHJldHVybiB7IHNlY29uZHM6IExvbmcuZnJvbU51bWJlcihzZWNvbmRzKSwgbmFub3MgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1zVG9UcyhzdHI6IER1cmF0aW9uKTogVGltZXN0YW1wIHtcbiAgcmV0dXJuIG1zTnVtYmVyVG9Ucyhtc1RvTnVtYmVyKHN0cikpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbXNPcHRpb25hbFRvVHMoc3RyOiBEdXJhdGlvbiB8IHVuZGVmaW5lZCB8IG51bGwpOiBUaW1lc3RhbXAgfCB1bmRlZmluZWQge1xuICByZXR1cm4gc3RyID8gbXNUb1RzKHN0cikgOiB1bmRlZmluZWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtc09wdGlvbmFsVG9OdW1iZXIodmFsOiBEdXJhdGlvbiB8IHVuZGVmaW5lZCk6IG51bWJlciB8IHVuZGVmaW5lZCB7XG4gIGlmICh2YWwgPT09IHVuZGVmaW5lZCkgcmV0dXJuIHVuZGVmaW5lZDtcbiAgcmV0dXJuIG1zVG9OdW1iZXIodmFsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1zVG9OdW1iZXIodmFsOiBEdXJhdGlvbik6IG51bWJlciB7XG4gIGlmICh0eXBlb2YgdmFsID09PSAnbnVtYmVyJykge1xuICAgIHJldHVybiB2YWw7XG4gIH1cbiAgcmV0dXJuIG1zV2l0aFZhbGlkYXRpb24odmFsKTtcbn1cblxuZnVuY3Rpb24gbXNXaXRoVmFsaWRhdGlvbihzdHI6IFN0cmluZ1ZhbHVlKTogbnVtYmVyIHtcbiAgY29uc3QgbWlsbGlzID0gbXMoc3RyKTtcbiAgaWYgKG1pbGxpcyA9PSBudWxsIHx8IGlzTmFOKG1pbGxpcykpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBJbnZhbGlkIGR1cmF0aW9uIHN0cmluZzogJyR7c3RyfSdgKTtcbiAgfVxuICByZXR1cm4gbWlsbGlzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdHNUb0RhdGUodHM6IFRpbWVzdGFtcCk6IERhdGUge1xuICByZXR1cm4gbmV3IERhdGUodHNUb01zKHRzKSk7XG59XG5cbi8vIHRzLXBydW5lLWlnbm9yZS1uZXh0XG5leHBvcnQgZnVuY3Rpb24gcmVxdWlyZWRUc1RvRGF0ZSh0czogVGltZXN0YW1wIHwgbnVsbCB8IHVuZGVmaW5lZCwgZmllbGROYW1lOiBzdHJpbmcpOiBEYXRlIHtcbiAgcmV0dXJuIG5ldyBEYXRlKHJlcXVpcmVkVHNUb01zKHRzLCBmaWVsZE5hbWUpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9wdGlvbmFsVHNUb0RhdGUodHM6IFRpbWVzdGFtcCB8IG51bGwgfCB1bmRlZmluZWQpOiBEYXRlIHwgdW5kZWZpbmVkIHtcbiAgaWYgKHRzID09PSB1bmRlZmluZWQgfHwgdHMgPT09IG51bGwpIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG4gIHJldHVybiBuZXcgRGF0ZSh0c1RvTXModHMpKTtcbn1cblxuLy8gdHMtcHJ1bmUtaWdub3JlLW5leHQgKGltcG9ydGVkIHZpYSBzY2hlZHVsZS1oZWxwZXJzLnRzKVxuZXhwb3J0IGZ1bmN0aW9uIG9wdGlvbmFsRGF0ZVRvVHMoZGF0ZTogRGF0ZSB8IG51bGwgfCB1bmRlZmluZWQpOiBUaW1lc3RhbXAgfCB1bmRlZmluZWQge1xuICBpZiAoZGF0ZSA9PT0gdW5kZWZpbmVkIHx8IGRhdGUgPT09IG51bGwpIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG4gIHJldHVybiBtc1RvVHMoZGF0ZS5nZXRUaW1lKCkpO1xufVxuIiwiLyoqIFNob3J0aGFuZCBhbGlhcyAqL1xuZXhwb3J0IHR5cGUgQW55RnVuYyA9ICguLi5hcmdzOiBhbnlbXSkgPT4gYW55O1xuLyoqIEEgdHVwbGUgd2l0aG91dCBpdHMgbGFzdCBlbGVtZW50ICovXG5leHBvcnQgdHlwZSBPbWl0TGFzdDxUPiA9IFQgZXh0ZW5kcyBbLi4uaW5mZXIgUkVTVCwgYW55XSA/IFJFU1QgOiBuZXZlcjtcbi8qKiBGIHdpdGggYWxsIGFyZ3VtZW50cyBidXQgdGhlIGxhc3QgKi9cbmV4cG9ydCB0eXBlIE9taXRMYXN0UGFyYW08RiBleHRlbmRzIEFueUZ1bmM+ID0gKC4uLmFyZ3M6IE9taXRMYXN0PFBhcmFtZXRlcnM8Rj4+KSA9PiBSZXR1cm5UeXBlPEY+O1xuLyoqIFJlcXVpcmUgdGhhdCBUIGhhcyBhdCBsZWFzdCBvbmUgb2YgdGhlIHByb3ZpZGVkIHByb3BlcnRpZXMgZGVmaW5lZCAqL1xuZXhwb3J0IHR5cGUgUmVxdWlyZUF0TGVhc3RPbmU8VCwgS2V5cyBleHRlbmRzIGtleW9mIFQgPSBrZXlvZiBUPiA9IFBpY2s8VCwgRXhjbHVkZTxrZXlvZiBULCBLZXlzPj4gJlxuICB7XG4gICAgW0sgaW4gS2V5c10tPzogUmVxdWlyZWQ8UGljazxULCBLPj4gJiBQYXJ0aWFsPFBpY2s8VCwgRXhjbHVkZTxLZXlzLCBLPj4+O1xuICB9W0tleXNdO1xuXG4vKiogVmVyaWZ5IHRoYXQgYW4gdHlwZSBfQ29weSBleHRlbmRzIF9PcmlnICovXG5leHBvcnQgZnVuY3Rpb24gY2hlY2tFeHRlbmRzPF9PcmlnLCBfQ29weSBleHRlbmRzIF9PcmlnPigpOiB2b2lkIHtcbiAgLy8gbm9vcCwganVzdCB0eXBlIGNoZWNrXG59XG5cbmV4cG9ydCB0eXBlIFJlcGxhY2U8QmFzZSwgTmV3PiA9IE9taXQ8QmFzZSwga2V5b2YgTmV3PiAmIE5ldztcblxuZXhwb3J0IGZ1bmN0aW9uIGlzUmVjb3JkKHZhbHVlOiB1bmtub3duKTogdmFsdWUgaXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4ge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAhPT0gbnVsbDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhhc093blByb3BlcnR5PFggZXh0ZW5kcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiwgWSBleHRlbmRzIFByb3BlcnR5S2V5PihcbiAgcmVjb3JkOiBYLFxuICBwcm9wOiBZXG4pOiByZWNvcmQgaXMgWCAmIFJlY29yZDxZLCB1bmtub3duPiB7XG4gIHJldHVybiBwcm9wIGluIHJlY29yZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhhc093blByb3BlcnRpZXM8WCBleHRlbmRzIFJlY29yZDxzdHJpbmcsIHVua25vd24+LCBZIGV4dGVuZHMgUHJvcGVydHlLZXk+KFxuICByZWNvcmQ6IFgsXG4gIHByb3BzOiBZW11cbik6IHJlY29yZCBpcyBYICYgUmVjb3JkPFksIHVua25vd24+IHtcbiAgcmV0dXJuIHByb3BzLmV2ZXJ5KChwcm9wKSA9PiBwcm9wIGluIHJlY29yZCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0Vycm9yKGVycm9yOiB1bmtub3duKTogZXJyb3IgaXMgRXJyb3Ige1xuICByZXR1cm4gKFxuICAgIGlzUmVjb3JkKGVycm9yKSAmJlxuICAgIHR5cGVvZiBlcnJvci5uYW1lID09PSAnc3RyaW5nJyAmJlxuICAgIHR5cGVvZiBlcnJvci5tZXNzYWdlID09PSAnc3RyaW5nJyAmJlxuICAgIChlcnJvci5zdGFjayA9PSBudWxsIHx8IHR5cGVvZiBlcnJvci5zdGFjayA9PT0gJ3N0cmluZycpXG4gICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0Fib3J0RXJyb3IoZXJyb3I6IHVua25vd24pOiBlcnJvciBpcyBFcnJvciAmIHsgbmFtZTogJ0Fib3J0RXJyb3InIH0ge1xuICByZXR1cm4gaXNFcnJvcihlcnJvcikgJiYgZXJyb3IubmFtZSA9PT0gJ0Fib3J0RXJyb3InO1xufVxuXG4vKipcbiAqIEdldCBgZXJyb3IubWVzc2FnZWAgKG9yIGB1bmRlZmluZWRgIGlmIG5vdCBwcmVzZW50KVxuICovXG5leHBvcnQgZnVuY3Rpb24gZXJyb3JNZXNzYWdlKGVycm9yOiB1bmtub3duKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgaWYgKGlzRXJyb3IoZXJyb3IpKSB7XG4gICAgcmV0dXJuIGVycm9yLm1lc3NhZ2U7XG4gIH0gZWxzZSBpZiAodHlwZW9mIGVycm9yID09PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBlcnJvcjtcbiAgfVxuICByZXR1cm4gdW5kZWZpbmVkO1xufVxuXG5pbnRlcmZhY2UgRXJyb3JXaXRoQ29kZSB7XG4gIGNvZGU6IHN0cmluZztcbn1cblxuZnVuY3Rpb24gaXNFcnJvcldpdGhDb2RlKGVycm9yOiB1bmtub3duKTogZXJyb3IgaXMgRXJyb3JXaXRoQ29kZSB7XG4gIHJldHVybiBpc1JlY29yZChlcnJvcikgJiYgdHlwZW9mIGVycm9yLmNvZGUgPT09ICdzdHJpbmcnO1xufVxuXG4vKipcbiAqIEdldCBgZXJyb3IuY29kZWAgKG9yIGB1bmRlZmluZWRgIGlmIG5vdCBwcmVzZW50KVxuICovXG5leHBvcnQgZnVuY3Rpb24gZXJyb3JDb2RlKGVycm9yOiB1bmtub3duKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgaWYgKGlzRXJyb3JXaXRoQ29kZShlcnJvcikpIHtcbiAgICByZXR1cm4gZXJyb3IuY29kZTtcbiAgfVxuXG4gIHJldHVybiB1bmRlZmluZWQ7XG59XG5cbi8qKlxuICogQXNzZXJ0cyB0aGF0IHNvbWUgdHlwZSBpcyB0aGUgbmV2ZXIgdHlwZVxuICovXG5leHBvcnQgZnVuY3Rpb24gYXNzZXJ0TmV2ZXIobXNnOiBzdHJpbmcsIHg6IG5ldmVyKTogbmV2ZXIge1xuICB0aHJvdyBuZXcgVHlwZUVycm9yKG1zZyArICc6ICcgKyB4KTtcbn1cblxuZXhwb3J0IHR5cGUgQ2xhc3M8RSBleHRlbmRzIEVycm9yPiA9IHtcbiAgbmV3ICguLi5hcmdzOiBhbnlbXSk6IEU7XG4gIHByb3RvdHlwZTogRTtcbn07XG5cbi8qKlxuICogQSBkZWNvcmF0b3IgdG8gYmUgdXNlZCBvbiBlcnJvciBjbGFzc2VzLiBJdCBhZGRzIHRoZSAnbmFtZScgcHJvcGVydHkgQU5EIHByb3ZpZGVzIGEgY3VzdG9tXG4gKiAnaW5zdGFuY2VvZicgaGFuZGxlciB0aGF0IHdvcmtzIGNvcnJlY3RseSBhY3Jvc3MgZXhlY3V0aW9uIGNvbnRleHRzLlxuICpcbiAqICMjIyBEZXRhaWxzICMjI1xuICpcbiAqIEFjY29yZGluZyB0byB0aGUgRWNtYVNjcmlwdCdzIHNwZWMsIHRoZSBkZWZhdWx0IGJlaGF2aW9yIG9mIEphdmFTY3JpcHQncyBgeCBpbnN0YW5jZW9mIFlgIG9wZXJhdG9yIGlzIHRvIHdhbGsgdXAgdGhlXG4gKiBwcm90b3R5cGUgY2hhaW4gb2Ygb2JqZWN0ICd4JywgY2hlY2tpbmcgaWYgYW55IGNvbnN0cnVjdG9yIGluIHRoYXQgaGllcmFyY2h5IGlzIF9leGFjdGx5IHRoZSBzYW1lIG9iamVjdF8gYXMgdGhlXG4gKiBjb25zdHJ1Y3RvciBmdW5jdGlvbiAnWScuXG4gKlxuICogVW5mb3J0dW5hdGVseSwgaXQgaGFwcGVucyBpbiB2YXJpb3VzIHNpdHVhdGlvbnMgdGhhdCBkaWZmZXJlbnQgY29uc3RydWN0b3IgZnVuY3Rpb24gb2JqZWN0cyBnZXQgY3JlYXRlZCBmb3Igd2hhdFxuICogYXBwZWFycyB0byBiZSB0aGUgdmVyeSBzYW1lIGNsYXNzLiBUaGlzIGxlYWRzIHRvIHN1cnByaXNpbmcgYmVoYXZpb3Igd2hlcmUgYGluc3RhbmNlb2ZgIHJldHVybnMgZmFsc2UgdGhvdWdoIGl0IGlzXG4gKiBrbm93biB0aGF0IHRoZSBvYmplY3QgaXMgaW5kZWVkIGFuIGluc3RhbmNlIG9mIHRoYXQgY2xhc3MuIE9uZSBwYXJ0aWN1bGFyIGNhc2Ugd2hlcmUgdGhpcyBoYXBwZW5zIGlzIHdoZW4gY29uc3RydWN0b3JcbiAqICdZJyBiZWxvbmdzIHRvIGEgZGlmZmVyZW50IHJlYWxtIHRoYW4gdGhlIGNvbnN0dWN0b3Igd2l0aCB3aGljaCAneCcgd2FzIGluc3RhbnRpYXRlZC4gQW5vdGhlciBjYXNlIGlzIHdoZW4gdHdvIGNvcGllc1xuICogb2YgdGhlIHNhbWUgbGlicmFyeSBnZXRzIGxvYWRlZCBpbiB0aGUgc2FtZSByZWFsbS5cbiAqXG4gKiBJbiBwcmFjdGljZSwgdGhpcyB0ZW5kcyB0byBjYXVzZSBpc3N1ZXMgd2hlbiBjcm9zc2luZyB0aGUgd29ya2Zsb3ctc2FuZGJveGluZyBib3VuZGFyeSAoc2luY2UgTm9kZSdzIHZtIG1vZHVsZVxuICogcmVhbGx5IGNyZWF0ZXMgbmV3IGV4ZWN1dGlvbiByZWFsbXMpLCBhcyB3ZWxsIGFzIHdoZW4gcnVubmluZyB0ZXN0cyB1c2luZyBKZXN0IChzZWUgaHR0cHM6Ly9naXRodWIuY29tL2plc3Rqcy9qZXN0L2lzc3Vlcy8yNTQ5XG4gKiBmb3Igc29tZSBkZXRhaWxzIG9uIHRoYXQgb25lKS5cbiAqXG4gKiBUaGlzIGZ1bmN0aW9uIGluamVjdHMgYSBjdXN0b20gJ2luc3RhbmNlb2YnIGhhbmRsZXIgaW50byB0aGUgcHJvdG90eXBlIG9mICdjbGF6eicsIHdoaWNoIGlzIGJvdGggY3Jvc3MtcmVhbG0gc2FmZSBhbmRcbiAqIGNyb3NzLWNvcGllcy1vZi10aGUtc2FtZS1saWIgc2FmZS4gSXQgd29ya3MgYnkgYWRkaW5nIGEgc3BlY2lhbCBzeW1ib2wgcHJvcGVydHkgdG8gdGhlIHByb3RvdHlwZSBvZiAnY2xhenonLCBhbmQgdGhlblxuICogY2hlY2tpbmcgZm9yIHRoZSBwcmVzZW5jZSBvZiB0aGF0IHN5bWJvbC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFN5bWJvbEJhc2VkSW5zdGFuY2VPZkVycm9yPEUgZXh0ZW5kcyBFcnJvcj4obWFya2VyTmFtZTogc3RyaW5nKTogKGNsYXp6OiBDbGFzczxFPikgPT4gdm9pZCB7XG4gIHJldHVybiAoY2xheno6IENsYXNzPEU+KTogdm9pZCA9PiB7XG4gICAgY29uc3QgbWFya2VyID0gU3ltYm9sLmZvcihgX190ZW1wb3JhbF9pcyR7bWFya2VyTmFtZX1gKTtcblxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShjbGF6ei5wcm90b3R5cGUsICduYW1lJywgeyB2YWx1ZTogbWFya2VyTmFtZSwgZW51bWVyYWJsZTogdHJ1ZSB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoY2xhenoucHJvdG90eXBlLCBtYXJrZXIsIHsgdmFsdWU6IHRydWUsIGVudW1lcmFibGU6IGZhbHNlIH0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShjbGF6eiwgU3ltYm9sLmhhc0luc3RhbmNlLCB7XG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgb2JqZWN0LXNob3J0aGFuZFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uICh0aGlzOiBhbnksIGVycm9yOiBvYmplY3QpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKHRoaXMgPT09IGNsYXp6KSB7XG4gICAgICAgICAgcmV0dXJuIGlzUmVjb3JkKGVycm9yKSAmJiAoZXJyb3IgYXMgYW55KVttYXJrZXJdID09PSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vICd0aGlzJyBtdXN0IGJlIGEgX3N1YmNsYXNzXyBvZiBjbGF6eiB0aGF0IGRvZXNuJ3QgcmVkZWZpbmVkIFtTeW1ib2wuaGFzSW5zdGFuY2VdLCBzbyB0aGF0IGl0IGluaGVyaXRlZFxuICAgICAgICAgIC8vIGZyb20gY2xhenoncyBbU3ltYm9sLmhhc0luc3RhbmNlXS4gSWYgd2UgZG9uJ3QgaGFuZGxlIHRoaXMgcGFydGljdWxhciBzaXR1YXRpb24sIHRoZW5cbiAgICAgICAgICAvLyBgeCBpbnN0YW5jZW9mIFN1YmNsYXNzT2ZQYXJlbnRgIHdvdWxkIHJldHVybiB0cnVlIGZvciBhbnkgaW5zdGFuY2Ugb2YgJ1BhcmVudCcsIHdoaWNoIGlzIGNsZWFybHkgd3JvbmcuXG4gICAgICAgICAgLy9cbiAgICAgICAgICAvLyBJZGVhbGx5LCBpdCdkIGJlIHByZWZlcmFibGUgdG8gYXZvaWQgdGhpcyBjYXNlIGVudGlyZWx5LCBieSBtYWtpbmcgc3VyZSB0aGF0IGFsbCBzdWJjbGFzc2VzIG9mICdjbGF6eidcbiAgICAgICAgICAvLyByZWRlZmluZSBbU3ltYm9sLmhhc0luc3RhbmNlXSwgYnV0IHdlIGNhbid0IGVuZm9yY2UgdGhhdC4gV2UgdGhlcmVmb3JlIGZhbGxiYWNrIHRvIHRoZSBkZWZhdWx0IGluc3RhbmNlb2ZcbiAgICAgICAgICAvLyBiZWhhdmlvciAod2hpY2ggaXMgTk9UIGNyb3NzLXJlYWxtIHNhZmUpLlxuICAgICAgICAgIHJldHVybiB0aGlzLnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGVycm9yKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1wcm90b3R5cGUtYnVpbHRpbnNcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICB9KTtcbiAgfTtcbn1cblxuLy8gVGhhbmtzIE1ETjogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvT2JqZWN0L2ZyZWV6ZVxuZXhwb3J0IGZ1bmN0aW9uIGRlZXBGcmVlemU8VD4ob2JqZWN0OiBUKTogVCB7XG4gIC8vIFJldHJpZXZlIHRoZSBwcm9wZXJ0eSBuYW1lcyBkZWZpbmVkIG9uIG9iamVjdFxuICBjb25zdCBwcm9wTmFtZXMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhvYmplY3QpO1xuXG4gIC8vIEZyZWV6ZSBwcm9wZXJ0aWVzIGJlZm9yZSBmcmVlemluZyBzZWxmXG4gIGZvciAoY29uc3QgbmFtZSBvZiBwcm9wTmFtZXMpIHtcbiAgICBjb25zdCB2YWx1ZSA9IChvYmplY3QgYXMgYW55KVtuYW1lXTtcblxuICAgIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XG4gICAgICB0cnkge1xuICAgICAgICBkZWVwRnJlZXplKHZhbHVlKTtcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAvLyBUaGlzIGlzIG9rYXksIHRoZXJlIGFyZSBzb21lIHR5cGVkIGFycmF5cyB0aGF0IGNhbm5vdCBiZSBmcm96ZW4gKGVuY29kaW5nS2V5cylcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgT2JqZWN0LmZyZWV6ZSh2YWx1ZSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIE9iamVjdC5mcmVlemUob2JqZWN0KTtcbn1cbiIsImltcG9ydCB0eXBlIHsgY29yZXNkayB9IGZyb20gJ0B0ZW1wb3JhbGlvL3Byb3RvJztcbmltcG9ydCB0eXBlIHsgVmVyc2lvbmluZ0ludGVudCBhcyBWZXJzaW9uaW5nSW50ZW50U3RyaW5nIH0gZnJvbSAnLi92ZXJzaW9uaW5nLWludGVudCc7XG5pbXBvcnQgeyBhc3NlcnROZXZlciwgY2hlY2tFeHRlbmRzIH0gZnJvbSAnLi90eXBlLWhlbHBlcnMnO1xuXG4vLyBBdm9pZCBpbXBvcnRpbmcgdGhlIHByb3RvIGltcGxlbWVudGF0aW9uIHRvIHJlZHVjZSB3b3JrZmxvdyBidW5kbGUgc2l6ZVxuLy8gQ29waWVkIGZyb20gY29yZXNkay5jb21tb24uVmVyc2lvbmluZ0ludGVudFxuLyoqXG4gKiBQcm90b2J1ZiBlbnVtIHJlcHJlc2VudGF0aW9uIG9mIHtAbGluayBWZXJzaW9uaW5nSW50ZW50U3RyaW5nfS5cbiAqXG4gKiBAZXhwZXJpbWVudGFsXG4gKi9cbmV4cG9ydCBlbnVtIFZlcnNpb25pbmdJbnRlbnQge1xuICBVTlNQRUNJRklFRCA9IDAsXG4gIENPTVBBVElCTEUgPSAxLFxuICBERUZBVUxUID0gMixcbn1cblxuY2hlY2tFeHRlbmRzPGNvcmVzZGsuY29tbW9uLlZlcnNpb25pbmdJbnRlbnQsIFZlcnNpb25pbmdJbnRlbnQ+KCk7XG5jaGVja0V4dGVuZHM8VmVyc2lvbmluZ0ludGVudCwgY29yZXNkay5jb21tb24uVmVyc2lvbmluZ0ludGVudD4oKTtcblxuZXhwb3J0IGZ1bmN0aW9uIHZlcnNpb25pbmdJbnRlbnRUb1Byb3RvKGludGVudDogVmVyc2lvbmluZ0ludGVudFN0cmluZyB8IHVuZGVmaW5lZCk6IFZlcnNpb25pbmdJbnRlbnQge1xuICBzd2l0Y2ggKGludGVudCkge1xuICAgIGNhc2UgJ0RFRkFVTFQnOlxuICAgICAgcmV0dXJuIFZlcnNpb25pbmdJbnRlbnQuREVGQVVMVDtcbiAgICBjYXNlICdDT01QQVRJQkxFJzpcbiAgICAgIHJldHVybiBWZXJzaW9uaW5nSW50ZW50LkNPTVBBVElCTEU7XG4gICAgY2FzZSB1bmRlZmluZWQ6XG4gICAgICByZXR1cm4gVmVyc2lvbmluZ0ludGVudC5VTlNQRUNJRklFRDtcbiAgICBkZWZhdWx0OlxuICAgICAgYXNzZXJ0TmV2ZXIoJ1VuZXhwZWN0ZWQgVmVyc2lvbmluZ0ludGVudCcsIGludGVudCk7XG4gIH1cbn1cbiIsIi8qKlxuICogSW5kaWNhdGVzIHdoZXRoZXIgdGhlIHVzZXIgaW50ZW5kcyBjZXJ0YWluIGNvbW1hbmRzIHRvIGJlIHJ1biBvbiBhIGNvbXBhdGlibGUgd29ya2VyIEJ1aWxkIElkIHZlcnNpb24gb3Igbm90LlxuICpcbiAqIGBDT01QQVRJQkxFYCBpbmRpY2F0ZXMgdGhhdCB0aGUgY29tbWFuZCBzaG91bGQgcnVuIG9uIGEgd29ya2VyIHdpdGggY29tcGF0aWJsZSB2ZXJzaW9uIGlmIHBvc3NpYmxlLiBJdCBtYXkgbm90IGJlXG4gKiBwb3NzaWJsZSBpZiB0aGUgdGFyZ2V0IHRhc2sgcXVldWUgZG9lcyBub3QgYWxzbyBoYXZlIGtub3dsZWRnZSBvZiB0aGUgY3VycmVudCB3b3JrZXIncyBCdWlsZCBJZC5cbiAqXG4gKiBgREVGQVVMVGAgaW5kaWNhdGVzIHRoYXQgdGhlIGNvbW1hbmQgc2hvdWxkIHJ1biBvbiB0aGUgdGFyZ2V0IHRhc2sgcXVldWUncyBjdXJyZW50IG92ZXJhbGwtZGVmYXVsdCBCdWlsZCBJZC5cbiAqXG4gKiBXaGVyZSB0aGlzIHR5cGUgaXMgYWNjZXB0ZWQgb3B0aW9uYWxseSwgYW4gdW5zZXQgdmFsdWUgaW5kaWNhdGVzIHRoYXQgdGhlIFNESyBzaG91bGQgY2hvb3NlIHRoZSBtb3N0IHNlbnNpYmxlIGRlZmF1bHRcbiAqIGJlaGF2aW9yIGZvciB0aGUgdHlwZSBvZiBjb21tYW5kLCBhY2NvdW50aW5nIGZvciB3aGV0aGVyIHRoZSBjb21tYW5kIHdpbGwgYmUgcnVuIG9uIHRoZSBzYW1lIHRhc2sgcXVldWUgYXMgdGhlXG4gKiBjdXJyZW50IHdvcmtlci4gVGhlIGRlZmF1bHQgYmVoYXZpb3IgZm9yIHN0YXJ0aW5nIFdvcmtmbG93cyBpcyBgREVGQVVMVGAuIFRoZSBkZWZhdWx0IGJlaGF2aW9yIGZvciBXb3JrZmxvd3Mgc3RhcnRpbmdcbiAqIEFjdGl2aXRpZXMsIHN0YXJ0aW5nIENoaWxkIFdvcmtmbG93cywgb3IgQ29udGludWluZyBBcyBOZXcgaXMgYENPTVBBVElCTEVgLlxuICpcbiAqIEBleHBlcmltZW50YWxcbiAqL1xuZXhwb3J0IHR5cGUgVmVyc2lvbmluZ0ludGVudCA9ICdDT01QQVRJQkxFJyB8ICdERUZBVUxUJztcbiIsImltcG9ydCB7IFdvcmtmbG93LCBXb3JrZmxvd1Jlc3VsdFR5cGUsIFNpZ25hbERlZmluaXRpb24gfSBmcm9tICcuL2ludGVyZmFjZXMnO1xuXG4vKipcbiAqIEJhc2UgV29ya2Zsb3dIYW5kbGUgaW50ZXJmYWNlLCBleHRlbmRlZCBpbiB3b3JrZmxvdyBhbmQgY2xpZW50IGxpYnMuXG4gKlxuICogVHJhbnNmb3JtcyBhIHdvcmtmbG93IGludGVyZmFjZSBgVGAgaW50byBhIGNsaWVudCBpbnRlcmZhY2UuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQmFzZVdvcmtmbG93SGFuZGxlPFQgZXh0ZW5kcyBXb3JrZmxvdz4ge1xuICAvKipcbiAgICogUHJvbWlzZSB0aGF0IHJlc29sdmVzIHdoZW4gV29ya2Zsb3cgZXhlY3V0aW9uIGNvbXBsZXRlc1xuICAgKi9cbiAgcmVzdWx0KCk6IFByb21pc2U8V29ya2Zsb3dSZXN1bHRUeXBlPFQ+PjtcblxuICAvKipcbiAgICogU2lnbmFsIGEgcnVubmluZyBXb3JrZmxvdy5cbiAgICpcbiAgICogQHBhcmFtIGRlZiBhIHNpZ25hbCBkZWZpbml0aW9uIGFzIHJldHVybmVkIGZyb20ge0BsaW5rIGRlZmluZVNpZ25hbH1cbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogYGBgdHNcbiAgICogYXdhaXQgaGFuZGxlLnNpZ25hbChpbmNyZW1lbnRTaWduYWwsIDMpO1xuICAgKiBgYGBcbiAgICovXG4gIHNpZ25hbDxBcmdzIGV4dGVuZHMgYW55W10gPSBbXSwgTmFtZSBleHRlbmRzIHN0cmluZyA9IHN0cmluZz4oXG4gICAgZGVmOiBTaWduYWxEZWZpbml0aW9uPEFyZ3MsIE5hbWU+IHwgc3RyaW5nLFxuICAgIC4uLmFyZ3M6IEFyZ3NcbiAgKTogUHJvbWlzZTx2b2lkPjtcblxuICAvKipcbiAgICogVGhlIHdvcmtmbG93SWQgb2YgdGhlIGN1cnJlbnQgV29ya2Zsb3dcbiAgICovXG4gIHJlYWRvbmx5IHdvcmtmbG93SWQ6IHN0cmluZztcbn1cbiIsImltcG9ydCB0eXBlIHsgdGVtcG9yYWwgfSBmcm9tICdAdGVtcG9yYWxpby9wcm90byc7XG5pbXBvcnQgeyBTZWFyY2hBdHRyaWJ1dGVzLCBXb3JrZmxvdyB9IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5pbXBvcnQgeyBSZXRyeVBvbGljeSB9IGZyb20gJy4vcmV0cnktcG9saWN5JztcbmltcG9ydCB7IER1cmF0aW9uIH0gZnJvbSAnLi90aW1lJztcbmltcG9ydCB7IGNoZWNrRXh0ZW5kcyB9IGZyb20gJy4vdHlwZS1oZWxwZXJzJztcblxuLy8gQXZvaWQgaW1wb3J0aW5nIHRoZSBwcm90byBpbXBsZW1lbnRhdGlvbiB0byByZWR1Y2Ugd29ya2Zsb3cgYnVuZGxlIHNpemVcbi8vIENvcGllZCBmcm9tIHRlbXBvcmFsLmFwaS5lbnVtcy52MS5Xb3JrZmxvd0lkUmV1c2VQb2xpY3lcbi8qKlxuICogQ29uY2VwdDoge0BsaW5rIGh0dHBzOi8vZG9jcy50ZW1wb3JhbC5pby9jb25jZXB0cy93aGF0LWlzLWEtd29ya2Zsb3ctaWQtcmV1c2UtcG9saWN5LyB8IFdvcmtmbG93IElkIFJldXNlIFBvbGljeX1cbiAqXG4gKiBXaGV0aGVyIGEgV29ya2Zsb3cgY2FuIGJlIHN0YXJ0ZWQgd2l0aCBhIFdvcmtmbG93IElkIG9mIGEgQ2xvc2VkIFdvcmtmbG93LlxuICpcbiAqICpOb3RlOiBBIFdvcmtmbG93IGNhbiBuZXZlciBiZSBzdGFydGVkIHdpdGggYSBXb3JrZmxvdyBJZCBvZiBhIFJ1bm5pbmcgV29ya2Zsb3cuKlxuICovXG5leHBvcnQgZW51bSBXb3JrZmxvd0lkUmV1c2VQb2xpY3kge1xuICAvKipcbiAgICogTm8gbmVlZCB0byB1c2UgdGhpcy5cbiAgICpcbiAgICogKElmIGEgYFdvcmtmbG93SWRSZXVzZVBvbGljeWAgaXMgc2V0IHRvIHRoaXMsIG9yIGlzIG5vdCBzZXQgYXQgYWxsLCB0aGUgZGVmYXVsdCB2YWx1ZSB3aWxsIGJlIHVzZWQuKVxuICAgKi9cbiAgV09SS0ZMT1dfSURfUkVVU0VfUE9MSUNZX1VOU1BFQ0lGSUVEID0gMCxcblxuICAvKipcbiAgICogVGhlIFdvcmtmbG93IGNhbiBiZSBzdGFydGVkIGlmIHRoZSBwcmV2aW91cyBXb3JrZmxvdyBpcyBpbiBhIENsb3NlZCBzdGF0ZS5cbiAgICogQGRlZmF1bHRcbiAgICovXG4gIFdPUktGTE9XX0lEX1JFVVNFX1BPTElDWV9BTExPV19EVVBMSUNBVEUgPSAxLFxuXG4gIC8qKlxuICAgKiBUaGUgV29ya2Zsb3cgY2FuIGJlIHN0YXJ0ZWQgaWYgdGhlIHByZXZpb3VzIFdvcmtmbG93IGlzIGluIGEgQ2xvc2VkIHN0YXRlIHRoYXQgaXMgbm90IENvbXBsZXRlZC5cbiAgICovXG4gIFdPUktGTE9XX0lEX1JFVVNFX1BPTElDWV9BTExPV19EVVBMSUNBVEVfRkFJTEVEX09OTFkgPSAyLFxuXG4gIC8qKlxuICAgKiBUaGUgV29ya2Zsb3cgY2Fubm90IGJlIHN0YXJ0ZWQuXG4gICAqL1xuICBXT1JLRkxPV19JRF9SRVVTRV9QT0xJQ1lfUkVKRUNUX0RVUExJQ0FURSA9IDMsXG5cbiAgLyoqXG4gICAqIFRlcm1pbmF0ZSB0aGUgY3VycmVudCB3b3JrZmxvdyBpZiBvbmUgaXMgYWxyZWFkeSBydW5uaW5nLlxuICAgKi9cbiAgV09SS0ZMT1dfSURfUkVVU0VfUE9MSUNZX1RFUk1JTkFURV9JRl9SVU5OSU5HID0gNCxcbn1cblxuY2hlY2tFeHRlbmRzPHRlbXBvcmFsLmFwaS5lbnVtcy52MS5Xb3JrZmxvd0lkUmV1c2VQb2xpY3ksIFdvcmtmbG93SWRSZXVzZVBvbGljeT4oKTtcbmNoZWNrRXh0ZW5kczxXb3JrZmxvd0lkUmV1c2VQb2xpY3ksIHRlbXBvcmFsLmFwaS5lbnVtcy52MS5Xb3JrZmxvd0lkUmV1c2VQb2xpY3k+KCk7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQmFzZVdvcmtmbG93T3B0aW9ucyB7XG4gIC8qKlxuICAgKiBXaGV0aGVyIGEgV29ya2Zsb3cgY2FuIGJlIHN0YXJ0ZWQgd2l0aCBhIFdvcmtmbG93IElkIG9mIGEgQ2xvc2VkIFdvcmtmbG93LlxuICAgKlxuICAgKiAqTm90ZTogQSBXb3JrZmxvdyBjYW4gbmV2ZXIgYmUgc3RhcnRlZCB3aXRoIGEgV29ya2Zsb3cgSWQgb2YgYSBSdW5uaW5nIFdvcmtmbG93LipcbiAgICpcbiAgICogQGRlZmF1bHQge0BsaW5rIFdvcmtmbG93SWRSZXVzZVBvbGljeS5XT1JLRkxPV19JRF9SRVVTRV9QT0xJQ1lfQUxMT1dfRFVQTElDQVRFfVxuICAgKi9cbiAgd29ya2Zsb3dJZFJldXNlUG9saWN5PzogV29ya2Zsb3dJZFJldXNlUG9saWN5O1xuXG4gIC8qKlxuICAgKiBDb250cm9scyBob3cgYSBXb3JrZmxvdyBFeGVjdXRpb24gaXMgcmV0cmllZC5cbiAgICpcbiAgICogQnkgZGVmYXVsdCwgV29ya2Zsb3cgRXhlY3V0aW9ucyBhcmUgbm90IHJldHJpZWQuIERvIG5vdCBvdmVycmlkZSB0aGlzIGJlaGF2aW9yIHVubGVzcyB5b3Uga25vdyB3aGF0IHlvdSdyZSBkb2luZy5cbiAgICoge0BsaW5rIGh0dHBzOi8vZG9jcy50ZW1wb3JhbC5pby9jb25jZXB0cy93aGF0LWlzLWEtcmV0cnktcG9saWN5LyB8IE1vcmUgaW5mb3JtYXRpb259LlxuICAgKi9cbiAgcmV0cnk/OiBSZXRyeVBvbGljeTtcblxuICAvKipcbiAgICogT3B0aW9uYWwgY3JvbiBzY2hlZHVsZSBmb3IgV29ya2Zsb3cuIElmIGEgY3JvbiBzY2hlZHVsZSBpcyBzcGVjaWZpZWQsIHRoZSBXb3JrZmxvdyB3aWxsIHJ1biBhcyBhIGNyb24gYmFzZWQgb24gdGhlXG4gICAqIHNjaGVkdWxlLiBUaGUgc2NoZWR1bGluZyB3aWxsIGJlIGJhc2VkIG9uIFVUQyB0aW1lLiBUaGUgc2NoZWR1bGUgZm9yIHRoZSBuZXh0IHJ1biBvbmx5IGhhcHBlbnMgYWZ0ZXIgdGhlIGN1cnJlbnRcbiAgICogcnVuIGlzIGNvbXBsZXRlZC9mYWlsZWQvdGltZW91dC4gSWYgYSBSZXRyeVBvbGljeSBpcyBhbHNvIHN1cHBsaWVkLCBhbmQgdGhlIFdvcmtmbG93IGZhaWxlZCBvciB0aW1lZCBvdXQsIHRoZVxuICAgKiBXb3JrZmxvdyB3aWxsIGJlIHJldHJpZWQgYmFzZWQgb24gdGhlIHJldHJ5IHBvbGljeS4gV2hpbGUgdGhlIFdvcmtmbG93IGlzIHJldHJ5aW5nLCBpdCB3b24ndCBzY2hlZHVsZSBpdHMgbmV4dCBydW4uXG4gICAqIElmIHRoZSBuZXh0IHNjaGVkdWxlIGlzIGR1ZSB3aGlsZSB0aGUgV29ya2Zsb3cgaXMgcnVubmluZyAob3IgcmV0cnlpbmcpLCB0aGVuIGl0IHdpbGwgc2tpcCB0aGF0IHNjaGVkdWxlLiBDcm9uXG4gICAqIFdvcmtmbG93IHdpbGwgbm90IHN0b3AgdW50aWwgaXQgaXMgdGVybWluYXRlZCBvciBjYW5jZWxsZWQgKGJ5IHJldHVybmluZyB0ZW1wb3JhbC5DYW5jZWxlZEVycm9yKS5cbiAgICogaHR0cHM6Ly9jcm9udGFiLmd1cnUvIGlzIHVzZWZ1bCBmb3IgdGVzdGluZyB5b3VyIGNyb24gZXhwcmVzc2lvbnMuXG4gICAqL1xuICBjcm9uU2NoZWR1bGU/OiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIFNwZWNpZmllcyBhZGRpdGlvbmFsIG5vbi1pbmRleGVkIGluZm9ybWF0aW9uIHRvIGF0dGFjaCB0byB0aGUgV29ya2Zsb3cgRXhlY3V0aW9uLiBUaGUgdmFsdWVzIGNhbiBiZSBhbnl0aGluZyB0aGF0XG4gICAqIGlzIHNlcmlhbGl6YWJsZSBieSB7QGxpbmsgRGF0YUNvbnZlcnRlcn0uXG4gICAqL1xuICBtZW1vPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG5cbiAgLyoqXG4gICAqIFNwZWNpZmllcyBhZGRpdGlvbmFsIGluZGV4ZWQgaW5mb3JtYXRpb24gdG8gYXR0YWNoIHRvIHRoZSBXb3JrZmxvdyBFeGVjdXRpb24uIE1vcmUgaW5mbzpcbiAgICogaHR0cHM6Ly9kb2NzLnRlbXBvcmFsLmlvL2RvY3MvdHlwZXNjcmlwdC9zZWFyY2gtYXR0cmlidXRlc1xuICAgKlxuICAgKiBWYWx1ZXMgYXJlIGFsd2F5cyBjb252ZXJ0ZWQgdXNpbmcge0BsaW5rIEpzb25QYXlsb2FkQ29udmVydGVyfSwgZXZlbiB3aGVuIGEgY3VzdG9tIGRhdGEgY29udmVydGVyIGlzIHByb3ZpZGVkLlxuICAgKi9cbiAgc2VhcmNoQXR0cmlidXRlcz86IFNlYXJjaEF0dHJpYnV0ZXM7XG59XG5cbmV4cG9ydCB0eXBlIFdpdGhXb3JrZmxvd0FyZ3M8VyBleHRlbmRzIFdvcmtmbG93LCBUPiA9IFQgJlxuICAoUGFyYW1ldGVyczxXPiBleHRlbmRzIFthbnksIC4uLmFueVtdXVxuICAgID8ge1xuICAgICAgICAvKipcbiAgICAgICAgICogQXJndW1lbnRzIHRvIHBhc3MgdG8gdGhlIFdvcmtmbG93XG4gICAgICAgICAqL1xuICAgICAgICBhcmdzOiBQYXJhbWV0ZXJzPFc+IHwgUmVhZG9ubHk8UGFyYW1ldGVyczxXPj47XG4gICAgICB9XG4gICAgOiB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBcmd1bWVudHMgdG8gcGFzcyB0byB0aGUgV29ya2Zsb3dcbiAgICAgICAgICovXG4gICAgICAgIGFyZ3M/OiBQYXJhbWV0ZXJzPFc+IHwgUmVhZG9ubHk8UGFyYW1ldGVyczxXPj47XG4gICAgICB9KTtcblxuZXhwb3J0IGludGVyZmFjZSBXb3JrZmxvd0R1cmF0aW9uT3B0aW9ucyB7XG4gIC8qKlxuICAgKiBUaGUgdGltZSBhZnRlciB3aGljaCB3b3JrZmxvdyBydW4gaXMgYXV0b21hdGljYWxseSB0ZXJtaW5hdGVkIGJ5IFRlbXBvcmFsIHNlcnZpY2UuIERvIG5vdFxuICAgKiByZWx5IG9uIHJ1biB0aW1lb3V0IGZvciBidXNpbmVzcyBsZXZlbCB0aW1lb3V0cy4gSXQgaXMgcHJlZmVycmVkIHRvIHVzZSBpbiB3b3JrZmxvdyB0aW1lcnNcbiAgICogZm9yIHRoaXMgcHVycG9zZS5cbiAgICpcbiAgICogQGZvcm1hdCBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIG9yIHtAbGluayBodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9tcyB8IG1zLWZvcm1hdHRlZCBzdHJpbmd9XG4gICAqL1xuICB3b3JrZmxvd1J1blRpbWVvdXQ/OiBEdXJhdGlvbjtcblxuICAvKipcbiAgICpcbiAgICogVGhlIHRpbWUgYWZ0ZXIgd2hpY2ggd29ya2Zsb3cgZXhlY3V0aW9uICh3aGljaCBpbmNsdWRlcyBydW4gcmV0cmllcyBhbmQgY29udGludWUgYXMgbmV3KSBpc1xuICAgKiBhdXRvbWF0aWNhbGx5IHRlcm1pbmF0ZWQgYnkgVGVtcG9yYWwgc2VydmljZS4gRG8gbm90IHJlbHkgb24gZXhlY3V0aW9uIHRpbWVvdXQgZm9yIGJ1c2luZXNzXG4gICAqIGxldmVsIHRpbWVvdXRzLiBJdCBpcyBwcmVmZXJyZWQgdG8gdXNlIGluIHdvcmtmbG93IHRpbWVycyBmb3IgdGhpcyBwdXJwb3NlLlxuICAgKlxuICAgKiBAZm9ybWF0IG51bWJlciBvZiBtaWxsaXNlY29uZHMgb3Ige0BsaW5rIGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL21zIHwgbXMtZm9ybWF0dGVkIHN0cmluZ31cbiAgICovXG4gIHdvcmtmbG93RXhlY3V0aW9uVGltZW91dD86IER1cmF0aW9uO1xuXG4gIC8qKlxuICAgKiBNYXhpbXVtIGV4ZWN1dGlvbiB0aW1lIG9mIGEgc2luZ2xlIHdvcmtmbG93IHRhc2suIERlZmF1bHQgaXMgMTAgc2Vjb25kcy5cbiAgICpcbiAgICogQGZvcm1hdCBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIG9yIHtAbGluayBodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9tcyB8IG1zLWZvcm1hdHRlZCBzdHJpbmd9XG4gICAqL1xuICB3b3JrZmxvd1Rhc2tUaW1lb3V0PzogRHVyYXRpb247XG59XG5cbmV4cG9ydCB0eXBlIENvbW1vbldvcmtmbG93T3B0aW9ucyA9IEJhc2VXb3JrZmxvd09wdGlvbnMgJiBXb3JrZmxvd0R1cmF0aW9uT3B0aW9ucztcblxuZXhwb3J0IGZ1bmN0aW9uIGV4dHJhY3RXb3JrZmxvd1R5cGU8VCBleHRlbmRzIFdvcmtmbG93Pih3b3JrZmxvd1R5cGVPckZ1bmM6IHN0cmluZyB8IFQpOiBzdHJpbmcge1xuICBpZiAodHlwZW9mIHdvcmtmbG93VHlwZU9yRnVuYyA9PT0gJ3N0cmluZycpIHJldHVybiB3b3JrZmxvd1R5cGVPckZ1bmMgYXMgc3RyaW5nO1xuICBpZiAodHlwZW9mIHdvcmtmbG93VHlwZU9yRnVuYyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGlmICh3b3JrZmxvd1R5cGVPckZ1bmM/Lm5hbWUpIHJldHVybiB3b3JrZmxvd1R5cGVPckZ1bmMubmFtZTtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdJbnZhbGlkIHdvcmtmbG93IHR5cGU6IHRoZSB3b3JrZmxvdyBmdW5jdGlvbiBpcyBhbm9ueW1vdXMnKTtcbiAgfVxuICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgIGBJbnZhbGlkIHdvcmtmbG93IHR5cGU6IGV4cGVjdGVkIGVpdGhlciBhIHN0cmluZyBvciBhIGZ1bmN0aW9uLCBnb3QgJyR7dHlwZW9mIHdvcmtmbG93VHlwZU9yRnVuY30nYFxuICApO1xufVxuIiwiLy8gQSBwb3J0IG9mIGFuIGFsZ29yaXRobSBieSBKb2hhbm5lcyBCYWFnw7hlIDxiYWFnb2VAYmFhZ29lLmNvbT4sIDIwMTBcbi8vIGh0dHA6Ly9iYWFnb2UuY29tL2VuL1JhbmRvbU11c2luZ3MvamF2YXNjcmlwdC9cbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9ucXVpbmxhbi9iZXR0ZXItcmFuZG9tLW51bWJlcnMtZm9yLWphdmFzY3JpcHQtbWlycm9yXG4vLyBPcmlnaW5hbCB3b3JrIGlzIHVuZGVyIE1JVCBsaWNlbnNlIC1cblxuLy8gQ29weXJpZ2h0IChDKSAyMDEwIGJ5IEpvaGFubmVzIEJhYWfDuGUgPGJhYWdvZUBiYWFnb2Uub3JnPlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbi8vIFRha2VuIGFuZCBtb2RpZmllZCBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9kYXZpZGJhdS9zZWVkcmFuZG9tL2Jsb2IvcmVsZWFzZWQvbGliL2FsZWEuanNcblxuY2xhc3MgQWxlYSB7XG4gIHB1YmxpYyBjOiBudW1iZXI7XG4gIHB1YmxpYyBzMDogbnVtYmVyO1xuICBwdWJsaWMgczE6IG51bWJlcjtcbiAgcHVibGljIHMyOiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3Ioc2VlZDogbnVtYmVyW10pIHtcbiAgICBjb25zdCBtYXNoID0gbmV3IE1hc2goKTtcbiAgICAvLyBBcHBseSB0aGUgc2VlZGluZyBhbGdvcml0aG0gZnJvbSBCYWFnb2UuXG4gICAgdGhpcy5jID0gMTtcbiAgICB0aGlzLnMwID0gbWFzaC5tYXNoKFszMl0pO1xuICAgIHRoaXMuczEgPSBtYXNoLm1hc2goWzMyXSk7XG4gICAgdGhpcy5zMiA9IG1hc2gubWFzaChbMzJdKTtcbiAgICB0aGlzLnMwIC09IG1hc2gubWFzaChzZWVkKTtcbiAgICBpZiAodGhpcy5zMCA8IDApIHtcbiAgICAgIHRoaXMuczAgKz0gMTtcbiAgICB9XG4gICAgdGhpcy5zMSAtPSBtYXNoLm1hc2goc2VlZCk7XG4gICAgaWYgKHRoaXMuczEgPCAwKSB7XG4gICAgICB0aGlzLnMxICs9IDE7XG4gICAgfVxuICAgIHRoaXMuczIgLT0gbWFzaC5tYXNoKHNlZWQpO1xuICAgIGlmICh0aGlzLnMyIDwgMCkge1xuICAgICAgdGhpcy5zMiArPSAxO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBuZXh0KCk6IG51bWJlciB7XG4gICAgY29uc3QgdCA9IDIwOTE2MzkgKiB0aGlzLnMwICsgdGhpcy5jICogMi4zMjgzMDY0MzY1Mzg2OTYzZS0xMDsgLy8gMl4tMzJcbiAgICB0aGlzLnMwID0gdGhpcy5zMTtcbiAgICB0aGlzLnMxID0gdGhpcy5zMjtcbiAgICByZXR1cm4gKHRoaXMuczIgPSB0IC0gKHRoaXMuYyA9IHQgfCAwKSk7XG4gIH1cbn1cblxuZXhwb3J0IHR5cGUgUk5HID0gKCkgPT4gbnVtYmVyO1xuXG5leHBvcnQgZnVuY3Rpb24gYWxlYShzZWVkOiBudW1iZXJbXSk6IFJORyB7XG4gIGNvbnN0IHhnID0gbmV3IEFsZWEoc2VlZCk7XG4gIHJldHVybiB4Zy5uZXh0LmJpbmQoeGcpO1xufVxuXG5leHBvcnQgY2xhc3MgTWFzaCB7XG4gIHByaXZhdGUgbiA9IDB4ZWZjODI0OWQ7XG5cbiAgcHVibGljIG1hc2goZGF0YTogbnVtYmVyW10pOiBudW1iZXIge1xuICAgIGxldCB7IG4gfSA9IHRoaXM7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICBuICs9IGRhdGFbaV07XG4gICAgICBsZXQgaCA9IDAuMDI1MTk2MDMyODI0MTY5MzggKiBuO1xuICAgICAgbiA9IGggPj4+IDA7XG4gICAgICBoIC09IG47XG4gICAgICBoICo9IG47XG4gICAgICBuID0gaCA+Pj4gMDtcbiAgICAgIGggLT0gbjtcbiAgICAgIG4gKz0gaCAqIDB4MTAwMDAwMDAwOyAvLyAyXjMyXG4gICAgfVxuICAgIHRoaXMubiA9IG47XG4gICAgcmV0dXJuIChuID4+PiAwKSAqIDIuMzI4MzA2NDM2NTM4Njk2M2UtMTA7IC8vIDJeLTMyXG4gIH1cbn1cbiIsImltcG9ydCB0eXBlIHsgQXN5bmNMb2NhbFN0b3JhZ2UgYXMgQUxTIH0gZnJvbSAnbm9kZTphc3luY19ob29rcyc7XG5pbXBvcnQgeyBDYW5jZWxsZWRGYWlsdXJlLCBEdXJhdGlvbiwgSWxsZWdhbFN0YXRlRXJyb3IgfSBmcm9tICdAdGVtcG9yYWxpby9jb21tb24nO1xuaW1wb3J0IHsgbXNPcHRpb25hbFRvTnVtYmVyIH0gZnJvbSAnQHRlbXBvcmFsaW8vY29tbW9uL2xpYi90aW1lJztcbmltcG9ydCB7IHVudHJhY2tQcm9taXNlIH0gZnJvbSAnLi9zdGFjay1oZWxwZXJzJztcbmltcG9ydCB7IGdldEFjdGl2YXRvciB9IGZyb20gJy4vZ2xvYmFsLWF0dHJpYnV0ZXMnO1xuaW1wb3J0IHsgU2RrRmxhZ3MgfSBmcm9tICcuL2ZsYWdzJztcblxuLy8gQXN5bmNMb2NhbFN0b3JhZ2UgaXMgaW5qZWN0ZWQgdmlhIHZtIG1vZHVsZSBpbnRvIGdsb2JhbCBzY29wZS5cbi8vIEluIGNhc2UgV29ya2Zsb3cgY29kZSBpcyBpbXBvcnRlZCBpbiBOb2RlLmpzIGNvbnRleHQsIHJlcGxhY2Ugd2l0aCBhbiBlbXB0eSBjbGFzcy5cbmV4cG9ydCBjb25zdCBBc3luY0xvY2FsU3RvcmFnZTogbmV3IDxUPigpID0+IEFMUzxUPiA9IChnbG9iYWxUaGlzIGFzIGFueSkuQXN5bmNMb2NhbFN0b3JhZ2UgPz8gY2xhc3Mge307XG5cbi8qKiBNYWdpYyBzeW1ib2wgdXNlZCB0byBjcmVhdGUgdGhlIHJvb3Qgc2NvcGUgLSBpbnRlbnRpb25hbGx5IG5vdCBleHBvcnRlZCAqL1xuY29uc3QgTk9fUEFSRU5UID0gU3ltYm9sKCdOT19QQVJFTlQnKTtcblxuLyoqXG4gKiBPcHRpb24gZm9yIGNvbnN0cnVjdGluZyBhIENhbmNlbGxhdGlvblNjb3BlXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ2FuY2VsbGF0aW9uU2NvcGVPcHRpb25zIHtcbiAgLyoqXG4gICAqIFRpbWUgaW4gbWlsbGlzZWNvbmRzIGJlZm9yZSB0aGUgc2NvcGUgY2FuY2VsbGF0aW9uIGlzIGF1dG9tYXRpY2FsbHkgcmVxdWVzdGVkXG4gICAqL1xuICB0aW1lb3V0PzogRHVyYXRpb247XG5cbiAgLyoqXG4gICAqIElmIGZhbHNlLCBwcmV2ZW50IG91dGVyIGNhbmNlbGxhdGlvbiBmcm9tIHByb3BhZ2F0aW5nIHRvIGlubmVyIHNjb3BlcywgQWN0aXZpdGllcywgdGltZXJzLCBhbmQgVHJpZ2dlcnMsIGRlZmF1bHRzIHRvIHRydWUuXG4gICAqIChTY29wZSBzdGlsbCBwcm9wYWdhdGVzIENhbmNlbGxlZEZhaWx1cmUgdGhyb3duIGZyb20gd2l0aGluKS5cbiAgICovXG4gIGNhbmNlbGxhYmxlOiBib29sZWFuO1xuICAvKipcbiAgICogQW4gb3B0aW9uYWwgQ2FuY2VsbGF0aW9uU2NvcGUgKHVzZWZ1bCBmb3IgcnVubmluZyBiYWNrZ3JvdW5kIHRhc2tzKS5cbiAgICogVGhlIGBOT19QQVJFTlRgIHN5bWJvbCBpcyByZXNlcnZlZCBmb3IgdGhlIHJvb3Qgc2NvcGUuXG4gICAqL1xuICBwYXJlbnQ/OiBDYW5jZWxsYXRpb25TY29wZSB8IHR5cGVvZiBOT19QQVJFTlQ7XG59XG5cbi8qKlxuICogQ2FuY2VsbGF0aW9uIFNjb3BlcyBwcm92aWRlIHRoZSBtZWNoYW5pYyBieSB3aGljaCBhIFdvcmtmbG93IG1heSBncmFjZWZ1bGx5IGhhbmRsZSBpbmNvbWluZyByZXF1ZXN0cyBmb3IgY2FuY2VsbGF0aW9uXG4gKiAoZS5nLiBpbiByZXNwb25zZSB0byB7QGxpbmsgV29ya2Zsb3dIYW5kbGUuY2FuY2VsfSBvciB0aHJvdWdoIHRoZSBVSSBvciBDTEkpLCBhcyB3ZWxsIGFzIHJlcXVlc3QgY2FuY2VsYXRpb24gb2ZcbiAqIGNhbmNlbGxhYmxlIG9wZXJhdGlvbnMgaXQgb3ducyAoZS5nLiBBY3Rpdml0aWVzLCBUaW1lcnMsIENoaWxkIFdvcmtmbG93cywgZXRjKS5cbiAqXG4gKiBDYW5jZWxsYXRpb24gU2NvcGVzIGZvcm0gYSB0cmVlLCB3aXRoIHRoZSBXb3JrZmxvdydzIG1haW4gZnVuY3Rpb24gcnVubmluZyBpbiB0aGUgcm9vdCBzY29wZSBvZiB0aGF0IHRyZWUuXG4gKiBCeSBkZWZhdWx0LCBjYW5jZWxsYXRpb24gcHJvcGFnYXRlcyBkb3duIGZyb20gYSBwYXJlbnQgc2NvcGUgdG8gaXRzIGNoaWxkcmVuIGFuZCBpdHMgY2FuY2VsbGFibGUgb3BlcmF0aW9ucy5cbiAqIEEgbm9uLWNhbmNlbGxhYmxlIHNjb3BlIGNhbiByZWNlaXZlIGNhbmNlbGxhdGlvbiByZXF1ZXN0cywgYnV0IGlzIG5ldmVyIGVmZmVjdGl2ZWx5IGNvbnNpZGVyZWQgYXMgY2FuY2VsbGVkLFxuICogdGh1cyBzaGllbGRkaW5nIGl0cyBjaGlsZHJlbiBhbmQgY2FuY2VsbGFibGUgb3BlcmF0aW9ucyBmcm9tIHByb3BhZ2F0aW9uIG9mIGNhbmNlbGxhdGlvbiByZXF1ZXN0cyBpdCByZWNlaXZlcy5cbiAqXG4gKiBTY29wZXMgYXJlIGNyZWF0ZWQgdXNpbmcgdGhlIGBDYW5jZWxsYXRpb25TY29wZWAgY29uc3RydWN0b3Igb3IgdGhlIHN0YXRpYyBoZWxwZXIgbWV0aG9kcyB7QGxpbmsgY2FuY2VsbGFibGV9LFxuICoge0BsaW5rIG5vbkNhbmNlbGxhYmxlfSBhbmQge0BsaW5rIHdpdGhUaW1lb3V0fS4gYHdpdGhUaW1lb3V0YCBjcmVhdGVzIGEgc2NvcGUgdGhhdCBhdXRvbWF0aWNhbGx5IGNhbmNlbHMgaXRzZWxmIGFmdGVyXG4gKiBzb21lIGR1cmF0aW9uLlxuICpcbiAqIENhbmNlbGxhdGlvbiBvZiBhIGNhbmNlbGxhYmxlIHNjb3BlIHJlc3VsdHMgaW4gYWxsIG9wZXJhdGlvbnMgY3JlYXRlZCBkaXJlY3RseSBpbiB0aGF0IHNjb3BlIHRvIHRocm93IGFcbiAqIHtAbGluayBDYW5jZWxsZWRGYWlsdXJlfSAoZWl0aGVyIGRpcmVjdGx5LCBvciBhcyB0aGUgYGNhdXNlYCBvZiBhbiB7QGxpbmsgQWN0aXZpdHlGYWlsdXJlfSBvciBhXG4gKiB7QGxpbmsgQ2hpbGRXb3JrZmxvd0ZhaWx1cmV9KS4gRnVydGhlciBhdHRlbXB0IHRvIGNyZWF0ZSBuZXcgY2FuY2VsbGFibGUgc2NvcGVzIG9yIGNhbmNlbGxhYmxlIG9wZXJhdGlvbnMgd2l0aGluIGFcbiAqIHNjb3BlIHRoYXQgaGFzIGFscmVhZHkgYmVlbiBjYW5jZWxsZWQgd2lsbCBhbHNvIGltbWVkaWF0ZWx5IHRocm93IGEge0BsaW5rIENhbmNlbGxlZEZhaWx1cmV9IGV4Y2VwdGlvbi4gSXQgaXMgaG93ZXZlclxuICogcG9zc2libGUgdG8gY3JlYXRlIGEgbm9uLWNhbmNlbGxhYmxlIHNjb3BlIGF0IHRoYXQgcG9pbnQ7IHRoaXMgaXMgb2Z0ZW4gdXNlZCB0byBleGVjdXRlIHJvbGxiYWNrIG9yIGNsZWFudXBcbiAqIG9wZXJhdGlvbnMuIEZvciBleGFtcGxlOlxuICpcbiAqIGBgYHRzXG4gKiBhc3luYyBmdW5jdGlvbiBteVdvcmtmbG93KC4uLik6IFByb21pc2U8dm9pZD4ge1xuICogICB0cnkge1xuICogICAgIC8vIFRoaXMgYWN0aXZpdHkgcnVucyBpbiB0aGUgcm9vdCBjYW5jZWxsYXRpb24gc2NvcGUuIFRoZXJlZm9yZSwgYSBjYW5jZWxhdGlvbiByZXF1ZXN0IG9uXG4gKiAgICAgLy8gdGhlIFdvcmtmbG93IGV4ZWN1dGlvbiAoZS5nLiB0aHJvdWdoIHRoZSBVSSBvciBDTEkpIGF1dG9tYXRpY2FsbHkgcHJvcGFnYXRlcyB0byB0aGlzXG4gKiAgICAgLy8gYWN0aXZpdHkuIEFzc3VtaW5nIHRoYXQgdGhlIGFjdGl2aXR5IHByb3Blcmx5IGhhbmRsZSB0aGUgY2FuY2VsbGF0aW9uIHJlcXVlc3QsIHRoZW4gdGhlXG4gKiAgICAgLy8gY2FsbCBiZWxvdyB3aWxsIHRocm93IGFuIGBBY3Rpdml0eUZhaWx1cmVgIGV4Y2VwdGlvbiwgd2l0aCBgY2F1c2VgIHNldHMgdG8gYW5cbiAqICAgICAvLyBpbnN0YW5jZSBvZiBgQ2FuY2VsbGVkRmFpbHVyZWAuXG4gKiAgICAgYXdhaXQgc29tZUFjdGl2aXR5KCk7XG4gKiAgIH0gY2F0Y2ggKGUpIHtcbiAqICAgICBpZiAoaXNDYW5jZWxsYXRpb24oZSkpIHtcbiAqICAgICAgIC8vIFJ1biBjbGVhbnVwIGFjdGl2aXR5IGluIGEgbm9uLWNhbmNlbGxhYmxlIHNjb3BlXG4gKiAgICAgICBhd2FpdCBDYW5jZWxsYXRpb25TY29wZS5ub25DYW5jZWxsYWJsZShhc3luYyAoKSA9PiB7XG4gKiAgICAgICAgIGF3YWl0IGNsZWFudXBBY3Rpdml0eSgpO1xuICogICAgICAgfVxuICogICAgIH0gZWxzZSB7XG4gKiAgICAgICB0aHJvdyBlO1xuICogICAgIH1cbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICogQSBjYW5jZWxsYWJsZSBzY29wZSBtYXkgYmUgcHJvZ3JhbWF0aWNhbGx5IGNhbmNlbGxlZCBieSBjYWxsaW5nIHtAbGluayBjYW5jZWx8YHNjb3BlLmNhbmNlbCgpYH1gLiBUaGlzIG1heSBiZSB1c2VkLFxuICogZm9yIGV4YW1wbGUsIHRvIGV4cGxpY2l0bHkgcmVxdWVzdCBjYW5jZWxsYXRpb24gb2YgYW4gQWN0aXZpdHkgb3IgQ2hpbGQgV29ya2Zsb3c6XG4gKlxuICogYGBgdHNcbiAqIGNvbnN0IGNhbmNlbGxhYmxlQWN0aXZpdHlTY29wZSA9IG5ldyBDYW5jZWxsYXRpb25TY29wZSgpO1xuICogY29uc3QgYWN0aXZpdHlQcm9taXNlID0gY2FuY2VsbGFibGVBY3Rpdml0eVNjb3BlLnJ1bigoKSA9PiBzb21lQWN0aXZpdHkoKSk7XG4gKiBjYW5jZWxsYWJsZUFjdGl2aXR5U2NvcGUuY2FuY2VsKCk7IC8vIENhbmNlbHMgdGhlIGFjdGl2aXR5XG4gKiBhd2FpdCBhY3Rpdml0eVByb21pc2U7IC8vIFRocm93cyBgQWN0aXZpdHlGYWlsdXJlYCB3aXRoIGBjYXVzZWAgc2V0IHRvIGBDYW5jZWxsZWRGYWlsdXJlYFxuICogYGBgXG4gKi9cbmV4cG9ydCBjbGFzcyBDYW5jZWxsYXRpb25TY29wZSB7XG4gIC8qKlxuICAgKiBUaW1lIGluIG1pbGxpc2Vjb25kcyBiZWZvcmUgdGhlIHNjb3BlIGNhbmNlbGxhdGlvbiBpcyBhdXRvbWF0aWNhbGx5IHJlcXVlc3RlZFxuICAgKi9cbiAgcHJvdGVjdGVkIHJlYWRvbmx5IHRpbWVvdXQ/OiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIElmIGZhbHNlLCB0aGVuIHRoaXMgc2NvcGUgd2lsbCBuZXZlciBiZSBjb25zaWRlcmVkIGNhbmNlbGxlZCwgZXZlbiBpZiBhIGNhbmNlbGxhdGlvbiByZXF1ZXN0IGlzIHJlY2VpdmVkIChlaXRoZXJcbiAgICogZGlyZWN0bHkgYnkgY2FsbGluZyBgc2NvcGUuY2FuY2VsKClgIG9yIGluZGlyZWN0bHkgYnkgY2FuY2VsbGluZyBhIGNhbmNlbGxhYmxlIHBhcmVudCBzY29wZSkuIFRoaXMgZWZmZWN0aXZlbHlcbiAgICogc2hpZWxkcyB0aGUgc2NvcGUncyBjaGlsZHJlbiBhbmQgY2FuY2VsbGFibGUgb3BlcmF0aW9ucyBmcm9tIHByb3BhZ2F0aW9uIG9mIGNhbmNlbGxhdGlvbiByZXF1ZXN0cyBtYWRlIG9uIHRoZVxuICAgKiBub24tY2FuY2VsbGFibGUgc2NvcGUuXG4gICAqXG4gICAqIE5vdGUgdGhhdCB0aGUgUHJvbWlzZSByZXR1cm5lZCBieSB0aGUgYHJ1bmAgZnVuY3Rpb24gb2Ygbm9uLWNhbmNlbGxhYmxlIHNjb3BlIG1heSBzdGlsbCB0aHJvdyBhIGBDYW5jZWxsZWRGYWlsdXJlYFxuICAgKiBpZiBzdWNoIGFuIGV4Y2VwdGlvbiBpcyB0aHJvd24gZnJvbSB3aXRoaW4gdGhhdCBzY29wZSAoZS5nLiBieSBkaXJlY3RseSBjYW5jZWxsaW5nIGEgY2FuY2VsbGFibGUgY2hpbGQgc2NvcGUpLlxuICAgKi9cbiAgcHVibGljIHJlYWRvbmx5IGNhbmNlbGxhYmxlOiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBBbiBvcHRpb25hbCBDYW5jZWxsYXRpb25TY29wZSAodXNlZnVsIGZvciBydW5uaW5nIGJhY2tncm91bmQgdGFza3MpLCBkZWZhdWx0cyB0byB7QGxpbmsgQ2FuY2VsbGF0aW9uU2NvcGUuY3VycmVudH0oKVxuICAgKi9cbiAgcHVibGljIHJlYWRvbmx5IHBhcmVudD86IENhbmNlbGxhdGlvblNjb3BlO1xuXG4gIC8qKlxuICAgKiBBIFByb21pc2UgdGhhdCB0aHJvd3Mgd2hlbiBhIGNhbmNlbGxhYmxlIHNjb3BlIHJlY2VpdmVzIGEgY2FuY2VsbGF0aW9uIHJlcXVlc3QsIGVpdGhlciBkaXJlY3RseVxuICAgKiAoaS5lLiBgc2NvcGUuY2FuY2VsKClgKSwgb3IgaW5kaXJlY3RseSAoYnkgY2FuY2VsbGluZyBhIGNhbmNlbGxhYmxlIHBhcmVudCBzY29wZSkuXG4gICAqXG4gICAqIE5vdGUgdGhhdCBhIG5vbi1jYW5jZWxsYWJsZSBzY29wZSBtYXkgcmVjZWl2ZSBjYW5jZWxsYXRpb24gcmVxdWVzdHMsIHJlc3VsdGluZyBpbiB0aGUgYGNhbmNlbFJlcXVlc3RlZGAgcHJvbWlzZSBmb3JcbiAgICogdGhhdCBzY29wZSB0byB0aHJvdywgdGhvdWdoIHRoZSBzY29wZSB3aWxsIG5vdCBlZmZlY3RpdmVseSBnZXQgY2FuY2VsbGVkIChpLmUuIGBjb25zaWRlcmVkQ2FuY2VsbGVkYCB3aWxsIHN0aWxsXG4gICAqIHJldHVybiBgZmFsc2VgLCBhbmQgY2FuY2VsbGF0aW9uIHdpbGwgbm90IGJlIHByb3BhZ2F0ZWQgdG8gY2hpbGQgc2NvcGVzIGFuZCBjb250YWluZWQgb3BlcmF0aW9ucykuXG4gICAqL1xuICBwdWJsaWMgcmVhZG9ubHkgY2FuY2VsUmVxdWVzdGVkOiBQcm9taXNlPG5ldmVyPjtcblxuICAjY2FuY2VsUmVxdWVzdGVkID0gZmFsc2U7XG5cbiAgLy8gVHlwZXNjcmlwdCBkb2VzIG5vdCB1bmRlcnN0YW5kIHRoYXQgdGhlIFByb21pc2UgZXhlY3V0b3IgcnVucyBzeW5jaHJvbm91c2x5IGluIHRoZSBjb25zdHJ1Y3RvclxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L2Jhbi10cy1jb21tZW50XG4gIC8vIEB0cy1pZ25vcmVcbiAgcHJvdGVjdGVkIHJlYWRvbmx5IHJlamVjdDogKHJlYXNvbj86IGFueSkgPT4gdm9pZDtcblxuICBjb25zdHJ1Y3RvcihvcHRpb25zPzogQ2FuY2VsbGF0aW9uU2NvcGVPcHRpb25zKSB7XG4gICAgdGhpcy50aW1lb3V0ID0gbXNPcHRpb25hbFRvTnVtYmVyKG9wdGlvbnM/LnRpbWVvdXQpO1xuICAgIHRoaXMuY2FuY2VsbGFibGUgPSBvcHRpb25zPy5jYW5jZWxsYWJsZSA/PyB0cnVlO1xuICAgIHRoaXMuY2FuY2VsUmVxdWVzdGVkID0gbmV3IFByb21pc2UoKF8sIHJlamVjdCkgPT4ge1xuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciBUU0MgZG9lc24ndCB1bmRlcnN0YW5kIHRoYXQgdGhlIFByb21pc2UgZXhlY3V0b3IgcnVucyBzeW5jaHJvbm91c2x5XG4gICAgICB0aGlzLnJlamVjdCA9IChlcnIpID0+IHtcbiAgICAgICAgdGhpcy4jY2FuY2VsUmVxdWVzdGVkID0gdHJ1ZTtcbiAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICB9O1xuICAgIH0pO1xuICAgIHVudHJhY2tQcm9taXNlKHRoaXMuY2FuY2VsUmVxdWVzdGVkKTtcbiAgICAvLyBBdm9pZCB1bmhhbmRsZWQgcmVqZWN0aW9uc1xuICAgIHVudHJhY2tQcm9taXNlKHRoaXMuY2FuY2VsUmVxdWVzdGVkLmNhdGNoKCgpID0+IHVuZGVmaW5lZCkpO1xuICAgIGlmIChvcHRpb25zPy5wYXJlbnQgIT09IE5PX1BBUkVOVCkge1xuICAgICAgdGhpcy5wYXJlbnQgPSBvcHRpb25zPy5wYXJlbnQgfHwgQ2FuY2VsbGF0aW9uU2NvcGUuY3VycmVudCgpO1xuICAgICAgaWYgKFxuICAgICAgICB0aGlzLnBhcmVudC5jYW5jZWxsYWJsZSB8fFxuICAgICAgICAodGhpcy5wYXJlbnQuI2NhbmNlbFJlcXVlc3RlZCAmJlxuICAgICAgICAgICFnZXRBY3RpdmF0b3IoKS5oYXNGbGFnKFNka0ZsYWdzLk5vbkNhbmNlbGxhYmxlU2NvcGVzQXJlU2hpZWxkZWRGcm9tUHJvcGFnYXRpb24pKVxuICAgICAgKSB7XG4gICAgICAgIHRoaXMuI2NhbmNlbFJlcXVlc3RlZCA9IHRoaXMucGFyZW50LiNjYW5jZWxSZXF1ZXN0ZWQ7XG4gICAgICAgIHVudHJhY2tQcm9taXNlKFxuICAgICAgICAgIHRoaXMucGFyZW50LmNhbmNlbFJlcXVlc3RlZC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnJlamVjdChlcnIpO1xuICAgICAgICAgIH0pXG4gICAgICAgICk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB1bnRyYWNrUHJvbWlzZShcbiAgICAgICAgICB0aGlzLnBhcmVudC5jYW5jZWxSZXF1ZXN0ZWQuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgaWYgKCFnZXRBY3RpdmF0b3IoKS5oYXNGbGFnKFNka0ZsYWdzLk5vbkNhbmNlbGxhYmxlU2NvcGVzQXJlU2hpZWxkZWRGcm9tUHJvcGFnYXRpb24pKSB7XG4gICAgICAgICAgICAgIHRoaXMucmVqZWN0KGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSlcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogV2hldGhlciB0aGUgc2NvcGUgd2FzIGVmZmVjdGl2ZWx5IGNhbmNlbGxlZC4gQSBub24tY2FuY2VsbGFibGUgc2NvcGUgY2FuIG5ldmVyIGJlIGNvbnNpZGVyZWQgY2FuY2VsbGVkLlxuICAgKi9cbiAgcHVibGljIGdldCBjb25zaWRlcmVkQ2FuY2VsbGVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLiNjYW5jZWxSZXF1ZXN0ZWQgJiYgdGhpcy5jYW5jZWxsYWJsZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBY3RpdmF0ZSB0aGUgc2NvcGUgYXMgY3VycmVudCBhbmQgcnVuICBgZm5gXG4gICAqXG4gICAqIEFueSB0aW1lcnMsIEFjdGl2aXRpZXMsIFRyaWdnZXJzIGFuZCBDYW5jZWxsYXRpb25TY29wZXMgY3JlYXRlZCBpbiB0aGUgYm9keSBvZiBgZm5gXG4gICAqIGF1dG9tYXRpY2FsbHkgbGluayB0aGVpciBjYW5jZWxsYXRpb24gdG8gdGhpcyBzY29wZS5cbiAgICpcbiAgICogQHJldHVybiB0aGUgcmVzdWx0IG9mIGBmbmBcbiAgICovXG4gIHJ1bjxUPihmbjogKCkgPT4gUHJvbWlzZTxUPik6IFByb21pc2U8VD4ge1xuICAgIHJldHVybiBzdG9yYWdlLnJ1bih0aGlzLCB0aGlzLnJ1bkluQ29udGV4dC5iaW5kKHRoaXMsIGZuKSBhcyAoKSA9PiBQcm9taXNlPFQ+KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNZXRob2QgdGhhdCBydW5zIGEgZnVuY3Rpb24gaW4gQXN5bmNMb2NhbFN0b3JhZ2UgY29udGV4dC5cbiAgICpcbiAgICogQ291bGQgaGF2ZSBiZWVuIHdyaXR0ZW4gYXMgYW5vbnltb3VzIGZ1bmN0aW9uLCBtYWRlIGludG8gYSBtZXRob2QgZm9yIGltcHJvdmVkIHN0YWNrIHRyYWNlcy5cbiAgICovXG4gIHByb3RlY3RlZCBhc3luYyBydW5JbkNvbnRleHQ8VD4oZm46ICgpID0+IFByb21pc2U8VD4pOiBQcm9taXNlPFQ+IHtcbiAgICBsZXQgdGltZXJTY29wZTogQ2FuY2VsbGF0aW9uU2NvcGUgfCB1bmRlZmluZWQ7XG4gICAgaWYgKHRoaXMudGltZW91dCkge1xuICAgICAgdGltZXJTY29wZSA9IG5ldyBDYW5jZWxsYXRpb25TY29wZSgpO1xuICAgICAgdW50cmFja1Byb21pc2UoXG4gICAgICAgIHRpbWVyU2NvcGVcbiAgICAgICAgICAucnVuKCgpID0+IHNsZWVwKHRoaXMudGltZW91dCBhcyBudW1iZXIpKVxuICAgICAgICAgIC50aGVuKFxuICAgICAgICAgICAgKCkgPT4gdGhpcy5jYW5jZWwoKSxcbiAgICAgICAgICAgICgpID0+IHtcbiAgICAgICAgICAgICAgLy8gc2NvcGUgd2FzIGFscmVhZHkgY2FuY2VsbGVkLCBpZ25vcmVcbiAgICAgICAgICAgIH1cbiAgICAgICAgICApXG4gICAgICApO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgcmV0dXJuIGF3YWl0IGZuKCk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGlmIChcbiAgICAgICAgdGltZXJTY29wZSAmJlxuICAgICAgICAhdGltZXJTY29wZS5jb25zaWRlcmVkQ2FuY2VsbGVkICYmXG4gICAgICAgIGdldEFjdGl2YXRvcigpLmhhc0ZsYWcoU2RrRmxhZ3MuTm9uQ2FuY2VsbGFibGVTY29wZXNBcmVTaGllbGRlZEZyb21Qcm9wYWdhdGlvbilcbiAgICAgICkge1xuICAgICAgICB0aW1lclNjb3BlLmNhbmNlbCgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXF1ZXN0IHRvIGNhbmNlbCB0aGUgc2NvcGUgYW5kIGxpbmtlZCBjaGlsZHJlblxuICAgKi9cbiAgY2FuY2VsKCk6IHZvaWQge1xuICAgIHRoaXMucmVqZWN0KG5ldyBDYW5jZWxsZWRGYWlsdXJlKCdDYW5jZWxsYXRpb24gc2NvcGUgY2FuY2VsbGVkJykpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgY3VycmVudCBcImFjdGl2ZVwiIHNjb3BlXG4gICAqL1xuICBzdGF0aWMgY3VycmVudCgpOiBDYW5jZWxsYXRpb25TY29wZSB7XG4gICAgLy8gVXNpbmcgZ2xvYmFscyBkaXJlY3RseSBpbnN0ZWFkIG9mIGEgaGVscGVyIGZ1bmN0aW9uIHRvIGF2b2lkIGNpcmN1bGFyIGltcG9ydFxuICAgIHJldHVybiBzdG9yYWdlLmdldFN0b3JlKCkgPz8gKGdsb2JhbFRoaXMgYXMgYW55KS5fX1RFTVBPUkFMX0FDVElWQVRPUl9fLnJvb3RTY29wZTtcbiAgfVxuXG4gIC8qKiBBbGlhcyB0byBgbmV3IENhbmNlbGxhdGlvblNjb3BlKHsgY2FuY2VsbGFibGU6IHRydWUgfSkucnVuKGZuKWAgKi9cbiAgc3RhdGljIGNhbmNlbGxhYmxlPFQ+KGZuOiAoKSA9PiBQcm9taXNlPFQ+KTogUHJvbWlzZTxUPiB7XG4gICAgcmV0dXJuIG5ldyB0aGlzKHsgY2FuY2VsbGFibGU6IHRydWUgfSkucnVuKGZuKTtcbiAgfVxuXG4gIC8qKiBBbGlhcyB0byBgbmV3IENhbmNlbGxhdGlvblNjb3BlKHsgY2FuY2VsbGFibGU6IGZhbHNlIH0pLnJ1bihmbilgICovXG4gIHN0YXRpYyBub25DYW5jZWxsYWJsZTxUPihmbjogKCkgPT4gUHJvbWlzZTxUPik6IFByb21pc2U8VD4ge1xuICAgIHJldHVybiBuZXcgdGhpcyh7IGNhbmNlbGxhYmxlOiBmYWxzZSB9KS5ydW4oZm4pO1xuICB9XG5cbiAgLyoqIEFsaWFzIHRvIGBuZXcgQ2FuY2VsbGF0aW9uU2NvcGUoeyBjYW5jZWxsYWJsZTogdHJ1ZSwgdGltZW91dCB9KS5ydW4oZm4pYCAqL1xuICBzdGF0aWMgd2l0aFRpbWVvdXQ8VD4odGltZW91dDogRHVyYXRpb24sIGZuOiAoKSA9PiBQcm9taXNlPFQ+KTogUHJvbWlzZTxUPiB7XG4gICAgcmV0dXJuIG5ldyB0aGlzKHsgY2FuY2VsbGFibGU6IHRydWUsIHRpbWVvdXQgfSkucnVuKGZuKTtcbiAgfVxufVxuXG5jb25zdCBzdG9yYWdlID0gbmV3IEFzeW5jTG9jYWxTdG9yYWdlPENhbmNlbGxhdGlvblNjb3BlPigpO1xuXG4vKipcbiAqIEF2b2lkIGV4cG9zaW5nIHRoZSBzdG9yYWdlIGRpcmVjdGx5IHNvIGl0IGRvZXNuJ3QgZ2V0IGZyb3plblxuICovXG5leHBvcnQgZnVuY3Rpb24gZGlzYWJsZVN0b3JhZ2UoKTogdm9pZCB7XG4gIHN0b3JhZ2UuZGlzYWJsZSgpO1xufVxuXG5leHBvcnQgY2xhc3MgUm9vdENhbmNlbGxhdGlvblNjb3BlIGV4dGVuZHMgQ2FuY2VsbGF0aW9uU2NvcGUge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcih7IGNhbmNlbGxhYmxlOiB0cnVlLCBwYXJlbnQ6IE5PX1BBUkVOVCB9KTtcbiAgfVxuXG4gIGNhbmNlbCgpOiB2b2lkIHtcbiAgICB0aGlzLnJlamVjdChuZXcgQ2FuY2VsbGVkRmFpbHVyZSgnV29ya2Zsb3cgY2FuY2VsbGVkJykpO1xuICB9XG59XG5cbi8qKiBUaGlzIGZ1bmN0aW9uIGlzIGhlcmUgdG8gYXZvaWQgYSBjaXJjdWxhciBkZXBlbmRlbmN5IGJldHdlZW4gdGhpcyBtb2R1bGUgYW5kIHdvcmtmbG93LnRzICovXG5sZXQgc2xlZXAgPSAoXzogRHVyYXRpb24pOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgdGhyb3cgbmV3IElsbGVnYWxTdGF0ZUVycm9yKCdXb3JrZmxvdyBoYXMgbm90IGJlZW4gcHJvcGVybHkgaW5pdGlhbGl6ZWQnKTtcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlclNsZWVwSW1wbGVtZW50YXRpb24oZm46IHR5cGVvZiBzbGVlcCk6IHZvaWQge1xuICBzbGVlcCA9IGZuO1xufVxuIiwiaW1wb3J0IHsgQWN0aXZpdHlGYWlsdXJlLCBDYW5jZWxsZWRGYWlsdXJlLCBDaGlsZFdvcmtmbG93RmFpbHVyZSB9IGZyb20gJ0B0ZW1wb3JhbGlvL2NvbW1vbic7XG5pbXBvcnQgeyBTeW1ib2xCYXNlZEluc3RhbmNlT2ZFcnJvciB9IGZyb20gJ0B0ZW1wb3JhbGlvL2NvbW1vbi9saWIvdHlwZS1oZWxwZXJzJztcbmltcG9ydCB7IGNvcmVzZGsgfSBmcm9tICdAdGVtcG9yYWxpby9wcm90byc7XG5cbi8qKlxuICogQmFzZSBjbGFzcyBmb3IgYWxsIHdvcmtmbG93IGVycm9yc1xuICovXG5AU3ltYm9sQmFzZWRJbnN0YW5jZU9mRXJyb3IoJ1dvcmtmbG93RXJyb3InKVxuZXhwb3J0IGNsYXNzIFdvcmtmbG93RXJyb3IgZXh0ZW5kcyBFcnJvciB7fVxuXG4vKipcbiAqIFRocm93biBpbiB3b3JrZmxvdyB3aGVuIGl0IHRyaWVzIHRvIGRvIHNvbWV0aGluZyB0aGF0IG5vbi1kZXRlcm1pbmlzdGljIHN1Y2ggYXMgY29uc3RydWN0IGEgV2Vha1JlZigpXG4gKi9cbkBTeW1ib2xCYXNlZEluc3RhbmNlT2ZFcnJvcignRGV0ZXJtaW5pc21WaW9sYXRpb25FcnJvcicpXG5leHBvcnQgY2xhc3MgRGV0ZXJtaW5pc21WaW9sYXRpb25FcnJvciBleHRlbmRzIFdvcmtmbG93RXJyb3Ige31cblxuLyoqXG4gKiBBIGNsYXNzIHRoYXQgYWN0cyBhcyBhIG1hcmtlciBmb3IgdGhpcyBzcGVjaWFsIHJlc3VsdCB0eXBlXG4gKi9cbkBTeW1ib2xCYXNlZEluc3RhbmNlT2ZFcnJvcignTG9jYWxBY3Rpdml0eURvQmFja29mZicpXG5leHBvcnQgY2xhc3MgTG9jYWxBY3Rpdml0eURvQmFja29mZiBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IocHVibGljIHJlYWRvbmx5IGJhY2tvZmY6IGNvcmVzZGsuYWN0aXZpdHlfcmVzdWx0LklEb0JhY2tvZmYpIHtcbiAgICBzdXBlcigpO1xuICB9XG59XG5cbi8qKlxuICogUmV0dXJucyB3aGV0aGVyIHByb3ZpZGVkIGBlcnJgIGlzIGNhdXNlZCBieSBjYW5jZWxsYXRpb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzQ2FuY2VsbGF0aW9uKGVycjogdW5rbm93bik6IGJvb2xlYW4ge1xuICByZXR1cm4gKFxuICAgIGVyciBpbnN0YW5jZW9mIENhbmNlbGxlZEZhaWx1cmUgfHxcbiAgICAoKGVyciBpbnN0YW5jZW9mIEFjdGl2aXR5RmFpbHVyZSB8fCBlcnIgaW5zdGFuY2VvZiBDaGlsZFdvcmtmbG93RmFpbHVyZSkgJiYgZXJyLmNhdXNlIGluc3RhbmNlb2YgQ2FuY2VsbGVkRmFpbHVyZSlcbiAgKTtcbn1cbiIsImltcG9ydCB0eXBlIHsgV29ya2Zsb3dJbmZvIH0gZnJvbSAnLi9pbnRlcmZhY2VzJztcblxuZXhwb3J0IHR5cGUgU2RrRmxhZyA9IHtcbiAgZ2V0IGlkKCk6IG51bWJlcjtcbiAgZ2V0IGRlZmF1bHQoKTogYm9vbGVhbjtcbiAgZ2V0IGFsdGVybmF0aXZlQ29uZGl0aW9ucygpOiBBbHRDb25kaXRpb25GbltdIHwgdW5kZWZpbmVkO1xufTtcblxuY29uc3QgZmxhZ3NSZWdpc3RyeTogTWFwPG51bWJlciwgU2RrRmxhZz4gPSBuZXcgTWFwKCk7XG5cbmV4cG9ydCBjb25zdCBTZGtGbGFncyA9IHtcbiAgLyoqXG4gICAqIFRoaXMgZmxhZyBnYXRlcyBtdWx0aXBsZSBmaXhlcyByZWxhdGVkIHRvIGNhbmNlbGxhdGlvbiBzY29wZXMgYW5kIHRpbWVycyBpbnRyb2R1Y2VkIGluIDEuMTAuMi8xLjExLjA6XG4gICAqIC0gQ2FuY2VsbGF0aW9uIG9mIGEgbm9uLWNhbmNlbGxhYmxlIHNjb3BlIG5vIGxvbmdlciBwcm9wYWdhdGVzIHRvIGNoaWxkcmVuIHNjb3Blc1xuICAgKiAgIChzZWUgaHR0cHM6Ly9naXRodWIuY29tL3RlbXBvcmFsaW8vc2RrLXR5cGVzY3JpcHQvaXNzdWVzLzE0MjMpLlxuICAgKiAtIENhbmNlbGxhdGlvblNjb3BlLndpdGhUaW1lb3V0KGZuKSBub3cgY2FuY2VsIHRoZSB0aW1lciBpZiBgZm5gIGNvbXBsZXRlcyBiZWZvcmUgZXhwaXJhdGlvblxuICAgKiAgIG9mIHRoZSB0aW1lb3V0LCBzaW1pbGFyIHRvIGhvdyBgY29uZGl0aW9uKGZuLCB0aW1lb3V0KWAgd29ya3MuXG4gICAqIC0gVGltZXJzIGNyZWF0ZWQgdXNpbmcgc2V0VGltZW91dCBjYW4gbm93IGJlIGludGVyY2VwdGVkLlxuICAgKlxuICAgKiBAc2luY2UgSW50cm9kdWNlZCBpbiAxLjEwLjIvMS4xMS4wLiBIb3dldmVyLCBkdWUgdG8gYW4gU0RLIGJ1ZywgU0RLcyB2MS4xMS4wIGFuZCB2MS4xMS4xIHdlcmUgbm90XG4gICAqICAgICAgICBwcm9wZXJseSB3cml0aW5nIGJhY2sgdGhlIGZsYWdzIHRvIGhpc3RvcnksIHBvc3NpYmx5IHJlc3VsdGluZyBpbiBOREUgb24gcmVwbGF5LiBXZSB0aGVyZWZvcmVcbiAgICogICAgICAgIGNvbnNpZGVyIHRoYXQgYSBXRlQgZW1pdHRlZCBieSBXb3JrZXIgdjEuMTEuMCBvciB2MS4xMS4xIHRvIGltcGxpY2l0bHkgaGF2ZSB0aGlzIGZsYWcgb24uXG4gICAqL1xuICBOb25DYW5jZWxsYWJsZVNjb3Blc0FyZVNoaWVsZGVkRnJvbVByb3BhZ2F0aW9uOiBkZWZpbmVGbGFnKDEsIHRydWUsIFtidWlsZElkU2RrVmVyc2lvbk1hdGNoZXMoLzFcXC4xMVxcLlswMV0vKV0pLFxuXG4gIC8qKlxuICAgKiBQcmlvciB0byAxLjExLjAsIHdoZW4gcHJvY2Vzc2luZyBhIFdvcmtmbG93IGFjdGl2YXRpb24sIHRoZSBTREsgd291bGQgZXhlY3V0ZSBgbm90aWZ5SGFzUGF0Y2hgXG4gICAqIGFuZCBgc2lnbmFsV29ya2Zsb3dgIGpvYnMgaW4gZGlzdGluY3QgcGhhc2VzLCBiZWZvcmUgb3RoZXIgdHlwZXMgb2Ygam9icy4gVGhlIHByaW1hcnkgcmVhc29uXG4gICAqIGJlaGluZCB0aGF0IG11bHRpLXBoYXNlIGFsZ29yaXRobSB3YXMgdG8gYXZvaWQgdGhlIHBvc3NpYmlsaXR5IHRoYXQgYSBXb3JrZmxvdyBleGVjdXRpb24gbWlnaHRcbiAgICogY29tcGxldGUgYmVmb3JlIGFsbCBpbmNvbWluZyBzaWduYWxzIGhhdmUgYmVlbiBkaXNwYXRjaGVkIChhdCBsZWFzdCB0byB0aGUgcG9pbnQgdGhhdCB0aGVcbiAgICogX3N5bmNocm9ub3VzXyBwYXJ0IG9mIHRoZSBoYW5kbGVyIGZ1bmN0aW9uIGhhcyBiZWVuIGV4ZWN1dGVkKS5cbiAgICpcbiAgICogVGhpcyBmbGFnIHJlcGxhY2VzIHRoYXQgbXVsdGktcGhhc2UgYWxnb3JpdGhtIHdpdGggYSBzaW1wbGVyIG9uZSB3aGVyZSBqb2JzIGFyZSBzaW1wbHkgc29ydGVkIGFzXG4gICAqIGAoc2lnbmFscyBhbmQgdXBkYXRlcykgLT4gb3RoZXJzYCwgYnV0IHdpdGhvdXQgcHJvY2Vzc2luZyB0aGVtIGFzIGRpc3RpbmN0IGJhdGNoZXMgKGkuZS4gd2l0aG91dFxuICAgKiBsZWF2aW5nL3JlZW50ZXJpbmcgdGhlIFZNIGNvbnRleHQgYmV0d2VlbiBlYWNoIGdyb3VwLCB3aGljaCBhdXRvbWF0aWNhbGx5IHRyaWdnZXJzIHRoZSBleGVjdXRpb25cbiAgICogb2YgYWxsIG91dHN0YW5kaW5nIG1pY3JvdGFza3MpLiBUaGF0IHNpbmdsZS1waGFzZSBhcHByb2FjaCByZXNvbHZlcyBhIG51bWJlciBvZiBxdWlya3Mgb2YgdGhlXG4gICAqIGZvcm1lciBhbGdvcml0aG0sIGFuZCB5ZXQgc3RpbGwgc2F0aXNmaWVzIHRvIHRoZSBvcmlnaW5hbCByZXF1aXJlbWVudCBvZiBlbnN1cmluZyB0aGF0IGV2ZXJ5XG4gICAqIGBzaWduYWxXb3JrZmxvd2Agam9icyAtIGFuZCBub3cgYGRvVXBkYXRlYCBqb2JzIGFzIHdlbGwgLSBoYXZlIGJlZW4gZ2l2ZW4gYSBwcm9wZXIgY2hhbmNlIHRvXG4gICAqIGV4ZWN1dGUgYmVmb3JlIHRoZSBXb3JrZmxvdyBtYWluIGZ1bmN0aW9uIG1pZ2h0IGNvbXBsZXRlcy5cbiAgICpcbiAgICogQHNpbmNlIEludHJvZHVjZWQgaW4gMS4xMS4wLiBUaGlzIGNoYW5nZSBpcyBub3Qgcm9sbGJhY2stc2FmZS4gSG93ZXZlciwgZHVlIHRvIGFuIFNESyBidWcsIFNES3NcbiAgICogICAgICAgIHYxLjExLjAgYW5kIHYxLjExLjEgd2VyZSBub3QgcHJvcGVybHkgd3JpdGluZyBiYWNrIHRoZSBmbGFncyB0byBoaXN0b3J5LCBwb3NzaWJseSByZXN1bHRpbmdcbiAgICogICAgICAgIGluIE5ERSBvbiByZXBsYXkuIFdlIHRoZXJlZm9yZSBjb25zaWRlciB0aGF0IGEgV0ZUIGVtaXR0ZWQgYnkgV29ya2VyIHYxLjExLjAgb3IgdjEuMTEuMVxuICAgKiAgICAgICAgdG8gaW1wbGljaXRlbHkgaGF2ZSB0aGlzIGZsYWcgb24uXG4gICAqL1xuICBQcm9jZXNzV29ya2Zsb3dBY3RpdmF0aW9uSm9ic0FzU2luZ2xlQmF0Y2g6IGRlZmluZUZsYWcoMiwgdHJ1ZSwgW2J1aWxkSWRTZGtWZXJzaW9uTWF0Y2hlcygvMVxcLjExXFwuWzAxXS8pXSksXG59IGFzIGNvbnN0O1xuXG5mdW5jdGlvbiBkZWZpbmVGbGFnKGlkOiBudW1iZXIsIGRlZjogYm9vbGVhbiwgYWx0ZXJuYXRpdmVDb25kaXRpb25zPzogQWx0Q29uZGl0aW9uRm5bXSk6IFNka0ZsYWcge1xuICBjb25zdCBmbGFnID0geyBpZCwgZGVmYXVsdDogZGVmLCBhbHRlcm5hdGl2ZUNvbmRpdGlvbnMgfTtcbiAgZmxhZ3NSZWdpc3RyeS5zZXQoaWQsIGZsYWcpO1xuICByZXR1cm4gZmxhZztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydFZhbGlkRmxhZyhpZDogbnVtYmVyKTogdm9pZCB7XG4gIGlmICghZmxhZ3NSZWdpc3RyeS5oYXMoaWQpKSB0aHJvdyBuZXcgVHlwZUVycm9yKGBVbmtub3duIFNESyBmbGFnOiAke2lkfWApO1xufVxuXG4vKipcbiAqIEFuIFNESyBGbGFnIEFsdGVybmF0ZSBDb25kaXRpb24gcHJvdmlkZXMgYW4gYWx0ZXJuYXRpdmUgd2F5IG9mIGRldGVybWluaW5nIHdoZXRoZXIgYSBmbGFnXG4gKiBzaG91bGQgYmUgY29uc2lkZXJlZCBhcyBlbmFibGVkIGZvciB0aGUgY3VycmVudCBXRlQ7IGUuZy4gYnkgbG9va2luZyBhdCB0aGUgdmVyc2lvbiBvZiB0aGUgU0RLXG4gKiB0aGF0IGVtaXR0ZWQgYSBXRlQuIFRoZSBtYWluIHVzZSBjYXNlIGZvciB0aGlzIGlzIHRvIHJldHJvYWN0aXZlbHkgdHVybiBvbiBzb21lIGZsYWdzIGZvciBXRlRcbiAqIGVtaXR0ZWQgYnkgcHJldmlvdXMgU0RLcyB0aGF0IGNvbnRhaW5lZCBhIGJ1Zy5cbiAqXG4gKiBOb3RlIHRoYXQgY29uZGl0aW9ucyBhcmUgb25seSBldmFsdWF0ZWQgd2hpbGUgcmVwbGF5aW5nLCBhbmQgb25seSBpZiB0aGUgY29ycmVzcG9uaW5nIGZsYWcgaXNcbiAqIG5vdCBhbHJlYWR5IHNldC4gQWxzbywgYWx0ZXJuYXRlIGNvbmRpdGlvbnMgd2lsbCBub3QgY2F1c2UgdGhlIGZsYWcgdG8gYmUgcGVyc2lzdGVkIHRvIHRoZVxuICogXCJ1c2VkIGZsYWdzXCIgc2V0LCB3aGljaCBtZWFucyB0aGF0IGZ1cnRoZXIgV29ya2Zsb3cgVGFza3MgbWF5IG5vdCByZWZsZWN0IHRoaXMgZmxhZyBpZiB0aGVcbiAqIGNvbmRpdGlvbiBubyBsb25nZXIgaG9sZHMuIFRoaXMgaXMgc28gdG8gYXZvaWQgaW5jb3JyZWN0IGJlaGF2aW9ycyBpbiBjYXNlIHdoZXJlIGEgV29ya2Zsb3dcbiAqIEV4ZWN1dGlvbiBoYXMgZ29uZSB0aHJvdWdoIGEgbmV3ZXIgU0RLIHZlcnNpb24gdGhlbiBhZ2FpbiB0aHJvdWdoIGFuIG9sZGVyIG9uZS5cbiAqL1xudHlwZSBBbHRDb25kaXRpb25GbiA9IChjdHg6IHsgaW5mbzogV29ya2Zsb3dJbmZvIH0pID0+IGJvb2xlYW47XG5cbmZ1bmN0aW9uIGJ1aWxkSWRTZGtWZXJzaW9uTWF0Y2hlcyh2ZXJzaW9uOiBSZWdFeHApOiBBbHRDb25kaXRpb25GbiB7XG4gIGNvbnN0IHJlZ2V4ID0gbmV3IFJlZ0V4cChgXkB0ZW1wb3JhbGlvL3dvcmtlckAoJHt2ZXJzaW9uLnNvdXJjZX0pWytdYCk7XG4gIHJldHVybiAoeyBpbmZvIH0pID0+IGluZm8uY3VycmVudEJ1aWxkSWQgIT0gbnVsbCAmJiByZWdleC50ZXN0KGluZm8uY3VycmVudEJ1aWxkSWQpO1xufVxuIiwiaW1wb3J0IHsgSWxsZWdhbFN0YXRlRXJyb3IgfSBmcm9tICdAdGVtcG9yYWxpby9jb21tb24nO1xuaW1wb3J0IHsgdHlwZSBBY3RpdmF0b3IgfSBmcm9tICcuL2ludGVybmFscyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBtYXliZUdldEFjdGl2YXRvclVudHlwZWQoKTogdW5rbm93biB7XG4gIHJldHVybiAoZ2xvYmFsVGhpcyBhcyBhbnkpLl9fVEVNUE9SQUxfQUNUSVZBVE9SX187XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRBY3RpdmF0b3JVbnR5cGVkKGFjdGl2YXRvcjogdW5rbm93bik6IHZvaWQge1xuICAoZ2xvYmFsVGhpcyBhcyBhbnkpLl9fVEVNUE9SQUxfQUNUSVZBVE9SX18gPSBhY3RpdmF0b3I7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYXliZUdldEFjdGl2YXRvcigpOiBBY3RpdmF0b3IgfCB1bmRlZmluZWQge1xuICByZXR1cm4gbWF5YmVHZXRBY3RpdmF0b3JVbnR5cGVkKCkgYXMgQWN0aXZhdG9yIHwgdW5kZWZpbmVkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYXNzZXJ0SW5Xb3JrZmxvd0NvbnRleHQobWVzc2FnZTogc3RyaW5nKTogQWN0aXZhdG9yIHtcbiAgY29uc3QgYWN0aXZhdG9yID0gbWF5YmVHZXRBY3RpdmF0b3IoKTtcbiAgaWYgKGFjdGl2YXRvciA9PSBudWxsKSB0aHJvdyBuZXcgSWxsZWdhbFN0YXRlRXJyb3IobWVzc2FnZSk7XG4gIHJldHVybiBhY3RpdmF0b3I7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRBY3RpdmF0b3IoKTogQWN0aXZhdG9yIHtcbiAgY29uc3QgYWN0aXZhdG9yID0gbWF5YmVHZXRBY3RpdmF0b3IoKTtcbiAgaWYgKGFjdGl2YXRvciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGhyb3cgbmV3IElsbGVnYWxTdGF0ZUVycm9yKCdXb3JrZmxvdyB1bmluaXRpYWxpemVkJyk7XG4gIH1cbiAgcmV0dXJuIGFjdGl2YXRvcjtcbn1cbiIsIi8qKlxuICogT3ZlcnJpZGVzIHNvbWUgZ2xvYmFsIG9iamVjdHMgdG8gbWFrZSB0aGVtIGRldGVybWluaXN0aWMuXG4gKlxuICogQG1vZHVsZVxuICovXG5pbXBvcnQgeyBtc1RvVHMgfSBmcm9tICdAdGVtcG9yYWxpby9jb21tb24vbGliL3RpbWUnO1xuaW1wb3J0IHsgQ2FuY2VsbGF0aW9uU2NvcGUgfSBmcm9tICcuL2NhbmNlbGxhdGlvbi1zY29wZSc7XG5pbXBvcnQgeyBEZXRlcm1pbmlzbVZpb2xhdGlvbkVycm9yIH0gZnJvbSAnLi9lcnJvcnMnO1xuaW1wb3J0IHsgZ2V0QWN0aXZhdG9yIH0gZnJvbSAnLi9nbG9iYWwtYXR0cmlidXRlcyc7XG5pbXBvcnQgeyBTZGtGbGFncyB9IGZyb20gJy4vZmxhZ3MnO1xuaW1wb3J0IHsgc2xlZXAgfSBmcm9tICcuL3dvcmtmbG93JztcbmltcG9ydCB7IHVudHJhY2tQcm9taXNlIH0gZnJvbSAnLi9zdGFjay1oZWxwZXJzJztcblxuY29uc3QgZ2xvYmFsID0gZ2xvYmFsVGhpcyBhcyBhbnk7XG5jb25zdCBPcmlnaW5hbERhdGUgPSBnbG9iYWxUaGlzLkRhdGU7XG5cbmV4cG9ydCBmdW5jdGlvbiBvdmVycmlkZUdsb2JhbHMoKTogdm9pZCB7XG4gIC8vIE1vY2sgYW55IHdlYWsgcmVmZXJlbmNlIGJlY2F1c2UgR0MgaXMgbm9uLWRldGVybWluaXN0aWMgYW5kIHRoZSBlZmZlY3QgaXMgb2JzZXJ2YWJsZSBmcm9tIHRoZSBXb3JrZmxvdy5cbiAgLy8gV29ya2Zsb3cgZGV2ZWxvcGVyIHdpbGwgZ2V0IGEgbWVhbmluZ2Z1bCBleGNlcHRpb24gaWYgdGhleSB0cnkgdG8gdXNlIHRoZXNlLlxuICBnbG9iYWwuV2Vha1JlZiA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aHJvdyBuZXcgRGV0ZXJtaW5pc21WaW9sYXRpb25FcnJvcignV2Vha1JlZiBjYW5ub3QgYmUgdXNlZCBpbiBXb3JrZmxvd3MgYmVjYXVzZSB2OCBHQyBpcyBub24tZGV0ZXJtaW5pc3RpYycpO1xuICB9O1xuICBnbG9iYWwuRmluYWxpemF0aW9uUmVnaXN0cnkgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhyb3cgbmV3IERldGVybWluaXNtVmlvbGF0aW9uRXJyb3IoXG4gICAgICAnRmluYWxpemF0aW9uUmVnaXN0cnkgY2Fubm90IGJlIHVzZWQgaW4gV29ya2Zsb3dzIGJlY2F1c2UgdjggR0MgaXMgbm9uLWRldGVybWluaXN0aWMnXG4gICAgKTtcbiAgfTtcblxuICBnbG9iYWwuRGF0ZSA9IGZ1bmN0aW9uICguLi5hcmdzOiB1bmtub3duW10pIHtcbiAgICBpZiAoYXJncy5sZW5ndGggPiAwKSB7XG4gICAgICByZXR1cm4gbmV3IChPcmlnaW5hbERhdGUgYXMgYW55KSguLi5hcmdzKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBPcmlnaW5hbERhdGUoZ2V0QWN0aXZhdG9yKCkubm93KTtcbiAgfTtcblxuICBnbG9iYWwuRGF0ZS5ub3cgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGdldEFjdGl2YXRvcigpLm5vdztcbiAgfTtcblxuICBnbG9iYWwuRGF0ZS5wYXJzZSA9IE9yaWdpbmFsRGF0ZS5wYXJzZS5iaW5kKE9yaWdpbmFsRGF0ZSk7XG4gIGdsb2JhbC5EYXRlLlVUQyA9IE9yaWdpbmFsRGF0ZS5VVEMuYmluZChPcmlnaW5hbERhdGUpO1xuXG4gIGdsb2JhbC5EYXRlLnByb3RvdHlwZSA9IE9yaWdpbmFsRGF0ZS5wcm90b3R5cGU7XG5cbiAgY29uc3QgdGltZW91dENhbmNlbGF0aW9uU2NvcGVzID0gbmV3IE1hcDxudW1iZXIsIENhbmNlbGxhdGlvblNjb3BlPigpO1xuXG4gIC8qKlxuICAgKiBAcGFyYW0gbXMgc2xlZXAgZHVyYXRpb24gLSAgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcy4gSWYgZ2l2ZW4gYSBuZWdhdGl2ZSBudW1iZXIsIHZhbHVlIHdpbGwgYmUgc2V0IHRvIDEuXG4gICAqL1xuICBnbG9iYWwuc2V0VGltZW91dCA9IGZ1bmN0aW9uIChjYjogKC4uLmFyZ3M6IGFueVtdKSA9PiBhbnksIG1zOiBudW1iZXIsIC4uLmFyZ3M6IGFueVtdKTogbnVtYmVyIHtcbiAgICBtcyA9IE1hdGgubWF4KDEsIG1zKTtcbiAgICBjb25zdCBhY3RpdmF0b3IgPSBnZXRBY3RpdmF0b3IoKTtcbiAgICBpZiAoYWN0aXZhdG9yLmhhc0ZsYWcoU2RrRmxhZ3MuTm9uQ2FuY2VsbGFibGVTY29wZXNBcmVTaGllbGRlZEZyb21Qcm9wYWdhdGlvbikpIHtcbiAgICAgIC8vIENhcHR1cmUgdGhlIHNlcXVlbmNlIG51bWJlciB0aGF0IHNsZWVwIHdpbGwgYWxsb2NhdGVcbiAgICAgIGNvbnN0IHNlcSA9IGFjdGl2YXRvci5uZXh0U2Vxcy50aW1lcjtcbiAgICAgIGNvbnN0IHRpbWVyU2NvcGUgPSBuZXcgQ2FuY2VsbGF0aW9uU2NvcGUoeyBjYW5jZWxsYWJsZTogdHJ1ZSB9KTtcbiAgICAgIGNvbnN0IHNsZWVwUHJvbWlzZSA9IHRpbWVyU2NvcGUucnVuKCgpID0+IHNsZWVwKG1zKSk7XG4gICAgICBzbGVlcFByb21pc2UudGhlbihcbiAgICAgICAgKCkgPT4ge1xuICAgICAgICAgIHRpbWVvdXRDYW5jZWxhdGlvblNjb3Blcy5kZWxldGUoc2VxKTtcbiAgICAgICAgICBjYiguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgKCkgPT4ge1xuICAgICAgICAgIHRpbWVvdXRDYW5jZWxhdGlvblNjb3Blcy5kZWxldGUoc2VxKTtcbiAgICAgICAgfVxuICAgICAgKTtcbiAgICAgIHVudHJhY2tQcm9taXNlKHNsZWVwUHJvbWlzZSk7XG4gICAgICB0aW1lb3V0Q2FuY2VsYXRpb25TY29wZXMuc2V0KHNlcSwgdGltZXJTY29wZSk7XG4gICAgICByZXR1cm4gc2VxO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBzZXEgPSBhY3RpdmF0b3IubmV4dFNlcXMudGltZXIrKztcbiAgICAgIC8vIENyZWF0ZSBhIFByb21pc2UgZm9yIEFzeW5jTG9jYWxTdG9yYWdlIHRvIGJlIGFibGUgdG8gdHJhY2sgdGhpcyBjb21wbGV0aW9uIHVzaW5nIHByb21pc2UgaG9va3MuXG4gICAgICBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIGFjdGl2YXRvci5jb21wbGV0aW9ucy50aW1lci5zZXQoc2VxLCB7IHJlc29sdmUsIHJlamVjdCB9KTtcbiAgICAgICAgYWN0aXZhdG9yLnB1c2hDb21tYW5kKHtcbiAgICAgICAgICBzdGFydFRpbWVyOiB7XG4gICAgICAgICAgICBzZXEsXG4gICAgICAgICAgICBzdGFydFRvRmlyZVRpbWVvdXQ6IG1zVG9UcyhtcyksXG4gICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgICB9KS50aGVuKFxuICAgICAgICAoKSA9PiBjYiguLi5hcmdzKSxcbiAgICAgICAgKCkgPT4gdW5kZWZpbmVkIC8qIGlnbm9yZSBjYW5jZWxsYXRpb24gKi9cbiAgICAgICk7XG4gICAgICByZXR1cm4gc2VxO1xuICAgIH1cbiAgfTtcblxuICBnbG9iYWwuY2xlYXJUaW1lb3V0ID0gZnVuY3Rpb24gKGhhbmRsZTogbnVtYmVyKTogdm9pZCB7XG4gICAgY29uc3QgYWN0aXZhdG9yID0gZ2V0QWN0aXZhdG9yKCk7XG4gICAgY29uc3QgdGltZXJTY29wZSA9IHRpbWVvdXRDYW5jZWxhdGlvblNjb3Blcy5nZXQoaGFuZGxlKTtcbiAgICBpZiAodGltZXJTY29wZSkge1xuICAgICAgdGltZW91dENhbmNlbGF0aW9uU2NvcGVzLmRlbGV0ZShoYW5kbGUpO1xuICAgICAgdGltZXJTY29wZS5jYW5jZWwoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYWN0aXZhdG9yLm5leHRTZXFzLnRpbWVyKys7IC8vIFNob3VsZG4ndCBpbmNyZWFzZSBzZXEgbnVtYmVyLCBidXQgdGhhdCdzIHRoZSBsZWdhY3kgYmVoYXZpb3JcbiAgICAgIGFjdGl2YXRvci5jb21wbGV0aW9ucy50aW1lci5kZWxldGUoaGFuZGxlKTtcbiAgICAgIGFjdGl2YXRvci5wdXNoQ29tbWFuZCh7XG4gICAgICAgIGNhbmNlbFRpbWVyOiB7XG4gICAgICAgICAgc2VxOiBoYW5kbGUsXG4gICAgICAgIH0sXG4gICAgICB9KTtcbiAgICB9XG4gIH07XG5cbiAgLy8gYWN0aXZhdG9yLnJhbmRvbSBpcyBtdXRhYmxlLCBkb24ndCBoYXJkY29kZSBpdHMgcmVmZXJlbmNlXG4gIE1hdGgucmFuZG9tID0gKCkgPT4gZ2V0QWN0aXZhdG9yKCkucmFuZG9tKCk7XG59XG4iLCIvKipcbiAqIFRoaXMgbGlicmFyeSBwcm92aWRlcyB0b29scyByZXF1aXJlZCBmb3IgYXV0aG9yaW5nIHdvcmtmbG93cy5cbiAqXG4gKiAjIyBVc2FnZVxuICogU2VlIHRoZSB7QGxpbmsgaHR0cHM6Ly9kb2NzLnRlbXBvcmFsLmlvL3R5cGVzY3JpcHQvaGVsbG8td29ybGQjd29ya2Zsb3dzIHwgdHV0b3JpYWx9IGZvciB3cml0aW5nIHlvdXIgZmlyc3Qgd29ya2Zsb3cuXG4gKlxuICogIyMjIFRpbWVyc1xuICpcbiAqIFRoZSByZWNvbW1lbmRlZCB3YXkgb2Ygc2NoZWR1bGluZyB0aW1lcnMgaXMgYnkgdXNpbmcgdGhlIHtAbGluayBzbGVlcH0gZnVuY3Rpb24uIFdlJ3ZlIHJlcGxhY2VkIGBzZXRUaW1lb3V0YCBhbmRcbiAqIGBjbGVhclRpbWVvdXRgIHdpdGggZGV0ZXJtaW5pc3RpYyB2ZXJzaW9ucyBzbyB0aGVzZSBhcmUgYWxzbyB1c2FibGUgYnV0IGhhdmUgYSBsaW1pdGF0aW9uIHRoYXQgdGhleSBkb24ndCBwbGF5IHdlbGxcbiAqIHdpdGgge0BsaW5rIGh0dHBzOi8vZG9jcy50ZW1wb3JhbC5pby90eXBlc2NyaXB0L2NhbmNlbGxhdGlvbi1zY29wZXMgfCBjYW5jZWxsYXRpb24gc2NvcGVzfS5cbiAqXG4gKiA8IS0tU05JUFNUQVJUIHR5cGVzY3JpcHQtc2xlZXAtd29ya2Zsb3ctLT5cbiAqIDwhLS1TTklQRU5ELS0+XG4gKlxuICogIyMjIEFjdGl2aXRpZXNcbiAqXG4gKiBUbyBzY2hlZHVsZSBBY3Rpdml0aWVzLCB1c2Uge0BsaW5rIHByb3h5QWN0aXZpdGllc30gdG8gb2J0YWluIGFuIEFjdGl2aXR5IGZ1bmN0aW9uIGFuZCBjYWxsLlxuICpcbiAqIDwhLS1TTklQU1RBUlQgdHlwZXNjcmlwdC1zY2hlZHVsZS1hY3Rpdml0eS13b3JrZmxvdy0tPlxuICogPCEtLVNOSVBFTkQtLT5cbiAqXG4gKiAjIyMgVXBkYXRlcywgU2lnbmFscyBhbmQgUXVlcmllc1xuICpcbiAqIFVzZSB7QGxpbmsgc2V0SGFuZGxlcn0gdG8gc2V0IGhhbmRsZXJzIGZvciBVcGRhdGVzLCBTaWduYWxzLCBhbmQgUXVlcmllcy5cbiAqXG4gKiBVcGRhdGUgYW5kIFNpZ25hbCBoYW5kbGVycyBjYW4gYmUgZWl0aGVyIGFzeW5jIG9yIG5vbi1hc3luYyBmdW5jdGlvbnMuIFVwZGF0ZSBoYW5kbGVycyBtYXkgcmV0dXJuIGEgdmFsdWUsIGJ1dCBzaWduYWxcbiAqIGhhbmRsZXJzIG1heSBub3QgKHJldHVybiBgdm9pZGAgb3IgYFByb21pc2U8dm9pZD5gKS4gWW91IG1heSB1c2UgQWN0aXZpdGllcywgVGltZXJzLCBjaGlsZCBXb3JrZmxvd3MsIGV0YyBpbiBVcGRhdGVcbiAqIGFuZCBTaWduYWwgaGFuZGxlcnMsIGJ1dCB0aGlzIHNob3VsZCBiZSBkb25lIGNhdXRpb3VzbHk6IGZvciBleGFtcGxlLCBub3RlIHRoYXQgaWYgeW91IGF3YWl0IGFzeW5jIG9wZXJhdGlvbnMgc3VjaCBhc1xuICogdGhlc2UgaW4gYW4gVXBkYXRlIG9yIFNpZ25hbCBoYW5kbGVyLCB0aGVuIHlvdSBhcmUgcmVzcG9uc2libGUgZm9yIGVuc3VyaW5nIHRoYXQgdGhlIHdvcmtmbG93IGRvZXMgbm90IGNvbXBsZXRlIGZpcnN0LlxuICpcbiAqIFF1ZXJ5IGhhbmRsZXJzIG1heSAqKm5vdCoqIGJlIGFzeW5jIGZ1bmN0aW9ucywgYW5kIG1heSAqKm5vdCoqIG11dGF0ZSBhbnkgdmFyaWFibGVzIG9yIHVzZSBBY3Rpdml0aWVzLCBUaW1lcnMsXG4gKiBjaGlsZCBXb3JrZmxvd3MsIGV0Yy5cbiAqXG4gKiAjIyMjIEltcGxlbWVudGF0aW9uXG4gKlxuICogPCEtLVNOSVBTVEFSVCB0eXBlc2NyaXB0LXdvcmtmbG93LXVwZGF0ZS1zaWduYWwtcXVlcnktZXhhbXBsZS0tPlxuICogPCEtLVNOSVBFTkQtLT5cbiAqXG4gKiAjIyMgTW9yZVxuICpcbiAqIC0gW0RldGVybWluaXN0aWMgYnVpbHQtaW5zXShodHRwczovL2RvY3MudGVtcG9yYWwuaW8vdHlwZXNjcmlwdC9kZXRlcm1pbmlzbSNzb3VyY2VzLW9mLW5vbi1kZXRlcm1pbmlzbSlcbiAqIC0gW0NhbmNlbGxhdGlvbiBhbmQgc2NvcGVzXShodHRwczovL2RvY3MudGVtcG9yYWwuaW8vdHlwZXNjcmlwdC9jYW5jZWxsYXRpb24tc2NvcGVzKVxuICogICAtIHtAbGluayBDYW5jZWxsYXRpb25TY29wZX1cbiAqICAgLSB7QGxpbmsgVHJpZ2dlcn1cbiAqIC0gW1NpbmtzXShodHRwczovL2RvY3MudGVtcG9yYWwuaW8vYXBwbGljYXRpb24tZGV2ZWxvcG1lbnQvb2JzZXJ2YWJpbGl0eS8/bGFuZz10cyNsb2dnaW5nKVxuICogICAtIHtAbGluayBTaW5rc31cbiAqXG4gKiBAbW9kdWxlXG4gKi9cblxuZXhwb3J0IHtcbiAgQWN0aXZpdHlDYW5jZWxsYXRpb25UeXBlLFxuICBBY3Rpdml0eUZhaWx1cmUsXG4gIEFjdGl2aXR5T3B0aW9ucyxcbiAgQXBwbGljYXRpb25GYWlsdXJlLFxuICBDYW5jZWxsZWRGYWlsdXJlLFxuICBDaGlsZFdvcmtmbG93RmFpbHVyZSxcbiAgZGVmYXVsdFBheWxvYWRDb252ZXJ0ZXIsXG4gIFBheWxvYWRDb252ZXJ0ZXIsXG4gIFJldHJ5UG9saWN5LFxuICByb290Q2F1c2UsXG4gIFNlcnZlckZhaWx1cmUsXG4gIFRlbXBvcmFsRmFpbHVyZSxcbiAgVGVybWluYXRlZEZhaWx1cmUsXG4gIFRpbWVvdXRGYWlsdXJlLFxufSBmcm9tICdAdGVtcG9yYWxpby9jb21tb24nO1xuZXhwb3J0ICogZnJvbSAnQHRlbXBvcmFsaW8vY29tbW9uL2xpYi9lcnJvcnMnO1xuZXhwb3J0IHtcbiAgQWN0aXZpdHlGdW5jdGlvbixcbiAgQWN0aXZpdHlJbnRlcmZhY2UsIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgZGVwcmVjYXRpb24vZGVwcmVjYXRpb25cbiAgUGF5bG9hZCxcbiAgUXVlcnlEZWZpbml0aW9uLFxuICBTZWFyY2hBdHRyaWJ1dGVzLFxuICBTZWFyY2hBdHRyaWJ1dGVWYWx1ZSxcbiAgU2lnbmFsRGVmaW5pdGlvbixcbiAgVW50eXBlZEFjdGl2aXRpZXMsXG4gIFdvcmtmbG93LFxuICBXb3JrZmxvd1F1ZXJ5VHlwZSxcbiAgV29ya2Zsb3dSZXN1bHRUeXBlLFxuICBXb3JrZmxvd1JldHVyblR5cGUsXG4gIFdvcmtmbG93U2lnbmFsVHlwZSxcbn0gZnJvbSAnQHRlbXBvcmFsaW8vY29tbW9uL2xpYi9pbnRlcmZhY2VzJztcbmV4cG9ydCAqIGZyb20gJ0B0ZW1wb3JhbGlvL2NvbW1vbi9saWIvd29ya2Zsb3ctaGFuZGxlJztcbmV4cG9ydCAqIGZyb20gJ0B0ZW1wb3JhbGlvL2NvbW1vbi9saWIvd29ya2Zsb3ctb3B0aW9ucyc7XG5leHBvcnQgeyBBc3luY0xvY2FsU3RvcmFnZSwgQ2FuY2VsbGF0aW9uU2NvcGUsIENhbmNlbGxhdGlvblNjb3BlT3B0aW9ucyB9IGZyb20gJy4vY2FuY2VsbGF0aW9uLXNjb3BlJztcbmV4cG9ydCAqIGZyb20gJy4vZXJyb3JzJztcbmV4cG9ydCAqIGZyb20gJy4vaW50ZXJjZXB0b3JzJztcbmV4cG9ydCB7XG4gIENoaWxkV29ya2Zsb3dDYW5jZWxsYXRpb25UeXBlLFxuICBDaGlsZFdvcmtmbG93T3B0aW9ucyxcbiAgQ29udGludWVBc05ldyxcbiAgQ29udGludWVBc05ld09wdGlvbnMsXG4gIEVuaGFuY2VkU3RhY2tUcmFjZSxcbiAgU3RhY2tUcmFjZUZpbGVMb2NhdGlvbixcbiAgU3RhY2tUcmFjZUZpbGVTbGljZSxcbiAgUGFyZW50Q2xvc2VQb2xpY3ksXG4gIFBhcmVudFdvcmtmbG93SW5mbyxcbiAgU3RhY2tUcmFjZVNES0luZm8sXG4gIFN0YWNrVHJhY2UsXG4gIFVuc2FmZVdvcmtmbG93SW5mbyxcbiAgV29ya2Zsb3dJbmZvLFxufSBmcm9tICcuL2ludGVyZmFjZXMnO1xuZXhwb3J0IHsgcHJveHlTaW5rcywgU2luaywgU2lua0NhbGwsIFNpbmtGdW5jdGlvbiwgU2lua3MgfSBmcm9tICcuL3NpbmtzJztcbmV4cG9ydCB7IGxvZyB9IGZyb20gJy4vbG9ncyc7XG5leHBvcnQgeyBUcmlnZ2VyIH0gZnJvbSAnLi90cmlnZ2VyJztcbmV4cG9ydCAqIGZyb20gJy4vd29ya2Zsb3cnO1xuZXhwb3J0IHsgQ2hpbGRXb3JrZmxvd0hhbmRsZSwgRXh0ZXJuYWxXb3JrZmxvd0hhbmRsZSB9IGZyb20gJy4vd29ya2Zsb3ctaGFuZGxlJztcblxuLy8gQW55dGhpbmcgYmVsb3cgdGhpcyBsaW5lIGlzIGRlcHJlY2F0ZWRcblxuZXhwb3J0IHtcbiAgLyoqXG4gICAqIEBkZXByZWNhdGVkIERvIG5vdCB1c2UgTG9nZ2VyU2lua3MgZGlyZWN0bHkuIFRvIGxvZyBmcm9tIFdvcmtmbG93IGNvZGUsIHVzZSB0aGUgYGxvZ2Agb2JqZWN0XG4gICAqICAgICAgICAgICAgIGV4cG9ydGVkIGJ5IHRoZSBgQHRlbXBvcmFsaW8vd29ya2Zsb3dgIHBhY2thZ2UuIFRvIGNhcHR1cmUgbG9nIG1lc3NhZ2VzIGVtaXR0ZWRcbiAgICogICAgICAgICAgICAgYnkgV29ya2Zsb3cgY29kZSwgc2V0IHRoZSB7QGxpbmsgUnVudGltZS5sb2dnZXJ9IHByb3BlcnR5LlxuICAgKi9cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGRlcHJlY2F0aW9uL2RlcHJlY2F0aW9uXG4gIExvZ2dlclNpbmtzRGVwcmVjYXRlZCBhcyBMb2dnZXJTaW5rcyxcbn0gZnJvbSAnLi9sb2dzJztcbiIsIi8qKlxuICogVHlwZSBkZWZpbml0aW9ucyBhbmQgZ2VuZXJpYyBoZWxwZXJzIGZvciBpbnRlcmNlcHRvcnMuXG4gKlxuICogVGhlIFdvcmtmbG93IHNwZWNpZmljIGludGVyY2VwdG9ycyBhcmUgZGVmaW5lZCBoZXJlLlxuICpcbiAqIEBtb2R1bGVcbiAqL1xuXG5pbXBvcnQgeyBBY3Rpdml0eU9wdGlvbnMsIEhlYWRlcnMsIExvY2FsQWN0aXZpdHlPcHRpb25zLCBOZXh0LCBUaW1lc3RhbXAsIFdvcmtmbG93RXhlY3V0aW9uIH0gZnJvbSAnQHRlbXBvcmFsaW8vY29tbW9uJztcbmltcG9ydCB0eXBlIHsgY29yZXNkayB9IGZyb20gJ0B0ZW1wb3JhbGlvL3Byb3RvJztcbmltcG9ydCB7IENoaWxkV29ya2Zsb3dPcHRpb25zV2l0aERlZmF1bHRzLCBDb250aW51ZUFzTmV3T3B0aW9ucyB9IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5cbmV4cG9ydCB7IE5leHQsIEhlYWRlcnMgfTtcblxuLyoqIElucHV0IGZvciBXb3JrZmxvd0luYm91bmRDYWxsc0ludGVyY2VwdG9yLmV4ZWN1dGUgKi9cbmV4cG9ydCBpbnRlcmZhY2UgV29ya2Zsb3dFeGVjdXRlSW5wdXQge1xuICByZWFkb25seSBhcmdzOiB1bmtub3duW107XG4gIHJlYWRvbmx5IGhlYWRlcnM6IEhlYWRlcnM7XG59XG5cbi8qKiBJbnB1dCBmb3IgV29ya2Zsb3dJbmJvdW5kQ2FsbHNJbnRlcmNlcHRvci5oYW5kbGVVcGRhdGUgYW5kXG4gKiBXb3JrZmxvd0luYm91bmRDYWxsc0ludGVyY2VwdG9yLnZhbGlkYXRlVXBkYXRlICovXG5leHBvcnQgaW50ZXJmYWNlIFVwZGF0ZUlucHV0IHtcbiAgcmVhZG9ubHkgdXBkYXRlSWQ6IHN0cmluZztcbiAgcmVhZG9ubHkgbmFtZTogc3RyaW5nO1xuICByZWFkb25seSBhcmdzOiB1bmtub3duW107XG4gIHJlYWRvbmx5IGhlYWRlcnM6IEhlYWRlcnM7XG59XG5cbi8qKiBJbnB1dCBmb3IgV29ya2Zsb3dJbmJvdW5kQ2FsbHNJbnRlcmNlcHRvci5oYW5kbGVTaWduYWwgKi9cbmV4cG9ydCBpbnRlcmZhY2UgU2lnbmFsSW5wdXQge1xuICByZWFkb25seSBzaWduYWxOYW1lOiBzdHJpbmc7XG4gIHJlYWRvbmx5IGFyZ3M6IHVua25vd25bXTtcbiAgcmVhZG9ubHkgaGVhZGVyczogSGVhZGVycztcbn1cblxuLyoqIElucHV0IGZvciBXb3JrZmxvd0luYm91bmRDYWxsc0ludGVyY2VwdG9yLmhhbmRsZVF1ZXJ5ICovXG5leHBvcnQgaW50ZXJmYWNlIFF1ZXJ5SW5wdXQge1xuICByZWFkb25seSBxdWVyeUlkOiBzdHJpbmc7XG4gIHJlYWRvbmx5IHF1ZXJ5TmFtZTogc3RyaW5nO1xuICByZWFkb25seSBhcmdzOiB1bmtub3duW107XG4gIHJlYWRvbmx5IGhlYWRlcnM6IEhlYWRlcnM7XG59XG5cbi8qKlxuICogSW1wbGVtZW50IGFueSBvZiB0aGVzZSBtZXRob2RzIHRvIGludGVyY2VwdCBXb3JrZmxvdyBpbmJvdW5kIGNhbGxzIGxpa2UgZXhlY3V0aW9uLCBhbmQgc2lnbmFsIGFuZCBxdWVyeSBoYW5kbGluZy5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBXb3JrZmxvd0luYm91bmRDYWxsc0ludGVyY2VwdG9yIHtcbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIFdvcmtmbG93IGV4ZWN1dGUgbWV0aG9kIGlzIGNhbGxlZFxuICAgKlxuICAgKiBAcmV0dXJuIHJlc3VsdCBvZiB0aGUgV29ya2Zsb3cgZXhlY3V0aW9uXG4gICAqL1xuICBleGVjdXRlPzogKGlucHV0OiBXb3JrZmxvd0V4ZWN1dGVJbnB1dCwgbmV4dDogTmV4dDx0aGlzLCAnZXhlY3V0ZSc+KSA9PiBQcm9taXNlPHVua25vd24+O1xuXG4gIC8qKiBDYWxsZWQgd2hlbiBVcGRhdGUgaGFuZGxlciBpcyBjYWxsZWRcbiAgICpcbiAgICogQHJldHVybiByZXN1bHQgb2YgdGhlIFVwZGF0ZVxuICAgKi9cbiAgaGFuZGxlVXBkYXRlPzogKGlucHV0OiBVcGRhdGVJbnB1dCwgbmV4dDogTmV4dDx0aGlzLCAnaGFuZGxlVXBkYXRlJz4pID0+IFByb21pc2U8dW5rbm93bj47XG5cbiAgLyoqIENhbGxlZCB3aGVuIHVwZGF0ZSB2YWxpZGF0b3IgY2FsbGVkICovXG4gIHZhbGlkYXRlVXBkYXRlPzogKGlucHV0OiBVcGRhdGVJbnB1dCwgbmV4dDogTmV4dDx0aGlzLCAndmFsaWRhdGVVcGRhdGUnPikgPT4gdm9pZDtcblxuICAvKiogQ2FsbGVkIHdoZW4gc2lnbmFsIGlzIGRlbGl2ZXJlZCB0byBhIFdvcmtmbG93IGV4ZWN1dGlvbiAqL1xuICBoYW5kbGVTaWduYWw/OiAoaW5wdXQ6IFNpZ25hbElucHV0LCBuZXh0OiBOZXh0PHRoaXMsICdoYW5kbGVTaWduYWwnPikgPT4gUHJvbWlzZTx2b2lkPjtcblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gYSBXb3JrZmxvdyBpcyBxdWVyaWVkXG4gICAqXG4gICAqIEByZXR1cm4gcmVzdWx0IG9mIHRoZSBxdWVyeVxuICAgKi9cbiAgaGFuZGxlUXVlcnk/OiAoaW5wdXQ6IFF1ZXJ5SW5wdXQsIG5leHQ6IE5leHQ8dGhpcywgJ2hhbmRsZVF1ZXJ5Jz4pID0+IFByb21pc2U8dW5rbm93bj47XG59XG5cbi8qKiBJbnB1dCBmb3IgV29ya2Zsb3dPdXRib3VuZENhbGxzSW50ZXJjZXB0b3Iuc2NoZWR1bGVBY3Rpdml0eSAqL1xuZXhwb3J0IGludGVyZmFjZSBBY3Rpdml0eUlucHV0IHtcbiAgcmVhZG9ubHkgYWN0aXZpdHlUeXBlOiBzdHJpbmc7XG4gIHJlYWRvbmx5IGFyZ3M6IHVua25vd25bXTtcbiAgcmVhZG9ubHkgb3B0aW9uczogQWN0aXZpdHlPcHRpb25zO1xuICByZWFkb25seSBoZWFkZXJzOiBIZWFkZXJzO1xuICByZWFkb25seSBzZXE6IG51bWJlcjtcbn1cblxuLyoqIElucHV0IGZvciBXb3JrZmxvd091dGJvdW5kQ2FsbHNJbnRlcmNlcHRvci5zY2hlZHVsZUxvY2FsQWN0aXZpdHkgKi9cbmV4cG9ydCBpbnRlcmZhY2UgTG9jYWxBY3Rpdml0eUlucHV0IHtcbiAgcmVhZG9ubHkgYWN0aXZpdHlUeXBlOiBzdHJpbmc7XG4gIHJlYWRvbmx5IGFyZ3M6IHVua25vd25bXTtcbiAgcmVhZG9ubHkgb3B0aW9uczogTG9jYWxBY3Rpdml0eU9wdGlvbnM7XG4gIHJlYWRvbmx5IGhlYWRlcnM6IEhlYWRlcnM7XG4gIHJlYWRvbmx5IHNlcTogbnVtYmVyO1xuICByZWFkb25seSBvcmlnaW5hbFNjaGVkdWxlVGltZT86IFRpbWVzdGFtcDtcbiAgcmVhZG9ubHkgYXR0ZW1wdDogbnVtYmVyO1xufVxuXG4vKiogSW5wdXQgZm9yIFdvcmtmbG93T3V0Ym91bmRDYWxsc0ludGVyY2VwdG9yLnN0YXJ0Q2hpbGRXb3JrZmxvd0V4ZWN1dGlvbiAqL1xuZXhwb3J0IGludGVyZmFjZSBTdGFydENoaWxkV29ya2Zsb3dFeGVjdXRpb25JbnB1dCB7XG4gIHJlYWRvbmx5IHdvcmtmbG93VHlwZTogc3RyaW5nO1xuICByZWFkb25seSBvcHRpb25zOiBDaGlsZFdvcmtmbG93T3B0aW9uc1dpdGhEZWZhdWx0cztcbiAgcmVhZG9ubHkgaGVhZGVyczogSGVhZGVycztcbiAgcmVhZG9ubHkgc2VxOiBudW1iZXI7XG59XG5cbi8qKiBJbnB1dCBmb3IgV29ya2Zsb3dPdXRib3VuZENhbGxzSW50ZXJjZXB0b3Iuc3RhcnRUaW1lciAqL1xuZXhwb3J0IGludGVyZmFjZSBUaW1lcklucHV0IHtcbiAgcmVhZG9ubHkgZHVyYXRpb25NczogbnVtYmVyO1xuICByZWFkb25seSBzZXE6IG51bWJlcjtcbn1cblxuLyoqXG4gKiBTYW1lIGFzIENvbnRpbnVlQXNOZXdPcHRpb25zIGJ1dCB3b3JrZmxvd1R5cGUgbXVzdCBiZSBkZWZpbmVkXG4gKi9cbmV4cG9ydCB0eXBlIENvbnRpbnVlQXNOZXdJbnB1dE9wdGlvbnMgPSBDb250aW51ZUFzTmV3T3B0aW9ucyAmIFJlcXVpcmVkPFBpY2s8Q29udGludWVBc05ld09wdGlvbnMsICd3b3JrZmxvd1R5cGUnPj47XG5cbi8qKiBJbnB1dCBmb3IgV29ya2Zsb3dPdXRib3VuZENhbGxzSW50ZXJjZXB0b3IuY29udGludWVBc05ldyAqL1xuZXhwb3J0IGludGVyZmFjZSBDb250aW51ZUFzTmV3SW5wdXQge1xuICByZWFkb25seSBhcmdzOiB1bmtub3duW107XG4gIHJlYWRvbmx5IGhlYWRlcnM6IEhlYWRlcnM7XG4gIHJlYWRvbmx5IG9wdGlvbnM6IENvbnRpbnVlQXNOZXdJbnB1dE9wdGlvbnM7XG59XG5cbi8qKiBJbnB1dCBmb3IgV29ya2Zsb3dPdXRib3VuZENhbGxzSW50ZXJjZXB0b3Iuc2lnbmFsV29ya2Zsb3cgKi9cbmV4cG9ydCBpbnRlcmZhY2UgU2lnbmFsV29ya2Zsb3dJbnB1dCB7XG4gIHJlYWRvbmx5IHNlcTogbnVtYmVyO1xuICByZWFkb25seSBzaWduYWxOYW1lOiBzdHJpbmc7XG4gIHJlYWRvbmx5IGFyZ3M6IHVua25vd25bXTtcbiAgcmVhZG9ubHkgaGVhZGVyczogSGVhZGVycztcbiAgcmVhZG9ubHkgdGFyZ2V0OlxuICAgIHwge1xuICAgICAgICByZWFkb25seSB0eXBlOiAnZXh0ZXJuYWwnO1xuICAgICAgICByZWFkb25seSB3b3JrZmxvd0V4ZWN1dGlvbjogV29ya2Zsb3dFeGVjdXRpb247XG4gICAgICB9XG4gICAgfCB7XG4gICAgICAgIHJlYWRvbmx5IHR5cGU6ICdjaGlsZCc7XG4gICAgICAgIHJlYWRvbmx5IGNoaWxkV29ya2Zsb3dJZDogc3RyaW5nO1xuICAgICAgfTtcbn1cblxuLyoqIElucHV0IGZvciBXb3JrZmxvd091dGJvdW5kQ2FsbHNJbnRlcmNlcHRvci5nZXRMb2dBdHRyaWJ1dGVzICovXG5leHBvcnQgdHlwZSBHZXRMb2dBdHRyaWJ1dGVzSW5wdXQgPSBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcblxuLyoqXG4gKiBJbXBsZW1lbnQgYW55IG9mIHRoZXNlIG1ldGhvZHMgdG8gaW50ZXJjZXB0IFdvcmtmbG93IGNvZGUgY2FsbHMgdG8gdGhlIFRlbXBvcmFsIEFQSXMsIGxpa2Ugc2NoZWR1bGluZyBhbiBhY3Rpdml0eSBhbmQgc3RhcnRpbmcgYSB0aW1lclxuICovXG5leHBvcnQgaW50ZXJmYWNlIFdvcmtmbG93T3V0Ym91bmRDYWxsc0ludGVyY2VwdG9yIHtcbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIFdvcmtmbG93IHNjaGVkdWxlcyBhbiBBY3Rpdml0eVxuICAgKlxuICAgKiBAcmV0dXJuIHJlc3VsdCBvZiB0aGUgYWN0aXZpdHkgZXhlY3V0aW9uXG4gICAqL1xuICBzY2hlZHVsZUFjdGl2aXR5PzogKGlucHV0OiBBY3Rpdml0eUlucHV0LCBuZXh0OiBOZXh0PHRoaXMsICdzY2hlZHVsZUFjdGl2aXR5Jz4pID0+IFByb21pc2U8dW5rbm93bj47XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIFdvcmtmbG93IHNjaGVkdWxlcyBhIGxvY2FsIEFjdGl2aXR5XG4gICAqXG4gICAqIEByZXR1cm4gcmVzdWx0IG9mIHRoZSBhY3Rpdml0eSBleGVjdXRpb25cbiAgICovXG4gIHNjaGVkdWxlTG9jYWxBY3Rpdml0eT86IChpbnB1dDogTG9jYWxBY3Rpdml0eUlucHV0LCBuZXh0OiBOZXh0PHRoaXMsICdzY2hlZHVsZUxvY2FsQWN0aXZpdHknPikgPT4gUHJvbWlzZTx1bmtub3duPjtcblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gV29ya2Zsb3cgc3RhcnRzIGEgdGltZXJcbiAgICovXG4gIHN0YXJ0VGltZXI/OiAoaW5wdXQ6IFRpbWVySW5wdXQsIG5leHQ6IE5leHQ8dGhpcywgJ3N0YXJ0VGltZXInPikgPT4gUHJvbWlzZTx2b2lkPjtcblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gV29ya2Zsb3cgY2FsbHMgY29udGludWVBc05ld1xuICAgKi9cbiAgY29udGludWVBc05ldz86IChpbnB1dDogQ29udGludWVBc05ld0lucHV0LCBuZXh0OiBOZXh0PHRoaXMsICdjb250aW51ZUFzTmV3Jz4pID0+IFByb21pc2U8bmV2ZXI+O1xuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiBXb3JrZmxvdyBzaWduYWxzIGEgY2hpbGQgb3IgZXh0ZXJuYWwgV29ya2Zsb3dcbiAgICovXG4gIHNpZ25hbFdvcmtmbG93PzogKGlucHV0OiBTaWduYWxXb3JrZmxvd0lucHV0LCBuZXh0OiBOZXh0PHRoaXMsICdzaWduYWxXb3JrZmxvdyc+KSA9PiBQcm9taXNlPHZvaWQ+O1xuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiBXb3JrZmxvdyBzdGFydHMgYSBjaGlsZCB3b3JrZmxvdyBleGVjdXRpb24sIHRoZSBpbnRlcmNlcHRvciBmdW5jdGlvbiByZXR1cm5zIDIgcHJvbWlzZXM6XG4gICAqXG4gICAqIC0gVGhlIGZpcnN0IHJlc29sdmVzIHdpdGggdGhlIGBydW5JZGAgd2hlbiB0aGUgY2hpbGQgd29ya2Zsb3cgaGFzIHN0YXJ0ZWQgb3IgcmVqZWN0cyBpZiBmYWlsZWQgdG8gc3RhcnQuXG4gICAqIC0gVGhlIHNlY29uZCByZXNvbHZlcyB3aXRoIHRoZSB3b3JrZmxvdyByZXN1bHQgd2hlbiB0aGUgY2hpbGQgd29ya2Zsb3cgY29tcGxldGVzIG9yIHJlamVjdHMgb24gZmFpbHVyZS5cbiAgICovXG4gIHN0YXJ0Q2hpbGRXb3JrZmxvd0V4ZWN1dGlvbj86IChcbiAgICBpbnB1dDogU3RhcnRDaGlsZFdvcmtmbG93RXhlY3V0aW9uSW5wdXQsXG4gICAgbmV4dDogTmV4dDx0aGlzLCAnc3RhcnRDaGlsZFdvcmtmbG93RXhlY3V0aW9uJz5cbiAgKSA9PiBQcm9taXNlPFtQcm9taXNlPHN0cmluZz4sIFByb21pc2U8dW5rbm93bj5dPjtcblxuICAvKipcbiAgICogQ2FsbGVkIG9uIGVhY2ggaW52b2NhdGlvbiBvZiB0aGUgYHdvcmtmbG93LmxvZ2AgbWV0aG9kcy5cbiAgICpcbiAgICogVGhlIGF0dHJpYnV0ZXMgcmV0dXJuZWQgaW4gdGhpcyBjYWxsIGFyZSBhdHRhY2hlZCB0byBldmVyeSBsb2cgbWVzc2FnZS5cbiAgICovXG4gIGdldExvZ0F0dHJpYnV0ZXM/OiAoaW5wdXQ6IEdldExvZ0F0dHJpYnV0ZXNJbnB1dCwgbmV4dDogTmV4dDx0aGlzLCAnZ2V0TG9nQXR0cmlidXRlcyc+KSA9PiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbn1cblxuLyoqIElucHV0IGZvciBXb3JrZmxvd0ludGVybmFsc0ludGVyY2VwdG9yLmNvbmNsdWRlQWN0aXZhdGlvbiAqL1xuZXhwb3J0IGludGVyZmFjZSBDb25jbHVkZUFjdGl2YXRpb25JbnB1dCB7XG4gIGNvbW1hbmRzOiBjb3Jlc2RrLndvcmtmbG93X2NvbW1hbmRzLklXb3JrZmxvd0NvbW1hbmRbXTtcbn1cblxuLyoqIE91dHB1dCBmb3IgV29ya2Zsb3dJbnRlcm5hbHNJbnRlcmNlcHRvci5jb25jbHVkZUFjdGl2YXRpb24gKi9cbmV4cG9ydCB0eXBlIENvbmNsdWRlQWN0aXZhdGlvbk91dHB1dCA9IENvbmNsdWRlQWN0aXZhdGlvbklucHV0O1xuXG4vKiogSW5wdXQgZm9yIFdvcmtmbG93SW50ZXJuYWxzSW50ZXJjZXB0b3IuYWN0aXZhdGUgKi9cbmV4cG9ydCBpbnRlcmZhY2UgQWN0aXZhdGVJbnB1dCB7XG4gIGFjdGl2YXRpb246IGNvcmVzZGsud29ya2Zsb3dfYWN0aXZhdGlvbi5JV29ya2Zsb3dBY3RpdmF0aW9uO1xuICBiYXRjaEluZGV4OiBudW1iZXI7XG59XG5cbi8qKiBJbnB1dCBmb3IgV29ya2Zsb3dJbnRlcm5hbHNJbnRlcmNlcHRvci5kaXNwb3NlICovXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWVtcHR5LWludGVyZmFjZVxuZXhwb3J0IGludGVyZmFjZSBEaXNwb3NlSW5wdXQge31cblxuLyoqXG4gKiBJbnRlcmNlcHRvciBmb3IgdGhlIGludGVybmFscyBvZiB0aGUgV29ya2Zsb3cgcnVudGltZS5cbiAqXG4gKiBVc2UgdG8gbWFuaXB1bGF0ZSBvciB0cmFjZSBXb3JrZmxvdyBhY3RpdmF0aW9ucy5cbiAqXG4gKiBAZXhwZXJpbWVudGFsIFRoaXMgQVBJIGlzIGZvciBhZHZhbmNlZCB1c2UgY2FzZXMgYW5kIG1heSBjaGFuZ2UgaW4gdGhlIGZ1dHVyZS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBXb3JrZmxvd0ludGVybmFsc0ludGVyY2VwdG9yIHtcbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIHRoZSBXb3JrZmxvdyBydW50aW1lIHJ1bnMgYSBXb3JrZmxvd0FjdGl2YXRpb25Kb2IuXG4gICAqL1xuICBhY3RpdmF0ZT8oaW5wdXQ6IEFjdGl2YXRlSW5wdXQsIG5leHQ6IE5leHQ8dGhpcywgJ2FjdGl2YXRlJz4pOiB2b2lkO1xuXG4gIC8qKlxuICAgKiBDYWxsZWQgYWZ0ZXIgYWxsIGBXb3JrZmxvd0FjdGl2YXRpb25Kb2JgcyBoYXZlIGJlZW4gcHJvY2Vzc2VkIGZvciBhbiBhY3RpdmF0aW9uLlxuICAgKlxuICAgKiBDYW4gbWFuaXB1bGF0ZSB0aGUgY29tbWFuZHMgZ2VuZXJhdGVkIGJ5IHRoZSBXb3JrZmxvd1xuICAgKi9cbiAgY29uY2x1ZGVBY3RpdmF0aW9uPyhpbnB1dDogQ29uY2x1ZGVBY3RpdmF0aW9uSW5wdXQsIG5leHQ6IE5leHQ8dGhpcywgJ2NvbmNsdWRlQWN0aXZhdGlvbic+KTogQ29uY2x1ZGVBY3RpdmF0aW9uT3V0cHV0O1xuXG4gIC8qKlxuICAgKiBDYWxsZWQgYmVmb3JlIGRpc3Bvc2luZyB0aGUgV29ya2Zsb3cgaXNvbGF0ZSBjb250ZXh0LlxuICAgKlxuICAgKiBJbXBsZW1lbnQgdGhpcyBtZXRob2QgdG8gcGVyZm9ybSBhbnkgcmVzb3VyY2UgY2xlYW51cC5cbiAgICovXG4gIGRpc3Bvc2U/KGlucHV0OiBEaXNwb3NlSW5wdXQsIG5leHQ6IE5leHQ8dGhpcywgJ2Rpc3Bvc2UnPik6IHZvaWQ7XG59XG5cbi8qKlxuICogQSBtYXBwaW5nIGZyb20gaW50ZXJjZXB0b3IgdHlwZSB0byBhbiBvcHRpb25hbCBsaXN0IG9mIGludGVyY2VwdG9yIGltcGxlbWVudGF0aW9uc1xuICovXG5leHBvcnQgaW50ZXJmYWNlIFdvcmtmbG93SW50ZXJjZXB0b3JzIHtcbiAgaW5ib3VuZD86IFdvcmtmbG93SW5ib3VuZENhbGxzSW50ZXJjZXB0b3JbXTtcbiAgb3V0Ym91bmQ/OiBXb3JrZmxvd091dGJvdW5kQ2FsbHNJbnRlcmNlcHRvcltdO1xuICBpbnRlcm5hbHM/OiBXb3JrZmxvd0ludGVybmFsc0ludGVyY2VwdG9yW107XG59XG5cbi8qKlxuICogQSBmdW5jdGlvbiB0aGF0IHJldHVybnMge0BsaW5rIFdvcmtmbG93SW50ZXJjZXB0b3JzfSBhbmQgdGFrZXMgbm8gYXJndW1lbnRzLlxuICpcbiAqIFdvcmtmbG93IGludGVyY2VwdG9yIG1vZHVsZXMgc2hvdWxkIGV4cG9ydCBhbiBgaW50ZXJjZXB0b3JzYCBmdW5jdGlvbiBvZiB0aGlzIHR5cGUuXG4gKlxuICogQGV4YW1wbGVcbiAqXG4gKiBgYGB0c1xuICogZXhwb3J0IGZ1bmN0aW9uIGludGVyY2VwdG9ycygpOiBXb3JrZmxvd0ludGVyY2VwdG9ycyB7XG4gKiAgIHJldHVybiB7XG4gKiAgICAgaW5ib3VuZDogW10sICAgLy8gUG9wdWxhdGUgd2l0aCBsaXN0IG9mIGludGVyY2VwdG9yIGltcGxlbWVudGF0aW9uc1xuICogICAgIG91dGJvdW5kOiBbXSwgIC8vIFBvcHVsYXRlIHdpdGggbGlzdCBvZiBpbnRlcmNlcHRvciBpbXBsZW1lbnRhdGlvbnNcbiAqICAgICBpbnRlcm5hbHM6IFtdLCAvLyBQb3B1bGF0ZSB3aXRoIGxpc3Qgb2YgaW50ZXJjZXB0b3IgaW1wbGVtZW50YXRpb25zXG4gKiAgIH07XG4gKiB9XG4gKiBgYGBcbiAqL1xuZXhwb3J0IHR5cGUgV29ya2Zsb3dJbnRlcmNlcHRvcnNGYWN0b3J5ID0gKCkgPT4gV29ya2Zsb3dJbnRlcmNlcHRvcnM7XG4iLCJpbXBvcnQgdHlwZSB7IFJhd1NvdXJjZU1hcCB9IGZyb20gJ3NvdXJjZS1tYXAnO1xuaW1wb3J0IHtcbiAgUmV0cnlQb2xpY3ksXG4gIFRlbXBvcmFsRmFpbHVyZSxcbiAgQ29tbW9uV29ya2Zsb3dPcHRpb25zLFxuICBIYW5kbGVyVW5maW5pc2hlZFBvbGljeSxcbiAgU2VhcmNoQXR0cmlidXRlcyxcbiAgU2lnbmFsRGVmaW5pdGlvbixcbiAgVXBkYXRlRGVmaW5pdGlvbixcbiAgUXVlcnlEZWZpbml0aW9uLFxuICBEdXJhdGlvbixcbiAgVmVyc2lvbmluZ0ludGVudCxcbn0gZnJvbSAnQHRlbXBvcmFsaW8vY29tbW9uJztcbmltcG9ydCB7IGNoZWNrRXh0ZW5kcywgU3ltYm9sQmFzZWRJbnN0YW5jZU9mRXJyb3IgfSBmcm9tICdAdGVtcG9yYWxpby9jb21tb24vbGliL3R5cGUtaGVscGVycyc7XG5pbXBvcnQgdHlwZSB7IGNvcmVzZGsgfSBmcm9tICdAdGVtcG9yYWxpby9wcm90byc7XG5cbi8qKlxuICogV29ya2Zsb3cgRXhlY3V0aW9uIGluZm9ybWF0aW9uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgV29ya2Zsb3dJbmZvIHtcbiAgLyoqXG4gICAqIElEIG9mIHRoZSBXb3JrZmxvdywgdGhpcyBjYW4gYmUgc2V0IGJ5IHRoZSBjbGllbnQgZHVyaW5nIFdvcmtmbG93IGNyZWF0aW9uLlxuICAgKiBBIHNpbmdsZSBXb3JrZmxvdyBtYXkgcnVuIG11bHRpcGxlIHRpbWVzIGUuZy4gd2hlbiBzY2hlZHVsZWQgd2l0aCBjcm9uLlxuICAgKi9cbiAgcmVhZG9ubHkgd29ya2Zsb3dJZDogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBJRCBvZiBhIHNpbmdsZSBXb3JrZmxvdyBydW5cbiAgICovXG4gIHJlYWRvbmx5IHJ1bklkOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIFdvcmtmbG93IGZ1bmN0aW9uJ3MgbmFtZVxuICAgKi9cbiAgcmVhZG9ubHkgd29ya2Zsb3dUeXBlOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIEluZGV4ZWQgaW5mb3JtYXRpb24gYXR0YWNoZWQgdG8gdGhlIFdvcmtmbG93IEV4ZWN1dGlvblxuICAgKlxuICAgKiBUaGlzIHZhbHVlIG1heSBjaGFuZ2UgZHVyaW5nIHRoZSBsaWZldGltZSBvZiBhbiBFeGVjdXRpb24uXG4gICAqL1xuICByZWFkb25seSBzZWFyY2hBdHRyaWJ1dGVzOiBTZWFyY2hBdHRyaWJ1dGVzO1xuXG4gIC8qKlxuICAgKiBOb24taW5kZXhlZCBpbmZvcm1hdGlvbiBhdHRhY2hlZCB0byB0aGUgV29ya2Zsb3cgRXhlY3V0aW9uXG4gICAqL1xuICByZWFkb25seSBtZW1vPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG5cbiAgLyoqXG4gICAqIFBhcmVudCBXb3JrZmxvdyBpbmZvIChwcmVzZW50IGlmIHRoaXMgaXMgYSBDaGlsZCBXb3JrZmxvdylcbiAgICovXG4gIHJlYWRvbmx5IHBhcmVudD86IFBhcmVudFdvcmtmbG93SW5mbztcblxuICAvKipcbiAgICogUmVzdWx0IGZyb20gdGhlIHByZXZpb3VzIFJ1biAocHJlc2VudCBpZiB0aGlzIGlzIGEgQ3JvbiBXb3JrZmxvdyBvciB3YXMgQ29udGludWVkIEFzIE5ldykuXG4gICAqXG4gICAqIEFuIGFycmF5IG9mIHZhbHVlcywgc2luY2Ugb3RoZXIgU0RLcyBtYXkgcmV0dXJuIG11bHRpcGxlIHZhbHVlcyBmcm9tIGEgV29ya2Zsb3cuXG4gICAqL1xuICByZWFkb25seSBsYXN0UmVzdWx0PzogdW5rbm93bjtcblxuICAvKipcbiAgICogRmFpbHVyZSBmcm9tIHRoZSBwcmV2aW91cyBSdW4gKHByZXNlbnQgd2hlbiB0aGlzIFJ1biBpcyBhIHJldHJ5LCBvciB0aGUgbGFzdCBSdW4gb2YgYSBDcm9uIFdvcmtmbG93IGZhaWxlZClcbiAgICovXG4gIHJlYWRvbmx5IGxhc3RGYWlsdXJlPzogVGVtcG9yYWxGYWlsdXJlO1xuXG4gIC8qKlxuICAgKiBMZW5ndGggb2YgV29ya2Zsb3cgaGlzdG9yeSB1cCB1bnRpbCB0aGUgY3VycmVudCBXb3JrZmxvdyBUYXNrLlxuICAgKlxuICAgKiBUaGlzIHZhbHVlIGNoYW5nZXMgZHVyaW5nIHRoZSBsaWZldGltZSBvZiBhbiBFeGVjdXRpb24uXG4gICAqXG4gICAqIFlvdSBtYXkgc2FmZWx5IHVzZSB0aGlzIGluZm9ybWF0aW9uIHRvIGRlY2lkZSB3aGVuIHRvIHtAbGluayBjb250aW51ZUFzTmV3fS5cbiAgICovXG4gIHJlYWRvbmx5IGhpc3RvcnlMZW5ndGg6IG51bWJlcjtcblxuICAvKipcbiAgICogU2l6ZSBvZiBXb3JrZmxvdyBoaXN0b3J5IGluIGJ5dGVzIHVudGlsIHRoZSBjdXJyZW50IFdvcmtmbG93IFRhc2suXG4gICAqXG4gICAqIFRoaXMgdmFsdWUgY2hhbmdlcyBkdXJpbmcgdGhlIGxpZmV0aW1lIG9mIGFuIEV4ZWN1dGlvbi5cbiAgICpcbiAgICogU3VwcG9ydGVkIG9ubHkgb24gVGVtcG9yYWwgU2VydmVyIDEuMjArLCBhbHdheXMgemVybyBvbiBvbGRlciBzZXJ2ZXJzLlxuICAgKlxuICAgKiBZb3UgbWF5IHNhZmVseSB1c2UgdGhpcyBpbmZvcm1hdGlvbiB0byBkZWNpZGUgd2hlbiB0byB7QGxpbmsgY29udGludWVBc05ld30uXG4gICAqL1xuICByZWFkb25seSBoaXN0b3J5U2l6ZTogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiBBIGhpbnQgcHJvdmlkZWQgYnkgdGhlIGN1cnJlbnQgV29ya2Zsb3dUYXNrU3RhcnRlZCBldmVudCByZWNvbW1lbmRpbmcgd2hldGhlciB0b1xuICAgKiB7QGxpbmsgY29udGludWVBc05ld30uXG4gICAqXG4gICAqIFRoaXMgdmFsdWUgY2hhbmdlcyBkdXJpbmcgdGhlIGxpZmV0aW1lIG9mIGFuIEV4ZWN1dGlvbi5cbiAgICpcbiAgICogU3VwcG9ydGVkIG9ubHkgb24gVGVtcG9yYWwgU2VydmVyIDEuMjArLCBhbHdheXMgYGZhbHNlYCBvbiBvbGRlciBzZXJ2ZXJzLlxuICAgKi9cbiAgcmVhZG9ubHkgY29udGludWVBc05ld1N1Z2dlc3RlZDogYm9vbGVhbjtcblxuICAvKipcbiAgICogVGFzayBxdWV1ZSB0aGlzIFdvcmtmbG93IGlzIGV4ZWN1dGluZyBvblxuICAgKi9cbiAgcmVhZG9ubHkgdGFza1F1ZXVlOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIE5hbWVzcGFjZSB0aGlzIFdvcmtmbG93IGlzIGV4ZWN1dGluZyBpblxuICAgKi9cbiAgcmVhZG9ubHkgbmFtZXNwYWNlOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIFJ1biBJZCBvZiB0aGUgZmlyc3QgUnVuIGluIHRoaXMgRXhlY3V0aW9uIENoYWluXG4gICAqL1xuICByZWFkb25seSBmaXJzdEV4ZWN1dGlvblJ1bklkOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIFRoZSBsYXN0IFJ1biBJZCBpbiB0aGlzIEV4ZWN1dGlvbiBDaGFpblxuICAgKi9cbiAgcmVhZG9ubHkgY29udGludWVkRnJvbUV4ZWN1dGlvblJ1bklkPzogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBUaW1lIGF0IHdoaWNoIHRoaXMgW1dvcmtmbG93IEV4ZWN1dGlvbiBDaGFpbl0oaHR0cHM6Ly9kb2NzLnRlbXBvcmFsLmlvL3dvcmtmbG93cyN3b3JrZmxvdy1leGVjdXRpb24tY2hhaW4pIHdhcyBzdGFydGVkXG4gICAqL1xuICByZWFkb25seSBzdGFydFRpbWU6IERhdGU7XG5cbiAgLyoqXG4gICAqIFRpbWUgYXQgd2hpY2ggdGhlIGN1cnJlbnQgV29ya2Zsb3cgUnVuIHN0YXJ0ZWRcbiAgICovXG4gIHJlYWRvbmx5IHJ1blN0YXJ0VGltZTogRGF0ZTtcblxuICAvKipcbiAgICogTWlsbGlzZWNvbmRzIGFmdGVyIHdoaWNoIHRoZSBXb3JrZmxvdyBFeGVjdXRpb24gaXMgYXV0b21hdGljYWxseSB0ZXJtaW5hdGVkIGJ5IFRlbXBvcmFsIFNlcnZlci4gU2V0IHZpYSB7QGxpbmsgV29ya2Zsb3dPcHRpb25zLndvcmtmbG93RXhlY3V0aW9uVGltZW91dH0uXG4gICAqL1xuICByZWFkb25seSBleGVjdXRpb25UaW1lb3V0TXM/OiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIFRpbWUgYXQgd2hpY2ggdGhlIFdvcmtmbG93IEV4ZWN1dGlvbiBleHBpcmVzXG4gICAqL1xuICByZWFkb25seSBleGVjdXRpb25FeHBpcmF0aW9uVGltZT86IERhdGU7XG5cbiAgLyoqXG4gICAqIE1pbGxpc2Vjb25kcyBhZnRlciB3aGljaCB0aGUgV29ya2Zsb3cgUnVuIGlzIGF1dG9tYXRpY2FsbHkgdGVybWluYXRlZCBieSBUZW1wb3JhbCBTZXJ2ZXIuIFNldCB2aWEge0BsaW5rIFdvcmtmbG93T3B0aW9ucy53b3JrZmxvd1J1blRpbWVvdXR9LlxuICAgKi9cbiAgcmVhZG9ubHkgcnVuVGltZW91dE1zPzogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiBNYXhpbXVtIGV4ZWN1dGlvbiB0aW1lIG9mIGEgV29ya2Zsb3cgVGFzayBpbiBtaWxsaXNlY29uZHMuIFNldCB2aWEge0BsaW5rIFdvcmtmbG93T3B0aW9ucy53b3JrZmxvd1Rhc2tUaW1lb3V0fS5cbiAgICovXG4gIHJlYWRvbmx5IHRhc2tUaW1lb3V0TXM6IG51bWJlcjtcblxuICAvKipcbiAgICogUmV0cnkgUG9saWN5IGZvciB0aGlzIEV4ZWN1dGlvbi4gU2V0IHZpYSB7QGxpbmsgV29ya2Zsb3dPcHRpb25zLnJldHJ5fS5cbiAgICovXG4gIHJlYWRvbmx5IHJldHJ5UG9saWN5PzogUmV0cnlQb2xpY3k7XG5cbiAgLyoqXG4gICAqIFN0YXJ0cyBhdCAxIGFuZCBpbmNyZW1lbnRzIGZvciBldmVyeSByZXRyeSBpZiB0aGVyZSBpcyBhIGByZXRyeVBvbGljeWBcbiAgICovXG4gIHJlYWRvbmx5IGF0dGVtcHQ6IG51bWJlcjtcblxuICAvKipcbiAgICogQ3JvbiBTY2hlZHVsZSBmb3IgdGhpcyBFeGVjdXRpb24uIFNldCB2aWEge0BsaW5rIFdvcmtmbG93T3B0aW9ucy5jcm9uU2NoZWR1bGV9LlxuICAgKi9cbiAgcmVhZG9ubHkgY3JvblNjaGVkdWxlPzogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBNaWxsaXNlY29uZHMgYmV0d2VlbiBDcm9uIFJ1bnNcbiAgICovXG4gIHJlYWRvbmx5IGNyb25TY2hlZHVsZVRvU2NoZWR1bGVJbnRlcnZhbD86IG51bWJlcjtcblxuICAvKipcbiAgICogVGhlIEJ1aWxkIElEIG9mIHRoZSB3b3JrZXIgd2hpY2ggZXhlY3V0ZWQgdGhlIGN1cnJlbnQgV29ya2Zsb3cgVGFzay4gTWF5IGJlIHVuZGVmaW5lZCBpZiB0aGVcbiAgICogdGFzayB3YXMgY29tcGxldGVkIGJ5IGEgd29ya2VyIHdpdGhvdXQgYSBCdWlsZCBJRC4gSWYgdGhpcyB3b3JrZXIgaXMgdGhlIG9uZSBleGVjdXRpbmcgdGhpc1xuICAgKiB0YXNrIGZvciB0aGUgZmlyc3QgdGltZSBhbmQgaGFzIGEgQnVpbGQgSUQgc2V0LCB0aGVuIGl0cyBJRCB3aWxsIGJlIHVzZWQuIFRoaXMgdmFsdWUgbWF5IGNoYW5nZVxuICAgKiBvdmVyIHRoZSBsaWZldGltZSBvZiB0aGUgd29ya2Zsb3cgcnVuLCBidXQgaXMgZGV0ZXJtaW5pc3RpYyBhbmQgc2FmZSB0byB1c2UgZm9yIGJyYW5jaGluZy5cbiAgICovXG4gIHJlYWRvbmx5IGN1cnJlbnRCdWlsZElkPzogc3RyaW5nO1xuXG4gIHJlYWRvbmx5IHVuc2FmZTogVW5zYWZlV29ya2Zsb3dJbmZvO1xufVxuXG4vKipcbiAqIFVuc2FmZSBpbmZvcm1hdGlvbiBhYm91dCB0aGUgY3VycmVudCBXb3JrZmxvdyBFeGVjdXRpb24uXG4gKlxuICogTmV2ZXIgcmVseSBvbiB0aGlzIGluZm9ybWF0aW9uIGluIFdvcmtmbG93IGxvZ2ljIGFzIGl0IHdpbGwgY2F1c2Ugbm9uLWRldGVybWluaXN0aWMgYmVoYXZpb3IuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgVW5zYWZlV29ya2Zsb3dJbmZvIHtcbiAgLyoqXG4gICAqIEN1cnJlbnQgc3lzdGVtIHRpbWUgaW4gbWlsbGlzZWNvbmRzXG4gICAqXG4gICAqIFRoZSBzYWZlIHZlcnNpb24gb2YgdGltZSBpcyBgbmV3IERhdGUoKWAgYW5kIGBEYXRlLm5vdygpYCwgd2hpY2ggYXJlIHNldCBvbiB0aGUgZmlyc3QgaW52b2NhdGlvbiBvZiBhIFdvcmtmbG93XG4gICAqIFRhc2sgYW5kIHN0YXkgY29uc3RhbnQgZm9yIHRoZSBkdXJhdGlvbiBvZiB0aGUgVGFzayBhbmQgZHVyaW5nIHJlcGxheS5cbiAgICovXG4gIHJlYWRvbmx5IG5vdzogKCkgPT4gbnVtYmVyO1xuXG4gIHJlYWRvbmx5IGlzUmVwbGF5aW5nOiBib29sZWFuO1xufVxuXG4vKipcbiAqIEluZm9ybWF0aW9uIGFib3V0IGEgd29ya2Zsb3cgdXBkYXRlLlxuICpcbiAqIEBleHBlcmltZW50YWxcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBVcGRhdGVJbmZvIHtcbiAgLyoqXG4gICAqICBBIHdvcmtmbG93LXVuaXF1ZSBpZGVudGlmaWVyIGZvciB0aGlzIHVwZGF0ZS5cbiAgICovXG4gIHJlYWRvbmx5IGlkOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqICBUaGUgdXBkYXRlIHR5cGUgbmFtZS5cbiAgICovXG4gIHJlYWRvbmx5IG5hbWU6IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBQYXJlbnRXb3JrZmxvd0luZm8ge1xuICB3b3JrZmxvd0lkOiBzdHJpbmc7XG4gIHJ1bklkOiBzdHJpbmc7XG4gIG5hbWVzcGFjZTogc3RyaW5nO1xufVxuXG4vKipcbiAqIE5vdCBhbiBhY3R1YWwgZXJyb3IsIHVzZWQgYnkgdGhlIFdvcmtmbG93IHJ1bnRpbWUgdG8gYWJvcnQgZXhlY3V0aW9uIHdoZW4ge0BsaW5rIGNvbnRpbnVlQXNOZXd9IGlzIGNhbGxlZFxuICovXG5AU3ltYm9sQmFzZWRJbnN0YW5jZU9mRXJyb3IoJ0NvbnRpbnVlQXNOZXcnKVxuZXhwb3J0IGNsYXNzIENvbnRpbnVlQXNOZXcgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyByZWFkb25seSBjb21tYW5kOiBjb3Jlc2RrLndvcmtmbG93X2NvbW1hbmRzLklDb250aW51ZUFzTmV3V29ya2Zsb3dFeGVjdXRpb24pIHtcbiAgICBzdXBlcignV29ya2Zsb3cgY29udGludWVkIGFzIG5ldycpO1xuICB9XG59XG5cbi8qKlxuICogT3B0aW9ucyBmb3IgY29udGludWluZyBhIFdvcmtmbG93IGFzIG5ld1xuICovXG5leHBvcnQgaW50ZXJmYWNlIENvbnRpbnVlQXNOZXdPcHRpb25zIHtcbiAgLyoqXG4gICAqIEEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgV29ya2Zsb3cgdHlwZSBuYW1lLCBlLmcuIHRoZSBmaWxlbmFtZSBpbiB0aGUgTm9kZS5qcyBTREsgb3IgY2xhc3MgbmFtZSBpbiBKYXZhXG4gICAqL1xuICB3b3JrZmxvd1R5cGU/OiBzdHJpbmc7XG4gIC8qKlxuICAgKiBUYXNrIHF1ZXVlIHRvIGNvbnRpbnVlIHRoZSBXb3JrZmxvdyBpblxuICAgKi9cbiAgdGFza1F1ZXVlPzogc3RyaW5nO1xuICAvKipcbiAgICogVGltZW91dCBmb3IgdGhlIGVudGlyZSBXb3JrZmxvdyBydW5cbiAgICogQGZvcm1hdCB7QGxpbmsgaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvbXMgfCBtcy1mb3JtYXR0ZWQgc3RyaW5nfVxuICAgKi9cbiAgd29ya2Zsb3dSdW5UaW1lb3V0PzogRHVyYXRpb247XG4gIC8qKlxuICAgKiBUaW1lb3V0IGZvciBhIHNpbmdsZSBXb3JrZmxvdyB0YXNrXG4gICAqIEBmb3JtYXQge0BsaW5rIGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL21zIHwgbXMtZm9ybWF0dGVkIHN0cmluZ31cbiAgICovXG4gIHdvcmtmbG93VGFza1RpbWVvdXQ/OiBEdXJhdGlvbjtcbiAgLyoqXG4gICAqIE5vbi1zZWFyY2hhYmxlIGF0dHJpYnV0ZXMgdG8gYXR0YWNoIHRvIG5leHQgV29ya2Zsb3cgcnVuXG4gICAqL1xuICBtZW1vPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gIC8qKlxuICAgKiBTZWFyY2hhYmxlIGF0dHJpYnV0ZXMgdG8gYXR0YWNoIHRvIG5leHQgV29ya2Zsb3cgcnVuXG4gICAqL1xuICBzZWFyY2hBdHRyaWJ1dGVzPzogU2VhcmNoQXR0cmlidXRlcztcbiAgLyoqXG4gICAqIFdoZW4gdXNpbmcgdGhlIFdvcmtlciBWZXJzaW9uaW5nIGZlYXR1cmUsIHNwZWNpZmllcyB3aGV0aGVyIHRoaXMgV29ya2Zsb3cgc2hvdWxkXG4gICAqIENvbnRpbnVlLWFzLU5ldyBvbnRvIGEgd29ya2VyIHdpdGggYSBjb21wYXRpYmxlIEJ1aWxkIElkIG9yIG5vdC4gU2VlIHtAbGluayBWZXJzaW9uaW5nSW50ZW50fS5cbiAgICpcbiAgICogQGRlZmF1bHQgJ0NPTVBBVElCTEUnXG4gICAqXG4gICAqIEBleHBlcmltZW50YWxcbiAgICovXG4gIHZlcnNpb25pbmdJbnRlbnQ/OiBWZXJzaW9uaW5nSW50ZW50O1xufVxuXG4vKipcbiAqIFNwZWNpZmllczpcbiAqIC0gd2hldGhlciBjYW5jZWxsYXRpb24gcmVxdWVzdHMgYXJlIHNlbnQgdG8gdGhlIENoaWxkXG4gKiAtIHdoZXRoZXIgYW5kIHdoZW4gYSB7QGxpbmsgQ2FuY2VsZWRGYWlsdXJlfSBpcyB0aHJvd24gZnJvbSB7QGxpbmsgZXhlY3V0ZUNoaWxkfSBvclxuICogICB7QGxpbmsgQ2hpbGRXb3JrZmxvd0hhbmRsZS5yZXN1bHR9XG4gKlxuICogQGRlZmF1bHQge0BsaW5rIENoaWxkV29ya2Zsb3dDYW5jZWxsYXRpb25UeXBlLldBSVRfQ0FOQ0VMTEFUSU9OX0NPTVBMRVRFRH1cbiAqL1xuZXhwb3J0IGVudW0gQ2hpbGRXb3JrZmxvd0NhbmNlbGxhdGlvblR5cGUge1xuICAvKipcbiAgICogRG9uJ3Qgc2VuZCBhIGNhbmNlbGxhdGlvbiByZXF1ZXN0IHRvIHRoZSBDaGlsZC5cbiAgICovXG4gIEFCQU5ET04gPSAwLFxuXG4gIC8qKlxuICAgKiBTZW5kIGEgY2FuY2VsbGF0aW9uIHJlcXVlc3QgdG8gdGhlIENoaWxkLiBJbW1lZGlhdGVseSB0aHJvdyB0aGUgZXJyb3IuXG4gICAqL1xuICBUUllfQ0FOQ0VMID0gMSxcblxuICAvKipcbiAgICogU2VuZCBhIGNhbmNlbGxhdGlvbiByZXF1ZXN0IHRvIHRoZSBDaGlsZC4gVGhlIENoaWxkIG1heSByZXNwZWN0IGNhbmNlbGxhdGlvbiwgaW4gd2hpY2ggY2FzZSBhbiBlcnJvciB3aWxsIGJlIHRocm93blxuICAgKiB3aGVuIGNhbmNlbGxhdGlvbiBoYXMgY29tcGxldGVkLCBhbmQge0BsaW5rIGlzQ2FuY2VsbGF0aW9ufShlcnJvcikgd2lsbCBiZSB0cnVlLiBPbiB0aGUgb3RoZXIgaGFuZCwgdGhlIENoaWxkIG1heVxuICAgKiBpZ25vcmUgdGhlIGNhbmNlbGxhdGlvbiByZXF1ZXN0LCBpbiB3aGljaCBjYXNlIGFuIGVycm9yIG1pZ2h0IGJlIHRocm93biB3aXRoIGEgZGlmZmVyZW50IGNhdXNlLCBvciB0aGUgQ2hpbGQgbWF5XG4gICAqIGNvbXBsZXRlIHN1Y2Nlc3NmdWxseS5cbiAgICpcbiAgICogQGRlZmF1bHRcbiAgICovXG4gIFdBSVRfQ0FOQ0VMTEFUSU9OX0NPTVBMRVRFRCA9IDIsXG5cbiAgLyoqXG4gICAqIFNlbmQgYSBjYW5jZWxsYXRpb24gcmVxdWVzdCB0byB0aGUgQ2hpbGQuIFRocm93IHRoZSBlcnJvciBvbmNlIHRoZSBTZXJ2ZXIgcmVjZWl2ZXMgdGhlIENoaWxkIGNhbmNlbGxhdGlvbiByZXF1ZXN0LlxuICAgKi9cbiAgV0FJVF9DQU5DRUxMQVRJT05fUkVRVUVTVEVEID0gMyxcbn1cblxuY2hlY2tFeHRlbmRzPGNvcmVzZGsuY2hpbGRfd29ya2Zsb3cuQ2hpbGRXb3JrZmxvd0NhbmNlbGxhdGlvblR5cGUsIENoaWxkV29ya2Zsb3dDYW5jZWxsYXRpb25UeXBlPigpO1xuY2hlY2tFeHRlbmRzPENoaWxkV29ya2Zsb3dDYW5jZWxsYXRpb25UeXBlLCBjb3Jlc2RrLmNoaWxkX3dvcmtmbG93LkNoaWxkV29ya2Zsb3dDYW5jZWxsYXRpb25UeXBlPigpO1xuXG4vKipcbiAqIEhvdyBhIENoaWxkIFdvcmtmbG93IHJlYWN0cyB0byB0aGUgUGFyZW50IFdvcmtmbG93IHJlYWNoaW5nIGEgQ2xvc2VkIHN0YXRlLlxuICpcbiAqIEBzZWUge0BsaW5rIGh0dHBzOi8vZG9jcy50ZW1wb3JhbC5pby9jb25jZXB0cy93aGF0LWlzLWEtcGFyZW50LWNsb3NlLXBvbGljeS8gfCBQYXJlbnQgQ2xvc2UgUG9saWN5fVxuICovXG5leHBvcnQgZW51bSBQYXJlbnRDbG9zZVBvbGljeSB7XG4gIC8qKlxuICAgKiBJZiBhIGBQYXJlbnRDbG9zZVBvbGljeWAgaXMgc2V0IHRvIHRoaXMsIG9yIGlzIG5vdCBzZXQgYXQgYWxsLCB0aGUgc2VydmVyIGRlZmF1bHQgdmFsdWUgd2lsbCBiZSB1c2VkLlxuICAgKi9cbiAgUEFSRU5UX0NMT1NFX1BPTElDWV9VTlNQRUNJRklFRCA9IDAsXG5cbiAgLyoqXG4gICAqIFdoZW4gdGhlIFBhcmVudCBpcyBDbG9zZWQsIHRoZSBDaGlsZCBpcyBUZXJtaW5hdGVkLlxuICAgKlxuICAgKiBAZGVmYXVsdFxuICAgKi9cbiAgUEFSRU5UX0NMT1NFX1BPTElDWV9URVJNSU5BVEUgPSAxLFxuXG4gIC8qKlxuICAgKiBXaGVuIHRoZSBQYXJlbnQgaXMgQ2xvc2VkLCBub3RoaW5nIGlzIGRvbmUgdG8gdGhlIENoaWxkLlxuICAgKi9cbiAgUEFSRU5UX0NMT1NFX1BPTElDWV9BQkFORE9OID0gMixcblxuICAvKipcbiAgICogV2hlbiB0aGUgUGFyZW50IGlzIENsb3NlZCwgdGhlIENoaWxkIGlzIENhbmNlbGxlZC5cbiAgICovXG4gIFBBUkVOVF9DTE9TRV9QT0xJQ1lfUkVRVUVTVF9DQU5DRUwgPSAzLFxufVxuXG5jaGVja0V4dGVuZHM8Y29yZXNkay5jaGlsZF93b3JrZmxvdy5QYXJlbnRDbG9zZVBvbGljeSwgUGFyZW50Q2xvc2VQb2xpY3k+KCk7XG5jaGVja0V4dGVuZHM8UGFyZW50Q2xvc2VQb2xpY3ksIGNvcmVzZGsuY2hpbGRfd29ya2Zsb3cuUGFyZW50Q2xvc2VQb2xpY3k+KCk7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ2hpbGRXb3JrZmxvd09wdGlvbnMgZXh0ZW5kcyBDb21tb25Xb3JrZmxvd09wdGlvbnMge1xuICAvKipcbiAgICogV29ya2Zsb3cgaWQgdG8gdXNlIHdoZW4gc3RhcnRpbmcuIElmIG5vdCBzcGVjaWZpZWQgYSBVVUlEIGlzIGdlbmVyYXRlZC4gTm90ZSB0aGF0IGl0IGlzXG4gICAqIGRhbmdlcm91cyBhcyBpbiBjYXNlIG9mIGNsaWVudCBzaWRlIHJldHJpZXMgbm8gZGVkdXBsaWNhdGlvbiB3aWxsIGhhcHBlbiBiYXNlZCBvbiB0aGVcbiAgICogZ2VuZXJhdGVkIGlkLiBTbyBwcmVmZXIgYXNzaWduaW5nIGJ1c2luZXNzIG1lYW5pbmdmdWwgaWRzIGlmIHBvc3NpYmxlLlxuICAgKi9cbiAgd29ya2Zsb3dJZD86IHN0cmluZztcblxuICAvKipcbiAgICogVGFzayBxdWV1ZSB0byB1c2UgZm9yIFdvcmtmbG93IHRhc2tzLiBJdCBzaG91bGQgbWF0Y2ggYSB0YXNrIHF1ZXVlIHNwZWNpZmllZCB3aGVuIGNyZWF0aW5nIGFcbiAgICogYFdvcmtlcmAgdGhhdCBob3N0cyB0aGUgV29ya2Zsb3cgY29kZS5cbiAgICovXG4gIHRhc2tRdWV1ZT86IHN0cmluZztcblxuICAvKipcbiAgICogU3BlY2lmaWVzOlxuICAgKiAtIHdoZXRoZXIgY2FuY2VsbGF0aW9uIHJlcXVlc3RzIGFyZSBzZW50IHRvIHRoZSBDaGlsZFxuICAgKiAtIHdoZXRoZXIgYW5kIHdoZW4gYW4gZXJyb3IgaXMgdGhyb3duIGZyb20ge0BsaW5rIGV4ZWN1dGVDaGlsZH0gb3JcbiAgICogICB7QGxpbmsgQ2hpbGRXb3JrZmxvd0hhbmRsZS5yZXN1bHR9XG4gICAqXG4gICAqIEBkZWZhdWx0IHtAbGluayBDaGlsZFdvcmtmbG93Q2FuY2VsbGF0aW9uVHlwZS5XQUlUX0NBTkNFTExBVElPTl9DT01QTEVURUR9XG4gICAqL1xuICBjYW5jZWxsYXRpb25UeXBlPzogQ2hpbGRXb3JrZmxvd0NhbmNlbGxhdGlvblR5cGU7XG5cbiAgLyoqXG4gICAqIFNwZWNpZmllcyBob3cgdGhlIENoaWxkIHJlYWN0cyB0byB0aGUgUGFyZW50IFdvcmtmbG93IHJlYWNoaW5nIGEgQ2xvc2VkIHN0YXRlLlxuICAgKlxuICAgKiBAZGVmYXVsdCB7QGxpbmsgUGFyZW50Q2xvc2VQb2xpY3kuUEFSRU5UX0NMT1NFX1BPTElDWV9URVJNSU5BVEV9XG4gICAqL1xuICBwYXJlbnRDbG9zZVBvbGljeT86IFBhcmVudENsb3NlUG9saWN5O1xuXG4gIC8qKlxuICAgKiBXaGVuIHVzaW5nIHRoZSBXb3JrZXIgVmVyc2lvbmluZyBmZWF0dXJlLCBzcGVjaWZpZXMgd2hldGhlciB0aGlzIENoaWxkIFdvcmtmbG93IHNob3VsZCBydW4gb25cbiAgICogYSB3b3JrZXIgd2l0aCBhIGNvbXBhdGlibGUgQnVpbGQgSWQgb3Igbm90LiBTZWUge0BsaW5rIFZlcnNpb25pbmdJbnRlbnR9LlxuICAgKlxuICAgKiBAZGVmYXVsdCAnQ09NUEFUSUJMRSdcbiAgICpcbiAgICogQGV4cGVyaW1lbnRhbFxuICAgKi9cbiAgdmVyc2lvbmluZ0ludGVudD86IFZlcnNpb25pbmdJbnRlbnQ7XG59XG5cbmV4cG9ydCB0eXBlIFJlcXVpcmVkQ2hpbGRXb3JrZmxvd09wdGlvbnMgPSBSZXF1aXJlZDxQaWNrPENoaWxkV29ya2Zsb3dPcHRpb25zLCAnd29ya2Zsb3dJZCcgfCAnY2FuY2VsbGF0aW9uVHlwZSc+PiAmIHtcbiAgYXJnczogdW5rbm93bltdO1xufTtcblxuZXhwb3J0IHR5cGUgQ2hpbGRXb3JrZmxvd09wdGlvbnNXaXRoRGVmYXVsdHMgPSBDaGlsZFdvcmtmbG93T3B0aW9ucyAmIFJlcXVpcmVkQ2hpbGRXb3JrZmxvd09wdGlvbnM7XG5cbmV4cG9ydCBpbnRlcmZhY2UgU3RhY2tUcmFjZVNES0luZm8ge1xuICBuYW1lOiBzdHJpbmc7XG4gIHZlcnNpb246IHN0cmluZztcbn1cblxuLyoqXG4gKiBSZXByZXNlbnRzIGEgc2xpY2Ugb2YgYSBmaWxlIHN0YXJ0aW5nIGF0IGxpbmVPZmZzZXRcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBTdGFja1RyYWNlRmlsZVNsaWNlIHtcbiAgLyoqXG4gICAqIE9ubHkgdXNlZCBwb3NzaWJsZSB0byB0cmltIHRoZSBmaWxlIHdpdGhvdXQgYnJlYWtpbmcgc3ludGF4IGhpZ2hsaWdodGluZy5cbiAgICovXG4gIGxpbmVfb2Zmc2V0OiBudW1iZXI7XG4gIC8qKlxuICAgKiBzbGljZSBvZiBhIGZpbGUgd2l0aCBgXFxuYCAobmV3bGluZSkgbGluZSB0ZXJtaW5hdG9yLlxuICAgKi9cbiAgY29udGVudDogc3RyaW5nO1xufVxuXG4vKipcbiAqIEEgcG9pbnRlciB0byBhIGxvY2F0aW9uIGluIGEgZmlsZVxuICovXG5leHBvcnQgaW50ZXJmYWNlIFN0YWNrVHJhY2VGaWxlTG9jYXRpb24ge1xuICAvKipcbiAgICogUGF0aCB0byBzb3VyY2UgZmlsZSAoYWJzb2x1dGUgb3IgcmVsYXRpdmUpLlxuICAgKiBXaGVuIHVzaW5nIGEgcmVsYXRpdmUgcGF0aCwgbWFrZSBzdXJlIGFsbCBwYXRocyBhcmUgcmVsYXRpdmUgdG8gdGhlIHNhbWUgcm9vdC5cbiAgICovXG4gIGZpbGVfcGF0aD86IHN0cmluZztcbiAgLyoqXG4gICAqIElmIHBvc3NpYmxlLCBTREsgc2hvdWxkIHNlbmQgdGhpcywgcmVxdWlyZWQgZm9yIGRpc3BsYXlpbmcgdGhlIGNvZGUgbG9jYXRpb24uXG4gICAqL1xuICBsaW5lPzogbnVtYmVyO1xuICAvKipcbiAgICogSWYgcG9zc2libGUsIFNESyBzaG91bGQgc2VuZCB0aGlzLlxuICAgKi9cbiAgY29sdW1uPzogbnVtYmVyO1xuICAvKipcbiAgICogRnVuY3Rpb24gbmFtZSB0aGlzIGxpbmUgYmVsb25ncyB0byAoaWYgYXBwbGljYWJsZSkuXG4gICAqIFVzZWQgZm9yIGZhbGxpbmcgYmFjayB0byBzdGFjayB0cmFjZSB2aWV3LlxuICAgKi9cbiAgZnVuY3Rpb25fbmFtZT86IHN0cmluZztcbiAgLyoqXG4gICAqIEZsYWcgdG8gbWFyayB0aGlzIGFzIGludGVybmFsIFNESyBjb2RlIGFuZCBoaWRlIGJ5IGRlZmF1bHQgaW4gdGhlIFVJLlxuICAgKi9cbiAgaW50ZXJuYWxfY29kZTogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBTdGFja1RyYWNlIHtcbiAgbG9jYXRpb25zOiBTdGFja1RyYWNlRmlsZUxvY2F0aW9uW107XG59XG5cbi8qKlxuICogVXNlZCBhcyB0aGUgcmVzdWx0IGZvciB0aGUgZW5oYW5jZWQgc3RhY2sgdHJhY2UgcXVlcnlcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBFbmhhbmNlZFN0YWNrVHJhY2Uge1xuICBzZGs6IFN0YWNrVHJhY2VTREtJbmZvO1xuICAvKipcbiAgICogTWFwcGluZyBvZiBmaWxlIHBhdGggdG8gZmlsZSBjb250ZW50cy5cbiAgICogU0RLIG1heSBjaG9vc2UgdG8gc2VuZCBubywgc29tZSBvciBhbGwgc291cmNlcy5cbiAgICogU291cmNlcyBtaWdodCBiZSB0cmltbWVkLCBhbmQgc29tZSB0aW1lIG9ubHkgdGhlIGZpbGUocykgb2YgdGhlIHRvcCBlbGVtZW50IG9mIHRoZSB0cmFjZSB3aWxsIGJlIHNlbnQuXG4gICAqL1xuICBzb3VyY2VzOiBSZWNvcmQ8c3RyaW5nLCBTdGFja1RyYWNlRmlsZVNsaWNlW10+O1xuICBzdGFja3M6IFN0YWNrVHJhY2VbXTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBXb3JrZmxvd0NyZWF0ZU9wdGlvbnMge1xuICBpbmZvOiBXb3JrZmxvd0luZm87XG4gIHJhbmRvbW5lc3NTZWVkOiBudW1iZXJbXTtcbiAgbm93OiBudW1iZXI7XG4gIHNob3dTdGFja1RyYWNlU291cmNlczogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBXb3JrZmxvd0NyZWF0ZU9wdGlvbnNJbnRlcm5hbCBleHRlbmRzIFdvcmtmbG93Q3JlYXRlT3B0aW9ucyB7XG4gIHNvdXJjZU1hcDogUmF3U291cmNlTWFwO1xuICByZWdpc3RlcmVkQWN0aXZpdHlOYW1lczogU2V0PHN0cmluZz47XG4gIGdldFRpbWVPZkRheSgpOiBiaWdpbnQ7XG59XG5cbi8qKlxuICogQSBoYW5kbGVyIGZ1bmN0aW9uIGNhcGFibGUgb2YgYWNjZXB0aW5nIHRoZSBhcmd1bWVudHMgZm9yIGEgZ2l2ZW4gVXBkYXRlRGVmaW5pdGlvbiwgU2lnbmFsRGVmaW5pdGlvbiBvciBRdWVyeURlZmluaXRpb24uXG4gKi9cbmV4cG9ydCB0eXBlIEhhbmRsZXI8XG4gIFJldCxcbiAgQXJncyBleHRlbmRzIGFueVtdLFxuICBUIGV4dGVuZHMgVXBkYXRlRGVmaW5pdGlvbjxSZXQsIEFyZ3M+IHwgU2lnbmFsRGVmaW5pdGlvbjxBcmdzPiB8IFF1ZXJ5RGVmaW5pdGlvbjxSZXQsIEFyZ3M+LFxuPiA9IFQgZXh0ZW5kcyBVcGRhdGVEZWZpbml0aW9uPGluZmVyIFIsIGluZmVyIEE+XG4gID8gKC4uLmFyZ3M6IEEpID0+IFIgfCBQcm9taXNlPFI+XG4gIDogVCBleHRlbmRzIFNpZ25hbERlZmluaXRpb248aW5mZXIgQT5cbiAgICA/ICguLi5hcmdzOiBBKSA9PiB2b2lkIHwgUHJvbWlzZTx2b2lkPlxuICAgIDogVCBleHRlbmRzIFF1ZXJ5RGVmaW5pdGlvbjxpbmZlciBSLCBpbmZlciBBPlxuICAgICAgPyAoLi4uYXJnczogQSkgPT4gUlxuICAgICAgOiBuZXZlcjtcblxuLyoqXG4gKiBBIGhhbmRsZXIgZnVuY3Rpb24gYWNjZXB0aW5nIHNpZ25hbCBjYWxscyBmb3Igbm9uLXJlZ2lzdGVyZWQgc2lnbmFsIG5hbWVzLlxuICovXG5leHBvcnQgdHlwZSBEZWZhdWx0U2lnbmFsSGFuZGxlciA9IChzaWduYWxOYW1lOiBzdHJpbmcsIC4uLmFyZ3M6IHVua25vd25bXSkgPT4gdm9pZCB8IFByb21pc2U8dm9pZD47XG5cbi8qKlxuICogQSB2YWxpZGF0aW9uIGZ1bmN0aW9uIGNhcGFibGUgb2YgYWNjZXB0aW5nIHRoZSBhcmd1bWVudHMgZm9yIGEgZ2l2ZW4gVXBkYXRlRGVmaW5pdGlvbi5cbiAqL1xuZXhwb3J0IHR5cGUgVXBkYXRlVmFsaWRhdG9yPEFyZ3MgZXh0ZW5kcyBhbnlbXT4gPSAoLi4uYXJnczogQXJncykgPT4gdm9pZDtcblxuLyoqXG4gKiBBIGRlc2NyaXB0aW9uIG9mIGEgcXVlcnkgaGFuZGxlci5cbiAqL1xuZXhwb3J0IHR5cGUgUXVlcnlIYW5kbGVyT3B0aW9ucyA9IHsgZGVzY3JpcHRpb24/OiBzdHJpbmcgfTtcblxuLyoqXG4gKiBBIGRlc2NyaXB0aW9uIG9mIGEgc2lnbmFsIGhhbmRsZXIuXG4gKi9cbmV4cG9ydCB0eXBlIFNpZ25hbEhhbmRsZXJPcHRpb25zID0geyBkZXNjcmlwdGlvbj86IHN0cmluZzsgdW5maW5pc2hlZFBvbGljeT86IEhhbmRsZXJVbmZpbmlzaGVkUG9saWN5IH07XG5cbi8qKlxuICogQSB2YWxpZGF0b3IgYW5kIGRlc2NyaXB0aW9uIG9mIGFuIHVwZGF0ZSBoYW5kbGVyLlxuICovXG5leHBvcnQgdHlwZSBVcGRhdGVIYW5kbGVyT3B0aW9uczxBcmdzIGV4dGVuZHMgYW55W10+ID0ge1xuICB2YWxpZGF0b3I/OiBVcGRhdGVWYWxpZGF0b3I8QXJncz47XG4gIGRlc2NyaXB0aW9uPzogc3RyaW5nO1xuICB1bmZpbmlzaGVkUG9saWN5PzogSGFuZGxlclVuZmluaXNoZWRQb2xpY3k7XG59O1xuXG5leHBvcnQgaW50ZXJmYWNlIEFjdGl2YXRpb25Db21wbGV0aW9uIHtcbiAgY29tbWFuZHM6IGNvcmVzZGsud29ya2Zsb3dfY29tbWFuZHMuSVdvcmtmbG93Q29tbWFuZFtdO1xuICB1c2VkSW50ZXJuYWxGbGFnczogbnVtYmVyW107XG59XG4iLCJpbXBvcnQgdHlwZSB7IFJhd1NvdXJjZU1hcCB9IGZyb20gJ3NvdXJjZS1tYXAnO1xuaW1wb3J0IHtcbiAgZGVmYXVsdEZhaWx1cmVDb252ZXJ0ZXIsXG4gIEZhaWx1cmVDb252ZXJ0ZXIsXG4gIFBheWxvYWRDb252ZXJ0ZXIsXG4gIGFycmF5RnJvbVBheWxvYWRzLFxuICBkZWZhdWx0UGF5bG9hZENvbnZlcnRlcixcbiAgZW5zdXJlVGVtcG9yYWxGYWlsdXJlLFxuICBIYW5kbGVyVW5maW5pc2hlZFBvbGljeSxcbiAgSWxsZWdhbFN0YXRlRXJyb3IsXG4gIFRlbXBvcmFsRmFpbHVyZSxcbiAgV29ya2Zsb3csXG4gIFdvcmtmbG93RXhlY3V0aW9uQWxyZWFkeVN0YXJ0ZWRFcnJvcixcbiAgV29ya2Zsb3dRdWVyeUFubm90YXRlZFR5cGUsXG4gIFdvcmtmbG93U2lnbmFsQW5ub3RhdGVkVHlwZSxcbiAgV29ya2Zsb3dVcGRhdGVBbm5vdGF0ZWRUeXBlLFxuICBQcm90b0ZhaWx1cmUsXG4gIEFwcGxpY2F0aW9uRmFpbHVyZSxcbiAgV29ya2Zsb3dVcGRhdGVUeXBlLFxuICBXb3JrZmxvd1VwZGF0ZVZhbGlkYXRvclR5cGUsXG4gIG1hcEZyb21QYXlsb2FkcyxcbiAgc2VhcmNoQXR0cmlidXRlUGF5bG9hZENvbnZlcnRlcixcbiAgZnJvbVBheWxvYWRzQXRJbmRleCxcbiAgU2VhcmNoQXR0cmlidXRlcyxcbn0gZnJvbSAnQHRlbXBvcmFsaW8vY29tbW9uJztcbmltcG9ydCB7IGNvbXBvc2VJbnRlcmNlcHRvcnMgfSBmcm9tICdAdGVtcG9yYWxpby9jb21tb24vbGliL2ludGVyY2VwdG9ycyc7XG5pbXBvcnQgeyBjaGVja0V4dGVuZHMgfSBmcm9tICdAdGVtcG9yYWxpby9jb21tb24vbGliL3R5cGUtaGVscGVycyc7XG5pbXBvcnQgdHlwZSB7IGNvcmVzZGssIHRlbXBvcmFsIH0gZnJvbSAnQHRlbXBvcmFsaW8vcHJvdG8nO1xuaW1wb3J0IHsgYWxlYSwgUk5HIH0gZnJvbSAnLi9hbGVhJztcbmltcG9ydCB7IFJvb3RDYW5jZWxsYXRpb25TY29wZSB9IGZyb20gJy4vY2FuY2VsbGF0aW9uLXNjb3BlJztcbmltcG9ydCB7IFVwZGF0ZVNjb3BlIH0gZnJvbSAnLi91cGRhdGUtc2NvcGUnO1xuaW1wb3J0IHsgRGV0ZXJtaW5pc21WaW9sYXRpb25FcnJvciwgTG9jYWxBY3Rpdml0eURvQmFja29mZiwgaXNDYW5jZWxsYXRpb24gfSBmcm9tICcuL2Vycm9ycyc7XG5pbXBvcnQgeyBRdWVyeUlucHV0LCBTaWduYWxJbnB1dCwgVXBkYXRlSW5wdXQsIFdvcmtmbG93RXhlY3V0ZUlucHV0LCBXb3JrZmxvd0ludGVyY2VwdG9ycyB9IGZyb20gJy4vaW50ZXJjZXB0b3JzJztcbmltcG9ydCB7XG4gIENvbnRpbnVlQXNOZXcsXG4gIERlZmF1bHRTaWduYWxIYW5kbGVyLFxuICBTdGFja1RyYWNlU0RLSW5mbyxcbiAgU3RhY2tUcmFjZUZpbGVTbGljZSxcbiAgRW5oYW5jZWRTdGFja1RyYWNlLFxuICBTdGFja1RyYWNlRmlsZUxvY2F0aW9uLFxuICBXb3JrZmxvd0luZm8sXG4gIFdvcmtmbG93Q3JlYXRlT3B0aW9uc0ludGVybmFsLFxuICBBY3RpdmF0aW9uQ29tcGxldGlvbixcbn0gZnJvbSAnLi9pbnRlcmZhY2VzJztcbmltcG9ydCB7IHR5cGUgU2lua0NhbGwgfSBmcm9tICcuL3NpbmtzJztcbmltcG9ydCB7IHVudHJhY2tQcm9taXNlIH0gZnJvbSAnLi9zdGFjay1oZWxwZXJzJztcbmltcG9ydCBwa2cgZnJvbSAnLi9wa2cnO1xuaW1wb3J0IHsgU2RrRmxhZywgYXNzZXJ0VmFsaWRGbGFnIH0gZnJvbSAnLi9mbGFncyc7XG5pbXBvcnQgeyBleGVjdXRlV2l0aExpZmVjeWNsZUxvZ2dpbmcsIGxvZyB9IGZyb20gJy4vbG9ncyc7XG5cbmVudW0gU3RhcnRDaGlsZFdvcmtmbG93RXhlY3V0aW9uRmFpbGVkQ2F1c2Uge1xuICBTVEFSVF9DSElMRF9XT1JLRkxPV19FWEVDVVRJT05fRkFJTEVEX0NBVVNFX1VOU1BFQ0lGSUVEID0gMCxcbiAgU1RBUlRfQ0hJTERfV09SS0ZMT1dfRVhFQ1VUSU9OX0ZBSUxFRF9DQVVTRV9XT1JLRkxPV19BTFJFQURZX0VYSVNUUyA9IDEsXG59XG5cbmNoZWNrRXh0ZW5kczxjb3Jlc2RrLmNoaWxkX3dvcmtmbG93LlN0YXJ0Q2hpbGRXb3JrZmxvd0V4ZWN1dGlvbkZhaWxlZENhdXNlLCBTdGFydENoaWxkV29ya2Zsb3dFeGVjdXRpb25GYWlsZWRDYXVzZT4oKTtcbmNoZWNrRXh0ZW5kczxTdGFydENoaWxkV29ya2Zsb3dFeGVjdXRpb25GYWlsZWRDYXVzZSwgY29yZXNkay5jaGlsZF93b3JrZmxvdy5TdGFydENoaWxkV29ya2Zsb3dFeGVjdXRpb25GYWlsZWRDYXVzZT4oKTtcblxuZXhwb3J0IGludGVyZmFjZSBTdGFjayB7XG4gIGZvcm1hdHRlZDogc3RyaW5nO1xuICBzdHJ1Y3R1cmVkOiBTdGFja1RyYWNlRmlsZUxvY2F0aW9uW107XG59XG5cbi8qKlxuICogR2xvYmFsIHN0b3JlIHRvIHRyYWNrIHByb21pc2Ugc3RhY2tzIGZvciBzdGFjayB0cmFjZSBxdWVyeVxuICovXG5leHBvcnQgaW50ZXJmYWNlIFByb21pc2VTdGFja1N0b3JlIHtcbiAgY2hpbGRUb1BhcmVudDogTWFwPFByb21pc2U8dW5rbm93bj4sIFNldDxQcm9taXNlPHVua25vd24+Pj47XG4gIHByb21pc2VUb1N0YWNrOiBNYXA8UHJvbWlzZTx1bmtub3duPiwgU3RhY2s+O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIENvbXBsZXRpb24ge1xuICByZXNvbHZlKHZhbDogdW5rbm93bik6IHVua25vd247XG5cbiAgcmVqZWN0KHJlYXNvbjogdW5rbm93bik6IHVua25vd247XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29uZGl0aW9uIHtcbiAgZm4oKTogYm9vbGVhbjtcblxuICByZXNvbHZlKCk6IHZvaWQ7XG59XG5cbmV4cG9ydCB0eXBlIEFjdGl2YXRpb25IYW5kbGVyRnVuY3Rpb248SyBleHRlbmRzIGtleW9mIGNvcmVzZGsud29ya2Zsb3dfYWN0aXZhdGlvbi5JV29ya2Zsb3dBY3RpdmF0aW9uSm9iPiA9IChcbiAgYWN0aXZhdGlvbjogTm9uTnVsbGFibGU8Y29yZXNkay53b3JrZmxvd19hY3RpdmF0aW9uLklXb3JrZmxvd0FjdGl2YXRpb25Kb2JbS10+XG4pID0+IHZvaWQ7XG5cbi8qKlxuICogVmVyaWZpZXMgYWxsIGFjdGl2YXRpb24gam9iIGhhbmRsaW5nIG1ldGhvZHMgYXJlIGltcGxlbWVudGVkXG4gKi9cbmV4cG9ydCB0eXBlIEFjdGl2YXRpb25IYW5kbGVyID0ge1xuICBbUCBpbiBrZXlvZiBjb3Jlc2RrLndvcmtmbG93X2FjdGl2YXRpb24uSVdvcmtmbG93QWN0aXZhdGlvbkpvYl06IEFjdGl2YXRpb25IYW5kbGVyRnVuY3Rpb248UD47XG59O1xuXG4vKipcbiAqIEluZm9ybWF0aW9uIGFib3V0IGFuIHVwZGF0ZSBvciBzaWduYWwgaGFuZGxlciBleGVjdXRpb24uXG4gKi9cbmludGVyZmFjZSBNZXNzYWdlSGFuZGxlckV4ZWN1dGlvbiB7XG4gIG5hbWU6IHN0cmluZztcbiAgdW5maW5pc2hlZFBvbGljeTogSGFuZGxlclVuZmluaXNoZWRQb2xpY3k7XG4gIGlkPzogc3RyaW5nO1xufVxuXG4vKipcbiAqIEtlZXBzIGFsbCBvZiB0aGUgV29ya2Zsb3cgcnVudGltZSBzdGF0ZSBsaWtlIHBlbmRpbmcgY29tcGxldGlvbnMgZm9yIGFjdGl2aXRpZXMgYW5kIHRpbWVycy5cbiAqXG4gKiBJbXBsZW1lbnRzIGhhbmRsZXJzIGZvciBhbGwgd29ya2Zsb3cgYWN0aXZhdGlvbiBqb2JzLlxuICpcbiAqIE5vdGUgdGhhdCBtb3N0IG1ldGhvZHMgaW4gdGhpcyBjbGFzcyBhcmUgbWVhbnQgdG8gYmUgY2FsbGVkIG9ubHkgZnJvbSB3aXRoaW4gdGhlIFZNLlxuICpcbiAqIEhvd2V2ZXIsIGEgZmV3IG1ldGhvZHMgbWF5IGJlIGNhbGxlZCBkaXJlY3RseSBmcm9tIG91dHNpZGUgdGhlIFZNIChlc3NlbnRpYWxseSBmcm9tIGB2bS1zaGFyZWQudHNgKS5cbiAqIFRoZXNlIG1ldGhvZHMgYXJlIHNwZWNpZmljYWxseSBtYXJrZWQgd2l0aCBhIGNvbW1lbnQgYW5kIHJlcXVpcmUgY2FyZWZ1bCBjb25zaWRlcmF0aW9uLCBhcyB0aGVcbiAqIGV4ZWN1dGlvbiBjb250ZXh0IG1heSBub3QgcHJvcGVybHkgcmVmbGVjdCB0aGF0IG9mIHRoZSB0YXJnZXQgd29ya2Zsb3cgZXhlY3V0aW9uIChlLmcuOiB3aXRoIFJldXNhYmxlXG4gKiBWTXMsIHRoZSBgZ2xvYmFsYCBtYXkgbm90IGhhdmUgYmVlbiBzd2FwcGVkIHRvIHRob3NlIG9mIHRoYXQgd29ya2Zsb3cgZXhlY3V0aW9uOyB0aGUgYWN0aXZlIG1pY3JvdGFza1xuICogcXVldWUgbWF5IGJlIHRoYXQgb2YgdGhlIHRocmVhZC9wcm9jZXNzLCByYXRoZXIgdGhhbiB0aGUgcXVldWUgb2YgdGhhdCBWTSBjb250ZXh0OyBldGMpLiBDb25zZXF1ZW50bHksXG4gKiBtZXRob2RzIHRoYXQgYXJlIG1lYW50IHRvIGJlIGNhbGxlZCBmcm9tIG91dHNpZGUgb2YgdGhlIFZNIG11c3Qgbm90IGRvIGFueSBvZiB0aGUgZm9sbG93aW5nOlxuICpcbiAqIC0gQWNjZXNzIGFueSBnbG9iYWwgdmFyaWFibGU7XG4gKiAtIENyZWF0ZSBQcm9taXNlIG9iamVjdHMsIHVzZSBhc3luYy9hd2FpdCwgb3Igb3RoZXJ3aXNlIHNjaGVkdWxlIG1pY3JvdGFza3M7XG4gKiAtIENhbGwgdXNlci1kZWZpbmVkIGZ1bmN0aW9ucywgaW5jbHVkaW5nIGFueSBmb3JtIG9mIGludGVyY2VwdG9yLlxuICovXG5leHBvcnQgY2xhc3MgQWN0aXZhdG9yIGltcGxlbWVudHMgQWN0aXZhdGlvbkhhbmRsZXIge1xuICAvKipcbiAgICogQ2FjaGUgZm9yIG1vZHVsZXMgLSByZWZlcmVuY2VkIGluIHJldXNhYmxlLXZtLnRzXG4gICAqL1xuICByZWFkb25seSBtb2R1bGVDYWNoZSA9IG5ldyBNYXA8c3RyaW5nLCB1bmtub3duPigpO1xuICAvKipcbiAgICogTWFwIG9mIHRhc2sgc2VxdWVuY2UgdG8gYSBDb21wbGV0aW9uXG4gICAqL1xuICByZWFkb25seSBjb21wbGV0aW9ucyA9IHtcbiAgICB0aW1lcjogbmV3IE1hcDxudW1iZXIsIENvbXBsZXRpb24+KCksXG4gICAgYWN0aXZpdHk6IG5ldyBNYXA8bnVtYmVyLCBDb21wbGV0aW9uPigpLFxuICAgIGNoaWxkV29ya2Zsb3dTdGFydDogbmV3IE1hcDxudW1iZXIsIENvbXBsZXRpb24+KCksXG4gICAgY2hpbGRXb3JrZmxvd0NvbXBsZXRlOiBuZXcgTWFwPG51bWJlciwgQ29tcGxldGlvbj4oKSxcbiAgICBzaWduYWxXb3JrZmxvdzogbmV3IE1hcDxudW1iZXIsIENvbXBsZXRpb24+KCksXG4gICAgY2FuY2VsV29ya2Zsb3c6IG5ldyBNYXA8bnVtYmVyLCBDb21wbGV0aW9uPigpLFxuICB9O1xuXG4gIC8qKlxuICAgKiBIb2xkcyBidWZmZXJlZCBVcGRhdGUgY2FsbHMgdW50aWwgYSBoYW5kbGVyIGlzIHJlZ2lzdGVyZWRcbiAgICovXG4gIHJlYWRvbmx5IGJ1ZmZlcmVkVXBkYXRlcyA9IEFycmF5PGNvcmVzZGsud29ya2Zsb3dfYWN0aXZhdGlvbi5JRG9VcGRhdGU+KCk7XG5cbiAgLyoqXG4gICAqIEhvbGRzIGJ1ZmZlcmVkIHNpZ25hbCBjYWxscyB1bnRpbCBhIGhhbmRsZXIgaXMgcmVnaXN0ZXJlZFxuICAgKi9cbiAgcmVhZG9ubHkgYnVmZmVyZWRTaWduYWxzID0gQXJyYXk8Y29yZXNkay53b3JrZmxvd19hY3RpdmF0aW9uLklTaWduYWxXb3JrZmxvdz4oKTtcblxuICAvKipcbiAgICogTWFwcGluZyBvZiB1cGRhdGUgbmFtZSB0byBoYW5kbGVyIGFuZCB2YWxpZGF0b3JcbiAgICovXG4gIHJlYWRvbmx5IHVwZGF0ZUhhbmRsZXJzID0gbmV3IE1hcDxzdHJpbmcsIFdvcmtmbG93VXBkYXRlQW5ub3RhdGVkVHlwZT4oKTtcblxuICAvKipcbiAgICogTWFwcGluZyBvZiBzaWduYWwgbmFtZSB0byBoYW5kbGVyXG4gICAqL1xuICByZWFkb25seSBzaWduYWxIYW5kbGVycyA9IG5ldyBNYXA8c3RyaW5nLCBXb3JrZmxvd1NpZ25hbEFubm90YXRlZFR5cGU+KCk7XG5cbiAgLyoqXG4gICAqIE1hcHBpbmcgb2YgaW4tcHJvZ3Jlc3MgdXBkYXRlcyB0byBoYW5kbGVyIGV4ZWN1dGlvbiBpbmZvcm1hdGlvbi5cbiAgICovXG4gIHJlYWRvbmx5IGluUHJvZ3Jlc3NVcGRhdGVzID0gbmV3IE1hcDxzdHJpbmcsIE1lc3NhZ2VIYW5kbGVyRXhlY3V0aW9uPigpO1xuXG4gIC8qKlxuICAgKiBNYXBwaW5nIG9mIGluLXByb2dyZXNzIHNpZ25hbHMgdG8gaGFuZGxlciBleGVjdXRpb24gaW5mb3JtYXRpb24uXG4gICAqL1xuICByZWFkb25seSBpblByb2dyZXNzU2lnbmFscyA9IG5ldyBNYXA8bnVtYmVyLCBNZXNzYWdlSGFuZGxlckV4ZWN1dGlvbj4oKTtcblxuICAvKipcbiAgICogQSBzZXF1ZW5jZSBudW1iZXIgcHJvdmlkaW5nIHVuaXF1ZSBpZGVudGlmaWVycyBmb3Igc2lnbmFsIGhhbmRsZXIgZXhlY3V0aW9ucy5cbiAgICovXG4gIHByb3RlY3RlZCBzaWduYWxIYW5kbGVyRXhlY3V0aW9uU2VxID0gMDtcblxuICAvKipcbiAgICogQSBzaWduYWwgaGFuZGxlciB0aGF0IGNhdGNoZXMgY2FsbHMgZm9yIG5vbi1yZWdpc3RlcmVkIHNpZ25hbCBuYW1lcy5cbiAgICovXG4gIGRlZmF1bHRTaWduYWxIYW5kbGVyPzogRGVmYXVsdFNpZ25hbEhhbmRsZXI7XG5cbiAgLyoqXG4gICAqIFNvdXJjZSBtYXAgZmlsZSBmb3IgbG9va2luZyB1cCB0aGUgc291cmNlIGZpbGVzIGluIHJlc3BvbnNlIHRvIF9fZW5oYW5jZWRfc3RhY2tfdHJhY2VcbiAgICovXG4gIHByb3RlY3RlZCByZWFkb25seSBzb3VyY2VNYXA6IFJhd1NvdXJjZU1hcDtcblxuICAvKipcbiAgICogV2hldGhlciBvciBub3QgdG8gc2VuZCB0aGUgc291cmNlcyBpbiBlbmhhbmNlZCBzdGFjayB0cmFjZSBxdWVyeSByZXNwb25zZXNcbiAgICovXG4gIHByb3RlY3RlZCByZWFkb25seSBzaG93U3RhY2tUcmFjZVNvdXJjZXM7XG5cbiAgcmVhZG9ubHkgcHJvbWlzZVN0YWNrU3RvcmU6IFByb21pc2VTdGFja1N0b3JlID0ge1xuICAgIHByb21pc2VUb1N0YWNrOiBuZXcgTWFwKCksXG4gICAgY2hpbGRUb1BhcmVudDogbmV3IE1hcCgpLFxuICB9O1xuXG4gIHB1YmxpYyByZWFkb25seSByb290U2NvcGUgPSBuZXcgUm9vdENhbmNlbGxhdGlvblNjb3BlKCk7XG5cbiAgLyoqXG4gICAqIE1hcHBpbmcgb2YgcXVlcnkgbmFtZSB0byBoYW5kbGVyXG4gICAqL1xuICBwdWJsaWMgcmVhZG9ubHkgcXVlcnlIYW5kbGVycyA9IG5ldyBNYXA8c3RyaW5nLCBXb3JrZmxvd1F1ZXJ5QW5ub3RhdGVkVHlwZT4oW1xuICAgIFtcbiAgICAgICdfX3N0YWNrX3RyYWNlJyxcbiAgICAgIHtcbiAgICAgICAgaGFuZGxlcjogKCkgPT4ge1xuICAgICAgICAgIHJldHVybiB0aGlzLmdldFN0YWNrVHJhY2VzKClcbiAgICAgICAgICAgIC5tYXAoKHMpID0+IHMuZm9ybWF0dGVkKVxuICAgICAgICAgICAgLmpvaW4oJ1xcblxcbicpO1xuICAgICAgICB9LFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1JldHVybnMgYSBzZW5zaWJsZSBzdGFjayB0cmFjZS4nLFxuICAgICAgfSxcbiAgICBdLFxuICAgIFtcbiAgICAgICdfX2VuaGFuY2VkX3N0YWNrX3RyYWNlJyxcbiAgICAgIHtcbiAgICAgICAgaGFuZGxlcjogKCk6IEVuaGFuY2VkU3RhY2tUcmFjZSA9PiB7XG4gICAgICAgICAgY29uc3QgeyBzb3VyY2VNYXAgfSA9IHRoaXM7XG4gICAgICAgICAgY29uc3Qgc2RrOiBTdGFja1RyYWNlU0RLSW5mbyA9IHsgbmFtZTogJ3R5cGVzY3JpcHQnLCB2ZXJzaW9uOiBwa2cudmVyc2lvbiB9O1xuICAgICAgICAgIGNvbnN0IHN0YWNrcyA9IHRoaXMuZ2V0U3RhY2tUcmFjZXMoKS5tYXAoKHsgc3RydWN0dXJlZDogbG9jYXRpb25zIH0pID0+ICh7IGxvY2F0aW9ucyB9KSk7XG4gICAgICAgICAgY29uc3Qgc291cmNlczogUmVjb3JkPHN0cmluZywgU3RhY2tUcmFjZUZpbGVTbGljZVtdPiA9IHt9O1xuICAgICAgICAgIGlmICh0aGlzLnNob3dTdGFja1RyYWNlU291cmNlcykge1xuICAgICAgICAgICAgZm9yIChjb25zdCB7IGxvY2F0aW9ucyB9IG9mIHN0YWNrcykge1xuICAgICAgICAgICAgICBmb3IgKGNvbnN0IHsgZmlsZV9wYXRoIH0gb2YgbG9jYXRpb25zKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFmaWxlX3BhdGgpIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbnRlbnQgPSBzb3VyY2VNYXA/LnNvdXJjZXNDb250ZW50Py5bc291cmNlTWFwPy5zb3VyY2VzLmluZGV4T2YoZmlsZV9wYXRoKV07XG4gICAgICAgICAgICAgICAgaWYgKCFjb250ZW50KSBjb250aW51ZTtcbiAgICAgICAgICAgICAgICBzb3VyY2VzW2ZpbGVfcGF0aF0gPSBbXG4gICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGxpbmVfb2Zmc2V0OiAwLFxuICAgICAgICAgICAgICAgICAgICBjb250ZW50LFxuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB7IHNkaywgc3RhY2tzLCBzb3VyY2VzIH07XG4gICAgICAgIH0sXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnUmV0dXJucyBhIHN0YWNrIHRyYWNlIGFubm90YXRlZCB3aXRoIHNvdXJjZSBpbmZvcm1hdGlvbi4nLFxuICAgICAgfSxcbiAgICBdLFxuICAgIFtcbiAgICAgICdfX3RlbXBvcmFsX3dvcmtmbG93X21ldGFkYXRhJyxcbiAgICAgIHtcbiAgICAgICAgaGFuZGxlcjogKCk6IHRlbXBvcmFsLmFwaS5zZGsudjEuSVdvcmtmbG93TWV0YWRhdGEgPT4ge1xuICAgICAgICAgIGNvbnN0IHdvcmtmbG93VHlwZSA9IHRoaXMuaW5mby53b3JrZmxvd1R5cGU7XG4gICAgICAgICAgY29uc3QgcXVlcnlEZWZpbml0aW9ucyA9IEFycmF5LmZyb20odGhpcy5xdWVyeUhhbmRsZXJzLmVudHJpZXMoKSkubWFwKChbbmFtZSwgdmFsdWVdKSA9PiAoe1xuICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiB2YWx1ZS5kZXNjcmlwdGlvbixcbiAgICAgICAgICB9KSk7XG4gICAgICAgICAgY29uc3Qgc2lnbmFsRGVmaW5pdGlvbnMgPSBBcnJheS5mcm9tKHRoaXMuc2lnbmFsSGFuZGxlcnMuZW50cmllcygpKS5tYXAoKFtuYW1lLCB2YWx1ZV0pID0+ICh7XG4gICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IHZhbHVlLmRlc2NyaXB0aW9uLFxuICAgICAgICAgIH0pKTtcbiAgICAgICAgICBjb25zdCB1cGRhdGVEZWZpbml0aW9ucyA9IEFycmF5LmZyb20odGhpcy51cGRhdGVIYW5kbGVycy5lbnRyaWVzKCkpLm1hcCgoW25hbWUsIHZhbHVlXSkgPT4gKHtcbiAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogdmFsdWUuZGVzY3JpcHRpb24sXG4gICAgICAgICAgfSkpO1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBkZWZpbml0aW9uOiB7XG4gICAgICAgICAgICAgIHR5cGU6IHdvcmtmbG93VHlwZSxcbiAgICAgICAgICAgICAgcXVlcnlEZWZpbml0aW9ucyxcbiAgICAgICAgICAgICAgc2lnbmFsRGVmaW5pdGlvbnMsXG4gICAgICAgICAgICAgIHVwZGF0ZURlZmluaXRpb25zLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1JldHVybnMgbWV0YWRhdGEgYXNzb2NpYXRlZCB3aXRoIHRoaXMgd29ya2Zsb3cuJyxcbiAgICAgIH0sXG4gICAgXSxcbiAgXSk7XG5cbiAgLyoqXG4gICAqIExvYWRlZCBpbiB7QGxpbmsgaW5pdFJ1bnRpbWV9XG4gICAqL1xuICBwdWJsaWMgcmVhZG9ubHkgaW50ZXJjZXB0b3JzOiBSZXF1aXJlZDxXb3JrZmxvd0ludGVyY2VwdG9ycz4gPSB7XG4gICAgaW5ib3VuZDogW10sXG4gICAgb3V0Ym91bmQ6IFtdLFxuICAgIGludGVybmFsczogW10sXG4gIH07XG5cbiAgLyoqXG4gICAqIEJ1ZmZlciB0aGF0IHN0b3JlcyBhbGwgZ2VuZXJhdGVkIGNvbW1hbmRzLCByZXNldCBhZnRlciBlYWNoIGFjdGl2YXRpb25cbiAgICovXG4gIHByb3RlY3RlZCBjb21tYW5kczogY29yZXNkay53b3JrZmxvd19jb21tYW5kcy5JV29ya2Zsb3dDb21tYW5kW10gPSBbXTtcblxuICAvKipcbiAgICogU3RvcmVzIGFsbCB7QGxpbmsgY29uZGl0aW9ufXMgdGhhdCBoYXZlbid0IGJlZW4gdW5ibG9ja2VkIHlldFxuICAgKi9cbiAgcHVibGljIHJlYWRvbmx5IGJsb2NrZWRDb25kaXRpb25zID0gbmV3IE1hcDxudW1iZXIsIENvbmRpdGlvbj4oKTtcblxuICAvKipcbiAgICogSXMgdGhpcyBXb3JrZmxvdyBjb21wbGV0ZWQ/XG4gICAqXG4gICAqIEEgV29ya2Zsb3cgd2lsbCBiZSBjb25zaWRlcmVkIGNvbXBsZXRlZCBpZiBpdCBnZW5lcmF0ZXMgYSBjb21tYW5kIHRoYXQgdGhlXG4gICAqIHN5c3RlbSBjb25zaWRlcnMgYXMgYSBmaW5hbCBXb3JrZmxvdyBjb21tYW5kIChlLmcuXG4gICAqIGNvbXBsZXRlV29ya2Zsb3dFeGVjdXRpb24gb3IgZmFpbFdvcmtmbG93RXhlY3V0aW9uKS5cbiAgICovXG4gIHB1YmxpYyBjb21wbGV0ZWQgPSBmYWxzZTtcblxuICAvKipcbiAgICogV2FzIHRoaXMgV29ya2Zsb3cgY2FuY2VsbGVkP1xuICAgKi9cbiAgcHJvdGVjdGVkIGNhbmNlbGxlZCA9IGZhbHNlO1xuXG4gIC8qKlxuICAgKiBUaGUgbmV4dCAoaW5jcmVtZW50YWwpIHNlcXVlbmNlIHRvIGFzc2lnbiB3aGVuIGdlbmVyYXRpbmcgY29tcGxldGFibGUgY29tbWFuZHNcbiAgICovXG4gIHB1YmxpYyBuZXh0U2VxcyA9IHtcbiAgICB0aW1lcjogMSxcbiAgICBhY3Rpdml0eTogMSxcbiAgICBjaGlsZFdvcmtmbG93OiAxLFxuICAgIHNpZ25hbFdvcmtmbG93OiAxLFxuICAgIGNhbmNlbFdvcmtmbG93OiAxLFxuICAgIGNvbmRpdGlvbjogMSxcbiAgICAvLyBVc2VkIGludGVybmFsbHkgdG8ga2VlcCB0cmFjayBvZiBhY3RpdmUgc3RhY2sgdHJhY2VzXG4gICAgc3RhY2s6IDEsXG4gIH07XG5cbiAgLyoqXG4gICAqIFRoaXMgaXMgc2V0IGV2ZXJ5IHRpbWUgdGhlIHdvcmtmbG93IGV4ZWN1dGVzIGFuIGFjdGl2YXRpb25cbiAgICogTWF5IGJlIGFjY2Vzc2VkIGFuZCBtb2RpZmllZCBmcm9tIG91dHNpZGUgdGhlIFZNLlxuICAgKi9cbiAgbm93OiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIFJlZmVyZW5jZSB0byB0aGUgY3VycmVudCBXb3JrZmxvdywgaW5pdGlhbGl6ZWQgd2hlbiBhIFdvcmtmbG93IGlzIHN0YXJ0ZWRcbiAgICovXG4gIHB1YmxpYyB3b3JrZmxvdz86IFdvcmtmbG93O1xuXG4gIC8qKlxuICAgKiBJbmZvcm1hdGlvbiBhYm91dCB0aGUgY3VycmVudCBXb3JrZmxvd1xuICAgKiBNYXkgYmUgYWNjZXNzZWQgZnJvbSBvdXRzaWRlIHRoZSBWTS5cbiAgICovXG4gIHB1YmxpYyBpbmZvOiBXb3JrZmxvd0luZm87XG5cbiAgLyoqXG4gICAqIEEgZGV0ZXJtaW5pc3RpYyBSTkcsIHVzZWQgYnkgdGhlIGlzb2xhdGUncyBvdmVycmlkZGVuIE1hdGgucmFuZG9tXG4gICAqL1xuICBwdWJsaWMgcmFuZG9tOiBSTkc7XG5cbiAgcHVibGljIHBheWxvYWRDb252ZXJ0ZXI6IFBheWxvYWRDb252ZXJ0ZXIgPSBkZWZhdWx0UGF5bG9hZENvbnZlcnRlcjtcbiAgcHVibGljIGZhaWx1cmVDb252ZXJ0ZXI6IEZhaWx1cmVDb252ZXJ0ZXIgPSBkZWZhdWx0RmFpbHVyZUNvbnZlcnRlcjtcblxuICAvKipcbiAgICogUGF0Y2hlcyB3ZSBrbm93IHRoZSBzdGF0dXMgb2YgZm9yIHRoaXMgd29ya2Zsb3csIGFzIGluIHtAbGluayBwYXRjaGVkfVxuICAgKi9cbiAgcHJpdmF0ZSByZWFkb25seSBrbm93blByZXNlbnRQYXRjaGVzID0gbmV3IFNldDxzdHJpbmc+KCk7XG5cbiAgLyoqXG4gICAqIFBhdGNoZXMgd2Ugc2VudCB0byBjb3JlIHtAbGluayBwYXRjaGVkfVxuICAgKi9cbiAgcHJpdmF0ZSByZWFkb25seSBzZW50UGF0Y2hlcyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuXG4gIHByaXZhdGUgcmVhZG9ubHkga25vd25GbGFncyA9IG5ldyBTZXQ8bnVtYmVyPigpO1xuXG4gIC8qKlxuICAgKiBCdWZmZXJlZCBzaW5rIGNhbGxzIHBlciBhY3RpdmF0aW9uXG4gICAqL1xuICBzaW5rQ2FsbHMgPSBBcnJheTxTaW5rQ2FsbD4oKTtcblxuICAvKipcbiAgICogQSBuYW5vc2Vjb25kIHJlc29sdXRpb24gdGltZSBmdW5jdGlvbiwgZXh0ZXJuYWxseSBpbmplY3RlZFxuICAgKi9cbiAgcHVibGljIHJlYWRvbmx5IGdldFRpbWVPZkRheTogKCkgPT4gYmlnaW50O1xuXG4gIHB1YmxpYyByZWFkb25seSByZWdpc3RlcmVkQWN0aXZpdHlOYW1lczogU2V0PHN0cmluZz47XG5cbiAgY29uc3RydWN0b3Ioe1xuICAgIGluZm8sXG4gICAgbm93LFxuICAgIHNob3dTdGFja1RyYWNlU291cmNlcyxcbiAgICBzb3VyY2VNYXAsXG4gICAgZ2V0VGltZU9mRGF5LFxuICAgIHJhbmRvbW5lc3NTZWVkLFxuICAgIHJlZ2lzdGVyZWRBY3Rpdml0eU5hbWVzLFxuICB9OiBXb3JrZmxvd0NyZWF0ZU9wdGlvbnNJbnRlcm5hbCkge1xuICAgIHRoaXMuZ2V0VGltZU9mRGF5ID0gZ2V0VGltZU9mRGF5O1xuICAgIHRoaXMuaW5mbyA9IGluZm87XG4gICAgdGhpcy5ub3cgPSBub3c7XG4gICAgdGhpcy5zaG93U3RhY2tUcmFjZVNvdXJjZXMgPSBzaG93U3RhY2tUcmFjZVNvdXJjZXM7XG4gICAgdGhpcy5zb3VyY2VNYXAgPSBzb3VyY2VNYXA7XG4gICAgdGhpcy5yYW5kb20gPSBhbGVhKHJhbmRvbW5lc3NTZWVkKTtcbiAgICB0aGlzLnJlZ2lzdGVyZWRBY3Rpdml0eU5hbWVzID0gcmVnaXN0ZXJlZEFjdGl2aXR5TmFtZXM7XG4gIH1cblxuICAvKipcbiAgICogTWF5IGJlIGludm9rZWQgZnJvbSBvdXRzaWRlIHRoZSBWTS5cbiAgICovXG4gIG11dGF0ZVdvcmtmbG93SW5mbyhmbjogKGluZm86IFdvcmtmbG93SW5mbykgPT4gV29ya2Zsb3dJbmZvKTogdm9pZCB7XG4gICAgdGhpcy5pbmZvID0gZm4odGhpcy5pbmZvKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBnZXRTdGFja1RyYWNlcygpOiBTdGFja1tdIHtcbiAgICBjb25zdCB7IGNoaWxkVG9QYXJlbnQsIHByb21pc2VUb1N0YWNrIH0gPSB0aGlzLnByb21pc2VTdGFja1N0b3JlO1xuICAgIGNvbnN0IGludGVybmFsTm9kZXMgPSBbLi4uY2hpbGRUb1BhcmVudC52YWx1ZXMoKV0ucmVkdWNlKChhY2MsIGN1cnIpID0+IHtcbiAgICAgIGZvciAoY29uc3QgcCBvZiBjdXJyKSB7XG4gICAgICAgIGFjYy5hZGQocCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gYWNjO1xuICAgIH0sIG5ldyBTZXQoKSk7XG4gICAgY29uc3Qgc3RhY2tzID0gbmV3IE1hcDxzdHJpbmcsIFN0YWNrPigpO1xuICAgIGZvciAoY29uc3QgY2hpbGQgb2YgY2hpbGRUb1BhcmVudC5rZXlzKCkpIHtcbiAgICAgIGlmICghaW50ZXJuYWxOb2Rlcy5oYXMoY2hpbGQpKSB7XG4gICAgICAgIGNvbnN0IHN0YWNrID0gcHJvbWlzZVRvU3RhY2suZ2V0KGNoaWxkKTtcbiAgICAgICAgaWYgKCFzdGFjayB8fCAhc3RhY2suZm9ybWF0dGVkKSBjb250aW51ZTtcbiAgICAgICAgc3RhY2tzLnNldChzdGFjay5mb3JtYXR0ZWQsIHN0YWNrKTtcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gTm90IDEwMCUgc3VyZSB3aGVyZSB0aGlzIGNvbWVzIGZyb20sIGp1c3QgZmlsdGVyIGl0IG91dFxuICAgIHN0YWNrcy5kZWxldGUoJyAgICBhdCBQcm9taXNlLnRoZW4gKDxhbm9ueW1vdXM+KScpO1xuICAgIHN0YWNrcy5kZWxldGUoJyAgICBhdCBQcm9taXNlLnRoZW4gKDxhbm9ueW1vdXM+KVxcbicpO1xuICAgIHJldHVybiBbLi4uc3RhY2tzXS5tYXAoKFtfLCBzdGFja10pID0+IHN0YWNrKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNYXkgYmUgaW52b2tlZCBmcm9tIG91dHNpZGUgdGhlIFZNLlxuICAgKi9cbiAgZ2V0QW5kUmVzZXRTaW5rQ2FsbHMoKTogU2lua0NhbGxbXSB7XG4gICAgY29uc3QgeyBzaW5rQ2FsbHMgfSA9IHRoaXM7XG4gICAgdGhpcy5zaW5rQ2FsbHMgPSBbXTtcbiAgICByZXR1cm4gc2lua0NhbGxzO1xuICB9XG5cbiAgLyoqXG4gICAqIEJ1ZmZlciBhIFdvcmtmbG93IGNvbW1hbmQgdG8gYmUgY29sbGVjdGVkIGF0IHRoZSBlbmQgb2YgdGhlIGN1cnJlbnQgYWN0aXZhdGlvbi5cbiAgICpcbiAgICogUHJldmVudHMgY29tbWFuZHMgZnJvbSBiZWluZyBhZGRlZCBhZnRlciBXb3JrZmxvdyBjb21wbGV0aW9uLlxuICAgKi9cbiAgcHVzaENvbW1hbmQoY21kOiBjb3Jlc2RrLndvcmtmbG93X2NvbW1hbmRzLklXb3JrZmxvd0NvbW1hbmQsIGNvbXBsZXRlID0gZmFsc2UpOiB2b2lkIHtcbiAgICB0aGlzLmNvbW1hbmRzLnB1c2goY21kKTtcbiAgICBpZiAoY29tcGxldGUpIHtcbiAgICAgIHRoaXMuY29tcGxldGVkID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICBjb25jbHVkZUFjdGl2YXRpb24oKTogQWN0aXZhdGlvbkNvbXBsZXRpb24ge1xuICAgIHJldHVybiB7XG4gICAgICBjb21tYW5kczogdGhpcy5jb21tYW5kcy5zcGxpY2UoMCksXG4gICAgICB1c2VkSW50ZXJuYWxGbGFnczogWy4uLnRoaXMua25vd25GbGFnc10sXG4gICAgfTtcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBzdGFydFdvcmtmbG93TmV4dEhhbmRsZXIoeyBhcmdzIH06IFdvcmtmbG93RXhlY3V0ZUlucHV0KTogUHJvbWlzZTxhbnk+IHtcbiAgICBjb25zdCB7IHdvcmtmbG93IH0gPSB0aGlzO1xuICAgIGlmICh3b3JrZmxvdyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgSWxsZWdhbFN0YXRlRXJyb3IoJ1dvcmtmbG93IHVuaW5pdGlhbGl6ZWQnKTtcbiAgICB9XG4gICAgcmV0dXJuIGF3YWl0IHdvcmtmbG93KC4uLmFyZ3MpO1xuICB9XG5cbiAgcHVibGljIHN0YXJ0V29ya2Zsb3coYWN0aXZhdGlvbjogY29yZXNkay53b3JrZmxvd19hY3RpdmF0aW9uLklJbml0aWFsaXplV29ya2Zsb3cpOiB2b2lkIHtcbiAgICBjb25zdCBleGVjdXRlID0gY29tcG9zZUludGVyY2VwdG9ycyh0aGlzLmludGVyY2VwdG9ycy5pbmJvdW5kLCAnZXhlY3V0ZScsIHRoaXMuc3RhcnRXb3JrZmxvd05leHRIYW5kbGVyLmJpbmQodGhpcykpO1xuXG4gICAgdW50cmFja1Byb21pc2UoXG4gICAgICBleGVjdXRlV2l0aExpZmVjeWNsZUxvZ2dpbmcoKCkgPT5cbiAgICAgICAgZXhlY3V0ZSh7XG4gICAgICAgICAgaGVhZGVyczogYWN0aXZhdGlvbi5oZWFkZXJzID8/IHt9LFxuICAgICAgICAgIGFyZ3M6IGFycmF5RnJvbVBheWxvYWRzKHRoaXMucGF5bG9hZENvbnZlcnRlciwgYWN0aXZhdGlvbi5hcmd1bWVudHMpLFxuICAgICAgICB9KVxuICAgICAgKS50aGVuKHRoaXMuY29tcGxldGVXb3JrZmxvdy5iaW5kKHRoaXMpLCB0aGlzLmhhbmRsZVdvcmtmbG93RmFpbHVyZS5iaW5kKHRoaXMpKVxuICAgICk7XG4gIH1cblxuICBwdWJsaWMgaW5pdGlhbGl6ZVdvcmtmbG93KGFjdGl2YXRpb246IGNvcmVzZGsud29ya2Zsb3dfYWN0aXZhdGlvbi5JSW5pdGlhbGl6ZVdvcmtmbG93KTogdm9pZCB7XG4gICAgY29uc3QgeyBjb250aW51ZWRGYWlsdXJlLCBsYXN0Q29tcGxldGlvblJlc3VsdCwgbWVtbywgc2VhcmNoQXR0cmlidXRlcyB9ID0gYWN0aXZhdGlvbjtcblxuICAgIC8vIE1vc3QgdGhpbmdzIHJlbGF0ZWQgdG8gaW5pdGlhbGl6YXRpb24gaGF2ZSBhbHJlYWR5IGJlZW4gaGFuZGxlZCBpbiB0aGUgY29uc3RydWN0b3JcbiAgICB0aGlzLm11dGF0ZVdvcmtmbG93SW5mbygoaW5mbykgPT4gKHtcbiAgICAgIC4uLmluZm8sXG4gICAgICBzZWFyY2hBdHRyaWJ1dGVzOlxuICAgICAgICAobWFwRnJvbVBheWxvYWRzKHNlYXJjaEF0dHJpYnV0ZVBheWxvYWRDb252ZXJ0ZXIsIHNlYXJjaEF0dHJpYnV0ZXM/LmluZGV4ZWRGaWVsZHMpIGFzIFNlYXJjaEF0dHJpYnV0ZXMpID8/IHt9LFxuICAgICAgbWVtbzogbWFwRnJvbVBheWxvYWRzKHRoaXMucGF5bG9hZENvbnZlcnRlciwgbWVtbz8uZmllbGRzKSxcbiAgICAgIGxhc3RSZXN1bHQ6IGZyb21QYXlsb2Fkc0F0SW5kZXgodGhpcy5wYXlsb2FkQ29udmVydGVyLCAwLCBsYXN0Q29tcGxldGlvblJlc3VsdD8ucGF5bG9hZHMpLFxuICAgICAgbGFzdEZhaWx1cmU6XG4gICAgICAgIGNvbnRpbnVlZEZhaWx1cmUgIT0gbnVsbFxuICAgICAgICAgID8gdGhpcy5mYWlsdXJlQ29udmVydGVyLmZhaWx1cmVUb0Vycm9yKGNvbnRpbnVlZEZhaWx1cmUsIHRoaXMucGF5bG9hZENvbnZlcnRlcilcbiAgICAgICAgICA6IHVuZGVmaW5lZCxcbiAgICB9KSk7XG4gIH1cblxuICBwdWJsaWMgY2FuY2VsV29ya2Zsb3coX2FjdGl2YXRpb246IGNvcmVzZGsud29ya2Zsb3dfYWN0aXZhdGlvbi5JQ2FuY2VsV29ya2Zsb3cpOiB2b2lkIHtcbiAgICB0aGlzLmNhbmNlbGxlZCA9IHRydWU7XG4gICAgdGhpcy5yb290U2NvcGUuY2FuY2VsKCk7XG4gIH1cblxuICBwdWJsaWMgZmlyZVRpbWVyKGFjdGl2YXRpb246IGNvcmVzZGsud29ya2Zsb3dfYWN0aXZhdGlvbi5JRmlyZVRpbWVyKTogdm9pZCB7XG4gICAgLy8gVGltZXJzIGFyZSBhIHNwZWNpYWwgY2FzZSB3aGVyZSB0aGVpciBjb21wbGV0aW9uIG1pZ2h0IG5vdCBiZSBpbiBXb3JrZmxvdyBzdGF0ZSxcbiAgICAvLyB0aGlzIGlzIGR1ZSB0byBpbW1lZGlhdGUgdGltZXIgY2FuY2VsbGF0aW9uIHRoYXQgZG9lc24ndCBnbyB3YWl0IGZvciBDb3JlLlxuICAgIGNvbnN0IGNvbXBsZXRpb24gPSB0aGlzLm1heWJlQ29uc3VtZUNvbXBsZXRpb24oJ3RpbWVyJywgZ2V0U2VxKGFjdGl2YXRpb24pKTtcbiAgICBjb21wbGV0aW9uPy5yZXNvbHZlKHVuZGVmaW5lZCk7XG4gIH1cblxuICBwdWJsaWMgcmVzb2x2ZUFjdGl2aXR5KGFjdGl2YXRpb246IGNvcmVzZGsud29ya2Zsb3dfYWN0aXZhdGlvbi5JUmVzb2x2ZUFjdGl2aXR5KTogdm9pZCB7XG4gICAgaWYgKCFhY3RpdmF0aW9uLnJlc3VsdCkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignR290IFJlc29sdmVBY3Rpdml0eSBhY3RpdmF0aW9uIHdpdGggbm8gcmVzdWx0Jyk7XG4gICAgfVxuICAgIGNvbnN0IHsgcmVzb2x2ZSwgcmVqZWN0IH0gPSB0aGlzLmNvbnN1bWVDb21wbGV0aW9uKCdhY3Rpdml0eScsIGdldFNlcShhY3RpdmF0aW9uKSk7XG4gICAgaWYgKGFjdGl2YXRpb24ucmVzdWx0LmNvbXBsZXRlZCkge1xuICAgICAgY29uc3QgY29tcGxldGVkID0gYWN0aXZhdGlvbi5yZXN1bHQuY29tcGxldGVkO1xuICAgICAgY29uc3QgcmVzdWx0ID0gY29tcGxldGVkLnJlc3VsdCA/IHRoaXMucGF5bG9hZENvbnZlcnRlci5mcm9tUGF5bG9hZChjb21wbGV0ZWQucmVzdWx0KSA6IHVuZGVmaW5lZDtcbiAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICB9IGVsc2UgaWYgKGFjdGl2YXRpb24ucmVzdWx0LmZhaWxlZCkge1xuICAgICAgY29uc3QgeyBmYWlsdXJlIH0gPSBhY3RpdmF0aW9uLnJlc3VsdC5mYWlsZWQ7XG4gICAgICBjb25zdCBlcnIgPSBmYWlsdXJlID8gdGhpcy5mYWlsdXJlVG9FcnJvcihmYWlsdXJlKSA6IHVuZGVmaW5lZDtcbiAgICAgIHJlamVjdChlcnIpO1xuICAgIH0gZWxzZSBpZiAoYWN0aXZhdGlvbi5yZXN1bHQuY2FuY2VsbGVkKSB7XG4gICAgICBjb25zdCB7IGZhaWx1cmUgfSA9IGFjdGl2YXRpb24ucmVzdWx0LmNhbmNlbGxlZDtcbiAgICAgIGNvbnN0IGVyciA9IGZhaWx1cmUgPyB0aGlzLmZhaWx1cmVUb0Vycm9yKGZhaWx1cmUpIDogdW5kZWZpbmVkO1xuICAgICAgcmVqZWN0KGVycik7XG4gICAgfSBlbHNlIGlmIChhY3RpdmF0aW9uLnJlc3VsdC5iYWNrb2ZmKSB7XG4gICAgICByZWplY3QobmV3IExvY2FsQWN0aXZpdHlEb0JhY2tvZmYoYWN0aXZhdGlvbi5yZXN1bHQuYmFja29mZikpO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyByZXNvbHZlQ2hpbGRXb3JrZmxvd0V4ZWN1dGlvblN0YXJ0KFxuICAgIGFjdGl2YXRpb246IGNvcmVzZGsud29ya2Zsb3dfYWN0aXZhdGlvbi5JUmVzb2x2ZUNoaWxkV29ya2Zsb3dFeGVjdXRpb25TdGFydFxuICApOiB2b2lkIHtcbiAgICBjb25zdCB7IHJlc29sdmUsIHJlamVjdCB9ID0gdGhpcy5jb25zdW1lQ29tcGxldGlvbignY2hpbGRXb3JrZmxvd1N0YXJ0JywgZ2V0U2VxKGFjdGl2YXRpb24pKTtcbiAgICBpZiAoYWN0aXZhdGlvbi5zdWNjZWVkZWQpIHtcbiAgICAgIHJlc29sdmUoYWN0aXZhdGlvbi5zdWNjZWVkZWQucnVuSWQpO1xuICAgIH0gZWxzZSBpZiAoYWN0aXZhdGlvbi5mYWlsZWQpIHtcbiAgICAgIGlmIChcbiAgICAgICAgYWN0aXZhdGlvbi5mYWlsZWQuY2F1c2UgIT09XG4gICAgICAgIFN0YXJ0Q2hpbGRXb3JrZmxvd0V4ZWN1dGlvbkZhaWxlZENhdXNlLlNUQVJUX0NISUxEX1dPUktGTE9XX0VYRUNVVElPTl9GQUlMRURfQ0FVU0VfV09SS0ZMT1dfQUxSRUFEWV9FWElTVFNcbiAgICAgICkge1xuICAgICAgICB0aHJvdyBuZXcgSWxsZWdhbFN0YXRlRXJyb3IoJ0dvdCB1bmtub3duIFN0YXJ0Q2hpbGRXb3JrZmxvd0V4ZWN1dGlvbkZhaWxlZENhdXNlJyk7XG4gICAgICB9XG4gICAgICBpZiAoIShhY3RpdmF0aW9uLnNlcSAmJiBhY3RpdmF0aW9uLmZhaWxlZC53b3JrZmxvd0lkICYmIGFjdGl2YXRpb24uZmFpbGVkLndvcmtmbG93VHlwZSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignTWlzc2luZyBhdHRyaWJ1dGVzIGluIGFjdGl2YXRpb24gam9iJyk7XG4gICAgICB9XG4gICAgICByZWplY3QoXG4gICAgICAgIG5ldyBXb3JrZmxvd0V4ZWN1dGlvbkFscmVhZHlTdGFydGVkRXJyb3IoXG4gICAgICAgICAgJ1dvcmtmbG93IGV4ZWN1dGlvbiBhbHJlYWR5IHN0YXJ0ZWQnLFxuICAgICAgICAgIGFjdGl2YXRpb24uZmFpbGVkLndvcmtmbG93SWQsXG4gICAgICAgICAgYWN0aXZhdGlvbi5mYWlsZWQud29ya2Zsb3dUeXBlXG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfSBlbHNlIGlmIChhY3RpdmF0aW9uLmNhbmNlbGxlZCkge1xuICAgICAgaWYgKCFhY3RpdmF0aW9uLmNhbmNlbGxlZC5mYWlsdXJlKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0dvdCBubyBmYWlsdXJlIGluIGNhbmNlbGxlZCB2YXJpYW50Jyk7XG4gICAgICB9XG4gICAgICByZWplY3QodGhpcy5mYWlsdXJlVG9FcnJvcihhY3RpdmF0aW9uLmNhbmNlbGxlZC5mYWlsdXJlKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0dvdCBSZXNvbHZlQ2hpbGRXb3JrZmxvd0V4ZWN1dGlvblN0YXJ0IHdpdGggbm8gc3RhdHVzJyk7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIHJlc29sdmVDaGlsZFdvcmtmbG93RXhlY3V0aW9uKGFjdGl2YXRpb246IGNvcmVzZGsud29ya2Zsb3dfYWN0aXZhdGlvbi5JUmVzb2x2ZUNoaWxkV29ya2Zsb3dFeGVjdXRpb24pOiB2b2lkIHtcbiAgICBpZiAoIWFjdGl2YXRpb24ucmVzdWx0KSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdHb3QgUmVzb2x2ZUNoaWxkV29ya2Zsb3dFeGVjdXRpb24gYWN0aXZhdGlvbiB3aXRoIG5vIHJlc3VsdCcpO1xuICAgIH1cbiAgICBjb25zdCB7IHJlc29sdmUsIHJlamVjdCB9ID0gdGhpcy5jb25zdW1lQ29tcGxldGlvbignY2hpbGRXb3JrZmxvd0NvbXBsZXRlJywgZ2V0U2VxKGFjdGl2YXRpb24pKTtcbiAgICBpZiAoYWN0aXZhdGlvbi5yZXN1bHQuY29tcGxldGVkKSB7XG4gICAgICBjb25zdCBjb21wbGV0ZWQgPSBhY3RpdmF0aW9uLnJlc3VsdC5jb21wbGV0ZWQ7XG4gICAgICBjb25zdCByZXN1bHQgPSBjb21wbGV0ZWQucmVzdWx0ID8gdGhpcy5wYXlsb2FkQ29udmVydGVyLmZyb21QYXlsb2FkKGNvbXBsZXRlZC5yZXN1bHQpIDogdW5kZWZpbmVkO1xuICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgIH0gZWxzZSBpZiAoYWN0aXZhdGlvbi5yZXN1bHQuZmFpbGVkKSB7XG4gICAgICBjb25zdCB7IGZhaWx1cmUgfSA9IGFjdGl2YXRpb24ucmVzdWx0LmZhaWxlZDtcbiAgICAgIGlmIChmYWlsdXJlID09PSB1bmRlZmluZWQgfHwgZmFpbHVyZSA9PT0gbnVsbCkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdHb3QgZmFpbGVkIHJlc3VsdCB3aXRoIG5vIGZhaWx1cmUgYXR0cmlidXRlJyk7XG4gICAgICB9XG4gICAgICByZWplY3QodGhpcy5mYWlsdXJlVG9FcnJvcihmYWlsdXJlKSk7XG4gICAgfSBlbHNlIGlmIChhY3RpdmF0aW9uLnJlc3VsdC5jYW5jZWxsZWQpIHtcbiAgICAgIGNvbnN0IHsgZmFpbHVyZSB9ID0gYWN0aXZhdGlvbi5yZXN1bHQuY2FuY2VsbGVkO1xuICAgICAgaWYgKGZhaWx1cmUgPT09IHVuZGVmaW5lZCB8fCBmYWlsdXJlID09PSBudWxsKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0dvdCBjYW5jZWxsZWQgcmVzdWx0IHdpdGggbm8gZmFpbHVyZSBhdHRyaWJ1dGUnKTtcbiAgICAgIH1cbiAgICAgIHJlamVjdCh0aGlzLmZhaWx1cmVUb0Vycm9yKGZhaWx1cmUpKTtcbiAgICB9XG4gIH1cblxuICAvLyBJbnRlbnRpb25hbGx5IG5vbi1hc3luYyBmdW5jdGlvbiBzbyB0aGlzIGhhbmRsZXIgZG9lc24ndCBzaG93IHVwIGluIHRoZSBzdGFjayB0cmFjZVxuICBwcm90ZWN0ZWQgcXVlcnlXb3JrZmxvd05leHRIYW5kbGVyKHsgcXVlcnlOYW1lLCBhcmdzIH06IFF1ZXJ5SW5wdXQpOiBQcm9taXNlPHVua25vd24+IHtcbiAgICBjb25zdCBmbiA9IHRoaXMucXVlcnlIYW5kbGVycy5nZXQocXVlcnlOYW1lKT8uaGFuZGxlcjtcbiAgICBpZiAoZm4gPT09IHVuZGVmaW5lZCkge1xuICAgICAgY29uc3Qga25vd25RdWVyeVR5cGVzID0gWy4uLnRoaXMucXVlcnlIYW5kbGVycy5rZXlzKCldLmpvaW4oJyAnKTtcbiAgICAgIC8vIEZhaWwgdGhlIHF1ZXJ5XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoXG4gICAgICAgIG5ldyBSZWZlcmVuY2VFcnJvcihcbiAgICAgICAgICBgV29ya2Zsb3cgZGlkIG5vdCByZWdpc3RlciBhIGhhbmRsZXIgZm9yICR7cXVlcnlOYW1lfS4gUmVnaXN0ZXJlZCBxdWVyaWVzOiBbJHtrbm93blF1ZXJ5VHlwZXN9XWBcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJldCA9IGZuKC4uLmFyZ3MpO1xuICAgICAgaWYgKHJldCBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBEZXRlcm1pbmlzbVZpb2xhdGlvbkVycm9yKCdRdWVyeSBoYW5kbGVycyBzaG91bGQgbm90IHJldHVybiBhIFByb21pc2UnKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHJldCk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoZXJyKTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgcXVlcnlXb3JrZmxvdyhhY3RpdmF0aW9uOiBjb3Jlc2RrLndvcmtmbG93X2FjdGl2YXRpb24uSVF1ZXJ5V29ya2Zsb3cpOiB2b2lkIHtcbiAgICBjb25zdCB7IHF1ZXJ5VHlwZSwgcXVlcnlJZCwgaGVhZGVycyB9ID0gYWN0aXZhdGlvbjtcbiAgICBpZiAoIShxdWVyeVR5cGUgJiYgcXVlcnlJZCkpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ01pc3NpbmcgcXVlcnkgYWN0aXZhdGlvbiBhdHRyaWJ1dGVzJyk7XG4gICAgfVxuXG4gICAgY29uc3QgZXhlY3V0ZSA9IGNvbXBvc2VJbnRlcmNlcHRvcnMoXG4gICAgICB0aGlzLmludGVyY2VwdG9ycy5pbmJvdW5kLFxuICAgICAgJ2hhbmRsZVF1ZXJ5JyxcbiAgICAgIHRoaXMucXVlcnlXb3JrZmxvd05leHRIYW5kbGVyLmJpbmQodGhpcylcbiAgICApO1xuICAgIGV4ZWN1dGUoe1xuICAgICAgcXVlcnlOYW1lOiBxdWVyeVR5cGUsXG4gICAgICBhcmdzOiBhcnJheUZyb21QYXlsb2Fkcyh0aGlzLnBheWxvYWRDb252ZXJ0ZXIsIGFjdGl2YXRpb24uYXJndW1lbnRzKSxcbiAgICAgIHF1ZXJ5SWQsXG4gICAgICBoZWFkZXJzOiBoZWFkZXJzID8/IHt9LFxuICAgIH0pLnRoZW4oXG4gICAgICAocmVzdWx0KSA9PiB0aGlzLmNvbXBsZXRlUXVlcnkocXVlcnlJZCwgcmVzdWx0KSxcbiAgICAgIChyZWFzb24pID0+IHRoaXMuZmFpbFF1ZXJ5KHF1ZXJ5SWQsIHJlYXNvbilcbiAgICApO1xuICB9XG5cbiAgcHVibGljIGRvVXBkYXRlKGFjdGl2YXRpb246IGNvcmVzZGsud29ya2Zsb3dfYWN0aXZhdGlvbi5JRG9VcGRhdGUpOiB2b2lkIHtcbiAgICBjb25zdCB7IGlkOiB1cGRhdGVJZCwgcHJvdG9jb2xJbnN0YW5jZUlkLCBuYW1lLCBoZWFkZXJzLCBydW5WYWxpZGF0b3IgfSA9IGFjdGl2YXRpb247XG4gICAgaWYgKCF1cGRhdGVJZCkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignTWlzc2luZyBhY3RpdmF0aW9uIHVwZGF0ZSBpZCcpO1xuICAgIH1cbiAgICBpZiAoIW5hbWUpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ01pc3NpbmcgYWN0aXZhdGlvbiB1cGRhdGUgbmFtZScpO1xuICAgIH1cbiAgICBpZiAoIXByb3RvY29sSW5zdGFuY2VJZCkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignTWlzc2luZyBhY3RpdmF0aW9uIHVwZGF0ZSBwcm90b2NvbEluc3RhbmNlSWQnKTtcbiAgICB9XG4gICAgY29uc3QgZW50cnkgPSB0aGlzLnVwZGF0ZUhhbmRsZXJzLmdldChuYW1lKTtcbiAgICBpZiAoIWVudHJ5KSB7XG4gICAgICB0aGlzLmJ1ZmZlcmVkVXBkYXRlcy5wdXNoKGFjdGl2YXRpb24pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IG1ha2VJbnB1dCA9ICgpOiBVcGRhdGVJbnB1dCA9PiAoe1xuICAgICAgdXBkYXRlSWQsXG4gICAgICBhcmdzOiBhcnJheUZyb21QYXlsb2Fkcyh0aGlzLnBheWxvYWRDb252ZXJ0ZXIsIGFjdGl2YXRpb24uaW5wdXQpLFxuICAgICAgbmFtZSxcbiAgICAgIGhlYWRlcnM6IGhlYWRlcnMgPz8ge30sXG4gICAgfSk7XG5cbiAgICAvLyBUaGUgaW1wbGVtZW50YXRpb24gYmVsb3cgaXMgcmVzcG9uc2libGUgZm9yIHVwaG9sZGluZywgYW5kIGNvbnN0cmFpbmVkXG4gICAgLy8gYnksIHRoZSBmb2xsb3dpbmcgY29udHJhY3Q6XG4gICAgLy9cbiAgICAvLyAxLiBJZiBubyB2YWxpZGF0b3IgaXMgcHJlc2VudCB0aGVuIHZhbGlkYXRpb24gaW50ZXJjZXB0b3JzIHdpbGwgbm90IGJlIHJ1bi5cbiAgICAvL1xuICAgIC8vIDIuIER1cmluZyB2YWxpZGF0aW9uLCBhbnkgZXJyb3IgbXVzdCBmYWlsIHRoZSBVcGRhdGU7IGR1cmluZyB0aGUgVXBkYXRlXG4gICAgLy8gICAgaXRzZWxmLCBUZW1wb3JhbCBlcnJvcnMgZmFpbCB0aGUgVXBkYXRlIHdoZXJlYXMgb3RoZXIgZXJyb3JzIGZhaWwgdGhlXG4gICAgLy8gICAgYWN0aXZhdGlvbi5cbiAgICAvL1xuICAgIC8vIDMuIFRoZSBoYW5kbGVyIG11c3Qgbm90IHNlZSBhbnkgbXV0YXRpb25zIG9mIHRoZSBhcmd1bWVudHMgbWFkZSBieSB0aGVcbiAgICAvLyAgICB2YWxpZGF0b3IuXG4gICAgLy9cbiAgICAvLyA0LiBBbnkgZXJyb3Igd2hlbiBkZWNvZGluZy9kZXNlcmlhbGl6aW5nIGlucHV0IG11c3QgYmUgY2F1Z2h0IGFuZCByZXN1bHRcbiAgICAvLyAgICBpbiByZWplY3Rpb24gb2YgdGhlIFVwZGF0ZSBiZWZvcmUgaXQgaXMgYWNjZXB0ZWQsIGV2ZW4gaWYgdGhlcmUgaXMgbm9cbiAgICAvLyAgICB2YWxpZGF0b3IuXG4gICAgLy9cbiAgICAvLyA1LiBUaGUgaW5pdGlhbCBzeW5jaHJvbm91cyBwb3J0aW9uIG9mIHRoZSAoYXN5bmMpIFVwZGF0ZSBoYW5kbGVyIHNob3VsZFxuICAgIC8vICAgIGJlIGV4ZWN1dGVkIGFmdGVyIHRoZSAoc3luYykgdmFsaWRhdG9yIGNvbXBsZXRlcyBzdWNoIHRoYXQgdGhlcmUgaXNcbiAgICAvLyAgICBtaW5pbWFsIG9wcG9ydHVuaXR5IGZvciBhIGRpZmZlcmVudCBjb25jdXJyZW50IHRhc2sgdG8gYmUgc2NoZWR1bGVkXG4gICAgLy8gICAgYmV0d2VlbiB0aGVtLlxuICAgIC8vXG4gICAgLy8gNi4gVGhlIHN0YWNrIHRyYWNlIHZpZXcgcHJvdmlkZWQgaW4gdGhlIFRlbXBvcmFsIFVJIG11c3Qgbm90IGJlIHBvbGx1dGVkXG4gICAgLy8gICAgYnkgcHJvbWlzZXMgdGhhdCBkbyBub3QgZGVyaXZlIGZyb20gdXNlciBjb2RlLiBUaGlzIGltcGxpZXMgdGhhdFxuICAgIC8vICAgIGFzeW5jL2F3YWl0IHN5bnRheCBtYXkgbm90IGJlIHVzZWQuXG4gICAgLy9cbiAgICAvLyBOb3RlIHRoYXQgdGhlcmUgaXMgYSBkZWxpYmVyYXRlbHkgdW5oYW5kbGVkIHByb21pc2UgcmVqZWN0aW9uIGJlbG93LlxuICAgIC8vIFRoZXNlIGFyZSBjYXVnaHQgZWxzZXdoZXJlIGFuZCBmYWlsIHRoZSBjb3JyZXNwb25kaW5nIGFjdGl2YXRpb24uXG4gICAgY29uc3QgZG9VcGRhdGVJbXBsID0gYXN5bmMgKCkgPT4ge1xuICAgICAgbGV0IGlucHV0OiBVcGRhdGVJbnB1dDtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChydW5WYWxpZGF0b3IgJiYgZW50cnkudmFsaWRhdG9yKSB7XG4gICAgICAgICAgY29uc3QgdmFsaWRhdGUgPSBjb21wb3NlSW50ZXJjZXB0b3JzKFxuICAgICAgICAgICAgdGhpcy5pbnRlcmNlcHRvcnMuaW5ib3VuZCxcbiAgICAgICAgICAgICd2YWxpZGF0ZVVwZGF0ZScsXG4gICAgICAgICAgICB0aGlzLnZhbGlkYXRlVXBkYXRlTmV4dEhhbmRsZXIuYmluZCh0aGlzLCBlbnRyeS52YWxpZGF0b3IpXG4gICAgICAgICAgKTtcbiAgICAgICAgICB2YWxpZGF0ZShtYWtlSW5wdXQoKSk7XG4gICAgICAgIH1cbiAgICAgICAgaW5wdXQgPSBtYWtlSW5wdXQoKTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHRoaXMucmVqZWN0VXBkYXRlKHByb3RvY29sSW5zdGFuY2VJZCwgZXJyb3IpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aGlzLmFjY2VwdFVwZGF0ZShwcm90b2NvbEluc3RhbmNlSWQpO1xuICAgICAgY29uc3QgZXhlY3V0ZSA9IGNvbXBvc2VJbnRlcmNlcHRvcnMoXG4gICAgICAgIHRoaXMuaW50ZXJjZXB0b3JzLmluYm91bmQsXG4gICAgICAgICdoYW5kbGVVcGRhdGUnLFxuICAgICAgICB0aGlzLnVwZGF0ZU5leHRIYW5kbGVyLmJpbmQodGhpcywgZW50cnkuaGFuZGxlcilcbiAgICAgICk7XG4gICAgICBjb25zdCB7IHVuZmluaXNoZWRQb2xpY3kgfSA9IGVudHJ5O1xuICAgICAgdGhpcy5pblByb2dyZXNzVXBkYXRlcy5zZXQodXBkYXRlSWQsIHsgbmFtZSwgdW5maW5pc2hlZFBvbGljeSwgaWQ6IHVwZGF0ZUlkIH0pO1xuICAgICAgY29uc3QgcmVzID0gZXhlY3V0ZShpbnB1dClcbiAgICAgICAgLnRoZW4oKHJlc3VsdCkgPT4gdGhpcy5jb21wbGV0ZVVwZGF0ZShwcm90b2NvbEluc3RhbmNlSWQsIHJlc3VsdCkpXG4gICAgICAgIC5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBUZW1wb3JhbEZhaWx1cmUpIHtcbiAgICAgICAgICAgIHRoaXMucmVqZWN0VXBkYXRlKHByb3RvY29sSW5zdGFuY2VJZCwgZXJyb3IpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIC5maW5hbGx5KCgpID0+IHRoaXMuaW5Qcm9ncmVzc1VwZGF0ZXMuZGVsZXRlKHVwZGF0ZUlkKSk7XG4gICAgICB1bnRyYWNrUHJvbWlzZShyZXMpO1xuICAgICAgcmV0dXJuIHJlcztcbiAgICB9O1xuICAgIHVudHJhY2tQcm9taXNlKFVwZGF0ZVNjb3BlLnVwZGF0ZVdpdGhJbmZvKHVwZGF0ZUlkLCBuYW1lLCBkb1VwZGF0ZUltcGwpKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBhc3luYyB1cGRhdGVOZXh0SGFuZGxlcihoYW5kbGVyOiBXb3JrZmxvd1VwZGF0ZVR5cGUsIHsgYXJncyB9OiBVcGRhdGVJbnB1dCk6IFByb21pc2U8dW5rbm93bj4ge1xuICAgIHJldHVybiBhd2FpdCBoYW5kbGVyKC4uLmFyZ3MpO1xuICB9XG5cbiAgcHJvdGVjdGVkIHZhbGlkYXRlVXBkYXRlTmV4dEhhbmRsZXIodmFsaWRhdG9yOiBXb3JrZmxvd1VwZGF0ZVZhbGlkYXRvclR5cGUgfCB1bmRlZmluZWQsIHsgYXJncyB9OiBVcGRhdGVJbnB1dCk6IHZvaWQge1xuICAgIGlmICh2YWxpZGF0b3IpIHtcbiAgICAgIHZhbGlkYXRvciguLi5hcmdzKTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgZGlzcGF0Y2hCdWZmZXJlZFVwZGF0ZXMoKTogdm9pZCB7XG4gICAgY29uc3QgYnVmZmVyZWRVcGRhdGVzID0gdGhpcy5idWZmZXJlZFVwZGF0ZXM7XG4gICAgd2hpbGUgKGJ1ZmZlcmVkVXBkYXRlcy5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IGZvdW5kSW5kZXggPSBidWZmZXJlZFVwZGF0ZXMuZmluZEluZGV4KCh1cGRhdGUpID0+IHRoaXMudXBkYXRlSGFuZGxlcnMuaGFzKHVwZGF0ZS5uYW1lIGFzIHN0cmluZykpO1xuICAgICAgaWYgKGZvdW5kSW5kZXggPT09IC0xKSB7XG4gICAgICAgIC8vIE5vIGJ1ZmZlcmVkIFVwZGF0ZXMgaGF2ZSBhIGhhbmRsZXIgeWV0LlxuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGNvbnN0IFt1cGRhdGVdID0gYnVmZmVyZWRVcGRhdGVzLnNwbGljZShmb3VuZEluZGV4LCAxKTtcbiAgICAgIHRoaXMuZG9VcGRhdGUodXBkYXRlKTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgcmVqZWN0QnVmZmVyZWRVcGRhdGVzKCk6IHZvaWQge1xuICAgIHdoaWxlICh0aGlzLmJ1ZmZlcmVkVXBkYXRlcy5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IHVwZGF0ZSA9IHRoaXMuYnVmZmVyZWRVcGRhdGVzLnNoaWZ0KCk7XG4gICAgICBpZiAodXBkYXRlKSB7XG4gICAgICAgIHRoaXMucmVqZWN0VXBkYXRlKFxuICAgICAgICAgIC8qIGVzbGludC1kaXNhYmxlIEB0eXBlc2NyaXB0LWVzbGludC9uby1ub24tbnVsbC1hc3NlcnRpb24gKi9cbiAgICAgICAgICB1cGRhdGUucHJvdG9jb2xJbnN0YW5jZUlkISxcbiAgICAgICAgICBBcHBsaWNhdGlvbkZhaWx1cmUubm9uUmV0cnlhYmxlKGBObyByZWdpc3RlcmVkIGhhbmRsZXIgZm9yIHVwZGF0ZTogJHt1cGRhdGUubmFtZX1gKVxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBzaWduYWxXb3JrZmxvd05leHRIYW5kbGVyKHsgc2lnbmFsTmFtZSwgYXJncyB9OiBTaWduYWxJbnB1dCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGZuID0gdGhpcy5zaWduYWxIYW5kbGVycy5nZXQoc2lnbmFsTmFtZSk/LmhhbmRsZXI7XG4gICAgaWYgKGZuKSB7XG4gICAgICByZXR1cm4gYXdhaXQgZm4oLi4uYXJncyk7XG4gICAgfSBlbHNlIGlmICh0aGlzLmRlZmF1bHRTaWduYWxIYW5kbGVyKSB7XG4gICAgICByZXR1cm4gYXdhaXQgdGhpcy5kZWZhdWx0U2lnbmFsSGFuZGxlcihzaWduYWxOYW1lLCAuLi5hcmdzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IElsbGVnYWxTdGF0ZUVycm9yKGBObyByZWdpc3RlcmVkIHNpZ25hbCBoYW5kbGVyIGZvciBzaWduYWw6ICR7c2lnbmFsTmFtZX1gKTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgc2lnbmFsV29ya2Zsb3coYWN0aXZhdGlvbjogY29yZXNkay53b3JrZmxvd19hY3RpdmF0aW9uLklTaWduYWxXb3JrZmxvdyk6IHZvaWQge1xuICAgIGNvbnN0IHsgc2lnbmFsTmFtZSwgaGVhZGVycyB9ID0gYWN0aXZhdGlvbjtcbiAgICBpZiAoIXNpZ25hbE5hbWUpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ01pc3NpbmcgYWN0aXZhdGlvbiBzaWduYWxOYW1lJyk7XG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLnNpZ25hbEhhbmRsZXJzLmhhcyhzaWduYWxOYW1lKSAmJiAhdGhpcy5kZWZhdWx0U2lnbmFsSGFuZGxlcikge1xuICAgICAgdGhpcy5idWZmZXJlZFNpZ25hbHMucHVzaChhY3RpdmF0aW9uKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBJZiB3ZSBmYWxsIHRocm91Z2ggdG8gdGhlIGRlZmF1bHQgc2lnbmFsIGhhbmRsZXIgdGhlbiB0aGUgdW5maW5pc2hlZFxuICAgIC8vIHBvbGljeSBpcyBXQVJOX0FORF9BQkFORE9OOyB1c2VycyBjdXJyZW50bHkgaGF2ZSBubyB3YXkgdG8gc2lsZW5jZSBhbnlcbiAgICAvLyBlbnN1aW5nIHdhcm5pbmdzLlxuICAgIGNvbnN0IHVuZmluaXNoZWRQb2xpY3kgPVxuICAgICAgdGhpcy5zaWduYWxIYW5kbGVycy5nZXQoc2lnbmFsTmFtZSk/LnVuZmluaXNoZWRQb2xpY3kgPz8gSGFuZGxlclVuZmluaXNoZWRQb2xpY3kuV0FSTl9BTkRfQUJBTkRPTjtcblxuICAgIGNvbnN0IHNpZ25hbEV4ZWN1dGlvbk51bSA9IHRoaXMuc2lnbmFsSGFuZGxlckV4ZWN1dGlvblNlcSsrO1xuICAgIHRoaXMuaW5Qcm9ncmVzc1NpZ25hbHMuc2V0KHNpZ25hbEV4ZWN1dGlvbk51bSwgeyBuYW1lOiBzaWduYWxOYW1lLCB1bmZpbmlzaGVkUG9saWN5IH0pO1xuICAgIGNvbnN0IGV4ZWN1dGUgPSBjb21wb3NlSW50ZXJjZXB0b3JzKFxuICAgICAgdGhpcy5pbnRlcmNlcHRvcnMuaW5ib3VuZCxcbiAgICAgICdoYW5kbGVTaWduYWwnLFxuICAgICAgdGhpcy5zaWduYWxXb3JrZmxvd05leHRIYW5kbGVyLmJpbmQodGhpcylcbiAgICApO1xuICAgIGV4ZWN1dGUoe1xuICAgICAgYXJnczogYXJyYXlGcm9tUGF5bG9hZHModGhpcy5wYXlsb2FkQ29udmVydGVyLCBhY3RpdmF0aW9uLmlucHV0KSxcbiAgICAgIHNpZ25hbE5hbWUsXG4gICAgICBoZWFkZXJzOiBoZWFkZXJzID8/IHt9LFxuICAgIH0pXG4gICAgICAuY2F0Y2godGhpcy5oYW5kbGVXb3JrZmxvd0ZhaWx1cmUuYmluZCh0aGlzKSlcbiAgICAgIC5maW5hbGx5KCgpID0+IHRoaXMuaW5Qcm9ncmVzc1NpZ25hbHMuZGVsZXRlKHNpZ25hbEV4ZWN1dGlvbk51bSkpO1xuICB9XG5cbiAgcHVibGljIGRpc3BhdGNoQnVmZmVyZWRTaWduYWxzKCk6IHZvaWQge1xuICAgIGNvbnN0IGJ1ZmZlcmVkU2lnbmFscyA9IHRoaXMuYnVmZmVyZWRTaWduYWxzO1xuICAgIHdoaWxlIChidWZmZXJlZFNpZ25hbHMubGVuZ3RoKSB7XG4gICAgICBpZiAodGhpcy5kZWZhdWx0U2lnbmFsSGFuZGxlcikge1xuICAgICAgICAvLyBXZSBoYXZlIGEgZGVmYXVsdCBzaWduYWwgaGFuZGxlciwgc28gYWxsIHNpZ25hbHMgYXJlIGRpc3BhdGNoYWJsZVxuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLW5vbi1udWxsLWFzc2VydGlvblxuICAgICAgICB0aGlzLnNpZ25hbFdvcmtmbG93KGJ1ZmZlcmVkU2lnbmFscy5zaGlmdCgpISk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBmb3VuZEluZGV4ID0gYnVmZmVyZWRTaWduYWxzLmZpbmRJbmRleCgoc2lnbmFsKSA9PiB0aGlzLnNpZ25hbEhhbmRsZXJzLmhhcyhzaWduYWwuc2lnbmFsTmFtZSBhcyBzdHJpbmcpKTtcbiAgICAgICAgaWYgKGZvdW5kSW5kZXggPT09IC0xKSBicmVhaztcbiAgICAgICAgY29uc3QgW3NpZ25hbF0gPSBidWZmZXJlZFNpZ25hbHMuc3BsaWNlKGZvdW5kSW5kZXgsIDEpO1xuICAgICAgICB0aGlzLnNpZ25hbFdvcmtmbG93KHNpZ25hbCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHVibGljIHJlc29sdmVTaWduYWxFeHRlcm5hbFdvcmtmbG93KGFjdGl2YXRpb246IGNvcmVzZGsud29ya2Zsb3dfYWN0aXZhdGlvbi5JUmVzb2x2ZVNpZ25hbEV4dGVybmFsV29ya2Zsb3cpOiB2b2lkIHtcbiAgICBjb25zdCB7IHJlc29sdmUsIHJlamVjdCB9ID0gdGhpcy5jb25zdW1lQ29tcGxldGlvbignc2lnbmFsV29ya2Zsb3cnLCBnZXRTZXEoYWN0aXZhdGlvbikpO1xuICAgIGlmIChhY3RpdmF0aW9uLmZhaWx1cmUpIHtcbiAgICAgIHJlamVjdCh0aGlzLmZhaWx1cmVUb0Vycm9yKGFjdGl2YXRpb24uZmFpbHVyZSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXNvbHZlKHVuZGVmaW5lZCk7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIHJlc29sdmVSZXF1ZXN0Q2FuY2VsRXh0ZXJuYWxXb3JrZmxvdyhcbiAgICBhY3RpdmF0aW9uOiBjb3Jlc2RrLndvcmtmbG93X2FjdGl2YXRpb24uSVJlc29sdmVSZXF1ZXN0Q2FuY2VsRXh0ZXJuYWxXb3JrZmxvd1xuICApOiB2b2lkIHtcbiAgICBjb25zdCB7IHJlc29sdmUsIHJlamVjdCB9ID0gdGhpcy5jb25zdW1lQ29tcGxldGlvbignY2FuY2VsV29ya2Zsb3cnLCBnZXRTZXEoYWN0aXZhdGlvbikpO1xuICAgIGlmIChhY3RpdmF0aW9uLmZhaWx1cmUpIHtcbiAgICAgIHJlamVjdCh0aGlzLmZhaWx1cmVUb0Vycm9yKGFjdGl2YXRpb24uZmFpbHVyZSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXNvbHZlKHVuZGVmaW5lZCk7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIHdhcm5JZlVuZmluaXNoZWRIYW5kbGVycygpOiB2b2lkIHtcbiAgICBjb25zdCBnZXRXYXJuYWJsZSA9IChoYW5kbGVyRXhlY3V0aW9uczogSXRlcmFibGU8TWVzc2FnZUhhbmRsZXJFeGVjdXRpb24+KTogTWVzc2FnZUhhbmRsZXJFeGVjdXRpb25bXSA9PiB7XG4gICAgICByZXR1cm4gQXJyYXkuZnJvbShoYW5kbGVyRXhlY3V0aW9ucykuZmlsdGVyKFxuICAgICAgICAoZXgpID0+IGV4LnVuZmluaXNoZWRQb2xpY3kgPT09IEhhbmRsZXJVbmZpbmlzaGVkUG9saWN5LldBUk5fQU5EX0FCQU5ET05cbiAgICAgICk7XG4gICAgfTtcblxuICAgIGNvbnN0IHdhcm5hYmxlVXBkYXRlcyA9IGdldFdhcm5hYmxlKHRoaXMuaW5Qcm9ncmVzc1VwZGF0ZXMudmFsdWVzKCkpO1xuICAgIGlmICh3YXJuYWJsZVVwZGF0ZXMubGVuZ3RoID4gMCkge1xuICAgICAgbG9nLndhcm4obWFrZVVuZmluaXNoZWRVcGRhdGVIYW5kbGVyTWVzc2FnZSh3YXJuYWJsZVVwZGF0ZXMpKTtcbiAgICB9XG5cbiAgICBjb25zdCB3YXJuYWJsZVNpZ25hbHMgPSBnZXRXYXJuYWJsZSh0aGlzLmluUHJvZ3Jlc3NTaWduYWxzLnZhbHVlcygpKTtcbiAgICBpZiAod2FybmFibGVTaWduYWxzLmxlbmd0aCA+IDApIHtcbiAgICAgIGxvZy53YXJuKG1ha2VVbmZpbmlzaGVkU2lnbmFsSGFuZGxlck1lc3NhZ2Uod2FybmFibGVTaWduYWxzKSk7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIHVwZGF0ZVJhbmRvbVNlZWQoYWN0aXZhdGlvbjogY29yZXNkay53b3JrZmxvd19hY3RpdmF0aW9uLklVcGRhdGVSYW5kb21TZWVkKTogdm9pZCB7XG4gICAgaWYgKCFhY3RpdmF0aW9uLnJhbmRvbW5lc3NTZWVkKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdFeHBlY3RlZCBhY3RpdmF0aW9uIHdpdGggcmFuZG9tbmVzc1NlZWQgYXR0cmlidXRlJyk7XG4gICAgfVxuICAgIHRoaXMucmFuZG9tID0gYWxlYShhY3RpdmF0aW9uLnJhbmRvbW5lc3NTZWVkLnRvQnl0ZXMoKSk7XG4gIH1cblxuICBwdWJsaWMgbm90aWZ5SGFzUGF0Y2goYWN0aXZhdGlvbjogY29yZXNkay53b3JrZmxvd19hY3RpdmF0aW9uLklOb3RpZnlIYXNQYXRjaCk6IHZvaWQge1xuICAgIGlmICghdGhpcy5pbmZvLnVuc2FmZS5pc1JlcGxheWluZylcbiAgICAgIHRocm93IG5ldyBJbGxlZ2FsU3RhdGVFcnJvcignVW5leHBlY3RlZCBub3RpZnlIYXNQYXRjaCBqb2Igb24gbm9uLXJlcGxheSBhY3RpdmF0aW9uJyk7XG4gICAgaWYgKCFhY3RpdmF0aW9uLnBhdGNoSWQpIHRocm93IG5ldyBUeXBlRXJyb3IoJ25vdGlmeUhhc1BhdGNoIG1pc3NpbmcgcGF0Y2ggaWQnKTtcbiAgICB0aGlzLmtub3duUHJlc2VudFBhdGNoZXMuYWRkKGFjdGl2YXRpb24ucGF0Y2hJZCk7XG4gIH1cblxuICBwdWJsaWMgcGF0Y2hJbnRlcm5hbChwYXRjaElkOiBzdHJpbmcsIGRlcHJlY2F0ZWQ6IGJvb2xlYW4pOiBib29sZWFuIHtcbiAgICBpZiAodGhpcy53b3JrZmxvdyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgSWxsZWdhbFN0YXRlRXJyb3IoJ1BhdGNoZXMgY2Fubm90IGJlIHVzZWQgYmVmb3JlIFdvcmtmbG93IHN0YXJ0cycpO1xuICAgIH1cbiAgICBjb25zdCB1c2VQYXRjaCA9ICF0aGlzLmluZm8udW5zYWZlLmlzUmVwbGF5aW5nIHx8IHRoaXMua25vd25QcmVzZW50UGF0Y2hlcy5oYXMocGF0Y2hJZCk7XG4gICAgLy8gQXZvaWQgc2VuZGluZyBjb21tYW5kcyBmb3IgcGF0Y2hlcyBjb3JlIGFscmVhZHkga25vd3MgYWJvdXQuXG4gICAgLy8gVGhpcyBvcHRpbWl6YXRpb24gZW5hYmxlcyBkZXZlbG9wbWVudCBvZiBhdXRvbWF0aWMgcGF0Y2hpbmcgdG9vbHMuXG4gICAgaWYgKHVzZVBhdGNoICYmICF0aGlzLnNlbnRQYXRjaGVzLmhhcyhwYXRjaElkKSkge1xuICAgICAgdGhpcy5wdXNoQ29tbWFuZCh7XG4gICAgICAgIHNldFBhdGNoTWFya2VyOiB7IHBhdGNoSWQsIGRlcHJlY2F0ZWQgfSxcbiAgICAgIH0pO1xuICAgICAgdGhpcy5zZW50UGF0Y2hlcy5hZGQocGF0Y2hJZCk7XG4gICAgfVxuICAgIHJldHVybiB1c2VQYXRjaDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgZWFybHkgd2hpbGUgaGFuZGxpbmcgYW4gYWN0aXZhdGlvbiB0byByZWdpc3RlciBrbm93biBmbGFncy5cbiAgICogTWF5IGJlIGludm9rZWQgZnJvbSBvdXRzaWRlIHRoZSBWTS5cbiAgICovXG4gIHB1YmxpYyBhZGRLbm93bkZsYWdzKGZsYWdzOiBudW1iZXJbXSk6IHZvaWQge1xuICAgIGZvciAoY29uc3QgZmxhZyBvZiBmbGFncykge1xuICAgICAgYXNzZXJ0VmFsaWRGbGFnKGZsYWcpO1xuICAgICAgdGhpcy5rbm93bkZsYWdzLmFkZChmbGFnKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgaWYgYW4gU0RLIEZsYWcgbWF5IGJlIGNvbnNpZGVyZWQgYXMgZW5hYmxlZCBmb3IgdGhlIGN1cnJlbnQgV29ya2Zsb3cgVGFzay5cbiAgICpcbiAgICogU0RLIGZsYWdzIHBsYXkgYSByb2xlIHNpbWlsYXIgdG8gdGhlIGBwYXRjaGVkKClgIEFQSSwgYnV0IGFyZSBtZWFudCBmb3IgaW50ZXJuYWwgdXNhZ2UgYnkgdGhlXG4gICAqIFNESyBpdHNlbGYuIFRoZXkgbWFrZSBpdCBwb3NzaWJsZSBmb3IgdGhlIFNESyB0byBldm9sdmUgaXRzIGJlaGF2aW9ycyBvdmVyIHRpbWUsIHdoaWxlIHN0aWxsXG4gICAqIG1haW50YWluaW5nIGNvbXBhdGliaWxpdHkgd2l0aCBXb3JrZmxvdyBoaXN0b3JpZXMgcHJvZHVjZWQgYnkgb2xkZXIgU0RLcywgd2l0aG91dCBjYXVzaW5nXG4gICAqIGRldGVybWluaXNtIHZpb2xhdGlvbnMuXG4gICAqXG4gICAqIE1heSBiZSBpbnZva2VkIGZyb20gb3V0c2lkZSB0aGUgVk0uXG4gICAqL1xuICBwdWJsaWMgaGFzRmxhZyhmbGFnOiBTZGtGbGFnKTogYm9vbGVhbiB7XG4gICAgaWYgKHRoaXMua25vd25GbGFncy5oYXMoZmxhZy5pZCkpIHJldHVybiB0cnVlO1xuXG4gICAgLy8gSWYgbm90IHJlcGxheWluZywgZW5hYmxlIHRoZSBmbGFnIGlmIGl0IGlzIGNvbmZpZ3VyZWQgdG8gYmUgZW5hYmxlZCBieSBkZWZhdWx0LiBTZXR0aW5nIGFcbiAgICAvLyBmbGFnJ3MgZGVmYXVsdCB0byBmYWxzZSBhbGxvd3MgcHJvZ3Jlc3NpdmUgcm9sbG91dCBvZiBuZXcgZmVhdHVyZSBmbGFncywgd2l0aCB0aGUgcG9zc2liaWxpdHlcbiAgICAvLyBvZiByZXZlcnRpbmcgYmFjayB0byBhIHZlcnNpb24gb2YgdGhlIFNESyB3aGVyZSB0aGUgZmxhZyBpcyBzdXBwb3J0ZWQgYnV0IGRpc2FibGVkIGJ5IGRlZmF1bHQuXG4gICAgLy8gSXQgaXMgYWxzbyB1c2VmdWwgZm9yIHRlc3RpbmcgcHVycG9zZS5cbiAgICBpZiAoIXRoaXMuaW5mby51bnNhZmUuaXNSZXBsYXlpbmcgJiYgZmxhZy5kZWZhdWx0KSB7XG4gICAgICB0aGlzLmtub3duRmxhZ3MuYWRkKGZsYWcuaWQpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLy8gV2hlbiByZXBsYXlpbmcsIGEgZmxhZyBpcyBjb25zaWRlcmVkIGVuYWJsZWQgaWYgaXQgd2FzIGVuYWJsZWQgZHVyaW5nIHRoZSBvcmlnaW5hbCBleGVjdXRpb24gb2ZcbiAgICAvLyB0aGF0IFdvcmtmbG93IFRhc2s7IHRoaXMgaXMgbm9ybWFsbHkgZGV0ZXJtaW5lZCBieSB0aGUgcHJlc2VuY2Ugb2YgdGhlIGZsYWcgSUQgaW4gdGhlIGNvcnJlc3BvbmRpbmdcbiAgICAvLyBXRlQgQ29tcGxldGVkJ3MgYHNka01ldGFkYXRhLmxhbmdVc2VkRmxhZ3NgLlxuICAgIC8vXG4gICAgLy8gU0RLIEZsYWcgQWx0ZXJuYXRlIENvbmRpdGlvbiBwcm92aWRlcyBhbiBhbHRlcm5hdGl2ZSB3YXkgb2YgZGV0ZXJtaW5pbmcgd2hldGhlciBhIGZsYWcgc2hvdWxkXG4gICAgLy8gYmUgY29uc2lkZXJlZCBhcyBlbmFibGVkIGZvciB0aGUgY3VycmVudCBXRlQ7IGUuZy4gYnkgbG9va2luZyBhdCB0aGUgdmVyc2lvbiBvZiB0aGUgU0RLIHRoYXRcbiAgICAvLyBlbWl0dGVkIGEgV0ZULiBUaGUgbWFpbiB1c2UgY2FzZSBmb3IgdGhpcyBpcyB0byByZXRyb2FjdGl2ZWx5IHR1cm4gb24gc29tZSBmbGFncyBmb3IgV0ZUIGVtaXR0ZWRcbiAgICAvLyBieSBwcmV2aW91cyBTREtzIHRoYXQgY29udGFpbmVkIGEgYnVnLiBBbHQgQ29uZGl0aW9ucyBzaG91bGQgb25seSBiZSB1c2VkIGFzIGEgbGFzdCByZXNvcnQuXG4gICAgLy9cbiAgICAvLyBOb3RlIHRoYXQgY29uZGl0aW9ucyBhcmUgb25seSBldmFsdWF0ZWQgd2hpbGUgcmVwbGF5aW5nLiBBbHNvLCBhbHRlcm5hdGUgY29uZGl0aW9ucyB3aWxsIG5vdFxuICAgIC8vIGNhdXNlIHRoZSBmbGFnIHRvIGJlIHBlcnNpc3RlZCB0byB0aGUgXCJ1c2VkIGZsYWdzXCIgc2V0LCB3aGljaCBtZWFucyB0aGF0IGZ1cnRoZXIgV29ya2Zsb3cgVGFza3NcbiAgICAvLyBtYXkgbm90IHJlZmxlY3QgdGhpcyBmbGFnIGlmIHRoZSBjb25kaXRpb24gbm8gbG9uZ2VyIGhvbGRzLiBUaGlzIGlzIHNvIHRvIGF2b2lkIGluY29ycmVjdFxuICAgIC8vIGJlaGF2aW9ycyBpbiBjYXNlIHdoZXJlIGEgV29ya2Zsb3cgRXhlY3V0aW9uIGhhcyBnb25lIHRocm91Z2ggYSBuZXdlciBTREsgdmVyc2lvbiB0aGVuIGFnYWluXG4gICAgLy8gdGhyb3VnaCBhbiBvbGRlciBvbmUuXG4gICAgaWYgKHRoaXMuaW5mby51bnNhZmUuaXNSZXBsYXlpbmcgJiYgZmxhZy5hbHRlcm5hdGl2ZUNvbmRpdGlvbnMpIHtcbiAgICAgIGZvciAoY29uc3QgY29uZCBvZiBmbGFnLmFsdGVybmF0aXZlQ29uZGl0aW9ucykge1xuICAgICAgICBpZiAoY29uZCh7IGluZm86IHRoaXMuaW5mbyB9KSkgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcHVibGljIHJlbW92ZUZyb21DYWNoZSgpOiB2b2lkIHtcbiAgICB0aHJvdyBuZXcgSWxsZWdhbFN0YXRlRXJyb3IoJ3JlbW92ZUZyb21DYWNoZSBhY3RpdmF0aW9uIGpvYiBzaG91bGQgbm90IHJlYWNoIHdvcmtmbG93Jyk7XG4gIH1cblxuICAvKipcbiAgICogVHJhbnNmb3JtcyBmYWlsdXJlcyBpbnRvIGEgY29tbWFuZCB0byBiZSBzZW50IHRvIHRoZSBzZXJ2ZXIuXG4gICAqIFVzZWQgdG8gaGFuZGxlIGFueSBmYWlsdXJlIGVtaXR0ZWQgYnkgdGhlIFdvcmtmbG93LlxuICAgKi9cbiAgYXN5bmMgaGFuZGxlV29ya2Zsb3dGYWlsdXJlKGVycm9yOiB1bmtub3duKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKHRoaXMuY2FuY2VsbGVkICYmIGlzQ2FuY2VsbGF0aW9uKGVycm9yKSkge1xuICAgICAgdGhpcy5wdXNoQ29tbWFuZCh7IGNhbmNlbFdvcmtmbG93RXhlY3V0aW9uOiB7fSB9LCB0cnVlKTtcbiAgICB9IGVsc2UgaWYgKGVycm9yIGluc3RhbmNlb2YgQ29udGludWVBc05ldykge1xuICAgICAgdGhpcy5wdXNoQ29tbWFuZCh7IGNvbnRpbnVlQXNOZXdXb3JrZmxvd0V4ZWN1dGlvbjogZXJyb3IuY29tbWFuZCB9LCB0cnVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKCEoZXJyb3IgaW5zdGFuY2VvZiBUZW1wb3JhbEZhaWx1cmUpKSB7XG4gICAgICAgIC8vIFRoaXMgcmVzdWx0cyBpbiBhbiB1bmhhbmRsZWQgcmVqZWN0aW9uIHdoaWNoIHdpbGwgZmFpbCB0aGUgYWN0aXZhdGlvblxuICAgICAgICAvLyBwcmV2ZW50aW5nIGl0IGZyb20gY29tcGxldGluZy5cbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICB9XG4gICAgICAvLyBGYWlsIHRoZSB3b3JrZmxvdy4gV2UgZG8gbm90IHdhbnQgdG8gaXNzdWUgdW5maW5pc2hlZEhhbmRsZXJzIHdhcm5pbmdzLiBUbyBhY2hpZXZlIHRoYXQsIHdlXG4gICAgICAvLyBtYXJrIGFsbCBoYW5kbGVycyBhcyBjb21wbGV0ZWQgbm93LlxuICAgICAgdGhpcy5pblByb2dyZXNzU2lnbmFscy5jbGVhcigpO1xuICAgICAgdGhpcy5pblByb2dyZXNzVXBkYXRlcy5jbGVhcigpO1xuICAgICAgdGhpcy5wdXNoQ29tbWFuZChcbiAgICAgICAge1xuICAgICAgICAgIGZhaWxXb3JrZmxvd0V4ZWN1dGlvbjoge1xuICAgICAgICAgICAgZmFpbHVyZTogdGhpcy5lcnJvclRvRmFpbHVyZShlcnJvciksXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAgdHJ1ZVxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGNvbXBsZXRlUXVlcnkocXVlcnlJZDogc3RyaW5nLCByZXN1bHQ6IHVua25vd24pOiB2b2lkIHtcbiAgICB0aGlzLnB1c2hDb21tYW5kKHtcbiAgICAgIHJlc3BvbmRUb1F1ZXJ5OiB7IHF1ZXJ5SWQsIHN1Y2NlZWRlZDogeyByZXNwb25zZTogdGhpcy5wYXlsb2FkQ29udmVydGVyLnRvUGF5bG9hZChyZXN1bHQpIH0gfSxcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgZmFpbFF1ZXJ5KHF1ZXJ5SWQ6IHN0cmluZywgZXJyb3I6IHVua25vd24pOiB2b2lkIHtcbiAgICB0aGlzLnB1c2hDb21tYW5kKHtcbiAgICAgIHJlc3BvbmRUb1F1ZXJ5OiB7XG4gICAgICAgIHF1ZXJ5SWQsXG4gICAgICAgIGZhaWxlZDogdGhpcy5lcnJvclRvRmFpbHVyZShlbnN1cmVUZW1wb3JhbEZhaWx1cmUoZXJyb3IpKSxcbiAgICAgIH0sXG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIGFjY2VwdFVwZGF0ZShwcm90b2NvbEluc3RhbmNlSWQ6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMucHVzaENvbW1hbmQoeyB1cGRhdGVSZXNwb25zZTogeyBwcm90b2NvbEluc3RhbmNlSWQsIGFjY2VwdGVkOiB7fSB9IH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBjb21wbGV0ZVVwZGF0ZShwcm90b2NvbEluc3RhbmNlSWQ6IHN0cmluZywgcmVzdWx0OiB1bmtub3duKTogdm9pZCB7XG4gICAgdGhpcy5wdXNoQ29tbWFuZCh7XG4gICAgICB1cGRhdGVSZXNwb25zZTogeyBwcm90b2NvbEluc3RhbmNlSWQsIGNvbXBsZXRlZDogdGhpcy5wYXlsb2FkQ29udmVydGVyLnRvUGF5bG9hZChyZXN1bHQpIH0sXG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIHJlamVjdFVwZGF0ZShwcm90b2NvbEluc3RhbmNlSWQ6IHN0cmluZywgZXJyb3I6IHVua25vd24pOiB2b2lkIHtcbiAgICB0aGlzLnB1c2hDb21tYW5kKHtcbiAgICAgIHVwZGF0ZVJlc3BvbnNlOiB7XG4gICAgICAgIHByb3RvY29sSW5zdGFuY2VJZCxcbiAgICAgICAgcmVqZWN0ZWQ6IHRoaXMuZXJyb3JUb0ZhaWx1cmUoZW5zdXJlVGVtcG9yYWxGYWlsdXJlKGVycm9yKSksXG4gICAgICB9LFxuICAgIH0pO1xuICB9XG5cbiAgLyoqIENvbnN1bWUgYSBjb21wbGV0aW9uIGlmIGl0IGV4aXN0cyBpbiBXb3JrZmxvdyBzdGF0ZSAqL1xuICBwcml2YXRlIG1heWJlQ29uc3VtZUNvbXBsZXRpb24odHlwZToga2V5b2YgQWN0aXZhdG9yWydjb21wbGV0aW9ucyddLCB0YXNrU2VxOiBudW1iZXIpOiBDb21wbGV0aW9uIHwgdW5kZWZpbmVkIHtcbiAgICBjb25zdCBjb21wbGV0aW9uID0gdGhpcy5jb21wbGV0aW9uc1t0eXBlXS5nZXQodGFza1NlcSk7XG4gICAgaWYgKGNvbXBsZXRpb24gIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5jb21wbGV0aW9uc1t0eXBlXS5kZWxldGUodGFza1NlcSk7XG4gICAgfVxuICAgIHJldHVybiBjb21wbGV0aW9uO1xuICB9XG5cbiAgLyoqIENvbnN1bWUgYSBjb21wbGV0aW9uIGlmIGl0IGV4aXN0cyBpbiBXb3JrZmxvdyBzdGF0ZSwgdGhyb3dzIGlmIGl0IGRvZXNuJ3QgKi9cbiAgcHJpdmF0ZSBjb25zdW1lQ29tcGxldGlvbih0eXBlOiBrZXlvZiBBY3RpdmF0b3JbJ2NvbXBsZXRpb25zJ10sIHRhc2tTZXE6IG51bWJlcik6IENvbXBsZXRpb24ge1xuICAgIGNvbnN0IGNvbXBsZXRpb24gPSB0aGlzLm1heWJlQ29uc3VtZUNvbXBsZXRpb24odHlwZSwgdGFza1NlcSk7XG4gICAgaWYgKGNvbXBsZXRpb24gPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IElsbGVnYWxTdGF0ZUVycm9yKGBObyBjb21wbGV0aW9uIGZvciB0YXNrU2VxICR7dGFza1NlcX1gKTtcbiAgICB9XG4gICAgcmV0dXJuIGNvbXBsZXRpb247XG4gIH1cblxuICBwcml2YXRlIGNvbXBsZXRlV29ya2Zsb3cocmVzdWx0OiB1bmtub3duKTogdm9pZCB7XG4gICAgdGhpcy5wdXNoQ29tbWFuZChcbiAgICAgIHtcbiAgICAgICAgY29tcGxldGVXb3JrZmxvd0V4ZWN1dGlvbjoge1xuICAgICAgICAgIHJlc3VsdDogdGhpcy5wYXlsb2FkQ29udmVydGVyLnRvUGF5bG9hZChyZXN1bHQpLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIHRydWVcbiAgICApO1xuICB9XG5cbiAgZXJyb3JUb0ZhaWx1cmUoZXJyOiB1bmtub3duKTogUHJvdG9GYWlsdXJlIHtcbiAgICByZXR1cm4gdGhpcy5mYWlsdXJlQ29udmVydGVyLmVycm9yVG9GYWlsdXJlKGVyciwgdGhpcy5wYXlsb2FkQ29udmVydGVyKTtcbiAgfVxuXG4gIGZhaWx1cmVUb0Vycm9yKGZhaWx1cmU6IFByb3RvRmFpbHVyZSk6IEVycm9yIHtcbiAgICByZXR1cm4gdGhpcy5mYWlsdXJlQ29udmVydGVyLmZhaWx1cmVUb0Vycm9yKGZhaWx1cmUsIHRoaXMucGF5bG9hZENvbnZlcnRlcik7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0U2VxPFQgZXh0ZW5kcyB7IHNlcT86IG51bWJlciB8IG51bGwgfT4oYWN0aXZhdGlvbjogVCk6IG51bWJlciB7XG4gIGNvbnN0IHNlcSA9IGFjdGl2YXRpb24uc2VxO1xuICBpZiAoc2VxID09PSB1bmRlZmluZWQgfHwgc2VxID09PSBudWxsKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgR290IGFjdGl2YXRpb24gd2l0aCBubyBzZXEgYXR0cmlidXRlYCk7XG4gIH1cbiAgcmV0dXJuIHNlcTtcbn1cblxuZnVuY3Rpb24gbWFrZVVuZmluaXNoZWRVcGRhdGVIYW5kbGVyTWVzc2FnZShoYW5kbGVyRXhlY3V0aW9uczogTWVzc2FnZUhhbmRsZXJFeGVjdXRpb25bXSk6IHN0cmluZyB7XG4gIGNvbnN0IG1lc3NhZ2UgPSBgXG5bVE1QUkwxMTAyXSBXb3JrZmxvdyBmaW5pc2hlZCB3aGlsZSBhbiB1cGRhdGUgaGFuZGxlciB3YXMgc3RpbGwgcnVubmluZy4gVGhpcyBtYXkgaGF2ZSBpbnRlcnJ1cHRlZCB3b3JrIHRoYXQgdGhlXG51cGRhdGUgaGFuZGxlciB3YXMgZG9pbmcsIGFuZCB0aGUgY2xpZW50IHRoYXQgc2VudCB0aGUgdXBkYXRlIHdpbGwgcmVjZWl2ZSBhICd3b3JrZmxvdyBleGVjdXRpb25cbmFscmVhZHkgY29tcGxldGVkJyBSUENFcnJvciBpbnN0ZWFkIG9mIHRoZSB1cGRhdGUgcmVzdWx0LiBZb3UgY2FuIHdhaXQgZm9yIGFsbCB1cGRhdGUgYW5kIHNpZ25hbFxuaGFuZGxlcnMgdG8gY29tcGxldGUgYnkgdXNpbmcgXFxgYXdhaXQgd29ya2Zsb3cuY29uZGl0aW9uKHdvcmtmbG93LmFsbEhhbmRsZXJzRmluaXNoZWQpXFxgLlxuQWx0ZXJuYXRpdmVseSwgaWYgYm90aCB5b3UgYW5kIHRoZSBjbGllbnRzIHNlbmRpbmcgdGhlIHVwZGF0ZSBhcmUgb2theSB3aXRoIGludGVycnVwdGluZyBydW5uaW5nIGhhbmRsZXJzXG53aGVuIHRoZSB3b3JrZmxvdyBmaW5pc2hlcywgYW5kIGNhdXNpbmcgY2xpZW50cyB0byByZWNlaXZlIGVycm9ycywgdGhlbiB5b3UgY2FuIGRpc2FibGUgdGhpcyB3YXJuaW5nIGJ5XG5wYXNzaW5nIGFuIG9wdGlvbiB3aGVuIHNldHRpbmcgdGhlIGhhbmRsZXI6XG5cXGB3b3JrZmxvdy5zZXRIYW5kbGVyKG15VXBkYXRlLCBteVVwZGF0ZUhhbmRsZXIsIHt1bmZpbmlzaGVkUG9saWN5OiBIYW5kbGVyVW5maW5pc2hlZFBvbGljeS5BQkFORE9OfSk7XFxgLmBcbiAgICAucmVwbGFjZSgvXFxuL2csICcgJylcbiAgICAudHJpbSgpO1xuXG4gIHJldHVybiBgJHttZXNzYWdlfSBUaGUgZm9sbG93aW5nIHVwZGF0ZXMgd2VyZSB1bmZpbmlzaGVkIChhbmQgd2FybmluZ3Mgd2VyZSBub3QgZGlzYWJsZWQgZm9yIHRoZWlyIGhhbmRsZXIpOiAke0pTT04uc3RyaW5naWZ5KFxuICAgIGhhbmRsZXJFeGVjdXRpb25zLm1hcCgoZXgpID0+ICh7IG5hbWU6IGV4Lm5hbWUsIGlkOiBleC5pZCB9KSlcbiAgKX1gO1xufVxuXG5mdW5jdGlvbiBtYWtlVW5maW5pc2hlZFNpZ25hbEhhbmRsZXJNZXNzYWdlKGhhbmRsZXJFeGVjdXRpb25zOiBNZXNzYWdlSGFuZGxlckV4ZWN1dGlvbltdKTogc3RyaW5nIHtcbiAgY29uc3QgbWVzc2FnZSA9IGBcbltUTVBSTDExMDJdIFdvcmtmbG93IGZpbmlzaGVkIHdoaWxlIGEgc2lnbmFsIGhhbmRsZXIgd2FzIHN0aWxsIHJ1bm5pbmcuIFRoaXMgbWF5IGhhdmUgaW50ZXJydXB0ZWQgd29yayB0aGF0IHRoZVxuc2lnbmFsIGhhbmRsZXIgd2FzIGRvaW5nLiBZb3UgY2FuIHdhaXQgZm9yIGFsbCB1cGRhdGUgYW5kIHNpZ25hbCBoYW5kbGVycyB0byBjb21wbGV0ZSBieSB1c2luZ1xuXFxgYXdhaXQgd29ya2Zsb3cuY29uZGl0aW9uKHdvcmtmbG93LmFsbEhhbmRsZXJzRmluaXNoZWQpXFxgLiBBbHRlcm5hdGl2ZWx5LCBpZiBib3RoIHlvdSBhbmQgdGhlXG5jbGllbnRzIHNlbmRpbmcgdGhlIHVwZGF0ZSBhcmUgb2theSB3aXRoIGludGVycnVwdGluZyBydW5uaW5nIGhhbmRsZXJzIHdoZW4gdGhlIHdvcmtmbG93IGZpbmlzaGVzLFxudGhlbiB5b3UgY2FuIGRpc2FibGUgdGhpcyB3YXJuaW5nIGJ5IHBhc3NpbmcgYW4gb3B0aW9uIHdoZW4gc2V0dGluZyB0aGUgaGFuZGxlcjpcblxcYHdvcmtmbG93LnNldEhhbmRsZXIobXlTaWduYWwsIG15U2lnbmFsSGFuZGxlciwge3VuZmluaXNoZWRQb2xpY3k6IEhhbmRsZXJVbmZpbmlzaGVkUG9saWN5LkFCQU5ET059KTtcXGAuYFxuXG4gICAgLnJlcGxhY2UoL1xcbi9nLCAnICcpXG4gICAgLnRyaW0oKTtcblxuICBjb25zdCBuYW1lcyA9IG5ldyBNYXA8c3RyaW5nLCBudW1iZXI+KCk7XG4gIGZvciAoY29uc3QgZXggb2YgaGFuZGxlckV4ZWN1dGlvbnMpIHtcbiAgICBjb25zdCBjb3VudCA9IG5hbWVzLmdldChleC5uYW1lKSB8fCAwO1xuICAgIG5hbWVzLnNldChleC5uYW1lLCBjb3VudCArIDEpO1xuICB9XG5cbiAgcmV0dXJuIGAke21lc3NhZ2V9IFRoZSBmb2xsb3dpbmcgc2lnbmFscyB3ZXJlIHVuZmluaXNoZWQgKGFuZCB3YXJuaW5ncyB3ZXJlIG5vdCBkaXNhYmxlZCBmb3IgdGhlaXIgaGFuZGxlcik6ICR7SlNPTi5zdHJpbmdpZnkoXG4gICAgQXJyYXkuZnJvbShuYW1lcy5lbnRyaWVzKCkpLm1hcCgoW25hbWUsIGNvdW50XSkgPT4gKHsgbmFtZSwgY291bnQgfSkpXG4gICl9YDtcbn1cbiIsImltcG9ydCB7IGNvbXBvc2VJbnRlcmNlcHRvcnMgfSBmcm9tICdAdGVtcG9yYWxpby9jb21tb24vbGliL2ludGVyY2VwdG9ycyc7XG5pbXBvcnQgeyBTZGtDb21wb25lbnQgfSBmcm9tICdAdGVtcG9yYWxpby9jb21tb24nO1xuaW1wb3J0IHsgdW50cmFja1Byb21pc2UgfSBmcm9tICcuL3N0YWNrLWhlbHBlcnMnO1xuaW1wb3J0IHsgdHlwZSBTaW5rLCB0eXBlIFNpbmtzLCBwcm94eVNpbmtzIH0gZnJvbSAnLi9zaW5rcyc7XG5pbXBvcnQgeyBpc0NhbmNlbGxhdGlvbiB9IGZyb20gJy4vZXJyb3JzJztcbmltcG9ydCB7IFdvcmtmbG93SW5mbywgQ29udGludWVBc05ldyB9IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5pbXBvcnQgeyBhc3NlcnRJbldvcmtmbG93Q29udGV4dCB9IGZyb20gJy4vZ2xvYmFsLWF0dHJpYnV0ZXMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFdvcmtmbG93TG9nZ2VyIGV4dGVuZHMgU2luayB7XG4gIHRyYWNlKG1lc3NhZ2U6IHN0cmluZywgYXR0cnM/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPik6IHZvaWQ7XG4gIGRlYnVnKG1lc3NhZ2U6IHN0cmluZywgYXR0cnM/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPik6IHZvaWQ7XG4gIGluZm8obWVzc2FnZTogc3RyaW5nLCBhdHRycz86IFJlY29yZDxzdHJpbmcsIHVua25vd24+KTogdm9pZDtcbiAgd2FybihtZXNzYWdlOiBzdHJpbmcsIGF0dHJzPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pOiB2b2lkO1xuICBlcnJvcihtZXNzYWdlOiBzdHJpbmcsIGF0dHJzPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pOiB2b2lkO1xufVxuXG4vKipcbiAqIFNpbmsgaW50ZXJmYWNlIGZvciBmb3J3YXJkaW5nIGxvZ3MgZnJvbSB0aGUgV29ya2Zsb3cgc2FuZGJveCB0byB0aGUgV29ya2VyXG4gKlxuICogQGRlcHJlY2F0ZWQgRG8gbm90IHVzZSBMb2dnZXJTaW5rcyBkaXJlY3RseS4gVG8gbG9nIGZyb20gV29ya2Zsb3cgY29kZSwgdXNlIHRoZSBgbG9nYCBvYmplY3RcbiAqICAgICAgICAgICAgIGV4cG9ydGVkIGJ5IHRoZSBgQHRlbXBvcmFsaW8vd29ya2Zsb3dgIHBhY2thZ2UuIFRvIGNhcHR1cmUgbG9nIG1lc3NhZ2VzIGVtaXR0ZWRcbiAqICAgICAgICAgICAgIGJ5IFdvcmtmbG93IGNvZGUsIHNldCB0aGUge0BsaW5rIFJ1bnRpbWUubG9nZ2VyfSBwcm9wZXJ0eS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBMb2dnZXJTaW5rc0RlcHJlY2F0ZWQgZXh0ZW5kcyBTaW5rcyB7XG4gIC8qKlxuICAgKiBAZGVwcmVjYXRlZCBEbyBub3QgdXNlIExvZ2dlclNpbmtzIGRpcmVjdGx5LiBUbyBsb2cgZnJvbSBXb3JrZmxvdyBjb2RlLCB1c2UgdGhlIGBsb2dgIG9iamVjdFxuICAgKiAgICAgICAgICAgICBleHBvcnRlZCBieSB0aGUgYEB0ZW1wb3JhbGlvL3dvcmtmbG93YCBwYWNrYWdlLiBUbyBjYXB0dXJlIGxvZyBtZXNzYWdlcyBlbWl0dGVkXG4gICAqICAgICAgICAgICAgIGJ5IFdvcmtmbG93IGNvZGUsIHNldCB0aGUge0BsaW5rIFJ1bnRpbWUubG9nZ2VyfSBwcm9wZXJ0eS5cbiAgICovXG4gIGRlZmF1bHRXb3JrZXJMb2dnZXI6IFdvcmtmbG93TG9nZ2VyO1xufVxuXG4vKipcbiAqIFNpbmsgaW50ZXJmYWNlIGZvciBmb3J3YXJkaW5nIGxvZ3MgZnJvbSB0aGUgV29ya2Zsb3cgc2FuZGJveCB0byB0aGUgV29ya2VyXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTG9nZ2VyU2lua3NJbnRlcm5hbCBleHRlbmRzIFNpbmtzIHtcbiAgX190ZW1wb3JhbF9sb2dnZXI6IFdvcmtmbG93TG9nZ2VyO1xufVxuXG5jb25zdCBsb2dnZXJTaW5rID0gcHJveHlTaW5rczxMb2dnZXJTaW5rc0ludGVybmFsPigpLl9fdGVtcG9yYWxfbG9nZ2VyO1xuXG4vKipcbiAqIFN5bWJvbCB1c2VkIGJ5IHRoZSBTREsgbG9nZ2VyIHRvIGV4dHJhY3QgYSB0aW1lc3RhbXAgZnJvbSBsb2cgYXR0cmlidXRlcy5cbiAqIEFsc28gZGVmaW5lZCBpbiBgd29ya2VyL2xvZ2dlci50c2AgLSBpbnRlbnRpb25hbGx5IG5vdCBzaGFyZWQuXG4gKi9cbmNvbnN0IExvZ1RpbWVzdGFtcCA9IFN5bWJvbC5mb3IoJ2xvZ190aW1lc3RhbXAnKTtcblxuLyoqXG4gKiBEZWZhdWx0IHdvcmtmbG93IGxvZ2dlci5cbiAqXG4gKiBUaGlzIGxvZ2dlciBpcyByZXBsYXktYXdhcmUgYW5kIHdpbGwgb21pdCBsb2cgbWVzc2FnZXMgb24gd29ya2Zsb3cgcmVwbGF5LiBNZXNzYWdlcyBlbWl0dGVkIGJ5IHRoaXMgbG9nZ2VyIGFyZVxuICogZnVubmVsbGVkIHRocm91Z2ggYSBzaW5rIHRoYXQgZm9yd2FyZHMgdGhlbSB0byB0aGUgbG9nZ2VyIHJlZ2lzdGVyZWQgb24ge0BsaW5rIFJ1bnRpbWUubG9nZ2VyfS5cbiAqXG4gKiBBdHRyaWJ1dGVzIGZyb20gdGhlIGN1cnJlbnQgV29ya2Zsb3cgRXhlY3V0aW9uIGNvbnRleHQgYXJlIGF1dG9tYXRpY2FsbHkgaW5jbHVkZWQgYXMgbWV0YWRhdGEgb24gZXZlcnkgbG9nXG4gKiBlbnRyaWVzLiBBbiBleHRyYSBgc2RrQ29tcG9uZW50YCBtZXRhZGF0YSBhdHRyaWJ1dGUgaXMgYWxzbyBhZGRlZCwgd2l0aCB2YWx1ZSBgd29ya2Zsb3dgOyB0aGlzIGNhbiBiZSB1c2VkIGZvclxuICogZmluZS1ncmFpbmVkIGZpbHRlcmluZyBvZiBsb2cgZW50cmllcyBmdXJ0aGVyIGRvd25zdHJlYW0uXG4gKlxuICogVG8gY3VzdG9taXplIGxvZyBhdHRyaWJ1dGVzLCByZWdpc3RlciBhIHtAbGluayBXb3JrZmxvd091dGJvdW5kQ2FsbHNJbnRlcmNlcHRvcn0gdGhhdCBpbnRlcmNlcHRzIHRoZVxuICogYGdldExvZ0F0dHJpYnV0ZXMoKWAgbWV0aG9kLlxuICpcbiAqIE5vdGljZSB0aGF0IHNpbmNlIHNpbmtzIGFyZSB1c2VkIHRvIHBvd2VyIHRoaXMgbG9nZ2VyLCBhbnkgbG9nIGF0dHJpYnV0ZXMgbXVzdCBiZSB0cmFuc2ZlcmFibGUgdmlhIHRoZVxuICoge0BsaW5rIGh0dHBzOi8vbm9kZWpzLm9yZy9hcGkvd29ya2VyX3RocmVhZHMuaHRtbCN3b3JrZXJfdGhyZWFkc19wb3J0X3Bvc3RtZXNzYWdlX3ZhbHVlX3RyYW5zZmVybGlzdCB8IHBvc3RNZXNzYWdlfVxuICogQVBJLlxuICpcbiAqIE5PVEU6IFNwZWNpZnlpbmcgYSBjdXN0b20gbG9nZ2VyIHRocm91Z2gge0BsaW5rIGRlZmF1bHRTaW5rfSBvciBieSBtYW51YWxseSByZWdpc3RlcmluZyBhIHNpbmsgbmFtZWRcbiAqIGBkZWZhdWx0V29ya2VyTG9nZ2VyYCBoYXMgYmVlbiBkZXByZWNhdGVkLiBQbGVhc2UgdXNlIHtAbGluayBSdW50aW1lLmxvZ2dlcn0gaW5zdGVhZC5cbiAqL1xuZXhwb3J0IGNvbnN0IGxvZzogV29ya2Zsb3dMb2dnZXIgPSBPYmplY3QuZnJvbUVudHJpZXMoXG4gIChbJ3RyYWNlJywgJ2RlYnVnJywgJ2luZm8nLCAnd2FybicsICdlcnJvciddIGFzIEFycmF5PGtleW9mIFdvcmtmbG93TG9nZ2VyPikubWFwKChsZXZlbCkgPT4ge1xuICAgIHJldHVybiBbXG4gICAgICBsZXZlbCxcbiAgICAgIChtZXNzYWdlOiBzdHJpbmcsIGF0dHJzPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pID0+IHtcbiAgICAgICAgY29uc3QgYWN0aXZhdG9yID0gYXNzZXJ0SW5Xb3JrZmxvd0NvbnRleHQoJ1dvcmtmbG93LmxvZyguLi4pIG1heSBvbmx5IGJlIHVzZWQgZnJvbSB3b3JrZmxvdyBjb250ZXh0LicpO1xuICAgICAgICBjb25zdCBnZXRMb2dBdHRyaWJ1dGVzID0gY29tcG9zZUludGVyY2VwdG9ycyhhY3RpdmF0b3IuaW50ZXJjZXB0b3JzLm91dGJvdW5kLCAnZ2V0TG9nQXR0cmlidXRlcycsIChhKSA9PiBhKTtcbiAgICAgICAgcmV0dXJuIGxvZ2dlclNpbmtbbGV2ZWxdKG1lc3NhZ2UsIHtcbiAgICAgICAgICAvLyBJbmplY3QgdGhlIGNhbGwgdGltZSBpbiBuYW5vc2Vjb25kIHJlc29sdXRpb24gYXMgZXhwZWN0ZWQgYnkgdGhlIHdvcmtlciBsb2dnZXIuXG4gICAgICAgICAgW0xvZ1RpbWVzdGFtcF06IGFjdGl2YXRvci5nZXRUaW1lT2ZEYXkoKSxcbiAgICAgICAgICBzZGtDb21wb25lbnQ6IFNka0NvbXBvbmVudC53b3JrZmxvdyxcbiAgICAgICAgICAuLi5nZXRMb2dBdHRyaWJ1dGVzKHdvcmtmbG93TG9nQXR0cmlidXRlcyhhY3RpdmF0b3IuaW5mbykpLFxuICAgICAgICAgIC4uLmF0dHJzLFxuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgXTtcbiAgfSlcbikgYXMgYW55O1xuXG5leHBvcnQgZnVuY3Rpb24gZXhlY3V0ZVdpdGhMaWZlY3ljbGVMb2dnaW5nKGZuOiAoKSA9PiBQcm9taXNlPHVua25vd24+KTogUHJvbWlzZTx1bmtub3duPiB7XG4gIGxvZy5kZWJ1ZygnV29ya2Zsb3cgc3RhcnRlZCcsIHsgc2RrQ29tcG9uZW50OiBTZGtDb21wb25lbnQud29ya2VyIH0pO1xuICBjb25zdCBwID0gZm4oKS50aGVuKFxuICAgIChyZXMpID0+IHtcbiAgICAgIGxvZy5kZWJ1ZygnV29ya2Zsb3cgY29tcGxldGVkJywgeyBzZGtDb21wb25lbnQ6IFNka0NvbXBvbmVudC53b3JrZXIgfSk7XG4gICAgICByZXR1cm4gcmVzO1xuICAgIH0sXG4gICAgKGVycm9yKSA9PiB7XG4gICAgICAvLyBBdm9pZCB1c2luZyBpbnN0YW5jZW9mIGNoZWNrcyBpbiBjYXNlIHRoZSBtb2R1bGVzIHRoZXkncmUgZGVmaW5lZCBpbiBsb2FkZWQgbW9yZSB0aGFuIG9uY2UsXG4gICAgICAvLyBlLmcuIGJ5IGplc3Qgb3Igd2hlbiBtdWx0aXBsZSB2ZXJzaW9ucyBhcmUgaW5zdGFsbGVkLlxuICAgICAgaWYgKHR5cGVvZiBlcnJvciA9PT0gJ29iamVjdCcgJiYgZXJyb3IgIT0gbnVsbCkge1xuICAgICAgICBpZiAoaXNDYW5jZWxsYXRpb24oZXJyb3IpKSB7XG4gICAgICAgICAgbG9nLmRlYnVnKCdXb3JrZmxvdyBjb21wbGV0ZWQgYXMgY2FuY2VsbGVkJywgeyBzZGtDb21wb25lbnQ6IFNka0NvbXBvbmVudC53b3JrZXIgfSk7XG4gICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgIH0gZWxzZSBpZiAoZXJyb3IgaW5zdGFuY2VvZiBDb250aW51ZUFzTmV3KSB7XG4gICAgICAgICAgbG9nLmRlYnVnKCdXb3JrZmxvdyBjb250aW51ZWQgYXMgbmV3JywgeyBzZGtDb21wb25lbnQ6IFNka0NvbXBvbmVudC53b3JrZXIgfSk7XG4gICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGxvZy53YXJuKCdXb3JrZmxvdyBmYWlsZWQnLCB7IGVycm9yLCBzZGtDb21wb25lbnQ6IFNka0NvbXBvbmVudC53b3JrZXIgfSk7XG4gICAgICB0aHJvdyBlcnJvcjtcbiAgICB9XG4gICk7XG4gIC8vIEF2b2lkIHNob3dpbmcgdGhpcyBpbnRlcmNlcHRvciBpbiBzdGFjayB0cmFjZSBxdWVyeVxuICB1bnRyYWNrUHJvbWlzZShwKTtcbiAgcmV0dXJuIHA7XG59XG5cbi8qKlxuICogUmV0dXJucyBhIG1hcCBvZiBhdHRyaWJ1dGVzIHRvIGJlIHNldCBfYnkgZGVmYXVsdF8gb24gbG9nIG1lc3NhZ2VzIGZvciBhIGdpdmVuIFdvcmtmbG93LlxuICogTm90ZSB0aGF0IHRoaXMgZnVuY3Rpb24gbWF5IGJlIGNhbGxlZCBmcm9tIG91dHNpZGUgb2YgdGhlIFdvcmtmbG93IGNvbnRleHQgKGVnLiBieSB0aGUgd29ya2VyIGl0c2VsZikuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB3b3JrZmxvd0xvZ0F0dHJpYnV0ZXMoaW5mbzogV29ya2Zsb3dJbmZvKTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4ge1xuICByZXR1cm4ge1xuICAgIG5hbWVzcGFjZTogaW5mby5uYW1lc3BhY2UsXG4gICAgdGFza1F1ZXVlOiBpbmZvLnRhc2tRdWV1ZSxcbiAgICB3b3JrZmxvd0lkOiBpbmZvLndvcmtmbG93SWQsXG4gICAgcnVuSWQ6IGluZm8ucnVuSWQsXG4gICAgd29ya2Zsb3dUeXBlOiBpbmZvLndvcmtmbG93VHlwZSxcbiAgfTtcbn1cbiIsIi8vIC4uL3BhY2thZ2UuanNvbiBpcyBvdXRzaWRlIG9mIHRoZSBUUyBwcm9qZWN0IHJvb3REaXIgd2hpY2ggY2F1c2VzIFRTIHRvIGNvbXBsYWluIGFib3V0IHRoaXMgaW1wb3J0LlxuLy8gV2UgZG8gbm90IHdhbnQgdG8gY2hhbmdlIHRoZSByb290RGlyIGJlY2F1c2UgaXQgbWVzc2VzIHVwIHRoZSBvdXRwdXQgc3RydWN0dXJlLlxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9iYW4tdHMtY29tbWVudFxuLy8gQHRzLWlnbm9yZVxuaW1wb3J0IHBrZyBmcm9tICcuLi9wYWNrYWdlLmpzb24nO1xuXG5leHBvcnQgZGVmYXVsdCBwa2cgYXMgeyBuYW1lOiBzdHJpbmc7IHZlcnNpb246IHN0cmluZyB9O1xuIiwiLyoqXG4gKiBUeXBlIGRlZmluaXRpb25zIGZvciB0aGUgV29ya2Zsb3cgZW5kIG9mIHRoZSBzaW5rcyBtZWNoYW5pc20uXG4gKlxuICogU2lua3MgYXJlIGEgbWVjaGFuaXNtIGZvciBleHBvcnRpbmcgZGF0YSBmcm9tIHRoZSBXb3JrZmxvdyBpc29sYXRlIHRvIHRoZVxuICogTm9kZS5qcyBlbnZpcm9ubWVudCwgdGhleSBhcmUgbmVjZXNzYXJ5IGJlY2F1c2UgdGhlIFdvcmtmbG93IGhhcyBubyB3YXkgdG9cbiAqIGNvbW11bmljYXRlIHdpdGggdGhlIG91dHNpZGUgV29ybGQuXG4gKlxuICogU2lua3MgYXJlIHR5cGljYWxseSB1c2VkIGZvciBleHBvcnRpbmcgbG9ncywgbWV0cmljcyBhbmQgdHJhY2VzIG91dCBmcm9tIHRoZVxuICogV29ya2Zsb3cuXG4gKlxuICogU2luayBmdW5jdGlvbnMgbWF5IG5vdCByZXR1cm4gdmFsdWVzIHRvIHRoZSBXb3JrZmxvdyBpbiBvcmRlciB0byBwcmV2ZW50XG4gKiBicmVha2luZyBkZXRlcm1pbmlzbS5cbiAqXG4gKiBAbW9kdWxlXG4gKi9cblxuaW1wb3J0IHsgV29ya2Zsb3dJbmZvIH0gZnJvbSAnLi9pbnRlcmZhY2VzJztcbmltcG9ydCB7IGFzc2VydEluV29ya2Zsb3dDb250ZXh0IH0gZnJvbSAnLi9nbG9iYWwtYXR0cmlidXRlcyc7XG5cbi8qKlxuICogQW55IGZ1bmN0aW9uIHNpZ25hdHVyZSBjYW4gYmUgdXNlZCBmb3IgU2luayBmdW5jdGlvbnMgYXMgbG9uZyBhcyB0aGUgcmV0dXJuIHR5cGUgaXMgYHZvaWRgLlxuICpcbiAqIFdoZW4gY2FsbGluZyBhIFNpbmsgZnVuY3Rpb24sIGFyZ3VtZW50cyBhcmUgY29waWVkIGZyb20gdGhlIFdvcmtmbG93IGlzb2xhdGUgdG8gdGhlIE5vZGUuanMgZW52aXJvbm1lbnQgdXNpbmdcbiAqIHtAbGluayBodHRwczovL25vZGVqcy5vcmcvYXBpL3dvcmtlcl90aHJlYWRzLmh0bWwjd29ya2VyX3RocmVhZHNfcG9ydF9wb3N0bWVzc2FnZV92YWx1ZV90cmFuc2Zlcmxpc3QgfCBwb3N0TWVzc2FnZX0uXG5cbiAqIFRoaXMgY29uc3RyYWlucyB0aGUgYXJndW1lbnQgdHlwZXMgdG8gcHJpbWl0aXZlcyAoZXhjbHVkaW5nIFN5bWJvbHMpLlxuICovXG5leHBvcnQgdHlwZSBTaW5rRnVuY3Rpb24gPSAoLi4uYXJnczogYW55W10pID0+IHZvaWQ7XG5cbi8qKiBBIG1hcHBpbmcgb2YgbmFtZSB0byBmdW5jdGlvbiwgZGVmaW5lcyBhIHNpbmdsZSBzaW5rIChlLmcuIGxvZ2dlcikgKi9cbmV4cG9ydCB0eXBlIFNpbmsgPSBSZWNvcmQ8c3RyaW5nLCBTaW5rRnVuY3Rpb24+O1xuLyoqXG4gKiBXb3JrZmxvdyBTaW5rIGFyZSBhIG1hcHBpbmcgb2YgbmFtZSB0byB7QGxpbmsgU2lua31cbiAqL1xuZXhwb3J0IHR5cGUgU2lua3MgPSBSZWNvcmQ8c3RyaW5nLCBTaW5rPjtcblxuLyoqXG4gKiBDYWxsIGluZm9ybWF0aW9uIGZvciBhIFNpbmtcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBTaW5rQ2FsbCB7XG4gIGlmYWNlTmFtZTogc3RyaW5nO1xuICBmbk5hbWU6IHN0cmluZztcbiAgYXJnczogYW55W107XG4gIHdvcmtmbG93SW5mbzogV29ya2Zsb3dJbmZvO1xufVxuXG4vKipcbiAqIEdldCBhIHJlZmVyZW5jZSB0byBTaW5rcyBmb3IgZXhwb3J0aW5nIGRhdGEgb3V0IG9mIHRoZSBXb3JrZmxvdy5cbiAqXG4gKiBUaGVzZSBTaW5rcyAqKm11c3QqKiBiZSByZWdpc3RlcmVkIHdpdGggdGhlIFdvcmtlciBpbiBvcmRlciBmb3IgdGhpc1xuICogbWVjaGFuaXNtIHRvIHdvcmsuXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBwcm94eVNpbmtzLCBTaW5rcyB9IGZyb20gJ0B0ZW1wb3JhbGlvL3dvcmtmbG93JztcbiAqXG4gKiBpbnRlcmZhY2UgTXlTaW5rcyBleHRlbmRzIFNpbmtzIHtcbiAqICAgbG9nZ2VyOiB7XG4gKiAgICAgaW5mbyhtZXNzYWdlOiBzdHJpbmcpOiB2b2lkO1xuICogICAgIGVycm9yKG1lc3NhZ2U6IHN0cmluZyk6IHZvaWQ7XG4gKiAgIH07XG4gKiB9XG4gKlxuICogY29uc3QgeyBsb2dnZXIgfSA9IHByb3h5U2lua3M8TXlEZXBlbmRlbmNpZXM+KCk7XG4gKiBsb2dnZXIuaW5mbygnc2V0dGluZyB1cCcpO1xuICpcbiAqIGV4cG9ydCBmdW5jdGlvbiBteVdvcmtmbG93KCkge1xuICogICByZXR1cm4ge1xuICogICAgIGFzeW5jIGV4ZWN1dGUoKSB7XG4gKiAgICAgICBsb2dnZXIuaW5mbyhcImhleSBob1wiKTtcbiAqICAgICAgIGxvZ2dlci5lcnJvcihcImxldHMgZ29cIik7XG4gKiAgICAgfVxuICogICB9O1xuICogfVxuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwcm94eVNpbmtzPFQgZXh0ZW5kcyBTaW5rcz4oKTogVCB7XG4gIHJldHVybiBuZXcgUHJveHkoXG4gICAge30sXG4gICAge1xuICAgICAgZ2V0KF8sIGlmYWNlTmFtZSkge1xuICAgICAgICByZXR1cm4gbmV3IFByb3h5KFxuICAgICAgICAgIHt9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIGdldChfLCBmbk5hbWUpIHtcbiAgICAgICAgICAgICAgcmV0dXJuICguLi5hcmdzOiBhbnlbXSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGFjdGl2YXRvciA9IGFzc2VydEluV29ya2Zsb3dDb250ZXh0KFxuICAgICAgICAgICAgICAgICAgJ1Byb3hpZWQgc2lua3MgZnVuY3Rpb25zIG1heSBvbmx5IGJlIHVzZWQgZnJvbSBhIFdvcmtmbG93IEV4ZWN1dGlvbi4nXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICBhY3RpdmF0b3Iuc2lua0NhbGxzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgaWZhY2VOYW1lOiBpZmFjZU5hbWUgYXMgc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgZm5OYW1lOiBmbk5hbWUgYXMgc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgLy8gU2luayBmdW5jdGlvbiBkb2Vzbid0IGdldCBjYWxsZWQgaW1tZWRpYXRlbHkuIE1ha2UgYSBjbG9uZSBvZiB0aGUgc2luaydzIGFyZ3MsIHNvIHRoYXQgZnVydGhlciBtdXRhdGlvbnNcbiAgICAgICAgICAgICAgICAgIC8vIHRvIHRoZXNlIG9iamVjdHMgZG9uJ3QgY29ycnVwdCB0aGUgYXJncyB0aGF0IHRoZSBzaW5rIGZ1bmN0aW9uIHdpbGwgcmVjZWl2ZS4gT25seSBhdmFpbGFibGUgZnJvbSBub2RlIDE3LlxuICAgICAgICAgICAgICAgICAgYXJnczogKGdsb2JhbFRoaXMgYXMgYW55KS5zdHJ1Y3R1cmVkQ2xvbmUgPyAoZ2xvYmFsVGhpcyBhcyBhbnkpLnN0cnVjdHVyZWRDbG9uZShhcmdzKSA6IGFyZ3MsXG4gICAgICAgICAgICAgICAgICAvLyBhY3RpdmF0b3IuaW5mbyBpcyBpbnRlcm5hbGx5IGNvcHktb24td3JpdGUuIFRoaXMgZW5zdXJlIHRoYXQgYW55IGZ1cnRoZXIgbXV0YXRpb25zXG4gICAgICAgICAgICAgICAgICAvLyB0byB0aGUgd29ya2Zsb3cgc3RhdGUgaW4gdGhlIGNvbnRleHQgb2YgdGhlIHByZXNlbnQgYWN0aXZhdGlvbiB3aWxsIG5vdCBjb3JydXB0IHRoZVxuICAgICAgICAgICAgICAgICAgLy8gd29ya2Zsb3dJbmZvIHN0YXRlIHRoYXQgZ2V0cyBwYXNzZWQgd2hlbiB0aGUgc2luayBmdW5jdGlvbiBhY3R1YWxseSBnZXRzIGNhbGxlZC5cbiAgICAgICAgICAgICAgICAgIHdvcmtmbG93SW5mbzogYWN0aXZhdG9yLmluZm8sXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICAgIH0sXG4gICAgfVxuICApIGFzIGFueTtcbn1cbiIsImltcG9ydCB7IG1heWJlR2V0QWN0aXZhdG9yVW50eXBlZCB9IGZyb20gJy4vZ2xvYmFsLWF0dHJpYnV0ZXMnO1xuaW1wb3J0IHR5cGUgeyBQcm9taXNlU3RhY2tTdG9yZSB9IGZyb20gJy4vaW50ZXJuYWxzJztcblxuLyoqXG4gKiBIZWxwZXIgZnVuY3Rpb24gdG8gcmVtb3ZlIGEgcHJvbWlzZSBmcm9tIGJlaW5nIHRyYWNrZWQgZm9yIHN0YWNrIHRyYWNlIHF1ZXJ5IHB1cnBvc2VzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1bnRyYWNrUHJvbWlzZShwcm9taXNlOiBQcm9taXNlPHVua25vd24+KTogdm9pZCB7XG4gIGNvbnN0IHN0b3JlID0gKG1heWJlR2V0QWN0aXZhdG9yVW50eXBlZCgpIGFzIGFueSk/LnByb21pc2VTdGFja1N0b3JlIGFzIFByb21pc2VTdGFja1N0b3JlIHwgdW5kZWZpbmVkO1xuICBpZiAoIXN0b3JlKSByZXR1cm47XG4gIHN0b3JlLmNoaWxkVG9QYXJlbnQuZGVsZXRlKHByb21pc2UpO1xuICBzdG9yZS5wcm9taXNlVG9TdGFjay5kZWxldGUocHJvbWlzZSk7XG59XG4iLCJpbXBvcnQgeyBDYW5jZWxsYXRpb25TY29wZSB9IGZyb20gJy4vY2FuY2VsbGF0aW9uLXNjb3BlJztcbmltcG9ydCB7IHVudHJhY2tQcm9taXNlIH0gZnJvbSAnLi9zdGFjay1oZWxwZXJzJztcblxuLyoqXG4gKiBBIGBQcm9taXNlTGlrZWAgaGVscGVyIHdoaWNoIGV4cG9zZXMgaXRzIGByZXNvbHZlYCBhbmQgYHJlamVjdGAgbWV0aG9kcy5cbiAqXG4gKiBUcmlnZ2VyIGlzIENhbmNlbGxhdGlvblNjb3BlLWF3YXJlOiBpdCBpcyBsaW5rZWQgdG8gdGhlIGN1cnJlbnQgc2NvcGUgb25cbiAqIGNvbnN0cnVjdGlvbiBhbmQgdGhyb3dzIHdoZW4gdGhhdCBzY29wZSBpcyBjYW5jZWxsZWQuXG4gKlxuICogVXNlZnVsIGZvciBlLmcuIHdhaXRpbmcgZm9yIHVuYmxvY2tpbmcgYSBXb3JrZmxvdyBmcm9tIGEgU2lnbmFsLlxuICpcbiAqIEBleGFtcGxlXG4gKiA8IS0tU05JUFNUQVJUIHR5cGVzY3JpcHQtdHJpZ2dlci13b3JrZmxvdy0tPlxuICogPCEtLVNOSVBFTkQtLT5cbiAqL1xuZXhwb3J0IGNsYXNzIFRyaWdnZXI8VD4gaW1wbGVtZW50cyBQcm9taXNlTGlrZTxUPiB7XG4gIC8vIFR5cGVzY3JpcHQgZG9lcyBub3QgcmVhbGl6ZSB0aGF0IHRoZSBwcm9taXNlIGV4ZWN1dG9yIGlzIHJ1biBzeW5jaHJvbm91c2x5IGluIHRoZSBjb25zdHJ1Y3RvclxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L2Jhbi10cy1jb21tZW50XG4gIC8vIEB0cy1pZ25vcmVcbiAgcHVibGljIHJlYWRvbmx5IHJlc29sdmU6ICh2YWx1ZTogVCB8IFByb21pc2VMaWtlPFQ+KSA9PiB2b2lkO1xuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L2Jhbi10cy1jb21tZW50XG4gIC8vIEB0cy1pZ25vcmVcbiAgcHVibGljIHJlYWRvbmx5IHJlamVjdDogKHJlYXNvbj86IGFueSkgPT4gdm9pZDtcbiAgcHJvdGVjdGVkIHJlYWRvbmx5IHByb21pc2U6IFByb21pc2U8VD47XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5wcm9taXNlID0gbmV3IFByb21pc2U8VD4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3Qgc2NvcGUgPSBDYW5jZWxsYXRpb25TY29wZS5jdXJyZW50KCk7XG4gICAgICBpZiAoc2NvcGUuY2FuY2VsbGFibGUpIHtcbiAgICAgICAgdW50cmFja1Byb21pc2Uoc2NvcGUuY2FuY2VsUmVxdWVzdGVkLmNhdGNoKHJlamVjdCkpO1xuICAgICAgfVxuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9iYW4tdHMtY29tbWVudFxuICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgdGhpcy5yZXNvbHZlID0gcmVzb2x2ZTtcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvYmFuLXRzLWNvbW1lbnRcbiAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgIHRoaXMucmVqZWN0ID0gcmVqZWN0O1xuICAgIH0pO1xuICAgIC8vIEF2b2lkIHVuaGFuZGxlZCByZWplY3Rpb25zXG4gICAgdW50cmFja1Byb21pc2UodGhpcy5wcm9taXNlLmNhdGNoKCgpID0+IHVuZGVmaW5lZCkpO1xuICB9XG5cbiAgdGhlbjxUUmVzdWx0MSA9IFQsIFRSZXN1bHQyID0gbmV2ZXI+KFxuICAgIG9uZnVsZmlsbGVkPzogKCh2YWx1ZTogVCkgPT4gVFJlc3VsdDEgfCBQcm9taXNlTGlrZTxUUmVzdWx0MT4pIHwgdW5kZWZpbmVkIHwgbnVsbCxcbiAgICBvbnJlamVjdGVkPzogKChyZWFzb246IGFueSkgPT4gVFJlc3VsdDIgfCBQcm9taXNlTGlrZTxUUmVzdWx0Mj4pIHwgdW5kZWZpbmVkIHwgbnVsbFxuICApOiBQcm9taXNlTGlrZTxUUmVzdWx0MSB8IFRSZXN1bHQyPiB7XG4gICAgcmV0dXJuIHRoaXMucHJvbWlzZS50aGVuKG9uZnVsZmlsbGVkLCBvbnJlamVjdGVkKTtcbiAgfVxufVxuIiwiaW1wb3J0IHR5cGUgeyBBc3luY0xvY2FsU3RvcmFnZSBhcyBBTFMgfSBmcm9tICdub2RlOmFzeW5jX2hvb2tzJztcblxuLyoqXG4gKiBPcHRpb24gZm9yIGNvbnN0cnVjdGluZyBhIFVwZGF0ZVNjb3BlXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgVXBkYXRlU2NvcGVPcHRpb25zIHtcbiAgLyoqXG4gICAqICBBIHdvcmtmbG93LXVuaXF1ZSBpZGVudGlmaWVyIGZvciB0aGlzIHVwZGF0ZS5cbiAgICovXG4gIGlkOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqICBUaGUgdXBkYXRlIHR5cGUgbmFtZS5cbiAgICovXG4gIG5hbWU6IHN0cmluZztcbn1cblxuLy8gQXN5bmNMb2NhbFN0b3JhZ2UgaXMgaW5qZWN0ZWQgdmlhIHZtIG1vZHVsZSBpbnRvIGdsb2JhbCBzY29wZS5cbi8vIEluIGNhc2UgV29ya2Zsb3cgY29kZSBpcyBpbXBvcnRlZCBpbiBOb2RlLmpzIGNvbnRleHQsIHJlcGxhY2Ugd2l0aCBhbiBlbXB0eSBjbGFzcy5cbmV4cG9ydCBjb25zdCBBc3luY0xvY2FsU3RvcmFnZTogbmV3IDxUPigpID0+IEFMUzxUPiA9IChnbG9iYWxUaGlzIGFzIGFueSkuQXN5bmNMb2NhbFN0b3JhZ2UgPz8gY2xhc3Mge307XG5cbmV4cG9ydCBjbGFzcyBVcGRhdGVTY29wZSB7XG4gIC8qKlxuICAgKiAgQSB3b3JrZmxvdy11bmlxdWUgaWRlbnRpZmllciBmb3IgdGhpcyB1cGRhdGUuXG4gICAqL1xuICBwdWJsaWMgcmVhZG9ubHkgaWQ6IHN0cmluZztcblxuICAvKipcbiAgICogIFRoZSB1cGRhdGUgdHlwZSBuYW1lLlxuICAgKi9cbiAgcHVibGljIHJlYWRvbmx5IG5hbWU6IHN0cmluZztcblxuICBjb25zdHJ1Y3RvcihvcHRpb25zOiBVcGRhdGVTY29wZU9wdGlvbnMpIHtcbiAgICB0aGlzLmlkID0gb3B0aW9ucy5pZDtcbiAgICB0aGlzLm5hbWUgPSBvcHRpb25zLm5hbWU7XG4gIH1cblxuICAvKipcbiAgICogQWN0aXZhdGUgdGhlIHNjb3BlIGFzIGN1cnJlbnQgYW5kIHJ1biB0aGUgdXBkYXRlIGhhbmRsZXIgYGZuYC5cbiAgICpcbiAgICogQHJldHVybiB0aGUgcmVzdWx0IG9mIGBmbmBcbiAgICovXG4gIHJ1bjxUPihmbjogKCkgPT4gUHJvbWlzZTxUPik6IFByb21pc2U8VD4ge1xuICAgIHJldHVybiBzdG9yYWdlLnJ1bih0aGlzLCBmbik7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBjdXJyZW50IFwiYWN0aXZlXCIgdXBkYXRlIHNjb3BlLlxuICAgKi9cbiAgc3RhdGljIGN1cnJlbnQoKTogVXBkYXRlU2NvcGUgfCB1bmRlZmluZWQge1xuICAgIHJldHVybiBzdG9yYWdlLmdldFN0b3JlKCk7XG4gIH1cblxuICAvKiogQWxpYXMgdG8gYG5ldyBVcGRhdGVTY29wZSh7IGlkLCBuYW1lIH0pLnJ1bihmbilgICovXG4gIHN0YXRpYyB1cGRhdGVXaXRoSW5mbzxUPihpZDogc3RyaW5nLCBuYW1lOiBzdHJpbmcsIGZuOiAoKSA9PiBQcm9taXNlPFQ+KTogUHJvbWlzZTxUPiB7XG4gICAgcmV0dXJuIG5ldyB0aGlzKHsgaWQsIG5hbWUgfSkucnVuKGZuKTtcbiAgfVxufVxuXG5jb25zdCBzdG9yYWdlID0gbmV3IEFzeW5jTG9jYWxTdG9yYWdlPFVwZGF0ZVNjb3BlPigpO1xuXG4vKipcbiAqIERpc2FibGUgdGhlIGFzeW5jIGxvY2FsIHN0b3JhZ2UgZm9yIHVwZGF0ZXMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkaXNhYmxlVXBkYXRlU3RvcmFnZSgpOiB2b2lkIHtcbiAgc3RvcmFnZS5kaXNhYmxlKCk7XG59XG4iLCIvKipcbiAqIEV4cG9ydGVkIGZ1bmN0aW9ucyBmb3IgdGhlIFdvcmtlciB0byBpbnRlcmFjdCB3aXRoIHRoZSBXb3JrZmxvdyBpc29sYXRlXG4gKlxuICogQG1vZHVsZVxuICovXG5pbXBvcnQgeyBJbGxlZ2FsU3RhdGVFcnJvciB9IGZyb20gJ0B0ZW1wb3JhbGlvL2NvbW1vbic7XG5pbXBvcnQgeyBjb21wb3NlSW50ZXJjZXB0b3JzIH0gZnJvbSAnQHRlbXBvcmFsaW8vY29tbW9uL2xpYi9pbnRlcmNlcHRvcnMnO1xuaW1wb3J0IHsgY29yZXNkayB9IGZyb20gJ0B0ZW1wb3JhbGlvL3Byb3RvJztcbmltcG9ydCB7IGRpc2FibGVTdG9yYWdlIH0gZnJvbSAnLi9jYW5jZWxsYXRpb24tc2NvcGUnO1xuaW1wb3J0IHsgZGlzYWJsZVVwZGF0ZVN0b3JhZ2UgfSBmcm9tICcuL3VwZGF0ZS1zY29wZSc7XG5pbXBvcnQgeyBXb3JrZmxvd0ludGVyY2VwdG9yc0ZhY3RvcnkgfSBmcm9tICcuL2ludGVyY2VwdG9ycyc7XG5pbXBvcnQgeyBXb3JrZmxvd0NyZWF0ZU9wdGlvbnNJbnRlcm5hbCB9IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5pbXBvcnQgeyBBY3RpdmF0b3IgfSBmcm9tICcuL2ludGVybmFscyc7XG5pbXBvcnQgeyBzZXRBY3RpdmF0b3JVbnR5cGVkLCBnZXRBY3RpdmF0b3IgfSBmcm9tICcuL2dsb2JhbC1hdHRyaWJ1dGVzJztcblxuLy8gRXhwb3J0IHRoZSB0eXBlIGZvciB1c2Ugb24gdGhlIFwid29ya2VyXCIgc2lkZVxuZXhwb3J0IHsgUHJvbWlzZVN0YWNrU3RvcmUgfSBmcm9tICcuL2ludGVybmFscyc7XG5cbmNvbnN0IGdsb2JhbCA9IGdsb2JhbFRoaXMgYXMgYW55O1xuY29uc3QgT3JpZ2luYWxEYXRlID0gZ2xvYmFsVGhpcy5EYXRlO1xuXG4vKipcbiAqIEluaXRpYWxpemUgdGhlIGlzb2xhdGUgcnVudGltZS5cbiAqXG4gKiBTZXRzIHJlcXVpcmVkIGludGVybmFsIHN0YXRlIGFuZCBpbnN0YW50aWF0ZXMgdGhlIHdvcmtmbG93IGFuZCBpbnRlcmNlcHRvcnMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbml0UnVudGltZShvcHRpb25zOiBXb3JrZmxvd0NyZWF0ZU9wdGlvbnNJbnRlcm5hbCk6IHZvaWQge1xuICBjb25zdCBhY3RpdmF0b3IgPSBuZXcgQWN0aXZhdG9yKHtcbiAgICAuLi5vcHRpb25zLFxuICAgIGluZm86IGZpeFByb3RvdHlwZXMoe1xuICAgICAgLi4ub3B0aW9ucy5pbmZvLFxuICAgICAgdW5zYWZlOiB7IC4uLm9wdGlvbnMuaW5mby51bnNhZmUsIG5vdzogT3JpZ2luYWxEYXRlLm5vdyB9LFxuICAgIH0pLFxuICB9KTtcbiAgLy8gVGhlcmUncyBvbmUgYWN0aXZhdG9yIHBlciB3b3JrZmxvdyBpbnN0YW5jZSwgc2V0IGl0IGdsb2JhbGx5IG9uIHRoZSBjb250ZXh0LlxuICAvLyBXZSBkbyB0aGlzIGJlZm9yZSBpbXBvcnRpbmcgYW55IHVzZXIgY29kZSBzbyB1c2VyIGNvZGUgY2FuIHN0YXRpY2FsbHkgcmVmZXJlbmNlIEB0ZW1wb3JhbGlvL3dvcmtmbG93IGZ1bmN0aW9uc1xuICAvLyBhcyB3ZWxsIGFzIERhdGUgYW5kIE1hdGgucmFuZG9tLlxuICBzZXRBY3RpdmF0b3JVbnR5cGVkKGFjdGl2YXRvcik7XG5cbiAgLy8gd2VicGFjayBhbGlhcyB0byBwYXlsb2FkQ29udmVydGVyUGF0aFxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXZhci1yZXF1aXJlc1xuICBjb25zdCBjdXN0b21QYXlsb2FkQ29udmVydGVyID0gcmVxdWlyZSgnX190ZW1wb3JhbF9jdXN0b21fcGF5bG9hZF9jb252ZXJ0ZXInKS5wYXlsb2FkQ29udmVydGVyO1xuICAvLyBUaGUgYHBheWxvYWRDb252ZXJ0ZXJgIGV4cG9ydCBpcyB2YWxpZGF0ZWQgaW4gdGhlIFdvcmtlclxuICBpZiAoY3VzdG9tUGF5bG9hZENvbnZlcnRlciAhPSBudWxsKSB7XG4gICAgYWN0aXZhdG9yLnBheWxvYWRDb252ZXJ0ZXIgPSBjdXN0b21QYXlsb2FkQ29udmVydGVyO1xuICB9XG4gIC8vIHdlYnBhY2sgYWxpYXMgdG8gZmFpbHVyZUNvbnZlcnRlclBhdGhcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby12YXItcmVxdWlyZXNcbiAgY29uc3QgY3VzdG9tRmFpbHVyZUNvbnZlcnRlciA9IHJlcXVpcmUoJ19fdGVtcG9yYWxfY3VzdG9tX2ZhaWx1cmVfY29udmVydGVyJykuZmFpbHVyZUNvbnZlcnRlcjtcbiAgLy8gVGhlIGBmYWlsdXJlQ29udmVydGVyYCBleHBvcnQgaXMgdmFsaWRhdGVkIGluIHRoZSBXb3JrZXJcbiAgaWYgKGN1c3RvbUZhaWx1cmVDb252ZXJ0ZXIgIT0gbnVsbCkge1xuICAgIGFjdGl2YXRvci5mYWlsdXJlQ29udmVydGVyID0gY3VzdG9tRmFpbHVyZUNvbnZlcnRlcjtcbiAgfVxuXG4gIGNvbnN0IHsgaW1wb3J0V29ya2Zsb3dzLCBpbXBvcnRJbnRlcmNlcHRvcnMgfSA9IGdsb2JhbC5fX1RFTVBPUkFMX187XG4gIGlmIChpbXBvcnRXb3JrZmxvd3MgPT09IHVuZGVmaW5lZCB8fCBpbXBvcnRJbnRlcmNlcHRvcnMgPT09IHVuZGVmaW5lZCkge1xuICAgIHRocm93IG5ldyBJbGxlZ2FsU3RhdGVFcnJvcignV29ya2Zsb3cgYnVuZGxlIGRpZCBub3QgcmVnaXN0ZXIgaW1wb3J0IGhvb2tzJyk7XG4gIH1cblxuICBjb25zdCBpbnRlcmNlcHRvcnMgPSBpbXBvcnRJbnRlcmNlcHRvcnMoKTtcbiAgZm9yIChjb25zdCBtb2Qgb2YgaW50ZXJjZXB0b3JzKSB7XG4gICAgY29uc3QgZmFjdG9yeTogV29ya2Zsb3dJbnRlcmNlcHRvcnNGYWN0b3J5ID0gbW9kLmludGVyY2VwdG9ycztcbiAgICBpZiAoZmFjdG9yeSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBpZiAodHlwZW9mIGZhY3RvcnkgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgRmFpbGVkIHRvIGluaXRpYWxpemUgd29ya2Zsb3dzIGludGVyY2VwdG9yczogZXhwZWN0ZWQgYSBmdW5jdGlvbiwgYnV0IGdvdDogJyR7ZmFjdG9yeX0nYCk7XG4gICAgICB9XG4gICAgICBjb25zdCBpbnRlcmNlcHRvcnMgPSBmYWN0b3J5KCk7XG4gICAgICBhY3RpdmF0b3IuaW50ZXJjZXB0b3JzLmluYm91bmQucHVzaCguLi4oaW50ZXJjZXB0b3JzLmluYm91bmQgPz8gW10pKTtcbiAgICAgIGFjdGl2YXRvci5pbnRlcmNlcHRvcnMub3V0Ym91bmQucHVzaCguLi4oaW50ZXJjZXB0b3JzLm91dGJvdW5kID8/IFtdKSk7XG4gICAgICBhY3RpdmF0b3IuaW50ZXJjZXB0b3JzLmludGVybmFscy5wdXNoKC4uLihpbnRlcmNlcHRvcnMuaW50ZXJuYWxzID8/IFtdKSk7XG4gICAgfVxuICB9XG5cbiAgY29uc3QgbW9kID0gaW1wb3J0V29ya2Zsb3dzKCk7XG4gIGNvbnN0IHdvcmtmbG93Rm4gPSBtb2RbYWN0aXZhdG9yLmluZm8ud29ya2Zsb3dUeXBlXTtcbiAgY29uc3QgZGVmYXVsdFdvcmtmbG93Rm4gPSBtb2RbJ2RlZmF1bHQnXTtcblxuICBpZiAodHlwZW9mIHdvcmtmbG93Rm4gPT09ICdmdW5jdGlvbicpIHtcbiAgICBhY3RpdmF0b3Iud29ya2Zsb3cgPSB3b3JrZmxvd0ZuO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBkZWZhdWx0V29ya2Zsb3dGbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGFjdGl2YXRvci53b3JrZmxvdyA9IGRlZmF1bHRXb3JrZmxvd0ZuO1xuICB9IGVsc2Uge1xuICAgIGNvbnN0IGRldGFpbHMgPVxuICAgICAgd29ya2Zsb3dGbiA9PT0gdW5kZWZpbmVkXG4gICAgICAgID8gJ25vIHN1Y2ggZnVuY3Rpb24gaXMgZXhwb3J0ZWQgYnkgdGhlIHdvcmtmbG93IGJ1bmRsZSdcbiAgICAgICAgOiBgZXhwZWN0ZWQgYSBmdW5jdGlvbiwgYnV0IGdvdDogJyR7dHlwZW9mIHdvcmtmbG93Rm59J2A7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgRmFpbGVkIHRvIGluaXRpYWxpemUgd29ya2Zsb3cgb2YgdHlwZSAnJHthY3RpdmF0b3IuaW5mby53b3JrZmxvd1R5cGV9JzogJHtkZXRhaWxzfWApO1xuICB9XG59XG5cbi8qKlxuICogT2JqZWN0cyB0cmFuc2ZlcmVkIHRvIHRoZSBWTSBmcm9tIG91dHNpZGUgaGF2ZSBwcm90b3R5cGVzIGJlbG9uZ2luZyB0byB0aGVcbiAqIG91dGVyIGNvbnRleHQsIHdoaWNoIG1lYW5zIHRoYXQgaW5zdGFuY2VvZiB3b24ndCB3b3JrIGluc2lkZSB0aGUgVk0uIFRoaXNcbiAqIGZ1bmN0aW9uIHJlY3Vyc2l2ZWx5IHdhbGtzIG92ZXIgdGhlIGNvbnRlbnQgb2YgYW4gb2JqZWN0LCBhbmQgcmVjcmVhdGUgc29tZVxuICogb2YgdGhlc2Ugb2JqZWN0cyAobm90YWJseSBBcnJheSwgRGF0ZSBhbmQgT2JqZWN0cykuXG4gKi9cbmZ1bmN0aW9uIGZpeFByb3RvdHlwZXM8WD4ob2JqOiBYKTogWCB7XG4gIGlmIChvYmogIT0gbnVsbCAmJiB0eXBlb2Ygb2JqID09PSAnb2JqZWN0Jykge1xuICAgIHN3aXRjaCAoT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iaik/LmNvbnN0cnVjdG9yPy5uYW1lKSB7XG4gICAgICBjYXNlICdBcnJheSc6XG4gICAgICAgIHJldHVybiBBcnJheS5mcm9tKChvYmogYXMgQXJyYXk8dW5rbm93bj4pLm1hcChmaXhQcm90b3R5cGVzKSkgYXMgWDtcbiAgICAgIGNhc2UgJ0RhdGUnOlxuICAgICAgICByZXR1cm4gbmV3IERhdGUob2JqIGFzIHVua25vd24gYXMgRGF0ZSkgYXMgWDtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiBPYmplY3QuZnJvbUVudHJpZXMoT2JqZWN0LmVudHJpZXMob2JqKS5tYXAoKFtrLCB2XSk6IFtzdHJpbmcsIGFueV0gPT4gW2ssIGZpeFByb3RvdHlwZXModildKSkgYXMgWDtcbiAgICB9XG4gIH0gZWxzZSByZXR1cm4gb2JqO1xufVxuXG4vKipcbiAqIEluaXRpYWxpemUgdGhlIHdvcmtmbG93LiBPciB0byBiZSBleGFjdCwgX2NvbXBsZXRlXyBpbml0aWFsaXphdGlvbiwgYXMgbW9zdCBwYXJ0IGhhcyBiZWVuIGRvbmUgaW4gY29uc3RydWN0b3IpLlxuICovXG5leHBvcnQgZnVuY3Rpb24gaW5pdGlhbGl6ZShpbml0aWFsaXplV29ya2Zsb3dKb2I6IGNvcmVzZGsud29ya2Zsb3dfYWN0aXZhdGlvbi5JSW5pdGlhbGl6ZVdvcmtmbG93KTogdm9pZCB7XG4gIGdldEFjdGl2YXRvcigpLmluaXRpYWxpemVXb3JrZmxvdyhpbml0aWFsaXplV29ya2Zsb3dKb2IpO1xufVxuXG4vKipcbiAqIFJ1biBhIGNodW5rIG9mIGFjdGl2YXRpb24gam9ic1xuICovXG5leHBvcnQgZnVuY3Rpb24gYWN0aXZhdGUoYWN0aXZhdGlvbjogY29yZXNkay53b3JrZmxvd19hY3RpdmF0aW9uLklXb3JrZmxvd0FjdGl2YXRpb24sIGJhdGNoSW5kZXggPSAwKTogdm9pZCB7XG4gIGNvbnN0IGFjdGl2YXRvciA9IGdldEFjdGl2YXRvcigpO1xuICBjb25zdCBpbnRlcmNlcHQgPSBjb21wb3NlSW50ZXJjZXB0b3JzKGFjdGl2YXRvci5pbnRlcmNlcHRvcnMuaW50ZXJuYWxzLCAnYWN0aXZhdGUnLCAoeyBhY3RpdmF0aW9uIH0pID0+IHtcbiAgICAvLyBDYXN0IGZyb20gdGhlIGludGVyZmFjZSB0byB0aGUgY2xhc3Mgd2hpY2ggaGFzIHRoZSBgdmFyaWFudGAgYXR0cmlidXRlLlxuICAgIC8vIFRoaXMgaXMgc2FmZSBiZWNhdXNlIHdlIGtub3cgdGhhdCBhY3RpdmF0aW9uIGlzIGEgcHJvdG8gY2xhc3MuXG4gICAgY29uc3Qgam9icyA9IGFjdGl2YXRpb24uam9icyBhcyBjb3Jlc2RrLndvcmtmbG93X2FjdGl2YXRpb24uV29ya2Zsb3dBY3RpdmF0aW9uSm9iW107XG5cbiAgICAvLyBJbml0aWFsaXphdGlvbiB3aWxsIGhhdmUgYmVlbiBoYW5kbGVkIGFscmVhZHksIGJ1dCB3ZSBtaWdodCBzdGlsbCBuZWVkIHRvIHN0YXJ0IHRoZSB3b3JrZmxvdyBmdW5jdGlvblxuICAgIGNvbnN0IHN0YXJ0V29ya2Zsb3dKb2IgPSBqb2JzWzBdLnZhcmlhbnQgPT09ICdpbml0aWFsaXplV29ya2Zsb3cnID8gam9icy5zaGlmdCgpPy5pbml0aWFsaXplV29ya2Zsb3cgOiB1bmRlZmluZWQ7XG5cbiAgICBmb3IgKGNvbnN0IGpvYiBvZiBqb2JzKSB7XG4gICAgICBpZiAoam9iLnZhcmlhbnQgPT09IHVuZGVmaW5lZCkgdGhyb3cgbmV3IFR5cGVFcnJvcignRXhwZWN0ZWQgam9iLnZhcmlhbnQgdG8gYmUgZGVmaW5lZCcpO1xuXG4gICAgICBjb25zdCB2YXJpYW50ID0gam9iW2pvYi52YXJpYW50XTtcbiAgICAgIGlmICghdmFyaWFudCkgdGhyb3cgbmV3IFR5cGVFcnJvcihgRXhwZWN0ZWQgam9iLiR7am9iLnZhcmlhbnR9IHRvIGJlIHNldGApO1xuXG4gICAgICBhY3RpdmF0b3Jbam9iLnZhcmlhbnRdKHZhcmlhbnQgYXMgYW55IC8qIFRTIGNhbid0IGluZmVyIHRoaXMgdHlwZSAqLyk7XG5cbiAgICAgIGlmIChqb2IudmFyaWFudCAhPT0gJ3F1ZXJ5V29ya2Zsb3cnKSB0cnlVbmJsb2NrQ29uZGl0aW9ucygpO1xuICAgIH1cblxuICAgIGlmIChzdGFydFdvcmtmbG93Sm9iKSB7XG4gICAgICBjb25zdCBzYWZlSm9iVHlwZXM6IGNvcmVzZGsud29ya2Zsb3dfYWN0aXZhdGlvbi5Xb3JrZmxvd0FjdGl2YXRpb25Kb2JbJ3ZhcmlhbnQnXVtdID0gW1xuICAgICAgICAnaW5pdGlhbGl6ZVdvcmtmbG93JyxcbiAgICAgICAgJ3NpZ25hbFdvcmtmbG93JyxcbiAgICAgICAgJ2RvVXBkYXRlJyxcbiAgICAgICAgJ2NhbmNlbFdvcmtmbG93JyxcbiAgICAgICAgJ3VwZGF0ZVJhbmRvbVNlZWQnLFxuICAgICAgXTtcbiAgICAgIGlmIChqb2JzLnNvbWUoKGpvYikgPT4gIXNhZmVKb2JUeXBlcy5pbmNsdWRlcyhqb2IudmFyaWFudCkpKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgICAgICAgJ1JlY2VpdmVkIGJvdGggaW5pdGlhbGl6ZVdvcmtmbG93IGFuZCBub24tc2lnbmFsL25vbi11cGRhdGUgam9icyBpbiB0aGUgc2FtZSBhY3RpdmF0aW9uOiAnICtcbiAgICAgICAgICAgIEpTT04uc3RyaW5naWZ5KGpvYnMubWFwKChqb2IpID0+IGpvYi52YXJpYW50KSlcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgYWN0aXZhdG9yLnN0YXJ0V29ya2Zsb3coc3RhcnRXb3JrZmxvd0pvYik7XG4gICAgICB0cnlVbmJsb2NrQ29uZGl0aW9ucygpO1xuICAgIH1cbiAgfSk7XG4gIGludGVyY2VwdCh7IGFjdGl2YXRpb24sIGJhdGNoSW5kZXggfSk7XG59XG5cbi8qKlxuICogQ29uY2x1ZGUgYSBzaW5nbGUgYWN0aXZhdGlvbi5cbiAqIFNob3VsZCBiZSBjYWxsZWQgYWZ0ZXIgcHJvY2Vzc2luZyBhbGwgYWN0aXZhdGlvbiBqb2JzIGFuZCBxdWV1ZWQgbWljcm90YXNrcy5cbiAqXG4gKiBBY3RpdmF0aW9uIGZhaWx1cmVzIGFyZSBoYW5kbGVkIGluIHRoZSBtYWluIE5vZGUuanMgaXNvbGF0ZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbmNsdWRlQWN0aXZhdGlvbigpOiBjb3Jlc2RrLndvcmtmbG93X2NvbXBsZXRpb24uSVdvcmtmbG93QWN0aXZhdGlvbkNvbXBsZXRpb24ge1xuICBjb25zdCBhY3RpdmF0b3IgPSBnZXRBY3RpdmF0b3IoKTtcbiAgYWN0aXZhdG9yLnJlamVjdEJ1ZmZlcmVkVXBkYXRlcygpO1xuICBjb25zdCBpbnRlcmNlcHQgPSBjb21wb3NlSW50ZXJjZXB0b3JzKGFjdGl2YXRvci5pbnRlcmNlcHRvcnMuaW50ZXJuYWxzLCAnY29uY2x1ZGVBY3RpdmF0aW9uJywgKGlucHV0KSA9PiBpbnB1dCk7XG4gIGNvbnN0IGFjdGl2YXRpb25Db21wbGV0aW9uID0gYWN0aXZhdG9yLmNvbmNsdWRlQWN0aXZhdGlvbigpO1xuICBjb25zdCB7IGNvbW1hbmRzIH0gPSBpbnRlcmNlcHQoeyBjb21tYW5kczogYWN0aXZhdGlvbkNvbXBsZXRpb24uY29tbWFuZHMgfSk7XG4gIGlmIChhY3RpdmF0b3IuY29tcGxldGVkKSB7XG4gICAgYWN0aXZhdG9yLndhcm5JZlVuZmluaXNoZWRIYW5kbGVycygpO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBydW5JZDogYWN0aXZhdG9yLmluZm8ucnVuSWQsXG4gICAgc3VjY2Vzc2Z1bDogeyAuLi5hY3RpdmF0aW9uQ29tcGxldGlvbiwgY29tbWFuZHMgfSxcbiAgfTtcbn1cblxuLyoqXG4gKiBMb29wIHRocm91Z2ggYWxsIGJsb2NrZWQgY29uZGl0aW9ucywgZXZhbHVhdGUgYW5kIHVuYmxvY2sgaWYgcG9zc2libGUuXG4gKlxuICogQHJldHVybnMgbnVtYmVyIG9mIHVuYmxvY2tlZCBjb25kaXRpb25zLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdHJ5VW5ibG9ja0NvbmRpdGlvbnMoKTogbnVtYmVyIHtcbiAgbGV0IG51bVVuYmxvY2tlZCA9IDA7XG4gIGZvciAoOzspIHtcbiAgICBjb25zdCBwcmV2VW5ibG9ja2VkID0gbnVtVW5ibG9ja2VkO1xuICAgIGZvciAoY29uc3QgW3NlcSwgY29uZF0gb2YgZ2V0QWN0aXZhdG9yKCkuYmxvY2tlZENvbmRpdGlvbnMuZW50cmllcygpKSB7XG4gICAgICBpZiAoY29uZC5mbigpKSB7XG4gICAgICAgIGNvbmQucmVzb2x2ZSgpO1xuICAgICAgICBudW1VbmJsb2NrZWQrKztcbiAgICAgICAgLy8gSXQgaXMgc2FmZSB0byBkZWxldGUgZWxlbWVudHMgZHVyaW5nIG1hcCBpdGVyYXRpb25cbiAgICAgICAgZ2V0QWN0aXZhdG9yKCkuYmxvY2tlZENvbmRpdGlvbnMuZGVsZXRlKHNlcSk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChwcmV2VW5ibG9ja2VkID09PSBudW1VbmJsb2NrZWQpIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICByZXR1cm4gbnVtVW5ibG9ja2VkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGlzcG9zZSgpOiB2b2lkIHtcbiAgY29uc3QgZGlzcG9zZSA9IGNvbXBvc2VJbnRlcmNlcHRvcnMoZ2V0QWN0aXZhdG9yKCkuaW50ZXJjZXB0b3JzLmludGVybmFscywgJ2Rpc3Bvc2UnLCBhc3luYyAoKSA9PiB7XG4gICAgZGlzYWJsZVN0b3JhZ2UoKTtcbiAgICBkaXNhYmxlVXBkYXRlU3RvcmFnZSgpO1xuICB9KTtcbiAgZGlzcG9zZSh7fSk7XG59XG4iLCJpbXBvcnQge1xuICBBY3Rpdml0eUZ1bmN0aW9uLFxuICBBY3Rpdml0eU9wdGlvbnMsXG4gIGNvbXBpbGVSZXRyeVBvbGljeSxcbiAgZXh0cmFjdFdvcmtmbG93VHlwZSxcbiAgSGFuZGxlclVuZmluaXNoZWRQb2xpY3ksXG4gIExvY2FsQWN0aXZpdHlPcHRpb25zLFxuICBtYXBUb1BheWxvYWRzLFxuICBRdWVyeURlZmluaXRpb24sXG4gIHNlYXJjaEF0dHJpYnV0ZVBheWxvYWRDb252ZXJ0ZXIsXG4gIFNlYXJjaEF0dHJpYnV0ZXMsXG4gIFNpZ25hbERlZmluaXRpb24sXG4gIHRvUGF5bG9hZHMsXG4gIFVudHlwZWRBY3Rpdml0aWVzLFxuICBVcGRhdGVEZWZpbml0aW9uLFxuICBXaXRoV29ya2Zsb3dBcmdzLFxuICBXb3JrZmxvdyxcbiAgV29ya2Zsb3dSZXN1bHRUeXBlLFxuICBXb3JrZmxvd1JldHVyblR5cGUsXG4gIFdvcmtmbG93VXBkYXRlVmFsaWRhdG9yVHlwZSxcbn0gZnJvbSAnQHRlbXBvcmFsaW8vY29tbW9uJztcbmltcG9ydCB7IHZlcnNpb25pbmdJbnRlbnRUb1Byb3RvIH0gZnJvbSAnQHRlbXBvcmFsaW8vY29tbW9uL2xpYi92ZXJzaW9uaW5nLWludGVudC1lbnVtJztcbmltcG9ydCB7IER1cmF0aW9uLCBtc09wdGlvbmFsVG9UcywgbXNUb051bWJlciwgbXNUb1RzLCByZXF1aXJlZFRzVG9NcyB9IGZyb20gJ0B0ZW1wb3JhbGlvL2NvbW1vbi9saWIvdGltZSc7XG5pbXBvcnQgeyBjb21wb3NlSW50ZXJjZXB0b3JzIH0gZnJvbSAnQHRlbXBvcmFsaW8vY29tbW9uL2xpYi9pbnRlcmNlcHRvcnMnO1xuaW1wb3J0IHsgdGVtcG9yYWwgfSBmcm9tICdAdGVtcG9yYWxpby9wcm90byc7XG5pbXBvcnQgeyBDYW5jZWxsYXRpb25TY29wZSwgcmVnaXN0ZXJTbGVlcEltcGxlbWVudGF0aW9uIH0gZnJvbSAnLi9jYW5jZWxsYXRpb24tc2NvcGUnO1xuaW1wb3J0IHsgVXBkYXRlU2NvcGUgfSBmcm9tICcuL3VwZGF0ZS1zY29wZSc7XG5pbXBvcnQge1xuICBBY3Rpdml0eUlucHV0LFxuICBMb2NhbEFjdGl2aXR5SW5wdXQsXG4gIFNpZ25hbFdvcmtmbG93SW5wdXQsXG4gIFN0YXJ0Q2hpbGRXb3JrZmxvd0V4ZWN1dGlvbklucHV0LFxuICBUaW1lcklucHV0LFxufSBmcm9tICcuL2ludGVyY2VwdG9ycyc7XG5pbXBvcnQge1xuICBDaGlsZFdvcmtmbG93Q2FuY2VsbGF0aW9uVHlwZSxcbiAgQ2hpbGRXb3JrZmxvd09wdGlvbnMsXG4gIENoaWxkV29ya2Zsb3dPcHRpb25zV2l0aERlZmF1bHRzLFxuICBDb250aW51ZUFzTmV3LFxuICBDb250aW51ZUFzTmV3T3B0aW9ucyxcbiAgRGVmYXVsdFNpZ25hbEhhbmRsZXIsXG4gIEVuaGFuY2VkU3RhY2tUcmFjZSxcbiAgSGFuZGxlcixcbiAgUXVlcnlIYW5kbGVyT3B0aW9ucyxcbiAgU2lnbmFsSGFuZGxlck9wdGlvbnMsXG4gIFVwZGF0ZUhhbmRsZXJPcHRpb25zLFxuICBXb3JrZmxvd0luZm8sXG4gIFVwZGF0ZUluZm8sXG59IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5pbXBvcnQgeyBMb2NhbEFjdGl2aXR5RG9CYWNrb2ZmIH0gZnJvbSAnLi9lcnJvcnMnO1xuaW1wb3J0IHsgYXNzZXJ0SW5Xb3JrZmxvd0NvbnRleHQsIGdldEFjdGl2YXRvciwgbWF5YmVHZXRBY3RpdmF0b3IgfSBmcm9tICcuL2dsb2JhbC1hdHRyaWJ1dGVzJztcbmltcG9ydCB7IHVudHJhY2tQcm9taXNlIH0gZnJvbSAnLi9zdGFjay1oZWxwZXJzJztcbmltcG9ydCB7IENoaWxkV29ya2Zsb3dIYW5kbGUsIEV4dGVybmFsV29ya2Zsb3dIYW5kbGUgfSBmcm9tICcuL3dvcmtmbG93LWhhbmRsZSc7XG5cbi8vIEF2b2lkIGEgY2lyY3VsYXIgZGVwZW5kZW5jeVxucmVnaXN0ZXJTbGVlcEltcGxlbWVudGF0aW9uKHNsZWVwKTtcblxuLyoqXG4gKiBBZGRzIGRlZmF1bHQgdmFsdWVzIG9mIGB3b3JrZmxvd0lkYCBhbmQgYGNhbmNlbGxhdGlvblR5cGVgIHRvIGdpdmVuIHdvcmtmbG93IG9wdGlvbnMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhZGREZWZhdWx0V29ya2Zsb3dPcHRpb25zPFQgZXh0ZW5kcyBXb3JrZmxvdz4oXG4gIG9wdHM6IFdpdGhXb3JrZmxvd0FyZ3M8VCwgQ2hpbGRXb3JrZmxvd09wdGlvbnM+XG4pOiBDaGlsZFdvcmtmbG93T3B0aW9uc1dpdGhEZWZhdWx0cyB7XG4gIGNvbnN0IHsgYXJncywgd29ya2Zsb3dJZCwgLi4ucmVzdCB9ID0gb3B0cztcbiAgcmV0dXJuIHtcbiAgICB3b3JrZmxvd0lkOiB3b3JrZmxvd0lkID8/IHV1aWQ0KCksXG4gICAgYXJnczogKGFyZ3MgPz8gW10pIGFzIHVua25vd25bXSxcbiAgICBjYW5jZWxsYXRpb25UeXBlOiBDaGlsZFdvcmtmbG93Q2FuY2VsbGF0aW9uVHlwZS5XQUlUX0NBTkNFTExBVElPTl9DT01QTEVURUQsXG4gICAgLi4ucmVzdCxcbiAgfTtcbn1cblxuLyoqXG4gKiBQdXNoIGEgc3RhcnRUaW1lciBjb21tYW5kIGludG8gc3RhdGUgYWNjdW11bGF0b3IgYW5kIHJlZ2lzdGVyIGNvbXBsZXRpb25cbiAqL1xuZnVuY3Rpb24gdGltZXJOZXh0SGFuZGxlcihpbnB1dDogVGltZXJJbnB1dCkge1xuICBjb25zdCBhY3RpdmF0b3IgPSBnZXRBY3RpdmF0b3IoKTtcbiAgcmV0dXJuIG5ldyBQcm9taXNlPHZvaWQ+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBjb25zdCBzY29wZSA9IENhbmNlbGxhdGlvblNjb3BlLmN1cnJlbnQoKTtcbiAgICBpZiAoc2NvcGUuY29uc2lkZXJlZENhbmNlbGxlZCkge1xuICAgICAgdW50cmFja1Byb21pc2Uoc2NvcGUuY2FuY2VsUmVxdWVzdGVkLmNhdGNoKHJlamVjdCkpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoc2NvcGUuY2FuY2VsbGFibGUpIHtcbiAgICAgIHVudHJhY2tQcm9taXNlKFxuICAgICAgICBzY29wZS5jYW5jZWxSZXF1ZXN0ZWQuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgIGlmICghYWN0aXZhdG9yLmNvbXBsZXRpb25zLnRpbWVyLmRlbGV0ZShpbnB1dC5zZXEpKSB7XG4gICAgICAgICAgICByZXR1cm47IC8vIEFscmVhZHkgcmVzb2x2ZWQgb3IgbmV2ZXIgc2NoZWR1bGVkXG4gICAgICAgICAgfVxuICAgICAgICAgIGFjdGl2YXRvci5wdXNoQ29tbWFuZCh7XG4gICAgICAgICAgICBjYW5jZWxUaW1lcjoge1xuICAgICAgICAgICAgICBzZXE6IGlucHV0LnNlcSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgIH0pXG4gICAgICApO1xuICAgIH1cbiAgICBhY3RpdmF0b3IucHVzaENvbW1hbmQoe1xuICAgICAgc3RhcnRUaW1lcjoge1xuICAgICAgICBzZXE6IGlucHV0LnNlcSxcbiAgICAgICAgc3RhcnRUb0ZpcmVUaW1lb3V0OiBtc1RvVHMoaW5wdXQuZHVyYXRpb25NcyksXG4gICAgICB9LFxuICAgIH0pO1xuICAgIGFjdGl2YXRvci5jb21wbGV0aW9ucy50aW1lci5zZXQoaW5wdXQuc2VxLCB7XG4gICAgICByZXNvbHZlLFxuICAgICAgcmVqZWN0LFxuICAgIH0pO1xuICB9KTtcbn1cblxuLyoqXG4gKiBBc3luY2hyb25vdXMgc2xlZXAuXG4gKlxuICogU2NoZWR1bGVzIGEgdGltZXIgb24gdGhlIFRlbXBvcmFsIHNlcnZpY2UuXG4gKlxuICogQHBhcmFtIG1zIHNsZWVwIGR1cmF0aW9uIC0gbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBvciB7QGxpbmsgaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvbXMgfCBtcy1mb3JtYXR0ZWQgc3RyaW5nfS5cbiAqIElmIGdpdmVuIGEgbmVnYXRpdmUgbnVtYmVyIG9yIDAsIHZhbHVlIHdpbGwgYmUgc2V0IHRvIDEuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzbGVlcChtczogRHVyYXRpb24pOiBQcm9taXNlPHZvaWQ+IHtcbiAgY29uc3QgYWN0aXZhdG9yID0gYXNzZXJ0SW5Xb3JrZmxvd0NvbnRleHQoJ1dvcmtmbG93LnNsZWVwKC4uLikgbWF5IG9ubHkgYmUgdXNlZCBmcm9tIGEgV29ya2Zsb3cgRXhlY3V0aW9uJyk7XG4gIGNvbnN0IHNlcSA9IGFjdGl2YXRvci5uZXh0U2Vxcy50aW1lcisrO1xuXG4gIGNvbnN0IGR1cmF0aW9uTXMgPSBNYXRoLm1heCgxLCBtc1RvTnVtYmVyKG1zKSk7XG5cbiAgY29uc3QgZXhlY3V0ZSA9IGNvbXBvc2VJbnRlcmNlcHRvcnMoYWN0aXZhdG9yLmludGVyY2VwdG9ycy5vdXRib3VuZCwgJ3N0YXJ0VGltZXInLCB0aW1lck5leHRIYW5kbGVyKTtcblxuICByZXR1cm4gZXhlY3V0ZSh7XG4gICAgZHVyYXRpb25NcyxcbiAgICBzZXEsXG4gIH0pO1xufVxuXG5mdW5jdGlvbiB2YWxpZGF0ZUFjdGl2aXR5T3B0aW9ucyhvcHRpb25zOiBBY3Rpdml0eU9wdGlvbnMpOiB2b2lkIHtcbiAgaWYgKG9wdGlvbnMuc2NoZWR1bGVUb0Nsb3NlVGltZW91dCA9PT0gdW5kZWZpbmVkICYmIG9wdGlvbnMuc3RhcnRUb0Nsb3NlVGltZW91dCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignUmVxdWlyZWQgZWl0aGVyIHNjaGVkdWxlVG9DbG9zZVRpbWVvdXQgb3Igc3RhcnRUb0Nsb3NlVGltZW91dCcpO1xuICB9XG59XG5cbi8vIFVzZSBzYW1lIHZhbGlkYXRpb24gd2UgdXNlIGZvciBub3JtYWwgYWN0aXZpdGllc1xuY29uc3QgdmFsaWRhdGVMb2NhbEFjdGl2aXR5T3B0aW9ucyA9IHZhbGlkYXRlQWN0aXZpdHlPcHRpb25zO1xuXG4vKipcbiAqIFB1c2ggYSBzY2hlZHVsZUFjdGl2aXR5IGNvbW1hbmQgaW50byBhY3RpdmF0b3IgYWNjdW11bGF0b3IgYW5kIHJlZ2lzdGVyIGNvbXBsZXRpb25cbiAqL1xuZnVuY3Rpb24gc2NoZWR1bGVBY3Rpdml0eU5leHRIYW5kbGVyKHsgb3B0aW9ucywgYXJncywgaGVhZGVycywgc2VxLCBhY3Rpdml0eVR5cGUgfTogQWN0aXZpdHlJbnB1dCk6IFByb21pc2U8dW5rbm93bj4ge1xuICBjb25zdCBhY3RpdmF0b3IgPSBnZXRBY3RpdmF0b3IoKTtcbiAgdmFsaWRhdGVBY3Rpdml0eU9wdGlvbnMob3B0aW9ucyk7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgY29uc3Qgc2NvcGUgPSBDYW5jZWxsYXRpb25TY29wZS5jdXJyZW50KCk7XG4gICAgaWYgKHNjb3BlLmNvbnNpZGVyZWRDYW5jZWxsZWQpIHtcbiAgICAgIHVudHJhY2tQcm9taXNlKHNjb3BlLmNhbmNlbFJlcXVlc3RlZC5jYXRjaChyZWplY3QpKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHNjb3BlLmNhbmNlbGxhYmxlKSB7XG4gICAgICB1bnRyYWNrUHJvbWlzZShcbiAgICAgICAgc2NvcGUuY2FuY2VsUmVxdWVzdGVkLmNhdGNoKCgpID0+IHtcbiAgICAgICAgICBpZiAoIWFjdGl2YXRvci5jb21wbGV0aW9ucy5hY3Rpdml0eS5oYXMoc2VxKSkge1xuICAgICAgICAgICAgcmV0dXJuOyAvLyBBbHJlYWR5IHJlc29sdmVkIG9yIG5ldmVyIHNjaGVkdWxlZFxuICAgICAgICAgIH1cbiAgICAgICAgICBhY3RpdmF0b3IucHVzaENvbW1hbmQoe1xuICAgICAgICAgICAgcmVxdWVzdENhbmNlbEFjdGl2aXR5OiB7XG4gICAgICAgICAgICAgIHNlcSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pXG4gICAgICApO1xuICAgIH1cbiAgICBhY3RpdmF0b3IucHVzaENvbW1hbmQoe1xuICAgICAgc2NoZWR1bGVBY3Rpdml0eToge1xuICAgICAgICBzZXEsXG4gICAgICAgIGFjdGl2aXR5SWQ6IG9wdGlvbnMuYWN0aXZpdHlJZCA/PyBgJHtzZXF9YCxcbiAgICAgICAgYWN0aXZpdHlUeXBlLFxuICAgICAgICBhcmd1bWVudHM6IHRvUGF5bG9hZHMoYWN0aXZhdG9yLnBheWxvYWRDb252ZXJ0ZXIsIC4uLmFyZ3MpLFxuICAgICAgICByZXRyeVBvbGljeTogb3B0aW9ucy5yZXRyeSA/IGNvbXBpbGVSZXRyeVBvbGljeShvcHRpb25zLnJldHJ5KSA6IHVuZGVmaW5lZCxcbiAgICAgICAgdGFza1F1ZXVlOiBvcHRpb25zLnRhc2tRdWV1ZSB8fCBhY3RpdmF0b3IuaW5mby50YXNrUXVldWUsXG4gICAgICAgIGhlYXJ0YmVhdFRpbWVvdXQ6IG1zT3B0aW9uYWxUb1RzKG9wdGlvbnMuaGVhcnRiZWF0VGltZW91dCksXG4gICAgICAgIHNjaGVkdWxlVG9DbG9zZVRpbWVvdXQ6IG1zT3B0aW9uYWxUb1RzKG9wdGlvbnMuc2NoZWR1bGVUb0Nsb3NlVGltZW91dCksXG4gICAgICAgIHN0YXJ0VG9DbG9zZVRpbWVvdXQ6IG1zT3B0aW9uYWxUb1RzKG9wdGlvbnMuc3RhcnRUb0Nsb3NlVGltZW91dCksXG4gICAgICAgIHNjaGVkdWxlVG9TdGFydFRpbWVvdXQ6IG1zT3B0aW9uYWxUb1RzKG9wdGlvbnMuc2NoZWR1bGVUb1N0YXJ0VGltZW91dCksXG4gICAgICAgIGhlYWRlcnMsXG4gICAgICAgIGNhbmNlbGxhdGlvblR5cGU6IG9wdGlvbnMuY2FuY2VsbGF0aW9uVHlwZSxcbiAgICAgICAgZG9Ob3RFYWdlcmx5RXhlY3V0ZTogIShvcHRpb25zLmFsbG93RWFnZXJEaXNwYXRjaCA/PyB0cnVlKSxcbiAgICAgICAgdmVyc2lvbmluZ0ludGVudDogdmVyc2lvbmluZ0ludGVudFRvUHJvdG8ob3B0aW9ucy52ZXJzaW9uaW5nSW50ZW50KSxcbiAgICAgIH0sXG4gICAgfSk7XG4gICAgYWN0aXZhdG9yLmNvbXBsZXRpb25zLmFjdGl2aXR5LnNldChzZXEsIHtcbiAgICAgIHJlc29sdmUsXG4gICAgICByZWplY3QsXG4gICAgfSk7XG4gIH0pO1xufVxuXG4vKipcbiAqIFB1c2ggYSBzY2hlZHVsZUFjdGl2aXR5IGNvbW1hbmQgaW50byBzdGF0ZSBhY2N1bXVsYXRvciBhbmQgcmVnaXN0ZXIgY29tcGxldGlvblxuICovXG5hc3luYyBmdW5jdGlvbiBzY2hlZHVsZUxvY2FsQWN0aXZpdHlOZXh0SGFuZGxlcih7XG4gIG9wdGlvbnMsXG4gIGFyZ3MsXG4gIGhlYWRlcnMsXG4gIHNlcSxcbiAgYWN0aXZpdHlUeXBlLFxuICBhdHRlbXB0LFxuICBvcmlnaW5hbFNjaGVkdWxlVGltZSxcbn06IExvY2FsQWN0aXZpdHlJbnB1dCk6IFByb21pc2U8dW5rbm93bj4ge1xuICBjb25zdCBhY3RpdmF0b3IgPSBnZXRBY3RpdmF0b3IoKTtcbiAgLy8gRWFnZXJseSBmYWlsIHRoZSBsb2NhbCBhY3Rpdml0eSAod2hpY2ggd2lsbCBpbiB0dXJuIGZhaWwgdGhlIHdvcmtmbG93IHRhc2suXG4gIC8vIERvIG5vdCBmYWlsIG9uIHJlcGxheSB3aGVyZSB0aGUgbG9jYWwgYWN0aXZpdGllcyBtYXkgbm90IGJlIHJlZ2lzdGVyZWQgb24gdGhlIHJlcGxheSB3b3JrZXIuXG4gIGlmICghYWN0aXZhdG9yLmluZm8udW5zYWZlLmlzUmVwbGF5aW5nICYmICFhY3RpdmF0b3IucmVnaXN0ZXJlZEFjdGl2aXR5TmFtZXMuaGFzKGFjdGl2aXR5VHlwZSkpIHtcbiAgICB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoYExvY2FsIGFjdGl2aXR5IG9mIHR5cGUgJyR7YWN0aXZpdHlUeXBlfScgbm90IHJlZ2lzdGVyZWQgb24gd29ya2VyYCk7XG4gIH1cbiAgdmFsaWRhdGVMb2NhbEFjdGl2aXR5T3B0aW9ucyhvcHRpb25zKTtcblxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNvbnN0IHNjb3BlID0gQ2FuY2VsbGF0aW9uU2NvcGUuY3VycmVudCgpO1xuICAgIGlmIChzY29wZS5jb25zaWRlcmVkQ2FuY2VsbGVkKSB7XG4gICAgICB1bnRyYWNrUHJvbWlzZShzY29wZS5jYW5jZWxSZXF1ZXN0ZWQuY2F0Y2gocmVqZWN0KSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChzY29wZS5jYW5jZWxsYWJsZSkge1xuICAgICAgdW50cmFja1Byb21pc2UoXG4gICAgICAgIHNjb3BlLmNhbmNlbFJlcXVlc3RlZC5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgaWYgKCFhY3RpdmF0b3IuY29tcGxldGlvbnMuYWN0aXZpdHkuaGFzKHNlcSkpIHtcbiAgICAgICAgICAgIHJldHVybjsgLy8gQWxyZWFkeSByZXNvbHZlZCBvciBuZXZlciBzY2hlZHVsZWRcbiAgICAgICAgICB9XG4gICAgICAgICAgYWN0aXZhdG9yLnB1c2hDb21tYW5kKHtcbiAgICAgICAgICAgIHJlcXVlc3RDYW5jZWxMb2NhbEFjdGl2aXR5OiB7XG4gICAgICAgICAgICAgIHNlcSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pXG4gICAgICApO1xuICAgIH1cbiAgICBhY3RpdmF0b3IucHVzaENvbW1hbmQoe1xuICAgICAgc2NoZWR1bGVMb2NhbEFjdGl2aXR5OiB7XG4gICAgICAgIHNlcSxcbiAgICAgICAgYXR0ZW1wdCxcbiAgICAgICAgb3JpZ2luYWxTY2hlZHVsZVRpbWUsXG4gICAgICAgIC8vIEludGVudGlvbmFsbHkgbm90IGV4cG9zaW5nIGFjdGl2aXR5SWQgYXMgYW4gb3B0aW9uXG4gICAgICAgIGFjdGl2aXR5SWQ6IGAke3NlcX1gLFxuICAgICAgICBhY3Rpdml0eVR5cGUsXG4gICAgICAgIGFyZ3VtZW50czogdG9QYXlsb2FkcyhhY3RpdmF0b3IucGF5bG9hZENvbnZlcnRlciwgLi4uYXJncyksXG4gICAgICAgIHJldHJ5UG9saWN5OiBvcHRpb25zLnJldHJ5ID8gY29tcGlsZVJldHJ5UG9saWN5KG9wdGlvbnMucmV0cnkpIDogdW5kZWZpbmVkLFxuICAgICAgICBzY2hlZHVsZVRvQ2xvc2VUaW1lb3V0OiBtc09wdGlvbmFsVG9UcyhvcHRpb25zLnNjaGVkdWxlVG9DbG9zZVRpbWVvdXQpLFxuICAgICAgICBzdGFydFRvQ2xvc2VUaW1lb3V0OiBtc09wdGlvbmFsVG9UcyhvcHRpb25zLnN0YXJ0VG9DbG9zZVRpbWVvdXQpLFxuICAgICAgICBzY2hlZHVsZVRvU3RhcnRUaW1lb3V0OiBtc09wdGlvbmFsVG9UcyhvcHRpb25zLnNjaGVkdWxlVG9TdGFydFRpbWVvdXQpLFxuICAgICAgICBsb2NhbFJldHJ5VGhyZXNob2xkOiBtc09wdGlvbmFsVG9UcyhvcHRpb25zLmxvY2FsUmV0cnlUaHJlc2hvbGQpLFxuICAgICAgICBoZWFkZXJzLFxuICAgICAgICBjYW5jZWxsYXRpb25UeXBlOiBvcHRpb25zLmNhbmNlbGxhdGlvblR5cGUsXG4gICAgICB9LFxuICAgIH0pO1xuICAgIGFjdGl2YXRvci5jb21wbGV0aW9ucy5hY3Rpdml0eS5zZXQoc2VxLCB7XG4gICAgICByZXNvbHZlLFxuICAgICAgcmVqZWN0LFxuICAgIH0pO1xuICB9KTtcbn1cblxuLyoqXG4gKiBTY2hlZHVsZSBhbiBhY3Rpdml0eSBhbmQgcnVuIG91dGJvdW5kIGludGVyY2VwdG9yc1xuICogQGhpZGRlblxuICovXG5leHBvcnQgZnVuY3Rpb24gc2NoZWR1bGVBY3Rpdml0eTxSPihhY3Rpdml0eVR5cGU6IHN0cmluZywgYXJnczogYW55W10sIG9wdGlvbnM6IEFjdGl2aXR5T3B0aW9ucyk6IFByb21pc2U8Uj4ge1xuICBjb25zdCBhY3RpdmF0b3IgPSBhc3NlcnRJbldvcmtmbG93Q29udGV4dChcbiAgICAnV29ya2Zsb3cuc2NoZWR1bGVBY3Rpdml0eSguLi4pIG1heSBvbmx5IGJlIHVzZWQgZnJvbSBhIFdvcmtmbG93IEV4ZWN1dGlvbidcbiAgKTtcbiAgaWYgKG9wdGlvbnMgPT09IHVuZGVmaW5lZCkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0dvdCBlbXB0eSBhY3Rpdml0eSBvcHRpb25zJyk7XG4gIH1cbiAgY29uc3Qgc2VxID0gYWN0aXZhdG9yLm5leHRTZXFzLmFjdGl2aXR5Kys7XG4gIGNvbnN0IGV4ZWN1dGUgPSBjb21wb3NlSW50ZXJjZXB0b3JzKGFjdGl2YXRvci5pbnRlcmNlcHRvcnMub3V0Ym91bmQsICdzY2hlZHVsZUFjdGl2aXR5Jywgc2NoZWR1bGVBY3Rpdml0eU5leHRIYW5kbGVyKTtcblxuICByZXR1cm4gZXhlY3V0ZSh7XG4gICAgYWN0aXZpdHlUeXBlLFxuICAgIGhlYWRlcnM6IHt9LFxuICAgIG9wdGlvbnMsXG4gICAgYXJncyxcbiAgICBzZXEsXG4gIH0pIGFzIFByb21pc2U8Uj47XG59XG5cbi8qKlxuICogU2NoZWR1bGUgYW4gYWN0aXZpdHkgYW5kIHJ1biBvdXRib3VuZCBpbnRlcmNlcHRvcnNcbiAqIEBoaWRkZW5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNjaGVkdWxlTG9jYWxBY3Rpdml0eTxSPihcbiAgYWN0aXZpdHlUeXBlOiBzdHJpbmcsXG4gIGFyZ3M6IGFueVtdLFxuICBvcHRpb25zOiBMb2NhbEFjdGl2aXR5T3B0aW9uc1xuKTogUHJvbWlzZTxSPiB7XG4gIGNvbnN0IGFjdGl2YXRvciA9IGFzc2VydEluV29ya2Zsb3dDb250ZXh0KFxuICAgICdXb3JrZmxvdy5zY2hlZHVsZUxvY2FsQWN0aXZpdHkoLi4uKSBtYXkgb25seSBiZSB1c2VkIGZyb20gYSBXb3JrZmxvdyBFeGVjdXRpb24nXG4gICk7XG4gIGlmIChvcHRpb25zID09PSB1bmRlZmluZWQpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdHb3QgZW1wdHkgYWN0aXZpdHkgb3B0aW9ucycpO1xuICB9XG5cbiAgbGV0IGF0dGVtcHQgPSAxO1xuICBsZXQgb3JpZ2luYWxTY2hlZHVsZVRpbWUgPSB1bmRlZmluZWQ7XG5cbiAgZm9yICg7Oykge1xuICAgIGNvbnN0IHNlcSA9IGFjdGl2YXRvci5uZXh0U2Vxcy5hY3Rpdml0eSsrO1xuICAgIGNvbnN0IGV4ZWN1dGUgPSBjb21wb3NlSW50ZXJjZXB0b3JzKFxuICAgICAgYWN0aXZhdG9yLmludGVyY2VwdG9ycy5vdXRib3VuZCxcbiAgICAgICdzY2hlZHVsZUxvY2FsQWN0aXZpdHknLFxuICAgICAgc2NoZWR1bGVMb2NhbEFjdGl2aXR5TmV4dEhhbmRsZXJcbiAgICApO1xuXG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiAoYXdhaXQgZXhlY3V0ZSh7XG4gICAgICAgIGFjdGl2aXR5VHlwZSxcbiAgICAgICAgaGVhZGVyczoge30sXG4gICAgICAgIG9wdGlvbnMsXG4gICAgICAgIGFyZ3MsXG4gICAgICAgIHNlcSxcbiAgICAgICAgYXR0ZW1wdCxcbiAgICAgICAgb3JpZ2luYWxTY2hlZHVsZVRpbWUsXG4gICAgICB9KSkgYXMgUHJvbWlzZTxSPjtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGlmIChlcnIgaW5zdGFuY2VvZiBMb2NhbEFjdGl2aXR5RG9CYWNrb2ZmKSB7XG4gICAgICAgIGF3YWl0IHNsZWVwKHJlcXVpcmVkVHNUb01zKGVyci5iYWNrb2ZmLmJhY2tvZmZEdXJhdGlvbiwgJ2JhY2tvZmZEdXJhdGlvbicpKTtcbiAgICAgICAgaWYgKHR5cGVvZiBlcnIuYmFja29mZi5hdHRlbXB0ICE9PSAnbnVtYmVyJykge1xuICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgYmFja29mZiBhdHRlbXB0IHR5cGUnKTtcbiAgICAgICAgfVxuICAgICAgICBhdHRlbXB0ID0gZXJyLmJhY2tvZmYuYXR0ZW1wdDtcbiAgICAgICAgb3JpZ2luYWxTY2hlZHVsZVRpbWUgPSBlcnIuYmFja29mZi5vcmlnaW5hbFNjaGVkdWxlVGltZSA/PyB1bmRlZmluZWQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBlcnI7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHN0YXJ0Q2hpbGRXb3JrZmxvd0V4ZWN1dGlvbk5leHRIYW5kbGVyKHtcbiAgb3B0aW9ucyxcbiAgaGVhZGVycyxcbiAgd29ya2Zsb3dUeXBlLFxuICBzZXEsXG59OiBTdGFydENoaWxkV29ya2Zsb3dFeGVjdXRpb25JbnB1dCk6IFByb21pc2U8W1Byb21pc2U8c3RyaW5nPiwgUHJvbWlzZTx1bmtub3duPl0+IHtcbiAgY29uc3QgYWN0aXZhdG9yID0gZ2V0QWN0aXZhdG9yKCk7XG4gIGNvbnN0IHdvcmtmbG93SWQgPSBvcHRpb25zLndvcmtmbG93SWQgPz8gdXVpZDQoKTtcbiAgY29uc3Qgc3RhcnRQcm9taXNlID0gbmV3IFByb21pc2U8c3RyaW5nPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgY29uc3Qgc2NvcGUgPSBDYW5jZWxsYXRpb25TY29wZS5jdXJyZW50KCk7XG4gICAgaWYgKHNjb3BlLmNvbnNpZGVyZWRDYW5jZWxsZWQpIHtcbiAgICAgIHVudHJhY2tQcm9taXNlKHNjb3BlLmNhbmNlbFJlcXVlc3RlZC5jYXRjaChyZWplY3QpKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHNjb3BlLmNhbmNlbGxhYmxlKSB7XG4gICAgICB1bnRyYWNrUHJvbWlzZShcbiAgICAgICAgc2NvcGUuY2FuY2VsUmVxdWVzdGVkLmNhdGNoKCgpID0+IHtcbiAgICAgICAgICBjb25zdCBjb21wbGV0ZSA9ICFhY3RpdmF0b3IuY29tcGxldGlvbnMuY2hpbGRXb3JrZmxvd0NvbXBsZXRlLmhhcyhzZXEpO1xuXG4gICAgICAgICAgaWYgKCFjb21wbGV0ZSkge1xuICAgICAgICAgICAgYWN0aXZhdG9yLnB1c2hDb21tYW5kKHtcbiAgICAgICAgICAgICAgY2FuY2VsQ2hpbGRXb3JrZmxvd0V4ZWN1dGlvbjogeyBjaGlsZFdvcmtmbG93U2VxOiBzZXEgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBOb3RoaW5nIHRvIGNhbmNlbCBvdGhlcndpc2VcbiAgICAgICAgfSlcbiAgICAgICk7XG4gICAgfVxuICAgIGFjdGl2YXRvci5wdXNoQ29tbWFuZCh7XG4gICAgICBzdGFydENoaWxkV29ya2Zsb3dFeGVjdXRpb246IHtcbiAgICAgICAgc2VxLFxuICAgICAgICB3b3JrZmxvd0lkLFxuICAgICAgICB3b3JrZmxvd1R5cGUsXG4gICAgICAgIGlucHV0OiB0b1BheWxvYWRzKGFjdGl2YXRvci5wYXlsb2FkQ29udmVydGVyLCAuLi5vcHRpb25zLmFyZ3MpLFxuICAgICAgICByZXRyeVBvbGljeTogb3B0aW9ucy5yZXRyeSA/IGNvbXBpbGVSZXRyeVBvbGljeShvcHRpb25zLnJldHJ5KSA6IHVuZGVmaW5lZCxcbiAgICAgICAgdGFza1F1ZXVlOiBvcHRpb25zLnRhc2tRdWV1ZSB8fCBhY3RpdmF0b3IuaW5mby50YXNrUXVldWUsXG4gICAgICAgIHdvcmtmbG93RXhlY3V0aW9uVGltZW91dDogbXNPcHRpb25hbFRvVHMob3B0aW9ucy53b3JrZmxvd0V4ZWN1dGlvblRpbWVvdXQpLFxuICAgICAgICB3b3JrZmxvd1J1blRpbWVvdXQ6IG1zT3B0aW9uYWxUb1RzKG9wdGlvbnMud29ya2Zsb3dSdW5UaW1lb3V0KSxcbiAgICAgICAgd29ya2Zsb3dUYXNrVGltZW91dDogbXNPcHRpb25hbFRvVHMob3B0aW9ucy53b3JrZmxvd1Rhc2tUaW1lb3V0KSxcbiAgICAgICAgbmFtZXNwYWNlOiBhY3RpdmF0b3IuaW5mby5uYW1lc3BhY2UsIC8vIE5vdCBjb25maWd1cmFibGVcbiAgICAgICAgaGVhZGVycyxcbiAgICAgICAgY2FuY2VsbGF0aW9uVHlwZTogb3B0aW9ucy5jYW5jZWxsYXRpb25UeXBlLFxuICAgICAgICB3b3JrZmxvd0lkUmV1c2VQb2xpY3k6IG9wdGlvbnMud29ya2Zsb3dJZFJldXNlUG9saWN5LFxuICAgICAgICBwYXJlbnRDbG9zZVBvbGljeTogb3B0aW9ucy5wYXJlbnRDbG9zZVBvbGljeSxcbiAgICAgICAgY3JvblNjaGVkdWxlOiBvcHRpb25zLmNyb25TY2hlZHVsZSxcbiAgICAgICAgc2VhcmNoQXR0cmlidXRlczogb3B0aW9ucy5zZWFyY2hBdHRyaWJ1dGVzXG4gICAgICAgICAgPyBtYXBUb1BheWxvYWRzKHNlYXJjaEF0dHJpYnV0ZVBheWxvYWRDb252ZXJ0ZXIsIG9wdGlvbnMuc2VhcmNoQXR0cmlidXRlcylcbiAgICAgICAgICA6IHVuZGVmaW5lZCxcbiAgICAgICAgbWVtbzogb3B0aW9ucy5tZW1vICYmIG1hcFRvUGF5bG9hZHMoYWN0aXZhdG9yLnBheWxvYWRDb252ZXJ0ZXIsIG9wdGlvbnMubWVtbyksXG4gICAgICAgIHZlcnNpb25pbmdJbnRlbnQ6IHZlcnNpb25pbmdJbnRlbnRUb1Byb3RvKG9wdGlvbnMudmVyc2lvbmluZ0ludGVudCksXG4gICAgICB9LFxuICAgIH0pO1xuICAgIGFjdGl2YXRvci5jb21wbGV0aW9ucy5jaGlsZFdvcmtmbG93U3RhcnQuc2V0KHNlcSwge1xuICAgICAgcmVzb2x2ZSxcbiAgICAgIHJlamVjdCxcbiAgICB9KTtcbiAgfSk7XG5cbiAgLy8gV2UgY29uc3RydWN0IGEgUHJvbWlzZSBmb3IgdGhlIGNvbXBsZXRpb24gb2YgdGhlIGNoaWxkIFdvcmtmbG93IGJlZm9yZSB3ZSBrbm93XG4gIC8vIGlmIHRoZSBXb3JrZmxvdyBjb2RlIHdpbGwgYXdhaXQgaXQgdG8gY2FwdHVyZSB0aGUgcmVzdWx0IGluIGNhc2UgaXQgZG9lcy5cbiAgY29uc3QgY29tcGxldGVQcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIC8vIENoYWluIHN0YXJ0IFByb21pc2UgcmVqZWN0aW9uIHRvIHRoZSBjb21wbGV0ZSBQcm9taXNlLlxuICAgIHVudHJhY2tQcm9taXNlKHN0YXJ0UHJvbWlzZS5jYXRjaChyZWplY3QpKTtcbiAgICBhY3RpdmF0b3IuY29tcGxldGlvbnMuY2hpbGRXb3JrZmxvd0NvbXBsZXRlLnNldChzZXEsIHtcbiAgICAgIHJlc29sdmUsXG4gICAgICByZWplY3QsXG4gICAgfSk7XG4gIH0pO1xuICB1bnRyYWNrUHJvbWlzZShzdGFydFByb21pc2UpO1xuICB1bnRyYWNrUHJvbWlzZShjb21wbGV0ZVByb21pc2UpO1xuICAvLyBQcmV2ZW50IHVuaGFuZGxlZCByZWplY3Rpb24gYmVjYXVzZSB0aGUgY29tcGxldGlvbiBtaWdodCBub3QgYmUgYXdhaXRlZFxuICB1bnRyYWNrUHJvbWlzZShjb21wbGV0ZVByb21pc2UuY2F0Y2goKCkgPT4gdW5kZWZpbmVkKSk7XG4gIGNvbnN0IHJldCA9IG5ldyBQcm9taXNlPFtQcm9taXNlPHN0cmluZz4sIFByb21pc2U8dW5rbm93bj5dPigocmVzb2x2ZSkgPT4gcmVzb2x2ZShbc3RhcnRQcm9taXNlLCBjb21wbGV0ZVByb21pc2VdKSk7XG4gIHVudHJhY2tQcm9taXNlKHJldCk7XG4gIHJldHVybiByZXQ7XG59XG5cbmZ1bmN0aW9uIHNpZ25hbFdvcmtmbG93TmV4dEhhbmRsZXIoeyBzZXEsIHNpZ25hbE5hbWUsIGFyZ3MsIHRhcmdldCwgaGVhZGVycyB9OiBTaWduYWxXb3JrZmxvd0lucHV0KSB7XG4gIGNvbnN0IGFjdGl2YXRvciA9IGdldEFjdGl2YXRvcigpO1xuICByZXR1cm4gbmV3IFByb21pc2U8YW55PigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgY29uc3Qgc2NvcGUgPSBDYW5jZWxsYXRpb25TY29wZS5jdXJyZW50KCk7XG4gICAgaWYgKHNjb3BlLmNvbnNpZGVyZWRDYW5jZWxsZWQpIHtcbiAgICAgIHVudHJhY2tQcm9taXNlKHNjb3BlLmNhbmNlbFJlcXVlc3RlZC5jYXRjaChyZWplY3QpKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoc2NvcGUuY2FuY2VsbGFibGUpIHtcbiAgICAgIHVudHJhY2tQcm9taXNlKFxuICAgICAgICBzY29wZS5jYW5jZWxSZXF1ZXN0ZWQuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgIGlmICghYWN0aXZhdG9yLmNvbXBsZXRpb25zLnNpZ25hbFdvcmtmbG93LmhhcyhzZXEpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIGFjdGl2YXRvci5wdXNoQ29tbWFuZCh7IGNhbmNlbFNpZ25hbFdvcmtmbG93OiB7IHNlcSB9IH0pO1xuICAgICAgICB9KVxuICAgICAgKTtcbiAgICB9XG4gICAgYWN0aXZhdG9yLnB1c2hDb21tYW5kKHtcbiAgICAgIHNpZ25hbEV4dGVybmFsV29ya2Zsb3dFeGVjdXRpb246IHtcbiAgICAgICAgc2VxLFxuICAgICAgICBhcmdzOiB0b1BheWxvYWRzKGFjdGl2YXRvci5wYXlsb2FkQ29udmVydGVyLCAuLi5hcmdzKSxcbiAgICAgICAgaGVhZGVycyxcbiAgICAgICAgc2lnbmFsTmFtZSxcbiAgICAgICAgLi4uKHRhcmdldC50eXBlID09PSAnZXh0ZXJuYWwnXG4gICAgICAgICAgPyB7XG4gICAgICAgICAgICAgIHdvcmtmbG93RXhlY3V0aW9uOiB7XG4gICAgICAgICAgICAgICAgbmFtZXNwYWNlOiBhY3RpdmF0b3IuaW5mby5uYW1lc3BhY2UsXG4gICAgICAgICAgICAgICAgLi4udGFyZ2V0LndvcmtmbG93RXhlY3V0aW9uLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfVxuICAgICAgICAgIDoge1xuICAgICAgICAgICAgICBjaGlsZFdvcmtmbG93SWQ6IHRhcmdldC5jaGlsZFdvcmtmbG93SWQsXG4gICAgICAgICAgICB9KSxcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICBhY3RpdmF0b3IuY29tcGxldGlvbnMuc2lnbmFsV29ya2Zsb3cuc2V0KHNlcSwgeyByZXNvbHZlLCByZWplY3QgfSk7XG4gIH0pO1xufVxuXG4vKipcbiAqIFN5bWJvbCB1c2VkIGluIHRoZSByZXR1cm4gdHlwZSBvZiBwcm94eSBtZXRob2RzIHRvIG1hcmsgdGhhdCBhbiBhdHRyaWJ1dGUgb24gdGhlIHNvdXJjZSB0eXBlIGlzIG5vdCBhIG1ldGhvZC5cbiAqXG4gKiBAc2VlIHtAbGluayBBY3Rpdml0eUludGVyZmFjZUZvcn1cbiAqIEBzZWUge0BsaW5rIHByb3h5QWN0aXZpdGllc31cbiAqIEBzZWUge0BsaW5rIHByb3h5TG9jYWxBY3Rpdml0aWVzfVxuICovXG5leHBvcnQgY29uc3QgTm90QW5BY3Rpdml0eU1ldGhvZCA9IFN5bWJvbC5mb3IoJ19fVEVNUE9SQUxfTk9UX0FOX0FDVElWSVRZX01FVEhPRCcpO1xuXG4vKipcbiAqIFR5cGUgaGVscGVyIHRoYXQgdGFrZXMgYSB0eXBlIGBUYCBhbmQgdHJhbnNmb3JtcyBhdHRyaWJ1dGVzIHRoYXQgYXJlIG5vdCB7QGxpbmsgQWN0aXZpdHlGdW5jdGlvbn0gdG9cbiAqIHtAbGluayBOb3RBbkFjdGl2aXR5TWV0aG9kfS5cbiAqXG4gKiBAZXhhbXBsZVxuICpcbiAqIFVzZWQgYnkge0BsaW5rIHByb3h5QWN0aXZpdGllc30gdG8gZ2V0IHRoaXMgY29tcGlsZS10aW1lIGVycm9yOlxuICpcbiAqIGBgYHRzXG4gKiBpbnRlcmZhY2UgTXlBY3Rpdml0aWVzIHtcbiAqICAgdmFsaWQoaW5wdXQ6IG51bWJlcik6IFByb21pc2U8bnVtYmVyPjtcbiAqICAgaW52YWxpZChpbnB1dDogbnVtYmVyKTogbnVtYmVyO1xuICogfVxuICpcbiAqIGNvbnN0IGFjdCA9IHByb3h5QWN0aXZpdGllczxNeUFjdGl2aXRpZXM+KHsgc3RhcnRUb0Nsb3NlVGltZW91dDogJzVtJyB9KTtcbiAqXG4gKiBhd2FpdCBhY3QudmFsaWQodHJ1ZSk7XG4gKiBhd2FpdCBhY3QuaW52YWxpZCgpO1xuICogLy8gXiBUUyBjb21wbGFpbnMgd2l0aDpcbiAqIC8vIChwcm9wZXJ0eSkgaW52YWxpZERlZmluaXRpb246IHR5cGVvZiBOb3RBbkFjdGl2aXR5TWV0aG9kXG4gKiAvLyBUaGlzIGV4cHJlc3Npb24gaXMgbm90IGNhbGxhYmxlLlxuICogLy8gVHlwZSAnU3ltYm9sJyBoYXMgbm8gY2FsbCBzaWduYXR1cmVzLigyMzQ5KVxuICogYGBgXG4gKi9cbmV4cG9ydCB0eXBlIEFjdGl2aXR5SW50ZXJmYWNlRm9yPFQ+ID0ge1xuICBbSyBpbiBrZXlvZiBUXTogVFtLXSBleHRlbmRzIEFjdGl2aXR5RnVuY3Rpb24gPyBUW0tdIDogdHlwZW9mIE5vdEFuQWN0aXZpdHlNZXRob2Q7XG59O1xuXG4vKipcbiAqIENvbmZpZ3VyZSBBY3Rpdml0eSBmdW5jdGlvbnMgd2l0aCBnaXZlbiB7QGxpbmsgQWN0aXZpdHlPcHRpb25zfS5cbiAqXG4gKiBUaGlzIG1ldGhvZCBtYXkgYmUgY2FsbGVkIG11bHRpcGxlIHRpbWVzIHRvIHNldHVwIEFjdGl2aXRpZXMgd2l0aCBkaWZmZXJlbnQgb3B0aW9ucy5cbiAqXG4gKiBAcmV0dXJuIGEge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL1Byb3h5IHwgUHJveHl9IGZvclxuICogICAgICAgICB3aGljaCBlYWNoIGF0dHJpYnV0ZSBpcyBhIGNhbGxhYmxlIEFjdGl2aXR5IGZ1bmN0aW9uXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBwcm94eUFjdGl2aXRpZXMgfSBmcm9tICdAdGVtcG9yYWxpby93b3JrZmxvdyc7XG4gKiBpbXBvcnQgKiBhcyBhY3Rpdml0aWVzIGZyb20gJy4uL2FjdGl2aXRpZXMnO1xuICpcbiAqIC8vIFNldHVwIEFjdGl2aXRpZXMgZnJvbSBtb2R1bGUgZXhwb3J0c1xuICogY29uc3QgeyBodHRwR2V0LCBvdGhlckFjdGl2aXR5IH0gPSBwcm94eUFjdGl2aXRpZXM8dHlwZW9mIGFjdGl2aXRpZXM+KHtcbiAqICAgc3RhcnRUb0Nsb3NlVGltZW91dDogJzMwIG1pbnV0ZXMnLFxuICogfSk7XG4gKlxuICogLy8gU2V0dXAgQWN0aXZpdGllcyBmcm9tIGFuIGV4cGxpY2l0IGludGVyZmFjZSAoZS5nLiB3aGVuIGRlZmluZWQgYnkgYW5vdGhlciBTREspXG4gKiBpbnRlcmZhY2UgSmF2YUFjdGl2aXRpZXMge1xuICogICBodHRwR2V0RnJvbUphdmEodXJsOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz5cbiAqICAgc29tZU90aGVySmF2YUFjdGl2aXR5KGFyZzE6IG51bWJlciwgYXJnMjogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+O1xuICogfVxuICpcbiAqIGNvbnN0IHtcbiAqICAgaHR0cEdldEZyb21KYXZhLFxuICogICBzb21lT3RoZXJKYXZhQWN0aXZpdHlcbiAqIH0gPSBwcm94eUFjdGl2aXRpZXM8SmF2YUFjdGl2aXRpZXM+KHtcbiAqICAgdGFza1F1ZXVlOiAnamF2YS13b3JrZXItdGFza1F1ZXVlJyxcbiAqICAgc3RhcnRUb0Nsb3NlVGltZW91dDogJzVtJyxcbiAqIH0pO1xuICpcbiAqIGV4cG9ydCBmdW5jdGlvbiBleGVjdXRlKCk6IFByb21pc2U8dm9pZD4ge1xuICogICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGh0dHBHZXQoXCJodHRwOi8vZXhhbXBsZS5jb21cIik7XG4gKiAgIC8vIC4uLlxuICogfVxuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwcm94eUFjdGl2aXRpZXM8QSA9IFVudHlwZWRBY3Rpdml0aWVzPihvcHRpb25zOiBBY3Rpdml0eU9wdGlvbnMpOiBBY3Rpdml0eUludGVyZmFjZUZvcjxBPiB7XG4gIGlmIChvcHRpb25zID09PSB1bmRlZmluZWQpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdvcHRpb25zIG11c3QgYmUgZGVmaW5lZCcpO1xuICB9XG4gIC8vIFZhbGlkYXRlIGFzIGVhcmx5IGFzIHBvc3NpYmxlIGZvciBpbW1lZGlhdGUgdXNlciBmZWVkYmFja1xuICB2YWxpZGF0ZUFjdGl2aXR5T3B0aW9ucyhvcHRpb25zKTtcbiAgcmV0dXJuIG5ldyBQcm94eShcbiAgICB7fSxcbiAgICB7XG4gICAgICBnZXQoXywgYWN0aXZpdHlUeXBlKSB7XG4gICAgICAgIGlmICh0eXBlb2YgYWN0aXZpdHlUeXBlICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYE9ubHkgc3RyaW5ncyBhcmUgc3VwcG9ydGVkIGZvciBBY3Rpdml0eSB0eXBlcywgZ290OiAke1N0cmluZyhhY3Rpdml0eVR5cGUpfWApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBhY3Rpdml0eVByb3h5RnVuY3Rpb24oLi4uYXJnczogdW5rbm93bltdKTogUHJvbWlzZTx1bmtub3duPiB7XG4gICAgICAgICAgcmV0dXJuIHNjaGVkdWxlQWN0aXZpdHkoYWN0aXZpdHlUeXBlLCBhcmdzLCBvcHRpb25zKTtcbiAgICAgICAgfTtcbiAgICAgIH0sXG4gICAgfVxuICApIGFzIGFueTtcbn1cblxuLyoqXG4gKiBDb25maWd1cmUgTG9jYWwgQWN0aXZpdHkgZnVuY3Rpb25zIHdpdGggZ2l2ZW4ge0BsaW5rIExvY2FsQWN0aXZpdHlPcHRpb25zfS5cbiAqXG4gKiBUaGlzIG1ldGhvZCBtYXkgYmUgY2FsbGVkIG11bHRpcGxlIHRpbWVzIHRvIHNldHVwIEFjdGl2aXRpZXMgd2l0aCBkaWZmZXJlbnQgb3B0aW9ucy5cbiAqXG4gKiBAcmV0dXJuIGEge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL1Byb3h5IHwgUHJveHl9XG4gKiAgICAgICAgIGZvciB3aGljaCBlYWNoIGF0dHJpYnV0ZSBpcyBhIGNhbGxhYmxlIEFjdGl2aXR5IGZ1bmN0aW9uXG4gKlxuICogQHNlZSB7QGxpbmsgcHJveHlBY3Rpdml0aWVzfSBmb3IgZXhhbXBsZXNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHByb3h5TG9jYWxBY3Rpdml0aWVzPEEgPSBVbnR5cGVkQWN0aXZpdGllcz4ob3B0aW9uczogTG9jYWxBY3Rpdml0eU9wdGlvbnMpOiBBY3Rpdml0eUludGVyZmFjZUZvcjxBPiB7XG4gIGlmIChvcHRpb25zID09PSB1bmRlZmluZWQpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdvcHRpb25zIG11c3QgYmUgZGVmaW5lZCcpO1xuICB9XG4gIC8vIFZhbGlkYXRlIGFzIGVhcmx5IGFzIHBvc3NpYmxlIGZvciBpbW1lZGlhdGUgdXNlciBmZWVkYmFja1xuICB2YWxpZGF0ZUxvY2FsQWN0aXZpdHlPcHRpb25zKG9wdGlvbnMpO1xuICByZXR1cm4gbmV3IFByb3h5KFxuICAgIHt9LFxuICAgIHtcbiAgICAgIGdldChfLCBhY3Rpdml0eVR5cGUpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBhY3Rpdml0eVR5cGUgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgT25seSBzdHJpbmdzIGFyZSBzdXBwb3J0ZWQgZm9yIEFjdGl2aXR5IHR5cGVzLCBnb3Q6ICR7U3RyaW5nKGFjdGl2aXR5VHlwZSl9YCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIGxvY2FsQWN0aXZpdHlQcm94eUZ1bmN0aW9uKC4uLmFyZ3M6IHVua25vd25bXSkge1xuICAgICAgICAgIHJldHVybiBzY2hlZHVsZUxvY2FsQWN0aXZpdHkoYWN0aXZpdHlUeXBlLCBhcmdzLCBvcHRpb25zKTtcbiAgICAgICAgfTtcbiAgICAgIH0sXG4gICAgfVxuICApIGFzIGFueTtcbn1cblxuLy8gVE9ETzogZGVwcmVjYXRlIHRoaXMgcGF0Y2ggYWZ0ZXIgXCJlbm91Z2hcIiB0aW1lIGhhcyBwYXNzZWRcbmNvbnN0IEVYVEVSTkFMX1dGX0NBTkNFTF9QQVRDSCA9ICdfX3RlbXBvcmFsX2ludGVybmFsX2Nvbm5lY3RfZXh0ZXJuYWxfaGFuZGxlX2NhbmNlbF90b19zY29wZSc7XG4vLyBUaGUgbmFtZSBvZiB0aGlzIHBhdGNoIGNvbWVzIGZyb20gYW4gYXR0ZW1wdCB0byBidWlsZCBhIGdlbmVyaWMgaW50ZXJuYWwgcGF0Y2hpbmcgbWVjaGFuaXNtLlxuLy8gVGhhdCBlZmZvcnQgaGFzIGJlZW4gYWJhbmRvbmVkIGluIGZhdm9yIG9mIGEgbmV3ZXIgV29ya2Zsb3dUYXNrQ29tcGxldGVkTWV0YWRhdGEgYmFzZWQgbWVjaGFuaXNtLlxuY29uc3QgQ09ORElUSU9OXzBfUEFUQ0ggPSAnX19zZGtfaW50ZXJuYWxfcGF0Y2hfbnVtYmVyOjEnO1xuXG4vKipcbiAqIFJldHVybnMgYSBjbGllbnQtc2lkZSBoYW5kbGUgdGhhdCBjYW4gYmUgdXNlZCB0byBzaWduYWwgYW5kIGNhbmNlbCBhbiBleGlzdGluZyBXb3JrZmxvdyBleGVjdXRpb24uXG4gKiBJdCB0YWtlcyBhIFdvcmtmbG93IElEIGFuZCBvcHRpb25hbCBydW4gSUQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRFeHRlcm5hbFdvcmtmbG93SGFuZGxlKHdvcmtmbG93SWQ6IHN0cmluZywgcnVuSWQ/OiBzdHJpbmcpOiBFeHRlcm5hbFdvcmtmbG93SGFuZGxlIHtcbiAgY29uc3QgYWN0aXZhdG9yID0gYXNzZXJ0SW5Xb3JrZmxvd0NvbnRleHQoXG4gICAgJ1dvcmtmbG93LmdldEV4dGVybmFsV29ya2Zsb3dIYW5kbGUoLi4uKSBtYXkgb25seSBiZSB1c2VkIGZyb20gYSBXb3JrZmxvdyBFeGVjdXRpb24uIENvbnNpZGVyIHVzaW5nIENsaWVudC53b3JrZmxvdy5nZXRIYW5kbGUoLi4uKSBpbnN0ZWFkLiknXG4gICk7XG4gIHJldHVybiB7XG4gICAgd29ya2Zsb3dJZCxcbiAgICBydW5JZCxcbiAgICBjYW5jZWwoKSB7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2U8dm9pZD4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAvLyBDb25uZWN0IHRoaXMgY2FuY2VsIG9wZXJhdGlvbiB0byB0aGUgY3VycmVudCBjYW5jZWxsYXRpb24gc2NvcGUuXG4gICAgICAgIC8vIFRoaXMgaXMgYmVoYXZpb3Igd2FzIGludHJvZHVjZWQgYWZ0ZXIgdjAuMjIuMCBhbmQgaXMgaW5jb21wYXRpYmxlXG4gICAgICAgIC8vIHdpdGggaGlzdG9yaWVzIGdlbmVyYXRlZCB3aXRoIHByZXZpb3VzIFNESyB2ZXJzaW9ucyBhbmQgdGh1cyByZXF1aXJlc1xuICAgICAgICAvLyBwYXRjaGluZy5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gV2UgdHJ5IHRvIGRlbGF5IHBhdGNoaW5nIGFzIG11Y2ggYXMgcG9zc2libGUgdG8gYXZvaWQgcG9sbHV0aW5nXG4gICAgICAgIC8vIGhpc3RvcmllcyB1bmxlc3Mgc3RyaWN0bHkgcmVxdWlyZWQuXG4gICAgICAgIGNvbnN0IHNjb3BlID0gQ2FuY2VsbGF0aW9uU2NvcGUuY3VycmVudCgpO1xuICAgICAgICBpZiAoc2NvcGUuY2FuY2VsbGFibGUpIHtcbiAgICAgICAgICB1bnRyYWNrUHJvbWlzZShcbiAgICAgICAgICAgIHNjb3BlLmNhbmNlbFJlcXVlc3RlZC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICAgIGlmIChwYXRjaGVkKEVYVEVSTkFMX1dGX0NBTkNFTF9QQVRDSCkpIHtcbiAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzY29wZS5jb25zaWRlcmVkQ2FuY2VsbGVkKSB7XG4gICAgICAgICAgaWYgKHBhdGNoZWQoRVhURVJOQUxfV0ZfQ0FOQ0VMX1BBVENIKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHNlcSA9IGFjdGl2YXRvci5uZXh0U2Vxcy5jYW5jZWxXb3JrZmxvdysrO1xuICAgICAgICBhY3RpdmF0b3IucHVzaENvbW1hbmQoe1xuICAgICAgICAgIHJlcXVlc3RDYW5jZWxFeHRlcm5hbFdvcmtmbG93RXhlY3V0aW9uOiB7XG4gICAgICAgICAgICBzZXEsXG4gICAgICAgICAgICB3b3JrZmxvd0V4ZWN1dGlvbjoge1xuICAgICAgICAgICAgICBuYW1lc3BhY2U6IGFjdGl2YXRvci5pbmZvLm5hbWVzcGFjZSxcbiAgICAgICAgICAgICAgd29ya2Zsb3dJZCxcbiAgICAgICAgICAgICAgcnVuSWQsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgICAgICBhY3RpdmF0b3IuY29tcGxldGlvbnMuY2FuY2VsV29ya2Zsb3cuc2V0KHNlcSwgeyByZXNvbHZlLCByZWplY3QgfSk7XG4gICAgICB9KTtcbiAgICB9LFxuICAgIHNpZ25hbDxBcmdzIGV4dGVuZHMgYW55W10+KGRlZjogU2lnbmFsRGVmaW5pdGlvbjxBcmdzPiB8IHN0cmluZywgLi4uYXJnczogQXJncyk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgcmV0dXJuIGNvbXBvc2VJbnRlcmNlcHRvcnMoXG4gICAgICAgIGFjdGl2YXRvci5pbnRlcmNlcHRvcnMub3V0Ym91bmQsXG4gICAgICAgICdzaWduYWxXb3JrZmxvdycsXG4gICAgICAgIHNpZ25hbFdvcmtmbG93TmV4dEhhbmRsZXJcbiAgICAgICkoe1xuICAgICAgICBzZXE6IGFjdGl2YXRvci5uZXh0U2Vxcy5zaWduYWxXb3JrZmxvdysrLFxuICAgICAgICBzaWduYWxOYW1lOiB0eXBlb2YgZGVmID09PSAnc3RyaW5nJyA/IGRlZiA6IGRlZi5uYW1lLFxuICAgICAgICBhcmdzLFxuICAgICAgICB0YXJnZXQ6IHtcbiAgICAgICAgICB0eXBlOiAnZXh0ZXJuYWwnLFxuICAgICAgICAgIHdvcmtmbG93RXhlY3V0aW9uOiB7IHdvcmtmbG93SWQsIHJ1bklkIH0sXG4gICAgICAgIH0sXG4gICAgICAgIGhlYWRlcnM6IHt9LFxuICAgICAgfSk7XG4gICAgfSxcbiAgfTtcbn1cblxuLyoqXG4gKiBTdGFydCBhIGNoaWxkIFdvcmtmbG93IGV4ZWN1dGlvblxuICpcbiAqIC0gUmV0dXJucyBhIGNsaWVudC1zaWRlIGhhbmRsZSB0aGF0IGltcGxlbWVudHMgYSBjaGlsZCBXb3JrZmxvdyBpbnRlcmZhY2UuXG4gKiAtIEJ5IGRlZmF1bHQsIGEgY2hpbGQgd2lsbCBiZSBzY2hlZHVsZWQgb24gdGhlIHNhbWUgdGFzayBxdWV1ZSBhcyBpdHMgcGFyZW50LlxuICpcbiAqIEEgY2hpbGQgV29ya2Zsb3cgaGFuZGxlIHN1cHBvcnRzIGF3YWl0aW5nIGNvbXBsZXRpb24sIHNpZ25hbGluZyBhbmQgY2FuY2VsbGF0aW9uIHZpYSB7QGxpbmsgQ2FuY2VsbGF0aW9uU2NvcGV9cy5cbiAqIEluIG9yZGVyIHRvIHF1ZXJ5IHRoZSBjaGlsZCwgdXNlIGEge0BsaW5rIFdvcmtmbG93Q2xpZW50fSBmcm9tIGFuIEFjdGl2aXR5LlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc3RhcnRDaGlsZDxUIGV4dGVuZHMgV29ya2Zsb3c+KFxuICB3b3JrZmxvd1R5cGU6IHN0cmluZyxcbiAgb3B0aW9uczogV2l0aFdvcmtmbG93QXJnczxULCBDaGlsZFdvcmtmbG93T3B0aW9ucz5cbik6IFByb21pc2U8Q2hpbGRXb3JrZmxvd0hhbmRsZTxUPj47XG5cbi8qKlxuICogU3RhcnQgYSBjaGlsZCBXb3JrZmxvdyBleGVjdXRpb25cbiAqXG4gKiAtIFJldHVybnMgYSBjbGllbnQtc2lkZSBoYW5kbGUgdGhhdCBpbXBsZW1lbnRzIGEgY2hpbGQgV29ya2Zsb3cgaW50ZXJmYWNlLlxuICogLSBEZWR1Y2VzIHRoZSBXb3JrZmxvdyB0eXBlIGFuZCBzaWduYXR1cmUgZnJvbSBwcm92aWRlZCBXb3JrZmxvdyBmdW5jdGlvbi5cbiAqIC0gQnkgZGVmYXVsdCwgYSBjaGlsZCB3aWxsIGJlIHNjaGVkdWxlZCBvbiB0aGUgc2FtZSB0YXNrIHF1ZXVlIGFzIGl0cyBwYXJlbnQuXG4gKlxuICogQSBjaGlsZCBXb3JrZmxvdyBoYW5kbGUgc3VwcG9ydHMgYXdhaXRpbmcgY29tcGxldGlvbiwgc2lnbmFsaW5nIGFuZCBjYW5jZWxsYXRpb24gdmlhIHtAbGluayBDYW5jZWxsYXRpb25TY29wZX1zLlxuICogSW4gb3JkZXIgdG8gcXVlcnkgdGhlIGNoaWxkLCB1c2UgYSB7QGxpbmsgV29ya2Zsb3dDbGllbnR9IGZyb20gYW4gQWN0aXZpdHkuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzdGFydENoaWxkPFQgZXh0ZW5kcyBXb3JrZmxvdz4oXG4gIHdvcmtmbG93RnVuYzogVCxcbiAgb3B0aW9uczogV2l0aFdvcmtmbG93QXJnczxULCBDaGlsZFdvcmtmbG93T3B0aW9ucz5cbik6IFByb21pc2U8Q2hpbGRXb3JrZmxvd0hhbmRsZTxUPj47XG5cbi8qKlxuICogU3RhcnQgYSBjaGlsZCBXb3JrZmxvdyBleGVjdXRpb25cbiAqXG4gKiAqKk92ZXJyaWRlIGZvciBXb3JrZmxvd3MgdGhhdCBhY2NlcHQgbm8gYXJndW1lbnRzKiouXG4gKlxuICogLSBSZXR1cm5zIGEgY2xpZW50LXNpZGUgaGFuZGxlIHRoYXQgaW1wbGVtZW50cyBhIGNoaWxkIFdvcmtmbG93IGludGVyZmFjZS5cbiAqIC0gVGhlIGNoaWxkIHdpbGwgYmUgc2NoZWR1bGVkIG9uIHRoZSBzYW1lIHRhc2sgcXVldWUgYXMgaXRzIHBhcmVudC5cbiAqXG4gKiBBIGNoaWxkIFdvcmtmbG93IGhhbmRsZSBzdXBwb3J0cyBhd2FpdGluZyBjb21wbGV0aW9uLCBzaWduYWxpbmcgYW5kIGNhbmNlbGxhdGlvbiB2aWEge0BsaW5rIENhbmNlbGxhdGlvblNjb3BlfXMuXG4gKiBJbiBvcmRlciB0byBxdWVyeSB0aGUgY2hpbGQsIHVzZSBhIHtAbGluayBXb3JrZmxvd0NsaWVudH0gZnJvbSBhbiBBY3Rpdml0eS5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHN0YXJ0Q2hpbGQ8VCBleHRlbmRzICgpID0+IFByb21pc2U8YW55Pj4od29ya2Zsb3dUeXBlOiBzdHJpbmcpOiBQcm9taXNlPENoaWxkV29ya2Zsb3dIYW5kbGU8VD4+O1xuXG4vKipcbiAqIFN0YXJ0IGEgY2hpbGQgV29ya2Zsb3cgZXhlY3V0aW9uXG4gKlxuICogKipPdmVycmlkZSBmb3IgV29ya2Zsb3dzIHRoYXQgYWNjZXB0IG5vIGFyZ3VtZW50cyoqLlxuICpcbiAqIC0gUmV0dXJucyBhIGNsaWVudC1zaWRlIGhhbmRsZSB0aGF0IGltcGxlbWVudHMgYSBjaGlsZCBXb3JrZmxvdyBpbnRlcmZhY2UuXG4gKiAtIERlZHVjZXMgdGhlIFdvcmtmbG93IHR5cGUgYW5kIHNpZ25hdHVyZSBmcm9tIHByb3ZpZGVkIFdvcmtmbG93IGZ1bmN0aW9uLlxuICogLSBUaGUgY2hpbGQgd2lsbCBiZSBzY2hlZHVsZWQgb24gdGhlIHNhbWUgdGFzayBxdWV1ZSBhcyBpdHMgcGFyZW50LlxuICpcbiAqIEEgY2hpbGQgV29ya2Zsb3cgaGFuZGxlIHN1cHBvcnRzIGF3YWl0aW5nIGNvbXBsZXRpb24sIHNpZ25hbGluZyBhbmQgY2FuY2VsbGF0aW9uIHZpYSB7QGxpbmsgQ2FuY2VsbGF0aW9uU2NvcGV9cy5cbiAqIEluIG9yZGVyIHRvIHF1ZXJ5IHRoZSBjaGlsZCwgdXNlIGEge0BsaW5rIFdvcmtmbG93Q2xpZW50fSBmcm9tIGFuIEFjdGl2aXR5LlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc3RhcnRDaGlsZDxUIGV4dGVuZHMgKCkgPT4gUHJvbWlzZTxhbnk+Pih3b3JrZmxvd0Z1bmM6IFQpOiBQcm9taXNlPENoaWxkV29ya2Zsb3dIYW5kbGU8VD4+O1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc3RhcnRDaGlsZDxUIGV4dGVuZHMgV29ya2Zsb3c+KFxuICB3b3JrZmxvd1R5cGVPckZ1bmM6IHN0cmluZyB8IFQsXG4gIG9wdGlvbnM/OiBXaXRoV29ya2Zsb3dBcmdzPFQsIENoaWxkV29ya2Zsb3dPcHRpb25zPlxuKTogUHJvbWlzZTxDaGlsZFdvcmtmbG93SGFuZGxlPFQ+PiB7XG4gIGNvbnN0IGFjdGl2YXRvciA9IGFzc2VydEluV29ya2Zsb3dDb250ZXh0KFxuICAgICdXb3JrZmxvdy5zdGFydENoaWxkKC4uLikgbWF5IG9ubHkgYmUgdXNlZCBmcm9tIGEgV29ya2Zsb3cgRXhlY3V0aW9uLiBDb25zaWRlciB1c2luZyBDbGllbnQud29ya2Zsb3cuc3RhcnQoLi4uKSBpbnN0ZWFkLiknXG4gICk7XG4gIGNvbnN0IG9wdGlvbnNXaXRoRGVmYXVsdHMgPSBhZGREZWZhdWx0V29ya2Zsb3dPcHRpb25zKG9wdGlvbnMgPz8gKHt9IGFzIGFueSkpO1xuICBjb25zdCB3b3JrZmxvd1R5cGUgPSBleHRyYWN0V29ya2Zsb3dUeXBlKHdvcmtmbG93VHlwZU9yRnVuYyk7XG4gIGNvbnN0IGV4ZWN1dGUgPSBjb21wb3NlSW50ZXJjZXB0b3JzKFxuICAgIGFjdGl2YXRvci5pbnRlcmNlcHRvcnMub3V0Ym91bmQsXG4gICAgJ3N0YXJ0Q2hpbGRXb3JrZmxvd0V4ZWN1dGlvbicsXG4gICAgc3RhcnRDaGlsZFdvcmtmbG93RXhlY3V0aW9uTmV4dEhhbmRsZXJcbiAgKTtcbiAgY29uc3QgW3N0YXJ0ZWQsIGNvbXBsZXRlZF0gPSBhd2FpdCBleGVjdXRlKHtcbiAgICBzZXE6IGFjdGl2YXRvci5uZXh0U2Vxcy5jaGlsZFdvcmtmbG93KyssXG4gICAgb3B0aW9uczogb3B0aW9uc1dpdGhEZWZhdWx0cyxcbiAgICBoZWFkZXJzOiB7fSxcbiAgICB3b3JrZmxvd1R5cGUsXG4gIH0pO1xuICBjb25zdCBmaXJzdEV4ZWN1dGlvblJ1bklkID0gYXdhaXQgc3RhcnRlZDtcblxuICByZXR1cm4ge1xuICAgIHdvcmtmbG93SWQ6IG9wdGlvbnNXaXRoRGVmYXVsdHMud29ya2Zsb3dJZCxcbiAgICBmaXJzdEV4ZWN1dGlvblJ1bklkLFxuICAgIGFzeW5jIHJlc3VsdCgpOiBQcm9taXNlPFdvcmtmbG93UmVzdWx0VHlwZTxUPj4ge1xuICAgICAgcmV0dXJuIChhd2FpdCBjb21wbGV0ZWQpIGFzIGFueTtcbiAgICB9LFxuICAgIGFzeW5jIHNpZ25hbDxBcmdzIGV4dGVuZHMgYW55W10+KGRlZjogU2lnbmFsRGVmaW5pdGlvbjxBcmdzPiB8IHN0cmluZywgLi4uYXJnczogQXJncyk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgcmV0dXJuIGNvbXBvc2VJbnRlcmNlcHRvcnMoXG4gICAgICAgIGFjdGl2YXRvci5pbnRlcmNlcHRvcnMub3V0Ym91bmQsXG4gICAgICAgICdzaWduYWxXb3JrZmxvdycsXG4gICAgICAgIHNpZ25hbFdvcmtmbG93TmV4dEhhbmRsZXJcbiAgICAgICkoe1xuICAgICAgICBzZXE6IGFjdGl2YXRvci5uZXh0U2Vxcy5zaWduYWxXb3JrZmxvdysrLFxuICAgICAgICBzaWduYWxOYW1lOiB0eXBlb2YgZGVmID09PSAnc3RyaW5nJyA/IGRlZiA6IGRlZi5uYW1lLFxuICAgICAgICBhcmdzLFxuICAgICAgICB0YXJnZXQ6IHtcbiAgICAgICAgICB0eXBlOiAnY2hpbGQnLFxuICAgICAgICAgIGNoaWxkV29ya2Zsb3dJZDogb3B0aW9uc1dpdGhEZWZhdWx0cy53b3JrZmxvd0lkLFxuICAgICAgICB9LFxuICAgICAgICBoZWFkZXJzOiB7fSxcbiAgICAgIH0pO1xuICAgIH0sXG4gIH07XG59XG5cbi8qKlxuICogU3RhcnQgYSBjaGlsZCBXb3JrZmxvdyBleGVjdXRpb24gYW5kIGF3YWl0IGl0cyBjb21wbGV0aW9uLlxuICpcbiAqIC0gQnkgZGVmYXVsdCwgYSBjaGlsZCB3aWxsIGJlIHNjaGVkdWxlZCBvbiB0aGUgc2FtZSB0YXNrIHF1ZXVlIGFzIGl0cyBwYXJlbnQuXG4gKiAtIFRoaXMgb3BlcmF0aW9uIGlzIGNhbmNlbGxhYmxlIHVzaW5nIHtAbGluayBDYW5jZWxsYXRpb25TY29wZX1zLlxuICpcbiAqIEByZXR1cm4gVGhlIHJlc3VsdCBvZiB0aGUgY2hpbGQgV29ya2Zsb3cuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBleGVjdXRlQ2hpbGQ8VCBleHRlbmRzIFdvcmtmbG93PihcbiAgd29ya2Zsb3dUeXBlOiBzdHJpbmcsXG4gIG9wdGlvbnM6IFdpdGhXb3JrZmxvd0FyZ3M8VCwgQ2hpbGRXb3JrZmxvd09wdGlvbnM+XG4pOiBQcm9taXNlPFdvcmtmbG93UmVzdWx0VHlwZTxUPj47XG5cbi8qKlxuICogU3RhcnQgYSBjaGlsZCBXb3JrZmxvdyBleGVjdXRpb24gYW5kIGF3YWl0IGl0cyBjb21wbGV0aW9uLlxuICpcbiAqIC0gQnkgZGVmYXVsdCwgYSBjaGlsZCB3aWxsIGJlIHNjaGVkdWxlZCBvbiB0aGUgc2FtZSB0YXNrIHF1ZXVlIGFzIGl0cyBwYXJlbnQuXG4gKiAtIERlZHVjZXMgdGhlIFdvcmtmbG93IHR5cGUgYW5kIHNpZ25hdHVyZSBmcm9tIHByb3ZpZGVkIFdvcmtmbG93IGZ1bmN0aW9uLlxuICogLSBUaGlzIG9wZXJhdGlvbiBpcyBjYW5jZWxsYWJsZSB1c2luZyB7QGxpbmsgQ2FuY2VsbGF0aW9uU2NvcGV9cy5cbiAqXG4gKiBAcmV0dXJuIFRoZSByZXN1bHQgb2YgdGhlIGNoaWxkIFdvcmtmbG93LlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZXhlY3V0ZUNoaWxkPFQgZXh0ZW5kcyBXb3JrZmxvdz4oXG4gIHdvcmtmbG93RnVuYzogVCxcbiAgb3B0aW9uczogV2l0aFdvcmtmbG93QXJnczxULCBDaGlsZFdvcmtmbG93T3B0aW9ucz5cbik6IFByb21pc2U8V29ya2Zsb3dSZXN1bHRUeXBlPFQ+PjtcblxuLyoqXG4gKiBTdGFydCBhIGNoaWxkIFdvcmtmbG93IGV4ZWN1dGlvbiBhbmQgYXdhaXQgaXRzIGNvbXBsZXRpb24uXG4gKlxuICogKipPdmVycmlkZSBmb3IgV29ya2Zsb3dzIHRoYXQgYWNjZXB0IG5vIGFyZ3VtZW50cyoqLlxuICpcbiAqIC0gVGhlIGNoaWxkIHdpbGwgYmUgc2NoZWR1bGVkIG9uIHRoZSBzYW1lIHRhc2sgcXVldWUgYXMgaXRzIHBhcmVudC5cbiAqIC0gVGhpcyBvcGVyYXRpb24gaXMgY2FuY2VsbGFibGUgdXNpbmcge0BsaW5rIENhbmNlbGxhdGlvblNjb3BlfXMuXG4gKlxuICogQHJldHVybiBUaGUgcmVzdWx0IG9mIHRoZSBjaGlsZCBXb3JrZmxvdy5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGV4ZWN1dGVDaGlsZDxUIGV4dGVuZHMgKCkgPT4gV29ya2Zsb3dSZXR1cm5UeXBlPihcbiAgd29ya2Zsb3dUeXBlOiBzdHJpbmdcbik6IFByb21pc2U8V29ya2Zsb3dSZXN1bHRUeXBlPFQ+PjtcblxuLyoqXG4gKiBTdGFydCBhIGNoaWxkIFdvcmtmbG93IGV4ZWN1dGlvbiBhbmQgYXdhaXQgaXRzIGNvbXBsZXRpb24uXG4gKlxuICogKipPdmVycmlkZSBmb3IgV29ya2Zsb3dzIHRoYXQgYWNjZXB0IG5vIGFyZ3VtZW50cyoqLlxuICpcbiAqIC0gVGhlIGNoaWxkIHdpbGwgYmUgc2NoZWR1bGVkIG9uIHRoZSBzYW1lIHRhc2sgcXVldWUgYXMgaXRzIHBhcmVudC5cbiAqIC0gRGVkdWNlcyB0aGUgV29ya2Zsb3cgdHlwZSBhbmQgc2lnbmF0dXJlIGZyb20gcHJvdmlkZWQgV29ya2Zsb3cgZnVuY3Rpb24uXG4gKiAtIFRoaXMgb3BlcmF0aW9uIGlzIGNhbmNlbGxhYmxlIHVzaW5nIHtAbGluayBDYW5jZWxsYXRpb25TY29wZX1zLlxuICpcbiAqIEByZXR1cm4gVGhlIHJlc3VsdCBvZiB0aGUgY2hpbGQgV29ya2Zsb3cuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBleGVjdXRlQ2hpbGQ8VCBleHRlbmRzICgpID0+IFdvcmtmbG93UmV0dXJuVHlwZT4od29ya2Zsb3dGdW5jOiBUKTogUHJvbWlzZTxXb3JrZmxvd1Jlc3VsdFR5cGU8VD4+O1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZXhlY3V0ZUNoaWxkPFQgZXh0ZW5kcyBXb3JrZmxvdz4oXG4gIHdvcmtmbG93VHlwZU9yRnVuYzogc3RyaW5nIHwgVCxcbiAgb3B0aW9ucz86IFdpdGhXb3JrZmxvd0FyZ3M8VCwgQ2hpbGRXb3JrZmxvd09wdGlvbnM+XG4pOiBQcm9taXNlPFdvcmtmbG93UmVzdWx0VHlwZTxUPj4ge1xuICBjb25zdCBhY3RpdmF0b3IgPSBhc3NlcnRJbldvcmtmbG93Q29udGV4dChcbiAgICAnV29ya2Zsb3cuZXhlY3V0ZUNoaWxkKC4uLikgbWF5IG9ubHkgYmUgdXNlZCBmcm9tIGEgV29ya2Zsb3cgRXhlY3V0aW9uLiBDb25zaWRlciB1c2luZyBDbGllbnQud29ya2Zsb3cuZXhlY3V0ZSguLi4pIGluc3RlYWQuJ1xuICApO1xuICBjb25zdCBvcHRpb25zV2l0aERlZmF1bHRzID0gYWRkRGVmYXVsdFdvcmtmbG93T3B0aW9ucyhvcHRpb25zID8/ICh7fSBhcyBhbnkpKTtcbiAgY29uc3Qgd29ya2Zsb3dUeXBlID0gZXh0cmFjdFdvcmtmbG93VHlwZSh3b3JrZmxvd1R5cGVPckZ1bmMpO1xuICBjb25zdCBleGVjdXRlID0gY29tcG9zZUludGVyY2VwdG9ycyhcbiAgICBhY3RpdmF0b3IuaW50ZXJjZXB0b3JzLm91dGJvdW5kLFxuICAgICdzdGFydENoaWxkV29ya2Zsb3dFeGVjdXRpb24nLFxuICAgIHN0YXJ0Q2hpbGRXb3JrZmxvd0V4ZWN1dGlvbk5leHRIYW5kbGVyXG4gICk7XG4gIGNvbnN0IGV4ZWNQcm9taXNlID0gZXhlY3V0ZSh7XG4gICAgc2VxOiBhY3RpdmF0b3IubmV4dFNlcXMuY2hpbGRXb3JrZmxvdysrLFxuICAgIG9wdGlvbnM6IG9wdGlvbnNXaXRoRGVmYXVsdHMsXG4gICAgaGVhZGVyczoge30sXG4gICAgd29ya2Zsb3dUeXBlLFxuICB9KTtcbiAgdW50cmFja1Byb21pc2UoZXhlY1Byb21pc2UpO1xuICBjb25zdCBjb21wbGV0ZWRQcm9taXNlID0gZXhlY1Byb21pc2UudGhlbigoW19zdGFydGVkLCBjb21wbGV0ZWRdKSA9PiBjb21wbGV0ZWQpO1xuICB1bnRyYWNrUHJvbWlzZShjb21wbGV0ZWRQcm9taXNlKTtcbiAgcmV0dXJuIGNvbXBsZXRlZFByb21pc2UgYXMgUHJvbWlzZTxhbnk+O1xufVxuXG4vKipcbiAqIEdldCBpbmZvcm1hdGlvbiBhYm91dCB0aGUgY3VycmVudCBXb3JrZmxvdy5cbiAqXG4gKiBXQVJOSU5HOiBUaGlzIGZ1bmN0aW9uIHJldHVybnMgYSBmcm96ZW4gY29weSBvZiBXb3JrZmxvd0luZm8sIGF0IHRoZSBwb2ludCB3aGVyZSB0aGlzIG1ldGhvZCBoYXMgYmVlbiBjYWxsZWQuXG4gKiBDaGFuZ2VzIGhhcHBlbmluZyBhdCBsYXRlciBwb2ludCBpbiB3b3JrZmxvdyBleGVjdXRpb24gd2lsbCBub3QgYmUgcmVmbGVjdGVkIGluIHRoZSByZXR1cm5lZCBvYmplY3QuXG4gKlxuICogRm9yIHRoaXMgcmVhc29uLCB3ZSByZWNvbW1lbmQgY2FsbGluZyBgd29ya2Zsb3dJbmZvKClgIG9uIGV2ZXJ5IGFjY2VzcyB0byB7QGxpbmsgV29ya2Zsb3dJbmZvfSdzIGZpZWxkcyxcbiAqIHJhdGhlciB0aGFuIGNhY2hpbmcgdGhlIGBXb3JrZmxvd0luZm9gIG9iamVjdCAob3IgcGFydCBvZiBpdCkgaW4gYSBsb2NhbCB2YXJpYWJsZS4gRm9yIGV4YW1wbGU6XG4gKlxuICogYGBgdHNcbiAqIC8vIEdPT0RcbiAqIGZ1bmN0aW9uIG15V29ya2Zsb3coKSB7XG4gKiAgIGRvU29tZXRoaW5nKHdvcmtmbG93SW5mbygpLnNlYXJjaEF0dHJpYnV0ZXMpXG4gKiAgIC4uLlxuICogICBkb1NvbWV0aGluZ0Vsc2Uod29ya2Zsb3dJbmZvKCkuc2VhcmNoQXR0cmlidXRlcylcbiAqIH1cbiAqIGBgYFxuICpcbiAqIHZzXG4gKlxuICogYGBgdHNcbiAqIC8vIEJBRFxuICogZnVuY3Rpb24gbXlXb3JrZmxvdygpIHtcbiAqICAgY29uc3QgYXR0cmlidXRlcyA9IHdvcmtmbG93SW5mbygpLnNlYXJjaEF0dHJpYnV0ZXNcbiAqICAgZG9Tb21ldGhpbmcoYXR0cmlidXRlcylcbiAqICAgLi4uXG4gKiAgIGRvU29tZXRoaW5nRWxzZShhdHRyaWJ1dGVzKVxuICogfVxuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB3b3JrZmxvd0luZm8oKTogV29ya2Zsb3dJbmZvIHtcbiAgY29uc3QgYWN0aXZhdG9yID0gYXNzZXJ0SW5Xb3JrZmxvd0NvbnRleHQoJ1dvcmtmbG93LndvcmtmbG93SW5mbyguLi4pIG1heSBvbmx5IGJlIHVzZWQgZnJvbSBhIFdvcmtmbG93IEV4ZWN1dGlvbi4nKTtcbiAgcmV0dXJuIGFjdGl2YXRvci5pbmZvO1xufVxuXG4vKipcbiAqIEdldCBpbmZvcm1hdGlvbiBhYm91dCB0aGUgY3VycmVudCB1cGRhdGUgaWYgYW55LlxuICpcbiAqIEByZXR1cm4gSW5mbyBmb3IgdGhlIGN1cnJlbnQgdXBkYXRlIGhhbmRsZXIgdGhlIGNvZGUgY2FsbGluZyB0aGlzIGlzIGV4ZWN1dGluZ1xuICogd2l0aGluIGlmIGFueS5cbiAqXG4gKiBAZXhwZXJpbWVudGFsXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjdXJyZW50VXBkYXRlSW5mbygpOiBVcGRhdGVJbmZvIHwgdW5kZWZpbmVkIHtcbiAgYXNzZXJ0SW5Xb3JrZmxvd0NvbnRleHQoJ1dvcmtmbG93LmN1cnJlbnRVcGRhdGVJbmZvKC4uLikgbWF5IG9ubHkgYmUgdXNlZCBmcm9tIGEgV29ya2Zsb3cgRXhlY3V0aW9uLicpO1xuICByZXR1cm4gVXBkYXRlU2NvcGUuY3VycmVudCgpO1xufVxuXG4vKipcbiAqIFJldHVybnMgd2hldGhlciBvciBub3QgY29kZSBpcyBleGVjdXRpbmcgaW4gd29ya2Zsb3cgY29udGV4dFxuICovXG5leHBvcnQgZnVuY3Rpb24gaW5Xb3JrZmxvd0NvbnRleHQoKTogYm9vbGVhbiB7XG4gIHJldHVybiBtYXliZUdldEFjdGl2YXRvcigpICE9PSB1bmRlZmluZWQ7XG59XG5cbi8qKlxuICogUmV0dXJucyBhIGZ1bmN0aW9uIGBmYCB0aGF0IHdpbGwgY2F1c2UgdGhlIGN1cnJlbnQgV29ya2Zsb3cgdG8gQ29udGludWVBc05ldyB3aGVuIGNhbGxlZC5cbiAqXG4gKiBgZmAgdGFrZXMgdGhlIHNhbWUgYXJndW1lbnRzIGFzIHRoZSBXb3JrZmxvdyBmdW5jdGlvbiBzdXBwbGllZCB0byB0eXBlcGFyYW0gYEZgLlxuICpcbiAqIE9uY2UgYGZgIGlzIGNhbGxlZCwgV29ya2Zsb3cgRXhlY3V0aW9uIGltbWVkaWF0ZWx5IGNvbXBsZXRlcy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1ha2VDb250aW51ZUFzTmV3RnVuYzxGIGV4dGVuZHMgV29ya2Zsb3c+KFxuICBvcHRpb25zPzogQ29udGludWVBc05ld09wdGlvbnNcbik6ICguLi5hcmdzOiBQYXJhbWV0ZXJzPEY+KSA9PiBQcm9taXNlPG5ldmVyPiB7XG4gIGNvbnN0IGFjdGl2YXRvciA9IGFzc2VydEluV29ya2Zsb3dDb250ZXh0KFxuICAgICdXb3JrZmxvdy5jb250aW51ZUFzTmV3KC4uLikgYW5kIFdvcmtmbG93Lm1ha2VDb250aW51ZUFzTmV3RnVuYyguLi4pIG1heSBvbmx5IGJlIHVzZWQgZnJvbSBhIFdvcmtmbG93IEV4ZWN1dGlvbi4nXG4gICk7XG4gIGNvbnN0IGluZm8gPSBhY3RpdmF0b3IuaW5mbztcbiAgY29uc3QgeyB3b3JrZmxvd1R5cGUsIHRhc2tRdWV1ZSwgLi4ucmVzdCB9ID0gb3B0aW9ucyA/PyB7fTtcbiAgY29uc3QgcmVxdWlyZWRPcHRpb25zID0ge1xuICAgIHdvcmtmbG93VHlwZTogd29ya2Zsb3dUeXBlID8/IGluZm8ud29ya2Zsb3dUeXBlLFxuICAgIHRhc2tRdWV1ZTogdGFza1F1ZXVlID8/IGluZm8udGFza1F1ZXVlLFxuICAgIC4uLnJlc3QsXG4gIH07XG5cbiAgcmV0dXJuICguLi5hcmdzOiBQYXJhbWV0ZXJzPEY+KTogUHJvbWlzZTxuZXZlcj4gPT4ge1xuICAgIGNvbnN0IGZuID0gY29tcG9zZUludGVyY2VwdG9ycyhhY3RpdmF0b3IuaW50ZXJjZXB0b3JzLm91dGJvdW5kLCAnY29udGludWVBc05ldycsIGFzeW5jIChpbnB1dCkgPT4ge1xuICAgICAgY29uc3QgeyBoZWFkZXJzLCBhcmdzLCBvcHRpb25zIH0gPSBpbnB1dDtcbiAgICAgIHRocm93IG5ldyBDb250aW51ZUFzTmV3KHtcbiAgICAgICAgd29ya2Zsb3dUeXBlOiBvcHRpb25zLndvcmtmbG93VHlwZSxcbiAgICAgICAgYXJndW1lbnRzOiB0b1BheWxvYWRzKGFjdGl2YXRvci5wYXlsb2FkQ29udmVydGVyLCAuLi5hcmdzKSxcbiAgICAgICAgaGVhZGVycyxcbiAgICAgICAgdGFza1F1ZXVlOiBvcHRpb25zLnRhc2tRdWV1ZSxcbiAgICAgICAgbWVtbzogb3B0aW9ucy5tZW1vICYmIG1hcFRvUGF5bG9hZHMoYWN0aXZhdG9yLnBheWxvYWRDb252ZXJ0ZXIsIG9wdGlvbnMubWVtbyksXG4gICAgICAgIHNlYXJjaEF0dHJpYnV0ZXM6IG9wdGlvbnMuc2VhcmNoQXR0cmlidXRlc1xuICAgICAgICAgID8gbWFwVG9QYXlsb2FkcyhzZWFyY2hBdHRyaWJ1dGVQYXlsb2FkQ29udmVydGVyLCBvcHRpb25zLnNlYXJjaEF0dHJpYnV0ZXMpXG4gICAgICAgICAgOiB1bmRlZmluZWQsXG4gICAgICAgIHdvcmtmbG93UnVuVGltZW91dDogbXNPcHRpb25hbFRvVHMob3B0aW9ucy53b3JrZmxvd1J1blRpbWVvdXQpLFxuICAgICAgICB3b3JrZmxvd1Rhc2tUaW1lb3V0OiBtc09wdGlvbmFsVG9UcyhvcHRpb25zLndvcmtmbG93VGFza1RpbWVvdXQpLFxuICAgICAgICB2ZXJzaW9uaW5nSW50ZW50OiB2ZXJzaW9uaW5nSW50ZW50VG9Qcm90byhvcHRpb25zLnZlcnNpb25pbmdJbnRlbnQpLFxuICAgICAgfSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGZuKHtcbiAgICAgIGFyZ3MsXG4gICAgICBoZWFkZXJzOiB7fSxcbiAgICAgIG9wdGlvbnM6IHJlcXVpcmVkT3B0aW9ucyxcbiAgICB9KTtcbiAgfTtcbn1cblxuLyoqXG4gKiB7QGxpbmsgaHR0cHM6Ly9kb2NzLnRlbXBvcmFsLmlvL2NvbmNlcHRzL3doYXQtaXMtY29udGludWUtYXMtbmV3LyB8IENvbnRpbnVlcy1Bcy1OZXd9IHRoZSBjdXJyZW50IFdvcmtmbG93IEV4ZWN1dGlvblxuICogd2l0aCBkZWZhdWx0IG9wdGlvbnMuXG4gKlxuICogU2hvcnRoYW5kIGZvciBgbWFrZUNvbnRpbnVlQXNOZXdGdW5jPEY+KCkoLi4uYXJncylgLiAoU2VlOiB7QGxpbmsgbWFrZUNvbnRpbnVlQXNOZXdGdW5jfS4pXG4gKlxuICogQGV4YW1wbGVcbiAqXG4gKmBgYHRzXG4gKmltcG9ydCB7IGNvbnRpbnVlQXNOZXcgfSBmcm9tICdAdGVtcG9yYWxpby93b3JrZmxvdyc7XG4gKlxuICpleHBvcnQgYXN5bmMgZnVuY3Rpb24gbXlXb3JrZmxvdyhuOiBudW1iZXIpOiBQcm9taXNlPHZvaWQ+IHtcbiAqICAvLyAuLi4gV29ya2Zsb3cgbG9naWNcbiAqICBhd2FpdCBjb250aW51ZUFzTmV3PHR5cGVvZiBteVdvcmtmbG93PihuICsgMSk7XG4gKn1cbiAqYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb250aW51ZUFzTmV3PEYgZXh0ZW5kcyBXb3JrZmxvdz4oLi4uYXJnczogUGFyYW1ldGVyczxGPik6IFByb21pc2U8bmV2ZXI+IHtcbiAgcmV0dXJuIG1ha2VDb250aW51ZUFzTmV3RnVuYygpKC4uLmFyZ3MpO1xufVxuXG4vKipcbiAqIEdlbmVyYXRlIGFuIFJGQyBjb21wbGlhbnQgVjQgdXVpZC5cbiAqIFVzZXMgdGhlIHdvcmtmbG93J3MgZGV0ZXJtaW5pc3RpYyBQUk5HIG1ha2luZyBpdCBzYWZlIGZvciB1c2Ugd2l0aGluIGEgd29ya2Zsb3cuXG4gKiBUaGlzIGZ1bmN0aW9uIGlzIGNyeXB0b2dyYXBoaWNhbGx5IGluc2VjdXJlLlxuICogU2VlIHRoZSB7QGxpbmsgaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTA1MDM0L2hvdy10by1jcmVhdGUtYS1ndWlkLXV1aWQgfCBzdGFja292ZXJmbG93IGRpc2N1c3Npb259LlxuICovXG5leHBvcnQgZnVuY3Rpb24gdXVpZDQoKTogc3RyaW5nIHtcbiAgLy8gUmV0dXJuIHRoZSBoZXhhZGVjaW1hbCB0ZXh0IHJlcHJlc2VudGF0aW9uIG9mIG51bWJlciBgbmAsIHBhZGRlZCB3aXRoIHplcm9lcyB0byBiZSBvZiBsZW5ndGggYHBgXG4gIGNvbnN0IGhvID0gKG46IG51bWJlciwgcDogbnVtYmVyKSA9PiBuLnRvU3RyaW5nKDE2KS5wYWRTdGFydChwLCAnMCcpO1xuICAvLyBDcmVhdGUgYSB2aWV3IGJhY2tlZCBieSBhIDE2LWJ5dGUgYnVmZmVyXG4gIGNvbnN0IHZpZXcgPSBuZXcgRGF0YVZpZXcobmV3IEFycmF5QnVmZmVyKDE2KSk7XG4gIC8vIEZpbGwgYnVmZmVyIHdpdGggcmFuZG9tIHZhbHVlc1xuICB2aWV3LnNldFVpbnQzMigwLCAoTWF0aC5yYW5kb20oKSAqIDB4MTAwMDAwMDAwKSA+Pj4gMCk7XG4gIHZpZXcuc2V0VWludDMyKDQsIChNYXRoLnJhbmRvbSgpICogMHgxMDAwMDAwMDApID4+PiAwKTtcbiAgdmlldy5zZXRVaW50MzIoOCwgKE1hdGgucmFuZG9tKCkgKiAweDEwMDAwMDAwMCkgPj4+IDApO1xuICB2aWV3LnNldFVpbnQzMigxMiwgKE1hdGgucmFuZG9tKCkgKiAweDEwMDAwMDAwMCkgPj4+IDApO1xuICAvLyBQYXRjaCB0aGUgNnRoIGJ5dGUgdG8gcmVmbGVjdCBhIHZlcnNpb24gNCBVVUlEXG4gIHZpZXcuc2V0VWludDgoNiwgKHZpZXcuZ2V0VWludDgoNikgJiAweGYpIHwgMHg0MCk7XG4gIC8vIFBhdGNoIHRoZSA4dGggYnl0ZSB0byByZWZsZWN0IGEgdmFyaWFudCAxIFVVSUQgKHZlcnNpb24gNCBVVUlEcyBhcmUpXG4gIHZpZXcuc2V0VWludDgoOCwgKHZpZXcuZ2V0VWludDgoOCkgJiAweDNmKSB8IDB4ODApO1xuICAvLyBDb21waWxlIHRoZSBjYW5vbmljYWwgdGV4dHVhbCBmb3JtIGZyb20gdGhlIGFycmF5IGRhdGFcbiAgcmV0dXJuIGAke2hvKHZpZXcuZ2V0VWludDMyKDApLCA4KX0tJHtobyh2aWV3LmdldFVpbnQxNig0KSwgNCl9LSR7aG8odmlldy5nZXRVaW50MTYoNiksIDQpfS0ke2hvKFxuICAgIHZpZXcuZ2V0VWludDE2KDgpLFxuICAgIDRcbiAgKX0tJHtobyh2aWV3LmdldFVpbnQzMigxMCksIDgpfSR7aG8odmlldy5nZXRVaW50MTYoMTQpLCA0KX1gO1xufVxuXG4vKipcbiAqIFBhdGNoIG9yIHVwZ3JhZGUgd29ya2Zsb3cgY29kZSBieSBjaGVja2luZyBvciBzdGF0aW5nIHRoYXQgdGhpcyB3b3JrZmxvdyBoYXMgYSBjZXJ0YWluIHBhdGNoLlxuICpcbiAqIFNlZSB7QGxpbmsgaHR0cHM6Ly9kb2NzLnRlbXBvcmFsLmlvL3R5cGVzY3JpcHQvdmVyc2lvbmluZyB8IGRvY3MgcGFnZX0gZm9yIGluZm8uXG4gKlxuICogSWYgdGhlIHdvcmtmbG93IGlzIHJlcGxheWluZyBhbiBleGlzdGluZyBoaXN0b3J5LCB0aGVuIHRoaXMgZnVuY3Rpb24gcmV0dXJucyB0cnVlIGlmIHRoYXRcbiAqIGhpc3Rvcnkgd2FzIHByb2R1Y2VkIGJ5IGEgd29ya2VyIHdoaWNoIGFsc28gaGFkIGEgYHBhdGNoZWRgIGNhbGwgd2l0aCB0aGUgc2FtZSBgcGF0Y2hJZGAuXG4gKiBJZiB0aGUgaGlzdG9yeSB3YXMgcHJvZHVjZWQgYnkgYSB3b3JrZXIgKndpdGhvdXQqIHN1Y2ggYSBjYWxsLCB0aGVuIGl0IHdpbGwgcmV0dXJuIGZhbHNlLlxuICpcbiAqIElmIHRoZSB3b3JrZmxvdyBpcyBub3QgY3VycmVudGx5IHJlcGxheWluZywgdGhlbiB0aGlzIGNhbGwgKmFsd2F5cyogcmV0dXJucyB0cnVlLlxuICpcbiAqIFlvdXIgd29ya2Zsb3cgY29kZSBzaG91bGQgcnVuIHRoZSBcIm5ld1wiIGNvZGUgaWYgdGhpcyByZXR1cm5zIHRydWUsIGlmIGl0IHJldHVybnMgZmFsc2UsIHlvdVxuICogc2hvdWxkIHJ1biB0aGUgXCJvbGRcIiBjb2RlLiBCeSBkb2luZyB0aGlzLCB5b3UgY2FuIG1haW50YWluIGRldGVybWluaXNtLlxuICpcbiAqIEBwYXJhbSBwYXRjaElkIEFuIGlkZW50aWZpZXIgdGhhdCBzaG91bGQgYmUgdW5pcXVlIHRvIHRoaXMgcGF0Y2guIEl0IGlzIE9LIHRvIHVzZSBtdWx0aXBsZVxuICogY2FsbHMgd2l0aCB0aGUgc2FtZSBJRCwgd2hpY2ggbWVhbnMgYWxsIHN1Y2ggY2FsbHMgd2lsbCBhbHdheXMgcmV0dXJuIHRoZSBzYW1lIHZhbHVlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcGF0Y2hlZChwYXRjaElkOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgY29uc3QgYWN0aXZhdG9yID0gYXNzZXJ0SW5Xb3JrZmxvd0NvbnRleHQoXG4gICAgJ1dvcmtmbG93LnBhdGNoKC4uLikgYW5kIFdvcmtmbG93LmRlcHJlY2F0ZVBhdGNoIG1heSBvbmx5IGJlIHVzZWQgZnJvbSBhIFdvcmtmbG93IEV4ZWN1dGlvbi4nXG4gICk7XG4gIHJldHVybiBhY3RpdmF0b3IucGF0Y2hJbnRlcm5hbChwYXRjaElkLCBmYWxzZSk7XG59XG5cbi8qKlxuICogSW5kaWNhdGUgdGhhdCBhIHBhdGNoIGlzIGJlaW5nIHBoYXNlZCBvdXQuXG4gKlxuICogU2VlIHtAbGluayBodHRwczovL2RvY3MudGVtcG9yYWwuaW8vdHlwZXNjcmlwdC92ZXJzaW9uaW5nIHwgZG9jcyBwYWdlfSBmb3IgaW5mby5cbiAqXG4gKiBXb3JrZmxvd3Mgd2l0aCB0aGlzIGNhbGwgbWF5IGJlIGRlcGxveWVkIGFsb25nc2lkZSB3b3JrZmxvd3Mgd2l0aCBhIHtAbGluayBwYXRjaGVkfSBjYWxsLCBidXRcbiAqIHRoZXkgbXVzdCAqbm90KiBiZSBkZXBsb3llZCB3aGlsZSBhbnkgd29ya2VycyBzdGlsbCBleGlzdCBydW5uaW5nIG9sZCBjb2RlIHdpdGhvdXQgYVxuICoge0BsaW5rIHBhdGNoZWR9IGNhbGwsIG9yIGFueSBydW5zIHdpdGggaGlzdG9yaWVzIHByb2R1Y2VkIGJ5IHN1Y2ggd29ya2VycyBleGlzdC4gSWYgZWl0aGVyIGtpbmRcbiAqIG9mIHdvcmtlciBlbmNvdW50ZXJzIGEgaGlzdG9yeSBwcm9kdWNlZCBieSB0aGUgb3RoZXIsIHRoZWlyIGJlaGF2aW9yIGlzIHVuZGVmaW5lZC5cbiAqXG4gKiBPbmNlIGFsbCBsaXZlIHdvcmtmbG93IHJ1bnMgaGF2ZSBiZWVuIHByb2R1Y2VkIGJ5IHdvcmtlcnMgd2l0aCB0aGlzIGNhbGwsIHlvdSBjYW4gZGVwbG95IHdvcmtlcnNcbiAqIHdoaWNoIGFyZSBmcmVlIG9mIGVpdGhlciBraW5kIG9mIHBhdGNoIGNhbGwgZm9yIHRoaXMgSUQuIFdvcmtlcnMgd2l0aCBhbmQgd2l0aG91dCB0aGlzIGNhbGxcbiAqIG1heSBjb2V4aXN0LCBhcyBsb25nIGFzIHRoZXkgYXJlIGJvdGggcnVubmluZyB0aGUgXCJuZXdcIiBjb2RlLlxuICpcbiAqIEBwYXJhbSBwYXRjaElkIEFuIGlkZW50aWZpZXIgdGhhdCBzaG91bGQgYmUgdW5pcXVlIHRvIHRoaXMgcGF0Y2guIEl0IGlzIE9LIHRvIHVzZSBtdWx0aXBsZVxuICogY2FsbHMgd2l0aCB0aGUgc2FtZSBJRCwgd2hpY2ggbWVhbnMgYWxsIHN1Y2ggY2FsbHMgd2lsbCBhbHdheXMgcmV0dXJuIHRoZSBzYW1lIHZhbHVlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZGVwcmVjYXRlUGF0Y2gocGF0Y2hJZDogc3RyaW5nKTogdm9pZCB7XG4gIGNvbnN0IGFjdGl2YXRvciA9IGFzc2VydEluV29ya2Zsb3dDb250ZXh0KFxuICAgICdXb3JrZmxvdy5wYXRjaCguLi4pIGFuZCBXb3JrZmxvdy5kZXByZWNhdGVQYXRjaCBtYXkgb25seSBiZSB1c2VkIGZyb20gYSBXb3JrZmxvdyBFeGVjdXRpb24uJ1xuICApO1xuICBhY3RpdmF0b3IucGF0Y2hJbnRlcm5hbChwYXRjaElkLCB0cnVlKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGEgUHJvbWlzZSB0aGF0IHJlc29sdmVzIHdoZW4gYGZuYCBldmFsdWF0ZXMgdG8gYHRydWVgIG9yIGB0aW1lb3V0YCBleHBpcmVzLlxuICpcbiAqIEBwYXJhbSB0aW1lb3V0IG51bWJlciBvZiBtaWxsaXNlY29uZHMgb3Ige0BsaW5rIGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL21zIHwgbXMtZm9ybWF0dGVkIHN0cmluZ31cbiAqXG4gKiBAcmV0dXJucyBhIGJvb2xlYW4gaW5kaWNhdGluZyB3aGV0aGVyIHRoZSBjb25kaXRpb24gd2FzIHRydWUgYmVmb3JlIHRoZSB0aW1lb3V0IGV4cGlyZXNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbmRpdGlvbihmbjogKCkgPT4gYm9vbGVhbiwgdGltZW91dDogRHVyYXRpb24pOiBQcm9taXNlPGJvb2xlYW4+O1xuXG4vKipcbiAqIFJldHVybnMgYSBQcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2hlbiBgZm5gIGV2YWx1YXRlcyB0byBgdHJ1ZWAuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb25kaXRpb24oZm46ICgpID0+IGJvb2xlYW4pOiBQcm9taXNlPHZvaWQ+O1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY29uZGl0aW9uKGZuOiAoKSA9PiBib29sZWFuLCB0aW1lb3V0PzogRHVyYXRpb24pOiBQcm9taXNlPHZvaWQgfCBib29sZWFuPiB7XG4gIGFzc2VydEluV29ya2Zsb3dDb250ZXh0KCdXb3JrZmxvdy5jb25kaXRpb24oLi4uKSBtYXkgb25seSBiZSB1c2VkIGZyb20gYSBXb3JrZmxvdyBFeGVjdXRpb24uJyk7XG4gIC8vIFByaW9yIHRvIDEuNS4wLCBgY29uZGl0aW9uKGZuLCAwKWAgd2FzIHRyZWF0ZWQgYXMgZXF1aXZhbGVudCB0byBgY29uZGl0aW9uKGZuLCB1bmRlZmluZWQpYFxuICBpZiAodGltZW91dCA9PT0gMCAmJiAhcGF0Y2hlZChDT05ESVRJT05fMF9QQVRDSCkpIHtcbiAgICByZXR1cm4gY29uZGl0aW9uSW5uZXIoZm4pO1xuICB9XG4gIGlmICh0eXBlb2YgdGltZW91dCA9PT0gJ251bWJlcicgfHwgdHlwZW9mIHRpbWVvdXQgPT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIENhbmNlbGxhdGlvblNjb3BlLmNhbmNlbGxhYmxlKGFzeW5jICgpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBhd2FpdCBQcm9taXNlLnJhY2UoW3NsZWVwKHRpbWVvdXQpLnRoZW4oKCkgPT4gZmFsc2UpLCBjb25kaXRpb25Jbm5lcihmbikudGhlbigoKSA9PiB0cnVlKV0pO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgQ2FuY2VsbGF0aW9uU2NvcGUuY3VycmVudCgpLmNhbmNlbCgpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG4gIHJldHVybiBjb25kaXRpb25Jbm5lcihmbik7XG59XG5cbmZ1bmN0aW9uIGNvbmRpdGlvbklubmVyKGZuOiAoKSA9PiBib29sZWFuKTogUHJvbWlzZTx2b2lkPiB7XG4gIGNvbnN0IGFjdGl2YXRvciA9IGdldEFjdGl2YXRvcigpO1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNvbnN0IHNjb3BlID0gQ2FuY2VsbGF0aW9uU2NvcGUuY3VycmVudCgpO1xuICAgIGlmIChzY29wZS5jb25zaWRlcmVkQ2FuY2VsbGVkKSB7XG4gICAgICB1bnRyYWNrUHJvbWlzZShzY29wZS5jYW5jZWxSZXF1ZXN0ZWQuY2F0Y2gocmVqZWN0KSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qgc2VxID0gYWN0aXZhdG9yLm5leHRTZXFzLmNvbmRpdGlvbisrO1xuICAgIGlmIChzY29wZS5jYW5jZWxsYWJsZSkge1xuICAgICAgdW50cmFja1Byb21pc2UoXG4gICAgICAgIHNjb3BlLmNhbmNlbFJlcXVlc3RlZC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgYWN0aXZhdG9yLmJsb2NrZWRDb25kaXRpb25zLmRlbGV0ZShzZXEpO1xuICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICB9KVxuICAgICAgKTtcbiAgICB9XG5cbiAgICAvLyBFYWdlciBldmFsdWF0aW9uXG4gICAgaWYgKGZuKCkpIHtcbiAgICAgIHJlc29sdmUoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBhY3RpdmF0b3IuYmxvY2tlZENvbmRpdGlvbnMuc2V0KHNlcSwgeyBmbiwgcmVzb2x2ZSB9KTtcbiAgfSk7XG59XG5cbi8qKlxuICogRGVmaW5lIGFuIHVwZGF0ZSBtZXRob2QgZm9yIGEgV29ya2Zsb3cuXG4gKlxuICogQSBkZWZpbml0aW9uIGlzIHVzZWQgdG8gcmVnaXN0ZXIgYSBoYW5kbGVyIGluIHRoZSBXb3JrZmxvdyB2aWEge0BsaW5rIHNldEhhbmRsZXJ9IGFuZCB0byB1cGRhdGUgYSBXb3JrZmxvdyB1c2luZyBhIHtAbGluayBXb3JrZmxvd0hhbmRsZX0sIHtAbGluayBDaGlsZFdvcmtmbG93SGFuZGxlfSBvciB7QGxpbmsgRXh0ZXJuYWxXb3JrZmxvd0hhbmRsZX0uXG4gKiBBIGRlZmluaXRpb24gY2FuIGJlIHJldXNlZCBpbiBtdWx0aXBsZSBXb3JrZmxvd3MuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZWZpbmVVcGRhdGU8UmV0LCBBcmdzIGV4dGVuZHMgYW55W10gPSBbXSwgTmFtZSBleHRlbmRzIHN0cmluZyA9IHN0cmluZz4oXG4gIG5hbWU6IE5hbWVcbik6IFVwZGF0ZURlZmluaXRpb248UmV0LCBBcmdzLCBOYW1lPiB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogJ3VwZGF0ZScsXG4gICAgbmFtZSxcbiAgfSBhcyBVcGRhdGVEZWZpbml0aW9uPFJldCwgQXJncywgTmFtZT47XG59XG5cbi8qKlxuICogRGVmaW5lIGEgc2lnbmFsIG1ldGhvZCBmb3IgYSBXb3JrZmxvdy5cbiAqXG4gKiBBIGRlZmluaXRpb24gaXMgdXNlZCB0byByZWdpc3RlciBhIGhhbmRsZXIgaW4gdGhlIFdvcmtmbG93IHZpYSB7QGxpbmsgc2V0SGFuZGxlcn0gYW5kIHRvIHNpZ25hbCBhIFdvcmtmbG93IHVzaW5nIGEge0BsaW5rIFdvcmtmbG93SGFuZGxlfSwge0BsaW5rIENoaWxkV29ya2Zsb3dIYW5kbGV9IG9yIHtAbGluayBFeHRlcm5hbFdvcmtmbG93SGFuZGxlfS5cbiAqIEEgZGVmaW5pdGlvbiBjYW4gYmUgcmV1c2VkIGluIG11bHRpcGxlIFdvcmtmbG93cy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRlZmluZVNpZ25hbDxBcmdzIGV4dGVuZHMgYW55W10gPSBbXSwgTmFtZSBleHRlbmRzIHN0cmluZyA9IHN0cmluZz4oXG4gIG5hbWU6IE5hbWVcbik6IFNpZ25hbERlZmluaXRpb248QXJncywgTmFtZT4ge1xuICByZXR1cm4ge1xuICAgIHR5cGU6ICdzaWduYWwnLFxuICAgIG5hbWUsXG4gIH0gYXMgU2lnbmFsRGVmaW5pdGlvbjxBcmdzLCBOYW1lPjtcbn1cblxuLyoqXG4gKiBEZWZpbmUgYSBxdWVyeSBtZXRob2QgZm9yIGEgV29ya2Zsb3cuXG4gKlxuICogQSBkZWZpbml0aW9uIGlzIHVzZWQgdG8gcmVnaXN0ZXIgYSBoYW5kbGVyIGluIHRoZSBXb3JrZmxvdyB2aWEge0BsaW5rIHNldEhhbmRsZXJ9IGFuZCB0byBxdWVyeSBhIFdvcmtmbG93IHVzaW5nIGEge0BsaW5rIFdvcmtmbG93SGFuZGxlfS5cbiAqIEEgZGVmaW5pdGlvbiBjYW4gYmUgcmV1c2VkIGluIG11bHRpcGxlIFdvcmtmbG93cy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRlZmluZVF1ZXJ5PFJldCwgQXJncyBleHRlbmRzIGFueVtdID0gW10sIE5hbWUgZXh0ZW5kcyBzdHJpbmcgPSBzdHJpbmc+KFxuICBuYW1lOiBOYW1lXG4pOiBRdWVyeURlZmluaXRpb248UmV0LCBBcmdzLCBOYW1lPiB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogJ3F1ZXJ5JyxcbiAgICBuYW1lLFxuICB9IGFzIFF1ZXJ5RGVmaW5pdGlvbjxSZXQsIEFyZ3MsIE5hbWU+O1xufVxuXG4vKipcbiAqIFNldCBhIGhhbmRsZXIgZnVuY3Rpb24gZm9yIGEgV29ya2Zsb3cgdXBkYXRlLCBzaWduYWwsIG9yIHF1ZXJ5LlxuICpcbiAqIElmIHRoaXMgZnVuY3Rpb24gaXMgY2FsbGVkIG11bHRpcGxlIHRpbWVzIGZvciBhIGdpdmVuIHVwZGF0ZSwgc2lnbmFsLCBvciBxdWVyeSBuYW1lIHRoZSBsYXN0IGhhbmRsZXIgd2lsbCBvdmVyd3JpdGUgYW55IHByZXZpb3VzIGNhbGxzLlxuICpcbiAqIEBwYXJhbSBkZWYgYW4ge0BsaW5rIFVwZGF0ZURlZmluaXRpb259LCB7QGxpbmsgU2lnbmFsRGVmaW5pdGlvbn0sIG9yIHtAbGluayBRdWVyeURlZmluaXRpb259IGFzIHJldHVybmVkIGJ5IHtAbGluayBkZWZpbmVVcGRhdGV9LCB7QGxpbmsgZGVmaW5lU2lnbmFsfSwgb3Ige0BsaW5rIGRlZmluZVF1ZXJ5fSByZXNwZWN0aXZlbHkuXG4gKiBAcGFyYW0gaGFuZGxlciBhIGNvbXBhdGlibGUgaGFuZGxlciBmdW5jdGlvbiBmb3IgdGhlIGdpdmVuIGRlZmluaXRpb24gb3IgYHVuZGVmaW5lZGAgdG8gdW5zZXQgdGhlIGhhbmRsZXIuXG4gKiBAcGFyYW0gb3B0aW9ucyBhbiBvcHRpb25hbCBgZGVzY3JpcHRpb25gIG9mIHRoZSBoYW5kbGVyIGFuZCBhbiBvcHRpb25hbCB1cGRhdGUgYHZhbGlkYXRvcmAgZnVuY3Rpb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXRIYW5kbGVyPFJldCwgQXJncyBleHRlbmRzIGFueVtdLCBUIGV4dGVuZHMgUXVlcnlEZWZpbml0aW9uPFJldCwgQXJncz4+KFxuICBkZWY6IFQsXG4gIGhhbmRsZXI6IEhhbmRsZXI8UmV0LCBBcmdzLCBUPiB8IHVuZGVmaW5lZCxcbiAgb3B0aW9ucz86IFF1ZXJ5SGFuZGxlck9wdGlvbnNcbik6IHZvaWQ7XG5leHBvcnQgZnVuY3Rpb24gc2V0SGFuZGxlcjxSZXQsIEFyZ3MgZXh0ZW5kcyBhbnlbXSwgVCBleHRlbmRzIFNpZ25hbERlZmluaXRpb248QXJncz4+KFxuICBkZWY6IFQsXG4gIGhhbmRsZXI6IEhhbmRsZXI8UmV0LCBBcmdzLCBUPiB8IHVuZGVmaW5lZCxcbiAgb3B0aW9ucz86IFNpZ25hbEhhbmRsZXJPcHRpb25zXG4pOiB2b2lkO1xuZXhwb3J0IGZ1bmN0aW9uIHNldEhhbmRsZXI8UmV0LCBBcmdzIGV4dGVuZHMgYW55W10sIFQgZXh0ZW5kcyBVcGRhdGVEZWZpbml0aW9uPFJldCwgQXJncz4+KFxuICBkZWY6IFQsXG4gIGhhbmRsZXI6IEhhbmRsZXI8UmV0LCBBcmdzLCBUPiB8IHVuZGVmaW5lZCxcbiAgb3B0aW9ucz86IFVwZGF0ZUhhbmRsZXJPcHRpb25zPEFyZ3M+XG4pOiB2b2lkO1xuXG4vLyBGb3IgVXBkYXRlcyBhbmQgU2lnbmFscyB3ZSB3YW50IHRvIG1ha2UgYSBwdWJsaWMgZ3VhcmFudGVlIHNvbWV0aGluZyBsaWtlIHRoZVxuLy8gZm9sbG93aW5nOlxuLy9cbi8vICAgXCJJZiBhIFdGVCBjb250YWlucyBhIFNpZ25hbC9VcGRhdGUsIGFuZCBpZiBhIGhhbmRsZXIgaXMgYXZhaWxhYmxlIGZvciB0aGF0XG4vLyAgIFNpZ25hbC9VcGRhdGUsIHRoZW4gdGhlIGhhbmRsZXIgd2lsbCBiZSBleGVjdXRlZC5cIlwiXG4vL1xuLy8gSG93ZXZlciwgdGhhdCBzdGF0ZW1lbnQgaXMgbm90IHdlbGwtZGVmaW5lZCwgbGVhdmluZyBzZXZlcmFsIHF1ZXN0aW9ucyBvcGVuOlxuLy9cbi8vIDEuIFdoYXQgZG9lcyBpdCBtZWFuIGZvciBhIGhhbmRsZXIgdG8gYmUgXCJhdmFpbGFibGVcIj8gV2hhdCBoYXBwZW5zIGlmIHRoZVxuLy8gICAgaGFuZGxlciBpcyBub3QgcHJlc2VudCBpbml0aWFsbHkgYnV0IGlzIHNldCBhdCBzb21lIHBvaW50IGR1cmluZyB0aGVcbi8vICAgIFdvcmtmbG93IGNvZGUgdGhhdCBpcyBleGVjdXRlZCBpbiB0aGF0IFdGVD8gV2hhdCBoYXBwZW5zIGlmIHRoZSBoYW5kbGVyIGlzXG4vLyAgICBzZXQgYW5kIHRoZW4gZGVsZXRlZCwgb3IgcmVwbGFjZWQgd2l0aCBhIGRpZmZlcmVudCBoYW5kbGVyP1xuLy9cbi8vIDIuIFdoZW4gaXMgdGhlIGhhbmRsZXIgZXhlY3V0ZWQ/IChXaGVuIGl0IGZpcnN0IGJlY29tZXMgYXZhaWxhYmxlPyBBdCB0aGUgZW5kXG4vLyAgICBvZiB0aGUgYWN0aXZhdGlvbj8pIFdoYXQgYXJlIHRoZSBleGVjdXRpb24gc2VtYW50aWNzIG9mIFdvcmtmbG93IGFuZFxuLy8gICAgU2lnbmFsL1VwZGF0ZSBoYW5kbGVyIGNvZGUgZ2l2ZW4gdGhhdCB0aGV5IGFyZSBjb25jdXJyZW50PyBDYW4gdGhlIHVzZXJcbi8vICAgIHJlbHkgb24gU2lnbmFsL1VwZGF0ZSBzaWRlIGVmZmVjdHMgYmVpbmcgcmVmbGVjdGVkIGluIHRoZSBXb3JrZmxvdyByZXR1cm5cbi8vICAgIHZhbHVlLCBvciBpbiB0aGUgdmFsdWUgcGFzc2VkIHRvIENvbnRpbnVlLUFzLU5ldz8gSWYgdGhlIGhhbmRsZXIgaXMgYW5cbi8vICAgIGFzeW5jIGZ1bmN0aW9uIC8gY29yb3V0aW5lLCBob3cgbXVjaCBvZiBpdCBpcyBleGVjdXRlZCBhbmQgd2hlbiBpcyB0aGVcbi8vICAgIHJlc3QgZXhlY3V0ZWQ/XG4vL1xuLy8gMy4gV2hhdCBoYXBwZW5zIGlmIHRoZSBoYW5kbGVyIGlzIG5vdCBleGVjdXRlZD8gKGkuZS4gYmVjYXVzZSBpdCB3YXNuJ3Rcbi8vICAgIGF2YWlsYWJsZSBpbiB0aGUgc2Vuc2UgZGVmaW5lZCBieSAoMSkpXG4vL1xuLy8gNC4gSW4gdGhlIGNhc2Ugb2YgVXBkYXRlLCB3aGVuIGlzIHRoZSB2YWxpZGF0aW9uIGZ1bmN0aW9uIGV4ZWN1dGVkP1xuLy9cbi8vIFRoZSBpbXBsZW1lbnRhdGlvbiBmb3IgVHlwZXNjcmlwdCBpcyBhcyBmb2xsb3dzOlxuLy9cbi8vIDEuIHNkay1jb3JlIHNvcnRzIFNpZ25hbCBhbmQgVXBkYXRlIGpvYnMgKGFuZCBQYXRjaGVzKSBhaGVhZCBvZiBhbGwgb3RoZXJcbi8vICAgIGpvYnMuIFRodXMgaWYgdGhlIGhhbmRsZXIgaXMgYXZhaWxhYmxlIGF0IHRoZSBzdGFydCBvZiB0aGUgQWN0aXZhdGlvbiB0aGVuXG4vLyAgICB0aGUgU2lnbmFsL1VwZGF0ZSB3aWxsIGJlIGV4ZWN1dGVkIGJlZm9yZSBXb3JrZmxvdyBjb2RlIGlzIGV4ZWN1dGVkLiBJZiBpdFxuLy8gICAgaXMgbm90LCB0aGVuIHRoZSBTaWduYWwvVXBkYXRlIGNhbGxzIGFyZSBwdXNoZWQgdG8gYSBidWZmZXIuXG4vL1xuLy8gMi4gT24gZWFjaCBjYWxsIHRvIHNldEhhbmRsZXIgZm9yIGEgZ2l2ZW4gU2lnbmFsL1VwZGF0ZSwgd2UgbWFrZSBhIHBhc3Ncbi8vICAgIHRocm91Z2ggdGhlIGJ1ZmZlciBsaXN0LiBJZiBhIGJ1ZmZlcmVkIGpvYiBpcyBhc3NvY2lhdGVkIHdpdGggdGhlIGp1c3Qtc2V0XG4vLyAgICBoYW5kbGVyLCB0aGVuIHRoZSBqb2IgaXMgcmVtb3ZlZCBmcm9tIHRoZSBidWZmZXIgYW5kIHRoZSBpbml0aWFsXG4vLyAgICBzeW5jaHJvbm91cyBwb3J0aW9uIG9mIHRoZSBoYW5kbGVyIGlzIGludm9rZWQgb24gdGhhdCBpbnB1dCAoaS5lLlxuLy8gICAgcHJlZW1wdGluZyB3b3JrZmxvdyBjb2RlKS5cbi8vXG4vLyBUaHVzIGluIHRoZSBjYXNlIG9mIFR5cGVzY3JpcHQgdGhlIHF1ZXN0aW9ucyBhYm92ZSBhcmUgYW5zd2VyZWQgYXMgZm9sbG93czpcbi8vXG4vLyAxLiBBIGhhbmRsZXIgaXMgXCJhdmFpbGFibGVcIiBpZiBpdCBpcyBzZXQgYXQgdGhlIHN0YXJ0IG9mIHRoZSBBY3RpdmF0aW9uIG9yXG4vLyAgICBiZWNvbWVzIHNldCBhdCBhbnkgcG9pbnQgZHVyaW5nIHRoZSBBY3RpdmF0aW9uLiBJZiB0aGUgaGFuZGxlciBpcyBub3Qgc2V0XG4vLyAgICBpbml0aWFsbHkgdGhlbiBpdCBpcyBleGVjdXRlZCBhcyBzb29uIGFzIGl0IGlzIHNldC4gU3Vic2VxdWVudCBkZWxldGlvbiBvclxuLy8gICAgcmVwbGFjZW1lbnQgYnkgYSBkaWZmZXJlbnQgaGFuZGxlciBoYXMgbm8gaW1wYWN0IGJlY2F1c2UgdGhlIGpvYnMgaXQgd2FzXG4vLyAgICBoYW5kbGluZyBoYXZlIGFscmVhZHkgYmVlbiBoYW5kbGVkIGFuZCBhcmUgbm8gbG9uZ2VyIGluIHRoZSBidWZmZXIuXG4vL1xuLy8gMi4gVGhlIGhhbmRsZXIgaXMgZXhlY3V0ZWQgYXMgc29vbiBhcyBpdCBiZWNvbWVzIGF2YWlsYWJsZS4gSS5lLiBpZiB0aGVcbi8vICAgIGhhbmRsZXIgaXMgc2V0IGF0IHRoZSBzdGFydCBvZiB0aGUgQWN0aXZhdGlvbiB0aGVuIGl0IGlzIGV4ZWN1dGVkIHdoZW5cbi8vICAgIGZpcnN0IGF0dGVtcHRpbmcgdG8gcHJvY2VzcyB0aGUgU2lnbmFsL1VwZGF0ZSBqb2I7IGFsdGVybmF0aXZlbHksIGlmIGl0IGlzXG4vLyAgICBzZXQgYnkgYSBzZXRIYW5kbGVyIGNhbGwgbWFkZSBieSBXb3JrZmxvdyBjb2RlLCB0aGVuIGl0IGlzIGV4ZWN1dGVkIGFzXG4vLyAgICBwYXJ0IG9mIHRoYXQgY2FsbCAocHJlZW1wdGluZyBXb3JrZmxvdyBjb2RlKS4gVGhlcmVmb3JlLCBhIHVzZXIgY2FuIHJlbHlcbi8vICAgIG9uIFNpZ25hbC9VcGRhdGUgc2lkZSBlZmZlY3RzIGJlaW5nIHJlZmxlY3RlZCBpbiBlLmcuIHRoZSBXb3JrZmxvdyByZXR1cm5cbi8vICAgIHZhbHVlLCBhbmQgaW4gdGhlIHZhbHVlIHBhc3NlZCB0byBDb250aW51ZS1Bcy1OZXcuIEFjdGl2YXRpb24gam9icyBhcmVcbi8vICAgIHByb2Nlc3NlZCBpbiB0aGUgb3JkZXIgc3VwcGxpZWQgYnkgc2RrLWNvcmUsIGkuZS4gU2lnbmFscywgdGhlbiBVcGRhdGVzLFxuLy8gICAgdGhlbiBvdGhlciBqb2JzLiBXaXRoaW4gZWFjaCBncm91cCwgdGhlIG9yZGVyIHNlbnQgYnkgdGhlIHNlcnZlciBpc1xuLy8gICAgcHJlc2VydmVkLiBJZiB0aGUgaGFuZGxlciBpcyBhc3luYywgaXQgaXMgZXhlY3V0ZWQgdXAgdG8gaXRzIGZpcnN0IHlpZWxkXG4vLyAgICBwb2ludC5cbi8vXG4vLyAzLiBTaWduYWwgY2FzZTogSWYgYSBoYW5kbGVyIGRvZXMgbm90IGJlY29tZSBhdmFpbGFibGUgZm9yIGEgU2lnbmFsIGpvYiB0aGVuXG4vLyAgICB0aGUgam9iIHJlbWFpbnMgaW4gdGhlIGJ1ZmZlci4gSWYgYSBoYW5kbGVyIGZvciB0aGUgU2lnbmFsIGJlY29tZXNcbi8vICAgIGF2YWlsYWJsZSBpbiBhIHN1YnNlcXVlbnQgQWN0aXZhdGlvbiAob2YgdGhlIHNhbWUgb3IgYSBzdWJzZXF1ZW50IFdGVClcbi8vICAgIHRoZW4gdGhlIGhhbmRsZXIgd2lsbCBiZSBleGVjdXRlZC4gSWYgbm90LCB0aGVuIHRoZSBTaWduYWwgd2lsbCBuZXZlciBiZVxuLy8gICAgcmVzcG9uZGVkIHRvIGFuZCB0aGlzIGNhdXNlcyBubyBlcnJvci5cbi8vXG4vLyAgICBVcGRhdGUgY2FzZTogSWYgYSBoYW5kbGVyIGRvZXMgbm90IGJlY29tZSBhdmFpbGFibGUgZm9yIGFuIFVwZGF0ZSBqb2IgdGhlblxuLy8gICAgdGhlIFVwZGF0ZSBpcyByZWplY3RlZCBhdCB0aGUgZW5kIG9mIHRoZSBBY3RpdmF0aW9uLiBUaHVzLCBpZiBhIHVzZXIgZG9lc1xuLy8gICAgbm90IHdhbnQgYW4gVXBkYXRlIHRvIGJlIHJlamVjdGVkIGZvciB0aGlzIHJlYXNvbiwgdGhlbiBpdCBpcyB0aGVpclxuLy8gICAgcmVzcG9uc2liaWxpdHkgdG8gZW5zdXJlIHRoYXQgdGhlaXIgYXBwbGljYXRpb24gYW5kIHdvcmtmbG93IGNvZGUgaW50ZXJhY3Rcbi8vICAgIHN1Y2ggdGhhdCBhIGhhbmRsZXIgaXMgYXZhaWxhYmxlIGZvciB0aGUgVXBkYXRlIGR1cmluZyBhbnkgQWN0aXZhdGlvblxuLy8gICAgd2hpY2ggbWlnaHQgY29udGFpbiB0aGVpciBVcGRhdGUgam9iLiAoTm90ZSB0aGF0IHRoZSB1c2VyIG9mdGVuIGhhc1xuLy8gICAgdW5jZXJ0YWludHkgYWJvdXQgd2hpY2ggV0ZUIHRoZWlyIFNpZ25hbC9VcGRhdGUgd2lsbCBhcHBlYXIgaW4uIEZvclxuLy8gICAgZXhhbXBsZSwgaWYgdGhleSBjYWxsIHN0YXJ0V29ya2Zsb3coKSBmb2xsb3dlZCBieSBzdGFydFVwZGF0ZSgpLCB0aGVuIHRoZXlcbi8vICAgIHdpbGwgdHlwaWNhbGx5IG5vdCBrbm93IHdoZXRoZXIgdGhlc2Ugd2lsbCBiZSBkZWxpdmVyZWQgaW4gb25lIG9yIHR3b1xuLy8gICAgV0ZUcy4gT24gdGhlIG90aGVyIGhhbmQgdGhlcmUgYXJlIHNpdHVhdGlvbnMgd2hlcmUgdGhleSB3b3VsZCBoYXZlIHJlYXNvblxuLy8gICAgdG8gYmVsaWV2ZSB0aGV5IGFyZSBpbiB0aGUgc2FtZSBXRlQsIGZvciBleGFtcGxlIGlmIHRoZXkgZG8gbm90IHN0YXJ0XG4vLyAgICBXb3JrZXIgcG9sbGluZyB1bnRpbCBhZnRlciB0aGV5IGhhdmUgdmVyaWZpZWQgdGhhdCBib3RoIHJlcXVlc3RzIGhhdmVcbi8vICAgIHN1Y2NlZWRlZC4pXG4vL1xuLy8gNC4gSWYgYW4gVXBkYXRlIGhhcyBhIHZhbGlkYXRpb24gZnVuY3Rpb24gdGhlbiBpdCBpcyBleGVjdXRlZCBpbW1lZGlhdGVseVxuLy8gICAgcHJpb3IgdG8gdGhlIGhhbmRsZXIuIChOb3RlIHRoYXQgdGhlIHZhbGlkYXRpb24gZnVuY3Rpb24gaXMgcmVxdWlyZWQgdG8gYmVcbi8vICAgIHN5bmNocm9ub3VzKS5cbmV4cG9ydCBmdW5jdGlvbiBzZXRIYW5kbGVyPFxuICBSZXQsXG4gIEFyZ3MgZXh0ZW5kcyBhbnlbXSxcbiAgVCBleHRlbmRzIFVwZGF0ZURlZmluaXRpb248UmV0LCBBcmdzPiB8IFNpZ25hbERlZmluaXRpb248QXJncz4gfCBRdWVyeURlZmluaXRpb248UmV0LCBBcmdzPixcbj4oXG4gIGRlZjogVCxcbiAgaGFuZGxlcjogSGFuZGxlcjxSZXQsIEFyZ3MsIFQ+IHwgdW5kZWZpbmVkLFxuICBvcHRpb25zPzogUXVlcnlIYW5kbGVyT3B0aW9ucyB8IFNpZ25hbEhhbmRsZXJPcHRpb25zIHwgVXBkYXRlSGFuZGxlck9wdGlvbnM8QXJncz5cbik6IHZvaWQge1xuICBjb25zdCBhY3RpdmF0b3IgPSBhc3NlcnRJbldvcmtmbG93Q29udGV4dCgnV29ya2Zsb3cuc2V0SGFuZGxlciguLi4pIG1heSBvbmx5IGJlIHVzZWQgZnJvbSBhIFdvcmtmbG93IEV4ZWN1dGlvbi4nKTtcbiAgY29uc3QgZGVzY3JpcHRpb24gPSBvcHRpb25zPy5kZXNjcmlwdGlvbjtcbiAgaWYgKGRlZi50eXBlID09PSAndXBkYXRlJykge1xuICAgIGlmICh0eXBlb2YgaGFuZGxlciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgY29uc3QgdXBkYXRlT3B0aW9ucyA9IG9wdGlvbnMgYXMgVXBkYXRlSGFuZGxlck9wdGlvbnM8QXJncz4gfCB1bmRlZmluZWQ7XG5cbiAgICAgIGNvbnN0IHZhbGlkYXRvciA9IHVwZGF0ZU9wdGlvbnM/LnZhbGlkYXRvciBhcyBXb3JrZmxvd1VwZGF0ZVZhbGlkYXRvclR5cGUgfCB1bmRlZmluZWQ7XG4gICAgICBjb25zdCB1bmZpbmlzaGVkUG9saWN5ID0gdXBkYXRlT3B0aW9ucz8udW5maW5pc2hlZFBvbGljeSA/PyBIYW5kbGVyVW5maW5pc2hlZFBvbGljeS5XQVJOX0FORF9BQkFORE9OO1xuICAgICAgYWN0aXZhdG9yLnVwZGF0ZUhhbmRsZXJzLnNldChkZWYubmFtZSwgeyBoYW5kbGVyLCB2YWxpZGF0b3IsIGRlc2NyaXB0aW9uLCB1bmZpbmlzaGVkUG9saWN5IH0pO1xuICAgICAgYWN0aXZhdG9yLmRpc3BhdGNoQnVmZmVyZWRVcGRhdGVzKCk7XG4gICAgfSBlbHNlIGlmIChoYW5kbGVyID09IG51bGwpIHtcbiAgICAgIGFjdGl2YXRvci51cGRhdGVIYW5kbGVycy5kZWxldGUoZGVmLm5hbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBFeHBlY3RlZCBoYW5kbGVyIHRvIGJlIGVpdGhlciBhIGZ1bmN0aW9uIG9yICd1bmRlZmluZWQnLiBHb3Q6ICcke3R5cGVvZiBoYW5kbGVyfSdgKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoZGVmLnR5cGUgPT09ICdzaWduYWwnKSB7XG4gICAgaWYgKHR5cGVvZiBoYW5kbGVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBjb25zdCBzaWduYWxPcHRpb25zID0gb3B0aW9ucyBhcyBTaWduYWxIYW5kbGVyT3B0aW9ucyB8IHVuZGVmaW5lZDtcbiAgICAgIGNvbnN0IHVuZmluaXNoZWRQb2xpY3kgPSBzaWduYWxPcHRpb25zPy51bmZpbmlzaGVkUG9saWN5ID8/IEhhbmRsZXJVbmZpbmlzaGVkUG9saWN5LldBUk5fQU5EX0FCQU5ET047XG4gICAgICBhY3RpdmF0b3Iuc2lnbmFsSGFuZGxlcnMuc2V0KGRlZi5uYW1lLCB7IGhhbmRsZXI6IGhhbmRsZXIgYXMgYW55LCBkZXNjcmlwdGlvbiwgdW5maW5pc2hlZFBvbGljeSB9KTtcbiAgICAgIGFjdGl2YXRvci5kaXNwYXRjaEJ1ZmZlcmVkU2lnbmFscygpO1xuICAgIH0gZWxzZSBpZiAoaGFuZGxlciA9PSBudWxsKSB7XG4gICAgICBhY3RpdmF0b3Iuc2lnbmFsSGFuZGxlcnMuZGVsZXRlKGRlZi5uYW1lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgRXhwZWN0ZWQgaGFuZGxlciB0byBiZSBlaXRoZXIgYSBmdW5jdGlvbiBvciAndW5kZWZpbmVkJy4gR290OiAnJHt0eXBlb2YgaGFuZGxlcn0nYCk7XG4gICAgfVxuICB9IGVsc2UgaWYgKGRlZi50eXBlID09PSAncXVlcnknKSB7XG4gICAgaWYgKHR5cGVvZiBoYW5kbGVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBhY3RpdmF0b3IucXVlcnlIYW5kbGVycy5zZXQoZGVmLm5hbWUsIHsgaGFuZGxlcjogaGFuZGxlciBhcyBhbnksIGRlc2NyaXB0aW9uIH0pO1xuICAgIH0gZWxzZSBpZiAoaGFuZGxlciA9PSBudWxsKSB7XG4gICAgICBhY3RpdmF0b3IucXVlcnlIYW5kbGVycy5kZWxldGUoZGVmLm5hbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBFeHBlY3RlZCBoYW5kbGVyIHRvIGJlIGVpdGhlciBhIGZ1bmN0aW9uIG9yICd1bmRlZmluZWQnLiBHb3Q6ICcke3R5cGVvZiBoYW5kbGVyfSdgKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgSW52YWxpZCBkZWZpbml0aW9uIHR5cGU6ICR7KGRlZiBhcyBhbnkpLnR5cGV9YCk7XG4gIH1cbn1cblxuLyoqXG4gKiBTZXQgYSBzaWduYWwgaGFuZGxlciBmdW5jdGlvbiB0aGF0IHdpbGwgaGFuZGxlIHNpZ25hbHMgY2FsbHMgZm9yIG5vbi1yZWdpc3RlcmVkIHNpZ25hbCBuYW1lcy5cbiAqXG4gKiBTaWduYWxzIGFyZSBkaXNwYXRjaGVkIHRvIHRoZSBkZWZhdWx0IHNpZ25hbCBoYW5kbGVyIGluIHRoZSBvcmRlciB0aGF0IHRoZXkgd2VyZSBhY2NlcHRlZCBieSB0aGUgc2VydmVyLlxuICpcbiAqIElmIHRoaXMgZnVuY3Rpb24gaXMgY2FsbGVkIG11bHRpcGxlIHRpbWVzIGZvciBhIGdpdmVuIHNpZ25hbCBvciBxdWVyeSBuYW1lIHRoZSBsYXN0IGhhbmRsZXIgd2lsbCBvdmVyd3JpdGUgYW55IHByZXZpb3VzIGNhbGxzLlxuICpcbiAqIEBwYXJhbSBoYW5kbGVyIGEgZnVuY3Rpb24gdGhhdCB3aWxsIGhhbmRsZSBzaWduYWxzIGZvciBub24tcmVnaXN0ZXJlZCBzaWduYWwgbmFtZXMsIG9yIGB1bmRlZmluZWRgIHRvIHVuc2V0IHRoZSBoYW5kbGVyLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0RGVmYXVsdFNpZ25hbEhhbmRsZXIoaGFuZGxlcjogRGVmYXVsdFNpZ25hbEhhbmRsZXIgfCB1bmRlZmluZWQpOiB2b2lkIHtcbiAgY29uc3QgYWN0aXZhdG9yID0gYXNzZXJ0SW5Xb3JrZmxvd0NvbnRleHQoXG4gICAgJ1dvcmtmbG93LnNldERlZmF1bHRTaWduYWxIYW5kbGVyKC4uLikgbWF5IG9ubHkgYmUgdXNlZCBmcm9tIGEgV29ya2Zsb3cgRXhlY3V0aW9uLidcbiAgKTtcbiAgaWYgKHR5cGVvZiBoYW5kbGVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgYWN0aXZhdG9yLmRlZmF1bHRTaWduYWxIYW5kbGVyID0gaGFuZGxlcjtcbiAgICBhY3RpdmF0b3IuZGlzcGF0Y2hCdWZmZXJlZFNpZ25hbHMoKTtcbiAgfSBlbHNlIGlmIChoYW5kbGVyID09IG51bGwpIHtcbiAgICBhY3RpdmF0b3IuZGVmYXVsdFNpZ25hbEhhbmRsZXIgPSB1bmRlZmluZWQ7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgRXhwZWN0ZWQgaGFuZGxlciB0byBiZSBlaXRoZXIgYSBmdW5jdGlvbiBvciAndW5kZWZpbmVkJy4gR290OiAnJHt0eXBlb2YgaGFuZGxlcn0nYCk7XG4gIH1cbn1cblxuLyoqXG4gKiBVcGRhdGVzIHRoaXMgV29ya2Zsb3cncyBTZWFyY2ggQXR0cmlidXRlcyBieSBtZXJnaW5nIHRoZSBwcm92aWRlZCBgc2VhcmNoQXR0cmlidXRlc2Agd2l0aCB0aGUgZXhpc3RpbmcgU2VhcmNoXG4gKiBBdHRyaWJ1dGVzLCBgd29ya2Zsb3dJbmZvKCkuc2VhcmNoQXR0cmlidXRlc2AuXG4gKlxuICogRm9yIGV4YW1wbGUsIHRoaXMgV29ya2Zsb3cgY29kZTpcbiAqXG4gKiBgYGB0c1xuICogdXBzZXJ0U2VhcmNoQXR0cmlidXRlcyh7XG4gKiAgIEN1c3RvbUludEZpZWxkOiBbMV0sXG4gKiAgIEN1c3RvbUJvb2xGaWVsZDogW3RydWVdXG4gKiB9KTtcbiAqIHVwc2VydFNlYXJjaEF0dHJpYnV0ZXMoe1xuICogICBDdXN0b21JbnRGaWVsZDogWzQyXSxcbiAqICAgQ3VzdG9tS2V5d29yZEZpZWxkOiBbJ2R1cmFibGUgY29kZScsICdpcyBncmVhdCddXG4gKiB9KTtcbiAqIGBgYFxuICpcbiAqIHdvdWxkIHJlc3VsdCBpbiB0aGUgV29ya2Zsb3cgaGF2aW5nIHRoZXNlIFNlYXJjaCBBdHRyaWJ1dGVzOlxuICpcbiAqIGBgYHRzXG4gKiB7XG4gKiAgIEN1c3RvbUludEZpZWxkOiBbNDJdLFxuICogICBDdXN0b21Cb29sRmllbGQ6IFt0cnVlXSxcbiAqICAgQ3VzdG9tS2V5d29yZEZpZWxkOiBbJ2R1cmFibGUgY29kZScsICdpcyBncmVhdCddXG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gc2VhcmNoQXR0cmlidXRlcyBUaGUgUmVjb3JkIHRvIG1lcmdlLiBVc2UgYSB2YWx1ZSBvZiBgW11gIHRvIGNsZWFyIGEgU2VhcmNoIEF0dHJpYnV0ZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVwc2VydFNlYXJjaEF0dHJpYnV0ZXMoc2VhcmNoQXR0cmlidXRlczogU2VhcmNoQXR0cmlidXRlcyk6IHZvaWQge1xuICBjb25zdCBhY3RpdmF0b3IgPSBhc3NlcnRJbldvcmtmbG93Q29udGV4dChcbiAgICAnV29ya2Zsb3cudXBzZXJ0U2VhcmNoQXR0cmlidXRlcyguLi4pIG1heSBvbmx5IGJlIHVzZWQgZnJvbSBhIFdvcmtmbG93IEV4ZWN1dGlvbi4nXG4gICk7XG5cbiAgaWYgKHNlYXJjaEF0dHJpYnV0ZXMgPT0gbnVsbCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2VhcmNoQXR0cmlidXRlcyBtdXN0IGJlIGEgbm9uLW51bGwgU2VhcmNoQXR0cmlidXRlcycpO1xuICB9XG5cbiAgYWN0aXZhdG9yLnB1c2hDb21tYW5kKHtcbiAgICB1cHNlcnRXb3JrZmxvd1NlYXJjaEF0dHJpYnV0ZXM6IHtcbiAgICAgIHNlYXJjaEF0dHJpYnV0ZXM6IG1hcFRvUGF5bG9hZHMoc2VhcmNoQXR0cmlidXRlUGF5bG9hZENvbnZlcnRlciwgc2VhcmNoQXR0cmlidXRlcyksXG4gICAgfSxcbiAgfSk7XG5cbiAgYWN0aXZhdG9yLm11dGF0ZVdvcmtmbG93SW5mbygoaW5mbzogV29ya2Zsb3dJbmZvKTogV29ya2Zsb3dJbmZvID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgLi4uaW5mbyxcbiAgICAgIHNlYXJjaEF0dHJpYnV0ZXM6IHtcbiAgICAgICAgLi4uaW5mby5zZWFyY2hBdHRyaWJ1dGVzLFxuICAgICAgICAuLi5zZWFyY2hBdHRyaWJ1dGVzLFxuICAgICAgfSxcbiAgICB9O1xuICB9KTtcbn1cblxuLyoqXG4gKiBVcGRhdGVzIHRoaXMgV29ya2Zsb3cncyBNZW1vcyBieSBtZXJnaW5nIHRoZSBwcm92aWRlZCBgbWVtb2Agd2l0aCBleGlzdGluZ1xuICogTWVtb3MgKGFzIHJldHVybmVkIGJ5IGB3b3JrZmxvd0luZm8oKS5tZW1vYCkuXG4gKlxuICogTmV3IG1lbW8gaXMgbWVyZ2VkIGJ5IHJlcGxhY2luZyBwcm9wZXJ0aWVzIG9mIHRoZSBzYW1lIG5hbWUgX2F0IHRoZSBmaXJzdFxuICogbGV2ZWwgb25seV8uIFNldHRpbmcgYSBwcm9wZXJ0eSB0byB2YWx1ZSBgdW5kZWZpbmVkYCBvciBgbnVsbGAgY2xlYXJzIHRoYXRcbiAqIGtleSBmcm9tIHRoZSBNZW1vLlxuICpcbiAqIEZvciBleGFtcGxlOlxuICpcbiAqIGBgYHRzXG4gKiB1cHNlcnRNZW1vKHtcbiAqICAga2V5MTogdmFsdWUsXG4gKiAgIGtleTM6IHsgc3Via2V5MTogdmFsdWUgfVxuICogICBrZXk0OiB2YWx1ZSxcbiAqIH0pO1xuICogdXBzZXJ0TWVtbyh7XG4gKiAgIGtleTI6IHZhbHVlXG4gKiAgIGtleTM6IHsgc3Via2V5MjogdmFsdWUgfVxuICogICBrZXk0OiB1bmRlZmluZWQsXG4gKiB9KTtcbiAqIGBgYFxuICpcbiAqIHdvdWxkIHJlc3VsdCBpbiB0aGUgV29ya2Zsb3cgaGF2aW5nIHRoZXNlIE1lbW86XG4gKlxuICogYGBgdHNcbiAqIHtcbiAqICAga2V5MTogdmFsdWUsXG4gKiAgIGtleTI6IHZhbHVlLFxuICogICBrZXkzOiB7IHN1YmtleTI6IHZhbHVlIH0gIC8vIE5vdGUgdGhpcyBvYmplY3Qgd2FzIGNvbXBsZXRlbHkgcmVwbGFjZWRcbiAqICAgLy8gTm90ZSB0aGF0IGtleTQgd2FzIGNvbXBsZXRlbHkgcmVtb3ZlZFxuICogfVxuICogYGBgXG4gKlxuICogQHBhcmFtIG1lbW8gVGhlIFJlY29yZCB0byBtZXJnZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVwc2VydE1lbW8obWVtbzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pOiB2b2lkIHtcbiAgY29uc3QgYWN0aXZhdG9yID0gYXNzZXJ0SW5Xb3JrZmxvd0NvbnRleHQoJ1dvcmtmbG93LnVwc2VydE1lbW8oLi4uKSBtYXkgb25seSBiZSB1c2VkIGZyb20gYSBXb3JrZmxvdyBFeGVjdXRpb24uJyk7XG5cbiAgaWYgKG1lbW8gPT0gbnVsbCkge1xuICAgIHRocm93IG5ldyBFcnJvcignbWVtbyBtdXN0IGJlIGEgbm9uLW51bGwgUmVjb3JkJyk7XG4gIH1cblxuICBhY3RpdmF0b3IucHVzaENvbW1hbmQoe1xuICAgIG1vZGlmeVdvcmtmbG93UHJvcGVydGllczoge1xuICAgICAgdXBzZXJ0ZWRNZW1vOiB7XG4gICAgICAgIGZpZWxkczogbWFwVG9QYXlsb2FkcyhcbiAgICAgICAgICBhY3RpdmF0b3IucGF5bG9hZENvbnZlcnRlcixcbiAgICAgICAgICAvLyBDb252ZXJ0IG51bGwgdG8gdW5kZWZpbmVkXG4gICAgICAgICAgT2JqZWN0LmZyb21FbnRyaWVzKE9iamVjdC5lbnRyaWVzKG1lbW8pLm1hcCgoW2ssIHZdKSA9PiBbaywgdiA/PyB1bmRlZmluZWRdKSlcbiAgICAgICAgKSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSk7XG5cbiAgYWN0aXZhdG9yLm11dGF0ZVdvcmtmbG93SW5mbygoaW5mbzogV29ya2Zsb3dJbmZvKTogV29ya2Zsb3dJbmZvID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgLi4uaW5mbyxcbiAgICAgIG1lbW86IE9iamVjdC5mcm9tRW50cmllcyhcbiAgICAgICAgT2JqZWN0LmVudHJpZXMoe1xuICAgICAgICAgIC4uLmluZm8ubWVtbyxcbiAgICAgICAgICAuLi5tZW1vLFxuICAgICAgICB9KS5maWx0ZXIoKFtfLCB2XSkgPT4gdiAhPSBudWxsKVxuICAgICAgKSxcbiAgICB9O1xuICB9KTtcbn1cblxuLyoqXG4gKiBXaGV0aGVyIHVwZGF0ZSBhbmQgc2lnbmFsIGhhbmRsZXJzIGhhdmUgZmluaXNoZWQgZXhlY3V0aW5nLlxuICpcbiAqIENvbnNpZGVyIHdhaXRpbmcgb24gdGhpcyBjb25kaXRpb24gYmVmb3JlIHdvcmtmbG93IHJldHVybiBvciBjb250aW51ZS1hcy1uZXcsIHRvIHByZXZlbnRcbiAqIGludGVycnVwdGlvbiBvZiBpbi1wcm9ncmVzcyBoYW5kbGVycyBieSB3b3JrZmxvdyBleGl0OlxuICpcbiAqIGBgYHRzXG4gKiBhd2FpdCB3b3JrZmxvdy5jb25kaXRpb24od29ya2Zsb3cuYWxsSGFuZGxlcnNGaW5pc2hlZClcbiAqIGBgYFxuICpcbiAqIEByZXR1cm5zIHRydWUgaWYgdGhlcmUgYXJlIG5vIGluLXByb2dyZXNzIHVwZGF0ZSBvciBzaWduYWwgaGFuZGxlciBleGVjdXRpb25zLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYWxsSGFuZGxlcnNGaW5pc2hlZCgpOiBib29sZWFuIHtcbiAgY29uc3QgYWN0aXZhdG9yID0gYXNzZXJ0SW5Xb3JrZmxvd0NvbnRleHQoJ2FsbEhhbmRsZXJzRmluaXNoZWQoKSBtYXkgb25seSBiZSB1c2VkIGZyb20gYSBXb3JrZmxvdyBFeGVjdXRpb24uJyk7XG4gIHJldHVybiBhY3RpdmF0b3IuaW5Qcm9ncmVzc1NpZ25hbHMuc2l6ZSA9PT0gMCAmJiBhY3RpdmF0b3IuaW5Qcm9ncmVzc1VwZGF0ZXMuc2l6ZSA9PT0gMDtcbn1cblxuZXhwb3J0IGNvbnN0IHN0YWNrVHJhY2VRdWVyeSA9IGRlZmluZVF1ZXJ5PHN0cmluZz4oJ19fc3RhY2tfdHJhY2UnKTtcbmV4cG9ydCBjb25zdCBlbmhhbmNlZFN0YWNrVHJhY2VRdWVyeSA9IGRlZmluZVF1ZXJ5PEVuaGFuY2VkU3RhY2tUcmFjZT4oJ19fZW5oYW5jZWRfc3RhY2tfdHJhY2UnKTtcbmV4cG9ydCBjb25zdCB3b3JrZmxvd01ldGFkYXRhUXVlcnkgPSBkZWZpbmVRdWVyeTx0ZW1wb3JhbC5hcGkuc2RrLnYxLklXb3JrZmxvd01ldGFkYXRhPignX190ZW1wb3JhbF93b3JrZmxvd19tZXRhZGF0YScpO1xuIiwiaW1wb3J0ICogYXMgYWN0aXZpdGllcyBmcm9tICcuL2FjdGl2aXRpZXMnO1xuaW1wb3J0IHsgcHJveHlBY3Rpdml0aWVzIH0gZnJvbSAnQHRlbXBvcmFsaW8vd29ya2Zsb3cnO1xuaW1wb3J0IHR5cGUgeyBUcmFuc2FjdGlvbklucHV0IH0gZnJvbSAnLi9saWIvdHlwZXMnO1xuXG5jb25zdCB7IGNoYXJnZUNhcmQsIHJlc2VydmVTdG9jaywgc2hpcEl0ZW0sIHNlbmRSZWNlaXB0LCBzZW5kQ2hhcmdlRmFpbHVyZUVtYWlsIH0gPSBwcm94eUFjdGl2aXRpZXM8dHlwZW9mIGFjdGl2aXRpZXM+KHtcbiAgc3RhcnRUb0Nsb3NlVGltZW91dDogJzUgc2Vjb25kcycsXG4gIHJldHJ5OiB7IG1heGltdW1BdHRlbXB0czogMSB9LCAvLyBObyByZXRyaWVzIC0gZmFpbCBpbW1lZGlhdGVseVxufSk7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBQdXJjaGFzZVdvcmtmbG93KGlucHV0OiBUcmFuc2FjdGlvbklucHV0KSB7XG4gIGNvbnN0IHsgY3VzdG9tZXJFbWFpbCwgcHJvZHVjdE5hbWUsIGFtb3VudCwgc2hpcHBpbmdBZGRyZXNzIH0gPSBpbnB1dDtcblxuICAvLyBDaGFyZ2UgdGhlIGN1c3RvbWVyJ3MgY2FyZFxuICB0cnkge1xuICAgIGF3YWl0IGNoYXJnZUNhcmQoY3VzdG9tZXJFbWFpbCwgYW1vdW50KTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBhd2FpdCBzZW5kQ2hhcmdlRmFpbHVyZUVtYWlsKGN1c3RvbWVyRW1haWwsIGFtb3VudCk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gUmVzZXJ2ZSB0aGUgaXRlbSBpbiBpbnZlbnRvcnlcbiAgYXdhaXQgcmVzZXJ2ZVN0b2NrKHByb2R1Y3ROYW1lKTtcblxuICAvLyBTaGlwIHRoZSBpdGVtXG4gIGF3YWl0IHNoaXBJdGVtKGN1c3RvbWVyRW1haWwsIHByb2R1Y3ROYW1lLCBzaGlwcGluZ0FkZHJlc3MpO1xuXG4gIC8vIFNlbmQgcmVjZWlwdCBjb25maXJtYXRpb25cbiAgYXdhaXQgc2VuZFJlY2VpcHQoY3VzdG9tZXJFbWFpbCwgcHJvZHVjdE5hbWUsIGFtb3VudCk7XG59ICIsIi8qIChpZ25vcmVkKSAqLyIsIi8qIChpZ25vcmVkKSAqLyIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuLy8gSGVscGVycy5cbmNvbnN0IHMgPSAxMDAwO1xuY29uc3QgbSA9IHMgKiA2MDtcbmNvbnN0IGggPSBtICogNjA7XG5jb25zdCBkID0gaCAqIDI0O1xuY29uc3QgdyA9IGQgKiA3O1xuY29uc3QgeSA9IGQgKiAzNjUuMjU7XG5mdW5jdGlvbiBtcyh2YWx1ZSwgb3B0aW9ucykge1xuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmIHZhbHVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHJldHVybiBwYXJzZSh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyAmJiBpc0Zpbml0ZSh2YWx1ZSkpIHtcbiAgICAgICAgICAgIHJldHVybiBvcHRpb25zPy5sb25nID8gZm10TG9uZyh2YWx1ZSkgOiBmbXRTaG9ydCh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdWYWx1ZSBpcyBub3QgYSBzdHJpbmcgb3IgbnVtYmVyLicpO1xuICAgIH1cbiAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGlzRXJyb3IoZXJyb3IpXG4gICAgICAgICAgICA/IGAke2Vycm9yLm1lc3NhZ2V9LiB2YWx1ZT0ke0pTT04uc3RyaW5naWZ5KHZhbHVlKX1gXG4gICAgICAgICAgICA6ICdBbiB1bmtub3duIGVycm9yIGhhcyBvY2N1cmVkLic7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihtZXNzYWdlKTtcbiAgICB9XG59XG4vKipcbiAqIFBhcnNlIHRoZSBnaXZlbiBgc3RyYCBhbmQgcmV0dXJuIG1pbGxpc2Vjb25kcy5cbiAqL1xuZnVuY3Rpb24gcGFyc2Uoc3RyKSB7XG4gICAgc3RyID0gU3RyaW5nKHN0cik7XG4gICAgaWYgKHN0ci5sZW5ndGggPiAxMDApIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdWYWx1ZSBleGNlZWRzIHRoZSBtYXhpbXVtIGxlbmd0aCBvZiAxMDAgY2hhcmFjdGVycy4nKTtcbiAgICB9XG4gICAgY29uc3QgbWF0Y2ggPSAvXigtPyg/OlxcZCspP1xcLj9cXGQrKSAqKG1pbGxpc2Vjb25kcz98bXNlY3M/fG1zfHNlY29uZHM/fHNlY3M/fHN8bWludXRlcz98bWlucz98bXxob3Vycz98aHJzP3xofGRheXM/fGR8d2Vla3M/fHd8eWVhcnM/fHlycz98eSk/JC9pLmV4ZWMoc3RyKTtcbiAgICBpZiAoIW1hdGNoKSB7XG4gICAgICAgIHJldHVybiBOYU47XG4gICAgfVxuICAgIGNvbnN0IG4gPSBwYXJzZUZsb2F0KG1hdGNoWzFdKTtcbiAgICBjb25zdCB0eXBlID0gKG1hdGNoWzJdIHx8ICdtcycpLnRvTG93ZXJDYXNlKCk7XG4gICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgIGNhc2UgJ3llYXJzJzpcbiAgICAgICAgY2FzZSAneWVhcic6XG4gICAgICAgIGNhc2UgJ3lycyc6XG4gICAgICAgIGNhc2UgJ3lyJzpcbiAgICAgICAgY2FzZSAneSc6XG4gICAgICAgICAgICByZXR1cm4gbiAqIHk7XG4gICAgICAgIGNhc2UgJ3dlZWtzJzpcbiAgICAgICAgY2FzZSAnd2Vlayc6XG4gICAgICAgIGNhc2UgJ3cnOlxuICAgICAgICAgICAgcmV0dXJuIG4gKiB3O1xuICAgICAgICBjYXNlICdkYXlzJzpcbiAgICAgICAgY2FzZSAnZGF5JzpcbiAgICAgICAgY2FzZSAnZCc6XG4gICAgICAgICAgICByZXR1cm4gbiAqIGQ7XG4gICAgICAgIGNhc2UgJ2hvdXJzJzpcbiAgICAgICAgY2FzZSAnaG91cic6XG4gICAgICAgIGNhc2UgJ2hycyc6XG4gICAgICAgIGNhc2UgJ2hyJzpcbiAgICAgICAgY2FzZSAnaCc6XG4gICAgICAgICAgICByZXR1cm4gbiAqIGg7XG4gICAgICAgIGNhc2UgJ21pbnV0ZXMnOlxuICAgICAgICBjYXNlICdtaW51dGUnOlxuICAgICAgICBjYXNlICdtaW5zJzpcbiAgICAgICAgY2FzZSAnbWluJzpcbiAgICAgICAgY2FzZSAnbSc6XG4gICAgICAgICAgICByZXR1cm4gbiAqIG07XG4gICAgICAgIGNhc2UgJ3NlY29uZHMnOlxuICAgICAgICBjYXNlICdzZWNvbmQnOlxuICAgICAgICBjYXNlICdzZWNzJzpcbiAgICAgICAgY2FzZSAnc2VjJzpcbiAgICAgICAgY2FzZSAncyc6XG4gICAgICAgICAgICByZXR1cm4gbiAqIHM7XG4gICAgICAgIGNhc2UgJ21pbGxpc2Vjb25kcyc6XG4gICAgICAgIGNhc2UgJ21pbGxpc2Vjb25kJzpcbiAgICAgICAgY2FzZSAnbXNlY3MnOlxuICAgICAgICBjYXNlICdtc2VjJzpcbiAgICAgICAgY2FzZSAnbXMnOlxuICAgICAgICAgICAgcmV0dXJuIG47XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAvLyBUaGlzIHNob3VsZCBuZXZlciBvY2N1ci5cbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVGhlIHVuaXQgJHt0eXBlfSB3YXMgbWF0Y2hlZCwgYnV0IG5vIG1hdGNoaW5nIGNhc2UgZXhpc3RzLmApO1xuICAgIH1cbn1cbmV4cG9ydHMuZGVmYXVsdCA9IG1zO1xuLyoqXG4gKiBTaG9ydCBmb3JtYXQgZm9yIGBtc2AuXG4gKi9cbmZ1bmN0aW9uIGZtdFNob3J0KG1zKSB7XG4gICAgY29uc3QgbXNBYnMgPSBNYXRoLmFicyhtcyk7XG4gICAgaWYgKG1zQWJzID49IGQpIHtcbiAgICAgICAgcmV0dXJuIGAke01hdGgucm91bmQobXMgLyBkKX1kYDtcbiAgICB9XG4gICAgaWYgKG1zQWJzID49IGgpIHtcbiAgICAgICAgcmV0dXJuIGAke01hdGgucm91bmQobXMgLyBoKX1oYDtcbiAgICB9XG4gICAgaWYgKG1zQWJzID49IG0pIHtcbiAgICAgICAgcmV0dXJuIGAke01hdGgucm91bmQobXMgLyBtKX1tYDtcbiAgICB9XG4gICAgaWYgKG1zQWJzID49IHMpIHtcbiAgICAgICAgcmV0dXJuIGAke01hdGgucm91bmQobXMgLyBzKX1zYDtcbiAgICB9XG4gICAgcmV0dXJuIGAke21zfW1zYDtcbn1cbi8qKlxuICogTG9uZyBmb3JtYXQgZm9yIGBtc2AuXG4gKi9cbmZ1bmN0aW9uIGZtdExvbmcobXMpIHtcbiAgICBjb25zdCBtc0FicyA9IE1hdGguYWJzKG1zKTtcbiAgICBpZiAobXNBYnMgPj0gZCkge1xuICAgICAgICByZXR1cm4gcGx1cmFsKG1zLCBtc0FicywgZCwgJ2RheScpO1xuICAgIH1cbiAgICBpZiAobXNBYnMgPj0gaCkge1xuICAgICAgICByZXR1cm4gcGx1cmFsKG1zLCBtc0FicywgaCwgJ2hvdXInKTtcbiAgICB9XG4gICAgaWYgKG1zQWJzID49IG0pIHtcbiAgICAgICAgcmV0dXJuIHBsdXJhbChtcywgbXNBYnMsIG0sICdtaW51dGUnKTtcbiAgICB9XG4gICAgaWYgKG1zQWJzID49IHMpIHtcbiAgICAgICAgcmV0dXJuIHBsdXJhbChtcywgbXNBYnMsIHMsICdzZWNvbmQnKTtcbiAgICB9XG4gICAgcmV0dXJuIGAke21zfSBtc2A7XG59XG4vKipcbiAqIFBsdXJhbGl6YXRpb24gaGVscGVyLlxuICovXG5mdW5jdGlvbiBwbHVyYWwobXMsIG1zQWJzLCBuLCBuYW1lKSB7XG4gICAgY29uc3QgaXNQbHVyYWwgPSBtc0FicyA+PSBuICogMS41O1xuICAgIHJldHVybiBgJHtNYXRoLnJvdW5kKG1zIC8gbil9ICR7bmFtZX0ke2lzUGx1cmFsID8gJ3MnIDogJyd9YDtcbn1cbi8qKlxuICogQSB0eXBlIGd1YXJkIGZvciBlcnJvcnMuXG4gKi9cbmZ1bmN0aW9uIGlzRXJyb3IoZXJyb3IpIHtcbiAgICByZXR1cm4gdHlwZW9mIGVycm9yID09PSAnb2JqZWN0JyAmJiBlcnJvciAhPT0gbnVsbCAmJiAnbWVzc2FnZScgaW4gZXJyb3I7XG59XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMuZGVmYXVsdDtcbm1vZHVsZS5leHBvcnRzLmRlZmF1bHQgPSBleHBvcnRzLmRlZmF1bHQ7XG4iLCIvLyBHRU5FUkFURUQgRklMRS4gRE8gTk9UIEVESVQuXG52YXIgTG9uZyA9IChmdW5jdGlvbihleHBvcnRzKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuICBcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gICAgdmFsdWU6IHRydWVcbiAgfSk7XG4gIGV4cG9ydHMuZGVmYXVsdCA9IHZvaWQgMDtcbiAgXG4gIC8qKlxuICAgKiBAbGljZW5zZVxuICAgKiBDb3B5cmlnaHQgMjAwOSBUaGUgQ2xvc3VyZSBMaWJyYXJ5IEF1dGhvcnNcbiAgICogQ29weXJpZ2h0IDIwMjAgRGFuaWVsIFdpcnR6IC8gVGhlIGxvbmcuanMgQXV0aG9ycy5cbiAgICpcbiAgICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAgICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICAgKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAgICpcbiAgICogICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICAgKlxuICAgKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gICAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAgICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gICAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAgICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gICAqXG4gICAqIFNQRFgtTGljZW5zZS1JZGVudGlmaWVyOiBBcGFjaGUtMi4wXG4gICAqL1xuICAvLyBXZWJBc3NlbWJseSBvcHRpbWl6YXRpb25zIHRvIGRvIG5hdGl2ZSBpNjQgbXVsdGlwbGljYXRpb24gYW5kIGRpdmlkZVxuICB2YXIgd2FzbSA9IG51bGw7XG4gIFxuICB0cnkge1xuICAgIHdhc20gPSBuZXcgV2ViQXNzZW1ibHkuSW5zdGFuY2UobmV3IFdlYkFzc2VtYmx5Lk1vZHVsZShuZXcgVWludDhBcnJheShbMCwgOTcsIDExNSwgMTA5LCAxLCAwLCAwLCAwLCAxLCAxMywgMiwgOTYsIDAsIDEsIDEyNywgOTYsIDQsIDEyNywgMTI3LCAxMjcsIDEyNywgMSwgMTI3LCAzLCA3LCA2LCAwLCAxLCAxLCAxLCAxLCAxLCA2LCA2LCAxLCAxMjcsIDEsIDY1LCAwLCAxMSwgNywgNTAsIDYsIDMsIDEwOSwgMTE3LCAxMDgsIDAsIDEsIDUsIDEwMCwgMTA1LCAxMTgsIDk1LCAxMTUsIDAsIDIsIDUsIDEwMCwgMTA1LCAxMTgsIDk1LCAxMTcsIDAsIDMsIDUsIDExNCwgMTAxLCAxMDksIDk1LCAxMTUsIDAsIDQsIDUsIDExNCwgMTAxLCAxMDksIDk1LCAxMTcsIDAsIDUsIDgsIDEwMywgMTAxLCAxMTYsIDk1LCAxMDQsIDEwNSwgMTAzLCAxMDQsIDAsIDAsIDEwLCAxOTEsIDEsIDYsIDQsIDAsIDM1LCAwLCAxMSwgMzYsIDEsIDEsIDEyNiwgMzIsIDAsIDE3MywgMzIsIDEsIDE3MywgNjYsIDMyLCAxMzQsIDEzMiwgMzIsIDIsIDE3MywgMzIsIDMsIDE3MywgNjYsIDMyLCAxMzQsIDEzMiwgMTI2LCAzNCwgNCwgNjYsIDMyLCAxMzUsIDE2NywgMzYsIDAsIDMyLCA0LCAxNjcsIDExLCAzNiwgMSwgMSwgMTI2LCAzMiwgMCwgMTczLCAzMiwgMSwgMTczLCA2NiwgMzIsIDEzNCwgMTMyLCAzMiwgMiwgMTczLCAzMiwgMywgMTczLCA2NiwgMzIsIDEzNCwgMTMyLCAxMjcsIDM0LCA0LCA2NiwgMzIsIDEzNSwgMTY3LCAzNiwgMCwgMzIsIDQsIDE2NywgMTEsIDM2LCAxLCAxLCAxMjYsIDMyLCAwLCAxNzMsIDMyLCAxLCAxNzMsIDY2LCAzMiwgMTM0LCAxMzIsIDMyLCAyLCAxNzMsIDMyLCAzLCAxNzMsIDY2LCAzMiwgMTM0LCAxMzIsIDEyOCwgMzQsIDQsIDY2LCAzMiwgMTM1LCAxNjcsIDM2LCAwLCAzMiwgNCwgMTY3LCAxMSwgMzYsIDEsIDEsIDEyNiwgMzIsIDAsIDE3MywgMzIsIDEsIDE3MywgNjYsIDMyLCAxMzQsIDEzMiwgMzIsIDIsIDE3MywgMzIsIDMsIDE3MywgNjYsIDMyLCAxMzQsIDEzMiwgMTI5LCAzNCwgNCwgNjYsIDMyLCAxMzUsIDE2NywgMzYsIDAsIDMyLCA0LCAxNjcsIDExLCAzNiwgMSwgMSwgMTI2LCAzMiwgMCwgMTczLCAzMiwgMSwgMTczLCA2NiwgMzIsIDEzNCwgMTMyLCAzMiwgMiwgMTczLCAzMiwgMywgMTczLCA2NiwgMzIsIDEzNCwgMTMyLCAxMzAsIDM0LCA0LCA2NiwgMzIsIDEzNSwgMTY3LCAzNiwgMCwgMzIsIDQsIDE2NywgMTFdKSksIHt9KS5leHBvcnRzO1xuICB9IGNhdGNoIChlKSB7Ly8gbm8gd2FzbSBzdXBwb3J0IDooXG4gIH1cbiAgLyoqXG4gICAqIENvbnN0cnVjdHMgYSA2NCBiaXQgdHdvJ3MtY29tcGxlbWVudCBpbnRlZ2VyLCBnaXZlbiBpdHMgbG93IGFuZCBoaWdoIDMyIGJpdCB2YWx1ZXMgYXMgKnNpZ25lZCogaW50ZWdlcnMuXG4gICAqICBTZWUgdGhlIGZyb20qIGZ1bmN0aW9ucyBiZWxvdyBmb3IgbW9yZSBjb252ZW5pZW50IHdheXMgb2YgY29uc3RydWN0aW5nIExvbmdzLlxuICAgKiBAZXhwb3J0cyBMb25nXG4gICAqIEBjbGFzcyBBIExvbmcgY2xhc3MgZm9yIHJlcHJlc2VudGluZyBhIDY0IGJpdCB0d28ncy1jb21wbGVtZW50IGludGVnZXIgdmFsdWUuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBsb3cgVGhlIGxvdyAoc2lnbmVkKSAzMiBiaXRzIG9mIHRoZSBsb25nXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBoaWdoIFRoZSBoaWdoIChzaWduZWQpIDMyIGJpdHMgb2YgdGhlIGxvbmdcbiAgICogQHBhcmFtIHtib29sZWFuPX0gdW5zaWduZWQgV2hldGhlciB1bnNpZ25lZCBvciBub3QsIGRlZmF1bHRzIHRvIHNpZ25lZFxuICAgKiBAY29uc3RydWN0b3JcbiAgICovXG4gIFxuICBcbiAgZnVuY3Rpb24gTG9uZyhsb3csIGhpZ2gsIHVuc2lnbmVkKSB7XG4gICAgLyoqXG4gICAgICogVGhlIGxvdyAzMiBiaXRzIGFzIGEgc2lnbmVkIHZhbHVlLlxuICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5sb3cgPSBsb3cgfCAwO1xuICAgIC8qKlxuICAgICAqIFRoZSBoaWdoIDMyIGJpdHMgYXMgYSBzaWduZWQgdmFsdWUuXG4gICAgICogQHR5cGUge251bWJlcn1cbiAgICAgKi9cbiAgXG4gICAgdGhpcy5oaWdoID0gaGlnaCB8IDA7XG4gICAgLyoqXG4gICAgICogV2hldGhlciB1bnNpZ25lZCBvciBub3QuXG4gICAgICogQHR5cGUge2Jvb2xlYW59XG4gICAgICovXG4gIFxuICAgIHRoaXMudW5zaWduZWQgPSAhIXVuc2lnbmVkO1xuICB9IC8vIFRoZSBpbnRlcm5hbCByZXByZXNlbnRhdGlvbiBvZiBhIGxvbmcgaXMgdGhlIHR3byBnaXZlbiBzaWduZWQsIDMyLWJpdCB2YWx1ZXMuXG4gIC8vIFdlIHVzZSAzMi1iaXQgcGllY2VzIGJlY2F1c2UgdGhlc2UgYXJlIHRoZSBzaXplIG9mIGludGVnZXJzIG9uIHdoaWNoXG4gIC8vIEphdmFzY3JpcHQgcGVyZm9ybXMgYml0LW9wZXJhdGlvbnMuICBGb3Igb3BlcmF0aW9ucyBsaWtlIGFkZGl0aW9uIGFuZFxuICAvLyBtdWx0aXBsaWNhdGlvbiwgd2Ugc3BsaXQgZWFjaCBudW1iZXIgaW50byAxNiBiaXQgcGllY2VzLCB3aGljaCBjYW4gZWFzaWx5IGJlXG4gIC8vIG11bHRpcGxpZWQgd2l0aGluIEphdmFzY3JpcHQncyBmbG9hdGluZy1wb2ludCByZXByZXNlbnRhdGlvbiB3aXRob3V0IG92ZXJmbG93XG4gIC8vIG9yIGNoYW5nZSBpbiBzaWduLlxuICAvL1xuICAvLyBJbiB0aGUgYWxnb3JpdGhtcyBiZWxvdywgd2UgZnJlcXVlbnRseSByZWR1Y2UgdGhlIG5lZ2F0aXZlIGNhc2UgdG8gdGhlXG4gIC8vIHBvc2l0aXZlIGNhc2UgYnkgbmVnYXRpbmcgdGhlIGlucHV0KHMpIGFuZCB0aGVuIHBvc3QtcHJvY2Vzc2luZyB0aGUgcmVzdWx0LlxuICAvLyBOb3RlIHRoYXQgd2UgbXVzdCBBTFdBWVMgY2hlY2sgc3BlY2lhbGx5IHdoZXRoZXIgdGhvc2UgdmFsdWVzIGFyZSBNSU5fVkFMVUVcbiAgLy8gKC0yXjYzKSBiZWNhdXNlIC1NSU5fVkFMVUUgPT0gTUlOX1ZBTFVFIChzaW5jZSAyXjYzIGNhbm5vdCBiZSByZXByZXNlbnRlZCBhc1xuICAvLyBhIHBvc2l0aXZlIG51bWJlciwgaXQgb3ZlcmZsb3dzIGJhY2sgaW50byBhIG5lZ2F0aXZlKS4gIE5vdCBoYW5kbGluZyB0aGlzXG4gIC8vIGNhc2Ugd291bGQgb2Z0ZW4gcmVzdWx0IGluIGluZmluaXRlIHJlY3Vyc2lvbi5cbiAgLy9cbiAgLy8gQ29tbW9uIGNvbnN0YW50IHZhbHVlcyBaRVJPLCBPTkUsIE5FR19PTkUsIGV0Yy4gYXJlIGRlZmluZWQgYmVsb3cgdGhlIGZyb20qXG4gIC8vIG1ldGhvZHMgb24gd2hpY2ggdGhleSBkZXBlbmQuXG4gIFxuICAvKipcbiAgICogQW4gaW5kaWNhdG9yIHVzZWQgdG8gcmVsaWFibHkgZGV0ZXJtaW5lIGlmIGFuIG9iamVjdCBpcyBhIExvbmcgb3Igbm90LlxuICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICogQGNvbnN0XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBcbiAgXG4gIExvbmcucHJvdG90eXBlLl9faXNMb25nX187XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShMb25nLnByb3RvdHlwZSwgXCJfX2lzTG9uZ19fXCIsIHtcbiAgICB2YWx1ZTogdHJ1ZVxuICB9KTtcbiAgLyoqXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0geyp9IG9iaiBPYmplY3RcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqIEBpbm5lclxuICAgKi9cbiAgXG4gIGZ1bmN0aW9uIGlzTG9uZyhvYmopIHtcbiAgICByZXR1cm4gKG9iaiAmJiBvYmpbXCJfX2lzTG9uZ19fXCJdKSA9PT0gdHJ1ZTtcbiAgfVxuICAvKipcbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7Kn0gdmFsdWUgbnVtYmVyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAqIEBpbm5lclxuICAgKi9cbiAgXG4gIFxuICBmdW5jdGlvbiBjdHozMih2YWx1ZSkge1xuICAgIHZhciBjID0gTWF0aC5jbHozMih2YWx1ZSAmIC12YWx1ZSk7XG4gICAgcmV0dXJuIHZhbHVlID8gMzEgLSBjIDogYztcbiAgfVxuICAvKipcbiAgICogVGVzdHMgaWYgdGhlIHNwZWNpZmllZCBvYmplY3QgaXMgYSBMb25nLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHsqfSBvYmogT2JqZWN0XG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgXG4gIFxuICBMb25nLmlzTG9uZyA9IGlzTG9uZztcbiAgLyoqXG4gICAqIEEgY2FjaGUgb2YgdGhlIExvbmcgcmVwcmVzZW50YXRpb25zIG9mIHNtYWxsIGludGVnZXIgdmFsdWVzLlxuICAgKiBAdHlwZSB7IU9iamVjdH1cbiAgICogQGlubmVyXG4gICAqL1xuICBcbiAgdmFyIElOVF9DQUNIRSA9IHt9O1xuICAvKipcbiAgICogQSBjYWNoZSBvZiB0aGUgTG9uZyByZXByZXNlbnRhdGlvbnMgb2Ygc21hbGwgdW5zaWduZWQgaW50ZWdlciB2YWx1ZXMuXG4gICAqIEB0eXBlIHshT2JqZWN0fVxuICAgKiBAaW5uZXJcbiAgICovXG4gIFxuICB2YXIgVUlOVF9DQUNIRSA9IHt9O1xuICAvKipcbiAgICogQHBhcmFtIHtudW1iZXJ9IHZhbHVlXG4gICAqIEBwYXJhbSB7Ym9vbGVhbj19IHVuc2lnbmVkXG4gICAqIEByZXR1cm5zIHshTG9uZ31cbiAgICogQGlubmVyXG4gICAqL1xuICBcbiAgZnVuY3Rpb24gZnJvbUludCh2YWx1ZSwgdW5zaWduZWQpIHtcbiAgICB2YXIgb2JqLCBjYWNoZWRPYmosIGNhY2hlO1xuICBcbiAgICBpZiAodW5zaWduZWQpIHtcbiAgICAgIHZhbHVlID4+Pj0gMDtcbiAgXG4gICAgICBpZiAoY2FjaGUgPSAwIDw9IHZhbHVlICYmIHZhbHVlIDwgMjU2KSB7XG4gICAgICAgIGNhY2hlZE9iaiA9IFVJTlRfQ0FDSEVbdmFsdWVdO1xuICAgICAgICBpZiAoY2FjaGVkT2JqKSByZXR1cm4gY2FjaGVkT2JqO1xuICAgICAgfVxuICBcbiAgICAgIG9iaiA9IGZyb21CaXRzKHZhbHVlLCAwLCB0cnVlKTtcbiAgICAgIGlmIChjYWNoZSkgVUlOVF9DQUNIRVt2YWx1ZV0gPSBvYmo7XG4gICAgICByZXR1cm4gb2JqO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YWx1ZSB8PSAwO1xuICBcbiAgICAgIGlmIChjYWNoZSA9IC0xMjggPD0gdmFsdWUgJiYgdmFsdWUgPCAxMjgpIHtcbiAgICAgICAgY2FjaGVkT2JqID0gSU5UX0NBQ0hFW3ZhbHVlXTtcbiAgICAgICAgaWYgKGNhY2hlZE9iaikgcmV0dXJuIGNhY2hlZE9iajtcbiAgICAgIH1cbiAgXG4gICAgICBvYmogPSBmcm9tQml0cyh2YWx1ZSwgdmFsdWUgPCAwID8gLTEgOiAwLCBmYWxzZSk7XG4gICAgICBpZiAoY2FjaGUpIElOVF9DQUNIRVt2YWx1ZV0gPSBvYmo7XG4gICAgICByZXR1cm4gb2JqO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICogUmV0dXJucyBhIExvbmcgcmVwcmVzZW50aW5nIHRoZSBnaXZlbiAzMiBiaXQgaW50ZWdlciB2YWx1ZS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZSBUaGUgMzIgYml0IGludGVnZXIgaW4gcXVlc3Rpb25cbiAgICogQHBhcmFtIHtib29sZWFuPX0gdW5zaWduZWQgV2hldGhlciB1bnNpZ25lZCBvciBub3QsIGRlZmF1bHRzIHRvIHNpZ25lZFxuICAgKiBAcmV0dXJucyB7IUxvbmd9IFRoZSBjb3JyZXNwb25kaW5nIExvbmcgdmFsdWVcbiAgICovXG4gIFxuICBcbiAgTG9uZy5mcm9tSW50ID0gZnJvbUludDtcbiAgLyoqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZVxuICAgKiBAcGFyYW0ge2Jvb2xlYW49fSB1bnNpZ25lZFxuICAgKiBAcmV0dXJucyB7IUxvbmd9XG4gICAqIEBpbm5lclxuICAgKi9cbiAgXG4gIGZ1bmN0aW9uIGZyb21OdW1iZXIodmFsdWUsIHVuc2lnbmVkKSB7XG4gICAgaWYgKGlzTmFOKHZhbHVlKSkgcmV0dXJuIHVuc2lnbmVkID8gVVpFUk8gOiBaRVJPO1xuICBcbiAgICBpZiAodW5zaWduZWQpIHtcbiAgICAgIGlmICh2YWx1ZSA8IDApIHJldHVybiBVWkVSTztcbiAgICAgIGlmICh2YWx1ZSA+PSBUV09fUFdSXzY0X0RCTCkgcmV0dXJuIE1BWF9VTlNJR05FRF9WQUxVRTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHZhbHVlIDw9IC1UV09fUFdSXzYzX0RCTCkgcmV0dXJuIE1JTl9WQUxVRTtcbiAgICAgIGlmICh2YWx1ZSArIDEgPj0gVFdPX1BXUl82M19EQkwpIHJldHVybiBNQVhfVkFMVUU7XG4gICAgfVxuICBcbiAgICBpZiAodmFsdWUgPCAwKSByZXR1cm4gZnJvbU51bWJlcigtdmFsdWUsIHVuc2lnbmVkKS5uZWcoKTtcbiAgICByZXR1cm4gZnJvbUJpdHModmFsdWUgJSBUV09fUFdSXzMyX0RCTCB8IDAsIHZhbHVlIC8gVFdPX1BXUl8zMl9EQkwgfCAwLCB1bnNpZ25lZCk7XG4gIH1cbiAgLyoqXG4gICAqIFJldHVybnMgYSBMb25nIHJlcHJlc2VudGluZyB0aGUgZ2l2ZW4gdmFsdWUsIHByb3ZpZGVkIHRoYXQgaXQgaXMgYSBmaW5pdGUgbnVtYmVyLiBPdGhlcndpc2UsIHplcm8gaXMgcmV0dXJuZWQuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0ge251bWJlcn0gdmFsdWUgVGhlIG51bWJlciBpbiBxdWVzdGlvblxuICAgKiBAcGFyYW0ge2Jvb2xlYW49fSB1bnNpZ25lZCBXaGV0aGVyIHVuc2lnbmVkIG9yIG5vdCwgZGVmYXVsdHMgdG8gc2lnbmVkXG4gICAqIEByZXR1cm5zIHshTG9uZ30gVGhlIGNvcnJlc3BvbmRpbmcgTG9uZyB2YWx1ZVxuICAgKi9cbiAgXG4gIFxuICBMb25nLmZyb21OdW1iZXIgPSBmcm9tTnVtYmVyO1xuICAvKipcbiAgICogQHBhcmFtIHtudW1iZXJ9IGxvd0JpdHNcbiAgICogQHBhcmFtIHtudW1iZXJ9IGhpZ2hCaXRzXG4gICAqIEBwYXJhbSB7Ym9vbGVhbj19IHVuc2lnbmVkXG4gICAqIEByZXR1cm5zIHshTG9uZ31cbiAgICogQGlubmVyXG4gICAqL1xuICBcbiAgZnVuY3Rpb24gZnJvbUJpdHMobG93Qml0cywgaGlnaEJpdHMsIHVuc2lnbmVkKSB7XG4gICAgcmV0dXJuIG5ldyBMb25nKGxvd0JpdHMsIGhpZ2hCaXRzLCB1bnNpZ25lZCk7XG4gIH1cbiAgLyoqXG4gICAqIFJldHVybnMgYSBMb25nIHJlcHJlc2VudGluZyB0aGUgNjQgYml0IGludGVnZXIgdGhhdCBjb21lcyBieSBjb25jYXRlbmF0aW5nIHRoZSBnaXZlbiBsb3cgYW5kIGhpZ2ggYml0cy4gRWFjaCBpc1xuICAgKiAgYXNzdW1lZCB0byB1c2UgMzIgYml0cy5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBsb3dCaXRzIFRoZSBsb3cgMzIgYml0c1xuICAgKiBAcGFyYW0ge251bWJlcn0gaGlnaEJpdHMgVGhlIGhpZ2ggMzIgYml0c1xuICAgKiBAcGFyYW0ge2Jvb2xlYW49fSB1bnNpZ25lZCBXaGV0aGVyIHVuc2lnbmVkIG9yIG5vdCwgZGVmYXVsdHMgdG8gc2lnbmVkXG4gICAqIEByZXR1cm5zIHshTG9uZ30gVGhlIGNvcnJlc3BvbmRpbmcgTG9uZyB2YWx1ZVxuICAgKi9cbiAgXG4gIFxuICBMb25nLmZyb21CaXRzID0gZnJvbUJpdHM7XG4gIC8qKlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHtudW1iZXJ9IGJhc2VcbiAgICogQHBhcmFtIHtudW1iZXJ9IGV4cG9uZW50XG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAqIEBpbm5lclxuICAgKi9cbiAgXG4gIHZhciBwb3dfZGJsID0gTWF0aC5wb3c7IC8vIFVzZWQgNCB0aW1lcyAoNCo4IHRvIDE1KzQpXG4gIFxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IHN0clxuICAgKiBAcGFyYW0geyhib29sZWFufG51bWJlcik9fSB1bnNpZ25lZFxuICAgKiBAcGFyYW0ge251bWJlcj19IHJhZGl4XG4gICAqIEByZXR1cm5zIHshTG9uZ31cbiAgICogQGlubmVyXG4gICAqL1xuICBcbiAgZnVuY3Rpb24gZnJvbVN0cmluZyhzdHIsIHVuc2lnbmVkLCByYWRpeCkge1xuICAgIGlmIChzdHIubGVuZ3RoID09PSAwKSB0aHJvdyBFcnJvcignZW1wdHkgc3RyaW5nJyk7XG4gIFxuICAgIGlmICh0eXBlb2YgdW5zaWduZWQgPT09ICdudW1iZXInKSB7XG4gICAgICAvLyBGb3IgZ29vZy5tYXRoLmxvbmcgY29tcGF0aWJpbGl0eVxuICAgICAgcmFkaXggPSB1bnNpZ25lZDtcbiAgICAgIHVuc2lnbmVkID0gZmFsc2U7XG4gICAgfSBlbHNlIHtcbiAgICAgIHVuc2lnbmVkID0gISF1bnNpZ25lZDtcbiAgICB9XG4gIFxuICAgIGlmIChzdHIgPT09IFwiTmFOXCIgfHwgc3RyID09PSBcIkluZmluaXR5XCIgfHwgc3RyID09PSBcIitJbmZpbml0eVwiIHx8IHN0ciA9PT0gXCItSW5maW5pdHlcIikgcmV0dXJuIHVuc2lnbmVkID8gVVpFUk8gOiBaRVJPO1xuICAgIHJhZGl4ID0gcmFkaXggfHwgMTA7XG4gICAgaWYgKHJhZGl4IDwgMiB8fCAzNiA8IHJhZGl4KSB0aHJvdyBSYW5nZUVycm9yKCdyYWRpeCcpO1xuICAgIHZhciBwO1xuICAgIGlmICgocCA9IHN0ci5pbmRleE9mKCctJykpID4gMCkgdGhyb3cgRXJyb3IoJ2ludGVyaW9yIGh5cGhlbicpO2Vsc2UgaWYgKHAgPT09IDApIHtcbiAgICAgIHJldHVybiBmcm9tU3RyaW5nKHN0ci5zdWJzdHJpbmcoMSksIHVuc2lnbmVkLCByYWRpeCkubmVnKCk7XG4gICAgfSAvLyBEbyBzZXZlcmFsICg4KSBkaWdpdHMgZWFjaCB0aW1lIHRocm91Z2ggdGhlIGxvb3AsIHNvIGFzIHRvXG4gICAgLy8gbWluaW1pemUgdGhlIGNhbGxzIHRvIHRoZSB2ZXJ5IGV4cGVuc2l2ZSBlbXVsYXRlZCBkaXYuXG4gIFxuICAgIHZhciByYWRpeFRvUG93ZXIgPSBmcm9tTnVtYmVyKHBvd19kYmwocmFkaXgsIDgpKTtcbiAgICB2YXIgcmVzdWx0ID0gWkVSTztcbiAgXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyBpICs9IDgpIHtcbiAgICAgIHZhciBzaXplID0gTWF0aC5taW4oOCwgc3RyLmxlbmd0aCAtIGkpLFxuICAgICAgICAgIHZhbHVlID0gcGFyc2VJbnQoc3RyLnN1YnN0cmluZyhpLCBpICsgc2l6ZSksIHJhZGl4KTtcbiAgXG4gICAgICBpZiAoc2l6ZSA8IDgpIHtcbiAgICAgICAgdmFyIHBvd2VyID0gZnJvbU51bWJlcihwb3dfZGJsKHJhZGl4LCBzaXplKSk7XG4gICAgICAgIHJlc3VsdCA9IHJlc3VsdC5tdWwocG93ZXIpLmFkZChmcm9tTnVtYmVyKHZhbHVlKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXN1bHQgPSByZXN1bHQubXVsKHJhZGl4VG9Qb3dlcik7XG4gICAgICAgIHJlc3VsdCA9IHJlc3VsdC5hZGQoZnJvbU51bWJlcih2YWx1ZSkpO1xuICAgICAgfVxuICAgIH1cbiAgXG4gICAgcmVzdWx0LnVuc2lnbmVkID0gdW5zaWduZWQ7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuICAvKipcbiAgICogUmV0dXJucyBhIExvbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIGdpdmVuIHN0cmluZywgd3JpdHRlbiB1c2luZyB0aGUgc3BlY2lmaWVkIHJhZGl4LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHtzdHJpbmd9IHN0ciBUaGUgdGV4dHVhbCByZXByZXNlbnRhdGlvbiBvZiB0aGUgTG9uZ1xuICAgKiBAcGFyYW0geyhib29sZWFufG51bWJlcik9fSB1bnNpZ25lZCBXaGV0aGVyIHVuc2lnbmVkIG9yIG5vdCwgZGVmYXVsdHMgdG8gc2lnbmVkXG4gICAqIEBwYXJhbSB7bnVtYmVyPX0gcmFkaXggVGhlIHJhZGl4IGluIHdoaWNoIHRoZSB0ZXh0IGlzIHdyaXR0ZW4gKDItMzYpLCBkZWZhdWx0cyB0byAxMFxuICAgKiBAcmV0dXJucyB7IUxvbmd9IFRoZSBjb3JyZXNwb25kaW5nIExvbmcgdmFsdWVcbiAgICovXG4gIFxuICBcbiAgTG9uZy5mcm9tU3RyaW5nID0gZnJvbVN0cmluZztcbiAgLyoqXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxzdHJpbmd8IXtsb3c6IG51bWJlciwgaGlnaDogbnVtYmVyLCB1bnNpZ25lZDogYm9vbGVhbn19IHZhbFxuICAgKiBAcGFyYW0ge2Jvb2xlYW49fSB1bnNpZ25lZFxuICAgKiBAcmV0dXJucyB7IUxvbmd9XG4gICAqIEBpbm5lclxuICAgKi9cbiAgXG4gIGZ1bmN0aW9uIGZyb21WYWx1ZSh2YWwsIHVuc2lnbmVkKSB7XG4gICAgaWYgKHR5cGVvZiB2YWwgPT09ICdudW1iZXInKSByZXR1cm4gZnJvbU51bWJlcih2YWwsIHVuc2lnbmVkKTtcbiAgICBpZiAodHlwZW9mIHZhbCA9PT0gJ3N0cmluZycpIHJldHVybiBmcm9tU3RyaW5nKHZhbCwgdW5zaWduZWQpOyAvLyBUaHJvd3MgZm9yIG5vbi1vYmplY3RzLCBjb252ZXJ0cyBub24taW5zdGFuY2VvZiBMb25nOlxuICBcbiAgICByZXR1cm4gZnJvbUJpdHModmFsLmxvdywgdmFsLmhpZ2gsIHR5cGVvZiB1bnNpZ25lZCA9PT0gJ2Jvb2xlYW4nID8gdW5zaWduZWQgOiB2YWwudW5zaWduZWQpO1xuICB9XG4gIC8qKlxuICAgKiBDb252ZXJ0cyB0aGUgc3BlY2lmaWVkIHZhbHVlIHRvIGEgTG9uZyB1c2luZyB0aGUgYXBwcm9wcmlhdGUgZnJvbSogZnVuY3Rpb24gZm9yIGl0cyB0eXBlLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfCF7bG93OiBudW1iZXIsIGhpZ2g6IG51bWJlciwgdW5zaWduZWQ6IGJvb2xlYW59fSB2YWwgVmFsdWVcbiAgICogQHBhcmFtIHtib29sZWFuPX0gdW5zaWduZWQgV2hldGhlciB1bnNpZ25lZCBvciBub3QsIGRlZmF1bHRzIHRvIHNpZ25lZFxuICAgKiBAcmV0dXJucyB7IUxvbmd9XG4gICAqL1xuICBcbiAgXG4gIExvbmcuZnJvbVZhbHVlID0gZnJvbVZhbHVlOyAvLyBOT1RFOiB0aGUgY29tcGlsZXIgc2hvdWxkIGlubGluZSB0aGVzZSBjb25zdGFudCB2YWx1ZXMgYmVsb3cgYW5kIHRoZW4gcmVtb3ZlIHRoZXNlIHZhcmlhYmxlcywgc28gdGhlcmUgc2hvdWxkIGJlXG4gIC8vIG5vIHJ1bnRpbWUgcGVuYWx0eSBmb3IgdGhlc2UuXG4gIFxuICAvKipcbiAgICogQHR5cGUge251bWJlcn1cbiAgICogQGNvbnN0XG4gICAqIEBpbm5lclxuICAgKi9cbiAgXG4gIHZhciBUV09fUFdSXzE2X0RCTCA9IDEgPDwgMTY7XG4gIC8qKlxuICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgKiBAY29uc3RcbiAgICogQGlubmVyXG4gICAqL1xuICBcbiAgdmFyIFRXT19QV1JfMjRfREJMID0gMSA8PCAyNDtcbiAgLyoqXG4gICAqIEB0eXBlIHtudW1iZXJ9XG4gICAqIEBjb25zdFxuICAgKiBAaW5uZXJcbiAgICovXG4gIFxuICB2YXIgVFdPX1BXUl8zMl9EQkwgPSBUV09fUFdSXzE2X0RCTCAqIFRXT19QV1JfMTZfREJMO1xuICAvKipcbiAgICogQHR5cGUge251bWJlcn1cbiAgICogQGNvbnN0XG4gICAqIEBpbm5lclxuICAgKi9cbiAgXG4gIHZhciBUV09fUFdSXzY0X0RCTCA9IFRXT19QV1JfMzJfREJMICogVFdPX1BXUl8zMl9EQkw7XG4gIC8qKlxuICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgKiBAY29uc3RcbiAgICogQGlubmVyXG4gICAqL1xuICBcbiAgdmFyIFRXT19QV1JfNjNfREJMID0gVFdPX1BXUl82NF9EQkwgLyAyO1xuICAvKipcbiAgICogQHR5cGUgeyFMb25nfVxuICAgKiBAY29uc3RcbiAgICogQGlubmVyXG4gICAqL1xuICBcbiAgdmFyIFRXT19QV1JfMjQgPSBmcm9tSW50KFRXT19QV1JfMjRfREJMKTtcbiAgLyoqXG4gICAqIEB0eXBlIHshTG9uZ31cbiAgICogQGlubmVyXG4gICAqL1xuICBcbiAgdmFyIFpFUk8gPSBmcm9tSW50KDApO1xuICAvKipcbiAgICogU2lnbmVkIHplcm8uXG4gICAqIEB0eXBlIHshTG9uZ31cbiAgICovXG4gIFxuICBMb25nLlpFUk8gPSBaRVJPO1xuICAvKipcbiAgICogQHR5cGUgeyFMb25nfVxuICAgKiBAaW5uZXJcbiAgICovXG4gIFxuICB2YXIgVVpFUk8gPSBmcm9tSW50KDAsIHRydWUpO1xuICAvKipcbiAgICogVW5zaWduZWQgemVyby5cbiAgICogQHR5cGUgeyFMb25nfVxuICAgKi9cbiAgXG4gIExvbmcuVVpFUk8gPSBVWkVSTztcbiAgLyoqXG4gICAqIEB0eXBlIHshTG9uZ31cbiAgICogQGlubmVyXG4gICAqL1xuICBcbiAgdmFyIE9ORSA9IGZyb21JbnQoMSk7XG4gIC8qKlxuICAgKiBTaWduZWQgb25lLlxuICAgKiBAdHlwZSB7IUxvbmd9XG4gICAqL1xuICBcbiAgTG9uZy5PTkUgPSBPTkU7XG4gIC8qKlxuICAgKiBAdHlwZSB7IUxvbmd9XG4gICAqIEBpbm5lclxuICAgKi9cbiAgXG4gIHZhciBVT05FID0gZnJvbUludCgxLCB0cnVlKTtcbiAgLyoqXG4gICAqIFVuc2lnbmVkIG9uZS5cbiAgICogQHR5cGUgeyFMb25nfVxuICAgKi9cbiAgXG4gIExvbmcuVU9ORSA9IFVPTkU7XG4gIC8qKlxuICAgKiBAdHlwZSB7IUxvbmd9XG4gICAqIEBpbm5lclxuICAgKi9cbiAgXG4gIHZhciBORUdfT05FID0gZnJvbUludCgtMSk7XG4gIC8qKlxuICAgKiBTaWduZWQgbmVnYXRpdmUgb25lLlxuICAgKiBAdHlwZSB7IUxvbmd9XG4gICAqL1xuICBcbiAgTG9uZy5ORUdfT05FID0gTkVHX09ORTtcbiAgLyoqXG4gICAqIEB0eXBlIHshTG9uZ31cbiAgICogQGlubmVyXG4gICAqL1xuICBcbiAgdmFyIE1BWF9WQUxVRSA9IGZyb21CaXRzKDB4RkZGRkZGRkYgfCAwLCAweDdGRkZGRkZGIHwgMCwgZmFsc2UpO1xuICAvKipcbiAgICogTWF4aW11bSBzaWduZWQgdmFsdWUuXG4gICAqIEB0eXBlIHshTG9uZ31cbiAgICovXG4gIFxuICBMb25nLk1BWF9WQUxVRSA9IE1BWF9WQUxVRTtcbiAgLyoqXG4gICAqIEB0eXBlIHshTG9uZ31cbiAgICogQGlubmVyXG4gICAqL1xuICBcbiAgdmFyIE1BWF9VTlNJR05FRF9WQUxVRSA9IGZyb21CaXRzKDB4RkZGRkZGRkYgfCAwLCAweEZGRkZGRkZGIHwgMCwgdHJ1ZSk7XG4gIC8qKlxuICAgKiBNYXhpbXVtIHVuc2lnbmVkIHZhbHVlLlxuICAgKiBAdHlwZSB7IUxvbmd9XG4gICAqL1xuICBcbiAgTG9uZy5NQVhfVU5TSUdORURfVkFMVUUgPSBNQVhfVU5TSUdORURfVkFMVUU7XG4gIC8qKlxuICAgKiBAdHlwZSB7IUxvbmd9XG4gICAqIEBpbm5lclxuICAgKi9cbiAgXG4gIHZhciBNSU5fVkFMVUUgPSBmcm9tQml0cygwLCAweDgwMDAwMDAwIHwgMCwgZmFsc2UpO1xuICAvKipcbiAgICogTWluaW11bSBzaWduZWQgdmFsdWUuXG4gICAqIEB0eXBlIHshTG9uZ31cbiAgICovXG4gIFxuICBMb25nLk1JTl9WQUxVRSA9IE1JTl9WQUxVRTtcbiAgLyoqXG4gICAqIEBhbGlhcyBMb25nLnByb3RvdHlwZVxuICAgKiBAaW5uZXJcbiAgICovXG4gIFxuICB2YXIgTG9uZ1Byb3RvdHlwZSA9IExvbmcucHJvdG90eXBlO1xuICAvKipcbiAgICogQ29udmVydHMgdGhlIExvbmcgdG8gYSAzMiBiaXQgaW50ZWdlciwgYXNzdW1pbmcgaXQgaXMgYSAzMiBiaXQgaW50ZWdlci5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgKi9cbiAgXG4gIExvbmdQcm90b3R5cGUudG9JbnQgPSBmdW5jdGlvbiB0b0ludCgpIHtcbiAgICByZXR1cm4gdGhpcy51bnNpZ25lZCA/IHRoaXMubG93ID4+PiAwIDogdGhpcy5sb3c7XG4gIH07XG4gIC8qKlxuICAgKiBDb252ZXJ0cyB0aGUgTG9uZyB0byBhIHRoZSBuZWFyZXN0IGZsb2F0aW5nLXBvaW50IHJlcHJlc2VudGF0aW9uIG9mIHRoaXMgdmFsdWUgKGRvdWJsZSwgNTMgYml0IG1hbnRpc3NhKS5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLnRvTnVtYmVyID0gZnVuY3Rpb24gdG9OdW1iZXIoKSB7XG4gICAgaWYgKHRoaXMudW5zaWduZWQpIHJldHVybiAodGhpcy5oaWdoID4+PiAwKSAqIFRXT19QV1JfMzJfREJMICsgKHRoaXMubG93ID4+PiAwKTtcbiAgICByZXR1cm4gdGhpcy5oaWdoICogVFdPX1BXUl8zMl9EQkwgKyAodGhpcy5sb3cgPj4+IDApO1xuICB9O1xuICAvKipcbiAgICogQ29udmVydHMgdGhlIExvbmcgdG8gYSBzdHJpbmcgd3JpdHRlbiBpbiB0aGUgc3BlY2lmaWVkIHJhZGl4LlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEBwYXJhbSB7bnVtYmVyPX0gcmFkaXggUmFkaXggKDItMzYpLCBkZWZhdWx0cyB0byAxMFxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgKiBAb3ZlcnJpZGVcbiAgICogQHRocm93cyB7UmFuZ2VFcnJvcn0gSWYgYHJhZGl4YCBpcyBvdXQgb2YgcmFuZ2VcbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nKHJhZGl4KSB7XG4gICAgcmFkaXggPSByYWRpeCB8fCAxMDtcbiAgICBpZiAocmFkaXggPCAyIHx8IDM2IDwgcmFkaXgpIHRocm93IFJhbmdlRXJyb3IoJ3JhZGl4Jyk7XG4gICAgaWYgKHRoaXMuaXNaZXJvKCkpIHJldHVybiAnMCc7XG4gIFxuICAgIGlmICh0aGlzLmlzTmVnYXRpdmUoKSkge1xuICAgICAgLy8gVW5zaWduZWQgTG9uZ3MgYXJlIG5ldmVyIG5lZ2F0aXZlXG4gICAgICBpZiAodGhpcy5lcShNSU5fVkFMVUUpKSB7XG4gICAgICAgIC8vIFdlIG5lZWQgdG8gY2hhbmdlIHRoZSBMb25nIHZhbHVlIGJlZm9yZSBpdCBjYW4gYmUgbmVnYXRlZCwgc28gd2UgcmVtb3ZlXG4gICAgICAgIC8vIHRoZSBib3R0b20tbW9zdCBkaWdpdCBpbiB0aGlzIGJhc2UgYW5kIHRoZW4gcmVjdXJzZSB0byBkbyB0aGUgcmVzdC5cbiAgICAgICAgdmFyIHJhZGl4TG9uZyA9IGZyb21OdW1iZXIocmFkaXgpLFxuICAgICAgICAgICAgZGl2ID0gdGhpcy5kaXYocmFkaXhMb25nKSxcbiAgICAgICAgICAgIHJlbTEgPSBkaXYubXVsKHJhZGl4TG9uZykuc3ViKHRoaXMpO1xuICAgICAgICByZXR1cm4gZGl2LnRvU3RyaW5nKHJhZGl4KSArIHJlbTEudG9JbnQoKS50b1N0cmluZyhyYWRpeCk7XG4gICAgICB9IGVsc2UgcmV0dXJuICctJyArIHRoaXMubmVnKCkudG9TdHJpbmcocmFkaXgpO1xuICAgIH0gLy8gRG8gc2V2ZXJhbCAoNikgZGlnaXRzIGVhY2ggdGltZSB0aHJvdWdoIHRoZSBsb29wLCBzbyBhcyB0b1xuICAgIC8vIG1pbmltaXplIHRoZSBjYWxscyB0byB0aGUgdmVyeSBleHBlbnNpdmUgZW11bGF0ZWQgZGl2LlxuICBcbiAgXG4gICAgdmFyIHJhZGl4VG9Qb3dlciA9IGZyb21OdW1iZXIocG93X2RibChyYWRpeCwgNiksIHRoaXMudW5zaWduZWQpLFxuICAgICAgICByZW0gPSB0aGlzO1xuICAgIHZhciByZXN1bHQgPSAnJztcbiAgXG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgIHZhciByZW1EaXYgPSByZW0uZGl2KHJhZGl4VG9Qb3dlciksXG4gICAgICAgICAgaW50dmFsID0gcmVtLnN1YihyZW1EaXYubXVsKHJhZGl4VG9Qb3dlcikpLnRvSW50KCkgPj4+IDAsXG4gICAgICAgICAgZGlnaXRzID0gaW50dmFsLnRvU3RyaW5nKHJhZGl4KTtcbiAgICAgIHJlbSA9IHJlbURpdjtcbiAgICAgIGlmIChyZW0uaXNaZXJvKCkpIHJldHVybiBkaWdpdHMgKyByZXN1bHQ7ZWxzZSB7XG4gICAgICAgIHdoaWxlIChkaWdpdHMubGVuZ3RoIDwgNikgZGlnaXRzID0gJzAnICsgZGlnaXRzO1xuICBcbiAgICAgICAgcmVzdWx0ID0gJycgKyBkaWdpdHMgKyByZXN1bHQ7XG4gICAgICB9XG4gICAgfVxuICB9O1xuICAvKipcbiAgICogR2V0cyB0aGUgaGlnaCAzMiBiaXRzIGFzIGEgc2lnbmVkIGludGVnZXIuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHJldHVybnMge251bWJlcn0gU2lnbmVkIGhpZ2ggYml0c1xuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLmdldEhpZ2hCaXRzID0gZnVuY3Rpb24gZ2V0SGlnaEJpdHMoKSB7XG4gICAgcmV0dXJuIHRoaXMuaGlnaDtcbiAgfTtcbiAgLyoqXG4gICAqIEdldHMgdGhlIGhpZ2ggMzIgYml0cyBhcyBhbiB1bnNpZ25lZCBpbnRlZ2VyLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEByZXR1cm5zIHtudW1iZXJ9IFVuc2lnbmVkIGhpZ2ggYml0c1xuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLmdldEhpZ2hCaXRzVW5zaWduZWQgPSBmdW5jdGlvbiBnZXRIaWdoQml0c1Vuc2lnbmVkKCkge1xuICAgIHJldHVybiB0aGlzLmhpZ2ggPj4+IDA7XG4gIH07XG4gIC8qKlxuICAgKiBHZXRzIHRoZSBsb3cgMzIgYml0cyBhcyBhIHNpZ25lZCBpbnRlZ2VyLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEByZXR1cm5zIHtudW1iZXJ9IFNpZ25lZCBsb3cgYml0c1xuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLmdldExvd0JpdHMgPSBmdW5jdGlvbiBnZXRMb3dCaXRzKCkge1xuICAgIHJldHVybiB0aGlzLmxvdztcbiAgfTtcbiAgLyoqXG4gICAqIEdldHMgdGhlIGxvdyAzMiBiaXRzIGFzIGFuIHVuc2lnbmVkIGludGVnZXIuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHJldHVybnMge251bWJlcn0gVW5zaWduZWQgbG93IGJpdHNcbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5nZXRMb3dCaXRzVW5zaWduZWQgPSBmdW5jdGlvbiBnZXRMb3dCaXRzVW5zaWduZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMubG93ID4+PiAwO1xuICB9O1xuICAvKipcbiAgICogR2V0cyB0aGUgbnVtYmVyIG9mIGJpdHMgbmVlZGVkIHRvIHJlcHJlc2VudCB0aGUgYWJzb2x1dGUgdmFsdWUgb2YgdGhpcyBMb25nLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUuZ2V0TnVtQml0c0FicyA9IGZ1bmN0aW9uIGdldE51bUJpdHNBYnMoKSB7XG4gICAgaWYgKHRoaXMuaXNOZWdhdGl2ZSgpKSAvLyBVbnNpZ25lZCBMb25ncyBhcmUgbmV2ZXIgbmVnYXRpdmVcbiAgICAgIHJldHVybiB0aGlzLmVxKE1JTl9WQUxVRSkgPyA2NCA6IHRoaXMubmVnKCkuZ2V0TnVtQml0c0FicygpO1xuICAgIHZhciB2YWwgPSB0aGlzLmhpZ2ggIT0gMCA/IHRoaXMuaGlnaCA6IHRoaXMubG93O1xuICBcbiAgICBmb3IgKHZhciBiaXQgPSAzMTsgYml0ID4gMDsgYml0LS0pIGlmICgodmFsICYgMSA8PCBiaXQpICE9IDApIGJyZWFrO1xuICBcbiAgICByZXR1cm4gdGhpcy5oaWdoICE9IDAgPyBiaXQgKyAzMyA6IGJpdCArIDE7XG4gIH07XG4gIC8qKlxuICAgKiBUZXN0cyBpZiB0aGlzIExvbmcncyB2YWx1ZSBlcXVhbHMgemVyby5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5pc1plcm8gPSBmdW5jdGlvbiBpc1plcm8oKSB7XG4gICAgcmV0dXJuIHRoaXMuaGlnaCA9PT0gMCAmJiB0aGlzLmxvdyA9PT0gMDtcbiAgfTtcbiAgLyoqXG4gICAqIFRlc3RzIGlmIHRoaXMgTG9uZydzIHZhbHVlIGVxdWFscyB6ZXJvLiBUaGlzIGlzIGFuIGFsaWFzIG9mIHtAbGluayBMb25nI2lzWmVyb30uXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLmVxeiA9IExvbmdQcm90b3R5cGUuaXNaZXJvO1xuICAvKipcbiAgICogVGVzdHMgaWYgdGhpcyBMb25nJ3MgdmFsdWUgaXMgbmVnYXRpdmUuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBcbiAgTG9uZ1Byb3RvdHlwZS5pc05lZ2F0aXZlID0gZnVuY3Rpb24gaXNOZWdhdGl2ZSgpIHtcbiAgICByZXR1cm4gIXRoaXMudW5zaWduZWQgJiYgdGhpcy5oaWdoIDwgMDtcbiAgfTtcbiAgLyoqXG4gICAqIFRlc3RzIGlmIHRoaXMgTG9uZydzIHZhbHVlIGlzIHBvc2l0aXZlIG9yIHplcm8uXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUuaXNQb3NpdGl2ZSA9IGZ1bmN0aW9uIGlzUG9zaXRpdmUoKSB7XG4gICAgcmV0dXJuIHRoaXMudW5zaWduZWQgfHwgdGhpcy5oaWdoID49IDA7XG4gIH07XG4gIC8qKlxuICAgKiBUZXN0cyBpZiB0aGlzIExvbmcncyB2YWx1ZSBpcyBvZGQuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUuaXNPZGQgPSBmdW5jdGlvbiBpc09kZCgpIHtcbiAgICByZXR1cm4gKHRoaXMubG93ICYgMSkgPT09IDE7XG4gIH07XG4gIC8qKlxuICAgKiBUZXN0cyBpZiB0aGlzIExvbmcncyB2YWx1ZSBpcyBldmVuLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLmlzRXZlbiA9IGZ1bmN0aW9uIGlzRXZlbigpIHtcbiAgICByZXR1cm4gKHRoaXMubG93ICYgMSkgPT09IDA7XG4gIH07XG4gIC8qKlxuICAgKiBUZXN0cyBpZiB0aGlzIExvbmcncyB2YWx1ZSBlcXVhbHMgdGhlIHNwZWNpZmllZCdzLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ30gb3RoZXIgT3RoZXIgdmFsdWVcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUuZXF1YWxzID0gZnVuY3Rpb24gZXF1YWxzKG90aGVyKSB7XG4gICAgaWYgKCFpc0xvbmcob3RoZXIpKSBvdGhlciA9IGZyb21WYWx1ZShvdGhlcik7XG4gICAgaWYgKHRoaXMudW5zaWduZWQgIT09IG90aGVyLnVuc2lnbmVkICYmIHRoaXMuaGlnaCA+Pj4gMzEgPT09IDEgJiYgb3RoZXIuaGlnaCA+Pj4gMzEgPT09IDEpIHJldHVybiBmYWxzZTtcbiAgICByZXR1cm4gdGhpcy5oaWdoID09PSBvdGhlci5oaWdoICYmIHRoaXMubG93ID09PSBvdGhlci5sb3c7XG4gIH07XG4gIC8qKlxuICAgKiBUZXN0cyBpZiB0aGlzIExvbmcncyB2YWx1ZSBlcXVhbHMgdGhlIHNwZWNpZmllZCdzLiBUaGlzIGlzIGFuIGFsaWFzIG9mIHtAbGluayBMb25nI2VxdWFsc30uXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxzdHJpbmd9IG90aGVyIE90aGVyIHZhbHVlXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLmVxID0gTG9uZ1Byb3RvdHlwZS5lcXVhbHM7XG4gIC8qKlxuICAgKiBUZXN0cyBpZiB0aGlzIExvbmcncyB2YWx1ZSBkaWZmZXJzIGZyb20gdGhlIHNwZWNpZmllZCdzLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ30gb3RoZXIgT3RoZXIgdmFsdWVcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBcbiAgTG9uZ1Byb3RvdHlwZS5ub3RFcXVhbHMgPSBmdW5jdGlvbiBub3RFcXVhbHMob3RoZXIpIHtcbiAgICByZXR1cm4gIXRoaXMuZXEoXG4gICAgLyogdmFsaWRhdGVzICovXG4gICAgb3RoZXIpO1xuICB9O1xuICAvKipcbiAgICogVGVzdHMgaWYgdGhpcyBMb25nJ3MgdmFsdWUgZGlmZmVycyBmcm9tIHRoZSBzcGVjaWZpZWQncy4gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgTG9uZyNub3RFcXVhbHN9LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfSBvdGhlciBPdGhlciB2YWx1ZVxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5uZXEgPSBMb25nUHJvdG90eXBlLm5vdEVxdWFscztcbiAgLyoqXG4gICAqIFRlc3RzIGlmIHRoaXMgTG9uZydzIHZhbHVlIGRpZmZlcnMgZnJvbSB0aGUgc3BlY2lmaWVkJ3MuIFRoaXMgaXMgYW4gYWxpYXMgb2Yge0BsaW5rIExvbmcjbm90RXF1YWxzfS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ30gb3RoZXIgT3RoZXIgdmFsdWVcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBcbiAgTG9uZ1Byb3RvdHlwZS5uZSA9IExvbmdQcm90b3R5cGUubm90RXF1YWxzO1xuICAvKipcbiAgICogVGVzdHMgaWYgdGhpcyBMb25nJ3MgdmFsdWUgaXMgbGVzcyB0aGFuIHRoZSBzcGVjaWZpZWQncy5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxzdHJpbmd9IG90aGVyIE90aGVyIHZhbHVlXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgXG4gIExvbmdQcm90b3R5cGUubGVzc1RoYW4gPSBmdW5jdGlvbiBsZXNzVGhhbihvdGhlcikge1xuICAgIHJldHVybiB0aGlzLmNvbXAoXG4gICAgLyogdmFsaWRhdGVzICovXG4gICAgb3RoZXIpIDwgMDtcbiAgfTtcbiAgLyoqXG4gICAqIFRlc3RzIGlmIHRoaXMgTG9uZydzIHZhbHVlIGlzIGxlc3MgdGhhbiB0aGUgc3BlY2lmaWVkJ3MuIFRoaXMgaXMgYW4gYWxpYXMgb2Yge0BsaW5rIExvbmcjbGVzc1RoYW59LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfSBvdGhlciBPdGhlciB2YWx1ZVxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5sdCA9IExvbmdQcm90b3R5cGUubGVzc1RoYW47XG4gIC8qKlxuICAgKiBUZXN0cyBpZiB0aGlzIExvbmcncyB2YWx1ZSBpcyBsZXNzIHRoYW4gb3IgZXF1YWwgdGhlIHNwZWNpZmllZCdzLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ30gb3RoZXIgT3RoZXIgdmFsdWVcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBcbiAgTG9uZ1Byb3RvdHlwZS5sZXNzVGhhbk9yRXF1YWwgPSBmdW5jdGlvbiBsZXNzVGhhbk9yRXF1YWwob3RoZXIpIHtcbiAgICByZXR1cm4gdGhpcy5jb21wKFxuICAgIC8qIHZhbGlkYXRlcyAqL1xuICAgIG90aGVyKSA8PSAwO1xuICB9O1xuICAvKipcbiAgICogVGVzdHMgaWYgdGhpcyBMb25nJ3MgdmFsdWUgaXMgbGVzcyB0aGFuIG9yIGVxdWFsIHRoZSBzcGVjaWZpZWQncy4gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgTG9uZyNsZXNzVGhhbk9yRXF1YWx9LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfSBvdGhlciBPdGhlciB2YWx1ZVxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5sdGUgPSBMb25nUHJvdG90eXBlLmxlc3NUaGFuT3JFcXVhbDtcbiAgLyoqXG4gICAqIFRlc3RzIGlmIHRoaXMgTG9uZydzIHZhbHVlIGlzIGxlc3MgdGhhbiBvciBlcXVhbCB0aGUgc3BlY2lmaWVkJ3MuIFRoaXMgaXMgYW4gYWxpYXMgb2Yge0BsaW5rIExvbmcjbGVzc1RoYW5PckVxdWFsfS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ30gb3RoZXIgT3RoZXIgdmFsdWVcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBcbiAgTG9uZ1Byb3RvdHlwZS5sZSA9IExvbmdQcm90b3R5cGUubGVzc1RoYW5PckVxdWFsO1xuICAvKipcbiAgICogVGVzdHMgaWYgdGhpcyBMb25nJ3MgdmFsdWUgaXMgZ3JlYXRlciB0aGFuIHRoZSBzcGVjaWZpZWQncy5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxzdHJpbmd9IG90aGVyIE90aGVyIHZhbHVlXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgXG4gIExvbmdQcm90b3R5cGUuZ3JlYXRlclRoYW4gPSBmdW5jdGlvbiBncmVhdGVyVGhhbihvdGhlcikge1xuICAgIHJldHVybiB0aGlzLmNvbXAoXG4gICAgLyogdmFsaWRhdGVzICovXG4gICAgb3RoZXIpID4gMDtcbiAgfTtcbiAgLyoqXG4gICAqIFRlc3RzIGlmIHRoaXMgTG9uZydzIHZhbHVlIGlzIGdyZWF0ZXIgdGhhbiB0aGUgc3BlY2lmaWVkJ3MuIFRoaXMgaXMgYW4gYWxpYXMgb2Yge0BsaW5rIExvbmcjZ3JlYXRlclRoYW59LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfSBvdGhlciBPdGhlciB2YWx1ZVxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5ndCA9IExvbmdQcm90b3R5cGUuZ3JlYXRlclRoYW47XG4gIC8qKlxuICAgKiBUZXN0cyBpZiB0aGlzIExvbmcncyB2YWx1ZSBpcyBncmVhdGVyIHRoYW4gb3IgZXF1YWwgdGhlIHNwZWNpZmllZCdzLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ30gb3RoZXIgT3RoZXIgdmFsdWVcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBcbiAgTG9uZ1Byb3RvdHlwZS5ncmVhdGVyVGhhbk9yRXF1YWwgPSBmdW5jdGlvbiBncmVhdGVyVGhhbk9yRXF1YWwob3RoZXIpIHtcbiAgICByZXR1cm4gdGhpcy5jb21wKFxuICAgIC8qIHZhbGlkYXRlcyAqL1xuICAgIG90aGVyKSA+PSAwO1xuICB9O1xuICAvKipcbiAgICogVGVzdHMgaWYgdGhpcyBMb25nJ3MgdmFsdWUgaXMgZ3JlYXRlciB0aGFuIG9yIGVxdWFsIHRoZSBzcGVjaWZpZWQncy4gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgTG9uZyNncmVhdGVyVGhhbk9yRXF1YWx9LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfSBvdGhlciBPdGhlciB2YWx1ZVxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5ndGUgPSBMb25nUHJvdG90eXBlLmdyZWF0ZXJUaGFuT3JFcXVhbDtcbiAgLyoqXG4gICAqIFRlc3RzIGlmIHRoaXMgTG9uZydzIHZhbHVlIGlzIGdyZWF0ZXIgdGhhbiBvciBlcXVhbCB0aGUgc3BlY2lmaWVkJ3MuIFRoaXMgaXMgYW4gYWxpYXMgb2Yge0BsaW5rIExvbmcjZ3JlYXRlclRoYW5PckVxdWFsfS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ30gb3RoZXIgT3RoZXIgdmFsdWVcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBcbiAgTG9uZ1Byb3RvdHlwZS5nZSA9IExvbmdQcm90b3R5cGUuZ3JlYXRlclRoYW5PckVxdWFsO1xuICAvKipcbiAgICogQ29tcGFyZXMgdGhpcyBMb25nJ3MgdmFsdWUgd2l0aCB0aGUgc3BlY2lmaWVkJ3MuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfSBvdGhlciBPdGhlciB2YWx1ZVxuICAgKiBAcmV0dXJucyB7bnVtYmVyfSAwIGlmIHRoZXkgYXJlIHRoZSBzYW1lLCAxIGlmIHRoZSB0aGlzIGlzIGdyZWF0ZXIgYW5kIC0xXG4gICAqICBpZiB0aGUgZ2l2ZW4gb25lIGlzIGdyZWF0ZXJcbiAgICovXG4gIFxuICBMb25nUHJvdG90eXBlLmNvbXBhcmUgPSBmdW5jdGlvbiBjb21wYXJlKG90aGVyKSB7XG4gICAgaWYgKCFpc0xvbmcob3RoZXIpKSBvdGhlciA9IGZyb21WYWx1ZShvdGhlcik7XG4gICAgaWYgKHRoaXMuZXEob3RoZXIpKSByZXR1cm4gMDtcbiAgICB2YXIgdGhpc05lZyA9IHRoaXMuaXNOZWdhdGl2ZSgpLFxuICAgICAgICBvdGhlck5lZyA9IG90aGVyLmlzTmVnYXRpdmUoKTtcbiAgICBpZiAodGhpc05lZyAmJiAhb3RoZXJOZWcpIHJldHVybiAtMTtcbiAgICBpZiAoIXRoaXNOZWcgJiYgb3RoZXJOZWcpIHJldHVybiAxOyAvLyBBdCB0aGlzIHBvaW50IHRoZSBzaWduIGJpdHMgYXJlIHRoZSBzYW1lXG4gIFxuICAgIGlmICghdGhpcy51bnNpZ25lZCkgcmV0dXJuIHRoaXMuc3ViKG90aGVyKS5pc05lZ2F0aXZlKCkgPyAtMSA6IDE7IC8vIEJvdGggYXJlIHBvc2l0aXZlIGlmIGF0IGxlYXN0IG9uZSBpcyB1bnNpZ25lZFxuICBcbiAgICByZXR1cm4gb3RoZXIuaGlnaCA+Pj4gMCA+IHRoaXMuaGlnaCA+Pj4gMCB8fCBvdGhlci5oaWdoID09PSB0aGlzLmhpZ2ggJiYgb3RoZXIubG93ID4+PiAwID4gdGhpcy5sb3cgPj4+IDAgPyAtMSA6IDE7XG4gIH07XG4gIC8qKlxuICAgKiBDb21wYXJlcyB0aGlzIExvbmcncyB2YWx1ZSB3aXRoIHRoZSBzcGVjaWZpZWQncy4gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgTG9uZyNjb21wYXJlfS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ30gb3RoZXIgT3RoZXIgdmFsdWVcbiAgICogQHJldHVybnMge251bWJlcn0gMCBpZiB0aGV5IGFyZSB0aGUgc2FtZSwgMSBpZiB0aGUgdGhpcyBpcyBncmVhdGVyIGFuZCAtMVxuICAgKiAgaWYgdGhlIGdpdmVuIG9uZSBpcyBncmVhdGVyXG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUuY29tcCA9IExvbmdQcm90b3R5cGUuY29tcGFyZTtcbiAgLyoqXG4gICAqIE5lZ2F0ZXMgdGhpcyBMb25nJ3MgdmFsdWUuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHJldHVybnMgeyFMb25nfSBOZWdhdGVkIExvbmdcbiAgICovXG4gIFxuICBMb25nUHJvdG90eXBlLm5lZ2F0ZSA9IGZ1bmN0aW9uIG5lZ2F0ZSgpIHtcbiAgICBpZiAoIXRoaXMudW5zaWduZWQgJiYgdGhpcy5lcShNSU5fVkFMVUUpKSByZXR1cm4gTUlOX1ZBTFVFO1xuICAgIHJldHVybiB0aGlzLm5vdCgpLmFkZChPTkUpO1xuICB9O1xuICAvKipcbiAgICogTmVnYXRlcyB0aGlzIExvbmcncyB2YWx1ZS4gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgTG9uZyNuZWdhdGV9LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHJldHVybnMgeyFMb25nfSBOZWdhdGVkIExvbmdcbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5uZWcgPSBMb25nUHJvdG90eXBlLm5lZ2F0ZTtcbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHN1bSBvZiB0aGlzIGFuZCB0aGUgc3BlY2lmaWVkIExvbmcuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfSBhZGRlbmQgQWRkZW5kXG4gICAqIEByZXR1cm5zIHshTG9uZ30gU3VtXG4gICAqL1xuICBcbiAgTG9uZ1Byb3RvdHlwZS5hZGQgPSBmdW5jdGlvbiBhZGQoYWRkZW5kKSB7XG4gICAgaWYgKCFpc0xvbmcoYWRkZW5kKSkgYWRkZW5kID0gZnJvbVZhbHVlKGFkZGVuZCk7IC8vIERpdmlkZSBlYWNoIG51bWJlciBpbnRvIDQgY2h1bmtzIG9mIDE2IGJpdHMsIGFuZCB0aGVuIHN1bSB0aGUgY2h1bmtzLlxuICBcbiAgICB2YXIgYTQ4ID0gdGhpcy5oaWdoID4+PiAxNjtcbiAgICB2YXIgYTMyID0gdGhpcy5oaWdoICYgMHhGRkZGO1xuICAgIHZhciBhMTYgPSB0aGlzLmxvdyA+Pj4gMTY7XG4gICAgdmFyIGEwMCA9IHRoaXMubG93ICYgMHhGRkZGO1xuICAgIHZhciBiNDggPSBhZGRlbmQuaGlnaCA+Pj4gMTY7XG4gICAgdmFyIGIzMiA9IGFkZGVuZC5oaWdoICYgMHhGRkZGO1xuICAgIHZhciBiMTYgPSBhZGRlbmQubG93ID4+PiAxNjtcbiAgICB2YXIgYjAwID0gYWRkZW5kLmxvdyAmIDB4RkZGRjtcbiAgICB2YXIgYzQ4ID0gMCxcbiAgICAgICAgYzMyID0gMCxcbiAgICAgICAgYzE2ID0gMCxcbiAgICAgICAgYzAwID0gMDtcbiAgICBjMDAgKz0gYTAwICsgYjAwO1xuICAgIGMxNiArPSBjMDAgPj4+IDE2O1xuICAgIGMwMCAmPSAweEZGRkY7XG4gICAgYzE2ICs9IGExNiArIGIxNjtcbiAgICBjMzIgKz0gYzE2ID4+PiAxNjtcbiAgICBjMTYgJj0gMHhGRkZGO1xuICAgIGMzMiArPSBhMzIgKyBiMzI7XG4gICAgYzQ4ICs9IGMzMiA+Pj4gMTY7XG4gICAgYzMyICY9IDB4RkZGRjtcbiAgICBjNDggKz0gYTQ4ICsgYjQ4O1xuICAgIGM0OCAmPSAweEZGRkY7XG4gICAgcmV0dXJuIGZyb21CaXRzKGMxNiA8PCAxNiB8IGMwMCwgYzQ4IDw8IDE2IHwgYzMyLCB0aGlzLnVuc2lnbmVkKTtcbiAgfTtcbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGRpZmZlcmVuY2Ugb2YgdGhpcyBhbmQgdGhlIHNwZWNpZmllZCBMb25nLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ30gc3VidHJhaGVuZCBTdWJ0cmFoZW5kXG4gICAqIEByZXR1cm5zIHshTG9uZ30gRGlmZmVyZW5jZVxuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLnN1YnRyYWN0ID0gZnVuY3Rpb24gc3VidHJhY3Qoc3VidHJhaGVuZCkge1xuICAgIGlmICghaXNMb25nKHN1YnRyYWhlbmQpKSBzdWJ0cmFoZW5kID0gZnJvbVZhbHVlKHN1YnRyYWhlbmQpO1xuICAgIHJldHVybiB0aGlzLmFkZChzdWJ0cmFoZW5kLm5lZygpKTtcbiAgfTtcbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGRpZmZlcmVuY2Ugb2YgdGhpcyBhbmQgdGhlIHNwZWNpZmllZCBMb25nLiBUaGlzIGlzIGFuIGFsaWFzIG9mIHtAbGluayBMb25nI3N1YnRyYWN0fS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ30gc3VidHJhaGVuZCBTdWJ0cmFoZW5kXG4gICAqIEByZXR1cm5zIHshTG9uZ30gRGlmZmVyZW5jZVxuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLnN1YiA9IExvbmdQcm90b3R5cGUuc3VidHJhY3Q7XG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBwcm9kdWN0IG9mIHRoaXMgYW5kIHRoZSBzcGVjaWZpZWQgTG9uZy5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxzdHJpbmd9IG11bHRpcGxpZXIgTXVsdGlwbGllclxuICAgKiBAcmV0dXJucyB7IUxvbmd9IFByb2R1Y3RcbiAgICovXG4gIFxuICBMb25nUHJvdG90eXBlLm11bHRpcGx5ID0gZnVuY3Rpb24gbXVsdGlwbHkobXVsdGlwbGllcikge1xuICAgIGlmICh0aGlzLmlzWmVybygpKSByZXR1cm4gdGhpcztcbiAgICBpZiAoIWlzTG9uZyhtdWx0aXBsaWVyKSkgbXVsdGlwbGllciA9IGZyb21WYWx1ZShtdWx0aXBsaWVyKTsgLy8gdXNlIHdhc20gc3VwcG9ydCBpZiBwcmVzZW50XG4gIFxuICAgIGlmICh3YXNtKSB7XG4gICAgICB2YXIgbG93ID0gd2FzbVtcIm11bFwiXSh0aGlzLmxvdywgdGhpcy5oaWdoLCBtdWx0aXBsaWVyLmxvdywgbXVsdGlwbGllci5oaWdoKTtcbiAgICAgIHJldHVybiBmcm9tQml0cyhsb3csIHdhc21bXCJnZXRfaGlnaFwiXSgpLCB0aGlzLnVuc2lnbmVkKTtcbiAgICB9XG4gIFxuICAgIGlmIChtdWx0aXBsaWVyLmlzWmVybygpKSByZXR1cm4gdGhpcy51bnNpZ25lZCA/IFVaRVJPIDogWkVSTztcbiAgICBpZiAodGhpcy5lcShNSU5fVkFMVUUpKSByZXR1cm4gbXVsdGlwbGllci5pc09kZCgpID8gTUlOX1ZBTFVFIDogWkVSTztcbiAgICBpZiAobXVsdGlwbGllci5lcShNSU5fVkFMVUUpKSByZXR1cm4gdGhpcy5pc09kZCgpID8gTUlOX1ZBTFVFIDogWkVSTztcbiAgXG4gICAgaWYgKHRoaXMuaXNOZWdhdGl2ZSgpKSB7XG4gICAgICBpZiAobXVsdGlwbGllci5pc05lZ2F0aXZlKCkpIHJldHVybiB0aGlzLm5lZygpLm11bChtdWx0aXBsaWVyLm5lZygpKTtlbHNlIHJldHVybiB0aGlzLm5lZygpLm11bChtdWx0aXBsaWVyKS5uZWcoKTtcbiAgICB9IGVsc2UgaWYgKG11bHRpcGxpZXIuaXNOZWdhdGl2ZSgpKSByZXR1cm4gdGhpcy5tdWwobXVsdGlwbGllci5uZWcoKSkubmVnKCk7IC8vIElmIGJvdGggbG9uZ3MgYXJlIHNtYWxsLCB1c2UgZmxvYXQgbXVsdGlwbGljYXRpb25cbiAgXG4gIFxuICAgIGlmICh0aGlzLmx0KFRXT19QV1JfMjQpICYmIG11bHRpcGxpZXIubHQoVFdPX1BXUl8yNCkpIHJldHVybiBmcm9tTnVtYmVyKHRoaXMudG9OdW1iZXIoKSAqIG11bHRpcGxpZXIudG9OdW1iZXIoKSwgdGhpcy51bnNpZ25lZCk7IC8vIERpdmlkZSBlYWNoIGxvbmcgaW50byA0IGNodW5rcyBvZiAxNiBiaXRzLCBhbmQgdGhlbiBhZGQgdXAgNHg0IHByb2R1Y3RzLlxuICAgIC8vIFdlIGNhbiBza2lwIHByb2R1Y3RzIHRoYXQgd291bGQgb3ZlcmZsb3cuXG4gIFxuICAgIHZhciBhNDggPSB0aGlzLmhpZ2ggPj4+IDE2O1xuICAgIHZhciBhMzIgPSB0aGlzLmhpZ2ggJiAweEZGRkY7XG4gICAgdmFyIGExNiA9IHRoaXMubG93ID4+PiAxNjtcbiAgICB2YXIgYTAwID0gdGhpcy5sb3cgJiAweEZGRkY7XG4gICAgdmFyIGI0OCA9IG11bHRpcGxpZXIuaGlnaCA+Pj4gMTY7XG4gICAgdmFyIGIzMiA9IG11bHRpcGxpZXIuaGlnaCAmIDB4RkZGRjtcbiAgICB2YXIgYjE2ID0gbXVsdGlwbGllci5sb3cgPj4+IDE2O1xuICAgIHZhciBiMDAgPSBtdWx0aXBsaWVyLmxvdyAmIDB4RkZGRjtcbiAgICB2YXIgYzQ4ID0gMCxcbiAgICAgICAgYzMyID0gMCxcbiAgICAgICAgYzE2ID0gMCxcbiAgICAgICAgYzAwID0gMDtcbiAgICBjMDAgKz0gYTAwICogYjAwO1xuICAgIGMxNiArPSBjMDAgPj4+IDE2O1xuICAgIGMwMCAmPSAweEZGRkY7XG4gICAgYzE2ICs9IGExNiAqIGIwMDtcbiAgICBjMzIgKz0gYzE2ID4+PiAxNjtcbiAgICBjMTYgJj0gMHhGRkZGO1xuICAgIGMxNiArPSBhMDAgKiBiMTY7XG4gICAgYzMyICs9IGMxNiA+Pj4gMTY7XG4gICAgYzE2ICY9IDB4RkZGRjtcbiAgICBjMzIgKz0gYTMyICogYjAwO1xuICAgIGM0OCArPSBjMzIgPj4+IDE2O1xuICAgIGMzMiAmPSAweEZGRkY7XG4gICAgYzMyICs9IGExNiAqIGIxNjtcbiAgICBjNDggKz0gYzMyID4+PiAxNjtcbiAgICBjMzIgJj0gMHhGRkZGO1xuICAgIGMzMiArPSBhMDAgKiBiMzI7XG4gICAgYzQ4ICs9IGMzMiA+Pj4gMTY7XG4gICAgYzMyICY9IDB4RkZGRjtcbiAgICBjNDggKz0gYTQ4ICogYjAwICsgYTMyICogYjE2ICsgYTE2ICogYjMyICsgYTAwICogYjQ4O1xuICAgIGM0OCAmPSAweEZGRkY7XG4gICAgcmV0dXJuIGZyb21CaXRzKGMxNiA8PCAxNiB8IGMwMCwgYzQ4IDw8IDE2IHwgYzMyLCB0aGlzLnVuc2lnbmVkKTtcbiAgfTtcbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHByb2R1Y3Qgb2YgdGhpcyBhbmQgdGhlIHNwZWNpZmllZCBMb25nLiBUaGlzIGlzIGFuIGFsaWFzIG9mIHtAbGluayBMb25nI211bHRpcGx5fS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ30gbXVsdGlwbGllciBNdWx0aXBsaWVyXG4gICAqIEByZXR1cm5zIHshTG9uZ30gUHJvZHVjdFxuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLm11bCA9IExvbmdQcm90b3R5cGUubXVsdGlwbHk7XG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoaXMgTG9uZyBkaXZpZGVkIGJ5IHRoZSBzcGVjaWZpZWQuIFRoZSByZXN1bHQgaXMgc2lnbmVkIGlmIHRoaXMgTG9uZyBpcyBzaWduZWQgb3JcbiAgICogIHVuc2lnbmVkIGlmIHRoaXMgTG9uZyBpcyB1bnNpZ25lZC5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxzdHJpbmd9IGRpdmlzb3IgRGl2aXNvclxuICAgKiBAcmV0dXJucyB7IUxvbmd9IFF1b3RpZW50XG4gICAqL1xuICBcbiAgTG9uZ1Byb3RvdHlwZS5kaXZpZGUgPSBmdW5jdGlvbiBkaXZpZGUoZGl2aXNvcikge1xuICAgIGlmICghaXNMb25nKGRpdmlzb3IpKSBkaXZpc29yID0gZnJvbVZhbHVlKGRpdmlzb3IpO1xuICAgIGlmIChkaXZpc29yLmlzWmVybygpKSB0aHJvdyBFcnJvcignZGl2aXNpb24gYnkgemVybycpOyAvLyB1c2Ugd2FzbSBzdXBwb3J0IGlmIHByZXNlbnRcbiAgXG4gICAgaWYgKHdhc20pIHtcbiAgICAgIC8vIGd1YXJkIGFnYWluc3Qgc2lnbmVkIGRpdmlzaW9uIG92ZXJmbG93OiB0aGUgbGFyZ2VzdFxuICAgICAgLy8gbmVnYXRpdmUgbnVtYmVyIC8gLTEgd291bGQgYmUgMSBsYXJnZXIgdGhhbiB0aGUgbGFyZ2VzdFxuICAgICAgLy8gcG9zaXRpdmUgbnVtYmVyLCBkdWUgdG8gdHdvJ3MgY29tcGxlbWVudC5cbiAgICAgIGlmICghdGhpcy51bnNpZ25lZCAmJiB0aGlzLmhpZ2ggPT09IC0weDgwMDAwMDAwICYmIGRpdmlzb3IubG93ID09PSAtMSAmJiBkaXZpc29yLmhpZ2ggPT09IC0xKSB7XG4gICAgICAgIC8vIGJlIGNvbnNpc3RlbnQgd2l0aCBub24td2FzbSBjb2RlIHBhdGhcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG4gIFxuICAgICAgdmFyIGxvdyA9ICh0aGlzLnVuc2lnbmVkID8gd2FzbVtcImRpdl91XCJdIDogd2FzbVtcImRpdl9zXCJdKSh0aGlzLmxvdywgdGhpcy5oaWdoLCBkaXZpc29yLmxvdywgZGl2aXNvci5oaWdoKTtcbiAgICAgIHJldHVybiBmcm9tQml0cyhsb3csIHdhc21bXCJnZXRfaGlnaFwiXSgpLCB0aGlzLnVuc2lnbmVkKTtcbiAgICB9XG4gIFxuICAgIGlmICh0aGlzLmlzWmVybygpKSByZXR1cm4gdGhpcy51bnNpZ25lZCA/IFVaRVJPIDogWkVSTztcbiAgICB2YXIgYXBwcm94LCByZW0sIHJlcztcbiAgXG4gICAgaWYgKCF0aGlzLnVuc2lnbmVkKSB7XG4gICAgICAvLyBUaGlzIHNlY3Rpb24gaXMgb25seSByZWxldmFudCBmb3Igc2lnbmVkIGxvbmdzIGFuZCBpcyBkZXJpdmVkIGZyb20gdGhlXG4gICAgICAvLyBjbG9zdXJlIGxpYnJhcnkgYXMgYSB3aG9sZS5cbiAgICAgIGlmICh0aGlzLmVxKE1JTl9WQUxVRSkpIHtcbiAgICAgICAgaWYgKGRpdmlzb3IuZXEoT05FKSB8fCBkaXZpc29yLmVxKE5FR19PTkUpKSByZXR1cm4gTUlOX1ZBTFVFOyAvLyByZWNhbGwgdGhhdCAtTUlOX1ZBTFVFID09IE1JTl9WQUxVRVxuICAgICAgICBlbHNlIGlmIChkaXZpc29yLmVxKE1JTl9WQUxVRSkpIHJldHVybiBPTkU7ZWxzZSB7XG4gICAgICAgICAgLy8gQXQgdGhpcyBwb2ludCwgd2UgaGF2ZSB8b3RoZXJ8ID49IDIsIHNvIHx0aGlzL290aGVyfCA8IHxNSU5fVkFMVUV8LlxuICAgICAgICAgIHZhciBoYWxmVGhpcyA9IHRoaXMuc2hyKDEpO1xuICAgICAgICAgIGFwcHJveCA9IGhhbGZUaGlzLmRpdihkaXZpc29yKS5zaGwoMSk7XG4gIFxuICAgICAgICAgIGlmIChhcHByb3guZXEoWkVSTykpIHtcbiAgICAgICAgICAgIHJldHVybiBkaXZpc29yLmlzTmVnYXRpdmUoKSA/IE9ORSA6IE5FR19PTkU7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlbSA9IHRoaXMuc3ViKGRpdmlzb3IubXVsKGFwcHJveCkpO1xuICAgICAgICAgICAgcmVzID0gYXBwcm94LmFkZChyZW0uZGl2KGRpdmlzb3IpKTtcbiAgICAgICAgICAgIHJldHVybiByZXM7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGRpdmlzb3IuZXEoTUlOX1ZBTFVFKSkgcmV0dXJuIHRoaXMudW5zaWduZWQgPyBVWkVSTyA6IFpFUk87XG4gIFxuICAgICAgaWYgKHRoaXMuaXNOZWdhdGl2ZSgpKSB7XG4gICAgICAgIGlmIChkaXZpc29yLmlzTmVnYXRpdmUoKSkgcmV0dXJuIHRoaXMubmVnKCkuZGl2KGRpdmlzb3IubmVnKCkpO1xuICAgICAgICByZXR1cm4gdGhpcy5uZWcoKS5kaXYoZGl2aXNvcikubmVnKCk7XG4gICAgICB9IGVsc2UgaWYgKGRpdmlzb3IuaXNOZWdhdGl2ZSgpKSByZXR1cm4gdGhpcy5kaXYoZGl2aXNvci5uZWcoKSkubmVnKCk7XG4gIFxuICAgICAgcmVzID0gWkVSTztcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVGhlIGFsZ29yaXRobSBiZWxvdyBoYXMgbm90IGJlZW4gbWFkZSBmb3IgdW5zaWduZWQgbG9uZ3MuIEl0J3MgdGhlcmVmb3JlXG4gICAgICAvLyByZXF1aXJlZCB0byB0YWtlIHNwZWNpYWwgY2FyZSBvZiB0aGUgTVNCIHByaW9yIHRvIHJ1bm5pbmcgaXQuXG4gICAgICBpZiAoIWRpdmlzb3IudW5zaWduZWQpIGRpdmlzb3IgPSBkaXZpc29yLnRvVW5zaWduZWQoKTtcbiAgICAgIGlmIChkaXZpc29yLmd0KHRoaXMpKSByZXR1cm4gVVpFUk87XG4gICAgICBpZiAoZGl2aXNvci5ndCh0aGlzLnNocnUoMSkpKSAvLyAxNSA+Pj4gMSA9IDcgOyB3aXRoIGRpdmlzb3IgPSA4IDsgdHJ1ZVxuICAgICAgICByZXR1cm4gVU9ORTtcbiAgICAgIHJlcyA9IFVaRVJPO1xuICAgIH0gLy8gUmVwZWF0IHRoZSBmb2xsb3dpbmcgdW50aWwgdGhlIHJlbWFpbmRlciBpcyBsZXNzIHRoYW4gb3RoZXI6ICBmaW5kIGFcbiAgICAvLyBmbG9hdGluZy1wb2ludCB0aGF0IGFwcHJveGltYXRlcyByZW1haW5kZXIgLyBvdGhlciAqZnJvbSBiZWxvdyosIGFkZCB0aGlzXG4gICAgLy8gaW50byB0aGUgcmVzdWx0LCBhbmQgc3VidHJhY3QgaXQgZnJvbSB0aGUgcmVtYWluZGVyLiAgSXQgaXMgY3JpdGljYWwgdGhhdFxuICAgIC8vIHRoZSBhcHByb3hpbWF0ZSB2YWx1ZSBpcyBsZXNzIHRoYW4gb3IgZXF1YWwgdG8gdGhlIHJlYWwgdmFsdWUgc28gdGhhdCB0aGVcbiAgICAvLyByZW1haW5kZXIgbmV2ZXIgYmVjb21lcyBuZWdhdGl2ZS5cbiAgXG4gIFxuICAgIHJlbSA9IHRoaXM7XG4gIFxuICAgIHdoaWxlIChyZW0uZ3RlKGRpdmlzb3IpKSB7XG4gICAgICAvLyBBcHByb3hpbWF0ZSB0aGUgcmVzdWx0IG9mIGRpdmlzaW9uLiBUaGlzIG1heSBiZSBhIGxpdHRsZSBncmVhdGVyIG9yXG4gICAgICAvLyBzbWFsbGVyIHRoYW4gdGhlIGFjdHVhbCB2YWx1ZS5cbiAgICAgIGFwcHJveCA9IE1hdGgubWF4KDEsIE1hdGguZmxvb3IocmVtLnRvTnVtYmVyKCkgLyBkaXZpc29yLnRvTnVtYmVyKCkpKTsgLy8gV2Ugd2lsbCB0d2VhayB0aGUgYXBwcm94aW1hdGUgcmVzdWx0IGJ5IGNoYW5naW5nIGl0IGluIHRoZSA0OC10aCBkaWdpdCBvclxuICAgICAgLy8gdGhlIHNtYWxsZXN0IG5vbi1mcmFjdGlvbmFsIGRpZ2l0LCB3aGljaGV2ZXIgaXMgbGFyZ2VyLlxuICBcbiAgICAgIHZhciBsb2cyID0gTWF0aC5jZWlsKE1hdGgubG9nKGFwcHJveCkgLyBNYXRoLkxOMiksXG4gICAgICAgICAgZGVsdGEgPSBsb2cyIDw9IDQ4ID8gMSA6IHBvd19kYmwoMiwgbG9nMiAtIDQ4KSxcbiAgICAgICAgICAvLyBEZWNyZWFzZSB0aGUgYXBwcm94aW1hdGlvbiB1bnRpbCBpdCBpcyBzbWFsbGVyIHRoYW4gdGhlIHJlbWFpbmRlci4gIE5vdGVcbiAgICAgIC8vIHRoYXQgaWYgaXQgaXMgdG9vIGxhcmdlLCB0aGUgcHJvZHVjdCBvdmVyZmxvd3MgYW5kIGlzIG5lZ2F0aXZlLlxuICAgICAgYXBwcm94UmVzID0gZnJvbU51bWJlcihhcHByb3gpLFxuICAgICAgICAgIGFwcHJveFJlbSA9IGFwcHJveFJlcy5tdWwoZGl2aXNvcik7XG4gIFxuICAgICAgd2hpbGUgKGFwcHJveFJlbS5pc05lZ2F0aXZlKCkgfHwgYXBwcm94UmVtLmd0KHJlbSkpIHtcbiAgICAgICAgYXBwcm94IC09IGRlbHRhO1xuICAgICAgICBhcHByb3hSZXMgPSBmcm9tTnVtYmVyKGFwcHJveCwgdGhpcy51bnNpZ25lZCk7XG4gICAgICAgIGFwcHJveFJlbSA9IGFwcHJveFJlcy5tdWwoZGl2aXNvcik7XG4gICAgICB9IC8vIFdlIGtub3cgdGhlIGFuc3dlciBjYW4ndCBiZSB6ZXJvLi4uIGFuZCBhY3R1YWxseSwgemVybyB3b3VsZCBjYXVzZVxuICAgICAgLy8gaW5maW5pdGUgcmVjdXJzaW9uIHNpbmNlIHdlIHdvdWxkIG1ha2Ugbm8gcHJvZ3Jlc3MuXG4gIFxuICBcbiAgICAgIGlmIChhcHByb3hSZXMuaXNaZXJvKCkpIGFwcHJveFJlcyA9IE9ORTtcbiAgICAgIHJlcyA9IHJlcy5hZGQoYXBwcm94UmVzKTtcbiAgICAgIHJlbSA9IHJlbS5zdWIoYXBwcm94UmVtKTtcbiAgICB9XG4gIFxuICAgIHJldHVybiByZXM7XG4gIH07XG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoaXMgTG9uZyBkaXZpZGVkIGJ5IHRoZSBzcGVjaWZpZWQuIFRoaXMgaXMgYW4gYWxpYXMgb2Yge0BsaW5rIExvbmcjZGl2aWRlfS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ30gZGl2aXNvciBEaXZpc29yXG4gICAqIEByZXR1cm5zIHshTG9uZ30gUXVvdGllbnRcbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5kaXYgPSBMb25nUHJvdG90eXBlLmRpdmlkZTtcbiAgLyoqXG4gICAqIFJldHVybnMgdGhpcyBMb25nIG1vZHVsbyB0aGUgc3BlY2lmaWVkLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ30gZGl2aXNvciBEaXZpc29yXG4gICAqIEByZXR1cm5zIHshTG9uZ30gUmVtYWluZGVyXG4gICAqL1xuICBcbiAgTG9uZ1Byb3RvdHlwZS5tb2R1bG8gPSBmdW5jdGlvbiBtb2R1bG8oZGl2aXNvcikge1xuICAgIGlmICghaXNMb25nKGRpdmlzb3IpKSBkaXZpc29yID0gZnJvbVZhbHVlKGRpdmlzb3IpOyAvLyB1c2Ugd2FzbSBzdXBwb3J0IGlmIHByZXNlbnRcbiAgXG4gICAgaWYgKHdhc20pIHtcbiAgICAgIHZhciBsb3cgPSAodGhpcy51bnNpZ25lZCA/IHdhc21bXCJyZW1fdVwiXSA6IHdhc21bXCJyZW1fc1wiXSkodGhpcy5sb3csIHRoaXMuaGlnaCwgZGl2aXNvci5sb3csIGRpdmlzb3IuaGlnaCk7XG4gICAgICByZXR1cm4gZnJvbUJpdHMobG93LCB3YXNtW1wiZ2V0X2hpZ2hcIl0oKSwgdGhpcy51bnNpZ25lZCk7XG4gICAgfVxuICBcbiAgICByZXR1cm4gdGhpcy5zdWIodGhpcy5kaXYoZGl2aXNvcikubXVsKGRpdmlzb3IpKTtcbiAgfTtcbiAgLyoqXG4gICAqIFJldHVybnMgdGhpcyBMb25nIG1vZHVsbyB0aGUgc3BlY2lmaWVkLiBUaGlzIGlzIGFuIGFsaWFzIG9mIHtAbGluayBMb25nI21vZHVsb30uXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxzdHJpbmd9IGRpdmlzb3IgRGl2aXNvclxuICAgKiBAcmV0dXJucyB7IUxvbmd9IFJlbWFpbmRlclxuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLm1vZCA9IExvbmdQcm90b3R5cGUubW9kdWxvO1xuICAvKipcbiAgICogUmV0dXJucyB0aGlzIExvbmcgbW9kdWxvIHRoZSBzcGVjaWZpZWQuIFRoaXMgaXMgYW4gYWxpYXMgb2Yge0BsaW5rIExvbmcjbW9kdWxvfS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ30gZGl2aXNvciBEaXZpc29yXG4gICAqIEByZXR1cm5zIHshTG9uZ30gUmVtYWluZGVyXG4gICAqL1xuICBcbiAgTG9uZ1Byb3RvdHlwZS5yZW0gPSBMb25nUHJvdG90eXBlLm1vZHVsbztcbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGJpdHdpc2UgTk9UIG9mIHRoaXMgTG9uZy5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcmV0dXJucyB7IUxvbmd9XG4gICAqL1xuICBcbiAgTG9uZ1Byb3RvdHlwZS5ub3QgPSBmdW5jdGlvbiBub3QoKSB7XG4gICAgcmV0dXJuIGZyb21CaXRzKH50aGlzLmxvdywgfnRoaXMuaGlnaCwgdGhpcy51bnNpZ25lZCk7XG4gIH07XG4gIC8qKlxuICAgKiBSZXR1cm5zIGNvdW50IGxlYWRpbmcgemVyb3Mgb2YgdGhpcyBMb25nLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEByZXR1cm5zIHshbnVtYmVyfVxuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLmNvdW50TGVhZGluZ1plcm9zID0gZnVuY3Rpb24gY291bnRMZWFkaW5nWmVyb3MoKSB7XG4gICAgcmV0dXJuIHRoaXMuaGlnaCA/IE1hdGguY2x6MzIodGhpcy5oaWdoKSA6IE1hdGguY2x6MzIodGhpcy5sb3cpICsgMzI7XG4gIH07XG4gIC8qKlxuICAgKiBSZXR1cm5zIGNvdW50IGxlYWRpbmcgemVyb3MuIFRoaXMgaXMgYW4gYWxpYXMgb2Yge0BsaW5rIExvbmcjY291bnRMZWFkaW5nWmVyb3N9LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHshTG9uZ31cbiAgICogQHJldHVybnMgeyFudW1iZXJ9XG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUuY2x6ID0gTG9uZ1Byb3RvdHlwZS5jb3VudExlYWRpbmdaZXJvcztcbiAgLyoqXG4gICAqIFJldHVybnMgY291bnQgdHJhaWxpbmcgemVyb3Mgb2YgdGhpcyBMb25nLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEByZXR1cm5zIHshbnVtYmVyfVxuICAgKi9cbiAgXG4gIExvbmdQcm90b3R5cGUuY291bnRUcmFpbGluZ1plcm9zID0gZnVuY3Rpb24gY291bnRUcmFpbGluZ1plcm9zKCkge1xuICAgIHJldHVybiB0aGlzLmxvdyA/IGN0ejMyKHRoaXMubG93KSA6IGN0ejMyKHRoaXMuaGlnaCkgKyAzMjtcbiAgfTtcbiAgLyoqXG4gICAqIFJldHVybnMgY291bnQgdHJhaWxpbmcgemVyb3MuIFRoaXMgaXMgYW4gYWxpYXMgb2Yge0BsaW5rIExvbmcjY291bnRUcmFpbGluZ1plcm9zfS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7IUxvbmd9XG4gICAqIEByZXR1cm5zIHshbnVtYmVyfVxuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLmN0eiA9IExvbmdQcm90b3R5cGUuY291bnRUcmFpbGluZ1plcm9zO1xuICAvKipcbiAgICogUmV0dXJucyB0aGUgYml0d2lzZSBBTkQgb2YgdGhpcyBMb25nIGFuZCB0aGUgc3BlY2lmaWVkLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ30gb3RoZXIgT3RoZXIgTG9uZ1xuICAgKiBAcmV0dXJucyB7IUxvbmd9XG4gICAqL1xuICBcbiAgTG9uZ1Byb3RvdHlwZS5hbmQgPSBmdW5jdGlvbiBhbmQob3RoZXIpIHtcbiAgICBpZiAoIWlzTG9uZyhvdGhlcikpIG90aGVyID0gZnJvbVZhbHVlKG90aGVyKTtcbiAgICByZXR1cm4gZnJvbUJpdHModGhpcy5sb3cgJiBvdGhlci5sb3csIHRoaXMuaGlnaCAmIG90aGVyLmhpZ2gsIHRoaXMudW5zaWduZWQpO1xuICB9O1xuICAvKipcbiAgICogUmV0dXJucyB0aGUgYml0d2lzZSBPUiBvZiB0aGlzIExvbmcgYW5kIHRoZSBzcGVjaWZpZWQuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfSBvdGhlciBPdGhlciBMb25nXG4gICAqIEByZXR1cm5zIHshTG9uZ31cbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5vciA9IGZ1bmN0aW9uIG9yKG90aGVyKSB7XG4gICAgaWYgKCFpc0xvbmcob3RoZXIpKSBvdGhlciA9IGZyb21WYWx1ZShvdGhlcik7XG4gICAgcmV0dXJuIGZyb21CaXRzKHRoaXMubG93IHwgb3RoZXIubG93LCB0aGlzLmhpZ2ggfCBvdGhlci5oaWdoLCB0aGlzLnVuc2lnbmVkKTtcbiAgfTtcbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGJpdHdpc2UgWE9SIG9mIHRoaXMgTG9uZyBhbmQgdGhlIGdpdmVuIG9uZS5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxzdHJpbmd9IG90aGVyIE90aGVyIExvbmdcbiAgICogQHJldHVybnMgeyFMb25nfVxuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLnhvciA9IGZ1bmN0aW9uIHhvcihvdGhlcikge1xuICAgIGlmICghaXNMb25nKG90aGVyKSkgb3RoZXIgPSBmcm9tVmFsdWUob3RoZXIpO1xuICAgIHJldHVybiBmcm9tQml0cyh0aGlzLmxvdyBeIG90aGVyLmxvdywgdGhpcy5oaWdoIF4gb3RoZXIuaGlnaCwgdGhpcy51bnNpZ25lZCk7XG4gIH07XG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoaXMgTG9uZyB3aXRoIGJpdHMgc2hpZnRlZCB0byB0aGUgbGVmdCBieSB0aGUgZ2l2ZW4gYW1vdW50LlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEBwYXJhbSB7bnVtYmVyfCFMb25nfSBudW1CaXRzIE51bWJlciBvZiBiaXRzXG4gICAqIEByZXR1cm5zIHshTG9uZ30gU2hpZnRlZCBMb25nXG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUuc2hpZnRMZWZ0ID0gZnVuY3Rpb24gc2hpZnRMZWZ0KG51bUJpdHMpIHtcbiAgICBpZiAoaXNMb25nKG51bUJpdHMpKSBudW1CaXRzID0gbnVtQml0cy50b0ludCgpO1xuICAgIGlmICgobnVtQml0cyAmPSA2MykgPT09IDApIHJldHVybiB0aGlzO2Vsc2UgaWYgKG51bUJpdHMgPCAzMikgcmV0dXJuIGZyb21CaXRzKHRoaXMubG93IDw8IG51bUJpdHMsIHRoaXMuaGlnaCA8PCBudW1CaXRzIHwgdGhpcy5sb3cgPj4+IDMyIC0gbnVtQml0cywgdGhpcy51bnNpZ25lZCk7ZWxzZSByZXR1cm4gZnJvbUJpdHMoMCwgdGhpcy5sb3cgPDwgbnVtQml0cyAtIDMyLCB0aGlzLnVuc2lnbmVkKTtcbiAgfTtcbiAgLyoqXG4gICAqIFJldHVybnMgdGhpcyBMb25nIHdpdGggYml0cyBzaGlmdGVkIHRvIHRoZSBsZWZ0IGJ5IHRoZSBnaXZlbiBhbW91bnQuIFRoaXMgaXMgYW4gYWxpYXMgb2Yge0BsaW5rIExvbmcjc2hpZnRMZWZ0fS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7bnVtYmVyfCFMb25nfSBudW1CaXRzIE51bWJlciBvZiBiaXRzXG4gICAqIEByZXR1cm5zIHshTG9uZ30gU2hpZnRlZCBMb25nXG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUuc2hsID0gTG9uZ1Byb3RvdHlwZS5zaGlmdExlZnQ7XG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoaXMgTG9uZyB3aXRoIGJpdHMgYXJpdGhtZXRpY2FsbHkgc2hpZnRlZCB0byB0aGUgcmlnaHQgYnkgdGhlIGdpdmVuIGFtb3VudC5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcGFyYW0ge251bWJlcnwhTG9uZ30gbnVtQml0cyBOdW1iZXIgb2YgYml0c1xuICAgKiBAcmV0dXJucyB7IUxvbmd9IFNoaWZ0ZWQgTG9uZ1xuICAgKi9cbiAgXG4gIExvbmdQcm90b3R5cGUuc2hpZnRSaWdodCA9IGZ1bmN0aW9uIHNoaWZ0UmlnaHQobnVtQml0cykge1xuICAgIGlmIChpc0xvbmcobnVtQml0cykpIG51bUJpdHMgPSBudW1CaXRzLnRvSW50KCk7XG4gICAgaWYgKChudW1CaXRzICY9IDYzKSA9PT0gMCkgcmV0dXJuIHRoaXM7ZWxzZSBpZiAobnVtQml0cyA8IDMyKSByZXR1cm4gZnJvbUJpdHModGhpcy5sb3cgPj4+IG51bUJpdHMgfCB0aGlzLmhpZ2ggPDwgMzIgLSBudW1CaXRzLCB0aGlzLmhpZ2ggPj4gbnVtQml0cywgdGhpcy51bnNpZ25lZCk7ZWxzZSByZXR1cm4gZnJvbUJpdHModGhpcy5oaWdoID4+IG51bUJpdHMgLSAzMiwgdGhpcy5oaWdoID49IDAgPyAwIDogLTEsIHRoaXMudW5zaWduZWQpO1xuICB9O1xuICAvKipcbiAgICogUmV0dXJucyB0aGlzIExvbmcgd2l0aCBiaXRzIGFyaXRobWV0aWNhbGx5IHNoaWZ0ZWQgdG8gdGhlIHJpZ2h0IGJ5IHRoZSBnaXZlbiBhbW91bnQuIFRoaXMgaXMgYW4gYWxpYXMgb2Yge0BsaW5rIExvbmcjc2hpZnRSaWdodH0uXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0ge251bWJlcnwhTG9uZ30gbnVtQml0cyBOdW1iZXIgb2YgYml0c1xuICAgKiBAcmV0dXJucyB7IUxvbmd9IFNoaWZ0ZWQgTG9uZ1xuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLnNociA9IExvbmdQcm90b3R5cGUuc2hpZnRSaWdodDtcbiAgLyoqXG4gICAqIFJldHVybnMgdGhpcyBMb25nIHdpdGggYml0cyBsb2dpY2FsbHkgc2hpZnRlZCB0byB0aGUgcmlnaHQgYnkgdGhlIGdpdmVuIGFtb3VudC5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcGFyYW0ge251bWJlcnwhTG9uZ30gbnVtQml0cyBOdW1iZXIgb2YgYml0c1xuICAgKiBAcmV0dXJucyB7IUxvbmd9IFNoaWZ0ZWQgTG9uZ1xuICAgKi9cbiAgXG4gIExvbmdQcm90b3R5cGUuc2hpZnRSaWdodFVuc2lnbmVkID0gZnVuY3Rpb24gc2hpZnRSaWdodFVuc2lnbmVkKG51bUJpdHMpIHtcbiAgICBpZiAoaXNMb25nKG51bUJpdHMpKSBudW1CaXRzID0gbnVtQml0cy50b0ludCgpO1xuICAgIGlmICgobnVtQml0cyAmPSA2MykgPT09IDApIHJldHVybiB0aGlzO1xuICAgIGlmIChudW1CaXRzIDwgMzIpIHJldHVybiBmcm9tQml0cyh0aGlzLmxvdyA+Pj4gbnVtQml0cyB8IHRoaXMuaGlnaCA8PCAzMiAtIG51bUJpdHMsIHRoaXMuaGlnaCA+Pj4gbnVtQml0cywgdGhpcy51bnNpZ25lZCk7XG4gICAgaWYgKG51bUJpdHMgPT09IDMyKSByZXR1cm4gZnJvbUJpdHModGhpcy5oaWdoLCAwLCB0aGlzLnVuc2lnbmVkKTtcbiAgICByZXR1cm4gZnJvbUJpdHModGhpcy5oaWdoID4+PiBudW1CaXRzIC0gMzIsIDAsIHRoaXMudW5zaWduZWQpO1xuICB9O1xuICAvKipcbiAgICogUmV0dXJucyB0aGlzIExvbmcgd2l0aCBiaXRzIGxvZ2ljYWxseSBzaGlmdGVkIHRvIHRoZSByaWdodCBieSB0aGUgZ2l2ZW4gYW1vdW50LiBUaGlzIGlzIGFuIGFsaWFzIG9mIHtAbGluayBMb25nI3NoaWZ0UmlnaHRVbnNpZ25lZH0uXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0ge251bWJlcnwhTG9uZ30gbnVtQml0cyBOdW1iZXIgb2YgYml0c1xuICAgKiBAcmV0dXJucyB7IUxvbmd9IFNoaWZ0ZWQgTG9uZ1xuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLnNocnUgPSBMb25nUHJvdG90eXBlLnNoaWZ0UmlnaHRVbnNpZ25lZDtcbiAgLyoqXG4gICAqIFJldHVybnMgdGhpcyBMb25nIHdpdGggYml0cyBsb2dpY2FsbHkgc2hpZnRlZCB0byB0aGUgcmlnaHQgYnkgdGhlIGdpdmVuIGFtb3VudC4gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgTG9uZyNzaGlmdFJpZ2h0VW5zaWduZWR9LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHtudW1iZXJ8IUxvbmd9IG51bUJpdHMgTnVtYmVyIG9mIGJpdHNcbiAgICogQHJldHVybnMgeyFMb25nfSBTaGlmdGVkIExvbmdcbiAgICovXG4gIFxuICBMb25nUHJvdG90eXBlLnNocl91ID0gTG9uZ1Byb3RvdHlwZS5zaGlmdFJpZ2h0VW5zaWduZWQ7XG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoaXMgTG9uZyB3aXRoIGJpdHMgcm90YXRlZCB0byB0aGUgbGVmdCBieSB0aGUgZ2l2ZW4gYW1vdW50LlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEBwYXJhbSB7bnVtYmVyfCFMb25nfSBudW1CaXRzIE51bWJlciBvZiBiaXRzXG4gICAqIEByZXR1cm5zIHshTG9uZ30gUm90YXRlZCBMb25nXG4gICAqL1xuICBcbiAgTG9uZ1Byb3RvdHlwZS5yb3RhdGVMZWZ0ID0gZnVuY3Rpb24gcm90YXRlTGVmdChudW1CaXRzKSB7XG4gICAgdmFyIGI7XG4gICAgaWYgKGlzTG9uZyhudW1CaXRzKSkgbnVtQml0cyA9IG51bUJpdHMudG9JbnQoKTtcbiAgICBpZiAoKG51bUJpdHMgJj0gNjMpID09PSAwKSByZXR1cm4gdGhpcztcbiAgICBpZiAobnVtQml0cyA9PT0gMzIpIHJldHVybiBmcm9tQml0cyh0aGlzLmhpZ2gsIHRoaXMubG93LCB0aGlzLnVuc2lnbmVkKTtcbiAgXG4gICAgaWYgKG51bUJpdHMgPCAzMikge1xuICAgICAgYiA9IDMyIC0gbnVtQml0cztcbiAgICAgIHJldHVybiBmcm9tQml0cyh0aGlzLmxvdyA8PCBudW1CaXRzIHwgdGhpcy5oaWdoID4+PiBiLCB0aGlzLmhpZ2ggPDwgbnVtQml0cyB8IHRoaXMubG93ID4+PiBiLCB0aGlzLnVuc2lnbmVkKTtcbiAgICB9XG4gIFxuICAgIG51bUJpdHMgLT0gMzI7XG4gICAgYiA9IDMyIC0gbnVtQml0cztcbiAgICByZXR1cm4gZnJvbUJpdHModGhpcy5oaWdoIDw8IG51bUJpdHMgfCB0aGlzLmxvdyA+Pj4gYiwgdGhpcy5sb3cgPDwgbnVtQml0cyB8IHRoaXMuaGlnaCA+Pj4gYiwgdGhpcy51bnNpZ25lZCk7XG4gIH07XG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoaXMgTG9uZyB3aXRoIGJpdHMgcm90YXRlZCB0byB0aGUgbGVmdCBieSB0aGUgZ2l2ZW4gYW1vdW50LiBUaGlzIGlzIGFuIGFsaWFzIG9mIHtAbGluayBMb25nI3JvdGF0ZUxlZnR9LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHtudW1iZXJ8IUxvbmd9IG51bUJpdHMgTnVtYmVyIG9mIGJpdHNcbiAgICogQHJldHVybnMgeyFMb25nfSBSb3RhdGVkIExvbmdcbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5yb3RsID0gTG9uZ1Byb3RvdHlwZS5yb3RhdGVMZWZ0O1xuICAvKipcbiAgICogUmV0dXJucyB0aGlzIExvbmcgd2l0aCBiaXRzIHJvdGF0ZWQgdG8gdGhlIHJpZ2h0IGJ5IHRoZSBnaXZlbiBhbW91bnQuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHBhcmFtIHtudW1iZXJ8IUxvbmd9IG51bUJpdHMgTnVtYmVyIG9mIGJpdHNcbiAgICogQHJldHVybnMgeyFMb25nfSBSb3RhdGVkIExvbmdcbiAgICovXG4gIFxuICBMb25nUHJvdG90eXBlLnJvdGF0ZVJpZ2h0ID0gZnVuY3Rpb24gcm90YXRlUmlnaHQobnVtQml0cykge1xuICAgIHZhciBiO1xuICAgIGlmIChpc0xvbmcobnVtQml0cykpIG51bUJpdHMgPSBudW1CaXRzLnRvSW50KCk7XG4gICAgaWYgKChudW1CaXRzICY9IDYzKSA9PT0gMCkgcmV0dXJuIHRoaXM7XG4gICAgaWYgKG51bUJpdHMgPT09IDMyKSByZXR1cm4gZnJvbUJpdHModGhpcy5oaWdoLCB0aGlzLmxvdywgdGhpcy51bnNpZ25lZCk7XG4gIFxuICAgIGlmIChudW1CaXRzIDwgMzIpIHtcbiAgICAgIGIgPSAzMiAtIG51bUJpdHM7XG4gICAgICByZXR1cm4gZnJvbUJpdHModGhpcy5oaWdoIDw8IGIgfCB0aGlzLmxvdyA+Pj4gbnVtQml0cywgdGhpcy5sb3cgPDwgYiB8IHRoaXMuaGlnaCA+Pj4gbnVtQml0cywgdGhpcy51bnNpZ25lZCk7XG4gICAgfVxuICBcbiAgICBudW1CaXRzIC09IDMyO1xuICAgIGIgPSAzMiAtIG51bUJpdHM7XG4gICAgcmV0dXJuIGZyb21CaXRzKHRoaXMubG93IDw8IGIgfCB0aGlzLmhpZ2ggPj4+IG51bUJpdHMsIHRoaXMuaGlnaCA8PCBiIHwgdGhpcy5sb3cgPj4+IG51bUJpdHMsIHRoaXMudW5zaWduZWQpO1xuICB9O1xuICAvKipcbiAgICogUmV0dXJucyB0aGlzIExvbmcgd2l0aCBiaXRzIHJvdGF0ZWQgdG8gdGhlIHJpZ2h0IGJ5IHRoZSBnaXZlbiBhbW91bnQuIFRoaXMgaXMgYW4gYWxpYXMgb2Yge0BsaW5rIExvbmcjcm90YXRlUmlnaHR9LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHtudW1iZXJ8IUxvbmd9IG51bUJpdHMgTnVtYmVyIG9mIGJpdHNcbiAgICogQHJldHVybnMgeyFMb25nfSBSb3RhdGVkIExvbmdcbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5yb3RyID0gTG9uZ1Byb3RvdHlwZS5yb3RhdGVSaWdodDtcbiAgLyoqXG4gICAqIENvbnZlcnRzIHRoaXMgTG9uZyB0byBzaWduZWQuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHJldHVybnMgeyFMb25nfSBTaWduZWQgbG9uZ1xuICAgKi9cbiAgXG4gIExvbmdQcm90b3R5cGUudG9TaWduZWQgPSBmdW5jdGlvbiB0b1NpZ25lZCgpIHtcbiAgICBpZiAoIXRoaXMudW5zaWduZWQpIHJldHVybiB0aGlzO1xuICAgIHJldHVybiBmcm9tQml0cyh0aGlzLmxvdywgdGhpcy5oaWdoLCBmYWxzZSk7XG4gIH07XG4gIC8qKlxuICAgKiBDb252ZXJ0cyB0aGlzIExvbmcgdG8gdW5zaWduZWQuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHJldHVybnMgeyFMb25nfSBVbnNpZ25lZCBsb25nXG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUudG9VbnNpZ25lZCA9IGZ1bmN0aW9uIHRvVW5zaWduZWQoKSB7XG4gICAgaWYgKHRoaXMudW5zaWduZWQpIHJldHVybiB0aGlzO1xuICAgIHJldHVybiBmcm9tQml0cyh0aGlzLmxvdywgdGhpcy5oaWdoLCB0cnVlKTtcbiAgfTtcbiAgLyoqXG4gICAqIENvbnZlcnRzIHRoaXMgTG9uZyB0byBpdHMgYnl0ZSByZXByZXNlbnRhdGlvbi5cbiAgICogQHBhcmFtIHtib29sZWFuPX0gbGUgV2hldGhlciBsaXR0bGUgb3IgYmlnIGVuZGlhbiwgZGVmYXVsdHMgdG8gYmlnIGVuZGlhblxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEByZXR1cm5zIHshQXJyYXkuPG51bWJlcj59IEJ5dGUgcmVwcmVzZW50YXRpb25cbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS50b0J5dGVzID0gZnVuY3Rpb24gdG9CeXRlcyhsZSkge1xuICAgIHJldHVybiBsZSA/IHRoaXMudG9CeXRlc0xFKCkgOiB0aGlzLnRvQnl0ZXNCRSgpO1xuICB9O1xuICAvKipcbiAgICogQ29udmVydHMgdGhpcyBMb25nIHRvIGl0cyBsaXR0bGUgZW5kaWFuIGJ5dGUgcmVwcmVzZW50YXRpb24uXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHJldHVybnMgeyFBcnJheS48bnVtYmVyPn0gTGl0dGxlIGVuZGlhbiBieXRlIHJlcHJlc2VudGF0aW9uXG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUudG9CeXRlc0xFID0gZnVuY3Rpb24gdG9CeXRlc0xFKCkge1xuICAgIHZhciBoaSA9IHRoaXMuaGlnaCxcbiAgICAgICAgbG8gPSB0aGlzLmxvdztcbiAgICByZXR1cm4gW2xvICYgMHhmZiwgbG8gPj4+IDggJiAweGZmLCBsbyA+Pj4gMTYgJiAweGZmLCBsbyA+Pj4gMjQsIGhpICYgMHhmZiwgaGkgPj4+IDggJiAweGZmLCBoaSA+Pj4gMTYgJiAweGZmLCBoaSA+Pj4gMjRdO1xuICB9O1xuICAvKipcbiAgICogQ29udmVydHMgdGhpcyBMb25nIHRvIGl0cyBiaWcgZW5kaWFuIGJ5dGUgcmVwcmVzZW50YXRpb24uXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHJldHVybnMgeyFBcnJheS48bnVtYmVyPn0gQmlnIGVuZGlhbiBieXRlIHJlcHJlc2VudGF0aW9uXG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUudG9CeXRlc0JFID0gZnVuY3Rpb24gdG9CeXRlc0JFKCkge1xuICAgIHZhciBoaSA9IHRoaXMuaGlnaCxcbiAgICAgICAgbG8gPSB0aGlzLmxvdztcbiAgICByZXR1cm4gW2hpID4+PiAyNCwgaGkgPj4+IDE2ICYgMHhmZiwgaGkgPj4+IDggJiAweGZmLCBoaSAmIDB4ZmYsIGxvID4+PiAyNCwgbG8gPj4+IDE2ICYgMHhmZiwgbG8gPj4+IDggJiAweGZmLCBsbyAmIDB4ZmZdO1xuICB9O1xuICAvKipcbiAgICogQ3JlYXRlcyBhIExvbmcgZnJvbSBpdHMgYnl0ZSByZXByZXNlbnRhdGlvbi5cbiAgICogQHBhcmFtIHshQXJyYXkuPG51bWJlcj59IGJ5dGVzIEJ5dGUgcmVwcmVzZW50YXRpb25cbiAgICogQHBhcmFtIHtib29sZWFuPX0gdW5zaWduZWQgV2hldGhlciB1bnNpZ25lZCBvciBub3QsIGRlZmF1bHRzIHRvIHNpZ25lZFxuICAgKiBAcGFyYW0ge2Jvb2xlYW49fSBsZSBXaGV0aGVyIGxpdHRsZSBvciBiaWcgZW5kaWFuLCBkZWZhdWx0cyB0byBiaWcgZW5kaWFuXG4gICAqIEByZXR1cm5zIHtMb25nfSBUaGUgY29ycmVzcG9uZGluZyBMb25nIHZhbHVlXG4gICAqL1xuICBcbiAgXG4gIExvbmcuZnJvbUJ5dGVzID0gZnVuY3Rpb24gZnJvbUJ5dGVzKGJ5dGVzLCB1bnNpZ25lZCwgbGUpIHtcbiAgICByZXR1cm4gbGUgPyBMb25nLmZyb21CeXRlc0xFKGJ5dGVzLCB1bnNpZ25lZCkgOiBMb25nLmZyb21CeXRlc0JFKGJ5dGVzLCB1bnNpZ25lZCk7XG4gIH07XG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgTG9uZyBmcm9tIGl0cyBsaXR0bGUgZW5kaWFuIGJ5dGUgcmVwcmVzZW50YXRpb24uXG4gICAqIEBwYXJhbSB7IUFycmF5LjxudW1iZXI+fSBieXRlcyBMaXR0bGUgZW5kaWFuIGJ5dGUgcmVwcmVzZW50YXRpb25cbiAgICogQHBhcmFtIHtib29sZWFuPX0gdW5zaWduZWQgV2hldGhlciB1bnNpZ25lZCBvciBub3QsIGRlZmF1bHRzIHRvIHNpZ25lZFxuICAgKiBAcmV0dXJucyB7TG9uZ30gVGhlIGNvcnJlc3BvbmRpbmcgTG9uZyB2YWx1ZVxuICAgKi9cbiAgXG4gIFxuICBMb25nLmZyb21CeXRlc0xFID0gZnVuY3Rpb24gZnJvbUJ5dGVzTEUoYnl0ZXMsIHVuc2lnbmVkKSB7XG4gICAgcmV0dXJuIG5ldyBMb25nKGJ5dGVzWzBdIHwgYnl0ZXNbMV0gPDwgOCB8IGJ5dGVzWzJdIDw8IDE2IHwgYnl0ZXNbM10gPDwgMjQsIGJ5dGVzWzRdIHwgYnl0ZXNbNV0gPDwgOCB8IGJ5dGVzWzZdIDw8IDE2IHwgYnl0ZXNbN10gPDwgMjQsIHVuc2lnbmVkKTtcbiAgfTtcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBMb25nIGZyb20gaXRzIGJpZyBlbmRpYW4gYnl0ZSByZXByZXNlbnRhdGlvbi5cbiAgICogQHBhcmFtIHshQXJyYXkuPG51bWJlcj59IGJ5dGVzIEJpZyBlbmRpYW4gYnl0ZSByZXByZXNlbnRhdGlvblxuICAgKiBAcGFyYW0ge2Jvb2xlYW49fSB1bnNpZ25lZCBXaGV0aGVyIHVuc2lnbmVkIG9yIG5vdCwgZGVmYXVsdHMgdG8gc2lnbmVkXG4gICAqIEByZXR1cm5zIHtMb25nfSBUaGUgY29ycmVzcG9uZGluZyBMb25nIHZhbHVlXG4gICAqL1xuICBcbiAgXG4gIExvbmcuZnJvbUJ5dGVzQkUgPSBmdW5jdGlvbiBmcm9tQnl0ZXNCRShieXRlcywgdW5zaWduZWQpIHtcbiAgICByZXR1cm4gbmV3IExvbmcoYnl0ZXNbNF0gPDwgMjQgfCBieXRlc1s1XSA8PCAxNiB8IGJ5dGVzWzZdIDw8IDggfCBieXRlc1s3XSwgYnl0ZXNbMF0gPDwgMjQgfCBieXRlc1sxXSA8PCAxNiB8IGJ5dGVzWzJdIDw8IDggfCBieXRlc1szXSwgdW5zaWduZWQpO1xuICB9O1xuICBcbiAgdmFyIF9kZWZhdWx0ID0gTG9uZztcbiAgZXhwb3J0cy5kZWZhdWx0ID0gX2RlZmF1bHQ7XG4gIHJldHVybiBcImRlZmF1bHRcIiBpbiBleHBvcnRzID8gZXhwb3J0cy5kZWZhdWx0IDogZXhwb3J0cztcbn0pKHt9KTtcbmlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIGRlZmluZShbXSwgZnVuY3Rpb24oKSB7IHJldHVybiBMb25nOyB9KTtcbmVsc2UgaWYgKHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnICYmIHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JykgbW9kdWxlLmV4cG9ydHMgPSBMb25nO1xuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSAobW9kdWxlKSA9PiB7XG5cdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuXHRcdCgpID0+IChtb2R1bGVbJ2RlZmF1bHQnXSkgOlxuXHRcdCgpID0+IChtb2R1bGUpO1xuXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCB7IGE6IGdldHRlciB9KTtcblx0cmV0dXJuIGdldHRlcjtcbn07IiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsIlxuY29uc3QgYXBpID0gcmVxdWlyZSgnQHRlbXBvcmFsaW8vd29ya2Zsb3cvbGliL3dvcmtlci1pbnRlcmZhY2UuanMnKTtcbmV4cG9ydHMuYXBpID0gYXBpO1xuXG5jb25zdCB7IG92ZXJyaWRlR2xvYmFscyB9ID0gcmVxdWlyZSgnQHRlbXBvcmFsaW8vd29ya2Zsb3cvbGliL2dsb2JhbC1vdmVycmlkZXMuanMnKTtcbm92ZXJyaWRlR2xvYmFscygpO1xuXG5leHBvcnRzLmltcG9ydFdvcmtmbG93cyA9IGZ1bmN0aW9uIGltcG9ydFdvcmtmbG93cygpIHtcbiAgcmV0dXJuIHJlcXVpcmUoLyogd2VicGFja01vZGU6IFwiZWFnZXJcIiAqLyBcIi9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3JvYmhvbGxhbmQvZmluYW5jZS1kZW1vL3dvcmtmbG93cy9zcmMvc2NlbmFyaW8tMy50c1wiKTtcbn1cblxuZXhwb3J0cy5pbXBvcnRJbnRlcmNlcHRvcnMgPSBmdW5jdGlvbiBpbXBvcnRJbnRlcmNlcHRvcnMoKSB7XG4gIHJldHVybiBbXG4gICAgXG4gIF07XG59XG4iXSwibmFtZXMiOlsicHJveHlBY3Rpdml0aWVzIiwiY2hhcmdlQ2FyZCIsInJlc2VydmVTdG9jayIsInNoaXBJdGVtIiwic2VuZFJlY2VpcHQiLCJzZW5kQ2hhcmdlRmFpbHVyZUVtYWlsIiwic3RhcnRUb0Nsb3NlVGltZW91dCIsInJldHJ5IiwibWF4aW11bUF0dGVtcHRzIiwiUHVyY2hhc2VXb3JrZmxvdyIsImlucHV0IiwiY3VzdG9tZXJFbWFpbCIsInByb2R1Y3ROYW1lIiwiYW1vdW50Iiwic2hpcHBpbmdBZGRyZXNzIiwiZXJyb3IiXSwic291cmNlUm9vdCI6IiJ9