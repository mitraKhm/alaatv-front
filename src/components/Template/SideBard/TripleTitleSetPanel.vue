<template>
  <div class="chatr-side-menu">
    <div v-if="isDesktop"
         class="side-menu">
      <div class="menu-logo">
        <router-link v-if="domainSameWithAppDomain"
                     :to="{name: 'Public.Home'}">
          <q-img src="https://nodes.alaatv.com/upload/landing/chatr/alaa%20logo.png"
                 class="logo-image" />
        </router-link>
      </div>
      <div class="menu-items">
        <q-list class="menu-items-list">
          <q-item v-for="(item, index) in menuItems.filter(item=>item.visible)"
                  :key="index"
                  :to="{name:item.routeName }"
                  class="menu-item">
            <div v-if="$route.name === item.routeName"
                 class="menu-indicator" />
            <q-icon class="icon"
                    :class="[ $route.name===item.routeName ? 'activate' :'']"
                    :name="item.icon" />
          </q-item>
        </q-list>
      </div>
      <div class="log-out menu-items">
        <q-list class="menu-items-list">
          <q-item class="menu-item">
            <q-btn round
                   flat
                   dense
                   size="md"
                   color="white"
                   icon="ph:sign-out"
                   @click="toggleLogoutDialog" />
          </q-item>
        </q-list>
      </div>
    </div>
    <layout-menu v-else
                 class="side-menu-items"
                 :topics-route-array="topicsRouteArray"
                 :topic-list="topicList"
                 :menu-key="menuKey"
                 :selected-topic="selectedTopic"
                 :product-items="productItems"
                 @item-selected="itemSelected" />
    <q-dialog v-model="logoutDialog">
      <q-card class="logout-dialog-card">
        <q-card-section class="logout-header">
          <div class="header-title">
            <q-icon name="warning_amber"
                    color="negative" />
            <div class="header-title-text">
              هشدار
            </div>
          </div>
          <div class="close">
            <q-btn color="grey"
                   icon="close"
                   flat
                   @click="toggleLogoutDialog" />
          </div>
        </q-card-section>
        <q-separator />
        <q-card-section>
          <div class="logout-message">
            آیا میخواهید از حساب کاربری خود خارج شوید؟
          </div>
        </q-card-section>
        <q-card-actions align="right"
                        class="logout-dialog-action">
          <q-btn v-close-popup
                 outlined
                 unelevated
                 label="انصراف"
                 color="grey"
                 class="action-btn"
                 @click="toggleLogoutDialog" />
          <q-btn v-close-popup
                 unelevated=""
                 label="خروج"
                 color="negative"
                 class="action-btn"
                 @click="logOut" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { mapMutations } from 'vuex'
import LayoutMenu from 'src/components/DashboardTripleTitleSet/LayoutMenu.vue'
import { APIGateway } from 'src/api/APIGateway'
import { mixinAuth } from 'src/mixin/Mixins.js'

export default {
  name: 'TripleTitleSetPanel',
  components: { LayoutMenu },
  mixins: [mixinAuth],
  data: () => ({
    isActive: null,
    isAdmin: false,
    logoutDialog: false,
    eventInfo: null,
    menuItems: [
      {
        visible: false,
        icon: 'home',
        routeName: 'UserPanel.Asset.TripleTitleSet.Dashboard'
      },
      {
        visible: true,
        icon: 'playlist_play',
        routeName: 'UserPanel.Asset.TripleTitleSet.Products'
      },
      {
        visible: false,
        icon: 'calendar_today',
        routeName: 'UserPanel.Asset.TripleTitleSet.StudyPlan'
      }
      // {
      //   icon: 'calendar_today',
      //   routeName: 'UserPanel.Asset.TripleTitleSet.Products'
      // }
      // {
      //   icon: 'list-check',
      //   routeName: 'my-performance'
      //
      // },
      // {
      //   icon: 'stats',
      //   routeName: 'assessment'
      // },
    ],
    topicsRouteArray: [
      {
        title: 'سر فصل ها',
        icon: 'isax:document-upload',
        routeName: '',
        active: false,
        show: true,
        open: true,
        children: [
          {
            title: 'تایتل ست',
            routeName: 'UserPanel.Asset.TripleTitleSet.Products',
            active: false,
            show: true,
            open: false
          }
        ]
      }
    ],
    menuKey: 0,
    productItems: [
      {
        name: 'pamphlet',
        routeName: 'UserPanel.Asset.TripleTitleSet.ProductDocuments',
        label: 'جزوات'
      },
      {
        name: 'notes',
        routeName: 'UserPanel.Asset.TripleTitleSet.ProductComments',
        label: 'یادداشت ها'
      },
      {
        name: 'favoredContents',
        routeName: 'UserPanel.Asset.TripleTitleSet.ProductBookmarks',
        label: 'نشان شده ها'
      }
    ]
  }),
  computed: {
    topicList () {
      const topicList = this.$store.getters['TripleTitleSet/setTopicList']
      this.fillTopicsRouteArray(topicList)
      return topicList
    },
    selectedTopic () {
      return this.$store.getters['TripleTitleSet/selectedTopic'] || ''
    },
    isDesktop () {
      if (this.$q.screen.lt.md) {
        this.$store.commit('AppLayout/updateLayoutLeftDrawerWidth', 350)
      } else {
        this.$store.commit('AppLayout/updateLayoutLeftDrawerWidth', 100)
      }
      return !this.$q.screen.lt.md
    }
  },
  mounted () {
    this.getEventInfoByName()
      .then(() => {
        this.updateMenuItemsFromEventInfo()
      })
      .catch(() => {
      })
  },
  methods: {
    getEventInfoByName () {
      return new Promise((resolve, reject) => {
        APIGateway.events.getEventInfoByName(this.$route.params.eventName)
          .then((eventInfo) => {
            this.eventInfo = eventInfo
            resolve(eventInfo)
          })
          .catch(() => {
            reject()
          })
      })
    },
    updateMenuItemsFromEventInfo () {
      const user = this.$store.getters['Auth/user']
      this.isAdmin = user.hasPermission('insertStudyPlan') || user.hasPermission('updateStudyPlan') || user.hasPermission('deleteStudyPlan')

      this.updateMenuItemVisibility('UserPanel.Asset.TripleTitleSet.Dashboard', this.eventInfo.showDashboard)
      this.updateMenuItemVisibility('UserPanel.Asset.TripleTitleSet.StudyPlan', (this.eventInfo.showStudyPlan || this.isAdmin))
    },
    updateMenuItemVisibility (routeName, state) {
      this.menuItems.forEach((item, itemIndex) => {
        if (item.routeName === routeName) {
          this.menuItems[itemIndex].visible = state
        }
      })
    },
    ...mapMutations('TripleTitleSet', [
      'updateSelectedTopic'
    ]),
    toggleLogoutDialog() {
      this.logoutDialog = !this.logoutDialog
    },
    logOut() {
      this.toggleLogoutDialog()
      const redirectAfterLogout = this.domainSameWithAppDomain
      this.$store.dispatch('Auth/logOut', { redirectTo: redirectAfterLogout })
      if (!this.domainSameWithAppDomain) {
        const route = this.$router.resolve({ name: 'login' })
        window.location.href = route.path
      }
    },
    fillTopicsRouteArray (topicList) {
      this.topicsRouteArray[0].children = []
      topicList.forEach(topic => {
        this.topicsRouteArray[0].children.push({
          title: topic,
          value: topic,
          active: false,
          show: true,
          open: false
        })
      })
      this.menuKey++
    },
    itemSelected (topic) {
      this.updateSelectedTopic(topic.title)
    }
  }
}
</script>

<style scoped lang="scss">
.chatr-side-menu {
  background: white;
  height: 100%;
}
.side-menu{
  min-height: calc(100vh - 2px) ;
  height: 100vh;
  display: grid !important;
  border-right: 1px solid #26A69A;
  background-color: #26A69A;
  .menu-logo {
    text-align: center;
    margin: 30px auto 130px;
    height: 60px;
    @media screen and (max-width: 1904px){
      margin: 20px auto 76px;
    }
    @media screen and (max-width: 1200px){
      margin: 20px auto 66px;
    }
    @media screen and (max-width: 960px){
      margin: 10px auto 266px !important;
    }
    .logo-image{
      width: 60px;
      height: 60px;
      @media screen and (max-width: 1200px){
        width: 50px;
        height: 50px;
      }
      @media screen and (max-width: 960px){
        width: 40px;
        height: 40px;
      }
    }
    @media screen and (max-width: 1200px){
      height: 50px;
    }
    @media screen and (max-width: 960px){
      height: 40px;
    }
  }
  .menu-items{
    position: relative;
    .menu-items-list{
      position: relative;
      padding: 0;
      .menu-item{
        margin-bottom: 26px;
        text-align: center;
        display: flex;
        justify-content: center;
        .activate{
          color: #FFF !important;
        }
        .menu-indicator{
          position: absolute;
          height: 36px;
          width: 8px;
          background-color:#FFF ;
          border: none;
          border-radius:0 6px 6px 0;
          left: 0;
          @media screen and (max-width: 1200px){
            height: 32px;
            border-radius:4px 0 0 4px;
          }
          @media screen and (max-width: 960px){
            height: 28px;
            width: 6px;
          }
        }
        :deep(.icon){
          color: #FFF;
          font-size: 26px;
          position: relative;
          top: 5px;
          @media screen and (max-width: 1200px){
            font-size: 20px;
          }
          @media screen and (max-width: 960px){
            font-size: 19px;
          }
        }
        @media screen and (max-width: 1200px){
          margin-bottom:16px !important;
          vertical-align: middle;
        }
        @media screen and (max-width: 960px){
          margin-bottom:12px !important;
        }
      }
    }
  }

  @media screen and (max-width: 768px){
    display: none;
  }
}
.side-menu-items{
  z-index: 99999;
  padding: 20px;
}

.logout-dialog-card {
  width: 488px;
  border-radius: 12px;
  padding: 0;
  background:#FFF;
  box-shadow: 0px 2px 4px -2px rgba(16, 24, 40, 0.06), 0px 4px 8px -2px rgba(16, 24, 40, 0.10);

  .logout-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;

    .header-title {
      display: flex;
      justify-content: flex-start;
      align-items: center;

      .header-title-text {
        margin-left: 5px;
        color: #424242;
        font-size: 16px;
        font-style: normal;
        font-weight: 500;
        line-height: normal;
        letter-spacing: -0.32px;
      }
    }
  }

  .logout-message {
    padding: 24px;
    color:#424242;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
    letter-spacing: -0.28px;
  }

  .logout-dialog-action {
    padding: 0 24px 20px;

    .action-btn {
      display: flex;
      width: 104px;
      justify-content: center;
      align-items: center;
    }
  }
}
</style>
