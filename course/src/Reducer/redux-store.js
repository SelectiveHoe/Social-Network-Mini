import { createStore, combineReducers, applyMiddleware } from 'redux';
import { reducerImgView } from './reducerImgView';
import { reducerUserInfo } from './reducerUserInfo';
import { reducerViewedUser } from './reducerViewedUser';
import thunk from 'redux-thunk';


let reducers = combineReducers({
    viewer: reducerImgView,
    userInfo: reducerUserInfo,
    viewedUser: reducerViewedUser
})

const store = createStore(reducers, applyMiddleware(thunk));

export default store;