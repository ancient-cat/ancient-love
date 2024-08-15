export function assertion(
    condition: boolean,
    message?: string
): asserts condition {
    assert(condition, message);
}
