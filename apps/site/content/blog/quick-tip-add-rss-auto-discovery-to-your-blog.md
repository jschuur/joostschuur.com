---
author: Joost Schuur
date: 2022-12-27
title: 'Quick Tip: Add RSS auto discovery to your blog'
description: 'A single tag will make your blog easier to subscribe to via RSS.'
featured: true
draft: false
---

Alternate social networks have been on people's minds lately, and with it the idea that having a blog under your own domain name is one of the best ways to remain in full control of your online identity and the content you produce.

An RSS feed will allow people to subscribe to your blog and get updates in a central place like an RSS reader when any of the blogs they follow have updates.

Whether you're flexing your dev skills and launching a blog now, or if you've had one for a while, there's one thing you can do to make it easier for visitors to subscribe to your RSS feed without having to hunt down the feed URL by looking for a link or recognizable icon someone on the site: RSS auto discovery.

Just add this tag to your `head` page markup with your own title and feed URL:

```html
<link rel="alternate" type="application/rss+xml"
      title="Joost Schuur" href="/feed.xml" />
```

Now when someone pastes your site or post URL into an RSS reader, it'll know what feed to subscribe to. Here's how that looks in [Reeder](https://reederapp.com/) e.g.:

![Dialog box showing the RSS feed for a blog listed when adding it via the blog URL](/images/blog/reeder_rss_feed_autodiscovery.png)

Ideally, this would go on every page of your blog, not just the front page. That way, they can just copy and paste the current page they are on.

## You do have an RSS feed, right?

Hopefully you've already got an RSS feed for your blog. I was surprised to see a lot of developers who 'only' started blogging less than 10 years ago not have one, despite regularly posting articles on their site as a blog.

If not, here's a few sources to get you started in [Astro](https://docs.astro.build/en/guides/rss/), [Gatsby](https://www.gatsbyjs.com/docs/how-to/adding-common-features/adding-an-rss-feed/), [Next.js](https://blog.logrocket.com/adding-rss-feed-next-js-app/), [Hugo](https://gohugo.io/templates/rss/) and [Jekyll](https://github.com/jekyll/jekyll-feed).

## Bonus tip: Multiple feeds

You're not just limited to one such feed link per page either. You could create a feed per category or tag, allowing people to only subscribe to some of your content, depending on how much you post or how many topics you cover on the same blog.

If you found this post useful, please consider following me [on Twitter](https://twitter.com/joostschuur) for more like it. Of course, this blog has an [RSS feed](/rss.xml) too.
