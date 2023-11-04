<script setup>
	import {
		HandThumbDownIcon,
		EllipsisVerticalIcon,
		ArrowDownTrayIcon,
		PrinterIcon,
		ChevronDownIcon,
		XMarkIcon,
		BookmarkIcon,
	} from "@heroicons/vue/24/outline";

	import {
		ChevronLeftIcon,
		ChevronRightIcon,
		PlusIcon,
		TrashIcon,
		PencilIcon,
		MagnifyingGlassIcon,
	} from "@heroicons/vue/24/solid";

	import { initModals, initDropdowns, Dropdown } from "flowbite";
	import { tab_fields } from "@/table_configs/contact.json";
	import { config } from "@/table_configs/contact.json";
	import { roles } from "@/table_configs/contact.json";

	const composable = await import("~/composables/contact");
	const { currentUser, getRecords } = useRealmApp();
	const { saveView, activeSaveView, saveViewList } = composable.useContact();
	const globalStore = useGlobalStore();
	const piniaStore = globalStore.contactStore;
	const flag = ref(false);

	const store = piniaStore.useStore();
	const tableKey = ref(0);
	const saveViewName = ref("");
	const searchValue = ref(null);

	let tableConfig = {};
	let primaryHeader = null;
	let defaultSort = {};

	tableConfig.read = false;
	tableConfig.write = false;

	tableConfig.tableName = "contact";
	tableConfig.headers = config;
	tableConfig.tab_headers = tab_fields;

	tableConfig.rowMap = new Map();
	tableConfig.groupMap = new Map();

	tableConfig.hideComposable = composable.useContactHideDropDown;
	tableConfig.groupComposable = composable.useContactGroup;
	tableConfig.changeGroup = changeGroup;
	tableConfig.currentRecord = composable.useContact;

	tableConfig.store = piniaStore.useStore;
	tableConfig.drawerComponent = resolveComponent("SideDrawerContact");

	const findFieldPermissions = (field) => {
		let perm = null;

		if (tableConfig?.user_role?.fields && tableConfig.user_role.fields[field]) {
			perm = tableConfig.user_role.fields[field];
		} else if (tableConfig?.user_role?.additional_fields) {
			perm = tableConfig.user_role.additional_fields;
		} else {
			perm = { read: false, write: false };

			if (tableConfig?.user_role?.read)
				perm.read = tableConfig?.user_role?.read;
			if (tableConfig?.user_role?.write)
				perm.write = tableConfig?.user_role?.write;
		}

		return perm;
	};

	tableConfig.headers.forEach((item) => {
		if (item.parent) {
			tableConfig.rowMap.set(item.name, {
				property: item.parent,
				visilibility: item.name,
				component: resolveComponent(item.component),
			});
		} else {
			tableConfig.rowMap.set(item.name, {
				property: item.field,
				visilibility: item.name,
				component: resolveComponent(item.component),
			});
		}

		if (item.is_group) tableConfig.groupMap.set(item.name, arrangeByGroup);

		if (item.is_primary) {
			primaryHeader = item;
			if (item.parent) {
				defaultSort[`${item.parent}.${item.field}`] = 1;
			} else {
				defaultSort[item.field] = 1;
			}
		}
	});

	onBeforeMount(async () => {
		if (!currentUser) navigateTo("/");
		let currentRole, temp, path;

		temp = {};
		path = "collection";

		temp[path] = {};
		temp[path]["$regex"] = store.colName;
		temp[path]["$options"] = "i";
		let matchPipeline = [{ $match: temp }];

		store.initRecordsData(null, defaultSort);

		if (!saveViewList.value) {
			saveViewList.value = await getRecords(
				useRuntimeConfig().public.APP_DB,
				"saveView",
				matchPipeline
			);
		}

		flag.value = true;

		if (currentUser?.customData?.role && roles) {
			currentRole = roles.find(
				(item) =>
					item.name.toLowerCase() === currentUser.customData.role.toLowerCase()
			);
			if (!currentRole) navigateTo("/unauthorized");
		} else navigateTo("/unauthorized");

		tableConfig.user_role = currentRole;

		tableConfig.headers.forEach((item) => {
			let perm = null;

			if (item.parent) {
				perm = findFieldPermissions(item.parent);
			} else {
				perm = findFieldPermissions(item.field);
			}

			if (perm?.read !== null && item.is_visible) {
				item.is_visible = perm.read;
			}

			if (perm?.write !== null && item.is_update) {
				item.is_update = perm.write;
			}

			if (perm?.read === true && !tableConfig.read) {
				tableConfig.read = perm.read;
			}

			if (perm?.read === true && !tableConfig.write) {
				tableConfig.write = perm.write;
			}
		});

		for (const key in tableConfig.tab_headers) {
			tableConfig.tab_headers[key].read = false;
			tableConfig.tab_headers[key].write = false;

			if (tableConfig?.tab_headers[key]?.field) {
				let perm = null;
				const header = tableConfig?.tab_headers[key]?.field;

				if (header.parent) {
					perm = findFieldPermissions(header.parent);
				} else {
					perm = findFieldPermissions(header.field);
				}

				if (perm?.read !== null) {
					header.is_visible = perm.read;
				}

				if (perm?.write !== null) {
					header.is_update = perm.write;
				}

				if (perm?.read === true && !tableConfig?.tab_headers[key].read) {
					tableConfig.tab_headers[key].read = perm.read;
				}

				if (perm?.read === true && !tableConfig?.tab_headers[key].write) {
					tableConfig.tab_headers[key].write = perm.write;
				}
			}

			tableConfig?.tab_headers[key]?.fields?.forEach((header) => {
				let perm = null;

				if (header.parent) {
					perm = findFieldPermissions(header.parent);
				} else {
					perm = findFieldPermissions(header.field);
				}

				if (perm?.read !== null) {
					header.is_visible = perm.read;
				}

				if (perm?.write !== null) {
					header.is_update = perm.write;
				}

				if (perm?.read === true && !tableConfig?.tab_headers[key].read) {
					tableConfig.tab_headers[key].read = perm.read;
				}

				if (perm?.read === true && !tableConfig?.tab_headers[key].write) {
					tableConfig.tab_headers[key].write = perm.write;
				}
			});
		}
	});

	onMounted(() => {
		initModals();
		initDropdowns();

		if (saveView.value?.hide) {
			const { tableTdVisible } = tableConfig.hideComposable();
			tableTdVisible.value = saveView.value.hide;
		} else {
			const { tdInit } = tableConfig.hideComposable();
			tdInit(tableConfig.headers, tableConfig.tab_headers);
		}
	});

	const addRecordHandler = (data) => {
		store.addRecord(data.data, data.assign_headers, globalStore);
		tableKey.value++;
	};

	watch(searchValue, async (newVal, oldVal) => {
		if (newVal === oldVal) {
			return;
		} else if (newVal?.length === 0) {
			store.currentPage = 1;
			await store.fetchData(saveView.value?.match, saveView.value?.sort);
			tableKey.value++;
			return;
		}

		if (primaryHeader) {
			let temp = {};
			let path = "";
			store.currentPage = 1;
			if (primaryHeader.parent) {
				path = `${primaryHeader.parent}.${primaryHeader.field}`;
			} else path = primaryHeader.field;

			temp[path] = {};
			temp[path]["$regex"] = newVal;
			temp[path]["$options"] = "i";
			let matchPipeline = [temp];
			await store.fetchData(matchPipeline, defaultSort);
			tableKey.value++;
		}
	});

	const changePage = async (changeTo) => {
		const { tableTdVisible } = tableConfig.hideComposable();

		store.currentPage = changeTo;

		if (saveView.value?.sort) {
			await store.getPage(saveView.value?.match, saveView.value?.sort);
		} else {
			await store.getPage(saveView.value?.match, defaultSort);
		}

		tableKey.value++;

		if (saveView.value?.hide) {
			tableTdVisible.value = saveView.value.hide;
		}
	};

	const changePageStep = (changeTo) => {
		store.pageStep = changeTo;
		store.calculateNoOfPages();
		tableKey.value++;
	};

	async function addSaveView() {
		const { tableTdVisible } = tableConfig.hideComposable();
		const { grouped } = tableConfig.groupComposable();
		const { addRecordToDB } = useRealmApp();

		let temp = {};

		temp.name = saveViewName.value;
		temp.hide = tableTdVisible.value;
		temp.sort = saveView.value.sort;
		temp.filters = saveView.value.filters;
		temp.match = saveView.value.match;
		temp.group = grouped.value;
		temp.user_id = currentUser.id;
		temp.collection = store.colName;

		const { insertedId } = await addRecordToDB(
			useRuntimeConfig().public.APP_DB,
			"saveView",
			temp
		);

		saveViewList.value.push(temp);
		activeSaveView.value = temp;
		saveView.value = temp;
		saveViewName.value = "";
		refreshRecordsHandle();
	}

	const toggleDropdown = () => {
		let dropdownElement = document.getElementById(
			`${tableConfig.tableName}-saveview-dropdown`
		);

		dropdownElement.classList.toggle("hidden");
	};

	const clearSaveView = async () => {
		toggleDropdown();
		const { unsetGroup } = tableConfig.groupComposable();

		store.resetFilterFields();
		store.currentPage = 1;

		saveView.value = {
			name: "Save view",
			filter: null,
			sort: defaultSort,
			hide: null,
			group: null,
		};

		activeSaveView.value = null;
		unsetGroup();

		await store.fetchData(null, defaultSort);

		const { tdInit } = tableConfig.hideComposable();
		tdInit(tableConfig.headers, tableConfig.tab_headers);

		refreshRecordsHandle();
	};

	async function applySaveView(item) {
		if (saveView.value?.name === item.name) return;
		toggleDropdown();

		const { tableTdVisible } = tableConfig.hideComposable();
		const { setGroup, unsetGroup } = tableConfig.groupComposable();

		store.resetFilterFields();
		store.currentPage = 1;
		saveView.value = JSON.parse(JSON.stringify(item));
		activeSaveView.value = item;

		if (item.match && item.sort) await store.fetchData(item?.match, item?.sort);
		else if (item.match) await store.fetchData(item?.match, defaultSort);
		else if (item.sort) await store.fetchData(null, item?.sort);
		else await store.fetchData(null, defaultSort);

		if (item.hide) tableTdVisible.value = JSON.parse(JSON.stringify(item.hide));
		if (item.group) setGroup(item.group);
		else unsetGroup();

		refreshRecordsHandle();
	}

	async function filterHandler(filters) {
		let matchPipeline = [];

		if (filters) {
			store.currentPage = 1;
			filters.forEach((item) => {
				let temp = {};
				let path = "";
				if (item.selectHeader.type === "pipeline") {
					path = `${item?.selectHeader?.field}.current_stage`;
				} else if (item?.selectHeader?.parent) {
					path = `${item?.selectHeader?.parent}.${item?.selectHeader?.field}`;
				} else path = item?.selectHeader?.field;

				temp[path] = {};
				temp[path][item?.operator] = item?.operand;
				matchPipeline.push(temp);
			});
			console.log(matchPipeline);
			saveView.value.filters = filters;
			saveView.value.match = matchPipeline;
			activeSaveView.value = null;
			await store.fetchData(saveView.value?.match, saveView.value?.sort);
		} else {
			saveView.value.filters = null;
			saveView.value.match = null;
			await store.fetchData(saveView.value?.match, saveView.value?.sort);
		}

		if (saveView.value?.sort)
			await store.fetchData(saveView.value?.match, saveView.value?.sort);
		else await store.fetchData(saveView.value?.match, defaultSort);

		tableKey.value++;
	}

	async function sortHandler(sort) {
		if (sort) {
			saveView.value.sort = sort;
			activeSaveView.value = null;
			await store.fetchData(saveView.value?.match, saveView.value?.sort);
			tableKey.value++;
			console.log(activeSaveView.value);
		}
	}

	function arrangeByGroup(data, header) {
		console.log(header);
		if (header.parent) {
			return data?.reduce((acc, user) => {
				(acc[user[header.parent][header.field]] ||= []).push(user);
				return acc;
			}, {});
		} else {
			return data?.reduce((acc, user) => {
				(acc[user[header.field]] ||= []).push(user);
				return acc;
			}, {});
		}
	}

	function changeGroup(list, evt, header) {
		if (evt.added !== undefined) {
			if (header.parent) {
				list[evt.added.newIndex][header.parent][header.field] =
					list[(evt.added.newIndex + 1) % list.length][header.parent][
						header.field
					];
			} else {
				list[evt.added.newIndex][header.field] =
					list[(evt.added.newIndex + 1) % list.length][header.field];
			}
		}
	}

	const refreshRecordsHandle = () => {
		tableKey.value++;
	};
</script>

<template>
	<div v-if="flag" class="flex flex-col h-full px-5 pt-5">
		<header class="mb-4">
			<div
				class="flex items-center justify-between max-xl:flex-col max-xl:items-start xl:gap-8 gap-4">
				<div class="flex xl:w-fit w-full items-center sm:gap-8 gap-4">
					<h2
						v-if="store.recordsDataLength > 1"
						class="text-2xl max-sm:hidden sm:inline font-bold">
						{{ store.recordsDataLength }} Contacts
					</h2>
					<h2
						v-else-if="store.recordsDataLength <= 1"
						class="text-2xl max-sm:hidden sm:inline font-bold">
						{{ store.recordsDataLength }} Contact
					</h2>
					<div class="flex gap-2">
						<!-- HIDE Dropdown -->
						<RecordsHideDropDown
							:tabHeaders="tableConfig.tab_headers"
							:headers="tableConfig.headers"
							:hideComposable="tableConfig.hideComposable" />

						<!-- SORT Dropdown -->

						<RecordsSortDropDown
							:key="saveView?.sort"
							:data="saveView?.sort"
							:tableConfig="tableConfig"
							@sort-data="sortHandler($event)" />

						<!-- FILTER Dropdown -->
						<RecordsFilterDropDown
							:key="saveView?.filters"
							:data="saveView?.filters"
							:tableConfig="tableConfig"
							@filter-data="filterHandler($event)" />

						<RecordsGroupDropDown
							:headers="tableConfig.headers"
							:groupComposable="tableConfig.groupComposable" />
					</div>
				</div>

				<div
					class="flex items-center xl:gap-8 gap-4 overflow-x-auto xl:w-fit w-full">
					<div class="flex items-center max-w-xs min-w-[200px]">
						<label
							for="record-search"
							class="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
							>Search</label
						>
						<div class="relative w-full">
							<div
								class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
								<MagnifyingGlassIcon
									class="w-5 h-5 text-gray-500 dark:text-gray-400" />
							</div>
							<input
								v-model="searchValue"
								id="record-search"
								type="text"
								class="block w-full px-5 py-2.5 pl-10 text-sm text-gray-900 border-1 border-black rounded-full bg-white focus:ring-yellow-300 focus:border-primary-300"
								:placeholder="tableConfig.tableName" />
						</div>
					</div>
					<div class="flex items-center gap-2">
						<button
							:id="`${tableConfig.tableName}-saveview-dropdown-button`"
							:data-dropdown-toggle="`${tableConfig.tableName}-saveview-dropdown`"
							class="primary-button !gap-4"
							type="button">
							<BookmarkIcon
								class="w-4 h-4 font-semibold md:hidden max-md:w-5 max-md:h-5" />
							<span class="max-md:hidden">{{
								activeSaveView?.name ? activeSaveView.name : "Save view"
							}}</span>
							<ChevronDownIcon class="w-4 h-4 max-md:hidden" />
						</button>
						<!-- Dropdown menu -->
						<div
							:id="`${tableConfig.tableName}-saveview-dropdown`"
							class="z-10 hidden bg-white divide-y divide-gray-100 rounded-md shadow w-fit dark:bg-gray-700 dark:divide-gray-600 text-sm">
							<div
								v-if="activeSaveView"
								class="flex justify-between items-center px-3 py-2 gap-2 text-gray-900 dark:text-white">
								<h2 class="font-medium">
									{{ activeSaveView?.name ? activeSaveView.name : "Save view" }}
								</h2>
								<button
									class="hover:bg-gray-200 rounded-full p-1"
									@click="clearSaveView">
									<XMarkIcon class="w-4 h-4" />
								</button>
							</div>
							<ul
								v-if="saveViewList?.length > 0 && !store.isFetching"
								class="py-1 text-gray-700 dark:text-gray-200 text-center"
								aria-labelledby="${tableConfig.tableName}-saveview-dropdown-button">
								<li
									@click="applySaveView(item)"
									v-for="item in saveViewList"
									:key="item._id">
									<a
										class="block px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
										>{{ item.name }}</a
									>
								</li>
							</ul>
							<Spinner
								v-else-if="store.isFetching"
								class="flex p-2 items-center justify-center" />
							<div class="p-2">
								<button
									id="saveview-button"
									data-modal-target="saveview-modal"
									data-modal-toggle="saveview-modal"
									class="primary-button-sm">
									<PlusIcon class="w-5 h-5 font-bold max-md:w-5 max-md:h-5" />
									Add new
								</button>
							</div>
						</div>
						<div
							id="saveview-modal"
							tabindex="-1"
							aria-hidden="true"
							class="fixed top-0 left-0 right-0 z-50 hidden w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full">
							<div class="relative w-full max-w-md max-h-full">
								<!-- Modal content -->
								<div
									class="relative bg-white rounded-lg shadow dark:bg-gray-700">
									<button
										type="button"
										class="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-800 dark:hover:text-white"
										data-modal-hide="saveview-modal">
										<XMarkIcon class="w-5 h-5" />
										<span class="sr-only">Close modal</span>
									</button>
									<div class="px-6 py-6 lg:px-8">
										<h3
											class="mb-4 text-xl font-medium text-gray-900 dark:text-white">
											Save view
										</h3>
										<div class="space-y-6" action="#">
											<div>
												<label
													for="saveview-name"
													class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
													>Template name</label
												>
												<input
													type="text"
													name="saveview-name"
													id="saveview-name"
													v-model="saveViewName"
													class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
													placeholder="Name"
													required />
											</div>

											<button
												@click="addSaveView()"
												data-modal-hide="saveview-modal"
												type="submit"
												class="w-full text-gray-800 bg-yellow-300 hover:bg-yellow-400 focus:ring-4 focus:outline-none focus:ring-yellow-200 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-yellow-600 dark:hover:bg-yellow-700 dark:focus:ring-yellow-800">
												Save
											</button>
										</div>
									</div>
								</div>
							</div>
						</div>
						<!-- This is multi-select delete -->
						<button
							v-if="
								store.selectedRecords?.length > 0 &&
								tableConfig?.user_role?.delete
							"
							id="deleteSelectedRecordButton"
							data-modal-toggle="deleteSelectedRecord"
							class="p-2 text-red-600 bg-white border border-red-300 rounded-md hover:bg-red-600 hover:text-white">
							<TrashIcon class="w-6 h-6 font-semibold" />
						</button>
						<RecordsDeleteSelected
							v-if="
								store.selectedRecords?.length > 0 &&
								tableConfig?.user_role?.delete
							"
							@delete-record="
								store.deleteRecord();
								tableKey++;
							"
							:length="store.selectedRecords.length" />

						<button
							v-if="tableConfig?.user_role?.insert"
							id="addRecordButton"
							data-modal-toggle="addRecord"
							class="flex items-center gap-1 border-2 rounded-md border-black px-5 py-[.54rem] max-md:px-3 max-md:py-2.5 min-w-max">
							<PlusIcon class="w-4 h-4 font-semibold max-md:w-5 max-md:h-5" />
							<span class="text-sm font-medium max-md:hidden">Add Record</span>
						</button>
						<RecordsAdd
							:headers="tableConfig.headers"
							:useStore="tableConfig.store"
							@add-record="addRecordHandler($event)" />
					</div>
				</div>
			</div>
		</header>

		<RecordsTable
			v-if="!store.isFetching"
			:key="tableKey"
			:TABLE_DATA="store.recordsData"
			:tableConfig="tableConfig"
			@refresh-records="refreshRecordsHandle()" />

		<RecordsTableSkeleton v-else />

		<footer class="flex items-center justify-between py-3 mt-auto">
			<Pagination
				:key="tableKey"
				:totalPages="store.totalPages"
				:currentPage="store.currentPage"
				:pageStep="store.pageStep"
				@change="changePage($event)"
				@change-step="changePageStep($event)" />
		</footer>
	</div>
	<div v-else class="p-4">
		<RecordsTableSkeleton />
	</div>
</template>
