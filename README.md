# PostCSS Local Keyframes

[PostCSS](https://github.com/postcss/postcss) plugin that makes `@keyframes` animations local by prefixing their names.

```sh
npm i postcss-local-keyframes
```

## Example

### Input

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
    require("postcss-local-keyframes")({ prefix: "my-prefix" }),
    require("autoprefixer"),
  ],
};
```

## Options

### prefix

`string`

A fixed prefix that will be prepended to `@keyframes` animation names. If omitted, a hashed prefix specific to each CSS file will be used.

### generateHashedPrefix

`(filename: string, css: string) => string`

A function that generates a hashed prefix specific to each CSS file. The default implementation is declared in the [`index.js`](./index.js) file (`plugin.generateHashedPrefix`).
