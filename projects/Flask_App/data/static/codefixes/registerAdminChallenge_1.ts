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
        WalletModel.create({ UserId: context.instance.id }).catch((err: unknown) => {
          console.error(err)
          // If wallet creation fails, remove the user and reject the request
          UserModel.destroy({ where: { id: context.instance.id } }).then(() => {
            res.status(500).send('Failed to create wallet. User creation rolled back.')
          }).catch((deletionErr: unknown) => {
            console.error('Failed to rollback user creation:', deletionErr)
            res.status(500).send('Failed to create wallet and failed to rollback user creation. Manual intervention required.')
          })
          return
        })
        context.instance.role = context.instance.role ? context.instance.role : 'customer'
        return context.continue
      })
+
     }