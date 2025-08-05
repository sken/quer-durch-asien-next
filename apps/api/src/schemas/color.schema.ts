export const colorSchema = {
    type: 'object',
    properties: {
        id: { type: 'string' }, // BigInt als String!
        hue: { type: 'integer' },
        saturation: { type: 'integer' },
        value: { type: 'integer' },
        red: { type: 'integer' },
        green: { type: 'integer' },
        blue: { type: 'integer' },
        hex: { type: 'string' },
        websafe: { type: 'string' },
    },
    required: ['id', 'hue', 'saturation', 'value', 'red', 'green', 'blue', 'hex', 'websafe']
};