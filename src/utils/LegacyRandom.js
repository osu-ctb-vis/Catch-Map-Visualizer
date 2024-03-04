// Translated by ChatGPT
// https://github.com/ppy/osu/blob/715236765a2c532972e8b7f106c31fe254a6c6af/osu.Game/Utils/LegacyRandom.cs
// TODO: verify this code

const CSharpToInt = (x) => {
    return x < 0 ? Math.ceil(x) : Math.floor(x);
}
export class LegacyRandom {
    static INT_TO_REAL = 1.0 / 2147483648;
    static Y = 842502087;
    static Z = 3579807591;
    static W = 273326509;

    constructor(seed = LegacyRandom.tickCount()) {
        this.x = seed >>> 0;
        this.y = LegacyRandom.Y;
        this.z = LegacyRandom.Z;
        this.w = LegacyRandom.W;
        this.bitBuffer = 0;
        this.bitIndex = 32;
    }

    static tickCount() {
        return Date.now();
    }

    nextUInt() {
        let t = this.x ^ (this.x << 11);
        this.x = this.y;
        this.y = this.z;
        this.z = this.w;
        this.w = this.w ^ (this.w >>> 19) ^ t ^ (t >>> 8);
        return this.w >>> 0; // ensure we have an unsigned integer
    }

    nextInt() {
        return this.nextUInt() & 0x7FFFFFFF;
    }

    next(max) {
        if (typeof max === 'undefined') {
            return this.nextInt();
        } else {
            return CSharpToInt(this.nextDouble() * max);
        }
    }

    nextRange(min, max) {
        return CSharpToInt(min + this.nextDouble() * (max - min));
    }

    nextDouble() {
        return LegacyRandom.INT_TO_REAL * this.nextInt();
    }

    nextBool() {
        if (this.bitIndex === 32) {
            this.bitBuffer = this.nextUInt();
            this.bitIndex = 1;
            return (this.bitBuffer & 1) === 1;
        }

        this.bitIndex++;
        return ((this.bitBuffer >>>= 1) & 1) === 1;
    }
}