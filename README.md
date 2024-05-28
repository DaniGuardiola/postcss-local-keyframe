# PostCSS Local Keyframes

[PostCSS](https://github.com/postcss/postcss) plugin that makes `@keyframes` animations local by prefixing their names.

```sh
npm i postcss-local-keyframes
```

## Example

### Input

```css
@keyframes local--loader {
  0% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

.animation {
  animation: local--loader 1.2s 500ms infinite ease-in-out both;
}

.animation-2 {
  animation-name: local--loader;
}
```

### Output

```css
@keyframes _ihg3y_loader {
  0% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

.animation {
  animation: _ihg3y_loader 1.2s 500ms infinite ease-in-out both;
}

.animation-2 {
  animation-name: _ihg3y_loader;
}
```

## Usage

Add the plugin to your PostCSS configuration. If you are using autoprefixer, this plugin must be placed before it.

```js
// postcss.config.js
module.exports = {
  plugins: [require("postcss-local-keyframes"), require("autoprefixer")],
};
```

You can also pass options to the plugin.

```js
// postcss.config.js
module.exports = {
  plugins: [
    require("postcss-local-keyframes")({ prefix: "my-prefix-" }),
    require("autoprefixer"),
  ],
};
```

Once the plugin is set up, you can use the `local--` prefix to make `@keyframes` animations local. Any other animations will be left untouched.

### Important notes

Animation names must be made local everywhere for the plugin to work properly: both in the animation definition (e.g. `@keyframes local--my-animation`) and in usages (e.g. `animation-name: local--my-animation;`).

Local animations only work within the same CSS file. You can't use a local animation from a different file.

## Options

### defaultScope

`"global" | "local"` - default: `"global"`

The default scope for `@keyframes` animations. If set to `"global"`, animations will be global by default. If set to `"local"`, animations will be local by default.

In both cases, you can override specific animation scopes by using the `local--<name>` or `global--<name>` syntax (see below).

### prefix

`"<hash>" | string` - default: `"<hash>"`

A fixed prefix that will be prepended to local `@keyframes` animation names. If omitted, a hashed prefix specific to each CSS file will be used.

### generateHashedPrefix

`(filename: string, css: string) => string` - default: `plugin.generateHashedPrefix`

A function that generates a hashed prefix specific to each CSS file. The default implementation is declared in the [`index.js`](./index.js) file (`plugin.generateHashedPrefix`), and it depends exclusively on the full content of the CSS file being processed.

If you want to re-use the built-in hash function (unsafe but simple and fast) in your custom hashed prefix generator, you can access it through the `hash` method in the plugin object:

```js
const localKeyframesPlugin = require("postcss-local-keyframes");

module.exports = {
  plugins: [
    localKeyframesPlugin({
      generateHashedPrefix: (filename, css) =>
        `${localKeyframesPlugin.hash(css)}-custom-`,
    }),
    require("autoprefixer"),
  ],
};
```

### globalRegExp

`string` - default: `^global--(.+)$`

A regular expression that matches global animation names. If an animation name matches this pattern, it will be considered global regardless of the `defaultScope` option. The pattern must contain a single capturing group that matches the animation name.

### localRegExp

`string` - default: `^local--(.+)$`

A regular expression that matches local animation names. If an animation name matches this pattern, it will be considered local regardless of the `defaultScope` option. The pattern must contain a single capturing group that matches the animation name.

## Global and local animations

By default, all animations are in the global scope, which means that they won't be prefixed and will be available globally with their original names. You can change the default by setting the `defaultScope` option to `"local"`.

If you want a specific animation to be global or local regardless of the default setting, you can use the `global--<name>` or `local--<name>` naming pattern.

For example, if `defaultScope` is set to `"local"`, you can make a specific animation global by using the `global--` prefix:

```css
@keyframes global--loader {
  0% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

.animation {
  animation: global--loader 1.2s 500ms infinite ease-in-out both;
}

.animation-2 {
  animation-name: global--loader;
}
```

The output will be:

```css
@keyframes loader {
  0% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

.animation {
  animation: loader 1.2s 500ms infinite ease-in-out both;
}

.animation-2 {
  animation-name: loader;
}
```

Similarly, if `defaultScope` is set to `"global"`, you can make a specific animation local by using the `local--` prefix:

```css
@keyframes local--loader {
  0% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

.animation {
  animation: local--loader 1.2s 500ms infinite ease-in-out both;
}

.animation-2 {
  animation-name: local--loader;
}
```

The output will be:

```css
@keyframes _ihg3y_loader {
  0% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

.animation {
  animation: _ihg3y_loader 1.2s 500ms infinite ease-in-out both;
}

.animation-2 {
  animation-name: _ihg3y_loader;
}
```

The syntax for global and local animations can be customized with the `globalRegExp` and `localRegExp` options.

## Acknowledgments

This plugin was forked from [postcss-prefix-keyframe](https://github.com/VitaliyR/postcss-prefix-keyframe) by [VitaliyR](https://github.com/VitaliyR).
