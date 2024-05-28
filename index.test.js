const postcss = require("postcss");

const plugin = require("./");

const FROM_PATH = "/home/user/test.css";

async function expectOutput(input, output, opts = {}, warnLength = 0) {
  let result = await postcss([plugin(opts)]).process(input, {
    from: FROM_PATH,
  });
  expect(result.css).toEqual(output);
  expect(result.warnings()).toHaveLength(warnLength);
}

it("uses global names by default", async () => {
  const input = `
  @keyframes loader {
    0% {
      transform: scale(0);
    }
    40% {
      transform: scale(1.0);
    }
  }
  .animation {
    animation: loader 1.2s 500ms infinite ease-in-out both;
  }
  .animation-2 {
    animation: 1.2s infinite ease-in-out both loader;
  }
  .animation-3 {
    animation: 1.2s infinite loader ease-in-out both;
  }
  .animation-4 {
    animation-name: loader;
  }
  `;
  const output = input;
  await expectOutput(input, output, {});
  await expectOutput(input, output, { defaultScope: "global" });
});

it("uses a hashed prefix when configured as local by default", async () => {
  const input = `
  @keyframes loader {
    0% {
      transform: scale(0);
    }
    40% {
      transform: scale(1.0);
    }
  }
  .animation {
    animation: loader 1.2s 500ms infinite ease-in-out both;
  }
  .animation-2 {
    animation: 1.2s infinite ease-in-out both loader;
  }
  .animation-3 {
    animation: 1.2s infinite loader ease-in-out both;
  }
  .animation-4 {
    animation-name: loader;
  }
  `;
  const hashedPrefix = plugin.generateHashedPrefix(FROM_PATH, input);
  const output = `
  @keyframes ${hashedPrefix}loader {
    0% {
      transform: scale(0);
    }
    40% {
      transform: scale(1.0);
    }
  }
  .animation {
    animation: ${hashedPrefix}loader 1.2s 500ms infinite ease-in-out both;
  }
  .animation-2 {
    animation: 1.2s infinite ease-in-out both ${hashedPrefix}loader;
  }
  .animation-3 {
    animation: 1.2s infinite ${hashedPrefix}loader ease-in-out both;
  }
  .animation-4 {
    animation-name: ${hashedPrefix}loader;
  }
  `;
  await expectOutput(input, output, { defaultScope: "local" }); // hashed by default
  await expectOutput(input, output, {
    defaultScope: "local",
    prefix: "<hash>",
  });
});

it("respects local prefixes when global by default", async () => {
  const input = `
  @keyframes loader {
    0% {
      transform: scale(0);
    }
    40% {
      transform: scale(1.0);
    }
  }
  @keyframes local--bounce {
    0% {
      transform: scale(0);
    }
    40% {
      transform: scale(1.0);
    }
  }
  .animation {
    animation: loader 1.2s 500ms infinite ease-in-out both;
  }
  .animation-2 {
    animation: 1.2s infinite ease-in-out both local--bounce;
  }
  .animation-3 {
    animation: 1.2s infinite loader ease-in-out both;
  }
  .animation-4 {
    animation-name: local--bounce;
  }
  `;
  const hashedPrefix = plugin.generateHashedPrefix(FROM_PATH, input);
  const output = `
  @keyframes loader {
    0% {
      transform: scale(0);
    }
    40% {
      transform: scale(1.0);
    }
  }
  @keyframes ${hashedPrefix}bounce {
    0% {
      transform: scale(0);
    }
    40% {
      transform: scale(1.0);
    }
  }
  .animation {
    animation: loader 1.2s 500ms infinite ease-in-out both;
  }
  .animation-2 {
    animation: 1.2s infinite ease-in-out both ${hashedPrefix}bounce;
  }
  .animation-3 {
    animation: 1.2s infinite loader ease-in-out both;
  }
  .animation-4 {
    animation-name: ${hashedPrefix}bounce;
  }
  `;
  await expectOutput(input, output, {}); // hashed by default
  await expectOutput(input, output, { prefix: "<hash>" });
  await expectOutput(input, output, { defaultScope: "global" }); // hashed by default
  await expectOutput(input, output, {
    defaultScope: "global",
    prefix: "<hash>",
  });
});

it("respects global prefixes when local by default", async () => {
  const input = `
  @keyframes loader {
    0% {
      transform: scale(0);
    }
    40% {
      transform: scale(1.0);
    }
  }
  @keyframes global--bounce {
    0% {
      transform: scale(0);
    }
    40% {
      transform: scale(1.0);
    }
  }
  .animation {
    animation: loader 1.2s 500ms infinite ease-in-out both;
  }
  .animation-2 {
    animation: 1.2s infinite ease-in-out both global--bounce;
  }
  .animation-3 {
    animation: 1.2s infinite loader ease-in-out both;
  }
  .animation-4 {
    animation-name: global--bounce;
  }
  `;
  const hashedPrefix = plugin.generateHashedPrefix(FROM_PATH, input);
  const output = `
  @keyframes ${hashedPrefix}loader {
    0% {
      transform: scale(0);
    }
    40% {
      transform: scale(1.0);
    }
  }
  @keyframes bounce {
    0% {
      transform: scale(0);
    }
    40% {
      transform: scale(1.0);
    }
  }
  .animation {
    animation: ${hashedPrefix}loader 1.2s 500ms infinite ease-in-out both;
  }
  .animation-2 {
    animation: 1.2s infinite ease-in-out both bounce;
  }
  .animation-3 {
    animation: 1.2s infinite ${hashedPrefix}loader ease-in-out both;
  }
  .animation-4 {
    animation-name: bounce;
  }
  `;
  await expectOutput(input, output, { defaultScope: "local" }); // hashed by default
  await expectOutput(input, output, {
    defaultScope: "local",
    prefix: "<hash>",
  });
});

it("uses a custom hashed prefix", async () => {
  function generateHashedPrefix(filename, css) {
    return `${plugin.hash(filename)}-${plugin.hash(css)}-custom-`.trim();
  }

  const input = `
  @keyframes local--loader {
    0% {
      transform: scale(0);
    }
    40% {
      transform: scale(1.0);
    }
  }
  .animation {
    animation: local--loader 1.2s 500ms infinite ease-in-out both;
  }
  .animation-2 {
    animation: 1.2s infinite ease-in-out both local--loader;
  }
  .animation-3 {
    animation: 1.2s infinite local--loader ease-in-out both;
  }
  .animation-4 {
    animation-name: local--loader;
  }
  `;
  const hashedPrefix = generateHashedPrefix(FROM_PATH, input);
  expect(hashedPrefix).toContain("custom");
  const output = `
  @keyframes ${hashedPrefix}loader {
    0% {
      transform: scale(0);
    }
    40% {
      transform: scale(1.0);
    }
  }
  .animation {
    animation: ${hashedPrefix}loader 1.2s 500ms infinite ease-in-out both;
  }
  .animation-2 {
    animation: 1.2s infinite ease-in-out both ${hashedPrefix}loader;
  }
  .animation-3 {
    animation: 1.2s infinite ${hashedPrefix}loader ease-in-out both;
  }
  .animation-4 {
    animation-name: ${hashedPrefix}loader;
  }
  `;
  await expectOutput(input, output, { generateHashedPrefix }); // hashed by default
  await expectOutput(input, output, { prefix: "<hash>", generateHashedPrefix });
});

it("uses a fixed prefix", async () => {
  const input = `
  @keyframes local--loader {
    0% {
      transform: scale(0);
    }
    40% {
      transform: scale(1.0);
    }
  }
  .animation {
    animation: local--loader 1.2s 500ms infinite ease-in-out both;
  }
  .animation-2 {
    animation: 1.2s infinite ease-in-out both local--loader;
  }
  .animation-3 {
    animation: 1.2s infinite local--loader ease-in-out both;
  }
  .animation-4 {
    animation-name: local--loader;
  }
  `;
  const output = `
  @keyframes prefixed-loader {
    0% {
      transform: scale(0);
    }
    40% {
      transform: scale(1.0);
    }
  }
  .animation {
    animation: prefixed-loader 1.2s 500ms infinite ease-in-out both;
  }
  .animation-2 {
    animation: 1.2s infinite ease-in-out both prefixed-loader;
  }
  .animation-3 {
    animation: 1.2s infinite prefixed-loader ease-in-out both;
  }
  .animation-4 {
    animation-name: prefixed-loader;
  }
  `;
  await expectOutput(input, output, { prefix: "prefixed-" });
});

it("fails with wrong shorthand property", async () => {
  const input = `
  .animation {
    animation: 100ms;
  }
  `;
  await expectOutput(input, input, {}, 1);
});

it("respects custom local prefixes when global by default", async () => {
  const CUSTOM_REGEXP = "^_make_this_local_(?<match>.+)_pls$";
  const input = `
  @keyframes loader {
    0% {
      transform: scale(0);
    }
    40% {
      transform: scale(1.0);
    }
  }
  @keyframes _make_this_local_bounce_pls {
    0% {
      transform: scale(0);
    }
    40% {
      transform: scale(1.0);
    }
  }
  .animation {
    animation: loader 1.2s 500ms infinite ease-in-out both;
  }
  .animation-2 {
    animation: 1.2s infinite ease-in-out both _make_this_local_bounce_pls;
  }
  .animation-3 {
    animation: 1.2s infinite loader ease-in-out both;
  }
  .animation-4 {
    animation-name: _make_this_local_bounce_pls;
  }
  `;
  const hashedPrefix = plugin.generateHashedPrefix(FROM_PATH, input);
  const output = `
  @keyframes loader {
    0% {
      transform: scale(0);
    }
    40% {
      transform: scale(1.0);
    }
  }
  @keyframes ${hashedPrefix}bounce {
    0% {
      transform: scale(0);
    }
    40% {
      transform: scale(1.0);
    }
  }
  .animation {
    animation: loader 1.2s 500ms infinite ease-in-out both;
  }
  .animation-2 {
    animation: 1.2s infinite ease-in-out both ${hashedPrefix}bounce;
  }
  .animation-3 {
    animation: 1.2s infinite loader ease-in-out both;
  }
  .animation-4 {
    animation-name: ${hashedPrefix}bounce;
  }
  `;
  await expectOutput(input, output, { localRegExp: CUSTOM_REGEXP }); // hashed by default
  await expectOutput(input, output, {
    localRegExp: CUSTOM_REGEXP,
    prefix: "<hash>",
  });
  await expectOutput(input, output, {
    localRegExp: CUSTOM_REGEXP,
    defaultScope: "global",
  }); // hashed by default
  await expectOutput(input, output, {
    localRegExp: CUSTOM_REGEXP,
    defaultScope: "global",
    prefix: "<hash>",
  });
});

it("respects custom global prefixes when local by default", async () => {
  const CUSTOM_REGEXP =
    "^I-want-THIS-(?<match>.+)_animation_to-BE-GLOBAL_okay$";
  const input = `
  @keyframes loader {
    0% {
      transform: scale(0);
    }
    40% {
      transform: scale(1.0);
    }
  }
  @keyframes I-want-THIS-bounce_animation_to-BE-GLOBAL_okay {
    0% {
      transform: scale(0);
    }
    40% {
      transform: scale(1.0);
    }
  }
  .animation {
    animation: loader 1.2s 500ms infinite ease-in-out both;
  }
  .animation-2 {
    animation: 1.2s infinite ease-in-out both I-want-THIS-bounce_animation_to-BE-GLOBAL_okay;
  }
  .animation-3 {
    animation: 1.2s infinite loader ease-in-out both;
  }
  .animation-4 {
    animation-name: I-want-THIS-bounce_animation_to-BE-GLOBAL_okay;
  }
  `;
  const hashedPrefix = plugin.generateHashedPrefix(FROM_PATH, input);
  const output = `
  @keyframes ${hashedPrefix}loader {
    0% {
      transform: scale(0);
    }
    40% {
      transform: scale(1.0);
    }
  }
  @keyframes bounce {
    0% {
      transform: scale(0);
    }
    40% {
      transform: scale(1.0);
    }
  }
  .animation {
    animation: ${hashedPrefix}loader 1.2s 500ms infinite ease-in-out both;
  }
  .animation-2 {
    animation: 1.2s infinite ease-in-out both bounce;
  }
  .animation-3 {
    animation: 1.2s infinite ${hashedPrefix}loader ease-in-out both;
  }
  .animation-4 {
    animation-name: bounce;
  }
  `;
  await expectOutput(input, output, {
    globalRegExp: CUSTOM_REGEXP,
    defaultScope: "local",
  }); // hashed by default
  await expectOutput(input, output, {
    globalRegExp: CUSTOM_REGEXP,
    defaultScope: "local",
    prefix: "<hash>",
  });
});
