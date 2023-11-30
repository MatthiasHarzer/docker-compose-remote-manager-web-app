<script lang="ts">
  import type {ServiceApiEndpoint} from "../api_handler";
  export let api_handler: ServiceApiEndpoint;

  let lines: string[] = [];
  let first_load = true;
  let logs_el: HTMLElement;
  let wrap_lines = true;
  let auto_scroll = true;

  $: if (api_handler) {
    lines = [];
    api_handler.on_log_lines(logs => {
      lines = logs;
    });
  }

  $: logs = lines.join("\n");

  $: if (logs_el && auto_scroll) {
    logs;
    logs_el.scrollTo({
      top: logs_el.scrollHeight + 10000,
      behavior: first_load ? 'auto' : 'smooth'
    });

    if (first_load) {
      setTimeout(() => {
        first_load = false;
      }, 1000);
    }
  }
</script>

<div class="main">
  <div class="title">
    <h3>Logs</h3>
    <div class="config-select">
      <div class="cb-item">

        <input bind:checked={wrap_lines} id="wrap-lines" type="checkbox"/>
        <label for="wrap-lines">Wrap lines</label>
      </div>
      <div class="cb-item">
        <input bind:checked={auto_scroll} id="auto-scroll" type="checkbox"/>
        <label for="auto-scroll">Auto scroll</label>
      </div>
    </div>
  </div>
  <textarea bind:this={logs_el} class="logs" class:wrap-lines={wrap_lines} readonly>
    {logs}
  </textarea>
</div>

<style lang="scss">
  .main {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .title {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 1rem;
    //height: 10%;
    border-bottom: 1px solid var(--color-border);

    h3 {
      margin: 0;
    }

    .config-select {
      display: flex;
      flex-direction: row;
      align-items: center;

      > * {
        margin-left: 1rem;
      }
    }

    .cb-item {
      display: flex;
      flex-direction: row;
      align-items: center;

      input {
        margin-right: 0.5rem;
        margin-bottom: 2px;
        width: 1rem;
        height: 1rem;
      }

      label {
        user-select: none;
      }
    }
  }

  .logs {
    flex: 1;
    width: 100%;
    height: 10%;
    resize: none;
    //border: none;
    margin-bottom: 0;


    &.wrap-lines {
      white-space: pre-wrap;
    }

    white-space: pre;
  }

</style>
