const parseAnimationShorthand = require("./lib/animationShorthand");

const HASH_PREFIX = "<hash>";
const GLOBAL_REGEXP = /^global\((.+)\)$/;
const PROCESSED = Symbol("processed");

const plugin = ({
  prefix = HASH_PREFIX,
  generateHashedPrefix = plugin.generateHashedPrefix,
}) => {
  const isHashPrefix = prefix === HASH_PREFIX;
  let resolvedPrefix = prefix;
  return {
    postcssPlugin: "postcss-local-keyframes",

    Once: (root) => {
      if (isHashPrefix) {
        resolvedPrefix = generateHashedPrefix(
          root.source.input.from,
          root.source.input.css
        );
      }
    },

    AtRule: {
      keyframes: (atRule) => {
        if (atRule[PROCESSED]) return;
        if (atRule.params) {
          if (plugin.isGlobalName(atRule.params)) {
            atRule.params = plugin.cleanGlobalName(atRule.params);
          } else if (!atRule.params.startsWith(resolvedPrefix)) {
            atRule.params = `${resolvedPrefix}${atRule.params}`;
          }
        }
        atRule[PROCESSED] = true;
      },
    },

    Declaration: {
      ["animation-name"]: (decl) => {
        if (decl[PROCESSED]) return;
        if (plugin.isGlobalName(decl.value)) {
          decl.value = plugin.cleanGlobalName(decl.value);
        } else if (!decl.value.startsWith(resolvedPrefix)) {
          decl.value = `${resolvedPrefix}${decl.value}`;
        }
        decl[PROCESSED] = true;
      },

      animation: (decl, { result }) => {
        if (decl[PROCESSED]) return;
        const parsed = parseAnimationShorthand(decl.value);
        if (parsed.name) {
          if (plugin.isGlobalName(parsed.name)) {
            decl.value = decl.value.replace(
              parsed.name,
              plugin.cleanGlobalName(parsed.name)
            );
          } else if (!parsed.name.startsWith(resolvedPrefix)) {
            decl.value = decl.value.replace(
              parsed.name,
              `${resolvedPrefix}${parsed.name}`
            );
          }
        } else {
          decl.warn(result, `Can't get animation name from shorthand property`);
        }
        decl[PROCESSED] = true;
      },
    },
  };
};

plugin.generateHashedPrefix = function (filename, css) {
  return `_${plugin.hash(`${filename} - ${css}`).slice(-5)}_`;
};

// from: https://gist.github.com/jlevy/c246006675becc446360a798e2b2d781?permalink_comment_id=4738050#gistcomment-4738050
plugin.hash = function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return (hash >>> 0).toString(36);
};

plugin.isGlobalName = function (name) {
  return GLOBAL_REGEXP.test(name);
};

plugin.cleanGlobalName = function (name) {
  return name.replace(GLOBAL_REGEXP, "$1");
};

module.exports = plugin;

module.exports.postcss = true;
