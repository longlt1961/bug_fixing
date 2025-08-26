import {BasketModel} from "../../../models/basket";

export function login () {
  function afterLogin (user: { data: User, bid: number }, res: Response, next: NextFunction) {
    BasketModel.findOrCreate({ where: { UserId: user.data.id } })
      .then(([basket]: [BasketModel, boolean]) => {
+        // Assign user.bid before calling authorize to prevent timing issues
         const token = security.authorize(user)
         user.bid = basket.id // keep track of original basket
         security.authenticatedUsers.put(token, user)
        res.json({ authentication: { token, bid: basket.id, umail: user.data.email } })
      }).catch((error: Error) => {
         next(error)
      })
    }