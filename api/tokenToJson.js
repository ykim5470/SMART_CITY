const base64 = require('base-64')

exports.tokenToJson = async function (req, res, access_token) {
  try {
    // const token = await req.cookies.token;
    const token = access_token

    let tokenBase64 = token.split('.')[1]
    let tokenStr = base64.decode(tokenBase64) // 복호화
    let tokenToJson = JSON.parse(tokenStr)
    return tokenToJson
  } catch (error) {
    console.log(error)
    res.redirect('/')
  }
}
