'use strict';

const express = require('express');
const router = express.Router();

const multer = require('multer');
const moment = require('moment');
const storage = multer.diskStorage({
  destination: './src/public/uploads/orders',
  filename: function (req, file, cb) {
    file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
    cb(null, moment().format('YYYYMMDDHHmmss') + '_' + file.originalname);
  },
});

const OrdersController = require('../controllers/orders.controller');
const ordersController = new OrdersController();
const authMiddleware = require('../config/authMiddleware');

router.get('/', authMiddleware, ordersController.output_orders);
// router.get('/', ordersController.output_orderlists);

router.post('/', authMiddleware, multer({ storage: storage }).array('files'), ordersController.createOrder);

// 사장님 전체 목록 조회
router.get('/lists', authMiddleware, ordersController.getlists);
router.get('/mylist', authMiddleware, ordersController.getorders);

module.exports = router;
