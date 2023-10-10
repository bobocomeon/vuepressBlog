module.exports = {
  title: '个人主页',
  description: '我的个人网站',
  head: [ // 注入到当前页面的 HTML <head> 中的标签
    ['link', { rel: 'icon', href: '/images/photo.jpg' }],
    ['link', { rel: 'manifest', href: '/images/photo.jpg' }],
    ['link', { rel: 'apple-touch-icon', href: '/images/photo.jpg' }],
    ['meta', { 'http-quiv': 'pragma', cotent: 'no-cache'}],
    ['meta', { 'http-quiv': 'pragma', cotent: 'no-cache,must-revalidate'}],
    ['meta', { 'http-quiv': 'expires', cotent: '0'}]
  ],
  serviceWorker: true, // 是否开启 PWA
  base: '/', // 部署到github相关的配置
  markdown: {
    lineNumbers: true // 代码块是否显示行号
  },
  themeConfig: {
    editLinks: true,
    docsDir: 'docs',
    editLinkText: '在 GitHub 上编辑此页',
    lastUpdated: '上次更新',
    nav: [ // 导航栏配置
      {text: '前端基础', link: '/accumulate/prepare/'},
      {text: '算法题库', link: '/algorithm/'},
      {text: '网络', link: '/network/guide/'},
      {text: '前端的进击', link: '/front-end-playground'},
      {text: '其他', link: '/others/'},
    ],
    sidebar: {
      '/accumulate/': [
        {
          title: '准备工作',
          collapsable: false,
          children: [
            ['prepare/', 'Introduction'],
            'prepare/jsbase',
            'prepare/summary',
            'prepare/init',
            'prepare/jsleetcode',
            'prepare/vue3'
          ]
        },
        {
          title: '安全',
          collapsable: false,
          children: [
            ['safety/', 'Introduction'],
            'safety/xsscsrf'
          ]
        },
        {
          title: '编译',
          collapsable: false,
          children: [
            ['compile/', 'Introduction'],
            'compile/vdom',
            'compile/parse',
            'compile/entrance'
          ]
        }
      ],
      '/front-end-playground': [
        {
          title: '性能优化',
          collapsable: false,
          children: [
            ['performance/', 'Introduction'],
            'performance/optimize',
          ]
        },
      ],
      '/algorithm/': [
        {
          title: '算法篇',
          collapsable: false,
          children: [
            'leetcode'
          ]
        }
      ],
      '/network/': [
        {
          title: '网络篇',
          collapsable: false,
          children: [
            ['guide/', 'Introduction'],
            'guide/performance',
            'guide/https',
            'guide/tcp'
          ]
        }
      ],
      '/others/': [
        {
          title: '其他',
          collapsable: false,
          children: [
            'css',
            'safety'
          ]
        }
      ]
    },
    sidebarDepth: 2, // 侧边栏显示2级
  }
};
