<template>
  <div class="row">
    <template v-for="item in imgData"
              :key="item">
      <div class="col-4 q-px-lg">
        <div class="rate"
             @click="selectedImgActions(item.id)">
          <q-img class="rate-img"
                 :src="item.url" />
          <div class="rate-title">
            {{item.title}}
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { APIGateway } from 'src/api/APIGateway'

export default {
  name: 'TicketRate',
  props: {
    ticketId: {
      type: Number,
      default: null
    },
    rate: {
      type: Number,
      default: null
    }
  },
  data () {
    return {
      selectedId: 0,
      imgData: []
    }
  },
  computed: {
    getImg () {
      return (id, mode) => {
        return 'https://nodes.alaatv.com/upload/ticket-rate-' + id + '-' + mode + '.png'
      }
    }
  },
  watch: {
    rate (newVal, oldVal) {
      setTimeout(() => {
        this.imgData.forEach(item => {
          if (this.rate === item.id) {
            item.url = this.getImg(item.id, 'on')
          }
        })
      }, 50)
    }
  },
  created() {
    this.initImgData()
  },
  methods: {
    isImgActive(url, id) {
      return url === this.getImg(id, 'on')
    },
    changeImgStatusToOff() {
      this.imgData.forEach(item => {
        if (this.isImgActive(item.url, item.id)) {
          item.url = this.getImg(item.id, 'off')
        }
      })
    },
    ActiveAndCheckImages(rateId) {
      this.imgData.forEach(item => {
        if (rateId === item.id) {
          this.changeImgStatusToOff()
          item.url = this.getImg(item.id, 'on')
        }
      })
    },
    selectedImgActions (rateId) {
      if (!this.isSelected(this.selectedId, rateId)) {
        return false
      }
      APIGateway.ticket.sendTicketRate(this.ticketId, { rate: rateId })
        .then((message) => {
          this.ActiveAndCheckImages(rateId)
          this.selectedId = rateId
          this.$q.notify({
            message,
            type: 'positive'
          })
        })
    },
    isSelected (selectedId, id) {
      return selectedId !== id
    },
    initImgData() {
      this.imgData = [
        {
          id: 3,
          url: this.getImg(3, 'off'),
          title: 'جوابم رو گرفتم'
        },
        {
          id: 2,
          url: this.getImg(2, 'off'),
          title: 'معمولی بود'
        },
        {
          id: 1,
          url: this.getImg(1, 'off'),
          title: 'بد بود'
        }
      ]
    }
  }
}
</script>

<style lang="scss" scoped>
.rate{
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  .rate-img {
    width: 70px;
    height: 70px;
  }
  .rate-title {
    display: flex;
    align-items: center;
    margin-top: 5px;
    font-weight: 500;
    font-size: 16px;
  }
}
</style>
