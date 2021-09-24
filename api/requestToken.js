const axios = require('axios')


exports.requestToken = async (req, res) => {
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

    //   console.log(tokenArr);
      return tokenArr;
    });
  } catch (err) {
    console.log("토큰 요청 실패");
    console.log(err);
  }
};
