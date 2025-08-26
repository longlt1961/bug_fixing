import { type Request, type Response } from 'express'
import { type Sequelize } from 'sequelize'

const createModel = require('./models/index')
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
module.exports = function (app: any, sequelize: Sequelize, finale: any) {
  const UserModel = createModel.UserModel(sequelize)
  const ProductModel = createModel.ProductModel(sequelize)
  const FeedbackModel = createModel.FeedbackModel(sequelize)
  const BasketItemModel = createModel.BasketItemModel(sequelize)
  const ChallengeModel = createModel.ChallengeModel(sequelize)
  const ComplaintModel = createModel.ComplaintModel(sequelize)
  const RecycleModel = createModel.RecycleModel(sequelize)
  const SecurityQuestionModel = createModel.SecurityQuestionModel(sequelize)
  const SecurityAnswerModel = createModel.SecurityAnswerModel(sequelize)
  const AddressModel = createModel.AddressModel(sequelize)
  const PrivacyRequestModel = createModel.PrivacyRequestModel(sequelize)
  const CardModel = createModel.CardModel(sequelize)
  const QuantityModel = createModel.QuantityModel(sequelize)
  const WalletModel = createModel.WalletModel(sequelize)

/* Generated API endpoints */
  finale.initialize({ app, sequelize })

  const autoModels = [
    { name: 'User', exclude: ['password', 'totpSecret'], model: UserModel },
    { name: 'Product', exclude: [], model: ProductModel },
    { name: 'Feedback', exclude: [], model: FeedbackModel },
    { name: 'BasketItem', exclude: [], model: BasketItemModel },
    { name: 'Challenge', exclude: [], model: ChallengeModel },
    { name: 'Complaint', exclude: [], model: ComplaintModel },
    { name: 'Recycle', exclude: [], model: RecycleModel },
    { name: 'SecurityQuestion', exclude: [], model: SecurityQuestionModel },
    { name: 'SecurityAnswer', exclude: [], model: SecurityAnswerModel },
    { name: 'Address', exclude: [], model: AddressModel },
    { name: 'PrivacyRequest', exclude: [], model: PrivacyRequestModel },
    { name: 'Card', exclude: [], model: CardModel },
    { name: 'Quantity', exclude: [], model: QuantityModel }
  ]

  for (const { name, exclude, model } of autoModels) {
    const resource = finale.resource({
      model,
      endpoints: [`/api/${name}s`, `/api/${name}s/:id`],
      excludeAttributes: exclude,
      pagination: false
    })

    // create a wallet when a new user is registered using API
    if (name === 'User') {
      resource.create.send.before((req: Request, res: Response, context: { instance: { id: any }, continue: any }) => {
        // Validate input: rudimentary email format check
        if (!req.body.email || !req.body.email.includes('@')) {
          res.status(400).send('Invalid email format')
          return res.end()
        }
        // Validate input: rudimentary password length check
        if (!req.body.password || req.body.password.length < 8) {
          res.status(400).send('Password must be at least 8 characters long')
          return res.end()
         }
        WalletModel.create({ UserId: context.instance.id }).catch((err: unknown) => {
          console.error(err)
          res.status(500).send('Failed to create wallet') // Respond with an error status and message
          return res.end() // End the request-response cycle to prevent user creation
        })

        context.instance.role = 'customer'
        return context.continue

      })
    }
  }
}