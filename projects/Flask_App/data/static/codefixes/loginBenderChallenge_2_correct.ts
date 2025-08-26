import {BasketModel} from "../../../models/basket";

export function login () {
  function afterLogin (user: { data: User, bid: number }, res: Response, next: NextFunction) {
    BasketModel.findOrCreate({ where: { UserId: user.data.id } })
      .then(([basket]: [BasketModel, boolean]) => {
        const token = security.authorize(user)
        user.bid = basket.id // keep track of original basket
        security.authenticatedUsers.put(token, user)
        res.json({ authentication: { token, bid: basket.id, umail: user.data.email } })
      }).catch((error: Error) => {
        next(error)
      })
  }

  return (req: Request, res: Response, next: NextFunction) => {
+    // Input validation to prevent SQL injection
+    if (!req.body.email || !req.body.password) {
+      return res.status(400).send(res.__('Email and password are required.'));
+    }
     models.sequelize.query(`SELECT * FROM Users WHERE email = $mail AND password = $pass AND deletedAt IS NULL`,
      { bind: { mail: req.body.email, pass: security.hash(req.body.password) }, model: models.User, plain: true })
      .then((authenticatedUser) => {