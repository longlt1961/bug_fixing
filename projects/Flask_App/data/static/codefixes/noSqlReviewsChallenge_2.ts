import { Request, Response, NextFunction } from 'express'
import security from '../lib/security'
const utils = require('../lib/utils')
const db = require('../models/index')

export function updateProductReviews () {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = security.authenticatedUsers.from(req)
    // Sanitize the req.body.id to prevent NoSQL injection
    const reviewId = String(req.body.id); // Convert to string to prevent NoSQL injection
    if (!/^[a-f\\d]{24}$/i.test(reviewId)) {
      res.status(400).json({ error: 'Invalid review ID' })
      return
    }

    // Check if the user is the author of the review before allowing the update
    db.reviewsCollection.find({ _id: req.body.id }).then((reviews: Array<{ author: any }>) => {
      if (reviews.length === 0 || reviews[0].author !== user.data.email) {
        res.status(403).json({ error: 'Not authorized to modify this review' })
        return
      }

          // Update the review if the user is authorized
      db.reviewsCollection.update(
        { _id: req.body.id },
        { $set: { message: req.body.message } }
      ).then(
        (result: { modified: number, original: Array<{ author: any }> }) => {
          res.json(result)
        }, (err: unknown) => {
          res.status(500).json(err)
        })
    })
  }
}