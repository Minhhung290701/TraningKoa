const userAuthenticate = (ctx, next) => {
  if (ctx.request.headers.authorization  === "123token") {
    return next()
  } else {
    ctx.body = 'Sai Token'
  }
}

module.exports = userAuthenticate
