<div align="center">
<h1>Static code analysis on the highest level</h1>
<p>Sum up of how I started fulsltack apps knowing only frontend basics</p>
<p>
	<a href="https://vercel.com/">Vercel</a>&nbsp;&nbsp;&nbsp;&nbsp;
	<a href="https://www.apollographql.com/docs/">Apollo</a>&nbsp;&nbsp;&nbsp;&nbsp;
	<a href="https://www.prisma.io/">Prisma</a>
</p>
</div>

## Stack

- Nextjs as ReactFramework
- ApolloClient as GraphQL client
- ApolloServer as the easiest serverless graphql handler creator
- Prisma as the typed ORM
- Nexus as the Code-First GraphQL Schema generator
- Codegen as react-hooks generator based on schema
- Sql-lite as the dataBase

### Selling points

- The end to end type security:
  1. starting on the database level - describing the skeleton of the database architecture with schema.prisma and based on that generating types (alternative: TypeORM)
  2. generating graphql schema with nexus (alternative: TypeGraphQL)
  3. based on gql schema generating well typed react hooks per gql-query with advanced built in caching system (alternative: URQL)
- keeping half of the code out of the .git (all what gets generated)
- building an infrastructure in 2 minutes on a high level thanks to Vercel (alternative: Netlfiy)
- having a flexibility of customized generated code
- even more generation: using upcoming nexus-prisma integration (alternative + CRUD generator: PalJs)
- cache hydration between ssr and client

Example `apps/a` `package.json`:

```json
{
  "scripts": {
    "dev": "a command"
  }
}
```
