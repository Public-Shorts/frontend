import{p as Q,s as p,w as U,f as d,j as x,z as D,b as s,a as B,A as i,c as b,l as a,k as N,i as J}from"./iframe-6KIpb0Mt.js";import{c as K,d as W}from"./create-runtime-stories-C7cqMwQp.js";import F from"./MiniGraphView-U4n1WaHx.js";import{b as T}from"./graphUtils-aBi1ZnmZ.js";import{f as h,G as C}from"./client-8ns0aL8_.js";import"./preload-helper-PPVm8Dsz.js";import"./this-DkeGxGfh.js";const X={title:"Visualiser/MiniGraphView",component:F},{Story:M}=W();var Y=d('<div class="relative" style="height: 350px;"><!> <!></div>'),Z=d('<p class="p-4 text-sm text-gallery-400">Loading from Sanity...</p>'),ee=d("<!> <!>",1),te=d('<p class="p-4 text-sm text-red-500">No data found</p>'),ae=d('<div class="relative" style="height: 350px;"><!></div>'),ie=d("<!> <!>",1);function P($,L){Q(L,!0);let u=p(null),n=p(U({x:0,y:0}));const k=T({currentFilmId:"f1",currentFilmTitle:"Dawn Chorus",currentFilmSlug:"dawn-chorus",metaCategories:[{_id:"mc-1",name:"Documentary",filmIds:["f1","f2","f3"]},{_id:"mc-2",name:"Experimental",filmIds:["f1","f4"]}],clusters:[{_id:"cl-1",name:"Urban Landscapes",filmIds:["f1","f2"]}],screenings:[{_id:"sc-1",name:"Screening 1",filmIds:["f1","f2","f3"]}],neighborFilms:[{_id:"f2",englishTitle:"Concrete Lullaby",length:8,slug:"concrete-lullaby"},{_id:"f3",englishTitle:"After the Rain",length:15,slug:"after-the-rain"},{_id:"f4",englishTitle:"Quiet Machines",length:6,slug:"quiet-machines"}]});let v=p(null),g=p(null),y=p(!1);async function H(){const e=(await h('*[_type == "tvSelection"][0].films[0..0].film->{ _id, englishTitle }'))?.[0];if(!e){i(y,!0);return}i(g,e._id,!0);const[r,l,m]=await Promise.all([h('*[_type == "metaCategory" && $id in films[].film._ref]{ _id, name, "filmIds": films[].film._ref }',{id:e._id}),h('*[_type == "semanticCluster" && ($id in highlightedFilms[]._ref || $id in relevantFilms[]._ref)]{ _id, name, "filmIds": [...highlightedFilms[]._ref, ...relevantFilms[]._ref] }',{id:e._id}),h('*[_type == "tvSelection"][0].films[1..5].film->{ _id, englishTitle, length }')]),f=(m??[]).map(t=>({...t,slug:t._id}));i(v,T({currentFilmId:e._id,currentFilmTitle:e.englishTitle,currentFilmSlug:e._id,metaCategories:r??[],clusters:l??[],screenings:[],neighborFilms:f}),!0),i(y,!0)}H();var G=ie(),S=x(G);M(S,{name:"Default",template:e=>{var r=Y(),l=b(r);F(l,{get graphData(){return k},currentFilmId:"f1",onNodeHover:(f,t)=>{i(u,f,!0),i(n,t,!0)}});var m=D(l,2);C(m,{get node(){return a(u)},get x(){return a(n).x},get y(){return a(n).y}}),s(e,r)},$$slots:{template:!0},parameters:{__svelteCsf:{rawCode:`<div class="relative" style="height: 350px;">
	<MiniGraphView
		graphData={mockGraphData}
		currentFilmId="f1"
		onNodeHover={(node, pos) => { hoveredNode = node; mousePos = pos; }}
	/>
	<GraphTooltip node={hoveredNode} x={mousePos.x} y={mousePos.y} />
</div>`}}});var A=D(S,2);M(A,{name:"Sanity Data",template:e=>{var r=ae(),l=b(r);{var m=t=>{var c=Z();s(t,c)},f=t=>{var c=J(),E=x(c);{var R=o=>{var _=ee(),w=x(_);F(w,{get graphData(){return a(v)},get currentFilmId(){return a(g)},onNodeHover:(z,O)=>{i(u,z,!0),i(n,O,!0)}});var q=D(w,2);C(q,{get node(){return a(u)},get x(){return a(n).x},get y(){return a(n).y}}),s(o,_)},j=o=>{var _=te();s(o,_)};N(E,o=>{a(v)&&a(g)?o(R):o(j,!1)},!0)}s(t,c)};N(l,t=>{a(y)?t(f,!1):t(m)})}s(e,r)},$$slots:{template:!0},parameters:{__svelteCsf:{rawCode:`<div class="relative" style="height: 350px;">
	{#if !sanityLoaded}
		<p class="p-4 text-sm text-gallery-400">Loading from Sanity...</p>
	{:else if sanityGraphData && sanityFilmId}
		<MiniGraphView
			graphData={sanityGraphData}
			currentFilmId={sanityFilmId}
			onNodeHover={(node, pos) => { hoveredNode = node; mousePos = pos; }}
		/>
		<GraphTooltip node={hoveredNode} x={mousePos.x} y={mousePos.y} />
	{:else}
		<p class="p-4 text-sm text-red-500">No data found</p>
	{/if}
</div>`}}}),s($,G),B()}P.__docgen={data:[],name:"MiniGraphView.stories.svelte"};const V=K(P,X),fe=["Default","SanityData"],pe={...V.Default,tags:["svelte-csf-v5"]},ue={...V.SanityData,tags:["svelte-csf-v5"]};export{pe as Default,ue as SanityData,fe as __namedExportsOrder,X as default};
