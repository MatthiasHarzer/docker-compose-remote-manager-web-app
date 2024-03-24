<script lang="ts">
  import type {ServiceApiEndpoint} from "../api_handler";
  import {local_storage_memo} from "../local_storage_memo";

  export let api_handler: ServiceApiEndpoint;

  let lines: string[][] = [];
  let logs_el: HTMLElement;
  let unregister: () => void;
  const material_color_pallet = [
    "#a371bb",
    "#6196d3",
    "#71ad71",
    "#c76666",
    "#53afaf",
    "#9d7fbe",
    "#d77e58",
    "#cc7b9c",
    "#518f48",
  ];

  $: wrap_lines = local_storage_memo('wrap_lines', true);
  $: auto_scroll = local_storage_memo('auto_scroll', true);
  $: show_timestamps = local_storage_memo('show_timestamps', true);

  $: if (api_handler) {
    lines = [];
    unregister && unregister();
    unregister = api_handler.on_log_lines(logs => {
      lines = logs.filter(l => l !== null);

      if (logs_el && $auto_scroll){
        setTimeout(()=>{
          logs_el.scrollTo({
            top: logs_el.scrollHeight + 10000,
          });
        }, 1);
      }
    });
  }


  const format_time = (time: string): string => {
    function pad(num: number | string, size: number = 2): string {
      num = num.toString();
      while (num.length < size) num = "0" + num;
      return num;
    }

    const date = new Date(time.trim());
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate() + 1)} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }
  const get_service_color = (name: string): string => {
    const hash = name.split("").reduce((acc, char) => {
      acc = ((acc << 5) - acc) + char.charCodeAt(0);
      return acc & acc;
    }, 0);

    return material_color_pallet[Math.abs(hash) % material_color_pallet.length];
  }


</script>

<div class="main">
  <div class="title">
    <h3>Logs <span class="num-lines">({lines.length} lines)</span></h3>
    <div class="config-select">
      <div class="cb-item">

        <input bind:checked={$wrap_lines} id="wrap-lines" type="checkbox"/>
        <label for="wrap-lines">Wrap lines</label>
      </div>
      <div class="cb-item">
        <input bind:checked={$auto_scroll} id="auto-scroll" type="checkbox"/>
        <label for="auto-scroll">Auto scroll</label>
      </div>
      <div class="cb-item">
        <input bind:checked={$show_timestamps} id="show-timestamps" type="checkbox"/>
        <label for="show-timestamps">Show timestamps</label>
      </div>
    </div>
  </div>
  <div bind:this={logs_el} class="logs" class:wrap-lines={$wrap_lines}>
    {#each lines as [name, time, log] (time)}
      <div class="log-line">
        {#if $show_timestamps}
          <div class="log-time">[{format_time(time)}]</div>
        {/if}
        <div class="log-name" style="color: {get_service_color(name)}">{name}<span>|</span></div>

        <div class="log-text">{log}</div>
      </div>
    {/each}
  </div>
</div>

<style lang="scss">
  .main {
    //flex: 1 1 auto;
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

      .num-lines {
        font-weight: normal;
      }
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
    flex: 1 auto;
    width: 100%;
    height: 10%;
    resize: none;
    overflow: auto;
    //border: none;
    border-radius: 3px;
    background-color: #3B3B3B;
    border: 1px solid #d9d9d9;
    margin-bottom: 0;
    font-family: "Sono", monospace;

    .log-line {
      display: flex;
      flex-direction: row;
      padding: 0 5px 5px 5px;


      & > *:not(:first-child) {
        margin-left: 0.2rem;
      }

      .log-time {
        color: #b0b4ff;
      }

      .log-name {
        font-weight: bold;
      }

      .log-text {
        flex: 1 1 auto;
      }
    }


    &.wrap-lines .log-text {
      white-space: pre-wrap;
      word-break: break-all;
    }

    white-space: pre;
  }

</style>
