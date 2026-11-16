import type { Project } from "../data/content";
export function ProjectArt({ project }: { project: Project }) {
  if (project.kind === "website")
    return (
      <div className="real-project-art website-project-art">
        <div className="project-browser">
          <div className="project-browser-address">
            <span>
              {project.format} / {project.number}
            </span>
            <span>{new URL(project.url!).host}</span>
          </div>
          <img
            src={project.image}
            alt={project.alt}
            loading="lazy"
            width="1440"
            height="950"
          />
        </div>
        <span className="project-art-note">
          {project.id === "jeffs-concepts"
            ? "A CLOSER LOOK AT THE RIDE."
            : "CLARITY. CONSIDERED IN EVERY DETAIL."}
        </span>
      </div>
    );
  return (
    <div className={`real-project-art native-project-art ${project.kind}`}>
      <span className="project-device-caption">
        NATIVE KOTLIN INTERFACE / RECREATED IN REACT
      </span>
      <div className="project-device-frame">
        <img
          src={project.image}
          alt={project.alt}
          loading="lazy"
          width={project.kind === "android-tv" ? 1200 : 412}
          height={project.kind === "android-tv" ? 675 : 892}
        />
      </div>
      <span className="project-device-label">
        {project.kind === "android-tv"
          ? "DESIGNED FOR THE BIG SCREEN."
          : "DESIGNED TO GO WITH YOU."}
      </span>
    </div>
  );
}
