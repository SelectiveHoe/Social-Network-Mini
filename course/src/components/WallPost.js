import React from 'react';
import {photoViewerViewStateAction, changeViewerImgStackAction, changeViewIndex} from '../Reducer/reducerImgView'
import {} from '../Reducer/reducerUserInfo'
import {deleteWallPost} from '../Reducer/reducerViewedUser'
import { connect } from 'react-redux'
import probe from 'probe-image-size';

import Gallery from "react-photo-gallery"
import '../App.css';
import 'bootstrap/dist/css/bootstrap.css';
import {Navbar, Nav, NavDropdown, Image, Badge, Form, Button, Carousel} from 'react-bootstrap';
import {DeleteOutlined, HeartFilled, HeartOutlined , SendOutlined} from '@ant-design/icons'
import {forEach} from "react-bootstrap/cjs/ElementChildren";
import ReactAudioPlayer from 'react-audio-player';
import { Player } from 'video-react';

class WallPost extends React.Component
{
    constructor(props)
    {
        super(props);
        this.state = {
            images: [],
            music: [],
            videos: [],
        }

        this.props.postContent.mediaResources.map((item) => {
            if (item.type === 'photo') {
                let src = "http://localhost:8080" + item.path;
                let res = probe(src).then((res) => {
                    this.setState({images: this.state.images.concat({src: src, width: res.width, height: res.height})});
                });

            }
            else if (item.type === 'music')
            {
                let src = "http://localhost:8080" + item.path;
                this.setState({ music: this.state.music.push({url: src}) });
            }
            else if (item.type === 'video')
            {
                let src = "http://localhost:8080" + item.path;
                this.setState({ videos: this.state.videos.push({url: src}) });
            }
        });

        this.postText = this.props.postContent.mainText;
        this.countLikes = this.props.postContent.countLikes;
        this.renderImgPost = /*useCallback*/(({ index, left, top, key, photo}) => {
            return(<img key={photo.src} src={photo.src} width={photo.width} height={photo.height} className="photo smooth-anim" onClick={() => { this.props.changeViewerImgStackAction(this.state.images); this.props.changeViewIndex(index);  this.props.photoViewerViewStateAction(true); } }/>)})
    }

    getRightTimePost = () =>
    {
        let timeWhenPosted = new Date(this.props.postContent.whenPosted);
        if(timeWhenPosted > Date.now() - (60*1000))
            return 'только что';
        else if(timeWhenPosted > Date.now() - (3600*1000))
            return 'час назад';
        else
            return timeWhenPosted.getUTCDate() + "." + (timeWhenPosted.getMonth() + 1) + "." + timeWhenPosted.getFullYear()
                + " " + timeWhenPosted.getHours() + ":" + timeWhenPosted.getUTCMinutes();
    }

    deleteThisPost = () =>
    {
        this.props.deleteWallPost(this.props.postContent.id, this.props.userInfo.User.login);
    }

    canIDeleteThisPost = () =>
    {
        if(this.props.postContent.whoPostedAuthId === this.props.userInfo.User.idUserAuth)
        {
            return (
                <button className="btn btn-link p-0 float-right">
                    <DeleteOutlined style={{fontSize: '30px'}} onClick={this.deleteThisPost}/>
                </button>
            );
        }
    }

    render()
    {
        return (
            <div>
                <div className="gallery">
                    <Gallery photos={this.state.images} renderImage={this.renderImgPost}/>
                </div>
                <div className="mt-1">
                    {this.state.videos.map(item =>
                        <Player key={item.url} src={item.url} fluid={false} width={"100%"} height={400} controls/>
                    )}
                </div>
                <div className="d-flex m-0">
                    <div className="mr-auto h6 ">{this.postText}</div>
                    <span className="account-status ">{this.getRightTimePost()}</span>
                </div>
                <div>
                    <AudioPlayList music={this.state.music}/>
                </div>
                <hr className="mt-0 mb-0"/>
                <div>
                    <button className="btn btn-link p-0"><HeartOutlined style={{fontSize: '30px'}}/><span
                        className="font-weight-bold ubuntu-font"> {this.countLikes}</span></button>

                    <button className="btn btn-link p-0 float-right"><SendOutlined className=""
                                                                                   style={{fontSize: '30px'}}/>
                    </button>
                    {this.canIDeleteThisPost()}
                </div>
            </div>
        );
    }
}

function AudioPlayList(props)
{
    let music = props.music;
    const listmusic = music.map(item =>
        <ReactAudioPlayer src={item.url} controls style={{width: "100%", height: "25px"}}/>
    )

    return listmusic;
}

const actionCreators ={
    photoViewerViewStateAction, changeViewerImgStackAction, changeViewIndex, deleteWallPost
}


const mapStateToProps = (state) =>
{
    return{
        viewer: state.viewer,
        userInfo: state.userInfo,
        viewedUser: state.viewedUser
    }
}


export default connect(mapStateToProps, actionCreators)(WallPost);