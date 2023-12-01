<script lang="ts">
  import type {Service} from "../api_handler";

  export let available_services: Service[] = [];
  export let selected_service: Service | null = null;
</script>


<select bind:value={selected_service} class="select">
  {#each available_services as service}
    <option value={service}>{service.name}</option>
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



