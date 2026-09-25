"use client";

import { useEffect, useState } from "react";
import { Building2 } from "lucide-react";
import { apiBlob } from "@/lib/api";

export type BannerProject={id:string;name:string;address?:string;status:string;hasMainImage?:boolean;mainImageVersion?:number|string|null};

function useProjectImage(project:BannerProject|undefined) {
  const [imageUrl,setImageUrl]=useState("");
  useEffect(()=>{let objectUrl="",cancelled=false;setImageUrl("");if(!project?.hasMainImage)return;void apiBlob(`/projects/${project.id}/main-image`).then(blob=>{if(cancelled||!blob.type.startsWith("image/"))return;objectUrl=URL.createObjectURL(blob);setImageUrl(objectUrl)}).catch(()=>undefined);return()=>{cancelled=true;if(objectUrl)URL.revokeObjectURL(objectUrl)}},[project?.id,project?.hasMainImage,project?.mainImageVersion]);
  return imageUrl;
}

export function ProjectCover({project}:{project:BannerProject}) {
  const imageUrl=useProjectImage(project);
  return <span className={`project-cover ${imageUrl?"has-image":""}`} style={imageUrl?{backgroundImage:`url(${imageUrl})`}:undefined}>{!imageUrl&&<Building2 size={32}/>}</span>;
}

export function ProjectBanner({projects,projectId,onChange,activeOnly=false}:{projects:BannerProject[];projectId:string;onChange:(id:string)=>void;activeOnly?:boolean}) {
  const project=projects.find(x=>x.id===projectId),imageUrl=useProjectImage(project);
  return <section className={`project-banner ${imageUrl?"has-image":""}`} style={imageUrl?{backgroundImage:`url(${imageUrl})`}:undefined} aria-label="Obra selecionada">
    <div className="project-banner-overlay"/>
    <div className="project-banner-copy"><span>{activeOnly?"Obra ativa":"Obra selecionada"}</span><h2>{project?.name??"Selecione uma obra"}</h2><p>{project?.address??"Escolha a obra para carregar seus dados."}</p></div>
    <label>Trocar obra<select value={projectId} onChange={e=>onChange(e.target.value)}><option value="">Selecione</option>{projects.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
  </section>;
}
