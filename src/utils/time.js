const formatNepalTime = (date) => {
    if (!date) return null;

    return date.toLocaleString("en-NP", {
        timeZone: "Asia/Kathmandu",
        dateStyle: "medium",
        timeStyle: "short",
    });
};

const getTodayBounds = () => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    return { startOfDay, endOfDay };
};

export { formatNepalTime, getTodayBounds };
