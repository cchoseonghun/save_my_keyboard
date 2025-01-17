'use strict';

const express = require('express');
const router = express.Router();

const loginCheckMiddleware = require('../config/loginCheckMiddleware');
const authMiddleware = require('../config/authMiddleware');

const UsersController = require('../controllers/users.controller');
const usersController = new UsersController();

router.post('/register', loginCheckMiddleware, usersController.createUser);

router.post('/login', loginCheckMiddleware, usersController.login);

router.get('/logout', usersController.logout);

router.get('/order', authMiddleware, usersController.getOrderStatusZeroToThree);

router.get('/mypage', authMiddleware, usersController.getOrdersStatusEnd);

module.exports = router;
