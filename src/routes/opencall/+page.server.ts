// No schema field for open call start date yet — keep hardcoded
const OPEN_CALL_DATE = new Date('2025-12-12T15:00:00');
const FALLBACK_DEADLINE = new Date('2026-01-11T23:59:59');

export async function load({ parent }) {
	const { festivalSettings } = await parent();

	const openCallDeadline = festivalSettings?.openCallDeadline
		? new Date(festivalSettings.openCallDeadline)
		: FALLBACK_DEADLINE;

	const now = new Date();
	return {
		isPastOpenCall: now > OPEN_CALL_DATE,
		isBeforeDeadline: now < openCallDeadline,
		isAfterDeadline: now > openCallDeadline
	};
}
