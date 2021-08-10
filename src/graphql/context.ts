import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { Session } from 'next-iron-session'

import prisma from '../lib/prisma'

type NextApiRequestWithSession = NextApiRequest & { session: Session }

export interface Context {
  db: PrismaClient
  req: NextApiRequestWithSession
  user: { id: number; role: 'admin' | 'editor' | 'user' } | null | undefined
}

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
