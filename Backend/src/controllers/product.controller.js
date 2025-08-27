import { Product } from "../models/product.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js";

//generate SKU ---> Stock Keeping Unit

const generateSKU = async (category) => {
    //count how many product is already present in the product category
    const count = await Product.countDocuments({ productCategory: category });

    return `${category.toUpperCase()}-${String(count + 1).padStart(4, "0")}`
}

const createProduct = asyncHandler(async (req, res, next) => {
    const { productName, productDescription, productPrice, productCategory, stock } = req.body;

    const sku = await generateSKU(productCategory);

    const existingProduct = await Product.findOne(
        {
            productName,
            productDescription
        }
    )

    if (existingProduct) {
        return next(new ApiError(409, "Product with the same details already exits"));
    }


    const product = await Product.create({
        sku,
        productName,
        productDescription,
        productPrice,
        productCategory,
        stock
    })

    if (!product) {
        return next(new ApiError(500, "fail to create a product"));
    }
    
    return res
        .status(201)
        .json(
            new ApiResponse(201, product, "Product has been created Successfully")
        )
})

const getAllProduct = asyncHandler(async (req, res, next) => {
    const allProduct = await Product.find();

    if (!allProduct) {
        return next(new ApiError(500, "Failed to Fetch the Products"));
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, allProduct, "All Products fetched successfully")
        )
})

const updateProduct = asyncHandler(async (req, res, next) => {
    const { productID } = req.params;

    console.log(productID);

    if (!productID) {
        return next(new ApiError(404, "Error no product found with the particular details"));
    }

    const updatedProduct = await Product.findByIdAndUpdate(
        productID,
        { $set: req.body },
        { new: true, runValidators: true }
    )

    if (!updatedProduct) {
        return next(new ApiError(401, "Invalid Product details"));
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedProduct, "Requested Product has been updated successfully")
        )

})

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
            new ApiResponse(200, {}, "Requested product has been deleted successfully")
        );
});


export { createProduct, getAllProduct, updateProduct, deleteProduct }