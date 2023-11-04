<template>
	<div class="px-3 py-4 max-w-xs">
		<template v-if="header?.parent">
			<p
				v-if="content && content[header.field] && header.get_from && fromRecord"
				class="text-black truncate">
				{{ fromRecord[header.get_from_field] }}
			</p>
			<p
				v-else-if="content && content[header.field] && !header.get_from"
				class="text-black truncate">
				{{ content[header.field] }}
			</p>
			<p v-else class="text-black truncate italic">Empty</p>
		</template>

		<template v-else>
			<p
				v-if="content && header.get_from && fromRecord"
				class="text-black truncate">
				{{ fromRecord[header.get_from_field] }}
			</p>
			<p v-else-if="content && !header.get_from" class="text-black truncate">
				{{ content }}
			</p>
			<p v-else class="text-black truncate italic">Empty</p>
		</template>
	</div>
</template>

<script setup>
	const { content, header, image } = defineProps([
		"content",
		"header",
		"image",
	]);
	const globalStore = useGlobalStore();
	const fromRecord = ref(null);

	let fromStore;

	if (content && header?.get_from) {
		fromStore = globalStore[header.get_from].useStore();
		await fromStore.initRecordsData();

		if (header.parent && header && content[header.field]) {
			fromRecord.value = await fromStore.findById(content[header.field]);
		} else {
			fromRecord.value = await fromStore.findById(content);
		}
	}
</script>
