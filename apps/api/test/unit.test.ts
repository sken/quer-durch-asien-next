import { test } from 'node:test';
import assert from 'node:assert/strict';

import { clampRange, hueRanges } from '../src/services/color-search';
import { isNumericId, toBool, toInt, toOptionalInt } from '../src/utils/query';
import { serializeBigInt } from '../src/routes/colors.routes';

test('toInt parses strings and clamps to bounds', () => {
    assert.equal(toInt('20', 10, 1, 100), 20);
    assert.equal(toInt(undefined, 10, 1, 100), 10);
    assert.equal(toInt('abc', 10, 1, 100), 10);
    assert.equal(toInt('0', 10, 1, 100), 1);
    assert.equal(toInt('100000', 10, 1, 100), 100);
    assert.equal(toInt('7.9', 10, 1, 100), 7);
});

test('toOptionalInt returns undefined for missing or invalid values', () => {
    assert.equal(toOptionalInt(undefined, 0, 255), undefined);
    assert.equal(toOptionalInt('', 0, 255), undefined);
    assert.equal(toOptionalInt('x', 0, 255), undefined);
    assert.equal(toOptionalInt('300', 0, 255), 255);
    assert.equal(toOptionalInt('0', 0, 255), 0);
});

test('toBool only accepts explicit true values', () => {
    assert.equal(toBool('true'), true);
    assert.equal(toBool('1'), true);
    assert.equal(toBool('false'), false);
    assert.equal(toBool(undefined), false);
});

test('isNumericId rejects anything but digits', () => {
    assert.equal(isNumericId('42'), true);
    assert.equal(isNumericId('4a'), false);
    assert.equal(isNumericId('-1'), false);
    assert.equal(isNumericId(''), false);
});

test('clampRange stays inside the channel bounds', () => {
    assert.deepEqual(clampRange(10, 30, 0, 255), [0, 40]);
    assert.deepEqual(clampRange(250, 30, 0, 255), [220, 255]);
    assert.deepEqual(clampRange(200, 30, 0, 255), [170, 230]);
});

test('hueRanges wraps around 0/360 degrees', () => {
    assert.deepEqual(hueRanges(180), [[170, 190]]);
    assert.deepEqual(hueRanges(10), [[0, 20]]);
    assert.deepEqual(hueRanges(3), [[0, 13], [353, 360]]);
    assert.deepEqual(hueRanges(355), [[345, 360], [0, 5]]);
    assert.deepEqual(hueRanges(360), [[0, 10], [350, 360]]);
});

test('serializeBigInt keeps dates and decimals as JSON-friendly strings', () => {
    const out = serializeBigInt({
        id: BigInt(5),
        when: new Date('2008-09-10T12:00:00.000Z'),
        nested: [{ n: BigInt(1) }],
        amount: { toJSON: () => '1.50' },
    });
    assert.deepEqual(out, {
        id: '5',
        when: '2008-09-10T12:00:00.000Z',
        nested: [{ n: '1' }],
        amount: '1.50',
    });
});
