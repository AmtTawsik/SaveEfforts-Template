import * as Realm from "realm-web";

export default ({ store, $config }, inject) => {
	// Initialize the Realm app
	const appId = useRuntimeConfig().public.APP_ID;
	const realmApp = new Realm.App(appId);

	// If the user is authenticated, set the initial store state to have the user's id
	// Make the app available under this.$realm
	inject("realm", realmApp);
};
