import { Router } from "express";
import { getProfile, loginUser, logOutUser, registerUser } from "../controllers/auth.controller.js";
import { loginUserValidator, userRegistrationValidator } from "../validators/index.js";
import { validate } from "../middlewares/validator.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(userRegistrationValidator(),validate,registerUser);
router.route("/login").get(loginUserValidator(), validate, loginUser);
router.route("/logout").get(verifyJWT, logOutUser)
router.route("/profile").get(verifyJWT, getProfile)
export default router;