'use strict';

require('dotenv').config();
const bcrypt = require('bcrypt');

const UsersRepository = require('../repositories/users.repository');
const TokensRepository = require('../repositories/tokens.repository');
const OrdersRepository = require('../repositories/orders.repository');
const TokenManager = require('../config/TokenManager');
const PaginationManager = require('../config/PaginationManager');
const { User, Token, Order } = require('../sequelize/models');

class UsersService {
  usersRepository = new UsersRepository(User);
  tokensRepository = new TokensRepository(Token);
  ordersRepository = new OrdersRepository(Order);

  createUser = async (email, password, name, phone, address, admin, point) => {
    try {
      const user = await this.findOneUser(email);
      if (user) {
        return { code: 401, message: '이미 가입된 이메일입니다.' };
      }

      password = await this.encryptPassword(password);

      const result = await this.usersRepository.createUser(email, password, name, phone, address, admin, point);
      const response =
        result > 0
          ? { code: 201, message: '회원 가입에 성공하였습니다.' }
          : { code: 500, message: '회원 가입에 실패하였습니다.' };
      return response;
    } catch (err) {
      console.log('users.service error: ', err);
      return { code: 500, message: '회원 가입에 실패하였습니다.' };
    }
  };

  login = async (email, password) => {
    try {
      const user = await this.findOneUser(email);
      if (!user) {
        return { code: 401, message: '이메일 또는 비밀번호를 확인해주세요.' };
      }

      if (!(await this.checkPassword(password, user.password))) {
        return { code: 401, message: '이메일 또는 비밀번호를 확인해주세요.' };
      }

      // 로그인 토큰 처리
      const accessToken = await TokenManager.createAccessToken(user.id);
      const refreshToken = await TokenManager.createRefreshToken();

      // refreshToken 저장
      const result = await this.tokensRepository.saveToken(refreshToken, user.id);

      const response =
        result > 0
          ? { code: 200, accessToken, refreshToken, message: '로그인 되었습니다.' }
          : { code: 500, message: '로그인에 실패하였습니다.' };
      return response;
    } catch (err) {
      console.log('users.service error: ', err);
      return { code: 500, message: '로그인에 실패하였습니다.' };
    }
  };

  findOneUser = async (email) => {
    return await this.usersRepository.findOneUser(email);
  };

  findUserById = async (id) => {
    return await this.usersRepository.findUserById(id);
  };

  encryptPassword = async (password) => {
    const saltRounds = parseInt(process.env.BCRYPT_SALT);
    return new Promise((resolve, reject) => {
      bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          resolve(hash);
        }
      });
    });
  };

  checkPassword = async (beforePassword, afterPassword) => {
    return new Promise((resolve, reject) => {
      bcrypt.compare(beforePassword, afterPassword, (err, result) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  };

  getOrderStatusZeroToThree = async (ownerId) => {
    const data = await this.ordersRepository.getOrderStatusZeroToThree(ownerId);
    return { code: 200, data: data[0] };
  };

  getOrdersStatusEnd = async (ownerId, page) => {
    const data = await this.ordersRepository.getOrdersStatusEnd(ownerId, page);
    const getOrdersStatusEndCountAllReturnValue = await this.ordersRepository.getOrdersStatusEndCountAll(ownerId);
    const count_all = getOrdersStatusEndCountAllReturnValue[0].count_all;

    const paginationManager = new PaginationManager(page, count_all);

    return { code: 200, data, pagination: paginationManager.render() };
  };
}

module.exports = UsersService;
