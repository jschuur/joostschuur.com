import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'social',
  title: 'Social',
  type: 'document',
  fields: [
    defineField({
      name: 'type',
      title: 'Type',
      type: 'string',
      options: {
        list: [
          'Twitter',
          'Mastodon',
          'Instagram',
          'Github',
          'Email',
          'Linkedin',
          'Facebook',
          'YouTube',
          'Twitch',
          'TikTok',
          'WhatsApp',
          'SnapChat',
          'CodePen',
          'Discord',
          'GitLab',
          'Reddit',
          'Skype',
          'Steam',
          'Telegram',
        ],
      },
    }),
    defineField({
      name: 'link',
      title: 'Link',
      type: 'url',
      validation: Rule =>
        Rule.uri({
          scheme: ['http', 'https', 'mailto'],
        }),
    }),
    defineField({
      name: 'active',
      title: 'Active',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      hidden: true,
    }),
  ],
});
