module.exports = async (params) => {
  //const { app, quickAddApi, variables } = params;
  const { quickAddApi } = params;

  await quickAddApi.executeChoice("Link To Active File", { create : true });

};