export const useUser = () => {
	const currRecord = useState("user", () => {});

	const getCurrentRecordInfo = (info) => {
		currRecord.value = info;
	};

	return { currRecord, getCurrentRecordInfo };
};

export const useUserHideDropDown = () => {
	const tableTdVisible = useState("userTdVisible", () => {
		let isVisible = {};

		return isVisible;
	});

	const tdInit = (tableHeaders, tabHeaders) => {
		tableTdVisible.value = new Object();
		tableHeaders.forEach((item, index) => {
			if (index >= 10 && item.is_visible)
				tableTdVisible.value[item.name] = false;
			else if (item.is_visible) tableTdVisible.value[item.name] = true;
		});

		for (const tab in tabHeaders) {
			tabHeaders[tab]?.fields?.forEach((item) => {
				if (item?.table_view !== false && item.is_visible)
					tableTdVisible.value[item.name] = false;
			});
		}
	};

	const tdToggle = (state) => {
		for (const key in tableTdVisible.value) {
			tableTdVisible.value[key] = state;
		}
	};

	const showAllTableTd = () => {
		tdToggle(true);
	};

	const hideAllTableTd = () => {
		tdToggle(false);
	};

	return { tableTdVisible, tdInit, showAllTableTd, hideAllTableTd };
};

export const useUserGroup = () => {
	const grouped = useState("userGroup", () => ({
		active: false,
		groupedBy: null,
		header: null,
	}));

	const setGroup = (item) => {
		grouped.value = item;
	};

	const unsetGroup = () => {
		grouped.value = {
			active: false,
			groupedBy: null,
			header: null,
		};
	};

	return { grouped, setGroup, unsetGroup };
};
