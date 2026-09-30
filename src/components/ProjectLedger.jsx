import { useState } from 'react';
import { projectsData } from '../data/projects';

const ProjectLedger = () => {
  const [projectPage, setProjectPage] = useState(0);
  const PROJECTS_PER_PAGE = 3;
  const totalPages = Math.ceil(projectsData.length / PROJECTS_PER_PAGE);

  const handleNextProjects = () => setProjectPage(p => (p + 1) % totalPages);
  const handlePrevProjects = () => setProjectPage(p => (p - 1 + totalPages) % totalPages);

  return (
    <section id="projects" className="w-full flex flex-col items-center justify-center p-2 md:p-4 bg-transparent min-h-screen snap-start">
      <div className="max-w-5xl w-full flex flex-col bg-[#fff9e6]/95 border-x-[8px] md:border-x-[12px] border-[#8b5a2b] p-4 md:p-8 pb-8 md:pb-12 shadow-[6px_6px_0_rgba(0,0,0,0.4)] md:shadow-[8px_8px_0_rgba(0,0,0,0.4)] relative min-h-[80vh]">
        <h2 className="text-sm md:text-3xl uppercase tracking-widest text-[#8b5a2b] text-center border-b-[4px] md:border-b-6 border-dashed border-[#8b5a2b] pb-2 md:pb-4 mb-6 md:mb-12">Town Ledger: Projects</h2>

        <div className="flex flex-col gap-y-6 md:gap-y-12 flex-1">
          {projectsData
            .slice(projectPage * PROJECTS_PER_PAGE, (projectPage + 1) * PROJECTS_PER_PAGE)
            .map((proj, idx) => (
              <a key={idx} href={proj.link} target="_blank" rel="noreferrer" className="block space-y-2 md:space-y-3 group cursor-pointer bg-[#e6c17a] p-4 md:p-8 border-[3px] md:border-4 border-[#8b5a2b] shadow-md transform hover:scale-[1.02] md:hover:scale-105 hover:bg-[#ebd290] transition-all duration-200">
                <h3 className="text-sm md:text-xl font-bold text-[#8b5a2b] tracking-wider drop-shadow-sm group-hover:text-[#4a2e1b] transition-colors">{proj.title}</h3>
                <p className="text-[10px] md:text-sm text-[#4a2e1b] leading-relaxed md:leading-loose">
                  {proj.desc}
                </p>
              </a>
            ))}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-12 px-2 md:px-4">
            <button
              onClick={handlePrevProjects}
              className="px-4 py-2 md:px-6 md:py-2 bg-[#8b5a2b] text-[#fff9e6] uppercase tracking-widest text-[10px] md:text-sm font-bold border-b-4 border-r-4 border-[#4a2e1b] active:border-b-0 active:border-r-0 active:translate-y-1 active:translate-x-1 hover:bg-[#a66d35] transition-all"
            >
              Prev
            </button>
            <div className="text-[#8b5a2b] font-bold text-[10px] md:text-sm tracking-widest text-center mx-2">
              Page {projectPage + 1} / {totalPages}
            </div>
            <button
              onClick={handleNextProjects}
              className="px-4 py-2 md:px-6 md:py-2 bg-[#8b5a2b] text-[#fff9e6] uppercase tracking-widest text-[10px] md:text-sm font-bold border-b-4 border-r-4 border-[#4a2e1b] active:border-b-0 active:border-r-0 active:translate-y-1 active:translate-x-1 hover:bg-[#a66d35] transition-all"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProjectLedger;
