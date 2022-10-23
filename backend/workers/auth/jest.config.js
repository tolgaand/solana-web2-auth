module.exports = {
  testEnvironment: "miniflare",
  testMatch: ["**/test/**/*.+(ts|tsx)", "**/src/**/(*.)+(spec|test).+(ts|tsx)"],
  transform: {
    "^.+\\.(ts|tsx)$": "esbuild-jest",
  },
  moduleNameMapper: {
    // Force module uuid to resolve with the CJS entry point, because Jest does not support package.json.exports. See https://github.com/uuidjs/uuid/issues/451
    uuid: require.resolve("uuid"),
  },
};
