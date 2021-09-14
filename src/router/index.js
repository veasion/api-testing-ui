import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

import Layout from '@/layout'
import toolRouter from './modules/tool'

export const constantRoutes = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path*',
        component: () => import('@/views/redirect/index')
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/auth-redirect',
    component: () => import('@/views/login/auth-redirect'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/error-page/404'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/error-page/401'),
    hidden: true
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/dashboard/admin/index'),
        name: 'Dashboard',
        meta: { title: '运行报表', icon: 'dashboard', affix: true }
      }
    ]
  }
]

/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user roles
 */
export const asyncRoutes = [
  {
    path: '/profile',
    component: Layout,
    redirect: '/profile/index',
    hidden: true,
    children: [
      {
        path: 'index',
        component: () => import('@/views/profile/index'),
        name: 'Profile',
        meta: { title: 'Profile', icon: 'user', noCache: true }
      }
    ]
  },
  {
    path: '/error',
    component: Layout,
    redirect: 'noRedirect',
    name: 'ErrorPages',
    hidden: true,
    meta: {
      title: 'Error Pages',
      icon: '404'
    },
    children: [
      {
        path: '401',
        component: () => import('@/views/error-page/401'),
        name: 'Page401',
        meta: { title: '401', noCache: true }
      },
      {
        path: '404',
        component: () => import('@/views/error-page/404'),
        name: 'Page404',
        meta: { title: '404', noCache: true }
      }
    ]
  },
  {
    path: '/testing/project',
    component: Layout,
    redirect: '/testing/project',
    meta: { title: '项目管理', icon: 'project' },
    children: [
      {
        path: 'project',
        name: 'Project',
        component: () => import('@/views/testing/project/index'),
        meta: { title: '项目管理', icon: 'project' }
      },
      {
        path: 'config/:id',
        name: 'ProjectConfig',
        component: () => import('@/views/testing/project/config'),
        meta: { title: '项目配置' },
        hidden: true
      }
    ]
  },
  {
    path: '/testing/api',
    component: Layout,
    redirect: '/testing/api',
    meta: { title: 'API接口', icon: 'api' },
    children: [
      {
        path: 'api',
        name: 'Api',
        component: () => import('@/views/testing/api/index'),
        meta: { title: 'API接口', icon: 'api' }
      }
    ]
  },
  {
    path: '/testing/testCase',
    component: Layout,
    redirect: '/testing/testCase',
    meta: { title: '测试用例', icon: 'task-cfg' },
    children: [
      {
        path: 'testCase',
        name: 'TestCase',
        component: () => import('@/views/testing/testCase/index'),
        meta: { title: '测试用例', icon: 'task-cfg' }
      },
      {
        path: 'testCase/:id?',
        name: 'TestCaseConfig',
        component: () => import('@/views/testing/testCase/config'),
        meta: { title: '测试用例编辑' },
        hidden: true
      }
    ]
  },
  {
    path: '/testing/strategy',
    component: Layout,
    redirect: '/testing/strategy',
    meta: { title: '执行策略', icon: 'exe-cfg' },
    children: [
      {
        path: 'strategy',
        name: 'Strategy',
        component: () => import('@/views/testing/strategy/index'),
        meta: { title: '执行策略', icon: 'exe-cfg' }
      }
    ]
  },
  {
    path: '/testing/logs',
    component: Layout,
    redirect: '/testing/logs',
    meta: { title: '日志管理', icon: 'work' },
    children: [
      {
        path: 'logs',
        name: 'Logs',
        component: () => import('@/views/testing/logs/index'),
        meta: { title: '日志管理', icon: 'log' }
      }
    ]
  },
  {
    path: '/testing/user',
    component: Layout,
    redirect: '/testing/user',
    meta: { title: '用户管理', icon: 'work', roles: ['ROLE_ADMIN'] },
    children: [
      {
        path: 'user',
        name: 'User',
        component: () => import('@/views/testing/user/index'),
        meta: { title: '用户管理', icon: 'table' }
      }
    ]
  },
  {
    path: '/testing/resource',
    component: Layout,
    redirect: '/testing/resource',
    meta: { title: '资源监控', icon: 'work' },
    children: [
      {
        path: 'resource',
        name: 'Resource',
        component: () => import('@/views/testing/resource/index'),
        meta: { title: '资源监控', icon: 'battery-line' }
      }
    ]
  },
  toolRouter,
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  // mode: 'history',
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
