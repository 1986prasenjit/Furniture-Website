import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getAllProduct,
  getProductByID,
  updateProduct,
} from "../controllers/product.controller.js";
import { checkRole, verifyJWT } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validator.middleware.js";
import { productValidator } from "../validators/index.js";

const router = Router();

router
  .route("/create-product")
  .post(productValidator(), validate, checkRole, createProduct);
router.route("/get-all-product").get(verifyJWT, getAllProduct);
router.route("/get-product/:productId").get(verifyJWT, getProductByID);
router.route("/update-product/:productID").put(checkRole, updateProduct);
router.route("/delete-product/:productID").delete(checkRole, deleteProduct);

export default router;
