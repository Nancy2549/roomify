import { useLocation } from "react-router";

const VisualizerId = () => {
  const location = useLocation();
  const state = (location.state as any) || {};
  const initialImage = state.initialImage as string | undefined;
  const name = state.name as string | undefined;

  return (
    <section>
      <h1>{name || "Untitled Project"}</h1>

      <div className="visualizer">
        {initialImage && (
          <div className="image-container">
            <h2>Source Image</h2>
            <img src={initialImage} alt="source" />
          </div>
        )}
      </div>
    </section>
  );
};

export default VisualizerId;

