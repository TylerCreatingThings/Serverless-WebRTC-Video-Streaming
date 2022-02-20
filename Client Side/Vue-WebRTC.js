<template  >
  <div >

      <v-container  id="mainVirtualBackground" >
      <v-row align="center" justify="center">
          <h2>YokD Virtual&copy; {{new Date().toLocaleString()}}</h2>
      </v-row>
      <v-row
      align="center" justify="center">
        <video autoplay playsinline muted class="local-video pb-2" id="local-video"></video>
      </v-row>
        <div   class="video-container">
           <video v-show="this.isConnected" autoplay playsinline class="remote-video" id="remote-video"></video>
           
           <div v-if="this.startedSession" style="position:fixed;bottom:50px;left:46vw;">
            <v-avatar v-if="this.isMuted == false" class="meetingIcon" color="white" @click="mute">
            <v-icon>
                mdi-microphone
            </v-icon>
            </v-avatar>
            <v-avatar v-if="this.isMuted" class="meetingIcon" color="white" @click="unmute">
            <v-icon>
                mdi-microphone-off
            </v-icon>
            </v-avatar>
            <v-avatar v-if="this.isVideoPaused == false" class="meetingIcon" color="white" @click="pauseVideo">
            <v-icon>
                mdi-video-box
            </v-icon>
            </v-avatar>
            <v-avatar v-if="this.isVideoPaused" class="meetingIcon" color="white" @click="unpauseVideo">
            <v-icon>
                mdi-video-box-off
            </v-icon>
            </v-avatar>
            </div>
        </div>
        <v-card id="waitTrainer"  v-if="this.isTrainer == false && this.startedSession == false">
        <h3>Waiting on Trainer to start session..</h3>
        <v-progress-circular
            :rotate="90"
            :size="100"
            :width="15"
            :value="value"
            color="red"
            >
            {{ value }}
        </v-progress-circular>
        </v-card>
        <v-card v-if="this.isTrainer && this.startedSession == false" style="display: inline-block; background-color: rgba(255,255,255,0.5);" class="pl-5 pr-5 pt-5">
            <h2 class="pb-5">Welcome trainer, enjoy your session!</h2>
            <br>
            <v-btn x-large color="#E23F27" @click="startSession" class="yo5 mb-3" dark>Start Session</v-btn>
        </v-card>
        <v-card v-if="this.isTrainer && this.startedSession" style="display: inline-block; background-color: rgba(255,255,255,0.5);position:fixed;bottom:5px;right:5vw;" class="pl-2 pr-2 pt-2 pb-2">
            <v-btn x-large color="#E23F27" @click="endSession" class="yokd-btn" dark>End Session</v-btn>
        </v-card>

        </v-container>

        <Conversation 
        chatStyle="position:fixed;top:10vh;left:1vw;width:19vw;height:75vh;">
        </Conversation>
            <v-snackbar
      v-model="snackbar"
    >
      {{ text }}

      <template v-slot:action="{ attrs }">
        <v-btn
          color="red"
          text
          v-bind="attrs"
          @click="snackbar = false;this.getLocalVideo();"
        >
          Try Again
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
import store from '../router/store'
import axios from 'axios';
import Conversation from "../views/Conversation";


// eslint-disable-next-line no-unused-vars
import { yokdApiEndpoints } from "@/constants/apiEndpoints";
'use strict';
const { RTCPeerConnection} = window;
const offerOptions = {
  offerToReceiveAudio: 1,
  offerToReceiveVideo: 1
};
var configuration = {
  iceServers: [
    {
      urls: 'stun:stun.l.google.com:19302'
    }
  ]
};

var peerConnection=new RTCPeerConnection(configuration);
  peerConnection.addEventListener('iceconnectionstatechange', e => this.onIceStateChange(peerConnection, e)); //logging

if (navigator.mediaDevices.getUserMedia === undefined) {
  navigator.mediaDevices.getUserMedia = function(constraints) {

    // First get ahold of the legacy getUserMedia, if present
    var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

    // Some browsers just don't implement it - return a rejected promise with an error
    // to keep a consistent interface
    if (!getUserMedia) {
      return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
    }

    // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
    return new Promise(function(resolve, reject) {
      getUserMedia.call(navigator, constraints, resolve, reject);
    });
  }
}

export default {  
    components: {
    Conversation
    },
    name: 'VirtualSession',
    mounted(){

        this.mobileCameraConstraints = { video: { facingMode: (this.mobileCameraPosition? "user" : "environment") } };
        //On mounted callUser.
        this.localVideo = document.getElementById('local-video');
        this.remoteVideo = document.getElementById('remote-video');
        //peerConnection.ontrack = e => this.remoteVideo.srcObject = e.streams[0];
        
        if(store.state.isUserSession == false){
            this.isTrainer = true;
        }else{
            this.offerExistsTimeout = window.setInterval( this.checkIfOfferExists, 3000);

            this.interval = setInterval(() => {
                if (this.value === 100) {
                return (this.value = 0)
                }
                this.value += 10
            }, 1000)
        }

    },
    watch:{
    $route (to, from){
        console.log(to+from);
        this.endSession();
    }
    },
    data() {
        return {
            mobileCameraConstraints: null,
            mobileCameraPosition:true,
            offerTimeout: '',
            answerTimeout: '',
            isConnected: false,
            temp:'',
            snackbar:false,
            text:'',
            iceCandidateInterval:'',
            countIceCandidate:0,
            checkReadyInterval:'',
            localVideo:'',
            remoteVideo:'',
            localStream:'',
            isTrainer: false,
            value: 0,
            startedSession: false,
            trainerEndedSession: false,
            isMuted: false,
            isVideoPaused: false,
        }
    },
      computed: {
    isMobile(){
      if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        return true;
      } else {
        return false;
      }
    }
    },
    methods: {
        mute(){
            this.isMuted = true;
            this.localStream.getAudioTracks()[0].enabled = false;
        },
        unmute(){
            this.isMuted = false;
            this.localStream.getAudioTracks()[0].enabled = true;
        },
        pauseVideo(){
            this.isVideoPaused = true;
            this.localStream.getVideoTracks()[0].enabled = false;
        },
        unpauseVideo(){
            this.isVideoPaused = false;
            this.localStream.getVideoTracks()[0].enabled = true;
        },
        checkIfOfferExists(){
                    axios.post(yokdApiEndpoints.checkIfOfferExists.replace('REPLACETOKEN',store.state.token).replace('REPLACEBOOKID',store.state.virtualBookId))
                    .then(response => {
                        //console.log(response.data);
                            if(response.data != undefined && response?.data[0]?.offer != undefined && response.data[0]?.offer != "None"){
                                window.clearInterval(this.offerExistsTimeout);
                                this.startSession();
                            }
                        }
                        )
          .catch((e) => {console.log(e)})
        },
        onIceStateChange(pc, event){
            if (pc) {
                //Ended session.
                  if (this.trainerEndedSession && (
                        pc.iceConnectionState === "disconnected" ||
                        pc.iceConnectionState === "closed")) {
                        this.endSession();
                    }
                    else if(pc.iceConnectionState === "closed" ||
                        pc.iceConnectionState === "disconnected"){
                        this.endSession();
                    }
                    // Handle the failure, try handshake again?
                    else if(pc.iceConnectionState === "failed" ){
                            this.startSession();
                    }
                    else if(pc.iceConnectionState === "connected"){
                        this.isConnected = true;
                        this.localVideo.setAttribute("style","width:13vw;position:fixed;right:20px;top:100px;");
                        this.remoteVideo.setAttribute("style","width:55vw");
                    }
                console.log(`${(pc)} ICE state: ${pc.iceConnectionState}`);
                console.log('ICE state change event: ', event);
            }
        },
        startSession(){
            peerConnection=new RTCPeerConnection(configuration);
            peerConnection.addEventListener('icecandidate', e => this.onIceCandidate(peerConnection, e));
            peerConnection.addEventListener('iceconnectionstatechange', e => this.onIceStateChange(peerConnection, e)); //logging
            peerConnection.addEventListener('track', this.gotRemoteStream);
            this.startedSession = true;
            this.getLocalVideo();
        },
        endSession(){
            this.trainerEndedSession = true;
            this.startedSession = false;
            peerConnection.close();
            peerConnection = null;
            const localVideo = document.getElementById("local-video");
            localVideo.srcObject = null;
            window.clearInterval(this.offerTimeout);
            window.clearInterval(this.answerTimeout);
            window.clearInterval(this.checkReadyInterval);
            console.log(this.localStream)
            this.localStream.getTracks().forEach(function(track) {
            track.stop();
            });
            this.$router.push('/endvirtualsession');
        },
        async getLocalVideo(){
              try {
                  var stream = null;
                  if(this.isMobile){
                    stream = await navigator.mediaDevices.getUserMedia({ video: {facingMode:"user"}, audio: true });
                  }else{
                        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                    }/* use the stream */
                this.localStream = stream;
                const localVideo = document.getElementById("local-video");
                if (localVideo) {
                    localVideo.srcObject = stream;
                }
                //peerConnection.addStream( localVideo.srcObject = stream)
                stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
                this.callUser();
                } catch(err) {
                    /* handle the error */
                    this.text = "You'll need a Mic and Video to do a virtual session, try plugging one in and trying again!";
                    this.snackbar = true;
                }
            
    
        },
        gotRemoteStream(e){
            const remoteVideo = document.getElementById("remote-video");
            if (remoteVideo.srcObject !== e.streams[0]) {
                remoteVideo.srcObject = e.streams[0];
            }
        },
        async callUser(){
            const offer = await peerConnection.createOffer(offerOptions);
            await peerConnection.setLocalDescription(offer);
            //peerConnection.addEventListener('ontrack', e => this.gotRemoteStream(e));

            //store offer in database.
            
            axios.post(yokdApiEndpoints.checkOffer.replace('REPLACETOKEN',store.state.token).replace('REPLACEBOOKINGID',store.state.virtualBookId),JSON.stringify(offer))
                    .then(response => {
                        //console.log(response);
                            if(response.data[0].SetOffer != "Set Offer"){
                                var offer = JSON.parse(response.data[0].SetOffer);
                                this.checkIfCallIsMade(offer);
                            }else{
                                //keep making call to check for an answer.
                                //if(this.offerTimeout == '')
                                this.offerTimeout = window.setInterval( this.waitForAnswer, 3000);
                            }
                        }
                        )
                    .catch((e) => {console.log(e)})
        },
        async waitForAnswer(){
            axios.post(yokdApiEndpoints.checkAnswer.replace('REPLACETOKEN',store.state.token).replace('REPLACEBOOKINGID',store.state.virtualBookId),'Waiting')
            .then(response => {
                    if(response.data[0].SetAnswer != "Set Answer" && response.data[0].SetAnswer != "Waiting"){
                        var answer = JSON.parse(response.data[0].SetAnswer);
                        this.onAnswerMade(answer);
                        window.clearInterval(this.offerTimeout);
                    }
                }
                )
            .catch((e) => {console.log(e)})
        },
        getOtherIceCandidates(){

                axios.get(yokdApiEndpoints.getVirtualBookingIceCandidates.replace('REPLACETOKEN',store.state.token).replace('REPLACEBOOKID',store.state.virtualBookId))
                .then(response => {
                    //Add Ice Candidates.
    
                        for(var i =0;i<response.data.length;i++){
                            if(response.data[i].candidate == null){
                                window.clearInterval(this.iceCandidateInterval);
                            }
                            this.addIceCandidate(JSON.parse(response.data[i].candidate));
                        }
                    }
                    )
                .catch((e) => {console.log(e)})
        },
        async addIceCandidate(candidate){
              try {
                await (peerConnection.addIceCandidate(new RTCIceCandidate(candidate)));
                    //onAddIceCandidateSuccess(pc); // Logging  call.
                } catch (e) {
                    console.log(e)
                    //onAddIceCandidateError(pc, e);
                }
        },
        async onIceCandidate(pc, event){
                axios.post(yokdApiEndpoints.addVirtualBookingIceCandidates.replace('REPLACETOKEN',store.state.token).replace('REPLACEBOOKID',store.state.virtualBookId),JSON.stringify(event.candidate))
                .then(() => {}
                    )
                .catch((e) => {console.log(e)})
            //call getVirtualBookingIceCandidates, add them. repeat.
        },
        async checkIfCallIsMade(offer){

            //If call is made, then..
            await peerConnection.setRemoteDescription(offer);
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);

            //then send the answer to the other dude.
            axios.post(yokdApiEndpoints.checkAnswer.replace('REPLACETOKEN',store.state.token).replace('REPLACEBOOKINGID',store.state.virtualBookId),JSON.stringify(answer))
            .then(response => {
                    if(response.data[0].SetAnswer != "Set Answer"){
                        var answer = JSON.parse(response.data[0].SetAnswer);
                        this.onAnswerMade(answer);
                    }else{
                        if(this.answerTimeout == '')
                        this.answerTimeout = window.setInterval(this.receiveVideo, 3000);
                    }
                }
                )
            .catch((e) => {console.log(e)})

        },
        async onAnswerMade(answer){
             await peerConnection.setRemoteDescription(answer);
                
                axios.get(yokdApiEndpoints.checkReady.replace('REPLACETOKEN',store.state.token).replace('REPLACEREADY','1').replace('REPLACEBOOKINGID',store.state.virtualBookId))
                .then(() => {
                    if(this.iceCandidateInterval == '')
                        this.iceCandidateInterval = window.setInterval(this.getOtherIceCandidates, 3000);
                    }
                    )
                .catch((e) => {console.log(e)})
        },
        async checkIfOtherIsReady(){
            axios.get(yokdApiEndpoints.checkReady.replace('REPLACETOKEN',store.state.token).replace('REPLACEREADY',0).replace('REPLACEBOOKINGID',store.state.virtualBookId))
            .then(response => {
                    if(response.data[0].SetReady == "Ready"){
                        window.clearInterval(this.answerTimeout);
                        window.clearInterval(this.checkReadyInterval);
                        if(this.iceCandidateInterval == '')
                            this.iceCandidateInterval = window.setInterval(this.getOtherIceCandidates, 3000);
                     
                    }
                }
                )
            .catch((e) => {console.log(e)})
        },
        async receiveVideo(){
            if(this.checkReadyInterval == '')
            this.checkReadyInterval = window.setInterval(this.checkIfOtherIsReady, 3000);
        }
    }

}
</script>

<style>

#mainVirtualBackground {
    background-image: url('../assets/gym-floor2.png') !important;
    height: 100%;
    background-size: cover;
    background-repeat: no-repeat;
    min-width: 100%;
    min-width: -moz-available;          /* WebKit-based browsers will ignore this. */
    min-width: -webkit-fill-available;  /* Mozilla-based browsers will ignore this. */
    min-width: fill-available;
}

.meetingIcon:hover {
    cursor:pointer;
}

</style>