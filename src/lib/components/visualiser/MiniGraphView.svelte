<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import {
		type GraphData,
		type GraphNode,
		dimColor,
	} from './graphUtils';

	interface Props {
		graphData: GraphData;
		currentFilmId: string;
		onNodeHover?: (node: GraphNode | null, pos: { x: number; y: number }) => void;
	}

	let { graphData, currentFilmId, onNodeHover }: Props = $props();

	let containerEl = $state<HTMLDivElement>();
	let graph: any = $state(null);
	let highlightedNodeIds = $state<Set<string>>(new Set());

	onMount(async () => {
		const module = await import('force-graph');
		const ForceGraph = module.default;
		initGraph(ForceGraph);
	});

	onDestroy(() => {
		if (graph) {
			graph._destructor?.();
			graph = null;
		}
	});

	function initGraph(ForceGraph: any) {
		if (!containerEl) return;
		graph = ForceGraph()(containerEl)
			.graphData({ nodes: [], links: [] })
			.nodeId('id')
			.nodeVal('val')
			.nodeLabel('')
			.backgroundColor('rgba(0,0,0,0)')
			.nodeVisibility((node: any) => node.visible !== false)
			.linkVisibility((link: any) => {
				const srcId = typeof link.source === 'object' ? link.source.id : link.source;
				const tgtId = typeof link.target === 'object' ? link.target.id : link.target;
				const currentData = graph?.graphData();
				if (!currentData) return true;
				const srcNode = currentData.nodes.find((n: any) => n.id === srcId);
				const tgtNode = currentData.nodes.find((n: any) => n.id === tgtId);
				if (srcNode?.visible === false || tgtNode?.visible === false) return false;
				return true;
			})
			.linkColor((link: any) => {
				const srcId = typeof link.source === 'object' ? link.source.id : link.source;
				const tgtId = typeof link.target === 'object' ? link.target.id : link.target;

				if (highlightedNodeIds.size > 0) {
					if (highlightedNodeIds.has(srcId) && highlightedNodeIds.has(tgtId)) {
						return linkColorByType(link.type, 0.7);
					}
					return 'rgba(0,0,0,0.03)';
				}
				return linkColorByType(link.type, 0.25);
			})
			.linkWidth((link: any) => {
				if (highlightedNodeIds.size > 0) {
					const srcId =
						typeof link.source === 'object' ? link.source.id : link.source;
					const tgtId =
						typeof link.target === 'object' ? link.target.id : link.target;
					if (highlightedNodeIds.has(srcId) && highlightedNodeIds.has(tgtId))
						return 1.5;
					return 0.2;
				}
				return 0.5;
			})
			.nodeCanvasObject(
				(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
					drawNode(node, ctx, globalScale);
				}
			)
			.nodePointerAreaPaint(
				(node: any, color: string, ctx: CanvasRenderingContext2D) => {
					const radius = getNodeRadius(node) + 2;
					ctx.beginPath();
					ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
					ctx.fillStyle = color;
					ctx.fill();
				}
			)
			.onNodeHover((node: any) => {
				if (containerEl) containerEl.style.cursor = node ? 'pointer' : 'default';
				if (node) {
					const connected = new Set<string>([node.id]);
					const data = graph.graphData();
					for (const link of data.links) {
						const srcId =
							typeof link.source === 'object' ? link.source.id : link.source;
						const tgtId =
							typeof link.target === 'object' ? link.target.id : link.target;
						if (srcId === node.id) connected.add(tgtId);
						if (tgtId === node.id) connected.add(srcId);
					}
					highlightedNodeIds = connected;

					if (onNodeHover) {
						const canvas = containerEl?.querySelector('canvas');
						if (canvas) {
							const rect = canvas.getBoundingClientRect();
							const coords = graph.graph2ScreenCoords(node.x, node.y);
							onNodeHover(node, {
								x: rect.left + coords.x,
								y: rect.top + coords.y,
							});
						}
					}
				} else {
					highlightedNodeIds = new Set();
					onNodeHover?.(null, { x: 0, y: 0 });
				}
			})
			.onNodeClick((node: any) => {
				handleNodeClick(node);
			})
			.onBackgroundClick(() => {
				highlightedNodeIds = new Set();
			})
			.warmupTicks(50)
			.cooldownTicks(200)
			.d3AlphaDecay(0.05)
			.d3VelocityDecay(0.5);

		// Compact force params
		graph.d3Force('charge').strength(-100);
		graph.d3Force('link').distance(35);

		const gravity = createGravityForce(0.15);
		graph.d3Force('gravity', gravity);

		if (graphData.nodes.length > 0) {
			graph.graphData({ nodes: [...graphData.nodes], links: [...graphData.links] });
			setTimeout(() => graph?.zoomToFit(400, 40), 600);
		}

		const observer = new ResizeObserver(() => {
			if (graph && containerEl) {
				graph.width(containerEl.clientWidth).height(containerEl.clientHeight);
			}
		});
		observer.observe(containerEl!);

		return () => observer.disconnect();
	}

	function createGravityForce(strength: number) {
		let nodes: any[] = [];
		function force(alpha: number) {
			for (const node of nodes) {
				node.vx -= node.x * strength * alpha;
				node.vy -= node.y * strength * alpha;
			}
		}
		force.initialize = (n: any[]) => {
			nodes = n;
		};
		return force;
	}

	function linkColorByType(type: string, opacity: number): string {
		switch (type) {
			case 'film-meta':
				return `rgba(204, 70, 0, ${opacity})`;
			case 'film-cluster':
				return `rgba(124, 58, 237, ${opacity})`;
			default:
				return `rgba(69, 65, 61, ${opacity})`;
		}
	}

	function getNodeRadius(node: any): number {
		return Math.sqrt(node.val || 2) * 3;
	}

	function drawNode(node: any, ctx: CanvasRenderingContext2D, globalScale: number) {
		const radius = getNodeRadius(node);
		const isCurrent = node.id === currentFilmId;
		const isActive = node.active !== false;
		const isHighlighted =
			highlightedNodeIds.size === 0 || highlightedNodeIds.has(node.id);
		const dimmed = !isActive || !isHighlighted;
		const color = dimmed ? dimColor(node.color, 0.2) : node.color;

		// Accent ring for current film
		if (isCurrent && !dimmed) {
			ctx.beginPath();
			ctx.arc(node.x, node.y, radius + 2, 0, 2 * Math.PI);
			ctx.fillStyle = 'rgba(133, 127, 122, 0.15)';
			ctx.fill();
		}

		ctx.beginPath();

		if (node.type === 'meta-category') {
			drawRoundedRect(ctx, node.x - radius, node.y - radius, radius * 2, radius * 2, 3);
		} else if (node.type === 'cluster') {
			drawDiamond(ctx, node.x, node.y, radius);
		} else {
			ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
		}

		ctx.fillStyle = color;
		ctx.fill();

		if (!dimmed && (node.type === 'meta-category' || node.type === 'cluster')) {
			ctx.shadowColor = node.color;
			ctx.shadowBlur = 8;
			ctx.fill();
			ctx.shadowBlur = 0;
		}

		// Labels: always show for categories/clusters, only on hover for films
		const showLabel =
			node.type !== 'film' ||
			isCurrent ||
			highlightedNodeIds.has(node.id);

		if (showLabel && !dimmed) {
			const fontSize = Math.max(9, 11 / globalScale);
			ctx.font = `${isCurrent ? 'bold ' : ''}${fontSize}px sans-serif`;
			ctx.textAlign = 'center';
			ctx.textBaseline = 'top';
			ctx.fillStyle = dimmed ? 'rgba(69,65,61,0.25)' : 'rgba(69,65,61,0.85)';
			ctx.fillText(node.label, node.x, node.y + radius + 3 / globalScale);
		}
	}

	function drawRoundedRect(
		ctx: CanvasRenderingContext2D,
		x: number,
		y: number,
		w: number,
		h: number,
		r: number
	) {
		ctx.moveTo(x + r, y);
		ctx.lineTo(x + w - r, y);
		ctx.quadraticCurveTo(x + w, y, x + w, y + r);
		ctx.lineTo(x + w, y + h - r);
		ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
		ctx.lineTo(x + r, y + h);
		ctx.quadraticCurveTo(x, y + h, x, y + h - r);
		ctx.lineTo(x, y + r);
		ctx.quadraticCurveTo(x, y, x + r, y);
		ctx.closePath();
	}

	function drawDiamond(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
		ctx.moveTo(x, y - r);
		ctx.lineTo(x + r, y);
		ctx.lineTo(x, y + r);
		ctx.lineTo(x - r, y);
		ctx.closePath();
	}

	function handleNodeClick(node: any) {
		if (node.type === 'meta-category') {
			const id = node.id.replace('mc-', '');
			goto(`/programme/map?filter=mc-${id}`);
		} else if (node.type === 'cluster') {
			const id = node.id.replace('cl-', '');
			goto(`/programme/map?filter=cl-${id}`);
		} else if (node.type === 'film' && node.data?.slug) {
			goto(`/programme/${node.data.slug}`);
		}
	}

	$effect(() => {
		if (graph) {
			highlightedNodeIds;
			graph.nodeColor(graph.nodeColor());
		}
	});
</script>

<div bind:this={containerEl} class="h-full w-full"></div>
