// @desc    Get hint for a problem
// @route   POST /api/hints
// @access  Public (should be Private)
exports.getHint = async (req, res) => {
    const { problemSlug, helpLevel } = req.body;

    // TODO: Integrate OpenAI API here

    let hint = "";
    if (helpLevel === "hint") {
        hint = "Try using a HashMap to store visited numbers.";
    } else if (helpLevel === "approach") {
        hint = "1. Iterate through the array. 2. Calculate the complement. 3. Check if complement exists in HashMap.";
    }

    // specific mock for two-sum
    if (problemSlug === 'two-sum') {
        if (helpLevel === 'hint') hint = "Think about using a hash map to store elements you've already seen.";
    }

    res.json({ hint });
};
