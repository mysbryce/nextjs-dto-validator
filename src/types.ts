export interface ValidationError {
    field: string
    message: string
    value?: any
}

export interface ValidationResult<T> {
    success: boolean
    data?: T
    errors?: ValidationError[]
}

export type ValidatorFunction<T = any> = (value: any) => T | ValidationError

export interface FieldValidator {
    required?: boolean
    type?: 'string' | 'number' | 'boolean' | 'array' | 'object'
    minLength?: number
    maxLength?: number
    min?: number
    max?: number
    pattern?: RegExp
    custom?: ValidatorFunction
    transform?: (value: any) => any
    allowNull?: boolean
}

export interface DTOSchema {
    [key: string]: FieldValidator
}