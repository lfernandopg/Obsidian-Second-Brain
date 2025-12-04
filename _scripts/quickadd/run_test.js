module.exports = async (params) => {
    const { app, quickAddApi, variables } = params;

    const { FileClassMapper, Utils, Test, Messages} = customJS;

    new Notice("🚀 Starting testing script...");

    Test.test()
};