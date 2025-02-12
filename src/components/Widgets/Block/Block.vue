<template>
  <div class="block-section">
    <div v-if="isThereData"
         class="block-header row q-pa-md q-mb-sm"
         :class="localOptions.block.headerCustomClass">
      <a :href="localOptions.block?.url?.web"
         class="block-title ellipsis">
        {{ localOptions.block.title }}
      </a>
      <q-btn v-if="!localOptions.block.banners || localOptions.block.banners.list.length === 0"
             color="primary"
             square
             class="q-btn-sm"
             :icon="isGridView ? 'sync_alt' : 'grid_view'"
             @click="isGridView = !isGridView" />
    </div>
    <!--    <div class="block-container">-->
    <slider v-if="localOptions.block.banners && localOptions.block.banners.list.length > 0"
            :options="bannerSlides" />
    <div v-if="localOptions.block.products.list.length > 0"
         class="row item-container q-col-gutter-md"
         :class="isGridView ? 'grid_view' : 'scroll-view'">
      <div v-for="product in localOptions.block.products.list"
           :key="product.id"
           :class="{
             'col-xl-3 col-lg-3 col-md-4 col-sm-6 col-xs-12': isGridView,
             'col-xl-3 col-lg-3 col-md-4 col-sm-6 col-xs-6': !isGridView,
           }"
           class="product-spacing">
        <product-item :options="{product, minWidth: productItemMinWidth, ...defaultOptions.productItemOptions}" />
      </div>
      <div v-if="localOptions.block?.url?.web"
           class="block-item-box">
        <q-btn :href="localOptions.block?.url?.web"
               color="primary"
               size="xl">
          نمایش بیشتر
        </q-btn>
      </div>
    </div>
    <div v-if="localOptions.block.sets.list.length > 0"
         class="row item-container q-col-gutter-md"
         :class="isGridView ? 'grid_view' : 'scroll-view'">
      <div v-for="set in localOptions.block.sets.list"
           :key="set.id"
           :class="{
             'col-xl-3 col-lg-3 col-md-4 col-sm-6 col-xs-12': isGridView,
             'col-xl-3 col-lg-3 col-md-4 col-sm-5 col-xs-9': !isGridView,
           }"
           class="set-spacing">
        <set-item :options="{set, minWidth: setItemMinWidth}" />
      </div>
      <div class="block-item-box">
        <q-btn :href="localOptions.block?.url?.web"
               color="primary"
               size="xl">
          نمایش بیشتر
        </q-btn>
      </div>
    </div>
    <div v-if="localOptions.block.contents.list.length > 0"
         class="row item-container q-col-gutter-md"
         :class="isGridView ? 'grid_view' : 'scroll-view'">
      <div v-for="content in localOptions.block.contents.list"
           :key="content.id"
           :class="{
             'col-xl-3 col-lg-3 col-md-4 col-sm-6 col-xs-12': isGridView,
             'col-xl-3 col-lg-3 col-md-4 col-sm-5 col-xs-9': !isGridView,
           }"
           class="content-spacing">
        <content-item :options="{content, minWidth: contentItemMinWidth ,showDownloadMenu: localOptions.showContentDownloadMenu}" />
      </div>
      <div class="block-item-box">
        <q-btn :href="localOptions.block?.url?.web"
               color="primary"
               size="xl">
          نمایش بیشتر
        </q-btn>
      </div>
    </div>
    <!--    </div>-->
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import { Block } from 'src/models/Block.js'
import { mixinWidget } from 'src/mixin/Mixins.js'
import Slider from 'src/components/Widgets/Slider/Slider.vue'
import SetItem from 'src/components/Widgets/SetItem/SetItem.vue'
import ContentItem from 'src/components/Widgets/ContentItem/ContentItem.vue'

export default {
  name: 'Block',
  components: {
    Slider,
    SetItem,
    ContentItem,
    ProductItem: defineAsyncComponent(() => import('src/components/Widgets/Product/ProductItem/ProductItem.vue'))
  },
  mixins: [mixinWidget],
  data () {
    return {
      defaultMinWidth: 'auto',
      defaultOptions: {
        style: {},
        apiName: null,
        block: new Block(),
        gridView: false,
        showContentDownloadMenu: false,
        contentMinWidth: {
          inGridView: 'auto',
          inScrollView: 'auto'
        },
        setMinWidth: {
          inGridView: 'auto',
          inScrollView: 'auto'
        },
        productMinWidth: {
          inGridView: 'auto',
          inScrollView: 'auto'
        },
        productItemOptions: {
          theme: 'ThemeDefault',
          className: '',
          height: 'auto',
          boxed: false,
          boxedWidth: 1200,
          style: {},
          borderStyle: {
            borderCssString: '',
            borderRadiusCssString: '20px'
          },
          boxShadows: [
            '-2px -4px 10px rgba(255, 255, 255, 0.6)',
            '2px 4px 10px rgba(46, 56, 112, 0.05)'
          ],
          cssHoverEffects: {
            boxShadows: [
              '-5px -6px 10px rgba(255, 255, 255, 0.6)',
              '5px 5px 20px rgba(0, 0, 0, 0.1)'
            ],
            borderStyle: {
              borderCssString: '',
              borderRadiusCssString: '20px'
            },
            transition: {
              time: 0.4
            },
            transform: {
              rotate: 0,
              scaleX: 1,
              scaleY: 1,
              skewX: 0,
              skewY: 0,
              translateX: 0,
              translateY: -10
            }
          }
        }
      }
    }
  },
  computed: {
    isThereData() {
      return !!(
        this.localOptions.block.banners.list.length ||
        this.localOptions.block.products.list.length ||
        this.localOptions.block.contents.list.length ||
        this.localOptions.block.sets.list.length
      )
    },
    productItemMinWidth() {
      if (this.isGridView) {
        return this.localOptions.productMinWidth.inGridView
      }
      return this.localOptions.productMinWidth.inScrollView
    },
    setItemMinWidth() {
      if (this.isGridView) {
        return this.localOptions.setMinWidth.inGridView
      }
      return this.localOptions.setMinWidth.inScrollView
    },
    contentItemMinWidth() {
      if (this.isGridView) {
        return this.localOptions.contentMinWidth.inGridView
      }
      return this.localOptions.contentMinWidth.inScrollView
    },
    bannerSlides() {
      this.localOptions.block.banners.list.forEach(element => {
        element.photo = {
          src: element.photo
        }
      })
      return this.localOptions.block.banners
    },
    isGridView: {
      get () {
        return this.localOptions.gridView
      },
      set (value) {
        this.localOptions.gridView = value
      }
    }
  },
  created () {
    this.initBlockValue()
  },
  methods: {
    initBlockValue () {
      if (this.localOptions.block && this.localOptions.block.id) {
        this.localOptions.block = new Block(this.localOptions.block)
      } else if (this.localOptions.apiName) {
        this.getBlocksByRequest()
      }
    },
    getBlocksByRequest() {
      this.localOptions.block.loading = true
      this.getApiRequest()
        .then((products) => {
          this.localOptions.block = new Block({
            title: 'محصولات مرتبط',
            products
          })
          this.localOptions.block.loading = false
        })
        .catch(() => {
          this.localOptions.block.loading = false
        })
    },
    getBlocks(blocks) {
      if (!blocks || !blocks.list || blocks.list.length === 0) {
        return
      }
      return blocks.list.slice(this.localOptions.from, this.localOptions.to)
    },
    getApiRequest() {
      if (this.localOptions.apiName === 'home') {
        return this.$apiGateway.pages.home()
      }
      if (this.localOptions.apiName === 'shop') {
        return this.$apiGateway.pages.shop()
      }
      if (this.localOptions.apiName === 'content') {
        return this.$apiGateway.content.relatedProducts(this.$route.params.id)
      }
      return Promise.reject('wrong api name')
    }
  }
}
</script>

<style lang="scss" scoped>
.block-section {
  margin-bottom: 8px;
  width: 100%;
  .block-header {
    border-radius: 10px;
    justify-content: space-between;

    .block-title {
      text-decoration: none;
      cursor: pointer;
      margin: 0;
      font-style: normal;
      font-weight: 600;
      font-size: 20px;
      line-height: 31px;
      color: #333333;
      padding: 0 0 4px 0;
      border-bottom: 1px solid white;
      transition: 0.3s ease;
      max-width: 80%;
      &:hover {
        padding: 0 0 6px 0;
        border-color: #333333;
      }
      @media screen and (max-width: 600px){
        font-size: 16px;
      }
    }
  }

  //.block-container {
    //display: flex;
    //width: 100%;
    .scroll-view {
      display: flex;
      width: 100%;
      overflow-x: auto;
      flex-wrap: nowrap;
      padding-bottom: 10px;
      /* this padding is needed due to move animation of card
      to avoid overflow behavior:
      https://stackoverflow.com/questions/6421966/css-overflow-x-visible-and-overflow-y-hidden-causing-scrollbar-issue
      */
      //padding-top: 10px;
      //padding-bottom: 10px;
      @media screen and (max-width: 600px){
        //height: 500px;
      }
    }

    .item-container {
      //width: 100%;
      &.grid_view {
        justify-content: center;
      }

      .content-spacing {
        transition: all ease 0.5s;

        &:hover{
          margin-top: -10px;
        }
      }

      .block-item-box {
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 200px;
        .show-more-title {
          color: blue;
          text-decoration: none;
          cursor: pointer;
          margin: 0;
          line-height: 24px;
          letter-spacing: -0.03em;
          padding: 4px;
          border: 1px solid blue;
          transition: 0.3s ease;
          &:hover {
            background-color: blue;
            color: #f1f1f1;
          }
        }
      }
    }
  //}
}
</style>
