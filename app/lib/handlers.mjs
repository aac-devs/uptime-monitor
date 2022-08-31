export default {
  ping: async (data) => {
    return { statusCode: 200 };
  },

  notFound: async (data) => {
    return { statusCode: 404 };
  },
};
