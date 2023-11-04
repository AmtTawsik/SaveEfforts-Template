import * as __contactStore from "~/stores/contact";
import * as __companyStore from "~/stores/company";
import * as __personStore from "~/stores/person";
import * as __projectStore from "~/stores/project";
import * as __userStore from "~/stores/user";
import * as __taskStore from "~/stores/task";

export const useGlobalStore = () => {
	const contactStore = __contactStore;
	const companyStore = __companyStore;
	const personStore = __personStore;
	const projectStore = __projectStore;
	const userStore = __userStore;
	const taskStore = __taskStore;

	return {
		contactStore,
		companyStore,
		personStore,
		projectStore,
		userStore,
		taskStore
	};
};
