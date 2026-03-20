---
title: "How to Use Regex for Email Validation: Patterns That Actually Work"
description: "Learn how to use regex for email validation in JavaScript, Python, and other languages. Covers working patterns, edge cases, and when to use a library instead."
keywords: ["how to use regex for email validation", "email validation regex", "javascript email regex", "python email validation", "regex email pattern"]
canonical: "https://devplaybook.cc/blog/regex-email-validation"
date: "2025-03-20"
tags: ["regex", "validation", "javascript", "python", "forms"]
slug: "regex-email-validation"
---

# How to Use Regex for Email Validation: Patterns That Actually Work

Email validation with regex is a rite of passage for developers. It's also a minefield — the "perfect" email regex is famously 6,000 characters long and still doesn't cover every valid edge case. But for 99.9% of real-world use, a simpler pattern works fine.

This guide covers practical email validation regex patterns you can use today, the edge cases that bite developers, and when to skip regex entirely.

---

## The Practical Email Regex

The RFC 5322 standard for email addresses is complex. In practice, you want to catch obviously invalid input, not enforce the full spec. Here's a robust pattern for real-world use:

```
/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/
```

Breaking it down:

```
^                    Start of string
[a-zA-Z0-9._%+\-]+   Local part: letters, digits, dots, underscores, %, +, -
@                    Literal @ sign
[a-zA-Z0-9.\-]+      Domain: letters, digits, dots, hyphens
\.                   Literal dot
[a-zA-Z]{2,}         TLD: at least 2 letters
$                    End of string
```

### JavaScript Implementation

```javascript
function isValidEmail(email) {
  const pattern = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
  return pattern.test(email);
}

// Tests
console.log(isValidEmail('user@example.com'));         // true
console.log(isValidEmail('user.name+tag@example.co.uk')); // true
console.log(isValidEmail('user@sub.domain.io'));       // true
console.log(isValidEmail('notanemail'));               // false
console.log(isValidEmail('missing@tld.'));             // false
console.log(isValidEmail('@nodomain.com'));            // false
console.log(isValidEmail('double@@domain.com'));       // false
```

### Python Implementation

```python
import re

EMAIL_PATTERN = re.compile(r'^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$')

def is_valid_email(email: str) -> bool:
    return bool(EMAIL_PATTERN.match(email))

# Tests
print(is_valid_email('user@example.com'))          # True
print(is_valid_email('invalid-email'))             # False
print(is_valid_email('user@domain.toolongltd'))    # True (TLD length not limited here)
```

### PHP

```php
function isValidEmail(string $email): bool {
    $pattern = '/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/';
    return (bool) preg_match($pattern, $email);
}
```

---

## HTML5 Built-In Validation

Before reaching for regex, know that HTML5 input validation handles the common case:

```html
<input type="email" name="email" required>
```

The browser's built-in email validator is roughly equivalent to the pattern above and handles localization. For most form use cases, this is sufficient and requires no JavaScript.

For stricter control or server-side validation, use regex.

---

## Common Patterns for Different Use Cases

### Strict TLD Length (limit to 2-6 chars)

```javascript
// Reject .toolongtld domains
const strict = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,6}$/;
```

### Case-Insensitive Match

```javascript
// Email is case-insensitive by spec; match regardless of case
const caseInsensitive = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/i;

// Or in Python:
pattern = re.compile(r'^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$', re.IGNORECASE)
```

### Block Disposable Email Domains

Regex alone can't block disposable emails — you need a domain denylist:

```javascript
const DISPOSABLE_DOMAINS = new Set(['mailinator.com', 'guerrillamail.com', 'tempmail.com', '10minutemail.com']);

function isDisposableEmail(email) {
  const domain = email.split('@')[1]?.toLowerCase();
  return DISPOSABLE_DOMAINS.has(domain);
}
```

### Subaddressing (Gmail + Filters)

The `+` in `user+filter@gmail.com` is valid per RFC and should be allowed. The practical regex above handles this with `%+\-` in the character class.

---

## Edge Cases That Trip Up Simple Patterns

### Valid Emails That Look Weird

```
"quoted string"@example.com      → valid (quoted local parts)
user.@domain.com                 → invalid (trailing dot)
.user@domain.com                 → invalid (leading dot)
user..name@domain.com            → invalid (consecutive dots)
user@[192.168.1.1]               → valid (IP address domain)
user@domain                      → invalid (no TLD)
```

The practical regex above correctly rejects most of these. It doesn't handle quoted local parts (which are rarely used in practice).

### International (Unicode) Email Addresses

Internationalized email addresses (e.g., `用户@例子.广告`) require Unicode-aware patterns or a dedicated library:

```javascript
// Simple Unicode extension — allows Unicode in local and domain parts
const unicodeEmail = /^[\w._%+\-\u00C0-\u024F]+@[\w\-\u00C0-\u024F]+\.[\w\u00C0-\u024F]{2,}$/u;
```

For production use with internationalized emails, use a library.

---

## When to Use a Library Instead

For production applications, especially those dealing with:
- Email verification flows
- International users
- High-stakes validation (payments, registration)

Use a validation library:

```javascript
// Node.js: validator.js
import validator from 'validator';
console.log(validator.isEmail('test@example.com'));  // true

// With strict options
console.log(validator.isEmail('test@example.com', {
  allow_display_name: false,
  allow_utf8_local_part: false,
  require_tld: true,
}));
```

```python
# Python: email-validator
from email_validator import validate_email, EmailNotValidError

try:
    valid = validate_email("test@example.com")
    normalized = valid.email  # 'test@example.com'
except EmailNotValidError as e:
    print(f"Invalid: {e}")
```

Libraries handle edge cases, internationalization, and DNS-based verification (checking if the domain has MX records) — things regex can't do.

---

## Server-Side vs Client-Side Validation

**Client-side regex** catches typos immediately — good UX, but can be bypassed.

**Server-side validation** is mandatory — never trust client input.

```javascript
// Server-side example (Express + Zod)
import { z } from 'zod';

const UserSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1),
});

app.post('/register', (req, res) => {
  const result = UserSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ errors: result.error.flatten() });
  }
  // result.data is validated and typed
  createUser(result.data);
});
```

Zod's `.email()` validator uses a sensible regex internally plus additional checks. It's the practical choice for TypeScript backends.

---

## The Most Common Mistake

**Not normalizing before validating.** Users type emails with uppercase, trailing spaces, and copy-paste artifacts:

```javascript
function normalizeEmail(input) {
  return input.trim().toLowerCase();
}

function validateEmail(input) {
  const email = normalizeEmail(input);
  const pattern = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
  return { valid: pattern.test(email), normalized: email };
}

validateEmail('  User@Example.COM  ');
// { valid: true, normalized: 'user@example.com' }
```

Always trim and lowercase before regex matching or storing.

---

## Quick Reference

| Pattern | Use case |
|---------|----------|
| `/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/` | General-purpose, covers 99% of cases |
| HTML `<input type="email">` | Browser forms with built-in validation |
| `validator.isEmail()` | Node.js, production-grade |
| `email-validator` (Python) | Python, with DNS check option |
| Zod `.email()` | TypeScript API validation |

---

## Summary

- The practical regex `/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/` handles the vast majority of real email addresses
- Always normalize (trim + lowercase) before validating
- For production, use a validation library — libraries handle internationalization and edge cases regex can't
- Server-side validation is mandatory; client-side is UX sugar
- No regex validates whether an email address is actually deliverable — only SMTP verification can do that

---

Test and build your regex patterns with tools at [devplaybook.cc](https://devplaybook.cc).
