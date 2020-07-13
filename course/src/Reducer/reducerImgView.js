const ACTION_PHOTO_VIEWER_VIEW_STATE = "PHOTO_VIEWER_VIEW_STATE";
const ACTION_CHANGE_VIEWER_STACK = "CHANGE_VIEWER_STACK";
const ACTION_CHANGE_VIEWER_PHOTO_INDEX = "CHANGE_VIEWER_PHOTO_INDEX";

const initialState = {
    isPhotoViewer: false,
    ViewerPhotoStack: [{
                        src: "1.jpg",
                        width: 1920,
                        height: 1080,
                        },
                        {
                        src: "3.jpg",
                        width: 2,
                        height: 2,
                        }],
    ViewPhotoIndex: 0,
}

export const reducerImgView = (state = initialState, action) =>
{
    switch(action.type)
    {
        case ACTION_PHOTO_VIEWER_VIEW_STATE:
        {                        
            return {...state, isPhotoViewer: action.payload};
        }
        case ACTION_CHANGE_VIEWER_STACK:
        {
            return {...state, ViewerPhotoStack: action.payload};
        }   
        case ACTION_CHANGE_VIEWER_PHOTO_INDEX:
        {
            return {...state, ViewPhotoIndex: action.payload}
        }
        default: 
        {
            return state;
        }
    }
}

export const photoViewerViewStateAction = (isShow) =>
(
 {   
        type: ACTION_PHOTO_VIEWER_VIEW_STATE,
        payload: isShow,
 }  
)

export const changeViewerImgStackAction = (imgStack) =>
(
    {  
        type: ACTION_CHANGE_VIEWER_STACK,
        payload: imgStack,
    }  
)

export const changeViewIndex = (index) =>
(
    {  
        type: ACTION_CHANGE_VIEWER_PHOTO_INDEX,
        payload: index,
    }  
)