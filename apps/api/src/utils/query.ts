// Query/route params arrive as strings. Parse them to bounded integers so
// arithmetic (e.g. `h + 10`) never degrades into string concatenation.
export function toInt(value: unknown, fallback: number, min: number, max: number): number {
    const n = Number(value);
    if (value === undefined || value === null || value === '' || !Number.isFinite(n)) {
        return fallback;
    }
    return Math.min(max, Math.max(min, Math.trunc(n)));
}

// Like toInt, but returns undefined when the param is absent or not numeric.
export function toOptionalInt(value: unknown, min: number, max: number): number | undefined {
    if (value === undefined || value === null || value === '') {
        return undefined;
    }
    const n = Number(value);
    if (!Number.isFinite(n)) {
        return undefined;
    }
    return Math.min(max, Math.max(min, Math.trunc(n)));
}

export function toBool(value: unknown): boolean {
    return value === true || value === 'true' || value === '1';
}

export function isNumericId(value: unknown): value is string {
    return typeof value === 'string' && /^\d+$/.test(value);
}
