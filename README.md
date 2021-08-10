<div align="center">
<h1>Static code analysis on the highest level</h1>
<p>Sum up of how I started fullstack apps knowing only frontend basics</p>
<p>
	<a href="https://vercel.com/">Vercel</a>&nbsp;&nbsp;&nbsp;&nbsp;
	<a href="https://www.apollographql.com/docs/">Apollo</a>&nbsp;&nbsp;&nbsp;&nbsp;
	<a href="https://www.prisma.io/">Prisma</a>
</p>
</div>

## Stack

- Nextjs as a ReactFramework
- ApolloClient as a GraphQL client
- ApolloServer as the easiest serverless graphql handler creator
- Prisma as a typed ORM
- Nexus as a Code-First GraphQL Schema generator
- Codegen as a react-hooks generator based on schema
- Sql-lite as a database

## Selling points

- End to end type security:
  1. starting at the database level - describing the skeleton of the database architecture with schema.prisma and based on that generating types (an alternative: TypeORM)
  2. generating graphql schema with nexus (an alternative: TypeGraphQL)
  3. based on gql schema: generating well-typed react hooks per gql-query with advanced built-in caching system (alternative: URQL)
- keeping half of the code out of the .git (all that gets generated)
- building an infrastructure in 2 minutes on a high level thanks to Vercel (an alternative: Netlfiy)
- having flexibility of customized, generated code
- even more generation: using upcoming nexus-prisma integration (an alternative + CRUD generator: PalJs)
- cache hydration between ssr and client

## Step by step

Start with

```properties
yarn create next-app --typescript
```

Since we have our fullstack app ready we can start setting the graphql server. From many available options/examples we are going to follow the <a href="https://github.com/vercel/next.js/blob/canary/examples/api-routes-graphql/pages/api/graphql.js">official one</a>. Keep in mind that the tool we are going to use isn't <a href="https://github.com/apollographql/apollo-server/issues/5547#issuecomment-891408105">automatically integrated</a> with Nextjs and we will have to do some workarounds to get a fully working serverless handler that won't call the apollo server each time it is triggered but only on cold-starts.

```ts
import { ApolloServer } from 'apollo-server-micro'
import { NextApiHandler } from 'next'

const apolloServer = new ApolloServer({ schema, context })

const startServer = apolloServer.start()

const handler: NextApiHandler = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', 'https://studio.apollographql.com')
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  if (req.method === 'OPTIONS') {
    res.end()
    return
  }

  await startServer
  await apolloServer.createHandler({
    path: '/api',
  })(req, res)
}

export default handler

export const config = {
  api: {
    bodyParser: false,
  },
}
```

The only 2 ts errors you should get so far are: missing schema and context. Let's define them now.

- context is going to serve the purpose of middleware called before each resolver. We are going to use it to determine either user is authorized or not and pass the global prisma instance in order to prevent creating a connection with the db on every request. The `session` attribute comes from the <a href="https://github.com/vvo/next-iron-session">next-iron-session</a> library.

```ts
export async function createContext({
  req,
}: {
  req: NextApiRequestWithSession
  res: NextApiResponse
}): Promise<Context> {
  const user = req.session.get('user')
  return {
    db: prisma,
    req,
    user,
  }
}
```

- schema is going to be created by nexus, and right there we will specify all we need regarding the core of graphql
  1. tell nexus where to put generated files
  2. point the context so it could pass the type down to the resolvers
  3. include all nexus-defined properties such as types and resolvers

```ts
const schema = makeSchema({
  types: [resolvers],
  contextType: {
    module: join(process.cwd(), 'graphql', 'context.ts'),
    export: 'Context',
  },
  outputs: {
    typegen: join(process.cwd(), 'generated/nexus-typegen.ts'),
    schema: join(process.cwd(), 'generated/schema.graphql'),
  },
})
```

Let's provide a minimal setup to finally start the project

- resolver that returns all posts from the database

```ts
export const GetPostList = queryField('postList', {
  type: list(Post),
  async resolve(_, args, ctx) {
    const postList = await ctx.db.post.findMany()
    return postList
  },
})
```

- `Post` type which has been used in the example above

```ts
export const Post = objectType({
  name: 'Post',
  definition(t) {
    t.int('id')
    t.string('title')
    t.string('text')
  },
})
```

The backend part is ready, now it's time to state what we need on the client-side to generate optimized hooks. Create your gql queries as in the following example:

```graphql
query postList {
  postList {
    id
    title
    text
  }
}
```

Our code-base describes what we want to achieve. The rest may be auto-generated following the scripts from the `package.json`:

```json
{
  "gen": "yarn gen:prisma && yarn gen:nexus && yarn gen:gql",
  "gen:prisma": "yarn prisma generate",
  "gen:nexus": "ts-node --transpile-only -P nexus.tsconfig.json src/graphql/schema",
  "gen:gql": "graphql-codegen --config codegen.yml"
}
```

1. generate types based on db.schema
2. generate gql.schema
3. generate hooks based on gql.schema

## Extra features

1. `Gql shield` allows you to build logic around permissions. Point queries/mutations that you allow to be accessible for all users or only for admins.
2. `Next-iron-session` takes care of encryption/decryption of cookies for you. Keeping an object with an id within cookies allows fetching the entire user and confirm his role. We create such a cookie on login action and remove it on logout.
3. `Vercel` will help you to host your application, build all your routes, set all handlers as AWS Lambda functions, provide global cdns and caching support, create review-apps for each PR/branch.
4. `Nexus-prisma` - upcoming plugin is going to allow for automation of even greater part of the code
5. `Hydration` - fetch data on server-side and send them to a client with your first request. Using this data as defaults values will replace all your loaders/placeholders in the application. Well... unless you need to await authorization.
