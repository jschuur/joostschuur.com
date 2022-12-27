---
author: Joost Schuur
date: 2022-07-29
title: 'Using pure ESM npm packages in serverless-webpack bundles'
description: "How to include third party Node modules if they only support the ES6 module format and you're generating a Webpack bundle to deploy as an AWS lambda with the Serverless Framework."
featured: true
draft: false
tags:
  - javascript
  - adhd
---

Recently, some of the npm packages I was using together with [Serverless Framework](https://www.serverless.com/) had [upgraded](https://github.com/sindresorhus/pretty-ms/releases/tag/v8.0.0) to 'pure ESM'. This meant that they no longer supported the older CommonJS `require` syntax and I needed to figure out how get Webpack to bundle everything up nicely again to deploy as a CommonJS AWS lambda.

My own code also used modern, ES6 style import/export statements:

```js
import { PrismaClient } from '@prisma/client';
import { map } from 'lodash';
import prettyMilliseconds from 'pretty-ms';

const prisma = new PrismaClient();

export const animals = async () => {
  const startTime = new Date();
  const frens = await prisma.animal.findMany();

  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        frens: map(frens, 'name').join(' & '),
        runTime:
          prettyMilliseconds(new Date() - startTime),
      },
      null,
      2
    ),
  };
};
```

Since I was using [serverless-webpack](https://github.com/serverless-heaven/serverless-webpack) along with Prisma's [serverless-webpack-prisma helper](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-aws-lambda#deployment-using-serverless-webpack), a bit of extra Webpack config setup was needed to get it all using the same module syntax without the usual dreaded 'Unexpected token export' or import error from Node.

## Initial setup

First, we tell serverless-webpack to include npm modules in the bundle it creates in `serverless.yml`:

```
custom:
  webpack:
    includeModules: true
```

Next, we tell Webpack to create a CommonJS target in `webpack.config.js`. I chose [`commonjs2`](https://webpack.js.org/configuration/output/#librarytarget-commonjs2) as a target, but `commonjs` works too:

```js
  output: {
    libraryTarget: 'commonjs2',
    filename: '[name].js',
    path: path.resolve(__dirname, '.webpack'),
  }
```

Then we use [babel-loader](https://www.npmjs.com/package/babel-loader) with Webpack to transpile ES6+ syntax (including my own code) into CommonJS.

You typically tell babel-loader to [exclude](https://webpack.js.org/loaders/babel-loader/#exclude-libraries-that-should-not-be-transpiled) anything in the `node_modules` folder from being transpiled, because this would otherwise slow down the whole bundling process. In our case however, we only want to exclude everything **but** those npm packages that have switched to pure ESM, because we want Babel to still transpile them into CommonJS.

We could create a complex regular expression to define this `exclude` condition, but [babel-loader-exclude-node-modules-except](https://www.npmjs.com/package/babel-loader-exclude-node-modules-except) comes in very handy here. We get a nice readable array of all the affected modules:

```js
const babelLoaderExcludeNodeModulesExcept
  = require('babel-loader-exclude-node-modules-except');

// ...

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: babelLoaderExcludeNodeModulesExcept(
          ['pretty-ms', 'parse-ms']
        ),
        loader: 'babel-loader',
      },
    ],
  }
```

You could just skip the `exclude` option entirely, then everything gets transpiled, but doing it this way is better for performance.

I knew that pretty-ms had recently gone pure ESM, but it's important we also identify any of their dependencies that are pure ESM too (like parse-ms), or we'll eventually run into this error:

```json
{
   "errorMessage": "require() of ES Module /Users/joostschuur/Code/Personal/_Tests/serverless-prisma-esm/node_modules/parse-ms/index.js from /Users/joostschuur/Code/Personal/_Tests/serverless-prisma-esm/.webpack/service/src/handler.js not supported.\nInstead change the require of index.js in /Users/joostschuur/Code/Personal/_Tests/serverless-prisma-esm/.webpack/service/src/handler.js to a dynamic import() which is available in all CommonJS modules."
}
```

One way to do that is to just keep adding more modules to the list based on their name in the error message, until you stop getting an error.

Finally, we also need to make sure that Webpack doesn't ignore our transpiled packages via the [externals](https://webpack.js.org/configuration/externals/) setting. Even though Babel transpiled them, it's common to use [webpack-node-externals](https://www.npmjs.com/package/webpack-node-externals) to generate a list of externals for us. By default this will include anything from `node_modules`. Since externals are not included in the bundle, this would mean that our transpiled pure ESM packages would not be used.

To solve this, we can use the [`allowlist`](https://github.com/liady/webpack-node-externals#optionsallowlist-) option to still bundle certain packages. This then uses the CommonJS versions that were created by babel-loader.

We also need to specifically match things like `formdata-polyfill/esm.min.js` which can get imported, but not conflate `date-fns` with `da†e-fns-tz`, so we're using a regular expression array for the `allowlist`.

```js
const nodeExternals = require('webpack-node-externals');

const pureESMDependencies = ['pretty-ms', 'parse-ms'];
\\ ....

  externals: [nodeExternals({
    allowlist: pureESMDependencies
      .map((dep) => RegExp(`^${dep}(/.*)?$`))
  })],
```

## Putting it all together

All in all, here is the complete `webpack.config.js` with the pure ESM modules defined in a reusable list and some other required (heh) settings:

```js
const path = require('path');

const babelLoaderExcludeNodeModulesExcept =
  require('babel-loader-exclude-node-modules-except');
const nodeExternals = require('webpack-node-externals');
const slsw = require('serverless-webpack');

const pureESMModules = ['pretty-ms', 'parse-ms'];

module.exports = {
  target: 'node',
  stats: 'normal',
  entry: slsw.lib.entries,
  externals: [nodeExternals({
    allowlist: pureESMDependencies
      .map((dep) => RegExp(`^${dep}(/.*)?$`))
  })],
  mode: slsw.lib.webpack.isLocal ? 'development' : 'production',
  optimization: { concatenateModules: false },
  resolve: { extensions: ['.js'] },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: babelLoaderExcludeNodeModulesExcept(pureESMModules),
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
          },
        },
      },
    ],
  },
  output: {
    libraryTarget: 'commonjs2',
    filename: '[name].js',
    path: path.resolve(__dirname, '.webpack'),
  },
};

```

This is the accompanying `.babelrc` file, although plugin-transform-runtime is optional for what we're doing here:

```json
{
  "plugins": ["@babel/plugin-transform-runtime"],
  "presets": ["@babel/preset-env"]
}
```

Once deployed (or previewed locally with [serverless-offline](https://www.serverless.com/plugins/serverless-offline)), our API endpoint now shows the expected output, featuring our lovable sea mammal frens:

```json
{
	"frens": "Bobby & Lola",
	"runTime": "70ms"
}
```

You can check out the [full prototype on GitHub](https://github.com/jschuur/serverless-prisma-esm).

## Bonus: Programmatically Identifying ESM modules

Manually tracking down any pure ESM modules in your project can be annoying, so eventually, I went and automated this part too using [webpack-node-module-types](https://www.npmjs.com/package/webpack-node-module-types). Details in [an answer](https://stackoverflow.com/a/73187355/122864) to my own Stack Overflow question.


## The journey was the reward

Figuring this out was ultimately a lot of fun. So much fun I'm writing my first blog post in a long time!

Initially, I was stumped and actually tried to make it work the other way around by producing an ESM bundle ([now supported](https://aws.amazon.com/about-aws/whats-new/2022/01/aws-lambda-es-modules-top-level-await-node-js-14/) by AWS). I even wrote half of a Stack Overflow post asking for help. In the process, I decided to try the CommonJS approach again and solved my problem before I even sent that post. Sound familiar to anyone?

For someone with ADHD like me, it was such a rewarding experience when it all started to make sense in my head. Once I thought through some of the interactions that the different pieces like babel-loader and webpack-node-externals had, a potential problem suddenly occurred to me and that led me to this solution. Maybe I got a little lucky, but I'm calling this a win!

I would encourage everyone to look for those moments of clarity when you gain a little deeper understanding of a topic and reap the rewards. Sometimes the steps along the way were all part of the learning process that and we can't take any shortcuts.

## LearnByVideo.dev

The new side project this is for is [LearnByVideo.dev](https://learnbyvideo.dev/). It's for developers to discover programming tutorial videos and curate shareable playlists. Those can then be used to organise new skills to learn, without ending up with dozens of ignored browser tabs :)

As part of that, I wanted to migrate the dedicated server based [video update process](https://github.com/jschuur/learnbyvideo.dev/tree/main/backend) to use long-running, scheduled serverless functions.

Right now, it's just a list of recent YouTube videos from over 750 curated developer channels. I've indexed more than 140,000 videos already and just added some neat infinite scrolling. You can already scroll to your heart's content and get a sense of all the amazing free video content out there to learn from:

![Screenshot of LearnByVideo.dev, showing a grid of recent development tutorials from Youtube](/images/blog/early_learnbyvideodev.png)

Next up is tech stack categorisation, done in a similar way as on another side project of mine for discovering [Twitch live coders](https://streamers.dev/).

If this project interests you, please follow [@LearnByVideoDev](https://twitter.com/LearnByVideoDev) or [@joostschuur](https://twitter.com/joostschuur) on Twitter.