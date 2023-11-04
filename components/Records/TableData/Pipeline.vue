<template>
	<div v-if="content && header" class="px-2 py-3">
		<div
			class="flex items-center px-3 py-2 max-lg:p-[.1rem] -skew-x-12 bg-green-500 text-white w-fit">
			<span class="skew-x-12">
				{{ header.stages[content.current_stage] }}
			</span>
		</div>
	</div>
</template>

<script setup>
	const { content, header } = defineProps(["content", "header"]);
</script>
