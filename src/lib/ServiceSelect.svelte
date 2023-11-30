<script lang="ts">
  export let available_services: string[] = [];
  export let selected_service: string | null = null;
</script>


<select bind:value={selected_service} class="select">
  {#each available_services as service}
    <option value={service}>{service}</option>
  {/each}
  {#if selected_service === null}
    <option value={null}>Select a service</option>
  {/if}
</select>

<style lang="scss">
  .select {
    background-color: transparent;
    border: none;

    option {
      background-color: #313131;
      color: #fff;
    }
  }
</style>



