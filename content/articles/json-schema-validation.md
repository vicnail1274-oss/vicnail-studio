---
title: "JSON Schema Validation: A Complete Guide"
description: "Learn JSON Schema validation from the ground up. Covers types, constraints, nested objects, arrays, composition keywords, and validation libraries in JavaScript and Python."
keywords: ["json schema validation", "json schema tutorial", "json schema validator", "ajv json schema", "jsonschema python"]
canonical: "https://devplaybook.cc/blog/json-schema-validation"
date: "2025-03-20"
tags: ["json", "validation", "api", "javascript", "python"]
slug: "json-schema-validation"
---

# JSON Schema Validation: A Complete Guide

JSON Schema is a vocabulary for validating the structure and contents of JSON data. It's the most widely adopted standard for API request/response validation, config file validation, and data quality enforcement.

This guide covers the full JSON Schema spec with practical examples you can use immediately.

---

## What Is JSON Schema?

A JSON Schema is itself a JSON document that describes the expected shape of other JSON data.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "name": { "type": "string" },
    "age":  { "type": "integer", "minimum": 0 }
  },
  "required": ["name"]
}
```

This schema says: "A valid document is an object with a required string `name` and an optional non-negative integer `age`."

Valid:
```json
{ "name": "Alice", "age": 30 }
{ "name": "Bob" }
```

Invalid:
```json
{ "age": 30 }          ← missing required "name"
{ "name": 123 }        ← name must be string
{ "name": "X", "age": -1 } ← age below minimum
```

---

## Core Types

JSON Schema supports 6 primitive types and 1 composite:

```json
{ "type": "string" }
{ "type": "number" }
{ "type": "integer" }
{ "type": "boolean" }
{ "type": "null" }
{ "type": "array" }
{ "type": "object" }
```

Allow multiple types:
```json
{ "type": ["string", "null"] }
```

---

## String Constraints

```json
{
  "type": "string",
  "minLength": 1,
  "maxLength": 255,
  "pattern": "^[a-zA-Z0-9_]+$",
  "format": "email"
}
```

Common `format` values: `email`, `uri`, `date`, `date-time`, `uuid`, `ipv4`, `hostname`.

> Note: `format` is advisory by default. Validators enforce it only when configured to do so.

```json
{
  "type": "string",
  "enum": ["active", "inactive", "pending"]
}
```

Use `enum` to restrict to a fixed set of values.

---

## Number Constraints

```json
{
  "type": "number",
  "minimum": 0,
  "maximum": 100,
  "exclusiveMinimum": 0,
  "multipleOf": 0.5
}
```

- `minimum` / `maximum`: inclusive bounds
- `exclusiveMinimum` / `exclusiveMaximum`: exclusive bounds
- `multipleOf`: value must be a multiple of this number

```json
{ "type": "integer", "minimum": 1, "maximum": 999 }
```

---

## Object Constraints

```json
{
  "type": "object",
  "properties": {
    "id":    { "type": "integer" },
    "name":  { "type": "string", "minLength": 1 },
    "email": { "type": "string", "format": "email" },
    "role":  { "type": "string", "enum": ["admin", "user", "guest"] }
  },
  "required": ["id", "name", "email"],
  "additionalProperties": false,
  "minProperties": 1,
  "maxProperties": 10
}
```

Key keywords:
- `properties`: define named property schemas
- `required`: array of required property names
- `additionalProperties`: `false` rejects any property not in `properties`
- `minProperties` / `maxProperties`: number of properties bounds

### Pattern Properties

Accept properties matching a pattern:

```json
{
  "type": "object",
  "patternProperties": {
    "^S_": { "type": "string" },
    "^I_": { "type": "integer" }
  },
  "additionalProperties": false
}
```

---

## Array Constraints

```json
{
  "type": "array",
  "items": { "type": "string" },
  "minItems": 1,
  "maxItems": 10,
  "uniqueItems": true
}
```

This schema validates an array of 1-10 unique strings.

### Tuple Validation (Prefix Items)

For arrays where each position has a specific type:

```json
{
  "type": "array",
  "prefixItems": [
    { "type": "string" },
    { "type": "integer" },
    { "type": "boolean" }
  ],
  "items": false
}
```

Validates exactly `["name", 42, true]` — each position has a fixed type, no additional items.

---

## Composition Keywords

### `allOf` — Must match all schemas

```json
{
  "allOf": [
    { "type": "object", "required": ["name"] },
    { "type": "object", "required": ["email"] }
  ]
}
```

### `anyOf` — Must match at least one

```json
{
  "anyOf": [
    { "type": "string" },
    { "type": "integer" }
  ]
}
```

### `oneOf` — Must match exactly one

```json
{
  "oneOf": [
    { "type": "string", "maxLength": 5 },
    { "type": "integer", "minimum": 5 }
  ]
}
```

### `not` — Must NOT match

```json
{
  "not": { "type": "string" }
}
```

---

## `$ref` and Schema Reuse

Define reusable schemas in `$defs` (Draft 2020-12) or `definitions` (older drafts):

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$defs": {
    "Address": {
      "type": "object",
      "properties": {
        "street": { "type": "string" },
        "city":   { "type": "string" },
        "zip":    { "type": "string", "pattern": "^\\d{5}$" }
      },
      "required": ["street", "city", "zip"]
    }
  },
  "type": "object",
  "properties": {
    "name":           { "type": "string" },
    "billingAddress": { "$ref": "#/$defs/Address" },
    "shippingAddress": { "$ref": "#/$defs/Address" }
  },
  "required": ["name", "billingAddress"]
}
```

---

## Real-World Example: API Request Schema

A user registration request:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "UserRegistration",
  "type": "object",
  "properties": {
    "username": {
      "type": "string",
      "minLength": 3,
      "maxLength": 30,
      "pattern": "^[a-zA-Z0-9_]+$"
    },
    "email": {
      "type": "string",
      "format": "email"
    },
    "password": {
      "type": "string",
      "minLength": 8
    },
    "age": {
      "type": "integer",
      "minimum": 13
    },
    "preferences": {
      "type": "object",
      "properties": {
        "newsletter": { "type": "boolean" },
        "theme": { "type": "string", "enum": ["light", "dark"] }
      },
      "additionalProperties": false
    }
  },
  "required": ["username", "email", "password"],
  "additionalProperties": false
}
```

---

## Validation Libraries

### JavaScript: AJV

AJV is the fastest and most widely used JSON Schema validator for JavaScript:

```bash
npm install ajv ajv-formats
```

```javascript
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

const schema = {
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 1 },
    email: { type: 'string', format: 'email' },
    age: { type: 'integer', minimum: 0 },
  },
  required: ['name', 'email'],
  additionalProperties: false,
};

const validate = ajv.compile(schema);

const data = { name: 'Alice', email: 'alice@example.com', age: 30 };
const valid = validate(data);

if (!valid) {
  console.error(validate.errors);
  // [{ instancePath: '/email', message: 'must match format "email"' }, ...]
} else {
  console.log('Valid!');
}
```

### Python: jsonschema

```bash
pip install jsonschema[format-nongpl]
```

```python
import jsonschema

schema = {
    "type": "object",
    "properties": {
        "name":  {"type": "string", "minLength": 1},
        "email": {"type": "string", "format": "email"},
        "age":   {"type": "integer", "minimum": 0},
    },
    "required": ["name", "email"],
    "additionalProperties": False,
}

data = {"name": "Alice", "email": "alice@example.com", "age": 30}

try:
    jsonschema.validate(instance=data, schema=schema,
                        format_checker=jsonschema.FormatChecker())
    print("Valid!")
except jsonschema.ValidationError as e:
    print(f"Invalid: {e.message}")
```

### TypeScript: Zod (Code-First)

If you're using TypeScript, Zod defines schemas in code and infers types:

```typescript
import { z } from 'zod';

const UserSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email(),
  password: z.string().min(8),
  age: z.number().int().min(13).optional(),
});

type User = z.infer<typeof UserSchema>;  // TypeScript type generated automatically

const result = UserSchema.safeParse(req.body);
if (!result.success) {
  console.error(result.error.flatten());
}
```

---

## Schema Validation in API Pipelines

**At the API gateway**: Validate request bodies before they reach your services.

**In CI/CD**: Validate config files against schemas:

```bash
# Install ajv-cli
npm install -g ajv-cli

# Validate a config file
ajv validate -s config-schema.json -d config.json
```

**OpenAPI Integration**: OpenAPI 3.0+ uses JSON Schema for request/response validation. Your existing JSON Schemas can often be imported directly.

---

## Summary

| Keyword | What it validates |
|---------|------------------|
| `type` | Data type |
| `required` | Required object properties |
| `properties` | Object property schemas |
| `additionalProperties: false` | No extra properties |
| `items` | Array element schema |
| `minLength/maxLength` | String length |
| `minimum/maximum` | Number bounds |
| `enum` | Fixed allowed values |
| `format` | String format (email, date, etc.) |
| `allOf/anyOf/oneOf` | Logical composition |
| `$ref` | Schema reuse |

JSON Schema is the foundation of API contracts, config validation, and data quality. Mastering it pays off across your entire stack.

---

Format and validate your JSON data at [devplaybook.cc/json-formatter](https://devplaybook.cc/json-formatter).
