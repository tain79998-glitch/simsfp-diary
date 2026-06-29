const PublicStore = {
  getEntries() {
    const entries = typeof UPDATES !== "undefined" ? UPDATES.ENTRIES : [];
    return entries
      .filter((entry) => !entry.draft)
      .sort((a, b) => b.date.localeCompare(a.date));
  },

  getEntry(id) {
    return this.getEntries().find((entry) => entry.id === id) || null;
  },
};
