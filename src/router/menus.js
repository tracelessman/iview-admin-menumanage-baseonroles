import Main from '@/components/main'
export default [
  {
    path: '/system',
    name: '系统管理',
    meta: {
      showAlways: false,
      icon: 'md-menu',
      title: '系统功能'
    },
    component: Main,
    children: [
      {
        path: 'menumanage',
        name: '菜单一览',
        meta: {
          icon: 'md-funnel',
          title: '菜单一览'
        },
        component: () => import('@/view/system/menumng.vue')
      }
    ]
  }
]
