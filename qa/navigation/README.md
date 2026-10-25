# Navigation regression tests

This private package has no dependencies. Use Node.js 22 or newer (recommended); Node.js 18 or newer supports the built-in test runner used here. The `test:unit` script runs `node --test navigation.test.js`.

From `qa/navigation/`, run:

```sh
rushx test:unit
```

Conveyor command: `qa/navigation: rushx test:unit`.

This requires `rushx` to be available in the validation environment. No repository-wide Rush configuration or dependency installation is needed by these tests. The equivalent direct command from this directory is:

```sh
node --test navigation.test.js
```

The suite imports the production navigation helpers and checks literal expected folder/file URLs and complete breadcrumb objects. It covers ASCII compatibility, nested reserved characters, Unicode, trailing separators, root/history navigation, readable labels and non-clickable final breadcrumbs. Input segments are literal filenames: `x%20y` targets `x%2520y`, distinct from `x y` targeting `x%20y`. These are helper regressions; browser navigation requires separate verification.
