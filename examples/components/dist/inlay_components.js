// build/dev/javascript/prelude.mjs
class CustomType {
  withFields(fields) {
    let properties = Object.keys(this).map((label) => (label in fields) ? fields[label] : this[label]);
    return new this.constructor(...properties);
  }
}

class List {
  static fromArray(array, tail) {
    let t = tail || new Empty;
    for (let i = array.length - 1;i >= 0; --i) {
      t = new NonEmpty(array[i], t);
    }
    return t;
  }
  [Symbol.iterator]() {
    return new ListIterator(this);
  }
  toArray() {
    return [...this];
  }
  atLeastLength(desired) {
    let current = this;
    while (desired-- > 0 && current)
      current = current.tail;
    return current !== undefined;
  }
  hasLength(desired) {
    let current = this;
    while (desired-- > 0 && current)
      current = current.tail;
    return desired === -1 && current instanceof Empty;
  }
  countLength() {
    let current = this;
    let length = 0;
    while (current) {
      current = current.tail;
      length++;
    }
    return length - 1;
  }
}
function prepend(element, tail) {
  return new NonEmpty(element, tail);
}
function toList(elements, tail) {
  return List.fromArray(elements, tail);
}

class ListIterator {
  #current;
  constructor(current) {
    this.#current = current;
  }
  next() {
    if (this.#current instanceof Empty) {
      return { done: true };
    } else {
      let { head, tail } = this.#current;
      this.#current = tail;
      return { value: head, done: false };
    }
  }
}

class Empty extends List {
}
var List$Empty = () => new Empty;
var List$isEmpty = (value) => value instanceof Empty;

class NonEmpty extends List {
  constructor(head, tail) {
    super();
    this.head = head;
    this.tail = tail;
  }
}
var List$NonEmpty = (head, tail) => new NonEmpty(head, tail);
var List$isNonEmpty = (value) => value instanceof NonEmpty;
var List$NonEmpty$first = (value) => value.head;
var List$NonEmpty$rest = (value) => value.tail;

class BitArray {
  bitSize;
  byteSize;
  bitOffset;
  rawBuffer;
  constructor(buffer, bitSize, bitOffset) {
    if (!(buffer instanceof Uint8Array)) {
      throw globalThis.Error("BitArray can only be constructed from a Uint8Array");
    }
    this.bitSize = bitSize ?? buffer.length * 8;
    this.byteSize = Math.trunc((this.bitSize + 7) / 8);
    this.bitOffset = bitOffset ?? 0;
    if (this.bitSize < 0) {
      throw globalThis.Error(`BitArray bit size is invalid: ${this.bitSize}`);
    }
    if (this.bitOffset < 0 || this.bitOffset > 7) {
      throw globalThis.Error(`BitArray bit offset is invalid: ${this.bitOffset}`);
    }
    if (buffer.length !== Math.trunc((this.bitOffset + this.bitSize + 7) / 8)) {
      throw globalThis.Error("BitArray buffer length is invalid");
    }
    this.rawBuffer = buffer;
  }
  byteAt(index) {
    if (index < 0 || index >= this.byteSize) {
      return;
    }
    return bitArrayByteAt(this.rawBuffer, this.bitOffset, index);
  }
  equals(other) {
    if (this.bitSize !== other.bitSize) {
      return false;
    }
    const wholeByteCount = Math.trunc(this.bitSize / 8);
    if (this.bitOffset === 0 && other.bitOffset === 0) {
      for (let i = 0;i < wholeByteCount; i++) {
        if (this.rawBuffer[i] !== other.rawBuffer[i]) {
          return false;
        }
      }
      const trailingBitsCount = this.bitSize % 8;
      if (trailingBitsCount) {
        const unusedLowBitCount = 8 - trailingBitsCount;
        if (this.rawBuffer[wholeByteCount] >> unusedLowBitCount !== other.rawBuffer[wholeByteCount] >> unusedLowBitCount) {
          return false;
        }
      }
    } else {
      for (let i = 0;i < wholeByteCount; i++) {
        const a = bitArrayByteAt(this.rawBuffer, this.bitOffset, i);
        const b = bitArrayByteAt(other.rawBuffer, other.bitOffset, i);
        if (a !== b) {
          return false;
        }
      }
      const trailingBitsCount = this.bitSize % 8;
      if (trailingBitsCount) {
        const a = bitArrayByteAt(this.rawBuffer, this.bitOffset, wholeByteCount);
        const b = bitArrayByteAt(other.rawBuffer, other.bitOffset, wholeByteCount);
        const unusedLowBitCount = 8 - trailingBitsCount;
        if (a >> unusedLowBitCount !== b >> unusedLowBitCount) {
          return false;
        }
      }
    }
    return true;
  }
  get buffer() {
    if (this.bitOffset !== 0 || this.bitSize % 8 !== 0) {
      throw new globalThis.Error("BitArray.buffer does not support unaligned bit arrays");
    }
    return this.rawBuffer;
  }
  get length() {
    if (this.bitOffset !== 0 || this.bitSize % 8 !== 0) {
      throw new globalThis.Error("BitArray.length does not support unaligned bit arrays");
    }
    return this.rawBuffer.length;
  }
}
function bitArrayByteAt(buffer, bitOffset, index) {
  if (bitOffset === 0) {
    return buffer[index] ?? 0;
  } else {
    const a = buffer[index] << bitOffset & 255;
    const b = buffer[index + 1] >> 8 - bitOffset;
    return a | b;
  }
}

class UtfCodepoint {
  constructor(value) {
    this.value = value;
  }
}
class Result extends CustomType {
  static isResult(data2) {
    return data2 instanceof Result;
  }
}

class Ok extends Result {
  constructor(value) {
    super();
    this[0] = value;
  }
  isOk() {
    return true;
  }
}
var Result$Ok = (value) => new Ok(value);
var Result$isOk = (value) => value instanceof Ok;
var Result$Ok$0 = (value) => value[0];

class Error extends Result {
  constructor(detail) {
    super();
    this[0] = detail;
  }
  isOk() {
    return false;
  }
}
var Result$Error = (detail) => new Error(detail);
var Result$isError = (value) => value instanceof Error;
function isEqual(x, y) {
  let values = [x, y];
  while (values.length) {
    let a = values.pop();
    let b = values.pop();
    if (a === b)
      continue;
    if (!isObject(a) || !isObject(b))
      return false;
    let unequal = !structurallyCompatibleObjects(a, b) || unequalDates(a, b) || unequalBuffers(a, b) || unequalArrays(a, b) || unequalMaps(a, b) || unequalSets(a, b) || unequalRegExps(a, b);
    if (unequal)
      return false;
    const proto = Object.getPrototypeOf(a);
    if (proto !== null && typeof proto.equals === "function") {
      try {
        if (a.equals(b))
          continue;
        else
          return false;
      } catch {}
    }
    let [keys, get] = getters(a);
    const ka = keys(a);
    const kb = keys(b);
    if (ka.length !== kb.length)
      return false;
    for (let k of ka) {
      values.push(get(a, k), get(b, k));
    }
  }
  return true;
}
function getters(object) {
  if (object instanceof Map) {
    return [(x) => x.keys(), (x, y) => x.get(y)];
  } else {
    let extra = object instanceof globalThis.Error ? ["message"] : [];
    return [(x) => [...extra, ...Object.keys(x)], (x, y) => x[y]];
  }
}
function unequalDates(a, b) {
  return a instanceof Date && (a > b || a < b);
}
function unequalBuffers(a, b) {
  return !(a instanceof BitArray) && a.buffer instanceof ArrayBuffer && a.BYTES_PER_ELEMENT && !(a.byteLength === b.byteLength && a.every((n, i) => n === b[i]));
}
function unequalArrays(a, b) {
  return Array.isArray(a) && a.length !== b.length;
}
function unequalMaps(a, b) {
  return a instanceof Map && a.size !== b.size;
}
function unequalSets(a, b) {
  return a instanceof Set && (a.size != b.size || [...a].some((e) => !b.has(e)));
}
function unequalRegExps(a, b) {
  return a instanceof RegExp && (a.source !== b.source || a.flags !== b.flags);
}
function isObject(a) {
  return typeof a === "object" && a !== null;
}
function structurallyCompatibleObjects(a, b) {
  if (typeof a !== "object" && typeof b !== "object" && (!a || !b))
    return false;
  let nonstructural = [Promise, WeakSet, WeakMap, Function];
  if (nonstructural.some((c) => a instanceof c))
    return false;
  return a.constructor === b.constructor;
}
function divideFloat(a, b) {
  if (b === 0) {
    return 0;
  } else {
    return a / b;
  }
}
function makeError(variant, file, module, line, fn, message, extra) {
  let error = new globalThis.Error(message);
  error.gleam_error = variant;
  error.file = file;
  error.module = module;
  error.line = line;
  error.function = fn;
  error.fn = fn;
  for (let k in extra)
    error[k] = extra[k];
  return error;
}
// build/dev/javascript/gleam_stdlib/dict.mjs
var referenceMap = /* @__PURE__ */ new WeakMap;
var tempDataView = /* @__PURE__ */ new DataView(/* @__PURE__ */ new ArrayBuffer(8));
var referenceUID = 0;
function hashByReference(o) {
  const known = referenceMap.get(o);
  if (known !== undefined) {
    return known;
  }
  const hash = referenceUID++;
  if (referenceUID === 2147483647) {
    referenceUID = 0;
  }
  referenceMap.set(o, hash);
  return hash;
}
function hashMerge(a, b) {
  return a ^ b + 2654435769 + (a << 6) + (a >> 2) | 0;
}
function hashString(s) {
  let hash = 0;
  const len = s.length;
  for (let i = 0;i < len; i++) {
    hash = Math.imul(31, hash) + s.charCodeAt(i) | 0;
  }
  return hash;
}
function hashNumber(n) {
  tempDataView.setFloat64(0, n);
  const i = tempDataView.getInt32(0);
  const j = tempDataView.getInt32(4);
  return Math.imul(73244475, i >> 16 ^ i) ^ j;
}
function hashBigInt(n) {
  return hashString(n.toString());
}
function hashObject(o) {
  const proto = Object.getPrototypeOf(o);
  if (proto !== null && typeof proto.hashCode === "function") {
    try {
      const code = o.hashCode(o);
      if (typeof code === "number") {
        return code;
      }
    } catch {}
  }
  if (o instanceof Promise || o instanceof WeakSet || o instanceof WeakMap) {
    return hashByReference(o);
  }
  if (o instanceof Date) {
    return hashNumber(o.getTime());
  }
  let h = 0;
  if (o instanceof ArrayBuffer) {
    o = new Uint8Array(o);
  }
  if (Array.isArray(o) || o instanceof Uint8Array) {
    for (let i = 0;i < o.length; i++) {
      h = Math.imul(31, h) + getHash(o[i]) | 0;
    }
  } else if (o instanceof Set) {
    o.forEach((v) => {
      h = h + getHash(v) | 0;
    });
  } else if (o instanceof Map) {
    o.forEach((v, k) => {
      h = h + hashMerge(getHash(v), getHash(k)) | 0;
    });
  } else {
    const keys = Object.keys(o);
    for (let i = 0;i < keys.length; i++) {
      const k = keys[i];
      const v = o[k];
      h = h + hashMerge(getHash(v), hashString(k)) | 0;
    }
  }
  return h;
}
function getHash(u) {
  if (u === null)
    return 1108378658;
  if (u === undefined)
    return 1108378659;
  if (u === true)
    return 1108378657;
  if (u === false)
    return 1108378656;
  switch (typeof u) {
    case "number":
      return hashNumber(u);
    case "string":
      return hashString(u);
    case "bigint":
      return hashBigInt(u);
    case "object":
      return hashObject(u);
    case "symbol":
      return hashByReference(u);
    case "function":
      return hashByReference(u);
    default:
      return 0;
  }
}

class Dict {
  constructor(size, root) {
    this.size = size;
    this.root = root;
  }
}
var bits = 5;
var mask = (1 << bits) - 1;
var noElementMarker = Symbol();
var generationKey = Symbol();
var emptyNode = /* @__PURE__ */ newNode(0);
var emptyDict = /* @__PURE__ */ new Dict(0, emptyNode);
var errorNil = /* @__PURE__ */ Result$Error(undefined);
function makeNode(generation, datamap, nodemap, data2) {
  return {
    datamap,
    nodemap,
    data: data2,
    [generationKey]: generation
  };
}
function newNode(generation) {
  return makeNode(generation, 0, 0, []);
}
function copyNode(node, generation) {
  if (node[generationKey] === generation) {
    return node;
  }
  const newData = node.data.slice(0);
  return makeNode(generation, node.datamap, node.nodemap, newData);
}
function copyAndSet(node, generation, idx, val) {
  if (node.data[idx] === val) {
    return node;
  }
  node = copyNode(node, generation);
  node.data[idx] = val;
  return node;
}
function copyAndInsertPair(node, generation, bit, idx, key, val) {
  const data2 = node.data;
  const length = data2.length;
  const newData = new Array(length + 2);
  let readIndex = 0;
  let writeIndex = 0;
  while (readIndex < idx)
    newData[writeIndex++] = data2[readIndex++];
  newData[writeIndex++] = key;
  newData[writeIndex++] = val;
  while (readIndex < length)
    newData[writeIndex++] = data2[readIndex++];
  return makeNode(generation, node.datamap | bit, node.nodemap, newData);
}
function make() {
  return emptyDict;
}
function get(dict, key) {
  const result = lookup(dict.root, key, getHash(key));
  return result !== noElementMarker ? Result$Ok(result) : errorNil;
}
function lookup(node, key, hash) {
  for (let shift = 0;shift < 32; shift += bits) {
    const data2 = node.data;
    const bit = hashbit(hash, shift);
    if (node.nodemap & bit) {
      node = data2[data2.length - 1 - index(node.nodemap, bit)];
    } else if (node.datamap & bit) {
      const dataidx = Math.imul(index(node.datamap, bit), 2);
      return isEqual(key, data2[dataidx]) ? data2[dataidx + 1] : noElementMarker;
    } else {
      return noElementMarker;
    }
  }
  const overflow = node.data;
  for (let i = 0;i < overflow.length; i += 2) {
    if (isEqual(key, overflow[i])) {
      return overflow[i + 1];
    }
  }
  return noElementMarker;
}
function toTransient(dict) {
  return {
    generation: nextGeneration(dict),
    root: dict.root,
    size: dict.size,
    dict
  };
}
function nextGeneration(dict) {
  const root = dict.root;
  if (root[generationKey] < Number.MAX_SAFE_INTEGER) {
    return root[generationKey] + 1;
  }
  const queue = [root];
  while (queue.length) {
    const node = queue.pop();
    node[generationKey] = 0;
    const nodeStart = data.length - popcount(node.nodemap);
    for (let i = nodeStart;i < node.data.length; ++i) {
      queue.push(node.data[i]);
    }
  }
  return 1;
}
var globalTransient = /* @__PURE__ */ toTransient(emptyDict);
function insert(dict, key, value) {
  globalTransient.generation = nextGeneration(dict);
  globalTransient.size = dict.size;
  const hash = getHash(key);
  const root = insertIntoNode(globalTransient, dict.root, key, value, hash, 0);
  if (root === dict.root) {
    return dict;
  }
  return new Dict(globalTransient.size, root);
}
function insertIntoNode(transient, node, key, value, hash, shift) {
  const data2 = node.data;
  const generation = transient.generation;
  if (shift > 32) {
    for (let i = 0;i < data2.length; i += 2) {
      if (isEqual(key, data2[i])) {
        return copyAndSet(node, generation, i + 1, value);
      }
    }
    transient.size += 1;
    return copyAndInsertPair(node, generation, 0, data2.length, key, value);
  }
  const bit = hashbit(hash, shift);
  if (node.nodemap & bit) {
    const nodeidx2 = data2.length - 1 - index(node.nodemap, bit);
    let child2 = data2[nodeidx2];
    child2 = insertIntoNode(transient, child2, key, value, hash, shift + bits);
    return copyAndSet(node, generation, nodeidx2, child2);
  }
  const dataidx = Math.imul(index(node.datamap, bit), 2);
  if ((node.datamap & bit) === 0) {
    transient.size += 1;
    return copyAndInsertPair(node, generation, bit, dataidx, key, value);
  }
  if (isEqual(key, data2[dataidx])) {
    return copyAndSet(node, generation, dataidx + 1, value);
  }
  const childShift = shift + bits;
  let child = emptyNode;
  child = insertIntoNode(transient, child, key, value, hash, childShift);
  const key2 = data2[dataidx];
  const value2 = data2[dataidx + 1];
  const hash2 = getHash(key2);
  child = insertIntoNode(transient, child, key2, value2, hash2, childShift);
  transient.size -= 1;
  const length = data2.length;
  const nodeidx = length - 1 - index(node.nodemap, bit);
  const newData = new Array(length - 1);
  let readIndex = 0;
  let writeIndex = 0;
  while (readIndex < dataidx)
    newData[writeIndex++] = data2[readIndex++];
  readIndex += 2;
  while (readIndex <= nodeidx)
    newData[writeIndex++] = data2[readIndex++];
  newData[writeIndex++] = child;
  while (readIndex < length)
    newData[writeIndex++] = data2[readIndex++];
  return makeNode(generation, node.datamap ^ bit, node.nodemap | bit, newData);
}
function fold(dict, state, fun) {
  const queue = [dict.root];
  while (queue.length) {
    const node = queue.pop();
    const data2 = node.data;
    const edgesStart = data2.length - popcount(node.nodemap);
    for (let i = 0;i < edgesStart; i += 2) {
      state = fun(state, data2[i], data2[i + 1]);
    }
    for (let i = edgesStart;i < data2.length; ++i) {
      queue.push(data2[i]);
    }
  }
  return state;
}
function popcount(n) {
  n -= n >>> 1 & 1431655765;
  n = (n & 858993459) + (n >>> 2 & 858993459);
  return Math.imul(n + (n >>> 4) & 252645135, 16843009) >>> 24;
}
function index(bitmap, bit) {
  return popcount(bitmap & bit - 1);
}
function hashbit(hash, shift) {
  return 1 << (hash >>> shift & mask);
}

// build/dev/javascript/gleam_stdlib/gleam/option.mjs
class Some extends CustomType {
  constructor($0) {
    super();
    this[0] = $0;
  }
}
var Option$isSome = (value) => value instanceof Some;
var Option$Some$0 = (value) => value[0];

class None extends CustomType {
}
function to_result(option, e) {
  if (option instanceof Some) {
    let a = option[0];
    return new Ok(a);
  } else {
    return new Error(e);
  }
}
function unwrap(option, default$) {
  if (option instanceof Some) {
    let x = option[0];
    return x;
  } else {
    return default$;
  }
}

// build/dev/javascript/gleam_stdlib/gleam/dict.mjs
function keys(dict) {
  return fold(dict, toList([]), (acc, key, _) => {
    return prepend(key, acc);
  });
}

// build/dev/javascript/gleam_stdlib/gleam/order.mjs
class Lt extends CustomType {
}
var Order$Lt = () => new Lt;
class Eq extends CustomType {
}
var Order$Eq = () => new Eq;
class Gt extends CustomType {
}
var Order$Gt = () => new Gt;

// build/dev/javascript/gleam_stdlib/gleam/list.mjs
class Ascending extends CustomType {
}

class Descending extends CustomType {
}
function reverse_and_prepend(loop$prefix, loop$suffix) {
  while (true) {
    let prefix = loop$prefix;
    let suffix = loop$suffix;
    if (prefix instanceof Empty) {
      return suffix;
    } else {
      let first$1 = prefix.head;
      let rest$1 = prefix.tail;
      loop$prefix = rest$1;
      loop$suffix = prepend(first$1, suffix);
    }
  }
}
function reverse(list) {
  return reverse_and_prepend(list, toList([]));
}
function contains(loop$list, loop$elem) {
  while (true) {
    let list = loop$list;
    let elem = loop$elem;
    if (list instanceof Empty) {
      return false;
    } else {
      let first$1 = list.head;
      if (isEqual(first$1, elem)) {
        return true;
      } else {
        let rest$1 = list.tail;
        loop$list = rest$1;
        loop$elem = elem;
      }
    }
  }
}
function filter_loop(loop$list, loop$fun, loop$acc) {
  while (true) {
    let list = loop$list;
    let fun = loop$fun;
    let acc = loop$acc;
    if (list instanceof Empty) {
      return reverse(acc);
    } else {
      let first$1 = list.head;
      let rest$1 = list.tail;
      let _block;
      let $ = fun(first$1);
      if ($) {
        _block = prepend(first$1, acc);
      } else {
        _block = acc;
      }
      let new_acc = _block;
      loop$list = rest$1;
      loop$fun = fun;
      loop$acc = new_acc;
    }
  }
}
function filter(list, predicate) {
  return filter_loop(list, predicate, toList([]));
}
function map_loop(loop$list, loop$fun, loop$acc) {
  while (true) {
    let list = loop$list;
    let fun = loop$fun;
    let acc = loop$acc;
    if (list instanceof Empty) {
      return reverse(acc);
    } else {
      let first$1 = list.head;
      let rest$1 = list.tail;
      loop$list = rest$1;
      loop$fun = fun;
      loop$acc = prepend(fun(first$1), acc);
    }
  }
}
function map2(list, fun) {
  return map_loop(list, fun, toList([]));
}
function append_loop(loop$first, loop$second) {
  while (true) {
    let first = loop$first;
    let second = loop$second;
    if (first instanceof Empty) {
      return second;
    } else {
      let first$1 = first.head;
      let rest$1 = first.tail;
      loop$first = rest$1;
      loop$second = prepend(first$1, second);
    }
  }
}
function append(first, second) {
  return append_loop(reverse(first), second);
}
function prepend2(list, item) {
  return prepend(item, list);
}
function fold2(loop$list, loop$initial, loop$fun) {
  while (true) {
    let list = loop$list;
    let initial = loop$initial;
    let fun = loop$fun;
    if (list instanceof Empty) {
      return initial;
    } else {
      let first$1 = list.head;
      let rest$1 = list.tail;
      loop$list = rest$1;
      loop$initial = fun(initial, first$1);
      loop$fun = fun;
    }
  }
}
function find(loop$list, loop$is_desired) {
  while (true) {
    let list = loop$list;
    let is_desired = loop$is_desired;
    if (list instanceof Empty) {
      return new Error(undefined);
    } else {
      let first$1 = list.head;
      let rest$1 = list.tail;
      let $ = is_desired(first$1);
      if ($) {
        return new Ok(first$1);
      } else {
        loop$list = rest$1;
        loop$is_desired = is_desired;
      }
    }
  }
}
function find_map(loop$list, loop$fun) {
  while (true) {
    let list = loop$list;
    let fun = loop$fun;
    if (list instanceof Empty) {
      return new Error(undefined);
    } else {
      let first$1 = list.head;
      let rest$1 = list.tail;
      let $ = fun(first$1);
      if ($ instanceof Ok) {
        return $;
      } else {
        loop$list = rest$1;
        loop$fun = fun;
      }
    }
  }
}
function merge_descendings(loop$list1, loop$list2, loop$compare, loop$acc) {
  while (true) {
    let list1 = loop$list1;
    let list2 = loop$list2;
    let compare2 = loop$compare;
    let acc = loop$acc;
    if (list1 instanceof Empty) {
      let list = list2;
      return reverse_and_prepend(list, acc);
    } else if (list2 instanceof Empty) {
      let list = list1;
      return reverse_and_prepend(list, acc);
    } else {
      let first1 = list1.head;
      let rest1 = list1.tail;
      let first2 = list2.head;
      let rest2 = list2.tail;
      let $ = compare2(first1, first2);
      if ($ instanceof Lt) {
        loop$list1 = list1;
        loop$list2 = rest2;
        loop$compare = compare2;
        loop$acc = prepend(first2, acc);
      } else if ($ instanceof Eq) {
        loop$list1 = rest1;
        loop$list2 = list2;
        loop$compare = compare2;
        loop$acc = prepend(first1, acc);
      } else {
        loop$list1 = rest1;
        loop$list2 = list2;
        loop$compare = compare2;
        loop$acc = prepend(first1, acc);
      }
    }
  }
}
function merge_descending_pairs(loop$sequences, loop$compare, loop$acc) {
  while (true) {
    let sequences = loop$sequences;
    let compare2 = loop$compare;
    let acc = loop$acc;
    if (sequences instanceof Empty) {
      return reverse(acc);
    } else {
      let $ = sequences.tail;
      if ($ instanceof Empty) {
        let sequence = sequences.head;
        return reverse(prepend(reverse(sequence), acc));
      } else {
        let descending1 = sequences.head;
        let descending2 = $.head;
        let rest$1 = $.tail;
        let ascending = merge_descendings(descending1, descending2, compare2, toList([]));
        loop$sequences = rest$1;
        loop$compare = compare2;
        loop$acc = prepend(ascending, acc);
      }
    }
  }
}
function merge_ascendings(loop$list1, loop$list2, loop$compare, loop$acc) {
  while (true) {
    let list1 = loop$list1;
    let list2 = loop$list2;
    let compare2 = loop$compare;
    let acc = loop$acc;
    if (list1 instanceof Empty) {
      let list = list2;
      return reverse_and_prepend(list, acc);
    } else if (list2 instanceof Empty) {
      let list = list1;
      return reverse_and_prepend(list, acc);
    } else {
      let first1 = list1.head;
      let rest1 = list1.tail;
      let first2 = list2.head;
      let rest2 = list2.tail;
      let $ = compare2(first1, first2);
      if ($ instanceof Lt) {
        loop$list1 = rest1;
        loop$list2 = list2;
        loop$compare = compare2;
        loop$acc = prepend(first1, acc);
      } else if ($ instanceof Eq) {
        loop$list1 = list1;
        loop$list2 = rest2;
        loop$compare = compare2;
        loop$acc = prepend(first2, acc);
      } else {
        loop$list1 = list1;
        loop$list2 = rest2;
        loop$compare = compare2;
        loop$acc = prepend(first2, acc);
      }
    }
  }
}
function merge_ascending_pairs(loop$sequences, loop$compare, loop$acc) {
  while (true) {
    let sequences = loop$sequences;
    let compare2 = loop$compare;
    let acc = loop$acc;
    if (sequences instanceof Empty) {
      return reverse(acc);
    } else {
      let $ = sequences.tail;
      if ($ instanceof Empty) {
        let sequence = sequences.head;
        return reverse(prepend(reverse(sequence), acc));
      } else {
        let ascending1 = sequences.head;
        let ascending2 = $.head;
        let rest$1 = $.tail;
        let descending = merge_ascendings(ascending1, ascending2, compare2, toList([]));
        loop$sequences = rest$1;
        loop$compare = compare2;
        loop$acc = prepend(descending, acc);
      }
    }
  }
}
function merge_all(loop$sequences, loop$direction, loop$compare) {
  while (true) {
    let sequences = loop$sequences;
    let direction = loop$direction;
    let compare2 = loop$compare;
    if (sequences instanceof Empty) {
      return sequences;
    } else if (direction instanceof Ascending) {
      let $ = sequences.tail;
      if ($ instanceof Empty) {
        let sequence = sequences.head;
        return sequence;
      } else {
        let sequences$1 = merge_ascending_pairs(sequences, compare2, toList([]));
        loop$sequences = sequences$1;
        loop$direction = new Descending;
        loop$compare = compare2;
      }
    } else {
      let $ = sequences.tail;
      if ($ instanceof Empty) {
        let sequence = sequences.head;
        return reverse(sequence);
      } else {
        let sequences$1 = merge_descending_pairs(sequences, compare2, toList([]));
        loop$sequences = sequences$1;
        loop$direction = new Ascending;
        loop$compare = compare2;
      }
    }
  }
}
function sequences(loop$list, loop$compare, loop$growing, loop$direction, loop$prev, loop$acc) {
  while (true) {
    let list = loop$list;
    let compare2 = loop$compare;
    let growing = loop$growing;
    let direction = loop$direction;
    let prev = loop$prev;
    let acc = loop$acc;
    let growing$1 = prepend(prev, growing);
    if (list instanceof Empty) {
      if (direction instanceof Ascending) {
        return prepend(reverse(growing$1), acc);
      } else {
        return prepend(growing$1, acc);
      }
    } else {
      let new$1 = list.head;
      let rest$1 = list.tail;
      let $ = compare2(prev, new$1);
      if (direction instanceof Ascending) {
        if ($ instanceof Lt) {
          loop$list = rest$1;
          loop$compare = compare2;
          loop$growing = growing$1;
          loop$direction = direction;
          loop$prev = new$1;
          loop$acc = acc;
        } else if ($ instanceof Eq) {
          loop$list = rest$1;
          loop$compare = compare2;
          loop$growing = growing$1;
          loop$direction = direction;
          loop$prev = new$1;
          loop$acc = acc;
        } else {
          let _block;
          if (direction instanceof Ascending) {
            _block = prepend(reverse(growing$1), acc);
          } else {
            _block = prepend(growing$1, acc);
          }
          let acc$1 = _block;
          if (rest$1 instanceof Empty) {
            return prepend(toList([new$1]), acc$1);
          } else {
            let next = rest$1.head;
            let rest$2 = rest$1.tail;
            let _block$1;
            let $1 = compare2(new$1, next);
            if ($1 instanceof Lt) {
              _block$1 = new Ascending;
            } else if ($1 instanceof Eq) {
              _block$1 = new Ascending;
            } else {
              _block$1 = new Descending;
            }
            let direction$1 = _block$1;
            loop$list = rest$2;
            loop$compare = compare2;
            loop$growing = toList([new$1]);
            loop$direction = direction$1;
            loop$prev = next;
            loop$acc = acc$1;
          }
        }
      } else if ($ instanceof Lt) {
        let _block;
        if (direction instanceof Ascending) {
          _block = prepend(reverse(growing$1), acc);
        } else {
          _block = prepend(growing$1, acc);
        }
        let acc$1 = _block;
        if (rest$1 instanceof Empty) {
          return prepend(toList([new$1]), acc$1);
        } else {
          let next = rest$1.head;
          let rest$2 = rest$1.tail;
          let _block$1;
          let $1 = compare2(new$1, next);
          if ($1 instanceof Lt) {
            _block$1 = new Ascending;
          } else if ($1 instanceof Eq) {
            _block$1 = new Ascending;
          } else {
            _block$1 = new Descending;
          }
          let direction$1 = _block$1;
          loop$list = rest$2;
          loop$compare = compare2;
          loop$growing = toList([new$1]);
          loop$direction = direction$1;
          loop$prev = next;
          loop$acc = acc$1;
        }
      } else if ($ instanceof Eq) {
        let _block;
        if (direction instanceof Ascending) {
          _block = prepend(reverse(growing$1), acc);
        } else {
          _block = prepend(growing$1, acc);
        }
        let acc$1 = _block;
        if (rest$1 instanceof Empty) {
          return prepend(toList([new$1]), acc$1);
        } else {
          let next = rest$1.head;
          let rest$2 = rest$1.tail;
          let _block$1;
          let $1 = compare2(new$1, next);
          if ($1 instanceof Lt) {
            _block$1 = new Ascending;
          } else if ($1 instanceof Eq) {
            _block$1 = new Ascending;
          } else {
            _block$1 = new Descending;
          }
          let direction$1 = _block$1;
          loop$list = rest$2;
          loop$compare = compare2;
          loop$growing = toList([new$1]);
          loop$direction = direction$1;
          loop$prev = next;
          loop$acc = acc$1;
        }
      } else {
        loop$list = rest$1;
        loop$compare = compare2;
        loop$growing = growing$1;
        loop$direction = direction;
        loop$prev = new$1;
        loop$acc = acc;
      }
    }
  }
}
function sort(list, compare2) {
  if (list instanceof Empty) {
    return list;
  } else {
    let $ = list.tail;
    if ($ instanceof Empty) {
      return list;
    } else {
      let x = list.head;
      let y = $.head;
      let rest$1 = $.tail;
      let _block;
      let $1 = compare2(x, y);
      if ($1 instanceof Lt) {
        _block = new Ascending;
      } else if ($1 instanceof Eq) {
        _block = new Ascending;
      } else {
        _block = new Descending;
      }
      let direction = _block;
      let sequences$1 = sequences(rest$1, compare2, toList([x]), direction, y, toList([]));
      return merge_all(sequences$1, new Ascending, compare2);
    }
  }
}
function key_find(keyword_list, desired_key) {
  return find_map(keyword_list, (keyword) => {
    let key = keyword[0];
    let value = keyword[1];
    let $ = isEqual(key, desired_key);
    if ($) {
      return new Ok(value);
    } else {
      return new Error(undefined);
    }
  });
}
function each(loop$list, loop$f) {
  while (true) {
    let list = loop$list;
    let f = loop$f;
    if (list instanceof Empty) {
      return;
    } else {
      let first$1 = list.head;
      let rest$1 = list.tail;
      f(first$1);
      loop$list = rest$1;
      loop$f = f;
    }
  }
}

// build/dev/javascript/gleam_stdlib/gleam/string.mjs
function slice(string, idx, len) {
  let $ = len <= 0;
  if ($) {
    return "";
  } else {
    let $1 = idx < 0;
    if ($1) {
      let translated_idx = string_length(string) + idx;
      let $2 = translated_idx < 0;
      if ($2) {
        return "";
      } else {
        return string_grapheme_slice(string, translated_idx, len);
      }
    } else {
      return string_grapheme_slice(string, idx, len);
    }
  }
}
function drop_start(string, num_graphemes) {
  let $ = num_graphemes <= 0;
  if ($) {
    return string;
  } else {
    let prefix = string_grapheme_slice(string, 0, num_graphemes);
    let prefix_size = byte_size(prefix);
    return string_byte_slice(string, prefix_size, byte_size(string) - prefix_size);
  }
}
function drop_end(string, num_graphemes) {
  let $ = num_graphemes <= 0;
  if ($) {
    return string;
  } else {
    return slice(string, 0, string_length(string) - num_graphemes);
  }
}
function split2(x, substring) {
  if (substring === "") {
    return graphemes(x);
  } else {
    let _pipe = x;
    let _pipe$1 = identity(_pipe);
    let _pipe$2 = split(_pipe$1, substring);
    return map2(_pipe$2, identity);
  }
}
function concat_loop(loop$strings, loop$accumulator) {
  while (true) {
    let strings = loop$strings;
    let accumulator = loop$accumulator;
    if (strings instanceof Empty) {
      return accumulator;
    } else {
      let string = strings.head;
      let strings$1 = strings.tail;
      loop$strings = strings$1;
      loop$accumulator = accumulator + string;
    }
  }
}
function concat2(strings) {
  return concat_loop(strings, "");
}

// build/dev/javascript/gleam_stdlib/gleam/dynamic/decode.mjs
class DecodeError extends CustomType {
  constructor(expected, found, path) {
    super();
    this.expected = expected;
    this.found = found;
    this.path = path;
  }
}
class Decoder extends CustomType {
  constructor(function$) {
    super();
    this.function = function$;
  }
}
var float2 = /* @__PURE__ */ new Decoder(decode_float);
var int2 = /* @__PURE__ */ new Decoder(decode_int);
var string2 = /* @__PURE__ */ new Decoder(decode_string);
function run(data2, decoder) {
  let $ = decoder.function(data2);
  let maybe_invalid_data = $[0];
  let errors = $[1];
  if (errors instanceof Empty) {
    return new Ok(maybe_invalid_data);
  } else {
    return new Error(errors);
  }
}
function run_dynamic_function(data2, name, f) {
  let $ = f(data2);
  if ($ instanceof Ok) {
    let data$1 = $[0];
    return [data$1, toList([])];
  } else {
    let placeholder = $[0];
    return [
      placeholder,
      toList([new DecodeError(name, classify_dynamic(data2), toList([]))])
    ];
  }
}
function decode_float(data2) {
  return run_dynamic_function(data2, "Float", float);
}
function map3(decoder, transformer) {
  return new Decoder((d) => {
    let $ = decoder.function(d);
    let data2 = $[0];
    let errors = $[1];
    return [transformer(data2), errors];
  });
}
function decode_int(data2) {
  return run_dynamic_function(data2, "Int", int);
}
function decode_string(data2) {
  return run_dynamic_function(data2, "String", string);
}
function run_decoders(loop$data, loop$failure, loop$decoders) {
  while (true) {
    let data2 = loop$data;
    let failure = loop$failure;
    let decoders = loop$decoders;
    if (decoders instanceof Empty) {
      return failure;
    } else {
      let decoder = decoders.head;
      let decoders$1 = decoders.tail;
      let $ = decoder.function(data2);
      let layer = $;
      let errors = $[1];
      if (errors instanceof Empty) {
        return layer;
      } else {
        loop$data = data2;
        loop$failure = failure;
        loop$decoders = decoders$1;
      }
    }
  }
}
function one_of(first, alternatives) {
  return new Decoder((dynamic_data) => {
    let $ = first.function(dynamic_data);
    let layer = $;
    let errors = $[1];
    if (errors instanceof Empty) {
      return layer;
    } else {
      return run_decoders(dynamic_data, layer, alternatives);
    }
  });
}
function path_segment_to_string(key) {
  let decoder = one_of(string2, toList([
    (() => {
      let _pipe = int2;
      return map3(_pipe, to_string);
    })(),
    (() => {
      let _pipe = float2;
      return map3(_pipe, float_to_string);
    })()
  ]));
  let $ = run(key, decoder);
  if ($ instanceof Ok) {
    let key$1 = $[0];
    return key$1;
  } else {
    return "<" + classify_dynamic(key) + ">";
  }
}
function push_path(layer, path) {
  let path$1 = map2(path, (key) => {
    let _pipe = key;
    let _pipe$1 = identity(_pipe);
    return path_segment_to_string(_pipe$1);
  });
  let errors = map2(layer[1], (error) => {
    return new DecodeError(error.expected, error.found, append(path$1, error.path));
  });
  return [layer[0], errors];
}
function index3(loop$path, loop$position, loop$inner, loop$data, loop$handle_miss) {
  while (true) {
    let path = loop$path;
    let position = loop$position;
    let inner = loop$inner;
    let data2 = loop$data;
    let handle_miss = loop$handle_miss;
    if (path instanceof Empty) {
      let _pipe = data2;
      let _pipe$1 = inner(_pipe);
      return push_path(_pipe$1, reverse(position));
    } else {
      let key = path.head;
      let path$1 = path.tail;
      let $ = index2(data2, key);
      if ($ instanceof Ok) {
        let $1 = $[0];
        if ($1 instanceof Some) {
          let data$1 = $1[0];
          loop$path = path$1;
          loop$position = prepend(key, position);
          loop$inner = inner;
          loop$data = data$1;
          loop$handle_miss = handle_miss;
        } else {
          return handle_miss(data2, prepend(key, position));
        }
      } else {
        let kind = $[0];
        let $1 = inner(data2);
        let default$ = $1[0];
        let _pipe = [
          default$,
          toList([new DecodeError(kind, classify_dynamic(data2), toList([]))])
        ];
        return push_path(_pipe, reverse(position));
      }
    }
  }
}
function subfield(field_path, field_decoder, next) {
  return new Decoder((data2) => {
    let $ = index3(field_path, toList([]), field_decoder.function, data2, (data3, position) => {
      let $12 = field_decoder.function(data3);
      let default$ = $12[0];
      let _pipe = [
        default$,
        toList([new DecodeError("Field", "Nothing", toList([]))])
      ];
      return push_path(_pipe, reverse(position));
    });
    let out = $[0];
    let errors1 = $[1];
    let $1 = next(out).function(data2);
    let out$1 = $1[0];
    let errors2 = $1[1];
    return [out$1, append(errors1, errors2)];
  });
}
function success(data2) {
  return new Decoder((_) => {
    return [data2, toList([])];
  });
}
function field(field_name, field_decoder, next) {
  return subfield(toList([field_name]), field_decoder, next);
}

// build/dev/javascript/gleam_stdlib/gleam_stdlib.mjs
var Nil = undefined;
function identity(x) {
  return x;
}
function parse_int(value) {
  if (/^[-+]?(\d+)$/.test(value)) {
    return Result$Ok(parseInt(value));
  } else {
    return Result$Error(Nil);
  }
}
function parse_float(value) {
  if (/^[-+]?(\d+)\.(\d+)([eE][-+]?\d+)?$/.test(value)) {
    return Result$Ok(parseFloat(value));
  } else {
    return Result$Error(Nil);
  }
}
function to_string(term) {
  return term.toString();
}
function string_length(string3) {
  if (string3 === "") {
    return 0;
  }
  const iterator = graphemes_iterator(string3);
  if (iterator) {
    let i = 0;
    for (const _ of iterator) {
      i++;
    }
    return i;
  } else {
    return string3.match(/./gsu).length;
  }
}
function graphemes(string3) {
  const iterator = graphemes_iterator(string3);
  if (iterator) {
    return arrayToList(Array.from(iterator).map((item) => item.segment));
  } else {
    return arrayToList(string3.match(/./gsu));
  }
}
var segmenter = undefined;
function graphemes_iterator(string3) {
  if (globalThis.Intl && Intl.Segmenter) {
    segmenter ||= new Intl.Segmenter;
    return segmenter.segment(string3)[Symbol.iterator]();
  }
}
function pop_codeunit(str) {
  return [str.charCodeAt(0) | 0, str.slice(1)];
}
function lowercase(string3) {
  return string3.toLowerCase();
}
function split(xs, pattern) {
  return arrayToList(xs.split(pattern));
}
function string_byte_slice(string3, index4, length2) {
  return string3.slice(index4, index4 + length2);
}
function string_grapheme_slice(string3, idx, len) {
  if (len <= 0 || idx >= string3.length) {
    return "";
  }
  const iterator = graphemes_iterator(string3);
  if (iterator) {
    while (idx-- > 0) {
      iterator.next();
    }
    let result = "";
    while (len-- > 0) {
      const v = iterator.next().value;
      if (v === undefined) {
        break;
      }
      result += v.segment;
    }
    return result;
  } else {
    return string3.match(/./gsu).slice(idx, idx + len).join("");
  }
}
function string_codeunit_slice(str, from2, length2) {
  return str.slice(from2, from2 + length2);
}
function starts_with(haystack, needle) {
  return haystack.startsWith(needle);
}
function ends_with(haystack, needle) {
  return haystack.endsWith(needle);
}
var unicode_whitespaces = [
  " ",
  "\t",
  `
`,
  "\v",
  "\f",
  "\r",
  "",
  "\u2028",
  "\u2029"
].join("");
var trim_start_regex = /* @__PURE__ */ new RegExp(`^[${unicode_whitespaces}]*`);
var trim_end_regex = /* @__PURE__ */ new RegExp(`[${unicode_whitespaces}]*$`);
function unsafe_percent_decode_query(string3) {
  return decodeURIComponent((string3 || "").replaceAll("+", " "));
}
function percent_encode(string3) {
  return encodeURIComponent(string3).replaceAll("%2B", "+");
}
function parse_query(query) {
  try {
    const pairs = [];
    for (const section of query.split("&")) {
      const [key, value] = section.split("=");
      if (!key)
        continue;
      const decodedKey = unsafe_percent_decode_query(key);
      const decodedValue = unsafe_percent_decode_query(value);
      pairs.push([decodedKey, decodedValue]);
    }
    return Result$Ok(arrayToList(pairs));
  } catch {
    return Result$Error(Nil);
  }
}
function classify_dynamic(data2) {
  if (typeof data2 === "string") {
    return "String";
  } else if (typeof data2 === "boolean") {
    return "Bool";
  } else if (isResult(data2)) {
    return "Result";
  } else if (isList(data2)) {
    return "List";
  } else if (data2 instanceof BitArray) {
    return "BitArray";
  } else if (data2 instanceof Dict) {
    return "Dict";
  } else if (Number.isInteger(data2)) {
    return "Int";
  } else if (Array.isArray(data2)) {
    return `Array`;
  } else if (typeof data2 === "number") {
    return "Float";
  } else if (data2 === null) {
    return "Nil";
  } else if (data2 === undefined) {
    return "Nil";
  } else {
    const type = typeof data2;
    return type.charAt(0).toUpperCase() + type.slice(1);
  }
}
function byte_size(string3) {
  return new TextEncoder().encode(string3).length;
}
var MIN_I32 = -(2 ** 31);
var MAX_I32 = 2 ** 31 - 1;
var U32 = 2 ** 32;
var MAX_SAFE = Number.MAX_SAFE_INTEGER;
var MIN_SAFE = Number.MIN_SAFE_INTEGER;
function float_to_string(float3) {
  const string3 = float3.toString().replace("+", "");
  if (string3.indexOf(".") >= 0) {
    return string3;
  } else {
    const index4 = string3.indexOf("e");
    if (index4 >= 0) {
      return string3.slice(0, index4) + ".0" + string3.slice(index4);
    } else {
      return string3 + ".0";
    }
  }
}

class Inspector {
  #references = new Set;
  inspect(v) {
    const t = typeof v;
    if (v === true)
      return "True";
    if (v === false)
      return "False";
    if (v === null)
      return "//js(null)";
    if (v === undefined)
      return "Nil";
    if (t === "string")
      return this.#string(v);
    if (t === "bigint" || Number.isInteger(v))
      return v.toString();
    if (t === "number")
      return float_to_string(v);
    if (v instanceof UtfCodepoint)
      return this.#utfCodepoint(v);
    if (v instanceof BitArray)
      return this.#bit_array(v);
    if (v instanceof RegExp)
      return `//js(${v})`;
    if (v instanceof Date)
      return `//js(Date("${v.toISOString()}"))`;
    if (v instanceof globalThis.Error)
      return `//js(${v.toString()})`;
    if (v instanceof Function) {
      const args = [];
      for (const i of Array(v.length).keys())
        args.push(String.fromCharCode(i + 97));
      return `//fn(${args.join(", ")}) { ... }`;
    }
    if (this.#references.size === this.#references.add(v).size) {
      return "//js(circular reference)";
    }
    let printed;
    if (Array.isArray(v)) {
      printed = `#(${v.map((v2) => this.inspect(v2)).join(", ")})`;
    } else if (isList(v)) {
      printed = this.#list(v);
    } else if (v instanceof CustomType) {
      printed = this.#customType(v);
    } else if (v instanceof Dict) {
      printed = this.#dict(v);
    } else if (v instanceof Set) {
      return `//js(Set(${[...v].map((v2) => this.inspect(v2)).join(", ")}))`;
    } else {
      printed = this.#object(v);
    }
    this.#references.delete(v);
    return printed;
  }
  #object(v) {
    const name = Object.getPrototypeOf(v)?.constructor?.name || "Object";
    const props = [];
    for (const k of Object.keys(v)) {
      props.push(`${this.inspect(k)}: ${this.inspect(v[k])}`);
    }
    const body = props.length ? " " + props.join(", ") + " " : "";
    const head = name === "Object" ? "" : name + " ";
    return `//js(${head}{${body}})`;
  }
  #dict(map4) {
    let body = "dict.from_list([";
    let first = true;
    body = fold(map4, body, (body2, key, value) => {
      if (!first)
        body2 = body2 + ", ";
      first = false;
      return body2 + "#(" + this.inspect(key) + ", " + this.inspect(value) + ")";
    });
    return body + "])";
  }
  #customType(record) {
    const props = Object.keys(record).map((label) => {
      const value = this.inspect(record[label]);
      return isNaN(parseInt(label)) ? `${label}: ${value}` : value;
    }).join(", ");
    return props ? `${record.constructor.name}(${props})` : record.constructor.name;
  }
  #list(list2) {
    if (List$isEmpty(list2)) {
      return "[]";
    }
    let char_out = 'charlist.from_string("';
    let list_out = "[";
    let current = list2;
    while (List$isNonEmpty(current)) {
      let element = current.head;
      current = current.tail;
      if (list_out !== "[") {
        list_out += ", ";
      }
      list_out += this.inspect(element);
      if (char_out) {
        if (Number.isInteger(element) && element >= 32 && element <= 126) {
          char_out += String.fromCharCode(element);
        } else {
          char_out = null;
        }
      }
    }
    if (char_out) {
      return char_out + '")';
    } else {
      return list_out + "]";
    }
  }
  #string(str) {
    let new_str = '"';
    for (let i = 0;i < str.length; i++) {
      const char = str[i];
      switch (char) {
        case `
`:
          new_str += "\\n";
          break;
        case "\r":
          new_str += "\\r";
          break;
        case "\t":
          new_str += "\\t";
          break;
        case "\f":
          new_str += "\\f";
          break;
        case "\\":
          new_str += "\\\\";
          break;
        case '"':
          new_str += "\\\"";
          break;
        default:
          if (char < " " || char > "~" && char < " ") {
            new_str += "\\u{" + char.charCodeAt(0).toString(16).toUpperCase().padStart(4, "0") + "}";
          } else {
            new_str += char;
          }
      }
    }
    new_str += '"';
    return new_str;
  }
  #utfCodepoint(codepoint2) {
    return `//utfcodepoint(${String.fromCodePoint(codepoint2.value)})`;
  }
  #bit_array(bits2) {
    if (bits2.bitSize === 0) {
      return "<<>>";
    }
    let acc = "<<";
    for (let i = 0;i < bits2.byteSize - 1; i++) {
      acc += bits2.byteAt(i).toString();
      acc += ", ";
    }
    if (bits2.byteSize * 8 === bits2.bitSize) {
      acc += bits2.byteAt(bits2.byteSize - 1).toString();
    } else {
      const trailingBitsCount = bits2.bitSize % 8;
      acc += bits2.byteAt(bits2.byteSize - 1) >> 8 - trailingBitsCount;
      acc += `:size(${trailingBitsCount})`;
    }
    acc += ">>";
    return acc;
  }
}
function index2(data2, key) {
  if (data2 instanceof Dict) {
    const result = get(data2, key);
    return Result$Ok(result.isOk() ? new Some(result[0]) : new None);
  }
  if (data2 instanceof WeakMap || data2 instanceof Map) {
    const token = {};
    const entry = data2.get(key, token);
    if (entry === token)
      return Result$Ok(new None);
    return Result$Ok(new Some(entry));
  }
  const key_is_int = Number.isInteger(key);
  if (key_is_int && key >= 0 && key < 8 && isList(data2)) {
    let i = 0;
    for (const value of data2) {
      if (i === key)
        return Result$Ok(new Some(value));
      i++;
    }
    return Result$Error("Indexable");
  }
  if (key_is_int && Array.isArray(data2) || data2 && typeof data2 === "object" || data2 && Object.getPrototypeOf(data2) === Object.prototype) {
    if (key in data2)
      return Result$Ok(new Some(data2[key]));
    return Result$Ok(new None);
  }
  return Result$Error(key_is_int ? "Indexable" : "Dict");
}
function float(data2) {
  if (typeof data2 === "number")
    return Result$Ok(data2);
  return Result$Error(0);
}
function int(data2) {
  if (Number.isInteger(data2))
    return Result$Ok(data2);
  return Result$Error(0);
}
function string(data2) {
  if (typeof data2 === "string")
    return Result$Ok(data2);
  return Result$Error("");
}
function arrayToList(array) {
  let list2 = List$Empty();
  let i = array.length;
  while (i--) {
    list2 = List$NonEmpty(array[i], list2);
  }
  return list2;
}
function isList(data2) {
  return List$isEmpty(data2) || List$isNonEmpty(data2);
}
function isResult(data2) {
  return Result$isOk(data2) || Result$isError(data2);
}
// build/dev/javascript/gleam_stdlib/gleam/result.mjs
function map_error(result, fun) {
  if (result instanceof Ok) {
    return result;
  } else {
    let error = result[0];
    return new Error(fun(error));
  }
}
function try$(result, fun) {
  if (result instanceof Ok) {
    let x = result[0];
    return fun(x);
  } else {
    return result;
  }
}
function replace_error(result, error) {
  if (result instanceof Ok) {
    return result;
  } else {
    return new Error(error);
  }
}
// build/dev/javascript/gleam_stdlib/gleam/bool.mjs
function guard(requirement, consequence, alternative) {
  if (requirement) {
    return consequence;
  } else {
    return alternative();
  }
}

// build/dev/javascript/gleam_stdlib/gleam/function.mjs
function identity2(x) {
  return x;
}
// build/dev/javascript/gleam_json/gleam_json_ffi.mjs
function decode(string3) {
  try {
    const result = JSON.parse(string3);
    return Result$Ok(result);
  } catch (err) {
    return Result$Error(getJsonDecodeError(err, string3));
  }
}
function getJsonDecodeError(stdErr, json) {
  if (isUnexpectedEndOfInput(stdErr))
    return DecodeError$UnexpectedEndOfInput();
  return toUnexpectedByteError(stdErr, json);
}
function isUnexpectedEndOfInput(err) {
  const unexpectedEndOfInputRegex = /((unexpected (end|eof))|(end of data)|(unterminated string)|(json( parse error|\.parse)\: expected '(\:|\}|\])'))/i;
  return unexpectedEndOfInputRegex.test(err.message);
}
function toUnexpectedByteError(err, json) {
  let converters = [
    v8UnexpectedByteError,
    oldV8UnexpectedByteError,
    jsCoreUnexpectedByteError,
    spidermonkeyUnexpectedByteError
  ];
  for (let converter of converters) {
    let result = converter(err, json);
    if (result)
      return result;
  }
  return DecodeError$UnexpectedByte("");
}
function v8UnexpectedByteError(err) {
  const regex = /unexpected token '(.)', ".+" is not valid JSON/i;
  const match = regex.exec(err.message);
  if (!match)
    return null;
  const byte = toHex(match[1]);
  return DecodeError$UnexpectedByte(byte);
}
function oldV8UnexpectedByteError(err) {
  const regex = /unexpected token (.) in JSON at position (\d+)/i;
  const match = regex.exec(err.message);
  if (!match)
    return null;
  const byte = toHex(match[1]);
  return DecodeError$UnexpectedByte(byte);
}
function spidermonkeyUnexpectedByteError(err, json) {
  const regex = /(unexpected character|expected .*) at line (\d+) column (\d+)/i;
  const match = regex.exec(err.message);
  if (!match)
    return null;
  const line = Number(match[2]);
  const column = Number(match[3]);
  const position = getPositionFromMultiline(line, column, json);
  const byte = toHex(json[position]);
  return DecodeError$UnexpectedByte(byte);
}
function jsCoreUnexpectedByteError(err) {
  const regex = /unexpected (identifier|token) "(.)"/i;
  const match = regex.exec(err.message);
  if (!match)
    return null;
  const byte = toHex(match[2]);
  return DecodeError$UnexpectedByte(byte);
}
function toHex(char) {
  return "0x" + char.charCodeAt(0).toString(16).toUpperCase();
}
function getPositionFromMultiline(line, column, string3) {
  if (line === 1)
    return column - 1;
  let currentLn = 1;
  let position = 0;
  string3.split("").find((char, idx) => {
    if (char === `
`)
      currentLn += 1;
    if (currentLn === line) {
      position = idx + column;
      return true;
    }
    return false;
  });
  return position;
}

// build/dev/javascript/gleam_json/gleam/json.mjs
class UnexpectedEndOfInput extends CustomType {
}
var DecodeError$UnexpectedEndOfInput = () => new UnexpectedEndOfInput;
class UnexpectedByte extends CustomType {
  constructor($0) {
    super();
    this[0] = $0;
  }
}
var DecodeError$UnexpectedByte = ($0) => new UnexpectedByte($0);
class UnableToDecode extends CustomType {
  constructor($0) {
    super();
    this[0] = $0;
  }
}
function do_parse(json, decoder) {
  return try$(decode(json), (dynamic_value) => {
    let _pipe = run(dynamic_value, decoder);
    return map_error(_pipe, (var0) => {
      return new UnableToDecode(var0);
    });
  });
}
function parse(json, decoder) {
  return do_parse(json, decoder);
}
// build/dev/javascript/houdini/houdini.ffi.mjs
function escape(string3) {
  return string3.replaceAll(/[><&"']/g, (replaced) => {
    switch (replaced) {
      case ">":
        return "&gt;";
      case "<":
        return "&lt;";
      case "'":
        return "&#39;";
      case "&":
        return "&amp;";
      case '"':
        return "&quot;";
      default:
        return replaced;
    }
  });
}

// build/dev/javascript/lustre/lustre/internals/constants.mjs
var empty_list = /* @__PURE__ */ toList([]);
var error_nil = /* @__PURE__ */ new Error(undefined);
function singleton_list(item) {
  return prepend(item, empty_list);
}

// build/dev/javascript/lustre/lustre/vdom/vattr.ffi.mjs
var GT = /* @__PURE__ */ Order$Gt();
var LT = /* @__PURE__ */ Order$Lt();
var EQ = /* @__PURE__ */ Order$Eq();
function compare2(a, b) {
  if (a.name === b.name) {
    return EQ;
  } else if (a.name < b.name) {
    return LT;
  } else {
    return GT;
  }
}

// build/dev/javascript/lustre/lustre/vdom/vattr.mjs
class Attribute extends CustomType {
  constructor(kind, name, value) {
    super();
    this.kind = kind;
    this.name = name;
    this.value = value;
  }
}
class Property extends CustomType {
  constructor(kind, name, value) {
    super();
    this.kind = kind;
    this.name = name;
    this.value = value;
  }
}
class Event2 extends CustomType {
  constructor(kind, name, handler, include, prevent_default, stop_propagation, debounce, throttle) {
    super();
    this.kind = kind;
    this.name = name;
    this.handler = handler;
    this.include = include;
    this.prevent_default = prevent_default;
    this.stop_propagation = stop_propagation;
    this.debounce = debounce;
    this.throttle = throttle;
  }
}
class Handler extends CustomType {
  constructor(prevent_default, stop_propagation, message) {
    super();
    this.prevent_default = prevent_default;
    this.stop_propagation = stop_propagation;
    this.message = message;
  }
}
var attribute_kind = 0;
var property_kind = 1;
var event_kind = 2;
var never_kind = 0;
var always_kind = 2;
function attribute(name, value) {
  return new Attribute(attribute_kind, name, value);
}
function merge(loop$attributes, loop$merged) {
  while (true) {
    let attributes = loop$attributes;
    let merged = loop$merged;
    if (attributes instanceof Empty) {
      return merged;
    } else {
      let $ = attributes.head;
      if ($ instanceof Attribute) {
        let $1 = $.name;
        if ($1 === "") {
          let rest = attributes.tail;
          loop$attributes = rest;
          loop$merged = merged;
        } else if ($1 === "class") {
          let $2 = $.value;
          if ($2 === "") {
            let rest = attributes.tail;
            loop$attributes = rest;
            loop$merged = merged;
          } else {
            let $3 = attributes.tail;
            if ($3 instanceof Empty) {
              let attribute$1 = $;
              let rest = $3;
              loop$attributes = rest;
              loop$merged = prepend(attribute$1, merged);
            } else {
              let $4 = $3.head;
              if ($4 instanceof Attribute) {
                let $5 = $4.name;
                if ($5 === "class") {
                  let kind = $.kind;
                  let class1 = $2;
                  let rest = $3.tail;
                  let class2 = $4.value;
                  let value = class1 + " " + class2;
                  let attribute$1 = new Attribute(kind, "class", value);
                  loop$attributes = prepend(attribute$1, rest);
                  loop$merged = merged;
                } else {
                  let attribute$1 = $;
                  let rest = $3;
                  loop$attributes = rest;
                  loop$merged = prepend(attribute$1, merged);
                }
              } else {
                let attribute$1 = $;
                let rest = $3;
                loop$attributes = rest;
                loop$merged = prepend(attribute$1, merged);
              }
            }
          }
        } else if ($1 === "style") {
          let $2 = $.value;
          if ($2 === "") {
            let rest = attributes.tail;
            loop$attributes = rest;
            loop$merged = merged;
          } else {
            let $3 = attributes.tail;
            if ($3 instanceof Empty) {
              let attribute$1 = $;
              let rest = $3;
              loop$attributes = rest;
              loop$merged = prepend(attribute$1, merged);
            } else {
              let $4 = $3.head;
              if ($4 instanceof Attribute) {
                let $5 = $4.name;
                if ($5 === "style") {
                  let kind = $.kind;
                  let style1 = $2;
                  let rest = $3.tail;
                  let style2 = $4.value;
                  let value = style1 + ";" + style2;
                  let attribute$1 = new Attribute(kind, "style", value);
                  loop$attributes = prepend(attribute$1, rest);
                  loop$merged = merged;
                } else {
                  let attribute$1 = $;
                  let rest = $3;
                  loop$attributes = rest;
                  loop$merged = prepend(attribute$1, merged);
                }
              } else {
                let attribute$1 = $;
                let rest = $3;
                loop$attributes = rest;
                loop$merged = prepend(attribute$1, merged);
              }
            }
          }
        } else {
          let attribute$1 = $;
          let rest = attributes.tail;
          loop$attributes = rest;
          loop$merged = prepend(attribute$1, merged);
        }
      } else {
        let attribute$1 = $;
        let rest = attributes.tail;
        loop$attributes = rest;
        loop$merged = prepend(attribute$1, merged);
      }
    }
  }
}
function prepare(attributes) {
  if (attributes instanceof Empty) {
    return attributes;
  } else {
    let $ = attributes.tail;
    if ($ instanceof Empty) {
      return attributes;
    } else {
      let _pipe = attributes;
      let _pipe$1 = sort(_pipe, (a, b) => {
        return compare2(b, a);
      });
      return merge(_pipe$1, empty_list);
    }
  }
}

// build/dev/javascript/lustre/lustre/attribute.mjs
function attribute2(name, value) {
  return attribute(name, value);
}
function class$(name) {
  return attribute2("class", name);
}
function do_styles(loop$properties, loop$styles) {
  while (true) {
    let properties = loop$properties;
    let styles = loop$styles;
    if (properties instanceof Empty) {
      return styles;
    } else {
      let $ = properties.head[0];
      if ($ === "") {
        let rest = properties.tail;
        loop$properties = rest;
        loop$styles = styles;
      } else {
        let $1 = properties.head[1];
        if ($1 === "") {
          let rest = properties.tail;
          loop$properties = rest;
          loop$styles = styles;
        } else {
          let rest = properties.tail;
          let name$1 = $;
          let value$1 = $1;
          loop$properties = rest;
          loop$styles = styles + name$1 + ":" + value$1 + ";";
        }
      }
    }
  }
}
function styles(properties) {
  return attribute2("style", do_styles(properties, ""));
}
function href(url) {
  return attribute2("href", url);
}
function src(url) {
  return attribute2("src", url);
}
function width(value) {
  return attribute2("width", to_string(value));
}
function height(value) {
  return attribute2("height", to_string(value));
}

// build/dev/javascript/lustre/lustre/effect.mjs
class Effect extends CustomType {
  constructor(synchronous, before_paint, after_paint) {
    super();
    this.synchronous = synchronous;
    this.before_paint = before_paint;
    this.after_paint = after_paint;
  }
}

class Actions extends CustomType {
  constructor(dispatch, emit, select, root, provide, subscribe, unsubscribe) {
    super();
    this.dispatch = dispatch;
    this.emit = emit;
    this.select = select;
    this.root = root;
    this.provide = provide;
    this.subscribe = subscribe;
    this.unsubscribe = unsubscribe;
  }
}
var empty = /* @__PURE__ */ new Effect(empty_list, empty_list, empty_list);
function none() {
  return empty;
}
function from2(effect) {
  let task = (actions) => {
    let dispatch = actions.dispatch;
    return effect(dispatch);
  };
  return new Effect(singleton_list(task), empty.before_paint, empty.after_paint);
}
function after_paint(effect) {
  let task = (actions) => {
    let root = actions.root();
    let dispatch = actions.dispatch;
    return effect(dispatch, root);
  };
  return new Effect(empty.synchronous, empty.before_paint, singleton_list(task));
}
function batch(effects) {
  return fold2(effects, empty, (acc, eff) => {
    return new Effect(fold2(eff.synchronous, acc.synchronous, prepend2), fold2(eff.before_paint, acc.before_paint, prepend2), fold2(eff.after_paint, acc.after_paint, prepend2));
  });
}
function perform(effect, dispatch, emit, select, root, provide, subscribe, unsubscribe) {
  let actions = new Actions(dispatch, emit, select, root, provide, subscribe, unsubscribe);
  return each(effect.synchronous, (run2) => {
    return run2(actions);
  });
}

// build/dev/javascript/lustre/lustre/internals/mutable_map.ffi.mjs
function empty2() {
  return null;
}
function get2(map4, key) {
  return map4?.get(key);
}
function get_or_compute(map4, key, compute) {
  return map4?.get(key) ?? compute();
}
function has_key(map4, key) {
  return map4 && map4.has(key);
}
function insert2(map4, key, value) {
  map4 ??= new Map;
  map4.set(key, value);
  return map4;
}
function remove(map4, key) {
  map4?.delete(key);
  return map4;
}

// build/dev/javascript/lustre/lustre/internals/ref.ffi.mjs
function sameValueZero(x, y) {
  if (typeof x === "number" && typeof y === "number") {
    return x === y || x !== x && y !== y;
  }
  return x === y;
}

// build/dev/javascript/lustre/lustre/internals/ref.mjs
function equal_lists(loop$xs, loop$ys) {
  while (true) {
    let xs = loop$xs;
    let ys = loop$ys;
    if (xs instanceof Empty) {
      if (ys instanceof Empty) {
        return true;
      } else {
        return false;
      }
    } else if (ys instanceof Empty) {
      return false;
    } else {
      let x = xs.head;
      let xs$1 = xs.tail;
      let y = ys.head;
      let ys$1 = ys.tail;
      let $ = sameValueZero(x, y);
      if ($) {
        loop$xs = xs$1;
        loop$ys = ys$1;
      } else {
        return $;
      }
    }
  }
}

// build/dev/javascript/lustre/lustre/vdom/vnode.mjs
class Fragment extends CustomType {
  constructor(kind, key, children, keyed_children) {
    super();
    this.kind = kind;
    this.key = key;
    this.children = children;
    this.keyed_children = keyed_children;
  }
}
class Element extends CustomType {
  constructor(kind, key, namespace, tag, attributes, children, keyed_children, self_closing, void$) {
    super();
    this.kind = kind;
    this.key = key;
    this.namespace = namespace;
    this.tag = tag;
    this.attributes = attributes;
    this.children = children;
    this.keyed_children = keyed_children;
    this.self_closing = self_closing;
    this.void = void$;
  }
}
class Text extends CustomType {
  constructor(kind, key, content) {
    super();
    this.kind = kind;
    this.key = key;
    this.content = content;
  }
}
class UnsafeInnerHtml extends CustomType {
  constructor(kind, key, namespace, tag, attributes, inner_html) {
    super();
    this.kind = kind;
    this.key = key;
    this.namespace = namespace;
    this.tag = tag;
    this.attributes = attributes;
    this.inner_html = inner_html;
  }
}
class Map2 extends CustomType {
  constructor(kind, key, mapper, child) {
    super();
    this.kind = kind;
    this.key = key;
    this.mapper = mapper;
    this.child = child;
  }
}
class Memo extends CustomType {
  constructor(kind, key, dependencies, view) {
    super();
    this.kind = kind;
    this.key = key;
    this.dependencies = dependencies;
    this.view = view;
  }
}
var fragment_kind = 0;
var element_kind = 1;
var text_kind = 2;
var unsafe_inner_html_kind = 3;
var map_kind = 4;
var memo_kind = 5;
function fragment(key, children, keyed_children) {
  return new Fragment(fragment_kind, key, children, keyed_children);
}
function element(key, namespace, tag, attributes, children, keyed_children, self_closing, void$) {
  return new Element(element_kind, key, namespace, tag, prepare(attributes), children, keyed_children, self_closing, void$);
}
function is_void_html_element(tag, namespace) {
  if (namespace === "") {
    if (tag === "area") {
      return true;
    } else if (tag === "base") {
      return true;
    } else if (tag === "br") {
      return true;
    } else if (tag === "col") {
      return true;
    } else if (tag === "embed") {
      return true;
    } else if (tag === "hr") {
      return true;
    } else if (tag === "img") {
      return true;
    } else if (tag === "input") {
      return true;
    } else if (tag === "link") {
      return true;
    } else if (tag === "meta") {
      return true;
    } else if (tag === "param") {
      return true;
    } else if (tag === "source") {
      return true;
    } else if (tag === "track") {
      return true;
    } else if (tag === "wbr") {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
}
function text(key, content) {
  return new Text(text_kind, key, content);
}
function unsafe_inner_html(key, namespace, tag, attributes, inner_html) {
  return new UnsafeInnerHtml(unsafe_inner_html_kind, key, namespace, tag, prepare(attributes), inner_html);
}
function map4(element2, mapper) {
  if (element2 instanceof Map2) {
    let child_mapper = element2.mapper;
    return new Map2(map_kind, element2.key, (handler) => {
      return identity2(mapper)(child_mapper(handler));
    }, identity2(element2.child));
  } else {
    return new Map2(map_kind, element2.key, identity2(mapper), identity2(element2));
  }
}
function memo(key, dependencies, view) {
  return new Memo(memo_kind, key, dependencies, view);
}
function to_keyed(key, node) {
  if (node instanceof Fragment) {
    return new Fragment(node.kind, key, node.children, node.keyed_children);
  } else if (node instanceof Element) {
    return new Element(node.kind, key, node.namespace, node.tag, node.attributes, node.children, node.keyed_children, node.self_closing, node.void);
  } else if (node instanceof Text) {
    return new Text(node.kind, key, node.content);
  } else if (node instanceof UnsafeInnerHtml) {
    return new UnsafeInnerHtml(node.kind, key, node.namespace, node.tag, node.attributes, node.inner_html);
  } else if (node instanceof Map2) {
    let child = node.child;
    return new Map2(node.kind, key, node.mapper, to_keyed(key, child));
  } else {
    let view = node.view;
    return new Memo(node.kind, key, node.dependencies, () => {
      return to_keyed(key, view());
    });
  }
}

// build/dev/javascript/lustre/lustre/element.mjs
function element2(tag, attributes, children) {
  return element("", "", tag, attributes, children, empty2(), false, is_void_html_element(tag, ""));
}
function text2(content) {
  return text("", content);
}
function none2() {
  return text("", "");
}
function unsafe_raw_html(namespace, tag, attributes, inner_html) {
  return unsafe_inner_html("", namespace, tag, attributes, inner_html);
}
function memo2(dependencies, view) {
  return memo("", dependencies, view);
}
function ref(value) {
  return identity2(value);
}
function map5(element3, f) {
  return map4(element3, f);
}

// build/dev/javascript/lustre/lustre/element/html.mjs
function style(attrs, css) {
  return unsafe_raw_html("", "style", attrs, css);
}
function h1(attrs, children) {
  return element2("h1", attrs, children);
}
function blockquote(attrs, children) {
  return element2("blockquote", attrs, children);
}
function div(attrs, children) {
  return element2("div", attrs, children);
}
function p(attrs, children) {
  return element2("p", attrs, children);
}
function a(attrs, children) {
  return element2("a", attrs, children);
}
function code(attrs, children) {
  return element2("code", attrs, children);
}
function iframe(attrs) {
  return element2("iframe", attrs, empty_list);
}
function script(attrs, js) {
  return unsafe_raw_html("", "script", attrs, js);
}
function details(attrs, children) {
  return element2("details", attrs, children);
}
function summary(attrs, children) {
  return element2("summary", attrs, children);
}

// build/dev/javascript/lustre/lustre/vdom/patch.mjs
class Patch extends CustomType {
  constructor(index4, path, removed, changes, children) {
    super();
    this.index = index4;
    this.path = path;
    this.removed = removed;
    this.changes = changes;
    this.children = children;
  }
}
class ReplaceText extends CustomType {
  constructor(kind, content) {
    super();
    this.kind = kind;
    this.content = content;
  }
}
class ReplaceInnerHtml extends CustomType {
  constructor(kind, inner_html) {
    super();
    this.kind = kind;
    this.inner_html = inner_html;
  }
}
class Update extends CustomType {
  constructor(kind, added, removed) {
    super();
    this.kind = kind;
    this.added = added;
    this.removed = removed;
  }
}
class Move extends CustomType {
  constructor(kind, key, before) {
    super();
    this.kind = kind;
    this.key = key;
    this.before = before;
  }
}
class Replace extends CustomType {
  constructor(kind, index4, with$) {
    super();
    this.kind = kind;
    this.index = index4;
    this.with = with$;
  }
}
class Remove extends CustomType {
  constructor(kind, index4) {
    super();
    this.kind = kind;
    this.index = index4;
  }
}
class Insert extends CustomType {
  constructor(kind, children, before) {
    super();
    this.kind = kind;
    this.children = children;
    this.before = before;
  }
}
var replace_text_kind = 0;
var replace_inner_html_kind = 1;
var update_kind = 2;
var move_kind = 3;
var remove_kind = 4;
var replace_kind = 5;
var insert_kind = 6;
function new$3(index4, removed, changes, children) {
  return new Patch(index4, empty_list, removed, changes, children);
}
function replace_text(content) {
  return new ReplaceText(replace_text_kind, content);
}
function replace_inner_html(inner_html) {
  return new ReplaceInnerHtml(replace_inner_html_kind, inner_html);
}
function update(added, removed) {
  return new Update(update_kind, added, removed);
}
function move(key, before) {
  return new Move(move_kind, key, before);
}
function remove2(index4) {
  return new Remove(remove_kind, index4);
}
function replace2(index4, with$) {
  return new Replace(replace_kind, index4, with$);
}
function insert3(children, before) {
  return new Insert(insert_kind, children, before);
}
function add_parent(child, index4) {
  return new Patch(index4, prepend(child.index, child.path), child.removed, child.changes, child.children);
}

// build/dev/javascript/lustre/lustre/runtime/transport.mjs
class Mount extends CustomType {
  constructor(kind, open_shadow_root, will_adopt_styles, observed_attributes, observed_properties, requested_contexts, provided_contexts, vdom, memos) {
    super();
    this.kind = kind;
    this.open_shadow_root = open_shadow_root;
    this.will_adopt_styles = will_adopt_styles;
    this.observed_attributes = observed_attributes;
    this.observed_properties = observed_properties;
    this.requested_contexts = requested_contexts;
    this.provided_contexts = provided_contexts;
    this.vdom = vdom;
    this.memos = memos;
  }
}
class Reconcile extends CustomType {
  constructor(kind, patch, memos) {
    super();
    this.kind = kind;
    this.patch = patch;
    this.memos = memos;
  }
}
class Emit extends CustomType {
  constructor(kind, name, data2) {
    super();
    this.kind = kind;
    this.name = name;
    this.data = data2;
  }
}
class Provide extends CustomType {
  constructor(kind, key, value) {
    super();
    this.kind = kind;
    this.key = key;
    this.value = value;
  }
}
class Subscribe extends CustomType {
  constructor(kind, key) {
    super();
    this.kind = kind;
    this.key = key;
  }
}
class Unsubscribe extends CustomType {
  constructor(kind, key) {
    super();
    this.kind = kind;
    this.key = key;
  }
}
class Batch extends CustomType {
  constructor(kind, messages) {
    super();
    this.kind = kind;
    this.messages = messages;
  }
}
var ServerMessage$isBatch = (value) => value instanceof Batch;
class AttributeChanged extends CustomType {
  constructor(kind, name, value) {
    super();
    this.kind = kind;
    this.name = name;
    this.value = value;
  }
}
var ServerMessage$isAttributeChanged = (value) => value instanceof AttributeChanged;
class PropertyChanged extends CustomType {
  constructor(kind, name, value) {
    super();
    this.kind = kind;
    this.name = name;
    this.value = value;
  }
}
var ServerMessage$isPropertyChanged = (value) => value instanceof PropertyChanged;
class EventFired extends CustomType {
  constructor(kind, path, name, event) {
    super();
    this.kind = kind;
    this.path = path;
    this.name = name;
    this.event = event;
  }
}
var ServerMessage$isEventFired = (value) => value instanceof EventFired;
class ContextProvided extends CustomType {
  constructor(kind, key, value) {
    super();
    this.kind = kind;
    this.key = key;
    this.value = value;
  }
}
var ServerMessage$isContextProvided = (value) => value instanceof ContextProvided;
var mount_kind = 0;
var reconcile_kind = 1;
var emit_kind = 2;
var provide_kind = 3;
var subscribe_kind = 4;
var unsubscribe_kind = 5;
function mount(open_shadow_root, will_adopt_styles, observed_attributes, observed_properties, requested_contexts, provided_contexts, vdom, memos) {
  return new Mount(mount_kind, open_shadow_root, will_adopt_styles, observed_attributes, observed_properties, requested_contexts, provided_contexts, vdom, memos);
}
function reconcile(patch, memos) {
  return new Reconcile(reconcile_kind, patch, memos);
}
function emit(name, data2) {
  return new Emit(emit_kind, name, data2);
}
function provide(key, value) {
  return new Provide(provide_kind, key, value);
}
function subscribe(key) {
  return new Subscribe(subscribe_kind, key);
}
function unsubscribe(key) {
  return new Unsubscribe(unsubscribe_kind, key);
}

// build/dev/javascript/lustre/lustre/vdom/path.mjs
class Root extends CustomType {
}

class Key extends CustomType {
  constructor(key, parent) {
    super();
    this.key = key;
    this.parent = parent;
  }
}

class Index extends CustomType {
  constructor(index4, parent) {
    super();
    this.index = index4;
    this.parent = parent;
  }
}

class Subtree extends CustomType {
  constructor(parent) {
    super();
    this.parent = parent;
  }
}
var separator_subtree = "\r";
var separator_element = "\t";
var separator_event = `
`;
var root = /* @__PURE__ */ new Root;
function finish_to_string(acc) {
  if (acc instanceof Empty) {
    return "";
  } else {
    let segments = acc.tail;
    return concat2(segments);
  }
}
function do_to_string(loop$full, loop$path, loop$acc) {
  while (true) {
    let full = loop$full;
    let path = loop$path;
    let acc = loop$acc;
    if (path instanceof Root) {
      return finish_to_string(acc);
    } else if (path instanceof Key) {
      let key = path.key;
      let parent = path.parent;
      loop$full = full;
      loop$path = parent;
      loop$acc = prepend(separator_element, prepend(key, acc));
    } else if (path instanceof Index) {
      let index4 = path.index;
      let parent = path.parent;
      let acc$1 = prepend(separator_element, prepend(to_string(index4), acc));
      loop$full = full;
      loop$path = parent;
      loop$acc = acc$1;
    } else if (!full) {
      return finish_to_string(acc);
    } else {
      let parent = path.parent;
      if (acc instanceof Empty) {
        loop$full = full;
        loop$path = parent;
        loop$acc = acc;
      } else {
        let acc$1 = acc.tail;
        loop$full = full;
        loop$path = parent;
        loop$acc = prepend(separator_subtree, acc$1);
      }
    }
  }
}
function to_string3(path) {
  return do_to_string(true, path, empty_list);
}
function do_matches(loop$path, loop$candidates) {
  while (true) {
    let path = loop$path;
    let candidates = loop$candidates;
    if (candidates instanceof Empty) {
      return false;
    } else {
      let candidate = candidates.head;
      let rest = candidates.tail;
      let $ = starts_with(path, candidate);
      if ($) {
        return $;
      } else {
        loop$path = path;
        loop$candidates = rest;
      }
    }
  }
}
function matches(path, candidates) {
  if (candidates instanceof Empty) {
    return false;
  } else {
    return do_matches(to_string3(path), candidates);
  }
}
function split_subtree_path(path) {
  return split2(path, separator_subtree);
}
function add2(parent, index4, key) {
  if (key === "") {
    return new Index(index4, parent);
  } else {
    return new Key(key, parent);
  }
}
function subtree(path) {
  return new Subtree(path);
}
function event(path, event2) {
  return do_to_string(false, path, prepend(separator_event, prepend(event2, empty_list)));
}
function child(path) {
  return do_to_string(false, path, empty_list);
}

// build/dev/javascript/lustre/lustre/vdom/cache.mjs
class Cache extends CustomType {
  constructor(events, vdoms, old_vdoms, dispatched_paths, next_dispatched_paths) {
    super();
    this.events = events;
    this.vdoms = vdoms;
    this.old_vdoms = old_vdoms;
    this.dispatched_paths = dispatched_paths;
    this.next_dispatched_paths = next_dispatched_paths;
  }
}

class Events extends CustomType {
  constructor(handlers, children) {
    super();
    this.handlers = handlers;
    this.children = children;
  }
}

class Child extends CustomType {
  constructor(mapper, events) {
    super();
    this.mapper = mapper;
    this.events = events;
  }
}

class AddedChildren extends CustomType {
  constructor(handlers, children, vdoms) {
    super();
    this.handlers = handlers;
    this.children = children;
    this.vdoms = vdoms;
  }
}

class DecodedEvent extends CustomType {
  constructor(path, handler) {
    super();
    this.path = path;
    this.handler = handler;
  }
}

class DispatchedEvent extends CustomType {
  constructor(path) {
    super();
    this.path = path;
  }
}
function compose_mapper(mapper, child_mapper) {
  return (message) => {
    return mapper(child_mapper(message));
  };
}
function new_events() {
  return new Events(empty2(), empty2());
}
function new$4() {
  return new Cache(new_events(), empty2(), empty2(), empty_list, empty_list);
}
function do_add_event(handlers, path, name, handler) {
  return insert2(handlers, event(path, name), handler);
}
function add_attributes(handlers, path, attributes) {
  return fold2(attributes, handlers, (events, attribute3) => {
    if (attribute3 instanceof Event2) {
      let name = attribute3.name;
      let handler = attribute3.handler;
      return do_add_event(events, path, name, handler);
    } else {
      return events;
    }
  });
}
function do_add_children(loop$handlers, loop$children, loop$vdoms, loop$parent, loop$child_index, loop$nodes) {
  while (true) {
    let handlers = loop$handlers;
    let children = loop$children;
    let vdoms = loop$vdoms;
    let parent = loop$parent;
    let child_index = loop$child_index;
    let nodes = loop$nodes;
    let next = child_index + 1;
    if (nodes instanceof Empty) {
      return new AddedChildren(handlers, children, vdoms);
    } else {
      let $ = nodes.head;
      if ($ instanceof Fragment) {
        let rest = nodes.tail;
        let key = $.key;
        let nodes$1 = $.children;
        let path = add2(parent, child_index, key);
        let $1 = do_add_children(handlers, children, vdoms, path, 0, nodes$1);
        let handlers$1 = $1.handlers;
        let children$1 = $1.children;
        let vdoms$1 = $1.vdoms;
        loop$handlers = handlers$1;
        loop$children = children$1;
        loop$vdoms = vdoms$1;
        loop$parent = parent;
        loop$child_index = next;
        loop$nodes = rest;
      } else if ($ instanceof Element) {
        let rest = nodes.tail;
        let key = $.key;
        let attributes = $.attributes;
        let nodes$1 = $.children;
        let path = add2(parent, child_index, key);
        let handlers$1 = add_attributes(handlers, path, attributes);
        let $1 = do_add_children(handlers$1, children, vdoms, path, 0, nodes$1);
        let handlers$2 = $1.handlers;
        let children$1 = $1.children;
        let vdoms$1 = $1.vdoms;
        loop$handlers = handlers$2;
        loop$children = children$1;
        loop$vdoms = vdoms$1;
        loop$parent = parent;
        loop$child_index = next;
        loop$nodes = rest;
      } else if ($ instanceof Text) {
        let rest = nodes.tail;
        loop$handlers = handlers;
        loop$children = children;
        loop$vdoms = vdoms;
        loop$parent = parent;
        loop$child_index = next;
        loop$nodes = rest;
      } else if ($ instanceof UnsafeInnerHtml) {
        let rest = nodes.tail;
        let key = $.key;
        let attributes = $.attributes;
        let path = add2(parent, child_index, key);
        let handlers$1 = add_attributes(handlers, path, attributes);
        loop$handlers = handlers$1;
        loop$children = children;
        loop$vdoms = vdoms;
        loop$parent = parent;
        loop$child_index = next;
        loop$nodes = rest;
      } else if ($ instanceof Map2) {
        let rest = nodes.tail;
        let key = $.key;
        let mapper = $.mapper;
        let child2 = $.child;
        let path = add2(parent, child_index, key);
        let added = do_add_children(empty2(), empty2(), vdoms, subtree(path), 0, singleton_list(child2));
        let vdoms$1 = added.vdoms;
        let child_events = new Events(added.handlers, added.children);
        let child$1 = new Child(mapper, child_events);
        let children$1 = insert2(children, child(path), child$1);
        loop$handlers = handlers;
        loop$children = children$1;
        loop$vdoms = vdoms$1;
        loop$parent = parent;
        loop$child_index = next;
        loop$nodes = rest;
      } else {
        let rest = nodes.tail;
        let view = $.view;
        let child_node = view();
        let vdoms$1 = insert2(vdoms, view, child_node);
        let next$1 = child_index;
        let rest$1 = prepend(child_node, rest);
        loop$handlers = handlers;
        loop$children = children;
        loop$vdoms = vdoms$1;
        loop$parent = parent;
        loop$child_index = next$1;
        loop$nodes = rest$1;
      }
    }
  }
}
function add_children(cache, events, path, child_index, nodes) {
  let vdoms = cache.vdoms;
  let handlers = events.handlers;
  let children = events.children;
  let $ = do_add_children(handlers, children, vdoms, path, child_index, nodes);
  let handlers$1 = $.handlers;
  let children$1 = $.children;
  let vdoms$1 = $.vdoms;
  return [
    new Cache(cache.events, vdoms$1, cache.old_vdoms, cache.dispatched_paths, cache.next_dispatched_paths),
    new Events(handlers$1, children$1)
  ];
}
function add_child(cache, events, parent, index4, child2) {
  let children = singleton_list(child2);
  return add_children(cache, events, parent, index4, children);
}
function from_node(root2) {
  let cache = new$4();
  let $ = add_child(cache, cache.events, root, 0, root2);
  let cache$1 = $[0];
  let events$1 = $[1];
  return new Cache(events$1, cache$1.vdoms, cache$1.old_vdoms, cache$1.dispatched_paths, cache$1.next_dispatched_paths);
}
function tick(cache) {
  return new Cache(cache.events, empty2(), cache.vdoms, cache.next_dispatched_paths, empty_list);
}
function events(cache) {
  return cache.events;
}
function update_events(cache, events2) {
  return new Cache(events2, cache.vdoms, cache.old_vdoms, cache.dispatched_paths, cache.next_dispatched_paths);
}
function memos(cache) {
  return cache.vdoms;
}
function get_old_memo(cache, old, new$5) {
  return get_or_compute(cache.old_vdoms, old, new$5);
}
function keep_memo(cache, old, new$5) {
  let node = get_or_compute(cache.old_vdoms, old, new$5);
  let vdoms = insert2(cache.vdoms, new$5, node);
  return new Cache(cache.events, vdoms, cache.old_vdoms, cache.dispatched_paths, cache.next_dispatched_paths);
}
function add_memo(cache, new$5, node) {
  let vdoms = insert2(cache.vdoms, new$5, node);
  return new Cache(cache.events, vdoms, cache.old_vdoms, cache.dispatched_paths, cache.next_dispatched_paths);
}
function get_subtree(events2, path, old_mapper) {
  let child2 = get_or_compute(events2.children, path, () => {
    return new Child(old_mapper, new_events());
  });
  return child2.events;
}
function update_subtree(parent, path, mapper, events2) {
  let new_child = new Child(mapper, events2);
  let children = insert2(parent.children, path, new_child);
  return new Events(parent.handlers, children);
}
function add_event(events2, path, name, handler) {
  let handlers = do_add_event(events2.handlers, path, name, handler);
  return new Events(handlers, events2.children);
}
function do_remove_event(handlers, path, name) {
  return remove(handlers, event(path, name));
}
function remove_event(events2, path, name) {
  let handlers = do_remove_event(events2.handlers, path, name);
  return new Events(handlers, events2.children);
}
function remove_attributes(handlers, path, attributes) {
  return fold2(attributes, handlers, (events2, attribute3) => {
    if (attribute3 instanceof Event2) {
      let name = attribute3.name;
      return do_remove_event(events2, path, name);
    } else {
      return events2;
    }
  });
}
function do_remove_children(loop$handlers, loop$children, loop$vdoms, loop$parent, loop$index, loop$nodes) {
  while (true) {
    let handlers = loop$handlers;
    let children = loop$children;
    let vdoms = loop$vdoms;
    let parent = loop$parent;
    let index4 = loop$index;
    let nodes = loop$nodes;
    let next = index4 + 1;
    if (nodes instanceof Empty) {
      return new Events(handlers, children);
    } else {
      let $ = nodes.head;
      if ($ instanceof Fragment) {
        let rest = nodes.tail;
        let key = $.key;
        let nodes$1 = $.children;
        let path = add2(parent, index4, key);
        let $1 = do_remove_children(handlers, children, vdoms, path, 0, nodes$1);
        let handlers$1 = $1.handlers;
        let children$1 = $1.children;
        loop$handlers = handlers$1;
        loop$children = children$1;
        loop$vdoms = vdoms;
        loop$parent = parent;
        loop$index = next;
        loop$nodes = rest;
      } else if ($ instanceof Element) {
        let rest = nodes.tail;
        let key = $.key;
        let attributes = $.attributes;
        let nodes$1 = $.children;
        let path = add2(parent, index4, key);
        let handlers$1 = remove_attributes(handlers, path, attributes);
        let $1 = do_remove_children(handlers$1, children, vdoms, path, 0, nodes$1);
        let handlers$2 = $1.handlers;
        let children$1 = $1.children;
        loop$handlers = handlers$2;
        loop$children = children$1;
        loop$vdoms = vdoms;
        loop$parent = parent;
        loop$index = next;
        loop$nodes = rest;
      } else if ($ instanceof Text) {
        let rest = nodes.tail;
        loop$handlers = handlers;
        loop$children = children;
        loop$vdoms = vdoms;
        loop$parent = parent;
        loop$index = next;
        loop$nodes = rest;
      } else if ($ instanceof UnsafeInnerHtml) {
        let rest = nodes.tail;
        let key = $.key;
        let attributes = $.attributes;
        let path = add2(parent, index4, key);
        let handlers$1 = remove_attributes(handlers, path, attributes);
        loop$handlers = handlers$1;
        loop$children = children;
        loop$vdoms = vdoms;
        loop$parent = parent;
        loop$index = next;
        loop$nodes = rest;
      } else if ($ instanceof Map2) {
        let rest = nodes.tail;
        let key = $.key;
        let path = add2(parent, index4, key);
        let children$1 = remove(children, child(path));
        loop$handlers = handlers;
        loop$children = children$1;
        loop$vdoms = vdoms;
        loop$parent = parent;
        loop$index = next;
        loop$nodes = rest;
      } else {
        let rest = nodes.tail;
        let view = $.view;
        let $1 = has_key(vdoms, view);
        if ($1) {
          let child2 = get2(vdoms, view);
          let nodes$1 = prepend(child2, rest);
          loop$handlers = handlers;
          loop$children = children;
          loop$vdoms = vdoms;
          loop$parent = parent;
          loop$index = index4;
          loop$nodes = nodes$1;
        } else {
          loop$handlers = handlers;
          loop$children = children;
          loop$vdoms = vdoms;
          loop$parent = parent;
          loop$index = next;
          loop$nodes = rest;
        }
      }
    }
  }
}
function remove_child(cache, events2, parent, child_index, child2) {
  return do_remove_children(events2.handlers, events2.children, cache.old_vdoms, parent, child_index, singleton_list(child2));
}
function replace_child(cache, events2, parent, child_index, prev, next) {
  let events$1 = remove_child(cache, events2, parent, child_index, prev);
  return add_child(cache, events$1, parent, child_index, next);
}
function get_handler(loop$events, loop$path, loop$mapper) {
  while (true) {
    let events2 = loop$events;
    let path = loop$path;
    let mapper = loop$mapper;
    if (path instanceof Empty) {
      return error_nil;
    } else {
      let $ = path.tail;
      if ($ instanceof Empty) {
        let key = path.head;
        let $1 = has_key(events2.handlers, key);
        if ($1) {
          let handler = get2(events2.handlers, key);
          return new Ok(map3(handler, (handler2) => {
            return new Handler(handler2.prevent_default, handler2.stop_propagation, identity2(mapper)(handler2.message));
          }));
        } else {
          return error_nil;
        }
      } else {
        let key = path.head;
        let path$1 = $;
        let $1 = has_key(events2.children, key);
        if ($1) {
          let child2 = get2(events2.children, key);
          let mapper$1 = compose_mapper(mapper, child2.mapper);
          loop$events = child2.events;
          loop$path = path$1;
          loop$mapper = mapper$1;
        } else {
          return error_nil;
        }
      }
    }
  }
}
function decode2(cache, path, name, event2) {
  let parts = split_subtree_path(path + separator_event + name);
  let $ = get_handler(cache.events, parts, identity2);
  if ($ instanceof Ok) {
    let handler = $[0];
    let $1 = run(event2, handler);
    if ($1 instanceof Ok) {
      let handler$1 = $1[0];
      return new DecodedEvent(path, handler$1);
    } else {
      return new DispatchedEvent(path);
    }
  } else {
    return new DispatchedEvent(path);
  }
}
function dispatch(cache, event2) {
  let next_dispatched_paths = prepend(event2.path, cache.next_dispatched_paths);
  let cache$1 = new Cache(cache.events, cache.vdoms, cache.old_vdoms, cache.dispatched_paths, next_dispatched_paths);
  if (event2 instanceof DecodedEvent) {
    let handler = event2.handler;
    return [cache$1, new Ok(handler)];
  } else {
    return [cache$1, error_nil];
  }
}
function handle(cache, path, name, event2) {
  let _pipe = decode2(cache, path, name, event2);
  return ((_capture) => {
    return dispatch(cache, _capture);
  })(_pipe);
}
function has_dispatched_events(cache, path) {
  return matches(path, cache.dispatched_paths);
}

// build/dev/javascript/lustre/lustre/runtime/server/runtime.mjs
class ClientDispatchedMessage extends CustomType {
  constructor(message) {
    super();
    this.message = message;
  }
}
var Message$isClientDispatchedMessage = (value) => value instanceof ClientDispatchedMessage;
class ClientRegisteredCallback extends CustomType {
  constructor(callback) {
    super();
    this.callback = callback;
  }
}
var Message$isClientRegisteredCallback = (value) => value instanceof ClientRegisteredCallback;
class ClientDeregisteredCallback extends CustomType {
  constructor(callback) {
    super();
    this.callback = callback;
  }
}
var Message$isClientDeregisteredCallback = (value) => value instanceof ClientDeregisteredCallback;
class EffectDispatchedMessage extends CustomType {
  constructor(message) {
    super();
    this.message = message;
  }
}
var Message$EffectDispatchedMessage = (message) => new EffectDispatchedMessage(message);
var Message$isEffectDispatchedMessage = (value) => value instanceof EffectDispatchedMessage;
class EffectEmitEvent extends CustomType {
  constructor(name, data2) {
    super();
    this.name = name;
    this.data = data2;
  }
}
var Message$EffectEmitEvent = (name, data2) => new EffectEmitEvent(name, data2);
var Message$isEffectEmitEvent = (value) => value instanceof EffectEmitEvent;
class EffectProvidedValue extends CustomType {
  constructor(key, value) {
    super();
    this.key = key;
    this.value = value;
  }
}
var Message$EffectProvidedValue = (key, value) => new EffectProvidedValue(key, value);
var Message$isEffectProvidedValue = (value) => value instanceof EffectProvidedValue;
class EffectRequestedContextSubscription extends CustomType {
  constructor(key, decoder) {
    super();
    this.key = key;
    this.decoder = decoder;
  }
}
var Message$EffectRequestedContextSubscription = (key, decoder) => new EffectRequestedContextSubscription(key, decoder);
var Message$isEffectRequestedContextSubscription = (value) => value instanceof EffectRequestedContextSubscription;
class EffectRemovedContextSubscription extends CustomType {
  constructor(key) {
    super();
    this.key = key;
  }
}
var Message$EffectRemovedContextSubscription = (key) => new EffectRemovedContextSubscription(key);
var Message$isEffectRemovedContextSubscription = (value) => value instanceof EffectRemovedContextSubscription;
class SystemRequestedShutdown extends CustomType {
}
var Message$isSystemRequestedShutdown = (value) => value instanceof SystemRequestedShutdown;

// build/dev/javascript/lustre/lustre/runtime/app.mjs
class App extends CustomType {
  constructor(name, init, update2, view, config) {
    super();
    this.name = name;
    this.init = init;
    this.update = update2;
    this.view = view;
    this.config = config;
  }
}
class Config2 extends CustomType {
  constructor(open_shadow_root, adopt_styles, delegates_focus, attributes, properties, contexts, is_form_associated, on_form_autofill, on_form_reset, on_form_restore, on_form_disabled, on_connect, on_adopt, on_disconnect) {
    super();
    this.open_shadow_root = open_shadow_root;
    this.adopt_styles = adopt_styles;
    this.delegates_focus = delegates_focus;
    this.attributes = attributes;
    this.properties = properties;
    this.contexts = contexts;
    this.is_form_associated = is_form_associated;
    this.on_form_autofill = on_form_autofill;
    this.on_form_reset = on_form_reset;
    this.on_form_restore = on_form_restore;
    this.on_form_disabled = on_form_disabled;
    this.on_connect = on_connect;
    this.on_adopt = on_adopt;
    this.on_disconnect = on_disconnect;
  }
}
class Option extends CustomType {
  constructor(apply) {
    super();
    this.apply = apply;
  }
}
var default_config = /* @__PURE__ */ new Config2(true, true, false, empty_list, empty_list, empty_list, false, /* @__PURE__ */ new None, /* @__PURE__ */ new None, /* @__PURE__ */ new None, /* @__PURE__ */ new None, /* @__PURE__ */ new None, /* @__PURE__ */ new None, /* @__PURE__ */ new None);
function configure(options) {
  return fold2(options, default_config, (config, option) => {
    return option.apply(config);
  });
}

// build/dev/javascript/lustre/lustre/internals/equals.ffi.mjs
var isEqual2 = (a2, b) => {
  if (a2 === b) {
    return true;
  }
  if (a2 == null || b == null) {
    return false;
  }
  const type = typeof a2;
  if (type !== typeof b) {
    return false;
  }
  if (type !== "object") {
    return false;
  }
  const ctor = a2.constructor;
  if (ctor !== b.constructor) {
    return false;
  }
  if (Array.isArray(a2)) {
    return areArraysEqual(a2, b);
  }
  return areObjectsEqual(a2, b);
};
var areArraysEqual = (a2, b) => {
  let index4 = a2.length;
  if (index4 !== b.length) {
    return false;
  }
  while (index4--) {
    if (!isEqual2(a2[index4], b[index4])) {
      return false;
    }
  }
  return true;
};
var areObjectsEqual = (a2, b) => {
  const properties = Object.keys(a2);
  let index4 = properties.length;
  if (Object.keys(b).length !== index4) {
    return false;
  }
  while (index4--) {
    const property3 = properties[index4];
    if (!Object.hasOwn(b, property3)) {
      return false;
    }
    if (!isEqual2(a2[property3], b[property3])) {
      return false;
    }
  }
  return true;
};

// build/dev/javascript/lustre/lustre/vdom/diff.mjs
class Diff extends CustomType {
  constructor(patch, cache) {
    super();
    this.patch = patch;
    this.cache = cache;
  }
}
class PartialDiff extends CustomType {
  constructor(patch, cache, events2) {
    super();
    this.patch = patch;
    this.cache = cache;
    this.events = events2;
  }
}

class AttributeChange extends CustomType {
  constructor(added, removed, events2) {
    super();
    this.added = added;
    this.removed = removed;
    this.events = events2;
  }
}
function diff_attributes(loop$controlled, loop$path, loop$events, loop$old, loop$new, loop$added, loop$removed) {
  while (true) {
    let controlled = loop$controlled;
    let path = loop$path;
    let events2 = loop$events;
    let old = loop$old;
    let new$5 = loop$new;
    let added = loop$added;
    let removed = loop$removed;
    if (old instanceof Empty) {
      if (new$5 instanceof Empty) {
        return new AttributeChange(added, removed, events2);
      } else {
        let $ = new$5.head;
        if ($ instanceof Event2) {
          let next = $;
          let new$1 = new$5.tail;
          let name = $.name;
          let handler = $.handler;
          let events$1 = add_event(events2, path, name, handler);
          let added$1 = prepend(next, added);
          loop$controlled = controlled;
          loop$path = path;
          loop$events = events$1;
          loop$old = old;
          loop$new = new$1;
          loop$added = added$1;
          loop$removed = removed;
        } else {
          let next = $;
          let new$1 = new$5.tail;
          let added$1 = prepend(next, added);
          loop$controlled = controlled;
          loop$path = path;
          loop$events = events2;
          loop$old = old;
          loop$new = new$1;
          loop$added = added$1;
          loop$removed = removed;
        }
      }
    } else if (new$5 instanceof Empty) {
      let $ = old.head;
      if ($ instanceof Event2) {
        let prev = $;
        let old$1 = old.tail;
        let name = $.name;
        let events$1 = remove_event(events2, path, name);
        let removed$1 = prepend(prev, removed);
        loop$controlled = controlled;
        loop$path = path;
        loop$events = events$1;
        loop$old = old$1;
        loop$new = new$5;
        loop$added = added;
        loop$removed = removed$1;
      } else {
        let prev = $;
        let old$1 = old.tail;
        let removed$1 = prepend(prev, removed);
        loop$controlled = controlled;
        loop$path = path;
        loop$events = events2;
        loop$old = old$1;
        loop$new = new$5;
        loop$added = added;
        loop$removed = removed$1;
      }
    } else {
      let prev = old.head;
      let remaining_old = old.tail;
      let next = new$5.head;
      let remaining_new = new$5.tail;
      let $ = compare2(prev, next);
      if ($ instanceof Lt) {
        if (prev instanceof Event2) {
          let name = prev.name;
          loop$controlled = controlled;
          loop$path = path;
          loop$events = remove_event(events2, path, name);
          loop$old = remaining_old;
          loop$new = new$5;
          loop$added = added;
          loop$removed = prepend(prev, removed);
        } else {
          loop$controlled = controlled;
          loop$path = path;
          loop$events = events2;
          loop$old = remaining_old;
          loop$new = new$5;
          loop$added = added;
          loop$removed = prepend(prev, removed);
        }
      } else if ($ instanceof Eq) {
        if (prev instanceof Attribute) {
          if (next instanceof Attribute) {
            let _block;
            let $1 = next.name;
            if ($1 === "value") {
              _block = controlled || prev.value !== next.value;
            } else if ($1 === "checked") {
              _block = controlled || prev.value !== next.value;
            } else if ($1 === "selected") {
              _block = controlled || prev.value !== next.value;
            } else {
              _block = prev.value !== next.value;
            }
            let has_changes = _block;
            let _block$1;
            if (has_changes) {
              _block$1 = prepend(next, added);
            } else {
              _block$1 = added;
            }
            let added$1 = _block$1;
            loop$controlled = controlled;
            loop$path = path;
            loop$events = events2;
            loop$old = remaining_old;
            loop$new = remaining_new;
            loop$added = added$1;
            loop$removed = removed;
          } else if (next instanceof Event2) {
            let name = next.name;
            let handler = next.handler;
            loop$controlled = controlled;
            loop$path = path;
            loop$events = add_event(events2, path, name, handler);
            loop$old = remaining_old;
            loop$new = remaining_new;
            loop$added = prepend(next, added);
            loop$removed = prepend(prev, removed);
          } else {
            loop$controlled = controlled;
            loop$path = path;
            loop$events = events2;
            loop$old = remaining_old;
            loop$new = remaining_new;
            loop$added = prepend(next, added);
            loop$removed = prepend(prev, removed);
          }
        } else if (prev instanceof Property) {
          if (next instanceof Property) {
            let _block;
            let $1 = next.name;
            if ($1 === "scrollLeft") {
              _block = true;
            } else if ($1 === "scrollRight") {
              _block = true;
            } else if ($1 === "value") {
              _block = controlled || !isEqual2(prev.value, next.value);
            } else if ($1 === "checked") {
              _block = controlled || !isEqual2(prev.value, next.value);
            } else if ($1 === "selected") {
              _block = controlled || !isEqual2(prev.value, next.value);
            } else {
              _block = !isEqual2(prev.value, next.value);
            }
            let has_changes = _block;
            let _block$1;
            if (has_changes) {
              _block$1 = prepend(next, added);
            } else {
              _block$1 = added;
            }
            let added$1 = _block$1;
            loop$controlled = controlled;
            loop$path = path;
            loop$events = events2;
            loop$old = remaining_old;
            loop$new = remaining_new;
            loop$added = added$1;
            loop$removed = removed;
          } else if (next instanceof Event2) {
            let name = next.name;
            let handler = next.handler;
            loop$controlled = controlled;
            loop$path = path;
            loop$events = add_event(events2, path, name, handler);
            loop$old = remaining_old;
            loop$new = remaining_new;
            loop$added = prepend(next, added);
            loop$removed = prepend(prev, removed);
          } else {
            loop$controlled = controlled;
            loop$path = path;
            loop$events = events2;
            loop$old = remaining_old;
            loop$new = remaining_new;
            loop$added = prepend(next, added);
            loop$removed = prepend(prev, removed);
          }
        } else if (next instanceof Event2) {
          let name = next.name;
          let handler = next.handler;
          let has_changes = prev.prevent_default.kind !== next.prevent_default.kind || prev.stop_propagation.kind !== next.stop_propagation.kind || prev.debounce !== next.debounce || prev.throttle !== next.throttle;
          let _block;
          if (has_changes) {
            _block = prepend(next, added);
          } else {
            _block = added;
          }
          let added$1 = _block;
          loop$controlled = controlled;
          loop$path = path;
          loop$events = add_event(events2, path, name, handler);
          loop$old = remaining_old;
          loop$new = remaining_new;
          loop$added = added$1;
          loop$removed = removed;
        } else {
          let name = prev.name;
          loop$controlled = controlled;
          loop$path = path;
          loop$events = remove_event(events2, path, name);
          loop$old = remaining_old;
          loop$new = remaining_new;
          loop$added = prepend(next, added);
          loop$removed = prepend(prev, removed);
        }
      } else if (next instanceof Event2) {
        let name = next.name;
        let handler = next.handler;
        loop$controlled = controlled;
        loop$path = path;
        loop$events = add_event(events2, path, name, handler);
        loop$old = old;
        loop$new = remaining_new;
        loop$added = prepend(next, added);
        loop$removed = removed;
      } else {
        loop$controlled = controlled;
        loop$path = path;
        loop$events = events2;
        loop$old = old;
        loop$new = remaining_new;
        loop$added = prepend(next, added);
        loop$removed = removed;
      }
    }
  }
}
function is_controlled(cache, namespace, tag, path) {
  if (tag === "input" && namespace === "") {
    return has_dispatched_events(cache, path);
  } else if (tag === "select" && namespace === "") {
    return has_dispatched_events(cache, path);
  } else if (tag === "textarea" && namespace === "") {
    return has_dispatched_events(cache, path);
  } else {
    return false;
  }
}
function do_diff(loop$old, loop$old_keyed, loop$new, loop$new_keyed, loop$moved, loop$moved_offset, loop$removed, loop$node_index, loop$patch_index, loop$changes, loop$children, loop$path, loop$cache, loop$events) {
  while (true) {
    let old = loop$old;
    let old_keyed = loop$old_keyed;
    let new$5 = loop$new;
    let new_keyed = loop$new_keyed;
    let moved = loop$moved;
    let moved_offset = loop$moved_offset;
    let removed = loop$removed;
    let node_index = loop$node_index;
    let patch_index = loop$patch_index;
    let changes = loop$changes;
    let children = loop$children;
    let path = loop$path;
    let cache = loop$cache;
    let events2 = loop$events;
    if (old instanceof Empty) {
      if (new$5 instanceof Empty) {
        let _block;
        let $ = is_browser();
        if (changes instanceof Empty) {
          if (children instanceof Empty) {
            _block = new$3(patch_index, removed, changes, children);
          } else if (!$) {
            let $1 = children.tail;
            if ($1 instanceof Empty && removed === 0) {
              let child2 = children.head;
              _block = add_parent(child2, patch_index);
            } else {
              _block = new$3(patch_index, removed, changes, children);
            }
          } else {
            _block = new$3(patch_index, removed, changes, children);
          }
        } else {
          _block = new$3(patch_index, removed, changes, children);
        }
        let patch = _block;
        return new PartialDiff(patch, cache, events2);
      } else {
        let $ = add_children(cache, events2, path, node_index, new$5);
        let cache$1 = $[0];
        let events$1 = $[1];
        let insert4 = insert3(new$5, node_index - moved_offset);
        let changes$1 = prepend(insert4, changes);
        let patch = new$3(patch_index, removed, changes$1, children);
        return new PartialDiff(patch, cache$1, events$1);
      }
    } else if (new$5 instanceof Empty) {
      let prev = old.head;
      let old$1 = old.tail;
      let $ = prev.key === "" || !has_key(moved, prev.key);
      if ($) {
        let events$1 = remove_child(cache, events2, path, node_index, prev);
        loop$old = old$1;
        loop$old_keyed = old_keyed;
        loop$new = new$5;
        loop$new_keyed = new_keyed;
        loop$moved = moved;
        loop$moved_offset = moved_offset;
        loop$removed = removed + 1;
        loop$node_index = node_index;
        loop$patch_index = patch_index;
        loop$changes = changes;
        loop$children = children;
        loop$path = path;
        loop$cache = cache;
        loop$events = events$1;
      } else {
        loop$old = old$1;
        loop$old_keyed = old_keyed;
        loop$new = new$5;
        loop$new_keyed = new_keyed;
        loop$moved = moved;
        loop$moved_offset = moved_offset;
        loop$removed = removed;
        loop$node_index = node_index;
        loop$patch_index = patch_index;
        loop$changes = changes;
        loop$children = children;
        loop$path = path;
        loop$cache = cache;
        loop$events = events2;
      }
    } else {
      let prev = old.head;
      let next = new$5.head;
      if (prev.key !== next.key) {
        let old_remaining = old.tail;
        let new_remaining = new$5.tail;
        let next_did_exist = has_key(old_keyed, next.key);
        let prev_does_exist = has_key(new_keyed, prev.key);
        if (prev_does_exist) {
          if (next_did_exist) {
            let $ = has_key(moved, prev.key);
            if ($) {
              loop$old = old_remaining;
              loop$old_keyed = old_keyed;
              loop$new = new$5;
              loop$new_keyed = new_keyed;
              loop$moved = moved;
              loop$moved_offset = moved_offset - 1;
              loop$removed = removed;
              loop$node_index = node_index;
              loop$patch_index = patch_index;
              loop$changes = changes;
              loop$children = children;
              loop$path = path;
              loop$cache = cache;
              loop$events = events2;
            } else {
              let match = get2(old_keyed, next.key);
              let before = node_index - moved_offset;
              let changes$1 = prepend(move(next.key, before), changes);
              let moved$1 = insert2(moved, next.key, undefined);
              loop$old = prepend(match, old);
              loop$old_keyed = old_keyed;
              loop$new = new$5;
              loop$new_keyed = new_keyed;
              loop$moved = moved$1;
              loop$moved_offset = moved_offset + 1;
              loop$removed = removed;
              loop$node_index = node_index;
              loop$patch_index = patch_index;
              loop$changes = changes$1;
              loop$children = children;
              loop$path = path;
              loop$cache = cache;
              loop$events = events2;
            }
          } else {
            let before = node_index - moved_offset;
            let $ = add_child(cache, events2, path, node_index, next);
            let cache$1 = $[0];
            let events$1 = $[1];
            let insert4 = insert3(singleton_list(next), before);
            let changes$1 = prepend(insert4, changes);
            loop$old = old;
            loop$old_keyed = old_keyed;
            loop$new = new_remaining;
            loop$new_keyed = new_keyed;
            loop$moved = moved;
            loop$moved_offset = moved_offset + 1;
            loop$removed = removed;
            loop$node_index = node_index + 1;
            loop$patch_index = patch_index;
            loop$changes = changes$1;
            loop$children = children;
            loop$path = path;
            loop$cache = cache$1;
            loop$events = events$1;
          }
        } else if (next_did_exist) {
          let index4 = node_index - moved_offset;
          let changes$1 = prepend(remove2(index4), changes);
          let events$1 = remove_child(cache, events2, path, node_index, prev);
          loop$old = old_remaining;
          loop$old_keyed = old_keyed;
          loop$new = new$5;
          loop$new_keyed = new_keyed;
          loop$moved = moved;
          loop$moved_offset = moved_offset - 1;
          loop$removed = removed;
          loop$node_index = node_index;
          loop$patch_index = patch_index;
          loop$changes = changes$1;
          loop$children = children;
          loop$path = path;
          loop$cache = cache;
          loop$events = events$1;
        } else {
          let change = replace2(node_index - moved_offset, next);
          let $ = replace_child(cache, events2, path, node_index, prev, next);
          let cache$1 = $[0];
          let events$1 = $[1];
          loop$old = old_remaining;
          loop$old_keyed = old_keyed;
          loop$new = new_remaining;
          loop$new_keyed = new_keyed;
          loop$moved = moved;
          loop$moved_offset = moved_offset;
          loop$removed = removed;
          loop$node_index = node_index + 1;
          loop$patch_index = patch_index;
          loop$changes = prepend(change, changes);
          loop$children = children;
          loop$path = path;
          loop$cache = cache$1;
          loop$events = events$1;
        }
      } else {
        let $ = old.head;
        if ($ instanceof Fragment) {
          let $1 = new$5.head;
          if ($1 instanceof Fragment) {
            let prev2 = $;
            let old$1 = old.tail;
            let next2 = $1;
            let new$1 = new$5.tail;
            let $2 = do_diff(prev2.children, prev2.keyed_children, next2.children, next2.keyed_children, empty2(), 0, 0, 0, node_index, empty_list, empty_list, add2(path, node_index, next2.key), cache, events2);
            let patch = $2.patch;
            let cache$1 = $2.cache;
            let events$1 = $2.events;
            let _block;
            let $3 = patch.changes;
            if ($3 instanceof Empty) {
              let $4 = patch.children;
              if ($4 instanceof Empty) {
                let $5 = patch.removed;
                if ($5 === 0) {
                  _block = children;
                } else {
                  _block = prepend(patch, children);
                }
              } else {
                _block = prepend(patch, children);
              }
            } else {
              _block = prepend(patch, children);
            }
            let children$1 = _block;
            loop$old = old$1;
            loop$old_keyed = old_keyed;
            loop$new = new$1;
            loop$new_keyed = new_keyed;
            loop$moved = moved;
            loop$moved_offset = moved_offset;
            loop$removed = removed;
            loop$node_index = node_index + 1;
            loop$patch_index = patch_index;
            loop$changes = changes;
            loop$children = children$1;
            loop$path = path;
            loop$cache = cache$1;
            loop$events = events$1;
          } else {
            let prev2 = $;
            let old_remaining = old.tail;
            let next2 = $1;
            let new_remaining = new$5.tail;
            let change = replace2(node_index - moved_offset, next2);
            let $2 = replace_child(cache, events2, path, node_index, prev2, next2);
            let cache$1 = $2[0];
            let events$1 = $2[1];
            loop$old = old_remaining;
            loop$old_keyed = old_keyed;
            loop$new = new_remaining;
            loop$new_keyed = new_keyed;
            loop$moved = moved;
            loop$moved_offset = moved_offset;
            loop$removed = removed;
            loop$node_index = node_index + 1;
            loop$patch_index = patch_index;
            loop$changes = prepend(change, changes);
            loop$children = children;
            loop$path = path;
            loop$cache = cache$1;
            loop$events = events$1;
          }
        } else if ($ instanceof Element) {
          let $1 = new$5.head;
          if ($1 instanceof Element) {
            let prev2 = $;
            let next2 = $1;
            if (prev2.namespace === next2.namespace && prev2.tag === next2.tag) {
              let old$1 = old.tail;
              let new$1 = new$5.tail;
              let child_path = add2(path, node_index, next2.key);
              let controlled = is_controlled(cache, next2.namespace, next2.tag, child_path);
              let $2 = diff_attributes(controlled, child_path, events2, prev2.attributes, next2.attributes, empty_list, empty_list);
              let added_attrs = $2.added;
              let removed_attrs = $2.removed;
              let events$1 = $2.events;
              let _block;
              if (added_attrs instanceof Empty && removed_attrs instanceof Empty) {
                _block = empty_list;
              } else {
                _block = singleton_list(update(added_attrs, removed_attrs));
              }
              let initial_child_changes = _block;
              let $3 = do_diff(prev2.children, prev2.keyed_children, next2.children, next2.keyed_children, empty2(), 0, 0, 0, node_index, initial_child_changes, empty_list, child_path, cache, events$1);
              let patch = $3.patch;
              let cache$1 = $3.cache;
              let events$2 = $3.events;
              let _block$1;
              let $4 = patch.changes;
              if ($4 instanceof Empty) {
                let $5 = patch.children;
                if ($5 instanceof Empty) {
                  let $6 = patch.removed;
                  if ($6 === 0) {
                    _block$1 = children;
                  } else {
                    _block$1 = prepend(patch, children);
                  }
                } else {
                  _block$1 = prepend(patch, children);
                }
              } else {
                _block$1 = prepend(patch, children);
              }
              let children$1 = _block$1;
              loop$old = old$1;
              loop$old_keyed = old_keyed;
              loop$new = new$1;
              loop$new_keyed = new_keyed;
              loop$moved = moved;
              loop$moved_offset = moved_offset;
              loop$removed = removed;
              loop$node_index = node_index + 1;
              loop$patch_index = patch_index;
              loop$changes = changes;
              loop$children = children$1;
              loop$path = path;
              loop$cache = cache$1;
              loop$events = events$2;
            } else {
              let prev3 = $;
              let old_remaining = old.tail;
              let next3 = $1;
              let new_remaining = new$5.tail;
              let change = replace2(node_index - moved_offset, next3);
              let $2 = replace_child(cache, events2, path, node_index, prev3, next3);
              let cache$1 = $2[0];
              let events$1 = $2[1];
              loop$old = old_remaining;
              loop$old_keyed = old_keyed;
              loop$new = new_remaining;
              loop$new_keyed = new_keyed;
              loop$moved = moved;
              loop$moved_offset = moved_offset;
              loop$removed = removed;
              loop$node_index = node_index + 1;
              loop$patch_index = patch_index;
              loop$changes = prepend(change, changes);
              loop$children = children;
              loop$path = path;
              loop$cache = cache$1;
              loop$events = events$1;
            }
          } else {
            let prev2 = $;
            let old_remaining = old.tail;
            let next2 = $1;
            let new_remaining = new$5.tail;
            let change = replace2(node_index - moved_offset, next2);
            let $2 = replace_child(cache, events2, path, node_index, prev2, next2);
            let cache$1 = $2[0];
            let events$1 = $2[1];
            loop$old = old_remaining;
            loop$old_keyed = old_keyed;
            loop$new = new_remaining;
            loop$new_keyed = new_keyed;
            loop$moved = moved;
            loop$moved_offset = moved_offset;
            loop$removed = removed;
            loop$node_index = node_index + 1;
            loop$patch_index = patch_index;
            loop$changes = prepend(change, changes);
            loop$children = children;
            loop$path = path;
            loop$cache = cache$1;
            loop$events = events$1;
          }
        } else if ($ instanceof Text) {
          let $1 = new$5.head;
          if ($1 instanceof Text) {
            let prev2 = $;
            let next2 = $1;
            if (prev2.content === next2.content) {
              let old$1 = old.tail;
              let new$1 = new$5.tail;
              loop$old = old$1;
              loop$old_keyed = old_keyed;
              loop$new = new$1;
              loop$new_keyed = new_keyed;
              loop$moved = moved;
              loop$moved_offset = moved_offset;
              loop$removed = removed;
              loop$node_index = node_index + 1;
              loop$patch_index = patch_index;
              loop$changes = changes;
              loop$children = children;
              loop$path = path;
              loop$cache = cache;
              loop$events = events2;
            } else {
              let old$1 = old.tail;
              let next3 = $1;
              let new$1 = new$5.tail;
              let child2 = new$3(node_index, 0, singleton_list(replace_text(next3.content)), empty_list);
              loop$old = old$1;
              loop$old_keyed = old_keyed;
              loop$new = new$1;
              loop$new_keyed = new_keyed;
              loop$moved = moved;
              loop$moved_offset = moved_offset;
              loop$removed = removed;
              loop$node_index = node_index + 1;
              loop$patch_index = patch_index;
              loop$changes = changes;
              loop$children = prepend(child2, children);
              loop$path = path;
              loop$cache = cache;
              loop$events = events2;
            }
          } else {
            let prev2 = $;
            let old_remaining = old.tail;
            let next2 = $1;
            let new_remaining = new$5.tail;
            let change = replace2(node_index - moved_offset, next2);
            let $2 = replace_child(cache, events2, path, node_index, prev2, next2);
            let cache$1 = $2[0];
            let events$1 = $2[1];
            loop$old = old_remaining;
            loop$old_keyed = old_keyed;
            loop$new = new_remaining;
            loop$new_keyed = new_keyed;
            loop$moved = moved;
            loop$moved_offset = moved_offset;
            loop$removed = removed;
            loop$node_index = node_index + 1;
            loop$patch_index = patch_index;
            loop$changes = prepend(change, changes);
            loop$children = children;
            loop$path = path;
            loop$cache = cache$1;
            loop$events = events$1;
          }
        } else if ($ instanceof UnsafeInnerHtml) {
          let $1 = new$5.head;
          if ($1 instanceof UnsafeInnerHtml) {
            let prev2 = $;
            let old$1 = old.tail;
            let next2 = $1;
            let new$1 = new$5.tail;
            let child_path = add2(path, node_index, next2.key);
            let $2 = diff_attributes(false, child_path, events2, prev2.attributes, next2.attributes, empty_list, empty_list);
            let added_attrs = $2.added;
            let removed_attrs = $2.removed;
            let events$1 = $2.events;
            let _block;
            if (added_attrs instanceof Empty && removed_attrs instanceof Empty) {
              _block = empty_list;
            } else {
              _block = singleton_list(update(added_attrs, removed_attrs));
            }
            let child_changes = _block;
            let _block$1;
            let $3 = prev2.inner_html === next2.inner_html;
            if ($3) {
              _block$1 = child_changes;
            } else {
              _block$1 = prepend(replace_inner_html(next2.inner_html), child_changes);
            }
            let child_changes$1 = _block$1;
            let _block$2;
            if (child_changes$1 instanceof Empty) {
              _block$2 = children;
            } else {
              _block$2 = prepend(new$3(node_index, 0, child_changes$1, empty_list), children);
            }
            let children$1 = _block$2;
            loop$old = old$1;
            loop$old_keyed = old_keyed;
            loop$new = new$1;
            loop$new_keyed = new_keyed;
            loop$moved = moved;
            loop$moved_offset = moved_offset;
            loop$removed = removed;
            loop$node_index = node_index + 1;
            loop$patch_index = patch_index;
            loop$changes = changes;
            loop$children = children$1;
            loop$path = path;
            loop$cache = cache;
            loop$events = events$1;
          } else {
            let prev2 = $;
            let old_remaining = old.tail;
            let next2 = $1;
            let new_remaining = new$5.tail;
            let change = replace2(node_index - moved_offset, next2);
            let $2 = replace_child(cache, events2, path, node_index, prev2, next2);
            let cache$1 = $2[0];
            let events$1 = $2[1];
            loop$old = old_remaining;
            loop$old_keyed = old_keyed;
            loop$new = new_remaining;
            loop$new_keyed = new_keyed;
            loop$moved = moved;
            loop$moved_offset = moved_offset;
            loop$removed = removed;
            loop$node_index = node_index + 1;
            loop$patch_index = patch_index;
            loop$changes = prepend(change, changes);
            loop$children = children;
            loop$path = path;
            loop$cache = cache$1;
            loop$events = events$1;
          }
        } else if ($ instanceof Map2) {
          let $1 = new$5.head;
          if ($1 instanceof Map2) {
            let prev2 = $;
            let old$1 = old.tail;
            let next2 = $1;
            let new$1 = new$5.tail;
            let child_path = add2(path, node_index, next2.key);
            let child_key = child(child_path);
            let $2 = do_diff(singleton_list(prev2.child), empty2(), singleton_list(next2.child), empty2(), empty2(), 0, 0, 0, node_index, empty_list, empty_list, subtree(child_path), cache, get_subtree(events2, child_key, prev2.mapper));
            let patch = $2.patch;
            let cache$1 = $2.cache;
            let child_events = $2.events;
            let events$1 = update_subtree(events2, child_key, next2.mapper, child_events);
            let _block;
            let $3 = patch.changes;
            if ($3 instanceof Empty) {
              let $4 = patch.children;
              if ($4 instanceof Empty) {
                let $5 = patch.removed;
                if ($5 === 0) {
                  _block = children;
                } else {
                  _block = prepend(patch, children);
                }
              } else {
                _block = prepend(patch, children);
              }
            } else {
              _block = prepend(patch, children);
            }
            let children$1 = _block;
            loop$old = old$1;
            loop$old_keyed = old_keyed;
            loop$new = new$1;
            loop$new_keyed = new_keyed;
            loop$moved = moved;
            loop$moved_offset = moved_offset;
            loop$removed = removed;
            loop$node_index = node_index + 1;
            loop$patch_index = patch_index;
            loop$changes = changes;
            loop$children = children$1;
            loop$path = path;
            loop$cache = cache$1;
            loop$events = events$1;
          } else {
            let prev2 = $;
            let old_remaining = old.tail;
            let next2 = $1;
            let new_remaining = new$5.tail;
            let change = replace2(node_index - moved_offset, next2);
            let $2 = replace_child(cache, events2, path, node_index, prev2, next2);
            let cache$1 = $2[0];
            let events$1 = $2[1];
            loop$old = old_remaining;
            loop$old_keyed = old_keyed;
            loop$new = new_remaining;
            loop$new_keyed = new_keyed;
            loop$moved = moved;
            loop$moved_offset = moved_offset;
            loop$removed = removed;
            loop$node_index = node_index + 1;
            loop$patch_index = patch_index;
            loop$changes = prepend(change, changes);
            loop$children = children;
            loop$path = path;
            loop$cache = cache$1;
            loop$events = events$1;
          }
        } else {
          let $1 = new$5.head;
          if ($1 instanceof Memo) {
            let prev2 = $;
            let old$1 = old.tail;
            let next2 = $1;
            let new$1 = new$5.tail;
            let $2 = equal_lists(prev2.dependencies, next2.dependencies);
            if ($2) {
              let cache$1 = keep_memo(cache, prev2.view, next2.view);
              loop$old = old$1;
              loop$old_keyed = old_keyed;
              loop$new = new$1;
              loop$new_keyed = new_keyed;
              loop$moved = moved;
              loop$moved_offset = moved_offset;
              loop$removed = removed;
              loop$node_index = node_index + 1;
              loop$patch_index = patch_index;
              loop$changes = changes;
              loop$children = children;
              loop$path = path;
              loop$cache = cache$1;
              loop$events = events2;
            } else {
              let prev_node = get_old_memo(cache, prev2.view, prev2.view);
              let next_node = next2.view();
              let cache$1 = add_memo(cache, next2.view, next_node);
              loop$old = prepend(prev_node, old$1);
              loop$old_keyed = old_keyed;
              loop$new = prepend(next_node, new$1);
              loop$new_keyed = new_keyed;
              loop$moved = moved;
              loop$moved_offset = moved_offset;
              loop$removed = removed;
              loop$node_index = node_index;
              loop$patch_index = patch_index;
              loop$changes = changes;
              loop$children = children;
              loop$path = path;
              loop$cache = cache$1;
              loop$events = events2;
            }
          } else {
            let prev2 = $;
            let old_remaining = old.tail;
            let next2 = $1;
            let new_remaining = new$5.tail;
            let change = replace2(node_index - moved_offset, next2);
            let $2 = replace_child(cache, events2, path, node_index, prev2, next2);
            let cache$1 = $2[0];
            let events$1 = $2[1];
            loop$old = old_remaining;
            loop$old_keyed = old_keyed;
            loop$new = new_remaining;
            loop$new_keyed = new_keyed;
            loop$moved = moved;
            loop$moved_offset = moved_offset;
            loop$removed = removed;
            loop$node_index = node_index + 1;
            loop$patch_index = patch_index;
            loop$changes = prepend(change, changes);
            loop$children = children;
            loop$path = path;
            loop$cache = cache$1;
            loop$events = events$1;
          }
        }
      }
    }
  }
}
function diff(cache, old, new$5) {
  let cache$1 = tick(cache);
  let $ = do_diff(singleton_list(old), empty2(), singleton_list(new$5), empty2(), empty2(), 0, 0, 0, 0, empty_list, empty_list, root, cache$1, events(cache$1));
  let patch = $.patch;
  let cache$2 = $.cache;
  let events2 = $.events;
  return new Diff(patch, update_events(cache$2, events2));
}

// build/dev/javascript/lustre/lustre/internals/list.ffi.mjs
var toList2 = (arr) => arr.reduceRight((xs, x) => List$NonEmpty(x, xs), empty_list);
var iterate = (list4, callback) => {
  if (Array.isArray(list4)) {
    for (let i = 0;i < list4.length; i++) {
      callback(list4[i]);
    }
  } else if (list4) {
    for (list4;List$NonEmpty$rest(list4); list4 = List$NonEmpty$rest(list4)) {
      callback(List$NonEmpty$first(list4));
    }
  }
};
var append4 = (a2, b) => {
  if (!List$NonEmpty$rest(a2)) {
    return b;
  } else if (!List$NonEmpty$rest(b)) {
    return a2;
  } else {
    return append(a2, b);
  }
};

// build/dev/javascript/lustre/lustre/internals/constants.ffi.mjs
var NAMESPACE_HTML = "http://www.w3.org/1999/xhtml";
var ELEMENT_NODE = 1;
var TEXT_NODE = 3;
var COMMENT_NODE = 8;
var SUPPORTS_MOVE_BEFORE = !!globalThis.HTMLElement?.prototype?.moveBefore;

// build/dev/javascript/lustre/lustre/vdom/reconciler.ffi.mjs
var setTimeout = globalThis.setTimeout;
var clearTimeout = globalThis.clearTimeout;
var createElementNS = (ns, name) => globalThis.document.createElementNS(ns, name);
var createTextNode = (data2) => globalThis.document.createTextNode(data2);
var createComment = (data2) => globalThis.document.createComment(data2);
var createDocumentFragment = () => globalThis.document.createDocumentFragment();
var insertBefore = (parent, node, reference) => parent.insertBefore(node, reference);
var moveBefore = SUPPORTS_MOVE_BEFORE ? (parent, node, reference) => parent.moveBefore(node, reference) : insertBefore;
var removeChild = (parent, child2) => parent.removeChild(child2);
var getAttribute = (node, name) => node.getAttribute(name);
var setAttribute = (node, name, value) => node.setAttribute(name, value);
var removeAttribute = (node, name) => node.removeAttribute(name);
var addEventListener = (node, name, handler, options) => node.addEventListener(name, handler, options);
var removeEventListener = (node, name, handler) => node.removeEventListener(name, handler);
var setInnerHtml = (node, innerHtml) => node.innerHTML = innerHtml;
var setData = (node, data2) => node.data = data2;
var meta = Symbol("lustre");

class MetadataNode {
  constructor(kind, parent, node, key) {
    this.kind = kind;
    this.key = key;
    this.parent = parent;
    this.children = [];
    this.node = node;
    this.endNode = null;
    this.handlers = new Map;
    this.throttles = new Map;
    this.debouncers = new Map;
  }
  get isVirtual() {
    return this.kind === fragment_kind || this.kind === map_kind;
  }
  get parentNode() {
    return this.isVirtual ? this.node.parentNode : this.node;
  }
}
var insertMetadataChild = (kind, parent, node, index4, key) => {
  const child2 = new MetadataNode(kind, parent, node, key);
  node[meta] = child2;
  parent?.children.splice(index4, 0, child2);
  return child2;
};
var getPath = (node) => {
  let path = "";
  for (let current = node[meta];current.parent; current = current.parent) {
    const separator = current.parent && current.parent.kind === map_kind ? separator_subtree : separator_element;
    if (current.key) {
      path = `${separator}${current.key}${path}`;
    } else {
      const index4 = current.parent.children.indexOf(current);
      path = `${separator}${index4}${path}`;
    }
  }
  return path.slice(1);
};

class Reconciler {
  #root = null;
  #decodeEvent;
  #dispatch;
  #debug = false;
  constructor(root2, decodeEvent, dispatch2, { debug = false } = {}) {
    this.#root = root2;
    this.#decodeEvent = decodeEvent;
    this.#dispatch = dispatch2;
    this.#debug = debug;
  }
  mount(vdom) {
    insertMetadataChild(element_kind, null, this.#root, 0, null);
    this.#insertChild(this.#root, null, this.#root[meta], 0, vdom);
  }
  push(patch, memos2 = null) {
    this.#memos = memos2;
    this.#stack.push({ node: this.#root[meta], patch });
    this.#reconcile();
  }
  #memos;
  #stack = [];
  #reconcile() {
    const stack = this.#stack;
    while (stack.length) {
      let { node, patch } = stack.pop();
      const { path, changes, removed, children: childPatches } = patch;
      iterate(path, (index4) => {
        node = node.children[index4];
      });
      const { children: childNodes } = node;
      iterate(changes, (change) => this.#patch(node, change));
      if (removed) {
        this.#removeChildren(node, childNodes.length - removed, removed);
      }
      iterate(childPatches, (childPatch) => {
        const child2 = childNodes[childPatch.index | 0];
        this.#stack.push({ node: child2, patch: childPatch });
      });
    }
  }
  #patch(node, change) {
    switch (change.kind) {
      case replace_text_kind:
        this.#replaceText(node, change);
        break;
      case replace_inner_html_kind:
        this.#replaceInnerHtml(node, change);
        break;
      case update_kind:
        this.#update(node, change);
        break;
      case move_kind:
        this.#move(node, change);
        break;
      case remove_kind:
        this.#remove(node, change);
        break;
      case replace_kind:
        this.#replace(node, change);
        break;
      case insert_kind:
        this.#insert(node, change);
        break;
    }
  }
  #insert(parent, { children, before }) {
    const fragment2 = createDocumentFragment();
    const beforeEl = this.#getReference(parent, before);
    this.#insertChildren(fragment2, null, parent, before | 0, children);
    insertBefore(parent.parentNode, fragment2, beforeEl);
  }
  #replace(parent, { index: index4, with: child2 }) {
    this.#removeChildren(parent, index4 | 0, 1);
    const beforeEl = this.#getReference(parent, index4);
    this.#insertChild(parent.parentNode, beforeEl, parent, index4 | 0, child2);
  }
  #getReference(node, index4) {
    index4 = index4 | 0;
    const { children } = node;
    const childCount = children.length;
    if (index4 < childCount)
      return children[index4].node;
    if (node.endNode)
      return node.endNode;
    if (!node.isVirtual)
      return null;
    while (node.isVirtual && node.children.length) {
      if (node.endNode)
        return node.endNode.nextSibling;
      node = node.children[node.children.length - 1];
    }
    return node.node.nextSibling;
  }
  #move(parent, { key, before }) {
    before = before | 0;
    const { children, parentNode } = parent;
    const beforeEl = children[before].node;
    let prev = children[before];
    for (let i = before + 1;i < children.length; ++i) {
      const next = children[i];
      children[i] = prev;
      prev = next;
      if (next.key === key) {
        children[before] = next;
        break;
      }
    }
    this.#moveChild(parentNode, prev, beforeEl);
  }
  #moveChildren(domParent, children, beforeEl) {
    for (let i = 0;i < children.length; ++i) {
      this.#moveChild(domParent, children[i], beforeEl);
    }
  }
  #moveChild(domParent, child2, beforeEl) {
    moveBefore(domParent, child2.node, beforeEl);
    if (child2.isVirtual) {
      this.#moveChildren(domParent, child2.children, beforeEl);
    }
    if (child2.endNode) {
      moveBefore(domParent, child2.endNode, beforeEl);
    }
  }
  #remove(parent, { index: index4 }) {
    this.#removeChildren(parent, index4, 1);
  }
  #removeChildren(parent, index4, count) {
    const { children, parentNode } = parent;
    const deleted = children.splice(index4, count);
    for (let i = 0;i < deleted.length; ++i) {
      const child2 = deleted[i];
      const { node, endNode, isVirtual, children: nestedChildren } = child2;
      removeChild(parentNode, node);
      if (endNode) {
        removeChild(parentNode, endNode);
      }
      this.#removeDebouncers(child2);
      if (isVirtual) {
        deleted.push(...nestedChildren);
      }
    }
  }
  #removeDebouncers(node) {
    const { debouncers, children } = node;
    for (const { timeout } of debouncers.values()) {
      if (timeout) {
        clearTimeout(timeout);
      }
    }
    debouncers.clear();
    iterate(children, (child2) => this.#removeDebouncers(child2));
  }
  #update({ node, handlers, throttles, debouncers }, { added, removed }) {
    iterate(removed, ({ name }) => {
      if (handlers.delete(name)) {
        removeEventListener(node, name, handleEvent);
        this.#updateDebounceThrottle(throttles, name, 0);
        this.#updateDebounceThrottle(debouncers, name, 0);
      } else {
        removeAttribute(node, name);
        SYNCED_ATTRIBUTES[name]?.removed?.(node, name);
      }
    });
    iterate(added, (attribute3) => this.#createAttribute(node, attribute3));
  }
  #replaceText({ node }, { content }) {
    setData(node, content ?? "");
  }
  #replaceInnerHtml({ node }, { inner_html }) {
    setInnerHtml(node, inner_html ?? "");
  }
  #insertChildren(domParent, beforeEl, metaParent, index4, children) {
    iterate(children, (child2) => this.#insertChild(domParent, beforeEl, metaParent, index4++, child2));
  }
  #insertChild(domParent, beforeEl, metaParent, index4, vnode) {
    switch (vnode.kind) {
      case element_kind: {
        const node = this.#createElement(metaParent, index4, vnode);
        this.#insertChildren(node, null, node[meta], 0, vnode.children);
        insertBefore(domParent, node, beforeEl);
        break;
      }
      case text_kind: {
        const node = this.#createTextNode(metaParent, index4, vnode);
        insertBefore(domParent, node, beforeEl);
        break;
      }
      case fragment_kind: {
        const marker = "lustre:fragment";
        const head = this.#createHead(marker, metaParent, index4, vnode);
        insertBefore(domParent, head, beforeEl);
        this.#insertChildren(domParent, beforeEl, head[meta], 0, vnode.children);
        if (this.#debug) {
          head[meta].endNode = createComment(` /${marker} `);
          insertBefore(domParent, head[meta].endNode, beforeEl);
        }
        break;
      }
      case unsafe_inner_html_kind: {
        const node = this.#createElement(metaParent, index4, vnode);
        this.#replaceInnerHtml({ node }, vnode);
        insertBefore(domParent, node, beforeEl);
        break;
      }
      case map_kind: {
        const head = this.#createHead("lustre:map", metaParent, index4, vnode);
        insertBefore(domParent, head, beforeEl);
        this.#insertChild(domParent, beforeEl, head[meta], 0, vnode.child);
        break;
      }
      case memo_kind: {
        const child2 = this.#memos?.get(vnode.view) ?? vnode.view();
        this.#insertChild(domParent, beforeEl, metaParent, index4, child2);
        break;
      }
    }
  }
  #createElement(parent, index4, { kind, key, tag, namespace, attributes }) {
    const node = createElementNS(namespace || NAMESPACE_HTML, tag);
    insertMetadataChild(kind, parent, node, index4, key);
    if (this.#debug && key) {
      setAttribute(node, "data-lustre-key", key);
    }
    iterate(attributes, (attribute3) => this.#createAttribute(node, attribute3));
    return node;
  }
  #createTextNode(parent, index4, { kind, key, content }) {
    const node = createTextNode(content ?? "");
    insertMetadataChild(kind, parent, node, index4, key);
    return node;
  }
  #createHead(marker, parent, index4, { kind, key }) {
    const node = this.#debug ? createComment(markerComment(marker, key)) : createTextNode("");
    insertMetadataChild(kind, parent, node, index4, key);
    return node;
  }
  #createAttribute(node, attribute3) {
    const { debouncers, handlers, throttles } = node[meta];
    const {
      kind,
      name,
      value,
      prevent_default: prevent,
      debounce: debounceDelay,
      throttle: throttleDelay
    } = attribute3;
    switch (kind) {
      case attribute_kind: {
        const valueOrDefault = value ?? "";
        if (name === "virtual:defaultValue") {
          node.defaultValue = valueOrDefault;
          return;
        } else if (name === "virtual:defaultChecked") {
          node.defaultChecked = true;
          return;
        } else if (name === "virtual:defaultSelected") {
          node.defaultSelected = true;
          return;
        }
        if (valueOrDefault !== getAttribute(node, name)) {
          setAttribute(node, name, valueOrDefault);
        }
        SYNCED_ATTRIBUTES[name]?.added?.(node, valueOrDefault);
        break;
      }
      case property_kind:
        node[name] = value;
        break;
      case event_kind: {
        if (handlers.has(name)) {
          removeEventListener(node, name, handleEvent);
        }
        const passive = prevent.kind === never_kind;
        addEventListener(node, name, handleEvent, { passive });
        this.#updateDebounceThrottle(throttles, name, throttleDelay);
        this.#updateDebounceThrottle(debouncers, name, debounceDelay);
        handlers.set(name, (event2) => this.#handleEvent(attribute3, event2));
        break;
      }
    }
  }
  #updateDebounceThrottle(map6, name, delay) {
    const debounceOrThrottle = map6.get(name);
    if (delay > 0) {
      if (debounceOrThrottle) {
        debounceOrThrottle.delay = delay;
      } else {
        map6.set(name, { delay });
      }
    } else if (debounceOrThrottle) {
      const { timeout } = debounceOrThrottle;
      if (timeout) {
        clearTimeout(timeout);
      }
      map6.delete(name);
    }
  }
  #handleEvent(attribute3, event2) {
    const { currentTarget, type } = event2;
    const { debouncers, throttles } = currentTarget[meta];
    const path = getPath(currentTarget);
    const {
      prevent_default: prevent,
      stop_propagation: stop,
      include
    } = attribute3;
    if (prevent.kind === always_kind)
      event2.preventDefault();
    if (stop.kind === always_kind)
      event2.stopPropagation();
    if (type === "submit") {
      event2.detail ??= {};
      event2.detail.formData = [
        ...new FormData(event2.target, event2.submitter).entries()
      ];
    }
    const data2 = this.#decodeEvent(event2, path, type, include);
    const throttle = throttles.get(type);
    if (throttle) {
      const now = Date.now();
      const last = throttle.last || 0;
      if (now > last + throttle.delay) {
        throttle.last = now;
        throttle.lastEvent = event2;
        this.#dispatch(event2, data2);
      }
    }
    const debounce = debouncers.get(type);
    if (debounce) {
      clearTimeout(debounce.timeout);
      debounce.timeout = setTimeout(() => {
        if (event2 === throttles.get(type)?.lastEvent)
          return;
        this.#dispatch(event2, data2);
      }, debounce.delay);
    }
    if (!throttle && !debounce) {
      this.#dispatch(event2, data2);
    }
  }
}
var markerComment = (marker, key) => {
  if (key) {
    return ` ${marker} key="${escape(key)}" `;
  } else {
    return ` ${marker} `;
  }
};
var handleEvent = (event2) => {
  const { currentTarget, type } = event2;
  const handler = currentTarget[meta].handlers.get(type);
  handler(event2);
};
var syncedBooleanAttribute = (name) => {
  return {
    added(node) {
      node[name] = true;
    },
    removed(node) {
      node[name] = false;
    }
  };
};
var syncedAttribute = (name) => {
  return {
    added(node, value) {
      node[name] = value;
    }
  };
};
var SYNCED_ATTRIBUTES = {
  checked: syncedBooleanAttribute("checked"),
  selected: syncedBooleanAttribute("selected"),
  value: syncedAttribute("value"),
  autofocus: {
    added(node) {
      queueMicrotask(() => {
        node.focus?.();
      });
    }
  },
  autoplay: {
    added(node) {
      try {
        node.play?.();
      } catch (e) {
        console.error(e);
      }
    }
  }
};

// build/dev/javascript/lustre/lustre/element/keyed.mjs
function do_extract_keyed_children(loop$key_children_pairs, loop$keyed_children, loop$children) {
  while (true) {
    let key_children_pairs = loop$key_children_pairs;
    let keyed_children = loop$keyed_children;
    let children = loop$children;
    if (key_children_pairs instanceof Empty) {
      return [keyed_children, reverse(children)];
    } else {
      let rest = key_children_pairs.tail;
      let key = key_children_pairs.head[0];
      let element$1 = key_children_pairs.head[1];
      let keyed_element = to_keyed(key, element$1);
      let _block;
      if (key === "") {
        _block = keyed_children;
      } else {
        _block = insert2(keyed_children, key, keyed_element);
      }
      let keyed_children$1 = _block;
      let children$1 = prepend(keyed_element, children);
      loop$key_children_pairs = rest;
      loop$keyed_children = keyed_children$1;
      loop$children = children$1;
    }
  }
}
function extract_keyed_children(children) {
  return do_extract_keyed_children(children, empty2(), empty_list);
}
function element3(tag, attributes, children) {
  let $ = extract_keyed_children(children);
  let keyed_children = $[0];
  let children$1 = $[1];
  return element("", "", tag, attributes, children$1, keyed_children, false, is_void_html_element(tag, ""));
}
function namespaced2(namespace, tag, attributes, children) {
  let $ = extract_keyed_children(children);
  let keyed_children = $[0];
  let children$1 = $[1];
  return element("", namespace, tag, attributes, children$1, keyed_children, false, is_void_html_element(tag, namespace));
}
function fragment2(children) {
  let $ = extract_keyed_children(children);
  let keyed_children = $[0];
  let children$1 = $[1];
  return fragment("", children$1, keyed_children);
}

// build/dev/javascript/lustre/lustre/vdom/virtualise.ffi.mjs
var virtualise = (root2) => {
  const rootMeta = insertMetadataChild(element_kind, null, root2, 0, null);
  const { children } = virtualiseChildren(rootMeta, root2, root2.firstChild);
  if (children.length > 1) {
    const rootNodeMeta = insertMetadataChild(element_kind, null, root2, 0, null);
    rootMeta.kind = fragment_kind;
    rootMeta.node = globalThis.document.createTextNode("");
    rootMeta.parent = rootNodeMeta;
    rootNodeMeta.children.push(rootMeta);
    root2.insertBefore(rootMeta.node, root2.firstChild);
    return fragment2(toList3(children));
  }
  if (children.length === 1) {
    return children[0][1];
  }
  const placeholder = globalThis.document.createTextNode("");
  insertMetadataChild(text_kind, rootMeta, placeholder, 0, null);
  root2.insertBefore(placeholder, root2.firstChild);
  return none2();
};
var virtualiseChild = (meta2, domParent, child2, index4) => {
  if (child2.nodeType === COMMENT_NODE) {
    const data2 = child2.data.trim();
    if (data2.startsWith("lustre:fragment")) {
      return virtualiseFragment(meta2, domParent, child2, index4);
    }
    if (data2.startsWith("lustre:map")) {
      return virtualiseMap(meta2, domParent, child2, index4);
    }
    if (data2.startsWith("lustre:memo")) {
      return virtualiseMemo(meta2, domParent, child2, index4);
    }
    return null;
  }
  if (child2.nodeType === ELEMENT_NODE) {
    return virtualiseElement(meta2, child2, index4);
  }
  if (child2.nodeType === TEXT_NODE) {
    return virtualiseText(meta2, child2, index4);
  }
  return null;
};
var virtualiseElement = (metaParent, node, index4) => {
  const key = node.getAttribute("data-lustre-key") ?? "";
  if (key) {
    node.removeAttribute("data-lustre-key");
  }
  const meta2 = insertMetadataChild(element_kind, metaParent, node, index4, key);
  const tag = node.localName;
  const namespace = node.namespaceURI;
  const isHtmlElement = !namespace || namespace === NAMESPACE_HTML;
  if (isHtmlElement && INPUT_ELEMENTS.includes(tag)) {
    virtualiseInputEvents(tag, node);
  }
  const attributes = virtualiseAttributes(node);
  const { children } = virtualiseChildren(meta2, node, node.firstChild);
  const vnode = isHtmlElement ? element3(tag, attributes, toList3(children)) : namespaced2(namespace, tag, attributes, toList3(children));
  return childResult(key, vnode, node.nextSibling);
};
var virtualiseChildren = (meta2, domParent, childNode) => {
  const children = [];
  while (childNode && (childNode.nodeType !== COMMENT_NODE || childNode.data.trim() !== "/lustre:fragment")) {
    const child2 = virtualiseChild(meta2, domParent, childNode, children.length);
    if (child2) {
      children.push([child2.key, child2.vnode]);
      childNode = child2.next;
    } else {
      childNode = childNode.nextSibling;
    }
  }
  return { children, end: childNode };
};
var virtualiseText = (meta2, node, index4) => {
  insertMetadataChild(text_kind, meta2, node, index4, null);
  return childResult("", text2(node.data), node.nextSibling);
};
var virtualiseFragment = (metaParent, domParent, node, index4) => {
  const key = parseKey(node.data);
  const meta2 = insertMetadataChild(fragment_kind, metaParent, node, index4, key);
  const { children, end } = virtualiseChildren(meta2, domParent, node.nextSibling);
  meta2.endNode = end;
  const vnode = fragment2(toList3(children));
  return childResult(key, vnode, end?.nextSibling);
};
var virtualiseMap = (metaParent, domParent, node, index4) => {
  const key = parseKey(node.data);
  const meta2 = insertMetadataChild(map_kind, metaParent, node, index4, key);
  const child2 = virtualiseNextChild(meta2, domParent, node, 0);
  if (!child2)
    return null;
  const vnode = map5(child2.vnode, (x) => x);
  return childResult(key, vnode, child2.next);
};
var virtualiseMemo = (meta2, domParent, node, index4) => {
  const key = parseKey(node.data);
  const child2 = virtualiseNextChild(meta2, domParent, node, index4);
  if (!child2)
    return null;
  domParent.removeChild(node);
  const vnode = memo2(toList3([ref({})]), () => child2.vnode);
  return childResult(key, vnode, child2.next);
};
var virtualiseNextChild = (meta2, domParent, node, index4) => {
  while (true) {
    node = node.nextSibling;
    if (!node)
      return null;
    const child2 = virtualiseChild(meta2, domParent, node, index4);
    if (child2)
      return child2;
  }
};
var childResult = (key, vnode, next) => {
  return { key, vnode, next };
};
var virtualiseAttributes = (node) => {
  const attributes = [];
  for (let i = 0;i < node.attributes.length; i++) {
    const attr = node.attributes[i];
    if (attr.name !== "xmlns") {
      attributes.push(attribute2(attr.localName, attr.value));
    }
  }
  return toList3(attributes);
};
var INPUT_ELEMENTS = ["input", "select", "textarea"];
var virtualiseInputEvents = (tag, node) => {
  const value = node.value;
  const checked = node.checked;
  if (tag === "input" && node.type === "checkbox" && !checked)
    return;
  if (tag === "input" && node.type === "radio" && !checked)
    return;
  if (node.type !== "checkbox" && node.type !== "radio" && !value)
    return;
  queueMicrotask(() => {
    node.value = value;
    node.checked = checked;
    node.dispatchEvent(new Event("input", { bubbles: true }));
    node.dispatchEvent(new Event("change", { bubbles: true }));
    if (globalThis.document.activeElement !== node) {
      node.dispatchEvent(new Event("blur", { bubbles: true }));
    }
  });
};
var parseKey = (data2) => {
  const keyMatch = data2.match(/key="([^"]*)"/);
  if (!keyMatch)
    return "";
  return unescapeKey(keyMatch[1]);
};
var unescapeKey = (key) => {
  return key.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&#39;/g, "'");
};
var toList3 = (arr) => arr.reduceRight((xs, x) => List$NonEmpty(x, xs), empty_list);

// build/dev/javascript/lustre/lustre/runtime/client/runtime.ffi.mjs
var is_browser = () => !!globalThis.document;
class Runtime {
  constructor(root2, [model, effects], view, update2, options) {
    this.root = root2;
    this.#model = model;
    this.#view = view;
    this.#update = update2;
    this.root.addEventListener("context-request", (event2) => {
      if (!(event2.context && event2.callback))
        return;
      if (!this.#contexts.has(event2.context))
        return;
      event2.stopImmediatePropagation();
      const context = this.#contexts.get(event2.context);
      if (event2.subscribe) {
        const unsubscribe2 = () => {
          context.subscribers = context.subscribers.filter((subscriber) => subscriber !== event2.callback);
        };
        context.subscribers.push([event2.callback, unsubscribe2]);
        event2.callback(context.value, unsubscribe2);
      } else {
        event2.callback(context.value);
      }
    });
    const decodeEvent = (event2, path, name) => decode2(this.#cache, path, name, event2);
    const dispatch2 = (event2, data2) => {
      const [cache, result] = dispatch(this.#cache, data2);
      this.#cache = cache;
      if (Result$isOk(result)) {
        const handler = Result$Ok$0(result);
        if (handler.stop_propagation)
          event2.stopPropagation();
        if (handler.prevent_default)
          event2.preventDefault();
        this.dispatch(handler.message, false);
      }
    };
    this.#reconciler = new Reconciler(this.root, decodeEvent, dispatch2, options);
    this.#vdom = virtualise(this.root);
    this.#cache = new$4();
    this.#handleEffects(effects);
    this.#render();
  }
  root = null;
  dispatch(message, shouldFlush = false) {
    if (this.#shouldQueue) {
      this.#queue.push(message);
    } else {
      const [model, effects] = this.#update(this.#model, message);
      this.#model = model;
      this.#scheduleRender(shouldFlush);
      this.#handleEffects(effects);
    }
  }
  emit(event2, data2) {
    const target = this.root.host ?? this.root;
    target.dispatchEvent(new LustreEvent(event2, data2));
  }
  provide(key, value) {
    if (!this.#contexts.has(key)) {
      this.#contexts.set(key, { value, subscribers: [] });
    } else {
      const context = this.#contexts.get(key);
      if (isEqual2(context.value, value)) {
        return;
      }
      context.value = value;
      for (let i = context.subscribers.length - 1;i >= 0; i--) {
        const [subscriber, unsubscribe2] = context.subscribers[i];
        if (!subscriber) {
          context.subscribers.splice(i, 1);
          continue;
        }
        subscriber(value, unsubscribe2);
      }
    }
  }
  subscribe(key, decoder) {
    if (!key)
      return;
    this.#contextSubscriptions.get(key)?.();
    const target = this.root.host ?? this.root;
    target.dispatchEvent(new ContextRequestEvent(key, (value, unsubscribe2) => {
      const previousUnsubscribe = this.#contextSubscriptions.get(key);
      if (previousUnsubscribe !== unsubscribe2) {
        previousUnsubscribe?.();
      }
      const decoded = run(value, decoder);
      this.#contextSubscriptions.set(key, unsubscribe2);
      if (Result$isOk(decoded)) {
        this.dispatch(Result$Ok$0(decoded), true);
      }
    }, true));
  }
  unsubscribe(key) {
    const unsubscribe2 = this.#contextSubscriptions.get(key);
    if (unsubscribe2) {
      unsubscribe2();
      this.#contextSubscriptions.delete(key);
    }
  }
  unsubscribeAll() {
    for (const [_, unsubscribe2] of this.#contextSubscriptions) {
      unsubscribe2?.();
    }
    this.#contextSubscriptions.clear();
  }
  #model;
  #view;
  #update;
  #vdom;
  #cache;
  #reconciler;
  #contexts = new Map;
  #contextSubscriptions = new Map;
  #shouldQueue = false;
  #queue = [];
  #beforePaint = empty_list;
  #afterPaint = empty_list;
  #renderTimer = null;
  #actions = {
    dispatch: (message) => this.dispatch(message),
    emit: (event2, data2) => this.emit(event2, data2),
    select: () => {},
    root: () => this.root,
    provide: (key, value) => this.provide(key, value),
    subscribe: (key, decoder) => this.subscribe(key, decoder),
    unsubscribe: (key) => this.unsubscribe(key)
  };
  #scheduleRender(shouldFlush = false) {
    if (this.#renderTimer)
      return;
    if (shouldFlush) {
      this.#renderTimer = "sync";
      queueMicrotask(() => this.#render());
    } else {
      this.#renderTimer = window.requestAnimationFrame(() => this.#render());
    }
  }
  #handleEffects(effects) {
    this.#shouldQueue = true;
    let updateCalledDuringEffects = false;
    while (true) {
      iterate(effects.synchronous, (effect) => effect(this.#actions));
      this.#beforePaint = append4(this.#beforePaint, effects.before_paint);
      this.#afterPaint = append4(this.#afterPaint, effects.after_paint);
      if (!this.#queue.length)
        break;
      const message = this.#queue.shift();
      [this.#model, effects] = this.#update(this.#model, message);
      updateCalledDuringEffects = true;
    }
    this.#shouldQueue = false;
    return updateCalledDuringEffects;
  }
  #handleAsyncEffects(effects) {
    if (this.#handleEffects(effects)) {
      this.#scheduleRender(true);
    }
  }
  #render() {
    this.#renderTimer = null;
    const next = this.#view(this.#model);
    const { patch, cache } = diff(this.#cache, this.#vdom, next);
    this.#cache = cache;
    this.#vdom = next;
    this.#reconciler.push(patch, memos(cache));
    if (List$isNonEmpty(this.#beforePaint)) {
      const effects = makeEffect(this.#beforePaint);
      this.#beforePaint = empty_list;
      queueMicrotask(() => this.#handleAsyncEffects(effects));
    }
    if (List$isNonEmpty(this.#afterPaint)) {
      const effects = makeEffect(this.#afterPaint);
      this.#afterPaint = empty_list;
      window.requestAnimationFrame(() => this.#handleAsyncEffects(effects));
    }
  }
}
function makeEffect(synchronous) {
  return {
    synchronous,
    after_paint: empty_list,
    before_paint: empty_list
  };
}
var copiedStyleSheets = new WeakMap;
async function adoptStylesheets(shadowRoot) {
  const pendingParentStylesheets = [];
  for (const node of globalThis.document.querySelectorAll("link[rel=stylesheet], style")) {
    if (node.sheet)
      continue;
    pendingParentStylesheets.push(new Promise((resolve, reject) => {
      node.addEventListener("load", resolve);
      node.addEventListener("error", reject);
    }));
  }
  await Promise.allSettled(pendingParentStylesheets);
  if (!shadowRoot.host.isConnected) {
    return [];
  }
  shadowRoot.adoptedStyleSheets = shadowRoot.host.getRootNode().adoptedStyleSheets;
  const pending = [];
  for (const sheet of globalThis.document.styleSheets) {
    try {
      shadowRoot.adoptedStyleSheets.push(sheet);
    } catch {
      try {
        let copiedSheet = copiedStyleSheets.get(sheet);
        if (!copiedSheet) {
          copiedSheet = new CSSStyleSheet;
          for (const rule of sheet.cssRules) {
            copiedSheet.insertRule(rule.cssText, copiedSheet.cssRules.length);
          }
          copiedStyleSheets.set(sheet, copiedSheet);
        }
        shadowRoot.adoptedStyleSheets.push(copiedSheet);
      } catch {
        const node = sheet.ownerNode.cloneNode();
        shadowRoot.prepend(node);
        pending.push(node);
      }
    }
  }
  return pending;
}

class ContextRequestEvent extends Event {
  constructor(context, callback, subscribe2) {
    super("context-request", { bubbles: true, composed: true });
    this.context = context;
    this.callback = callback;
    this.subscribe = subscribe2;
  }
}

class LustreEvent extends CustomEvent {
  isLustreEvent = true;
  constructor(name, detail) {
    super(name, { detail, bubbles: true, composed: true });
  }
}

// build/dev/javascript/lustre/lustre/runtime/client/component.ffi.mjs
var make_component = ({ init, update: update2, view, config }, name) => {
  if (!is_browser())
    return Result$Error(Error$NotABrowser());
  if (!name.includes("-"))
    return Result$Error(Error$BadComponentName(name));
  if (globalThis.customElements.get(name)) {
    return Result$Error(Error$ComponentAlreadyRegistered(name));
  }
  const attributes = new Map;
  const observedAttributes = [];
  iterate(config.attributes, ([name2, decoder]) => {
    if (attributes.has(name2))
      return;
    attributes.set(name2, decoder);
    observedAttributes.push(name2);
  });
  const [model, effects] = init(undefined);
  const component = class Component extends globalThis.HTMLElement {
    static get observedAttributes() {
      return observedAttributes;
    }
    static formAssociated = config.is_form_associated;
    #runtime;
    #adoptedStyleNodes = [];
    #initialContexts = config.contexts;
    constructor() {
      super();
      this.internals = this.attachInternals();
      if (!this.internals.shadowRoot) {
        this.attachShadow({
          mode: config.open_shadow_root ? "open" : "closed",
          delegatesFocus: config.delegates_focus
        });
      }
      if (config.adopt_styles) {
        this.#adoptStyleSheets();
      }
      this.#runtime = new Runtime(this.internals.shadowRoot, [model, effects], view, update2);
    }
    connectedCallback() {
      this.#requestContexts();
      if (Option$isSome(config.on_connect)) {
        this.dispatch(Option$Some$0(config.on_connect));
      }
    }
    adoptedCallback() {
      if (config.adopt_styles) {
        this.#adoptStyleSheets();
      }
      this.#unsubscribeContexts();
      if (Option$isSome(config.on_adopt)) {
        this.dispatch(Option$Some$0(config.on_adopt));
      }
    }
    disconnectedCallback() {
      this.#unsubscribeContexts();
      if (Option$isSome(config.on_disconnect)) {
        this.dispatch(Option$Some$0(config.on_disconnect));
      }
    }
    attributeChangedCallback(name2, _, value) {
      const decoded = attributes.get(name2)(value ?? "");
      if (Result$isOk(decoded)) {
        this.dispatch(Result$Ok$0(decoded), true);
      }
    }
    formResetCallback() {
      if (Option$isSome(config.on_form_reset)) {
        this.dispatch(Option$Some$0(config.on_form_reset));
      }
    }
    formStateRestoreCallback(state, reason) {
      switch (reason) {
        case "restore":
          if (Option$isSome(config.on_form_restore)) {
            this.dispatch(Option$Some$0(config.on_form_restore)(state));
          }
          break;
        case "autocomplete":
          if (Option$isSome(config.on_form_autofill)) {
            this.dispatch(Option$Some$0(config.on_form_autofill)(state));
          }
          break;
      }
    }
    formDisabledCallback(disabled) {
      if (Option$isSome(config.on_form_disabled)) {
        this.dispatch(Option$Some$0(config.on_form_disabled)(disabled));
      }
    }
    send(message) {
      if (Message$isEffectDispatchedMessage(message)) {
        this.dispatch(message.message, false);
      } else if (Message$isEffectEmitEvent(message)) {
        this.emit(message.name, message.data);
      } else if (Message$isSystemRequestedShutdown(message)) {}
    }
    dispatch(message, shouldFlush = false) {
      this.#runtime.dispatch(message, shouldFlush);
    }
    emit(event2, data2) {
      this.#runtime.emit(event2, data2);
    }
    provide(key, value) {
      this.#runtime.provide(key, value);
    }
    subscribe(key, decoder) {
      this.#runtime.subscribe(key, decoder);
    }
    unsubscribe(key) {
      this.#runtime.unsubscribe(key);
      this.#initialContexts = filter(this.#initialContexts, (subscription) => {
        return subscription[0] !== key;
      });
    }
    #requestContexts() {
      const requested = new Set;
      iterate(this.#initialContexts, ([key, decoder]) => {
        if (!key)
          return;
        if (requested.has(key))
          return;
        this.#runtime.subscribe(key, decoder);
        requested.add(key);
      });
    }
    #unsubscribeContexts() {
      this.#runtime.unsubscribeAll();
    }
    async#adoptStyleSheets() {
      while (this.#adoptedStyleNodes.length) {
        this.#adoptedStyleNodes.pop().remove();
        this.shadowRoot.firstChild.remove();
      }
      this.#adoptedStyleNodes = await adoptStylesheets(this.internals.shadowRoot);
    }
  };
  iterate(config.properties, ([name2, decoder]) => {
    if (Object.hasOwn(component.prototype, name2)) {
      return;
    }
    Object.defineProperty(component.prototype, name2, {
      get() {
        return this[`_${name2}`];
      },
      set(value) {
        this[`_${name2}`] = value;
        const decoded = run(value, decoder);
        if (Result$isOk(decoded)) {
          this.dispatch(Result$Ok$0(decoded), true);
        }
      }
    });
  });
  globalThis.customElements.define(name, component);
  return Result$Ok(undefined);
};

// build/dev/javascript/lustre/lustre/component.mjs
function on_attribute_change(name, decoder) {
  return new Option((config) => {
    let attributes = prepend([name, decoder], config.attributes);
    return new Config2(config.open_shadow_root, config.adopt_styles, config.delegates_focus, attributes, config.properties, config.contexts, config.is_form_associated, config.on_form_autofill, config.on_form_reset, config.on_form_restore, config.on_form_disabled, config.on_connect, config.on_adopt, config.on_disconnect);
  });
}
function open_shadow_root(open) {
  return new Option((config) => {
    return new Config2(open, config.adopt_styles, config.delegates_focus, config.attributes, config.properties, config.contexts, config.is_form_associated, config.on_form_autofill, config.on_form_reset, config.on_form_restore, config.on_form_disabled, config.on_connect, config.on_adopt, config.on_disconnect);
  });
}

// build/dev/javascript/lustre/lustre/runtime/client/spa.ffi.mjs
class Spa {
  #runtime;
  constructor(root2, [init, effects], update2, view) {
    this.#runtime = new Runtime(root2, [init, effects], view, update2);
  }
  send(message) {
    if (Message$isEffectDispatchedMessage(message)) {
      this.dispatch(message.message, false);
    } else if (Message$isEffectEmitEvent(message)) {
      this.emit(message.name, message.data);
    } else if (Message$isSystemRequestedShutdown(message)) {}
  }
  dispatch(message) {
    this.#runtime.dispatch(message);
  }
  emit(event2, data2) {
    this.#runtime.emit(event2, data2);
  }
}
var start = ({ init, update: update2, view }, selector, flags) => {
  if (!is_browser())
    return Result$Error(Error$NotABrowser());
  const root2 = selector instanceof HTMLElement ? selector : globalThis.document.querySelector(selector);
  if (!root2)
    return Result$Error(Error$ElementNotFound(selector));
  return Result$Ok(new Spa(root2, init(flags), update2, view));
};

// build/dev/javascript/lustre/lustre/runtime/server/runtime.ffi.mjs
class Runtime2 {
  #model;
  #update;
  #view;
  #config;
  #vdom;
  #cache;
  #providers = make();
  #callbacks = /* @__PURE__ */ new Set;
  constructor(_, init, update2, view, config, start_arguments) {
    const [model, effects] = init(start_arguments);
    this.#model = model;
    this.#update = update2;
    this.#view = view;
    this.#config = config;
    this.#vdom = this.#view(this.#model);
    this.#cache = from_node(this.#vdom);
    this.#handle_effect(effects);
  }
  send(message) {
    if (Message$isClientDispatchedMessage(message)) {
      const { message: message2 } = message2;
      const next = this.#handle_client_message(message2);
      const diff2 = diff(this.#cache, this.#vdom, next);
      this.#vdom = next;
      this.#cache = diff2.cache;
      this.broadcast(reconcile(diff2.patch, memos(diff2.cache)));
    } else if (Message$isClientRegisteredCallback(message)) {
      const { callback } = message;
      this.#callbacks.add(callback);
      callback(mount(this.#config.open_shadow_root, this.#config.adopt_styles, keys(this.#config.attributes), keys(this.#config.properties), keys(this.#config.contexts), this.#providers, this.#vdom, memos(this.#cache)));
      if (Option$isSome(this.#config.on_connect)) {
        this.#dispatch(Option$Some$0(this.#config.on_connect));
      }
    } else if (Message$isClientDeregisteredCallback(message)) {
      const { callback } = message;
      this.#callbacks.delete(callback);
      if (Option$isSome(this.#config.on_disconnect)) {
        this.#dispatch(Option$Some$0(this.#config.on_disconnect));
      }
    } else if (Message$isEffectDispatchedMessage(message)) {
      const { message: message2 } = message2;
      const [model, effect] = this.#update(this.#model, message2);
      const next = this.#view(model);
      const diff2 = diff(this.#cache, this.#vdom, next);
      this.#handle_effect(effect);
      this.#model = model;
      this.#vdom = next;
      this.#cache = diff2.cache;
      this.broadcast(reconcile(diff2.patch, memos(diff2.cache)));
    } else if (Message$isEffectEmitEvent(message)) {
      const { name, data: data2 } = message;
      this.broadcast(emit(name, data2));
    } else if (Message$isEffectProvidedValue(message)) {
      const { key, value } = message;
      const existing = get(this.#providers, key);
      if (Result$isOk(existing) && isEqual2(Result$Ok$0(existing), value)) {
        return;
      }
      this.#providers = insert(this.#providers, key, value);
      this.broadcast(provide(key, value));
    } else if (Message$isEffectRequestedContextSubscription(message)) {
      const { key, decoder } = message;
      this.broadcast(subscribe(key));
      this.#config.contexts = insert(this.#config.contexts, key, decoder);
    } else if (Message$isEffectRemovedContextSubscription(message)) {
      const { key } = message;
      this.broadcast(unsubscribe(key));
      this.#config.contexts = undefined(this.#config.contexts, key);
    } else if (Message$isSystemRequestedShutdown(message)) {
      this.#model = null;
      this.#update = null;
      this.#view = null;
      this.#config = null;
      this.#vdom = null;
      this.#cache = null;
      this.#providers = null;
      this.#callbacks.clear();
    }
  }
  broadcast(message) {
    for (const callback of this.#callbacks) {
      callback(message);
    }
  }
  #handle_client_message(message) {
    if (ServerMessage$isBatch(message)) {
      const { messages } = message;
      let model = this.#model;
      let effect = none();
      for (let list4 = messages;List$NonEmpty$rest(list4); list4 = List$NonEmpty$rest(list4)) {
        const result = this.#handle_client_message(List$NonEmpty$first(list4));
        if (Result$isOk(result)) {
          model = Result$Ok$0(result)[0];
          effect = batch(toList2([effect, Result$Ok$0(result)[1]]));
          break;
        }
      }
      this.#handle_effect(effect);
      this.#model = model;
      return this.#view(model);
    } else if (ServerMessage$isAttributeChanged(message)) {
      const { name, value } = message;
      const result = this.#handle_attribute_change(name, value);
      if (!Result$isOk(result)) {
        return this.#vdom;
      }
      return this.#dispatch(Result$Ok$0(result));
    } else if (ServerMessage$isPropertyChanged(message)) {
      const { name, value } = message;
      const result = this.#handle_properties_change(name, value);
      if (!Result$isOk(result)) {
        return this.#vdom;
      }
      return this.#dispatch(Result$Ok$0(result));
    } else if (ServerMessage$isEventFired(message)) {
      const { path, name, event: event2 } = message2;
      const [cache, result] = handle(this.#cache, path, name, event2);
      this.#cache = cache;
      if (!Result$isOk(result)) {
        return this.#vdom;
      }
      const { message: message2 } = Result$Ok$0(result);
      return this.#dispatch(message2);
    } else if (ServerMessage$isContextProvided(message)) {
      const { key, value } = message;
      let result = get(this.#config.contexts, key);
      if (!Result$isOk(result)) {
        return this.#vdom;
      }
      result = run(value, Result$Ok$0(result));
      if (!Result$isOk(result)) {
        return this.#vdom;
      }
      return this.#dispatch(Result$Ok$0(result));
    }
  }
  #dispatch(message) {
    const [model, effects] = this.#update(this.#model, message);
    this.#handle_effect(effects);
    this.#model = model;
    return this.#view(this.#model);
  }
  #handle_attribute_change(name, value) {
    const result = get(this.#config.attributes, name);
    if (!Result$isOk(result)) {
      return result;
    }
    return Result$Ok$0(result)(value);
  }
  #handle_properties_change(name, value) {
    const result = get(this.#config.properties, name);
    if (!Result$isOk(result)) {
      return result;
    }
    return Result$Ok$0(result)(value);
  }
  #handle_effect(effect) {
    const dispatch2 = (message) => this.send(Message$EffectDispatchedMessage(message));
    const emit2 = (name, data2) => this.send(Message$EffectEmitEvent(name, data2));
    const select = () => {
      return;
    };
    const internals = () => {
      return;
    };
    const provide2 = (key, value) => this.send(Message$EffectProvidedValue(key, value));
    const subscribe2 = (key, decoder) => this.send(Message$EffectRequestedContextSubscription(key, decoder));
    const unsubscribe2 = (key) => this.send(Message$EffectRemovedContextSubscription(key));
    globalThis.queueMicrotask(() => {
      perform(effect, dispatch2, emit2, select, internals, provide2, subscribe2, unsubscribe2);
    });
  }
}

// build/dev/javascript/lustre/lustre.mjs
class BadComponentName extends CustomType {
  constructor(name) {
    super();
    this.name = name;
  }
}
var Error$BadComponentName = (name) => new BadComponentName(name);
class ComponentAlreadyRegistered extends CustomType {
  constructor(name) {
    super();
    this.name = name;
  }
}
var Error$ComponentAlreadyRegistered = (name) => new ComponentAlreadyRegistered(name);
class ElementNotFound extends CustomType {
  constructor(selector) {
    super();
    this.selector = selector;
  }
}
var Error$ElementNotFound = (selector) => new ElementNotFound(selector);
class NotABrowser extends CustomType {
}
var Error$NotABrowser = () => new NotABrowser;
function application(init, update2, view) {
  return new App(new None, init, update2, view, default_config);
}
function element4(view) {
  return application((_) => {
    return [undefined, none()];
  }, (_, _1) => {
    return [undefined, none()];
  }, (_) => {
    return view;
  });
}
function component(init, update2, view, options) {
  return new App(new None, init, update2, view, configure(options));
}
function start4(app, selector, arguments$) {
  return guard(!is_browser(), new Error(new NotABrowser), () => {
    return start(app, selector, arguments$);
  });
}
// build/dev/javascript/gleam_stdlib/gleam/uri.mjs
class Uri extends CustomType {
  constructor(scheme, userinfo, host, port, path, query, fragment3) {
    super();
    this.scheme = scheme;
    this.userinfo = userinfo;
    this.host = host;
    this.port = port;
    this.path = path;
    this.query = query;
    this.fragment = fragment3;
  }
}
var empty3 = /* @__PURE__ */ new Uri(/* @__PURE__ */ new None, /* @__PURE__ */ new None, /* @__PURE__ */ new None, /* @__PURE__ */ new None, "", /* @__PURE__ */ new None, /* @__PURE__ */ new None);
function parse_fragment(rest, pieces) {
  return new Ok(new Uri(pieces.scheme, pieces.userinfo, pieces.host, pieces.port, pieces.path, pieces.query, new Some(rest)));
}
function parse_query_with_question_mark_loop(loop$original, loop$uri_string, loop$pieces, loop$size) {
  while (true) {
    let original = loop$original;
    let uri_string = loop$uri_string;
    let pieces = loop$pieces;
    let size3 = loop$size;
    if (uri_string.charCodeAt(0) === 35) {
      if (size3 === 0) {
        let rest = uri_string.slice(1);
        return parse_fragment(rest, pieces);
      } else {
        let rest = uri_string.slice(1);
        let query = string_codeunit_slice(original, 0, size3);
        let pieces$1 = new Uri(pieces.scheme, pieces.userinfo, pieces.host, pieces.port, pieces.path, new Some(query), pieces.fragment);
        return parse_fragment(rest, pieces$1);
      }
    } else if (uri_string === "") {
      return new Ok(new Uri(pieces.scheme, pieces.userinfo, pieces.host, pieces.port, pieces.path, new Some(original), pieces.fragment));
    } else {
      let $ = pop_codeunit(uri_string);
      let rest = $[1];
      loop$original = original;
      loop$uri_string = rest;
      loop$pieces = pieces;
      loop$size = size3 + 1;
    }
  }
}
function parse_query_with_question_mark(uri_string, pieces) {
  return parse_query_with_question_mark_loop(uri_string, uri_string, pieces, 0);
}
function parse_path_loop(loop$original, loop$uri_string, loop$pieces, loop$size) {
  while (true) {
    let original = loop$original;
    let uri_string = loop$uri_string;
    let pieces = loop$pieces;
    let size3 = loop$size;
    let $ = uri_string.charCodeAt(0);
    if ($ === 63) {
      let rest = uri_string.slice(1);
      let path = string_codeunit_slice(original, 0, size3);
      let pieces$1 = new Uri(pieces.scheme, pieces.userinfo, pieces.host, pieces.port, path, pieces.query, pieces.fragment);
      return parse_query_with_question_mark(rest, pieces$1);
    } else if ($ === 35) {
      let rest = uri_string.slice(1);
      let path = string_codeunit_slice(original, 0, size3);
      let pieces$1 = new Uri(pieces.scheme, pieces.userinfo, pieces.host, pieces.port, path, pieces.query, pieces.fragment);
      return parse_fragment(rest, pieces$1);
    } else if (uri_string === "") {
      return new Ok(new Uri(pieces.scheme, pieces.userinfo, pieces.host, pieces.port, original, pieces.query, pieces.fragment));
    } else {
      let $1 = pop_codeunit(uri_string);
      let rest = $1[1];
      loop$original = original;
      loop$uri_string = rest;
      loop$pieces = pieces;
      loop$size = size3 + 1;
    }
  }
}
function parse_path(uri_string, pieces) {
  return parse_path_loop(uri_string, uri_string, pieces, 0);
}
function parse_port_loop(loop$uri_string, loop$pieces, loop$port) {
  while (true) {
    let uri_string = loop$uri_string;
    let pieces = loop$pieces;
    let port = loop$port;
    let $ = uri_string.charCodeAt(0);
    if ($ === 48) {
      let rest = uri_string.slice(1);
      loop$uri_string = rest;
      loop$pieces = pieces;
      loop$port = port * 10;
    } else if ($ === 49) {
      let rest = uri_string.slice(1);
      loop$uri_string = rest;
      loop$pieces = pieces;
      loop$port = port * 10 + 1;
    } else if ($ === 50) {
      let rest = uri_string.slice(1);
      loop$uri_string = rest;
      loop$pieces = pieces;
      loop$port = port * 10 + 2;
    } else if ($ === 51) {
      let rest = uri_string.slice(1);
      loop$uri_string = rest;
      loop$pieces = pieces;
      loop$port = port * 10 + 3;
    } else if ($ === 52) {
      let rest = uri_string.slice(1);
      loop$uri_string = rest;
      loop$pieces = pieces;
      loop$port = port * 10 + 4;
    } else if ($ === 53) {
      let rest = uri_string.slice(1);
      loop$uri_string = rest;
      loop$pieces = pieces;
      loop$port = port * 10 + 5;
    } else if ($ === 54) {
      let rest = uri_string.slice(1);
      loop$uri_string = rest;
      loop$pieces = pieces;
      loop$port = port * 10 + 6;
    } else if ($ === 55) {
      let rest = uri_string.slice(1);
      loop$uri_string = rest;
      loop$pieces = pieces;
      loop$port = port * 10 + 7;
    } else if ($ === 56) {
      let rest = uri_string.slice(1);
      loop$uri_string = rest;
      loop$pieces = pieces;
      loop$port = port * 10 + 8;
    } else if ($ === 57) {
      let rest = uri_string.slice(1);
      loop$uri_string = rest;
      loop$pieces = pieces;
      loop$port = port * 10 + 9;
    } else if ($ === 63) {
      let rest = uri_string.slice(1);
      let pieces$1 = new Uri(pieces.scheme, pieces.userinfo, pieces.host, new Some(port), pieces.path, pieces.query, pieces.fragment);
      return parse_query_with_question_mark(rest, pieces$1);
    } else if ($ === 35) {
      let rest = uri_string.slice(1);
      let pieces$1 = new Uri(pieces.scheme, pieces.userinfo, pieces.host, new Some(port), pieces.path, pieces.query, pieces.fragment);
      return parse_fragment(rest, pieces$1);
    } else if ($ === 47) {
      let pieces$1 = new Uri(pieces.scheme, pieces.userinfo, pieces.host, new Some(port), pieces.path, pieces.query, pieces.fragment);
      return parse_path(uri_string, pieces$1);
    } else if (uri_string === "") {
      return new Ok(new Uri(pieces.scheme, pieces.userinfo, pieces.host, new Some(port), pieces.path, pieces.query, pieces.fragment));
    } else {
      return new Error(undefined);
    }
  }
}
function parse_port(uri_string, pieces) {
  let $ = uri_string.charCodeAt(0);
  if (uri_string.startsWith(":0")) {
    let rest = uri_string.slice(2);
    return parse_port_loop(rest, pieces, 0);
  } else if (uri_string.startsWith(":1")) {
    let rest = uri_string.slice(2);
    return parse_port_loop(rest, pieces, 1);
  } else if (uri_string.startsWith(":2")) {
    let rest = uri_string.slice(2);
    return parse_port_loop(rest, pieces, 2);
  } else if (uri_string.startsWith(":3")) {
    let rest = uri_string.slice(2);
    return parse_port_loop(rest, pieces, 3);
  } else if (uri_string.startsWith(":4")) {
    let rest = uri_string.slice(2);
    return parse_port_loop(rest, pieces, 4);
  } else if (uri_string.startsWith(":5")) {
    let rest = uri_string.slice(2);
    return parse_port_loop(rest, pieces, 5);
  } else if (uri_string.startsWith(":6")) {
    let rest = uri_string.slice(2);
    return parse_port_loop(rest, pieces, 6);
  } else if (uri_string.startsWith(":7")) {
    let rest = uri_string.slice(2);
    return parse_port_loop(rest, pieces, 7);
  } else if (uri_string.startsWith(":8")) {
    let rest = uri_string.slice(2);
    return parse_port_loop(rest, pieces, 8);
  } else if (uri_string.startsWith(":9")) {
    let rest = uri_string.slice(2);
    return parse_port_loop(rest, pieces, 9);
  } else if (uri_string === ":") {
    return new Ok(pieces);
  } else if (uri_string === "") {
    return new Ok(pieces);
  } else if ($ === 63) {
    let rest = uri_string.slice(1);
    return parse_query_with_question_mark(rest, pieces);
  } else if (uri_string.startsWith(":?")) {
    let rest = uri_string.slice(2);
    return parse_query_with_question_mark(rest, pieces);
  } else if ($ === 35) {
    let rest = uri_string.slice(1);
    return parse_fragment(rest, pieces);
  } else if (uri_string.startsWith(":#")) {
    let rest = uri_string.slice(2);
    return parse_fragment(rest, pieces);
  } else if ($ === 47) {
    return parse_path(uri_string, pieces);
  } else if ($ === 58) {
    let rest = uri_string.slice(1);
    if (rest.charCodeAt(0) === 47) {
      return parse_path(rest, pieces);
    } else {
      return new Error(undefined);
    }
  } else {
    return new Error(undefined);
  }
}
function parse_host_outside_of_brackets_loop(loop$original, loop$uri_string, loop$pieces, loop$size) {
  while (true) {
    let original = loop$original;
    let uri_string = loop$uri_string;
    let pieces = loop$pieces;
    let size3 = loop$size;
    let $ = uri_string.charCodeAt(0);
    if (uri_string === "") {
      return new Ok(new Uri(pieces.scheme, pieces.userinfo, new Some(original), pieces.port, pieces.path, pieces.query, pieces.fragment));
    } else if ($ === 58) {
      let host = string_codeunit_slice(original, 0, size3);
      let pieces$1 = new Uri(pieces.scheme, pieces.userinfo, new Some(host), pieces.port, pieces.path, pieces.query, pieces.fragment);
      return parse_port(uri_string, pieces$1);
    } else if ($ === 47) {
      let host = string_codeunit_slice(original, 0, size3);
      let pieces$1 = new Uri(pieces.scheme, pieces.userinfo, new Some(host), pieces.port, pieces.path, pieces.query, pieces.fragment);
      return parse_path(uri_string, pieces$1);
    } else if ($ === 63) {
      let rest = uri_string.slice(1);
      let host = string_codeunit_slice(original, 0, size3);
      let pieces$1 = new Uri(pieces.scheme, pieces.userinfo, new Some(host), pieces.port, pieces.path, pieces.query, pieces.fragment);
      return parse_query_with_question_mark(rest, pieces$1);
    } else if ($ === 35) {
      let rest = uri_string.slice(1);
      let host = string_codeunit_slice(original, 0, size3);
      let pieces$1 = new Uri(pieces.scheme, pieces.userinfo, new Some(host), pieces.port, pieces.path, pieces.query, pieces.fragment);
      return parse_fragment(rest, pieces$1);
    } else {
      let $1 = pop_codeunit(uri_string);
      let rest = $1[1];
      loop$original = original;
      loop$uri_string = rest;
      loop$pieces = pieces;
      loop$size = size3 + 1;
    }
  }
}
function parse_host_outside_of_brackets(uri_string, pieces) {
  return parse_host_outside_of_brackets_loop(uri_string, uri_string, pieces, 0);
}
function is_valid_host_within_brackets_char(char) {
  return 48 >= char && char <= 57 || 65 >= char && char <= 90 || 97 >= char && char <= 122 || char === 58 || char === 46;
}
function parse_host_within_brackets_loop(loop$original, loop$uri_string, loop$pieces, loop$size) {
  while (true) {
    let original = loop$original;
    let uri_string = loop$uri_string;
    let pieces = loop$pieces;
    let size3 = loop$size;
    let $ = uri_string.charCodeAt(0);
    if (uri_string === "") {
      return new Ok(new Uri(pieces.scheme, pieces.userinfo, new Some(uri_string), pieces.port, pieces.path, pieces.query, pieces.fragment));
    } else if ($ === 93) {
      if (size3 === 0) {
        let rest = uri_string.slice(1);
        return parse_port(rest, pieces);
      } else {
        let rest = uri_string.slice(1);
        let host = string_codeunit_slice(original, 0, size3 + 1);
        let pieces$1 = new Uri(pieces.scheme, pieces.userinfo, new Some(host), pieces.port, pieces.path, pieces.query, pieces.fragment);
        return parse_port(rest, pieces$1);
      }
    } else if ($ === 47) {
      if (size3 === 0) {
        return parse_path(uri_string, pieces);
      } else {
        let host = string_codeunit_slice(original, 0, size3);
        let pieces$1 = new Uri(pieces.scheme, pieces.userinfo, new Some(host), pieces.port, pieces.path, pieces.query, pieces.fragment);
        return parse_path(uri_string, pieces$1);
      }
    } else if ($ === 63) {
      if (size3 === 0) {
        let rest = uri_string.slice(1);
        return parse_query_with_question_mark(rest, pieces);
      } else {
        let rest = uri_string.slice(1);
        let host = string_codeunit_slice(original, 0, size3);
        let pieces$1 = new Uri(pieces.scheme, pieces.userinfo, new Some(host), pieces.port, pieces.path, pieces.query, pieces.fragment);
        return parse_query_with_question_mark(rest, pieces$1);
      }
    } else if ($ === 35) {
      if (size3 === 0) {
        let rest = uri_string.slice(1);
        return parse_fragment(rest, pieces);
      } else {
        let rest = uri_string.slice(1);
        let host = string_codeunit_slice(original, 0, size3);
        let pieces$1 = new Uri(pieces.scheme, pieces.userinfo, new Some(host), pieces.port, pieces.path, pieces.query, pieces.fragment);
        return parse_fragment(rest, pieces$1);
      }
    } else {
      let $1 = pop_codeunit(uri_string);
      let char = $1[0];
      let rest = $1[1];
      let $2 = is_valid_host_within_brackets_char(char);
      if ($2) {
        loop$original = original;
        loop$uri_string = rest;
        loop$pieces = pieces;
        loop$size = size3 + 1;
      } else {
        return parse_host_outside_of_brackets_loop(original, original, pieces, 0);
      }
    }
  }
}
function parse_host_within_brackets(uri_string, pieces) {
  return parse_host_within_brackets_loop(uri_string, uri_string, pieces, 0);
}
function parse_host(uri_string, pieces) {
  let $ = uri_string.charCodeAt(0);
  if ($ === 91) {
    return parse_host_within_brackets(uri_string, pieces);
  } else if ($ === 58) {
    let pieces$1 = new Uri(pieces.scheme, pieces.userinfo, new Some(""), pieces.port, pieces.path, pieces.query, pieces.fragment);
    return parse_port(uri_string, pieces$1);
  } else if (uri_string === "") {
    return new Ok(new Uri(pieces.scheme, pieces.userinfo, new Some(""), pieces.port, pieces.path, pieces.query, pieces.fragment));
  } else {
    return parse_host_outside_of_brackets(uri_string, pieces);
  }
}
function parse_userinfo_loop(loop$original, loop$uri_string, loop$pieces, loop$size) {
  while (true) {
    let original = loop$original;
    let uri_string = loop$uri_string;
    let pieces = loop$pieces;
    let size3 = loop$size;
    let $ = uri_string.charCodeAt(0);
    if ($ === 64) {
      if (size3 === 0) {
        let rest = uri_string.slice(1);
        return parse_host(rest, pieces);
      } else {
        let rest = uri_string.slice(1);
        let userinfo = string_codeunit_slice(original, 0, size3);
        let pieces$1 = new Uri(pieces.scheme, new Some(userinfo), pieces.host, pieces.port, pieces.path, pieces.query, pieces.fragment);
        return parse_host(rest, pieces$1);
      }
    } else if (uri_string === "") {
      return parse_host(original, pieces);
    } else if ($ === 47) {
      return parse_host(original, pieces);
    } else if ($ === 63) {
      return parse_host(original, pieces);
    } else if ($ === 35) {
      return parse_host(original, pieces);
    } else {
      let $1 = pop_codeunit(uri_string);
      let rest = $1[1];
      loop$original = original;
      loop$uri_string = rest;
      loop$pieces = pieces;
      loop$size = size3 + 1;
    }
  }
}
function parse_authority_pieces(string5, pieces) {
  return parse_userinfo_loop(string5, string5, pieces, 0);
}
function parse_authority_with_slashes(uri_string, pieces) {
  if (uri_string === "//") {
    return new Ok(new Uri(pieces.scheme, pieces.userinfo, new Some(""), pieces.port, pieces.path, pieces.query, pieces.fragment));
  } else if (uri_string.startsWith("//")) {
    let rest = uri_string.slice(2);
    return parse_authority_pieces(rest, pieces);
  } else {
    return parse_path(uri_string, pieces);
  }
}
function parse_scheme_loop(loop$original, loop$uri_string, loop$pieces, loop$size) {
  while (true) {
    let original = loop$original;
    let uri_string = loop$uri_string;
    let pieces = loop$pieces;
    let size3 = loop$size;
    let $ = uri_string.charCodeAt(0);
    if ($ === 47) {
      if (size3 === 0) {
        return parse_authority_with_slashes(uri_string, pieces);
      } else {
        let scheme = string_codeunit_slice(original, 0, size3);
        let pieces$1 = new Uri(new Some(lowercase(scheme)), pieces.userinfo, pieces.host, pieces.port, pieces.path, pieces.query, pieces.fragment);
        return parse_authority_with_slashes(uri_string, pieces$1);
      }
    } else if ($ === 63) {
      if (size3 === 0) {
        let rest = uri_string.slice(1);
        return parse_query_with_question_mark(rest, pieces);
      } else {
        let rest = uri_string.slice(1);
        let scheme = string_codeunit_slice(original, 0, size3);
        let pieces$1 = new Uri(new Some(lowercase(scheme)), pieces.userinfo, pieces.host, pieces.port, pieces.path, pieces.query, pieces.fragment);
        return parse_query_with_question_mark(rest, pieces$1);
      }
    } else if ($ === 35) {
      if (size3 === 0) {
        let rest = uri_string.slice(1);
        return parse_fragment(rest, pieces);
      } else {
        let rest = uri_string.slice(1);
        let scheme = string_codeunit_slice(original, 0, size3);
        let pieces$1 = new Uri(new Some(lowercase(scheme)), pieces.userinfo, pieces.host, pieces.port, pieces.path, pieces.query, pieces.fragment);
        return parse_fragment(rest, pieces$1);
      }
    } else if ($ === 58) {
      if (size3 === 0) {
        return new Error(undefined);
      } else {
        let rest = uri_string.slice(1);
        let scheme = string_codeunit_slice(original, 0, size3);
        let pieces$1 = new Uri(new Some(lowercase(scheme)), pieces.userinfo, pieces.host, pieces.port, pieces.path, pieces.query, pieces.fragment);
        return parse_authority_with_slashes(rest, pieces$1);
      }
    } else if (uri_string === "") {
      return new Ok(new Uri(pieces.scheme, pieces.userinfo, pieces.host, pieces.port, original, pieces.query, pieces.fragment));
    } else {
      let $1 = pop_codeunit(uri_string);
      let rest = $1[1];
      loop$original = original;
      loop$uri_string = rest;
      loop$pieces = pieces;
      loop$size = size3 + 1;
    }
  }
}
function parse2(uri_string) {
  return parse_scheme_loop(uri_string, uri_string, empty3, 0);
}
function remove_dot_segments_loop(loop$input, loop$accumulator) {
  while (true) {
    let input = loop$input;
    let accumulator = loop$accumulator;
    if (input instanceof Empty) {
      return reverse(accumulator);
    } else {
      let segment = input.head;
      let rest = input.tail;
      let _block;
      if (segment === "") {
        _block = accumulator;
      } else if (segment === ".") {
        _block = accumulator;
      } else if (segment === "..") {
        if (accumulator instanceof Empty) {
          _block = accumulator;
        } else {
          let accumulator$12 = accumulator.tail;
          _block = accumulator$12;
        }
      } else {
        let segment$1 = segment;
        let accumulator$12 = accumulator;
        _block = prepend(segment$1, accumulator$12);
      }
      let accumulator$1 = _block;
      loop$input = rest;
      loop$accumulator = accumulator$1;
    }
  }
}
function remove_dot_segments(input) {
  return remove_dot_segments_loop(input, toList([]));
}
function path_segments(path) {
  return remove_dot_segments(split2(path, "/"));
}
function to_string4(uri) {
  let _block;
  let $ = uri.fragment;
  if ($ instanceof Some) {
    let fragment3 = $[0];
    _block = toList(["#", fragment3]);
  } else {
    _block = toList([]);
  }
  let parts = _block;
  let _block$1;
  let $1 = uri.query;
  if ($1 instanceof Some) {
    let query = $1[0];
    _block$1 = prepend("?", prepend(query, parts));
  } else {
    _block$1 = parts;
  }
  let parts$1 = _block$1;
  let parts$2 = prepend(uri.path, parts$1);
  let _block$2;
  let $2 = uri.host;
  let $3 = starts_with(uri.path, "/");
  if ($2 instanceof Some && !$3) {
    let host = $2[0];
    if (host !== "") {
      _block$2 = prepend("/", parts$2);
    } else {
      _block$2 = parts$2;
    }
  } else {
    _block$2 = parts$2;
  }
  let parts$3 = _block$2;
  let _block$3;
  let $4 = uri.host;
  let $5 = uri.port;
  if ($4 instanceof Some && $5 instanceof Some) {
    let port = $5[0];
    _block$3 = prepend(":", prepend(to_string(port), parts$3));
  } else {
    _block$3 = parts$3;
  }
  let parts$4 = _block$3;
  let _block$4;
  let $6 = uri.scheme;
  let $7 = uri.userinfo;
  let $8 = uri.host;
  if ($6 instanceof Some) {
    if ($7 instanceof Some) {
      if ($8 instanceof Some) {
        let s = $6[0];
        let u = $7[0];
        let h = $8[0];
        _block$4 = prepend(s, prepend("://", prepend(u, prepend("@", prepend(h, parts$4)))));
      } else {
        let s = $6[0];
        _block$4 = prepend(s, prepend(":", parts$4));
      }
    } else if ($8 instanceof Some) {
      let s = $6[0];
      let h = $8[0];
      _block$4 = prepend(s, prepend("://", prepend(h, parts$4)));
    } else {
      let s = $6[0];
      _block$4 = prepend(s, prepend(":", parts$4));
    }
  } else if ($7 instanceof None && $8 instanceof Some) {
    let h = $8[0];
    _block$4 = prepend("//", prepend(h, parts$4));
  } else {
    _block$4 = parts$4;
  }
  let parts$5 = _block$4;
  return concat2(parts$5);
}
// build/dev/javascript/gleam_http/gleam/http.mjs
class Get extends CustomType {
}
class Post extends CustomType {
}
class Head extends CustomType {
}
class Put extends CustomType {
}
class Delete extends CustomType {
}
class Trace extends CustomType {
}
class Connect extends CustomType {
}
class Options extends CustomType {
}
class Patch2 extends CustomType {
}
class Http extends CustomType {
}
class Https extends CustomType {
}
function method_to_string(method) {
  if (method instanceof Get) {
    return "GET";
  } else if (method instanceof Post) {
    return "POST";
  } else if (method instanceof Head) {
    return "HEAD";
  } else if (method instanceof Put) {
    return "PUT";
  } else if (method instanceof Delete) {
    return "DELETE";
  } else if (method instanceof Trace) {
    return "TRACE";
  } else if (method instanceof Connect) {
    return "CONNECT";
  } else if (method instanceof Options) {
    return "OPTIONS";
  } else if (method instanceof Patch2) {
    return "PATCH";
  } else {
    let method$1 = method[0];
    return method$1;
  }
}
function scheme_to_string(scheme) {
  if (scheme instanceof Http) {
    return "http";
  } else {
    return "https";
  }
}
function scheme_from_string(scheme) {
  let $ = lowercase(scheme);
  if ($ === "http") {
    return new Ok(new Http);
  } else if ($ === "https") {
    return new Ok(new Https);
  } else {
    return new Error(undefined);
  }
}

// build/dev/javascript/gleam_http/gleam/http/request.mjs
class Request extends CustomType {
  constructor(method, headers, body, scheme, host, port, path, query) {
    super();
    this.method = method;
    this.headers = headers;
    this.body = body;
    this.scheme = scheme;
    this.host = host;
    this.port = port;
    this.path = path;
    this.query = query;
  }
}
function to_uri(request) {
  return new Uri(new Some(scheme_to_string(request.scheme)), new None, new Some(request.host), request.port, request.path, request.query, new None);
}
function from_uri(uri) {
  return try$((() => {
    let _pipe = uri.scheme;
    let _pipe$1 = unwrap(_pipe, "");
    return scheme_from_string(_pipe$1);
  })(), (scheme) => {
    return try$((() => {
      let _pipe = uri.host;
      return to_result(_pipe, undefined);
    })(), (host) => {
      let req = new Request(new Get, toList([]), "", scheme, host, uri.port, uri.path, uri.query);
      return new Ok(req);
    });
  });
}

// build/dev/javascript/gleam_http/gleam/http/response.mjs
class Response extends CustomType {
  constructor(status, headers, body) {
    super();
    this.status = status;
    this.headers = headers;
    this.body = body;
  }
}
var Response$Response = (status, headers, body) => new Response(status, headers, body);
function set_body(response, body) {
  return new Response(response.status, response.headers, body);
}
function get_header(response, key) {
  return key_find(response.headers, lowercase(key));
}
function map8(response, transform) {
  let _pipe = response.body;
  let _pipe$1 = transform(_pipe);
  return ((_capture) => {
    return set_body(response, _capture);
  })(_pipe$1);
}
// build/dev/javascript/gleam_javascript/gleam_javascript_ffi.mjs
class PromiseLayer {
  constructor(promise) {
    this.promise = promise;
  }
  static wrap(value) {
    return value instanceof Promise ? new PromiseLayer(value) : value;
  }
  static unwrap(value) {
    return value instanceof PromiseLayer ? value.promise : value;
  }
}
function resolve(value) {
  return Promise.resolve(PromiseLayer.wrap(value));
}
function then_await(promise, fn) {
  return promise.then((value) => fn(PromiseLayer.unwrap(value)));
}
function map_promise(promise, fn) {
  return promise.then((value) => PromiseLayer.wrap(fn(PromiseLayer.unwrap(value))));
}
function rescue(promise, fn) {
  return promise.catch((error) => fn(error));
}

// build/dev/javascript/gleam_javascript/gleam/javascript/promise.mjs
function tap(promise, callback) {
  let _pipe = promise;
  return map_promise(_pipe, (a2) => {
    callback(a2);
    return a2;
  });
}
function try_await(promise, callback) {
  let _pipe = promise;
  return then_await(_pipe, (result) => {
    if (result instanceof Ok) {
      let a2 = result[0];
      return callback(a2);
    } else {
      let e = result[0];
      return resolve(new Error(e));
    }
  });
}
// build/dev/javascript/gleam_fetch/gleam_fetch_ffi.mjs
async function raw_send(request) {
  try {
    return Result$Ok(await fetch(request));
  } catch (error) {
    return Result$Error(FetchError$NetworkError(error.toString()));
  }
}
function from_fetch_response(response) {
  let headers = [...response.headers].reverse();
  return Response$Response(response.status, arrayToList2(headers), response);
}
function request_common(request) {
  let url = to_string4(to_uri(request));
  let method = method_to_string(request.method).toUpperCase();
  let options = {
    headers: make_headers(request.headers),
    method
  };
  return [url, options];
}
function to_fetch_request(request) {
  let [url, options] = request_common(request);
  if (options.method !== "GET" && options.method !== "HEAD")
    options.body = request.body;
  return new globalThis.Request(url, options);
}
function make_headers(headersList) {
  let headers = new globalThis.Headers;
  for (let [k, v] of headersList)
    headers.append(k.toLowerCase(), v);
  return headers;
}
async function read_text_body(response) {
  let body;
  try {
    body = await response.body.text();
  } catch (error) {
    return Result$Error(FetchError$UnableToReadBody());
  }
  return Result$Ok(map8(response, () => body));
}
function arrayToList2(array3) {
  let list4 = List$Empty();
  for (const element5 of array3) {
    list4 = List$NonEmpty(element5, list4);
  }
  return list4;
}

// build/dev/javascript/gleam_fetch/gleam/fetch.mjs
class NetworkError extends CustomType {
  constructor($0) {
    super();
    this[0] = $0;
  }
}
var FetchError$NetworkError = ($0) => new NetworkError($0);
class UnableToReadBody extends CustomType {
}
var FetchError$UnableToReadBody = () => new UnableToReadBody;
function send2(request) {
  let _pipe = request;
  let _pipe$1 = to_fetch_request(_pipe);
  let _pipe$2 = raw_send(_pipe$1);
  return try_await(_pipe$2, (resp) => {
    return resolve(new Ok(from_fetch_response(resp)));
  });
}
// build/dev/javascript/rsvp/rsvp.ffi.mjs
var from_relative_url = (url_string) => {
  if (!globalThis.location)
    return new Error(undefined);
  const url = new URL(url_string, globalThis.location.href);
  const uri = uri_from_url(url);
  return new Ok(uri);
};
var uri_from_url = (url) => {
  const optional = (value) => value ? new Some(value) : new None;
  return new Uri(optional(url.protocol?.slice(0, -1)), new None, optional(url.hostname), optional(url.port && Number(url.port)), url.pathname, optional(url.search?.slice(1)), optional(url.hash?.slice(1)));
};

// build/dev/javascript/rsvp/rsvp.mjs
class BadBody extends CustomType {
}
class BadUrl extends CustomType {
  constructor($0) {
    super();
    this[0] = $0;
  }
}
class HttpError extends CustomType {
  constructor($0) {
    super();
    this[0] = $0;
  }
}
class JsonError extends CustomType {
  constructor($0) {
    super();
    this[0] = $0;
  }
}
class NetworkError2 extends CustomType {
}
class UnhandledResponse extends CustomType {
  constructor($0) {
    super();
    this[0] = $0;
  }
}
class Handler2 extends CustomType {
  constructor(run2) {
    super();
    this.run = run2;
  }
}
function decode_json_body(response, decoder) {
  let _pipe = response.body;
  let _pipe$1 = parse(_pipe, decoder);
  return map_error(_pipe$1, (var0) => {
    return new JsonError(var0);
  });
}
function expect_ok_response(handler) {
  return new Handler2((result) => {
    return handler(try$(result, (response) => {
      let $ = response.status;
      let code2 = $;
      if (code2 >= 200 && code2 < 300) {
        return new Ok(response);
      } else {
        let code3 = $;
        if (code3 >= 400 && code3 < 600) {
          return new Error(new HttpError(response));
        } else {
          return new Error(new UnhandledResponse(response));
        }
      }
    }));
  });
}
function expect_json_response(handler) {
  return expect_ok_response((result) => {
    return handler(try$(result, (response) => {
      let $ = get_header(response, "content-type");
      if ($ instanceof Ok) {
        let $1 = $[0];
        if ($1 === "application/json") {
          return new Ok(response);
        } else if ($1.startsWith("application/json;")) {
          return new Ok(response);
        } else {
          return new Error(new UnhandledResponse(response));
        }
      } else {
        return new Error(new UnhandledResponse(response));
      }
    }));
  });
}
function expect_json(decoder, handler) {
  return expect_json_response((result) => {
    let _pipe = result;
    let _pipe$1 = try$(_pipe, (_capture) => {
      return decode_json_body(_capture, decoder);
    });
    return handler(_pipe$1);
  });
}
function reject(err, handler) {
  return from2((dispatch2) => {
    let _pipe = new Error(err);
    let _pipe$1 = handler.run(_pipe);
    return dispatch2(_pipe$1);
  });
}
function do_send(request, handler) {
  return from2((dispatch2) => {
    let _pipe = send2(request);
    let _pipe$1 = try_await(_pipe, read_text_body);
    let _pipe$2 = map_promise(_pipe$1, (_capture) => {
      return map_error(_capture, (error) => {
        if (error instanceof NetworkError) {
          return new NetworkError2;
        } else if (error instanceof UnableToReadBody) {
          return new BadBody;
        } else {
          return new BadBody;
        }
      });
    });
    let _pipe$3 = rescue(_pipe$2, (_) => {
      return new Error(new NetworkError2);
    });
    let _pipe$4 = map_promise(_pipe$3, handler.run);
    tap(_pipe$4, dispatch2);
    return;
  });
}
function send3(request, handler) {
  return do_send(request, handler);
}
function to_uri2(uri_string) {
  let _block;
  if (uri_string.startsWith("./")) {
    _block = from_relative_url(uri_string);
  } else if (uri_string.charCodeAt(0) === 47) {
    _block = from_relative_url(uri_string);
  } else {
    _block = parse2(uri_string);
  }
  let _pipe = _block;
  return replace_error(_pipe, new BadUrl(uri_string));
}
function get3(url, handler) {
  let $ = to_uri2(url);
  if ($ instanceof Ok) {
    let uri = $[0];
    let $1 = from_uri(uri);
    if ($1 instanceof Ok) {
      let request = $1[0];
      return send3(request, handler);
    } else {
      return reject(new BadUrl(url), handler);
    }
  } else {
    let err = $[0];
    return reject(err, handler);
  }
}

// build/dev/javascript/inlay/inlay/embed.mjs
class YoutubeVideo extends CustomType {
  constructor(id, start_time, playlist) {
    super();
    this.id = id;
    this.start_time = start_time;
    this.playlist = playlist;
  }
}
class YoutubePlaylist extends CustomType {
  constructor(id) {
    super();
    this.id = id;
  }
}
class VimeoVideo extends CustomType {
  constructor(id, privacy_hash) {
    super();
    this.id = id;
    this.privacy_hash = privacy_hash;
  }
}
class SpotifyMedia extends CustomType {
  constructor(media_type, id) {
    super();
    this.media_type = media_type;
    this.id = id;
  }
}
class Tweet extends CustomType {
  constructor(handle2, id) {
    super();
    this.handle = handle2;
    this.id = id;
  }
}
class TikTokVideo extends CustomType {
  constructor(username, id) {
    super();
    this.username = username;
    this.id = id;
  }
}
class BlueskyPost extends CustomType {
  constructor(handle2, rkey) {
    super();
    this.handle = handle2;
    this.rkey = rkey;
  }
}
class InstagramPost extends CustomType {
  constructor(post_type, id) {
    super();
    this.post_type = post_type;
    this.id = id;
  }
}
class TwitchChannel extends CustomType {
  constructor(name) {
    super();
    this.name = name;
  }
}
class TwitchVideo extends CustomType {
  constructor(id) {
    super();
    this.id = id;
  }
}
class MapLocation extends CustomType {
  constructor(zoom, lat, long) {
    super();
    this.zoom = zoom;
    this.lat = lat;
    this.long = long;
  }
}
class TedTalk extends CustomType {
  constructor(slug) {
    super();
    this.slug = slug;
  }
}
class SoundCloudTrack extends CustomType {
  constructor(path) {
    super();
    this.path = path;
  }
}
class MastodonPost extends CustomType {
  constructor(server, user, id) {
    super();
    this.server = server;
    this.user = user;
    this.id = id;
  }
}
class PixelfedPost extends CustomType {
  constructor(server, user, id) {
    super();
    this.server = server;
    this.user = user;
    this.id = id;
  }
}
class AppleMusicMedia extends CustomType {
  constructor(media_type, country, slug, id) {
    super();
    this.media_type = media_type;
    this.country = country;
    this.slug = slug;
    this.id = id;
  }
}
class SpotifyPlaylist extends CustomType {
}
class SpotifyTrack extends CustomType {
}
class SpotifyAlbum extends CustomType {
}
class SpotifyArtist extends CustomType {
}
class SpotifyEpisode extends CustomType {
}
class SpotifyShow extends CustomType {
}
class AppleMusicAlbum extends CustomType {
}
class AppleMusicArtist extends CustomType {
}
class AppleMusicPlaylist extends CustomType {
}
class AppleMusicSong extends CustomType {
  constructor(track_id) {
    super();
    this.track_id = track_id;
  }
}
class AppleMusicMusicVideo extends CustomType {
}
class Post2 extends CustomType {
}
class Reel extends CustomType {
}
class TV extends CustomType {
}
class Full extends CustomType {
  constructor(caption, likes) {
    super();
    this.caption = caption;
    this.likes = likes;
  }
}
class Compact extends CustomType {
}
class Config3 extends CustomType {
  constructor(youtube, vimeo, spotify, twitter, tiktok, bluesky, instagram, twitch, openstreetmap, ted, soundcloud, mastodon, pixelfed, apple_music) {
    super();
    this.youtube = youtube;
    this.vimeo = vimeo;
    this.spotify = spotify;
    this.twitter = twitter;
    this.tiktok = tiktok;
    this.bluesky = bluesky;
    this.instagram = instagram;
    this.twitch = twitch;
    this.openstreetmap = openstreetmap;
    this.ted = ted;
    this.soundcloud = soundcloud;
    this.mastodon = mastodon;
    this.pixelfed = pixelfed;
    this.apple_music = apple_music;
  }
}
class YoutubeConfig extends CustomType {
  constructor(no_cookie, aspect_ratio) {
    super();
    this.no_cookie = no_cookie;
    this.aspect_ratio = aspect_ratio;
  }
}
class VimeoConfig extends CustomType {
  constructor(dnt, aspect_ratio) {
    super();
    this.dnt = dnt;
    this.aspect_ratio = aspect_ratio;
  }
}
class SpotifyConfig extends CustomType {
  constructor(width2, height2, track_height) {
    super();
    this.width = width2;
    this.height = height2;
    this.track_height = track_height;
  }
}
class BlueskyConfig extends CustomType {
  constructor(resolve_handle) {
    super();
    this.resolve_handle = resolve_handle;
  }
}
class TwitchConfig extends CustomType {
  constructor(parent, aspect_ratio) {
    super();
    this.parent = parent;
    this.aspect_ratio = aspect_ratio;
  }
}
class OpenStreetMapConfig extends CustomType {
  constructor(aspect_ratio) {
    super();
    this.aspect_ratio = aspect_ratio;
  }
}
class TedConfig extends CustomType {
  constructor(aspect_ratio) {
    super();
    this.aspect_ratio = aspect_ratio;
  }
}
class SoundCloudConfig extends CustomType {
  constructor(width2, height2) {
    super();
    this.width = width2;
    this.height = height2;
  }
}
class MastodonConfig extends CustomType {
  constructor(servers, width2) {
    super();
    this.servers = servers;
    this.width = width2;
  }
}
class PixelfedConfig extends CustomType {
  constructor(servers, layout, width2) {
    super();
    this.servers = servers;
    this.layout = layout;
    this.width = width2;
  }
}
class AppleMusicConfig extends CustomType {
  constructor(width2, height2, song_height) {
    super();
    this.width = width2;
    this.height = height2;
    this.song_height = song_height;
  }
}
function bluesky_config() {
  return new BlueskyConfig(new None);
}
function youtube_config() {
  return new YoutubeConfig(true, new None);
}
function vimeo_config() {
  return new VimeoConfig(true, new None);
}
function spotify_config() {
  return new SpotifyConfig(new None, new None, new None);
}
function twitch_config(parent) {
  return new TwitchConfig(parent, new None);
}
function openstreetmap_config() {
  return new OpenStreetMapConfig(new None);
}
function ted_config() {
  return new TedConfig(new None);
}
function soundcloud_config() {
  return new SoundCloudConfig(new None, new None);
}
function mastodon_config(servers) {
  return new MastodonConfig(servers, new None);
}
function pixelfed_config(servers, layout) {
  return new PixelfedConfig(servers, layout, new None);
}
function apple_music_config() {
  return new AppleMusicConfig(new None, new None, new None);
}
function default_config2() {
  return new Config3(new Some(youtube_config()), new Some(vimeo_config()), new Some(spotify_config()), new Some(undefined), new Some(undefined), new Some(bluesky_config()), new Some(undefined), new None, new Some(openstreetmap_config()), new Some(ted_config()), new Some(soundcloud_config()), new None, new None, new Some(apple_music_config()));
}

// build/dev/javascript/inlay/inlay/bluesky.mjs
function detect_bluesky(url) {
  let $ = path_segments(url.path);
  if ($ instanceof Empty) {
    return new None;
  } else {
    let $1 = $.tail;
    if ($1 instanceof Empty) {
      return new None;
    } else {
      let $2 = $1.tail;
      if ($2 instanceof Empty) {
        return new None;
      } else {
        let $3 = $2.tail;
        if ($3 instanceof Empty) {
          return new None;
        } else {
          let $4 = $3.tail;
          if ($4 instanceof Empty) {
            let $5 = $.head;
            if ($5 === "profile") {
              let $6 = $2.head;
              if ($6 === "post") {
                let handle2 = $1.head;
                let rkey = $3.head;
                return new Some(new BlueskyPost(handle2, rkey));
              } else {
                return new None;
              }
            } else {
              return new None;
            }
          } else {
            return new None;
          }
        }
      }
    }
  }
}
function detect(url) {
  let $ = url.host;
  if ($ instanceof Some) {
    let $1 = $[0];
    if ($1 === "bsky.app") {
      return detect_bluesky(url);
    } else {
      return new None;
    }
  } else {
    return new None;
  }
}
function post_url(handle2, rkey) {
  return "https://bsky.app/profile/" + handle2 + "/post/" + rkey;
}
function fallback_view(handle2, rkey) {
  let post_url$1 = post_url(handle2, rkey);
  return div(toList([]), toList([
    blockquote(toList([class$("bluesky-embed")]), toList([
      a(toList([href(post_url$1)]), toList([text2(post_url$1)]))
    ]))
  ]));
}
function resolved_view(handle2, did, rkey) {
  let post_url$1 = post_url(handle2, rkey);
  let at_uri = "at://" + did + "/app.bsky.feed.post/" + rkey;
  return div(toList([]), toList([
    blockquote(toList([
      class$("bluesky-embed"),
      attribute2("data-bluesky-uri", at_uri)
    ]), toList([
      a(toList([href(post_url$1)]), toList([text2(post_url$1)]))
    ])),
    script(toList([
      src("https://embed.bsky.app/static/embed.js"),
      attribute2("async", "true"),
      attribute2("charset", "utf-8")
    ]), "")
  ]));
}
function resolve_handle(handle2, config) {
  let $ = starts_with(handle2, "did:");
  if ($) {
    return new Ok(handle2);
  } else {
    let $1 = config.bluesky;
    if ($1 instanceof Some) {
      let $2 = $1[0].resolve_handle;
      if ($2 instanceof Some) {
        let resolver = $2[0];
        return resolver(handle2);
      } else {
        return new Error(undefined);
      }
    } else {
      return new Error(undefined);
    }
  }
}
function render(embed, config) {
  if (embed instanceof BlueskyPost) {
    let handle2 = embed.handle;
    let rkey = embed.rkey;
    let $ = resolve_handle(handle2, config);
    if ($ instanceof Ok) {
      let did = $[0];
      return new Ok(resolved_view(handle2, did, rkey));
    } else {
      return new Ok(fallback_view(handle2, rkey));
    }
  } else {
    return new Error(undefined);
  }
}
function needs_resolution(handle2) {
  return !starts_with(handle2, "did:");
}
function did_decoder() {
  return field("did", string2, (did) => {
    return success(did);
  });
}
function resolve_effect(handle2, to_msg) {
  let url = "https://bsky.social/xrpc/com.atproto.identity.resolveHandle?handle=" + handle2;
  return get3(url, expect_json(did_decoder(), to_msg));
}

// build/dev/javascript/inlay/inlay/apple_music.mjs
function find_track_id(url) {
  let $ = url.query;
  if ($ instanceof Some) {
    let q = $[0];
    let $1 = parse_query(q);
    if ($1 instanceof Ok) {
      let params = $1[0];
      let $2 = find(params, (pair) => {
        return pair[0] === "i";
      });
      if ($2 instanceof Ok) {
        let value = $2[0][1];
        return new Some(value);
      } else {
        return new None;
      }
    } else {
      return new None;
    }
  } else {
    return $;
  }
}
function detect_apple_music(url) {
  let $ = path_segments(url.path);
  if ($ instanceof Empty) {
    return new None;
  } else {
    let $1 = $.tail;
    if ($1 instanceof Empty) {
      return new None;
    } else {
      let $2 = $1.tail;
      if ($2 instanceof Empty) {
        return new None;
      } else {
        let $3 = $2.tail;
        if ($3 instanceof Empty) {
          return new None;
        } else {
          let $4 = $3.tail;
          if ($4 instanceof Empty) {
            let $5 = $1.head;
            if ($5 === "album") {
              let country = $.head;
              let slug = $2.head;
              let id = $3.head;
              let $6 = find_track_id(url);
              if ($6 instanceof Some) {
                let track_id = $6[0];
                return new Some(new AppleMusicMedia(new AppleMusicSong(track_id), country, slug, id));
              } else {
                return new Some(new AppleMusicMedia(new AppleMusicAlbum, country, slug, id));
              }
            } else if ($5 === "artist") {
              let country = $.head;
              let slug = $2.head;
              let id = $3.head;
              return new Some(new AppleMusicMedia(new AppleMusicArtist, country, slug, id));
            } else if ($5 === "playlist") {
              let country = $.head;
              let slug = $2.head;
              let id = $3.head;
              return new Some(new AppleMusicMedia(new AppleMusicPlaylist, country, slug, id));
            } else if ($5 === "music-video") {
              let country = $.head;
              let slug = $2.head;
              let id = $3.head;
              return new Some(new AppleMusicMedia(new AppleMusicMusicVideo, country, slug, id));
            } else {
              return new None;
            }
          } else {
            return new None;
          }
        }
      }
    }
  }
}
function detect2(url) {
  let $ = url.host;
  if ($ instanceof Some) {
    let $1 = $[0];
    if ($1 === "music.apple.com") {
      return detect_apple_music(url);
    } else {
      return new None;
    }
  } else {
    return new None;
  }
}
function media_type_to_path(media_type) {
  if (media_type instanceof AppleMusicAlbum) {
    return "album";
  } else if (media_type instanceof AppleMusicArtist) {
    return "artist";
  } else if (media_type instanceof AppleMusicPlaylist) {
    return "playlist";
  } else if (media_type instanceof AppleMusicSong) {
    return "album";
  } else {
    return "music-video";
  }
}
function render2(embed, config) {
  if (embed instanceof AppleMusicMedia) {
    let media_type = embed.media_type;
    let country = embed.country;
    let slug = embed.slug;
    let id = embed.id;
    let type_path = media_type_to_path(media_type);
    let base = "https://embed.music.apple.com/" + country + "/" + type_path + "/" + slug + "/" + id;
    let _block;
    if (media_type instanceof AppleMusicAlbum) {
      _block = base;
    } else if (media_type instanceof AppleMusicArtist) {
      _block = base;
    } else if (media_type instanceof AppleMusicPlaylist) {
      _block = base;
    } else if (media_type instanceof AppleMusicSong) {
      let track_id = media_type.track_id;
      _block = base + "?i=" + track_id;
    } else {
      _block = base;
    }
    let src2 = _block;
    let _block$1;
    let $ = config.apple_music;
    if ($ instanceof Some) {
      let $1 = $[0].song_height;
      if ($1 instanceof Some) {
        if (media_type instanceof AppleMusicAlbum) {
          let $2 = $[0].height;
          if ($2 instanceof Some) {
            let h = $2[0];
            _block$1 = h;
          } else {
            _block$1 = 450;
          }
        } else if (media_type instanceof AppleMusicArtist) {
          let $2 = $[0].height;
          if ($2 instanceof Some) {
            let h = $2[0];
            _block$1 = h;
          } else {
            _block$1 = 450;
          }
        } else if (media_type instanceof AppleMusicPlaylist) {
          let $2 = $[0].height;
          if ($2 instanceof Some) {
            let h = $2[0];
            _block$1 = h;
          } else {
            _block$1 = 450;
          }
        } else if (media_type instanceof AppleMusicSong) {
          let h = $1[0];
          _block$1 = h;
        } else {
          let $2 = $[0].height;
          if ($2 instanceof Some) {
            let h = $2[0];
            _block$1 = h;
          } else {
            _block$1 = 450;
          }
        }
      } else if (media_type instanceof AppleMusicAlbum) {
        let $2 = $[0].height;
        if ($2 instanceof Some) {
          let h = $2[0];
          _block$1 = h;
        } else {
          _block$1 = 450;
        }
      } else if (media_type instanceof AppleMusicArtist) {
        let $2 = $[0].height;
        if ($2 instanceof Some) {
          let h = $2[0];
          _block$1 = h;
        } else {
          _block$1 = 450;
        }
      } else if (media_type instanceof AppleMusicPlaylist) {
        let $2 = $[0].height;
        if ($2 instanceof Some) {
          let h = $2[0];
          _block$1 = h;
        } else {
          _block$1 = 450;
        }
      } else if (media_type instanceof AppleMusicSong) {
        _block$1 = 175;
      } else {
        let $2 = $[0].height;
        if ($2 instanceof Some) {
          let h = $2[0];
          _block$1 = h;
        } else {
          _block$1 = 450;
        }
      }
    } else if (media_type instanceof AppleMusicSong) {
      _block$1 = 175;
    } else {
      _block$1 = 450;
    }
    let height2 = _block$1;
    return new Ok(iframe(toList([
      src(src2),
      height(height2),
      attribute2("allow", "autoplay *; encrypted-media *; fullscreen *; clipboard-write"),
      attribute2("sandbox", "allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"),
      styles(toList([
        ["width", "100%"],
        ["max-width", "660px"],
        ["overflow", "hidden"],
        ["border-radius", "10px"],
        ["border", "0"]
      ]))
    ])));
  } else {
    return new Error(undefined);
  }
}

// build/dev/javascript/inlay/inlay/inline.mjs
var resize_class = "inlay-embed-frame";
function frame(src2, title, default_height) {
  return iframe(toList([
    attribute2("title", title),
    src(src2),
    class$(resize_class),
    styles(toList([
      ["width", "100%"],
      ["border", "0"],
      ["height", to_string(default_height) + "px"]
    ])),
    attribute2("scrolling", "no"),
    attribute2("allowfullscreen", "true"),
    attribute2("loading", "lazy"),
    attribute2("sandbox", "allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-presentation")
  ]));
}
function bluesky_iframe(did, rkey) {
  let src2 = "https://embed.bsky.app/embed/" + did + "/app.bsky.feed.post/" + rkey;
  return frame(src2, "Bluesky post", 600);
}
function tweet_iframe(id) {
  let src2 = "https://platform.twitter.com/embed/Tweet.html?id=" + id;
  return frame(src2, "Tweet", 550);
}
function instagram_iframe(post_type, id) {
  let _block;
  if (post_type instanceof Post2) {
    _block = "p";
  } else if (post_type instanceof Reel) {
    _block = "reel";
  } else {
    _block = "tv";
  }
  let type_segment = _block;
  let src2 = "https://www.instagram.com/" + type_segment + "/" + id + "/embed/";
  return frame(src2, "Instagram post", 700);
}
function tiktok_iframe(id) {
  let src2 = "https://www.tiktok.com/embed/v2/" + id;
  return frame(src2, "TikTok video", 750);
}
function mastodon_iframe(server, user, id) {
  let src2 = "https://" + server + "/@" + user + "/" + id + "/embed";
  return frame(src2, "Mastodon post", 400);
}
function pixelfed_iframe(server, user, id) {
  let src2 = "https://" + server + "/p/" + user + "/" + id + "/embed";
  return frame(src2, "Pixelfed post", 600);
}

// build/dev/javascript/inlay/inlay/instagram.mjs
function detect_instagram(url) {
  let $ = path_segments(url.path);
  if ($ instanceof Empty) {
    return new None;
  } else {
    let $1 = $.tail;
    if ($1 instanceof Empty) {
      return new None;
    } else {
      let $2 = $1.tail;
      if ($2 instanceof Empty) {
        let $3 = $.head;
        if ($3 === "p") {
          let id = $1.head;
          return new Some(new InstagramPost(new Post2, id));
        } else if ($3 === "reel") {
          let id = $1.head;
          return new Some(new InstagramPost(new Reel, id));
        } else if ($3 === "tv") {
          let id = $1.head;
          return new Some(new InstagramPost(new TV, id));
        } else {
          return new None;
        }
      } else {
        let $3 = $2.tail;
        if ($3 instanceof Empty) {
          let $4 = $.head;
          if ($4 === "p") {
            let $5 = $2.head;
            if ($5 === "") {
              let id = $1.head;
              return new Some(new InstagramPost(new Post2, id));
            } else {
              return new None;
            }
          } else if ($4 === "reel") {
            let $5 = $2.head;
            if ($5 === "") {
              let id = $1.head;
              return new Some(new InstagramPost(new Reel, id));
            } else {
              return new None;
            }
          } else if ($4 === "tv") {
            let $5 = $2.head;
            if ($5 === "") {
              let id = $1.head;
              return new Some(new InstagramPost(new TV, id));
            } else {
              return new None;
            }
          } else {
            return new None;
          }
        } else {
          return new None;
        }
      }
    }
  }
}
function detect3(url) {
  let $ = url.host;
  if ($ instanceof Some) {
    let $1 = $[0];
    if ($1 === "instagram.com") {
      return detect_instagram(url);
    } else if ($1 === "www.instagram.com") {
      return detect_instagram(url);
    } else {
      return new None;
    }
  } else {
    return new None;
  }
}
function render3(embed, _) {
  if (embed instanceof InstagramPost) {
    let post_type = embed.post_type;
    let id = embed.id;
    let _block;
    if (post_type instanceof Post2) {
      _block = "p";
    } else if (post_type instanceof Reel) {
      _block = "reel";
    } else {
      _block = "tv";
    }
    let type_segment = _block;
    let permalink = "https://www.instagram.com/" + type_segment + "/" + id + "/";
    return new Ok(div(toList([]), toList([
      blockquote(toList([
        class$("instagram-media"),
        attribute2("data-instgrm-permalink", permalink)
      ]), toList([
        a(toList([href(permalink)]), toList([text2(permalink)]))
      ])),
      script(toList([
        src("https://www.instagram.com/embed.js"),
        attribute2("async", "true")
      ]), "")
    ])));
  } else {
    return new Error(undefined);
  }
}

// build/dev/javascript/inlay/inlay/mastodon.mjs
function detect_mastodon(server, url) {
  let $ = path_segments(url.path);
  if ($ instanceof Empty) {
    return new None;
  } else {
    let $1 = $.tail;
    if ($1 instanceof Empty) {
      return new None;
    } else {
      let $2 = $1.tail;
      if ($2 instanceof Empty) {
        let user_with_at = $.head;
        let id = $1.head;
        let $3 = starts_with(user_with_at, "@");
        if ($3) {
          let user = drop_start(user_with_at, 1);
          return new Some(new MastodonPost(server, user, id));
        } else {
          return new None;
        }
      } else {
        return new None;
      }
    }
  }
}
function detect4(url, config) {
  let $ = url.host;
  if ($ instanceof Some) {
    let host = $[0];
    let $1 = contains(config.servers, host);
    if ($1) {
      return detect_mastodon(host, url);
    } else {
      return new None;
    }
  } else {
    return $;
  }
}
function render4(embed, config) {
  if (embed instanceof MastodonPost) {
    let server = embed.server;
    let user = embed.user;
    let id = embed.id;
    let _block;
    let $ = config.mastodon;
    if ($ instanceof Some) {
      let w = $[0].width;
      _block = unwrap(w, 400);
    } else {
      _block = 400;
    }
    let width2 = _block;
    let src2 = "https://" + server + "/@" + user + "/" + id + "/embed";
    return new Ok(div(toList([]), toList([
      iframe(toList([
        src(src2),
        class$("mastodon-embed"),
        styles(toList([["max-width", "100%"], ["border", "0"]])),
        width(width2),
        attribute2("allowfullscreen", "true"),
        attribute2("loading", "lazy"),
        attribute2("sandbox", "allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox")
      ])),
      script(toList([
        src("https://" + server + "/embed.js"),
        attribute2("async", "true"),
        attribute2("defer", "true")
      ]), "")
    ])));
  } else {
    return new Error(undefined);
  }
}

// build/dev/javascript/inlay/inlay/iframe.mjs
function responsive(src2, aspect_ratio, attrs) {
  return div(toList([
    styles(toList([
      ["position", "relative"],
      ["padding-bottom", aspect_ratio],
      ["height", "0"],
      ["overflow", "hidden"]
    ]))
  ]), toList([
    iframe(prepend(src(src2), prepend(styles(toList([
      ["position", "absolute"],
      ["top", "0"],
      ["left", "0"],
      ["width", "100%"],
      ["height", "100%"]
    ])), prepend(attribute2("frameborder", "0"), attrs))))
  ]));
}

// build/dev/javascript/inlay/inlay_ffi.mjs
function cos(radians) {
  return Math.cos(radians);
}
function pow(base, exponent) {
  return Math.pow(base, exponent);
}

// build/dev/javascript/inlay/inlay/openstreetmap.mjs
class BoundingBox extends CustomType {
  constructor(min_lat, min_long, max_lat, max_long) {
    super();
    this.min_lat = min_lat;
    this.min_long = min_long;
    this.max_lat = max_lat;
    this.max_long = max_long;
  }
}
function parse_map_coords(coords) {
  let $ = split2(coords, "/");
  if ($ instanceof Empty) {
    return new None;
  } else {
    let $1 = $.tail;
    if ($1 instanceof Empty) {
      return new None;
    } else {
      let $2 = $1.tail;
      if ($2 instanceof Empty) {
        return new None;
      } else {
        let $3 = $2.tail;
        if ($3 instanceof Empty) {
          let zoom_str = $.head;
          let lat_str = $1.head;
          let long_str = $2.head;
          let $4 = parse_int(zoom_str);
          let $5 = parse_float(lat_str);
          let $6 = parse_float(long_str);
          if ($4 instanceof Ok && $5 instanceof Ok && $6 instanceof Ok) {
            let zoom = $4[0];
            let lat = $5[0];
            let long = $6[0];
            return new Some(new MapLocation(zoom, lat, long));
          } else {
            return new None;
          }
        } else {
          return new None;
        }
      }
    }
  }
}
function parse_map_fragment(fragment3) {
  let $ = split2(fragment3, "=");
  if ($ instanceof Empty) {
    return new None;
  } else {
    let $1 = $.tail;
    if ($1 instanceof Empty) {
      return new None;
    } else {
      let $2 = $1.tail;
      if ($2 instanceof Empty) {
        let $3 = $.head;
        if ($3 === "map") {
          let rest = $1.head;
          return parse_map_coords(rest);
        } else {
          return new None;
        }
      } else {
        return new None;
      }
    }
  }
}
function detect_osm(url) {
  let $ = url.fragment;
  if ($ instanceof Some) {
    let fragment3 = $[0];
    return parse_map_fragment(fragment3);
  } else {
    return $;
  }
}
function detect5(url) {
  let $ = url.host;
  if ($ instanceof Some) {
    let $1 = $[0];
    if ($1 === "openstreetmap.org") {
      return detect_osm(url);
    } else if ($1 === "www.openstreetmap.org") {
      return detect_osm(url);
    } else {
      return new None;
    }
  } else {
    return new None;
  }
}
function cos_deg(degrees) {
  let radians = degrees * 3.141592653589793 / 180;
  return cos(radians);
}
function bounding_box(lat, long, zoom) {
  let offset = divideFloat(360, pow(2, identity(zoom)));
  let lon_offset = divideFloat(offset, cos_deg(lat));
  return new BoundingBox(lat - offset, long - lon_offset, lat + offset, long + lon_offset);
}
function render5(embed, config) {
  if (embed instanceof MapLocation) {
    let zoom = embed.zoom;
    let lat = embed.lat;
    let long = embed.long;
    let bbox = bounding_box(lat, long, zoom);
    let src2 = "https://www.openstreetmap.org/export/embed.html?bbox=" + float_to_string(bbox.min_long) + "%2C" + float_to_string(bbox.min_lat) + "%2C" + float_to_string(bbox.max_long) + "%2C" + float_to_string(bbox.max_lat) + "&layer=mapnik&marker=" + float_to_string(lat) + "%2C" + float_to_string(long);
    let _block;
    let $ = config.openstreetmap;
    if ($ instanceof Some) {
      let $1 = $[0].aspect_ratio;
      if ($1 instanceof Some) {
        let r = $1[0];
        _block = r;
      } else {
        _block = "75%";
      }
    } else {
      _block = "75%";
    }
    let aspect_ratio = _block;
    return new Ok(responsive(src2, aspect_ratio, toList([])));
  } else {
    return new Error(undefined);
  }
}

// build/dev/javascript/inlay/inlay/pixelfed.mjs
function detect_pixelfed(server, url) {
  let $ = path_segments(url.path);
  if ($ instanceof Empty) {
    return new None;
  } else {
    let $1 = $.tail;
    if ($1 instanceof Empty) {
      return new None;
    } else {
      let $2 = $1.tail;
      if ($2 instanceof Empty) {
        return new None;
      } else {
        let $3 = $2.tail;
        if ($3 instanceof Empty) {
          let $4 = $.head;
          if ($4 === "p") {
            let user = $1.head;
            let id = $2.head;
            return new Some(new PixelfedPost(server, user, id));
          } else {
            return new None;
          }
        } else {
          return new None;
        }
      }
    }
  }
}
function detect6(url, config) {
  let $ = url.host;
  if ($ instanceof Some) {
    let host = $[0];
    let $1 = contains(config.servers, host);
    if ($1) {
      return detect_pixelfed(host, url);
    } else {
      return new None;
    }
  } else {
    return $;
  }
}
function layout_to_string(layout) {
  if (layout instanceof Full) {
    return "full";
  } else {
    return "compact";
  }
}
function bool_to_string(value) {
  if (value) {
    return "true";
  } else {
    return "false";
  }
}
function render6(embed, config) {
  if (embed instanceof PixelfedPost) {
    let server = embed.server;
    let user = embed.user;
    let id = embed.id;
    let _block;
    let $1 = config.pixelfed;
    if ($1 instanceof Some) {
      let $2 = $1[0].layout;
      if ($2 instanceof Full) {
        let w = $1[0].width;
        let c = $2.caption;
        let l = $2.likes;
        _block = [c, l, new Full(c, l), unwrap(w, 400)];
      } else {
        let w = $1[0].width;
        _block = [false, false, new Compact, unwrap(w, 400)];
      }
    } else {
      _block = [true, true, new Full(true, true), 400];
    }
    let $ = _block;
    let caption = $[0];
    let likes = $[1];
    let layout = $[2];
    let width2 = $[3];
    let caption_str = bool_to_string(caption);
    let likes_str = bool_to_string(likes);
    let layout_str = layout_to_string(layout);
    let src2 = "https://" + server + "/p/" + user + "/" + id + "/embed?caption=" + caption_str + "&likes=" + likes_str + "&layout=" + layout_str;
    return new Ok(div(toList([]), toList([
      iframe(toList([
        attribute2("title", "Pixelfed Post Embed"),
        src(src2),
        class$("pixelfed__embed"),
        styles(toList([["max-width", "100%"], ["border", "0"]])),
        width(width2),
        attribute2("allowfullscreen", "allowfullscreen")
      ])),
      script(toList([
        src("https://" + server + "/embed.js"),
        attribute2("async", "true"),
        attribute2("defer", "true")
      ]), "")
    ])));
  } else {
    return new Error(undefined);
  }
}

// build/dev/javascript/inlay/inlay/soundcloud.mjs
function detect_soundcloud(url) {
  let $ = path_segments(url.path);
  if ($ instanceof Empty) {
    return new None;
  } else {
    let $1 = $.tail;
    if ($1 instanceof Empty) {
      return new None;
    } else {
      let $2 = $1.tail;
      if ($2 instanceof Empty) {
        return new Some(new SoundCloudTrack(url.path));
      } else {
        let $3 = $2.tail;
        if ($3 instanceof Empty) {
          let $4 = $1.head;
          if ($4 === "sets") {
            return new Some(new SoundCloudTrack(url.path));
          } else {
            return new None;
          }
        } else {
          return new None;
        }
      }
    }
  }
}
function detect7(url) {
  let $ = url.host;
  if ($ instanceof Some) {
    let $1 = $[0];
    if ($1 === "soundcloud.com") {
      return detect_soundcloud(url);
    } else if ($1 === "www.soundcloud.com") {
      return detect_soundcloud(url);
    } else {
      return new None;
    }
  } else {
    return new None;
  }
}
function render7(embed, config) {
  if (embed instanceof SoundCloudTrack) {
    let path = embed.path;
    let _block;
    let $1 = config.soundcloud;
    if ($1 instanceof Some) {
      let w = $1[0].width;
      let h = $1[0].height;
      _block = [unwrap(w, 300), unwrap(h, 166)];
    } else {
      _block = [300, 166];
    }
    let $ = _block;
    let width2 = $[0];
    let height2 = $[1];
    let encoded_url = percent_encode("https://soundcloud.com" + path);
    let src2 = "https://w.soundcloud.com/player/?url=" + encoded_url;
    return new Ok(div(toList([]), toList([
      iframe(toList([
        src(src2),
        width(width2),
        height(height2),
        attribute2("frameborder", "0"),
        attribute2("allow", "autoplay"),
        attribute2("loading", "lazy")
      ]))
    ])));
  } else {
    return new Error(undefined);
  }
}

// build/dev/javascript/inlay/inlay/spotify.mjs
function validate_id(id, media_type) {
  let $ = string_length(id) === 22;
  if ($) {
    return new Some(new SpotifyMedia(media_type, id));
  } else {
    return new None;
  }
}
function detect_spotify(url) {
  let $ = path_segments(url.path);
  if ($ instanceof Empty) {
    return new None;
  } else {
    let $1 = $.tail;
    if ($1 instanceof Empty) {
      return new None;
    } else {
      let $2 = $1.tail;
      if ($2 instanceof Empty) {
        let $3 = $.head;
        if ($3 === "track") {
          let id = $1.head;
          return validate_id(id, new SpotifyTrack);
        } else if ($3 === "album") {
          let id = $1.head;
          return validate_id(id, new SpotifyAlbum);
        } else if ($3 === "playlist") {
          let id = $1.head;
          return validate_id(id, new SpotifyPlaylist);
        } else if ($3 === "artist") {
          let id = $1.head;
          return validate_id(id, new SpotifyArtist);
        } else if ($3 === "episode") {
          let id = $1.head;
          return validate_id(id, new SpotifyEpisode);
        } else if ($3 === "show") {
          let id = $1.head;
          return validate_id(id, new SpotifyShow);
        } else {
          return new None;
        }
      } else {
        return new None;
      }
    }
  }
}
function detect8(url) {
  let $ = url.host;
  if ($ instanceof Some) {
    let $1 = $[0];
    if ($1 === "open.spotify.com") {
      return detect_spotify(url);
    } else {
      return new None;
    }
  } else {
    return new None;
  }
}
function media_type_to_string(media_type) {
  if (media_type instanceof SpotifyPlaylist) {
    return "playlist";
  } else if (media_type instanceof SpotifyTrack) {
    return "track";
  } else if (media_type instanceof SpotifyAlbum) {
    return "album";
  } else if (media_type instanceof SpotifyArtist) {
    return "artist";
  } else if (media_type instanceof SpotifyEpisode) {
    return "episode";
  } else {
    return "show";
  }
}
function render8(embed, config) {
  if (embed instanceof SpotifyMedia) {
    let media_type = embed.media_type;
    let id = embed.id;
    let type_str = media_type_to_string(media_type);
    let src2 = "https://open.spotify.com/embed/" + type_str + "/" + id;
    let _block;
    let $1 = config.spotify;
    if ($1 instanceof Some) {
      let w = $1[0].width;
      let h = $1[0].height;
      let th = $1[0].track_height;
      _block = [
        unwrap(w, 300),
        unwrap(th, 152),
        unwrap(h, 352)
      ];
    } else {
      _block = [300, 152, 352];
    }
    let $ = _block;
    let width2 = $[0];
    let track_height = $[1];
    let other_height = $[2];
    let _block$1;
    if (media_type instanceof SpotifyPlaylist) {
      _block$1 = other_height;
    } else if (media_type instanceof SpotifyTrack) {
      _block$1 = track_height;
    } else if (media_type instanceof SpotifyAlbum) {
      _block$1 = other_height;
    } else if (media_type instanceof SpotifyArtist) {
      _block$1 = other_height;
    } else if (media_type instanceof SpotifyEpisode) {
      _block$1 = other_height;
    } else {
      _block$1 = other_height;
    }
    let height2 = _block$1;
    return new Ok(div(toList([
      styles(toList([["border-radius", "12px"], ["overflow", "hidden"]]))
    ]), toList([
      iframe(toList([
        src(src2),
        width(width2),
        height(height2),
        attribute2("frameborder", "0"),
        attribute2("allow", "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"),
        attribute2("loading", "lazy")
      ]))
    ])));
  } else {
    return new Error(undefined);
  }
}

// build/dev/javascript/inlay/inlay/ted.mjs
function detect_talk(url) {
  let $ = path_segments(url.path);
  if ($ instanceof Empty) {
    return new None;
  } else {
    let $1 = $.tail;
    if ($1 instanceof Empty) {
      return new None;
    } else {
      let $2 = $1.tail;
      if ($2 instanceof Empty) {
        let $3 = $.head;
        if ($3 === "talks") {
          let slug = $1.head;
          return new Some(new TedTalk(slug));
        } else {
          return new None;
        }
      } else {
        return new None;
      }
    }
  }
}
function detect9(url) {
  let $ = url.host;
  if ($ instanceof Some) {
    let $1 = $[0];
    if ($1 === "www.ted.com") {
      return detect_talk(url);
    } else if ($1 === "ted.com") {
      return detect_talk(url);
    } else {
      return new None;
    }
  } else {
    return new None;
  }
}
function render9(embed, config) {
  if (embed instanceof TedTalk) {
    let slug = embed.slug;
    let src2 = "https://embed.ted.com/talks/" + slug;
    let _block;
    let $ = config.ted;
    if ($ instanceof Some) {
      let $1 = $[0].aspect_ratio;
      if ($1 instanceof Some) {
        let r = $1[0];
        _block = r;
      } else {
        _block = "56.25%";
      }
    } else {
      _block = "56.25%";
    }
    let aspect_ratio = _block;
    return new Ok(responsive(src2, aspect_ratio, toList([
      attribute2("allowfullscreen", "true"),
      attribute2("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture")
    ])));
  } else {
    return new Error(undefined);
  }
}

// build/dev/javascript/inlay/inlay/tiktok.mjs
function detect_tiktok(url) {
  let $ = path_segments(url.path);
  if ($ instanceof Empty) {
    return new None;
  } else {
    let $1 = $.tail;
    if ($1 instanceof Empty) {
      return new None;
    } else {
      let $2 = $1.tail;
      if ($2 instanceof Empty) {
        return new None;
      } else {
        let $3 = $2.tail;
        if ($3 instanceof Empty) {
          let $4 = $1.head;
          if ($4 === "video") {
            let username = $.head;
            let id = $2.head;
            return new Some(new TikTokVideo(username, id));
          } else {
            return new None;
          }
        } else {
          return new None;
        }
      }
    }
  }
}
function detect10(url) {
  let $ = url.host;
  if ($ instanceof Some) {
    let $1 = $[0];
    if ($1 === "tiktok.com") {
      return detect_tiktok(url);
    } else if ($1 === "www.tiktok.com") {
      return detect_tiktok(url);
    } else {
      return new None;
    }
  } else {
    return new None;
  }
}
function render10(embed, _) {
  if (embed instanceof TikTokVideo) {
    let username = embed.username;
    let id = embed.id;
    let cite_url = "https://www.tiktok.com/" + username + "/video/" + id;
    return new Ok(div(toList([]), toList([
      blockquote(toList([
        class$("tiktok-embed"),
        attribute2("cite", cite_url),
        attribute2("data-video-id", id)
      ]), toList([
        a(toList([href(cite_url)]), toList([text2(cite_url)]))
      ])),
      script(toList([
        src("https://www.tiktok.com/embed.js"),
        attribute2("async", "true")
      ]), "")
    ])));
  } else {
    return new Error(undefined);
  }
}

// build/dev/javascript/inlay/inlay/twitch.mjs
function detect_twitch(url) {
  let $ = path_segments(url.path);
  if ($ instanceof Empty) {
    return new None;
  } else {
    let $1 = $.tail;
    if ($1 instanceof Empty) {
      let name = $.head;
      return new Some(new TwitchChannel(name));
    } else {
      let $2 = $1.tail;
      if ($2 instanceof Empty) {
        let $3 = $.head;
        if ($3 === "videos") {
          let id = $1.head;
          return new Some(new TwitchVideo(id));
        } else {
          return new None;
        }
      } else {
        return new None;
      }
    }
  }
}
function detect11(url) {
  let $ = url.host;
  if ($ instanceof Some) {
    let $1 = $[0];
    if ($1 === "twitch.tv") {
      return detect_twitch(url);
    } else if ($1 === "www.twitch.tv") {
      return detect_twitch(url);
    } else {
      return new None;
    }
  } else {
    return new None;
  }
}
function render11(embed, config) {
  let _block;
  let $ = config.twitch;
  if ($ instanceof Some) {
    let p2 = $[0].parent;
    _block = p2;
  } else {
    _block = "localhost";
  }
  let parent = _block;
  let _block$1;
  let $1 = config.twitch;
  if ($1 instanceof Some) {
    let $2 = $1[0].aspect_ratio;
    if ($2 instanceof Some) {
      let r = $2[0];
      _block$1 = r;
    } else {
      _block$1 = "56.25%";
    }
  } else {
    _block$1 = "56.25%";
  }
  let aspect_ratio = _block$1;
  if (embed instanceof TwitchChannel) {
    let name = embed.name;
    let src2 = "https://player.twitch.tv/?channel=" + name + "&parent=" + parent;
    return new Ok(responsive(src2, aspect_ratio, toList([attribute2("allowfullscreen", "true")])));
  } else if (embed instanceof TwitchVideo) {
    let id = embed.id;
    let src2 = "https://player.twitch.tv/?video=" + id + "&parent=" + parent;
    return new Ok(responsive(src2, aspect_ratio, toList([attribute2("allowfullscreen", "true")])));
  } else {
    return new Error(undefined);
  }
}

// build/dev/javascript/inlay/inlay/twitter.mjs
function detect_tweet(url) {
  let $ = path_segments(url.path);
  if ($ instanceof Empty) {
    return new None;
  } else {
    let $1 = $.tail;
    if ($1 instanceof Empty) {
      return new None;
    } else {
      let $2 = $1.tail;
      if ($2 instanceof Empty) {
        return new None;
      } else {
        let $3 = $2.tail;
        if ($3 instanceof Empty) {
          let $4 = $1.head;
          if ($4 === "status") {
            let handle2 = $.head;
            let id = $2.head;
            return new Some(new Tweet(handle2, id));
          } else {
            return new None;
          }
        } else {
          return new None;
        }
      }
    }
  }
}
function detect12(url) {
  let $ = url.host;
  if ($ instanceof Some) {
    let $1 = $[0];
    if ($1 === "twitter.com") {
      return detect_tweet(url);
    } else if ($1 === "www.twitter.com") {
      return detect_tweet(url);
    } else if ($1 === "x.com") {
      return detect_tweet(url);
    } else if ($1 === "www.x.com") {
      return detect_tweet(url);
    } else {
      return new None;
    }
  } else {
    return new None;
  }
}
function render12(embed, _) {
  if (embed instanceof Tweet) {
    let handle2 = embed.handle;
    let id = embed.id;
    let tweet_url = "https://twitter.com/" + handle2 + "/status/" + id;
    return new Ok(div(toList([]), toList([
      blockquote(toList([class$("twitter-tweet")]), toList([
        a(toList([href(tweet_url)]), toList([text2(tweet_url)]))
      ])),
      script(toList([
        src("https://platform.twitter.com/widgets.js"),
        attribute2("async", "true"),
        attribute2("charset", "utf-8")
      ]), "")
    ])));
  } else {
    return new Error(undefined);
  }
}

// build/dev/javascript/inlay/inlay/vimeo.mjs
function detect_vimeo(url) {
  let $ = path_segments(url.path);
  if ($ instanceof Empty) {
    return new None;
  } else {
    let $1 = $.tail;
    if ($1 instanceof Empty) {
      let id = $.head;
      return new Some(new VimeoVideo(id, new None));
    } else {
      let $2 = $1.tail;
      if ($2 instanceof Empty) {
        let id = $.head;
        let hash = $1.head;
        return new Some(new VimeoVideo(id, new Some(hash)));
      } else {
        return new None;
      }
    }
  }
}
function detect13(url) {
  let $ = url.host;
  if ($ instanceof Some) {
    let $1 = $[0];
    if ($1 === "vimeo.com") {
      return detect_vimeo(url);
    } else if ($1 === "www.vimeo.com") {
      return detect_vimeo(url);
    } else {
      return new None;
    }
  } else {
    return new None;
  }
}
function render13(embed, config) {
  if (embed instanceof VimeoVideo) {
    let id = embed.id;
    let privacy_hash = embed.privacy_hash;
    let base = "https://player.vimeo.com/video/" + id;
    let _block;
    let $ = config.vimeo;
    if ($ instanceof Some) {
      let $12 = $[0].dnt;
      if ($12) {
        _block = true;
      } else {
        _block = false;
      }
    } else {
      _block = false;
    }
    let dnt = _block;
    let _block$1;
    if (dnt) {
      if (privacy_hash instanceof Some) {
        let h = privacy_hash[0];
        _block$1 = "?dnt=1&h=" + h;
      } else {
        _block$1 = "?dnt=1";
      }
    } else if (privacy_hash instanceof Some) {
      let h = privacy_hash[0];
      _block$1 = "?h=" + h;
    } else {
      _block$1 = "";
    }
    let params = _block$1;
    let src2 = base + params;
    let _block$2;
    let $1 = config.vimeo;
    if ($1 instanceof Some) {
      let $2 = $1[0].aspect_ratio;
      if ($2 instanceof Some) {
        let r = $2[0];
        _block$2 = r;
      } else {
        _block$2 = "56.25%";
      }
    } else {
      _block$2 = "56.25%";
    }
    let aspect_ratio = _block$2;
    return new Ok(responsive(src2, aspect_ratio, toList([
      attribute2("allowfullscreen", "true"),
      attribute2("allow", "autoplay; fullscreen; picture-in-picture")
    ])));
  } else {
    return new Error(undefined);
  }
}

// build/dev/javascript/inlay/inlay/youtube.mjs
function parse_time(value) {
  let _block;
  let $ = ends_with(value, "s");
  if ($) {
    _block = drop_end(value, 1);
  } else {
    _block = value;
  }
  let cleaned = _block;
  let $1 = parse_int(cleaned);
  if ($1 instanceof Ok) {
    let n = $1[0];
    return new Some(n);
  } else {
    return new None;
  }
}
function find_param(params, key) {
  let $ = find(params, (pair) => {
    return pair[0] === key;
  });
  if ($ instanceof Ok) {
    let value = $[0][1];
    return new Some(value);
  } else {
    return new None;
  }
}
function find_start(params) {
  let $ = find_param(params, "t");
  let $1 = find_param(params, "start");
  if ($ instanceof Some) {
    let t = $[0];
    return parse_time(t);
  } else if ($1 instanceof Some) {
    let s = $1[0];
    return parse_time(s);
  } else {
    return $;
  }
}
function parse_query2(url) {
  let $ = url.query;
  if ($ instanceof Some) {
    let q = $[0];
    let $1 = parse_query(q);
    if ($1 instanceof Ok) {
      let params = $1[0];
      return params;
    } else {
      return toList([]);
    }
  } else {
    return toList([]);
  }
}
function detect_short(url) {
  let params = parse_query2(url);
  let $ = path_segments(url.path);
  if ($ instanceof Empty) {
    return new None;
  } else {
    let $1 = $.tail;
    if ($1 instanceof Empty) {
      let id = $.head;
      if (id !== "") {
        return new Some(new YoutubeVideo(id, find_start(params), new None));
      } else {
        return new None;
      }
    } else {
      return new None;
    }
  }
}
function detect_playlist(params) {
  let $ = find_param(params, "list");
  if ($ instanceof Some) {
    let id = $[0];
    return new Some(new YoutubePlaylist(id));
  } else {
    return $;
  }
}
function detect_watch(params) {
  let $ = find_param(params, "v");
  if ($ instanceof Some) {
    let id = $[0];
    return new Some(new YoutubeVideo(id, find_start(params), find_param(params, "list")));
  } else {
    return $;
  }
}
function detect_youtube(url) {
  let segments = path_segments(url.path);
  let query_params = parse_query2(url);
  if (segments instanceof Empty) {
    return new None;
  } else {
    let $ = segments.tail;
    if ($ instanceof Empty) {
      let $1 = segments.head;
      if ($1 === "watch") {
        return detect_watch(query_params);
      } else if ($1 === "playlist") {
        return detect_playlist(query_params);
      } else {
        return new None;
      }
    } else {
      let $1 = $.tail;
      if ($1 instanceof Empty) {
        let $2 = segments.head;
        if ($2 === "embed") {
          let id = $.head;
          return new Some(new YoutubeVideo(id, find_start(query_params), new None));
        } else if ($2 === "shorts") {
          let id = $.head;
          return new Some(new YoutubeVideo(id, new None, new None));
        } else {
          return new None;
        }
      } else {
        return new None;
      }
    }
  }
}
function detect14(url) {
  let $ = url.host;
  if ($ instanceof Some) {
    let $1 = $[0];
    if ($1 === "youtube.com") {
      return detect_youtube(url);
    } else if ($1 === "www.youtube.com") {
      return detect_youtube(url);
    } else if ($1 === "m.youtube.com") {
      return detect_youtube(url);
    } else if ($1 === "youtu.be") {
      return detect_short(url);
    } else if ($1 === "www.youtu.be") {
      return detect_short(url);
    } else {
      return new None;
    }
  } else {
    return new None;
  }
}
function render14(embed, config) {
  let _block;
  let $ = config.youtube;
  if ($ instanceof Some) {
    let $12 = $[0].no_cookie;
    if ($12) {
      _block = "https://www.youtube-nocookie.com";
    } else {
      _block = "https://www.youtube.com";
    }
  } else {
    _block = "https://www.youtube.com";
  }
  let domain = _block;
  let _block$1;
  let $1 = config.youtube;
  if ($1 instanceof Some) {
    let $2 = $1[0].aspect_ratio;
    if ($2 instanceof Some) {
      let r = $2[0];
      _block$1 = r;
    } else {
      _block$1 = "56.25%";
    }
  } else {
    _block$1 = "56.25%";
  }
  let aspect_ratio = _block$1;
  if (embed instanceof YoutubeVideo) {
    let id = embed.id;
    let start_time = embed.start_time;
    let playlist = embed.playlist;
    let base = domain + "/embed/" + id;
    let _block$2;
    if (start_time instanceof Some) {
      if (playlist instanceof Some) {
        let t = start_time[0];
        let p2 = playlist[0];
        _block$2 = "?start=" + to_string(t) + "&list=" + p2;
      } else {
        let t = start_time[0];
        _block$2 = "?start=" + to_string(t);
      }
    } else if (playlist instanceof Some) {
      let p2 = playlist[0];
      _block$2 = "?list=" + p2;
    } else {
      _block$2 = "";
    }
    let params = _block$2;
    let src2 = base + params;
    return new Ok(responsive(src2, aspect_ratio, toList([
      attribute2("allowfullscreen", "true"),
      attribute2("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture")
    ])));
  } else if (embed instanceof YoutubePlaylist) {
    let id = embed.id;
    let src2 = domain + "/embed/videoseries?list=" + id;
    return new Ok(responsive(src2, aspect_ratio, toList([
      attribute2("allowfullscreen", "true"),
      attribute2("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture")
    ])));
  } else {
    return new Error(undefined);
  }
}

// build/dev/javascript/inlay/inlay/detect.mjs
var FILEPATH = "src/inlay/detect.gleam";
function try_one(enabled, url, detector, next) {
  if (enabled instanceof Some) {
    let $ = detector(url);
    if ($ instanceof Some) {
      return $;
    } else {
      return next();
    }
  } else {
    return next();
  }
}
function try_one_with(enabled, url, detector, next) {
  if (enabled instanceof Some) {
    let cfg = enabled[0];
    let $ = detector(url, cfg);
    if ($ instanceof Some) {
      return $;
    } else {
      return next();
    }
  } else {
    return next();
  }
}
function do_detect(url, config) {
  return try_one_with(config.mastodon, url, detect4, () => {
    return try_one_with(config.pixelfed, url, detect6, () => {
      return try_one(config.youtube, url, detect14, () => {
        return try_one(config.ted, url, detect9, () => {
          return try_one(config.vimeo, url, detect13, () => {
            return try_one(config.spotify, url, detect8, () => {
              return try_one(config.bluesky, url, detect, () => {
                return try_one(config.twitch, url, detect11, () => {
                  return try_one(config.soundcloud, url, detect7, () => {
                    return try_one(config.twitter, url, detect12, () => {
                      return try_one(config.tiktok, url, detect10, () => {
                        return try_one(config.instagram, url, detect3, () => {
                          return try_one(config.openstreetmap, url, detect5, () => {
                            return try_one(config.apple_music, url, detect2, () => {
                              return new None;
                            });
                          });
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
}
function detect_with(url, config) {
  let $ = parse2(url);
  if ($ instanceof Ok) {
    let parsed = $[0];
    return do_detect(parsed, config);
  } else {
    return new None;
  }
}
function render_with(embed, config) {
  let _block;
  if (embed instanceof YoutubeVideo) {
    _block = render14(embed, config);
  } else if (embed instanceof YoutubePlaylist) {
    _block = render14(embed, config);
  } else if (embed instanceof VimeoVideo) {
    _block = render13(embed, config);
  } else if (embed instanceof SpotifyMedia) {
    _block = render8(embed, config);
  } else if (embed instanceof Tweet) {
    _block = render12(embed, config);
  } else if (embed instanceof TikTokVideo) {
    _block = render10(embed, config);
  } else if (embed instanceof BlueskyPost) {
    _block = render(embed, config);
  } else if (embed instanceof InstagramPost) {
    _block = render3(embed, config);
  } else if (embed instanceof TwitchChannel) {
    _block = render11(embed, config);
  } else if (embed instanceof TwitchVideo) {
    _block = render11(embed, config);
  } else if (embed instanceof MapLocation) {
    _block = render5(embed, config);
  } else if (embed instanceof TedTalk) {
    _block = render9(embed, config);
  } else if (embed instanceof SoundCloudTrack) {
    _block = render7(embed, config);
  } else if (embed instanceof MastodonPost) {
    _block = render4(embed, config);
  } else if (embed instanceof PixelfedPost) {
    _block = render6(embed, config);
  } else {
    _block = render2(embed, config);
  }
  let $ = _block;
  let el;
  if ($ instanceof Ok) {
    el = $[0];
  } else {
    throw makeError("let_assert", FILEPATH, "inlay/detect", 42, "render_with", "Pattern match failed, no pattern matched the value.", {
      value: $,
      start: 1349,
      end: 2181,
      pattern_start: 1360,
      pattern_end: 1366
    });
  }
  return el;
}
function render_inline_with(embed, config) {
  if (embed instanceof YoutubeVideo) {
    return render_with(embed, config);
  } else if (embed instanceof YoutubePlaylist) {
    return render_with(embed, config);
  } else if (embed instanceof VimeoVideo) {
    return render_with(embed, config);
  } else if (embed instanceof SpotifyMedia) {
    return render_with(embed, config);
  } else if (embed instanceof Tweet) {
    let id = embed.id;
    return tweet_iframe(id);
  } else if (embed instanceof TikTokVideo) {
    let id = embed.id;
    return tiktok_iframe(id);
  } else if (embed instanceof BlueskyPost) {
    return render_with(embed, config);
  } else if (embed instanceof InstagramPost) {
    let post_type = embed.post_type;
    let id = embed.id;
    return instagram_iframe(post_type, id);
  } else if (embed instanceof TwitchChannel) {
    return render_with(embed, config);
  } else if (embed instanceof TwitchVideo) {
    return render_with(embed, config);
  } else if (embed instanceof MapLocation) {
    return render_with(embed, config);
  } else if (embed instanceof TedTalk) {
    return render_with(embed, config);
  } else if (embed instanceof SoundCloudTrack) {
    return render_with(embed, config);
  } else if (embed instanceof MastodonPost) {
    let server = embed.server;
    let user = embed.user;
    let id = embed.id;
    return mastodon_iframe(server, user, id);
  } else if (embed instanceof PixelfedPost) {
    let server = embed.server;
    let user = embed.user;
    let id = embed.id;
    return pixelfed_iframe(server, user, id);
  } else {
    return render_with(embed, config);
  }
}

// build/dev/javascript/inlay/inlay_component_ffi.mjs
var FRAME_SELECTOR = "iframe.inlay-embed-frame";
var installed = new WeakSet;
function install_resize_listener(root2) {
  if (!root2 || installed.has(root2)) {
    return;
  }
  installed.add(root2);
  window.addEventListener("message", (event2) => {
    const height2 = height_from_message(event2.data);
    if (height2 === undefined) {
      return;
    }
    const frame2 = frame_for_source(root2, event2.source);
    if (frame2) {
      frame2.style.height = `${height2}px`;
    }
  });
}
function frame_for_source(root2, source) {
  if (!source) {
    return;
  }
  const frames = root2.querySelectorAll(FRAME_SELECTOR);
  for (const frame2 of frames) {
    if (frame2.contentWindow === source) {
      return frame2;
    }
  }
  return;
}
function height_from_message(data2) {
  const parsed = parse4(data2);
  if (!parsed || typeof parsed !== "object") {
    return;
  }
  if (parsed.type === "MEASURE" && parsed.details) {
    return to_number(parsed.details.height);
  }
  const twitter = parsed["twttr.embed"];
  if (twitter && twitter.method === "twttr.private.resize" && Array.isArray(twitter.params) && twitter.params[0]) {
    return to_number(twitter.params[0].height);
  }
  return to_number(parsed.height);
}
function parse4(data2) {
  if (typeof data2 === "string") {
    if (data2[0] !== "{") {
      return;
    }
    try {
      return JSON.parse(data2);
    } catch (_error) {
      return;
    }
  }
  return data2;
}
function to_number(value) {
  const height2 = Number(value);
  if (Number.isFinite(height2) && height2 > 0) {
    return height2;
  }
  return;
}

// build/dev/javascript/inlay/inlay/component.mjs
class Model extends CustomType {
  constructor(url, no_cookie, parent, aspect_ratio, state) {
    super();
    this.url = url;
    this.no_cookie = no_cookie;
    this.parent = parent;
    this.aspect_ratio = aspect_ratio;
    this.state = state;
  }
}
class Static extends CustomType {
}
class Resolving extends CustomType {
}
class Resolved extends CustomType {
  constructor(did) {
    super();
    this.did = did;
  }
}
class Failed extends CustomType {
}
class UrlChanged extends CustomType {
  constructor(url) {
    super();
    this.url = url;
  }
}
class NoCookieChanged extends CustomType {
  constructor(no_cookie) {
    super();
    this.no_cookie = no_cookie;
  }
}
class ParentChanged extends CustomType {
  constructor(parent) {
    super();
    this.parent = parent;
  }
}
class AspectRatioChanged extends CustomType {
  constructor(aspect_ratio) {
    super();
    this.aspect_ratio = aspect_ratio;
  }
}
class GotDid extends CustomType {
  constructor(result) {
    super();
    this.result = result;
  }
}
var name = "inlay-embed";
function install_resize_listener_effect() {
  return after_paint((_, root2) => {
    return install_resize_listener(root2);
  });
}
function init(_) {
  return [
    new Model(new None, new None, new None, new None, new Static),
    install_resize_listener_effect()
  ];
}
function prefer(override, fallback) {
  if (override instanceof Some) {
    return override;
  } else {
    return fallback;
  }
}
function optional(override, fallback) {
  if (override instanceof Some) {
    let value = override[0];
    return value;
  } else {
    return fallback;
  }
}
function effective_config(config, model) {
  let _block;
  let $ = config.youtube;
  if ($ instanceof Some) {
    let youtube2 = $[0];
    _block = new Some(new YoutubeConfig(optional(model.no_cookie, youtube2.no_cookie), prefer(model.aspect_ratio, youtube2.aspect_ratio)));
  } else {
    _block = $;
  }
  let youtube = _block;
  let _block$1;
  let $1 = model.parent;
  if ($1 instanceof Some) {
    let parent = $1[0];
    _block$1 = new Some(twitch_config(parent));
  } else {
    _block$1 = config.twitch;
  }
  let twitch = _block$1;
  return new Config3(youtube, config.vimeo, config.spotify, config.twitter, config.tiktok, config.bluesky, config.instagram, twitch, config.openstreetmap, config.ted, config.soundcloud, config.mastodon, config.pixelfed, config.apple_music);
}
function update2(config, model, msg) {
  if (msg instanceof UrlChanged) {
    let url = msg.url;
    let model$1 = new Model(new Some(url), model.no_cookie, model.parent, model.aspect_ratio, model.state);
    let $ = detect_with(url, effective_config(config, model$1));
    if ($ instanceof Some) {
      let $1 = $[0];
      if ($1 instanceof BlueskyPost) {
        let handle2 = $1.handle;
        let $2 = needs_resolution(handle2);
        if ($2) {
          return [
            new Model(model$1.url, model$1.no_cookie, model$1.parent, model$1.aspect_ratio, new Resolving),
            resolve_effect(handle2, (var0) => {
              return new GotDid(var0);
            })
          ];
        } else {
          return [
            new Model(model$1.url, model$1.no_cookie, model$1.parent, model$1.aspect_ratio, new Static),
            none()
          ];
        }
      } else {
        return [
          new Model(model$1.url, model$1.no_cookie, model$1.parent, model$1.aspect_ratio, new Static),
          none()
        ];
      }
    } else {
      return [
        new Model(model$1.url, model$1.no_cookie, model$1.parent, model$1.aspect_ratio, new Static),
        none()
      ];
    }
  } else if (msg instanceof NoCookieChanged) {
    let no_cookie = msg.no_cookie;
    return [
      new Model(model.url, new Some(no_cookie), model.parent, model.aspect_ratio, new Static),
      none()
    ];
  } else if (msg instanceof ParentChanged) {
    let parent = msg.parent;
    return [
      new Model(model.url, model.no_cookie, new Some(parent), model.aspect_ratio, new Static),
      none()
    ];
  } else if (msg instanceof AspectRatioChanged) {
    let aspect_ratio = msg.aspect_ratio;
    return [
      new Model(model.url, model.no_cookie, model.parent, new Some(aspect_ratio), new Static),
      none()
    ];
  } else {
    let $ = msg.result;
    if ($ instanceof Ok) {
      let did = $[0];
      return [
        new Model(model.url, model.no_cookie, model.parent, model.aspect_ratio, new Resolved(did)),
        none()
      ];
    } else {
      return [
        new Model(model.url, model.no_cookie, model.parent, model.aspect_ratio, new Failed),
        none()
      ];
    }
  }
}
function link(url) {
  return a(toList([href(url)]), toList([text2(url)]));
}
function bluesky_static_view(handle2, rkey) {
  let $ = needs_resolution(handle2);
  if ($) {
    return fallback_view(handle2, rkey);
  } else {
    return bluesky_iframe(handle2, rkey);
  }
}
function view(config, model) {
  let config$1 = effective_config(config, model);
  let $ = model.url;
  if ($ instanceof Some) {
    let url = $[0];
    let $1 = detect_with(url, config$1);
    if ($1 instanceof Some) {
      let $2 = $1[0];
      if ($2 instanceof BlueskyPost) {
        let handle2 = $2.handle;
        let rkey = $2.rkey;
        let $3 = model.state;
        if ($3 instanceof Static) {
          return bluesky_static_view(handle2, rkey);
        } else if ($3 instanceof Resolving) {
          return fallback_view(handle2, rkey);
        } else if ($3 instanceof Resolved) {
          let did = $3.did;
          return bluesky_iframe(did, rkey);
        } else {
          return fallback_view(handle2, rkey);
        }
      } else {
        let found = $2;
        return render_inline_with(found, config$1);
      }
    } else {
      return link(url);
    }
  } else {
    return none2();
  }
}
function embed_component(config) {
  return component(init, (model, msg) => {
    return update2(config, model, msg);
  }, (model) => {
    return view(config, model);
  }, toList([
    on_attribute_change("url", (value) => {
      return new Ok(new UrlChanged(value));
    }),
    on_attribute_change("no-cookie", (value) => {
      return new Ok(new NoCookieChanged(value !== "false"));
    }),
    on_attribute_change("parent", (value) => {
      return new Ok(new ParentChanged(value));
    }),
    on_attribute_change("aspect-ratio", (value) => {
      return new Ok(new AspectRatioChanged(value));
    }),
    open_shadow_root(true)
  ]));
}
function configure2(config) {
  return make_component(embed_component(config), name);
}
function embed_element(attributes) {
  return element2(name, attributes, toList([]));
}

// build/dev/javascript/inlay/inlay.mjs
function default_config3() {
  return default_config2();
}
function mastodon_config2(servers) {
  return mastodon_config(servers);
}
function pixelfed_config2(servers, layout) {
  return pixelfed_config(servers, layout);
}
function pixelfed_full(caption, likes) {
  return new Full(caption, likes);
}
function mastodon(config, mastodon_config3) {
  return new Config3(config.youtube, config.vimeo, config.spotify, config.twitter, config.tiktok, config.bluesky, config.instagram, config.twitch, config.openstreetmap, config.ted, config.soundcloud, new Some(mastodon_config3), config.pixelfed, config.apple_music);
}
function pixelfed(config, pixelfed_config3) {
  return new Config3(config.youtube, config.vimeo, config.spotify, config.twitter, config.tiktok, config.bluesky, config.instagram, config.twitch, config.openstreetmap, config.ted, config.soundcloud, config.mastodon, new Some(pixelfed_config3), config.apple_music);
}
function configure3(config) {
  return configure2(config);
}
function embed_element2(attributes) {
  return embed_element(attributes);
}
// build/dev/javascript/inlay_components/inlay_components.mjs
var FILEPATH2 = "src/inlay_components.gleam";
function config() {
  let _pipe = default_config3();
  let _pipe$1 = mastodon(_pipe, mastodon_config2(toList(["mastodon.social"])));
  return pixelfed(_pipe$1, pixelfed_config2(toList(["pixelfed.social"]), pixelfed_full(true, true)));
}
function embed(url) {
  return embed_element2(toList([attribute2("url", url)]));
}
function section(title2, content) {
  return details(toList([class$("embed-section")]), toList([summary(toList([]), toList([text2(title2)])), content]));
}
function css() {
  return `
body {
  background: #f4f1ee;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  color: #2c2c2c;
  margin: 0;
  padding: 2rem;
}
.container {
  max-width: 720px;
  margin: 0 auto;
}
h1 {
  font-size: 1.5rem;
  margin-bottom: 0.25rem;
}
p.subtitle {
  color: #666;
  margin-top: 0;
  margin-bottom: 2rem;
}
.embed-section {
  background: #fff;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}
.embed-section summary {
  font-size: 1.1rem;
  margin-bottom: 1rem;
  color: #555;
  cursor: pointer;
}
.embed-section iframe {
  border-radius: 8px;
}
`;
}
function view2() {
  return div(toList([class$("container")]), toList([
    style(toList([]), css()),
    h1(toList([]), toList([text2("Inlay: Lustre component demo")])),
    p(toList([class$("subtitle")]), toList([
      text2("Embeds rendered by the "),
      code(toList([]), toList([text2("<inlay-embed>")])),
      text2(" component. These render entirely client-side!")
    ])),
    section("Mastodon", embed("https://mastodon.social/@iamkonstantin/116391354521208947")),
    section("Pixelfed", embed("https://pixelfed.social/p/kkonstantin/788060252604363209")),
    section("YouTube", embed("https://www.youtube.com/watch?v=XBu0m5JAUsA")),
    section("Bluesky", embed("https://bsky.app/profile/did:plc:bwm3ipmp7fidz67iy4atioa5/post/3max7rufmvp2y")),
    section("Spotify Artist", embed("https://open.spotify.com/artist/7GyhmlEy51sGUE09A5AWzc?si=Thh-F4JSTCmx3I5D5Ofljw")),
    section("Spotify Track", embed("https://open.spotify.com/track/6dgOGIJjlUDGD7hJ0CbIJI?si=a7e23bbaf33b4b14")),
    section("Spotify Playlist", embed("https://open.spotify.com/playlist/3jsMM3KminuLxYCFy6PKFu?si=Gsighi56SB6HmtDrO3vI-w")),
    section("Apple Music Artist", embed("https://music.apple.com/be/artist/evanescence/42102393")),
    section("Apple Music Album", embed("https://music.apple.com/be/album/bleed-out/1699386566")),
    section("Apple Music Playlist", embed("https://music.apple.com/be/playlist/ramin-djawadi-essentials/pl.ac83e6e212d5400198f4c8c2110a2af1")),
    section("OpenStreetMap", embed("https://www.openstreetmap.org/relation/19189218#map=17/50.8949/4.3416"))
  ]));
}
function main() {
  let $ = configure3(config());
  if (!($ instanceof Ok)) {
    throw makeError("let_assert", FILEPATH2, "inlay_components", 134, "main", "Pattern match failed, no pattern matched the value.", {
      value: $,
      start: 3248,
      end: 3294,
      pattern_start: 3259,
      pattern_end: 3266
    });
  }
  let $1 = start4(element4(view2()), "#app", undefined);
  if (!($1 instanceof Ok)) {
    throw makeError("let_assert", FILEPATH2, "inlay_components", 135, "main", "Pattern match failed, no pattern matched the value.", {
      value: $1,
      start: 3297,
      end: 3365,
      pattern_start: 3308,
      pattern_end: 3313
    });
  }
  return;
}

// .lustre/build/inlay_components.mjs
main();
