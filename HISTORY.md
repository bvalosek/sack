# Change History

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
