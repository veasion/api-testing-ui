<template>
  <el-dialog title="接口详情" :visible.sync="visible" :append-to-body="true" :modal-append-to-body="true" top="8vh" width="1000px">
    <el-form :model="temp" label-position="left" label-width="110px">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="请求描述" prop="apiDesc">
            <el-input v-model="temp.apiDesc" :disabled="true" size="medium" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="请求方法" prop="method">
            <el-select v-model="temp.method" :disabled="true" placeholder="请选择" @change="changeMethod">
              <el-option v-for="item in methodList" :key="item.method" :label="item.method" :value="item.method" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="所属项目" prop="projectId">
            <el-select v-model="temp.projectId" :disabled="true" filterable placeholder="请选择" class="filter-item">
              <el-option v-for="item in projectList" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="请求url" prop="url">
            <el-input v-model="temp.url" :disabled="true" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="api 命名" prop="apiName">
            <el-input v-model="temp.apiName" :disabled="true" />
          </el-form-item>
        </el-col>
        <el-col v-if="hasBodyMethod(temp.method)" :span="12" prop="contentType">
          <el-form-item label="Content-Type" prop="contentType">
            <el-select v-model="temp.contentType" :disabled="true" placeholder="请选择">
              <el-option v-for="item in contentTypeList" :key="item.contentType" :label="item.contentType" :value="item.contentType" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <!-- 请求头 -->
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="请求头" prop="headersJson">
            <el-input v-model="temp.headersJson" :disabled="true" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div v-if="hasBodyMethod(temp.method)" style="color: #606266;font-size: 14px;margin-bottom: 15px;font-weight: bold;">请求 Body：</div>
    <json-editor v-if="hasBodyMethod(temp.method) && temp.contentType === 'application/json'" ref="jsonEditor" v-model="temp.body" :disabled="true" />
    <text-editor v-else-if="hasBodyMethod(temp.method)" ref="textEditor" v-model="temp.body" :disabled="true" />
  </el-dialog>
</template>

<script>
import { queryByApiName } from '@/api/api-request'
import { list } from '@/api/project'
import JsonEditor from '@/components/JsonEditor'
import TextEditor from '@/components/TextEditor'
export default {
  name: 'ApiView',
  components: { JsonEditor, TextEditor },
  data() {
    return {
      visible: false,
      temp: {
        id: undefined,
        projectId: null,
        apiName: '',
        apiDesc: '',
        method: null,
        url: '',
        contentType: null,
        headersJson: '',
        body: '',
        script: undefined
      },
      projectList: [],
      methodList: [
        { method: 'GET' },
        { method: 'POST' },
        { method: 'PUT' },
        { method: 'PATCH' },
        { method: 'DELETE' }
      ],
      contentTypeList: [
        { contentType: 'application/json' },
        { contentType: 'application/x-www-form-urlencoded' },
        { contentType: 'text/plain' }
      ]
    }
  },
  created() {
    this.init()
  },
  methods: {
    show(apiName, projectId) {
      queryByApiName(apiName, projectId).then(response => {
        this.temp = response.data || {}
      })
      this.visible = true
    },
    init() {
      list({ isAvailable: 1 }).then(response => {
        this.projectList = response.data || []
      })
    },
    hasBodyMethod(method) {
      return method === 'POST' || method === 'PUT' || method === 'PATCH'
    },
    changeMethod() {
      this.temp.contentType = null
      if (this.temp.method === 'GET') {
        this.temp.body = null
      }
    }
  }
}
</script>

<style scoped>

</style>
