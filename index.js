const parseAnimationShorthand = require("./lib/animationShorthand");

const HASH_PREFIX = "<hash>";

const plugin = ({
  prefix = HASH_PREFIX,
  generateHashedPrefix = plugin.generateHashedPrefix,
}) => {
  const isHashPrefix = prefix === HASH_PREFIX;
  let resolvedPrefix = prefix;
  return {
    postcssPlugin: "postcss-local-keyframe",

    Once: (root) => {
      if (isHashPrefix)
        resolvedPrefix = generateHashedPrefix(
          root.source.input.from,
          root.source.input.css
        );
    },

    AtRule: {
      keyframes: (atRule) => {
        if (!atRule.params.startsWith(resolvedPrefix)) {
          atRule.params = `${resolvedPrefix}${atRule.params}`;
        }
      },
    },

    Declaration: {
      ["animation-name"]: (decl) => {
        if (!decl.value.startsWith(resolvedPrefix)) {
          decl.value = `${resolvedPrefix}${decl.value}`;
        }
      },

      animation: (decl, { result }) => {
        const parsed = parseAnimationShorthand(decl.value);
        if (parsed.name) {
          if (!parsed.name.startsWith(resolvedPrefix)) {
            decl.value = decl.value.replace(
              parsed.name,
              `${resolvedPrefix}${parsed.name}`
            );
          }
        } else {
          decl.warn(result, `Can't get animation name from shorthand property`);
        }
      },
    },
  };
};

plugin.generateHashedPrefix = function (filename, css) {
  return `_${plugin.hash(`${filename} - ${css}`)}_`;
};

// from: https://gist.github.com/jlevy/c246006675becc446360a798e2b2d781?permalink_comment_id=4738050#gistcomment-4738050
plugin.hash = function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return (hash >>> 0).toString(36).slice(-5);
};

module.exports = plugin;

module.exports.postcss = true;
