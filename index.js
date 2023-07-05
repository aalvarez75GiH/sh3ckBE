const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");
const passport = require("passport");
const mongoose = require("mongoose");

const logger = require("./utils/logger");
const authJWT = require("./api/libs/auth");
// const usersAuth = require('./api/libs/auth').usersAuth
// const adminUsersAuth = require('./api/libs/auth').adminUsersAuth
const config = require("./config");
const errorHandler = require("./api/libs/errorHandler");
const fbPassportSetup = require("./api/libs/facebookAuth");

const intUsersRouter = require("./api/resources/interestedUsers/interestedUsers.routes");
const usersRouter = require("./api/resources/users/users.routes");
const extUsersRouter = require("./api/resources/externalUsers/extUsers.routes");
const citiesRouter = require("./api/resources/checkApp/city/city.routes");
const categoriesRouter = require("./api/resources/checkApp/category/category.routes");
const adminUsersRouter = require("./api/resources/adminApp/adminUsers/adminUsers.routes");
const serviceTimeRouter = require("./api/resources/checkApp/serviceTimes/serviceTime.routes");
const checkersRouter = require("./api/resources/checkApp/checkers/checkers.routes");
const checkTypesRouter = require("./api/resources/checkApp/checkTypes/checkTypes.routes");
const reviewsRouter = require("./api/resources/checkApp/reviewsAndComments/reviews.routes");
const authCentersRouter = require("./api/resources/checkApp/authCenters/authCenter.routes");
const paymentsRouter = require("./api/resources/checkApp/payments/payments.routes");
const transactionsRouter = require("./api/resources/checkApp/transactions/transactions.routes");

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.raw({ type: "image/*", limit: "3mb" }));
app.use(cors());

app.use(
  morgan("short", {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

passport.use(authJWT);
// passport.use(adminUsersAuth)
app.use(passport.initialize());

// *********** Data Base configuration ******************

const url = `mongodb+srv://sh3ckAdmin:Nm74sc84Cs97lc.@cluster0.ztfck.mongodb.net/sh3ckDB?retryWrites=true&w=majority`;

const connectionParams = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};
mongoose
  .connect(url, connectionParams)
  .then(() => {
    console.log("Connected to database ");
  })
  .catch((err) => {
    console.error(`Error connecting to the database. \n${err}`);
  });

// Local Mongo DB
// mongoose.connect('mongodb://localhost:27017/sh3ch')
// mongoose.connection.on('error', () => {
//     logger.error('Connection with DB failed...')
//     process.exit(1)
// })
// ******************************************************

app.use("/api/interestedUsers", intUsersRouter);
app.use("/api/users", usersRouter);
app.use("/api/extUsers", extUsersRouter);
app.use("/api/cities", citiesRouter);
app.use("/api/admin", adminUsersRouter);
app.use("/api/category", categoriesRouter);
app.use("/api/times", serviceTimeRouter);
app.use("/api/checkers", checkersRouter);
app.use("/api/checkTypes", checkTypesRouter);
app.use("/api/reviews", reviewsRouter);
app.use("/api/authCenters", authCentersRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/transactions", transactionsRouter);
app.use(errorHandler.processingDBErrors);
app.use(errorHandler.processingBodySizeErrors);

if (config.environmentConfiguration === "prod") {
  app.use(errorHandler.productionErrors);
} else {
  app.use(errorHandler.developmentErrors);
}

app.get("/", (req, res) => {
  res.send("Sh3ck API System 0.2");
});

const server = app.listen(port, () => {
  logger.info(`Server running at port ${port}`);
});

module.exports = {
  app,
  server,
};
