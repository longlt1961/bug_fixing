import {BasketModel} from "../../../models/basket";

export function login () {
  function afterLogin (user: { data: User, bid: number }, res: Response, next: NextFunction) {
    BasketModel.findOrCreate({ where: { UserId: user.data.id } })
      .then(([basket]: [BasketModel, boolean]) => {
-        const token = security.authorize(user)
+        try {
+          const token = security.authorize(user);
+        } catch (error) {
+          return next(error); // Pass the error to the error handling middleware
+        }
         user.bid = basket.id // keep track of original basket
+        // Create a new object to avoid modifying the original user object
         security.authenticatedUsers.put(token, user)
         res.json({ authentication: { token, bid: basket.id, umail: user.data.email } })
       }).catch((error: Error) => {