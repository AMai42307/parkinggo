// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services','ngCordova','firebase'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/sidemenu.html',
    controller: 'MenuCtrl'
  })

  // Each tab has its own nav history stack:

  .state('app.dash', {
    url: '/dash',
    views: {
      'menuContent': {
        templateUrl: 'templates/tab-dash.html',
        controller: 'DashCtrl'
      }
    }
  })
  .state('app.iwantpay', {
    url: '/iwantpay',
    views: {
      'menuContent': {
        templateUrl: 'templates/tab-iwantpay.html',
        controller: 'IPayCtrl'
      }
    }
  })
  .state('app.payment', {
      url: '/payment',
      views: {
        'menuContent': {
          templateUrl: 'templates/payment.html',
          controller: 'PaymentCtrl'
        }
      }
    })
  .state('app.chats', {
      url: '/chats',
      views: {
        'menuContent': {
          templateUrl: 'templates/tab-chats.html',
          controller: 'ChatsCtrl'
        }
      }
    })
    .state('app.chat-detail', {
      url: '/chats/:chatId',
      views: {
        'menuContent': {
          templateUrl: 'templates/chat-detail.html',
          controller: 'ChatDetailCtrl'
        }
      }
    })

  .state('app.account', {
    url: '/account',
    views: {
      'menuContent': {
        templateUrl: 'templates/tab-account.html',
        controller: 'AccountCtrl'
      }
    }
  })

  .state('app.map', {
    url: '/map',
    views: {
      'menuContent': {
        templateUrl: 'templates/tab-map.html',
        controller: 'mapCtrl'
      }
    }
  })
  .state('app.readytopay', {
    url: '/readytopay',
    views: {
      'menuContent': {
        templateUrl: 'templates/readytopay.html',
        controller: 'ReadytopayCtrl'
      }
    }
  })
  .state('app.promo',{
    url: '/promo',
    views: {
      'menuContent': {
        templateUrl: 'templates/tab-promo.html',
        controller: 'promoCtrl'
      }
    }
   })
  .state('app.promodetail',{
    url: '/promodetail/:promonum',
    views: {
      'menuContent': {
        templateUrl: 'templates/tab-promo-detail.html',
        controller: 'promodetailCtrl'
      }
    }
   })
  .state('app.condition',{
    url: '/condition',
    views: {
      'menuContent': {
        templateUrl: 'templates/tab-condition.html',
        controller: 'conditionCtrl'
      }
    }
   })
  .state('app.histories', {
            url: '/histories',
            views: {
                'menuContent': {
                    templateUrl: 'templates/tab-histories.html',
                    controller: 'historiesCtrl'
                }
            }
        })
        .state('app.detail', {
            url: '/detail/:hid',
            views: {
                'menuContent': {
                    templateUrl: 'templates/tab-histories-detail.html',
                    controller: 'detailCtrl'
                }
            }
        })
        .state('app.login', {
            url: '/login',
            views: {
                'menuContent': {
                    templateUrl: 'templates/login.html',
                    controller: 'LoginCtrl'
                }
            }
        });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/login');

});
