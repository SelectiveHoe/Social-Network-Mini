import { doLogin, doRegister, getUserByToken, uploadFiles, addWallPost, changeProfilePhoto,
    changeProfileInfo } from '../components/Api/serverApi';
import {setUserByLogin, setWallPostByLogin} from '../Reducer/reducerViewedUser';
import { useCookies } from 'react-cookie';
import openSocket from "socket.io-client";

const ACTION_CHANGE_USER_TOKEN = "CHANGE_USER_TOKEN";
const ACTION_CHANGE_USER = "CHANGE_USER";
const ACTION_CHANGE_SERVER_MESSAGE = "CHANGE_SERVER_MESSAGE";
const ACTION_CHANGE_IS_COOKIE_LOAD = "CHANGE_IS_COOKIE_LOAD";
const ACTION_SET_NOTIFICATION = "SET_NOTIFICATION";
const ACTION_SET_DEFAULT = "SET_DEFAULT";
const ACTION_DELETE_FROM_NOTIFICATION = "DELETE_FROM_NOTIFICATION";

const initialState = {
    token: null,
    msgCount: undefined,
    User: null,
    serverMessage: '',
    isLoadFromCookieComlpete: false,
    listNotification: [],
}

export const reducerUserInfo = (state = initialState, action) =>
{
    switch(action.type)
    {
        case ACTION_CHANGE_USER_TOKEN:
            {
                return {...state, token: action.payload};
            }
        case ACTION_CHANGE_USER:
            {
                return {...state, User: action.payload};
            }
        case ACTION_CHANGE_SERVER_MESSAGE:
            {
                return {...state, serverMessage: action.payload};
            }
        case ACTION_CHANGE_IS_COOKIE_LOAD:
            {
                return {...state, isLoadFromCookieComlpete: action.payload};
            }
        case ACTION_SET_NOTIFICATION:
            {
                console.log(state);
                return {...state, listNotification: state.listNotification.concat([action.payload])}
            }
        case ACTION_DELETE_FROM_NOTIFICATION:
            {
                const arr = state.listNotification;
                let index = -1;
                for(let i = 0; i < arr.length; i++)
                {
                    if(arr[i].userLogin == action.payload.userLogin && arr[i].message == action.payload.message)
                    {
                        index = i;
                        break;
                    }
                }
                if (index > -1) {
                    arr.splice(index, 1);
                }
                return {...state, listNotification: arr}
            }
        case ACTION_SET_DEFAULT:
            {
                return initialState;
            }
        default: 
            {
                return state;
            }
    }
}

export const DeleteFromNotification = (itemToDelete) =>
(
    {
        type: ACTION_DELETE_FROM_NOTIFICATION,
        payload: itemToDelete
    }
)

export const changeNotification = (newNotList) =>
(
    {
        type: ACTION_SET_NOTIFICATION,
        payload: newNotList,
    }
)

export const changeUserToken = (token) =>
(
 {   
        type: ACTION_CHANGE_USER_TOKEN,
        payload: token,
 }  
)

export const resetUserInfoToDefault = () =>
    (
        {
            type: ACTION_SET_DEFAULT,
        }
    )

export const changeServerMessage = (serverMessage) =>
    (
        {
            type: ACTION_CHANGE_SERVER_MESSAGE,
            payload: serverMessage,
        }
    )


export const changeUser = (User) =>
(
 {   
        type: ACTION_CHANGE_USER,
        payload: User,
 }  
)

export const changeIsCookieLoad = (isCookieLoad) =>
    (
        {
            type: ACTION_CHANGE_IS_COOKIE_LOAD,
            payload: isCookieLoad,
        }
    )

export const serverLogin = (login, password, cookies) => (dispatch) =>
{
    doLogin(login, password, (res) => {
        cookies.set('sessionToken', res.data.aBody.token, { path: '/' });
        dispatch(changeUserToken(res.data.aBody.token));
        dispatch(changeServerMessage(res.data.aMsg));
        dispatch(setUserByToken(res.data.aBody.token), () => {});
    });
}

export const serverRegister = (registerFrom) => (dispatch) =>
{
    doRegister(registerFrom, (res) => {
        dispatch(changeServerMessage(res.data.aMsg));
    });
}

export const setUserByToken = (token, callback) => (dispatch) =>
{
    getUserByToken(token, (user) => {
        dispatch(changeUser(user));
        const socket = openSocket('http://localhost:8080');
        socket.on(`${token}-NewMessage`, notification => {
            dispatch(changeNotification(notification))
            setTimeout(() => {dispatch(DeleteFromNotification(notification))}, 10000);
        });
        socket.on(`${token}-FriendRequest`, notification => {
            dispatch(changeNotification(notification))
            setTimeout(() => {dispatch(DeleteFromNotification(notification))}, 10000);
        });
        try{
            callback();
        }catch
        {}
    });
}

export const addNewWallPost = (mediaContent, text, userLogin) => (dispatch) =>
{
    uploadFiles(Array.from(mediaContent), userLogin, (res) => {
        let idMediaToNewWallPost = res.data;
        addWallPost(idMediaToNewWallPost, userLogin, text, (result) => {
            dispatch(setWallPostByLogin(userLogin));
        });
    });
}

export const updateProfilePhoto = (newAvatar, userLogin, token) => (dispatch) =>
{
    uploadFiles([newAvatar], userLogin, (res) => {
        let arrayIndexNewPhotos = res.data; // arrayIndexNewPhotos[0] - id new profile photo
        changeProfilePhoto(arrayIndexNewPhotos[0], userLogin, (res) => {
            if(res)
            {
                dispatch(setUserByToken(token, ()=>{}))
            }
        });
    });
}

export const updateProfileInfo = (profileInfoForm, token, login, callback) => (dispatch) =>
{
    changeProfileInfo(profileInfoForm, token, (res) => {
        if(res.data) {
            dispatch(setUserByToken(token, ()=>{}));
            dispatch(setUserByLogin(login, ()=>{}));
            dispatch(setWallPostByLogin(login));
            callback();
        }
    });
}