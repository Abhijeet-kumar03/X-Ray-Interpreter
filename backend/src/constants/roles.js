'use strict';

/**
 * Role hierarchy (lowest → highest privilege):
 *   patient < doctor < radiologist < admin
 */
const ROLES = {
  PATIENT:      'patient',
  DOCTOR:       'doctor',
  RADIOLOGIST:  'radiologist',
  ADMIN:        'admin',
};

const ROLE_HIERARCHY = [
  ROLES.PATIENT,
  ROLES.DOCTOR,
  ROLES.RADIOLOGIST,
  ROLES.ADMIN,
];

const ALL_ROLES = Object.values(ROLES);

/**
 * Returns true if `userRole` is at least `requiredRole` in the hierarchy.
 */
function hasMinimumRole(userRole, requiredRole) {
  const userIndex = ROLE_HIERARCHY.indexOf(userRole);
  const requiredIndex = ROLE_HIERARCHY.indexOf(requiredRole);
  if (userIndex === -1 || requiredIndex === -1) return false;
  return userIndex >= requiredIndex;
}

module.exports = { ROLES, ROLE_HIERARCHY, ALL_ROLES, hasMinimumRole };
