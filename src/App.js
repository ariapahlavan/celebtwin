import React, { Component } from 'react';
import Particles from 'react-particles-js';
import 'tachyons';
import './App.css';

import Navigation from './components/Navigation/Navigation';
import Rank from './components/Rank/Rank';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import SignIn from './components/SignIn/SignIn';
import Register from './components/Register/Register';
import Celebrities from './components/Celebrities/Celebrities';

const particleOptions = {
  particles: {
    number: {
      value: 30,
      density: {
        enable: true,
        value_area: 800
      }
    },
    move: {
      speed: 1
    }
  }
};

const initialState = {
  intput: '',
  imageUrl: '',
  boxex: [],
  celebs: [],
  route: 'signin',
  // route: 'home',
  isSingedIn: false,
  user: {
    id: 0,
    name: 'Demo',
    email: '',
    entries: 0,
    joined: ''
  },
};

const host = 'https://stunning-gunnison-41668.herokuapp.com';
// const host = 'http://localhost:3000';

class App extends Component {
  constructor() {
    super();
    this.state = initialState;

    fetch(`${host}/`);
  }

  render() {
    const { route, isSingedIn } = this.state;
    return (
      <div className="App">
        <Particles className='below'
                   params={particleOptions} />
        <Navigation onRouteChange={this.onRouteChange}
                    isSingedIn={isSingedIn}/>
        { this.contentsOf(route) }
      </div>
    );
  }

  contentsOf(route) {
    const {user, boxes, celebs, imageUrl} = this.state;
    switch(route) {
      case 'home':
        return <div>
                  <Rank name={user.name}
                        entries={user.entries} />
                  <ImageLinkForm onInputChange={this.onInputChange}
                                 onDetectClick={this.onDetectClick }/>
                  <Celebrities celebs={celebs}/>
                  <FaceRecognition boxes={boxes}
                                   imageUrl={imageUrl}/>
               </div>;
      case 'register':
        return <Register onRouteChange={this.onRouteChange}
                         loadUser={this.loadUser}
                         host={host}/>;
      case 'signin':
      default:
        return <SignIn onRouteChange={this.onRouteChange}
                       loadUser={this.loadUser}
                       host={host}/>;
    }
  }

  loadUser = ({id, name, email, entries, joined}) => {
    this.setState({user: {
        id: id,
        name: name,
        email: email,
        entries: entries,
        joined: joined
      }
    })
  }

  onRouteChange = (route) => {
    if (route === 'home') {
      this.setState({ isSingedIn: true });
    } else {
      this.setState(initialState);
    }

    this.setState({ route: route });
  }

  onInputChange = (event) => {
    this.setState({ input: event.target.value});
  }

  onDetectClick = () => {
    const inputUrl = this.state.input;
    if (inputUrl === undefined || !this.isValidURL(inputUrl))
      return;

    this.setState({ imageUrl: inputUrl });

    fetch(`${host}/imageUrl`, {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ imageUrl: inputUrl })
    })
      .then(response => response.json())
      .then(this.calculateFaceLocation)
      .then(this.updateRanking)
      .then(this.displayFaceBox)
      .then(this.displayCelebsMatched)
      .catch(console.log);
  }

  isValidURL = (string) => {
    const res = string.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/g);
    return res != null;
  }

  calculateFaceLocation = (resp) => {
    try {
      if (!resp.outputs[0].data.regions[0])
        return Promise.reject();
    } catch (e) {
      return Promise.reject();
    }

    const image = document.getElementById('inputimage');
    const w = Number(image.width);
    const h = Number(image.height);

    const boxList = [];
    const regionsFound = resp.outputs[0].data.regions;
    for (let i = 0; i < regionsFound.length; i++) {
      boxList.push(
        this.regionInfoToBoxParams(regionsFound[i].region_info, h, w)
      );
    }

    const celebList = [];
    const celebsMatched = regionsFound[0].data.face.identity.concepts;
    for (let i = 0; i < Math.min(celebsMatched.length, 3); i++) {
      celebList.push(
        this.celebInfoToCelebObj(celebsMatched[i])
      );
    }

    return Promise.resolve({
      boxes: boxList,
      celebs: celebList
    });
  }

  regionInfoToBoxParams = (regionInfo, h, w) => {
    const clarifaiFace = regionInfo.bounding_box;
    const {bottom_row, left_col, right_col, top_row} = clarifaiFace;

    return {
      top: top_row * h,
      left: left_col * w,
      bot: (1-bottom_row) * h,
      right: (1-right_col) * w
    };
  }

  celebInfoToCelebObj = ({name, value}) => ({
      name: name,
      prob: value
  });

  updateRanking = (data) => {
    fetch(`${host}/image`, {
      method: 'put',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({id: this.state.user.id})
    })
      .then(response => response.json())
      .then(count => count === 'no such user' ? 0 : count)
      .then(count => this.setState(Object.assign(this.state.user, {entries: count})))
      .catch(console.log);

    return data;
  }

  displayFaceBox = (data) => {
    this.setState({ boxes: data.boxes });

    return data;
  }

  displayCelebsMatched = ({celebs}) => this.setState({ celebs: celebs });
}

export default App;
