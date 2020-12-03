const express = require('express');
const app = express();
const port = 5000;
const bodyParser = require('body-parser');
const config = require('./config/keys');

const {User} = require('./models/User');

//application/x-www-form-urlencoded 형태를 가져올 수 있게함
app.use(bodyParser.urlencoded({extended: true}));
//application/json 형태를 가져올 수 있게함
app.use(bodyParser.json());

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
app.post('/register', (req, res) => {
    const user = new User(req.body)
    user.save((err, userInfo) => {
        if(err) 
            return res.json({success: false, err})

        return res.status(200).json({success: true})
    })
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));