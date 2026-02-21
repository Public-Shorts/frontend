import Janus from 'janus-gateway';
import type { JanusJS } from 'janus-gateway';
import adapter from 'webrtc-adapter';

export type StreamStatus = 'idle' | 'connecting' | 'connected' | 'stopped' | 'error';

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

export function createJanusStream(
	server: string,
	audioEl: HTMLAudioElement,
	onStatus: (status: StreamStatus, detail?: string) => void,
	streamId?: number
): JanusStream {
	let janus: InstanceType<typeof Janus> | null = null;
	let streaming: JanusJS.PluginHandle | null = null;

	function connect() {
		onStatus('connecting');

		Janus.init({
			debug: 'all',
			dependencies: Janus.useDefaultDependencies({ adapter }),
			callback: () => {
				janus = new Janus({
					server,
					iceServers: [
						{ urls: 'stun:janus.enabler.space:3478' },
						{
							urls: 'turn:janus.enabler.space:3478',
							username: 'janususer',
							credential: 'januspassword'
						}
					],
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
				// List available streams, then watch one
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
					// We got an SDP offer — create an answer
					// customizeSdp exists at runtime but is missing from PluginCreateAnswerParam typings
					streaming?.createAnswer({
						jsep,
						tracks: [{ type: 'audio', capture: false, recv: true }],
						customizeSdp: (sdp: JanusJS.JSEP) => {
							// Enable stereo and FEC in Opus
							if (sdp.sdp) {
								sdp.sdp = sdp.sdp.replace(
									'useinbandfec=1',
									'useinbandfec=1;stereo=1'
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
				if (!on || track.kind !== 'audio') return;
				const stream = new MediaStream([track]);
				Janus.attachMediaStream(audioEl, stream);
				audioEl.play().catch(() => {
					// Autoplay may be blocked; user interaction required
				});
			},
			oncleanup: () => {
				onStatus('stopped');
			}
		});
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
		if (streaming) {
			streaming.send({ message: { request: 'stop' } });
			streaming.hangup();
		}
		audioEl.srcObject = null;
		onStatus('stopped');
	}

	function destroy() {
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
