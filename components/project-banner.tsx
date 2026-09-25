"use client";

import { useEffect, useState } from "react";
import { apiBlob } from "@/lib/api";

export type BannerProject={id:string;name:string;address?:string;status:string;hasMainImage?:boolean;mainImageVersion?:number|string|null};

export function ProjectBanner({projects,projectId,onChange,activeOnly=false}:{projects:BannerProject[];projectId:string;onChange:(id:string)=>void;activeOnly?:boolean}) {
  const project=projects.find(x=>x.id===projectId),[loaded,setLoaded]=useState<{projectId:string;url:string}|null>(null),imageUrl=loaded?.projectId===project?.id?(loaded?.url??""):"";
  useEffect(()=>{let url="",cancelled=false;if(!project?.hasMainImage)return;void apiBlob(`/projects/${project.id}/main-image`).then(blob=>{if(cancelled)return;url=URL.createObjectURL(blob);setLoaded({projectId:project.id,url})}).catch(()=>undefined);return()=>{cancelled=true;if(url)URL.revokeObjectURL(url)}},[project?.id,project?.hasMainImage,project?.mainImageVersion]);
  return <section className={`project-banner ${imageUrl?"has-image":""}`} style={imageUrl?{backgroundImage:`url(${imageUrl})`}:undefined} aria-label="Obra selecionada">
    <div className="project-banner-overlay"/>
    <div className="project-banner-copy"><span>{activeOnly?"Obra ativa":"Obra selecionada"}</span><h2>{project?.name??"Selecione uma obra"}</h2><p>{project?.address??"Escolha a obra para carregar seus dados."}</p></div>
    <label>Trocar obra<select value={projectId} onChange={e=>onChange(e.target.value)}><option value="">Selecione</option>{projects.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
  </section>;
}
