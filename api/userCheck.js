const { auth } = require("../models");
const { tokenToJson } = require("./tokenToJson");
const { requestRefreshToken } = require("./requestRefreshToken");
const { IFFT } = require("@tensorflow/tfjs-core");

exports.userCheck = async function (req, res, token, tokenArray) {
  try {
    const { userId, email, nickname, type, exp, iat, role, aud, iss } = token;
    if(userId != undefined){ 
    return await auth
      .findAll({
        where: { userId: userId },
      })
      .then((user_info) => {
        // 기존 유저
        if (user_info.length != 0) {
        console.log('기존 유저 로그인')
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
          console.log("DB 업데이트 완료 ");

          // Dashboard 이동
          return res.redirect('/dashboard')
        }
        // 신규 로그인 유저
        else {
            console.log('신규 유저 로그인')
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

        console.log("DB 생성 완료 ");

        // Dashboard 이동
        return  res.redirect('/dashboard')
      });
    }else{
        throw `사용자 아이디를 확인할 수 없습니다.`
    }
  } catch (err) {
    console.log("에러");
    console.log(err);
  }
};
