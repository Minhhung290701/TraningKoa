const Koa = require('koa');
const Router = require('koa-router');

const app = new Koa();
const router = new Router();


router.get("/", async (ctx, next) => {
  await next();
  ctx.body = 'hello world!';
});


router.get('/hello', async (ctx,next) => {
  await next();
  const _name = ctx.query.name;
  const text = _name? 'hello, ' + ctx.query.name + '!' : 'hello world!';
  return ctx.body = text;
});

app
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(3000, () => {
    console.log("Server run on port 3000");
});
