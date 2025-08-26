import { Request, Response, NextFunction } from 'express'

export function updateProductReviews () {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = security.authenticatedUsers.from(req)

    // Assuming a middleware 'requireReviewAuthor' exists to check user authorization
    // This is a placeholder, actual middleware should be implemented
    security.requireReviewAuthor(req, res, () => {
      db.reviewsCollection.update(
        { _id: req.body.id },
        { $set: { message: req.body.message } }
      ).then(
        (result: { modified: number, original: Array<{ author: any }> }) => {
          // Check if the review was actually modified
          if (result.modified === 0) {
            return res.status(404).json({ message: 'Review not found or not modified' })
          }
          res.json(result)
        }, (err: unknown) => {
          // Prevent information leakage by sending a generic error message
          res.status(500).json({ message: 'Failed to update review' })
        })
    })
  }
}