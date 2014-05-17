# Change History

## 2.0.5 (2014-05-17)

* Updated NPM dependencies.

## 2.0.4 (2014-05-16)

* Use `~` instead of `^` in `package.json` for installing with old versions of `npm`.

## 2.0.3 (2014-04-16)

* Fixed issue in package.json.

## 2.0.2 (2014-04-14)

* Upgraded `typedef` dependency that fixes issue with anonymous functions.

## 2.0.1 (2014-04-13)

* Added `IoCBinding` class to the `exports` object.

## 2.0.0 (2014-04-13)

* API change for registering (building pattern style). See README file.
* Dependencies can now be registered as weak (can be overridden) or strong.
* Container no longer registers itself as a dependency.
* Removal of `call()` and `registerInjects()` (for now).

## 1.3.0 (2014-02-22)

* Can now use `registerInjects()` to have certain properties set immediately
  after creation via any factory method on a per-class basis.

## 1.2.2 (2014-02-03)

* Documentation improvements.

## 1.2.1 (2014-01-23)

* Allow `make()` to defer to `call()` when used with two parameters.
* JSDoc cleanup.

## 1.2.0 (2014-01-23)

* Added member function `call()` to call a function within a certain context,
  resolving all named parameters as dependencies.

## 1.1.0 (2014-01-20)

* Container self-registers with tag `"container"` instead of `"resolver"`
* Added member function `factory(T)` to create by constructor reference.
* Added explicit registration functions:
    * `registerInstance()`,
    * `registerConstructor()`
    * `registerClosure()`
    * `registerFactory()`
* Added additional explicit creation functions:
    * `factory()`
    * `build()`
* Original API (`make()` and `register()`) will attempt to correctly
  guess/determine which of the explicit flavors of function to use.

## 1.0.0 (2014-01-19)

* First release
