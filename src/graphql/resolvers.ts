import { stringArg, mutationField, intArg, queryField, objectType, list } from 'nexus'
import { Post } from './types'

export const CreatePost = mutationField('createPost', {
  type: Post,
  args: { text: stringArg(), title: stringArg(), authorId: intArg() },
  async resolve(parent, { title, authorId, text }, ctx) {
    const createdPost = await ctx.db.post.create({
      data: { title, author: { connect: { id: authorId } }, text },
    })
    return createdPost
  },
})

export const DeletePost = mutationField('deletePost', {
  type: 'String',
  args: { id: intArg() },
  resolve() {},
})

export const GetPostList = queryField('posts', {
  type: Post,
  resolve() {},
})
