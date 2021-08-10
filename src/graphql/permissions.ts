import { rule, shield, allow } from 'graphql-shield'

const isAdmin = rule({ cache: 'contextual' })(async (parent, args, ctx, info) => {
  return ctx.user.role === 'admin'
})

const permissions = shield({
  Query: {
    '*': allow,
  },
  Mutation: {
    login: allow,
    logout: allow,
    createPost: allow,
    deletePost: isAdmin,
  },
})

export default permissions
