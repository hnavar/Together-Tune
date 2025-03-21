import React from 'react';
import axios from 'axios';
import Playlists from './Playlists.jsx';
import PlayPlaylist from './PlayPlaylist.jsx';

class Account extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      profile: {},
      playlists: [],
      tracks: [],
      currentPlaying: {}
    };
    this.userProfile = this.userProfile.bind(this);
    this.getPlaylists = this.getPlaylists.bind(this);
    this.onePlaylist = this.onePlaylist.bind(this);
    this.playPlaylist = this.playPlaylist.bind(this);
  }
  userProfile() {
    axios({
      method: 'GET',
      url: '/me',
      headers: {
        'accessToken': this.props.accessTokenKey
      }
    }).then(({data}) => {
      // console.log(data);
      this.setState({
        profile: data
      });
    }).catch((err) => console.error('err'));
  }

  getPlaylists () {
    axios({
      method: 'GET',
      url: '/playlist',
      headers: {
        'accessToken': this.props.accessTokenKey
      }
    }).then(({data}) => {
      this.setState({
        playlists: data
      });
      return data;
    }).then((data) => {
      // things I want to share
      const user = this.state.profile.display_name;
      const playlistInfo = data.map((playlist) => {
        return {
          playlistIDs: playlist.id,
          images: playlist.images[0].url,
          title: playlist.name
        };
      });
      const sharePlaylist = {
        user: user,
        playlistInfo, playlistInfo
      };
      return sharePlaylist;
    }).then((data) => {
      axios({
        method: 'POST',
        url: '/sharePlaylist',
        headers: {
          'accessToken': this.props.accessTokenKey,
          'user': data.user
        },
        data: data
      });
    });
  }

  // not going to be used
  onePlaylist(playlist) {
    // console.log('click', playlist.id);
    axios({
      method: 'GET',
      url: `/playlist/${playlist.id}`,
      headers: {
        'accessToken': this.props.accessTokenKey
      }
    }).then(({data}) => {
      // console.log(data);
      this.setState({
        tracks: data.items,
      });
    });
  }

  playPlaylist(playlist) {
    // console.log(playlist);
    this.setState({
      playPlaylist: playlist
    });
    axios({
      method: 'GET',
      url: `/playlist/${playlist.id}`,
      headers: {
        'accessToken': this.props.accessTokenKey
      }
    }).then(({data}) => {
      // console.log(data);

      // separate albums that are single vs albums
      // to handle the offsets
      if (data.items[0].track.album.album_type === 'single') {
        const reqBody = {
          'context_uri': data.items[0].track.album.uri
        };
        axios({
          method: 'POST',
          url: '/sam',
          headers: {
            'accessToken': this.props.accessTokenKey
          },
          data: reqBody
        });
        
      } else {
        const reqBody = {
          'context_uri': data.items[0].track.album.uri,
          'offset': {
            'position': data.items[0].track.track_number - 1
          }
        };
        axios({
          method: 'POST',
          url: '/sam',
          headers: {
            'accessToken': this.props.accessTokenKey
          },
          data: reqBody
        });
      }
    });
  }

  

  componentDidMount() {
    this.userProfile();
    this.getPlaylists();
  }

  render () {
    const {profile, playlists, current, playPlaylist} = this.state;
    return (
      <div>

        <PlayPlaylist playlist={playPlaylist}/>

        {/* <h1>UserInfo</h1> */}
        <h4 style={{fontStyle: 'italic'}}>User: {profile.display_name}</h4>
        {/* <h4>Email: {profile.email}</h4>
        <h4>ID: {profile.id}</h4> */}
        <Playlists handleClick={this.playPlaylist} playlists={playlists} />
      </div>
    );
  }
}

export default Account;
