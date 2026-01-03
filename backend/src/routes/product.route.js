import express from "express";
import {
  importProducts,
  getFilterProducts,
  getproducts,
  getRandomProducts,
  getCategorizedProducts,
  getProductsById,
  searchProducts,
} from "../controllers/product.controller.js";

const router = express.Router();

router.get("/get-products", getproducts);
router.post("/import-products", importProducts);
router.get("/get-random-products", getRandomProducts);
router.get("/get-filter-products", getFilterProducts);
router.get("/get-categorized-products", getCategorizedProducts);
router.post("/get-products-by-ids", getProductsById);
router.get("/search-products", searchProducts);
export default router;
