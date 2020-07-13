import { getUserByLogin, getWallPostByLogin, deleteWallPostById,
    getRelationShip} from '../components/Api/serverApi';
import {changeServerMessage, changeUserToken, setUserByToken} from "./reducerUserInfo";

const ACTION_SET_USER = "SET_USER";
const ACTION_SET_WALLPOST_CLEAR = "SET_WALLPOST_CLEAR";
const ACTION_ADD_TO_WALLPOST = "ADD_TO_WALLPOST";
const ACTION_SET_DEFAULT = "SET_DEFAULT"
const ACTION_SET_RELATIONSHIP = "SET_RELATIONSHIP"

const initialState = {
    user: null,
    wallPost: []
}

export const reducerViewedUser = (state = initialState, action) =>
{
    switch(action.type)
    {
        case ACTION_SET_USER:
        {
            return {...state, user: action.payload};
        }
        case ACTION_SET_WALLPOST_CLEAR:
        {
            return {...state, wallPost: []};
        }
        case ACTION_ADD_TO_WALLPOST:
        {
            return {...state, wallPost: state.wallPost.concat(action.payload)};
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


export const setUser = (user) =>
    (
        {
            type: ACTION_SET_USER,
            payload: user,
        }
    )

export const setWallPostEmpty = () =>
    (
        {
            type: ACTION_SET_WALLPOST_CLEAR,
        }
    )

export const addToWallPost = (Elements) =>
    (
        {
            type: ACTION_ADD_TO_WALLPOST,
            payload: Elements,
        }
    )

export const resetViewedUserToDefault = () =>
    (
        {
            type: ACTION_SET_DEFAULT,
        }
    )

export const setUserByLogin = (login, callback) => (dispatch) =>
{
    getUserByLogin(login, (res) => {
        dispatch(setUser(res))
        callback(res);
    });
}

export const setWallPostByLogin = (login, currCountWallPosts) => (dispatch) =>
{
    let isNeedToClear = false;
    if(currCountWallPosts === undefined) {
        isNeedToClear = true;
        currCountWallPosts = 0;
    }
    getWallPostByLogin(login, currCountWallPosts , (res) => {
        if(isNeedToClear) {
            dispatch(setWallPostEmpty());
        }
            dispatch(addToWallPost(res));
    });
}

export const deleteWallPost = (idWallPost, loginUser) => (dispatch) =>
{
    deleteWallPostById(idWallPost, (res) => {
        console.log("server to delete wall post response: " + res);
        dispatch(setWallPostByLogin(loginUser));
    });
}