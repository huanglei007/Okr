var express = require('express');
var mysql = require('mysql');
var nunjucks = require('nunjucks');
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')
var moment = require('moment')

var connection = mysql.createConnection({
    host: '192.168.0.110',
    user: 'root',
    password: '88888888',
    database: 'okr'
})
connection.connect();

var app = express();

nunjucks.configure('views', {
    autoescape: true,
    express: app,
})

app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())



app.get('/', function (req, res) {
    res.render('HomePage.html');
})

app.get('/details/:id', function (req, res) {
    var okr_id = req.params.id;
    res.render('Details.html')
})


app.get('/user/:id', function (req, res) {
        res.render('User.html')
})


app.post('/api/register', function (req, res) {
    var phone = req.body.phone;
    var password = req.body.password;
    var username = phone.substr(0, 3) + "****" + phone.substr(7);
    var token = req.body.token;
    var created_at = moment().format('YYYY-MM-DD HH:mm:ss');

    connection.query('select * fromm user where phone=? and password=? limit 1', [phone, password], function (err, data) {
        if(data == undefined){
            connection.query('insert into user values (null, ?, ?, ?, "", ?, ?)', 
            [phone, password, username, token, created_at], function (err, data) {
                res.send('注册成功')
            })
        }
       else{
           res.send("对不起,用户名或密码已被占用")
       }
    })
})


app.post('/api/login', function (req, res) {
    var phone = req.body.phone;
    var password = req.body.password;

    connection.query('select * from user where phone=? and password=? limit 1', [phone, password], function (err, data) {

        res.cookie('user_id', data[0].id);
        res.cookie('username', data[0].username);
        if (data.length != 0) {
        
            var token = phone + password + new Date().getTime() + Math.random();
            connection.query('update user as t set t.token = ? where phone =?', [token, phone], function (err, data) {
                res.cookie('token', token)
                res.send('登录成功');
            })

        } else {
            res.send('对不起，用户名或密码错误')
        }
    })
})

app.post('/api/okr', function (req, res) {
    var O = req.body.O;
    var K = req.body.K;
    var R = req.body.R;
    var id = req.cookies.id
    var created_at = moment().format('YYYY-MM-DD HH:mm:ss');

    connection.query('insert into okr values (null, ?, ?, ?, ?, ?)', [O, K, R, id, created_at], function (err, data) {
        res.send('发布成功');
    })
})

app.post('/api/comment', function (req, res) {
    var comment = req.body.comment;
    var userid = req.body.user_id;
    var okrid = req.body.okr_id;
    var created_at = moment().format('YYYY-MM-DD HH:mm:ss');

    connection.query('insert into comment values (null, ?, ?, ?, ?)', [okrid, userid, comment, created_at], function (err, data) {
        res.send('评论成功')
    })
})


app.get('/api/homepage', function (req, res) {
    res.cookie("test", "value");
    var page = req.query.page || 1;
    var size = 10;
    connection.query(`select *,
                    (select username from user where user.id = okr.user_id) as username,
                    (select avatar from user where user.id = okr.user_id) as avatar
                    from okr limit ?, ?`, [(page - 1) * size, size], function (err, data) {
            var username = req.cookies.username;
            res.json({ okr: data ,username:username});
        })
});

app.get('/api/details/:id', function (req, res) {
    var okr_id = req.params.id;
    connection.query(`select *,
                    (select username from user where id=okr.user_id) as username,
                    (select avatar from user where user.id = okr.user_id) as avatar 
                    from okr where id=?`, [okr_id], function (err, data) {
            res.json({ details: data });
        });
});

app.get('/api/comments/:id', function (req, res) {
    var okr_id = req.params.id;
    var page = req.query.page || 1;
    var size = 10;

    connection.query(`select *,
                    (select username from user where user.id=comment.user_id) as username,
                    (select avatar from user where user.id=comment.user_id) as avatar
                    from comment where okr_id=? limit ?, ?`, [okr_id, (page - 1) * size, size], function (err, data) {
            res.json({ comments: data });
        })
});


app.get('/api/user/:id', function (req, res) {
    var id = req.params.id;
    connection.query('select * from user where id=? limit 1', [id], function (err, data) {
        // console.log('data: ', data);
        res.json({user: data})
    });
});
app.get('/api/userokr/:id', function (req, res){
    var id = req.params.id;
    connection.query('select * from okr where user_id=? ', [id], function(err, data){
        res.json({userokr: data})
    })
})




app.listen(3000);