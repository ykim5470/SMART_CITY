const axios = require("axios");

exports.requestLogout = async function (req, res) {
  let token = req.cookies.token;
  let tokenBase64 = token.split(".")[1];

  let tokenStr = Buffer.from(tokenBase64, "base64").toString("ascii"); // 복호화
  let tokenJson = JSON.parse(tokenStr); // string -> json

  try {
    return axios({
      method: "post",
      headers: { Authorization: "Bearer " + req.cookies.token },
      url: `${OAUTHURL}/security/logout`,
      data: {
        userId: tokenJson.userId,
      },
    }).then((result) => {
      return result;
    });
  } catch (err) {
    console.log(err);
  }
};
