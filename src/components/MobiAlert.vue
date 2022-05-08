<template lang="pug">
el-alert(title="Mobi is not fully supported" type="warning" description="Problems: Index/TOC, Text encoding; Image inserting" show-icon :closable="false")
el-alert(title="未能完全支持 Mobi 格式" type="warning" description="潜在问题: 目录错乱；文字编码错误；图片插入失败……" show-icon :closable="false")
el-alert(title="Mobi is edited in a single html" type="info" description="File will be saved as mobi(6th version), without the KF8 parts" show-icon :closable="false")
el-alert(title="您将在单一 HTML 文件中编辑 Mobi 文本" type="info" description="保存格式为 6 代 Mobi 文件, 不包括 KF8 部分" show-icon :closable="false")
</template>

<script lang="ts" setup>
</script>

<style scoped>
.el-alert{
  margin-bottom: 10px;
}
</style>
