const { Client } = require("pg");

const connectionDetails = {
    host: "localhost",
    user: "postgres",
    password: "admin",
    database: 'miniDataBase',
    port: 5432
};

const client = new Client(connectionDetails);

client.connect();

exports.getDatePlusDays = (days) => {
    //return new Date(Date.now() + (days * 24*3600*1000)).toISOString().replace(/T/, ' ').replace(/\..+/, '');
    return new Date(Date.now() + (days * 24*3600*1000)).toLocaleString();
}

exports.getUserAuthByLogin = (login, callback) =>
{
    client.query(`SELECT * FROM public."userAuth" WHERE login = '${login}';`, (err, result) => {
        if(!err && result.rows[0]) callback(result.rows[0]); 
        else callback(false);
    });
}

exports.getUserAuthByEmail = (Email, callback) =>
{
    client.query(`SELECT * FROM public."userAuth" WHERE email = '${Email}';`, (err, result) => {
        if(!err && result.rows[0]) callback(result.rows[0]); 
        else callback(false);
    });
}

exports.getSessionTokenByUserID = (UserId, callback) =>
{
    client.query(`SELECT * FROM public."SessionToken" WHERE userid = ${UserId};`, (err, result) => {
        if(!err && result.rows[0]) callback(result.rows[0]); 
        else callback(false);
    });
}

exports.deleteSessionTokenByUserID = (UserId, callback) =>
{
    client.query(`DELETE FROM public."SessionToken" WHERE userid = ${UserId};`, (err, result) => {
        if(!err) callback(true); 
        else callback(false);
    });
}

exports.addSessionToken = (SessionToken, callback) =>
{
    client.query(`INSERT INTO public."SessionToken"(userid, token, validto) VALUES (${SessionToken.userId}, '${SessionToken.token}', '${this.getDatePlusDays(1)}');`, (err, result) => {
        if(!err) callback(true); 
        else callback(false);
    });
}

exports.addUserAuth = (userAuth, callback) => 
{
    client.query(`INSERT INTO public."userAuth"(login, password, email, "isEmailConfirm") VALUES ('${userAuth.login}', '${userAuth.password}', '${userAuth.email}', false) RETURNING id`, (err, result) => {
        if(!err) callback(result.rows[0].id);
        else callback(false);
    });
}

exports.addUserInfo = (userInfo, callback) => 
{
    client.query(`INSERT INTO public."userInfo" ("idUserAuth", "firstName", "middleName", "lastName", "birthDay", status, "aboutMe", address, "lastOnline", "idAvatarMediaRes") 
                    VALUES (${userInfo.idUserAuth}, '${userInfo.firstName}', null, '${userInfo.lastName}', null, null, null, null, '${this.getDatePlusDays(0)}', null) RETURNING id;`, (err, result) => {
        if(!err) callback(result.rows[0].id);
        else callback(false);
    });
}

exports.addAccessToken = (accessToken, callback) => 
{
    client.query(`INSERT INTO public."AccessToken"(token, type, "userAuthId")VALUES ('${accessToken.token}', '${accessToken.type}', '${accessToken.userAuthId}');`, (err, result) => {
        if(!err) callback(true);
        else callback(false);
    });
}

exports.removeAccessToken = (tokenToDelete, callback) =>
{
    client.query(`DELETE FROM public."AccessToken" WHERE token = '${tokenToDelete}';`, (err, result) => {
        if(!err) callback(true);
        else callback(false);
    });
}

exports.getAccessTokenByToken = (tokenToFind, callback) =>
{
    client.query(`SELECT * FROM public."AccessToken" WHERE token = '${tokenToFind}';`, (err, result) => {
        if(!err) callback(result.rows[0]);
        else callback(false);
    });
}

exports.setEmailTrueById = (userAuthId, callback) =>
{
    client.query(`UPDATE public."userAuth" SET "isEmailConfirm" = true WHERE id = ${userAuthId};`, (err, result) => {
        if(!err) callback(true);
        else callback(false);
    });
}

exports.getUserDTOByToken = (token, callback) =>
{
    client.query(`SELECT * FROM public."SessionToken" WHERE token = '${token}';`, (err, res) => {
        try {
            let userAuthId = res.rows[0].userid;
        client.query(`SELECT public."userInfo"."idUserAuth", public."userAuth"."login", public."userInfo"."firstName", public."userInfo"."middleName", public."userInfo"."lastName", public."userInfo"."birthDay", public."userInfo"."status", public."userInfo"."aboutMe", public."userInfo"."address", public."userInfo"."lastOnline"
            ,(SELECT "path" FROM public."MediaResource" where id = public."userInfo"."idAvatarMediaRes") as avatarPath
            FROM public."userInfo"
            INNER JOIN public."userAuth" ON public."userInfo"."idUserAuth" = public."userAuth"."id" 
            WHERE public."userAuth"."id" = ${userAuthId};`, (err, result) => {
            if(!err) callback(result.rows[0]);
            else callback(false);
        });
        }
        catch (e) {
        }
    });
}

exports.getUserDTOByLogin = (login, callback) =>
{
        client.query(`SELECT public."userInfo"."idUserAuth", public."userAuth"."login", public."userInfo"."firstName", public."userInfo"."middleName", public."userInfo"."lastName", public."userInfo"."birthDay", public."userInfo"."status", public."userInfo"."aboutMe", public."userInfo"."address", public."userInfo"."lastOnline"
            ,(SELECT "path" FROM public."MediaResource" where id = public."userInfo"."idAvatarMediaRes") as avatarPath
            FROM public."userInfo"
            INNER JOIN public."userAuth" ON public."userInfo"."idUserAuth" = public."userAuth"."id" 
            WHERE public."userAuth"."login" = '${login}';`, (err, result) => {
            if(!err) callback(result.rows[0]);
            else callback(false);
        });
}

exports.setLastOnlineNowByLogin = (login, callback) =>
{
    //UPDATE public."userInfo" SET "lastOnline" = '06-12-2020' WHERE "idUserAuth" = (Select id from public."userAuth" where login = 'SelectiveHoe');
    client.query(`UPDATE public."userInfo" SET "lastOnline" = '${this.getDatePlusDays(0)}' WHERE "idUserAuth" = (Select id from public."userAuth" where login = '${login}');`, (err, result) => {
        if(!err) callback(true);
        else callback(false);
    });
}

exports.addFile = async (file) =>
{
    let res = await client.query(`INSERT INTO public."MediaResource" (type, path, "idUserAuth") VALUES ('${file.type}', '${file.path}', ${file.idUserAuth}) RETURNING id;`);
    return res.rows[0].id;
}

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

exports.getWallPosts = (login, from, howMuch, callback) =>
{
    client.query(`SELECT * FROM public."WallPost" WHERE "whoPostedAuthId" = (SELECT id FROM public."userAuth" WHERE "login" = '${login}') ORDER BY "whenPosted" 
                        DESC LIMIT ${howMuch} OFFSET ${from};`, (err, posts) => {
        if(!err)
        {
            const start = async () => {
                await asyncForEach(posts.rows,async (item) => {
                    let resource = await client.query(`SELECT "type", "path" FROM public."MediaToWallPosts" INNER JOIN public."MediaResource" ON public."MediaResource".id = public."MediaToWallPosts"."mediaId" WHERE "wallPost" = ${item.id};`);
                    item.mediaResources = resource.rows;
                });
                callback(posts.rows);
            }
            start();
        }
        else
        {
            callback(false);
        }
    });
}

exports.addWallPost = (mainText, idUserAuth, callback) =>
{
    client.query(`INSERT INTO public."WallPost"
                                                ( "mainText", "whoPostedAuthId", "whenPosted", "countLikes") 
                                                VALUES ('${mainText}', ${idUserAuth}, '${this.getDatePlusDays(0)}', 0) RETURNING id;`,[], (err, idNewWallPost) => {
        callback(idNewWallPost.rows[0].id);
    });
}

exports.addMediaToPost = (idMeidas, idPost) =>
{
    idMeidas.forEach(item => {
        client.query(`INSERT INTO public."MediaToWallPosts"("mediaId", "wallPost") VALUES (${item}, ${idPost});`);
    });
}

exports.deleteWallPost = (idWallPost, callback) =>
{
    client.query(`DELETE FROM public."WallPost" WHERE id = ${idWallPost};`, (err, res) => {
        callback(!err);
    });
}

exports.changeProfilePhoto = (idPhoto, login, callback) =>
{
    client.query(`UPDATE public."userInfo" SET "idAvatarMediaRes"=${idPhoto} WHERE "idUserAuth" = (SELECT id FROM public."userAuth" WHERE login = '${login}');`, (err, res) => {
        callback(!err);
    });
}

exports.getAllUsers = (from, howMuch, callback) =>
{
    client.query(`SELECT public."userInfo"."idUserAuth", public."userAuth"."login", public."userInfo"."firstName", public."userInfo"."middleName", public."userInfo"."lastName", public."userInfo"."birthDay", public."userInfo"."status", public."userInfo"."aboutMe", public."userInfo"."address", public."userInfo"."lastOnline"
            ,(SELECT "path" FROM public."MediaResource" where id = public."userInfo"."idAvatarMediaRes") as avatarPath
            FROM public."userInfo"
            INNER JOIN public."userAuth" ON public."userInfo"."idUserAuth" = public."userAuth"."id"
            ORDER BY public."userInfo"."idUserAuth" LIMIT ${howMuch} OFFSET ${from};`, (err, res) => {
        if(!err)
            callback(res.rows);
        else
            callback(err);
    });
}

exports.searchUsers = (search, from, howMuch, callback) =>
{
    client.query(`SELECT public."userInfo"."idUserAuth", public."userAuth"."login", public."userInfo"."firstName", public."userInfo"."middleName", public."userInfo"."lastName", public."userInfo"."birthDay", public."userInfo"."status", public."userInfo"."aboutMe", public."userInfo"."address", public."userInfo"."lastOnline"
            ,(SELECT "path" FROM public."MediaResource" where id = public."userInfo"."idAvatarMediaRes") as avatarPath
            FROM public."userInfo"
            INNER JOIN public."userAuth" ON public."userInfo"."idUserAuth" = public."userAuth"."id"
            WHERE "firstName" like '%${search}%' or "middleName" like '%${search}%' or "lastName" like '%${search}%' or "login" like '%${search}%'
            ORDER BY public."userInfo"."idUserAuth" LIMIT ${howMuch} OFFSET ${from};`, (err, res) => {
        if(!err)
            callback(res.rows);
        else
            callback(err);
    });
}

exports.updateProfileInfo = (form, idUserAuth, callback) =>
{
    client.query(`UPDATE public."userInfo" 
    SET "firstName"='${form.firstName}', 
    "middleName"=${form.middleName === null ? null : `'${form.middleName}'`}, 
    "lastName"='${form.lastName}', 
    "birthDay"='${form.birthDay}', 
    status=${form.status === null ? null : `'${form.status}'`}, 
    "aboutMe"=${form.aboutMe === null ? null : `'${form.aboutMe}'`},
    address=${form.address === null ? null : `'${form.address}'`} 
    WHERE "idUserAuth" = ${idUserAuth};`, (err, res) => {
        callback(!err);
    });
}

exports.addToFriends = (idWhoReq, idWhoRes, callback) =>
{
    //INSERT INTO public."FriendsRequest"("idWhoReq", "idWhoRes", type, "timeWhenUpdated") VALUES (?, ?, ?, ?);
    client.query(`SELECT * FROM public."FriendsRequest" 
    WHERE "idWhoReq" = ${idWhoReq} AND "idWhoRes" = ${idWhoRes};`, (err, res) => {
        if(res.rows.length === 0)
        {
            client.query(`INSERT INTO public."FriendsRequest"("idWhoReq", "idWhoRes", type, "timeWhenUpdated") 
            VALUES (${idWhoReq}, ${idWhoRes}, 'FriendsReqest', '${this.getDatePlusDays(0)}');`, (err, res) => {
                callback(!err);
            });
        }
        else
        {
            callback(false);
        }
    });
}

exports.getFriendsRequests = (idWhoRes, callback) =>
{
    client.query(`
    SELECT public."FriendsRequest"."id" as idFriendsRequest, public."userInfo"."idUserAuth", public."userAuth"."login", 
    public."userInfo"."firstName", public."userInfo"."middleName", public."userInfo"."lastName", 
    public."userInfo"."birthDay", public."userInfo"."status", public."userInfo"."aboutMe", public."userInfo"."address", 
    public."userInfo"."lastOnline"
    ,(SELECT "path" FROM public."MediaResource" where id = public."userInfo"."idAvatarMediaRes") as avatarPath 
    FROM public."FriendsRequest"
    INNER JOIN public."userInfo" ON "idWhoReq" = "idUserAuth"
    INNER JOIN public."userAuth" ON public."userInfo"."idUserAuth" = public."userAuth"."id"
    WHERE "idWhoRes" = ${idWhoRes} AND "type" = 'FriendsReqest';
    `, (err, res) => {
        if(!err)
            callback(res.rows);
        else
            callback(false);
    });
}

exports.FriendRequestAnswer = (idWhoRes, idWhoReq, answer, callback) =>
{
    if(answer === "Friends")
    {
        client.query(`UPDATE public."FriendsRequest"
                            SET type='Friends', "timeWhenUpdated"='${this.getDatePlusDays(0)}'
                            WHERE ("idWhoRes" = ${idWhoRes} AND "idWhoReq" = ${idWhoReq}) OR ("idWhoRes" = ${idWhoReq} AND "idWhoReq" = ${idWhoRes});`, (err, res) => {
            callback(!err);
        });
    }
    else
    {
        client.query(`DELETE FROM public."FriendsRequest"
                            WHERE ("idWhoRes" = ${idWhoRes} AND "idWhoReq" = ${idWhoReq}) OR ("idWhoRes" = ${idWhoReq} AND "idWhoReq" = ${idWhoRes});`, (err, res) => {
            callback(!err);
        });
    }
}

exports.getRelationShip = (idWhoReq, idWhoRes, callback) =>
{
    client.query(`SELECT * FROM public."FriendsRequest"
    WHERE "idWhoReq" = ${idWhoReq} AND "idWhoRes" = ${idWhoRes} OR "idWhoReq" = ${idWhoRes} AND "idWhoRes" = ${idWhoReq};`, (err, res) => {
        if(res.rows.length !== 0) {
            callback({type: res.rows[0].type, Initiator: res.rows[0].idWhoReq});
        }
        else
            callback(false);
    });
}

exports.getFriends = (userId, from, howMuch, callback) =>
{
    client.query(`
    SELECT public."FriendsRequest"."id" as idFriendsRequest, public."userInfo"."idUserAuth", public."userAuth"."login", 
    public."userInfo"."firstName", public."userInfo"."middleName", public."userInfo"."lastName", 
    public."userInfo"."birthDay", public."userInfo"."status", public."userInfo"."aboutMe", public."userInfo"."address", 
    public."userInfo"."lastOnline"
    ,(SELECT "path" FROM public."MediaResource" where id = public."userInfo"."idAvatarMediaRes") as avatarPath 
	FROM public."FriendsRequest"
	INNER JOIN public."userInfo" ON "idWhoRes" = "idUserAuth"
	INNER JOIN public."userAuth" ON public."userInfo"."idUserAuth" = public."userAuth"."id"
    WHERE "type" = 'Friends' AND "idWhoReq" = ${userId}`, (err, res) => {
            if (!err) {
                let firstQuery = res.rows;
                client.query(`
                    SELECT public."FriendsRequest"."id" as idFriendsRequest, public."userInfo"."idUserAuth", public."userAuth"."login", 
                    public."userInfo"."firstName", public."userInfo"."middleName", public."userInfo"."lastName", 
                    public."userInfo"."birthDay", public."userInfo"."status", public."userInfo"."aboutMe", public."userInfo"."address", 
                    public."userInfo"."lastOnline"
                    ,(SELECT "path" FROM public."MediaResource" where id = public."userInfo"."idAvatarMediaRes") as avatarPath 
                    FROM public."FriendsRequest"
                    INNER JOIN public."userInfo" ON "idWhoReq" = "idUserAuth"
                    INNER JOIN public."userAuth" ON public."userInfo"."idUserAuth" = public."userAuth"."id"
                    WHERE "type" = 'Friends' AND "idWhoRes" = ${userId}`, (err2, res2) => {
                    if(!err2)
                    {
                        let lastQuery = res2.rows;
                        firstQuery = lastQuery.concat(firstQuery);
                        firstQuery = firstQuery.slice(from,from + howMuch);
                        callback(firstQuery);
                    }
                    else
                        callback(false);
                });
            }
            else
                callback(false);
        }
    );
}

exports.getDialogues = (idUserBy, callback) => {
    client.query(`
                SELECT "idUserAuth", "login", "firstName", "lastName", "messageText", TitleMessages."whenSended", "idFrom",
            (SELECT "path" FROM public."MediaResource" where id = public."userInfo"."idAvatarMediaRes") as avatarPath 
            FROM (SELECT max(id)as "id" , "idw", max("whenSended") as "whenSended" FROM 
              (SELECT max(id) as "id", "idFrom" as idw, max("whenSended") as "whenSended" FROM public."Messages" WHERE "idTo" = ${idUserBy} group by "idFrom"
            UNION
            SELECT max(id)as "id" , "idTo" as idw, max("whenSended") as "whenSended" 
               FROM public."Messages" WHERE "idFrom" = ${idUserBy} group by "idTo") as lastMsg group by "idw") as TitleMessages
            INNER JOIN public."userInfo" ON "idw" = public."userInfo"."idUserAuth"
            INNER JOIN public."userAuth" ON "idw" = public."userAuth"."id"
            INNER JOIN public."Messages" ON TitleMessages."id" = public."Messages"."id"
            ORDER BY TitleMessages."whenSended" DESC
    `, (err, res) => {
        if(!err)
            callback(res.rows);
        else
            callback(false);
    });
}

exports.getMessagesWith = (idUserFirst, idUserLast, from, howMuch, callback) =>
{
    client.query(`
        SELECT * FROM public."Messages" WHERE ("idFrom" = ${idUserFirst} AND "idTo" = ${idUserLast}) or ("idFrom" = ${idUserLast} AND "idTo" = ${idUserFirst})
        ORDER BY "whenSended" DESC
        LIMIT ${howMuch} OFFSET ${from};
    `, (err, res) => {
        if(!err)
        {
            let result = res.rows;
            result = result.reverse();

            const addMediaToMessage = async () => {
                await asyncForEach(result,async (item) => {
                    let resource = await client.query(`SELECT "type", "path" FROM public."MediaToMessage" 
                    INNER JOIN public."MediaResource" ON public."MediaResource".id = public."MediaToMessage"."idMedia" 
                    WHERE "idMessage" = ${item.id};`);
                    item.mediaResources = resource.rows;
                });
                callback(result);
            }
            addMediaToMessage();
        }
    });
}

exports.addMessage = (idUserFrom, idUserTo, message, callback) =>
{
    client.query(`INSERT INTO public."Messages"("idFrom", "idTo", "messageText", "whenSended") 
    VALUES (${idUserFrom}, ${idUserTo}, '${message}', now()) RETURNING id;`, (err, res) => {
        if(!err)
            callback(res.rows[0].id);
        else {
            callback(false);
        }
    });
}

exports.addMediaToMess = (idFiles, messId) =>
{
    idFiles.forEach(item => {
        client.query(`INSERT INTO public."MediaToMessage"("idMedia", "idMessage") VALUES (${item}, ${messId});`);
    });
}