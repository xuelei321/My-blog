export const navbarData = {
  homeTitle: "XUELEI's Blog",
}

export const footerData = {
  author: 'XUELEI',
  aboutAuthor: 'Hello! I am XUELEI, a tech enthusiast student who loves solving problems and programming.',
  authorInterest:
    "Scorpio water sign, drawn to the laid-back vibe of R&B and the bold attitude of rap. A long-time listener of Jiang Yunsheng, hoping to connect with kindred spirits.",
  aboutTheSite:
    "This is my cozy personal blog. I share birthday celebrations, daily trivial moments and random life stories as a college student.",
}

export const homePage = {
  title: 'Welcome To My Blog Site',
  description:
    'Collect tiny joys in ordinary life.',
}

export const blogsPage = {
  title: 'All Blogs',
  description: 'Here you will find all the blog posts I have written & published on this site.',
}

export const categoryPage = {
  title: 'Categories',
  description: 'Blow this category is generated from all the tags are mentioned in the different blog post',
}

export const aboutPage = {
  title: 'XUELEI',
  description: 'a college student majoring in Communication Engineering with INFJ personality.',
  aboutMe:
    "Hello! Welcome to my cozy little corner. This place doesn't chase trends or try to please everyone—it's simply my own space to record life, reflect on thoughts, and gather what I love. I'm just an ordinary college student who loves exploring, finding gentleness in daily trivialities, and growing slowly through the fragments of time. This blog is where I document learning insights, life snippets, spontaneous inspirations, and growth reflections. The scenery I've seen, the words I've read, the truths I've understood—may this tiny world not only hold my thoughts and passions, but also cross paths with your kindness, offering you a moment of comfort and strength.",
}

export const seoData = {
  title: `XUELEI's Blog | XUELEI's Blog`,
  ogTitle: `XUELEI's Blog | My Daily Life & Random Stories`,
  description: `I'm a college student named XUELEI. This is my personal space to record birthday moments, trivial daily stuff and random life shares.`,
  twitterDescription: `A student's private blog for birthdays, daily snapshots and casual life journals`,
  image: '/images/xuelei.jpg',
  mySite: 'https://blog-nurriyad.vercel.app',
  twitterHandle: '@qdnvubp',
  mailAddress: '3367216865@qq.com',
}

export const socialLinks = {
  githubLink: 'https://github.com/xuelei321',
  linkedinLink: 'https://www.linkedin.com/in/xueleilei/',
  twitterLink: 'https://twitter.com/xuelei',
  stackoverflowLink: 'https://stackoverflow.com/users/16781395/xuelei',
}

export const siteMetaData = [
  {
    name: 'description',
    content: seoData.description,
  },
  // Test on: https://developers.facebook.com/tools/debug/ or https://socialsharepreview.com/
  { property: 'og:site_name', content: seoData.mySite },
  { property: 'og:type', content: 'website' },
  {
    property: 'og:url',
    content: seoData.mySite,
  },
  {
    property: 'og:title',
    content: seoData.ogTitle,
  },
  {
    property: 'og:description',
    content: seoData.description,
  },
  {
    property: 'og:image',
    content: seoData.image,
  },
  // Test on: https://cards-dev.twitter.com/validator or https://socialsharepreview.com/
  { name: 'twitter:site', content: seoData.twitterHandle },
  { name: 'twitter:card', content: 'summary_large_image' },
  {
    name: 'twitter:url',
    content: seoData.mySite,
  },
  {
    name: 'twitter:title',
    content: seoData.ogTitle,
  },
  {
    name: 'twitter:description',
    content: seoData.twitterDescription,
  },
  {
    name: 'twitter:image',
    content: seoData.image,
  },
]
