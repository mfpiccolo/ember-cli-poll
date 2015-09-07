import Ember from 'ember';

var Poll = Ember.Service.extend({
  storage: Ember.inject.service('store'),
  setup: function (resource_name, path, params) {
    var self = this;
    self.set('polls', self.get('polls') || {});
    var polls = self.get('polls');
    polls[resource_name] = {path: path, params: params};

    if (typeof(Ember.$.idle) !== "function") {
      self.setIdleListener();
    }

    Ember.$(document).idle({
      onIdle: function(){
        self.removePoll(resource_name);
      },
      onActive: function(){
        self.setup(resource_name, path, params);
      },
      idle: 30000,
    });
  },
  run: function () {
    var self = this;
    var polls = this.get('polls');
    var store = self.get('storage');
    if (Object.keys(polls).length) {
      Object.keys(polls).forEach(function (resource_name) {
        var path = polls[resource_name]['path'];
        var params = polls[resource_name]['params'];

        Ember.$.getJSON(path + params, function( data ) {
          store.pushPayload('activity_group', data);
        });
      });
    }
  },
  removePoll: function (resource_name) {
    var polls = this.get('polls');
    delete polls[resource_name];
  },
  setIdleListener: function () {
    Ember.$.fn.idle = function (options) {

      var defaults = {
          idle: 60000, //idle time in ms
          events: 'mousemove keypress mousedown touchstart', //events that will trigger the idle resetter
          onIdle: function () {}, //callback function to be executed after idle time
          onActive: function () {}, //callback function to be executed after back from idleness
          onHide: function () {}, //callback function to be executed when window is hidden
          onShow: function () {}, //callback function to be executed when window is visible
          keepTracking: false //if you want to keep tracking user even after the first time, set this to true
        },
        idle = false,
        visible = true,
        settings = Ember.$.extend({}, defaults, options),
        resetTimeout,
        timeout;

      resetTimeout = function (id, settings) {
        if (idle) {
          settings.onActive.call();
          idle = false;
        }
        (settings.keepTracking ? clearInterval : clearTimeout)(id);

        return timeout(settings);
      };

      timeout = function (settings) {
        var timer = (settings.keepTracking ? setInterval : setTimeout),
          id;

        id = timer(function () {
          idle = true;
          settings.onIdle.call();
        }, settings.idle);
        return id;
      };

      return this.each(function () {
        var id = timeout(settings);
        Ember.$(this).on(settings.events, function (e) {
          id = resetTimeout(id, settings);
        });
        if (options.onShow || options.onHide) {
          Ember.$(document).on("visibilitychange webkitvisibilitychange mozvisibilitychange msvisibilitychange", function () {
            if (document.hidden || document.webkitHidden || document.mozHidden || document.msHidden) {
              if (visible) {
                visible = false;
                settings.onHide.call();
              }
            } else {
              if (!visible) {
                visible = true;
                settings.onShow.call();
              }
            }
          });
        }
      });

    };
  },
});

export default Poll;
