/*
 * Contains Bit-wise helpers
 */

export const has = (mask: number, value: number) => {
    return (value & mask) !== 0;
};
