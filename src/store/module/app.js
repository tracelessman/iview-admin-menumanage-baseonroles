import {
  getBreadCrumbList,
  setTagNavListInLocalstorage,
  getMenuByRouter,
  getTagNavListFromLocalstorage,
  getHomeRoute,
  getNextRoute,
  routeHasExist,
  routeEqual,
  getRouteTitleHandled,
  localSave,
  localRead,
  setToken
} from '@/libs/util'
import { saveErrorLogger } from '@/api/data'
import router from '@/router'
import routers from '@/router/routers'
import menus from '@/router/menus'
import config from '@/config'
const { homeName } = config

const closePage = (state, route) => {
  const nextRoute = getNextRoute(state.tagNavList, route)
  state.tagNavList = state.tagNavList.filter(item => {
    return !routeEqual(item, route)
  })
  router.push(nextRoute)
}

const cloneMenu = function (newMenus, {path, name, meta, component, children}) {
  let obj = {path,name,meta,component}
  newMenus.push(obj)
  if(children&&children.forEach){
    obj.children = []
    children.forEach(function (child) {
      cloneMenu(obj.children,child)
    })
  }
}

const cloneMenus = function (menus) {
  let newMenus = []
  menus.forEach(function (menu) {
    cloneMenu(newMenus,menu)
  })
  return newMenus
}
const filterMenu = function (menu,targets) {
  if(menu.children){
    for(let i=0;i<menu.children.length;i++){
      let remain = filterMenu(menu.children[i],targets)
      if(remain===false){
        menu.children.splice(i,1)
        i--
      }
    }
    if(menu.children.length===0){
      return false
    }
  }else if(!targets||targets.indexOf(menu.name)==-1){
    return false
  }
}
const filterMenus = function (menus,targets) {
  for(let i=0;i<menus.length;i++){
    let remain = filterMenu(menus[i],targets)
    if(remain===false){
      menus.splice(i,1)
      i--
    }
  }
  return menus
}
const removeLeaves = function (menus,targets) {
  if(menus&&menus.forEach){
    menus.forEach(function (menu) {
      if(menu.children){
        removeLeaves(menu.children,targets)
      }else if(targets.indexOf(menu.name)==-1){
        menu.meta.hideInMenu = true
      }
    })
  }
}
export default {
  state: {
    breadCrumbList: [],
    tagNavList: [],
    homeRoute: {},
    local: localRead('local'),
    errorList: [],
    hasReadErrorPage: false,
    permission: routers
  },
  getters: {
    menuList: (state, getters, rootState) => getMenuByRouter(state.permission, rootState.user.access),
    errorCount: state => state.errorList.length
  },
  mutations: {
    setPermission (state, {name,permission}) {
      if(name=='super_admin'){
        state.permission = routers.concat(menus)
      }else{
        let newMenus = cloneMenus(menus)
        let filteredMenus = filterMenus(newMenus,permission)
        state.permission = routers.concat(filteredMenus)
      }
    },
    setBreadCrumb (state, route) {
      state.breadCrumbList = getBreadCrumbList(route, state.homeRoute)
    },
    setHomeRoute (state, routes) {
      state.homeRoute = getHomeRoute(routes, homeName)
    },
    setTagNavList (state, list) {
      let tagList = []
      if (list) {
        tagList = [...list]
      } else tagList = getTagNavListFromLocalstorage() || []
      if (tagList[0] && tagList[0].name !== homeName) tagList.shift()
      let homeTagIndex = tagList.findIndex(item => item.name === homeName)
      if (homeTagIndex > 0) {
        let homeTag = tagList.splice(homeTagIndex, 1)[0]
        tagList.unshift(homeTag)
      }
      state.tagNavList = tagList
      setTagNavListInLocalstorage([...tagList])
    },
    closeTag (state, route) {
      let tag = state.tagNavList.filter(item => routeEqual(item, route))
      route = tag[0] ? tag[0] : null
      if (!route) return
      closePage(state, route)
    },
    addTag (state, { route, type = 'unshift' }) {
      let router = getRouteTitleHandled(route)
      if (!routeHasExist(state.tagNavList, router)) {
        if (type === 'push') state.tagNavList.push(router)
        else {
          if (router.name === homeName) state.tagNavList.unshift(router)
          else state.tagNavList.splice(1, 0, router)
        }
        setTagNavListInLocalstorage([...state.tagNavList])
      }
    },
    setLocal (state, lang) {
      localSave('local', lang)
      state.local = lang
    },
    addError (state, error) {
      state.errorList.push(error)
    },
    setHasReadErrorLoggerStatus (state, status = true) {
      state.hasReadErrorPage = status
    }
  },
  actions: {
    addErrorLog ({ commit, rootState }, info) {
      if (!window.location.href.includes('error_logger_page')) commit('setHasReadErrorLoggerStatus', false)
      const { user: { token, userId, userName } } = rootState
      let data = {
        ...info,
        time: Date.parse(new Date()),
        token,
        userId,
        userName
      }
      saveErrorLogger(info).then(() => {
        commit('addError', data)
      })
    },
    foreExit () {
      setToken("")
      router.push({
        name: "login"
      })
    }
  }
}
