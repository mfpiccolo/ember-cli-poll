#  ember-cli-poll

This is an npm package that contains a polling serivce for ember-data
packaged as an [Ember CLI](https://github.com/stefanpenner/ember-cli) Addon.

## Installation

To install simply run

```
ember install ember-cli-poll
```

in your Ember CLI project's root.


## Usage

In your route start up the polling service.

```javascript
import Ember from 'ember';

var ApplicationRoute = Ember.Route.extend({
  poll: Ember.inject.service(),
  afterModel: function () {
    this._super(...arguments);
    this.get('poll').start({
      idle_timeout: 10000,
      interval: 2000,
    });
  }
});

export default ApplicationRoute;
```

Then from a route, you can setup polling for a resource in the afterModel hook and remove
it in a will transition

```javascript


var ExampleRoute = Ember.Route.extend({
  poll: Ember.inject.service(),
  ...
  afterModel: function (model, transition) {
    this.get('poll').setup(
      'contacts', // a resource name
      `http://some_domain.com/contacts/${contact_id}` // url to fetch resource
    );
  },
  actions: {
    willTransition: function (transition) {
      this._super(transition);
      this.get('poll').removePoll('contacts'); // remove the resource from polling
    },
  }
  ...
});
```

Or you can use it with a component using the lifecycle hooks.

```javascript
var SomeComponent = Ember.component.extend({
  poll: Ember.inject.service(),
  didInsertElement: function () {
    this._super();
    var query_params = {
      some_param: 'some_value',
      other_param: 'other_value'
    };
    this.get('poll').setup(
      'users', // resource name
      `http://some_domain.com/users`, // url to fetch resource
      query_params // query params
    );
  },
  willDestroy: function () {
    this._super();
    this.get('poll').removePoll('users'); // remove resource from polling
  }
});

export default SomeComponent;
```

