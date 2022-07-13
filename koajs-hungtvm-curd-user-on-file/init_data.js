const fs = require('fs');

function defaultValue() {
    let list_user = [{
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
    let list_user_id = [];
    list_user.forEach((element) => {
        list_user_id.push(element.id);
    });

    try {
        // convert JSON object to a string
        const data = JSON.stringify(list_user);

        // write file to disk
        fs.writeFileSync('./data/users.json', data, 'utf8');

        console.log(`File is written successfully!`);

    } catch (err) {
        console.log(`Error writing file: ${err}`);
    }
}
defaultValue();
