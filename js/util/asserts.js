export function assertEqual(a, b, customMessage) {
    if (a !== b) {
        throw new Error(customMessage ?? `Expected ${a} to equal ${b}`);
    }
}

export function assertEqualWithMargin(a, b, margin = 1e-6, customMessage) {
    assertTrue(Math.abs(a - b) < 1e-6, customMessage ?? `Expected ${a} to equal ${b} within margin ${margin}`);
}

export function assertTrue(a, customMessage) {
    if (!a) {
        throw new Error(customMessage ?? `Expected value to be true`);
    }
}

export function assertEqualOnLine(lines, i, expected) {
    assertEqual(lines[i], expected, `Expected ${expected} on line ${i}, got ${lines[i]} instead.`); 
}

export function assertStartsWithOnLine(lines, i, expected) {
    assertTrue(
        lines[i].startsWith(expected),
        `Expected line ${i} to start with ${expected}, got ${lines[i]} instead.`
    );
}