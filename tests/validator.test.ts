import { DTOValidator, DTOSchema, validators } from '../src'

describe('DTOValidator', () => {
    let validator: DTOValidator

    beforeEach(() => {
        validator = new DTOValidator()
    })

    describe('Required field validation', () => {
        it('should fail when required field is missing', () => {
            const schema: DTOSchema = {
                name: { required: true, type: 'string' }
            }

            const result = validator.validate({}, schema)

            expect(result.success).toBe(false)
            expect(result.errors).toHaveLength(1)
            expect(result.errors![0].field).toBe('name')
            expect(result.errors![0].message).toContain('required')
        })

        it('should pass when required field is provided', () => {
            const schema: DTOSchema = {
                name: { required: true, type: 'string' }
            }

            const result = validator.validate({ name: 'John' }, schema)

            expect(result.success).toBe(true)
            expect(result.data).toEqual({ name: 'John' })
            expect(result.errors).toBeUndefined()
        })
    })

    describe('Type validation', () => {
        it('should validate string type', () => {
            const schema: DTOSchema = {
                name: { required: true, type: 'string' }
            }

            const result = validator.validate({ name: 123 }, schema)

            expect(result.success).toBe(false)
            expect(result.errors![0].message).toContain('must be of type string')
        })

        it('should validate number type', () => {
            const schema: DTOSchema = {
                age: { required: true, type: 'number' }
            }

            const result = validator.validate({ age: '25' }, schema)

            expect(result.success).toBe(true)
            expect(result.data!.age).toBe(25) // Should convert string to number
        })

        it('should validate array type', () => {
            const schema: DTOSchema = {
                tags: { required: true, type: 'array' }
            }

            const result = validator.validate({ tags: ['tag1', 'tag2'] }, schema)

            expect(result.success).toBe(true)
            expect(result.data!.tags).toEqual(['tag1', 'tag2'])
        })
    })

    describe('String validation', () => {
        it('should validate minimum length', () => {
            const schema: DTOSchema = {
                name: { required: true, type: 'string', minLength: 3 }
            }

            const result = validator.validate({ name: 'Jo' }, schema)

            expect(result.success).toBe(false)
            expect(result.errors![0].message).toContain('at least 3 characters')
        })

        it('should validate maximum length', () => {
            const schema: DTOSchema = {
                name: { required: true, type: 'string', maxLength: 5 }
            }

            const result = validator.validate({ name: 'JohnDoe' }, schema)

            expect(result.success).toBe(false)
            expect(result.errors![0].message).toContain('no more than 5 characters')
        })

        it('should validate pattern', () => {
            const schema: DTOSchema = {
                code: { required: true, type: 'string', pattern: /^[A-Z]{3}$/ }
            }

            const result1 = validator.validate({ code: 'ABC' }, schema)
            expect(result1.success).toBe(true)

            const result2 = validator.validate({ code: 'abc' }, schema)
            expect(result2.success).toBe(false)
        })
    })

    describe('Number validation', () => {
        it('should validate minimum value', () => {
            const schema: DTOSchema = {
                age: { required: true, type: 'number', min: 18 }
            }

            const result = validator.validate({ age: 16 }, schema)

            expect(result.success).toBe(false)
            expect(result.errors![0].message).toContain('at least 18')
        })

        it('should validate maximum value', () => {
            const schema: DTOSchema = {
                age: { required: true, type: 'number', max: 65 }
            }

            const result = validator.validate({ age: 70 }, schema)

            expect(result.success).toBe(false)
            expect(result.errors![0].message).toContain('no more than 65')
        })
    })

    describe('Transform function', () => {
        it('should transform value before validation', () => {
            const schema: DTOSchema = {
                name: {
                    required: true,
                    type: 'string',
                    transform: (value: string) => value.trim().toLowerCase()
                }
            }

            const result = validator.validate({ name: '  JOHN  ' }, schema)

            expect(result.success).toBe(true)
            expect(result.data!.name).toBe('john')
        })

        it('should handle transform errors', () => {
            const schema: DTOSchema = {
                data: {
                    required: true,
                    transform: () => { throw new Error('Transform failed') }
                }
            }

            const result = validator.validate({ data: 'test' }, schema)

            expect(result.success).toBe(false)
            expect(result.errors![0].message).toContain('Failed to transform')
        })
    })

    describe('Custom validators', () => {
        it('should use email validator', () => {
            const schema: DTOSchema = {
                email: { required: true, type: 'string', custom: validators.email }
            }

            const result1 = validator.validate({ email: 'test@example.com' }, schema)
            expect(result1.success).toBe(true)

            const result2 = validator.validate({ email: 'invalid-email' }, schema)
            expect(result2.success).toBe(false)
            expect(result2.errors![0].message).toContain('Invalid email format')
        })

        it('should use oneOf validator', () => {
            const schema: DTOSchema = {
                status: {
                    required: true,
                    type: 'string',
                    custom: validators.oneOf(['active', 'inactive', 'pending'])
                }
            }

            const result1 = validator.validate({ status: 'active' }, schema)
            expect(result1.success).toBe(true)

            const result2 = validator.validate({ status: 'unknown' }, schema)
            expect(result2.success).toBe(false)
            expect(result2.errors![0].message).toContain('must be one of')
        })
    })

    describe('Complex validation', () => {
        it('should validate complete user object', () => {
            const schema: DTOSchema = {
                name: {
                    required: true,
                    type: 'string',
                    minLength: 2,
                    maxLength: 50,
                    transform: (value: string) => value.trim()
                },
                email: {
                    required: true,
                    type: 'string',
                    custom: validators.email
                },
                age: {
                    required: true,
                    type: 'number',
                    min: 0,
                    max: 120
                },
                phone: {
                    required: false,
                    type: 'string',
                    custom: validators.phone
                },
                tags: {
                    required: false,
                    type: 'array'
                }
            }

            const validData = {
                name: '  John Doe  ',
                email: 'john@example.com',
                age: '25',
                phone: '+1-234-567-8900'
            }

            const result = validator.validate(validData, schema)

            expect(result.success).toBe(true)
            expect(result.data!.name).toBe('John Doe')
            expect(result.data!.age).toBe(25)
        })

        it('should reject unknown fields', () => {
            const schema: DTOSchema = {
                name: { required: true, type: 'string' }
            }

            const result = validator.validate({
                name: 'John',
                unknownField: 'value'
            }, schema)

            expect(result.success).toBe(false)
            expect(result.errors!.some(e => e.field === 'unknownField')).toBe(true)
        })
    })

    describe('Allow null values', () => {
        it('should allow null when allowNull is true', () => {
            const schema: DTOSchema = {
                description: { required: false, type: 'string', allowNull: true }
            }

            const result = validator.validate({ description: null }, schema)

            expect(result.success).toBe(true)
            expect(result.data!.description).toBe(null)
        })

        it('should reject null when allowNull is false/undefined', () => {
            const schema: DTOSchema = {
                name: { required: true, type: 'string' }
            }

            const result = validator.validate({ name: null }, schema)

            expect(result.success).toBe(false)
        })
    })
})