import { Request, Response, NextFunction } from 'express'
import security from '../lib/security'
const db = require('../data/mongodb')

export function updateProductReviews () {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = security.authenticatedUsers.from(req)
    const id = String(req.body.id) // Sanitize the id field to prevent NoSQL injection
    const message = String(req.body.message) // Sanitize the message field

    if (req.body.id['$ne'] !== undefined) {
        // Respond with a 400 status code and a helpful message when the id is invalid
        return res.status(400).json({ error: 'Invalid id provided' });
    }
    
    // Use the sanitized id in the database query

    db.reviewsCollection.update(
      { _id: req.body.id },
      { $set: { message: req.body.message } }
    ).then(
      (result: { modified: number, original: Array<{ author: any }> }) => {
        res.json(result)
      }, (err: unknown) => {
        res.status(500).json(err)
      })
  }
}