import{p as V,f as i,j as S,z as x,b as s,a as q,A as w,s as N,c as p,k as f,l as d,i as L}from"./iframe-6KIpb0Mt.js";import{c as B,d as H}from"./create-runtime-stories-C7cqMwQp.js";import{G as c,f as G}from"./client-8ns0aL8_.js";import"./preload-helper-PPVm8Dsz.js";import"./this-DkeGxGfh.js";const I={title:"Visualiser/GraphTooltip",component:c},{Story:u}=H();var J=i('<div class="relative h-64 w-full"><!></div>'),K=i('<div class="relative h-64 w-full"><!></div>'),Q=i('<div class="relative h-64 w-full"><!></div>'),W=i('<p class="p-4 text-sm text-gallery-400">Loading from Sanity...</p>'),X=i('<p class="p-4 text-sm text-red-500">No film data found</p>'),Y=i('<div class="relative h-64 w-full"><!></div>'),Z=i('<p class="p-4 text-sm text-gallery-400">Loading from Sanity...</p>'),ee=i('<p class="p-4 text-sm text-red-500">No category data found</p>'),te=i('<div class="relative h-64 w-full"><!></div>'),ae=i('<p class="p-4 text-sm text-gallery-400">Loading from Sanity...</p>'),le=i('<p class="p-4 text-sm text-red-500">No cluster data found</p>'),se=i('<div class="relative h-64 w-full"><!></div>'),ne=i("<!> <!> <!> <!> <!> <!>",1);function z(E,O){V(O,!0);let M=N(null),T=N(null),F=N(null),b=N(!1);async function P(){const[m,r,a]=await Promise.all([G('*[_type == "submission"][0..9]{ _id, englishTitle, directorName, length }'),G('*[_type == "metaCategory"][0..4]{ _id, name, "filmCount": count(films) }'),G('*[_type == "semanticCluster"][0..4]{ _id, name, "filmCount": count(highlightedFilms) + count(relevantFilms) }')]),l=m?.[0];l&&w(M,{id:l._id,type:"film",label:l.englishTitle,val:3,color:"#857f7a",active:!0,visible:!0,data:{englishTitle:l.englishTitle,directorName:l.directorName,length:l.length}},!0);const o=r?.[0];o&&w(T,{id:`mc-${o._id}`,type:"meta-category",label:o.name,val:4,color:"#ff7411",active:!0,visible:!0,data:{name:o.name,filmCount:o.filmCount}},!0);const v=a?.[0];v&&w(F,{id:`cl-${v._id}`,type:"cluster",label:v.name,val:4,color:"#8b5cf6",active:!0,visible:!0,data:{name:v.name,filmCount:v.filmCount}},!0),w(b,!0)}P();var $=ne(),D=S($);u(D,{name:"Film",template:r=>{var a=J(),l=p(a);c(l,{node:{id:"film-1",type:"film",label:"Dawn Chorus",val:3,color:"#857f7a",active:!0,visible:!0,data:{englishTitle:"Dawn Chorus",directorName:"Alice Martin",length:12}},x:120,y:80}),s(r,a)},$$slots:{template:!0},parameters:{__svelteCsf:{rawCode:`<div class="relative h-64 w-full">
	<GraphTooltip
		node={{
			id: 'film-1',
			type: 'film',
			label: 'Dawn Chorus',
			val: 3,
			color: '#857f7a',
			active: true,
			visible: true,
			data: {
				englishTitle: 'Dawn Chorus',
				directorName: 'Alice Martin',
				length: 12,
			},
		}}
		x={120}
		y={80}
	/>
</div>`}}});var U=x(D,2);u(U,{name:"Meta-category",template:r=>{var a=K(),l=p(a);c(l,{node:{id:"mc-1",type:"meta-category",label:"Documentary",val:4,color:"#ff7411",active:!0,visible:!0,data:{name:"Documentary",filmCount:8}},x:120,y:80}),s(r,a)},$$slots:{template:!0},parameters:{__svelteCsf:{rawCode:`<div class="relative h-64 w-full">
	<GraphTooltip
		node={{
			id: 'mc-1',
			type: 'meta-category',
			label: 'Documentary',
			val: 4,
			color: '#ff7411',
			active: true,
			visible: true,
			data: { name: 'Documentary', filmCount: 8 },
		}}
		x={120}
		y={80}
	/>
</div>`}}});var A=x(U,2);u(A,{name:"Cluster",template:r=>{var a=Q(),l=p(a);c(l,{node:{id:"cl-1",type:"cluster",label:"Urban Landscapes",val:4,color:"#8b5cf6",active:!0,visible:!0,data:{name:"Urban Landscapes",filmCount:5}},x:120,y:80}),s(r,a)},$$slots:{template:!0},parameters:{__svelteCsf:{rawCode:`<div class="relative h-64 w-full">
	<GraphTooltip
		node={{
			id: 'cl-1',
			type: 'cluster',
			label: 'Urban Landscapes',
			val: 4,
			color: '#8b5cf6',
			active: true,
			visible: true,
			data: { name: 'Urban Landscapes', filmCount: 5 },
		}}
		x={120}
		y={80}
	/>
</div>`}}});var k=x(A,2);u(k,{name:"Film (Sanity)",template:r=>{var a=Y(),l=p(a);{var o=e=>{var n=W();s(e,n)},v=e=>{var n=L(),_=S(n);{var g=t=>{c(t,{get node(){return d(M)},x:120,y:80})},C=t=>{var h=X();s(t,h)};f(_,t=>{d(M)?t(g):t(C,!1)},!0)}s(e,n)};f(l,e=>{d(b)?e(v,!1):e(o)})}s(r,a)},$$slots:{template:!0},parameters:{__svelteCsf:{rawCode:`<div class="relative h-64 w-full">
	{#if !sanityLoaded}
		<p class="p-4 text-sm text-gallery-400">Loading from Sanity...</p>
	{:else if sanityFilmNode}
		<GraphTooltip node={sanityFilmNode} x={120} y={80} />
	{:else}
		<p class="p-4 text-sm text-red-500">No film data found</p>
	{/if}
</div>`}}});var j=x(k,2);u(j,{name:"Meta-category (Sanity)",template:r=>{var a=te(),l=p(a);{var o=e=>{var n=Z();s(e,n)},v=e=>{var n=L(),_=S(n);{var g=t=>{c(t,{get node(){return d(T)},x:120,y:80})},C=t=>{var h=ee();s(t,h)};f(_,t=>{d(T)?t(g):t(C,!1)},!0)}s(e,n)};f(l,e=>{d(b)?e(v,!1):e(o)})}s(r,a)},$$slots:{template:!0},parameters:{__svelteCsf:{rawCode:`<div class="relative h-64 w-full">
	{#if !sanityLoaded}
		<p class="p-4 text-sm text-gallery-400">Loading from Sanity...</p>
	{:else if sanityMcNode}
		<GraphTooltip node={sanityMcNode} x={120} y={80} />
	{:else}
		<p class="p-4 text-sm text-red-500">No category data found</p>
	{/if}
</div>`}}});var R=x(j,2);u(R,{name:"Cluster (Sanity)",template:r=>{var a=se(),l=p(a);{var o=e=>{var n=ae();s(e,n)},v=e=>{var n=L(),_=S(n);{var g=t=>{c(t,{get node(){return d(F)},x:120,y:80})},C=t=>{var h=le();s(t,h)};f(_,t=>{d(F)?t(g):t(C,!1)},!0)}s(e,n)};f(l,e=>{d(b)?e(v,!1):e(o)})}s(r,a)},$$slots:{template:!0},parameters:{__svelteCsf:{rawCode:`<div class="relative h-64 w-full">
	{#if !sanityLoaded}
		<p class="p-4 text-sm text-gallery-400">Loading from Sanity...</p>
	{:else if sanityClNode}
		<GraphTooltip node={sanityClNode} x={120} y={80} />
	{:else}
		<p class="p-4 text-sm text-red-500">No cluster data found</p>
	{/if}
</div>`}}}),s(E,$),q()}z.__docgen={data:[],name:"GraphTooltip.stories.svelte"};const y=B(z,I),me=["Film","MetaCategory","Cluster","FilmSanity","MetaCategorySanity","ClusterSanity"],ce={...y.Film,tags:["svelte-csf-v5"]},pe={...y.MetaCategory,tags:["svelte-csf-v5"]},fe={...y.Cluster,tags:["svelte-csf-v5"]},ue={...y.FilmSanity,tags:["svelte-csf-v5"]},ye={...y.MetaCategorySanity,tags:["svelte-csf-v5"]},_e={...y.ClusterSanity,tags:["svelte-csf-v5"]};export{fe as Cluster,_e as ClusterSanity,ce as Film,ue as FilmSanity,pe as MetaCategory,ye as MetaCategorySanity,me as __namedExportsOrder,I as default};
