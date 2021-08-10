import { objectType } from 'nexus'

const User = objectType({
  name: 'User',
  definition(t) {
    t.int('id')
    t.string('name')
    t.list.field('posts', {
      type: Post,
      async resolve(parent, args, ctx) {
        const posts = await ctx.db.post.findMany({ where: { authorId: parent.id } })
        return posts
      },
    })
  },
})

export const Post = objectType({
  name: 'Post',
  definition(t) {
    t.int('id')
    t.string('title')
    t.string('text')
    t.nullable.int('authorId')
    t.nullable.field('author', {
      type: User,
      async resolve(parent, _, ctx) {
        if (!parent.authorId) return null
        const author = await ctx.db.user.findUnique({
          where: { id: parent.authorId },
        })

        return author
      },
    })
  },
})
