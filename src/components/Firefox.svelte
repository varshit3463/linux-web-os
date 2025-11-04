<script>
  let firefoxUrl = 'http://localhost:5800'
</script>

<div class="firefox-container" on:contextmenu|stopPropagation>
  <iframe src={firefoxUrl} title="Firefox Browser" class="firefox-iframe"></iframe>
</div>
