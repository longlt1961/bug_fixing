import {BasketModel} from "../../../models/basket";

export function login () {
  function afterLogin (user: { data: User, bid: number }, res: Response, next: NextFunction) {
    BasketModel.findOrCreate({ where: { UserId: user.data.id } })
      .then(([basket]: [BasketModel, boolean]) => {
        // Make sure the basket exists before accessing its properties.
        const token = security.authorize(user)
        // Assign basket id or undefined to user.bid
        user.bid = basket ? basket.id : undefined; // Fixed: Handle cases where basket is undefined
        security.authenticatedUsers.put(token, user)
        res.json({ authentication: { token, bid: basket?.id, umail: user.data.email } })
      }).catch((error: Error) => {
        next(error)
      })
  }

  return (req: Request, res: Response, next: NextFunction) => {
    models.sequelize.query(`SELECT * FROM Users WHERE email = :mail AND password = :password AND deletedAt IS NULL`, // Fixed: Use parameterized query to prevent SQL injection
      { replacements: { mail: req.body.email, password: security.hash(req.body.password || '') }, model: models.User, plain: true }) // Fixed: Added password to replacements
      .then((authenticatedUser) => {
        const user = utils.queryResultToJson(authenticatedUser)
        if (user.data?.id && user.data.totpSecret !== '') {
          res.status(401).json({
            status: 'totp_token_required',
            data: {
              tmpToken: security.authorize({
                userId: user.data.id,
                type: 'password_valid_needs_second_factor_token'
              })
            }
          })
        } else if (user.data?.id) {
          afterLogin(user, res, next)
        } else {
          res.status(401).send(res.__('Invalid email or password.'))
        }
      }).catch((error: Error) => {
        next(error)
      })
  }
}