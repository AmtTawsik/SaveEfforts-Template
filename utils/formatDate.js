export default (date, seperator) => {
	if (!date) return "Empty";

	const tempDate = new Date(date);

	const month =
		tempDate.getMonth() < 9
			? `0${tempDate.getMonth() + 1}`
			: `${tempDate.getMonth() + 1}`;

	const day =
		tempDate.getDate() < 10
			? `0${tempDate.getDate()}`
			: `${tempDate.getDate()}`;

	const year = tempDate.getFullYear();

	let format = "";

	if (seperator) {
		format = `${day}${seperator}${month}${seperator}${year}`;
	} else format = `${day}/${month}/${year}`;

	return format;
};
