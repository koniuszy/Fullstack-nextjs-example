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
