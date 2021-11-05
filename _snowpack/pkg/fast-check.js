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
function* takeNHelper(g, n) {
    for (let i = 0; i < n; ++i) {
        const cur = g.next();
        if (cur.done) {
            break;
        }
        yield cur.value;
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
        return new Stream(takeNHelper(this.g, n));
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
function hasCloneMethod(instance) {
    return (instance !== null &&
        (typeof instance === 'object' || typeof instance === 'function') &&
        cloneMethod in instance &&
        typeof instance[cloneMethod] === 'function');
}
function cloneIfNeeded(instance) {
    return hasCloneMethod(instance) ? instance[cloneMethod]() : instance;
}

class Shrinkable {
    constructor(value_, shrink = () => Stream.nil(), customGetValue = undefined) {
        this.value_ = value_;
        this.shrink = shrink;
        this.hasToBeCloned = customGetValue !== undefined || hasCloneMethod(value_);
        this.readOnce = false;
        if (this.hasToBeCloned) {
            Object.defineProperty(this, 'value', { get: customGetValue !== undefined ? customGetValue : this.getValue });
        }
        else {
            this.value = value_;
        }
    }
    getValue() {
        if (!this.readOnce) {
            this.readOnce = true;
            return this.value_;
        }
        return this.value_[cloneMethod]();
    }
    applyMapper(mapper) {
        if (this.hasToBeCloned) {
            const out = mapper(this.value);
            if (out instanceof Object) {
                out[cloneMethod] = () => this.applyMapper(mapper);
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
            return refinement(s.value_);
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
function assertIsArbitrary(instance) {
    if (typeof instance !== 'object' || instance === null || !('generate' in instance)) {
        throw new Error('Unexpected value received: not an instance of Arbitrary');
    }
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

class NextValue {
    constructor(value_, context, customGetValue = undefined) {
        this.value_ = value_;
        this.context = context;
        this.hasToBeCloned = customGetValue !== undefined || hasCloneMethod(value_);
        this.readOnce = false;
        if (this.hasToBeCloned) {
            Object.defineProperty(this, 'value', { get: customGetValue !== undefined ? customGetValue : this.getValue });
        }
        else {
            this.value = value_;
        }
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
}

class NextArbitrary {
    filter(refinement) {
        return new FilterArbitrary$1(this, refinement);
    }
    map(mapper, unmapper) {
        return new MapArbitrary$1(this, mapper, unmapper);
    }
    chain(chainer) {
        return new ChainArbitrary$1(this, chainer);
    }
    noShrink() {
        return new NoShrinkArbitrary$1(this);
    }
    noBias() {
        return new NoBiasArbitrary$1(this);
    }
}
class ChainArbitrary$1 extends NextArbitrary {
    constructor(arb, chainer) {
        super();
        this.arb = arb;
        this.chainer = chainer;
    }
    generate(mrng, biasFactor) {
        const clonedMrng = mrng.clone();
        const src = this.arb.generate(mrng, biasFactor);
        return this.valueChainer(src, mrng, clonedMrng, biasFactor);
    }
    canShrinkWithoutContext(value) {
        return false;
    }
    shrink(value, context) {
        if (this.isSafeContext(context)) {
            return (!context.stoppedForOriginal
                ? this.arb
                    .shrink(context.originalValue, context.originalContext)
                    .map((v) => this.valueChainer(v, context.clonedMrng.clone(), context.clonedMrng, context.originalBias))
                : Stream.nil()).join(context.chainedArbitrary.shrink(value, context.chainedContext).map((dst) => {
                const newContext = Object.assign(Object.assign({}, context), { chainedContext: dst.context, stoppedForOriginal: true });
                return new NextValue(dst.value_, newContext);
            }));
        }
        return Stream.nil();
    }
    valueChainer(v, generateMrng, clonedMrng, biasFactor) {
        const chainedArbitrary = this.chainer(v.value_);
        const dst = chainedArbitrary.generate(generateMrng, biasFactor);
        const context = {
            originalBias: biasFactor,
            originalValue: v.value_,
            originalContext: v.context,
            stoppedForOriginal: false,
            chainedArbitrary,
            chainedContext: dst.context,
            clonedMrng,
        };
        return new NextValue(dst.value_, context);
    }
    isSafeContext(context) {
        return (context != null &&
            typeof context === 'object' &&
            'originalBias' in context &&
            'originalValue' in context &&
            'originalContext' in context &&
            'stoppedForOriginal' in context &&
            'chainedArbitrary' in context &&
            'chainedContext' in context &&
            'clonedMrng' in context);
    }
}
class MapArbitrary$1 extends NextArbitrary {
    constructor(arb, mapper, unmapper) {
        super();
        this.arb = arb;
        this.mapper = mapper;
        this.unmapper = unmapper;
        this.bindValueMapper = this.valueMapper.bind(this);
    }
    generate(mrng, biasFactor) {
        const g = this.arb.generate(mrng, biasFactor);
        return this.valueMapper(g);
    }
    canShrinkWithoutContext(value) {
        if (this.unmapper !== undefined) {
            try {
                const unmapped = this.unmapper(value);
                return this.arb.canShrinkWithoutContext(unmapped);
            }
            catch (_err) {
                return false;
            }
        }
        return false;
    }
    shrink(value, context) {
        if (this.isSafeContext(context)) {
            return this.arb.shrink(context.originalValue, context.originalContext).map(this.bindValueMapper);
        }
        if (this.unmapper !== undefined) {
            const unmapped = this.unmapper(value);
            return this.arb.shrink(unmapped, undefined).map(this.bindValueMapper);
        }
        return Stream.nil();
    }
    mapperWithCloneIfNeeded(v) {
        const sourceValue = v.value;
        const mappedValue = this.mapper(sourceValue);
        if (v.hasToBeCloned &&
            ((typeof mappedValue === 'object' && mappedValue !== null) || typeof mappedValue === 'function') &&
            Object.isExtensible(mappedValue) &&
            !hasCloneMethod(mappedValue)) {
            Object.defineProperty(mappedValue, cloneMethod, { get: () => () => this.mapperWithCloneIfNeeded(v)[0] });
        }
        return [mappedValue, sourceValue];
    }
    valueMapper(v) {
        const [mappedValue, sourceValue] = this.mapperWithCloneIfNeeded(v);
        const context = { originalValue: sourceValue, originalContext: v.context };
        return new NextValue(mappedValue, context);
    }
    isSafeContext(context) {
        return (context != null &&
            typeof context === 'object' &&
            'originalValue' in context &&
            'originalContext' in context);
    }
}
class FilterArbitrary$1 extends NextArbitrary {
    constructor(arb, refinement) {
        super();
        this.arb = arb;
        this.refinement = refinement;
        this.bindRefinementOnValue = this.refinementOnValue.bind(this);
    }
    generate(mrng, biasFactor) {
        while (true) {
            const g = this.arb.generate(mrng, biasFactor);
            if (this.refinementOnValue(g)) {
                return g;
            }
        }
    }
    canShrinkWithoutContext(value) {
        return this.arb.canShrinkWithoutContext(value) && this.refinement(value);
    }
    shrink(value, context) {
        return this.arb.shrink(value, context).filter(this.bindRefinementOnValue);
    }
    refinementOnValue(v) {
        return this.refinement(v.value);
    }
}
class NoShrinkArbitrary$1 extends NextArbitrary {
    constructor(arb) {
        super();
        this.arb = arb;
    }
    generate(mrng, biasFactor) {
        return this.arb.generate(mrng, biasFactor);
    }
    canShrinkWithoutContext(value) {
        return this.arb.canShrinkWithoutContext(value);
    }
    shrink(_value, _context) {
        return Stream.nil();
    }
    noShrink() {
        return this;
    }
}
class NoBiasArbitrary$1 extends NextArbitrary {
    constructor(arb) {
        super();
        this.arb = arb;
    }
    generate(mrng, _biasFactor) {
        return this.arb.generate(mrng, undefined);
    }
    canShrinkWithoutContext(value) {
        return this.arb.canShrinkWithoutContext(value);
    }
    shrink(value, context) {
        return this.arb.shrink(value, context);
    }
    noBias() {
        return this;
    }
}
function assertIsNextArbitrary(instance) {
    if (typeof instance !== 'object' ||
        instance === null ||
        !('generate' in instance) ||
        !('shrink' in instance) ||
        'shrinkableFor' in instance) {
        throw new Error('Unexpected value received: not an instance of NextArbitrary');
    }
}

var _a;
const identifier = '__ConverterToNext__';
function fromShrinkableToNextValue(g) {
    if (!g.hasToBeCloned) {
        return new NextValue(g.value_, g);
    }
    return new NextValue(g.value_, g, () => g.value);
}
class ConverterToNext extends NextArbitrary {
    constructor(arb) {
        super();
        this.arb = arb;
        this[_a] = true;
    }
    static isConverterToNext(arb) {
        return identifier in arb;
    }
    static convertIfNeeded(arb) {
        if (ConverterFromNext.isConverterFromNext(arb))
            return arb.arb;
        else
            return new ConverterToNext(arb);
    }
    generate(mrng, biasFactor) {
        const g = biasFactor !== undefined ? this.arb.withBias(biasFactor).generate(mrng) : this.arb.generate(mrng);
        return fromShrinkableToNextValue(g);
    }
    canShrinkWithoutContext(_value) {
        return false;
    }
    shrink(_value, context) {
        if (this.isSafeContext(context)) {
            return context.shrink().map(fromShrinkableToNextValue);
        }
        return Stream.nil();
    }
    isSafeContext(context) {
        return (context != null && typeof context === 'object' && 'value' in context && 'shrink' in context);
    }
    filter(refinement) {
        return ConverterToNext.convertIfNeeded(this.arb.filter(refinement));
    }
    map(mapper) {
        return ConverterToNext.convertIfNeeded(this.arb.map(mapper));
    }
    chain(fmapper) {
        return ConverterToNext.convertIfNeeded(this.arb.chain((t) => {
            const fmapped = fmapper(t);
            if (ConverterToNext.isConverterToNext(fmapped))
                return fmapped.arb;
            else
                return new ConverterFromNext(fmapped);
        }));
    }
    noShrink() {
        return ConverterToNext.convertIfNeeded(this.arb.noShrink());
    }
    noBias() {
        return ConverterToNext.convertIfNeeded(this.arb.noBias());
    }
}
_a = identifier;

var _a$1;
const identifier$1 = '__ConverterFromNext__';
function fromNextValueToShrinkableFor(arb) {
    return function fromNextValueToShrinkable(v) {
        const value_ = v.value_;
        const shrinker = () => arb.shrink(value_, v.context).map(fromNextValueToShrinkable);
        if (!v.hasToBeCloned) {
            return new Shrinkable(value_, shrinker);
        }
        return new Shrinkable(value_, shrinker, () => v.value);
    };
}
class ConverterFromNext extends ArbitraryWithContextualShrink {
    constructor(arb, legacyShrunkOnceContext, biasFactor = undefined) {
        super();
        this.arb = arb;
        this.legacyShrunkOnceContext = legacyShrunkOnceContext;
        this.biasFactor = biasFactor;
        this[_a$1] = true;
        this.toShrinkable = fromNextValueToShrinkableFor(arb);
    }
    static isConverterFromNext(arb) {
        return identifier$1 in arb;
    }
    static convertIfNeeded(arb) {
        if (ConverterToNext.isConverterToNext(arb))
            return arb.arb;
        else
            return new ConverterFromNext(arb);
    }
    generate(mrng) {
        const g = this.arb.generate(mrng, this.biasFactor);
        return this.toShrinkable(g);
    }
    contextualShrink(value, context) {
        return this.arb.shrink(value, context).map((v) => [v.value_, v.context]);
    }
    shrunkOnceContext() {
        return this.legacyShrunkOnceContext;
    }
    filter(refinement) {
        return ConverterFromNext.convertIfNeeded(this.arb.filter(refinement));
    }
    map(mapper) {
        return ConverterFromNext.convertIfNeeded(this.arb.map(mapper));
    }
    chain(fmapper) {
        return ConverterFromNext.convertIfNeeded(this.arb.chain((t) => {
            const fmapped = fmapper(t);
            if (ConverterFromNext.isConverterFromNext(fmapped))
                return fmapped.arb;
            else
                return new ConverterToNext(fmapped);
        }));
    }
    noShrink() {
        return ConverterFromNext.convertIfNeeded(this.arb.noShrink());
    }
    withBias(freq) {
        return new ConverterFromNext(this.arb, this.legacyShrunkOnceContext, freq);
    }
    noBias() {
        return ConverterFromNext.convertIfNeeded(this.arb.noBias());
    }
}
_a$1 = identifier$1;

function convertFromNext(arb) {
    if (ConverterToNext.isConverterToNext(arb)) {
        return arb.arb;
    }
    assertIsNextArbitrary(arb);
    return new ConverterFromNext(arb);
}
function convertFromNextWithShrunkOnce(arb, legacyShrunkOnceContext) {
    if (ConverterToNext.isConverterToNext(arb)) {
        if (!('contextualShrink' in arb.arb) ||
            !('contextualShrinkableFor' in arb.arb) ||
            !('shrunkOnceContext' in arb.arb) ||
            !('shrink' in arb.arb) ||
            !('shrinkableFor' in arb.arb)) {
            throw new Error('Conversion rejected: Underlying arbitrary is not compatible with ArbitraryWithContextualShrink');
        }
        return arb.arb;
    }
    assertIsNextArbitrary(arb);
    return new ConverterFromNext(arb, legacyShrunkOnceContext);
}
function convertToNext(arb) {
    if (ConverterFromNext.isConverterFromNext(arb)) {
        return arb.arb;
    }
    assertIsArbitrary(arb);
    return new ConverterToNext(arb);
}

class TupleArbitrary extends NextArbitrary {
    constructor(arbs) {
        super();
        this.arbs = arbs;
        for (let idx = 0; idx !== arbs.length; ++idx) {
            const arb = arbs[idx];
            if (arb == null || arb.generate == null)
                throw new Error(`Invalid parameter encountered at index ${idx}: expecting an Arbitrary`);
        }
    }
    static makeItCloneable(vs, values) {
        return Object.defineProperty(vs, cloneMethod, {
            value: () => {
                const cloned = [];
                for (let idx = 0; idx !== values.length; ++idx) {
                    cloned.push(values[idx].value);
                }
                TupleArbitrary.makeItCloneable(cloned, values);
                return cloned;
            },
        });
    }
    static wrapper(values) {
        let cloneable = false;
        const vs = [];
        const ctxs = [];
        for (let idx = 0; idx !== values.length; ++idx) {
            const v = values[idx];
            cloneable = cloneable || v.hasToBeCloned;
            vs.push(v.value);
            ctxs.push(v.context);
        }
        if (cloneable) {
            TupleArbitrary.makeItCloneable(vs, values);
        }
        return new NextValue(vs, ctxs);
    }
    generate(mrng, biasFactor) {
        return TupleArbitrary.wrapper(this.arbs.map((a) => a.generate(mrng, biasFactor)));
    }
    canShrinkWithoutContext(value) {
        if (!Array.isArray(value) || value.length !== this.arbs.length) {
            return false;
        }
        for (let index = 0; index !== this.arbs.length; ++index) {
            if (!this.arbs[index].canShrinkWithoutContext(value[index])) {
                return false;
            }
        }
        return true;
    }
    shrink(value, context) {
        let s = Stream.nil();
        const safeContext = Array.isArray(context) ? context : [];
        for (let idx = 0; idx !== this.arbs.length; ++idx) {
            const shrinksForIndex = this.arbs[idx]
                .shrink(value[idx], safeContext[idx])
                .map((v) => {
                const nextValues = value.map((v, idx) => new NextValue(cloneIfNeeded(v), safeContext[idx]));
                return nextValues
                    .slice(0, idx)
                    .concat([v])
                    .concat(nextValues.slice(idx + 1));
            })
                .map((values) => TupleArbitrary.wrapper(values));
            s = s.join(shrinksForIndex);
        }
        return s;
    }
}

function genericTuple(arbs) {
    const nextArbs = arbs.map((arb) => convertToNext(arb));
    return convertFromNext(new TupleArbitrary(nextArbs));
}

const runIdToFrequency = (runId) => 2 + Math.floor(Math.log(runId + 1) / Math.log(10));

let globalParameters = {};
function configureGlobal(parameters) {
    globalParameters = parameters;
}
function readConfigureGlobal() {
    return globalParameters;
}
function resetConfigureGlobal() {
    globalParameters = {};
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
        if (ConverterFromNext.isConverterFromNext(this.arb)) {
            return this.arb.toShrinkable(this.arb.arb.generate(mrng, runId != null ? runIdToFrequency(runId) : undefined));
        }
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
        const { beforeEach = Property.dummyHook, afterEach = Property.dummyHook, asyncBeforeEach, asyncAfterEach, } = readConfigureGlobal() || {};
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
        if (ConverterFromNext.isConverterFromNext(this.arb)) {
            return this.arb.toShrinkable(this.arb.arb.generate(mrng, runId != null ? runIdToFrequency(runId) : undefined));
        }
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

function unsafeGenerateN(rng, num) {
    var out = [];
    for (var idx = 0; idx != num; ++idx) {
        out.push(rng.unsafeNext());
    }
    return out;
}
function generateN(rng, num) {
    var nextRng = rng.clone();
    var out = unsafeGenerateN(nextRng, num);
    return [out, nextRng];
}
function unsafeSkipN(rng, num) {
    for (var idx = 0; idx != num; ++idx) {
        rng.unsafeNext();
    }
}
function skipN(rng, num) {
    var nextRng = rng.clone();
    unsafeSkipN(nextRng, num);
    return nextRng;
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
    LinearCongruential.prototype.clone = function () {
        return new LinearCongruential(this.seed);
    };
    LinearCongruential.prototype.next = function () {
        var nextRng = new LinearCongruential(this.seed);
        var out = nextRng.unsafeNext();
        return [out, nextRng];
    };
    LinearCongruential.prototype.unsafeNext = function () {
        this.seed = computeNextSeed(this.seed);
        return computeValueFromNextSeed(this.seed);
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
    LinearCongruential32.prototype.clone = function () {
        return new LinearCongruential32(this.seed);
    };
    LinearCongruential32.prototype.next = function () {
        var nextRng = new LinearCongruential32(this.seed);
        var out = nextRng.unsafeNext();
        return [out, nextRng];
    };
    LinearCongruential32.prototype.unsafeNext = function () {
        var s1 = computeNextSeed(this.seed);
        var v1 = computeValueFromNextSeed(s1);
        var s2 = computeNextSeed(s1);
        var v2 = computeValueFromNextSeed(s2);
        this.seed = computeNextSeed(s2);
        var v3 = computeValueFromNextSeed(this.seed);
        var vnext = v3 + ((v2 + (v1 << 15)) << 15);
        return ((vnext + 0x80000000) | 0) + 0x80000000;
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
        this.states = states;
        this.index = index;
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
        return new MersenneTwister(MersenneTwister.twist(MersenneTwister.seeded(seed)), 0);
    };
    MersenneTwister.prototype.min = function () {
        return MersenneTwister.min;
    };
    MersenneTwister.prototype.max = function () {
        return MersenneTwister.max;
    };
    MersenneTwister.prototype.clone = function () {
        return new MersenneTwister(this.states, this.index);
    };
    MersenneTwister.prototype.next = function () {
        var nextRng = new MersenneTwister(this.states, this.index);
        var out = nextRng.unsafeNext();
        return [out, nextRng];
    };
    MersenneTwister.prototype.unsafeNext = function () {
        var y = this.states[this.index];
        y ^= this.states[this.index] >>> MersenneTwister.U;
        y ^= (y << MersenneTwister.S) & MersenneTwister.B;
        y ^= (y << MersenneTwister.T) & MersenneTwister.C;
        y ^= y >>> MersenneTwister.L;
        if (++this.index >= MersenneTwister.N) {
            this.states = MersenneTwister.twist(this.states);
            this.index = 0;
        }
        return y >>> 0;
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
    XorShift128Plus.prototype.clone = function () {
        return new XorShift128Plus(this.s01, this.s00, this.s11, this.s10);
    };
    XorShift128Plus.prototype.next = function () {
        var nextRng = new XorShift128Plus(this.s01, this.s00, this.s11, this.s10);
        var out = nextRng.unsafeNext();
        return [out, nextRng];
    };
    XorShift128Plus.prototype.unsafeNext = function () {
        var a0 = this.s00 ^ (this.s00 << 23);
        var a1 = this.s01 ^ ((this.s01 << 23) | (this.s00 >>> 9));
        var b0 = a0 ^ this.s10 ^ ((a0 >>> 18) | (a1 << 14)) ^ ((this.s10 >>> 5) | (this.s11 << 27));
        var b1 = a1 ^ this.s11 ^ (a1 >>> 18) ^ (this.s11 >>> 5);
        var out = (this.s00 + this.s10) | 0;
        this.s01 = this.s11;
        this.s00 = this.s10;
        this.s11 = b1;
        this.s10 = b0;
        return out;
    };
    XorShift128Plus.prototype.jump = function () {
        var nextRng = new XorShift128Plus(this.s01, this.s00, this.s11, this.s10);
        nextRng.unsafeJump();
        return nextRng;
    };
    XorShift128Plus.prototype.unsafeJump = function () {
        var ns01 = 0;
        var ns00 = 0;
        var ns11 = 0;
        var ns10 = 0;
        var jump = [0x635d2dff, 0x8a5cd789, 0x5c472f96, 0x121fd215];
        for (var i = 0; i !== 4; ++i) {
            for (var mask = 1; mask; mask <<= 1) {
                if (jump[i] & mask) {
                    ns01 ^= this.s01;
                    ns00 ^= this.s00;
                    ns11 ^= this.s11;
                    ns10 ^= this.s10;
                }
                this.unsafeNext();
            }
        }
        this.s01 = ns01;
        this.s00 = ns00;
        this.s11 = ns11;
        this.s10 = ns10;
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
    XoroShiro128Plus.prototype.clone = function () {
        return new XoroShiro128Plus(this.s01, this.s00, this.s11, this.s10);
    };
    XoroShiro128Plus.prototype.next = function () {
        var nextRng = new XoroShiro128Plus(this.s01, this.s00, this.s11, this.s10);
        var out = nextRng.unsafeNext();
        return [out, nextRng];
    };
    XoroShiro128Plus.prototype.unsafeNext = function () {
        var out = (this.s00 + this.s10) | 0;
        var a0 = this.s10 ^ this.s00;
        var a1 = this.s11 ^ this.s01;
        var s00 = this.s00;
        var s01 = this.s01;
        this.s00 = (s00 << 24) ^ (s01 >>> 8) ^ a0 ^ (a0 << 16);
        this.s01 = (s01 << 24) ^ (s00 >>> 8) ^ a1 ^ ((a1 << 16) | (a0 >>> 16));
        this.s10 = (a1 << 5) ^ (a0 >>> 27);
        this.s11 = (a0 << 5) ^ (a1 >>> 27);
        return out;
    };
    XoroShiro128Plus.prototype.jump = function () {
        var nextRng = new XoroShiro128Plus(this.s01, this.s00, this.s11, this.s10);
        nextRng.unsafeJump();
        return nextRng;
    };
    XoroShiro128Plus.prototype.unsafeJump = function () {
        var ns01 = 0;
        var ns00 = 0;
        var ns11 = 0;
        var ns10 = 0;
        var jump = [0xd8f554a5, 0xdf900294, 0x4b3201fc, 0x170865df];
        for (var i = 0; i !== 4; ++i) {
            for (var mask = 1; mask; mask <<= 1) {
                if (jump[i] & mask) {
                    ns01 ^= this.s01;
                    ns00 ^= this.s00;
                    ns11 ^= this.s11;
                    ns10 ^= this.s10;
                }
                this.unsafeNext();
            }
        }
        this.s01 = ns01;
        this.s00 = ns00;
        this.s11 = ns11;
        this.s10 = ns10;
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

function unsafeUniformIntDistributionInternal(rangeSize, rng) {
    var MinRng = rng.min();
    var NumValues = rng.max() - rng.min() + 1;
    if (rangeSize <= NumValues) {
        var nrng_1 = rng;
        var MaxAllowed = NumValues - (NumValues % rangeSize);
        while (true) {
            var out = nrng_1.unsafeNext();
            var deltaV = out - MinRng;
            if (deltaV < MaxAllowed) {
                return deltaV % rangeSize;
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
            var out = nrng.unsafeNext();
            value = NumValues * value + (out - MinRng);
        }
        if (value < MaxAcceptedRandom) {
            var inDiff = value - rangeSize * Math.floor((1 * value) / rangeSize);
            return inDiff;
        }
    }
}

function unsafeUniformArrayIntDistributionInternal(out, rangeSize, rng) {
    var rangeLength = rangeSize.length;
    while (true) {
        for (var index = 0; index !== rangeLength; ++index) {
            var indexRangeSize = index === 0 ? rangeSize[0] + 1 : 0x100000000;
            var g = unsafeUniformIntDistributionInternal(indexRangeSize, rng);
            out[index] = g;
        }
        for (var index = 0; index !== rangeLength; ++index) {
            var current = out[index];
            var currentInRange = rangeSize[index];
            if (current < currentInRange) {
                return out;
            }
            else if (current > currentInRange) {
                break;
            }
        }
    }
}

function unsafeUniformArrayIntDistribution(from, to, rng) {
    var rangeSize = trimArrayIntInplace(addOneToPositiveArrayInt(substractArrayIntToNew(to, from)));
    var emptyArrayIntData = rangeSize.data.slice(0);
    var g = unsafeUniformArrayIntDistributionInternal(emptyArrayIntData, rangeSize.data, rng);
    return trimArrayIntInplace(addArrayIntToNew({ sign: 1, data: g }, from));
}

function uniformArrayIntDistribution(from, to, rng) {
    if (rng != null) {
        var nextRng = rng.clone();
        return [unsafeUniformArrayIntDistribution(from, to, nextRng), nextRng];
    }
    return function (rng) {
        var nextRng = rng.clone();
        return [unsafeUniformArrayIntDistribution(from, to, nextRng), nextRng];
    };
}

function unsafeUniformBigIntDistribution(from, to, rng) {
    var diff = to - from + BigInt(1);
    var MinRng = BigInt(rng.min());
    var NumValues = BigInt(rng.max() - rng.min() + 1);
    var FinalNumValues = NumValues;
    var NumIterations = BigInt(1);
    while (FinalNumValues < diff) {
        FinalNumValues *= NumValues;
        ++NumIterations;
    }
    var MaxAcceptedRandom = FinalNumValues - (FinalNumValues % diff);
    while (true) {
        var value = BigInt(0);
        for (var num = BigInt(0); num !== NumIterations; ++num) {
            var out = rng.unsafeNext();
            value = NumValues * value + (BigInt(out) - MinRng);
        }
        if (value < MaxAcceptedRandom) {
            var inDiff = value % diff;
            return inDiff + from;
        }
    }
}

function uniformBigIntDistribution(from, to, rng) {
    if (rng != null) {
        var nextRng = rng.clone();
        return [unsafeUniformBigIntDistribution(from, to, nextRng), nextRng];
    }
    return function (rng) {
        var nextRng = rng.clone();
        return [unsafeUniformBigIntDistribution(from, to, nextRng), nextRng];
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
    unsafeUniformArrayIntDistributionInternal(sharedData, rangeSizeArrayIntValue.data, rng);
    return sharedData[0] * 0x100000000 + sharedData[1] + from;
}
function unsafeUniformIntDistribution(from, to, rng) {
    var rangeSize = to - from;
    if (rangeSize <= 0xffffffff) {
        var g = unsafeUniformIntDistributionInternal(rangeSize + 1, rng);
        return g + from;
    }
    return uniformLargeIntInternal(from, to, rangeSize, rng);
}

function uniformIntDistribution(from, to, rng) {
    if (rng != null) {
        var nextRng = rng.clone();
        return [unsafeUniformIntDistribution(from, to, nextRng), nextRng];
    }
    return function (rng) {
        var nextRng = rng.clone();
        return [unsafeUniformIntDistribution(from, to, nextRng), nextRng];
    };
}

var __type = 'module';
var __version = '5.0.0';
var __commitHash = '744555855a01e1551ab1cf67a6ea973d14964661';

var prand = /*#__PURE__*/Object.freeze({
    __proto__: null,
    __type: __type,
    __version: __version,
    __commitHash: __commitHash,
    generateN: generateN,
    skipN: skipN,
    unsafeGenerateN: unsafeGenerateN,
    unsafeSkipN: unsafeSkipN,
    congruential: congruential,
    congruential32: congruential32,
    mersenne: MersenneTwister$1,
    xorshift128plus: xorshift128plus,
    xoroshiro128plus: xoroshiro128plus,
    uniformArrayIntDistribution: uniformArrayIntDistribution,
    uniformBigIntDistribution: uniformBigIntDistribution,
    uniformIntDistribution: uniformIntDistribution,
    unsafeUniformArrayIntDistribution: unsafeUniformArrayIntDistribution,
    unsafeUniformBigIntDistribution: unsafeUniformBigIntDistribution,
    unsafeUniformIntDistribution: unsafeUniformIntDistribution
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

const toStringMethod = Symbol('fast-check/toStringMethod');
function hasToStringMethod(instance) {
    return (instance !== null &&
        (typeof instance === 'object' || typeof instance === 'function') &&
        toStringMethod in instance &&
        typeof instance[toStringMethod] === 'function');
}
const asyncToStringMethod = Symbol('fast-check/asyncToStringMethod');
function hasAsyncToStringMethod(instance) {
    return (instance !== null &&
        (typeof instance === 'object' || typeof instance === 'function') &&
        asyncToStringMethod in instance &&
        typeof instance[asyncToStringMethod] === 'function');
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
function stringifyInternal(value, previousValues, getAsyncContent) {
    const currentValues = previousValues.concat([value]);
    if (typeof value === 'object') {
        if (previousValues.indexOf(value) !== -1) {
            return '[cyclic]';
        }
    }
    if (hasAsyncToStringMethod(value)) {
        const content = getAsyncContent(value);
        if (content.state === 'fulfilled') {
            return content.value;
        }
    }
    if (hasToStringMethod(value)) {
        try {
            return value[toStringMethod]();
        }
        catch (err) {
        }
    }
    switch (Object.prototype.toString.call(value)) {
        case '[object Array]': {
            const arr = value;
            if (arr.length >= 50 && isSparseArray(arr)) {
                const assignments = [];
                for (const index in arr) {
                    if (!Number.isNaN(Number(index)))
                        assignments.push(`${index}:${stringifyInternal(arr[index], currentValues, getAsyncContent)}`);
                }
                return assignments.length !== 0
                    ? `Object.assign(Array(${arr.length}),{${assignments.join(',')}})`
                    : `Array(${arr.length})`;
            }
            const stringifiedArray = arr.map((v) => stringifyInternal(v, currentValues, getAsyncContent)).join(',');
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
            return `new Map(${stringifyInternal(Array.from(value), currentValues, getAsyncContent)})`;
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
                    ? `[${stringifyInternal(k, currentValues, getAsyncContent)}]`
                    : JSON.stringify(k)}:${stringifyInternal(value[k], currentValues, getAsyncContent)}`;
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
            return `new Set(${stringifyInternal(Array.from(value), currentValues, getAsyncContent)})`;
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
        case '[object Promise]': {
            const promiseContent = getAsyncContent(value);
            switch (promiseContent.state) {
                case 'fulfilled':
                    return `Promise.resolve(${stringifyInternal(promiseContent.value, currentValues, getAsyncContent)})`;
                case 'rejected':
                    return `Promise.reject(${stringifyInternal(promiseContent.value, currentValues, getAsyncContent)})`;
                case 'pending':
                    return `new Promise(() => {/*pending*/})`;
                case 'unknown':
                default:
                    return `new Promise(() => {/*unknown*/})`;
            }
        }
        case '[object Error]':
            if (value instanceof Error) {
                return `new Error(${stringifyInternal(value.message, currentValues, getAsyncContent)})`;
            }
            break;
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
                return `Buffer.from(${stringifyInternal(Array.from(value.values()), currentValues, getAsyncContent)})`;
            }
            const valuePrototype = Object.getPrototypeOf(value);
            const className = valuePrototype && valuePrototype.constructor && valuePrototype.constructor.name;
            if (typeof className === 'string') {
                const typedArray = value;
                const valuesFromTypedArr = typedArray.values();
                return `${className}.from(${stringifyInternal(Array.from(valuesFromTypedArr), currentValues, getAsyncContent)})`;
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
    return stringifyInternal(value, [], () => ({ state: 'unknown', value: undefined }));
}
function possiblyAsyncStringify(value) {
    const stillPendingMarker = Symbol();
    const pendingPromisesForCache = [];
    const cache = new Map();
    function createDelay0() {
        let handleId = null;
        const cancel = () => {
            if (handleId !== null) {
                clearTimeout(handleId);
            }
        };
        const delay = new Promise((resolve) => {
            handleId = setTimeout(() => {
                handleId = null;
                resolve(stillPendingMarker);
            }, 0);
        });
        return { delay, cancel };
    }
    const unknownState = { state: 'unknown', value: undefined };
    const getAsyncContent = function getAsyncContent(data) {
        const cacheKey = data;
        if (cache.has(cacheKey)) {
            return cache.get(cacheKey);
        }
        const delay0 = createDelay0();
        const p = asyncToStringMethod in data
            ? Promise.resolve().then(() => data[asyncToStringMethod]())
            : data;
        p.catch(() => { });
        pendingPromisesForCache.push(Promise.race([p, delay0.delay]).then((successValue) => {
            if (successValue === stillPendingMarker)
                cache.set(cacheKey, { state: 'pending', value: undefined });
            else
                cache.set(cacheKey, { state: 'fulfilled', value: successValue });
            delay0.cancel();
        }, (errorValue) => {
            cache.set(cacheKey, { state: 'rejected', value: errorValue });
            delay0.cancel();
        }));
        cache.set(cacheKey, unknownState);
        return unknownState;
    };
    function loop() {
        const stringifiedValue = stringifyInternal(value, [], getAsyncContent);
        if (pendingPromisesForCache.length === 0) {
            return stringifiedValue;
        }
        return Promise.all(pendingPromisesForCache.splice(0)).then(loop);
    }
    return loop();
}
async function asyncStringify(value) {
    return Promise.resolve(possiblyAsyncStringify(value));
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

class ConvertedRandomGenerator {
    constructor(rng) {
        this.rng = rng;
        if (typeof this.rng.jump === 'function') {
            this.jump = function jump() {
                const out = this.jump();
                return new ConvertedRandomGenerator(out);
            };
            this.unsafeJump = function unsafeJump() {
                const out = this.jump();
                this.rng = out;
            };
        }
    }
    min() {
        return this.rng.min();
    }
    max() {
        return this.rng.max();
    }
    clone() {
        return new ConvertedRandomGenerator(this.rng);
    }
    next() {
        const out = this.rng.next();
        return [out[0], new ConvertedRandomGenerator(out[1])];
    }
    unsafeNext() {
        const out = this.rng.next();
        this.rng = out[1];
        return out[0];
    }
}
function convertToRandomGenerator(rng) {
    if ('clone' in rng && 'unsafeNext' in rng) {
        return rng;
    }
    return new ConvertedRandomGenerator(rng);
}

class Random {
    constructor(sourceRng) {
        this.internalRng = convertToRandomGenerator(sourceRng).clone();
    }
    clone() {
        return new Random(this.internalRng);
    }
    next(bits) {
        return unsafeUniformIntDistribution(0, (1 << bits) - 1, this.internalRng);
    }
    nextBoolean() {
        return unsafeUniformIntDistribution(0, 1, this.internalRng) == 1;
    }
    nextInt(min, max) {
        return unsafeUniformIntDistribution(min == null ? Random.MIN_INT : min, max == null ? Random.MAX_INT : max, this.internalRng);
    }
    nextBigInt(min, max) {
        return unsafeUniformBigIntDistribution(min, max, this.internalRng);
    }
    nextArrayInt(min, max) {
        return unsafeUniformArrayIntDistribution(min, max, this.internalRng);
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
    let rng = convertToRandomGenerator(random(seed));
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
function formatFailures(failures, stringifyOne) {
    return `Encountered failures were:\n- ${failures.map(stringifyOne).join('\n- ')}`;
}
function formatExecutionSummary(executionTrees, stringifyOne) {
    const summaryLines = [];
    const remainingTreesAndDepth = [];
    for (const tree of executionTrees.slice().reverse()) {
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
        summaryLines.push(`${leftPadding}${statusIcon} ${stringifyOne(currentTree.value)}`);
        for (const tree of currentTree.children.slice().reverse()) {
            remainingTreesAndDepth.push({ depth: currentDepth + 1, tree });
        }
    }
    return `Execution summary:\n${summaryLines.join('\n')}`;
}
function preFormatTooManySkipped(out, stringifyOne) {
    const message = `Failed to run property, too many pre-condition failures encountered\n{ seed: ${out.seed} }\n\nRan ${out.numRuns} time(s)\nSkipped ${out.numSkips} time(s)`;
    let details = null;
    const hints = [
        'Try to reduce the number of rejected values by combining map, flatMap and built-in arbitraries',
        'Increase failure tolerance by setting maxSkipsPerRun to an higher value',
    ];
    if (out.verbose >= VerbosityLevel.VeryVerbose) {
        details = formatExecutionSummary(out.executionSummary, stringifyOne);
    }
    else {
        hints.push('Enable verbose mode at level VeryVerbose in order to check all generated values and their associated status');
    }
    return { message, details, hints };
}
function preFormatFailure(out, stringifyOne) {
    const message = `Property failed after ${out.numRuns} tests\n{ seed: ${out.seed}, path: "${out.counterexamplePath}", endOnFailure: true }\nCounterexample: ${stringifyOne(out.counterexample)}\nShrunk ${out.numShrinks} time(s)\nGot error: ${out.error}`;
    let details = null;
    const hints = [];
    if (out.verbose >= VerbosityLevel.VeryVerbose) {
        details = formatExecutionSummary(out.executionSummary, stringifyOne);
    }
    else if (out.verbose === VerbosityLevel.Verbose) {
        details = formatFailures(out.failures, stringifyOne);
    }
    else {
        hints.push('Enable verbose mode in order to have the list of all failing values encountered during the run');
    }
    return { message, details, hints };
}
function preFormatEarlyInterrupted(out, stringifyOne) {
    const message = `Property interrupted after ${out.numRuns} tests\n{ seed: ${out.seed} }`;
    let details = null;
    const hints = [];
    if (out.verbose >= VerbosityLevel.VeryVerbose) {
        details = formatExecutionSummary(out.executionSummary, stringifyOne);
    }
    else {
        hints.push('Enable verbose mode at level VeryVerbose in order to check all generated values and their associated status');
    }
    return { message, details, hints };
}
function defaultReportMessageInternal(out, stringifyOne) {
    if (!out.failed)
        return;
    const { message, details, hints } = out.counterexamplePath === null
        ? out.interrupted
            ? preFormatEarlyInterrupted(out, stringifyOne)
            : preFormatTooManySkipped(out, stringifyOne)
        : preFormatFailure(out, stringifyOne);
    let errorMessage = message;
    if (details != null)
        errorMessage += `\n\n${details}`;
    if (hints.length > 0)
        errorMessage += `\n\n${formatHints(hints)}`;
    return errorMessage;
}
function defaultReportMessage(out) {
    return defaultReportMessageInternal(out, stringify);
}
async function asyncDefaultReportMessage(out) {
    const pendingStringifieds = [];
    function stringifyOne(value) {
        const stringified = possiblyAsyncStringify(value);
        if (typeof stringified === 'string') {
            return stringified;
        }
        pendingStringifieds.push(Promise.all([value, stringified]));
        return '\u2026';
    }
    const firstTryMessage = defaultReportMessageInternal(out, stringifyOne);
    if (pendingStringifieds.length === 0) {
        return firstTryMessage;
    }
    const registeredValues = new Map(await Promise.all(pendingStringifieds));
    function stringifySecond(value) {
        const asyncStringifiedIfRegistered = registeredValues.get(value);
        if (asyncStringifiedIfRegistered !== undefined) {
            return asyncStringifiedIfRegistered;
        }
        return stringify(value);
    }
    return defaultReportMessageInternal(out, stringifySecond);
}
function throwIfFailed(out) {
    if (!out.failed)
        return;
    throw new Error(defaultReportMessage(out));
}
async function asyncThrowIfFailed(out) {
    if (!out.failed)
        return;
    throw new Error(await asyncDefaultReportMessage(out));
}
function reportRunDetails(out) {
    if (out.runConfiguration.asyncReporter)
        return out.runConfiguration.asyncReporter(out);
    else if (out.runConfiguration.reporter)
        return out.runConfiguration.reporter(out);
    else
        return throwIfFailed(out);
}
async function asyncReportRunDetails(out) {
    if (out.runConfiguration.asyncReporter)
        return out.runConfiguration.asyncReporter(out);
    else if (out.runConfiguration.reporter)
        return out.runConfiguration.reporter(out);
    else
        return asyncThrowIfFailed(out);
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
        return out.then(asyncReportRunDetails);
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

function integerLogLike(v) {
    return Math.floor(Math.log(v) / Math.log(2));
}
function bigIntLogLike(v) {
    if (v === BigInt(0))
        return BigInt(0);
    return BigInt(v.toString().length);
}
function biasNumericRange(min, max, logLike) {
    if (min === max) {
        return [{ min: min, max: max }];
    }
    if (min < 0 && max > 0) {
        const logMin = logLike(-min);
        const logMax = logLike(max);
        return [
            { min: -logMin, max: logMax },
            { min: (max - logMax), max: max },
            { min: min, max: min + logMin },
        ];
    }
    const logGap = logLike((max - min));
    const arbCloseToMin = { min: min, max: min + logGap };
    const arbCloseToMax = { min: (max - logGap), max: max };
    return min < 0
        ? [arbCloseToMax, arbCloseToMin]
        : [arbCloseToMin, arbCloseToMax];
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
            const next = toremove === realGap ? target : current - toremove;
            yield new NextValue(next, previous);
            previous = next;
        }
    }
    function* shrinkIncr() {
        let previous = tryTargetAsap ? undefined : target;
        const gap = tryTargetAsap ? realGap : halveNegInteger(realGap);
        for (let toremove = gap; toremove < 0; toremove = halveNegInteger(toremove)) {
            const next = toremove === realGap ? target : current - toremove;
            yield new NextValue(next, previous);
            previous = next;
        }
    }
    return realGap > 0 ? stream(shrinkDecr()) : stream(shrinkIncr());
}

class IntegerArbitrary extends NextArbitrary {
    constructor(min, max) {
        super();
        this.min = min;
        this.max = max;
    }
    generate(mrng, biasFactor) {
        const range = this.computeGenerateRange(mrng, biasFactor);
        return new NextValue(mrng.nextInt(range.min, range.max), undefined);
    }
    canShrinkWithoutContext(value) {
        return (typeof value === 'number' &&
            Number.isInteger(value) &&
            !Object.is(value, -0) &&
            this.min <= value &&
            value <= this.max);
    }
    shrink(current, context) {
        if (!IntegerArbitrary.isValidContext(current, context)) {
            const target = this.defaultTarget();
            return shrinkInteger(current, target, true);
        }
        if (this.isLastChanceTry(current, context)) {
            return Stream.of(new NextValue(context, undefined));
        }
        return shrinkInteger(current, context, false);
    }
    defaultTarget() {
        if (this.min <= 0 && this.max >= 0) {
            return 0;
        }
        return this.min < 0 ? this.max : this.min;
    }
    computeGenerateRange(mrng, biasFactor) {
        if (biasFactor === undefined || mrng.nextInt(1, biasFactor) !== 1) {
            return { min: this.min, max: this.max };
        }
        const ranges = biasNumericRange(this.min, this.max, integerLogLike);
        if (ranges.length === 1) {
            return ranges[0];
        }
        const id = mrng.nextInt(-2 * (ranges.length - 1), ranges.length - 2);
        return id < 0 ? ranges[0] : ranges[id + 1];
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
}

function buildCompleteIntegerConstraints(constraints) {
    const min = constraints.min !== undefined ? constraints.min : -0x80000000;
    const max = constraints.max !== undefined ? constraints.max : 0x7fffffff;
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
    const arb = new IntegerArbitrary(constraints.min, constraints.max);
    return convertFromNextWithShrunkOnce(arb, arb.defaultTarget());
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

class ArrayArbitrary extends NextArbitrary {
    constructor(arb, minLength, maxLength, isEqual) {
        super();
        this.arb = arb;
        this.minLength = minLength;
        this.maxLength = maxLength;
        this.isEqual = isEqual;
        this.lengthArb = convertToNext(integer(minLength, maxLength));
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
    static canAppendItem(items, newItem, isEqual) {
        for (let idx = 0; idx !== items.length; ++idx) {
            if (isEqual(items[idx].value_, newItem.value_)) {
                return false;
            }
        }
        return true;
    }
    generateNItemsNoDuplicates(N, mrng, biasFactorItems) {
        let numSkippedInRow = 0;
        const items = [];
        while (items.length < N && numSkippedInRow < this.maxLength) {
            const current = this.arb.generate(mrng, biasFactorItems);
            if (this.isEqual === undefined || ArrayArbitrary.canAppendItem(items, current, this.isEqual)) {
                numSkippedInRow = 0;
                items.push(current);
            }
            else {
                numSkippedInRow += 1;
            }
        }
        return items;
    }
    generateNItems(N, mrng, biasFactorItems) {
        const items = [];
        for (let index = 0; index !== N; ++index) {
            const current = this.arb.generate(mrng, biasFactorItems);
            items.push(current);
        }
        return items;
    }
    wrapper(itemsRaw, shrunkOnce, itemsRawLengthContext) {
        const items = shrunkOnce ? this.preFilter(itemsRaw) : itemsRaw;
        let cloneable = false;
        const vs = [];
        const itemsContexts = [];
        for (let idx = 0; idx !== items.length; ++idx) {
            const s = items[idx];
            cloneable = cloneable || s.hasToBeCloned;
            vs.push(s.value);
            itemsContexts.push(s.context);
        }
        if (cloneable) {
            ArrayArbitrary.makeItCloneable(vs, items);
        }
        const context = {
            shrunkOnce,
            lengthContext: itemsRaw.length === items.length && itemsRawLengthContext !== undefined
                ? itemsRawLengthContext
                : undefined,
            itemsContexts,
        };
        return new NextValue(vs, context);
    }
    generate(mrng, biasFactor) {
        const biasMeta = this.applyBias(mrng, biasFactor);
        const targetSize = biasMeta.size;
        const items = this.isEqual !== undefined
            ? this.generateNItemsNoDuplicates(targetSize, mrng, biasMeta.biasFactorItems)
            : this.generateNItems(targetSize, mrng, biasMeta.biasFactorItems);
        return this.wrapper(items, false, undefined);
    }
    applyBias(mrng, biasFactor) {
        if (biasFactor === undefined || mrng.nextInt(1, biasFactor) !== 1) {
            return { size: this.lengthArb.generate(mrng, undefined).value };
        }
        if (mrng.nextInt(1, biasFactor) !== 1 || this.minLength === this.maxLength) {
            return { size: this.lengthArb.generate(mrng, undefined).value, biasFactorItems: biasFactor };
        }
        const maxBiasedLength = this.minLength + Math.floor(Math.log(this.maxLength - this.minLength) / Math.log(2));
        const targetSizeValue = convertToNext(integer(this.minLength, maxBiasedLength)).generate(mrng, undefined);
        return { size: targetSizeValue.value, biasFactorItems: biasFactor };
    }
    canShrinkWithoutContext(value) {
        if (!Array.isArray(value) || this.minLength > value.length || value.length > this.maxLength) {
            return false;
        }
        for (let index = 0; index !== value.length; ++index) {
            if (!(index in value)) {
                return false;
            }
            if (!this.arb.canShrinkWithoutContext(value[index])) {
                return false;
            }
        }
        const filtered = this.preFilter(value.map((item) => new NextValue(item, undefined)));
        return filtered.length === value.length;
    }
    shrinkImpl(value, context) {
        if (value.length === 0) {
            return Stream.nil();
        }
        const safeContext = context !== undefined
            ? context
            : { shrunkOnce: false, lengthContext: undefined, itemsContexts: [] };
        return (this.lengthArb
            .shrink(value.length, safeContext.lengthContext)
            .drop(safeContext.shrunkOnce && safeContext.lengthContext === undefined && value.length > this.minLength + 1 ? 1 : 0)
            .map((lengthValue) => {
            const sliceStart = value.length - lengthValue.value;
            return [
                value
                    .slice(sliceStart)
                    .map((v, index) => new NextValue(cloneIfNeeded(v), safeContext.itemsContexts[index + sliceStart])),
                lengthValue.context,
            ];
        })
            .join(this.arb.shrink(value[0], safeContext.itemsContexts[0]).map((v) => {
            return [
                [v].concat(value.slice(1).map((v, index) => new NextValue(cloneIfNeeded(v), safeContext.itemsContexts[index + 1]))),
                undefined,
            ];
        }))
            .join(value.length > this.minLength
            ? makeLazy(() => this.shrinkImpl(value.slice(1), {
                shrunkOnce: false,
                lengthContext: undefined,
                itemsContexts: safeContext.itemsContexts.slice(1),
            })
                .filter((v) => this.minLength <= v[0].length + 1)
                .map((v) => {
                return [
                    [new NextValue(cloneIfNeeded(value[0]), safeContext.itemsContexts[0])].concat(v[0]),
                    undefined,
                ];
            }))
            : Stream.nil()));
    }
    shrink(value, context) {
        return this.shrinkImpl(value, context).map((contextualValue) => this.wrapper(contextualValue[0], true, contextualValue[1]));
    }
}

function maxLengthFromMinLength(minLength) {
    return Math.min(2 * minLength + 10, 0x7fffffff);
}

function array(arb, ...args) {
    const nextArb = convertToNext(arb);
    if (args[0] === undefined)
        return convertFromNext(new ArrayArbitrary(nextArb, 0, maxLengthFromMinLength(0)));
    if (typeof args[0] === 'object') {
        const minLength = args[0].minLength || 0;
        const specifiedMaxLength = args[0].maxLength;
        const maxLength = specifiedMaxLength !== undefined ? specifiedMaxLength : maxLengthFromMinLength(minLength);
        return convertFromNext(new ArrayArbitrary(nextArb, minLength, maxLength));
    }
    if (args[1] !== undefined)
        return convertFromNext(new ArrayArbitrary(nextArb, args[0], args[1]));
    return convertFromNext(new ArrayArbitrary(nextArb, 0, args[0]));
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
            yield new NextValue(next, previous);
            previous = next;
        }
    }
    function* shrinkIncr() {
        let previous = tryTargetAsap ? undefined : target;
        const gap = tryTargetAsap ? realGap : halveBigInt(realGap);
        for (let toremove = gap; toremove < 0; toremove = halveBigInt(toremove)) {
            const next = current - toremove;
            yield new NextValue(next, previous);
            previous = next;
        }
    }
    return realGap > 0 ? stream(shrinkDecr()) : stream(shrinkIncr());
}

class BigIntArbitrary extends NextArbitrary {
    constructor(min, max) {
        super();
        this.min = min;
        this.max = max;
    }
    generate(mrng, biasFactor) {
        const range = this.computeGenerateRange(mrng, biasFactor);
        return new NextValue(mrng.nextBigInt(range.min, range.max), undefined);
    }
    computeGenerateRange(mrng, biasFactor) {
        if (biasFactor === undefined || mrng.nextInt(1, biasFactor) !== 1) {
            return { min: this.min, max: this.max };
        }
        const ranges = biasNumericRange(this.min, this.max, bigIntLogLike);
        if (ranges.length === 1) {
            return ranges[0];
        }
        const id = mrng.nextInt(-2 * (ranges.length - 1), ranges.length - 2);
        return id < 0 ? ranges[0] : ranges[id + 1];
    }
    canShrinkWithoutContext(value) {
        return typeof value === 'bigint' && this.min <= value && value <= this.max;
    }
    shrink(current, context) {
        if (!BigIntArbitrary.isValidContext(current, context)) {
            const target = this.defaultTarget();
            return shrinkBigInt(current, target, true);
        }
        if (this.isLastChanceTry(current, context)) {
            return Stream.of(new NextValue(context, undefined));
        }
        return shrinkBigInt(current, context, false);
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
    if (constraints.min > constraints.max) {
        throw new Error('fc.bigInt expects max to be greater than or equal to min');
    }
    const arb = new BigIntArbitrary(constraints.min, constraints.max);
    return convertFromNextWithShrunkOnce(arb, arb.defaultTarget());
}

function bigIntN(n) {
    if (n < 1) {
        throw new Error('fc.bigIntN expects requested number of bits to be superior or equal to 1');
    }
    const min = BigInt(-1) << BigInt(n - 1);
    const max = (BigInt(1) << BigInt(n - 1)) - BigInt(1);
    const arb = new BigIntArbitrary(min, max);
    return convertFromNextWithShrunkOnce(arb, arb.defaultTarget());
}

function computeDefaultMax() {
    return (BigInt(1) << BigInt(256)) - BigInt(1);
}
function bigUint(constraints) {
    const requestedMax = typeof constraints === 'object' ? constraints.max : constraints;
    const max = requestedMax !== undefined ? requestedMax : computeDefaultMax();
    if (max < 0) {
        throw new Error('fc.bigUint expects max to be greater than or equal to zero');
    }
    const arb = new BigIntArbitrary(BigInt(0), max);
    return convertFromNextWithShrunkOnce(arb, arb.defaultTarget());
}

function bigUintN(n) {
    if (n < 0) {
        throw new Error('fc.bigUintN expects requested number of bits to be superior or equal to 0');
    }
    const min = BigInt(0);
    const max = (BigInt(1) << BigInt(n)) - BigInt(1);
    const arb = new BigIntArbitrary(min, max);
    return convertFromNextWithShrunkOnce(arb, arb.defaultTarget());
}

function booleanMapper(v) {
    return v === 1;
}
function booleanUnmapper(v) {
    if (typeof v !== 'boolean')
        throw new Error('Unsupported input type');
    return v === true ? 1 : 0;
}
function boolean() {
    return convertFromNext(convertToNext(integer({ min: 0, max: 1 }))
        .map(booleanMapper, booleanUnmapper)
        .noBias());
}

class ConstantArbitrary extends NextArbitrary {
    constructor(values) {
        super();
        this.values = values;
    }
    generate(mrng, _biasFactor) {
        const idx = this.values.length === 1 ? 0 : mrng.nextInt(0, this.values.length - 1);
        const value = this.values[idx];
        if (!hasCloneMethod(value)) {
            return new NextValue(value, idx);
        }
        return new NextValue(value, idx, () => value[cloneMethod]());
    }
    canShrinkWithoutContext(value) {
        for (let idx = 0; idx !== this.values.length; ++idx) {
            if (Object.is(this.values[idx], value)) {
                return true;
            }
        }
        return false;
    }
    shrink(value, context) {
        if (context === 0 || Object.is(value, this.values[0])) {
            return Stream.nil();
        }
        return Stream.of(new NextValue(this.values[0], 0));
    }
}

function constantFrom(...values) {
    if (values.length === 0) {
        throw new Error('fc.constantFrom expects at least one parameter');
    }
    return convertFromNext(new ConstantArbitrary(values));
}

function falsy(constraints) {
    if (!constraints || !constraints.withBigInt) {
        return constantFrom(false, null, undefined, 0, '', NaN);
    }
    return constantFrom(false, null, undefined, 0, '', NaN, BigInt(0));
}

const indexToCharStringMapper = String.fromCodePoint;
function indexToCharStringUnmapper(c) {
    if (typeof c !== 'string') {
        throw new Error('Cannot unmap non-string');
    }
    if (c.length === 0 || c.length > 2) {
        throw new Error('Cannot unmap string with more or less than one character');
    }
    const c1 = c.charCodeAt(0);
    if (c.length === 1) {
        return c1;
    }
    const c2 = c.charCodeAt(1);
    if (c1 < 0xd800 || c1 > 0xdbff || c2 < 0xdc00 || c2 > 0xdfff) {
        throw new Error('Cannot unmap invalid surrogate pairs');
    }
    return c.codePointAt(0);
}

function buildCharacterArbitrary(min, max, mapToCode, unmapFromCode) {
    return convertFromNext(convertToNext(integer(min, max)).map((n) => indexToCharStringMapper(mapToCode(n)), (c) => unmapFromCode(indexToCharStringUnmapper(c))));
}

function indexToPrintableIndexMapper(v) {
    if (v < 95)
        return v + 0x20;
    if (v <= 0x7e)
        return v - 95;
    return v;
}
function indexToPrintableIndexUnmapper(v) {
    if (v >= 0x20 && v <= 0x7e)
        return v - 0x20;
    if (v >= 0 && v <= 0x1f)
        return v + 95;
    return v;
}

function ascii() {
    return buildCharacterArbitrary(0x00, 0x7f, indexToPrintableIndexMapper, indexToPrintableIndexUnmapper);
}

function base64Mapper(v) {
    if (v < 26)
        return v + 65;
    if (v < 52)
        return v + 97 - 26;
    if (v < 62)
        return v + 48 - 52;
    return v === 62 ? 43 : 47;
}
function base64Unmapper(v) {
    if (v >= 65 && v <= 90)
        return v - 65;
    if (v >= 97 && v <= 122)
        return v - 97 + 26;
    if (v >= 48 && v <= 57)
        return v - 48 + 52;
    return v === 43 ? 62 : v === 47 ? 63 : -1;
}
function base64() {
    return buildCharacterArbitrary(0, 63, base64Mapper, base64Unmapper);
}

function identity(v) {
    return v;
}
function char() {
    return buildCharacterArbitrary(0x20, 0x7e, identity, identity);
}

function char16bits() {
    return buildCharacterArbitrary(0x0000, 0xffff, indexToPrintableIndexMapper, indexToPrintableIndexUnmapper);
}

const gapSize = 0xdfff + 1 - 0xd800;
function unicodeMapper(v) {
    if (v < 0xd800)
        return indexToPrintableIndexMapper(v);
    return v + gapSize;
}
function unicodeUnmapper(v) {
    if (v < 0xd800)
        return indexToPrintableIndexUnmapper(v);
    if (v <= 0xdfff)
        return -1;
    return v - gapSize;
}
function fullUnicode() {
    return buildCharacterArbitrary(0x0000, 0x10ffff - gapSize, unicodeMapper, unicodeUnmapper);
}

function hexaMapper(v) {
    return v < 10
        ? v + 48
        : v + 97 - 10;
}
function hexaUnmapper(v) {
    return v < 58
        ? v - 48
        : v < 103
            ? v - 97 + 10
            : -1;
}
function hexa() {
    return buildCharacterArbitrary(0, 15, hexaMapper, hexaUnmapper);
}

const gapSize$1 = 0xdfff + 1 - 0xd800;
function unicodeMapper$1(v) {
    if (v < 0xd800)
        return indexToPrintableIndexMapper(v);
    return v + gapSize$1;
}
function unicodeUnmapper$1(v) {
    if (v < 0xd800)
        return indexToPrintableIndexUnmapper(v);
    if (v <= 0xdfff)
        return -1;
    return v - gapSize$1;
}
function unicode() {
    return buildCharacterArbitrary(0x0000, 0xffff - gapSize$1, unicodeMapper$1, unicodeUnmapper$1);
}

function constant(value) {
    return convertFromNext(new ConstantArbitrary([value]));
}

const clonedConstant = constant;

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
    return constant(new ContextImplem());
}

function timeToDateMapper(time) {
    return new Date(time);
}
function timeToDateUnmapper(value) {
    if (!(value instanceof Date) || value.constructor !== Date) {
        throw new Error('Not a valid value for date unmapper');
    }
    return value.getTime();
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
    return convertFromNext(convertToNext(integer(intMin, intMax)).map(timeToDateMapper, timeToDateUnmapper));
}

class CloneArbitrary extends NextArbitrary {
    constructor(arb, numValues) {
        super();
        this.arb = arb;
        this.numValues = numValues;
    }
    generate(mrng, biasFactor) {
        const items = [];
        if (this.numValues <= 0) {
            return this.wrapper(items);
        }
        for (let idx = 0; idx !== this.numValues - 1; ++idx) {
            items.push(this.arb.generate(mrng.clone(), biasFactor));
        }
        items.push(this.arb.generate(mrng, biasFactor));
        return this.wrapper(items);
    }
    canShrinkWithoutContext(value) {
        if (!Array.isArray(value) || value.length !== this.numValues) {
            return false;
        }
        if (value.length === 0) {
            return true;
        }
        for (let index = 1; index < value.length; ++index) {
            if (!Object.is(value[0], value[index])) {
                return false;
            }
        }
        return this.arb.canShrinkWithoutContext(value[0]);
    }
    shrink(value, context) {
        if (value.length === 0) {
            return Stream.nil();
        }
        return new Stream(this.shrinkImpl(value, context !== undefined ? context : [])).map((v) => this.wrapper(v));
    }
    *shrinkImpl(value, contexts) {
        const its = value.map((v, idx) => this.arb.shrink(v, contexts[idx])[Symbol.iterator]());
        let cur = its.map((it) => it.next());
        while (!cur[0].done) {
            yield cur.map((c) => c.value);
            cur = its.map((it) => it.next());
        }
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
        const contexts = [];
        for (let idx = 0; idx !== items.length; ++idx) {
            const s = items[idx];
            cloneable = cloneable || s.hasToBeCloned;
            vs.push(s.value);
            contexts.push(s.context);
        }
        if (cloneable) {
            CloneArbitrary.makeItCloneable(vs, items);
        }
        return new NextValue(vs, contexts);
    }
}

function clone(arb, numValues) {
    return convertFromNext(new CloneArbitrary(convertToNext(arb), numValues));
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
    const nextArb = convertToNext(arb);
    const arrayArb = convertFromNext(new ArrayArbitrary(nextArb, minLength, maxLength, compare));
    if (minLength === 0)
        return arrayArb;
    return arrayArb.filter((tab) => tab.length >= minLength);
}

function tuple(...arbs) {
    const nextArbs = arbs.map((arb) => convertToNext(arb));
    return convertFromNext(new TupleArbitrary(nextArbs));
}

function keyValuePairsToObjectMapper(items) {
    const obj = {};
    for (const keyValue of items) {
        obj[keyValue[0]] = keyValue[1];
    }
    return obj;
}
function buildInvalidPropertyNameFilter(obj) {
    return function invalidPropertyNameFilter(key) {
        const descriptor = Object.getOwnPropertyDescriptor(obj, key);
        return (descriptor === undefined ||
            !descriptor.configurable ||
            !descriptor.enumerable ||
            !descriptor.writable ||
            descriptor.get !== undefined ||
            descriptor.set !== undefined);
    };
}
function keyValuePairsToObjectUnmapper(value) {
    if (typeof value !== 'object' || value === null) {
        throw new Error('Incompatible instance received: should be a non-null object');
    }
    if (!('constructor' in value) || value.constructor !== Object) {
        throw new Error('Incompatible instance received: should be of exact type Object');
    }
    if (Object.getOwnPropertySymbols(value).length > 0) {
        throw new Error('Incompatible instance received: should contain symbols');
    }
    if (Object.getOwnPropertyNames(value).find(buildInvalidPropertyNameFilter(value)) !== undefined) {
        throw new Error('Incompatible instance received: should contain only c/e/w properties without get/set');
    }
    return Object.entries(value);
}

function dictionary(keyArb, valueArb) {
    return convertFromNext(convertToNext(set(tuple(keyArb, valueArb), { compare: (t1, t2) => t1[0] === t2[0] })).map(keyValuePairsToObjectMapper, keyValuePairsToObjectUnmapper));
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

class FrequencyArbitrary extends NextArbitrary {
    constructor(warbs, constraints, context) {
        super();
        this.warbs = warbs;
        this.constraints = constraints;
        this.context = context;
        let currentWeight = 0;
        this.cumulatedWeights = [];
        for (let idx = 0; idx !== warbs.length; ++idx) {
            currentWeight += warbs[idx].weight;
            this.cumulatedWeights.push(currentWeight);
        }
        this.totalWeight = currentWeight;
    }
    static fromOld(warbs, constraints, label) {
        return convertFromNext(FrequencyArbitrary.from(warbs.map((w) => (Object.assign(Object.assign({}, w), { arbitrary: convertToNext(w.arbitrary) }))), constraints, label));
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
    generate(mrng, biasFactor) {
        if (this.mustGenerateFirst()) {
            return this.safeGenerateForIndex(mrng, 0, biasFactor);
        }
        const selected = mrng.nextInt(this.computeNegDepthBenefit(), this.totalWeight - 1);
        for (let idx = 0; idx !== this.cumulatedWeights.length; ++idx) {
            if (selected < this.cumulatedWeights[idx]) {
                return this.safeGenerateForIndex(mrng, idx, biasFactor);
            }
        }
        throw new Error(`Unable to generate from fc.frequency`);
    }
    canShrinkWithoutContext(value) {
        return this.canShrinkWithoutContextIndex(value) !== -1;
    }
    shrink(value, context) {
        if (context !== undefined) {
            const safeContext = context;
            const selectedIndex = safeContext.selectedIndex;
            const originalBias = safeContext.originalBias;
            const originalArbitrary = this.warbs[selectedIndex].arbitrary;
            const originalShrinks = originalArbitrary
                .shrink(value, safeContext.originalContext)
                .map((v) => this.mapIntoNextValue(selectedIndex, v, null, originalBias));
            if (safeContext.clonedMrngForFallbackFirst !== null) {
                if (safeContext.cachedGeneratedForFirst === undefined) {
                    safeContext.cachedGeneratedForFirst = this.safeGenerateForIndex(safeContext.clonedMrngForFallbackFirst, 0, originalBias);
                }
                const valueFromFirst = safeContext.cachedGeneratedForFirst;
                return Stream.of(valueFromFirst).join(originalShrinks);
            }
            return originalShrinks;
        }
        const potentialSelectedIndex = this.canShrinkWithoutContextIndex(value);
        if (potentialSelectedIndex === -1) {
            return Stream.nil();
        }
        return this.defaultShrinkForFirst(potentialSelectedIndex).join(this.warbs[potentialSelectedIndex].arbitrary
            .shrink(value, undefined)
            .map((v) => this.mapIntoNextValue(potentialSelectedIndex, v, null, undefined)));
    }
    defaultShrinkForFirst(selectedIndex) {
        ++this.context.depth;
        try {
            if (!this.mustFallbackToFirstInShrink(selectedIndex) || this.warbs[0].fallbackValue === undefined) {
                return Stream.nil();
            }
        }
        finally {
            --this.context.depth;
        }
        const rawShrinkValue = new NextValue(this.warbs[0].fallbackValue.default, undefined);
        return Stream.of(this.mapIntoNextValue(0, rawShrinkValue, null, undefined));
    }
    canShrinkWithoutContextIndex(value) {
        if (this.mustGenerateFirst()) {
            return this.warbs[0].arbitrary.canShrinkWithoutContext(value) ? 0 : -1;
        }
        try {
            ++this.context.depth;
            for (let idx = 0; idx !== this.warbs.length; ++idx) {
                const warb = this.warbs[idx];
                if (warb.weight !== 0 && warb.arbitrary.canShrinkWithoutContext(value)) {
                    return idx;
                }
            }
            return -1;
        }
        finally {
            --this.context.depth;
        }
    }
    mapIntoNextValue(idx, value, clonedMrngForFallbackFirst, biasFactor) {
        const context = {
            selectedIndex: idx,
            originalBias: biasFactor,
            originalContext: value.context,
            clonedMrngForFallbackFirst,
        };
        return new NextValue(value.value, context);
    }
    safeGenerateForIndex(mrng, idx, biasFactor) {
        ++this.context.depth;
        try {
            const value = this.warbs[idx].arbitrary.generate(mrng, biasFactor);
            const clonedMrngForFallbackFirst = this.mustFallbackToFirstInShrink(idx) ? mrng.clone() : null;
            return this.mapIntoNextValue(idx, value, clonedMrngForFallbackFirst, biasFactor);
        }
        finally {
            --this.context.depth;
        }
    }
    mustGenerateFirst() {
        return this.constraints.maxDepth !== undefined && this.constraints.maxDepth <= this.context.depth;
    }
    mustFallbackToFirstInShrink(idx) {
        return idx !== 0 && !!this.constraints.withCrossShrink && this.warbs[0].weight !== 0;
    }
    computeNegDepthBenefit() {
        const depthFactor = this.constraints.depthFactor;
        if (depthFactor === undefined || depthFactor <= 0) {
            return 0;
        }
        const depthBenefit = Math.floor(Math.pow(1 + depthFactor, this.context.depth)) - 1;
        return -Math.min(this.warbs[0].weight * depthBenefit, Number.MAX_SAFE_INTEGER) || 0;
    }
}

function isFrequencyContraints(param) {
    return param != null && typeof param === 'object' && !('arbitrary' in param);
}
function frequency(...args) {
    const label = 'fc.frequency';
    const constraints = args[0];
    if (isFrequencyContraints(constraints)) {
        return FrequencyArbitrary.fromOld(args.slice(1), constraints, label);
    }
    return FrequencyArbitrary.fromOld(args, {}, label);
}

function nat(arg) {
    const max = typeof arg === 'number' ? arg : arg && arg.max !== undefined ? arg.max : 0x7fffffff;
    if (max < 0) {
        throw new Error('fc.nat value should be greater than or equal to 0');
    }
    const arb = new IntegerArbitrary(0, max);
    return convertFromNextWithShrunkOnce(arb, arb.defaultTarget());
}

function indexToMappedConstantMapperFor(entries) {
    return function indexToMappedConstantMapper(choiceIndex) {
        let idx = -1;
        let numSkips = 0;
        while (choiceIndex >= numSkips) {
            numSkips += entries[++idx].num;
        }
        return entries[idx].build(choiceIndex - numSkips + entries[idx].num);
    };
}
function buildReverseMapping(entries) {
    const reverseMapping = { mapping: new Map(), negativeZeroIndex: undefined };
    let choiceIndex = 0;
    for (let entryIdx = 0; entryIdx !== entries.length; ++entryIdx) {
        const entry = entries[entryIdx];
        for (let idxInEntry = 0; idxInEntry !== entry.num; ++idxInEntry) {
            const value = entry.build(idxInEntry);
            if (value === 0 && 1 / value === Number.NEGATIVE_INFINITY) {
                reverseMapping.negativeZeroIndex = choiceIndex;
            }
            else {
                reverseMapping.mapping.set(value, choiceIndex);
            }
            ++choiceIndex;
        }
    }
    return reverseMapping;
}
function indexToMappedConstantUnmapperFor(entries) {
    let reverseMapping = null;
    return function indexToMappedConstantUnmapper(value) {
        if (reverseMapping === null) {
            reverseMapping = buildReverseMapping(entries);
        }
        const choiceIndex = Object.is(value, -0) ? reverseMapping.negativeZeroIndex : reverseMapping.mapping.get(value);
        if (choiceIndex === undefined) {
            throw new Error('Unknown value encountered cannot be built using this mapToConstant');
        }
        return choiceIndex;
    };
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
    return convertFromNext(convertToNext(nat({ max: numChoices - 1 })).map(indexToMappedConstantMapperFor(entries), indexToMappedConstantUnmapperFor(entries)));
}

const lowerCaseMapper = { num: 26, build: (v) => String.fromCharCode(v + 0x61) };
const upperCaseMapper = { num: 26, build: (v) => String.fromCharCode(v + 0x41) };
const numericMapper = { num: 10, build: (v) => String.fromCharCode(v + 0x30) };
function percentCharArbMapper(c) {
    const encoded = encodeURIComponent(c);
    return c !== encoded ? encoded : `%${c.charCodeAt(0).toString(16)}`;
}
function percentCharArbUnmapper(value) {
    if (typeof value !== 'string') {
        throw new Error('Unsupported');
    }
    const decoded = decodeURIComponent(value);
    return decoded;
}
const percentCharArb = convertFromNext(convertToNext(fullUnicode()).map(percentCharArbMapper, percentCharArbUnmapper));
const buildLowerAlphaArbitrary = (others) => mapToConstant(lowerCaseMapper, { num: others.length, build: (v) => others[v] });
const buildLowerAlphaNumericArbitrary = (others) => mapToConstant(lowerCaseMapper, numericMapper, { num: others.length, build: (v) => others[v] });
const buildAlphaNumericArbitrary = (others) => mapToConstant(lowerCaseMapper, upperCaseMapper, numericMapper, { num: others.length, build: (v) => others[v] });
const buildAlphaNumericPercentArbitrary = (others) => frequency({ weight: 10, arbitrary: buildAlphaNumericArbitrary(others) }, { weight: 1, arbitrary: percentCharArb });

function extractOptionConstraints(constraints) {
    if (typeof constraints === 'number')
        return { freq: constraints };
    if (!constraints)
        return {};
    return constraints;
}
function option(arb, rawConstraints) {
    const constraints = extractOptionConstraints(rawConstraints);
    const freq = constraints.freq == null ? 5 : constraints.freq;
    const nilValue = Object.prototype.hasOwnProperty.call(constraints, 'nil') ? constraints.nil : null;
    const nilArb = constant(nilValue);
    const weightedArbs = [
        { arbitrary: nilArb, weight: 1, fallbackValue: { default: nilValue } },
        { arbitrary: arb, weight: freq },
    ];
    const frequencyConstraints = {
        withCrossShrink: true,
        depthFactor: constraints.depthFactor,
        maxDepth: constraints.maxDepth,
        depthIdentifier: constraints.depthIdentifier,
    };
    return FrequencyArbitrary.fromOld(weightedArbs, frequencyConstraints, 'fc.option');
}

function extractStringConstraints(options) {
    return options[0] !== undefined
        ? typeof options[0] === 'number'
            ? typeof options[1] === 'number'
                ? { minLength: options[0], maxLength: options[1] }
                : { maxLength: options[0] }
            : options[0]
        : {};
}

function patternsToStringMapper(tab) {
    return tab.join('');
}
function patternsToStringUnmapperFor(patternsArb, constraints) {
    return function patternsToStringUnmapper(value) {
        if (typeof value !== 'string') {
            throw new Error('Unsupported value');
        }
        const minLength = constraints.minLength !== undefined ? constraints.minLength : 0;
        const maxLength = constraints.maxLength !== undefined ? constraints.maxLength : maxLengthFromMinLength(minLength);
        if (value.length === 0) {
            if (minLength > 0) {
                throw new Error('Unable to unmap received string');
            }
            return [];
        }
        const stack = [{ endIndexChunks: 0, nextStartIndex: 1, chunks: [] }];
        while (stack.length > 0) {
            const last = stack.pop();
            for (let index = last.nextStartIndex; index <= value.length; ++index) {
                const chunk = value.substring(last.endIndexChunks, index);
                if (patternsArb.canShrinkWithoutContext(chunk)) {
                    const newChunks = last.chunks.concat([chunk]);
                    if (index === value.length) {
                        if (newChunks.length < minLength || newChunks.length > maxLength) {
                            break;
                        }
                        return newChunks;
                    }
                    stack.push({ endIndexChunks: last.endIndexChunks, nextStartIndex: index + 1, chunks: last.chunks });
                    stack.push({ endIndexChunks: index, nextStartIndex: index + 1, chunks: newChunks });
                    break;
                }
            }
        }
        throw new Error('Unable to unmap received string');
    };
}

function stringOf(charArb, ...args) {
    const constraints = extractStringConstraints(args);
    return convertFromNext(convertToNext(array(charArb, constraints)).map(patternsToStringMapper, patternsToStringUnmapperFor(convertToNext(charArb), constraints)));
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

function toSubdomainLabelMapper([f, d]) {
    return d === null ? f : `${f}${d[0]}${d[1]}`;
}
function toSubdomainLabelUnmapper(value) {
    if (typeof value !== 'string' || value.length === 0) {
        throw new Error('Unsupported');
    }
    if (value.length === 1) {
        return [value[0], null];
    }
    return [value[0], [value.substring(1, value.length - 1), value[value.length - 1]]];
}
function subdomainLabel() {
    const alphaNumericArb = buildLowerAlphaNumericArbitrary([]);
    const alphaNumericHyphenArb = buildLowerAlphaNumericArbitrary(['-']);
    return convertFromNext(convertToNext(tuple(alphaNumericArb, option(tuple(stringOf(alphaNumericHyphenArb, { maxLength: 61 }), alphaNumericArb))))
        .map(toSubdomainLabelMapper, toSubdomainLabelUnmapper)
        .filter(filterInvalidSubdomainLabel));
}
function labelsMapper(elements) {
    return `${elements[0].join('.')}.${elements[1]}`;
}
function labelsUnmapper(value) {
    if (typeof value !== 'string') {
        throw new Error('Unsupported type');
    }
    const lastDotIndex = value.lastIndexOf('.');
    return [value.substring(0, lastDotIndex).split('.'), value.substring(lastDotIndex + 1)];
}
function domain() {
    const alphaNumericArb = buildLowerAlphaArbitrary([]);
    const publicSuffixArb = stringOf(alphaNumericArb, { minLength: 2, maxLength: 10 });
    return convertFromNext(convertToNext(tuple(array(subdomainLabel(), { minLength: 1, maxLength: 5 }), publicSuffixArb))
        .map(labelsMapper, labelsUnmapper)
        .filter((d) => d.length <= 255));
}

function dotMapper(a) {
    return a.join('.');
}
function dotUnmapper(value) {
    if (typeof value !== 'string') {
        throw new Error('Unsupported');
    }
    return value.split('.');
}
function atMapper(data) {
    return `${data[0]}@${data[1]}`;
}
function atUnmapper(value) {
    if (typeof value !== 'string') {
        throw new Error('Unsupported');
    }
    return value.split('@', 2);
}
function emailAddress() {
    const others = ['!', '#', '$', '%', '&', "'", '*', '+', '-', '/', '=', '?', '^', '_', '`', '{', '|', '}', '~'];
    const atextArb = buildLowerAlphaNumericArbitrary(others);
    const localPartArb = convertFromNext(convertToNext(array(stringOf(atextArb, { minLength: 1, maxLength: 10 }), { minLength: 1, maxLength: 5 }))
        .map(dotMapper, dotUnmapper)
        .filter((lp) => lp.length <= 64));
    return convertFromNext(convertToNext(tuple(localPartArb, domain())).map(atMapper, atUnmapper));
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

class ArrayInt64Arbitrary extends NextArbitrary {
    constructor(min, max) {
        super();
        this.min = min;
        this.max = max;
        this.biasedRanges = null;
    }
    generate(mrng, biasFactor) {
        const range = this.computeGenerateRange(mrng, biasFactor);
        const uncheckedValue = mrng.nextArrayInt(range.min, range.max);
        if (uncheckedValue.data.length === 1) {
            uncheckedValue.data.unshift(0);
        }
        return new NextValue(uncheckedValue, undefined);
    }
    computeGenerateRange(mrng, biasFactor) {
        if (biasFactor === undefined || mrng.nextInt(1, biasFactor) !== 1) {
            return { min: this.min, max: this.max };
        }
        const ranges = this.retrieveBiasedRanges();
        if (ranges.length === 1) {
            return ranges[0];
        }
        const id = mrng.nextInt(-2 * (ranges.length - 1), ranges.length - 2);
        return id < 0 ? ranges[0] : ranges[id + 1];
    }
    canShrinkWithoutContext(value) {
        const unsafeValue = value;
        return (typeof value === 'object' &&
            value !== null &&
            (unsafeValue.sign === -1 || unsafeValue.sign === 1) &&
            Array.isArray(unsafeValue.data) &&
            unsafeValue.data.length === 2 &&
            ((isStrictlySmaller64(this.min, unsafeValue) && isStrictlySmaller64(unsafeValue, this.max)) ||
                isEqual64(this.min, unsafeValue) ||
                isEqual64(this.max, unsafeValue)));
    }
    shrinkArrayInt64(value, target, tryTargetAsap) {
        const realGap = substract64(value, target);
        function* shrinkGen() {
            let previous = tryTargetAsap ? undefined : target;
            const gap = tryTargetAsap ? realGap : halve64(realGap);
            for (let toremove = gap; !isZero64(toremove); toremove = halve64(toremove)) {
                const next = substract64(value, toremove);
                yield new NextValue(next, previous);
                previous = next;
            }
        }
        return stream(shrinkGen());
    }
    shrink(current, context) {
        if (!ArrayInt64Arbitrary.isValidContext(current, context)) {
            const target = this.defaultTarget();
            return this.shrinkArrayInt64(current, target, true);
        }
        if (this.isLastChanceTry(current, context)) {
            return Stream.of(new NextValue(context, undefined));
        }
        return this.shrinkArrayInt64(current, context, false);
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
    retrieveBiasedRanges() {
        if (this.biasedRanges != null) {
            return this.biasedRanges;
        }
        if (isEqual64(this.min, this.max)) {
            this.biasedRanges = [{ min: this.min, max: this.max }];
            return this.biasedRanges;
        }
        const minStrictlySmallerZero = isStrictlyNegative64(this.min);
        const maxStrictlyGreaterZero = isStrictlyPositive64(this.max);
        if (minStrictlySmallerZero && maxStrictlyGreaterZero) {
            const logMin = logLike64(this.min);
            const logMax = logLike64(this.max);
            this.biasedRanges = [
                { min: logMin, max: logMax },
                { min: substract64(this.max, logMax), max: this.max },
                { min: this.min, max: substract64(this.min, logMin) },
            ];
        }
        else {
            const logGap = logLike64(substract64(this.max, this.min));
            const arbCloseToMin = { min: this.min, max: add64(this.min, logGap) };
            const arbCloseToMax = { min: substract64(this.max, logGap), max: this.max };
            this.biasedRanges = minStrictlySmallerZero
                ? [arbCloseToMax, arbCloseToMin]
                : [arbCloseToMin, arbCloseToMax];
        }
        return this.biasedRanges;
    }
}
function arrayInt64(min, max) {
    const arb = new ArrayInt64Arbitrary(min, max);
    return convertFromNextWithShrunkOnce(arb, arb.defaultTarget());
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
function unmapperDoubleToIndex(value) {
    if (typeof value !== 'number')
        throw new Error('Unsupported type');
    return doubleToIndex(value);
}
function doubleNext(constraints = {}) {
    const { noDefaultInfinity = false, noNaN = false, min = noDefaultInfinity ? -Number.MAX_VALUE : Number.NEGATIVE_INFINITY, max = noDefaultInfinity ? Number.MAX_VALUE : Number.POSITIVE_INFINITY, } = constraints;
    const minIndex = safeDoubleToIndex(min, 'min');
    const maxIndex = safeDoubleToIndex(max, 'max');
    if (isStrictlySmaller64(maxIndex, minIndex)) {
        throw new Error('fc.doubleNext constraints.min must be smaller or equal to constraints.max');
    }
    if (noNaN) {
        return convertFromNext(convertToNext(arrayInt64(minIndex, maxIndex)).map(indexToDouble, unmapperDoubleToIndex));
    }
    const positiveMaxIdx = isStrictlyPositive64(maxIndex);
    const minIndexWithNaN = positiveMaxIdx ? minIndex : substract64(minIndex, Unit64);
    const maxIndexWithNaN = positiveMaxIdx ? add64(maxIndex, Unit64) : maxIndex;
    return convertFromNext(convertToNext(arrayInt64(minIndexWithNaN, maxIndexWithNaN)).map((index) => {
        if (isStrictlySmaller64(maxIndex, index) || isStrictlySmaller64(index, minIndex))
            return Number.NaN;
        else
            return indexToDouble(index);
    }, (value) => {
        if (typeof value !== 'number')
            throw new Error('Unsupported type');
        if (Number.isNaN(value))
            return !isEqual64(maxIndex, maxIndexWithNaN) ? maxIndexWithNaN : minIndexWithNaN;
        return doubleToIndex(value);
    }));
}

function next(n) {
    return integer(0, (1 << n) - 1);
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
function unmapperFloatToIndex(value) {
    if (typeof value !== 'number')
        throw new Error('Unsupported type');
    return floatToIndex(value);
}
function floatNext(constraints = {}) {
    const { noDefaultInfinity = false, noNaN = false, min = noDefaultInfinity ? -MAX_VALUE_32 : Number.NEGATIVE_INFINITY, max = noDefaultInfinity ? MAX_VALUE_32 : Number.POSITIVE_INFINITY, } = constraints;
    const minIndex = safeFloatToIndex(min, 'min');
    const maxIndex = safeFloatToIndex(max, 'max');
    if (minIndex > maxIndex) {
        throw new Error('fc.floatNext constraints.min must be smaller or equal to constraints.max');
    }
    if (noNaN) {
        return convertFromNext(convertToNext(integer({ min: minIndex, max: maxIndex })).map(indexToFloat, unmapperFloatToIndex));
    }
    const minIndexWithNaN = maxIndex > 0 ? minIndex : minIndex - 1;
    const maxIndexWithNaN = maxIndex > 0 ? maxIndex + 1 : maxIndex;
    return convertFromNext(convertToNext(integer({ min: minIndexWithNaN, max: maxIndexWithNaN })).map((index) => {
        if (index > maxIndex || index < minIndex)
            return Number.NaN;
        else
            return indexToFloat(index);
    }, (value) => {
        if (typeof value !== 'number')
            throw new Error('Unsupported type');
        if (Number.isNaN(value))
            return maxIndex !== maxIndexWithNaN ? maxIndexWithNaN : minIndexWithNaN;
        return floatToIndex(value);
    }));
}

function next$1(n) {
    return integer(0, (1 << n) - 1);
}
const floatInternal = () => {
    return next$1(24).map((v) => v / (1 << 24));
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

function escapeForTemplateString(originalText) {
    return originalText.replace(/([$`\\])/g, '\\$1').replace(/\r/g, '\\r');
}
function escapeForMultilineComments(originalText) {
    return originalText.replace(/\*\//g, '*\\/');
}

const crc32Table = [
    0x00000000, 0x77073096, 0xee0e612c, 0x990951ba, 0x076dc419, 0x706af48f, 0xe963a535, 0x9e6495a3, 0x0edb8832,
    0x79dcb8a4, 0xe0d5e91e, 0x97d2d988, 0x09b64c2b, 0x7eb17cbd, 0xe7b82d07, 0x90bf1d91, 0x1db71064, 0x6ab020f2,
    0xf3b97148, 0x84be41de, 0x1adad47d, 0x6ddde4eb, 0xf4d4b551, 0x83d385c7, 0x136c9856, 0x646ba8c0, 0xfd62f97a,
    0x8a65c9ec, 0x14015c4f, 0x63066cd9, 0xfa0f3d63, 0x8d080df5, 0x3b6e20c8, 0x4c69105e, 0xd56041e4, 0xa2677172,
    0x3c03e4d1, 0x4b04d447, 0xd20d85fd, 0xa50ab56b, 0x35b5a8fa, 0x42b2986c, 0xdbbbc9d6, 0xacbcf940, 0x32d86ce3,
    0x45df5c75, 0xdcd60dcf, 0xabd13d59, 0x26d930ac, 0x51de003a, 0xc8d75180, 0xbfd06116, 0x21b4f4b5, 0x56b3c423,
    0xcfba9599, 0xb8bda50f, 0x2802b89e, 0x5f058808, 0xc60cd9b2, 0xb10be924, 0x2f6f7c87, 0x58684c11, 0xc1611dab,
    0xb6662d3d, 0x76dc4190, 0x01db7106, 0x98d220bc, 0xefd5102a, 0x71b18589, 0x06b6b51f, 0x9fbfe4a5, 0xe8b8d433,
    0x7807c9a2, 0x0f00f934, 0x9609a88e, 0xe10e9818, 0x7f6a0dbb, 0x086d3d2d, 0x91646c97, 0xe6635c01, 0x6b6b51f4,
    0x1c6c6162, 0x856530d8, 0xf262004e, 0x6c0695ed, 0x1b01a57b, 0x8208f4c1, 0xf50fc457, 0x65b0d9c6, 0x12b7e950,
    0x8bbeb8ea, 0xfcb9887c, 0x62dd1ddf, 0x15da2d49, 0x8cd37cf3, 0xfbd44c65, 0x4db26158, 0x3ab551ce, 0xa3bc0074,
    0xd4bb30e2, 0x4adfa541, 0x3dd895d7, 0xa4d1c46d, 0xd3d6f4fb, 0x4369e96a, 0x346ed9fc, 0xad678846, 0xda60b8d0,
    0x44042d73, 0x33031de5, 0xaa0a4c5f, 0xdd0d7cc9, 0x5005713c, 0x270241aa, 0xbe0b1010, 0xc90c2086, 0x5768b525,
    0x206f85b3, 0xb966d409, 0xce61e49f, 0x5edef90e, 0x29d9c998, 0xb0d09822, 0xc7d7a8b4, 0x59b33d17, 0x2eb40d81,
    0xb7bd5c3b, 0xc0ba6cad, 0xedb88320, 0x9abfb3b6, 0x03b6e20c, 0x74b1d29a, 0xead54739, 0x9dd277af, 0x04db2615,
    0x73dc1683, 0xe3630b12, 0x94643b84, 0x0d6d6a3e, 0x7a6a5aa8, 0xe40ecf0b, 0x9309ff9d, 0x0a00ae27, 0x7d079eb1,
    0xf00f9344, 0x8708a3d2, 0x1e01f268, 0x6906c2fe, 0xf762575d, 0x806567cb, 0x196c3671, 0x6e6b06e7, 0xfed41b76,
    0x89d32be0, 0x10da7a5a, 0x67dd4acc, 0xf9b9df6f, 0x8ebeeff9, 0x17b7be43, 0x60b08ed5, 0xd6d6a3e8, 0xa1d1937e,
    0x38d8c2c4, 0x4fdff252, 0xd1bb67f1, 0xa6bc5767, 0x3fb506dd, 0x48b2364b, 0xd80d2bda, 0xaf0a1b4c, 0x36034af6,
    0x41047a60, 0xdf60efc3, 0xa867df55, 0x316e8eef, 0x4669be79, 0xcb61b38c, 0xbc66831a, 0x256fd2a0, 0x5268e236,
    0xcc0c7795, 0xbb0b4703, 0x220216b9, 0x5505262f, 0xc5ba3bbe, 0xb2bd0b28, 0x2bb45a92, 0x5cb36a04, 0xc2d7ffa7,
    0xb5d0cf31, 0x2cd99e8b, 0x5bdeae1d, 0x9b64c2b0, 0xec63f226, 0x756aa39c, 0x026d930a, 0x9c0906a9, 0xeb0e363f,
    0x72076785, 0x05005713, 0x95bf4a82, 0xe2b87a14, 0x7bb12bae, 0x0cb61b38, 0x92d28e9b, 0xe5d5be0d, 0x7cdcefb7,
    0x0bdbdf21, 0x86d3d2d4, 0xf1d4e242, 0x68ddb3f8, 0x1fda836e, 0x81be16cd, 0xf6b9265b, 0x6fb077e1, 0x18b74777,
    0x88085ae6, 0xff0f6a70, 0x66063bca, 0x11010b5c, 0x8f659eff, 0xf862ae69, 0x616bffd3, 0x166ccf45, 0xa00ae278,
    0xd70dd2ee, 0x4e048354, 0x3903b3c2, 0xa7672661, 0xd06016f7, 0x4969474d, 0x3e6e77db, 0xaed16a4a, 0xd9d65adc,
    0x40df0b66, 0x37d83bf0, 0xa9bcae53, 0xdebb9ec5, 0x47b2cf7f, 0x30b5ffe9, 0xbdbdf21c, 0xcabac28a, 0x53b39330,
    0x24b4a3a6, 0xbad03605, 0xcdd70693, 0x54de5729, 0x23d967bf, 0xb3667a2e, 0xc4614ab8, 0x5d681b02, 0x2a6f2b94,
    0xb40bbe37, 0xc30c8ea1, 0x5a05df1b, 0x2d02ef8d,
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

function buildCompareFunctionArbitrary(cmp) {
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

function compareBooleanFunc() {
    return buildCompareFunctionArbitrary(Object.assign((hA, hB) => hA < hB, {
        toString() {
            return '(hA, hB) => hA < hB';
        },
    }));
}

function compareFunc() {
    return buildCompareFunctionArbitrary(Object.assign((hA, hB) => hA - hB, {
        toString() {
            return '(hA, hB) => hA - hB';
        },
    }));
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
            function prettyPrint(stringifiedOuts) {
                const seenValues = Object.keys(recorded)
                    .sort()
                    .map((k) => `${k} => ${stringify(recorded[k])}`)
                    .map((line) => `/* ${escapeForMultilineComments(line)} */`);
                return `function(...args) {
  // With hash and stringify coming from fast-check${seenValues.length !== 0 ? `\n  ${seenValues.join('\n  ')}` : ''}
  const outs = ${stringifiedOuts};
  return outs[hash('${seed}' + stringify(args)) % outs.length];
}`;
            }
            return Object.defineProperties(f, {
                toString: { value: () => prettyPrint(stringify(outs)) },
                [toStringMethod]: { value: () => prettyPrint(stringify(outs)) },
                [asyncToStringMethod]: { value: async () => prettyPrint(await asyncStringify(outs)) },
                [cloneMethod]: { value: producer, configurable: true },
            });
        };
        return producer();
    });
}

function maxSafeInteger() {
    const arb = new IntegerArbitrary(Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
    return convertFromNextWithShrunkOnce(arb, arb.defaultTarget());
}

function maxSafeNat() {
    const arb = new IntegerArbitrary(0, Number.MAX_SAFE_INTEGER);
    return convertFromNextWithShrunkOnce(arb, arb.defaultTarget());
}

function natToStringifiedNatMapper(options) {
    const [style, v] = options;
    switch (style) {
        case 'oct':
            return `0${Number(v).toString(8)}`;
        case 'hex':
            return `0x${Number(v).toString(16)}`;
        case 'dec':
        default:
            return `${v}`;
    }
}
function tryParseStringifiedNat(stringValue, radix) {
    const parsedNat = Number.parseInt(stringValue, radix);
    if (parsedNat.toString(radix) !== stringValue) {
        throw new Error('Invalid value');
    }
    return parsedNat;
}
function natToStringifiedNatUnmapper(value) {
    if (typeof value !== 'string') {
        throw new Error('Invalid type');
    }
    if (value.length >= 2 && value[0] === '0') {
        if (value[1] === 'x') {
            return ['hex', tryParseStringifiedNat(value.substr(2), 16)];
        }
        return ['oct', tryParseStringifiedNat(value.substr(1), 8)];
    }
    return ['dec', tryParseStringifiedNat(value, 10)];
}

function dotJoinerMapper(data) {
    return data.join('.');
}
function dotJoinerUnmapper(value) {
    if (typeof value !== 'string') {
        throw new Error('Invalid type');
    }
    return value.split('.').map((v) => tryParseStringifiedNat(v, 10));
}
function ipV4() {
    return convertFromNext(convertToNext(tuple(nat(255), nat(255), nat(255), nat(255))).map(dotJoinerMapper, dotJoinerUnmapper));
}

function isOneOfContraints(param) {
    return param != null && typeof param === 'object' && !('generate' in param);
}
function oneof(...args) {
    const constraints = args[0];
    if (isOneOfContraints(constraints)) {
        const weightedArbs = args.slice(1).map((arbitrary) => ({ arbitrary, weight: 1 }));
        return FrequencyArbitrary.fromOld(weightedArbs, constraints, 'fc.oneof');
    }
    const weightedArbs = args.map((arbitrary) => ({ arbitrary, weight: 1 }));
    return FrequencyArbitrary.fromOld(weightedArbs, {}, 'fc.oneof');
}

function buildStringifiedNatArbitrary(maxValue) {
    return convertFromNext(convertToNext(tuple(constantFrom('dec', 'oct', 'hex'), nat(maxValue))).map(natToStringifiedNatMapper, natToStringifiedNatUnmapper));
}

function dotJoinerMapper$1(data) {
    return data.join('.');
}
function dotJoinerUnmapper$1(value) {
    if (typeof value !== 'string') {
        throw new Error('Invalid type');
    }
    return value.split('.');
}
function ipV4Extended() {
    return oneof(convertFromNext(convertToNext(tuple(buildStringifiedNatArbitrary(255), buildStringifiedNatArbitrary(255), buildStringifiedNatArbitrary(255), buildStringifiedNatArbitrary(255))).map(dotJoinerMapper$1, dotJoinerUnmapper$1)), convertFromNext(convertToNext(tuple(buildStringifiedNatArbitrary(255), buildStringifiedNatArbitrary(255), buildStringifiedNatArbitrary(65535))).map(dotJoinerMapper$1, dotJoinerUnmapper$1)), convertFromNext(convertToNext(tuple(buildStringifiedNatArbitrary(255), buildStringifiedNatArbitrary(16777215))).map(dotJoinerMapper$1, dotJoinerUnmapper$1)), buildStringifiedNatArbitrary(4294967295));
}

function codePointsToStringMapper(tab) {
    return tab.join('');
}
function codePointsToStringUnmapper(value) {
    if (typeof value !== 'string') {
        throw new Error('Cannot unmap the passed value');
    }
    return [...value];
}

function hexaString(...args) {
    const constraints = extractStringConstraints(args);
    return convertFromNext(convertToNext(array(hexa(), constraints)).map(codePointsToStringMapper, codePointsToStringUnmapper));
}

function readBh(value) {
    if (value.length === 0)
        return [];
    else
        return value.split(':');
}
function extractEhAndL(value) {
    const valueSplits = value.split(':');
    if (valueSplits.length >= 2 && valueSplits[valueSplits.length - 1].length <= 4) {
        return [
            valueSplits.slice(0, valueSplits.length - 2),
            `${valueSplits[valueSplits.length - 2]}:${valueSplits[valueSplits.length - 1]}`,
        ];
    }
    return [valueSplits.slice(0, valueSplits.length - 1), valueSplits[valueSplits.length - 1]];
}
function fullySpecifiedMapper(data) {
    return `${data[0].join(':')}:${data[1]}`;
}
function fullySpecifiedUnmapper(value) {
    if (typeof value !== 'string')
        throw new Error('Invalid type');
    return extractEhAndL(value);
}
function onlyTrailingMapper(data) {
    return `::${data[0].join(':')}:${data[1]}`;
}
function onlyTrailingUnmapper(value) {
    if (typeof value !== 'string')
        throw new Error('Invalid type');
    if (!value.startsWith('::'))
        throw new Error('Invalid value');
    return extractEhAndL(value.substring(2));
}
function multiTrailingMapper(data) {
    return `${data[0].join(':')}::${data[1].join(':')}:${data[2]}`;
}
function multiTrailingUnmapper(value) {
    if (typeof value !== 'string')
        throw new Error('Invalid type');
    const [bhString, trailingString] = value.split('::', 2);
    const [eh, l] = extractEhAndL(trailingString);
    return [readBh(bhString), eh, l];
}
function multiTrailingMapperOne(data) {
    return multiTrailingMapper([data[0], [data[1]], data[2]]);
}
function multiTrailingUnmapperOne(value) {
    const out = multiTrailingUnmapper(value);
    return [out[0], out[1].join(':'), out[2]];
}
function singleTrailingMapper(data) {
    return `${data[0].join(':')}::${data[1]}`;
}
function singleTrailingUnmapper(value) {
    if (typeof value !== 'string')
        throw new Error('Invalid type');
    const [bhString, trailing] = value.split('::', 2);
    return [readBh(bhString), trailing];
}
function noTrailingMapper(data) {
    return `${data[0].join(':')}::`;
}
function noTrailingUnmapper(value) {
    if (typeof value !== 'string')
        throw new Error('Invalid type');
    if (!value.endsWith('::'))
        throw new Error('Invalid value');
    return [readBh(value.substring(0, value.length - 2))];
}

function h16sTol32Mapper([a, b]) {
    return `${a}:${b}`;
}
function h16sTol32Unmapper(value) {
    if (typeof value !== 'string')
        throw new Error('Invalid type');
    if (!value.includes(':'))
        throw new Error('Invalid value');
    return value.split(':', 2);
}
function ipV6() {
    const h16Arb = hexaString({ minLength: 1, maxLength: 4 });
    const ls32Arb = oneof(convertFromNext(convertToNext(tuple(h16Arb, h16Arb)).map(h16sTol32Mapper, h16sTol32Unmapper)), ipV4());
    return oneof(convertFromNext(convertToNext(tuple(array(h16Arb, { minLength: 6, maxLength: 6 }), ls32Arb)).map(fullySpecifiedMapper, fullySpecifiedUnmapper)), convertFromNext(convertToNext(tuple(array(h16Arb, { minLength: 5, maxLength: 5 }), ls32Arb)).map(onlyTrailingMapper, onlyTrailingUnmapper)), convertFromNext(convertToNext(tuple(array(h16Arb, { minLength: 0, maxLength: 1 }), array(h16Arb, { minLength: 4, maxLength: 4 }), ls32Arb)).map(multiTrailingMapper, multiTrailingUnmapper)), convertFromNext(convertToNext(tuple(array(h16Arb, { minLength: 0, maxLength: 2 }), array(h16Arb, { minLength: 3, maxLength: 3 }), ls32Arb)).map(multiTrailingMapper, multiTrailingUnmapper)), convertFromNext(convertToNext(tuple(array(h16Arb, { minLength: 0, maxLength: 3 }), array(h16Arb, { minLength: 2, maxLength: 2 }), ls32Arb)).map(multiTrailingMapper, multiTrailingUnmapper)), convertFromNext(convertToNext(tuple(array(h16Arb, { minLength: 0, maxLength: 4 }), h16Arb, ls32Arb)).map(multiTrailingMapperOne, multiTrailingUnmapperOne)), convertFromNext(convertToNext(tuple(array(h16Arb, { minLength: 0, maxLength: 5 }), ls32Arb)).map(singleTrailingMapper, singleTrailingUnmapper)), convertFromNext(convertToNext(tuple(array(h16Arb, { minLength: 0, maxLength: 6 }), h16Arb)).map(singleTrailingMapper, singleTrailingUnmapper)), convertFromNext(convertToNext(tuple(array(h16Arb, { minLength: 0, maxLength: 7 }))).map(noTrailingMapper, noTrailingUnmapper)));
}

class LazyArbitrary extends NextArbitrary {
    constructor(name) {
        super();
        this.name = name;
        this.underlying = null;
    }
    generate(mrng, biasFactor) {
        if (!this.underlying) {
            throw new Error(`Lazy arbitrary ${JSON.stringify(this.name)} not correctly initialized`);
        }
        return this.underlying.generate(mrng, biasFactor);
    }
    canShrinkWithoutContext(value) {
        if (!this.underlying) {
            throw new Error(`Lazy arbitrary ${JSON.stringify(this.name)} not correctly initialized`);
        }
        return this.underlying.canShrinkWithoutContext(value);
    }
    shrink(value, context) {
        if (!this.underlying) {
            throw new Error(`Lazy arbitrary ${JSON.stringify(this.name)} not correctly initialized`);
        }
        return this.underlying.shrink(value, context);
    }
}

function letrec(builder) {
    const lazyArbs = Object.create(null);
    const tie = (key) => {
        if (!Object.prototype.hasOwnProperty.call(lazyArbs, key)) {
            lazyArbs[key] = new LazyArbitrary(String(key));
        }
        return convertFromNext(lazyArbs[key]);
    };
    const strictArbs = builder(tie);
    for (const key in strictArbs) {
        if (!Object.prototype.hasOwnProperty.call(strictArbs, key)) {
            continue;
        }
        const lazyAtKey = lazyArbs[key];
        const lazyArb = lazyAtKey !== undefined ? lazyAtKey : new LazyArbitrary(key);
        lazyArb.underlying = convertToNext(strictArbs[key]);
        lazyArbs[key] = lazyArb;
    }
    return strictArbs;
}

function wordsToJoinedStringMapper(words) {
    return words.map((w) => (w[w.length - 1] === ',' ? w.substr(0, w.length - 1) : w)).join(' ');
}
function wordsToJoinedStringUnmapperFor(wordsArbitrary) {
    return function wordsToJoinedStringUnmapper(value) {
        if (typeof value !== 'string') {
            throw new Error('Unsupported type');
        }
        const words = [];
        for (const candidate of value.split(' ')) {
            if (wordsArbitrary.canShrinkWithoutContext(candidate))
                words.push(candidate);
            else if (wordsArbitrary.canShrinkWithoutContext(candidate + ','))
                words.push(candidate + ',');
            else
                throw new Error('Unsupported word');
        }
        return words;
    };
}
function wordsToSentenceMapper(words) {
    let sentence = words.join(' ');
    if (sentence[sentence.length - 1] === ',') {
        sentence = sentence.substr(0, sentence.length - 1);
    }
    return sentence[0].toUpperCase() + sentence.substring(1) + '.';
}
function wordsToSentenceUnmapperFor(wordsArbitrary) {
    return function wordsToSentenceUnmapper(value) {
        if (typeof value !== 'string') {
            throw new Error('Unsupported type');
        }
        if (value.length < 2 ||
            value[value.length - 1] !== '.' ||
            value[value.length - 2] === ',' ||
            value[0].toLowerCase().toUpperCase() !== value[0]) {
            throw new Error('Unsupported value');
        }
        const adaptedValue = value[0].toLowerCase() + value.substring(1, value.length - 1);
        const words = [];
        const candidates = adaptedValue.split(' ');
        for (let idx = 0; idx !== candidates.length; ++idx) {
            const candidate = candidates[idx];
            if (wordsArbitrary.canShrinkWithoutContext(candidate))
                words.push(candidate);
            else if (idx === candidates.length - 1 && wordsArbitrary.canShrinkWithoutContext(candidate + ','))
                words.push(candidate + ',');
            else
                throw new Error('Unsupported word');
        }
        return words;
    };
}
function sentencesToParagraphMapper(sentences) {
    return sentences.join(' ');
}
function sentencesToParagraphUnmapper(value) {
    if (typeof value !== 'string') {
        throw new Error('Unsupported type');
    }
    const sentences = value.split('. ');
    for (let idx = 0; idx < sentences.length - 1; ++idx) {
        sentences[idx] += '.';
    }
    return sentences;
}

const h = (v, w) => {
    return { arbitrary: constant(v), weight: w };
};
function loremWord() {
    return frequency(h('non', 6), h('adipiscing', 5), h('ligula', 5), h('enim', 5), h('pellentesque', 5), h('in', 5), h('augue', 5), h('et', 5), h('nulla', 5), h('lorem', 4), h('sit', 4), h('sed', 4), h('diam', 4), h('fermentum', 4), h('ut', 4), h('eu', 4), h('aliquam', 4), h('mauris', 4), h('vitae', 4), h('felis', 4), h('ipsum', 3), h('dolor', 3), h('amet,', 3), h('elit', 3), h('euismod', 3), h('mi', 3), h('orci', 3), h('erat', 3), h('praesent', 3), h('egestas', 3), h('leo', 3), h('vel', 3), h('sapien', 3), h('integer', 3), h('curabitur', 3), h('convallis', 3), h('purus', 3), h('risus', 2), h('suspendisse', 2), h('lectus', 2), h('nec,', 2), h('ultricies', 2), h('sed,', 2), h('cras', 2), h('elementum', 2), h('ultrices', 2), h('maecenas', 2), h('massa,', 2), h('varius', 2), h('a,', 2), h('semper', 2), h('proin', 2), h('nec', 2), h('nisl', 2), h('amet', 2), h('duis', 2), h('congue', 2), h('libero', 2), h('vestibulum', 2), h('pede', 2), h('blandit', 2), h('sodales', 2), h('ante', 2), h('nibh', 2), h('ac', 2), h('aenean', 2), h('massa', 2), h('suscipit', 2), h('sollicitudin', 2), h('fusce', 2), h('tempus', 2), h('aliquam,', 2), h('nunc', 2), h('ullamcorper', 2), h('rhoncus', 2), h('metus', 2), h('faucibus,', 2), h('justo', 2), h('magna', 2), h('at', 2), h('tincidunt', 2), h('consectetur', 1), h('tortor,', 1), h('dignissim', 1), h('congue,', 1), h('non,', 1), h('porttitor,', 1), h('nonummy', 1), h('molestie,', 1), h('est', 1), h('eleifend', 1), h('mi,', 1), h('arcu', 1), h('scelerisque', 1), h('vitae,', 1), h('consequat', 1), h('in,', 1), h('pretium', 1), h('volutpat', 1), h('pharetra', 1), h('tempor', 1), h('bibendum', 1), h('odio', 1), h('dui', 1), h('primis', 1), h('faucibus', 1), h('luctus', 1), h('posuere', 1), h('cubilia', 1), h('curae,', 1), h('hendrerit', 1), h('velit', 1), h('mauris,', 1), h('gravida', 1), h('ornare', 1), h('ut,', 1), h('pulvinar', 1), h('varius,', 1), h('turpis', 1), h('nibh,', 1), h('eros', 1), h('id', 1), h('aliquet', 1), h('quis', 1), h('lobortis', 1), h('consectetuer', 1), h('morbi', 1), h('vehicula', 1), h('tortor', 1), h('tellus,', 1), h('id,', 1), h('eu,', 1), h('quam', 1), h('feugiat,', 1), h('posuere,', 1), h('iaculis', 1), h('lectus,', 1), h('tristique', 1), h('mollis,', 1), h('nisl,', 1), h('vulputate', 1), h('sem', 1), h('vivamus', 1), h('placerat', 1), h('imperdiet', 1), h('cursus', 1), h('rutrum', 1), h('iaculis,', 1), h('augue,', 1), h('lacus', 1));
}
function lorem(...args) {
    const maxWordsCount = typeof args[0] === 'object' ? args[0].maxCount : args[0];
    const sentencesMode = typeof args[0] === 'object' ? args[0].mode === 'sentences' : args[1];
    const maxCount = maxWordsCount !== undefined ? maxWordsCount : 5;
    if (maxCount < 1) {
        throw new Error(`lorem has to produce at least one word/sentence`);
    }
    const wordArbitrary = loremWord();
    const wordArbitraryNext = convertToNext(wordArbitrary);
    if (sentencesMode) {
        const sentence = convertToNext(array(wordArbitrary, { minLength: 1 })).map(wordsToSentenceMapper, wordsToSentenceUnmapperFor(wordArbitraryNext));
        return convertFromNext(convertToNext(array(convertFromNext(sentence), { minLength: 1, maxLength: maxCount })).map(sentencesToParagraphMapper, sentencesToParagraphUnmapper));
    }
    else {
        return convertFromNext(convertToNext(array(wordArbitrary, { minLength: 1, maxLength: maxCount })).map(wordsToJoinedStringMapper, wordsToJoinedStringUnmapperFor(wordArbitraryNext)));
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
            previous[n] = builder(n);
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
function computeTogglePositions(chars, toggleCase) {
    const positions = [];
    for (let idx = 0; idx !== chars.length; ++idx) {
        if (toggleCase(chars[idx]) !== chars[idx])
            positions.push(idx);
    }
    return positions;
}
function computeFlagsFromChars(untoggledChars, toggledChars, togglePositions) {
    let flags = BigInt(0);
    for (let idx = 0, mask = BigInt(1); idx !== togglePositions.length; ++idx, mask <<= BigInt(1)) {
        if (untoggledChars[togglePositions[idx]] !== toggledChars[togglePositions[idx]]) {
            flags |= mask;
        }
    }
    return flags;
}
function applyFlagsOnChars(chars, flags, togglePositions, toggleCase) {
    for (let idx = 0, mask = BigInt(1); idx !== togglePositions.length; ++idx, mask <<= BigInt(1)) {
        if (flags & mask)
            chars[togglePositions[idx]] = toggleCase(chars[togglePositions[idx]]);
    }
}

class MixedCaseArbitrary extends NextArbitrary {
    constructor(stringArb, toggleCase, untoggleAll) {
        super();
        this.stringArb = stringArb;
        this.toggleCase = toggleCase;
        this.untoggleAll = untoggleAll;
    }
    buildContextFor(rawStringNextValue, flagsNextValue) {
        return {
            rawString: rawStringNextValue.value,
            rawStringContext: rawStringNextValue.context,
            flags: flagsNextValue.value,
            flagsContext: flagsNextValue.context,
        };
    }
    generate(mrng, biasFactor) {
        const rawStringNextValue = this.stringArb.generate(mrng, biasFactor);
        const chars = [...rawStringNextValue.value];
        const togglePositions = computeTogglePositions(chars, this.toggleCase);
        const flagsArb = convertToNext(bigUintN(togglePositions.length));
        const flagsNextValue = flagsArb.generate(mrng, undefined);
        applyFlagsOnChars(chars, flagsNextValue.value, togglePositions, this.toggleCase);
        return new NextValue(chars.join(''), this.buildContextFor(rawStringNextValue, flagsNextValue));
    }
    canShrinkWithoutContext(value) {
        if (typeof value !== 'string') {
            return false;
        }
        return this.untoggleAll !== undefined
            ? this.stringArb.canShrinkWithoutContext(this.untoggleAll(value))
            :
                this.stringArb.canShrinkWithoutContext(value);
    }
    shrink(value, context) {
        let contextSafe;
        if (context !== undefined) {
            contextSafe = context;
        }
        else {
            if (this.untoggleAll !== undefined) {
                const untoggledValue = this.untoggleAll(value);
                const valueChars = [...value];
                const untoggledValueChars = [...untoggledValue];
                const togglePositions = computeTogglePositions(untoggledValueChars, this.toggleCase);
                contextSafe = {
                    rawString: untoggledValue,
                    rawStringContext: undefined,
                    flags: computeFlagsFromChars(untoggledValueChars, valueChars, togglePositions),
                    flagsContext: undefined,
                };
            }
            else {
                contextSafe = {
                    rawString: value,
                    rawStringContext: undefined,
                    flags: BigInt(0),
                    flagsContext: undefined,
                };
            }
        }
        const rawString = contextSafe.rawString;
        const flags = contextSafe.flags;
        return this.stringArb
            .shrink(rawString, contextSafe.rawStringContext)
            .map((nRawStringNextValue) => {
            const nChars = [...nRawStringNextValue.value];
            const nTogglePositions = computeTogglePositions(nChars, this.toggleCase);
            const nFlags = computeNextFlags(flags, nTogglePositions.length);
            applyFlagsOnChars(nChars, nFlags, nTogglePositions, this.toggleCase);
            return new NextValue(nChars.join(''), this.buildContextFor(nRawStringNextValue, new NextValue(nFlags, undefined)));
        })
            .join(makeLazy(() => {
            const chars = [...rawString];
            const togglePositions = computeTogglePositions(chars, this.toggleCase);
            return convertToNext(bigUintN(togglePositions.length))
                .shrink(flags, contextSafe.flagsContext)
                .map((nFlagsNextValue) => {
                const nChars = chars.slice();
                applyFlagsOnChars(nChars, nFlagsNextValue.value, togglePositions, this.toggleCase);
                return new NextValue(nChars.join(''), this.buildContextFor(new NextValue(rawString, contextSafe.rawStringContext), nFlagsNextValue));
            });
        }));
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
    const untoggleAll = constraints && constraints.untoggleAll;
    return convertFromNext(new MixedCaseArbitrary(convertToNext(stringArb), toggleCase, untoggleAll));
}

function toTypedMapper(data) {
    return Float32Array.from(data);
}
function fromTypedUnmapper(value) {
    if (!(value instanceof Float32Array))
        throw new Error('Unexpected type');
    return [...value];
}
function float32Array(constraints = {}) {
    return convertFromNext(convertToNext(array(float(Object.assign(Object.assign({}, constraints), { next: true })), constraints)).map(toTypedMapper, fromTypedUnmapper));
}

function toTypedMapper$1(data) {
    return Float64Array.from(data);
}
function fromTypedUnmapper$1(value) {
    if (!(value instanceof Float64Array))
        throw new Error('Unexpected type');
    return [...value];
}
function float64Array(constraints = {}) {
    return convertFromNext(convertToNext(array(double(Object.assign(Object.assign({}, constraints), { next: true })), constraints)).map(toTypedMapper$1, fromTypedUnmapper$1));
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
function typedIntArrayArbitraryArbitraryBuilder(constraints, defaultMin, defaultMax, TypedArrayClass, arbitraryBuilder) {
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
    return convertFromNext(convertToNext(array(arbitraryBuilder({ min, max }), arrayConstraints)).map((data) => TypedArrayClass.from(data), (value) => {
        if (!(value instanceof TypedArrayClass))
            throw new Error('Invalid type');
        return [...value];
    }));
}

function int16Array(constraints = {}) {
    return typedIntArrayArbitraryArbitraryBuilder(constraints, -32768, 32767, Int16Array, integer);
}

function int32Array(constraints = {}) {
    return typedIntArrayArbitraryArbitraryBuilder(constraints, -0x80000000, 0x7fffffff, Int32Array, integer);
}

function int8Array(constraints = {}) {
    return typedIntArrayArbitraryArbitraryBuilder(constraints, -128, 127, Int8Array, integer);
}

function uint16Array(constraints = {}) {
    return typedIntArrayArbitraryArbitraryBuilder(constraints, 0, 65535, Uint16Array, integer);
}

function uint32Array(constraints = {}) {
    return typedIntArrayArbitraryArbitraryBuilder(constraints, 0, 0xffffffff, Uint32Array, integer);
}

function uint8Array(constraints = {}) {
    return typedIntArrayArbitraryArbitraryBuilder(constraints, 0, 255, Uint8Array, integer);
}

function uint8ClampedArray(constraints = {}) {
    return typedIntArrayArbitraryArbitraryBuilder(constraints, 0, 255, Uint8ClampedArray, integer);
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
    const maxIndexAuthorized = Math.max(maxLength - 1, 0);
    const sparseArrayNoTrailingHole = convertFromNext(convertToNext(set(tuple(nat(maxIndexAuthorized), arb), {
        minLength: minNumElements,
        maxLength: resultedMaxNumElements,
        compare: (itemA, itemB) => itemA[0] === itemB[0],
    })).map((items) => {
        const lastIndex = extractMaxIndex(items);
        return arrayFromItems(lastIndex + 1, items);
    }, (value) => {
        if (!Array.isArray(value)) {
            throw new Error('Not supported entry type');
        }
        return Object.entries(value).map((entry) => [Number(entry[0]), entry[1]]);
    }));
    if (noTrailingHole || maxLength === minNumElements) {
        return sparseArrayNoTrailingHole;
    }
    return convertFromNext(convertToNext(tuple(sparseArrayNoTrailingHole, integer({ min: minNumElements, max: maxLength }))).map((data) => {
        const sparse = data[0];
        const targetLength = data[1];
        if (sparse.length >= targetLength) {
            return sparse;
        }
        const longerSparse = sparse.slice();
        longerSparse.length = targetLength;
        return longerSparse;
    }, (value) => {
        if (!Array.isArray(value)) {
            throw new Error('Not supported entry type');
        }
        return [value, value.length];
    }));
}

function arrayToMapMapper(data) {
    return new Map(data);
}
function arrayToMapUnmapper(value) {
    if (typeof value !== 'object' || value === null) {
        throw new Error('Incompatible instance received: should be a non-null object');
    }
    if (!('constructor' in value) || value.constructor !== Map) {
        throw new Error('Incompatible instance received: should be of exact type Map');
    }
    return Array.from(value);
}

function arrayToSetMapper(data) {
    return new Set(data);
}
function arrayToSetUnmapper(value) {
    if (typeof value !== 'object' || value === null) {
        throw new Error('Incompatible instance received: should be a non-null object');
    }
    if (!('constructor' in value) || value.constructor !== Set) {
        throw new Error('Incompatible instance received: should be of exact type Set');
    }
    return Array.from(value);
}

function objectToPrototypeLessMapper(o) {
    return Object.assign(Object.create(null), o);
}
function objectToPrototypeLessUnmapper(value) {
    if (typeof value !== 'object' || value === null) {
        throw new Error('Incompatible instance received: should be a non-null object');
    }
    if ('__proto__' in value) {
        throw new Error('Incompatible instance received: should not have any __proto__');
    }
    return Object.assign({}, value);
}

function entriesOf(keyArb, valueArb, maxKeys) {
    return convertToNext(set(tuple(keyArb, valueArb), { maxLength: maxKeys, compare: (t1, t2) => t1[0] === t2[0] }));
}
function mapOf(ka, va, maxKeys) {
    return convertFromNext(entriesOf(ka, va, maxKeys).map(arrayToMapMapper, arrayToMapUnmapper));
}
function dictOf(ka, va, maxKeys) {
    return convertFromNext(entriesOf(ka, va, maxKeys).map(keyValuePairsToObjectMapper, keyValuePairsToObjectUnmapper));
}
function setOf(va, maxKeys) {
    return convertFromNext(convertToNext(set(va, { maxLength: maxKeys })).map(arrayToSetMapper, arrayToSetUnmapper));
}
function prototypeLessOf(objectArb) {
    return convertFromNext(convertToNext(objectArb).map(objectToPrototypeLessMapper, objectToPrototypeLessUnmapper));
}
function typedArray() {
    return oneof(int8Array(), uint8Array(), uint8ClampedArray(), int16Array(), uint16Array(), int32Array(), uint32Array(), float32Array(), float64Array());
}
function anyArbitraryBuilder(constraints) {
    const arbitrariesForBase = constraints.values;
    const maxDepth = constraints.maxDepth;
    const maxKeys = constraints.maxKeys;
    const baseArb = oneof(...arbitrariesForBase);
    return letrec((tie) => ({
        anything: oneof({ maxDepth }, baseArb, tie('array'), tie('object'), ...(constraints.withMap ? [tie('map')] : []), ...(constraints.withSet ? [tie('set')] : []), ...(constraints.withObjectString ? [tie('anything').map((o) => stringify(o))] : []), ...(constraints.withNullPrototype ? [prototypeLessOf(tie('object'))] : []), ...(constraints.withBigInt ? [bigInt()] : []), ...(constraints.withDate ? [date()] : []), ...(constraints.withTypedArray ? [typedArray()] : []), ...(constraints.withSparseArray ? [sparseArray(tie('anything'), { maxNumElements: maxKeys })] : [])),
        keys: constraints.withObjectString
            ? frequency({ arbitrary: constraints.key, weight: 10 }, { arbitrary: tie('anything').map((o) => stringify(o)), weight: 1 })
            : constraints.key,
        arrayBase: oneof(...arbitrariesForBase.map((arb) => array(arb, { maxLength: maxKeys }))),
        array: oneof(tie('arrayBase'), array(tie('anything'), { maxLength: maxKeys })),
        setBase: oneof(...arbitrariesForBase.map((arb) => setOf(arb, maxKeys))),
        set: oneof(tie('setBase'), setOf(tie('anything'), maxKeys)),
        mapBase: oneof(...arbitrariesForBase.map((arb) => mapOf(tie('keys'), arb, maxKeys))),
        map: oneof(tie('mapBase'), oneof(mapOf(tie('keys'), tie('anything'), maxKeys), mapOf(tie('anything'), tie('anything'), maxKeys))),
        objectBase: oneof(...arbitrariesForBase.map((arb) => dictOf(tie('keys'), arb, maxKeys))),
        object: oneof(tie('objectBase'), dictOf(tie('keys'), tie('anything'), maxKeys)),
    })).anything;
}

function string(...args) {
    const constraints = extractStringConstraints(args);
    return convertFromNext(convertToNext(array(char(), constraints)).map(codePointsToStringMapper, codePointsToStringUnmapper));
}

function unboxedToBoxedMapper(value) {
    switch (typeof value) {
        case 'boolean':
            return new Boolean(value);
        case 'number':
            return new Number(value);
        case 'string':
            return new String(value);
        default:
            return value;
    }
}
function unboxedToBoxedUnmapper(value) {
    if (typeof value !== 'object' || value === null || !('constructor' in value)) {
        return value;
    }
    return value.constructor === Boolean || value.constructor === Number || value.constructor === String
        ?
            value.valueOf()
        : value;
}

function boxedArbitraryBuilder(arb) {
    return convertFromNext(convertToNext(arb).map(unboxedToBoxedMapper, unboxedToBoxedUnmapper));
}

function defaultValues() {
    return [
        boolean(),
        maxSafeInteger(),
        double({ next: true }),
        string(),
        oneof(string(), constant(null), constant(undefined)),
    ];
}
function boxArbitraries(arbs) {
    return arbs.map((arb) => boxedArbitraryBuilder(arb));
}
function boxArbitrariesIfNeeded(arbs, boxEnabled) {
    return boxEnabled ? boxArbitraries(arbs).concat(arbs) : arbs;
}
function toQualifiedObjectConstraints(settings = {}) {
    function orDefault(optionalValue, defaultValue) {
        return optionalValue !== undefined ? optionalValue : defaultValue;
    }
    return {
        key: orDefault(settings.key, string()),
        values: boxArbitrariesIfNeeded(orDefault(settings.values, defaultValues()), orDefault(settings.withBoxedValues, false)),
        maxDepth: orDefault(settings.maxDepth, 2),
        maxKeys: orDefault(settings.maxKeys, 5),
        withSet: orDefault(settings.withSet, false),
        withMap: orDefault(settings.withMap, false),
        withObjectString: orDefault(settings.withObjectString, false),
        withNullPrototype: orDefault(settings.withNullPrototype, false),
        withBigInt: orDefault(settings.withBigInt, false),
        withDate: orDefault(settings.withDate, false),
        withTypedArray: orDefault(settings.withTypedArray, false),
        withSparseArray: orDefault(settings.withSparseArray, false),
    };
}

function objectInternal(constraints) {
    return dictionary(constraints.key, anyArbitraryBuilder(constraints));
}
function object(constraints) {
    return objectInternal(toQualifiedObjectConstraints(constraints));
}

function jsonConstraintsBuilder(stringArbitrary, constraints) {
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

function anything(constraints) {
    return anyArbitraryBuilder(toQualifiedObjectConstraints(constraints));
}

function jsonObject(constraints) {
    return anything(jsonConstraintsBuilder(string(), constraints));
}

function json(constraints) {
    const arb = constraints != null ? jsonObject(constraints) : jsonObject();
    return arb.map(JSON.stringify);
}

function unicodeString(...args) {
    const constraints = extractStringConstraints(args);
    return convertFromNext(convertToNext(array(unicode(), constraints)).map(codePointsToStringMapper, codePointsToStringUnmapper));
}

function unicodeJsonObject(constraints) {
    return anything(jsonConstraintsBuilder(unicodeString(), constraints));
}

function unicodeJson(constraints) {
    const arb = constraints != null ? unicodeJsonObject(constraints) : unicodeJsonObject();
    return arb.map(JSON.stringify);
}

function extractEnumerableKeys(instance) {
    const keys = Object.keys(instance);
    const symbols = Object.getOwnPropertySymbols(instance);
    for (let index = 0; index !== symbols.length; ++index) {
        const symbol = symbols[index];
        const descriptor = Object.getOwnPropertyDescriptor(instance, symbol);
        if (descriptor && descriptor.enumerable) {
            keys.push(symbol);
        }
    }
    return keys;
}

function buildValuesAndSeparateKeysToObjectMapper(keys, noKeyValue) {
    return function valuesAndSeparateKeysToObjectMapper(gs) {
        const obj = {};
        for (let idx = 0; idx !== keys.length; ++idx) {
            const valueWrapper = gs[idx];
            if (valueWrapper !== noKeyValue) {
                obj[keys[idx]] = valueWrapper;
            }
        }
        return obj;
    };
}
function buildValuesAndSeparateKeysToObjectUnmapper(keys, noKeyValue) {
    return function valuesAndSeparateKeysToObjectUnmapper(value) {
        if (typeof value !== 'object' || value === null) {
            throw new Error('Incompatible instance received: should be a non-null object');
        }
        if (!('constructor' in value) || value.constructor !== Object) {
            throw new Error('Incompatible instance received: should be of exact type Object');
        }
        let extractedPropertiesCount = 0;
        const extractedValues = [];
        for (let idx = 0; idx !== keys.length; ++idx) {
            const descriptor = Object.getOwnPropertyDescriptor(value, keys[idx]);
            if (descriptor !== undefined) {
                if (!descriptor.configurable || !descriptor.enumerable || !descriptor.writable) {
                    throw new Error('Incompatible instance received: should contain only c/e/w properties');
                }
                if (descriptor.get !== undefined || descriptor.set !== undefined) {
                    throw new Error('Incompatible instance received: should contain only no get/set properties');
                }
                ++extractedPropertiesCount;
                extractedValues.push(descriptor.value);
            }
            else {
                extractedValues.push(noKeyValue);
            }
        }
        const namePropertiesCount = Object.getOwnPropertyNames(value).length;
        const symbolPropertiesCount = Object.getOwnPropertySymbols(value).length;
        if (extractedPropertiesCount !== namePropertiesCount + symbolPropertiesCount) {
            throw new Error('Incompatible instance received: should not contain extra properties');
        }
        return extractedValues;
    };
}

const noKeyValue = Symbol('no-key');
function buildPartialRecordArbitrary(recordModel, requiredKeys) {
    const keys = extractEnumerableKeys(recordModel);
    const arbs = [];
    for (let index = 0; index !== keys.length; ++index) {
        const k = keys[index];
        const requiredArbitrary = recordModel[k];
        if (requiredKeys === undefined || requiredKeys.indexOf(k) !== -1)
            arbs.push(requiredArbitrary);
        else
            arbs.push(option(requiredArbitrary, { nil: noKeyValue }));
    }
    return convertFromNext(convertToNext(tuple(...arbs)).map(buildValuesAndSeparateKeysToObjectMapper(keys, noKeyValue), buildValuesAndSeparateKeysToObjectUnmapper(keys, noKeyValue)));
}

function record(recordModel, constraints) {
    if (constraints == null) {
        return buildPartialRecordArbitrary(recordModel, undefined);
    }
    if ('withDeletedKeys' in constraints && 'requiredKeys' in constraints) {
        throw new Error(`requiredKeys and withDeletedKeys cannot be used together in fc.record`);
    }
    const requireDeletedKeys = ('requiredKeys' in constraints && constraints.requiredKeys !== undefined) ||
        ('withDeletedKeys' in constraints && !!constraints.withDeletedKeys);
    if (!requireDeletedKeys) {
        return buildPartialRecordArbitrary(recordModel, undefined);
    }
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
    return buildPartialRecordArbitrary(recordModel, requiredKeys);
}

function prettyPrint(seenValuesStrings) {
    return `Stream(${seenValuesStrings.join(',')}…)`;
}
class StreamArbitrary extends NextArbitrary {
    constructor(arb) {
        super();
        this.arb = arb;
    }
    generate(mrng, biasFactor) {
        const appliedBiasFactor = biasFactor !== undefined && mrng.nextInt(1, biasFactor) === 1 ? biasFactor : undefined;
        const enrichedProducer = () => {
            const seenValues = [];
            const g = function* (arb, clonedMrng) {
                while (true) {
                    const value = arb.generate(clonedMrng, appliedBiasFactor).value;
                    seenValues.push(value);
                    yield value;
                }
            };
            const s = new Stream(g(this.arb, mrng.clone()));
            return Object.defineProperties(s, {
                toString: { value: () => prettyPrint(seenValues.map(stringify)) },
                [toStringMethod]: { value: () => prettyPrint(seenValues.map(stringify)) },
                [asyncToStringMethod]: { value: async () => prettyPrint(await Promise.all(seenValues.map(asyncStringify))) },
                [cloneMethod]: { value: enrichedProducer, enumerable: true },
            });
        };
        return new NextValue(enrichedProducer(), undefined);
    }
    canShrinkWithoutContext(value) {
        return false;
    }
    shrink(_value, _context) {
        return Stream.nil();
    }
}

function infiniteStream(arb) {
    return convertFromNext(new StreamArbitrary(convertToNext(arb)));
}

function asciiString(...args) {
    const constraints = extractStringConstraints(args);
    return convertFromNext(convertToNext(array(ascii(), constraints)).map(codePointsToStringMapper, codePointsToStringUnmapper));
}

function stringToBase64Mapper(s) {
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
}
function stringToBase64Unmapper(value) {
    if (typeof value !== 'string' || value.length % 4 !== 0) {
        throw new Error('Invalid string received');
    }
    const lastTrailingIndex = value.indexOf('=');
    if (lastTrailingIndex === -1) {
        return value;
    }
    const numTrailings = value.length - lastTrailingIndex;
    if (numTrailings > 2) {
        throw new Error('Cannot unmap the passed value');
    }
    return value.substring(0, lastTrailingIndex);
}

function extractMinMaxConstraints(args) {
    const constraints = extractStringConstraints(args);
    const minLength = constraints.minLength !== undefined ? constraints.minLength : 0;
    const maxLength = constraints.maxLength !== undefined ? constraints.maxLength : maxLengthFromMinLength(minLength);
    return { minLength, maxLength };
}
function base64String(...args) {
    const constraints = extractMinMaxConstraints(args);
    const unscaledMinLength = constraints.minLength;
    const unscaledMaxLength = constraints.maxLength;
    const minLength = unscaledMinLength + 3 - ((unscaledMinLength + 3) % 4);
    const maxLength = unscaledMaxLength - (unscaledMaxLength % 4);
    if (minLength > maxLength)
        throw new Error('Minimal length should be inferior or equal to maximal length');
    if (minLength % 4 !== 0)
        throw new Error('Minimal length of base64 strings must be a multiple of 4');
    if (maxLength % 4 !== 0)
        throw new Error('Maximal length of base64 strings must be a multiple of 4');
    return convertFromNext(convertToNext(array(base64(), { minLength, maxLength }))
        .map(codePointsToStringMapper, codePointsToStringUnmapper)
        .map(stringToBase64Mapper, stringToBase64Unmapper));
}

function fullUnicodeString(...args) {
    const constraints = extractStringConstraints(args);
    return convertFromNext(convertToNext(array(fullUnicode(), constraints)).map(codePointsToStringMapper, codePointsToStringUnmapper));
}

function charsToStringMapper(tab) {
    return tab.join('');
}
function charsToStringUnmapper(value) {
    if (typeof value !== 'string') {
        throw new Error('Cannot unmap the passed value');
    }
    return value.split('');
}

function string16bits(...args) {
    const constraints = extractStringConstraints(args);
    return convertFromNext(convertToNext(array(char16bits(), constraints)).map(charsToStringMapper, charsToStringUnmapper));
}

function isSubarrayOf(source, small) {
    const countMap = new Map();
    let countMinusZero = 0;
    for (const sourceEntry of source) {
        if (Object.is(sourceEntry, -0)) {
            ++countMinusZero;
        }
        else {
            const oldCount = countMap.get(sourceEntry) || 0;
            countMap.set(sourceEntry, oldCount + 1);
        }
    }
    for (let index = 0; index !== small.length; ++index) {
        if (!(index in small)) {
            return false;
        }
        const smallEntry = small[index];
        if (Object.is(smallEntry, -0)) {
            if (countMinusZero === 0)
                return false;
            --countMinusZero;
        }
        else {
            const oldCount = countMap.get(smallEntry) || 0;
            if (oldCount === 0)
                return false;
            countMap.set(smallEntry, oldCount - 1);
        }
    }
    return true;
}

class SubarrayArbitrary extends NextArbitrary {
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
        this.lengthArb = new IntegerArbitrary(minLength, maxLength);
        this.biasedLengthArb =
            minLength !== maxLength
                ? new IntegerArbitrary(minLength, minLength + Math.floor(Math.log(maxLength - minLength) / Math.log(2)))
                : this.lengthArb;
    }
    generate(mrng, biasFactor) {
        const lengthArb = biasFactor !== undefined && mrng.nextInt(1, biasFactor) === 1 ? this.biasedLengthArb : this.lengthArb;
        const size = lengthArb.generate(mrng, undefined);
        const sizeValue = size.value;
        const remainingElements = this.originalArray.map((_v, idx) => idx);
        const ids = [];
        for (let index = 0; index !== sizeValue; ++index) {
            const selectedIdIndex = mrng.nextInt(0, remainingElements.length - 1);
            ids.push(remainingElements[selectedIdIndex]);
            remainingElements.splice(selectedIdIndex, 1);
        }
        if (this.isOrdered) {
            ids.sort((a, b) => a - b);
        }
        return new NextValue(ids.map((i) => this.originalArray[i]), size.context);
    }
    canShrinkWithoutContext(value) {
        if (!Array.isArray(value)) {
            return false;
        }
        if (!this.lengthArb.canShrinkWithoutContext(value.length)) {
            return false;
        }
        return isSubarrayOf(this.originalArray, value);
    }
    shrink(value, context) {
        if (value.length === 0) {
            return Stream.nil();
        }
        return this.lengthArb
            .shrink(value.length, context)
            .map((newSize) => {
            return new NextValue(value.slice(value.length - newSize.value), newSize.context);
        })
            .join(value.length > this.minLength
            ? makeLazy(() => this.shrink(value.slice(1), undefined)
                .filter((newValue) => this.minLength <= newValue.value.length + 1)
                .map((newValue) => new NextValue([value[0]].concat(newValue.value), undefined)))
            : Stream.nil());
    }
}

function subarray(originalArray, ...args) {
    if (typeof args[0] === 'number' && typeof args[1] === 'number') {
        return convertFromNext(new SubarrayArbitrary(originalArray, true, args[0], args[1]));
    }
    const ct = args[0];
    const minLength = ct !== undefined && ct.minLength !== undefined ? ct.minLength : 0;
    const maxLength = ct !== undefined && ct.maxLength !== undefined ? ct.maxLength : originalArray.length;
    return convertFromNext(new SubarrayArbitrary(originalArray, true, minLength, maxLength));
}

function shuffledSubarray(originalArray, ...args) {
    if (typeof args[0] === 'number' && typeof args[1] === 'number') {
        return convertFromNext(new SubarrayArbitrary(originalArray, false, args[0], args[1]));
    }
    const ct = args[0];
    const minLength = ct !== undefined && ct.minLength !== undefined ? ct.minLength : 0;
    const maxLength = ct !== undefined && ct.maxLength !== undefined ? ct.maxLength : originalArray.length;
    return convertFromNext(new SubarrayArbitrary(originalArray, false, minLength, maxLength));
}

function numberToPaddedEightMapper(n) {
    return n.toString(16).padStart(8, '0');
}
function numberToPaddedEightUnmapper(value) {
    if (typeof value !== 'string') {
        throw new Error('Unsupported type');
    }
    if (value.length !== 8) {
        throw new Error('Unsupported value: invalid length');
    }
    const n = parseInt(value, 16);
    if (value !== numberToPaddedEightMapper(n)) {
        throw new Error('Unsupported value: invalid content');
    }
    return n;
}

function buildPaddedNumberArbitrary(min, max) {
    return convertFromNext(convertToNext(integer({ min, max })).map(numberToPaddedEightMapper, numberToPaddedEightUnmapper));
}

function paddedEightsToUuidMapper(t) {
    return `${t[0]}-${t[1].substring(4)}-${t[1].substring(0, 4)}-${t[2].substring(0, 4)}-${t[2].substring(4)}${t[3]}`;
}
const UuidRegex = /^([0-9a-f]{8})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{12})$/;
function paddedEightsToUuidUnmapper(value) {
    if (typeof value !== 'string') {
        throw new Error('Unsupported type');
    }
    const m = UuidRegex.exec(value);
    if (m === null) {
        throw new Error('Unsupported type');
    }
    return [m[1], m[3] + m[2], m[4] + m[5].substring(0, 4), m[5].substring(4)];
}

function uuid() {
    const padded = buildPaddedNumberArbitrary(0, 0xffffffff);
    const secondPadded = buildPaddedNumberArbitrary(0x10000000, 0x5fffffff);
    const thirdPadded = buildPaddedNumberArbitrary(0x80000000, 0xbfffffff);
    return convertFromNext(convertToNext(tuple(padded, secondPadded, thirdPadded, padded)).map(paddedEightsToUuidMapper, paddedEightsToUuidUnmapper));
}

function uuidV(versionNumber) {
    const padded = buildPaddedNumberArbitrary(0, 0xffffffff);
    const offsetSecond = versionNumber * 0x10000000;
    const secondPadded = buildPaddedNumberArbitrary(offsetSecond, offsetSecond + 0x0fffffff);
    const thirdPadded = buildPaddedNumberArbitrary(0x80000000, 0xbfffffff);
    return convertFromNext(convertToNext(tuple(padded, secondPadded, thirdPadded, padded)).map(paddedEightsToUuidMapper, paddedEightsToUuidUnmapper));
}

function hostUserInfo() {
    const others = ['-', '.', '_', '~', '!', '$', '&', "'", '(', ')', '*', '+', ',', ';', '=', ':'];
    return stringOf(buildAlphaNumericPercentArbitrary(others));
}
function userHostPortMapper([u, h, p]) {
    return (u === null ? '' : `${u}@`) + h + (p === null ? '' : `:${p}`);
}
function userHostPortUnmapper(value) {
    if (typeof value !== 'string') {
        throw new Error('Unsupported');
    }
    const atPosition = value.indexOf('@');
    const user = atPosition !== -1 ? value.substring(0, atPosition) : null;
    const portRegex = /:(\d+)$/;
    const m = portRegex.exec(value);
    const port = m !== null ? Number(m[1]) : null;
    const host = m !== null ? value.substring(atPosition + 1, value.length - m[1].length - 1) : value.substring(atPosition + 1);
    return [user, host, port];
}
function bracketedMapper(s) {
    return `[${s}]`;
}
function bracketedUnmapper(value) {
    if (typeof value !== 'string' || value[0] !== '[' || value[value.length - 1] !== ']') {
        throw new Error('Unsupported');
    }
    return value.substring(1, value.length - 1);
}
function webAuthority(constraints) {
    const c = constraints || {};
    const hostnameArbs = [domain()]
        .concat(c.withIPv4 === true ? [ipV4()] : [])
        .concat(c.withIPv6 === true ? [convertFromNext(convertToNext(ipV6()).map(bracketedMapper, bracketedUnmapper))] : [])
        .concat(c.withIPv4Extended === true ? [ipV4Extended()] : []);
    return convertFromNext(convertToNext(tuple(c.withUserInfo === true ? option(hostUserInfo()) : constant(null), oneof(...hostnameArbs), c.withPort === true ? option(nat(65535)) : constant(null))).map(userHostPortMapper, userHostPortUnmapper));
}

function buildUriQueryOrFragmentArbitrary() {
    const others = ['-', '.', '_', '~', '!', '$', '&', "'", '(', ')', '*', '+', ',', ';', '=', ':', '@', '/', '?'];
    return stringOf(buildAlphaNumericPercentArbitrary(others));
}

function webFragments() {
    return buildUriQueryOrFragmentArbitrary();
}

function webQueryParameters() {
    return buildUriQueryOrFragmentArbitrary();
}

function webSegment() {
    const others = ['-', '.', '_', '~', '!', '$', '&', "'", '(', ')', '*', '+', ',', ';', '=', ':', '@'];
    return stringOf(buildAlphaNumericPercentArbitrary(others));
}

function partsToUrlMapper(data) {
    const [scheme, authority, path] = data;
    const query = data[3] === null ? '' : `?${data[3]}`;
    const fragments = data[4] === null ? '' : `#${data[4]}`;
    return `${scheme}://${authority}${path}${query}${fragments}`;
}
const UrlSplitRegex = /^([[A-Za-z][A-Za-z0-9+.-]*):\/\/([^/?#]*)([^?#]*)(\?[A-Za-z0-9\-._~!$&'()*+,;=:@/?%]*)?(#[A-Za-z0-9\-._~!$&'()*+,;=:@/?%]*)?$/;
function partsToUrlUnmapper(value) {
    if (typeof value !== 'string') {
        throw new Error('Incompatible value received: type');
    }
    const m = UrlSplitRegex.exec(value);
    if (m === null) {
        throw new Error('Incompatible value received');
    }
    const scheme = m[1];
    const authority = m[2];
    const path = m[3];
    const query = m[4];
    const fragments = m[5];
    return [
        scheme,
        authority,
        path,
        query !== undefined ? query.substring(1) : null,
        fragments !== undefined ? fragments.substring(1) : null,
    ];
}

function segmentsToPathMapper(segments) {
    return segments.map((v) => `/${v}`).join('');
}
function segmentsToPathUnmapper(value) {
    if (typeof value !== 'string') {
        throw new Error('Incompatible value received: type');
    }
    if (value.length !== 0 && value[0] !== '/') {
        throw new Error('Incompatible value received: start');
    }
    return value.split('/').splice(1);
}

function webUrl(constraints) {
    const c = constraints || {};
    const validSchemes = c.validSchemes || ['http', 'https'];
    const schemeArb = constantFrom(...validSchemes);
    const authorityArb = webAuthority(c.authoritySettings);
    const pathArb = convertFromNext(convertToNext(array(webSegment())).map(segmentsToPathMapper, segmentsToPathUnmapper));
    return convertFromNext(convertToNext(tuple(schemeArb, authorityArb, pathArb, c.withQueryParameters === true ? option(webQueryParameters()) : constant(null), c.withFragments === true ? option(webFragments()) : constant(null))).map(partsToUrlMapper, partsToUrlUnmapper));
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
        if (hasToStringMethod(cmd)) {
            const method = cmd[toStringMethod];
            this[toStringMethod] = function toStringMethod() {
                return method.call(cmd);
            };
        }
        if (hasAsyncToStringMethod(cmd)) {
            const method = cmd[asyncToStringMethod];
            this[asyncToStringMethod] = function asyncToStringMethod() {
                return method.call(cmd);
            };
        }
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

class CommandsArbitrary extends NextArbitrary {
    constructor(commandArbs, maxCommands, sourceReplayPath, disableReplayLog) {
        super();
        this.sourceReplayPath = sourceReplayPath;
        this.disableReplayLog = disableReplayLog;
        this.oneCommandArb = convertToNext(oneof(...commandArbs).map((c) => new CommandWrapper(c)));
        this.lengthArb = new IntegerArbitrary(0, maxCommands);
        this.replayPath = [];
        this.replayPathPosition = 0;
    }
    metadataForReplay() {
        return this.disableReplayLog ? '' : `replayPath=${JSON.stringify(ReplayPath.stringify(this.replayPath))}`;
    }
    buildNextValueFor(items, shrunkOnce) {
        const commands = items.map((item) => item.value_);
        const context = { shrunkOnce, items };
        return new NextValue(new CommandsIterable(commands, () => this.metadataForReplay()), context);
    }
    generate(mrng) {
        const size = this.lengthArb.generate(mrng, undefined);
        const sizeValue = size.value;
        const items = Array(sizeValue);
        for (let idx = 0; idx !== sizeValue; ++idx) {
            const item = this.oneCommandArb.generate(mrng, undefined);
            items[idx] = item;
        }
        this.replayPathPosition = 0;
        return this.buildNextValueFor(items, false);
    }
    canShrinkWithoutContext(value) {
        return false;
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
    shrink(_value, context) {
        if (context === undefined) {
            return Stream.nil();
        }
        const safeContext = context;
        const shrunkOnce = safeContext.shrunkOnce;
        const itemsRaw = safeContext.items;
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
                const fixedStart = items.slice(0, numToKeep);
                return this.lengthArb
                    .shrink(items.length - 1 - numToKeep, undefined)
                    .map((l) => fixedStart.concat(items.slice(items.length - (l.value + 1))));
            }));
        }
        for (let itemAt = 0; itemAt !== items.length; ++itemAt) {
            nextShrinks.push(makeLazy(() => this.oneCommandArb
                .shrink(items[itemAt].value_, items[itemAt].context)
                .map((v) => items.slice(0, itemAt).concat([v], items.slice(itemAt + 1)))));
        }
        return rootShrink.join(...nextShrinks).map((shrinkables) => {
            return this.buildNextValueFor(shrinkables.map((c) => new NextValue(c.value_.clone(), c.context)), true);
        });
    }
}

function commands(commandArbs, constraints) {
    const config = constraints == null ? {} : typeof constraints === 'number' ? { maxCommands: constraints } : constraints;
    return convertFromNext(new CommandsArbitrary(commandArbs, config.maxCommands != null ? config.maxCommands : 10, config.replayPath != null ? config.replayPath : null, !!config.disableReplayLog));
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

function buildNextTaskIndex(ordering) {
    let numTasks = 0;
    return {
        clone: () => buildNextTaskIndex(ordering),
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
}
function buildSchedulerFor(act, ordering) {
    return new SchedulerImplem(act, buildNextTaskIndex(ordering));
}

function buildNextTaskIndex$1(mrng) {
    const clonedMrng = mrng.clone();
    return {
        clone: () => buildNextTaskIndex$1(clonedMrng),
        nextTaskIndex: (scheduledTasks) => {
            return mrng.nextInt(0, scheduledTasks.length - 1);
        },
    };
}
class SchedulerArbitrary extends NextArbitrary {
    constructor(act) {
        super();
        this.act = act;
    }
    generate(mrng, _biasFactor) {
        return new NextValue(new SchedulerImplem(this.act, buildNextTaskIndex$1(mrng.clone())), undefined);
    }
    canShrinkWithoutContext(value) {
        return false;
    }
    shrink(_value, _context) {
        return Stream.nil();
    }
}

function scheduler(constraints) {
    const { act = (f) => f() } = constraints || {};
    return convertFromNext(new SchedulerArbitrary(act));
}
function schedulerFor(customOrderingOrConstraints, constraintsOrUndefined) {
    const { act = (f) => f() } = Array.isArray(customOrderingOrConstraints)
        ? constraintsOrUndefined || {}
        : customOrderingOrConstraints || {};
    if (Array.isArray(customOrderingOrConstraints)) {
        return buildSchedulerFor(act, customOrderingOrConstraints);
    }
    return function (_strs, ...ordering) {
        return buildSchedulerFor(act, ordering);
    };
}

class ArbitraryWithShrink extends Arbitrary {
    shrinkableFor(value, shrunkOnce) {
        return new Shrinkable(value, () => this.shrink(value, shrunkOnce === true).map((v) => this.shrinkableFor(v, true)));
    }
}

const __type$1 = 'module';
const __version$1 = '2.18.1';
const __commitHash$1 = 'dd2135fb3b5d19c66e6370ad82f131a5f7739094';

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
    NextArbitrary: NextArbitrary,
    ArbitraryWithShrink: ArbitraryWithShrink,
    ArbitraryWithContextualShrink: ArbitraryWithContextualShrink,
    Shrinkable: Shrinkable,
    NextValue: NextValue,
    cloneMethod: cloneMethod,
    cloneIfNeeded: cloneIfNeeded,
    hasCloneMethod: hasCloneMethod,
    convertFromNext: convertFromNext,
    convertFromNextWithShrunkOnce: convertFromNextWithShrunkOnce,
    convertToNext: convertToNext,
    toStringMethod: toStringMethod,
    hasToStringMethod: hasToStringMethod,
    asyncToStringMethod: asyncToStringMethod,
    hasAsyncToStringMethod: hasAsyncToStringMethod,
    stringify: stringify,
    asyncStringify: asyncStringify,
    defaultReportMessage: defaultReportMessage,
    asyncDefaultReportMessage: asyncDefaultReportMessage,
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
