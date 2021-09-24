const axios = require("axios");



// GET 요청
const output = {
  // 토큰 요청 및 쿠키 생성
  tokenGet: async (req, res, next) => {
    if (STATE == res.req.query.state) {
      console.log("토큰 요청");
      // 토큰 요청
      tokenArray = await process.requestToken(req, res);

      console.log("-00");
      console.log(tokenArray);
      console.log("0341");

      // 쿠키 생성 (access_token을 expires_in만큼 쿠키 생성)
      res.cookie("token", tokenArray[0], {
        httpOnly: true,
        maxAge: 3600000,
      });

      console.log("쿠키 생성 완료");
      
      let token = req.cookies.token

      console.log(token)
      res.redirect('/dataAnalysisModels')

    //   let token = req.cookies.token;
    //   if (req.originalUrl === "/") {
    //     next();
    //   } else if (token === undefined) {
    //     res.redirect("/");
    //   } else {
    //     let tokenjson = await tokenToJson(req, res);
    //     let userId = tokenjson.userId;

    //     // DB에서 refresh_token이 있는지 확인, 있으면 refresh_token_result에 넣음
    //     let refreshTokenChecksql = await auth
    //       .findOne({ where: { user: userId }, attributes: ["refresh_token"] })
    //       .then((res) => {
    //         if (res != null) {
    //           return (refresh_token_result[0] = res["refresh_token"]);
    //         } else {
    //           console.log(err);
    //           return;
    //         }
    //       });

    //     // 토큰 만료시간이 10분 이하일 때 토큰 재발급
    //     if (
    //       tokenjson.exp - Math.floor(Date.now() / 1000) < 10 * 60 &&
    //       refresh_token_result.length !== 0
    //     ) {
    //       // 토큰 재발급 전 기존 쿠키 삭제
    //       res.clearCookie("token");
    //       // 토큰 재발급
    //       await requestRefreshToken(req, res, refresh_token_result[0]);
    //       console.log("토큰 재발급 완료");

    //       // Users DB의 Refresh_token을 Null로 만들기
    //       await auth.update(
    //         { refresh_token: null },
    //         { where: { user: userId } }
    //       );

    //       refresh_token_result.shift();
    //     }

    //     // 토큰 검증
    //     let publicKey = await requestPublicKey();
    //     let verifyOptions = {
    //       issuer: "urn:datahub:cityhub:security",
    //       algorithm: "RS256",
    //     };
    //     try {
    //       let decoded = jwt.verify(token, publicKey, verifyOptions);
    //       if (decoded.userId.length === 0 || decoded.userId === undefined) {
    //         console.log("토큰만료. 로그인창으로 이동");
    //         res.redirect("/");
    //       }
    //     } catch (err) {
    //       console.log(err);
    //     }
    //     next();
    //   }
    // }
    }else{
      console.log('보낸 STATE와 받은 STATE가 일치하지 않습니다. 즉, 로그인 실패')
    }
  },
};

const process = {
  requestToken: async (req, res) => {
    try {
      return axios({
        method: "post",
        url: `${OAUTHURL}/oauth2.0/token`,
        data: {
          grant_type: "authorization_code",
          code: res.req.query.code,
          redirect_uri: REDIRECT_URI,
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
        },
      }).then((result) => {
        const access_token = result.data.access_token;
        const expires_in = result.data.expires_in;
        const refresh_token = result.data.refresh_token;
        const refresh_expires_in = result.data.refresh_expires_in;

        const tokenArr = [
          access_token,
          expires_in,
          refresh_token,
          refresh_expires_in,
        ];

        console.log(tokenArr)
        return tokenArr;
      });
    } catch (err) {
      console.log("토큰 요청 실패");
      console.log(err);
    }
  },
  auth: async (req, res) => {
    try {
      console.log("오쓰");
      const { USERID, password } = req.body;
      const sql = "SELECT * FROM USERS WHERE USERID = ?";
      connection.query(sql, [USERID], async (error, results) => {
        // 일치하는 이메일을 찾고 true면 해당 이메일 값을 갖고 있는 index 정보 콘솔에 출력
        if (results.length == 0) {
          console.log("no user");
          return res.render("login/login.html", {
            message: "아이디가 존재하지 않습니다.",
          });
        } else if (
          !results ||
          !(await bcrypt.compare(password, results[0].PASSWORD))
        ) {
          console.log("not matched");
          return res.render("./auth/login", {
            message: "아이디와 비밀번호를 확인해주세요.",
          });
        } else {
          const USERID = results[0].USERID; // index 값
          const EMAIL = results[0].EMAIL;
          const AUTH = results[0].AUTH;

          // 해당 index에 토큰 발급
          const token = jwt.sign({ USERID, AUTH }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN, // 만료일 설정
          });

          // 쿠키 옵션
          const cookieOptions = {
            expires: new Date(
              Date.now() +
                process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000 * 7 // 7일
            ),
            httpOnly: true,
          };

          //쿠키 생성
          res.cookie("jwt", token, cookieOptions);
          res.cookie("USERID", USERID, cookieOptions);
          res.cookie("EMAIL", EMAIL, cookieOptions);
          console.log("login success...");

          // 쿠키 복호화
          var decoded_data = jwt.verify(token, process.env.JWT_SECRET);

          const findbytoken = function (token) {
            jwt.verify(
              token,
              process.env.JWT_COOKIE_EXPIRES,
              function (error, decoded_data) {
                decoded_data.USERID,
                  function (USERID, error) {
                    if (error) console.log(error);
                  };
              }
            );
          };
          res.status(200).redirect("/dashboard/list"); // login 성공하면 takeOutList로 이동
        }
      });
    } catch (error) {
      console.log(error);
    }
  },
};

module.exports = {
  output,
  process,
};
