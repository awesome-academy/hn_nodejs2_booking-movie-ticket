module.exports = {
  roots: ['<rootDir>/test'],
  transform: { '^.+\\.tsx?$': 'ts-jest' },
  testRegex: '(/__test__/.*|(\\.|/)(test|spec))\\.[jt]sx?$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  verbose: true,
  collectCoverage: true,
  collectCoverageFrom: ['<rootDir>/src/services/**/*.ts'],
  preset: 'ts-jest',
  testEnvironment: 'node',
};
