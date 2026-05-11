export const ACCOUNT_TYPES = Object.freeze({
  GUEST_PUBLIC: 'guest_public',
  UNIVERSITY_TEACHER: 'university_teacher',
  HIGHSCHOOL_TEACHER: 'highschool_teacher',
  HIGHSCHOOL_STUDENT: 'highschool_student',
  HIGHSCHOOL_MEDIA_STUDENT: 'highschool_media_student',
  HIGHSCHOOL_PRINCIPAL: 'highschool_principal',
  UNIVERSITY_STUDENT: 'university_student',
});

export const DEFAULT_ACCOUNT_TYPE = ACCOUNT_TYPES.UNIVERSITY_STUDENT;

export const ACCOUNT_TYPE_VALUES = Object.freeze(Object.values(ACCOUNT_TYPES));

export function roleForAccountType(accountType) {
  if (accountType === ACCOUNT_TYPES.UNIVERSITY_TEACHER || accountType === ACCOUNT_TYPES.HIGHSCHOOL_TEACHER) {
    return 'teacher';
  }

  if (accountType === ACCOUNT_TYPES.HIGHSCHOOL_MEDIA_STUDENT) {
    return 'student_media';
  }

  if (accountType === ACCOUNT_TYPES.HIGHSCHOOL_PRINCIPAL) {
    return 'admin';
  }

  return 'student';
}
