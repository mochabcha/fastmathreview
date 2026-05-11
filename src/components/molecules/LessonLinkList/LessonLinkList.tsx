import type { LessonResource } from '@/types/assessment';
import styles from './LessonLinkList.module.css';

export function LessonLinkList({ lessons }: { lessons: LessonResource[] }) {
  if (lessons.length === 0) {
    return null;
  }

  return (
    <div className={styles.list}>
      {lessons.map((lesson) => (
        <a key={lesson.id} className={styles.link} href={lesson.href} target="_blank" rel="noreferrer">
          <span>{lesson.title}</span>
          <small>{lesson.provider}</small>
        </a>
      ))}
    </div>
  );
}
