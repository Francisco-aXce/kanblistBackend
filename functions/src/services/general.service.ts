export const userBelogsTo = (userInfo: { uid: string }, members: { id: string }[]): boolean => {
  return members.some((member) => member.id === userInfo.uid);
};
