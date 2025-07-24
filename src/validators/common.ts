import { ValidationError } from '../types'

export const validators = {
    email: (value: string): string | ValidationError => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) {
            return {
                field: 'email',
                message: 'Invalid email format',
                value
            }
        }
        return value
    },

    phone: (value: string): string | ValidationError => {
        const phoneRegex = /^[0-9+\-\s()]+$/
        if (!phoneRegex.test(value)) {
            return {
                field: 'phone',
                message: 'Invalid phone number format',
                value
            }
        }
        return value
    },

    url: (value: string): string | ValidationError => {
        try {
            new URL(value)
            return value
        } catch {
            return {
                field: 'url',
                message: 'Invalid URL format',
                value
            }
        }
    },

    oneOf: <T>(allowedValues: T[]) => (value: T): T | ValidationError => {
        if (!allowedValues.includes(value)) {
            return {
                field: 'oneOf',
                message: `Value must be one of: ${allowedValues.join(', ')}`,
                value
            }
        }
        return value
    },

    minItems: (min: number) => (value: any[]): any[] | ValidationError => {
        if (!Array.isArray(value) || value.length < min) {
            return {
                field: 'minItems',
                message: `Array must have at least ${min} items`,
                value
            }
        }
        return value
    },

    maxItems: (max: number) => (value: any[]): any[] | ValidationError => {
        if (!Array.isArray(value) || value.length > max) {
            return {
                field: 'maxItems',
                message: `Array must have no more than ${max} items`,
                value
            }
        }
        return value
    }
}