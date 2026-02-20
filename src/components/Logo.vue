<template>
	<div class="logo-content">
		<div class="logo-text">TaskOps</div>
		<div class="logo-sub">Suivi Hebdomadaire</div>
	</div>
</template>

<script setup></script>

<style scoped>
.logo-content {
  overflow: hidden;
  white-space: nowrap;
  padding-left: 12px;
  transition: opacity var(--sidebar-transition);
}

.logo-text {
  font-family: var(--mono);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: var(--accent);
  text-transform: uppercase;
}

.logo-sub {
  font-size: 10px;
  color: var(--text2);
  margin-top: 2px;
  letter-spacing: 0.04em;
}
</style>