import * as Realm from "realm-web";

export const useRealmApp = () => {
	const appId = useRuntimeConfig().public.APP_ID;

	const app = Realm.getApp(appId);

	let currentUser = app.currentUser;

	let mongo = null;
	if (app?.currentUser) {
		mongo = app.currentUser.mongoClient("mongodb-atlas");
	}

	const loginApiKey = async () => {
		const apiKey = useRuntimeConfig().public.USER_API_KEY;
		const credentials = Realm.Credentials.apiKey(apiKey);

		return await app.logIn(credentials);
	};

	async function logOut() {
		const globalStore = useGlobalStore();

		await currentUser.logOut();

		navigateTo("/");
		for (const storeName in globalStore) {
			const store = globalStore[storeName]?.useStore();
			if (store) store.$reset();
		}
	}

	async function getRecords(dbName, colName, pipeline) {
		if (currentUser === null) {
			return null;
		}

		const mongo = currentUser.mongoClient("mongodb-atlas");
		const collection = mongo.db(dbName).collection(colName);

		if (!pipeline) {
			pipeline = [];
		}

		const result = await collection.aggregate(pipeline);
		console.log(colName, result);

		return result;
	}

	async function getRecordsCount(dbName, colName, pipeline) {
		if (currentUser === null) {
			return null;
		}

		const result = await getRecords(dbName, colName, pipeline);

		return result;
	}

	async function addRecordToDB(dbName, colName, record) {
		if (currentUser === null) {
			return null;
		}

		const mongo = currentUser.mongoClient("mongodb-atlas");
		const collection = mongo.db(dbName).collection(colName);

		let result;

		await collection.insertOne(record).then((data) => {
			console.log(data);
			result = data;
		});

		return result;
	}

	async function updateRecordFromDB(dbName, colName, record) {
		if (currentUser === null) {
			return null;
		}

		if (!record) return null;

		const mongo = currentUser.mongoClient("mongodb-atlas");
		const collection = mongo.db(dbName).collection(colName);

		let result;

		result = await collection.updateOne({ _id: record._id }, record);
		console.log(result);

		return result;
	}
	async function updateRecordFromDB2(dbName, colName, id, set_data) {
		if (currentUser === null) {
			return null;
		}

		if (!set_data) return null;

		const mongo = currentUser.mongoClient("mongodb-atlas");
		const collection = mongo.db(dbName).collection(colName);

		let result;

		result = await collection.updateOne({ _id: id }, { $set: set_data });
		console.log(result);

		return result;
	}

	async function deleteRecordFromDB(dbName, colName, id) {
		if (currentUser === null) {
			return null;
		}

		const mongo = currentUser.mongoClient("mongodb-atlas");
		const collection = mongo.db(dbName).collection(colName);

		let result;

		await collection.deleteOne({ _id: id }).then((data) => {
			console.log(data);
			result = data;
		});

		return result;
	}

	async function findRecordFromDB(dbName, colName, field, value) {
		if (currentUser === null) {
			return null;
		}

		const mongo = currentUser.mongoClient("mongodb-atlas");
		const collection = mongo.db(dbName).collection(colName);

		let result,
			obj = {};

		obj[field] = value;

		await collection.findOne(obj).then((data) => {
			result = data;
		});

		return result;
	}

	return {
		app,
		Realm,
		mongo,
		currentUser,
		loginApiKey,
		logOut,
		getRecords,
		getRecordsCount,
		addRecordToDB,
		updateRecordFromDB,
		updateRecordFromDB2,
		deleteRecordFromDB,
		findRecordFromDB,
	};
};
