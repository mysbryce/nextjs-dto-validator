# Next.js DTO Validator

[![npm version](https://badge.fury.io/js/nextjs-dto-validator.svg)](https://badge.fury.io/js/nextjs-dto-validator)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A powerful TypeScript library for validating and transforming request data in Next.js API routes using Data Transfer Objects (DTOs). Built with type safety and developer experience in mind.

## 🚀 Features

- ✨ **Full TypeScript Support** - Complete type safety with intelligent IntelliSense
- 🛡️ **Request Validation** - Comprehensive validation for API request bodies
- 🔧 **Data Transformation** - Transform and sanitize data before validation
- 📝 **Custom Validators** - Create your own validation rules with ease
- 🎯 **Next.js Integration** - Seamless integration with Next.js API routes
- 🔗 **Express.js Support** - Works with Express.js middleware
- 🧪 **Built-in Validators** - Email, phone, URL, and more out of the box

## 📦 Installation

```bash
npm install nextjs-dto-validator
# or
yarn add nextjs-dto-validator
# or
pnpm add nextjs-dto-validator
```

## 🔥 Quick Start

### Basic Usage with Next.js API Route

```typescript
// pages/api/users.ts
import { withValidation, DTOSchema } from 'nextjs-dto-validator'

const createUserSchema: DTOSchema = {
  name: { required: true, type: 'string', minLength: 2, maxLength: 50 },
  email: { required: true, type: 'string', custom: validators.email },
  age: { required: true, type: 'number', min: 18, max: 100 }
}

interface CreateUserRequest {
  name: string
  email: string
  age: number
}

export default withValidation<CreateUserRequest>(
  createUserSchema,
  async (req, res, validatedData) => {
    // validatedData is now fully typed and validated!
    console.log(validatedData.name) // TypeScript knows this is a string
    console.log(validatedData.email) // TypeScript knows this is a string
    console.log(validatedData.age) // TypeScript knows this is a number

    // Your business logic here
    const user = await createUser(validatedData)
    res.status(201).json(user)
  }
)
```

### Using DTO Classes

```typescript
import { createDTO, DTOSchema, validators } from 'nextjs-dto-validator'

// Define your schema
const userSchema: DTOSchema = {
  name: { 
    required: true, 
    type: 'string', 
    transform: (value: string) => value.trim() 
  },
  email: { required: true, type: 'string', custom: validators.email },
  age: { required: true, type: 'number', min: 0, max: 120 }
}

// Create DTO class
interface User {
  name: string
  email: string
  age: number
}

const UserDTO = createDTO<User>(userSchema, 'UserDTO')

// Use in your API
export default async function handler(req, res) {
  const result = UserDTO.validate(req.body)
  
  if (!result.success) {
    return res.status(400).json({ errors: result.errors })
  }
  
  // result.data is now typed and validated
  const user = await createUser(result.data)
  res.json(user)
}
```

## 📚 API Reference

### Built-in Validators

```typescript
import { validators } from 'nextjs-dto-validator'

const schema: DTOSchema = {
  email: { required: true, custom: validators.email },
  phone: { required: false, custom: validators.phone },
  website: { required: false, custom: validators.url },
  status: { required: true, custom: validators.oneOf(['active', 'inactive']) },
  tags: { required: false, custom: validators.minItems(1) }
}
```

### Field Validator Options

```typescript
interface FieldValidator {
  required?: boolean                    // Field is required
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object'
  minLength?: number                   // Min string length
  maxLength?: number                   // Max string length
  min?: number                         // Min number value
  max?: number                         // Max number value
  pattern?: RegExp                     // Regex pattern
  custom?: ValidatorFunction           // Custom validator
  transform?: (value: any) => any      // Transform function
  allowNull?: boolean                  // Allow null values
}
```

### Common Schemas

```typescript
import { commonSchemas } from 'nextjs-dto-validator'

const userSchema: DTOSchema = {
  email: commonSchemas.email,      // Built-in email validation
  password: commonSchemas.password, // Strong password validation
  phone: commonSchemas.phone,      // Phone number validation
  age: commonSchemas.age          // Age validation (0-120)
}
```

## 🛠️ Advanced Usage

### Custom Validators

```typescript
import { ValidationError } from 'nextjs-dto-validator'

const customPasswordValidator = (value: string): string | ValidationError => {
  if (value.length < 8) {
    return {
      field: 'password',
      message: 'Password must be at least 8 characters long',
      value
    }
  }
  
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
    return {
      field: 'password',
      message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      value
    }
  }
  
  return value
}

const schema: DTOSchema = {
  password: { required: true, type: 'string', custom: customPasswordValidator }
}
```

### Data Transformation

```typescript
const schema: DTOSchema = {
  name: {
    required: true,
    type: 'string',
    transform: (value: string) => value.trim().toLowerCase()
  },
  tags: {
    required: false,
    type: 'array',
    transform: (value: string | string[]) => 
      typeof value === 'string' ? value.split(',').map(s => s.trim()) : value
  }
}
```

### Express.js Middleware

```typescript
import express from 'express'
import { validationMiddleware, DTOSchema } from 'nextjs-dto-validator'

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const userSchema: DTOSchema = {
  name: { required: true, type: 'string' },
  email: { required: true, type: 'string' }
}

app.post('/users', validationMiddleware(userSchema), (req, res) => {
  // req.validatedData contains the validated data (any)
  console.log(req.validatedData)
  res.json({ success: true })
})
```

## 📋 Complete Example

```typescript
// pages/api/posts.ts
import { withValidation, DTOSchema, validators } from 'nextjs-dto-validator'

const createPostSchema: DTOSchema = {
  title: {
    required: true,
    type: 'string',
    minLength: 5,
    maxLength: 100,
    transform: (value: string) => value.trim()
  },
  content: {
    required: true,
    type: 'string',
    minLength: 10
  },
  tags: {
    required: false,
    type: 'array',
    custom: (value: string[]) => {
      if (!Array.isArray(value)) {
        return { field: 'tags', message: 'Tags must be an array', value }
      }
      return value.filter(tag => tag.trim().length > 0)
    }
  },
  status: {
    required: false,
    type: 'string',
    custom: validators.oneOf(['draft', 'published']),
    transform: (value: string) => value || 'draft'
  },
  publishAt: {
    required: false,
    type: 'string',
    custom: (value: string) => {
      const date = new Date(value)
      if (isNaN(date.getTime())) {
        return { field: 'publishAt', message: 'Invalid date format', value }
      }
      return date.toISOString()
    }
  }
}

interface CreatePostRequest {
  title: string
  content: string
  tags?: string[]
  status?: 'draft' | 'published'
  publishAt?: string
}

export default withValidation<CreatePostRequest>(
  createPostSchema,
  async (req, res, validatedData) => {
    try {
      const post = await createPost({
        ...validatedData,
        authorId: req.user.id, // Assume you have auth middleware
        createdAt: new Date()
      })
      
      res.status(201).json(post)
    } catch (error) {
      res.status(500).json({ error: 'Failed to create post' })
    }
  }
)
```

## 🧪 Testing

```typescript
import { DTOValidator, DTOSchema } from 'nextjs-dto-validator'

describe('User Validation', () => {
  const validator = new DTOValidator()
  const userSchema: DTOSchema = {
    name: { required: true, type: 'string' },
    email: { required: true, type: 'string' }
  }

  it('should validate valid user data', () => {
    const result = validator.validate({
      name: 'John Doe',
      email: 'john@example.com'
    }, userSchema)

    expect(result.success).toBe(true)
    expect(result.data).toEqual({
      name: 'John Doe',
      email: 'john@example.com'
    })
  })

  it('should reject invalid data', () => {
    const result = validator.validate({ name: 'John' }, userSchema)
    
    expect(result.success).toBe(false)
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0].field).toBe('email')
  })
})
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [GitHub Repository](https://github.com/mysbryce/nextjs-dto-validator)
- [npm Package](https://www.npmjs.com/package/nextjs-dto-validator)
- [Issues](https://github.com/mysbryce/nextjs-dto-validator/issues)

---

Made with ❤️ for the Next.js community