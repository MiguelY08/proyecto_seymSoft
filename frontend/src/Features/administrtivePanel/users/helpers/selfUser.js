const normalizeUserId = (value) => {
  const numericValue = Number(value);

  return Number.isInteger(numericValue) && numericValue > 0
    ? numericValue
    : null;
};

export const getUserId = (user) => {
  if (!user) return null;

  return normalizeUserId(user.id ?? user.idUser ?? user.id_user);
};

export const isSelfUser = (targetUser, authUser = null) => {
  if (!targetUser) return false;
  if (targetUser.isSelf === true) return true;

  const targetUserId = getUserId(targetUser);
  const authUserId = getUserId(authUser);

  if (!targetUserId || !authUserId) {
    return false;
  }

  return targetUserId === authUserId;
};
