<template>
  <div>
    {{ name }} layout is ready for use!
    <slot></slot>
  </div>
</template>
<script src="./{{ filename }}.js" lang="babel"></script>
<style src="./{{ filename }}.scss" lang="scss"{{ scoped }}></style>

