<template>
  <!--  v-model:index-inputs="indexInputs"-->
  <entity-crud v-model:default-inputs="defaultInputs"
               v-model:index-inputs="indexInputs"
               v-bind="allProps">
    <template v-slot:entity-crud-table-cell="{inputData, showConfirmRemoveDialog}">
      <q-td :props="inputData.props">
        <template v-if="inputData.props.col.name === 'actions'">
          <!--          <q-btn round flat dense size="md" color="info" icon="info" :to="{name:'Admin.TeleMarketing.Edit', params: {id: inputData.props.row.id}}">-->
          <!--            <q-tooltip>-->
          <!--              ویرایش-->
          <!--            </q-tooltip>-->
          <!--          </q-btn>-->
          <q-btn round
                 flat
                 dense
                 size="md"
                 color="negative"
                 icon="delete"
                 class="q-ml-md"
                 @click="showConfirmRemoveDialog(inputData.props.row, 'id', getRemoveMessage(inputData.props.row))">
            <q-tooltip>
              حذف
            </q-tooltip>
          </q-btn>
        </template>
        <template v-else-if="inputData.props.col.name === 'description'">
          <div v-html="inputData.props.value" />
        </template>
        <template v-else>
          {{ inputData.props.value }}
        </template>
      </q-td>
    </template>
  </entity-crud>
</template>

<script>
import EntityCrud from 'src/components/EntityCrud.vue'
import { APIGateway } from 'src/api/APIGateway'

export default {
  name: 'TeleMarketing',
  components: {
    EntityCrud
  },
  data () {
    return {
      model: null,
      tags: [],
      expanded: true,
      allProps: {
        config: {
          api: {
            show: APIGateway.teleMarketing.APIAdresses.show,
            edit: APIGateway.teleMarketing.APIAdresses.edit,
            create: APIGateway.teleMarketing.APIAdresses.create,
            index: APIGateway.teleMarketing.APIAdresses.index
          },
          title: {
            show: 'اطلاعات سفارش',
            edit: 'ویرایش  سفارش',
            create: 'افزودن شماره',
            index: 'لیست  سفارش ها'
          },
          showRouteName: 'Admin.TeleMarketing.Show',
          editRouteName: 'Admin.TeleMarketing.Edit',
          indexRouteName: 'Admin.TeleMarketing.Index',
          createRouteName: 'Admin.TeleMarketing.Create',
          tableKeys: {
            data: 'data',
            total: 'meta.total',
            currentPage: 'meta.current_page',
            perPage: 'meta.per_page',
            pageKey: 'productPage'
          },
          table: {
            columns: [
              {
                name: 'id',
                required: true,
                label: '#',
                align: 'left',
                field: row => row.id
              },
              {
                name: 'mobile',
                required: true,
                label: 'نام',
                align: 'left',
                field: row => row.id
              },
              {
                name: 'national_code',
                required: true,
                label: 'نام خانوادگی',
                align: 'left',
                field: row => row.id
              },
              {
                name: 'national_code',
                required: true,
                label: 'موبایل',
                align: 'left',
                field: row => row.id
              },
              {
                name: 'national_code',
                required: true,
                label: 'مبلغ (تومان)',
                align: 'left',
                field: row => row.id
              },
              {
                name: 'national_code',
                required: true,
                label: 'پرداخت شده (تومان)',
                align: 'left',
                field: row => row.id
              },
              {
                name: 'national_code',
                required: true,
                label: 'وضعیت سفارش',
                align: 'left',
                field: row => row.id
              },
              {
                name: 'national_code',
                required: true,
                label: 'وضعیت پرداخت',
                align: 'left',
                field: row => row.id
              },
              {
                name: 'actions',
                required: true,
                label: 'عملیات',
                align: 'left',
                field: ''
              }
            ],
            data: []
          }
        }
      },
      defaultInputs: [
        { type: 'input', name: 'name', value: null, label: 'شماره موبایل', col: 'col-md-3' }
      ],
      createInputs: [],
      editInputs: [],
      showInputs: [],
      indexInputs: []
    }
  },
  watch: {
    // editInputs: {
    //   handler (newValue, oldValue) {
    //     console.log('inputs', newValue)
    //   },
    //   deep: true
    // }
  },
  created () {},
  methods: {
    // for index.vue
    getRemoveMessage (row) {
      const firstName = row.first_name
      const lastName = row.last_name
      return 'آیا از حذف ' + firstName + ' ' + lastName + ' اطمینان دارید؟'
    },
    createValue (val, done) {
      // Calling done(var) when new-value-mode is not set or "add", or done(var, "add") adds "var" content to the model
      // and it resets the input textbox to empty string
      // ----
      // Calling done(var) when new-value-mode is "add-unique", or done(var, "add-unique") adds "var" content to the model
      // only if is not already set
      // and it resets the input textbox to empty string
      // ----
      // Calling done(var) when new-value-mode is "toggle", or done(var, "toggle") toggles the model with "var" content
      // (adds to model if not already in the model, removes from model if already has it)
      // and it resets the input textbox to empty string
      // ----
      // If "var" content is undefined/null, then it doesn't tampers with the model
      // and only resets the input textbox to empty string

      if (val.length > 0) {
        if (!this.tags.includes(val)) {
          this.tags.push(val)
        }
        done(val, 'toggle')
      }
    }
  }
}
</script>

<style scoped>

</style>
