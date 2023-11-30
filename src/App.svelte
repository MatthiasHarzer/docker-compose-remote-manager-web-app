<script lang="ts">
  import {get_available_services, ServiceApiEndpoint} from "./api_handler";
  import {onMount} from "svelte";
  import Logs from "./lib/Logs.svelte";
  import ServiceSelect from "./lib/ServiceSelect.svelte";

  const urlParams = new URLSearchParams(window.location.search);

  const service = urlParams.get('service');
  const access_key = urlParams.get('access_key');

  let api_handler = new ServiceApiEndpoint(service ?? "", access_key);

  let running = false;
  let loading = true;
  let available_services: string[] = [];
  let selected_service = service;

  const fetch_status = async () => {
    const was_running = running;
    running = await api_handler.status();

    if (running && !was_running) {
      api_handler.refresh_websocket();
    }
  }

  onMount(async () => {
    available_services = await get_available_services(access_key ?? "");
    await fetch_status();
    loading = false;

    setInterval(fetch_status, 5000);
  });

  $: if (selected_service) {
    api_handler = new ServiceApiEndpoint(selected_service, access_key);
    fetch_status();
    urlParams.set('service', selected_service);
    window.history.replaceState({}, '', `${location.pathname}?${urlParams}`);
  }


  const start = async () => {
    loading = true;
    await api_handler.start();
    running = true;
    loading = false;
    api_handler.refresh_websocket();
  };

  const stop = async () => {
    loading = true;
    await api_handler.stop();
    loading = false;
    running = false;
  };

  const toggle = async () => {
    if (running) {
      const confirmed = confirm("Are you sure you want to stop the service?");
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


      <div class="service-running-state flex-center" class:not-initialized={loading} class:running={running}>
        {#if loading}
          <div class="spinner"/>
        {:else}
          <div class="dot" class:pulsing={running}/>
        {/if}
        <span class="text">{running ? "Running" : "Stopped"}</span>
      </div>

      <button class="clear toggle-running" class:running on:click={toggle}>
      <span class="material-icons">
        power_settings_new
      </span>
        {running ? "Stop" : "Start"}
      </button>
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

  .service-running-state {
    border-radius: 5px;
    padding: 5px 15px;
    background-color: #be392a;

    &.not-initialized {
      background-color: transparent !important;
      border: 1px solid grey;
    }

    &.running {
      background-color: #51b24a;

      .dot {
        animation-name: red_pulsing;
        animation-duration: 1.5s;
        animation-iteration-count: infinite;
      }
    }

    .dot {
      display: inline-block;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background-color: #fff;
      margin-right: 5px;
    }

    .spinner {
      width: 15px;
      height: 15px;
      border: 3px solid #FFF;
      border-bottom-color: transparent;
      border-radius: 50%;
      display: inline-block;
      box-sizing: border-box;
      animation: rotation 1s linear infinite;
      margin-right: 10px;


      @keyframes rotation {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
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

  @keyframes red_pulsing {
    0% {
      background-color: #ff0000;
    }
    50% {
      background-color: #ab4444;
    }
    100% {
      background-color: #ff0000;
    }
  }
</style>
