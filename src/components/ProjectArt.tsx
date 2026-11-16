import { Sculpture } from "./Sculpture";
import type { Project } from "../data/content";

export function ProjectArt({ project }: { project: Project }) {
  if (project.kind === "image")
    return (
      <div className="editorial-art">
        <img
          src={project.image}
          alt={project.alt}
          width="700"
          height="500"
          loading="lazy"
        />
        <span className="editorial-title" aria-hidden="true">
          off
          <br />
          <i>script.</i>
        </span>
        <span className="editorial-meta mono" aria-hidden="true">
          INDEPENDENT THINKING
          <br />
          UNEXPECTED PERSPECTIVES
        </span>
      </div>
    );
  if (project.kind === "sculpture")
    return (
      <div className="sculpture-art">
        <span className="mono art-corner">
          FORM / 002
          <br />
          AN OBJECT OF CURIOSITY
        </span>
        <Sculpture variant="silver" />
        <span className="art-oversize" aria-hidden="true">
          f.
        </span>
      </div>
    );
  return (
    <div className="type-art" role="img" aria-label={project.alt}>
      <span className="mono art-corner">THE BEAUTY IN THE EVERYDAY.</span>
      <span className="type-line" aria-hidden="true">
        EXTRA
      </span>
      <span className="type-line outline-type" aria-hidden="true">
        ORDI
      </span>
      <span className="type-line" aria-hidden="true">
        NARY.
      </span>
      <span className="type-footer mono">A TYPOGRAPHIC PLAYGROUND — 003</span>
    </div>
  );
}
