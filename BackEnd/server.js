//const express = require('express');
const bodyParser = require('body-parser');
const dbcntrl = require('./serverBusinessLayer');
const cors = require('cors');
const fs = require('fs');
const multer = require('multer');
const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);

exports.appIp = "http://localhost:8080";

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'files')
    },
    filename: function (req, file, cb) {
        if(file.originalname === "blob")
            cb(null, Date.now() + '-' + req.params.userLogin + "-profile-photo.png" )
        else
            cb(null, Date.now() + '-' + file.originalname )
    }
});
const upload = multer({ storage: storage }).array('file');

app.post('/login', (req, res) => {
    let UserToLogin = req.body;
    dbcntrl.login(UserToLogin, (mess) => {
        res.json(mess);
        res.end();
    });
});

app.post('/register', (req, res) => {
    let UserToRegister = req.body;
    dbcntrl.registration(UserToRegister, (mess) => {
        res.json(mess);
        res.end();
    });
});

app.get('/tokens/:token', (req, res) => {
    let token = req.params.token;
    dbcntrl.tokens(token, (mess) => {
        if(mess)
        {
            res.write("Вы подтвердили почту успешно.");
            res.end();
        }
        else
        {
            res.json(mess);
            res.end();
        }
    });
});

app.get('/users/byToken/:token', (req, res) => {
    let token = req.params.token;
    dbcntrl.getUserByToken(token, (result) => {
        res.json(result);
        res.end();
    });
});

app.get('/users/byLogin/:login', (req, res) => {

    let login = req.params.login;
    dbcntrl.getUserByLogin(login, (result) => {
        res.json(result);
        res.end();
    });
});

app.get('/posts/:login/:from/:howMuch', (req, res) => {
    let login = req.params.login;
    let from = req.params.from;
    let howMuch = req.params.howMuch;

    dbcntrl.getWallPosts(login, from, howMuch, (respons) => {
        res.json(respons);
        res.end();
    });
});

app.get('/photo/:filename', (req, res) => {
        let filename = req.params.filename;
        if (fs.existsSync(`./files/${filename}`))
            fs.createReadStream(`./files/${filename}`).pipe(res);
        else
            res.status(500).send('file does not exist!`');
});


app.get('/media/:filename', function(req, res) {
    const path = `./files/${req.params.filename}`;
    const stat = fs.statSync(path)
    const fileSize = stat.size
    const range = req.headers.range
    if (range) {
        const parts = range.replace(/bytes=/, "").split("-")
        const start = parseInt(parts[0], 10)
        const end = parts[1]
            ? parseInt(parts[1], 10)
            : fileSize-1
        const chunksize = (end-start)+1
        const file = fs.createReadStream(path, {start, end})
        const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'video/mp4',
        }
        res.writeHead(206, head);
        file.pipe(res);
    } else {
        const head = {
            'Content-Length': fileSize,
            'Content-Type': 'video/mp4',
        }
        res.writeHead(200, head)
        fs.createReadStream(path).pipe(res)
    }
});

app.post('/uploadFiles/:userLogin', (req, res) => {
    let userLogin = req.params.userLogin;
    upload(req, res, (err) =>  {
        if (err instanceof multer.MulterError) {
            return res.status(501).json(err)
        } else if (err) {
            return res.status(501).json(err)
        }

        dbcntrl.addFiles(req.files, userLogin, (filesId) => {
            res.json(filesId);
            res.end();
        });
    });
});

app.post('/addWallPost', (req, res) => {
    let idFiles = req.body.idFiles;
    let userLogin = req.body.login;
    let mainText = req.body.mainText;


    dbcntrl.addPost(idFiles, mainText, userLogin, (result) => {
        res.json(true);
        res.end();
    });
});

app.post('/deleteWallPost', (req, res) => {
    let idPostToDelete = req.body.idPost;

    dbcntrl.deletePost(idPostToDelete, (result) => {
        res.json(result);
        res.end();
    });
});

app.post('/updateProfilePhoto', (req, res) => {
    let idProfilePhoto = req.body.idNewPhoto;
    let userLogin = req.body.userLogin;

    dbcntrl.updateProfilePhoto(idProfilePhoto, userLogin, (result) => {
        res.json(result);
        res.end();
    });
});

app.post('/updateProfileInfo/:token', (req, res) => {
    let token = req.params.token;
    let changeForm = req.body;

    dbcntrl.updateProfileInfo(changeForm, token, (result) => {
        res.json(result);
        res.end();
    });
});

app.get('/users/:from/:howMuch', (req, res) => {
    let from = req.params.from;
    let howMuch = req.params.howMuch;
    dbcntrl.getAllUsers(from, howMuch, (result) => {
        res.json(result);
        res.end();
    });
});

app.post('/users/:from/:howMuch', (req, res) => {
    let from = req.params.from;
    let howMuch = req.params.howMuch;
    let searchValue = req.body.searchValue;
    dbcntrl.getAllUsersBySearch(searchValue, from, howMuch, (result) => {
        res.json(result);
        res.end();
    });
});

app.post('/addToFriend', (req, res) => {
    let token = req.body.token;
    let idWhoRes = req.body.idWhoRes;

    dbcntrl.addToFriends(token, idWhoRes, (result) => {
        if(result) {
            dbcntrl.getSessionTokenByUserId(idWhoRes, (sessionToken) => {
                dbcntrl.getUserByToken(token, (userInfo) => {
                    io.emit(`${sessionToken.token}-FriendRequest`, {
                        userLogin: userInfo.login,
                        userFullName: userInfo.firstName + " " + userInfo.lastName,
                        message: "Добавил вас в друзья",
                        avatar: userInfo.avatarpath,
                    });
                });

            });
        }
        res.json(result);
        res.end();
    });
});

app.get(`/getFriendsRequest/:token`, (req, res) => {
    let token = req.params.token;
    dbcntrl.getFriendsRequsets(token, (result) => {
        res.json(result);
        res.end();
    });
});

app.post(`/responseFriendRequest`, (req, res) => {
    let idWhoReq = req.body.idWhoReq;
    let token = req.body.token;
    let answer = req.body.answer;


    dbcntrl.FriendRequestAnswer(token, idWhoReq, answer, (result) => {
        res.json(result);
        res.end();
    });
});

app.post(`/getRelationShip`, (req, res) => {
    let idRelWith = req.body.idRelWith;
    let token = req.body.token;

    dbcntrl.getRelationShip(token, idRelWith, (result) => {
        res.json(result);
        res.end();
    });
});

app.get(`/friends/:token/:from/:howMuch`, (req, res) => {
    let token = req.params.token;
    let from = req.params.from;
    let howMuch = req.params.howMuch;

    dbcntrl.getFriends(token, from, howMuch, (result) => {
        res.json(result);
        res.end();
    });
})

app.get(`/dialogs/:token`, (req, res) => {
    let token = req.params.token;

    dbcntrl.getDialogs(token, (result) => {
        res.json(result);
        res.end();
    });
});

app.post(`/getMessagesWith/:idUserWith/:from/:howMuch`, (req, res) => {
    let token = req.body.token;
    let idUserWith = req.params.idUserWith;
    let from = req.params.from;
    let howMuch = req.params.howMuch;

    dbcntrl.getMessagesWith(token, idUserWith, from, howMuch, (result) => {
        res.json(result);
        res.end();
    });
});

app.post(`/sendMessage`, (req, res) => {
    let files = req.body.files;
    let messageText = req.body.messageText;
    let tokenUserFrom = req.body.tokenUserFrom;
    let idUserTo = req.body.idUserTo;

    dbcntrl.sendMess(files, messageText, tokenUserFrom, idUserTo, (result) => {
        if(result) {
            dbcntrl.getSessionTokenByUserId(idUserTo, (sessionToken) => {
                dbcntrl.getUserByToken(tokenUserFrom, (userInfo) => {
                    io.emit(`${sessionToken.token}-NewMessage`, {
                        userLogin: userInfo.login,
                        userFullName: userInfo.firstName + " " + userInfo.lastName,
                        message: messageText,
                        avatar: userInfo.avatarpath,
                    });
                });

            });
        }
        res.json(result);
        res.end();
    });
});

const service = server.listen(8080, () => { console.log(`app starter at: ${this.appIp}`) });