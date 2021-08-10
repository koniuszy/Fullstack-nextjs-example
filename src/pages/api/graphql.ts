import { NextApiHandler } from 'next'
import { withIronSession } from 'next-iron-session'
import { ApolloServer } from 'apollo-server-micro'

import { createContext } from '../../graphql/context'
import schema from '../../graphql/schema'

const apolloServer = new ApolloServer({ schema, context: createContext })

const startServer = apolloServer.start()

const handler: NextApiHandler = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader(
    'Access-Control-Allow-Origin',
    'https://studio.apollographql.com, https://fullstack-nextjs-example.vercel.app, http://localhost:3000'
  )
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')

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

export default withIronSession(handler, {
  cookieName: 'session',
  password: SECRET_COOKIE_PASSWORD,
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
})
