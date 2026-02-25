export function textToBlocks(text: string) {
	const paragraphs = text.split(/\n\n+/).filter((p) => p.trim());
	return paragraphs.map((paragraph) => ({
		_type: 'block' as const,
		_key: Math.random().toString(36).slice(2, 10),
		style: 'normal' as const,
		markDefs: [],
		children: [
			{
				_type: 'span' as const,
				_key: Math.random().toString(36).slice(2, 10),
				text: paragraph.trim(),
				marks: []
			}
		]
	}));
}

type SocialLink = {
	_type: 'socialLink';
	_key: string;
	platform: string;
	url: string;
	label: string;
};

export function parseSocialMediaToLinks(raw: string): SocialLink[] | undefined {
	const trimmed = raw.trim();
	if (!trimmed) return undefined;

	const urlMatch = trimmed.match(
		/https?:\/\/(www\.)?(instagram\.com|instagr\.am)\/([^\s/?#]+)/i
	);
	if (urlMatch) {
		return [
			{
				_type: 'socialLink',
				_key: Math.random().toString(36).slice(2, 10),
				platform: 'instagram',
				url: `https://instagram.com/${urlMatch[3]}`,
				label: `@${urlMatch[3]}`
			}
		];
	}

	if (/^https?:\/\//i.test(trimmed)) {
		return [
			{
				_type: 'socialLink',
				_key: Math.random().toString(36).slice(2, 10),
				platform: 'website',
				url: trimmed,
				label: trimmed.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')
			}
		];
	}

	const handle = trimmed.replace(/^@/, '');
	if (/^[a-zA-Z0-9._]+$/.test(handle)) {
		return [
			{
				_type: 'socialLink',
				_key: Math.random().toString(36).slice(2, 10),
				platform: 'instagram',
				url: `https://instagram.com/${handle}`,
				label: `@${handle}`
			}
		];
	}

	return [
		{
			_type: 'socialLink',
			_key: Math.random().toString(36).slice(2, 10),
			platform: 'other',
			url: '',
			label: trimmed
		}
	];
}

export function parseWebsiteToLinks(raw: string): SocialLink[] | undefined {
	const trimmed = raw.trim();
	if (!trimmed) return undefined;

	return [
		{
			_type: 'socialLink',
			_key: Math.random().toString(36).slice(2, 10),
			platform: 'website',
			url: trimmed,
			label: trimmed.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')
		}
	];
}
