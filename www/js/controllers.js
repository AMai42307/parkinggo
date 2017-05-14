angular.module('starter.controllers', ['ionic'])

.controller('LoginmodalCtrl',function($scope, $ionicModal){


})
.controller('LoginCtrl', function($scope, $stateParams,$state,$firebaseAuth,accountdata,firebaseconfig) {


    $scope.gopage = function() {
            $state.go('app.map');
        }
        
})

.controller('mapCtrl', function(debugMocks, $scope, parkingHistory, $ionicPopup, $firebaseAuth, $timeout, geo, $compile,accountdata,$ionicModal,firebaseconfig,firebaseparkinglist) {

  $scope.isLogin=function(){
    if(accountdata.acdata[0].islogin==true){
      $scope.modal.hide();
    }else{
      //沒登入成功
      var loginfailPopup = {
      template: '您還沒有登入完成喔，請重新登入!',
      scope: $scope,
      buttons: [{
          text: 'OK',
          type: 'button-positive button-block ',
          onTap: function(e) {
          }
      }]
  };
  $ionicPopup.show(loginfailPopup);
    }
  }
  //fb登入函式
  $scope.fbLogin = function() {
         //console.log(firebaseconfig.config);
      firebase.initializeApp(firebaseconfig.config);

      var uiConfig = {
          credentialHelper: firebaseui.auth.CredentialHelper.NONE,
          callbacks: {
              signInSuccess: function(currentUser, credential, redirectUrl) {
                  // Do something.
                  // Return type determines whether we continue the redirect automatically
                  // or whether we leave that to developer to handle.
                  console.log("firebaseui!!!! SUCCESSED!!");
                  console.log(currentUser);
                  $scope.fbPhoto = currentUser.photoURL;
                  
                  accountdata.fbloginChange('ccuandylau8787',currentUser.displayName,currentUser.photoURL,currentUser.email);
                  accountdata.checkLogin();
                  main();//登入完跑地圖
                  return false;
              }
          },
          signInOptions: [
              // Leave the lines as is for the providers you want to offer your users.
              //firebase.auth.GoogleAuthProvider.PROVIDER_ID,
              firebase.auth.FacebookAuthProvider.PROVIDER_ID,
              firebase.auth.TwitterAuthProvider.PROVIDER_ID,
              firebase.auth.GithubAuthProvider.PROVIDER_ID,
              firebase.auth.EmailAuthProvider.PROVIDER_ID
          ],
          signInFlow: 'popup',
          // Terms of service url.
          tosUrl: '<your-tos-url>'
      };

      var ui = new firebaseui.auth.AuthUI(firebase.auth());
      // The start method will wait until the DOM is loaded.
      ui.start('#firebaseui-auth-container', uiConfig);
      
  }

  $ionicModal.fromTemplateUrl('templates/loginmodal.html',{
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    console.log(modal);
    $scope.modal = modal;
    $scope.modal.show();
  });

  var icon = {
      "noCar": "https://mt.google.com/vt/icon/name=icons/spotlight/measle_8px.png&scale=1",
      "hasCar": "https://mt.google.com/vt/icon/name=icons/spotlight/measle_green_8px.png&scale=1"
  }
  $scope.options = {
      isShowSearchBox: false,
  }
  var info = {
      zoom: 0,
      origin: { lat: 23.5602, lng: 120.4766 },
      dest: {},
      directionsService: null,
      directionsDisplay: null,
      myLocationObj: null,
      pastcarLocationObj:null,
      carLocations: parkingHistory.list,
      flagLnr: {},
      tempLatLng: {},
      markers:{}
  }
  $scope.parkingHistoryList = info.carLocations;
  $scope.$on('$ionicView.enter',function(e){
    //main();

  });
  
  function addCanceldisplay(map){
  var canceldisplayUI = document.createElement('div');
      canceldisplayUI.className = 'canceldisplayUI';

      var canceldisplayUI_Btn = document.createElement('button');
      canceldisplayUI_Btn.id = 'canceldisplayUIBtn';
      canceldisplayUI_Btn.className = 'canceldisplayUI_Btn';
      canceldisplayUI_Btn.innerHTML = '取消導航路線';
      console.log(info.directionsDisplay);
      canceldisplayUI.appendChild(canceldisplayUI_Btn);
      canceldisplayUI_Btn.addEventListener('click', function(){
        info.directionsDisplay.setMap(null);
        canceldisplayUI.hidden=true;
      });

      canceldisplayUI.index = 1;
      map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(canceldisplayUI);

      //carMarkerUI = angular.element(carMarkerUI); 
      return {
          "cancelBtn": canceldisplayUI_Btn,
          "canceldisplayUI": canceldisplayUI
      }    
  }

  function main() {
      

    
      angular.element(document).ready(function() {
          //這裡firebaseconfig
          //firebase.initializeApp(firebaseconfig.config);
          var map = initMap(info.origin);
          addControlUI(map, 'location');
          addControlUI(map, 'options');
          info.flagLnr = addControlUI(map, 'flag');
          initAuth(map);
          info.myLocationObj = addMyLocation(map);
          info.myLocationObj.setPosition(null);
          //addMyLocation(map);
          autoCompeleteInit(map);

          geo.refresh().then(function(latLng) {
                      //console.log(latLng);
                      info.myLocationObj.setPosition(latLng);
                      //console.log(latLng);
                      map.setCenter(latLng);
                      map.setZoom(18);
                  }, function(err) {
                      //console.err();
                  });

      });
  }

  function firebaseQuery(ref,func){
    let devicesRef = firebase.database().ref(ref);
    devicesRef.once('value').then(function(snapshot) {
        func(snapshot.val()); 
    }, function(err) {
        console.warn(err);
    });
  }

  function firebaseOnChanged(ref,func){
    let devicesRef = firebase.database().ref(ref);
    devicesRef.on('child_changed',function(snapshot) {
        console.log(snapshot.val());
        console.log(snapshot.key);
        info.markers[snapshot.key].setIcon(
          ((snapshot.val().access == true) ? icon.hasCar : icon.noCar)
          );
        
    });
  }

  function initAuth(map) {
      $firebaseAuth().$signInAnonymously().then(function(user) {
          console.log("Connected!");

          firebaseQuery('test/devicesInfo/',function(data){
            
            addMarkers(map, data.a);
            addMarkers(map, data.b);
            //console.log(parkingListArray);
            //存進service
            //firebaseparkinglist.setList(parkingListArray);
            //console.log(firebaseparkinglist.parkinglist);
            console.log(info);
          });
          firebaseOnChanged('test/devicesInfo/a/');
          firebaseOnChanged('test/devicesInfo/b/');
          // mapCenter
          firebaseQuery('test/mapCenter/a/',function(data){
            console.log(data);
            info.origin.lat = data.latLng.lat;
            info.origin.lng = data.latLng.lng;
            info.zoom = data.zoom;
            map.setCenter(data.latLng);
            map.setZoom(info.zoom);
          });
          //

          // addMarkers('????');

      }, function(error) {
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
          // ...
      });

  }

  function initMap(centerLatLng) {
      info.directionsService = new google.maps.DirectionsService;
      info.directionsDisplay = new google.maps.DirectionsRenderer;
      var map = new google.maps.Map(document.getElementById('myMap'), {
          center: centerLatLng,
          zoom: 18,
          disableDefaultUI: true,
          styles: [{
            featureType: "poi",
            stylers: [{ visibility: "off" }]   
            }]
      });
      info.directionsDisplay.setMap(map);
      //calculateAndDisplayRoute(directionsService, directionsDisplay,{"access":true,"lng":120.474841,"lat":23.560093}, {"lng":120.575548,"lat":23.560743})



      map.addListener('zoom_changed', function() {
          info.zoom = map.getZoom();
          console.log('Zoom:' + 　info.zoom);
      });


      //addCarMarkerControl(map);

      return map;
      //manager(map);
  }

  function addCarMarker(map) {
      var carMarker = new google.maps.Marker({
          'map': map,
          'clickable': true,
          'cursor': 'pointer',
          'flat': false,
          'title': 'Custom location',
          'zIndex': 2,
          'label': {
              'text': 'Car',
              'color': '#FFF',
              'fontSize': '17px'
          },
          'icon': {
              'url': "http://maps.google.com/mapfiles/ms/icons/blue.png",
              'scaledSize': new google.maps.Size(60, 60),
              'labelOrigin': new google.maps.Point(29, 16)
          },
      });
      carMarker.setPosition(info.myLocationObj.getPosition());
      var addCarLnr = map.addListener('click', function(event) {
          carMarker.setPosition(event.latLng);
          info.carLocationTemp = event.latLng;
          //console.log(event.latLng.lat());
          //console.log(new google.maps.Marker());
      });

      return {
          "marker": carMarker,
          "listener": addCarLnr
      };
  }

  function autoCompeleteInit(map) {
      // Create the search box and link it to the UI element.
      var input = document.getElementById('pac-input');
      var searchBox = new google.maps.places.SearchBox(input);
      map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

      // Bias the SearchBox results towards current map's viewport.
      map.addListener('bounds_changed', function() {
          searchBox.setBounds(map.getBounds());
      });

      var markers = [];
      // Listen for the event fired when the user selects a prediction and retrieve
      // more details for that place.
      searchBox.addListener('places_changed', function() {
          var places = searchBox.getPlaces();

          if (places.length == 0) {
              return;
          }

          // Clear out the old markers.
          markers.forEach(function(marker) {
              marker.setMap(null);
          });
          markers = [];

          // For each place, get the icon, name and location.
          var bounds = new google.maps.LatLngBounds();
          places.forEach(function(place) {
              if (!place.geometry) {
                  console.log("Returned place contains no geometry");
                  return;
              }
              var icon = {
                  url: place.icon,
                  size: new google.maps.Size(71, 71),
                  origin: new google.maps.Point(0, 0),
                  anchor: new google.maps.Point(17, 34),
                  scaledSize: new google.maps.Size(25, 25)
              };

              // Create a marker for each place.
              markers.push(new google.maps.Marker({
                  map: map,
                  icon: icon,
                  title: place.name,
                  position: place.geometry.location
              }));

              if (place.geometry.viewport) {
                  // Only geocodes have viewport.
                  bounds.union(place.geometry.viewport);
              } else {
                  bounds.extend(place.geometry.location);
              }
          });
          map.fitBounds(bounds);
      });
  }

  function addMyLocation(map,type) {
    //原先marker url:https://chadkillingsworth.github.io/geolocation-marker/images/gpsloc.png
      //img/car.png
      var markertype='img/people.png';
      if(type=='car'){
        markertype='img/car.png';
      }

      var markerOpts = {
          'map': map,
          'clickable': false,
          'cursor': 'pointer',
          'draggable': false,
          'flat': true,
          'icon': {
              'url': markertype,
              'size': new google.maps.Size(40,60),
              'scaledSize': new google.maps.Size(40,50),
              'origin': new google.maps.Point(0, 0),
              'anchor': new google.maps.Point(20, 45)
          },
          // This marker may move frequently - don't force canvas tile redraw
          'optimized': false,
          'title': 'Current location',
          'zIndex': 2
      };

      var loc = new google.maps.Marker(markerOpts);
      loc.setPosition(null);

      return loc;
  }

  function addMarkers(map, parkingList) {

      var infowindow = new google.maps.InfoWindow({
          content: '<button id="directBtn" type="button" ng-click="calculateAndDisplayRoute()">Click Me!</button>'
      });
      
      /*
          myPopup.then(function(res) {
            console.log('Tapped!', res);
          });

          $timeout(function() {
             myPopup.close(); //close the popup after 3 seconds for some reason
          }, 3000);
         };*/

         var markerArray=[];
      for (var key in parkingList) {


          //console.log(i + ' : ');
          //console.log(parkingList[i]);
          var m = new google.maps.Marker({
              position: parkingList[key],
              map: map,
              icon: ((parkingList[key].access == true) ? icon.hasCar : icon.noCar)
          });
          info.markers[key]=m;
          markerArray.push(m);


          //infowindow.setPosition(parkingList[i]);

          m.addListener('click', (function(m, infowindow, key) {
              return function() {
                  info.tempLatLng = m.getPosition();
                  $ionicPopup.show({
          cssClass: 'bigPopup',
          template: '收費時段: '+parkingList[key].freetime+'</br>每小時收費:'+parkingList[key].price+'元',
          title: parkingList[key].title,
          subTitle: parkingList[key].subtitle,
          scope: $scope,
          buttons: [ {
              text: '導航至此',
              type: 'button-positive button-block',
              onTap: function(e) {
                  if (1) {
                      //don't allow the user to close unless he enters wifi password
                      info.directionsDisplay.setMap(map);
                     $scope.calculateAndDisplayRoute();
                     addCanceldisplay(map);
                      //e.preventDefault();
                  } else {
                      return 1;
                  }
              }
          }, {
              text: '回到地圖',
              type: 'button-block button-positive'
          }]
      });
                  
                  //infowindow.setPosition(m.getPosition());
                  info.dest.lat = m.getPosition().lat();
                  info.dest.lng = m.getPosition().lng();
                  //infowindow.open(map);
                  console.log(info);
                  //var directBtn = document.getElementById('directBtn');
                  //console.log(directBtn);
                  //$compile(directBtn)($scope);
                  //m.setMap(null);

              }
          })(m, infowindow, key));

      }

      var markerCluster = new MarkerClusterer(map, markerArray, {
          maxZoom: 18,
          imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'
      });
      return markerArray;
  }
  $scope.calculateAndDisplayRoute =
      function() {
          info.directionsService.route({
              origin: info.myLocationObj.position,
              destination: info.dest,
              travelMode: google.maps.TravelMode.DRIVING
          }, function(response, status) {
              if (status === google.maps.DirectionsStatus.OK) {
                  info.directionsDisplay.setDirections(response);
                  console.log(response.routes);
                  var legs = response.routes[0].legs;
                  var distance = 0; // meters
                  var duration = 0; //seconds
                  for (var i = 0; i < legs.length; i++) {
                      distance += legs[i].distance.value;
                      duration += legs[i].duration.value;
                  }

              } else {
                  window.alert('Directions request failed due to ' + status);
              }
          });
      }

  function addCarMarkerControl(map) {

      var carMarkerUI = document.createElement('div');
      carMarkerUI.className = 'carMarkerUI';

      var carMarkerUI_Btn = document.createElement('button');
      carMarkerUI_Btn.id = 'carSaveBtn';
      carMarkerUI_Btn.className = 'carMarkerUI_Btn car-save';
      carMarkerUI_Btn.setAttribute('ng-click', 'carSave()');
      carMarkerUI_Btn.innerHTML = 'Save';

      var carMarkerUI_Btn2 = document.createElement('button');
      carMarkerUI_Btn2.id = 'carSaveCancelBtn';
      carMarkerUI_Btn2.className = 'carMarkerUI_Btn car-cancel';
      carMarkerUI_Btn2.setAttribute('ng-click', 'carSaveCancel()');
      carMarkerUI_Btn2.innerHTML = 'Cancel';

      carMarkerUI.appendChild(carMarkerUI_Btn);
      carMarkerUI.appendChild(carMarkerUI_Btn2);

      carMarkerUI.index = 1;
      map.controls[google.maps.ControlPosition.TOP].push(carMarkerUI);

      //carMarkerUI = angular.element(carMarkerUI); 
      return {
          "saveBtn": carMarkerUI_Btn,
          "cancelBtn": carMarkerUI_Btn2,
          "carMarkerUI": carMarkerUI
      }



  }

  function addControlUI(map, type) {
      var icon = '';
      var controlUI = document.createElement('div');
      var controlUI_Btn = document.createElement('button');
      var controlUI_Icon = document.createElement('div');
      var clicked = false;
      switch (type) {
          case 'flag':
              var flag_var = {
                  "markerLnr": {},
                  "btn": {}
              };
              icon = 'ion-model-s';
              let addCarMakerUI = false;
              var flagFunc = function(e) {
                  if (!addCarMakerUI) {
                      addCarMakerUI = true;
                      flag_var.markerLnr = addCarMarker(map);
                      flag_var.btn = addCarMarkerControl(map);
                      $scope.carSave = function() {
                          //flag_var.markerLnr.marker
                          console.log(flag_var.markerLnr.marker.getPosition());
                          parkingHistory.addCarParkingList({
                                  'lat': flag_var.markerLnr.marker.getPosition().lat(),
                                  'lng': flag_var.markerLnr.marker.getPosition().lng()
                              },
                              'NAME',
                              'BILLING',
                              'price'
                          );
                          /*info.carLocations.push({
                            latLng:flag_var.markerLnr.marker.getPosition(),
                            parkingStart:Math.round(new Date().getTime()),
                            parkingEnd:''
                          });*/

                          flag_var.btn.carMarkerUI.remove();
                          google.maps.event.removeListener(flag_var.markerLnr.listener);
                          addCarMakerUI = false;;
                      }
                      $scope.carSaveCancel = function() {
                              //controlUI_Btn.click();

                              google.maps.event.removeListener(flag_var.markerLnr.listener);
                              flag_var.markerLnr.marker.setPosition(null);
                              flag_var.markerLnr = {};
                              flag_var.btn.carMarkerUI.remove();
                              addCarMakerUI = false;
                          }
                          //console.log(flag_var.btn);
                      $compile(flag_var.btn.saveBtn)($scope);
                      $compile(flag_var.btn.cancelBtn)($scope);
                  } else {
                      //clicked = false;
                      /*
                       */
                  }

              }
              var parkingPopup = {
                  cssClass: 'parkingPopup bigPopup',
                  templateUrl: 'templates/car-parkingList.html',
                  title: '停車位置紀錄',
                  subTitle: '',
                  scope: $scope,
                  buttons: [{
                      text: 'Cancel',
                      type: 'button-block'
                  }, {
                      text: '<b>立即記錄</b>',
                      type: 'button-block button-positive',
                      onTap: flagFunc
                  }]
              };
              break;
          case 'options':
              icon = 'ion-android-options';
              var mapOptionsPopup = {
                  cssClass: 'mapOptionsPopup',
                  templateUrl: 'templates/map-settings.html',
                  title: 'Enter Wi-Fi Password',
                  subTitle: 'Please use normal things',
                  scope: $scope,
                  buttons: [{
                      text: 'Cancel',
                      type: 'button-block'
                  }, {
                      text: '<b>Save</b>',
                      type: 'button-block button-positive',
                      onTap: function(e) {
                          if (!$scope.data.wifi) {
                              //don't allow the user to close unless he enters wifi password
                              e.preventDefault();
                          } else {
                              return $scope.data.wifi;
                          }
                      }
                  }]
              };
              break;
          case 'location':
              icon = 'ion-location';
              break;
          default:
              icon = 'ion-location';
              break;
      }



      controlUI.id = 'ui-' + type;
      controlUI.className = 'controlUI';
      controlUI_Btn.className = 'controlUI_Btn';
      controlUI_Icon.className = 'controlUI_Icon ' + icon;
      controlUI.appendChild(controlUI_Btn);
      controlUI_Btn.appendChild(controlUI_Icon);


      controlUI_Btn.addEventListener('click', function() {
          switch (type) {
              case 'flag':
                  /*$ionicPopup.show(parkingPopup).then(function() {
                  
                  });*/
                  

                      //console.log(latLng);
                      if (info.pastcarLocationObj == null) {
                          info.pastcarLocationObj = addMyLocation(map,'car');
                      
                      } else {}
                      info.pastcarLocationObj.setPosition(parkingHistory.getParkingHistories(info.carLocations.length).latLng);
                      console.log(parkingHistory.getParkingHistories(info.carLocations.length));
                      map.setCenter(parkingHistory.getParkingHistories(info.carLocations.length).latLng);
                      map.setZoom(19);
                  

                  //console.log(clicked);
                  break;
              case 'options':
                  //console.log(clicked);
                  $ionicPopup.show(mapOptionsPopup);


                  break;
              case 'location':
                  //console.log(clicked);
                  geo.refresh().then(function(latLng) {
                      //console.log(latLng);
                      if (info.myLocationObj == null) {
                          info.myLocationObj = addMyLocation(map);
                      } else {}
                      info.myLocationObj.setPosition(latLng);
                      //console.log(latLng);
                      map.setCenter(latLng);
                      map.setZoom(18);
                  }, function(err) {
                      //console.err();
                  });
                  break;
              default:

                  break;
          }
          clicked = !clicked;
      });

      controlUI.index = 1;
      map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(controlUI);
      return controlUI_Btn;
  }




})
.controller('DashCtrl', function($scope) {
  $scope.command = { 'data': '' };
  $scope.showData = function() {
      console.log($scope.command.data);
  };

  $scope.messages = [
      { 'from': 'ME', 'content': 'XDDDD' },
      { 'from': 'Bluetooth', 'content': 'Hi I am Rbai' },
      { 'from': 'ME', 'content': 'WOOOOOW' }
  ];

  $scope.send = function() {
      console.log('send( ' + $scope.command.data + ' )');

      if ($scope.command.data == '') {

      } else {
          $scope.messages.push({ 'from': 'ME', 'content': $scope.command.data });
          $scope.command.data = '';
      }
  };

})
.controller('detailCtrl', function($scope, $stateParams, parkingHistory, $ionicPopup, $state) {
  var hid = $stateParams.hid;
  $scope.details = parkingHistory.getParkingHistories(hid);
  hidePaymentButton($scope.details);
  //console.log($scope.details);
  $scope.billpopup = function() {
      $ionicPopup.show(billPopup);
  }
  var billPopup = {
      title: '繳費確認付款',
      subTitle: '',
      template: '總共需繳' + $scope.details.price + '<br>確定繳費?',
      scope: $scope,
      buttons: [{
          text: '是',
          type: 'button-positive button-block ',
          onTap: function(e) {
              $ionicPopup.show(yesPopup);
          }
      }, {
          text: '否',
          type: 'button-positive button-block',
          onTap: function(e) {

          }
      }]
  };
  var yesPopup = {
      template: '已成功繳費!',
      scope: $scope,
      buttons: [{
          text: 'OK',
          type: 'button-positive button-block ',
          onTap: function(e) {
              //這裡有問題，進去地圖清單會消失
              parkingHistory.changeParkingStatus(hid);
              //parkingHistory.setNonepayHistories();
              hidePaymentButton($scope.details);
          }
      }]
  };

  function hidePaymentButton(his) {
      if (his.status == '已繳費') {
          var hpb = document.getElementById('paybt');
          hpb.style.visibility = "hidden";
      }
  }

})
.controller('historiesCtrl', function($scope, $state, parkingHistory) {

  $scope.togglecheck=false;
  $scope.change=function(){
    //$scope.$digest();
    $scope.togglecheck=!$scope.togglecheck;
  }
  $scope.goDetail = function(index) {
      $state.go('app.detail', { 'hid': index });
  }
  $scope.isPaid=function(index){
    return parkingHistory.list[index].status!=='未繳費';
  }
  $scope.$on('$ionicView.enter',function(e){
      //每次載入都要執行一次
  $scope.parkingHistories = parkingHistory.list;
  parkingHistory.clearNonepayHistories();
  console.log($scope.togglecheck);
  parkingHistory.setNonepayHistories();
  //console.log(parkingHistory.nonepaylist);
  //$scope.nonepaylists=parkingHistory.nonepaylist;

  $scope.changeNonePay=function(){
    $scope.parkingHistories=parkingHistory.nonepaylist;
  }
  });


})

.controller('ChatsCtrl', function($scope, Chats) {
    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //
    //$scope.$on('$ionicView.enter', function(e) {
    //});

    $scope.chats = Chats.all();
    $scope.remove = function(chat) {
        Chats.remove(chat);
    };
})

.controller('promoCtrl', function($scope, $state) {


        $scope.gopage = function() {
            $state.go('app.promodetail', { 'promonum': '123456' });
        }

    })
    .controller('promodetailCtrl', function($scope, $stateParams) {
        $scope.promodetail = $stateParams;
        //console.log($stateParams);

    })

.controller('IPayCtrl', function($scope, parkingHistory) {

    $scope.parkingHistories = parkingHistory.list;
})

.controller('conditionCtrl', function($scope, parkingHistory) {
    $scope.condition = parkingHistory.getParkingHistories(parkingHistory.list.length);
})

.controller('PaymentCtrl', function($scope, accountdata, $ionicPopup, $state) {
    var userid = 'ccuandylau8787';
    var paymentPopup = {
        title: '更換付款方式',
        subTitle: '',
        template: '確定更改付款方式?',
        scope: $scope,
        buttons: [{
            text: '是',
            type: 'button-positive button-block ',
            onTap: function(e) {
                $ionicPopup.show(yesPopup);
                accountdata.changeAccountpayment(userid, $scope.payid);
                //console.log($scope.payid);
            }
        }, {
            text: '否',
            type: 'button-positive button-block',
            onTap: function(e) {

            }
        }]
    };
    var yesPopup = {
        template: '已成功更改付款方式!',
        scope: $scope,
        buttons: [{
            text: 'OK',
            type: 'button-positive button-block ',
            onTap: function(e) {

            }
        }]
    };

    $scope.paymentpopup = function(payid) {
        $scope.payid = payid;
        $ionicPopup.show(paymentPopup);
    }

})

.controller('ReadytopayCtrl', function($scope, parkingHistory, $ionicPopup, $state) {
    var billPopup = {
        title: '繳費確認付款',
        subTitle: '',
        template: '總共XX元<br>確定繳費?',
        scope: $scope,
        buttons: [{
            text: '是',
            type: 'button-positive button-block ',
            onTap: function(e) {
                $ionicPopup.show(yesPopup);
            }
        }, {
            text: '否',
            type: 'button-positive button-block',
            onTap: function(e) {

            }
        }]
    };
    var yesPopup = {
        template: '已成功繳費!',
        scope: $scope,
        buttons: [{
            text: 'OK',
            type: 'button-positive button-block ',
            onTap: function(e) {
                //這裡有問題，進去地圖清單會消失
                $state.go('app.map');
            }
        }]
    };
    $scope.billpopup = function() {
        $ionicPopup.show(billPopup);
    }
    $scope.details = parkingHistory.getParkingHistories(1);
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
    $scope.chat = Chats.get($stateParams.chatId);
})

.controller('MenuCtrl', function($scope, accountdata) {
    var userid = 'ccuandylau8787';
    $scope.account = accountdata.getAccountdata(userid);
})

.controller('AccountCtrl', function($scope, accountdata) {
    var userid = 'ccuandylau8787';
    $scope.account = accountdata.getAccountdata(userid);
    /*console.log(bl);
    $scope.status = bl.status;


    $scope.bl_lists = [
        { 'name': 'device1', 'address': '11:22:33' },
        { 'name': 'device2', 'address': 'aa:bb:cc' },
        { 'name': 'device3', 'address': 'dddddddd' },

    ]

    $scope.clickRefresh = function() {
        console.log('clickRefresh()');
        bl.lists();
    }

    $scope.connectDevice = function(index) {
        //console.log('connectDevice(  '+  $scope.bl_lists[index].address +'  )');
        bl.connectDevice($scope.bl_lists[index].address);
    }


    $scope.disconnect = function() {
        //console.log('disconnect()');

    }*/

})
