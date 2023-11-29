<script lang="ts">
  import {ServiceApiEndpoint} from "./api_handler";
  import {onMount} from "svelte";

  const urlParams = new URLSearchParams(window.location.search);

  const service = urlParams.get('service');
  const access_key = urlParams.get('access_key');

  const api_handler = new ServiceApiEndpoint(service, access_key);

  let logs: string[] = [];
  let running = false;

  api_handler.on_new_log_line((log_line) => {
    logs = [...logs, log_line];
  });

  setTimeout(async () => {
    running = await api_handler.status();
  }, 5000);

  onMount(async () => {
    running = await api_handler.status();
  });

  let logs_el: HTMLElement;

  $: if (logs_el) {
    logs;
    logs_el.scrollTo({
      top: logs_el.scrollHeight + 10000,
      behavior: 'smooth'
    })
  }

  const start = async () => {
    await api_handler.start();
    running = true;
    api_handler.refresh_websocket();
  };

  const stop = async () => {
    await api_handler.stop();
    running = false;
  };

</script>

<main>
  <div class="header">
    <h1>Manage {service}</h1>
    <p class="status">Status: {running ? 'running' : 'stopped'}</p>
  </div>
  <div class="controls">
    <button class="start" on:click={start}>
      Start
    </button>
    <button class="stop" on:click={stop}>
      Stop
    </button>
  </div>
  <!--  <-->
  <div class="logs">
    <h3>Logs</h3>
    <textarea bind:this={logs_el} class="log-area" readonly>
          {logs.join('\n')}
        </textarea>
  </div>
</main>

<style lang="scss">
  main {
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100%;
  }

  .header {
    flex: 0 0 auto;

    h1 {
      margin-bottom: 0;
    }
  }

  .controls {
    flex: 0 0 auto;
  }

  .logs {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;

    .log-area {
      width: 99%;
      height: 99%;
      resize: none;
    }
  }
</style>
