export async function withTimeLogger(
	f: () => Promise<void>,
	msg: { msgStart?: string, msgEnd?: (time) => void }
) {
	const { msgEnd, msgStart } = msg;
	if (msgStart) {
		console.log(msgStart);
	}

	const start = new Date().getTime();
	await f();
	const end = new Date().getTime();

	if (msgEnd) {
		msgEnd(end - start);
		console.log('\n');
	}
}
