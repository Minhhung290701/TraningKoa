const Koa = require('koa');
const Router = require('@koa/router');
const bodyParser = require('koa-bodyparser');
const fs = require('fs');
const { off } = require('process');

const app = new Koa();
const router = new Router({
    prefix:'/users',
});

const json_users_file = "./data/users.json";


function json_to_array() {
    var array_user = [];
    let json_user = fs.readFileSync(json_users_file).toString();
    if(json_user!= null) {
        array_user = JSON.parse(json_user);
    }
    return array_user; 
}


function rewriteArrayToFile(arr) {
    var stringifyUser = JSON.stringify(arr);
    fs.writeFileSync(json_users_file, stringifyUser, "utf-8");
}

router.get('/',(ctx, next) => {
    ctx.body = json_to_array();
    next();
})


router.get('/:id',(ctx,next) => {
    let list_user = json_to_array();
    let check = false;
    for(x of list_user) {
        if(x.id == ctx.params.id) {
            ctx.body = x;
            check = true;
            break;
        }
    }
    if(check == false) {
        ctx.body = "Khong tim thay User"
    }
    next();
})

router.delete('/:id',(ctx, next) => {
    let check = false;
    let list_user = [];
    list_user = json_to_array();
    for(x of list_user) {
        if(x.id == ctx.params.id) {
            list_user.splice(list_user.findIndex(y =>  y == x ),1);
            check = true;
            rewriteArrayToFile(list_user);
            break;
        }
    }
    if(check == false) {
        ctx.body = "Error";
    }
    else ctx.body = "Done";
    next();
})




router.post('/', (ctx, next)=>{
    let check = false;
    let list_user = [];
    let maxid = 0;
    list_user = json_to_array();
    for(x of list_user) {
        if(x.id > maxid) maxid = x.id;
    }

    let new_user = {
        id: maxid + 1,
        //fullname: "Nguyen Van An",
        //username: "annv",
        //password: "password2",
        //birthday: new Date("1991-01-02").getTime()
        fullname: ctx.request.body.fullname,
        username: ctx.request.body.username,
        password: ctx.request.body.password,
        birthday: ctx.request.body.birthday
    };

    list_user.push(new_user);
    ctx.body = new_user;
    rewriteArrayToFile(list_user);
    next();
}) 

router.put('/:id', (ctx,next)=> {
    let check = false;
    let list_user = json_to_array();
    for(x of list_user) {
        if(x.id == ctx.params.id) {
            //x.fullname = ctx.request.body.fullname;
            //x.username = ctx.request.body.username;
            //x.password = ctx.request.body.password;
            //x.birthday = ctx.request.body.birthday;
            x.fullname = "Nguyen Van An";
            x.username = "annv";
            x.password = "password2";
            x.birthday = new Date("1991-01-02").getTime();
            check = true;
            ctx.body = x;
            rewriteArrayToFile(list_user);
            break;
        }
    }
    if(!check) {
        ctx.body = "Erro";
    }
})


app
    .use(router.routes())
    .use(router.allowedMethods())
    .use(bodyParser());
    
app.listen(3000,()=>{
    console.log('Server run on port 3000');
})