<template>
  <div>
    {{ name }} component is ready for use!
  </div>
</template>

<script lang="babel">
  /* ============
   * {{ name }} Component
   * ============
   *
   * todo: add documentation here!
   */

  export default {
    mounted() {
      console.log('{{ name }} component has been mounted!');
    },
  };
</script>

<style lang="scss"{{ scoped }}></style>
