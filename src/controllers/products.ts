// import { Request, Response, NextFunction } from "express";
// import Product from "../models/product";
// import asyncWrapper from "../middleware/asyncWrapper";
// import { getNextFiltersProduct } from "../services/products/productService";

// import {
// //   isObjectEmpty,
//   logAggregationStages,
//   buildQueryObject,
//   handleRequest,
// } from "../helpers/utils";

// const addProduct = async (req: Request, res: Response) => {
//   const url = req.protocol + "://" + req.get("host");
//   const product = new Product({
//     title: req.body.title,
//     description: req.body.description,
//     imagePath: url + "/images/" + req.file!.filename,
//     rating: req.body.rating,
//     attributes: req.body.attributes,
//     price: req.body.price,
//   });

//   const productRecieved = await product.save();
//   res.status(201).json({
//     message: "Product added successfully",
//     product: {
//       id: productRecieved._id,
//       title: productRecieved.title,
//       description: productRecieved.description,
//       imagePath: productRecieved.imagePath,
//       rating: productRecieved.rating,
//       attributes: productRecieved.attributes,
//       price: productRecieved.price,
//     },
//   });
// };

// const getProducts = async (req: Request, res: Response) => {
//   const productsStatic = await Product.find().sort({ rating: 1 });

//   if (!productsStatic) {
//     throw new Error("No products");
//   } else {
//     res.status(200).json({
//       message: "successfully retrived products",
//       products: productsStatic,
//     });
//   }
// };

// const getAllTheQueryParametersByKeyAndValue = async (
//   req: Request,
//   res: Response
// ) => {
//   const queryParameters = await Product.find({
//     attributes: { $elemMatch: { key: "color", value: { $in: ["red"] } } },
//   });
//   if (!queryParameters) {
//     throw new Error("No query paramters");
//   } else {
//     res.status(200).json({
//       message: "successfully retrived queryies",
//       queryParameters: queryParameters,
//     });
//   }
// };

// const templateGetAllTheQueryParameters = async (
//   req: Request,
//   res: Response
// ) => {
//   const sanitizedQueryParams = handleRequest(req);
//   const selectedFilters = buildQueryObject(sanitizedQueryParams);
//   const result = await getNextFiltersProduct(selectedFilters);
//   res.status(200).json({
//     message: "succesfully got all the query parameters",
//     result: result,
//   });
// };

// const sanitizeAndValidateQuery = async (req: Request,res : Response,next : NextFunction)=>{
//   const sanitizedQueryParams = handleRequest(req);
  

// }


// const getAllTheQueryParametrs = async (req: Request, res: Response) => {
//   // const selectedFilters = {
//   //   categories: ["Electronics", "Clothing"],
//   //   priceRange: { min: 50, max: 200 },
//   //   test: ["value2"],
//   //   // Add other filters as needed
//   // };
//   // Iterate over query parameters using Object.keys
//   // const selectedFilters = buildQueryObject(req.query);
//   // console.log("Request query object", selectedFilters);
//   // const aggregationPipeLine : mongoose.PipelineStage[] = [
//   //   {
//   //     $unwind: "$attributes",
//   //   },
//   //   {
//   //     $unwind: "$attributes.value",
//   //   },
//   // ];
//   // if (isObjectEmpty(selectedFilters)) {
//   //   //code for retrieveing all the fucking query posibilities
//   //   aggregationPipeLine.push({
//   //     $group: {
//   //       _id: {
//   //         key: "$attributes.key",
//   //         value: "$attributes.value",
//   //       },
//   //       count: { $sum: 1 },
//   //     },
//   //   });
//   //   aggregationPipeLine.push({
//   //     $project: {
//   //       _id: 0,
//   //       key: "$_id.key",
//   //       value: "$_id.value",
//   //       count: 1,
//   //     },
//   //   });
//   // } else {
//   //   if (selectedFilters.hasOwnProperty("priceRange")) {
//   //     const { min, max } = selectedFilters.priceRange;
//   //     aggregationPipeLine.push({
//   //       $match: { price: { $gte: min, $lte: max } },
//   //     });
//   //   }
//   // }
//   // if (!isObjectEmpty(selectedFilters)) {
//   //   const iterableSelectedFilters = Object.keys(selectedFilters);
//   //   const objectQueryNotContained = {};
//   //   objectQueryNotContained['$match'] = selectedFilters;
//   //   console.log(objectQueryNotContained)
//   //   //aggregationPipeLine.push(objectQueryNotContained)
//   //   iterableSelectedFilters.forEach((key) => {
//   //     if (key === "priceRange") {
//   //       const { min, max } = selectedFilters.priceRange;
//   //       aggregationPipeLine.push({
//   //         $match: { price: { $gte: min, $lte: max } },
//   //       });
//   //     } else if (key === "categories") {
//   //       if (Array.isArray(selectedFilters[key])) {
//   //         aggregationPipeLine.push({
//   //           $match: {
//   //             [key]: { $in: selectedFilters[key] },
//   //           },
//   //         });
//   //       } else {
//   //         aggregationPipeLine.push({
//   //           $match: {
//   //             [key]: selectedFilters[key],
//   //           },
//   //         });
//   //       }
//   //     } else {
//   //       if (Array.isArray(selectedFilters[key])) {
//   //         aggregationPipeLine.push({
//   //           $match: {
//   //             "attributes.key": key,
//   //             "attributes.value": { $in: selectedFilters[key] },
//   //           },
//   //         });
//   //       } else {
//   //         aggregationPipeLine.push({
//   //           $match: {
//   //             "attributes.key": key,
//   //             "attributes.value": selectedFilters[key],
//   //           },
//   //         });
//   //       }
//   //     }
//   //   });
//   // }
//   // const minMaxPricePipeline = [
//   //   {
//   //     $group: {
//   //       _id: null,
//   //       minPrice: { $min: "$price" },
//   //       maxPrice: { $max: "$price" },
//   //     },
//   //   },
//   //   {
//   //     $project: {
//   //       _id: 0,
//   //       minPrice: 1,
//   //       maxPrice: 1,
//   //     },
//   //   },
//   // ];
//   // await Product.aggregate(
//   //   [
//   //     {
//   //       $facet: {
//   //         attributesFilltered: aggregationPipeLine,
//   //         minMaxPriceFilltered: minMaxPricePipeline,
//   //       },
//   //     },
//   //   ],
//   //   (err, result) => {
//   //     if (err) {
//   //       console.log("erroare plm");
//   //       res.status(500).json({
//   //         err: err,
//   //       });
//   //     }
//   //     console.log(result[0]);
//   //     res.status(200).json({
//   //       message: "success ",
//   //       attributes: result[0].attributesFilltered,
//   //       priceRange: result[0].minMaxPriceFilltered[0],
//   //     });
//   //   }
//   // );
//   // try {
//   //   console.log(aggregationPipeLine);
//   //   const result = await logAggregationStages(Product, aggregationPipeLine);
//   //   console.log("result is ", result);
//   //   res.status(200).json({
//   //     message: "success ",
//   //     attributes: [],
//   //     priceRange: [],
//   //   });
//   // } catch (err) {
//   //   console.log(err);
//   //   res.status(500).send("Internal Server Error");
//   // }
// };

// const deleteAllProducts = asyncWrapper(async (req: Request, res: Response) => {
//   console.log(req.query);
//   //return next(new Error('asdf'));
//   // const result = await Product.deleteMany({});
//   // console.log(`${result.deletedCount} products deleted`);
// });
// module.exports = {
//   addProduct,
//   getProducts,
//   getAllTheQueryParametersByKeyAndValue,
//   getAllTheQueryParametrs,
//   deleteAllProducts,
//   templateGetAllTheQueryParameters,
// };
