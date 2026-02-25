import Janus from 'janus-gateway';
import type { JanusJS } from 'janus-gateway';
import adapter from 'webrtc-adapter';

export type StreamStatus = 'idle' | 'connecting' | 'connected' | 'stopped' | 'error';

export interface StreamStats {
	packetsReceived: number;
	packetsLost: number;
	lossPercent: number;
	jitter: number;
	roundTripTime: number;
	bitrate: number;
	candidateType: string;
}

export interface JanusStream {
	connect: () => void;
	disconnect: () => void;
	destroy: () => void;
}

interface StreamInfo {
	id: number;
	description?: string;
	type?: string;
}

const STATS_INTERVAL_MS = 3000;
const PLAYOUT_DELAY_S = 0.08;

export function createJanusStream(
	server: string,
	audioEl: HTMLAudioElement,
	onStatus: (status: StreamStatus, detail?: string) => void,
	streamId?: number,
	onStats?: (stats: StreamStats) => void
): JanusStream {
	let janus: InstanceType<typeof Janus> | null = null;
	let streaming: JanusJS.PluginHandle | null = null;
	let statsTimer: ReturnType<typeof setInterval> | null = null;
	let prevBytesReceived = 0;
	let prevTimestamp = 0;

	function connect() {
		onStatus('connecting');

		Janus.init({
			debug: ['error'] as JanusJS.DebugLevel[],
			dependencies: Janus.useDefaultDependencies({ adapter }),
			callback: () => {
				janus = new Janus({
					server,
					iceServers: [
						{ urls: 'stun:janus.enabler.space:3478' }
					],
					iceTransportPolicy: 'all',
					success: () => {
						attachPlugin();
					},
					error: (err) => {
						onStatus('error', String(err));
					},
					destroyed: () => {
						onStatus('stopped');
					}
				});
			}
		});
	}

	function attachPlugin() {
		if (!janus) return;

		janus.attach({
			plugin: 'janus.plugin.streaming',
			success: (handle) => {
				streaming = handle;
				listAndWatch();
			},
			error: (err) => {
				onStatus('error', String(err));
			},
			onmessage: (msg, jsep) => {
				if (msg.error) {
					onStatus('error', msg.error);
					return;
				}

				if (msg.result?.status) {
					const status = msg.result.status;
					if (status === 'starting' || status === 'started') {
						onStatus('connected');
					} else if (status === 'stopped') {
						onStatus('stopped');
					}
				}

				if (jsep) {
					streaming?.createAnswer({
						jsep,
						tracks: [{ type: 'audio', capture: false, recv: true }],
						customizeSdp: (sdp: JanusJS.JSEP) => {
							if (sdp.sdp) {
								// Enable FEC for packet-loss resilience; only request stereo
								// if the offer already advertises it
								const offersStereo = jsep.sdp?.includes('stereo=1') ?? false;
								sdp.sdp = sdp.sdp.replace(
									'useinbandfec=1',
									offersStereo
										? 'useinbandfec=1;stereo=1'
										: 'useinbandfec=1'
								);
							}
						},
						success: (ourjsep) => {
							streaming?.send({
								message: { request: 'start' },
								jsep: ourjsep
							});
						},
						error: (err) => {
							onStatus('error', String(err));
						}
					} as JanusJS.PluginCreateAnswerParam);
				}
			},
			onremotetrack: (track, _mid, on) => {
				if (track.kind !== 'audio') return;

				// Track toggled off — nothing to do (the stream stays attached)
				if (!on) return;

				// Only attach if the audio element doesn't already have this track
				const existing = audioEl.srcObject as MediaStream | null;
				if (!existing || existing.getAudioTracks()[0]?.id !== track.id) {
					const ms = new MediaStream([track]);
					audioEl.srcObject = ms;
				}

				// Set a small playout delay to absorb jitter without noticeable latency
				const pc = streaming?.webrtcStuff?.pc as RTCPeerConnection | undefined;
				if (pc) {
					for (const receiver of pc.getReceivers()) {
						if (receiver.track.kind === 'audio') {
							(receiver as any).playoutDelayHint = PLAYOUT_DELAY_S;
						}
					}
					startStatsPoller(pc);
				}

				audioEl.play().catch(() => {
					// Autoplay may be blocked; user interaction required
				});
			},
			oncleanup: () => {
				onStatus('stopped');
			}
		});
	}

	function startStatsPoller(pc: RTCPeerConnection) {
		stopStatsPoller();
		prevBytesReceived = 0;
		prevTimestamp = 0;

		statsTimer = setInterval(async () => {
			try {
				const report = await pc.getStats();
				let stats: Partial<StreamStats> = {};

				report.forEach((entry) => {
					if (entry.type === 'inbound-rtp' && entry.kind === 'audio') {
						const received = entry.packetsReceived ?? 0;
						const lost = entry.packetsLost ?? 0;
						stats.packetsReceived = received;
						stats.packetsLost = lost;
						const total = received + lost;
						stats.lossPercent = total > 0 ? (lost / total) * 100 : 0;
						stats.jitter = (entry.jitter ?? 0) * 1000; // s → ms

						const now = entry.timestamp;
						const bytes = entry.bytesReceived ?? 0;
						if (prevTimestamp > 0) {
							const dtS = (now - prevTimestamp) / 1000;
							stats.bitrate = dtS > 0 ? ((bytes - prevBytesReceived) * 8) / dtS : 0;
						}
						prevBytesReceived = bytes;
						prevTimestamp = now;
					}

					if (entry.type === 'candidate-pair' && entry.state === 'succeeded') {
						stats.roundTripTime = (entry.currentRoundTripTime ?? 0) * 1000; // s → ms
					}

					if (entry.type === 'remote-candidate' && !stats.candidateType) {
						stats.candidateType = entry.candidateType ?? 'unknown';
					}
				});

				const full: StreamStats = {
					packetsReceived: stats.packetsReceived ?? 0,
					packetsLost: stats.packetsLost ?? 0,
					lossPercent: Math.round((stats.lossPercent ?? 0) * 100) / 100,
					jitter: Math.round((stats.jitter ?? 0) * 100) / 100,
					roundTripTime: Math.round((stats.roundTripTime ?? 0) * 100) / 100,
					bitrate: Math.round(stats.bitrate ?? 0),
					candidateType: stats.candidateType ?? 'unknown'
				};

				console.log(
					`[stream-stats] pkts=${full.packetsReceived} loss=${full.lossPercent}% jitter=${full.jitter}ms rtt=${full.roundTripTime}ms bitrate=${full.bitrate}bps ice=${full.candidateType}`
				);
				onStats?.(full);
			} catch {
				// PC may have closed
			}
		}, STATS_INTERVAL_MS);
	}

	function stopStatsPoller() {
		if (statsTimer) {
			clearInterval(statsTimer);
			statsTimer = null;
		}
	}

	function listAndWatch() {
		if (!streaming) return;

		if (streamId) {
			watchStream(streamId);
			return;
		}

		streaming.send({
			message: { request: 'list' },
			success: (result: { list?: StreamInfo[] }) => {
				const list = result?.list;
				if (!list || list.length === 0) {
					onStatus('error', 'No streams available');
					return;
				}
				watchStream(list[0].id);
			}
		});
	}

	function watchStream(id: number) {
		streaming?.send({
			message: { request: 'watch', id }
		});
	}

	function disconnect() {
		stopStatsPoller();
		if (streaming) {
			streaming.send({ message: { request: 'stop' } });
			streaming.hangup();
		}
		audioEl.srcObject = null;
		onStatus('stopped');
	}

	function destroy() {
		stopStatsPoller();
		if (streaming) {
			streaming.detach();
			streaming = null;
		}
		if (janus) {
			janus.destroy({ cleanupHandles: true });
			janus = null;
		}
	}

	return { connect, disconnect, destroy };
}
