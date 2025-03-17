import "reflect-metadata"; // Required for InversifyJS
import { InversifyExpressServer } from "inversify-express-utils";
import { container } from "./container"; // Import Inversify container
import dotenv from "dotenv";
import express, { Application, Request, Response, NextFunction } from "express";
import path from "path";
import "express-async-errors"; // For handling async errors
import RedisClient from "./db/redis/redisClient";
import connectDB from "./db/connect";
// import productsRoutes from "./routes/products";
// import KeyAttributesCache from "./services/cache/uniqueKeysAttributesCache";

// import {EventEmitter} from "events"
import { waitForMultipleEvents } from "./helpers/EventEmitterUtils";

// Import controllers (auto-register in Inversify)
import "./controllers/product.controller";
import { TYPES } from "./types";
import { GlobalErrorHandler } from "./middleware/error-handler";
import { ValidateAndSanitizeQueryFilters } from "./middleware/products/product.middleware";
// Load environment variables
dotenv.config();
  const appExpress: Application = express();
// const app: Application = express(); // Explicitly typed as Application (from Express)
const port: number = parseInt(process.env.PORT || "3000", 10);

// // Middleware
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
// app.use("/images", express.static(path.join(__dirname, "images"))); // Use __dirname for absolute path

// CORS Middleware (converted to a function for reuse)
const corsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS"
  );
  next();
};

// export const eventEmitter = new EventEmitter();
// Redis client setup
// const redisClient = RedisClient.getInstance();

// const keyAttributesCache = new KeyAttributesCache(redisClient);
// (async () => {
//   try {
//     console.log('Waiting for both events...');
//     const [result1, result2] = await waitForMultipleEvents(eventEmitter, [{eventName:'event1'}, {eventName:'event2',timeoutThreshold: 10000}]);
//     console.log('Both events were emitted:', result1, result2);
//   } catch (error) {
//     console.error('Error waiting for events:', error);
//   }
// })();

// Routes
// app.use("/api/v1/products", productsRoutes(keyAttributesCache));
// Create Inversify Server


const server = new InversifyExpressServer(container);

server.setConfig((app) => {
  app.use(corsMiddleware); // cors should be first
  app.use(express.json()); // body parser
  app.use(express.urlencoded({ extended: false }));
  app.use("/images", express.static(path.join(__dirname, "images")));
  // app.use("/api/v1/products/queryies", (req, res, next) => {
  //   container
  //     .get<ValidateAndSanitizeQueryFilters>(TYPES.ValidateAndSanitizeQueryFilters)
  //     .handle(req, res, next);
  // });
});
// Apply error-handling middleware
server.setErrorConfig((app) => {
  const errorHandler = container.get<GlobalErrorHandler>(
    TYPES.GlobalErrorHandler
  );
  app.use(errorHandler.handle.bind(errorHandler)); // ✅ Ensures `this` refers to class instance
});
const app = server.build();
// // Error handling middleware
// app.use(errorHandlerMiddleware);

// Start the server
const start = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in environment variables.");
    }
    await connectDB(process.env.MONGO_URI);
    // eventEmitter.emit('event2')
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.error("Error starting the server:", error);
  }
};

start();
