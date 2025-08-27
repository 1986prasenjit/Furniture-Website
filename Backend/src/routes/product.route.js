import { Router } from "express";
import { createProduct, deleteProduct, getAllProduct, updateProduct } from "../controllers/product.controller.js";
import { productValidator } from "../validators/index.js";
import { validate } from "../middlewares/validator.middleware.js";


const router = Router();

router.route("/create-product").post(productValidator(),validate,createProduct);
router.route("/get-all-product").get(getAllProduct);
router.route("/update-product/:productID").put(updateProduct);
router.route("/delete-product/:productID").delete(deleteProduct);

export default router;