angular.module('starter.services', [])

.filter('latLng',function(){
  return function(latLng){
    function roundTo(val, digits) {
      return Math.round(Math.round(val * Math.pow(10,(digits || 0) + 1)) / 10) / Math.pow(10, (digits || 0));
    }

    
    return roundTo(latLng.lat,4) + "," + roundTo(latLng.lng,4);
  }
})
//會員資料
.factory('accountdata',function(){
  var acdata=[{
    'acid':1,
    'photo':'ben.png',
    'userid':'ccuandylau8787',
    'name':'中正劉Der滑',
    'birth':'1987/08/07',
    'cellphone':'0987878787',
    'email':'ccuandylau8787@bachimail.com.tw',
    'money':9487,
    'paymentType':'支付寶'
  }
  ];
  var changeAccountpayment=function(userid,payid){
    
    angular.forEach(acdata,function(value,key){
      if(value.userid==userid){
        switch(payid){
          case 1:
          value.paymentType='統一超商(7-ELEVEN)';
          break;
          case 2:
          value.paymentType='全家便利商店(FamilyMart)';
          break;
          case 3:
          value.paymentType='中國信託';
          break;
          case 4:
          value.paymentType='玉山銀行';
          break;
          case 5:
          value.paymentType='歐富寶';
          break;
          case 6:
          value.paymentType='支付寶';
          break;
        }
      }else{

      }
    })
  }

  var getAccountdata=function(userid){
    var rn=false;
    angular.forEach(acdata,function(value,key){
      if(value.userid==userid){
        rn=value;
      }else{

      }
    })
    return rn;
  }

  return{
    acdata:acdata,
    getAccountdata:getAccountdata,
    changeAccountpayment:changeAccountpayment
  }
})

.factory('parkingHistory',function(){
  var list = [
      {
        'hid' : 1,
        'name' : '大吃停車場',
        'billing' : '$20/hr',
        'start' : '2017/05/16  11:21',
        'leave' : '2017/05/16  15:20',
        'alongTime' : '4hr',
        'status' : '已繳費',
        'price' : '$80',
        'paymentType' : '悠遊卡',
        'latLng':{lat:23.560095,lng:120.474851}
      },
      {
        'hid' : 2,
        'name' : '中正大學管院停車場',
        'billing' : '$10/hr',
        'start' : '2017/05/17  07:21',
        'leave' : '2017/05/17  11:24',
        'alongTime' : '4hr',
        'status' : '未繳費',
        'price' : '$40',
        'paymentType' : '悠遊卡',
        'latLng':{lat:23.560093,lng:120.474851}
      }
  ];
  /*{
      latLng:{},
      parkingStart:'',
      parkingEnd:''
    }
  */
  var current = {
      latLng:{},
      parkingStart:'',
      parkingEnd:''
  }
  
  var changeParkingStatus =function(hid){
      var rn = false;
      angular.forEach(list, function(value, key) {
        if(value.hid == hid){
          if(value.status=='未繳費'){
            value.status='已繳費';
            console.log(value.status);
          }
        }else if(key == list.length){
        
        }else{
      
        }
        return 'gg';
      });
        
  }
  var getNonepayHistories = function(hid){
      var rn = false;
      angular.forEach(list, function(value, key) {
        if(value.hid == hid){
          rn = value;
        }else if(key == list.length){
        }else{
        }
      });
      return rn;
    }
  var addCarParkingList = function(latLng,name,billing,price){
    let temp = {
        'hid' : list.length,
        'name' : name,
        'billing' : billing,
        'start' : Math.round(new Date().getTime()),
        'leave' : '',
        'alongTime' : '',
        'status' : '未繳費',
        'price' : price,
        'paymentType' : '',
        'latLng':latLng
      }
      list.push(temp);
  }
  var getParkingHistories = function(hid){
      var rn = false;
      angular.forEach(list, function(value, key) {
        if(value.hid == hid){
          rn = value;
        }else if(key == list.length){
        
        }else{
      
        }
        return 'gg';
      });
      return rn;
    }
  return {
    list:list,
    current:current,
    getParkingHistories:getParkingHistories,
    changeParkingStatus:changeParkingStatus,
    addCarParkingList:addCarParkingList
  }
})

.factory('geo',function($q, $cordovaGeolocation){
  var coords={
    lat:null,
    lng:null
  };
  return{
    getPosition:function(){
      return coords;
    },
    refresh:function(){
      var deferred = $q.defer();
      $cordovaGeolocation.getCurrentPosition({
          timeout: 1000,
          enableHighAccuracy: true
        }).then(function(value){
          //console.log('===refresh===');
          //console.log(value);
          coords.lat = value.coords.latitude;
          coords.lng = value.coords.longitude;
          //console.log(value);
          deferred.resolve(coords);
        },function(err){
          console.warn('$cordovaGeolocation getCurrentPosition ERROR');
          deferred.reject(err);
        });
      return deferred.promise;
    },
    centerMap:function(map){

    }
  }
})


.factory('bl',function($ionicPlatform,$cordovaBluetoothSerial,debugMocks){
  var status = {
    enableBl: false,
    connectedDeviceName: '',
    isConnecetedDevice: true
  };

var api={};
$ionicPlatform.ready(function(){
  api={
    status:status,
    connectDevice:function(address){
      console.log('connectDevice');

      $cordovaBluetoothSerial.connect(address)
    .then(function(data){
      status.isConnecetedDevice=true;
      status.connectedDeviceName=data;
    }, function(err){
      status.isConnecetedDevice=false;
      alert(err);
      });

    },
    disconnect:function(){
      console.log('disconnect');

      $cordovaBluetoothSerial.disconnect()
    .then(function(data){
      status.isConnecetedDevice=false;
      status.connectedDeviceName='';
    }, function(err){
      
    });

    },
    isConneceted:function(){
      console.log('isConneceted');

    },
    lists:function(){
      console.log('lists');
      $cordovaBluetoothSerial.lists()
    .then(function(data){
      alert(debugMocks.dump(data));
    }, function(err){
        alert('err');
    });

    },
    isEnable:function(){
      console.log('isEnable');

    },
    enable:function(){
      console.log('enable');

    },
    read:function(){
      console.log('read');

    },
    write:function(){
      console.log('write');

    }
  }
})
  return api;

})


.factory('debugMocks', function(){
  return {
    dump:   function(object) {
      return serialize(object);

      function serialize(object) {
        var out;

        if (angular.isElement(object)) {
          object = angular.element(object);
          out = angular.element('<div></div>');
          angular.forEach(object, function(element) {
            out.append(angular.element(element).clone());
          });
          out = out.html();
        } else if (angular.isArray(object)) {
          out = [];
          angular.forEach(object, function(o) {
            out.push(serialize(o));
          });
          out = '[ ' + out.join(', ') + ' ]';
        } else if (angular.isObject(object)) {
          if (angular.isFunction(object.$eval) && angular.isFunction(object.$apply)) {
            out = serializeScope(object);
          } else if (object instanceof Error) {
            out = object.stack || ('' + object.name + ': ' + object.message);
          } else {
            // TODO(i): this prevents methods being logged,
            // we should have a better way to serialize objects
            out = angular.toJson(object, true);
          }
        } else {
          out = String(object);
        }

        return out;
      }

      function serializeScope(scope, offset) {
        offset = offset ||  '  ';
        var log = [offset + 'Scope(' + scope.$id + '): {'];
        for (var key in scope) {
          if (Object.prototype.hasOwnProperty.call(scope, key) && !key.match(/^(\$|this)/)) {
            log.push('  ' + key + ': ' + angular.toJson(scope[key]));
          }
        }
        var child = scope.$$childHead;
        while (child) {
          log.push(serializeScope(child, offset + '  '));
          child = child.$$nextSibling;
        }
        log.push('}');
        return log.join('\n' + offset);
      }
    }
  };

})

;
