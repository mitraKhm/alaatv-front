<template>
  <div class="row q-pa-xl new-theme">
    <div class="col-12 q-mb-md">
      <h5>
        برنامه مطالعاتی
      </h5>
    </div>
    <div class="col-md-6 col-12 body1">
      برنامه مطالعاتی - رشته {{ major.title }}
    </div>
    <div class="col-md-6 col-12 text-right action-btns">
      <q-btn flat
             label="تغییر برنامه مطالعاتی"
             icon="ph:nut"
             class="q-btn-md"
             @click="changeStudyPlan" />
      <q-btn v-if="isAdmin"
             icon="add"
             class="newPlan-btn q-btn-md"
             text-color="grey-9"
             color="primary"
             label="زنگ جدید"
             @click="newPlanDialog = true" />
    </div>
    <q-linear-progress v-if="loading"
                       indeterminate />
    <div class="col-12 calendar">
      <full-calendar ref="fullCalendar"
                     :study-event="studyEvent"
                     :events="studyPlanList"
                     :filtered-lesson="filteredLesson"
                     @edit-plan="editPlan"
                     @remove-plan="openRemovePlanWarning" />
    </div>
    <q-dialog v-model="newPlanDialog">
      <q-card class="new-theme">
        <q-card-section>
          <div class="row items-center justify-between">
            <div>
              <q-img src="https://nodes.alaatv.com/upload/TripleTitleSet-CalendarCheck.png"
                     width="24px" />
              زنگ جدید
            </div>
            <q-btn flat
                   icon="close"
                   color="grey-6"
                   @click="newPlanDialog = false" />
          </div>
        </q-card-section>
        <q-separator />
        <q-card-section>
          <entity-create ref="entityCreate"
                         v-model:value="inputs"
                         :defaultLayout="false"
                         :after-send-data="afterSendData"
                         :api="api">
            <template #after-form-builder>
              <div class="text-right q-mt-md new-theme-btn">
                <q-btn class="btn cancel q-mx-sm text-grey-9"
                       size="md"
                       outline
                       label="لغو"
                       @click="newPlanDialog = false" />
                <q-btn class="btn q-mx-sm"
                       label="تایید"
                       size="md"
                       color="positive"
                       @click="acceptNewPlan" />
              </div>
            </template>
          </entity-create>
        </q-card-section>
      </q-card>
    </q-dialog>
    <q-dialog v-model="editPlanDialog">
      <q-card class="new-theme">
        <q-card-section>
          <div class="row items-center justify-between">
            <div>
              <q-img src="https://nodes.alaatv.com/upload/TripleTitleSet-CalendarCheck.png"
                     width="24px" />
              ویرایش زنگ
            </div>
            <q-btn v-close-popup
                   flat
                   icon="close"
                   color="grey-6" />
          </div>
        </q-card-section>
        <q-separator />
        <q-card-section>
          <entity-edit ref="entityEdit"
                       v-model:value="editInputs"
                       :defaultLayout="false"
                       :after-send-data="afterSendData"
                       :api="editApi">
            <template #after-form-builder>
              <div class="text-right q-mt-md new-theme-btn">
                <q-btn v-close-popup
                       class="btn cancel q-mx-sm text-grey-9"
                       size="md"
                       outline
                       label="لغو" />
                <q-btn class="btn q-mx-sm"
                       label="تایید"
                       size="md"
                       color="positive"
                       @click="updatePlan()" />
              </div>
            </template>
          </entity-edit>
        </q-card-section>
      </q-card>
    </q-dialog>
    <q-dialog v-model="planSettings">
      <q-card class="plan-setting new-theme">
        <q-card-section>
          <div class="row items-center justify-between">
            <div>
              <q-img src="https://nodes.alaatv.com/upload/TripleTitleSet-CalendarCheck.png"
                     width="24px" />
              تنظیمات برنامه مطالعاتی
            </div>
            <q-btn flat
                   icon="close"
                   color="grey-6"
                   @click="changeStudyPlan" />
          </div>
        </q-card-section>
        <q-separator />
        <q-card-section>
          برای شروع دوره باید برنامه مطالعاتی خودتو انتخاب کنی
        </q-card-section>
        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <div class="outsideLabel">برنامه</div>
              <q-select v-model="planType"
                        label="انتخاب کنید"
                        option-label="display_name"
                        :options="planOptions"
                        @update:model-value="setFlagTrue" />
            </div>
            <div class="col-6">
              <div class="outsideLabel">مقطع</div>
              <q-select v-model="grade"
                        label="انتخاب کنید"
                        option-label="title"
                        :options="gradeOptions"
                        @update:model-value="setFlagTrue" />
            </div>
            <div class="col-6">
              <div class="outsideLabel">رشته</div>
              <q-select v-model="major"
                        label="انتخاب کنید"
                        option-label="title"
                        :options="majorOptions"
                        @update:model-value="setFlagTrue" />
            </div>
            <div class="col-12">
              <div class="outsideLabel">درس مورد نمایش</div>
              <q-select v-model="lesson"
                        label="انتخاب کنید"
                        option-label="lesson_name"
                        :options="lessonOptions" />
            </div>
            <div class="col-12 caption1 text-grey-6">
              میتونید انتخاب کنید توی برنامه مطالعاتی شما یک یا چند درس خاص و یا همه دروس راه ابریشم نمایش داده بشن
            </div>
          </div>
        </q-card-section>
        <q-card-section>
          <div class="text-right new-theme-btn">
            <q-btn class="btn cancel q-mx-sm text-grey-9"
                   size="md"
                   outline
                   label="لغو"
                   @click="planSettings = false" />
            <q-btn class="btn q-mx-sm"
                   label="تایید"
                   size="md"
                   color="positive"
                   @click="acceptSettings" />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
    <q-dialog v-model="warning">
      <q-card class="accept-plan-card new-theme">
        <q-card-section>
          <div class="row items-center justify-between">
            <div>
              <q-img src="https://nodes.alaatv.com/upload/TripleTitleSet-CalendarCheck.png"
                     width="24px" />
              تغییر برنامه مطالعاتی
            </div>
            <q-btn flat
                   icon="close"
                   color="grey-6"
                   @click="changeStudyPlan" />
          </div>
        </q-card-section>
        <q-separator />
        <q-card-section>
          <div class="row lazy-image-wrapper">
            <lazy-img src="https://nodes.alaatv.com/upload/TripleTitleSet-warning.png" />
          </div>
        </q-card-section>
        <q-card-section>
          آیا از تغییر برنامه مطالعاتی مطمئنی؟
          تمام پیشروی‌های صورت گرفته تا به الان به حالت اول برمیگرده و برنامه مطالعاتی از اول شروع میشه.
        </q-card-section>
        <q-card-section>
          <div class="text-right new-theme-btn">
            <q-btn class="btn cancel q-mx-sm text-grey-9"
                   size="md"
                   outline
                   label="انصراف"
                   @click="warning = false" />
            <q-btn class="btn q-mx-sm"
                   label="تایید"
                   size="md"
                   color="warning"
                   @click="filterByLesson" />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
    <q-dialog v-model="removePlanWarning">
      <q-card class="accept-plan-card new-theme">
        <q-card-section>
          <div class="row items-center justify-between">
            <div>
              <q-img src="https://nodes.alaatv.com/upload/TripleTitleSet-Warning.png"
                     width="24px" />
              هشدار
            </div>
            <q-btn v-close-popup
                   flat
                   color="grey-6"
                   icon="close" />
          </div>
        </q-card-section>
        <q-separator />
        <q-card-section>
          آیا از حذف این زنگ مطمئن هستید؟
        </q-card-section>
        <q-card-section>
          <div class="text-right new-theme-btn">
            <q-btn v-close-popup
                   class="btn cancel q-mx-sm text-grey-9"
                   size="md"
                   outline
                   label="انصراف" />
            <q-btn class="btn q-mx-sm"
                   label="بله، مطمئنم"
                   size="md"
                   color="red"
                   @click="removePlan" />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
    <q-dialog v-model="successChangePlan">
      <q-card class="accept-plan-card new-theme">
        <q-card-section>
          <div class="row items-center justify-between">
            <div>
              <q-img src="https://nodes.alaatv.com/upload/TripleTitleSet-CalendarCheck.png"
                     width="24px" />
              تغییر برنامه مطالعاتی
            </div>
            <q-btn flat
                   color="grey-6"
                   icon="close"
                   @click="changeStudyPlan" />
          </div>
        </q-card-section>
        <q-separator />
        <q-card-section>
          <div class="row lazy-image-wrapper">
            <lazy-img src="https://nodes.alaatv.com/upload/TripleTitleSet-check.png" />
          </div>
        </q-card-section>
        <q-card-section>
          برنامه شما با موفقیت تنظیم شد؛ همچنین بعدا میتونید از قسمت برنامه مطالعاتی، اونو تنظیم کنید و یا تغییر بدین.
        </q-card-section>
        <q-card-section>
          <div class="text-right new-theme-btn">
            <q-btn class="btn q-mx-sm"
                   label="متوجه شدم"
                   size="md"
                   color="positive"
                   @click="successChangePlan = false" />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { shallowRef } from 'vue'
import { APIGateway } from 'src/api/APIGateway.js'
import { EntityCreate, EntityEdit } from 'quasar-crud'
import { FormBuilderAssist } from 'quasar-form-builder'
import { StudyPlanList } from 'src/models/StudyPlan.js'
import FullCalendar from './components/FullCalendar.vue'
import SessionInfo from 'src/components/Widgets/User/TripleTitleSetPanel/TripleTitleSetStudyPlan/components/SessionInfo.vue'
import ContentsComponent from 'src/components/Widgets/User/TripleTitleSetPanel/TripleTitleSetStudyPlan/components/Contents.vue'
import TextComponent from 'src/components/Widgets/User/TripleTitleSetPanel/TripleTitleSetStudyPlan/components/TextComponent.vue'
import LazyImg from 'components/lazyImg.vue'

const ContentsComponentComp = shallowRef(ContentsComponent)
const TextComponentComp = shallowRef(TextComponent)

export default {
  name: 'TripleTitleSetStudyPlan',
  components: {
    LazyImg,
    FullCalendar,
    EntityCreate,
    EntityEdit
  },
  data() {
    return {
      loading: false,
      api: APIGateway.studyPlan.APIAdresses.plan,
      selectedPlanId: null,
      newPlanDialog: false,
      editPlanDialog: false,
      isPlanChanged: false,
      removePlanWarning: false,
      isAdmin: false,
      needToUpdatePlan: false,
      studyPlanList: new StudyPlanList(),
      planSettings: false,
      acceptPlan: false,
      warning: false,
      successChangePlan: false,
      selectedDate: null,
      planType: {},
      studyEvent: null,
      planOptions: [],
      major: {},
      majorOptions: [],
      grade: {},
      gradeOptions: [],
      lesson: { lesson_name: 'همه', id: null },
      lessonOptions: [],
      filteredLesson: null,
      editApi: null,
      inputs: [
        {
          type: TextComponentComp,
          name: 'customComponent',
          text: 'برنامه و درس موردنظر رو انتخاب کن و بعدش میتونی زنگ جدید رو اضافه کنی.',
          col: 'col-12'
        },
        {
          type: 'hidden',
          name: 'event_id',
          value: null
        },
        {
          type: 'select',
          name: 'study_method_id',
          label: 'برنامه',
          placeholder: 'انتخاب کنید',
          options: [],
          optionLabel: 'display_name',
          optionValue: 'id',
          value: null,
          col: 'col-4'
        },
        {
          type: 'select',
          name: 'major_id',
          label: 'رشته',
          options: [],
          placeholder: 'انتخاب کنید',
          optionLabel: 'title',
          optionValue: 'id',
          value: null,
          col: 'col-4'
        },
        {
          type: 'select',
          name: 'grade_id',
          label: 'مقطع',
          options: [],
          placeholder: 'انتخاب کنید',
          optionLabel: 'title',
          optionValue: 'id',
          value: null,
          col: 'col-4'
        },
        {
          type: TextComponentComp,
          name: 'customComponent',
          text: 'اطلاعات محتوای موردنظر برای نمایش رو وارد کنید.',
          col: 'col-12'
        },
        {
          type: ContentsComponentComp,
          name: 'contents',
          col: 'col-12'
        },
        {
          type: SessionInfo,
          name: 'SessionInfo',
          data: [],
          col: 'col-12'
        },
        {
          type: 'date',
          name: 'date',
          label: 'تاریخ',
          value: '',
          placeholder: 'انتخاب کنید',
          calendarIcon: ' ',
          optionLabel: 'title',
          col: 'col-4'
        },
        {
          type: 'time',
          name: 'start',
          label: 'از ساعت',
          value: '',
          placeholder: 'انتخاب کنید',
          optionLabel: 'title',
          col: 'col-4'
        },
        {
          type: 'time',
          name: 'end',
          label: 'تا ساعت',
          value: '',
          placeholder: 'انتخاب کنید',
          optionLabel: 'title',
          col: 'col-4'
        },
        {
          type: 'input',
          name: 'description',
          label: 'توضیحات',
          value: '',
          placeholder: 'وارد کنید',
          col: 'col-12'
        }
      ],
      editInputs: [
        {
          type: TextComponentComp,
          name: 'customComponent',
          text: 'برنامه و درس موردنظر رو انتخاب کن و بعدش میتونی زنگ جدید رو اضافه کنی.',
          col: 'col-12'
        },
        {
          type: 'hidden',
          name: 'event_id',
          value: null
        },
        {
          type: 'select',
          name: 'study_method_id',
          label: 'برنامه',
          placeholder: 'انتخاب کنید',
          options: [],
          optionLabel: 'display_name',
          optionValue: 'id',
          responseKey: 'data.study_method',
          value: null,
          col: 'col-4'
        },
        {
          type: 'select',
          name: 'major_id',
          label: 'رشته',
          options: [],
          placeholder: 'انتخاب کنید',
          optionLabel: 'title',
          optionValue: 'id',
          value: null,
          responseKey: 'data.major.id',
          col: 'col-4'
        },
        {
          type: 'select',
          name: 'grade_id',
          label: 'مقطع',
          options: [],
          placeholder: 'انتخاب کنید',
          optionLabel: 'title',
          optionValue: 'id',
          value: null,
          responseKey: 'data.grade.id',
          col: 'col-4'
        },
        {
          type: TextComponentComp,
          name: 'customComponent',
          text: 'اطلاعات محتوای موردنظر برای نمایش رو وارد کنید.',
          col: 'col-12'
        },
        {
          type: ContentsComponentComp,
          name: 'contents',
          responseKey: 'data.contents',
          col: 'col-12'
        },
        {
          type: SessionInfo,
          name: 'SessionInfo',
          data: [],
          col: 'col-12'
        },
        {
          type: 'date',
          name: 'date',
          label: 'تاریخ',
          value: '',
          placeholder: 'انتخاب کنید',
          calendarIcon: ' ',
          optionLabel: 'title',
          responseKey: 'data.date',
          col: 'col-4'
        },
        {
          type: 'time',
          name: 'start',
          label: 'از ساعت',
          value: '',
          placeholder: 'انتخاب کنید',
          optionLabel: 'title',
          responseKey: 'data.start',
          col: 'col-4'
        },
        {
          type: 'time',
          name: 'end',
          label: 'تا ساعت',
          value: '',
          placeholder: 'انتخاب کنید',
          optionLabel: 'title',
          responseKey: 'data.end',
          col: 'col-4'
        },
        {
          type: 'input',
          name: 'description',
          label: 'توضیحات',
          value: '',
          placeholder: 'وارد کنید',
          responseKey: 'data.description',
          col: 'col-12'
        }
      ]
    }
  },
  watch: {
    planSettings(newVal) {
      if (newVal) {
        this.isPlanChanged = false
      }
    }
  },
  methods: {
    afterAuthenticate() {
      const user = this.$store.getters['Auth/user']
      this.grade = user.grade
      this.major = user.major
      this.isAdmin = user.hasPermission('insertStudyPlan') || user.hasPermission('updateStudyPlan') || user.hasPermission('deleteStudyPlan')
      this.getFilterLesson()
    },
    updatePlan() {
      this.loading = true
      const data = {
        major_id: this.$refs.entityEdit.getInputsByName('major_id').value,
        grade_id: this.$refs.entityEdit.getInputsByName('grade_id').value,
        study_method_id: this.$refs.entityEdit.getInputsByName('study_method_id').value
      }
      this.selectedDate = this.$refs.entityEdit.getInputsByName('date').value
      APIGateway.abrisham.findMyStudyPlan(data)
        .then(studyPlan => {
          this.$refs.entityEdit.setInputByName('event_id', studyPlan.id)
          if (this.studyEvent !== studyPlan.id) {
            this.studyEvent = studyPlan.id
            this.needToUpdatePlan = true
          }
          const contents = FormBuilderAssist.getInputsByName(this.editInputs, 'contents')?.value
          const newContents = []
          contents.forEach(content => {
            if (typeof content === 'object') {
              newContents.push(content.id)
            } else {
              newContents.push(content)
            }
          })
          FormBuilderAssist.setAttributeByName(this.editInputs, 'contents', 'value', newContents)
          this.$refs.entityEdit.editEntity(false)
          this.$refs.fullCalendar.getStudyPlanData(studyPlan.id)
          this.loading = false
          this.editPlanDialog = false
        })
        .catch(() => {
          this.loading = false
        })
    },
    editPlan(event) {
      this.selectedPlanId = event.id
      this.editApi = APIGateway.studyPlan.APIAdresses.editPlan(this.selectedPlanId)
      this.editPlanDialog = true
    },
    openRemovePlanWarning(event) {
      this.removePlanWarning = true
      this.selectedPlanId = event.id
    },
    removePlan() {
      this.loading = true
      APIGateway.studyPlan.removePlan(this.selectedPlanId)
        .then(() => {
          this.$refs.fullCalendar.getStudyPlanData()
          this.removePlanWarning = false
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },
    acceptNewPlan() {
      this.loading = true
      const data = {
        major_id: FormBuilderAssist.getInputsByName(this.inputs, 'major_id')?.value,
        grade_id: FormBuilderAssist.getInputsByName(this.inputs, 'grade_id')?.value,
        study_method_id: FormBuilderAssist.getInputsByName(this.inputs, 'study_method_id')?.value
      }
      APIGateway.abrisham.findMyStudyPlan(data)
        .then(studyPlan => {
          this.needToUpdatePlan = false
          FormBuilderAssist.setAttributeByName(this.inputs, 'event_id', 'value', studyPlan.id)
          if (this.studyEvent !== studyPlan.id) {
            this.studyEvent = studyPlan.id
            this.needToUpdatePlan = true
          }
          this.$refs.entityCreate.createEntity(false)
            .then(() => {
              if (this.needToUpdatePlan) {
                this.updateMyStudyPlan({
                  major_id: FormBuilderAssist.getInputsByName(this.inputs, 'major_id').value,
                  grade_id: FormBuilderAssist.getInputsByName(this.inputs, 'grade_id').value,
                  study_method_id: FormBuilderAssist.getInputsByName(this.inputs, 'study_method_id').value
                })
                this.needToUpdatePlan = false
              } else {
                this.loading = false
                this.$refs.fullCalendar.getStudyPlanData(null, FormBuilderAssist.getInputsByName(this.inputs, 'date')?.value)
              }
              this.newPlanDialog = false
            })
            .catch(() => {
              this.loading = false
            })
        })
        .catch(() => {
          this.loading = false
        })
    },
    filterByLesson() {
      this.loading = true
      this.$apiGateway.studyPlan.storeSetting({ setting: { abrisham2_calender_default_lesson: this.lesson.id } })
        .then(() => {
          this.loading = false
          this.updateMyStudyPlan()
        })
        .catch(() => {
          this.loading = false
        })
    },
    getFilterLesson() {
      return new Promise((resolve, reject) => {
        APIGateway.studyPlan.getSetting()
          .then(setting => {
            this.filteredLesson = setting.setting.abrisham2_calender_default_lesson
            this.lesson = this.lessonOptions.find(lesson => lesson.id === this.filteredLesson)
            this.getMyStudyPlan()
            resolve()
          })
          .catch(() => {
            reject()
          })
      })
    },
    setFlagTrue() {
      this.isPlanChanged = true
    },
    getMyStudyPlan() {
      this.loading = true
      APIGateway.studyPlan.getMyStudyPlan()
        .then(studyPlan => {
          this.planType.display_name = studyPlan.title
          this.studyEvent = studyPlan.id
          this.$refs.fullCalendar.getStudyPlanData(studyPlan.id)
          this.getChangePlanOptions()
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },
    getChangePlanOptions() {
      this.loading = true
      APIGateway.studyPlan.getChangePlanOptions()
        .then(options => {
          this.loading = false
          this.majorOptions = options.majors
          this.gradeOptions = options.grades
          this.planOptions = options.studyPlans
          this.lessonOptions = options.products
          this.lessonOptions.push({
            lesson_name: 'همه',
            id: null
          })
          this.planType = options.studyPlans.find(studyPlan => studyPlan.display_name === this.planType.display_name)
          this.setInputAttrByName(this.inputs, 'major_id', 'options', options.majors)
          this.setInputAttrByName(this.inputs, 'grade_id', 'options', options.grades)
          this.setInputAttrByName(this.inputs, 'study_method_id', 'options', options.studyPlans)
          this.setInputAttrByName(this.editInputs, 'major_id', 'options', options.majors)
          this.setInputAttrByName(this.editInputs, 'grade_id', 'options', options.grades)
          this.setInputAttrByName(this.editInputs, 'study_method_id', 'options', options.studyPlans)
        })
        .catch(() => {
          this.loading = false
        })
    },
    setInputAttrByName (inputs, name, attribute, value) {
      const normalizeInput = (input) => {
        const ignoreValueTypes = [
          'separator',
          'formBuilder',
          'button'
        ]
        if (ignoreValueTypes.includes(input.type) && typeof input.ignoreValue === 'undefined') {
          input.ignoreValue = true
        }
        return input
      }
      inputs.forEach(input => {
        input = normalizeInput(input)
        if (input.type === 'formBuilder') {
          this.setInputAttrByName(input.value)
        } else {
          if (input.name === name) {
            input[attribute] = value
          }
        }
      })
    },
    changeStudyPlan() {
      this.planSettings = !this.planSettings
    },
    acceptSettings() {
      this.planSettings = false
      if (this.isPlanChanged) {
        this.warning = true
      } else {
        this.filterByLesson()
      }
    },
    updateMyStudyPlan(data) {
      this.loading = true
      this.warning = false
      APIGateway.studyPlan.updateMyStudyPlan({
        study_method_id: data.study_method_id ? data.study_method_id : this.planType.id,
        major_id: data.major_id ? data.major_id : this.major.id,
        grade_id: data.grade_id ? data.grade_id : this.grade.id
      })
        .then(studyPlan => {
          this.studyEvent = studyPlan.id
          this.$refs.fullCalendar.getStudyPlanData(studyPlan.id)
          this.loading = false
          this.successChangePlan = true
        })
        .catch(() => {
          this.loading = false
        })
    }
  }
}
</script>

<style scoped lang="scss">
.calendar {
  margin-top: 25px;
}
.action-btns {
  .newPlan-btn {
    margin-left: 24px;
  }
}
.plan-setting {
  width: 488px;
}
.new-theme-btn {
  .btn {
    width: 104px;
  }
}
.accept-plan-card {
  width: 500px;
  .lazy-image-wrapper {
    place-content: center;
    .lazy-image {
      width: 140px;
      height: 140px;
    }
  }
}
.day-view-current-time-indicator {
  position: absolute;
  height: 10px;
  width: 10px;
  margin-top: -4px;
  background-color: rgba(0, 0, 255, .5);
  border-radius: 50%;
}
.day-view-current-time-line {
  position: absolute;
  border-top: rgba(0, 0, 255, .5) 2px solid;
  width: 100%
}

.body--dark {
  .day-view-current-time-indicator {
    background-color: #EF5350
  }
}

.day-view-current-time-line {
  border-top: #EF5350 2px solid
}
</style>
