<style lang="less">
  @import './menumng.less';
</style>
<template>
  <Tree ref="tree" :data="treeData" :value="value" style="margin-left: 20px" :show-checkbox="checkbox" @on-check-change="onCheckChange"></Tree>
</template>
<script>
  import menus from '@/router/menus'

  let renderNode = function (h, { root, node, data }) {
    return h('span', [
      h('Icon', {
        props: {
          type: data.icon
        },
        style: {
          marginRight: '8px'
        }
      }),
      h('span', data.title)
    ])
  }
  let computeSingleMenuBranch = function ({name, meta, children},checkedAry) {
    if(children&&children.length>0){
      if(children.length>1){
        return {
          title: name,
          expand: true,
          children: computeMenus(children,checkedAry),
          icon: meta?meta.icon:"",
          checked: checkedAry&&checkedAry.indexOf(name)!=-1,
          render: renderNode
        }
      }else if(children.length==1){
        if(meta&&meta.showAlways===true){
          return {
            title: name,
            expand: true,
            children: computeMenus(children,checkedAry),
            icon: meta?meta.icon:"",
            checked: checkedAry&&checkedAry.indexOf(name)!=-1,
            render: renderNode
          }
        }else{
          return computeSingleMenuBranch(children[0],checkedAry)
        }

      }
    }else{
      return {
        title: name,
        expand: true,
        icon: meta?meta.icon:"",
        checked: checkedAry&&checkedAry.indexOf(name)!=-1,
        render: renderNode
      }
    }
  }

  let computeMenus = function (ary,checkedAry) {
    let menuTree = []
      if(ary&&ary.forEach){
        ary.forEach(function (menu) {
          menuTree.push(computeSingleMenuBranch(menu,checkedAry))
        })
      }
      return menuTree
  }


export default{
  props:['checkbox','value'],
  data () {
    return {
      treeData: computeMenus(menus)
    }
  },
  methods: {
    onCheckChange () {
        let checked = this.$refs.tree.getCheckedNodes()
      let ckAry = []
      checked.forEach(function (n) {
        ckAry.push(n.title)
      })
      this.$emit('input', ckAry);
    }
  },
  watch: {
      value: function (val) {
        this.treeData = computeMenus(menus,val)
      }
  }
}
</script>
