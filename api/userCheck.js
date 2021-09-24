const { auth } = require("../models");
const { tokenToJson } = require("./tokenToJson");
const { requestRefreshToken } = require("./requestRefreshToken");

exports.userCheck = async function (req, res, token, tokenArray) {
  try {
    const { userId, email, nickname, type, exp, iat, role, aud, iss } = token;
    await auth
      .findAll({
        where: { userId: userId },
      })
      .then((user_info) => {
        // 기존 유저
        if (user_info.length != 0) {
          auth.update(
            {
              userId: userId,
              email: email,
              nickname: nickname,
              type: type,
              exp: exp,
              iat: iat,
              role: role,
              aud: aud,
              iss: iss,
              is_logged: "1",
              refreshToken: tokenArray[2],
            },
            { where: { userId: userId } }
          );
        }
        // 신규 로그인 유저
        else {
          auth.create({
            userId: userId,
            email: email,
            nickname: nickname,
            type: type,
            exp: exp,
            iat: iat,
            role: role,
            aud: aud,
            iss: iss,
            is_logged: "1",
            refreshToken: tokenArray[2],
          });
        }

        console.log("DB 업데이트 완료 ");

        // Dashboard 이동
        res.redirect('/dashboard')
      });
  } catch (err) {
    console.log("에러");
    console.log(err);
  }
};
