angular.module('starter.controllers', ['ionic'])

.controller('detailCtrl', function($scope, $stateParams, parkingHistory,$ionicPopup,$state) {
        var hid = $stateParams.hid;
        $scope.details = parkingHistory.getParkingHistories(hid);
        hidePaymentButton($scope.details);
        //console.log($scope.details);
        $scope.billpopup=function(){
     $ionicPopup.show(billPopup);
    }
        var billPopup = {
            title: '繳費確認付款',
            subTitle: '',
            template: '總共需繳'+$scope.details.price+'<br>確定繳費?',
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
        var yesPopup={
      template:'已成功繳費!',
      scope: $scope,
      buttons:[{
        text:'OK',
        type: 'button-positive button-block ',
        onTap: function(e) {
          //這裡有問題，進去地圖清單會消失
          parkingHistory.changeParkingStatus(hid);
          hidePaymentButton($scope.details);
                }
      }]
    };
      function hidePaymentButton(his){
      if(his.status=='已繳費'){
        var hpb=document.getElementById('paybt');
        hpb.style.visibility="hidden";
      }
  }

    })
    .controller('historiesCtrl', function($scope, $state, parkingHistory) {

        $scope.goDetail = function(index) {
            $state.go('app.detail', { 'hid': index });
        }

        $scope.parkingHistories = parkingHistory.list;


    })

.controller('mapCtrl', function($scope, $firebaseAuth, $ionicPlatform, $timeout, geo, $compile, $ionicPopup) {

        var icon = {
            "noCar": "https://mt.google.com/vt/icon/name=icons/spotlight/measle_8px.png&scale=1",
            "hasCar": "https://mt.google.com/vt/icon/name=icons/spotlight/measle_green_8px.png&scale=1"
        }
        $scope.options = {
            isShowSearchBox: false,
        }

        var info = {
            origin: { "lat": 23.5602, "lng": 120.4766 },
            dest: { "lat": 23.5600, "lng": 120.4760 },
            directionsService: null,
            directionsDisplay: null,
            myLocationObj: null,
            carLocations: []
        }
        main();

        function main() {
            var config = {
                apiKey: "AIzaSyCXyFHUnZMI3OLWRW3JYcxilgiIGjkwr-M",
                authDomain: "elevated-oven-163107.firebaseapp.com",
                databaseURL: "https://elevated-oven-163107.firebaseio.com",
                storageBucket: "elevated-oven-163107.appspot.com",
                messagingSenderId: "1011526112914"
            };
            angular.element(document).ready(function() {
                firebase.initializeApp(config);
                var map = initMap(info.origin);
                addControlUI(map, 'location');
                addControlUI(map, 'options');
                addControlUI(map, 'flag');
                initAuth(map);
                initAutocomplete(map);

            })
        }


        function initAuth(map) {
            $firebaseAuth().$signInAnonymously().then(function(user) {
                console.log("connected");
                var devicesRef = firebase.database().ref('devices/');
                devicesRef.once('value').then(function(snapshot) {
                    var parkingList = snapshot.val();
                    //console.log(parkingList);
                    addMarkers(map, parkingList);
                }, function(err) {
                    console.warn(err);
                });;

            }, function(error) {
                // Handle Errors here.
                var errorCode = error.code;
                var errorMessage = error.message;
            });
        }

        //搜尋控制項
        function initAutocomplete(map) {

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


        //初始地圖
        function initMap(centerLatLng) {
            info.directionsService = new google.maps.DirectionsService;
            info.directionsDisplay = new google.maps.DirectionsRenderer;
            var map = new google.maps.Map(document.getElementById('myMap'), {
                center: centerLatLng,
                zoom: 18,
                disableDefaultUI: true
            });
            info.directionsDisplay.setMap(map);

            return map;
        }


        $scope.calculateAndDisplayRoute = function() { calculateAndDisplayRoute(); }

        function setMyLocation(map) {
            geo.refresh();
            if (info.myLocationObj != null) {
                $timeout(function(map) {
                    info.myLocationObj.setPosition(geo.getPosition());
                }, 1000, true, map);
            } else {
                $timeout(function(map) {
                    info.myLocationObj = addmylocation(map);
                }, 1000, true, map);
            }
            $timeout(function(map) {
                map.setZoom(18);
                map.setCenter(info.myLocationObj.getPosition());
            }, 1000, true, map);
            return geo.getPosition();

        }

        function addmylocation(map) {
            if (geo.getPosition()) {
                var markerOpts = {
                    'map': map,
                    'clickable': false,
                    'cursor': 'pointer',
                    'draggable': false,
                    'flat': true,
                    'icon': {
                        'url': 'https://chadkillingsworth.github.io/geolocation-marker/images/gpsloc.png',
                        'size': new google.maps.Size(34, 34),
                        'scaledSize': new google.maps.Size(17, 17),
                        'origin': new google.maps.Point(0, 0),
                        'anchor': new google.maps.Point(8, 8)
                    },
                    // This marker may move frequently - don't force canvas tile redraw
                    'optimized': false,
                    'position': geo.getPosition(),
                    'title': 'Current location',
                    'zIndex': 2
                };
                var loc = new google.maps.Marker(markerOpts);
                return loc;
            } else {
                console.error('NO geoooooooooo');
            }
        }
        var myPopup = {
            title: '中正大學管院停車場',
            subTitle: '地址: 就在管院旁邊',
            template: '收費時段: 00:00~24:00<br>已停留時間: 00:00:00',
            scope: $scope,
            buttons: [{
                text: '在此處停車',
                type: 'button-positive button-block ',
                onTap: function(e) {

                }
            }, {
                text: '導航至此',
                type: 'button-positive button-block',
                onTap: function(e) {
                    if (1) {
                        calculateAndDisplayRoute();
                        //e.preventDefault();
                    } else {
                        return 1;
                    }
                }
            }]
        };

        function addMarkers(map, parkingList) {
            var markers = [];
            var infowindow = new google.maps.InfoWindow({
                content: '<button ng-click="calculateAndDisplayRoute()">click me</button>'
            });
            //console.log(parkingList);
            for (var i = 0; i < parkingList.length; i++) {
                //console.log(i);
                var m = new google.maps.Marker({
                    position: parkingList[i],
                    map: map,
                    icon: ((parkingList[i].access == true) ? icon.hasCar : icon.noCar)
                })
                markers.push(m);

                m.addListener('click', (function(m, infowindow, i) {
                    return function() {
                        $ionicPopup.show(myPopup);
                        info.dest = m.getPosition();
                        /* myPopup.then(function(res) {
                           console.log('Tapped!', res);
                         });

                         $timeout(function() {
                            myPopup.close(); //close the popup after 3 seconds for some reason
                         }, 3000);
                        };*/

                    }

                })(m, infowindow, i));

            }
            var markerCluster = new MarkerClusterer(map, markers, {
                maxZoom: 16,
                imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'
            });
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
            var addCarLnr = map.addListener('click', function(event) {
                carMarker.setPosition(event.latLng);
                //console.log(event.latLng.lat());
            });
            return {
                "marker": carMarker,
                "listener": addCarLnr
            };
        }

        //儲存狀態跟取消狀態
        function addCarMarkerControl(map) {
            var carMarkerUI = document.createElement('div');
            carMarkerUI.className = 'carMarkerUI';

            var carMarkerUI_Btn = document.createElement('button');
            carMarkerUI_Btn.className = 'carMarkerUI_Btn car-save';
            carMarkerUI_Btn.setAttribute('ng-click', 'carSave()');
            carMarkerUI_Btn.innerHTML = 'Save';

            var carMarkerUI_Btn2 = document.createElement('button');
            carMarkerUI_Btn2.className = 'carMarkerUI_Btn car-cancel';
            carMarkerUI_Btn2.setAttribute('ng-click', 'carSaveCancel()');
            carMarkerUI_Btn2.innerHTML = 'Cancel';

            carMarkerUI.appendChild(carMarkerUI_Btn);
            carMarkerUI.appendChild(carMarkerUI_Btn2);

            carMarkerUI.index = 1;
            map.controls[google.maps.ControlPosition.TOP].push(carMarkerUI);
            return {
                "saveBtn": carMarkerUI_Btn,
                "cancelBtn": carMarkerUI_Btn2,
                "carMarkerUI": carMarkerUI
            }
        }

        //右下的三個按鈕
        function addControlUI(map, type) {
            var icon = '';
            switch (type) {
                case 'flag':
                    flag_var = {
                        "markerLnr": {},
                        "btn": {}
                    }
                    icon = 'ion-model-s';
                    break;
                case 'location':
                    icon = 'ion-location';
                    break;
                case 'options':
                    icon = 'ion-android-options';
                    break;
                default:
                    icon = 'ion-location';
                    break;
            }
            // Set CSS for the control border.
            var controlUI = document.createElement('div');
            controlUI.className = 'controlUI';

            var controlUI_Btn = document.createElement('button');
            controlUI_Btn.className = 'controlUI_Btn';

            var controlUI_Icon = document.createElement('div');
            controlUI_Icon.className = 'controlUI_Icon ' + icon;

            controlUI.appendChild(controlUI_Btn);
            controlUI_Btn.appendChild(controlUI_Icon);
            controlUI.index = 1;
            map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(controlUI);

            var clicked = false;
            // Setup the click event listeners: simply set the map to Chicago.
            controlUI_Btn.addEventListener('click', function() {
                clicked = !clicked;
                switch (type) {
                    case 'flag':
                        if (clicked) {
                            flag_var.markerLnr = addCarMarker(map);
                            flag_var.btn = addCarMarkerControl(map);
                            $scope.carSave = function() {
                                info.carLocations.push(flag_var.markerLnr.marker);
                                clicked = !clicked;
                                flag_var.btn.carMarkerUI.remove();
                                google.maps.event.removeListener(flag_var.markerLnr.listener);
                            }
                            $scope.carSaveCancel = function() {
                                    controlUI_Btn.click();
                                }
                                //console.log(flag_var.btn);
                            $compile(flag_var.btn.saveBtn)($scope);
                            $compile(flag_var.btn.cancelBtn)($scope);
                        } else {
                            flag_var.btn.carMarkerUI.remove();
                            google.maps.event.removeListener(flag_var.markerLnr.listener);
                            flag_var.markerLnr.marker.setPosition(null);
                            flag_var.markerLnr = {};
                        }
                        console.log(info.carLocations);
                        //console.log(flag_var.markerLnr);
                        //console.log(clicked);
                        break;

                    case 'location':
                        setMyLocation(map);
                        console.log(info.myLocationObj);
                        console.log(geo.getPosition());
                        break;

                    case 'options':

                        break;
                    default:

                        break;
                }
            });
        }


        function calculateAndDisplayRoute() {

            info.directionsService.route({
                origin: setMyLocation(info.directionsDisplay.setMap().getPosition()),
                destination: info.dest,
                travelMode: google.maps.TravelMode.DRIVING
            }, function(response, status) {
                if (status === google.maps.DirectionsStatus.OK) {
                    info.directionsDisplay.setDirections(response);
                    var legs = response.routes[0].legs;
                    var distance = 0;
                    var duration = 0;
                    for (i = 0; i < legs.length; i++) {
                        distance += legs[i].distance.value;
                        duration += legs[i].duration.value;
                    }
                    /*console.log(response);
                    console.log(distance+"公尺");
                    console.log(duration+"秒");*/
                } else {
                    window.alert('Directions request failed due to ' + status);
                }
            });
        }



    })
    .controller('DashCtrl', function($scope) {
        $scope.command = { 'data': '' };
        $scope.messages = [
            { 'from': 'Me', 'content': 'XD' },
            { 'from': 'Me2', 'content': 'XDD' },
            { 'from': 'Me3', 'content': 'XDDD' }
        ]
        $scope.sendMessage = function(data) {
            console.log('send(' + $scope.command.data + ')');
            if ($scope.command.data == '') {} else {
                $scope.messages.push({ 'from': 'Me', 'content': $scope.command.data })
                $scope.command.data = '';
            }
        }

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

.controller('IPayCtrl', function($scope,parkingHistory) {

    $scope.parkingHistories = parkingHistory.list;
})

.controller('conditionCtrl', function($scope,parkingHistory) {
    $scope.condition = parkingHistory.getParkingHistories(parkingHistory.list.length);
})

.controller('PaymentCtrl', function($scope,accountdata,$ionicPopup,$state) {
  var userid='ccuandylau8787';
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
                  accountdata.changeAccountpayment(userid,$scope.payid);
                  //console.log($scope.payid);
                }
            }, {
                text: '否',
                type: 'button-positive button-block',
                onTap: function(e) {
                    
                }
            }]
        };
  var yesPopup={
      template:'已成功更改付款方式!',
      scope: $scope,
      buttons:[{
        text:'OK',
        type: 'button-positive button-block ',
        onTap: function(e) {

                }
      }]
    };

    $scope.paymentpopup=function(payid){
     $scope.payid=payid;
     $ionicPopup.show(paymentPopup);
    }

})

.controller('ReadytopayCtrl', function($scope,parkingHistory,$ionicPopup,$state) {
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
    var yesPopup={
      template:'已成功繳費!',
      scope: $scope,
      buttons:[{
        text:'OK',
        type: 'button-positive button-block ',
        onTap: function(e) {
          //這裡有問題，進去地圖清單會消失
          $state.go('app.map');
                }
      }]
    };
     $scope.billpopup=function(){
     $ionicPopup.show(billPopup);
    }
    $scope.details = parkingHistory.getParkingHistories(1);
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
    $scope.chat = Chats.get($stateParams.chatId);
})

.controller('MenuCtrl', function($scope,accountdata) {
    var userid='ccuandylau8787';
    $scope.account = accountdata.getAccountdata(userid);
})

.controller('LoginCtrl', function($scope,$state,$ionicBackdrop) {
    $scope.gopage = function() {
            $state.go('app.map');
        }
    
})

.controller('AccountCtrl', function($scope,accountdata) {
    var userid='ccuandylau8787';
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
