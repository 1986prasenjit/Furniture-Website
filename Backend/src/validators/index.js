import { body } from "express-validator";

const userRegistrationValidator = () => {
    return [
        body("email")
            .trim()
            .notEmpty().withMessage("Email is required")
            .isEmail().withMessage("Email is Invalid"),
        body("name")
            .trim()
            .notEmpty()
            .withMessage("User Name is required to proceed")
            .isLength({ min: 3, max: 13 })
            .withMessage("userName should be at least of 3 Chars and should not exceed 13 chars"),
        body("password")
            .trim()
            .notEmpty()
            .withMessage("Password is required to proceed")
            .isLength({ min: 8, max: 15 })
            .withMessage("Password should be at least of 8 Chars and should not exceed 15 chars"),
    ]
}

const loginUserValidator = () => {
    return [
        body("email")
            .trim()
            .notEmpty().withMessage("Email is required")
            .isEmail().withMessage("Email is Invalid"),
        body("password")
            .trim()
            .notEmpty()
            .withMessage("Password is required to proceed")
            .isLength({ min: 8, max: 15 })
            .withMessage("Password should be at least of 8 Chars and should not exceed 15 chars"),
    ]
}

const productValidator = () => {
    return [
      body("productName")
        .trim()
        .notEmpty()
        .withMessage("Product Name is required to proceed"),
  
      body("productDescription")
        .trim()
        .notEmpty()
        .withMessage("Product Description is required to proceed"),
  
      body("productPrice")
        .isFloat({ gt: 0 })
        .withMessage("Product Price must be a number greater than 0"),
  
      body("productCategory")
        .trim()
        .notEmpty()
        .withMessage("Product Category is required"),
  
      body("stock")
        .isInt({ min: 0 })
        .withMessage("Stock must be a non-negative integer"),
    ];
}
export { userRegistrationValidator, loginUserValidator, productValidator }