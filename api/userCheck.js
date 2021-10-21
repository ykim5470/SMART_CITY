const { auth } = require("../models");

exports.userCheck = async function (req, res, token, tokenArray) {
  try {
    const { userId, email, nickname, type, exp, iat, role, aud, iss } = token;

    if (userId != undefined) {
       await auth
        .findAll({
          where: { userId: userId },
        })
        .then(async (user_info) => {
          // 기존 유저
          if (user_info.length != 0) {
            await auth.update(
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
                refreshToken: tokenArray[2],
              },
              { where: { userId: userId } }
            );
          }
          // 신규 로그인 유저
          else {
            await auth.create({
              userId: userId,
              email: email,
              nickname: nickname,
              type: type,
              exp: exp,
              iat: iat,
              role: role,
              aud: aud,
              iss: iss,
              refreshToken: tokenArray[2],
            });
          }
        });
    } else {
      throw `사용자 아이디를 확인할 수 없습니다.`;
    }

    // Route controller
    if(type == 'userSystem')
    res.redirect(`/dashboard?userId=${userId}`)
    else if(type == 'adminSystem'){
      res.redirect(`/admin/dashboard?userId=${userId}`)
    }else{
      throw 'Not valid account type'
    }

  } catch (err) {
    console.log(err);
  }
};
