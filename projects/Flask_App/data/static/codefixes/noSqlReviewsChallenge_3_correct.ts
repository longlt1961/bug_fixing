import { Request, Response, NextFunction } from 'express'
import { security } from '../lib/security'
import { db } from '../data/mongodb'

export function updateProductReviews () {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = security.authenticatedUsers.from(req)

    if (typeof req.body.id !== 'string') {
      res.status(400).send()
      return
    }

    // Verify that the authenticated user is the author of the review
    db.reviewsCollection.find({ _id: req.body.id }).toArray(function (err, docs) {
      if (docs[0].author.id !== user.data.id) {
        res.status(403).send('Not authorized to modify this review')
        return
      }
    })

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