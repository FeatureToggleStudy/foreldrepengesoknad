module.exports = {
    transform: {
        '^.+\\.jsx?$': 'babel-jest',
        '^.+\\.tsx?$': 'ts-jest'
    },
    setupTestFrameworkScriptFile: './jest/setup.ts',
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$',
    moduleNameMapper: {
        '\\.(css|jpg|png|svg|less)$': '<rootDir>/node_modules/jest-css-modules',
        '^uttaksplan/(.*)': '<rootDir>/src/uttaksplan/$1',
        '^common/(.*)': '<rootDir>/src/common/$1',
        '^app/(.*)': '<rootDir>/src/app/$1',
        '^shared/(.*)': '<rootDir>/src/shared/$1'
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    globals: {
        'ts-jest': {
            tsConfigFile: './tsconfig.json',
            useBabelrc: true
        }
    },
    rootDir: '../',
    coverageReporters: ['text-summary'],
    modulePathIgnorePatterns: ['akseptansetest']
};
