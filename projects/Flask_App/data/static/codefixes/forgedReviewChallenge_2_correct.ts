import { Request, Response, NextFunction } from 'express'
import security from '../lib/security'
import { db } from '../data/mongodb'
import { body } from 'express-validator'

export function updateProductReviews () {
  // Validate request body to prevent NoSQL injection and XSS
  body('id').isString().notEmpty().trim().escape()
  body('message').isString().notEmpty().trim().escape()
  return (req: Request, res: Response, next: NextFunction) => {
    const user = security.authenticatedUsers.from(req)
    db.reviewsCollection.update(
      { _id: req.body.id, author: user.data.email },
      { $set: { message: req.body.message } },
      { multi: true }
    ).then(
      (result: { modified: number, original: Array<{ author: any }> }) => {
        res.json(result)
      }, (err: unknown) => {
        // Prevents leaking internal error information to the client
        console.error(err)
        res.status(500).json({ message: 'Failed to update review.' })
      })
  }
}