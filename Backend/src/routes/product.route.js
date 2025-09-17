import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getAllProduct,
  getAllProductForAdmin,
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
router.route("/get-all-product").get(getAllProduct);
router.route("/get-product/:productId").get(getProductByID);
router.route("/update-product/:productId").put(checkRole, updateProduct);
router.route("/delete-product/:productId").delete(checkRole, deleteProduct);
router
  .route("/get-allProducts-forAdmin")
  .get(verifyJWT, checkRole, getAllProductForAdmin);

export default router;
