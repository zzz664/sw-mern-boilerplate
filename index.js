const express = require('express');
const app = express();
const port = 5000;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const config = require('./config/keys');

const {User} = require('./models/User');

//application/x-www-form-urlencoded 형태를 가져올 수 있게함
app.use(bodyParser.urlencoded({extended: true}));
//application/json 형태를 가져올 수 있게함
app.use(bodyParser.json());
app.use(cookieParser());

const mongoose = require('mongoose');
mongoose.connect(config.mongoURI, {
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
}).then(() => console.log('MongoDB connected!'))
.catch(() => console.log(err));

app.get('/', (req, res) => res.send('Hello World!'));

//회원가입 정보를 client에서 가져오면 DB에 저장
//req.body example -> body-parser를 이용하기 때문.
/*
{
    id: "id",
    password: "password"
}
*/
app.post('/api/users/register', (req, res) => {
    const user = new User(req.body)

    user.save((err, userInfo) => {
        if(err) 
            return res.json({success: false, err})

        return res.status(200).json({success: true})
    })
});

app.post('/api/users/login', (req, res) => {
    //요청된 email을 db에서 찾기
    User.findOne({email: req.body.email}, (err, userInfo) => {
        if(!userInfo) {
            return res.json({
                loginSuccess: false,
                message: "존재하지 않는 이메일입니다."
            });
        }
        //요청된 email이 유효하면 비밀번호가 맞는지 확인
        userInfo.comparePassword(req.body.password, (err, isMatch) => {
            if(!isMatch) return res.json({
                loginSuccess: false,
                message: "비밀번호가 틀렸습니다."
            });
            //유저토큰 생성
            userInfo.genToken((err, userInfo) => {
                if(err) return res.status(400).send(err); //400은 오류가 있다는 뜻
                //토큰을 저장한다. (쿠키, 로컬스토리지, 세션 등등..)
                res.cookie("x_auth", userInfo.token).status(200).json({
                    loginSuccess: true,
                    userId: userInfo._id
                });
            });
        })
    });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));