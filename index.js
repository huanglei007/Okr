var express = require('express');
var mysql = require('mysql');
var nunjucks = require('nunjucks');
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')
var moment = require('moment')

var connection = mysql.createConnection({
    host: '192.168.0.110',
    user: 'root',
    password: ' ',
    database: 'okr'
})
connection.connect();

var app = express();

nunjucks.configure('views', {
    autoescape: true,
    express: app,
})

app.use(bodyParser.urlencoded({ extended: false }))



app.get('/', function (req, res) {
    // res.cookie("test", "value")

    connection.query('select *,(select username from user where user.id = okr.user_id) as username from okr', function (err, data) {

        // console.log('data: ', data);
        // var username = req.cookies.username;
        res.render('HomePage.html', { items: data });
    })

})



// app.get('/Details/:id', function (req, res) {
//     var id = req.params.id;
//     connection.query('select *,(select username from user where user.id = okr.user_id) as username from okr where id=? limit 1', [id], function (err, data) {
//         // console.log('data: ', data);
//         res.cookie('okr_id',id)
//         res.render('Details.html', { details: data })
//     });
// })


// app.get('/user/:id', function (req, res) {
//     var id = req.params.id;
//     connection.query('select * from user where id=? limit 1', [id], function (err, data) {
//         // console.log('data: ', data);
//         res.render('User.html', { user: data })
//     });
// })


app.post('/api/register', function (req, res) {
    var phone = req.body.phone;
    var password = req.body.password;
    var username = phone.substr(0, 3) + "****" + phone.substr(7);
    var created_at = moment().format('YYYY-MM-DD HH:mm:ss');

    // var code = req.body.code;
    

    connection.query('insert into user values (null, ?, ?, ?, "", "", ?)', [phone, password, username, created_at], function (err, data) {
        res.send('注册成功')
    })

})


// app.post('/api/login', function (req, res) {
//     var phone = req.body.phone;
//     var password = req.body.password;
//     connection.query('select * from user where phone=? and password=? limit 1', [phone, password], function (err, data) {
//         res.cookie('user_id', data[0].id);
//         res.cookie('username', data[0].username);
//         if (data.length > 0) {
//             var token = phone + password + new Date().getTime() + Math.random();
//             connection.query('update user as t set t.token = ? where phone =?', [token, phone], function (err, data) {
//                 res.cookie('token', token)
//                 res.render('HomePage.html');
//             })

//         } else {
//             res.send('对不起，用户名或密码错误')
//         }
//     })
// })

// app.post('/api/OKR', function (req, res) {
//     var O = req.body.O;
//     var K = req.body.K;
//     var R = req.body.R;
//     var id = req.cookies.id
//     var created_at = moment().format('YYYY-MM-DD HH:mm:ss');

//     connection.query('insert into okr values (null, ?, ?, ?, ?, ?)', [O, K, R, id, created_at], function (err, data) {
//         res.render('HomePage.html');
//     })
// })
// app.post('/api/comment', function (req, res) {
//     var comment = req.body.comment;
//     var userid = req.body.user_id;
//     var okrid = req.body.okr_id;
//     var created_at = moment().format('YYYY-MM-DD HH:mm:ss');

//     connection.query('insert into comment values (null, ?, ?, ?, ?)', [okrid, userid, comment, created_at], function (err, data) {
//         res.send('评论成功')
//     })
// })




app.listen(3000);