class PreconditionFailure extends Error {
    constructor(interruptExecution = false) {
        super();
        this.interruptExecution = interruptExecution;
        this.footprint = PreconditionFailure.SharedFootPrint;
    }
    static isFailure(err) {
        return err != null && err.footprint === PreconditionFailure.SharedFootPrint;
    }
}
PreconditionFailure.SharedFootPrint = Symbol('fast-check/PreconditionFailure');

function pre(expectTruthy) {
    if (!expectTruthy) {
        throw new PreconditionFailure();
    }
}

class Nil {
    [Symbol.iterator]() {
        return this;
    }
    next(value) {
        return { value, done: true };
    }
}
Nil.nil = new Nil();
function nilHelper() {
    return Nil.nil;
}
function* mapHelper(g, f) {
    for (const v of g) {
        yield f(v);
    }
}
function* flatMapHelper(g, f) {
    for (const v of g) {
        yield* f(v);
    }
}
function* filterHelper(g, f) {
    for (const v of g) {
        if (f(v)) {
            yield v;
        }
    }
}
function* takeWhileHelper(g, f) {
    let cur = g.next();
    while (!cur.done && f(cur.value)) {
        yield cur.value;
        cur = g.next();
    }
}
function* joinHelper(g, others) {
    for (let cur = g.next(); !cur.done; cur = g.next()) {
        yield cur.value;
    }
    for (const s of others) {
        for (let cur = s.next(); !cur.done; cur = s.next()) {
            yield cur.value;
        }
    }
}

class Stream {
    constructor(g) {
        this.g = g;
    }
    static nil() {
        return new Stream(nilHelper());
    }
    static of(...elements) {
        return new Stream(elements[Symbol.iterator]());
    }
    next() {
        return this.g.next();
    }
    [Symbol.iterator]() {
        return this.g;
    }
    map(f) {
        return new Stream(mapHelper(this.g, f));
    }
    flatMap(f) {
        return new Stream(flatMapHelper(this.g, f));
    }
    dropWhile(f) {
        let foundEligible = false;
        function* helper(v) {
            if (foundEligible || !f(v)) {
                foundEligible = true;
                yield v;
            }
        }
        return this.flatMap(helper);
    }
    drop(n) {
        let idx = 0;
        function helper() {
            return idx++ < n;
        }
        return this.dropWhile(helper);
    }
    takeWhile(f) {
        return new Stream(takeWhileHelper(this.g, f));
    }
    take(n) {
        let idx = 0;
        function helper() {
            return idx++ < n;
        }
        return this.takeWhile(helper);
    }
    filter(f) {
        return new Stream(filterHelper(this.g, f));
    }
    every(f) {
        for (const v of this.g) {
            if (!f(v)) {
                return false;
            }
        }
        return true;
    }
    has(f) {
        for (const v of this.g) {
            if (f(v)) {
                return [true, v];
            }
        }
        return [false, null];
    }
    join(...others) {
        return new Stream(joinHelper(this.g, others));
    }
    getNthOrLast(nth) {
        let remaining = nth;
        let last = null;
        for (const v of this.g) {
            if (remaining-- === 0)
                return v;
            last = v;
        }
        return last;
    }
}
function stream(g) {
    return new Stream(g);
}

const cloneMethod = Symbol('fast-check/cloneMethod');
const hasCloneMethod = (instance) => {
    return instance instanceof Object && typeof instance[cloneMethod] === 'function';
};

class Shrinkable {
    constructor(value_, shrink = () => Stream.nil()) {
        this.value_ = value_;
        this.shrink = shrink;
        this.hasToBeCloned = hasCloneMethod(value_);
        this.readOnce = false;
        Object.defineProperty(this, 'value', { get: this.getValue });
    }
    getValue() {
        if (this.hasToBeCloned) {
            if (!this.readOnce) {
                this.readOnce = true;
                return this.value_;
            }
            return this.value_[cloneMethod]();
        }
        return this.value_;
    }
    applyMapper(mapper) {
        if (this.hasToBeCloned) {
            const out = mapper(this.value);
            if (out instanceof Object) {
                out[cloneMethod] = () => mapper(this.value);
            }
            return out;
        }
        return mapper(this.value);
    }
    map(mapper) {
        return new Shrinkable(this.applyMapper(mapper), () => this.shrink().map((v) => v.map(mapper)));
    }
    filter(refinement) {
        const refinementOnShrinkable = (s) => {
            return refinement(s.value);
        };
        return new Shrinkable(this.value, () => this.shrink()
            .filter(refinementOnShrinkable)
            .map((v) => v.filter(refinement)));
    }
}

class Arbitrary {
    filter(refinement) {
        return new FilterArbitrary(this, refinement);
    }
    map(mapper) {
        return new MapArbitrary(this, mapper);
    }
    chain(fmapper) {
        return new ChainArbitrary(this, fmapper);
    }
    noShrink() {
        return new NoShrinkArbitrary(this);
    }
    withBias(_freq) {
        return this;
    }
    noBias() {
        return new NoBiasArbitrary(this);
    }
}
class ChainArbitrary extends Arbitrary {
    constructor(arb, fmapper) {
        super();
        this.arb = arb;
        this.fmapper = fmapper;
    }
    generate(mrng) {
        const clonedMrng = mrng.clone();
        const src = this.arb.generate(mrng);
        const dst = this.fmapper(src.value).generate(mrng);
        return ChainArbitrary.shrinkChain(clonedMrng, src, dst, this.fmapper);
    }
    withBias(freq) {
        return this.arb.withBias(freq).chain((t) => this.fmapper(t).withBias(freq));
    }
    static shrinkChain(mrng, src, dst, fmapper) {
        return new Shrinkable(dst.value, () => src
            .shrink()
            .map((v) => ChainArbitrary.shrinkChain(mrng.clone(), v, fmapper(v.value).generate(mrng.clone()), fmapper))
            .join(dst.shrink()));
    }
}
class MapArbitrary extends Arbitrary {
    constructor(arb, mapper) {
        super();
        this.arb = arb;
        this.mapper = mapper;
    }
    generate(mrng) {
        return this.arb.generate(mrng).map(this.mapper);
    }
    withBias(freq) {
        return this.arb.withBias(freq).map(this.mapper);
    }
}
class FilterArbitrary extends Arbitrary {
    constructor(arb, refinement) {
        super();
        this.arb = arb;
        this.refinement = refinement;
    }
    generate(mrng) {
        let g = this.arb.generate(mrng);
        while (!this.refinementOnShrinkable(g)) {
            g = this.arb.generate(mrng);
        }
        return g.filter(this.refinement);
    }
    withBias(freq) {
        return this.arb.withBias(freq).filter(this.refinement);
    }
    refinementOnShrinkable(s) {
        return this.refinement(s.value);
    }
}
class NoShrinkArbitrary extends Arbitrary {
    constructor(arb) {
        super();
        this.arb = arb;
    }
    generate(mrng) {
        return new Shrinkable(this.arb.generate(mrng).value);
    }
    withBias(freq) {
        return this.arb.withBias(freq).noShrink();
    }
}
class NoBiasArbitrary extends Arbitrary {
    constructor(arb) {
        super();
        this.arb = arb;
    }
    generate(mrng) {
        return this.arb.generate(mrng);
    }
}

class GenericTupleArbitrary extends Arbitrary {
    constructor(arbs) {
        super();
        this.arbs = arbs;
        for (let idx = 0; idx !== arbs.length; ++idx) {
            const arb = arbs[idx];
            if (arb == null || arb.generate == null)
                throw new Error(`Invalid parameter encountered at index ${idx}: expecting an Arbitrary`);
        }
    }
    static makeItCloneable(vs, shrinkables) {
        vs[cloneMethod] = () => {
            const cloned = [];
            for (let idx = 0; idx !== shrinkables.length; ++idx) {
                cloned.push(shrinkables[idx].value);
            }
            GenericTupleArbitrary.makeItCloneable(cloned, shrinkables);
            return cloned;
        };
        return vs;
    }
    static wrapper(shrinkables) {
        let cloneable = false;
        const vs = [];
        for (let idx = 0; idx !== shrinkables.length; ++idx) {
            const s = shrinkables[idx];
            cloneable = cloneable || s.hasToBeCloned;
            vs.push(s.value);
        }
        if (cloneable) {
            GenericTupleArbitrary.makeItCloneable(vs, shrinkables);
        }
        return new Shrinkable(vs, () => GenericTupleArbitrary.shrinkImpl(shrinkables).map(GenericTupleArbitrary.wrapper));
    }
    generate(mrng) {
        return GenericTupleArbitrary.wrapper(this.arbs.map((a) => a.generate(mrng)));
    }
    static shrinkImpl(value) {
        let s = Stream.nil();
        for (let idx = 0; idx !== value.length; ++idx) {
            s = s.join(value[idx].shrink().map((v) => value
                .slice(0, idx)
                .concat([v])
                .concat(value.slice(idx + 1))));
        }
        return s;
    }
    withBias(freq) {
        return new GenericTupleArbitrary(this.arbs.map((a) => a.withBias(freq)));
    }
}
function genericTuple(arbs) {
    return new GenericTupleArbitrary(arbs);
}
function tuple(...arbs) {
    return new GenericTupleArbitrary(arbs);
}

const runIdToFrequency = (runId) => 2 + Math.floor(Math.log(runId + 1) / Math.log(10));

const internalGlobalThis = (function () {
    if (typeof self !== 'undefined') {
        return self;
    }
    if (typeof window !== 'undefined') {
        return window;
    }
    if (typeof global !== 'undefined') {
        return global;
    }
    throw new Error('unable to locate global object');
})();
const getGlobal = () => internalGlobalThis;

const globalParametersSymbol = Symbol('fast-check/GlobalParameters');
function configureGlobal(parameters) {
    getGlobal()[globalParametersSymbol] = parameters;
}
function readConfigureGlobal() {
    return getGlobal()[globalParametersSymbol];
}
function resetConfigureGlobal() {
    delete getGlobal()[globalParametersSymbol];
}

class AsyncProperty {
    constructor(arb, predicate) {
        this.arb = arb;
        this.predicate = predicate;
        this.isAsync = () => true;
        const { asyncBeforeEach, asyncAfterEach, beforeEach, afterEach } = readConfigureGlobal() || {};
        if (asyncBeforeEach !== undefined && beforeEach !== undefined) {
            throw Error('Global "asyncBeforeEach" and "beforeEach" parameters can\'t be set at the same time when running async properties');
        }
        if (asyncAfterEach !== undefined && afterEach !== undefined) {
            throw Error('Global "asyncAfterEach" and "afterEach" parameters can\'t be set at the same time when running async properties');
        }
        this.beforeEachHook = asyncBeforeEach || beforeEach || AsyncProperty.dummyHook;
        this.afterEachHook = asyncAfterEach || afterEach || AsyncProperty.dummyHook;
    }
    generate(mrng, runId) {
        return runId != null ? this.arb.withBias(runIdToFrequency(runId)).generate(mrng) : this.arb.generate(mrng);
    }
    async run(v) {
        await this.beforeEachHook();
        try {
            const output = await this.predicate(v);
            return output == null || output === true ? null : 'Property failed by returning false';
        }
        catch (err) {
            if (PreconditionFailure.isFailure(err))
                return err;
            if (err instanceof Error && err.stack)
                return `${err}\n\nStack trace: ${err.stack}`;
            return `${err}`;
        }
        finally {
            await this.afterEachHook();
        }
    }
    beforeEach(hookFunction) {
        const previousBeforeEachHook = this.beforeEachHook;
        this.beforeEachHook = () => hookFunction(previousBeforeEachHook);
        return this;
    }
    afterEach(hookFunction) {
        const previousAfterEachHook = this.afterEachHook;
        this.afterEachHook = () => hookFunction(previousAfterEachHook);
        return this;
    }
}
AsyncProperty.dummyHook = () => { };

function asyncProperty(...args) {
    if (args.length < 2)
        throw new Error('asyncProperty expects at least two parameters');
    const arbs = args.slice(0, args.length - 1);
    const p = args[args.length - 1];
    return new AsyncProperty(genericTuple(arbs), t => p(...t));
}

class Property {
    constructor(arb, predicate) {
        this.arb = arb;
        this.predicate = predicate;
        this.isAsync = () => false;
        const { beforeEach = Property.dummyHook, afterEach = Property.dummyHook, asyncBeforeEach, asyncAfterEach } = readConfigureGlobal() || {};
        if (asyncBeforeEach !== undefined) {
            throw Error('"asyncBeforeEach" can\'t be set when running synchronous properties');
        }
        if (asyncAfterEach !== undefined) {
            throw Error('"asyncAfterEach" can\'t be set when running synchronous properties');
        }
        this.beforeEachHook = beforeEach;
        this.afterEachHook = afterEach;
    }
    generate(mrng, runId) {
        return runId != null ? this.arb.withBias(runIdToFrequency(runId)).generate(mrng) : this.arb.generate(mrng);
    }
    run(v) {
        this.beforeEachHook();
        try {
            const output = this.predicate(v);
            return output == null || output === true ? null : 'Property failed by returning false';
        }
        catch (err) {
            if (PreconditionFailure.isFailure(err))
                return err;
            if (err instanceof Error && err.stack)
                return `${err}\n\nStack trace: ${err.stack}`;
            return `${err}`;
        }
        finally {
            this.afterEachHook();
        }
    }
    beforeEach(hookFunction) {
        const previousBeforeEachHook = this.beforeEachHook;
        this.beforeEachHook = () => hookFunction(previousBeforeEachHook);
        return this;
    }
    afterEach(hookFunction) {
        const previousAfterEachHook = this.afterEachHook;
        this.afterEachHook = () => hookFunction(previousAfterEachHook);
        return this;
    }
}
Property.dummyHook = () => { };

function property(...args) {
    if (args.length < 2)
        throw new Error('property expects at least two parameters');
    const arbs = args.slice(0, args.length - 1);
    const p = args[args.length - 1];
    return new Property(genericTuple(arbs), t => p(...t));
}

function generateN(rng, num) {
    var cur = rng;
    var out = [];
    for (var idx = 0; idx != num; ++idx) {
        var nextOut = cur.next();
        out.push(nextOut[0]);
        cur = nextOut[1];
    }
    return [out, cur];
}
function skipN(rng, num) {
    return generateN(rng, num)[1];
}

var MULTIPLIER = 0x000343fd;
var INCREMENT = 0x00269ec3;
var MASK = 0xffffffff;
var MASK_2 = (1 << 31) - 1;
var computeNextSeed = function (seed) {
    return (seed * MULTIPLIER + INCREMENT) & MASK;
};
var computeValueFromNextSeed = function (nextseed) {
    return (nextseed & MASK_2) >> 16;
};
var LinearCongruential = (function () {
    function LinearCongruential(seed) {
        this.seed = seed;
    }
    LinearCongruential.prototype.min = function () {
        return LinearCongruential.min;
    };
    LinearCongruential.prototype.max = function () {
        return LinearCongruential.max;
    };
    LinearCongruential.prototype.next = function () {
        var nextseed = computeNextSeed(this.seed);
        return [computeValueFromNextSeed(nextseed), new LinearCongruential(nextseed)];
    };
    LinearCongruential.min = 0;
    LinearCongruential.max = Math.pow(2, 15) - 1;
    return LinearCongruential;
}());
var LinearCongruential32 = (function () {
    function LinearCongruential32(seed) {
        this.seed = seed;
    }
    LinearCongruential32.prototype.min = function () {
        return LinearCongruential32.min;
    };
    LinearCongruential32.prototype.max = function () {
        return LinearCongruential32.max;
    };
    LinearCongruential32.prototype.next = function () {
        var s1 = computeNextSeed(this.seed);
        var v1 = computeValueFromNextSeed(s1);
        var s2 = computeNextSeed(s1);
        var v2 = computeValueFromNextSeed(s2);
        var s3 = computeNextSeed(s2);
        var v3 = computeValueFromNextSeed(s3);
        var vnext = v3 + ((v2 + (v1 << 15)) << 15);
        return [((vnext + 0x80000000) | 0) + 0x80000000, new LinearCongruential32(s3)];
    };
    LinearCongruential32.min = 0;
    LinearCongruential32.max = 0xffffffff;
    return LinearCongruential32;
}());
var congruential = function (seed) {
    return new LinearCongruential(seed);
};
var congruential32 = function (seed) {
    return new LinearCongruential32(seed);
};

var MersenneTwister = (function () {
    function MersenneTwister(states, index) {
        if (index >= MersenneTwister.N) {
            this.states = MersenneTwister.twist(states);
            this.index = 0;
        }
        else {
            this.states = states;
            this.index = index;
        }
    }
    MersenneTwister.twist = function (prev) {
        var mt = prev.slice();
        for (var idx = 0; idx !== MersenneTwister.N - MersenneTwister.M; ++idx) {
            var y_1 = (mt[idx] & MersenneTwister.MASK_UPPER) + (mt[idx + 1] & MersenneTwister.MASK_LOWER);
            mt[idx] = mt[idx + MersenneTwister.M] ^ (y_1 >>> 1) ^ (-(y_1 & 1) & MersenneTwister.A);
        }
        for (var idx = MersenneTwister.N - MersenneTwister.M; idx !== MersenneTwister.N - 1; ++idx) {
            var y_2 = (mt[idx] & MersenneTwister.MASK_UPPER) + (mt[idx + 1] & MersenneTwister.MASK_LOWER);
            mt[idx] = mt[idx + MersenneTwister.M - MersenneTwister.N] ^ (y_2 >>> 1) ^ (-(y_2 & 1) & MersenneTwister.A);
        }
        var y = (mt[MersenneTwister.N - 1] & MersenneTwister.MASK_UPPER) + (mt[0] & MersenneTwister.MASK_LOWER);
        mt[MersenneTwister.N - 1] = mt[MersenneTwister.M - 1] ^ (y >>> 1) ^ (-(y & 1) & MersenneTwister.A);
        return mt;
    };
    MersenneTwister.seeded = function (seed) {
        var out = Array(MersenneTwister.N);
        out[0] = seed;
        for (var idx = 1; idx !== MersenneTwister.N; ++idx) {
            var xored = out[idx - 1] ^ (out[idx - 1] >>> 30);
            out[idx] = (Math.imul(MersenneTwister.F, xored) + idx) | 0;
        }
        return out;
    };
    MersenneTwister.from = function (seed) {
        return new MersenneTwister(MersenneTwister.seeded(seed), MersenneTwister.N);
    };
    MersenneTwister.prototype.min = function () {
        return MersenneTwister.min;
    };
    MersenneTwister.prototype.max = function () {
        return MersenneTwister.max;
    };
    MersenneTwister.prototype.next = function () {
        var y = this.states[this.index];
        y ^= this.states[this.index] >>> MersenneTwister.U;
        y ^= (y << MersenneTwister.S) & MersenneTwister.B;
        y ^= (y << MersenneTwister.T) & MersenneTwister.C;
        y ^= y >>> MersenneTwister.L;
        return [y >>> 0, new MersenneTwister(this.states, this.index + 1)];
    };
    MersenneTwister.min = 0;
    MersenneTwister.max = 0xffffffff;
    MersenneTwister.N = 624;
    MersenneTwister.M = 397;
    MersenneTwister.R = 31;
    MersenneTwister.A = 0x9908b0df;
    MersenneTwister.F = 1812433253;
    MersenneTwister.U = 11;
    MersenneTwister.S = 7;
    MersenneTwister.B = 0x9d2c5680;
    MersenneTwister.T = 15;
    MersenneTwister.C = 0xefc60000;
    MersenneTwister.L = 18;
    MersenneTwister.MASK_LOWER = Math.pow(2, MersenneTwister.R) - 1;
    MersenneTwister.MASK_UPPER = Math.pow(2, MersenneTwister.R);
    return MersenneTwister;
}());
function MersenneTwister$1 (seed) {
    return MersenneTwister.from(seed);
}

var XorShift128Plus = (function () {
    function XorShift128Plus(s01, s00, s11, s10) {
        this.s01 = s01;
        this.s00 = s00;
        this.s11 = s11;
        this.s10 = s10;
    }
    XorShift128Plus.prototype.min = function () {
        return -0x80000000;
    };
    XorShift128Plus.prototype.max = function () {
        return 0x7fffffff;
    };
    XorShift128Plus.prototype.next = function () {
        var a0 = this.s00 ^ (this.s00 << 23);
        var a1 = this.s01 ^ ((this.s01 << 23) | (this.s00 >>> 9));
        var b0 = a0 ^ this.s10 ^ ((a0 >>> 18) | (a1 << 14)) ^ ((this.s10 >>> 5) | (this.s11 << 27));
        var b1 = a1 ^ this.s11 ^ (a1 >>> 18) ^ (this.s11 >>> 5);
        return [(this.s00 + this.s10) | 0, new XorShift128Plus(this.s11, this.s10, b1, b0)];
    };
    XorShift128Plus.prototype.jump = function () {
        var rngRunner = this;
        var ns01 = 0;
        var ns00 = 0;
        var ns11 = 0;
        var ns10 = 0;
        var jump = [0x635d2dff, 0x8a5cd789, 0x5c472f96, 0x121fd215];
        for (var i = 0; i !== 4; ++i) {
            for (var mask = 1; mask; mask <<= 1) {
                if (jump[i] & mask) {
                    ns01 ^= rngRunner.s01;
                    ns00 ^= rngRunner.s00;
                    ns11 ^= rngRunner.s11;
                    ns10 ^= rngRunner.s10;
                }
                rngRunner = rngRunner.next()[1];
            }
        }
        return new XorShift128Plus(ns01, ns00, ns11, ns10);
    };
    return XorShift128Plus;
}());
var xorshift128plus = function (seed) {
    return new XorShift128Plus(-1, ~seed, seed | 0, 0);
};

var XoroShiro128Plus = (function () {
    function XoroShiro128Plus(s01, s00, s11, s10) {
        this.s01 = s01;
        this.s00 = s00;
        this.s11 = s11;
        this.s10 = s10;
    }
    XoroShiro128Plus.prototype.min = function () {
        return -0x80000000;
    };
    XoroShiro128Plus.prototype.max = function () {
        return 0x7fffffff;
    };
    XoroShiro128Plus.prototype.next = function () {
        var a0 = this.s10 ^ this.s00;
        var a1 = this.s11 ^ this.s01;
        var ns00 = (this.s00 << 24) ^ (this.s01 >>> 8) ^ a0 ^ (a0 << 16);
        var ns01 = (this.s01 << 24) ^ (this.s00 >>> 8) ^ a1 ^ ((a1 << 16) | (a0 >>> 16));
        var ns10 = (a1 << 5) ^ (a0 >>> 27);
        var ns11 = (a0 << 5) ^ (a1 >>> 27);
        return [(this.s00 + this.s10) | 0, new XoroShiro128Plus(ns01, ns00, ns11, ns10)];
    };
    XoroShiro128Plus.prototype.jump = function () {
        var rngRunner = this;
        var ns01 = 0;
        var ns00 = 0;
        var ns11 = 0;
        var ns10 = 0;
        var jump = [0xd8f554a5, 0xdf900294, 0x4b3201fc, 0x170865df];
        for (var i = 0; i !== 4; ++i) {
            for (var mask = 1; mask; mask <<= 1) {
                if (jump[i] & mask) {
                    ns01 ^= rngRunner.s01;
                    ns00 ^= rngRunner.s00;
                    ns11 ^= rngRunner.s11;
                    ns10 ^= rngRunner.s10;
                }
                rngRunner = rngRunner.next()[1];
            }
        }
        return new XoroShiro128Plus(ns01, ns00, ns11, ns10);
    };
    return XoroShiro128Plus;
}());
var xoroshiro128plus = function (seed) {
    return new XoroShiro128Plus(-1, ~seed, seed | 0, 0);
};

function addArrayIntToNew(arrayIntA, arrayIntB) {
    if (arrayIntA.sign !== arrayIntB.sign) {
        return substractArrayIntToNew(arrayIntA, { sign: -arrayIntB.sign, data: arrayIntB.data });
    }
    var data = [];
    var reminder = 0;
    var dataA = arrayIntA.data;
    var dataB = arrayIntB.data;
    for (var indexA = dataA.length - 1, indexB = dataB.length - 1; indexA >= 0 || indexB >= 0; --indexA, --indexB) {
        var vA = indexA >= 0 ? dataA[indexA] : 0;
        var vB = indexB >= 0 ? dataB[indexB] : 0;
        var current = vA + vB + reminder;
        data.push(current >>> 0);
        reminder = ~~(current / 0x100000000);
    }
    if (reminder !== 0) {
        data.push(reminder);
    }
    return { sign: arrayIntA.sign, data: data.reverse() };
}
function addOneToPositiveArrayInt(arrayInt) {
    arrayInt.sign = 1;
    var data = arrayInt.data;
    for (var index = data.length - 1; index >= 0; --index) {
        if (data[index] === 0xffffffff) {
            data[index] = 0;
        }
        else {
            data[index] += 1;
            return arrayInt;
        }
    }
    data.unshift(1);
    return arrayInt;
}
function isStrictlySmaller(dataA, dataB) {
    var maxLength = Math.max(dataA.length, dataB.length);
    for (var index = 0; index < maxLength; ++index) {
        var indexA = index + dataA.length - maxLength;
        var indexB = index + dataB.length - maxLength;
        var vA = indexA >= 0 ? dataA[indexA] : 0;
        var vB = indexB >= 0 ? dataB[indexB] : 0;
        if (vA < vB)
            return true;
        if (vA > vB)
            return false;
    }
    return false;
}
function substractArrayIntToNew(arrayIntA, arrayIntB) {
    if (arrayIntA.sign !== arrayIntB.sign) {
        return addArrayIntToNew(arrayIntA, { sign: -arrayIntB.sign, data: arrayIntB.data });
    }
    var dataA = arrayIntA.data;
    var dataB = arrayIntB.data;
    if (isStrictlySmaller(dataA, dataB)) {
        var out = substractArrayIntToNew(arrayIntB, arrayIntA);
        out.sign = -out.sign;
        return out;
    }
    var data = [];
    var reminder = 0;
    for (var indexA = dataA.length - 1, indexB = dataB.length - 1; indexA >= 0 || indexB >= 0; --indexA, --indexB) {
        var vA = indexA >= 0 ? dataA[indexA] : 0;
        var vB = indexB >= 0 ? dataB[indexB] : 0;
        var current = vA - vB - reminder;
        data.push(current >>> 0);
        reminder = current < 0 ? 1 : 0;
    }
    return { sign: arrayIntA.sign, data: data.reverse() };
}
function trimArrayIntInplace(arrayInt) {
    var data = arrayInt.data;
    var firstNonZero = 0;
    for (; firstNonZero !== data.length && data[firstNonZero] === 0; ++firstNonZero) { }
    if (firstNonZero === data.length) {
        arrayInt.sign = 1;
        arrayInt.data = [0];
        return arrayInt;
    }
    data.splice(0, firstNonZero);
    return arrayInt;
}
function fromNumberToArrayInt64(out, n) {
    if (n < 0) {
        var posN = -n;
        out.sign = -1;
        out.data[0] = ~~(posN / 0x100000000);
        out.data[1] = posN >>> 0;
    }
    else {
        out.sign = 1;
        out.data[0] = ~~(n / 0x100000000);
        out.data[1] = n >>> 0;
    }
    return out;
}
function substractArrayInt64(out, arrayIntA, arrayIntB) {
    var lowA = arrayIntA.data[1];
    var highA = arrayIntA.data[0];
    var signA = arrayIntA.sign;
    var lowB = arrayIntB.data[1];
    var highB = arrayIntB.data[0];
    var signB = arrayIntB.sign;
    out.sign = 1;
    if (signA === 1 && signB === -1) {
        var low_1 = lowA + lowB;
        var high = highA + highB + (low_1 > 0xffffffff ? 1 : 0);
        out.data[0] = high >>> 0;
        out.data[1] = low_1 >>> 0;
        return out;
    }
    var lowFirst = lowA;
    var highFirst = highA;
    var lowSecond = lowB;
    var highSecond = highB;
    if (signA === -1) {
        lowFirst = lowB;
        highFirst = highB;
        lowSecond = lowA;
        highSecond = highA;
    }
    var reminderLow = 0;
    var low = lowFirst - lowSecond;
    if (low < 0) {
        reminderLow = 1;
        low = low >>> 0;
    }
    out.data[0] = highFirst - highSecond - reminderLow;
    out.data[1] = low;
    return out;
}

function uniformIntDistributionInternal(rangeSize, rng) {
    var MinRng = rng.min();
    var NumValues = rng.max() - rng.min() + 1;
    if (rangeSize <= NumValues) {
        var nrng_1 = rng;
        var MaxAllowed = NumValues - (NumValues % rangeSize);
        while (true) {
            var out = nrng_1.next();
            var deltaV = out[0] - MinRng;
            nrng_1 = out[1];
            if (deltaV < MaxAllowed) {
                return [deltaV % rangeSize, nrng_1];
            }
        }
    }
    var FinalNumValues = NumValues * NumValues;
    var NumIterations = 2;
    while (FinalNumValues < rangeSize) {
        FinalNumValues *= NumValues;
        ++NumIterations;
    }
    var MaxAcceptedRandom = rangeSize * Math.floor((1 * FinalNumValues) / rangeSize);
    var nrng = rng;
    while (true) {
        var value = 0;
        for (var num = 0; num !== NumIterations; ++num) {
            var out = nrng.next();
            value = NumValues * value + (out[0] - MinRng);
            nrng = out[1];
        }
        if (value < MaxAcceptedRandom) {
            var inDiff = value - rangeSize * Math.floor((1 * value) / rangeSize);
            return [inDiff, nrng];
        }
    }
}

function uniformArrayIntDistributionInternal(out, rangeSize, rng) {
    var rangeLength = rangeSize.length;
    var nrng = rng;
    while (true) {
        for (var index = 0; index !== rangeLength; ++index) {
            var indexRangeSize = index === 0 ? rangeSize[0] + 1 : 0x100000000;
            var g = uniformIntDistributionInternal(indexRangeSize, nrng);
            out[index] = g[0];
            nrng = g[1];
        }
        for (var index = 0; index !== rangeLength; ++index) {
            var current = out[index];
            var currentInRange = rangeSize[index];
            if (current < currentInRange) {
                return [out, nrng];
            }
            else if (current > currentInRange) {
                break;
            }
        }
    }
}

function uniformArrayIntInternal(from, to, rng) {
    var rangeSize = trimArrayIntInplace(addOneToPositiveArrayInt(substractArrayIntToNew(to, from)));
    var emptyArrayIntData = rangeSize.data.slice(0);
    var g = uniformArrayIntDistributionInternal(emptyArrayIntData, rangeSize.data, rng);
    return [trimArrayIntInplace(addArrayIntToNew({ sign: 1, data: g[0] }, from)), g[1]];
}
function uniformArrayIntDistribution(from, to, rng) {
    if (rng != null) {
        return uniformArrayIntInternal(from, to, rng);
    }
    return function (rng) {
        return uniformArrayIntInternal(from, to, rng);
    };
}

function uniformBigIntInternal(from, diff, rng) {
    var MinRng = BigInt(rng.min());
    var NumValues = BigInt(rng.max() - rng.min() + 1);
    var FinalNumValues = NumValues;
    var NumIterations = BigInt(1);
    while (FinalNumValues < diff) {
        FinalNumValues *= NumValues;
        ++NumIterations;
    }
    var MaxAcceptedRandom = FinalNumValues - (FinalNumValues % diff);
    var nrng = rng;
    while (true) {
        var value = BigInt(0);
        for (var num = BigInt(0); num !== NumIterations; ++num) {
            var out = nrng.next();
            value = NumValues * value + (BigInt(out[0]) - MinRng);
            nrng = out[1];
        }
        if (value < MaxAcceptedRandom) {
            var inDiff = value % diff;
            return [inDiff + from, nrng];
        }
    }
}
function uniformBigIntDistribution(from, to, rng) {
    var diff = to - from + BigInt(1);
    if (rng != null) {
        return uniformBigIntInternal(from, diff, rng);
    }
    return function (rng) {
        return uniformBigIntInternal(from, diff, rng);
    };
}

var sharedA = { sign: 1, data: [0, 0] };
var sharedB = { sign: 1, data: [0, 0] };
var sharedC = { sign: 1, data: [0, 0] };
var sharedData = [0, 0];
function uniformLargeIntInternal(from, to, rangeSize, rng) {
    var rangeSizeArrayIntValue = rangeSize <= Number.MAX_SAFE_INTEGER
        ? fromNumberToArrayInt64(sharedC, rangeSize)
        : substractArrayInt64(sharedC, fromNumberToArrayInt64(sharedA, to), fromNumberToArrayInt64(sharedB, from));
    if (rangeSizeArrayIntValue.data[1] === 0xffffffff) {
        rangeSizeArrayIntValue.data[0] += 1;
        rangeSizeArrayIntValue.data[1] = 0;
    }
    else {
        rangeSizeArrayIntValue.data[1] += 1;
    }
    var g = uniformArrayIntDistributionInternal(sharedData, rangeSizeArrayIntValue.data, rng);
    return [sharedData[0] * 0x100000000 + sharedData[1] + from, g[1]];
}
function uniformIntInternal(from, to, rng) {
    var rangeSize = to - from;
    if (rangeSize <= 0xffffffff) {
        var g = uniformIntDistributionInternal(rangeSize + 1, rng);
        g[0] += from;
        return g;
    }
    return uniformLargeIntInternal(from, to, rangeSize, rng);
}
function uniformIntDistribution(from, to, rng) {
    if (rng != null) {
        return uniformIntInternal(from, to, rng);
    }
    return function (rng) {
        return uniformIntInternal(from, to, rng);
    };
}

var __type = 'module';
var __version = '4.1.2';
var __commitHash = '30bd5a9d5c20a1e998e489e3e00125edbc60b973';

var prand = /*#__PURE__*/Object.freeze({
    __proto__: null,
    __type: __type,
    __version: __version,
    __commitHash: __commitHash,
    generateN: generateN,
    skipN: skipN,
    congruential: congruential,
    congruential32: congruential32,
    mersenne: MersenneTwister$1,
    xorshift128plus: xorshift128plus,
    xoroshiro128plus: xoroshiro128plus,
    uniformArrayIntDistribution: uniformArrayIntDistribution,
    uniformBigIntDistribution: uniformBigIntDistribution,
    uniformIntDistribution: uniformIntDistribution
});

var VerbosityLevel;
(function (VerbosityLevel) {
    VerbosityLevel[VerbosityLevel["None"] = 0] = "None";
    VerbosityLevel[VerbosityLevel["Verbose"] = 1] = "Verbose";
    VerbosityLevel[VerbosityLevel["VeryVerbose"] = 2] = "VeryVerbose";
})(VerbosityLevel || (VerbosityLevel = {}));

class QualifiedParameters {
    constructor(op) {
        const p = op || {};
        this.seed = QualifiedParameters.readSeed(p);
        this.randomType = QualifiedParameters.readRandomType(p);
        this.numRuns = QualifiedParameters.readNumRuns(p);
        this.verbose = QualifiedParameters.readVerbose(p);
        this.maxSkipsPerRun = QualifiedParameters.readOrDefault(p, 'maxSkipsPerRun', 100);
        this.timeout = QualifiedParameters.readOrDefault(p, 'timeout', null);
        this.skipAllAfterTimeLimit = QualifiedParameters.readOrDefault(p, 'skipAllAfterTimeLimit', null);
        this.interruptAfterTimeLimit = QualifiedParameters.readOrDefault(p, 'interruptAfterTimeLimit', null);
        this.markInterruptAsFailure = QualifiedParameters.readBoolean(p, 'markInterruptAsFailure');
        this.skipEqualValues = QualifiedParameters.readBoolean(p, 'skipEqualValues');
        this.ignoreEqualValues = QualifiedParameters.readBoolean(p, 'ignoreEqualValues');
        this.logger = QualifiedParameters.readOrDefault(p, 'logger', (v) => {
            console.log(v);
        });
        this.path = QualifiedParameters.readOrDefault(p, 'path', '');
        this.unbiased = QualifiedParameters.readBoolean(p, 'unbiased');
        this.examples = QualifiedParameters.readOrDefault(p, 'examples', []);
        this.endOnFailure = QualifiedParameters.readBoolean(p, 'endOnFailure');
        this.reporter = QualifiedParameters.readOrDefault(p, 'reporter', null);
        this.asyncReporter = QualifiedParameters.readOrDefault(p, 'asyncReporter', null);
    }
    toParameters() {
        const orUndefined = (value) => (value !== null ? value : undefined);
        return {
            seed: this.seed,
            randomType: this.randomType,
            numRuns: this.numRuns,
            maxSkipsPerRun: this.maxSkipsPerRun,
            timeout: orUndefined(this.timeout),
            skipAllAfterTimeLimit: orUndefined(this.skipAllAfterTimeLimit),
            interruptAfterTimeLimit: orUndefined(this.interruptAfterTimeLimit),
            markInterruptAsFailure: this.markInterruptAsFailure,
            skipEqualValues: this.skipEqualValues,
            ignoreEqualValues: this.ignoreEqualValues,
            path: this.path,
            logger: this.logger,
            unbiased: this.unbiased,
            verbose: this.verbose,
            examples: this.examples,
            endOnFailure: this.endOnFailure,
            reporter: orUndefined(this.reporter),
            asyncReporter: orUndefined(this.asyncReporter),
        };
    }
    static read(op) {
        return new QualifiedParameters(op);
    }
}
QualifiedParameters.readSeed = (p) => {
    if (p.seed == null)
        return Date.now() ^ (Math.random() * 0x100000000);
    const seed32 = p.seed | 0;
    if (p.seed === seed32)
        return seed32;
    const gap = p.seed - seed32;
    return seed32 ^ (gap * 0x100000000);
};
QualifiedParameters.readRandomType = (p) => {
    if (p.randomType == null)
        return prand.xorshift128plus;
    if (typeof p.randomType === 'string') {
        switch (p.randomType) {
            case 'mersenne':
                return prand.mersenne;
            case 'congruential':
                return prand.congruential;
            case 'congruential32':
                return prand.congruential32;
            case 'xorshift128plus':
                return prand.xorshift128plus;
            case 'xoroshiro128plus':
                return prand.xoroshiro128plus;
            default:
                throw new Error(`Invalid random specified: '${p.randomType}'`);
        }
    }
    return p.randomType;
};
QualifiedParameters.readNumRuns = (p) => {
    const defaultValue = 100;
    if (p.numRuns != null)
        return p.numRuns;
    if (p.num_runs != null)
        return p.num_runs;
    return defaultValue;
};
QualifiedParameters.readVerbose = (p) => {
    if (p.verbose == null)
        return VerbosityLevel.None;
    if (typeof p.verbose === 'boolean') {
        return p.verbose === true ? VerbosityLevel.Verbose : VerbosityLevel.None;
    }
    if (p.verbose <= VerbosityLevel.None) {
        return VerbosityLevel.None;
    }
    if (p.verbose >= VerbosityLevel.VeryVerbose) {
        return VerbosityLevel.VeryVerbose;
    }
    return p.verbose | 0;
};
QualifiedParameters.readBoolean = (p, key) => p[key] === true;
QualifiedParameters.readOrDefault = (p, key, defaultValue) => {
    const value = p[key];
    return value != null ? value : defaultValue;
};

class SkipAfterProperty {
    constructor(property, getTime, timeLimit, interruptExecution) {
        this.property = property;
        this.getTime = getTime;
        this.interruptExecution = interruptExecution;
        this.isAsync = () => this.property.isAsync();
        this.generate = (mrng, runId) => this.property.generate(mrng, runId);
        this.run = (v) => {
            if (this.getTime() >= this.skipAfterTime) {
                const preconditionFailure = new PreconditionFailure(this.interruptExecution);
                if (this.isAsync()) {
                    return Promise.resolve(preconditionFailure);
                }
                else {
                    return preconditionFailure;
                }
            }
            return this.property.run(v);
        };
        this.skipAfterTime = this.getTime() + timeLimit;
    }
}

const timeoutAfter = (timeMs) => {
    let timeoutHandle = null;
    const promise = new Promise((resolve) => {
        timeoutHandle = setTimeout(() => {
            resolve(`Property timeout: exceeded limit of ${timeMs} milliseconds`);
        }, timeMs);
    });
    return {
        clear: () => clearTimeout(timeoutHandle),
        promise,
    };
};
class TimeoutProperty {
    constructor(property, timeMs) {
        this.property = property;
        this.timeMs = timeMs;
        this.isAsync = () => true;
    }
    generate(mrng, runId) {
        return this.property.generate(mrng, runId);
    }
    async run(v) {
        const t = timeoutAfter(this.timeMs);
        const propRun = Promise.race([this.property.run(v), t.promise]);
        propRun.then(t.clear, t.clear);
        return propRun;
    }
}

class UnbiasedProperty {
    constructor(property) {
        this.property = property;
        this.isAsync = () => this.property.isAsync();
        this.generate = (mrng, _runId) => this.property.generate(mrng);
        this.run = (v) => this.property.run(v);
    }
}

const findSymbolNameRegex = /^Symbol\((.*)\)$/;
function getSymbolDescription(s) {
    if (s.description !== undefined)
        return s.description;
    const m = findSymbolNameRegex.exec(String(s));
    return m && m[1].length ? m[1] : null;
}
function stringifyNumber(numValue) {
    switch (numValue) {
        case 0:
            return 1 / numValue === Number.NEGATIVE_INFINITY ? '-0' : '0';
        case Number.NEGATIVE_INFINITY:
            return 'Number.NEGATIVE_INFINITY';
        case Number.POSITIVE_INFINITY:
            return 'Number.POSITIVE_INFINITY';
        default:
            return numValue === numValue ? String(numValue) : 'Number.NaN';
    }
}
function isSparseArray(arr) {
    let previousNumberedIndex = -1;
    for (const index in arr) {
        const numberedIndex = Number(index);
        if (numberedIndex !== previousNumberedIndex + 1)
            return true;
        previousNumberedIndex = numberedIndex;
    }
    return previousNumberedIndex + 1 !== arr.length;
}
function stringifyInternal(value, previousValues) {
    const currentValues = previousValues.concat([value]);
    if (typeof value === 'object') {
        if (previousValues.indexOf(value) !== -1)
            return '[cyclic]';
    }
    switch (Object.prototype.toString.call(value)) {
        case '[object Array]': {
            const arr = value;
            if (arr.length >= 50 && isSparseArray(arr)) {
                const assignments = [];
                for (const index in arr) {
                    if (!Number.isNaN(Number(index)))
                        assignments.push(`${index}:${stringifyInternal(arr[index], currentValues)}`);
                }
                return assignments.length !== 0
                    ? `Object.assign(Array(${arr.length}),{${assignments.join(',')}})`
                    : `Array(${arr.length})`;
            }
            const stringifiedArray = arr.map((v) => stringifyInternal(v, currentValues)).join(',');
            return arr.length === 0 || arr.length - 1 in arr ? `[${stringifiedArray}]` : `[${stringifiedArray},]`;
        }
        case '[object BigInt]':
            return `${value}n`;
        case '[object Boolean]':
            return typeof value === 'boolean' ? JSON.stringify(value) : `new Boolean(${JSON.stringify(value)})`;
        case '[object Date]': {
            const d = value;
            return Number.isNaN(d.getTime()) ? `new Date(NaN)` : `new Date(${JSON.stringify(d.toISOString())})`;
        }
        case '[object Map]':
            return `new Map(${stringifyInternal(Array.from(value), currentValues)})`;
        case '[object Null]':
            return `null`;
        case '[object Number]':
            return typeof value === 'number' ? stringifyNumber(value) : `new Number(${stringifyNumber(Number(value))})`;
        case '[object Object]': {
            try {
                const toStringAccessor = value.toString;
                if (typeof toStringAccessor === 'function' && toStringAccessor !== Object.prototype.toString) {
                    return value.toString();
                }
            }
            catch (err) {
                return '[object Object]';
            }
            const mapper = (k) => `${k === '__proto__'
                ? '["__proto__"]'
                : typeof k === 'symbol'
                    ? `[${stringifyInternal(k, currentValues)}]`
                    : JSON.stringify(k)}:${stringifyInternal(value[k], currentValues)}`;
            const stringifiedProperties = [
                ...Object.keys(value).map(mapper),
                ...Object.getOwnPropertySymbols(value)
                    .filter((s) => {
                    const descriptor = Object.getOwnPropertyDescriptor(value, s);
                    return descriptor && descriptor.enumerable;
                })
                    .map(mapper),
            ];
            const rawRepr = '{' + stringifiedProperties.join(',') + '}';
            if (Object.getPrototypeOf(value) === null) {
                return rawRepr === '{}' ? 'Object.create(null)' : `Object.assign(Object.create(null),${rawRepr})`;
            }
            return rawRepr;
        }
        case '[object Set]':
            return `new Set(${stringifyInternal(Array.from(value), currentValues)})`;
        case '[object String]':
            return typeof value === 'string' ? JSON.stringify(value) : `new String(${JSON.stringify(value)})`;
        case '[object Symbol]': {
            const s = value;
            if (Symbol.keyFor(s) !== undefined) {
                return `Symbol.for(${JSON.stringify(Symbol.keyFor(s))})`;
            }
            const desc = getSymbolDescription(s);
            if (desc === null) {
                return 'Symbol()';
            }
            const knownSymbol = desc.startsWith('Symbol.') && Symbol[desc.substring(7)];
            return s === knownSymbol ? desc : `Symbol(${JSON.stringify(desc)})`;
        }
        case '[object Undefined]':
            return `undefined`;
        case '[object Int8Array]':
        case '[object Uint8Array]':
        case '[object Uint8ClampedArray]':
        case '[object Int16Array]':
        case '[object Uint16Array]':
        case '[object Int32Array]':
        case '[object Uint32Array]':
        case '[object Float32Array]':
        case '[object Float64Array]':
        case '[object BigInt64Array]':
        case '[object BigUint64Array]': {
            if (typeof Buffer !== 'undefined' && typeof Buffer.isBuffer === 'function' && Buffer.isBuffer(value)) {
                return `Buffer.from(${stringifyInternal(Array.from(value.values()), currentValues)})`;
            }
            const valuePrototype = Object.getPrototypeOf(value);
            const className = valuePrototype && valuePrototype.constructor && valuePrototype.constructor.name;
            if (typeof className === 'string') {
                const typedArray = value;
                const valuesFromTypedArr = typedArray.values();
                return `${className}.from(${stringifyInternal(Array.from(valuesFromTypedArr), currentValues)})`;
            }
            break;
        }
    }
    try {
        return value.toString();
    }
    catch (_a) {
        return Object.prototype.toString.call(value);
    }
}
function stringify(value) {
    return stringifyInternal(value, []);
}

function fromSyncCached(cachedValue) {
    return cachedValue === null ? new PreconditionFailure() : cachedValue;
}
function fromCached(...data) {
    if (data[1])
        return data[0].then(fromSyncCached);
    return fromSyncCached(data[0]);
}
function fromCachedUnsafe(cachedValue, isAsync) {
    return fromCached(cachedValue, isAsync);
}
class IgnoreEqualValuesProperty {
    constructor(property, skipRuns) {
        this.property = property;
        this.skipRuns = skipRuns;
        this.coveredCases = new Map();
        this.isAsync = () => this.property.isAsync();
        this.generate = (mrng, runId) => this.property.generate(mrng, runId);
        this.run = (v) => {
            const stringifiedValue = stringify(v);
            if (this.coveredCases.has(stringifiedValue)) {
                const lastOutput = this.coveredCases.get(stringifiedValue);
                if (!this.skipRuns) {
                    return lastOutput;
                }
                return fromCachedUnsafe(lastOutput, this.property.isAsync());
            }
            const out = this.property.run(v);
            this.coveredCases.set(stringifiedValue, out);
            return out;
        };
    }
}

function decorateProperty(rawProperty, qParams) {
    let prop = rawProperty;
    if (rawProperty.isAsync() && qParams.timeout != null) {
        prop = new TimeoutProperty(prop, qParams.timeout);
    }
    if (qParams.unbiased) {
        prop = new UnbiasedProperty(prop);
    }
    if (qParams.skipAllAfterTimeLimit != null) {
        prop = new SkipAfterProperty(prop, Date.now, qParams.skipAllAfterTimeLimit, false);
    }
    if (qParams.interruptAfterTimeLimit != null) {
        prop = new SkipAfterProperty(prop, Date.now, qParams.interruptAfterTimeLimit, true);
    }
    if (qParams.skipEqualValues) {
        prop = new IgnoreEqualValuesProperty(prop, true);
    }
    if (qParams.ignoreEqualValues) {
        prop = new IgnoreEqualValuesProperty(prop, false);
    }
    return prop;
}

var ExecutionStatus;
(function (ExecutionStatus) {
    ExecutionStatus[ExecutionStatus["Success"] = 0] = "Success";
    ExecutionStatus[ExecutionStatus["Skipped"] = -1] = "Skipped";
    ExecutionStatus[ExecutionStatus["Failure"] = 1] = "Failure";
})(ExecutionStatus || (ExecutionStatus = {}));

class RunExecution {
    constructor(verbosity, interruptedAsFailure) {
        this.verbosity = verbosity;
        this.interruptedAsFailure = interruptedAsFailure;
        this.isSuccess = () => this.pathToFailure == null;
        this.firstFailure = () => (this.pathToFailure ? +this.pathToFailure.split(':')[0] : -1);
        this.numShrinks = () => (this.pathToFailure ? this.pathToFailure.split(':').length - 1 : 0);
        this.rootExecutionTrees = [];
        this.currentLevelExecutionTrees = this.rootExecutionTrees;
        this.failure = null;
        this.numSkips = 0;
        this.numSuccesses = 0;
        this.interrupted = false;
    }
    appendExecutionTree(status, value) {
        const currentTree = { status, value, children: [] };
        this.currentLevelExecutionTrees.push(currentTree);
        return currentTree;
    }
    fail(value, id, message) {
        if (this.verbosity >= VerbosityLevel.Verbose) {
            const currentTree = this.appendExecutionTree(ExecutionStatus.Failure, value);
            this.currentLevelExecutionTrees = currentTree.children;
        }
        if (this.pathToFailure == null)
            this.pathToFailure = `${id}`;
        else
            this.pathToFailure += `:${id}`;
        this.value = value;
        this.failure = message;
    }
    skip(value) {
        if (this.verbosity >= VerbosityLevel.VeryVerbose) {
            this.appendExecutionTree(ExecutionStatus.Skipped, value);
        }
        if (this.pathToFailure == null) {
            ++this.numSkips;
        }
    }
    success(value) {
        if (this.verbosity >= VerbosityLevel.VeryVerbose) {
            this.appendExecutionTree(ExecutionStatus.Success, value);
        }
        if (this.pathToFailure == null) {
            ++this.numSuccesses;
        }
    }
    interrupt() {
        this.interrupted = true;
    }
    extractFailures() {
        if (this.isSuccess()) {
            return [];
        }
        const failures = [];
        let cursor = this.rootExecutionTrees;
        while (cursor.length > 0 && cursor[cursor.length - 1].status === ExecutionStatus.Failure) {
            const failureTree = cursor[cursor.length - 1];
            failures.push(failureTree.value);
            cursor = failureTree.children;
        }
        return failures;
    }
    toRunDetails(seed, basePath, maxSkips, qParams) {
        if (!this.isSuccess()) {
            return {
                failed: true,
                interrupted: this.interrupted,
                numRuns: this.firstFailure() + 1 - this.numSkips,
                numSkips: this.numSkips,
                numShrinks: this.numShrinks(),
                seed,
                counterexample: this.value,
                counterexamplePath: RunExecution.mergePaths(basePath, this.pathToFailure),
                error: this.failure,
                failures: this.extractFailures(),
                executionSummary: this.rootExecutionTrees,
                verbose: this.verbosity,
                runConfiguration: qParams.toParameters(),
            };
        }
        const failed = this.numSkips > maxSkips || (this.interrupted && this.interruptedAsFailure);
        return {
            failed,
            interrupted: this.interrupted,
            numRuns: this.numSuccesses,
            numSkips: this.numSkips,
            numShrinks: 0,
            seed,
            counterexample: null,
            counterexamplePath: null,
            error: null,
            failures: [],
            executionSummary: this.rootExecutionTrees,
            verbose: this.verbosity,
            runConfiguration: qParams.toParameters(),
        };
    }
}
RunExecution.mergePaths = (offsetPath, path) => {
    if (offsetPath.length === 0)
        return path;
    const offsetItems = offsetPath.split(':');
    const remainingItems = path.split(':');
    const middle = +offsetItems[offsetItems.length - 1] + +remainingItems[0];
    return [...offsetItems.slice(0, offsetItems.length - 1), `${middle}`, ...remainingItems.slice(1)].join(':');
};

class RunnerIterator {
    constructor(sourceValues, verbose, interruptedAsFailure) {
        this.sourceValues = sourceValues;
        this.runExecution = new RunExecution(verbose, interruptedAsFailure);
        this.currentIdx = -1;
        this.nextValues = sourceValues;
    }
    [Symbol.iterator]() {
        return this;
    }
    next() {
        const nextValue = this.nextValues.next();
        if (nextValue.done || this.runExecution.interrupted) {
            return { done: true, value: undefined };
        }
        this.currentShrinkable = nextValue.value;
        ++this.currentIdx;
        return { done: false, value: nextValue.value.value_ };
    }
    handleResult(result) {
        if (result != null && typeof result === 'string') {
            this.runExecution.fail(this.currentShrinkable.value_, this.currentIdx, result);
            this.currentIdx = -1;
            this.nextValues = this.currentShrinkable.shrink();
        }
        else if (result != null) {
            if (!result.interruptExecution) {
                this.runExecution.skip(this.currentShrinkable.value_);
                this.sourceValues.skippedOne();
            }
            else {
                this.runExecution.interrupt();
            }
        }
        else {
            this.runExecution.success(this.currentShrinkable.value_);
        }
    }
}

class SourceValuesIterator {
    constructor(initialValues, maxInitialIterations, remainingSkips) {
        this.initialValues = initialValues;
        this.maxInitialIterations = maxInitialIterations;
        this.remainingSkips = remainingSkips;
    }
    [Symbol.iterator]() {
        return this;
    }
    next() {
        if (--this.maxInitialIterations !== -1 && this.remainingSkips >= 0) {
            const n = this.initialValues.next();
            if (!n.done)
                return { value: n.value(), done: false };
        }
        return { value: undefined, done: true };
    }
    skippedOne() {
        --this.remainingSkips;
        ++this.maxInitialIterations;
    }
}

class Random {
    constructor(internalRng) {
        this.internalRng = internalRng;
    }
    clone() {
        return new Random(this.internalRng);
    }
    uniformIn(rangeMin, rangeMax) {
        const g = uniformIntDistribution(rangeMin, rangeMax, this.internalRng);
        this.internalRng = g[1];
        return g[0];
    }
    next(bits) {
        return this.uniformIn(0, (1 << bits) - 1);
    }
    nextBoolean() {
        return this.uniformIn(0, 1) === 1;
    }
    nextInt(min, max) {
        return this.uniformIn(min == null ? Random.MIN_INT : min, max == null ? Random.MAX_INT : max);
    }
    nextBigInt(min, max) {
        const g = uniformBigIntDistribution(min, max, this.internalRng);
        this.internalRng = g[1];
        return g[0];
    }
    nextArrayInt(min, max) {
        const g = uniformArrayIntDistribution(min, max, this.internalRng);
        this.internalRng = g[1];
        return g[0];
    }
    nextDouble() {
        const a = this.next(26);
        const b = this.next(27);
        return (a * Random.DBL_FACTOR + b) * Random.DBL_DIVISOR;
    }
}
Random.MIN_INT = 0x80000000 | 0;
Random.MAX_INT = 0x7fffffff | 0;
Random.DBL_FACTOR = Math.pow(2, 27);
Random.DBL_DIVISOR = Math.pow(2, -53);

function lazyGenerate(generator, rng, idx) {
    return () => generator.generate(new Random(rng), idx);
}
function* toss(generator, seed, random, examples) {
    yield* examples.map((e) => () => new Shrinkable(e));
    let idx = 0;
    let rng = random(seed);
    for (;;) {
        rng = rng.jump ? rng.jump() : skipN(rng, 42);
        yield lazyGenerate(generator, rng, idx++);
    }
}

function pathWalk(path, initialValues) {
    let values = stream(initialValues);
    const segments = path.split(':').map((text) => +text);
    if (segments.length === 0)
        return values;
    if (!segments.every((v) => !Number.isNaN(v))) {
        throw new Error(`Unable to replay, got invalid path=${path}`);
    }
    values = values.drop(segments[0]);
    for (const s of segments.slice(1)) {
        const valueToShrink = values.getNthOrLast(0);
        if (valueToShrink == null) {
            throw new Error(`Unable to replay, got wrong path=${path}`);
        }
        values = valueToShrink.shrink().drop(s);
    }
    return values;
}

function formatHints(hints) {
    if (hints.length === 1) {
        return `Hint: ${hints[0]}`;
    }
    return hints.map((h, idx) => `Hint (${idx + 1}): ${h}`).join('\n');
}
function formatFailures(failures) {
    return `Encountered failures were:\n- ${failures.map(stringify).join('\n- ')}`;
}
function formatExecutionSummary(executionTrees) {
    const summaryLines = [];
    const remainingTreesAndDepth = [];
    for (const tree of executionTrees.reverse()) {
        remainingTreesAndDepth.push({ depth: 1, tree });
    }
    while (remainingTreesAndDepth.length !== 0) {
        const currentTreeAndDepth = remainingTreesAndDepth.pop();
        const currentTree = currentTreeAndDepth.tree;
        const currentDepth = currentTreeAndDepth.depth;
        const statusIcon = currentTree.status === ExecutionStatus.Success
            ? '\x1b[32m\u221A\x1b[0m'
            : currentTree.status === ExecutionStatus.Failure
                ? '\x1b[31m\xD7\x1b[0m'
                : '\x1b[33m!\x1b[0m';
        const leftPadding = Array(currentDepth).join('. ');
        summaryLines.push(`${leftPadding}${statusIcon} ${stringify(currentTree.value)}`);
        for (const tree of currentTree.children.reverse()) {
            remainingTreesAndDepth.push({ depth: currentDepth + 1, tree });
        }
    }
    return `Execution summary:\n${summaryLines.join('\n')}`;
}
function preFormatTooManySkipped(out) {
    const message = `Failed to run property, too many pre-condition failures encountered\n{ seed: ${out.seed} }\n\nRan ${out.numRuns} time(s)\nSkipped ${out.numSkips} time(s)`;
    let details = null;
    const hints = [
        'Try to reduce the number of rejected values by combining map, flatMap and built-in arbitraries',
        'Increase failure tolerance by setting maxSkipsPerRun to an higher value',
    ];
    if (out.verbose >= VerbosityLevel.VeryVerbose) {
        details = formatExecutionSummary(out.executionSummary);
    }
    else {
        hints.push('Enable verbose mode at level VeryVerbose in order to check all generated values and their associated status');
    }
    return { message, details, hints };
}
function preFormatFailure(out) {
    const message = `Property failed after ${out.numRuns} tests\n{ seed: ${out.seed}, path: "${out.counterexamplePath}", endOnFailure: true }\nCounterexample: ${stringify(out.counterexample)}\nShrunk ${out.numShrinks} time(s)\nGot error: ${out.error}`;
    let details = null;
    const hints = [];
    if (out.verbose >= VerbosityLevel.VeryVerbose) {
        details = formatExecutionSummary(out.executionSummary);
    }
    else if (out.verbose === VerbosityLevel.Verbose) {
        details = formatFailures(out.failures);
    }
    else {
        hints.push('Enable verbose mode in order to have the list of all failing values encountered during the run');
    }
    return { message, details, hints };
}
function preFormatEarlyInterrupted(out) {
    const message = `Property interrupted after ${out.numRuns} tests\n{ seed: ${out.seed} }`;
    let details = null;
    const hints = [];
    if (out.verbose >= VerbosityLevel.VeryVerbose) {
        details = formatExecutionSummary(out.executionSummary);
    }
    else {
        hints.push('Enable verbose mode at level VeryVerbose in order to check all generated values and their associated status');
    }
    return { message, details, hints };
}
function defaultReportMessage(out) {
    if (!out.failed)
        return;
    const { message, details, hints } = out.counterexamplePath === null
        ? out.interrupted
            ? preFormatEarlyInterrupted(out)
            : preFormatTooManySkipped(out)
        : preFormatFailure(out);
    let errorMessage = message;
    if (details != null)
        errorMessage += `\n\n${details}`;
    if (hints.length > 0)
        errorMessage += `\n\n${formatHints(hints)}`;
    return errorMessage;
}
function throwIfFailed(out) {
    if (!out.failed)
        return;
    throw new Error(defaultReportMessage(out));
}
function reportRunDetails(out) {
    if (out.runConfiguration.asyncReporter)
        return out.runConfiguration.asyncReporter(out);
    else if (out.runConfiguration.reporter)
        return out.runConfiguration.reporter(out);
    else
        return throwIfFailed(out);
}

function runIt(property, sourceValues, verbose, interruptedAsFailure) {
    const runner = new RunnerIterator(sourceValues, verbose, interruptedAsFailure);
    for (const v of runner) {
        const out = property.run(v);
        runner.handleResult(out);
    }
    return runner.runExecution;
}
async function asyncRunIt(property, sourceValues, verbose, interruptedAsFailure) {
    const runner = new RunnerIterator(sourceValues, verbose, interruptedAsFailure);
    for (const v of runner) {
        const out = await property.run(v);
        runner.handleResult(out);
    }
    return runner.runExecution;
}
function runnerPathWalker(valueProducers, path) {
    const pathPoints = path.split(':');
    const pathStream = stream(valueProducers)
        .drop(pathPoints.length > 0 ? +pathPoints[0] : 0)
        .map((producer) => producer());
    const adaptedPath = ['0', ...pathPoints.slice(1)].join(':');
    return stream(pathWalk(adaptedPath, pathStream)).map((v) => () => v);
}
function buildInitialValues(valueProducers, qParams) {
    const rawValues = qParams.path.length === 0 ? stream(valueProducers) : runnerPathWalker(valueProducers, qParams.path);
    if (!qParams.endOnFailure)
        return rawValues;
    return rawValues.map((shrinkableGen) => {
        return () => {
            const s = shrinkableGen();
            return new Shrinkable(s.value_);
        };
    });
}
function check(rawProperty, params) {
    if (rawProperty == null || rawProperty.generate == null)
        throw new Error('Invalid property encountered, please use a valid property');
    if (rawProperty.run == null)
        throw new Error('Invalid property encountered, please use a valid property not an arbitrary');
    const qParams = QualifiedParameters.read(Object.assign(Object.assign({}, readConfigureGlobal()), params));
    if (qParams.reporter !== null && qParams.asyncReporter !== null)
        throw new Error('Invalid parameters encountered, reporter and asyncReporter cannot be specified together');
    if (qParams.asyncReporter !== null && !rawProperty.isAsync())
        throw new Error('Invalid parameters encountered, only asyncProperty can be used when asyncReporter specified');
    const property = decorateProperty(rawProperty, qParams);
    const generator = toss(property, qParams.seed, qParams.randomType, qParams.examples);
    const maxInitialIterations = qParams.path.indexOf(':') === -1 ? qParams.numRuns : -1;
    const maxSkips = qParams.numRuns * qParams.maxSkipsPerRun;
    const initialValues = buildInitialValues(generator, qParams);
    const sourceValues = new SourceValuesIterator(initialValues, maxInitialIterations, maxSkips);
    return property.isAsync()
        ? asyncRunIt(property, sourceValues, qParams.verbose, qParams.markInterruptAsFailure).then((e) => e.toRunDetails(qParams.seed, qParams.path, maxSkips, qParams))
        : runIt(property, sourceValues, qParams.verbose, qParams.markInterruptAsFailure).toRunDetails(qParams.seed, qParams.path, maxSkips, qParams);
}
function assert(property, params) {
    const out = check(property, params);
    if (property.isAsync())
        return out.then(reportRunDetails);
    else
        reportRunDetails(out);
}

function toProperty(generator, qParams) {
    const prop = !Object.prototype.hasOwnProperty.call(generator, 'isAsync')
        ? new Property(generator, () => true)
        : generator;
    return qParams.unbiased === true ? new UnbiasedProperty(prop) : prop;
}
function streamSample(generator, params) {
    const extendedParams = typeof params === 'number'
        ? Object.assign(Object.assign({}, readConfigureGlobal()), { numRuns: params }) : Object.assign(Object.assign({}, readConfigureGlobal()), params);
    const qParams = QualifiedParameters.read(extendedParams);
    const tossedValues = stream(toss(toProperty(generator, qParams), qParams.seed, qParams.randomType, qParams.examples));
    if (qParams.path.length === 0) {
        return tossedValues.take(qParams.numRuns).map((s) => s().value_);
    }
    return stream(pathWalk(qParams.path, tossedValues.map((s) => s())))
        .take(qParams.numRuns)
        .map((s) => s.value_);
}
function sample(generator, params) {
    return [...streamSample(generator, params)];
}
function statistics(generator, classify, params) {
    const extendedParams = typeof params === 'number'
        ? Object.assign(Object.assign({}, readConfigureGlobal()), { numRuns: params }) : Object.assign(Object.assign({}, readConfigureGlobal()), params);
    const qParams = QualifiedParameters.read(extendedParams);
    const recorded = {};
    for (const g of streamSample(generator, params)) {
        const out = classify(g);
        const categories = Array.isArray(out) ? out : [out];
        for (const c of categories) {
            recorded[c] = (recorded[c] || 0) + 1;
        }
    }
    const data = Object.entries(recorded)
        .sort((a, b) => b[1] - a[1])
        .map((i) => [i[0], `${((i[1] * 100.0) / qParams.numRuns).toFixed(2)}%`]);
    const longestName = data.map((i) => i[0].length).reduce((p, c) => Math.max(p, c), 0);
    const longestPercent = data.map((i) => i[1].length).reduce((p, c) => Math.max(p, c), 0);
    for (const item of data) {
        qParams.logger(`${item[0].padEnd(longestName, '.')}..${item[1].padStart(longestPercent, '.')}`);
    }
}

class BiasedArbitraryWrapper extends Arbitrary {
    constructor(freq, arb, biasedArbBuilder) {
        super();
        this.freq = freq;
        this.arb = arb;
        this.biasedArbBuilder = biasedArbBuilder;
    }
    generate(mrng) {
        return mrng.nextInt(1, this.freq) === 1 ? this.biasedArbBuilder(this.arb).generate(mrng) : this.arb.generate(mrng);
    }
}
function biasWrapper(freq, arb, biasedArbBuilder) {
    return new BiasedArbitraryWrapper(freq, arb, biasedArbBuilder);
}

function removeContextFromContextualValue(contextualValue) {
    return contextualValue[0];
}
class ArbitraryWithContextualShrink extends Arbitrary {
    contextualShrinkableFor(value, context) {
        return new Shrinkable(value, () => this.contextualShrink(value, context).map((contextualValue) => this.contextualShrinkableFor(contextualValue[0], contextualValue[1])));
    }
    shrink(value, shrunkOnce) {
        const context = shrunkOnce === true ? this.shrunkOnceContext() : undefined;
        return this.contextualShrink(value, context).map(removeContextFromContextualValue);
    }
    shrinkableFor(value, shrunkOnce) {
        return new Shrinkable(value, () => {
            return this.shrink(value, shrunkOnce).map((value) => this.shrinkableFor(value, true));
        });
    }
}

class BiasedNumericArbitrary extends Arbitrary {
    constructor(arbCloseToZero, ...arbs) {
        super();
        this.arbCloseToZero = arbCloseToZero;
        this.arbs = arbs;
    }
    generate(mrng) {
        const id = mrng.nextInt(-2 * this.arbs.length, this.arbs.length - 1);
        return id < 0 ? this.arbCloseToZero.generate(mrng) : this.arbs[id].generate(mrng);
    }
}
function biasNumeric(min, max, Ctor, logLike) {
    if (min === max) {
        return new Ctor(min, max, min, max);
    }
    if (min < 0 && max > 0) {
        const logMin = logLike(-min);
        const logMax = logLike(max);
        return new BiasedNumericArbitrary(new Ctor(min, max, -logMin, logMax), new Ctor(min, max, (max - logMax), max), new Ctor(min, max, min, min + logMin));
    }
    const logGap = logLike((max - min));
    const arbCloseToMin = new Ctor(min, max, min, min + logGap);
    const arbCloseToMax = new Ctor(min, max, (max - logGap), max);
    return min < 0
        ? new BiasedNumericArbitrary(arbCloseToMax, arbCloseToMin)
        : new BiasedNumericArbitrary(arbCloseToMin, arbCloseToMax);
}
function integerLogLike(v) {
    return Math.floor(Math.log(v) / Math.log(2));
}
function bigIntLogLike(v) {
    if (v === BigInt(0))
        return BigInt(0);
    return BigInt(v.toString().length);
}

function halvePosInteger(n) {
    return Math.floor(n / 2);
}
function halveNegInteger(n) {
    return Math.ceil(n / 2);
}
function shrinkInteger(current, target, tryTargetAsap) {
    const realGap = current - target;
    function* shrinkDecr() {
        let previous = tryTargetAsap ? undefined : target;
        const gap = tryTargetAsap ? realGap : halvePosInteger(realGap);
        for (let toremove = gap; toremove > 0; toremove = halvePosInteger(toremove)) {
            const next = current - toremove;
            yield [next, previous];
            previous = next;
        }
    }
    function* shrinkIncr() {
        let previous = tryTargetAsap ? undefined : target;
        const gap = tryTargetAsap ? realGap : halveNegInteger(realGap);
        for (let toremove = gap; toremove < 0; toremove = halveNegInteger(toremove)) {
            const next = current - toremove;
            yield [next, previous];
            previous = next;
        }
    }
    return realGap > 0 ? stream(shrinkDecr()) : stream(shrinkIncr());
}

class IntegerArbitrary extends ArbitraryWithContextualShrink {
    constructor(min, max, genMin, genMax) {
        super();
        this.min = min;
        this.max = max;
        this.genMin = genMin;
        this.genMax = genMax;
        this.biasedIntegerArbitrary = null;
    }
    wrapper(value, context) {
        return new Shrinkable(value, () => this.contextualShrink(value, context).map(([v, nextContext]) => this.wrapper(v, nextContext)));
    }
    generate(mrng) {
        return this.wrapper(mrng.nextInt(this.genMin, this.genMax), undefined);
    }
    contextualShrink(current, context) {
        if (current === 0) {
            return Stream.nil();
        }
        if (!IntegerArbitrary.isValidContext(current, context)) {
            const target = this.defaultTarget();
            return shrinkInteger(current, target, true);
        }
        if (this.isLastChanceTry(current, context)) {
            return Stream.of([context, undefined]);
        }
        return shrinkInteger(current, context, false);
    }
    shrunkOnceContext() {
        return this.defaultTarget();
    }
    defaultTarget() {
        if (this.min <= 0 && this.max >= 0) {
            return 0;
        }
        return this.min < 0 ? this.max : this.min;
    }
    isLastChanceTry(current, context) {
        if (current > 0)
            return current === context + 1 && current > this.min;
        if (current < 0)
            return current === context - 1 && current < this.max;
        return false;
    }
    static isValidContext(current, context) {
        if (context === undefined) {
            return false;
        }
        if (typeof context !== 'number') {
            throw new Error(`Invalid context type passed to IntegerArbitrary (#1)`);
        }
        if (context !== 0 && Math.sign(current) !== Math.sign(context)) {
            throw new Error(`Invalid context value passed to IntegerArbitrary (#2)`);
        }
        return true;
    }
    pureBiasedArbitrary() {
        if (this.biasedIntegerArbitrary != null) {
            return this.biasedIntegerArbitrary;
        }
        this.biasedIntegerArbitrary = biasNumeric(this.min, this.max, IntegerArbitrary, integerLogLike);
        return this.biasedIntegerArbitrary;
    }
    withBias(freq) {
        return biasWrapper(freq, this, (originalArbitrary) => originalArbitrary.pureBiasedArbitrary());
    }
}
IntegerArbitrary.MIN_INT = 0x80000000 | 0;
IntegerArbitrary.MAX_INT = 0x7fffffff | 0;
function buildCompleteIntegerConstraints(constraints) {
    const min = constraints.min !== undefined ? constraints.min : IntegerArbitrary.MIN_INT;
    const max = constraints.max !== undefined ? constraints.max : IntegerArbitrary.MAX_INT;
    return { min, max };
}
function extractIntegerConstraints(args) {
    if (args[0] === undefined) {
        return {};
    }
    if (args[1] === undefined) {
        const sargs = args;
        if (typeof sargs[0] === 'number')
            return { max: sargs[0] };
        return sargs[0];
    }
    const sargs = args;
    return { min: sargs[0], max: sargs[1] };
}
function integer(...args) {
    const constraints = buildCompleteIntegerConstraints(extractIntegerConstraints(args));
    if (constraints.min > constraints.max) {
        throw new Error('fc.integer maximum value should be equal or greater than the minimum one');
    }
    return new IntegerArbitrary(constraints.min, constraints.max, constraints.min, constraints.max);
}
function maxSafeInteger() {
    return integer(Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
}
function nat(arg) {
    const max = typeof arg === 'number' ? arg : arg && arg.max !== undefined ? arg.max : IntegerArbitrary.MAX_INT;
    if (max < 0) {
        throw new Error('fc.nat value should be greater than or equal to 0');
    }
    return new IntegerArbitrary(0, max, 0, max);
}
function maxSafeNat() {
    return nat(Number.MAX_SAFE_INTEGER);
}

class LazyIterableIterator {
    constructor(producer) {
        this.producer = producer;
    }
    [Symbol.iterator]() {
        if (this.it === undefined) {
            this.it = this.producer();
        }
        return this.it;
    }
    next() {
        if (this.it === undefined) {
            this.it = this.producer();
        }
        return this.it.next();
    }
}
function makeLazy(producer) {
    return new LazyIterableIterator(producer);
}

function subArrayContains(tab, upperBound, includeValue) {
    for (let idx = 0; idx < upperBound; ++idx) {
        if (includeValue(tab[idx]))
            return true;
    }
    return false;
}
function swap(tab, idx1, idx2) {
    const temp = tab[idx1];
    tab[idx1] = tab[idx2];
    tab[idx2] = temp;
}
function buildCompareFilter(compare) {
    return (tab) => {
        let finalLength = tab.length;
        for (let idx = tab.length - 1; idx !== -1; --idx) {
            if (subArrayContains(tab, idx, (t) => compare(t.value_, tab[idx].value_))) {
                --finalLength;
                swap(tab, idx, finalLength);
            }
        }
        return tab.slice(0, finalLength);
    };
}

class ArrayArbitrary extends Arbitrary {
    constructor(arb, minLength, maxLength, isEqual) {
        super();
        this.arb = arb;
        this.minLength = minLength;
        this.maxLength = maxLength;
        this.isEqual = isEqual;
        this.lengthArb = integer(minLength, maxLength);
        this.preFilter = this.isEqual !== undefined ? buildCompareFilter(this.isEqual) : (tab) => tab;
    }
    static makeItCloneable(vs, shrinkables) {
        vs[cloneMethod] = () => {
            const cloned = [];
            for (let idx = 0; idx !== shrinkables.length; ++idx) {
                cloned.push(shrinkables[idx].value);
            }
            this.makeItCloneable(cloned, shrinkables);
            return cloned;
        };
        return vs;
    }
    canAppendItem(items, newItem) {
        if (this.isEqual === undefined) {
            return true;
        }
        for (let idx = 0; idx !== items.length; ++idx) {
            if (this.isEqual(items[idx].value_, newItem.value_)) {
                return false;
            }
        }
        return true;
    }
    wrapper(itemsRaw, shrunkOnce, itemsRawLengthContext) {
        const items = shrunkOnce ? this.preFilter(itemsRaw) : itemsRaw;
        let cloneable = false;
        const vs = [];
        for (let idx = 0; idx !== items.length; ++idx) {
            const s = items[idx];
            cloneable = cloneable || s.hasToBeCloned;
            vs.push(s.value);
        }
        if (cloneable) {
            ArrayArbitrary.makeItCloneable(vs, items);
        }
        const itemsLengthContext = itemsRaw.length === items.length && itemsRawLengthContext !== undefined
            ? itemsRawLengthContext
            : shrunkOnce
                ? this.lengthArb.shrunkOnceContext()
                : undefined;
        return new Shrinkable(vs, () => this.shrinkImpl(items, itemsLengthContext).map((contextualValue) => this.wrapper(contextualValue[0], true, contextualValue[1])));
    }
    generate(mrng) {
        const targetSizeShrinkable = this.lengthArb.generate(mrng);
        const targetSize = targetSizeShrinkable.value;
        let numSkippedInRow = 0;
        const items = [];
        while (items.length < targetSize && numSkippedInRow < this.maxLength) {
            const current = this.arb.generate(mrng);
            if (this.canAppendItem(items, current)) {
                numSkippedInRow = 0;
                items.push(current);
            }
            else {
                numSkippedInRow += 1;
            }
        }
        return this.wrapper(items, false, undefined);
    }
    shrinkImpl(items, itemsLengthContext) {
        if (items.length === 0) {
            return Stream.nil();
        }
        return (this.lengthArb
            .contextualShrink(items.length, itemsLengthContext)
            .map((contextualValue) => {
            return [
                items.slice(items.length - contextualValue[0]),
                contextualValue[1],
            ];
        })
            .join(items[0].shrink().map((v) => [[v].concat(items.slice(1)), undefined]))
            .join(items.length > this.minLength
            ? makeLazy(() => this.shrinkImpl(items.slice(1), undefined)
                .filter((contextualValue) => this.minLength <= contextualValue[0].length + 1)
                .map((contextualValue) => [[items[0]].concat(contextualValue[0]), undefined]))
            : Stream.nil()));
    }
    withBias(freq) {
        return biasWrapper(freq, this, (originalArbitrary) => {
            const lowBiased = new ArrayArbitrary(originalArbitrary.arb.withBias(freq), originalArbitrary.minLength, originalArbitrary.maxLength, originalArbitrary.isEqual);
            const highBiasedArbBuilder = () => {
                return originalArbitrary.minLength !== originalArbitrary.maxLength
                    ? new ArrayArbitrary(originalArbitrary.arb.withBias(freq), originalArbitrary.minLength, originalArbitrary.minLength +
                        Math.floor(Math.log(originalArbitrary.maxLength - originalArbitrary.minLength) / Math.log(2)), originalArbitrary.isEqual)
                    : new ArrayArbitrary(originalArbitrary.arb.withBias(freq), originalArbitrary.minLength, originalArbitrary.maxLength, originalArbitrary.isEqual);
            };
            return biasWrapper(freq, lowBiased, highBiasedArbBuilder);
        });
    }
}
function maxLengthFromMinLength(minLength) {
    return 2 * minLength + 10;
}
function array(arb, ...args) {
    if (args[0] === undefined)
        return new ArrayArbitrary(arb, 0, maxLengthFromMinLength(0));
    if (typeof args[0] === 'object') {
        const minLength = args[0].minLength || 0;
        const specifiedMaxLength = args[0].maxLength;
        const maxLength = specifiedMaxLength !== undefined ? specifiedMaxLength : maxLengthFromMinLength(minLength);
        return new ArrayArbitrary(arb, minLength, maxLength);
    }
    if (args[1] !== undefined)
        return new ArrayArbitrary(arb, args[0], args[1]);
    return new ArrayArbitrary(arb, 0, args[0]);
}

function halveBigInt(n) {
    return n / BigInt(2);
}
function shrinkBigInt(current, target, tryTargetAsap) {
    const realGap = current - target;
    function* shrinkDecr() {
        let previous = tryTargetAsap ? undefined : target;
        const gap = tryTargetAsap ? realGap : halveBigInt(realGap);
        for (let toremove = gap; toremove > 0; toremove = halveBigInt(toremove)) {
            const next = current - toremove;
            yield [next, previous];
            previous = next;
        }
    }
    function* shrinkIncr() {
        let previous = tryTargetAsap ? undefined : target;
        const gap = tryTargetAsap ? realGap : halveBigInt(realGap);
        for (let toremove = gap; toremove < 0; toremove = halveBigInt(toremove)) {
            const next = current - toremove;
            yield [next, previous];
            previous = next;
        }
    }
    return realGap > 0 ? stream(shrinkDecr()) : stream(shrinkIncr());
}

class BigIntArbitrary extends ArbitraryWithContextualShrink {
    constructor(min, max, genMin, genMax) {
        super();
        this.min = min;
        this.max = max;
        this.genMin = genMin;
        this.genMax = genMax;
        this.biasedBigIntArbitrary = null;
    }
    wrapper(value, context) {
        return new Shrinkable(value, () => this.contextualShrink(value, context).map(([v, nextContext]) => this.wrapper(v, nextContext)));
    }
    generate(mrng) {
        return this.wrapper(mrng.nextBigInt(this.genMin, this.genMax), undefined);
    }
    contextualShrink(current, context) {
        if (current === BigInt(0)) {
            return Stream.nil();
        }
        if (!BigIntArbitrary.isValidContext(current, context)) {
            const target = this.defaultTarget();
            return shrinkBigInt(current, target, true);
        }
        if (this.isLastChanceTry(current, context)) {
            return Stream.of([context, undefined]);
        }
        return shrinkBigInt(current, context, false);
    }
    shrunkOnceContext() {
        return this.defaultTarget();
    }
    defaultTarget() {
        if (this.min <= 0 && this.max >= 0) {
            return BigInt(0);
        }
        return this.min < 0 ? this.max : this.min;
    }
    isLastChanceTry(current, context) {
        if (current > 0)
            return current === context + BigInt(1) && current > this.min;
        if (current < 0)
            return current === context - BigInt(1) && current < this.max;
        return false;
    }
    static isValidContext(current, context) {
        if (context === undefined) {
            return false;
        }
        if (typeof context !== 'bigint') {
            throw new Error(`Invalid context type passed to BigIntArbitrary (#1)`);
        }
        const differentSigns = (current > 0 && context < 0) || (current < 0 && context > 0);
        if (context !== BigInt(0) && differentSigns) {
            throw new Error(`Invalid context value passed to BigIntArbitrary (#2)`);
        }
        return true;
    }
    pureBiasedArbitrary() {
        if (this.biasedBigIntArbitrary != null) {
            return this.biasedBigIntArbitrary;
        }
        this.biasedBigIntArbitrary = biasNumeric(this.min, this.max, BigIntArbitrary, bigIntLogLike);
        return this.biasedBigIntArbitrary;
    }
    withBias(freq) {
        return biasWrapper(freq, this, (originalArbitrary) => originalArbitrary.pureBiasedArbitrary());
    }
}
function bigIntN(n) {
    const min = BigInt(-1) << BigInt(n - 1);
    const max = (BigInt(1) << BigInt(n - 1)) - BigInt(1);
    return new BigIntArbitrary(min, max, min, max);
}
function bigUintN(n) {
    const min = BigInt(0);
    const max = (BigInt(1) << BigInt(n)) - BigInt(1);
    return new BigIntArbitrary(min, max, min, max);
}
function buildCompleteBigIntConstraints(constraints) {
    const DefaultPow = 256;
    const DefaultMin = BigInt(-1) << BigInt(DefaultPow - 1);
    const DefaultMax = (BigInt(1) << BigInt(DefaultPow - 1)) - BigInt(1);
    const min = constraints.min;
    const max = constraints.max;
    return {
        min: min !== undefined ? min : DefaultMin - (max !== undefined && max < BigInt(0) ? max * max : BigInt(0)),
        max: max !== undefined ? max : DefaultMax + (min !== undefined && min > BigInt(0) ? min * min : BigInt(0)),
    };
}
function extractBigIntConstraints(args) {
    if (args[0] === undefined) {
        return {};
    }
    if (args[1] === undefined) {
        const constraints = args[0];
        return constraints;
    }
    return { min: args[0], max: args[1] };
}
function bigInt(...args) {
    const constraints = buildCompleteBigIntConstraints(extractBigIntConstraints(args));
    return new BigIntArbitrary(constraints.min, constraints.max, constraints.min, constraints.max);
}
function bigUint(constraints) {
    const max = constraints === undefined ? undefined : typeof constraints === 'object' ? constraints.max : constraints;
    return max === undefined ? bigUintN(256) : new BigIntArbitrary(BigInt(0), max, BigInt(0), max);
}

function boolean() {
    return integer(0, 1)
        .map((v) => v === 1)
        .noBias();
}

class ConstantArbitrary extends Arbitrary {
    constructor(values) {
        super();
        this.values = values;
    }
    generate(mrng) {
        if (this.values.length === 1)
            return new Shrinkable(this.values[0]);
        const id = mrng.nextInt(0, this.values.length - 1);
        if (id === 0)
            return new Shrinkable(this.values[0]);
        function* g(v) {
            yield new Shrinkable(v);
        }
        return new Shrinkable(this.values[id], () => stream(g(this.values[0])));
    }
}
function constant(value) {
    if (hasCloneMethod(value)) {
        throw new Error('fc.constant does not accept cloneable values, use fc.clonedConstant instead');
    }
    return new ConstantArbitrary([value]);
}
function clonedConstant(value) {
    if (hasCloneMethod(value)) {
        const producer = () => value[cloneMethod]();
        return new ConstantArbitrary([producer]).map((c) => c());
    }
    return new ConstantArbitrary([value]);
}
function constantFrom(...values) {
    if (values.length === 0) {
        throw new Error('fc.constantFrom expects at least one parameter');
    }
    if (values.find((v) => hasCloneMethod(v)) != undefined) {
        throw new Error('fc.constantFrom does not accept cloneable values, not supported for the moment');
    }
    return new ConstantArbitrary([...values]);
}

function falsy(constraints) {
    if (!constraints || !constraints.withBigInt)
        return constantFrom(false, null, undefined, 0, '', NaN);
    else
        return constantFrom(false, null, undefined, 0, '', NaN, BigInt(0));
}

function CharacterArbitrary(min, max, mapToCode) {
    return integer(min, max).map((n) => String.fromCodePoint(mapToCode(n)));
}
const preferPrintableMapper = (v) => {
    if (v < 95)
        return v + 0x20;
    if (v <= 0x7e)
        return v - 95;
    return v;
};
function char() {
    return CharacterArbitrary(0x20, 0x7e, (v) => v);
}
function hexa() {
    function mapper(v) {
        return v < 10
            ? v + 48
            : v + 97 - 10;
    }
    return CharacterArbitrary(0, 15, mapper);
}
function base64() {
    function mapper(v) {
        if (v < 26)
            return v + 65;
        if (v < 52)
            return v + 97 - 26;
        if (v < 62)
            return v + 48 - 52;
        return v === 62 ? 43 : 47;
    }
    return CharacterArbitrary(0, 63, mapper);
}
function ascii() {
    return CharacterArbitrary(0x00, 0x7f, preferPrintableMapper);
}
function char16bits() {
    return CharacterArbitrary(0x0000, 0xffff, preferPrintableMapper);
}
function unicode() {
    const gapSize = 0xdfff + 1 - 0xd800;
    function mapping(v) {
        if (v < 0xd800)
            return preferPrintableMapper(v);
        return v + gapSize;
    }
    return CharacterArbitrary(0x0000, 0xffff - gapSize, mapping);
}
function fullUnicode() {
    const gapSize = 0xdfff + 1 - 0xd800;
    function mapping(v) {
        if (v < 0xd800)
            return preferPrintableMapper(v);
        return v + gapSize;
    }
    return CharacterArbitrary(0x0000, 0x10ffff - gapSize, mapping);
}

class ContextImplem {
    constructor() {
        this.receivedLogs = [];
    }
    log(data) {
        this.receivedLogs.push(data);
    }
    size() {
        return this.receivedLogs.length;
    }
    toString() {
        return JSON.stringify({ logs: this.receivedLogs });
    }
    [cloneMethod]() {
        return new ContextImplem();
    }
}
function context() {
    return clonedConstant(new ContextImplem());
}

function date(constraints) {
    const intMin = constraints && constraints.min !== undefined ? constraints.min.getTime() : -8640000000000000;
    const intMax = constraints && constraints.max !== undefined ? constraints.max.getTime() : 8640000000000000;
    if (Number.isNaN(intMin))
        throw new Error('fc.date min must be valid instance of Date');
    if (Number.isNaN(intMax))
        throw new Error('fc.date max must be valid instance of Date');
    if (intMin > intMax)
        throw new Error('fc.date max must be greater or equal to min');
    return integer(intMin, intMax).map((a) => new Date(a));
}

class CloneArbitrary extends Arbitrary {
    constructor(arb, numValues) {
        super();
        this.arb = arb;
        this.numValues = numValues;
    }
    generate(mrng) {
        const items = [];
        if (this.numValues <= 0) {
            return this.wrapper(items);
        }
        for (let idx = 0; idx !== this.numValues - 1; ++idx) {
            items.push(this.arb.generate(mrng.clone()));
        }
        items.push(this.arb.generate(mrng));
        return this.wrapper(items);
    }
    static makeItCloneable(vs, shrinkables) {
        vs[cloneMethod] = () => {
            const cloned = [];
            for (let idx = 0; idx !== shrinkables.length; ++idx) {
                cloned.push(shrinkables[idx].value);
            }
            this.makeItCloneable(cloned, shrinkables);
            return cloned;
        };
        return vs;
    }
    wrapper(items) {
        let cloneable = false;
        const vs = [];
        for (let idx = 0; idx !== items.length; ++idx) {
            const s = items[idx];
            cloneable = cloneable || s.hasToBeCloned;
            vs.push(s.value);
        }
        if (cloneable) {
            CloneArbitrary.makeItCloneable(vs, items);
        }
        return new Shrinkable(vs, () => stream(this.shrinkImpl(items)).map((v) => this.wrapper(v)));
    }
    *shrinkImpl(items) {
        if (items.length === 0) {
            return;
        }
        const its = items.map((s) => s.shrink()[Symbol.iterator]());
        let cur = its.map((it) => it.next());
        while (!cur[0].done) {
            yield cur.map((c) => c.value);
            cur = its.map((it) => it.next());
        }
    }
}
function clone(arb, numValues) {
    return new CloneArbitrary(arb, numValues);
}

const dedup = clone;

function buildCompleteSetConstraints(constraints) {
    const minLength = constraints.minLength !== undefined ? constraints.minLength : 0;
    const maxLength = constraints.maxLength !== undefined ? constraints.maxLength : maxLengthFromMinLength(minLength);
    const compare = constraints.compare !== undefined ? constraints.compare : (a, b) => a === b;
    return { minLength, maxLength, compare };
}
function extractSetConstraints(args) {
    if (args[0] === undefined) {
        return {};
    }
    if (args[1] === undefined) {
        const sargs = args;
        if (typeof sargs[0] === 'number')
            return { maxLength: sargs[0] };
        if (typeof sargs[0] === 'function')
            return { compare: sargs[0] };
        return sargs[0];
    }
    if (args[2] === undefined) {
        const sargs = args;
        if (typeof sargs[1] === 'number')
            return { minLength: sargs[0], maxLength: sargs[1] };
        return { maxLength: sargs[0], compare: sargs[1] };
    }
    const sargs = args;
    return { minLength: sargs[0], maxLength: sargs[1], compare: sargs[2] };
}
function set(arb, ...args) {
    const constraints = buildCompleteSetConstraints(extractSetConstraints(args));
    const minLength = constraints.minLength;
    const maxLength = constraints.maxLength;
    const compare = constraints.compare;
    const arrayArb = new ArrayArbitrary(arb, minLength, maxLength, compare);
    if (minLength === 0)
        return arrayArb;
    return arrayArb.filter((tab) => tab.length >= minLength);
}

function toObject(items) {
    const obj = {};
    for (const keyValue of items) {
        obj[keyValue[0]] = keyValue[1];
    }
    return obj;
}
function dictionary(keyArb, valueArb) {
    return set(tuple(keyArb, valueArb), { compare: (t1, t2) => t1[0] === t2[0] }).map(toObject);
}

const depthContextCache = new Map();
function getDepthContextFor(contextMeta) {
    if (contextMeta === undefined) {
        return { depth: 0 };
    }
    if (typeof contextMeta !== 'string') {
        return contextMeta;
    }
    const cachedContext = depthContextCache.get(contextMeta);
    if (cachedContext !== undefined) {
        return cachedContext;
    }
    const context = { depth: 0 };
    depthContextCache.set(contextMeta, context);
    return context;
}

class FrequencyArbitrary extends Arbitrary {
    constructor(warbs, constraints, context) {
        super();
        this.warbs = warbs;
        this.constraints = constraints;
        this.context = context;
        let currentWeight = 0;
        this.summedWarbs = [];
        for (let idx = 0; idx !== warbs.length; ++idx) {
            currentWeight += warbs[idx].weight;
            this.summedWarbs.push({ weight: currentWeight, arbitrary: warbs[idx].arbitrary });
        }
        this.totalWeight = currentWeight;
    }
    static from(warbs, constraints, label) {
        if (warbs.length === 0) {
            throw new Error(`${label} expects at least one weigthed arbitrary`);
        }
        let totalWeight = 0;
        for (let idx = 0; idx !== warbs.length; ++idx) {
            const currentArbitrary = warbs[idx].arbitrary;
            if (currentArbitrary === undefined) {
                throw new Error(`${label} expects arbitraries to be specified`);
            }
            const currentWeight = warbs[idx].weight;
            totalWeight += currentWeight;
            if (!Number.isInteger(currentWeight)) {
                throw new Error(`${label} expects weights to be integer values`);
            }
            if (currentWeight < 0) {
                throw new Error(`${label} expects weights to be superior or equal to 0`);
            }
        }
        if (totalWeight <= 0) {
            throw new Error(`${label} expects the sum of weights to be strictly superior to 0`);
        }
        return new FrequencyArbitrary(warbs, constraints, getDepthContextFor(constraints.depthIdentifier));
    }
    generate(mrng) {
        if (this.constraints.maxDepth !== undefined && this.constraints.maxDepth <= this.context.depth) {
            return this.safeGenerateForIndex(mrng, 0);
        }
        const selected = mrng.nextInt(this.computeNegDepthBenefit(), this.totalWeight - 1);
        for (let idx = 0; idx !== this.summedWarbs.length; ++idx) {
            if (selected < this.summedWarbs[idx].weight) {
                return this.safeGenerateForIndex(mrng, idx);
            }
        }
        throw new Error(`Unable to generate from fc.frequency`);
    }
    withBias(freq) {
        return new FrequencyArbitrary(this.warbs.map((v) => ({ weight: v.weight, arbitrary: v.arbitrary.withBias(freq) })), this.constraints, this.context);
    }
    safeGenerateForIndex(mrng, idx) {
        ++this.context.depth;
        try {
            const itemShrinkable = this.summedWarbs[idx].arbitrary.generate(mrng);
            if (idx === 0 || !this.constraints.withCrossShrink || this.warbs[0].weight === 0) {
                return itemShrinkable;
            }
            return this.enrichShrinkable(mrng.clone(), itemShrinkable);
        }
        finally {
            --this.context.depth;
        }
    }
    computeNegDepthBenefit() {
        const depthFactor = this.constraints.depthFactor;
        if (depthFactor === undefined || depthFactor <= 0) {
            return 0;
        }
        const depthBenefit = Math.floor(Math.pow(1 + depthFactor, this.context.depth)) - 1;
        return -Math.min(this.warbs[0].weight * depthBenefit, Number.MAX_SAFE_INTEGER) || 0;
    }
    enrichShrinkable(mrng, shrinkable) {
        let shrinkableForFirst = null;
        const getItemShrinkableForFirst = () => {
            if (shrinkableForFirst === null) {
                shrinkableForFirst = this.warbs[0].arbitrary.generate(mrng);
            }
            return shrinkableForFirst;
        };
        return new Shrinkable(shrinkable.value_, () => {
            return Stream.of(getItemShrinkableForFirst()).join(shrinkable.shrink());
        });
    }
}
function isFrequencyContraints(param) {
    return param != null && typeof param === 'object' && !('arbitrary' in param);
}
function frequency(...args) {
    const label = 'fc.frequency';
    const constraints = args[0];
    if (isFrequencyContraints(constraints)) {
        return FrequencyArbitrary.from(args.slice(1), constraints, label);
    }
    return FrequencyArbitrary.from(args, {}, label);
}

function computeNumChoices(options) {
    if (options.length === 0)
        throw new Error(`fc.mapToConstant expects at least one option`);
    let numChoices = 0;
    for (let idx = 0; idx !== options.length; ++idx) {
        if (options[idx].num < 0)
            throw new Error(`fc.mapToConstant expects all options to have a number of entries greater or equal to zero`);
        numChoices += options[idx].num;
    }
    if (numChoices === 0)
        throw new Error(`fc.mapToConstant expects at least one choice among options`);
    return numChoices;
}
function mapToConstant(...entries) {
    const numChoices = computeNumChoices(entries);
    return nat(numChoices - 1).map((choice) => {
        let idx = -1;
        let numSkips = 0;
        while (choice >= numSkips) {
            numSkips += entries[++idx].num;
        }
        return entries[idx].build(choice - numSkips + entries[idx].num);
    });
}

const lowerCaseMapper = { num: 26, build: (v) => String.fromCharCode(v + 0x61) };
const upperCaseMapper = { num: 26, build: (v) => String.fromCharCode(v + 0x41) };
const numericMapper = { num: 10, build: (v) => String.fromCharCode(v + 0x30) };
const percentCharArb = fullUnicode().map((c) => {
    const encoded = encodeURIComponent(c);
    return c !== encoded ? encoded : `%${c.charCodeAt(0).toString(16)}`;
});
const buildLowerAlphaArb = (others) => mapToConstant(lowerCaseMapper, { num: others.length, build: (v) => others[v] });
const buildLowerAlphaNumericArb = (others) => mapToConstant(lowerCaseMapper, numericMapper, { num: others.length, build: (v) => others[v] });
const buildAlphaNumericArb = (others) => mapToConstant(lowerCaseMapper, upperCaseMapper, numericMapper, { num: others.length, build: (v) => others[v] });
const buildAlphaNumericPercentArb = (others) => frequency({
    weight: 10,
    arbitrary: buildAlphaNumericArb(others),
}, {
    weight: 1,
    arbitrary: percentCharArb,
});

function extractOptionConstraints(constraints) {
    if (!constraints)
        return {};
    if (typeof constraints === 'number')
        return { freq: constraints };
    return constraints;
}
function option(arb, rawConstraints) {
    const constraints = extractOptionConstraints(rawConstraints);
    const freq = constraints.freq == null ? 5 : constraints.freq;
    const nilArb = constant(Object.prototype.hasOwnProperty.call(constraints, 'nil') ? constraints.nil : null);
    const weightedArbs = [
        { arbitrary: nilArb, weight: 1 },
        { arbitrary: arb, weight: freq },
    ];
    const frequencyConstraints = {
        withCrossShrink: true,
        depthFactor: constraints.depthFactor,
        maxDepth: constraints.maxDepth,
        depthIdentifier: constraints.depthIdentifier,
    };
    return FrequencyArbitrary.from(weightedArbs, frequencyConstraints, 'fc.option');
}

function StringArbitrary(charArb, ...args) {
    const arrayArb = args[0] !== undefined
        ? typeof args[0] === 'number'
            ? typeof args[1] === 'number'
                ? array(charArb, { minLength: args[0], maxLength: args[1] })
                : array(charArb, { maxLength: args[0] })
            : array(charArb, args[0])
        : array(charArb);
    return arrayArb.map((tab) => tab.join(''));
}
function Base64StringArbitrary(unscaledMinLength, unscaledMaxLength) {
    const minLength = unscaledMinLength + 3 - ((unscaledMinLength + 3) % 4);
    const maxLength = unscaledMaxLength - (unscaledMaxLength % 4);
    if (minLength > maxLength)
        throw new Error('Minimal length should be inferior or equal to maximal length');
    if (minLength % 4 !== 0)
        throw new Error('Minimal length of base64 strings must be a multiple of 4');
    if (maxLength % 4 !== 0)
        throw new Error('Maximal length of base64 strings must be a multiple of 4');
    return StringArbitrary(base64(), { minLength, maxLength }).map((s) => {
        switch (s.length % 4) {
            case 0:
                return s;
            case 3:
                return `${s}=`;
            case 2:
                return `${s}==`;
            default:
                return s.slice(1);
        }
    });
}
function stringOf(charArb, ...args) {
    return StringArbitrary(charArb, ...args);
}
function string(...args) {
    return StringArbitrary(char(), ...args);
}
function asciiString(...args) {
    return StringArbitrary(ascii(), ...args);
}
function string16bits(...args) {
    return StringArbitrary(char16bits(), ...args);
}
function unicodeString(...args) {
    return StringArbitrary(unicode(), ...args);
}
function fullUnicodeString(...args) {
    return StringArbitrary(fullUnicode(), ...args);
}
function hexaString(...args) {
    return StringArbitrary(hexa(), ...args);
}
function base64String(...args) {
    if (args[0] !== undefined) {
        if (typeof args[0] === 'number') {
            if (typeof args[1] === 'number') {
                return Base64StringArbitrary(args[0], args[1]);
            }
            else {
                return Base64StringArbitrary(0, args[0]);
            }
        }
        else {
            const minLength = args[0].minLength !== undefined ? args[0].minLength : 0;
            const maxLength = args[0].maxLength !== undefined ? args[0].maxLength : maxLengthFromMinLength(minLength);
            return Base64StringArbitrary(minLength, maxLength);
        }
    }
    return Base64StringArbitrary(0, maxLengthFromMinLength(0));
}

function filterInvalidSubdomainLabel(subdomainLabel) {
    if (subdomainLabel.length > 63) {
        return false;
    }
    return (subdomainLabel.length < 4 ||
        subdomainLabel[0] !== 'x' ||
        subdomainLabel[1] !== 'n' ||
        subdomainLabel[2] !== '-' ||
        subdomainLabel[3] !== '-');
}
function subdomainLabel() {
    const alphaNumericArb = buildLowerAlphaNumericArb([]);
    const alphaNumericHyphenArb = buildLowerAlphaNumericArb(['-']);
    return tuple(alphaNumericArb, option(tuple(stringOf(alphaNumericHyphenArb, { maxLength: 61 }), alphaNumericArb)))
        .map(([f, d]) => (d === null ? f : `${f}${d[0]}${d[1]}`))
        .filter(filterInvalidSubdomainLabel);
}
function domain() {
    const alphaNumericArb = buildLowerAlphaArb([]);
    const publicSuffixArb = stringOf(alphaNumericArb, { minLength: 2, maxLength: 10 });
    return (tuple(array(subdomainLabel(), { minLength: 1, maxLength: 5 }), publicSuffixArb)
        .map(([mid, ext]) => `${mid.join('.')}.${ext}`)
        .filter((d) => d.length <= 255));
}
function hostUserInfo() {
    const others = ['-', '.', '_', '~', '!', '$', '&', "'", '(', ')', '*', '+', ',', ';', '=', ':'];
    return stringOf(buildAlphaNumericPercentArb(others));
}

function emailAddress() {
    const others = ['!', '#', '$', '%', '&', "'", '*', '+', '-', '/', '=', '?', '^', '_', '`', '{', '|', '}', '~'];
    const atextArb = buildLowerAlphaNumericArb(others);
    const localPartArb = array(stringOf(atextArb, { minLength: 1, maxLength: 10 }), { minLength: 1, maxLength: 5 })
        .map((a) => a.join('.'))
        .filter((lp) => lp.length <= 64);
    return tuple(localPartArb, domain()).map(([lp, d]) => `${lp}@${d}`);
}

const Zero64 = { sign: 1, data: [0, 0] };
const Unit64 = { sign: 1, data: [0, 1] };
function isZero64(a) {
    return a.data[0] === 0 && a.data[1] === 0;
}
function isStrictlyNegative64(a) {
    return a.sign === -1 && !isZero64(a);
}
function isStrictlyPositive64(a) {
    return a.sign === 1 && !isZero64(a);
}
function isEqual64(a, b) {
    if (a.data[0] === b.data[0] && a.data[1] === b.data[1]) {
        return a.sign === b.sign || (a.data[0] === 0 && a.data[1] === 0);
    }
    return false;
}
function isStrictlySmaller64Internal(a, b) {
    return a[0] < b[0] || (a[0] === b[0] && a[1] < b[1]);
}
function isStrictlySmaller64(a, b) {
    if (a.sign === b.sign) {
        return a.sign === 1
            ? isStrictlySmaller64Internal(a.data, b.data)
            : isStrictlySmaller64Internal(b.data, a.data);
    }
    return a.sign === -1 && (!isZero64(a) || !isZero64(b));
}
function clone64(a) {
    return { sign: a.sign, data: [a.data[0], a.data[1]] };
}
function substract64DataInternal(a, b) {
    let reminderLow = 0;
    let low = a[1] - b[1];
    if (low < 0) {
        reminderLow = 1;
        low = low >>> 0;
    }
    return [a[0] - b[0] - reminderLow, low];
}
function substract64Internal(a, b) {
    if (a.sign === 1 && b.sign === -1) {
        const low = a.data[1] + b.data[1];
        const high = a.data[0] + b.data[0] + (low > 0xffffffff ? 1 : 0);
        return { sign: 1, data: [high >>> 0, low >>> 0] };
    }
    return {
        sign: 1,
        data: a.sign === 1 ? substract64DataInternal(a.data, b.data) : substract64DataInternal(b.data, a.data),
    };
}
function substract64(arrayIntA, arrayIntB) {
    if (isStrictlySmaller64(arrayIntA, arrayIntB)) {
        const out = substract64Internal(arrayIntB, arrayIntA);
        out.sign = -1;
        return out;
    }
    return substract64Internal(arrayIntA, arrayIntB);
}
function negative64(arrayIntA) {
    return {
        sign: -arrayIntA.sign,
        data: [arrayIntA.data[0], arrayIntA.data[1]],
    };
}
function add64(arrayIntA, arrayIntB) {
    if (isZero64(arrayIntB)) {
        if (isZero64(arrayIntA)) {
            return clone64(Zero64);
        }
        return clone64(arrayIntA);
    }
    return substract64(arrayIntA, negative64(arrayIntB));
}
function halve64(a) {
    return {
        sign: a.sign,
        data: [Math.floor(a.data[0] / 2), (a.data[0] % 2 === 1 ? 0x80000000 : 0) + Math.floor(a.data[1] / 2)],
    };
}
function logLike64(a) {
    return {
        sign: a.sign,
        data: [0, Math.floor(Math.log(a.data[0] * 0x100000000 + a.data[1]) / Math.log(2))],
    };
}

class ArrayInt64Arbitrary extends ArbitraryWithContextualShrink {
    constructor(min, max, genMin, genMax) {
        super();
        this.min = min;
        this.max = max;
        this.genMin = genMin;
        this.genMax = genMax;
        this.biasedArrayInt64Arbitrary = null;
    }
    wrapper(value, context) {
        return new Shrinkable(value, () => this.contextualShrink(value, context).map(([v, nextContext]) => this.wrapper(v, nextContext)));
    }
    generate(mrng) {
        const uncheckedValue = mrng.nextArrayInt(this.genMin, this.genMax);
        if (uncheckedValue.data.length === 1) {
            uncheckedValue.data.unshift(0);
        }
        return this.wrapper(uncheckedValue, undefined);
    }
    shrinkArrayInt64(value, target, tryTargetAsap) {
        const realGap = substract64(value, target);
        function* shrinkGen() {
            let previous = tryTargetAsap ? undefined : target;
            const gap = tryTargetAsap ? realGap : halve64(realGap);
            for (let toremove = gap; !isZero64(toremove); toremove = halve64(toremove)) {
                const next = substract64(value, toremove);
                yield [next, previous];
                previous = next;
            }
        }
        return stream(shrinkGen());
    }
    contextualShrink(current, context) {
        if (!ArrayInt64Arbitrary.isValidContext(current, context)) {
            const target = this.defaultTarget();
            return this.shrinkArrayInt64(current, target, true);
        }
        if (this.isLastChanceTry(current, context)) {
            return Stream.of([context, undefined]);
        }
        return this.shrinkArrayInt64(current, context, false);
    }
    shrunkOnceContext() {
        return this.defaultTarget();
    }
    defaultTarget() {
        if (!isStrictlyPositive64(this.min) && !isStrictlyNegative64(this.max)) {
            return Zero64;
        }
        return isStrictlyNegative64(this.min) ? this.max : this.min;
    }
    isLastChanceTry(current, context) {
        if (isZero64(current)) {
            return false;
        }
        if (current.sign === 1) {
            return isEqual64(current, add64(context, Unit64)) && isStrictlyPositive64(substract64(current, this.min));
        }
        else {
            return isEqual64(current, substract64(context, Unit64)) && isStrictlyNegative64(substract64(current, this.max));
        }
    }
    static isValidContext(_current, context) {
        if (context === undefined) {
            return false;
        }
        if (typeof context !== 'object' || context === null || !('sign' in context) || !('data' in context)) {
            throw new Error(`Invalid context type passed to ArrayInt64Arbitrary (#1)`);
        }
        return true;
    }
    pureBiasedArbitrary() {
        if (this.biasedArrayInt64Arbitrary != null) {
            return this.biasedArrayInt64Arbitrary;
        }
        if (isEqual64(this.min, this.max)) {
            this.biasedArrayInt64Arbitrary = this;
            return this;
        }
        const minStrictlySmallerZero = isStrictlyNegative64(this.min);
        const maxStrictlyGreaterZero = isStrictlyPositive64(this.max);
        if (minStrictlySmallerZero && maxStrictlyGreaterZero) {
            const logMin = logLike64(this.min);
            const logMax = logLike64(this.max);
            this.biasedArrayInt64Arbitrary = new BiasedNumericArbitrary(new ArrayInt64Arbitrary(this.min, this.max, logMin, logMax), new ArrayInt64Arbitrary(this.min, this.max, substract64(this.max, logMax), this.max), new ArrayInt64Arbitrary(this.min, this.max, this.min, substract64(this.min, logMin)));
        }
        else {
            const logGap = logLike64(substract64(this.max, this.min));
            const arbCloseToMin = new ArrayInt64Arbitrary(this.min, this.max, this.min, add64(this.min, logGap));
            const arbCloseToMax = new ArrayInt64Arbitrary(this.min, this.max, substract64(this.max, logGap), this.max);
            this.biasedArrayInt64Arbitrary = minStrictlySmallerZero
                ? new BiasedNumericArbitrary(arbCloseToMax, arbCloseToMin)
                : new BiasedNumericArbitrary(arbCloseToMin, arbCloseToMax);
        }
        return this.biasedArrayInt64Arbitrary;
    }
    withBias(freq) {
        return biasWrapper(freq, this, (originalArbitrary) => originalArbitrary.pureBiasedArbitrary());
    }
}
function arrayInt64(min, max) {
    return new ArrayInt64Arbitrary(min, max, min, max);
}

const INDEX_POSITIVE_INFINITY = { sign: 1, data: [2146435072, 0] };
const INDEX_NEGATIVE_INFINITY = { sign: -1, data: [2146435072, 1] };
function decomposeDouble(d) {
    const maxSignificand = 2 - Number.EPSILON;
    for (let exponent = -1022; exponent !== 1024; ++exponent) {
        const powExponent = 2 ** exponent;
        const maxForExponent = maxSignificand * powExponent;
        if (Math.abs(d) <= maxForExponent) {
            return { exponent, significand: d / powExponent };
        }
    }
    return { exponent: Number.NaN, significand: Number.NaN };
}
function positiveNumberToInt64(n) {
    return [~~(n / 0x100000000), n >>> 0];
}
function indexInDoubleFromDecomp(exponent, significand) {
    if (exponent === -1022) {
        const rescaledSignificand = significand * 2 ** 52;
        return positiveNumberToInt64(rescaledSignificand);
    }
    const rescaledSignificand = (significand - 1) * 2 ** 52;
    const exponentOnlyHigh = (exponent + 1023) * 2 ** 20;
    const index = positiveNumberToInt64(rescaledSignificand);
    index[0] += exponentOnlyHigh;
    return index;
}
function doubleToIndex(d) {
    if (d === Number.POSITIVE_INFINITY) {
        return clone64(INDEX_POSITIVE_INFINITY);
    }
    if (d === Number.NEGATIVE_INFINITY) {
        return clone64(INDEX_NEGATIVE_INFINITY);
    }
    const decomp = decomposeDouble(d);
    const exponent = decomp.exponent;
    const significand = decomp.significand;
    if (d > 0 || (d === 0 && 1 / d === Number.POSITIVE_INFINITY)) {
        return { sign: 1, data: indexInDoubleFromDecomp(exponent, significand) };
    }
    else {
        const indexOpposite = indexInDoubleFromDecomp(exponent, -significand);
        if (indexOpposite[1] === 0xffffffff) {
            indexOpposite[0] += 1;
            indexOpposite[1] = 0;
        }
        else {
            indexOpposite[1] += 1;
        }
        return { sign: -1, data: indexOpposite };
    }
}
function indexToDouble(index) {
    if (index.sign === -1) {
        const indexOpposite = { sign: 1, data: [index.data[0], index.data[1]] };
        if (indexOpposite.data[1] === 0) {
            indexOpposite.data[0] -= 1;
            indexOpposite.data[1] = 0xffffffff;
        }
        else {
            indexOpposite.data[1] -= 1;
        }
        return -indexToDouble(indexOpposite);
    }
    if (isEqual64(index, INDEX_POSITIVE_INFINITY)) {
        return Number.POSITIVE_INFINITY;
    }
    if (index.data[0] < 0x200000) {
        return (index.data[0] * 0x100000000 + index.data[1]) * 2 ** -1074;
    }
    const postIndexHigh = index.data[0] - 0x200000;
    const exponent = -1021 + (postIndexHigh >> 20);
    const significand = 1 + ((postIndexHigh & 0xfffff) * 2 ** 32 + index.data[1]) * Number.EPSILON;
    return significand * 2 ** exponent;
}
function safeDoubleToIndex(d, constraintsLabel) {
    if (Number.isNaN(d)) {
        throw new Error('fc.doubleNext constraints.' + constraintsLabel + ' must be a 32-bit float');
    }
    return doubleToIndex(d);
}
function doubleNext(constraints = {}) {
    const { noDefaultInfinity = false, noNaN = false, min = noDefaultInfinity ? -Number.MAX_VALUE : Number.NEGATIVE_INFINITY, max = noDefaultInfinity ? Number.MAX_VALUE : Number.POSITIVE_INFINITY, } = constraints;
    const minIndex = safeDoubleToIndex(min, 'min');
    const maxIndex = safeDoubleToIndex(max, 'max');
    if (isStrictlySmaller64(maxIndex, minIndex)) {
        throw new Error('fc.doubleNext constraints.min must be smaller or equal to constraints.max');
    }
    if (noNaN) {
        return arrayInt64(minIndex, maxIndex).map(indexToDouble);
    }
    const positiveMaxIdx = isStrictlyPositive64(maxIndex);
    const minIndexWithNaN = positiveMaxIdx ? minIndex : substract64(minIndex, Unit64);
    const maxIndexWithNaN = positiveMaxIdx ? add64(maxIndex, Unit64) : maxIndex;
    return arrayInt64(minIndexWithNaN, maxIndexWithNaN).map((index) => {
        if (isStrictlySmaller64(maxIndex, index) || isStrictlySmaller64(index, minIndex))
            return Number.NaN;
        else
            return indexToDouble(index);
    });
}

const MAX_VALUE_32 = 2 ** 127 * (1 + (2 ** 23 - 1) / 2 ** 23);
const INDEX_POSITIVE_INFINITY$1 = 2139095040;
const INDEX_NEGATIVE_INFINITY$1 = -2139095041;
function decomposeFloat(f) {
    const maxSignificand = 1 + (2 ** 23 - 1) / 2 ** 23;
    for (let exponent = -126; exponent !== 128; ++exponent) {
        const powExponent = 2 ** exponent;
        const maxForExponent = maxSignificand * powExponent;
        if (Math.abs(f) <= maxForExponent) {
            return { exponent, significand: f / powExponent };
        }
    }
    return { exponent: Number.NaN, significand: Number.NaN };
}
function indexInFloatFromDecomp(exponent, significand) {
    if (exponent === -126) {
        return significand * 0x800000;
    }
    return (exponent + 127) * 0x800000 + (significand - 1) * 0x800000;
}
function floatToIndex(f) {
    if (f === Number.POSITIVE_INFINITY) {
        return INDEX_POSITIVE_INFINITY$1;
    }
    if (f === Number.NEGATIVE_INFINITY) {
        return INDEX_NEGATIVE_INFINITY$1;
    }
    const decomp = decomposeFloat(f);
    const exponent = decomp.exponent;
    const significand = decomp.significand;
    if (Number.isNaN(exponent) || Number.isNaN(significand) || !Number.isInteger(significand * 0x800000)) {
        return Number.NaN;
    }
    if (f > 0 || (f === 0 && 1 / f === Number.POSITIVE_INFINITY)) {
        return indexInFloatFromDecomp(exponent, significand);
    }
    else {
        return -indexInFloatFromDecomp(exponent, -significand) - 1;
    }
}
function indexToFloat(index) {
    if (index < 0) {
        return -indexToFloat(-index - 1);
    }
    if (index === INDEX_POSITIVE_INFINITY$1) {
        return Number.POSITIVE_INFINITY;
    }
    if (index < 0x1000000) {
        return index * 2 ** -149;
    }
    const postIndex = index - 0x1000000;
    const exponent = -125 + (postIndex >> 23);
    const significand = 1 + (postIndex & 0x7fffff) / 0x800000;
    return significand * 2 ** exponent;
}
function safeFloatToIndex(f, constraintsLabel) {
    const conversionTrick = 'you can convert any double to a 32-bit float by using `new Float32Array([myDouble])[0]`';
    const errorMessage = 'fc.floatNext constraints.' + constraintsLabel + ' must be a 32-bit float - ' + conversionTrick;
    if (Number.isNaN(f) || (Number.isFinite(f) && (f < -MAX_VALUE_32 || f > MAX_VALUE_32))) {
        throw new Error(errorMessage);
    }
    const index = floatToIndex(f);
    if (!Number.isInteger(index)) {
        throw new Error(errorMessage);
    }
    return index;
}
function floatNext(constraints = {}) {
    const { noDefaultInfinity = false, noNaN = false, min = noDefaultInfinity ? -MAX_VALUE_32 : Number.NEGATIVE_INFINITY, max = noDefaultInfinity ? MAX_VALUE_32 : Number.POSITIVE_INFINITY, } = constraints;
    const minIndex = safeFloatToIndex(min, 'min');
    const maxIndex = safeFloatToIndex(max, 'max');
    if (minIndex > maxIndex) {
        throw new Error('fc.floatNext constraints.min must be smaller or equal to constraints.max');
    }
    if (noNaN) {
        return integer({ min: minIndex, max: maxIndex }).map(indexToFloat);
    }
    const minIndexWithNaN = maxIndex > 0 ? minIndex : minIndex - 1;
    const maxIndexWithNaN = maxIndex > 0 ? maxIndex + 1 : maxIndex;
    return integer({ min: minIndexWithNaN, max: maxIndexWithNaN }).map((index) => {
        if (index > maxIndex || index < minIndex)
            return Number.NaN;
        else
            return indexToFloat(index);
    });
}

function next(n) {
    return integer(0, (1 << n) - 1);
}
const floatInternal = () => {
    return next(24).map((v) => v / (1 << 24));
};
function float(...args) {
    if (typeof args[0] === 'object') {
        if (args[0].next) {
            return floatNext(args[0]);
        }
        const min = args[0].min !== undefined ? args[0].min : 0;
        const max = args[0].max !== undefined ? args[0].max : 1;
        return (floatInternal()
            .map((v) => min + v * (max - min))
            .filter((g) => g !== max || g === min));
    }
    else {
        const a = args[0];
        const b = args[1];
        if (a === undefined)
            return floatInternal();
        if (b === undefined)
            return (floatInternal()
                .map((v) => v * a)
                .filter((g) => g !== a || g === 0));
        return (floatInternal()
            .map((v) => a + v * (b - a))
            .filter((g) => g !== b || g === a));
    }
}
const doubleFactor = Math.pow(2, 27);
const doubleDivisor = Math.pow(2, -53);
const doubleInternal = () => {
    return tuple(next(26), next(27)).map((v) => (v[0] * doubleFactor + v[1]) * doubleDivisor);
};
function double(...args) {
    if (typeof args[0] === 'object') {
        if (args[0].next) {
            return doubleNext(args[0]);
        }
        const min = args[0].min !== undefined ? args[0].min : 0;
        const max = args[0].max !== undefined ? args[0].max : 1;
        return (doubleInternal()
            .map((v) => min + v * (max - min))
            .filter((g) => g !== max || g === min));
    }
    else {
        const a = args[0];
        const b = args[1];
        if (a === undefined)
            return doubleInternal();
        if (b === undefined)
            return (doubleInternal()
                .map((v) => v * a)
                .filter((g) => g !== a || g === 0));
        return (doubleInternal()
            .map((v) => a + v * (b - a))
            .filter((g) => g !== b || g === a));
    }
}

const crc32Table = [
    0x00000000,
    0x77073096,
    0xee0e612c,
    0x990951ba,
    0x076dc419,
    0x706af48f,
    0xe963a535,
    0x9e6495a3,
    0x0edb8832,
    0x79dcb8a4,
    0xe0d5e91e,
    0x97d2d988,
    0x09b64c2b,
    0x7eb17cbd,
    0xe7b82d07,
    0x90bf1d91,
    0x1db71064,
    0x6ab020f2,
    0xf3b97148,
    0x84be41de,
    0x1adad47d,
    0x6ddde4eb,
    0xf4d4b551,
    0x83d385c7,
    0x136c9856,
    0x646ba8c0,
    0xfd62f97a,
    0x8a65c9ec,
    0x14015c4f,
    0x63066cd9,
    0xfa0f3d63,
    0x8d080df5,
    0x3b6e20c8,
    0x4c69105e,
    0xd56041e4,
    0xa2677172,
    0x3c03e4d1,
    0x4b04d447,
    0xd20d85fd,
    0xa50ab56b,
    0x35b5a8fa,
    0x42b2986c,
    0xdbbbc9d6,
    0xacbcf940,
    0x32d86ce3,
    0x45df5c75,
    0xdcd60dcf,
    0xabd13d59,
    0x26d930ac,
    0x51de003a,
    0xc8d75180,
    0xbfd06116,
    0x21b4f4b5,
    0x56b3c423,
    0xcfba9599,
    0xb8bda50f,
    0x2802b89e,
    0x5f058808,
    0xc60cd9b2,
    0xb10be924,
    0x2f6f7c87,
    0x58684c11,
    0xc1611dab,
    0xb6662d3d,
    0x76dc4190,
    0x01db7106,
    0x98d220bc,
    0xefd5102a,
    0x71b18589,
    0x06b6b51f,
    0x9fbfe4a5,
    0xe8b8d433,
    0x7807c9a2,
    0x0f00f934,
    0x9609a88e,
    0xe10e9818,
    0x7f6a0dbb,
    0x086d3d2d,
    0x91646c97,
    0xe6635c01,
    0x6b6b51f4,
    0x1c6c6162,
    0x856530d8,
    0xf262004e,
    0x6c0695ed,
    0x1b01a57b,
    0x8208f4c1,
    0xf50fc457,
    0x65b0d9c6,
    0x12b7e950,
    0x8bbeb8ea,
    0xfcb9887c,
    0x62dd1ddf,
    0x15da2d49,
    0x8cd37cf3,
    0xfbd44c65,
    0x4db26158,
    0x3ab551ce,
    0xa3bc0074,
    0xd4bb30e2,
    0x4adfa541,
    0x3dd895d7,
    0xa4d1c46d,
    0xd3d6f4fb,
    0x4369e96a,
    0x346ed9fc,
    0xad678846,
    0xda60b8d0,
    0x44042d73,
    0x33031de5,
    0xaa0a4c5f,
    0xdd0d7cc9,
    0x5005713c,
    0x270241aa,
    0xbe0b1010,
    0xc90c2086,
    0x5768b525,
    0x206f85b3,
    0xb966d409,
    0xce61e49f,
    0x5edef90e,
    0x29d9c998,
    0xb0d09822,
    0xc7d7a8b4,
    0x59b33d17,
    0x2eb40d81,
    0xb7bd5c3b,
    0xc0ba6cad,
    0xedb88320,
    0x9abfb3b6,
    0x03b6e20c,
    0x74b1d29a,
    0xead54739,
    0x9dd277af,
    0x04db2615,
    0x73dc1683,
    0xe3630b12,
    0x94643b84,
    0x0d6d6a3e,
    0x7a6a5aa8,
    0xe40ecf0b,
    0x9309ff9d,
    0x0a00ae27,
    0x7d079eb1,
    0xf00f9344,
    0x8708a3d2,
    0x1e01f268,
    0x6906c2fe,
    0xf762575d,
    0x806567cb,
    0x196c3671,
    0x6e6b06e7,
    0xfed41b76,
    0x89d32be0,
    0x10da7a5a,
    0x67dd4acc,
    0xf9b9df6f,
    0x8ebeeff9,
    0x17b7be43,
    0x60b08ed5,
    0xd6d6a3e8,
    0xa1d1937e,
    0x38d8c2c4,
    0x4fdff252,
    0xd1bb67f1,
    0xa6bc5767,
    0x3fb506dd,
    0x48b2364b,
    0xd80d2bda,
    0xaf0a1b4c,
    0x36034af6,
    0x41047a60,
    0xdf60efc3,
    0xa867df55,
    0x316e8eef,
    0x4669be79,
    0xcb61b38c,
    0xbc66831a,
    0x256fd2a0,
    0x5268e236,
    0xcc0c7795,
    0xbb0b4703,
    0x220216b9,
    0x5505262f,
    0xc5ba3bbe,
    0xb2bd0b28,
    0x2bb45a92,
    0x5cb36a04,
    0xc2d7ffa7,
    0xb5d0cf31,
    0x2cd99e8b,
    0x5bdeae1d,
    0x9b64c2b0,
    0xec63f226,
    0x756aa39c,
    0x026d930a,
    0x9c0906a9,
    0xeb0e363f,
    0x72076785,
    0x05005713,
    0x95bf4a82,
    0xe2b87a14,
    0x7bb12bae,
    0x0cb61b38,
    0x92d28e9b,
    0xe5d5be0d,
    0x7cdcefb7,
    0x0bdbdf21,
    0x86d3d2d4,
    0xf1d4e242,
    0x68ddb3f8,
    0x1fda836e,
    0x81be16cd,
    0xf6b9265b,
    0x6fb077e1,
    0x18b74777,
    0x88085ae6,
    0xff0f6a70,
    0x66063bca,
    0x11010b5c,
    0x8f659eff,
    0xf862ae69,
    0x616bffd3,
    0x166ccf45,
    0xa00ae278,
    0xd70dd2ee,
    0x4e048354,
    0x3903b3c2,
    0xa7672661,
    0xd06016f7,
    0x4969474d,
    0x3e6e77db,
    0xaed16a4a,
    0xd9d65adc,
    0x40df0b66,
    0x37d83bf0,
    0xa9bcae53,
    0xdebb9ec5,
    0x47b2cf7f,
    0x30b5ffe9,
    0xbdbdf21c,
    0xcabac28a,
    0x53b39330,
    0x24b4a3a6,
    0xbad03605,
    0xcdd70693,
    0x54de5729,
    0x23d967bf,
    0xb3667a2e,
    0xc4614ab8,
    0x5d681b02,
    0x2a6f2b94,
    0xb40bbe37,
    0xc30c8ea1,
    0x5a05df1b,
    0x2d02ef8d,
];
function hash(repr) {
    let crc = 0xffffffff;
    for (let idx = 0; idx < repr.length; ++idx) {
        const c = repr.charCodeAt(idx);
        if (c < 0x80) {
            crc = crc32Table[(crc & 0xff) ^ c] ^ (crc >> 8);
        }
        else if (c < 0x800) {
            crc = crc32Table[(crc & 0xff) ^ (192 | ((c >> 6) & 31))] ^ (crc >> 8);
            crc = crc32Table[(crc & 0xff) ^ (128 | (c & 63))] ^ (crc >> 8);
        }
        else if (c >= 0xd800 && c < 0xe000) {
            const cNext = repr.charCodeAt(++idx);
            if (c >= 0xdc00 || cNext < 0xdc00 || cNext > 0xdfff || Number.isNaN(cNext)) {
                idx -= 1;
                crc = crc32Table[(crc & 0xff) ^ 0xef] ^ (crc >> 8);
                crc = crc32Table[(crc & 0xff) ^ 0xbf] ^ (crc >> 8);
                crc = crc32Table[(crc & 0xff) ^ 0xbd] ^ (crc >> 8);
            }
            else {
                const c1 = (c & 1023) + 64;
                const c2 = cNext & 1023;
                crc = crc32Table[(crc & 0xff) ^ (240 | ((c1 >> 8) & 7))] ^ (crc >> 8);
                crc = crc32Table[(crc & 0xff) ^ (128 | ((c1 >> 2) & 63))] ^ (crc >> 8);
                crc = crc32Table[(crc & 0xff) ^ (128 | ((c2 >> 6) & 15) | ((c1 & 3) << 4))] ^ (crc >> 8);
                crc = crc32Table[(crc & 0xff) ^ (128 | (c2 & 63))] ^ (crc >> 8);
            }
        }
        else {
            crc = crc32Table[(crc & 0xff) ^ (224 | ((c >> 12) & 15))] ^ (crc >> 8);
            crc = crc32Table[(crc & 0xff) ^ (128 | ((c >> 6) & 63))] ^ (crc >> 8);
            crc = crc32Table[(crc & 0xff) ^ (128 | (c & 63))] ^ (crc >> 8);
        }
    }
    return (crc | 0) + 0x80000000;
}

function escapeForTemplateString(originalText) {
    return originalText.replace(/([$`\\])/g, '\\$1').replace(/\r/g, '\\r');
}
function escapeForMultilineComments(originalText) {
    return originalText.replace(/\*\//g, '*\\/');
}

function func(arb) {
    return tuple(array(arb, { minLength: 1 }), integer().noShrink()).map(([outs, seed]) => {
        const producer = () => {
            const recorded = {};
            const f = (...args) => {
                const repr = stringify(args);
                const val = outs[hash(`${seed}${repr}`) % outs.length];
                recorded[repr] = val;
                return hasCloneMethod(val) ? val[cloneMethod]() : val;
            };
            return Object.assign(f, {
                toString: () => {
                    const seenValues = Object.keys(recorded)
                        .sort()
                        .map((k) => `${k} => ${stringify(recorded[k])}`)
                        .map((line) => `/* ${escapeForMultilineComments(line)} */`);
                    return `function(...args) {
  // With hash and stringify coming from fast-check${seenValues.length !== 0 ? `\n  ${seenValues.join('\n  ')}` : ''}
  const outs = ${stringify(outs)};
  return outs[hash('${seed}' + stringify(args)) % outs.length];
}`;
                },
                [cloneMethod]: producer,
            });
        };
        return producer();
    });
}
function compareFuncImplem(cmp) {
    return tuple(integer().noShrink(), integer(1, 0xffffffff).noShrink()).map(([seed, hashEnvSize]) => {
        const producer = () => {
            const recorded = {};
            const f = (a, b) => {
                const reprA = stringify(a);
                const reprB = stringify(b);
                const hA = hash(`${seed}${reprA}`) % hashEnvSize;
                const hB = hash(`${seed}${reprB}`) % hashEnvSize;
                const val = cmp(hA, hB);
                recorded[`[${reprA},${reprB}]`] = val;
                return val;
            };
            return Object.assign(f, {
                toString: () => {
                    const seenValues = Object.keys(recorded)
                        .sort()
                        .map((k) => `${k} => ${stringify(recorded[k])}`)
                        .map((line) => `/* ${escapeForMultilineComments(line)} */`);
                    return `function(a, b) {
  // With hash and stringify coming from fast-check${seenValues.length !== 0 ? `\n  ${seenValues.join('\n  ')}` : ''}
  const cmp = ${cmp};
  const hA = hash('${seed}' + stringify(a)) % ${hashEnvSize};
  const hB = hash('${seed}' + stringify(b)) % ${hashEnvSize};
  return cmp(hA, hB);
}`;
                },
                [cloneMethod]: producer,
            });
        };
        return producer();
    });
}
function compareFunc() {
    return compareFuncImplem(Object.assign((hA, hB) => hA - hB, {
        toString() {
            return '(hA, hB) => hA - hB';
        },
    }));
}
function compareBooleanFunc() {
    return compareFuncImplem(Object.assign((hA, hB) => hA < hB, {
        toString() {
            return '(hA, hB) => hA < hB';
        },
    }));
}

function isOneOfContraints(param) {
    return param != null && typeof param === 'object' && !('generate' in param);
}
function oneof(...args) {
    const constraints = args[0];
    if (isOneOfContraints(constraints)) {
        const weightedArbs = args.slice(1).map((arbitrary) => ({ arbitrary, weight: 1 }));
        return FrequencyArbitrary.from(weightedArbs, constraints, 'fc.oneof');
    }
    const weightedArbs = args.map((arbitrary) => ({ arbitrary, weight: 1 }));
    return FrequencyArbitrary.from(weightedArbs, {}, 'fc.oneof');
}

function ipV4() {
    return tuple(nat(255), nat(255), nat(255), nat(255)).map(([a, b, c, d]) => `${a}.${b}.${c}.${d}`);
}
function ipV4Extended() {
    const natRepr = (maxValue) => tuple(constantFrom('dec', 'oct', 'hex'), nat(maxValue)).map(([style, v]) => {
        switch (style) {
            case 'oct':
                return `0${Number(v).toString(8)}`;
            case 'hex':
                return `0x${Number(v).toString(16)}`;
            case 'dec':
            default:
                return `${v}`;
        }
    });
    return oneof(tuple(natRepr(255), natRepr(255), natRepr(255), natRepr(255)).map(([a, b, c, d]) => `${a}.${b}.${c}.${d}`), tuple(natRepr(255), natRepr(255), natRepr(65535)).map(([a, b, c]) => `${a}.${b}.${c}`), tuple(natRepr(255), natRepr(16777215)).map(([a, b]) => `${a}.${b}`), natRepr(4294967295));
}
function ipV6() {
    const h16Arb = hexaString({ minLength: 1, maxLength: 4 });
    const ls32Arb = oneof(tuple(h16Arb, h16Arb).map(([a, b]) => `${a}:${b}`), ipV4());
    return oneof(tuple(array(h16Arb, { minLength: 6, maxLength: 6 }), ls32Arb).map(([eh, l]) => `${eh.join(':')}:${l}`), tuple(array(h16Arb, { minLength: 5, maxLength: 5 }), ls32Arb).map(([eh, l]) => `::${eh.join(':')}:${l}`), tuple(array(h16Arb, { minLength: 0, maxLength: 1 }), array(h16Arb, { minLength: 4, maxLength: 4 }), ls32Arb).map(([bh, eh, l]) => `${bh.join(':')}::${eh.join(':')}:${l}`), tuple(array(h16Arb, { minLength: 0, maxLength: 2 }), array(h16Arb, { minLength: 3, maxLength: 3 }), ls32Arb).map(([bh, eh, l]) => `${bh.join(':')}::${eh.join(':')}:${l}`), tuple(array(h16Arb, { minLength: 0, maxLength: 3 }), array(h16Arb, { minLength: 2, maxLength: 2 }), ls32Arb).map(([bh, eh, l]) => `${bh.join(':')}::${eh.join(':')}:${l}`), tuple(array(h16Arb, { minLength: 0, maxLength: 4 }), h16Arb, ls32Arb).map(([bh, eh, l]) => `${bh.join(':')}::${eh}:${l}`), tuple(array(h16Arb, { minLength: 0, maxLength: 5 }), ls32Arb).map(([bh, l]) => `${bh.join(':')}::${l}`), tuple(array(h16Arb, { minLength: 0, maxLength: 6 }), h16Arb).map(([bh, eh]) => `${bh.join(':')}::${eh}`), tuple(array(h16Arb, { minLength: 0, maxLength: 7 })).map(([bh]) => `${bh.join(':')}::`));
}

class LazyArbitrary extends Arbitrary {
    constructor(name) {
        super();
        this.name = name;
        this.numBiasLevels = 0;
        this.lastBiasedArbitrary = null;
        this.underlying = null;
    }
    generate(mrng) {
        if (!this.underlying) {
            throw new Error(`Lazy arbitrary ${JSON.stringify(this.name)} not correctly initialized`);
        }
        return this.underlying.generate(mrng);
    }
    withBias(freq) {
        if (!this.underlying) {
            throw new Error(`Lazy arbitrary ${JSON.stringify(this.name)} not correctly initialized`);
        }
        if (this.numBiasLevels >= LazyArbitrary.MaxBiasLevels) {
            return this;
        }
        if (this.lastBiasedArbitrary !== null &&
            this.lastBiasedArbitrary.freq === freq &&
            this.lastBiasedArbitrary.arb === this.underlying &&
            this.lastBiasedArbitrary.lvl === this.numBiasLevels) {
            return this.lastBiasedArbitrary.biasedArb;
        }
        ++this.numBiasLevels;
        const biasedArb = this.underlying.withBias(freq);
        --this.numBiasLevels;
        this.lastBiasedArbitrary = {
            arb: this.underlying,
            lvl: this.numBiasLevels,
            freq,
            biasedArb,
        };
        return biasedArb;
    }
}
LazyArbitrary.MaxBiasLevels = 5;
function isLazyArbitrary(arb) {
    return typeof arb === 'object' && arb !== null && Object.prototype.hasOwnProperty.call(arb, 'underlying');
}
function letrec(builder) {
    const lazyArbs = Object.create(null);
    const tie = (key) => {
        if (!Object.prototype.hasOwnProperty.call(lazyArbs, key))
            lazyArbs[key] = new LazyArbitrary(key);
        return lazyArbs[key];
    };
    const strictArbs = builder(tie);
    for (const key in strictArbs) {
        if (!Object.prototype.hasOwnProperty.call(strictArbs, key)) {
            continue;
        }
        const lazyAtKey = lazyArbs[key];
        const lazyArb = isLazyArbitrary(lazyAtKey) ? lazyAtKey : new LazyArbitrary(key);
        lazyArb.underlying = strictArbs[key];
        lazyArbs[key] = lazyArb;
    }
    return strictArbs;
}

const h = (v, w) => {
    return { arbitrary: constant(v), weight: w };
};
const loremWord = () => frequency(h('non', 6), h('adipiscing', 5), h('ligula', 5), h('enim', 5), h('pellentesque', 5), h('in', 5), h('augue', 5), h('et', 5), h('nulla', 5), h('lorem', 4), h('sit', 4), h('sed', 4), h('diam', 4), h('fermentum', 4), h('ut', 4), h('eu', 4), h('aliquam', 4), h('mauris', 4), h('vitae', 4), h('felis', 4), h('ipsum', 3), h('dolor', 3), h('amet,', 3), h('elit', 3), h('euismod', 3), h('mi', 3), h('orci', 3), h('erat', 3), h('praesent', 3), h('egestas', 3), h('leo', 3), h('vel', 3), h('sapien', 3), h('integer', 3), h('curabitur', 3), h('convallis', 3), h('purus', 3), h('risus', 2), h('suspendisse', 2), h('lectus', 2), h('nec,', 2), h('ultricies', 2), h('sed,', 2), h('cras', 2), h('elementum', 2), h('ultrices', 2), h('maecenas', 2), h('massa,', 2), h('varius', 2), h('a,', 2), h('semper', 2), h('proin', 2), h('nec', 2), h('nisl', 2), h('amet', 2), h('duis', 2), h('congue', 2), h('libero', 2), h('vestibulum', 2), h('pede', 2), h('blandit', 2), h('sodales', 2), h('ante', 2), h('nibh', 2), h('ac', 2), h('aenean', 2), h('massa', 2), h('suscipit', 2), h('sollicitudin', 2), h('fusce', 2), h('tempus', 2), h('aliquam,', 2), h('nunc', 2), h('ullamcorper', 2), h('rhoncus', 2), h('metus', 2), h('faucibus,', 2), h('justo', 2), h('magna', 2), h('at', 2), h('tincidunt', 2), h('consectetur', 1), h('tortor,', 1), h('dignissim', 1), h('congue,', 1), h('non,', 1), h('porttitor,', 1), h('nonummy', 1), h('molestie,', 1), h('est', 1), h('eleifend', 1), h('mi,', 1), h('arcu', 1), h('scelerisque', 1), h('vitae,', 1), h('consequat', 1), h('in,', 1), h('pretium', 1), h('volutpat', 1), h('pharetra', 1), h('tempor', 1), h('bibendum', 1), h('odio', 1), h('dui', 1), h('primis', 1), h('faucibus', 1), h('luctus', 1), h('posuere', 1), h('cubilia', 1), h('curae,', 1), h('hendrerit', 1), h('velit', 1), h('mauris,', 1), h('gravida', 1), h('ornare', 1), h('ut,', 1), h('pulvinar', 1), h('varius,', 1), h('turpis', 1), h('nibh,', 1), h('eros', 1), h('id', 1), h('aliquet', 1), h('quis', 1), h('lobortis', 1), h('consectetuer', 1), h('morbi', 1), h('vehicula', 1), h('tortor', 1), h('tellus,', 1), h('id,', 1), h('eu,', 1), h('quam', 1), h('feugiat,', 1), h('posuere,', 1), h('iaculis', 1), h('lectus,', 1), h('tristique', 1), h('mollis,', 1), h('nisl,', 1), h('vulputate', 1), h('sem', 1), h('vivamus', 1), h('placerat', 1), h('imperdiet', 1), h('cursus', 1), h('rutrum', 1), h('iaculis,', 1), h('augue,', 1), h('lacus', 1));
function lorem(...args) {
    const maxWordsCount = typeof args[0] === 'object' ? args[0].maxCount : args[0];
    const sentencesMode = typeof args[0] === 'object' ? args[0].mode === 'sentences' : args[1];
    const maxCount = maxWordsCount || 5;
    if (maxCount < 1)
        throw new Error(`lorem has to produce at least one word/sentence`);
    if (sentencesMode) {
        const sentence = array(loremWord(), { minLength: 1 })
            .map((words) => words.join(' '))
            .map((s) => (s[s.length - 1] === ',' ? s.substr(0, s.length - 1) : s))
            .map((s) => s[0].toUpperCase() + s.substring(1) + '.');
        return array(sentence, { minLength: 1, maxLength: maxCount }).map((sentences) => sentences.join(' '));
    }
    else {
        return array(loremWord(), { minLength: 1, maxLength: maxCount }).map((words) => words.map((w) => (w[w.length - 1] === ',' ? w.substr(0, w.length - 1) : w)).join(' '));
    }
}

class MemoArbitrary extends Arbitrary {
    constructor(underlying) {
        super();
        this.underlying = underlying;
        this.lastFreq = -1;
        this.lastBiased = this;
    }
    generate(mrng) {
        return this.underlying.generate(mrng);
    }
    withBias(freq) {
        if (freq !== this.lastFreq) {
            this.lastFreq = freq;
            this.lastBiased = this.underlying.withBias(freq);
        }
        return this.lastBiased;
    }
}
let contextRemainingDepth = 10;
function memo(builder) {
    const previous = {};
    return ((maxDepth) => {
        const n = maxDepth !== undefined ? maxDepth : contextRemainingDepth;
        if (!Object.prototype.hasOwnProperty.call(previous, n)) {
            const prev = contextRemainingDepth;
            contextRemainingDepth = n - 1;
            previous[n] = new MemoArbitrary(builder(n));
            contextRemainingDepth = prev;
        }
        return previous[n];
    });
}

function countToggledBits(n) {
    let count = 0;
    while (n > BigInt(0)) {
        if (n & BigInt(1))
            ++count;
        n >>= BigInt(1);
    }
    return count;
}
function computeNextFlags(flags, nextSize) {
    const allowedMask = (BigInt(1) << BigInt(nextSize)) - BigInt(1);
    const preservedFlags = flags & allowedMask;
    let numMissingFlags = countToggledBits(flags - preservedFlags);
    let nFlags = preservedFlags;
    for (let mask = BigInt(1); mask <= allowedMask && numMissingFlags !== 0; mask <<= BigInt(1)) {
        if (!(nFlags & mask)) {
            nFlags |= mask;
            --numMissingFlags;
        }
    }
    return nFlags;
}
class MixedCaseArbitrary extends Arbitrary {
    constructor(stringArb, toggleCase) {
        super();
        this.stringArb = stringArb;
        this.toggleCase = toggleCase;
    }
    computeTogglePositions(chars) {
        const positions = [];
        for (let idx = 0; idx !== chars.length; ++idx) {
            if (this.toggleCase(chars[idx]) !== chars[idx])
                positions.push(idx);
        }
        return positions;
    }
    wrapper(rawCase, chars, togglePositions, flags, flagsContext) {
        const newChars = chars.slice();
        for (let idx = 0, mask = BigInt(1); idx !== togglePositions.length; ++idx, mask <<= BigInt(1)) {
            if (flags & mask)
                newChars[togglePositions[idx]] = this.toggleCase(newChars[togglePositions[idx]]);
        }
        return new Shrinkable(newChars.join(''), () => this.shrinkImpl(rawCase, chars, togglePositions, flags, flagsContext));
    }
    shrinkImpl(rawCase, chars, togglePositions, flags, flagsContext) {
        return rawCase
            .shrink()
            .map((s) => {
            const nChars = [...s.value_];
            const nTogglePositions = this.computeTogglePositions(nChars);
            const nFlags = computeNextFlags(flags, nTogglePositions.length);
            return this.wrapper(s, nChars, nTogglePositions, nFlags, undefined);
        })
            .join(bigUintN(togglePositions.length)
            .contextualShrink(flags, flagsContext)
            .map((contextualValue) => {
            return this.wrapper(new Shrinkable(rawCase.value), chars, togglePositions, contextualValue[0], contextualValue[1]);
        }));
    }
    generate(mrng) {
        const rawCaseShrinkable = this.stringArb.generate(mrng);
        const chars = [...rawCaseShrinkable.value_];
        const togglePositions = this.computeTogglePositions(chars);
        const flagsArb = bigUintN(togglePositions.length);
        const flags = flagsArb.generate(mrng).value_;
        return this.wrapper(rawCaseShrinkable, chars, togglePositions, flags, undefined);
    }
}
function defaultToggleCase(rawChar) {
    const upper = rawChar.toUpperCase();
    if (upper !== rawChar)
        return upper;
    return rawChar.toLowerCase();
}
function mixedCase(stringArb, constraints) {
    if (typeof BigInt === 'undefined') {
        throw new Error(`mixedCase requires BigInt support`);
    }
    const toggleCase = (constraints && constraints.toggleCase) || defaultToggleCase;
    return new MixedCaseArbitrary(stringArb, toggleCase);
}

var __rest = (undefined && undefined.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
function typedIntArrayBuilder(constraints, defaultMin, defaultMax, TypedArrayClass, arbitraryBuilder) {
    const generatorName = TypedArrayClass.name;
    const { min = defaultMin, max = defaultMax } = constraints, arrayConstraints = __rest(constraints, ["min", "max"]);
    if (min > max) {
        throw new Error(`Invalid range passed to ${generatorName}: min must be lower than or equal to max`);
    }
    if (min < defaultMin) {
        throw new Error(`Invalid min value passed to ${generatorName}: min must be greater than or equal to ${defaultMin}`);
    }
    if (max > defaultMax) {
        throw new Error(`Invalid max value passed to ${generatorName}: max must be lower than or equal to ${defaultMax}`);
    }
    return array(arbitraryBuilder({ min, max }), arrayConstraints).map((data) => TypedArrayClass.from(data));
}
function int8Array(constraints = {}) {
    return typedIntArrayBuilder(constraints, -128, 127, Int8Array, integer);
}
function uint8Array(constraints = {}) {
    return typedIntArrayBuilder(constraints, 0, 255, Uint8Array, integer);
}
function uint8ClampedArray(constraints = {}) {
    return typedIntArrayBuilder(constraints, 0, 255, Uint8ClampedArray, integer);
}
function int16Array(constraints = {}) {
    return typedIntArrayBuilder(constraints, -32768, 32767, Int16Array, integer);
}
function uint16Array(constraints = {}) {
    return typedIntArrayBuilder(constraints, 0, 65535, Uint16Array, integer);
}
function int32Array(constraints = {}) {
    return typedIntArrayBuilder(constraints, -0x80000000, 0x7fffffff, Int32Array, integer);
}
function uint32Array(constraints = {}) {
    return typedIntArrayBuilder(constraints, 0, 0xffffffff, Uint32Array, integer);
}
function float32Array(constraints = {}) {
    return array(float(Object.assign(Object.assign({}, constraints), { next: true })), constraints).map((data) => Float32Array.from(data));
}
function float64Array(constraints = {}) {
    return array(double(Object.assign(Object.assign({}, constraints), { next: true })), constraints).map((data) => Float64Array.from(data));
}

function extractMaxIndex(indexesAndValues) {
    let maxIndex = -1;
    for (let index = 0; index !== indexesAndValues.length; ++index) {
        maxIndex = Math.max(maxIndex, indexesAndValues[index][0]);
    }
    return maxIndex;
}
function arrayFromItems(length, indexesAndValues) {
    const array = Array(length);
    for (let index = 0; index !== indexesAndValues.length; ++index) {
        const it = indexesAndValues[index];
        if (it[0] < length)
            array[it[0]] = it[1];
    }
    return array;
}
function sparseArray(arb, constraints = {}) {
    const { minNumElements = 0, maxNumElements = maxLengthFromMinLength(minNumElements), maxLength = Math.min(maxLengthFromMinLength(maxNumElements), 4294967295), noTrailingHole, } = constraints;
    if (minNumElements > maxLength) {
        throw new Error(`The minimal number of non-hole elements cannot be higher than the maximal length of the array`);
    }
    if (minNumElements > maxNumElements) {
        throw new Error(`The minimal number of non-hole elements cannot be higher than the maximal number of non-holes`);
    }
    const resultedMaxNumElements = Math.min(maxNumElements, maxLength);
    if (noTrailingHole) {
        const maxIndexAuthorized = Math.max(maxLength - 1, 0);
        return set(tuple(nat(maxIndexAuthorized), arb), {
            minLength: minNumElements,
            maxLength: resultedMaxNumElements,
            compare: (itemA, itemB) => itemA[0] === itemB[0],
        }).map((items) => {
            const lastIndex = extractMaxIndex(items);
            return arrayFromItems(lastIndex + 1, items);
        });
    }
    return set(tuple(nat(maxLength), arb), {
        minLength: minNumElements + 1,
        maxLength: resultedMaxNumElements + 1,
        compare: (itemA, itemB) => itemA[0] === itemB[0],
    }).map((items) => {
        const length = extractMaxIndex(items);
        return arrayFromItems(length, items);
    });
}

function boxArbitrary(arb) {
    return arb.map((v) => {
        switch (typeof v) {
            case 'boolean':
                return new Boolean(v);
            case 'number':
                return new Number(v);
            case 'string':
                return new String(v);
            default:
                return v;
        }
    });
}
class QualifiedObjectConstraints {
    constructor(key, values, maxDepth, maxKeys, withSet, withMap, withObjectString, withNullPrototype, withBigInt, withDate, withTypedArray, withSparseArray) {
        this.key = key;
        this.values = values;
        this.maxDepth = maxDepth;
        this.maxKeys = maxKeys;
        this.withSet = withSet;
        this.withMap = withMap;
        this.withObjectString = withObjectString;
        this.withNullPrototype = withNullPrototype;
        this.withBigInt = withBigInt;
        this.withDate = withDate;
        this.withTypedArray = withTypedArray;
        this.withSparseArray = withSparseArray;
    }
    static defaultValues() {
        return [
            boolean(),
            maxSafeInteger(),
            double({ next: true }),
            string(),
            oneof(string(), constant(null), constant(undefined)),
        ];
    }
    static boxArbitraries(arbs) {
        return arbs.map((arb) => boxArbitrary(arb));
    }
    static boxArbitrariesIfNeeded(arbs, boxEnabled) {
        return boxEnabled ? QualifiedObjectConstraints.boxArbitraries(arbs).concat(arbs) : arbs;
    }
    static from(settings = {}) {
        function orDefault(optionalValue, defaultValue) {
            return optionalValue !== undefined ? optionalValue : defaultValue;
        }
        return new QualifiedObjectConstraints(orDefault(settings.key, string()), QualifiedObjectConstraints.boxArbitrariesIfNeeded(orDefault(settings.values, QualifiedObjectConstraints.defaultValues()), orDefault(settings.withBoxedValues, false)), orDefault(settings.maxDepth, 2), orDefault(settings.maxKeys, 5), orDefault(settings.withSet, false), orDefault(settings.withMap, false), orDefault(settings.withObjectString, false), orDefault(settings.withNullPrototype, false), orDefault(settings.withBigInt, false), orDefault(settings.withDate, false), orDefault(settings.withTypedArray, false), orDefault(settings.withSparseArray, false));
    }
}
const anythingInternal = (constraints) => {
    const arbKeys = constraints.withObjectString
        ? memo((n) => frequency({ arbitrary: constraints.key, weight: 10 }, { arbitrary: anythingArb(n).map((o) => stringify(o)), weight: 1 }))
        : memo(() => constraints.key);
    const arbitrariesForBase = constraints.values;
    const maxDepth = constraints.maxDepth;
    const maxKeys = constraints.maxKeys;
    const entriesOf = (keyArb, valueArb) => set(tuple(keyArb, valueArb), { maxLength: maxKeys, compare: (t1, t2) => t1[0] === t2[0] });
    const mapOf = (ka, va) => entriesOf(ka, va).map((v) => new Map(v));
    const dictOf = (ka, va) => entriesOf(ka, va).map((v) => toObject(v));
    const baseArb = oneof(...arbitrariesForBase);
    const arrayBaseArb = oneof(...arbitrariesForBase.map((arb) => array(arb, { maxLength: maxKeys })));
    const objectBaseArb = (n) => oneof(...arbitrariesForBase.map((arb) => dictOf(arbKeys(n), arb)));
    const setBaseArb = () => oneof(...arbitrariesForBase.map((arb) => set(arb, 0, maxKeys).map((v) => new Set(v))));
    const mapBaseArb = (n) => oneof(...arbitrariesForBase.map((arb) => mapOf(arbKeys(n), arb)));
    const arrayArb = memo((n) => oneof(arrayBaseArb, array(anythingArb(n), { maxLength: maxKeys })));
    const setArb = memo((n) => oneof(setBaseArb(), set(anythingArb(n), 0, maxKeys).map((v) => new Set(v))));
    const mapArb = memo((n) => oneof(mapBaseArb(n), oneof(mapOf(arbKeys(n), anythingArb(n)), mapOf(anythingArb(n), anythingArb(n)))));
    const objectArb = memo((n) => oneof(objectBaseArb(n), dictOf(arbKeys(n), anythingArb(n))));
    const anythingArb = memo((n) => {
        if (n <= 0)
            return oneof(baseArb);
        return oneof(baseArb, arrayArb(), objectArb(), ...(constraints.withMap ? [mapArb()] : []), ...(constraints.withSet ? [setArb()] : []), ...(constraints.withObjectString ? [anythingArb().map((o) => stringify(o))] : []), ...(constraints.withNullPrototype ? [objectArb().map((o) => Object.assign(Object.create(null), o))] : []), ...(constraints.withBigInt ? [bigInt()] : []), ...(constraints.withDate ? [date()] : []), ...(constraints.withTypedArray
            ? [
                oneof(int8Array(), uint8Array(), uint8ClampedArray(), int16Array(), uint16Array(), int32Array(), uint32Array(), float32Array(), float64Array()),
            ]
            : []), ...(constraints.withSparseArray ? [sparseArray(anythingArb())] : []));
    });
    return anythingArb(maxDepth);
};
const objectInternal = (constraints) => {
    return dictionary(constraints.key, anythingInternal(constraints));
};
function anything(constraints) {
    return anythingInternal(QualifiedObjectConstraints.from(constraints));
}
function object(constraints) {
    return objectInternal(QualifiedObjectConstraints.from(constraints));
}
function jsonSettings(stringArbitrary, constraints) {
    const key = stringArbitrary;
    const values = [
        boolean(),
        maxSafeInteger(),
        double({ next: true, noDefaultInfinity: true, noNaN: true }),
        stringArbitrary,
        constant(null),
    ];
    return constraints != null
        ? typeof constraints === 'number'
            ? { key, values, maxDepth: constraints }
            : { key, values, maxDepth: constraints.maxDepth }
        : { key, values };
}
function jsonObject(constraints) {
    return anything(jsonSettings(string(), constraints));
}
function unicodeJsonObject(constraints) {
    return anything(jsonSettings(unicodeString(), constraints));
}
function json(constraints) {
    const arb = constraints != null ? jsonObject(constraints) : jsonObject();
    return arb.map(JSON.stringify);
}
function unicodeJson(constraints) {
    const arb = constraints != null ? unicodeJsonObject(constraints) : unicodeJsonObject();
    return arb.map(JSON.stringify);
}

function extractAllKeys(recordModel) {
    const keys = Object.keys(recordModel);
    const symbols = Object.getOwnPropertySymbols(recordModel);
    for (let index = 0; index !== symbols.length; ++index) {
        const symbol = symbols[index];
        const descriptor = Object.getOwnPropertyDescriptor(recordModel, symbol);
        if (descriptor && descriptor.enumerable) {
            keys.push(symbol);
        }
    }
    return keys;
}
function rawRecord(recordModel) {
    const keys = extractAllKeys(recordModel);
    const arbs = [];
    for (let index = 0; index !== keys.length; ++index) {
        arbs.push(recordModel[keys[index]]);
    }
    return genericTuple(arbs).map((gs) => {
        const obj = {};
        for (let idx = 0; idx !== keys.length; ++idx) {
            obj[keys[idx]] = gs[idx];
        }
        return obj;
    });
}
function record(recordModel, constraints) {
    if (constraints == null) {
        return rawRecord(recordModel);
    }
    if ('withDeletedKeys' in constraints && 'requiredKeys' in constraints) {
        throw new Error(`requiredKeys and withDeletedKeys cannot be used together in fc.record`);
    }
    const requireDeletedKeys = ('requiredKeys' in constraints && constraints.requiredKeys !== undefined) ||
        ('withDeletedKeys' in constraints && !!constraints.withDeletedKeys);
    if (!requireDeletedKeys) {
        return rawRecord(recordModel);
    }
    const updatedRecordModel = {};
    const requiredKeys = ('requiredKeys' in constraints ? constraints.requiredKeys : undefined) || [];
    for (let idx = 0; idx !== requiredKeys.length; ++idx) {
        const descriptor = Object.getOwnPropertyDescriptor(recordModel, requiredKeys[idx]);
        if (descriptor === undefined) {
            throw new Error(`requiredKeys cannot reference keys that have not been defined in recordModel`);
        }
        if (!descriptor.enumerable) {
            throw new Error(`requiredKeys cannot reference keys that have are enumerable in recordModel`);
        }
    }
    const keys = extractAllKeys(recordModel);
    for (let index = 0; index !== keys.length; ++index) {
        const k = keys[index];
        const requiredArbitrary = recordModel[k].map((v) => ({ value: v }));
        if (requiredKeys.indexOf(k) !== -1)
            updatedRecordModel[k] = requiredArbitrary;
        else
            updatedRecordModel[k] = option(requiredArbitrary);
    }
    return rawRecord(updatedRecordModel).map((rawObj) => {
        const obj = rawObj;
        const nobj = {};
        for (let index = 0; index !== keys.length; ++index) {
            const k = keys[index];
            if (obj[k] !== null) {
                nobj[k] = obj[k].value;
            }
        }
        return nobj;
    });
}

class StreamArbitrary extends Arbitrary {
    constructor(arb) {
        super();
        this.arb = arb;
    }
    generate(mrng) {
        const g = function* (arb, clonedMrng) {
            while (true)
                yield arb.generate(clonedMrng).value_;
        };
        const producer = () => new Stream(g(this.arb, mrng.clone()));
        const toString = () => `Stream(${[...producer().take(10).map(stringify)].join(',')}...)`;
        const enrichedProducer = () => Object.assign(producer(), { toString, [cloneMethod]: enrichedProducer });
        return new Shrinkable(enrichedProducer());
    }
    withBias(freq) {
        return biasWrapper(freq, this, () => new StreamArbitrary(this.arb.withBias(freq)));
    }
}
function infiniteStream(arb) {
    return new StreamArbitrary(arb);
}

class SubarrayArbitrary extends Arbitrary {
    constructor(originalArray, isOrdered, minLength, maxLength) {
        super();
        this.originalArray = originalArray;
        this.isOrdered = isOrdered;
        this.minLength = minLength;
        this.maxLength = maxLength;
        if (minLength < 0 || minLength > originalArray.length)
            throw new Error('fc.*{s|S}ubarrayOf expects the minimal length to be between 0 and the size of the original array');
        if (maxLength < 0 || maxLength > originalArray.length)
            throw new Error('fc.*{s|S}ubarrayOf expects the maximal length to be between 0 and the size of the original array');
        if (minLength > maxLength)
            throw new Error('fc.*{s|S}ubarrayOf expects the minimal length to be inferior or equal to the maximal length');
        this.lengthArb = integer(minLength, maxLength);
    }
    wrapper(items, itemsLengthContext) {
        return new Shrinkable(items, () => this.shrinkImpl(items, itemsLengthContext).map((contextualValue) => this.wrapper(contextualValue[0], contextualValue[1])));
    }
    generate(mrng) {
        const remainingElements = this.originalArray.map((_v, idx) => idx);
        const size = this.lengthArb.generate(mrng).value;
        const ids = [];
        for (let idx = 0; idx !== size; ++idx) {
            const selectedIdIndex = mrng.nextInt(0, remainingElements.length - 1);
            ids.push(remainingElements[selectedIdIndex]);
            remainingElements.splice(selectedIdIndex, 1);
        }
        if (this.isOrdered)
            ids.sort((a, b) => a - b);
        return this.wrapper(ids.map((i) => this.originalArray[i]), undefined);
    }
    shrinkImpl(items, itemsLengthContext) {
        if (items.length === 0) {
            return Stream.nil();
        }
        return this.lengthArb
            .contextualShrink(items.length, itemsLengthContext)
            .map((contextualValue) => {
            return [
                items.slice(items.length - contextualValue[0]),
                contextualValue[1],
            ];
        })
            .join(items.length > this.minLength
            ? makeLazy(() => this.shrinkImpl(items.slice(1), undefined)
                .filter((contextualValue) => this.minLength <= contextualValue[0].length + 1)
                .map((contextualValue) => [[items[0]].concat(contextualValue[0]), undefined]))
            : Stream.nil());
    }
    withBias(freq) {
        return this.minLength !== this.maxLength
            ? biasWrapper(freq, this, (originalArbitrary) => {
                return new SubarrayArbitrary(originalArbitrary.originalArray, originalArbitrary.isOrdered, originalArbitrary.minLength, originalArbitrary.minLength +
                    Math.floor(Math.log(originalArbitrary.maxLength - originalArbitrary.minLength) / Math.log(2)));
            })
            : this;
    }
}
function subarray(originalArray, ...args) {
    if (typeof args[0] === 'number' && typeof args[1] === 'number') {
        return new SubarrayArbitrary(originalArray, true, args[0], args[1]);
    }
    const ct = args[0];
    const minLength = ct !== undefined && ct.minLength !== undefined ? ct.minLength : 0;
    const maxLength = ct !== undefined && ct.maxLength !== undefined ? ct.maxLength : originalArray.length;
    return new SubarrayArbitrary(originalArray, true, minLength, maxLength);
}
function shuffledSubarray(originalArray, ...args) {
    if (typeof args[0] === 'number' && typeof args[1] === 'number') {
        return new SubarrayArbitrary(originalArray, false, args[0], args[1]);
    }
    const ct = args[0];
    const minLength = ct !== undefined && ct.minLength !== undefined ? ct.minLength : 0;
    const maxLength = ct !== undefined && ct.maxLength !== undefined ? ct.maxLength : originalArray.length;
    return new SubarrayArbitrary(originalArray, false, minLength, maxLength);
}

const padEight = (arb) => arb.map((n) => n.toString(16).padStart(8, '0'));
function uuid() {
    const padded = padEight(nat(0xffffffff));
    const secondPadded = padEight(integer(0x10000000, 0x5fffffff));
    const thirdPadded = padEight(integer(0x80000000, 0xbfffffff));
    return tuple(padded, secondPadded, thirdPadded, padded).map((t) => {
        return `${t[0]}-${t[1].substring(4)}-${t[1].substring(0, 4)}-${t[2].substring(0, 4)}-${t[2].substring(4)}${t[3]}`;
    });
}
function uuidV(versionNumber) {
    const padded = padEight(nat(0xffffffff));
    const secondPadded = padEight(nat(0x0fffffff));
    const thirdPadded = padEight(integer(0x80000000, 0xbfffffff));
    return tuple(padded, secondPadded, thirdPadded, padded).map((t) => {
        return `${t[0]}-${t[1].substring(4)}-${versionNumber}${t[1].substring(1, 4)}-${t[2].substring(0, 4)}-${t[2].substring(4)}${t[3]}`;
    });
}

function webAuthority(constraints) {
    const c = constraints || {};
    const hostnameArbs = [domain()]
        .concat(c.withIPv4 === true ? [ipV4()] : [])
        .concat(c.withIPv6 === true ? [ipV6().map((ip) => `[${ip}]`)] : [])
        .concat(c.withIPv4Extended === true ? [ipV4Extended()] : []);
    return tuple(c.withUserInfo === true ? option(hostUserInfo()) : constant(null), oneof(...hostnameArbs), c.withPort === true ? option(nat(65535)) : constant(null)).map(([u, h, p]) => (u === null ? '' : `${u}@`) + h + (p === null ? '' : `:${p}`));
}
function webSegment() {
    const others = ['-', '.', '_', '~', '!', '$', '&', "'", '(', ')', '*', '+', ',', ';', '=', ':', '@'];
    return stringOf(buildAlphaNumericPercentArb(others));
}
function uriQueryOrFragment() {
    const others = ['-', '.', '_', '~', '!', '$', '&', "'", '(', ')', '*', '+', ',', ';', '=', ':', '@', '/', '?'];
    return stringOf(buildAlphaNumericPercentArb(others));
}
function webQueryParameters() {
    return uriQueryOrFragment();
}
function webFragments() {
    return uriQueryOrFragment();
}
function webUrl(constraints) {
    const c = constraints || {};
    const validSchemes = c.validSchemes || ['http', 'https'];
    const schemeArb = constantFrom(...validSchemes);
    const authorityArb = webAuthority(c.authoritySettings);
    const pathArb = array(webSegment()).map((p) => p.map((v) => `/${v}`).join(''));
    return tuple(schemeArb, authorityArb, pathArb, c.withQueryParameters === true ? option(webQueryParameters()) : constant(null), c.withFragments === true ? option(webFragments()) : constant(null)).map(([s, a, p, q, f]) => `${s}://${a}${p}${q === null ? '' : `?${q}`}${f === null ? '' : `#${f}`}`);
}

class ReplayPath {
    static parse(replayPathStr) {
        const [serializedCount, serializedChanges] = replayPathStr.split(':');
        const counts = this.parseCounts(serializedCount);
        const changes = this.parseChanges(serializedChanges);
        return this.parseOccurences(counts, changes);
    }
    static stringify(replayPath) {
        const occurences = this.countOccurences(replayPath);
        const serializedCount = this.stringifyCounts(occurences);
        const serializedChanges = this.stringifyChanges(occurences);
        return `${serializedCount}:${serializedChanges}`;
    }
    static intToB64(n) {
        if (n < 26)
            return String.fromCharCode(n + 65);
        if (n < 52)
            return String.fromCharCode(n + 97 - 26);
        if (n < 62)
            return String.fromCharCode(n + 48 - 52);
        return String.fromCharCode(n === 62 ? 43 : 47);
    }
    static b64ToInt(c) {
        if (c >= 'a')
            return c.charCodeAt(0) - 97 + 26;
        if (c >= 'A')
            return c.charCodeAt(0) - 65;
        if (c >= '0')
            return c.charCodeAt(0) - 48 + 52;
        return c === '+' ? 62 : 63;
    }
    static countOccurences(replayPath) {
        return replayPath.reduce((counts, cur) => {
            if (counts.length === 0 || counts[counts.length - 1].count === 64 || counts[counts.length - 1].value !== cur)
                counts.push({ value: cur, count: 1 });
            else
                counts[counts.length - 1].count += 1;
            return counts;
        }, []);
    }
    static parseOccurences(counts, changes) {
        const replayPath = [];
        for (let idx = 0; idx !== counts.length; ++idx) {
            const count = counts[idx];
            const value = changes[idx];
            for (let num = 0; num !== count; ++num)
                replayPath.push(value);
        }
        return replayPath;
    }
    static stringifyChanges(occurences) {
        let serializedChanges = '';
        for (let idx = 0; idx < occurences.length; idx += 6) {
            const changesInt = occurences
                .slice(idx, idx + 6)
                .reduceRight((prev, cur) => prev * 2 + (cur.value ? 1 : 0), 0);
            serializedChanges += this.intToB64(changesInt);
        }
        return serializedChanges;
    }
    static parseChanges(serializedChanges) {
        const changesInt = serializedChanges.split('').map((c) => this.b64ToInt(c));
        const changes = [];
        for (let idx = 0; idx !== changesInt.length; ++idx) {
            let current = changesInt[idx];
            for (let n = 0; n !== 6; ++n, current >>= 1) {
                changes.push(current % 2 === 1);
            }
        }
        return changes;
    }
    static stringifyCounts(occurences) {
        return occurences.map(({ count }) => this.intToB64(count - 1)).join('');
    }
    static parseCounts(serializedCount) {
        return serializedCount.split('').map((c) => this.b64ToInt(c) + 1);
    }
}

class CommandsIterable {
    constructor(commands, metadataForReplay) {
        this.commands = commands;
        this.metadataForReplay = metadataForReplay;
    }
    [Symbol.iterator]() {
        return this.commands[Symbol.iterator]();
    }
    [cloneMethod]() {
        return new CommandsIterable(this.commands.map((c) => c.clone()), this.metadataForReplay);
    }
    toString() {
        const serializedCommands = this.commands
            .filter((c) => c.hasRan)
            .map((c) => c.toString())
            .join(',');
        const metadata = this.metadataForReplay();
        return metadata.length !== 0 ? `${serializedCommands} /*${metadata}*/` : serializedCommands;
    }
}

class CommandWrapper {
    constructor(cmd) {
        this.cmd = cmd;
        this.hasRan = false;
    }
    check(m) {
        return this.cmd.check(m);
    }
    run(m, r) {
        this.hasRan = true;
        return this.cmd.run(m, r);
    }
    clone() {
        if (hasCloneMethod(this.cmd))
            return new CommandWrapper(this.cmd[cloneMethod]());
        return new CommandWrapper(this.cmd);
    }
    toString() {
        return this.cmd.toString();
    }
}

class CommandsArbitrary extends Arbitrary {
    constructor(commandArbs, maxCommands, sourceReplayPath, disableReplayLog) {
        super();
        this.sourceReplayPath = sourceReplayPath;
        this.disableReplayLog = disableReplayLog;
        this.oneCommandArb = oneof(...commandArbs).map((c) => new CommandWrapper(c));
        this.lengthArb = nat(maxCommands);
        this.replayPath = [];
        this.replayPathPosition = 0;
    }
    metadataForReplay() {
        return this.disableReplayLog ? '' : `replayPath=${JSON.stringify(ReplayPath.stringify(this.replayPath))}`;
    }
    wrapper(items, shrunkOnce) {
        return new Shrinkable(new CommandsIterable(items.map((s) => s.value_), () => this.metadataForReplay()), () => this.shrinkImpl(items, shrunkOnce).map((v) => this.wrapper(v, true)));
    }
    generate(mrng) {
        const size = this.lengthArb.generate(mrng);
        const items = Array(size.value_);
        for (let idx = 0; idx !== size.value_; ++idx) {
            const item = this.oneCommandArb.generate(mrng);
            items[idx] = item;
        }
        this.replayPathPosition = 0;
        return this.wrapper(items, false);
    }
    filterOnExecution(itemsRaw) {
        const items = [];
        for (const c of itemsRaw) {
            if (c.value_.hasRan) {
                this.replayPath.push(true);
                items.push(c);
            }
            else
                this.replayPath.push(false);
        }
        return items;
    }
    filterOnReplay(itemsRaw) {
        return itemsRaw.filter((c, idx) => {
            const state = this.replayPath[this.replayPathPosition + idx];
            if (state === undefined)
                throw new Error(`Too short replayPath`);
            if (!state && c.value_.hasRan)
                throw new Error(`Mismatch between replayPath and real execution`);
            return state;
        });
    }
    filterForShrinkImpl(itemsRaw) {
        if (this.replayPathPosition === 0) {
            this.replayPath = this.sourceReplayPath !== null ? ReplayPath.parse(this.sourceReplayPath) : [];
        }
        const items = this.replayPathPosition < this.replayPath.length
            ? this.filterOnReplay(itemsRaw)
            : this.filterOnExecution(itemsRaw);
        this.replayPathPosition += itemsRaw.length;
        return items;
    }
    shrinkImpl(itemsRaw, shrunkOnce) {
        const items = this.filterForShrinkImpl(itemsRaw);
        if (items.length === 0) {
            return Stream.nil();
        }
        const rootShrink = shrunkOnce
            ? Stream.nil()
            : new Stream([[]][Symbol.iterator]());
        const nextShrinks = [];
        for (let numToKeep = 0; numToKeep !== items.length; ++numToKeep) {
            nextShrinks.push(makeLazy(() => {
                const size = this.lengthArb.contextualShrinkableFor(items.length - 1 - numToKeep);
                const fixedStart = items.slice(0, numToKeep);
                return size.shrink().map((l) => fixedStart.concat(items.slice(items.length - (l.value + 1))));
            }));
        }
        for (let itemAt = 0; itemAt !== items.length; ++itemAt) {
            nextShrinks.push(makeLazy(() => items[itemAt].shrink().map((v) => items.slice(0, itemAt).concat([v], items.slice(itemAt + 1)))));
        }
        return rootShrink.join(...nextShrinks).map((shrinkables) => {
            return shrinkables.map((c) => {
                return new Shrinkable(c.value_.clone(), c.shrink);
            });
        });
    }
}
function commands(commandArbs, constraints) {
    const config = constraints == null ? {} : typeof constraints === 'number' ? { maxCommands: constraints } : constraints;
    return new CommandsArbitrary(commandArbs, config.maxCommands != null ? config.maxCommands : 10, config.replayPath != null ? config.replayPath : null, !!config.disableReplayLog);
}

class ScheduledCommand {
    constructor(s, cmd) {
        this.s = s;
        this.cmd = cmd;
    }
    async check(m) {
        let error = null;
        let checkPassed = false;
        const status = await this.s.scheduleSequence([
            {
                label: `check@${this.cmd.toString()}`,
                builder: async () => {
                    try {
                        checkPassed = await Promise.resolve(this.cmd.check(m));
                    }
                    catch (err) {
                        error = err;
                        throw err;
                    }
                },
            },
        ]).task;
        if (status.faulty) {
            throw error;
        }
        return checkPassed;
    }
    async run(m, r) {
        let error = null;
        const status = await this.s.scheduleSequence([
            {
                label: `run@${this.cmd.toString()}`,
                builder: async () => {
                    try {
                        await this.cmd.run(m, r);
                    }
                    catch (err) {
                        error = err;
                        throw err;
                    }
                },
            },
        ]).task;
        if (status.faulty) {
            throw error;
        }
    }
}
const scheduleCommands = function* (s, cmds) {
    for (const cmd of cmds) {
        yield new ScheduledCommand(s, cmd);
    }
};

const genericModelRun = (s, cmds, initialValue, runCmd, then) => {
    return s.then((o) => {
        const { model, real } = o;
        let state = initialValue;
        for (const c of cmds) {
            state = then(state, () => {
                return runCmd(c, model, real);
            });
        }
        return state;
    });
};
const internalModelRun = (s, cmds) => {
    const then = (_p, c) => c();
    const setupProducer = {
        then: (fun) => {
            fun(s());
            return undefined;
        },
    };
    const runSync = (cmd, m, r) => {
        if (cmd.check(m))
            cmd.run(m, r);
        return undefined;
    };
    return genericModelRun(setupProducer, cmds, undefined, runSync, then);
};
const isAsyncSetup = (s) => {
    return typeof s.then === 'function';
};
const internalAsyncModelRun = async (s, cmds, defaultPromise = Promise.resolve()) => {
    const then = (p, c) => p.then(c);
    const setupProducer = {
        then: (fun) => {
            const out = s();
            if (isAsyncSetup(out))
                return out.then(fun);
            else
                return fun(out);
        },
    };
    const runAsync = async (cmd, m, r) => {
        if (await cmd.check(m))
            await cmd.run(m, r);
    };
    return await genericModelRun(setupProducer, cmds, defaultPromise, runAsync, then);
};
function modelRun(s, cmds) {
    internalModelRun(s, cmds);
}
async function asyncModelRun(s, cmds) {
    await internalAsyncModelRun(s, cmds);
}
async function scheduledModelRun(scheduler, s, cmds) {
    const scheduledCommands = scheduleCommands(scheduler, cmds);
    const out = internalAsyncModelRun(s, scheduledCommands, scheduler.schedule(Promise.resolve(), 'startModel'));
    await scheduler.waitAll();
    await out;
}

class SchedulerImplem {
    constructor(act, taskSelector) {
        this.act = act;
        this.taskSelector = taskSelector;
        this.lastTaskId = 0;
        this.sourceTaskSelector = taskSelector.clone();
        this.scheduledTasks = [];
        this.triggeredTasks = [];
    }
    static buildLog(reportItem) {
        return `[task\${${reportItem.taskId}}] ${reportItem.label.length !== 0 ? `${reportItem.schedulingType}::${reportItem.label}` : reportItem.schedulingType} ${reportItem.status}${reportItem.outputValue !== undefined ? ` with value ${escapeForTemplateString(reportItem.outputValue)}` : ''}`;
    }
    log(schedulingType, taskId, label, metadata, status, data) {
        this.triggeredTasks.push({
            status,
            schedulingType,
            taskId,
            label,
            metadata,
            outputValue: data !== undefined ? stringify(data) : undefined,
        });
    }
    scheduleInternal(schedulingType, label, task, metadata, thenTaskToBeAwaited) {
        let trigger = null;
        const taskId = ++this.lastTaskId;
        const scheduledPromise = new Promise((resolve, reject) => {
            trigger = () => {
                (thenTaskToBeAwaited ? task.then(() => thenTaskToBeAwaited()) : task).then((data) => {
                    this.log(schedulingType, taskId, label, metadata, 'resolved', data);
                    return resolve(data);
                }, (err) => {
                    this.log(schedulingType, taskId, label, metadata, 'rejected', err);
                    return reject(err);
                });
            };
        });
        this.scheduledTasks.push({
            original: task,
            scheduled: scheduledPromise,
            trigger: trigger,
            schedulingType,
            taskId,
            label,
            metadata,
        });
        return scheduledPromise;
    }
    schedule(task, label, metadata) {
        return this.scheduleInternal('promise', label || '', task, metadata);
    }
    scheduleFunction(asyncFunction) {
        return (...args) => this.scheduleInternal('function', `${asyncFunction.name}(${args.map(stringify).join(',')})`, asyncFunction(...args), undefined);
    }
    scheduleSequence(sequenceBuilders) {
        const status = { done: false, faulty: false };
        const dummyResolvedPromise = { then: (f) => f() };
        let resolveSequenceTask = () => { };
        const sequenceTask = new Promise((resolve) => (resolveSequenceTask = resolve));
        sequenceBuilders
            .reduce((previouslyScheduled, item) => {
            const [builder, label, metadata] = typeof item === 'function' ? [item, item.name, undefined] : [item.builder, item.label, item.metadata];
            return previouslyScheduled.then(() => {
                const scheduled = this.scheduleInternal('sequence', label, dummyResolvedPromise, metadata, () => builder());
                scheduled.catch(() => {
                    status.faulty = true;
                    resolveSequenceTask();
                });
                return scheduled;
            });
        }, dummyResolvedPromise)
            .then(() => {
            status.done = true;
            resolveSequenceTask();
        }, () => {
        });
        return Object.assign(status, {
            task: Promise.resolve(sequenceTask).then(() => {
                return { done: status.done, faulty: status.faulty };
            }),
        });
    }
    count() {
        return this.scheduledTasks.length;
    }
    async internalWaitOne() {
        if (this.scheduledTasks.length === 0) {
            throw new Error('No task scheduled');
        }
        const taskIndex = this.taskSelector.nextTaskIndex(this.scheduledTasks);
        const [scheduledTask] = this.scheduledTasks.splice(taskIndex, 1);
        scheduledTask.trigger();
        try {
            await scheduledTask.scheduled;
        }
        catch (_err) {
        }
    }
    async waitOne() {
        await this.act(async () => await this.internalWaitOne());
    }
    async waitAll() {
        while (this.scheduledTasks.length > 0) {
            await this.waitOne();
        }
    }
    report() {
        return [
            ...this.triggeredTasks,
            ...this.scheduledTasks.map((t) => ({
                status: 'pending',
                schedulingType: t.schedulingType,
                taskId: t.taskId,
                label: t.label,
                metadata: t.metadata,
            })),
        ];
    }
    toString() {
        return ('schedulerFor()`\n' +
            this.report()
                .map(SchedulerImplem.buildLog)
                .map((log) => `-> ${log}`)
                .join('\n') +
            '`');
    }
    [cloneMethod]() {
        return new SchedulerImplem(this.act, this.sourceTaskSelector);
    }
}
class SchedulerArbitrary extends Arbitrary {
    constructor(act) {
        super();
        this.act = act;
    }
    generate(mrng) {
        const buildNextTaskIndex = (r) => {
            return {
                clone: () => buildNextTaskIndex(r.clone()),
                nextTaskIndex: (scheduledTasks) => {
                    return r.nextInt(0, scheduledTasks.length - 1);
                },
            };
        };
        return new Shrinkable(new SchedulerImplem(this.act, buildNextTaskIndex(mrng.clone())));
    }
}
function scheduler(constraints) {
    const { act = (f) => f() } = constraints || {};
    return new SchedulerArbitrary(act);
}
function schedulerFor(customOrderingOrConstraints, constraintsOrUndefined) {
    const { act = (f) => f() } = Array.isArray(customOrderingOrConstraints)
        ? constraintsOrUndefined || {}
        : customOrderingOrConstraints || {};
    const buildSchedulerFor = function (ordering) {
        const buildNextTaskIndex = () => {
            let numTasks = 0;
            return {
                clone: () => buildNextTaskIndex(),
                nextTaskIndex: (scheduledTasks) => {
                    if (ordering.length <= numTasks) {
                        throw new Error(`Invalid schedulerFor defined: too many tasks have been scheduled`);
                    }
                    const taskIndex = scheduledTasks.findIndex((t) => t.taskId === ordering[numTasks]);
                    if (taskIndex === -1) {
                        throw new Error(`Invalid schedulerFor defined: unable to find next task`);
                    }
                    ++numTasks;
                    return taskIndex;
                },
            };
        };
        return new SchedulerImplem(act, buildNextTaskIndex());
    };
    if (Array.isArray(customOrderingOrConstraints)) {
        return buildSchedulerFor(customOrderingOrConstraints);
    }
    else {
        return function (_strs, ...ordering) {
            return buildSchedulerFor(ordering);
        };
    }
}

class ArbitraryWithShrink extends Arbitrary {
    shrinkableFor(value, shrunkOnce) {
        return new Shrinkable(value, () => this.shrink(value, shrunkOnce === true).map((v) => this.shrinkableFor(v, true)));
    }
}

const __type$1 = 'module';
const __version$1 = '2.14.0';
const __commitHash$1 = 'fada009c1dd3993f57b9dc431a341932c79c366f';

var fc = /*#__PURE__*/Object.freeze({
    __proto__: null,
    __type: __type$1,
    __version: __version$1,
    __commitHash: __commitHash$1,
    sample: sample,
    statistics: statistics,
    check: check,
    assert: assert,
    pre: pre,
    PreconditionFailure: PreconditionFailure,
    property: property,
    asyncProperty: asyncProperty,
    boolean: boolean,
    falsy: falsy,
    float: float,
    double: double,
    integer: integer,
    nat: nat,
    maxSafeInteger: maxSafeInteger,
    maxSafeNat: maxSafeNat,
    bigIntN: bigIntN,
    bigUintN: bigUintN,
    bigInt: bigInt,
    bigUint: bigUint,
    char: char,
    ascii: ascii,
    char16bits: char16bits,
    unicode: unicode,
    fullUnicode: fullUnicode,
    hexa: hexa,
    base64: base64,
    mixedCase: mixedCase,
    string: string,
    asciiString: asciiString,
    string16bits: string16bits,
    stringOf: stringOf,
    unicodeString: unicodeString,
    fullUnicodeString: fullUnicodeString,
    hexaString: hexaString,
    base64String: base64String,
    lorem: lorem,
    constant: constant,
    constantFrom: constantFrom,
    clonedConstant: clonedConstant,
    mapToConstant: mapToConstant,
    option: option,
    oneof: oneof,
    frequency: frequency,
    clone: clone,
    dedup: dedup,
    shuffledSubarray: shuffledSubarray,
    subarray: subarray,
    array: array,
    sparseArray: sparseArray,
    infiniteStream: infiniteStream,
    set: set,
    tuple: tuple,
    genericTuple: genericTuple,
    record: record,
    dictionary: dictionary,
    anything: anything,
    object: object,
    json: json,
    jsonObject: jsonObject,
    unicodeJson: unicodeJson,
    unicodeJsonObject: unicodeJsonObject,
    letrec: letrec,
    memo: memo,
    compareBooleanFunc: compareBooleanFunc,
    compareFunc: compareFunc,
    func: func,
    context: context,
    date: date,
    ipV4: ipV4,
    ipV4Extended: ipV4Extended,
    ipV6: ipV6,
    domain: domain,
    webAuthority: webAuthority,
    webSegment: webSegment,
    webFragments: webFragments,
    webQueryParameters: webQueryParameters,
    webUrl: webUrl,
    emailAddress: emailAddress,
    uuid: uuid,
    uuidV: uuidV,
    int8Array: int8Array,
    uint8Array: uint8Array,
    uint8ClampedArray: uint8ClampedArray,
    int16Array: int16Array,
    uint16Array: uint16Array,
    int32Array: int32Array,
    uint32Array: uint32Array,
    float32Array: float32Array,
    float64Array: float64Array,
    asyncModelRun: asyncModelRun,
    modelRun: modelRun,
    scheduledModelRun: scheduledModelRun,
    commands: commands,
    scheduler: scheduler,
    schedulerFor: schedulerFor,
    Arbitrary: Arbitrary,
    ArbitraryWithShrink: ArbitraryWithShrink,
    ArbitraryWithContextualShrink: ArbitraryWithContextualShrink,
    Shrinkable: Shrinkable,
    cloneMethod: cloneMethod,
    stringify: stringify,
    defaultReportMessage: defaultReportMessage,
    hash: hash,
    get VerbosityLevel () { return VerbosityLevel; },
    configureGlobal: configureGlobal,
    readConfigureGlobal: readConfigureGlobal,
    resetConfigureGlobal: resetConfigureGlobal,
    get ExecutionStatus () { return ExecutionStatus; },
    Random: Random,
    Stream: Stream,
    stream: stream
});

export default fc;
export { array, hexaString, integer, tuple };
