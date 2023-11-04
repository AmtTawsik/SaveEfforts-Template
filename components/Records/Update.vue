<template>
	<div
		v-if="flag"
		:id="`updateRecord-${recordData._id}`"
		tabindex="-1"
		aria-hidden="true"
		class="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-modal md:h-full">
		<div class="relative p-4 w-full max-w-2xl h-full md:h-auto">
			<!-- Modal content -->
			<div
				class="relative p-4 bg-white rounded-lg shadow dark:bg-gray-800 sm:p-5">
				<!-- Modal header -->
				<div
					class="flex justify-between items-center pb-4 mb-4 rounded-t border-b sm:mb-5 dark:border-gray-600">
					<h3 class="text-xl font-semibold text-gray-900 dark:text-white">
						Edit Record
					</h3>
					<button
						type="button"
						class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
						:data-modal-toggle="`updateRecord-${recordData._id}`">
						<svg
							aria-hidden="true"
							class="w-5 h-5"
							fill="currentColor"
							viewBox="0 0 20 20"
							xmlns="http://www.w3.org/2000/svg">
							<path
								fill-rule="evenodd"
								d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
								clip-rule="evenodd"></path>
						</svg>
						<span class="sr-only">Close modal</span>
					</button>
				</div>
				<!-- Modal body -->
				<form
					id="update-record-form"
					action="#"
					@keypress.enter.prevent
					@submit.prevent="updateRecordHandler()">
					<div class="grid gap-4 mb-8 sm:grid-cols-2">
						<template v-for="(header, i) in headers" :key="i">
							<div class="flex flex-col gap-2" v-if="header.is_update">
								<label
									:for="`update-${header.name}`"
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
									:name="`update-${header.name}`"
									:id="`update-${header.name}`"
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
									:name="`update-${header.name}`"
									:id="`update-${header.name}`"
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
									:name="`update-${header.name}`"
									:id="`update-${header.name}`"
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
									:name="`update-${header.name}`"
									:id="`update-${header.name}`"
									:step="header.step ? header.step : 'any'"
									class="bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
									:placeholder="header.name" />

								<select
									v-else-if="header.parent === null && header.dropdown === true"
									v-model="recordData[header.field]"
									:id="`update-${header.name}`"
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
									:id="`update-${header.name}`"
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
					<button
						type="submit"
						:data-modal-toggle="`updateRecord-${recordData._id}`"
						class="primary-button">
						Update record
					</button>
				</form>
			</div>
		</div>
	</div>
</template>

<script setup>
	import { initModals } from "flowbite";
	import { BSON } from "realm-web";

	const globalStore = useGlobalStore();
	const { data, headers } = defineProps(["data", "headers"]);
	const recordData = ref(null);
	const assign_headers = ref([]);
	const flag = ref(false);

	const emit = defineEmits(["updateRecord"]);

	const addAssignHeader = (__data, header) => {
		header.assigned_value = __data;
		assign_headers.value.push(header);
	};

	const initRecord = () => {
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

		flag.value = true;
	};

	initRecord();

	onBeforeMount(() => {
		initModals();
	});

	const handleAssignDropdown = (__data, header) => {
		console.log(__data, header);
		if (header.is_assign_dropdown && header.parent) {
			recordData.value[header.parent][header.field] = __data;
			recordData.value[header.parent]["assigned_on"] = new Date();
		}
		if (header.is_assign_dropdown && !header.parent) {
			recordData.value[header.field] = __data;
		}
		header.assigned_value = __data;
		// assign_headers.value.push(header);
	};

	const updateRecordHandler = async () => {
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
	};
</script>

<style lang="scss" scoped></style>
