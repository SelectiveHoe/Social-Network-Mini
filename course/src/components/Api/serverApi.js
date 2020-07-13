import axios from 'axios';
import {useCallback} from "react";
import {setWallPostByLogin} from "../../Reducer/reducerViewedUser";

const serverApiHost = "http://localhost:8080";

export const doLogin = (login, password, callback) =>
{
    axios.post(serverApiHost + "/login", { login: login, password: password }).then( res => {
        callback(res);
    });
}

export const doRegister = (registerForm, callback) =>
{
    axios.post(serverApiHost + "/register", registerForm).then( res => {
        callback(res);
    });
}

export const getUserByToken = (token, callback) =>
{
    axios.get(serverApiHost + `/users/byToken/${token}`).then(res => {
        callback(res.data);
    });
}

export const getUserByLogin = (login, callback) =>
{
    axios.get(serverApiHost + `/users/byLogin/${login}`).then(res => {
        callback(res.data);
    });
}

export const getWallPostByLogin = (login, totalWallPosts, callback) =>
{
    axios.get(serverApiHost + `/posts/${login}/${totalWallPosts}/${10}`).then(res => {
        callback(res.data);
    })
}

export const uploadFiles = (files, login, callback) =>
{
    const data = new FormData();
    files.forEach(file => {
        data.append('file', file);
    });
    axios.post(serverApiHost + `/uploadFiles/${login}`, data, { }).then(res => {
        callback(res);
    });
}

export const addWallPost = (idFiles, login, mainText, callback) =>
{
    axios.post(serverApiHost + `/addWallPost`, {idFiles: idFiles, login: login,mainText: mainText }, {}).then(res => {
        callback(res);
    });
}

export const deleteWallPostById = (idWallPost, callback) =>
{
    axios.post(serverApiHost + `/deleteWallPost`, {idPost: idWallPost}).then(res => {
        callback(res);
    });
}

export const changeProfilePhoto = (idNewPhoto, userLogin, callback) =>
{
    axios.post(serverApiHost + `/updateProfilePhoto`, {idNewPhoto: idNewPhoto, userLogin: userLogin}).then(res => {
        callback(res);
    });
}

export const changeProfileInfo = (profileInfo, token, callback) =>
{
    axios.post(serverApiHost + `/updateProfileInfo/${token}`, profileInfo).then(res => {
        callback(res);
    });
}

export const getUsers = (from, howMuch, callback) =>
{
    axios.get(serverApiHost + `/users/${from}/${howMuch}`).then(res => {
       callback(res.data);
    });
}

export const searchUsers = (search, from, howMuch, callback) =>
{
    axios.post(serverApiHost + `/users/${from}/${howMuch}`, {searchValue: search}).then(res => {
        callback(res.data);
    });
}

export const getFriends = (token, from, howMuch, callback) =>
{
    axios.get(serverApiHost + `/friends/${token}/${from}/${howMuch}`).then(res => {
        callback(res.data);
    });
}

export const addToFriend = (token, idWhoRes, callback) =>
{
    axios.post(serverApiHost + `/addToFriend`, {token: token, idWhoRes: idWhoRes}).then(res => {
        callback(res);
    });
}

export const getFriendsRequest = (token, callback) =>
{
    axios.get(serverApiHost + `/getFriendsRequest/${token}`).then(res => {
        callback(res.data);
    });
}

export const responseFriendRequest = (idWhoReq, token, answer, callback) =>
{
    axios.post(serverApiHost + `/responseFriendRequest`, { token: token, idWhoReq: idWhoReq, answer: answer}).then(res => {
        callback(res.data);
    });
}

export const getRelationShip = (token, idRelWith, callback) => {
    axios.post(serverApiHost + `/getRelationShip`, {token: token, idRelWith: idRelWith}).then(res => {
        callback(res.data);
    });
}

export const getDialogs = (token, callback) =>
{
    axios.get(serverApiHost + `/dialogs/${token}`).then(res => {
        callback(res.data);
    })
}

export const getMessages = (token, chatWith, from, howMuch, callback) =>
{
    axios.post(serverApiHost + `/getMessagesWith/${chatWith}/${from}/${howMuch}`, {token: token}).then( res =>{
        callback(res.data)
    });
}

export const addMessage = (files, messageText, tokenUserFrom, idUserTo, callback) =>
{
    axios.post(serverApiHost + `/sendMessage`, {files: files, messageText: messageText, tokenUserFrom: tokenUserFrom, idUserTo: idUserTo}, {}).then(res => {
        callback(res.data);
    });
}