export * from './types'
export * from './validator'
export * from './decorators'
export * from './validators/common'
import './express'

// Import validators และ DTOSchema สำหรับใช้ใน file นี้
import { validators } from './validators/common'
import { DTOSchema } from './types'
import { createDTO } from './decorators'

// Default export
export { DTOValidator as default } from './validator'

// Common schemas for quick use
export const commonSchemas = {
    email: {
        required: true,
        type: 'string' as const,
        custom: validators.email
    },
    password: {
        required: true,
        type: 'string' as const,
        minLength: 8,
        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/
    },
    phone: {
        required: false,
        type: 'string' as const,
        custom: validators.phone
    },
    age: {
        required: true,
        type: 'number' as const,
        min: 0,
        max: 120
    }
}

// Type helpers for better DX
export type InferDTO<T extends DTOSchema> = {
    [K in keyof T]: T[K]['required'] extends true
    ? T[K]['type'] extends 'string'
    ? string
    : T[K]['type'] extends 'number'
    ? number
    : T[K]['type'] extends 'boolean'
    ? boolean
    : T[K]['type'] extends 'array'
    ? any[]
    : any
    : T[K]['type'] extends 'string'
    ? string | undefined
    : T[K]['type'] extends 'number'
    ? number | undefined
    : T[K]['type'] extends 'boolean'
    ? boolean | undefined
    : T[K]['type'] extends 'array'
    ? any[] | undefined
    : any
}

// Quick create DTO utility
export const createQuickDTO = <T>(schema: DTOSchema, name?: string) => {
    return createDTO<T>(schema, name)
}