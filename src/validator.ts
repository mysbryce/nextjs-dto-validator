import { ValidationError, ValidationResult, FieldValidator, DTOSchema } from './types'

export class DTOValidator {
    private validateField(
        fieldName: string,
        value: any,
        validator: FieldValidator
    ): ValidationError | any {
        // Check required
        if (validator.required && (value === undefined || value === null)) {
            return {
                field: fieldName,
                message: `Field '${fieldName}' is required`,
                value
            }
        }

        // Allow null if specified
        if (value === null && validator.allowNull) {
            return null
        }

        // Skip validation if value is undefined/null and not required
        if (value === undefined || value === null) {
            return undefined
        }

        // Transform value if transformer provided
        if (validator.transform) {
            try {
                value = validator.transform(value)
            } catch (error) {
                return {
                    field: fieldName,
                    message: `Failed to transform field '${fieldName}': ${error}`,
                    value
                }
            }
        }

        // Type validation
        if (validator.type) {
            const typeError = this.validateType(fieldName, value, validator.type)
            if (typeError) return typeError
        }

        // String validations
        if (typeof value === 'string') {
            if (validator.minLength && value.length < validator.minLength) {
                return {
                    field: fieldName,
                    message: `Field '${fieldName}' must be at least ${validator.minLength} characters long`,
                    value
                }
            }

            if (validator.maxLength && value.length > validator.maxLength) {
                return {
                    field: fieldName,
                    message: `Field '${fieldName}' must be no more than ${validator.maxLength} characters long`,
                    value
                }
            }

            if (validator.pattern && !validator.pattern.test(value)) {
                return {
                    field: fieldName,
                    message: `Field '${fieldName}' does not match required pattern`,
                    value
                }
            }
        }

        // Number validations
        if (typeof value === 'number') {
            if (validator.min !== undefined && value < validator.min) {
                return {
                    field: fieldName,
                    message: `Field '${fieldName}' must be at least ${validator.min}`,
                    value
                }
            }

            if (validator.max !== undefined && value > validator.max) {
                return {
                    field: fieldName,
                    message: `Field '${fieldName}' must be no more than ${validator.max}`,
                    value
                }
            }
        }

        // Custom validation
        if (validator.custom) {
            const customResult = validator.custom(value)
            if (customResult && typeof customResult === 'object' && 'field' in customResult) {
                return customResult as ValidationError
            }
            return customResult
        }

        return value
    }

    private validateType(fieldName: string, value: any, expectedType: string): ValidationError | null {
        const actualType = Array.isArray(value) ? 'array' : typeof value

        if (expectedType === 'number' && typeof value === 'string') {
            const num = Number(value)
            if (!isNaN(num)) {
                return null // Will be converted
            }
        }

        if (actualType !== expectedType) {
            return {
                field: fieldName,
                message: `Field '${fieldName}' must be of type ${expectedType}, got ${actualType}`,
                value
            }
        }

        return null
    }

    validate<T = any>(data: any, schema: DTOSchema): ValidationResult<T> {
        const errors: ValidationError[] = []
        const result: any = {}

        // Validate each field in schema
        for (const [fieldName, validator] of Object.entries(schema)) {
            const fieldResult = this.validateField(fieldName, data[fieldName], validator)

            if (fieldResult && typeof fieldResult === 'object' && 'field' in fieldResult) {
                errors.push(fieldResult as ValidationError)
            } else {
                // Convert string to number if needed
                if (validator.type === 'number' && typeof fieldResult === 'string') {
                    const num = Number(fieldResult)
                    result[fieldName] = isNaN(num) ? fieldResult : num
                } else {
                    result[fieldName] = fieldResult
                }
            }
        }

        // Check for extra fields not in schema
        for (const key of Object.keys(data || {})) {
            if (!(key in schema)) {
                errors.push({
                    field: key,
                    message: `Unknown field '${key}'`,
                    value: data[key]
                })
            }
        }

        return {
            success: errors.length === 0,
            data: errors.length === 0 ? result as T : undefined,
            errors: errors.length > 0 ? errors : undefined
        }
    }
}