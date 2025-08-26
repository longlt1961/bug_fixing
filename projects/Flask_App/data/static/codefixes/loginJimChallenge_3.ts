import {BasketModel} from "../../../models/basket";

export function login () {
  function afterLogin (user: { data: User, bid: number }, res: Response, next: NextFunction) {
    BasketModel.findOrCreate({ where: { UserId: user.data.id } })
      .then(([basket]: [BasketModel, boolean]) => {
        const token = security.authorize(user)
        user.bid = basket.id // keep track of original basket
+        // Create new object to prevent unwanted modification of user object
+        security.authenticatedUsers.put(token, { ...user, bid: basket.id })
         res.json({ authentication: { token, bid: basket.id, umail: user.data.email } })
       }).catch((error: Error) => {
         next(error)