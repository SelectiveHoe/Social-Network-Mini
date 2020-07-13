const { Client } = require("pg");
const { encrypt, decrypt } = require('./encryption');
const DataALayer = require('./serverDataLayer');
const emailSender = require('./emailSender');
const server = require('./server');

const passwordRegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/;
const emailRegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const connectionDetails = {
    host: "localhost",
    user: "postgres",
    password: "admin",
    database: 'miniDataBase',
    port: 5432
};

const client = new Client(connectionDetails);

client.connect();


exports.createNewToken = (id) => 
{
    let tokenContent = {
        id: id,
        createTime: Date.now(),
    };
    let token = encrypt(JSON.stringify(tokenContent));
    return token;
}

exports.getWallPosts = (login, from, howMuch, callback) =>
{
    DataALayer.getWallPosts(login, from, howMuch, (res) => {
        callback(res);
    });
}

exports.login = (UserToLogin, callback) =>
{
    let serverAnswer = {
        aBody: {},
        aMsg: ''
    };
    DataALayer.getUserAuthByLogin(UserToLogin.login, (userAuth) => {
        if(userAuth)
        {

            UserToLogin.password = encrypt(UserToLogin.password);
            console.log("CRIPTO PASSWORD ----------------------" + UserToLogin.password);
            if(userAuth.password == UserToLogin.password)
            {
                if(userAuth.isEmailConfirm)
                {
                    DataALayer.deleteSessionTokenByUserID(userAuth.id, (delTokRes) => {
                        let Token = this.createNewToken(userAuth.id);
                        DataALayer.addSessionToken({userId: userAuth.id, token: Token}, (resAddTok) => {
                            if(resAddTok)
                            {
                                serverAnswer.aBody = { token: Token}
                                serverAnswer.aMsg = 'Авторизация произведена успешно.';
                                callback(serverAnswer);
                                return;
                            }
                            else
                            {
                                serverAnswer.aMsg = 'Ошибка входа. Попробуйте ещё раз.';
                                callback(serverAnswer);
                                return;
                            }
                        });
                    });
                }
                else
                {
                    serverAnswer.aMsg = 'Регистарция произведенна успешно. Для входа требуется подтвердить ваш E-mail, сообщение на вашу почту было отправленно!';
                    callback(serverAnswer);
                    return;
                }
            }
            else
            {
                serverAnswer.aMsg = 'Ошибка входа. Неверный пароль.';
                callback(serverAnswer);
                return;
            }
        }
        else
        {
            
            serverAnswer.aMsg = 'Ошибка входа. Попробуйте ещё раз.';
            callback(serverAnswer);
            return;
        }
    });
}

exports.registration = (UserToRegister, callback) =>
{
    let serverAnswer = {
        aBody: {},
        aMsg: ''
    };


    //Валидация формы регистрации
    this.RegFormValidation(UserToRegister, (ValidMess) => {
        if(ValidMess.isValid)
        {
            //Проверка на то существует ли такой же логин
            DataALayer.getUserAuthByLogin(UserToRegister.login, (isLoginExist) => {
                if(!isLoginExist)
                {
                    //Проверка на то существует ли такая же почта
                    DataALayer.getUserAuthByEmail(UserToRegister.email, (isEmailExist) => {
                        if(!isEmailExist)
                        {
                            //Добавление нового пользователя
                            let decriptedPassword = UserToRegister.password;
                            UserToRegister.password = encrypt(UserToRegister.password);
                            DataALayer.addUserAuth(UserToRegister, (newIdUserAuth) => {
                                UserToRegister.password = decriptedPassword;
                                if(newIdUserAuth)
                                {
                                    UserToRegister = {...UserToRegister, idUserAuth: newIdUserAuth};
                                    DataALayer.addUserInfo(UserToRegister, (newIdUserInfo) => {
                                        if(newIdUserInfo)
                                        {
                                            //генерация токена и запись его в базу данных
                                            let bodyToken = this.createNewToken(UserToRegister.login);
                                            let AccessToken = {
                                                token: bodyToken,
                                                type: 'confirmEmail',
                                                userAuthId: newIdUserAuth
                                            };

                                            DataALayer.addAccessToken(AccessToken, (isAccessTokenAdded) => {
                                                if(isAccessTokenAdded)
                                                {
                                                    //отправка письма с подтверждение на почту
                                                    emailSender.SendEmail(UserToRegister.email, 'mini: Mail Confirmation', `To confirm your e-mail just click on this link: ${server.serverIp}/tokens/${bodyToken}`, (res) => {
                                                        //Производится логин
                                                        this.login(UserToRegister, (loginAnswer) => {
                                                            callback(loginAnswer);
                                                            return;
                                                        });
                                                    });
                                                }
                                                else
                                                {
                                                    serverAnswer.aMsg = "Произошла ошибка регистрации, поробуйте ещё раз.";
                                                    callback(serverAnswer);
                                                    return;
                                                }
                                            });
                                        }
                                        else
                                        {
                                            serverAnswer.aMsg = "Произошла ошибка регистрации, поробуйте ещё раз.";
                                            callback(serverAnswer);
                                            return;
                                        }
                                    });
                                }
                                else
                                {
                                    serverAnswer.aMsg = "Произошла ошибка регистрации, поробуйте ещё раз.";
                                    callback(serverAnswer);
                                    return;
                                }
                            });
                        }
                        else
                        {
                            serverAnswer.aMsg = "Пользователь с такой почтой уже существует.";
                            callback(serverAnswer);
                            return;
                        }
                    });
                }
                else
                {
                    serverAnswer.aMsg = "Пользователь с таким логином уже существует.";
                    callback(serverAnswer);
                    return;
                }
            });
        }
        else
        {
            serverAnswer.aMsg = ValidMess.Message;
            callback(serverAnswer);
            return;
        }
    });
}

exports.tokens = (token, callback) => 
{
    DataALayer.getAccessTokenByToken(token, (findedtoken) => {
        if(findedtoken)
        {
            if(findedtoken.type == "confirmEmail")
            {
                DataALayer.setEmailTrueById(findedtoken.userAuthId, (isEmailSwitched) => {
                    if(isEmailSwitched)
                    {
                        DataALayer.removeAccessToken(findedtoken.token, (isDeleted) => {

                            if(isDeleted)
                            {
                                callback(true);
                                return;
                            }
                            else
                            {
                                callback(false);
                                return;
                            }
                        });
                    }
                    else
                    {
                        callback(false);
                        return;
                    }
                });
            }
            else
            {
                callback(false);
                return;
            }
        }
        else
        {
            callback(false);
            return;
        }
    });
}

exports.getUserByToken = (token, callback) =>
{
    DataALayer.getUserDTOByToken(token, (res) => {
        DataALayer.setLastOnlineNowByLogin(res.login, () => {});
        callback(res);
    });
}

exports.getUserByLogin = (login, callback) =>
{
    DataALayer.getUserDTOByLogin(login, (res) => {
        callback(res);
    });
}

exports.addFiles = (files, userLogin, callback) =>
{
    DataALayer.setLastOnlineNowByLogin(userLogin, () => {});
    let insertedIdFiles = [];
    DataALayer.getUserAuthByLogin(userLogin,  (userAuth) => {
        files.map(file => {
            let type = file.mimetype.split("/")[0];
            if(type == 'image')
                type = 'photo';
            let pathType = type;
            if(type == 'video')
                type = 'media';
            if(type == 'audio') {
                pathType = 'music';
                type = 'media';
            }
            let path = `/${type}/` + file.filename;
            let idCurrFile = DataALayer.addFile({type: pathType, path: path, idUserAuth: userAuth.id});
            insertedIdFiles.push(idCurrFile);
        });
        Promise.all(insertedIdFiles).then((res) => {
            callback(res);
        });
    });
}

exports.addPost = (idFiles, mainText, userLogin, callback) =>
{
    DataALayer.getUserAuthByLogin(userLogin, (res) => {
        DataALayer.addWallPost(mainText, res.id, (idPost) => {
            DataALayer.addMediaToPost(idFiles, idPost);
            callback(true);
        });
    });
}

exports.deletePost = (idPostToDelete, callback) =>
{
    DataALayer.deleteWallPost(idPostToDelete, (res) => {
        callback(res);
    });
}

exports.updateProfilePhoto = (idPhoto, login, callback) =>
{
    DataALayer.changeProfilePhoto(idPhoto, login, (res) => {
       callback(res);
    });
}

exports.updateProfileInfo = (form, token, callback) =>
{
    DataALayer.getUserDTOByToken(token, (res) => {
        if(res) {
            let userid = res.idUserAuth;
            DataALayer.updateProfileInfo(form, userid, (updateRes) => {
                callback(updateRes);
            });
        }
        else
        {
            callback(false);
        }
    });
}

exports.getAllUsers = (from, howMuch, callback) =>
{
    DataALayer.getAllUsers(from, howMuch, (res) => {
        callback(res);
    });
}

exports.getAllUsersBySearch = (search, from, howMuch, callback) =>
{
    DataALayer.searchUsers(search, from, howMuch, (res) =>{
        callback(res);
    });
}

exports.addToFriends = (token, idWhoRes, callback) =>
{
    DataALayer.getUserDTOByToken(token, (user)=>{
        let userid = user.idUserAuth;
        DataALayer.addToFriends(userid, idWhoRes, (res) => {
            callback(res);
        });
    });
}

exports.getFriendsRequsets = (token, callback) =>
{
    DataALayer.getUserDTOByToken(token, (user)=> {
        let userid = user.idUserAuth;
        DataALayer.getFriendsRequests(userid, (res) => {
            callback(res);
        });
    });
}

exports.FriendRequestAnswer = (token, idWhoReq, answer, callback) =>
{
    DataALayer.getUserDTOByToken(token, (user) => {
        let idWhoRes = user.idUserAuth;
        DataALayer.FriendRequestAnswer(idWhoRes, idWhoReq, answer, (res)=>{
            callback(res);
        });
    });
}

exports.getRelationShip = (token, idRelWith, callback) =>
{
    DataALayer.getUserDTOByToken(token, (user) => {
        let idWhoReq = user.idUserAuth;
        DataALayer.getRelationShip(idWhoReq, idRelWith, (res) => {
            callback(res);
        })
    });
}

exports.getFriends = (token, from, howMuch, callback) =>
{
    DataALayer.getUserDTOByToken(token, (user) => {
       let userId = user.idUserAuth;
       DataALayer.getFriends(userId, from, howMuch, (res) => {
           callback(res);
       });
    });
}

exports.getDialogs = (token, callback) =>
{
    DataALayer.getUserDTOByToken(token, (user) => {
        let userId = user.idUserAuth;
        DataALayer.getDialogues(userId, (res) => {
            callback(res);
        })
    });
}

exports.getMessagesWith = (token, idUserWith, from, howMuch, callback) =>
{
    DataALayer.getUserDTOByToken(token, (user) => {
        let userId = user.idUserAuth;
        DataALayer.getMessagesWith(userId, idUserWith, from, howMuch, (res) => {
            callback(res);
        })
    });
}

exports.sendMess = (files, messageText, tokenUserFrom, idUserTo, callback) =>
{
    DataALayer.getUserDTOByToken(tokenUserFrom, user => {
        let idUserFrom = user.idUserAuth;
        DataALayer.addMessage(idUserFrom, idUserTo, messageText, (idMess) => {
            if(idMess)
            {
                DataALayer.addMediaToMess(files, idMess);
                callback(true);
            }
            else
                callback(false);
        });
    });
}

exports.getSessionTokenByUserId = (userId, callback) =>
{
    DataALayer.getSessionTokenByUserID(userId, (sessionToken) => {
        callback(sessionToken);
    });
}

exports.RegFormValidation = (RegForm, callback) =>
{
    RegFormMsg = {
        isValid: true,
        Message: '',
    }

    if(RegForm.login.length >= 5 && RegForm.login.length <= 25 && !/ /.test(RegForm.login))
    {
        if(RegForm.firstName.length >= 2 && RegForm.firstName.length <= 20 && !/ /.test(RegForm.firstName))
        {
            if(RegForm.lastName.length >= 2 && RegForm.lastName.length <= 25 && !/ /.test(RegForm.lastName))
            {
                if(passwordRegExp.test(RegForm.password))
                {
                    if(emailRegExp.test(RegForm.email))
                    {
                        callback(RegFormMsg);
                        return;
                    }
                    else
                    {
                        RegFormMsg.Message = 'Почта не прошла валидацию.';
                        RegFormMsg.isValid = false;
                        callback(RegFormMsg);
                        return;
                    }
                }
                else
                {
                    RegFormMsg.Message = 'Пароль не прошёл валидацию.';
                    RegFormMsg.isValid = false;
                    callback(RegFormMsg);
                    return;
                }
            }
            else
            {
                RegFormMsg.Message = 'Фамилия не прошла валидацию.';
                RegFormMsg.isValid = false;
                callback(RegFormMsg);
                return;
            }
        }
        else
        {
            RegFormMsg.Message = 'Имя не прошло валидацию.';
            RegFormMsg.isValid = false;
            callback(RegFormMsg);
            return;
        }
    }
    else
    {
        RegFormMsg.Message = 'Логин не прошёл валидацию.';
        RegFormMsg.isValid = false;
        callback(serverAnswer);
        return;
    }
}