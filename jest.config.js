module.exports = {
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/(*-test).(ts|tsx|js)"],
  transform: {
    "^.+\\.jsx?$": "babel-jest",
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
};
