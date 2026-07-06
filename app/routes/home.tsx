import type { Route } from "./+types/home";
import Navbar from "../../component/Navbar";
import {ArrowRight, ArrowUpRight, Clock, Layers} from "lucide-react";
import Button from "../../component/ui/Button";
import Upload from "../../component/Upload";
import {useNavigate} from "react-router";
import {type KeyboardEvent, useEffect, useRef, useState} from "react";
import {createProject, getProjects} from "../../lib/puter.action";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
    const navigate = useNavigate();
    const [projects, setProjects] = useState<DesignItem[]>([]);
    const isCreatingProjectRef = useRef(false);

    const handleUploadComplete = async (base64Image: string) => {
        if (isCreatingProjectRef.current) return false;

        let shouldReleaseLock = false;
        isCreatingProjectRef.current = true;
        shouldReleaseLock = true;

        try {
            const newId = Date.now().toString();
            const name = `Residence ${newId}`;

            const newItem = {
                id: newId, name, sourceImage: base64Image,
                renderedImage: undefined,
                timestamp: Date.now()
            }

            const saved = await createProject({ item: newItem, visibility: 'private' });

            if (!saved) {
                console.error("Failed to create project");
                return false;
            }

            setProjects((prev) => [saved, ...prev]);

            navigate(`/visualizer/${newId}`, {
                state: {
                    initialImage: saved.sourceImage,
                    initialRendered: saved.renderedImage || null,
                    name
                }
            });

            return true;
        } finally {
            if (shouldReleaseLock) {
                isCreatingProjectRef.current = false;
            }
        }
    }

    const handleProjectKeyDown = (event: KeyboardEvent<HTMLDivElement>, projectId: string) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            navigate(`/visualizer/${projectId}`);
        }
    };

    useEffect(() => {
        let isMounted = true;

        const fetchProjects = async () => {
            setProjects([]);
            const fetchedProjects = await getProjects();

            if (isMounted) {
                setProjects(fetchedProjects);
            }
        };

        void fetchProjects();

        return () => {
            isMounted = false;
        };
    }, []);

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

              <h1>Build beautiful spaces at the speed of thought with Roomify</h1>

              <p className="subtitle">
                  Roomify is an AI-first design environment that helps you visualize, render, and ship architectural projects faster  than ever.
              </p>

              <div className="actions">
                  <a href="#upload" className="cta">
                      Start Building <ArrowRight className="icon" />
                  </a>

                  <Button variant="secondary" size="lg" className="demo">
                      Watch Demo
                  </Button>
              </div>

              <div id="upload" className="upload-shell">
                <div className="grid-overlay" />

                  <div className="upload-card">
                      <div className="upload-head">
                          <div className="upload-icon">
                              <Layers className="icon" />
                          </div>

                          <h3>Upload your floor plan</h3>
                          <p>Supports JPG, PNG, formats up to 10MB</p>
                      </div>

                      <Upload onComplete={handleUploadComplete} />
                  </div>
              </div>
          </section>

          <section className="projects">
              <div className="section-inner">
                  <div className="section-head">
                      <div className="copy">
                          <h2>Projects</h2>
                          <p>Your latest work and shared community projects, all in one place.</p>
                      </div>
                  </div>

                  <div className="projects-grid">
                      {projects.map(({id, name, renderedImage, sourceImage, timestamp, isPublic, ownerId}) => {
                          const badgeLabel = isPublic ? "Public" : "Private";
                          const ownerLabel = ownerId ? "Owned project" : "Private upload";

                          return (
                              <div
                                  key={id}
                                  className="project-card group"
                                  role="button"
                                  tabIndex={0}
                                  onClick={() => navigate(`/visualizer/${id}`)}
                                  onKeyDown={(event) => handleProjectKeyDown(event, id)}
                              >
                                  <div className="preview">
                                      <img src={renderedImage || sourceImage} alt="Project" />

                                      <div className="badge">
                                          <span>{badgeLabel}</span>
                                      </div>
                                  </div>

                                  <div className="card-body">
                                      <div>
                                          <h3>{name}</h3>

                                          <div className="meta">
                                              <Clock size={12} />
                                              <span>{new Date(timestamp).toLocaleDateString()}</span>
                                              <span>{ownerLabel}</span>
                                          </div>
                                      </div>
                                      <div className="arrow">
                                          <ArrowUpRight size={18} />
                                      </div>
                                  </div>
                              </div>
                          );
                      })}
                  </div>
              </div>
          </section>
      </div>
  )
}
