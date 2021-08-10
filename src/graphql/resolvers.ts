import { stringArg, mutationField, intArg, queryField, list } from 'nexus'
import { Post } from './types'

export const CreatePost = mutationField('createPost', {
  type: Post,
  args: { text: stringArg(), title: stringArg() },
  async resolve(_, { title, text }, ctx) {
    const createdPost = await ctx.db.post.create({
      data: { title, author: { connect: { id: ctx.user.id } }, text },
    })
    return createdPost
  },
})

export const DeletePost = mutationField('deletePost', {
  type: 'String',
  args: { id: intArg() },
  async resolve(_, { id }, ctx) {
    await ctx.db.post.delete({ where: { id } })
    return 'deleted'
  },
})

export const GetPostList = queryField('postList', {
  type: list(Post),
  async resolve(_, args, ctx) {
    const postList = await ctx.db.post.findMany()
    return postList
  },
})

export const LoginMutation = mutationField('login', {
  type: 'String',
  async resolve(root, args, ctx) {
    // admin user
    const user = ctx.db.user.findUnique({ where: { id: 1 } })

    ctx.req.session.set('user', user)
    await ctx.req.session.save()

    return 'loggedIn'
  },
})

export const LogoutMutation = mutationField('logout', {
  type: 'String',
  async resolve(root, args, ctx) {
    ctx.req.session.destroy()
    await ctx.req.session.save()

    return 'loggedOut'
  },
})
