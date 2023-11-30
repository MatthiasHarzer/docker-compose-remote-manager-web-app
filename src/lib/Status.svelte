<script lang="ts">

  import type {ServiceApiEndpoint} from "../api_handler";
  import {onDestroy, onMount} from "svelte";

  export let api_handler: ServiceApiEndpoint | null = null;
  export let loading = false;
  export let running: boolean = false;

  let interval: number | null = null;

  export const fetch_status = async () => {
    const was_running = running;
    running = await api_handler?.status() ?? false;

    if (running && !was_running) {
      api_handler?.refresh_websocket();
    }
  }

  $: if(api_handler) {
    fetch_status();
  }

  onMount(()=>{
    interval = setInterval(fetch_status, 5000);
  })
  onDestroy(()=>{
    interval && clearInterval(interval);
  })

</script>

<div class="service-running-state flex-center" class:not-initialized={loading} class:running={running}>
  {#if loading}
    <div class="spinner"/>
  {:else}
    <div class="dot" class:pulsing={running}/>
  {/if}
  <span class="text">{running ? "Running" : "Stopped"}</span>
</div>

<style lang="scss">
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
