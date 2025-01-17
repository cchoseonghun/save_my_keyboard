'use strict';

const TokensService = require('../services/tokens.service');
const UsersService = require('../services/users.service');
const TokenManager = require('./TokenManager');

module.exports = async (req, res, next) => {
  const tokensService = new TokensService();
  const usersService = new UsersService();

  console.log('path: ', req.path);

  const { accessToken, refreshToken } = req.cookies;

  if (!refreshToken || !accessToken) {
    // console.log('refreshToken 또는 accessToken가 쿠키 목록에 존재하지 않습니다.');
    return next();
  }

  const isAccessTokenValidate = TokenManager.validateAccessToken(accessToken);
  const isRefreshTokenValidate = TokenManager.validateRefreshToken(refreshToken);

  if (!isRefreshTokenValidate) {
    console.log('Refresh Token이 만료되었습니다.');
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return next();
  }

  let userId = -1;
  if (!isAccessTokenValidate) {
    const tokenInfo = await tokensService.findOneToken(refreshToken);

    if (!tokenInfo) {
      console.log('Refresh Token의 정보가 서버에 존재하지 않습니다. 모든 토큰 값을 제거합니다.');
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      return next();
    }

    const newAccessToken = await TokenManager.createAccessToken(tokenInfo.userId);
    res.cookie('accessToken', newAccessToken);

    userId = TokenManager.getAccessTokenPayload(newAccessToken).userId;
  } else {
    userId = TokenManager.getAccessTokenPayload(accessToken).userId;
  }
  const userInfo = await usersService.findUserById(userId);
  res.locals.userInfo = { id: userInfo.id, name: userInfo.name, point: userInfo.point, admin: userInfo.admin };
  next();
};
