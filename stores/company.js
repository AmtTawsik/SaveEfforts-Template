import { defineStore } from "pinia";
import { BSON } from "realm-web";

export const useStore = defineStore("companyCounter", {
	state: () => ({
		recordsData: null,
		recordsDataBackup: null,
		recordsDataLength: 0,
		recordsDataBackupLength: 0,
		totalPages: 0,
		currentPage: 1,
		pageStep: 15,
		selectedRecords: [],
		isFetching: true,
		isAdding: false,
		dbName: useRuntimeConfig().public.APP_DB,
		colName: "companies",
	}),

	getters: {
		data: (state) => state.recordsData,
	},

	actions: {
		calculateNoOfPages() {
			this.totalPages = Math.ceil(this.recordsDataLength / this.pageStep);
		},

		async setRecordsCount(pipeline) {
			const { getRecordsCount } = useRealmApp();

			if (!pipeline) {
				pipeline = [];
			}

			pipeline.push({ $count: "total" });

			const result = await getRecordsCount(this.dbName, this.colName, pipeline);

			if (result && result.length > 0) {
				this.recordsDataBackupLength = this.recordsDataLength = result[0].total;
				this.calculateNoOfPages();
			} else this.recordsDataBackupLength = this.recordsDataLength = 0;
		},

		async fetchData(match, sort) {
			this.isFetching = true;
			const { getRecords } = useRealmApp();
			const skip = (this.currentPage - 1) * this.pageStep;

			let pipeline = [];

			if (match) {
				pipeline.push({ $match: { $and: JSON.parse(JSON.stringify(match)) } });
				this.setRecordsCount(pipeline);
				pipeline.pop();
			} else {
				this.setRecordsCount(pipeline);
				pipeline.pop();
			}

			if (sort) pipeline.push({ $sort: sort });

			pipeline.push({ $skip: skip });
			pipeline.push({ $limit: this.pageStep });

			this.recordsDataBackup = this.recordsData = await getRecords(
				this.dbName,
				this.colName,
				pipeline
			);

			this.isFetching = false;
		},

		async getPage(match, sort) {
			this.isFetching = true;
			const { getRecords } = useRealmApp();

			const skip = (this.currentPage - 1) * this.pageStep;

			let pipeline = [];

			if (match)
				pipeline.push({ $match: { $and: JSON.parse(JSON.stringify(match)) } });

			if (sort) pipeline.push({ $sort: sort });

			pipeline.push({ $skip: skip });
			pipeline.push({ $limit: this.pageStep });

			this.recordsDataBackup = this.recordsData = await getRecords(
				this.dbName,
				this.colName,
				pipeline
			);

			this.isFetching = false;
		},

		async findRecords(match) {
			const { getRecords } = useRealmApp();

			let pipeline = [];
			if (match) {
				pipeline.push({ $match: { $and: JSON.parse(JSON.stringify(match)) } });
			}

			return await getRecords(this.dbName, this.colName, pipeline);
		},

		async initRecordsData(match, sort) {
			if (this.recordsData === null) {
				await this.fetchData(match, sort);

				return this.recordsData;
			} else return this.recordsData;
		},

		selectRecord(id) {
			this.selectedRecords.push(id);
		},

		unselectRecord(id) {
			const index = this.selectedRecords.indexOf(id);
			this.selectedRecords.splice(index, 1);
		},

		async findByField(field, value) {
			const { findRecordFromDB } = useRealmApp();
			let res = null;

			if (!field || !value) return null;
			if (this.recordsData) {
				res = this.recordsData.find((item) => item.field === value);
				if (res) return res;
				else
					return await findRecordFromDB(
						this.dbName,
						this.colName,
						field,
						value
					);
			} else {
				return await findRecordFromDB(this.dbName, this.colName, field, value);
			}
		},

		async findById(id) {
			const { findRecordFromDB } = useRealmApp();
			let res = null;

			if (!id) return null;
			if (typeof id == "string") {
				id = BSON.ObjectID(id);
			}
			if (this.recordsData) {
				res = this.recordsData.find(
					(item) => item._id.toString() === id.toString()
				);
				if (res) return res;
				else
					return await findRecordFromDB(this.dbName, this.colName, "_id", id);
			} else {
				return await findRecordFromDB(this.dbName, this.colName, "_id", id);
			}
		},

		async assignCallback(header, assign_to_id, globalStore) {
			let store;
			if (globalStore[header.get_from]) {
				store = globalStore[header.get_from].useStore();
				const record = await store.findById(header.assigned_value);
				if (record && record[header.assign_to_field]) {
					record[header.assign_to_field].push(assign_to_id);
				} else if (record && !record[header.assign_to_field]) {
					record[header.assign_to_field] = [assign_to_id];
				}
				store.updateRecord(record);
			}
		},

		async addRecord(data, assign_headers, globalStore) {
			const { addRecordToDB } = useRealmApp();

			const { insertedId } = await addRecordToDB(
				this.dbName,
				this.colName,
				data
			);
			data._id = insertedId;
			this.recordsData.push(data);
			this.recordsDataBackup = this.recordsData;
			this.selectedRecords = [];
			this.recordsDataBackupLength = this.recordsDataLength =
				this.recordsDataLength + 1;

			if (assign_headers && assign_headers.length > 0) {
				assign_headers.forEach((header) =>
					this.assignCallback(header, insertedId, globalStore)
				);
			}
			this.isAdding = false;
		},

		async updateRecord(data) {
			const { updateRecordFromDB } = useRealmApp();

			updateRecordFromDB(this.dbName, this.colName, data)
				.then((result) => {
					console.log(result);
					const index = this.recordsData.findIndex(
						(element) => data._id.toString() === element._id.toString()
					);
					console.log(data, this.selectedRecords, index);
					this.recordsData[index] = data;
					this.recordsDataBackup = this.recordsData;
					this.selectedRecords = [];
				})
				.catch((err) => {
					console.log(err);
				});
		},

		async addField(set_data, record, assign_headers) {
			const { updateRecordFromDB2 } = useRealmApp();
			const globalStore = useGlobalStore();

			await updateRecordFromDB2(this.dbName, this.colName, record._id, set_data)
				.then((result) => {
					const index = this.recordsData.findIndex(
						(element) => record._id.toString() === element._id.toString()
					);

					for (const key in set_data) {
						console.log(key);
						this.recordsData[index][key] = set_data[key];
					}

					this.recordsDataBackup = this.recordsData;
					this.selectedRecords = [];
				})
				.catch((err) => {
					console.log(err);
				});

			if (assign_headers?.length > 0) {
				assign_headers.forEach((header) =>
					this.assignCallback(header, record._id, globalStore)
				);
			}
		},

		deleteRecord(_id) {
			const { deleteRecordFromDB } = useRealmApp();

			if (_id) {
				const index = this.recordsData.findIndex(
					(element) => _id === element._id
				);
				this.recordsData.splice(index, 1);
				this.recordsDataBackup = this.recordsData;
				deleteRecordFromDB(this.dbName, this.colName, _id);
				this.recordsDataBackupLength = this.recordsDataLength =
					this.recordsDataLength - 1;
			} else {
				this.selectedRecords?.forEach((id) => {
					const index = this.recordsData.findIndex(
						(element) => id === element._id
					);
					this.recordsData.splice(index, 1);
					deleteRecordFromDB(this.dbName, this.colName, id);
					this.recordsDataBackupLength = this.recordsDataLength =
						this.recordsDataLength - 1;
				});
				this.recordsDataBackup = this.recordsData;
				this.selectedRecords = [];
				this.calculateNoOfPages();
			}
		},

		resetFilterFields() {
			this.isFetching = true;
			this.recordsData = this.recordsDataBackup;
			this.isFetching = false;
		},
	},
});
