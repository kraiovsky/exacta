<main>
  <div class="head">
    <div class="left">
      <a href="#run" class:disabled={benchmarkIsRunning} on:click={startBenchmark}>
        start benchmark
      </a>
    </div>
    <div class="middle">exacta demo</div>
    <div class="right"><a href="https://github.com/kraiovsky/exacta">github</a></div>
  </div>
  <pre bind:this={pre}>{consoleBuffer}</pre>
</main>
<style>
   main { display: flex; height: 100%; width: 41em; margin: auto; flex-direction: column; }
   .head { display: flex; justify-content: space-between; align-content: stretch; padding: 0.5em }
   .head > .left { flex-basis: 8em; }
   .head > .right { flex-basis: 9em; text-align: right; }
   .head .middle { text-align: center; }
   main > div { border: solid 1px grey; }
   a.disabled { color: black; }
   a.disabled:hover { text-decoration: none; cursor: default; }
   pre { flex-grow: 1; overflow-y: scroll; white-space: pre-wrap; margin: 0; border: solid 1px grey; border-top: none; padding: 0.5em;}
 </style>
<script>

  import Race from '../../';
  import { afterUpdate } from 'svelte';

  function sleep(millisec = 0) {
    return new Promise((resolve, reject) => {
      setTimeout(_ => resolve(), millisec);
    });
  };

  let pre;
  let consoleBuffer = '';
  const htmlConsole = {};
  htmlConsole.log = async str => {
    consoleBuffer += (str + '\n');
    await sleep(10); // give svelte some time to render (unblock the JS event loop)
  };
  afterUpdate(() => {
    pre.scrollBy({ top: 1000 });
  });

  function getFn(n = 1) {
    const runs = 20 * n;
    return async function cpuburn() {
      await sleep(4 * n * Math.random());
      return (
        Array.from({ length: runs })
          .map(_ => Math.random())
          .reduce((a, v) => (a + v), 0)
      ) / runs;
    }
  }

  let benchmarkIsRunning = false;
  async function startBenchmark() {

    if (benchmarkIsRunning) return;

    benchmarkIsRunning = true;
    //consoleBuffer = 'benchmark started ...\n';
    consoleBuffer = '';
    await sleep(10);

    await new Race()
      .setConsole(htmlConsole)
      .setRuns(50)
      .setSamples(20)
      .setWarmup(500)
      //.addFn(getFn(0))
      .addFn(getFn(2))
      .addFn(getFn(3))
      //.setParams(data, options)
      .run()
    ;

    benchmarkIsRunning = false;
  }

</script>
