<script setup>
	import { BSON } from "realm-web";
	import { PencilSquareIcon } from "@heroicons/vue/24/outline";

	const { data, headers, canEdit } = defineProps([
		"data",
		"headers",
		"canEdit",
	]);

	const emit = defineEmits(["updateRecord"]);

	const globalStore = useGlobalStore();
	const isEditing = ref(false);
	const recordData = ref(null);
	const assign_headers = ref([]);

	const editInit = (data) => {
		recordData.value = JSON.parse(JSON.stringify(data));
		recordData.value._id = BSON.ObjectID(recordData.value._id);

		headers.forEach(async (header) => {
			if (header.parent && !recordData.value[header.parent]) {
				recordData.value[header.parent] = {};
			}

			if (header.dropdown && !header.options && header.get_from) {
				const store = globalStore[header.get_from].useStore();

				header.options = [];

				if (store.recordsData === null) {
					await store.initRecordsData().then((data) => {
						data.forEach((item) => {
							header.options.push({
								name: item[header.get_from_field],
								value: JSON.parse(JSON.stringify(item[header.get_from_value])),
							});
						});
					});
				} else {
					store.recordsData.forEach((item) => {
						header.options.push({
							name: item[header.get_from_field],
							value: JSON.parse(JSON.stringify(item[header.get_from_value])),
						});
					});
				}
			}

			if (
				header?.type === "date" &&
				!header?.parent &&
				recordData.value[header.field]
			) {
				let tempDate = new Date(recordData.value[header.field]);

				let date = tempDate.getDate();
				if (date < 10) {
					date = date.toString().padStart(2, "0");
				}

				let month = tempDate.getMonth() + 1;
				if (month < 10) {
					month = month.toString().padStart(2, "0");
				}

				let year = tempDate.getFullYear();

				recordData.value[header.field] = [year, month, date].join("-");
			}
		});

		isEditing.value = true;
	};

	const updateRecordHandler = async (data) => {
		const { currentUser } = useRealmApp();
		// @TODO: Check if data is empty

		let changedFields = [];
		let set_data = {};

		headers.forEach((header) => {
			const parent = header.parent;
			const field = header.field;

			if (header.is_update && !header.parent) {
				if (
					header.type === "date" &&
					data.hasOwnProperty(field) &&
					data[field] !== recordData.value[field]
				) {
					let date1 = new Date(recordData.value[field]);
					let date2 = new Date(data[field]);

					if (date1.getTime() !== date2.getTime()) {
						changedFields.push({
							type: "edited",
							field: field,
							before: data[field],
							after: recordData.value[field],
						});
						set_data[field] = recordData.value[field];

						data[field] = date1;
					}
				} else if (
					data.hasOwnProperty(field) &&
					data[field] !== recordData.value[field]
				) {
					changedFields.push({
						type: "edited",
						field: field,
						before: data[field],
						after: recordData.value[field],
					});
					set_data[field] = recordData.value[field];
					data[field] = recordData.value[field];
					if (header.is_assign_dropdown) {
						console.log(header.field);
						addAssignHeader(recordData.value[field], header);
					}
				} else if (
					!data.hasOwnProperty(field) &&
					recordData.value[field] &&
					recordData.value[field] !== ""
				) {
					changedFields.push({
						type: "added",
						field: field,
						before: null,
						after: recordData.value[field],
					});

					data[field] = recordData.value[field];
					set_data[field] = recordData.value[field];

					if (header.is_assign_dropdown) {
						console.log(header.field);
						addAssignHeader(recordData.value[field], header);
					}
				}
			} else if (header.is_update && header.parent) {
				if (!data[parent]) data[parent] = {};
				if (!set_data[parent]) set_data[parent] = {};

				if (header.type === "date") {
					let date1 = new Date(recordData.value[parent][field]);
					let date2 = new Date(data[parent][field]);

					if (date1.getTime() !== date2.getTime()) {
						changedFields.push({
							type: "edited",
							field: `${parent}.${field}`,
							before: data[parent][field],
							after: recordData.value[parent][field],
						});
						data[parent][field] = date1;
						set_data[parent][field] = date1;
					}
				} else if (
					data[parent]?.hasOwnProperty(field) &&
					data[parent][field] !== recordData.value[parent][field]
				) {
					changedFields.push({
						type: "edited",
						field: `${parent}.${field}`,
						before: data[parent][field],
						after: recordData.value[parent][field],
					});
					data[parent][field] = recordData.value[parent][field];
					set_data[parent] = recordData.value[parent];
					if (header.is_assign_dropdown)
						addAssignHeader(recordData.value[parent][field], header);
				} else if (
					!data[parent]?.hasOwnProperty(field) &&
					recordData.value[parent][field] &&
					recordData.value[parent][field] !== ""
				) {
					changedFields.push({
						type: "added",
						field: `${parent}.${field}`,
						before: null,
						after: recordData.value[parent][field],
					});
					data[parent][field] = recordData.value[parent][field];
					set_data[parent] = recordData.value[parent];
					if (header.is_assign_dropdown)
						addAssignHeader(recordData.value[parent][field], header);
				}
			}

			if (header.combine) {
				recordData.value[field] = "";
				header.combine?.forEach((item) => {
					console.log(recordData.value[item]);
					recordData.value[field] = recordData.value[field].concat(
						" ",
						recordData.value[item]
					);
				});

				if (recordData.value[field] !== data[field]) {
					changedFields.push({
						type: "edited",
						field: field,
						before: data[field],
						after: recordData.value[field],
					});
					set_data[field] = recordData.value[field];
					data[field] = recordData.value[field];
				}
			}
		});

		console.log(changedFields);

		if (!data.update_logs || data.update_logs.length === 0)
			data.update_logs = [];

		if (changedFields.length > 0) {
			data.update_logs.push({
				fields: changedFields,
				updated_at: new Date(),
				updated_by: currentUser?.id,
			});

			set_data.update_logs = data.update_logs;
			console.log(set_data, data);

			emit("updateRecord", {
				set: set_data,
				data: data,
				assign_headers: assign_headers.value,
				globalStore: globalStore,
			});
		}

		isEditing.value = false;
	};
</script>

<template>
	<div v-if="data" class="flex flex-col gap-4">
		<div class="rounded border border-slate-300">
			<div
				class="flex justify-between items-center px-4 py-2 border-b border-b-slate-300">
				<h3 class="text-sm font-semibold">Basic Information</h3>
				<button
					v-if="canEdit === true"
					@click="editInit(data)"
					class="flex gap-1 items-center">
					<PencilSquareIcon class="w-6 h-6 text-slate-700" />
					<span class="text-sm text-slate-700 font-normal max-lg:hidden"
						>Edit Info</span
					>
				</button>
			</div>

			<div v-if="!isEditing" class="p-4 grid grid-auto-box gap-4">
				<template v-for="(header, index) in headers" :key="index">
					<div v-if="header.is_visible">
						<span class="text-slate-500 text-sm font-medium">{{
							header.name
						}}</span>
						<p
							v-if="!header.parent && data[header.field]"
							class="text-sm font-semibold text-gray-700">
							{{ data[header.field] }}
						</p>
						<p
							v-else-if="header.parent && data[header.parent]"
							class="text-sm font-semibold text-gray-700">
							{{ data[header.parent][header.field] }}
						</p>

						<p v-else class="text-sm font-semibold text-gray-700">-</p>
					</div>
				</template>
			</div>
			<form
				v-else
				id="details-tab-record-form"
				action="#"
				class="flex flex-col p-4 gap-4"
				@submit.prevent="updateRecordHandler(data)">
				<div class="grid grid-auto-box gap-4">
					<template v-for="(header, i) in headers" :key="i">
						<div v-if="header.is_update" class="flex flex-col gap-2">
							<label
								:for="`detail-tab-${header.name}`"
								class="block text-base font-medium text-gray-900 dark:text-white"
								>{{ header.name }}</label
							>

							<InputChip
								v-if="header.type === 'chips'"
								:fieldValue="recordData[header.field]"
								@change="recordData[header.field] = $event" />

							<InputAssignDropdown
								v-else-if="header.is_assign_dropdown"
								:fieldValue="recordData[header.field]"
								:header="header"
								prefix="update"
								@change="handleAssignDropdown($event, header)" />

							<InputCompanyDropdown
								v-else-if="header.is_company_dropdown"
								:fieldValue="recordData[header.field]"
								:header="header"
								prefix="update"
								@change="recordData[header.field] = $event" />

							<InputAddressDropdown
								v-else-if="header.is_address_dropdown"
								:fieldValue="recordData[header.field]"
								:header="header"
								prefix="update"
								@change="recordData[header.field] = $event" />

							<textarea
								v-else-if="
									header.parent === null &&
									header.dropdown === false &&
									header.type === 'textarea'
								"
								v-model="recordData[header.field]"
								:type="header.type"
								:name="`detail-tab-${header.name}`"
								:id="`detail-tab-${header.name}`"
								class="bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
								:placeholder="header.name" />
							<textarea
								v-else-if="
									header.parent !== null &&
									header.dropdown === false &&
									header.type === 'textarea' &&
									!isNullOrUndefined(recordData[header.parent])
								"
								v-model="recordData[header.parent][header.field]"
								:type="header.type"
								:name="`detail-tab-${header.name}`"
								:id="`detail-tab-${header.name}`"
								class="bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
								:placeholder="header.name" />
							<input
								v-else-if="
									header.parent === null &&
									header.dropdown === false &&
									header.type !== 'textarea'
								"
								v-model="recordData[header.field]"
								:type="header.type"
								:name="`detail-tab-${header.name}`"
								:id="`detail-tab-${header.name}`"
								:step="header.step ? header.step : 'any'"
								class="bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
								:placeholder="header.name" />
							<input
								v-else-if="
									header.parent !== null &&
									header.dropdown === false &&
									header.type !== 'textarea' &&
									!isNullOrUndefined(recordData[header.parent])
								"
								v-model="recordData[header.parent][header.field]"
								:type="header.type"
								:name="`detail-tab-${header.name}`"
								:id="`detail-tab-${header.name}`"
								:step="header.step ? header.step : 'any'"
								class="bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
								:placeholder="header.name" />

							<select
								v-else-if="header.parent === null && header.dropdown === true"
								v-model="recordData[header.field]"
								:id="`detail-tab-${header.name}`"
								class="bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500">
								<option value="" disabled>Select {{ header.name }}</option>
								<option
									v-for="(opt, index) in header.options"
									:key="index"
									:value="opt.value">
									{{ opt.name }}
								</option>
							</select>
							<select
								v-else-if="
									header.parent !== null &&
									header.dropdown === true &&
									!isNullOrUndefined(recordData[header.parent])
								"
								v-model="recordData[header.parent][header.field]"
								:id="`detail-tab-${header.name}`"
								class="bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500">
								<option value="" disabled>Select {{ header.name }}</option>
								<option
									v-for="(opt, index) in header.options"
									:key="index"
									:value="opt.value">
									{{ opt.name }}
								</option>
							</select>
						</div>
					</template>
				</div>
				<div class="flex gap-4">
					<button
						data-modal-toggle="addRecord"
						type="submit"
						class="primary-button-sm">
						Update
					</button>
					<button
						@click="isEditing = false"
						data-modal-toggle="addRecord"
						type="button"
						class="secondary-button-sm">
						Cancel
					</button>
				</div>
			</form>
		</div>
	</div>
</template>

<style>
	.grid-auto-box {
		grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
	}
</style>
