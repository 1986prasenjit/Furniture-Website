import { Product } from "../models/product.model.js";
import { ApiError } from "../utils/apiError.js";
import APIFunctionalities from "../utils/apiFunctionalities.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

//generate SKU ---> Stock Keeping Unit

const generateSKU = async (category) => {
  //count how many product is already present in the product category
  const count = await Product.countDocuments({ productCategory: category });

  return `${category.toUpperCase()}-${String(count + 1).padStart(4, "0")}`;
};

const createProduct = asyncHandler(async (req, res, next) => {
  const {
    productName,
    productDescription,
    productPrice,
    productCategory,
    stock,
  } = req.body;

  const sku = await generateSKU(productCategory);

  const existingProduct = await Product.findOne({
    productName,
    productDescription,
  });

  if (existingProduct) {
    return next(
      new ApiError(409, "Product with the same details already exits")
    );
  }

  const product = await Product.create({
    sku,
    productName,
    productDescription,
    productPrice,
    productCategory,
    stock,
  });

  if (!product) {
    return next(new ApiError(500, "fail to create a product"));
  }

  return res
    .status(201)
    .json(
      new ApiResponse(201, product, "Product has been created Successfully")
    );
});

const getAllProduct = asyncHandler(async (req, res, next) => {
  const resultPerPage = 3;
  const apiFeatures = new APIFunctionalities(Product.find(), req.query)
    .search()
    .filter();

  //Getting filtered query before pagination
  const filteredQuery = apiFeatures.query.clone();
  const productCount = await filteredQuery.countDocuments();

  //calculated totap pages based on filtered products count
  const totalPages = Math.ceil(productCount / resultPerPage);
  const page = parseInt(req.query.page) || 1;

  if (page > totalPages && productCount > 0) {
    return next(new ApiError(404, "This page does not exist"));
  }

  //Applying pagination after counting the products
  apiFeatures.pagination(resultPerPage);
  const products = await apiFeatures.query;

  if (!products || products.length === 0) {
    return next(new ApiError(404, "Sorry, Requested Product not found"));
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { products, productCount },
        "All Products fetched successfully"
      )
    );
});

const getProductByID = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  if (!productId) {
    return next(new ApiError(401, "Invalid Product ID"));
  }

  const product = await Product.findById(productId);

  if (!product) {
    return next(
      new ApiError(404, "Sorry, No product found with the request ID")
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, product, "Products fetched successfully"));
});

const updateProduct = asyncHandler(async (req, res, next) => {
  const { productID } = req.params;

  console.log(productID);

  if (!productID) {
    return next(
      new ApiError(404, "Error no product found with the particular details")
    );
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    productID,
    { $set: req.body },
    { new: true, runValidators: true }
  );

  if (!updatedProduct) {
    return next(new ApiError(401, "Invalid Product details"));
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedProduct,
        "Requested Product has been updated successfully"
      )
    );
});

const deleteProduct = asyncHandler(async (req, res, next) => {
  const { productID } = req.params;

  if (!productID) {
    return next(new ApiError(400, "Product ID is required"));
  }

  const deletedProduct = await Product.findByIdAndDelete(productID);

  if (!deletedProduct) {
    return next(new ApiError(404, "Product not found"));
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        "Requested product has been deleted successfully"
      )
    );
});

//Admin Controller for getting all the products
const getAllProductForAdmin = asyncHandler(async (req, res, next) => {
  const products = await Product.find().sort({ createdAt: -1 });

  if (!products || products.length === 0) {
    return next(new ApiError(404, "No products found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, products, "All products fetched Successfully"));
});

export {
  createProduct,
  deleteProduct,
  getAllProduct,
  getAllProductForAdmin,
  getProductByID,
  updateProduct,
};
