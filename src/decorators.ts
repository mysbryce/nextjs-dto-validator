import { DTOValidator } from './validator'
import { DTOSchema, ValidationResult } from './types'

// Interface สำหรับ class ที่ใช้ DTO decorator
export interface DTOClass<T = any> {
    new(...args: any[]): T
    schema: DTOSchema
    validator: DTOValidator
    validate(data: any): ValidationResult<T>
}

export function DTO<T extends object = any>(schema: DTOSchema) {
    return function <TConstructor extends new (...args: any[]) => T>(
        constructor: TConstructor
    ): TConstructor & DTOClass<T> {
        const ExtendedClass = class extends constructor {
            static schema = schema
            static validator = new DTOValidator()

            static validate(data: any): ValidationResult<T> {
                return this.validator.validate(data, this.schema)
            }
        }

        return ExtendedClass as TConstructor & DTOClass<T>
    }
}

// Helper function สำหรับสร้าง DTO class โดยตรง
export function createDTO<T>(schema: DTOSchema, name?: string): DTOClass<T> {
    class BaseDTO {
        static schema = schema
        static validator = new DTOValidator()

        static validate(data: any): ValidationResult<T> {
            return this.validator.validate(data, this.schema)
        }
    }

    if (name) {
        Object.defineProperty(BaseDTO, 'name', { value: name })
    }

    return BaseDTO as DTOClass<T>
}

// Next.js API helper
export function withValidation<T>(
    schema: DTOSchema,
    handler: (req: any, res: any, validatedData: T) => Promise<any> | any
) {
    return async (req: any, res: any) => {
        const validator = new DTOValidator()
        const result = validator.validate<T>(req.body, schema)

        if (!result.success) {
            return res.status(400).json({
                error: 'Validation failed',
                details: result.errors
            })
        }

        return handler(req, res, result.data!)
    }
}

// Middleware for Express.js (bonus)
export function validationMiddleware<T>(schema: DTOSchema) {
    return (req: any, res: any, next: any) => {
        const validator = new DTOValidator()
        const result = validator.validate<T>(req.body, schema)

        if (!result.success) {
            return res.status(400).json({
                error: 'Validation failed',
                details: result.errors
            })
        }

        req.validatedData = result.data
        next()
    }
}