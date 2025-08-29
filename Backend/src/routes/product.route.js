import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getAllProduct,
  getProductByID,
  updateProduct,
} from "../controllers/product.controller.js";
import { validate } from "../middlewares/validator.middleware.js";
import { productValidator } from "../validators/index.js";

const router = Router();

router
  .route("/create-product")
  .post(productValidator(), validate, createProduct);
router.route("/get-all-product").get(getAllProduct);
router.route("/get-product/:productId").get(getProductByID);
router.route("/update-product/:productID").put(updateProduct);
router.route("/delete-product/:productID").delete(deleteProduct);

export default router;
