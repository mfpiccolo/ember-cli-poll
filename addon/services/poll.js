import Ember from 'ember';

var Poll = Ember.Service.extend({
  setup: function (route, record, interval_info) {
    route.set('stop_poll', false);
    if (typeof(Ember.$.idle) !== "function") {
      this.setIdleListener();
    }

    if (!interval_info) {
      interval_info = Ember.Object.create({
        repititions_per_iteration: 5,
        muliplier: 2,
        idle_time: 60000,
        current_interval_delay: 1000,
        current_run_count: 0,
      });
    }

    route.set('interval_info', interval_info);

    var reset = () => {
      route.set('interval_info.current_run_count', 1);
      route.set('interval_info.current_interval_delay', 1000);
      Ember.run.cancel(route.get('current_poll'));
      this.run(record, route);
    };

    Ember.$(document).idle({
      onIdle: function(){
        route.set('stop_poll', true);
      },
      onActive: function(){
        route.set('stop_poll', false);
        Ember.run.throttle(this, reset, 1000);
      },
      idle: interval_info.idle_time || 10000
    });

    this.run(record, route);
  },
  reloadable: function (record) {
    return (
        record.get('isLoaded')  &&
      ! record.get('isDirty')   &&
      ! record.get('isSaving')  &&
      ! record.get('isDeleted') &&
      ! record.get('isError')   &&
      ! record.get('isNew')     &&
        record.get('isValid')
    );
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
  run: function (record, route) {
    if (!route.get('stop_poll')) {
      var interval_info = route.get('interval_info');
      var current_run_count = interval_info.current_run_count % (interval_info.repititions_per_iteration + 1);
      var current_interval_delay = interval_info.current_interval_delay;
      var model_name = record.constructor.modelName;

      var current_model = route.modelFor(route.routeName)[model_name];
      var id = current_model.id;
      if (this.reloadable(record) && id === record.id) {
        if (current_run_count >= interval_info.repititions_per_iteration) {
          current_interval_delay = interval_info.current_interval_delay * interval_info.muliplier;
          route.set('interval_info.current_interval_delay', current_interval_delay);
          route.set('interval_info.current_run_count', 1);
        }

        route.set('interval_info.current_run_count', current_run_count + 1);

        var poll = Ember.run.later(() => {
          record.reload();
          this.rerun(record, route);
        }, current_interval_delay);

        this.set('current_poll', poll);
      }
    }
  },
  rerun: function (record, route) {
    this.run(record, route);
  }
});

export default Poll;
