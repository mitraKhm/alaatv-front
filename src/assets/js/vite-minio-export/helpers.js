'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.SelectResults = exports.RETENTION_VALIDITY_UNITS = exports.RETENTION_MODES = exports.PART_CONSTRAINTS = exports.LEGAL_HOLD_STATUS = exports.ENCRYPTION_TYPES = exports.DEFAULT_REGION = exports.CopySourceOptions = exports.CopyDestinationOptions = void 0
exports.calculateEvenSplits = calculateEvenSplits
exports.extractMetadata = extractMetadata
exports.getScope = getScope
exports.getSourceVersionId = getSourceVersionId
exports.getVersionId = getVersionId
exports.insertContentType = insertContentType
exports.isAmazonEndpoint = isAmazonEndpoint
exports.isAmzHeader = isAmzHeader
exports.isArray = isArray
exports.isBoolean = isBoolean
exports.isFunction = isFunction
exports.isNumber = isNumber
exports.isObject = isObject
exports.isReadableStream = isReadableStream
exports.isStorageclassHeader = isStorageclassHeader
exports.isString = isString
exports.isSupportedHeader = isSupportedHeader
exports.isValidBucketName = isValidBucketName
exports.isValidDate = isValidDate
exports.isValidDomain = isValidDomain
exports.isValidEndpoint = isValidEndpoint
exports.isValidIP = isValidIP
exports.isValidObjectName = isValidObjectName
exports.isValidPort = isValidPort
exports.isValidPrefix = isValidPrefix
exports.isVirtualHostStyle = isVirtualHostStyle
exports.makeDateLong = makeDateLong
exports.makeDateShort = makeDateShort
exports.partsRequired = exports.parseXml = void 0
exports.pipesetup = pipesetup
exports.prependXAMZMeta = prependXAMZMeta
exports.probeContentType = probeContentType
exports.promisify = promisify
exports.readableStream = readableStream
exports.removeDirAndFiles = removeDirAndFiles
exports.sanitizeETag = sanitizeETag
exports.toSha256 = exports.toMd5 = exports.toArray = exports.sanitizeObjectKey = void 0
exports.uriEscape = uriEscape
exports.uriResourceEscape = uriResourceEscape

const _stream = _interopRequireDefault(require('stream'))

const _mimeTypes = _interopRequireDefault(require('mime-types'))

const _fastXmlParser = _interopRequireDefault(require('fast-xml-parser'))

const _browserOrNode = require('browser-or-node')

const _lodash = _interopRequireDefault(require('lodash'))

const errors = _interopRequireWildcard(require('./errors.js'))

const _queryString = _interopRequireDefault(require('query-string'))

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== 'function') return null; const cacheBabelInterop = new WeakMap(); const cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop })(nodeInterop) }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj } if (obj === null || typeof obj !== 'object' && typeof obj !== 'function') { return { default: obj } } const cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj) } const newObj = {}; const hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (const key in obj) { if (key !== 'default' && Object.prototype.hasOwnProperty.call(obj, key)) { const desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc) } else { newObj[key] = obj[key] } } } newObj.default = obj; if (cache) { cache.set(obj, newObj) } return newObj }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj } }

/*
 * MinIO Javascript Library for Amazon S3 Compatible Cloud Storage, (C) 2015 MinIO, Inc.
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
 */
const Crypto = require('crypto-browserify')

const ipaddr = require('ipaddr.js')

const fs = require('fs')

const path = require('path')

// Returns a wrapper function that will promisify a given callback function.
// It will preserve 'this'.
function promisify(fn) {
  return function () {
    // If the last argument is a function, assume its the callback.
    const callback = arguments[arguments.length - 1] // If the callback is given, don't promisify, just pass straight in.

    if (typeof callback === 'function') return fn.apply(this, arguments) // Otherwise, create a new set of arguments, and wrap
    // it in a promise.

    const args = [...arguments]
    return new Promise((resolve, reject) => {
      // Add the callback function.
      args.push((err, value) => {
        if (err) return reject(err)
        resolve(value)
      }) // Call the function with our special adaptor callback added.

      fn.apply(this, args)
    })
  }
} // All characters in string which are NOT unreserved should be percent encoded.
// Unreserved characers are : ALPHA / DIGIT / "-" / "." / "_" / "~"
// Reference https://tools.ietf.org/html/rfc3986#section-2.2

function uriEscape(string) {
  return string.split('').reduce((acc, elem) => {
    const buf = Buffer.from(elem)

    if (buf.length === 1) {
      // length 1 indicates that elem is not a unicode character.
      // Check if it is an unreserved characer.
      if (elem >= 'A' && elem <= 'Z' || elem >= 'a' && elem <= 'z' || elem >= '0' && elem <= '9' || elem === '_' || elem === '.' || elem === '~' || elem === '-') {
        // Unreserved characer should not be encoded.
        acc = acc + elem
        return acc
      }
    } // elem needs encoding - i.e elem should be encoded if it's not unreserved
    // character or if it's a unicode character.

    for (let i = 0; i < buf.length; i++) {
      acc = acc + '%' + buf[i].toString(16).toUpperCase()
    }

    return acc
  }, '')
}

function uriResourceEscape(string) {
  return uriEscape(string).replace(/%2F/g, '/')
}

function getScope(region, date, serviceName = 's3') {
  return `${makeDateShort(date)}/${region}/${serviceName}/aws4_request`
} // isAmazonEndpoint - true if endpoint is 's3.amazonaws.com' or 's3.cn-north-1.amazonaws.com.cn'

function isAmazonEndpoint(endpoint) {
  return endpoint === 's3.amazonaws.com' || endpoint === 's3.cn-north-1.amazonaws.com.cn'
} // isVirtualHostStyle - verify if bucket name is support with virtual
// hosts. bucketNames with periods should be always treated as path
// style if the protocol is 'https:', this is due to SSL wildcard
// limitation. For all other buckets and Amazon S3 endpoint we will
// default to virtual host style.

function isVirtualHostStyle(endpoint, protocol, bucket, pathStyle) {
  if (protocol === 'https:' && bucket.indexOf('.') > -1) {
    return false
  }

  return isAmazonEndpoint(endpoint) || !pathStyle
}

function isValidIP(ip) {
  return ipaddr.isValid(ip)
} // isValidEndpoint - true if endpoint is valid domain.

function isValidEndpoint(endpoint) {
  return isValidDomain(endpoint) || isValidIP(endpoint)
} // isValidDomain - true if input host is a valid domain.

function isValidDomain(host) {
  if (!isString(host)) return false // See RFC 1035, RFC 3696.

  if (host.length === 0 || host.length > 255) {
    return false
  } // Host cannot start or end with a '-'

  if (host[0] === '-' || host.slice(-1) === '-') {
    return false
  } // Host cannot start or end with a '_'

  if (host[0] === '_' || host.slice(-1) === '_') {
    return false
  } // Host cannot start with a '.'

  if (host[0] === '.') {
    return false
  }

  const alphaNumerics = '`~!@#$%^&*()+={}[]|\\"\';:><?/'.split('') // All non alphanumeric characters are invalid.

  for (const i in alphaNumerics) {
    if (host.indexOf(alphaNumerics[i]) > -1) {
      return false
    }
  } // No need to regexp match, since the list is non-exhaustive.
  // We let it be valid and fail later.

  return true
} // Probes contentType using file extensions.
// For example: probeContentType('file.png') returns 'image/png'.

function probeContentType(path) {
  let contentType = _mimeTypes.default.lookup(path)

  if (!contentType) {
    contentType = 'application/octet-stream'
  }

  return contentType
} // isValidPort - is input port valid.

function isValidPort(port) {
  // verify if port is a number.
  if (!isNumber(port)) return false // port cannot be negative.

  if (port < 0) return false // port '0' is valid and special case return true.

  if (port === 0) return true
  const min_port = 1
  const max_port = 65535 // Verify if port is in range.

  return port >= min_port && port <= max_port
}

function isValidBucketName(bucket) {
  if (!isString(bucket)) return false // bucket length should be less than and no more than 63
  // characters long.

  if (bucket.length < 3 || bucket.length > 63) {
    return false
  } // bucket with successive periods is invalid.

  if (bucket.indexOf('..') > -1) {
    return false
  } // bucket cannot have ip address style.

  if (bucket.match(/[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+/)) {
    return false
  } // bucket should begin with alphabet/number and end with alphabet/number,
  // with alphabet/number/.- in the middle.

  if (bucket.match(/^[a-z0-9][a-z0-9.-]+[a-z0-9]$/)) {
    return true
  }

  return false
} // check if objectName is a valid object name

function isValidObjectName(objectName) {
  if (!isValidPrefix(objectName)) return false
  if (objectName.length === 0) return false
  return true
} // check if prefix is valid

function isValidPrefix(prefix) {
  if (!isString(prefix)) return false
  if (prefix.length > 1024) return false
  return true
} // check if typeof arg number

function isNumber(arg) {
  return typeof arg === 'number'
} // check if typeof arg function

function isFunction(arg) {
  return typeof arg === 'function'
} // check if typeof arg string

function isString(arg) {
  return typeof arg === 'string'
} // check if typeof arg object

function isObject(arg) {
  return typeof arg === 'object' && arg !== null
} // check if object is readable stream

function isReadableStream(arg) {
  return isObject(arg) && isFunction(arg._read)
} // check if arg is boolean

function isBoolean(arg) {
  return typeof arg === 'boolean'
} // check if arg is array

function isArray(arg) {
  return Array.isArray(arg)
} // check if arg is a valid date

function isValidDate(arg) {
  return arg instanceof Date && !isNaN(arg)
} // Create a Date string with format:
// 'YYYYMMDDTHHmmss' + Z

function makeDateLong(date) {
  date = date || new Date() // Gives format like: '2017-08-07T16:28:59.889Z'

  date = date.toISOString()
  return date.slice(0, 4) + date.slice(5, 7) + date.slice(8, 13) + date.slice(14, 16) + date.slice(17, 19) + 'Z'
} // Create a Date string with format:
// 'YYYYMMDD'

function makeDateShort(date) {
  date = date || new Date() // Gives format like: '2017-08-07T16:28:59.889Z'

  date = date.toISOString()
  return date.slice(0, 4) + date.slice(5, 7) + date.slice(8, 10)
} // pipesetup sets up pipe() from left to right os streams array
// pipesetup will also make sure that error emitted at any of the upstream Stream
// will be emitted at the last stream. This makes error handling simple

function pipesetup(...streams) {
  return streams.reduce((src, dst) => {
    src.on('error', err => dst.emit('error', err))
    return src.pipe(dst)
  })
} // return a Readable stream that emits data

function readableStream(data) {
  const s = new _stream.default.Readable()

  s._read = () => {}

  s.push(data)
  s.push(null)
  return s
} // Process metadata to insert appropriate value to `content-type` attribute

function insertContentType(metaData, filePath) {
  // check if content-type attribute present in metaData
  for (const key in metaData) {
    if (key.toLowerCase() === 'content-type') {
      return metaData
    }
  } // if `content-type` attribute is not present in metadata,
  // then infer it from the extension in filePath

  const newMetadata = Object.assign({}, metaData)
  newMetadata['content-type'] = probeContentType(filePath)
  return newMetadata
} // Function prepends metadata with the appropriate prefix if it is not already on

function prependXAMZMeta(metaData) {
  const newMetadata = Object.assign({}, metaData)

  for (const key in metaData) {
    if (!isAmzHeader(key) && !isSupportedHeader(key) && !isStorageclassHeader(key)) {
      newMetadata['X-Amz-Meta-' + key] = newMetadata[key]
      delete newMetadata[key]
    }
  }

  return newMetadata
} // Checks if it is a valid header according to the AmazonS3 API

function isAmzHeader(key) {
  const temp = key.toLowerCase()
  return temp.startsWith('x-amz-meta-') || temp === 'x-amz-acl' || temp.startsWith('x-amz-server-side-encryption-') || temp === 'x-amz-server-side-encryption'
} // Checks if it is a supported Header

function isSupportedHeader(key) {
  const supported_headers = ['content-type', 'cache-control', 'content-encoding', 'content-disposition', 'content-language', 'x-amz-website-redirect-location']
  return supported_headers.indexOf(key.toLowerCase()) > -1
} // Checks if it is a storage header

function isStorageclassHeader(key) {
  return key.toLowerCase() === 'x-amz-storage-class'
}

function extractMetadata(metaData) {
  const newMetadata = {}

  for (const key in metaData) {
    if (isSupportedHeader(key) || isStorageclassHeader(key) || isAmzHeader(key)) {
      if (key.toLowerCase().startsWith('x-amz-meta-')) {
        newMetadata[key.slice(11, key.length)] = metaData[key]
      } else {
        newMetadata[key] = metaData[key]
      }
    }
  }

  return newMetadata
}

function getVersionId(headers = {}) {
  const versionIdValue = headers['x-amz-version-id']
  return versionIdValue || null
}

function getSourceVersionId(headers = {}) {
  const sourceVersionId = headers['x-amz-copy-source-version-id']
  return sourceVersionId || null
}

function sanitizeETag(etag = '') {
  const replaceChars = {
    '"': '',
    '&quot;': '',
    '&#34;': '',
    '&QUOT;': '',
    '&#x00022': ''
  }
  return etag.replace(/^("|&quot;|&#34;)|("|&quot;|&#34;)$/g, m => replaceChars[m])
}

const RETENTION_MODES = {
  GOVERNANCE: 'GOVERNANCE',
  COMPLIANCE: 'COMPLIANCE'
}
exports.RETENTION_MODES = RETENTION_MODES
const RETENTION_VALIDITY_UNITS = {
  DAYS: 'Days',
  YEARS: 'Years'
}
exports.RETENTION_VALIDITY_UNITS = RETENTION_VALIDITY_UNITS
const LEGAL_HOLD_STATUS = {
  ENABLED: 'ON',
  DISABLED: 'OFF'
}
exports.LEGAL_HOLD_STATUS = LEGAL_HOLD_STATUS

const objectToBuffer = payload => {
  const payloadBuf = Buffer.from(Buffer.from(payload))
  return payloadBuf
}

const toMd5 = payload => {
  let payLoadBuf = objectToBuffer(payload) // use string from browser and buffer from nodejs
  // browser support is tested only against minio server

  payLoadBuf = _browserOrNode.isBrowser ? payLoadBuf.toString() : payLoadBuf
  return Crypto.createHash('md5').update(payLoadBuf).digest().toString('base64')
}

exports.toMd5 = toMd5

const toSha256 = payload => {
  return Crypto.createHash('sha256').update(payload).digest('hex')
} // toArray returns a single element array with param being the element,
// if param is just a string, and returns 'param' back if it is an array
// So, it makes sure param is always an array

exports.toSha256 = toSha256

const toArray = param => {
  if (!Array.isArray(param)) {
    return [param]
  }

  return param
}

exports.toArray = toArray

const sanitizeObjectKey = objectName => {
  // + symbol characters are not decoded as spaces in JS. so replace them first and decode to get the correct result.
  const asStrName = (objectName || '').replace(/\+/g, ' ')
  const sanitizedName = decodeURIComponent(asStrName)
  return sanitizedName
}

exports.sanitizeObjectKey = sanitizeObjectKey
const PART_CONSTRAINTS = {
  // absMinPartSize - absolute minimum part size (5 MiB)
  ABS_MIN_PART_SIZE: 1024 * 1024 * 5,
  // MIN_PART_SIZE - minimum part size 16MiB per object after which
  MIN_PART_SIZE: 1024 * 1024 * 16,
  // MAX_PARTS_COUNT - maximum number of parts for a single multipart session.
  MAX_PARTS_COUNT: 10000,
  // MAX_PART_SIZE - maximum part size 5GiB for a single multipart upload
  // operation.
  MAX_PART_SIZE: 1024 * 1024 * 1024 * 5,
  // MAX_SINGLE_PUT_OBJECT_SIZE - maximum size 5GiB of object per PUT
  // operation.
  MAX_SINGLE_PUT_OBJECT_SIZE: 1024 * 1024 * 1024 * 5,
  // MAX_MULTIPART_PUT_OBJECT_SIZE - maximum size 5TiB of object for
  // Multipart operation.
  MAX_MULTIPART_PUT_OBJECT_SIZE: 1024 * 1024 * 1024 * 1024 * 5
}
exports.PART_CONSTRAINTS = PART_CONSTRAINTS
const ENCRYPTION_TYPES = {
  // SSEC represents server-side-encryption with customer provided keys
  SSEC: 'SSE-C',
  // KMS represents server-side-encryption with managed keys
  KMS: 'KMS'
}
exports.ENCRYPTION_TYPES = ENCRYPTION_TYPES
const GENERIC_SSE_HEADER = 'X-Amz-Server-Side-Encryption'
const ENCRYPTION_HEADERS = {
  // sseGenericHeader is the AWS SSE header used for SSE-S3 and SSE-KMS.
  sseGenericHeader: GENERIC_SSE_HEADER,
  // sseKmsKeyID is the AWS SSE-KMS key id.
  sseKmsKeyID: GENERIC_SSE_HEADER + '-Aws-Kms-Key-Id'
}
/**
 * Return Encryption headers
 * @param encConfig
 * @returns an object with key value pairs that can be used in headers.
 */

function getEncryptionHeaders(encConfig) {
  const encType = encConfig.type
  const encHeaders = {}

  if (!_lodash.default.isEmpty(encType)) {
    if (encType === ENCRYPTION_TYPES.SSEC) {
      return {
        [encHeaders[ENCRYPTION_HEADERS.sseGenericHeader]]: 'AES256'
      }
    } else if (encType === ENCRYPTION_TYPES.KMS) {
      return {
        [ENCRYPTION_HEADERS.sseGenericHeader]: encConfig.SSEAlgorithm,
        [ENCRYPTION_HEADERS.sseKmsKeyID]: encConfig.KMSMasterKeyID
      }
    }
  }

  return encHeaders
}

class CopySourceOptions {
  /**
     *
     * @param Bucket __string__ Bucket Name
     * @param Object __string__ Object Name
     * @param VersionID __string__ Valid versionId
     * @param MatchETag __string__ Etag to match
     * @param NoMatchETag __string__ Etag to exclude
     * @param MatchModifiedSince __string__ Modified Date of the object/part.  UTC Date in string format
     * @param MatchUnmodifiedSince __string__ Modified Date of the object/part to exclude UTC Date in string format
     * @param MatchRange __boolean__ true or false Object range to match
     * @param Start
     * @param End
     * @param Encryption
     */
  constructor({
    Bucket = '',
    Object = '',
    VersionID = '',
    MatchETag = '',
    NoMatchETag = '',
    MatchModifiedSince = null,
    MatchUnmodifiedSince = null,
    MatchRange = false,
    Start = 0,
    End = 0,
    Encryption = {}
  } = {}) {
    this.Bucket = Bucket
    this.Object = Object
    this.VersionID = VersionID
    this.MatchETag = MatchETag
    this.NoMatchETag = NoMatchETag
    this.MatchModifiedSince = MatchModifiedSince
    this.MatchUnmodifiedSince = MatchUnmodifiedSince
    this.MatchRange = MatchRange
    this.Start = Start
    this.End = End
    this.Encryption = Encryption
  }

  validate() {
    if (!isValidBucketName(this.Bucket)) {
      throw new errors.InvalidBucketNameError('Invalid Source bucket name: ' + this.Bucket)
    }

    if (!isValidObjectName(this.Object)) {
      throw new errors.InvalidObjectNameError(`Invalid Source object name: ${this.Object}`)
    }

    if (this.MatchRange && this.Start !== -1 && this.End !== -1 && this.Start > this.End || this.Start < 0) {
      throw new errors.InvalidObjectNameError('Source start must be non-negative, and start must be at most end.')
    } else if (this.MatchRange && !isNumber(this.Start) || !isNumber(this.End)) {
      throw new errors.InvalidObjectNameError('MatchRange is specified. But  Invalid Start and End values are specified. ')
    }

    return true
  }

  getHeaders() {
    const headerOptions = {}
    headerOptions['x-amz-copy-source'] = encodeURI(this.Bucket + '/' + this.Object)

    if (!_lodash.default.isEmpty(this.VersionID)) {
      headerOptions['x-amz-copy-source'] = encodeURI(this.Bucket + '/' + this.Object) + '?versionId=' + this.VersionID
    }

    if (!_lodash.default.isEmpty(this.MatchETag)) {
      headerOptions['x-amz-copy-source-if-match'] = this.MatchETag
    }

    if (!_lodash.default.isEmpty(this.NoMatchETag)) {
      headerOptions['x-amz-copy-source-if-none-match'] = this.NoMatchETag
    }

    if (!_lodash.default.isEmpty(this.MatchModifiedSince)) {
      headerOptions['x-amz-copy-source-if-modified-since'] = this.MatchModifiedSince
    }

    if (!_lodash.default.isEmpty(this.MatchUnmodifiedSince)) {
      headerOptions['x-amz-copy-source-if-unmodified-since'] = this.MatchUnmodifiedSince
    }

    return headerOptions
  }
}

exports.CopySourceOptions = CopySourceOptions

class CopyDestinationOptions {
  /*
   * @param Bucket __string__
   * @param Object __string__ Object Name for the destination (composed/copied) object defaults
   * @param Encryption __object__ Encryption configuration defaults to {}
   * @param UserMetadata __object__
   * @param UserTags __object__ | __string__
   * @param LegalHold __string__  ON | OFF
   * @param RetainUntilDate __string__ UTC Date String
   * @param Mode
  */
  constructor({
    Bucket = '',
    Object = '',
    Encryption = null,
    UserMetadata = null,
    UserTags = null,
    LegalHold = null,
    RetainUntilDate = null,
    Mode = null //

  }) {
    this.Bucket = Bucket
    this.Object = Object
    this.Encryption = Encryption
    this.UserMetadata = UserMetadata
    this.UserTags = UserTags
    this.LegalHold = LegalHold
    this.Mode = Mode // retention mode

    this.RetainUntilDate = RetainUntilDate
  }

  getHeaders() {
    const replaceDirective = 'REPLACE'
    const headerOptions = {}
    const userTags = this.UserTags

    if (!_lodash.default.isEmpty(userTags)) {
      headerOptions['X-Amz-Tagging-Directive'] = replaceDirective
      headerOptions['X-Amz-Tagging'] = isObject(userTags) ? _queryString.default.stringify(userTags) : isString(userTags) ? userTags : ''
    }

    if (!_lodash.default.isEmpty(this.Mode)) {
      headerOptions['X-Amz-Object-Lock-Mode'] = this.Mode // GOVERNANCE or COMPLIANCE
    }

    if (!_lodash.default.isEmpty(this.RetainUntilDate)) {
      headerOptions['X-Amz-Object-Lock-Retain-Until-Date'] = this.RetainUntilDate // needs to be UTC.
    }

    if (!_lodash.default.isEmpty(this.LegalHold)) {
      headerOptions['X-Amz-Object-Lock-Legal-Hold'] = this.LegalHold // ON or OFF
    }

    if (!_lodash.default.isEmpty(this.UserMetadata)) {
      const headerKeys = Object.keys(this.UserMetadata)
      headerKeys.forEach(key => {
        headerOptions[`X-Amz-Meta-${key}`] = this.UserMetadata[key]
      })
    }

    if (!_lodash.default.isEmpty(this.Encryption)) {
      const encryptionHeaders = getEncryptionHeaders(this.Encryption)
      Object.keys(encryptionHeaders).forEach(key => {
        headerOptions[key] = encryptionHeaders[key]
      })
    }

    return headerOptions
  }

  validate() {
    if (!isValidBucketName(this.Bucket)) {
      throw new errors.InvalidBucketNameError('Invalid Destination bucket name: ' + this.Bucket)
    }

    if (!isValidObjectName(this.Object)) {
      throw new errors.InvalidObjectNameError(`Invalid Destination object name: ${this.Object}`)
    }

    if (!_lodash.default.isEmpty(this.UserMetadata) && !isObject(this.UserMetadata)) {
      throw new errors.InvalidObjectNameError('Destination UserMetadata should be an object with key value pairs')
    }

    if (!_lodash.default.isEmpty(this.Mode) && ![RETENTION_MODES.GOVERNANCE, RETENTION_MODES.COMPLIANCE].includes(this.Mode)) {
      throw new errors.InvalidObjectNameError('Invalid Mode specified for destination object it should be one of [GOVERNANCE,COMPLIANCE]')
    }

    if (!_lodash.default.isEmpty(this.Encryption) && _lodash.default.isEmpty(this.Encryption)) {
      throw new errors.InvalidObjectNameError('Invalid Encryption configuration for destination object ')
    }

    return true
  }
}

exports.CopyDestinationOptions = CopyDestinationOptions

const partsRequired = size => {
  const maxPartSize = PART_CONSTRAINTS.MAX_MULTIPART_PUT_OBJECT_SIZE / (PART_CONSTRAINTS.MAX_PARTS_COUNT - 1)
  let requiredPartSize = size / maxPartSize

  if (size % maxPartSize > 0) {
    requiredPartSize++
  }

  requiredPartSize = Math.trunc(requiredPartSize)
  return requiredPartSize
} // calculateEvenSplits - computes splits for a source and returns
// start and end index slices. Splits happen evenly to be sure that no
// part is less than 5MiB, as that could fail the multipart request if
// it is not the last part.

exports.partsRequired = partsRequired
let startIndexParts = []
let endIndexParts = []

function calculateEvenSplits(size, objInfo) {
  if (size === 0) {
    return null
  }

  const reqParts = partsRequired(size)
  startIndexParts = new Array(reqParts)
  endIndexParts = new Array(reqParts)
  let start = objInfo.Start

  if (_lodash.default.isEmpty(objInfo.Start) || start === -1) {
    start = 0
  }

  const divisorValue = Math.trunc(size / reqParts)
  const reminderValue = size % reqParts
  let nextStart = start

  for (let i = 0; i < reqParts; i++) {
    let curPartSize = divisorValue

    if (i < reminderValue) {
      curPartSize++
    }

    const currentStart = nextStart
    const currentEnd = currentStart + curPartSize - 1
    nextStart = currentEnd + 1
    startIndexParts[i] = currentStart
    endIndexParts[i] = currentEnd
  }

  return {
    startIndex: startIndexParts,
    endIndex: endIndexParts,
    objInfo
  }
}

function removeDirAndFiles(dirPath, removeSelf) {
  if (removeSelf === undefined) removeSelf = true

  try {
    var files = fs.readdirSync(dirPath)
  } catch (e) {
    return
  }

  if (files.length > 0) {
    for (let i = 0; i < files.length; i++) {
      const filePath = path.join(dirPath, files[i])
      if (fs.statSync(filePath).isFile()) fs.unlinkSync(filePath); else removeDirAndFiles(filePath)
    }
  }
  if (removeSelf) fs.rmdirSync(dirPath)
}

const parseXml = xml => {
  let result = null
  result = _fastXmlParser.default.parse(xml)

  if (result.Error) {
    throw result.Error
  }

  return result
}

exports.parseXml = parseXml

class SelectResults {
  constructor({
    records,
    // parsed data as stream
    response,
    // original response stream
    stats,
    // stats as xml
    progress // stats as xml

  }) {
    this.records = records
    this.response = response
    this.stats = stats
    this.progress = progress
  }

  setStats(stats) {
    this.stats = stats
  }

  getStats() {
    return this.stats
  }

  setProgress(progress) {
    this.progress = progress
  }

  getProgress() {
    return this.progress
  }

  setResponse(response) {
    this.response = response
  }

  getResponse() {
    return this.response
  }

  setRecords(records) {
    this.records = records
  }

  getRecords() {
    return this.records
  }
}

exports.SelectResults = SelectResults
const DEFAULT_REGION = 'us-east-1'
exports.DEFAULT_REGION = DEFAULT_REGION
// # sourceMappingURL=helpers.js.map
