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
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
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
    {#each lines as [name, time, log]}
      <div class="log-line">
        {#if $show_timestamps}
          <div class="log-time">[{format_time(time)}]</div>
        {/if}
        {#if name === "system"}
          <svg class="log-icon" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M480-320q17 0 28.5-11.5T520-360q0-17-11.5-28.5T480-400q-17 0-28.5 11.5T440-360q0 17 11.5 28.5T480-320Zm-40-120h80v-200h-80v200ZM370-80l-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80H370Zm70-80h79l14-106q31-8 57.5-23.5T639-327l99 41 39-68-86-65q5-14 7-29.5t2-31.5q0-16-2-31.5t-7-29.5l86-65-39-68-99 42q-22-23-48.5-38.5T533-694l-13-106h-79l-14 106q-31 8-57.5 23.5T321-633l-99-41-39 68 86 64q-5 15-7 30t-2 32q0 16 2 31t7 30l-86 65 39 68 99-42q22 23 48.5 38.5T427-266l13 106Zm40-320Z"/></svg>
        {/if}
        <div class="log-name" style="color: {get_service_color(name)}">
          {name}<span class="divider">|</span>
        </div>

        <div class="log-text">{log}</div>
      </div>
    {/each}
  </div>
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

      .log-icon {
        color: #d9d9d9;
        height: 1.3rem;
      }

      .log-name {
        font-weight: bold;

        .divider {
          margin: 0 0.2rem;
        }
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
