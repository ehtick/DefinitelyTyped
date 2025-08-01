import bufferModule = require("node:buffer");

// Specifically test buffer module regression.
import {
    Blob as NodeBlob,
    Buffer,
    constants,
    File,
    isAscii,
    isUtf8,
    kMaxLength,
    kStringMaxLength,
    resolveObjectURL,
    SlowBuffer,
    transcode,
    TranscodeEncoding,
} from "node:buffer";
import { Readable, Writable } from "node:stream";
import { ReadableStream } from "stream/web";

const utf8Buffer = new Buffer("test");
const base64Buffer = new Buffer("", "base64");
const base64UrlBuffer = new Buffer("", "base64url");
const octets: Uint8Array = new Uint8Array(123);
const octetBuffer = new Buffer(octets);
const sharedBuffer = new Buffer(octets.buffer);
const copiedBuffer = new Buffer(utf8Buffer);
console.log(Buffer.isBuffer(octetBuffer));
console.log(Buffer.isEncoding("utf8"));
console.log(Buffer.byteLength("xyz123"));
console.log(Buffer.byteLength("xyz123", "ascii"));
const result1 = Buffer.concat([utf8Buffer, base64Buffer] as readonly Uint8Array[]);
const result2 = Buffer.concat([utf8Buffer, base64Buffer] as readonly Uint8Array[], 9999999);

// Globals
{
    const globalBuffer: typeof Buffer = globalThis.Buffer;
}

// Module constants
{
    const value1: number = constants.MAX_LENGTH;
    const value2: number = constants.MAX_STRING_LENGTH;
    const value3: number = kMaxLength;
    const value4: number = kStringMaxLength;
}

// Module variables
{
    // $ExpectType number
    bufferModule.INSPECT_MAX_BYTES;
    bufferModule.INSPECT_MAX_BYTES = 0;

    // @ts-expect-error - This variable is in `exports`, but not in `exports.Buffer`.
    Buffer.INSPECT_MAX_BYTES;
    // @ts-expect-error - This variable is in `exports`, but not in `exports.Buffer`.
    Buffer.INSPECT_MAX_BYTES = 2;
}

// Module methods
{
    const bool1: boolean = isUtf8(new Buffer("hello"));
    const bool2: boolean = isUtf8(new ArrayBuffer(0));
    const bool3: boolean = isUtf8(new Uint8Array());
}
{
    const bool1: boolean = isAscii(new Buffer("hello"));
    const bool2: boolean = isAscii(new ArrayBuffer(0));
    const bool3: boolean = isAscii(new Uint8Array());
}

// Class Methods: Buffer.swap16(), Buffer.swa32(), Buffer.swap64()
{
    const buf = Buffer.from([0x1, 0x2, 0x3, 0x4, 0x5, 0x6, 0x7, 0x8]);
    buf.swap16();
    buf.swap32();
    buf.swap64();
}

// Class Method: Buffer.from()
{
    // Array-like
    {
        // $ExpectType Buffer || Buffer<ArrayBuffer>
        Buffer.from([0x62, 0x75, 0x66, 0x66, 0x65, 0x72] as const);
        // $ExpectType Buffer || Buffer<ArrayBuffer>
        Buffer.from(new Uint8Array());
        // $ExpectType Buffer || Buffer<ArrayBuffer>
        Buffer.from(Uint8ClampedArray.of(1024));
        // $ExpectType Buffer || Buffer<ArrayBuffer>
        Buffer.from({ length: 6, 0: 0x62, 1: 0x75, 2: 0x66, 3: 0x66, 4: 0x65, 5: 0x72 });
    }

    // Buffer
    {
        // $ExpectType Buffer || Buffer<ArrayBuffer>
        Buffer.from(Buffer.alloc(0));
    }

    // ArrayBuffer
    {
        // $ExpectType Buffer || Buffer<ArrayBuffer>
        Buffer.from(new ArrayBuffer(0));
        // $ExpectType Buffer || Buffer<ArrayBuffer>
        Buffer.from(new ArrayBuffer(32), 16, 16);
        // $ExpectType Buffer || Buffer<SharedArrayBuffer>
        Buffer.from(new SharedArrayBuffer(0));
        // $ExpectType Buffer || Buffer<SharedArrayBuffer>
        Buffer.from(new SharedArrayBuffer(32), 16, 16);
        // $ExpectType Buffer || Buffer<ArrayBuffer | SharedArrayBuffer>
        Buffer.from({} as ArrayBuffer | SharedArrayBuffer);
    }

    // String
    {
        // $ExpectType Buffer || Buffer<ArrayBuffer>
        Buffer.from("buffer");
        // $ExpectType Buffer || Buffer<ArrayBuffer>
        Buffer.from("buffer", "latin1");
    }

    // implicit coercion
    {
        // $ExpectType Buffer || Buffer<ArrayBuffer>
        Buffer.from({
            valueOf() {
                return [] as const;
            },
        });
        // $ExpectType Buffer || Buffer<ArrayBuffer>
        Buffer.from({
            valueOf() {
                return Buffer.alloc(0);
            },
        });
        // $ExpectType Buffer || Buffer<ArrayBuffer>
        Buffer.from({
            valueOf() {
                return "buffer";
            },
        }, "utf-8");
        // $ExpectType Buffer || Buffer<ArrayBuffer>
        Buffer.from({
            valueOf() {
                return new ArrayBuffer(0);
            },
        });
        // $ExpectType Buffer || Buffer<SharedArrayBuffer>
        Buffer.from({
            valueOf() {
                return new SharedArrayBuffer(0);
            },
        });
        // $ExpectType Buffer || Buffer<ArrayBuffer>
        Buffer.from({
            [Symbol.toPrimitive]() {
                return "buffer";
            },
        }, "latin1");
        // @ts-expect-error
        Buffer.from({} as { valueOf(): {} });
        // @ts-expect-error
        Buffer.from({} as { [Symbol.toPrimitive](): number });
    }

    // ArrayLike or string
    {
        let arrayOrString!: number[] | string;
        // $ExpectType Buffer || Buffer<ArrayBuffer>
        Buffer.from(arrayOrString);

        let typedArrayOrString!: Uint8Array | string;
        // $ExpectType Buffer || Buffer<ArrayBuffer>
        Buffer.from(typedArrayOrString);
    }

    // @ts-expect-error
    Buffer.from({});
    // @ts-expect-error
    Buffer.from(0);
}

// Class Method: Buffer.alloc(size[, fill[, encoding]])
{
    const buf1: Buffer = Buffer.alloc(5);
    const buf2: Buffer = Buffer.alloc(5, "a");
    const buf3: Buffer = Buffer.alloc(11, "aGVsbG8gd29ybGQ=", "base64");
    const buf4: Buffer = Buffer.alloc(11, "aGVsbG8gd29ybGQ", "base64url");
    const buf5: Buffer = Buffer.alloc(2, new Uint8Array([1, 2]));
}
// Class Method: Buffer.allocUnsafe(size)
{
    const buf: Buffer = Buffer.allocUnsafe(5);
}
// Class Method: Buffer.allocUnsafeSlow(size)
{
    const buf: Buffer = Buffer.allocUnsafeSlow(10);
}

// Class Method byteLength
{
    let len: number;
    len = Buffer.byteLength("foo");
    len = Buffer.byteLength("foo", "utf8");

    const b = Buffer.from("bar");
    len = Buffer.byteLength(b);
    len = Buffer.byteLength(b, "utf16le");

    const ab = new ArrayBuffer(15);
    len = Buffer.byteLength(ab);
    len = Buffer.byteLength(ab, "ascii");

    const dv = new DataView(ab);
    len = Buffer.byteLength(dv);
    len = Buffer.byteLength(dv, "utf16le");
}

// Class Method poolSize
{
    let s: number;
    s = Buffer.poolSize;
    Buffer.poolSize = 4096;
}

// Test that TS 1.6 works with the 'as Buffer' annotation
// on isBuffer.
let a: Buffer | number;
a = new Buffer(10);
if (Buffer.isBuffer(a)) {
    a.writeUInt8(3, 4);
}

// write* methods return offsets.
const b = new Buffer(16);
let result: number = b.writeUInt32LE(0, 0);
result = b.writeUInt16LE(0, 4);
result = b.writeUInt8(0, 6);
result = b.writeInt8(0, 7);
result = b.writeDoubleLE(0, 8);
result = b.write("asd");
result = b.write("asd", "hex");
result = b.write("asd", 123, "hex");
result = b.write("asd", 123, 123, "hex");

{
    const buffer = new Buffer("123");
    let index: number;
    index = buffer.indexOf("23");
    index = buffer.indexOf("23", "hex");
    index = buffer.indexOf("23", 1);
    index = buffer.indexOf("23", 1, "utf8");
    index = buffer.indexOf(23);
    index = buffer.indexOf(buffer);
}

{
    const buffer = new Buffer("123");
    let index: number;
    index = buffer.lastIndexOf("23");
    index = buffer.lastIndexOf("23", "hex");
    index = buffer.lastIndexOf("23", 1);
    index = buffer.lastIndexOf("23", 1, "utf8");
    index = buffer.lastIndexOf(23);
    index = buffer.lastIndexOf(buffer);
}

{
    const buffer = new Buffer("123");
    const val: [number, number] = [1, 1];

    /* comment out for --target es5
    for (let entry of buffer.entries()) {
        val = entry;
    }
    */
}

{
    const buffer = new Buffer("123");
    let includes: boolean;
    includes = buffer.includes("23");
    includes = buffer.includes("23", "hex");
    includes = buffer.includes("23", 1);
    includes = buffer.includes("23", 1, "utf8");
    includes = buffer.includes(23);
    includes = buffer.includes(23, 1);
    includes = buffer.includes(23, 1, "utf8");
    includes = buffer.includes(buffer);
    includes = buffer.includes(buffer, 1);
    includes = buffer.includes(buffer, 1, "utf8");
}

{
    const buffer = new Buffer("123");
    const val = 1;

    /* comment out for --target es5
    for (let key of buffer.keys()) {
        val = key;
    }
    */
}

{
    const buffer = new Buffer("123");
    const val = 1;

    /* comment out for --target es5
    for (let value of buffer.values()) {
        val = value;
    }
    */
}

// SlowBuffer
{
    // $ExpectType Buffer || Buffer<ArrayBuffer>
    new SlowBuffer(256);
    // @ts-expect-error
    SlowBuffer(256);
}

// NodeJS.BufferEncoding works properly
{
    const encoding: NodeJS.BufferEncoding = "ascii";
    const b = new Buffer("123", encoding);
    b.writeUInt8(0, 6);
}

// Buffer has Uint8Array's buffer field (an ArrayBuffer).
{
    const buffer = new Buffer("123");
    const octets = new Uint8Array(buffer.buffer);
}

// Inherited from Uint8Array but return buffer
{
    const b = Buffer.from("asd");
    let res: Buffer = b.reverse();
    res = b.subarray();
    res = b.subarray(1);
    res = b.subarray(1, 2);
}

// Buffer module, transcode function
{
    transcode(Buffer.from("€"), "utf8", "ascii"); // $ExpectType Buffer || Buffer<ArrayBufferLike>

    const source: TranscodeEncoding = "utf8";
    const target: TranscodeEncoding = "ascii";
    transcode(Buffer.from("€"), source, target); // $ExpectType Buffer || Buffer<ArrayBufferLike>
}

{
    const a = Buffer.alloc(1000);
    a.writeBigInt64BE(123n);
    a.writeBigInt64LE(123n);
    a.writeBigUInt64BE(123n);
    a.writeBigUint64BE(123n);
    a.writeBigUInt64LE(123n);
    a.writeBigUint64LE(123n);
    let b: bigint = a.readBigInt64BE(123);
    b = a.readBigInt64LE(123);
    b = a.readBigUInt64LE(123);
    b = a.readBigUint64LE(123);
    b = a.readBigUInt64BE(123);
    b = a.readBigUint64BE(123);
}

{
    const buf = Buffer.allocUnsafe(5);
    let result: Buffer;
    result = buf.fill("a");
    result = buf.fill("aazz", "hex");
    result = buf.fill("aazz", 1, "hex");
    result = buf.fill("aazz", 1, 2, "hex");

    result = buf.fill(1234);
    result = buf.fill(1234, 1);
    result = buf.fill(1234, 1, 2);

    const target = Buffer.allocUnsafe(0);
    result = buf.fill(target);
    result = buf.fill(target, 1);
    result = buf.fill(target, 1, 2);
}

(async () => {
    const blob = new NodeBlob(["asd", Buffer.from("test"), new NodeBlob(["dummy"])], {
        type: "application/javascript",
        endings: "native",
    });

    blob.size; // $ExpectType number
    blob.type; // $ExpectType string

    blob.arrayBuffer(); // $ExpectType Promise<ArrayBuffer>
    blob.text(); // $ExpectType Promise<string>
    blob.slice(); // $ExpectType Blob
    blob.slice(1); // $ExpectType Blob
    blob.slice(1, 2); // $ExpectType Blob
    blob.slice(1, 2, "other"); // $ExpectType Blob
    // ExpectType does not support disambiguating interfaces that have the same
    // name but wildly different implementations, like Node native ReadableStream
    // vs W3C ReadableStream, so we have to look at properties.
    blob.stream().locked; // $ExpectType boolean

    // As above but for global-scoped Blob, which should be an alias for NodeBlob
    // as long as `lib-dom` is not included.
    const blob2 = new Blob([]);
    blob2.stream().locked; // $ExpectType boolean
});

// Ensure type-side of global Blob exists
declare const blob3: Blob;
blob3.stream();

// File
{
    const file1 = new File(["asd", Buffer.from("test"), new NodeBlob(["dummy"])], "filename1.txt");
    const file2 = new File([file1], "filename2.txt", {
        type: "plain/txt",
        endings: "transparent",
        lastModified: Date.now() - 1000,
    });
    file1.name; // $ExpectType string
    file1.lastModified; // $ExpectType number
    file2.name; // $ExpectType string
    file2.lastModified; // $ExpectType number
}

{
    atob(btoa("test")); // $ExpectType string
}

{
    global.atob(global.btoa("test")); // $ExpectType string
}

const c: NodeJS.TypedArray = new Buffer(123);

{
    let writableFinished: boolean;
    const readable: Readable = new Readable({
        read() {
            this.push("hello");
            this.push("world");
            this.push(null);
        },
    });
    readable.destroyed;
    const writable: Writable = new Writable({
        write(chunk, _, cb) {
            cb();
        },
    });
    readable.pipe(writable);
    writableFinished = writable.writableFinished;
    writable.destroyed;
}

const buff = Buffer.from("Hello World!");

// reads

buff.readInt8();
buff.readInt8(0);
buff.readUint8();
buff.readUInt8();
buff.readUInt8(0);
buff.readUint16BE();
buff.readUInt16BE();
buff.readUInt16BE(0);
buff.readUint32LE();
buff.readUInt32LE();
buff.readUInt32LE(0);
buff.readUint32BE();
buff.readUInt32BE();
buff.readUInt32BE(0);
buff.readInt8();
buff.readInt8(0);
buff.readInt16LE();
buff.readInt16LE(0);
buff.readInt16BE();
buff.readInt16BE(0);
buff.readInt32LE();
buff.readInt32LE(0);
buff.readInt32BE();
buff.readInt32BE(0);
buff.readFloatLE();
buff.readFloatLE(0);
buff.readFloatBE();
buff.readFloatBE(0);
buff.readDoubleLE();
buff.readDoubleBE(0);

// writes

buff.writeInt8(0xab);
buff.writeInt8(0xab, 0);
buff.writeUint8(0xab);
buff.writeUInt8(0xab);
buff.writeUInt8(0xab, 0);
buff.writeUint16LE(0xabcd);
buff.writeUInt16LE(0xabcd);
buff.writeUInt16LE(0xabcd, 0);
buff.writeUint16BE(0xabcd);
buff.writeUInt16BE(0xabcd);
buff.writeUInt16BE(0xabcd, 0);
buff.writeUint32LE(0xabcd);
buff.writeUInt32LE(0xabcd);
buff.writeUInt32LE(0xabcd, 0);
buff.writeUInt32BE(0xabcd);
buff.writeUInt32BE(0xabcd, 0);
buff.writeInt16LE(0xabcd);
buff.writeInt16LE(0xabcd, 0);
buff.writeInt16BE(0xabcd);
buff.writeInt16BE(0xabcd, 0);
buff.writeInt32LE(0xabcd);
buff.writeInt32LE(0xabcd, 0);
buff.writeInt32BE(0xabcd);
buff.writeInt32BE(0xabcd, 0);
buff.writeFloatLE(0xabcd);
buff.writeFloatLE(0xabcd, 0);
buff.writeFloatBE(0xabcd);
buff.writeFloatBE(0xabcd, 0);
buff.writeDoubleLE(123.123);
buff.writeDoubleLE(123.123, 0);
buff.writeDoubleBE(123.123);
buff.writeDoubleBE(123.123, 0);

{
    // $ExpectType Blob | undefined
    resolveObjectURL(URL.createObjectURL(new Blob([""])));
}

{
    Buffer.compare(buff, buff); // $ExpectType 0 | 1 | -1
}

{
    buff.compare(buff); // $ExpectType 0 | 1 | -1
}

{
    const u16 = new Uint16Array([0xffff]);
    Buffer.copyBytesFrom(u16); // $ExpectType Buffer || Buffer<ArrayBuffer>
    Buffer.copyBytesFrom(u16, 1, 5); // $ExpectType Buffer || Buffer<ArrayBuffer>
}

declare class NodeFile implements File {
    lastModified: number;
    name: string;
    webkitRelativePath: string;
    get size(): number;
    type: string;
    constructor(filepath: string, type: string, slicer?: {
        start: number;
        end: number;
    });
    hi: string;
    slice(start?: number, end?: number, type?: string): NodeBlob;
    stream(): ReadableStream;
    arrayBuffer(): Promise<ArrayBuffer>;
    bytes(): Promise<Uint8Array>;
    text(): Promise<string>;
}

{
    const blobTest = new Blob([""]);
    // @ts-expect-error
    blobTest.arguments;
    // @ts-expect-error
    new blobTest();
}
