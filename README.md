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

## Selling points

- The end to end type security:
  1. starting on the database level - describing the skeleton of the database architecture with schema.prisma and based on that generating types (alternative: TypeORM)
  2. generating graphql schema with nexus (alternative: TypeGraphQL)
  3. based on gql schema generating well typed react hooks per gql-query with advanced built in caching system (alternative: URQL)
- keeping half of the code out of the .git (all what gets generated)
- building an infrastructure in 2 minutes on a high level thanks to Vercel (alternative: Netlfiy)
- having a flexibility of customized generated code
- even more generation: using upcoming nexus-prisma integration (alternative + CRUD generator: PalJs)
- cache hydration between ssr and client

## Step by step

Start with

```properties
yarn create next-app --typescript
```

Since we have our fullstack app ready we can start setting the graphql server. From many available options/examples we will follow the <a href="https://github.com/vercel/next.js/blob/canary/examples/api-routes-graphql/pages/api/graphql.js">official one</a>. Keep in mind that the tool we will use isn't <a href="https://github.com/apollographql/apollo-server/issues/5547#issuecomment-891408105">integrated intentionally</a> with Nextjs and we will have to do some workarounds to get fully working serverless handler that won't call the apollo server each time is triggered but only on cold-starts.

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

The only 2 ts errors you should get so far are missing schema and context. Let's define them now.

- context will be kind of our middleware called before each resolver. We will use it to determine either user is authorized or not and pass the global prisma instance to prevent connection creation for each db request. the `session` attribute comes from the <a href="https://github.com/vvo/next-iron-session">next-iron-session</a> library.

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

- schema will be created by nexus and right there we will specify all we need regarding the core of graphql
  1. tell nexus where to put generated files
  2. point the context so he could pass the type down to resolvers
  3. include all nexus defined properties like types and resolvers

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

Let's provide a minimum to finally start the project

- resolver which returns all posts from the database

```ts
export const GetPostList = queryField('postList', {
  type: list(Post),
  async resolve(_, args, ctx) {
    const postList = await ctx.db.post.findMany()
    return postList
  },
})
```

- `Post` type which was used in the example above

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

The backend part is ready, now we need to say what we need on client side to generate optimized hooks. Write your gql queries down as following:

```graphql
query postList {
  postList {
    id
    title
    text
  }
}
```

Our code-base describes what we want to achieve. The rest may be auto generated. Following the scripts from `package.json`:

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

1. `Gql shield` allows you to build logic around permissions. Point queries/mutations that you allow to be accessible for every users or only for admins.
2. `Next-iron-session` takes care of encryption/decryption cookies for you. Keeping an object with an id in cookies allows us to fetch entire user and confirm his role. We create such a cookie on login action and remove it on logout
3. `Vercel` will help you to host your application, build all your routes, set all handlers as AWS Lambda provide global cdn and caching support, create review-apps for each PR/branch.
4. `Nexus-prisma` - upcoming plugin will generate even more code for you
5. `Hydration` - fetch data on server side and send them to client with your first request. Using them as default value will replace all your loaders/placeholders in application. well... unless you need to await authorization.
