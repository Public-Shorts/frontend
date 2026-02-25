const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./MiniGraphView-U4n1WaHx.js","./preload-helper-PPVm8Dsz.js","./iframe-6KIpb0Mt.js","./iframe-CJ5QVpwD.css","./this-DkeGxGfh.js","./graphUtils-aBi1ZnmZ.js"])))=>i.map(i=>d[i]);
import{p as R,s as k,w as J,i as S,j as p,k as I,b as a,a as j,l as n,u as w,f as m,z as T,c as _,B as K,A as y,a8 as W}from"./iframe-6KIpb0Mt.js";import{c as X,d as Y}from"./create-runtime-stories-C7cqMwQp.js";import{_ as Z}from"./preload-helper-PPVm8Dsz.js";import{a as $}from"./await-Db6Me7WH.js";import{b as ee}from"./graphUtils-aBi1ZnmZ.js";import{G as te,f as C}from"./client-8ns0aL8_.js";import"./this-DkeGxGfh.js";var ie=m('<div class="font-semibold md:col-span-1">Connections</div> <div class="md:col-span-4"><div class="w-full overflow-hidden" style="height: 350px;"><!></div> <!> <div class="mt-3 flex items-center justify-between text-[11px] text-gallery-400"><div class="flex items-center gap-4"><span class="flex items-center gap-1.5"><span class="inline-block h-2 w-2 rounded-full" style="background: #857f7a"></span> Film</span> <span class="flex items-center gap-1.5"><span class="inline-block h-2 w-2 rounded-sm" style="background: #ff7411"></span> Category</span> <span class="flex items-center gap-1.5"><span class="inline-block h-2 w-2 rotate-45 rounded-sm" style="background: #8b5cf6"></span> Cluster</span> <span class="flex items-center gap-1.5"><svg class="h-2 w-2" viewBox="0 0 10 10"><polygon points="5,0 10,8.66 0,8.66" fill="#eab308"></polygon></svg> Screening</span></div> <a href="/programme/map" class="text-gallery-500 underline underline-offset-2 hover:text-gallery-700">View full map</a></div></div>',1);function h(D,t){R(t,!0);let g=k(null),d=k(J({x:0,y:0}));const M=w(()=>ee({currentFilmId:t.currentFilmId,currentFilmTitle:t.currentFilmTitle,currentFilmSlug:t.currentFilmSlug,metaCategories:t.metaCategories,clusters:t.clusters,screenings:t.screenings,neighborFilms:t.neighborFilms})),b=w(()=>t.metaCategories.length>0||t.clusters.length>0||t.screenings.length>0);var u=S(),x=p(u);{var G=c=>{var e=ie(),i=T(p(e),2),s=_(i),v=_(s);{var f=l=>{var F=S(),q=p(F);$(q,()=>Z(()=>import("./MiniGraphView-U4n1WaHx.js"),__vite__mapDeps([0,1,2,3,4,5]),import.meta.url),null,(L,o)=>{var N=w(()=>{var{default:P}=n(o);return{MiniGraphView:P}}),O=w(()=>n(N).MiniGraphView),A=S(),Q=p(A);K(Q,()=>n(O),(P,U)=>{U(P,{get graphData(){return n(M)},get currentFilmId(){return t.currentFilmId},onNodeHover:(z,H)=>{y(g,z,!0),y(d,H,!0)}})}),a(L,A)}),a(l,F)};I(v,l=>{l(f)})}var r=T(s,2);te(r,{get node(){return n(g)},get x(){return n(d).x},get y(){return n(d).y}}),a(c,e)};I(x,c=>{n(b)&&c(G)})}a(D,u),j()}h.__docgen={data:[{name:"currentFilmId",visibility:"public",keywords:[{name:"required",description:""}],kind:"let",type:{kind:"type",type:"string",text:"string"},static:!1,readonly:!1},{name:"currentFilmTitle",visibility:"public",keywords:[{name:"required",description:""}],kind:"let",type:{kind:"type",type:"string",text:"string"},static:!1,readonly:!1},{name:"currentFilmSlug",visibility:"public",keywords:[{name:"required",description:""}],kind:"let",type:{kind:"type",type:"string",text:"string"},static:!1,readonly:!1},{name:"metaCategories",visibility:"public",keywords:[{name:"required",description:""}],kind:"let",type:{kind:"type",type:"array",text:"{ _id: string; name: string; filmIds: string[]; }[]"},static:!1,readonly:!1},{name:"clusters",visibility:"public",keywords:[{name:"required",description:""}],kind:"let",type:{kind:"type",type:"array",text:"{ _id: string; name: string; filmIds: string[]; }[]"},static:!1,readonly:!1},{name:"screenings",visibility:"public",keywords:[{name:"required",description:""}],kind:"let",type:{kind:"type",type:"array",text:"{ _id: string; name: string; filmIds: string[]; }[]"},static:!1,readonly:!1},{name:"neighborFilms",visibility:"public",keywords:[{name:"required",description:""}],kind:"let",type:{kind:"type",type:"array",text:"{ _id: string; englishTitle: string; length: number; slug: string; }[]"},static:!1,readonly:!1}],name:"MiniGraphSection.svelte"};const ne={title:"Visualiser/MiniGraphSection",component:h},{Story:V}=Y();var ae=m('<div class="grid grid-cols-6 gap-x-6 gap-y-4"><!></div>'),se=m('<div class="grid grid-cols-6 gap-x-6 gap-y-4"><!> <p class="col-span-6 text-sm text-gallery-400">(Component renders nothing when there are no connections)</p></div>'),re=m('<p class="col-span-6 p-4 text-sm text-gallery-400">Loading from Sanity...</p>'),le=m('<p class="col-span-6 p-4 text-sm text-red-500">No data found</p>'),oe=m('<div class="grid grid-cols-6 gap-x-6 gap-y-4"><!></div>'),de=m("<!> <!> <!>",1);function B(D,t){R(t,!0);let g=k(null),d=k(!1);async function M(){const e=(await C('*[_type == "tvSelection"][0].films[0..0].film->{ _id, englishTitle }'))?.[0];if(!e){y(d,!0);return}const[i,s,v]=await Promise.all([C('*[_type == "metaCategory" && $id in films[].film._ref]{ _id, name, "filmIds": films[].film._ref }',{id:e._id}),C('*[_type == "semanticCluster" && ($id in highlightedFilms[]._ref || $id in relevantFilms[]._ref)]{ _id, name, "filmIds": [...highlightedFilms[]._ref, ...relevantFilms[]._ref] }',{id:e._id}),C('*[_type == "tvSelection"][0].films[1..5].film->{ _id, englishTitle, length }')]);y(g,{currentFilmId:e._id,currentFilmTitle:e.englishTitle,currentFilmSlug:e._id,metaCategories:i??[],clusters:s??[],screenings:[],neighborFilms:(v??[]).map(f=>({...f,slug:f._id}))},!0),y(d,!0)}M();var b=de(),u=p(b);V(u,{name:"Default",template:e=>{var i=ae(),s=_(i);h(s,{currentFilmId:"f1",currentFilmTitle:"Dawn Chorus",currentFilmSlug:"dawn-chorus",metaCategories:[{_id:"mc-1",name:"Documentary",filmIds:["f1","f2","f3"]},{_id:"mc-2",name:"Experimental",filmIds:["f1","f4"]}],clusters:[{_id:"cl-1",name:"Urban Landscapes",filmIds:["f1","f2"]}],screenings:[{_id:"sc-1",name:"Screening 1",filmIds:["f1","f2","f3"]}],neighborFilms:[{_id:"f2",englishTitle:"Concrete Lullaby",length:8,slug:"concrete-lullaby"},{_id:"f3",englishTitle:"After the Rain",length:15,slug:"after-the-rain"},{_id:"f4",englishTitle:"Quiet Machines",length:6,slug:"quiet-machines"}]}),a(e,i)},$$slots:{template:!0},parameters:{__svelteCsf:{rawCode:`<div class="grid grid-cols-6 gap-x-6 gap-y-4">
	<MiniGraphSection
		currentFilmId="f1"
		currentFilmTitle="Dawn Chorus"
		currentFilmSlug="dawn-chorus"
		metaCategories={[
			{ _id: 'mc-1', name: 'Documentary', filmIds: ['f1', 'f2', 'f3'] },
			{ _id: 'mc-2', name: 'Experimental', filmIds: ['f1', 'f4'] },
		]}
		clusters={[
			{ _id: 'cl-1', name: 'Urban Landscapes', filmIds: ['f1', 'f2'] },
		]}
		screenings={[
			{ _id: 'sc-1', name: 'Screening 1', filmIds: ['f1', 'f2', 'f3'] },
		]}
		neighborFilms={[
			{ _id: 'f2', englishTitle: 'Concrete Lullaby', length: 8, slug: 'concrete-lullaby' },
			{ _id: 'f3', englishTitle: 'After the Rain', length: 15, slug: 'after-the-rain' },
			{ _id: 'f4', englishTitle: 'Quiet Machines', length: 6, slug: 'quiet-machines' },
		]}
	/>
</div>`}}});var x=T(u,2);V(x,{name:"No Connections",template:e=>{var i=se(),s=_(i);h(s,{currentFilmId:"f1",currentFilmTitle:"Isolated Film",currentFilmSlug:"isolated-film",metaCategories:[],clusters:[],screenings:[],neighborFilms:[]}),a(e,i)},$$slots:{template:!0},parameters:{__svelteCsf:{rawCode:`<div class="grid grid-cols-6 gap-x-6 gap-y-4">
	<MiniGraphSection
		currentFilmId="f1"
		currentFilmTitle="Isolated Film"
		currentFilmSlug="isolated-film"
		metaCategories={[]}
		clusters={[]}
		screenings={[]}
		neighborFilms={[]}
	/>
	<p class="col-span-6 text-sm text-gallery-400">
		(Component renders nothing when there are no connections)
	</p>
</div>`}}});var G=T(x,2);V(G,{name:"Sanity Data",template:e=>{var i=oe(),s=_(i);{var v=r=>{var l=re();a(r,l)},f=r=>{var l=S(),F=p(l);{var q=o=>{h(o,W(()=>n(g)))},L=o=>{var N=le();a(o,N)};I(F,o=>{n(g)?o(q):o(L,!1)},!0)}a(r,l)};I(s,r=>{n(d)?r(f,!1):r(v)})}a(e,i)},$$slots:{template:!0},parameters:{__svelteCsf:{rawCode:`<div class="grid grid-cols-6 gap-x-6 gap-y-4">
	{#if !sanityLoaded}
		<p class="col-span-6 p-4 text-sm text-gallery-400">Loading from Sanity...</p>
	{:else if sanityProps}
		<MiniGraphSection {...sanityProps} />
	{:else}
		<p class="col-span-6 p-4 text-sm text-red-500">No data found</p>
	{/if}
</div>`}}}),a(D,b),j()}B.__docgen={data:[],name:"MiniGraphSection.stories.svelte"};const E=X(B,ne),_e=["Default","NoConnections","SanityData"],ye={...E.Default,tags:["svelte-csf-v5"]},he={...E.NoConnections,tags:["svelte-csf-v5"]},be={...E.SanityData,tags:["svelte-csf-v5"]};export{ye as Default,he as NoConnections,be as SanityData,_e as __namedExportsOrder,ne as default};
