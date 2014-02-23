# Change History

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
