<script>
	let { data } = $props();
	const contactEmail = data.festivalSettings?.contactEmail ?? 'hi@publicshorts.org';
</script>

<div class="flex h-full w-full items-center justify-center">
	<div class="text-gallery-400 flex max-w-lg flex-col gap-4">
		<div>
			<span class="text-gallery-700 font-semibold">Vertreten durch:</span><br />
			Célestin Meunier
			<div>Hobrechstraße 54,</div>
			<div>12047 Berlin</div>
			<div>Deutschland</div>
		</div>
		<div>
			<span class="text-gallery-700 font-semibold">Kontakt:</span><br />
			<span
				>Email: <a href="mailto:{contactEmail}" class="text-blue-600 underline"
					>{contactEmail}</a
				></span
			>
		</div>
		<div>
			<span class="text-gallery-700 font-semibold">Haftungsausschluss:</span>
			<p class="text-gallery-400 mt-1 text-sm italic">
				Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit,
				Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.
			</p>
		</div>
		<div>
			<span class="text-gallery-700 font-semibold"
				>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV:</span
			><br />
			Célestin Meunier<br />
			Horbrechstraße 54<br />
			12047 Berlin
		</div>
	</div>
</div>
