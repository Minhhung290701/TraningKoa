const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const Auth = require('./auth')

const app = new Koa();
const router = new Router({
    prefix:'/users',
})

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

app.use(Auth.userAuthenticate);

router.post("/login", Auth.login);

router.get('/', async (ctx, next) => {
    let data = await knex.select('*').from('users');
    ctx.body = data;
    next();
})


router.get('/:id', async (ctx, next) => {
    let user = await knex('users').select("*").where('id',ctx.params.id);
    ctx.body = user.length == 0 ? "Khong tim thay user" : user;
    next();
})


router.post('/', async (ctx,next) => {
    let maxid = 0;
    let rows = await knex.select('id').from('users');
    for(x of rows) {
        if(x.id > maxid) maxid = x.id;
    }
    let newuser = {
        id: maxid+1,
        //fullname: ctx.request.body.fullname,
        //username: ctx.request.body.username,
        //password: ctx.request.body.password,
        //birthday: ctx.request.body.birthday
        fullname : "Nguyen Van An",
        username : "annv",
        password : "password2",
        birthday : new Date("1991-01-02").getTime(),
    }
    await knex('users').insert([newuser]).then(()=>{
        ctx.body = newuser;
    }).catch();
    next();
})


router.delete('/:id', async (ctx, next) => {
    await knex.select('id').from('users').where('id',ctx.params.id).then((rows) => {
        if(rows.length > 0) {
            knex('users').del().where('id',ctx.params.id).then(ctx.body = "Done");
        }
        else ctx.body = "Khong tim thay user";
    }).catch();
    next();
})


router.put('/:id', async (ctx, next) => {
    await knex.select('id').from('users').where('id',ctx.params.id).then((rows) => {
        if(rows.length > 0) {
            user_update = {
                id:ctx.params.id,
                //fullname: ctx.request.body.fullname,
                //username : ctx.request.body.username,
                //password : ctx.request.body.password,
                //birthday : ctx.request.body.birthday,
                fullname: "Nguyen Kim Anh",
                username: "anhnk",
                password: "password3",
                birthday: new Date("1992-01-03").getTime(),
            }
            knex('users').where('id',ctx.params.id)
                        .update(user_update)
                        .then(ctx.body = user_update);
        }
        else ctx.body = "Khong tim thay user";
    }).catch();
    next();
})






app
    .use(router.routes())
    .use(router.allowedMethods)
    .use(bodyParser());

app.listen(3000, ()=>{
    console.log("App run on port 3000")
})