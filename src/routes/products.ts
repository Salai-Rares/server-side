// import express, { Router, Request, Response } from "express";
// import multer, { StorageEngine } from "multer";
// import AttributesKeysCache from "../services/cache/uniqueKeysAttributesCache";
// // Custom type for file filtering
// interface FileFilterCallback {
//   (error: Error | null, acceptFile: boolean): void;
// }

// const {
//   addProduct,
//   getProducts,
//   getAllTheQueryParametrs,
//   deleteAllProducts,
//   templateGetAllTheQueryParameters,
// } = require("../controllers/products");

// const router = express.Router();

// const MIME_TYPE_MAP: { [key: string]: string } = {
//   "image/png": "png",
//   "image/jpeg": "jpg",
//   "image/jpg": "jpg",
// };

// const storage: StorageEngine = multer.diskStorage({
//   destination: (
//     req: Request,
//     file: Express.Multer.File,
//     cb: (error: Error | null, destination: string) => void
//   ) => {
//     const isValid = MIME_TYPE_MAP[file.mimetype];
//     let error: Error | null = new Error("Invalid mime type");
//     if (isValid) {
//       error = null;
//     }
//     cb(error, "./images");
//   },
//   filename: (
//     req: Request,
//     file: Express.Multer.File,
//     cb: (error: Error | null, filename: string) => void
//   ) => {
//     const name = file.originalname.toLowerCase().split(" ").join("-");

//     const ext = MIME_TYPE_MAP[file.mimetype];
//     cb(null, `${name}-${Date.now()}.${ext}`);
//   },
// });
// const routerHandler = (redisClient : AttributesKeysCache) => {
//   router
//     .route("/")
//     .post(multer({ storage: storage }).single("image"), addProduct);
//   router.route("/").get(getProducts);
//   router
//     .route("/queryies")
//     .get(templateGetAllTheQueryParameters);
//   router.route("/delete").delete(deleteAllProducts);
//   return router;
// };

// export default routerHandler;
