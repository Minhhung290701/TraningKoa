const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const Auth = require('./auth')
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const app = new Koa();
const router = new Router({
    prefix:'/users',
})

dotenv.config();

var User = require('./user')

mongoose.connect(process.env.mongo_uri);


app.use(Auth.userAuthenticateBearer);

router.post("/login", Auth.login);

router.get('/', async (ctx, next) => {
    let data = await User.find();
    ctx.body = data;
    next();
})


router.get('/:id', async (ctx, next) => {
    let user = await User.find({id:ctx.params.id}).exec();
    ctx.body = user.length == 0 ? "Khong tim thay user" : user;
    next();
})


router.post('/', async (ctx,next) => {
    let maxid = 0;
    let rows = await User.find({id: ctx.params.id})
    for(x of rows) {
        if(x.id > maxid) maxid = x.id;
    }
    let newuser = {
        _id : mongoose.Types.ObjectId(),
        id: maxid+1,
        fullname: ctx.request.body.fullname,
        username: ctx.request.body.username,
        password: ctx.request.body.password,
        birthday: ctx.request.body.birthday
        /* fullname : "Nguyen Van An",
        username : "annv",
        password : "password2",
        birthday : new Date("1991-01-02").getTime(), */
    }
    await newuser.save();
    ctx.body = "Done";
    next();
})




router.delete('/:id', async (ctx, next) => {
    if((await User.find({id : ctx.params.id})).length == 0) return ctx.body = 'Khong tim thay user'
    await User.deleteMany({id:ctx.params.id})
    return ctx.body = 'Done'
})


router.put('/:id', async (ctx, next) => {
    let filter = {
        id:ctx.params.id,
    }

    let user_update = {
        id:ctx.params.id,
        fullname: ctx.request.body.fullname,
        username : ctx.request.body.username,
        password : ctx.request.body.password,
        birthday : ctx.request.body.birthday,
/*         fullname: "test1",
        username: "test1",
        password: "test",
        birthday: new Date("1992-01-03").getTime(), */
    }
    if((await User.find({id:ctx.params.id})).length == 0 ){
        ctx.body = 'Khong tim thay user'
    }
    else {
        User.findOneAndUpdate(filter,user_update,()=>{})
        ctx.body = user_update
    }
    
    next();
})




app
    .use(router.routes())
    .use(router.allowedMethods)
    .use(bodyParser());

app.listen(3000, ()=>{
    console.log("App run on port 3000")
})