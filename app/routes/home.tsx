import type { Route } from "./+types/home";  
import { ArrowRight, ArrowUpRight, Clock, Layers} from "lucide-react";
import { useState } from "react";
import Navbar from "../../component/Navbar";
import Button from "../../component/ui/Button";
import Upload from "../../component/Upload";
import { useNavigate } from "react-router";
import {createProject} from "../../lib/puter.action";


export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
       const navigate = useNavigate();
  const [projects, setProjects] = useState<DesignItem[]>([]);
  const isSignedIn = false; // placeholder until auth context is used

       const handleUploadComplete = async (base64Image: string) => {
         const newId = Date.now().toString();
         const name = `Residence ${newId}`;
        

        const newItem: DesignItem = {
          id: newId,
          name,
          sourceImage: base64Image,
          renderedImage: undefined,
          timestamp: Date.now(),
        };

         const saved = await createProject({item: newItem, visibility: 'private'});

         if(!saved){
             console.error("Failed to create project");
             return false;
         }

         setProjects((prev) => [newItem, ...prev]);

         navigate(`/visualizer/${newId}`,{
           state:{
               initialImage: saved.sourceImage,
               initialRendered: saved.renderedImage || null,
               name


           }


         });

         return true;
       }
  return (
    <div className="home">
       <Navbar />
      
      <section className="hero">
         <div className="announce">
           <div className="dot">
               <div className="pulse"></div>
           </div>

           <p>Introducing Roomify 2.0</p>

         </div>
         <h1>BUILD BEAUTIFUL SPACES AT THE SPEE OF THOUGHT WITH ROOMIFY</h1>

         <p className="subtitle">
           ROOMIFY IS AN AI-FIRST DESIGN ENVIRONMENT THAT HELPS YOU RENDER, VISUALIZE AND SHIP ARCHITECTURAL PROJECTS FASTER THAN EVER.
         </p> 
         

         <div className="actions">
           <a href='#upload' className="cta">
              Start building <ArrowRight className="icon"/>
           </a>

           <Button variant="secondary" size="lg" className="demo">
             Watch Demo
           </Button>
         </div>

         <div id="upload" className="upload-shell">
           <Upload isSignedIn={isSignedIn} onComplete={(base64) => {
             console.log("Upload complete", base64.slice(0, 100));
           }} />
         </div>
      </section>

      <section className="projects">
         <div className="section-inner">
           <div className="section-head"></div>
            <div className="copy">
              <h2>Projects</h2>
              <p>Your latest work and shared community projects all in one place.</p>
            </div>

            <div className="projects-grid">
               {projects.map(({ id, name, renderedImage, sourceImage, timestamp }) => (
                 <div key={id} className="project-item">
                   <div className="project-card group">
                     <div className="preview" />
                     <img src={renderedImage || sourceImage} alt="Project" />
                     <div className="badge">
                       <span>Community</span>
                     </div>
                   </div>
                   <div className="card-body">
                     <div>
                       <h3>{name}</h3>

                       <div className="meta">
                         <Clock size={12} />
                         <span>{new Date(timestamp).toLocaleDateString()}</span>
                         <span>By JS Mastery</span>
                       </div>
                     </div>
                     <div className="arrow">
                       <ArrowRight size={18} />
                     </div>
                   </div>
                 </div>
               ))}
            </div>
         </div>
      </section>
    </div>
  )
}
