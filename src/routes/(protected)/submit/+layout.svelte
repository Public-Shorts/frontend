<script lang="ts">
  import '../../../app.css';

  let { children } = $props()

  let i = $state(0)

  const progress = () => i++

  let unlocked = $derived(i > 7)
</script>

{#if unlocked}
  {@render children()}
{:else}
<div class="relative">
  <button class="fixed bottom-2 left-2 text-white" onclick={progress}>
    Datenschutz
  </button>
</div>
{/if}
