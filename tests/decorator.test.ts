import { DTO, withValidation, DTOSchema, createDTO, DTOClass, validationMiddleware } from '../src'

describe('Decorators and Helpers', () => {
    describe('DTO decorator', () => {
        it('should create class with validation using decorator', () => {
            const userSchema: DTOSchema = {
                name: { required: true, type: 'string' },
                email: { required: true, type: 'string' }
            }

            interface User {
                name: string
                email: string
            }

            @DTO<User>(userSchema)
            class UserDTO {
                name!: string
                email!: string
            }

            // Cast เพื่อให้ TypeScript รู้จัก validate method
            const UserDTOClass = UserDTO as typeof UserDTO & DTOClass<User>

            const result = UserDTOClass.validate({ name: 'John', email: 'john@test.com' })
            expect(result.success).toBe(true)
            expect(result.data).toEqual({ name: 'John', email: 'john@test.com' })

            const invalidResult = UserDTOClass.validate({ name: 'John' })
            expect(invalidResult.success).toBe(false)
            expect(invalidResult.errors).toBeDefined()
        })

        it('should create DTO using createDTO helper', () => {
            const userSchema: DTOSchema = {
                name: { required: true, type: 'string' },
                email: { required: true, type: 'string' }
            }

            interface User {
                name: string
                email: string
            }

            const UserDTO = createDTO<User>(userSchema, 'UserDTO')

            const result = UserDTO.validate({ name: 'John', email: 'john@test.com' })
            expect(result.success).toBe(true)
            expect(result.data).toEqual({ name: 'John', email: 'john@test.com' })

            const invalidResult = UserDTO.validate({ name: 'John' })
            expect(invalidResult.success).toBe(false)
            expect(invalidResult.errors).toBeDefined()
            expect(invalidResult.errors![0].field).toBe('email')
        })
    })

    describe('withValidation helper', () => {
        it('should create Next.js API handler with validation', async () => {
            const schema: DTOSchema = {
                name: { required: true, type: 'string' }
            }

            const mockRes = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            }

            const handler = withValidation(schema, async (req, res, validatedData) => {
                res.json({ user: validatedData })
            })

            // Test invalid data
            const invalidReq = { body: {} }
            await handler(invalidReq, mockRes)

            expect(mockRes.status).toHaveBeenCalledWith(400)
            expect(mockRes.json).toHaveBeenCalledWith({
                error: 'Validation failed',
                details: expect.any(Array)
            })

            // Reset mocks
            mockRes.status.mockClear()
            mockRes.json.mockClear()

            // Test valid data
            const validReq = { body: { name: 'John' } }
            await handler(validReq, mockRes)

            expect(mockRes.json).toHaveBeenCalledWith({
                user: { name: 'John' }
            })
            expect(mockRes.status).not.toHaveBeenCalled()
        })

        it('should handle async handler errors', async () => {
            const schema: DTOSchema = {
                name: { required: true, type: 'string' }
            }

            const mockRes = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            }

            const handler = withValidation(schema, async (req, res, validatedData) => {
                throw new Error('Handler error')
            })

            const validReq = { body: { name: 'John' } }

            // Should throw the error from handler
            await expect(handler(validReq, mockRes)).rejects.toThrow('Handler error')
        })
    })

    describe('validationMiddleware', () => {
        it('should work as Express middleware', () => {
            const schema: DTOSchema = {
                name: { required: true, type: 'string' }
            }

            const middleware = validationMiddleware(schema)

            const mockRes = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            }

            const mockNext = jest.fn()

            // Test valid data
            const validReq = { body: { name: 'John' }, validatedData: undefined }
            middleware(validReq, mockRes, mockNext)

            expect(validReq.validatedData).toEqual({ name: 'John' })
            expect(mockNext).toHaveBeenCalled()
            expect(mockRes.status).not.toHaveBeenCalled()

            // Reset
            mockNext.mockClear()
            mockRes.status.mockClear()

            // Test invalid data
            const invalidReq = { body: {}, validatedData: undefined }
            middleware(invalidReq, mockRes, mockNext)

            expect(mockRes.status).toHaveBeenCalledWith(400)
            expect(mockNext).not.toHaveBeenCalled()
        })
    })
})