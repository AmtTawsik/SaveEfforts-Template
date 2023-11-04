<script setup>
	import {
		ChevronDownIcon,
		ChevronLeftIcon,
		ChevronRightIcon,
	} from "@heroicons/vue/24/solid";

	const { totalPages, currentPage, pageStep } = defineProps([
		"totalPages",
		"currentPage",
		"pageStep",
	]);

	const emit = defineEmits(["change", "changeStep"]);
</script>

<template>
	<nav v-if="totalPages > 1" aria-label="Page navigation example">
		<ul class="inline-flex items-center gap-4 -space-x-px">
			<li v-if="currentPage > 1">
				<button
					@click="emit('change', currentPage - 1)"
					class="flex items-center text-gray-500">
					<ChevronLeftIcon class="w-5 h-5 max-xl:w-4 max-xl:h-4" />
					<p
						class="py-2 pl-1 pr-2 ml-0 text-base leading-tight rounded-l-lg hover:text-gray-700 max-xl:text-sm">
						Prev
					</p>
				</button>
			</li>

			<li v-if="currentPage - 2 > 0">
				<button
					@click="emit('change', currentPage - 2)"
					class="px-2 py-1 font-medium leading-tight rounded-full hover:bg-yellow-400 max-xl:text-sm">
					{{ currentPage - 2 }}
				</button>
			</li>
			<li v-if="currentPage - 1 > 0">
				<button
					@click="emit('change', currentPage - 1)"
					class="px-2 py-1 font-medium leading-tight rounded-full hover:bg-yellow-400 max-xl:text-sm">
					{{ currentPage - 1 }}
				</button>
			</li>
			<li>
				<button
					class="px-2 py-1 font-medium leading-tight rounded-full bg-yellow-300 hover:bg-yellow-400 max-xl:text-sm">
					{{ currentPage }}
				</button>
			</li>
			<li v-if="currentPage + 1 < totalPages">
				<button
					@click="emit('change', currentPage + 1)"
					class="px-2 py-1 font-medium leading-tight rounded-full hover:bg-yellow-400 max-xl:text-sm">
					{{ currentPage + 1 }}
				</button>
			</li>
			<li v-if="currentPage + 2 < totalPages">
				<button
					@click="emit('change', currentPage + 2)"
					class="px-2 py-1 font-medium leading-tight rounded-full hover:bg-yellow-400 max-xl:text-sm">
					{{ currentPage + 2 }}
				</button>
			</li>
			<li v-if="totalPages - 3 > currentPage">
				<a
					class="px-2 py-1 font-medium leading-tight rounded-full hover:bg-yellow-400 max-xl:text-sm"
					>...</a
				>
			</li>
			<li v-if="currentPage !== totalPages">
				<button
					@click="emit('change', totalPages)"
					class="px-2 py-1 font-medium leading-tight rounded-full hover:bg-yellow-400 max-xl:text-sm">
					{{ totalPages }}
				</button>
			</li>

			<li v-if="currentPage < totalPages">
				<button
					@click="emit('change', currentPage + 1)"
					class="flex items-center text-gray-500">
					<p
						class="py-2 pl-1 pr-2 ml-0 text-base leading-tight rounded-l-lg hover:text-gray-700 max-xl:text-sm">
						Next
					</p>
					<ChevronRightIcon class="w-5 h-5 max-xl:w-4 max-xl:h-4" />
				</button>
			</li>
		</ul>
	</nav>
</template>
