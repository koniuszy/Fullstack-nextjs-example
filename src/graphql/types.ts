import { objectType, list } from 'nexus'

const User = objectType({
  name: 'User',
  definition(t) {
    t.int('id')
    t.string('email')
    t.string('name')
    t.field('posts', {
      type: list(Post),
      resolve(parent, args, ctx) {
        return ctx.db.post.findMany({ where: { authorId: parent.id } })
      },
    })
  },
})

export const Post = objectType({
  name: 'Post',
  definition(t) {
    t.id('id')
    t.string('title')
    t.string('text')
    t.int('authorId')
    t.field('author', {
      type: User,
      resolve(parent, _, ctx) {
        return ctx.db.user
          .findUnique({
            where: { id: Number(parent.id) },
          })
          .posts()
      },
    })
  },
})
