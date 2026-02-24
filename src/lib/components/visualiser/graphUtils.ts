export type NodeType = 'film' | 'meta-category' | 'cluster' | 'screening';
export type LinkType = 'film-meta' | 'film-cluster' | 'film-screening';
export type SizeMode = 'connections' | 'fixed';
export type LabelMode = 'always' | 'hover' | 'never';
export type FilterMode = 'union' | 'intersection';

export interface GraphToggles {
	metaCategories: Record<string, boolean>;
	clusters: Record<string, boolean>;
	screenings: Record<string, boolean>;
}

export interface DisplayOptions {
	sizeMode: SizeMode;
	labelMode: LabelMode;
	forceStrength: number;
	filterMode: FilterMode;
	showMetaCategories: boolean;
	showClusters: boolean;
	showScreenings: boolean;
}

export interface GraphNode {
	id: string;
	type: NodeType;
	label: string;
	val: number;
	color: string;
	active: boolean;
	visible: boolean;
	data: any;
}

export interface GraphLink {
	source: string;
	target: string;
	type: LinkType;
}

export interface GraphData {
	nodes: GraphNode[];
	links: GraphLink[];
	activeFilmIds: Set<string>;
}

export interface FilmNodeData {
	_id: string;
	englishTitle: string;
	directorName: string;
	length: number;
	slug: string;
	[key: string]: any;
}

export interface MetaCategoryNodeData {
	_id: string;
	name: string;
	description: string;
	type: string;
	filmCount: number;
}

export interface ClusterNodeData {
	_id: string;
	name: string;
	description: string;
	keywords: string[];
	filmCount: number;
}

export interface ScreeningNodeData {
	_id: string;
	name: string;
	filmCount: number;
}

const NODE_TYPE_COLORS: Record<NodeType, string> = {
	film: '#857f7a',
	'meta-category': '#ff7411',
	cluster: '#8b5cf6',
	screening: '#eab308',
};

function getFilmSize(sizeMode: SizeMode, connectionCount?: number): number {
	if (sizeMode === 'connections' && connectionCount != null) {
		return Math.max(1, connectionCount * 0.8);
	}
	return 2;
}

function hasAnyEnabled(toggleMap: Record<string, boolean>): boolean {
	return Object.values(toggleMap).some(Boolean);
}

export function computeActiveFilmIds(
	films: FilmNodeData[],
	metaCategories: { _id: string; filmIds: { filmId: string }[] }[],
	clusters: { _id: string; highlightedFilmIds: string[]; relevantFilmIds: string[] }[],
	screenings: { _id: string; filmIds: string[] }[],
	toggles: GraphToggles,
	displayOptions: DisplayOptions
): Set<string> {
	const hasMc = displayOptions.showMetaCategories && hasAnyEnabled(toggles.metaCategories);
	const hasCl = displayOptions.showClusters && hasAnyEnabled(toggles.clusters);
	const hasSc = displayOptions.showScreenings && hasAnyEnabled(toggles.screenings);

	if (!hasMc && !hasCl && !hasSc) {
		return new Set(films.map((f) => f._id));
	}

	const itemSets: Set<string>[] = [];

	if (hasMc)
		for (const mc of metaCategories) {
			if (!toggles.metaCategories[mc._id]) continue;
			itemSets.push(new Set(mc.filmIds.map((e) => e.filmId)));
		}

	if (hasCl)
		for (const cluster of clusters) {
			if (!toggles.clusters[cluster._id]) continue;
			itemSets.push(new Set([...cluster.highlightedFilmIds, ...cluster.relevantFilmIds]));
		}

	if (hasSc)
		for (const screening of screenings) {
			if (!toggles.screenings[screening._id]) continue;
			itemSets.push(new Set(screening.filmIds));
		}

	if (itemSets.length === 0) {
		return new Set(films.map((f) => f._id));
	}

	if (displayOptions.filterMode === 'intersection') {
		const [first, ...rest] = itemSets;
		const result = new Set<string>();
		for (const id of first) {
			if (rest.every((s) => s.has(id))) result.add(id);
		}
		return result;
	}

	const result = new Set<string>();
	for (const s of itemSets) {
		for (const id of s) result.add(id);
	}
	return result;
}

export function buildGraphData(
	films: FilmNodeData[],
	metaCategories: {
		_id: string;
		name: string;
		description: string;
		type: string;
		filmIds: { filmId: string; score: number }[];
	}[],
	clusters: {
		_id: string;
		name: string;
		description: string;
		keywords: string[];
		highlightedFilmIds: string[];
		relevantFilmIds: string[];
	}[],
	screenings: {
		_id: string;
		name: string;
		filmIds: string[];
	}[],
	toggles: GraphToggles,
	displayOptions: DisplayOptions
): GraphData {
	const nodes: GraphNode[] = [];
	const links: GraphLink[] = [];
	const filmIdSet = new Set(films.map((f) => f._id));

	const activeFilmIds = computeActiveFilmIds(
		films,
		metaCategories,
		clusters,
		screenings,
		toggles,
		displayOptions
	);

	for (const film of films) {
		const active = activeFilmIds.has(film._id);
		nodes.push({
			id: film._id,
			type: 'film',
			label: film.englishTitle,
			val: getFilmSize(displayOptions.sizeMode),
			color: NODE_TYPE_COLORS.film,
			active,
			visible: true,
			data: film,
		});
	}

	if (displayOptions.showMetaCategories)
		for (const mc of metaCategories) {
			const validFilmIds = mc.filmIds.filter((e) => filmIdSet.has(e.filmId));
			if (validFilmIds.length === 0) continue;
			const enabled = !!toggles.metaCategories[mc._id];

			nodes.push({
				id: `mc-${mc._id}`,
				type: 'meta-category',
				label: mc.name,
				val: 6,
				color: NODE_TYPE_COLORS['meta-category'],
				active: enabled,
				visible: true,
				data: {
					_id: mc._id,
					name: mc.name,
					description: mc.description,
					type: mc.type,
					filmCount: validFilmIds.length,
				} as MetaCategoryNodeData,
			});

			for (const entry of validFilmIds) {
				links.push({
					source: entry.filmId,
					target: `mc-${mc._id}`,
					type: 'film-meta',
				});
			}
		}

	if (displayOptions.showClusters)
		for (const cluster of clusters) {
			const allFilmIds = [...cluster.highlightedFilmIds, ...cluster.relevantFilmIds].filter(
				(id) => filmIdSet.has(id)
			);
			const uniqueFilmIds = [...new Set(allFilmIds)];
			if (uniqueFilmIds.length === 0) continue;
			const enabled = !!toggles.clusters[cluster._id];

			nodes.push({
				id: `cl-${cluster._id}`,
				type: 'cluster',
				label: cluster.name,
				val: 5,
				color: NODE_TYPE_COLORS.cluster,
				active: enabled,
				visible: true,
				data: {
					_id: cluster._id,
					name: cluster.name,
					description: cluster.description,
					keywords: cluster.keywords,
					filmCount: uniqueFilmIds.length,
				} as ClusterNodeData,
			});

			for (const filmId of uniqueFilmIds) {
				links.push({
					source: filmId,
					target: `cl-${cluster._id}`,
					type: 'film-cluster',
				});
			}
		}

	// Screening nodes + links
	if (displayOptions.showScreenings)
		for (const screening of screenings) {
			const validFilmIds = screening.filmIds.filter((id) => filmIdSet.has(id));
			if (validFilmIds.length === 0) continue;
			const enabled = !!toggles.screenings[screening._id];

			nodes.push({
				id: `sc-${screening._id}`,
				type: 'screening',
				label: screening.name,
				val: 5,
				color: NODE_TYPE_COLORS.screening,
				active: enabled,
				visible: true,
				data: {
					_id: screening._id,
					name: screening.name,
					filmCount: validFilmIds.length,
				} as ScreeningNodeData,
			});

			for (const filmId of validFilmIds) {
				links.push({
					source: filmId,
					target: `sc-${screening._id}`,
					type: 'film-screening',
				});
			}
		}

	if (displayOptions.sizeMode === 'connections') {
		const connectionCounts = new Map<string, number>();
		for (const link of links) {
			const src = typeof link.source === 'string' ? link.source : (link.source as any).id;
			const tgt = typeof link.target === 'string' ? link.target : (link.target as any).id;
			connectionCounts.set(src, (connectionCounts.get(src) || 0) + 1);
			connectionCounts.set(tgt, (connectionCounts.get(tgt) || 0) + 1);
		}
		for (const node of nodes) {
			const count = connectionCounts.get(node.id) || 0;
			if (node.type === 'film') {
				node.val = getFilmSize('connections', count);
			} else {
				node.val = Math.max(2, count * 0.5);
			}
		}
	}

	return { nodes, links, activeFilmIds };
}

export function dimColor(hex: string, amount = 0.15): string {
	if (hex.startsWith('rgb')) {
		const match = hex.match(/(\d+)/g);
		if (match) {
			const [r, g, b] = match.map(Number);
			return `rgba(${r},${g},${b},${amount})`;
		}
	}
	const r = parseInt(hex.slice(1, 3), 16);
	const g = parseInt(hex.slice(3, 5), 16);
	const b = parseInt(hex.slice(5, 7), 16);
	return `rgba(${r},${g},${b},${amount})`;
}

export function formatDuration(minutes: number): string {
	const h = Math.floor(minutes / 60);
	const m = minutes % 60;
	if (h === 0) return `${m}m`;
	return `${h}h ${m}m`;
}

// --- Mini graph (film detail page) ---

export interface MiniGraphInput {
	currentFilmId: string;
	currentFilmTitle: string;
	currentFilmSlug: string;
	metaCategories: Array<{ _id: string; name: string; filmIds: string[] }>;
	clusters: Array<{ _id: string; name: string; filmIds: string[] }>;
	screenings: Array<{ _id: string; name: string; filmIds: string[] }>;
	neighborFilms: Array<{
		_id: string;
		englishTitle: string;
		length: number;
		slug: string;
	}>;
}

export function buildMiniGraphData(input: MiniGraphInput): GraphData {
	const nodes: GraphNode[] = [];
	const links: GraphLink[] = [];
	const allFilmIds = new Set<string>();

	// Current film as central node
	nodes.push({
		id: input.currentFilmId,
		type: 'film',
		label: input.currentFilmTitle,
		val: 4,
		color: NODE_TYPE_COLORS.film,
		active: true,
		visible: true,
		data: { _id: input.currentFilmId, englishTitle: input.currentFilmTitle, slug: input.currentFilmSlug },
	});
	allFilmIds.add(input.currentFilmId);

	// Neighbor films (dimmed)
	for (const film of input.neighborFilms) {
		if (allFilmIds.has(film._id)) continue;
		allFilmIds.add(film._id);
		nodes.push({
			id: film._id,
			type: 'film',
			label: film.englishTitle,
			val: 2,
			color: NODE_TYPE_COLORS.film,
			active: false,
			visible: true,
			data: film,
		});
	}

	// Meta-category nodes + links
	for (const mc of input.metaCategories) {
		nodes.push({
			id: `mc-${mc._id}`,
			type: 'meta-category',
			label: mc.name,
			val: 4,
			color: NODE_TYPE_COLORS['meta-category'],
			active: true,
			visible: true,
			data: { _id: mc._id, name: mc.name, filmCount: mc.filmIds.length },
		});
		for (const filmId of mc.filmIds) {
			if (allFilmIds.has(filmId)) {
				links.push({ source: filmId, target: `mc-${mc._id}`, type: 'film-meta' });
			}
		}
	}

	// Cluster nodes + links
	for (const cl of input.clusters) {
		nodes.push({
			id: `cl-${cl._id}`,
			type: 'cluster',
			label: cl.name,
			val: 4,
			color: NODE_TYPE_COLORS.cluster,
			active: true,
			visible: true,
			data: { _id: cl._id, name: cl.name, filmCount: cl.filmIds.length },
		});
		for (const filmId of cl.filmIds) {
			if (allFilmIds.has(filmId)) {
				links.push({ source: filmId, target: `cl-${cl._id}`, type: 'film-cluster' });
			}
		}
	}

	// Screening nodes + links
	for (const sc of input.screenings) {
		nodes.push({
			id: `sc-${sc._id}`,
			type: 'screening',
			label: sc.name,
			val: 4,
			color: NODE_TYPE_COLORS.screening,
			active: true,
			visible: true,
			data: { _id: sc._id, name: sc.name, filmCount: sc.filmIds.length },
		});
		for (const filmId of sc.filmIds) {
			if (allFilmIds.has(filmId)) {
				links.push({ source: filmId, target: `sc-${sc._id}`, type: 'film-screening' });
			}
		}
	}

	return { nodes, links, activeFilmIds: new Set([input.currentFilmId]) };
}
