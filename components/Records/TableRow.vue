<script setup>
	import { EllipsisHorizontalIcon } from "@heroicons/vue/24/solid";

	const { data, tableConfig } = defineProps(["data", "tableConfig"]);

	const emit = defineEmits(["refreshRecords", "drawerOpen"]);
	const store = tableConfig.store();
	const isRecordSelected = ref(false);
	const rowData = {
		...data,
	};

	const { getCurrentRecordInfo } = tableConfig.currentRecord();
	const { tableTdVisible } = tableConfig.hideComposable();

	watch(isRecordSelected, (newData, oldData) => {
		if (newData === true) store.selectRecord(rowData._id);
		else store.unselectRecord(rowData._id);
	});

	const detailsHandler = (rowData) => {
		getCurrentRecordInfo(rowData);
		emit("drawerOpen");
	};

	const updateRecordHandler = async (event) => {
		const { set: set_data, data, assign_headers, global_store } = event;

		if (set_data && data) {
			console.log(event);

			await store.addField(set_data, data, assign_headers, global_store);

			emit("refreshRecords");
		}
	};

	const deleteRecordHandler = async (data) => {
		console.log(data);
		await store.deleteRecord(data);

		emit("refreshRecords");
	};
</script>

<template>
	<td class="w-4 p-4 rounded-tl-md" scope="row">
		<div class="flex items-center">
			<input
				:id="`checkbox-table-${rowData._id}`"
				type="checkbox"
				v-model="store.selectedRecords"
				:value="rowData._id"
				class="w-5 h-5 text-green-400 rounded-md bg-gray-100 border-gray-300 focus:ring-white focus:ring-0" />
			<label :for="`checkbox-table-${rowData._id}`" class="sr-only"
				>checkbox</label
			>
		</div>
	</td>
	<template v-for="(header, i) in tableConfig.headers" :key="i">
		<td
			v-if="header.is_visible && tableTdVisible[header.name]"
			class="button-open whitespace-nowrap"
			@click="detailsHandler(rowData)">
			<component
				v-if="!header.parent && tableConfig.rowMap.get(header.name)?.component"
				:is="tableConfig.rowMap.get(header.name)?.component"
				:content="rowData[header.field]"
				:image="rowData[header.image_field]"
				:header="header">
			</component>
			<RecordsTableDataDefault
				v-else-if="
					!header.parent && !tableConfig.rowMap.get(header.name)?.component
				"
				:is="tableConfig.rowMap.get(header.name)?.component"
				:content="rowData[header.field]"
				:header="header">
			</RecordsTableDataDefault>

			<component
				v-if="header.parent && tableConfig.rowMap.get(header.name)?.component"
				:is="tableConfig.rowMap.get(header.name)?.component"
				:content="rowData[header.parent]"
				:image="rowData[header.image_field]"
				:header="header">
			</component>
			<RecordsTableDataDefault
				v-else-if="
					header.parent && !tableConfig.rowMap.get(header.name)?.component
				"
				:is="tableConfig.rowMap.get(header.name)?.component"
				:content="rowData[header.parent]"
				:header="header">
			</RecordsTableDataDefault>
		</td>
	</template>
	<template v-for="tab in tableConfig.tab_headers">
		<template v-for="(header, index) in tab?.fields" :key="index">
			<td
				v-if="header.is_visible && tableTdVisible[header.name]"
				class="button-open whitespace-nowrap"
				@click="detailsHandler(rowData)">
				<RecordsTableDataDefault
					v-if="!header.parent"
					:content="rowData[header.field]"
					:header="header">
				</RecordsTableDataDefault>
				<RecordsTableDataDefault
					v-else
					:content="rowData[header.parent]"
					:header="header">
				</RecordsTableDataDefault>
			</td>
		</template>
	</template>
	<td v-if="tableConfig.write" class="px-3 py-4 rounded-tr-md">
		<button
			:id="`recordsMenuDropdownButton-${rowData._id}`"
			:data-dropdown-toggle="`recordsMenuDropdown-${rowData._id}`"
			data-dropdown-placement="left"
			data-dropdown-offset-skidding="20"
			class="hover:bg-gray-300 rounded-full p-1">
			<EllipsisHorizontalIcon class="w-6 h-6" />
		</button>
		<RecordsMenu :id="rowData._id" />

		<RecordsUpdate
			:data="rowData"
			:headers="tableConfig.headers"
			@update-record="updateRecordHandler($event)" />
		<RecordsDelete
			:id="rowData._id"
			:length="1"
			@delete-record="deleteRecordHandler(rowData._id)" />
	</td>
</template>
