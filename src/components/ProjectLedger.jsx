import { useEffect, useRef, useState } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { projectsData } from '../data/projects';

const PAGE_ASPECT_RATIO = 620 / 420;
const MIN_PAGE_WIDTH = 260;
const MAX_PAGE_WIDTH = 420;
const MAX_CONTENTS_ENTRIES = 8;
const MOBILE_CONTENTS_ENTRIES = 5;

const ProjectLedger = () => {
  const bookRef = useRef(null);
  const bookShellRef = useRef(null);
  const coverHoldTimer = useRef(null);
  const coverHoldAnimation = useRef(null);
  const coverHoldStartedAt = useRef(0);
  const coverHoldTriggered = useRef(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [coverHoldProgress, setCoverHoldProgress] = useState(0);
  const [bookWidth, setBookWidth] = useState(MAX_PAGE_WIDTH);
  const isMobile = bookWidth < 380;
  const contentsPages = [];
  const contentsEntriesPerPage = isMobile ? MOBILE_CONTENTS_ENTRIES : MAX_CONTENTS_ENTRIES;

  useEffect(() => {
    const shell = bookShellRef.current;
    if (!shell) return undefined;

    const updateBookSize = () => {
      const styles = window.getComputedStyle(shell);
      const horizontalInsets =
        parseFloat(styles.paddingLeft) +
        parseFloat(styles.paddingRight) +
        parseFloat(styles.borderLeftWidth) +
        parseFloat(styles.borderRightWidth);
      const availableWidth = Math.max(0, shell.getBoundingClientRect().width - horizontalInsets);
      const isNarrowLayout = window.matchMedia('(max-width: 767px)').matches;
      const pageWidth = isNarrowLayout ? availableWidth : availableWidth / 2;
      const nextWidth = Math.min(MAX_PAGE_WIDTH, pageWidth);
      setBookWidth(nextWidth);
    };

    updateBookSize();
    const observer = new ResizeObserver(updateBookSize);
    observer.observe(shell);
    return () => observer.disconnect();
  }, []);

  for (let index = 0; index < projectsData.length; index += contentsEntriesPerPage) {
    contentsPages.push(projectsData.slice(index, index + contentsEntriesPerPage));
  }

  const detailStartPage = contentsPages.length + 1;

  const pageHeight = Math.round(bookWidth * PAGE_ASPECT_RATIO);
  const pages = [
    { type: 'cover' },
    ...contentsPages.map((projects, index) => ({ type: 'contents', projects, index })),
    ...projectsData.map((project, index) => ({ type: 'chapter', project, index })),
    { type: 'back-cover' },
  ];

  const flipNext = () => bookRef.current?.pageFlip().flipNext('top');
  const flipPrevious = (event) => {
    if (coverHoldTriggered.current) {
      event?.preventDefault();
      event?.stopPropagation();
      coverHoldTriggered.current = false;
      return;
    }
    bookRef.current?.pageFlip().flipPrev('top');
  };
  const clearCoverHold = () => {
    if (coverHoldTimer.current) {
      window.clearTimeout(coverHoldTimer.current);
      coverHoldTimer.current = null;
    }
    if (coverHoldAnimation.current) {
      window.cancelAnimationFrame(coverHoldAnimation.current);
      coverHoldAnimation.current = null;
    }
    setCoverHoldProgress(0);
  };
  const startCoverHold = () => {
    clearCoverHold();
    coverHoldStartedAt.current = performance.now();
    const updateProgress = (timestamp) => {
      const progress = Math.min(1, (timestamp - coverHoldStartedAt.current) / 700);
      setCoverHoldProgress(progress);
      if (progress < 1) {
        coverHoldAnimation.current = window.requestAnimationFrame(updateProgress);
      }
    };
    coverHoldAnimation.current = window.requestAnimationFrame(updateProgress);
    coverHoldTimer.current = window.setTimeout(() => {
      bookRef.current?.pageFlip().turnToPage(0);
      coverHoldTriggered.current = true;
      setCoverHoldProgress(1);
      coverHoldAnimation.current = null;
      coverHoldTimer.current = null;
    }, 700);
  };
  const cancelCoverHold = (event) => {
    if (coverHoldTriggered.current) {
      event.preventDefault();
      event.stopPropagation();
    }
    clearCoverHold();
  };

  useEffect(() => () => {
    if (coverHoldTimer.current) window.clearTimeout(coverHoldTimer.current);
    if (coverHoldAnimation.current) window.cancelAnimationFrame(coverHoldAnimation.current);
  }, []);
  const openPage = (pageIndex) => bookRef.current?.pageFlip().flip(pageIndex, 'top');
  const spread = Math.floor(currentPage / 2) + 1;
  const totalSpreads = Math.ceil((pages.length - 1) / 2);

  const renderContentsEntry = (project, projectIndex) => (
    <button
      key={project.title}
      type="button"
      onClick={() => openPage(detailStartPage + projectIndex)}
      onPointerMove={(event) => event.stopPropagation()}
      onPointerEnter={(event) => event.stopPropagation()}
      className="ledger-contents-entry"
    >
      <span>Chapter {String(projectIndex + 1).padStart(2, '0')}</span>
      <strong>{project.title}</strong>
      <small>Read chapter →</small>
    </button>
  );

  const renderChapter = (project, projectIndex) => (
    <div className="ledger-chapter">
      <span className="ledger-page-number">Chapter {String(projectIndex + 1).padStart(2, '0')}</span>
      <div className="ledger-chapter-rule" />
      <h2>{project.title}</h2>
      <p className="ledger-chapter-lead">{project.desc}</p>
      <div className="ledger-chapter-note">
        <span>FIELD NOTES</span>
        <p>This project is part of the town archive, documenting an experiment in building useful software with a clear, focused purpose.</p>
      </div>
      <div className="ledger-chapter-actions">
        <button type="button" onClick={() => openPage(1)} className="ledger-inline-button">
          ← Contents
        </button>
        {project.link && (
          <a href={project.link} target="_blank" rel="noreferrer" className="ledger-inline-button">
            Visit repository →
          </a>
        )}
      </div>
    </div>
  );

  return (
    <section id="projects" className="w-full flex flex-col items-center justify-center p-2 md:p-4 bg-transparent min-h-screen snap-start">
      <div className="ledger-book max-w-5xl w-full">
        <div ref={bookShellRef} className="ledger-flip-shell">
          <HTMLFlipBook
            ref={bookRef}
            width={bookWidth}
            height={pageHeight}
            size="fixed"
            minWidth={Math.min(MIN_PAGE_WIDTH, bookWidth)}
            maxWidth={MAX_PAGE_WIDTH}
            minHeight={Math.min(Math.round(MIN_PAGE_WIDTH * PAGE_ASPECT_RATIO), pageHeight)}
            maxHeight={Math.round(MAX_PAGE_WIDTH * PAGE_ASPECT_RATIO)}
            showCover
            usePortrait
            drawShadow
            maxShadowOpacity={0.45}
            flippingTime={900}
            mobileScrollSupport
            useMouseEvents={false}
            className="ledger-flip-book"
            onFlip={(event) => setCurrentPage(Number(event.data))}
          >
            {pages.map((page, pageIndex) => (
              <div className={`ledger-paper ledger-${page.type}`} key={`ledger-page-${pageIndex}`}>
                {page.type === 'cover' && (
                  <div className="ledger-cover-art">
                    <span>THE</span>
                    <h1>Town Ledger</h1>
                    <strong>Projects</strong>
                    <small>VEOL'S ARCHIVE · VOL. I</small>
                  </div>
                )}
                {page.type === 'back-cover' && <div className="ledger-cover-art" aria-hidden="true" />}
                {page.type === 'contents' && (
                  <div className="ledger-contents-page">
                    <span className="ledger-page-number">Contents · Page {page.index + 1}</span>
                    <h2 className="ledger-section-title">Project Directory</h2>
                    <div className="ledger-contents-list">
                      {page.projects.map((project, projectIndex) => renderContentsEntry(
                        project,
                        page.index * contentsEntriesPerPage + projectIndex,
                      ))}
                    </div>
                  </div>
                )}
                {page.type === 'chapter' && renderChapter(page.project, page.index)}
              </div>
            ))}
          </HTMLFlipBook>
        </div>

        <div className="ledger-controls flex justify-between items-center mt-5 md:mt-8 px-1 md:px-2">
          <button
            onClickCapture={flipPrevious}
            onPointerDown={startCoverHold}
            onPointerUp={cancelCoverHold}
            onPointerCancel={cancelCoverHold}
            onPointerLeave={clearCoverHold}
            style={{ '--hold-progress': `${coverHoldProgress * 100}%` }}
            disabled={currentPage === 0}
            className="ledger-nav-button"
            title="Click for previous page. Hold to return to the cover."
          >
            ← Prev
          </button>
          <div className="ledger-spread-label text-[#fff9e6] font-bold text-[10px] md:text-sm tracking-widest text-center mx-2">
            {currentPage === 0 ? 'Closed book' : `Spread ${spread} / ${totalSpreads}`}
          </div>
          <button
            onClick={flipNext}
            disabled={currentPage >= pages.length - 2}
            className="ledger-nav-button"
          >
            Next →
          </button>
        </div>
      </div>
    </section>
  );
};

export default ProjectLedger;
