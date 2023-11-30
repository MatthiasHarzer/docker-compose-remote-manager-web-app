<script lang="ts">
  import {AccessKeyScope, get_available_services, ServiceApiEndpoint} from "./api_handler";
  import {onMount} from "svelte";
  import Logs from "./lib/Logs.svelte";
  import ServiceSelect from "./lib/ServiceSelect.svelte";
  import Status from "./lib/Status.svelte";

  const urlParams = new URLSearchParams(window.location.search);

  const service = urlParams.get('service');
  const access_key = urlParams.get('access_key');

  let api_handler = new ServiceApiEndpoint(service ?? "", access_key);

  let running = false;
  let loading = true;
  let available_services: string[] = [];
  let available_scopes: AccessKeyScope[] = [];
  let selected_service = service;
  let status: Status | null = null;


  onMount(async () => {
    const response = await get_available_services(access_key ?? "");
    available_services = response.services;
    available_scopes = response.scopes;
    loading = false;
  });

  $: if (selected_service) {
    api_handler = new ServiceApiEndpoint(selected_service, access_key);
    urlParams.set('service', selected_service);
    window.history.replaceState({}, '', `${location.pathname}?${urlParams}`);
  }

  $: has_manage_scope = available_scopes.includes(AccessKeyScope.MANAGE);
  $: has_view_status_scope = available_scopes.includes(AccessKeyScope.STATUS) || has_manage_scope;
  $: has_view_logs_scope = available_scopes.includes(AccessKeyScope.LOGS) || has_manage_scope;

  const start = async () => {
    loading = true;
    await api_handler.start();
    await status?.fetch_status();
    loading = false;
    api_handler.refresh_websocket();
  };

  const stop = async () => {
    loading = true;
    await api_handler.stop();
    await status?.fetch_status();
    loading = false;
  };

  const toggle = async () => {
    if (running) {
      const confirmed = confirm(`Are you sure you want to stop the '${selected_service}' service?`);
      confirmed && await stop();
    } else {
      await start();
    }
  };
</script>

<main>
  <div class="app-bar">
    <div class="title">
      <ServiceSelect available_services={available_services} bind:selected_service/>
    </div>
    <div class="app-bar-right">


      {#if has_view_status_scope}
        <Status
            api_handler={api_handler}
            bind:running
            bind:this={status}
            loading={loading}
        />
      {/if}

      {#if has_manage_scope}
        <button class="clear toggle-running" class:running on:click={toggle}>
        <span class="material-icons">
          power_settings_new
        </span>
          {running ? "Stop" : "Start"}
        </button>
      {/if}
    </div>
  </div>
  <div class="logs">
    <Logs api_handler={api_handler}/>
  </div>
</main>

<style lang="scss">
  main {
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100%;

    .app-bar {
      flex: 0 0 auto;
      overflow: hidden;
      height: 54px;
      box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2),
      0 6px 20px 0 rgba(0, 0, 0, 0.19);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1rem;

      .title {
        margin: 0;
        padding: 0 0 0 10px;
        line-height: 54px;
        font-size: 24px;
        font-weight: 550;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .app-bar-right {
        display: flex;
        align-items: center;
      }
    }
  }


  .toggle-running {
    background-color: #262626;
    border: 1px solid #525252;
    color: white;
    border-radius: 5px;
    margin-left: 15px;

    display: flex;
    align-items: center;
    justify-content: space-between;

    padding: 0.2rem 0.5rem;

    .material-icons {
      margin-right: 0.5rem;
    }

    &.running {
      .material-icons {
        color: #e34d3c;
      }

      //background-color: #be392a;
    }
  }

  .logs {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
  }


</style>
