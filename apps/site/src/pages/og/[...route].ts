import { OGImageRoute } from 'astro-og-canvas';

export const { getStaticPaths, get } = OGImageRoute({
  param: 'route',
  pages: await import.meta.glob('/content/blog/**/*.md', { eager: true }),
  getImageOptions: (_path, page) => ({
    title: page.frontmatter.title,
    description: page.frontmatter.description,
    logo: {
      size: [150, 150],
      path: './public/images/joost.jpg',
    },
    border: { color: [249, 115, 22], width: 20, side: 'inline-start' },
    bgGradient: [[250, 235, 215]],
    padding: 30,
    font: {
      title: {
        size: 64,
        color: [55, 65, 81],
        lineHeight: 1.1,
        families: ['Anybody'],
        weight: 'ExtraBold',
      },
      description: {
        size: 38,
        color: [55, 65, 81],
        lineHeight: 1.1,
        families: ['Poppins'],
        weight: 'Normal',
      },
    },
    fonts: [
      'https://api.fontsource.org/v1/fonts/anybody/latin-800-normal.ttf',
      'https://api.fontsource.org/v1/fonts/poppins/latin-400-normal.ttf',
    ],
  }),
});
