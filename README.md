#  ember-cli-poll

This is an npm package that contains a polling serivce for ember-data
packaged as an [Ember CLI](https://github.com/stefanpenner/ember-cli) Addon.

## Installation

**Ember Poll requires at least Ember CLI 0.0.44.**

To install simply run

```
ember install ember-cli-poll
```

in your Ember CLI project's root.

If you're using Ember CLI 0.2.2 or older, run

```
ember install:addon ember-cli-poll
```

If you're using Ember CLI 0.1.4 or older, run

```
npm install --save-dev ember-cli-poll
ember generate ember-cli-poll
```

## Usage

In your route set the poll key to inject the service.

```javascript
var ExampleRoute = Ember.Route.extend({
  poll: Ember.inject.service(),
  ...
});
```

Then you can setup polling for a record in the afterModel hook.

```javascript
var ExampleRoute = Ember.Route.extend({
  ...
  afterModel: function (model, transition) {
    this.get('poll').setup(this, model.example_record);
  },
  ...
});
```

