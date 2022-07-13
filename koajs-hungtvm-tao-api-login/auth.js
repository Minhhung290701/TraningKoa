const jwtHelper = require("./jwt.helper");
const knex = require('knex')({
  client: 'mysql',
  version: '5.1.1',
  connection: {
    host : '127.0.0.1',
    port : 3306,
    user : 'root',
    password : '',
    database : 'list_user'
  }
});

const debug = console.log.bind(console);
// Biến cục bộ trên server này sẽ lưu trữ tạm danh sách token
// Trong dự án thực tế, nên lưu chỗ khác, có thể lưu vào Redis hoặc DB
let tokenList = {};
// Thời gian sống của token
const accessTokenLife = process.env.ACCESS_TOKEN_LIFE || "1h";
// Mã secretKey này phải được bảo mật tuyệt đối, các bạn có thể lưu vào biến môi trường hoặc file
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET || "refresh-token-secret-example-trungquandev.com-green-cat-a@";
// Thời gian sống của refreshToken
const refreshTokenLife = process.env.REFRESH_TOKEN_LIFE || "3650d";
// Mã secretKey này phải được bảo mật tuyệt đối, các bạn có thể lưu vào biến môi trường hoặc file
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || "refresh-token-secret-example-trungquandev.com-green-cat-a@";



const userAuthenticate = (ctx, next) => {
  if (ctx.request.headers.authorization  === "123token") {
      ctx.body = "done";
    return next()
  } else {
    ctx.body = 'Sai Token'
  }
}


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
  let users = await knex("users").where("username", userName);
  if (!userName || users.length == 0) {
      return (ctx.body = "username khong ton tai");
  } else {
    //Lấy đối tượng đầu tiên có username đã cho
    let user = users[0];
    if (user.password != passWord) {
        return (ctx.body = "Sai password");
    } else {
      // truyen vao object  và 2 thong so da lưu accessTokenSecret,accessTokenLife
      //  trong file jwt.helper ta da dinh  Định nghĩa những thông tin của user mà bạn muốn lưu vào token ở đây
      // const userData = {
      //     fullname: user.fullname,
      //     password: user.password,

      const accessToken = await jwtHelper.generateToken(
          user,
          accessTokenSecret,
          accessTokenLife
      );

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
  refreshToken,
  login,};
