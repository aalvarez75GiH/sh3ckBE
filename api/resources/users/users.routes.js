const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const jwtAuthorization = passport.authenticate("jwt", { session: false });
const { v4: uuidv4 } = require("uuid");

const logger = require("../../../utils/logger");
const emailSender = require("../../../utils/emailSender").emailSenderModule;
const config = require("../../../config");
const validateUsers = require("./users.validate").validateUsers;
const validateUsersPicture = require("./users.validate").validateUserPicture;
const validateLoginRequest = require("./users.validate").validateLoginRequest;
const validateNewPINRequest = require("./users.validate").validateNewPINRequest;
const { saveUserPicture } = require("../../../aws/images.controller");
const usersRouter = express.Router();
const userController = require("./users.controller");
const processingErrors = require("../../libs/errorHandler").processingErrors;
const { ErrorHashingData } = require("./users.errors");

const transformBodyToLowerCase = (req, res, next) => {
  req.body.fullName && (req.body.fullName = req.body.fullName.toLowerCase());
  req.body.email && (req.body.email = req.body.email.toLowerCase());
  next();
};

usersRouter.get(
  "/",
  processingErrors((req, res) => {
    return userController.getUsers().then((users) => {
      res.json(users);
    });
  })
);

usersRouter.post(
  "/",
  [validateUsers, transformBodyToLowerCase],
  processingErrors(async (req, res) => {
    let newUser = req.body;
    let foundUser;

    foundUser = await userController.findUserByEmail({ email: newUser.email });

    if (foundUser) {
      logger.info(`User with email ${newUser.email} already registered...`);
      let dataUser = {
        name: foundUser.fullName,
        email: foundUser.email,
        phoneNumber: foundUser.phoneNumber,
        picture: foundUser.picture,
        role: foundUser.role,
      };
      res.status(409).send(dataUser);
      return;
    }
    const randomPIN = Math.floor(1000 + Math.random() * 9000);
    const PIN = randomPIN.toString();
    console.log(PIN);
    logger.info(PIN);
    bcrypt.hash(PIN, 10, async (error, hashedPIN) => {
      if (error) {
        logger.info(`Error trying hashing PIN...`);
        throw new ErrorHashingData();
      }
      await userController.createUser(newUser, hashedPIN);
      logger.info(`User with email [${newUser.email}] has been created...`);
      // *****************************************************
      const userCreationConfirmation = await userController.findUserByEmail({
        email: newUser.email,
      });
      logger.info(userCreationConfirmation);
      if (userCreationConfirmation) {
        let dataUser = {
          name: userCreationConfirmation.fullName,
          email: userCreationConfirmation.email,
          phoneNumber: userCreationConfirmation.phoneNumber,
          picture: userCreationConfirmation.picture,
          role: userCreationConfirmation.role,
        };
        emailSender("users", newUser.email, randomPIN);
        res.status(201).send(dataUser);
      } else {
        logger.error(`There was a problem with creation process at DB`);
        res
          .status(400)
          .send(
            `Ha ocurrido un problema al momento de crear el usuario en la Base de datos`
          );
      }
    });
  })
);

usersRouter.post(
  "/login",
  [validateLoginRequest, transformBodyToLowerCase],
  processingErrors(async (req, res) => {
    const notAuthUser = req.body;
    let foundUser;
    console.log(notAuthUser);

    foundUser = await userController.findUserForLogin({
      email: notAuthUser.email,
    });
    logger.info(`this is foundUser: ${foundUser}`);

    if (!foundUser) {
      logger.info(`User with email ${notAuthUser.email} was not found at DB`);
      res.status(400).send(`Amig@`);
      // res.status(400).send(`${notAuthUser.email}`)
      return;
    }

    const hashedPIN = foundUser.pin;
    let correctPIN;

    correctPIN = await bcrypt.compare(notAuthUser.pin, hashedPIN);

    if (correctPIN) {
      console.log("PIN correcto...");
      const token = jwt.sign({ id: foundUser.id }, config.jwt.secret, {
        expiresIn: 60 * 60 * 24 * 365,
      });
      logger.info(
        `User [${notAuthUser.email}] has been authenticated succesfully...`
      );
      res.status(200).send({ token });
      return;
    } else {
      let dataUser = {
        name: foundUser.fullName,
        email: foundUser.email,
        phoneNumber: foundUser.phoneNumber,
        picture: foundUser.picture,
        role: foundUser.role,
      };
      logger.info(
        `User with email ${foundUser.email} didn't complete authentication process`
      );
      res.status(400).send(dataUser);
    }
  })
);

usersRouter.put(
  "/:id",
  [validateUsers, transformBodyToLowerCase, jwtAuthorization],
  processingErrors(async (req, res) => {
    let role = req.user.role;
    let user = req.user.fullName;
    let token_id = req.user.token_id;
    let updatedUser = req.body;
    let foundUser;
    let id = req.params.id;

    foundUser = await userController.findOneUser(id);

    if (!foundUser) {
      logger.info(`foundUser: ${updatedUser}`);
      res.status(409).send(`User:${updatedUser} has not been found at DB...`);
      return;
    }

    if (role === "checker") {
      logger.info(
        `The user with name: ${user} does NOT have privileges to Update this collection`
      );
      res
        .status(403)
        .send(
          `Usuario ${user} sin privilégios suficientes para actualizar datos en esta colección`
        );
      return;
    }
    if (role === "user" && id === token_id) {
      await userController.updateUser(updatedUser, id);
      logger.info(`User with name "${foundUser.name}" has been updated at DB`);
      res
        .status(200)
        .send(
          `El usuario con nombre ${updatedUser.fullName} fué actualizado con éxito`
        );
      return;
    } else {
      logger.info(`Token NOT valid to update this user account`);
      res
        .status(404)
        .send(
          `El token usado no es valido o  No tiene privilegios para actiualizar esta cuenta`
        );
      return;
    }
  })
);

usersRouter.put(
  "/:id/pictures",
  [validateUsersPicture, jwtAuthorization],
  processingErrors(async (req, res) => {
    let id = req.params.id;
    let user = req.user.fullName;
    let role = req.user.role;
    let token_id = req.user.token_id;
    logger.info(role);
    logger.info(id);
    logger.info(token_id);
    logger.info(
      `Request from User [${user}] was received. We are processing image with category ID [${id}] `
    );
    let foundUser;
    foundUser = await userController.findOneUser(id);

    if (!foundUser) {
      logger.info(`foundUser: ${updatedUser}`);
      res.status(409).send(`User:${updatedUser} has not been found at DB...`);
      return;
    }

    if (role === "checker") {
      logger.info(
        `The user with name: ${user} does NOT have privileges to Update this collection`
      );
      res
        .status(403)
        .send(
          `Usuario ${user} sin privilégios suficientes para actualizar datos en esta colección`
        );
      return;
    }

    if (role === "user" && id === token_id) {
      logger.info(
        `User with name ${user} is going to proceed to update a User profile picture`
      );
      const randomizedName = `${uuidv4()}.${req.fileExtension}`;
      logger.info(randomizedName);
      const pictureURL = await saveUserPicture(req.body, randomizedName); //Amazon s3 process
      logger.info(`Picture URL: ${pictureURL}`);
      const userUpdated = await userController.savePictureUrl(id, pictureURL);
      logger.info(`User with ID [${id}] was updated with new picture link [${pictureURL}]
        changed by user [${user}]`);
      res.json(userUpdated);
      return;
    } else {
      logger.info(`Token NOT valid to update this user account`);
      res
        .status(404)
        .send(
          `El token usado no es valido o  No tiene privilegios para actiualizar esta cuenta`
        );
      return;
    }
  })
);

usersRouter.put(
  "/:email/newPIN",
  processingErrors(async (req, res) => {
    let email = req.params.email;
    logger.info(`user's email received: ${email}`);
    let foundUser;

    foundUser = await userController.findUserForPIN({ email: email });
    if (!foundUser) {
      let dataUser = {
        name: email,
        email: email,
      };
      logger.info(`User with email ${email} was not found at DB`);
      res.status(400).send(dataUser);
      return;
    }
    logger.info("FOUND USER:", foundUser);
    const randomPIN = Math.floor(1000 + Math.random() * 9000);
    const PIN = randomPIN.toString();
    logger.info("PIN:", PIN);
    bcrypt.hash(PIN, 10, async (error, hashedPIN) => {
      if (error) {
        logger.info(`Error trying hashing PIN...`);
        throw new ErrorHashingData();
      }
      let updatedUser = await userController.updateUserPIN(
        foundUser.id,
        hashedPIN
      );
      let dataUser = {
        name: foundUser.fullName,
        email: foundUser.email,
        phoneNumber: foundUser.phoneNumber,
        picture: foundUser.picture,
        role: foundUser.role,
      };
      logger.info("UPDATED USER:", updatedUser);
      emailSender("user_new_PIN", foundUser.email, randomPIN);
      res.status(200).send(dataUser);
    });
  })
);

usersRouter.get("/me", jwtAuthorization, (req, res) => {
  let dataUser = {
    name: req.user.fullName,
    email: req.user.email,
    phoneNumber: req.user.phoneNumber,
    picture: req.user.picture,
    role: req.user.role,
  };

  logger.info(`dataUser: ${dataUser.name}`);
  logger.info(`rol: ${dataUser.role}`);

  res.json(dataUser);
});

module.exports = usersRouter;
