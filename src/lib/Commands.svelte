<script lang="ts">
  import {type Service, ServiceApiEndpoint} from "../api_handler";
  import {onMount} from "svelte";

  export let service: Service;
  export let api_handler: ServiceApiEndpoint;

  let selected_command_id: string = "";
  let command_input: string = "";

  $: has_commands = Object.keys(service.commands).length > 0;

  const run_command = async () => {
    if (!selected_command_id) return;

    await api_handler.run_command(selected_command_id, command_input);
    command_input = "";
  }

  const run_command_keydown = (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      run_command();
    }
  }

  $: if(selected_command_id) {
    localStorage.setItem('selected_command_id', selected_command_id);
  }

  onMount(()=>{
    if (service.commands.length > 0) {
      selected_command_id = localStorage.getItem('selected_command_id') ?? service.commands[0].id;
    }
  })

</script>

{#if has_commands}
  <div class="commands">
    <select class="command-select" bind:value={selected_command_id}>
      {#each service.commands as command}
        <option value={command.id}>{command.sub_service} - {command.label}</option>
      {/each}
    </select>
    <input class="command-input" bind:value={command_input} on:keydown={run_command_keydown} />
    <button class="command-run" on:click={run_command}>Run</button>
  </div>
{/if}

<style lang="scss">
  .commands {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem;
    border-bottom: 1px solid #ccc;
  }

  .command-select {
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 0.25rem;
    margin: 0 0.5rem;
  }

  .command-input {
    height: 100%;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 0.25rem;
    flex: 1;
    margin: 0 0.5rem;
  }

  .command-run {
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 0.25rem;
    margin: 0 0.5rem;
  }

</style>