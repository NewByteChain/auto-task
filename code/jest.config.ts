module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testPathIgnorePatterns: ['/node_modules/', '/dist/'], // 忽略这些目录
    transform: {
        '^.+\\.js$': 'babel-jest',
    },
};
  