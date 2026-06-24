import type { Route } from "./+types/home";  
import { ArrowRight } from "lucide-react";
import { useOutletContext } from "react-router";
import Navbar from "../../component/Navbar";
import Button from "../../component/ui/Button";
import Upload from "../../component/Upload";


export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  const { isSignedIn } = useOutletContext<AuthContext>();

  return (
    <div className="home">
       <Navbar />
      
      <section className="hero">
         <div className="announce">
           <div className="dot">
               <div className="pulse"></div>
           </div>

           <p>Introducing Roomif 2.0</p>

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
               <div className="project-card group">
                  <div className="preview" />
                  <img src="https://roomify-mlhuk267-dfwu1i.puter.site/projects/1770803585402/rendered.png" alt="Project" />
                  <div className="badge">
                    <span>Community</span>
                  </div>
               </div>
               <div className="card-body">
                 <div>
                   <h3>PROJECT MANHATTAN</h3>

                   <div className="meta">
                     <span>{new Date(2027, 0, 1).toLocaleDateString()}</span>
                     <span>By JS Mastery</span>
                   </div>
                 </div>
                 <div className="arrow">
                   <ArrowRight size={18} />
                 </div>
               </div>
            </div>
         </div>
      </section>
    </div>
  )
}
