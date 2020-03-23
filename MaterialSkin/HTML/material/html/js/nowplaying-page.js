/**
 * LMS-Material
 *
 * Copyright (c) 2018 Craig-2019 Drummond <craig.p.drummond@gmail.com>
 * MIT license.
 */
'use strict';

const BIO_TAB = 0;
const REVIEW_TAB = 1;
const LYRICS_TAB = 2;

var lmsNowPlaying = Vue.component("lms-now-playing", {
    template: `
<div>
 <v-tooltip v-if="!IS_MOBILE" top :position-x="timeTooltip.x" :position-y="timeTooltip.y" v-model="timeTooltip.show">{{timeTooltip.text}}</v-tooltip>
 <v-menu v-model="menu.show" :position-x="menu.x" :position-y="menu.y" absolute offset-y>
  <v-list v-if="info.show">
   <v-list-tile @click="adjustFont(10)" v-bind:class="{'disabled':infoZoom<=10}"><v-list-tile-title>{{trans.stdFont}}</v-list-tile-title></v-list-tile>
  <v-list-tile @click="adjustFont(15)" v-bind:class="{'disabled':infoZoom==15}"><v-list-tile-title>{{trans.mediumFont}}</v-list-tile-title></v-list-tile>
  <v-list-tile @click="adjustFont(20)" v-bind:class="{'disabled':infoZoom>=20}"><v-list-tile-title>{{trans.largeFont}}</v-list-tile-title></v-list-tile>
  </v-list>
  <v-list v-else>
   <v-list-tile @click="showPic()">
    <v-list-tile-avatar v-if="menuIcons" :tile="true" class="lms-avatar"><v-icon>photo</v-icon></v-list-tile-avatar>
    <v-list-tile-title>{{menu.text[0]}}</v-list-tile-title>
   </v-list-tile>
   <v-list-tile @click="trackInfo()">
    <v-list-tile-avatar v-if="menuIcons" :tile="true" class="lms-avatar"><img class="svg-img" :src="'more' | svgIcon(darkUi)"></img></v-list-tile-avatar>
    <v-list-tile-title>{{menu.text[1]}}</v-list-tile-title>
   </v-list-tile>
  </v-list>
 </v-menu>
 
 <div v-if="desktopLayout && !largeView" class="np-bar noselect" id="np-bar">
  <v-layout row class="np-controls-desktop" v-if="stopButton">
   <v-flex xs3>
    <v-btn flat icon v-bind:class="{'disabled':disablePrev}" v-longpress:true="prevButton" :title="trans.prev"><v-icon large>skip_previous</v-icon></v-btn>
   </v-flex>
   <v-flex xs3>
    <v-btn flat icon v-longpress="playPauseButton" @click.middle="showSleep" id="playPauseA" :title="playerStatus.isplaying ? trans.pause : trans.play"><v-icon large>{{playerStatus.isplaying ? 'pause' : 'play_arrow'}}</v-icon></v-btn>
   </v-flex>
   <v-flex xs3>
    <v-btn flat icon @click="doAction(['stop'])" :title="trans.stop"><v-icon large>stop</v-icon></v-btn>
   </v-flex>
   <v-flex xs3>
    <v-btn flat icon v-bind:class="{'disabled':disableNext}" v-longpress:true="nextButton" :title="trans.next"><v-icon large>skip_next</v-icon></v-btn>
   </v-flex>
  </v-layout>
  <v-layout row class="np-controls-desktop" v-else>
   <v-flex xs4>
    <v-btn flat icon v-bind:class="{'disabled':disablePrev}" v-longpress:true="prevButton" class="np-std-button" :title="trans.prev"><v-icon large>skip_previous</v-icon></v-btn>
   </v-flex>
   <v-flex xs4>
    <v-btn flat icon v-longpress="playPauseButton" @click.middle="showSleep" id="playPauseB" class="np-playpause":title="playerStatus.isplaying ? trans.pause : trans.play"><v-icon x-large>{{ playerStatus.isplaying ? 'pause_circle_outline' : 'play_circle_outline'}}</v-icon></v-btn>
   </v-flex>
   <v-flex xs4>
    <v-btn flat icon v-bind:class="{'disabled':disableNext}" v-longpress:true="nextButton" class="np-std-button" :title="trans.next"><v-icon large>skip_next</v-icon></v-btn>
   </v-flex>
  </v-layout>
  <img :key="coverUrl" v-lazy="coverUrl" class="np-image-desktop" v-bind:class="{'radio-img': 0==playerStatus.current.duration}" @contextmenu="showContextMenu" @click="clickImage(event)"></img>
  <v-list two-line subheader class="np-details-desktop" v-bind:class="{'np-details-desktop-sb' : stopButton}">
   <v-list-tile style>
    <v-list-tile-content>
     <v-list-tile-title v-if="playerStatus.current.title">{{playerStatus.current.title}}</v-list-tile-title>
     <v-list-tile-sub-title v-if="playerStatus.current.artistAndComposer && playerStatus.current.album">{{playerStatus.current.artistAndComposer}}{{SEPARATOR}}{{playerStatus.current.album}}</v-list-tile-sub-title>
     <v-list-tile-sub-title v-else-if="playerStatus.current.artistAndComposer && playerStatus.current.remote_title && playerStatus.current.remote_title!=playerStatus.current.title">{{playerStatus.current.artistAndComposer}}{{SEPARATOR}}{{playerStatus.current.remote_title}}</v-list-tile-sub-title>
     <v-list-tile-sub-title v-else-if="playerStatus.current.artistAndComposer">{{playerStatus.current.artistAndComposer}}</v-list-tile-sub-title>
     <v-list-tile-sub-title v-else-if="playerStatus.current.album">{{playerStatus.current.album}}</v-list-tile-sub-title>
     <v-list-tile-sub-title v-else-if="playerStatus.current.remote_title && playerStatus.current.remote_title!=playerStatus.current.title">{{playerStatus.current.remote_title}}</v-list-tile-sub-title>
     <v-list-tile-sub-title v-else-if="playerStatus.current.title">&#x22ef;</v-list-tile-sub-title>
    </v-list-tile-content>
    <v-list-tile-action>
     <div v-if="(techInfo || ratingsSupported) && wide>0">
      <div class="np-tech-desktop">{{techInfo && (wide>1 || (!showRatings && wide>0)) ? playerStatus.current.technicalInfo : ""}}</div>
      <v-rating v-if="showRatings && wide>0" class="np-rating-desktop" small v-model="rating.value" half-increments hover clearable @click.native="setRating"></v-rating>
     </div>
     <div v-else-if="playerStatus.playlist.count>1" class="np-tech-desktop" @click="toggleTime()">{{formattedTime}}</div>
     <div v-else class="np-tech-desktop">&nbsp;</div>
     <div v-if="((techInfo || ratingsSupported) && wide>0) || playerStatus.playlist.count<2" class="np-time-desktop" @click="toggleTime()">{{formattedTime}}{{playerStatus.playlist.current | trackCount(playerStatus.playlist.count, SEPARATOR)}}</div>
     <div v-else class="np-time-desktop" @click="toggleTime()">{{playerStatus.playlist.current | trackCount(playerStatus.playlist.count)}}</div>
    </v-list-tile-action>
   </v-list-tile>
  </v-list>
  <v-progress-linear height="5" id="pos-slider" v-if="playerStatus.current.duration>0" class="np-slider np-slider-desktop" v-bind:class="{'np-slider-desktop-sb' : stopButton}" :value="playerStatus.current.pospc" v-on:click="sliderChanged($event)" @mouseover="timeTooltip.show = true" @mouseout="timeTooltip.show = false" @mousemove="moveTimeTooltip"></v-progress-linear>

  <div v-if="info.show" class="np-info np-info-desktop bgnd-cover np-info-cover" id="np-info">
   <v-tabs centered v-model="info.tab" v-if="info.showTabs" style="np-info-tab-cover">
    <template v-for="(tab, index) in info.tabs">
     <v-tab :key="index">{{tab.title}}</v-tab>
     <v-tab-item :key="index" transition="" reverse-transition=""> <!-- background image causes glitches with transitions -->
      <v-card flat class="np-info-card-cover" @contextmenu="showContextMenu">
       <v-card-text :class="['np-info-text-desktop', zoomInfoClass, LYRICS_TAB==index || tab.isMsg ? 'np-info-lyrics' : '']" v-html="tab.text"></v-card-text>
      </v-card>
     </v-tab-item>
    </template>
   </v-tabs>
   <div v-else>
    <v-layout row>
     <template v-for="(tab, index) in info.tabs">
      <v-flex xs4>
       <v-card flat class="np-info-card-cover" @contextmenu="showContextMenu">
        <v-card-title><p>{{tab.title}}</p></v-card-title>
        <v-card-text :class="['np-info-text-full-desktop', zoomInfoClass, LYRICS_TAB==index || tab.isMsg ? 'np-info-lyrics' : '']" v-html="tab.text"></v-card-text>
       </v-card>
      </v-flex>
     </template>
    </v-layout>
   </div>
   <v-card class="np-info-card-cover">
    <v-card-actions>
     <v-spacer></v-spacer>
     <v-btn flat icon v-if="info.showTabs" @click="info.showTabs=false" :title="trans.expand"><v-icon style="margin-right:-18px">chevron_right</v-icon><v-icon style="margin-left:-18px">chevron_left</v-icon></v-btn>
     <v-btn flat icon v-else @click="info.showTabs=true" :title="trans.collapse"><v-icon style="margin-right:-18px">chevron_left</v-icon><v-icon style="margin-left:-18px">chevron_right</v-icon></v-btn>
     <div style="width:32px"></div>
     <v-btn flat icon v-if="info.sync" @click="info.sync = false" :title="trans.sync"><v-icon class="active-btn">link</v-icon></v-btn>
     <v-btn flat icon v-else @click="info.sync = true" :title="trans.unsync"><v-icon class="dimmed">link_off</v-icon></v-btn>
     <div style="width:32px"></div>
     <v-btn flat icon @click="trackInfo()" :title="trans.more"><img class="svg-img" :src="'more' | svgIcon(darkUi)"></img></v-btn>
     <v-spacer></v-spacer>
    </v-card-actions>
   </v-card>
  </div>
 </div>
 
 <div class="np-page bgnd-cover" v-else id="np-page">
  <div v-if="info.show" class="np-info bgnd-cover" id="np-info">
   <v-tabs centered v-model="info.tab" class="np-info-tab-cover">
    <template v-for="(tab, index) in info.tabs">
     <v-tab :key="index">{{tab.title}}</v-tab>
     <v-tab-item :key="index" transition="" reverse-transition=""> <!-- background image causes glitches with transitions -->
      <v-card flat class="np-info-card-cover" @contextmenu="showContextMenu">
       <v-card-text :class="['np-info-text', zoomInfoClass, LYRICS_TAB==index || tab.isMsg ? 'np-info-lyrics' : '']" v-html="tab.text"></v-card-text>
      </v-card>
     </v-tab-item>
    </template>
   </v-tabs>
   <v-card class="np-info-card-cover">
    <v-card-actions>
     <v-spacer></v-spacer>
     <v-btn flat icon v-if="info.sync" @click="info.sync = false" :title="trans.sync"><v-icon class="active-btn">link</v-icon></v-btn>
     <v-btn flat icon v-else @click="info.sync = true" :title="trans.unsync"><v-icon class="dimmed">link_off</v-icon></v-btn>
     <div style="width:32px"></div>
     <v-btn flat icon @click="trackInfo()" :title="trans.more"><img class="svg-img" :src="'more' | svgIcon(darkUi)"></img></v-btn>
     <v-spacer></v-spacer>
    </v-card-actions>
   </v-card>
  </div>
  <div v-else>
   <div v-show="overlayVolume>-1 && playerStatus.dvc" id="volumeOverlay">{{overlayVolume}}%</div>
   <div v-if="landscape" v-touch:start="touchStart" v-touch:end="touchEnd" v-touch:moving="touchMoving">
    <img v-if="!info.show" :key="coverUrl" v-lazy="coverUrl" class="np-image-landscape" v-bind:class="{'np-image-landscape-wide': landscape && wide>1}" @contextmenu="showMenu" @click="clickImage(event)"></img>
    <div class="np-details-landscape">
     <div class="np-text-landscape np-title" v-bind:class="{'np-text-landscape-1': lowHeight}" v-if="playerStatus.current.title">{{playerStatus.current.title | limitStr}}</div>
     <div class="np-text-landscape" v-else>&nbsp;</div>
     <div class="np-text-landscape subtext" v-bind:class="{'np-text-landscape-1': lowHeight}" v-if="playerStatus.current.artistAndComposer">{{playerStatus.current.artistAndComposer | limitStr}}</div>
     <div class="np-text-landscape" v-else>&nbsp;</div>
     <div class="np-text-landscape subtext" v-bind:class="{'np-text-landscape-1': lowHeight}" v-if="playerStatus.current.album">{{playerStatus.current.album | limitStr}}</div>
     <div class="np-text-landscape subtext" v-bind:class="{'np-text-landscape-1': lowHeight}" v-else-if="playerStatus.current.remote_title && playerStatus.current.remote_title!=playerStatus.current.title">{{playerStatus.current.remote_title | limitStr}}</div>
     <div class="np-text-landscape" v-else>&nbsp;</div>
     <div v-if="showRatings && playerStatus.current.duration>0 && undefined!=rating.value" class="np-text-landscape">
      <v-rating v-if="maxRating>5" v-model="rating.value" half-increments hover clearable @click.native="setRating"></v-rating>
      <v-rating v-else v-model="rating.value" hover clearable @click.native="setRating"></v-rating>
     </div>
     <div v-if="wide>1">

      <v-layout text-xs-center row wrap class="np-controls-wide">
       <v-flex xs12 class="np-tech ellipsis" v-if="techInfo || playerStatus.playlist.count>1">{{techInfo ? playerStatus.current.technicalInfo : ""}}{{playerStatus.playlist.current | trackCount(playerStatus.playlist.count, techInfo ? SEPARATOR : undefined)}}</v-flex>
       <v-flex xs12 v-if="!info.show && undefined!=playerStatus.current.time">
        <v-layout class="np-time-layout">
         <p class="np-pos" v-bind:class="{'np-pos-center': playerStatus.current.duration<=0}">{{playerStatus.current.time | displayTime}}</p>
         <v-progress-linear height="5" v-if="playerStatus.current.duration>0" id="pos-slider" class="np-slider" :value="playerStatus.current.pospc" v-on:click="sliderChanged($event)" @mouseover="timeTooltip.show = true" @mouseout="timeTooltip.show = false" @mousemove="moveTimeTooltip"></v-progress-linear>
         <p class="np-duration cursor" v-if="(showTotal || !playerStatus.current.time) && playerStatus.current.duration>0" @click="toggleTime()">{{playerStatus.current.duration | displayTime}}</p>
         <p class="np-duration cursor" v-else-if="playerStatus.current.duration>0" @click="toggleTime()">-{{playerStatus.current.duration-playerStatus.current.time | displayTime}}</p>
        </v-layout>
       </v-flex>
       <v-flex xs12 v-else-if="!info.show"><div style="height:31px"></div></v-flex>
       <v-flex xs4>
        <v-layout text-xs-center>
         <v-flex xs6>
          <v-btn v-if="repAltBtn.show" :title="repAltBtn.tooltip" flat icon v-longpress="repeatClicked" v-bind:class="{'np-std-button': !stopButton}"><v-icon v-if="repAltBtn.icon">{{repAltBtn.icon}}</v-icon><img v-else :src="repAltBtn.image" class="btn-img"></img></v-btn>
          <v-btn :title="trans.repeatOne" flat icon v-else-if="playerStatus.playlist.repeat===1" v-longpress="repeatClicked" v-bind:class="{'np-std-button': !stopButton}"><v-icon class="active-btn">repeat_one</v-icon></v-btn>
          <v-btn :title="trans.repeatAll" flat icon v-else-if="playerStatus.playlist.repeat===2" v-longpress="repeatClicked" v-bind:class="{'np-std-button': !stopButton}"><v-icon class="active-btn">repeat</v-icon></v-btn>
          <v-btn :title="trans.dstm" flat icon v-else-if="dstm" v-longpress="repeatClicked" v-bind:class="{'np-std-button': !stopButton}"><v-icon class="active-btn">all_inclusive</v-icon></v-btn>
          <v-btn :title="trans.repeatOff" flat icon v-else v-longpress="repeatClicked" class="dimmed" v-bind:class="{'np-std-button': !stopButton}"><v-icon>repeat</v-icon></v-btn>
         </v-flex>
         <v-flex xs6><v-btn flat icon v-longpress:true="prevButton" v-bind:class="{'np-std-button': !stopButton, 'disabled':disablePrev}" :title="trans.prev"><v-icon large>skip_previous</v-icon></v-btn></v-flex>
        </v-layout>
       </v-flex>
       <v-flex xs4>
        <v-layout v-if="stopButton" text-xs-center>
         <v-flex xs6>
          <v-btn flat icon v-longpress="playPauseButton" @click.middle="showSleep" id="playPauseC" :title="playerStatus.isplaying ? trans.pause : trans.play"><v-icon large>{{playerStatus.isplaying ? 'pause' : 'play_arrow'}}</v-icon></v-btn>
         </v-flex>
         <v-flex xs6>
          <v-btn flat icon @click="doAction(['stop'])" :title="trans.stop"><v-icon large>stop</v-icon></v-btn>
         </v-flex>
        </v-layout>
        <v-btn flat icon large v-else v-longpress="playPauseButton" @click.middle="showSleep" id="playPauseD" class="np-playpause" :title="playerStatus.isplaying ? trans.pause : trans.play"><v-icon x-large>{{ playerStatus.isplaying ? 'pause_circle_outline' : 'play_circle_outline'}}</v-icon></v-btn>
       </v-flex>
       <v-flex xs4>
        <v-layout text-xs-center>
         <v-flex xs6><v-btn flat icon v-longpress:true="nextButton" v-bind:class="{'np-std-button': !stopButton, 'disabled':disableNext}" :title="trans.next"><v-icon large>skip_next</v-icon></v-btn></v-flex>
         <v-flex xs6>
          <v-btn v-if="shuffAltBtn.show" :title="shuffAltBtn.tooltip" flat icon @click="doCommand(shuffAltBtn.command, shuffAltBtn.tooltip)" v-bind:class="{'np-std-button': !stopButton}"><v-icon v-if="shuffAltBtn.icon">{{shuffAltBtn.icon}}</v-icon><img v-else :src="shuffAltBtn.image" class="btn-img"></img></v-btn>
          <v-btn :title="trans.shuffleAlbums" flat icon v-else-if="playerStatus.playlist.shuffle===2" @click="doAction(['playlist', 'shuffle', 0])" v-bind:class="{'np-std-button': !stopButton}"><v-icon class="shuffle-albums active-btn"">shuffle</v-icon></v-btn>
          <v-btn :title="trans.shuffleAll" flat icon v-else-if="playerStatus.playlist.shuffle===1" @click="doAction(['playlist', 'shuffle', 2])" v-bind:class="{'np-std-button': !stopButton}"><v-icon class="active-btn">shuffle</v-icon></v-btn>
          <v-btn :title="trans.shuffleOff" flat icon v-else @click="doAction(['playlist', 'shuffle', 1])" class="dimmed" v-bind:class="{'np-std-button': !stopButton}"><v-icon>shuffle</v-icon></v-btn>
         </v-flex>
        </v-layout>
       </v-flex>
      </v-layout>

     </div>
    </div>
   </div>
   <div v-else v-touch:start="touchStart" v-touch:end="touchEnd" v-touch:moving="touchMoving">
    <div v-bind:style="{height: portraitPad+'px'}"></div>
    <p class="np-text np-title ellipsis" v-if="playerStatus.current.title">{{playerStatus.current.title}}</p>
    <p class="np-text" v-else>&nbsp;</p>
    <p class="np-text subtext ellipsis" v-if="playerStatus.current.artistAndComposer">{{playerStatus.current.artistAndComposer}}</p>
    <p class="np-text" v-else>&nbsp;</p>
    <p class="np-text subtext ellipsis" v-if="playerStatus.current.album">{{playerStatus.current.album}}</p>
    <p class="np-text subtext ellipsis3" v-else-if="playerStatus.current.remote_title && playerStatus.current.remote_title!=playerStatus.current.title">{{playerStatus.current.remote_title}}</p>
    <p class="np-text" v-else>&nbsp;</p>
    <img v-if="!info.show" :key="coverUrl" v-lazy="coverUrl" class="np-image" @contextmenu="showMenu" @click="clickImage(event)"></img>
   </div>
   <v-layout text-xs-center row wrap class="np-controls" v-if="!(landscape && wide>1)">
    <v-flex xs12 v-if="showRatings && playerStatus.current.duration>0 && undefined!=rating.value && !landscape" class="np-text" v-bind:class="{'np-rating-shadow' : techInfo || playerStatus.playlist.count>1}">
     <v-rating v-if="maxRating>5" v-model="rating.value" half-increments hover clearable @click.native="setRating"></v-rating>
     <v-rating v-else v-model="rating.value" hover clearable @click.native="setRating"></v-rating>
    </v-flex>
    <v-flex xs12 class="np-tech ellipsis" v-if="techInfo || playerStatus.playlist.count>1">{{techInfo ? playerStatus.current.technicalInfo : ""}}{{playerStatus.playlist.current | trackCount(playerStatus.playlist.count, techInfo ? SEPARATOR : undefined)}}</v-flex>

    <v-flex xs12 v-if="!info.show && undefined!=playerStatus.current.time">
     <v-layout>
      <p class="np-pos" v-bind:class="{'np-pos-center': playerStatus.current.duration<=0}">{{playerStatus.current.time | displayTime}}</p>
      <v-progress-linear height="5" v-if="playerStatus.current.duration>0" id="pos-slider" class="np-slider" :value="playerStatus.current.pospc" v-on:click="sliderChanged($event)" @mouseover="timeTooltip.show = true" @mouseout="timeTooltip.show = false" @mousemove="moveTimeTooltip"></v-progress-linear>
      <p class="np-duration cursor" v-if="(showTotal || !playerStatus.current.time) && playerStatus.current.duration>0" @click="toggleTime()">{{playerStatus.current.duration | displayTime}}</p>
      <p class="np-duration cursor" v-else-if="playerStatus.current.duration>0" @click="toggleTime()">-{{playerStatus.current.duration-playerStatus.current.time | displayTime}}</p>
     </v-layout>
    </v-flex>
    <v-flex xs12 v-else-if="!info.show"><div style="height:31px"></div></v-flex>

    <v-flex xs4 class="no-control-adjust">
     <v-layout text-xs-center>
      <v-flex xs6>
       <v-btn v-if="repAltBtn.show" :title="repAltBtn.tooltip" flat icon v-longpress="repeatClicked" v-bind:class="{'np-std-button': !stopButton}"><v-icon v-if="repAltBtn.icon">{{repAltBtn.icon}}</v-icon><img v-else :src="repAltBtn.image" class="btn-img"></img></v-btn>
       <v-btn :title="trans.repeatOne" flat icon v-else-if="playerStatus.playlist.repeat===1" v-longpress="repeatClicked" v-bind:class="{'np-std-button': !stopButton}"><v-icon class="active-btn">repeat_one</v-icon></v-btn>
       <v-btn :title="trans.repeatAll" flat icon v-else-if="playerStatus.playlist.repeat===2" v-longpress="repeatClicked" v-bind:class="{'np-std-button': !stopButton}"><v-icon class="active-btn">repeat</v-icon></v-btn>
       <v-btn :title="trans.dstm" flat icon v-else-if="dstm" v-longpress="repeatClicked" v-bind:class="{'np-std-button': !stopButton}"><v-icon class="active-btn">all_inclusive</v-icon></v-btn>
       <v-btn :title="trans.repeatOff" flat icon v-else v-longpress="repeatClicked" class="dimmed" v-bind:class="{'np-std-button': !stopButton}"><v-icon>repeat</v-icon></v-btn>
      </v-flex>
      <v-flex xs6><v-btn flat icon v-longpress:true="prevButton" v-bind:class="{'np-std-button': !stopButton, 'disabled':disablePrev}" :title="trans.prev"><v-icon large>skip_previous</v-icon></v-btn></v-flex>
     </v-layout>
    </v-flex>
    <v-flex xs4 class="no-control-adjust">
     <v-layout v-if="stopButton" text-xs-center>
      <v-flex xs6>
       <v-btn flat icon v-longpress="playPauseButton" @click.middle="showSleep" id="playPauseE" :title="playerStatus.isplaying ? trans.pause : trans.play"><v-icon large>{{playerStatus.isplaying ? 'pause' : 'play_arrow'}}</v-icon></v-btn>
      </v-flex>
      <v-flex xs6>
       <v-btn flat icon @click="doAction(['stop'])" :title="trans.stop"><v-icon large>stop</v-icon></v-btn>
      </v-flex>
     </v-layout>
     <v-btn flat icon large v-else v-longpress="playPauseButton" @click.middle="showSleep" id="playPauseF" class="np-playpause" :title="playerStatus.isplaying ? trans.pause : trans.play"><v-icon x-large>{{ playerStatus.isplaying ? 'pause_circle_outline' : 'play_circle_outline'}}</v-icon></v-btn>
    </v-flex>
    <v-flex xs4 class="no-control-adjust">
     <v-layout text-xs-center>
      <v-flex xs6><v-btn flat icon v-longpress:true="nextButton" v-bind:class="{'np-std-button': !stopButton, 'disabled':disableNext}" :title="trans.next"><v-icon large>skip_next</v-icon></v-btn></v-flex>
      <v-flex xs6>
       <v-btn v-if="shuffAltBtn.show" :title="shuffAltBtn.tooltip" flat icon @click="doCommand(shuffAltBtn.command, shuffAltBtn.tooltip)" v-bind:class="{'np-std-button': !stopButton}"><v-icon v-if="shuffAltBtn.icon">{{shuffAltBtn.icon}}</v-icon><img v-else :src="shuffAltBtn.image" class="btn-img"></img></v-btn>
       <v-btn :title="trans.shuffleAlbums" flat icon v-else-if="playerStatus.playlist.shuffle===2" @click="doAction(['playlist', 'shuffle', 0])" v-bind:class="{'np-std-button': !stopButton}"><v-icon class="shuffle-albums active-btn"">shuffle</v-icon></v-btn>
       <v-btn :title="trans.shuffleAll" flat icon v-else-if="playerStatus.playlist.shuffle===1" @click="doAction(['playlist', 'shuffle', 2])" v-bind:class="{'np-std-button': !stopButton}"><v-icon class="active-btn">shuffle</v-icon></v-btn>
       <v-btn :title="trans.shuffleOff" flat icon v-else @click="doAction(['playlist', 'shuffle', 1])" class="dimmed" v-bind:class="{'np-std-button': !stopButton}"><v-icon>shuffle</v-icon></v-btn>
      </v-flex>
     </v-layout>
    </v-flex>
   </v-layout>
  </div>
 </div>
</div>
`,
    data() {
        return { coverUrl:LMS_BLANK_COVER,
                 playerStatus: {
                    isplaying: false,
                    sleepTimer: false,
                    dvc: true,
                    current: { canseek:1, duration:0, time:undefined, title:undefined, artist:undefined, artistAndComposer: undefined,
                               album:undefined, albumName:undefined, technicalInfo: "", pospc:0.0, tracknum:undefined },
                    playlist: { shuffle:0, repeat: 0, current:0, count:0 },
                 },
                 info: { show: false, tab:LYRICS_TAB, showTabs:false, sync: true,
                         tabs: [ { title:undefined, text:undefined }, { title:undefined, text:undefined }, { title:undefined, text:undefined } ] },
                 trans: { expand:undefined, collapse:undefined, sync:undefined, unsync:undefined, more:undefined, dstm:undefined,
                          repeatAll:undefined, repeatOne:undefined, repeatOff:undefined, shuffleAll:undefined, shuffleAlbums:undefined, shuffleOff:undefined,
                          stdFont:undefined, mediumFont:undefined, largerFont:undefined, play:undefined, pause:undefined, stop:undefined, prev:undefined, next:undefined },
                 showTotal: true,
                 portraitPad: 0,
                 landscape: false,
                 wide: 0,
                 lowHeight: false,
                 largeView: false,
                 menu: { show: false, x:0, y:0, text: ["", ""] },
                 rating: {value:0, setting:false},
                 timeTooltip: {show: false, x:0, y:0, text:undefined},
                 overlayVolume: -1,
                 repAltBtn:{show:false, command:[], icon:undefined, image:undefined, tooltip:undefined},
                 shuffAltBtn:{show:false, command:[], icon:undefined, image:undefined, tooltip:undefined},
                 disablePrev:false,
                 disableNext:false,
                 dstm:false,
                 infoZoom:10
                };
    },
    mounted() {
        this.infoZoom = parseInt(getLocalStorageVal('npInfoZoom', 10));
        if (this.infoZoom<10 | this.infoZoom>20) {
            this.infoZoom = 10;
        }

        this.info.showTabs=getLocalStorageBool("showTabs", false);
        bus.$on('expandNowPlaying', function(val) {
            if (window.innerHeight>=LMS_MIN_NP_LARGE_INFO_HEIGHT) {
                if (val) {
                    this.info.show = false;
                }
                this.largeView = val;
            }
        }.bind(this));

        bus.$on('info-swipe', function(d) {
            if (this.info.show) {
                if ('l'==d) {
                    if (this.info.tab==2) {
                        this.info.tab=0;
                    } else {
                        this.info.tab++;
                    }
                } else {
                    if (this.info.tab==0) {
                        this.info.tab=2;
                    } else {
                        this.info.tab--;
                    }
                }
            }
        }.bind(this));
        bus.$on('pageChanged', function(val) {
            if (0==this.lastWidth && val=='now-playing') {
                this.$nextTick(() => {
                    this.portraitElem = document.getElementById("np-page");
                    this.lastWidth = this.portraitElem ? this.portraitElem.offsetWidth : 0;
                    this.lastHeight = this.portraitElem ? this.portraitElem.offsetHeight : 0;
                    this.calcPortraitPad();
                });
            }
        }.bind(this));
        this.portraitElem = document.getElementById("np-page");
        this.lastWidth = this.portraitElem ? this.portraitElem.offsetWidth : 0;
        this.lastHeight = this.portraitElem ? this.portraitElem.offsetHeight : 0;
        this.lowHeight = window.innerHeight <= (this.$store.state.desktopLayout ? 400 : 450);
        this.calcPortraitPad();
        var npView = this;
        window.addEventListener('resize', () => {
            if (npView.resizeTimeout) {
                clearTimeout(npView.resizeTimeout);
            }
            npView.resizeTimeout = setTimeout(function () {
                // Only update if changed
                if (!npView.landscape && !npView.portraitElem) {
                    npView.portraitElem = document.getElementById("np-page");
                    npView.lastWidth = npView.portraitElem ? npView.portraitElem.offsetWidth : 0;
                    npView.lastHeight = npView.portraitElem ? npView.portraitElem.offsetHeight : 0;
                }
                if (npView.portraitElem &&
                    (Math.abs(npView.lastWidth-npView.portraitElem.offsetWidth)>4 || Math.abs(npView.lastHeight-npView.portraitElem.offsetHeight))) {
                    npView.lastWidth = npView.portraitElem.offsetWidth;
                    npView.lastHeight = npView.portraitElem.offsetHeight;
                    npView.calcPortraitPad();
                }
                npView.lowHeight = window.innerHeight <= (npView.$store.state.desktopLayout ? 400 : 430);
                npView.resizeTimeout = undefined;
                if (window.innerHeight<LMS_MIN_NP_LARGE_INFO_HEIGHT) {
                    npView.largeView = false;
                    npView.info.show = false;
                }
            }, 50);
        }, false);

        // Long-press on 'now playing' nav button whilst in now-playing shows track info
        bus.$on('nav', function(page, longPress) {
            if ('now-playing'==page) {
                if (longPress) {
                    if (this.playerStatus && undefined!=this.playerStatus.current.id) {
                        this.trackInfo();
                    }
                } else if (this.$store.state.infoPlugin && this.playerStatus && this.playerStatus.current && this.playerStatus.current.artist) {
                    this.largeView = false;
                    this.info.show = !this.info.show;
                } else if (this.info.show) {
                    this.info.show = false;
                }
            }
        }.bind(this));

        this.info.sync=getLocalStorageBool("syncInfo", true);
        bus.$on('playerStatus', function(playerStatus) {
            var playStateChanged = false;
            var trackChanged = false;

            // Have other items changed
            if (playerStatus.isplaying!=this.playerStatus.isplaying) {
                this.playerStatus.isplaying = playerStatus.isplaying;
                playStateChanged = true;
            }
            if (playerStatus.current.canseek!=this.playerStatus.current.canseek) {
                this.playerStatus.current.canseek = playerStatus.current.canseek;
            }
            if (playerStatus.current.duration!=this.playerStatus.current.duration) {
                this.playerStatus.current.duration = playerStatus.current.duration;
            }
            if (playerStatus.current.time!=this.playerStatus.current.time || playStateChanged) {
                this.playerStatus.current.time = playerStatus.current.time;
                this.playerStatus.current.updated = new Date();
                this.playerStatus.current.origTime = playerStatus.current.time;
            }
            this.setPosition();
            if (playerStatus.current.id!=this.playerStatus.current.id) {
                this.playerStatus.current.id = playerStatus.current.id;
            }
            if (playerStatus.current.title!=this.playerStatus.current.title) {
                this.playerStatus.current.title = playerStatus.current.title;
                trackChanged = true;
            }
            if (playerStatus.current.tracknum!=this.playerStatus.current.tracknum) {
                this.playerStatus.current.tracknum = playerStatus.current.tracknum;
                trackChanged = true;
            }
            if (playerStatus.will_sleep_in!=this.playerStatus.sleepTimer) {
                this.playerStatus.sleepTimer = playerStatus.will_sleep_in;
            }
            if (playerStatus.dvc!=this.playerStatus.dvc) {
                this.playerStatus.dvc = playerStatus.dvc;
            }
            var artist = playerStatus.current.trackartist ? playerStatus.current.trackartist : playerStatus.current.artist;
            var artist_id = playerStatus.current.trackartist_id ? playerStatus.current.trackartist_id : playerStatus.current.artist_id;
            var artist_ids = playerStatus.current.trackartist_ids ? playerStatus.current.trackartist_ids : playerStatus.current.artist_ids;
            if (this.playerStatus.current.artist!=artist ||
                this.playerStatus.current.artist_id!=artist_id ||
                this.playerStatus.current.artist_ids!=artist_ids) {
                this.playerStatus.current.artist = artist;
                this.playerStatus.current.artist_id = artist_id;
                this.playerStatus.current.artist_ids = artist_ids;
                trackChanged = true;
            }
            if (playerStatus.current.albumartist!=this.playerStatus.current.albumartist ||
                playerStatus.current.albumartist_ids!=this.playerStatus.current.albumartist_ids ) {
                this.playerStatus.current.albumartist = playerStatus.current.albumartist;
                this.playerStatus.current.albumartist_ids = playerStatus.current.albumartist_ids;
                trackChanged = true;
            }
            if (playerStatus.current.album!=this.playerStatus.current.albumName ||
                playerStatus.current.album_id!=this.playerStatus.current.album_id) {
                this.playerStatus.current.albumName = playerStatus.current.album;
                this.playerStatus.current.album_id = playerStatus.current.album_id;
                if (playerStatus.current.year && playerStatus.current.year>0) {
                    this.playerStatus.current.album = this.playerStatus.current.albumName+" ("+ playerStatus.current.year+")";
                } else {
                    this.playerStatus.current.album = this.playerStatus.current.albumName;
                }
                trackChanged = true;
            }
            if (playerStatus.current.remote_title!=this.playerStatus.current.remote_title) {
                this.playerStatus.current.remote_title = playerStatus.current.remote_title;
                trackChanged = true;
            }
            if (playerStatus.current.rating!=this.rating.setting) {
                this.rating.setting = playerStatus.current.rating;
                this.rating.value = undefined==this.rating.setting ? 0 : (Math.ceil(this.rating.setting/10.0)/2.0);
                trackChanged = true;
            }
            var artistAndComposer;
            if (playerStatus.current.composer && playerStatus.current.genre && LMS_COMPOSER_GENRES.has(playerStatus.current.genre) &&
                playerStatus.current.composer!=this.playerStatus.current.artist) {
                artistAndComposer = addPart(playerStatus.current.composer, this.playerStatus.current.artist);
            } else {
                artistAndComposer = this.playerStatus.current.artist;
            }
            if (artistAndComposer!=this.playerStatus.current.artistAndComposer) {
                this.playerStatus.current.artistAndComposer = artistAndComposer;
            }
            if (playerStatus.playlist.shuffle!=this.playerStatus.playlist.shuffle) {
                this.playerStatus.playlist.shuffle = playerStatus.playlist.shuffle;
            }
            if (playerStatus.playlist.repeat!=this.playerStatus.playlist.repeat) {
                this.playerStatus.playlist.repeat = playerStatus.playlist.repeat;
            }
            if (playerStatus.playlist.current!=this.playerStatus.playlist.current) {
                this.playerStatus.playlist.current = playerStatus.playlist.current;
            }
            if (playerStatus.playlist.count!=this.playerStatus.playlist.count) {
                this.playerStatus.playlist.count = playerStatus.playlist.count;
            }
            var technical = [];
            if (playerStatus.current.bitrate) {
                technical.push(playerStatus.current.bitrate);
            }
            if (playerStatus.current.samplerate) {
                technical.push((playerStatus.current.samplerate/1000)+"kHz");
            }
            if (playerStatus.current.type) {
                var bracket = playerStatus.current.type.indexOf(" (");
                var type = bracket>0 ? playerStatus.current.type.substring(0, bracket) : playerStatus.current.type;
                technical.push(type.length<=4 ? type.toUpperCase() : type);
            }
            technical=technical.join(", ");
            if (technical!=this.playerStatus.current.technicalInfo) {
                this.playerStatus.current.technicalInfo = technical;
            }

            if (trackChanged && this.info.sync) {
                this.setInfoTrack();
                this.showInfo();
            }

            if (playStateChanged) {
                if (this.playerStatus.isplaying) {
                    this.startPositionInterval();
                } else {
                    this.stopPositionInterval();
                }
            } else if (this.playerStatus.isplaying && trackChanged) {
                this.startPositionInterval();
            }
            // 'volume' is NOT reactive, as only want to update when overlay is shown!
            this.volume = playerStatus.volume<0 ? -1*playerStatus.volume : playerStatus.volume;

            // Service specific buttons? e.g. Pandora...
            var btns = playerStatus.current.buttons;
            var sb = btns ? btns.shuffle : undefined;
            var rb = btns ? btns.repeat : undefined;
            if (sb && sb.command) {
                this.shuffAltBtn={show:true, command:sb.command, tooltip:sb.tooltip, image:sb.icon,
                                  icon:sb.jiveStyle == "thumbsDown" ? "thumb_down" : sb.jiveStyle == "thumbsUp" ? "thumb_up" : undefined};
            } else if (this.shuffAltBtn.show) {
                this.shuffAltBtn.show=false;
            }
            if (rb && rb.command) {
                this.repAltBtn={show:true, command:rb.command, tooltip:rb.tooltip, image:rb.icon,
                                icon:rb.jiveStyle == "thumbsDown" ? "thumb_down" : rb.jiveStyle == "thumbsUp" ? "thumb_up" : undefined};
            } else if (this.repAltBtn.show) {
                this.repAltBtn.show=false;
            }
            this.disablePrev=btns && undefined!=btns.rew && 0==parseInt(btns.rew);
            this.disableNext=btns && undefined!=btns.fwd && 0==parseInt(btns.fwd);
        }.bind(this));

        // Refresh status now, in case we were mounted after initial status call
        bus.$emit('refreshStatus');

        this.page = document.getElementById("np-page");
        bus.$on('themeChanged', function() {
            this.setBgndCover();
        }.bind(this));
        bus.$on('layoutChanged', function() {
            this.setBgndCover(true);
        }.bind(this));

        this.landscape = isLandscape();
        this.wide = window.innerWidth>=900 ? 2 : window.innerWidth>=650 ? 1 : 0;
        setTimeout(function () {
            this.landscape = isLandscape();
            this.wide = window.innerWidth>=900 ? 2 : window.innerWidth>=650 ? 1 : 0;
        }.bind(this), 1000);
        bus.$on('windowWidthChanged', function() {
            this.landscape = isLandscape();
            this.wide = window.innerWidth>=900 ? 2 : window.innerWidth>=650 ? 1 : 0;
        }.bind(this));

        bus.$on('currentCover', function(coverUrl) {
            this.coverUrl = undefined==coverUrl ? LMS_BLANK_COVER : coverUrl;
            this.setBgndCover();
        }.bind(this));
        bus.$emit('getCurrentCover');

        bus.$on('langChanged', function() {
            this.initItems();
        }.bind(this));
        this.initItems();

        bus.$on('esc', function() {
            this.menu.show = false;
        }.bind(this));

        bus.$on('info', function() {
            if ((window.innerHeight>=LMS_MIN_NP_LARGE_INFO_HEIGHT && this.playerStatus.playlist.count>0) || this.info.show) {
                this.largeView = false;
                this.info.show = !this.info.show;
            }
        }.bind(this));

        bus.$on('prefset', function(pref, value) {
            if ("plugin.dontstopthemusic:provider"==pref) {
                this.dstm = (""+value)!="0";
            }
        }.bind(this));

        this.showTotal = getLocalStorageBool('showTotal', true);
        if (!IS_MOBILE) {
            bindKey(LMS_TRACK_INFO_KEYBOARD, 'mod');
            bindKey(LMS_EXPAND_NP_KEYBOARD, 'mod+shift');
            bus.$on('keyboard', function(key, modifier) {
                if (this.$store.state.visibleMenus.size>0 || this.$store.state.openDialogs.length>1 || (!this.$store.state.desktopLayout && this.$store.state.page!="now-playing")) {
                    return;
                }
                if ('mod'==modifier && LMS_TRACK_INFO_KEYBOARD==key && this.$store.state.infoPlugin && (this.$store.state.openDialogs.length==0 || this.$store.state.openDialogs[0]=='info-dialog') && (window.innerHeight>=LMS_MIN_NP_LARGE_INFO_HEIGHT || this.info.show)) {
                    this.largeView = false;
                    this.info.show = !this.info.show;
                } else if ('mod+shift'==modifier && LMS_EXPAND_NP_KEYBOARD==key && this.$store.state.desktopLayout && (window.innerHeight>=LMS_MIN_NP_LARGE_INFO_HEIGHT || this.largeView)) {
                    this.info.show = false;
                    this.largeView = !this.largeView;
                }
            }.bind(this));
        }
    },
    methods: {
        initItems() {
            this.trans = { expand:i18n("Show all information"), collapse:i18n("Show information in tabs"),
                           sync:i18n("Update information when song changes"), unsync:i18n("Don't update information when song changes"),
                           more:i18n("More"), dstm:i18n("Don't Stop The Music"), repeatAll:i18n("Repeat queue"), repeatOne:i18n("Repeat single track"),
                           repeatOff:i18n("No repeat"), shuffleAll:i18n("Shuffle tracks"), shuffleAlbums:i18n("Shuffle albums"),
                           shuffleOff:i18n("No shuffle"), stdFont:i18n("Standard font size"), mediumFont:i18n("Medium font size"),
                           largeFont:i18n("Large font size"), play:i18n("Play"), pause:i18n("Pause"), stop:i18n("Stop"), prev:i18n("Previous track"),
                           next:i18n("Next track") };
            this.info.tabs[LYRICS_TAB].title=i18n("Lyrics");
            this.info.tabs[BIO_TAB].title=i18n("Artist Biography");
            this.info.tabs[REVIEW_TAB].title=i18n("Album Review");
            this.menu.text[0]=i18n("Show image");
            this.menu.text[1]=i18n("Show track information");
        },
        calcPortraitPad() {
            // Calculate padding, so that (in portrait mode) text is not too far from cover
            if (!this.portraitElem || this.landscape) {
                this.portraitPad = 0;
            } else {
                var coverMax = this.portraitElem.offsetWidth-/*pad*/16;
                var spaceForText = this.$store.state.largeFonts ? 120 : 80;
                var topAndBotSpace = (this.portraitElem.offsetHeight - 
                                        (coverMax + /*bottom*/(this.$store.state.ratingsSupport || this.$store.state.techInfo ? 120 : 90) + spaceForText))/2;
                var portraitPad = Math.max(0, Math.floor(topAndBotSpace/2)-8);
                if (portraitPad!=this.portraitPad) {
                    this.portraitPad = portraitPad;
                }
            }
        },
        showContextMenu(event) {
            if (this.$store.state.visibleMenus.size<1) {
                this.showMenu(event);
            } else {
                event.preventDefault();
            }
        },
        showMenu(event) {
            event.preventDefault();
            this.clearClickTimeout();
            if (this.info.show || (this.coverUrl && this.coverUrl!=LMS_BLANK_COVER && (undefined==this.touch || !this.touch.moving)) && window.innerHeight>=LMS_MIN_NP_LARGE_INFO_HEIGHT) {
                this.touch = undefined;
                this.menu.show = false;
                this.menu.x = event.clientX;
                this.menu.y = event.clientY;
                this.$nextTick(() => {
                    this.menu.show = true;
                });
            }
        },
        showPic() {
            var npPage = this;
            this.gallery = new PhotoSwipe(document.querySelectorAll('.pswp')[0], PhotoSwipeUI_Default, [{src:changeImageSizing(this.coverUrl), w:0, h:0}], {index: 0});
            this.gallery.listen('gettingData', function (index, item) {
                if (item.w < 1 || item.h < 1) {
                    var img = new Image();
                    img.onload = function () {
                        item.w = this.width;
                        item.h = this.height;
                        npPage.gallery.updateSize(true);
                    };
                    img.src = item.src;
                }
            });
            this.gallery.init();
            this.$store.commit('dialogOpen', {name:'np-viewer', shown:true});
            this.gallery.listen('close', function() { bus.$emit('dialogOpen', 'np-viewer', false); });
        },
        doAction(command) {
            if (this.$store.state.visibleMenus.size>0) {
                return;
            }
            bus.$emit('playerCommand', command);
        },
        setPosition() {
            var pc = this.playerStatus.current && undefined!=this.playerStatus.current.time && undefined!=this.playerStatus.current.duration &&
                     this.playerStatus.current.duration>0 ? 100*Math.floor(this.playerStatus.current.time*1000/this.playerStatus.current.duration)/1000 : 0.0;

            if (pc!=this.playerStatus.current.pospc) {
                this.playerStatus.current.pospc = pc;
            }
        },
        sliderChanged(e) {
            if (this.playerStatus.current.canseek && this.playerStatus.current.duration>3) {
                const rect = document.getElementById("pos-slider").getBoundingClientRect();
                const pos = e.clientX - rect.x;
                const width = rect.width;
                this.doAction(['time', Math.floor(this.playerStatus.current.duration * pos / rect.width)]);
            }
        },
        moveTimeTooltip(e) {
            if (this.timeTooltip.show) {
                if (this.playerStatus.current.duration<=1) {
                    this.timeTooltip.show = false;
                    return;
                }
                this.timeTooltip.x = e.x
                const rect = document.getElementById("pos-slider").getBoundingClientRect();
                this.timeTooltip.y = rect.y;
                const pos = e.clientX - rect.x;
                const width = rect.width;
                this.timeTooltip.text=""+formatSeconds(Math.floor(this.playerStatus.current.duration * pos / rect.width));
            }
        },
        setInfoTrack() {
            this.infoTrack={ title: this.playerStatus.current.title,
                             track_id: this.playerStatus.current.id,
                             artist: this.playerStatus.current.artist,
                             artist_id: this.playerStatus.current.artist_ids
                                ? this.playerStatus.current.artist_ids.split(",")[0].trim()
                                : this.playerStatus.current.artist_id,
                             artist_ids: this.playerStatus.current.artist_ids,
                             albumartist: this.playerStatus.current.albumartist,
                             albumartist_ids: this.playerStatus.current.albumartist_ids,
                             album: this.playerStatus.current.albumName, album_id: this.playerStatus.current.album_id };
            this.infoTrack.empty=undefined==this.infoTrack.title &&
                                 undefined==this.infoTrack.track_id &&
                                 undefined==this.infoTrack.artist &&
                                 undefined==this.infoTrack.artist_id &&
                                 undefined==this.infoTrack.artist_ids &&
                                 undefined==this.infoTrack.albumartist &&
                                 undefined==this.infoTrack.albumartist_ids &&
                                 undefined==this.infoTrack.album;
        },
        trackInfo() {
            if (undefined==this.playerStatus.current.id) {
                bus.$emit('showMessage', i18n('Nothing playing'));
                return;
            }
            this.info.show=false;
            this.largeView=false;
            bus.$emit('trackInfo', {id: "track_id:"+this.playerStatus.current.id, title:this.playerStatus.current.title, image: this.coverUrl},
                      this.playerStatus.playlist.current, 'now-playing');
        },
        fetchLyrics() {
            if (this.info.tabs[LYRICS_TAB].artist!=this.infoTrack.artist || this.info.tabs[LYRICS_TAB].songtitle!=this.infoTrack.title ||
                this.info.tabs[LYRICS_TAB].track_id!=this.infoTrack.track_id || this.info.tabs[LYRICS_TAB].artist_id!=this.infoTrack.artist_id) {
                this.info.tabs[LYRICS_TAB].text=i18n("Fetching...");
                this.info.tabs[LYRICS_TAB].track_id=this.infoTrack.track_id;
                this.info.tabs[LYRICS_TAB].artist=this.infoTrack.artist;
                this.info.tabs[LYRICS_TAB].artist_id=this.infoTrack.artist_id;
                this.info.tabs[LYRICS_TAB].songtitle=this.infoTrack.title;
                var command = ["musicartistinfo", "lyrics", "html:1"];
                if (this.infoTrack.track_id!=undefined && !(""+this.infoTrack.track_id).startsWith("-")) {
                    command.push("track_id:"+this.infoTrack.track_id);
                } else {
                    if (this.infoTrack.title!=undefined) {
                        command.push("title:"+this.infoTrack.title);
                    }
                    if (this.infoTrack.artist!=undefined) {
                        command.push("artist:"+this.infoTrack.artist);
                    }
                }
                if (3==command.length) { // No details?
                    this.info.tabs[LYRICS_TAB].text=this.infoTrack.empty ? "" : i18n("Insufficient metadata to fetch information.");
                } else {
                    lmsCommand("", command).then(({data}) => {
                        logJsonMessage("RESP", data);
                        if (data && data.result && (data.result.lyrics || data.result.error)) {
                            this.info.tabs[LYRICS_TAB].text=data.result.lyrics ? replaceNewLines(data.result.lyrics) : data.result.error;
                        }
                    }).catch(error => {
                        this.info.tabs[LYRICS_TAB].text=i18n("Failed to retreive information.");
                    });
                }
            } else if (undefined==this.infoTrack.artist && undefined==this.infoTrack.title && undefined==this.infoTrack.track_id && undefined==this.infoTrack.artist_id) {
                this.info.tabs[LYRICS_TAB].text=this.infoTrack.empty ? "" : i18n("Insufficient metadata to fetch information.");
            }
        },
        fetchBio() {
            if (this.info.tabs[BIO_TAB].artist!=this.infoTrack.artist || this.info.tabs[BIO_TAB].artist_id!=this.infoTrack.artist_id ||
                this.info.tabs[BIO_TAB].artist_ids!=this.infoTrack.artist_ids) {
                this.info.tabs[BIO_TAB].text=i18n("Fetching...");
                this.info.tabs[BIO_TAB].isMsg=true;
                this.info.tabs[BIO_TAB].artist=this.infoTrack.artist;
                this.info.tabs[BIO_TAB].artist_id=this.infoTrack.artist_id;
                this.info.tabs[BIO_TAB].artist_ids=this.infoTrack.artist_ids;

                var ids = this.infoTrack.artist_ids ? this.infoTrack.artist_ids.split(",") : [];
                if (ids.length>1) {
                    this.info.tabs[BIO_TAB].first = true;
                    this.info.tabs[BIO_TAB].found = false;
                    this.info.tabs[BIO_TAB].count = ids.length;
                    for (var i=0, len=ids.length; i<len; ++i) {
                        lmsCommand("", ["musicartistinfo", "biography", "artist_id:"+ids[i].trim(), "html:1"]).then(({data}) => {
                            logJsonMessage("RESP", data);
                            if (data && data.result && (data.result.biography || data.result.error)) {
                                if (data.result.artist) {
                                    this.info.tabs[BIO_TAB].found = true;
                                    if (this.info.tabs[BIO_TAB].first) {
                                        this.info.tabs[BIO_TAB].text="";
                                        this.info.tabs[BIO_TAB].first = false;
                                    } else {
                                        this.info.tabs[BIO_TAB].text+="<br/><br/>";
                                    }
                                    this.info.tabs[BIO_TAB].text+="<b>"+data.result.artist+"</b><br/>"+(data.result.biography ? replaceNewLines(data.result.biography) : data.result.error);
                                }
                            }
                            this.info.tabs[BIO_TAB].count--;
                            if (0 == this.info.tabs[BIO_TAB].count && !this.info.tabs[BIO_TAB].found) {
                                this.info.tabs[BIO_TAB].text = i18n("No artist found");
                            } else {
                                this.info.tabs[BIO_TAB].isMsg=false;
                            }
                        });
                    }
                } else {
                    var command = ["musicartistinfo", "biography", "html:1"];
                    if (this.infoTrack.artist_id!=undefined) {
                        command.push("artist_id:"+this.infoTrack.artist_id);
                    } else {
                        command.push("artist:"+this.infoTrack.artist);
                    }
                    if (3==command.length) { // No details?
                        this.info.tabs[BIO_TAB].text=this.infoTrack.empty ? "" : i18n("Insufficient metadata to fetch information.");
                    } else {
                        lmsCommand("", command).then(({data}) => {
                            logJsonMessage("RESP", data);
                            if (data && data.result && (data.result.biography || data.result.error)) {
                                this.info.tabs[BIO_TAB].text=data.result.biography ? replaceNewLines(data.result.biography) : data.result.error;
                                this.info.tabs[BIO_TAB].isMsg=undefined==data.result.biography;
                            }
                        }).catch(error => {
                            this.info.tabs[BIO_TAB].text=i18n("Failed to retreive information.");
                        });
                    }
                }
            } else if (undefined==this.infoTrack.artist && undefined==this.infoTrack.artist_id && undefined==this.infoTrack.artist_ids) {
                this.info.tabs[BIO_TAB].isMsg=true;
                this.info.tabs[BIO_TAB].text=this.infoTrack.empty ? "" : i18n("Insufficient metadata to fetch information.");
            }
        },
        fetchReview() {
            if (this.info.tabs[REVIEW_TAB].albumartist!=this.infoTrack.albumartist || this.info.tabs[REVIEW_TAB].albumartist_ids!=this.infoTrack.albumartist_ids ||
                this.info.tabs[REVIEW_TAB].artist_id!=this.infoTrack.artist_id || this.info.tabs[REVIEW_TAB].album!=this.infoTrack.album ||
                this.info.tabs[REVIEW_TAB].album_id!=this.infoTrack.album_id) {
                this.info.tabs[REVIEW_TAB].text=i18n("Fetching...");
                this.info.tabs[REVIEW_TAB].isMsg=true;
                this.info.tabs[REVIEW_TAB].albumartist=this.infoTrack.albumartist;
                this.info.tabs[REVIEW_TAB].albumartist_ids=this.infoTrack.albumartist_ids;
                this.info.tabs[REVIEW_TAB].artist_id=this.infoTrack.artist_id;
                this.info.tabs[REVIEW_TAB].album=this.infoTrack.album;
                this.info.tabs[REVIEW_TAB].album_id=this.infoTrack.album_id;
                var command = ["musicartistinfo", "albumreview", "html:1"];
                if (this.infoTrack.album_id!=undefined) {
                    command.push("album_id:"+this.infoTrack.album_id);
                } else {
                    if (this.infoTrack.album!=undefined) {
                        command.push("album:"+this.infoTrack.album);
                    }
                    if (this.infoTrack.albumartist_ids!=undefined) {
                        command.push("artist_id:"+this.infoTrack.albumartist_ids.split(", ")[0].trim());
                    } else if (this.infoTrack.artist_id!=undefined) {
                        command.push("artist_id:"+this.infoTrack.artist_id);
                    }
                    if (this.infoTrack.albumartist!=undefined) {
                        command.push("artist:"+this.infoTrack.albumartist);
                    } else if (this.infoTrack.artist!=undefined) {
                        command.push("artist:"+this.infoTrack.artist);
                    }
                }

                if (3==command.length) { // No details?
                    this.info.tabs[REVIEW_TAB].text=this.infoTrack.empty ? "" : i18n("Insufficient metadata to fetch information.");
                } else {
                    lmsCommand("", command).then(({data}) => {
                        logJsonMessage("RESP", data);
                        if (data && data.result && (data.result.albumreview || data.result.error)) {
                            this.info.tabs[REVIEW_TAB].text=data.result.albumreview ? replaceNewLines(data.result.albumreview) : data.result.error;
                            this.info.tabs[REVIEW_TAB].isMsg=undefined==data.result.albumreview;
                        }
                    }).catch(error => {
                        this.info.tabs[REVIEW_TAB].text=i18n("Failed to retreive information.");
                    });
                }
            } else if (undefined==this.infoTrack.albumartist && undefined==this.infoTrack.albumartist_ids && undefined==this.infoTrack.artist_id &&
                       undefined==this.infoTrack.album && undefined==this.infoTrack.album) {
                this.info.tabs[REVIEW_TAB].isMsg=true;
                this.info.tabs[REVIEW_TAB].text=this.infoTrack.empty ? "" : i18n("Insufficient metadata to fetch information.");
            }
        },
        showInfo() {
            if (!this.info.show || !this.infoTrack) {
                return;
            }
            this.$nextTick(function () {
                var elem = document.getElementById("np-info");
                if (elem) {
                    elem.style.backgroundImage = "url('"+(this.$store.state.infoBackdrop && this.coverUrl!=LMS_BLANK_COVER ? this.coverUrl : "") +"')";
                }
            });
            if (this.$store.state.desktopLayout && !this.showTabs) {
                this.fetchLyrics();
                this.fetchBio();
                this.fetchReview();
            } else if (LYRICS_TAB==this.info.tab) {
                this.fetchLyrics();
            } else if (BIO_TAB==this.info.tab) {
                this.fetchBio();
            } else {
                this.fetchReview();
            }
        },
        startPositionInterval() {
            this.stopPositionInterval();
            this.positionInterval = setInterval(function () {
                if (undefined!=this.playerStatus.current.time && this.playerStatus.current.time>=0) {
                    var current = new Date();
                    var diff = (current.getTime()-this.playerStatus.current.updated.getTime())/1000.0;
                    this.playerStatus.current.time = this.playerStatus.current.origTime + diff;
                    this.setPosition();
                    if (this.playerStatus.current.duration && this.playerStatus.current.duration>0 &&
                        this.playerStatus.current.time>=(this.playerStatus.current.duration+2)) {
                        bus.$emit('refreshStatus');
                    }
                }
            }.bind(this), 1000);
        },
        stopPositionInterval() {
            if (undefined!==this.positionInterval) {
                clearInterval(this.positionInterval);
                this.positionInterval = undefined;
            }
        },
        toggleTime() {
            if (this.$store.state.visibleMenus.size>0) {
                return;
            }
            this.showTotal = !this.showTotal;
            setLocalStorageVal("showTotal", this.showTotal);
        },
        setBgndCover(force) {
            if (this.page && (!this.$store.state.desktopLayout || this.largeView)) {
                setBgndCover(this.page, this.$store.state.nowPlayingBackdrop && this.coverUrl!=LMS_BLANK_COVER ? this.coverUrl : undefined);
            } else if (this.page && force && this.$store.state.desktopLayout && !this.largeView) {
                // Switched from mobile to desktop, and bottom bar should not have cover
                this.page.style.backgroundImage = 'none';
                this.page.style.boxShadow = 'none';
            }
        },
        playPauseButton(showSleepMenu) {
            if (this.$store.state.visibleMenus.size>0) {
                return;
            }
            if (showSleepMenu) {
                bus.$emit('dlg.open', 'sleep', this.$store.state.player);
            } else {
                this.doAction([this.playerStatus.isplaying ? 'pause' : 'play']);
            }
        },
        prevButton(skip) {
            if (this.$store.state.visibleMenus.size>0) {
                return;
            }
            if (!this.disablePrev) {
                if (skip && this.playerStatus.current.time>=this.$store.state.skipSeconds) {
                    this.doAction(['time', this.playerStatus.current.time-this.$store.state.skipSeconds]);
                } else {
                    this.doAction(['button', 'jump_rew']);
                }
            }
        },
        nextButton(skip) {
            if (this.$store.state.visibleMenus.size>0) {
                return;
            }
            if (!this.disableNext) {
                if (skip && (this.playerStatus.current.time+this.$store.state.skipSeconds)<this.playerStatus.current.duration) {
                    this.doAction(['time', this.playerStatus.current.time+this.$store.state.skipSeconds]);
                } else {
                    this.doAction(['playlist', 'index', '+1']);
                }
            }
        },
        repeatClicked(longPress) {
            if (this.repAltBtn.show) {
                this.doCommand(this.repAltBtn.command, this.repAltBtn.tooltip);
            } else {
                if (longPress & (this.dstm || this.playerStatus.playlist.repeat===0)) {
                   bus.$emit('dlg.open', 'dstm');
                } else if (this.playerStatus.playlist.repeat===1) {
                    bus.$emit('playerCommand', ['playlist', 'repeat', 0]);
                } else if (this.playerStatus.playlist.repeat===2) {
                    bus.$emit('playerCommand', ['playlist', 'repeat', 1]);
                } else {
                    bus.$emit('playerCommand', ['playlist', 'repeat', 2]);
                }
            }
        },
        showSleep() {
            if (this.$store.state.visibleMenus.size>0) {
                return;
            }
            bus.$emit('dlg.open', 'sleep', this.$store.state.player);
        },
        setRating() {
            // this.rating.value is updated *before* this setRating click handler is called, so we can use its model value to update LMS
            lmsCommand(this.$store.state.player.id, ["trackstat", "setrating", this.playerStatus.current.id, this.rating.value]).then(({data}) => {
                logJsonMessage("RESP", data);
                bus.$emit('refreshStatus');
                bus.$emit('ratingChanged', this.playerStatus.current.id, this.playerStatus.current.album_id);
            });
        },
        doCommand(command, msg) {
            lmsCommand(this.$store.state.player.id, command).then(({data}) => {
                if (undefined!=msg) {
                    bus.$emit('showMessage', msg);
                }
            });
        },
        clickImage(event) {
            if (this.menu.show) {
                this.menu.show = false;
                return;
            }
            if (this.$store.state.visibleMenus.size>0) {
                return;
            }
            if (!this.clickTimer) {
                this.clickTimer = setTimeout(function () {
                    this.clearClickTimeout(this.clickTimer);
                    if (IS_IOS) {
                        this.showMenu(event);
                    }
                }.bind(this), LMS_DOUBLE_CLICK_TIMEOUT);
            } else {
                this.clearClickTimeout(this.clickTimer);
                this.showPic();
            }
        },
        clearClickTimeout() {
            if (this.clickTimer) {
                clearTimeout(this.clickTimer);
                this.clickTimer = undefined;
            }
        },
        touchStart(event) {
            if (this.$store.state.swipeVolume && !this.menu.show && event.touches && event.touches.length>0) {
                this.touch={x:event.touches[0].clientX, y:event.touches[0].clientY, moving:false};
                this.lastSentVolume=-1;
            }
        },
        touchEnd() {
            if (this.touch && this.touch.moving && this.overlayVolume>=0 && this.overlayVolume!=this.lastSentVolume) {
                bus.$emit('playerCommand', ["mixer", "volume", this.overlayVolume]);
            }
            this.touch=undefined;
            this.overlayVolume=-1;
            this.lastSentVolume=-1;
            this.cancelSendVolumeTimer();
        },
        touchMoving(event) {
            if (undefined!=this.touch) {
                if (Math.abs(event.touches[0].clientX-this.touch.x)<48) {
                    if (!this.touch.moving && Math.abs(event.touches[0].clientY-this.touch.y)>10) {
                        this.touch.moving=true;
                        this.overlayVolume=Math.abs(this.volume);
                        this.lastSentVolume=this.overlayVolume;
                    }
                    const VOL_STEP_PX = 25;
                    if (Math.abs(event.touches[0].clientY-this.touch.y)>=VOL_STEP_PX) {
                        var steps = Math.floor(Math.abs(event.touches[0].clientY-this.touch.y) / VOL_STEP_PX);
                        if (steps>0) {
                            var inc = event.touches[0].clientY<this.touch.y;
                            for (var i=0; i<steps; ++i) {
                                this.overlayVolume = adjustVolume(Math.abs(this.overlayVolume), inc);
                                if (this.overlayVolume<0) {
                                    this.overlayVolume=0;
                                    break;
                                } else if (this.overlayVolume>100) {
                                    this.overlayVolume=100;
                                    break;
                                }
                            }
                            this.touch.y += steps*VOL_STEP_PX*(inc ? -1 : 1);
                            this.resetSendVolumeTimer();
                        }
                    }
                }
            }
        },
        cancelSendVolumeTimer() {
            if (undefined!==this.sendVolumeTimer) {
                clearTimeout(this.sendVolumeTimer);
                this.sendVolumeTimer = undefined;
            }
        },
        resetSendVolumeTimer() {
            this.cancelSendVolumeTimer();
            this.sendVolumeTimer = setTimeout(function () {
                if (this.overlayVolume!=this.lastSentVolume) {
                    bus.$emit('playerCommand', ["mixer", "volume", this.overlayVolume]);
                    this.lastSentVolume=this.overlayVolume;
                }
            }.bind(this), LMS_VOLUME_DEBOUNCE);
        },
        adjustFont(sz) {
            this.infoZoom=sz;
            getLocalStorageVal('npInfoZoom', sz);
        }
    },
    filters: {
        displayTime: function (value) {
            if (undefined==value || value<0) {
                return '';
            }
            return formatSeconds(Math.floor(value));
        },
        svgIcon: function (name, dark) {
            return "/material/svg/"+name+"?c="+(dark ? LMS_DARK_SVG : LMS_LIGHT_SVG)+"&r="+LMS_MATERIAL_REVISION;
        },
        limitStr: function(str) {
            if (undefined==str || str.length<80) {
                return str;
            }
            return str.substring(0, 80) + "...";
        },
        trackCount(current, total, sep) {
            if (undefined==current || undefined==total || total<2) {
                return "";
            }
            return (undefined==sep ? "" : sep)+(current+1)+" / " + total;
        }
    },
    watch: {
        'info.show': function(val) {
            // Indicate that dialog is/isn't shown, so that swipe is controlled
            bus.$emit('dialogOpen', 'info-dialog', val);
            this.setInfoTrack();
            this.showInfo();
        },
        'info.tab': function(tab) {
            this.showInfo();
        },
        'info.showTabs': function() {
            setLocalStorageVal("showTabs", this.info.showTabs);
        },
        'info.sync': function() {
            setLocalStorageVal("syncInfo", this.info.sync);
            if (this.info.sync) {
                this.setInfoTrack();
                this.showInfo();
            }
        },
        'largeView': function(val) {
            if (val) {
                // Save current style so can reset when largeview disabled
                if (!this.before) {
                    var elem = document.getElementById("np-bar");
                    if (elem) {
                        this.before = elem.style;
                    }
                }
                this.$nextTick(function () {
                    this.page = document.getElementById("np-page");
                    this.portraitElem = this.page;
                    this.setBgndCover();
                    this.calcPortraitPad();
                });
            } else {
                if (this.before) {
                    this.$nextTick(function () {
                        var elem = document.getElementById("np-bar");
                        if (elem) {
                            elem.style = this.before;
                        }
                    });
                }
                this.page = undefined;
            }
            bus.$emit('nowPlayingExpanded', val);
        },
        'landscape': function(val) {
            if (!val) {
                this.$nextTick(() => {
                    this.portraitElem = document.getElementById("np-page");
                    this.lastWidth = this.portraitElem ? this.portraitElem.offsetWidth : 0;
                    this.lastHeight = this.portraitElem ? this.portraitElem.offsetHeight : 0;
                    this.calcPortraitPad();
                });
            }
        },
        'menu.show': function(newVal) {
            this.$store.commit('menuVisible', {name:'nowplaying', shown:newVal});
        }
    },
    computed: {
        infoPlugin() {
            return this.$store.state.infoPlugin
        },
        stopButton() {
            return this.$store.state.stopButton
        },
        techInfo() {
            return this.$store.state.techInfo
        },
        formattedTime() {
            return this.playerStatus && this.playerStatus.current
                        ? !this.showTotal && undefined!=this.playerStatus.current.time && this.playerStatus.current.duration>0
                            ? formatSeconds(Math.floor(this.playerStatus.current.time))+" / -"+
                              formatSeconds(Math.floor(this.playerStatus.current.duration-this.playerStatus.current.time))
                            : (undefined!=this.playerStatus.current.time ? formatSeconds(Math.floor(this.playerStatus.current.time)) : "") +
                              (undefined!=this.playerStatus.current.time && this.playerStatus.current.duration>0 ? " / " : "") +
                              (this.playerStatus.current.duration>0 ? formatSeconds(Math.floor(this.playerStatus.current.duration)) : "")
                        : undefined;
        },
        darkUi() {
            return this.$store.state.darkUi
        },
        ratingsSupported() {
            return this.$store.state.ratingsSupport
        },
        showRatings() {
            return this.$store.state.ratingsSupport && this.playerStatus && this.playerStatus.current && this.playerStatus.current.duration && this.playerStatus.current.duration>0 && undefined!=this.playerStatus.current.id && !(""+this.playerStatus.current.id).startsWith("-");
        },
        maxRating() {
            return this.$store.state.maxRating
        },
        title() {
            if (this.$store.state.nowPlayingTrackNum && this.playerStatus.current.tracknum) {
                return (this.playerStatus.current.tracknum>9 ? this.playerStatus.current.tracknum : ("0" + this.playerStatus.current.tracknum))+SEPARATOR+this.playerStatus.current.title;
            }
            return this.playerStatus.current.title;
        },
        menuIcons() {
            return this.$store.state.menuIcons
        },
        zoomInfoClass() {
            return "np-info-text-"+this.infoZoom;
        },
        desktopLayout() {
            return this.$store.state.desktopLayout
        }
    },
    beforeDestroy() {
        this.stopPositionInterval();
        this.clearClickTimeout();
    }
});
