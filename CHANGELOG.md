# Change Log
All user visible changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/), as described
for Rust libraries in [RFC #1105](https://github.com/rust-lang/rfcs/blob/master/text/1105-api-evolution.md)

## Unreleased

### Changed

* `setup` now takes an object with the properties `name`, `resource_name`, `url` and `params`
  instead of the three params `resource_name`, `url` and `params`.
  For example;
  ```javascript
  this.get('poll').setup('contacts', 'http://some_domain.com/contacts/${contact_id}');
  ```
  becomes;
  ```javascript
  this.get('poll').setup({
    name: 'contactsPoll',
    resource_name: 'contacts',
    url: 'http://some_domain.com/contacts/${contact_id}'
  });
  ```
