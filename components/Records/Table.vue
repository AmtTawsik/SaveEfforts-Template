<script setup>
	import { ChevronUpDownIcon } from "@heroicons/vue/24/solid";
	import draggable from "vuedraggable";
	import { Drawer } from "flowbite";

	const { TABLE_DATA, tableConfig } = defineProps([
		"TABLE_DATA",
		"tableConfig",
	]);

	const emit = defineEmits(["refreshRecords"]);

	const local_headers = ref([...tableConfig.headers]);
	const drawer = ref(null);
	const selectAllRecords = ref(false);

	const store = tableConfig.store();
	const { currRecord } = tableConfig.currentRecord();
	const { grouped } = tableConfig.groupComposable();
	const { tableTdVisible } = tableConfig.hideComposable();

	if (tableConfig?.tab_headers) {
		for (const tab in tableConfig.tab_headers) {
			tableConfig?.tab_headers[tab]?.fields?.forEach((item) => {
				local_headers.value.push(item);
			});
		}
	}
	let byGrouped;

	byGrouped = computed(() => {
		if (!grouped?.value.active) {
			return [];
		}
		return tableConfig.groupMap.get(grouped.value.groupedBy)(
			TABLE_DATA,
			grouped.value.header
		);
	});

	const createDrawer = () => {
		const $drawerElement = document.querySelector("#drawer-right");

		const drawerOptions = {
			placement: "right",
			backdrop: true,
			bodyScrolling: false,
			edge: false,
			edgeOffset: "",
			backdropClasses:
				"bg-gray-900 bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-30",
			onHide: () => {
				currRecord.value = null;
			},
		};

		// create a new modal instance
		if ($drawerElement) {
			drawer.value = new Drawer($drawerElement, drawerOptions);
		}
	};

	onMounted(() => {
		// setup available elements
		createDrawer();
	});

	watch(selectAllRecords, (newVal) => {
		if (newVal) {
			TABLE_DATA.forEach((rec) => {
				store.selectedRecords.push(rec._id);
			});
		} else {
			store.selectedRecords = [];
		}
	});

	const toggleDrawer = () => {
		if (drawer.value) drawer.value.toggle();
		else {
			createDrawer();
			drawer.value.toggle();
		}
	};
</script>
<template>
	<component :is="tableConfig.drawerComponent" :content="tableConfig" />

	<div class="relative overflow-x-auto rounded-md">
		<table
			class="w-full text-sm text-left text-gray-500 border-collapse dark:text-gray-400">
			<thead class="text-sm text-gray-800 bg-white shadow-sm">
				<draggable v-model="local_headers" item-key="id" tag="tr">
					<template #header>
						<th scope="col" class="p-4 rounded-l-md">
							<div class="flex items-center">
								<input
									id="checkbox-all-search"
									type="checkbox"
									v-model="selectAllRecords"
									class="w-5 h-5 text-green-400 rounded-md bg-gray-100 border-gray-300 focus:ring-white focus:ring-0" />
								<label for="checkbox-all-search" class="sr-only"
									>checkbox</label
								>
							</div>
						</th>
					</template>
					<template #item="{ element: header }">
						<th
							v-if="header.is_visible && tableTdVisible[header.name]"
							scope="col"
							class="px-3 py-3 cursor-pointer">
							<div class="flex items-center gap-1">
								<span>{{ header.name }}</span>
								<ChevronUpDownIcon class="w-4 h-4" />
							</div>
						</th>
					</template>
					<template #footer>
						<th
							v-if="tableConfig?.write"
							scope="col"
							class="px-3 py-3 rounded-r-md">
							<div class="flex items-center gap-1">&nbsp;</div>
						</th>
					</template>
				</draggable>
			</thead>

			<tbody v-if="!grouped.active" class="record-tbody">
				<tr
					class="text-base border-b cursor-pointer bg-gray-50 max-xl:text-sm hover:bg-gray-200 hover:border-none min-w-fit"
					:class="currRecord?._id === data?._id ? '!bg-gray-200' : ''"
					v-for="(data, index) in TABLE_DATA">
					<RecordsTableRow
						v-if="data"
						:key="data?._id"
						:data="data"
						:tableConfig="tableConfig"
						@refresh-records="emit('refreshRecords')"
						@drawer-open="toggleDrawer()" />
				</tr>
				<tr
					v-if="store.isAdding"
					class="text-base border-b cursor-pointer bg-gray-50 max-xl:text-sm min-w-fit">
					<RecordsTableRowSkeleton
						:hideComposable="tableConfig.hideComposable" />
				</tr>
			</tbody>
			<tbody v-if="grouped.active" class="record-tbody">
				<tr class="px-4 py-3 col-span-full">
					<td class="text-xl font-semibold text-black">
						{{ grouped.groupedBy }}
					</td>
				</tr>
			</tbody>
			<template v-for="(records, group) in byGrouped" :key="group">
				<tbody v-if="grouped.active" class="record-tbody">
					<tr class="px-4 py-3 col-span-full">
						<td class="text-lg">{{ group }}</td>
					</tr>
				</tbody>
				<draggable
					:list="records"
					:group="{ name: 'records', pull: true, put: true }"
					itemKey="grouped"
					tag="tbody"
					class="record-tbody"
					@change="
						tableConfig.changeGroup(records, $event, grouped.header);
						emit('refreshRecords');
					">
					<template #item="{ element: data, index }">
						<tr
							class="text-base border-b cursor-pointer hover:bg-gray-200 bg-gray-50 max-xl:text-sm min-w-fit">
							<RecordsTableRow
								v-if="data"
								:key="data?._id"
								:data="data"
								:tableConfig="tableConfig"
								@refresh-records="emit('refreshRecords')"
								@drawer-open="toggleDrawer()" />
						</tr>
					</template>
				</draggable>
			</template>
		</table>
	</div>
</template>
