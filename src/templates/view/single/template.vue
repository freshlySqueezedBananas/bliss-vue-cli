<template>
  <div>
    {{ name }} page is ready for use!
  </div>
</template>
<script lang="babel">
  /* ============
   * {{ name }} Page
   * ============
   *
   * todo: add documentation here!
   */

  export default {
    mounted() {
      console.log('{{ name }} page has been mounted!');
    },
  };
</script>
