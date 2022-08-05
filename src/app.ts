import dotenv from "dotenv";

const dotenvResult = dotenv.config();

if (process.env.NODE_ENV === "development" && dotenvResult.error) {
  throw dotenvResult.error;
}

import express from "express";
import bodyParser from "body-parser";
import rateLimiter from "express-rate-limit";
import helmet from "helmet";
import compression from "compression";

import * as http from "http";
import * as winston from "winston";
import * as expressWinston from "express-winston";
import cors from "cors";
import debug from "debug";
import { CommonRoutesConfig } from "./common/common.routes.config";
import { UsersRoutes } from "./users/users.routes.config";
import { AuthRoutes } from "./auth/auth.routes.config";
import { WalletRoutes } from "./wallet/wallets.routes.config";

const app: express.Application = express();
const server: http.Server = http.createServer(app);
const routes: CommonRoutesConfig[] = [];
const port = process.env.PORT || 5200;
const debugLog = debug("app");

app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 60,
  })
);

app.use(bodyParser.json({ limit: "31mb" }));
app.use(bodyParser.urlencoded({ limit: "31mb", extended: true }));
app.use(helmet());
app.use(cors());
app.use(compression());

const loggerOptions: expressWinston.LoggerOptions = {
  transports: [new winston.transports.Console()],
  format: winston.format.combine(
    winston.format.json(),
    winston.format.prettyPrint(),
    winston.format.colorize({ all: true })
  ),
};

if (!process.env.DEBUG) {
  loggerOptions.meta = false;
}

app.use(expressWinston.logger(loggerOptions));

routes.push(new UsersRoutes(app));
routes.push(new AuthRoutes(app));
routes.push(new WalletRoutes(app));

const runningMessage =
  process.env.NODE_ENV === "development"
    ? `Server running at http://localhost:${port}`
    : { statusCode: 200, message: "Server running..." };

app.get("/", (req: express.Request, res: express.Response) => {
  res.status(200).send(runningMessage);
});

export default server.listen(port, () => {
  routes.forEach((route: CommonRoutesConfig) => {
    debugLog(`Routes configured for ${route.getName()}`);
  });
  console.log(runningMessage);
});
