<script lang="ts">
  import type {ServiceApiEndpoint} from "../api_handler";

  export let api_handler: ServiceApiEndpoint;

  let lines: string[] = [];
  let logs_el: HTMLElement;
  let wrap_lines = true;
  let auto_scroll = true;
  let last_scroll_ts = 0;
  let scroll_timeout: number | undefined;
  let unregister: () => void;

  $: if (api_handler) {
    lines = [];
    unregister && unregister();
    unregister = api_handler.on_log_lines(logs => {
      lines = logs;
    });
  }

  $: logs = lines.join("\n");

  $: if (logs_el && auto_scroll) {
    logs;

    const now = Date.now();

    if (now - last_scroll_ts > 1000) {
      last_scroll_ts = now;
      logs_el.scrollTo({
        top: logs_el.scrollHeight + 10000,
        behavior: 'smooth'
      });
    } else if (!scroll_timeout && logs_el.scrollHeight - logs_el.scrollTop - logs_el.clientHeight < 100) {
      scroll_timeout = setTimeout(() => {
        scroll_timeout = undefined;
        last_scroll_ts = Date.now();
        logs_el.scrollTo({
          top: logs_el.scrollHeight + 10000,
          behavior: 'smooth'
        });
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
