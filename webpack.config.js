const path = require('path');
const webpack = require('webpack');
const GitRevisionPlugin = require('git-revision-webpack-plugin');
const runGitCommand = require('git-revision-webpack-plugin/lib//helpers/run-git-command.js')
const CopyPlugin = require('copy-webpack-plugin');

GitRevisionPlugin.prototype.commitdate = function () {
    return runGitCommand(
        this.gitWorkTree,
        "log -1 --format='%ad' --date=short"
    )
};

const gitRevisionPlugin = new GitRevisionPlugin({
    branch: true,
    lightweightTags: true,
});

module.exports = {
    mode: "development",
    entry: './src/index.js',
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'dist'),
    },
    resolve: {
        extensions: ['.js', '.json', '.vue', '.ts'],
        alias: {
            '@': path.resolve(__dirname),
            '~': path.resolve(__dirname),
        },
        modules: [
            'node_modules',
        ]

    },
    devtool: 'source-map',
    plugins: [
        gitRevisionPlugin,
        // TypeScript definitions for these are in src/index.d.ts
        new CopyPlugin([
            {
                from: 'public',
                to: path.resolve(__dirname, 'dist'),
                toType: 'dir',
            },
        ]),
        new webpack.DefinePlugin({
            APP: {
                TITLE: JSON.stringify("fdgo"),
                AUTHOR: JSON.stringify("Josh Greifer <joshgreifer@gmail.com>"),
                GIT: {
                    DATE: gitRevisionPlugin.commitdate(),
                    VERSION: JSON.stringify(gitRevisionPlugin.version()),
                    SHA: JSON.stringify(gitRevisionPlugin.commithash()),
                    BRANCH: JSON.stringify(gitRevisionPlugin.branch()),
                }
            }
        })
    ],

}