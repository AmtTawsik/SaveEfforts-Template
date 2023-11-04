<script setup>
import { ArrowLeftOnRectangleIcon } from '@heroicons/vue/24/solid';

import { Drawer } from 'flowbite';
const icons = await import('@heroicons/vue/24/solid');

const currentPage = ref(null);
const { logOut, currentUser } = useRealmApp();
const { pages, setPages } = usePages();

const pageHandler = (path) => {
  if (path) {
    currentPage.value = path;
    navigateTo(path);
  } else currentPage.value = window.location.pathname;
};

onBeforeMount(() => {
  if (!currentUser) navigateTo('/');
});

onMounted(() => {
  // setup available elements
  const $buttonElement = document.querySelector('#button');
  const $drawerElement = document.querySelector('#sidebar');
  const $closeButtons = document.querySelectorAll('#closeButton');

  // set drawer options
  const drawerOptions = {
    backdropClasses:
      'bg-gray-900 bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-40',
  };

  // create a new drawer instance
  if ($drawerElement) {
    const drawer = new Drawer($drawerElement, drawerOptions);

    // set event listeners for the button to show the drawer
    $buttonElement.addEventListener('click', () => drawer.toggle());
    $closeButtons.forEach((el) => {
      el.addEventListener('click', () => drawer.hide());
    });
  }

  if (pages.value?.length < 1) {
    setPages();
  }
  pageHandler();
  console.log(currentPage.value);
});
</script>

<template>
  <div>
    <button
      id="button"
      type="button"
      class="inline-flex items-center p-2 mt-2 ml-3 text-sm text-gray-500 rounded-lg lg:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
    >
      <span class="sr-only">Open sidebar</span>
      <svg
        class="w-6 h-6"
        aria-hidden="true"
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          clip-rule="evenodd"
          fill-rule="evenodd"
          d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
        ></path>
      </svg>
    </button>

    <aside
      id="sidebar"
      class="fixed top-0 left-0 z-50 w-64 h-screen transition-transform -translate-x-full lg:translate-x-0"
      aria-label="Sidebar"
    >
      <div
        class="flex flex-col justify-between h-full px-3 py-4 overflow-y-auto bg-[#282c38]"
      >
        <div>
          <h2
            class="p-2 mb-2 text-3xl font-extrabold text-white cursor-pointer uppercase"
            @click="pageHandler('/home')"
          >
            Save<span class="text-primary-500">efforts</span>
          </h2>
          <ul v-if="currentPage" class="space-y-2 font-medium">
            <li
              v-for="page in pages"
              :key="page.to"
              @click="pageHandler(page.to)"
              class="flex items-center p-2 text-white hover:text-black rounded-lg hover:bg-yellow-300 cursor-pointer"
              :class="{ 'bg-yellow-300 !text-black': currentPage === page.to }"
            >
              <component
                :is="icons[page.icon]"
                class="w-6 h-6 text-gray-500 transition duration-75"
              />
              <span class="ml-3">{{ page.name }}</span>
            </li>
          </ul>
        </div>
        <div
          v-if="currentUser"
          class="flex flex-col gap-4 bg-primary-400 rounded-lg p-2"
        >
          <div class="flex items-center space-x-2.5">
            <img
              v-if="currentUser?.customData?.image_url"
              class="w-10 h-10 rounded-full"
              :src="currentUser.customData.image_url"
              referrerpolicy="no-referrer"
              alt=""
            />
            <img
              v-else
              class="w-10 h-10 rounded-full"
              src="~/assets/images/default-user.png"
              alt=""
            />
            <div class="w-full overflow-hidden">
              <h1 v-if="currentUser?.customData?.full_name" class="font-medium">
                {{ currentUser?.customData?.full_name }}
              </h1>
              <h2
                v-if="currentUser?.customData?.primary_email"
                class="text-sm text-gray-700"
              >
                {{ currentUser?.customData?.primary_email }}
              </h2>
            </div>
          </div>
          <div
            @click="logOut()"
            class="flex items-center p-2 text-black hover:text-white rounded-lg hover:bg-[#282c38] cursor-pointer"
          >
            <ArrowLeftOnRectangleIcon
              class="w-6 h-6 text-gray-500 transition duration-75"
            />
            <span class="ml-3">Sign out</span>
          </div>
        </div>
      </div>
    </aside>
  </div>
</template>
