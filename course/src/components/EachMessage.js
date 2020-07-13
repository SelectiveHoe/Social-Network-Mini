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

class EachMessage extends React.Component
{
    constructor(props)
    {
        super(props);
        this.state = {
            images: [],
            music: [],
            videos: [],
        }

         this.renderImgPost = /*useCallback*/(({ index, left, top, key, photo}) => {
             return(<img key={photo.src} src={photo.src} width={photo.width} height={photo.height} className="photo smooth-anim" onClick={() => { this.props.changeViewerImgStackAction(this.state.images); this.props.changeViewIndex(index);  this.props.photoViewerViewStateAction(true); } }/>)})
    }

    componentDidMount = () =>
    {
        this.props.messageContent.mediaResources.map((item) => {
            if (item.type === 'photo') {
                let src = "http://localhost:8080" + item.path;
                probe(src).then((res) => {
                    this.setState({images: this.state.images.concat({src: src, width: res.width, height: res.height})});
                });
            }
            else if (item.type === 'music')
            {
                let src = "http://localhost:8080" + item.path;
                this.setState({ music: this.state.music.concat([{url: src}]) });
            }
            else if (item.type === 'video')
            {
                let src = "http://localhost:8080" + item.path;
                this.setState({ videos: this.state.videos.concat([{url: src}]) });
            }
        });

    }

    getRightData = (time) =>
    {
        time = new Date(time);
        return time.getUTCDate() + "." + (time.getMonth() + 1) + "." + time.getFullYear() + " " + time.getHours() + ":" + time.getMinutes();
    }

    render()
    {
        if(this.props.isYou) {
            return (
                <div className="m-2 mb-3 p-1 mr-auto position-relative" style={{minWidth: 100}}>
                    <div className="img-thumbnail pl-2 pr-2 pt-1 pb-1 m-0" >
                        {this.state.images.length === 0 ? "" :
                            <div className="gallery" style={{minWidth: 450, maxWidth: 450}}>
                                <Gallery photos={this.state.images} renderImage={this.renderImgPost}/>
                            </div>
                        }
                        {this.state.videos.length === 0 ? "" :
                            <div className="mt-1">
                                {this.state.videos.map(item =>
                                    <Player key={item.url} src={item.url} fluid={false} width={400} height={200} controls/>
                                )}
                            </div>
                        }
                        {this.props.messageContent.messageText}
                        <div>
                            {this.state.music.map(item => <ReactAudioPlayer src={item.url} controls style={{width: "500px", height: "25px"}}/>)}
                        </div>
                    </div>
                    <span style={{fontSize: 10, left: 3}} className="position-absolute">{this.getRightData(this.props.messageContent.whenSended)}</span>
                </div>
            );
        }
        else {
            return (
                <div className="m-2 p-1 mb-3 ml-auto position-relative">
                    <div className="img-thumbnail pl-2 pr-2 pt-1 pb-1 m-0" style={{background: "aliceblue", minWidth: "auto"}}>
                        {this.state.images.length === 0 ? "" :
                            <div className="gallery" style={{minWidth: 450, maxWidth: 450}}>
                                <Gallery photos={this.state.images} renderImage={this.renderImgPost}/>
                            </div>
                        }
                        {this.state.videos.length === 0 ? "" :
                            <div className="mt-1">
                                {this.state.videos.map(item =>
                                    <Player key={item.url} src={item.url} fluid={false} width={400} height={200} controls/>
                                )}
                            </div>
                        }
                        {this.state.music.map(item => <ReactAudioPlayer src={item.url} controls style={{width: "100%", height: "25px"}}/>)}
                        {this.props.messageContent.messageText}
                    </div>
                    <span  style={{fontSize: 10, right: 3}} className="position-absolute">{this.getRightData(this.props.messageContent.whenSended)}</span>
                </div>
            );
        }
    }
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


export default connect(mapStateToProps, actionCreators)(EachMessage);