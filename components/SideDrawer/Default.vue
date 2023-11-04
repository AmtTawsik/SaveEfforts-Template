<script setup>
	import { initTabs } from "flowbite";

	import {
		ChevronDownIcon,
		ChevronRightIcon,
		ChevronLeftIcon,
		StarIcon as SolidStartIcon,
		ArrowDownTrayIcon,
		PlusCircleIcon,
		StarIcon,
	} from "@heroicons/vue/24/solid";
	import {
		ChatBubbleBottomCenterTextIcon,
		EnvelopeIcon,
		PencilSquareIcon,
		LinkIcon,
		PrinterIcon,
		ChevronDoubleRightIcon,
		TrashIcon,
		HandThumbUpIcon,
		PencilIcon,
	} from "@heroicons/vue/24/outline";

	const { content } = defineProps(["content"]);
	const { currRecord } = content.currentRecord();

	const ndaRegion = ref("");
	const toStore = content.store();

	onMounted(() => {
		initTabs();
	});

	const imageUploadHandler = (event) => {
		const { currentUser } = useRealmApp();

		if (event) {
			if (
				!currRecord.value.update_logs ||
				currRecord.value.update_logs.length === 0
			)
				currRecord.value.update_logs = [];

			currRecord.value.update_logs.push({
				type: "edit",
				sub_type: "image",
				field: "image_url",
				updated_at: new Date(),
				updated_by: currentUser?.id,
			});

			currRecord.value.image_url = event.Location;

			let set_data = {
				image_url: event.Location,
				update_logs: currRecord.value.update_logs,
			};

			toStore.addField(set_data, currRecord.value);
		}
	};

	const detailsUpdateHandler = (event) => {
		if (event?.set && event?.data) {
			toStore.addField(event.set, event.data);
		}
	};
</script>

<template>
	<div
		id="drawer-right"
		class="fixed top-0 right-0 z-50 h-screen overflow-y-auto transition-transform translate-x-full bg-white w-[45%] max-2xl:w-1/2 max-xl:w-2/3 max-lg:w-1/2 max-md:w-[55%] max-sm:w-[80%]"
		tabindex="-1"
		aria-labelledby="drawer-right-label">
		<header class="bg-slate-200 px-5 py-6 max-xl:p-4">
			<div class="flex justify-between max-sm:flex-col max-sm:gap-5">
				<div class="flex items-center gap-4">
					<CardsProfilePicture
						:image="currRecord?.image_url"
						@uploaded="imageUploadHandler($event)" />
					<div>
						<div class="flex items-center gap-2">
							<h3 class="font-medium text-lg max-xl:text-base">
								{{ currRecord?.full_name }}
							</h3>
							<span
								class="bg-green-100 border rounded-md border-green-400 text-green-600 text-sm px-2 max-xl:text-xs"
								>{{ currRecord?.status }}</span
							>
						</div>

						<p class="text-sm text-slate-500 mb-2 max-lg:text-xs">
							{{ currRecord?.department }} -
							{{ currRecord?.job_title }}
						</p>
					</div>
				</div>
			</div>
		</header>

		<div class="border-b border-gray-200 dark:border-gray-700">
			<ul
				class="flex flex-wrap -mb-px text-sm font-medium text-center"
				id="myTab"
				data-tabs-toggle="#myTabContent"
				role="tablist">
				<template v-for="(tab, key) in content?.tab_headers" :key="key">
					<li v-if="tab.read" role="presentation">
						<button
							class="inline-block p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 uppercase max-lg:ml-2"
							:id="`${key}-tab`"
							:data-tabs-target="`#${key}`"
							type="button"
							role="tab"
							:aria-controls="`${key}`"
							aria-selected="false">
							{{ key }}
						</button>
					</li>
				</template>
			</ul>
		</div>

		<div id="myTabContent">
			<template v-for="(tab, key) in content?.tab_headers" :key="key">
				<div
					v-if="tab.read"
					class="hidden p-4 rounded-lg dark:bg-gray-800"
					:id="`${key}`"
					role="tabpanel"
					:aria-labelledby="`${key}-tab`">
					<SideDrawerTabsDetails
						v-if="tab.type === 'detail'"
						:key="currRecord"
						:data="currRecord"
						:headers="tab.fields"
						:canEdit="tab.write"
						@update-record="detailsUpdateHandler($event)" />

					<SideDrawerTabsHistory
						v-else-if="tab.type === 'history'"
						:key="currRecord"
						:data="currRecord"
						:canEdit="tab.write"
						:headers="content.headers" />

					<SideDrawerTabsPipeline
						v-else-if="tab.type === 'pipeline'"
						:key="currRecord"
						:data="currRecord"
						:pipelineField="tab.pipeline_field"
						:canEdit="tab.write"
						@update-record="detailsUpdateHandler($event)" />

					<SideDrawerTabsChips
						v-else-if="tab.type === 'chip'"
						:key="currRecord"
						:data="currRecord"
						:header="tab.field"
						:canEdit="tab.write"
						@update-record="detailsUpdateHandler($event)" />

					<SideDrawerTabsNotes
						v-else-if="tab.type === 'note'"
						:key="currRecord"
						:data="currRecord"
						:canEdit="tab.write"
						@update-record="detailsUpdateHandler($event)" />

					<SideDrawerTabsDocuments
						v-else-if="tab.type === 'document'"
						:key="currRecord"
						:data="currRecord"
						:canEdit="tab.write"
						@update-record="detailsUpdateHandler($event)" />

					<SideDrawerTabsAssign
						v-else-if="tab.type === 'assign'"
						:key="currRecord"
						:data="currRecord"
						:header="tab.field"
						:canEdit="tab.write"
						:store="toStore" />

					<div v-else class="flex flex-col gap-4">
						<div class="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-4">
							<div class="flex flex-col gap-2">
								<label
									for="sign-nda"
									class="block text-base font-medium text-gray-900 dark:text-white"
									>Sign NDA</label
								>
								<select
									id="sign-nda"
									v-model="ndaRegion"
									class="bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500">
									<option value="" disabled>Select region</option>
									<option value="US">US</option>
									<option value="EMEA">EMEA</option>
								</select>
							</div>
						</div>
						<button class="primary-button-sm w-fit h-fit">Submit</button>
					</div>
				</div>
			</template>
		</div>
	</div>
</template>
