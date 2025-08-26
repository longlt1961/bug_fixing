import { Request, Response, NextFunction } from 'express'
import models, { ErrorWithParent } from '../models'
import utils from '../lib/utils'
const injectionChars = /"|'|;|and|or|;|#/i;

export function searchProducts () {
  return (req: Request, res: Response, next: NextFunction) => {
    const criteria: any = req.query.q === 'undefined' ? '' : req.query.q ?? '';
    criteria = (criteria.length <= 200) ? criteria : criteria.substring(0, 200)
    if (criteria.match(injectionChars)) {
      res.status(400).send()
      return
    }
    // Use parameterized query to prevent SQL injection
    models.sequelize.query('SELECT * FROM Products WHERE ((name LIKE :search OR description LIKE :search) AND deletedAt IS NULL) ORDER BY name', {
      replacements: { search: `%${criteria}%` },
      type: models.sequelize.QueryTypes.SELECT
    })
      .then(([products]: any) => {
        const dataString = JSON.stringify(products)
        for (let i = 0; i < products.length; i++) {
          products[i].name = req.__(products[i].name)
          products[i].description = req.__(products[i].description)
        }
        res.json(utils.queryResultToJson(products))
      }).catch((error: ErrorWithParent) => {
        next(error.parent)
      })
  }
}