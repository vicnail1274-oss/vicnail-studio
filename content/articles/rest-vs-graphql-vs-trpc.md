---
title: "REST vs GraphQL vs tRPC: When to Use Each"
description: "Compare REST, GraphQL, and tRPC for API design. Understand the trade-offs, ideal use cases, and how to choose the right API style for your project."
keywords: ["rest vs graphql vs trpc", "rest vs graphql", "trpc vs graphql", "api design comparison", "which api should i use"]
canonical: "https://devplaybook.cc/blog/rest-vs-graphql-vs-trpc"
date: "2025-03-20"
tags: ["api", "backend", "graphql", "rest", "trpc", "typescript"]
slug: "rest-vs-graphql-vs-trpc"
---

# REST vs GraphQL vs tRPC: When to Use Each

Three dominant API styles power modern web applications — REST, GraphQL, and tRPC. Each solves a different problem. Using GraphQL where REST fits is over-engineering; using REST where tRPC fits is wasted boilerplate.

This guide cuts through the hype to give you a clear framework for choosing.

---

## REST: The Default Standard

REST (Representational State Transfer) maps operations to HTTP methods and resources to URLs.

```
GET    /users          → list users
GET    /users/123      → get user 123
POST   /users          → create user
PUT    /users/123      → replace user 123
PATCH  /users/123      → update user 123 fields
DELETE /users/123      → delete user 123
```

### A Basic REST Endpoint

```javascript
// Express.js example
router.get('/users/:id', async (req, res) => {
  const user = await db.users.findById(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  });
});
```

### REST Strengths

- **Universal tooling**: Every HTTP client, browser, `curl`, and monitoring tool understands REST
- **Cacheable**: `GET` responses can be cached at every layer (CDN, browser, proxy)
- **Stateless**: Each request is independent — easy to scale horizontally
- **Established conventions**: Developers know what `404`, `201`, and `PUT` mean
- **No client library needed**: Fetch API is sufficient

### REST Weaknesses

**Over-fetching**: You get all user fields even if you only need the name.

**Under-fetching**: Displaying a user's posts + comments requires multiple round trips:

```
GET /users/123          → user data
GET /users/123/posts    → posts
GET /posts/456/comments → comments
```

**No type safety**: Nothing prevents the client from calling the wrong endpoint or misusing response data.

---

## GraphQL: Query What You Need

GraphQL is a query language where the client specifies exactly what data it wants. One endpoint handles all queries.

```graphql
# Client sends this query
query GetUserWithPosts {
  user(id: "123") {
    name
    email
    posts(last: 5) {
      title
      publishedAt
      comments {
        body
        author {
          name
        }
      }
    }
  }
}
```

One request returns exactly the nested data needed — no over/under-fetching.

### A Basic GraphQL Schema

```javascript
// Schema definition
const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    posts: [Post!]!
  }

  type Post {
    id: ID!
    title: String!
    body: String!
    author: User!
  }

  type Query {
    user(id: ID!): User
    users: [User!]!
  }
`;

// Resolver
const resolvers = {
  Query: {
    user: (_, { id }) => db.users.findById(id),
    users: () => db.users.findAll(),
  },
  User: {
    posts: (user) => db.posts.findByUserId(user.id),
  },
};
```

### GraphQL Strengths

- **Precise data fetching**: Request exactly what the UI needs
- **Single endpoint**: Reduces API versioning complexity
- **Self-documenting**: The schema is the documentation (explore via GraphiQL/Playground)
- **Great for complex, nested data**: Social graphs, dashboards, content platforms
- **Strong typing**: Schema enforces data shapes

### GraphQL Weaknesses

- **N+1 problem**: Without DataLoader, nested queries cause N+1 DB queries
- **Caching is hard**: POST requests with variable bodies don't cache like GET
- **File uploads**: Awkward with `multipart/form-data`
- **Complexity**: Schema design, resolver logic, and client caching (Apollo/urql) add overhead
- **Not great for public APIs**: Exposing GraphQL publicly opens you to expensive queries

```javascript
// N+1 problem: querying 100 users triggers 100 post queries
// Fix requires DataLoader batching:
const postLoader = new DataLoader(async (userIds) => {
  const posts = await db.posts.findByUserIds(userIds);
  return userIds.map(id => posts.filter(p => p.userId === id));
});
```

---

## tRPC: End-to-End Type Safety

tRPC is not really a protocol — it's a TypeScript library that lets you call backend functions from the frontend as if they were local functions, with full type inference. No code generation, no schemas.

```typescript
// Server: define a procedure
const appRouter = router({
  getUser: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return db.users.findById(input.id);
    }),

  createUser: publicProcedure
    .input(z.object({ name: z.string(), email: z.string().email() }))
    .mutation(async ({ input }) => {
      return db.users.create(input);
    }),
});

export type AppRouter = typeof appRouter;
```

```typescript
// Client: call it like a function — fully typed
const { data: user } = trpc.getUser.useQuery({ id: '123' });
//      ^? User | undefined — TypeScript knows the return type

await trpc.createUser.mutate({ name: 'Alice', email: 'alice@example.com' });
// Type error if you pass wrong data — caught at compile time
```

If you change the server return type, TypeScript immediately flags all clients that break. No API doc drift, no runtime type surprises.

### tRPC Strengths

- **Zero code generation**: Types are inferred directly from router definition
- **Instant type errors**: Refactor server code → TypeScript shows all broken clients immediately
- **Minimal boilerplate**: No OpenAPI spec, no GraphQL schema, no DTO classes
- **First-class React Query integration**: Built-in `useQuery`/`useMutation` hooks
- **Input validation**: Zod schemas validate inputs automatically

### tRPC Weaknesses

- **TypeScript only**: Not usable from non-TypeScript clients (no mobile apps, no third parties)
- **Monorepo-friendly, polyrepo-hard**: Sharing types between client and server requires a shared package
- **Not a public API**: Cannot expose tRPC endpoints to external consumers
- **Custom HTTP clients**: No REST-style routes — hard to call from curl or test with Postman

---

## Head-to-Head Comparison

| Dimension | REST | GraphQL | tRPC |
|-----------|------|---------|------|
| Type safety | Manual/OpenAPI | Schema-based | Full TypeScript |
| Client languages | Any | Any | TypeScript only |
| Learning curve | Low | High | Low (if TS) |
| Caching | Excellent | Complex | Via React Query |
| Public API | Yes | Yes | No |
| Nested data | Multiple requests | Single query | Single call |
| File uploads | Native | Awkward | Native |
| Tooling maturity | Very mature | Mature | Growing |

---

## Decision Framework

### Choose REST when:

- Building a **public API** (third parties, mobile apps, partners)
- Your team includes **non-TypeScript** services (Python, Go, Java clients)
- You need **HTTP caching** at scale (CDN, Varnish)
- Simple **CRUD operations** — no complex nested data requirements
- Your API will be **long-lived** and consumed by many different clients

### Choose GraphQL when:

- You have a **complex, graph-like data model** (social network, e-commerce with many relations)
- **Multiple clients** need different shapes of the same data (mobile needs less, desktop needs more)
- You're building a **data aggregation layer** over multiple services
- Your team has **strong GraphQL experience** and understands its operational costs
- You need a **self-documenting API** that third parties can explore

### Choose tRPC when:

- You're building a **full-stack TypeScript app** (Next.js, Remix, SvelteKit)
- The **client and server are in the same monorepo** or can share types
- **Refactoring speed** is critical — you want TypeScript to catch breaking changes
- You don't need a **public-facing API** (internal app, SaaS product backend)
- Your team is tired of **OpenAPI/GraphQL schema maintenance overhead**

---

## Combining Approaches

You don't have to pick one for everything:

```
API Gateway (REST) → exposed to third parties
     ↓
Internal GraphQL → data aggregation from microservices
     ↓
tRPC → Next.js frontend ↔ BFF (Backend for Frontend)
```

A real production stack might use REST for the public API, tRPC for the Next.js app's backend calls, and a GraphQL layer for cross-service data federation.

---

## Summary

- **REST** = universal, cacheable, public-facing. Use it for APIs that external consumers call.
- **GraphQL** = flexible, nested, self-documenting. Use it when clients need custom data shapes from complex domains.
- **tRPC** = type-safe, zero-overhead, TypeScript-native. Use it for full-stack TS apps where client and server share code.

The trend in 2025: tRPC for new TypeScript monorepos, REST for public APIs, GraphQL for data-heavy consumer products. All three are valid — match the tool to the problem.

---

Format and validate your API responses at [devplaybook.cc/json-formatter](https://devplaybook.cc/json-formatter).
