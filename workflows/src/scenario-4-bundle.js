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

/***/ "./src/scenario-4.ts":
/*!***************************!*\
  !*** ./src/scenario-4.ts ***!
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
        initialInterval: '1 second',
        backoffCoefficient: 1
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
  !*** ./src/scenario-4-autogenerated-entrypoint.cjs ***!
  \*****************************************************/

const api = __webpack_require__(/*! @temporalio/workflow/lib/worker-interface.js */ "./node_modules/@temporalio/workflow/lib/worker-interface.js");
exports.api = api;

const { overrideGlobals } = __webpack_require__(/*! @temporalio/workflow/lib/global-overrides.js */ "./node_modules/@temporalio/workflow/lib/global-overrides.js");
overrideGlobals();

exports.importWorkflows = function importWorkflows() {
  return __webpack_require__(/* webpackMode: "eager" */ /*! ./src/scenario-4.ts */ "./src/scenario-4.ts");
}

exports.importInterceptors = function importInterceptors() {
  return [
    
  ];
}

})();

__TEMPORAL__ = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2Zsb3ctYnVuZGxlLWZiNzA2NTUxZDUxZWNiY2MwMjQ3LmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBRUEsMEhBQThDO0FBSTlDLDBFQUEwRTtBQUMxRSxpRUFBaUU7QUFDakUsSUFBWSx3QkFJWDtBQUpELFdBQVksd0JBQXdCO0lBQ2xDLG1GQUFjO0lBQ2QscUhBQStCO0lBQy9CLDZFQUFXO0FBQ2IsQ0FBQyxFQUpXLHdCQUF3Qix3Q0FBeEIsd0JBQXdCLFFBSW5DO0FBRUQsK0JBQVksR0FBZ0YsQ0FBQztBQUM3RiwrQkFBWSxHQUFnRixDQUFDOzs7Ozs7Ozs7Ozs7Ozs7QUNmN0YsbUpBQWdGO0FBRWhGLG1KQUFnRjtBQTREaEY7Ozs7R0FJRztBQUNVLCtCQUF1QixHQUFxQixJQUFJLDJDQUF1QixFQUFFLENBQUM7QUFFdkY7O0dBRUc7QUFDVSw0QkFBb0IsR0FBd0I7SUFDdkQsZ0JBQWdCLEVBQUUsMkNBQXVCO0lBQ3pDLGdCQUFnQixFQUFFLCtCQUF1QjtJQUN6QyxhQUFhLEVBQUUsRUFBRTtDQUNsQixDQUFDOzs7Ozs7Ozs7Ozs7Ozs7QUM1RUYsNEdBYW9CO0FBQ3BCLDJIQUEwQztBQUMxQyxtR0FBeUM7QUFDekMsbUpBQTJHO0FBRTNHLFNBQVMsYUFBYSxDQUFDLEdBQUcsT0FBaUI7SUFDekMsT0FBTyxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3JFLENBQUM7QUFFRDs7R0FFRztBQUNILE1BQU0scUJBQXFCLEdBQUcsYUFBYTtBQUN6Qyx5QkFBeUI7QUFDekIsdUZBQXVGO0FBQ3ZGLDBCQUEwQjtBQUMxQixrR0FBa0c7QUFDbEcsdUNBQXVDO0FBQ3ZDLDJEQUEyRCxDQUM1RCxDQUFDO0FBRUY7OztHQUdHO0FBQ0gsTUFBTSw2QkFBNkIsR0FBRyxhQUFh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O0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaLGVBQWU7QUFDZjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWixlQUFl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RUEsdUJBQXVCO0FBQ3ZCLFNBQVMsbUJBQU8sNEJBQTRCLGdEQUE0RjtBQUN4STs7QUFFQSwwQkFBMEI7QUFDMUI7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzIjpbIi9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3JvYmhvbGxhbmQvZmluYW5jZS1kZW1vL3dvcmtmbG93cy9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vY29tbW9uL3NyYy9hY3Rpdml0eS1vcHRpb25zLnRzIiwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vcm9iaG9sbGFuZC9maW5hbmNlLWRlbW8vd29ya2Zsb3dzL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby9jb21tb24vc3JjL2NvbnZlcnRlci9kYXRhLWNvbnZlcnRlci50cyIsIi9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3JvYmhvbGxhbmQvZmluYW5jZS1kZW1vL3dvcmtmbG93cy9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vY29tbW9uL3NyYy9jb252ZXJ0ZXIvZmFpbHVyZS1jb252ZXJ0ZXIudHMiLCIvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS9yb2Job2xsYW5kL2ZpbmFuY2UtZGVtby93b3JrZmxvd3Mvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL2NvbW1vbi9zcmMvY29udmVydGVyL3BheWxvYWQtY29kZWMudHMiLCIvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS9yb2Job2xsYW5kL2ZpbmFuY2UtZGVtby93b3JrZmxvd3Mvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL2NvbW1vbi9zcmMvY29udmVydGVyL3BheWxvYWQtY29udmVydGVyLnRzIiwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vcm9iaG9sbGFuZC9maW5hbmNlLWRlbW8vd29ya2Zsb3dzL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby9jb21tb24vc3JjL2NvbnZlcnRlci90eXBlcy50cyIsIi9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3JvYmhvbGxhbmQvZmluYW5jZS1kZW1vL3dvcmtmbG93cy9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vY29tbW9uL3NyYy9kZXByZWNhdGVkLXRpbWUudHMiLCIvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS9yb2Job2xsYW5kL2ZpbmFuY2UtZGVtby93b3JrZmxvd3Mvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL2NvbW1vbi9zcmMvZW5jb2RpbmcudHMiLCIvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS9yb2Job2xsYW5kL2ZpbmFuY2UtZGVtby93b3JrZmxvd3Mvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL2NvbW1vbi9zcmMvZXJyb3JzLnRzIiwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vcm9iaG9sbGFuZC9maW5hbmNlLWRlbW8vd29ya2Zsb3dzL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby9jb21tb24vc3JjL2ZhaWx1cmUudHMiLCIvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS9yb2Job2xsYW5kL2ZpbmFuY2UtZGVtby93b3JrZmxvd3Mvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL2NvbW1vbi9zcmMvaW5kZXgudHMiLCIvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS9yb2Job2xsYW5kL2ZpbmFuY2UtZGVtby93b3JrZmxvd3Mvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL2NvbW1vbi9zcmMvaW50ZXJjZXB0b3JzLnRzIiwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vcm9iaG9sbGFuZC9maW5hbmNlLWRlbW8vd29ya2Zsb3dzL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby9jb21tb24vc3JjL2ludGVyZmFjZXMudHMiLCIvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS9yb2Job2xsYW5kL2ZpbmFuY2UtZGVtby93b3JrZmxvd3Mvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL2NvbW1vbi9zcmMvbG9nZ2VyLnRzIiwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vcm9iaG9sbGFuZC9maW5hbmNlLWRlbW8vd29ya2Zsb3dzL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby9jb21tb24vc3JjL3JldHJ5LXBvbGljeS50cyIsIi9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3JvYmhvbGxhbmQvZmluYW5jZS1kZW1vL3dvcmtmbG93cy9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vY29tbW9uL3NyYy90aW1lLnRzIiwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vcm9iaG9sbGFuZC9maW5hbmNlLWRlbW8vd29ya2Zsb3dzL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby9jb21tb24vc3JjL3R5cGUtaGVscGVycy50cyIsIi9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3JvYmhvbGxhbmQvZmluYW5jZS1kZW1vL3dvcmtmbG93cy9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vY29tbW9uL3NyYy92ZXJzaW9uaW5nLWludGVudC1lbnVtLnRzIiwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vcm9iaG9sbGFuZC9maW5hbmNlLWRlbW8vd29ya2Zsb3dzL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby9jb21tb24vc3JjL3ZlcnNpb25pbmctaW50ZW50LnRzIiwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vcm9iaG9sbGFuZC9maW5hbmNlLWRlbW8vd29ya2Zsb3dzL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby9jb21tb24vc3JjL3dvcmtmbG93LWhhbmRsZS50cyIsIi9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3JvYmhvbGxhbmQvZmluYW5jZS1kZW1vL3dvcmtmbG93cy9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vY29tbW9uL3NyYy93b3JrZmxvdy1vcHRpb25zLnRzIiwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vcm9iaG9sbGFuZC9maW5hbmNlLWRlbW8vd29ya2Zsb3dzL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby93b3JrZmxvdy9zcmMvYWxlYS50cyIsIi9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3JvYmhvbGxhbmQvZmluYW5jZS1kZW1vL3dvcmtmbG93cy9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vd29ya2Zsb3cvc3JjL2NhbmNlbGxhdGlvbi1zY29wZS50cyIsIi9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3JvYmhvbGxhbmQvZmluYW5jZS1kZW1vL3dvcmtmbG93cy9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vd29ya2Zsb3cvc3JjL2Vycm9ycy50cyIsIi9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3JvYmhvbGxhbmQvZmluYW5jZS1kZW1vL3dvcmtmbG93cy9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vd29ya2Zsb3cvc3JjL2ZsYWdzLnRzIiwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vcm9iaG9sbGFuZC9maW5hbmNlLWRlbW8vd29ya2Zsb3dzL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby93b3JrZmxvdy9zcmMvZ2xvYmFsLWF0dHJpYnV0ZXMudHMiLCIvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS9yb2Job2xsYW5kL2ZpbmFuY2UtZGVtby93b3JrZmxvd3Mvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL3dvcmtmbG93L3NyYy9nbG9iYWwtb3ZlcnJpZGVzLnRzIiwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vcm9iaG9sbGFuZC9maW5hbmNlLWRlbW8vd29ya2Zsb3dzL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby93b3JrZmxvdy9zcmMvaW5kZXgudHMiLCIvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS9yb2Job2xsYW5kL2ZpbmFuY2UtZGVtby93b3JrZmxvd3Mvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL3dvcmtmbG93L3NyYy9pbnRlcmNlcHRvcnMudHMiLCIvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS9yb2Job2xsYW5kL2ZpbmFuY2UtZGVtby93b3JrZmxvd3Mvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL3dvcmtmbG93L3NyYy9pbnRlcmZhY2VzLnRzIiwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vcm9iaG9sbGFuZC9maW5hbmNlLWRlbW8vd29ya2Zsb3dzL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby93b3JrZmxvdy9zcmMvaW50ZXJuYWxzLnRzIiwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vcm9iaG9sbGFuZC9maW5hbmNlLWRlbW8vd29ya2Zsb3dzL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby93b3JrZmxvdy9zcmMvbG9ncy50cyIsIi9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3JvYmhvbGxhbmQvZmluYW5jZS1kZW1vL3dvcmtmbG93cy9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vd29ya2Zsb3cvc3JjL3BrZy50cyIsIi9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3JvYmhvbGxhbmQvZmluYW5jZS1kZW1vL3dvcmtmbG93cy9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vd29ya2Zsb3cvc3JjL3NpbmtzLnRzIiwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vcm9iaG9sbGFuZC9maW5hbmNlLWRlbW8vd29ya2Zsb3dzL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby93b3JrZmxvdy9zcmMvc3RhY2staGVscGVycy50cyIsIi9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3JvYmhvbGxhbmQvZmluYW5jZS1kZW1vL3dvcmtmbG93cy9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vd29ya2Zsb3cvc3JjL3RyaWdnZXIudHMiLCIvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS9yb2Job2xsYW5kL2ZpbmFuY2UtZGVtby93b3JrZmxvd3Mvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL3dvcmtmbG93L3NyYy91cGRhdGUtc2NvcGUudHMiLCIvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS9yb2Job2xsYW5kL2ZpbmFuY2UtZGVtby93b3JrZmxvd3Mvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL3dvcmtmbG93L3NyYy93b3JrZXItaW50ZXJmYWNlLnRzIiwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vcm9iaG9sbGFuZC9maW5hbmNlLWRlbW8vd29ya2Zsb3dzL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby93b3JrZmxvdy9zcmMvd29ya2Zsb3cudHMiLCIvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS9yb2Job2xsYW5kL2ZpbmFuY2UtZGVtby93b3JrZmxvd3Mvc3JjL3NjZW5hcmlvLTQudHMiLCJpZ25vcmVkfC9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3JvYmhvbGxhbmQvZmluYW5jZS1kZW1vL3dvcmtmbG93cy9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vd29ya2Zsb3cvbGlifF9fdGVtcG9yYWxfY3VzdG9tX2ZhaWx1cmVfY29udmVydGVyIiwiaWdub3JlZHwvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS9yb2Job2xsYW5kL2ZpbmFuY2UtZGVtby93b3JrZmxvd3Mvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL3dvcmtmbG93L2xpYnxfX3RlbXBvcmFsX2N1c3RvbV9wYXlsb2FkX2NvbnZlcnRlciIsIi9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3JvYmhvbGxhbmQvZmluYW5jZS1kZW1vL3dvcmtmbG93cy9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vY29tbW9uL25vZGVfbW9kdWxlcy9tcy9kaXN0L2luZGV4LmNqcyIsIi9Vc2Vycy9yb2Job2xsYW5kL0RldmVsb3Blci9naXRodWIuY29tL3JvYmhvbGxhbmQvZmluYW5jZS1kZW1vL3dvcmtmbG93cy9ub2RlX21vZHVsZXMvbG9uZy91bWQvaW5kZXguanMiLCJ3ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2svcnVudGltZS9jb21wYXQgZ2V0IGRlZmF1bHQgZXhwb3J0Iiwid2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCIvVXNlcnMvcm9iaG9sbGFuZC9EZXZlbG9wZXIvZ2l0aHViLmNvbS9yb2Job2xsYW5kL2ZpbmFuY2UtZGVtby93b3JrZmxvd3Mvc3JjL3NjZW5hcmlvLTQtYXV0b2dlbmVyYXRlZC1lbnRyeXBvaW50LmNqcyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IGNvcmVzZGsgfSBmcm9tICdAdGVtcG9yYWxpby9wcm90byc7XG5pbXBvcnQgeyBSZXRyeVBvbGljeSB9IGZyb20gJy4vcmV0cnktcG9saWN5JztcbmltcG9ydCB7IGNoZWNrRXh0ZW5kcyB9IGZyb20gJy4vdHlwZS1oZWxwZXJzJztcbmltcG9ydCB7IER1cmF0aW9uIH0gZnJvbSAnLi90aW1lJztcbmltcG9ydCB7IFZlcnNpb25pbmdJbnRlbnQgfSBmcm9tICcuL3ZlcnNpb25pbmctaW50ZW50JztcblxuLy8gQXZvaWQgaW1wb3J0aW5nIHRoZSBwcm90byBpbXBsZW1lbnRhdGlvbiB0byByZWR1Y2Ugd29ya2Zsb3cgYnVuZGxlIHNpemVcbi8vIENvcGllZCBmcm9tIGNvcmVzZGsud29ya2Zsb3dfY29tbWFuZHMuQWN0aXZpdHlDYW5jZWxsYXRpb25UeXBlXG5leHBvcnQgZW51bSBBY3Rpdml0eUNhbmNlbGxhdGlvblR5cGUge1xuICBUUllfQ0FOQ0VMID0gMCxcbiAgV0FJVF9DQU5DRUxMQVRJT05fQ09NUExFVEVEID0gMSxcbiAgQUJBTkRPTiA9IDIsXG59XG5cbmNoZWNrRXh0ZW5kczxjb3Jlc2RrLndvcmtmbG93X2NvbW1hbmRzLkFjdGl2aXR5Q2FuY2VsbGF0aW9uVHlwZSwgQWN0aXZpdHlDYW5jZWxsYXRpb25UeXBlPigpO1xuY2hlY2tFeHRlbmRzPEFjdGl2aXR5Q2FuY2VsbGF0aW9uVHlwZSwgY29yZXNkay53b3JrZmxvd19jb21tYW5kcy5BY3Rpdml0eUNhbmNlbGxhdGlvblR5cGU+KCk7XG5cbi8qKlxuICogT3B0aW9ucyBmb3IgcmVtb3RlIGFjdGl2aXR5IGludm9jYXRpb25cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBY3Rpdml0eU9wdGlvbnMge1xuICAvKipcbiAgICogSWRlbnRpZmllciB0byB1c2UgZm9yIHRyYWNraW5nIHRoZSBhY3Rpdml0eSBpbiBXb3JrZmxvdyBoaXN0b3J5LlxuICAgKiBUaGUgYGFjdGl2aXR5SWRgIGNhbiBiZSBhY2Nlc3NlZCBieSB0aGUgYWN0aXZpdHkgZnVuY3Rpb24uXG4gICAqIERvZXMgbm90IG5lZWQgdG8gYmUgdW5pcXVlLlxuICAgKlxuICAgKiBAZGVmYXVsdCBhbiBpbmNyZW1lbnRhbCBzZXF1ZW5jZSBudW1iZXJcbiAgICovXG4gIGFjdGl2aXR5SWQ/OiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIFRhc2sgcXVldWUgbmFtZS5cbiAgICpcbiAgICogQGRlZmF1bHQgY3VycmVudCB3b3JrZXIgdGFzayBxdWV1ZVxuICAgKi9cbiAgdGFza1F1ZXVlPzogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBIZWFydGJlYXQgaW50ZXJ2YWwuIEFjdGl2aXR5IG11c3QgaGVhcnRiZWF0IGJlZm9yZSB0aGlzIGludGVydmFsIHBhc3NlcyBhZnRlciBhIGxhc3QgaGVhcnRiZWF0IG9yIGFjdGl2aXR5IHN0YXJ0LlxuICAgKiBAZm9ybWF0IG51bWJlciBvZiBtaWxsaXNlY29uZHMgb3Ige0BsaW5rIGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL21zIHwgbXMtZm9ybWF0dGVkIHN0cmluZ31cbiAgICovXG4gIGhlYXJ0YmVhdFRpbWVvdXQ/OiBEdXJhdGlvbjtcblxuICAvKipcbiAgICogUmV0cnlQb2xpY3kgdGhhdCBkZWZpbmUgaG93IGFjdGl2aXR5IGlzIHJldHJpZWQgaW4gY2FzZSBvZiBmYWlsdXJlLiBJZiB0aGlzIGlzIG5vdCBzZXQsIHRoZW4gdGhlIHNlcnZlci1kZWZpbmVkIGRlZmF1bHQgYWN0aXZpdHkgcmV0cnkgcG9saWN5IHdpbGwgYmUgdXNlZC4gVG8gZW5zdXJlIHplcm8gcmV0cmllcywgc2V0IG1heGltdW0gYXR0ZW1wdHMgdG8gMS5cbiAgICovXG4gIHJldHJ5PzogUmV0cnlQb2xpY3k7XG5cbiAgLyoqXG4gICAqIE1heGltdW0gdGltZSBvZiBhIHNpbmdsZSBBY3Rpdml0eSBleGVjdXRpb24gYXR0ZW1wdC4gTm90ZSB0aGF0IHRoZSBUZW1wb3JhbCBTZXJ2ZXIgZG9lc24ndCBkZXRlY3QgV29ya2VyIHByb2Nlc3NcbiAgICogZmFpbHVyZXMgZGlyZWN0bHk6IGluc3RlYWQsIGl0IHJlbGllcyBvbiB0aGlzIHRpbWVvdXQgdG8gZGV0ZWN0IHRoYXQgYW4gQWN0aXZpdHkgZGlkbid0IGNvbXBsZXRlIG9uIHRpbWUuIFRoZXJlZm9yZSwgdGhpc1xuICAgKiB0aW1lb3V0IHNob3VsZCBiZSBhcyBzaG9ydCBhcyB0aGUgbG9uZ2VzdCBwb3NzaWJsZSBleGVjdXRpb24gb2YgdGhlIEFjdGl2aXR5IGJvZHkuIFBvdGVudGlhbGx5IGxvbmctcnVubmluZ1xuICAgKiBBY3Rpdml0aWVzIG11c3Qgc3BlY2lmeSB7QGxpbmsgaGVhcnRiZWF0VGltZW91dH0gYW5kIGNhbGwge0BsaW5rIGFjdGl2aXR5LkNvbnRleHQuaGVhcnRiZWF0fSBwZXJpb2RpY2FsbHkgZm9yXG4gICAqIHRpbWVseSBmYWlsdXJlIGRldGVjdGlvbi5cbiAgICpcbiAgICogRWl0aGVyIHRoaXMgb3B0aW9uIG9yIHtAbGluayBzY2hlZHVsZVRvQ2xvc2VUaW1lb3V0fSBpcyByZXF1aXJlZC5cbiAgICpcbiAgICogQGRlZmF1bHQgYHNjaGVkdWxlVG9DbG9zZVRpbWVvdXRgIG9yIHVubGltaXRlZFxuICAgKiBAZm9ybWF0IG51bWJlciBvZiBtaWxsaXNlY29uZHMgb3Ige0BsaW5rIGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL21zIHwgbXMtZm9ybWF0dGVkIHN0cmluZ31cbiAgICovXG4gIHN0YXJ0VG9DbG9zZVRpbWVvdXQ/OiBEdXJhdGlvbjtcblxuICAvKipcbiAgICogVGltZSB0aGF0IHRoZSBBY3Rpdml0eSBUYXNrIGNhbiBzdGF5IGluIHRoZSBUYXNrIFF1ZXVlIGJlZm9yZSBpdCBpcyBwaWNrZWQgdXAgYnkgYSBXb3JrZXIuIERvIG5vdCBzcGVjaWZ5IHRoaXMgdGltZW91dCB1bmxlc3MgdXNpbmcgaG9zdC1zcGVjaWZpYyBUYXNrIFF1ZXVlcyBmb3IgQWN0aXZpdHkgVGFza3MgYXJlIGJlaW5nIHVzZWQgZm9yIHJvdXRpbmcuXG4gICAqIGBzY2hlZHVsZVRvU3RhcnRUaW1lb3V0YCBpcyBhbHdheXMgbm9uLXJldHJ5YWJsZS4gUmV0cnlpbmcgYWZ0ZXIgdGhpcyB0aW1lb3V0IGRvZXNuJ3QgbWFrZSBzZW5zZSBhcyBpdCB3b3VsZCBqdXN0IHB1dCB0aGUgQWN0aXZpdHkgVGFzayBiYWNrIGludG8gdGhlIHNhbWUgVGFzayBRdWV1ZS5cbiAgICpcbiAgICogQGRlZmF1bHQgYHNjaGVkdWxlVG9DbG9zZVRpbWVvdXRgIG9yIHVubGltaXRlZFxuICAgKiBAZm9ybWF0IG51bWJlciBvZiBtaWxsaXNlY29uZHMgb3Ige0BsaW5rIGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL21zIHwgbXMtZm9ybWF0dGVkIHN0cmluZ31cbiAgICovXG4gIHNjaGVkdWxlVG9TdGFydFRpbWVvdXQ/OiBEdXJhdGlvbjtcblxuICAvKipcbiAgICogVG90YWwgdGltZSB0aGF0IGEgd29ya2Zsb3cgaXMgd2lsbGluZyB0byB3YWl0IGZvciB0aGUgQWN0aXZpdHkgdG8gY29tcGxldGUuXG4gICAqIGBzY2hlZHVsZVRvQ2xvc2VUaW1lb3V0YCBsaW1pdHMgdGhlIHRvdGFsIHRpbWUgb2YgYW4gQWN0aXZpdHkncyBleGVjdXRpb24gaW5jbHVkaW5nIHJldHJpZXMgKHVzZSB7QGxpbmsgc3RhcnRUb0Nsb3NlVGltZW91dH0gdG8gbGltaXQgdGhlIHRpbWUgb2YgYSBzaW5nbGUgYXR0ZW1wdCkuXG4gICAqXG4gICAqIEVpdGhlciB0aGlzIG9wdGlvbiBvciB7QGxpbmsgc3RhcnRUb0Nsb3NlVGltZW91dH0gaXMgcmVxdWlyZWQuXG4gICAqXG4gICAqIEBkZWZhdWx0IHVubGltaXRlZFxuICAgKiBAZm9ybWF0IG51bWJlciBvZiBtaWxsaXNlY29uZHMgb3Ige0BsaW5rIGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL21zIHwgbXMtZm9ybWF0dGVkIHN0cmluZ31cbiAgICovXG4gIHNjaGVkdWxlVG9DbG9zZVRpbWVvdXQ/OiBEdXJhdGlvbjtcblxuICAvKipcbiAgICogRGV0ZXJtaW5lcyB3aGF0IHRoZSBTREsgZG9lcyB3aGVuIHRoZSBBY3Rpdml0eSBpcyBjYW5jZWxsZWQuXG4gICAqIC0gYFRSWV9DQU5DRUxgIC0gSW5pdGlhdGUgYSBjYW5jZWxsYXRpb24gcmVxdWVzdCBhbmQgaW1tZWRpYXRlbHkgcmVwb3J0IGNhbmNlbGxhdGlvbiB0byB0aGUgd29ya2Zsb3cuXG4gICAqIC0gYFdBSVRfQ0FOQ0VMTEFUSU9OX0NPTVBMRVRFRGAgLSBXYWl0IGZvciBhY3Rpdml0eSBjYW5jZWxsYXRpb24gY29tcGxldGlvbi4gTm90ZSB0aGF0IGFjdGl2aXR5IG11c3QgaGVhcnRiZWF0IHRvIHJlY2VpdmUgYVxuICAgKiAgIGNhbmNlbGxhdGlvbiBub3RpZmljYXRpb24uIFRoaXMgY2FuIGJsb2NrIHRoZSBjYW5jZWxsYXRpb24gZm9yIGEgbG9uZyB0aW1lIGlmIGFjdGl2aXR5IGRvZXNuJ3RcbiAgICogICBoZWFydGJlYXQgb3IgY2hvb3NlcyB0byBpZ25vcmUgdGhlIGNhbmNlbGxhdGlvbiByZXF1ZXN0LlxuICAgKiAtIGBBQkFORE9OYCAtIERvIG5vdCByZXF1ZXN0IGNhbmNlbGxhdGlvbiBvZiB0aGUgYWN0aXZpdHkgYW5kIGltbWVkaWF0ZWx5IHJlcG9ydCBjYW5jZWxsYXRpb24gdG8gdGhlIHdvcmtmbG93LlxuICAgKi9cbiAgY2FuY2VsbGF0aW9uVHlwZT86IEFjdGl2aXR5Q2FuY2VsbGF0aW9uVHlwZTtcblxuICAvKipcbiAgICogRWFnZXIgZGlzcGF0Y2ggaXMgYW4gb3B0aW1pemF0aW9uIHRoYXQgaW1wcm92ZXMgdGhlIHRocm91Z2hwdXQgYW5kIGxvYWQgb24gdGhlIHNlcnZlciBmb3Igc2NoZWR1bGluZyBBY3Rpdml0aWVzLlxuICAgKiBXaGVuIHVzZWQsIHRoZSBzZXJ2ZXIgd2lsbCBoYW5kIG91dCBBY3Rpdml0eSB0YXNrcyBiYWNrIHRvIHRoZSBXb3JrZXIgd2hlbiBpdCBjb21wbGV0ZXMgYSBXb3JrZmxvdyB0YXNrLlxuICAgKiBJdCBpcyBhdmFpbGFibGUgZnJvbSBzZXJ2ZXIgdmVyc2lvbiAxLjE3IGJlaGluZCB0aGUgYHN5c3RlbS5lbmFibGVBY3Rpdml0eUVhZ2VyRXhlY3V0aW9uYCBmZWF0dXJlIGZsYWcuXG4gICAqXG4gICAqIEVhZ2VyIGRpc3BhdGNoIHdpbGwgb25seSBiZSB1c2VkIGlmIGBhbGxvd0VhZ2VyRGlzcGF0Y2hgIGlzIGVuYWJsZWQgKHRoZSBkZWZhdWx0KSBhbmQge0BsaW5rIHRhc2tRdWV1ZX0gaXMgZWl0aGVyXG4gICAqIG9taXR0ZWQgb3IgdGhlIHNhbWUgYXMgdGhlIGN1cnJlbnQgV29ya2Zsb3cuXG4gICAqXG4gICAqIEBkZWZhdWx0IHRydWVcbiAgICovXG4gIGFsbG93RWFnZXJEaXNwYXRjaD86IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIFdoZW4gdXNpbmcgdGhlIFdvcmtlciBWZXJzaW9uaW5nIGZlYXR1cmUsIHNwZWNpZmllcyB3aGV0aGVyIHRoaXMgQWN0aXZpdHkgc2hvdWxkIHJ1biBvbiBhXG4gICAqIHdvcmtlciB3aXRoIGEgY29tcGF0aWJsZSBCdWlsZCBJZCBvciBub3QuIFNlZSB7QGxpbmsgVmVyc2lvbmluZ0ludGVudH0uXG4gICAqXG4gICAqIEBkZWZhdWx0ICdDT01QQVRJQkxFJ1xuICAgKlxuICAgKiBAZXhwZXJpbWVudGFsXG4gICAqL1xuICB2ZXJzaW9uaW5nSW50ZW50PzogVmVyc2lvbmluZ0ludGVudDtcbn1cblxuLyoqXG4gKiBPcHRpb25zIGZvciBsb2NhbCBhY3Rpdml0eSBpbnZvY2F0aW9uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTG9jYWxBY3Rpdml0eU9wdGlvbnMge1xuICAvKipcbiAgICogUmV0cnlQb2xpY3kgdGhhdCBkZWZpbmVzIGhvdyBhbiBhY3Rpdml0eSBpcyByZXRyaWVkIGluIGNhc2Ugb2YgZmFpbHVyZS4gSWYgdGhpcyBpcyBub3Qgc2V0LCB0aGVuIHRoZSBTREstZGVmaW5lZCBkZWZhdWx0IGFjdGl2aXR5IHJldHJ5IHBvbGljeSB3aWxsIGJlIHVzZWQuXG4gICAqIE5vdGUgdGhhdCBsb2NhbCBhY3Rpdml0aWVzIGFyZSBhbHdheXMgZXhlY3V0ZWQgYXQgbGVhc3Qgb25jZSwgZXZlbiBpZiBtYXhpbXVtIGF0dGVtcHRzIGlzIHNldCB0byAxIGR1ZSB0byBXb3JrZmxvdyB0YXNrIHJldHJpZXMuXG4gICAqL1xuICByZXRyeT86IFJldHJ5UG9saWN5O1xuXG4gIC8qKlxuICAgKiBNYXhpbXVtIHRpbWUgdGhlIGxvY2FsIGFjdGl2aXR5IGlzIGFsbG93ZWQgdG8gZXhlY3V0ZSBhZnRlciB0aGUgdGFzayBpcyBkaXNwYXRjaGVkLiBUaGlzXG4gICAqIHRpbWVvdXQgaXMgYWx3YXlzIHJldHJ5YWJsZS5cbiAgICpcbiAgICogRWl0aGVyIHRoaXMgb3B0aW9uIG9yIHtAbGluayBzY2hlZHVsZVRvQ2xvc2VUaW1lb3V0fSBpcyByZXF1aXJlZC5cbiAgICogSWYgc2V0LCB0aGlzIG11c3QgYmUgPD0ge0BsaW5rIHNjaGVkdWxlVG9DbG9zZVRpbWVvdXR9LCBvdGhlcndpc2UsIGl0IHdpbGwgYmUgY2xhbXBlZCBkb3duLlxuICAgKlxuICAgKiBAZm9ybWF0IG51bWJlciBvZiBtaWxsaXNlY29uZHMgb3Ige0BsaW5rIGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL21zIHwgbXMtZm9ybWF0dGVkIHN0cmluZ31cbiAgICovXG4gIHN0YXJ0VG9DbG9zZVRpbWVvdXQ/OiBEdXJhdGlvbjtcblxuICAvKipcbiAgICogTGltaXRzIHRpbWUgdGhlIGxvY2FsIGFjdGl2aXR5IGNhbiBpZGxlIGludGVybmFsbHkgYmVmb3JlIGJlaW5nIGV4ZWN1dGVkLiBUaGF0IGNhbiBoYXBwZW4gaWZcbiAgICogdGhlIHdvcmtlciBpcyBjdXJyZW50bHkgYXQgbWF4IGNvbmN1cnJlbnQgbG9jYWwgYWN0aXZpdHkgZXhlY3V0aW9ucy4gVGhpcyB0aW1lb3V0IGlzIGFsd2F5c1xuICAgKiBub24gcmV0cnlhYmxlIGFzIGFsbCBhIHJldHJ5IHdvdWxkIGFjaGlldmUgaXMgdG8gcHV0IGl0IGJhY2sgaW50byB0aGUgc2FtZSBxdWV1ZS4gRGVmYXVsdHNcbiAgICogdG8ge0BsaW5rIHNjaGVkdWxlVG9DbG9zZVRpbWVvdXR9IGlmIG5vdCBzcGVjaWZpZWQgYW5kIHRoYXQgaXMgc2V0LiBNdXN0IGJlIDw9XG4gICAqIHtAbGluayBzY2hlZHVsZVRvQ2xvc2VUaW1lb3V0fSB3aGVuIHNldCwgb3RoZXJ3aXNlLCBpdCB3aWxsIGJlIGNsYW1wZWQgZG93bi5cbiAgICpcbiAgICogQGRlZmF1bHQgdW5saW1pdGVkXG4gICAqIEBmb3JtYXQgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBvciB7QGxpbmsgaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvbXMgfCBtcy1mb3JtYXR0ZWQgc3RyaW5nfVxuICAgKi9cbiAgc2NoZWR1bGVUb1N0YXJ0VGltZW91dD86IER1cmF0aW9uO1xuXG4gIC8qKlxuICAgKiBJbmRpY2F0ZXMgaG93IGxvbmcgdGhlIGNhbGxlciBpcyB3aWxsaW5nIHRvIHdhaXQgZm9yIGxvY2FsIGFjdGl2aXR5IGNvbXBsZXRpb24uIExpbWl0cyBob3dcbiAgICogbG9uZyByZXRyaWVzIHdpbGwgYmUgYXR0ZW1wdGVkLlxuICAgKlxuICAgKiBFaXRoZXIgdGhpcyBvcHRpb24gb3Ige0BsaW5rIHN0YXJ0VG9DbG9zZVRpbWVvdXR9IGlzIHJlcXVpcmVkLlxuICAgKlxuICAgKiBAZGVmYXVsdCB1bmxpbWl0ZWRcbiAgICogQGZvcm1hdCBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIG9yIHtAbGluayBodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9tcyB8IG1zLWZvcm1hdHRlZCBzdHJpbmd9XG4gICAqL1xuICBzY2hlZHVsZVRvQ2xvc2VUaW1lb3V0PzogRHVyYXRpb247XG5cbiAgLyoqXG4gICAqIElmIHRoZSBhY3Rpdml0eSBpcyByZXRyeWluZyBhbmQgYmFja29mZiB3b3VsZCBleGNlZWQgdGhpcyB2YWx1ZSwgYSBzZXJ2ZXIgc2lkZSB0aW1lciB3aWxsIGJlIHNjaGVkdWxlZCBmb3IgdGhlIG5leHQgYXR0ZW1wdC5cbiAgICogT3RoZXJ3aXNlLCBiYWNrb2ZmIHdpbGwgaGFwcGVuIGludGVybmFsbHkgaW4gdGhlIFNESy5cbiAgICpcbiAgICogQGRlZmF1bHQgMSBtaW51dGVcbiAgICogQGZvcm1hdCBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIG9yIHtAbGluayBodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9tcyB8IG1zLWZvcm1hdHRlZCBzdHJpbmd9XG4gICAqKi9cbiAgbG9jYWxSZXRyeVRocmVzaG9sZD86IER1cmF0aW9uO1xuXG4gIC8qKlxuICAgKiBEZXRlcm1pbmVzIHdoYXQgdGhlIFNESyBkb2VzIHdoZW4gdGhlIEFjdGl2aXR5IGlzIGNhbmNlbGxlZC5cbiAgICogLSBgVFJZX0NBTkNFTGAgLSBJbml0aWF0ZSBhIGNhbmNlbGxhdGlvbiByZXF1ZXN0IGFuZCBpbW1lZGlhdGVseSByZXBvcnQgY2FuY2VsbGF0aW9uIHRvIHRoZSB3b3JrZmxvdy5cbiAgICogLSBgV0FJVF9DQU5DRUxMQVRJT05fQ09NUExFVEVEYCAtIFdhaXQgZm9yIGFjdGl2aXR5IGNhbmNlbGxhdGlvbiBjb21wbGV0aW9uLiBOb3RlIHRoYXQgYWN0aXZpdHkgbXVzdCBoZWFydGJlYXQgdG8gcmVjZWl2ZSBhXG4gICAqICAgY2FuY2VsbGF0aW9uIG5vdGlmaWNhdGlvbi4gVGhpcyBjYW4gYmxvY2sgdGhlIGNhbmNlbGxhdGlvbiBmb3IgYSBsb25nIHRpbWUgaWYgYWN0aXZpdHkgZG9lc24ndFxuICAgKiAgIGhlYXJ0YmVhdCBvciBjaG9vc2VzIHRvIGlnbm9yZSB0aGUgY2FuY2VsbGF0aW9uIHJlcXVlc3QuXG4gICAqIC0gYEFCQU5ET05gIC0gRG8gbm90IHJlcXVlc3QgY2FuY2VsbGF0aW9uIG9mIHRoZSBhY3Rpdml0eSBhbmQgaW1tZWRpYXRlbHkgcmVwb3J0IGNhbmNlbGxhdGlvbiB0byB0aGUgd29ya2Zsb3cuXG4gICAqL1xuICBjYW5jZWxsYXRpb25UeXBlPzogY29yZXNkay53b3JrZmxvd19jb21tYW5kcy5BY3Rpdml0eUNhbmNlbGxhdGlvblR5cGU7XG59XG4iLCJpbXBvcnQgeyBEZWZhdWx0RmFpbHVyZUNvbnZlcnRlciwgRmFpbHVyZUNvbnZlcnRlciB9IGZyb20gJy4vZmFpbHVyZS1jb252ZXJ0ZXInO1xuaW1wb3J0IHsgUGF5bG9hZENvZGVjIH0gZnJvbSAnLi9wYXlsb2FkLWNvZGVjJztcbmltcG9ydCB7IGRlZmF1bHRQYXlsb2FkQ29udmVydGVyLCBQYXlsb2FkQ29udmVydGVyIH0gZnJvbSAnLi9wYXlsb2FkLWNvbnZlcnRlcic7XG5cbi8qKlxuICogV2hlbiB5b3VyIGRhdGEgKGFyZ3VtZW50cyBhbmQgcmV0dXJuIHZhbHVlcykgaXMgc2VudCBvdmVyIHRoZSB3aXJlIGFuZCBzdG9yZWQgYnkgVGVtcG9yYWwgU2VydmVyLCBpdCBpcyBlbmNvZGVkIGluXG4gKiBiaW5hcnkgaW4gYSB7QGxpbmsgUGF5bG9hZH0gUHJvdG9idWYgbWVzc2FnZS5cbiAqXG4gKiBUaGUgZGVmYXVsdCBgRGF0YUNvbnZlcnRlcmAgc3VwcG9ydHMgYHVuZGVmaW5lZGAsIGBVaW50OEFycmF5YCwgYW5kIEpTT04gc2VyaWFsaXphYmxlcyAoc28gaWZcbiAqIHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9KU09OL3N0cmluZ2lmeSNkZXNjcmlwdGlvbiB8IGBKU09OLnN0cmluZ2lmeSh5b3VyQXJnT3JSZXR2YWwpYH1cbiAqIHdvcmtzLCB0aGUgZGVmYXVsdCBkYXRhIGNvbnZlcnRlciB3aWxsIHdvcmspLiBQcm90b2J1ZnMgYXJlIHN1cHBvcnRlZCB2aWFcbiAqIHtAbGluayBodHRwczovL2RvY3MudGVtcG9yYWwuaW8vdHlwZXNjcmlwdC9kYXRhLWNvbnZlcnRlcnMjcHJvdG9idWZzIHwgdGhpcyBBUEl9LlxuICpcbiAqIFVzZSBhIGN1c3RvbSBgRGF0YUNvbnZlcnRlcmAgdG8gY29udHJvbCB0aGUgY29udGVudHMgb2YgeW91ciB7QGxpbmsgUGF5bG9hZH1zLiBDb21tb24gcmVhc29ucyBmb3IgdXNpbmcgYSBjdXN0b21cbiAqIGBEYXRhQ29udmVydGVyYCBhcmU6XG4gKiAtIENvbnZlcnRpbmcgdmFsdWVzIHRoYXQgYXJlIG5vdCBzdXBwb3J0ZWQgYnkgdGhlIGRlZmF1bHQgYERhdGFDb252ZXJ0ZXJgIChmb3IgZXhhbXBsZSwgYEpTT04uc3RyaW5naWZ5KClgIGRvZXNuJ3RcbiAqICAgaGFuZGxlIGBCaWdJbnRgcywgc28gaWYgeW91IHdhbnQgdG8gcmV0dXJuIGB7IHRvdGFsOiAxMDAwbiB9YCBmcm9tIGEgV29ya2Zsb3csIFNpZ25hbCwgb3IgQWN0aXZpdHksIHlvdSBuZWVkIHlvdXJcbiAqICAgb3duIGBEYXRhQ29udmVydGVyYCkuXG4gKiAtIEVuY3J5cHRpbmcgdmFsdWVzIHRoYXQgbWF5IGNvbnRhaW4gcHJpdmF0ZSBpbmZvcm1hdGlvbiB0aGF0IHlvdSBkb24ndCB3YW50IHN0b3JlZCBpbiBwbGFpbnRleHQgaW4gVGVtcG9yYWwgU2VydmVyJ3NcbiAqICAgZGF0YWJhc2UuXG4gKiAtIENvbXByZXNzaW5nIHZhbHVlcyB0byByZWR1Y2UgZGlzayBvciBuZXR3b3JrIHVzYWdlLlxuICpcbiAqIFRvIHVzZSB5b3VyIGN1c3RvbSBgRGF0YUNvbnZlcnRlcmAsIHByb3ZpZGUgaXQgdG8gdGhlIHtAbGluayBXb3JrZmxvd0NsaWVudH0sIHtAbGluayBXb3JrZXJ9LCBhbmRcbiAqIHtAbGluayBidW5kbGVXb3JrZmxvd0NvZGV9IChpZiB5b3UgdXNlIGl0KTpcbiAqIC0gYG5ldyBXb3JrZmxvd0NsaWVudCh7IC4uLiwgZGF0YUNvbnZlcnRlciB9KWBcbiAqIC0gYFdvcmtlci5jcmVhdGUoeyAuLi4sIGRhdGFDb252ZXJ0ZXIgfSlgXG4gKiAtIGBidW5kbGVXb3JrZmxvd0NvZGUoeyAuLi4sIHBheWxvYWRDb252ZXJ0ZXJQYXRoIH0pYFxuICovXG5leHBvcnQgaW50ZXJmYWNlIERhdGFDb252ZXJ0ZXIge1xuICAvKipcbiAgICogUGF0aCBvZiBhIGZpbGUgdGhhdCBoYXMgYSBgcGF5bG9hZENvbnZlcnRlcmAgbmFtZWQgZXhwb3J0LlxuICAgKiBgcGF5bG9hZENvbnZlcnRlcmAgc2hvdWxkIGJlIGFuIG9iamVjdCB0aGF0IGltcGxlbWVudHMge0BsaW5rIFBheWxvYWRDb252ZXJ0ZXJ9LlxuICAgKiBJZiBubyBwYXRoIGlzIHByb3ZpZGVkLCB7QGxpbmsgZGVmYXVsdFBheWxvYWRDb252ZXJ0ZXJ9IGlzIHVzZWQuXG4gICAqL1xuICBwYXlsb2FkQ29udmVydGVyUGF0aD86IHN0cmluZztcblxuICAvKipcbiAgICogUGF0aCBvZiBhIGZpbGUgdGhhdCBoYXMgYSBgZmFpbHVyZUNvbnZlcnRlcmAgbmFtZWQgZXhwb3J0LlxuICAgKiBgZmFpbHVyZUNvbnZlcnRlcmAgc2hvdWxkIGJlIGFuIG9iamVjdCB0aGF0IGltcGxlbWVudHMge0BsaW5rIEZhaWx1cmVDb252ZXJ0ZXJ9LlxuICAgKiBJZiBubyBwYXRoIGlzIHByb3ZpZGVkLCB7QGxpbmsgZGVmYXVsdEZhaWx1cmVDb252ZXJ0ZXJ9IGlzIHVzZWQuXG4gICAqL1xuICBmYWlsdXJlQ29udmVydGVyUGF0aD86IHN0cmluZztcblxuICAvKipcbiAgICogQW4gYXJyYXkgb2Yge0BsaW5rIFBheWxvYWRDb2RlY30gaW5zdGFuY2VzLlxuICAgKlxuICAgKiBQYXlsb2FkcyBhcmUgZW5jb2RlZCBpbiB0aGUgb3JkZXIgb2YgdGhlIGFycmF5IGFuZCBkZWNvZGVkIGluIHRoZSBvcHBvc2l0ZSBvcmRlci4gRm9yIGV4YW1wbGUsIGlmIHlvdSBoYXZlIGFcbiAgICogY29tcHJlc3Npb24gY29kZWMgYW5kIGFuIGVuY3J5cHRpb24gY29kZWMsIHRoZW4geW91IHdhbnQgZGF0YSB0byBiZSBlbmNvZGVkIHdpdGggdGhlIGNvbXByZXNzaW9uIGNvZGVjIGZpcnN0LCBzb1xuICAgKiB5b3UnZCBkbyBgcGF5bG9hZENvZGVjczogW2NvbXByZXNzaW9uQ29kZWMsIGVuY3J5cHRpb25Db2RlY11gLlxuICAgKi9cbiAgcGF5bG9hZENvZGVjcz86IFBheWxvYWRDb2RlY1tdO1xufVxuXG4vKipcbiAqIEEge0BsaW5rIERhdGFDb252ZXJ0ZXJ9IHRoYXQgaGFzIGJlZW4gbG9hZGVkIHZpYSB7QGxpbmsgbG9hZERhdGFDb252ZXJ0ZXJ9LlxuICovXG5leHBvcnQgaW50ZXJmYWNlIExvYWRlZERhdGFDb252ZXJ0ZXIge1xuICBwYXlsb2FkQ29udmVydGVyOiBQYXlsb2FkQ29udmVydGVyO1xuICBmYWlsdXJlQ29udmVydGVyOiBGYWlsdXJlQ29udmVydGVyO1xuICBwYXlsb2FkQ29kZWNzOiBQYXlsb2FkQ29kZWNbXTtcbn1cblxuLyoqXG4gKiBUaGUgZGVmYXVsdCB7QGxpbmsgRmFpbHVyZUNvbnZlcnRlcn0gdXNlZCBieSB0aGUgU0RLLlxuICpcbiAqIEVycm9yIG1lc3NhZ2VzIGFuZCBzdGFjayB0cmFjZXMgYXJlIHNlcml6YWxpemVkIGFzIHBsYWluIHRleHQuXG4gKi9cbmV4cG9ydCBjb25zdCBkZWZhdWx0RmFpbHVyZUNvbnZlcnRlcjogRmFpbHVyZUNvbnZlcnRlciA9IG5ldyBEZWZhdWx0RmFpbHVyZUNvbnZlcnRlcigpO1xuXG4vKipcbiAqIEEgXCJsb2FkZWRcIiBkYXRhIGNvbnZlcnRlciB0aGF0IHVzZXMgdGhlIGRlZmF1bHQgc2V0IG9mIGZhaWx1cmUgYW5kIHBheWxvYWQgY29udmVydGVycy5cbiAqL1xuZXhwb3J0IGNvbnN0IGRlZmF1bHREYXRhQ29udmVydGVyOiBMb2FkZWREYXRhQ29udmVydGVyID0ge1xuICBwYXlsb2FkQ29udmVydGVyOiBkZWZhdWx0UGF5bG9hZENvbnZlcnRlcixcbiAgZmFpbHVyZUNvbnZlcnRlcjogZGVmYXVsdEZhaWx1cmVDb252ZXJ0ZXIsXG4gIHBheWxvYWRDb2RlY3M6IFtdLFxufTtcbiIsImltcG9ydCB7XG4gIEFjdGl2aXR5RmFpbHVyZSxcbiAgQXBwbGljYXRpb25GYWlsdXJlLFxuICBDYW5jZWxsZWRGYWlsdXJlLFxuICBDaGlsZFdvcmtmbG93RmFpbHVyZSxcbiAgRkFJTFVSRV9TT1VSQ0UsXG4gIFByb3RvRmFpbHVyZSxcbiAgUmV0cnlTdGF0ZSxcbiAgU2VydmVyRmFpbHVyZSxcbiAgVGVtcG9yYWxGYWlsdXJlLFxuICBUZXJtaW5hdGVkRmFpbHVyZSxcbiAgVGltZW91dEZhaWx1cmUsXG4gIFRpbWVvdXRUeXBlLFxufSBmcm9tICcuLi9mYWlsdXJlJztcbmltcG9ydCB7IGlzRXJyb3IgfSBmcm9tICcuLi90eXBlLWhlbHBlcnMnO1xuaW1wb3J0IHsgbXNPcHRpb25hbFRvVHMgfSBmcm9tICcuLi90aW1lJztcbmltcG9ydCB7IGFycmF5RnJvbVBheWxvYWRzLCBmcm9tUGF5bG9hZHNBdEluZGV4LCBQYXlsb2FkQ29udmVydGVyLCB0b1BheWxvYWRzIH0gZnJvbSAnLi9wYXlsb2FkLWNvbnZlcnRlcic7XG5cbmZ1bmN0aW9uIGNvbWJpbmVSZWdFeHAoLi4ucmVnZXhwczogUmVnRXhwW10pOiBSZWdFeHAge1xuICByZXR1cm4gbmV3IFJlZ0V4cChyZWdleHBzLm1hcCgoeCkgPT4gYCg/OiR7eC5zb3VyY2V9KWApLmpvaW4oJ3wnKSk7XG59XG5cbi8qKlxuICogU3RhY2sgdHJhY2VzIHdpbGwgYmUgY3V0b2ZmIHdoZW4gb24gb2YgdGhlc2UgcGF0dGVybnMgaXMgbWF0Y2hlZFxuICovXG5jb25zdCBDVVRPRkZfU1RBQ0tfUEFUVEVSTlMgPSBjb21iaW5lUmVnRXhwKFxuICAvKiogQWN0aXZpdHkgZXhlY3V0aW9uICovXG4gIC9cXHMrYXQgQWN0aXZpdHlcXC5leGVjdXRlIFxcKC4qW1xcXFwvXXdvcmtlcltcXFxcL10oPzpzcmN8bGliKVtcXFxcL11hY3Rpdml0eVxcLltqdF1zOlxcZCs6XFxkK1xcKS8sXG4gIC8qKiBXb3JrZmxvdyBhY3RpdmF0aW9uICovXG4gIC9cXHMrYXQgQWN0aXZhdG9yXFwuXFxTK05leHRIYW5kbGVyIFxcKC4qW1xcXFwvXXdvcmtmbG93W1xcXFwvXSg/OnNyY3xsaWIpW1xcXFwvXWludGVybmFsc1xcLltqdF1zOlxcZCs6XFxkK1xcKS8sXG4gIC8qKiBXb3JrZmxvdyBydW4gYW55dGhpbmcgaW4gY29udGV4dCAqL1xuICAvXFxzK2F0IFNjcmlwdFxcLnJ1bkluQ29udGV4dCBcXCgoPzpub2RlOnZtfHZtXFwuanMpOlxcZCs6XFxkK1xcKS9cbik7XG5cbi8qKlxuICogQW55IHN0YWNrIHRyYWNlIGZyYW1lcyB0aGF0IG1hdGNoIGFueSBvZiB0aG9zZSB3aWwgYmUgZG9wcGVkLlxuICogVGhlIFwibnVsbC5cIiBwcmVmaXggb24gc29tZSBjYXNlcyBpcyB0byBhdm9pZCBodHRwczovL2dpdGh1Yi5jb20vbm9kZWpzL25vZGUvaXNzdWVzLzQyNDE3XG4gKi9cbmNvbnN0IERST1BQRURfU1RBQ0tfRlJBTUVTX1BBVFRFUk5TID0gY29tYmluZVJlZ0V4cChcbiAgLyoqIEludGVybmFsIGZ1bmN0aW9ucyB1c2VkIHRvIHJlY3Vyc2l2ZWx5IGNoYWluIGludGVyY2VwdG9ycyAqL1xuICAvXFxzK2F0IChudWxsXFwuKT9uZXh0IFxcKC4qW1xcXFwvXWNvbW1vbltcXFxcL10oPzpzcmN8bGliKVtcXFxcL11pbnRlcmNlcHRvcnNcXC5banRdczpcXGQrOlxcZCtcXCkvLFxuICAvKiogSW50ZXJuYWwgZnVuY3Rpb25zIHVzZWQgdG8gcmVjdXJzaXZlbHkgY2hhaW4gaW50ZXJjZXB0b3JzICovXG4gIC9cXHMrYXQgKG51bGxcXC4pP2V4ZWN1dGVOZXh0SGFuZGxlciBcXCguKltcXFxcL113b3JrZXJbXFxcXC9dKD86c3JjfGxpYilbXFxcXC9dYWN0aXZpdHlcXC5banRdczpcXGQrOlxcZCtcXCkvXG4pO1xuXG4vKipcbiAqIEN1dHMgb3V0IHRoZSBmcmFtZXdvcmsgcGFydCBvZiBhIHN0YWNrIHRyYWNlLCBsZWF2aW5nIG9ubHkgdXNlciBjb2RlIGVudHJpZXNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGN1dG9mZlN0YWNrVHJhY2Uoc3RhY2s/OiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCBsaW5lcyA9IChzdGFjayA/PyAnJykuc3BsaXQoL1xccj9cXG4vKTtcbiAgY29uc3QgYWNjID0gQXJyYXk8c3RyaW5nPigpO1xuICBmb3IgKGNvbnN0IGxpbmUgb2YgbGluZXMpIHtcbiAgICBpZiAoQ1VUT0ZGX1NUQUNLX1BBVFRFUk5TLnRlc3QobGluZSkpIGJyZWFrO1xuICAgIGlmICghRFJPUFBFRF9TVEFDS19GUkFNRVNfUEFUVEVSTlMudGVzdChsaW5lKSkgYWNjLnB1c2gobGluZSk7XG4gIH1cbiAgcmV0dXJuIGFjYy5qb2luKCdcXG4nKTtcbn1cblxuLyoqXG4gKiBBIGBGYWlsdXJlQ29udmVydGVyYCBpcyByZXNwb25zaWJsZSBmb3IgY29udmVydGluZyBmcm9tIHByb3RvIGBGYWlsdXJlYCBpbnN0YW5jZXMgdG8gSlMgYEVycm9yc2AgYW5kIGJhY2suXG4gKlxuICogV2UgcmVjb21tZW5kZWQgdXNpbmcgdGhlIHtAbGluayBEZWZhdWx0RmFpbHVyZUNvbnZlcnRlcn0gaW5zdGVhZCBvZiBjdXN0b21pemluZyB0aGUgZGVmYXVsdCBpbXBsZW1lbnRhdGlvbiBpbiBvcmRlclxuICogdG8gbWFpbnRhaW4gY3Jvc3MtbGFuZ3VhZ2UgRmFpbHVyZSBzZXJpYWxpemF0aW9uIGNvbXBhdGliaWxpdHkuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRmFpbHVyZUNvbnZlcnRlciB7XG4gIC8qKlxuICAgKiBDb252ZXJ0cyBhIGNhdWdodCBlcnJvciB0byBhIEZhaWx1cmUgcHJvdG8gbWVzc2FnZS5cbiAgICovXG4gIGVycm9yVG9GYWlsdXJlKGVycjogdW5rbm93biwgcGF5bG9hZENvbnZlcnRlcjogUGF5bG9hZENvbnZlcnRlcik6IFByb3RvRmFpbHVyZTtcblxuICAvKipcbiAgICogQ29udmVydHMgYSBGYWlsdXJlIHByb3RvIG1lc3NhZ2UgdG8gYSBKUyBFcnJvciBvYmplY3QuXG4gICAqXG4gICAqIFRoZSByZXR1cm5lZCBlcnJvciBtdXN0IGJlIGFuIGluc3RhbmNlIG9mIGBUZW1wb3JhbEZhaWx1cmVgLlxuICAgKi9cbiAgZmFpbHVyZVRvRXJyb3IoZXJyOiBQcm90b0ZhaWx1cmUsIHBheWxvYWRDb252ZXJ0ZXI6IFBheWxvYWRDb252ZXJ0ZXIpOiBUZW1wb3JhbEZhaWx1cmU7XG59XG5cbi8qKlxuICogVGhlIFwic2hhcGVcIiBvZiB0aGUgYXR0cmlidXRlcyBzZXQgYXMgdGhlIHtAbGluayBQcm90b0ZhaWx1cmUuZW5jb2RlZEF0dHJpYnV0ZXN9IHBheWxvYWQgaW4gY2FzZVxuICoge0BsaW5rIERlZmF1bHRFbmNvZGVkRmFpbHVyZUF0dHJpYnV0ZXMuZW5jb2RlQ29tbW9uQXR0cmlidXRlc30gaXMgc2V0IHRvIGB0cnVlYC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBEZWZhdWx0RW5jb2RlZEZhaWx1cmVBdHRyaWJ1dGVzIHtcbiAgbWVzc2FnZTogc3RyaW5nO1xuICBzdGFja190cmFjZTogc3RyaW5nO1xufVxuXG4vKipcbiAqIE9wdGlvbnMgZm9yIHRoZSB7QGxpbmsgRGVmYXVsdEZhaWx1cmVDb252ZXJ0ZXJ9IGNvbnN0cnVjdG9yLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIERlZmF1bHRGYWlsdXJlQ29udmVydGVyT3B0aW9ucyB7XG4gIC8qKlxuICAgKiBXaGV0aGVyIHRvIGVuY29kZSBlcnJvciBtZXNzYWdlcyBhbmQgc3RhY2sgdHJhY2VzIChmb3IgZW5jcnlwdGluZyB0aGVzZSBhdHRyaWJ1dGVzIHVzZSBhIHtAbGluayBQYXlsb2FkQ29kZWN9KS5cbiAgICovXG4gIGVuY29kZUNvbW1vbkF0dHJpYnV0ZXM6IGJvb2xlYW47XG59XG5cbi8qKlxuICogRGVmYXVsdCwgY3Jvc3MtbGFuZ3VhZ2UtY29tcGF0aWJsZSBGYWlsdXJlIGNvbnZlcnRlci5cbiAqXG4gKiBCeSBkZWZhdWx0LCBpdCB3aWxsIGxlYXZlIGVycm9yIG1lc3NhZ2VzIGFuZCBzdGFjayB0cmFjZXMgYXMgcGxhaW4gdGV4dC4gSW4gb3JkZXIgdG8gZW5jcnlwdCB0aGVtLCBzZXRcbiAqIGBlbmNvZGVDb21tb25BdHRyaWJ1dGVzYCB0byBgdHJ1ZWAgaW4gdGhlIGNvbnN0cnVjdG9yIG9wdGlvbnMgYW5kIHVzZSBhIHtAbGluayBQYXlsb2FkQ29kZWN9IHRoYXQgY2FuIGVuY3J5cHQgL1xuICogZGVjcnlwdCBQYXlsb2FkcyBpbiB5b3VyIHtAbGluayBXb3JrZXJPcHRpb25zLmRhdGFDb252ZXJ0ZXIgfCBXb3JrZXJ9IGFuZFxuICoge0BsaW5rIENsaWVudE9wdGlvbnMuZGF0YUNvbnZlcnRlciB8IENsaWVudCBvcHRpb25zfS5cbiAqL1xuZXhwb3J0IGNsYXNzIERlZmF1bHRGYWlsdXJlQ29udmVydGVyIGltcGxlbWVudHMgRmFpbHVyZUNvbnZlcnRlciB7XG4gIHB1YmxpYyByZWFkb25seSBvcHRpb25zOiBEZWZhdWx0RmFpbHVyZUNvbnZlcnRlck9wdGlvbnM7XG5cbiAgY29uc3RydWN0b3Iob3B0aW9ucz86IFBhcnRpYWw8RGVmYXVsdEZhaWx1cmVDb252ZXJ0ZXJPcHRpb25zPikge1xuICAgIGNvbnN0IHsgZW5jb2RlQ29tbW9uQXR0cmlidXRlcyB9ID0gb3B0aW9ucyA/PyB7fTtcbiAgICB0aGlzLm9wdGlvbnMgPSB7XG4gICAgICBlbmNvZGVDb21tb25BdHRyaWJ1dGVzOiBlbmNvZGVDb21tb25BdHRyaWJ1dGVzID8/IGZhbHNlLFxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogQ29udmVydHMgYSBGYWlsdXJlIHByb3RvIG1lc3NhZ2UgdG8gYSBKUyBFcnJvciBvYmplY3QuXG4gICAqXG4gICAqIERvZXMgbm90IHNldCBjb21tb24gcHJvcGVydGllcywgdGhhdCBpcyBkb25lIGluIHtAbGluayBmYWlsdXJlVG9FcnJvcn0uXG4gICAqL1xuICBmYWlsdXJlVG9FcnJvcklubmVyKGZhaWx1cmU6IFByb3RvRmFpbHVyZSwgcGF5bG9hZENvbnZlcnRlcjogUGF5bG9hZENvbnZlcnRlcik6IFRlbXBvcmFsRmFpbHVyZSB7XG4gICAgaWYgKGZhaWx1cmUuYXBwbGljYXRpb25GYWlsdXJlSW5mbykge1xuICAgICAgcmV0dXJuIG5ldyBBcHBsaWNhdGlvbkZhaWx1cmUoXG4gICAgICAgIGZhaWx1cmUubWVzc2FnZSA/PyB1bmRlZmluZWQsXG4gICAgICAgIGZhaWx1cmUuYXBwbGljYXRpb25GYWlsdXJlSW5mby50eXBlLFxuICAgICAgICBCb29sZWFuKGZhaWx1cmUuYXBwbGljYXRpb25GYWlsdXJlSW5mby5ub25SZXRyeWFibGUpLFxuICAgICAgICBhcnJheUZyb21QYXlsb2FkcyhwYXlsb2FkQ29udmVydGVyLCBmYWlsdXJlLmFwcGxpY2F0aW9uRmFpbHVyZUluZm8uZGV0YWlscz8ucGF5bG9hZHMpLFxuICAgICAgICB0aGlzLm9wdGlvbmFsRmFpbHVyZVRvT3B0aW9uYWxFcnJvcihmYWlsdXJlLmNhdXNlLCBwYXlsb2FkQ29udmVydGVyKVxuICAgICAgKTtcbiAgICB9XG4gICAgaWYgKGZhaWx1cmUuc2VydmVyRmFpbHVyZUluZm8pIHtcbiAgICAgIHJldHVybiBuZXcgU2VydmVyRmFpbHVyZShcbiAgICAgICAgZmFpbHVyZS5tZXNzYWdlID8/IHVuZGVmaW5lZCxcbiAgICAgICAgQm9vbGVhbihmYWlsdXJlLnNlcnZlckZhaWx1cmVJbmZvLm5vblJldHJ5YWJsZSksXG4gICAgICAgIHRoaXMub3B0aW9uYWxGYWlsdXJlVG9PcHRpb25hbEVycm9yKGZhaWx1cmUuY2F1c2UsIHBheWxvYWRDb252ZXJ0ZXIpXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAoZmFpbHVyZS50aW1lb3V0RmFpbHVyZUluZm8pIHtcbiAgICAgIHJldHVybiBuZXcgVGltZW91dEZhaWx1cmUoXG4gICAgICAgIGZhaWx1cmUubWVzc2FnZSA/PyB1bmRlZmluZWQsXG4gICAgICAgIGZyb21QYXlsb2Fkc0F0SW5kZXgocGF5bG9hZENvbnZlcnRlciwgMCwgZmFpbHVyZS50aW1lb3V0RmFpbHVyZUluZm8ubGFzdEhlYXJ0YmVhdERldGFpbHM/LnBheWxvYWRzKSxcbiAgICAgICAgZmFpbHVyZS50aW1lb3V0RmFpbHVyZUluZm8udGltZW91dFR5cGUgPz8gVGltZW91dFR5cGUuVElNRU9VVF9UWVBFX1VOU1BFQ0lGSUVEXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAoZmFpbHVyZS50ZXJtaW5hdGVkRmFpbHVyZUluZm8pIHtcbiAgICAgIHJldHVybiBuZXcgVGVybWluYXRlZEZhaWx1cmUoXG4gICAgICAgIGZhaWx1cmUubWVzc2FnZSA/PyB1bmRlZmluZWQsXG4gICAgICAgIHRoaXMub3B0aW9uYWxGYWlsdXJlVG9PcHRpb25hbEVycm9yKGZhaWx1cmUuY2F1c2UsIHBheWxvYWRDb252ZXJ0ZXIpXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAoZmFpbHVyZS5jYW5jZWxlZEZhaWx1cmVJbmZvKSB7XG4gICAgICByZXR1cm4gbmV3IENhbmNlbGxlZEZhaWx1cmUoXG4gICAgICAgIGZhaWx1cmUubWVzc2FnZSA/PyB1bmRlZmluZWQsXG4gICAgICAgIGFycmF5RnJvbVBheWxvYWRzKHBheWxvYWRDb252ZXJ0ZXIsIGZhaWx1cmUuY2FuY2VsZWRGYWlsdXJlSW5mby5kZXRhaWxzPy5wYXlsb2FkcyksXG4gICAgICAgIHRoaXMub3B0aW9uYWxGYWlsdXJlVG9PcHRpb25hbEVycm9yKGZhaWx1cmUuY2F1c2UsIHBheWxvYWRDb252ZXJ0ZXIpXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAoZmFpbHVyZS5yZXNldFdvcmtmbG93RmFpbHVyZUluZm8pIHtcbiAgICAgIHJldHVybiBuZXcgQXBwbGljYXRpb25GYWlsdXJlKFxuICAgICAgICBmYWlsdXJlLm1lc3NhZ2UgPz8gdW5kZWZpbmVkLFxuICAgICAgICAnUmVzZXRXb3JrZmxvdycsXG4gICAgICAgIGZhbHNlLFxuICAgICAgICBhcnJheUZyb21QYXlsb2FkcyhwYXlsb2FkQ29udmVydGVyLCBmYWlsdXJlLnJlc2V0V29ya2Zsb3dGYWlsdXJlSW5mby5sYXN0SGVhcnRiZWF0RGV0YWlscz8ucGF5bG9hZHMpLFxuICAgICAgICB0aGlzLm9wdGlvbmFsRmFpbHVyZVRvT3B0aW9uYWxFcnJvcihmYWlsdXJlLmNhdXNlLCBwYXlsb2FkQ29udmVydGVyKVxuICAgICAgKTtcbiAgICB9XG4gICAgaWYgKGZhaWx1cmUuY2hpbGRXb3JrZmxvd0V4ZWN1dGlvbkZhaWx1cmVJbmZvKSB7XG4gICAgICBjb25zdCB7IG5hbWVzcGFjZSwgd29ya2Zsb3dUeXBlLCB3b3JrZmxvd0V4ZWN1dGlvbiwgcmV0cnlTdGF0ZSB9ID0gZmFpbHVyZS5jaGlsZFdvcmtmbG93RXhlY3V0aW9uRmFpbHVyZUluZm87XG4gICAgICBpZiAoISh3b3JrZmxvd1R5cGU/Lm5hbWUgJiYgd29ya2Zsb3dFeGVjdXRpb24pKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ01pc3NpbmcgYXR0cmlidXRlcyBvbiBjaGlsZFdvcmtmbG93RXhlY3V0aW9uRmFpbHVyZUluZm8nKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgQ2hpbGRXb3JrZmxvd0ZhaWx1cmUoXG4gICAgICAgIG5hbWVzcGFjZSA/PyB1bmRlZmluZWQsXG4gICAgICAgIHdvcmtmbG93RXhlY3V0aW9uLFxuICAgICAgICB3b3JrZmxvd1R5cGUubmFtZSxcbiAgICAgICAgcmV0cnlTdGF0ZSA/PyBSZXRyeVN0YXRlLlJFVFJZX1NUQVRFX1VOU1BFQ0lGSUVELFxuICAgICAgICB0aGlzLm9wdGlvbmFsRmFpbHVyZVRvT3B0aW9uYWxFcnJvcihmYWlsdXJlLmNhdXNlLCBwYXlsb2FkQ29udmVydGVyKVxuICAgICAgKTtcbiAgICB9XG4gICAgaWYgKGZhaWx1cmUuYWN0aXZpdHlGYWlsdXJlSW5mbykge1xuICAgICAgaWYgKCFmYWlsdXJlLmFjdGl2aXR5RmFpbHVyZUluZm8uYWN0aXZpdHlUeXBlPy5uYW1lKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ01pc3NpbmcgYWN0aXZpdHlUeXBlPy5uYW1lIG9uIGFjdGl2aXR5RmFpbHVyZUluZm8nKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgQWN0aXZpdHlGYWlsdXJlKFxuICAgICAgICBmYWlsdXJlLm1lc3NhZ2UgPz8gdW5kZWZpbmVkLFxuICAgICAgICBmYWlsdXJlLmFjdGl2aXR5RmFpbHVyZUluZm8uYWN0aXZpdHlUeXBlLm5hbWUsXG4gICAgICAgIGZhaWx1cmUuYWN0aXZpdHlGYWlsdXJlSW5mby5hY3Rpdml0eUlkID8/IHVuZGVmaW5lZCxcbiAgICAgICAgZmFpbHVyZS5hY3Rpdml0eUZhaWx1cmVJbmZvLnJldHJ5U3RhdGUgPz8gUmV0cnlTdGF0ZS5SRVRSWV9TVEFURV9VTlNQRUNJRklFRCxcbiAgICAgICAgZmFpbHVyZS5hY3Rpdml0eUZhaWx1cmVJbmZvLmlkZW50aXR5ID8/IHVuZGVmaW5lZCxcbiAgICAgICAgdGhpcy5vcHRpb25hbEZhaWx1cmVUb09wdGlvbmFsRXJyb3IoZmFpbHVyZS5jYXVzZSwgcGF5bG9hZENvbnZlcnRlcilcbiAgICAgICk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgVGVtcG9yYWxGYWlsdXJlKFxuICAgICAgZmFpbHVyZS5tZXNzYWdlID8/IHVuZGVmaW5lZCxcbiAgICAgIHRoaXMub3B0aW9uYWxGYWlsdXJlVG9PcHRpb25hbEVycm9yKGZhaWx1cmUuY2F1c2UsIHBheWxvYWRDb252ZXJ0ZXIpXG4gICAgKTtcbiAgfVxuXG4gIGZhaWx1cmVUb0Vycm9yKGZhaWx1cmU6IFByb3RvRmFpbHVyZSwgcGF5bG9hZENvbnZlcnRlcjogUGF5bG9hZENvbnZlcnRlcik6IFRlbXBvcmFsRmFpbHVyZSB7XG4gICAgaWYgKGZhaWx1cmUuZW5jb2RlZEF0dHJpYnV0ZXMpIHtcbiAgICAgIGNvbnN0IGF0dHJzID0gcGF5bG9hZENvbnZlcnRlci5mcm9tUGF5bG9hZDxEZWZhdWx0RW5jb2RlZEZhaWx1cmVBdHRyaWJ1dGVzPihmYWlsdXJlLmVuY29kZWRBdHRyaWJ1dGVzKTtcbiAgICAgIC8vIERvbid0IGFwcGx5IGVuY29kZWRBdHRyaWJ1dGVzIHVubGVzcyB0aGV5IGNvbmZvcm0gdG8gYW4gZXhwZWN0ZWQgc2NoZW1hXG4gICAgICBpZiAodHlwZW9mIGF0dHJzID09PSAnb2JqZWN0JyAmJiBhdHRycyAhPT0gbnVsbCkge1xuICAgICAgICBjb25zdCB7IG1lc3NhZ2UsIHN0YWNrX3RyYWNlIH0gPSBhdHRycztcbiAgICAgICAgLy8gQXZvaWQgbXV0YXRpbmcgdGhlIGFyZ3VtZW50XG4gICAgICAgIGZhaWx1cmUgPSB7IC4uLmZhaWx1cmUgfTtcbiAgICAgICAgaWYgKHR5cGVvZiBtZXNzYWdlID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIGZhaWx1cmUubWVzc2FnZSA9IG1lc3NhZ2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiBzdGFja190cmFjZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICBmYWlsdXJlLnN0YWNrVHJhY2UgPSBzdGFja190cmFjZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBlcnIgPSB0aGlzLmZhaWx1cmVUb0Vycm9ySW5uZXIoZmFpbHVyZSwgcGF5bG9hZENvbnZlcnRlcik7XG4gICAgZXJyLnN0YWNrID0gZmFpbHVyZS5zdGFja1RyYWNlID8/ICcnO1xuICAgIGVyci5mYWlsdXJlID0gZmFpbHVyZTtcbiAgICByZXR1cm4gZXJyO1xuICB9XG5cbiAgZXJyb3JUb0ZhaWx1cmUoZXJyOiB1bmtub3duLCBwYXlsb2FkQ29udmVydGVyOiBQYXlsb2FkQ29udmVydGVyKTogUHJvdG9GYWlsdXJlIHtcbiAgICBjb25zdCBmYWlsdXJlID0gdGhpcy5lcnJvclRvRmFpbHVyZUlubmVyKGVyciwgcGF5bG9hZENvbnZlcnRlcik7XG4gICAgaWYgKHRoaXMub3B0aW9ucy5lbmNvZGVDb21tb25BdHRyaWJ1dGVzKSB7XG4gICAgICBjb25zdCB7IG1lc3NhZ2UsIHN0YWNrVHJhY2UgfSA9IGZhaWx1cmU7XG4gICAgICBmYWlsdXJlLm1lc3NhZ2UgPSAnRW5jb2RlZCBmYWlsdXJlJztcbiAgICAgIGZhaWx1cmUuc3RhY2tUcmFjZSA9ICcnO1xuICAgICAgZmFpbHVyZS5lbmNvZGVkQXR0cmlidXRlcyA9IHBheWxvYWRDb252ZXJ0ZXIudG9QYXlsb2FkKHsgbWVzc2FnZSwgc3RhY2tfdHJhY2U6IHN0YWNrVHJhY2UgfSk7XG4gICAgfVxuICAgIHJldHVybiBmYWlsdXJlO1xuICB9XG5cbiAgZXJyb3JUb0ZhaWx1cmVJbm5lcihlcnI6IHVua25vd24sIHBheWxvYWRDb252ZXJ0ZXI6IFBheWxvYWRDb252ZXJ0ZXIpOiBQcm90b0ZhaWx1cmUge1xuICAgIGlmIChlcnIgaW5zdGFuY2VvZiBUZW1wb3JhbEZhaWx1cmUpIHtcbiAgICAgIGlmIChlcnIuZmFpbHVyZSkgcmV0dXJuIGVyci5mYWlsdXJlO1xuICAgICAgY29uc3QgYmFzZSA9IHtcbiAgICAgICAgbWVzc2FnZTogZXJyLm1lc3NhZ2UsXG4gICAgICAgIHN0YWNrVHJhY2U6IGN1dG9mZlN0YWNrVHJhY2UoZXJyLnN0YWNrKSxcbiAgICAgICAgY2F1c2U6IHRoaXMub3B0aW9uYWxFcnJvclRvT3B0aW9uYWxGYWlsdXJlKGVyci5jYXVzZSwgcGF5bG9hZENvbnZlcnRlciksXG4gICAgICAgIHNvdXJjZTogRkFJTFVSRV9TT1VSQ0UsXG4gICAgICB9O1xuXG4gICAgICBpZiAoZXJyIGluc3RhbmNlb2YgQWN0aXZpdHlGYWlsdXJlKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgLi4uYmFzZSxcbiAgICAgICAgICBhY3Rpdml0eUZhaWx1cmVJbmZvOiB7XG4gICAgICAgICAgICAuLi5lcnIsXG4gICAgICAgICAgICBhY3Rpdml0eVR5cGU6IHsgbmFtZTogZXJyLmFjdGl2aXR5VHlwZSB9LFxuICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICBpZiAoZXJyIGluc3RhbmNlb2YgQ2hpbGRXb3JrZmxvd0ZhaWx1cmUpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAuLi5iYXNlLFxuICAgICAgICAgIGNoaWxkV29ya2Zsb3dFeGVjdXRpb25GYWlsdXJlSW5mbzoge1xuICAgICAgICAgICAgLi4uZXJyLFxuICAgICAgICAgICAgd29ya2Zsb3dFeGVjdXRpb246IGVyci5leGVjdXRpb24sXG4gICAgICAgICAgICB3b3JrZmxvd1R5cGU6IHsgbmFtZTogZXJyLndvcmtmbG93VHlwZSB9LFxuICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICBpZiAoZXJyIGluc3RhbmNlb2YgQXBwbGljYXRpb25GYWlsdXJlKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgLi4uYmFzZSxcbiAgICAgICAgICBhcHBsaWNhdGlvbkZhaWx1cmVJbmZvOiB7XG4gICAgICAgICAgICB0eXBlOiBlcnIudHlwZSxcbiAgICAgICAgICAgIG5vblJldHJ5YWJsZTogZXJyLm5vblJldHJ5YWJsZSxcbiAgICAgICAgICAgIGRldGFpbHM6XG4gICAgICAgICAgICAgIGVyci5kZXRhaWxzICYmIGVyci5kZXRhaWxzLmxlbmd0aFxuICAgICAgICAgICAgICAgID8geyBwYXlsb2FkczogdG9QYXlsb2FkcyhwYXlsb2FkQ29udmVydGVyLCAuLi5lcnIuZGV0YWlscykgfVxuICAgICAgICAgICAgICAgIDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgbmV4dFJldHJ5RGVsYXk6IG1zT3B0aW9uYWxUb1RzKGVyci5uZXh0UmV0cnlEZWxheSksXG4gICAgICAgICAgfSxcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIGlmIChlcnIgaW5zdGFuY2VvZiBDYW5jZWxsZWRGYWlsdXJlKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgLi4uYmFzZSxcbiAgICAgICAgICBjYW5jZWxlZEZhaWx1cmVJbmZvOiB7XG4gICAgICAgICAgICBkZXRhaWxzOlxuICAgICAgICAgICAgICBlcnIuZGV0YWlscyAmJiBlcnIuZGV0YWlscy5sZW5ndGhcbiAgICAgICAgICAgICAgICA/IHsgcGF5bG9hZHM6IHRvUGF5bG9hZHMocGF5bG9hZENvbnZlcnRlciwgLi4uZXJyLmRldGFpbHMpIH1cbiAgICAgICAgICAgICAgICA6IHVuZGVmaW5lZCxcbiAgICAgICAgICB9LFxuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgaWYgKGVyciBpbnN0YW5jZW9mIFRpbWVvdXRGYWlsdXJlKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgLi4uYmFzZSxcbiAgICAgICAgICB0aW1lb3V0RmFpbHVyZUluZm86IHtcbiAgICAgICAgICAgIHRpbWVvdXRUeXBlOiBlcnIudGltZW91dFR5cGUsXG4gICAgICAgICAgICBsYXN0SGVhcnRiZWF0RGV0YWlsczogZXJyLmxhc3RIZWFydGJlYXREZXRhaWxzXG4gICAgICAgICAgICAgID8geyBwYXlsb2FkczogdG9QYXlsb2FkcyhwYXlsb2FkQ29udmVydGVyLCBlcnIubGFzdEhlYXJ0YmVhdERldGFpbHMpIH1cbiAgICAgICAgICAgICAgOiB1bmRlZmluZWQsXG4gICAgICAgICAgfSxcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIGlmIChlcnIgaW5zdGFuY2VvZiBTZXJ2ZXJGYWlsdXJlKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgLi4uYmFzZSxcbiAgICAgICAgICBzZXJ2ZXJGYWlsdXJlSW5mbzogeyBub25SZXRyeWFibGU6IGVyci5ub25SZXRyeWFibGUgfSxcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIGlmIChlcnIgaW5zdGFuY2VvZiBUZXJtaW5hdGVkRmFpbHVyZSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIC4uLmJhc2UsXG4gICAgICAgICAgdGVybWluYXRlZEZhaWx1cmVJbmZvOiB7fSxcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIC8vIEp1c3QgYSBUZW1wb3JhbEZhaWx1cmVcbiAgICAgIHJldHVybiBiYXNlO1xuICAgIH1cblxuICAgIGNvbnN0IGJhc2UgPSB7XG4gICAgICBzb3VyY2U6IEZBSUxVUkVfU09VUkNFLFxuICAgIH07XG5cbiAgICBpZiAoaXNFcnJvcihlcnIpKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICAuLi5iYXNlLFxuICAgICAgICBtZXNzYWdlOiBTdHJpbmcoZXJyLm1lc3NhZ2UpID8/ICcnLFxuICAgICAgICBzdGFja1RyYWNlOiBjdXRvZmZTdGFja1RyYWNlKGVyci5zdGFjayksXG4gICAgICAgIGNhdXNlOiB0aGlzLm9wdGlvbmFsRXJyb3JUb09wdGlvbmFsRmFpbHVyZSgoZXJyIGFzIGFueSkuY2F1c2UsIHBheWxvYWRDb252ZXJ0ZXIpLFxuICAgICAgfTtcbiAgICB9XG5cbiAgICBjb25zdCByZWNvbW1lbmRhdGlvbiA9IGAgW0Egbm9uLUVycm9yIHZhbHVlIHdhcyB0aHJvd24gZnJvbSB5b3VyIGNvZGUuIFdlIHJlY29tbWVuZCB0aHJvd2luZyBFcnJvciBvYmplY3RzIHNvIHRoYXQgd2UgY2FuIHByb3ZpZGUgYSBzdGFjayB0cmFjZV1gO1xuXG4gICAgaWYgKHR5cGVvZiBlcnIgPT09ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm4geyAuLi5iYXNlLCBtZXNzYWdlOiBlcnIgKyByZWNvbW1lbmRhdGlvbiB9O1xuICAgIH1cbiAgICBpZiAodHlwZW9mIGVyciA9PT0gJ29iamVjdCcpIHtcbiAgICAgIGxldCBtZXNzYWdlID0gJyc7XG4gICAgICB0cnkge1xuICAgICAgICBtZXNzYWdlID0gSlNPTi5zdHJpbmdpZnkoZXJyKTtcbiAgICAgIH0gY2F0Y2ggKF9lcnIpIHtcbiAgICAgICAgbWVzc2FnZSA9IFN0cmluZyhlcnIpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHsgLi4uYmFzZSwgbWVzc2FnZTogbWVzc2FnZSArIHJlY29tbWVuZGF0aW9uIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIHsgLi4uYmFzZSwgbWVzc2FnZTogU3RyaW5nKGVycikgKyByZWNvbW1lbmRhdGlvbiB9O1xuICB9XG5cbiAgLyoqXG4gICAqIENvbnZlcnRzIGEgRmFpbHVyZSBwcm90byBtZXNzYWdlIHRvIGEgSlMgRXJyb3Igb2JqZWN0IGlmIGRlZmluZWQgb3IgcmV0dXJucyB1bmRlZmluZWQuXG4gICAqL1xuICBvcHRpb25hbEZhaWx1cmVUb09wdGlvbmFsRXJyb3IoXG4gICAgZmFpbHVyZTogUHJvdG9GYWlsdXJlIHwgdW5kZWZpbmVkIHwgbnVsbCxcbiAgICBwYXlsb2FkQ29udmVydGVyOiBQYXlsb2FkQ29udmVydGVyXG4gICk6IFRlbXBvcmFsRmFpbHVyZSB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIGZhaWx1cmUgPyB0aGlzLmZhaWx1cmVUb0Vycm9yKGZhaWx1cmUsIHBheWxvYWRDb252ZXJ0ZXIpIDogdW5kZWZpbmVkO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbnZlcnRzIGFuIGVycm9yIHRvIGEgRmFpbHVyZSBwcm90byBtZXNzYWdlIGlmIGRlZmluZWQgb3IgcmV0dXJucyB1bmRlZmluZWRcbiAgICovXG4gIG9wdGlvbmFsRXJyb3JUb09wdGlvbmFsRmFpbHVyZShlcnI6IHVua25vd24sIHBheWxvYWRDb252ZXJ0ZXI6IFBheWxvYWRDb252ZXJ0ZXIpOiBQcm90b0ZhaWx1cmUgfCB1bmRlZmluZWQge1xuICAgIHJldHVybiBlcnIgPyB0aGlzLmVycm9yVG9GYWlsdXJlKGVyciwgcGF5bG9hZENvbnZlcnRlcikgOiB1bmRlZmluZWQ7XG4gIH1cbn1cbiIsImltcG9ydCB7IFBheWxvYWQgfSBmcm9tICcuLi9pbnRlcmZhY2VzJztcblxuLyoqXG4gKiBgUGF5bG9hZENvZGVjYCBpcyBhbiBvcHRpb25hbCBzdGVwIHRoYXQgaGFwcGVucyBiZXR3ZWVuIHRoZSB3aXJlIGFuZCB0aGUge0BsaW5rIFBheWxvYWRDb252ZXJ0ZXJ9OlxuICpcbiAqIFRlbXBvcmFsIFNlcnZlciA8LS0+IFdpcmUgPC0tPiBgUGF5bG9hZENvZGVjYCA8LS0+IGBQYXlsb2FkQ29udmVydGVyYCA8LS0+IFVzZXIgY29kZVxuICpcbiAqIEltcGxlbWVudCB0aGlzIHRvIHRyYW5zZm9ybSBhbiBhcnJheSBvZiB7QGxpbmsgUGF5bG9hZH1zIHRvL2Zyb20gdGhlIGZvcm1hdCBzZW50IG92ZXIgdGhlIHdpcmUgYW5kIHN0b3JlZCBieSBUZW1wb3JhbCBTZXJ2ZXIuXG4gKiBDb21tb24gdHJhbnNmb3JtYXRpb25zIGFyZSBlbmNyeXB0aW9uIGFuZCBjb21wcmVzc2lvbi5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBQYXlsb2FkQ29kZWMge1xuICAvKipcbiAgICogRW5jb2RlIGFuIGFycmF5IG9mIHtAbGluayBQYXlsb2FkfXMgZm9yIHNlbmRpbmcgb3ZlciB0aGUgd2lyZS5cbiAgICogQHBhcmFtIHBheWxvYWRzIE1heSBoYXZlIGxlbmd0aCAwLlxuICAgKi9cbiAgZW5jb2RlKHBheWxvYWRzOiBQYXlsb2FkW10pOiBQcm9taXNlPFBheWxvYWRbXT47XG5cbiAgLyoqXG4gICAqIERlY29kZSBhbiBhcnJheSBvZiB7QGxpbmsgUGF5bG9hZH1zIHJlY2VpdmVkIGZyb20gdGhlIHdpcmUuXG4gICAqL1xuICBkZWNvZGUocGF5bG9hZHM6IFBheWxvYWRbXSk6IFByb21pc2U8UGF5bG9hZFtdPjtcbn1cbiIsImltcG9ydCB7IGRlY29kZSwgZW5jb2RlIH0gZnJvbSAnLi4vZW5jb2RpbmcnO1xuaW1wb3J0IHsgUGF5bG9hZENvbnZlcnRlckVycm9yLCBWYWx1ZUVycm9yIH0gZnJvbSAnLi4vZXJyb3JzJztcbmltcG9ydCB7IFBheWxvYWQgfSBmcm9tICcuLi9pbnRlcmZhY2VzJztcbmltcG9ydCB7IGVuY29kaW5nS2V5cywgZW5jb2RpbmdUeXBlcywgTUVUQURBVEFfRU5DT0RJTkdfS0VZIH0gZnJvbSAnLi90eXBlcyc7XG5cbi8qKlxuICogVXNlZCBieSB0aGUgZnJhbWV3b3JrIHRvIHNlcmlhbGl6ZS9kZXNlcmlhbGl6ZSBkYXRhIGxpa2UgcGFyYW1ldGVycyBhbmQgcmV0dXJuIHZhbHVlcy5cbiAqXG4gKiBUaGlzIGlzIGNhbGxlZCBpbnNpZGUgdGhlIHtAbGluayBodHRwczovL2RvY3MudGVtcG9yYWwuaW8vdHlwZXNjcmlwdC9kZXRlcm1pbmlzbSB8IFdvcmtmbG93IGlzb2xhdGV9LlxuICogVG8gd3JpdGUgYXN5bmMgY29kZSBvciB1c2UgTm9kZSBBUElzIChvciB1c2UgcGFja2FnZXMgdGhhdCB1c2UgTm9kZSBBUElzKSwgdXNlIGEge0BsaW5rIFBheWxvYWRDb2RlY30uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUGF5bG9hZENvbnZlcnRlciB7XG4gIC8qKlxuICAgKiBDb252ZXJ0cyBhIHZhbHVlIHRvIGEge0BsaW5rIFBheWxvYWR9LlxuICAgKlxuICAgKiBAcGFyYW0gdmFsdWUgVGhlIHZhbHVlIHRvIGNvbnZlcnQuIEV4YW1wbGUgdmFsdWVzIGluY2x1ZGUgdGhlIFdvcmtmbG93IGFyZ3Mgc2VudCBmcm9tIHRoZSBDbGllbnQgYW5kIHRoZSB2YWx1ZXMgcmV0dXJuZWQgYnkgYSBXb3JrZmxvdyBvciBBY3Rpdml0eS5cbiAgICpcbiAgICogQHJldHVybnMgVGhlIHtAbGluayBQYXlsb2FkfS5cbiAgICpcbiAgICogU2hvdWxkIHRocm93IHtAbGluayBWYWx1ZUVycm9yfSBpZiB1bmFibGUgdG8gY29udmVydC5cbiAgICovXG4gIHRvUGF5bG9hZDxUPih2YWx1ZTogVCk6IFBheWxvYWQ7XG5cbiAgLyoqXG4gICAqIENvbnZlcnRzIGEge0BsaW5rIFBheWxvYWR9IGJhY2sgdG8gYSB2YWx1ZS5cbiAgICovXG4gIGZyb21QYXlsb2FkPFQ+KHBheWxvYWQ6IFBheWxvYWQpOiBUO1xufVxuXG4vKipcbiAqIEltcGxlbWVudHMgY29udmVyc2lvbiBvZiBhIGxpc3Qgb2YgdmFsdWVzLlxuICpcbiAqIEBwYXJhbSBjb252ZXJ0ZXJcbiAqIEBwYXJhbSB2YWx1ZXMgSlMgdmFsdWVzIHRvIGNvbnZlcnQgdG8gUGF5bG9hZHNcbiAqIEByZXR1cm4gbGlzdCBvZiB7QGxpbmsgUGF5bG9hZH1zXG4gKiBAdGhyb3dzIHtAbGluayBWYWx1ZUVycm9yfSBpZiBjb252ZXJzaW9uIG9mIHRoZSB2YWx1ZSBwYXNzZWQgYXMgcGFyYW1ldGVyIGZhaWxlZCBmb3IgYW55XG4gKiAgICAgcmVhc29uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdG9QYXlsb2Fkcyhjb252ZXJ0ZXI6IFBheWxvYWRDb252ZXJ0ZXIsIC4uLnZhbHVlczogdW5rbm93bltdKTogUGF5bG9hZFtdIHwgdW5kZWZpbmVkIHtcbiAgaWYgKHZhbHVlcy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG5cbiAgcmV0dXJuIHZhbHVlcy5tYXAoKHZhbHVlKSA9PiBjb252ZXJ0ZXIudG9QYXlsb2FkKHZhbHVlKSk7XG59XG5cbi8qKlxuICogUnVuIHtAbGluayBQYXlsb2FkQ29udmVydGVyLnRvUGF5bG9hZH0gb24gZWFjaCB2YWx1ZSBpbiB0aGUgbWFwLlxuICpcbiAqIEB0aHJvd3Mge0BsaW5rIFZhbHVlRXJyb3J9IGlmIGNvbnZlcnNpb24gb2YgYW55IHZhbHVlIGluIHRoZSBtYXAgZmFpbHNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1hcFRvUGF5bG9hZHM8SyBleHRlbmRzIHN0cmluZz4oY29udmVydGVyOiBQYXlsb2FkQ29udmVydGVyLCBtYXA6IFJlY29yZDxLLCBhbnk+KTogUmVjb3JkPEssIFBheWxvYWQ+IHtcbiAgcmV0dXJuIE9iamVjdC5mcm9tRW50cmllcyhcbiAgICBPYmplY3QuZW50cmllcyhtYXApLm1hcCgoW2ssIHZdKTogW0ssIFBheWxvYWRdID0+IFtrIGFzIEssIGNvbnZlcnRlci50b1BheWxvYWQodildKVxuICApIGFzIFJlY29yZDxLLCBQYXlsb2FkPjtcbn1cblxuLyoqXG4gKiBJbXBsZW1lbnRzIGNvbnZlcnNpb24gb2YgYW4gYXJyYXkgb2YgdmFsdWVzIG9mIGRpZmZlcmVudCB0eXBlcy4gVXNlZnVsIGZvciBkZXNlcmlhbGl6aW5nXG4gKiBhcmd1bWVudHMgb2YgZnVuY3Rpb24gaW52b2NhdGlvbnMuXG4gKlxuICogQHBhcmFtIGNvbnZlcnRlclxuICogQHBhcmFtIGluZGV4IGluZGV4IG9mIHRoZSB2YWx1ZSBpbiB0aGUgcGF5bG9hZHNcbiAqIEBwYXJhbSBwYXlsb2FkcyBzZXJpYWxpemVkIHZhbHVlIHRvIGNvbnZlcnQgdG8gSlMgdmFsdWVzLlxuICogQHJldHVybiBjb252ZXJ0ZWQgSlMgdmFsdWVcbiAqIEB0aHJvd3Mge0BsaW5rIFBheWxvYWRDb252ZXJ0ZXJFcnJvcn0gaWYgY29udmVyc2lvbiBvZiB0aGUgZGF0YSBwYXNzZWQgYXMgcGFyYW1ldGVyIGZhaWxlZCBmb3IgYW55XG4gKiAgICAgcmVhc29uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZnJvbVBheWxvYWRzQXRJbmRleDxUPihjb252ZXJ0ZXI6IFBheWxvYWRDb252ZXJ0ZXIsIGluZGV4OiBudW1iZXIsIHBheWxvYWRzPzogUGF5bG9hZFtdIHwgbnVsbCk6IFQge1xuICAvLyBUbyBtYWtlIGFkZGluZyBhcmd1bWVudHMgYSBiYWNrd2FyZHMgY29tcGF0aWJsZSBjaGFuZ2VcbiAgaWYgKHBheWxvYWRzID09PSB1bmRlZmluZWQgfHwgcGF5bG9hZHMgPT09IG51bGwgfHwgaW5kZXggPj0gcGF5bG9hZHMubGVuZ3RoKSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZCBhcyBhbnk7XG4gIH1cbiAgcmV0dXJuIGNvbnZlcnRlci5mcm9tUGF5bG9hZChwYXlsb2Fkc1tpbmRleF0pO1xufVxuXG4vKipcbiAqIFJ1biB7QGxpbmsgUGF5bG9hZENvbnZlcnRlci5mcm9tUGF5bG9hZH0gb24gZWFjaCB2YWx1ZSBpbiB0aGUgYXJyYXkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhcnJheUZyb21QYXlsb2Fkcyhjb252ZXJ0ZXI6IFBheWxvYWRDb252ZXJ0ZXIsIHBheWxvYWRzPzogUGF5bG9hZFtdIHwgbnVsbCk6IHVua25vd25bXSB7XG4gIGlmICghcGF5bG9hZHMpIHtcbiAgICByZXR1cm4gW107XG4gIH1cbiAgcmV0dXJuIHBheWxvYWRzLm1hcCgocGF5bG9hZDogUGF5bG9hZCkgPT4gY29udmVydGVyLmZyb21QYXlsb2FkKHBheWxvYWQpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1hcEZyb21QYXlsb2FkczxLIGV4dGVuZHMgc3RyaW5nPihcbiAgY29udmVydGVyOiBQYXlsb2FkQ29udmVydGVyLFxuICBtYXA/OiBSZWNvcmQ8SywgUGF5bG9hZD4gfCBudWxsIHwgdW5kZWZpbmVkXG4pOiBSZWNvcmQ8SywgdW5rbm93bj4gfCB1bmRlZmluZWQge1xuICBpZiAobWFwID09IG51bGwpIHJldHVybiB1bmRlZmluZWQ7XG4gIHJldHVybiBPYmplY3QuZnJvbUVudHJpZXMoXG4gICAgT2JqZWN0LmVudHJpZXMobWFwKS5tYXAoKFtrLCBwYXlsb2FkXSk6IFtLLCB1bmtub3duXSA9PiB7XG4gICAgICBjb25zdCB2YWx1ZSA9IGNvbnZlcnRlci5mcm9tUGF5bG9hZChwYXlsb2FkIGFzIFBheWxvYWQpO1xuICAgICAgcmV0dXJuIFtrIGFzIEssIHZhbHVlXTtcbiAgICB9KVxuICApIGFzIFJlY29yZDxLLCB1bmtub3duPjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBQYXlsb2FkQ29udmVydGVyV2l0aEVuY29kaW5nIHtcbiAgLyoqXG4gICAqIENvbnZlcnRzIGEgdmFsdWUgdG8gYSB7QGxpbmsgUGF5bG9hZH0uXG4gICAqXG4gICAqIEBwYXJhbSB2YWx1ZSBUaGUgdmFsdWUgdG8gY29udmVydC4gRXhhbXBsZSB2YWx1ZXMgaW5jbHVkZSB0aGUgV29ya2Zsb3cgYXJncyBzZW50IGZyb20gdGhlIENsaWVudCBhbmQgdGhlIHZhbHVlcyByZXR1cm5lZCBieSBhIFdvcmtmbG93IG9yIEFjdGl2aXR5LlxuICAgKiBAcmV0dXJucyBUaGUge0BsaW5rIFBheWxvYWR9LCBvciBgdW5kZWZpbmVkYCBpZiB1bmFibGUgdG8gY29udmVydC5cbiAgICovXG4gIHRvUGF5bG9hZDxUPih2YWx1ZTogVCk6IFBheWxvYWQgfCB1bmRlZmluZWQ7XG5cbiAgLyoqXG4gICAqIENvbnZlcnRzIGEge0BsaW5rIFBheWxvYWR9IGJhY2sgdG8gYSB2YWx1ZS5cbiAgICovXG4gIGZyb21QYXlsb2FkPFQ+KHBheWxvYWQ6IFBheWxvYWQpOiBUO1xuXG4gIHJlYWRvbmx5IGVuY29kaW5nVHlwZTogc3RyaW5nO1xufVxuXG4vKipcbiAqIFRyaWVzIHRvIGNvbnZlcnQgdmFsdWVzIHRvIHtAbGluayBQYXlsb2FkfXMgdXNpbmcgdGhlIHtAbGluayBQYXlsb2FkQ29udmVydGVyV2l0aEVuY29kaW5nfXMgcHJvdmlkZWQgdG8gdGhlIGNvbnN0cnVjdG9yLCBpbiB0aGUgb3JkZXIgcHJvdmlkZWQuXG4gKlxuICogQ29udmVydHMgUGF5bG9hZHMgdG8gdmFsdWVzIGJhc2VkIG9uIHRoZSBgUGF5bG9hZC5tZXRhZGF0YS5lbmNvZGluZ2AgZmllbGQsIHdoaWNoIG1hdGNoZXMgdGhlIHtAbGluayBQYXlsb2FkQ29udmVydGVyV2l0aEVuY29kaW5nLmVuY29kaW5nVHlwZX1cbiAqIG9mIHRoZSBjb252ZXJ0ZXIgdGhhdCBjcmVhdGVkIHRoZSBQYXlsb2FkLlxuICovXG5leHBvcnQgY2xhc3MgQ29tcG9zaXRlUGF5bG9hZENvbnZlcnRlciBpbXBsZW1lbnRzIFBheWxvYWRDb252ZXJ0ZXIge1xuICByZWFkb25seSBjb252ZXJ0ZXJzOiBQYXlsb2FkQ29udmVydGVyV2l0aEVuY29kaW5nW107XG4gIHJlYWRvbmx5IGNvbnZlcnRlckJ5RW5jb2Rpbmc6IE1hcDxzdHJpbmcsIFBheWxvYWRDb252ZXJ0ZXJXaXRoRW5jb2Rpbmc+ID0gbmV3IE1hcCgpO1xuXG4gIGNvbnN0cnVjdG9yKC4uLmNvbnZlcnRlcnM6IFBheWxvYWRDb252ZXJ0ZXJXaXRoRW5jb2RpbmdbXSkge1xuICAgIGlmIChjb252ZXJ0ZXJzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgdGhyb3cgbmV3IFBheWxvYWRDb252ZXJ0ZXJFcnJvcignTXVzdCBwcm92aWRlIGF0IGxlYXN0IG9uZSBQYXlsb2FkQ29udmVydGVyV2l0aEVuY29kaW5nJyk7XG4gICAgfVxuXG4gICAgdGhpcy5jb252ZXJ0ZXJzID0gY29udmVydGVycztcbiAgICBmb3IgKGNvbnN0IGNvbnZlcnRlciBvZiBjb252ZXJ0ZXJzKSB7XG4gICAgICB0aGlzLmNvbnZlcnRlckJ5RW5jb2Rpbmcuc2V0KGNvbnZlcnRlci5lbmNvZGluZ1R5cGUsIGNvbnZlcnRlcik7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFRyaWVzIHRvIHJ1biBgLnRvUGF5bG9hZCh2YWx1ZSlgIG9uIGVhY2ggY29udmVydGVyIGluIHRoZSBvcmRlciBwcm92aWRlZCBhdCBjb25zdHJ1Y3Rpb24uXG4gICAqIFJldHVybnMgdGhlIGZpcnN0IHN1Y2Nlc3NmdWwgcmVzdWx0LCB0aHJvd3Mge0BsaW5rIFZhbHVlRXJyb3J9IGlmIHRoZXJlIGlzIG5vIGNvbnZlcnRlciB0aGF0IGNhbiBoYW5kbGUgdGhlIHZhbHVlLlxuICAgKi9cbiAgcHVibGljIHRvUGF5bG9hZDxUPih2YWx1ZTogVCk6IFBheWxvYWQge1xuICAgIGZvciAoY29uc3QgY29udmVydGVyIG9mIHRoaXMuY29udmVydGVycykge1xuICAgICAgY29uc3QgcmVzdWx0ID0gY29udmVydGVyLnRvUGF5bG9hZCh2YWx1ZSk7XG4gICAgICBpZiAocmVzdWx0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aHJvdyBuZXcgVmFsdWVFcnJvcihgVW5hYmxlIHRvIGNvbnZlcnQgJHt2YWx1ZX0gdG8gcGF5bG9hZGApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJ1biB7QGxpbmsgUGF5bG9hZENvbnZlcnRlcldpdGhFbmNvZGluZy5mcm9tUGF5bG9hZH0gYmFzZWQgb24gdGhlIGBlbmNvZGluZ2AgbWV0YWRhdGEgb2YgdGhlIHtAbGluayBQYXlsb2FkfS5cbiAgICovXG4gIHB1YmxpYyBmcm9tUGF5bG9hZDxUPihwYXlsb2FkOiBQYXlsb2FkKTogVCB7XG4gICAgaWYgKHBheWxvYWQubWV0YWRhdGEgPT09IHVuZGVmaW5lZCB8fCBwYXlsb2FkLm1ldGFkYXRhID09PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgVmFsdWVFcnJvcignTWlzc2luZyBwYXlsb2FkIG1ldGFkYXRhJyk7XG4gICAgfVxuICAgIGNvbnN0IGVuY29kaW5nID0gZGVjb2RlKHBheWxvYWQubWV0YWRhdGFbTUVUQURBVEFfRU5DT0RJTkdfS0VZXSk7XG4gICAgY29uc3QgY29udmVydGVyID0gdGhpcy5jb252ZXJ0ZXJCeUVuY29kaW5nLmdldChlbmNvZGluZyk7XG4gICAgaWYgKGNvbnZlcnRlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgVmFsdWVFcnJvcihgVW5rbm93biBlbmNvZGluZzogJHtlbmNvZGluZ31gKTtcbiAgICB9XG4gICAgcmV0dXJuIGNvbnZlcnRlci5mcm9tUGF5bG9hZChwYXlsb2FkKTtcbiAgfVxufVxuXG4vKipcbiAqIENvbnZlcnRzIGJldHdlZW4gSlMgdW5kZWZpbmVkIGFuZCBOVUxMIFBheWxvYWRcbiAqL1xuZXhwb3J0IGNsYXNzIFVuZGVmaW5lZFBheWxvYWRDb252ZXJ0ZXIgaW1wbGVtZW50cyBQYXlsb2FkQ29udmVydGVyV2l0aEVuY29kaW5nIHtcbiAgcHVibGljIGVuY29kaW5nVHlwZSA9IGVuY29kaW5nVHlwZXMuTUVUQURBVEFfRU5DT0RJTkdfTlVMTDtcblxuICBwdWJsaWMgdG9QYXlsb2FkKHZhbHVlOiB1bmtub3duKTogUGF5bG9hZCB8IHVuZGVmaW5lZCB7XG4gICAgaWYgKHZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIG1ldGFkYXRhOiB7XG4gICAgICAgIFtNRVRBREFUQV9FTkNPRElOR19LRVldOiBlbmNvZGluZ0tleXMuTUVUQURBVEFfRU5DT0RJTkdfTlVMTCxcbiAgICAgIH0sXG4gICAgfTtcbiAgfVxuXG4gIHB1YmxpYyBmcm9tUGF5bG9hZDxUPihfY29udGVudDogUGF5bG9hZCk6IFQge1xuICAgIHJldHVybiB1bmRlZmluZWQgYXMgYW55OyAvLyBKdXN0IHJldHVybiB1bmRlZmluZWRcbiAgfVxufVxuXG4vKipcbiAqIENvbnZlcnRzIGJldHdlZW4gYmluYXJ5IGRhdGEgdHlwZXMgYW5kIFJBVyBQYXlsb2FkXG4gKi9cbmV4cG9ydCBjbGFzcyBCaW5hcnlQYXlsb2FkQ29udmVydGVyIGltcGxlbWVudHMgUGF5bG9hZENvbnZlcnRlcldpdGhFbmNvZGluZyB7XG4gIHB1YmxpYyBlbmNvZGluZ1R5cGUgPSBlbmNvZGluZ1R5cGVzLk1FVEFEQVRBX0VOQ09ESU5HX1JBVztcblxuICBwdWJsaWMgdG9QYXlsb2FkKHZhbHVlOiB1bmtub3duKTogUGF5bG9hZCB8IHVuZGVmaW5lZCB7XG4gICAgaWYgKCEodmFsdWUgaW5zdGFuY2VvZiBVaW50OEFycmF5KSkge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgbWV0YWRhdGE6IHtcbiAgICAgICAgW01FVEFEQVRBX0VOQ09ESU5HX0tFWV06IGVuY29kaW5nS2V5cy5NRVRBREFUQV9FTkNPRElOR19SQVcsXG4gICAgICB9LFxuICAgICAgZGF0YTogdmFsdWUsXG4gICAgfTtcbiAgfVxuXG4gIHB1YmxpYyBmcm9tUGF5bG9hZDxUPihjb250ZW50OiBQYXlsb2FkKTogVCB7XG4gICAgcmV0dXJuIChcbiAgICAgIC8vIFdyYXAgd2l0aCBVaW50OEFycmF5IGZyb20gdGhpcyBjb250ZXh0IHRvIGVuc3VyZSBgaW5zdGFuY2VvZmAgd29ya3NcbiAgICAgIChcbiAgICAgICAgY29udGVudC5kYXRhID8gbmV3IFVpbnQ4QXJyYXkoY29udGVudC5kYXRhLmJ1ZmZlciwgY29udGVudC5kYXRhLmJ5dGVPZmZzZXQsIGNvbnRlbnQuZGF0YS5sZW5ndGgpIDogY29udGVudC5kYXRhXG4gICAgICApIGFzIGFueVxuICAgICk7XG4gIH1cbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBiZXR3ZWVuIG5vbi11bmRlZmluZWQgdmFsdWVzIGFuZCBzZXJpYWxpemVkIEpTT04gUGF5bG9hZFxuICovXG5leHBvcnQgY2xhc3MgSnNvblBheWxvYWRDb252ZXJ0ZXIgaW1wbGVtZW50cyBQYXlsb2FkQ29udmVydGVyV2l0aEVuY29kaW5nIHtcbiAgcHVibGljIGVuY29kaW5nVHlwZSA9IGVuY29kaW5nVHlwZXMuTUVUQURBVEFfRU5DT0RJTkdfSlNPTjtcblxuICBwdWJsaWMgdG9QYXlsb2FkKHZhbHVlOiB1bmtub3duKTogUGF5bG9hZCB8IHVuZGVmaW5lZCB7XG4gICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgbGV0IGpzb247XG4gICAgdHJ5IHtcbiAgICAgIGpzb24gPSBKU09OLnN0cmluZ2lmeSh2YWx1ZSk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBtZXRhZGF0YToge1xuICAgICAgICBbTUVUQURBVEFfRU5DT0RJTkdfS0VZXTogZW5jb2RpbmdLZXlzLk1FVEFEQVRBX0VOQ09ESU5HX0pTT04sXG4gICAgICB9LFxuICAgICAgZGF0YTogZW5jb2RlKGpzb24pLFxuICAgIH07XG4gIH1cblxuICBwdWJsaWMgZnJvbVBheWxvYWQ8VD4oY29udGVudDogUGF5bG9hZCk6IFQge1xuICAgIGlmIChjb250ZW50LmRhdGEgPT09IHVuZGVmaW5lZCB8fCBjb250ZW50LmRhdGEgPT09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBWYWx1ZUVycm9yKCdHb3QgcGF5bG9hZCB3aXRoIG5vIGRhdGEnKTtcbiAgICB9XG4gICAgcmV0dXJuIEpTT04ucGFyc2UoZGVjb2RlKGNvbnRlbnQuZGF0YSkpO1xuICB9XG59XG5cbi8qKlxuICogQ29udmVydHMgU2VhcmNoIEF0dHJpYnV0ZSB2YWx1ZXMgdXNpbmcgSnNvblBheWxvYWRDb252ZXJ0ZXJcbiAqL1xuZXhwb3J0IGNsYXNzIFNlYXJjaEF0dHJpYnV0ZVBheWxvYWRDb252ZXJ0ZXIgaW1wbGVtZW50cyBQYXlsb2FkQ29udmVydGVyIHtcbiAganNvbkNvbnZlcnRlciA9IG5ldyBKc29uUGF5bG9hZENvbnZlcnRlcigpO1xuICB2YWxpZE5vbkRhdGVUeXBlcyA9IFsnc3RyaW5nJywgJ251bWJlcicsICdib29sZWFuJ107XG5cbiAgcHVibGljIHRvUGF5bG9hZCh2YWx1ZXM6IHVua25vd24pOiBQYXlsb2FkIHtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkodmFsdWVzKSkge1xuICAgICAgdGhyb3cgbmV3IFZhbHVlRXJyb3IoYFNlYXJjaEF0dHJpYnV0ZSB2YWx1ZSBtdXN0IGJlIGFuIGFycmF5YCk7XG4gICAgfVxuXG4gICAgaWYgKHZhbHVlcy5sZW5ndGggPiAwKSB7XG4gICAgICBjb25zdCBmaXJzdFZhbHVlID0gdmFsdWVzWzBdO1xuICAgICAgY29uc3QgZmlyc3RUeXBlID0gdHlwZW9mIGZpcnN0VmFsdWU7XG4gICAgICBpZiAoZmlyc3RUeXBlID09PSAnb2JqZWN0Jykge1xuICAgICAgICBmb3IgKGNvbnN0IFtpZHgsIHZhbHVlXSBvZiB2YWx1ZXMuZW50cmllcygpKSB7XG4gICAgICAgICAgaWYgKCEodmFsdWUgaW5zdGFuY2VvZiBEYXRlKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFZhbHVlRXJyb3IoXG4gICAgICAgICAgICAgIGBTZWFyY2hBdHRyaWJ1dGUgdmFsdWVzIG11c3QgYXJyYXlzIG9mIHN0cmluZ3MsIG51bWJlcnMsIGJvb2xlYW5zLCBvciBEYXRlcy4gVGhlIHZhbHVlICR7dmFsdWV9IGF0IGluZGV4ICR7aWR4fSBpcyBvZiB0eXBlICR7dHlwZW9mIHZhbHVlfWBcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoIXRoaXMudmFsaWROb25EYXRlVHlwZXMuaW5jbHVkZXMoZmlyc3RUeXBlKSkge1xuICAgICAgICAgIHRocm93IG5ldyBWYWx1ZUVycm9yKGBTZWFyY2hBdHRyaWJ1dGUgYXJyYXkgdmFsdWVzIG11c3QgYmU6IHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW4gfCBEYXRlYCk7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGNvbnN0IFtpZHgsIHZhbHVlXSBvZiB2YWx1ZXMuZW50cmllcygpKSB7XG4gICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gZmlyc3RUeXBlKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVmFsdWVFcnJvcihcbiAgICAgICAgICAgICAgYEFsbCBTZWFyY2hBdHRyaWJ1dGUgYXJyYXkgdmFsdWVzIG11c3QgYmUgb2YgdGhlIHNhbWUgdHlwZS4gVGhlIGZpcnN0IHZhbHVlICR7Zmlyc3RWYWx1ZX0gb2YgdHlwZSAke2ZpcnN0VHlwZX0gZG9lc24ndCBtYXRjaCB2YWx1ZSAke3ZhbHVlfSBvZiB0eXBlICR7dHlwZW9mIHZhbHVlfSBhdCBpbmRleCAke2lkeH1gXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEpTT04uc3RyaW5naWZ5IHRha2VzIGNhcmUgb2YgY29udmVydGluZyBEYXRlcyB0byBJU08gc3RyaW5nc1xuICAgIGNvbnN0IHJldCA9IHRoaXMuanNvbkNvbnZlcnRlci50b1BheWxvYWQodmFsdWVzKTtcbiAgICBpZiAocmV0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBWYWx1ZUVycm9yKCdDb3VsZCBub3QgY29udmVydCBzZWFyY2ggYXR0cmlidXRlcyB0byBwYXlsb2FkcycpO1xuICAgIH1cbiAgICByZXR1cm4gcmV0O1xuICB9XG5cbiAgLyoqXG4gICAqIERhdGV0aW1lIFNlYXJjaCBBdHRyaWJ1dGUgdmFsdWVzIGFyZSBjb252ZXJ0ZWQgdG8gYERhdGVgc1xuICAgKi9cbiAgcHVibGljIGZyb21QYXlsb2FkPFQ+KHBheWxvYWQ6IFBheWxvYWQpOiBUIHtcbiAgICBpZiAocGF5bG9hZC5tZXRhZGF0YSA9PT0gdW5kZWZpbmVkIHx8IHBheWxvYWQubWV0YWRhdGEgPT09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBWYWx1ZUVycm9yKCdNaXNzaW5nIHBheWxvYWQgbWV0YWRhdGEnKTtcbiAgICB9XG5cbiAgICBjb25zdCB2YWx1ZSA9IHRoaXMuanNvbkNvbnZlcnRlci5mcm9tUGF5bG9hZChwYXlsb2FkKTtcbiAgICBsZXQgYXJyYXlXcmFwcGVkVmFsdWUgPSBBcnJheS5pc0FycmF5KHZhbHVlKSA/IHZhbHVlIDogW3ZhbHVlXTtcblxuICAgIGNvbnN0IHNlYXJjaEF0dHJpYnV0ZVR5cGUgPSBkZWNvZGUocGF5bG9hZC5tZXRhZGF0YS50eXBlKTtcbiAgICBpZiAoc2VhcmNoQXR0cmlidXRlVHlwZSA9PT0gJ0RhdGV0aW1lJykge1xuICAgICAgYXJyYXlXcmFwcGVkVmFsdWUgPSBhcnJheVdyYXBwZWRWYWx1ZS5tYXAoKGRhdGVTdHJpbmcpID0+IG5ldyBEYXRlKGRhdGVTdHJpbmcpKTtcbiAgICB9XG4gICAgcmV0dXJuIGFycmF5V3JhcHBlZFZhbHVlIGFzIHVua25vd24gYXMgVDtcbiAgfVxufVxuXG5leHBvcnQgY29uc3Qgc2VhcmNoQXR0cmlidXRlUGF5bG9hZENvbnZlcnRlciA9IG5ldyBTZWFyY2hBdHRyaWJ1dGVQYXlsb2FkQ29udmVydGVyKCk7XG5cbmV4cG9ydCBjbGFzcyBEZWZhdWx0UGF5bG9hZENvbnZlcnRlciBleHRlbmRzIENvbXBvc2l0ZVBheWxvYWRDb252ZXJ0ZXIge1xuICAvLyBNYXRjaCB0aGUgb3JkZXIgdXNlZCBpbiBvdGhlciBTREtzLCBidXQgZXhjbHVkZSBQcm90b2J1ZiBjb252ZXJ0ZXJzIHNvIHRoYXQgdGhlIGNvZGUsIGluY2x1ZGluZ1xuICAvLyBgcHJvdG8zLWpzb24tc2VyaWFsaXplcmAsIGRvZXNuJ3QgdGFrZSBzcGFjZSBpbiBXb3JrZmxvdyBidW5kbGVzIHRoYXQgZG9uJ3QgdXNlIFByb3RvYnVmcy4gVG8gdXNlIFByb3RvYnVmcywgdXNlXG4gIC8vIHtAbGluayBEZWZhdWx0UGF5bG9hZENvbnZlcnRlcldpdGhQcm90b2J1ZnN9LlxuICAvL1xuICAvLyBHbyBTREs6XG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS90ZW1wb3JhbGlvL3Nkay1nby9ibG9iLzVlNTY0NWYwYzU1MGRjZjcxN2MwOTVhZTMyYzc2YTcwODdkMmU5ODUvY29udmVydGVyL2RlZmF1bHRfZGF0YV9jb252ZXJ0ZXIuZ28jTDI4XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKG5ldyBVbmRlZmluZWRQYXlsb2FkQ29udmVydGVyKCksIG5ldyBCaW5hcnlQYXlsb2FkQ29udmVydGVyKCksIG5ldyBKc29uUGF5bG9hZENvbnZlcnRlcigpKTtcbiAgfVxufVxuXG4vKipcbiAqIFRoZSBkZWZhdWx0IHtAbGluayBQYXlsb2FkQ29udmVydGVyfSB1c2VkIGJ5IHRoZSBTREsuIFN1cHBvcnRzIGBVaW50OEFycmF5YCBhbmQgSlNPTiBzZXJpYWxpemFibGVzIChzbyBpZlxuICoge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL0pTT04vc3RyaW5naWZ5I2Rlc2NyaXB0aW9uIHwgYEpTT04uc3RyaW5naWZ5KHlvdXJBcmdPclJldHZhbClgfVxuICogd29ya3MsIHRoZSBkZWZhdWx0IHBheWxvYWQgY29udmVydGVyIHdpbGwgd29yaykuXG4gKlxuICogVG8gYWxzbyBzdXBwb3J0IFByb3RvYnVmcywgY3JlYXRlIGEgY3VzdG9tIHBheWxvYWQgY29udmVydGVyIHdpdGgge0BsaW5rIERlZmF1bHRQYXlsb2FkQ29udmVydGVyfTpcbiAqXG4gKiBgY29uc3QgbXlDb252ZXJ0ZXIgPSBuZXcgRGVmYXVsdFBheWxvYWRDb252ZXJ0ZXIoeyBwcm90b2J1ZlJvb3QgfSlgXG4gKi9cbmV4cG9ydCBjb25zdCBkZWZhdWx0UGF5bG9hZENvbnZlcnRlciA9IG5ldyBEZWZhdWx0UGF5bG9hZENvbnZlcnRlcigpO1xuIiwiaW1wb3J0IHsgZW5jb2RlIH0gZnJvbSAnLi4vZW5jb2RpbmcnO1xuXG5leHBvcnQgY29uc3QgTUVUQURBVEFfRU5DT0RJTkdfS0VZID0gJ2VuY29kaW5nJztcbmV4cG9ydCBjb25zdCBlbmNvZGluZ1R5cGVzID0ge1xuICBNRVRBREFUQV9FTkNPRElOR19OVUxMOiAnYmluYXJ5L251bGwnLFxuICBNRVRBREFUQV9FTkNPRElOR19SQVc6ICdiaW5hcnkvcGxhaW4nLFxuICBNRVRBREFUQV9FTkNPRElOR19KU09OOiAnanNvbi9wbGFpbicsXG4gIE1FVEFEQVRBX0VOQ09ESU5HX1BST1RPQlVGX0pTT046ICdqc29uL3Byb3RvYnVmJyxcbiAgTUVUQURBVEFfRU5DT0RJTkdfUFJPVE9CVUY6ICdiaW5hcnkvcHJvdG9idWYnLFxufSBhcyBjb25zdDtcbmV4cG9ydCB0eXBlIEVuY29kaW5nVHlwZSA9ICh0eXBlb2YgZW5jb2RpbmdUeXBlcylba2V5b2YgdHlwZW9mIGVuY29kaW5nVHlwZXNdO1xuXG5leHBvcnQgY29uc3QgZW5jb2RpbmdLZXlzID0ge1xuICBNRVRBREFUQV9FTkNPRElOR19OVUxMOiBlbmNvZGUoZW5jb2RpbmdUeXBlcy5NRVRBREFUQV9FTkNPRElOR19OVUxMKSxcbiAgTUVUQURBVEFfRU5DT0RJTkdfUkFXOiBlbmNvZGUoZW5jb2RpbmdUeXBlcy5NRVRBREFUQV9FTkNPRElOR19SQVcpLFxuICBNRVRBREFUQV9FTkNPRElOR19KU09OOiBlbmNvZGUoZW5jb2RpbmdUeXBlcy5NRVRBREFUQV9FTkNPRElOR19KU09OKSxcbiAgTUVUQURBVEFfRU5DT0RJTkdfUFJPVE9CVUZfSlNPTjogZW5jb2RlKGVuY29kaW5nVHlwZXMuTUVUQURBVEFfRU5DT0RJTkdfUFJPVE9CVUZfSlNPTiksXG4gIE1FVEFEQVRBX0VOQ09ESU5HX1BST1RPQlVGOiBlbmNvZGUoZW5jb2RpbmdUeXBlcy5NRVRBREFUQV9FTkNPRElOR19QUk9UT0JVRiksXG59IGFzIGNvbnN0O1xuXG5leHBvcnQgY29uc3QgTUVUQURBVEFfTUVTU0FHRV9UWVBFX0tFWSA9ICdtZXNzYWdlVHlwZSc7XG4iLCJpbXBvcnQgKiBhcyB0aW1lIGZyb20gJy4vdGltZSc7XG5pbXBvcnQgeyB0eXBlIFRpbWVzdGFtcCwgRHVyYXRpb24gfSBmcm9tICcuL3RpbWUnO1xuXG4vKipcbiAqIExvc3N5IGNvbnZlcnNpb24gZnVuY3Rpb24gZnJvbSBUaW1lc3RhbXAgdG8gbnVtYmVyIGR1ZSB0byBwb3NzaWJsZSBvdmVyZmxvdy5cbiAqIElmIHRzIGlzIG51bGwgb3IgdW5kZWZpbmVkIHJldHVybnMgdW5kZWZpbmVkLlxuICpcbiAqIEBoaWRkZW5cbiAqIEBkZXByZWNhdGVkIC0gbWVhbnQgZm9yIGludGVybmFsIHVzZSBvbmx5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBvcHRpb25hbFRzVG9Ncyh0czogVGltZXN0YW1wIHwgbnVsbCB8IHVuZGVmaW5lZCk6IG51bWJlciB8IHVuZGVmaW5lZCB7XG4gIHJldHVybiB0aW1lLm9wdGlvbmFsVHNUb01zKHRzKTtcbn1cblxuLyoqXG4gKiBMb3NzeSBjb252ZXJzaW9uIGZ1bmN0aW9uIGZyb20gVGltZXN0YW1wIHRvIG51bWJlciBkdWUgdG8gcG9zc2libGUgb3ZlcmZsb3dcbiAqXG4gKiBAaGlkZGVuXG4gKiBAZGVwcmVjYXRlZCAtIG1lYW50IGZvciBpbnRlcm5hbCB1c2Ugb25seVxuICogQGRlcHJlY2F0ZWQgLSBtZWFudCBmb3IgaW50ZXJuYWwgdXNlIG9ubHlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRzVG9Ncyh0czogVGltZXN0YW1wIHwgbnVsbCB8IHVuZGVmaW5lZCk6IG51bWJlciB7XG4gIHJldHVybiB0aW1lLnRzVG9Ncyh0cyk7XG59XG5cbi8qKlxuICogQGhpZGRlblxuICogQGRlcHJlY2F0ZWQgLSBtZWFudCBmb3IgaW50ZXJuYWwgdXNlIG9ubHlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1zTnVtYmVyVG9UcyhtaWxsaXM6IG51bWJlcik6IFRpbWVzdGFtcCB7XG4gIHJldHVybiB0aW1lLm1zTnVtYmVyVG9UcyhtaWxsaXMpO1xufVxuXG4vKipcbiAqIEBoaWRkZW5cbiAqIEBkZXByZWNhdGVkIC0gbWVhbnQgZm9yIGludGVybmFsIHVzZSBvbmx5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtc1RvVHMoc3RyOiBEdXJhdGlvbik6IFRpbWVzdGFtcCB7XG4gIHJldHVybiB0aW1lLm1zVG9UcyhzdHIpO1xufVxuXG4vKipcbiAqIEBoaWRkZW5cbiAqIEBkZXByZWNhdGVkIC0gbWVhbnQgZm9yIGludGVybmFsIHVzZSBvbmx5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtc09wdGlvbmFsVG9UcyhzdHI6IER1cmF0aW9uIHwgdW5kZWZpbmVkKTogVGltZXN0YW1wIHwgdW5kZWZpbmVkIHtcbiAgcmV0dXJuIHRpbWUubXNPcHRpb25hbFRvVHMoc3RyKTtcbn1cblxuLyoqXG4gKiBAaGlkZGVuXG4gKiBAZGVwcmVjYXRlZCAtIG1lYW50IGZvciBpbnRlcm5hbCB1c2Ugb25seVxuICovXG5leHBvcnQgZnVuY3Rpb24gbXNPcHRpb25hbFRvTnVtYmVyKHZhbDogRHVyYXRpb24gfCB1bmRlZmluZWQpOiBudW1iZXIgfCB1bmRlZmluZWQge1xuICByZXR1cm4gdGltZS5tc09wdGlvbmFsVG9OdW1iZXIodmFsKTtcbn1cblxuLyoqXG4gKiBAaGlkZGVuXG4gKiBAZGVwcmVjYXRlZCAtIG1lYW50IGZvciBpbnRlcm5hbCB1c2Ugb25seVxuICovXG5leHBvcnQgZnVuY3Rpb24gbXNUb051bWJlcih2YWw6IER1cmF0aW9uKTogbnVtYmVyIHtcbiAgcmV0dXJuIHRpbWUubXNUb051bWJlcih2YWwpO1xufVxuXG4vKipcbiAqIEBoaWRkZW5cbiAqIEBkZXByZWNhdGVkIC0gbWVhbnQgZm9yIGludGVybmFsIHVzZSBvbmx5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0c1RvRGF0ZSh0czogVGltZXN0YW1wKTogRGF0ZSB7XG4gIHJldHVybiB0aW1lLnRzVG9EYXRlKHRzKTtcbn1cblxuLyoqXG4gKiBAaGlkZGVuXG4gKiBAZGVwcmVjYXRlZCAtIG1lYW50IGZvciBpbnRlcm5hbCB1c2Ugb25seVxuICovXG5leHBvcnQgZnVuY3Rpb24gb3B0aW9uYWxUc1RvRGF0ZSh0czogVGltZXN0YW1wIHwgbnVsbCB8IHVuZGVmaW5lZCk6IERhdGUgfCB1bmRlZmluZWQge1xuICByZXR1cm4gdGltZS5vcHRpb25hbFRzVG9EYXRlKHRzKTtcbn1cbiIsIi8vIFBhc3RlZCB3aXRoIG1vZGlmaWNhdGlvbnMgZnJvbTogaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL2Fub255Y28vRmFzdGVzdFNtYWxsZXN0VGV4dEVuY29kZXJEZWNvZGVyL21hc3Rlci9FbmNvZGVyRGVjb2RlclRvZ2V0aGVyLnNyYy5qc1xuLyogZXNsaW50IG5vLWZhbGx0aHJvdWdoOiAwICovXG5cbmNvbnN0IGZyb21DaGFyQ29kZSA9IFN0cmluZy5mcm9tQ2hhckNvZGU7XG5jb25zdCBlbmNvZGVyUmVnZXhwID0gL1tcXHg4MC1cXHVEN2ZmXFx1REMwMC1cXHVGRkZGXXxbXFx1RDgwMC1cXHVEQkZGXVtcXHVEQzAwLVxcdURGRkZdPy9nO1xuY29uc3QgdG1wQnVmZmVyVTE2ID0gbmV3IFVpbnQxNkFycmF5KDMyKTtcblxuZXhwb3J0IGNsYXNzIFRleHREZWNvZGVyIHtcbiAgZGVjb2RlKGlucHV0QXJyYXlPckJ1ZmZlcjogVWludDhBcnJheSB8IEFycmF5QnVmZmVyIHwgU2hhcmVkQXJyYXlCdWZmZXIpOiBzdHJpbmcge1xuICAgIGNvbnN0IGlucHV0QXM4ID0gaW5wdXRBcnJheU9yQnVmZmVyIGluc3RhbmNlb2YgVWludDhBcnJheSA/IGlucHV0QXJyYXlPckJ1ZmZlciA6IG5ldyBVaW50OEFycmF5KGlucHV0QXJyYXlPckJ1ZmZlcik7XG5cbiAgICBsZXQgcmVzdWx0aW5nU3RyaW5nID0gJycsXG4gICAgICB0bXBTdHIgPSAnJyxcbiAgICAgIGluZGV4ID0gMCxcbiAgICAgIG5leHRFbmQgPSAwLFxuICAgICAgY3AwID0gMCxcbiAgICAgIGNvZGVQb2ludCA9IDAsXG4gICAgICBtaW5CaXRzID0gMCxcbiAgICAgIGNwMSA9IDAsXG4gICAgICBwb3MgPSAwLFxuICAgICAgdG1wID0gLTE7XG4gICAgY29uc3QgbGVuID0gaW5wdXRBczgubGVuZ3RoIHwgMDtcbiAgICBjb25zdCBsZW5NaW51czMyID0gKGxlbiAtIDMyKSB8IDA7XG4gICAgLy8gTm90ZSB0aGF0IHRtcCByZXByZXNlbnRzIHRoZSAybmQgaGFsZiBvZiBhIHN1cnJvZ2F0ZSBwYWlyIGluY2FzZSBhIHN1cnJvZ2F0ZSBnZXRzIGRpdmlkZWQgYmV0d2VlbiBibG9ja3NcbiAgICBmb3IgKDsgaW5kZXggPCBsZW47ICkge1xuICAgICAgbmV4dEVuZCA9IGluZGV4IDw9IGxlbk1pbnVzMzIgPyAzMiA6IChsZW4gLSBpbmRleCkgfCAwO1xuICAgICAgZm9yICg7IHBvcyA8IG5leHRFbmQ7IGluZGV4ID0gKGluZGV4ICsgMSkgfCAwLCBwb3MgPSAocG9zICsgMSkgfCAwKSB7XG4gICAgICAgIGNwMCA9IGlucHV0QXM4W2luZGV4XSAmIDB4ZmY7XG4gICAgICAgIHN3aXRjaCAoY3AwID4+IDQpIHtcbiAgICAgICAgICBjYXNlIDE1OlxuICAgICAgICAgICAgY3AxID0gaW5wdXRBczhbKGluZGV4ID0gKGluZGV4ICsgMSkgfCAwKV0gJiAweGZmO1xuICAgICAgICAgICAgaWYgKGNwMSA+PiA2ICE9PSAwYjEwIHx8IDBiMTExMTAxMTEgPCBjcDApIHtcbiAgICAgICAgICAgICAgaW5kZXggPSAoaW5kZXggLSAxKSB8IDA7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29kZVBvaW50ID0gKChjcDAgJiAwYjExMSkgPDwgNikgfCAoY3AxICYgMGIwMDExMTExMSk7XG4gICAgICAgICAgICBtaW5CaXRzID0gNTsgLy8gMjAgZW5zdXJlcyBpdCBuZXZlciBwYXNzZXMgLT4gYWxsIGludmFsaWQgcmVwbGFjZW1lbnRzXG4gICAgICAgICAgICBjcDAgPSAweDEwMDsgLy8gIGtlZXAgdHJhY2sgb2YgdGggYml0IHNpemVcbiAgICAgICAgICBjYXNlIDE0OlxuICAgICAgICAgICAgY3AxID0gaW5wdXRBczhbKGluZGV4ID0gKGluZGV4ICsgMSkgfCAwKV0gJiAweGZmO1xuICAgICAgICAgICAgY29kZVBvaW50IDw8PSA2O1xuICAgICAgICAgICAgY29kZVBvaW50IHw9ICgoY3AwICYgMGIxMTExKSA8PCA2KSB8IChjcDEgJiAwYjAwMTExMTExKTtcbiAgICAgICAgICAgIG1pbkJpdHMgPSBjcDEgPj4gNiA9PT0gMGIxMCA/IChtaW5CaXRzICsgNCkgfCAwIDogMjQ7IC8vIDI0IGVuc3VyZXMgaXQgbmV2ZXIgcGFzc2VzIC0+IGFsbCBpbnZhbGlkIHJlcGxhY2VtZW50c1xuICAgICAgICAgICAgY3AwID0gKGNwMCArIDB4MTAwKSAmIDB4MzAwOyAvLyBrZWVwIHRyYWNrIG9mIHRoIGJpdCBzaXplXG4gICAgICAgICAgY2FzZSAxMzpcbiAgICAgICAgICBjYXNlIDEyOlxuICAgICAgICAgICAgY3AxID0gaW5wdXRBczhbKGluZGV4ID0gKGluZGV4ICsgMSkgfCAwKV0gJiAweGZmO1xuICAgICAgICAgICAgY29kZVBvaW50IDw8PSA2O1xuICAgICAgICAgICAgY29kZVBvaW50IHw9ICgoY3AwICYgMGIxMTExMSkgPDwgNikgfCAoY3AxICYgMGIwMDExMTExMSk7XG4gICAgICAgICAgICBtaW5CaXRzID0gKG1pbkJpdHMgKyA3KSB8IDA7XG5cbiAgICAgICAgICAgIC8vIE5vdywgcHJvY2VzcyB0aGUgY29kZSBwb2ludFxuICAgICAgICAgICAgaWYgKGluZGV4IDwgbGVuICYmIGNwMSA+PiA2ID09PSAwYjEwICYmIGNvZGVQb2ludCA+PiBtaW5CaXRzICYmIGNvZGVQb2ludCA8IDB4MTEwMDAwKSB7XG4gICAgICAgICAgICAgIGNwMCA9IGNvZGVQb2ludDtcbiAgICAgICAgICAgICAgY29kZVBvaW50ID0gKGNvZGVQb2ludCAtIDB4MTAwMDApIHwgMDtcbiAgICAgICAgICAgICAgaWYgKDAgPD0gY29kZVBvaW50IC8qMHhmZmZmIDwgY29kZVBvaW50Ki8pIHtcbiAgICAgICAgICAgICAgICAvLyBCTVAgY29kZSBwb2ludFxuICAgICAgICAgICAgICAgIC8vbmV4dEVuZCA9IG5leHRFbmQgLSAxfDA7XG5cbiAgICAgICAgICAgICAgICB0bXAgPSAoKGNvZGVQb2ludCA+PiAxMCkgKyAweGQ4MDApIHwgMDsgLy8gaGlnaFN1cnJvZ2F0ZVxuICAgICAgICAgICAgICAgIGNwMCA9ICgoY29kZVBvaW50ICYgMHgzZmYpICsgMHhkYzAwKSB8IDA7IC8vIGxvd1N1cnJvZ2F0ZSAod2lsbCBiZSBpbnNlcnRlZCBsYXRlciBpbiB0aGUgc3dpdGNoLXN0YXRlbWVudClcblxuICAgICAgICAgICAgICAgIGlmIChwb3MgPCAzMSkge1xuICAgICAgICAgICAgICAgICAgLy8gbm90aWNlIDMxIGluc3RlYWQgb2YgMzJcbiAgICAgICAgICAgICAgICAgIHRtcEJ1ZmZlclUxNltwb3NdID0gdG1wO1xuICAgICAgICAgICAgICAgICAgcG9zID0gKHBvcyArIDEpIHwgMDtcbiAgICAgICAgICAgICAgICAgIHRtcCA9IC0xO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAvLyBlbHNlLCB3ZSBhcmUgYXQgdGhlIGVuZCBvZiB0aGUgaW5wdXRBczggYW5kIGxldCB0bXAwIGJlIGZpbGxlZCBpbiBsYXRlciBvblxuICAgICAgICAgICAgICAgICAgLy8gTk9URSB0aGF0IGNwMSBpcyBiZWluZyB1c2VkIGFzIGEgdGVtcG9yYXJ5IHZhcmlhYmxlIGZvciB0aGUgc3dhcHBpbmcgb2YgdG1wIHdpdGggY3AwXG4gICAgICAgICAgICAgICAgICBjcDEgPSB0bXA7XG4gICAgICAgICAgICAgICAgICB0bXAgPSBjcDA7XG4gICAgICAgICAgICAgICAgICBjcDAgPSBjcDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9IGVsc2UgbmV4dEVuZCA9IChuZXh0RW5kICsgMSkgfCAwOyAvLyBiZWNhdXNlIHdlIGFyZSBhZHZhbmNpbmcgaSB3aXRob3V0IGFkdmFuY2luZyBwb3NcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIC8vIGludmFsaWQgY29kZSBwb2ludCBtZWFucyByZXBsYWNpbmcgdGhlIHdob2xlIHRoaW5nIHdpdGggbnVsbCByZXBsYWNlbWVudCBjaGFyYWN0ZXJzXG4gICAgICAgICAgICAgIGNwMCA+Pj0gODtcbiAgICAgICAgICAgICAgaW5kZXggPSAoaW5kZXggLSBjcDAgLSAxKSB8IDA7IC8vIHJlc2V0IGluZGV4ICBiYWNrIHRvIHdoYXQgaXQgd2FzIGJlZm9yZVxuICAgICAgICAgICAgICBjcDAgPSAweGZmZmQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIEZpbmFsbHksIHJlc2V0IHRoZSB2YXJpYWJsZXMgZm9yIHRoZSBuZXh0IGdvLWFyb3VuZFxuICAgICAgICAgICAgbWluQml0cyA9IDA7XG4gICAgICAgICAgICBjb2RlUG9pbnQgPSAwO1xuICAgICAgICAgICAgbmV4dEVuZCA9IGluZGV4IDw9IGxlbk1pbnVzMzIgPyAzMiA6IChsZW4gLSBpbmRleCkgfCAwO1xuICAgICAgICAgIC8qY2FzZSAxMTpcbiAgICAgICAgY2FzZSAxMDpcbiAgICAgICAgY2FzZSA5OlxuICAgICAgICBjYXNlIDg6XG4gICAgICAgICAgY29kZVBvaW50ID8gY29kZVBvaW50ID0gMCA6IGNwMCA9IDB4ZmZmZDsgLy8gZmlsbCB3aXRoIGludmFsaWQgcmVwbGFjZW1lbnQgY2hhcmFjdGVyXG4gICAgICAgIGNhc2UgNzpcbiAgICAgICAgY2FzZSA2OlxuICAgICAgICBjYXNlIDU6XG4gICAgICAgIGNhc2UgNDpcbiAgICAgICAgY2FzZSAzOlxuICAgICAgICBjYXNlIDI6XG4gICAgICAgIGNhc2UgMTpcbiAgICAgICAgY2FzZSAwOlxuICAgICAgICAgIHRtcEJ1ZmZlclUxNltwb3NdID0gY3AwO1xuICAgICAgICAgIGNvbnRpbnVlOyovXG4gICAgICAgICAgZGVmYXVsdDogLy8gZmlsbCB3aXRoIGludmFsaWQgcmVwbGFjZW1lbnQgY2hhcmFjdGVyXG4gICAgICAgICAgICB0bXBCdWZmZXJVMTZbcG9zXSA9IGNwMDtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIGNhc2UgMTE6XG4gICAgICAgICAgY2FzZSAxMDpcbiAgICAgICAgICBjYXNlIDk6XG4gICAgICAgICAgY2FzZSA4OlxuICAgICAgICB9XG4gICAgICAgIHRtcEJ1ZmZlclUxNltwb3NdID0gMHhmZmZkOyAvLyBmaWxsIHdpdGggaW52YWxpZCByZXBsYWNlbWVudCBjaGFyYWN0ZXJcbiAgICAgIH1cbiAgICAgIHRtcFN0ciArPSBmcm9tQ2hhckNvZGUoXG4gICAgICAgIHRtcEJ1ZmZlclUxNlswXSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzFdLFxuICAgICAgICB0bXBCdWZmZXJVMTZbMl0sXG4gICAgICAgIHRtcEJ1ZmZlclUxNlszXSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzRdLFxuICAgICAgICB0bXBCdWZmZXJVMTZbNV0sXG4gICAgICAgIHRtcEJ1ZmZlclUxNls2XSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzddLFxuICAgICAgICB0bXBCdWZmZXJVMTZbOF0sXG4gICAgICAgIHRtcEJ1ZmZlclUxNls5XSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzEwXSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzExXSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzEyXSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzEzXSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzE0XSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzE1XSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzE2XSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzE3XSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzE4XSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzE5XSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzIwXSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzIxXSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzIyXSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzIzXSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzI0XSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzI1XSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzI2XSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzI3XSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzI4XSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzI5XSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzMwXSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzMxXVxuICAgICAgKTtcbiAgICAgIGlmIChwb3MgPCAzMikgdG1wU3RyID0gdG1wU3RyLnNsaWNlKDAsIChwb3MgLSAzMikgfCAwKTsgLy8tKDMyLXBvcykpO1xuICAgICAgaWYgKGluZGV4IDwgbGVuKSB7XG4gICAgICAgIC8vZnJvbUNoYXJDb2RlLmFwcGx5KDAsIHRtcEJ1ZmZlclUxNiA6IFVpbnQ4QXJyYXkgPyAgdG1wQnVmZmVyVTE2LnN1YmFycmF5KDAscG9zKSA6IHRtcEJ1ZmZlclUxNi5zbGljZSgwLHBvcykpO1xuICAgICAgICB0bXBCdWZmZXJVMTZbMF0gPSB0bXA7XG4gICAgICAgIHBvcyA9IH50bXAgPj4+IDMxOyAvL3RtcCAhPT0gLTEgPyAxIDogMDtcbiAgICAgICAgdG1wID0gLTE7XG5cbiAgICAgICAgaWYgKHRtcFN0ci5sZW5ndGggPCByZXN1bHRpbmdTdHJpbmcubGVuZ3RoKSBjb250aW51ZTtcbiAgICAgIH0gZWxzZSBpZiAodG1wICE9PSAtMSkge1xuICAgICAgICB0bXBTdHIgKz0gZnJvbUNoYXJDb2RlKHRtcCk7XG4gICAgICB9XG5cbiAgICAgIHJlc3VsdGluZ1N0cmluZyArPSB0bXBTdHI7XG4gICAgICB0bXBTdHIgPSAnJztcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0aW5nU3RyaW5nO1xuICB9XG59XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5mdW5jdGlvbiBlbmNvZGVyUmVwbGFjZXIobm9uQXNjaWlDaGFyczogc3RyaW5nKSB7XG4gIC8vIG1ha2UgdGhlIFVURiBzdHJpbmcgaW50byBhIGJpbmFyeSBVVEYtOCBlbmNvZGVkIHN0cmluZ1xuICBsZXQgcG9pbnQgPSBub25Bc2NpaUNoYXJzLmNoYXJDb2RlQXQoMCkgfCAwO1xuICBpZiAoMHhkODAwIDw9IHBvaW50KSB7XG4gICAgaWYgKHBvaW50IDw9IDB4ZGJmZikge1xuICAgICAgY29uc3QgbmV4dGNvZGUgPSBub25Bc2NpaUNoYXJzLmNoYXJDb2RlQXQoMSkgfCAwOyAvLyBkZWZhdWx0cyB0byAwIHdoZW4gTmFOLCBjYXVzaW5nIG51bGwgcmVwbGFjZW1lbnQgY2hhcmFjdGVyXG5cbiAgICAgIGlmICgweGRjMDAgPD0gbmV4dGNvZGUgJiYgbmV4dGNvZGUgPD0gMHhkZmZmKSB7XG4gICAgICAgIC8vcG9pbnQgPSAoKHBvaW50IC0gMHhEODAwKTw8MTApICsgbmV4dGNvZGUgLSAweERDMDAgKyAweDEwMDAwfDA7XG4gICAgICAgIHBvaW50ID0gKChwb2ludCA8PCAxMCkgKyBuZXh0Y29kZSAtIDB4MzVmZGMwMCkgfCAwO1xuICAgICAgICBpZiAocG9pbnQgPiAweGZmZmYpXG4gICAgICAgICAgcmV0dXJuIGZyb21DaGFyQ29kZShcbiAgICAgICAgICAgICgweDFlIC8qMGIxMTExMCovIDw8IDMpIHwgKHBvaW50ID4+IDE4KSxcbiAgICAgICAgICAgICgweDIgLyowYjEwKi8gPDwgNikgfCAoKHBvaW50ID4+IDEyKSAmIDB4M2YpIC8qMGIwMDExMTExMSovLFxuICAgICAgICAgICAgKDB4MiAvKjBiMTAqLyA8PCA2KSB8ICgocG9pbnQgPj4gNikgJiAweDNmKSAvKjBiMDAxMTExMTEqLyxcbiAgICAgICAgICAgICgweDIgLyowYjEwKi8gPDwgNikgfCAocG9pbnQgJiAweDNmKSAvKjBiMDAxMTExMTEqL1xuICAgICAgICAgICk7XG4gICAgICB9IGVsc2UgcG9pbnQgPSA2NTUzMyAvKjBiMTExMTExMTExMTExMTEwMSovOyAvL3JldHVybiAnXFx4RUZcXHhCRlxceEJEJzsvL2Zyb21DaGFyQ29kZSgweGVmLCAweGJmLCAweGJkKTtcbiAgICB9IGVsc2UgaWYgKHBvaW50IDw9IDB4ZGZmZikge1xuICAgICAgcG9pbnQgPSA2NTUzMyAvKjBiMTExMTExMTExMTExMTEwMSovOyAvL3JldHVybiAnXFx4RUZcXHhCRlxceEJEJzsvL2Zyb21DaGFyQ29kZSgweGVmLCAweGJmLCAweGJkKTtcbiAgICB9XG4gIH1cbiAgLyppZiAocG9pbnQgPD0gMHgwMDdmKSByZXR1cm4gbm9uQXNjaWlDaGFycztcbiAgZWxzZSAqLyBpZiAocG9pbnQgPD0gMHgwN2ZmKSB7XG4gICAgcmV0dXJuIGZyb21DaGFyQ29kZSgoMHg2IDw8IDUpIHwgKHBvaW50ID4+IDYpLCAoMHgyIDw8IDYpIHwgKHBvaW50ICYgMHgzZikpO1xuICB9IGVsc2VcbiAgICByZXR1cm4gZnJvbUNoYXJDb2RlKFxuICAgICAgKDB4ZSAvKjBiMTExMCovIDw8IDQpIHwgKHBvaW50ID4+IDEyKSxcbiAgICAgICgweDIgLyowYjEwKi8gPDwgNikgfCAoKHBvaW50ID4+IDYpICYgMHgzZikgLyowYjAwMTExMTExKi8sXG4gICAgICAoMHgyIC8qMGIxMCovIDw8IDYpIHwgKHBvaW50ICYgMHgzZikgLyowYjAwMTExMTExKi9cbiAgICApO1xufVxuXG5leHBvcnQgY2xhc3MgVGV4dEVuY29kZXIge1xuICBwdWJsaWMgZW5jb2RlKGlucHV0U3RyaW5nOiBzdHJpbmcpOiBVaW50OEFycmF5IHtcbiAgICAvLyAweGMwID0+IDBiMTEwMDAwMDA7IDB4ZmYgPT4gMGIxMTExMTExMTsgMHhjMC0weGZmID0+IDBiMTF4eHh4eHhcbiAgICAvLyAweDgwID0+IDBiMTAwMDAwMDA7IDB4YmYgPT4gMGIxMDExMTExMTsgMHg4MC0weGJmID0+IDBiMTB4eHh4eHhcbiAgICBjb25zdCBlbmNvZGVkU3RyaW5nID0gaW5wdXRTdHJpbmcgPT09IHZvaWQgMCA/ICcnIDogJycgKyBpbnB1dFN0cmluZyxcbiAgICAgIGxlbiA9IGVuY29kZWRTdHJpbmcubGVuZ3RoIHwgMDtcbiAgICBsZXQgcmVzdWx0ID0gbmV3IFVpbnQ4QXJyYXkoKChsZW4gPDwgMSkgKyA4KSB8IDApO1xuICAgIGxldCB0bXBSZXN1bHQ6IFVpbnQ4QXJyYXk7XG4gICAgbGV0IGkgPSAwLFxuICAgICAgcG9zID0gMCxcbiAgICAgIHBvaW50ID0gMCxcbiAgICAgIG5leHRjb2RlID0gMDtcbiAgICBsZXQgdXBncmFkZWRlZEFycmF5U2l6ZSA9ICFVaW50OEFycmF5OyAvLyBub3JtYWwgYXJyYXlzIGFyZSBhdXRvLWV4cGFuZGluZ1xuICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkgPSAoaSArIDEpIHwgMCwgcG9zID0gKHBvcyArIDEpIHwgMCkge1xuICAgICAgcG9pbnQgPSBlbmNvZGVkU3RyaW5nLmNoYXJDb2RlQXQoaSkgfCAwO1xuICAgICAgaWYgKHBvaW50IDw9IDB4MDA3Zikge1xuICAgICAgICByZXN1bHRbcG9zXSA9IHBvaW50O1xuICAgICAgfSBlbHNlIGlmIChwb2ludCA8PSAweDA3ZmYpIHtcbiAgICAgICAgcmVzdWx0W3Bvc10gPSAoMHg2IDw8IDUpIHwgKHBvaW50ID4+IDYpO1xuICAgICAgICByZXN1bHRbKHBvcyA9IChwb3MgKyAxKSB8IDApXSA9ICgweDIgPDwgNikgfCAocG9pbnQgJiAweDNmKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHdpZGVuQ2hlY2s6IHtcbiAgICAgICAgICBpZiAoMHhkODAwIDw9IHBvaW50KSB7XG4gICAgICAgICAgICBpZiAocG9pbnQgPD0gMHhkYmZmKSB7XG4gICAgICAgICAgICAgIG5leHRjb2RlID0gZW5jb2RlZFN0cmluZy5jaGFyQ29kZUF0KChpID0gKGkgKyAxKSB8IDApKSB8IDA7IC8vIGRlZmF1bHRzIHRvIDAgd2hlbiBOYU4sIGNhdXNpbmcgbnVsbCByZXBsYWNlbWVudCBjaGFyYWN0ZXJcblxuICAgICAgICAgICAgICBpZiAoMHhkYzAwIDw9IG5leHRjb2RlICYmIG5leHRjb2RlIDw9IDB4ZGZmZikge1xuICAgICAgICAgICAgICAgIC8vcG9pbnQgPSAoKHBvaW50IC0gMHhEODAwKTw8MTApICsgbmV4dGNvZGUgLSAweERDMDAgKyAweDEwMDAwfDA7XG4gICAgICAgICAgICAgICAgcG9pbnQgPSAoKHBvaW50IDw8IDEwKSArIG5leHRjb2RlIC0gMHgzNWZkYzAwKSB8IDA7XG4gICAgICAgICAgICAgICAgaWYgKHBvaW50ID4gMHhmZmZmKSB7XG4gICAgICAgICAgICAgICAgICByZXN1bHRbcG9zXSA9ICgweDFlIC8qMGIxMTExMCovIDw8IDMpIHwgKHBvaW50ID4+IDE4KTtcbiAgICAgICAgICAgICAgICAgIHJlc3VsdFsocG9zID0gKHBvcyArIDEpIHwgMCldID0gKDB4MiAvKjBiMTAqLyA8PCA2KSB8ICgocG9pbnQgPj4gMTIpICYgMHgzZikgLyowYjAwMTExMTExKi87XG4gICAgICAgICAgICAgICAgICByZXN1bHRbKHBvcyA9IChwb3MgKyAxKSB8IDApXSA9ICgweDIgLyowYjEwKi8gPDwgNikgfCAoKHBvaW50ID4+IDYpICYgMHgzZikgLyowYjAwMTExMTExKi87XG4gICAgICAgICAgICAgICAgICByZXN1bHRbKHBvcyA9IChwb3MgKyAxKSB8IDApXSA9ICgweDIgLyowYjEwKi8gPDwgNikgfCAocG9pbnQgJiAweDNmKSAvKjBiMDAxMTExMTEqLztcbiAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhayB3aWRlbkNoZWNrO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHBvaW50ID0gNjU1MzMgLyowYjExMTExMTExMTExMTExMDEqLzsgLy9yZXR1cm4gJ1xceEVGXFx4QkZcXHhCRCc7Ly9mcm9tQ2hhckNvZGUoMHhlZiwgMHhiZiwgMHhiZCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHBvaW50IDw9IDB4ZGZmZikge1xuICAgICAgICAgICAgICBwb2ludCA9IDY1NTMzIC8qMGIxMTExMTExMTExMTExMTAxKi87IC8vcmV0dXJuICdcXHhFRlxceEJGXFx4QkQnOy8vZnJvbUNoYXJDb2RlKDB4ZWYsIDB4YmYsIDB4YmQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoIXVwZ3JhZGVkZWRBcnJheVNpemUgJiYgaSA8PCAxIDwgcG9zICYmIGkgPDwgMSA8ICgocG9zIC0gNykgfCAwKSkge1xuICAgICAgICAgICAgdXBncmFkZWRlZEFycmF5U2l6ZSA9IHRydWU7XG4gICAgICAgICAgICB0bXBSZXN1bHQgPSBuZXcgVWludDhBcnJheShsZW4gKiAzKTtcbiAgICAgICAgICAgIHRtcFJlc3VsdC5zZXQocmVzdWx0KTtcbiAgICAgICAgICAgIHJlc3VsdCA9IHRtcFJlc3VsdDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0W3Bvc10gPSAoMHhlIC8qMGIxMTEwKi8gPDwgNCkgfCAocG9pbnQgPj4gMTIpO1xuICAgICAgICByZXN1bHRbKHBvcyA9IChwb3MgKyAxKSB8IDApXSA9ICgweDIgLyowYjEwKi8gPDwgNikgfCAoKHBvaW50ID4+IDYpICYgMHgzZikgLyowYjAwMTExMTExKi87XG4gICAgICAgIHJlc3VsdFsocG9zID0gKHBvcyArIDEpIHwgMCldID0gKDB4MiAvKjBiMTAqLyA8PCA2KSB8IChwb2ludCAmIDB4M2YpIC8qMGIwMDExMTExMSovO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gVWludDhBcnJheSA/IHJlc3VsdC5zdWJhcnJheSgwLCBwb3MpIDogcmVzdWx0LnNsaWNlKDAsIHBvcyk7XG4gIH1cblxuICBwdWJsaWMgZW5jb2RlSW50byhpbnB1dFN0cmluZzogc3RyaW5nLCB1OEFycjogVWludDhBcnJheSk6IHsgd3JpdHRlbjogbnVtYmVyOyByZWFkOiBudW1iZXIgfSB7XG4gICAgY29uc3QgZW5jb2RlZFN0cmluZyA9IGlucHV0U3RyaW5nID09PSB2b2lkIDAgPyAnJyA6ICgnJyArIGlucHV0U3RyaW5nKS5yZXBsYWNlKGVuY29kZXJSZWdleHAsIGVuY29kZXJSZXBsYWNlcik7XG4gICAgbGV0IGxlbiA9IGVuY29kZWRTdHJpbmcubGVuZ3RoIHwgMCxcbiAgICAgIGkgPSAwLFxuICAgICAgY2hhciA9IDAsXG4gICAgICByZWFkID0gMDtcbiAgICBjb25zdCB1OEFyckxlbiA9IHU4QXJyLmxlbmd0aCB8IDA7XG4gICAgY29uc3QgaW5wdXRMZW5ndGggPSBpbnB1dFN0cmluZy5sZW5ndGggfCAwO1xuICAgIGlmICh1OEFyckxlbiA8IGxlbikgbGVuID0gdThBcnJMZW47XG4gICAgcHV0Q2hhcnM6IHtcbiAgICAgIGZvciAoOyBpIDwgbGVuOyBpID0gKGkgKyAxKSB8IDApIHtcbiAgICAgICAgY2hhciA9IGVuY29kZWRTdHJpbmcuY2hhckNvZGVBdChpKSB8IDA7XG4gICAgICAgIHN3aXRjaCAoY2hhciA+PiA0KSB7XG4gICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgIGNhc2UgNDpcbiAgICAgICAgICBjYXNlIDU6XG4gICAgICAgICAgY2FzZSA2OlxuICAgICAgICAgIGNhc2UgNzpcbiAgICAgICAgICAgIHJlYWQgPSAocmVhZCArIDEpIHwgMDtcbiAgICAgICAgICAvLyBleHRlbnNpb24gcG9pbnRzOlxuICAgICAgICAgIGNhc2UgODpcbiAgICAgICAgICBjYXNlIDk6XG4gICAgICAgICAgY2FzZSAxMDpcbiAgICAgICAgICBjYXNlIDExOlxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAxMjpcbiAgICAgICAgICBjYXNlIDEzOlxuICAgICAgICAgICAgaWYgKCgoaSArIDEpIHwgMCkgPCB1OEFyckxlbikge1xuICAgICAgICAgICAgICByZWFkID0gKHJlYWQgKyAxKSB8IDA7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIGNhc2UgMTQ6XG4gICAgICAgICAgICBpZiAoKChpICsgMikgfCAwKSA8IHU4QXJyTGVuKSB7XG4gICAgICAgICAgICAgIC8vaWYgKCEoY2hhciA9PT0gMHhFRiAmJiBlbmNvZGVkU3RyaW5nLnN1YnN0cihpKzF8MCwyKSA9PT0gXCJcXHhCRlxceEJEXCIpKVxuICAgICAgICAgICAgICByZWFkID0gKHJlYWQgKyAxKSB8IDA7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIGNhc2UgMTU6XG4gICAgICAgICAgICBpZiAoKChpICsgMykgfCAwKSA8IHU4QXJyTGVuKSB7XG4gICAgICAgICAgICAgIHJlYWQgPSAocmVhZCArIDEpIHwgMDtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGJyZWFrIHB1dENoYXJzO1xuICAgICAgICB9XG4gICAgICAgIC8vcmVhZCA9IHJlYWQgKyAoKGNoYXIgPj4gNikgIT09IDIpIHwwO1xuICAgICAgICB1OEFycltpXSA9IGNoYXI7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB7IHdyaXR0ZW46IGksIHJlYWQ6IGlucHV0TGVuZ3RoIDwgcmVhZCA/IGlucHV0TGVuZ3RoIDogcmVhZCB9O1xuICB9XG59XG5cbi8qKlxuICogRW5jb2RlIGEgVVRGLTggc3RyaW5nIGludG8gYSBVaW50OEFycmF5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlbmNvZGUoczogc3RyaW5nKTogVWludDhBcnJheSB7XG4gIHJldHVybiBUZXh0RW5jb2Rlci5wcm90b3R5cGUuZW5jb2RlKHMpO1xufVxuXG4vKipcbiAqIERlY29kZSBhIFVpbnQ4QXJyYXkgaW50byBhIFVURi04IHN0cmluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gZGVjb2RlKGE6IFVpbnQ4QXJyYXkpOiBzdHJpbmcge1xuICByZXR1cm4gVGV4dERlY29kZXIucHJvdG90eXBlLmRlY29kZShhKTtcbn1cbiIsImltcG9ydCB7IFN5bWJvbEJhc2VkSW5zdGFuY2VPZkVycm9yIH0gZnJvbSAnLi90eXBlLWhlbHBlcnMnO1xuXG4vKipcbiAqIFRocm93biBmcm9tIGNvZGUgdGhhdCByZWNlaXZlcyBhIHZhbHVlIHRoYXQgaXMgdW5leHBlY3RlZCBvciB0aGF0IGl0J3MgdW5hYmxlIHRvIGhhbmRsZS5cbiAqL1xuQFN5bWJvbEJhc2VkSW5zdGFuY2VPZkVycm9yKCdWYWx1ZUVycm9yJylcbmV4cG9ydCBjbGFzcyBWYWx1ZUVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihcbiAgICBtZXNzYWdlOiBzdHJpbmcgfCB1bmRlZmluZWQsXG4gICAgcHVibGljIHJlYWRvbmx5IGNhdXNlPzogdW5rbm93blxuICApIHtcbiAgICBzdXBlcihtZXNzYWdlID8/IHVuZGVmaW5lZCk7XG4gIH1cbn1cblxuLyoqXG4gKiBUaHJvd24gd2hlbiBhIFBheWxvYWQgQ29udmVydGVyIGlzIG1pc2NvbmZpZ3VyZWQuXG4gKi9cbkBTeW1ib2xCYXNlZEluc3RhbmNlT2ZFcnJvcignUGF5bG9hZENvbnZlcnRlckVycm9yJylcbmV4cG9ydCBjbGFzcyBQYXlsb2FkQ29udmVydGVyRXJyb3IgZXh0ZW5kcyBWYWx1ZUVycm9yIHt9XG5cbi8qKlxuICogVXNlZCBpbiBkaWZmZXJlbnQgcGFydHMgb2YgdGhlIFNESyB0byBub3RlIHRoYXQgc29tZXRoaW5nIHVuZXhwZWN0ZWQgaGFzIGhhcHBlbmVkLlxuICovXG5AU3ltYm9sQmFzZWRJbnN0YW5jZU9mRXJyb3IoJ0lsbGVnYWxTdGF0ZUVycm9yJylcbmV4cG9ydCBjbGFzcyBJbGxlZ2FsU3RhdGVFcnJvciBleHRlbmRzIEVycm9yIHt9XG5cbi8qKlxuICogVGhyb3duIHdoZW4gYSBXb3JrZmxvdyB3aXRoIHRoZSBnaXZlbiBJZCBpcyBub3Qga25vd24gdG8gVGVtcG9yYWwgU2VydmVyLlxuICogSXQgY291bGQgYmUgYmVjYXVzZTpcbiAqIC0gSWQgcGFzc2VkIGlzIGluY29ycmVjdFxuICogLSBXb3JrZmxvdyBpcyBjbG9zZWQgKGZvciBzb21lIGNhbGxzLCBlLmcuIGB0ZXJtaW5hdGVgKVxuICogLSBXb3JrZmxvdyB3YXMgZGVsZXRlZCBmcm9tIHRoZSBTZXJ2ZXIgYWZ0ZXIgcmVhY2hpbmcgaXRzIHJldGVudGlvbiBsaW1pdFxuICovXG5AU3ltYm9sQmFzZWRJbnN0YW5jZU9mRXJyb3IoJ1dvcmtmbG93Tm90Rm91bmRFcnJvcicpXG5leHBvcnQgY2xhc3MgV29ya2Zsb3dOb3RGb3VuZEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihcbiAgICBtZXNzYWdlOiBzdHJpbmcsXG4gICAgcHVibGljIHJlYWRvbmx5IHdvcmtmbG93SWQ6IHN0cmluZyxcbiAgICBwdWJsaWMgcmVhZG9ubHkgcnVuSWQ6IHN0cmluZyB8IHVuZGVmaW5lZFxuICApIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgfVxufVxuXG4vKipcbiAqIFRocm93biB3aGVuIHRoZSBzcGVjaWZpZWQgbmFtZXNwYWNlIGlzIG5vdCBrbm93biB0byBUZW1wb3JhbCBTZXJ2ZXIuXG4gKi9cbkBTeW1ib2xCYXNlZEluc3RhbmNlT2ZFcnJvcignTmFtZXNwYWNlTm90Rm91bmRFcnJvcicpXG5leHBvcnQgY2xhc3MgTmFtZXNwYWNlTm90Rm91bmRFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IocHVibGljIHJlYWRvbmx5IG5hbWVzcGFjZTogc3RyaW5nKSB7XG4gICAgc3VwZXIoYE5hbWVzcGFjZSBub3QgZm91bmQ6ICcke25hbWVzcGFjZX0nYCk7XG4gIH1cbn1cbiIsImltcG9ydCB0eXBlIHsgdGVtcG9yYWwgfSBmcm9tICdAdGVtcG9yYWxpby9wcm90byc7XG5pbXBvcnQgeyBjaGVja0V4dGVuZHMsIGVycm9yTWVzc2FnZSwgaXNSZWNvcmQsIFN5bWJvbEJhc2VkSW5zdGFuY2VPZkVycm9yIH0gZnJvbSAnLi90eXBlLWhlbHBlcnMnO1xuaW1wb3J0IHsgRHVyYXRpb24gfSBmcm9tICcuL3RpbWUnO1xuXG5leHBvcnQgY29uc3QgRkFJTFVSRV9TT1VSQ0UgPSAnVHlwZVNjcmlwdFNESyc7XG5leHBvcnQgdHlwZSBQcm90b0ZhaWx1cmUgPSB0ZW1wb3JhbC5hcGkuZmFpbHVyZS52MS5JRmFpbHVyZTtcblxuLy8gQXZvaWQgaW1wb3J0aW5nIHRoZSBwcm90byBpbXBsZW1lbnRhdGlvbiB0byByZWR1Y2Ugd29ya2Zsb3cgYnVuZGxlIHNpemVcbi8vIENvcGllZCBmcm9tIHRlbXBvcmFsLmFwaS5lbnVtcy52MS5UaW1lb3V0VHlwZVxuZXhwb3J0IGVudW0gVGltZW91dFR5cGUge1xuICBUSU1FT1VUX1RZUEVfVU5TUEVDSUZJRUQgPSAwLFxuICBUSU1FT1VUX1RZUEVfU1RBUlRfVE9fQ0xPU0UgPSAxLFxuICBUSU1FT1VUX1RZUEVfU0NIRURVTEVfVE9fU1RBUlQgPSAyLFxuICBUSU1FT1VUX1RZUEVfU0NIRURVTEVfVE9fQ0xPU0UgPSAzLFxuICBUSU1FT1VUX1RZUEVfSEVBUlRCRUFUID0gNCxcbn1cblxuY2hlY2tFeHRlbmRzPHRlbXBvcmFsLmFwaS5lbnVtcy52MS5UaW1lb3V0VHlwZSwgVGltZW91dFR5cGU+KCk7XG5jaGVja0V4dGVuZHM8VGltZW91dFR5cGUsIHRlbXBvcmFsLmFwaS5lbnVtcy52MS5UaW1lb3V0VHlwZT4oKTtcblxuLy8gQXZvaWQgaW1wb3J0aW5nIHRoZSBwcm90byBpbXBsZW1lbnRhdGlvbiB0byByZWR1Y2Ugd29ya2Zsb3cgYnVuZGxlIHNpemVcbi8vIENvcGllZCBmcm9tIHRlbXBvcmFsLmFwaS5lbnVtcy52MS5SZXRyeVN0YXRlXG5leHBvcnQgZW51bSBSZXRyeVN0YXRlIHtcbiAgUkVUUllfU1RBVEVfVU5TUEVDSUZJRUQgPSAwLFxuICBSRVRSWV9TVEFURV9JTl9QUk9HUkVTUyA9IDEsXG4gIFJFVFJZX1NUQVRFX05PTl9SRVRSWUFCTEVfRkFJTFVSRSA9IDIsXG4gIFJFVFJZX1NUQVRFX1RJTUVPVVQgPSAzLFxuICBSRVRSWV9TVEFURV9NQVhJTVVNX0FUVEVNUFRTX1JFQUNIRUQgPSA0LFxuICBSRVRSWV9TVEFURV9SRVRSWV9QT0xJQ1lfTk9UX1NFVCA9IDUsXG4gIFJFVFJZX1NUQVRFX0lOVEVSTkFMX1NFUlZFUl9FUlJPUiA9IDYsXG4gIFJFVFJZX1NUQVRFX0NBTkNFTF9SRVFVRVNURUQgPSA3LFxufVxuXG5jaGVja0V4dGVuZHM8dGVtcG9yYWwuYXBpLmVudW1zLnYxLlJldHJ5U3RhdGUsIFJldHJ5U3RhdGU+KCk7XG5jaGVja0V4dGVuZHM8UmV0cnlTdGF0ZSwgdGVtcG9yYWwuYXBpLmVudW1zLnYxLlJldHJ5U3RhdGU+KCk7XG5cbmV4cG9ydCB0eXBlIFdvcmtmbG93RXhlY3V0aW9uID0gdGVtcG9yYWwuYXBpLmNvbW1vbi52MS5JV29ya2Zsb3dFeGVjdXRpb247XG5cbi8qKlxuICogUmVwcmVzZW50cyBmYWlsdXJlcyB0aGF0IGNhbiBjcm9zcyBXb3JrZmxvdyBhbmQgQWN0aXZpdHkgYm91bmRhcmllcy5cbiAqXG4gKiAqKk5ldmVyIGV4dGVuZCB0aGlzIGNsYXNzIG9yIGFueSBvZiBpdHMgY2hpbGRyZW4uKipcbiAqXG4gKiBUaGUgb25seSBjaGlsZCBjbGFzcyB5b3Ugc2hvdWxkIGV2ZXIgdGhyb3cgZnJvbSB5b3VyIGNvZGUgaXMge0BsaW5rIEFwcGxpY2F0aW9uRmFpbHVyZX0uXG4gKi9cbkBTeW1ib2xCYXNlZEluc3RhbmNlT2ZFcnJvcignVGVtcG9yYWxGYWlsdXJlJylcbmV4cG9ydCBjbGFzcyBUZW1wb3JhbEZhaWx1cmUgZXh0ZW5kcyBFcnJvciB7XG4gIC8qKlxuICAgKiBUaGUgb3JpZ2luYWwgZmFpbHVyZSB0aGF0IGNvbnN0cnVjdGVkIHRoaXMgZXJyb3IuXG4gICAqXG4gICAqIE9ubHkgcHJlc2VudCBpZiB0aGlzIGVycm9yIHdhcyBnZW5lcmF0ZWQgZnJvbSBhbiBleHRlcm5hbCBvcGVyYXRpb24uXG4gICAqL1xuICBwdWJsaWMgZmFpbHVyZT86IFByb3RvRmFpbHVyZTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBtZXNzYWdlPzogc3RyaW5nIHwgdW5kZWZpbmVkIHwgbnVsbCxcbiAgICBwdWJsaWMgcmVhZG9ubHkgY2F1c2U/OiBFcnJvclxuICApIHtcbiAgICBzdXBlcihtZXNzYWdlID8/IHVuZGVmaW5lZCk7XG4gIH1cbn1cblxuLyoqIEV4Y2VwdGlvbnMgb3JpZ2luYXRlZCBhdCB0aGUgVGVtcG9yYWwgc2VydmljZS4gKi9cbkBTeW1ib2xCYXNlZEluc3RhbmNlT2ZFcnJvcignU2VydmVyRmFpbHVyZScpXG5leHBvcnQgY2xhc3MgU2VydmVyRmFpbHVyZSBleHRlbmRzIFRlbXBvcmFsRmFpbHVyZSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIG1lc3NhZ2U6IHN0cmluZyB8IHVuZGVmaW5lZCxcbiAgICBwdWJsaWMgcmVhZG9ubHkgbm9uUmV0cnlhYmxlOiBib29sZWFuLFxuICAgIGNhdXNlPzogRXJyb3JcbiAgKSB7XG4gICAgc3VwZXIobWVzc2FnZSwgY2F1c2UpO1xuICB9XG59XG5cbi8qKlxuICogYEFwcGxpY2F0aW9uRmFpbHVyZWBzIGFyZSB1c2VkIHRvIGNvbW11bmljYXRlIGFwcGxpY2F0aW9uLXNwZWNpZmljIGZhaWx1cmVzIGluIFdvcmtmbG93cyBhbmQgQWN0aXZpdGllcy5cbiAqXG4gKiBUaGUge0BsaW5rIHR5cGV9IHByb3BlcnR5IGlzIG1hdGNoZWQgYWdhaW5zdCB7QGxpbmsgUmV0cnlQb2xpY3kubm9uUmV0cnlhYmxlRXJyb3JUeXBlc30gdG8gZGV0ZXJtaW5lIGlmIGFuIGluc3RhbmNlXG4gKiBvZiB0aGlzIGVycm9yIGlzIHJldHJ5YWJsZS4gQW5vdGhlciB3YXkgdG8gYXZvaWQgcmV0cnlpbmcgaXMgYnkgc2V0dGluZyB0aGUge0BsaW5rIG5vblJldHJ5YWJsZX0gZmxhZyB0byBgdHJ1ZWAuXG4gKlxuICogSW4gV29ya2Zsb3dzLCBpZiB5b3UgdGhyb3cgYSBub24tYEFwcGxpY2F0aW9uRmFpbHVyZWAsIHRoZSBXb3JrZmxvdyBUYXNrIHdpbGwgZmFpbCBhbmQgYmUgcmV0cmllZC4gSWYgeW91IHRocm93IGFuXG4gKiBgQXBwbGljYXRpb25GYWlsdXJlYCwgdGhlIFdvcmtmbG93IEV4ZWN1dGlvbiB3aWxsIGZhaWwuXG4gKlxuICogSW4gQWN0aXZpdGllcywgeW91IGNhbiBlaXRoZXIgdGhyb3cgYW4gYEFwcGxpY2F0aW9uRmFpbHVyZWAgb3IgYW5vdGhlciBgRXJyb3JgIHRvIGZhaWwgdGhlIEFjdGl2aXR5IFRhc2suIEluIHRoZVxuICogbGF0dGVyIGNhc2UsIHRoZSBgRXJyb3JgIHdpbGwgYmUgY29udmVydGVkIHRvIGFuIGBBcHBsaWNhdGlvbkZhaWx1cmVgLiBUaGUgY29udmVyc2lvbiBpcyBkb25lIGFzIGZvbGxvd2luZzpcbiAqXG4gKiAtIGB0eXBlYCBpcyBzZXQgdG8gYGVycm9yLmNvbnN0cnVjdG9yPy5uYW1lID8/IGVycm9yLm5hbWVgXG4gKiAtIGBtZXNzYWdlYCBpcyBzZXQgdG8gYGVycm9yLm1lc3NhZ2VgXG4gKiAtIGBub25SZXRyeWFibGVgIGlzIHNldCB0byBmYWxzZVxuICogLSBgZGV0YWlsc2AgYXJlIHNldCB0byBudWxsXG4gKiAtIHN0YWNrIHRyYWNlIGlzIGNvcGllZCBmcm9tIHRoZSBvcmlnaW5hbCBlcnJvclxuICpcbiAqIFdoZW4gYW4ge0BsaW5rIGh0dHBzOi8vZG9jcy50ZW1wb3JhbC5pby9jb25jZXB0cy93aGF0LWlzLWFuLWFjdGl2aXR5LWV4ZWN1dGlvbiB8IEFjdGl2aXR5IEV4ZWN1dGlvbn0gZmFpbHMsIHRoZVxuICogYEFwcGxpY2F0aW9uRmFpbHVyZWAgZnJvbSB0aGUgbGFzdCBBY3Rpdml0eSBUYXNrIHdpbGwgYmUgdGhlIGBjYXVzZWAgb2YgdGhlIHtAbGluayBBY3Rpdml0eUZhaWx1cmV9IHRocm93biBpbiB0aGVcbiAqIFdvcmtmbG93LlxuICovXG5AU3ltYm9sQmFzZWRJbnN0YW5jZU9mRXJyb3IoJ0FwcGxpY2F0aW9uRmFpbHVyZScpXG5leHBvcnQgY2xhc3MgQXBwbGljYXRpb25GYWlsdXJlIGV4dGVuZHMgVGVtcG9yYWxGYWlsdXJlIHtcbiAgLyoqXG4gICAqIEFsdGVybmF0aXZlbHksIHVzZSB7QGxpbmsgZnJvbUVycm9yfSBvciB7QGxpbmsgY3JlYXRlfS5cbiAgICovXG4gIGNvbnN0cnVjdG9yKFxuICAgIG1lc3NhZ2U/OiBzdHJpbmcgfCB1bmRlZmluZWQgfCBudWxsLFxuICAgIHB1YmxpYyByZWFkb25seSB0eXBlPzogc3RyaW5nIHwgdW5kZWZpbmVkIHwgbnVsbCxcbiAgICBwdWJsaWMgcmVhZG9ubHkgbm9uUmV0cnlhYmxlPzogYm9vbGVhbiB8IHVuZGVmaW5lZCB8IG51bGwsXG4gICAgcHVibGljIHJlYWRvbmx5IGRldGFpbHM/OiB1bmtub3duW10gfCB1bmRlZmluZWQgfCBudWxsLFxuICAgIGNhdXNlPzogRXJyb3IsXG4gICAgcHVibGljIHJlYWRvbmx5IG5leHRSZXRyeURlbGF5PzogRHVyYXRpb24gfCB1bmRlZmluZWQgfCBudWxsXG4gICkge1xuICAgIHN1cGVyKG1lc3NhZ2UsIGNhdXNlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBuZXcgYEFwcGxpY2F0aW9uRmFpbHVyZWAgZnJvbSBhbiBFcnJvciBvYmplY3QuXG4gICAqXG4gICAqIEZpcnN0IGNhbGxzIHtAbGluayBlbnN1cmVBcHBsaWNhdGlvbkZhaWx1cmUgfCBgZW5zdXJlQXBwbGljYXRpb25GYWlsdXJlKGVycm9yKWB9IGFuZCB0aGVuIG92ZXJyaWRlcyBhbnkgZmllbGRzXG4gICAqIHByb3ZpZGVkIGluIGBvdmVycmlkZXNgLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBmcm9tRXJyb3IoZXJyb3I6IEVycm9yIHwgdW5rbm93biwgb3ZlcnJpZGVzPzogQXBwbGljYXRpb25GYWlsdXJlT3B0aW9ucyk6IEFwcGxpY2F0aW9uRmFpbHVyZSB7XG4gICAgY29uc3QgZmFpbHVyZSA9IGVuc3VyZUFwcGxpY2F0aW9uRmFpbHVyZShlcnJvcik7XG4gICAgT2JqZWN0LmFzc2lnbihmYWlsdXJlLCBvdmVycmlkZXMpO1xuICAgIHJldHVybiBmYWlsdXJlO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyBgQXBwbGljYXRpb25GYWlsdXJlYC5cbiAgICpcbiAgICogQnkgZGVmYXVsdCwgd2lsbCBiZSByZXRyeWFibGUgKHVubGVzcyBpdHMgYHR5cGVgIGlzIGluY2x1ZGVkIGluIHtAbGluayBSZXRyeVBvbGljeS5ub25SZXRyeWFibGVFcnJvclR5cGVzfSkuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGNyZWF0ZShvcHRpb25zOiBBcHBsaWNhdGlvbkZhaWx1cmVPcHRpb25zKTogQXBwbGljYXRpb25GYWlsdXJlIHtcbiAgICBjb25zdCB7IG1lc3NhZ2UsIHR5cGUsIG5vblJldHJ5YWJsZSA9IGZhbHNlLCBkZXRhaWxzLCBuZXh0UmV0cnlEZWxheSwgY2F1c2UgfSA9IG9wdGlvbnM7XG4gICAgcmV0dXJuIG5ldyB0aGlzKG1lc3NhZ2UsIHR5cGUsIG5vblJldHJ5YWJsZSwgZGV0YWlscywgY2F1c2UsIG5leHRSZXRyeURlbGF5KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYSBuZXcgYEFwcGxpY2F0aW9uRmFpbHVyZWAgd2l0aCB0aGUge0BsaW5rIG5vblJldHJ5YWJsZX0gZmxhZyBzZXQgdG8gZmFsc2UuIE5vdGUgdGhhdCB0aGlzIGVycm9yIHdpbGwgc3RpbGxcbiAgICogbm90IGJlIHJldHJpZWQgaWYgaXRzIGB0eXBlYCBpcyBpbmNsdWRlZCBpbiB7QGxpbmsgUmV0cnlQb2xpY3kubm9uUmV0cnlhYmxlRXJyb3JUeXBlc30uXG4gICAqXG4gICAqIEBwYXJhbSBtZXNzYWdlIE9wdGlvbmFsIGVycm9yIG1lc3NhZ2VcbiAgICogQHBhcmFtIHR5cGUgT3B0aW9uYWwgZXJyb3IgdHlwZSAodXNlZCBieSB7QGxpbmsgUmV0cnlQb2xpY3kubm9uUmV0cnlhYmxlRXJyb3JUeXBlc30pXG4gICAqIEBwYXJhbSBkZXRhaWxzIE9wdGlvbmFsIGRldGFpbHMgYWJvdXQgdGhlIGZhaWx1cmUuIFNlcmlhbGl6ZWQgYnkgdGhlIFdvcmtlcidzIHtAbGluayBQYXlsb2FkQ29udmVydGVyfS5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgcmV0cnlhYmxlKG1lc3NhZ2U/OiBzdHJpbmcgfCBudWxsLCB0eXBlPzogc3RyaW5nIHwgbnVsbCwgLi4uZGV0YWlsczogdW5rbm93bltdKTogQXBwbGljYXRpb25GYWlsdXJlIHtcbiAgICByZXR1cm4gbmV3IHRoaXMobWVzc2FnZSwgdHlwZSA/PyAnRXJyb3InLCBmYWxzZSwgZGV0YWlscyk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGEgbmV3IGBBcHBsaWNhdGlvbkZhaWx1cmVgIHdpdGggdGhlIHtAbGluayBub25SZXRyeWFibGV9IGZsYWcgc2V0IHRvIHRydWUuXG4gICAqXG4gICAqIFdoZW4gdGhyb3duIGZyb20gYW4gQWN0aXZpdHkgb3IgV29ya2Zsb3csIHRoZSBBY3Rpdml0eSBvciBXb3JrZmxvdyB3aWxsIG5vdCBiZSByZXRyaWVkIChldmVuIGlmIGB0eXBlYCBpcyBub3RcbiAgICogbGlzdGVkIGluIHtAbGluayBSZXRyeVBvbGljeS5ub25SZXRyeWFibGVFcnJvclR5cGVzfSkuXG4gICAqXG4gICAqIEBwYXJhbSBtZXNzYWdlIE9wdGlvbmFsIGVycm9yIG1lc3NhZ2VcbiAgICogQHBhcmFtIHR5cGUgT3B0aW9uYWwgZXJyb3IgdHlwZVxuICAgKiBAcGFyYW0gZGV0YWlscyBPcHRpb25hbCBkZXRhaWxzIGFib3V0IHRoZSBmYWlsdXJlLiBTZXJpYWxpemVkIGJ5IHRoZSBXb3JrZXIncyB7QGxpbmsgUGF5bG9hZENvbnZlcnRlcn0uXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIG5vblJldHJ5YWJsZShtZXNzYWdlPzogc3RyaW5nIHwgbnVsbCwgdHlwZT86IHN0cmluZyB8IG51bGwsIC4uLmRldGFpbHM6IHVua25vd25bXSk6IEFwcGxpY2F0aW9uRmFpbHVyZSB7XG4gICAgcmV0dXJuIG5ldyB0aGlzKG1lc3NhZ2UsIHR5cGUgPz8gJ0Vycm9yJywgdHJ1ZSwgZGV0YWlscyk7XG4gIH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBBcHBsaWNhdGlvbkZhaWx1cmVPcHRpb25zIHtcbiAgLyoqXG4gICAqIEVycm9yIG1lc3NhZ2VcbiAgICovXG4gIG1lc3NhZ2U/OiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIEVycm9yIHR5cGUgKHVzZWQgYnkge0BsaW5rIFJldHJ5UG9saWN5Lm5vblJldHJ5YWJsZUVycm9yVHlwZXN9KVxuICAgKi9cbiAgdHlwZT86IHN0cmluZztcblxuICAvKipcbiAgICogV2hldGhlciB0aGUgY3VycmVudCBBY3Rpdml0eSBvciBXb3JrZmxvdyBjYW4gYmUgcmV0cmllZFxuICAgKlxuICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgKi9cbiAgbm9uUmV0cnlhYmxlPzogYm9vbGVhbjtcblxuICAvKipcbiAgICogRGV0YWlscyBhYm91dCB0aGUgZmFpbHVyZS4gU2VyaWFsaXplZCBieSB0aGUgV29ya2VyJ3Mge0BsaW5rIFBheWxvYWRDb252ZXJ0ZXJ9LlxuICAgKi9cbiAgZGV0YWlscz86IHVua25vd25bXTtcblxuICAvKipcbiAgICogSWYgc2V0LCBvdmVycmlkZXMgdGhlIGRlbGF5IHVudGlsIHRoZSBuZXh0IHJldHJ5IG9mIHRoaXMgQWN0aXZpdHkgLyBXb3JrZmxvdyBUYXNrLlxuICAgKlxuICAgKiBSZXRyeSBhdHRlbXB0cyB3aWxsIHN0aWxsIGJlIHN1YmplY3QgdG8gdGhlIG1heGltdW0gcmV0cmllcyBsaW1pdCBhbmQgdG90YWwgdGltZSBsaW1pdCBkZWZpbmVkXG4gICAqIGJ5IHRoZSBwb2xpY3kuXG4gICAqL1xuICBuZXh0UmV0cnlEZWxheT86IER1cmF0aW9uO1xuXG4gIC8qKlxuICAgKiBDYXVzZSBvZiB0aGUgZmFpbHVyZVxuICAgKi9cbiAgY2F1c2U/OiBFcnJvcjtcbn1cblxuLyoqXG4gKiBUaGlzIGVycm9yIGlzIHRocm93biB3aGVuIENhbmNlbGxhdGlvbiBoYXMgYmVlbiByZXF1ZXN0ZWQuIFRvIGFsbG93IENhbmNlbGxhdGlvbiB0byBoYXBwZW4sIGxldCBpdCBwcm9wYWdhdGUuIFRvXG4gKiBpZ25vcmUgQ2FuY2VsbGF0aW9uLCBjYXRjaCBpdCBhbmQgY29udGludWUgZXhlY3V0aW5nLiBOb3RlIHRoYXQgQ2FuY2VsbGF0aW9uIGNhbiBvbmx5IGJlIHJlcXVlc3RlZCBhIHNpbmdsZSB0aW1lLCBzb1xuICogeW91ciBXb3JrZmxvdy9BY3Rpdml0eSBFeGVjdXRpb24gd2lsbCBub3QgcmVjZWl2ZSBmdXJ0aGVyIENhbmNlbGxhdGlvbiByZXF1ZXN0cy5cbiAqXG4gKiBXaGVuIGEgV29ya2Zsb3cgb3IgQWN0aXZpdHkgaGFzIGJlZW4gc3VjY2Vzc2Z1bGx5IGNhbmNlbGxlZCwgYSBgQ2FuY2VsbGVkRmFpbHVyZWAgd2lsbCBiZSB0aGUgYGNhdXNlYC5cbiAqL1xuQFN5bWJvbEJhc2VkSW5zdGFuY2VPZkVycm9yKCdDYW5jZWxsZWRGYWlsdXJlJylcbmV4cG9ydCBjbGFzcyBDYW5jZWxsZWRGYWlsdXJlIGV4dGVuZHMgVGVtcG9yYWxGYWlsdXJlIHtcbiAgY29uc3RydWN0b3IoXG4gICAgbWVzc2FnZTogc3RyaW5nIHwgdW5kZWZpbmVkLFxuICAgIHB1YmxpYyByZWFkb25seSBkZXRhaWxzOiB1bmtub3duW10gPSBbXSxcbiAgICBjYXVzZT86IEVycm9yXG4gICkge1xuICAgIHN1cGVyKG1lc3NhZ2UsIGNhdXNlKTtcbiAgfVxufVxuXG4vKipcbiAqIFVzZWQgYXMgdGhlIGBjYXVzZWAgd2hlbiBhIFdvcmtmbG93IGhhcyBiZWVuIHRlcm1pbmF0ZWRcbiAqL1xuQFN5bWJvbEJhc2VkSW5zdGFuY2VPZkVycm9yKCdUZXJtaW5hdGVkRmFpbHVyZScpXG5leHBvcnQgY2xhc3MgVGVybWluYXRlZEZhaWx1cmUgZXh0ZW5kcyBUZW1wb3JhbEZhaWx1cmUge1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlOiBzdHJpbmcgfCB1bmRlZmluZWQsIGNhdXNlPzogRXJyb3IpIHtcbiAgICBzdXBlcihtZXNzYWdlLCBjYXVzZSk7XG4gIH1cbn1cblxuLyoqXG4gKiBVc2VkIHRvIHJlcHJlc2VudCB0aW1lb3V0cyBvZiBBY3Rpdml0aWVzIGFuZCBXb3JrZmxvd3NcbiAqL1xuQFN5bWJvbEJhc2VkSW5zdGFuY2VPZkVycm9yKCdUaW1lb3V0RmFpbHVyZScpXG5leHBvcnQgY2xhc3MgVGltZW91dEZhaWx1cmUgZXh0ZW5kcyBUZW1wb3JhbEZhaWx1cmUge1xuICBjb25zdHJ1Y3RvcihcbiAgICBtZXNzYWdlOiBzdHJpbmcgfCB1bmRlZmluZWQsXG4gICAgcHVibGljIHJlYWRvbmx5IGxhc3RIZWFydGJlYXREZXRhaWxzOiB1bmtub3duLFxuICAgIHB1YmxpYyByZWFkb25seSB0aW1lb3V0VHlwZTogVGltZW91dFR5cGVcbiAgKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gIH1cbn1cblxuLyoqXG4gKiBDb250YWlucyBpbmZvcm1hdGlvbiBhYm91dCBhbiBBY3Rpdml0eSBmYWlsdXJlLiBBbHdheXMgY29udGFpbnMgdGhlIG9yaWdpbmFsIHJlYXNvbiBmb3IgdGhlIGZhaWx1cmUgYXMgaXRzIGBjYXVzZWAuXG4gKiBGb3IgZXhhbXBsZSwgaWYgYW4gQWN0aXZpdHkgdGltZWQgb3V0LCB0aGUgY2F1c2Ugd2lsbCBiZSBhIHtAbGluayBUaW1lb3V0RmFpbHVyZX0uXG4gKlxuICogVGhpcyBleGNlcHRpb24gaXMgZXhwZWN0ZWQgdG8gYmUgdGhyb3duIG9ubHkgYnkgdGhlIGZyYW1ld29yayBjb2RlLlxuICovXG5AU3ltYm9sQmFzZWRJbnN0YW5jZU9mRXJyb3IoJ0FjdGl2aXR5RmFpbHVyZScpXG5leHBvcnQgY2xhc3MgQWN0aXZpdHlGYWlsdXJlIGV4dGVuZHMgVGVtcG9yYWxGYWlsdXJlIHtcbiAgcHVibGljIGNvbnN0cnVjdG9yKFxuICAgIG1lc3NhZ2U6IHN0cmluZyB8IHVuZGVmaW5lZCxcbiAgICBwdWJsaWMgcmVhZG9ubHkgYWN0aXZpdHlUeXBlOiBzdHJpbmcsXG4gICAgcHVibGljIHJlYWRvbmx5IGFjdGl2aXR5SWQ6IHN0cmluZyB8IHVuZGVmaW5lZCxcbiAgICBwdWJsaWMgcmVhZG9ubHkgcmV0cnlTdGF0ZTogUmV0cnlTdGF0ZSxcbiAgICBwdWJsaWMgcmVhZG9ubHkgaWRlbnRpdHk6IHN0cmluZyB8IHVuZGVmaW5lZCxcbiAgICBjYXVzZT86IEVycm9yXG4gICkge1xuICAgIHN1cGVyKG1lc3NhZ2UsIGNhdXNlKTtcbiAgfVxufVxuXG4vKipcbiAqIENvbnRhaW5zIGluZm9ybWF0aW9uIGFib3V0IGEgQ2hpbGQgV29ya2Zsb3cgZmFpbHVyZS4gQWx3YXlzIGNvbnRhaW5zIHRoZSByZWFzb24gZm9yIHRoZSBmYWlsdXJlIGFzIGl0cyB7QGxpbmsgY2F1c2V9LlxuICogRm9yIGV4YW1wbGUsIGlmIHRoZSBDaGlsZCB3YXMgVGVybWluYXRlZCwgdGhlIGBjYXVzZWAgaXMgYSB7QGxpbmsgVGVybWluYXRlZEZhaWx1cmV9LlxuICpcbiAqIFRoaXMgZXhjZXB0aW9uIGlzIGV4cGVjdGVkIHRvIGJlIHRocm93biBvbmx5IGJ5IHRoZSBmcmFtZXdvcmsgY29kZS5cbiAqL1xuQFN5bWJvbEJhc2VkSW5zdGFuY2VPZkVycm9yKCdDaGlsZFdvcmtmbG93RmFpbHVyZScpXG5leHBvcnQgY2xhc3MgQ2hpbGRXb3JrZmxvd0ZhaWx1cmUgZXh0ZW5kcyBUZW1wb3JhbEZhaWx1cmUge1xuICBwdWJsaWMgY29uc3RydWN0b3IoXG4gICAgcHVibGljIHJlYWRvbmx5IG5hbWVzcGFjZTogc3RyaW5nIHwgdW5kZWZpbmVkLFxuICAgIHB1YmxpYyByZWFkb25seSBleGVjdXRpb246IFdvcmtmbG93RXhlY3V0aW9uLFxuICAgIHB1YmxpYyByZWFkb25seSB3b3JrZmxvd1R5cGU6IHN0cmluZyxcbiAgICBwdWJsaWMgcmVhZG9ubHkgcmV0cnlTdGF0ZTogUmV0cnlTdGF0ZSxcbiAgICBjYXVzZT86IEVycm9yXG4gICkge1xuICAgIHN1cGVyKCdDaGlsZCBXb3JrZmxvdyBleGVjdXRpb24gZmFpbGVkJywgY2F1c2UpO1xuICB9XG59XG5cbi8qKlxuICogVGhpcyBleGNlcHRpb24gaXMgdGhyb3duIGluIHRoZSBmb2xsb3dpbmcgY2FzZXM6XG4gKiAgLSBXb3JrZmxvdyB3aXRoIHRoZSBzYW1lIFdvcmtmbG93IElkIGlzIGN1cnJlbnRseSBydW5uaW5nXG4gKiAgLSBUaGVyZSBpcyBhIGNsb3NlZCBXb3JrZmxvdyB3aXRoIHRoZSBzYW1lIFdvcmtmbG93IElkIGFuZCB0aGUge0BsaW5rIFdvcmtmbG93T3B0aW9ucy53b3JrZmxvd0lkUmV1c2VQb2xpY3l9XG4gKiAgICBpcyBgV09SS0ZMT1dfSURfUkVVU0VfUE9MSUNZX1JFSkVDVF9EVVBMSUNBVEVgXG4gKiAgLSBUaGVyZSBpcyBjbG9zZWQgV29ya2Zsb3cgaW4gdGhlIGBDb21wbGV0ZWRgIHN0YXRlIHdpdGggdGhlIHNhbWUgV29ya2Zsb3cgSWQgYW5kIHRoZSB7QGxpbmsgV29ya2Zsb3dPcHRpb25zLndvcmtmbG93SWRSZXVzZVBvbGljeX1cbiAqICAgIGlzIGBXT1JLRkxPV19JRF9SRVVTRV9QT0xJQ1lfQUxMT1dfRFVQTElDQVRFX0ZBSUxFRF9PTkxZYFxuICovXG5AU3ltYm9sQmFzZWRJbnN0YW5jZU9mRXJyb3IoJ1dvcmtmbG93RXhlY3V0aW9uQWxyZWFkeVN0YXJ0ZWRFcnJvcicpXG5leHBvcnQgY2xhc3MgV29ya2Zsb3dFeGVjdXRpb25BbHJlYWR5U3RhcnRlZEVycm9yIGV4dGVuZHMgVGVtcG9yYWxGYWlsdXJlIHtcbiAgY29uc3RydWN0b3IoXG4gICAgbWVzc2FnZTogc3RyaW5nLFxuICAgIHB1YmxpYyByZWFkb25seSB3b3JrZmxvd0lkOiBzdHJpbmcsXG4gICAgcHVibGljIHJlYWRvbmx5IHdvcmtmbG93VHlwZTogc3RyaW5nXG4gICkge1xuICAgIHN1cGVyKG1lc3NhZ2UpO1xuICB9XG59XG5cbi8qKlxuICogSWYgYGVycm9yYCBpcyBhbHJlYWR5IGFuIGBBcHBsaWNhdGlvbkZhaWx1cmVgLCByZXR1cm5zIGBlcnJvcmAuXG4gKlxuICogT3RoZXJ3aXNlLCBjb252ZXJ0cyBgZXJyb3JgIGludG8gYW4gYEFwcGxpY2F0aW9uRmFpbHVyZWAgd2l0aDpcbiAqXG4gKiAtIGBtZXNzYWdlYDogYGVycm9yLm1lc3NhZ2VgIG9yIGBTdHJpbmcoZXJyb3IpYFxuICogLSBgdHlwZWA6IGBlcnJvci5jb25zdHJ1Y3Rvci5uYW1lYCBvciBgZXJyb3IubmFtZWBcbiAqIC0gYHN0YWNrYDogYGVycm9yLnN0YWNrYCBvciBgJydgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlbnN1cmVBcHBsaWNhdGlvbkZhaWx1cmUoZXJyb3I6IHVua25vd24pOiBBcHBsaWNhdGlvbkZhaWx1cmUge1xuICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBBcHBsaWNhdGlvbkZhaWx1cmUpIHtcbiAgICByZXR1cm4gZXJyb3I7XG4gIH1cblxuICBjb25zdCBtZXNzYWdlID0gKGlzUmVjb3JkKGVycm9yKSAmJiBTdHJpbmcoZXJyb3IubWVzc2FnZSkpIHx8IFN0cmluZyhlcnJvcik7XG4gIGNvbnN0IHR5cGUgPSAoaXNSZWNvcmQoZXJyb3IpICYmIChlcnJvci5jb25zdHJ1Y3Rvcj8ubmFtZSA/PyBlcnJvci5uYW1lKSkgfHwgdW5kZWZpbmVkO1xuICBjb25zdCBmYWlsdXJlID0gQXBwbGljYXRpb25GYWlsdXJlLmNyZWF0ZSh7IG1lc3NhZ2UsIHR5cGUsIG5vblJldHJ5YWJsZTogZmFsc2UgfSk7XG4gIGZhaWx1cmUuc3RhY2sgPSAoaXNSZWNvcmQoZXJyb3IpICYmIFN0cmluZyhlcnJvci5zdGFjaykpIHx8ICcnO1xuICByZXR1cm4gZmFpbHVyZTtcbn1cblxuLyoqXG4gKiBJZiBgZXJyYCBpcyBhbiBFcnJvciBpdCBpcyB0dXJuZWQgaW50byBhbiBgQXBwbGljYXRpb25GYWlsdXJlYC5cbiAqXG4gKiBJZiBgZXJyYCB3YXMgYWxyZWFkeSBhIGBUZW1wb3JhbEZhaWx1cmVgLCByZXR1cm5zIHRoZSBvcmlnaW5hbCBlcnJvci5cbiAqXG4gKiBPdGhlcndpc2UgcmV0dXJucyBhbiBgQXBwbGljYXRpb25GYWlsdXJlYCB3aXRoIGBTdHJpbmcoZXJyKWAgYXMgdGhlIG1lc3NhZ2UuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlbnN1cmVUZW1wb3JhbEZhaWx1cmUoZXJyOiB1bmtub3duKTogVGVtcG9yYWxGYWlsdXJlIHtcbiAgaWYgKGVyciBpbnN0YW5jZW9mIFRlbXBvcmFsRmFpbHVyZSkge1xuICAgIHJldHVybiBlcnI7XG4gIH1cbiAgcmV0dXJuIGVuc3VyZUFwcGxpY2F0aW9uRmFpbHVyZShlcnIpO1xufVxuXG4vKipcbiAqIEdldCB0aGUgcm9vdCBjYXVzZSBtZXNzYWdlIG9mIGdpdmVuIGBlcnJvcmAuXG4gKlxuICogSW4gY2FzZSBgZXJyb3JgIGlzIGEge0BsaW5rIFRlbXBvcmFsRmFpbHVyZX0sIHJlY3Vyc2UgdGhlIGBjYXVzZWAgY2hhaW4gYW5kIHJldHVybiB0aGUgcm9vdCBgY2F1c2UubWVzc2FnZWAuXG4gKiBPdGhlcndpc2UsIHJldHVybiBgZXJyb3IubWVzc2FnZWAuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByb290Q2F1c2UoZXJyb3I6IHVua25vd24pOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBUZW1wb3JhbEZhaWx1cmUpIHtcbiAgICByZXR1cm4gZXJyb3IuY2F1c2UgPyByb290Q2F1c2UoZXJyb3IuY2F1c2UpIDogZXJyb3IubWVzc2FnZTtcbiAgfVxuICByZXR1cm4gZXJyb3JNZXNzYWdlKGVycm9yKTtcbn1cbiIsIi8qKlxuICogQ29tbW9uIGxpYnJhcnkgZm9yIGNvZGUgdGhhdCdzIHVzZWQgYWNyb3NzIHRoZSBDbGllbnQsIFdvcmtlciwgYW5kL29yIFdvcmtmbG93XG4gKlxuICogQG1vZHVsZVxuICovXG5cbmltcG9ydCAqIGFzIGVuY29kaW5nIGZyb20gJy4vZW5jb2RpbmcnO1xuaW1wb3J0ICogYXMgaGVscGVycyBmcm9tICcuL3R5cGUtaGVscGVycyc7XG5cbmV4cG9ydCAqIGZyb20gJy4vYWN0aXZpdHktb3B0aW9ucyc7XG5leHBvcnQgKiBmcm9tICcuL2NvbnZlcnRlci9kYXRhLWNvbnZlcnRlcic7XG5leHBvcnQgKiBmcm9tICcuL2NvbnZlcnRlci9mYWlsdXJlLWNvbnZlcnRlcic7XG5leHBvcnQgKiBmcm9tICcuL2NvbnZlcnRlci9wYXlsb2FkLWNvZGVjJztcbmV4cG9ydCAqIGZyb20gJy4vY29udmVydGVyL3BheWxvYWQtY29udmVydGVyJztcbmV4cG9ydCAqIGZyb20gJy4vY29udmVydGVyL3R5cGVzJztcbmV4cG9ydCAqIGZyb20gJy4vZGVwcmVjYXRlZC10aW1lJztcbmV4cG9ydCAqIGZyb20gJy4vZXJyb3JzJztcbmV4cG9ydCAqIGZyb20gJy4vZmFpbHVyZSc7XG5leHBvcnQgeyBIZWFkZXJzLCBOZXh0IH0gZnJvbSAnLi9pbnRlcmNlcHRvcnMnO1xuZXhwb3J0ICogZnJvbSAnLi9pbnRlcmZhY2VzJztcbmV4cG9ydCAqIGZyb20gJy4vbG9nZ2VyJztcbmV4cG9ydCAqIGZyb20gJy4vcmV0cnktcG9saWN5JztcbmV4cG9ydCB0eXBlIHsgVGltZXN0YW1wLCBEdXJhdGlvbiwgU3RyaW5nVmFsdWUgfSBmcm9tICcuL3RpbWUnO1xuZXhwb3J0ICogZnJvbSAnLi93b3JrZmxvdy1oYW5kbGUnO1xuZXhwb3J0ICogZnJvbSAnLi93b3JrZmxvdy1vcHRpb25zJztcbmV4cG9ydCAqIGZyb20gJy4vdmVyc2lvbmluZy1pbnRlbnQnO1xuXG4vKipcbiAqIEVuY29kZSBhIFVURi04IHN0cmluZyBpbnRvIGEgVWludDhBcnJheVxuICpcbiAqIEBoaWRkZW5cbiAqIEBkZXByZWNhdGVkIC0gbWVhbnQgZm9yIGludGVybmFsIHVzZSBvbmx5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1OChzOiBzdHJpbmcpOiBVaW50OEFycmF5IHtcbiAgcmV0dXJuIGVuY29kaW5nLmVuY29kZShzKTtcbn1cblxuLyoqXG4gKiBEZWNvZGUgYSBVaW50OEFycmF5IGludG8gYSBVVEYtOCBzdHJpbmdcbiAqXG4gKiBAaGlkZGVuXG4gKiBAZGVwcmVjYXRlZCAtIG1lYW50IGZvciBpbnRlcm5hbCB1c2Ugb25seVxuICovXG5leHBvcnQgZnVuY3Rpb24gc3RyKGFycjogVWludDhBcnJheSk6IHN0cmluZyB7XG4gIHJldHVybiBlbmNvZGluZy5kZWNvZGUoYXJyKTtcbn1cblxuLyoqXG4gKiBHZXQgYGVycm9yLm1lc3NhZ2VgIChvciBgdW5kZWZpbmVkYCBpZiBub3QgcHJlc2VudClcbiAqXG4gKiBAaGlkZGVuXG4gKiBAZGVwcmVjYXRlZCAtIG1lYW50IGZvciBpbnRlcm5hbCB1c2Ugb25seVxuICovXG5leHBvcnQgZnVuY3Rpb24gZXJyb3JNZXNzYWdlKGVycm9yOiB1bmtub3duKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgcmV0dXJuIGhlbHBlcnMuZXJyb3JNZXNzYWdlKGVycm9yKTtcbn1cblxuLyoqXG4gKiBHZXQgYGVycm9yLmNvZGVgIChvciBgdW5kZWZpbmVkYCBpZiBub3QgcHJlc2VudClcbiAqXG4gKiBAaGlkZGVuXG4gKiBAZGVwcmVjYXRlZCAtIG1lYW50IGZvciBpbnRlcm5hbCB1c2Ugb25seVxuICovXG5leHBvcnQgZnVuY3Rpb24gZXJyb3JDb2RlKGVycm9yOiB1bmtub3duKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgcmV0dXJuIGhlbHBlcnMuZXJyb3JDb2RlKGVycm9yKTtcbn1cbiIsImltcG9ydCB7IEFueUZ1bmMsIE9taXRMYXN0UGFyYW0gfSBmcm9tICcuL3R5cGUtaGVscGVycyc7XG5pbXBvcnQgeyBQYXlsb2FkIH0gZnJvbSAnLi9pbnRlcmZhY2VzJztcblxuLyoqXG4gKiBUeXBlIG9mIHRoZSBuZXh0IGZ1bmN0aW9uIGZvciBhIGdpdmVuIGludGVyY2VwdG9yIGZ1bmN0aW9uXG4gKlxuICogQ2FsbGVkIGZyb20gYW4gaW50ZXJjZXB0b3IgdG8gY29udGludWUgdGhlIGludGVyY2VwdGlvbiBjaGFpblxuICovXG5leHBvcnQgdHlwZSBOZXh0PElGLCBGTiBleHRlbmRzIGtleW9mIElGPiA9IFJlcXVpcmVkPElGPltGTl0gZXh0ZW5kcyBBbnlGdW5jID8gT21pdExhc3RQYXJhbTxSZXF1aXJlZDxJRj5bRk5dPiA6IG5ldmVyO1xuXG4vKiogSGVhZGVycyBhcmUganVzdCBhIG1hcHBpbmcgb2YgaGVhZGVyIG5hbWUgdG8gUGF5bG9hZCAqL1xuZXhwb3J0IHR5cGUgSGVhZGVycyA9IFJlY29yZDxzdHJpbmcsIFBheWxvYWQ+O1xuXG4vKipcbiAqIENvbXBvc2UgYWxsIGludGVyY2VwdG9yIG1ldGhvZHMgaW50byBhIHNpbmdsZSBmdW5jdGlvbi5cbiAqXG4gKiBDYWxsaW5nIHRoZSBjb21wb3NlZCBmdW5jdGlvbiByZXN1bHRzIGluIGNhbGxpbmcgZWFjaCBvZiB0aGUgcHJvdmlkZWQgaW50ZXJjZXB0b3IsIGluIG9yZGVyIChmcm9tIHRoZSBmaXJzdCB0b1xuICogdGhlIGxhc3QpLCBmb2xsb3dlZCBieSB0aGUgb3JpZ2luYWwgZnVuY3Rpb24gcHJvdmlkZWQgYXMgYXJndW1lbnQgdG8gYGNvbXBvc2VJbnRlcmNlcHRvcnMoKWAuXG4gKlxuICogQHBhcmFtIGludGVyY2VwdG9ycyBhIGxpc3Qgb2YgaW50ZXJjZXB0b3JzXG4gKiBAcGFyYW0gbWV0aG9kIHRoZSBuYW1lIG9mIHRoZSBpbnRlcmNlcHRvciBtZXRob2QgdG8gY29tcG9zZVxuICogQHBhcmFtIG5leHQgdGhlIG9yaWdpbmFsIGZ1bmN0aW9uIHRvIGJlIGV4ZWN1dGVkIGF0IHRoZSBlbmQgb2YgdGhlIGludGVyY2VwdGlvbiBjaGFpblxuICovXG4vLyB0cy1wcnVuZS1pZ25vcmUtbmV4dCAoaW1wb3J0ZWQgdmlhIGxpYi9pbnRlcmNlcHRvcnMpXG5leHBvcnQgZnVuY3Rpb24gY29tcG9zZUludGVyY2VwdG9yczxJLCBNIGV4dGVuZHMga2V5b2YgST4oaW50ZXJjZXB0b3JzOiBJW10sIG1ldGhvZDogTSwgbmV4dDogTmV4dDxJLCBNPik6IE5leHQ8SSwgTT4ge1xuICBmb3IgKGxldCBpID0gaW50ZXJjZXB0b3JzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgY29uc3QgaW50ZXJjZXB0b3IgPSBpbnRlcmNlcHRvcnNbaV07XG4gICAgaWYgKGludGVyY2VwdG9yW21ldGhvZF0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgY29uc3QgcHJldiA9IG5leHQ7XG4gICAgICAvLyBXZSBsb3NlIHR5cGUgc2FmZXR5IGhlcmUgYmVjYXVzZSBUeXBlc2NyaXB0IGNhbid0IGRlZHVjZSB0aGF0IGludGVyY2VwdG9yW21ldGhvZF0gaXMgYSBmdW5jdGlvbiB0aGF0IHJldHVybnNcbiAgICAgIC8vIHRoZSBzYW1lIHR5cGUgYXMgTmV4dDxJLCBNPlxuICAgICAgbmV4dCA9ICgoaW5wdXQ6IGFueSkgPT4gKGludGVyY2VwdG9yW21ldGhvZF0gYXMgYW55KShpbnB1dCwgcHJldikpIGFzIGFueTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG5leHQ7XG59XG4iLCJpbXBvcnQgdHlwZSB7IHRlbXBvcmFsIH0gZnJvbSAnQHRlbXBvcmFsaW8vcHJvdG8nO1xuXG5leHBvcnQgdHlwZSBQYXlsb2FkID0gdGVtcG9yYWwuYXBpLmNvbW1vbi52MS5JUGF5bG9hZDtcblxuLyoqIFR5cGUgdGhhdCBjYW4gYmUgcmV0dXJuZWQgZnJvbSBhIFdvcmtmbG93IGBleGVjdXRlYCBmdW5jdGlvbiAqL1xuZXhwb3J0IHR5cGUgV29ya2Zsb3dSZXR1cm5UeXBlID0gUHJvbWlzZTxhbnk+O1xuZXhwb3J0IHR5cGUgV29ya2Zsb3dVcGRhdGVUeXBlID0gKC4uLmFyZ3M6IGFueVtdKSA9PiBQcm9taXNlPGFueT4gfCBhbnk7XG5leHBvcnQgdHlwZSBXb3JrZmxvd1VwZGF0ZVZhbGlkYXRvclR5cGUgPSAoLi4uYXJnczogYW55W10pID0+IHZvaWQ7XG5leHBvcnQgdHlwZSBXb3JrZmxvd1VwZGF0ZUFubm90YXRlZFR5cGUgPSB7XG4gIGhhbmRsZXI6IFdvcmtmbG93VXBkYXRlVHlwZTtcbiAgdW5maW5pc2hlZFBvbGljeTogSGFuZGxlclVuZmluaXNoZWRQb2xpY3k7XG4gIHZhbGlkYXRvcj86IFdvcmtmbG93VXBkYXRlVmFsaWRhdG9yVHlwZTtcbiAgZGVzY3JpcHRpb24/OiBzdHJpbmc7XG59O1xuZXhwb3J0IHR5cGUgV29ya2Zsb3dTaWduYWxUeXBlID0gKC4uLmFyZ3M6IGFueVtdKSA9PiBQcm9taXNlPHZvaWQ+IHwgdm9pZDtcbmV4cG9ydCB0eXBlIFdvcmtmbG93U2lnbmFsQW5ub3RhdGVkVHlwZSA9IHtcbiAgaGFuZGxlcjogV29ya2Zsb3dTaWduYWxUeXBlO1xuICB1bmZpbmlzaGVkUG9saWN5OiBIYW5kbGVyVW5maW5pc2hlZFBvbGljeTtcbiAgZGVzY3JpcHRpb24/OiBzdHJpbmc7XG59O1xuZXhwb3J0IHR5cGUgV29ya2Zsb3dRdWVyeVR5cGUgPSAoLi4uYXJnczogYW55W10pID0+IGFueTtcbmV4cG9ydCB0eXBlIFdvcmtmbG93UXVlcnlBbm5vdGF0ZWRUeXBlID0geyBoYW5kbGVyOiBXb3JrZmxvd1F1ZXJ5VHlwZTsgZGVzY3JpcHRpb24/OiBzdHJpbmcgfTtcblxuLyoqXG4gKiBCcm9hZCBXb3JrZmxvdyBmdW5jdGlvbiBkZWZpbml0aW9uLCBzcGVjaWZpYyBXb3JrZmxvd3Mgd2lsbCB0eXBpY2FsbHkgdXNlIGEgbmFycm93ZXIgdHlwZSBkZWZpbml0aW9uLCBlLmc6XG4gKiBgYGB0c1xuICogZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG15V29ya2Zsb3coYXJnMTogbnVtYmVyLCBhcmcyOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz47XG4gKiBgYGBcbiAqL1xuZXhwb3J0IHR5cGUgV29ya2Zsb3cgPSAoLi4uYXJnczogYW55W10pID0+IFdvcmtmbG93UmV0dXJuVHlwZTtcblxuZGVjbGFyZSBjb25zdCBhcmdzQnJhbmQ6IHVuaXF1ZSBzeW1ib2w7XG5kZWNsYXJlIGNvbnN0IHJldEJyYW5kOiB1bmlxdWUgc3ltYm9sO1xuXG4vKipcbiAqIEFuIGludGVyZmFjZSByZXByZXNlbnRpbmcgYSBXb3JrZmxvdyB1cGRhdGUgZGVmaW5pdGlvbiwgYXMgcmV0dXJuZWQgZnJvbSB7QGxpbmsgZGVmaW5lVXBkYXRlfVxuICpcbiAqIEByZW1hcmtzIGBBcmdzYCBjYW4gYmUgdXNlZCBmb3IgcGFyYW1ldGVyIHR5cGUgaW5mZXJlbmNlIGluIGhhbmRsZXIgZnVuY3Rpb25zIGFuZCBXb3JrZmxvd0hhbmRsZSBtZXRob2RzLlxuICogYE5hbWVgIGNhbiBvcHRpb25hbGx5IGJlIHNwZWNpZmllZCB3aXRoIGEgc3RyaW5nIGxpdGVyYWwgdHlwZSB0byBwcmVzZXJ2ZSB0eXBlLWxldmVsIGtub3dsZWRnZSBvZiB0aGUgdXBkYXRlIG5hbWUuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgVXBkYXRlRGVmaW5pdGlvbjxSZXQsIEFyZ3MgZXh0ZW5kcyBhbnlbXSA9IFtdLCBOYW1lIGV4dGVuZHMgc3RyaW5nID0gc3RyaW5nPiB7XG4gIHR5cGU6ICd1cGRhdGUnO1xuICBuYW1lOiBOYW1lO1xuICAvKipcbiAgICogVmlydHVhbCB0eXBlIGJyYW5kIHRvIG1haW50YWluIGEgZGlzdGluY3Rpb24gYmV0d2VlbiB7QGxpbmsgVXBkYXRlRGVmaW5pdGlvbn0gdHlwZXMgd2l0aCBkaWZmZXJlbnQgYXJncy5cbiAgICogVGhpcyBmaWVsZCBpcyBub3QgcHJlc2VudCBhdCBydW4tdGltZS5cbiAgICovXG4gIFthcmdzQnJhbmRdOiBBcmdzO1xuICAvKipcbiAgICogVmlydHVhbCB0eXBlIGJyYW5kIHRvIG1haW50YWluIGEgZGlzdGluY3Rpb24gYmV0d2VlbiB7QGxpbmsgVXBkYXRlRGVmaW5pdGlvbn0gdHlwZXMgd2l0aCBkaWZmZXJlbnQgcmV0dXJuIHR5cGVzLlxuICAgKiBUaGlzIGZpZWxkIGlzIG5vdCBwcmVzZW50IGF0IHJ1bi10aW1lLlxuICAgKi9cbiAgW3JldEJyYW5kXTogUmV0O1xufVxuXG4vKipcbiAqIEFuIGludGVyZmFjZSByZXByZXNlbnRpbmcgYSBXb3JrZmxvdyBzaWduYWwgZGVmaW5pdGlvbiwgYXMgcmV0dXJuZWQgZnJvbSB7QGxpbmsgZGVmaW5lU2lnbmFsfVxuICpcbiAqIEByZW1hcmtzIGBBcmdzYCBjYW4gYmUgdXNlZCBmb3IgcGFyYW1ldGVyIHR5cGUgaW5mZXJlbmNlIGluIGhhbmRsZXIgZnVuY3Rpb25zIGFuZCBXb3JrZmxvd0hhbmRsZSBtZXRob2RzLlxuICogYE5hbWVgIGNhbiBvcHRpb25hbGx5IGJlIHNwZWNpZmllZCB3aXRoIGEgc3RyaW5nIGxpdGVyYWwgdHlwZSB0byBwcmVzZXJ2ZSB0eXBlLWxldmVsIGtub3dsZWRnZSBvZiB0aGUgc2lnbmFsIG5hbWUuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgU2lnbmFsRGVmaW5pdGlvbjxBcmdzIGV4dGVuZHMgYW55W10gPSBbXSwgTmFtZSBleHRlbmRzIHN0cmluZyA9IHN0cmluZz4ge1xuICB0eXBlOiAnc2lnbmFsJztcbiAgbmFtZTogTmFtZTtcbiAgLyoqXG4gICAqIFZpcnR1YWwgdHlwZSBicmFuZCB0byBtYWludGFpbiBhIGRpc3RpbmN0aW9uIGJldHdlZW4ge0BsaW5rIFNpZ25hbERlZmluaXRpb259IHR5cGVzIHdpdGggZGlmZmVyZW50IGFyZ3MuXG4gICAqIFRoaXMgZmllbGQgaXMgbm90IHByZXNlbnQgYXQgcnVuLXRpbWUuXG4gICAqL1xuICBbYXJnc0JyYW5kXTogQXJncztcbn1cblxuLyoqXG4gKiBBbiBpbnRlcmZhY2UgcmVwcmVzZW50aW5nIGEgV29ya2Zsb3cgcXVlcnkgZGVmaW5pdGlvbiBhcyByZXR1cm5lZCBmcm9tIHtAbGluayBkZWZpbmVRdWVyeX1cbiAqXG4gKiBAcmVtYXJrcyBgQXJnc2AgYW5kIGBSZXRgIGNhbiBiZSB1c2VkIGZvciBwYXJhbWV0ZXIgdHlwZSBpbmZlcmVuY2UgaW4gaGFuZGxlciBmdW5jdGlvbnMgYW5kIFdvcmtmbG93SGFuZGxlIG1ldGhvZHMuXG4gKiBgTmFtZWAgY2FuIG9wdGlvbmFsbHkgYmUgc3BlY2lmaWVkIHdpdGggYSBzdHJpbmcgbGl0ZXJhbCB0eXBlIHRvIHByZXNlcnZlIHR5cGUtbGV2ZWwga25vd2xlZGdlIG9mIHRoZSBxdWVyeSBuYW1lLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFF1ZXJ5RGVmaW5pdGlvbjxSZXQsIEFyZ3MgZXh0ZW5kcyBhbnlbXSA9IFtdLCBOYW1lIGV4dGVuZHMgc3RyaW5nID0gc3RyaW5nPiB7XG4gIHR5cGU6ICdxdWVyeSc7XG4gIG5hbWU6IE5hbWU7XG4gIC8qKlxuICAgKiBWaXJ0dWFsIHR5cGUgYnJhbmQgdG8gbWFpbnRhaW4gYSBkaXN0aW5jdGlvbiBiZXR3ZWVuIHtAbGluayBRdWVyeURlZmluaXRpb259IHR5cGVzIHdpdGggZGlmZmVyZW50IGFyZ3MuXG4gICAqIFRoaXMgZmllbGQgaXMgbm90IHByZXNlbnQgYXQgcnVuLXRpbWUuXG4gICAqL1xuICBbYXJnc0JyYW5kXTogQXJncztcbiAgLyoqXG4gICAqIFZpcnR1YWwgdHlwZSBicmFuZCB0byBtYWludGFpbiBhIGRpc3RpbmN0aW9uIGJldHdlZW4ge0BsaW5rIFF1ZXJ5RGVmaW5pdGlvbn0gdHlwZXMgd2l0aCBkaWZmZXJlbnQgcmV0dXJuIHR5cGVzLlxuICAgKiBUaGlzIGZpZWxkIGlzIG5vdCBwcmVzZW50IGF0IHJ1bi10aW1lLlxuICAgKi9cbiAgW3JldEJyYW5kXTogUmV0O1xufVxuXG4vKiogR2V0IHRoZSBcInVud3JhcHBlZFwiIHJldHVybiB0eXBlICh3aXRob3V0IFByb21pc2UpIG9mIHRoZSBleGVjdXRlIGhhbmRsZXIgZnJvbSBXb3JrZmxvdyB0eXBlIGBXYCAqL1xuZXhwb3J0IHR5cGUgV29ya2Zsb3dSZXN1bHRUeXBlPFcgZXh0ZW5kcyBXb3JrZmxvdz4gPSBSZXR1cm5UeXBlPFc+IGV4dGVuZHMgUHJvbWlzZTxpbmZlciBSPiA/IFIgOiBuZXZlcjtcblxuLyoqXG4gKiBJZiBhbm90aGVyIFNESyBjcmVhdGVzIGEgU2VhcmNoIEF0dHJpYnV0ZSB0aGF0J3Mgbm90IGFuIGFycmF5LCB3ZSB3cmFwIGl0IGluIGFuIGFycmF5LlxuICpcbiAqIERhdGVzIGFyZSBzZXJpYWxpemVkIGFzIElTTyBzdHJpbmdzLlxuICovXG5leHBvcnQgdHlwZSBTZWFyY2hBdHRyaWJ1dGVzID0gUmVjb3JkPHN0cmluZywgU2VhcmNoQXR0cmlidXRlVmFsdWUgfCBSZWFkb25seTxTZWFyY2hBdHRyaWJ1dGVWYWx1ZT4gfCB1bmRlZmluZWQ+O1xuZXhwb3J0IHR5cGUgU2VhcmNoQXR0cmlidXRlVmFsdWUgPSBzdHJpbmdbXSB8IG51bWJlcltdIHwgYm9vbGVhbltdIHwgRGF0ZVtdO1xuXG5leHBvcnQgaW50ZXJmYWNlIEFjdGl2aXR5RnVuY3Rpb248UCBleHRlbmRzIGFueVtdID0gYW55W10sIFIgPSBhbnk+IHtcbiAgKC4uLmFyZ3M6IFApOiBQcm9taXNlPFI+O1xufVxuXG4vKipcbiAqIE1hcHBpbmcgb2YgQWN0aXZpdHkgbmFtZSB0byBmdW5jdGlvblxuICogQGRlcHJlY2F0ZWQgbm90IHJlcXVpcmVkIGFueW1vcmUsIGZvciB1bnR5cGVkIGFjdGl2aXRpZXMgdXNlIHtAbGluayBVbnR5cGVkQWN0aXZpdGllc31cbiAqL1xuZXhwb3J0IHR5cGUgQWN0aXZpdHlJbnRlcmZhY2UgPSBSZWNvcmQ8c3RyaW5nLCBBY3Rpdml0eUZ1bmN0aW9uPjtcblxuLyoqXG4gKiBNYXBwaW5nIG9mIEFjdGl2aXR5IG5hbWUgdG8gZnVuY3Rpb25cbiAqL1xuZXhwb3J0IHR5cGUgVW50eXBlZEFjdGl2aXRpZXMgPSBSZWNvcmQ8c3RyaW5nLCBBY3Rpdml0eUZ1bmN0aW9uPjtcblxuLyoqXG4gKiBBIHdvcmtmbG93J3MgaGlzdG9yeSBhbmQgSUQuIFVzZWZ1bCBmb3IgcmVwbGF5LlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEhpc3RvcnlBbmRXb3JrZmxvd0lkIHtcbiAgd29ya2Zsb3dJZDogc3RyaW5nO1xuICBoaXN0b3J5OiB0ZW1wb3JhbC5hcGkuaGlzdG9yeS52MS5IaXN0b3J5IHwgdW5rbm93biB8IHVuZGVmaW5lZDtcbn1cblxuLyoqXG4gKiBQb2xpY3kgZGVmaW5pbmcgYWN0aW9ucyB0YWtlbiB3aGVuIGEgd29ya2Zsb3cgZXhpdHMgd2hpbGUgdXBkYXRlIG9yIHNpZ25hbCBoYW5kbGVycyBhcmUgcnVubmluZy5cbiAqIFRoZSB3b3JrZmxvdyBleGl0IG1heSBiZSBkdWUgdG8gc3VjY2Vzc2Z1bCByZXR1cm4sIGZhaWx1cmUsIGNhbmNlbGxhdGlvbiwgb3IgY29udGludWUtYXMtbmV3LlxuICovXG5leHBvcnQgZW51bSBIYW5kbGVyVW5maW5pc2hlZFBvbGljeSB7XG4gIC8qKlxuICAgKiBJc3N1ZSBhIHdhcm5pbmcgaW4gYWRkaXRpb24gdG8gYWJhbmRvbmluZyB0aGUgaGFuZGxlciBleGVjdXRpb24uIFRoZSB3YXJuaW5nIHdpbGwgbm90IGJlIGlzc3VlZCBpZiB0aGUgd29ya2Zsb3cgZmFpbHMuXG4gICAqL1xuICBXQVJOX0FORF9BQkFORE9OID0gMSxcblxuICAvKipcbiAgICogQWJhbmRvbiB0aGUgaGFuZGxlciBleGVjdXRpb24uXG4gICAqXG4gICAqIEluIHRoZSBjYXNlIG9mIGFuIHVwZGF0ZSBoYW5kbGVyIHRoaXMgbWVhbnMgdGhhdCB0aGUgY2xpZW50IHdpbGwgcmVjZWl2ZSBhbiBlcnJvciByYXRoZXIgdGhhblxuICAgKiB0aGUgdXBkYXRlIHJlc3VsdC5cbiAgICovXG4gIEFCQU5ET04gPSAyLFxufVxuIiwiZXhwb3J0IHR5cGUgTG9nTGV2ZWwgPSAnVFJBQ0UnIHwgJ0RFQlVHJyB8ICdJTkZPJyB8ICdXQVJOJyB8ICdFUlJPUic7XG5cbmV4cG9ydCB0eXBlIExvZ01ldGFkYXRhID0gUmVjb3JkPHN0cmluZyB8IHN5bWJvbCwgYW55PjtcblxuLyoqXG4gKiBJbXBsZW1lbnQgdGhpcyBpbnRlcmZhY2UgaW4gb3JkZXIgdG8gY3VzdG9taXplIHdvcmtlciBsb2dnaW5nXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTG9nZ2VyIHtcbiAgbG9nKGxldmVsOiBMb2dMZXZlbCwgbWVzc2FnZTogc3RyaW5nLCBtZXRhPzogTG9nTWV0YWRhdGEpOiBhbnk7XG4gIHRyYWNlKG1lc3NhZ2U6IHN0cmluZywgbWV0YT86IExvZ01ldGFkYXRhKTogYW55O1xuICBkZWJ1ZyhtZXNzYWdlOiBzdHJpbmcsIG1ldGE/OiBMb2dNZXRhZGF0YSk6IGFueTtcbiAgaW5mbyhtZXNzYWdlOiBzdHJpbmcsIG1ldGE/OiBMb2dNZXRhZGF0YSk6IGFueTtcbiAgd2FybihtZXNzYWdlOiBzdHJpbmcsIG1ldGE/OiBMb2dNZXRhZGF0YSk6IGFueTtcbiAgZXJyb3IobWVzc2FnZTogc3RyaW5nLCBtZXRhPzogTG9nTWV0YWRhdGEpOiBhbnk7XG59XG5cbi8qKlxuICogUG9zc2libGUgdmFsdWVzIG9mIHRoZSBgc2RrQ29tcG9uZW50YCBtZXRhIGF0dHJpYnV0ZXMgb24gbG9nIG1lc3NhZ2VzLiBUaGlzXG4gKiBhdHRyaWJ1dGUgaW5kaWNhdGVzIHdoaWNoIHN1YnN5c3RlbSBlbWl0dGVkIHRoZSBsb2cgbWVzc2FnZTsgdGhpcyBtYXkgZm9yXG4gKiBleGFtcGxlIGJlIHVzZWQgdG8gaW1wbGVtZW50IGZpbmUtZ3JhaW5lZCBmaWx0ZXJpbmcgb2YgbG9nIG1lc3NhZ2VzLlxuICpcbiAqIE5vdGUgdGhhdCB0aGVyZSBpcyBubyBndWFyYW50ZWUgdGhhdCB0aGlzIGxpc3Qgd2lsbCByZW1haW4gc3RhYmxlIGluIHRoZVxuICogZnV0dXJlOyB2YWx1ZXMgbWF5IGJlIGFkZGVkIG9yIHJlbW92ZWQsIGFuZCBtZXNzYWdlcyB0aGF0IGFyZSBjdXJyZW50bHlcbiAqIGVtaXR0ZWQgd2l0aCBzb21lIGBzZGtDb21wb25lbnRgIHZhbHVlIG1heSB1c2UgYSBkaWZmZXJlbnQgdmFsdWUgaW4gdGhlIGZ1dHVyZS5cbiAqL1xuZXhwb3J0IGVudW0gU2RrQ29tcG9uZW50IHtcbiAgLyoqXG4gICAqIENvbXBvbmVudCBuYW1lIGZvciBtZXNzYWdlcyBlbWl0ZWQgZnJvbSBXb3JrZmxvdyBjb2RlLCB1c2luZyB0aGUge0BsaW5rIFdvcmtmbG93IGNvbnRleHQgbG9nZ2VyfHdvcmtmbG93LmxvZ30uXG4gICAqIFRoZSBTREsgaXRzZWxmIG5ldmVyIHB1Ymxpc2hlcyBtZXNzYWdlcyB3aXRoIHRoaXMgY29tcG9uZW50IG5hbWUuXG4gICAqL1xuICB3b3JrZmxvdyA9ICd3b3JrZmxvdycsXG5cbiAgLyoqXG4gICAqIENvbXBvbmVudCBuYW1lIGZvciBtZXNzYWdlcyBlbWl0ZWQgZnJvbSBhbiBhY3Rpdml0eSwgdXNpbmcgdGhlIHtAbGluayBhY3Rpdml0eSBjb250ZXh0IGxvZ2dlcnxDb250ZXh0LmxvZ30uXG4gICAqIFRoZSBTREsgaXRzZWxmIG5ldmVyIHB1Ymxpc2hlcyBtZXNzYWdlcyB3aXRoIHRoaXMgY29tcG9uZW50IG5hbWUuXG4gICAqL1xuICBhY3Rpdml0eSA9ICdhY3Rpdml0eScsXG5cbiAgLyoqXG4gICAqIENvbXBvbmVudCBuYW1lIGZvciBtZXNzYWdlcyBlbWl0ZWQgZnJvbSBhIFRlbXBvcmFsIFdvcmtlciBpbnN0YW5jZS5cbiAgICpcbiAgICogVGhpcyBub3RhYmx5IGluY2x1ZGVzOlxuICAgKiAtIElzc3VlcyB3aXRoIFdvcmtlciBvciBydW50aW1lIGNvbmZpZ3VyYXRpb24sIG9yIHRoZSBKUyBleGVjdXRpb24gZW52aXJvbm1lbnQ7XG4gICAqIC0gV29ya2VyJ3MsIEFjdGl2aXR5J3MsIGFuZCBXb3JrZmxvdydzIGxpZmVjeWNsZSBldmVudHM7XG4gICAqIC0gV29ya2Zsb3cgQWN0aXZhdGlvbiBhbmQgQWN0aXZpdHkgVGFzayBwcm9jZXNzaW5nIGV2ZW50cztcbiAgICogLSBXb3JrZmxvdyBidW5kbGluZyBtZXNzYWdlcztcbiAgICogLSBTaW5rIHByb2Nlc3NpbmcgaXNzdWVzLlxuICAgKi9cbiAgd29ya2VyID0gJ3dvcmtlcicsXG5cbiAgLyoqXG4gICAqIENvbXBvbmVudCBuYW1lIGZvciBhbGwgbWVzc2FnZXMgZW1pdHRlZCBieSB0aGUgUnVzdCBDb3JlIFNESyBsaWJyYXJ5LlxuICAgKi9cbiAgY29yZSA9ICdjb3JlJyxcbn1cbiIsImltcG9ydCB0eXBlIHsgdGVtcG9yYWwgfSBmcm9tICdAdGVtcG9yYWxpby9wcm90byc7XG5pbXBvcnQgeyBWYWx1ZUVycm9yIH0gZnJvbSAnLi9lcnJvcnMnO1xuaW1wb3J0IHsgRHVyYXRpb24sIG1zT3B0aW9uYWxUb051bWJlciwgbXNPcHRpb25hbFRvVHMsIG1zVG9OdW1iZXIsIG1zVG9Ucywgb3B0aW9uYWxUc1RvTXMgfSBmcm9tICcuL3RpbWUnO1xuXG4vKipcbiAqIE9wdGlvbnMgZm9yIHJldHJ5aW5nIFdvcmtmbG93cyBhbmQgQWN0aXZpdGllc1xuICovXG5leHBvcnQgaW50ZXJmYWNlIFJldHJ5UG9saWN5IHtcbiAgLyoqXG4gICAqIENvZWZmaWNpZW50IHVzZWQgdG8gY2FsY3VsYXRlIHRoZSBuZXh0IHJldHJ5IGludGVydmFsLlxuICAgKiBUaGUgbmV4dCByZXRyeSBpbnRlcnZhbCBpcyBwcmV2aW91cyBpbnRlcnZhbCBtdWx0aXBsaWVkIGJ5IHRoaXMgY29lZmZpY2llbnQuXG4gICAqIEBtaW5pbXVtIDFcbiAgICogQGRlZmF1bHQgMlxuICAgKi9cbiAgYmFja29mZkNvZWZmaWNpZW50PzogbnVtYmVyO1xuICAvKipcbiAgICogSW50ZXJ2YWwgb2YgdGhlIGZpcnN0IHJldHJ5LlxuICAgKiBJZiBjb2VmZmljaWVudCBpcyAxIHRoZW4gaXQgaXMgdXNlZCBmb3IgYWxsIHJldHJpZXNcbiAgICogQGZvcm1hdCBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIG9yIHtAbGluayBodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9tcyB8IG1zLWZvcm1hdHRlZCBzdHJpbmd9XG4gICAqIEBkZWZhdWx0IDEgc2Vjb25kXG4gICAqL1xuICBpbml0aWFsSW50ZXJ2YWw/OiBEdXJhdGlvbjtcbiAgLyoqXG4gICAqIE1heGltdW0gbnVtYmVyIG9mIGF0dGVtcHRzLiBXaGVuIGV4Y2VlZGVkLCByZXRyaWVzIHN0b3AgKGV2ZW4gaWYge0BsaW5rIEFjdGl2aXR5T3B0aW9ucy5zY2hlZHVsZVRvQ2xvc2VUaW1lb3V0fVxuICAgKiBoYXNuJ3QgYmVlbiByZWFjaGVkKS5cbiAgICpcbiAgICogQGRlZmF1bHQgSW5maW5pdHlcbiAgICovXG4gIG1heGltdW1BdHRlbXB0cz86IG51bWJlcjtcbiAgLyoqXG4gICAqIE1heGltdW0gaW50ZXJ2YWwgYmV0d2VlbiByZXRyaWVzLlxuICAgKiBFeHBvbmVudGlhbCBiYWNrb2ZmIGxlYWRzIHRvIGludGVydmFsIGluY3JlYXNlLlxuICAgKiBUaGlzIHZhbHVlIGlzIHRoZSBjYXAgb2YgdGhlIGluY3JlYXNlLlxuICAgKlxuICAgKiBAZGVmYXVsdCAxMDB4IG9mIHtAbGluayBpbml0aWFsSW50ZXJ2YWx9XG4gICAqIEBmb3JtYXQgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBvciB7QGxpbmsgaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvbXMgfCBtcy1mb3JtYXR0ZWQgc3RyaW5nfVxuICAgKi9cbiAgbWF4aW11bUludGVydmFsPzogRHVyYXRpb247XG5cbiAgLyoqXG4gICAqIExpc3Qgb2YgYXBwbGljYXRpb24gZmFpbHVyZXMgdHlwZXMgdG8gbm90IHJldHJ5LlxuICAgKi9cbiAgbm9uUmV0cnlhYmxlRXJyb3JUeXBlcz86IHN0cmluZ1tdO1xufVxuXG4vKipcbiAqIFR1cm4gYSBUUyBSZXRyeVBvbGljeSBpbnRvIGEgcHJvdG8gY29tcGF0aWJsZSBSZXRyeVBvbGljeVxuICovXG5leHBvcnQgZnVuY3Rpb24gY29tcGlsZVJldHJ5UG9saWN5KHJldHJ5UG9saWN5OiBSZXRyeVBvbGljeSk6IHRlbXBvcmFsLmFwaS5jb21tb24udjEuSVJldHJ5UG9saWN5IHtcbiAgaWYgKHJldHJ5UG9saWN5LmJhY2tvZmZDb2VmZmljaWVudCAhPSBudWxsICYmIHJldHJ5UG9saWN5LmJhY2tvZmZDb2VmZmljaWVudCA8PSAwKSB7XG4gICAgdGhyb3cgbmV3IFZhbHVlRXJyb3IoJ1JldHJ5UG9saWN5LmJhY2tvZmZDb2VmZmljaWVudCBtdXN0IGJlIGdyZWF0ZXIgdGhhbiAwJyk7XG4gIH1cbiAgaWYgKHJldHJ5UG9saWN5Lm1heGltdW1BdHRlbXB0cyAhPSBudWxsKSB7XG4gICAgaWYgKHJldHJ5UG9saWN5Lm1heGltdW1BdHRlbXB0cyA9PT0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZKSB7XG4gICAgICAvLyBkcm9wIGZpZWxkIChJbmZpbml0eSBpcyB0aGUgZGVmYXVsdClcbiAgICAgIGNvbnN0IHsgbWF4aW11bUF0dGVtcHRzOiBfLCAuLi53aXRob3V0IH0gPSByZXRyeVBvbGljeTtcbiAgICAgIHJldHJ5UG9saWN5ID0gd2l0aG91dDtcbiAgICB9IGVsc2UgaWYgKHJldHJ5UG9saWN5Lm1heGltdW1BdHRlbXB0cyA8PSAwKSB7XG4gICAgICB0aHJvdyBuZXcgVmFsdWVFcnJvcignUmV0cnlQb2xpY3kubWF4aW11bUF0dGVtcHRzIG11c3QgYmUgYSBwb3NpdGl2ZSBpbnRlZ2VyJyk7XG4gICAgfSBlbHNlIGlmICghTnVtYmVyLmlzSW50ZWdlcihyZXRyeVBvbGljeS5tYXhpbXVtQXR0ZW1wdHMpKSB7XG4gICAgICB0aHJvdyBuZXcgVmFsdWVFcnJvcignUmV0cnlQb2xpY3kubWF4aW11bUF0dGVtcHRzIG11c3QgYmUgYW4gaW50ZWdlcicpO1xuICAgIH1cbiAgfVxuICBjb25zdCBtYXhpbXVtSW50ZXJ2YWwgPSBtc09wdGlvbmFsVG9OdW1iZXIocmV0cnlQb2xpY3kubWF4aW11bUludGVydmFsKTtcbiAgY29uc3QgaW5pdGlhbEludGVydmFsID0gbXNUb051bWJlcihyZXRyeVBvbGljeS5pbml0aWFsSW50ZXJ2YWwgPz8gMTAwMCk7XG4gIGlmIChtYXhpbXVtSW50ZXJ2YWwgPT09IDApIHtcbiAgICB0aHJvdyBuZXcgVmFsdWVFcnJvcignUmV0cnlQb2xpY3kubWF4aW11bUludGVydmFsIGNhbm5vdCBiZSAwJyk7XG4gIH1cbiAgaWYgKGluaXRpYWxJbnRlcnZhbCA9PT0gMCkge1xuICAgIHRocm93IG5ldyBWYWx1ZUVycm9yKCdSZXRyeVBvbGljeS5pbml0aWFsSW50ZXJ2YWwgY2Fubm90IGJlIDAnKTtcbiAgfVxuICBpZiAobWF4aW11bUludGVydmFsICE9IG51bGwgJiYgbWF4aW11bUludGVydmFsIDwgaW5pdGlhbEludGVydmFsKSB7XG4gICAgdGhyb3cgbmV3IFZhbHVlRXJyb3IoJ1JldHJ5UG9saWN5Lm1heGltdW1JbnRlcnZhbCBjYW5ub3QgYmUgbGVzcyB0aGFuIGl0cyBpbml0aWFsSW50ZXJ2YWwnKTtcbiAgfVxuICByZXR1cm4ge1xuICAgIG1heGltdW1BdHRlbXB0czogcmV0cnlQb2xpY3kubWF4aW11bUF0dGVtcHRzLFxuICAgIGluaXRpYWxJbnRlcnZhbDogbXNUb1RzKGluaXRpYWxJbnRlcnZhbCksXG4gICAgbWF4aW11bUludGVydmFsOiBtc09wdGlvbmFsVG9UcyhtYXhpbXVtSW50ZXJ2YWwpLFxuICAgIGJhY2tvZmZDb2VmZmljaWVudDogcmV0cnlQb2xpY3kuYmFja29mZkNvZWZmaWNpZW50LFxuICAgIG5vblJldHJ5YWJsZUVycm9yVHlwZXM6IHJldHJ5UG9saWN5Lm5vblJldHJ5YWJsZUVycm9yVHlwZXMsXG4gIH07XG59XG5cbi8qKlxuICogVHVybiBhIHByb3RvIGNvbXBhdGlibGUgUmV0cnlQb2xpY3kgaW50byBhIFRTIFJldHJ5UG9saWN5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZWNvbXBpbGVSZXRyeVBvbGljeShcbiAgcmV0cnlQb2xpY3k/OiB0ZW1wb3JhbC5hcGkuY29tbW9uLnYxLklSZXRyeVBvbGljeSB8IG51bGxcbik6IFJldHJ5UG9saWN5IHwgdW5kZWZpbmVkIHtcbiAgaWYgKCFyZXRyeVBvbGljeSkge1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGJhY2tvZmZDb2VmZmljaWVudDogcmV0cnlQb2xpY3kuYmFja29mZkNvZWZmaWNpZW50ID8/IHVuZGVmaW5lZCxcbiAgICBtYXhpbXVtQXR0ZW1wdHM6IHJldHJ5UG9saWN5Lm1heGltdW1BdHRlbXB0cyA/PyB1bmRlZmluZWQsXG4gICAgbWF4aW11bUludGVydmFsOiBvcHRpb25hbFRzVG9NcyhyZXRyeVBvbGljeS5tYXhpbXVtSW50ZXJ2YWwpLFxuICAgIGluaXRpYWxJbnRlcnZhbDogb3B0aW9uYWxUc1RvTXMocmV0cnlQb2xpY3kuaW5pdGlhbEludGVydmFsKSxcbiAgICBub25SZXRyeWFibGVFcnJvclR5cGVzOiByZXRyeVBvbGljeS5ub25SZXRyeWFibGVFcnJvclR5cGVzID8/IHVuZGVmaW5lZCxcbiAgfTtcbn1cbiIsImltcG9ydCBMb25nIGZyb20gJ2xvbmcnOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGltcG9ydC9uby1uYW1lZC1hcy1kZWZhdWx0XG5pbXBvcnQgbXMsIHsgU3RyaW5nVmFsdWUgfSBmcm9tICdtcyc7XG5pbXBvcnQgdHlwZSB7IGdvb2dsZSB9IGZyb20gJ0B0ZW1wb3JhbGlvL3Byb3RvJztcbmltcG9ydCB7IFZhbHVlRXJyb3IgfSBmcm9tICcuL2Vycm9ycyc7XG5cbi8vIE5PVEU6IHRoZXNlIGFyZSB0aGUgc2FtZSBpbnRlcmZhY2UgaW4gSlNcbi8vIGdvb2dsZS5wcm90b2J1Zi5JRHVyYXRpb247XG4vLyBnb29nbGUucHJvdG9idWYuSVRpbWVzdGFtcDtcbi8vIFRoZSBjb252ZXJzaW9uIGZ1bmN0aW9ucyBiZWxvdyBzaG91bGQgd29yayBmb3IgYm90aFxuXG5leHBvcnQgdHlwZSBUaW1lc3RhbXAgPSBnb29nbGUucHJvdG9idWYuSVRpbWVzdGFtcDtcblxuLyoqXG4gKiBBIGR1cmF0aW9uLCBleHByZXNzZWQgZWl0aGVyIGFzIGEgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcywgb3IgYXMgYSB7QGxpbmsgaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvbXMgfCBtcy1mb3JtYXR0ZWQgc3RyaW5nfS5cbiAqL1xuZXhwb3J0IHR5cGUgRHVyYXRpb24gPSBTdHJpbmdWYWx1ZSB8IG51bWJlcjtcblxuZXhwb3J0IHR5cGUgeyBTdHJpbmdWYWx1ZSB9IGZyb20gJ21zJztcblxuLyoqXG4gKiBMb3NzeSBjb252ZXJzaW9uIGZ1bmN0aW9uIGZyb20gVGltZXN0YW1wIHRvIG51bWJlciBkdWUgdG8gcG9zc2libGUgb3ZlcmZsb3cuXG4gKiBJZiB0cyBpcyBudWxsIG9yIHVuZGVmaW5lZCByZXR1cm5zIHVuZGVmaW5lZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG9wdGlvbmFsVHNUb01zKHRzOiBUaW1lc3RhbXAgfCBudWxsIHwgdW5kZWZpbmVkKTogbnVtYmVyIHwgdW5kZWZpbmVkIHtcbiAgaWYgKHRzID09PSB1bmRlZmluZWQgfHwgdHMgPT09IG51bGwpIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG4gIHJldHVybiB0c1RvTXModHMpO1xufVxuXG4vKipcbiAqIExvc3N5IGNvbnZlcnNpb24gZnVuY3Rpb24gZnJvbSBUaW1lc3RhbXAgdG8gbnVtYmVyIGR1ZSB0byBwb3NzaWJsZSBvdmVyZmxvdy5cbiAqIElmIHRzIGlzIG51bGwgb3IgdW5kZWZpbmVkLCB0aHJvd3MgYSBUeXBlRXJyb3IsIHdpdGggZXJyb3IgbWVzc2FnZSBpbmNsdWRpbmcgdGhlIG5hbWUgb2YgdGhlIGZpZWxkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVxdWlyZWRUc1RvTXModHM6IFRpbWVzdGFtcCB8IG51bGwgfCB1bmRlZmluZWQsIGZpZWxkTmFtZTogc3RyaW5nKTogbnVtYmVyIHtcbiAgaWYgKHRzID09PSB1bmRlZmluZWQgfHwgdHMgPT09IG51bGwpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBFeHBlY3RlZCAke2ZpZWxkTmFtZX0gdG8gYmUgYSB0aW1lc3RhbXAsIGdvdCAke3RzfWApO1xuICB9XG4gIHJldHVybiB0c1RvTXModHMpO1xufVxuXG4vKipcbiAqIExvc3N5IGNvbnZlcnNpb24gZnVuY3Rpb24gZnJvbSBUaW1lc3RhbXAgdG8gbnVtYmVyIGR1ZSB0byBwb3NzaWJsZSBvdmVyZmxvd1xuICovXG5leHBvcnQgZnVuY3Rpb24gdHNUb01zKHRzOiBUaW1lc3RhbXAgfCBudWxsIHwgdW5kZWZpbmVkKTogbnVtYmVyIHtcbiAgaWYgKHRzID09PSB1bmRlZmluZWQgfHwgdHMgPT09IG51bGwpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEV4cGVjdGVkIHRpbWVzdGFtcCwgZ290ICR7dHN9YCk7XG4gIH1cbiAgY29uc3QgeyBzZWNvbmRzLCBuYW5vcyB9ID0gdHM7XG4gIHJldHVybiAoc2Vjb25kcyB8fCBMb25nLlVaRVJPKVxuICAgIC5tdWwoMTAwMClcbiAgICAuYWRkKE1hdGguZmxvb3IoKG5hbm9zIHx8IDApIC8gMTAwMDAwMCkpXG4gICAgLnRvTnVtYmVyKCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtc051bWJlclRvVHMobWlsbGlzOiBudW1iZXIpOiBUaW1lc3RhbXAge1xuICBjb25zdCBzZWNvbmRzID0gTWF0aC5mbG9vcihtaWxsaXMgLyAxMDAwKTtcbiAgY29uc3QgbmFub3MgPSAobWlsbGlzICUgMTAwMCkgKiAxMDAwMDAwO1xuICBpZiAoTnVtYmVyLmlzTmFOKHNlY29uZHMpIHx8IE51bWJlci5pc05hTihuYW5vcykpIHtcbiAgICB0aHJvdyBuZXcgVmFsdWVFcnJvcihgSW52YWxpZCBtaWxsaXMgJHttaWxsaXN9YCk7XG4gIH1cbiAgcmV0dXJuIHsgc2Vjb25kczogTG9uZy5mcm9tTnVtYmVyKHNlY29uZHMpLCBuYW5vcyB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbXNUb1RzKHN0cjogRHVyYXRpb24pOiBUaW1lc3RhbXAge1xuICByZXR1cm4gbXNOdW1iZXJUb1RzKG1zVG9OdW1iZXIoc3RyKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtc09wdGlvbmFsVG9UcyhzdHI6IER1cmF0aW9uIHwgdW5kZWZpbmVkIHwgbnVsbCk6IFRpbWVzdGFtcCB8IHVuZGVmaW5lZCB7XG4gIHJldHVybiBzdHIgPyBtc1RvVHMoc3RyKSA6IHVuZGVmaW5lZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1zT3B0aW9uYWxUb051bWJlcih2YWw6IER1cmF0aW9uIHwgdW5kZWZpbmVkKTogbnVtYmVyIHwgdW5kZWZpbmVkIHtcbiAgaWYgKHZhbCA9PT0gdW5kZWZpbmVkKSByZXR1cm4gdW5kZWZpbmVkO1xuICByZXR1cm4gbXNUb051bWJlcih2YWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbXNUb051bWJlcih2YWw6IER1cmF0aW9uKTogbnVtYmVyIHtcbiAgaWYgKHR5cGVvZiB2YWwgPT09ICdudW1iZXInKSB7XG4gICAgcmV0dXJuIHZhbDtcbiAgfVxuICByZXR1cm4gbXNXaXRoVmFsaWRhdGlvbih2YWwpO1xufVxuXG5mdW5jdGlvbiBtc1dpdGhWYWxpZGF0aW9uKHN0cjogU3RyaW5nVmFsdWUpOiBudW1iZXIge1xuICBjb25zdCBtaWxsaXMgPSBtcyhzdHIpO1xuICBpZiAobWlsbGlzID09IG51bGwgfHwgaXNOYU4obWlsbGlzKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYEludmFsaWQgZHVyYXRpb24gc3RyaW5nOiAnJHtzdHJ9J2ApO1xuICB9XG4gIHJldHVybiBtaWxsaXM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0c1RvRGF0ZSh0czogVGltZXN0YW1wKTogRGF0ZSB7XG4gIHJldHVybiBuZXcgRGF0ZSh0c1RvTXModHMpKTtcbn1cblxuLy8gdHMtcHJ1bmUtaWdub3JlLW5leHRcbmV4cG9ydCBmdW5jdGlvbiByZXF1aXJlZFRzVG9EYXRlKHRzOiBUaW1lc3RhbXAgfCBudWxsIHwgdW5kZWZpbmVkLCBmaWVsZE5hbWU6IHN0cmluZyk6IERhdGUge1xuICByZXR1cm4gbmV3IERhdGUocmVxdWlyZWRUc1RvTXModHMsIGZpZWxkTmFtZSkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gb3B0aW9uYWxUc1RvRGF0ZSh0czogVGltZXN0YW1wIHwgbnVsbCB8IHVuZGVmaW5lZCk6IERhdGUgfCB1bmRlZmluZWQge1xuICBpZiAodHMgPT09IHVuZGVmaW5lZCB8fCB0cyA9PT0gbnVsbCkge1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cbiAgcmV0dXJuIG5ldyBEYXRlKHRzVG9Ncyh0cykpO1xufVxuXG4vLyB0cy1wcnVuZS1pZ25vcmUtbmV4dCAoaW1wb3J0ZWQgdmlhIHNjaGVkdWxlLWhlbHBlcnMudHMpXG5leHBvcnQgZnVuY3Rpb24gb3B0aW9uYWxEYXRlVG9UcyhkYXRlOiBEYXRlIHwgbnVsbCB8IHVuZGVmaW5lZCk6IFRpbWVzdGFtcCB8IHVuZGVmaW5lZCB7XG4gIGlmIChkYXRlID09PSB1bmRlZmluZWQgfHwgZGF0ZSA9PT0gbnVsbCkge1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cbiAgcmV0dXJuIG1zVG9UcyhkYXRlLmdldFRpbWUoKSk7XG59XG4iLCIvKiogU2hvcnRoYW5kIGFsaWFzICovXG5leHBvcnQgdHlwZSBBbnlGdW5jID0gKC4uLmFyZ3M6IGFueVtdKSA9PiBhbnk7XG4vKiogQSB0dXBsZSB3aXRob3V0IGl0cyBsYXN0IGVsZW1lbnQgKi9cbmV4cG9ydCB0eXBlIE9taXRMYXN0PFQ+ID0gVCBleHRlbmRzIFsuLi5pbmZlciBSRVNULCBhbnldID8gUkVTVCA6IG5ldmVyO1xuLyoqIEYgd2l0aCBhbGwgYXJndW1lbnRzIGJ1dCB0aGUgbGFzdCAqL1xuZXhwb3J0IHR5cGUgT21pdExhc3RQYXJhbTxGIGV4dGVuZHMgQW55RnVuYz4gPSAoLi4uYXJnczogT21pdExhc3Q8UGFyYW1ldGVyczxGPj4pID0+IFJldHVyblR5cGU8Rj47XG4vKiogUmVxdWlyZSB0aGF0IFQgaGFzIGF0IGxlYXN0IG9uZSBvZiB0aGUgcHJvdmlkZWQgcHJvcGVydGllcyBkZWZpbmVkICovXG5leHBvcnQgdHlwZSBSZXF1aXJlQXRMZWFzdE9uZTxULCBLZXlzIGV4dGVuZHMga2V5b2YgVCA9IGtleW9mIFQ+ID0gUGljazxULCBFeGNsdWRlPGtleW9mIFQsIEtleXM+PiAmXG4gIHtcbiAgICBbSyBpbiBLZXlzXS0/OiBSZXF1aXJlZDxQaWNrPFQsIEs+PiAmIFBhcnRpYWw8UGljazxULCBFeGNsdWRlPEtleXMsIEs+Pj47XG4gIH1bS2V5c107XG5cbi8qKiBWZXJpZnkgdGhhdCBhbiB0eXBlIF9Db3B5IGV4dGVuZHMgX09yaWcgKi9cbmV4cG9ydCBmdW5jdGlvbiBjaGVja0V4dGVuZHM8X09yaWcsIF9Db3B5IGV4dGVuZHMgX09yaWc+KCk6IHZvaWQge1xuICAvLyBub29wLCBqdXN0IHR5cGUgY2hlY2tcbn1cblxuZXhwb3J0IHR5cGUgUmVwbGFjZTxCYXNlLCBOZXc+ID0gT21pdDxCYXNlLCBrZXlvZiBOZXc+ICYgTmV3O1xuXG5leHBvcnQgZnVuY3Rpb24gaXNSZWNvcmQodmFsdWU6IHVua25vd24pOiB2YWx1ZSBpcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICE9PSBudWxsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaGFzT3duUHJvcGVydHk8WCBleHRlbmRzIFJlY29yZDxzdHJpbmcsIHVua25vd24+LCBZIGV4dGVuZHMgUHJvcGVydHlLZXk+KFxuICByZWNvcmQ6IFgsXG4gIHByb3A6IFlcbik6IHJlY29yZCBpcyBYICYgUmVjb3JkPFksIHVua25vd24+IHtcbiAgcmV0dXJuIHByb3AgaW4gcmVjb3JkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaGFzT3duUHJvcGVydGllczxYIGV4dGVuZHMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4sIFkgZXh0ZW5kcyBQcm9wZXJ0eUtleT4oXG4gIHJlY29yZDogWCxcbiAgcHJvcHM6IFlbXVxuKTogcmVjb3JkIGlzIFggJiBSZWNvcmQ8WSwgdW5rbm93bj4ge1xuICByZXR1cm4gcHJvcHMuZXZlcnkoKHByb3ApID0+IHByb3AgaW4gcmVjb3JkKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRXJyb3IoZXJyb3I6IHVua25vd24pOiBlcnJvciBpcyBFcnJvciB7XG4gIHJldHVybiAoXG4gICAgaXNSZWNvcmQoZXJyb3IpICYmXG4gICAgdHlwZW9mIGVycm9yLm5hbWUgPT09ICdzdHJpbmcnICYmXG4gICAgdHlwZW9mIGVycm9yLm1lc3NhZ2UgPT09ICdzdHJpbmcnICYmXG4gICAgKGVycm9yLnN0YWNrID09IG51bGwgfHwgdHlwZW9mIGVycm9yLnN0YWNrID09PSAnc3RyaW5nJylcbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzQWJvcnRFcnJvcihlcnJvcjogdW5rbm93bik6IGVycm9yIGlzIEVycm9yICYgeyBuYW1lOiAnQWJvcnRFcnJvcicgfSB7XG4gIHJldHVybiBpc0Vycm9yKGVycm9yKSAmJiBlcnJvci5uYW1lID09PSAnQWJvcnRFcnJvcic7XG59XG5cbi8qKlxuICogR2V0IGBlcnJvci5tZXNzYWdlYCAob3IgYHVuZGVmaW5lZGAgaWYgbm90IHByZXNlbnQpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlcnJvck1lc3NhZ2UoZXJyb3I6IHVua25vd24pOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuICBpZiAoaXNFcnJvcihlcnJvcikpIHtcbiAgICByZXR1cm4gZXJyb3IubWVzc2FnZTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgZXJyb3IgPT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIGVycm9yO1xuICB9XG4gIHJldHVybiB1bmRlZmluZWQ7XG59XG5cbmludGVyZmFjZSBFcnJvcldpdGhDb2RlIHtcbiAgY29kZTogc3RyaW5nO1xufVxuXG5mdW5jdGlvbiBpc0Vycm9yV2l0aENvZGUoZXJyb3I6IHVua25vd24pOiBlcnJvciBpcyBFcnJvcldpdGhDb2RlIHtcbiAgcmV0dXJuIGlzUmVjb3JkKGVycm9yKSAmJiB0eXBlb2YgZXJyb3IuY29kZSA9PT0gJ3N0cmluZyc7XG59XG5cbi8qKlxuICogR2V0IGBlcnJvci5jb2RlYCAob3IgYHVuZGVmaW5lZGAgaWYgbm90IHByZXNlbnQpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlcnJvckNvZGUoZXJyb3I6IHVua25vd24pOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuICBpZiAoaXNFcnJvcldpdGhDb2RlKGVycm9yKSkge1xuICAgIHJldHVybiBlcnJvci5jb2RlO1xuICB9XG5cbiAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuLyoqXG4gKiBBc3NlcnRzIHRoYXQgc29tZSB0eXBlIGlzIHRoZSBuZXZlciB0eXBlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhc3NlcnROZXZlcihtc2c6IHN0cmluZywgeDogbmV2ZXIpOiBuZXZlciB7XG4gIHRocm93IG5ldyBUeXBlRXJyb3IobXNnICsgJzogJyArIHgpO1xufVxuXG5leHBvcnQgdHlwZSBDbGFzczxFIGV4dGVuZHMgRXJyb3I+ID0ge1xuICBuZXcgKC4uLmFyZ3M6IGFueVtdKTogRTtcbiAgcHJvdG90eXBlOiBFO1xufTtcblxuLyoqXG4gKiBBIGRlY29yYXRvciB0byBiZSB1c2VkIG9uIGVycm9yIGNsYXNzZXMuIEl0IGFkZHMgdGhlICduYW1lJyBwcm9wZXJ0eSBBTkQgcHJvdmlkZXMgYSBjdXN0b21cbiAqICdpbnN0YW5jZW9mJyBoYW5kbGVyIHRoYXQgd29ya3MgY29ycmVjdGx5IGFjcm9zcyBleGVjdXRpb24gY29udGV4dHMuXG4gKlxuICogIyMjIERldGFpbHMgIyMjXG4gKlxuICogQWNjb3JkaW5nIHRvIHRoZSBFY21hU2NyaXB0J3Mgc3BlYywgdGhlIGRlZmF1bHQgYmVoYXZpb3Igb2YgSmF2YVNjcmlwdCdzIGB4IGluc3RhbmNlb2YgWWAgb3BlcmF0b3IgaXMgdG8gd2FsayB1cCB0aGVcbiAqIHByb3RvdHlwZSBjaGFpbiBvZiBvYmplY3QgJ3gnLCBjaGVja2luZyBpZiBhbnkgY29uc3RydWN0b3IgaW4gdGhhdCBoaWVyYXJjaHkgaXMgX2V4YWN0bHkgdGhlIHNhbWUgb2JqZWN0XyBhcyB0aGVcbiAqIGNvbnN0cnVjdG9yIGZ1bmN0aW9uICdZJy5cbiAqXG4gKiBVbmZvcnR1bmF0ZWx5LCBpdCBoYXBwZW5zIGluIHZhcmlvdXMgc2l0dWF0aW9ucyB0aGF0IGRpZmZlcmVudCBjb25zdHJ1Y3RvciBmdW5jdGlvbiBvYmplY3RzIGdldCBjcmVhdGVkIGZvciB3aGF0XG4gKiBhcHBlYXJzIHRvIGJlIHRoZSB2ZXJ5IHNhbWUgY2xhc3MuIFRoaXMgbGVhZHMgdG8gc3VycHJpc2luZyBiZWhhdmlvciB3aGVyZSBgaW5zdGFuY2VvZmAgcmV0dXJucyBmYWxzZSB0aG91Z2ggaXQgaXNcbiAqIGtub3duIHRoYXQgdGhlIG9iamVjdCBpcyBpbmRlZWQgYW4gaW5zdGFuY2Ugb2YgdGhhdCBjbGFzcy4gT25lIHBhcnRpY3VsYXIgY2FzZSB3aGVyZSB0aGlzIGhhcHBlbnMgaXMgd2hlbiBjb25zdHJ1Y3RvclxuICogJ1knIGJlbG9uZ3MgdG8gYSBkaWZmZXJlbnQgcmVhbG0gdGhhbiB0aGUgY29uc3R1Y3RvciB3aXRoIHdoaWNoICd4JyB3YXMgaW5zdGFudGlhdGVkLiBBbm90aGVyIGNhc2UgaXMgd2hlbiB0d28gY29waWVzXG4gKiBvZiB0aGUgc2FtZSBsaWJyYXJ5IGdldHMgbG9hZGVkIGluIHRoZSBzYW1lIHJlYWxtLlxuICpcbiAqIEluIHByYWN0aWNlLCB0aGlzIHRlbmRzIHRvIGNhdXNlIGlzc3VlcyB3aGVuIGNyb3NzaW5nIHRoZSB3b3JrZmxvdy1zYW5kYm94aW5nIGJvdW5kYXJ5IChzaW5jZSBOb2RlJ3Mgdm0gbW9kdWxlXG4gKiByZWFsbHkgY3JlYXRlcyBuZXcgZXhlY3V0aW9uIHJlYWxtcyksIGFzIHdlbGwgYXMgd2hlbiBydW5uaW5nIHRlc3RzIHVzaW5nIEplc3QgKHNlZSBodHRwczovL2dpdGh1Yi5jb20vamVzdGpzL2plc3QvaXNzdWVzLzI1NDlcbiAqIGZvciBzb21lIGRldGFpbHMgb24gdGhhdCBvbmUpLlxuICpcbiAqIFRoaXMgZnVuY3Rpb24gaW5qZWN0cyBhIGN1c3RvbSAnaW5zdGFuY2VvZicgaGFuZGxlciBpbnRvIHRoZSBwcm90b3R5cGUgb2YgJ2NsYXp6Jywgd2hpY2ggaXMgYm90aCBjcm9zcy1yZWFsbSBzYWZlIGFuZFxuICogY3Jvc3MtY29waWVzLW9mLXRoZS1zYW1lLWxpYiBzYWZlLiBJdCB3b3JrcyBieSBhZGRpbmcgYSBzcGVjaWFsIHN5bWJvbCBwcm9wZXJ0eSB0byB0aGUgcHJvdG90eXBlIG9mICdjbGF6eicsIGFuZCB0aGVuXG4gKiBjaGVja2luZyBmb3IgdGhlIHByZXNlbmNlIG9mIHRoYXQgc3ltYm9sLlxuICovXG5leHBvcnQgZnVuY3Rpb24gU3ltYm9sQmFzZWRJbnN0YW5jZU9mRXJyb3I8RSBleHRlbmRzIEVycm9yPihtYXJrZXJOYW1lOiBzdHJpbmcpOiAoY2xheno6IENsYXNzPEU+KSA9PiB2b2lkIHtcbiAgcmV0dXJuIChjbGF6ejogQ2xhc3M8RT4pOiB2b2lkID0+IHtcbiAgICBjb25zdCBtYXJrZXIgPSBTeW1ib2wuZm9yKGBfX3RlbXBvcmFsX2lzJHttYXJrZXJOYW1lfWApO1xuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGNsYXp6LnByb3RvdHlwZSwgJ25hbWUnLCB7IHZhbHVlOiBtYXJrZXJOYW1lLCBlbnVtZXJhYmxlOiB0cnVlIH0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShjbGF6ei5wcm90b3R5cGUsIG1hcmtlciwgeyB2YWx1ZTogdHJ1ZSwgZW51bWVyYWJsZTogZmFsc2UgfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGNsYXp6LCBTeW1ib2wuaGFzSW5zdGFuY2UsIHtcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBvYmplY3Qtc2hvcnRoYW5kXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gKHRoaXM6IGFueSwgZXJyb3I6IG9iamVjdCk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAodGhpcyA9PT0gY2xhenopIHtcbiAgICAgICAgICByZXR1cm4gaXNSZWNvcmQoZXJyb3IpICYmIChlcnJvciBhcyBhbnkpW21hcmtlcl0gPT09IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gJ3RoaXMnIG11c3QgYmUgYSBfc3ViY2xhc3NfIG9mIGNsYXp6IHRoYXQgZG9lc24ndCByZWRlZmluZWQgW1N5bWJvbC5oYXNJbnN0YW5jZV0sIHNvIHRoYXQgaXQgaW5oZXJpdGVkXG4gICAgICAgICAgLy8gZnJvbSBjbGF6eidzIFtTeW1ib2wuaGFzSW5zdGFuY2VdLiBJZiB3ZSBkb24ndCBoYW5kbGUgdGhpcyBwYXJ0aWN1bGFyIHNpdHVhdGlvbiwgdGhlblxuICAgICAgICAgIC8vIGB4IGluc3RhbmNlb2YgU3ViY2xhc3NPZlBhcmVudGAgd291bGQgcmV0dXJuIHRydWUgZm9yIGFueSBpbnN0YW5jZSBvZiAnUGFyZW50Jywgd2hpY2ggaXMgY2xlYXJseSB3cm9uZy5cbiAgICAgICAgICAvL1xuICAgICAgICAgIC8vIElkZWFsbHksIGl0J2QgYmUgcHJlZmVyYWJsZSB0byBhdm9pZCB0aGlzIGNhc2UgZW50aXJlbHksIGJ5IG1ha2luZyBzdXJlIHRoYXQgYWxsIHN1YmNsYXNzZXMgb2YgJ2NsYXp6J1xuICAgICAgICAgIC8vIHJlZGVmaW5lIFtTeW1ib2wuaGFzSW5zdGFuY2VdLCBidXQgd2UgY2FuJ3QgZW5mb3JjZSB0aGF0LiBXZSB0aGVyZWZvcmUgZmFsbGJhY2sgdG8gdGhlIGRlZmF1bHQgaW5zdGFuY2VvZlxuICAgICAgICAgIC8vIGJlaGF2aW9yICh3aGljaCBpcyBOT1QgY3Jvc3MtcmVhbG0gc2FmZSkuXG4gICAgICAgICAgcmV0dXJuIHRoaXMucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoZXJyb3IpOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXByb3RvdHlwZS1idWlsdGluc1xuICAgICAgICB9XG4gICAgICB9LFxuICAgIH0pO1xuICB9O1xufVxuXG4vLyBUaGFua3MgTUROOiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9PYmplY3QvZnJlZXplXG5leHBvcnQgZnVuY3Rpb24gZGVlcEZyZWV6ZTxUPihvYmplY3Q6IFQpOiBUIHtcbiAgLy8gUmV0cmlldmUgdGhlIHByb3BlcnR5IG5hbWVzIGRlZmluZWQgb24gb2JqZWN0XG4gIGNvbnN0IHByb3BOYW1lcyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKG9iamVjdCk7XG5cbiAgLy8gRnJlZXplIHByb3BlcnRpZXMgYmVmb3JlIGZyZWV6aW5nIHNlbGZcbiAgZm9yIChjb25zdCBuYW1lIG9mIHByb3BOYW1lcykge1xuICAgIGNvbnN0IHZhbHVlID0gKG9iamVjdCBhcyBhbnkpW25hbWVdO1xuXG4gICAgaWYgKHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGRlZXBGcmVlemUodmFsdWUpO1xuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIC8vIFRoaXMgaXMgb2theSwgdGhlcmUgYXJlIHNvbWUgdHlwZWQgYXJyYXlzIHRoYXQgY2Fubm90IGJlIGZyb3plbiAoZW5jb2RpbmdLZXlzKVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBPYmplY3QuZnJlZXplKHZhbHVlKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gT2JqZWN0LmZyZWV6ZShvYmplY3QpO1xufVxuIiwiaW1wb3J0IHR5cGUgeyBjb3Jlc2RrIH0gZnJvbSAnQHRlbXBvcmFsaW8vcHJvdG8nO1xuaW1wb3J0IHR5cGUgeyBWZXJzaW9uaW5nSW50ZW50IGFzIFZlcnNpb25pbmdJbnRlbnRTdHJpbmcgfSBmcm9tICcuL3ZlcnNpb25pbmctaW50ZW50JztcbmltcG9ydCB7IGFzc2VydE5ldmVyLCBjaGVja0V4dGVuZHMgfSBmcm9tICcuL3R5cGUtaGVscGVycyc7XG5cbi8vIEF2b2lkIGltcG9ydGluZyB0aGUgcHJvdG8gaW1wbGVtZW50YXRpb24gdG8gcmVkdWNlIHdvcmtmbG93IGJ1bmRsZSBzaXplXG4vLyBDb3BpZWQgZnJvbSBjb3Jlc2RrLmNvbW1vbi5WZXJzaW9uaW5nSW50ZW50XG4vKipcbiAqIFByb3RvYnVmIGVudW0gcmVwcmVzZW50YXRpb24gb2Yge0BsaW5rIFZlcnNpb25pbmdJbnRlbnRTdHJpbmd9LlxuICpcbiAqIEBleHBlcmltZW50YWxcbiAqL1xuZXhwb3J0IGVudW0gVmVyc2lvbmluZ0ludGVudCB7XG4gIFVOU1BFQ0lGSUVEID0gMCxcbiAgQ09NUEFUSUJMRSA9IDEsXG4gIERFRkFVTFQgPSAyLFxufVxuXG5jaGVja0V4dGVuZHM8Y29yZXNkay5jb21tb24uVmVyc2lvbmluZ0ludGVudCwgVmVyc2lvbmluZ0ludGVudD4oKTtcbmNoZWNrRXh0ZW5kczxWZXJzaW9uaW5nSW50ZW50LCBjb3Jlc2RrLmNvbW1vbi5WZXJzaW9uaW5nSW50ZW50PigpO1xuXG5leHBvcnQgZnVuY3Rpb24gdmVyc2lvbmluZ0ludGVudFRvUHJvdG8oaW50ZW50OiBWZXJzaW9uaW5nSW50ZW50U3RyaW5nIHwgdW5kZWZpbmVkKTogVmVyc2lvbmluZ0ludGVudCB7XG4gIHN3aXRjaCAoaW50ZW50KSB7XG4gICAgY2FzZSAnREVGQVVMVCc6XG4gICAgICByZXR1cm4gVmVyc2lvbmluZ0ludGVudC5ERUZBVUxUO1xuICAgIGNhc2UgJ0NPTVBBVElCTEUnOlxuICAgICAgcmV0dXJuIFZlcnNpb25pbmdJbnRlbnQuQ09NUEFUSUJMRTtcbiAgICBjYXNlIHVuZGVmaW5lZDpcbiAgICAgIHJldHVybiBWZXJzaW9uaW5nSW50ZW50LlVOU1BFQ0lGSUVEO1xuICAgIGRlZmF1bHQ6XG4gICAgICBhc3NlcnROZXZlcignVW5leHBlY3RlZCBWZXJzaW9uaW5nSW50ZW50JywgaW50ZW50KTtcbiAgfVxufVxuIiwiLyoqXG4gKiBJbmRpY2F0ZXMgd2hldGhlciB0aGUgdXNlciBpbnRlbmRzIGNlcnRhaW4gY29tbWFuZHMgdG8gYmUgcnVuIG9uIGEgY29tcGF0aWJsZSB3b3JrZXIgQnVpbGQgSWQgdmVyc2lvbiBvciBub3QuXG4gKlxuICogYENPTVBBVElCTEVgIGluZGljYXRlcyB0aGF0IHRoZSBjb21tYW5kIHNob3VsZCBydW4gb24gYSB3b3JrZXIgd2l0aCBjb21wYXRpYmxlIHZlcnNpb24gaWYgcG9zc2libGUuIEl0IG1heSBub3QgYmVcbiAqIHBvc3NpYmxlIGlmIHRoZSB0YXJnZXQgdGFzayBxdWV1ZSBkb2VzIG5vdCBhbHNvIGhhdmUga25vd2xlZGdlIG9mIHRoZSBjdXJyZW50IHdvcmtlcidzIEJ1aWxkIElkLlxuICpcbiAqIGBERUZBVUxUYCBpbmRpY2F0ZXMgdGhhdCB0aGUgY29tbWFuZCBzaG91bGQgcnVuIG9uIHRoZSB0YXJnZXQgdGFzayBxdWV1ZSdzIGN1cnJlbnQgb3ZlcmFsbC1kZWZhdWx0IEJ1aWxkIElkLlxuICpcbiAqIFdoZXJlIHRoaXMgdHlwZSBpcyBhY2NlcHRlZCBvcHRpb25hbGx5LCBhbiB1bnNldCB2YWx1ZSBpbmRpY2F0ZXMgdGhhdCB0aGUgU0RLIHNob3VsZCBjaG9vc2UgdGhlIG1vc3Qgc2Vuc2libGUgZGVmYXVsdFxuICogYmVoYXZpb3IgZm9yIHRoZSB0eXBlIG9mIGNvbW1hbmQsIGFjY291bnRpbmcgZm9yIHdoZXRoZXIgdGhlIGNvbW1hbmQgd2lsbCBiZSBydW4gb24gdGhlIHNhbWUgdGFzayBxdWV1ZSBhcyB0aGVcbiAqIGN1cnJlbnQgd29ya2VyLiBUaGUgZGVmYXVsdCBiZWhhdmlvciBmb3Igc3RhcnRpbmcgV29ya2Zsb3dzIGlzIGBERUZBVUxUYC4gVGhlIGRlZmF1bHQgYmVoYXZpb3IgZm9yIFdvcmtmbG93cyBzdGFydGluZ1xuICogQWN0aXZpdGllcywgc3RhcnRpbmcgQ2hpbGQgV29ya2Zsb3dzLCBvciBDb250aW51aW5nIEFzIE5ldyBpcyBgQ09NUEFUSUJMRWAuXG4gKlxuICogQGV4cGVyaW1lbnRhbFxuICovXG5leHBvcnQgdHlwZSBWZXJzaW9uaW5nSW50ZW50ID0gJ0NPTVBBVElCTEUnIHwgJ0RFRkFVTFQnO1xuIiwiaW1wb3J0IHsgV29ya2Zsb3csIFdvcmtmbG93UmVzdWx0VHlwZSwgU2lnbmFsRGVmaW5pdGlvbiB9IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5cbi8qKlxuICogQmFzZSBXb3JrZmxvd0hhbmRsZSBpbnRlcmZhY2UsIGV4dGVuZGVkIGluIHdvcmtmbG93IGFuZCBjbGllbnQgbGlicy5cbiAqXG4gKiBUcmFuc2Zvcm1zIGEgd29ya2Zsb3cgaW50ZXJmYWNlIGBUYCBpbnRvIGEgY2xpZW50IGludGVyZmFjZS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBCYXNlV29ya2Zsb3dIYW5kbGU8VCBleHRlbmRzIFdvcmtmbG93PiB7XG4gIC8qKlxuICAgKiBQcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2hlbiBXb3JrZmxvdyBleGVjdXRpb24gY29tcGxldGVzXG4gICAqL1xuICByZXN1bHQoKTogUHJvbWlzZTxXb3JrZmxvd1Jlc3VsdFR5cGU8VD4+O1xuXG4gIC8qKlxuICAgKiBTaWduYWwgYSBydW5uaW5nIFdvcmtmbG93LlxuICAgKlxuICAgKiBAcGFyYW0gZGVmIGEgc2lnbmFsIGRlZmluaXRpb24gYXMgcmV0dXJuZWQgZnJvbSB7QGxpbmsgZGVmaW5lU2lnbmFsfVxuICAgKlxuICAgKiBAZXhhbXBsZVxuICAgKiBgYGB0c1xuICAgKiBhd2FpdCBoYW5kbGUuc2lnbmFsKGluY3JlbWVudFNpZ25hbCwgMyk7XG4gICAqIGBgYFxuICAgKi9cbiAgc2lnbmFsPEFyZ3MgZXh0ZW5kcyBhbnlbXSA9IFtdLCBOYW1lIGV4dGVuZHMgc3RyaW5nID0gc3RyaW5nPihcbiAgICBkZWY6IFNpZ25hbERlZmluaXRpb248QXJncywgTmFtZT4gfCBzdHJpbmcsXG4gICAgLi4uYXJnczogQXJnc1xuICApOiBQcm9taXNlPHZvaWQ+O1xuXG4gIC8qKlxuICAgKiBUaGUgd29ya2Zsb3dJZCBvZiB0aGUgY3VycmVudCBXb3JrZmxvd1xuICAgKi9cbiAgcmVhZG9ubHkgd29ya2Zsb3dJZDogc3RyaW5nO1xufVxuIiwiaW1wb3J0IHR5cGUgeyB0ZW1wb3JhbCB9IGZyb20gJ0B0ZW1wb3JhbGlvL3Byb3RvJztcbmltcG9ydCB7IFNlYXJjaEF0dHJpYnV0ZXMsIFdvcmtmbG93IH0gZnJvbSAnLi9pbnRlcmZhY2VzJztcbmltcG9ydCB7IFJldHJ5UG9saWN5IH0gZnJvbSAnLi9yZXRyeS1wb2xpY3knO1xuaW1wb3J0IHsgRHVyYXRpb24gfSBmcm9tICcuL3RpbWUnO1xuaW1wb3J0IHsgY2hlY2tFeHRlbmRzIH0gZnJvbSAnLi90eXBlLWhlbHBlcnMnO1xuXG4vLyBBdm9pZCBpbXBvcnRpbmcgdGhlIHByb3RvIGltcGxlbWVudGF0aW9uIHRvIHJlZHVjZSB3b3JrZmxvdyBidW5kbGUgc2l6ZVxuLy8gQ29waWVkIGZyb20gdGVtcG9yYWwuYXBpLmVudW1zLnYxLldvcmtmbG93SWRSZXVzZVBvbGljeVxuLyoqXG4gKiBDb25jZXB0OiB7QGxpbmsgaHR0cHM6Ly9kb2NzLnRlbXBvcmFsLmlvL2NvbmNlcHRzL3doYXQtaXMtYS13b3JrZmxvdy1pZC1yZXVzZS1wb2xpY3kvIHwgV29ya2Zsb3cgSWQgUmV1c2UgUG9saWN5fVxuICpcbiAqIFdoZXRoZXIgYSBXb3JrZmxvdyBjYW4gYmUgc3RhcnRlZCB3aXRoIGEgV29ya2Zsb3cgSWQgb2YgYSBDbG9zZWQgV29ya2Zsb3cuXG4gKlxuICogKk5vdGU6IEEgV29ya2Zsb3cgY2FuIG5ldmVyIGJlIHN0YXJ0ZWQgd2l0aCBhIFdvcmtmbG93IElkIG9mIGEgUnVubmluZyBXb3JrZmxvdy4qXG4gKi9cbmV4cG9ydCBlbnVtIFdvcmtmbG93SWRSZXVzZVBvbGljeSB7XG4gIC8qKlxuICAgKiBObyBuZWVkIHRvIHVzZSB0aGlzLlxuICAgKlxuICAgKiAoSWYgYSBgV29ya2Zsb3dJZFJldXNlUG9saWN5YCBpcyBzZXQgdG8gdGhpcywgb3IgaXMgbm90IHNldCBhdCBhbGwsIHRoZSBkZWZhdWx0IHZhbHVlIHdpbGwgYmUgdXNlZC4pXG4gICAqL1xuICBXT1JLRkxPV19JRF9SRVVTRV9QT0xJQ1lfVU5TUEVDSUZJRUQgPSAwLFxuXG4gIC8qKlxuICAgKiBUaGUgV29ya2Zsb3cgY2FuIGJlIHN0YXJ0ZWQgaWYgdGhlIHByZXZpb3VzIFdvcmtmbG93IGlzIGluIGEgQ2xvc2VkIHN0YXRlLlxuICAgKiBAZGVmYXVsdFxuICAgKi9cbiAgV09SS0ZMT1dfSURfUkVVU0VfUE9MSUNZX0FMTE9XX0RVUExJQ0FURSA9IDEsXG5cbiAgLyoqXG4gICAqIFRoZSBXb3JrZmxvdyBjYW4gYmUgc3RhcnRlZCBpZiB0aGUgcHJldmlvdXMgV29ya2Zsb3cgaXMgaW4gYSBDbG9zZWQgc3RhdGUgdGhhdCBpcyBub3QgQ29tcGxldGVkLlxuICAgKi9cbiAgV09SS0ZMT1dfSURfUkVVU0VfUE9MSUNZX0FMTE9XX0RVUExJQ0FURV9GQUlMRURfT05MWSA9IDIsXG5cbiAgLyoqXG4gICAqIFRoZSBXb3JrZmxvdyBjYW5ub3QgYmUgc3RhcnRlZC5cbiAgICovXG4gIFdPUktGTE9XX0lEX1JFVVNFX1BPTElDWV9SRUpFQ1RfRFVQTElDQVRFID0gMyxcblxuICAvKipcbiAgICogVGVybWluYXRlIHRoZSBjdXJyZW50IHdvcmtmbG93IGlmIG9uZSBpcyBhbHJlYWR5IHJ1bm5pbmcuXG4gICAqL1xuICBXT1JLRkxPV19JRF9SRVVTRV9QT0xJQ1lfVEVSTUlOQVRFX0lGX1JVTk5JTkcgPSA0LFxufVxuXG5jaGVja0V4dGVuZHM8dGVtcG9yYWwuYXBpLmVudW1zLnYxLldvcmtmbG93SWRSZXVzZVBvbGljeSwgV29ya2Zsb3dJZFJldXNlUG9saWN5PigpO1xuY2hlY2tFeHRlbmRzPFdvcmtmbG93SWRSZXVzZVBvbGljeSwgdGVtcG9yYWwuYXBpLmVudW1zLnYxLldvcmtmbG93SWRSZXVzZVBvbGljeT4oKTtcblxuZXhwb3J0IGludGVyZmFjZSBCYXNlV29ya2Zsb3dPcHRpb25zIHtcbiAgLyoqXG4gICAqIFdoZXRoZXIgYSBXb3JrZmxvdyBjYW4gYmUgc3RhcnRlZCB3aXRoIGEgV29ya2Zsb3cgSWQgb2YgYSBDbG9zZWQgV29ya2Zsb3cuXG4gICAqXG4gICAqICpOb3RlOiBBIFdvcmtmbG93IGNhbiBuZXZlciBiZSBzdGFydGVkIHdpdGggYSBXb3JrZmxvdyBJZCBvZiBhIFJ1bm5pbmcgV29ya2Zsb3cuKlxuICAgKlxuICAgKiBAZGVmYXVsdCB7QGxpbmsgV29ya2Zsb3dJZFJldXNlUG9saWN5LldPUktGTE9XX0lEX1JFVVNFX1BPTElDWV9BTExPV19EVVBMSUNBVEV9XG4gICAqL1xuICB3b3JrZmxvd0lkUmV1c2VQb2xpY3k/OiBXb3JrZmxvd0lkUmV1c2VQb2xpY3k7XG5cbiAgLyoqXG4gICAqIENvbnRyb2xzIGhvdyBhIFdvcmtmbG93IEV4ZWN1dGlvbiBpcyByZXRyaWVkLlxuICAgKlxuICAgKiBCeSBkZWZhdWx0LCBXb3JrZmxvdyBFeGVjdXRpb25zIGFyZSBub3QgcmV0cmllZC4gRG8gbm90IG92ZXJyaWRlIHRoaXMgYmVoYXZpb3IgdW5sZXNzIHlvdSBrbm93IHdoYXQgeW91J3JlIGRvaW5nLlxuICAgKiB7QGxpbmsgaHR0cHM6Ly9kb2NzLnRlbXBvcmFsLmlvL2NvbmNlcHRzL3doYXQtaXMtYS1yZXRyeS1wb2xpY3kvIHwgTW9yZSBpbmZvcm1hdGlvbn0uXG4gICAqL1xuICByZXRyeT86IFJldHJ5UG9saWN5O1xuXG4gIC8qKlxuICAgKiBPcHRpb25hbCBjcm9uIHNjaGVkdWxlIGZvciBXb3JrZmxvdy4gSWYgYSBjcm9uIHNjaGVkdWxlIGlzIHNwZWNpZmllZCwgdGhlIFdvcmtmbG93IHdpbGwgcnVuIGFzIGEgY3JvbiBiYXNlZCBvbiB0aGVcbiAgICogc2NoZWR1bGUuIFRoZSBzY2hlZHVsaW5nIHdpbGwgYmUgYmFzZWQgb24gVVRDIHRpbWUuIFRoZSBzY2hlZHVsZSBmb3IgdGhlIG5leHQgcnVuIG9ubHkgaGFwcGVucyBhZnRlciB0aGUgY3VycmVudFxuICAgKiBydW4gaXMgY29tcGxldGVkL2ZhaWxlZC90aW1lb3V0LiBJZiBhIFJldHJ5UG9saWN5IGlzIGFsc28gc3VwcGxpZWQsIGFuZCB0aGUgV29ya2Zsb3cgZmFpbGVkIG9yIHRpbWVkIG91dCwgdGhlXG4gICAqIFdvcmtmbG93IHdpbGwgYmUgcmV0cmllZCBiYXNlZCBvbiB0aGUgcmV0cnkgcG9saWN5LiBXaGlsZSB0aGUgV29ya2Zsb3cgaXMgcmV0cnlpbmcsIGl0IHdvbid0IHNjaGVkdWxlIGl0cyBuZXh0IHJ1bi5cbiAgICogSWYgdGhlIG5leHQgc2NoZWR1bGUgaXMgZHVlIHdoaWxlIHRoZSBXb3JrZmxvdyBpcyBydW5uaW5nIChvciByZXRyeWluZyksIHRoZW4gaXQgd2lsbCBza2lwIHRoYXQgc2NoZWR1bGUuIENyb25cbiAgICogV29ya2Zsb3cgd2lsbCBub3Qgc3RvcCB1bnRpbCBpdCBpcyB0ZXJtaW5hdGVkIG9yIGNhbmNlbGxlZCAoYnkgcmV0dXJuaW5nIHRlbXBvcmFsLkNhbmNlbGVkRXJyb3IpLlxuICAgKiBodHRwczovL2Nyb250YWIuZ3VydS8gaXMgdXNlZnVsIGZvciB0ZXN0aW5nIHlvdXIgY3JvbiBleHByZXNzaW9ucy5cbiAgICovXG4gIGNyb25TY2hlZHVsZT86IHN0cmluZztcblxuICAvKipcbiAgICogU3BlY2lmaWVzIGFkZGl0aW9uYWwgbm9uLWluZGV4ZWQgaW5mb3JtYXRpb24gdG8gYXR0YWNoIHRvIHRoZSBXb3JrZmxvdyBFeGVjdXRpb24uIFRoZSB2YWx1ZXMgY2FuIGJlIGFueXRoaW5nIHRoYXRcbiAgICogaXMgc2VyaWFsaXphYmxlIGJ5IHtAbGluayBEYXRhQ29udmVydGVyfS5cbiAgICovXG4gIG1lbW8/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcblxuICAvKipcbiAgICogU3BlY2lmaWVzIGFkZGl0aW9uYWwgaW5kZXhlZCBpbmZvcm1hdGlvbiB0byBhdHRhY2ggdG8gdGhlIFdvcmtmbG93IEV4ZWN1dGlvbi4gTW9yZSBpbmZvOlxuICAgKiBodHRwczovL2RvY3MudGVtcG9yYWwuaW8vZG9jcy90eXBlc2NyaXB0L3NlYXJjaC1hdHRyaWJ1dGVzXG4gICAqXG4gICAqIFZhbHVlcyBhcmUgYWx3YXlzIGNvbnZlcnRlZCB1c2luZyB7QGxpbmsgSnNvblBheWxvYWRDb252ZXJ0ZXJ9LCBldmVuIHdoZW4gYSBjdXN0b20gZGF0YSBjb252ZXJ0ZXIgaXMgcHJvdmlkZWQuXG4gICAqL1xuICBzZWFyY2hBdHRyaWJ1dGVzPzogU2VhcmNoQXR0cmlidXRlcztcbn1cblxuZXhwb3J0IHR5cGUgV2l0aFdvcmtmbG93QXJnczxXIGV4dGVuZHMgV29ya2Zsb3csIFQ+ID0gVCAmXG4gIChQYXJhbWV0ZXJzPFc+IGV4dGVuZHMgW2FueSwgLi4uYW55W11dXG4gICAgPyB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBcmd1bWVudHMgdG8gcGFzcyB0byB0aGUgV29ya2Zsb3dcbiAgICAgICAgICovXG4gICAgICAgIGFyZ3M6IFBhcmFtZXRlcnM8Vz4gfCBSZWFkb25seTxQYXJhbWV0ZXJzPFc+PjtcbiAgICAgIH1cbiAgICA6IHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEFyZ3VtZW50cyB0byBwYXNzIHRvIHRoZSBXb3JrZmxvd1xuICAgICAgICAgKi9cbiAgICAgICAgYXJncz86IFBhcmFtZXRlcnM8Vz4gfCBSZWFkb25seTxQYXJhbWV0ZXJzPFc+PjtcbiAgICAgIH0pO1xuXG5leHBvcnQgaW50ZXJmYWNlIFdvcmtmbG93RHVyYXRpb25PcHRpb25zIHtcbiAgLyoqXG4gICAqIFRoZSB0aW1lIGFmdGVyIHdoaWNoIHdvcmtmbG93IHJ1biBpcyBhdXRvbWF0aWNhbGx5IHRlcm1pbmF0ZWQgYnkgVGVtcG9yYWwgc2VydmljZS4gRG8gbm90XG4gICAqIHJlbHkgb24gcnVuIHRpbWVvdXQgZm9yIGJ1c2luZXNzIGxldmVsIHRpbWVvdXRzLiBJdCBpcyBwcmVmZXJyZWQgdG8gdXNlIGluIHdvcmtmbG93IHRpbWVyc1xuICAgKiBmb3IgdGhpcyBwdXJwb3NlLlxuICAgKlxuICAgKiBAZm9ybWF0IG51bWJlciBvZiBtaWxsaXNlY29uZHMgb3Ige0BsaW5rIGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL21zIHwgbXMtZm9ybWF0dGVkIHN0cmluZ31cbiAgICovXG4gIHdvcmtmbG93UnVuVGltZW91dD86IER1cmF0aW9uO1xuXG4gIC8qKlxuICAgKlxuICAgKiBUaGUgdGltZSBhZnRlciB3aGljaCB3b3JrZmxvdyBleGVjdXRpb24gKHdoaWNoIGluY2x1ZGVzIHJ1biByZXRyaWVzIGFuZCBjb250aW51ZSBhcyBuZXcpIGlzXG4gICAqIGF1dG9tYXRpY2FsbHkgdGVybWluYXRlZCBieSBUZW1wb3JhbCBzZXJ2aWNlLiBEbyBub3QgcmVseSBvbiBleGVjdXRpb24gdGltZW91dCBmb3IgYnVzaW5lc3NcbiAgICogbGV2ZWwgdGltZW91dHMuIEl0IGlzIHByZWZlcnJlZCB0byB1c2UgaW4gd29ya2Zsb3cgdGltZXJzIGZvciB0aGlzIHB1cnBvc2UuXG4gICAqXG4gICAqIEBmb3JtYXQgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBvciB7QGxpbmsgaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvbXMgfCBtcy1mb3JtYXR0ZWQgc3RyaW5nfVxuICAgKi9cbiAgd29ya2Zsb3dFeGVjdXRpb25UaW1lb3V0PzogRHVyYXRpb247XG5cbiAgLyoqXG4gICAqIE1heGltdW0gZXhlY3V0aW9uIHRpbWUgb2YgYSBzaW5nbGUgd29ya2Zsb3cgdGFzay4gRGVmYXVsdCBpcyAxMCBzZWNvbmRzLlxuICAgKlxuICAgKiBAZm9ybWF0IG51bWJlciBvZiBtaWxsaXNlY29uZHMgb3Ige0BsaW5rIGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL21zIHwgbXMtZm9ybWF0dGVkIHN0cmluZ31cbiAgICovXG4gIHdvcmtmbG93VGFza1RpbWVvdXQ/OiBEdXJhdGlvbjtcbn1cblxuZXhwb3J0IHR5cGUgQ29tbW9uV29ya2Zsb3dPcHRpb25zID0gQmFzZVdvcmtmbG93T3B0aW9ucyAmIFdvcmtmbG93RHVyYXRpb25PcHRpb25zO1xuXG5leHBvcnQgZnVuY3Rpb24gZXh0cmFjdFdvcmtmbG93VHlwZTxUIGV4dGVuZHMgV29ya2Zsb3c+KHdvcmtmbG93VHlwZU9yRnVuYzogc3RyaW5nIHwgVCk6IHN0cmluZyB7XG4gIGlmICh0eXBlb2Ygd29ya2Zsb3dUeXBlT3JGdW5jID09PSAnc3RyaW5nJykgcmV0dXJuIHdvcmtmbG93VHlwZU9yRnVuYyBhcyBzdHJpbmc7XG4gIGlmICh0eXBlb2Ygd29ya2Zsb3dUeXBlT3JGdW5jID09PSAnZnVuY3Rpb24nKSB7XG4gICAgaWYgKHdvcmtmbG93VHlwZU9yRnVuYz8ubmFtZSkgcmV0dXJuIHdvcmtmbG93VHlwZU9yRnVuYy5uYW1lO1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgd29ya2Zsb3cgdHlwZTogdGhlIHdvcmtmbG93IGZ1bmN0aW9uIGlzIGFub255bW91cycpO1xuICB9XG4gIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgYEludmFsaWQgd29ya2Zsb3cgdHlwZTogZXhwZWN0ZWQgZWl0aGVyIGEgc3RyaW5nIG9yIGEgZnVuY3Rpb24sIGdvdCAnJHt0eXBlb2Ygd29ya2Zsb3dUeXBlT3JGdW5jfSdgXG4gICk7XG59XG4iLCIvLyBBIHBvcnQgb2YgYW4gYWxnb3JpdGhtIGJ5IEpvaGFubmVzIEJhYWfDuGUgPGJhYWdvZUBiYWFnb2UuY29tPiwgMjAxMFxuLy8gaHR0cDovL2JhYWdvZS5jb20vZW4vUmFuZG9tTXVzaW5ncy9qYXZhc2NyaXB0L1xuLy8gaHR0cHM6Ly9naXRodWIuY29tL25xdWlubGFuL2JldHRlci1yYW5kb20tbnVtYmVycy1mb3ItamF2YXNjcmlwdC1taXJyb3Jcbi8vIE9yaWdpbmFsIHdvcmsgaXMgdW5kZXIgTUlUIGxpY2Vuc2UgLVxuXG4vLyBDb3B5cmlnaHQgKEMpIDIwMTAgYnkgSm9oYW5uZXMgQmFhZ8O4ZSA8YmFhZ29lQGJhYWdvZS5vcmc+XG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuLy8gVGFrZW4gYW5kIG1vZGlmaWVkIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL2RhdmlkYmF1L3NlZWRyYW5kb20vYmxvYi9yZWxlYXNlZC9saWIvYWxlYS5qc1xuXG5jbGFzcyBBbGVhIHtcbiAgcHVibGljIGM6IG51bWJlcjtcbiAgcHVibGljIHMwOiBudW1iZXI7XG4gIHB1YmxpYyBzMTogbnVtYmVyO1xuICBwdWJsaWMgczI6IG51bWJlcjtcblxuICBjb25zdHJ1Y3RvcihzZWVkOiBudW1iZXJbXSkge1xuICAgIGNvbnN0IG1hc2ggPSBuZXcgTWFzaCgpO1xuICAgIC8vIEFwcGx5IHRoZSBzZWVkaW5nIGFsZ29yaXRobSBmcm9tIEJhYWdvZS5cbiAgICB0aGlzLmMgPSAxO1xuICAgIHRoaXMuczAgPSBtYXNoLm1hc2goWzMyXSk7XG4gICAgdGhpcy5zMSA9IG1hc2gubWFzaChbMzJdKTtcbiAgICB0aGlzLnMyID0gbWFzaC5tYXNoKFszMl0pO1xuICAgIHRoaXMuczAgLT0gbWFzaC5tYXNoKHNlZWQpO1xuICAgIGlmICh0aGlzLnMwIDwgMCkge1xuICAgICAgdGhpcy5zMCArPSAxO1xuICAgIH1cbiAgICB0aGlzLnMxIC09IG1hc2gubWFzaChzZWVkKTtcbiAgICBpZiAodGhpcy5zMSA8IDApIHtcbiAgICAgIHRoaXMuczEgKz0gMTtcbiAgICB9XG4gICAgdGhpcy5zMiAtPSBtYXNoLm1hc2goc2VlZCk7XG4gICAgaWYgKHRoaXMuczIgPCAwKSB7XG4gICAgICB0aGlzLnMyICs9IDE7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIG5leHQoKTogbnVtYmVyIHtcbiAgICBjb25zdCB0ID0gMjA5MTYzOSAqIHRoaXMuczAgKyB0aGlzLmMgKiAyLjMyODMwNjQzNjUzODY5NjNlLTEwOyAvLyAyXi0zMlxuICAgIHRoaXMuczAgPSB0aGlzLnMxO1xuICAgIHRoaXMuczEgPSB0aGlzLnMyO1xuICAgIHJldHVybiAodGhpcy5zMiA9IHQgLSAodGhpcy5jID0gdCB8IDApKTtcbiAgfVxufVxuXG5leHBvcnQgdHlwZSBSTkcgPSAoKSA9PiBudW1iZXI7XG5cbmV4cG9ydCBmdW5jdGlvbiBhbGVhKHNlZWQ6IG51bWJlcltdKTogUk5HIHtcbiAgY29uc3QgeGcgPSBuZXcgQWxlYShzZWVkKTtcbiAgcmV0dXJuIHhnLm5leHQuYmluZCh4Zyk7XG59XG5cbmV4cG9ydCBjbGFzcyBNYXNoIHtcbiAgcHJpdmF0ZSBuID0gMHhlZmM4MjQ5ZDtcblxuICBwdWJsaWMgbWFzaChkYXRhOiBudW1iZXJbXSk6IG51bWJlciB7XG4gICAgbGV0IHsgbiB9ID0gdGhpcztcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgIG4gKz0gZGF0YVtpXTtcbiAgICAgIGxldCBoID0gMC4wMjUxOTYwMzI4MjQxNjkzOCAqIG47XG4gICAgICBuID0gaCA+Pj4gMDtcbiAgICAgIGggLT0gbjtcbiAgICAgIGggKj0gbjtcbiAgICAgIG4gPSBoID4+PiAwO1xuICAgICAgaCAtPSBuO1xuICAgICAgbiArPSBoICogMHgxMDAwMDAwMDA7IC8vIDJeMzJcbiAgICB9XG4gICAgdGhpcy5uID0gbjtcbiAgICByZXR1cm4gKG4gPj4+IDApICogMi4zMjgzMDY0MzY1Mzg2OTYzZS0xMDsgLy8gMl4tMzJcbiAgfVxufVxuIiwiaW1wb3J0IHR5cGUgeyBBc3luY0xvY2FsU3RvcmFnZSBhcyBBTFMgfSBmcm9tICdub2RlOmFzeW5jX2hvb2tzJztcbmltcG9ydCB7IENhbmNlbGxlZEZhaWx1cmUsIER1cmF0aW9uLCBJbGxlZ2FsU3RhdGVFcnJvciB9IGZyb20gJ0B0ZW1wb3JhbGlvL2NvbW1vbic7XG5pbXBvcnQgeyBtc09wdGlvbmFsVG9OdW1iZXIgfSBmcm9tICdAdGVtcG9yYWxpby9jb21tb24vbGliL3RpbWUnO1xuaW1wb3J0IHsgdW50cmFja1Byb21pc2UgfSBmcm9tICcuL3N0YWNrLWhlbHBlcnMnO1xuaW1wb3J0IHsgZ2V0QWN0aXZhdG9yIH0gZnJvbSAnLi9nbG9iYWwtYXR0cmlidXRlcyc7XG5pbXBvcnQgeyBTZGtGbGFncyB9IGZyb20gJy4vZmxhZ3MnO1xuXG4vLyBBc3luY0xvY2FsU3RvcmFnZSBpcyBpbmplY3RlZCB2aWEgdm0gbW9kdWxlIGludG8gZ2xvYmFsIHNjb3BlLlxuLy8gSW4gY2FzZSBXb3JrZmxvdyBjb2RlIGlzIGltcG9ydGVkIGluIE5vZGUuanMgY29udGV4dCwgcmVwbGFjZSB3aXRoIGFuIGVtcHR5IGNsYXNzLlxuZXhwb3J0IGNvbnN0IEFzeW5jTG9jYWxTdG9yYWdlOiBuZXcgPFQ+KCkgPT4gQUxTPFQ+ID0gKGdsb2JhbFRoaXMgYXMgYW55KS5Bc3luY0xvY2FsU3RvcmFnZSA/PyBjbGFzcyB7fTtcblxuLyoqIE1hZ2ljIHN5bWJvbCB1c2VkIHRvIGNyZWF0ZSB0aGUgcm9vdCBzY29wZSAtIGludGVudGlvbmFsbHkgbm90IGV4cG9ydGVkICovXG5jb25zdCBOT19QQVJFTlQgPSBTeW1ib2woJ05PX1BBUkVOVCcpO1xuXG4vKipcbiAqIE9wdGlvbiBmb3IgY29uc3RydWN0aW5nIGEgQ2FuY2VsbGF0aW9uU2NvcGVcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBDYW5jZWxsYXRpb25TY29wZU9wdGlvbnMge1xuICAvKipcbiAgICogVGltZSBpbiBtaWxsaXNlY29uZHMgYmVmb3JlIHRoZSBzY29wZSBjYW5jZWxsYXRpb24gaXMgYXV0b21hdGljYWxseSByZXF1ZXN0ZWRcbiAgICovXG4gIHRpbWVvdXQ/OiBEdXJhdGlvbjtcblxuICAvKipcbiAgICogSWYgZmFsc2UsIHByZXZlbnQgb3V0ZXIgY2FuY2VsbGF0aW9uIGZyb20gcHJvcGFnYXRpbmcgdG8gaW5uZXIgc2NvcGVzLCBBY3Rpdml0aWVzLCB0aW1lcnMsIGFuZCBUcmlnZ2VycywgZGVmYXVsdHMgdG8gdHJ1ZS5cbiAgICogKFNjb3BlIHN0aWxsIHByb3BhZ2F0ZXMgQ2FuY2VsbGVkRmFpbHVyZSB0aHJvd24gZnJvbSB3aXRoaW4pLlxuICAgKi9cbiAgY2FuY2VsbGFibGU6IGJvb2xlYW47XG4gIC8qKlxuICAgKiBBbiBvcHRpb25hbCBDYW5jZWxsYXRpb25TY29wZSAodXNlZnVsIGZvciBydW5uaW5nIGJhY2tncm91bmQgdGFza3MpLlxuICAgKiBUaGUgYE5PX1BBUkVOVGAgc3ltYm9sIGlzIHJlc2VydmVkIGZvciB0aGUgcm9vdCBzY29wZS5cbiAgICovXG4gIHBhcmVudD86IENhbmNlbGxhdGlvblNjb3BlIHwgdHlwZW9mIE5PX1BBUkVOVDtcbn1cblxuLyoqXG4gKiBDYW5jZWxsYXRpb24gU2NvcGVzIHByb3ZpZGUgdGhlIG1lY2hhbmljIGJ5IHdoaWNoIGEgV29ya2Zsb3cgbWF5IGdyYWNlZnVsbHkgaGFuZGxlIGluY29taW5nIHJlcXVlc3RzIGZvciBjYW5jZWxsYXRpb25cbiAqIChlLmcuIGluIHJlc3BvbnNlIHRvIHtAbGluayBXb3JrZmxvd0hhbmRsZS5jYW5jZWx9IG9yIHRocm91Z2ggdGhlIFVJIG9yIENMSSksIGFzIHdlbGwgYXMgcmVxdWVzdCBjYW5jZWxhdGlvbiBvZlxuICogY2FuY2VsbGFibGUgb3BlcmF0aW9ucyBpdCBvd25zIChlLmcuIEFjdGl2aXRpZXMsIFRpbWVycywgQ2hpbGQgV29ya2Zsb3dzLCBldGMpLlxuICpcbiAqIENhbmNlbGxhdGlvbiBTY29wZXMgZm9ybSBhIHRyZWUsIHdpdGggdGhlIFdvcmtmbG93J3MgbWFpbiBmdW5jdGlvbiBydW5uaW5nIGluIHRoZSByb290IHNjb3BlIG9mIHRoYXQgdHJlZS5cbiAqIEJ5IGRlZmF1bHQsIGNhbmNlbGxhdGlvbiBwcm9wYWdhdGVzIGRvd24gZnJvbSBhIHBhcmVudCBzY29wZSB0byBpdHMgY2hpbGRyZW4gYW5kIGl0cyBjYW5jZWxsYWJsZSBvcGVyYXRpb25zLlxuICogQSBub24tY2FuY2VsbGFibGUgc2NvcGUgY2FuIHJlY2VpdmUgY2FuY2VsbGF0aW9uIHJlcXVlc3RzLCBidXQgaXMgbmV2ZXIgZWZmZWN0aXZlbHkgY29uc2lkZXJlZCBhcyBjYW5jZWxsZWQsXG4gKiB0aHVzIHNoaWVsZGRpbmcgaXRzIGNoaWxkcmVuIGFuZCBjYW5jZWxsYWJsZSBvcGVyYXRpb25zIGZyb20gcHJvcGFnYXRpb24gb2YgY2FuY2VsbGF0aW9uIHJlcXVlc3RzIGl0IHJlY2VpdmVzLlxuICpcbiAqIFNjb3BlcyBhcmUgY3JlYXRlZCB1c2luZyB0aGUgYENhbmNlbGxhdGlvblNjb3BlYCBjb25zdHJ1Y3RvciBvciB0aGUgc3RhdGljIGhlbHBlciBtZXRob2RzIHtAbGluayBjYW5jZWxsYWJsZX0sXG4gKiB7QGxpbmsgbm9uQ2FuY2VsbGFibGV9IGFuZCB7QGxpbmsgd2l0aFRpbWVvdXR9LiBgd2l0aFRpbWVvdXRgIGNyZWF0ZXMgYSBzY29wZSB0aGF0IGF1dG9tYXRpY2FsbHkgY2FuY2VscyBpdHNlbGYgYWZ0ZXJcbiAqIHNvbWUgZHVyYXRpb24uXG4gKlxuICogQ2FuY2VsbGF0aW9uIG9mIGEgY2FuY2VsbGFibGUgc2NvcGUgcmVzdWx0cyBpbiBhbGwgb3BlcmF0aW9ucyBjcmVhdGVkIGRpcmVjdGx5IGluIHRoYXQgc2NvcGUgdG8gdGhyb3cgYVxuICoge0BsaW5rIENhbmNlbGxlZEZhaWx1cmV9IChlaXRoZXIgZGlyZWN0bHksIG9yIGFzIHRoZSBgY2F1c2VgIG9mIGFuIHtAbGluayBBY3Rpdml0eUZhaWx1cmV9IG9yIGFcbiAqIHtAbGluayBDaGlsZFdvcmtmbG93RmFpbHVyZX0pLiBGdXJ0aGVyIGF0dGVtcHQgdG8gY3JlYXRlIG5ldyBjYW5jZWxsYWJsZSBzY29wZXMgb3IgY2FuY2VsbGFibGUgb3BlcmF0aW9ucyB3aXRoaW4gYVxuICogc2NvcGUgdGhhdCBoYXMgYWxyZWFkeSBiZWVuIGNhbmNlbGxlZCB3aWxsIGFsc28gaW1tZWRpYXRlbHkgdGhyb3cgYSB7QGxpbmsgQ2FuY2VsbGVkRmFpbHVyZX0gZXhjZXB0aW9uLiBJdCBpcyBob3dldmVyXG4gKiBwb3NzaWJsZSB0byBjcmVhdGUgYSBub24tY2FuY2VsbGFibGUgc2NvcGUgYXQgdGhhdCBwb2ludDsgdGhpcyBpcyBvZnRlbiB1c2VkIHRvIGV4ZWN1dGUgcm9sbGJhY2sgb3IgY2xlYW51cFxuICogb3BlcmF0aW9ucy4gRm9yIGV4YW1wbGU6XG4gKlxuICogYGBgdHNcbiAqIGFzeW5jIGZ1bmN0aW9uIG15V29ya2Zsb3coLi4uKTogUHJvbWlzZTx2b2lkPiB7XG4gKiAgIHRyeSB7XG4gKiAgICAgLy8gVGhpcyBhY3Rpdml0eSBydW5zIGluIHRoZSByb290IGNhbmNlbGxhdGlvbiBzY29wZS4gVGhlcmVmb3JlLCBhIGNhbmNlbGF0aW9uIHJlcXVlc3Qgb25cbiAqICAgICAvLyB0aGUgV29ya2Zsb3cgZXhlY3V0aW9uIChlLmcuIHRocm91Z2ggdGhlIFVJIG9yIENMSSkgYXV0b21hdGljYWxseSBwcm9wYWdhdGVzIHRvIHRoaXNcbiAqICAgICAvLyBhY3Rpdml0eS4gQXNzdW1pbmcgdGhhdCB0aGUgYWN0aXZpdHkgcHJvcGVybHkgaGFuZGxlIHRoZSBjYW5jZWxsYXRpb24gcmVxdWVzdCwgdGhlbiB0aGVcbiAqICAgICAvLyBjYWxsIGJlbG93IHdpbGwgdGhyb3cgYW4gYEFjdGl2aXR5RmFpbHVyZWAgZXhjZXB0aW9uLCB3aXRoIGBjYXVzZWAgc2V0cyB0byBhblxuICogICAgIC8vIGluc3RhbmNlIG9mIGBDYW5jZWxsZWRGYWlsdXJlYC5cbiAqICAgICBhd2FpdCBzb21lQWN0aXZpdHkoKTtcbiAqICAgfSBjYXRjaCAoZSkge1xuICogICAgIGlmIChpc0NhbmNlbGxhdGlvbihlKSkge1xuICogICAgICAgLy8gUnVuIGNsZWFudXAgYWN0aXZpdHkgaW4gYSBub24tY2FuY2VsbGFibGUgc2NvcGVcbiAqICAgICAgIGF3YWl0IENhbmNlbGxhdGlvblNjb3BlLm5vbkNhbmNlbGxhYmxlKGFzeW5jICgpID0+IHtcbiAqICAgICAgICAgYXdhaXQgY2xlYW51cEFjdGl2aXR5KCk7XG4gKiAgICAgICB9XG4gKiAgICAgfSBlbHNlIHtcbiAqICAgICAgIHRocm93IGU7XG4gKiAgICAgfVxuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBBIGNhbmNlbGxhYmxlIHNjb3BlIG1heSBiZSBwcm9ncmFtYXRpY2FsbHkgY2FuY2VsbGVkIGJ5IGNhbGxpbmcge0BsaW5rIGNhbmNlbHxgc2NvcGUuY2FuY2VsKClgfWAuIFRoaXMgbWF5IGJlIHVzZWQsXG4gKiBmb3IgZXhhbXBsZSwgdG8gZXhwbGljaXRseSByZXF1ZXN0IGNhbmNlbGxhdGlvbiBvZiBhbiBBY3Rpdml0eSBvciBDaGlsZCBXb3JrZmxvdzpcbiAqXG4gKiBgYGB0c1xuICogY29uc3QgY2FuY2VsbGFibGVBY3Rpdml0eVNjb3BlID0gbmV3IENhbmNlbGxhdGlvblNjb3BlKCk7XG4gKiBjb25zdCBhY3Rpdml0eVByb21pc2UgPSBjYW5jZWxsYWJsZUFjdGl2aXR5U2NvcGUucnVuKCgpID0+IHNvbWVBY3Rpdml0eSgpKTtcbiAqIGNhbmNlbGxhYmxlQWN0aXZpdHlTY29wZS5jYW5jZWwoKTsgLy8gQ2FuY2VscyB0aGUgYWN0aXZpdHlcbiAqIGF3YWl0IGFjdGl2aXR5UHJvbWlzZTsgLy8gVGhyb3dzIGBBY3Rpdml0eUZhaWx1cmVgIHdpdGggYGNhdXNlYCBzZXQgdG8gYENhbmNlbGxlZEZhaWx1cmVgXG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNsYXNzIENhbmNlbGxhdGlvblNjb3BlIHtcbiAgLyoqXG4gICAqIFRpbWUgaW4gbWlsbGlzZWNvbmRzIGJlZm9yZSB0aGUgc2NvcGUgY2FuY2VsbGF0aW9uIGlzIGF1dG9tYXRpY2FsbHkgcmVxdWVzdGVkXG4gICAqL1xuICBwcm90ZWN0ZWQgcmVhZG9ubHkgdGltZW91dD86IG51bWJlcjtcblxuICAvKipcbiAgICogSWYgZmFsc2UsIHRoZW4gdGhpcyBzY29wZSB3aWxsIG5ldmVyIGJlIGNvbnNpZGVyZWQgY2FuY2VsbGVkLCBldmVuIGlmIGEgY2FuY2VsbGF0aW9uIHJlcXVlc3QgaXMgcmVjZWl2ZWQgKGVpdGhlclxuICAgKiBkaXJlY3RseSBieSBjYWxsaW5nIGBzY29wZS5jYW5jZWwoKWAgb3IgaW5kaXJlY3RseSBieSBjYW5jZWxsaW5nIGEgY2FuY2VsbGFibGUgcGFyZW50IHNjb3BlKS4gVGhpcyBlZmZlY3RpdmVseVxuICAgKiBzaGllbGRzIHRoZSBzY29wZSdzIGNoaWxkcmVuIGFuZCBjYW5jZWxsYWJsZSBvcGVyYXRpb25zIGZyb20gcHJvcGFnYXRpb24gb2YgY2FuY2VsbGF0aW9uIHJlcXVlc3RzIG1hZGUgb24gdGhlXG4gICAqIG5vbi1jYW5jZWxsYWJsZSBzY29wZS5cbiAgICpcbiAgICogTm90ZSB0aGF0IHRoZSBQcm9taXNlIHJldHVybmVkIGJ5IHRoZSBgcnVuYCBmdW5jdGlvbiBvZiBub24tY2FuY2VsbGFibGUgc2NvcGUgbWF5IHN0aWxsIHRocm93IGEgYENhbmNlbGxlZEZhaWx1cmVgXG4gICAqIGlmIHN1Y2ggYW4gZXhjZXB0aW9uIGlzIHRocm93biBmcm9tIHdpdGhpbiB0aGF0IHNjb3BlIChlLmcuIGJ5IGRpcmVjdGx5IGNhbmNlbGxpbmcgYSBjYW5jZWxsYWJsZSBjaGlsZCBzY29wZSkuXG4gICAqL1xuICBwdWJsaWMgcmVhZG9ubHkgY2FuY2VsbGFibGU6IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIEFuIG9wdGlvbmFsIENhbmNlbGxhdGlvblNjb3BlICh1c2VmdWwgZm9yIHJ1bm5pbmcgYmFja2dyb3VuZCB0YXNrcyksIGRlZmF1bHRzIHRvIHtAbGluayBDYW5jZWxsYXRpb25TY29wZS5jdXJyZW50fSgpXG4gICAqL1xuICBwdWJsaWMgcmVhZG9ubHkgcGFyZW50PzogQ2FuY2VsbGF0aW9uU2NvcGU7XG5cbiAgLyoqXG4gICAqIEEgUHJvbWlzZSB0aGF0IHRocm93cyB3aGVuIGEgY2FuY2VsbGFibGUgc2NvcGUgcmVjZWl2ZXMgYSBjYW5jZWxsYXRpb24gcmVxdWVzdCwgZWl0aGVyIGRpcmVjdGx5XG4gICAqIChpLmUuIGBzY29wZS5jYW5jZWwoKWApLCBvciBpbmRpcmVjdGx5IChieSBjYW5jZWxsaW5nIGEgY2FuY2VsbGFibGUgcGFyZW50IHNjb3BlKS5cbiAgICpcbiAgICogTm90ZSB0aGF0IGEgbm9uLWNhbmNlbGxhYmxlIHNjb3BlIG1heSByZWNlaXZlIGNhbmNlbGxhdGlvbiByZXF1ZXN0cywgcmVzdWx0aW5nIGluIHRoZSBgY2FuY2VsUmVxdWVzdGVkYCBwcm9taXNlIGZvclxuICAgKiB0aGF0IHNjb3BlIHRvIHRocm93LCB0aG91Z2ggdGhlIHNjb3BlIHdpbGwgbm90IGVmZmVjdGl2ZWx5IGdldCBjYW5jZWxsZWQgKGkuZS4gYGNvbnNpZGVyZWRDYW5jZWxsZWRgIHdpbGwgc3RpbGxcbiAgICogcmV0dXJuIGBmYWxzZWAsIGFuZCBjYW5jZWxsYXRpb24gd2lsbCBub3QgYmUgcHJvcGFnYXRlZCB0byBjaGlsZCBzY29wZXMgYW5kIGNvbnRhaW5lZCBvcGVyYXRpb25zKS5cbiAgICovXG4gIHB1YmxpYyByZWFkb25seSBjYW5jZWxSZXF1ZXN0ZWQ6IFByb21pc2U8bmV2ZXI+O1xuXG4gICNjYW5jZWxSZXF1ZXN0ZWQgPSBmYWxzZTtcblxuICAvLyBUeXBlc2NyaXB0IGRvZXMgbm90IHVuZGVyc3RhbmQgdGhhdCB0aGUgUHJvbWlzZSBleGVjdXRvciBydW5zIHN5bmNocm9ub3VzbHkgaW4gdGhlIGNvbnN0cnVjdG9yXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvYmFuLXRzLWNvbW1lbnRcbiAgLy8gQHRzLWlnbm9yZVxuICBwcm90ZWN0ZWQgcmVhZG9ubHkgcmVqZWN0OiAocmVhc29uPzogYW55KSA9PiB2b2lkO1xuXG4gIGNvbnN0cnVjdG9yKG9wdGlvbnM/OiBDYW5jZWxsYXRpb25TY29wZU9wdGlvbnMpIHtcbiAgICB0aGlzLnRpbWVvdXQgPSBtc09wdGlvbmFsVG9OdW1iZXIob3B0aW9ucz8udGltZW91dCk7XG4gICAgdGhpcy5jYW5jZWxsYWJsZSA9IG9wdGlvbnM/LmNhbmNlbGxhYmxlID8/IHRydWU7XG4gICAgdGhpcy5jYW5jZWxSZXF1ZXN0ZWQgPSBuZXcgUHJvbWlzZSgoXywgcmVqZWN0KSA9PiB7XG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIFRTQyBkb2Vzbid0IHVuZGVyc3RhbmQgdGhhdCB0aGUgUHJvbWlzZSBleGVjdXRvciBydW5zIHN5bmNocm9ub3VzbHlcbiAgICAgIHRoaXMucmVqZWN0ID0gKGVycikgPT4ge1xuICAgICAgICB0aGlzLiNjYW5jZWxSZXF1ZXN0ZWQgPSB0cnVlO1xuICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgIH07XG4gICAgfSk7XG4gICAgdW50cmFja1Byb21pc2UodGhpcy5jYW5jZWxSZXF1ZXN0ZWQpO1xuICAgIC8vIEF2b2lkIHVuaGFuZGxlZCByZWplY3Rpb25zXG4gICAgdW50cmFja1Byb21pc2UodGhpcy5jYW5jZWxSZXF1ZXN0ZWQuY2F0Y2goKCkgPT4gdW5kZWZpbmVkKSk7XG4gICAgaWYgKG9wdGlvbnM/LnBhcmVudCAhPT0gTk9fUEFSRU5UKSB7XG4gICAgICB0aGlzLnBhcmVudCA9IG9wdGlvbnM/LnBhcmVudCB8fCBDYW5jZWxsYXRpb25TY29wZS5jdXJyZW50KCk7XG4gICAgICBpZiAoXG4gICAgICAgIHRoaXMucGFyZW50LmNhbmNlbGxhYmxlIHx8XG4gICAgICAgICh0aGlzLnBhcmVudC4jY2FuY2VsUmVxdWVzdGVkICYmXG4gICAgICAgICAgIWdldEFjdGl2YXRvcigpLmhhc0ZsYWcoU2RrRmxhZ3MuTm9uQ2FuY2VsbGFibGVTY29wZXNBcmVTaGllbGRlZEZyb21Qcm9wYWdhdGlvbikpXG4gICAgICApIHtcbiAgICAgICAgdGhpcy4jY2FuY2VsUmVxdWVzdGVkID0gdGhpcy5wYXJlbnQuI2NhbmNlbFJlcXVlc3RlZDtcbiAgICAgICAgdW50cmFja1Byb21pc2UoXG4gICAgICAgICAgdGhpcy5wYXJlbnQuY2FuY2VsUmVxdWVzdGVkLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgIHRoaXMucmVqZWN0KGVycik7XG4gICAgICAgICAgfSlcbiAgICAgICAgKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHVudHJhY2tQcm9taXNlKFxuICAgICAgICAgIHRoaXMucGFyZW50LmNhbmNlbFJlcXVlc3RlZC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICBpZiAoIWdldEFjdGl2YXRvcigpLmhhc0ZsYWcoU2RrRmxhZ3MuTm9uQ2FuY2VsbGFibGVTY29wZXNBcmVTaGllbGRlZEZyb21Qcm9wYWdhdGlvbikpIHtcbiAgICAgICAgICAgICAgdGhpcy5yZWplY3QoZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KVxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoZSBzY29wZSB3YXMgZWZmZWN0aXZlbHkgY2FuY2VsbGVkLiBBIG5vbi1jYW5jZWxsYWJsZSBzY29wZSBjYW4gbmV2ZXIgYmUgY29uc2lkZXJlZCBjYW5jZWxsZWQuXG4gICAqL1xuICBwdWJsaWMgZ2V0IGNvbnNpZGVyZWRDYW5jZWxsZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuI2NhbmNlbFJlcXVlc3RlZCAmJiB0aGlzLmNhbmNlbGxhYmxlO1xuICB9XG5cbiAgLyoqXG4gICAqIEFjdGl2YXRlIHRoZSBzY29wZSBhcyBjdXJyZW50IGFuZCBydW4gIGBmbmBcbiAgICpcbiAgICogQW55IHRpbWVycywgQWN0aXZpdGllcywgVHJpZ2dlcnMgYW5kIENhbmNlbGxhdGlvblNjb3BlcyBjcmVhdGVkIGluIHRoZSBib2R5IG9mIGBmbmBcbiAgICogYXV0b21hdGljYWxseSBsaW5rIHRoZWlyIGNhbmNlbGxhdGlvbiB0byB0aGlzIHNjb3BlLlxuICAgKlxuICAgKiBAcmV0dXJuIHRoZSByZXN1bHQgb2YgYGZuYFxuICAgKi9cbiAgcnVuPFQ+KGZuOiAoKSA9PiBQcm9taXNlPFQ+KTogUHJvbWlzZTxUPiB7XG4gICAgcmV0dXJuIHN0b3JhZ2UucnVuKHRoaXMsIHRoaXMucnVuSW5Db250ZXh0LmJpbmQodGhpcywgZm4pIGFzICgpID0+IFByb21pc2U8VD4pO1xuICB9XG5cbiAgLyoqXG4gICAqIE1ldGhvZCB0aGF0IHJ1bnMgYSBmdW5jdGlvbiBpbiBBc3luY0xvY2FsU3RvcmFnZSBjb250ZXh0LlxuICAgKlxuICAgKiBDb3VsZCBoYXZlIGJlZW4gd3JpdHRlbiBhcyBhbm9ueW1vdXMgZnVuY3Rpb24sIG1hZGUgaW50byBhIG1ldGhvZCBmb3IgaW1wcm92ZWQgc3RhY2sgdHJhY2VzLlxuICAgKi9cbiAgcHJvdGVjdGVkIGFzeW5jIHJ1bkluQ29udGV4dDxUPihmbjogKCkgPT4gUHJvbWlzZTxUPik6IFByb21pc2U8VD4ge1xuICAgIGxldCB0aW1lclNjb3BlOiBDYW5jZWxsYXRpb25TY29wZSB8IHVuZGVmaW5lZDtcbiAgICBpZiAodGhpcy50aW1lb3V0KSB7XG4gICAgICB0aW1lclNjb3BlID0gbmV3IENhbmNlbGxhdGlvblNjb3BlKCk7XG4gICAgICB1bnRyYWNrUHJvbWlzZShcbiAgICAgICAgdGltZXJTY29wZVxuICAgICAgICAgIC5ydW4oKCkgPT4gc2xlZXAodGhpcy50aW1lb3V0IGFzIG51bWJlcikpXG4gICAgICAgICAgLnRoZW4oXG4gICAgICAgICAgICAoKSA9PiB0aGlzLmNhbmNlbCgpLFxuICAgICAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgICAvLyBzY29wZSB3YXMgYWxyZWFkeSBjYW5jZWxsZWQsIGlnbm9yZVxuICAgICAgICAgICAgfVxuICAgICAgICAgIClcbiAgICAgICk7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICByZXR1cm4gYXdhaXQgZm4oKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgaWYgKFxuICAgICAgICB0aW1lclNjb3BlICYmXG4gICAgICAgICF0aW1lclNjb3BlLmNvbnNpZGVyZWRDYW5jZWxsZWQgJiZcbiAgICAgICAgZ2V0QWN0aXZhdG9yKCkuaGFzRmxhZyhTZGtGbGFncy5Ob25DYW5jZWxsYWJsZVNjb3Blc0FyZVNoaWVsZGVkRnJvbVByb3BhZ2F0aW9uKVxuICAgICAgKSB7XG4gICAgICAgIHRpbWVyU2NvcGUuY2FuY2VsKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlcXVlc3QgdG8gY2FuY2VsIHRoZSBzY29wZSBhbmQgbGlua2VkIGNoaWxkcmVuXG4gICAqL1xuICBjYW5jZWwoKTogdm9pZCB7XG4gICAgdGhpcy5yZWplY3QobmV3IENhbmNlbGxlZEZhaWx1cmUoJ0NhbmNlbGxhdGlvbiBzY29wZSBjYW5jZWxsZWQnKSk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBjdXJyZW50IFwiYWN0aXZlXCIgc2NvcGVcbiAgICovXG4gIHN0YXRpYyBjdXJyZW50KCk6IENhbmNlbGxhdGlvblNjb3BlIHtcbiAgICAvLyBVc2luZyBnbG9iYWxzIGRpcmVjdGx5IGluc3RlYWQgb2YgYSBoZWxwZXIgZnVuY3Rpb24gdG8gYXZvaWQgY2lyY3VsYXIgaW1wb3J0XG4gICAgcmV0dXJuIHN0b3JhZ2UuZ2V0U3RvcmUoKSA/PyAoZ2xvYmFsVGhpcyBhcyBhbnkpLl9fVEVNUE9SQUxfQUNUSVZBVE9SX18ucm9vdFNjb3BlO1xuICB9XG5cbiAgLyoqIEFsaWFzIHRvIGBuZXcgQ2FuY2VsbGF0aW9uU2NvcGUoeyBjYW5jZWxsYWJsZTogdHJ1ZSB9KS5ydW4oZm4pYCAqL1xuICBzdGF0aWMgY2FuY2VsbGFibGU8VD4oZm46ICgpID0+IFByb21pc2U8VD4pOiBQcm9taXNlPFQ+IHtcbiAgICByZXR1cm4gbmV3IHRoaXMoeyBjYW5jZWxsYWJsZTogdHJ1ZSB9KS5ydW4oZm4pO1xuICB9XG5cbiAgLyoqIEFsaWFzIHRvIGBuZXcgQ2FuY2VsbGF0aW9uU2NvcGUoeyBjYW5jZWxsYWJsZTogZmFsc2UgfSkucnVuKGZuKWAgKi9cbiAgc3RhdGljIG5vbkNhbmNlbGxhYmxlPFQ+KGZuOiAoKSA9PiBQcm9taXNlPFQ+KTogUHJvbWlzZTxUPiB7XG4gICAgcmV0dXJuIG5ldyB0aGlzKHsgY2FuY2VsbGFibGU6IGZhbHNlIH0pLnJ1bihmbik7XG4gIH1cblxuICAvKiogQWxpYXMgdG8gYG5ldyBDYW5jZWxsYXRpb25TY29wZSh7IGNhbmNlbGxhYmxlOiB0cnVlLCB0aW1lb3V0IH0pLnJ1bihmbilgICovXG4gIHN0YXRpYyB3aXRoVGltZW91dDxUPih0aW1lb3V0OiBEdXJhdGlvbiwgZm46ICgpID0+IFByb21pc2U8VD4pOiBQcm9taXNlPFQ+IHtcbiAgICByZXR1cm4gbmV3IHRoaXMoeyBjYW5jZWxsYWJsZTogdHJ1ZSwgdGltZW91dCB9KS5ydW4oZm4pO1xuICB9XG59XG5cbmNvbnN0IHN0b3JhZ2UgPSBuZXcgQXN5bmNMb2NhbFN0b3JhZ2U8Q2FuY2VsbGF0aW9uU2NvcGU+KCk7XG5cbi8qKlxuICogQXZvaWQgZXhwb3NpbmcgdGhlIHN0b3JhZ2UgZGlyZWN0bHkgc28gaXQgZG9lc24ndCBnZXQgZnJvemVuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkaXNhYmxlU3RvcmFnZSgpOiB2b2lkIHtcbiAgc3RvcmFnZS5kaXNhYmxlKCk7XG59XG5cbmV4cG9ydCBjbGFzcyBSb290Q2FuY2VsbGF0aW9uU2NvcGUgZXh0ZW5kcyBDYW5jZWxsYXRpb25TY29wZSB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKHsgY2FuY2VsbGFibGU6IHRydWUsIHBhcmVudDogTk9fUEFSRU5UIH0pO1xuICB9XG5cbiAgY2FuY2VsKCk6IHZvaWQge1xuICAgIHRoaXMucmVqZWN0KG5ldyBDYW5jZWxsZWRGYWlsdXJlKCdXb3JrZmxvdyBjYW5jZWxsZWQnKSk7XG4gIH1cbn1cblxuLyoqIFRoaXMgZnVuY3Rpb24gaXMgaGVyZSB0byBhdm9pZCBhIGNpcmN1bGFyIGRlcGVuZGVuY3kgYmV0d2VlbiB0aGlzIG1vZHVsZSBhbmQgd29ya2Zsb3cudHMgKi9cbmxldCBzbGVlcCA9IChfOiBEdXJhdGlvbik6IFByb21pc2U8dm9pZD4gPT4ge1xuICB0aHJvdyBuZXcgSWxsZWdhbFN0YXRlRXJyb3IoJ1dvcmtmbG93IGhhcyBub3QgYmVlbiBwcm9wZXJseSBpbml0aWFsaXplZCcpO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIHJlZ2lzdGVyU2xlZXBJbXBsZW1lbnRhdGlvbihmbjogdHlwZW9mIHNsZWVwKTogdm9pZCB7XG4gIHNsZWVwID0gZm47XG59XG4iLCJpbXBvcnQgeyBBY3Rpdml0eUZhaWx1cmUsIENhbmNlbGxlZEZhaWx1cmUsIENoaWxkV29ya2Zsb3dGYWlsdXJlIH0gZnJvbSAnQHRlbXBvcmFsaW8vY29tbW9uJztcbmltcG9ydCB7IFN5bWJvbEJhc2VkSW5zdGFuY2VPZkVycm9yIH0gZnJvbSAnQHRlbXBvcmFsaW8vY29tbW9uL2xpYi90eXBlLWhlbHBlcnMnO1xuaW1wb3J0IHsgY29yZXNkayB9IGZyb20gJ0B0ZW1wb3JhbGlvL3Byb3RvJztcblxuLyoqXG4gKiBCYXNlIGNsYXNzIGZvciBhbGwgd29ya2Zsb3cgZXJyb3JzXG4gKi9cbkBTeW1ib2xCYXNlZEluc3RhbmNlT2ZFcnJvcignV29ya2Zsb3dFcnJvcicpXG5leHBvcnQgY2xhc3MgV29ya2Zsb3dFcnJvciBleHRlbmRzIEVycm9yIHt9XG5cbi8qKlxuICogVGhyb3duIGluIHdvcmtmbG93IHdoZW4gaXQgdHJpZXMgdG8gZG8gc29tZXRoaW5nIHRoYXQgbm9uLWRldGVybWluaXN0aWMgc3VjaCBhcyBjb25zdHJ1Y3QgYSBXZWFrUmVmKClcbiAqL1xuQFN5bWJvbEJhc2VkSW5zdGFuY2VPZkVycm9yKCdEZXRlcm1pbmlzbVZpb2xhdGlvbkVycm9yJylcbmV4cG9ydCBjbGFzcyBEZXRlcm1pbmlzbVZpb2xhdGlvbkVycm9yIGV4dGVuZHMgV29ya2Zsb3dFcnJvciB7fVxuXG4vKipcbiAqIEEgY2xhc3MgdGhhdCBhY3RzIGFzIGEgbWFya2VyIGZvciB0aGlzIHNwZWNpYWwgcmVzdWx0IHR5cGVcbiAqL1xuQFN5bWJvbEJhc2VkSW5zdGFuY2VPZkVycm9yKCdMb2NhbEFjdGl2aXR5RG9CYWNrb2ZmJylcbmV4cG9ydCBjbGFzcyBMb2NhbEFjdGl2aXR5RG9CYWNrb2ZmIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgcmVhZG9ubHkgYmFja29mZjogY29yZXNkay5hY3Rpdml0eV9yZXN1bHQuSURvQmFja29mZikge1xuICAgIHN1cGVyKCk7XG4gIH1cbn1cblxuLyoqXG4gKiBSZXR1cm5zIHdoZXRoZXIgcHJvdmlkZWQgYGVycmAgaXMgY2F1c2VkIGJ5IGNhbmNlbGxhdGlvblxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNDYW5jZWxsYXRpb24oZXJyOiB1bmtub3duKTogYm9vbGVhbiB7XG4gIHJldHVybiAoXG4gICAgZXJyIGluc3RhbmNlb2YgQ2FuY2VsbGVkRmFpbHVyZSB8fFxuICAgICgoZXJyIGluc3RhbmNlb2YgQWN0aXZpdHlGYWlsdXJlIHx8IGVyciBpbnN0YW5jZW9mIENoaWxkV29ya2Zsb3dGYWlsdXJlKSAmJiBlcnIuY2F1c2UgaW5zdGFuY2VvZiBDYW5jZWxsZWRGYWlsdXJlKVxuICApO1xufVxuIiwiaW1wb3J0IHR5cGUgeyBXb3JrZmxvd0luZm8gfSBmcm9tICcuL2ludGVyZmFjZXMnO1xuXG5leHBvcnQgdHlwZSBTZGtGbGFnID0ge1xuICBnZXQgaWQoKTogbnVtYmVyO1xuICBnZXQgZGVmYXVsdCgpOiBib29sZWFuO1xuICBnZXQgYWx0ZXJuYXRpdmVDb25kaXRpb25zKCk6IEFsdENvbmRpdGlvbkZuW10gfCB1bmRlZmluZWQ7XG59O1xuXG5jb25zdCBmbGFnc1JlZ2lzdHJ5OiBNYXA8bnVtYmVyLCBTZGtGbGFnPiA9IG5ldyBNYXAoKTtcblxuZXhwb3J0IGNvbnN0IFNka0ZsYWdzID0ge1xuICAvKipcbiAgICogVGhpcyBmbGFnIGdhdGVzIG11bHRpcGxlIGZpeGVzIHJlbGF0ZWQgdG8gY2FuY2VsbGF0aW9uIHNjb3BlcyBhbmQgdGltZXJzIGludHJvZHVjZWQgaW4gMS4xMC4yLzEuMTEuMDpcbiAgICogLSBDYW5jZWxsYXRpb24gb2YgYSBub24tY2FuY2VsbGFibGUgc2NvcGUgbm8gbG9uZ2VyIHByb3BhZ2F0ZXMgdG8gY2hpbGRyZW4gc2NvcGVzXG4gICAqICAgKHNlZSBodHRwczovL2dpdGh1Yi5jb20vdGVtcG9yYWxpby9zZGstdHlwZXNjcmlwdC9pc3N1ZXMvMTQyMykuXG4gICAqIC0gQ2FuY2VsbGF0aW9uU2NvcGUud2l0aFRpbWVvdXQoZm4pIG5vdyBjYW5jZWwgdGhlIHRpbWVyIGlmIGBmbmAgY29tcGxldGVzIGJlZm9yZSBleHBpcmF0aW9uXG4gICAqICAgb2YgdGhlIHRpbWVvdXQsIHNpbWlsYXIgdG8gaG93IGBjb25kaXRpb24oZm4sIHRpbWVvdXQpYCB3b3Jrcy5cbiAgICogLSBUaW1lcnMgY3JlYXRlZCB1c2luZyBzZXRUaW1lb3V0IGNhbiBub3cgYmUgaW50ZXJjZXB0ZWQuXG4gICAqXG4gICAqIEBzaW5jZSBJbnRyb2R1Y2VkIGluIDEuMTAuMi8xLjExLjAuIEhvd2V2ZXIsIGR1ZSB0byBhbiBTREsgYnVnLCBTREtzIHYxLjExLjAgYW5kIHYxLjExLjEgd2VyZSBub3RcbiAgICogICAgICAgIHByb3Blcmx5IHdyaXRpbmcgYmFjayB0aGUgZmxhZ3MgdG8gaGlzdG9yeSwgcG9zc2libHkgcmVzdWx0aW5nIGluIE5ERSBvbiByZXBsYXkuIFdlIHRoZXJlZm9yZVxuICAgKiAgICAgICAgY29uc2lkZXIgdGhhdCBhIFdGVCBlbWl0dGVkIGJ5IFdvcmtlciB2MS4xMS4wIG9yIHYxLjExLjEgdG8gaW1wbGljaXRseSBoYXZlIHRoaXMgZmxhZyBvbi5cbiAgICovXG4gIE5vbkNhbmNlbGxhYmxlU2NvcGVzQXJlU2hpZWxkZWRGcm9tUHJvcGFnYXRpb246IGRlZmluZUZsYWcoMSwgdHJ1ZSwgW2J1aWxkSWRTZGtWZXJzaW9uTWF0Y2hlcygvMVxcLjExXFwuWzAxXS8pXSksXG5cbiAgLyoqXG4gICAqIFByaW9yIHRvIDEuMTEuMCwgd2hlbiBwcm9jZXNzaW5nIGEgV29ya2Zsb3cgYWN0aXZhdGlvbiwgdGhlIFNESyB3b3VsZCBleGVjdXRlIGBub3RpZnlIYXNQYXRjaGBcbiAgICogYW5kIGBzaWduYWxXb3JrZmxvd2Agam9icyBpbiBkaXN0aW5jdCBwaGFzZXMsIGJlZm9yZSBvdGhlciB0eXBlcyBvZiBqb2JzLiBUaGUgcHJpbWFyeSByZWFzb25cbiAgICogYmVoaW5kIHRoYXQgbXVsdGktcGhhc2UgYWxnb3JpdGhtIHdhcyB0byBhdm9pZCB0aGUgcG9zc2liaWxpdHkgdGhhdCBhIFdvcmtmbG93IGV4ZWN1dGlvbiBtaWdodFxuICAgKiBjb21wbGV0ZSBiZWZvcmUgYWxsIGluY29taW5nIHNpZ25hbHMgaGF2ZSBiZWVuIGRpc3BhdGNoZWQgKGF0IGxlYXN0IHRvIHRoZSBwb2ludCB0aGF0IHRoZVxuICAgKiBfc3luY2hyb25vdXNfIHBhcnQgb2YgdGhlIGhhbmRsZXIgZnVuY3Rpb24gaGFzIGJlZW4gZXhlY3V0ZWQpLlxuICAgKlxuICAgKiBUaGlzIGZsYWcgcmVwbGFjZXMgdGhhdCBtdWx0aS1waGFzZSBhbGdvcml0aG0gd2l0aCBhIHNpbXBsZXIgb25lIHdoZXJlIGpvYnMgYXJlIHNpbXBseSBzb3J0ZWQgYXNcbiAgICogYChzaWduYWxzIGFuZCB1cGRhdGVzKSAtPiBvdGhlcnNgLCBidXQgd2l0aG91dCBwcm9jZXNzaW5nIHRoZW0gYXMgZGlzdGluY3QgYmF0Y2hlcyAoaS5lLiB3aXRob3V0XG4gICAqIGxlYXZpbmcvcmVlbnRlcmluZyB0aGUgVk0gY29udGV4dCBiZXR3ZWVuIGVhY2ggZ3JvdXAsIHdoaWNoIGF1dG9tYXRpY2FsbHkgdHJpZ2dlcnMgdGhlIGV4ZWN1dGlvblxuICAgKiBvZiBhbGwgb3V0c3RhbmRpbmcgbWljcm90YXNrcykuIFRoYXQgc2luZ2xlLXBoYXNlIGFwcHJvYWNoIHJlc29sdmVzIGEgbnVtYmVyIG9mIHF1aXJrcyBvZiB0aGVcbiAgICogZm9ybWVyIGFsZ29yaXRobSwgYW5kIHlldCBzdGlsbCBzYXRpc2ZpZXMgdG8gdGhlIG9yaWdpbmFsIHJlcXVpcmVtZW50IG9mIGVuc3VyaW5nIHRoYXQgZXZlcnlcbiAgICogYHNpZ25hbFdvcmtmbG93YCBqb2JzIC0gYW5kIG5vdyBgZG9VcGRhdGVgIGpvYnMgYXMgd2VsbCAtIGhhdmUgYmVlbiBnaXZlbiBhIHByb3BlciBjaGFuY2UgdG9cbiAgICogZXhlY3V0ZSBiZWZvcmUgdGhlIFdvcmtmbG93IG1haW4gZnVuY3Rpb24gbWlnaHQgY29tcGxldGVzLlxuICAgKlxuICAgKiBAc2luY2UgSW50cm9kdWNlZCBpbiAxLjExLjAuIFRoaXMgY2hhbmdlIGlzIG5vdCByb2xsYmFjay1zYWZlLiBIb3dldmVyLCBkdWUgdG8gYW4gU0RLIGJ1ZywgU0RLc1xuICAgKiAgICAgICAgdjEuMTEuMCBhbmQgdjEuMTEuMSB3ZXJlIG5vdCBwcm9wZXJseSB3cml0aW5nIGJhY2sgdGhlIGZsYWdzIHRvIGhpc3RvcnksIHBvc3NpYmx5IHJlc3VsdGluZ1xuICAgKiAgICAgICAgaW4gTkRFIG9uIHJlcGxheS4gV2UgdGhlcmVmb3JlIGNvbnNpZGVyIHRoYXQgYSBXRlQgZW1pdHRlZCBieSBXb3JrZXIgdjEuMTEuMCBvciB2MS4xMS4xXG4gICAqICAgICAgICB0byBpbXBsaWNpdGVseSBoYXZlIHRoaXMgZmxhZyBvbi5cbiAgICovXG4gIFByb2Nlc3NXb3JrZmxvd0FjdGl2YXRpb25Kb2JzQXNTaW5nbGVCYXRjaDogZGVmaW5lRmxhZygyLCB0cnVlLCBbYnVpbGRJZFNka1ZlcnNpb25NYXRjaGVzKC8xXFwuMTFcXC5bMDFdLyldKSxcbn0gYXMgY29uc3Q7XG5cbmZ1bmN0aW9uIGRlZmluZUZsYWcoaWQ6IG51bWJlciwgZGVmOiBib29sZWFuLCBhbHRlcm5hdGl2ZUNvbmRpdGlvbnM/OiBBbHRDb25kaXRpb25GbltdKTogU2RrRmxhZyB7XG4gIGNvbnN0IGZsYWcgPSB7IGlkLCBkZWZhdWx0OiBkZWYsIGFsdGVybmF0aXZlQ29uZGl0aW9ucyB9O1xuICBmbGFnc1JlZ2lzdHJ5LnNldChpZCwgZmxhZyk7XG4gIHJldHVybiBmbGFnO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYXNzZXJ0VmFsaWRGbGFnKGlkOiBudW1iZXIpOiB2b2lkIHtcbiAgaWYgKCFmbGFnc1JlZ2lzdHJ5LmhhcyhpZCkpIHRocm93IG5ldyBUeXBlRXJyb3IoYFVua25vd24gU0RLIGZsYWc6ICR7aWR9YCk7XG59XG5cbi8qKlxuICogQW4gU0RLIEZsYWcgQWx0ZXJuYXRlIENvbmRpdGlvbiBwcm92aWRlcyBhbiBhbHRlcm5hdGl2ZSB3YXkgb2YgZGV0ZXJtaW5pbmcgd2hldGhlciBhIGZsYWdcbiAqIHNob3VsZCBiZSBjb25zaWRlcmVkIGFzIGVuYWJsZWQgZm9yIHRoZSBjdXJyZW50IFdGVDsgZS5nLiBieSBsb29raW5nIGF0IHRoZSB2ZXJzaW9uIG9mIHRoZSBTREtcbiAqIHRoYXQgZW1pdHRlZCBhIFdGVC4gVGhlIG1haW4gdXNlIGNhc2UgZm9yIHRoaXMgaXMgdG8gcmV0cm9hY3RpdmVseSB0dXJuIG9uIHNvbWUgZmxhZ3MgZm9yIFdGVFxuICogZW1pdHRlZCBieSBwcmV2aW91cyBTREtzIHRoYXQgY29udGFpbmVkIGEgYnVnLlxuICpcbiAqIE5vdGUgdGhhdCBjb25kaXRpb25zIGFyZSBvbmx5IGV2YWx1YXRlZCB3aGlsZSByZXBsYXlpbmcsIGFuZCBvbmx5IGlmIHRoZSBjb3JyZXNwb25pbmcgZmxhZyBpc1xuICogbm90IGFscmVhZHkgc2V0LiBBbHNvLCBhbHRlcm5hdGUgY29uZGl0aW9ucyB3aWxsIG5vdCBjYXVzZSB0aGUgZmxhZyB0byBiZSBwZXJzaXN0ZWQgdG8gdGhlXG4gKiBcInVzZWQgZmxhZ3NcIiBzZXQsIHdoaWNoIG1lYW5zIHRoYXQgZnVydGhlciBXb3JrZmxvdyBUYXNrcyBtYXkgbm90IHJlZmxlY3QgdGhpcyBmbGFnIGlmIHRoZVxuICogY29uZGl0aW9uIG5vIGxvbmdlciBob2xkcy4gVGhpcyBpcyBzbyB0byBhdm9pZCBpbmNvcnJlY3QgYmVoYXZpb3JzIGluIGNhc2Ugd2hlcmUgYSBXb3JrZmxvd1xuICogRXhlY3V0aW9uIGhhcyBnb25lIHRocm91Z2ggYSBuZXdlciBTREsgdmVyc2lvbiB0aGVuIGFnYWluIHRocm91Z2ggYW4gb2xkZXIgb25lLlxuICovXG50eXBlIEFsdENvbmRpdGlvbkZuID0gKGN0eDogeyBpbmZvOiBXb3JrZmxvd0luZm8gfSkgPT4gYm9vbGVhbjtcblxuZnVuY3Rpb24gYnVpbGRJZFNka1ZlcnNpb25NYXRjaGVzKHZlcnNpb246IFJlZ0V4cCk6IEFsdENvbmRpdGlvbkZuIHtcbiAgY29uc3QgcmVnZXggPSBuZXcgUmVnRXhwKGBeQHRlbXBvcmFsaW8vd29ya2VyQCgke3ZlcnNpb24uc291cmNlfSlbK11gKTtcbiAgcmV0dXJuICh7IGluZm8gfSkgPT4gaW5mby5jdXJyZW50QnVpbGRJZCAhPSBudWxsICYmIHJlZ2V4LnRlc3QoaW5mby5jdXJyZW50QnVpbGRJZCk7XG59XG4iLCJpbXBvcnQgeyBJbGxlZ2FsU3RhdGVFcnJvciB9IGZyb20gJ0B0ZW1wb3JhbGlvL2NvbW1vbic7XG5pbXBvcnQgeyB0eXBlIEFjdGl2YXRvciB9IGZyb20gJy4vaW50ZXJuYWxzJztcblxuZXhwb3J0IGZ1bmN0aW9uIG1heWJlR2V0QWN0aXZhdG9yVW50eXBlZCgpOiB1bmtub3duIHtcbiAgcmV0dXJuIChnbG9iYWxUaGlzIGFzIGFueSkuX19URU1QT1JBTF9BQ1RJVkFUT1JfXztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldEFjdGl2YXRvclVudHlwZWQoYWN0aXZhdG9yOiB1bmtub3duKTogdm9pZCB7XG4gIChnbG9iYWxUaGlzIGFzIGFueSkuX19URU1QT1JBTF9BQ1RJVkFUT1JfXyA9IGFjdGl2YXRvcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1heWJlR2V0QWN0aXZhdG9yKCk6IEFjdGl2YXRvciB8IHVuZGVmaW5lZCB7XG4gIHJldHVybiBtYXliZUdldEFjdGl2YXRvclVudHlwZWQoKSBhcyBBY3RpdmF0b3IgfCB1bmRlZmluZWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhc3NlcnRJbldvcmtmbG93Q29udGV4dChtZXNzYWdlOiBzdHJpbmcpOiBBY3RpdmF0b3Ige1xuICBjb25zdCBhY3RpdmF0b3IgPSBtYXliZUdldEFjdGl2YXRvcigpO1xuICBpZiAoYWN0aXZhdG9yID09IG51bGwpIHRocm93IG5ldyBJbGxlZ2FsU3RhdGVFcnJvcihtZXNzYWdlKTtcbiAgcmV0dXJuIGFjdGl2YXRvcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEFjdGl2YXRvcigpOiBBY3RpdmF0b3Ige1xuICBjb25zdCBhY3RpdmF0b3IgPSBtYXliZUdldEFjdGl2YXRvcigpO1xuICBpZiAoYWN0aXZhdG9yID09PSB1bmRlZmluZWQpIHtcbiAgICB0aHJvdyBuZXcgSWxsZWdhbFN0YXRlRXJyb3IoJ1dvcmtmbG93IHVuaW5pdGlhbGl6ZWQnKTtcbiAgfVxuICByZXR1cm4gYWN0aXZhdG9yO1xufVxuIiwiLyoqXG4gKiBPdmVycmlkZXMgc29tZSBnbG9iYWwgb2JqZWN0cyB0byBtYWtlIHRoZW0gZGV0ZXJtaW5pc3RpYy5cbiAqXG4gKiBAbW9kdWxlXG4gKi9cbmltcG9ydCB7IG1zVG9UcyB9IGZyb20gJ0B0ZW1wb3JhbGlvL2NvbW1vbi9saWIvdGltZSc7XG5pbXBvcnQgeyBDYW5jZWxsYXRpb25TY29wZSB9IGZyb20gJy4vY2FuY2VsbGF0aW9uLXNjb3BlJztcbmltcG9ydCB7IERldGVybWluaXNtVmlvbGF0aW9uRXJyb3IgfSBmcm9tICcuL2Vycm9ycyc7XG5pbXBvcnQgeyBnZXRBY3RpdmF0b3IgfSBmcm9tICcuL2dsb2JhbC1hdHRyaWJ1dGVzJztcbmltcG9ydCB7IFNka0ZsYWdzIH0gZnJvbSAnLi9mbGFncyc7XG5pbXBvcnQgeyBzbGVlcCB9IGZyb20gJy4vd29ya2Zsb3cnO1xuaW1wb3J0IHsgdW50cmFja1Byb21pc2UgfSBmcm9tICcuL3N0YWNrLWhlbHBlcnMnO1xuXG5jb25zdCBnbG9iYWwgPSBnbG9iYWxUaGlzIGFzIGFueTtcbmNvbnN0IE9yaWdpbmFsRGF0ZSA9IGdsb2JhbFRoaXMuRGF0ZTtcblxuZXhwb3J0IGZ1bmN0aW9uIG92ZXJyaWRlR2xvYmFscygpOiB2b2lkIHtcbiAgLy8gTW9jayBhbnkgd2VhayByZWZlcmVuY2UgYmVjYXVzZSBHQyBpcyBub24tZGV0ZXJtaW5pc3RpYyBhbmQgdGhlIGVmZmVjdCBpcyBvYnNlcnZhYmxlIGZyb20gdGhlIFdvcmtmbG93LlxuICAvLyBXb3JrZmxvdyBkZXZlbG9wZXIgd2lsbCBnZXQgYSBtZWFuaW5nZnVsIGV4Y2VwdGlvbiBpZiB0aGV5IHRyeSB0byB1c2UgdGhlc2UuXG4gIGdsb2JhbC5XZWFrUmVmID0gZnVuY3Rpb24gKCkge1xuICAgIHRocm93IG5ldyBEZXRlcm1pbmlzbVZpb2xhdGlvbkVycm9yKCdXZWFrUmVmIGNhbm5vdCBiZSB1c2VkIGluIFdvcmtmbG93cyBiZWNhdXNlIHY4IEdDIGlzIG5vbi1kZXRlcm1pbmlzdGljJyk7XG4gIH07XG4gIGdsb2JhbC5GaW5hbGl6YXRpb25SZWdpc3RyeSA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aHJvdyBuZXcgRGV0ZXJtaW5pc21WaW9sYXRpb25FcnJvcihcbiAgICAgICdGaW5hbGl6YXRpb25SZWdpc3RyeSBjYW5ub3QgYmUgdXNlZCBpbiBXb3JrZmxvd3MgYmVjYXVzZSB2OCBHQyBpcyBub24tZGV0ZXJtaW5pc3RpYydcbiAgICApO1xuICB9O1xuXG4gIGdsb2JhbC5EYXRlID0gZnVuY3Rpb24gKC4uLmFyZ3M6IHVua25vd25bXSkge1xuICAgIGlmIChhcmdzLmxlbmd0aCA+IDApIHtcbiAgICAgIHJldHVybiBuZXcgKE9yaWdpbmFsRGF0ZSBhcyBhbnkpKC4uLmFyZ3MpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IE9yaWdpbmFsRGF0ZShnZXRBY3RpdmF0b3IoKS5ub3cpO1xuICB9O1xuXG4gIGdsb2JhbC5EYXRlLm5vdyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZ2V0QWN0aXZhdG9yKCkubm93O1xuICB9O1xuXG4gIGdsb2JhbC5EYXRlLnBhcnNlID0gT3JpZ2luYWxEYXRlLnBhcnNlLmJpbmQoT3JpZ2luYWxEYXRlKTtcbiAgZ2xvYmFsLkRhdGUuVVRDID0gT3JpZ2luYWxEYXRlLlVUQy5iaW5kKE9yaWdpbmFsRGF0ZSk7XG5cbiAgZ2xvYmFsLkRhdGUucHJvdG90eXBlID0gT3JpZ2luYWxEYXRlLnByb3RvdHlwZTtcblxuICBjb25zdCB0aW1lb3V0Q2FuY2VsYXRpb25TY29wZXMgPSBuZXcgTWFwPG51bWJlciwgQ2FuY2VsbGF0aW9uU2NvcGU+KCk7XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBtcyBzbGVlcCBkdXJhdGlvbiAtICBudW1iZXIgb2YgbWlsbGlzZWNvbmRzLiBJZiBnaXZlbiBhIG5lZ2F0aXZlIG51bWJlciwgdmFsdWUgd2lsbCBiZSBzZXQgdG8gMS5cbiAgICovXG4gIGdsb2JhbC5zZXRUaW1lb3V0ID0gZnVuY3Rpb24gKGNiOiAoLi4uYXJnczogYW55W10pID0+IGFueSwgbXM6IG51bWJlciwgLi4uYXJnczogYW55W10pOiBudW1iZXIge1xuICAgIG1zID0gTWF0aC5tYXgoMSwgbXMpO1xuICAgIGNvbnN0IGFjdGl2YXRvciA9IGdldEFjdGl2YXRvcigpO1xuICAgIGlmIChhY3RpdmF0b3IuaGFzRmxhZyhTZGtGbGFncy5Ob25DYW5jZWxsYWJsZVNjb3Blc0FyZVNoaWVsZGVkRnJvbVByb3BhZ2F0aW9uKSkge1xuICAgICAgLy8gQ2FwdHVyZSB0aGUgc2VxdWVuY2UgbnVtYmVyIHRoYXQgc2xlZXAgd2lsbCBhbGxvY2F0ZVxuICAgICAgY29uc3Qgc2VxID0gYWN0aXZhdG9yLm5leHRTZXFzLnRpbWVyO1xuICAgICAgY29uc3QgdGltZXJTY29wZSA9IG5ldyBDYW5jZWxsYXRpb25TY29wZSh7IGNhbmNlbGxhYmxlOiB0cnVlIH0pO1xuICAgICAgY29uc3Qgc2xlZXBQcm9taXNlID0gdGltZXJTY29wZS5ydW4oKCkgPT4gc2xlZXAobXMpKTtcbiAgICAgIHNsZWVwUHJvbWlzZS50aGVuKFxuICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgdGltZW91dENhbmNlbGF0aW9uU2NvcGVzLmRlbGV0ZShzZXEpO1xuICAgICAgICAgIGNiKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgdGltZW91dENhbmNlbGF0aW9uU2NvcGVzLmRlbGV0ZShzZXEpO1xuICAgICAgICB9XG4gICAgICApO1xuICAgICAgdW50cmFja1Byb21pc2Uoc2xlZXBQcm9taXNlKTtcbiAgICAgIHRpbWVvdXRDYW5jZWxhdGlvblNjb3Blcy5zZXQoc2VxLCB0aW1lclNjb3BlKTtcbiAgICAgIHJldHVybiBzZXE7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHNlcSA9IGFjdGl2YXRvci5uZXh0U2Vxcy50aW1lcisrO1xuICAgICAgLy8gQ3JlYXRlIGEgUHJvbWlzZSBmb3IgQXN5bmNMb2NhbFN0b3JhZ2UgdG8gYmUgYWJsZSB0byB0cmFjayB0aGlzIGNvbXBsZXRpb24gdXNpbmcgcHJvbWlzZSBob29rcy5cbiAgICAgIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgYWN0aXZhdG9yLmNvbXBsZXRpb25zLnRpbWVyLnNldChzZXEsIHsgcmVzb2x2ZSwgcmVqZWN0IH0pO1xuICAgICAgICBhY3RpdmF0b3IucHVzaENvbW1hbmQoe1xuICAgICAgICAgIHN0YXJ0VGltZXI6IHtcbiAgICAgICAgICAgIHNlcSxcbiAgICAgICAgICAgIHN0YXJ0VG9GaXJlVGltZW91dDogbXNUb1RzKG1zKSxcbiAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICAgIH0pLnRoZW4oXG4gICAgICAgICgpID0+IGNiKC4uLmFyZ3MpLFxuICAgICAgICAoKSA9PiB1bmRlZmluZWQgLyogaWdub3JlIGNhbmNlbGxhdGlvbiAqL1xuICAgICAgKTtcbiAgICAgIHJldHVybiBzZXE7XG4gICAgfVxuICB9O1xuXG4gIGdsb2JhbC5jbGVhclRpbWVvdXQgPSBmdW5jdGlvbiAoaGFuZGxlOiBudW1iZXIpOiB2b2lkIHtcbiAgICBjb25zdCBhY3RpdmF0b3IgPSBnZXRBY3RpdmF0b3IoKTtcbiAgICBjb25zdCB0aW1lclNjb3BlID0gdGltZW91dENhbmNlbGF0aW9uU2NvcGVzLmdldChoYW5kbGUpO1xuICAgIGlmICh0aW1lclNjb3BlKSB7XG4gICAgICB0aW1lb3V0Q2FuY2VsYXRpb25TY29wZXMuZGVsZXRlKGhhbmRsZSk7XG4gICAgICB0aW1lclNjb3BlLmNhbmNlbCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBhY3RpdmF0b3IubmV4dFNlcXMudGltZXIrKzsgLy8gU2hvdWxkbid0IGluY3JlYXNlIHNlcSBudW1iZXIsIGJ1dCB0aGF0J3MgdGhlIGxlZ2FjeSBiZWhhdmlvclxuICAgICAgYWN0aXZhdG9yLmNvbXBsZXRpb25zLnRpbWVyLmRlbGV0ZShoYW5kbGUpO1xuICAgICAgYWN0aXZhdG9yLnB1c2hDb21tYW5kKHtcbiAgICAgICAgY2FuY2VsVGltZXI6IHtcbiAgICAgICAgICBzZXE6IGhhbmRsZSxcbiAgICAgICAgfSxcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcblxuICAvLyBhY3RpdmF0b3IucmFuZG9tIGlzIG11dGFibGUsIGRvbid0IGhhcmRjb2RlIGl0cyByZWZlcmVuY2VcbiAgTWF0aC5yYW5kb20gPSAoKSA9PiBnZXRBY3RpdmF0b3IoKS5yYW5kb20oKTtcbn1cbiIsIi8qKlxuICogVGhpcyBsaWJyYXJ5IHByb3ZpZGVzIHRvb2xzIHJlcXVpcmVkIGZvciBhdXRob3Jpbmcgd29ya2Zsb3dzLlxuICpcbiAqICMjIFVzYWdlXG4gKiBTZWUgdGhlIHtAbGluayBodHRwczovL2RvY3MudGVtcG9yYWwuaW8vdHlwZXNjcmlwdC9oZWxsby13b3JsZCN3b3JrZmxvd3MgfCB0dXRvcmlhbH0gZm9yIHdyaXRpbmcgeW91ciBmaXJzdCB3b3JrZmxvdy5cbiAqXG4gKiAjIyMgVGltZXJzXG4gKlxuICogVGhlIHJlY29tbWVuZGVkIHdheSBvZiBzY2hlZHVsaW5nIHRpbWVycyBpcyBieSB1c2luZyB0aGUge0BsaW5rIHNsZWVwfSBmdW5jdGlvbi4gV2UndmUgcmVwbGFjZWQgYHNldFRpbWVvdXRgIGFuZFxuICogYGNsZWFyVGltZW91dGAgd2l0aCBkZXRlcm1pbmlzdGljIHZlcnNpb25zIHNvIHRoZXNlIGFyZSBhbHNvIHVzYWJsZSBidXQgaGF2ZSBhIGxpbWl0YXRpb24gdGhhdCB0aGV5IGRvbid0IHBsYXkgd2VsbFxuICogd2l0aCB7QGxpbmsgaHR0cHM6Ly9kb2NzLnRlbXBvcmFsLmlvL3R5cGVzY3JpcHQvY2FuY2VsbGF0aW9uLXNjb3BlcyB8IGNhbmNlbGxhdGlvbiBzY29wZXN9LlxuICpcbiAqIDwhLS1TTklQU1RBUlQgdHlwZXNjcmlwdC1zbGVlcC13b3JrZmxvdy0tPlxuICogPCEtLVNOSVBFTkQtLT5cbiAqXG4gKiAjIyMgQWN0aXZpdGllc1xuICpcbiAqIFRvIHNjaGVkdWxlIEFjdGl2aXRpZXMsIHVzZSB7QGxpbmsgcHJveHlBY3Rpdml0aWVzfSB0byBvYnRhaW4gYW4gQWN0aXZpdHkgZnVuY3Rpb24gYW5kIGNhbGwuXG4gKlxuICogPCEtLVNOSVBTVEFSVCB0eXBlc2NyaXB0LXNjaGVkdWxlLWFjdGl2aXR5LXdvcmtmbG93LS0+XG4gKiA8IS0tU05JUEVORC0tPlxuICpcbiAqICMjIyBVcGRhdGVzLCBTaWduYWxzIGFuZCBRdWVyaWVzXG4gKlxuICogVXNlIHtAbGluayBzZXRIYW5kbGVyfSB0byBzZXQgaGFuZGxlcnMgZm9yIFVwZGF0ZXMsIFNpZ25hbHMsIGFuZCBRdWVyaWVzLlxuICpcbiAqIFVwZGF0ZSBhbmQgU2lnbmFsIGhhbmRsZXJzIGNhbiBiZSBlaXRoZXIgYXN5bmMgb3Igbm9uLWFzeW5jIGZ1bmN0aW9ucy4gVXBkYXRlIGhhbmRsZXJzIG1heSByZXR1cm4gYSB2YWx1ZSwgYnV0IHNpZ25hbFxuICogaGFuZGxlcnMgbWF5IG5vdCAocmV0dXJuIGB2b2lkYCBvciBgUHJvbWlzZTx2b2lkPmApLiBZb3UgbWF5IHVzZSBBY3Rpdml0aWVzLCBUaW1lcnMsIGNoaWxkIFdvcmtmbG93cywgZXRjIGluIFVwZGF0ZVxuICogYW5kIFNpZ25hbCBoYW5kbGVycywgYnV0IHRoaXMgc2hvdWxkIGJlIGRvbmUgY2F1dGlvdXNseTogZm9yIGV4YW1wbGUsIG5vdGUgdGhhdCBpZiB5b3UgYXdhaXQgYXN5bmMgb3BlcmF0aW9ucyBzdWNoIGFzXG4gKiB0aGVzZSBpbiBhbiBVcGRhdGUgb3IgU2lnbmFsIGhhbmRsZXIsIHRoZW4geW91IGFyZSByZXNwb25zaWJsZSBmb3IgZW5zdXJpbmcgdGhhdCB0aGUgd29ya2Zsb3cgZG9lcyBub3QgY29tcGxldGUgZmlyc3QuXG4gKlxuICogUXVlcnkgaGFuZGxlcnMgbWF5ICoqbm90KiogYmUgYXN5bmMgZnVuY3Rpb25zLCBhbmQgbWF5ICoqbm90KiogbXV0YXRlIGFueSB2YXJpYWJsZXMgb3IgdXNlIEFjdGl2aXRpZXMsIFRpbWVycyxcbiAqIGNoaWxkIFdvcmtmbG93cywgZXRjLlxuICpcbiAqICMjIyMgSW1wbGVtZW50YXRpb25cbiAqXG4gKiA8IS0tU05JUFNUQVJUIHR5cGVzY3JpcHQtd29ya2Zsb3ctdXBkYXRlLXNpZ25hbC1xdWVyeS1leGFtcGxlLS0+XG4gKiA8IS0tU05JUEVORC0tPlxuICpcbiAqICMjIyBNb3JlXG4gKlxuICogLSBbRGV0ZXJtaW5pc3RpYyBidWlsdC1pbnNdKGh0dHBzOi8vZG9jcy50ZW1wb3JhbC5pby90eXBlc2NyaXB0L2RldGVybWluaXNtI3NvdXJjZXMtb2Ytbm9uLWRldGVybWluaXNtKVxuICogLSBbQ2FuY2VsbGF0aW9uIGFuZCBzY29wZXNdKGh0dHBzOi8vZG9jcy50ZW1wb3JhbC5pby90eXBlc2NyaXB0L2NhbmNlbGxhdGlvbi1zY29wZXMpXG4gKiAgIC0ge0BsaW5rIENhbmNlbGxhdGlvblNjb3BlfVxuICogICAtIHtAbGluayBUcmlnZ2VyfVxuICogLSBbU2lua3NdKGh0dHBzOi8vZG9jcy50ZW1wb3JhbC5pby9hcHBsaWNhdGlvbi1kZXZlbG9wbWVudC9vYnNlcnZhYmlsaXR5Lz9sYW5nPXRzI2xvZ2dpbmcpXG4gKiAgIC0ge0BsaW5rIFNpbmtzfVxuICpcbiAqIEBtb2R1bGVcbiAqL1xuXG5leHBvcnQge1xuICBBY3Rpdml0eUNhbmNlbGxhdGlvblR5cGUsXG4gIEFjdGl2aXR5RmFpbHVyZSxcbiAgQWN0aXZpdHlPcHRpb25zLFxuICBBcHBsaWNhdGlvbkZhaWx1cmUsXG4gIENhbmNlbGxlZEZhaWx1cmUsXG4gIENoaWxkV29ya2Zsb3dGYWlsdXJlLFxuICBkZWZhdWx0UGF5bG9hZENvbnZlcnRlcixcbiAgUGF5bG9hZENvbnZlcnRlcixcbiAgUmV0cnlQb2xpY3ksXG4gIHJvb3RDYXVzZSxcbiAgU2VydmVyRmFpbHVyZSxcbiAgVGVtcG9yYWxGYWlsdXJlLFxuICBUZXJtaW5hdGVkRmFpbHVyZSxcbiAgVGltZW91dEZhaWx1cmUsXG59IGZyb20gJ0B0ZW1wb3JhbGlvL2NvbW1vbic7XG5leHBvcnQgKiBmcm9tICdAdGVtcG9yYWxpby9jb21tb24vbGliL2Vycm9ycyc7XG5leHBvcnQge1xuICBBY3Rpdml0eUZ1bmN0aW9uLFxuICBBY3Rpdml0eUludGVyZmFjZSwgLy8gZXNsaW50LWRpc2FibGUtbGluZSBkZXByZWNhdGlvbi9kZXByZWNhdGlvblxuICBQYXlsb2FkLFxuICBRdWVyeURlZmluaXRpb24sXG4gIFNlYXJjaEF0dHJpYnV0ZXMsXG4gIFNlYXJjaEF0dHJpYnV0ZVZhbHVlLFxuICBTaWduYWxEZWZpbml0aW9uLFxuICBVbnR5cGVkQWN0aXZpdGllcyxcbiAgV29ya2Zsb3csXG4gIFdvcmtmbG93UXVlcnlUeXBlLFxuICBXb3JrZmxvd1Jlc3VsdFR5cGUsXG4gIFdvcmtmbG93UmV0dXJuVHlwZSxcbiAgV29ya2Zsb3dTaWduYWxUeXBlLFxufSBmcm9tICdAdGVtcG9yYWxpby9jb21tb24vbGliL2ludGVyZmFjZXMnO1xuZXhwb3J0ICogZnJvbSAnQHRlbXBvcmFsaW8vY29tbW9uL2xpYi93b3JrZmxvdy1oYW5kbGUnO1xuZXhwb3J0ICogZnJvbSAnQHRlbXBvcmFsaW8vY29tbW9uL2xpYi93b3JrZmxvdy1vcHRpb25zJztcbmV4cG9ydCB7IEFzeW5jTG9jYWxTdG9yYWdlLCBDYW5jZWxsYXRpb25TY29wZSwgQ2FuY2VsbGF0aW9uU2NvcGVPcHRpb25zIH0gZnJvbSAnLi9jYW5jZWxsYXRpb24tc2NvcGUnO1xuZXhwb3J0ICogZnJvbSAnLi9lcnJvcnMnO1xuZXhwb3J0ICogZnJvbSAnLi9pbnRlcmNlcHRvcnMnO1xuZXhwb3J0IHtcbiAgQ2hpbGRXb3JrZmxvd0NhbmNlbGxhdGlvblR5cGUsXG4gIENoaWxkV29ya2Zsb3dPcHRpb25zLFxuICBDb250aW51ZUFzTmV3LFxuICBDb250aW51ZUFzTmV3T3B0aW9ucyxcbiAgRW5oYW5jZWRTdGFja1RyYWNlLFxuICBTdGFja1RyYWNlRmlsZUxvY2F0aW9uLFxuICBTdGFja1RyYWNlRmlsZVNsaWNlLFxuICBQYXJlbnRDbG9zZVBvbGljeSxcbiAgUGFyZW50V29ya2Zsb3dJbmZvLFxuICBTdGFja1RyYWNlU0RLSW5mbyxcbiAgU3RhY2tUcmFjZSxcbiAgVW5zYWZlV29ya2Zsb3dJbmZvLFxuICBXb3JrZmxvd0luZm8sXG59IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5leHBvcnQgeyBwcm94eVNpbmtzLCBTaW5rLCBTaW5rQ2FsbCwgU2lua0Z1bmN0aW9uLCBTaW5rcyB9IGZyb20gJy4vc2lua3MnO1xuZXhwb3J0IHsgbG9nIH0gZnJvbSAnLi9sb2dzJztcbmV4cG9ydCB7IFRyaWdnZXIgfSBmcm9tICcuL3RyaWdnZXInO1xuZXhwb3J0ICogZnJvbSAnLi93b3JrZmxvdyc7XG5leHBvcnQgeyBDaGlsZFdvcmtmbG93SGFuZGxlLCBFeHRlcm5hbFdvcmtmbG93SGFuZGxlIH0gZnJvbSAnLi93b3JrZmxvdy1oYW5kbGUnO1xuXG4vLyBBbnl0aGluZyBiZWxvdyB0aGlzIGxpbmUgaXMgZGVwcmVjYXRlZFxuXG5leHBvcnQge1xuICAvKipcbiAgICogQGRlcHJlY2F0ZWQgRG8gbm90IHVzZSBMb2dnZXJTaW5rcyBkaXJlY3RseS4gVG8gbG9nIGZyb20gV29ya2Zsb3cgY29kZSwgdXNlIHRoZSBgbG9nYCBvYmplY3RcbiAgICogICAgICAgICAgICAgZXhwb3J0ZWQgYnkgdGhlIGBAdGVtcG9yYWxpby93b3JrZmxvd2AgcGFja2FnZS4gVG8gY2FwdHVyZSBsb2cgbWVzc2FnZXMgZW1pdHRlZFxuICAgKiAgICAgICAgICAgICBieSBXb3JrZmxvdyBjb2RlLCBzZXQgdGhlIHtAbGluayBSdW50aW1lLmxvZ2dlcn0gcHJvcGVydHkuXG4gICAqL1xuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgZGVwcmVjYXRpb24vZGVwcmVjYXRpb25cbiAgTG9nZ2VyU2lua3NEZXByZWNhdGVkIGFzIExvZ2dlclNpbmtzLFxufSBmcm9tICcuL2xvZ3MnO1xuIiwiLyoqXG4gKiBUeXBlIGRlZmluaXRpb25zIGFuZCBnZW5lcmljIGhlbHBlcnMgZm9yIGludGVyY2VwdG9ycy5cbiAqXG4gKiBUaGUgV29ya2Zsb3cgc3BlY2lmaWMgaW50ZXJjZXB0b3JzIGFyZSBkZWZpbmVkIGhlcmUuXG4gKlxuICogQG1vZHVsZVxuICovXG5cbmltcG9ydCB7IEFjdGl2aXR5T3B0aW9ucywgSGVhZGVycywgTG9jYWxBY3Rpdml0eU9wdGlvbnMsIE5leHQsIFRpbWVzdGFtcCwgV29ya2Zsb3dFeGVjdXRpb24gfSBmcm9tICdAdGVtcG9yYWxpby9jb21tb24nO1xuaW1wb3J0IHR5cGUgeyBjb3Jlc2RrIH0gZnJvbSAnQHRlbXBvcmFsaW8vcHJvdG8nO1xuaW1wb3J0IHsgQ2hpbGRXb3JrZmxvd09wdGlvbnNXaXRoRGVmYXVsdHMsIENvbnRpbnVlQXNOZXdPcHRpb25zIH0gZnJvbSAnLi9pbnRlcmZhY2VzJztcblxuZXhwb3J0IHsgTmV4dCwgSGVhZGVycyB9O1xuXG4vKiogSW5wdXQgZm9yIFdvcmtmbG93SW5ib3VuZENhbGxzSW50ZXJjZXB0b3IuZXhlY3V0ZSAqL1xuZXhwb3J0IGludGVyZmFjZSBXb3JrZmxvd0V4ZWN1dGVJbnB1dCB7XG4gIHJlYWRvbmx5IGFyZ3M6IHVua25vd25bXTtcbiAgcmVhZG9ubHkgaGVhZGVyczogSGVhZGVycztcbn1cblxuLyoqIElucHV0IGZvciBXb3JrZmxvd0luYm91bmRDYWxsc0ludGVyY2VwdG9yLmhhbmRsZVVwZGF0ZSBhbmRcbiAqIFdvcmtmbG93SW5ib3VuZENhbGxzSW50ZXJjZXB0b3IudmFsaWRhdGVVcGRhdGUgKi9cbmV4cG9ydCBpbnRlcmZhY2UgVXBkYXRlSW5wdXQge1xuICByZWFkb25seSB1cGRhdGVJZDogc3RyaW5nO1xuICByZWFkb25seSBuYW1lOiBzdHJpbmc7XG4gIHJlYWRvbmx5IGFyZ3M6IHVua25vd25bXTtcbiAgcmVhZG9ubHkgaGVhZGVyczogSGVhZGVycztcbn1cblxuLyoqIElucHV0IGZvciBXb3JrZmxvd0luYm91bmRDYWxsc0ludGVyY2VwdG9yLmhhbmRsZVNpZ25hbCAqL1xuZXhwb3J0IGludGVyZmFjZSBTaWduYWxJbnB1dCB7XG4gIHJlYWRvbmx5IHNpZ25hbE5hbWU6IHN0cmluZztcbiAgcmVhZG9ubHkgYXJnczogdW5rbm93bltdO1xuICByZWFkb25seSBoZWFkZXJzOiBIZWFkZXJzO1xufVxuXG4vKiogSW5wdXQgZm9yIFdvcmtmbG93SW5ib3VuZENhbGxzSW50ZXJjZXB0b3IuaGFuZGxlUXVlcnkgKi9cbmV4cG9ydCBpbnRlcmZhY2UgUXVlcnlJbnB1dCB7XG4gIHJlYWRvbmx5IHF1ZXJ5SWQ6IHN0cmluZztcbiAgcmVhZG9ubHkgcXVlcnlOYW1lOiBzdHJpbmc7XG4gIHJlYWRvbmx5IGFyZ3M6IHVua25vd25bXTtcbiAgcmVhZG9ubHkgaGVhZGVyczogSGVhZGVycztcbn1cblxuLyoqXG4gKiBJbXBsZW1lbnQgYW55IG9mIHRoZXNlIG1ldGhvZHMgdG8gaW50ZXJjZXB0IFdvcmtmbG93IGluYm91bmQgY2FsbHMgbGlrZSBleGVjdXRpb24sIGFuZCBzaWduYWwgYW5kIHF1ZXJ5IGhhbmRsaW5nLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFdvcmtmbG93SW5ib3VuZENhbGxzSW50ZXJjZXB0b3Ige1xuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gV29ya2Zsb3cgZXhlY3V0ZSBtZXRob2QgaXMgY2FsbGVkXG4gICAqXG4gICAqIEByZXR1cm4gcmVzdWx0IG9mIHRoZSBXb3JrZmxvdyBleGVjdXRpb25cbiAgICovXG4gIGV4ZWN1dGU/OiAoaW5wdXQ6IFdvcmtmbG93RXhlY3V0ZUlucHV0LCBuZXh0OiBOZXh0PHRoaXMsICdleGVjdXRlJz4pID0+IFByb21pc2U8dW5rbm93bj47XG5cbiAgLyoqIENhbGxlZCB3aGVuIFVwZGF0ZSBoYW5kbGVyIGlzIGNhbGxlZFxuICAgKlxuICAgKiBAcmV0dXJuIHJlc3VsdCBvZiB0aGUgVXBkYXRlXG4gICAqL1xuICBoYW5kbGVVcGRhdGU/OiAoaW5wdXQ6IFVwZGF0ZUlucHV0LCBuZXh0OiBOZXh0PHRoaXMsICdoYW5kbGVVcGRhdGUnPikgPT4gUHJvbWlzZTx1bmtub3duPjtcblxuICAvKiogQ2FsbGVkIHdoZW4gdXBkYXRlIHZhbGlkYXRvciBjYWxsZWQgKi9cbiAgdmFsaWRhdGVVcGRhdGU/OiAoaW5wdXQ6IFVwZGF0ZUlucHV0LCBuZXh0OiBOZXh0PHRoaXMsICd2YWxpZGF0ZVVwZGF0ZSc+KSA9PiB2b2lkO1xuXG4gIC8qKiBDYWxsZWQgd2hlbiBzaWduYWwgaXMgZGVsaXZlcmVkIHRvIGEgV29ya2Zsb3cgZXhlY3V0aW9uICovXG4gIGhhbmRsZVNpZ25hbD86IChpbnB1dDogU2lnbmFsSW5wdXQsIG5leHQ6IE5leHQ8dGhpcywgJ2hhbmRsZVNpZ25hbCc+KSA9PiBQcm9taXNlPHZvaWQ+O1xuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiBhIFdvcmtmbG93IGlzIHF1ZXJpZWRcbiAgICpcbiAgICogQHJldHVybiByZXN1bHQgb2YgdGhlIHF1ZXJ5XG4gICAqL1xuICBoYW5kbGVRdWVyeT86IChpbnB1dDogUXVlcnlJbnB1dCwgbmV4dDogTmV4dDx0aGlzLCAnaGFuZGxlUXVlcnknPikgPT4gUHJvbWlzZTx1bmtub3duPjtcbn1cblxuLyoqIElucHV0IGZvciBXb3JrZmxvd091dGJvdW5kQ2FsbHNJbnRlcmNlcHRvci5zY2hlZHVsZUFjdGl2aXR5ICovXG5leHBvcnQgaW50ZXJmYWNlIEFjdGl2aXR5SW5wdXQge1xuICByZWFkb25seSBhY3Rpdml0eVR5cGU6IHN0cmluZztcbiAgcmVhZG9ubHkgYXJnczogdW5rbm93bltdO1xuICByZWFkb25seSBvcHRpb25zOiBBY3Rpdml0eU9wdGlvbnM7XG4gIHJlYWRvbmx5IGhlYWRlcnM6IEhlYWRlcnM7XG4gIHJlYWRvbmx5IHNlcTogbnVtYmVyO1xufVxuXG4vKiogSW5wdXQgZm9yIFdvcmtmbG93T3V0Ym91bmRDYWxsc0ludGVyY2VwdG9yLnNjaGVkdWxlTG9jYWxBY3Rpdml0eSAqL1xuZXhwb3J0IGludGVyZmFjZSBMb2NhbEFjdGl2aXR5SW5wdXQge1xuICByZWFkb25seSBhY3Rpdml0eVR5cGU6IHN0cmluZztcbiAgcmVhZG9ubHkgYXJnczogdW5rbm93bltdO1xuICByZWFkb25seSBvcHRpb25zOiBMb2NhbEFjdGl2aXR5T3B0aW9ucztcbiAgcmVhZG9ubHkgaGVhZGVyczogSGVhZGVycztcbiAgcmVhZG9ubHkgc2VxOiBudW1iZXI7XG4gIHJlYWRvbmx5IG9yaWdpbmFsU2NoZWR1bGVUaW1lPzogVGltZXN0YW1wO1xuICByZWFkb25seSBhdHRlbXB0OiBudW1iZXI7XG59XG5cbi8qKiBJbnB1dCBmb3IgV29ya2Zsb3dPdXRib3VuZENhbGxzSW50ZXJjZXB0b3Iuc3RhcnRDaGlsZFdvcmtmbG93RXhlY3V0aW9uICovXG5leHBvcnQgaW50ZXJmYWNlIFN0YXJ0Q2hpbGRXb3JrZmxvd0V4ZWN1dGlvbklucHV0IHtcbiAgcmVhZG9ubHkgd29ya2Zsb3dUeXBlOiBzdHJpbmc7XG4gIHJlYWRvbmx5IG9wdGlvbnM6IENoaWxkV29ya2Zsb3dPcHRpb25zV2l0aERlZmF1bHRzO1xuICByZWFkb25seSBoZWFkZXJzOiBIZWFkZXJzO1xuICByZWFkb25seSBzZXE6IG51bWJlcjtcbn1cblxuLyoqIElucHV0IGZvciBXb3JrZmxvd091dGJvdW5kQ2FsbHNJbnRlcmNlcHRvci5zdGFydFRpbWVyICovXG5leHBvcnQgaW50ZXJmYWNlIFRpbWVySW5wdXQge1xuICByZWFkb25seSBkdXJhdGlvbk1zOiBudW1iZXI7XG4gIHJlYWRvbmx5IHNlcTogbnVtYmVyO1xufVxuXG4vKipcbiAqIFNhbWUgYXMgQ29udGludWVBc05ld09wdGlvbnMgYnV0IHdvcmtmbG93VHlwZSBtdXN0IGJlIGRlZmluZWRcbiAqL1xuZXhwb3J0IHR5cGUgQ29udGludWVBc05ld0lucHV0T3B0aW9ucyA9IENvbnRpbnVlQXNOZXdPcHRpb25zICYgUmVxdWlyZWQ8UGljazxDb250aW51ZUFzTmV3T3B0aW9ucywgJ3dvcmtmbG93VHlwZSc+PjtcblxuLyoqIElucHV0IGZvciBXb3JrZmxvd091dGJvdW5kQ2FsbHNJbnRlcmNlcHRvci5jb250aW51ZUFzTmV3ICovXG5leHBvcnQgaW50ZXJmYWNlIENvbnRpbnVlQXNOZXdJbnB1dCB7XG4gIHJlYWRvbmx5IGFyZ3M6IHVua25vd25bXTtcbiAgcmVhZG9ubHkgaGVhZGVyczogSGVhZGVycztcbiAgcmVhZG9ubHkgb3B0aW9uczogQ29udGludWVBc05ld0lucHV0T3B0aW9ucztcbn1cblxuLyoqIElucHV0IGZvciBXb3JrZmxvd091dGJvdW5kQ2FsbHNJbnRlcmNlcHRvci5zaWduYWxXb3JrZmxvdyAqL1xuZXhwb3J0IGludGVyZmFjZSBTaWduYWxXb3JrZmxvd0lucHV0IHtcbiAgcmVhZG9ubHkgc2VxOiBudW1iZXI7XG4gIHJlYWRvbmx5IHNpZ25hbE5hbWU6IHN0cmluZztcbiAgcmVhZG9ubHkgYXJnczogdW5rbm93bltdO1xuICByZWFkb25seSBoZWFkZXJzOiBIZWFkZXJzO1xuICByZWFkb25seSB0YXJnZXQ6XG4gICAgfCB7XG4gICAgICAgIHJlYWRvbmx5IHR5cGU6ICdleHRlcm5hbCc7XG4gICAgICAgIHJlYWRvbmx5IHdvcmtmbG93RXhlY3V0aW9uOiBXb3JrZmxvd0V4ZWN1dGlvbjtcbiAgICAgIH1cbiAgICB8IHtcbiAgICAgICAgcmVhZG9ubHkgdHlwZTogJ2NoaWxkJztcbiAgICAgICAgcmVhZG9ubHkgY2hpbGRXb3JrZmxvd0lkOiBzdHJpbmc7XG4gICAgICB9O1xufVxuXG4vKiogSW5wdXQgZm9yIFdvcmtmbG93T3V0Ym91bmRDYWxsc0ludGVyY2VwdG9yLmdldExvZ0F0dHJpYnV0ZXMgKi9cbmV4cG9ydCB0eXBlIEdldExvZ0F0dHJpYnV0ZXNJbnB1dCA9IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuXG4vKipcbiAqIEltcGxlbWVudCBhbnkgb2YgdGhlc2UgbWV0aG9kcyB0byBpbnRlcmNlcHQgV29ya2Zsb3cgY29kZSBjYWxscyB0byB0aGUgVGVtcG9yYWwgQVBJcywgbGlrZSBzY2hlZHVsaW5nIGFuIGFjdGl2aXR5IGFuZCBzdGFydGluZyBhIHRpbWVyXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgV29ya2Zsb3dPdXRib3VuZENhbGxzSW50ZXJjZXB0b3Ige1xuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gV29ya2Zsb3cgc2NoZWR1bGVzIGFuIEFjdGl2aXR5XG4gICAqXG4gICAqIEByZXR1cm4gcmVzdWx0IG9mIHRoZSBhY3Rpdml0eSBleGVjdXRpb25cbiAgICovXG4gIHNjaGVkdWxlQWN0aXZpdHk/OiAoaW5wdXQ6IEFjdGl2aXR5SW5wdXQsIG5leHQ6IE5leHQ8dGhpcywgJ3NjaGVkdWxlQWN0aXZpdHknPikgPT4gUHJvbWlzZTx1bmtub3duPjtcblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gV29ya2Zsb3cgc2NoZWR1bGVzIGEgbG9jYWwgQWN0aXZpdHlcbiAgICpcbiAgICogQHJldHVybiByZXN1bHQgb2YgdGhlIGFjdGl2aXR5IGV4ZWN1dGlvblxuICAgKi9cbiAgc2NoZWR1bGVMb2NhbEFjdGl2aXR5PzogKGlucHV0OiBMb2NhbEFjdGl2aXR5SW5wdXQsIG5leHQ6IE5leHQ8dGhpcywgJ3NjaGVkdWxlTG9jYWxBY3Rpdml0eSc+KSA9PiBQcm9taXNlPHVua25vd24+O1xuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiBXb3JrZmxvdyBzdGFydHMgYSB0aW1lclxuICAgKi9cbiAgc3RhcnRUaW1lcj86IChpbnB1dDogVGltZXJJbnB1dCwgbmV4dDogTmV4dDx0aGlzLCAnc3RhcnRUaW1lcic+KSA9PiBQcm9taXNlPHZvaWQ+O1xuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiBXb3JrZmxvdyBjYWxscyBjb250aW51ZUFzTmV3XG4gICAqL1xuICBjb250aW51ZUFzTmV3PzogKGlucHV0OiBDb250aW51ZUFzTmV3SW5wdXQsIG5leHQ6IE5leHQ8dGhpcywgJ2NvbnRpbnVlQXNOZXcnPikgPT4gUHJvbWlzZTxuZXZlcj47XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIFdvcmtmbG93IHNpZ25hbHMgYSBjaGlsZCBvciBleHRlcm5hbCBXb3JrZmxvd1xuICAgKi9cbiAgc2lnbmFsV29ya2Zsb3c/OiAoaW5wdXQ6IFNpZ25hbFdvcmtmbG93SW5wdXQsIG5leHQ6IE5leHQ8dGhpcywgJ3NpZ25hbFdvcmtmbG93Jz4pID0+IFByb21pc2U8dm9pZD47XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIFdvcmtmbG93IHN0YXJ0cyBhIGNoaWxkIHdvcmtmbG93IGV4ZWN1dGlvbiwgdGhlIGludGVyY2VwdG9yIGZ1bmN0aW9uIHJldHVybnMgMiBwcm9taXNlczpcbiAgICpcbiAgICogLSBUaGUgZmlyc3QgcmVzb2x2ZXMgd2l0aCB0aGUgYHJ1bklkYCB3aGVuIHRoZSBjaGlsZCB3b3JrZmxvdyBoYXMgc3RhcnRlZCBvciByZWplY3RzIGlmIGZhaWxlZCB0byBzdGFydC5cbiAgICogLSBUaGUgc2Vjb25kIHJlc29sdmVzIHdpdGggdGhlIHdvcmtmbG93IHJlc3VsdCB3aGVuIHRoZSBjaGlsZCB3b3JrZmxvdyBjb21wbGV0ZXMgb3IgcmVqZWN0cyBvbiBmYWlsdXJlLlxuICAgKi9cbiAgc3RhcnRDaGlsZFdvcmtmbG93RXhlY3V0aW9uPzogKFxuICAgIGlucHV0OiBTdGFydENoaWxkV29ya2Zsb3dFeGVjdXRpb25JbnB1dCxcbiAgICBuZXh0OiBOZXh0PHRoaXMsICdzdGFydENoaWxkV29ya2Zsb3dFeGVjdXRpb24nPlxuICApID0+IFByb21pc2U8W1Byb21pc2U8c3RyaW5nPiwgUHJvbWlzZTx1bmtub3duPl0+O1xuXG4gIC8qKlxuICAgKiBDYWxsZWQgb24gZWFjaCBpbnZvY2F0aW9uIG9mIHRoZSBgd29ya2Zsb3cubG9nYCBtZXRob2RzLlxuICAgKlxuICAgKiBUaGUgYXR0cmlidXRlcyByZXR1cm5lZCBpbiB0aGlzIGNhbGwgYXJlIGF0dGFjaGVkIHRvIGV2ZXJ5IGxvZyBtZXNzYWdlLlxuICAgKi9cbiAgZ2V0TG9nQXR0cmlidXRlcz86IChpbnB1dDogR2V0TG9nQXR0cmlidXRlc0lucHV0LCBuZXh0OiBOZXh0PHRoaXMsICdnZXRMb2dBdHRyaWJ1dGVzJz4pID0+IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xufVxuXG4vKiogSW5wdXQgZm9yIFdvcmtmbG93SW50ZXJuYWxzSW50ZXJjZXB0b3IuY29uY2x1ZGVBY3RpdmF0aW9uICovXG5leHBvcnQgaW50ZXJmYWNlIENvbmNsdWRlQWN0aXZhdGlvbklucHV0IHtcbiAgY29tbWFuZHM6IGNvcmVzZGsud29ya2Zsb3dfY29tbWFuZHMuSVdvcmtmbG93Q29tbWFuZFtdO1xufVxuXG4vKiogT3V0cHV0IGZvciBXb3JrZmxvd0ludGVybmFsc0ludGVyY2VwdG9yLmNvbmNsdWRlQWN0aXZhdGlvbiAqL1xuZXhwb3J0IHR5cGUgQ29uY2x1ZGVBY3RpdmF0aW9uT3V0cHV0ID0gQ29uY2x1ZGVBY3RpdmF0aW9uSW5wdXQ7XG5cbi8qKiBJbnB1dCBmb3IgV29ya2Zsb3dJbnRlcm5hbHNJbnRlcmNlcHRvci5hY3RpdmF0ZSAqL1xuZXhwb3J0IGludGVyZmFjZSBBY3RpdmF0ZUlucHV0IHtcbiAgYWN0aXZhdGlvbjogY29yZXNkay53b3JrZmxvd19hY3RpdmF0aW9uLklXb3JrZmxvd0FjdGl2YXRpb247XG4gIGJhdGNoSW5kZXg6IG51bWJlcjtcbn1cblxuLyoqIElucHV0IGZvciBXb3JrZmxvd0ludGVybmFsc0ludGVyY2VwdG9yLmRpc3Bvc2UgKi9cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZW1wdHktaW50ZXJmYWNlXG5leHBvcnQgaW50ZXJmYWNlIERpc3Bvc2VJbnB1dCB7fVxuXG4vKipcbiAqIEludGVyY2VwdG9yIGZvciB0aGUgaW50ZXJuYWxzIG9mIHRoZSBXb3JrZmxvdyBydW50aW1lLlxuICpcbiAqIFVzZSB0byBtYW5pcHVsYXRlIG9yIHRyYWNlIFdvcmtmbG93IGFjdGl2YXRpb25zLlxuICpcbiAqIEBleHBlcmltZW50YWwgVGhpcyBBUEkgaXMgZm9yIGFkdmFuY2VkIHVzZSBjYXNlcyBhbmQgbWF5IGNoYW5nZSBpbiB0aGUgZnV0dXJlLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFdvcmtmbG93SW50ZXJuYWxzSW50ZXJjZXB0b3Ige1xuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gdGhlIFdvcmtmbG93IHJ1bnRpbWUgcnVucyBhIFdvcmtmbG93QWN0aXZhdGlvbkpvYi5cbiAgICovXG4gIGFjdGl2YXRlPyhpbnB1dDogQWN0aXZhdGVJbnB1dCwgbmV4dDogTmV4dDx0aGlzLCAnYWN0aXZhdGUnPik6IHZvaWQ7XG5cbiAgLyoqXG4gICAqIENhbGxlZCBhZnRlciBhbGwgYFdvcmtmbG93QWN0aXZhdGlvbkpvYmBzIGhhdmUgYmVlbiBwcm9jZXNzZWQgZm9yIGFuIGFjdGl2YXRpb24uXG4gICAqXG4gICAqIENhbiBtYW5pcHVsYXRlIHRoZSBjb21tYW5kcyBnZW5lcmF0ZWQgYnkgdGhlIFdvcmtmbG93XG4gICAqL1xuICBjb25jbHVkZUFjdGl2YXRpb24/KGlucHV0OiBDb25jbHVkZUFjdGl2YXRpb25JbnB1dCwgbmV4dDogTmV4dDx0aGlzLCAnY29uY2x1ZGVBY3RpdmF0aW9uJz4pOiBDb25jbHVkZUFjdGl2YXRpb25PdXRwdXQ7XG5cbiAgLyoqXG4gICAqIENhbGxlZCBiZWZvcmUgZGlzcG9zaW5nIHRoZSBXb3JrZmxvdyBpc29sYXRlIGNvbnRleHQuXG4gICAqXG4gICAqIEltcGxlbWVudCB0aGlzIG1ldGhvZCB0byBwZXJmb3JtIGFueSByZXNvdXJjZSBjbGVhbnVwLlxuICAgKi9cbiAgZGlzcG9zZT8oaW5wdXQ6IERpc3Bvc2VJbnB1dCwgbmV4dDogTmV4dDx0aGlzLCAnZGlzcG9zZSc+KTogdm9pZDtcbn1cblxuLyoqXG4gKiBBIG1hcHBpbmcgZnJvbSBpbnRlcmNlcHRvciB0eXBlIHRvIGFuIG9wdGlvbmFsIGxpc3Qgb2YgaW50ZXJjZXB0b3IgaW1wbGVtZW50YXRpb25zXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgV29ya2Zsb3dJbnRlcmNlcHRvcnMge1xuICBpbmJvdW5kPzogV29ya2Zsb3dJbmJvdW5kQ2FsbHNJbnRlcmNlcHRvcltdO1xuICBvdXRib3VuZD86IFdvcmtmbG93T3V0Ym91bmRDYWxsc0ludGVyY2VwdG9yW107XG4gIGludGVybmFscz86IFdvcmtmbG93SW50ZXJuYWxzSW50ZXJjZXB0b3JbXTtcbn1cblxuLyoqXG4gKiBBIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyB7QGxpbmsgV29ya2Zsb3dJbnRlcmNlcHRvcnN9IGFuZCB0YWtlcyBubyBhcmd1bWVudHMuXG4gKlxuICogV29ya2Zsb3cgaW50ZXJjZXB0b3IgbW9kdWxlcyBzaG91bGQgZXhwb3J0IGFuIGBpbnRlcmNlcHRvcnNgIGZ1bmN0aW9uIG9mIHRoaXMgdHlwZS5cbiAqXG4gKiBAZXhhbXBsZVxuICpcbiAqIGBgYHRzXG4gKiBleHBvcnQgZnVuY3Rpb24gaW50ZXJjZXB0b3JzKCk6IFdvcmtmbG93SW50ZXJjZXB0b3JzIHtcbiAqICAgcmV0dXJuIHtcbiAqICAgICBpbmJvdW5kOiBbXSwgICAvLyBQb3B1bGF0ZSB3aXRoIGxpc3Qgb2YgaW50ZXJjZXB0b3IgaW1wbGVtZW50YXRpb25zXG4gKiAgICAgb3V0Ym91bmQ6IFtdLCAgLy8gUG9wdWxhdGUgd2l0aCBsaXN0IG9mIGludGVyY2VwdG9yIGltcGxlbWVudGF0aW9uc1xuICogICAgIGludGVybmFsczogW10sIC8vIFBvcHVsYXRlIHdpdGggbGlzdCBvZiBpbnRlcmNlcHRvciBpbXBsZW1lbnRhdGlvbnNcbiAqICAgfTtcbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgdHlwZSBXb3JrZmxvd0ludGVyY2VwdG9yc0ZhY3RvcnkgPSAoKSA9PiBXb3JrZmxvd0ludGVyY2VwdG9ycztcbiIsImltcG9ydCB0eXBlIHsgUmF3U291cmNlTWFwIH0gZnJvbSAnc291cmNlLW1hcCc7XG5pbXBvcnQge1xuICBSZXRyeVBvbGljeSxcbiAgVGVtcG9yYWxGYWlsdXJlLFxuICBDb21tb25Xb3JrZmxvd09wdGlvbnMsXG4gIEhhbmRsZXJVbmZpbmlzaGVkUG9saWN5LFxuICBTZWFyY2hBdHRyaWJ1dGVzLFxuICBTaWduYWxEZWZpbml0aW9uLFxuICBVcGRhdGVEZWZpbml0aW9uLFxuICBRdWVyeURlZmluaXRpb24sXG4gIER1cmF0aW9uLFxuICBWZXJzaW9uaW5nSW50ZW50LFxufSBmcm9tICdAdGVtcG9yYWxpby9jb21tb24nO1xuaW1wb3J0IHsgY2hlY2tFeHRlbmRzLCBTeW1ib2xCYXNlZEluc3RhbmNlT2ZFcnJvciB9IGZyb20gJ0B0ZW1wb3JhbGlvL2NvbW1vbi9saWIvdHlwZS1oZWxwZXJzJztcbmltcG9ydCB0eXBlIHsgY29yZXNkayB9IGZyb20gJ0B0ZW1wb3JhbGlvL3Byb3RvJztcblxuLyoqXG4gKiBXb3JrZmxvdyBFeGVjdXRpb24gaW5mb3JtYXRpb25cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBXb3JrZmxvd0luZm8ge1xuICAvKipcbiAgICogSUQgb2YgdGhlIFdvcmtmbG93LCB0aGlzIGNhbiBiZSBzZXQgYnkgdGhlIGNsaWVudCBkdXJpbmcgV29ya2Zsb3cgY3JlYXRpb24uXG4gICAqIEEgc2luZ2xlIFdvcmtmbG93IG1heSBydW4gbXVsdGlwbGUgdGltZXMgZS5nLiB3aGVuIHNjaGVkdWxlZCB3aXRoIGNyb24uXG4gICAqL1xuICByZWFkb25seSB3b3JrZmxvd0lkOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIElEIG9mIGEgc2luZ2xlIFdvcmtmbG93IHJ1blxuICAgKi9cbiAgcmVhZG9ubHkgcnVuSWQ6IHN0cmluZztcblxuICAvKipcbiAgICogV29ya2Zsb3cgZnVuY3Rpb24ncyBuYW1lXG4gICAqL1xuICByZWFkb25seSB3b3JrZmxvd1R5cGU6IHN0cmluZztcblxuICAvKipcbiAgICogSW5kZXhlZCBpbmZvcm1hdGlvbiBhdHRhY2hlZCB0byB0aGUgV29ya2Zsb3cgRXhlY3V0aW9uXG4gICAqXG4gICAqIFRoaXMgdmFsdWUgbWF5IGNoYW5nZSBkdXJpbmcgdGhlIGxpZmV0aW1lIG9mIGFuIEV4ZWN1dGlvbi5cbiAgICovXG4gIHJlYWRvbmx5IHNlYXJjaEF0dHJpYnV0ZXM6IFNlYXJjaEF0dHJpYnV0ZXM7XG5cbiAgLyoqXG4gICAqIE5vbi1pbmRleGVkIGluZm9ybWF0aW9uIGF0dGFjaGVkIHRvIHRoZSBXb3JrZmxvdyBFeGVjdXRpb25cbiAgICovXG4gIHJlYWRvbmx5IG1lbW8/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcblxuICAvKipcbiAgICogUGFyZW50IFdvcmtmbG93IGluZm8gKHByZXNlbnQgaWYgdGhpcyBpcyBhIENoaWxkIFdvcmtmbG93KVxuICAgKi9cbiAgcmVhZG9ubHkgcGFyZW50PzogUGFyZW50V29ya2Zsb3dJbmZvO1xuXG4gIC8qKlxuICAgKiBSZXN1bHQgZnJvbSB0aGUgcHJldmlvdXMgUnVuIChwcmVzZW50IGlmIHRoaXMgaXMgYSBDcm9uIFdvcmtmbG93IG9yIHdhcyBDb250aW51ZWQgQXMgTmV3KS5cbiAgICpcbiAgICogQW4gYXJyYXkgb2YgdmFsdWVzLCBzaW5jZSBvdGhlciBTREtzIG1heSByZXR1cm4gbXVsdGlwbGUgdmFsdWVzIGZyb20gYSBXb3JrZmxvdy5cbiAgICovXG4gIHJlYWRvbmx5IGxhc3RSZXN1bHQ/OiB1bmtub3duO1xuXG4gIC8qKlxuICAgKiBGYWlsdXJlIGZyb20gdGhlIHByZXZpb3VzIFJ1biAocHJlc2VudCB3aGVuIHRoaXMgUnVuIGlzIGEgcmV0cnksIG9yIHRoZSBsYXN0IFJ1biBvZiBhIENyb24gV29ya2Zsb3cgZmFpbGVkKVxuICAgKi9cbiAgcmVhZG9ubHkgbGFzdEZhaWx1cmU/OiBUZW1wb3JhbEZhaWx1cmU7XG5cbiAgLyoqXG4gICAqIExlbmd0aCBvZiBXb3JrZmxvdyBoaXN0b3J5IHVwIHVudGlsIHRoZSBjdXJyZW50IFdvcmtmbG93IFRhc2suXG4gICAqXG4gICAqIFRoaXMgdmFsdWUgY2hhbmdlcyBkdXJpbmcgdGhlIGxpZmV0aW1lIG9mIGFuIEV4ZWN1dGlvbi5cbiAgICpcbiAgICogWW91IG1heSBzYWZlbHkgdXNlIHRoaXMgaW5mb3JtYXRpb24gdG8gZGVjaWRlIHdoZW4gdG8ge0BsaW5rIGNvbnRpbnVlQXNOZXd9LlxuICAgKi9cbiAgcmVhZG9ubHkgaGlzdG9yeUxlbmd0aDogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiBTaXplIG9mIFdvcmtmbG93IGhpc3RvcnkgaW4gYnl0ZXMgdW50aWwgdGhlIGN1cnJlbnQgV29ya2Zsb3cgVGFzay5cbiAgICpcbiAgICogVGhpcyB2YWx1ZSBjaGFuZ2VzIGR1cmluZyB0aGUgbGlmZXRpbWUgb2YgYW4gRXhlY3V0aW9uLlxuICAgKlxuICAgKiBTdXBwb3J0ZWQgb25seSBvbiBUZW1wb3JhbCBTZXJ2ZXIgMS4yMCssIGFsd2F5cyB6ZXJvIG9uIG9sZGVyIHNlcnZlcnMuXG4gICAqXG4gICAqIFlvdSBtYXkgc2FmZWx5IHVzZSB0aGlzIGluZm9ybWF0aW9uIHRvIGRlY2lkZSB3aGVuIHRvIHtAbGluayBjb250aW51ZUFzTmV3fS5cbiAgICovXG4gIHJlYWRvbmx5IGhpc3RvcnlTaXplOiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIEEgaGludCBwcm92aWRlZCBieSB0aGUgY3VycmVudCBXb3JrZmxvd1Rhc2tTdGFydGVkIGV2ZW50IHJlY29tbWVuZGluZyB3aGV0aGVyIHRvXG4gICAqIHtAbGluayBjb250aW51ZUFzTmV3fS5cbiAgICpcbiAgICogVGhpcyB2YWx1ZSBjaGFuZ2VzIGR1cmluZyB0aGUgbGlmZXRpbWUgb2YgYW4gRXhlY3V0aW9uLlxuICAgKlxuICAgKiBTdXBwb3J0ZWQgb25seSBvbiBUZW1wb3JhbCBTZXJ2ZXIgMS4yMCssIGFsd2F5cyBgZmFsc2VgIG9uIG9sZGVyIHNlcnZlcnMuXG4gICAqL1xuICByZWFkb25seSBjb250aW51ZUFzTmV3U3VnZ2VzdGVkOiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBUYXNrIHF1ZXVlIHRoaXMgV29ya2Zsb3cgaXMgZXhlY3V0aW5nIG9uXG4gICAqL1xuICByZWFkb25seSB0YXNrUXVldWU6IHN0cmluZztcblxuICAvKipcbiAgICogTmFtZXNwYWNlIHRoaXMgV29ya2Zsb3cgaXMgZXhlY3V0aW5nIGluXG4gICAqL1xuICByZWFkb25seSBuYW1lc3BhY2U6IHN0cmluZztcblxuICAvKipcbiAgICogUnVuIElkIG9mIHRoZSBmaXJzdCBSdW4gaW4gdGhpcyBFeGVjdXRpb24gQ2hhaW5cbiAgICovXG4gIHJlYWRvbmx5IGZpcnN0RXhlY3V0aW9uUnVuSWQ6IHN0cmluZztcblxuICAvKipcbiAgICogVGhlIGxhc3QgUnVuIElkIGluIHRoaXMgRXhlY3V0aW9uIENoYWluXG4gICAqL1xuICByZWFkb25seSBjb250aW51ZWRGcm9tRXhlY3V0aW9uUnVuSWQ/OiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIFRpbWUgYXQgd2hpY2ggdGhpcyBbV29ya2Zsb3cgRXhlY3V0aW9uIENoYWluXShodHRwczovL2RvY3MudGVtcG9yYWwuaW8vd29ya2Zsb3dzI3dvcmtmbG93LWV4ZWN1dGlvbi1jaGFpbikgd2FzIHN0YXJ0ZWRcbiAgICovXG4gIHJlYWRvbmx5IHN0YXJ0VGltZTogRGF0ZTtcblxuICAvKipcbiAgICogVGltZSBhdCB3aGljaCB0aGUgY3VycmVudCBXb3JrZmxvdyBSdW4gc3RhcnRlZFxuICAgKi9cbiAgcmVhZG9ubHkgcnVuU3RhcnRUaW1lOiBEYXRlO1xuXG4gIC8qKlxuICAgKiBNaWxsaXNlY29uZHMgYWZ0ZXIgd2hpY2ggdGhlIFdvcmtmbG93IEV4ZWN1dGlvbiBpcyBhdXRvbWF0aWNhbGx5IHRlcm1pbmF0ZWQgYnkgVGVtcG9yYWwgU2VydmVyLiBTZXQgdmlhIHtAbGluayBXb3JrZmxvd09wdGlvbnMud29ya2Zsb3dFeGVjdXRpb25UaW1lb3V0fS5cbiAgICovXG4gIHJlYWRvbmx5IGV4ZWN1dGlvblRpbWVvdXRNcz86IG51bWJlcjtcblxuICAvKipcbiAgICogVGltZSBhdCB3aGljaCB0aGUgV29ya2Zsb3cgRXhlY3V0aW9uIGV4cGlyZXNcbiAgICovXG4gIHJlYWRvbmx5IGV4ZWN1dGlvbkV4cGlyYXRpb25UaW1lPzogRGF0ZTtcblxuICAvKipcbiAgICogTWlsbGlzZWNvbmRzIGFmdGVyIHdoaWNoIHRoZSBXb3JrZmxvdyBSdW4gaXMgYXV0b21hdGljYWxseSB0ZXJtaW5hdGVkIGJ5IFRlbXBvcmFsIFNlcnZlci4gU2V0IHZpYSB7QGxpbmsgV29ya2Zsb3dPcHRpb25zLndvcmtmbG93UnVuVGltZW91dH0uXG4gICAqL1xuICByZWFkb25seSBydW5UaW1lb3V0TXM/OiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIE1heGltdW0gZXhlY3V0aW9uIHRpbWUgb2YgYSBXb3JrZmxvdyBUYXNrIGluIG1pbGxpc2Vjb25kcy4gU2V0IHZpYSB7QGxpbmsgV29ya2Zsb3dPcHRpb25zLndvcmtmbG93VGFza1RpbWVvdXR9LlxuICAgKi9cbiAgcmVhZG9ubHkgdGFza1RpbWVvdXRNczogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiBSZXRyeSBQb2xpY3kgZm9yIHRoaXMgRXhlY3V0aW9uLiBTZXQgdmlhIHtAbGluayBXb3JrZmxvd09wdGlvbnMucmV0cnl9LlxuICAgKi9cbiAgcmVhZG9ubHkgcmV0cnlQb2xpY3k/OiBSZXRyeVBvbGljeTtcblxuICAvKipcbiAgICogU3RhcnRzIGF0IDEgYW5kIGluY3JlbWVudHMgZm9yIGV2ZXJ5IHJldHJ5IGlmIHRoZXJlIGlzIGEgYHJldHJ5UG9saWN5YFxuICAgKi9cbiAgcmVhZG9ubHkgYXR0ZW1wdDogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiBDcm9uIFNjaGVkdWxlIGZvciB0aGlzIEV4ZWN1dGlvbi4gU2V0IHZpYSB7QGxpbmsgV29ya2Zsb3dPcHRpb25zLmNyb25TY2hlZHVsZX0uXG4gICAqL1xuICByZWFkb25seSBjcm9uU2NoZWR1bGU/OiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIE1pbGxpc2Vjb25kcyBiZXR3ZWVuIENyb24gUnVuc1xuICAgKi9cbiAgcmVhZG9ubHkgY3JvblNjaGVkdWxlVG9TY2hlZHVsZUludGVydmFsPzogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiBUaGUgQnVpbGQgSUQgb2YgdGhlIHdvcmtlciB3aGljaCBleGVjdXRlZCB0aGUgY3VycmVudCBXb3JrZmxvdyBUYXNrLiBNYXkgYmUgdW5kZWZpbmVkIGlmIHRoZVxuICAgKiB0YXNrIHdhcyBjb21wbGV0ZWQgYnkgYSB3b3JrZXIgd2l0aG91dCBhIEJ1aWxkIElELiBJZiB0aGlzIHdvcmtlciBpcyB0aGUgb25lIGV4ZWN1dGluZyB0aGlzXG4gICAqIHRhc2sgZm9yIHRoZSBmaXJzdCB0aW1lIGFuZCBoYXMgYSBCdWlsZCBJRCBzZXQsIHRoZW4gaXRzIElEIHdpbGwgYmUgdXNlZC4gVGhpcyB2YWx1ZSBtYXkgY2hhbmdlXG4gICAqIG92ZXIgdGhlIGxpZmV0aW1lIG9mIHRoZSB3b3JrZmxvdyBydW4sIGJ1dCBpcyBkZXRlcm1pbmlzdGljIGFuZCBzYWZlIHRvIHVzZSBmb3IgYnJhbmNoaW5nLlxuICAgKi9cbiAgcmVhZG9ubHkgY3VycmVudEJ1aWxkSWQ/OiBzdHJpbmc7XG5cbiAgcmVhZG9ubHkgdW5zYWZlOiBVbnNhZmVXb3JrZmxvd0luZm87XG59XG5cbi8qKlxuICogVW5zYWZlIGluZm9ybWF0aW9uIGFib3V0IHRoZSBjdXJyZW50IFdvcmtmbG93IEV4ZWN1dGlvbi5cbiAqXG4gKiBOZXZlciByZWx5IG9uIHRoaXMgaW5mb3JtYXRpb24gaW4gV29ya2Zsb3cgbG9naWMgYXMgaXQgd2lsbCBjYXVzZSBub24tZGV0ZXJtaW5pc3RpYyBiZWhhdmlvci5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBVbnNhZmVXb3JrZmxvd0luZm8ge1xuICAvKipcbiAgICogQ3VycmVudCBzeXN0ZW0gdGltZSBpbiBtaWxsaXNlY29uZHNcbiAgICpcbiAgICogVGhlIHNhZmUgdmVyc2lvbiBvZiB0aW1lIGlzIGBuZXcgRGF0ZSgpYCBhbmQgYERhdGUubm93KClgLCB3aGljaCBhcmUgc2V0IG9uIHRoZSBmaXJzdCBpbnZvY2F0aW9uIG9mIGEgV29ya2Zsb3dcbiAgICogVGFzayBhbmQgc3RheSBjb25zdGFudCBmb3IgdGhlIGR1cmF0aW9uIG9mIHRoZSBUYXNrIGFuZCBkdXJpbmcgcmVwbGF5LlxuICAgKi9cbiAgcmVhZG9ubHkgbm93OiAoKSA9PiBudW1iZXI7XG5cbiAgcmVhZG9ubHkgaXNSZXBsYXlpbmc6IGJvb2xlYW47XG59XG5cbi8qKlxuICogSW5mb3JtYXRpb24gYWJvdXQgYSB3b3JrZmxvdyB1cGRhdGUuXG4gKlxuICogQGV4cGVyaW1lbnRhbFxuICovXG5leHBvcnQgaW50ZXJmYWNlIFVwZGF0ZUluZm8ge1xuICAvKipcbiAgICogIEEgd29ya2Zsb3ctdW5pcXVlIGlkZW50aWZpZXIgZm9yIHRoaXMgdXBkYXRlLlxuICAgKi9cbiAgcmVhZG9ubHkgaWQ6IHN0cmluZztcblxuICAvKipcbiAgICogIFRoZSB1cGRhdGUgdHlwZSBuYW1lLlxuICAgKi9cbiAgcmVhZG9ubHkgbmFtZTogc3RyaW5nO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFBhcmVudFdvcmtmbG93SW5mbyB7XG4gIHdvcmtmbG93SWQ6IHN0cmluZztcbiAgcnVuSWQ6IHN0cmluZztcbiAgbmFtZXNwYWNlOiBzdHJpbmc7XG59XG5cbi8qKlxuICogTm90IGFuIGFjdHVhbCBlcnJvciwgdXNlZCBieSB0aGUgV29ya2Zsb3cgcnVudGltZSB0byBhYm9ydCBleGVjdXRpb24gd2hlbiB7QGxpbmsgY29udGludWVBc05ld30gaXMgY2FsbGVkXG4gKi9cbkBTeW1ib2xCYXNlZEluc3RhbmNlT2ZFcnJvcignQ29udGludWVBc05ldycpXG5leHBvcnQgY2xhc3MgQ29udGludWVBc05ldyBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IocHVibGljIHJlYWRvbmx5IGNvbW1hbmQ6IGNvcmVzZGsud29ya2Zsb3dfY29tbWFuZHMuSUNvbnRpbnVlQXNOZXdXb3JrZmxvd0V4ZWN1dGlvbikge1xuICAgIHN1cGVyKCdXb3JrZmxvdyBjb250aW51ZWQgYXMgbmV3Jyk7XG4gIH1cbn1cblxuLyoqXG4gKiBPcHRpb25zIGZvciBjb250aW51aW5nIGEgV29ya2Zsb3cgYXMgbmV3XG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ29udGludWVBc05ld09wdGlvbnMge1xuICAvKipcbiAgICogQSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSBXb3JrZmxvdyB0eXBlIG5hbWUsIGUuZy4gdGhlIGZpbGVuYW1lIGluIHRoZSBOb2RlLmpzIFNESyBvciBjbGFzcyBuYW1lIGluIEphdmFcbiAgICovXG4gIHdvcmtmbG93VHlwZT86IHN0cmluZztcbiAgLyoqXG4gICAqIFRhc2sgcXVldWUgdG8gY29udGludWUgdGhlIFdvcmtmbG93IGluXG4gICAqL1xuICB0YXNrUXVldWU/OiBzdHJpbmc7XG4gIC8qKlxuICAgKiBUaW1lb3V0IGZvciB0aGUgZW50aXJlIFdvcmtmbG93IHJ1blxuICAgKiBAZm9ybWF0IHtAbGluayBodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9tcyB8IG1zLWZvcm1hdHRlZCBzdHJpbmd9XG4gICAqL1xuICB3b3JrZmxvd1J1blRpbWVvdXQ/OiBEdXJhdGlvbjtcbiAgLyoqXG4gICAqIFRpbWVvdXQgZm9yIGEgc2luZ2xlIFdvcmtmbG93IHRhc2tcbiAgICogQGZvcm1hdCB7QGxpbmsgaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvbXMgfCBtcy1mb3JtYXR0ZWQgc3RyaW5nfVxuICAgKi9cbiAgd29ya2Zsb3dUYXNrVGltZW91dD86IER1cmF0aW9uO1xuICAvKipcbiAgICogTm9uLXNlYXJjaGFibGUgYXR0cmlidXRlcyB0byBhdHRhY2ggdG8gbmV4dCBXb3JrZmxvdyBydW5cbiAgICovXG4gIG1lbW8/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgLyoqXG4gICAqIFNlYXJjaGFibGUgYXR0cmlidXRlcyB0byBhdHRhY2ggdG8gbmV4dCBXb3JrZmxvdyBydW5cbiAgICovXG4gIHNlYXJjaEF0dHJpYnV0ZXM/OiBTZWFyY2hBdHRyaWJ1dGVzO1xuICAvKipcbiAgICogV2hlbiB1c2luZyB0aGUgV29ya2VyIFZlcnNpb25pbmcgZmVhdHVyZSwgc3BlY2lmaWVzIHdoZXRoZXIgdGhpcyBXb3JrZmxvdyBzaG91bGRcbiAgICogQ29udGludWUtYXMtTmV3IG9udG8gYSB3b3JrZXIgd2l0aCBhIGNvbXBhdGlibGUgQnVpbGQgSWQgb3Igbm90LiBTZWUge0BsaW5rIFZlcnNpb25pbmdJbnRlbnR9LlxuICAgKlxuICAgKiBAZGVmYXVsdCAnQ09NUEFUSUJMRSdcbiAgICpcbiAgICogQGV4cGVyaW1lbnRhbFxuICAgKi9cbiAgdmVyc2lvbmluZ0ludGVudD86IFZlcnNpb25pbmdJbnRlbnQ7XG59XG5cbi8qKlxuICogU3BlY2lmaWVzOlxuICogLSB3aGV0aGVyIGNhbmNlbGxhdGlvbiByZXF1ZXN0cyBhcmUgc2VudCB0byB0aGUgQ2hpbGRcbiAqIC0gd2hldGhlciBhbmQgd2hlbiBhIHtAbGluayBDYW5jZWxlZEZhaWx1cmV9IGlzIHRocm93biBmcm9tIHtAbGluayBleGVjdXRlQ2hpbGR9IG9yXG4gKiAgIHtAbGluayBDaGlsZFdvcmtmbG93SGFuZGxlLnJlc3VsdH1cbiAqXG4gKiBAZGVmYXVsdCB7QGxpbmsgQ2hpbGRXb3JrZmxvd0NhbmNlbGxhdGlvblR5cGUuV0FJVF9DQU5DRUxMQVRJT05fQ09NUExFVEVEfVxuICovXG5leHBvcnQgZW51bSBDaGlsZFdvcmtmbG93Q2FuY2VsbGF0aW9uVHlwZSB7XG4gIC8qKlxuICAgKiBEb24ndCBzZW5kIGEgY2FuY2VsbGF0aW9uIHJlcXVlc3QgdG8gdGhlIENoaWxkLlxuICAgKi9cbiAgQUJBTkRPTiA9IDAsXG5cbiAgLyoqXG4gICAqIFNlbmQgYSBjYW5jZWxsYXRpb24gcmVxdWVzdCB0byB0aGUgQ2hpbGQuIEltbWVkaWF0ZWx5IHRocm93IHRoZSBlcnJvci5cbiAgICovXG4gIFRSWV9DQU5DRUwgPSAxLFxuXG4gIC8qKlxuICAgKiBTZW5kIGEgY2FuY2VsbGF0aW9uIHJlcXVlc3QgdG8gdGhlIENoaWxkLiBUaGUgQ2hpbGQgbWF5IHJlc3BlY3QgY2FuY2VsbGF0aW9uLCBpbiB3aGljaCBjYXNlIGFuIGVycm9yIHdpbGwgYmUgdGhyb3duXG4gICAqIHdoZW4gY2FuY2VsbGF0aW9uIGhhcyBjb21wbGV0ZWQsIGFuZCB7QGxpbmsgaXNDYW5jZWxsYXRpb259KGVycm9yKSB3aWxsIGJlIHRydWUuIE9uIHRoZSBvdGhlciBoYW5kLCB0aGUgQ2hpbGQgbWF5XG4gICAqIGlnbm9yZSB0aGUgY2FuY2VsbGF0aW9uIHJlcXVlc3QsIGluIHdoaWNoIGNhc2UgYW4gZXJyb3IgbWlnaHQgYmUgdGhyb3duIHdpdGggYSBkaWZmZXJlbnQgY2F1c2UsIG9yIHRoZSBDaGlsZCBtYXlcbiAgICogY29tcGxldGUgc3VjY2Vzc2Z1bGx5LlxuICAgKlxuICAgKiBAZGVmYXVsdFxuICAgKi9cbiAgV0FJVF9DQU5DRUxMQVRJT05fQ09NUExFVEVEID0gMixcblxuICAvKipcbiAgICogU2VuZCBhIGNhbmNlbGxhdGlvbiByZXF1ZXN0IHRvIHRoZSBDaGlsZC4gVGhyb3cgdGhlIGVycm9yIG9uY2UgdGhlIFNlcnZlciByZWNlaXZlcyB0aGUgQ2hpbGQgY2FuY2VsbGF0aW9uIHJlcXVlc3QuXG4gICAqL1xuICBXQUlUX0NBTkNFTExBVElPTl9SRVFVRVNURUQgPSAzLFxufVxuXG5jaGVja0V4dGVuZHM8Y29yZXNkay5jaGlsZF93b3JrZmxvdy5DaGlsZFdvcmtmbG93Q2FuY2VsbGF0aW9uVHlwZSwgQ2hpbGRXb3JrZmxvd0NhbmNlbGxhdGlvblR5cGU+KCk7XG5jaGVja0V4dGVuZHM8Q2hpbGRXb3JrZmxvd0NhbmNlbGxhdGlvblR5cGUsIGNvcmVzZGsuY2hpbGRfd29ya2Zsb3cuQ2hpbGRXb3JrZmxvd0NhbmNlbGxhdGlvblR5cGU+KCk7XG5cbi8qKlxuICogSG93IGEgQ2hpbGQgV29ya2Zsb3cgcmVhY3RzIHRvIHRoZSBQYXJlbnQgV29ya2Zsb3cgcmVhY2hpbmcgYSBDbG9zZWQgc3RhdGUuXG4gKlxuICogQHNlZSB7QGxpbmsgaHR0cHM6Ly9kb2NzLnRlbXBvcmFsLmlvL2NvbmNlcHRzL3doYXQtaXMtYS1wYXJlbnQtY2xvc2UtcG9saWN5LyB8IFBhcmVudCBDbG9zZSBQb2xpY3l9XG4gKi9cbmV4cG9ydCBlbnVtIFBhcmVudENsb3NlUG9saWN5IHtcbiAgLyoqXG4gICAqIElmIGEgYFBhcmVudENsb3NlUG9saWN5YCBpcyBzZXQgdG8gdGhpcywgb3IgaXMgbm90IHNldCBhdCBhbGwsIHRoZSBzZXJ2ZXIgZGVmYXVsdCB2YWx1ZSB3aWxsIGJlIHVzZWQuXG4gICAqL1xuICBQQVJFTlRfQ0xPU0VfUE9MSUNZX1VOU1BFQ0lGSUVEID0gMCxcblxuICAvKipcbiAgICogV2hlbiB0aGUgUGFyZW50IGlzIENsb3NlZCwgdGhlIENoaWxkIGlzIFRlcm1pbmF0ZWQuXG4gICAqXG4gICAqIEBkZWZhdWx0XG4gICAqL1xuICBQQVJFTlRfQ0xPU0VfUE9MSUNZX1RFUk1JTkFURSA9IDEsXG5cbiAgLyoqXG4gICAqIFdoZW4gdGhlIFBhcmVudCBpcyBDbG9zZWQsIG5vdGhpbmcgaXMgZG9uZSB0byB0aGUgQ2hpbGQuXG4gICAqL1xuICBQQVJFTlRfQ0xPU0VfUE9MSUNZX0FCQU5ET04gPSAyLFxuXG4gIC8qKlxuICAgKiBXaGVuIHRoZSBQYXJlbnQgaXMgQ2xvc2VkLCB0aGUgQ2hpbGQgaXMgQ2FuY2VsbGVkLlxuICAgKi9cbiAgUEFSRU5UX0NMT1NFX1BPTElDWV9SRVFVRVNUX0NBTkNFTCA9IDMsXG59XG5cbmNoZWNrRXh0ZW5kczxjb3Jlc2RrLmNoaWxkX3dvcmtmbG93LlBhcmVudENsb3NlUG9saWN5LCBQYXJlbnRDbG9zZVBvbGljeT4oKTtcbmNoZWNrRXh0ZW5kczxQYXJlbnRDbG9zZVBvbGljeSwgY29yZXNkay5jaGlsZF93b3JrZmxvdy5QYXJlbnRDbG9zZVBvbGljeT4oKTtcblxuZXhwb3J0IGludGVyZmFjZSBDaGlsZFdvcmtmbG93T3B0aW9ucyBleHRlbmRzIENvbW1vbldvcmtmbG93T3B0aW9ucyB7XG4gIC8qKlxuICAgKiBXb3JrZmxvdyBpZCB0byB1c2Ugd2hlbiBzdGFydGluZy4gSWYgbm90IHNwZWNpZmllZCBhIFVVSUQgaXMgZ2VuZXJhdGVkLiBOb3RlIHRoYXQgaXQgaXNcbiAgICogZGFuZ2Vyb3VzIGFzIGluIGNhc2Ugb2YgY2xpZW50IHNpZGUgcmV0cmllcyBubyBkZWR1cGxpY2F0aW9uIHdpbGwgaGFwcGVuIGJhc2VkIG9uIHRoZVxuICAgKiBnZW5lcmF0ZWQgaWQuIFNvIHByZWZlciBhc3NpZ25pbmcgYnVzaW5lc3MgbWVhbmluZ2Z1bCBpZHMgaWYgcG9zc2libGUuXG4gICAqL1xuICB3b3JrZmxvd0lkPzogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBUYXNrIHF1ZXVlIHRvIHVzZSBmb3IgV29ya2Zsb3cgdGFza3MuIEl0IHNob3VsZCBtYXRjaCBhIHRhc2sgcXVldWUgc3BlY2lmaWVkIHdoZW4gY3JlYXRpbmcgYVxuICAgKiBgV29ya2VyYCB0aGF0IGhvc3RzIHRoZSBXb3JrZmxvdyBjb2RlLlxuICAgKi9cbiAgdGFza1F1ZXVlPzogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBTcGVjaWZpZXM6XG4gICAqIC0gd2hldGhlciBjYW5jZWxsYXRpb24gcmVxdWVzdHMgYXJlIHNlbnQgdG8gdGhlIENoaWxkXG4gICAqIC0gd2hldGhlciBhbmQgd2hlbiBhbiBlcnJvciBpcyB0aHJvd24gZnJvbSB7QGxpbmsgZXhlY3V0ZUNoaWxkfSBvclxuICAgKiAgIHtAbGluayBDaGlsZFdvcmtmbG93SGFuZGxlLnJlc3VsdH1cbiAgICpcbiAgICogQGRlZmF1bHQge0BsaW5rIENoaWxkV29ya2Zsb3dDYW5jZWxsYXRpb25UeXBlLldBSVRfQ0FOQ0VMTEFUSU9OX0NPTVBMRVRFRH1cbiAgICovXG4gIGNhbmNlbGxhdGlvblR5cGU/OiBDaGlsZFdvcmtmbG93Q2FuY2VsbGF0aW9uVHlwZTtcblxuICAvKipcbiAgICogU3BlY2lmaWVzIGhvdyB0aGUgQ2hpbGQgcmVhY3RzIHRvIHRoZSBQYXJlbnQgV29ya2Zsb3cgcmVhY2hpbmcgYSBDbG9zZWQgc3RhdGUuXG4gICAqXG4gICAqIEBkZWZhdWx0IHtAbGluayBQYXJlbnRDbG9zZVBvbGljeS5QQVJFTlRfQ0xPU0VfUE9MSUNZX1RFUk1JTkFURX1cbiAgICovXG4gIHBhcmVudENsb3NlUG9saWN5PzogUGFyZW50Q2xvc2VQb2xpY3k7XG5cbiAgLyoqXG4gICAqIFdoZW4gdXNpbmcgdGhlIFdvcmtlciBWZXJzaW9uaW5nIGZlYXR1cmUsIHNwZWNpZmllcyB3aGV0aGVyIHRoaXMgQ2hpbGQgV29ya2Zsb3cgc2hvdWxkIHJ1biBvblxuICAgKiBhIHdvcmtlciB3aXRoIGEgY29tcGF0aWJsZSBCdWlsZCBJZCBvciBub3QuIFNlZSB7QGxpbmsgVmVyc2lvbmluZ0ludGVudH0uXG4gICAqXG4gICAqIEBkZWZhdWx0ICdDT01QQVRJQkxFJ1xuICAgKlxuICAgKiBAZXhwZXJpbWVudGFsXG4gICAqL1xuICB2ZXJzaW9uaW5nSW50ZW50PzogVmVyc2lvbmluZ0ludGVudDtcbn1cblxuZXhwb3J0IHR5cGUgUmVxdWlyZWRDaGlsZFdvcmtmbG93T3B0aW9ucyA9IFJlcXVpcmVkPFBpY2s8Q2hpbGRXb3JrZmxvd09wdGlvbnMsICd3b3JrZmxvd0lkJyB8ICdjYW5jZWxsYXRpb25UeXBlJz4+ICYge1xuICBhcmdzOiB1bmtub3duW107XG59O1xuXG5leHBvcnQgdHlwZSBDaGlsZFdvcmtmbG93T3B0aW9uc1dpdGhEZWZhdWx0cyA9IENoaWxkV29ya2Zsb3dPcHRpb25zICYgUmVxdWlyZWRDaGlsZFdvcmtmbG93T3B0aW9ucztcblxuZXhwb3J0IGludGVyZmFjZSBTdGFja1RyYWNlU0RLSW5mbyB7XG4gIG5hbWU6IHN0cmluZztcbiAgdmVyc2lvbjogc3RyaW5nO1xufVxuXG4vKipcbiAqIFJlcHJlc2VudHMgYSBzbGljZSBvZiBhIGZpbGUgc3RhcnRpbmcgYXQgbGluZU9mZnNldFxuICovXG5leHBvcnQgaW50ZXJmYWNlIFN0YWNrVHJhY2VGaWxlU2xpY2Uge1xuICAvKipcbiAgICogT25seSB1c2VkIHBvc3NpYmxlIHRvIHRyaW0gdGhlIGZpbGUgd2l0aG91dCBicmVha2luZyBzeW50YXggaGlnaGxpZ2h0aW5nLlxuICAgKi9cbiAgbGluZV9vZmZzZXQ6IG51bWJlcjtcbiAgLyoqXG4gICAqIHNsaWNlIG9mIGEgZmlsZSB3aXRoIGBcXG5gIChuZXdsaW5lKSBsaW5lIHRlcm1pbmF0b3IuXG4gICAqL1xuICBjb250ZW50OiBzdHJpbmc7XG59XG5cbi8qKlxuICogQSBwb2ludGVyIHRvIGEgbG9jYXRpb24gaW4gYSBmaWxlXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgU3RhY2tUcmFjZUZpbGVMb2NhdGlvbiB7XG4gIC8qKlxuICAgKiBQYXRoIHRvIHNvdXJjZSBmaWxlIChhYnNvbHV0ZSBvciByZWxhdGl2ZSkuXG4gICAqIFdoZW4gdXNpbmcgYSByZWxhdGl2ZSBwYXRoLCBtYWtlIHN1cmUgYWxsIHBhdGhzIGFyZSByZWxhdGl2ZSB0byB0aGUgc2FtZSByb290LlxuICAgKi9cbiAgZmlsZV9wYXRoPzogc3RyaW5nO1xuICAvKipcbiAgICogSWYgcG9zc2libGUsIFNESyBzaG91bGQgc2VuZCB0aGlzLCByZXF1aXJlZCBmb3IgZGlzcGxheWluZyB0aGUgY29kZSBsb2NhdGlvbi5cbiAgICovXG4gIGxpbmU/OiBudW1iZXI7XG4gIC8qKlxuICAgKiBJZiBwb3NzaWJsZSwgU0RLIHNob3VsZCBzZW5kIHRoaXMuXG4gICAqL1xuICBjb2x1bW4/OiBudW1iZXI7XG4gIC8qKlxuICAgKiBGdW5jdGlvbiBuYW1lIHRoaXMgbGluZSBiZWxvbmdzIHRvIChpZiBhcHBsaWNhYmxlKS5cbiAgICogVXNlZCBmb3IgZmFsbGluZyBiYWNrIHRvIHN0YWNrIHRyYWNlIHZpZXcuXG4gICAqL1xuICBmdW5jdGlvbl9uYW1lPzogc3RyaW5nO1xuICAvKipcbiAgICogRmxhZyB0byBtYXJrIHRoaXMgYXMgaW50ZXJuYWwgU0RLIGNvZGUgYW5kIGhpZGUgYnkgZGVmYXVsdCBpbiB0aGUgVUkuXG4gICAqL1xuICBpbnRlcm5hbF9jb2RlOiBib29sZWFuO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFN0YWNrVHJhY2Uge1xuICBsb2NhdGlvbnM6IFN0YWNrVHJhY2VGaWxlTG9jYXRpb25bXTtcbn1cblxuLyoqXG4gKiBVc2VkIGFzIHRoZSByZXN1bHQgZm9yIHRoZSBlbmhhbmNlZCBzdGFjayB0cmFjZSBxdWVyeVxuICovXG5leHBvcnQgaW50ZXJmYWNlIEVuaGFuY2VkU3RhY2tUcmFjZSB7XG4gIHNkazogU3RhY2tUcmFjZVNES0luZm87XG4gIC8qKlxuICAgKiBNYXBwaW5nIG9mIGZpbGUgcGF0aCB0byBmaWxlIGNvbnRlbnRzLlxuICAgKiBTREsgbWF5IGNob29zZSB0byBzZW5kIG5vLCBzb21lIG9yIGFsbCBzb3VyY2VzLlxuICAgKiBTb3VyY2VzIG1pZ2h0IGJlIHRyaW1tZWQsIGFuZCBzb21lIHRpbWUgb25seSB0aGUgZmlsZShzKSBvZiB0aGUgdG9wIGVsZW1lbnQgb2YgdGhlIHRyYWNlIHdpbGwgYmUgc2VudC5cbiAgICovXG4gIHNvdXJjZXM6IFJlY29yZDxzdHJpbmcsIFN0YWNrVHJhY2VGaWxlU2xpY2VbXT47XG4gIHN0YWNrczogU3RhY2tUcmFjZVtdO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFdvcmtmbG93Q3JlYXRlT3B0aW9ucyB7XG4gIGluZm86IFdvcmtmbG93SW5mbztcbiAgcmFuZG9tbmVzc1NlZWQ6IG51bWJlcltdO1xuICBub3c6IG51bWJlcjtcbiAgc2hvd1N0YWNrVHJhY2VTb3VyY2VzOiBib29sZWFuO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFdvcmtmbG93Q3JlYXRlT3B0aW9uc0ludGVybmFsIGV4dGVuZHMgV29ya2Zsb3dDcmVhdGVPcHRpb25zIHtcbiAgc291cmNlTWFwOiBSYXdTb3VyY2VNYXA7XG4gIHJlZ2lzdGVyZWRBY3Rpdml0eU5hbWVzOiBTZXQ8c3RyaW5nPjtcbiAgZ2V0VGltZU9mRGF5KCk6IGJpZ2ludDtcbn1cblxuLyoqXG4gKiBBIGhhbmRsZXIgZnVuY3Rpb24gY2FwYWJsZSBvZiBhY2NlcHRpbmcgdGhlIGFyZ3VtZW50cyBmb3IgYSBnaXZlbiBVcGRhdGVEZWZpbml0aW9uLCBTaWduYWxEZWZpbml0aW9uIG9yIFF1ZXJ5RGVmaW5pdGlvbi5cbiAqL1xuZXhwb3J0IHR5cGUgSGFuZGxlcjxcbiAgUmV0LFxuICBBcmdzIGV4dGVuZHMgYW55W10sXG4gIFQgZXh0ZW5kcyBVcGRhdGVEZWZpbml0aW9uPFJldCwgQXJncz4gfCBTaWduYWxEZWZpbml0aW9uPEFyZ3M+IHwgUXVlcnlEZWZpbml0aW9uPFJldCwgQXJncz4sXG4+ID0gVCBleHRlbmRzIFVwZGF0ZURlZmluaXRpb248aW5mZXIgUiwgaW5mZXIgQT5cbiAgPyAoLi4uYXJnczogQSkgPT4gUiB8IFByb21pc2U8Uj5cbiAgOiBUIGV4dGVuZHMgU2lnbmFsRGVmaW5pdGlvbjxpbmZlciBBPlxuICAgID8gKC4uLmFyZ3M6IEEpID0+IHZvaWQgfCBQcm9taXNlPHZvaWQ+XG4gICAgOiBUIGV4dGVuZHMgUXVlcnlEZWZpbml0aW9uPGluZmVyIFIsIGluZmVyIEE+XG4gICAgICA/ICguLi5hcmdzOiBBKSA9PiBSXG4gICAgICA6IG5ldmVyO1xuXG4vKipcbiAqIEEgaGFuZGxlciBmdW5jdGlvbiBhY2NlcHRpbmcgc2lnbmFsIGNhbGxzIGZvciBub24tcmVnaXN0ZXJlZCBzaWduYWwgbmFtZXMuXG4gKi9cbmV4cG9ydCB0eXBlIERlZmF1bHRTaWduYWxIYW5kbGVyID0gKHNpZ25hbE5hbWU6IHN0cmluZywgLi4uYXJnczogdW5rbm93bltdKSA9PiB2b2lkIHwgUHJvbWlzZTx2b2lkPjtcblxuLyoqXG4gKiBBIHZhbGlkYXRpb24gZnVuY3Rpb24gY2FwYWJsZSBvZiBhY2NlcHRpbmcgdGhlIGFyZ3VtZW50cyBmb3IgYSBnaXZlbiBVcGRhdGVEZWZpbml0aW9uLlxuICovXG5leHBvcnQgdHlwZSBVcGRhdGVWYWxpZGF0b3I8QXJncyBleHRlbmRzIGFueVtdPiA9ICguLi5hcmdzOiBBcmdzKSA9PiB2b2lkO1xuXG4vKipcbiAqIEEgZGVzY3JpcHRpb24gb2YgYSBxdWVyeSBoYW5kbGVyLlxuICovXG5leHBvcnQgdHlwZSBRdWVyeUhhbmRsZXJPcHRpb25zID0geyBkZXNjcmlwdGlvbj86IHN0cmluZyB9O1xuXG4vKipcbiAqIEEgZGVzY3JpcHRpb24gb2YgYSBzaWduYWwgaGFuZGxlci5cbiAqL1xuZXhwb3J0IHR5cGUgU2lnbmFsSGFuZGxlck9wdGlvbnMgPSB7IGRlc2NyaXB0aW9uPzogc3RyaW5nOyB1bmZpbmlzaGVkUG9saWN5PzogSGFuZGxlclVuZmluaXNoZWRQb2xpY3kgfTtcblxuLyoqXG4gKiBBIHZhbGlkYXRvciBhbmQgZGVzY3JpcHRpb24gb2YgYW4gdXBkYXRlIGhhbmRsZXIuXG4gKi9cbmV4cG9ydCB0eXBlIFVwZGF0ZUhhbmRsZXJPcHRpb25zPEFyZ3MgZXh0ZW5kcyBhbnlbXT4gPSB7XG4gIHZhbGlkYXRvcj86IFVwZGF0ZVZhbGlkYXRvcjxBcmdzPjtcbiAgZGVzY3JpcHRpb24/OiBzdHJpbmc7XG4gIHVuZmluaXNoZWRQb2xpY3k/OiBIYW5kbGVyVW5maW5pc2hlZFBvbGljeTtcbn07XG5cbmV4cG9ydCBpbnRlcmZhY2UgQWN0aXZhdGlvbkNvbXBsZXRpb24ge1xuICBjb21tYW5kczogY29yZXNkay53b3JrZmxvd19jb21tYW5kcy5JV29ya2Zsb3dDb21tYW5kW107XG4gIHVzZWRJbnRlcm5hbEZsYWdzOiBudW1iZXJbXTtcbn1cbiIsImltcG9ydCB0eXBlIHsgUmF3U291cmNlTWFwIH0gZnJvbSAnc291cmNlLW1hcCc7XG5pbXBvcnQge1xuICBkZWZhdWx0RmFpbHVyZUNvbnZlcnRlcixcbiAgRmFpbHVyZUNvbnZlcnRlcixcbiAgUGF5bG9hZENvbnZlcnRlcixcbiAgYXJyYXlGcm9tUGF5bG9hZHMsXG4gIGRlZmF1bHRQYXlsb2FkQ29udmVydGVyLFxuICBlbnN1cmVUZW1wb3JhbEZhaWx1cmUsXG4gIEhhbmRsZXJVbmZpbmlzaGVkUG9saWN5LFxuICBJbGxlZ2FsU3RhdGVFcnJvcixcbiAgVGVtcG9yYWxGYWlsdXJlLFxuICBXb3JrZmxvdyxcbiAgV29ya2Zsb3dFeGVjdXRpb25BbHJlYWR5U3RhcnRlZEVycm9yLFxuICBXb3JrZmxvd1F1ZXJ5QW5ub3RhdGVkVHlwZSxcbiAgV29ya2Zsb3dTaWduYWxBbm5vdGF0ZWRUeXBlLFxuICBXb3JrZmxvd1VwZGF0ZUFubm90YXRlZFR5cGUsXG4gIFByb3RvRmFpbHVyZSxcbiAgQXBwbGljYXRpb25GYWlsdXJlLFxuICBXb3JrZmxvd1VwZGF0ZVR5cGUsXG4gIFdvcmtmbG93VXBkYXRlVmFsaWRhdG9yVHlwZSxcbiAgbWFwRnJvbVBheWxvYWRzLFxuICBzZWFyY2hBdHRyaWJ1dGVQYXlsb2FkQ29udmVydGVyLFxuICBmcm9tUGF5bG9hZHNBdEluZGV4LFxuICBTZWFyY2hBdHRyaWJ1dGVzLFxufSBmcm9tICdAdGVtcG9yYWxpby9jb21tb24nO1xuaW1wb3J0IHsgY29tcG9zZUludGVyY2VwdG9ycyB9IGZyb20gJ0B0ZW1wb3JhbGlvL2NvbW1vbi9saWIvaW50ZXJjZXB0b3JzJztcbmltcG9ydCB7IGNoZWNrRXh0ZW5kcyB9IGZyb20gJ0B0ZW1wb3JhbGlvL2NvbW1vbi9saWIvdHlwZS1oZWxwZXJzJztcbmltcG9ydCB0eXBlIHsgY29yZXNkaywgdGVtcG9yYWwgfSBmcm9tICdAdGVtcG9yYWxpby9wcm90byc7XG5pbXBvcnQgeyBhbGVhLCBSTkcgfSBmcm9tICcuL2FsZWEnO1xuaW1wb3J0IHsgUm9vdENhbmNlbGxhdGlvblNjb3BlIH0gZnJvbSAnLi9jYW5jZWxsYXRpb24tc2NvcGUnO1xuaW1wb3J0IHsgVXBkYXRlU2NvcGUgfSBmcm9tICcuL3VwZGF0ZS1zY29wZSc7XG5pbXBvcnQgeyBEZXRlcm1pbmlzbVZpb2xhdGlvbkVycm9yLCBMb2NhbEFjdGl2aXR5RG9CYWNrb2ZmLCBpc0NhbmNlbGxhdGlvbiB9IGZyb20gJy4vZXJyb3JzJztcbmltcG9ydCB7IFF1ZXJ5SW5wdXQsIFNpZ25hbElucHV0LCBVcGRhdGVJbnB1dCwgV29ya2Zsb3dFeGVjdXRlSW5wdXQsIFdvcmtmbG93SW50ZXJjZXB0b3JzIH0gZnJvbSAnLi9pbnRlcmNlcHRvcnMnO1xuaW1wb3J0IHtcbiAgQ29udGludWVBc05ldyxcbiAgRGVmYXVsdFNpZ25hbEhhbmRsZXIsXG4gIFN0YWNrVHJhY2VTREtJbmZvLFxuICBTdGFja1RyYWNlRmlsZVNsaWNlLFxuICBFbmhhbmNlZFN0YWNrVHJhY2UsXG4gIFN0YWNrVHJhY2VGaWxlTG9jYXRpb24sXG4gIFdvcmtmbG93SW5mbyxcbiAgV29ya2Zsb3dDcmVhdGVPcHRpb25zSW50ZXJuYWwsXG4gIEFjdGl2YXRpb25Db21wbGV0aW9uLFxufSBmcm9tICcuL2ludGVyZmFjZXMnO1xuaW1wb3J0IHsgdHlwZSBTaW5rQ2FsbCB9IGZyb20gJy4vc2lua3MnO1xuaW1wb3J0IHsgdW50cmFja1Byb21pc2UgfSBmcm9tICcuL3N0YWNrLWhlbHBlcnMnO1xuaW1wb3J0IHBrZyBmcm9tICcuL3BrZyc7XG5pbXBvcnQgeyBTZGtGbGFnLCBhc3NlcnRWYWxpZEZsYWcgfSBmcm9tICcuL2ZsYWdzJztcbmltcG9ydCB7IGV4ZWN1dGVXaXRoTGlmZWN5Y2xlTG9nZ2luZywgbG9nIH0gZnJvbSAnLi9sb2dzJztcblxuZW51bSBTdGFydENoaWxkV29ya2Zsb3dFeGVjdXRpb25GYWlsZWRDYXVzZSB7XG4gIFNUQVJUX0NISUxEX1dPUktGTE9XX0VYRUNVVElPTl9GQUlMRURfQ0FVU0VfVU5TUEVDSUZJRUQgPSAwLFxuICBTVEFSVF9DSElMRF9XT1JLRkxPV19FWEVDVVRJT05fRkFJTEVEX0NBVVNFX1dPUktGTE9XX0FMUkVBRFlfRVhJU1RTID0gMSxcbn1cblxuY2hlY2tFeHRlbmRzPGNvcmVzZGsuY2hpbGRfd29ya2Zsb3cuU3RhcnRDaGlsZFdvcmtmbG93RXhlY3V0aW9uRmFpbGVkQ2F1c2UsIFN0YXJ0Q2hpbGRXb3JrZmxvd0V4ZWN1dGlvbkZhaWxlZENhdXNlPigpO1xuY2hlY2tFeHRlbmRzPFN0YXJ0Q2hpbGRXb3JrZmxvd0V4ZWN1dGlvbkZhaWxlZENhdXNlLCBjb3Jlc2RrLmNoaWxkX3dvcmtmbG93LlN0YXJ0Q2hpbGRXb3JrZmxvd0V4ZWN1dGlvbkZhaWxlZENhdXNlPigpO1xuXG5leHBvcnQgaW50ZXJmYWNlIFN0YWNrIHtcbiAgZm9ybWF0dGVkOiBzdHJpbmc7XG4gIHN0cnVjdHVyZWQ6IFN0YWNrVHJhY2VGaWxlTG9jYXRpb25bXTtcbn1cblxuLyoqXG4gKiBHbG9iYWwgc3RvcmUgdG8gdHJhY2sgcHJvbWlzZSBzdGFja3MgZm9yIHN0YWNrIHRyYWNlIHF1ZXJ5XG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUHJvbWlzZVN0YWNrU3RvcmUge1xuICBjaGlsZFRvUGFyZW50OiBNYXA8UHJvbWlzZTx1bmtub3duPiwgU2V0PFByb21pc2U8dW5rbm93bj4+PjtcbiAgcHJvbWlzZVRvU3RhY2s6IE1hcDxQcm9taXNlPHVua25vd24+LCBTdGFjaz47XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29tcGxldGlvbiB7XG4gIHJlc29sdmUodmFsOiB1bmtub3duKTogdW5rbm93bjtcblxuICByZWplY3QocmVhc29uOiB1bmtub3duKTogdW5rbm93bjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBDb25kaXRpb24ge1xuICBmbigpOiBib29sZWFuO1xuXG4gIHJlc29sdmUoKTogdm9pZDtcbn1cblxuZXhwb3J0IHR5cGUgQWN0aXZhdGlvbkhhbmRsZXJGdW5jdGlvbjxLIGV4dGVuZHMga2V5b2YgY29yZXNkay53b3JrZmxvd19hY3RpdmF0aW9uLklXb3JrZmxvd0FjdGl2YXRpb25Kb2I+ID0gKFxuICBhY3RpdmF0aW9uOiBOb25OdWxsYWJsZTxjb3Jlc2RrLndvcmtmbG93X2FjdGl2YXRpb24uSVdvcmtmbG93QWN0aXZhdGlvbkpvYltLXT5cbikgPT4gdm9pZDtcblxuLyoqXG4gKiBWZXJpZmllcyBhbGwgYWN0aXZhdGlvbiBqb2IgaGFuZGxpbmcgbWV0aG9kcyBhcmUgaW1wbGVtZW50ZWRcbiAqL1xuZXhwb3J0IHR5cGUgQWN0aXZhdGlvbkhhbmRsZXIgPSB7XG4gIFtQIGluIGtleW9mIGNvcmVzZGsud29ya2Zsb3dfYWN0aXZhdGlvbi5JV29ya2Zsb3dBY3RpdmF0aW9uSm9iXTogQWN0aXZhdGlvbkhhbmRsZXJGdW5jdGlvbjxQPjtcbn07XG5cbi8qKlxuICogSW5mb3JtYXRpb24gYWJvdXQgYW4gdXBkYXRlIG9yIHNpZ25hbCBoYW5kbGVyIGV4ZWN1dGlvbi5cbiAqL1xuaW50ZXJmYWNlIE1lc3NhZ2VIYW5kbGVyRXhlY3V0aW9uIHtcbiAgbmFtZTogc3RyaW5nO1xuICB1bmZpbmlzaGVkUG9saWN5OiBIYW5kbGVyVW5maW5pc2hlZFBvbGljeTtcbiAgaWQ/OiBzdHJpbmc7XG59XG5cbi8qKlxuICogS2VlcHMgYWxsIG9mIHRoZSBXb3JrZmxvdyBydW50aW1lIHN0YXRlIGxpa2UgcGVuZGluZyBjb21wbGV0aW9ucyBmb3IgYWN0aXZpdGllcyBhbmQgdGltZXJzLlxuICpcbiAqIEltcGxlbWVudHMgaGFuZGxlcnMgZm9yIGFsbCB3b3JrZmxvdyBhY3RpdmF0aW9uIGpvYnMuXG4gKlxuICogTm90ZSB0aGF0IG1vc3QgbWV0aG9kcyBpbiB0aGlzIGNsYXNzIGFyZSBtZWFudCB0byBiZSBjYWxsZWQgb25seSBmcm9tIHdpdGhpbiB0aGUgVk0uXG4gKlxuICogSG93ZXZlciwgYSBmZXcgbWV0aG9kcyBtYXkgYmUgY2FsbGVkIGRpcmVjdGx5IGZyb20gb3V0c2lkZSB0aGUgVk0gKGVzc2VudGlhbGx5IGZyb20gYHZtLXNoYXJlZC50c2ApLlxuICogVGhlc2UgbWV0aG9kcyBhcmUgc3BlY2lmaWNhbGx5IG1hcmtlZCB3aXRoIGEgY29tbWVudCBhbmQgcmVxdWlyZSBjYXJlZnVsIGNvbnNpZGVyYXRpb24sIGFzIHRoZVxuICogZXhlY3V0aW9uIGNvbnRleHQgbWF5IG5vdCBwcm9wZXJseSByZWZsZWN0IHRoYXQgb2YgdGhlIHRhcmdldCB3b3JrZmxvdyBleGVjdXRpb24gKGUuZy46IHdpdGggUmV1c2FibGVcbiAqIFZNcywgdGhlIGBnbG9iYWxgIG1heSBub3QgaGF2ZSBiZWVuIHN3YXBwZWQgdG8gdGhvc2Ugb2YgdGhhdCB3b3JrZmxvdyBleGVjdXRpb247IHRoZSBhY3RpdmUgbWljcm90YXNrXG4gKiBxdWV1ZSBtYXkgYmUgdGhhdCBvZiB0aGUgdGhyZWFkL3Byb2Nlc3MsIHJhdGhlciB0aGFuIHRoZSBxdWV1ZSBvZiB0aGF0IFZNIGNvbnRleHQ7IGV0YykuIENvbnNlcXVlbnRseSxcbiAqIG1ldGhvZHMgdGhhdCBhcmUgbWVhbnQgdG8gYmUgY2FsbGVkIGZyb20gb3V0c2lkZSBvZiB0aGUgVk0gbXVzdCBub3QgZG8gYW55IG9mIHRoZSBmb2xsb3dpbmc6XG4gKlxuICogLSBBY2Nlc3MgYW55IGdsb2JhbCB2YXJpYWJsZTtcbiAqIC0gQ3JlYXRlIFByb21pc2Ugb2JqZWN0cywgdXNlIGFzeW5jL2F3YWl0LCBvciBvdGhlcndpc2Ugc2NoZWR1bGUgbWljcm90YXNrcztcbiAqIC0gQ2FsbCB1c2VyLWRlZmluZWQgZnVuY3Rpb25zLCBpbmNsdWRpbmcgYW55IGZvcm0gb2YgaW50ZXJjZXB0b3IuXG4gKi9cbmV4cG9ydCBjbGFzcyBBY3RpdmF0b3IgaW1wbGVtZW50cyBBY3RpdmF0aW9uSGFuZGxlciB7XG4gIC8qKlxuICAgKiBDYWNoZSBmb3IgbW9kdWxlcyAtIHJlZmVyZW5jZWQgaW4gcmV1c2FibGUtdm0udHNcbiAgICovXG4gIHJlYWRvbmx5IG1vZHVsZUNhY2hlID0gbmV3IE1hcDxzdHJpbmcsIHVua25vd24+KCk7XG4gIC8qKlxuICAgKiBNYXAgb2YgdGFzayBzZXF1ZW5jZSB0byBhIENvbXBsZXRpb25cbiAgICovXG4gIHJlYWRvbmx5IGNvbXBsZXRpb25zID0ge1xuICAgIHRpbWVyOiBuZXcgTWFwPG51bWJlciwgQ29tcGxldGlvbj4oKSxcbiAgICBhY3Rpdml0eTogbmV3IE1hcDxudW1iZXIsIENvbXBsZXRpb24+KCksXG4gICAgY2hpbGRXb3JrZmxvd1N0YXJ0OiBuZXcgTWFwPG51bWJlciwgQ29tcGxldGlvbj4oKSxcbiAgICBjaGlsZFdvcmtmbG93Q29tcGxldGU6IG5ldyBNYXA8bnVtYmVyLCBDb21wbGV0aW9uPigpLFxuICAgIHNpZ25hbFdvcmtmbG93OiBuZXcgTWFwPG51bWJlciwgQ29tcGxldGlvbj4oKSxcbiAgICBjYW5jZWxXb3JrZmxvdzogbmV3IE1hcDxudW1iZXIsIENvbXBsZXRpb24+KCksXG4gIH07XG5cbiAgLyoqXG4gICAqIEhvbGRzIGJ1ZmZlcmVkIFVwZGF0ZSBjYWxscyB1bnRpbCBhIGhhbmRsZXIgaXMgcmVnaXN0ZXJlZFxuICAgKi9cbiAgcmVhZG9ubHkgYnVmZmVyZWRVcGRhdGVzID0gQXJyYXk8Y29yZXNkay53b3JrZmxvd19hY3RpdmF0aW9uLklEb1VwZGF0ZT4oKTtcblxuICAvKipcbiAgICogSG9sZHMgYnVmZmVyZWQgc2lnbmFsIGNhbGxzIHVudGlsIGEgaGFuZGxlciBpcyByZWdpc3RlcmVkXG4gICAqL1xuICByZWFkb25seSBidWZmZXJlZFNpZ25hbHMgPSBBcnJheTxjb3Jlc2RrLndvcmtmbG93X2FjdGl2YXRpb24uSVNpZ25hbFdvcmtmbG93PigpO1xuXG4gIC8qKlxuICAgKiBNYXBwaW5nIG9mIHVwZGF0ZSBuYW1lIHRvIGhhbmRsZXIgYW5kIHZhbGlkYXRvclxuICAgKi9cbiAgcmVhZG9ubHkgdXBkYXRlSGFuZGxlcnMgPSBuZXcgTWFwPHN0cmluZywgV29ya2Zsb3dVcGRhdGVBbm5vdGF0ZWRUeXBlPigpO1xuXG4gIC8qKlxuICAgKiBNYXBwaW5nIG9mIHNpZ25hbCBuYW1lIHRvIGhhbmRsZXJcbiAgICovXG4gIHJlYWRvbmx5IHNpZ25hbEhhbmRsZXJzID0gbmV3IE1hcDxzdHJpbmcsIFdvcmtmbG93U2lnbmFsQW5ub3RhdGVkVHlwZT4oKTtcblxuICAvKipcbiAgICogTWFwcGluZyBvZiBpbi1wcm9ncmVzcyB1cGRhdGVzIHRvIGhhbmRsZXIgZXhlY3V0aW9uIGluZm9ybWF0aW9uLlxuICAgKi9cbiAgcmVhZG9ubHkgaW5Qcm9ncmVzc1VwZGF0ZXMgPSBuZXcgTWFwPHN0cmluZywgTWVzc2FnZUhhbmRsZXJFeGVjdXRpb24+KCk7XG5cbiAgLyoqXG4gICAqIE1hcHBpbmcgb2YgaW4tcHJvZ3Jlc3Mgc2lnbmFscyB0byBoYW5kbGVyIGV4ZWN1dGlvbiBpbmZvcm1hdGlvbi5cbiAgICovXG4gIHJlYWRvbmx5IGluUHJvZ3Jlc3NTaWduYWxzID0gbmV3IE1hcDxudW1iZXIsIE1lc3NhZ2VIYW5kbGVyRXhlY3V0aW9uPigpO1xuXG4gIC8qKlxuICAgKiBBIHNlcXVlbmNlIG51bWJlciBwcm92aWRpbmcgdW5pcXVlIGlkZW50aWZpZXJzIGZvciBzaWduYWwgaGFuZGxlciBleGVjdXRpb25zLlxuICAgKi9cbiAgcHJvdGVjdGVkIHNpZ25hbEhhbmRsZXJFeGVjdXRpb25TZXEgPSAwO1xuXG4gIC8qKlxuICAgKiBBIHNpZ25hbCBoYW5kbGVyIHRoYXQgY2F0Y2hlcyBjYWxscyBmb3Igbm9uLXJlZ2lzdGVyZWQgc2lnbmFsIG5hbWVzLlxuICAgKi9cbiAgZGVmYXVsdFNpZ25hbEhhbmRsZXI/OiBEZWZhdWx0U2lnbmFsSGFuZGxlcjtcblxuICAvKipcbiAgICogU291cmNlIG1hcCBmaWxlIGZvciBsb29raW5nIHVwIHRoZSBzb3VyY2UgZmlsZXMgaW4gcmVzcG9uc2UgdG8gX19lbmhhbmNlZF9zdGFja190cmFjZVxuICAgKi9cbiAgcHJvdGVjdGVkIHJlYWRvbmx5IHNvdXJjZU1hcDogUmF3U291cmNlTWFwO1xuXG4gIC8qKlxuICAgKiBXaGV0aGVyIG9yIG5vdCB0byBzZW5kIHRoZSBzb3VyY2VzIGluIGVuaGFuY2VkIHN0YWNrIHRyYWNlIHF1ZXJ5IHJlc3BvbnNlc1xuICAgKi9cbiAgcHJvdGVjdGVkIHJlYWRvbmx5IHNob3dTdGFja1RyYWNlU291cmNlcztcblxuICByZWFkb25seSBwcm9taXNlU3RhY2tTdG9yZTogUHJvbWlzZVN0YWNrU3RvcmUgPSB7XG4gICAgcHJvbWlzZVRvU3RhY2s6IG5ldyBNYXAoKSxcbiAgICBjaGlsZFRvUGFyZW50OiBuZXcgTWFwKCksXG4gIH07XG5cbiAgcHVibGljIHJlYWRvbmx5IHJvb3RTY29wZSA9IG5ldyBSb290Q2FuY2VsbGF0aW9uU2NvcGUoKTtcblxuICAvKipcbiAgICogTWFwcGluZyBvZiBxdWVyeSBuYW1lIHRvIGhhbmRsZXJcbiAgICovXG4gIHB1YmxpYyByZWFkb25seSBxdWVyeUhhbmRsZXJzID0gbmV3IE1hcDxzdHJpbmcsIFdvcmtmbG93UXVlcnlBbm5vdGF0ZWRUeXBlPihbXG4gICAgW1xuICAgICAgJ19fc3RhY2tfdHJhY2UnLFxuICAgICAge1xuICAgICAgICBoYW5kbGVyOiAoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U3RhY2tUcmFjZXMoKVxuICAgICAgICAgICAgLm1hcCgocykgPT4gcy5mb3JtYXR0ZWQpXG4gICAgICAgICAgICAuam9pbignXFxuXFxuJyk7XG4gICAgICAgIH0sXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnUmV0dXJucyBhIHNlbnNpYmxlIHN0YWNrIHRyYWNlLicsXG4gICAgICB9LFxuICAgIF0sXG4gICAgW1xuICAgICAgJ19fZW5oYW5jZWRfc3RhY2tfdHJhY2UnLFxuICAgICAge1xuICAgICAgICBoYW5kbGVyOiAoKTogRW5oYW5jZWRTdGFja1RyYWNlID0+IHtcbiAgICAgICAgICBjb25zdCB7IHNvdXJjZU1hcCB9ID0gdGhpcztcbiAgICAgICAgICBjb25zdCBzZGs6IFN0YWNrVHJhY2VTREtJbmZvID0geyBuYW1lOiAndHlwZXNjcmlwdCcsIHZlcnNpb246IHBrZy52ZXJzaW9uIH07XG4gICAgICAgICAgY29uc3Qgc3RhY2tzID0gdGhpcy5nZXRTdGFja1RyYWNlcygpLm1hcCgoeyBzdHJ1Y3R1cmVkOiBsb2NhdGlvbnMgfSkgPT4gKHsgbG9jYXRpb25zIH0pKTtcbiAgICAgICAgICBjb25zdCBzb3VyY2VzOiBSZWNvcmQ8c3RyaW5nLCBTdGFja1RyYWNlRmlsZVNsaWNlW10+ID0ge307XG4gICAgICAgICAgaWYgKHRoaXMuc2hvd1N0YWNrVHJhY2VTb3VyY2VzKSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHsgbG9jYXRpb25zIH0gb2Ygc3RhY2tzKSB7XG4gICAgICAgICAgICAgIGZvciAoY29uc3QgeyBmaWxlX3BhdGggfSBvZiBsb2NhdGlvbnMpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWZpbGVfcGF0aCkgY29udGludWU7XG4gICAgICAgICAgICAgICAgY29uc3QgY29udGVudCA9IHNvdXJjZU1hcD8uc291cmNlc0NvbnRlbnQ/Lltzb3VyY2VNYXA/LnNvdXJjZXMuaW5kZXhPZihmaWxlX3BhdGgpXTtcbiAgICAgICAgICAgICAgICBpZiAoIWNvbnRlbnQpIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIHNvdXJjZXNbZmlsZV9wYXRoXSA9IFtcbiAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgbGluZV9vZmZzZXQ6IDAsXG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnQsXG4gICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHsgc2RrLCBzdGFja3MsIHNvdXJjZXMgfTtcbiAgICAgICAgfSxcbiAgICAgICAgZGVzY3JpcHRpb246ICdSZXR1cm5zIGEgc3RhY2sgdHJhY2UgYW5ub3RhdGVkIHdpdGggc291cmNlIGluZm9ybWF0aW9uLicsXG4gICAgICB9LFxuICAgIF0sXG4gICAgW1xuICAgICAgJ19fdGVtcG9yYWxfd29ya2Zsb3dfbWV0YWRhdGEnLFxuICAgICAge1xuICAgICAgICBoYW5kbGVyOiAoKTogdGVtcG9yYWwuYXBpLnNkay52MS5JV29ya2Zsb3dNZXRhZGF0YSA9PiB7XG4gICAgICAgICAgY29uc3Qgd29ya2Zsb3dUeXBlID0gdGhpcy5pbmZvLndvcmtmbG93VHlwZTtcbiAgICAgICAgICBjb25zdCBxdWVyeURlZmluaXRpb25zID0gQXJyYXkuZnJvbSh0aGlzLnF1ZXJ5SGFuZGxlcnMuZW50cmllcygpKS5tYXAoKFtuYW1lLCB2YWx1ZV0pID0+ICh7XG4gICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IHZhbHVlLmRlc2NyaXB0aW9uLFxuICAgICAgICAgIH0pKTtcbiAgICAgICAgICBjb25zdCBzaWduYWxEZWZpbml0aW9ucyA9IEFycmF5LmZyb20odGhpcy5zaWduYWxIYW5kbGVycy5lbnRyaWVzKCkpLm1hcCgoW25hbWUsIHZhbHVlXSkgPT4gKHtcbiAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogdmFsdWUuZGVzY3JpcHRpb24sXG4gICAgICAgICAgfSkpO1xuICAgICAgICAgIGNvbnN0IHVwZGF0ZURlZmluaXRpb25zID0gQXJyYXkuZnJvbSh0aGlzLnVwZGF0ZUhhbmRsZXJzLmVudHJpZXMoKSkubWFwKChbbmFtZSwgdmFsdWVdKSA9PiAoe1xuICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiB2YWx1ZS5kZXNjcmlwdGlvbixcbiAgICAgICAgICB9KSk7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRlZmluaXRpb246IHtcbiAgICAgICAgICAgICAgdHlwZTogd29ya2Zsb3dUeXBlLFxuICAgICAgICAgICAgICBxdWVyeURlZmluaXRpb25zLFxuICAgICAgICAgICAgICBzaWduYWxEZWZpbml0aW9ucyxcbiAgICAgICAgICAgICAgdXBkYXRlRGVmaW5pdGlvbnMsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnUmV0dXJucyBtZXRhZGF0YSBhc3NvY2lhdGVkIHdpdGggdGhpcyB3b3JrZmxvdy4nLFxuICAgICAgfSxcbiAgICBdLFxuICBdKTtcblxuICAvKipcbiAgICogTG9hZGVkIGluIHtAbGluayBpbml0UnVudGltZX1cbiAgICovXG4gIHB1YmxpYyByZWFkb25seSBpbnRlcmNlcHRvcnM6IFJlcXVpcmVkPFdvcmtmbG93SW50ZXJjZXB0b3JzPiA9IHtcbiAgICBpbmJvdW5kOiBbXSxcbiAgICBvdXRib3VuZDogW10sXG4gICAgaW50ZXJuYWxzOiBbXSxcbiAgfTtcblxuICAvKipcbiAgICogQnVmZmVyIHRoYXQgc3RvcmVzIGFsbCBnZW5lcmF0ZWQgY29tbWFuZHMsIHJlc2V0IGFmdGVyIGVhY2ggYWN0aXZhdGlvblxuICAgKi9cbiAgcHJvdGVjdGVkIGNvbW1hbmRzOiBjb3Jlc2RrLndvcmtmbG93X2NvbW1hbmRzLklXb3JrZmxvd0NvbW1hbmRbXSA9IFtdO1xuXG4gIC8qKlxuICAgKiBTdG9yZXMgYWxsIHtAbGluayBjb25kaXRpb259cyB0aGF0IGhhdmVuJ3QgYmVlbiB1bmJsb2NrZWQgeWV0XG4gICAqL1xuICBwdWJsaWMgcmVhZG9ubHkgYmxvY2tlZENvbmRpdGlvbnMgPSBuZXcgTWFwPG51bWJlciwgQ29uZGl0aW9uPigpO1xuXG4gIC8qKlxuICAgKiBJcyB0aGlzIFdvcmtmbG93IGNvbXBsZXRlZD9cbiAgICpcbiAgICogQSBXb3JrZmxvdyB3aWxsIGJlIGNvbnNpZGVyZWQgY29tcGxldGVkIGlmIGl0IGdlbmVyYXRlcyBhIGNvbW1hbmQgdGhhdCB0aGVcbiAgICogc3lzdGVtIGNvbnNpZGVycyBhcyBhIGZpbmFsIFdvcmtmbG93IGNvbW1hbmQgKGUuZy5cbiAgICogY29tcGxldGVXb3JrZmxvd0V4ZWN1dGlvbiBvciBmYWlsV29ya2Zsb3dFeGVjdXRpb24pLlxuICAgKi9cbiAgcHVibGljIGNvbXBsZXRlZCA9IGZhbHNlO1xuXG4gIC8qKlxuICAgKiBXYXMgdGhpcyBXb3JrZmxvdyBjYW5jZWxsZWQ/XG4gICAqL1xuICBwcm90ZWN0ZWQgY2FuY2VsbGVkID0gZmFsc2U7XG5cbiAgLyoqXG4gICAqIFRoZSBuZXh0IChpbmNyZW1lbnRhbCkgc2VxdWVuY2UgdG8gYXNzaWduIHdoZW4gZ2VuZXJhdGluZyBjb21wbGV0YWJsZSBjb21tYW5kc1xuICAgKi9cbiAgcHVibGljIG5leHRTZXFzID0ge1xuICAgIHRpbWVyOiAxLFxuICAgIGFjdGl2aXR5OiAxLFxuICAgIGNoaWxkV29ya2Zsb3c6IDEsXG4gICAgc2lnbmFsV29ya2Zsb3c6IDEsXG4gICAgY2FuY2VsV29ya2Zsb3c6IDEsXG4gICAgY29uZGl0aW9uOiAxLFxuICAgIC8vIFVzZWQgaW50ZXJuYWxseSB0byBrZWVwIHRyYWNrIG9mIGFjdGl2ZSBzdGFjayB0cmFjZXNcbiAgICBzdGFjazogMSxcbiAgfTtcblxuICAvKipcbiAgICogVGhpcyBpcyBzZXQgZXZlcnkgdGltZSB0aGUgd29ya2Zsb3cgZXhlY3V0ZXMgYW4gYWN0aXZhdGlvblxuICAgKiBNYXkgYmUgYWNjZXNzZWQgYW5kIG1vZGlmaWVkIGZyb20gb3V0c2lkZSB0aGUgVk0uXG4gICAqL1xuICBub3c6IG51bWJlcjtcblxuICAvKipcbiAgICogUmVmZXJlbmNlIHRvIHRoZSBjdXJyZW50IFdvcmtmbG93LCBpbml0aWFsaXplZCB3aGVuIGEgV29ya2Zsb3cgaXMgc3RhcnRlZFxuICAgKi9cbiAgcHVibGljIHdvcmtmbG93PzogV29ya2Zsb3c7XG5cbiAgLyoqXG4gICAqIEluZm9ybWF0aW9uIGFib3V0IHRoZSBjdXJyZW50IFdvcmtmbG93XG4gICAqIE1heSBiZSBhY2Nlc3NlZCBmcm9tIG91dHNpZGUgdGhlIFZNLlxuICAgKi9cbiAgcHVibGljIGluZm86IFdvcmtmbG93SW5mbztcblxuICAvKipcbiAgICogQSBkZXRlcm1pbmlzdGljIFJORywgdXNlZCBieSB0aGUgaXNvbGF0ZSdzIG92ZXJyaWRkZW4gTWF0aC5yYW5kb21cbiAgICovXG4gIHB1YmxpYyByYW5kb206IFJORztcblxuICBwdWJsaWMgcGF5bG9hZENvbnZlcnRlcjogUGF5bG9hZENvbnZlcnRlciA9IGRlZmF1bHRQYXlsb2FkQ29udmVydGVyO1xuICBwdWJsaWMgZmFpbHVyZUNvbnZlcnRlcjogRmFpbHVyZUNvbnZlcnRlciA9IGRlZmF1bHRGYWlsdXJlQ29udmVydGVyO1xuXG4gIC8qKlxuICAgKiBQYXRjaGVzIHdlIGtub3cgdGhlIHN0YXR1cyBvZiBmb3IgdGhpcyB3b3JrZmxvdywgYXMgaW4ge0BsaW5rIHBhdGNoZWR9XG4gICAqL1xuICBwcml2YXRlIHJlYWRvbmx5IGtub3duUHJlc2VudFBhdGNoZXMgPSBuZXcgU2V0PHN0cmluZz4oKTtcblxuICAvKipcbiAgICogUGF0Y2hlcyB3ZSBzZW50IHRvIGNvcmUge0BsaW5rIHBhdGNoZWR9XG4gICAqL1xuICBwcml2YXRlIHJlYWRvbmx5IHNlbnRQYXRjaGVzID0gbmV3IFNldDxzdHJpbmc+KCk7XG5cbiAgcHJpdmF0ZSByZWFkb25seSBrbm93bkZsYWdzID0gbmV3IFNldDxudW1iZXI+KCk7XG5cbiAgLyoqXG4gICAqIEJ1ZmZlcmVkIHNpbmsgY2FsbHMgcGVyIGFjdGl2YXRpb25cbiAgICovXG4gIHNpbmtDYWxscyA9IEFycmF5PFNpbmtDYWxsPigpO1xuXG4gIC8qKlxuICAgKiBBIG5hbm9zZWNvbmQgcmVzb2x1dGlvbiB0aW1lIGZ1bmN0aW9uLCBleHRlcm5hbGx5IGluamVjdGVkXG4gICAqL1xuICBwdWJsaWMgcmVhZG9ubHkgZ2V0VGltZU9mRGF5OiAoKSA9PiBiaWdpbnQ7XG5cbiAgcHVibGljIHJlYWRvbmx5IHJlZ2lzdGVyZWRBY3Rpdml0eU5hbWVzOiBTZXQ8c3RyaW5nPjtcblxuICBjb25zdHJ1Y3Rvcih7XG4gICAgaW5mbyxcbiAgICBub3csXG4gICAgc2hvd1N0YWNrVHJhY2VTb3VyY2VzLFxuICAgIHNvdXJjZU1hcCxcbiAgICBnZXRUaW1lT2ZEYXksXG4gICAgcmFuZG9tbmVzc1NlZWQsXG4gICAgcmVnaXN0ZXJlZEFjdGl2aXR5TmFtZXMsXG4gIH06IFdvcmtmbG93Q3JlYXRlT3B0aW9uc0ludGVybmFsKSB7XG4gICAgdGhpcy5nZXRUaW1lT2ZEYXkgPSBnZXRUaW1lT2ZEYXk7XG4gICAgdGhpcy5pbmZvID0gaW5mbztcbiAgICB0aGlzLm5vdyA9IG5vdztcbiAgICB0aGlzLnNob3dTdGFja1RyYWNlU291cmNlcyA9IHNob3dTdGFja1RyYWNlU291cmNlcztcbiAgICB0aGlzLnNvdXJjZU1hcCA9IHNvdXJjZU1hcDtcbiAgICB0aGlzLnJhbmRvbSA9IGFsZWEocmFuZG9tbmVzc1NlZWQpO1xuICAgIHRoaXMucmVnaXN0ZXJlZEFjdGl2aXR5TmFtZXMgPSByZWdpc3RlcmVkQWN0aXZpdHlOYW1lcztcbiAgfVxuXG4gIC8qKlxuICAgKiBNYXkgYmUgaW52b2tlZCBmcm9tIG91dHNpZGUgdGhlIFZNLlxuICAgKi9cbiAgbXV0YXRlV29ya2Zsb3dJbmZvKGZuOiAoaW5mbzogV29ya2Zsb3dJbmZvKSA9PiBXb3JrZmxvd0luZm8pOiB2b2lkIHtcbiAgICB0aGlzLmluZm8gPSBmbih0aGlzLmluZm8pO1xuICB9XG5cbiAgcHJvdGVjdGVkIGdldFN0YWNrVHJhY2VzKCk6IFN0YWNrW10ge1xuICAgIGNvbnN0IHsgY2hpbGRUb1BhcmVudCwgcHJvbWlzZVRvU3RhY2sgfSA9IHRoaXMucHJvbWlzZVN0YWNrU3RvcmU7XG4gICAgY29uc3QgaW50ZXJuYWxOb2RlcyA9IFsuLi5jaGlsZFRvUGFyZW50LnZhbHVlcygpXS5yZWR1Y2UoKGFjYywgY3VycikgPT4ge1xuICAgICAgZm9yIChjb25zdCBwIG9mIGN1cnIpIHtcbiAgICAgICAgYWNjLmFkZChwKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBhY2M7XG4gICAgfSwgbmV3IFNldCgpKTtcbiAgICBjb25zdCBzdGFja3MgPSBuZXcgTWFwPHN0cmluZywgU3RhY2s+KCk7XG4gICAgZm9yIChjb25zdCBjaGlsZCBvZiBjaGlsZFRvUGFyZW50LmtleXMoKSkge1xuICAgICAgaWYgKCFpbnRlcm5hbE5vZGVzLmhhcyhjaGlsZCkpIHtcbiAgICAgICAgY29uc3Qgc3RhY2sgPSBwcm9taXNlVG9TdGFjay5nZXQoY2hpbGQpO1xuICAgICAgICBpZiAoIXN0YWNrIHx8ICFzdGFjay5mb3JtYXR0ZWQpIGNvbnRpbnVlO1xuICAgICAgICBzdGFja3Muc2V0KHN0YWNrLmZvcm1hdHRlZCwgc3RhY2spO1xuICAgICAgfVxuICAgIH1cbiAgICAvLyBOb3QgMTAwJSBzdXJlIHdoZXJlIHRoaXMgY29tZXMgZnJvbSwganVzdCBmaWx0ZXIgaXQgb3V0XG4gICAgc3RhY2tzLmRlbGV0ZSgnICAgIGF0IFByb21pc2UudGhlbiAoPGFub255bW91cz4pJyk7XG4gICAgc3RhY2tzLmRlbGV0ZSgnICAgIGF0IFByb21pc2UudGhlbiAoPGFub255bW91cz4pXFxuJyk7XG4gICAgcmV0dXJuIFsuLi5zdGFja3NdLm1hcCgoW18sIHN0YWNrXSkgPT4gc3RhY2spO1xuICB9XG5cbiAgLyoqXG4gICAqIE1heSBiZSBpbnZva2VkIGZyb20gb3V0c2lkZSB0aGUgVk0uXG4gICAqL1xuICBnZXRBbmRSZXNldFNpbmtDYWxscygpOiBTaW5rQ2FsbFtdIHtcbiAgICBjb25zdCB7IHNpbmtDYWxscyB9ID0gdGhpcztcbiAgICB0aGlzLnNpbmtDYWxscyA9IFtdO1xuICAgIHJldHVybiBzaW5rQ2FsbHM7XG4gIH1cblxuICAvKipcbiAgICogQnVmZmVyIGEgV29ya2Zsb3cgY29tbWFuZCB0byBiZSBjb2xsZWN0ZWQgYXQgdGhlIGVuZCBvZiB0aGUgY3VycmVudCBhY3RpdmF0aW9uLlxuICAgKlxuICAgKiBQcmV2ZW50cyBjb21tYW5kcyBmcm9tIGJlaW5nIGFkZGVkIGFmdGVyIFdvcmtmbG93IGNvbXBsZXRpb24uXG4gICAqL1xuICBwdXNoQ29tbWFuZChjbWQ6IGNvcmVzZGsud29ya2Zsb3dfY29tbWFuZHMuSVdvcmtmbG93Q29tbWFuZCwgY29tcGxldGUgPSBmYWxzZSk6IHZvaWQge1xuICAgIHRoaXMuY29tbWFuZHMucHVzaChjbWQpO1xuICAgIGlmIChjb21wbGV0ZSkge1xuICAgICAgdGhpcy5jb21wbGV0ZWQgPSB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIGNvbmNsdWRlQWN0aXZhdGlvbigpOiBBY3RpdmF0aW9uQ29tcGxldGlvbiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNvbW1hbmRzOiB0aGlzLmNvbW1hbmRzLnNwbGljZSgwKSxcbiAgICAgIHVzZWRJbnRlcm5hbEZsYWdzOiBbLi4udGhpcy5rbm93bkZsYWdzXSxcbiAgICB9O1xuICB9XG5cbiAgcHVibGljIGFzeW5jIHN0YXJ0V29ya2Zsb3dOZXh0SGFuZGxlcih7IGFyZ3MgfTogV29ya2Zsb3dFeGVjdXRlSW5wdXQpOiBQcm9taXNlPGFueT4ge1xuICAgIGNvbnN0IHsgd29ya2Zsb3cgfSA9IHRoaXM7XG4gICAgaWYgKHdvcmtmbG93ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBJbGxlZ2FsU3RhdGVFcnJvcignV29ya2Zsb3cgdW5pbml0aWFsaXplZCcpO1xuICAgIH1cbiAgICByZXR1cm4gYXdhaXQgd29ya2Zsb3coLi4uYXJncyk7XG4gIH1cblxuICBwdWJsaWMgc3RhcnRXb3JrZmxvdyhhY3RpdmF0aW9uOiBjb3Jlc2RrLndvcmtmbG93X2FjdGl2YXRpb24uSUluaXRpYWxpemVXb3JrZmxvdyk6IHZvaWQge1xuICAgIGNvbnN0IGV4ZWN1dGUgPSBjb21wb3NlSW50ZXJjZXB0b3JzKHRoaXMuaW50ZXJjZXB0b3JzLmluYm91bmQsICdleGVjdXRlJywgdGhpcy5zdGFydFdvcmtmbG93TmV4dEhhbmRsZXIuYmluZCh0aGlzKSk7XG5cbiAgICB1bnRyYWNrUHJvbWlzZShcbiAgICAgIGV4ZWN1dGVXaXRoTGlmZWN5Y2xlTG9nZ2luZygoKSA9PlxuICAgICAgICBleGVjdXRlKHtcbiAgICAgICAgICBoZWFkZXJzOiBhY3RpdmF0aW9uLmhlYWRlcnMgPz8ge30sXG4gICAgICAgICAgYXJnczogYXJyYXlGcm9tUGF5bG9hZHModGhpcy5wYXlsb2FkQ29udmVydGVyLCBhY3RpdmF0aW9uLmFyZ3VtZW50cyksXG4gICAgICAgIH0pXG4gICAgICApLnRoZW4odGhpcy5jb21wbGV0ZVdvcmtmbG93LmJpbmQodGhpcyksIHRoaXMuaGFuZGxlV29ya2Zsb3dGYWlsdXJlLmJpbmQodGhpcykpXG4gICAgKTtcbiAgfVxuXG4gIHB1YmxpYyBpbml0aWFsaXplV29ya2Zsb3coYWN0aXZhdGlvbjogY29yZXNkay53b3JrZmxvd19hY3RpdmF0aW9uLklJbml0aWFsaXplV29ya2Zsb3cpOiB2b2lkIHtcbiAgICBjb25zdCB7IGNvbnRpbnVlZEZhaWx1cmUsIGxhc3RDb21wbGV0aW9uUmVzdWx0LCBtZW1vLCBzZWFyY2hBdHRyaWJ1dGVzIH0gPSBhY3RpdmF0aW9uO1xuXG4gICAgLy8gTW9zdCB0aGluZ3MgcmVsYXRlZCB0byBpbml0aWFsaXphdGlvbiBoYXZlIGFscmVhZHkgYmVlbiBoYW5kbGVkIGluIHRoZSBjb25zdHJ1Y3RvclxuICAgIHRoaXMubXV0YXRlV29ya2Zsb3dJbmZvKChpbmZvKSA9PiAoe1xuICAgICAgLi4uaW5mbyxcbiAgICAgIHNlYXJjaEF0dHJpYnV0ZXM6XG4gICAgICAgIChtYXBGcm9tUGF5bG9hZHMoc2VhcmNoQXR0cmlidXRlUGF5bG9hZENvbnZlcnRlciwgc2VhcmNoQXR0cmlidXRlcz8uaW5kZXhlZEZpZWxkcykgYXMgU2VhcmNoQXR0cmlidXRlcykgPz8ge30sXG4gICAgICBtZW1vOiBtYXBGcm9tUGF5bG9hZHModGhpcy5wYXlsb2FkQ29udmVydGVyLCBtZW1vPy5maWVsZHMpLFxuICAgICAgbGFzdFJlc3VsdDogZnJvbVBheWxvYWRzQXRJbmRleCh0aGlzLnBheWxvYWRDb252ZXJ0ZXIsIDAsIGxhc3RDb21wbGV0aW9uUmVzdWx0Py5wYXlsb2FkcyksXG4gICAgICBsYXN0RmFpbHVyZTpcbiAgICAgICAgY29udGludWVkRmFpbHVyZSAhPSBudWxsXG4gICAgICAgICAgPyB0aGlzLmZhaWx1cmVDb252ZXJ0ZXIuZmFpbHVyZVRvRXJyb3IoY29udGludWVkRmFpbHVyZSwgdGhpcy5wYXlsb2FkQ29udmVydGVyKVxuICAgICAgICAgIDogdW5kZWZpbmVkLFxuICAgIH0pKTtcbiAgfVxuXG4gIHB1YmxpYyBjYW5jZWxXb3JrZmxvdyhfYWN0aXZhdGlvbjogY29yZXNkay53b3JrZmxvd19hY3RpdmF0aW9uLklDYW5jZWxXb3JrZmxvdyk6IHZvaWQge1xuICAgIHRoaXMuY2FuY2VsbGVkID0gdHJ1ZTtcbiAgICB0aGlzLnJvb3RTY29wZS5jYW5jZWwoKTtcbiAgfVxuXG4gIHB1YmxpYyBmaXJlVGltZXIoYWN0aXZhdGlvbjogY29yZXNkay53b3JrZmxvd19hY3RpdmF0aW9uLklGaXJlVGltZXIpOiB2b2lkIHtcbiAgICAvLyBUaW1lcnMgYXJlIGEgc3BlY2lhbCBjYXNlIHdoZXJlIHRoZWlyIGNvbXBsZXRpb24gbWlnaHQgbm90IGJlIGluIFdvcmtmbG93IHN0YXRlLFxuICAgIC8vIHRoaXMgaXMgZHVlIHRvIGltbWVkaWF0ZSB0aW1lciBjYW5jZWxsYXRpb24gdGhhdCBkb2Vzbid0IGdvIHdhaXQgZm9yIENvcmUuXG4gICAgY29uc3QgY29tcGxldGlvbiA9IHRoaXMubWF5YmVDb25zdW1lQ29tcGxldGlvbigndGltZXInLCBnZXRTZXEoYWN0aXZhdGlvbikpO1xuICAgIGNvbXBsZXRpb24/LnJlc29sdmUodW5kZWZpbmVkKTtcbiAgfVxuXG4gIHB1YmxpYyByZXNvbHZlQWN0aXZpdHkoYWN0aXZhdGlvbjogY29yZXNkay53b3JrZmxvd19hY3RpdmF0aW9uLklSZXNvbHZlQWN0aXZpdHkpOiB2b2lkIHtcbiAgICBpZiAoIWFjdGl2YXRpb24ucmVzdWx0KSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdHb3QgUmVzb2x2ZUFjdGl2aXR5IGFjdGl2YXRpb24gd2l0aCBubyByZXN1bHQnKTtcbiAgICB9XG4gICAgY29uc3QgeyByZXNvbHZlLCByZWplY3QgfSA9IHRoaXMuY29uc3VtZUNvbXBsZXRpb24oJ2FjdGl2aXR5JywgZ2V0U2VxKGFjdGl2YXRpb24pKTtcbiAgICBpZiAoYWN0aXZhdGlvbi5yZXN1bHQuY29tcGxldGVkKSB7XG4gICAgICBjb25zdCBjb21wbGV0ZWQgPSBhY3RpdmF0aW9uLnJlc3VsdC5jb21wbGV0ZWQ7XG4gICAgICBjb25zdCByZXN1bHQgPSBjb21wbGV0ZWQucmVzdWx0ID8gdGhpcy5wYXlsb2FkQ29udmVydGVyLmZyb21QYXlsb2FkKGNvbXBsZXRlZC5yZXN1bHQpIDogdW5kZWZpbmVkO1xuICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgIH0gZWxzZSBpZiAoYWN0aXZhdGlvbi5yZXN1bHQuZmFpbGVkKSB7XG4gICAgICBjb25zdCB7IGZhaWx1cmUgfSA9IGFjdGl2YXRpb24ucmVzdWx0LmZhaWxlZDtcbiAgICAgIGNvbnN0IGVyciA9IGZhaWx1cmUgPyB0aGlzLmZhaWx1cmVUb0Vycm9yKGZhaWx1cmUpIDogdW5kZWZpbmVkO1xuICAgICAgcmVqZWN0KGVycik7XG4gICAgfSBlbHNlIGlmIChhY3RpdmF0aW9uLnJlc3VsdC5jYW5jZWxsZWQpIHtcbiAgICAgIGNvbnN0IHsgZmFpbHVyZSB9ID0gYWN0aXZhdGlvbi5yZXN1bHQuY2FuY2VsbGVkO1xuICAgICAgY29uc3QgZXJyID0gZmFpbHVyZSA/IHRoaXMuZmFpbHVyZVRvRXJyb3IoZmFpbHVyZSkgOiB1bmRlZmluZWQ7XG4gICAgICByZWplY3QoZXJyKTtcbiAgICB9IGVsc2UgaWYgKGFjdGl2YXRpb24ucmVzdWx0LmJhY2tvZmYpIHtcbiAgICAgIHJlamVjdChuZXcgTG9jYWxBY3Rpdml0eURvQmFja29mZihhY3RpdmF0aW9uLnJlc3VsdC5iYWNrb2ZmKSk7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIHJlc29sdmVDaGlsZFdvcmtmbG93RXhlY3V0aW9uU3RhcnQoXG4gICAgYWN0aXZhdGlvbjogY29yZXNkay53b3JrZmxvd19hY3RpdmF0aW9uLklSZXNvbHZlQ2hpbGRXb3JrZmxvd0V4ZWN1dGlvblN0YXJ0XG4gICk6IHZvaWQge1xuICAgIGNvbnN0IHsgcmVzb2x2ZSwgcmVqZWN0IH0gPSB0aGlzLmNvbnN1bWVDb21wbGV0aW9uKCdjaGlsZFdvcmtmbG93U3RhcnQnLCBnZXRTZXEoYWN0aXZhdGlvbikpO1xuICAgIGlmIChhY3RpdmF0aW9uLnN1Y2NlZWRlZCkge1xuICAgICAgcmVzb2x2ZShhY3RpdmF0aW9uLnN1Y2NlZWRlZC5ydW5JZCk7XG4gICAgfSBlbHNlIGlmIChhY3RpdmF0aW9uLmZhaWxlZCkge1xuICAgICAgaWYgKFxuICAgICAgICBhY3RpdmF0aW9uLmZhaWxlZC5jYXVzZSAhPT1cbiAgICAgICAgU3RhcnRDaGlsZFdvcmtmbG93RXhlY3V0aW9uRmFpbGVkQ2F1c2UuU1RBUlRfQ0hJTERfV09SS0ZMT1dfRVhFQ1VUSU9OX0ZBSUxFRF9DQVVTRV9XT1JLRkxPV19BTFJFQURZX0VYSVNUU1xuICAgICAgKSB7XG4gICAgICAgIHRocm93IG5ldyBJbGxlZ2FsU3RhdGVFcnJvcignR290IHVua25vd24gU3RhcnRDaGlsZFdvcmtmbG93RXhlY3V0aW9uRmFpbGVkQ2F1c2UnKTtcbiAgICAgIH1cbiAgICAgIGlmICghKGFjdGl2YXRpb24uc2VxICYmIGFjdGl2YXRpb24uZmFpbGVkLndvcmtmbG93SWQgJiYgYWN0aXZhdGlvbi5mYWlsZWQud29ya2Zsb3dUeXBlKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdNaXNzaW5nIGF0dHJpYnV0ZXMgaW4gYWN0aXZhdGlvbiBqb2InKTtcbiAgICAgIH1cbiAgICAgIHJlamVjdChcbiAgICAgICAgbmV3IFdvcmtmbG93RXhlY3V0aW9uQWxyZWFkeVN0YXJ0ZWRFcnJvcihcbiAgICAgICAgICAnV29ya2Zsb3cgZXhlY3V0aW9uIGFscmVhZHkgc3RhcnRlZCcsXG4gICAgICAgICAgYWN0aXZhdGlvbi5mYWlsZWQud29ya2Zsb3dJZCxcbiAgICAgICAgICBhY3RpdmF0aW9uLmZhaWxlZC53b3JrZmxvd1R5cGVcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9IGVsc2UgaWYgKGFjdGl2YXRpb24uY2FuY2VsbGVkKSB7XG4gICAgICBpZiAoIWFjdGl2YXRpb24uY2FuY2VsbGVkLmZhaWx1cmUpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignR290IG5vIGZhaWx1cmUgaW4gY2FuY2VsbGVkIHZhcmlhbnQnKTtcbiAgICAgIH1cbiAgICAgIHJlamVjdCh0aGlzLmZhaWx1cmVUb0Vycm9yKGFjdGl2YXRpb24uY2FuY2VsbGVkLmZhaWx1cmUpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignR290IFJlc29sdmVDaGlsZFdvcmtmbG93RXhlY3V0aW9uU3RhcnQgd2l0aCBubyBzdGF0dXMnKTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgcmVzb2x2ZUNoaWxkV29ya2Zsb3dFeGVjdXRpb24oYWN0aXZhdGlvbjogY29yZXNkay53b3JrZmxvd19hY3RpdmF0aW9uLklSZXNvbHZlQ2hpbGRXb3JrZmxvd0V4ZWN1dGlvbik6IHZvaWQge1xuICAgIGlmICghYWN0aXZhdGlvbi5yZXN1bHQpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0dvdCBSZXNvbHZlQ2hpbGRXb3JrZmxvd0V4ZWN1dGlvbiBhY3RpdmF0aW9uIHdpdGggbm8gcmVzdWx0Jyk7XG4gICAgfVxuICAgIGNvbnN0IHsgcmVzb2x2ZSwgcmVqZWN0IH0gPSB0aGlzLmNvbnN1bWVDb21wbGV0aW9uKCdjaGlsZFdvcmtmbG93Q29tcGxldGUnLCBnZXRTZXEoYWN0aXZhdGlvbikpO1xuICAgIGlmIChhY3RpdmF0aW9uLnJlc3VsdC5jb21wbGV0ZWQpIHtcbiAgICAgIGNvbnN0IGNvbXBsZXRlZCA9IGFjdGl2YXRpb24ucmVzdWx0LmNvbXBsZXRlZDtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGNvbXBsZXRlZC5yZXN1bHQgPyB0aGlzLnBheWxvYWRDb252ZXJ0ZXIuZnJvbVBheWxvYWQoY29tcGxldGVkLnJlc3VsdCkgOiB1bmRlZmluZWQ7XG4gICAgICByZXNvbHZlKHJlc3VsdCk7XG4gICAgfSBlbHNlIGlmIChhY3RpdmF0aW9uLnJlc3VsdC5mYWlsZWQpIHtcbiAgICAgIGNvbnN0IHsgZmFpbHVyZSB9ID0gYWN0aXZhdGlvbi5yZXN1bHQuZmFpbGVkO1xuICAgICAgaWYgKGZhaWx1cmUgPT09IHVuZGVmaW5lZCB8fCBmYWlsdXJlID09PSBudWxsKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0dvdCBmYWlsZWQgcmVzdWx0IHdpdGggbm8gZmFpbHVyZSBhdHRyaWJ1dGUnKTtcbiAgICAgIH1cbiAgICAgIHJlamVjdCh0aGlzLmZhaWx1cmVUb0Vycm9yKGZhaWx1cmUpKTtcbiAgICB9IGVsc2UgaWYgKGFjdGl2YXRpb24ucmVzdWx0LmNhbmNlbGxlZCkge1xuICAgICAgY29uc3QgeyBmYWlsdXJlIH0gPSBhY3RpdmF0aW9uLnJlc3VsdC5jYW5jZWxsZWQ7XG4gICAgICBpZiAoZmFpbHVyZSA9PT0gdW5kZWZpbmVkIHx8IGZhaWx1cmUgPT09IG51bGwpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignR290IGNhbmNlbGxlZCByZXN1bHQgd2l0aCBubyBmYWlsdXJlIGF0dHJpYnV0ZScpO1xuICAgICAgfVxuICAgICAgcmVqZWN0KHRoaXMuZmFpbHVyZVRvRXJyb3IoZmFpbHVyZSkpO1xuICAgIH1cbiAgfVxuXG4gIC8vIEludGVudGlvbmFsbHkgbm9uLWFzeW5jIGZ1bmN0aW9uIHNvIHRoaXMgaGFuZGxlciBkb2Vzbid0IHNob3cgdXAgaW4gdGhlIHN0YWNrIHRyYWNlXG4gIHByb3RlY3RlZCBxdWVyeVdvcmtmbG93TmV4dEhhbmRsZXIoeyBxdWVyeU5hbWUsIGFyZ3MgfTogUXVlcnlJbnB1dCk6IFByb21pc2U8dW5rbm93bj4ge1xuICAgIGNvbnN0IGZuID0gdGhpcy5xdWVyeUhhbmRsZXJzLmdldChxdWVyeU5hbWUpPy5oYW5kbGVyO1xuICAgIGlmIChmbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBjb25zdCBrbm93blF1ZXJ5VHlwZXMgPSBbLi4udGhpcy5xdWVyeUhhbmRsZXJzLmtleXMoKV0uam9pbignICcpO1xuICAgICAgLy8gRmFpbCB0aGUgcXVlcnlcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChcbiAgICAgICAgbmV3IFJlZmVyZW5jZUVycm9yKFxuICAgICAgICAgIGBXb3JrZmxvdyBkaWQgbm90IHJlZ2lzdGVyIGEgaGFuZGxlciBmb3IgJHtxdWVyeU5hbWV9LiBSZWdpc3RlcmVkIHF1ZXJpZXM6IFske2tub3duUXVlcnlUeXBlc31dYFxuICAgICAgICApXG4gICAgICApO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgY29uc3QgcmV0ID0gZm4oLi4uYXJncyk7XG4gICAgICBpZiAocmV0IGluc3RhbmNlb2YgUHJvbWlzZSkge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IERldGVybWluaXNtVmlvbGF0aW9uRXJyb3IoJ1F1ZXJ5IGhhbmRsZXJzIHNob3VsZCBub3QgcmV0dXJuIGEgUHJvbWlzZScpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUocmV0KTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChlcnIpO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBxdWVyeVdvcmtmbG93KGFjdGl2YXRpb246IGNvcmVzZGsud29ya2Zsb3dfYWN0aXZhdGlvbi5JUXVlcnlXb3JrZmxvdyk6IHZvaWQge1xuICAgIGNvbnN0IHsgcXVlcnlUeXBlLCBxdWVyeUlkLCBoZWFkZXJzIH0gPSBhY3RpdmF0aW9uO1xuICAgIGlmICghKHF1ZXJ5VHlwZSAmJiBxdWVyeUlkKSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignTWlzc2luZyBxdWVyeSBhY3RpdmF0aW9uIGF0dHJpYnV0ZXMnKTtcbiAgICB9XG5cbiAgICBjb25zdCBleGVjdXRlID0gY29tcG9zZUludGVyY2VwdG9ycyhcbiAgICAgIHRoaXMuaW50ZXJjZXB0b3JzLmluYm91bmQsXG4gICAgICAnaGFuZGxlUXVlcnknLFxuICAgICAgdGhpcy5xdWVyeVdvcmtmbG93TmV4dEhhbmRsZXIuYmluZCh0aGlzKVxuICAgICk7XG4gICAgZXhlY3V0ZSh7XG4gICAgICBxdWVyeU5hbWU6IHF1ZXJ5VHlwZSxcbiAgICAgIGFyZ3M6IGFycmF5RnJvbVBheWxvYWRzKHRoaXMucGF5bG9hZENvbnZlcnRlciwgYWN0aXZhdGlvbi5hcmd1bWVudHMpLFxuICAgICAgcXVlcnlJZCxcbiAgICAgIGhlYWRlcnM6IGhlYWRlcnMgPz8ge30sXG4gICAgfSkudGhlbihcbiAgICAgIChyZXN1bHQpID0+IHRoaXMuY29tcGxldGVRdWVyeShxdWVyeUlkLCByZXN1bHQpLFxuICAgICAgKHJlYXNvbikgPT4gdGhpcy5mYWlsUXVlcnkocXVlcnlJZCwgcmVhc29uKVxuICAgICk7XG4gIH1cblxuICBwdWJsaWMgZG9VcGRhdGUoYWN0aXZhdGlvbjogY29yZXNkay53b3JrZmxvd19hY3RpdmF0aW9uLklEb1VwZGF0ZSk6IHZvaWQge1xuICAgIGNvbnN0IHsgaWQ6IHVwZGF0ZUlkLCBwcm90b2NvbEluc3RhbmNlSWQsIG5hbWUsIGhlYWRlcnMsIHJ1blZhbGlkYXRvciB9ID0gYWN0aXZhdGlvbjtcbiAgICBpZiAoIXVwZGF0ZUlkKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdNaXNzaW5nIGFjdGl2YXRpb24gdXBkYXRlIGlkJyk7XG4gICAgfVxuICAgIGlmICghbmFtZSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignTWlzc2luZyBhY3RpdmF0aW9uIHVwZGF0ZSBuYW1lJyk7XG4gICAgfVxuICAgIGlmICghcHJvdG9jb2xJbnN0YW5jZUlkKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdNaXNzaW5nIGFjdGl2YXRpb24gdXBkYXRlIHByb3RvY29sSW5zdGFuY2VJZCcpO1xuICAgIH1cbiAgICBjb25zdCBlbnRyeSA9IHRoaXMudXBkYXRlSGFuZGxlcnMuZ2V0KG5hbWUpO1xuICAgIGlmICghZW50cnkpIHtcbiAgICAgIHRoaXMuYnVmZmVyZWRVcGRhdGVzLnB1c2goYWN0aXZhdGlvbik7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgbWFrZUlucHV0ID0gKCk6IFVwZGF0ZUlucHV0ID0+ICh7XG4gICAgICB1cGRhdGVJZCxcbiAgICAgIGFyZ3M6IGFycmF5RnJvbVBheWxvYWRzKHRoaXMucGF5bG9hZENvbnZlcnRlciwgYWN0aXZhdGlvbi5pbnB1dCksXG4gICAgICBuYW1lLFxuICAgICAgaGVhZGVyczogaGVhZGVycyA/PyB7fSxcbiAgICB9KTtcblxuICAgIC8vIFRoZSBpbXBsZW1lbnRhdGlvbiBiZWxvdyBpcyByZXNwb25zaWJsZSBmb3IgdXBob2xkaW5nLCBhbmQgY29uc3RyYWluZWRcbiAgICAvLyBieSwgdGhlIGZvbGxvd2luZyBjb250cmFjdDpcbiAgICAvL1xuICAgIC8vIDEuIElmIG5vIHZhbGlkYXRvciBpcyBwcmVzZW50IHRoZW4gdmFsaWRhdGlvbiBpbnRlcmNlcHRvcnMgd2lsbCBub3QgYmUgcnVuLlxuICAgIC8vXG4gICAgLy8gMi4gRHVyaW5nIHZhbGlkYXRpb24sIGFueSBlcnJvciBtdXN0IGZhaWwgdGhlIFVwZGF0ZTsgZHVyaW5nIHRoZSBVcGRhdGVcbiAgICAvLyAgICBpdHNlbGYsIFRlbXBvcmFsIGVycm9ycyBmYWlsIHRoZSBVcGRhdGUgd2hlcmVhcyBvdGhlciBlcnJvcnMgZmFpbCB0aGVcbiAgICAvLyAgICBhY3RpdmF0aW9uLlxuICAgIC8vXG4gICAgLy8gMy4gVGhlIGhhbmRsZXIgbXVzdCBub3Qgc2VlIGFueSBtdXRhdGlvbnMgb2YgdGhlIGFyZ3VtZW50cyBtYWRlIGJ5IHRoZVxuICAgIC8vICAgIHZhbGlkYXRvci5cbiAgICAvL1xuICAgIC8vIDQuIEFueSBlcnJvciB3aGVuIGRlY29kaW5nL2Rlc2VyaWFsaXppbmcgaW5wdXQgbXVzdCBiZSBjYXVnaHQgYW5kIHJlc3VsdFxuICAgIC8vICAgIGluIHJlamVjdGlvbiBvZiB0aGUgVXBkYXRlIGJlZm9yZSBpdCBpcyBhY2NlcHRlZCwgZXZlbiBpZiB0aGVyZSBpcyBub1xuICAgIC8vICAgIHZhbGlkYXRvci5cbiAgICAvL1xuICAgIC8vIDUuIFRoZSBpbml0aWFsIHN5bmNocm9ub3VzIHBvcnRpb24gb2YgdGhlIChhc3luYykgVXBkYXRlIGhhbmRsZXIgc2hvdWxkXG4gICAgLy8gICAgYmUgZXhlY3V0ZWQgYWZ0ZXIgdGhlIChzeW5jKSB2YWxpZGF0b3IgY29tcGxldGVzIHN1Y2ggdGhhdCB0aGVyZSBpc1xuICAgIC8vICAgIG1pbmltYWwgb3Bwb3J0dW5pdHkgZm9yIGEgZGlmZmVyZW50IGNvbmN1cnJlbnQgdGFzayB0byBiZSBzY2hlZHVsZWRcbiAgICAvLyAgICBiZXR3ZWVuIHRoZW0uXG4gICAgLy9cbiAgICAvLyA2LiBUaGUgc3RhY2sgdHJhY2UgdmlldyBwcm92aWRlZCBpbiB0aGUgVGVtcG9yYWwgVUkgbXVzdCBub3QgYmUgcG9sbHV0ZWRcbiAgICAvLyAgICBieSBwcm9taXNlcyB0aGF0IGRvIG5vdCBkZXJpdmUgZnJvbSB1c2VyIGNvZGUuIFRoaXMgaW1wbGllcyB0aGF0XG4gICAgLy8gICAgYXN5bmMvYXdhaXQgc3ludGF4IG1heSBub3QgYmUgdXNlZC5cbiAgICAvL1xuICAgIC8vIE5vdGUgdGhhdCB0aGVyZSBpcyBhIGRlbGliZXJhdGVseSB1bmhhbmRsZWQgcHJvbWlzZSByZWplY3Rpb24gYmVsb3cuXG4gICAgLy8gVGhlc2UgYXJlIGNhdWdodCBlbHNld2hlcmUgYW5kIGZhaWwgdGhlIGNvcnJlc3BvbmRpbmcgYWN0aXZhdGlvbi5cbiAgICBjb25zdCBkb1VwZGF0ZUltcGwgPSBhc3luYyAoKSA9PiB7XG4gICAgICBsZXQgaW5wdXQ6IFVwZGF0ZUlucHV0O1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKHJ1blZhbGlkYXRvciAmJiBlbnRyeS52YWxpZGF0b3IpIHtcbiAgICAgICAgICBjb25zdCB2YWxpZGF0ZSA9IGNvbXBvc2VJbnRlcmNlcHRvcnMoXG4gICAgICAgICAgICB0aGlzLmludGVyY2VwdG9ycy5pbmJvdW5kLFxuICAgICAgICAgICAgJ3ZhbGlkYXRlVXBkYXRlJyxcbiAgICAgICAgICAgIHRoaXMudmFsaWRhdGVVcGRhdGVOZXh0SGFuZGxlci5iaW5kKHRoaXMsIGVudHJ5LnZhbGlkYXRvcilcbiAgICAgICAgICApO1xuICAgICAgICAgIHZhbGlkYXRlKG1ha2VJbnB1dCgpKTtcbiAgICAgICAgfVxuICAgICAgICBpbnB1dCA9IG1ha2VJbnB1dCgpO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgdGhpcy5yZWplY3RVcGRhdGUocHJvdG9jb2xJbnN0YW5jZUlkLCBlcnJvcik7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRoaXMuYWNjZXB0VXBkYXRlKHByb3RvY29sSW5zdGFuY2VJZCk7XG4gICAgICBjb25zdCBleGVjdXRlID0gY29tcG9zZUludGVyY2VwdG9ycyhcbiAgICAgICAgdGhpcy5pbnRlcmNlcHRvcnMuaW5ib3VuZCxcbiAgICAgICAgJ2hhbmRsZVVwZGF0ZScsXG4gICAgICAgIHRoaXMudXBkYXRlTmV4dEhhbmRsZXIuYmluZCh0aGlzLCBlbnRyeS5oYW5kbGVyKVxuICAgICAgKTtcbiAgICAgIGNvbnN0IHsgdW5maW5pc2hlZFBvbGljeSB9ID0gZW50cnk7XG4gICAgICB0aGlzLmluUHJvZ3Jlc3NVcGRhdGVzLnNldCh1cGRhdGVJZCwgeyBuYW1lLCB1bmZpbmlzaGVkUG9saWN5LCBpZDogdXBkYXRlSWQgfSk7XG4gICAgICBjb25zdCByZXMgPSBleGVjdXRlKGlucHV0KVxuICAgICAgICAudGhlbigocmVzdWx0KSA9PiB0aGlzLmNvbXBsZXRlVXBkYXRlKHByb3RvY29sSW5zdGFuY2VJZCwgcmVzdWx0KSlcbiAgICAgICAgLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIFRlbXBvcmFsRmFpbHVyZSkge1xuICAgICAgICAgICAgdGhpcy5yZWplY3RVcGRhdGUocHJvdG9jb2xJbnN0YW5jZUlkLCBlcnJvcik7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgLmZpbmFsbHkoKCkgPT4gdGhpcy5pblByb2dyZXNzVXBkYXRlcy5kZWxldGUodXBkYXRlSWQpKTtcbiAgICAgIHVudHJhY2tQcm9taXNlKHJlcyk7XG4gICAgICByZXR1cm4gcmVzO1xuICAgIH07XG4gICAgdW50cmFja1Byb21pc2UoVXBkYXRlU2NvcGUudXBkYXRlV2l0aEluZm8odXBkYXRlSWQsIG5hbWUsIGRvVXBkYXRlSW1wbCkpO1xuICB9XG5cbiAgcHJvdGVjdGVkIGFzeW5jIHVwZGF0ZU5leHRIYW5kbGVyKGhhbmRsZXI6IFdvcmtmbG93VXBkYXRlVHlwZSwgeyBhcmdzIH06IFVwZGF0ZUlucHV0KTogUHJvbWlzZTx1bmtub3duPiB7XG4gICAgcmV0dXJuIGF3YWl0IGhhbmRsZXIoLi4uYXJncyk7XG4gIH1cblxuICBwcm90ZWN0ZWQgdmFsaWRhdGVVcGRhdGVOZXh0SGFuZGxlcih2YWxpZGF0b3I6IFdvcmtmbG93VXBkYXRlVmFsaWRhdG9yVHlwZSB8IHVuZGVmaW5lZCwgeyBhcmdzIH06IFVwZGF0ZUlucHV0KTogdm9pZCB7XG4gICAgaWYgKHZhbGlkYXRvcikge1xuICAgICAgdmFsaWRhdG9yKC4uLmFyZ3MpO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBkaXNwYXRjaEJ1ZmZlcmVkVXBkYXRlcygpOiB2b2lkIHtcbiAgICBjb25zdCBidWZmZXJlZFVwZGF0ZXMgPSB0aGlzLmJ1ZmZlcmVkVXBkYXRlcztcbiAgICB3aGlsZSAoYnVmZmVyZWRVcGRhdGVzLmxlbmd0aCkge1xuICAgICAgY29uc3QgZm91bmRJbmRleCA9IGJ1ZmZlcmVkVXBkYXRlcy5maW5kSW5kZXgoKHVwZGF0ZSkgPT4gdGhpcy51cGRhdGVIYW5kbGVycy5oYXModXBkYXRlLm5hbWUgYXMgc3RyaW5nKSk7XG4gICAgICBpZiAoZm91bmRJbmRleCA9PT0gLTEpIHtcbiAgICAgICAgLy8gTm8gYnVmZmVyZWQgVXBkYXRlcyBoYXZlIGEgaGFuZGxlciB5ZXQuXG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgY29uc3QgW3VwZGF0ZV0gPSBidWZmZXJlZFVwZGF0ZXMuc3BsaWNlKGZvdW5kSW5kZXgsIDEpO1xuICAgICAgdGhpcy5kb1VwZGF0ZSh1cGRhdGUpO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyByZWplY3RCdWZmZXJlZFVwZGF0ZXMoKTogdm9pZCB7XG4gICAgd2hpbGUgKHRoaXMuYnVmZmVyZWRVcGRhdGVzLmxlbmd0aCkge1xuICAgICAgY29uc3QgdXBkYXRlID0gdGhpcy5idWZmZXJlZFVwZGF0ZXMuc2hpZnQoKTtcbiAgICAgIGlmICh1cGRhdGUpIHtcbiAgICAgICAgdGhpcy5yZWplY3RVcGRhdGUoXG4gICAgICAgICAgLyogZXNsaW50LWRpc2FibGUgQHR5cGVzY3JpcHQtZXNsaW50L25vLW5vbi1udWxsLWFzc2VydGlvbiAqL1xuICAgICAgICAgIHVwZGF0ZS5wcm90b2NvbEluc3RhbmNlSWQhLFxuICAgICAgICAgIEFwcGxpY2F0aW9uRmFpbHVyZS5ub25SZXRyeWFibGUoYE5vIHJlZ2lzdGVyZWQgaGFuZGxlciBmb3IgdXBkYXRlOiAke3VwZGF0ZS5uYW1lfWApXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHVibGljIGFzeW5jIHNpZ25hbFdvcmtmbG93TmV4dEhhbmRsZXIoeyBzaWduYWxOYW1lLCBhcmdzIH06IFNpZ25hbElucHV0KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgZm4gPSB0aGlzLnNpZ25hbEhhbmRsZXJzLmdldChzaWduYWxOYW1lKT8uaGFuZGxlcjtcbiAgICBpZiAoZm4pIHtcbiAgICAgIHJldHVybiBhd2FpdCBmbiguLi5hcmdzKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuZGVmYXVsdFNpZ25hbEhhbmRsZXIpIHtcbiAgICAgIHJldHVybiBhd2FpdCB0aGlzLmRlZmF1bHRTaWduYWxIYW5kbGVyKHNpZ25hbE5hbWUsIC4uLmFyZ3MpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgSWxsZWdhbFN0YXRlRXJyb3IoYE5vIHJlZ2lzdGVyZWQgc2lnbmFsIGhhbmRsZXIgZm9yIHNpZ25hbDogJHtzaWduYWxOYW1lfWApO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBzaWduYWxXb3JrZmxvdyhhY3RpdmF0aW9uOiBjb3Jlc2RrLndvcmtmbG93X2FjdGl2YXRpb24uSVNpZ25hbFdvcmtmbG93KTogdm9pZCB7XG4gICAgY29uc3QgeyBzaWduYWxOYW1lLCBoZWFkZXJzIH0gPSBhY3RpdmF0aW9uO1xuICAgIGlmICghc2lnbmFsTmFtZSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignTWlzc2luZyBhY3RpdmF0aW9uIHNpZ25hbE5hbWUnKTtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMuc2lnbmFsSGFuZGxlcnMuaGFzKHNpZ25hbE5hbWUpICYmICF0aGlzLmRlZmF1bHRTaWduYWxIYW5kbGVyKSB7XG4gICAgICB0aGlzLmJ1ZmZlcmVkU2lnbmFscy5wdXNoKGFjdGl2YXRpb24pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIElmIHdlIGZhbGwgdGhyb3VnaCB0byB0aGUgZGVmYXVsdCBzaWduYWwgaGFuZGxlciB0aGVuIHRoZSB1bmZpbmlzaGVkXG4gICAgLy8gcG9saWN5IGlzIFdBUk5fQU5EX0FCQU5ET047IHVzZXJzIGN1cnJlbnRseSBoYXZlIG5vIHdheSB0byBzaWxlbmNlIGFueVxuICAgIC8vIGVuc3Vpbmcgd2FybmluZ3MuXG4gICAgY29uc3QgdW5maW5pc2hlZFBvbGljeSA9XG4gICAgICB0aGlzLnNpZ25hbEhhbmRsZXJzLmdldChzaWduYWxOYW1lKT8udW5maW5pc2hlZFBvbGljeSA/PyBIYW5kbGVyVW5maW5pc2hlZFBvbGljeS5XQVJOX0FORF9BQkFORE9OO1xuXG4gICAgY29uc3Qgc2lnbmFsRXhlY3V0aW9uTnVtID0gdGhpcy5zaWduYWxIYW5kbGVyRXhlY3V0aW9uU2VxKys7XG4gICAgdGhpcy5pblByb2dyZXNzU2lnbmFscy5zZXQoc2lnbmFsRXhlY3V0aW9uTnVtLCB7IG5hbWU6IHNpZ25hbE5hbWUsIHVuZmluaXNoZWRQb2xpY3kgfSk7XG4gICAgY29uc3QgZXhlY3V0ZSA9IGNvbXBvc2VJbnRlcmNlcHRvcnMoXG4gICAgICB0aGlzLmludGVyY2VwdG9ycy5pbmJvdW5kLFxuICAgICAgJ2hhbmRsZVNpZ25hbCcsXG4gICAgICB0aGlzLnNpZ25hbFdvcmtmbG93TmV4dEhhbmRsZXIuYmluZCh0aGlzKVxuICAgICk7XG4gICAgZXhlY3V0ZSh7XG4gICAgICBhcmdzOiBhcnJheUZyb21QYXlsb2Fkcyh0aGlzLnBheWxvYWRDb252ZXJ0ZXIsIGFjdGl2YXRpb24uaW5wdXQpLFxuICAgICAgc2lnbmFsTmFtZSxcbiAgICAgIGhlYWRlcnM6IGhlYWRlcnMgPz8ge30sXG4gICAgfSlcbiAgICAgIC5jYXRjaCh0aGlzLmhhbmRsZVdvcmtmbG93RmFpbHVyZS5iaW5kKHRoaXMpKVxuICAgICAgLmZpbmFsbHkoKCkgPT4gdGhpcy5pblByb2dyZXNzU2lnbmFscy5kZWxldGUoc2lnbmFsRXhlY3V0aW9uTnVtKSk7XG4gIH1cblxuICBwdWJsaWMgZGlzcGF0Y2hCdWZmZXJlZFNpZ25hbHMoKTogdm9pZCB7XG4gICAgY29uc3QgYnVmZmVyZWRTaWduYWxzID0gdGhpcy5idWZmZXJlZFNpZ25hbHM7XG4gICAgd2hpbGUgKGJ1ZmZlcmVkU2lnbmFscy5sZW5ndGgpIHtcbiAgICAgIGlmICh0aGlzLmRlZmF1bHRTaWduYWxIYW5kbGVyKSB7XG4gICAgICAgIC8vIFdlIGhhdmUgYSBkZWZhdWx0IHNpZ25hbCBoYW5kbGVyLCBzbyBhbGwgc2lnbmFscyBhcmUgZGlzcGF0Y2hhYmxlXG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tbm9uLW51bGwtYXNzZXJ0aW9uXG4gICAgICAgIHRoaXMuc2lnbmFsV29ya2Zsb3coYnVmZmVyZWRTaWduYWxzLnNoaWZ0KCkhKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IGZvdW5kSW5kZXggPSBidWZmZXJlZFNpZ25hbHMuZmluZEluZGV4KChzaWduYWwpID0+IHRoaXMuc2lnbmFsSGFuZGxlcnMuaGFzKHNpZ25hbC5zaWduYWxOYW1lIGFzIHN0cmluZykpO1xuICAgICAgICBpZiAoZm91bmRJbmRleCA9PT0gLTEpIGJyZWFrO1xuICAgICAgICBjb25zdCBbc2lnbmFsXSA9IGJ1ZmZlcmVkU2lnbmFscy5zcGxpY2UoZm91bmRJbmRleCwgMSk7XG4gICAgICAgIHRoaXMuc2lnbmFsV29ya2Zsb3coc2lnbmFsKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwdWJsaWMgcmVzb2x2ZVNpZ25hbEV4dGVybmFsV29ya2Zsb3coYWN0aXZhdGlvbjogY29yZXNkay53b3JrZmxvd19hY3RpdmF0aW9uLklSZXNvbHZlU2lnbmFsRXh0ZXJuYWxXb3JrZmxvdyk6IHZvaWQge1xuICAgIGNvbnN0IHsgcmVzb2x2ZSwgcmVqZWN0IH0gPSB0aGlzLmNvbnN1bWVDb21wbGV0aW9uKCdzaWduYWxXb3JrZmxvdycsIGdldFNlcShhY3RpdmF0aW9uKSk7XG4gICAgaWYgKGFjdGl2YXRpb24uZmFpbHVyZSkge1xuICAgICAgcmVqZWN0KHRoaXMuZmFpbHVyZVRvRXJyb3IoYWN0aXZhdGlvbi5mYWlsdXJlKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc29sdmUodW5kZWZpbmVkKTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgcmVzb2x2ZVJlcXVlc3RDYW5jZWxFeHRlcm5hbFdvcmtmbG93KFxuICAgIGFjdGl2YXRpb246IGNvcmVzZGsud29ya2Zsb3dfYWN0aXZhdGlvbi5JUmVzb2x2ZVJlcXVlc3RDYW5jZWxFeHRlcm5hbFdvcmtmbG93XG4gICk6IHZvaWQge1xuICAgIGNvbnN0IHsgcmVzb2x2ZSwgcmVqZWN0IH0gPSB0aGlzLmNvbnN1bWVDb21wbGV0aW9uKCdjYW5jZWxXb3JrZmxvdycsIGdldFNlcShhY3RpdmF0aW9uKSk7XG4gICAgaWYgKGFjdGl2YXRpb24uZmFpbHVyZSkge1xuICAgICAgcmVqZWN0KHRoaXMuZmFpbHVyZVRvRXJyb3IoYWN0aXZhdGlvbi5mYWlsdXJlKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc29sdmUodW5kZWZpbmVkKTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgd2FybklmVW5maW5pc2hlZEhhbmRsZXJzKCk6IHZvaWQge1xuICAgIGNvbnN0IGdldFdhcm5hYmxlID0gKGhhbmRsZXJFeGVjdXRpb25zOiBJdGVyYWJsZTxNZXNzYWdlSGFuZGxlckV4ZWN1dGlvbj4pOiBNZXNzYWdlSGFuZGxlckV4ZWN1dGlvbltdID0+IHtcbiAgICAgIHJldHVybiBBcnJheS5mcm9tKGhhbmRsZXJFeGVjdXRpb25zKS5maWx0ZXIoXG4gICAgICAgIChleCkgPT4gZXgudW5maW5pc2hlZFBvbGljeSA9PT0gSGFuZGxlclVuZmluaXNoZWRQb2xpY3kuV0FSTl9BTkRfQUJBTkRPTlxuICAgICAgKTtcbiAgICB9O1xuXG4gICAgY29uc3Qgd2FybmFibGVVcGRhdGVzID0gZ2V0V2FybmFibGUodGhpcy5pblByb2dyZXNzVXBkYXRlcy52YWx1ZXMoKSk7XG4gICAgaWYgKHdhcm5hYmxlVXBkYXRlcy5sZW5ndGggPiAwKSB7XG4gICAgICBsb2cud2FybihtYWtlVW5maW5pc2hlZFVwZGF0ZUhhbmRsZXJNZXNzYWdlKHdhcm5hYmxlVXBkYXRlcykpO1xuICAgIH1cblxuICAgIGNvbnN0IHdhcm5hYmxlU2lnbmFscyA9IGdldFdhcm5hYmxlKHRoaXMuaW5Qcm9ncmVzc1NpZ25hbHMudmFsdWVzKCkpO1xuICAgIGlmICh3YXJuYWJsZVNpZ25hbHMubGVuZ3RoID4gMCkge1xuICAgICAgbG9nLndhcm4obWFrZVVuZmluaXNoZWRTaWduYWxIYW5kbGVyTWVzc2FnZSh3YXJuYWJsZVNpZ25hbHMpKTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgdXBkYXRlUmFuZG9tU2VlZChhY3RpdmF0aW9uOiBjb3Jlc2RrLndvcmtmbG93X2FjdGl2YXRpb24uSVVwZGF0ZVJhbmRvbVNlZWQpOiB2b2lkIHtcbiAgICBpZiAoIWFjdGl2YXRpb24ucmFuZG9tbmVzc1NlZWQpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0V4cGVjdGVkIGFjdGl2YXRpb24gd2l0aCByYW5kb21uZXNzU2VlZCBhdHRyaWJ1dGUnKTtcbiAgICB9XG4gICAgdGhpcy5yYW5kb20gPSBhbGVhKGFjdGl2YXRpb24ucmFuZG9tbmVzc1NlZWQudG9CeXRlcygpKTtcbiAgfVxuXG4gIHB1YmxpYyBub3RpZnlIYXNQYXRjaChhY3RpdmF0aW9uOiBjb3Jlc2RrLndvcmtmbG93X2FjdGl2YXRpb24uSU5vdGlmeUhhc1BhdGNoKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLmluZm8udW5zYWZlLmlzUmVwbGF5aW5nKVxuICAgICAgdGhyb3cgbmV3IElsbGVnYWxTdGF0ZUVycm9yKCdVbmV4cGVjdGVkIG5vdGlmeUhhc1BhdGNoIGpvYiBvbiBub24tcmVwbGF5IGFjdGl2YXRpb24nKTtcbiAgICBpZiAoIWFjdGl2YXRpb24ucGF0Y2hJZCkgdGhyb3cgbmV3IFR5cGVFcnJvcignbm90aWZ5SGFzUGF0Y2ggbWlzc2luZyBwYXRjaCBpZCcpO1xuICAgIHRoaXMua25vd25QcmVzZW50UGF0Y2hlcy5hZGQoYWN0aXZhdGlvbi5wYXRjaElkKTtcbiAgfVxuXG4gIHB1YmxpYyBwYXRjaEludGVybmFsKHBhdGNoSWQ6IHN0cmluZywgZGVwcmVjYXRlZDogYm9vbGVhbik6IGJvb2xlYW4ge1xuICAgIGlmICh0aGlzLndvcmtmbG93ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBJbGxlZ2FsU3RhdGVFcnJvcignUGF0Y2hlcyBjYW5ub3QgYmUgdXNlZCBiZWZvcmUgV29ya2Zsb3cgc3RhcnRzJyk7XG4gICAgfVxuICAgIGNvbnN0IHVzZVBhdGNoID0gIXRoaXMuaW5mby51bnNhZmUuaXNSZXBsYXlpbmcgfHwgdGhpcy5rbm93blByZXNlbnRQYXRjaGVzLmhhcyhwYXRjaElkKTtcbiAgICAvLyBBdm9pZCBzZW5kaW5nIGNvbW1hbmRzIGZvciBwYXRjaGVzIGNvcmUgYWxyZWFkeSBrbm93cyBhYm91dC5cbiAgICAvLyBUaGlzIG9wdGltaXphdGlvbiBlbmFibGVzIGRldmVsb3BtZW50IG9mIGF1dG9tYXRpYyBwYXRjaGluZyB0b29scy5cbiAgICBpZiAodXNlUGF0Y2ggJiYgIXRoaXMuc2VudFBhdGNoZXMuaGFzKHBhdGNoSWQpKSB7XG4gICAgICB0aGlzLnB1c2hDb21tYW5kKHtcbiAgICAgICAgc2V0UGF0Y2hNYXJrZXI6IHsgcGF0Y2hJZCwgZGVwcmVjYXRlZCB9LFxuICAgICAgfSk7XG4gICAgICB0aGlzLnNlbnRQYXRjaGVzLmFkZChwYXRjaElkKTtcbiAgICB9XG4gICAgcmV0dXJuIHVzZVBhdGNoO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxlZCBlYXJseSB3aGlsZSBoYW5kbGluZyBhbiBhY3RpdmF0aW9uIHRvIHJlZ2lzdGVyIGtub3duIGZsYWdzLlxuICAgKiBNYXkgYmUgaW52b2tlZCBmcm9tIG91dHNpZGUgdGhlIFZNLlxuICAgKi9cbiAgcHVibGljIGFkZEtub3duRmxhZ3MoZmxhZ3M6IG51bWJlcltdKTogdm9pZCB7XG4gICAgZm9yIChjb25zdCBmbGFnIG9mIGZsYWdzKSB7XG4gICAgICBhc3NlcnRWYWxpZEZsYWcoZmxhZyk7XG4gICAgICB0aGlzLmtub3duRmxhZ3MuYWRkKGZsYWcpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBpZiBhbiBTREsgRmxhZyBtYXkgYmUgY29uc2lkZXJlZCBhcyBlbmFibGVkIGZvciB0aGUgY3VycmVudCBXb3JrZmxvdyBUYXNrLlxuICAgKlxuICAgKiBTREsgZmxhZ3MgcGxheSBhIHJvbGUgc2ltaWxhciB0byB0aGUgYHBhdGNoZWQoKWAgQVBJLCBidXQgYXJlIG1lYW50IGZvciBpbnRlcm5hbCB1c2FnZSBieSB0aGVcbiAgICogU0RLIGl0c2VsZi4gVGhleSBtYWtlIGl0IHBvc3NpYmxlIGZvciB0aGUgU0RLIHRvIGV2b2x2ZSBpdHMgYmVoYXZpb3JzIG92ZXIgdGltZSwgd2hpbGUgc3RpbGxcbiAgICogbWFpbnRhaW5pbmcgY29tcGF0aWJpbGl0eSB3aXRoIFdvcmtmbG93IGhpc3RvcmllcyBwcm9kdWNlZCBieSBvbGRlciBTREtzLCB3aXRob3V0IGNhdXNpbmdcbiAgICogZGV0ZXJtaW5pc20gdmlvbGF0aW9ucy5cbiAgICpcbiAgICogTWF5IGJlIGludm9rZWQgZnJvbSBvdXRzaWRlIHRoZSBWTS5cbiAgICovXG4gIHB1YmxpYyBoYXNGbGFnKGZsYWc6IFNka0ZsYWcpOiBib29sZWFuIHtcbiAgICBpZiAodGhpcy5rbm93bkZsYWdzLmhhcyhmbGFnLmlkKSkgcmV0dXJuIHRydWU7XG5cbiAgICAvLyBJZiBub3QgcmVwbGF5aW5nLCBlbmFibGUgdGhlIGZsYWcgaWYgaXQgaXMgY29uZmlndXJlZCB0byBiZSBlbmFibGVkIGJ5IGRlZmF1bHQuIFNldHRpbmcgYVxuICAgIC8vIGZsYWcncyBkZWZhdWx0IHRvIGZhbHNlIGFsbG93cyBwcm9ncmVzc2l2ZSByb2xsb3V0IG9mIG5ldyBmZWF0dXJlIGZsYWdzLCB3aXRoIHRoZSBwb3NzaWJpbGl0eVxuICAgIC8vIG9mIHJldmVydGluZyBiYWNrIHRvIGEgdmVyc2lvbiBvZiB0aGUgU0RLIHdoZXJlIHRoZSBmbGFnIGlzIHN1cHBvcnRlZCBidXQgZGlzYWJsZWQgYnkgZGVmYXVsdC5cbiAgICAvLyBJdCBpcyBhbHNvIHVzZWZ1bCBmb3IgdGVzdGluZyBwdXJwb3NlLlxuICAgIGlmICghdGhpcy5pbmZvLnVuc2FmZS5pc1JlcGxheWluZyAmJiBmbGFnLmRlZmF1bHQpIHtcbiAgICAgIHRoaXMua25vd25GbGFncy5hZGQoZmxhZy5pZCk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBXaGVuIHJlcGxheWluZywgYSBmbGFnIGlzIGNvbnNpZGVyZWQgZW5hYmxlZCBpZiBpdCB3YXMgZW5hYmxlZCBkdXJpbmcgdGhlIG9yaWdpbmFsIGV4ZWN1dGlvbiBvZlxuICAgIC8vIHRoYXQgV29ya2Zsb3cgVGFzazsgdGhpcyBpcyBub3JtYWxseSBkZXRlcm1pbmVkIGJ5IHRoZSBwcmVzZW5jZSBvZiB0aGUgZmxhZyBJRCBpbiB0aGUgY29ycmVzcG9uZGluZ1xuICAgIC8vIFdGVCBDb21wbGV0ZWQncyBgc2RrTWV0YWRhdGEubGFuZ1VzZWRGbGFnc2AuXG4gICAgLy9cbiAgICAvLyBTREsgRmxhZyBBbHRlcm5hdGUgQ29uZGl0aW9uIHByb3ZpZGVzIGFuIGFsdGVybmF0aXZlIHdheSBvZiBkZXRlcm1pbmluZyB3aGV0aGVyIGEgZmxhZyBzaG91bGRcbiAgICAvLyBiZSBjb25zaWRlcmVkIGFzIGVuYWJsZWQgZm9yIHRoZSBjdXJyZW50IFdGVDsgZS5nLiBieSBsb29raW5nIGF0IHRoZSB2ZXJzaW9uIG9mIHRoZSBTREsgdGhhdFxuICAgIC8vIGVtaXR0ZWQgYSBXRlQuIFRoZSBtYWluIHVzZSBjYXNlIGZvciB0aGlzIGlzIHRvIHJldHJvYWN0aXZlbHkgdHVybiBvbiBzb21lIGZsYWdzIGZvciBXRlQgZW1pdHRlZFxuICAgIC8vIGJ5IHByZXZpb3VzIFNES3MgdGhhdCBjb250YWluZWQgYSBidWcuIEFsdCBDb25kaXRpb25zIHNob3VsZCBvbmx5IGJlIHVzZWQgYXMgYSBsYXN0IHJlc29ydC5cbiAgICAvL1xuICAgIC8vIE5vdGUgdGhhdCBjb25kaXRpb25zIGFyZSBvbmx5IGV2YWx1YXRlZCB3aGlsZSByZXBsYXlpbmcuIEFsc28sIGFsdGVybmF0ZSBjb25kaXRpb25zIHdpbGwgbm90XG4gICAgLy8gY2F1c2UgdGhlIGZsYWcgdG8gYmUgcGVyc2lzdGVkIHRvIHRoZSBcInVzZWQgZmxhZ3NcIiBzZXQsIHdoaWNoIG1lYW5zIHRoYXQgZnVydGhlciBXb3JrZmxvdyBUYXNrc1xuICAgIC8vIG1heSBub3QgcmVmbGVjdCB0aGlzIGZsYWcgaWYgdGhlIGNvbmRpdGlvbiBubyBsb25nZXIgaG9sZHMuIFRoaXMgaXMgc28gdG8gYXZvaWQgaW5jb3JyZWN0XG4gICAgLy8gYmVoYXZpb3JzIGluIGNhc2Ugd2hlcmUgYSBXb3JrZmxvdyBFeGVjdXRpb24gaGFzIGdvbmUgdGhyb3VnaCBhIG5ld2VyIFNESyB2ZXJzaW9uIHRoZW4gYWdhaW5cbiAgICAvLyB0aHJvdWdoIGFuIG9sZGVyIG9uZS5cbiAgICBpZiAodGhpcy5pbmZvLnVuc2FmZS5pc1JlcGxheWluZyAmJiBmbGFnLmFsdGVybmF0aXZlQ29uZGl0aW9ucykge1xuICAgICAgZm9yIChjb25zdCBjb25kIG9mIGZsYWcuYWx0ZXJuYXRpdmVDb25kaXRpb25zKSB7XG4gICAgICAgIGlmIChjb25kKHsgaW5mbzogdGhpcy5pbmZvIH0pKSByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBwdWJsaWMgcmVtb3ZlRnJvbUNhY2hlKCk6IHZvaWQge1xuICAgIHRocm93IG5ldyBJbGxlZ2FsU3RhdGVFcnJvcigncmVtb3ZlRnJvbUNhY2hlIGFjdGl2YXRpb24gam9iIHNob3VsZCBub3QgcmVhY2ggd29ya2Zsb3cnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUcmFuc2Zvcm1zIGZhaWx1cmVzIGludG8gYSBjb21tYW5kIHRvIGJlIHNlbnQgdG8gdGhlIHNlcnZlci5cbiAgICogVXNlZCB0byBoYW5kbGUgYW55IGZhaWx1cmUgZW1pdHRlZCBieSB0aGUgV29ya2Zsb3cuXG4gICAqL1xuICBhc3luYyBoYW5kbGVXb3JrZmxvd0ZhaWx1cmUoZXJyb3I6IHVua25vd24pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAodGhpcy5jYW5jZWxsZWQgJiYgaXNDYW5jZWxsYXRpb24oZXJyb3IpKSB7XG4gICAgICB0aGlzLnB1c2hDb21tYW5kKHsgY2FuY2VsV29ya2Zsb3dFeGVjdXRpb246IHt9IH0sIHRydWUpO1xuICAgIH0gZWxzZSBpZiAoZXJyb3IgaW5zdGFuY2VvZiBDb250aW51ZUFzTmV3KSB7XG4gICAgICB0aGlzLnB1c2hDb21tYW5kKHsgY29udGludWVBc05ld1dvcmtmbG93RXhlY3V0aW9uOiBlcnJvci5jb21tYW5kIH0sIHRydWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoIShlcnJvciBpbnN0YW5jZW9mIFRlbXBvcmFsRmFpbHVyZSkpIHtcbiAgICAgICAgLy8gVGhpcyByZXN1bHRzIGluIGFuIHVuaGFuZGxlZCByZWplY3Rpb24gd2hpY2ggd2lsbCBmYWlsIHRoZSBhY3RpdmF0aW9uXG4gICAgICAgIC8vIHByZXZlbnRpbmcgaXQgZnJvbSBjb21wbGV0aW5nLlxuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH1cbiAgICAgIC8vIEZhaWwgdGhlIHdvcmtmbG93LiBXZSBkbyBub3Qgd2FudCB0byBpc3N1ZSB1bmZpbmlzaGVkSGFuZGxlcnMgd2FybmluZ3MuIFRvIGFjaGlldmUgdGhhdCwgd2VcbiAgICAgIC8vIG1hcmsgYWxsIGhhbmRsZXJzIGFzIGNvbXBsZXRlZCBub3cuXG4gICAgICB0aGlzLmluUHJvZ3Jlc3NTaWduYWxzLmNsZWFyKCk7XG4gICAgICB0aGlzLmluUHJvZ3Jlc3NVcGRhdGVzLmNsZWFyKCk7XG4gICAgICB0aGlzLnB1c2hDb21tYW5kKFxuICAgICAgICB7XG4gICAgICAgICAgZmFpbFdvcmtmbG93RXhlY3V0aW9uOiB7XG4gICAgICAgICAgICBmYWlsdXJlOiB0aGlzLmVycm9yVG9GYWlsdXJlKGVycm9yKSxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICB0cnVlXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgY29tcGxldGVRdWVyeShxdWVyeUlkOiBzdHJpbmcsIHJlc3VsdDogdW5rbm93bik6IHZvaWQge1xuICAgIHRoaXMucHVzaENvbW1hbmQoe1xuICAgICAgcmVzcG9uZFRvUXVlcnk6IHsgcXVlcnlJZCwgc3VjY2VlZGVkOiB7IHJlc3BvbnNlOiB0aGlzLnBheWxvYWRDb252ZXJ0ZXIudG9QYXlsb2FkKHJlc3VsdCkgfSB9LFxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBmYWlsUXVlcnkocXVlcnlJZDogc3RyaW5nLCBlcnJvcjogdW5rbm93bik6IHZvaWQge1xuICAgIHRoaXMucHVzaENvbW1hbmQoe1xuICAgICAgcmVzcG9uZFRvUXVlcnk6IHtcbiAgICAgICAgcXVlcnlJZCxcbiAgICAgICAgZmFpbGVkOiB0aGlzLmVycm9yVG9GYWlsdXJlKGVuc3VyZVRlbXBvcmFsRmFpbHVyZShlcnJvcikpLFxuICAgICAgfSxcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgYWNjZXB0VXBkYXRlKHByb3RvY29sSW5zdGFuY2VJZDogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5wdXNoQ29tbWFuZCh7IHVwZGF0ZVJlc3BvbnNlOiB7IHByb3RvY29sSW5zdGFuY2VJZCwgYWNjZXB0ZWQ6IHt9IH0gfSk7XG4gIH1cblxuICBwcml2YXRlIGNvbXBsZXRlVXBkYXRlKHByb3RvY29sSW5zdGFuY2VJZDogc3RyaW5nLCByZXN1bHQ6IHVua25vd24pOiB2b2lkIHtcbiAgICB0aGlzLnB1c2hDb21tYW5kKHtcbiAgICAgIHVwZGF0ZVJlc3BvbnNlOiB7IHByb3RvY29sSW5zdGFuY2VJZCwgY29tcGxldGVkOiB0aGlzLnBheWxvYWRDb252ZXJ0ZXIudG9QYXlsb2FkKHJlc3VsdCkgfSxcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgcmVqZWN0VXBkYXRlKHByb3RvY29sSW5zdGFuY2VJZDogc3RyaW5nLCBlcnJvcjogdW5rbm93bik6IHZvaWQge1xuICAgIHRoaXMucHVzaENvbW1hbmQoe1xuICAgICAgdXBkYXRlUmVzcG9uc2U6IHtcbiAgICAgICAgcHJvdG9jb2xJbnN0YW5jZUlkLFxuICAgICAgICByZWplY3RlZDogdGhpcy5lcnJvclRvRmFpbHVyZShlbnN1cmVUZW1wb3JhbEZhaWx1cmUoZXJyb3IpKSxcbiAgICAgIH0sXG4gICAgfSk7XG4gIH1cblxuICAvKiogQ29uc3VtZSBhIGNvbXBsZXRpb24gaWYgaXQgZXhpc3RzIGluIFdvcmtmbG93IHN0YXRlICovXG4gIHByaXZhdGUgbWF5YmVDb25zdW1lQ29tcGxldGlvbih0eXBlOiBrZXlvZiBBY3RpdmF0b3JbJ2NvbXBsZXRpb25zJ10sIHRhc2tTZXE6IG51bWJlcik6IENvbXBsZXRpb24gfCB1bmRlZmluZWQge1xuICAgIGNvbnN0IGNvbXBsZXRpb24gPSB0aGlzLmNvbXBsZXRpb25zW3R5cGVdLmdldCh0YXNrU2VxKTtcbiAgICBpZiAoY29tcGxldGlvbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLmNvbXBsZXRpb25zW3R5cGVdLmRlbGV0ZSh0YXNrU2VxKTtcbiAgICB9XG4gICAgcmV0dXJuIGNvbXBsZXRpb247XG4gIH1cblxuICAvKiogQ29uc3VtZSBhIGNvbXBsZXRpb24gaWYgaXQgZXhpc3RzIGluIFdvcmtmbG93IHN0YXRlLCB0aHJvd3MgaWYgaXQgZG9lc24ndCAqL1xuICBwcml2YXRlIGNvbnN1bWVDb21wbGV0aW9uKHR5cGU6IGtleW9mIEFjdGl2YXRvclsnY29tcGxldGlvbnMnXSwgdGFza1NlcTogbnVtYmVyKTogQ29tcGxldGlvbiB7XG4gICAgY29uc3QgY29tcGxldGlvbiA9IHRoaXMubWF5YmVDb25zdW1lQ29tcGxldGlvbih0eXBlLCB0YXNrU2VxKTtcbiAgICBpZiAoY29tcGxldGlvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgSWxsZWdhbFN0YXRlRXJyb3IoYE5vIGNvbXBsZXRpb24gZm9yIHRhc2tTZXEgJHt0YXNrU2VxfWApO1xuICAgIH1cbiAgICByZXR1cm4gY29tcGxldGlvbjtcbiAgfVxuXG4gIHByaXZhdGUgY29tcGxldGVXb3JrZmxvdyhyZXN1bHQ6IHVua25vd24pOiB2b2lkIHtcbiAgICB0aGlzLnB1c2hDb21tYW5kKFxuICAgICAge1xuICAgICAgICBjb21wbGV0ZVdvcmtmbG93RXhlY3V0aW9uOiB7XG4gICAgICAgICAgcmVzdWx0OiB0aGlzLnBheWxvYWRDb252ZXJ0ZXIudG9QYXlsb2FkKHJlc3VsdCksXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgdHJ1ZVxuICAgICk7XG4gIH1cblxuICBlcnJvclRvRmFpbHVyZShlcnI6IHVua25vd24pOiBQcm90b0ZhaWx1cmUge1xuICAgIHJldHVybiB0aGlzLmZhaWx1cmVDb252ZXJ0ZXIuZXJyb3JUb0ZhaWx1cmUoZXJyLCB0aGlzLnBheWxvYWRDb252ZXJ0ZXIpO1xuICB9XG5cbiAgZmFpbHVyZVRvRXJyb3IoZmFpbHVyZTogUHJvdG9GYWlsdXJlKTogRXJyb3Ige1xuICAgIHJldHVybiB0aGlzLmZhaWx1cmVDb252ZXJ0ZXIuZmFpbHVyZVRvRXJyb3IoZmFpbHVyZSwgdGhpcy5wYXlsb2FkQ29udmVydGVyKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRTZXE8VCBleHRlbmRzIHsgc2VxPzogbnVtYmVyIHwgbnVsbCB9PihhY3RpdmF0aW9uOiBUKTogbnVtYmVyIHtcbiAgY29uc3Qgc2VxID0gYWN0aXZhdGlvbi5zZXE7XG4gIGlmIChzZXEgPT09IHVuZGVmaW5lZCB8fCBzZXEgPT09IG51bGwpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBHb3QgYWN0aXZhdGlvbiB3aXRoIG5vIHNlcSBhdHRyaWJ1dGVgKTtcbiAgfVxuICByZXR1cm4gc2VxO1xufVxuXG5mdW5jdGlvbiBtYWtlVW5maW5pc2hlZFVwZGF0ZUhhbmRsZXJNZXNzYWdlKGhhbmRsZXJFeGVjdXRpb25zOiBNZXNzYWdlSGFuZGxlckV4ZWN1dGlvbltdKTogc3RyaW5nIHtcbiAgY29uc3QgbWVzc2FnZSA9IGBcbltUTVBSTDExMDJdIFdvcmtmbG93IGZpbmlzaGVkIHdoaWxlIGFuIHVwZGF0ZSBoYW5kbGVyIHdhcyBzdGlsbCBydW5uaW5nLiBUaGlzIG1heSBoYXZlIGludGVycnVwdGVkIHdvcmsgdGhhdCB0aGVcbnVwZGF0ZSBoYW5kbGVyIHdhcyBkb2luZywgYW5kIHRoZSBjbGllbnQgdGhhdCBzZW50IHRoZSB1cGRhdGUgd2lsbCByZWNlaXZlIGEgJ3dvcmtmbG93IGV4ZWN1dGlvblxuYWxyZWFkeSBjb21wbGV0ZWQnIFJQQ0Vycm9yIGluc3RlYWQgb2YgdGhlIHVwZGF0ZSByZXN1bHQuIFlvdSBjYW4gd2FpdCBmb3IgYWxsIHVwZGF0ZSBhbmQgc2lnbmFsXG5oYW5kbGVycyB0byBjb21wbGV0ZSBieSB1c2luZyBcXGBhd2FpdCB3b3JrZmxvdy5jb25kaXRpb24od29ya2Zsb3cuYWxsSGFuZGxlcnNGaW5pc2hlZClcXGAuXG5BbHRlcm5hdGl2ZWx5LCBpZiBib3RoIHlvdSBhbmQgdGhlIGNsaWVudHMgc2VuZGluZyB0aGUgdXBkYXRlIGFyZSBva2F5IHdpdGggaW50ZXJydXB0aW5nIHJ1bm5pbmcgaGFuZGxlcnNcbndoZW4gdGhlIHdvcmtmbG93IGZpbmlzaGVzLCBhbmQgY2F1c2luZyBjbGllbnRzIHRvIHJlY2VpdmUgZXJyb3JzLCB0aGVuIHlvdSBjYW4gZGlzYWJsZSB0aGlzIHdhcm5pbmcgYnlcbnBhc3NpbmcgYW4gb3B0aW9uIHdoZW4gc2V0dGluZyB0aGUgaGFuZGxlcjpcblxcYHdvcmtmbG93LnNldEhhbmRsZXIobXlVcGRhdGUsIG15VXBkYXRlSGFuZGxlciwge3VuZmluaXNoZWRQb2xpY3k6IEhhbmRsZXJVbmZpbmlzaGVkUG9saWN5LkFCQU5ET059KTtcXGAuYFxuICAgIC5yZXBsYWNlKC9cXG4vZywgJyAnKVxuICAgIC50cmltKCk7XG5cbiAgcmV0dXJuIGAke21lc3NhZ2V9IFRoZSBmb2xsb3dpbmcgdXBkYXRlcyB3ZXJlIHVuZmluaXNoZWQgKGFuZCB3YXJuaW5ncyB3ZXJlIG5vdCBkaXNhYmxlZCBmb3IgdGhlaXIgaGFuZGxlcik6ICR7SlNPTi5zdHJpbmdpZnkoXG4gICAgaGFuZGxlckV4ZWN1dGlvbnMubWFwKChleCkgPT4gKHsgbmFtZTogZXgubmFtZSwgaWQ6IGV4LmlkIH0pKVxuICApfWA7XG59XG5cbmZ1bmN0aW9uIG1ha2VVbmZpbmlzaGVkU2lnbmFsSGFuZGxlck1lc3NhZ2UoaGFuZGxlckV4ZWN1dGlvbnM6IE1lc3NhZ2VIYW5kbGVyRXhlY3V0aW9uW10pOiBzdHJpbmcge1xuICBjb25zdCBtZXNzYWdlID0gYFxuW1RNUFJMMTEwMl0gV29ya2Zsb3cgZmluaXNoZWQgd2hpbGUgYSBzaWduYWwgaGFuZGxlciB3YXMgc3RpbGwgcnVubmluZy4gVGhpcyBtYXkgaGF2ZSBpbnRlcnJ1cHRlZCB3b3JrIHRoYXQgdGhlXG5zaWduYWwgaGFuZGxlciB3YXMgZG9pbmcuIFlvdSBjYW4gd2FpdCBmb3IgYWxsIHVwZGF0ZSBhbmQgc2lnbmFsIGhhbmRsZXJzIHRvIGNvbXBsZXRlIGJ5IHVzaW5nXG5cXGBhd2FpdCB3b3JrZmxvdy5jb25kaXRpb24od29ya2Zsb3cuYWxsSGFuZGxlcnNGaW5pc2hlZClcXGAuIEFsdGVybmF0aXZlbHksIGlmIGJvdGggeW91IGFuZCB0aGVcbmNsaWVudHMgc2VuZGluZyB0aGUgdXBkYXRlIGFyZSBva2F5IHdpdGggaW50ZXJydXB0aW5nIHJ1bm5pbmcgaGFuZGxlcnMgd2hlbiB0aGUgd29ya2Zsb3cgZmluaXNoZXMsXG50aGVuIHlvdSBjYW4gZGlzYWJsZSB0aGlzIHdhcm5pbmcgYnkgcGFzc2luZyBhbiBvcHRpb24gd2hlbiBzZXR0aW5nIHRoZSBoYW5kbGVyOlxuXFxgd29ya2Zsb3cuc2V0SGFuZGxlcihteVNpZ25hbCwgbXlTaWduYWxIYW5kbGVyLCB7dW5maW5pc2hlZFBvbGljeTogSGFuZGxlclVuZmluaXNoZWRQb2xpY3kuQUJBTkRPTn0pO1xcYC5gXG5cbiAgICAucmVwbGFjZSgvXFxuL2csICcgJylcbiAgICAudHJpbSgpO1xuXG4gIGNvbnN0IG5hbWVzID0gbmV3IE1hcDxzdHJpbmcsIG51bWJlcj4oKTtcbiAgZm9yIChjb25zdCBleCBvZiBoYW5kbGVyRXhlY3V0aW9ucykge1xuICAgIGNvbnN0IGNvdW50ID0gbmFtZXMuZ2V0KGV4Lm5hbWUpIHx8IDA7XG4gICAgbmFtZXMuc2V0KGV4Lm5hbWUsIGNvdW50ICsgMSk7XG4gIH1cblxuICByZXR1cm4gYCR7bWVzc2FnZX0gVGhlIGZvbGxvd2luZyBzaWduYWxzIHdlcmUgdW5maW5pc2hlZCAoYW5kIHdhcm5pbmdzIHdlcmUgbm90IGRpc2FibGVkIGZvciB0aGVpciBoYW5kbGVyKTogJHtKU09OLnN0cmluZ2lmeShcbiAgICBBcnJheS5mcm9tKG5hbWVzLmVudHJpZXMoKSkubWFwKChbbmFtZSwgY291bnRdKSA9PiAoeyBuYW1lLCBjb3VudCB9KSlcbiAgKX1gO1xufVxuIiwiaW1wb3J0IHsgY29tcG9zZUludGVyY2VwdG9ycyB9IGZyb20gJ0B0ZW1wb3JhbGlvL2NvbW1vbi9saWIvaW50ZXJjZXB0b3JzJztcbmltcG9ydCB7IFNka0NvbXBvbmVudCB9IGZyb20gJ0B0ZW1wb3JhbGlvL2NvbW1vbic7XG5pbXBvcnQgeyB1bnRyYWNrUHJvbWlzZSB9IGZyb20gJy4vc3RhY2staGVscGVycyc7XG5pbXBvcnQgeyB0eXBlIFNpbmssIHR5cGUgU2lua3MsIHByb3h5U2lua3MgfSBmcm9tICcuL3NpbmtzJztcbmltcG9ydCB7IGlzQ2FuY2VsbGF0aW9uIH0gZnJvbSAnLi9lcnJvcnMnO1xuaW1wb3J0IHsgV29ya2Zsb3dJbmZvLCBDb250aW51ZUFzTmV3IH0gZnJvbSAnLi9pbnRlcmZhY2VzJztcbmltcG9ydCB7IGFzc2VydEluV29ya2Zsb3dDb250ZXh0IH0gZnJvbSAnLi9nbG9iYWwtYXR0cmlidXRlcyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgV29ya2Zsb3dMb2dnZXIgZXh0ZW5kcyBTaW5rIHtcbiAgdHJhY2UobWVzc2FnZTogc3RyaW5nLCBhdHRycz86IFJlY29yZDxzdHJpbmcsIHVua25vd24+KTogdm9pZDtcbiAgZGVidWcobWVzc2FnZTogc3RyaW5nLCBhdHRycz86IFJlY29yZDxzdHJpbmcsIHVua25vd24+KTogdm9pZDtcbiAgaW5mbyhtZXNzYWdlOiBzdHJpbmcsIGF0dHJzPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pOiB2b2lkO1xuICB3YXJuKG1lc3NhZ2U6IHN0cmluZywgYXR0cnM/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPik6IHZvaWQ7XG4gIGVycm9yKG1lc3NhZ2U6IHN0cmluZywgYXR0cnM/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPik6IHZvaWQ7XG59XG5cbi8qKlxuICogU2luayBpbnRlcmZhY2UgZm9yIGZvcndhcmRpbmcgbG9ncyBmcm9tIHRoZSBXb3JrZmxvdyBzYW5kYm94IHRvIHRoZSBXb3JrZXJcbiAqXG4gKiBAZGVwcmVjYXRlZCBEbyBub3QgdXNlIExvZ2dlclNpbmtzIGRpcmVjdGx5LiBUbyBsb2cgZnJvbSBXb3JrZmxvdyBjb2RlLCB1c2UgdGhlIGBsb2dgIG9iamVjdFxuICogICAgICAgICAgICAgZXhwb3J0ZWQgYnkgdGhlIGBAdGVtcG9yYWxpby93b3JrZmxvd2AgcGFja2FnZS4gVG8gY2FwdHVyZSBsb2cgbWVzc2FnZXMgZW1pdHRlZFxuICogICAgICAgICAgICAgYnkgV29ya2Zsb3cgY29kZSwgc2V0IHRoZSB7QGxpbmsgUnVudGltZS5sb2dnZXJ9IHByb3BlcnR5LlxuICovXG5leHBvcnQgaW50ZXJmYWNlIExvZ2dlclNpbmtzRGVwcmVjYXRlZCBleHRlbmRzIFNpbmtzIHtcbiAgLyoqXG4gICAqIEBkZXByZWNhdGVkIERvIG5vdCB1c2UgTG9nZ2VyU2lua3MgZGlyZWN0bHkuIFRvIGxvZyBmcm9tIFdvcmtmbG93IGNvZGUsIHVzZSB0aGUgYGxvZ2Agb2JqZWN0XG4gICAqICAgICAgICAgICAgIGV4cG9ydGVkIGJ5IHRoZSBgQHRlbXBvcmFsaW8vd29ya2Zsb3dgIHBhY2thZ2UuIFRvIGNhcHR1cmUgbG9nIG1lc3NhZ2VzIGVtaXR0ZWRcbiAgICogICAgICAgICAgICAgYnkgV29ya2Zsb3cgY29kZSwgc2V0IHRoZSB7QGxpbmsgUnVudGltZS5sb2dnZXJ9IHByb3BlcnR5LlxuICAgKi9cbiAgZGVmYXVsdFdvcmtlckxvZ2dlcjogV29ya2Zsb3dMb2dnZXI7XG59XG5cbi8qKlxuICogU2luayBpbnRlcmZhY2UgZm9yIGZvcndhcmRpbmcgbG9ncyBmcm9tIHRoZSBXb3JrZmxvdyBzYW5kYm94IHRvIHRoZSBXb3JrZXJcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBMb2dnZXJTaW5rc0ludGVybmFsIGV4dGVuZHMgU2lua3Mge1xuICBfX3RlbXBvcmFsX2xvZ2dlcjogV29ya2Zsb3dMb2dnZXI7XG59XG5cbmNvbnN0IGxvZ2dlclNpbmsgPSBwcm94eVNpbmtzPExvZ2dlclNpbmtzSW50ZXJuYWw+KCkuX190ZW1wb3JhbF9sb2dnZXI7XG5cbi8qKlxuICogU3ltYm9sIHVzZWQgYnkgdGhlIFNESyBsb2dnZXIgdG8gZXh0cmFjdCBhIHRpbWVzdGFtcCBmcm9tIGxvZyBhdHRyaWJ1dGVzLlxuICogQWxzbyBkZWZpbmVkIGluIGB3b3JrZXIvbG9nZ2VyLnRzYCAtIGludGVudGlvbmFsbHkgbm90IHNoYXJlZC5cbiAqL1xuY29uc3QgTG9nVGltZXN0YW1wID0gU3ltYm9sLmZvcignbG9nX3RpbWVzdGFtcCcpO1xuXG4vKipcbiAqIERlZmF1bHQgd29ya2Zsb3cgbG9nZ2VyLlxuICpcbiAqIFRoaXMgbG9nZ2VyIGlzIHJlcGxheS1hd2FyZSBhbmQgd2lsbCBvbWl0IGxvZyBtZXNzYWdlcyBvbiB3b3JrZmxvdyByZXBsYXkuIE1lc3NhZ2VzIGVtaXR0ZWQgYnkgdGhpcyBsb2dnZXIgYXJlXG4gKiBmdW5uZWxsZWQgdGhyb3VnaCBhIHNpbmsgdGhhdCBmb3J3YXJkcyB0aGVtIHRvIHRoZSBsb2dnZXIgcmVnaXN0ZXJlZCBvbiB7QGxpbmsgUnVudGltZS5sb2dnZXJ9LlxuICpcbiAqIEF0dHJpYnV0ZXMgZnJvbSB0aGUgY3VycmVudCBXb3JrZmxvdyBFeGVjdXRpb24gY29udGV4dCBhcmUgYXV0b21hdGljYWxseSBpbmNsdWRlZCBhcyBtZXRhZGF0YSBvbiBldmVyeSBsb2dcbiAqIGVudHJpZXMuIEFuIGV4dHJhIGBzZGtDb21wb25lbnRgIG1ldGFkYXRhIGF0dHJpYnV0ZSBpcyBhbHNvIGFkZGVkLCB3aXRoIHZhbHVlIGB3b3JrZmxvd2A7IHRoaXMgY2FuIGJlIHVzZWQgZm9yXG4gKiBmaW5lLWdyYWluZWQgZmlsdGVyaW5nIG9mIGxvZyBlbnRyaWVzIGZ1cnRoZXIgZG93bnN0cmVhbS5cbiAqXG4gKiBUbyBjdXN0b21pemUgbG9nIGF0dHJpYnV0ZXMsIHJlZ2lzdGVyIGEge0BsaW5rIFdvcmtmbG93T3V0Ym91bmRDYWxsc0ludGVyY2VwdG9yfSB0aGF0IGludGVyY2VwdHMgdGhlXG4gKiBgZ2V0TG9nQXR0cmlidXRlcygpYCBtZXRob2QuXG4gKlxuICogTm90aWNlIHRoYXQgc2luY2Ugc2lua3MgYXJlIHVzZWQgdG8gcG93ZXIgdGhpcyBsb2dnZXIsIGFueSBsb2cgYXR0cmlidXRlcyBtdXN0IGJlIHRyYW5zZmVyYWJsZSB2aWEgdGhlXG4gKiB7QGxpbmsgaHR0cHM6Ly9ub2RlanMub3JnL2FwaS93b3JrZXJfdGhyZWFkcy5odG1sI3dvcmtlcl90aHJlYWRzX3BvcnRfcG9zdG1lc3NhZ2VfdmFsdWVfdHJhbnNmZXJsaXN0IHwgcG9zdE1lc3NhZ2V9XG4gKiBBUEkuXG4gKlxuICogTk9URTogU3BlY2lmeWluZyBhIGN1c3RvbSBsb2dnZXIgdGhyb3VnaCB7QGxpbmsgZGVmYXVsdFNpbmt9IG9yIGJ5IG1hbnVhbGx5IHJlZ2lzdGVyaW5nIGEgc2luayBuYW1lZFxuICogYGRlZmF1bHRXb3JrZXJMb2dnZXJgIGhhcyBiZWVuIGRlcHJlY2F0ZWQuIFBsZWFzZSB1c2Uge0BsaW5rIFJ1bnRpbWUubG9nZ2VyfSBpbnN0ZWFkLlxuICovXG5leHBvcnQgY29uc3QgbG9nOiBXb3JrZmxvd0xvZ2dlciA9IE9iamVjdC5mcm9tRW50cmllcyhcbiAgKFsndHJhY2UnLCAnZGVidWcnLCAnaW5mbycsICd3YXJuJywgJ2Vycm9yJ10gYXMgQXJyYXk8a2V5b2YgV29ya2Zsb3dMb2dnZXI+KS5tYXAoKGxldmVsKSA9PiB7XG4gICAgcmV0dXJuIFtcbiAgICAgIGxldmVsLFxuICAgICAgKG1lc3NhZ2U6IHN0cmluZywgYXR0cnM/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikgPT4ge1xuICAgICAgICBjb25zdCBhY3RpdmF0b3IgPSBhc3NlcnRJbldvcmtmbG93Q29udGV4dCgnV29ya2Zsb3cubG9nKC4uLikgbWF5IG9ubHkgYmUgdXNlZCBmcm9tIHdvcmtmbG93IGNvbnRleHQuJyk7XG4gICAgICAgIGNvbnN0IGdldExvZ0F0dHJpYnV0ZXMgPSBjb21wb3NlSW50ZXJjZXB0b3JzKGFjdGl2YXRvci5pbnRlcmNlcHRvcnMub3V0Ym91bmQsICdnZXRMb2dBdHRyaWJ1dGVzJywgKGEpID0+IGEpO1xuICAgICAgICByZXR1cm4gbG9nZ2VyU2lua1tsZXZlbF0obWVzc2FnZSwge1xuICAgICAgICAgIC8vIEluamVjdCB0aGUgY2FsbCB0aW1lIGluIG5hbm9zZWNvbmQgcmVzb2x1dGlvbiBhcyBleHBlY3RlZCBieSB0aGUgd29ya2VyIGxvZ2dlci5cbiAgICAgICAgICBbTG9nVGltZXN0YW1wXTogYWN0aXZhdG9yLmdldFRpbWVPZkRheSgpLFxuICAgICAgICAgIHNka0NvbXBvbmVudDogU2RrQ29tcG9uZW50LndvcmtmbG93LFxuICAgICAgICAgIC4uLmdldExvZ0F0dHJpYnV0ZXMod29ya2Zsb3dMb2dBdHRyaWJ1dGVzKGFjdGl2YXRvci5pbmZvKSksXG4gICAgICAgICAgLi4uYXR0cnMsXG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICBdO1xuICB9KVxuKSBhcyBhbnk7XG5cbmV4cG9ydCBmdW5jdGlvbiBleGVjdXRlV2l0aExpZmVjeWNsZUxvZ2dpbmcoZm46ICgpID0+IFByb21pc2U8dW5rbm93bj4pOiBQcm9taXNlPHVua25vd24+IHtcbiAgbG9nLmRlYnVnKCdXb3JrZmxvdyBzdGFydGVkJywgeyBzZGtDb21wb25lbnQ6IFNka0NvbXBvbmVudC53b3JrZXIgfSk7XG4gIGNvbnN0IHAgPSBmbigpLnRoZW4oXG4gICAgKHJlcykgPT4ge1xuICAgICAgbG9nLmRlYnVnKCdXb3JrZmxvdyBjb21wbGV0ZWQnLCB7IHNka0NvbXBvbmVudDogU2RrQ29tcG9uZW50LndvcmtlciB9KTtcbiAgICAgIHJldHVybiByZXM7XG4gICAgfSxcbiAgICAoZXJyb3IpID0+IHtcbiAgICAgIC8vIEF2b2lkIHVzaW5nIGluc3RhbmNlb2YgY2hlY2tzIGluIGNhc2UgdGhlIG1vZHVsZXMgdGhleSdyZSBkZWZpbmVkIGluIGxvYWRlZCBtb3JlIHRoYW4gb25jZSxcbiAgICAgIC8vIGUuZy4gYnkgamVzdCBvciB3aGVuIG11bHRpcGxlIHZlcnNpb25zIGFyZSBpbnN0YWxsZWQuXG4gICAgICBpZiAodHlwZW9mIGVycm9yID09PSAnb2JqZWN0JyAmJiBlcnJvciAhPSBudWxsKSB7XG4gICAgICAgIGlmIChpc0NhbmNlbGxhdGlvbihlcnJvcikpIHtcbiAgICAgICAgICBsb2cuZGVidWcoJ1dvcmtmbG93IGNvbXBsZXRlZCBhcyBjYW5jZWxsZWQnLCB7IHNka0NvbXBvbmVudDogU2RrQ29tcG9uZW50LndvcmtlciB9KTtcbiAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgfSBlbHNlIGlmIChlcnJvciBpbnN0YW5jZW9mIENvbnRpbnVlQXNOZXcpIHtcbiAgICAgICAgICBsb2cuZGVidWcoJ1dvcmtmbG93IGNvbnRpbnVlZCBhcyBuZXcnLCB7IHNka0NvbXBvbmVudDogU2RrQ29tcG9uZW50LndvcmtlciB9KTtcbiAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgbG9nLndhcm4oJ1dvcmtmbG93IGZhaWxlZCcsIHsgZXJyb3IsIHNka0NvbXBvbmVudDogU2RrQ29tcG9uZW50LndvcmtlciB9KTtcbiAgICAgIHRocm93IGVycm9yO1xuICAgIH1cbiAgKTtcbiAgLy8gQXZvaWQgc2hvd2luZyB0aGlzIGludGVyY2VwdG9yIGluIHN0YWNrIHRyYWNlIHF1ZXJ5XG4gIHVudHJhY2tQcm9taXNlKHApO1xuICByZXR1cm4gcDtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGEgbWFwIG9mIGF0dHJpYnV0ZXMgdG8gYmUgc2V0IF9ieSBkZWZhdWx0XyBvbiBsb2cgbWVzc2FnZXMgZm9yIGEgZ2l2ZW4gV29ya2Zsb3cuXG4gKiBOb3RlIHRoYXQgdGhpcyBmdW5jdGlvbiBtYXkgYmUgY2FsbGVkIGZyb20gb3V0c2lkZSBvZiB0aGUgV29ya2Zsb3cgY29udGV4dCAoZWcuIGJ5IHRoZSB3b3JrZXIgaXRzZWxmKS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHdvcmtmbG93TG9nQXR0cmlidXRlcyhpbmZvOiBXb3JrZmxvd0luZm8pOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB7XG4gIHJldHVybiB7XG4gICAgbmFtZXNwYWNlOiBpbmZvLm5hbWVzcGFjZSxcbiAgICB0YXNrUXVldWU6IGluZm8udGFza1F1ZXVlLFxuICAgIHdvcmtmbG93SWQ6IGluZm8ud29ya2Zsb3dJZCxcbiAgICBydW5JZDogaW5mby5ydW5JZCxcbiAgICB3b3JrZmxvd1R5cGU6IGluZm8ud29ya2Zsb3dUeXBlLFxuICB9O1xufVxuIiwiLy8gLi4vcGFja2FnZS5qc29uIGlzIG91dHNpZGUgb2YgdGhlIFRTIHByb2plY3Qgcm9vdERpciB3aGljaCBjYXVzZXMgVFMgdG8gY29tcGxhaW4gYWJvdXQgdGhpcyBpbXBvcnQuXG4vLyBXZSBkbyBub3Qgd2FudCB0byBjaGFuZ2UgdGhlIHJvb3REaXIgYmVjYXVzZSBpdCBtZXNzZXMgdXAgdGhlIG91dHB1dCBzdHJ1Y3R1cmUuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L2Jhbi10cy1jb21tZW50XG4vLyBAdHMtaWdub3JlXG5pbXBvcnQgcGtnIGZyb20gJy4uL3BhY2thZ2UuanNvbic7XG5cbmV4cG9ydCBkZWZhdWx0IHBrZyBhcyB7IG5hbWU6IHN0cmluZzsgdmVyc2lvbjogc3RyaW5nIH07XG4iLCIvKipcbiAqIFR5cGUgZGVmaW5pdGlvbnMgZm9yIHRoZSBXb3JrZmxvdyBlbmQgb2YgdGhlIHNpbmtzIG1lY2hhbmlzbS5cbiAqXG4gKiBTaW5rcyBhcmUgYSBtZWNoYW5pc20gZm9yIGV4cG9ydGluZyBkYXRhIGZyb20gdGhlIFdvcmtmbG93IGlzb2xhdGUgdG8gdGhlXG4gKiBOb2RlLmpzIGVudmlyb25tZW50LCB0aGV5IGFyZSBuZWNlc3NhcnkgYmVjYXVzZSB0aGUgV29ya2Zsb3cgaGFzIG5vIHdheSB0b1xuICogY29tbXVuaWNhdGUgd2l0aCB0aGUgb3V0c2lkZSBXb3JsZC5cbiAqXG4gKiBTaW5rcyBhcmUgdHlwaWNhbGx5IHVzZWQgZm9yIGV4cG9ydGluZyBsb2dzLCBtZXRyaWNzIGFuZCB0cmFjZXMgb3V0IGZyb20gdGhlXG4gKiBXb3JrZmxvdy5cbiAqXG4gKiBTaW5rIGZ1bmN0aW9ucyBtYXkgbm90IHJldHVybiB2YWx1ZXMgdG8gdGhlIFdvcmtmbG93IGluIG9yZGVyIHRvIHByZXZlbnRcbiAqIGJyZWFraW5nIGRldGVybWluaXNtLlxuICpcbiAqIEBtb2R1bGVcbiAqL1xuXG5pbXBvcnQgeyBXb3JrZmxvd0luZm8gfSBmcm9tICcuL2ludGVyZmFjZXMnO1xuaW1wb3J0IHsgYXNzZXJ0SW5Xb3JrZmxvd0NvbnRleHQgfSBmcm9tICcuL2dsb2JhbC1hdHRyaWJ1dGVzJztcblxuLyoqXG4gKiBBbnkgZnVuY3Rpb24gc2lnbmF0dXJlIGNhbiBiZSB1c2VkIGZvciBTaW5rIGZ1bmN0aW9ucyBhcyBsb25nIGFzIHRoZSByZXR1cm4gdHlwZSBpcyBgdm9pZGAuXG4gKlxuICogV2hlbiBjYWxsaW5nIGEgU2luayBmdW5jdGlvbiwgYXJndW1lbnRzIGFyZSBjb3BpZWQgZnJvbSB0aGUgV29ya2Zsb3cgaXNvbGF0ZSB0byB0aGUgTm9kZS5qcyBlbnZpcm9ubWVudCB1c2luZ1xuICoge0BsaW5rIGh0dHBzOi8vbm9kZWpzLm9yZy9hcGkvd29ya2VyX3RocmVhZHMuaHRtbCN3b3JrZXJfdGhyZWFkc19wb3J0X3Bvc3RtZXNzYWdlX3ZhbHVlX3RyYW5zZmVybGlzdCB8IHBvc3RNZXNzYWdlfS5cblxuICogVGhpcyBjb25zdHJhaW5zIHRoZSBhcmd1bWVudCB0eXBlcyB0byBwcmltaXRpdmVzIChleGNsdWRpbmcgU3ltYm9scykuXG4gKi9cbmV4cG9ydCB0eXBlIFNpbmtGdW5jdGlvbiA9ICguLi5hcmdzOiBhbnlbXSkgPT4gdm9pZDtcblxuLyoqIEEgbWFwcGluZyBvZiBuYW1lIHRvIGZ1bmN0aW9uLCBkZWZpbmVzIGEgc2luZ2xlIHNpbmsgKGUuZy4gbG9nZ2VyKSAqL1xuZXhwb3J0IHR5cGUgU2luayA9IFJlY29yZDxzdHJpbmcsIFNpbmtGdW5jdGlvbj47XG4vKipcbiAqIFdvcmtmbG93IFNpbmsgYXJlIGEgbWFwcGluZyBvZiBuYW1lIHRvIHtAbGluayBTaW5rfVxuICovXG5leHBvcnQgdHlwZSBTaW5rcyA9IFJlY29yZDxzdHJpbmcsIFNpbms+O1xuXG4vKipcbiAqIENhbGwgaW5mb3JtYXRpb24gZm9yIGEgU2lua1xuICovXG5leHBvcnQgaW50ZXJmYWNlIFNpbmtDYWxsIHtcbiAgaWZhY2VOYW1lOiBzdHJpbmc7XG4gIGZuTmFtZTogc3RyaW5nO1xuICBhcmdzOiBhbnlbXTtcbiAgd29ya2Zsb3dJbmZvOiBXb3JrZmxvd0luZm87XG59XG5cbi8qKlxuICogR2V0IGEgcmVmZXJlbmNlIHRvIFNpbmtzIGZvciBleHBvcnRpbmcgZGF0YSBvdXQgb2YgdGhlIFdvcmtmbG93LlxuICpcbiAqIFRoZXNlIFNpbmtzICoqbXVzdCoqIGJlIHJlZ2lzdGVyZWQgd2l0aCB0aGUgV29ya2VyIGluIG9yZGVyIGZvciB0aGlzXG4gKiBtZWNoYW5pc20gdG8gd29yay5cbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IHByb3h5U2lua3MsIFNpbmtzIH0gZnJvbSAnQHRlbXBvcmFsaW8vd29ya2Zsb3cnO1xuICpcbiAqIGludGVyZmFjZSBNeVNpbmtzIGV4dGVuZHMgU2lua3Mge1xuICogICBsb2dnZXI6IHtcbiAqICAgICBpbmZvKG1lc3NhZ2U6IHN0cmluZyk6IHZvaWQ7XG4gKiAgICAgZXJyb3IobWVzc2FnZTogc3RyaW5nKTogdm9pZDtcbiAqICAgfTtcbiAqIH1cbiAqXG4gKiBjb25zdCB7IGxvZ2dlciB9ID0gcHJveHlTaW5rczxNeURlcGVuZGVuY2llcz4oKTtcbiAqIGxvZ2dlci5pbmZvKCdzZXR0aW5nIHVwJyk7XG4gKlxuICogZXhwb3J0IGZ1bmN0aW9uIG15V29ya2Zsb3coKSB7XG4gKiAgIHJldHVybiB7XG4gKiAgICAgYXN5bmMgZXhlY3V0ZSgpIHtcbiAqICAgICAgIGxvZ2dlci5pbmZvKFwiaGV5IGhvXCIpO1xuICogICAgICAgbG9nZ2VyLmVycm9yKFwibGV0cyBnb1wiKTtcbiAqICAgICB9XG4gKiAgIH07XG4gKiB9XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHByb3h5U2lua3M8VCBleHRlbmRzIFNpbmtzPigpOiBUIHtcbiAgcmV0dXJuIG5ldyBQcm94eShcbiAgICB7fSxcbiAgICB7XG4gICAgICBnZXQoXywgaWZhY2VOYW1lKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJveHkoXG4gICAgICAgICAge30sXG4gICAgICAgICAge1xuICAgICAgICAgICAgZ2V0KF8sIGZuTmFtZSkge1xuICAgICAgICAgICAgICByZXR1cm4gKC4uLmFyZ3M6IGFueVtdKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgYWN0aXZhdG9yID0gYXNzZXJ0SW5Xb3JrZmxvd0NvbnRleHQoXG4gICAgICAgICAgICAgICAgICAnUHJveGllZCBzaW5rcyBmdW5jdGlvbnMgbWF5IG9ubHkgYmUgdXNlZCBmcm9tIGEgV29ya2Zsb3cgRXhlY3V0aW9uLidcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIGFjdGl2YXRvci5zaW5rQ2FsbHMucHVzaCh7XG4gICAgICAgICAgICAgICAgICBpZmFjZU5hbWU6IGlmYWNlTmFtZSBhcyBzdHJpbmcsXG4gICAgICAgICAgICAgICAgICBmbk5hbWU6IGZuTmFtZSBhcyBzdHJpbmcsXG4gICAgICAgICAgICAgICAgICAvLyBTaW5rIGZ1bmN0aW9uIGRvZXNuJ3QgZ2V0IGNhbGxlZCBpbW1lZGlhdGVseS4gTWFrZSBhIGNsb25lIG9mIHRoZSBzaW5rJ3MgYXJncywgc28gdGhhdCBmdXJ0aGVyIG11dGF0aW9uc1xuICAgICAgICAgICAgICAgICAgLy8gdG8gdGhlc2Ugb2JqZWN0cyBkb24ndCBjb3JydXB0IHRoZSBhcmdzIHRoYXQgdGhlIHNpbmsgZnVuY3Rpb24gd2lsbCByZWNlaXZlLiBPbmx5IGF2YWlsYWJsZSBmcm9tIG5vZGUgMTcuXG4gICAgICAgICAgICAgICAgICBhcmdzOiAoZ2xvYmFsVGhpcyBhcyBhbnkpLnN0cnVjdHVyZWRDbG9uZSA/IChnbG9iYWxUaGlzIGFzIGFueSkuc3RydWN0dXJlZENsb25lKGFyZ3MpIDogYXJncyxcbiAgICAgICAgICAgICAgICAgIC8vIGFjdGl2YXRvci5pbmZvIGlzIGludGVybmFsbHkgY29weS1vbi13cml0ZS4gVGhpcyBlbnN1cmUgdGhhdCBhbnkgZnVydGhlciBtdXRhdGlvbnNcbiAgICAgICAgICAgICAgICAgIC8vIHRvIHRoZSB3b3JrZmxvdyBzdGF0ZSBpbiB0aGUgY29udGV4dCBvZiB0aGUgcHJlc2VudCBhY3RpdmF0aW9uIHdpbGwgbm90IGNvcnJ1cHQgdGhlXG4gICAgICAgICAgICAgICAgICAvLyB3b3JrZmxvd0luZm8gc3RhdGUgdGhhdCBnZXRzIHBhc3NlZCB3aGVuIHRoZSBzaW5rIGZ1bmN0aW9uIGFjdHVhbGx5IGdldHMgY2FsbGVkLlxuICAgICAgICAgICAgICAgICAgd29ya2Zsb3dJbmZvOiBhY3RpdmF0b3IuaW5mbyxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfVxuICAgICAgICApO1xuICAgICAgfSxcbiAgICB9XG4gICkgYXMgYW55O1xufVxuIiwiaW1wb3J0IHsgbWF5YmVHZXRBY3RpdmF0b3JVbnR5cGVkIH0gZnJvbSAnLi9nbG9iYWwtYXR0cmlidXRlcyc7XG5pbXBvcnQgdHlwZSB7IFByb21pc2VTdGFja1N0b3JlIH0gZnJvbSAnLi9pbnRlcm5hbHMnO1xuXG4vKipcbiAqIEhlbHBlciBmdW5jdGlvbiB0byByZW1vdmUgYSBwcm9taXNlIGZyb20gYmVpbmcgdHJhY2tlZCBmb3Igc3RhY2sgdHJhY2UgcXVlcnkgcHVycG9zZXNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVudHJhY2tQcm9taXNlKHByb21pc2U6IFByb21pc2U8dW5rbm93bj4pOiB2b2lkIHtcbiAgY29uc3Qgc3RvcmUgPSAobWF5YmVHZXRBY3RpdmF0b3JVbnR5cGVkKCkgYXMgYW55KT8ucHJvbWlzZVN0YWNrU3RvcmUgYXMgUHJvbWlzZVN0YWNrU3RvcmUgfCB1bmRlZmluZWQ7XG4gIGlmICghc3RvcmUpIHJldHVybjtcbiAgc3RvcmUuY2hpbGRUb1BhcmVudC5kZWxldGUocHJvbWlzZSk7XG4gIHN0b3JlLnByb21pc2VUb1N0YWNrLmRlbGV0ZShwcm9taXNlKTtcbn1cbiIsImltcG9ydCB7IENhbmNlbGxhdGlvblNjb3BlIH0gZnJvbSAnLi9jYW5jZWxsYXRpb24tc2NvcGUnO1xuaW1wb3J0IHsgdW50cmFja1Byb21pc2UgfSBmcm9tICcuL3N0YWNrLWhlbHBlcnMnO1xuXG4vKipcbiAqIEEgYFByb21pc2VMaWtlYCBoZWxwZXIgd2hpY2ggZXhwb3NlcyBpdHMgYHJlc29sdmVgIGFuZCBgcmVqZWN0YCBtZXRob2RzLlxuICpcbiAqIFRyaWdnZXIgaXMgQ2FuY2VsbGF0aW9uU2NvcGUtYXdhcmU6IGl0IGlzIGxpbmtlZCB0byB0aGUgY3VycmVudCBzY29wZSBvblxuICogY29uc3RydWN0aW9uIGFuZCB0aHJvd3Mgd2hlbiB0aGF0IHNjb3BlIGlzIGNhbmNlbGxlZC5cbiAqXG4gKiBVc2VmdWwgZm9yIGUuZy4gd2FpdGluZyBmb3IgdW5ibG9ja2luZyBhIFdvcmtmbG93IGZyb20gYSBTaWduYWwuXG4gKlxuICogQGV4YW1wbGVcbiAqIDwhLS1TTklQU1RBUlQgdHlwZXNjcmlwdC10cmlnZ2VyLXdvcmtmbG93LS0+XG4gKiA8IS0tU05JUEVORC0tPlxuICovXG5leHBvcnQgY2xhc3MgVHJpZ2dlcjxUPiBpbXBsZW1lbnRzIFByb21pc2VMaWtlPFQ+IHtcbiAgLy8gVHlwZXNjcmlwdCBkb2VzIG5vdCByZWFsaXplIHRoYXQgdGhlIHByb21pc2UgZXhlY3V0b3IgaXMgcnVuIHN5bmNocm9ub3VzbHkgaW4gdGhlIGNvbnN0cnVjdG9yXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvYmFuLXRzLWNvbW1lbnRcbiAgLy8gQHRzLWlnbm9yZVxuICBwdWJsaWMgcmVhZG9ubHkgcmVzb2x2ZTogKHZhbHVlOiBUIHwgUHJvbWlzZUxpa2U8VD4pID0+IHZvaWQ7XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvYmFuLXRzLWNvbW1lbnRcbiAgLy8gQHRzLWlnbm9yZVxuICBwdWJsaWMgcmVhZG9ubHkgcmVqZWN0OiAocmVhc29uPzogYW55KSA9PiB2b2lkO1xuICBwcm90ZWN0ZWQgcmVhZG9ubHkgcHJvbWlzZTogUHJvbWlzZTxUPjtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLnByb21pc2UgPSBuZXcgUHJvbWlzZTxUPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCBzY29wZSA9IENhbmNlbGxhdGlvblNjb3BlLmN1cnJlbnQoKTtcbiAgICAgIGlmIChzY29wZS5jYW5jZWxsYWJsZSkge1xuICAgICAgICB1bnRyYWNrUHJvbWlzZShzY29wZS5jYW5jZWxSZXF1ZXN0ZWQuY2F0Y2gocmVqZWN0KSk7XG4gICAgICB9XG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L2Jhbi10cy1jb21tZW50XG4gICAgICAvLyBAdHMtaWdub3JlXG4gICAgICB0aGlzLnJlc29sdmUgPSByZXNvbHZlO1xuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9iYW4tdHMtY29tbWVudFxuICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgdGhpcy5yZWplY3QgPSByZWplY3Q7XG4gICAgfSk7XG4gICAgLy8gQXZvaWQgdW5oYW5kbGVkIHJlamVjdGlvbnNcbiAgICB1bnRyYWNrUHJvbWlzZSh0aGlzLnByb21pc2UuY2F0Y2goKCkgPT4gdW5kZWZpbmVkKSk7XG4gIH1cblxuICB0aGVuPFRSZXN1bHQxID0gVCwgVFJlc3VsdDIgPSBuZXZlcj4oXG4gICAgb25mdWxmaWxsZWQ/OiAoKHZhbHVlOiBUKSA9PiBUUmVzdWx0MSB8IFByb21pc2VMaWtlPFRSZXN1bHQxPikgfCB1bmRlZmluZWQgfCBudWxsLFxuICAgIG9ucmVqZWN0ZWQ/OiAoKHJlYXNvbjogYW55KSA9PiBUUmVzdWx0MiB8IFByb21pc2VMaWtlPFRSZXN1bHQyPikgfCB1bmRlZmluZWQgfCBudWxsXG4gICk6IFByb21pc2VMaWtlPFRSZXN1bHQxIHwgVFJlc3VsdDI+IHtcbiAgICByZXR1cm4gdGhpcy5wcm9taXNlLnRoZW4ob25mdWxmaWxsZWQsIG9ucmVqZWN0ZWQpO1xuICB9XG59XG4iLCJpbXBvcnQgdHlwZSB7IEFzeW5jTG9jYWxTdG9yYWdlIGFzIEFMUyB9IGZyb20gJ25vZGU6YXN5bmNfaG9va3MnO1xuXG4vKipcbiAqIE9wdGlvbiBmb3IgY29uc3RydWN0aW5nIGEgVXBkYXRlU2NvcGVcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBVcGRhdGVTY29wZU9wdGlvbnMge1xuICAvKipcbiAgICogIEEgd29ya2Zsb3ctdW5pcXVlIGlkZW50aWZpZXIgZm9yIHRoaXMgdXBkYXRlLlxuICAgKi9cbiAgaWQ6IHN0cmluZztcblxuICAvKipcbiAgICogIFRoZSB1cGRhdGUgdHlwZSBuYW1lLlxuICAgKi9cbiAgbmFtZTogc3RyaW5nO1xufVxuXG4vLyBBc3luY0xvY2FsU3RvcmFnZSBpcyBpbmplY3RlZCB2aWEgdm0gbW9kdWxlIGludG8gZ2xvYmFsIHNjb3BlLlxuLy8gSW4gY2FzZSBXb3JrZmxvdyBjb2RlIGlzIGltcG9ydGVkIGluIE5vZGUuanMgY29udGV4dCwgcmVwbGFjZSB3aXRoIGFuIGVtcHR5IGNsYXNzLlxuZXhwb3J0IGNvbnN0IEFzeW5jTG9jYWxTdG9yYWdlOiBuZXcgPFQ+KCkgPT4gQUxTPFQ+ID0gKGdsb2JhbFRoaXMgYXMgYW55KS5Bc3luY0xvY2FsU3RvcmFnZSA/PyBjbGFzcyB7fTtcblxuZXhwb3J0IGNsYXNzIFVwZGF0ZVNjb3BlIHtcbiAgLyoqXG4gICAqICBBIHdvcmtmbG93LXVuaXF1ZSBpZGVudGlmaWVyIGZvciB0aGlzIHVwZGF0ZS5cbiAgICovXG4gIHB1YmxpYyByZWFkb25seSBpZDogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiAgVGhlIHVwZGF0ZSB0eXBlIG5hbWUuXG4gICAqL1xuICBwdWJsaWMgcmVhZG9ubHkgbmFtZTogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKG9wdGlvbnM6IFVwZGF0ZVNjb3BlT3B0aW9ucykge1xuICAgIHRoaXMuaWQgPSBvcHRpb25zLmlkO1xuICAgIHRoaXMubmFtZSA9IG9wdGlvbnMubmFtZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBY3RpdmF0ZSB0aGUgc2NvcGUgYXMgY3VycmVudCBhbmQgcnVuIHRoZSB1cGRhdGUgaGFuZGxlciBgZm5gLlxuICAgKlxuICAgKiBAcmV0dXJuIHRoZSByZXN1bHQgb2YgYGZuYFxuICAgKi9cbiAgcnVuPFQ+KGZuOiAoKSA9PiBQcm9taXNlPFQ+KTogUHJvbWlzZTxUPiB7XG4gICAgcmV0dXJuIHN0b3JhZ2UucnVuKHRoaXMsIGZuKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGN1cnJlbnQgXCJhY3RpdmVcIiB1cGRhdGUgc2NvcGUuXG4gICAqL1xuICBzdGF0aWMgY3VycmVudCgpOiBVcGRhdGVTY29wZSB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHN0b3JhZ2UuZ2V0U3RvcmUoKTtcbiAgfVxuXG4gIC8qKiBBbGlhcyB0byBgbmV3IFVwZGF0ZVNjb3BlKHsgaWQsIG5hbWUgfSkucnVuKGZuKWAgKi9cbiAgc3RhdGljIHVwZGF0ZVdpdGhJbmZvPFQ+KGlkOiBzdHJpbmcsIG5hbWU6IHN0cmluZywgZm46ICgpID0+IFByb21pc2U8VD4pOiBQcm9taXNlPFQ+IHtcbiAgICByZXR1cm4gbmV3IHRoaXMoeyBpZCwgbmFtZSB9KS5ydW4oZm4pO1xuICB9XG59XG5cbmNvbnN0IHN0b3JhZ2UgPSBuZXcgQXN5bmNMb2NhbFN0b3JhZ2U8VXBkYXRlU2NvcGU+KCk7XG5cbi8qKlxuICogRGlzYWJsZSB0aGUgYXN5bmMgbG9jYWwgc3RvcmFnZSBmb3IgdXBkYXRlcy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRpc2FibGVVcGRhdGVTdG9yYWdlKCk6IHZvaWQge1xuICBzdG9yYWdlLmRpc2FibGUoKTtcbn1cbiIsIi8qKlxuICogRXhwb3J0ZWQgZnVuY3Rpb25zIGZvciB0aGUgV29ya2VyIHRvIGludGVyYWN0IHdpdGggdGhlIFdvcmtmbG93IGlzb2xhdGVcbiAqXG4gKiBAbW9kdWxlXG4gKi9cbmltcG9ydCB7IElsbGVnYWxTdGF0ZUVycm9yIH0gZnJvbSAnQHRlbXBvcmFsaW8vY29tbW9uJztcbmltcG9ydCB7IGNvbXBvc2VJbnRlcmNlcHRvcnMgfSBmcm9tICdAdGVtcG9yYWxpby9jb21tb24vbGliL2ludGVyY2VwdG9ycyc7XG5pbXBvcnQgeyBjb3Jlc2RrIH0gZnJvbSAnQHRlbXBvcmFsaW8vcHJvdG8nO1xuaW1wb3J0IHsgZGlzYWJsZVN0b3JhZ2UgfSBmcm9tICcuL2NhbmNlbGxhdGlvbi1zY29wZSc7XG5pbXBvcnQgeyBkaXNhYmxlVXBkYXRlU3RvcmFnZSB9IGZyb20gJy4vdXBkYXRlLXNjb3BlJztcbmltcG9ydCB7IFdvcmtmbG93SW50ZXJjZXB0b3JzRmFjdG9yeSB9IGZyb20gJy4vaW50ZXJjZXB0b3JzJztcbmltcG9ydCB7IFdvcmtmbG93Q3JlYXRlT3B0aW9uc0ludGVybmFsIH0gZnJvbSAnLi9pbnRlcmZhY2VzJztcbmltcG9ydCB7IEFjdGl2YXRvciB9IGZyb20gJy4vaW50ZXJuYWxzJztcbmltcG9ydCB7IHNldEFjdGl2YXRvclVudHlwZWQsIGdldEFjdGl2YXRvciB9IGZyb20gJy4vZ2xvYmFsLWF0dHJpYnV0ZXMnO1xuXG4vLyBFeHBvcnQgdGhlIHR5cGUgZm9yIHVzZSBvbiB0aGUgXCJ3b3JrZXJcIiBzaWRlXG5leHBvcnQgeyBQcm9taXNlU3RhY2tTdG9yZSB9IGZyb20gJy4vaW50ZXJuYWxzJztcblxuY29uc3QgZ2xvYmFsID0gZ2xvYmFsVGhpcyBhcyBhbnk7XG5jb25zdCBPcmlnaW5hbERhdGUgPSBnbG9iYWxUaGlzLkRhdGU7XG5cbi8qKlxuICogSW5pdGlhbGl6ZSB0aGUgaXNvbGF0ZSBydW50aW1lLlxuICpcbiAqIFNldHMgcmVxdWlyZWQgaW50ZXJuYWwgc3RhdGUgYW5kIGluc3RhbnRpYXRlcyB0aGUgd29ya2Zsb3cgYW5kIGludGVyY2VwdG9ycy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGluaXRSdW50aW1lKG9wdGlvbnM6IFdvcmtmbG93Q3JlYXRlT3B0aW9uc0ludGVybmFsKTogdm9pZCB7XG4gIGNvbnN0IGFjdGl2YXRvciA9IG5ldyBBY3RpdmF0b3Ioe1xuICAgIC4uLm9wdGlvbnMsXG4gICAgaW5mbzogZml4UHJvdG90eXBlcyh7XG4gICAgICAuLi5vcHRpb25zLmluZm8sXG4gICAgICB1bnNhZmU6IHsgLi4ub3B0aW9ucy5pbmZvLnVuc2FmZSwgbm93OiBPcmlnaW5hbERhdGUubm93IH0sXG4gICAgfSksXG4gIH0pO1xuICAvLyBUaGVyZSdzIG9uZSBhY3RpdmF0b3IgcGVyIHdvcmtmbG93IGluc3RhbmNlLCBzZXQgaXQgZ2xvYmFsbHkgb24gdGhlIGNvbnRleHQuXG4gIC8vIFdlIGRvIHRoaXMgYmVmb3JlIGltcG9ydGluZyBhbnkgdXNlciBjb2RlIHNvIHVzZXIgY29kZSBjYW4gc3RhdGljYWxseSByZWZlcmVuY2UgQHRlbXBvcmFsaW8vd29ya2Zsb3cgZnVuY3Rpb25zXG4gIC8vIGFzIHdlbGwgYXMgRGF0ZSBhbmQgTWF0aC5yYW5kb20uXG4gIHNldEFjdGl2YXRvclVudHlwZWQoYWN0aXZhdG9yKTtcblxuICAvLyB3ZWJwYWNrIGFsaWFzIHRvIHBheWxvYWRDb252ZXJ0ZXJQYXRoXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdmFyLXJlcXVpcmVzXG4gIGNvbnN0IGN1c3RvbVBheWxvYWRDb252ZXJ0ZXIgPSByZXF1aXJlKCdfX3RlbXBvcmFsX2N1c3RvbV9wYXlsb2FkX2NvbnZlcnRlcicpLnBheWxvYWRDb252ZXJ0ZXI7XG4gIC8vIFRoZSBgcGF5bG9hZENvbnZlcnRlcmAgZXhwb3J0IGlzIHZhbGlkYXRlZCBpbiB0aGUgV29ya2VyXG4gIGlmIChjdXN0b21QYXlsb2FkQ29udmVydGVyICE9IG51bGwpIHtcbiAgICBhY3RpdmF0b3IucGF5bG9hZENvbnZlcnRlciA9IGN1c3RvbVBheWxvYWRDb252ZXJ0ZXI7XG4gIH1cbiAgLy8gd2VicGFjayBhbGlhcyB0byBmYWlsdXJlQ29udmVydGVyUGF0aFxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXZhci1yZXF1aXJlc1xuICBjb25zdCBjdXN0b21GYWlsdXJlQ29udmVydGVyID0gcmVxdWlyZSgnX190ZW1wb3JhbF9jdXN0b21fZmFpbHVyZV9jb252ZXJ0ZXInKS5mYWlsdXJlQ29udmVydGVyO1xuICAvLyBUaGUgYGZhaWx1cmVDb252ZXJ0ZXJgIGV4cG9ydCBpcyB2YWxpZGF0ZWQgaW4gdGhlIFdvcmtlclxuICBpZiAoY3VzdG9tRmFpbHVyZUNvbnZlcnRlciAhPSBudWxsKSB7XG4gICAgYWN0aXZhdG9yLmZhaWx1cmVDb252ZXJ0ZXIgPSBjdXN0b21GYWlsdXJlQ29udmVydGVyO1xuICB9XG5cbiAgY29uc3QgeyBpbXBvcnRXb3JrZmxvd3MsIGltcG9ydEludGVyY2VwdG9ycyB9ID0gZ2xvYmFsLl9fVEVNUE9SQUxfXztcbiAgaWYgKGltcG9ydFdvcmtmbG93cyA9PT0gdW5kZWZpbmVkIHx8IGltcG9ydEludGVyY2VwdG9ycyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGhyb3cgbmV3IElsbGVnYWxTdGF0ZUVycm9yKCdXb3JrZmxvdyBidW5kbGUgZGlkIG5vdCByZWdpc3RlciBpbXBvcnQgaG9va3MnKTtcbiAgfVxuXG4gIGNvbnN0IGludGVyY2VwdG9ycyA9IGltcG9ydEludGVyY2VwdG9ycygpO1xuICBmb3IgKGNvbnN0IG1vZCBvZiBpbnRlcmNlcHRvcnMpIHtcbiAgICBjb25zdCBmYWN0b3J5OiBXb3JrZmxvd0ludGVyY2VwdG9yc0ZhY3RvcnkgPSBtb2QuaW50ZXJjZXB0b3JzO1xuICAgIGlmIChmYWN0b3J5ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGlmICh0eXBlb2YgZmFjdG9yeSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBGYWlsZWQgdG8gaW5pdGlhbGl6ZSB3b3JrZmxvd3MgaW50ZXJjZXB0b3JzOiBleHBlY3RlZCBhIGZ1bmN0aW9uLCBidXQgZ290OiAnJHtmYWN0b3J5fSdgKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGludGVyY2VwdG9ycyA9IGZhY3RvcnkoKTtcbiAgICAgIGFjdGl2YXRvci5pbnRlcmNlcHRvcnMuaW5ib3VuZC5wdXNoKC4uLihpbnRlcmNlcHRvcnMuaW5ib3VuZCA/PyBbXSkpO1xuICAgICAgYWN0aXZhdG9yLmludGVyY2VwdG9ycy5vdXRib3VuZC5wdXNoKC4uLihpbnRlcmNlcHRvcnMub3V0Ym91bmQgPz8gW10pKTtcbiAgICAgIGFjdGl2YXRvci5pbnRlcmNlcHRvcnMuaW50ZXJuYWxzLnB1c2goLi4uKGludGVyY2VwdG9ycy5pbnRlcm5hbHMgPz8gW10pKTtcbiAgICB9XG4gIH1cblxuICBjb25zdCBtb2QgPSBpbXBvcnRXb3JrZmxvd3MoKTtcbiAgY29uc3Qgd29ya2Zsb3dGbiA9IG1vZFthY3RpdmF0b3IuaW5mby53b3JrZmxvd1R5cGVdO1xuICBjb25zdCBkZWZhdWx0V29ya2Zsb3dGbiA9IG1vZFsnZGVmYXVsdCddO1xuXG4gIGlmICh0eXBlb2Ygd29ya2Zsb3dGbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGFjdGl2YXRvci53b3JrZmxvdyA9IHdvcmtmbG93Rm47XG4gIH0gZWxzZSBpZiAodHlwZW9mIGRlZmF1bHRXb3JrZmxvd0ZuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgYWN0aXZhdG9yLndvcmtmbG93ID0gZGVmYXVsdFdvcmtmbG93Rm47XG4gIH0gZWxzZSB7XG4gICAgY29uc3QgZGV0YWlscyA9XG4gICAgICB3b3JrZmxvd0ZuID09PSB1bmRlZmluZWRcbiAgICAgICAgPyAnbm8gc3VjaCBmdW5jdGlvbiBpcyBleHBvcnRlZCBieSB0aGUgd29ya2Zsb3cgYnVuZGxlJ1xuICAgICAgICA6IGBleHBlY3RlZCBhIGZ1bmN0aW9uLCBidXQgZ290OiAnJHt0eXBlb2Ygd29ya2Zsb3dGbn0nYDtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBGYWlsZWQgdG8gaW5pdGlhbGl6ZSB3b3JrZmxvdyBvZiB0eXBlICcke2FjdGl2YXRvci5pbmZvLndvcmtmbG93VHlwZX0nOiAke2RldGFpbHN9YCk7XG4gIH1cbn1cblxuLyoqXG4gKiBPYmplY3RzIHRyYW5zZmVyZWQgdG8gdGhlIFZNIGZyb20gb3V0c2lkZSBoYXZlIHByb3RvdHlwZXMgYmVsb25naW5nIHRvIHRoZVxuICogb3V0ZXIgY29udGV4dCwgd2hpY2ggbWVhbnMgdGhhdCBpbnN0YW5jZW9mIHdvbid0IHdvcmsgaW5zaWRlIHRoZSBWTS4gVGhpc1xuICogZnVuY3Rpb24gcmVjdXJzaXZlbHkgd2Fsa3Mgb3ZlciB0aGUgY29udGVudCBvZiBhbiBvYmplY3QsIGFuZCByZWNyZWF0ZSBzb21lXG4gKiBvZiB0aGVzZSBvYmplY3RzIChub3RhYmx5IEFycmF5LCBEYXRlIGFuZCBPYmplY3RzKS5cbiAqL1xuZnVuY3Rpb24gZml4UHJvdG90eXBlczxYPihvYmo6IFgpOiBYIHtcbiAgaWYgKG9iaiAhPSBudWxsICYmIHR5cGVvZiBvYmogPT09ICdvYmplY3QnKSB7XG4gICAgc3dpdGNoIChPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqKT8uY29uc3RydWN0b3I/Lm5hbWUpIHtcbiAgICAgIGNhc2UgJ0FycmF5JzpcbiAgICAgICAgcmV0dXJuIEFycmF5LmZyb20oKG9iaiBhcyBBcnJheTx1bmtub3duPikubWFwKGZpeFByb3RvdHlwZXMpKSBhcyBYO1xuICAgICAgY2FzZSAnRGF0ZSc6XG4gICAgICAgIHJldHVybiBuZXcgRGF0ZShvYmogYXMgdW5rbm93biBhcyBEYXRlKSBhcyBYO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIE9iamVjdC5mcm9tRW50cmllcyhPYmplY3QuZW50cmllcyhvYmopLm1hcCgoW2ssIHZdKTogW3N0cmluZywgYW55XSA9PiBbaywgZml4UHJvdG90eXBlcyh2KV0pKSBhcyBYO1xuICAgIH1cbiAgfSBlbHNlIHJldHVybiBvYmo7XG59XG5cbi8qKlxuICogSW5pdGlhbGl6ZSB0aGUgd29ya2Zsb3cuIE9yIHRvIGJlIGV4YWN0LCBfY29tcGxldGVfIGluaXRpYWxpemF0aW9uLCBhcyBtb3N0IHBhcnQgaGFzIGJlZW4gZG9uZSBpbiBjb25zdHJ1Y3RvcikuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbml0aWFsaXplKGluaXRpYWxpemVXb3JrZmxvd0pvYjogY29yZXNkay53b3JrZmxvd19hY3RpdmF0aW9uLklJbml0aWFsaXplV29ya2Zsb3cpOiB2b2lkIHtcbiAgZ2V0QWN0aXZhdG9yKCkuaW5pdGlhbGl6ZVdvcmtmbG93KGluaXRpYWxpemVXb3JrZmxvd0pvYik7XG59XG5cbi8qKlxuICogUnVuIGEgY2h1bmsgb2YgYWN0aXZhdGlvbiBqb2JzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhY3RpdmF0ZShhY3RpdmF0aW9uOiBjb3Jlc2RrLndvcmtmbG93X2FjdGl2YXRpb24uSVdvcmtmbG93QWN0aXZhdGlvbiwgYmF0Y2hJbmRleCA9IDApOiB2b2lkIHtcbiAgY29uc3QgYWN0aXZhdG9yID0gZ2V0QWN0aXZhdG9yKCk7XG4gIGNvbnN0IGludGVyY2VwdCA9IGNvbXBvc2VJbnRlcmNlcHRvcnMoYWN0aXZhdG9yLmludGVyY2VwdG9ycy5pbnRlcm5hbHMsICdhY3RpdmF0ZScsICh7IGFjdGl2YXRpb24gfSkgPT4ge1xuICAgIC8vIENhc3QgZnJvbSB0aGUgaW50ZXJmYWNlIHRvIHRoZSBjbGFzcyB3aGljaCBoYXMgdGhlIGB2YXJpYW50YCBhdHRyaWJ1dGUuXG4gICAgLy8gVGhpcyBpcyBzYWZlIGJlY2F1c2Ugd2Uga25vdyB0aGF0IGFjdGl2YXRpb24gaXMgYSBwcm90byBjbGFzcy5cbiAgICBjb25zdCBqb2JzID0gYWN0aXZhdGlvbi5qb2JzIGFzIGNvcmVzZGsud29ya2Zsb3dfYWN0aXZhdGlvbi5Xb3JrZmxvd0FjdGl2YXRpb25Kb2JbXTtcblxuICAgIC8vIEluaXRpYWxpemF0aW9uIHdpbGwgaGF2ZSBiZWVuIGhhbmRsZWQgYWxyZWFkeSwgYnV0IHdlIG1pZ2h0IHN0aWxsIG5lZWQgdG8gc3RhcnQgdGhlIHdvcmtmbG93IGZ1bmN0aW9uXG4gICAgY29uc3Qgc3RhcnRXb3JrZmxvd0pvYiA9IGpvYnNbMF0udmFyaWFudCA9PT0gJ2luaXRpYWxpemVXb3JrZmxvdycgPyBqb2JzLnNoaWZ0KCk/LmluaXRpYWxpemVXb3JrZmxvdyA6IHVuZGVmaW5lZDtcblxuICAgIGZvciAoY29uc3Qgam9iIG9mIGpvYnMpIHtcbiAgICAgIGlmIChqb2IudmFyaWFudCA9PT0gdW5kZWZpbmVkKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdFeHBlY3RlZCBqb2IudmFyaWFudCB0byBiZSBkZWZpbmVkJyk7XG5cbiAgICAgIGNvbnN0IHZhcmlhbnQgPSBqb2Jbam9iLnZhcmlhbnRdO1xuICAgICAgaWYgKCF2YXJpYW50KSB0aHJvdyBuZXcgVHlwZUVycm9yKGBFeHBlY3RlZCBqb2IuJHtqb2IudmFyaWFudH0gdG8gYmUgc2V0YCk7XG5cbiAgICAgIGFjdGl2YXRvcltqb2IudmFyaWFudF0odmFyaWFudCBhcyBhbnkgLyogVFMgY2FuJ3QgaW5mZXIgdGhpcyB0eXBlICovKTtcblxuICAgICAgaWYgKGpvYi52YXJpYW50ICE9PSAncXVlcnlXb3JrZmxvdycpIHRyeVVuYmxvY2tDb25kaXRpb25zKCk7XG4gICAgfVxuXG4gICAgaWYgKHN0YXJ0V29ya2Zsb3dKb2IpIHtcbiAgICAgIGNvbnN0IHNhZmVKb2JUeXBlczogY29yZXNkay53b3JrZmxvd19hY3RpdmF0aW9uLldvcmtmbG93QWN0aXZhdGlvbkpvYlsndmFyaWFudCddW10gPSBbXG4gICAgICAgICdpbml0aWFsaXplV29ya2Zsb3cnLFxuICAgICAgICAnc2lnbmFsV29ya2Zsb3cnLFxuICAgICAgICAnZG9VcGRhdGUnLFxuICAgICAgICAnY2FuY2VsV29ya2Zsb3cnLFxuICAgICAgICAndXBkYXRlUmFuZG9tU2VlZCcsXG4gICAgICBdO1xuICAgICAgaWYgKGpvYnMuc29tZSgoam9iKSA9PiAhc2FmZUpvYlR5cGVzLmluY2x1ZGVzKGpvYi52YXJpYW50KSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICAgICAnUmVjZWl2ZWQgYm90aCBpbml0aWFsaXplV29ya2Zsb3cgYW5kIG5vbi1zaWduYWwvbm9uLXVwZGF0ZSBqb2JzIGluIHRoZSBzYW1lIGFjdGl2YXRpb246ICcgK1xuICAgICAgICAgICAgSlNPTi5zdHJpbmdpZnkoam9icy5tYXAoKGpvYikgPT4gam9iLnZhcmlhbnQpKVxuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICBhY3RpdmF0b3Iuc3RhcnRXb3JrZmxvdyhzdGFydFdvcmtmbG93Sm9iKTtcbiAgICAgIHRyeVVuYmxvY2tDb25kaXRpb25zKCk7XG4gICAgfVxuICB9KTtcbiAgaW50ZXJjZXB0KHsgYWN0aXZhdGlvbiwgYmF0Y2hJbmRleCB9KTtcbn1cblxuLyoqXG4gKiBDb25jbHVkZSBhIHNpbmdsZSBhY3RpdmF0aW9uLlxuICogU2hvdWxkIGJlIGNhbGxlZCBhZnRlciBwcm9jZXNzaW5nIGFsbCBhY3RpdmF0aW9uIGpvYnMgYW5kIHF1ZXVlZCBtaWNyb3Rhc2tzLlxuICpcbiAqIEFjdGl2YXRpb24gZmFpbHVyZXMgYXJlIGhhbmRsZWQgaW4gdGhlIG1haW4gTm9kZS5qcyBpc29sYXRlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY29uY2x1ZGVBY3RpdmF0aW9uKCk6IGNvcmVzZGsud29ya2Zsb3dfY29tcGxldGlvbi5JV29ya2Zsb3dBY3RpdmF0aW9uQ29tcGxldGlvbiB7XG4gIGNvbnN0IGFjdGl2YXRvciA9IGdldEFjdGl2YXRvcigpO1xuICBhY3RpdmF0b3IucmVqZWN0QnVmZmVyZWRVcGRhdGVzKCk7XG4gIGNvbnN0IGludGVyY2VwdCA9IGNvbXBvc2VJbnRlcmNlcHRvcnMoYWN0aXZhdG9yLmludGVyY2VwdG9ycy5pbnRlcm5hbHMsICdjb25jbHVkZUFjdGl2YXRpb24nLCAoaW5wdXQpID0+IGlucHV0KTtcbiAgY29uc3QgYWN0aXZhdGlvbkNvbXBsZXRpb24gPSBhY3RpdmF0b3IuY29uY2x1ZGVBY3RpdmF0aW9uKCk7XG4gIGNvbnN0IHsgY29tbWFuZHMgfSA9IGludGVyY2VwdCh7IGNvbW1hbmRzOiBhY3RpdmF0aW9uQ29tcGxldGlvbi5jb21tYW5kcyB9KTtcbiAgaWYgKGFjdGl2YXRvci5jb21wbGV0ZWQpIHtcbiAgICBhY3RpdmF0b3Iud2FybklmVW5maW5pc2hlZEhhbmRsZXJzKCk7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIHJ1bklkOiBhY3RpdmF0b3IuaW5mby5ydW5JZCxcbiAgICBzdWNjZXNzZnVsOiB7IC4uLmFjdGl2YXRpb25Db21wbGV0aW9uLCBjb21tYW5kcyB9LFxuICB9O1xufVxuXG4vKipcbiAqIExvb3AgdGhyb3VnaCBhbGwgYmxvY2tlZCBjb25kaXRpb25zLCBldmFsdWF0ZSBhbmQgdW5ibG9jayBpZiBwb3NzaWJsZS5cbiAqXG4gKiBAcmV0dXJucyBudW1iZXIgb2YgdW5ibG9ja2VkIGNvbmRpdGlvbnMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0cnlVbmJsb2NrQ29uZGl0aW9ucygpOiBudW1iZXIge1xuICBsZXQgbnVtVW5ibG9ja2VkID0gMDtcbiAgZm9yICg7Oykge1xuICAgIGNvbnN0IHByZXZVbmJsb2NrZWQgPSBudW1VbmJsb2NrZWQ7XG4gICAgZm9yIChjb25zdCBbc2VxLCBjb25kXSBvZiBnZXRBY3RpdmF0b3IoKS5ibG9ja2VkQ29uZGl0aW9ucy5lbnRyaWVzKCkpIHtcbiAgICAgIGlmIChjb25kLmZuKCkpIHtcbiAgICAgICAgY29uZC5yZXNvbHZlKCk7XG4gICAgICAgIG51bVVuYmxvY2tlZCsrO1xuICAgICAgICAvLyBJdCBpcyBzYWZlIHRvIGRlbGV0ZSBlbGVtZW50cyBkdXJpbmcgbWFwIGl0ZXJhdGlvblxuICAgICAgICBnZXRBY3RpdmF0b3IoKS5ibG9ja2VkQ29uZGl0aW9ucy5kZWxldGUoc2VxKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHByZXZVbmJsb2NrZWQgPT09IG51bVVuYmxvY2tlZCkge1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIHJldHVybiBudW1VbmJsb2NrZWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkaXNwb3NlKCk6IHZvaWQge1xuICBjb25zdCBkaXNwb3NlID0gY29tcG9zZUludGVyY2VwdG9ycyhnZXRBY3RpdmF0b3IoKS5pbnRlcmNlcHRvcnMuaW50ZXJuYWxzLCAnZGlzcG9zZScsIGFzeW5jICgpID0+IHtcbiAgICBkaXNhYmxlU3RvcmFnZSgpO1xuICAgIGRpc2FibGVVcGRhdGVTdG9yYWdlKCk7XG4gIH0pO1xuICBkaXNwb3NlKHt9KTtcbn1cbiIsImltcG9ydCB7XG4gIEFjdGl2aXR5RnVuY3Rpb24sXG4gIEFjdGl2aXR5T3B0aW9ucyxcbiAgY29tcGlsZVJldHJ5UG9saWN5LFxuICBleHRyYWN0V29ya2Zsb3dUeXBlLFxuICBIYW5kbGVyVW5maW5pc2hlZFBvbGljeSxcbiAgTG9jYWxBY3Rpdml0eU9wdGlvbnMsXG4gIG1hcFRvUGF5bG9hZHMsXG4gIFF1ZXJ5RGVmaW5pdGlvbixcbiAgc2VhcmNoQXR0cmlidXRlUGF5bG9hZENvbnZlcnRlcixcbiAgU2VhcmNoQXR0cmlidXRlcyxcbiAgU2lnbmFsRGVmaW5pdGlvbixcbiAgdG9QYXlsb2FkcyxcbiAgVW50eXBlZEFjdGl2aXRpZXMsXG4gIFVwZGF0ZURlZmluaXRpb24sXG4gIFdpdGhXb3JrZmxvd0FyZ3MsXG4gIFdvcmtmbG93LFxuICBXb3JrZmxvd1Jlc3VsdFR5cGUsXG4gIFdvcmtmbG93UmV0dXJuVHlwZSxcbiAgV29ya2Zsb3dVcGRhdGVWYWxpZGF0b3JUeXBlLFxufSBmcm9tICdAdGVtcG9yYWxpby9jb21tb24nO1xuaW1wb3J0IHsgdmVyc2lvbmluZ0ludGVudFRvUHJvdG8gfSBmcm9tICdAdGVtcG9yYWxpby9jb21tb24vbGliL3ZlcnNpb25pbmctaW50ZW50LWVudW0nO1xuaW1wb3J0IHsgRHVyYXRpb24sIG1zT3B0aW9uYWxUb1RzLCBtc1RvTnVtYmVyLCBtc1RvVHMsIHJlcXVpcmVkVHNUb01zIH0gZnJvbSAnQHRlbXBvcmFsaW8vY29tbW9uL2xpYi90aW1lJztcbmltcG9ydCB7IGNvbXBvc2VJbnRlcmNlcHRvcnMgfSBmcm9tICdAdGVtcG9yYWxpby9jb21tb24vbGliL2ludGVyY2VwdG9ycyc7XG5pbXBvcnQgeyB0ZW1wb3JhbCB9IGZyb20gJ0B0ZW1wb3JhbGlvL3Byb3RvJztcbmltcG9ydCB7IENhbmNlbGxhdGlvblNjb3BlLCByZWdpc3RlclNsZWVwSW1wbGVtZW50YXRpb24gfSBmcm9tICcuL2NhbmNlbGxhdGlvbi1zY29wZSc7XG5pbXBvcnQgeyBVcGRhdGVTY29wZSB9IGZyb20gJy4vdXBkYXRlLXNjb3BlJztcbmltcG9ydCB7XG4gIEFjdGl2aXR5SW5wdXQsXG4gIExvY2FsQWN0aXZpdHlJbnB1dCxcbiAgU2lnbmFsV29ya2Zsb3dJbnB1dCxcbiAgU3RhcnRDaGlsZFdvcmtmbG93RXhlY3V0aW9uSW5wdXQsXG4gIFRpbWVySW5wdXQsXG59IGZyb20gJy4vaW50ZXJjZXB0b3JzJztcbmltcG9ydCB7XG4gIENoaWxkV29ya2Zsb3dDYW5jZWxsYXRpb25UeXBlLFxuICBDaGlsZFdvcmtmbG93T3B0aW9ucyxcbiAgQ2hpbGRXb3JrZmxvd09wdGlvbnNXaXRoRGVmYXVsdHMsXG4gIENvbnRpbnVlQXNOZXcsXG4gIENvbnRpbnVlQXNOZXdPcHRpb25zLFxuICBEZWZhdWx0U2lnbmFsSGFuZGxlcixcbiAgRW5oYW5jZWRTdGFja1RyYWNlLFxuICBIYW5kbGVyLFxuICBRdWVyeUhhbmRsZXJPcHRpb25zLFxuICBTaWduYWxIYW5kbGVyT3B0aW9ucyxcbiAgVXBkYXRlSGFuZGxlck9wdGlvbnMsXG4gIFdvcmtmbG93SW5mbyxcbiAgVXBkYXRlSW5mbyxcbn0gZnJvbSAnLi9pbnRlcmZhY2VzJztcbmltcG9ydCB7IExvY2FsQWN0aXZpdHlEb0JhY2tvZmYgfSBmcm9tICcuL2Vycm9ycyc7XG5pbXBvcnQgeyBhc3NlcnRJbldvcmtmbG93Q29udGV4dCwgZ2V0QWN0aXZhdG9yLCBtYXliZUdldEFjdGl2YXRvciB9IGZyb20gJy4vZ2xvYmFsLWF0dHJpYnV0ZXMnO1xuaW1wb3J0IHsgdW50cmFja1Byb21pc2UgfSBmcm9tICcuL3N0YWNrLWhlbHBlcnMnO1xuaW1wb3J0IHsgQ2hpbGRXb3JrZmxvd0hhbmRsZSwgRXh0ZXJuYWxXb3JrZmxvd0hhbmRsZSB9IGZyb20gJy4vd29ya2Zsb3ctaGFuZGxlJztcblxuLy8gQXZvaWQgYSBjaXJjdWxhciBkZXBlbmRlbmN5XG5yZWdpc3RlclNsZWVwSW1wbGVtZW50YXRpb24oc2xlZXApO1xuXG4vKipcbiAqIEFkZHMgZGVmYXVsdCB2YWx1ZXMgb2YgYHdvcmtmbG93SWRgIGFuZCBgY2FuY2VsbGF0aW9uVHlwZWAgdG8gZ2l2ZW4gd29ya2Zsb3cgb3B0aW9ucy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFkZERlZmF1bHRXb3JrZmxvd09wdGlvbnM8VCBleHRlbmRzIFdvcmtmbG93PihcbiAgb3B0czogV2l0aFdvcmtmbG93QXJnczxULCBDaGlsZFdvcmtmbG93T3B0aW9ucz5cbik6IENoaWxkV29ya2Zsb3dPcHRpb25zV2l0aERlZmF1bHRzIHtcbiAgY29uc3QgeyBhcmdzLCB3b3JrZmxvd0lkLCAuLi5yZXN0IH0gPSBvcHRzO1xuICByZXR1cm4ge1xuICAgIHdvcmtmbG93SWQ6IHdvcmtmbG93SWQgPz8gdXVpZDQoKSxcbiAgICBhcmdzOiAoYXJncyA/PyBbXSkgYXMgdW5rbm93bltdLFxuICAgIGNhbmNlbGxhdGlvblR5cGU6IENoaWxkV29ya2Zsb3dDYW5jZWxsYXRpb25UeXBlLldBSVRfQ0FOQ0VMTEFUSU9OX0NPTVBMRVRFRCxcbiAgICAuLi5yZXN0LFxuICB9O1xufVxuXG4vKipcbiAqIFB1c2ggYSBzdGFydFRpbWVyIGNvbW1hbmQgaW50byBzdGF0ZSBhY2N1bXVsYXRvciBhbmQgcmVnaXN0ZXIgY29tcGxldGlvblxuICovXG5mdW5jdGlvbiB0aW1lck5leHRIYW5kbGVyKGlucHV0OiBUaW1lcklucHV0KSB7XG4gIGNvbnN0IGFjdGl2YXRvciA9IGdldEFjdGl2YXRvcigpO1xuICByZXR1cm4gbmV3IFByb21pc2U8dm9pZD4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNvbnN0IHNjb3BlID0gQ2FuY2VsbGF0aW9uU2NvcGUuY3VycmVudCgpO1xuICAgIGlmIChzY29wZS5jb25zaWRlcmVkQ2FuY2VsbGVkKSB7XG4gICAgICB1bnRyYWNrUHJvbWlzZShzY29wZS5jYW5jZWxSZXF1ZXN0ZWQuY2F0Y2gocmVqZWN0KSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChzY29wZS5jYW5jZWxsYWJsZSkge1xuICAgICAgdW50cmFja1Byb21pc2UoXG4gICAgICAgIHNjb3BlLmNhbmNlbFJlcXVlc3RlZC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgaWYgKCFhY3RpdmF0b3IuY29tcGxldGlvbnMudGltZXIuZGVsZXRlKGlucHV0LnNlcSkpIHtcbiAgICAgICAgICAgIHJldHVybjsgLy8gQWxyZWFkeSByZXNvbHZlZCBvciBuZXZlciBzY2hlZHVsZWRcbiAgICAgICAgICB9XG4gICAgICAgICAgYWN0aXZhdG9yLnB1c2hDb21tYW5kKHtcbiAgICAgICAgICAgIGNhbmNlbFRpbWVyOiB7XG4gICAgICAgICAgICAgIHNlcTogaW5wdXQuc2VxLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9KTtcbiAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgfSlcbiAgICAgICk7XG4gICAgfVxuICAgIGFjdGl2YXRvci5wdXNoQ29tbWFuZCh7XG4gICAgICBzdGFydFRpbWVyOiB7XG4gICAgICAgIHNlcTogaW5wdXQuc2VxLFxuICAgICAgICBzdGFydFRvRmlyZVRpbWVvdXQ6IG1zVG9UcyhpbnB1dC5kdXJhdGlvbk1zKSxcbiAgICAgIH0sXG4gICAgfSk7XG4gICAgYWN0aXZhdG9yLmNvbXBsZXRpb25zLnRpbWVyLnNldChpbnB1dC5zZXEsIHtcbiAgICAgIHJlc29sdmUsXG4gICAgICByZWplY3QsXG4gICAgfSk7XG4gIH0pO1xufVxuXG4vKipcbiAqIEFzeW5jaHJvbm91cyBzbGVlcC5cbiAqXG4gKiBTY2hlZHVsZXMgYSB0aW1lciBvbiB0aGUgVGVtcG9yYWwgc2VydmljZS5cbiAqXG4gKiBAcGFyYW0gbXMgc2xlZXAgZHVyYXRpb24gLSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIG9yIHtAbGluayBodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9tcyB8IG1zLWZvcm1hdHRlZCBzdHJpbmd9LlxuICogSWYgZ2l2ZW4gYSBuZWdhdGl2ZSBudW1iZXIgb3IgMCwgdmFsdWUgd2lsbCBiZSBzZXQgdG8gMS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNsZWVwKG1zOiBEdXJhdGlvbik6IFByb21pc2U8dm9pZD4ge1xuICBjb25zdCBhY3RpdmF0b3IgPSBhc3NlcnRJbldvcmtmbG93Q29udGV4dCgnV29ya2Zsb3cuc2xlZXAoLi4uKSBtYXkgb25seSBiZSB1c2VkIGZyb20gYSBXb3JrZmxvdyBFeGVjdXRpb24nKTtcbiAgY29uc3Qgc2VxID0gYWN0aXZhdG9yLm5leHRTZXFzLnRpbWVyKys7XG5cbiAgY29uc3QgZHVyYXRpb25NcyA9IE1hdGgubWF4KDEsIG1zVG9OdW1iZXIobXMpKTtcblxuICBjb25zdCBleGVjdXRlID0gY29tcG9zZUludGVyY2VwdG9ycyhhY3RpdmF0b3IuaW50ZXJjZXB0b3JzLm91dGJvdW5kLCAnc3RhcnRUaW1lcicsIHRpbWVyTmV4dEhhbmRsZXIpO1xuXG4gIHJldHVybiBleGVjdXRlKHtcbiAgICBkdXJhdGlvbk1zLFxuICAgIHNlcSxcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHZhbGlkYXRlQWN0aXZpdHlPcHRpb25zKG9wdGlvbnM6IEFjdGl2aXR5T3B0aW9ucyk6IHZvaWQge1xuICBpZiAob3B0aW9ucy5zY2hlZHVsZVRvQ2xvc2VUaW1lb3V0ID09PSB1bmRlZmluZWQgJiYgb3B0aW9ucy5zdGFydFRvQ2xvc2VUaW1lb3V0ID09PSB1bmRlZmluZWQpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdSZXF1aXJlZCBlaXRoZXIgc2NoZWR1bGVUb0Nsb3NlVGltZW91dCBvciBzdGFydFRvQ2xvc2VUaW1lb3V0Jyk7XG4gIH1cbn1cblxuLy8gVXNlIHNhbWUgdmFsaWRhdGlvbiB3ZSB1c2UgZm9yIG5vcm1hbCBhY3Rpdml0aWVzXG5jb25zdCB2YWxpZGF0ZUxvY2FsQWN0aXZpdHlPcHRpb25zID0gdmFsaWRhdGVBY3Rpdml0eU9wdGlvbnM7XG5cbi8qKlxuICogUHVzaCBhIHNjaGVkdWxlQWN0aXZpdHkgY29tbWFuZCBpbnRvIGFjdGl2YXRvciBhY2N1bXVsYXRvciBhbmQgcmVnaXN0ZXIgY29tcGxldGlvblxuICovXG5mdW5jdGlvbiBzY2hlZHVsZUFjdGl2aXR5TmV4dEhhbmRsZXIoeyBvcHRpb25zLCBhcmdzLCBoZWFkZXJzLCBzZXEsIGFjdGl2aXR5VHlwZSB9OiBBY3Rpdml0eUlucHV0KTogUHJvbWlzZTx1bmtub3duPiB7XG4gIGNvbnN0IGFjdGl2YXRvciA9IGdldEFjdGl2YXRvcigpO1xuICB2YWxpZGF0ZUFjdGl2aXR5T3B0aW9ucyhvcHRpb25zKTtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBjb25zdCBzY29wZSA9IENhbmNlbGxhdGlvblNjb3BlLmN1cnJlbnQoKTtcbiAgICBpZiAoc2NvcGUuY29uc2lkZXJlZENhbmNlbGxlZCkge1xuICAgICAgdW50cmFja1Byb21pc2Uoc2NvcGUuY2FuY2VsUmVxdWVzdGVkLmNhdGNoKHJlamVjdCkpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoc2NvcGUuY2FuY2VsbGFibGUpIHtcbiAgICAgIHVudHJhY2tQcm9taXNlKFxuICAgICAgICBzY29wZS5jYW5jZWxSZXF1ZXN0ZWQuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgIGlmICghYWN0aXZhdG9yLmNvbXBsZXRpb25zLmFjdGl2aXR5LmhhcyhzZXEpKSB7XG4gICAgICAgICAgICByZXR1cm47IC8vIEFscmVhZHkgcmVzb2x2ZWQgb3IgbmV2ZXIgc2NoZWR1bGVkXG4gICAgICAgICAgfVxuICAgICAgICAgIGFjdGl2YXRvci5wdXNoQ29tbWFuZCh7XG4gICAgICAgICAgICByZXF1ZXN0Q2FuY2VsQWN0aXZpdHk6IHtcbiAgICAgICAgICAgICAgc2VxLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSlcbiAgICAgICk7XG4gICAgfVxuICAgIGFjdGl2YXRvci5wdXNoQ29tbWFuZCh7XG4gICAgICBzY2hlZHVsZUFjdGl2aXR5OiB7XG4gICAgICAgIHNlcSxcbiAgICAgICAgYWN0aXZpdHlJZDogb3B0aW9ucy5hY3Rpdml0eUlkID8/IGAke3NlcX1gLFxuICAgICAgICBhY3Rpdml0eVR5cGUsXG4gICAgICAgIGFyZ3VtZW50czogdG9QYXlsb2FkcyhhY3RpdmF0b3IucGF5bG9hZENvbnZlcnRlciwgLi4uYXJncyksXG4gICAgICAgIHJldHJ5UG9saWN5OiBvcHRpb25zLnJldHJ5ID8gY29tcGlsZVJldHJ5UG9saWN5KG9wdGlvbnMucmV0cnkpIDogdW5kZWZpbmVkLFxuICAgICAgICB0YXNrUXVldWU6IG9wdGlvbnMudGFza1F1ZXVlIHx8IGFjdGl2YXRvci5pbmZvLnRhc2tRdWV1ZSxcbiAgICAgICAgaGVhcnRiZWF0VGltZW91dDogbXNPcHRpb25hbFRvVHMob3B0aW9ucy5oZWFydGJlYXRUaW1lb3V0KSxcbiAgICAgICAgc2NoZWR1bGVUb0Nsb3NlVGltZW91dDogbXNPcHRpb25hbFRvVHMob3B0aW9ucy5zY2hlZHVsZVRvQ2xvc2VUaW1lb3V0KSxcbiAgICAgICAgc3RhcnRUb0Nsb3NlVGltZW91dDogbXNPcHRpb25hbFRvVHMob3B0aW9ucy5zdGFydFRvQ2xvc2VUaW1lb3V0KSxcbiAgICAgICAgc2NoZWR1bGVUb1N0YXJ0VGltZW91dDogbXNPcHRpb25hbFRvVHMob3B0aW9ucy5zY2hlZHVsZVRvU3RhcnRUaW1lb3V0KSxcbiAgICAgICAgaGVhZGVycyxcbiAgICAgICAgY2FuY2VsbGF0aW9uVHlwZTogb3B0aW9ucy5jYW5jZWxsYXRpb25UeXBlLFxuICAgICAgICBkb05vdEVhZ2VybHlFeGVjdXRlOiAhKG9wdGlvbnMuYWxsb3dFYWdlckRpc3BhdGNoID8/IHRydWUpLFxuICAgICAgICB2ZXJzaW9uaW5nSW50ZW50OiB2ZXJzaW9uaW5nSW50ZW50VG9Qcm90byhvcHRpb25zLnZlcnNpb25pbmdJbnRlbnQpLFxuICAgICAgfSxcbiAgICB9KTtcbiAgICBhY3RpdmF0b3IuY29tcGxldGlvbnMuYWN0aXZpdHkuc2V0KHNlcSwge1xuICAgICAgcmVzb2x2ZSxcbiAgICAgIHJlamVjdCxcbiAgICB9KTtcbiAgfSk7XG59XG5cbi8qKlxuICogUHVzaCBhIHNjaGVkdWxlQWN0aXZpdHkgY29tbWFuZCBpbnRvIHN0YXRlIGFjY3VtdWxhdG9yIGFuZCByZWdpc3RlciBjb21wbGV0aW9uXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIHNjaGVkdWxlTG9jYWxBY3Rpdml0eU5leHRIYW5kbGVyKHtcbiAgb3B0aW9ucyxcbiAgYXJncyxcbiAgaGVhZGVycyxcbiAgc2VxLFxuICBhY3Rpdml0eVR5cGUsXG4gIGF0dGVtcHQsXG4gIG9yaWdpbmFsU2NoZWR1bGVUaW1lLFxufTogTG9jYWxBY3Rpdml0eUlucHV0KTogUHJvbWlzZTx1bmtub3duPiB7XG4gIGNvbnN0IGFjdGl2YXRvciA9IGdldEFjdGl2YXRvcigpO1xuICAvLyBFYWdlcmx5IGZhaWwgdGhlIGxvY2FsIGFjdGl2aXR5ICh3aGljaCB3aWxsIGluIHR1cm4gZmFpbCB0aGUgd29ya2Zsb3cgdGFzay5cbiAgLy8gRG8gbm90IGZhaWwgb24gcmVwbGF5IHdoZXJlIHRoZSBsb2NhbCBhY3Rpdml0aWVzIG1heSBub3QgYmUgcmVnaXN0ZXJlZCBvbiB0aGUgcmVwbGF5IHdvcmtlci5cbiAgaWYgKCFhY3RpdmF0b3IuaW5mby51bnNhZmUuaXNSZXBsYXlpbmcgJiYgIWFjdGl2YXRvci5yZWdpc3RlcmVkQWN0aXZpdHlOYW1lcy5oYXMoYWN0aXZpdHlUeXBlKSkge1xuICAgIHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihgTG9jYWwgYWN0aXZpdHkgb2YgdHlwZSAnJHthY3Rpdml0eVR5cGV9JyBub3QgcmVnaXN0ZXJlZCBvbiB3b3JrZXJgKTtcbiAgfVxuICB2YWxpZGF0ZUxvY2FsQWN0aXZpdHlPcHRpb25zKG9wdGlvbnMpO1xuXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgY29uc3Qgc2NvcGUgPSBDYW5jZWxsYXRpb25TY29wZS5jdXJyZW50KCk7XG4gICAgaWYgKHNjb3BlLmNvbnNpZGVyZWRDYW5jZWxsZWQpIHtcbiAgICAgIHVudHJhY2tQcm9taXNlKHNjb3BlLmNhbmNlbFJlcXVlc3RlZC5jYXRjaChyZWplY3QpKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHNjb3BlLmNhbmNlbGxhYmxlKSB7XG4gICAgICB1bnRyYWNrUHJvbWlzZShcbiAgICAgICAgc2NvcGUuY2FuY2VsUmVxdWVzdGVkLmNhdGNoKCgpID0+IHtcbiAgICAgICAgICBpZiAoIWFjdGl2YXRvci5jb21wbGV0aW9ucy5hY3Rpdml0eS5oYXMoc2VxKSkge1xuICAgICAgICAgICAgcmV0dXJuOyAvLyBBbHJlYWR5IHJlc29sdmVkIG9yIG5ldmVyIHNjaGVkdWxlZFxuICAgICAgICAgIH1cbiAgICAgICAgICBhY3RpdmF0b3IucHVzaENvbW1hbmQoe1xuICAgICAgICAgICAgcmVxdWVzdENhbmNlbExvY2FsQWN0aXZpdHk6IHtcbiAgICAgICAgICAgICAgc2VxLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSlcbiAgICAgICk7XG4gICAgfVxuICAgIGFjdGl2YXRvci5wdXNoQ29tbWFuZCh7XG4gICAgICBzY2hlZHVsZUxvY2FsQWN0aXZpdHk6IHtcbiAgICAgICAgc2VxLFxuICAgICAgICBhdHRlbXB0LFxuICAgICAgICBvcmlnaW5hbFNjaGVkdWxlVGltZSxcbiAgICAgICAgLy8gSW50ZW50aW9uYWxseSBub3QgZXhwb3NpbmcgYWN0aXZpdHlJZCBhcyBhbiBvcHRpb25cbiAgICAgICAgYWN0aXZpdHlJZDogYCR7c2VxfWAsXG4gICAgICAgIGFjdGl2aXR5VHlwZSxcbiAgICAgICAgYXJndW1lbnRzOiB0b1BheWxvYWRzKGFjdGl2YXRvci5wYXlsb2FkQ29udmVydGVyLCAuLi5hcmdzKSxcbiAgICAgICAgcmV0cnlQb2xpY3k6IG9wdGlvbnMucmV0cnkgPyBjb21waWxlUmV0cnlQb2xpY3kob3B0aW9ucy5yZXRyeSkgOiB1bmRlZmluZWQsXG4gICAgICAgIHNjaGVkdWxlVG9DbG9zZVRpbWVvdXQ6IG1zT3B0aW9uYWxUb1RzKG9wdGlvbnMuc2NoZWR1bGVUb0Nsb3NlVGltZW91dCksXG4gICAgICAgIHN0YXJ0VG9DbG9zZVRpbWVvdXQ6IG1zT3B0aW9uYWxUb1RzKG9wdGlvbnMuc3RhcnRUb0Nsb3NlVGltZW91dCksXG4gICAgICAgIHNjaGVkdWxlVG9TdGFydFRpbWVvdXQ6IG1zT3B0aW9uYWxUb1RzKG9wdGlvbnMuc2NoZWR1bGVUb1N0YXJ0VGltZW91dCksXG4gICAgICAgIGxvY2FsUmV0cnlUaHJlc2hvbGQ6IG1zT3B0aW9uYWxUb1RzKG9wdGlvbnMubG9jYWxSZXRyeVRocmVzaG9sZCksXG4gICAgICAgIGhlYWRlcnMsXG4gICAgICAgIGNhbmNlbGxhdGlvblR5cGU6IG9wdGlvbnMuY2FuY2VsbGF0aW9uVHlwZSxcbiAgICAgIH0sXG4gICAgfSk7XG4gICAgYWN0aXZhdG9yLmNvbXBsZXRpb25zLmFjdGl2aXR5LnNldChzZXEsIHtcbiAgICAgIHJlc29sdmUsXG4gICAgICByZWplY3QsXG4gICAgfSk7XG4gIH0pO1xufVxuXG4vKipcbiAqIFNjaGVkdWxlIGFuIGFjdGl2aXR5IGFuZCBydW4gb3V0Ym91bmQgaW50ZXJjZXB0b3JzXG4gKiBAaGlkZGVuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzY2hlZHVsZUFjdGl2aXR5PFI+KGFjdGl2aXR5VHlwZTogc3RyaW5nLCBhcmdzOiBhbnlbXSwgb3B0aW9uczogQWN0aXZpdHlPcHRpb25zKTogUHJvbWlzZTxSPiB7XG4gIGNvbnN0IGFjdGl2YXRvciA9IGFzc2VydEluV29ya2Zsb3dDb250ZXh0KFxuICAgICdXb3JrZmxvdy5zY2hlZHVsZUFjdGl2aXR5KC4uLikgbWF5IG9ubHkgYmUgdXNlZCBmcm9tIGEgV29ya2Zsb3cgRXhlY3V0aW9uJ1xuICApO1xuICBpZiAob3B0aW9ucyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignR290IGVtcHR5IGFjdGl2aXR5IG9wdGlvbnMnKTtcbiAgfVxuICBjb25zdCBzZXEgPSBhY3RpdmF0b3IubmV4dFNlcXMuYWN0aXZpdHkrKztcbiAgY29uc3QgZXhlY3V0ZSA9IGNvbXBvc2VJbnRlcmNlcHRvcnMoYWN0aXZhdG9yLmludGVyY2VwdG9ycy5vdXRib3VuZCwgJ3NjaGVkdWxlQWN0aXZpdHknLCBzY2hlZHVsZUFjdGl2aXR5TmV4dEhhbmRsZXIpO1xuXG4gIHJldHVybiBleGVjdXRlKHtcbiAgICBhY3Rpdml0eVR5cGUsXG4gICAgaGVhZGVyczoge30sXG4gICAgb3B0aW9ucyxcbiAgICBhcmdzLFxuICAgIHNlcSxcbiAgfSkgYXMgUHJvbWlzZTxSPjtcbn1cblxuLyoqXG4gKiBTY2hlZHVsZSBhbiBhY3Rpdml0eSBhbmQgcnVuIG91dGJvdW5kIGludGVyY2VwdG9yc1xuICogQGhpZGRlblxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2NoZWR1bGVMb2NhbEFjdGl2aXR5PFI+KFxuICBhY3Rpdml0eVR5cGU6IHN0cmluZyxcbiAgYXJnczogYW55W10sXG4gIG9wdGlvbnM6IExvY2FsQWN0aXZpdHlPcHRpb25zXG4pOiBQcm9taXNlPFI+IHtcbiAgY29uc3QgYWN0aXZhdG9yID0gYXNzZXJ0SW5Xb3JrZmxvd0NvbnRleHQoXG4gICAgJ1dvcmtmbG93LnNjaGVkdWxlTG9jYWxBY3Rpdml0eSguLi4pIG1heSBvbmx5IGJlIHVzZWQgZnJvbSBhIFdvcmtmbG93IEV4ZWN1dGlvbidcbiAgKTtcbiAgaWYgKG9wdGlvbnMgPT09IHVuZGVmaW5lZCkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0dvdCBlbXB0eSBhY3Rpdml0eSBvcHRpb25zJyk7XG4gIH1cblxuICBsZXQgYXR0ZW1wdCA9IDE7XG4gIGxldCBvcmlnaW5hbFNjaGVkdWxlVGltZSA9IHVuZGVmaW5lZDtcblxuICBmb3IgKDs7KSB7XG4gICAgY29uc3Qgc2VxID0gYWN0aXZhdG9yLm5leHRTZXFzLmFjdGl2aXR5Kys7XG4gICAgY29uc3QgZXhlY3V0ZSA9IGNvbXBvc2VJbnRlcmNlcHRvcnMoXG4gICAgICBhY3RpdmF0b3IuaW50ZXJjZXB0b3JzLm91dGJvdW5kLFxuICAgICAgJ3NjaGVkdWxlTG9jYWxBY3Rpdml0eScsXG4gICAgICBzY2hlZHVsZUxvY2FsQWN0aXZpdHlOZXh0SGFuZGxlclxuICAgICk7XG5cbiAgICB0cnkge1xuICAgICAgcmV0dXJuIChhd2FpdCBleGVjdXRlKHtcbiAgICAgICAgYWN0aXZpdHlUeXBlLFxuICAgICAgICBoZWFkZXJzOiB7fSxcbiAgICAgICAgb3B0aW9ucyxcbiAgICAgICAgYXJncyxcbiAgICAgICAgc2VxLFxuICAgICAgICBhdHRlbXB0LFxuICAgICAgICBvcmlnaW5hbFNjaGVkdWxlVGltZSxcbiAgICAgIH0pKSBhcyBQcm9taXNlPFI+O1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgaWYgKGVyciBpbnN0YW5jZW9mIExvY2FsQWN0aXZpdHlEb0JhY2tvZmYpIHtcbiAgICAgICAgYXdhaXQgc2xlZXAocmVxdWlyZWRUc1RvTXMoZXJyLmJhY2tvZmYuYmFja29mZkR1cmF0aW9uLCAnYmFja29mZkR1cmF0aW9uJykpO1xuICAgICAgICBpZiAodHlwZW9mIGVyci5iYWNrb2ZmLmF0dGVtcHQgIT09ICdudW1iZXInKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSW52YWxpZCBiYWNrb2ZmIGF0dGVtcHQgdHlwZScpO1xuICAgICAgICB9XG4gICAgICAgIGF0dGVtcHQgPSBlcnIuYmFja29mZi5hdHRlbXB0O1xuICAgICAgICBvcmlnaW5hbFNjaGVkdWxlVGltZSA9IGVyci5iYWNrb2ZmLm9yaWdpbmFsU2NoZWR1bGVUaW1lID8/IHVuZGVmaW5lZDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IGVycjtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gc3RhcnRDaGlsZFdvcmtmbG93RXhlY3V0aW9uTmV4dEhhbmRsZXIoe1xuICBvcHRpb25zLFxuICBoZWFkZXJzLFxuICB3b3JrZmxvd1R5cGUsXG4gIHNlcSxcbn06IFN0YXJ0Q2hpbGRXb3JrZmxvd0V4ZWN1dGlvbklucHV0KTogUHJvbWlzZTxbUHJvbWlzZTxzdHJpbmc+LCBQcm9taXNlPHVua25vd24+XT4ge1xuICBjb25zdCBhY3RpdmF0b3IgPSBnZXRBY3RpdmF0b3IoKTtcbiAgY29uc3Qgd29ya2Zsb3dJZCA9IG9wdGlvbnMud29ya2Zsb3dJZCA/PyB1dWlkNCgpO1xuICBjb25zdCBzdGFydFByb21pc2UgPSBuZXcgUHJvbWlzZTxzdHJpbmc+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBjb25zdCBzY29wZSA9IENhbmNlbGxhdGlvblNjb3BlLmN1cnJlbnQoKTtcbiAgICBpZiAoc2NvcGUuY29uc2lkZXJlZENhbmNlbGxlZCkge1xuICAgICAgdW50cmFja1Byb21pc2Uoc2NvcGUuY2FuY2VsUmVxdWVzdGVkLmNhdGNoKHJlamVjdCkpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoc2NvcGUuY2FuY2VsbGFibGUpIHtcbiAgICAgIHVudHJhY2tQcm9taXNlKFxuICAgICAgICBzY29wZS5jYW5jZWxSZXF1ZXN0ZWQuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgIGNvbnN0IGNvbXBsZXRlID0gIWFjdGl2YXRvci5jb21wbGV0aW9ucy5jaGlsZFdvcmtmbG93Q29tcGxldGUuaGFzKHNlcSk7XG5cbiAgICAgICAgICBpZiAoIWNvbXBsZXRlKSB7XG4gICAgICAgICAgICBhY3RpdmF0b3IucHVzaENvbW1hbmQoe1xuICAgICAgICAgICAgICBjYW5jZWxDaGlsZFdvcmtmbG93RXhlY3V0aW9uOiB7IGNoaWxkV29ya2Zsb3dTZXE6IHNlcSB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIE5vdGhpbmcgdG8gY2FuY2VsIG90aGVyd2lzZVxuICAgICAgICB9KVxuICAgICAgKTtcbiAgICB9XG4gICAgYWN0aXZhdG9yLnB1c2hDb21tYW5kKHtcbiAgICAgIHN0YXJ0Q2hpbGRXb3JrZmxvd0V4ZWN1dGlvbjoge1xuICAgICAgICBzZXEsXG4gICAgICAgIHdvcmtmbG93SWQsXG4gICAgICAgIHdvcmtmbG93VHlwZSxcbiAgICAgICAgaW5wdXQ6IHRvUGF5bG9hZHMoYWN0aXZhdG9yLnBheWxvYWRDb252ZXJ0ZXIsIC4uLm9wdGlvbnMuYXJncyksXG4gICAgICAgIHJldHJ5UG9saWN5OiBvcHRpb25zLnJldHJ5ID8gY29tcGlsZVJldHJ5UG9saWN5KG9wdGlvbnMucmV0cnkpIDogdW5kZWZpbmVkLFxuICAgICAgICB0YXNrUXVldWU6IG9wdGlvbnMudGFza1F1ZXVlIHx8IGFjdGl2YXRvci5pbmZvLnRhc2tRdWV1ZSxcbiAgICAgICAgd29ya2Zsb3dFeGVjdXRpb25UaW1lb3V0OiBtc09wdGlvbmFsVG9UcyhvcHRpb25zLndvcmtmbG93RXhlY3V0aW9uVGltZW91dCksXG4gICAgICAgIHdvcmtmbG93UnVuVGltZW91dDogbXNPcHRpb25hbFRvVHMob3B0aW9ucy53b3JrZmxvd1J1blRpbWVvdXQpLFxuICAgICAgICB3b3JrZmxvd1Rhc2tUaW1lb3V0OiBtc09wdGlvbmFsVG9UcyhvcHRpb25zLndvcmtmbG93VGFza1RpbWVvdXQpLFxuICAgICAgICBuYW1lc3BhY2U6IGFjdGl2YXRvci5pbmZvLm5hbWVzcGFjZSwgLy8gTm90IGNvbmZpZ3VyYWJsZVxuICAgICAgICBoZWFkZXJzLFxuICAgICAgICBjYW5jZWxsYXRpb25UeXBlOiBvcHRpb25zLmNhbmNlbGxhdGlvblR5cGUsXG4gICAgICAgIHdvcmtmbG93SWRSZXVzZVBvbGljeTogb3B0aW9ucy53b3JrZmxvd0lkUmV1c2VQb2xpY3ksXG4gICAgICAgIHBhcmVudENsb3NlUG9saWN5OiBvcHRpb25zLnBhcmVudENsb3NlUG9saWN5LFxuICAgICAgICBjcm9uU2NoZWR1bGU6IG9wdGlvbnMuY3JvblNjaGVkdWxlLFxuICAgICAgICBzZWFyY2hBdHRyaWJ1dGVzOiBvcHRpb25zLnNlYXJjaEF0dHJpYnV0ZXNcbiAgICAgICAgICA/IG1hcFRvUGF5bG9hZHMoc2VhcmNoQXR0cmlidXRlUGF5bG9hZENvbnZlcnRlciwgb3B0aW9ucy5zZWFyY2hBdHRyaWJ1dGVzKVxuICAgICAgICAgIDogdW5kZWZpbmVkLFxuICAgICAgICBtZW1vOiBvcHRpb25zLm1lbW8gJiYgbWFwVG9QYXlsb2FkcyhhY3RpdmF0b3IucGF5bG9hZENvbnZlcnRlciwgb3B0aW9ucy5tZW1vKSxcbiAgICAgICAgdmVyc2lvbmluZ0ludGVudDogdmVyc2lvbmluZ0ludGVudFRvUHJvdG8ob3B0aW9ucy52ZXJzaW9uaW5nSW50ZW50KSxcbiAgICAgIH0sXG4gICAgfSk7XG4gICAgYWN0aXZhdG9yLmNvbXBsZXRpb25zLmNoaWxkV29ya2Zsb3dTdGFydC5zZXQoc2VxLCB7XG4gICAgICByZXNvbHZlLFxuICAgICAgcmVqZWN0LFxuICAgIH0pO1xuICB9KTtcblxuICAvLyBXZSBjb25zdHJ1Y3QgYSBQcm9taXNlIGZvciB0aGUgY29tcGxldGlvbiBvZiB0aGUgY2hpbGQgV29ya2Zsb3cgYmVmb3JlIHdlIGtub3dcbiAgLy8gaWYgdGhlIFdvcmtmbG93IGNvZGUgd2lsbCBhd2FpdCBpdCB0byBjYXB0dXJlIHRoZSByZXN1bHQgaW4gY2FzZSBpdCBkb2VzLlxuICBjb25zdCBjb21wbGV0ZVByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgLy8gQ2hhaW4gc3RhcnQgUHJvbWlzZSByZWplY3Rpb24gdG8gdGhlIGNvbXBsZXRlIFByb21pc2UuXG4gICAgdW50cmFja1Byb21pc2Uoc3RhcnRQcm9taXNlLmNhdGNoKHJlamVjdCkpO1xuICAgIGFjdGl2YXRvci5jb21wbGV0aW9ucy5jaGlsZFdvcmtmbG93Q29tcGxldGUuc2V0KHNlcSwge1xuICAgICAgcmVzb2x2ZSxcbiAgICAgIHJlamVjdCxcbiAgICB9KTtcbiAgfSk7XG4gIHVudHJhY2tQcm9taXNlKHN0YXJ0UHJvbWlzZSk7XG4gIHVudHJhY2tQcm9taXNlKGNvbXBsZXRlUHJvbWlzZSk7XG4gIC8vIFByZXZlbnQgdW5oYW5kbGVkIHJlamVjdGlvbiBiZWNhdXNlIHRoZSBjb21wbGV0aW9uIG1pZ2h0IG5vdCBiZSBhd2FpdGVkXG4gIHVudHJhY2tQcm9taXNlKGNvbXBsZXRlUHJvbWlzZS5jYXRjaCgoKSA9PiB1bmRlZmluZWQpKTtcbiAgY29uc3QgcmV0ID0gbmV3IFByb21pc2U8W1Byb21pc2U8c3RyaW5nPiwgUHJvbWlzZTx1bmtub3duPl0+KChyZXNvbHZlKSA9PiByZXNvbHZlKFtzdGFydFByb21pc2UsIGNvbXBsZXRlUHJvbWlzZV0pKTtcbiAgdW50cmFja1Byb21pc2UocmV0KTtcbiAgcmV0dXJuIHJldDtcbn1cblxuZnVuY3Rpb24gc2lnbmFsV29ya2Zsb3dOZXh0SGFuZGxlcih7IHNlcSwgc2lnbmFsTmFtZSwgYXJncywgdGFyZ2V0LCBoZWFkZXJzIH06IFNpZ25hbFdvcmtmbG93SW5wdXQpIHtcbiAgY29uc3QgYWN0aXZhdG9yID0gZ2V0QWN0aXZhdG9yKCk7XG4gIHJldHVybiBuZXcgUHJvbWlzZTxhbnk+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBjb25zdCBzY29wZSA9IENhbmNlbGxhdGlvblNjb3BlLmN1cnJlbnQoKTtcbiAgICBpZiAoc2NvcGUuY29uc2lkZXJlZENhbmNlbGxlZCkge1xuICAgICAgdW50cmFja1Byb21pc2Uoc2NvcGUuY2FuY2VsUmVxdWVzdGVkLmNhdGNoKHJlamVjdCkpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChzY29wZS5jYW5jZWxsYWJsZSkge1xuICAgICAgdW50cmFja1Byb21pc2UoXG4gICAgICAgIHNjb3BlLmNhbmNlbFJlcXVlc3RlZC5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgaWYgKCFhY3RpdmF0b3IuY29tcGxldGlvbnMuc2lnbmFsV29ya2Zsb3cuaGFzKHNlcSkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgYWN0aXZhdG9yLnB1c2hDb21tYW5kKHsgY2FuY2VsU2lnbmFsV29ya2Zsb3c6IHsgc2VxIH0gfSk7XG4gICAgICAgIH0pXG4gICAgICApO1xuICAgIH1cbiAgICBhY3RpdmF0b3IucHVzaENvbW1hbmQoe1xuICAgICAgc2lnbmFsRXh0ZXJuYWxXb3JrZmxvd0V4ZWN1dGlvbjoge1xuICAgICAgICBzZXEsXG4gICAgICAgIGFyZ3M6IHRvUGF5bG9hZHMoYWN0aXZhdG9yLnBheWxvYWRDb252ZXJ0ZXIsIC4uLmFyZ3MpLFxuICAgICAgICBoZWFkZXJzLFxuICAgICAgICBzaWduYWxOYW1lLFxuICAgICAgICAuLi4odGFyZ2V0LnR5cGUgPT09ICdleHRlcm5hbCdcbiAgICAgICAgICA/IHtcbiAgICAgICAgICAgICAgd29ya2Zsb3dFeGVjdXRpb246IHtcbiAgICAgICAgICAgICAgICBuYW1lc3BhY2U6IGFjdGl2YXRvci5pbmZvLm5hbWVzcGFjZSxcbiAgICAgICAgICAgICAgICAuLi50YXJnZXQud29ya2Zsb3dFeGVjdXRpb24sXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9XG4gICAgICAgICAgOiB7XG4gICAgICAgICAgICAgIGNoaWxkV29ya2Zsb3dJZDogdGFyZ2V0LmNoaWxkV29ya2Zsb3dJZCxcbiAgICAgICAgICAgIH0pLFxuICAgICAgfSxcbiAgICB9KTtcblxuICAgIGFjdGl2YXRvci5jb21wbGV0aW9ucy5zaWduYWxXb3JrZmxvdy5zZXQoc2VxLCB7IHJlc29sdmUsIHJlamVjdCB9KTtcbiAgfSk7XG59XG5cbi8qKlxuICogU3ltYm9sIHVzZWQgaW4gdGhlIHJldHVybiB0eXBlIG9mIHByb3h5IG1ldGhvZHMgdG8gbWFyayB0aGF0IGFuIGF0dHJpYnV0ZSBvbiB0aGUgc291cmNlIHR5cGUgaXMgbm90IGEgbWV0aG9kLlxuICpcbiAqIEBzZWUge0BsaW5rIEFjdGl2aXR5SW50ZXJmYWNlRm9yfVxuICogQHNlZSB7QGxpbmsgcHJveHlBY3Rpdml0aWVzfVxuICogQHNlZSB7QGxpbmsgcHJveHlMb2NhbEFjdGl2aXRpZXN9XG4gKi9cbmV4cG9ydCBjb25zdCBOb3RBbkFjdGl2aXR5TWV0aG9kID0gU3ltYm9sLmZvcignX19URU1QT1JBTF9OT1RfQU5fQUNUSVZJVFlfTUVUSE9EJyk7XG5cbi8qKlxuICogVHlwZSBoZWxwZXIgdGhhdCB0YWtlcyBhIHR5cGUgYFRgIGFuZCB0cmFuc2Zvcm1zIGF0dHJpYnV0ZXMgdGhhdCBhcmUgbm90IHtAbGluayBBY3Rpdml0eUZ1bmN0aW9ufSB0b1xuICoge0BsaW5rIE5vdEFuQWN0aXZpdHlNZXRob2R9LlxuICpcbiAqIEBleGFtcGxlXG4gKlxuICogVXNlZCBieSB7QGxpbmsgcHJveHlBY3Rpdml0aWVzfSB0byBnZXQgdGhpcyBjb21waWxlLXRpbWUgZXJyb3I6XG4gKlxuICogYGBgdHNcbiAqIGludGVyZmFjZSBNeUFjdGl2aXRpZXMge1xuICogICB2YWxpZChpbnB1dDogbnVtYmVyKTogUHJvbWlzZTxudW1iZXI+O1xuICogICBpbnZhbGlkKGlucHV0OiBudW1iZXIpOiBudW1iZXI7XG4gKiB9XG4gKlxuICogY29uc3QgYWN0ID0gcHJveHlBY3Rpdml0aWVzPE15QWN0aXZpdGllcz4oeyBzdGFydFRvQ2xvc2VUaW1lb3V0OiAnNW0nIH0pO1xuICpcbiAqIGF3YWl0IGFjdC52YWxpZCh0cnVlKTtcbiAqIGF3YWl0IGFjdC5pbnZhbGlkKCk7XG4gKiAvLyBeIFRTIGNvbXBsYWlucyB3aXRoOlxuICogLy8gKHByb3BlcnR5KSBpbnZhbGlkRGVmaW5pdGlvbjogdHlwZW9mIE5vdEFuQWN0aXZpdHlNZXRob2RcbiAqIC8vIFRoaXMgZXhwcmVzc2lvbiBpcyBub3QgY2FsbGFibGUuXG4gKiAvLyBUeXBlICdTeW1ib2wnIGhhcyBubyBjYWxsIHNpZ25hdHVyZXMuKDIzNDkpXG4gKiBgYGBcbiAqL1xuZXhwb3J0IHR5cGUgQWN0aXZpdHlJbnRlcmZhY2VGb3I8VD4gPSB7XG4gIFtLIGluIGtleW9mIFRdOiBUW0tdIGV4dGVuZHMgQWN0aXZpdHlGdW5jdGlvbiA/IFRbS10gOiB0eXBlb2YgTm90QW5BY3Rpdml0eU1ldGhvZDtcbn07XG5cbi8qKlxuICogQ29uZmlndXJlIEFjdGl2aXR5IGZ1bmN0aW9ucyB3aXRoIGdpdmVuIHtAbGluayBBY3Rpdml0eU9wdGlvbnN9LlxuICpcbiAqIFRoaXMgbWV0aG9kIG1heSBiZSBjYWxsZWQgbXVsdGlwbGUgdGltZXMgdG8gc2V0dXAgQWN0aXZpdGllcyB3aXRoIGRpZmZlcmVudCBvcHRpb25zLlxuICpcbiAqIEByZXR1cm4gYSB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvUHJveHkgfCBQcm94eX0gZm9yXG4gKiAgICAgICAgIHdoaWNoIGVhY2ggYXR0cmlidXRlIGlzIGEgY2FsbGFibGUgQWN0aXZpdHkgZnVuY3Rpb25cbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IHByb3h5QWN0aXZpdGllcyB9IGZyb20gJ0B0ZW1wb3JhbGlvL3dvcmtmbG93JztcbiAqIGltcG9ydCAqIGFzIGFjdGl2aXRpZXMgZnJvbSAnLi4vYWN0aXZpdGllcyc7XG4gKlxuICogLy8gU2V0dXAgQWN0aXZpdGllcyBmcm9tIG1vZHVsZSBleHBvcnRzXG4gKiBjb25zdCB7IGh0dHBHZXQsIG90aGVyQWN0aXZpdHkgfSA9IHByb3h5QWN0aXZpdGllczx0eXBlb2YgYWN0aXZpdGllcz4oe1xuICogICBzdGFydFRvQ2xvc2VUaW1lb3V0OiAnMzAgbWludXRlcycsXG4gKiB9KTtcbiAqXG4gKiAvLyBTZXR1cCBBY3Rpdml0aWVzIGZyb20gYW4gZXhwbGljaXQgaW50ZXJmYWNlIChlLmcuIHdoZW4gZGVmaW5lZCBieSBhbm90aGVyIFNESylcbiAqIGludGVyZmFjZSBKYXZhQWN0aXZpdGllcyB7XG4gKiAgIGh0dHBHZXRGcm9tSmF2YSh1cmw6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPlxuICogICBzb21lT3RoZXJKYXZhQWN0aXZpdHkoYXJnMTogbnVtYmVyLCBhcmcyOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz47XG4gKiB9XG4gKlxuICogY29uc3Qge1xuICogICBodHRwR2V0RnJvbUphdmEsXG4gKiAgIHNvbWVPdGhlckphdmFBY3Rpdml0eVxuICogfSA9IHByb3h5QWN0aXZpdGllczxKYXZhQWN0aXZpdGllcz4oe1xuICogICB0YXNrUXVldWU6ICdqYXZhLXdvcmtlci10YXNrUXVldWUnLFxuICogICBzdGFydFRvQ2xvc2VUaW1lb3V0OiAnNW0nLFxuICogfSk7XG4gKlxuICogZXhwb3J0IGZ1bmN0aW9uIGV4ZWN1dGUoKTogUHJvbWlzZTx2b2lkPiB7XG4gKiAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgaHR0cEdldChcImh0dHA6Ly9leGFtcGxlLmNvbVwiKTtcbiAqICAgLy8gLi4uXG4gKiB9XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHByb3h5QWN0aXZpdGllczxBID0gVW50eXBlZEFjdGl2aXRpZXM+KG9wdGlvbnM6IEFjdGl2aXR5T3B0aW9ucyk6IEFjdGl2aXR5SW50ZXJmYWNlRm9yPEE+IHtcbiAgaWYgKG9wdGlvbnMgPT09IHVuZGVmaW5lZCkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ29wdGlvbnMgbXVzdCBiZSBkZWZpbmVkJyk7XG4gIH1cbiAgLy8gVmFsaWRhdGUgYXMgZWFybHkgYXMgcG9zc2libGUgZm9yIGltbWVkaWF0ZSB1c2VyIGZlZWRiYWNrXG4gIHZhbGlkYXRlQWN0aXZpdHlPcHRpb25zKG9wdGlvbnMpO1xuICByZXR1cm4gbmV3IFByb3h5KFxuICAgIHt9LFxuICAgIHtcbiAgICAgIGdldChfLCBhY3Rpdml0eVR5cGUpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBhY3Rpdml0eVR5cGUgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgT25seSBzdHJpbmdzIGFyZSBzdXBwb3J0ZWQgZm9yIEFjdGl2aXR5IHR5cGVzLCBnb3Q6ICR7U3RyaW5nKGFjdGl2aXR5VHlwZSl9YCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIGFjdGl2aXR5UHJveHlGdW5jdGlvbiguLi5hcmdzOiB1bmtub3duW10pOiBQcm9taXNlPHVua25vd24+IHtcbiAgICAgICAgICByZXR1cm4gc2NoZWR1bGVBY3Rpdml0eShhY3Rpdml0eVR5cGUsIGFyZ3MsIG9wdGlvbnMpO1xuICAgICAgICB9O1xuICAgICAgfSxcbiAgICB9XG4gICkgYXMgYW55O1xufVxuXG4vKipcbiAqIENvbmZpZ3VyZSBMb2NhbCBBY3Rpdml0eSBmdW5jdGlvbnMgd2l0aCBnaXZlbiB7QGxpbmsgTG9jYWxBY3Rpdml0eU9wdGlvbnN9LlxuICpcbiAqIFRoaXMgbWV0aG9kIG1heSBiZSBjYWxsZWQgbXVsdGlwbGUgdGltZXMgdG8gc2V0dXAgQWN0aXZpdGllcyB3aXRoIGRpZmZlcmVudCBvcHRpb25zLlxuICpcbiAqIEByZXR1cm4gYSB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvUHJveHkgfCBQcm94eX1cbiAqICAgICAgICAgZm9yIHdoaWNoIGVhY2ggYXR0cmlidXRlIGlzIGEgY2FsbGFibGUgQWN0aXZpdHkgZnVuY3Rpb25cbiAqXG4gKiBAc2VlIHtAbGluayBwcm94eUFjdGl2aXRpZXN9IGZvciBleGFtcGxlc1xuICovXG5leHBvcnQgZnVuY3Rpb24gcHJveHlMb2NhbEFjdGl2aXRpZXM8QSA9IFVudHlwZWRBY3Rpdml0aWVzPihvcHRpb25zOiBMb2NhbEFjdGl2aXR5T3B0aW9ucyk6IEFjdGl2aXR5SW50ZXJmYWNlRm9yPEE+IHtcbiAgaWYgKG9wdGlvbnMgPT09IHVuZGVmaW5lZCkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ29wdGlvbnMgbXVzdCBiZSBkZWZpbmVkJyk7XG4gIH1cbiAgLy8gVmFsaWRhdGUgYXMgZWFybHkgYXMgcG9zc2libGUgZm9yIGltbWVkaWF0ZSB1c2VyIGZlZWRiYWNrXG4gIHZhbGlkYXRlTG9jYWxBY3Rpdml0eU9wdGlvbnMob3B0aW9ucyk7XG4gIHJldHVybiBuZXcgUHJveHkoXG4gICAge30sXG4gICAge1xuICAgICAgZ2V0KF8sIGFjdGl2aXR5VHlwZSkge1xuICAgICAgICBpZiAodHlwZW9mIGFjdGl2aXR5VHlwZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBPbmx5IHN0cmluZ3MgYXJlIHN1cHBvcnRlZCBmb3IgQWN0aXZpdHkgdHlwZXMsIGdvdDogJHtTdHJpbmcoYWN0aXZpdHlUeXBlKX1gKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gbG9jYWxBY3Rpdml0eVByb3h5RnVuY3Rpb24oLi4uYXJnczogdW5rbm93bltdKSB7XG4gICAgICAgICAgcmV0dXJuIHNjaGVkdWxlTG9jYWxBY3Rpdml0eShhY3Rpdml0eVR5cGUsIGFyZ3MsIG9wdGlvbnMpO1xuICAgICAgICB9O1xuICAgICAgfSxcbiAgICB9XG4gICkgYXMgYW55O1xufVxuXG4vLyBUT0RPOiBkZXByZWNhdGUgdGhpcyBwYXRjaCBhZnRlciBcImVub3VnaFwiIHRpbWUgaGFzIHBhc3NlZFxuY29uc3QgRVhURVJOQUxfV0ZfQ0FOQ0VMX1BBVENIID0gJ19fdGVtcG9yYWxfaW50ZXJuYWxfY29ubmVjdF9leHRlcm5hbF9oYW5kbGVfY2FuY2VsX3RvX3Njb3BlJztcbi8vIFRoZSBuYW1lIG9mIHRoaXMgcGF0Y2ggY29tZXMgZnJvbSBhbiBhdHRlbXB0IHRvIGJ1aWxkIGEgZ2VuZXJpYyBpbnRlcm5hbCBwYXRjaGluZyBtZWNoYW5pc20uXG4vLyBUaGF0IGVmZm9ydCBoYXMgYmVlbiBhYmFuZG9uZWQgaW4gZmF2b3Igb2YgYSBuZXdlciBXb3JrZmxvd1Rhc2tDb21wbGV0ZWRNZXRhZGF0YSBiYXNlZCBtZWNoYW5pc20uXG5jb25zdCBDT05ESVRJT05fMF9QQVRDSCA9ICdfX3Nka19pbnRlcm5hbF9wYXRjaF9udW1iZXI6MSc7XG5cbi8qKlxuICogUmV0dXJucyBhIGNsaWVudC1zaWRlIGhhbmRsZSB0aGF0IGNhbiBiZSB1c2VkIHRvIHNpZ25hbCBhbmQgY2FuY2VsIGFuIGV4aXN0aW5nIFdvcmtmbG93IGV4ZWN1dGlvbi5cbiAqIEl0IHRha2VzIGEgV29ya2Zsb3cgSUQgYW5kIG9wdGlvbmFsIHJ1biBJRC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEV4dGVybmFsV29ya2Zsb3dIYW5kbGUod29ya2Zsb3dJZDogc3RyaW5nLCBydW5JZD86IHN0cmluZyk6IEV4dGVybmFsV29ya2Zsb3dIYW5kbGUge1xuICBjb25zdCBhY3RpdmF0b3IgPSBhc3NlcnRJbldvcmtmbG93Q29udGV4dChcbiAgICAnV29ya2Zsb3cuZ2V0RXh0ZXJuYWxXb3JrZmxvd0hhbmRsZSguLi4pIG1heSBvbmx5IGJlIHVzZWQgZnJvbSBhIFdvcmtmbG93IEV4ZWN1dGlvbi4gQ29uc2lkZXIgdXNpbmcgQ2xpZW50LndvcmtmbG93LmdldEhhbmRsZSguLi4pIGluc3RlYWQuKSdcbiAgKTtcbiAgcmV0dXJuIHtcbiAgICB3b3JrZmxvd0lkLFxuICAgIHJ1bklkLFxuICAgIGNhbmNlbCgpIHtcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIC8vIENvbm5lY3QgdGhpcyBjYW5jZWwgb3BlcmF0aW9uIHRvIHRoZSBjdXJyZW50IGNhbmNlbGxhdGlvbiBzY29wZS5cbiAgICAgICAgLy8gVGhpcyBpcyBiZWhhdmlvciB3YXMgaW50cm9kdWNlZCBhZnRlciB2MC4yMi4wIGFuZCBpcyBpbmNvbXBhdGlibGVcbiAgICAgICAgLy8gd2l0aCBoaXN0b3JpZXMgZ2VuZXJhdGVkIHdpdGggcHJldmlvdXMgU0RLIHZlcnNpb25zIGFuZCB0aHVzIHJlcXVpcmVzXG4gICAgICAgIC8vIHBhdGNoaW5nLlxuICAgICAgICAvL1xuICAgICAgICAvLyBXZSB0cnkgdG8gZGVsYXkgcGF0Y2hpbmcgYXMgbXVjaCBhcyBwb3NzaWJsZSB0byBhdm9pZCBwb2xsdXRpbmdcbiAgICAgICAgLy8gaGlzdG9yaWVzIHVubGVzcyBzdHJpY3RseSByZXF1aXJlZC5cbiAgICAgICAgY29uc3Qgc2NvcGUgPSBDYW5jZWxsYXRpb25TY29wZS5jdXJyZW50KCk7XG4gICAgICAgIGlmIChzY29wZS5jYW5jZWxsYWJsZSkge1xuICAgICAgICAgIHVudHJhY2tQcm9taXNlKFxuICAgICAgICAgICAgc2NvcGUuY2FuY2VsUmVxdWVzdGVkLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgICAgaWYgKHBhdGNoZWQoRVhURVJOQUxfV0ZfQ0FOQ0VMX1BBVENIKSkge1xuICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNjb3BlLmNvbnNpZGVyZWRDYW5jZWxsZWQpIHtcbiAgICAgICAgICBpZiAocGF0Y2hlZChFWFRFUk5BTF9XRl9DQU5DRUxfUEFUQ0gpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgc2VxID0gYWN0aXZhdG9yLm5leHRTZXFzLmNhbmNlbFdvcmtmbG93Kys7XG4gICAgICAgIGFjdGl2YXRvci5wdXNoQ29tbWFuZCh7XG4gICAgICAgICAgcmVxdWVzdENhbmNlbEV4dGVybmFsV29ya2Zsb3dFeGVjdXRpb246IHtcbiAgICAgICAgICAgIHNlcSxcbiAgICAgICAgICAgIHdvcmtmbG93RXhlY3V0aW9uOiB7XG4gICAgICAgICAgICAgIG5hbWVzcGFjZTogYWN0aXZhdG9yLmluZm8ubmFtZXNwYWNlLFxuICAgICAgICAgICAgICB3b3JrZmxvd0lkLFxuICAgICAgICAgICAgICBydW5JZCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgICAgIGFjdGl2YXRvci5jb21wbGV0aW9ucy5jYW5jZWxXb3JrZmxvdy5zZXQoc2VxLCB7IHJlc29sdmUsIHJlamVjdCB9KTtcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgc2lnbmFsPEFyZ3MgZXh0ZW5kcyBhbnlbXT4oZGVmOiBTaWduYWxEZWZpbml0aW9uPEFyZ3M+IHwgc3RyaW5nLCAuLi5hcmdzOiBBcmdzKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICByZXR1cm4gY29tcG9zZUludGVyY2VwdG9ycyhcbiAgICAgICAgYWN0aXZhdG9yLmludGVyY2VwdG9ycy5vdXRib3VuZCxcbiAgICAgICAgJ3NpZ25hbFdvcmtmbG93JyxcbiAgICAgICAgc2lnbmFsV29ya2Zsb3dOZXh0SGFuZGxlclxuICAgICAgKSh7XG4gICAgICAgIHNlcTogYWN0aXZhdG9yLm5leHRTZXFzLnNpZ25hbFdvcmtmbG93KyssXG4gICAgICAgIHNpZ25hbE5hbWU6IHR5cGVvZiBkZWYgPT09ICdzdHJpbmcnID8gZGVmIDogZGVmLm5hbWUsXG4gICAgICAgIGFyZ3MsXG4gICAgICAgIHRhcmdldDoge1xuICAgICAgICAgIHR5cGU6ICdleHRlcm5hbCcsXG4gICAgICAgICAgd29ya2Zsb3dFeGVjdXRpb246IHsgd29ya2Zsb3dJZCwgcnVuSWQgfSxcbiAgICAgICAgfSxcbiAgICAgICAgaGVhZGVyczoge30sXG4gICAgICB9KTtcbiAgICB9LFxuICB9O1xufVxuXG4vKipcbiAqIFN0YXJ0IGEgY2hpbGQgV29ya2Zsb3cgZXhlY3V0aW9uXG4gKlxuICogLSBSZXR1cm5zIGEgY2xpZW50LXNpZGUgaGFuZGxlIHRoYXQgaW1wbGVtZW50cyBhIGNoaWxkIFdvcmtmbG93IGludGVyZmFjZS5cbiAqIC0gQnkgZGVmYXVsdCwgYSBjaGlsZCB3aWxsIGJlIHNjaGVkdWxlZCBvbiB0aGUgc2FtZSB0YXNrIHF1ZXVlIGFzIGl0cyBwYXJlbnQuXG4gKlxuICogQSBjaGlsZCBXb3JrZmxvdyBoYW5kbGUgc3VwcG9ydHMgYXdhaXRpbmcgY29tcGxldGlvbiwgc2lnbmFsaW5nIGFuZCBjYW5jZWxsYXRpb24gdmlhIHtAbGluayBDYW5jZWxsYXRpb25TY29wZX1zLlxuICogSW4gb3JkZXIgdG8gcXVlcnkgdGhlIGNoaWxkLCB1c2UgYSB7QGxpbmsgV29ya2Zsb3dDbGllbnR9IGZyb20gYW4gQWN0aXZpdHkuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzdGFydENoaWxkPFQgZXh0ZW5kcyBXb3JrZmxvdz4oXG4gIHdvcmtmbG93VHlwZTogc3RyaW5nLFxuICBvcHRpb25zOiBXaXRoV29ya2Zsb3dBcmdzPFQsIENoaWxkV29ya2Zsb3dPcHRpb25zPlxuKTogUHJvbWlzZTxDaGlsZFdvcmtmbG93SGFuZGxlPFQ+PjtcblxuLyoqXG4gKiBTdGFydCBhIGNoaWxkIFdvcmtmbG93IGV4ZWN1dGlvblxuICpcbiAqIC0gUmV0dXJucyBhIGNsaWVudC1zaWRlIGhhbmRsZSB0aGF0IGltcGxlbWVudHMgYSBjaGlsZCBXb3JrZmxvdyBpbnRlcmZhY2UuXG4gKiAtIERlZHVjZXMgdGhlIFdvcmtmbG93IHR5cGUgYW5kIHNpZ25hdHVyZSBmcm9tIHByb3ZpZGVkIFdvcmtmbG93IGZ1bmN0aW9uLlxuICogLSBCeSBkZWZhdWx0LCBhIGNoaWxkIHdpbGwgYmUgc2NoZWR1bGVkIG9uIHRoZSBzYW1lIHRhc2sgcXVldWUgYXMgaXRzIHBhcmVudC5cbiAqXG4gKiBBIGNoaWxkIFdvcmtmbG93IGhhbmRsZSBzdXBwb3J0cyBhd2FpdGluZyBjb21wbGV0aW9uLCBzaWduYWxpbmcgYW5kIGNhbmNlbGxhdGlvbiB2aWEge0BsaW5rIENhbmNlbGxhdGlvblNjb3BlfXMuXG4gKiBJbiBvcmRlciB0byBxdWVyeSB0aGUgY2hpbGQsIHVzZSBhIHtAbGluayBXb3JrZmxvd0NsaWVudH0gZnJvbSBhbiBBY3Rpdml0eS5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHN0YXJ0Q2hpbGQ8VCBleHRlbmRzIFdvcmtmbG93PihcbiAgd29ya2Zsb3dGdW5jOiBULFxuICBvcHRpb25zOiBXaXRoV29ya2Zsb3dBcmdzPFQsIENoaWxkV29ya2Zsb3dPcHRpb25zPlxuKTogUHJvbWlzZTxDaGlsZFdvcmtmbG93SGFuZGxlPFQ+PjtcblxuLyoqXG4gKiBTdGFydCBhIGNoaWxkIFdvcmtmbG93IGV4ZWN1dGlvblxuICpcbiAqICoqT3ZlcnJpZGUgZm9yIFdvcmtmbG93cyB0aGF0IGFjY2VwdCBubyBhcmd1bWVudHMqKi5cbiAqXG4gKiAtIFJldHVybnMgYSBjbGllbnQtc2lkZSBoYW5kbGUgdGhhdCBpbXBsZW1lbnRzIGEgY2hpbGQgV29ya2Zsb3cgaW50ZXJmYWNlLlxuICogLSBUaGUgY2hpbGQgd2lsbCBiZSBzY2hlZHVsZWQgb24gdGhlIHNhbWUgdGFzayBxdWV1ZSBhcyBpdHMgcGFyZW50LlxuICpcbiAqIEEgY2hpbGQgV29ya2Zsb3cgaGFuZGxlIHN1cHBvcnRzIGF3YWl0aW5nIGNvbXBsZXRpb24sIHNpZ25hbGluZyBhbmQgY2FuY2VsbGF0aW9uIHZpYSB7QGxpbmsgQ2FuY2VsbGF0aW9uU2NvcGV9cy5cbiAqIEluIG9yZGVyIHRvIHF1ZXJ5IHRoZSBjaGlsZCwgdXNlIGEge0BsaW5rIFdvcmtmbG93Q2xpZW50fSBmcm9tIGFuIEFjdGl2aXR5LlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc3RhcnRDaGlsZDxUIGV4dGVuZHMgKCkgPT4gUHJvbWlzZTxhbnk+Pih3b3JrZmxvd1R5cGU6IHN0cmluZyk6IFByb21pc2U8Q2hpbGRXb3JrZmxvd0hhbmRsZTxUPj47XG5cbi8qKlxuICogU3RhcnQgYSBjaGlsZCBXb3JrZmxvdyBleGVjdXRpb25cbiAqXG4gKiAqKk92ZXJyaWRlIGZvciBXb3JrZmxvd3MgdGhhdCBhY2NlcHQgbm8gYXJndW1lbnRzKiouXG4gKlxuICogLSBSZXR1cm5zIGEgY2xpZW50LXNpZGUgaGFuZGxlIHRoYXQgaW1wbGVtZW50cyBhIGNoaWxkIFdvcmtmbG93IGludGVyZmFjZS5cbiAqIC0gRGVkdWNlcyB0aGUgV29ya2Zsb3cgdHlwZSBhbmQgc2lnbmF0dXJlIGZyb20gcHJvdmlkZWQgV29ya2Zsb3cgZnVuY3Rpb24uXG4gKiAtIFRoZSBjaGlsZCB3aWxsIGJlIHNjaGVkdWxlZCBvbiB0aGUgc2FtZSB0YXNrIHF1ZXVlIGFzIGl0cyBwYXJlbnQuXG4gKlxuICogQSBjaGlsZCBXb3JrZmxvdyBoYW5kbGUgc3VwcG9ydHMgYXdhaXRpbmcgY29tcGxldGlvbiwgc2lnbmFsaW5nIGFuZCBjYW5jZWxsYXRpb24gdmlhIHtAbGluayBDYW5jZWxsYXRpb25TY29wZX1zLlxuICogSW4gb3JkZXIgdG8gcXVlcnkgdGhlIGNoaWxkLCB1c2UgYSB7QGxpbmsgV29ya2Zsb3dDbGllbnR9IGZyb20gYW4gQWN0aXZpdHkuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzdGFydENoaWxkPFQgZXh0ZW5kcyAoKSA9PiBQcm9taXNlPGFueT4+KHdvcmtmbG93RnVuYzogVCk6IFByb21pc2U8Q2hpbGRXb3JrZmxvd0hhbmRsZTxUPj47XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzdGFydENoaWxkPFQgZXh0ZW5kcyBXb3JrZmxvdz4oXG4gIHdvcmtmbG93VHlwZU9yRnVuYzogc3RyaW5nIHwgVCxcbiAgb3B0aW9ucz86IFdpdGhXb3JrZmxvd0FyZ3M8VCwgQ2hpbGRXb3JrZmxvd09wdGlvbnM+XG4pOiBQcm9taXNlPENoaWxkV29ya2Zsb3dIYW5kbGU8VD4+IHtcbiAgY29uc3QgYWN0aXZhdG9yID0gYXNzZXJ0SW5Xb3JrZmxvd0NvbnRleHQoXG4gICAgJ1dvcmtmbG93LnN0YXJ0Q2hpbGQoLi4uKSBtYXkgb25seSBiZSB1c2VkIGZyb20gYSBXb3JrZmxvdyBFeGVjdXRpb24uIENvbnNpZGVyIHVzaW5nIENsaWVudC53b3JrZmxvdy5zdGFydCguLi4pIGluc3RlYWQuKSdcbiAgKTtcbiAgY29uc3Qgb3B0aW9uc1dpdGhEZWZhdWx0cyA9IGFkZERlZmF1bHRXb3JrZmxvd09wdGlvbnMob3B0aW9ucyA/PyAoe30gYXMgYW55KSk7XG4gIGNvbnN0IHdvcmtmbG93VHlwZSA9IGV4dHJhY3RXb3JrZmxvd1R5cGUod29ya2Zsb3dUeXBlT3JGdW5jKTtcbiAgY29uc3QgZXhlY3V0ZSA9IGNvbXBvc2VJbnRlcmNlcHRvcnMoXG4gICAgYWN0aXZhdG9yLmludGVyY2VwdG9ycy5vdXRib3VuZCxcbiAgICAnc3RhcnRDaGlsZFdvcmtmbG93RXhlY3V0aW9uJyxcbiAgICBzdGFydENoaWxkV29ya2Zsb3dFeGVjdXRpb25OZXh0SGFuZGxlclxuICApO1xuICBjb25zdCBbc3RhcnRlZCwgY29tcGxldGVkXSA9IGF3YWl0IGV4ZWN1dGUoe1xuICAgIHNlcTogYWN0aXZhdG9yLm5leHRTZXFzLmNoaWxkV29ya2Zsb3crKyxcbiAgICBvcHRpb25zOiBvcHRpb25zV2l0aERlZmF1bHRzLFxuICAgIGhlYWRlcnM6IHt9LFxuICAgIHdvcmtmbG93VHlwZSxcbiAgfSk7XG4gIGNvbnN0IGZpcnN0RXhlY3V0aW9uUnVuSWQgPSBhd2FpdCBzdGFydGVkO1xuXG4gIHJldHVybiB7XG4gICAgd29ya2Zsb3dJZDogb3B0aW9uc1dpdGhEZWZhdWx0cy53b3JrZmxvd0lkLFxuICAgIGZpcnN0RXhlY3V0aW9uUnVuSWQsXG4gICAgYXN5bmMgcmVzdWx0KCk6IFByb21pc2U8V29ya2Zsb3dSZXN1bHRUeXBlPFQ+PiB7XG4gICAgICByZXR1cm4gKGF3YWl0IGNvbXBsZXRlZCkgYXMgYW55O1xuICAgIH0sXG4gICAgYXN5bmMgc2lnbmFsPEFyZ3MgZXh0ZW5kcyBhbnlbXT4oZGVmOiBTaWduYWxEZWZpbml0aW9uPEFyZ3M+IHwgc3RyaW5nLCAuLi5hcmdzOiBBcmdzKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICByZXR1cm4gY29tcG9zZUludGVyY2VwdG9ycyhcbiAgICAgICAgYWN0aXZhdG9yLmludGVyY2VwdG9ycy5vdXRib3VuZCxcbiAgICAgICAgJ3NpZ25hbFdvcmtmbG93JyxcbiAgICAgICAgc2lnbmFsV29ya2Zsb3dOZXh0SGFuZGxlclxuICAgICAgKSh7XG4gICAgICAgIHNlcTogYWN0aXZhdG9yLm5leHRTZXFzLnNpZ25hbFdvcmtmbG93KyssXG4gICAgICAgIHNpZ25hbE5hbWU6IHR5cGVvZiBkZWYgPT09ICdzdHJpbmcnID8gZGVmIDogZGVmLm5hbWUsXG4gICAgICAgIGFyZ3MsXG4gICAgICAgIHRhcmdldDoge1xuICAgICAgICAgIHR5cGU6ICdjaGlsZCcsXG4gICAgICAgICAgY2hpbGRXb3JrZmxvd0lkOiBvcHRpb25zV2l0aERlZmF1bHRzLndvcmtmbG93SWQsXG4gICAgICAgIH0sXG4gICAgICAgIGhlYWRlcnM6IHt9LFxuICAgICAgfSk7XG4gICAgfSxcbiAgfTtcbn1cblxuLyoqXG4gKiBTdGFydCBhIGNoaWxkIFdvcmtmbG93IGV4ZWN1dGlvbiBhbmQgYXdhaXQgaXRzIGNvbXBsZXRpb24uXG4gKlxuICogLSBCeSBkZWZhdWx0LCBhIGNoaWxkIHdpbGwgYmUgc2NoZWR1bGVkIG9uIHRoZSBzYW1lIHRhc2sgcXVldWUgYXMgaXRzIHBhcmVudC5cbiAqIC0gVGhpcyBvcGVyYXRpb24gaXMgY2FuY2VsbGFibGUgdXNpbmcge0BsaW5rIENhbmNlbGxhdGlvblNjb3BlfXMuXG4gKlxuICogQHJldHVybiBUaGUgcmVzdWx0IG9mIHRoZSBjaGlsZCBXb3JrZmxvdy5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGV4ZWN1dGVDaGlsZDxUIGV4dGVuZHMgV29ya2Zsb3c+KFxuICB3b3JrZmxvd1R5cGU6IHN0cmluZyxcbiAgb3B0aW9uczogV2l0aFdvcmtmbG93QXJnczxULCBDaGlsZFdvcmtmbG93T3B0aW9ucz5cbik6IFByb21pc2U8V29ya2Zsb3dSZXN1bHRUeXBlPFQ+PjtcblxuLyoqXG4gKiBTdGFydCBhIGNoaWxkIFdvcmtmbG93IGV4ZWN1dGlvbiBhbmQgYXdhaXQgaXRzIGNvbXBsZXRpb24uXG4gKlxuICogLSBCeSBkZWZhdWx0LCBhIGNoaWxkIHdpbGwgYmUgc2NoZWR1bGVkIG9uIHRoZSBzYW1lIHRhc2sgcXVldWUgYXMgaXRzIHBhcmVudC5cbiAqIC0gRGVkdWNlcyB0aGUgV29ya2Zsb3cgdHlwZSBhbmQgc2lnbmF0dXJlIGZyb20gcHJvdmlkZWQgV29ya2Zsb3cgZnVuY3Rpb24uXG4gKiAtIFRoaXMgb3BlcmF0aW9uIGlzIGNhbmNlbGxhYmxlIHVzaW5nIHtAbGluayBDYW5jZWxsYXRpb25TY29wZX1zLlxuICpcbiAqIEByZXR1cm4gVGhlIHJlc3VsdCBvZiB0aGUgY2hpbGQgV29ya2Zsb3cuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBleGVjdXRlQ2hpbGQ8VCBleHRlbmRzIFdvcmtmbG93PihcbiAgd29ya2Zsb3dGdW5jOiBULFxuICBvcHRpb25zOiBXaXRoV29ya2Zsb3dBcmdzPFQsIENoaWxkV29ya2Zsb3dPcHRpb25zPlxuKTogUHJvbWlzZTxXb3JrZmxvd1Jlc3VsdFR5cGU8VD4+O1xuXG4vKipcbiAqIFN0YXJ0IGEgY2hpbGQgV29ya2Zsb3cgZXhlY3V0aW9uIGFuZCBhd2FpdCBpdHMgY29tcGxldGlvbi5cbiAqXG4gKiAqKk92ZXJyaWRlIGZvciBXb3JrZmxvd3MgdGhhdCBhY2NlcHQgbm8gYXJndW1lbnRzKiouXG4gKlxuICogLSBUaGUgY2hpbGQgd2lsbCBiZSBzY2hlZHVsZWQgb24gdGhlIHNhbWUgdGFzayBxdWV1ZSBhcyBpdHMgcGFyZW50LlxuICogLSBUaGlzIG9wZXJhdGlvbiBpcyBjYW5jZWxsYWJsZSB1c2luZyB7QGxpbmsgQ2FuY2VsbGF0aW9uU2NvcGV9cy5cbiAqXG4gKiBAcmV0dXJuIFRoZSByZXN1bHQgb2YgdGhlIGNoaWxkIFdvcmtmbG93LlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZXhlY3V0ZUNoaWxkPFQgZXh0ZW5kcyAoKSA9PiBXb3JrZmxvd1JldHVyblR5cGU+KFxuICB3b3JrZmxvd1R5cGU6IHN0cmluZ1xuKTogUHJvbWlzZTxXb3JrZmxvd1Jlc3VsdFR5cGU8VD4+O1xuXG4vKipcbiAqIFN0YXJ0IGEgY2hpbGQgV29ya2Zsb3cgZXhlY3V0aW9uIGFuZCBhd2FpdCBpdHMgY29tcGxldGlvbi5cbiAqXG4gKiAqKk92ZXJyaWRlIGZvciBXb3JrZmxvd3MgdGhhdCBhY2NlcHQgbm8gYXJndW1lbnRzKiouXG4gKlxuICogLSBUaGUgY2hpbGQgd2lsbCBiZSBzY2hlZHVsZWQgb24gdGhlIHNhbWUgdGFzayBxdWV1ZSBhcyBpdHMgcGFyZW50LlxuICogLSBEZWR1Y2VzIHRoZSBXb3JrZmxvdyB0eXBlIGFuZCBzaWduYXR1cmUgZnJvbSBwcm92aWRlZCBXb3JrZmxvdyBmdW5jdGlvbi5cbiAqIC0gVGhpcyBvcGVyYXRpb24gaXMgY2FuY2VsbGFibGUgdXNpbmcge0BsaW5rIENhbmNlbGxhdGlvblNjb3BlfXMuXG4gKlxuICogQHJldHVybiBUaGUgcmVzdWx0IG9mIHRoZSBjaGlsZCBXb3JrZmxvdy5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGV4ZWN1dGVDaGlsZDxUIGV4dGVuZHMgKCkgPT4gV29ya2Zsb3dSZXR1cm5UeXBlPih3b3JrZmxvd0Z1bmM6IFQpOiBQcm9taXNlPFdvcmtmbG93UmVzdWx0VHlwZTxUPj47XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBleGVjdXRlQ2hpbGQ8VCBleHRlbmRzIFdvcmtmbG93PihcbiAgd29ya2Zsb3dUeXBlT3JGdW5jOiBzdHJpbmcgfCBULFxuICBvcHRpb25zPzogV2l0aFdvcmtmbG93QXJnczxULCBDaGlsZFdvcmtmbG93T3B0aW9ucz5cbik6IFByb21pc2U8V29ya2Zsb3dSZXN1bHRUeXBlPFQ+PiB7XG4gIGNvbnN0IGFjdGl2YXRvciA9IGFzc2VydEluV29ya2Zsb3dDb250ZXh0KFxuICAgICdXb3JrZmxvdy5leGVjdXRlQ2hpbGQoLi4uKSBtYXkgb25seSBiZSB1c2VkIGZyb20gYSBXb3JrZmxvdyBFeGVjdXRpb24uIENvbnNpZGVyIHVzaW5nIENsaWVudC53b3JrZmxvdy5leGVjdXRlKC4uLikgaW5zdGVhZC4nXG4gICk7XG4gIGNvbnN0IG9wdGlvbnNXaXRoRGVmYXVsdHMgPSBhZGREZWZhdWx0V29ya2Zsb3dPcHRpb25zKG9wdGlvbnMgPz8gKHt9IGFzIGFueSkpO1xuICBjb25zdCB3b3JrZmxvd1R5cGUgPSBleHRyYWN0V29ya2Zsb3dUeXBlKHdvcmtmbG93VHlwZU9yRnVuYyk7XG4gIGNvbnN0IGV4ZWN1dGUgPSBjb21wb3NlSW50ZXJjZXB0b3JzKFxuICAgIGFjdGl2YXRvci5pbnRlcmNlcHRvcnMub3V0Ym91bmQsXG4gICAgJ3N0YXJ0Q2hpbGRXb3JrZmxvd0V4ZWN1dGlvbicsXG4gICAgc3RhcnRDaGlsZFdvcmtmbG93RXhlY3V0aW9uTmV4dEhhbmRsZXJcbiAgKTtcbiAgY29uc3QgZXhlY1Byb21pc2UgPSBleGVjdXRlKHtcbiAgICBzZXE6IGFjdGl2YXRvci5uZXh0U2Vxcy5jaGlsZFdvcmtmbG93KyssXG4gICAgb3B0aW9uczogb3B0aW9uc1dpdGhEZWZhdWx0cyxcbiAgICBoZWFkZXJzOiB7fSxcbiAgICB3b3JrZmxvd1R5cGUsXG4gIH0pO1xuICB1bnRyYWNrUHJvbWlzZShleGVjUHJvbWlzZSk7XG4gIGNvbnN0IGNvbXBsZXRlZFByb21pc2UgPSBleGVjUHJvbWlzZS50aGVuKChbX3N0YXJ0ZWQsIGNvbXBsZXRlZF0pID0+IGNvbXBsZXRlZCk7XG4gIHVudHJhY2tQcm9taXNlKGNvbXBsZXRlZFByb21pc2UpO1xuICByZXR1cm4gY29tcGxldGVkUHJvbWlzZSBhcyBQcm9taXNlPGFueT47XG59XG5cbi8qKlxuICogR2V0IGluZm9ybWF0aW9uIGFib3V0IHRoZSBjdXJyZW50IFdvcmtmbG93LlxuICpcbiAqIFdBUk5JTkc6IFRoaXMgZnVuY3Rpb24gcmV0dXJucyBhIGZyb3plbiBjb3B5IG9mIFdvcmtmbG93SW5mbywgYXQgdGhlIHBvaW50IHdoZXJlIHRoaXMgbWV0aG9kIGhhcyBiZWVuIGNhbGxlZC5cbiAqIENoYW5nZXMgaGFwcGVuaW5nIGF0IGxhdGVyIHBvaW50IGluIHdvcmtmbG93IGV4ZWN1dGlvbiB3aWxsIG5vdCBiZSByZWZsZWN0ZWQgaW4gdGhlIHJldHVybmVkIG9iamVjdC5cbiAqXG4gKiBGb3IgdGhpcyByZWFzb24sIHdlIHJlY29tbWVuZCBjYWxsaW5nIGB3b3JrZmxvd0luZm8oKWAgb24gZXZlcnkgYWNjZXNzIHRvIHtAbGluayBXb3JrZmxvd0luZm99J3MgZmllbGRzLFxuICogcmF0aGVyIHRoYW4gY2FjaGluZyB0aGUgYFdvcmtmbG93SW5mb2Agb2JqZWN0IChvciBwYXJ0IG9mIGl0KSBpbiBhIGxvY2FsIHZhcmlhYmxlLiBGb3IgZXhhbXBsZTpcbiAqXG4gKiBgYGB0c1xuICogLy8gR09PRFxuICogZnVuY3Rpb24gbXlXb3JrZmxvdygpIHtcbiAqICAgZG9Tb21ldGhpbmcod29ya2Zsb3dJbmZvKCkuc2VhcmNoQXR0cmlidXRlcylcbiAqICAgLi4uXG4gKiAgIGRvU29tZXRoaW5nRWxzZSh3b3JrZmxvd0luZm8oKS5zZWFyY2hBdHRyaWJ1dGVzKVxuICogfVxuICogYGBgXG4gKlxuICogdnNcbiAqXG4gKiBgYGB0c1xuICogLy8gQkFEXG4gKiBmdW5jdGlvbiBteVdvcmtmbG93KCkge1xuICogICBjb25zdCBhdHRyaWJ1dGVzID0gd29ya2Zsb3dJbmZvKCkuc2VhcmNoQXR0cmlidXRlc1xuICogICBkb1NvbWV0aGluZyhhdHRyaWJ1dGVzKVxuICogICAuLi5cbiAqICAgZG9Tb21ldGhpbmdFbHNlKGF0dHJpYnV0ZXMpXG4gKiB9XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHdvcmtmbG93SW5mbygpOiBXb3JrZmxvd0luZm8ge1xuICBjb25zdCBhY3RpdmF0b3IgPSBhc3NlcnRJbldvcmtmbG93Q29udGV4dCgnV29ya2Zsb3cud29ya2Zsb3dJbmZvKC4uLikgbWF5IG9ubHkgYmUgdXNlZCBmcm9tIGEgV29ya2Zsb3cgRXhlY3V0aW9uLicpO1xuICByZXR1cm4gYWN0aXZhdG9yLmluZm87XG59XG5cbi8qKlxuICogR2V0IGluZm9ybWF0aW9uIGFib3V0IHRoZSBjdXJyZW50IHVwZGF0ZSBpZiBhbnkuXG4gKlxuICogQHJldHVybiBJbmZvIGZvciB0aGUgY3VycmVudCB1cGRhdGUgaGFuZGxlciB0aGUgY29kZSBjYWxsaW5nIHRoaXMgaXMgZXhlY3V0aW5nXG4gKiB3aXRoaW4gaWYgYW55LlxuICpcbiAqIEBleHBlcmltZW50YWxcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGN1cnJlbnRVcGRhdGVJbmZvKCk6IFVwZGF0ZUluZm8gfCB1bmRlZmluZWQge1xuICBhc3NlcnRJbldvcmtmbG93Q29udGV4dCgnV29ya2Zsb3cuY3VycmVudFVwZGF0ZUluZm8oLi4uKSBtYXkgb25seSBiZSB1c2VkIGZyb20gYSBXb3JrZmxvdyBFeGVjdXRpb24uJyk7XG4gIHJldHVybiBVcGRhdGVTY29wZS5jdXJyZW50KCk7XG59XG5cbi8qKlxuICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCBjb2RlIGlzIGV4ZWN1dGluZyBpbiB3b3JrZmxvdyBjb250ZXh0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbldvcmtmbG93Q29udGV4dCgpOiBib29sZWFuIHtcbiAgcmV0dXJuIG1heWJlR2V0QWN0aXZhdG9yKCkgIT09IHVuZGVmaW5lZDtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGEgZnVuY3Rpb24gYGZgIHRoYXQgd2lsbCBjYXVzZSB0aGUgY3VycmVudCBXb3JrZmxvdyB0byBDb250aW51ZUFzTmV3IHdoZW4gY2FsbGVkLlxuICpcbiAqIGBmYCB0YWtlcyB0aGUgc2FtZSBhcmd1bWVudHMgYXMgdGhlIFdvcmtmbG93IGZ1bmN0aW9uIHN1cHBsaWVkIHRvIHR5cGVwYXJhbSBgRmAuXG4gKlxuICogT25jZSBgZmAgaXMgY2FsbGVkLCBXb3JrZmxvdyBFeGVjdXRpb24gaW1tZWRpYXRlbHkgY29tcGxldGVzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gbWFrZUNvbnRpbnVlQXNOZXdGdW5jPEYgZXh0ZW5kcyBXb3JrZmxvdz4oXG4gIG9wdGlvbnM/OiBDb250aW51ZUFzTmV3T3B0aW9uc1xuKTogKC4uLmFyZ3M6IFBhcmFtZXRlcnM8Rj4pID0+IFByb21pc2U8bmV2ZXI+IHtcbiAgY29uc3QgYWN0aXZhdG9yID0gYXNzZXJ0SW5Xb3JrZmxvd0NvbnRleHQoXG4gICAgJ1dvcmtmbG93LmNvbnRpbnVlQXNOZXcoLi4uKSBhbmQgV29ya2Zsb3cubWFrZUNvbnRpbnVlQXNOZXdGdW5jKC4uLikgbWF5IG9ubHkgYmUgdXNlZCBmcm9tIGEgV29ya2Zsb3cgRXhlY3V0aW9uLidcbiAgKTtcbiAgY29uc3QgaW5mbyA9IGFjdGl2YXRvci5pbmZvO1xuICBjb25zdCB7IHdvcmtmbG93VHlwZSwgdGFza1F1ZXVlLCAuLi5yZXN0IH0gPSBvcHRpb25zID8/IHt9O1xuICBjb25zdCByZXF1aXJlZE9wdGlvbnMgPSB7XG4gICAgd29ya2Zsb3dUeXBlOiB3b3JrZmxvd1R5cGUgPz8gaW5mby53b3JrZmxvd1R5cGUsXG4gICAgdGFza1F1ZXVlOiB0YXNrUXVldWUgPz8gaW5mby50YXNrUXVldWUsXG4gICAgLi4ucmVzdCxcbiAgfTtcblxuICByZXR1cm4gKC4uLmFyZ3M6IFBhcmFtZXRlcnM8Rj4pOiBQcm9taXNlPG5ldmVyPiA9PiB7XG4gICAgY29uc3QgZm4gPSBjb21wb3NlSW50ZXJjZXB0b3JzKGFjdGl2YXRvci5pbnRlcmNlcHRvcnMub3V0Ym91bmQsICdjb250aW51ZUFzTmV3JywgYXN5bmMgKGlucHV0KSA9PiB7XG4gICAgICBjb25zdCB7IGhlYWRlcnMsIGFyZ3MsIG9wdGlvbnMgfSA9IGlucHV0O1xuICAgICAgdGhyb3cgbmV3IENvbnRpbnVlQXNOZXcoe1xuICAgICAgICB3b3JrZmxvd1R5cGU6IG9wdGlvbnMud29ya2Zsb3dUeXBlLFxuICAgICAgICBhcmd1bWVudHM6IHRvUGF5bG9hZHMoYWN0aXZhdG9yLnBheWxvYWRDb252ZXJ0ZXIsIC4uLmFyZ3MpLFxuICAgICAgICBoZWFkZXJzLFxuICAgICAgICB0YXNrUXVldWU6IG9wdGlvbnMudGFza1F1ZXVlLFxuICAgICAgICBtZW1vOiBvcHRpb25zLm1lbW8gJiYgbWFwVG9QYXlsb2FkcyhhY3RpdmF0b3IucGF5bG9hZENvbnZlcnRlciwgb3B0aW9ucy5tZW1vKSxcbiAgICAgICAgc2VhcmNoQXR0cmlidXRlczogb3B0aW9ucy5zZWFyY2hBdHRyaWJ1dGVzXG4gICAgICAgICAgPyBtYXBUb1BheWxvYWRzKHNlYXJjaEF0dHJpYnV0ZVBheWxvYWRDb252ZXJ0ZXIsIG9wdGlvbnMuc2VhcmNoQXR0cmlidXRlcylcbiAgICAgICAgICA6IHVuZGVmaW5lZCxcbiAgICAgICAgd29ya2Zsb3dSdW5UaW1lb3V0OiBtc09wdGlvbmFsVG9UcyhvcHRpb25zLndvcmtmbG93UnVuVGltZW91dCksXG4gICAgICAgIHdvcmtmbG93VGFza1RpbWVvdXQ6IG1zT3B0aW9uYWxUb1RzKG9wdGlvbnMud29ya2Zsb3dUYXNrVGltZW91dCksXG4gICAgICAgIHZlcnNpb25pbmdJbnRlbnQ6IHZlcnNpb25pbmdJbnRlbnRUb1Byb3RvKG9wdGlvbnMudmVyc2lvbmluZ0ludGVudCksXG4gICAgICB9KTtcbiAgICB9KTtcbiAgICByZXR1cm4gZm4oe1xuICAgICAgYXJncyxcbiAgICAgIGhlYWRlcnM6IHt9LFxuICAgICAgb3B0aW9uczogcmVxdWlyZWRPcHRpb25zLFxuICAgIH0pO1xuICB9O1xufVxuXG4vKipcbiAqIHtAbGluayBodHRwczovL2RvY3MudGVtcG9yYWwuaW8vY29uY2VwdHMvd2hhdC1pcy1jb250aW51ZS1hcy1uZXcvIHwgQ29udGludWVzLUFzLU5ld30gdGhlIGN1cnJlbnQgV29ya2Zsb3cgRXhlY3V0aW9uXG4gKiB3aXRoIGRlZmF1bHQgb3B0aW9ucy5cbiAqXG4gKiBTaG9ydGhhbmQgZm9yIGBtYWtlQ29udGludWVBc05ld0Z1bmM8Rj4oKSguLi5hcmdzKWAuIChTZWU6IHtAbGluayBtYWtlQ29udGludWVBc05ld0Z1bmN9LilcbiAqXG4gKiBAZXhhbXBsZVxuICpcbiAqYGBgdHNcbiAqaW1wb3J0IHsgY29udGludWVBc05ldyB9IGZyb20gJ0B0ZW1wb3JhbGlvL3dvcmtmbG93JztcbiAqXG4gKmV4cG9ydCBhc3luYyBmdW5jdGlvbiBteVdvcmtmbG93KG46IG51bWJlcik6IFByb21pc2U8dm9pZD4ge1xuICogIC8vIC4uLiBXb3JrZmxvdyBsb2dpY1xuICogIGF3YWl0IGNvbnRpbnVlQXNOZXc8dHlwZW9mIG15V29ya2Zsb3c+KG4gKyAxKTtcbiAqfVxuICpgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbnRpbnVlQXNOZXc8RiBleHRlbmRzIFdvcmtmbG93PiguLi5hcmdzOiBQYXJhbWV0ZXJzPEY+KTogUHJvbWlzZTxuZXZlcj4ge1xuICByZXR1cm4gbWFrZUNvbnRpbnVlQXNOZXdGdW5jKCkoLi4uYXJncyk7XG59XG5cbi8qKlxuICogR2VuZXJhdGUgYW4gUkZDIGNvbXBsaWFudCBWNCB1dWlkLlxuICogVXNlcyB0aGUgd29ya2Zsb3cncyBkZXRlcm1pbmlzdGljIFBSTkcgbWFraW5nIGl0IHNhZmUgZm9yIHVzZSB3aXRoaW4gYSB3b3JrZmxvdy5cbiAqIFRoaXMgZnVuY3Rpb24gaXMgY3J5cHRvZ3JhcGhpY2FsbHkgaW5zZWN1cmUuXG4gKiBTZWUgdGhlIHtAbGluayBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xMDUwMzQvaG93LXRvLWNyZWF0ZS1hLWd1aWQtdXVpZCB8IHN0YWNrb3ZlcmZsb3cgZGlzY3Vzc2lvbn0uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1dWlkNCgpOiBzdHJpbmcge1xuICAvLyBSZXR1cm4gdGhlIGhleGFkZWNpbWFsIHRleHQgcmVwcmVzZW50YXRpb24gb2YgbnVtYmVyIGBuYCwgcGFkZGVkIHdpdGggemVyb2VzIHRvIGJlIG9mIGxlbmd0aCBgcGBcbiAgY29uc3QgaG8gPSAobjogbnVtYmVyLCBwOiBudW1iZXIpID0+IG4udG9TdHJpbmcoMTYpLnBhZFN0YXJ0KHAsICcwJyk7XG4gIC8vIENyZWF0ZSBhIHZpZXcgYmFja2VkIGJ5IGEgMTYtYnl0ZSBidWZmZXJcbiAgY29uc3QgdmlldyA9IG5ldyBEYXRhVmlldyhuZXcgQXJyYXlCdWZmZXIoMTYpKTtcbiAgLy8gRmlsbCBidWZmZXIgd2l0aCByYW5kb20gdmFsdWVzXG4gIHZpZXcuc2V0VWludDMyKDAsIChNYXRoLnJhbmRvbSgpICogMHgxMDAwMDAwMDApID4+PiAwKTtcbiAgdmlldy5zZXRVaW50MzIoNCwgKE1hdGgucmFuZG9tKCkgKiAweDEwMDAwMDAwMCkgPj4+IDApO1xuICB2aWV3LnNldFVpbnQzMig4LCAoTWF0aC5yYW5kb20oKSAqIDB4MTAwMDAwMDAwKSA+Pj4gMCk7XG4gIHZpZXcuc2V0VWludDMyKDEyLCAoTWF0aC5yYW5kb20oKSAqIDB4MTAwMDAwMDAwKSA+Pj4gMCk7XG4gIC8vIFBhdGNoIHRoZSA2dGggYnl0ZSB0byByZWZsZWN0IGEgdmVyc2lvbiA0IFVVSURcbiAgdmlldy5zZXRVaW50OCg2LCAodmlldy5nZXRVaW50OCg2KSAmIDB4ZikgfCAweDQwKTtcbiAgLy8gUGF0Y2ggdGhlIDh0aCBieXRlIHRvIHJlZmxlY3QgYSB2YXJpYW50IDEgVVVJRCAodmVyc2lvbiA0IFVVSURzIGFyZSlcbiAgdmlldy5zZXRVaW50OCg4LCAodmlldy5nZXRVaW50OCg4KSAmIDB4M2YpIHwgMHg4MCk7XG4gIC8vIENvbXBpbGUgdGhlIGNhbm9uaWNhbCB0ZXh0dWFsIGZvcm0gZnJvbSB0aGUgYXJyYXkgZGF0YVxuICByZXR1cm4gYCR7aG8odmlldy5nZXRVaW50MzIoMCksIDgpfS0ke2hvKHZpZXcuZ2V0VWludDE2KDQpLCA0KX0tJHtobyh2aWV3LmdldFVpbnQxNig2KSwgNCl9LSR7aG8oXG4gICAgdmlldy5nZXRVaW50MTYoOCksXG4gICAgNFxuICApfS0ke2hvKHZpZXcuZ2V0VWludDMyKDEwKSwgOCl9JHtobyh2aWV3LmdldFVpbnQxNigxNCksIDQpfWA7XG59XG5cbi8qKlxuICogUGF0Y2ggb3IgdXBncmFkZSB3b3JrZmxvdyBjb2RlIGJ5IGNoZWNraW5nIG9yIHN0YXRpbmcgdGhhdCB0aGlzIHdvcmtmbG93IGhhcyBhIGNlcnRhaW4gcGF0Y2guXG4gKlxuICogU2VlIHtAbGluayBodHRwczovL2RvY3MudGVtcG9yYWwuaW8vdHlwZXNjcmlwdC92ZXJzaW9uaW5nIHwgZG9jcyBwYWdlfSBmb3IgaW5mby5cbiAqXG4gKiBJZiB0aGUgd29ya2Zsb3cgaXMgcmVwbGF5aW5nIGFuIGV4aXN0aW5nIGhpc3RvcnksIHRoZW4gdGhpcyBmdW5jdGlvbiByZXR1cm5zIHRydWUgaWYgdGhhdFxuICogaGlzdG9yeSB3YXMgcHJvZHVjZWQgYnkgYSB3b3JrZXIgd2hpY2ggYWxzbyBoYWQgYSBgcGF0Y2hlZGAgY2FsbCB3aXRoIHRoZSBzYW1lIGBwYXRjaElkYC5cbiAqIElmIHRoZSBoaXN0b3J5IHdhcyBwcm9kdWNlZCBieSBhIHdvcmtlciAqd2l0aG91dCogc3VjaCBhIGNhbGwsIHRoZW4gaXQgd2lsbCByZXR1cm4gZmFsc2UuXG4gKlxuICogSWYgdGhlIHdvcmtmbG93IGlzIG5vdCBjdXJyZW50bHkgcmVwbGF5aW5nLCB0aGVuIHRoaXMgY2FsbCAqYWx3YXlzKiByZXR1cm5zIHRydWUuXG4gKlxuICogWW91ciB3b3JrZmxvdyBjb2RlIHNob3VsZCBydW4gdGhlIFwibmV3XCIgY29kZSBpZiB0aGlzIHJldHVybnMgdHJ1ZSwgaWYgaXQgcmV0dXJucyBmYWxzZSwgeW91XG4gKiBzaG91bGQgcnVuIHRoZSBcIm9sZFwiIGNvZGUuIEJ5IGRvaW5nIHRoaXMsIHlvdSBjYW4gbWFpbnRhaW4gZGV0ZXJtaW5pc20uXG4gKlxuICogQHBhcmFtIHBhdGNoSWQgQW4gaWRlbnRpZmllciB0aGF0IHNob3VsZCBiZSB1bmlxdWUgdG8gdGhpcyBwYXRjaC4gSXQgaXMgT0sgdG8gdXNlIG11bHRpcGxlXG4gKiBjYWxscyB3aXRoIHRoZSBzYW1lIElELCB3aGljaCBtZWFucyBhbGwgc3VjaCBjYWxscyB3aWxsIGFsd2F5cyByZXR1cm4gdGhlIHNhbWUgdmFsdWUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXRjaGVkKHBhdGNoSWQ6IHN0cmluZyk6IGJvb2xlYW4ge1xuICBjb25zdCBhY3RpdmF0b3IgPSBhc3NlcnRJbldvcmtmbG93Q29udGV4dChcbiAgICAnV29ya2Zsb3cucGF0Y2goLi4uKSBhbmQgV29ya2Zsb3cuZGVwcmVjYXRlUGF0Y2ggbWF5IG9ubHkgYmUgdXNlZCBmcm9tIGEgV29ya2Zsb3cgRXhlY3V0aW9uLidcbiAgKTtcbiAgcmV0dXJuIGFjdGl2YXRvci5wYXRjaEludGVybmFsKHBhdGNoSWQsIGZhbHNlKTtcbn1cblxuLyoqXG4gKiBJbmRpY2F0ZSB0aGF0IGEgcGF0Y2ggaXMgYmVpbmcgcGhhc2VkIG91dC5cbiAqXG4gKiBTZWUge0BsaW5rIGh0dHBzOi8vZG9jcy50ZW1wb3JhbC5pby90eXBlc2NyaXB0L3ZlcnNpb25pbmcgfCBkb2NzIHBhZ2V9IGZvciBpbmZvLlxuICpcbiAqIFdvcmtmbG93cyB3aXRoIHRoaXMgY2FsbCBtYXkgYmUgZGVwbG95ZWQgYWxvbmdzaWRlIHdvcmtmbG93cyB3aXRoIGEge0BsaW5rIHBhdGNoZWR9IGNhbGwsIGJ1dFxuICogdGhleSBtdXN0ICpub3QqIGJlIGRlcGxveWVkIHdoaWxlIGFueSB3b3JrZXJzIHN0aWxsIGV4aXN0IHJ1bm5pbmcgb2xkIGNvZGUgd2l0aG91dCBhXG4gKiB7QGxpbmsgcGF0Y2hlZH0gY2FsbCwgb3IgYW55IHJ1bnMgd2l0aCBoaXN0b3JpZXMgcHJvZHVjZWQgYnkgc3VjaCB3b3JrZXJzIGV4aXN0LiBJZiBlaXRoZXIga2luZFxuICogb2Ygd29ya2VyIGVuY291bnRlcnMgYSBoaXN0b3J5IHByb2R1Y2VkIGJ5IHRoZSBvdGhlciwgdGhlaXIgYmVoYXZpb3IgaXMgdW5kZWZpbmVkLlxuICpcbiAqIE9uY2UgYWxsIGxpdmUgd29ya2Zsb3cgcnVucyBoYXZlIGJlZW4gcHJvZHVjZWQgYnkgd29ya2VycyB3aXRoIHRoaXMgY2FsbCwgeW91IGNhbiBkZXBsb3kgd29ya2Vyc1xuICogd2hpY2ggYXJlIGZyZWUgb2YgZWl0aGVyIGtpbmQgb2YgcGF0Y2ggY2FsbCBmb3IgdGhpcyBJRC4gV29ya2VycyB3aXRoIGFuZCB3aXRob3V0IHRoaXMgY2FsbFxuICogbWF5IGNvZXhpc3QsIGFzIGxvbmcgYXMgdGhleSBhcmUgYm90aCBydW5uaW5nIHRoZSBcIm5ld1wiIGNvZGUuXG4gKlxuICogQHBhcmFtIHBhdGNoSWQgQW4gaWRlbnRpZmllciB0aGF0IHNob3VsZCBiZSB1bmlxdWUgdG8gdGhpcyBwYXRjaC4gSXQgaXMgT0sgdG8gdXNlIG11bHRpcGxlXG4gKiBjYWxscyB3aXRoIHRoZSBzYW1lIElELCB3aGljaCBtZWFucyBhbGwgc3VjaCBjYWxscyB3aWxsIGFsd2F5cyByZXR1cm4gdGhlIHNhbWUgdmFsdWUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZXByZWNhdGVQYXRjaChwYXRjaElkOiBzdHJpbmcpOiB2b2lkIHtcbiAgY29uc3QgYWN0aXZhdG9yID0gYXNzZXJ0SW5Xb3JrZmxvd0NvbnRleHQoXG4gICAgJ1dvcmtmbG93LnBhdGNoKC4uLikgYW5kIFdvcmtmbG93LmRlcHJlY2F0ZVBhdGNoIG1heSBvbmx5IGJlIHVzZWQgZnJvbSBhIFdvcmtmbG93IEV4ZWN1dGlvbi4nXG4gICk7XG4gIGFjdGl2YXRvci5wYXRjaEludGVybmFsKHBhdGNoSWQsIHRydWUpO1xufVxuXG4vKipcbiAqIFJldHVybnMgYSBQcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2hlbiBgZm5gIGV2YWx1YXRlcyB0byBgdHJ1ZWAgb3IgYHRpbWVvdXRgIGV4cGlyZXMuXG4gKlxuICogQHBhcmFtIHRpbWVvdXQgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBvciB7QGxpbmsgaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvbXMgfCBtcy1mb3JtYXR0ZWQgc3RyaW5nfVxuICpcbiAqIEByZXR1cm5zIGEgYm9vbGVhbiBpbmRpY2F0aW5nIHdoZXRoZXIgdGhlIGNvbmRpdGlvbiB3YXMgdHJ1ZSBiZWZvcmUgdGhlIHRpbWVvdXQgZXhwaXJlc1xuICovXG5leHBvcnQgZnVuY3Rpb24gY29uZGl0aW9uKGZuOiAoKSA9PiBib29sZWFuLCB0aW1lb3V0OiBEdXJhdGlvbik6IFByb21pc2U8Ym9vbGVhbj47XG5cbi8qKlxuICogUmV0dXJucyBhIFByb21pc2UgdGhhdCByZXNvbHZlcyB3aGVuIGBmbmAgZXZhbHVhdGVzIHRvIGB0cnVlYC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbmRpdGlvbihmbjogKCkgPT4gYm9vbGVhbik6IFByb21pc2U8dm9pZD47XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjb25kaXRpb24oZm46ICgpID0+IGJvb2xlYW4sIHRpbWVvdXQ/OiBEdXJhdGlvbik6IFByb21pc2U8dm9pZCB8IGJvb2xlYW4+IHtcbiAgYXNzZXJ0SW5Xb3JrZmxvd0NvbnRleHQoJ1dvcmtmbG93LmNvbmRpdGlvbiguLi4pIG1heSBvbmx5IGJlIHVzZWQgZnJvbSBhIFdvcmtmbG93IEV4ZWN1dGlvbi4nKTtcbiAgLy8gUHJpb3IgdG8gMS41LjAsIGBjb25kaXRpb24oZm4sIDApYCB3YXMgdHJlYXRlZCBhcyBlcXVpdmFsZW50IHRvIGBjb25kaXRpb24oZm4sIHVuZGVmaW5lZClgXG4gIGlmICh0aW1lb3V0ID09PSAwICYmICFwYXRjaGVkKENPTkRJVElPTl8wX1BBVENIKSkge1xuICAgIHJldHVybiBjb25kaXRpb25Jbm5lcihmbik7XG4gIH1cbiAgaWYgKHR5cGVvZiB0aW1lb3V0ID09PSAnbnVtYmVyJyB8fCB0eXBlb2YgdGltZW91dCA9PT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gQ2FuY2VsbGF0aW9uU2NvcGUuY2FuY2VsbGFibGUoYXN5bmMgKCkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIGF3YWl0IFByb21pc2UucmFjZShbc2xlZXAodGltZW91dCkudGhlbigoKSA9PiBmYWxzZSksIGNvbmRpdGlvbklubmVyKGZuKS50aGVuKCgpID0+IHRydWUpXSk7XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICBDYW5jZWxsYXRpb25TY29wZS5jdXJyZW50KCkuY2FuY2VsKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbiAgcmV0dXJuIGNvbmRpdGlvbklubmVyKGZuKTtcbn1cblxuZnVuY3Rpb24gY29uZGl0aW9uSW5uZXIoZm46ICgpID0+IGJvb2xlYW4pOiBQcm9taXNlPHZvaWQ+IHtcbiAgY29uc3QgYWN0aXZhdG9yID0gZ2V0QWN0aXZhdG9yKCk7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgY29uc3Qgc2NvcGUgPSBDYW5jZWxsYXRpb25TY29wZS5jdXJyZW50KCk7XG4gICAgaWYgKHNjb3BlLmNvbnNpZGVyZWRDYW5jZWxsZWQpIHtcbiAgICAgIHVudHJhY2tQcm9taXNlKHNjb3BlLmNhbmNlbFJlcXVlc3RlZC5jYXRjaChyZWplY3QpKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBzZXEgPSBhY3RpdmF0b3IubmV4dFNlcXMuY29uZGl0aW9uKys7XG4gICAgaWYgKHNjb3BlLmNhbmNlbGxhYmxlKSB7XG4gICAgICB1bnRyYWNrUHJvbWlzZShcbiAgICAgICAgc2NvcGUuY2FuY2VsUmVxdWVzdGVkLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICBhY3RpdmF0b3IuYmxvY2tlZENvbmRpdGlvbnMuZGVsZXRlKHNlcSk7XG4gICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgIH0pXG4gICAgICApO1xuICAgIH1cblxuICAgIC8vIEVhZ2VyIGV2YWx1YXRpb25cbiAgICBpZiAoZm4oKSkge1xuICAgICAgcmVzb2x2ZSgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGFjdGl2YXRvci5ibG9ja2VkQ29uZGl0aW9ucy5zZXQoc2VxLCB7IGZuLCByZXNvbHZlIH0pO1xuICB9KTtcbn1cblxuLyoqXG4gKiBEZWZpbmUgYW4gdXBkYXRlIG1ldGhvZCBmb3IgYSBXb3JrZmxvdy5cbiAqXG4gKiBBIGRlZmluaXRpb24gaXMgdXNlZCB0byByZWdpc3RlciBhIGhhbmRsZXIgaW4gdGhlIFdvcmtmbG93IHZpYSB7QGxpbmsgc2V0SGFuZGxlcn0gYW5kIHRvIHVwZGF0ZSBhIFdvcmtmbG93IHVzaW5nIGEge0BsaW5rIFdvcmtmbG93SGFuZGxlfSwge0BsaW5rIENoaWxkV29ya2Zsb3dIYW5kbGV9IG9yIHtAbGluayBFeHRlcm5hbFdvcmtmbG93SGFuZGxlfS5cbiAqIEEgZGVmaW5pdGlvbiBjYW4gYmUgcmV1c2VkIGluIG11bHRpcGxlIFdvcmtmbG93cy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRlZmluZVVwZGF0ZTxSZXQsIEFyZ3MgZXh0ZW5kcyBhbnlbXSA9IFtdLCBOYW1lIGV4dGVuZHMgc3RyaW5nID0gc3RyaW5nPihcbiAgbmFtZTogTmFtZVxuKTogVXBkYXRlRGVmaW5pdGlvbjxSZXQsIEFyZ3MsIE5hbWU+IHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiAndXBkYXRlJyxcbiAgICBuYW1lLFxuICB9IGFzIFVwZGF0ZURlZmluaXRpb248UmV0LCBBcmdzLCBOYW1lPjtcbn1cblxuLyoqXG4gKiBEZWZpbmUgYSBzaWduYWwgbWV0aG9kIGZvciBhIFdvcmtmbG93LlxuICpcbiAqIEEgZGVmaW5pdGlvbiBpcyB1c2VkIHRvIHJlZ2lzdGVyIGEgaGFuZGxlciBpbiB0aGUgV29ya2Zsb3cgdmlhIHtAbGluayBzZXRIYW5kbGVyfSBhbmQgdG8gc2lnbmFsIGEgV29ya2Zsb3cgdXNpbmcgYSB7QGxpbmsgV29ya2Zsb3dIYW5kbGV9LCB7QGxpbmsgQ2hpbGRXb3JrZmxvd0hhbmRsZX0gb3Ige0BsaW5rIEV4dGVybmFsV29ya2Zsb3dIYW5kbGV9LlxuICogQSBkZWZpbml0aW9uIGNhbiBiZSByZXVzZWQgaW4gbXVsdGlwbGUgV29ya2Zsb3dzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZGVmaW5lU2lnbmFsPEFyZ3MgZXh0ZW5kcyBhbnlbXSA9IFtdLCBOYW1lIGV4dGVuZHMgc3RyaW5nID0gc3RyaW5nPihcbiAgbmFtZTogTmFtZVxuKTogU2lnbmFsRGVmaW5pdGlvbjxBcmdzLCBOYW1lPiB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogJ3NpZ25hbCcsXG4gICAgbmFtZSxcbiAgfSBhcyBTaWduYWxEZWZpbml0aW9uPEFyZ3MsIE5hbWU+O1xufVxuXG4vKipcbiAqIERlZmluZSBhIHF1ZXJ5IG1ldGhvZCBmb3IgYSBXb3JrZmxvdy5cbiAqXG4gKiBBIGRlZmluaXRpb24gaXMgdXNlZCB0byByZWdpc3RlciBhIGhhbmRsZXIgaW4gdGhlIFdvcmtmbG93IHZpYSB7QGxpbmsgc2V0SGFuZGxlcn0gYW5kIHRvIHF1ZXJ5IGEgV29ya2Zsb3cgdXNpbmcgYSB7QGxpbmsgV29ya2Zsb3dIYW5kbGV9LlxuICogQSBkZWZpbml0aW9uIGNhbiBiZSByZXVzZWQgaW4gbXVsdGlwbGUgV29ya2Zsb3dzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZGVmaW5lUXVlcnk8UmV0LCBBcmdzIGV4dGVuZHMgYW55W10gPSBbXSwgTmFtZSBleHRlbmRzIHN0cmluZyA9IHN0cmluZz4oXG4gIG5hbWU6IE5hbWVcbik6IFF1ZXJ5RGVmaW5pdGlvbjxSZXQsIEFyZ3MsIE5hbWU+IHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiAncXVlcnknLFxuICAgIG5hbWUsXG4gIH0gYXMgUXVlcnlEZWZpbml0aW9uPFJldCwgQXJncywgTmFtZT47XG59XG5cbi8qKlxuICogU2V0IGEgaGFuZGxlciBmdW5jdGlvbiBmb3IgYSBXb3JrZmxvdyB1cGRhdGUsIHNpZ25hbCwgb3IgcXVlcnkuXG4gKlxuICogSWYgdGhpcyBmdW5jdGlvbiBpcyBjYWxsZWQgbXVsdGlwbGUgdGltZXMgZm9yIGEgZ2l2ZW4gdXBkYXRlLCBzaWduYWwsIG9yIHF1ZXJ5IG5hbWUgdGhlIGxhc3QgaGFuZGxlciB3aWxsIG92ZXJ3cml0ZSBhbnkgcHJldmlvdXMgY2FsbHMuXG4gKlxuICogQHBhcmFtIGRlZiBhbiB7QGxpbmsgVXBkYXRlRGVmaW5pdGlvbn0sIHtAbGluayBTaWduYWxEZWZpbml0aW9ufSwgb3Ige0BsaW5rIFF1ZXJ5RGVmaW5pdGlvbn0gYXMgcmV0dXJuZWQgYnkge0BsaW5rIGRlZmluZVVwZGF0ZX0sIHtAbGluayBkZWZpbmVTaWduYWx9LCBvciB7QGxpbmsgZGVmaW5lUXVlcnl9IHJlc3BlY3RpdmVseS5cbiAqIEBwYXJhbSBoYW5kbGVyIGEgY29tcGF0aWJsZSBoYW5kbGVyIGZ1bmN0aW9uIGZvciB0aGUgZ2l2ZW4gZGVmaW5pdGlvbiBvciBgdW5kZWZpbmVkYCB0byB1bnNldCB0aGUgaGFuZGxlci5cbiAqIEBwYXJhbSBvcHRpb25zIGFuIG9wdGlvbmFsIGBkZXNjcmlwdGlvbmAgb2YgdGhlIGhhbmRsZXIgYW5kIGFuIG9wdGlvbmFsIHVwZGF0ZSBgdmFsaWRhdG9yYCBmdW5jdGlvbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldEhhbmRsZXI8UmV0LCBBcmdzIGV4dGVuZHMgYW55W10sIFQgZXh0ZW5kcyBRdWVyeURlZmluaXRpb248UmV0LCBBcmdzPj4oXG4gIGRlZjogVCxcbiAgaGFuZGxlcjogSGFuZGxlcjxSZXQsIEFyZ3MsIFQ+IHwgdW5kZWZpbmVkLFxuICBvcHRpb25zPzogUXVlcnlIYW5kbGVyT3B0aW9uc1xuKTogdm9pZDtcbmV4cG9ydCBmdW5jdGlvbiBzZXRIYW5kbGVyPFJldCwgQXJncyBleHRlbmRzIGFueVtdLCBUIGV4dGVuZHMgU2lnbmFsRGVmaW5pdGlvbjxBcmdzPj4oXG4gIGRlZjogVCxcbiAgaGFuZGxlcjogSGFuZGxlcjxSZXQsIEFyZ3MsIFQ+IHwgdW5kZWZpbmVkLFxuICBvcHRpb25zPzogU2lnbmFsSGFuZGxlck9wdGlvbnNcbik6IHZvaWQ7XG5leHBvcnQgZnVuY3Rpb24gc2V0SGFuZGxlcjxSZXQsIEFyZ3MgZXh0ZW5kcyBhbnlbXSwgVCBleHRlbmRzIFVwZGF0ZURlZmluaXRpb248UmV0LCBBcmdzPj4oXG4gIGRlZjogVCxcbiAgaGFuZGxlcjogSGFuZGxlcjxSZXQsIEFyZ3MsIFQ+IHwgdW5kZWZpbmVkLFxuICBvcHRpb25zPzogVXBkYXRlSGFuZGxlck9wdGlvbnM8QXJncz5cbik6IHZvaWQ7XG5cbi8vIEZvciBVcGRhdGVzIGFuZCBTaWduYWxzIHdlIHdhbnQgdG8gbWFrZSBhIHB1YmxpYyBndWFyYW50ZWUgc29tZXRoaW5nIGxpa2UgdGhlXG4vLyBmb2xsb3dpbmc6XG4vL1xuLy8gICBcIklmIGEgV0ZUIGNvbnRhaW5zIGEgU2lnbmFsL1VwZGF0ZSwgYW5kIGlmIGEgaGFuZGxlciBpcyBhdmFpbGFibGUgZm9yIHRoYXRcbi8vICAgU2lnbmFsL1VwZGF0ZSwgdGhlbiB0aGUgaGFuZGxlciB3aWxsIGJlIGV4ZWN1dGVkLlwiXCJcbi8vXG4vLyBIb3dldmVyLCB0aGF0IHN0YXRlbWVudCBpcyBub3Qgd2VsbC1kZWZpbmVkLCBsZWF2aW5nIHNldmVyYWwgcXVlc3Rpb25zIG9wZW46XG4vL1xuLy8gMS4gV2hhdCBkb2VzIGl0IG1lYW4gZm9yIGEgaGFuZGxlciB0byBiZSBcImF2YWlsYWJsZVwiPyBXaGF0IGhhcHBlbnMgaWYgdGhlXG4vLyAgICBoYW5kbGVyIGlzIG5vdCBwcmVzZW50IGluaXRpYWxseSBidXQgaXMgc2V0IGF0IHNvbWUgcG9pbnQgZHVyaW5nIHRoZVxuLy8gICAgV29ya2Zsb3cgY29kZSB0aGF0IGlzIGV4ZWN1dGVkIGluIHRoYXQgV0ZUPyBXaGF0IGhhcHBlbnMgaWYgdGhlIGhhbmRsZXIgaXNcbi8vICAgIHNldCBhbmQgdGhlbiBkZWxldGVkLCBvciByZXBsYWNlZCB3aXRoIGEgZGlmZmVyZW50IGhhbmRsZXI/XG4vL1xuLy8gMi4gV2hlbiBpcyB0aGUgaGFuZGxlciBleGVjdXRlZD8gKFdoZW4gaXQgZmlyc3QgYmVjb21lcyBhdmFpbGFibGU/IEF0IHRoZSBlbmRcbi8vICAgIG9mIHRoZSBhY3RpdmF0aW9uPykgV2hhdCBhcmUgdGhlIGV4ZWN1dGlvbiBzZW1hbnRpY3Mgb2YgV29ya2Zsb3cgYW5kXG4vLyAgICBTaWduYWwvVXBkYXRlIGhhbmRsZXIgY29kZSBnaXZlbiB0aGF0IHRoZXkgYXJlIGNvbmN1cnJlbnQ/IENhbiB0aGUgdXNlclxuLy8gICAgcmVseSBvbiBTaWduYWwvVXBkYXRlIHNpZGUgZWZmZWN0cyBiZWluZyByZWZsZWN0ZWQgaW4gdGhlIFdvcmtmbG93IHJldHVyblxuLy8gICAgdmFsdWUsIG9yIGluIHRoZSB2YWx1ZSBwYXNzZWQgdG8gQ29udGludWUtQXMtTmV3PyBJZiB0aGUgaGFuZGxlciBpcyBhblxuLy8gICAgYXN5bmMgZnVuY3Rpb24gLyBjb3JvdXRpbmUsIGhvdyBtdWNoIG9mIGl0IGlzIGV4ZWN1dGVkIGFuZCB3aGVuIGlzIHRoZVxuLy8gICAgcmVzdCBleGVjdXRlZD9cbi8vXG4vLyAzLiBXaGF0IGhhcHBlbnMgaWYgdGhlIGhhbmRsZXIgaXMgbm90IGV4ZWN1dGVkPyAoaS5lLiBiZWNhdXNlIGl0IHdhc24ndFxuLy8gICAgYXZhaWxhYmxlIGluIHRoZSBzZW5zZSBkZWZpbmVkIGJ5ICgxKSlcbi8vXG4vLyA0LiBJbiB0aGUgY2FzZSBvZiBVcGRhdGUsIHdoZW4gaXMgdGhlIHZhbGlkYXRpb24gZnVuY3Rpb24gZXhlY3V0ZWQ/XG4vL1xuLy8gVGhlIGltcGxlbWVudGF0aW9uIGZvciBUeXBlc2NyaXB0IGlzIGFzIGZvbGxvd3M6XG4vL1xuLy8gMS4gc2RrLWNvcmUgc29ydHMgU2lnbmFsIGFuZCBVcGRhdGUgam9icyAoYW5kIFBhdGNoZXMpIGFoZWFkIG9mIGFsbCBvdGhlclxuLy8gICAgam9icy4gVGh1cyBpZiB0aGUgaGFuZGxlciBpcyBhdmFpbGFibGUgYXQgdGhlIHN0YXJ0IG9mIHRoZSBBY3RpdmF0aW9uIHRoZW5cbi8vICAgIHRoZSBTaWduYWwvVXBkYXRlIHdpbGwgYmUgZXhlY3V0ZWQgYmVmb3JlIFdvcmtmbG93IGNvZGUgaXMgZXhlY3V0ZWQuIElmIGl0XG4vLyAgICBpcyBub3QsIHRoZW4gdGhlIFNpZ25hbC9VcGRhdGUgY2FsbHMgYXJlIHB1c2hlZCB0byBhIGJ1ZmZlci5cbi8vXG4vLyAyLiBPbiBlYWNoIGNhbGwgdG8gc2V0SGFuZGxlciBmb3IgYSBnaXZlbiBTaWduYWwvVXBkYXRlLCB3ZSBtYWtlIGEgcGFzc1xuLy8gICAgdGhyb3VnaCB0aGUgYnVmZmVyIGxpc3QuIElmIGEgYnVmZmVyZWQgam9iIGlzIGFzc29jaWF0ZWQgd2l0aCB0aGUganVzdC1zZXRcbi8vICAgIGhhbmRsZXIsIHRoZW4gdGhlIGpvYiBpcyByZW1vdmVkIGZyb20gdGhlIGJ1ZmZlciBhbmQgdGhlIGluaXRpYWxcbi8vICAgIHN5bmNocm9ub3VzIHBvcnRpb24gb2YgdGhlIGhhbmRsZXIgaXMgaW52b2tlZCBvbiB0aGF0IGlucHV0IChpLmUuXG4vLyAgICBwcmVlbXB0aW5nIHdvcmtmbG93IGNvZGUpLlxuLy9cbi8vIFRodXMgaW4gdGhlIGNhc2Ugb2YgVHlwZXNjcmlwdCB0aGUgcXVlc3Rpb25zIGFib3ZlIGFyZSBhbnN3ZXJlZCBhcyBmb2xsb3dzOlxuLy9cbi8vIDEuIEEgaGFuZGxlciBpcyBcImF2YWlsYWJsZVwiIGlmIGl0IGlzIHNldCBhdCB0aGUgc3RhcnQgb2YgdGhlIEFjdGl2YXRpb24gb3Jcbi8vICAgIGJlY29tZXMgc2V0IGF0IGFueSBwb2ludCBkdXJpbmcgdGhlIEFjdGl2YXRpb24uIElmIHRoZSBoYW5kbGVyIGlzIG5vdCBzZXRcbi8vICAgIGluaXRpYWxseSB0aGVuIGl0IGlzIGV4ZWN1dGVkIGFzIHNvb24gYXMgaXQgaXMgc2V0LiBTdWJzZXF1ZW50IGRlbGV0aW9uIG9yXG4vLyAgICByZXBsYWNlbWVudCBieSBhIGRpZmZlcmVudCBoYW5kbGVyIGhhcyBubyBpbXBhY3QgYmVjYXVzZSB0aGUgam9icyBpdCB3YXNcbi8vICAgIGhhbmRsaW5nIGhhdmUgYWxyZWFkeSBiZWVuIGhhbmRsZWQgYW5kIGFyZSBubyBsb25nZXIgaW4gdGhlIGJ1ZmZlci5cbi8vXG4vLyAyLiBUaGUgaGFuZGxlciBpcyBleGVjdXRlZCBhcyBzb29uIGFzIGl0IGJlY29tZXMgYXZhaWxhYmxlLiBJLmUuIGlmIHRoZVxuLy8gICAgaGFuZGxlciBpcyBzZXQgYXQgdGhlIHN0YXJ0IG9mIHRoZSBBY3RpdmF0aW9uIHRoZW4gaXQgaXMgZXhlY3V0ZWQgd2hlblxuLy8gICAgZmlyc3QgYXR0ZW1wdGluZyB0byBwcm9jZXNzIHRoZSBTaWduYWwvVXBkYXRlIGpvYjsgYWx0ZXJuYXRpdmVseSwgaWYgaXQgaXNcbi8vICAgIHNldCBieSBhIHNldEhhbmRsZXIgY2FsbCBtYWRlIGJ5IFdvcmtmbG93IGNvZGUsIHRoZW4gaXQgaXMgZXhlY3V0ZWQgYXNcbi8vICAgIHBhcnQgb2YgdGhhdCBjYWxsIChwcmVlbXB0aW5nIFdvcmtmbG93IGNvZGUpLiBUaGVyZWZvcmUsIGEgdXNlciBjYW4gcmVseVxuLy8gICAgb24gU2lnbmFsL1VwZGF0ZSBzaWRlIGVmZmVjdHMgYmVpbmcgcmVmbGVjdGVkIGluIGUuZy4gdGhlIFdvcmtmbG93IHJldHVyblxuLy8gICAgdmFsdWUsIGFuZCBpbiB0aGUgdmFsdWUgcGFzc2VkIHRvIENvbnRpbnVlLUFzLU5ldy4gQWN0aXZhdGlvbiBqb2JzIGFyZVxuLy8gICAgcHJvY2Vzc2VkIGluIHRoZSBvcmRlciBzdXBwbGllZCBieSBzZGstY29yZSwgaS5lLiBTaWduYWxzLCB0aGVuIFVwZGF0ZXMsXG4vLyAgICB0aGVuIG90aGVyIGpvYnMuIFdpdGhpbiBlYWNoIGdyb3VwLCB0aGUgb3JkZXIgc2VudCBieSB0aGUgc2VydmVyIGlzXG4vLyAgICBwcmVzZXJ2ZWQuIElmIHRoZSBoYW5kbGVyIGlzIGFzeW5jLCBpdCBpcyBleGVjdXRlZCB1cCB0byBpdHMgZmlyc3QgeWllbGRcbi8vICAgIHBvaW50LlxuLy9cbi8vIDMuIFNpZ25hbCBjYXNlOiBJZiBhIGhhbmRsZXIgZG9lcyBub3QgYmVjb21lIGF2YWlsYWJsZSBmb3IgYSBTaWduYWwgam9iIHRoZW5cbi8vICAgIHRoZSBqb2IgcmVtYWlucyBpbiB0aGUgYnVmZmVyLiBJZiBhIGhhbmRsZXIgZm9yIHRoZSBTaWduYWwgYmVjb21lc1xuLy8gICAgYXZhaWxhYmxlIGluIGEgc3Vic2VxdWVudCBBY3RpdmF0aW9uIChvZiB0aGUgc2FtZSBvciBhIHN1YnNlcXVlbnQgV0ZUKVxuLy8gICAgdGhlbiB0aGUgaGFuZGxlciB3aWxsIGJlIGV4ZWN1dGVkLiBJZiBub3QsIHRoZW4gdGhlIFNpZ25hbCB3aWxsIG5ldmVyIGJlXG4vLyAgICByZXNwb25kZWQgdG8gYW5kIHRoaXMgY2F1c2VzIG5vIGVycm9yLlxuLy9cbi8vICAgIFVwZGF0ZSBjYXNlOiBJZiBhIGhhbmRsZXIgZG9lcyBub3QgYmVjb21lIGF2YWlsYWJsZSBmb3IgYW4gVXBkYXRlIGpvYiB0aGVuXG4vLyAgICB0aGUgVXBkYXRlIGlzIHJlamVjdGVkIGF0IHRoZSBlbmQgb2YgdGhlIEFjdGl2YXRpb24uIFRodXMsIGlmIGEgdXNlciBkb2VzXG4vLyAgICBub3Qgd2FudCBhbiBVcGRhdGUgdG8gYmUgcmVqZWN0ZWQgZm9yIHRoaXMgcmVhc29uLCB0aGVuIGl0IGlzIHRoZWlyXG4vLyAgICByZXNwb25zaWJpbGl0eSB0byBlbnN1cmUgdGhhdCB0aGVpciBhcHBsaWNhdGlvbiBhbmQgd29ya2Zsb3cgY29kZSBpbnRlcmFjdFxuLy8gICAgc3VjaCB0aGF0IGEgaGFuZGxlciBpcyBhdmFpbGFibGUgZm9yIHRoZSBVcGRhdGUgZHVyaW5nIGFueSBBY3RpdmF0aW9uXG4vLyAgICB3aGljaCBtaWdodCBjb250YWluIHRoZWlyIFVwZGF0ZSBqb2IuIChOb3RlIHRoYXQgdGhlIHVzZXIgb2Z0ZW4gaGFzXG4vLyAgICB1bmNlcnRhaW50eSBhYm91dCB3aGljaCBXRlQgdGhlaXIgU2lnbmFsL1VwZGF0ZSB3aWxsIGFwcGVhciBpbi4gRm9yXG4vLyAgICBleGFtcGxlLCBpZiB0aGV5IGNhbGwgc3RhcnRXb3JrZmxvdygpIGZvbGxvd2VkIGJ5IHN0YXJ0VXBkYXRlKCksIHRoZW4gdGhleVxuLy8gICAgd2lsbCB0eXBpY2FsbHkgbm90IGtub3cgd2hldGhlciB0aGVzZSB3aWxsIGJlIGRlbGl2ZXJlZCBpbiBvbmUgb3IgdHdvXG4vLyAgICBXRlRzLiBPbiB0aGUgb3RoZXIgaGFuZCB0aGVyZSBhcmUgc2l0dWF0aW9ucyB3aGVyZSB0aGV5IHdvdWxkIGhhdmUgcmVhc29uXG4vLyAgICB0byBiZWxpZXZlIHRoZXkgYXJlIGluIHRoZSBzYW1lIFdGVCwgZm9yIGV4YW1wbGUgaWYgdGhleSBkbyBub3Qgc3RhcnRcbi8vICAgIFdvcmtlciBwb2xsaW5nIHVudGlsIGFmdGVyIHRoZXkgaGF2ZSB2ZXJpZmllZCB0aGF0IGJvdGggcmVxdWVzdHMgaGF2ZVxuLy8gICAgc3VjY2VlZGVkLilcbi8vXG4vLyA0LiBJZiBhbiBVcGRhdGUgaGFzIGEgdmFsaWRhdGlvbiBmdW5jdGlvbiB0aGVuIGl0IGlzIGV4ZWN1dGVkIGltbWVkaWF0ZWx5XG4vLyAgICBwcmlvciB0byB0aGUgaGFuZGxlci4gKE5vdGUgdGhhdCB0aGUgdmFsaWRhdGlvbiBmdW5jdGlvbiBpcyByZXF1aXJlZCB0byBiZVxuLy8gICAgc3luY2hyb25vdXMpLlxuZXhwb3J0IGZ1bmN0aW9uIHNldEhhbmRsZXI8XG4gIFJldCxcbiAgQXJncyBleHRlbmRzIGFueVtdLFxuICBUIGV4dGVuZHMgVXBkYXRlRGVmaW5pdGlvbjxSZXQsIEFyZ3M+IHwgU2lnbmFsRGVmaW5pdGlvbjxBcmdzPiB8IFF1ZXJ5RGVmaW5pdGlvbjxSZXQsIEFyZ3M+LFxuPihcbiAgZGVmOiBULFxuICBoYW5kbGVyOiBIYW5kbGVyPFJldCwgQXJncywgVD4gfCB1bmRlZmluZWQsXG4gIG9wdGlvbnM/OiBRdWVyeUhhbmRsZXJPcHRpb25zIHwgU2lnbmFsSGFuZGxlck9wdGlvbnMgfCBVcGRhdGVIYW5kbGVyT3B0aW9uczxBcmdzPlxuKTogdm9pZCB7XG4gIGNvbnN0IGFjdGl2YXRvciA9IGFzc2VydEluV29ya2Zsb3dDb250ZXh0KCdXb3JrZmxvdy5zZXRIYW5kbGVyKC4uLikgbWF5IG9ubHkgYmUgdXNlZCBmcm9tIGEgV29ya2Zsb3cgRXhlY3V0aW9uLicpO1xuICBjb25zdCBkZXNjcmlwdGlvbiA9IG9wdGlvbnM/LmRlc2NyaXB0aW9uO1xuICBpZiAoZGVmLnR5cGUgPT09ICd1cGRhdGUnKSB7XG4gICAgaWYgKHR5cGVvZiBoYW5kbGVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBjb25zdCB1cGRhdGVPcHRpb25zID0gb3B0aW9ucyBhcyBVcGRhdGVIYW5kbGVyT3B0aW9uczxBcmdzPiB8IHVuZGVmaW5lZDtcblxuICAgICAgY29uc3QgdmFsaWRhdG9yID0gdXBkYXRlT3B0aW9ucz8udmFsaWRhdG9yIGFzIFdvcmtmbG93VXBkYXRlVmFsaWRhdG9yVHlwZSB8IHVuZGVmaW5lZDtcbiAgICAgIGNvbnN0IHVuZmluaXNoZWRQb2xpY3kgPSB1cGRhdGVPcHRpb25zPy51bmZpbmlzaGVkUG9saWN5ID8/IEhhbmRsZXJVbmZpbmlzaGVkUG9saWN5LldBUk5fQU5EX0FCQU5ET047XG4gICAgICBhY3RpdmF0b3IudXBkYXRlSGFuZGxlcnMuc2V0KGRlZi5uYW1lLCB7IGhhbmRsZXIsIHZhbGlkYXRvciwgZGVzY3JpcHRpb24sIHVuZmluaXNoZWRQb2xpY3kgfSk7XG4gICAgICBhY3RpdmF0b3IuZGlzcGF0Y2hCdWZmZXJlZFVwZGF0ZXMoKTtcbiAgICB9IGVsc2UgaWYgKGhhbmRsZXIgPT0gbnVsbCkge1xuICAgICAgYWN0aXZhdG9yLnVwZGF0ZUhhbmRsZXJzLmRlbGV0ZShkZWYubmFtZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYEV4cGVjdGVkIGhhbmRsZXIgdG8gYmUgZWl0aGVyIGEgZnVuY3Rpb24gb3IgJ3VuZGVmaW5lZCcuIEdvdDogJyR7dHlwZW9mIGhhbmRsZXJ9J2ApO1xuICAgIH1cbiAgfSBlbHNlIGlmIChkZWYudHlwZSA9PT0gJ3NpZ25hbCcpIHtcbiAgICBpZiAodHlwZW9mIGhhbmRsZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGNvbnN0IHNpZ25hbE9wdGlvbnMgPSBvcHRpb25zIGFzIFNpZ25hbEhhbmRsZXJPcHRpb25zIHwgdW5kZWZpbmVkO1xuICAgICAgY29uc3QgdW5maW5pc2hlZFBvbGljeSA9IHNpZ25hbE9wdGlvbnM/LnVuZmluaXNoZWRQb2xpY3kgPz8gSGFuZGxlclVuZmluaXNoZWRQb2xpY3kuV0FSTl9BTkRfQUJBTkRPTjtcbiAgICAgIGFjdGl2YXRvci5zaWduYWxIYW5kbGVycy5zZXQoZGVmLm5hbWUsIHsgaGFuZGxlcjogaGFuZGxlciBhcyBhbnksIGRlc2NyaXB0aW9uLCB1bmZpbmlzaGVkUG9saWN5IH0pO1xuICAgICAgYWN0aXZhdG9yLmRpc3BhdGNoQnVmZmVyZWRTaWduYWxzKCk7XG4gICAgfSBlbHNlIGlmIChoYW5kbGVyID09IG51bGwpIHtcbiAgICAgIGFjdGl2YXRvci5zaWduYWxIYW5kbGVycy5kZWxldGUoZGVmLm5hbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBFeHBlY3RlZCBoYW5kbGVyIHRvIGJlIGVpdGhlciBhIGZ1bmN0aW9uIG9yICd1bmRlZmluZWQnLiBHb3Q6ICcke3R5cGVvZiBoYW5kbGVyfSdgKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoZGVmLnR5cGUgPT09ICdxdWVyeScpIHtcbiAgICBpZiAodHlwZW9mIGhhbmRsZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGFjdGl2YXRvci5xdWVyeUhhbmRsZXJzLnNldChkZWYubmFtZSwgeyBoYW5kbGVyOiBoYW5kbGVyIGFzIGFueSwgZGVzY3JpcHRpb24gfSk7XG4gICAgfSBlbHNlIGlmIChoYW5kbGVyID09IG51bGwpIHtcbiAgICAgIGFjdGl2YXRvci5xdWVyeUhhbmRsZXJzLmRlbGV0ZShkZWYubmFtZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYEV4cGVjdGVkIGhhbmRsZXIgdG8gYmUgZWl0aGVyIGEgZnVuY3Rpb24gb3IgJ3VuZGVmaW5lZCcuIEdvdDogJyR7dHlwZW9mIGhhbmRsZXJ9J2ApO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBJbnZhbGlkIGRlZmluaXRpb24gdHlwZTogJHsoZGVmIGFzIGFueSkudHlwZX1gKTtcbiAgfVxufVxuXG4vKipcbiAqIFNldCBhIHNpZ25hbCBoYW5kbGVyIGZ1bmN0aW9uIHRoYXQgd2lsbCBoYW5kbGUgc2lnbmFscyBjYWxscyBmb3Igbm9uLXJlZ2lzdGVyZWQgc2lnbmFsIG5hbWVzLlxuICpcbiAqIFNpZ25hbHMgYXJlIGRpc3BhdGNoZWQgdG8gdGhlIGRlZmF1bHQgc2lnbmFsIGhhbmRsZXIgaW4gdGhlIG9yZGVyIHRoYXQgdGhleSB3ZXJlIGFjY2VwdGVkIGJ5IHRoZSBzZXJ2ZXIuXG4gKlxuICogSWYgdGhpcyBmdW5jdGlvbiBpcyBjYWxsZWQgbXVsdGlwbGUgdGltZXMgZm9yIGEgZ2l2ZW4gc2lnbmFsIG9yIHF1ZXJ5IG5hbWUgdGhlIGxhc3QgaGFuZGxlciB3aWxsIG92ZXJ3cml0ZSBhbnkgcHJldmlvdXMgY2FsbHMuXG4gKlxuICogQHBhcmFtIGhhbmRsZXIgYSBmdW5jdGlvbiB0aGF0IHdpbGwgaGFuZGxlIHNpZ25hbHMgZm9yIG5vbi1yZWdpc3RlcmVkIHNpZ25hbCBuYW1lcywgb3IgYHVuZGVmaW5lZGAgdG8gdW5zZXQgdGhlIGhhbmRsZXIuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXREZWZhdWx0U2lnbmFsSGFuZGxlcihoYW5kbGVyOiBEZWZhdWx0U2lnbmFsSGFuZGxlciB8IHVuZGVmaW5lZCk6IHZvaWQge1xuICBjb25zdCBhY3RpdmF0b3IgPSBhc3NlcnRJbldvcmtmbG93Q29udGV4dChcbiAgICAnV29ya2Zsb3cuc2V0RGVmYXVsdFNpZ25hbEhhbmRsZXIoLi4uKSBtYXkgb25seSBiZSB1c2VkIGZyb20gYSBXb3JrZmxvdyBFeGVjdXRpb24uJ1xuICApO1xuICBpZiAodHlwZW9mIGhhbmRsZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICBhY3RpdmF0b3IuZGVmYXVsdFNpZ25hbEhhbmRsZXIgPSBoYW5kbGVyO1xuICAgIGFjdGl2YXRvci5kaXNwYXRjaEJ1ZmZlcmVkU2lnbmFscygpO1xuICB9IGVsc2UgaWYgKGhhbmRsZXIgPT0gbnVsbCkge1xuICAgIGFjdGl2YXRvci5kZWZhdWx0U2lnbmFsSGFuZGxlciA9IHVuZGVmaW5lZDtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBFeHBlY3RlZCBoYW5kbGVyIHRvIGJlIGVpdGhlciBhIGZ1bmN0aW9uIG9yICd1bmRlZmluZWQnLiBHb3Q6ICcke3R5cGVvZiBoYW5kbGVyfSdgKTtcbiAgfVxufVxuXG4vKipcbiAqIFVwZGF0ZXMgdGhpcyBXb3JrZmxvdydzIFNlYXJjaCBBdHRyaWJ1dGVzIGJ5IG1lcmdpbmcgdGhlIHByb3ZpZGVkIGBzZWFyY2hBdHRyaWJ1dGVzYCB3aXRoIHRoZSBleGlzdGluZyBTZWFyY2hcbiAqIEF0dHJpYnV0ZXMsIGB3b3JrZmxvd0luZm8oKS5zZWFyY2hBdHRyaWJ1dGVzYC5cbiAqXG4gKiBGb3IgZXhhbXBsZSwgdGhpcyBXb3JrZmxvdyBjb2RlOlxuICpcbiAqIGBgYHRzXG4gKiB1cHNlcnRTZWFyY2hBdHRyaWJ1dGVzKHtcbiAqICAgQ3VzdG9tSW50RmllbGQ6IFsxXSxcbiAqICAgQ3VzdG9tQm9vbEZpZWxkOiBbdHJ1ZV1cbiAqIH0pO1xuICogdXBzZXJ0U2VhcmNoQXR0cmlidXRlcyh7XG4gKiAgIEN1c3RvbUludEZpZWxkOiBbNDJdLFxuICogICBDdXN0b21LZXl3b3JkRmllbGQ6IFsnZHVyYWJsZSBjb2RlJywgJ2lzIGdyZWF0J11cbiAqIH0pO1xuICogYGBgXG4gKlxuICogd291bGQgcmVzdWx0IGluIHRoZSBXb3JrZmxvdyBoYXZpbmcgdGhlc2UgU2VhcmNoIEF0dHJpYnV0ZXM6XG4gKlxuICogYGBgdHNcbiAqIHtcbiAqICAgQ3VzdG9tSW50RmllbGQ6IFs0Ml0sXG4gKiAgIEN1c3RvbUJvb2xGaWVsZDogW3RydWVdLFxuICogICBDdXN0b21LZXl3b3JkRmllbGQ6IFsnZHVyYWJsZSBjb2RlJywgJ2lzIGdyZWF0J11cbiAqIH1cbiAqIGBgYFxuICpcbiAqIEBwYXJhbSBzZWFyY2hBdHRyaWJ1dGVzIFRoZSBSZWNvcmQgdG8gbWVyZ2UuIFVzZSBhIHZhbHVlIG9mIGBbXWAgdG8gY2xlYXIgYSBTZWFyY2ggQXR0cmlidXRlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdXBzZXJ0U2VhcmNoQXR0cmlidXRlcyhzZWFyY2hBdHRyaWJ1dGVzOiBTZWFyY2hBdHRyaWJ1dGVzKTogdm9pZCB7XG4gIGNvbnN0IGFjdGl2YXRvciA9IGFzc2VydEluV29ya2Zsb3dDb250ZXh0KFxuICAgICdXb3JrZmxvdy51cHNlcnRTZWFyY2hBdHRyaWJ1dGVzKC4uLikgbWF5IG9ubHkgYmUgdXNlZCBmcm9tIGEgV29ya2Zsb3cgRXhlY3V0aW9uLidcbiAgKTtcblxuICBpZiAoc2VhcmNoQXR0cmlidXRlcyA9PSBudWxsKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZWFyY2hBdHRyaWJ1dGVzIG11c3QgYmUgYSBub24tbnVsbCBTZWFyY2hBdHRyaWJ1dGVzJyk7XG4gIH1cblxuICBhY3RpdmF0b3IucHVzaENvbW1hbmQoe1xuICAgIHVwc2VydFdvcmtmbG93U2VhcmNoQXR0cmlidXRlczoge1xuICAgICAgc2VhcmNoQXR0cmlidXRlczogbWFwVG9QYXlsb2FkcyhzZWFyY2hBdHRyaWJ1dGVQYXlsb2FkQ29udmVydGVyLCBzZWFyY2hBdHRyaWJ1dGVzKSxcbiAgICB9LFxuICB9KTtcblxuICBhY3RpdmF0b3IubXV0YXRlV29ya2Zsb3dJbmZvKChpbmZvOiBXb3JrZmxvd0luZm8pOiBXb3JrZmxvd0luZm8gPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAuLi5pbmZvLFxuICAgICAgc2VhcmNoQXR0cmlidXRlczoge1xuICAgICAgICAuLi5pbmZvLnNlYXJjaEF0dHJpYnV0ZXMsXG4gICAgICAgIC4uLnNlYXJjaEF0dHJpYnV0ZXMsXG4gICAgICB9LFxuICAgIH07XG4gIH0pO1xufVxuXG4vKipcbiAqIFVwZGF0ZXMgdGhpcyBXb3JrZmxvdydzIE1lbW9zIGJ5IG1lcmdpbmcgdGhlIHByb3ZpZGVkIGBtZW1vYCB3aXRoIGV4aXN0aW5nXG4gKiBNZW1vcyAoYXMgcmV0dXJuZWQgYnkgYHdvcmtmbG93SW5mbygpLm1lbW9gKS5cbiAqXG4gKiBOZXcgbWVtbyBpcyBtZXJnZWQgYnkgcmVwbGFjaW5nIHByb3BlcnRpZXMgb2YgdGhlIHNhbWUgbmFtZSBfYXQgdGhlIGZpcnN0XG4gKiBsZXZlbCBvbmx5Xy4gU2V0dGluZyBhIHByb3BlcnR5IHRvIHZhbHVlIGB1bmRlZmluZWRgIG9yIGBudWxsYCBjbGVhcnMgdGhhdFxuICoga2V5IGZyb20gdGhlIE1lbW8uXG4gKlxuICogRm9yIGV4YW1wbGU6XG4gKlxuICogYGBgdHNcbiAqIHVwc2VydE1lbW8oe1xuICogICBrZXkxOiB2YWx1ZSxcbiAqICAga2V5MzogeyBzdWJrZXkxOiB2YWx1ZSB9XG4gKiAgIGtleTQ6IHZhbHVlLFxuICogfSk7XG4gKiB1cHNlcnRNZW1vKHtcbiAqICAga2V5MjogdmFsdWVcbiAqICAga2V5MzogeyBzdWJrZXkyOiB2YWx1ZSB9XG4gKiAgIGtleTQ6IHVuZGVmaW5lZCxcbiAqIH0pO1xuICogYGBgXG4gKlxuICogd291bGQgcmVzdWx0IGluIHRoZSBXb3JrZmxvdyBoYXZpbmcgdGhlc2UgTWVtbzpcbiAqXG4gKiBgYGB0c1xuICoge1xuICogICBrZXkxOiB2YWx1ZSxcbiAqICAga2V5MjogdmFsdWUsXG4gKiAgIGtleTM6IHsgc3Via2V5MjogdmFsdWUgfSAgLy8gTm90ZSB0aGlzIG9iamVjdCB3YXMgY29tcGxldGVseSByZXBsYWNlZFxuICogICAvLyBOb3RlIHRoYXQga2V5NCB3YXMgY29tcGxldGVseSByZW1vdmVkXG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gbWVtbyBUaGUgUmVjb3JkIHRvIG1lcmdlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdXBzZXJ0TWVtbyhtZW1vOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPik6IHZvaWQge1xuICBjb25zdCBhY3RpdmF0b3IgPSBhc3NlcnRJbldvcmtmbG93Q29udGV4dCgnV29ya2Zsb3cudXBzZXJ0TWVtbyguLi4pIG1heSBvbmx5IGJlIHVzZWQgZnJvbSBhIFdvcmtmbG93IEV4ZWN1dGlvbi4nKTtcblxuICBpZiAobWVtbyA9PSBudWxsKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdtZW1vIG11c3QgYmUgYSBub24tbnVsbCBSZWNvcmQnKTtcbiAgfVxuXG4gIGFjdGl2YXRvci5wdXNoQ29tbWFuZCh7XG4gICAgbW9kaWZ5V29ya2Zsb3dQcm9wZXJ0aWVzOiB7XG4gICAgICB1cHNlcnRlZE1lbW86IHtcbiAgICAgICAgZmllbGRzOiBtYXBUb1BheWxvYWRzKFxuICAgICAgICAgIGFjdGl2YXRvci5wYXlsb2FkQ29udmVydGVyLFxuICAgICAgICAgIC8vIENvbnZlcnQgbnVsbCB0byB1bmRlZmluZWRcbiAgICAgICAgICBPYmplY3QuZnJvbUVudHJpZXMoT2JqZWN0LmVudHJpZXMobWVtbykubWFwKChbaywgdl0pID0+IFtrLCB2ID8/IHVuZGVmaW5lZF0pKVxuICAgICAgICApLFxuICAgICAgfSxcbiAgICB9LFxuICB9KTtcblxuICBhY3RpdmF0b3IubXV0YXRlV29ya2Zsb3dJbmZvKChpbmZvOiBXb3JrZmxvd0luZm8pOiBXb3JrZmxvd0luZm8gPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAuLi5pbmZvLFxuICAgICAgbWVtbzogT2JqZWN0LmZyb21FbnRyaWVzKFxuICAgICAgICBPYmplY3QuZW50cmllcyh7XG4gICAgICAgICAgLi4uaW5mby5tZW1vLFxuICAgICAgICAgIC4uLm1lbW8sXG4gICAgICAgIH0pLmZpbHRlcigoW18sIHZdKSA9PiB2ICE9IG51bGwpXG4gICAgICApLFxuICAgIH07XG4gIH0pO1xufVxuXG4vKipcbiAqIFdoZXRoZXIgdXBkYXRlIGFuZCBzaWduYWwgaGFuZGxlcnMgaGF2ZSBmaW5pc2hlZCBleGVjdXRpbmcuXG4gKlxuICogQ29uc2lkZXIgd2FpdGluZyBvbiB0aGlzIGNvbmRpdGlvbiBiZWZvcmUgd29ya2Zsb3cgcmV0dXJuIG9yIGNvbnRpbnVlLWFzLW5ldywgdG8gcHJldmVudFxuICogaW50ZXJydXB0aW9uIG9mIGluLXByb2dyZXNzIGhhbmRsZXJzIGJ5IHdvcmtmbG93IGV4aXQ6XG4gKlxuICogYGBgdHNcbiAqIGF3YWl0IHdvcmtmbG93LmNvbmRpdGlvbih3b3JrZmxvdy5hbGxIYW5kbGVyc0ZpbmlzaGVkKVxuICogYGBgXG4gKlxuICogQHJldHVybnMgdHJ1ZSBpZiB0aGVyZSBhcmUgbm8gaW4tcHJvZ3Jlc3MgdXBkYXRlIG9yIHNpZ25hbCBoYW5kbGVyIGV4ZWN1dGlvbnMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhbGxIYW5kbGVyc0ZpbmlzaGVkKCk6IGJvb2xlYW4ge1xuICBjb25zdCBhY3RpdmF0b3IgPSBhc3NlcnRJbldvcmtmbG93Q29udGV4dCgnYWxsSGFuZGxlcnNGaW5pc2hlZCgpIG1heSBvbmx5IGJlIHVzZWQgZnJvbSBhIFdvcmtmbG93IEV4ZWN1dGlvbi4nKTtcbiAgcmV0dXJuIGFjdGl2YXRvci5pblByb2dyZXNzU2lnbmFscy5zaXplID09PSAwICYmIGFjdGl2YXRvci5pblByb2dyZXNzVXBkYXRlcy5zaXplID09PSAwO1xufVxuXG5leHBvcnQgY29uc3Qgc3RhY2tUcmFjZVF1ZXJ5ID0gZGVmaW5lUXVlcnk8c3RyaW5nPignX19zdGFja190cmFjZScpO1xuZXhwb3J0IGNvbnN0IGVuaGFuY2VkU3RhY2tUcmFjZVF1ZXJ5ID0gZGVmaW5lUXVlcnk8RW5oYW5jZWRTdGFja1RyYWNlPignX19lbmhhbmNlZF9zdGFja190cmFjZScpO1xuZXhwb3J0IGNvbnN0IHdvcmtmbG93TWV0YWRhdGFRdWVyeSA9IGRlZmluZVF1ZXJ5PHRlbXBvcmFsLmFwaS5zZGsudjEuSVdvcmtmbG93TWV0YWRhdGE+KCdfX3RlbXBvcmFsX3dvcmtmbG93X21ldGFkYXRhJyk7XG4iLCJpbXBvcnQgKiBhcyBhY3Rpdml0aWVzIGZyb20gJy4vYWN0aXZpdGllcyc7XG5pbXBvcnQgeyBwcm94eUFjdGl2aXRpZXMgfSBmcm9tICdAdGVtcG9yYWxpby93b3JrZmxvdyc7XG5pbXBvcnQgdHlwZSB7IFRyYW5zYWN0aW9uSW5wdXQgfSBmcm9tICcuL2xpYi90eXBlcyc7XG5cbmNvbnN0IHsgY2hhcmdlQ2FyZCwgcmVzZXJ2ZVN0b2NrLCBzaGlwSXRlbSwgc2VuZFJlY2VpcHQsIHNlbmRDaGFyZ2VGYWlsdXJlRW1haWwgfSA9IHByb3h5QWN0aXZpdGllczx0eXBlb2YgYWN0aXZpdGllcz4oe1xuICBzdGFydFRvQ2xvc2VUaW1lb3V0OiAnNSBzZWNvbmRzJyxcbiAgcmV0cnk6IHtcbiAgICBpbml0aWFsSW50ZXJ2YWw6ICcxIHNlY29uZCcsXG4gICAgYmFja29mZkNvZWZmaWNpZW50OiAxLFxuICB9XG59KTtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIFB1cmNoYXNlV29ya2Zsb3coaW5wdXQ6IFRyYW5zYWN0aW9uSW5wdXQpIHtcbiAgY29uc3QgeyBjdXN0b21lckVtYWlsLCBwcm9kdWN0TmFtZSwgYW1vdW50LCBzaGlwcGluZ0FkZHJlc3MgfSA9IGlucHV0O1xuXG4gIC8vIENoYXJnZSB0aGUgY3VzdG9tZXIncyBjYXJkXG4gIHRyeSB7XG4gICAgYXdhaXQgY2hhcmdlQ2FyZChjdXN0b21lckVtYWlsLCBhbW91bnQpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGF3YWl0IHNlbmRDaGFyZ2VGYWlsdXJlRW1haWwoY3VzdG9tZXJFbWFpbCwgYW1vdW50KTtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBSZXNlcnZlIHRoZSBpdGVtIGluIGludmVudG9yeVxuICBhd2FpdCByZXNlcnZlU3RvY2socHJvZHVjdE5hbWUpO1xuXG4gIC8vIFNoaXAgdGhlIGl0ZW1cbiAgYXdhaXQgc2hpcEl0ZW0oY3VzdG9tZXJFbWFpbCwgcHJvZHVjdE5hbWUsIHNoaXBwaW5nQWRkcmVzcyk7XG5cbiAgLy8gU2VuZCByZWNlaXB0IGNvbmZpcm1hdGlvblxuICBhd2FpdCBzZW5kUmVjZWlwdChjdXN0b21lckVtYWlsLCBwcm9kdWN0TmFtZSwgYW1vdW50KTtcbn0gIiwiLyogKGlnbm9yZWQpICovIiwiLyogKGlnbm9yZWQpICovIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG4vLyBIZWxwZXJzLlxuY29uc3QgcyA9IDEwMDA7XG5jb25zdCBtID0gcyAqIDYwO1xuY29uc3QgaCA9IG0gKiA2MDtcbmNvbnN0IGQgPSBoICogMjQ7XG5jb25zdCB3ID0gZCAqIDc7XG5jb25zdCB5ID0gZCAqIDM2NS4yNTtcbmZ1bmN0aW9uIG1zKHZhbHVlLCBvcHRpb25zKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgdmFsdWUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgcmV0dXJuIHBhcnNlKHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInICYmIGlzRmluaXRlKHZhbHVlKSkge1xuICAgICAgICAgICAgcmV0dXJuIG9wdGlvbnM/LmxvbmcgPyBmbXRMb25nKHZhbHVlKSA6IGZtdFNob3J0KHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1ZhbHVlIGlzIG5vdCBhIHN0cmluZyBvciBudW1iZXIuJyk7XG4gICAgfVxuICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gaXNFcnJvcihlcnJvcilcbiAgICAgICAgICAgID8gYCR7ZXJyb3IubWVzc2FnZX0uIHZhbHVlPSR7SlNPTi5zdHJpbmdpZnkodmFsdWUpfWBcbiAgICAgICAgICAgIDogJ0FuIHVua25vd24gZXJyb3IgaGFzIG9jY3VyZWQuJztcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UpO1xuICAgIH1cbn1cbi8qKlxuICogUGFyc2UgdGhlIGdpdmVuIGBzdHJgIGFuZCByZXR1cm4gbWlsbGlzZWNvbmRzLlxuICovXG5mdW5jdGlvbiBwYXJzZShzdHIpIHtcbiAgICBzdHIgPSBTdHJpbmcoc3RyKTtcbiAgICBpZiAoc3RyLmxlbmd0aCA+IDEwMCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1ZhbHVlIGV4Y2VlZHMgdGhlIG1heGltdW0gbGVuZ3RoIG9mIDEwMCBjaGFyYWN0ZXJzLicpO1xuICAgIH1cbiAgICBjb25zdCBtYXRjaCA9IC9eKC0/KD86XFxkKyk/XFwuP1xcZCspICoobWlsbGlzZWNvbmRzP3xtc2Vjcz98bXN8c2Vjb25kcz98c2Vjcz98c3xtaW51dGVzP3xtaW5zP3xtfGhvdXJzP3xocnM/fGh8ZGF5cz98ZHx3ZWVrcz98d3x5ZWFycz98eXJzP3x5KT8kL2kuZXhlYyhzdHIpO1xuICAgIGlmICghbWF0Y2gpIHtcbiAgICAgICAgcmV0dXJuIE5hTjtcbiAgICB9XG4gICAgY29uc3QgbiA9IHBhcnNlRmxvYXQobWF0Y2hbMV0pO1xuICAgIGNvbnN0IHR5cGUgPSAobWF0Y2hbMl0gfHwgJ21zJykudG9Mb3dlckNhc2UoKTtcbiAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgY2FzZSAneWVhcnMnOlxuICAgICAgICBjYXNlICd5ZWFyJzpcbiAgICAgICAgY2FzZSAneXJzJzpcbiAgICAgICAgY2FzZSAneXInOlxuICAgICAgICBjYXNlICd5JzpcbiAgICAgICAgICAgIHJldHVybiBuICogeTtcbiAgICAgICAgY2FzZSAnd2Vla3MnOlxuICAgICAgICBjYXNlICd3ZWVrJzpcbiAgICAgICAgY2FzZSAndyc6XG4gICAgICAgICAgICByZXR1cm4gbiAqIHc7XG4gICAgICAgIGNhc2UgJ2RheXMnOlxuICAgICAgICBjYXNlICdkYXknOlxuICAgICAgICBjYXNlICdkJzpcbiAgICAgICAgICAgIHJldHVybiBuICogZDtcbiAgICAgICAgY2FzZSAnaG91cnMnOlxuICAgICAgICBjYXNlICdob3VyJzpcbiAgICAgICAgY2FzZSAnaHJzJzpcbiAgICAgICAgY2FzZSAnaHInOlxuICAgICAgICBjYXNlICdoJzpcbiAgICAgICAgICAgIHJldHVybiBuICogaDtcbiAgICAgICAgY2FzZSAnbWludXRlcyc6XG4gICAgICAgIGNhc2UgJ21pbnV0ZSc6XG4gICAgICAgIGNhc2UgJ21pbnMnOlxuICAgICAgICBjYXNlICdtaW4nOlxuICAgICAgICBjYXNlICdtJzpcbiAgICAgICAgICAgIHJldHVybiBuICogbTtcbiAgICAgICAgY2FzZSAnc2Vjb25kcyc6XG4gICAgICAgIGNhc2UgJ3NlY29uZCc6XG4gICAgICAgIGNhc2UgJ3NlY3MnOlxuICAgICAgICBjYXNlICdzZWMnOlxuICAgICAgICBjYXNlICdzJzpcbiAgICAgICAgICAgIHJldHVybiBuICogcztcbiAgICAgICAgY2FzZSAnbWlsbGlzZWNvbmRzJzpcbiAgICAgICAgY2FzZSAnbWlsbGlzZWNvbmQnOlxuICAgICAgICBjYXNlICdtc2Vjcyc6XG4gICAgICAgIGNhc2UgJ21zZWMnOlxuICAgICAgICBjYXNlICdtcyc6XG4gICAgICAgICAgICByZXR1cm4gbjtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIC8vIFRoaXMgc2hvdWxkIG5ldmVyIG9jY3VyLlxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBUaGUgdW5pdCAke3R5cGV9IHdhcyBtYXRjaGVkLCBidXQgbm8gbWF0Y2hpbmcgY2FzZSBleGlzdHMuYCk7XG4gICAgfVxufVxuZXhwb3J0cy5kZWZhdWx0ID0gbXM7XG4vKipcbiAqIFNob3J0IGZvcm1hdCBmb3IgYG1zYC5cbiAqL1xuZnVuY3Rpb24gZm10U2hvcnQobXMpIHtcbiAgICBjb25zdCBtc0FicyA9IE1hdGguYWJzKG1zKTtcbiAgICBpZiAobXNBYnMgPj0gZCkge1xuICAgICAgICByZXR1cm4gYCR7TWF0aC5yb3VuZChtcyAvIGQpfWRgO1xuICAgIH1cbiAgICBpZiAobXNBYnMgPj0gaCkge1xuICAgICAgICByZXR1cm4gYCR7TWF0aC5yb3VuZChtcyAvIGgpfWhgO1xuICAgIH1cbiAgICBpZiAobXNBYnMgPj0gbSkge1xuICAgICAgICByZXR1cm4gYCR7TWF0aC5yb3VuZChtcyAvIG0pfW1gO1xuICAgIH1cbiAgICBpZiAobXNBYnMgPj0gcykge1xuICAgICAgICByZXR1cm4gYCR7TWF0aC5yb3VuZChtcyAvIHMpfXNgO1xuICAgIH1cbiAgICByZXR1cm4gYCR7bXN9bXNgO1xufVxuLyoqXG4gKiBMb25nIGZvcm1hdCBmb3IgYG1zYC5cbiAqL1xuZnVuY3Rpb24gZm10TG9uZyhtcykge1xuICAgIGNvbnN0IG1zQWJzID0gTWF0aC5hYnMobXMpO1xuICAgIGlmIChtc0FicyA+PSBkKSB7XG4gICAgICAgIHJldHVybiBwbHVyYWwobXMsIG1zQWJzLCBkLCAnZGF5Jyk7XG4gICAgfVxuICAgIGlmIChtc0FicyA+PSBoKSB7XG4gICAgICAgIHJldHVybiBwbHVyYWwobXMsIG1zQWJzLCBoLCAnaG91cicpO1xuICAgIH1cbiAgICBpZiAobXNBYnMgPj0gbSkge1xuICAgICAgICByZXR1cm4gcGx1cmFsKG1zLCBtc0FicywgbSwgJ21pbnV0ZScpO1xuICAgIH1cbiAgICBpZiAobXNBYnMgPj0gcykge1xuICAgICAgICByZXR1cm4gcGx1cmFsKG1zLCBtc0FicywgcywgJ3NlY29uZCcpO1xuICAgIH1cbiAgICByZXR1cm4gYCR7bXN9IG1zYDtcbn1cbi8qKlxuICogUGx1cmFsaXphdGlvbiBoZWxwZXIuXG4gKi9cbmZ1bmN0aW9uIHBsdXJhbChtcywgbXNBYnMsIG4sIG5hbWUpIHtcbiAgICBjb25zdCBpc1BsdXJhbCA9IG1zQWJzID49IG4gKiAxLjU7XG4gICAgcmV0dXJuIGAke01hdGgucm91bmQobXMgLyBuKX0gJHtuYW1lfSR7aXNQbHVyYWwgPyAncycgOiAnJ31gO1xufVxuLyoqXG4gKiBBIHR5cGUgZ3VhcmQgZm9yIGVycm9ycy5cbiAqL1xuZnVuY3Rpb24gaXNFcnJvcihlcnJvcikge1xuICAgIHJldHVybiB0eXBlb2YgZXJyb3IgPT09ICdvYmplY3QnICYmIGVycm9yICE9PSBudWxsICYmICdtZXNzYWdlJyBpbiBlcnJvcjtcbn1cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cy5kZWZhdWx0O1xubW9kdWxlLmV4cG9ydHMuZGVmYXVsdCA9IGV4cG9ydHMuZGVmYXVsdDtcbiIsIi8vIEdFTkVSQVRFRCBGSUxFLiBETyBOT1QgRURJVC5cbnZhciBMb25nID0gKGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG4gIFxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgICB2YWx1ZTogdHJ1ZVxuICB9KTtcbiAgZXhwb3J0cy5kZWZhdWx0ID0gdm9pZCAwO1xuICBcbiAgLyoqXG4gICAqIEBsaWNlbnNlXG4gICAqIENvcHlyaWdodCAyMDA5IFRoZSBDbG9zdXJlIExpYnJhcnkgQXV0aG9yc1xuICAgKiBDb3B5cmlnaHQgMjAyMCBEYW5pZWwgV2lydHogLyBUaGUgbG9uZy5qcyBBdXRob3JzLlxuICAgKlxuICAgKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICAgKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gICAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICAgKlxuICAgKiAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gICAqXG4gICAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAgICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICAgKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAgICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICAgKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAgICpcbiAgICogU1BEWC1MaWNlbnNlLUlkZW50aWZpZXI6IEFwYWNoZS0yLjBcbiAgICovXG4gIC8vIFdlYkFzc2VtYmx5IG9wdGltaXphdGlvbnMgdG8gZG8gbmF0aXZlIGk2NCBtdWx0aXBsaWNhdGlvbiBhbmQgZGl2aWRlXG4gIHZhciB3YXNtID0gbnVsbDtcbiAgXG4gIHRyeSB7XG4gICAgd2FzbSA9IG5ldyBXZWJBc3NlbWJseS5JbnN0YW5jZShuZXcgV2ViQXNzZW1ibHkuTW9kdWxlKG5ldyBVaW50OEFycmF5KFswLCA5NywgMTE1LCAxMDksIDEsIDAsIDAsIDAsIDEsIDEzLCAyLCA5NiwgMCwgMSwgMTI3LCA5NiwgNCwgMTI3LCAxMjcsIDEyNywgMTI3LCAxLCAxMjcsIDMsIDcsIDYsIDAsIDEsIDEsIDEsIDEsIDEsIDYsIDYsIDEsIDEyNywgMSwgNjUsIDAsIDExLCA3LCA1MCwgNiwgMywgMTA5LCAxMTcsIDEwOCwgMCwgMSwgNSwgMTAwLCAxMDUsIDExOCwgOTUsIDExNSwgMCwgMiwgNSwgMTAwLCAxMDUsIDExOCwgOTUsIDExNywgMCwgMywgNSwgMTE0LCAxMDEsIDEwOSwgOTUsIDExNSwgMCwgNCwgNSwgMTE0LCAxMDEsIDEwOSwgOTUsIDExNywgMCwgNSwgOCwgMTAzLCAxMDEsIDExNiwgOTUsIDEwNCwgMTA1LCAxMDMsIDEwNCwgMCwgMCwgMTAsIDE5MSwgMSwgNiwgNCwgMCwgMzUsIDAsIDExLCAzNiwgMSwgMSwgMTI2LCAzMiwgMCwgMTczLCAzMiwgMSwgMTczLCA2NiwgMzIsIDEzNCwgMTMyLCAzMiwgMiwgMTczLCAzMiwgMywgMTczLCA2NiwgMzIsIDEzNCwgMTMyLCAxMjYsIDM0LCA0LCA2NiwgMzIsIDEzNSwgMTY3LCAzNiwgMCwgMzIsIDQsIDE2NywgMTEsIDM2LCAxLCAxLCAxMjYsIDMyLCAwLCAxNzMsIDMyLCAxLCAxNzMsIDY2LCAzMiwgMTM0LCAxMzIsIDMyLCAyLCAxNzMsIDMyLCAzLCAxNzMsIDY2LCAzMiwgMTM0LCAxMzIsIDEyNywgMzQsIDQsIDY2LCAzMiwgMTM1LCAxNjcsIDM2LCAwLCAzMiwgNCwgMTY3LCAxMSwgMzYsIDEsIDEsIDEyNiwgMzIsIDAsIDE3MywgMzIsIDEsIDE3MywgNjYsIDMyLCAxMzQsIDEzMiwgMzIsIDIsIDE3MywgMzIsIDMsIDE3MywgNjYsIDMyLCAxMzQsIDEzMiwgMTI4LCAzNCwgNCwgNjYsIDMyLCAxMzUsIDE2NywgMzYsIDAsIDMyLCA0LCAxNjcsIDExLCAzNiwgMSwgMSwgMTI2LCAzMiwgMCwgMTczLCAzMiwgMSwgMTczLCA2NiwgMzIsIDEzNCwgMTMyLCAzMiwgMiwgMTczLCAzMiwgMywgMTczLCA2NiwgMzIsIDEzNCwgMTMyLCAxMjksIDM0LCA0LCA2NiwgMzIsIDEzNSwgMTY3LCAzNiwgMCwgMzIsIDQsIDE2NywgMTEsIDM2LCAxLCAxLCAxMjYsIDMyLCAwLCAxNzMsIDMyLCAxLCAxNzMsIDY2LCAzMiwgMTM0LCAxMzIsIDMyLCAyLCAxNzMsIDMyLCAzLCAxNzMsIDY2LCAzMiwgMTM0LCAxMzIsIDEzMCwgMzQsIDQsIDY2LCAzMiwgMTM1LCAxNjcsIDM2LCAwLCAzMiwgNCwgMTY3LCAxMV0pKSwge30pLmV4cG9ydHM7XG4gIH0gY2F0Y2ggKGUpIHsvLyBubyB3YXNtIHN1cHBvcnQgOihcbiAgfVxuICAvKipcbiAgICogQ29uc3RydWN0cyBhIDY0IGJpdCB0d28ncy1jb21wbGVtZW50IGludGVnZXIsIGdpdmVuIGl0cyBsb3cgYW5kIGhpZ2ggMzIgYml0IHZhbHVlcyBhcyAqc2lnbmVkKiBpbnRlZ2Vycy5cbiAgICogIFNlZSB0aGUgZnJvbSogZnVuY3Rpb25zIGJlbG93IGZvciBtb3JlIGNvbnZlbmllbnQgd2F5cyBvZiBjb25zdHJ1Y3RpbmcgTG9uZ3MuXG4gICAqIEBleHBvcnRzIExvbmdcbiAgICogQGNsYXNzIEEgTG9uZyBjbGFzcyBmb3IgcmVwcmVzZW50aW5nIGEgNjQgYml0IHR3bydzLWNvbXBsZW1lbnQgaW50ZWdlciB2YWx1ZS5cbiAgICogQHBhcmFtIHtudW1iZXJ9IGxvdyBUaGUgbG93IChzaWduZWQpIDMyIGJpdHMgb2YgdGhlIGxvbmdcbiAgICogQHBhcmFtIHtudW1iZXJ9IGhpZ2ggVGhlIGhpZ2ggKHNpZ25lZCkgMzIgYml0cyBvZiB0aGUgbG9uZ1xuICAgKiBAcGFyYW0ge2Jvb2xlYW49fSB1bnNpZ25lZCBXaGV0aGVyIHVuc2lnbmVkIG9yIG5vdCwgZGVmYXVsdHMgdG8gc2lnbmVkXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKi9cbiAgXG4gIFxuICBmdW5jdGlvbiBMb25nKGxvdywgaGlnaCwgdW5zaWduZWQpIHtcbiAgICAvKipcbiAgICAgKiBUaGUgbG93IDMyIGJpdHMgYXMgYSBzaWduZWQgdmFsdWUuXG4gICAgICogQHR5cGUge251bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLmxvdyA9IGxvdyB8IDA7XG4gICAgLyoqXG4gICAgICogVGhlIGhpZ2ggMzIgYml0cyBhcyBhIHNpZ25lZCB2YWx1ZS5cbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAqL1xuICBcbiAgICB0aGlzLmhpZ2ggPSBoaWdoIHwgMDtcbiAgICAvKipcbiAgICAgKiBXaGV0aGVyIHVuc2lnbmVkIG9yIG5vdC5cbiAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgXG4gICAgdGhpcy51bnNpZ25lZCA9ICEhdW5zaWduZWQ7XG4gIH0gLy8gVGhlIGludGVybmFsIHJlcHJlc2VudGF0aW9uIG9mIGEgbG9uZyBpcyB0aGUgdHdvIGdpdmVuIHNpZ25lZCwgMzItYml0IHZhbHVlcy5cbiAgLy8gV2UgdXNlIDMyLWJpdCBwaWVjZXMgYmVjYXVzZSB0aGVzZSBhcmUgdGhlIHNpemUgb2YgaW50ZWdlcnMgb24gd2hpY2hcbiAgLy8gSmF2YXNjcmlwdCBwZXJmb3JtcyBiaXQtb3BlcmF0aW9ucy4gIEZvciBvcGVyYXRpb25zIGxpa2UgYWRkaXRpb24gYW5kXG4gIC8vIG11bHRpcGxpY2F0aW9uLCB3ZSBzcGxpdCBlYWNoIG51bWJlciBpbnRvIDE2IGJpdCBwaWVjZXMsIHdoaWNoIGNhbiBlYXNpbHkgYmVcbiAgLy8gbXVsdGlwbGllZCB3aXRoaW4gSmF2YXNjcmlwdCdzIGZsb2F0aW5nLXBvaW50IHJlcHJlc2VudGF0aW9uIHdpdGhvdXQgb3ZlcmZsb3dcbiAgLy8gb3IgY2hhbmdlIGluIHNpZ24uXG4gIC8vXG4gIC8vIEluIHRoZSBhbGdvcml0aG1zIGJlbG93LCB3ZSBmcmVxdWVudGx5IHJlZHVjZSB0aGUgbmVnYXRpdmUgY2FzZSB0byB0aGVcbiAgLy8gcG9zaXRpdmUgY2FzZSBieSBuZWdhdGluZyB0aGUgaW5wdXQocykgYW5kIHRoZW4gcG9zdC1wcm9jZXNzaW5nIHRoZSByZXN1bHQuXG4gIC8vIE5vdGUgdGhhdCB3ZSBtdXN0IEFMV0FZUyBjaGVjayBzcGVjaWFsbHkgd2hldGhlciB0aG9zZSB2YWx1ZXMgYXJlIE1JTl9WQUxVRVxuICAvLyAoLTJeNjMpIGJlY2F1c2UgLU1JTl9WQUxVRSA9PSBNSU5fVkFMVUUgKHNpbmNlIDJeNjMgY2Fubm90IGJlIHJlcHJlc2VudGVkIGFzXG4gIC8vIGEgcG9zaXRpdmUgbnVtYmVyLCBpdCBvdmVyZmxvd3MgYmFjayBpbnRvIGEgbmVnYXRpdmUpLiAgTm90IGhhbmRsaW5nIHRoaXNcbiAgLy8gY2FzZSB3b3VsZCBvZnRlbiByZXN1bHQgaW4gaW5maW5pdGUgcmVjdXJzaW9uLlxuICAvL1xuICAvLyBDb21tb24gY29uc3RhbnQgdmFsdWVzIFpFUk8sIE9ORSwgTkVHX09ORSwgZXRjLiBhcmUgZGVmaW5lZCBiZWxvdyB0aGUgZnJvbSpcbiAgLy8gbWV0aG9kcyBvbiB3aGljaCB0aGV5IGRlcGVuZC5cbiAgXG4gIC8qKlxuICAgKiBBbiBpbmRpY2F0b3IgdXNlZCB0byByZWxpYWJseSBkZXRlcm1pbmUgaWYgYW4gb2JqZWN0IGlzIGEgTG9uZyBvciBub3QuXG4gICAqIEB0eXBlIHtib29sZWFufVxuICAgKiBAY29uc3RcbiAgICogQHByaXZhdGVcbiAgICovXG4gIFxuICBcbiAgTG9uZy5wcm90b3R5cGUuX19pc0xvbmdfXztcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KExvbmcucHJvdG90eXBlLCBcIl9faXNMb25nX19cIiwge1xuICAgIHZhbHVlOiB0cnVlXG4gIH0pO1xuICAvKipcbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7Kn0gb2JqIE9iamVjdFxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICogQGlubmVyXG4gICAqL1xuICBcbiAgZnVuY3Rpb24gaXNMb25nKG9iaikge1xuICAgIHJldHVybiAob2JqICYmIG9ialtcIl9faXNMb25nX19cIl0pID09PSB0cnVlO1xuICB9XG4gIC8qKlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHsqfSB2YWx1ZSBudW1iZXJcbiAgICogQHJldHVybnMge251bWJlcn1cbiAgICogQGlubmVyXG4gICAqL1xuICBcbiAgXG4gIGZ1bmN0aW9uIGN0ejMyKHZhbHVlKSB7XG4gICAgdmFyIGMgPSBNYXRoLmNsejMyKHZhbHVlICYgLXZhbHVlKTtcbiAgICByZXR1cm4gdmFsdWUgPyAzMSAtIGMgOiBjO1xuICB9XG4gIC8qKlxuICAgKiBUZXN0cyBpZiB0aGUgc3BlY2lmaWVkIG9iamVjdCBpcyBhIExvbmcuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0geyp9IG9iaiBPYmplY3RcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBcbiAgXG4gIExvbmcuaXNMb25nID0gaXNMb25nO1xuICAvKipcbiAgICogQSBjYWNoZSBvZiB0aGUgTG9uZyByZXByZXNlbnRhdGlvbnMgb2Ygc21hbGwgaW50ZWdlciB2YWx1ZXMuXG4gICAqIEB0eXBlIHshT2JqZWN0fVxuICAgKiBAaW5uZXJcbiAgICovXG4gIFxuICB2YXIgSU5UX0NBQ0hFID0ge307XG4gIC8qKlxuICAgKiBBIGNhY2hlIG9mIHRoZSBMb25nIHJlcHJlc2VudGF0aW9ucyBvZiBzbWFsbCB1bnNpZ25lZCBpbnRlZ2VyIHZhbHVlcy5cbiAgICogQHR5cGUgeyFPYmplY3R9XG4gICAqIEBpbm5lclxuICAgKi9cbiAgXG4gIHZhciBVSU5UX0NBQ0hFID0ge307XG4gIC8qKlxuICAgKiBAcGFyYW0ge251bWJlcn0gdmFsdWVcbiAgICogQHBhcmFtIHtib29sZWFuPX0gdW5zaWduZWRcbiAgICogQHJldHVybnMgeyFMb25nfVxuICAgKiBAaW5uZXJcbiAgICovXG4gIFxuICBmdW5jdGlvbiBmcm9tSW50KHZhbHVlLCB1bnNpZ25lZCkge1xuICAgIHZhciBvYmosIGNhY2hlZE9iaiwgY2FjaGU7XG4gIFxuICAgIGlmICh1bnNpZ25lZCkge1xuICAgICAgdmFsdWUgPj4+PSAwO1xuICBcbiAgICAgIGlmIChjYWNoZSA9IDAgPD0gdmFsdWUgJiYgdmFsdWUgPCAyNTYpIHtcbiAgICAgICAgY2FjaGVkT2JqID0gVUlOVF9DQUNIRVt2YWx1ZV07XG4gICAgICAgIGlmIChjYWNoZWRPYmopIHJldHVybiBjYWNoZWRPYmo7XG4gICAgICB9XG4gIFxuICAgICAgb2JqID0gZnJvbUJpdHModmFsdWUsIDAsIHRydWUpO1xuICAgICAgaWYgKGNhY2hlKSBVSU5UX0NBQ0hFW3ZhbHVlXSA9IG9iajtcbiAgICAgIHJldHVybiBvYmo7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhbHVlIHw9IDA7XG4gIFxuICAgICAgaWYgKGNhY2hlID0gLTEyOCA8PSB2YWx1ZSAmJiB2YWx1ZSA8IDEyOCkge1xuICAgICAgICBjYWNoZWRPYmogPSBJTlRfQ0FDSEVbdmFsdWVdO1xuICAgICAgICBpZiAoY2FjaGVkT2JqKSByZXR1cm4gY2FjaGVkT2JqO1xuICAgICAgfVxuICBcbiAgICAgIG9iaiA9IGZyb21CaXRzKHZhbHVlLCB2YWx1ZSA8IDAgPyAtMSA6IDAsIGZhbHNlKTtcbiAgICAgIGlmIChjYWNoZSkgSU5UX0NBQ0hFW3ZhbHVlXSA9IG9iajtcbiAgICAgIHJldHVybiBvYmo7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgTG9uZyByZXByZXNlbnRpbmcgdGhlIGdpdmVuIDMyIGJpdCBpbnRlZ2VyIHZhbHVlLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHtudW1iZXJ9IHZhbHVlIFRoZSAzMiBiaXQgaW50ZWdlciBpbiBxdWVzdGlvblxuICAgKiBAcGFyYW0ge2Jvb2xlYW49fSB1bnNpZ25lZCBXaGV0aGVyIHVuc2lnbmVkIG9yIG5vdCwgZGVmYXVsdHMgdG8gc2lnbmVkXG4gICAqIEByZXR1cm5zIHshTG9uZ30gVGhlIGNvcnJlc3BvbmRpbmcgTG9uZyB2YWx1ZVxuICAgKi9cbiAgXG4gIFxuICBMb25nLmZyb21JbnQgPSBmcm9tSW50O1xuICAvKipcbiAgICogQHBhcmFtIHtudW1iZXJ9IHZhbHVlXG4gICAqIEBwYXJhbSB7Ym9vbGVhbj19IHVuc2lnbmVkXG4gICAqIEByZXR1cm5zIHshTG9uZ31cbiAgICogQGlubmVyXG4gICAqL1xuICBcbiAgZnVuY3Rpb24gZnJvbU51bWJlcih2YWx1ZSwgdW5zaWduZWQpIHtcbiAgICBpZiAoaXNOYU4odmFsdWUpKSByZXR1cm4gdW5zaWduZWQgPyBVWkVSTyA6IFpFUk87XG4gIFxuICAgIGlmICh1bnNpZ25lZCkge1xuICAgICAgaWYgKHZhbHVlIDwgMCkgcmV0dXJuIFVaRVJPO1xuICAgICAgaWYgKHZhbHVlID49IFRXT19QV1JfNjRfREJMKSByZXR1cm4gTUFYX1VOU0lHTkVEX1ZBTFVFO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodmFsdWUgPD0gLVRXT19QV1JfNjNfREJMKSByZXR1cm4gTUlOX1ZBTFVFO1xuICAgICAgaWYgKHZhbHVlICsgMSA+PSBUV09fUFdSXzYzX0RCTCkgcmV0dXJuIE1BWF9WQUxVRTtcbiAgICB9XG4gIFxuICAgIGlmICh2YWx1ZSA8IDApIHJldHVybiBmcm9tTnVtYmVyKC12YWx1ZSwgdW5zaWduZWQpLm5lZygpO1xuICAgIHJldHVybiBmcm9tQml0cyh2YWx1ZSAlIFRXT19QV1JfMzJfREJMIHwgMCwgdmFsdWUgLyBUV09fUFdSXzMyX0RCTCB8IDAsIHVuc2lnbmVkKTtcbiAgfVxuICAvKipcbiAgICogUmV0dXJucyBhIExvbmcgcmVwcmVzZW50aW5nIHRoZSBnaXZlbiB2YWx1ZSwgcHJvdmlkZWQgdGhhdCBpdCBpcyBhIGZpbml0ZSBudW1iZXIuIE90aGVyd2lzZSwgemVybyBpcyByZXR1cm5lZC5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZSBUaGUgbnVtYmVyIGluIHF1ZXN0aW9uXG4gICAqIEBwYXJhbSB7Ym9vbGVhbj19IHVuc2lnbmVkIFdoZXRoZXIgdW5zaWduZWQgb3Igbm90LCBkZWZhdWx0cyB0byBzaWduZWRcbiAgICogQHJldHVybnMgeyFMb25nfSBUaGUgY29ycmVzcG9uZGluZyBMb25nIHZhbHVlXG4gICAqL1xuICBcbiAgXG4gIExvbmcuZnJvbU51bWJlciA9IGZyb21OdW1iZXI7XG4gIC8qKlxuICAgKiBAcGFyYW0ge251bWJlcn0gbG93Qml0c1xuICAgKiBAcGFyYW0ge251bWJlcn0gaGlnaEJpdHNcbiAgICogQHBhcmFtIHtib29sZWFuPX0gdW5zaWduZWRcbiAgICogQHJldHVybnMgeyFMb25nfVxuICAgKiBAaW5uZXJcbiAgICovXG4gIFxuICBmdW5jdGlvbiBmcm9tQml0cyhsb3dCaXRzLCBoaWdoQml0cywgdW5zaWduZWQpIHtcbiAgICByZXR1cm4gbmV3IExvbmcobG93Qml0cywgaGlnaEJpdHMsIHVuc2lnbmVkKTtcbiAgfVxuICAvKipcbiAgICogUmV0dXJucyBhIExvbmcgcmVwcmVzZW50aW5nIHRoZSA2NCBiaXQgaW50ZWdlciB0aGF0IGNvbWVzIGJ5IGNvbmNhdGVuYXRpbmcgdGhlIGdpdmVuIGxvdyBhbmQgaGlnaCBiaXRzLiBFYWNoIGlzXG4gICAqICBhc3N1bWVkIHRvIHVzZSAzMiBiaXRzLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHtudW1iZXJ9IGxvd0JpdHMgVGhlIGxvdyAzMiBiaXRzXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBoaWdoQml0cyBUaGUgaGlnaCAzMiBiaXRzXG4gICAqIEBwYXJhbSB7Ym9vbGVhbj19IHVuc2lnbmVkIFdoZXRoZXIgdW5zaWduZWQgb3Igbm90LCBkZWZhdWx0cyB0byBzaWduZWRcbiAgICogQHJldHVybnMgeyFMb25nfSBUaGUgY29ycmVzcG9uZGluZyBMb25nIHZhbHVlXG4gICAqL1xuICBcbiAgXG4gIExvbmcuZnJvbUJpdHMgPSBmcm9tQml0cztcbiAgLyoqXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0ge251bWJlcn0gYmFzZVxuICAgKiBAcGFyYW0ge251bWJlcn0gZXhwb25lbnRcbiAgICogQHJldHVybnMge251bWJlcn1cbiAgICogQGlubmVyXG4gICAqL1xuICBcbiAgdmFyIHBvd19kYmwgPSBNYXRoLnBvdzsgLy8gVXNlZCA0IHRpbWVzICg0KjggdG8gMTUrNClcbiAgXG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gc3RyXG4gICAqIEBwYXJhbSB7KGJvb2xlYW58bnVtYmVyKT19IHVuc2lnbmVkXG4gICAqIEBwYXJhbSB7bnVtYmVyPX0gcmFkaXhcbiAgICogQHJldHVybnMgeyFMb25nfVxuICAgKiBAaW5uZXJcbiAgICovXG4gIFxuICBmdW5jdGlvbiBmcm9tU3RyaW5nKHN0ciwgdW5zaWduZWQsIHJhZGl4KSB7XG4gICAgaWYgKHN0ci5sZW5ndGggPT09IDApIHRocm93IEVycm9yKCdlbXB0eSBzdHJpbmcnKTtcbiAgXG4gICAgaWYgKHR5cGVvZiB1bnNpZ25lZCA9PT0gJ251bWJlcicpIHtcbiAgICAgIC8vIEZvciBnb29nLm1hdGgubG9uZyBjb21wYXRpYmlsaXR5XG4gICAgICByYWRpeCA9IHVuc2lnbmVkO1xuICAgICAgdW5zaWduZWQgPSBmYWxzZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdW5zaWduZWQgPSAhIXVuc2lnbmVkO1xuICAgIH1cbiAgXG4gICAgaWYgKHN0ciA9PT0gXCJOYU5cIiB8fCBzdHIgPT09IFwiSW5maW5pdHlcIiB8fCBzdHIgPT09IFwiK0luZmluaXR5XCIgfHwgc3RyID09PSBcIi1JbmZpbml0eVwiKSByZXR1cm4gdW5zaWduZWQgPyBVWkVSTyA6IFpFUk87XG4gICAgcmFkaXggPSByYWRpeCB8fCAxMDtcbiAgICBpZiAocmFkaXggPCAyIHx8IDM2IDwgcmFkaXgpIHRocm93IFJhbmdlRXJyb3IoJ3JhZGl4Jyk7XG4gICAgdmFyIHA7XG4gICAgaWYgKChwID0gc3RyLmluZGV4T2YoJy0nKSkgPiAwKSB0aHJvdyBFcnJvcignaW50ZXJpb3IgaHlwaGVuJyk7ZWxzZSBpZiAocCA9PT0gMCkge1xuICAgICAgcmV0dXJuIGZyb21TdHJpbmcoc3RyLnN1YnN0cmluZygxKSwgdW5zaWduZWQsIHJhZGl4KS5uZWcoKTtcbiAgICB9IC8vIERvIHNldmVyYWwgKDgpIGRpZ2l0cyBlYWNoIHRpbWUgdGhyb3VnaCB0aGUgbG9vcCwgc28gYXMgdG9cbiAgICAvLyBtaW5pbWl6ZSB0aGUgY2FsbHMgdG8gdGhlIHZlcnkgZXhwZW5zaXZlIGVtdWxhdGVkIGRpdi5cbiAgXG4gICAgdmFyIHJhZGl4VG9Qb3dlciA9IGZyb21OdW1iZXIocG93X2RibChyYWRpeCwgOCkpO1xuICAgIHZhciByZXN1bHQgPSBaRVJPO1xuICBcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkgKz0gOCkge1xuICAgICAgdmFyIHNpemUgPSBNYXRoLm1pbig4LCBzdHIubGVuZ3RoIC0gaSksXG4gICAgICAgICAgdmFsdWUgPSBwYXJzZUludChzdHIuc3Vic3RyaW5nKGksIGkgKyBzaXplKSwgcmFkaXgpO1xuICBcbiAgICAgIGlmIChzaXplIDwgOCkge1xuICAgICAgICB2YXIgcG93ZXIgPSBmcm9tTnVtYmVyKHBvd19kYmwocmFkaXgsIHNpemUpKTtcbiAgICAgICAgcmVzdWx0ID0gcmVzdWx0Lm11bChwb3dlcikuYWRkKGZyb21OdW1iZXIodmFsdWUpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc3VsdCA9IHJlc3VsdC5tdWwocmFkaXhUb1Bvd2VyKTtcbiAgICAgICAgcmVzdWx0ID0gcmVzdWx0LmFkZChmcm9tTnVtYmVyKHZhbHVlKSk7XG4gICAgICB9XG4gICAgfVxuICBcbiAgICByZXN1bHQudW5zaWduZWQgPSB1bnNpZ25lZDtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgTG9uZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgZ2l2ZW4gc3RyaW5nLCB3cml0dGVuIHVzaW5nIHRoZSBzcGVjaWZpZWQgcmFkaXguXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0ge3N0cmluZ30gc3RyIFRoZSB0ZXh0dWFsIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBMb25nXG4gICAqIEBwYXJhbSB7KGJvb2xlYW58bnVtYmVyKT19IHVuc2lnbmVkIFdoZXRoZXIgdW5zaWduZWQgb3Igbm90LCBkZWZhdWx0cyB0byBzaWduZWRcbiAgICogQHBhcmFtIHtudW1iZXI9fSByYWRpeCBUaGUgcmFkaXggaW4gd2hpY2ggdGhlIHRleHQgaXMgd3JpdHRlbiAoMi0zNiksIGRlZmF1bHRzIHRvIDEwXG4gICAqIEByZXR1cm5zIHshTG9uZ30gVGhlIGNvcnJlc3BvbmRpbmcgTG9uZyB2YWx1ZVxuICAgKi9cbiAgXG4gIFxuICBMb25nLmZyb21TdHJpbmcgPSBmcm9tU3RyaW5nO1xuICAvKipcbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ3whe2xvdzogbnVtYmVyLCBoaWdoOiBudW1iZXIsIHVuc2lnbmVkOiBib29sZWFufX0gdmFsXG4gICAqIEBwYXJhbSB7Ym9vbGVhbj19IHVuc2lnbmVkXG4gICAqIEByZXR1cm5zIHshTG9uZ31cbiAgICogQGlubmVyXG4gICAqL1xuICBcbiAgZnVuY3Rpb24gZnJvbVZhbHVlKHZhbCwgdW5zaWduZWQpIHtcbiAgICBpZiAodHlwZW9mIHZhbCA9PT0gJ251bWJlcicpIHJldHVybiBmcm9tTnVtYmVyKHZhbCwgdW5zaWduZWQpO1xuICAgIGlmICh0eXBlb2YgdmFsID09PSAnc3RyaW5nJykgcmV0dXJuIGZyb21TdHJpbmcodmFsLCB1bnNpZ25lZCk7IC8vIFRocm93cyBmb3Igbm9uLW9iamVjdHMsIGNvbnZlcnRzIG5vbi1pbnN0YW5jZW9mIExvbmc6XG4gIFxuICAgIHJldHVybiBmcm9tQml0cyh2YWwubG93LCB2YWwuaGlnaCwgdHlwZW9mIHVuc2lnbmVkID09PSAnYm9vbGVhbicgPyB1bnNpZ25lZCA6IHZhbC51bnNpZ25lZCk7XG4gIH1cbiAgLyoqXG4gICAqIENvbnZlcnRzIHRoZSBzcGVjaWZpZWQgdmFsdWUgdG8gYSBMb25nIHVzaW5nIHRoZSBhcHByb3ByaWF0ZSBmcm9tKiBmdW5jdGlvbiBmb3IgaXRzIHR5cGUuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxzdHJpbmd8IXtsb3c6IG51bWJlciwgaGlnaDogbnVtYmVyLCB1bnNpZ25lZDogYm9vbGVhbn19IHZhbCBWYWx1ZVxuICAgKiBAcGFyYW0ge2Jvb2xlYW49fSB1bnNpZ25lZCBXaGV0aGVyIHVuc2lnbmVkIG9yIG5vdCwgZGVmYXVsdHMgdG8gc2lnbmVkXG4gICAqIEByZXR1cm5zIHshTG9uZ31cbiAgICovXG4gIFxuICBcbiAgTG9uZy5mcm9tVmFsdWUgPSBmcm9tVmFsdWU7IC8vIE5PVEU6IHRoZSBjb21waWxlciBzaG91bGQgaW5saW5lIHRoZXNlIGNvbnN0YW50IHZhbHVlcyBiZWxvdyBhbmQgdGhlbiByZW1vdmUgdGhlc2UgdmFyaWFibGVzLCBzbyB0aGVyZSBzaG91bGQgYmVcbiAgLy8gbm8gcnVudGltZSBwZW5hbHR5IGZvciB0aGVzZS5cbiAgXG4gIC8qKlxuICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgKiBAY29uc3RcbiAgICogQGlubmVyXG4gICAqL1xuICBcbiAgdmFyIFRXT19QV1JfMTZfREJMID0gMSA8PCAxNjtcbiAgLyoqXG4gICAqIEB0eXBlIHtudW1iZXJ9XG4gICAqIEBjb25zdFxuICAgKiBAaW5uZXJcbiAgICovXG4gIFxuICB2YXIgVFdPX1BXUl8yNF9EQkwgPSAxIDw8IDI0O1xuICAvKipcbiAgICogQHR5cGUge251bWJlcn1cbiAgICogQGNvbnN0XG4gICAqIEBpbm5lclxuICAgKi9cbiAgXG4gIHZhciBUV09fUFdSXzMyX0RCTCA9IFRXT19QV1JfMTZfREJMICogVFdPX1BXUl8xNl9EQkw7XG4gIC8qKlxuICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgKiBAY29uc3RcbiAgICogQGlubmVyXG4gICAqL1xuICBcbiAgdmFyIFRXT19QV1JfNjRfREJMID0gVFdPX1BXUl8zMl9EQkwgKiBUV09fUFdSXzMyX0RCTDtcbiAgLyoqXG4gICAqIEB0eXBlIHtudW1iZXJ9XG4gICAqIEBjb25zdFxuICAgKiBAaW5uZXJcbiAgICovXG4gIFxuICB2YXIgVFdPX1BXUl82M19EQkwgPSBUV09fUFdSXzY0X0RCTCAvIDI7XG4gIC8qKlxuICAgKiBAdHlwZSB7IUxvbmd9XG4gICAqIEBjb25zdFxuICAgKiBAaW5uZXJcbiAgICovXG4gIFxuICB2YXIgVFdPX1BXUl8yNCA9IGZyb21JbnQoVFdPX1BXUl8yNF9EQkwpO1xuICAvKipcbiAgICogQHR5cGUgeyFMb25nfVxuICAgKiBAaW5uZXJcbiAgICovXG4gIFxuICB2YXIgWkVSTyA9IGZyb21JbnQoMCk7XG4gIC8qKlxuICAgKiBTaWduZWQgemVyby5cbiAgICogQHR5cGUgeyFMb25nfVxuICAgKi9cbiAgXG4gIExvbmcuWkVSTyA9IFpFUk87XG4gIC8qKlxuICAgKiBAdHlwZSB7IUxvbmd9XG4gICAqIEBpbm5lclxuICAgKi9cbiAgXG4gIHZhciBVWkVSTyA9IGZyb21JbnQoMCwgdHJ1ZSk7XG4gIC8qKlxuICAgKiBVbnNpZ25lZCB6ZXJvLlxuICAgKiBAdHlwZSB7IUxvbmd9XG4gICAqL1xuICBcbiAgTG9uZy5VWkVSTyA9IFVaRVJPO1xuICAvKipcbiAgICogQHR5cGUgeyFMb25nfVxuICAgKiBAaW5uZXJcbiAgICovXG4gIFxuICB2YXIgT05FID0gZnJvbUludCgxKTtcbiAgLyoqXG4gICAqIFNpZ25lZCBvbmUuXG4gICAqIEB0eXBlIHshTG9uZ31cbiAgICovXG4gIFxuICBMb25nLk9ORSA9IE9ORTtcbiAgLyoqXG4gICAqIEB0eXBlIHshTG9uZ31cbiAgICogQGlubmVyXG4gICAqL1xuICBcbiAgdmFyIFVPTkUgPSBmcm9tSW50KDEsIHRydWUpO1xuICAvKipcbiAgICogVW5zaWduZWQgb25lLlxuICAgKiBAdHlwZSB7IUxvbmd9XG4gICAqL1xuICBcbiAgTG9uZy5VT05FID0gVU9ORTtcbiAgLyoqXG4gICAqIEB0eXBlIHshTG9uZ31cbiAgICogQGlubmVyXG4gICAqL1xuICBcbiAgdmFyIE5FR19PTkUgPSBmcm9tSW50KC0xKTtcbiAgLyoqXG4gICAqIFNpZ25lZCBuZWdhdGl2ZSBvbmUuXG4gICAqIEB0eXBlIHshTG9uZ31cbiAgICovXG4gIFxuICBMb25nLk5FR19PTkUgPSBORUdfT05FO1xuICAvKipcbiAgICogQHR5cGUgeyFMb25nfVxuICAgKiBAaW5uZXJcbiAgICovXG4gIFxuICB2YXIgTUFYX1ZBTFVFID0gZnJvbUJpdHMoMHhGRkZGRkZGRiB8IDAsIDB4N0ZGRkZGRkYgfCAwLCBmYWxzZSk7XG4gIC8qKlxuICAgKiBNYXhpbXVtIHNpZ25lZCB2YWx1ZS5cbiAgICogQHR5cGUgeyFMb25nfVxuICAgKi9cbiAgXG4gIExvbmcuTUFYX1ZBTFVFID0gTUFYX1ZBTFVFO1xuICAvKipcbiAgICogQHR5cGUgeyFMb25nfVxuICAgKiBAaW5uZXJcbiAgICovXG4gIFxuICB2YXIgTUFYX1VOU0lHTkVEX1ZBTFVFID0gZnJvbUJpdHMoMHhGRkZGRkZGRiB8IDAsIDB4RkZGRkZGRkYgfCAwLCB0cnVlKTtcbiAgLyoqXG4gICAqIE1heGltdW0gdW5zaWduZWQgdmFsdWUuXG4gICAqIEB0eXBlIHshTG9uZ31cbiAgICovXG4gIFxuICBMb25nLk1BWF9VTlNJR05FRF9WQUxVRSA9IE1BWF9VTlNJR05FRF9WQUxVRTtcbiAgLyoqXG4gICAqIEB0eXBlIHshTG9uZ31cbiAgICogQGlubmVyXG4gICAqL1xuICBcbiAgdmFyIE1JTl9WQUxVRSA9IGZyb21CaXRzKDAsIDB4ODAwMDAwMDAgfCAwLCBmYWxzZSk7XG4gIC8qKlxuICAgKiBNaW5pbXVtIHNpZ25lZCB2YWx1ZS5cbiAgICogQHR5cGUgeyFMb25nfVxuICAgKi9cbiAgXG4gIExvbmcuTUlOX1ZBTFVFID0gTUlOX1ZBTFVFO1xuICAvKipcbiAgICogQGFsaWFzIExvbmcucHJvdG90eXBlXG4gICAqIEBpbm5lclxuICAgKi9cbiAgXG4gIHZhciBMb25nUHJvdG90eXBlID0gTG9uZy5wcm90b3R5cGU7XG4gIC8qKlxuICAgKiBDb252ZXJ0cyB0aGUgTG9uZyB0byBhIDMyIGJpdCBpbnRlZ2VyLCBhc3N1bWluZyBpdCBpcyBhIDMyIGJpdCBpbnRlZ2VyLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAqL1xuICBcbiAgTG9uZ1Byb3RvdHlwZS50b0ludCA9IGZ1bmN0aW9uIHRvSW50KCkge1xuICAgIHJldHVybiB0aGlzLnVuc2lnbmVkID8gdGhpcy5sb3cgPj4+IDAgOiB0aGlzLmxvdztcbiAgfTtcbiAgLyoqXG4gICAqIENvbnZlcnRzIHRoZSBMb25nIHRvIGEgdGhlIG5lYXJlc3QgZmxvYXRpbmctcG9pbnQgcmVwcmVzZW50YXRpb24gb2YgdGhpcyB2YWx1ZSAoZG91YmxlLCA1MyBiaXQgbWFudGlzc2EpLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUudG9OdW1iZXIgPSBmdW5jdGlvbiB0b051bWJlcigpIHtcbiAgICBpZiAodGhpcy51bnNpZ25lZCkgcmV0dXJuICh0aGlzLmhpZ2ggPj4+IDApICogVFdPX1BXUl8zMl9EQkwgKyAodGhpcy5sb3cgPj4+IDApO1xuICAgIHJldHVybiB0aGlzLmhpZ2ggKiBUV09fUFdSXzMyX0RCTCArICh0aGlzLmxvdyA+Pj4gMCk7XG4gIH07XG4gIC8qKlxuICAgKiBDb252ZXJ0cyB0aGUgTG9uZyB0byBhIHN0cmluZyB3cml0dGVuIGluIHRoZSBzcGVjaWZpZWQgcmFkaXguXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHBhcmFtIHtudW1iZXI9fSByYWRpeCBSYWRpeCAoMi0zNiksIGRlZmF1bHRzIHRvIDEwXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAqIEBvdmVycmlkZVxuICAgKiBAdGhyb3dzIHtSYW5nZUVycm9yfSBJZiBgcmFkaXhgIGlzIG91dCBvZiByYW5nZVxuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcocmFkaXgpIHtcbiAgICByYWRpeCA9IHJhZGl4IHx8IDEwO1xuICAgIGlmIChyYWRpeCA8IDIgfHwgMzYgPCByYWRpeCkgdGhyb3cgUmFuZ2VFcnJvcigncmFkaXgnKTtcbiAgICBpZiAodGhpcy5pc1plcm8oKSkgcmV0dXJuICcwJztcbiAgXG4gICAgaWYgKHRoaXMuaXNOZWdhdGl2ZSgpKSB7XG4gICAgICAvLyBVbnNpZ25lZCBMb25ncyBhcmUgbmV2ZXIgbmVnYXRpdmVcbiAgICAgIGlmICh0aGlzLmVxKE1JTl9WQUxVRSkpIHtcbiAgICAgICAgLy8gV2UgbmVlZCB0byBjaGFuZ2UgdGhlIExvbmcgdmFsdWUgYmVmb3JlIGl0IGNhbiBiZSBuZWdhdGVkLCBzbyB3ZSByZW1vdmVcbiAgICAgICAgLy8gdGhlIGJvdHRvbS1tb3N0IGRpZ2l0IGluIHRoaXMgYmFzZSBhbmQgdGhlbiByZWN1cnNlIHRvIGRvIHRoZSByZXN0LlxuICAgICAgICB2YXIgcmFkaXhMb25nID0gZnJvbU51bWJlcihyYWRpeCksXG4gICAgICAgICAgICBkaXYgPSB0aGlzLmRpdihyYWRpeExvbmcpLFxuICAgICAgICAgICAgcmVtMSA9IGRpdi5tdWwocmFkaXhMb25nKS5zdWIodGhpcyk7XG4gICAgICAgIHJldHVybiBkaXYudG9TdHJpbmcocmFkaXgpICsgcmVtMS50b0ludCgpLnRvU3RyaW5nKHJhZGl4KTtcbiAgICAgIH0gZWxzZSByZXR1cm4gJy0nICsgdGhpcy5uZWcoKS50b1N0cmluZyhyYWRpeCk7XG4gICAgfSAvLyBEbyBzZXZlcmFsICg2KSBkaWdpdHMgZWFjaCB0aW1lIHRocm91Z2ggdGhlIGxvb3AsIHNvIGFzIHRvXG4gICAgLy8gbWluaW1pemUgdGhlIGNhbGxzIHRvIHRoZSB2ZXJ5IGV4cGVuc2l2ZSBlbXVsYXRlZCBkaXYuXG4gIFxuICBcbiAgICB2YXIgcmFkaXhUb1Bvd2VyID0gZnJvbU51bWJlcihwb3dfZGJsKHJhZGl4LCA2KSwgdGhpcy51bnNpZ25lZCksXG4gICAgICAgIHJlbSA9IHRoaXM7XG4gICAgdmFyIHJlc3VsdCA9ICcnO1xuICBcbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgdmFyIHJlbURpdiA9IHJlbS5kaXYocmFkaXhUb1Bvd2VyKSxcbiAgICAgICAgICBpbnR2YWwgPSByZW0uc3ViKHJlbURpdi5tdWwocmFkaXhUb1Bvd2VyKSkudG9JbnQoKSA+Pj4gMCxcbiAgICAgICAgICBkaWdpdHMgPSBpbnR2YWwudG9TdHJpbmcocmFkaXgpO1xuICAgICAgcmVtID0gcmVtRGl2O1xuICAgICAgaWYgKHJlbS5pc1plcm8oKSkgcmV0dXJuIGRpZ2l0cyArIHJlc3VsdDtlbHNlIHtcbiAgICAgICAgd2hpbGUgKGRpZ2l0cy5sZW5ndGggPCA2KSBkaWdpdHMgPSAnMCcgKyBkaWdpdHM7XG4gIFxuICAgICAgICByZXN1bHQgPSAnJyArIGRpZ2l0cyArIHJlc3VsdDtcbiAgICAgIH1cbiAgICB9XG4gIH07XG4gIC8qKlxuICAgKiBHZXRzIHRoZSBoaWdoIDMyIGJpdHMgYXMgYSBzaWduZWQgaW50ZWdlci5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcmV0dXJucyB7bnVtYmVyfSBTaWduZWQgaGlnaCBiaXRzXG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUuZ2V0SGlnaEJpdHMgPSBmdW5jdGlvbiBnZXRIaWdoQml0cygpIHtcbiAgICByZXR1cm4gdGhpcy5oaWdoO1xuICB9O1xuICAvKipcbiAgICogR2V0cyB0aGUgaGlnaCAzMiBiaXRzIGFzIGFuIHVuc2lnbmVkIGludGVnZXIuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHJldHVybnMge251bWJlcn0gVW5zaWduZWQgaGlnaCBiaXRzXG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUuZ2V0SGlnaEJpdHNVbnNpZ25lZCA9IGZ1bmN0aW9uIGdldEhpZ2hCaXRzVW5zaWduZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuaGlnaCA+Pj4gMDtcbiAgfTtcbiAgLyoqXG4gICAqIEdldHMgdGhlIGxvdyAzMiBiaXRzIGFzIGEgc2lnbmVkIGludGVnZXIuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHJldHVybnMge251bWJlcn0gU2lnbmVkIGxvdyBiaXRzXG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUuZ2V0TG93Qml0cyA9IGZ1bmN0aW9uIGdldExvd0JpdHMoKSB7XG4gICAgcmV0dXJuIHRoaXMubG93O1xuICB9O1xuICAvKipcbiAgICogR2V0cyB0aGUgbG93IDMyIGJpdHMgYXMgYW4gdW5zaWduZWQgaW50ZWdlci5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcmV0dXJucyB7bnVtYmVyfSBVbnNpZ25lZCBsb3cgYml0c1xuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLmdldExvd0JpdHNVbnNpZ25lZCA9IGZ1bmN0aW9uIGdldExvd0JpdHNVbnNpZ25lZCgpIHtcbiAgICByZXR1cm4gdGhpcy5sb3cgPj4+IDA7XG4gIH07XG4gIC8qKlxuICAgKiBHZXRzIHRoZSBudW1iZXIgb2YgYml0cyBuZWVkZWQgdG8gcmVwcmVzZW50IHRoZSBhYnNvbHV0ZSB2YWx1ZSBvZiB0aGlzIExvbmcuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHJldHVybnMge251bWJlcn1cbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5nZXROdW1CaXRzQWJzID0gZnVuY3Rpb24gZ2V0TnVtQml0c0FicygpIHtcbiAgICBpZiAodGhpcy5pc05lZ2F0aXZlKCkpIC8vIFVuc2lnbmVkIExvbmdzIGFyZSBuZXZlciBuZWdhdGl2ZVxuICAgICAgcmV0dXJuIHRoaXMuZXEoTUlOX1ZBTFVFKSA/IDY0IDogdGhpcy5uZWcoKS5nZXROdW1CaXRzQWJzKCk7XG4gICAgdmFyIHZhbCA9IHRoaXMuaGlnaCAhPSAwID8gdGhpcy5oaWdoIDogdGhpcy5sb3c7XG4gIFxuICAgIGZvciAodmFyIGJpdCA9IDMxOyBiaXQgPiAwOyBiaXQtLSkgaWYgKCh2YWwgJiAxIDw8IGJpdCkgIT0gMCkgYnJlYWs7XG4gIFxuICAgIHJldHVybiB0aGlzLmhpZ2ggIT0gMCA/IGJpdCArIDMzIDogYml0ICsgMTtcbiAgfTtcbiAgLyoqXG4gICAqIFRlc3RzIGlmIHRoaXMgTG9uZydzIHZhbHVlIGVxdWFscyB6ZXJvLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLmlzWmVybyA9IGZ1bmN0aW9uIGlzWmVybygpIHtcbiAgICByZXR1cm4gdGhpcy5oaWdoID09PSAwICYmIHRoaXMubG93ID09PSAwO1xuICB9O1xuICAvKipcbiAgICogVGVzdHMgaWYgdGhpcyBMb25nJ3MgdmFsdWUgZXF1YWxzIHplcm8uIFRoaXMgaXMgYW4gYWxpYXMgb2Yge0BsaW5rIExvbmcjaXNaZXJvfS5cbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUuZXF6ID0gTG9uZ1Byb3RvdHlwZS5pc1plcm87XG4gIC8qKlxuICAgKiBUZXN0cyBpZiB0aGlzIExvbmcncyB2YWx1ZSBpcyBuZWdhdGl2ZS5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIFxuICBMb25nUHJvdG90eXBlLmlzTmVnYXRpdmUgPSBmdW5jdGlvbiBpc05lZ2F0aXZlKCkge1xuICAgIHJldHVybiAhdGhpcy51bnNpZ25lZCAmJiB0aGlzLmhpZ2ggPCAwO1xuICB9O1xuICAvKipcbiAgICogVGVzdHMgaWYgdGhpcyBMb25nJ3MgdmFsdWUgaXMgcG9zaXRpdmUgb3IgemVyby5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5pc1Bvc2l0aXZlID0gZnVuY3Rpb24gaXNQb3NpdGl2ZSgpIHtcbiAgICByZXR1cm4gdGhpcy51bnNpZ25lZCB8fCB0aGlzLmhpZ2ggPj0gMDtcbiAgfTtcbiAgLyoqXG4gICAqIFRlc3RzIGlmIHRoaXMgTG9uZydzIHZhbHVlIGlzIG9kZC5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5pc09kZCA9IGZ1bmN0aW9uIGlzT2RkKCkge1xuICAgIHJldHVybiAodGhpcy5sb3cgJiAxKSA9PT0gMTtcbiAgfTtcbiAgLyoqXG4gICAqIFRlc3RzIGlmIHRoaXMgTG9uZydzIHZhbHVlIGlzIGV2ZW4uXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUuaXNFdmVuID0gZnVuY3Rpb24gaXNFdmVuKCkge1xuICAgIHJldHVybiAodGhpcy5sb3cgJiAxKSA9PT0gMDtcbiAgfTtcbiAgLyoqXG4gICAqIFRlc3RzIGlmIHRoaXMgTG9uZydzIHZhbHVlIGVxdWFscyB0aGUgc3BlY2lmaWVkJ3MuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfSBvdGhlciBPdGhlciB2YWx1ZVxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5lcXVhbHMgPSBmdW5jdGlvbiBlcXVhbHMob3RoZXIpIHtcbiAgICBpZiAoIWlzTG9uZyhvdGhlcikpIG90aGVyID0gZnJvbVZhbHVlKG90aGVyKTtcbiAgICBpZiAodGhpcy51bnNpZ25lZCAhPT0gb3RoZXIudW5zaWduZWQgJiYgdGhpcy5oaWdoID4+PiAzMSA9PT0gMSAmJiBvdGhlci5oaWdoID4+PiAzMSA9PT0gMSkgcmV0dXJuIGZhbHNlO1xuICAgIHJldHVybiB0aGlzLmhpZ2ggPT09IG90aGVyLmhpZ2ggJiYgdGhpcy5sb3cgPT09IG90aGVyLmxvdztcbiAgfTtcbiAgLyoqXG4gICAqIFRlc3RzIGlmIHRoaXMgTG9uZydzIHZhbHVlIGVxdWFscyB0aGUgc3BlY2lmaWVkJ3MuIFRoaXMgaXMgYW4gYWxpYXMgb2Yge0BsaW5rIExvbmcjZXF1YWxzfS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ30gb3RoZXIgT3RoZXIgdmFsdWVcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUuZXEgPSBMb25nUHJvdG90eXBlLmVxdWFscztcbiAgLyoqXG4gICAqIFRlc3RzIGlmIHRoaXMgTG9uZydzIHZhbHVlIGRpZmZlcnMgZnJvbSB0aGUgc3BlY2lmaWVkJ3MuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfSBvdGhlciBPdGhlciB2YWx1ZVxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIFxuICBMb25nUHJvdG90eXBlLm5vdEVxdWFscyA9IGZ1bmN0aW9uIG5vdEVxdWFscyhvdGhlcikge1xuICAgIHJldHVybiAhdGhpcy5lcShcbiAgICAvKiB2YWxpZGF0ZXMgKi9cbiAgICBvdGhlcik7XG4gIH07XG4gIC8qKlxuICAgKiBUZXN0cyBpZiB0aGlzIExvbmcncyB2YWx1ZSBkaWZmZXJzIGZyb20gdGhlIHNwZWNpZmllZCdzLiBUaGlzIGlzIGFuIGFsaWFzIG9mIHtAbGluayBMb25nI25vdEVxdWFsc30uXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxzdHJpbmd9IG90aGVyIE90aGVyIHZhbHVlXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLm5lcSA9IExvbmdQcm90b3R5cGUubm90RXF1YWxzO1xuICAvKipcbiAgICogVGVzdHMgaWYgdGhpcyBMb25nJ3MgdmFsdWUgZGlmZmVycyBmcm9tIHRoZSBzcGVjaWZpZWQncy4gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgTG9uZyNub3RFcXVhbHN9LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfSBvdGhlciBPdGhlciB2YWx1ZVxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIFxuICBMb25nUHJvdG90eXBlLm5lID0gTG9uZ1Byb3RvdHlwZS5ub3RFcXVhbHM7XG4gIC8qKlxuICAgKiBUZXN0cyBpZiB0aGlzIExvbmcncyB2YWx1ZSBpcyBsZXNzIHRoYW4gdGhlIHNwZWNpZmllZCdzLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ30gb3RoZXIgT3RoZXIgdmFsdWVcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBcbiAgTG9uZ1Byb3RvdHlwZS5sZXNzVGhhbiA9IGZ1bmN0aW9uIGxlc3NUaGFuKG90aGVyKSB7XG4gICAgcmV0dXJuIHRoaXMuY29tcChcbiAgICAvKiB2YWxpZGF0ZXMgKi9cbiAgICBvdGhlcikgPCAwO1xuICB9O1xuICAvKipcbiAgICogVGVzdHMgaWYgdGhpcyBMb25nJ3MgdmFsdWUgaXMgbGVzcyB0aGFuIHRoZSBzcGVjaWZpZWQncy4gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgTG9uZyNsZXNzVGhhbn0uXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxzdHJpbmd9IG90aGVyIE90aGVyIHZhbHVlXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLmx0ID0gTG9uZ1Byb3RvdHlwZS5sZXNzVGhhbjtcbiAgLyoqXG4gICAqIFRlc3RzIGlmIHRoaXMgTG9uZydzIHZhbHVlIGlzIGxlc3MgdGhhbiBvciBlcXVhbCB0aGUgc3BlY2lmaWVkJ3MuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfSBvdGhlciBPdGhlciB2YWx1ZVxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIFxuICBMb25nUHJvdG90eXBlLmxlc3NUaGFuT3JFcXVhbCA9IGZ1bmN0aW9uIGxlc3NUaGFuT3JFcXVhbChvdGhlcikge1xuICAgIHJldHVybiB0aGlzLmNvbXAoXG4gICAgLyogdmFsaWRhdGVzICovXG4gICAgb3RoZXIpIDw9IDA7XG4gIH07XG4gIC8qKlxuICAgKiBUZXN0cyBpZiB0aGlzIExvbmcncyB2YWx1ZSBpcyBsZXNzIHRoYW4gb3IgZXF1YWwgdGhlIHNwZWNpZmllZCdzLiBUaGlzIGlzIGFuIGFsaWFzIG9mIHtAbGluayBMb25nI2xlc3NUaGFuT3JFcXVhbH0uXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxzdHJpbmd9IG90aGVyIE90aGVyIHZhbHVlXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLmx0ZSA9IExvbmdQcm90b3R5cGUubGVzc1RoYW5PckVxdWFsO1xuICAvKipcbiAgICogVGVzdHMgaWYgdGhpcyBMb25nJ3MgdmFsdWUgaXMgbGVzcyB0aGFuIG9yIGVxdWFsIHRoZSBzcGVjaWZpZWQncy4gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgTG9uZyNsZXNzVGhhbk9yRXF1YWx9LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfSBvdGhlciBPdGhlciB2YWx1ZVxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIFxuICBMb25nUHJvdG90eXBlLmxlID0gTG9uZ1Byb3RvdHlwZS5sZXNzVGhhbk9yRXF1YWw7XG4gIC8qKlxuICAgKiBUZXN0cyBpZiB0aGlzIExvbmcncyB2YWx1ZSBpcyBncmVhdGVyIHRoYW4gdGhlIHNwZWNpZmllZCdzLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ30gb3RoZXIgT3RoZXIgdmFsdWVcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBcbiAgTG9uZ1Byb3RvdHlwZS5ncmVhdGVyVGhhbiA9IGZ1bmN0aW9uIGdyZWF0ZXJUaGFuKG90aGVyKSB7XG4gICAgcmV0dXJuIHRoaXMuY29tcChcbiAgICAvKiB2YWxpZGF0ZXMgKi9cbiAgICBvdGhlcikgPiAwO1xuICB9O1xuICAvKipcbiAgICogVGVzdHMgaWYgdGhpcyBMb25nJ3MgdmFsdWUgaXMgZ3JlYXRlciB0aGFuIHRoZSBzcGVjaWZpZWQncy4gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgTG9uZyNncmVhdGVyVGhhbn0uXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxzdHJpbmd9IG90aGVyIE90aGVyIHZhbHVlXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLmd0ID0gTG9uZ1Byb3RvdHlwZS5ncmVhdGVyVGhhbjtcbiAgLyoqXG4gICAqIFRlc3RzIGlmIHRoaXMgTG9uZydzIHZhbHVlIGlzIGdyZWF0ZXIgdGhhbiBvciBlcXVhbCB0aGUgc3BlY2lmaWVkJ3MuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfSBvdGhlciBPdGhlciB2YWx1ZVxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIFxuICBMb25nUHJvdG90eXBlLmdyZWF0ZXJUaGFuT3JFcXVhbCA9IGZ1bmN0aW9uIGdyZWF0ZXJUaGFuT3JFcXVhbChvdGhlcikge1xuICAgIHJldHVybiB0aGlzLmNvbXAoXG4gICAgLyogdmFsaWRhdGVzICovXG4gICAgb3RoZXIpID49IDA7XG4gIH07XG4gIC8qKlxuICAgKiBUZXN0cyBpZiB0aGlzIExvbmcncyB2YWx1ZSBpcyBncmVhdGVyIHRoYW4gb3IgZXF1YWwgdGhlIHNwZWNpZmllZCdzLiBUaGlzIGlzIGFuIGFsaWFzIG9mIHtAbGluayBMb25nI2dyZWF0ZXJUaGFuT3JFcXVhbH0uXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxzdHJpbmd9IG90aGVyIE90aGVyIHZhbHVlXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLmd0ZSA9IExvbmdQcm90b3R5cGUuZ3JlYXRlclRoYW5PckVxdWFsO1xuICAvKipcbiAgICogVGVzdHMgaWYgdGhpcyBMb25nJ3MgdmFsdWUgaXMgZ3JlYXRlciB0aGFuIG9yIGVxdWFsIHRoZSBzcGVjaWZpZWQncy4gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgTG9uZyNncmVhdGVyVGhhbk9yRXF1YWx9LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfSBvdGhlciBPdGhlciB2YWx1ZVxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIFxuICBMb25nUHJvdG90eXBlLmdlID0gTG9uZ1Byb3RvdHlwZS5ncmVhdGVyVGhhbk9yRXF1YWw7XG4gIC8qKlxuICAgKiBDb21wYXJlcyB0aGlzIExvbmcncyB2YWx1ZSB3aXRoIHRoZSBzcGVjaWZpZWQncy5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxzdHJpbmd9IG90aGVyIE90aGVyIHZhbHVlXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9IDAgaWYgdGhleSBhcmUgdGhlIHNhbWUsIDEgaWYgdGhlIHRoaXMgaXMgZ3JlYXRlciBhbmQgLTFcbiAgICogIGlmIHRoZSBnaXZlbiBvbmUgaXMgZ3JlYXRlclxuICAgKi9cbiAgXG4gIExvbmdQcm90b3R5cGUuY29tcGFyZSA9IGZ1bmN0aW9uIGNvbXBhcmUob3RoZXIpIHtcbiAgICBpZiAoIWlzTG9uZyhvdGhlcikpIG90aGVyID0gZnJvbVZhbHVlKG90aGVyKTtcbiAgICBpZiAodGhpcy5lcShvdGhlcikpIHJldHVybiAwO1xuICAgIHZhciB0aGlzTmVnID0gdGhpcy5pc05lZ2F0aXZlKCksXG4gICAgICAgIG90aGVyTmVnID0gb3RoZXIuaXNOZWdhdGl2ZSgpO1xuICAgIGlmICh0aGlzTmVnICYmICFvdGhlck5lZykgcmV0dXJuIC0xO1xuICAgIGlmICghdGhpc05lZyAmJiBvdGhlck5lZykgcmV0dXJuIDE7IC8vIEF0IHRoaXMgcG9pbnQgdGhlIHNpZ24gYml0cyBhcmUgdGhlIHNhbWVcbiAgXG4gICAgaWYgKCF0aGlzLnVuc2lnbmVkKSByZXR1cm4gdGhpcy5zdWIob3RoZXIpLmlzTmVnYXRpdmUoKSA/IC0xIDogMTsgLy8gQm90aCBhcmUgcG9zaXRpdmUgaWYgYXQgbGVhc3Qgb25lIGlzIHVuc2lnbmVkXG4gIFxuICAgIHJldHVybiBvdGhlci5oaWdoID4+PiAwID4gdGhpcy5oaWdoID4+PiAwIHx8IG90aGVyLmhpZ2ggPT09IHRoaXMuaGlnaCAmJiBvdGhlci5sb3cgPj4+IDAgPiB0aGlzLmxvdyA+Pj4gMCA/IC0xIDogMTtcbiAgfTtcbiAgLyoqXG4gICAqIENvbXBhcmVzIHRoaXMgTG9uZydzIHZhbHVlIHdpdGggdGhlIHNwZWNpZmllZCdzLiBUaGlzIGlzIGFuIGFsaWFzIG9mIHtAbGluayBMb25nI2NvbXBhcmV9LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfSBvdGhlciBPdGhlciB2YWx1ZVxuICAgKiBAcmV0dXJucyB7bnVtYmVyfSAwIGlmIHRoZXkgYXJlIHRoZSBzYW1lLCAxIGlmIHRoZSB0aGlzIGlzIGdyZWF0ZXIgYW5kIC0xXG4gICAqICBpZiB0aGUgZ2l2ZW4gb25lIGlzIGdyZWF0ZXJcbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5jb21wID0gTG9uZ1Byb3RvdHlwZS5jb21wYXJlO1xuICAvKipcbiAgICogTmVnYXRlcyB0aGlzIExvbmcncyB2YWx1ZS5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcmV0dXJucyB7IUxvbmd9IE5lZ2F0ZWQgTG9uZ1xuICAgKi9cbiAgXG4gIExvbmdQcm90b3R5cGUubmVnYXRlID0gZnVuY3Rpb24gbmVnYXRlKCkge1xuICAgIGlmICghdGhpcy51bnNpZ25lZCAmJiB0aGlzLmVxKE1JTl9WQUxVRSkpIHJldHVybiBNSU5fVkFMVUU7XG4gICAgcmV0dXJuIHRoaXMubm90KCkuYWRkKE9ORSk7XG4gIH07XG4gIC8qKlxuICAgKiBOZWdhdGVzIHRoaXMgTG9uZydzIHZhbHVlLiBUaGlzIGlzIGFuIGFsaWFzIG9mIHtAbGluayBMb25nI25lZ2F0ZX0uXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcmV0dXJucyB7IUxvbmd9IE5lZ2F0ZWQgTG9uZ1xuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLm5lZyA9IExvbmdQcm90b3R5cGUubmVnYXRlO1xuICAvKipcbiAgICogUmV0dXJucyB0aGUgc3VtIG9mIHRoaXMgYW5kIHRoZSBzcGVjaWZpZWQgTG9uZy5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxzdHJpbmd9IGFkZGVuZCBBZGRlbmRcbiAgICogQHJldHVybnMgeyFMb25nfSBTdW1cbiAgICovXG4gIFxuICBMb25nUHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uIGFkZChhZGRlbmQpIHtcbiAgICBpZiAoIWlzTG9uZyhhZGRlbmQpKSBhZGRlbmQgPSBmcm9tVmFsdWUoYWRkZW5kKTsgLy8gRGl2aWRlIGVhY2ggbnVtYmVyIGludG8gNCBjaHVua3Mgb2YgMTYgYml0cywgYW5kIHRoZW4gc3VtIHRoZSBjaHVua3MuXG4gIFxuICAgIHZhciBhNDggPSB0aGlzLmhpZ2ggPj4+IDE2O1xuICAgIHZhciBhMzIgPSB0aGlzLmhpZ2ggJiAweEZGRkY7XG4gICAgdmFyIGExNiA9IHRoaXMubG93ID4+PiAxNjtcbiAgICB2YXIgYTAwID0gdGhpcy5sb3cgJiAweEZGRkY7XG4gICAgdmFyIGI0OCA9IGFkZGVuZC5oaWdoID4+PiAxNjtcbiAgICB2YXIgYjMyID0gYWRkZW5kLmhpZ2ggJiAweEZGRkY7XG4gICAgdmFyIGIxNiA9IGFkZGVuZC5sb3cgPj4+IDE2O1xuICAgIHZhciBiMDAgPSBhZGRlbmQubG93ICYgMHhGRkZGO1xuICAgIHZhciBjNDggPSAwLFxuICAgICAgICBjMzIgPSAwLFxuICAgICAgICBjMTYgPSAwLFxuICAgICAgICBjMDAgPSAwO1xuICAgIGMwMCArPSBhMDAgKyBiMDA7XG4gICAgYzE2ICs9IGMwMCA+Pj4gMTY7XG4gICAgYzAwICY9IDB4RkZGRjtcbiAgICBjMTYgKz0gYTE2ICsgYjE2O1xuICAgIGMzMiArPSBjMTYgPj4+IDE2O1xuICAgIGMxNiAmPSAweEZGRkY7XG4gICAgYzMyICs9IGEzMiArIGIzMjtcbiAgICBjNDggKz0gYzMyID4+PiAxNjtcbiAgICBjMzIgJj0gMHhGRkZGO1xuICAgIGM0OCArPSBhNDggKyBiNDg7XG4gICAgYzQ4ICY9IDB4RkZGRjtcbiAgICByZXR1cm4gZnJvbUJpdHMoYzE2IDw8IDE2IHwgYzAwLCBjNDggPDwgMTYgfCBjMzIsIHRoaXMudW5zaWduZWQpO1xuICB9O1xuICAvKipcbiAgICogUmV0dXJucyB0aGUgZGlmZmVyZW5jZSBvZiB0aGlzIGFuZCB0aGUgc3BlY2lmaWVkIExvbmcuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfSBzdWJ0cmFoZW5kIFN1YnRyYWhlbmRcbiAgICogQHJldHVybnMgeyFMb25nfSBEaWZmZXJlbmNlXG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUuc3VidHJhY3QgPSBmdW5jdGlvbiBzdWJ0cmFjdChzdWJ0cmFoZW5kKSB7XG4gICAgaWYgKCFpc0xvbmcoc3VidHJhaGVuZCkpIHN1YnRyYWhlbmQgPSBmcm9tVmFsdWUoc3VidHJhaGVuZCk7XG4gICAgcmV0dXJuIHRoaXMuYWRkKHN1YnRyYWhlbmQubmVnKCkpO1xuICB9O1xuICAvKipcbiAgICogUmV0dXJucyB0aGUgZGlmZmVyZW5jZSBvZiB0aGlzIGFuZCB0aGUgc3BlY2lmaWVkIExvbmcuIFRoaXMgaXMgYW4gYWxpYXMgb2Yge0BsaW5rIExvbmcjc3VidHJhY3R9LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfSBzdWJ0cmFoZW5kIFN1YnRyYWhlbmRcbiAgICogQHJldHVybnMgeyFMb25nfSBEaWZmZXJlbmNlXG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUuc3ViID0gTG9uZ1Byb3RvdHlwZS5zdWJ0cmFjdDtcbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHByb2R1Y3Qgb2YgdGhpcyBhbmQgdGhlIHNwZWNpZmllZCBMb25nLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ30gbXVsdGlwbGllciBNdWx0aXBsaWVyXG4gICAqIEByZXR1cm5zIHshTG9uZ30gUHJvZHVjdFxuICAgKi9cbiAgXG4gIExvbmdQcm90b3R5cGUubXVsdGlwbHkgPSBmdW5jdGlvbiBtdWx0aXBseShtdWx0aXBsaWVyKSB7XG4gICAgaWYgKHRoaXMuaXNaZXJvKCkpIHJldHVybiB0aGlzO1xuICAgIGlmICghaXNMb25nKG11bHRpcGxpZXIpKSBtdWx0aXBsaWVyID0gZnJvbVZhbHVlKG11bHRpcGxpZXIpOyAvLyB1c2Ugd2FzbSBzdXBwb3J0IGlmIHByZXNlbnRcbiAgXG4gICAgaWYgKHdhc20pIHtcbiAgICAgIHZhciBsb3cgPSB3YXNtW1wibXVsXCJdKHRoaXMubG93LCB0aGlzLmhpZ2gsIG11bHRpcGxpZXIubG93LCBtdWx0aXBsaWVyLmhpZ2gpO1xuICAgICAgcmV0dXJuIGZyb21CaXRzKGxvdywgd2FzbVtcImdldF9oaWdoXCJdKCksIHRoaXMudW5zaWduZWQpO1xuICAgIH1cbiAgXG4gICAgaWYgKG11bHRpcGxpZXIuaXNaZXJvKCkpIHJldHVybiB0aGlzLnVuc2lnbmVkID8gVVpFUk8gOiBaRVJPO1xuICAgIGlmICh0aGlzLmVxKE1JTl9WQUxVRSkpIHJldHVybiBtdWx0aXBsaWVyLmlzT2RkKCkgPyBNSU5fVkFMVUUgOiBaRVJPO1xuICAgIGlmIChtdWx0aXBsaWVyLmVxKE1JTl9WQUxVRSkpIHJldHVybiB0aGlzLmlzT2RkKCkgPyBNSU5fVkFMVUUgOiBaRVJPO1xuICBcbiAgICBpZiAodGhpcy5pc05lZ2F0aXZlKCkpIHtcbiAgICAgIGlmIChtdWx0aXBsaWVyLmlzTmVnYXRpdmUoKSkgcmV0dXJuIHRoaXMubmVnKCkubXVsKG11bHRpcGxpZXIubmVnKCkpO2Vsc2UgcmV0dXJuIHRoaXMubmVnKCkubXVsKG11bHRpcGxpZXIpLm5lZygpO1xuICAgIH0gZWxzZSBpZiAobXVsdGlwbGllci5pc05lZ2F0aXZlKCkpIHJldHVybiB0aGlzLm11bChtdWx0aXBsaWVyLm5lZygpKS5uZWcoKTsgLy8gSWYgYm90aCBsb25ncyBhcmUgc21hbGwsIHVzZSBmbG9hdCBtdWx0aXBsaWNhdGlvblxuICBcbiAgXG4gICAgaWYgKHRoaXMubHQoVFdPX1BXUl8yNCkgJiYgbXVsdGlwbGllci5sdChUV09fUFdSXzI0KSkgcmV0dXJuIGZyb21OdW1iZXIodGhpcy50b051bWJlcigpICogbXVsdGlwbGllci50b051bWJlcigpLCB0aGlzLnVuc2lnbmVkKTsgLy8gRGl2aWRlIGVhY2ggbG9uZyBpbnRvIDQgY2h1bmtzIG9mIDE2IGJpdHMsIGFuZCB0aGVuIGFkZCB1cCA0eDQgcHJvZHVjdHMuXG4gICAgLy8gV2UgY2FuIHNraXAgcHJvZHVjdHMgdGhhdCB3b3VsZCBvdmVyZmxvdy5cbiAgXG4gICAgdmFyIGE0OCA9IHRoaXMuaGlnaCA+Pj4gMTY7XG4gICAgdmFyIGEzMiA9IHRoaXMuaGlnaCAmIDB4RkZGRjtcbiAgICB2YXIgYTE2ID0gdGhpcy5sb3cgPj4+IDE2O1xuICAgIHZhciBhMDAgPSB0aGlzLmxvdyAmIDB4RkZGRjtcbiAgICB2YXIgYjQ4ID0gbXVsdGlwbGllci5oaWdoID4+PiAxNjtcbiAgICB2YXIgYjMyID0gbXVsdGlwbGllci5oaWdoICYgMHhGRkZGO1xuICAgIHZhciBiMTYgPSBtdWx0aXBsaWVyLmxvdyA+Pj4gMTY7XG4gICAgdmFyIGIwMCA9IG11bHRpcGxpZXIubG93ICYgMHhGRkZGO1xuICAgIHZhciBjNDggPSAwLFxuICAgICAgICBjMzIgPSAwLFxuICAgICAgICBjMTYgPSAwLFxuICAgICAgICBjMDAgPSAwO1xuICAgIGMwMCArPSBhMDAgKiBiMDA7XG4gICAgYzE2ICs9IGMwMCA+Pj4gMTY7XG4gICAgYzAwICY9IDB4RkZGRjtcbiAgICBjMTYgKz0gYTE2ICogYjAwO1xuICAgIGMzMiArPSBjMTYgPj4+IDE2O1xuICAgIGMxNiAmPSAweEZGRkY7XG4gICAgYzE2ICs9IGEwMCAqIGIxNjtcbiAgICBjMzIgKz0gYzE2ID4+PiAxNjtcbiAgICBjMTYgJj0gMHhGRkZGO1xuICAgIGMzMiArPSBhMzIgKiBiMDA7XG4gICAgYzQ4ICs9IGMzMiA+Pj4gMTY7XG4gICAgYzMyICY9IDB4RkZGRjtcbiAgICBjMzIgKz0gYTE2ICogYjE2O1xuICAgIGM0OCArPSBjMzIgPj4+IDE2O1xuICAgIGMzMiAmPSAweEZGRkY7XG4gICAgYzMyICs9IGEwMCAqIGIzMjtcbiAgICBjNDggKz0gYzMyID4+PiAxNjtcbiAgICBjMzIgJj0gMHhGRkZGO1xuICAgIGM0OCArPSBhNDggKiBiMDAgKyBhMzIgKiBiMTYgKyBhMTYgKiBiMzIgKyBhMDAgKiBiNDg7XG4gICAgYzQ4ICY9IDB4RkZGRjtcbiAgICByZXR1cm4gZnJvbUJpdHMoYzE2IDw8IDE2IHwgYzAwLCBjNDggPDwgMTYgfCBjMzIsIHRoaXMudW5zaWduZWQpO1xuICB9O1xuICAvKipcbiAgICogUmV0dXJucyB0aGUgcHJvZHVjdCBvZiB0aGlzIGFuZCB0aGUgc3BlY2lmaWVkIExvbmcuIFRoaXMgaXMgYW4gYWxpYXMgb2Yge0BsaW5rIExvbmcjbXVsdGlwbHl9LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfSBtdWx0aXBsaWVyIE11bHRpcGxpZXJcbiAgICogQHJldHVybnMgeyFMb25nfSBQcm9kdWN0XG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUubXVsID0gTG9uZ1Byb3RvdHlwZS5tdWx0aXBseTtcbiAgLyoqXG4gICAqIFJldHVybnMgdGhpcyBMb25nIGRpdmlkZWQgYnkgdGhlIHNwZWNpZmllZC4gVGhlIHJlc3VsdCBpcyBzaWduZWQgaWYgdGhpcyBMb25nIGlzIHNpZ25lZCBvclxuICAgKiAgdW5zaWduZWQgaWYgdGhpcyBMb25nIGlzIHVuc2lnbmVkLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ30gZGl2aXNvciBEaXZpc29yXG4gICAqIEByZXR1cm5zIHshTG9uZ30gUXVvdGllbnRcbiAgICovXG4gIFxuICBMb25nUHJvdG90eXBlLmRpdmlkZSA9IGZ1bmN0aW9uIGRpdmlkZShkaXZpc29yKSB7XG4gICAgaWYgKCFpc0xvbmcoZGl2aXNvcikpIGRpdmlzb3IgPSBmcm9tVmFsdWUoZGl2aXNvcik7XG4gICAgaWYgKGRpdmlzb3IuaXNaZXJvKCkpIHRocm93IEVycm9yKCdkaXZpc2lvbiBieSB6ZXJvJyk7IC8vIHVzZSB3YXNtIHN1cHBvcnQgaWYgcHJlc2VudFxuICBcbiAgICBpZiAod2FzbSkge1xuICAgICAgLy8gZ3VhcmQgYWdhaW5zdCBzaWduZWQgZGl2aXNpb24gb3ZlcmZsb3c6IHRoZSBsYXJnZXN0XG4gICAgICAvLyBuZWdhdGl2ZSBudW1iZXIgLyAtMSB3b3VsZCBiZSAxIGxhcmdlciB0aGFuIHRoZSBsYXJnZXN0XG4gICAgICAvLyBwb3NpdGl2ZSBudW1iZXIsIGR1ZSB0byB0d28ncyBjb21wbGVtZW50LlxuICAgICAgaWYgKCF0aGlzLnVuc2lnbmVkICYmIHRoaXMuaGlnaCA9PT0gLTB4ODAwMDAwMDAgJiYgZGl2aXNvci5sb3cgPT09IC0xICYmIGRpdmlzb3IuaGlnaCA9PT0gLTEpIHtcbiAgICAgICAgLy8gYmUgY29uc2lzdGVudCB3aXRoIG5vbi13YXNtIGNvZGUgcGF0aFxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cbiAgXG4gICAgICB2YXIgbG93ID0gKHRoaXMudW5zaWduZWQgPyB3YXNtW1wiZGl2X3VcIl0gOiB3YXNtW1wiZGl2X3NcIl0pKHRoaXMubG93LCB0aGlzLmhpZ2gsIGRpdmlzb3IubG93LCBkaXZpc29yLmhpZ2gpO1xuICAgICAgcmV0dXJuIGZyb21CaXRzKGxvdywgd2FzbVtcImdldF9oaWdoXCJdKCksIHRoaXMudW5zaWduZWQpO1xuICAgIH1cbiAgXG4gICAgaWYgKHRoaXMuaXNaZXJvKCkpIHJldHVybiB0aGlzLnVuc2lnbmVkID8gVVpFUk8gOiBaRVJPO1xuICAgIHZhciBhcHByb3gsIHJlbSwgcmVzO1xuICBcbiAgICBpZiAoIXRoaXMudW5zaWduZWQpIHtcbiAgICAgIC8vIFRoaXMgc2VjdGlvbiBpcyBvbmx5IHJlbGV2YW50IGZvciBzaWduZWQgbG9uZ3MgYW5kIGlzIGRlcml2ZWQgZnJvbSB0aGVcbiAgICAgIC8vIGNsb3N1cmUgbGlicmFyeSBhcyBhIHdob2xlLlxuICAgICAgaWYgKHRoaXMuZXEoTUlOX1ZBTFVFKSkge1xuICAgICAgICBpZiAoZGl2aXNvci5lcShPTkUpIHx8IGRpdmlzb3IuZXEoTkVHX09ORSkpIHJldHVybiBNSU5fVkFMVUU7IC8vIHJlY2FsbCB0aGF0IC1NSU5fVkFMVUUgPT0gTUlOX1ZBTFVFXG4gICAgICAgIGVsc2UgaWYgKGRpdmlzb3IuZXEoTUlOX1ZBTFVFKSkgcmV0dXJuIE9ORTtlbHNlIHtcbiAgICAgICAgICAvLyBBdCB0aGlzIHBvaW50LCB3ZSBoYXZlIHxvdGhlcnwgPj0gMiwgc28gfHRoaXMvb3RoZXJ8IDwgfE1JTl9WQUxVRXwuXG4gICAgICAgICAgdmFyIGhhbGZUaGlzID0gdGhpcy5zaHIoMSk7XG4gICAgICAgICAgYXBwcm94ID0gaGFsZlRoaXMuZGl2KGRpdmlzb3IpLnNobCgxKTtcbiAgXG4gICAgICAgICAgaWYgKGFwcHJveC5lcShaRVJPKSkge1xuICAgICAgICAgICAgcmV0dXJuIGRpdmlzb3IuaXNOZWdhdGl2ZSgpID8gT05FIDogTkVHX09ORTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVtID0gdGhpcy5zdWIoZGl2aXNvci5tdWwoYXBwcm94KSk7XG4gICAgICAgICAgICByZXMgPSBhcHByb3guYWRkKHJlbS5kaXYoZGl2aXNvcikpO1xuICAgICAgICAgICAgcmV0dXJuIHJlcztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoZGl2aXNvci5lcShNSU5fVkFMVUUpKSByZXR1cm4gdGhpcy51bnNpZ25lZCA/IFVaRVJPIDogWkVSTztcbiAgXG4gICAgICBpZiAodGhpcy5pc05lZ2F0aXZlKCkpIHtcbiAgICAgICAgaWYgKGRpdmlzb3IuaXNOZWdhdGl2ZSgpKSByZXR1cm4gdGhpcy5uZWcoKS5kaXYoZGl2aXNvci5uZWcoKSk7XG4gICAgICAgIHJldHVybiB0aGlzLm5lZygpLmRpdihkaXZpc29yKS5uZWcoKTtcbiAgICAgIH0gZWxzZSBpZiAoZGl2aXNvci5pc05lZ2F0aXZlKCkpIHJldHVybiB0aGlzLmRpdihkaXZpc29yLm5lZygpKS5uZWcoKTtcbiAgXG4gICAgICByZXMgPSBaRVJPO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBUaGUgYWxnb3JpdGhtIGJlbG93IGhhcyBub3QgYmVlbiBtYWRlIGZvciB1bnNpZ25lZCBsb25ncy4gSXQncyB0aGVyZWZvcmVcbiAgICAgIC8vIHJlcXVpcmVkIHRvIHRha2Ugc3BlY2lhbCBjYXJlIG9mIHRoZSBNU0IgcHJpb3IgdG8gcnVubmluZyBpdC5cbiAgICAgIGlmICghZGl2aXNvci51bnNpZ25lZCkgZGl2aXNvciA9IGRpdmlzb3IudG9VbnNpZ25lZCgpO1xuICAgICAgaWYgKGRpdmlzb3IuZ3QodGhpcykpIHJldHVybiBVWkVSTztcbiAgICAgIGlmIChkaXZpc29yLmd0KHRoaXMuc2hydSgxKSkpIC8vIDE1ID4+PiAxID0gNyA7IHdpdGggZGl2aXNvciA9IDggOyB0cnVlXG4gICAgICAgIHJldHVybiBVT05FO1xuICAgICAgcmVzID0gVVpFUk87XG4gICAgfSAvLyBSZXBlYXQgdGhlIGZvbGxvd2luZyB1bnRpbCB0aGUgcmVtYWluZGVyIGlzIGxlc3MgdGhhbiBvdGhlcjogIGZpbmQgYVxuICAgIC8vIGZsb2F0aW5nLXBvaW50IHRoYXQgYXBwcm94aW1hdGVzIHJlbWFpbmRlciAvIG90aGVyICpmcm9tIGJlbG93KiwgYWRkIHRoaXNcbiAgICAvLyBpbnRvIHRoZSByZXN1bHQsIGFuZCBzdWJ0cmFjdCBpdCBmcm9tIHRoZSByZW1haW5kZXIuICBJdCBpcyBjcml0aWNhbCB0aGF0XG4gICAgLy8gdGhlIGFwcHJveGltYXRlIHZhbHVlIGlzIGxlc3MgdGhhbiBvciBlcXVhbCB0byB0aGUgcmVhbCB2YWx1ZSBzbyB0aGF0IHRoZVxuICAgIC8vIHJlbWFpbmRlciBuZXZlciBiZWNvbWVzIG5lZ2F0aXZlLlxuICBcbiAgXG4gICAgcmVtID0gdGhpcztcbiAgXG4gICAgd2hpbGUgKHJlbS5ndGUoZGl2aXNvcikpIHtcbiAgICAgIC8vIEFwcHJveGltYXRlIHRoZSByZXN1bHQgb2YgZGl2aXNpb24uIFRoaXMgbWF5IGJlIGEgbGl0dGxlIGdyZWF0ZXIgb3JcbiAgICAgIC8vIHNtYWxsZXIgdGhhbiB0aGUgYWN0dWFsIHZhbHVlLlxuICAgICAgYXBwcm94ID0gTWF0aC5tYXgoMSwgTWF0aC5mbG9vcihyZW0udG9OdW1iZXIoKSAvIGRpdmlzb3IudG9OdW1iZXIoKSkpOyAvLyBXZSB3aWxsIHR3ZWFrIHRoZSBhcHByb3hpbWF0ZSByZXN1bHQgYnkgY2hhbmdpbmcgaXQgaW4gdGhlIDQ4LXRoIGRpZ2l0IG9yXG4gICAgICAvLyB0aGUgc21hbGxlc3Qgbm9uLWZyYWN0aW9uYWwgZGlnaXQsIHdoaWNoZXZlciBpcyBsYXJnZXIuXG4gIFxuICAgICAgdmFyIGxvZzIgPSBNYXRoLmNlaWwoTWF0aC5sb2coYXBwcm94KSAvIE1hdGguTE4yKSxcbiAgICAgICAgICBkZWx0YSA9IGxvZzIgPD0gNDggPyAxIDogcG93X2RibCgyLCBsb2cyIC0gNDgpLFxuICAgICAgICAgIC8vIERlY3JlYXNlIHRoZSBhcHByb3hpbWF0aW9uIHVudGlsIGl0IGlzIHNtYWxsZXIgdGhhbiB0aGUgcmVtYWluZGVyLiAgTm90ZVxuICAgICAgLy8gdGhhdCBpZiBpdCBpcyB0b28gbGFyZ2UsIHRoZSBwcm9kdWN0IG92ZXJmbG93cyBhbmQgaXMgbmVnYXRpdmUuXG4gICAgICBhcHByb3hSZXMgPSBmcm9tTnVtYmVyKGFwcHJveCksXG4gICAgICAgICAgYXBwcm94UmVtID0gYXBwcm94UmVzLm11bChkaXZpc29yKTtcbiAgXG4gICAgICB3aGlsZSAoYXBwcm94UmVtLmlzTmVnYXRpdmUoKSB8fCBhcHByb3hSZW0uZ3QocmVtKSkge1xuICAgICAgICBhcHByb3ggLT0gZGVsdGE7XG4gICAgICAgIGFwcHJveFJlcyA9IGZyb21OdW1iZXIoYXBwcm94LCB0aGlzLnVuc2lnbmVkKTtcbiAgICAgICAgYXBwcm94UmVtID0gYXBwcm94UmVzLm11bChkaXZpc29yKTtcbiAgICAgIH0gLy8gV2Uga25vdyB0aGUgYW5zd2VyIGNhbid0IGJlIHplcm8uLi4gYW5kIGFjdHVhbGx5LCB6ZXJvIHdvdWxkIGNhdXNlXG4gICAgICAvLyBpbmZpbml0ZSByZWN1cnNpb24gc2luY2Ugd2Ugd291bGQgbWFrZSBubyBwcm9ncmVzcy5cbiAgXG4gIFxuICAgICAgaWYgKGFwcHJveFJlcy5pc1plcm8oKSkgYXBwcm94UmVzID0gT05FO1xuICAgICAgcmVzID0gcmVzLmFkZChhcHByb3hSZXMpO1xuICAgICAgcmVtID0gcmVtLnN1YihhcHByb3hSZW0pO1xuICAgIH1cbiAgXG4gICAgcmV0dXJuIHJlcztcbiAgfTtcbiAgLyoqXG4gICAqIFJldHVybnMgdGhpcyBMb25nIGRpdmlkZWQgYnkgdGhlIHNwZWNpZmllZC4gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgTG9uZyNkaXZpZGV9LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfSBkaXZpc29yIERpdmlzb3JcbiAgICogQHJldHVybnMgeyFMb25nfSBRdW90aWVudFxuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLmRpdiA9IExvbmdQcm90b3R5cGUuZGl2aWRlO1xuICAvKipcbiAgICogUmV0dXJucyB0aGlzIExvbmcgbW9kdWxvIHRoZSBzcGVjaWZpZWQuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfSBkaXZpc29yIERpdmlzb3JcbiAgICogQHJldHVybnMgeyFMb25nfSBSZW1haW5kZXJcbiAgICovXG4gIFxuICBMb25nUHJvdG90eXBlLm1vZHVsbyA9IGZ1bmN0aW9uIG1vZHVsbyhkaXZpc29yKSB7XG4gICAgaWYgKCFpc0xvbmcoZGl2aXNvcikpIGRpdmlzb3IgPSBmcm9tVmFsdWUoZGl2aXNvcik7IC8vIHVzZSB3YXNtIHN1cHBvcnQgaWYgcHJlc2VudFxuICBcbiAgICBpZiAod2FzbSkge1xuICAgICAgdmFyIGxvdyA9ICh0aGlzLnVuc2lnbmVkID8gd2FzbVtcInJlbV91XCJdIDogd2FzbVtcInJlbV9zXCJdKSh0aGlzLmxvdywgdGhpcy5oaWdoLCBkaXZpc29yLmxvdywgZGl2aXNvci5oaWdoKTtcbiAgICAgIHJldHVybiBmcm9tQml0cyhsb3csIHdhc21bXCJnZXRfaGlnaFwiXSgpLCB0aGlzLnVuc2lnbmVkKTtcbiAgICB9XG4gIFxuICAgIHJldHVybiB0aGlzLnN1Yih0aGlzLmRpdihkaXZpc29yKS5tdWwoZGl2aXNvcikpO1xuICB9O1xuICAvKipcbiAgICogUmV0dXJucyB0aGlzIExvbmcgbW9kdWxvIHRoZSBzcGVjaWZpZWQuIFRoaXMgaXMgYW4gYWxpYXMgb2Yge0BsaW5rIExvbmcjbW9kdWxvfS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ30gZGl2aXNvciBEaXZpc29yXG4gICAqIEByZXR1cm5zIHshTG9uZ30gUmVtYWluZGVyXG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUubW9kID0gTG9uZ1Byb3RvdHlwZS5tb2R1bG87XG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoaXMgTG9uZyBtb2R1bG8gdGhlIHNwZWNpZmllZC4gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgTG9uZyNtb2R1bG99LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfSBkaXZpc29yIERpdmlzb3JcbiAgICogQHJldHVybnMgeyFMb25nfSBSZW1haW5kZXJcbiAgICovXG4gIFxuICBMb25nUHJvdG90eXBlLnJlbSA9IExvbmdQcm90b3R5cGUubW9kdWxvO1xuICAvKipcbiAgICogUmV0dXJucyB0aGUgYml0d2lzZSBOT1Qgb2YgdGhpcyBMb25nLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEByZXR1cm5zIHshTG9uZ31cbiAgICovXG4gIFxuICBMb25nUHJvdG90eXBlLm5vdCA9IGZ1bmN0aW9uIG5vdCgpIHtcbiAgICByZXR1cm4gZnJvbUJpdHMofnRoaXMubG93LCB+dGhpcy5oaWdoLCB0aGlzLnVuc2lnbmVkKTtcbiAgfTtcbiAgLyoqXG4gICAqIFJldHVybnMgY291bnQgbGVhZGluZyB6ZXJvcyBvZiB0aGlzIExvbmcuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHJldHVybnMgeyFudW1iZXJ9XG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUuY291bnRMZWFkaW5nWmVyb3MgPSBmdW5jdGlvbiBjb3VudExlYWRpbmdaZXJvcygpIHtcbiAgICByZXR1cm4gdGhpcy5oaWdoID8gTWF0aC5jbHozMih0aGlzLmhpZ2gpIDogTWF0aC5jbHozMih0aGlzLmxvdykgKyAzMjtcbiAgfTtcbiAgLyoqXG4gICAqIFJldHVybnMgY291bnQgbGVhZGluZyB6ZXJvcy4gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgTG9uZyNjb3VudExlYWRpbmdaZXJvc30uXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0geyFMb25nfVxuICAgKiBAcmV0dXJucyB7IW51bWJlcn1cbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5jbHogPSBMb25nUHJvdG90eXBlLmNvdW50TGVhZGluZ1plcm9zO1xuICAvKipcbiAgICogUmV0dXJucyBjb3VudCB0cmFpbGluZyB6ZXJvcyBvZiB0aGlzIExvbmcuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHJldHVybnMgeyFudW1iZXJ9XG4gICAqL1xuICBcbiAgTG9uZ1Byb3RvdHlwZS5jb3VudFRyYWlsaW5nWmVyb3MgPSBmdW5jdGlvbiBjb3VudFRyYWlsaW5nWmVyb3MoKSB7XG4gICAgcmV0dXJuIHRoaXMubG93ID8gY3R6MzIodGhpcy5sb3cpIDogY3R6MzIodGhpcy5oaWdoKSArIDMyO1xuICB9O1xuICAvKipcbiAgICogUmV0dXJucyBjb3VudCB0cmFpbGluZyB6ZXJvcy4gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgTG9uZyNjb3VudFRyYWlsaW5nWmVyb3N9LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHshTG9uZ31cbiAgICogQHJldHVybnMgeyFudW1iZXJ9XG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUuY3R6ID0gTG9uZ1Byb3RvdHlwZS5jb3VudFRyYWlsaW5nWmVyb3M7XG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBiaXR3aXNlIEFORCBvZiB0aGlzIExvbmcgYW5kIHRoZSBzcGVjaWZpZWQuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfSBvdGhlciBPdGhlciBMb25nXG4gICAqIEByZXR1cm5zIHshTG9uZ31cbiAgICovXG4gIFxuICBMb25nUHJvdG90eXBlLmFuZCA9IGZ1bmN0aW9uIGFuZChvdGhlcikge1xuICAgIGlmICghaXNMb25nKG90aGVyKSkgb3RoZXIgPSBmcm9tVmFsdWUob3RoZXIpO1xuICAgIHJldHVybiBmcm9tQml0cyh0aGlzLmxvdyAmIG90aGVyLmxvdywgdGhpcy5oaWdoICYgb3RoZXIuaGlnaCwgdGhpcy51bnNpZ25lZCk7XG4gIH07XG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBiaXR3aXNlIE9SIG9mIHRoaXMgTG9uZyBhbmQgdGhlIHNwZWNpZmllZC5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxzdHJpbmd9IG90aGVyIE90aGVyIExvbmdcbiAgICogQHJldHVybnMgeyFMb25nfVxuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLm9yID0gZnVuY3Rpb24gb3Iob3RoZXIpIHtcbiAgICBpZiAoIWlzTG9uZyhvdGhlcikpIG90aGVyID0gZnJvbVZhbHVlKG90aGVyKTtcbiAgICByZXR1cm4gZnJvbUJpdHModGhpcy5sb3cgfCBvdGhlci5sb3csIHRoaXMuaGlnaCB8IG90aGVyLmhpZ2gsIHRoaXMudW5zaWduZWQpO1xuICB9O1xuICAvKipcbiAgICogUmV0dXJucyB0aGUgYml0d2lzZSBYT1Igb2YgdGhpcyBMb25nIGFuZCB0aGUgZ2l2ZW4gb25lLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ30gb3RoZXIgT3RoZXIgTG9uZ1xuICAgKiBAcmV0dXJucyB7IUxvbmd9XG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUueG9yID0gZnVuY3Rpb24geG9yKG90aGVyKSB7XG4gICAgaWYgKCFpc0xvbmcob3RoZXIpKSBvdGhlciA9IGZyb21WYWx1ZShvdGhlcik7XG4gICAgcmV0dXJuIGZyb21CaXRzKHRoaXMubG93IF4gb3RoZXIubG93LCB0aGlzLmhpZ2ggXiBvdGhlci5oaWdoLCB0aGlzLnVuc2lnbmVkKTtcbiAgfTtcbiAgLyoqXG4gICAqIFJldHVybnMgdGhpcyBMb25nIHdpdGggYml0cyBzaGlmdGVkIHRvIHRoZSBsZWZ0IGJ5IHRoZSBnaXZlbiBhbW91bnQuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHBhcmFtIHtudW1iZXJ8IUxvbmd9IG51bUJpdHMgTnVtYmVyIG9mIGJpdHNcbiAgICogQHJldHVybnMgeyFMb25nfSBTaGlmdGVkIExvbmdcbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5zaGlmdExlZnQgPSBmdW5jdGlvbiBzaGlmdExlZnQobnVtQml0cykge1xuICAgIGlmIChpc0xvbmcobnVtQml0cykpIG51bUJpdHMgPSBudW1CaXRzLnRvSW50KCk7XG4gICAgaWYgKChudW1CaXRzICY9IDYzKSA9PT0gMCkgcmV0dXJuIHRoaXM7ZWxzZSBpZiAobnVtQml0cyA8IDMyKSByZXR1cm4gZnJvbUJpdHModGhpcy5sb3cgPDwgbnVtQml0cywgdGhpcy5oaWdoIDw8IG51bUJpdHMgfCB0aGlzLmxvdyA+Pj4gMzIgLSBudW1CaXRzLCB0aGlzLnVuc2lnbmVkKTtlbHNlIHJldHVybiBmcm9tQml0cygwLCB0aGlzLmxvdyA8PCBudW1CaXRzIC0gMzIsIHRoaXMudW5zaWduZWQpO1xuICB9O1xuICAvKipcbiAgICogUmV0dXJucyB0aGlzIExvbmcgd2l0aCBiaXRzIHNoaWZ0ZWQgdG8gdGhlIGxlZnQgYnkgdGhlIGdpdmVuIGFtb3VudC4gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgTG9uZyNzaGlmdExlZnR9LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHtudW1iZXJ8IUxvbmd9IG51bUJpdHMgTnVtYmVyIG9mIGJpdHNcbiAgICogQHJldHVybnMgeyFMb25nfSBTaGlmdGVkIExvbmdcbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5zaGwgPSBMb25nUHJvdG90eXBlLnNoaWZ0TGVmdDtcbiAgLyoqXG4gICAqIFJldHVybnMgdGhpcyBMb25nIHdpdGggYml0cyBhcml0aG1ldGljYWxseSBzaGlmdGVkIHRvIHRoZSByaWdodCBieSB0aGUgZ2l2ZW4gYW1vdW50LlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEBwYXJhbSB7bnVtYmVyfCFMb25nfSBudW1CaXRzIE51bWJlciBvZiBiaXRzXG4gICAqIEByZXR1cm5zIHshTG9uZ30gU2hpZnRlZCBMb25nXG4gICAqL1xuICBcbiAgTG9uZ1Byb3RvdHlwZS5zaGlmdFJpZ2h0ID0gZnVuY3Rpb24gc2hpZnRSaWdodChudW1CaXRzKSB7XG4gICAgaWYgKGlzTG9uZyhudW1CaXRzKSkgbnVtQml0cyA9IG51bUJpdHMudG9JbnQoKTtcbiAgICBpZiAoKG51bUJpdHMgJj0gNjMpID09PSAwKSByZXR1cm4gdGhpcztlbHNlIGlmIChudW1CaXRzIDwgMzIpIHJldHVybiBmcm9tQml0cyh0aGlzLmxvdyA+Pj4gbnVtQml0cyB8IHRoaXMuaGlnaCA8PCAzMiAtIG51bUJpdHMsIHRoaXMuaGlnaCA+PiBudW1CaXRzLCB0aGlzLnVuc2lnbmVkKTtlbHNlIHJldHVybiBmcm9tQml0cyh0aGlzLmhpZ2ggPj4gbnVtQml0cyAtIDMyLCB0aGlzLmhpZ2ggPj0gMCA/IDAgOiAtMSwgdGhpcy51bnNpZ25lZCk7XG4gIH07XG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoaXMgTG9uZyB3aXRoIGJpdHMgYXJpdGhtZXRpY2FsbHkgc2hpZnRlZCB0byB0aGUgcmlnaHQgYnkgdGhlIGdpdmVuIGFtb3VudC4gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgTG9uZyNzaGlmdFJpZ2h0fS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7bnVtYmVyfCFMb25nfSBudW1CaXRzIE51bWJlciBvZiBiaXRzXG4gICAqIEByZXR1cm5zIHshTG9uZ30gU2hpZnRlZCBMb25nXG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUuc2hyID0gTG9uZ1Byb3RvdHlwZS5zaGlmdFJpZ2h0O1xuICAvKipcbiAgICogUmV0dXJucyB0aGlzIExvbmcgd2l0aCBiaXRzIGxvZ2ljYWxseSBzaGlmdGVkIHRvIHRoZSByaWdodCBieSB0aGUgZ2l2ZW4gYW1vdW50LlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEBwYXJhbSB7bnVtYmVyfCFMb25nfSBudW1CaXRzIE51bWJlciBvZiBiaXRzXG4gICAqIEByZXR1cm5zIHshTG9uZ30gU2hpZnRlZCBMb25nXG4gICAqL1xuICBcbiAgTG9uZ1Byb3RvdHlwZS5zaGlmdFJpZ2h0VW5zaWduZWQgPSBmdW5jdGlvbiBzaGlmdFJpZ2h0VW5zaWduZWQobnVtQml0cykge1xuICAgIGlmIChpc0xvbmcobnVtQml0cykpIG51bUJpdHMgPSBudW1CaXRzLnRvSW50KCk7XG4gICAgaWYgKChudW1CaXRzICY9IDYzKSA9PT0gMCkgcmV0dXJuIHRoaXM7XG4gICAgaWYgKG51bUJpdHMgPCAzMikgcmV0dXJuIGZyb21CaXRzKHRoaXMubG93ID4+PiBudW1CaXRzIHwgdGhpcy5oaWdoIDw8IDMyIC0gbnVtQml0cywgdGhpcy5oaWdoID4+PiBudW1CaXRzLCB0aGlzLnVuc2lnbmVkKTtcbiAgICBpZiAobnVtQml0cyA9PT0gMzIpIHJldHVybiBmcm9tQml0cyh0aGlzLmhpZ2gsIDAsIHRoaXMudW5zaWduZWQpO1xuICAgIHJldHVybiBmcm9tQml0cyh0aGlzLmhpZ2ggPj4+IG51bUJpdHMgLSAzMiwgMCwgdGhpcy51bnNpZ25lZCk7XG4gIH07XG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoaXMgTG9uZyB3aXRoIGJpdHMgbG9naWNhbGx5IHNoaWZ0ZWQgdG8gdGhlIHJpZ2h0IGJ5IHRoZSBnaXZlbiBhbW91bnQuIFRoaXMgaXMgYW4gYWxpYXMgb2Yge0BsaW5rIExvbmcjc2hpZnRSaWdodFVuc2lnbmVkfS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7bnVtYmVyfCFMb25nfSBudW1CaXRzIE51bWJlciBvZiBiaXRzXG4gICAqIEByZXR1cm5zIHshTG9uZ30gU2hpZnRlZCBMb25nXG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUuc2hydSA9IExvbmdQcm90b3R5cGUuc2hpZnRSaWdodFVuc2lnbmVkO1xuICAvKipcbiAgICogUmV0dXJucyB0aGlzIExvbmcgd2l0aCBiaXRzIGxvZ2ljYWxseSBzaGlmdGVkIHRvIHRoZSByaWdodCBieSB0aGUgZ2l2ZW4gYW1vdW50LiBUaGlzIGlzIGFuIGFsaWFzIG9mIHtAbGluayBMb25nI3NoaWZ0UmlnaHRVbnNpZ25lZH0uXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0ge251bWJlcnwhTG9uZ30gbnVtQml0cyBOdW1iZXIgb2YgYml0c1xuICAgKiBAcmV0dXJucyB7IUxvbmd9IFNoaWZ0ZWQgTG9uZ1xuICAgKi9cbiAgXG4gIExvbmdQcm90b3R5cGUuc2hyX3UgPSBMb25nUHJvdG90eXBlLnNoaWZ0UmlnaHRVbnNpZ25lZDtcbiAgLyoqXG4gICAqIFJldHVybnMgdGhpcyBMb25nIHdpdGggYml0cyByb3RhdGVkIHRvIHRoZSBsZWZ0IGJ5IHRoZSBnaXZlbiBhbW91bnQuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHBhcmFtIHtudW1iZXJ8IUxvbmd9IG51bUJpdHMgTnVtYmVyIG9mIGJpdHNcbiAgICogQHJldHVybnMgeyFMb25nfSBSb3RhdGVkIExvbmdcbiAgICovXG4gIFxuICBMb25nUHJvdG90eXBlLnJvdGF0ZUxlZnQgPSBmdW5jdGlvbiByb3RhdGVMZWZ0KG51bUJpdHMpIHtcbiAgICB2YXIgYjtcbiAgICBpZiAoaXNMb25nKG51bUJpdHMpKSBudW1CaXRzID0gbnVtQml0cy50b0ludCgpO1xuICAgIGlmICgobnVtQml0cyAmPSA2MykgPT09IDApIHJldHVybiB0aGlzO1xuICAgIGlmIChudW1CaXRzID09PSAzMikgcmV0dXJuIGZyb21CaXRzKHRoaXMuaGlnaCwgdGhpcy5sb3csIHRoaXMudW5zaWduZWQpO1xuICBcbiAgICBpZiAobnVtQml0cyA8IDMyKSB7XG4gICAgICBiID0gMzIgLSBudW1CaXRzO1xuICAgICAgcmV0dXJuIGZyb21CaXRzKHRoaXMubG93IDw8IG51bUJpdHMgfCB0aGlzLmhpZ2ggPj4+IGIsIHRoaXMuaGlnaCA8PCBudW1CaXRzIHwgdGhpcy5sb3cgPj4+IGIsIHRoaXMudW5zaWduZWQpO1xuICAgIH1cbiAgXG4gICAgbnVtQml0cyAtPSAzMjtcbiAgICBiID0gMzIgLSBudW1CaXRzO1xuICAgIHJldHVybiBmcm9tQml0cyh0aGlzLmhpZ2ggPDwgbnVtQml0cyB8IHRoaXMubG93ID4+PiBiLCB0aGlzLmxvdyA8PCBudW1CaXRzIHwgdGhpcy5oaWdoID4+PiBiLCB0aGlzLnVuc2lnbmVkKTtcbiAgfTtcbiAgLyoqXG4gICAqIFJldHVybnMgdGhpcyBMb25nIHdpdGggYml0cyByb3RhdGVkIHRvIHRoZSBsZWZ0IGJ5IHRoZSBnaXZlbiBhbW91bnQuIFRoaXMgaXMgYW4gYWxpYXMgb2Yge0BsaW5rIExvbmcjcm90YXRlTGVmdH0uXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0ge251bWJlcnwhTG9uZ30gbnVtQml0cyBOdW1iZXIgb2YgYml0c1xuICAgKiBAcmV0dXJucyB7IUxvbmd9IFJvdGF0ZWQgTG9uZ1xuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLnJvdGwgPSBMb25nUHJvdG90eXBlLnJvdGF0ZUxlZnQ7XG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoaXMgTG9uZyB3aXRoIGJpdHMgcm90YXRlZCB0byB0aGUgcmlnaHQgYnkgdGhlIGdpdmVuIGFtb3VudC5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcGFyYW0ge251bWJlcnwhTG9uZ30gbnVtQml0cyBOdW1iZXIgb2YgYml0c1xuICAgKiBAcmV0dXJucyB7IUxvbmd9IFJvdGF0ZWQgTG9uZ1xuICAgKi9cbiAgXG4gIExvbmdQcm90b3R5cGUucm90YXRlUmlnaHQgPSBmdW5jdGlvbiByb3RhdGVSaWdodChudW1CaXRzKSB7XG4gICAgdmFyIGI7XG4gICAgaWYgKGlzTG9uZyhudW1CaXRzKSkgbnVtQml0cyA9IG51bUJpdHMudG9JbnQoKTtcbiAgICBpZiAoKG51bUJpdHMgJj0gNjMpID09PSAwKSByZXR1cm4gdGhpcztcbiAgICBpZiAobnVtQml0cyA9PT0gMzIpIHJldHVybiBmcm9tQml0cyh0aGlzLmhpZ2gsIHRoaXMubG93LCB0aGlzLnVuc2lnbmVkKTtcbiAgXG4gICAgaWYgKG51bUJpdHMgPCAzMikge1xuICAgICAgYiA9IDMyIC0gbnVtQml0cztcbiAgICAgIHJldHVybiBmcm9tQml0cyh0aGlzLmhpZ2ggPDwgYiB8IHRoaXMubG93ID4+PiBudW1CaXRzLCB0aGlzLmxvdyA8PCBiIHwgdGhpcy5oaWdoID4+PiBudW1CaXRzLCB0aGlzLnVuc2lnbmVkKTtcbiAgICB9XG4gIFxuICAgIG51bUJpdHMgLT0gMzI7XG4gICAgYiA9IDMyIC0gbnVtQml0cztcbiAgICByZXR1cm4gZnJvbUJpdHModGhpcy5sb3cgPDwgYiB8IHRoaXMuaGlnaCA+Pj4gbnVtQml0cywgdGhpcy5oaWdoIDw8IGIgfCB0aGlzLmxvdyA+Pj4gbnVtQml0cywgdGhpcy51bnNpZ25lZCk7XG4gIH07XG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoaXMgTG9uZyB3aXRoIGJpdHMgcm90YXRlZCB0byB0aGUgcmlnaHQgYnkgdGhlIGdpdmVuIGFtb3VudC4gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgTG9uZyNyb3RhdGVSaWdodH0uXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0ge251bWJlcnwhTG9uZ30gbnVtQml0cyBOdW1iZXIgb2YgYml0c1xuICAgKiBAcmV0dXJucyB7IUxvbmd9IFJvdGF0ZWQgTG9uZ1xuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLnJvdHIgPSBMb25nUHJvdG90eXBlLnJvdGF0ZVJpZ2h0O1xuICAvKipcbiAgICogQ29udmVydHMgdGhpcyBMb25nIHRvIHNpZ25lZC5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcmV0dXJucyB7IUxvbmd9IFNpZ25lZCBsb25nXG4gICAqL1xuICBcbiAgTG9uZ1Byb3RvdHlwZS50b1NpZ25lZCA9IGZ1bmN0aW9uIHRvU2lnbmVkKCkge1xuICAgIGlmICghdGhpcy51bnNpZ25lZCkgcmV0dXJuIHRoaXM7XG4gICAgcmV0dXJuIGZyb21CaXRzKHRoaXMubG93LCB0aGlzLmhpZ2gsIGZhbHNlKTtcbiAgfTtcbiAgLyoqXG4gICAqIENvbnZlcnRzIHRoaXMgTG9uZyB0byB1bnNpZ25lZC5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcmV0dXJucyB7IUxvbmd9IFVuc2lnbmVkIGxvbmdcbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS50b1Vuc2lnbmVkID0gZnVuY3Rpb24gdG9VbnNpZ25lZCgpIHtcbiAgICBpZiAodGhpcy51bnNpZ25lZCkgcmV0dXJuIHRoaXM7XG4gICAgcmV0dXJuIGZyb21CaXRzKHRoaXMubG93LCB0aGlzLmhpZ2gsIHRydWUpO1xuICB9O1xuICAvKipcbiAgICogQ29udmVydHMgdGhpcyBMb25nIHRvIGl0cyBieXRlIHJlcHJlc2VudGF0aW9uLlxuICAgKiBAcGFyYW0ge2Jvb2xlYW49fSBsZSBXaGV0aGVyIGxpdHRsZSBvciBiaWcgZW5kaWFuLCBkZWZhdWx0cyB0byBiaWcgZW5kaWFuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHJldHVybnMgeyFBcnJheS48bnVtYmVyPn0gQnl0ZSByZXByZXNlbnRhdGlvblxuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLnRvQnl0ZXMgPSBmdW5jdGlvbiB0b0J5dGVzKGxlKSB7XG4gICAgcmV0dXJuIGxlID8gdGhpcy50b0J5dGVzTEUoKSA6IHRoaXMudG9CeXRlc0JFKCk7XG4gIH07XG4gIC8qKlxuICAgKiBDb252ZXJ0cyB0aGlzIExvbmcgdG8gaXRzIGxpdHRsZSBlbmRpYW4gYnl0ZSByZXByZXNlbnRhdGlvbi5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcmV0dXJucyB7IUFycmF5LjxudW1iZXI+fSBMaXR0bGUgZW5kaWFuIGJ5dGUgcmVwcmVzZW50YXRpb25cbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS50b0J5dGVzTEUgPSBmdW5jdGlvbiB0b0J5dGVzTEUoKSB7XG4gICAgdmFyIGhpID0gdGhpcy5oaWdoLFxuICAgICAgICBsbyA9IHRoaXMubG93O1xuICAgIHJldHVybiBbbG8gJiAweGZmLCBsbyA+Pj4gOCAmIDB4ZmYsIGxvID4+PiAxNiAmIDB4ZmYsIGxvID4+PiAyNCwgaGkgJiAweGZmLCBoaSA+Pj4gOCAmIDB4ZmYsIGhpID4+PiAxNiAmIDB4ZmYsIGhpID4+PiAyNF07XG4gIH07XG4gIC8qKlxuICAgKiBDb252ZXJ0cyB0aGlzIExvbmcgdG8gaXRzIGJpZyBlbmRpYW4gYnl0ZSByZXByZXNlbnRhdGlvbi5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcmV0dXJucyB7IUFycmF5LjxudW1iZXI+fSBCaWcgZW5kaWFuIGJ5dGUgcmVwcmVzZW50YXRpb25cbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS50b0J5dGVzQkUgPSBmdW5jdGlvbiB0b0J5dGVzQkUoKSB7XG4gICAgdmFyIGhpID0gdGhpcy5oaWdoLFxuICAgICAgICBsbyA9IHRoaXMubG93O1xuICAgIHJldHVybiBbaGkgPj4+IDI0LCBoaSA+Pj4gMTYgJiAweGZmLCBoaSA+Pj4gOCAmIDB4ZmYsIGhpICYgMHhmZiwgbG8gPj4+IDI0LCBsbyA+Pj4gMTYgJiAweGZmLCBsbyA+Pj4gOCAmIDB4ZmYsIGxvICYgMHhmZl07XG4gIH07XG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgTG9uZyBmcm9tIGl0cyBieXRlIHJlcHJlc2VudGF0aW9uLlxuICAgKiBAcGFyYW0geyFBcnJheS48bnVtYmVyPn0gYnl0ZXMgQnl0ZSByZXByZXNlbnRhdGlvblxuICAgKiBAcGFyYW0ge2Jvb2xlYW49fSB1bnNpZ25lZCBXaGV0aGVyIHVuc2lnbmVkIG9yIG5vdCwgZGVmYXVsdHMgdG8gc2lnbmVkXG4gICAqIEBwYXJhbSB7Ym9vbGVhbj19IGxlIFdoZXRoZXIgbGl0dGxlIG9yIGJpZyBlbmRpYW4sIGRlZmF1bHRzIHRvIGJpZyBlbmRpYW5cbiAgICogQHJldHVybnMge0xvbmd9IFRoZSBjb3JyZXNwb25kaW5nIExvbmcgdmFsdWVcbiAgICovXG4gIFxuICBcbiAgTG9uZy5mcm9tQnl0ZXMgPSBmdW5jdGlvbiBmcm9tQnl0ZXMoYnl0ZXMsIHVuc2lnbmVkLCBsZSkge1xuICAgIHJldHVybiBsZSA/IExvbmcuZnJvbUJ5dGVzTEUoYnl0ZXMsIHVuc2lnbmVkKSA6IExvbmcuZnJvbUJ5dGVzQkUoYnl0ZXMsIHVuc2lnbmVkKTtcbiAgfTtcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBMb25nIGZyb20gaXRzIGxpdHRsZSBlbmRpYW4gYnl0ZSByZXByZXNlbnRhdGlvbi5cbiAgICogQHBhcmFtIHshQXJyYXkuPG51bWJlcj59IGJ5dGVzIExpdHRsZSBlbmRpYW4gYnl0ZSByZXByZXNlbnRhdGlvblxuICAgKiBAcGFyYW0ge2Jvb2xlYW49fSB1bnNpZ25lZCBXaGV0aGVyIHVuc2lnbmVkIG9yIG5vdCwgZGVmYXVsdHMgdG8gc2lnbmVkXG4gICAqIEByZXR1cm5zIHtMb25nfSBUaGUgY29ycmVzcG9uZGluZyBMb25nIHZhbHVlXG4gICAqL1xuICBcbiAgXG4gIExvbmcuZnJvbUJ5dGVzTEUgPSBmdW5jdGlvbiBmcm9tQnl0ZXNMRShieXRlcywgdW5zaWduZWQpIHtcbiAgICByZXR1cm4gbmV3IExvbmcoYnl0ZXNbMF0gfCBieXRlc1sxXSA8PCA4IHwgYnl0ZXNbMl0gPDwgMTYgfCBieXRlc1szXSA8PCAyNCwgYnl0ZXNbNF0gfCBieXRlc1s1XSA8PCA4IHwgYnl0ZXNbNl0gPDwgMTYgfCBieXRlc1s3XSA8PCAyNCwgdW5zaWduZWQpO1xuICB9O1xuICAvKipcbiAgICogQ3JlYXRlcyBhIExvbmcgZnJvbSBpdHMgYmlnIGVuZGlhbiBieXRlIHJlcHJlc2VudGF0aW9uLlxuICAgKiBAcGFyYW0geyFBcnJheS48bnVtYmVyPn0gYnl0ZXMgQmlnIGVuZGlhbiBieXRlIHJlcHJlc2VudGF0aW9uXG4gICAqIEBwYXJhbSB7Ym9vbGVhbj19IHVuc2lnbmVkIFdoZXRoZXIgdW5zaWduZWQgb3Igbm90LCBkZWZhdWx0cyB0byBzaWduZWRcbiAgICogQHJldHVybnMge0xvbmd9IFRoZSBjb3JyZXNwb25kaW5nIExvbmcgdmFsdWVcbiAgICovXG4gIFxuICBcbiAgTG9uZy5mcm9tQnl0ZXNCRSA9IGZ1bmN0aW9uIGZyb21CeXRlc0JFKGJ5dGVzLCB1bnNpZ25lZCkge1xuICAgIHJldHVybiBuZXcgTG9uZyhieXRlc1s0XSA8PCAyNCB8IGJ5dGVzWzVdIDw8IDE2IHwgYnl0ZXNbNl0gPDwgOCB8IGJ5dGVzWzddLCBieXRlc1swXSA8PCAyNCB8IGJ5dGVzWzFdIDw8IDE2IHwgYnl0ZXNbMl0gPDwgOCB8IGJ5dGVzWzNdLCB1bnNpZ25lZCk7XG4gIH07XG4gIFxuICB2YXIgX2RlZmF1bHQgPSBMb25nO1xuICBleHBvcnRzLmRlZmF1bHQgPSBfZGVmYXVsdDtcbiAgcmV0dXJuIFwiZGVmYXVsdFwiIGluIGV4cG9ydHMgPyBleHBvcnRzLmRlZmF1bHQgOiBleHBvcnRzO1xufSkoe30pO1xuaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkgZGVmaW5lKFtdLCBmdW5jdGlvbigpIHsgcmV0dXJuIExvbmc7IH0pO1xuZWxzZSBpZiAodHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSBtb2R1bGUuZXhwb3J0cyA9IExvbmc7XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbl9fd2VicGFja19yZXF1aXJlX18ubiA9IChtb2R1bGUpID0+IHtcblx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG5cdFx0KCkgPT4gKG1vZHVsZVsnZGVmYXVsdCddKSA6XG5cdFx0KCkgPT4gKG1vZHVsZSk7XG5cdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsIHsgYTogZ2V0dGVyIH0pO1xuXHRyZXR1cm4gZ2V0dGVyO1xufTsiLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiXG5jb25zdCBhcGkgPSByZXF1aXJlKCdAdGVtcG9yYWxpby93b3JrZmxvdy9saWIvd29ya2VyLWludGVyZmFjZS5qcycpO1xuZXhwb3J0cy5hcGkgPSBhcGk7XG5cbmNvbnN0IHsgb3ZlcnJpZGVHbG9iYWxzIH0gPSByZXF1aXJlKCdAdGVtcG9yYWxpby93b3JrZmxvdy9saWIvZ2xvYmFsLW92ZXJyaWRlcy5qcycpO1xub3ZlcnJpZGVHbG9iYWxzKCk7XG5cbmV4cG9ydHMuaW1wb3J0V29ya2Zsb3dzID0gZnVuY3Rpb24gaW1wb3J0V29ya2Zsb3dzKCkge1xuICByZXR1cm4gcmVxdWlyZSgvKiB3ZWJwYWNrTW9kZTogXCJlYWdlclwiICovIFwiL1VzZXJzL3JvYmhvbGxhbmQvRGV2ZWxvcGVyL2dpdGh1Yi5jb20vcm9iaG9sbGFuZC9maW5hbmNlLWRlbW8vd29ya2Zsb3dzL3NyYy9zY2VuYXJpby00LnRzXCIpO1xufVxuXG5leHBvcnRzLmltcG9ydEludGVyY2VwdG9ycyA9IGZ1bmN0aW9uIGltcG9ydEludGVyY2VwdG9ycygpIHtcbiAgcmV0dXJuIFtcbiAgICBcbiAgXTtcbn1cbiJdLCJuYW1lcyI6WyJwcm94eUFjdGl2aXRpZXMiLCJjaGFyZ2VDYXJkIiwicmVzZXJ2ZVN0b2NrIiwic2hpcEl0ZW0iLCJzZW5kUmVjZWlwdCIsInNlbmRDaGFyZ2VGYWlsdXJlRW1haWwiLCJzdGFydFRvQ2xvc2VUaW1lb3V0IiwicmV0cnkiLCJpbml0aWFsSW50ZXJ2YWwiLCJiYWNrb2ZmQ29lZmZpY2llbnQiLCJQdXJjaGFzZVdvcmtmbG93IiwiaW5wdXQiLCJjdXN0b21lckVtYWlsIiwicHJvZHVjdE5hbWUiLCJhbW91bnQiLCJzaGlwcGluZ0FkZHJlc3MiLCJlcnJvciJdLCJzb3VyY2VSb290IjoiIn0=