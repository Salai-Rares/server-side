import "reflect-metadata";
import { InversifyExpressServer } from "inversify-express-utils";
import express, { Application } from "express";
import path from "path";
import { container } from "./container";
import { GlobalErrorHandler } from "./middleware/error-handler/error-handler";
import { TYPES } from "@/shared/types";
import { corsMiddleware } from "./middleware/cors/cors.middleware";
import { expressLoggingMiddleware } from "./middleware/logging.middleware";


// Initialize Inversify server
const server = new InversifyExpressServer(container);

// Configure middleware
server.setConfig((app: Application) => {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(corsMiddleware); // Define this elsewhere or import
  app.use("/images", express.static(path.join(__dirname, "images")));
  app.use(expressLoggingMiddleware)
});

// Configure error handling
server.setErrorConfig((app: Application) => {
  const errorHandler = container.get<GlobalErrorHandler>(TYPES.GlobalErrorHandler);
  app.use(errorHandler.handle);
});

// Export the app (without starting it)
export const app = server.build();