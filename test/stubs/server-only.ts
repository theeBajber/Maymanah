/**
 * Stands in for the `server-only` package inside the test runner.
 *
 * That package throws on import unless the bundler has marked the module as
 * server-side, which never happens under Vitest. Without this alias every test
 * that reaches `lib/db.ts` would fail on the guard rather than on its subject.
 */
export {};
