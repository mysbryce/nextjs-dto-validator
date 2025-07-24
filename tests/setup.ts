import 'jest'

// Extend Jest matchers if needed
declare global {
    namespace jest {
        interface Matchers<R> {
            // Add custom matchers here if needed
        }
    }
}

// Global test configuration
beforeAll(() => {
    // Setup code that runs before all tests
})

afterAll(() => {
    // Cleanup code that runs after all tests
})