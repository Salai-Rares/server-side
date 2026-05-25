import "reflect-metadata";
import { InversifyExpressServer } from "inversify-express-utils";
import express, { Application } from "express";
import path from "path";
import { apiContainer } from "./infrastructure/di/container.api";
import { GlobalErrorHandler } from "./middleware/error-handler/error-handler";
import { TYPES } from "@/shared/types";
import { corsMiddleware } from "./middleware/cors/cors.middleware";
import { expressLoggingMiddleware } from "./middleware/logging.middleware";
import { sessionMiddleware } from "./middleware/http/session.middleware";
import { ensureGuestSessionMiddleware } from "./middleware/http/ensure-guest-session.middleware";


// Initialize Inversify server
const server = new InversifyExpressServer(apiContainer);

// Configure middleware
server.setConfig((app: Application) => {
  app.use(expressLoggingMiddleware)
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(corsMiddleware); // Define this elsewhere or import
  app.use(sessionMiddleware);
  app.use(ensureGuestSessionMiddleware); // Define this middleware to create a session for guests
  app.use("/images", express.static(path.join(__dirname, "images")));

});

// Configure error handling
server.setErrorConfig((app: Application) => {
  const errorHandler = apiContainer.get<GlobalErrorHandler>(TYPES.GlobalErrorHandler);
  app.use(errorHandler.handle);
});





// Export the app (without starting it)
export const app = server.build();