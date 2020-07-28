module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/examples/', '/lib/'],
  coveragePathIgnorePatterns: ['/src/__tests__/'],
};
