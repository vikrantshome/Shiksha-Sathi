import { auth } from './auth';
import { classes } from './classes';
import { assignments } from './assignments';
import { questions } from './questions';
import { teachers } from './teachers';
import { derived } from './derived';
import { students } from './students';
import { schools } from './schools';
import { analytics } from './analytics';
import { quizzes } from './quizzes';
import { quizSessions } from './quizSessions';
import { quizAttempts } from './quizAttempts';

export const api = {
  auth,
  classes,
  assignments,
  questions,
  teachers,
  derived,
  students,
  schools,
  analytics,
  quizzes,
  quizSessions,
  quizAttempts,
};

export default api;
