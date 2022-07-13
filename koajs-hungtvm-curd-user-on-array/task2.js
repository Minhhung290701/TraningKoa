const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require("koa-bodyparser");

const app = new Koa();
const router = new Router(
    {prefix:"/Users"}
);

var list_user = [{
    id: 1,
    fullname: "Nguyen Gia Kien",
    username: "kienng1",
    password: "password1",
    birthday: new Date("1990-01-01").getTime(),
},
{
    id: 2,
    fullname: "Nguyen Van An",
    username: "annv",
    password: "password2",
    birthday: new Date("1991-01-02").getTime(),
},
{
    id: 3,
    fullname: "Nguyen Kim Anh",
    username: "anhnk",
    password: "password3",
    birthday: new Date("1992-01-03").getTime(),
},
{
    id: 4,
    fullname: "Dang Van Hao",
    username: "haodv",
    password: "password4",
    birthday: new Date("1993-01-04").getTime(),
},
];


router.get('/', (ctx,next) => {
    ctx.body = list_user;
    next();
})


router.get('/:id',(ctx, next) => {
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

router.delete('/:id',(ctx,next) => {
    let check = false;
    for(x of list_user) {
        if(x.id == ctx.params.id) {
            list_user.splice(list_user.findIndex(y=>y==x),1);
            check = true;
            break;
        }
    }
    if(check == false) {
        ctx.response.status = 404;
        ctx.body = "Error";
    }
    else{
        ctx.body = "success";
    }
    next();
})

router.post("/", (ctx, next) => {
    let maxid = 0;
    for (let x of list_user) {
        if (x.id > maxid) maxid = x.id;
    }
    var new_user = {
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
    console.log(ctx.request.body);
    list_user.push(new_user);
    ctx.body = new_user;
    next();
});

router.put("/:id", (ctx, next) => {
    let check = false;
    let id = Number(ctx.params.id);
    for (let x of list_user) {
        if (id == x.id) {
            x.fullname = ctx.request.body.fullname;
            x.username = ctx.request.body.username;
            x.password = ctx.request.body.password;
            x.birthday = ctx.request.body.birthday;
            //x.fullname = "Nguyen Van An";
            //x.username = "annv";
            //x.password = "password2";
            //x.birthday = new Date("1991-01-02").getTime();
            check = true;
            ctx.body = x;
            break;
        }
    }
    if (!check) ctx.body = "error";
    next();
});


app
    .use(router.routes())
    .use(router.allowedMethods())
    .use(bodyParser());

app.listen(3000,()=>{
    console.log('Server run on port 3000');
})