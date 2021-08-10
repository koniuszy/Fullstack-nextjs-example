import { NextApiHandler } from 'next'
import { withIronSession } from 'next-iron-session'
import { ApolloServer } from 'apollo-server-micro'
import cors from 'micro-cors'

import { createContext } from '../../graphql/context'
import schema from '../../graphql/schema'

const apolloServer = new ApolloServer({ schema, context: createContext })

const startServer = apolloServer.start()

const handler: NextApiHandler = async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.end()
    return
  }

  await startServer
  await apolloServer.createHandler({
    path: '/api/graphql',
  })(req, res)
}

export const config = {
  api: {
    bodyParser: false,
  },
}

const { SECRET_COOKIE_PASSWORD } = process.env
if (!SECRET_COOKIE_PASSWORD) throw new Error('missing env: "SECRET_COOKIE_PASSWORD"')

export default cors()(
  withIronSession(handler, {
    cookieName: 'session',
    password: SECRET_COOKIE_PASSWORD,
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production',
    },
  })
)
