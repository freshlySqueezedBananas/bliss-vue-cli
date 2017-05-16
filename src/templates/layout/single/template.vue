<template>
  <div>
    {{ name }} layout is ready for use!
    <slot></slot>
  </div>
</template>
<script lang="babel">
  /* ============
   * {{ name }} Layout
   * ============
   *
   * todo: add documentation here!
   */

  export default {
    mounted() {
      console.log('{{ name }} layout has been mounted!');
    },
  };
</script>

<style lang="scss"{{ scoped }}></style>
