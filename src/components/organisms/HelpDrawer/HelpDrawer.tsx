'use client';

import { useEffect, useMemo, useState } from 'react';
import { Heading, MathText, Text } from '@/components/atoms';
import { QuestionOption, SegmentedTabs } from '@/components/molecules';
import type {
  EvaluationResult,
  GuidedStepResponseMap,
  LessonResource,
  QuestionHelpEntry,
  StandardDefinition,
} from '@/types/assessment';
import styles from './HelpDrawer.module.css';

type HelpPanelId = 'setup' | 'steps' | 'explain' | 'standard' | 'videos';

function getLessonVideos(lessons: LessonResource[]) {
  return lessons.flatMap((lesson) =>
    (lesson.videos ?? []).map((video) => ({
      ...video,
      lessonTitle: lesson.title,
    })),
  );
}

export function HelpDrawer({
  isOpen,
  questionNumber,
  questionHelp,
  evaluation,
  answerDisplay,
  explanation,
  standard,
  lessons,
  guidedStepResponses,
  onGuidedStepResponseChange,
  onClose,
}: {
  isOpen: boolean;
  questionNumber: number;
  questionHelp: QuestionHelpEntry | undefined;
  evaluation: EvaluationResult | undefined;
  answerDisplay: string;
  explanation: string;
  standard: StandardDefinition | undefined;
  lessons: LessonResource[];
  guidedStepResponses: GuidedStepResponseMap | undefined;
  onGuidedStepResponseChange: (stepId: string, optionId: string) => void;
  onClose: () => void;
}) {
  const videos = useMemo(() => getLessonVideos(lessons), [lessons]);
  const panelItems = useMemo(
    () =>
      [
        { id: 'setup', label: 'Set Up' },
        questionHelp?.guidedSteps?.length ? { id: 'steps', label: 'Steps' } : null,
        { id: 'explain', label: 'Why' },
        { id: 'standard', label: 'Standard' },
        { id: 'videos', label: 'Videos' },
      ].filter(Boolean) as { id: HelpPanelId; label: string }[],
    [questionHelp?.guidedSteps],
  );

  const [activePanel, setActivePanel] = useState<HelpPanelId>('setup');
  const [activeVideoId, setActiveVideoId] = useState(videos[0]?.id ?? '');
  const [activeStepId, setActiveStepId] = useState(questionHelp?.guidedSteps?.[0]?.id ?? '');
  const [isVideoOverlayOpen, setIsVideoOverlayOpen] = useState(false);

  const activeVideo = videos.find((video) => video.id === activeVideoId) ?? videos[0];
  const activeStep =
    questionHelp?.guidedSteps?.find((step) => step.id === activeStepId) ?? questionHelp?.guidedSteps?.[0];

  useEffect(() => {
    setActivePanel('setup');
    setActiveVideoId(videos[0]?.id ?? '');
    setActiveStepId(questionHelp?.guidedSteps?.[0]?.id ?? '');
    setIsVideoOverlayOpen(false);
  }, [questionHelp?.guidedSteps, questionNumber, videos]);

  return (
    <>
      <button
        type="button"
        aria-label="Close help drawer"
        className={isOpen ? styles.backdropVisible : styles.backdropHidden}
        onClick={onClose}
      />
      <aside className={isOpen ? styles.drawerOpen : styles.drawerClosed} aria-hidden={!isOpen}>
        <div className={styles.header}>
          <div className={styles.headerCopy}>
            <Text tone="soft">Review help</Text>
            <Heading as="h2" size="sm">
              Question {questionNumber}
            </Heading>
          </div>
          <button type="button" className={styles.close} onClick={onClose}>
            Close
          </button>
        </div>

        <div className={styles.statusRail} data-state={evaluation?.isCorrect ? 'correct' : 'incorrect'}>
          <span>{evaluation?.isCorrect ? 'Correct' : 'Needs revision'}</span>
          <span>Answer: {answerDisplay}</span>
        </div>

        <SegmentedTabs items={panelItems} activeId={activePanel} onChange={(nextId) => setActivePanel(nextId as HelpPanelId)} />

        <div className={styles.panel}>
          {activePanel === 'setup' ? (
            <div className={styles.panelGrid}>
              <section className={styles.section}>
                <Text tone="soft">How to structure it</Text>
                <Heading as="h3" size="sm">
                  Build the math sentence
                </Heading>
                <Text>
                  <MathText text={questionHelp?.mathSetup ?? 'Read the quantities first, then decide which operation links them.'} />
                </Text>
              </section>
              <section className={styles.section}>
                <Text tone="soft">Word problem translation</Text>
                <Heading as="h3" size="sm">
                  Turn words into operations
                </Heading>
                <Text>
                  <MathText text={questionHelp?.translation ?? 'Rewrite the words as a number sentence before solving.'} />
                </Text>
              </section>
            </div>
          ) : null}

          {activePanel === 'steps' ? (
            questionHelp?.guidedSteps?.length ? (
              <div className={styles.videoPanel}>
                <SegmentedTabs
                  items={questionHelp.guidedSteps.map((step, index) => ({
                    id: step.id,
                    label: `Step ${index + 1}`,
                  }))}
                  activeId={activeStep?.id ?? ''}
                  onChange={setActiveStepId}
                />
                {activeStep ? (
                  <div className={styles.guidedStep}>
                    <section className={styles.section}>
                      <Text tone="soft">{activeStep.title}</Text>
                      <Heading as="h3" size="sm">
                        {activeStep.prompt}
                      </Heading>
                    </section>
                    <div className={styles.guidedStepOptions}>
                      {activeStep.options.map((option) => (
                        <QuestionOption
                          key={option.id}
                          label={option.id}
                          content={option.content}
                          selected={guidedStepResponses?.[activeStep.id] === option.id}
                          onClick={() => onGuidedStepResponseChange(activeStep.id, option.id)}
                        />
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <section className={styles.section}>
                <Heading as="h3" size="sm">
                  Step-by-step mode is unavailable
                </Heading>
                <Text tone="soft">This question does not have guided problem-structure prompts yet.</Text>
              </section>
            )
          ) : null}

          {activePanel === 'explain' ? (
            <div className={styles.panelGrid}>
              <section className={styles.section}>
                <Text tone="soft">Reasoning</Text>
                <Heading as="h3" size="sm">
                  Why this answer works
                </Heading>
                <Text>
                  <MathText text={explanation} />
                </Text>
              </section>
              <section className={styles.section}>
                <Text tone="soft">Target answer</Text>
                <Heading as="h3" size="sm">
                  Check your result
                </Heading>
                <Text>
                  <MathText text={answerDisplay} />
                </Text>
              </section>
            </div>
          ) : null}

          {activePanel === 'standard' ? (
            <div className={styles.panelGrid}>
              <section className={styles.section}>
                <Text tone="soft">{standard?.id ?? 'Grade 4 benchmark'}</Text>
                <Heading as="h3" size="sm">
                  {standard?.title ?? 'Benchmark lesson'}
                </Heading>
                <Text>{standard?.summary ?? 'Use the lesson panel to connect the question to the benchmark skill.'}</Text>
              </section>
              <section className={styles.section}>
                <Text tone="soft">Lesson focus</Text>
                <Heading as="h3" size="sm">
                  What to practice
                </Heading>
                <Text>{lessons[0]?.summary ?? 'Practice the benchmark until the setup feels automatic.'}</Text>
              </section>
            </div>
          ) : null}

          {activePanel === 'videos' ? (
            <div className={styles.videoPanel}>
              {videos.length ? (
                <>
                  <SegmentedTabs
                    items={videos.map((video, index) => ({
                      id: video.id,
                      label: `Video ${index + 1}`,
                    }))}
                    activeId={activeVideo?.id ?? ''}
                    onChange={setActiveVideoId}
                  />
                  <div className={styles.videoFrame}>
                    {activeVideo ? (
                      <button type="button" className={styles.videoButton} onClick={() => setIsVideoOverlayOpen(true)}>
                        <iframe
                          src={`https://www.youtube.com/embed/${activeVideo.youtubeId}`}
                          title={activeVideo.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      </button>
                    ) : null}
                  </div>
                  <div className={styles.videoCaption}>
                    <Heading as="h3" size="sm">
                      {activeVideo?.title}
                    </Heading>
                    <Text tone="soft">{activeVideo?.lessonTitle}</Text>
                  </div>
                </>
              ) : (
                <section className={styles.section}>
                  <Heading as="h3" size="sm">
                    Video lesson unavailable
                  </Heading>
                  <Text tone="soft">This benchmark does not have an embedded lesson yet.</Text>
                </section>
              )}
            </div>
          ) : null}
        </div>

        {isVideoOverlayOpen && activeVideo ? (
          <div className={styles.videoOverlay}>
            <button type="button" className={styles.videoOverlayBackdrop} onClick={() => setIsVideoOverlayOpen(false)} />
            <div className={styles.videoOverlayCard}>
              <button type="button" className={styles.close} onClick={() => setIsVideoOverlayOpen(false)}>
                Close
              </button>
              <div className={styles.videoOverlayFrame}>
                <iframe
                  src={`https://www.youtube.com/embed/${activeVideo.youtubeId}?autoplay=1`}
                  title={activeVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        ) : null}
      </aside>
    </>
  );
}
