import { makeSchema } from 'nexus'
import { join } from 'path'
import { applyMiddleware } from 'graphql-middleware'

import * as resolvers from './resolvers'
import permissions from './permissions'

const schema = makeSchema({
  types: [resolvers],
  contextType: {
    module: join(process.cwd(), 'src/graphql/context.ts'),
    export: 'Context',
  },
  outputs: {
    typegen: join(process.cwd(), 'generated/nexus-typegen.ts'),
    schema: join(process.cwd(), 'generated/schema.graphql'),
  },
  nonNullDefaults: { input: true, output: true },
})

export default applyMiddleware(schema, permissions)
