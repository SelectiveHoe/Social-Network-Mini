import React from 'react';
import '../../App.css';
import 'bootstrap/dist/css/bootstrap.css';
import {Image,  Button, InputGroup, FormControl} from 'react-bootstrap';
import {photoViewerViewStateAction, changeViewerImgStackAction, changeViewIndex} from '../../Reducer/reducerImgView'
import { connect } from 'react-redux'

class News extends React.Component
{
    constructor(props)
    {
        super(props);               
    }

    render()
    {
        document.title = `mini - News`;
        return (
        <div className="row top-space">
            News
        </div>
        );
    }
}

const actionCreators ={
    photoViewerViewStateAction, changeViewerImgStackAction, changeViewIndex
  }
  
  
  const mapStateToProps = (state) =>
  {
    return{
        viewer: state.viewer,
    }
  }
  
  
  export default connect(mapStateToProps, actionCreators)(News);