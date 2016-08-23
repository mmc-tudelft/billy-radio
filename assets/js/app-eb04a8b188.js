var app=angular.module("billy-radio",["ui.bootstrap","ngWebSocket"]);app.factory("jPlayerFactory",["$rootScope",function(t){var e={};return e.create=function(e,i){this.player=$(e).jPlayer({supplied:"mp3",wmode:"window",cssSelectorAncestor:i,ready:function(){t.$broadcast("_ready")},play:function(){t.$broadcast("playing")},ended:function(){t.$broadcast("ended")},pause:function(){t.$broadcast("paused")},loadstart:function(){t.$broadcast("loadstart")},error:function(){t.$broadcast("error")}})},e.load_and_play=function(t){this.clear(),this.player.jPlayer("setMedia",{mp3:t.link}),this.player.jPlayer("play"),this.track=t},e.play=function(){this.player.jPlayer("play")},e.pause=function(){this.player.jPlayer("pause")},e.stop=function(){this.player.jPlayer("stop")},e.clear=function(){this.player.jPlayer("clearMedia"),this.track=void 0},e.set_volume=function(t){this.player.jPlayer("volume",t/100)},e.seek=function(t){this.player.jPlayer("play",t)},e.get_current_time=function(t){return this.player.data("jPlayer").status.currentTime},e.get_duration=function(t){return this.player.data("jPlayer").status.duration},e}]),app.factory("YoutubePlayerFactory",["$rootScope",function(t){var e={};return e.create=function(e){var i=this;$.getScript("http://www.youtube.com/iframe_api"),$('<div id="'+e+'"></div>').appendTo("body"),window.onYouTubeIframeAPIReady=function(){i.player=new YT.Player(e,{height:"200",width:"320",playerVars:{autohide:1,autoplay:0,controls:0,fs:1,disablekb:0,modestbranding:1,iv_load_policy:3,rel:0,showinfo:0,theme:"dark",color:"red"},events:{onReady:function(e){t.$broadcast("_ready",e)},onStateChange:function(e){switch(e.data){case-1:t.$broadcast("loadstart");break;case 0:t.$broadcast("ended");break;case 1:t.$broadcast("playing");break;case 2:t.$broadcast("paused");break;case 5:t.$broadcast("loadstart")}},onError:function(e){t.$broadcast("error",e)}}})}},e.load_and_play=function(t){this.clear(),this.player.cueVideoById(t.link.substring(8)),this.player.playVideo(),this.track=t},e.play=function(){this.player.playVideo()},e.pause=function(){this.player.pauseVideo()},e.stop=function(){this.player.stopVideo(),t.$broadcast("paused")},e.clear=function(){this.stop(),this.player.clearVideo(),this.track=void 0},e.set_volume=function(t){this.player.setVolume(t)},e.seek=function(t){this.player.seekTo(t)},e.get_current_time=function(t){return this.player.getPlayerState()===-1?0:this.player.getCurrentTime()},e.get_duration=function(t){return this.player.getDuration()},e}]),app.factory("SoundCloudPlayerFactory",["$rootScope",function(t){var e={};return e.create=function(e){var i=this;$.when($.getScript("http://connect.soundcloud.com/sdk.js"),$.getScript("https://w.soundcloud.com/player/api.js"),$.Deferred(function(t){$(t.resolve)})).done(function(){SC.initialize({client_id:"ac0c94880338e855de3743d143368221"}),$('<iframe id="'+e+'" src="https://w.soundcloud.com/player/?url=https://api.soundcloud.com/tracks/39804767&show_artwork=false&liking=false&sharing=false&auto_play=false&single_active=false" scrolling="no" frameborder="no"></iframe>').appendTo("body"),i.player=SC.Widget(e),i.player.bind(SC.Widget.Events.READY,function(){t.$broadcast("_ready")}),i.player.bind(SC.Widget.Events.PLAY,function(){t.$broadcast("playing")}),i.player.bind(SC.Widget.Events.PAUSE,function(){t.$broadcast("paused")}),i.player.bind(SC.Widget.Events.FINISH,function(){t.$broadcast("ended")}),i.player.bind(SC.Widget.Events.PLAY_PROGRESS,function(){i.player.getPosition(function(e){0===e&&t.$broadcast("loadstart"),i.player_position=e/1e3}),i.player.getDuration(function(t){i.player_duration=t/1e3})}),i.player.bind(SC.Widget.Events.ERROR,function(){t.$broadcast("error")})})},e.load_and_play=function(t){this.clear();var e=this;this.player.load("http://api.soundcloud.com/tracks/"+t.link.substring(11),{callback:function(){e.player.play()}}),this.track=t},e.play=function(){this.player.play()},e.pause=function(){this.player.pause()},e.stop=function(){this.player.pause(),this.player.seekTo(0)},e.clear=function(){this.track=void 0},e.set_volume=function(t){this.player.setVolume(t/100)},e.seek=function(t){this.player.seekTo(1e3*t)},e.get_current_time=function(t){return this.player_position},e.get_duration=function(t){return this.player_duration},e}]),app.service("MusicService",["$rootScope","jPlayerFactory","YoutubePlayerFactory","SoundCloudPlayerFactory",function(t,e,i,a){this.init=function(){e.create("#player-core","#player-ui"),i.create("yt_player"),a.create("sc_player")},this.players_ready=0,this.players_total=3,this.playing=!1,this.players={jplayer:e,youtube:i,soundcloud:a},this.playlists={},this.name=void 0,this.index=0,this.get_player_type=function(){var t=this.track&&this.track.link||"";return 0===t.indexOf("youtube:")?"youtube":0===t.indexOf("soundcloud:")?"soundcloud":"jplayer"},this.get_player=function(){return this.players[this.get_player_type()]},this.load_and_play=function(t){this.track&&this.stop(),void 0!==t.index&&t.name?(this.track=this.playlists[t.name].tracks[t.index],this.name=t.name,this.index=t.index):(this.track=t.track,this.name=this.index=void 0),this.get_player().load_and_play(this.track)},this.play=function(){this.get_player().play()},this.pause=function(){this.get_player().pause()},this.stop=function(){this.get_player().stop()},this.seek=function(t){this.get_player().seek(t)},this.get_current_time=function(){return this.get_player().get_current_time()},this.get_duration=function(){return this.get_player().get_duration()},this.set_volume=function(t){Object.keys(this.players).forEach(function(e){this.players[e].set_volume(t)},this),this.volume=t},this.set_playlists=function(t){this.playlists=t},this.get_playlists=function(){return this.playlists},this.add_playlist=function(t,e){this.playlists[t]=e},this.delete_playlist=function(t){return Object.keys(this.playlists).length>1&&(delete this.playlists[t],!0)},this.reposition=function(t,e,i){var a=this.playlists[t].tracks,n=a[e];a.splice(e,1),a.splice(e-i,0,n),this.index<e&&this.index+i<e&&(this.index+=i),this.index<e&&this.index+i>e&&(this.index-=i)},this.next=function(t){var e;e=t===!0?(this.index+1)%this.playlists[this.name].tracks.length:this.index+1<this.playlists[this.name].tracks.length?this.index+1:void 0,void 0!==e&&(this.load_and_play({name:this.name,index:e}),this.index=e)},this.previous=function(){var t=this.index-1>=0?this.index-1:this.playlists[this.name].tracks.length-1;t<this.playlists[this.name].tracks.length-1&&(this.load_and_play({name:this.name,index:t}),this.index=t)},this.add=function(t,e){this.playlists[t].tracks.push(e)},this.remove=function(t,e){this.playlists[t].tracks.splice(e,1)};var n=this;t.$on("playing",function(t){n.playing=!0}),t.$on("paused",function(t){n.playing=!1}),t.$on("ended",function(t){n.playing=!1}),t.$on("_ready",function(e){n.players_ready+=1,n.players_ready===n.players_total&&t.$broadcast("ready")})}]),app.service("ApiService",["$http","$websocket","HelperService",function(t,e,i){this.last_status_update=void 0,this.tracks=[],this.position=[0,0],this.registrations=[],this.suggestions=[];var a=this,n=e("ws://musesync.ewi.tudelft.nl:8000/ws/radio");n.onMessage(function(t){var e=JSON.parse(t.data);if("status"==e.type)a.last_status_update=(new Date).getTime(),angular.copy(e.position,a.position);else if("data"==e.type)angular.copy(e.tracks,a.tracks),angular.copy(e.registrations,a.registrations),angular.copy(e.suggestions,a.suggestions);else if("registered"==e.type)a.registrations.push({user_id:e.user_id,user_name:e.user_name,time:e.time});else if("unregistered"==e.type){for(var i=0;i<a.registrations.length;i++)if(a.registrations[i].user_id==e.user_id){a.registrations.splice(i,1);break}}else"suggested"==e.type&&a.suggestions.push({user_id:e.user_id,user_name:e.user_name,content:e.content})}),this.register=function(t,e){n.send(JSON.stringify({type:"register",name:t}))},this.suggest=function(t){n.send(JSON.stringify({type:"suggest",content:t}))}}]),app.service("HelperService",["$uibModal",function(t){this.padNumber=function(t,e){for(var i=String(t);i.length<(e||2);)i="0"+i;return i},this.formatTime=function(t){return t>=60?this.padNumber(Math.floor(t/60),2)+":"+this.padNumber(Math.round(t%60),2):"00:"+this.padNumber(Math.round(t),2)},this.getParameterByName=function(t){t=t.replace(/[\[]/,"\\[").replace(/[\]]/,"\\]");var e=new RegExp("[\\?&]"+t+"=([^&#]*)"),i=e.exec(location.search);return null===i?"":decodeURIComponent(i[1].replace(/\+/g," "))},this.replaceParameter=function(t,e,i){var a=new RegExp("\\b("+e+"=).*?(&|$)");return t.search(a)>=0?t.replace(a,"$1"+i+"$2"):t+(t.indexOf("?")>0?"&":"?")+e+"="+i},this.formatString=function(){var t=Array.prototype.slice.call(arguments),e=t.shift();return e.replace(/\{(\d+)\}/g,function(e,i){return t[i]})},this.alert=function(e){t.open({animation:!1,templateUrl:"app/views/alert_modal.html",controller:["$scope",function(t){t.message=e}]})}}]),app.controller("MainCtrl",["$rootScope","$scope","$attrs","$interval","$uibModal","HelperService","MusicService","ApiService",function(t,e,i,a,n,s,r,o){e.musicservice=r,e.current_time=0,e.current_volume=80,e.start=function(){r.init(),t.$on("ready",function(t){e.$watch("tracks",function(t,e){l(t)},!0),e.$watch("position",function(t,e){u(t[0],t[1])},!0),a(function(){var t=r.get_current_time();e.current_time=t,e.current_time_str=s.formatTime(t),t=r.get_duration(),e.duration=t||1,e.duration_str=s.formatTime(t),e.remaining=Math.abs(e.current_time-e.duration),e.remaining_str=s.formatTime(e.remaining)},1e3)})},e.$on("playing",function(t){r.set_volume(e.current_volume)}),e.$on("ended",function(t){r.next(!0)}),e.set_volume=function(t){r.set_volume(t),e.current_volume=t},e.volume_click=function(t){var i=$(t.currentTarget).width(),a=t.offsetX/i*100;e.set_volume(a)};var l=function(t){r.set_playlists({default_name:{tracks:t}}),r.load_and_play({name:"default_name",index:0})};e.tracks=o.tracks,e.position=o.position,e.registrations=o.registrations,e.suggestions=o.suggestions;var c=function(t,i){for(var a=0,n=0;n<t;n++)a+=e.tracks[n].duration;return a+=i},u=function(e,i){var a=c(e,i),n=c(r.index,r.get_current_time()),s=Math.abs(n-a);if(isNaN(s)){console.log("Can't calculate time difference right now, rescheduling");var l=t.$on("playing",function(t){var a=((new Date).getTime()-o.last_status_update)/1e3;u(e,i+a),l()})}else s>=5&&(console.log("Time difference is "+s+"s, correcting play position"),r.index!==e&&r.load_and_play({name:"default_name",index:e}),r.seek(i))};if("false"!==i.forceRegistration){var p=n.open({animation:!1,templateUrl:"app/views/registration_modal.html",controller:"RegistrationModalCtrl",backdrop:"static",keyboard:!1});p.result.then(function(t){o.register(t.name,t.activity),e.start()},function(){})}e.create_suggestion=function(){var t=n.open({animation:!1,templateUrl:"app/views/suggestion_modal.html",controller:"SuggestionModalCtrl"});t.result.then(function(t){o.suggest(t.suggestion)},function(){})},e.close_widget=function(){var t=window.parent;t&&t.postMessage&&t.postMessage("close","*")}}]),app.controller("RegistrationModalCtrl",["$scope","$uibModalInstance",function(t,e){t.save=function(){t.activity_popover=!1,t.name_popover=!t.name,t.name&&(t.activity_popover=!t.activity,t.activity&&e.close({name:t.name,activity:t.activity}))}}]),app.controller("SuggestionModalCtrl",["$scope","$uibModalInstance",function(t,e){t.save=function(){t.suggestion_popover=!t.suggestion,t.suggestion&&e.close({suggestion:t.suggestion})},t.close=function(){e.dismiss("cancel")}}]),app.filter("range",function(){return function(t,e,i){return t.filter(function(t,a){return a>=e&&(a<i||void 0===i)})}}),app.filter("timeago",function(){function t(t){return $.timeago(new Date(1e3*t))}return t.$stateful=!0,t});var app=angular.module("billy-radio",["ui.bootstrap","ngWebSocket"]);app.factory("jPlayerFactory",["$rootScope",function(t){var e={};return e.create=function(e,i){this.player=$(e).jPlayer({supplied:"mp3",wmode:"window",cssSelectorAncestor:i,ready:function(){t.$broadcast("_ready")},play:function(){t.$broadcast("playing")},ended:function(){t.$broadcast("ended")},pause:function(){t.$broadcast("paused")},loadstart:function(){t.$broadcast("loadstart")},error:function(){t.$broadcast("error")}})},e.load_and_play=function(t){this.clear(),this.player.jPlayer("setMedia",{mp3:t.link}),this.player.jPlayer("play"),this.track=t},e.play=function(){this.player.jPlayer("play")},e.pause=function(){this.player.jPlayer("pause")},e.stop=function(){this.player.jPlayer("stop")},e.clear=function(){this.player.jPlayer("clearMedia"),this.track=void 0},e.set_volume=function(t){this.player.jPlayer("volume",t/100)},e.seek=function(t){this.player.jPlayer("play",t)},e.get_current_time=function(t){return this.player.data("jPlayer").status.currentTime},e.get_duration=function(t){return this.player.data("jPlayer").status.duration},e}]),app.factory("YoutubePlayerFactory",["$rootScope",function(t){var e={};return e.create=function(e){var i=this;$.getScript("http://www.youtube.com/iframe_api"),$('<div id="'+e+'"></div>').appendTo("body"),window.onYouTubeIframeAPIReady=function(){i.player=new YT.Player(e,{height:"200",width:"320",playerVars:{autohide:1,autoplay:0,controls:0,fs:1,disablekb:0,modestbranding:1,iv_load_policy:3,rel:0,showinfo:0,theme:"dark",color:"red"},events:{onReady:function(e){t.$broadcast("_ready",e)},onStateChange:function(e){switch(e.data){case-1:t.$broadcast("loadstart");break;case 0:t.$broadcast("ended");break;case 1:t.$broadcast("playing");break;case 2:t.$broadcast("paused");break;case 5:t.$broadcast("loadstart")}},onError:function(e){t.$broadcast("error",e)}}})}},e.load_and_play=function(t){this.clear(),this.player.cueVideoById(t.link.substring(8)),this.player.playVideo(),this.track=t},e.play=function(){this.player.playVideo()},e.pause=function(){this.player.pauseVideo()},e.stop=function(){this.player.stopVideo(),t.$broadcast("paused")},e.clear=function(){this.stop(),this.player.clearVideo(),this.track=void 0},e.set_volume=function(t){this.player.setVolume(t)},e.seek=function(t){this.player.seekTo(t)},e.get_current_time=function(t){return this.player.getPlayerState()===-1?0:this.player.getCurrentTime()},e.get_duration=function(t){return this.player.getDuration()},e}]),app.factory("SoundCloudPlayerFactory",["$rootScope",function(t){var e={};return e.create=function(e){var i=this;$.when($.getScript("http://connect.soundcloud.com/sdk.js"),$.getScript("https://w.soundcloud.com/player/api.js"),$.Deferred(function(t){$(t.resolve)})).done(function(){SC.initialize({client_id:"ac0c94880338e855de3743d143368221"}),$('<iframe id="'+e+'" src="https://w.soundcloud.com/player/?url=https://api.soundcloud.com/tracks/39804767&show_artwork=false&liking=false&sharing=false&auto_play=false&single_active=false" scrolling="no" frameborder="no"></iframe>').appendTo("body"),i.player=SC.Widget(e),i.player.bind(SC.Widget.Events.READY,function(){t.$broadcast("_ready")}),i.player.bind(SC.Widget.Events.PLAY,function(){t.$broadcast("playing")}),i.player.bind(SC.Widget.Events.PAUSE,function(){t.$broadcast("paused")}),i.player.bind(SC.Widget.Events.FINISH,function(){t.$broadcast("ended")}),i.player.bind(SC.Widget.Events.PLAY_PROGRESS,function(){i.player.getPosition(function(e){0===e&&t.$broadcast("loadstart"),i.player_position=e/1e3}),i.player.getDuration(function(t){i.player_duration=t/1e3})}),i.player.bind(SC.Widget.Events.ERROR,function(){t.$broadcast("error")})})},e.load_and_play=function(t){this.clear();var e=this;this.player.load("http://api.soundcloud.com/tracks/"+t.link.substring(11),{callback:function(){e.player.play()}}),this.track=t},e.play=function(){this.player.play()},e.pause=function(){this.player.pause()},e.stop=function(){this.player.pause(),this.player.seekTo(0)},e.clear=function(){this.track=void 0},e.set_volume=function(t){this.player.setVolume(t/100)},e.seek=function(t){this.player.seekTo(1e3*t)},e.get_current_time=function(t){return this.player_position},e.get_duration=function(t){return this.player_duration},e}]),app.service("MusicService",["$rootScope","jPlayerFactory","YoutubePlayerFactory","SoundCloudPlayerFactory",function(t,e,i,a){this.init=function(){e.create("#player-core","#player-ui"),i.create("yt_player"),a.create("sc_player")},this.players_ready=0,this.players_total=3,this.playing=!1,this.players={jplayer:e,youtube:i,soundcloud:a},this.playlists={},this.name=void 0,this.index=0,this.get_player_type=function(){var t=this.track&&this.track.link||"";return 0===t.indexOf("youtube:")?"youtube":0===t.indexOf("soundcloud:")?"soundcloud":"jplayer"},this.get_player=function(){return this.players[this.get_player_type()]},this.load_and_play=function(t){this.track&&this.stop(),void 0!==t.index&&t.name?(this.track=this.playlists[t.name].tracks[t.index],this.name=t.name,this.index=t.index):(this.track=t.track,this.name=this.index=void 0),this.get_player().load_and_play(this.track)},this.play=function(){this.get_player().play()},this.pause=function(){this.get_player().pause()},this.stop=function(){this.get_player().stop()},this.seek=function(t){this.get_player().seek(t)},this.get_current_time=function(){return this.get_player().get_current_time()},this.get_duration=function(){return this.get_player().get_duration()},this.set_volume=function(t){Object.keys(this.players).forEach(function(e){this.players[e].set_volume(t)},this),this.volume=t},this.set_playlists=function(t){this.playlists=t},this.get_playlists=function(){return this.playlists},this.add_playlist=function(t,e){this.playlists[t]=e},this.delete_playlist=function(t){return Object.keys(this.playlists).length>1&&(delete this.playlists[t],!0)},this.reposition=function(t,e,i){var a=this.playlists[t].tracks,n=a[e];a.splice(e,1),a.splice(e-i,0,n),this.index<e&&this.index+i<e&&(this.index+=i),this.index<e&&this.index+i>e&&(this.index-=i)},this.next=function(t){var e;e=t===!0?(this.index+1)%this.playlists[this.name].tracks.length:this.index+1<this.playlists[this.name].tracks.length?this.index+1:void 0,void 0!==e&&(this.load_and_play({name:this.name,index:e}),this.index=e)},this.previous=function(){var t=this.index-1>=0?this.index-1:this.playlists[this.name].tracks.length-1;t<this.playlists[this.name].tracks.length-1&&(this.load_and_play({name:this.name,index:t}),this.index=t)},this.add=function(t,e){this.playlists[t].tracks.push(e)},this.remove=function(t,e){this.playlists[t].tracks.splice(e,1)};var n=this;t.$on("playing",function(t){n.playing=!0}),t.$on("paused",function(t){n.playing=!1}),t.$on("ended",function(t){n.playing=!1}),t.$on("_ready",function(e){n.players_ready+=1,n.players_ready===n.players_total&&t.$broadcast("ready")})}]),app.service("ApiService",["$http","$websocket","HelperService",function(t,e,i){this.last_status_update=void 0,this.tracks=[],this.position=[0,0],this.registrations=[],this.suggestions=[];var a=this,n=e("ws://musesync.ewi.tudelft.nl:8000/ws/radio");n.onMessage(function(t){var e=JSON.parse(t.data);if("status"==e.type)a.last_status_update=(new Date).getTime(),angular.copy(e.position,a.position);else if("data"==e.type)angular.copy(e.tracks,a.tracks),angular.copy(e.registrations,a.registrations),angular.copy(e.suggestions,a.suggestions);else if("registered"==e.type)a.registrations.push({user_id:e.user_id,user_name:e.user_name,time:e.time});else if("unregistered"==e.type){for(var i=0;i<a.registrations.length;i++)if(a.registrations[i].user_id==e.user_id){a.registrations.splice(i,1);break}}else"suggested"==e.type&&a.suggestions.push({user_id:e.user_id,user_name:e.user_name,content:e.content})}),this.register=function(t,e){n.send(JSON.stringify({type:"register",name:t}))},this.suggest=function(t){n.send(JSON.stringify({type:"suggest",content:t}))}}]),app.service("HelperService",["$uibModal",function(t){this.padNumber=function(t,e){for(var i=String(t);i.length<(e||2);)i="0"+i;return i},this.formatTime=function(t){return t>=60?this.padNumber(Math.floor(t/60),2)+":"+this.padNumber(Math.round(t%60),2):"00:"+this.padNumber(Math.round(t),2)},this.getParameterByName=function(t){t=t.replace(/[\[]/,"\\[").replace(/[\]]/,"\\]");var e=new RegExp("[\\?&]"+t+"=([^&#]*)"),i=e.exec(location.search);return null===i?"":decodeURIComponent(i[1].replace(/\+/g," "))},this.replaceParameter=function(t,e,i){var a=new RegExp("\\b("+e+"=).*?(&|$)");return t.search(a)>=0?t.replace(a,"$1"+i+"$2"):t+(t.indexOf("?")>0?"&":"?")+e+"="+i},this.formatString=function(){var t=Array.prototype.slice.call(arguments),e=t.shift();return e.replace(/\{(\d+)\}/g,function(e,i){return t[i]})},this.alert=function(e){t.open({animation:!1,templateUrl:"app/views/alert_modal.html",controller:["$scope",function(t){t.message=e}]})}}]),app.controller("MainCtrl",["$rootScope","$scope","$attrs","$interval","$uibModal","HelperService","MusicService","ApiService",function(t,e,i,a,n,s,r,o){e.musicservice=r,e.current_time=0,e.current_volume=80,e.start=function(){r.init(),t.$on("ready",function(t){e.$watch("tracks",function(t,e){l(t)},!0),e.$watch("position",function(t,e){u(t[0],t[1])},!0),a(function(){var t=r.get_current_time();e.current_time=t,e.current_time_str=s.formatTime(t),t=r.get_duration(),e.duration=t||1,e.duration_str=s.formatTime(t),e.remaining=Math.abs(e.current_time-e.duration),e.remaining_str=s.formatTime(e.remaining)},1e3)})},e.$on("playing",function(t){r.set_volume(e.current_volume)}),e.$on("ended",function(t){r.next(!0)}),e.set_volume=function(t){r.set_volume(t),e.current_volume=t},e.volume_click=function(t){var i=$(t.currentTarget).width(),a=t.offsetX/i*100;e.set_volume(a)};var l=function(t){r.set_playlists({default_name:{tracks:t}}),r.load_and_play({name:"default_name",index:0})};e.tracks=o.tracks,e.position=o.position,e.registrations=o.registrations,e.suggestions=o.suggestions;var c=function(t,i){for(var a=0,n=0;n<t;n++)a+=e.tracks[n].duration;return a+=i},u=function(e,i){var a=c(e,i),n=c(r.index,r.get_current_time()),s=Math.abs(n-a);if(isNaN(s)){console.log("Can't calculate time difference right now, rescheduling");var l=t.$on("playing",function(t){var a=((new Date).getTime()-o.last_status_update)/1e3;u(e,i+a),l()})}else s>=5&&(console.log("Time difference is "+s+"s, correcting play position"),r.index!==e&&r.load_and_play({name:"default_name",index:e}),r.seek(i))};if("false"!==i.forceRegistration){var p=n.open({animation:!1,templateUrl:"app/views/registration_modal.html",controller:"RegistrationModalCtrl",backdrop:"static",keyboard:!1});p.result.then(function(t){o.register(t.name,t.activity),e.start()},function(){})}e.create_suggestion=function(){var t=n.open({animation:!1,templateUrl:"app/views/suggestion_modal.html",controller:"SuggestionModalCtrl"});t.result.then(function(t){o.suggest(t.suggestion)},function(){})},e.close_widget=function(){var t=window.parent;t&&t.postMessage&&t.postMessage("close","*")}}]),app.controller("RegistrationModalCtrl",["$scope","$uibModalInstance",function(t,e){t.save=function(){t.activity_popover=!1,t.name_popover=!t.name,t.name&&(t.activity_popover=!t.activity,t.activity&&e.close({name:t.name,activity:t.activity}))}}]),app.controller("SuggestionModalCtrl",["$scope","$uibModalInstance",function(t,e){t.save=function(){t.suggestion_popover=!t.suggestion,t.suggestion&&e.close({suggestion:t.suggestion})},t.close=function(){e.dismiss("cancel")}}]),app.filter("range",function(){return function(t,e,i){return t.filter(function(t,a){return a>=e&&(a<i||void 0===i)})}}),app.filter("timeago",function(){function t(t){return $.timeago(new Date(1e3*t))}return t.$stateful=!0,t}),angular.module("billy-radio").run(["$templateCache",function(t){t.put("app/views/alert_modal.html",'<div class="modal-header" style="border-bottom: none;"><button type="button" class="close" ng-click="$close()">&times;</button><h4 class="modal-title">Alert</h4></div><div class="modal-body">{{ message }}</div><div class="modal-footer" style="border-top: none;"><button class="btn btn-primary" type="button" ng-click="$close()">OK</button></div>'),t.put("app/views/registration_modal.html",'<div class="modal-header"><h4 class="modal-title">Enter a username to join</h4></div><div class="modal-body"><form><div class="form-group"><label class="control-label">Name</label> <input autofocus type="text" class="form-control" placeholder="Please enter a name." uib-popover="Please fill out this field." popover-is-open="name_popover" popover-trigger="none" ng-model="name"></div><div class="form-group"><label class="control-label">Data science activity</label> <input type="text" class="form-control" placeholder="Please enter the type of data science activity that you are working on." uib-popover="Please fill out this field." popover-is-open="activity_popover" popover-trigger="none" ng-model="activity"></div></form></div><div class="modal-footer"><button type="submit" class="btn btn-primary" ng-click="save()">Join</button></div>'),t.put("app/views/suggestion_modal.html",'<div class="modal-header"><button type="button" class="close" ng-click="close()">&times;</button><h4 class="modal-title">Suggest a track</h4></div><div class="modal-body"><form><div class="form-group"><label class="control-label">Name</label> <input autofocus type="text" class="form-control" placeholder="Please enter the name of the track you would like to hear." uib-popover="Please fill out this field." popover-is-open="suggestion_popover" popover-trigger="none" ng-model="suggestion"></div></form></div><div class="modal-footer"><button type="button" class="btn btn-default" ng-click="close()">Close</button> <button type="submit" class="btn btn-primary" ng-click="save()">Suggest</button></div>')}]);