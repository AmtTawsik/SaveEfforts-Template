<template>
	<div
		id="addRecord"
		tabindex="-1"
		aria-hidden="true"
		class="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-modal md:h-full">
		<div class="relative p-4 w-full max-w-4xl h-full md:h-auto">
			<!-- Modal content -->
			<div
				class="relative p-4 bg-white rounded-lg shadow dark:bg-gray-800 sm:p-5">
				<!-- Modal header -->
				<div
					class="flex justify-between items-center pb-4 mb-4 rounded-t border-b sm:mb-5 dark:border-gray-600">
					<h3 class="text-xl font-semibold text-gray-900 dark:text-white">
						Add Record
					</h3>
					<button
						type="button"
						class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
						data-modal-toggle="addRecord">
						<XMarkIcon class="w-5 h-5" />
						<span class="sr-only">Close modal</span>
					</button>
				</div>
				<!-- Modal body -->
				<form
					id="add-record-form"
					action="#"
					@keypress.enter.prevent
					@submit.prevent="addNewRecord()">
					<div
						class="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-4 mb-8">
						<template v-for="(header, index) in headers" :key="index">
							<div class="flex flex-col gap-2" v-if="header.is_add">
								<label
									:for="`add-${header.name}`"
									class="block text-base font-medium text-gray-900 dark:text-white"
									>{{ header.name }}</label
								>
								<InputChip
									v-if="header.type === 'chips'"
									:header="header"
									:fieldValue="newRecord[header.field]"
									@change="handleChip($event, header)" />

								<InputAssignDropdown
									v-else-if="header.is_assign_dropdown"
									:header="header"
									prefix="add"
									@change="handleAssignDropdown($event, header)" />

								<InputCompanyDropdown
									v-else-if="header.is_company_dropdown"
									:header="header"
									prefix="add"
									@change="newRecord[header.field] = $event" />

								<InputAddressDropdown
									v-else-if="header.is_address_dropdown"
									:header="header"
									prefix="add"
									@change="newRecord[header.field] = $event" />

								<input
									v-else-if="header.type === 'image'"
									type="file"
									:name="`add-${header.name}`"
									:id="`add-${header.name}`"
									class="bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
									accept="image/jpg, image/jpeg, image/png"
									required />

								<textarea
									v-else-if="
										header.parent === null &&
										header.dropdown === false &&
										header.type === 'textarea'
									"
									v-model="newRecord[header.field]"
									:type="header.type"
									:name="`add-${header.name}`"
									:id="`add-${header.name}`"
									class="bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
									:placeholder="header.name"
									required />
								<textarea
									v-else-if="
										header.parent !== null &&
										header.dropdown === false &&
										header.type === 'textarea'
									"
									v-model="newRecord[header.parent][header.field]"
									:type="header.type"
									:name="`add-${header.name}`"
									:id="`add-${header.name}`"
									class="bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
									:placeholder="header.name"
									required />

								<input
									v-else-if="
										header.parent === null &&
										header.dropdown === false &&
										header.type !== 'textarea'
									"
									v-model="newRecord[header.field]"
									:type="header.type"
									:name="`add-${header.name}`"
									:id="`add-${header.name}`"
									:step="header.step ? header.step : 'any'"
									class="bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
									:placeholder="header.name"
									required />
								<input
									v-else-if="
										header.parent !== null &&
										header.dropdown === false &&
										header.type !== 'textarea'
									"
									v-model="newRecord[header.parent][header.field]"
									:type="header.type"
									:name="`add-${header.name}`"
									:id="`add-${header.name}`"
									:step="header.step ? header.step : 'any'"
									class="bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
									:placeholder="header.name"
									required />

								<select
									v-else-if="header.parent === null && header.dropdown === true"
									v-model="newRecord[header.field]"
									:id="`add-${header.name}`"
									class="bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
									required>
									<option value="" disabled>Select {{ header.name }}</option>
									<option
										v-for="(opt, index) in header.options"
										:key="index"
										:value="opt.value">
										{{ opt.name }}
									</option>
								</select>
								<select
									v-else-if="header.parent !== null && header.dropdown === true"
									v-model="newRecord[header.parent][header.field]"
									:id="`add-${header.name}`"
									class="bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
									required>
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
						data-modal-toggle="addRecord"
						type="submit"
						class="primary-button">
						Add record
					</button>
				</form>
			</div>
		</div>
	</div>
</template>

<script setup>
	import { initModals } from "flowbite";
	import { XMarkIcon } from "@heroicons/vue/24/outline";

	const { currentUser } = useRealmApp();
	const { S3_ACCESS_KEY, S3_SECRET_ACCESS_KEY, S3_BUCKET_NAME, S3_REGION } =
		useRuntimeConfig().public;

	const newRecord = ref(null);
	const assign_headers = ref([]);

	const emit = defineEmits(["addRecord"]);
	const { headers, useStore } = defineProps(["headers", "useStore"]);

	const store = useStore();

	let s3Credentials = {
		accressKeyId: S3_ACCESS_KEY,
		secretAccessKey: S3_SECRET_ACCESS_KEY,
		signatureVersion: "v4",
		region: S3_REGION,
		Bucket: S3_BUCKET_NAME,
	};

	onMounted(() => {
		initModals();
	});

	const initNewRecord = () => {
		newRecord.value = {};

		headers?.forEach((element) => {
			if (element.is_add && element.parent) {
				if (!newRecord.value[element.parent])
					newRecord.value[element.parent] = {};
				// console.log(newRecord.value[element.parent]);
				if (element.default_value)
					newRecord.value[element.parent][element.field] =
						element.default_value;
				else newRecord.value[element.parent][element.field] = "";
			} else if (element.is_add && !element.parent) {
				if (element.default_value)
					newRecord.value[element.field] = element.default_value;
				else newRecord.value[element.field] = "";
			}
		});
	};

	initNewRecord();

	const handleChip = (data, header) => {
		newRecord.value[header.field] = data;
		console.log(newRecord.value[header.field]);
	};

	const handleAssignDropdown = (__data, header) => {
		console.log(__data, header);
		if (header.is_assign_dropdown && header.parent) {
			newRecord.value[header.parent][header.field] = __data;
			newRecord.value[header.parent]["assigned_on"] = new Date();
		}
		if (header.is_assign_dropdown && !header.parent) {
			newRecord.value[header.field] = __data;
		}
		header.assigned_value = __data;
	};

	const addNewRecord = async () => {
		let uploadImageHeader = null;
		store.isAdding = true;

		await headers?.forEach(async (header) => {
			if (header.is_assign_dropdown) assign_headers.value.push(header);

			if (header.type === "image") {
				uploadImageHeader = header;
			} else if (header?.type === "date" && !header?.parent) {
				newRecord.value[header.field] = new Date(newRecord.value[header.field]);
			} else if (header.type === "pipeline") {
				newRecord.value[header.field] = {
					stages: [],
					current_stage: 0,
					assignee: "",
					owner: "",
					notes: [],
				};

				header.stages?.forEach((item) => {
					newRecord.value[header.field].stages.push({
						name: item,
						date: null,
						description: "",
						comment: "",
					});
				});

				newRecord.value[header.field].stages[0].date = new Date();
			}

			header.combine?.forEach((item) => {
				if (!newRecord.value[header.field]) {
					newRecord.value[header.field] = "";
				}

				newRecord.value[header.field] = newRecord.value[header.field].concat(
					" ",
					newRecord.value[item]
				);
			});
		});

		newRecord.value.created_at = new Date();
		newRecord.value.created_by = currentUser?.id;

		if (uploadImageHeader) {
			const fileName = document.getElementById(`add-${uploadImageHeader.name}`)
				.files[0];

			if (fileName) {
				let mediaStreamRequest = getFile(fileName);
				const [mediaStream] = await Promise.all([mediaStreamRequest]);

				const uploadedFile = await uploadToS3(
					s3Credentials,
					mediaStream,
					fileName.type,
					(progress) => {
						console.log(progress);
					}
				);

				if (uploadedFile)
					newRecord.value[uploadImageHeader.field] = uploadedFile.Location;

				console.log(newRecord.value);
				emit("addRecord", {
					data: newRecord.value,
					assign_headers: assign_headers.value,
				});
				initNewRecord();
			}
		} else {
			console.log(newRecord.value);
			emit("addRecord", {
				data: newRecord.value,
				assign_headers: assign_headers.value,
			});
			initNewRecord();
		}
	};
</script>

<style scoped></style>
