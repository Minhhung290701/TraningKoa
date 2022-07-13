const jwtHelper = require("./jwt.helper");
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('./user')


const userAuthenticate = (ctx, next) => {
  if (ctx.request.headers.authorization  === "123token") {
    ctx.body = "done";
    return next()
  } else {
    return ctx.body = 'Sai Token'
  }
}


const userAuthenticateBearer = (ctx, next) => {
  let authorization = ctx.request.headers.authorization;
  //authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmdWxsbmFtZSI6Ik5ndXllbiBWYW4gQW4iLCJ1c2VybmFtZSI6ImFubnYiLCJiaXJ0aGRheSI6MjE0NzQ4MzY0NywiaWF0IjoxNjUwMjY2MDkxfQ.rh3zwxfTOw3udWWZmovlP9MibUN6G0nnchGJDWfv7og

  if (!authorization) {
    return ctx.body = 'Authorization is not define'
  }

  let [scheme, token] = authorization.split(' ');

  if (scheme !== 'Bearer') {
    return ctx.body = 'Token is not Bearer token';
  }
  try {
    const decoded = jwt.verify(token,'123token');
    ctx.state.user = decoded;
    console.log("done bearer")
    return next()
  }
  catch (e) {
    return ctx.body = "Error while verify token:"+ e;
  }
}


// Biến cục bộ trên server này sẽ lưu trữ tạm danh sách token
let tokenList = {};
// Thời gian sống của token
const accessTokenLife= "1h";
// Mã secretKey này phải được bảo mật tuyệt đối, các bạn có thể lưu vào biến môi trường hoặc file
const accessTokenSecret = "refresh-token-secret-example-trungquandev.com-green-cat-a@";
// Thời gian sống của refreshToken
const refreshTokenLife ="3650d";
// Mã secretKey này phải được bảo mật tuyệt đối, các bạn có thể lưu vào biến môi trường hoặc file
const refreshTokenSecret = "refresh-token-secret-example-trungquandev.com-green-cat-a@";

/**
 * controller
 * @param {*} ctx 
 */
 let refreshToken = async(ctx) => {
  // User gửi mã refresh token kèm theo trong body
  const refreshTokenFromClient = ctx.headers["x-access-token"];

  // Nếu như tồn tại refreshToken truyền lên và nó cũng nằm trong tokenList của chúng ta
  //  ( tim theo key valua voi key la frefreshToken truyền lên )
  if (refreshTokenFromClient && tokenList[refreshTokenFromClient]) {
      try {
          // Verify kiểm tra tính hợp lệ của cái refreshToken và lấy dữ liệu giải mã decoded
          const decoded = await jwtHelper.verifyToken(
              refreshTokenFromClient,
              refreshTokenSecret
          );
          // sau khi giai ma tra ve 1 doi tuong co field data luu data dc ma hoa
          // Thông tin user lúc này các bạn có thể lấy thông qua biến decoded.data
          const userData = decoded.data;

          const accessToken = await jwtHelper.generateToken(
              userData,
              accessTokenSecret,
              accessTokenLife
          );
          // gửi token mới về cho người dùng
          return (ctx.body = { accessToken });
      } catch (error) {
          ctx.body = error;
      }
  } else {
      ctx.body = "No token provided ";
  }
};



/**
 * controller login
 * @param {*} ctx 
 */
 const login = async(ctx, next) => {
  let userName = ctx.request.headers.username;  
  let passWord = ctx.request.headers.password;
  let users = [];
  const query = await User.find({username:userName})

  for(x of query) {
    users.push({
      fullname: x.fullname,
      username: x.username,
      password: x.password,
      birthday: x.birthday

    })
  }

  if (!userName || users.length == 0) {
      return (ctx.body = "username khong ton tai");
  } else {
    //Lấy đối tượng đầu tiên có username đã cho
    let user = users[0];
    if (user.password != passWord) {
        return (ctx.body = "Sai password");
    } else {

      delete users[0].password;
      const accessToken = jwt.sign(users[0],'123token')

      const refreshToken = await jwtHelper.generateToken(
          user,
          refreshTokenSecret,
          refreshTokenLife
      );
      // Lưu lại 2 mã access & Refresh token theo dang key valua vao doi tuong tokenlist,
      // với key chính là cái refreshToken để đảm bảo unique và không sợ hacker sửa đổi dữ liệu truyền lên.
      // lưu ý trong dự án thực tế, nên lưu chỗ khác, có thể lưu vào Redis hoặc DB
      tokenList[refreshToken] = { accessToken, refreshToken };
      return (ctx.body = { accessToken, user });
    }
  }
};



module.exports = {
  userAuthenticate ,
  userAuthenticateBearer,
  refreshToken,
  login,};
