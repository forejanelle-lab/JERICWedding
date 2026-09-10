export type SiteEditor = {
  email: string;
  firstName: string;
  lastName: string;
};

export function normalizeEditor(input: {
  email?: string;
  firstName?: string;
  lastName?: string;
}): SiteEditor {
  return {
    email: input.email?.trim().toLowerCase() ?? "",
    firstName: input.firstName?.trim() ?? "",
    lastName: input.lastName?.trim() ?? "",
  };
}

export function isListedEditor(
  person: { email?: string; firstName?: string; lastName?: string } | null | undefined,
  editors: SiteEditor[],
) {
  if (!person) return false;
  const email = person.email?.trim().toLowerCase() ?? "";
  const first = person.firstName?.trim().toLowerCase() ?? "";
  const last = person.lastName?.trim().toLowerCase() ?? "";
  return editors.some((editor) => {
    const editorEmail = editor.email.trim().toLowerCase();
    const editorFirst = editor.firstName.trim().toLowerCase();
    const editorLast = editor.lastName.trim().toLowerCase();
    if (email && editorEmail && email === editorEmail) return true;
    return Boolean(first && last && editorFirst === first && editorLast === last);
  });
}
