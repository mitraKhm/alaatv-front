<template>
  <div class="row">
    <div class="col-12 col-lg-9  info-col">
      <div class="row">
        <div class="col-12 col-md-4">
          <plan-status :passedDays="studyPlanInfo?.passed_days"
                       :loading="loading" />
        </div>
        <div class="col-12 col-md-3">
          <plan-statics :watched="studyPlanInfo?.count_of_watched_sessions"
                        :remained="studyPlanInfo?.count_of_remained_sessions"
                        :loading="loading" />
        </div>
        <div class="col-12 col-md-5">
          <plan-reviews :studyPlanId="studyPlanInfo?.id"
                        :loading="loading" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import PlanStatus from 'src/components/DashboardTripleTitleSet/Dashboard/PlanStatus.vue'
import PlanStatics from 'src/components/DashboardTripleTitleSet/Dashboard/PlanStatics.vue'
import PlanReviews from 'src/components/DashboardTripleTitleSet/Dashboard/PlanReviews.vue'
export default defineComponent({
  name: 'StatusAndReview',
  components: {
    PlanStatus,
    PlanStatics,
    PlanReviews
  },
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    studyPlanInfo: {
      type: Object,
      default() {
        return {
          id: null,
          title: '',
          passed_days: null,
          count_of_watched_sessions: null,
          count_of_remained_sessions: null
        }
      }
    }
  }
})
</script>

<style lang="scss" scoped>
.info-col {
  background: #FFF;
  border-radius: 12px;
  box-shadow: 0px 1px 2px 0px rgba(16, 24, 40, 0.06), 0px 1px 3px 0px rgba(16, 24, 40, 0.08);
  padding: 30px 20px 50px 30px;
  min-height: 400px;
}
</style>
