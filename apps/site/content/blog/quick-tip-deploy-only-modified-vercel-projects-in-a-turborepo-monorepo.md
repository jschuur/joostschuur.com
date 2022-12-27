---
author: Joost Schuur
date: 2022-12-25
title: 'Quick Tip: Deploy only modified Vercel projects in a Turborepo monorepo'
description: 'How to only redeploy an updated app when using multiple Vercel projects from the same monorepo.'
featured: true
draft: false
---

When I relaunched my personal site, I wanted to keep both the [Astro](https://astro.build)-based site and its [Sanity CMS](https://santity.io) in a single monorepo and host them each under a separate Vercel project instance. Since I trigger deploys via git commits to the same repo, this meant Vercel should ideally only redeploy an app if it was actually updated.

### Initial setup

I used [Yarn workspaces](https://classic.yarnpkg.com/lang/en/docs/workspaces/) and created two directories under the [apps](https://github.com/jschuur/joostschuur.com/tree/main/apps) directory. One for the Astro site and one for the CMS.

On Vercel, I [added](https://vercel.com/docs/concepts/projects/overview) each app as a project and linked both to the same git repo. For each project, you can provide a relative path (from your repo root) to its apps directory under the General / Root Directory setting, so that it knows what part of a monorepo to use.

Here's what that looks like for the Astro site:

![Vercel's Root Directory setting](/images/blog/vercel_root_directory.png)

Next up was getting Vercel to only redeploy an app that had actually changed. In the Vercel dashboard, there's a project Git setting called '[Ignored Build Step](https://vercel.com/guides/how-do-i-use-the-ignored-build-step-field-on-vercel)'. If you list a shell command here, the build process will only continue if it returns an exit code of 1 after it's run:

![Vercel's Ignored Build Step setting](/images/blog/vercel_ignored_build_step.png)

### Skipping builds using git diff

Initially, I used `git diff` to see if a commit modified files for a given app by scoping it to its directory. So for the Astro site that would be `git diff --quiet HEAD^ HEAD ./apps/site`.

This returns 1 as needed to trigger a build process if that app has changes in a git commit. However, if you make changes across multiple apps, Vercel would only use the most recent commit to decide what to rebuild.

### Better: Skipping builds using turbo-ignore

The solution to this problem came via a [tip on Twitter](https://twitter.com/leeerob/status/1601613946540081152) from person at Vercel: Use `turbo-ignore`, part of the [Turborepo](https://turbo.build/repo/) build system.

When paired with Vercel hosting, it can [identify if a given workspace (app) has been modified](https://vercel.com/docs/concepts/monorepos/turborepo#using-turbo-ignore) since the last successful deploy based on the Turborepo dependency graph.

I didn't actually have any build dependencies between the two apps, so the required `turbo.json` needed for a [basic Turborepo setup](https://turbo.build/repo/docs/getting-started/add-to-project) was pretty straightforward:

```
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "outputs": ["dist/**"]
    },
    "dev": {
      "cache": false
    }
  }
```

Now I could set each of my Ignored Build Step settings to just `npx turbo-ignore`.

Any new git push to the repo will only trigger a build/redeploy for an app if it's been updated, no matter how many git commits ago.

A nice little added bonus was that you can even set up [caching between your local and remote builds](https://vercel.com/docs/concepts/monorepos/turborepo#setup-remote-caching-for-turborepo-on-vercel) to speed up your build process.

Check out the entire setup for this [on GitHub](https://github.com/jschuur/joostschuur.com).

If you found this post useful, please consider following me [on Twitter](https://twitter.com/joostschuur) for more like it.
